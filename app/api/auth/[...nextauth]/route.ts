import NextAuth from 'next-auth'
import { authOptions } from '@/server/auth'

// Log NEXTAUTH_URL at module load time for debugging
// This helps identify if environment variables are set correctly
console.log('[AUTH ROUTE] NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'NOT SET')
console.log('[AUTH ROUTE] NODE_ENV:', process.env.NODE_ENV)
console.log('[AUTH ROUTE] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing')

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

