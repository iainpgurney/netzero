import NextAuth from 'next-auth'
import { authOptions } from '@/server/auth'

// Log NEXTAUTH_URL at module load time for debugging
console.log('[AUTH] NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('[AUTH] NODE_ENV:', process.env.NODE_ENV)

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

