/**
 * Script to set up Neon database schema and seed data
 * Run with: DATABASE_URL="your-neon-url" tsx scripts/setup-neon-database.ts
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up Neon database...\n')

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!')
    console.error('   Set it with: DATABASE_URL="your-neon-url" tsx scripts/setup-neon-database.ts')
    process.exit(1)
  }

  if (process.env.DATABASE_URL.includes('file:')) {
    console.error('❌ DATABASE_URL points to SQLite file. Use your Neon PostgreSQL connection string.')
    process.exit(1)
  }

  try {
    // Test connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Connected to database successfully!\n')

    // Push schema (creates all tables)
    console.log('📦 Creating database schema (tables)...')
    try {
      execSync('npx prisma db push --skip-generate', { stdio: 'inherit', env: process.env })
      console.log('✅ Schema created successfully!\n')
    } catch (error) {
      console.error('❌ Error creating schema:', error)
      throw error
    }

    // Check if tables exist
    console.log('🔍 Verifying tables were created...')
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `

    console.log(`✅ Found ${tables.length} tables:`)
    tables.forEach((table) => {
      console.log(`   - ${table.tablename}`)
    })

    // Check if data exists
    const userCount = await prisma.user.count()
    const moduleCount = await prisma.module.count()

    console.log(`\n📊 Current data:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Modules: ${moduleCount}`)

    if (userCount === 0 || moduleCount === 0) {
      console.log('\n🌱 Seeding database with initial data...')
      try {
        execSync('tsx prisma/seed.ts', { stdio: 'inherit', env: process.env })
        console.log('✅ Database seeded successfully!\n')
      } catch (error) {
        console.error('❌ Error seeding database:', error)
        throw error
      }

      // Verify seed
      const finalUserCount = await prisma.user.count()
      const finalModuleCount = await prisma.module.count()
      console.log(`\n✅ Final database state:`)
      console.log(`   Users: ${finalUserCount}`)
      console.log(`   Modules: ${finalModuleCount}`)
    } else {
      console.log('\n✅ Database already has data. Skipping seed.')
    }

    console.log('\n🎉 Database setup complete!')
    console.log('   Your Neon database is ready to use.')
  } catch (error) {
    console.error('\n❌ Error:', error)
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

