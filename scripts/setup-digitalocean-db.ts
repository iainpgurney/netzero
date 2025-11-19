/**
 * Script to set up DigitalOcean PostgreSQL database
 * Run with: DATABASE_URL="your-do-url" tsx scripts/setup-digitalocean-db.ts
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Setting up DigitalOcean PostgreSQL database...\n')

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!')
    console.error('\nSet it with:')
    console.error('  DATABASE_URL="postgresql://username:password@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require" tsx scripts/setup-digitalocean-db.ts')
    process.exit(1)
  }

  try {
    // Test connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Connected to DigitalOcean database successfully!\n')

    // Check if tables exist
    console.log('🔍 Checking existing tables...')
    try {
      const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
      `
      
      if (tables.length > 0) {
        console.log(`⚠️  Found ${tables.length} existing tables:`)
        tables.forEach((table) => {
          console.log(`   - ${table.tablename}`)
        })
        console.log('\n⚠️  Tables already exist. Do you want to recreate them?')
        console.log('   This will DELETE all existing data!')
        console.log('   If yes, delete tables manually or use: npx prisma migrate reset')
        return
      }
    } catch (error) {
      // Tables don't exist yet, which is fine
      console.log('✅ No existing tables found (this is expected for a new database)\n')
    }

    // Push schema (creates all tables)
    console.log('📦 Creating database schema (tables)...')
    try {
      execSync('npx prisma db push --skip-generate', { 
        stdio: 'inherit', 
        env: { ...process.env }
      })
      console.log('✅ Schema created successfully!\n')
    } catch (error) {
      console.error('❌ Error creating schema:', error)
      throw error
    }

    // Verify tables were created
    console.log('🔍 Verifying tables were created...')
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `

    console.log(`✅ Found ${tables.length} tables:`)
    tables.forEach((table) => {
      console.log(`   - ${table.tablename}`)
    })

    // Check if data exists
    const userCount = await prisma.user.count().catch(() => 0)
    const moduleCount = await prisma.module.count().catch(() => 0)

    console.log(`\n📊 Current data:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Modules: ${moduleCount}`)

    if (userCount === 0 || moduleCount === 0) {
      console.log('\n🌱 Seeding database with initial data...')
      try {
        execSync('tsx prisma/seed.ts', { 
          stdio: 'inherit', 
          env: { ...process.env }
        })
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

    console.log('\n🎉 DigitalOcean database setup complete!')
    console.log('   Your database is ready to use.')
  } catch (error) {
    console.error('\n❌ Error:', error)
    if (error instanceof Error) {
      console.error('   Message:', error.message)
      if (error.message.includes('P1001')) {
        console.error('\n💡 Connection failed. Check:')
        console.error('   1. DATABASE_URL is correct')
        console.error('   2. Database is accessible from your IP')
        console.error('   3. Username and password are correct')
        console.error('   4. SSL mode is set to require')
      }
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

