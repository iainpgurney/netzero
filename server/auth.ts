import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

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
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
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
      // For Google OAuth, check domain allowlist
      if (account?.provider === 'google' && profile?.email) {
        const emailDomain = profile.email.split('@')[1]?.toLowerCase()
        const allowedDomains = getAllowedDomains()

        // Check if domain is allowed
        const isDomainAllowed = allowedDomains.some((domain) => emailDomain === domain)

        if (!isDomainAllowed) {
          console.log(`[AUTH] Google login rejected - domain not allowed: ${emailDomain}`)
          console.log(`[AUTH] Allowed domains: ${allowedDomains.join(', ')}`)
          return false
        }

        // Check database for domain allowlist (if configured)
        try {
          const allowedDomain = await prisma.allowedDomain.findFirst({
            where: {
              domain: emailDomain,
              isActive: true,
            },
          })

          if (!allowedDomain) {
            console.log(`[AUTH] Domain not found in database allowlist: ${emailDomain}`)
            // Still allow if in env var list
            if (!isDomainAllowed) {
              return false
            }
          }
        } catch (error) {
          console.error('[AUTH] Error checking domain allowlist:', error)
          // Fallback to env var check
          if (!isDomainAllowed) {
            return false
          }
        }

        console.log(`[AUTH] Google login allowed for domain: ${emailDomain}`)
      }

      return true
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
      }

      // Handle Google OAuth account linking
      if (account?.provider === 'google' && user?.email) {
        try {
          // Find or create user
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          if (!dbUser) {
            // Create new user from Google account
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || profile?.name || null,
                image: user.image || profile?.picture || null,
                emailVerified: new Date(),
              },
            })
            console.log(`[AUTH] Created new user from Google: ${user.email}`)
          } else {
            // Update user info from Google
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                name: user.name || profile?.name || dbUser.name,
                image: user.image || profile?.picture || dbUser.image,
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
        } catch (error) {
          console.error('[AUTH] Error handling Google OAuth:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/error',
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production-min-32-chars',
  debug: process.env.NODE_ENV === 'development',
}

