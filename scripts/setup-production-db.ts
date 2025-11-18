/**
 * Script to help set up production database
 * Run with: DATABASE_URL="your-postgres-url" tsx scripts/setup-production-db.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Setting up production database...')

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!')
    console.error('   Set it with: DATABASE_URL="your-postgres-url" tsx scripts/setup-production-db.ts')
    process.exit(1)
  }

  if (process.env.DATABASE_URL.includes('file:')) {
    console.error('❌ DATABASE_URL points to SQLite file. Use a PostgreSQL database URL for production.')
    process.exit(1)
  }

  try {
    // Test connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Connected to database successfully!')

    // Check if tables exist
    console.log('🔍 Checking database schema...')
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `

    if (tables.length === 0) {
      console.log('⚠️  No tables found. You need to run migrations first:')
      console.log('   npx prisma migrate deploy')
      console.log('   or')
      console.log('   npx prisma db push')
    } else {
      console.log(`✅ Found ${tables.length} tables in database`)
    }

    // Check if seed data exists
    const userCount = await prisma.user.count()
    const moduleCount = await prisma.module.count()

    console.log(`\n📊 Current database state:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Modules: ${moduleCount}`)

    if (userCount === 0 || moduleCount === 0) {
      console.log('\n⚠️  Database appears empty. Run seed script:')
      console.log('   npm run db:seed')
    } else {
      console.log('\n✅ Database appears to be set up correctly!')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error) {
      console.error('   Message:', error.message)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e)
    process.exit(1)
  })

