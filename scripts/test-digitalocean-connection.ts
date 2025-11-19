/**
 * Test connection to DigitalOcean PostgreSQL database
 * Run with: DATABASE_URL="your-do-url" tsx scripts/test-digitalocean-connection.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing DigitalOcean PostgreSQL connection...\n')

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!')
    console.error('\nSet it with:')
    console.error('  DATABASE_URL="postgresql://username:password@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require" tsx scripts/test-digitalocean-connection.ts')
    process.exit(1)
  }

  // Mask password in URL for display
  const displayUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@')
  console.log(`📡 Connection string: ${displayUrl}\n`)

  try {
    console.log('⏳ Attempting to connect...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Connected successfully!\n')

    // Test query
    console.log('⏳ Testing query...')
    const result = await prisma.$queryRaw`SELECT version() as version`
    console.log('✅ Query successful!\n')

    // Get database info
    const dbInfo = await prisma.$queryRaw<Array<{ current_database: string }>>`
      SELECT current_database()
    `
    console.log(`📊 Database: ${dbInfo[0]?.current_database || 'unknown'}`)

    // Check if tables exist
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `
    
    console.log(`📋 Tables: ${tables.length}`)
    if (tables.length > 0) {
      tables.forEach((table) => {
        console.log(`   - ${table.tablename}`)
      })
    } else {
      console.log('   (No tables yet - run setup script to create them)')
    }

    console.log('\n🎉 Connection test passed!')
    console.log('   Your DigitalOcean database is accessible and ready.')
  } catch (error) {
    console.error('\n❌ Connection failed!')
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}\n`)
      
      if (error.message.includes('P1001')) {
        console.error('💡 Connection refused. Check:')
        console.error('   1. DATABASE_URL is correct')
        console.error('   2. Database is accessible from your IP (check DigitalOcean firewall)')
        console.error('   3. Username and password are correct')
        console.error('   4. Port 25060 is open')
      } else if (error.message.includes('P1000')) {
        console.error('💡 Authentication failed. Check:')
        console.error('   1. Username is correct')
        console.error('   2. Password is correct')
        console.error('   3. User has proper permissions')
      } else if (error.message.includes('does not exist')) {
        console.error('💡 Database not found. Check:')
        console.error('   1. Database name is correct (should be "netzero")')
        console.error('   2. Database exists in DigitalOcean')
      } else if (error.message.includes('SSL')) {
        console.error('💡 SSL error. Check:')
        console.error('   1. Connection string includes ?sslmode=require')
        console.error('   2. SSL is enabled on DigitalOcean database')
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

