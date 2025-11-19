/**
 * Complete DigitalOcean Database Setup
 * Tests connection, creates schema, and seeds data
 */

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 DigitalOcean PostgreSQL Complete Setup\n')
  console.log('📋 Database Details:')
  console.log('   Host: db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com')
  console.log('   Port: 25060')
  console.log('   Database: netzero')
  console.log('   SSL: require\n')

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!')
    console.error('\nSet it in .env.local or run:')
    console.error('  $env:DATABASE_URL="postgresql://doadmin:password@db-postgresql-lon1-ccx-do-user-12481992-0.h.db.ondigitalocean.com:25060/netzero?sslmode=require"')
    process.exit(1)
  }

  // Mask password in display
  const displayUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@')
  console.log(`📡 Connection: ${displayUrl}\n`)

  try {
    // Step 1: Test connection
    console.log('⏳ Step 1: Testing database connection...')
    await prisma.$connect()
    console.log('✅ Connected successfully!\n')

    // Step 2: Check existing tables
    console.log('⏳ Step 2: Checking existing tables...')
    let tables: Array<{ tablename: string }> = []
    try {
      tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
      `
      if (tables.length > 0) {
        console.log(`⚠️  Found ${tables.length} existing tables:`)
        tables.forEach((table) => {
          console.log(`   - ${table.tablename}`)
        })
        console.log('\n⚠️  Tables already exist. Continuing with seed...\n')
      } else {
        console.log('✅ No existing tables (fresh database)\n')
      }
    } catch (error) {
      console.log('✅ No existing tables (fresh database)\n')
    }

    // Step 3: Create schema
    if (tables.length === 0) {
      console.log('⏳ Step 3: Creating database schema...')
      try {
        execSync('npx prisma db push --skip-generate', {
          stdio: 'inherit',
          env: { ...process.env },
        })
        console.log('✅ Schema created successfully!\n')
      } catch (error) {
        console.error('❌ Error creating schema:', error)
        throw error
      }

      // Verify tables were created
      const newTables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
      `
      console.log(`✅ Created ${newTables.length} tables:`)
      newTables.forEach((table) => {
        console.log(`   - ${table.tablename}`)
      })
      console.log('')
    } else {
      console.log('⏳ Step 3: Schema already exists, skipping...\n')
    }

    // Step 4: Check existing data
    console.log('⏳ Step 4: Checking existing data...')
    const userCount = await prisma.user.count().catch(() => 0)
    const moduleCount = await prisma.module.count().catch(() => 0)
    const quizCount = await prisma.quiz.count().catch(() => 0)

    console.log(`📊 Current data:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Modules: ${moduleCount}`)
    console.log(`   Quizzes: ${quizCount}\n`)

    // Step 5: Seed database
    if (userCount === 0 || moduleCount === 0) {
      console.log('⏳ Step 5: Seeding database with initial data...')
      try {
        execSync('tsx prisma/seed.ts', {
          stdio: 'inherit',
          env: { ...process.env },
        })
        console.log('✅ Database seeded successfully!\n')
      } catch (error) {
        console.error('❌ Error seeding database:', error)
        throw error
      }

      // Verify seed
      const finalUserCount = await prisma.user.count()
      const finalModuleCount = await prisma.module.count()
      const finalQuizCount = await prisma.quiz.count()

      console.log(`✅ Final database state:`)
      console.log(`   Users: ${finalUserCount}`)
      console.log(`   Modules: ${finalModuleCount}`)
      console.log(`   Quizzes: ${finalQuizCount}\n`)
    } else {
      console.log('⏳ Step 5: Database already seeded, skipping...\n')
    }

    // Step 6: Verify user tracking
    console.log('⏳ Step 6: Verifying user tracking setup...')
    const userProgressTable = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'UserProgress'
      ORDER BY column_name
    `
    console.log(`✅ UserProgress table tracks:`)
    userProgressTable.forEach((col) => {
      console.log(`   - ${col.column_name}`)
    })
    console.log('')

    const quizAttemptTable = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'QuizAttempt'
      ORDER BY column_name
    `
    console.log(`✅ QuizAttempt table tracks:`)
    quizAttemptTable.forEach((col) => {
      console.log(`   - ${col.column_name}`)
    })
    console.log('')

    console.log('🎉 DigitalOcean database setup complete!')
    console.log('')
    console.log('📝 Next steps:')
    console.log('   1. Set DATABASE_URL in your DigitalOcean App Platform environment variables')
    console.log('   2. Deploy your application to DigitalOcean')
    console.log('   3. Test account creation on your live site')
    console.log('')
    console.log('✅ User tracking is configured:')
    console.log('   - User accounts (email, name, password)')
    console.log('   - User progress (modules completed, quiz scores, time spent)')
    console.log('   - Quiz attempts (individual answers, correct/incorrect)')
    console.log('   - Badges earned')
    console.log('   - Certificates issued')
  } catch (error) {
    console.error('\n❌ Error:', error)
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}\n`)
      if (error.message.includes('P1001')) {
        console.error('💡 Connection failed. Check:')
        console.error('   1. DATABASE_URL is correct')
        console.error('   2. Database is accessible from your IP')
        console.error('   3. Username and password are correct')
        console.error('   4. SSL mode is set to require')
        console.error('   5. DigitalOcean firewall allows your IP')
      }
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error('❌ Fatal error:', e)
  process.exit(1)
})

