import NextAuth from 'next-auth'
import { authOptions } from '@/server/auth'

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

