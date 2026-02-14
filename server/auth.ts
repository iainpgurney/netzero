import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './db'
import type { SystemRole, ModuleAccess } from '@/lib/rbac'
import { syncUserDepartmentFromGoogle, isGoogleAdminConfigured } from './google-admin'
import { auditAuth, auditSystemError, AuditActions } from './audit'

// Helper to load user's RBAC data (role, department, module access)
async function loadUserRBACData(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
            slug: true,
            moduleAccess: {
              where: { platformModule: { isActive: true } },
              select: {
                canView: true,
                canEdit: true,
                canManage: true,
                platformModule: {
                  select: {
                    id: true,
                    slug: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) return null

    // SUPER_ADMIN and ADMIN get access to all modules
    let modules: ModuleAccess[] = []
    
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      // Load all active modules for admins
      const allModules = await prisma.platformModule.findMany({
        where: { isActive: true },
        select: { id: true, slug: true, name: true },
      })
      modules = allModules.map(m => ({
        moduleId: m.id,
        moduleSlug: m.slug,
        moduleName: m.name,
        canView: true,
        canEdit: true,
        canManage: user.role === 'SUPER_ADMIN',
      }))
    } else if (user.department?.moduleAccess) {
      modules = user.department.moduleAccess.map(access => ({
        moduleId: access.platformModule.id,
        moduleSlug: access.platformModule.slug,
        moduleName: access.platformModule.name,
        canView: access.canView,
        canEdit: access.canEdit,
        canManage: access.canManage,
      }))
    }

    return {
      role: user.role as SystemRole,
      departmentId: user.departmentId,
      departmentName: user.department?.name || null,
      departmentSlug: user.department?.slug || null,
      modules,
    }
  } catch (error) {
    console.error('[AUTH] Error loading RBAC data:', error)
    return null
  }
}

// ALWAYS trim environment variables to remove whitespace
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
// Get environment variables
let nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim()
const nextAuthUrl = process.env.NEXTAUTH_URL?.trim()

// During build, use a placeholder to prevent build failures
// This will be caught at runtime if NEXTAUTH_SECRET is not set
if (!nextAuthSecret && process.env.NEXT_PHASE === 'phase-production-build') {
  nextAuthSecret = 'BUILD_TIME_PLACEHOLDER_SECRET'
  console.warn('[AUTH CONFIG] ⚠️ Build-time: NEXTAUTH_SECRET not set, using placeholder. Must be set at runtime!')
} else if (!nextAuthSecret) {
  console.error('❌ NEXTAUTH_SECRET is required. Please set it in .env.local or production environment')
  throw new Error('NEXTAUTH_SECRET is required. Please set it in .env.local or production environment')
}

// Validate and log (without exposing secrets)
if (!googleClientId || !googleClientSecret) {
  console.warn('⚠️  Google OAuth credentials not set. Sign in will not work.')
} else {
  console.log('✅ Google OAuth credentials loaded:', {
    clientId: googleClientId.substring(0, 20) + '...',
    clientIdLength: googleClientId.length,
    clientSecretLength: googleClientSecret.length,
    hasWhitespace: googleClientId.includes(' ') || googleClientSecret.includes(' '),
    hasQuotes: googleClientId.startsWith('"') || googleClientSecret.startsWith('"'),
  })

  // Warn if secret seems too short
  if (googleClientSecret.length < 30) {
    console.warn('⚠️  WARNING: Client secret seems unusually short. Google OAuth secrets are typically 40+ characters.')
  }
}

// Warn if NEXTAUTH_URL is not set in production
if (process.env.NODE_ENV === 'production' && !nextAuthUrl) {
  console.error('[AUTH CONFIG] ⚠️ WARNING: NEXTAUTH_URL is not set in production!')
  console.error('[AUTH CONFIG] This will cause OAuth callbacks to fail.')
  console.error('[AUTH CONFIG] Set NEXTAUTH_URL=https://netzero-gecrc.ondigitalocean.app in DigitalOcean')
}

// Log NEXTAUTH_URL when module loads for debugging
console.log('[AUTH CONFIG] NEXTAUTH_URL:', nextAuthUrl || 'NOT SET')
console.log('[AUTH CONFIG] NODE_ENV:', process.env.NODE_ENV)
console.log('[AUTH CONFIG] GOOGLE_CLIENT_ID:', googleClientId ? 'Set' : 'Missing')

// Get allowed domains from environment variable (comma-separated)
// Or fetch from database if needed
function getAllowedDomains(): string[] {
  const envDomains = process.env.ALLOWED_GOOGLE_DOMAINS
  if (envDomains) {
    return envDomains.split(',').map((d) => d.trim().toLowerCase())
  }
  // Default allowed domains
  return ['carma.earth']
}

export const authOptions: NextAuthOptions = {
  // Use JWT strategy - NO adapter needed (adapter is only for database sessions)
  adapter: undefined,
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            authorization: {
              params: {
                prompt: 'consent',
                access_type: 'offline',
                response_type: 'code',
              },
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // For Google OAuth, check domain allowlist
        if (account?.provider === 'google' && profile?.email) {
          const normalizedEmail = profile.email.toLowerCase().trim()
          const emailDomain = normalizedEmail.split('@')[1]?.toLowerCase()

          if (!emailDomain) {
            console.error('⚠️  Sign-in attempt without valid email domain')
            return false
          }

          const allowedDomains = getAllowedDomains()

          // Check if domain is allowed
          const isDomainAllowed = allowedDomains.some((domain) => emailDomain === domain)

          if (!isDomainAllowed) {
            auditAuth(AuditActions.USER_DOMAIN_BLOCKED, {
              userEmail: normalizedEmail,
              severity: 'WARN',
              detail: `Login blocked — domain ${emailDomain} not in allowlist`,
              metadata: { domain: emailDomain },
            })
            return false
          }

          // Check database for domain allowlist (if configured)
          // If database is unavailable, fall back to env var check
          try {
            const allowedDomain = await Promise.race([
              prisma.allowedDomain.findFirst({
                where: {
                  domain: emailDomain,
                  isActive: true,
                },
              }),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database timeout')), 3000)
              ),
            ]) as any

            if (!allowedDomain) {
              // Still allow if in env var list
              if (!isDomainAllowed) {
                return false
              }
            }
          } catch (error) {
            console.error('[AUTH] Error checking domain allowlist (falling back to env check):', error)
            // Fallback to env var check - don't block auth if database is unavailable
            if (!isDomainAllowed) {
              return false
            }
          }

        }

        return true
      } catch (error) {
        console.error('❌ Error in signIn callback:', error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        const safeBaseUrl = nextAuthUrl || baseUrl

        // Handle absolute URLs (same origin)
        if (url.startsWith('http')) {
          try {
            const urlObj = new URL(url)
            const baseUrlObj = new URL(safeBaseUrl)
            if (urlObj.origin === baseUrlObj.origin) {
              return url
            }
          } catch {
            // Invalid URL — fall through to default
          }
        }

        // Handle relative URLs
        if (url.startsWith('/')) {
          return `${safeBaseUrl}${url}`
        }

        // Default fallback
        return `${safeBaseUrl}/intranet`
      } catch {
        const safeBaseUrl = nextAuthUrl || baseUrl
        return `${safeBaseUrl}/intranet`
      }
    },
    async jwt({ token, user, account, profile }) {
      try {
        if (user) {
          token.id = user.id
          token.sub = user.id || user.email || 'unknown'
          token.email = user.email
          token.name = user.name
          
          // Load RBAC data on initial sign-in
          if (user.id) {
            const rbacData = await loadUserRBACData(user.id)
            if (rbacData) {
              token.role = rbacData.role
              token.departmentId = rbacData.departmentId
              token.departmentName = rbacData.departmentName
              token.departmentSlug = rbacData.departmentSlug
              token.modules = rbacData.modules
            } else {
              // Default values for new users without RBAC setup
              token.role = 'MEMBER'
              token.departmentId = null
              token.departmentName = null
              token.departmentSlug = null
              token.modules = []
            }
          }
        }

        // Handle Google OAuth account linking
        if (account?.provider === 'google' && user?.email) {
          try {
            // Ensure email is not null
            const userEmail = user.email
            if (!userEmail) {
              console.error('[AUTH] User email is null, skipping database operations')
              token.sub = 'unknown'
              token.id = 'unknown'
              return token
            }

            // Add timeout to prevent hanging if database is unavailable
            const dbOperation = async () => {
              // Find or create user
              let dbUser = await prisma.user.findUnique({
                where: { email: userEmail },
              })

              if (!dbUser) {
                // Create new user from Google account
                const profilePicture = (profile as any)?.picture
                dbUser = await prisma.user.create({
                  data: {
                    email: userEmail,
                    name: user.name || profile?.name || null,
                    image: user.image || profilePicture || null,
                    emailVerified: new Date(),
                  },
                })
                // New user created from Google OAuth
              } else {
                // Update user info from Google
                const profilePicture = (profile as any)?.picture
                await prisma.user.update({
                  where: { id: dbUser.id },
                  data: {
                    name: user.name || profile?.name || dbUser.name,
                    image: user.image || profilePicture || dbUser.image,
                    emailVerified: dbUser.emailVerified || new Date(),
                  },
                })
              }

              // Link Google account
              if (account.providerAccountId) {
                await prisma.account.upsert({
                  where: {
                    provider_providerAccountId: {
                      provider: 'google',
                      providerAccountId: account.providerAccountId,
                    },
                  },
                  update: {
                    access_token: account.access_token || null,
                    refresh_token: account.refresh_token || null,
                    expires_at: account.expires_at || null,
                    token_type: account.token_type || null,
                    scope: account.scope || null,
                    id_token: account.id_token || null,
                  },
                  create: {
                    userId: dbUser.id,
                    type: account.type,
                    provider: 'google',
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token || null,
                    refresh_token: account.refresh_token || null,
                    expires_at: account.expires_at || null,
                    token_type: account.token_type || null,
                    scope: account.scope || null,
                    id_token: account.id_token || null,
                  },
                })
              }

              token.id = dbUser.id
              token.sub = dbUser.id

              // Sync department from Google Admin OU (if configured)
              if (isGoogleAdminConfigured() && userEmail) {
                try {
                  const syncResult = await syncUserDepartmentFromGoogle(dbUser.id, userEmail)
                } catch (ouError) {
                  console.warn('[AUTH] Google OU sync failed (non-blocking):', ouError)
                }
              }

              // Reload RBAC data after potential department sync
              const rbacData = await loadUserRBACData(dbUser.id)
              if (rbacData) {
                token.role = rbacData.role
                token.departmentId = rbacData.departmentId
                token.departmentName = rbacData.departmentName
                token.departmentSlug = rbacData.departmentSlug
                token.modules = rbacData.modules
              }

              // Audit: successful login
              auditAuth(AuditActions.USER_LOGIN, {
                userId: dbUser.id,
                userEmail: userEmail,
                detail: `User signed in via Google (${token.departmentName ?? 'no dept'}, ${token.role ?? 'MEMBER'})`,
                metadata: { role: token.role, department: token.departmentName },
              })
            }

            // Add timeout to prevent hanging
            await Promise.race([
              dbOperation(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database operation timeout')), 8000)
              ),
            ])
          } catch (error) {
            console.error('[AUTH] Error handling Google OAuth (continuing without DB):', error)
            auditSystemError(error, {
              action: AuditActions.USER_LOGIN_FAILED,
              detail: `Google OAuth DB operation failed for ${user.email}`,
              metadata: { email: user.email },
            })
            // Don't fail the auth if database is unavailable - use email as ID
            token.sub = user.email || 'unknown'
            token.id = user.email || 'unknown'
          }
        }

        return token
      } catch (error) {
        console.error('❌ Error in jwt callback:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        if (session.user && token) {
          session.user.id = (token.sub || token.id || token.email || 'unknown') as string
          session.user.role = (token.role as SystemRole) || 'MEMBER'
          session.user.departmentId = (token.departmentId as string) || null
          session.user.departmentName = (token.departmentName as string) || null
          session.user.departmentSlug = (token.departmentSlug as string) || null
          session.user.modules = (token.modules as ModuleAccess[]) || []
        }
        return session
      } catch (error) {
        console.error('❌ Error in session callback:', error)
        return session
      }
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  secret: nextAuthSecret,
  debug: false, // Disabled — was flooding logs on every request
}

