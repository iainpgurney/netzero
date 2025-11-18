import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
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

          // Simple demo account authentication
          // For demo account, allow login with demo password
          if (user.email === 'demo@netzero.com' && credentials.password === 'demo123') {
            console.log('[AUTH] Demo user authenticated successfully')
            return {
              id: user.id,
              email: user.email,
              name: user.name || 'Demo User',
              image: user.image,
            }
          }

          console.log(`[AUTH] Invalid password for user: ${credentials.email}`)
          console.log(`[AUTH] Expected password: demo123`)
          console.log(`[AUTH] Received password: ${credentials.password ? '***' : 'empty'}`)
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
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

