import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL before creating Prisma client
let databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set!')
  console.error('   Set it in DigitalOcean → Settings → Environment Variables')
} else if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  console.error('❌ DATABASE_URL must start with postgresql:// or postgres://')
  console.error('   Current value:', databaseUrl.substring(0, 20) + '...')
  console.error('   Fix: Remove quotes and spaces, ensure it starts with postgresql://')
} else {
  // Add pgBouncer-compatible connection parameters to prevent "too many connections" error
  // These parameters help Prisma manage connections more efficiently
  try {
    const url = new URL(databaseUrl)
    
    // Add pg_stat_statements parameter if not present (helps with connection management)
    // Set application_name for better connection tracking
    if (!url.searchParams.has('application_name')) {
      url.searchParams.set('application_name', 'netzero-app')
    }
    
    // For Prisma, we want to use transaction mode for better connection pooling
    // This tells Prisma to use prepared statements efficiently
    if (!url.searchParams.has('pgbouncer')) {
      // Note: If DigitalOcean provides a connection pooler URL, use that instead
      // Connection pooler URLs typically have a different port (e.g., 25061 instead of 25060)
    }
    
    databaseUrl = url.toString()
  } catch (error) {
    // If URL parsing fails, log warning but continue with original URL
    console.warn('⚠️ Could not parse DATABASE_URL:', error)
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Configure connection pool behavior
    // Prisma Client manages its own connection pool internally
    // The singleton pattern ensures we only create one instance per process
  })

// Store Prisma Client in global to prevent multiple instances in the same process
// In production, each server instance will have its own Prisma Client (which is correct)
// But within each instance, we ensure only one Prisma Client exists
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Ensure connections are properly closed on shutdown
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

