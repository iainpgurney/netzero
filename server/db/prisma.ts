import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL before creating Prisma client
const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set!')
  console.error('   Set it in DigitalOcean → Settings → Environment Variables')
} else if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  console.error('❌ DATABASE_URL must start with postgresql:// or postgres://')
  console.error('   Current value:', databaseUrl.substring(0, 20) + '...')
  console.error('   Fix: Remove quotes and spaces, ensure it starts with postgresql://')
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

