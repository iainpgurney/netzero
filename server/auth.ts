import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

// ALWAYS trim environment variables to remove whitespace
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim()
const nextAuthUrl = process.env.NEXTAUTH_URL?.trim()

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

if (!nextAuthSecret) {
  console.error('❌ NEXTAUTH_SECRET is required. Please set it in .env.local or production environment')
  // Don't throw during build - this will be caught at runtime
  // Only throw if we're actually trying to use auth (not during build)
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error('NEXTAUTH_SECRET is required. Please set it in .env.local or production environment')
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
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[AUTH] Missing credentials')
            return null
          }

          console.log(`[AUTH] Attempting login for: ${credentials.email}`)

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            console.log(`[AUTH] User not found: ${credentials.email}`)
            console.log('[AUTH] Run: npm run create-demo-user to create the demo user')
            return null
          }

          console.log(`[AUTH] User found: ${user.email}, checking password...`)

          // Check if user has a password (registered user) or is demo account
          if (user.password) {
            // Registered user - verify password hash
            const isValidPassword = await bcrypt.compare(credentials.password, user.password)
            if (isValidPassword) {
              console.log('[AUTH] User authenticated successfully')
              return {
                id: user.id,
                email: user.email,
                name: user.name || 'User',
                image: user.image,
              }
            }
          } else {
            // Demo account - allow login with demo password
            if (user.email === 'demo@netzero.com' && credentials.password === 'demo123') {
              console.log('[AUTH] Demo user authenticated successfully')
              return {
                id: user.id,
                email: user.email,
                name: user.name || 'Demo User',
                image: user.image,
              }
            }
          }

          console.log(`[AUTH] Invalid password for user: ${credentials.email}`)
          return null
        } catch (error) {
          console.error('[AUTH] Unexpected error:', error)
          if (error instanceof Error) {
            console.error('[AUTH] Error message:', error.message)
            console.error('[AUTH] Error stack:', error.stack)
          }
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('🔐 signIn callback called', {
          hasEmail: !!user.email,
          email: user.email,
          accountProvider: account?.provider,
        })

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
            console.log(`[AUTH] Google login rejected - domain not allowed: ${emailDomain}`)
            console.log(`[AUTH] Allowed domains: ${allowedDomains.join(', ')}`)
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
              console.log(`[AUTH] Domain not found in database allowlist: ${emailDomain}`)
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

          console.log(`✅ Access granted for email: ${normalizedEmail}`)
          console.log(`[AUTH] Google login allowed for domain: ${emailDomain}`)
        }

        // For credentials provider, always allow (already validated in authorize)
        return true
      } catch (error) {
        console.error('❌ Error in signIn callback:', error)
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        console.log('🔄 redirect callback called', {
          url,
          baseUrl,
          NEXTAUTH_URL: nextAuthUrl,
        })

        // Use NEXTAUTH_URL if set, otherwise use baseUrl
        const safeBaseUrl = nextAuthUrl || baseUrl

        // Handle absolute URLs (same origin)
        if (url.startsWith('http')) {
          try {
            const urlObj = new URL(url)
            const baseUrlObj = new URL(safeBaseUrl)

            // Allow same origin URLs
            if (urlObj.origin === baseUrlObj.origin) {
              console.log('🔄 Allowing same-origin redirect:', url)
              return url
            }
          } catch (e) {
            console.warn('⚠️ Invalid absolute URL:', url)
          }
        }

        // Handle relative URLs
        if (url.startsWith('/')) {
          const redirectUrl = `${safeBaseUrl}${url}`
          console.log('🔄 Redirecting to relative path:', redirectUrl)
          return redirectUrl
        }

        // Default fallback to dashboard
        console.log('🔄 Default redirect to dashboard')
        return `${safeBaseUrl}/dashboard`
      } catch (error) {
        console.error('❌ Error in redirect callback:', error)
        const safeBaseUrl = nextAuthUrl || baseUrl
        return `${safeBaseUrl}/dashboard`
      }
    },
    async jwt({ token, user, account, profile }) {
      try {
        if (user) {
          token.id = user.id
          token.sub = user.id || user.email || 'unknown'
          token.email = user.email
          token.name = user.name
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
                console.log(`[AUTH] Created new user from Google: ${userEmail}`)
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
              console.log('🔑 JWT token created for user:', {
                id: token.sub,
                email: token.email,
              })
            }

            // Add timeout to prevent hanging
            await Promise.race([
              dbOperation(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Database operation timeout')), 5000)
              ),
            ])
          } catch (error) {
            console.error('[AUTH] Error handling Google OAuth (continuing without DB):', error)
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
  debug: process.env.NODE_ENV === 'development',
}

