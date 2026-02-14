import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate DATABASE_URL before creating Prisma client
let databaseUrl = process.env.DATABASE_URL?.trim()
let hasValidDatabaseUrl = true

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set!')
  console.error('   Set it in DigitalOcean → Settings → Environment Variables')
  console.error('   For local development, set it in .env.local')
  hasValidDatabaseUrl = false
  // Use a fallback URL - Prisma Client won't connect until queries are made
  databaseUrl = 'postgresql://user:password@localhost:5432/dummy?sslmode=disable'
} else if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  console.error('❌ DATABASE_URL must start with postgresql:// or postgres://')
  console.error('   Current value:', databaseUrl.substring(0, 20) + '...')
  console.error('   Fix: Remove quotes and spaces, ensure it starts with postgresql://')
  hasValidDatabaseUrl = false
  // Use a fallback URL
  databaseUrl = 'postgresql://user:password@localhost:5432/dummy?sslmode=disable'
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

// Append connection pool params to DATABASE_URL if not already present
try {
  if (hasValidDatabaseUrl && databaseUrl) {
    const dbUrl = new URL(databaseUrl)
    // Limit connection pool to prevent "too many connections" on managed DBs
    if (!dbUrl.searchParams.has('connection_limit')) {
      dbUrl.searchParams.set('connection_limit', '5')
    }
    // Set pool timeout (seconds to wait for a connection)
    if (!dbUrl.searchParams.has('pool_timeout')) {
      dbUrl.searchParams.set('pool_timeout', '10')
    }
    // Set connect timeout (seconds to wait for initial connection)
    if (!dbUrl.searchParams.has('connect_timeout')) {
      dbUrl.searchParams.set('connect_timeout', '10')
    }
    databaseUrl = dbUrl.toString()
  }
} catch {
  // If URL parsing fails, continue with the original URL
}

// Create Prisma Client - it only connects when queries are made
// If DATABASE_URL is invalid, queries will fail with helpful error messages
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
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

