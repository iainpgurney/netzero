/**
 * Verify DigitalOcean database is seeded correctly
 * Checks for users, modules, quizzes, and confirms user tracking setup
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying DigitalOcean Database Seeding...\n')

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!')
    console.error('\nSet it in .env.local or run:')
    console.error('  $env:DATABASE_URL="your-connection-string"')
    process.exit(1)
  }

  // Mask password in display
  const displayUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@')
  console.log(`📡 Connection: ${displayUrl}\n`)

  try {
    // Test connection
    console.log('⏳ Testing connection...')
    await prisma.$connect()
    console.log('✅ Connected successfully!\n')

    // Check tables exist
    console.log('⏳ Checking database tables...')
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `

    if (tables.length === 0) {
      console.error('❌ No tables found! Database schema not created.')
      console.error('   Run: npm run db:setup-complete')
      process.exit(1)
    }

    console.log(`✅ Found ${tables.length} tables:`)
    tables.forEach((table) => {
      console.log(`   - ${table.tablename}`)
    })
    console.log('')

    // Check Users
    console.log('⏳ Checking Users...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    console.log(`📊 Users: ${users.length}`)
    if (users.length > 0) {
      users.forEach((user) => {
        console.log(`   ✅ ${user.email} (${user.name || 'No name'}) - Created: ${user.createdAt.toLocaleDateString()}`)
      })
    } else {
      console.log('   ⚠️  No users found - database not seeded!')
    }
    console.log('')

    // Check Modules
    console.log('⏳ Checking Modules...')
    const modules = await prisma.module.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        order: true,
        duration: true,
        badgeName: true,
      },
    })

    console.log(`📊 Modules: ${modules.length}`)
    if (modules.length === 7) {
      console.log('   ✅ All 7 modules found!')
      modules.forEach((module) => {
        console.log(`   ✅ Module ${module.order}: ${module.title} (${module.duration} min) - Badge: ${module.badgeName}`)
      })
    } else {
      console.log(`   ⚠️  Expected 7 modules, found ${modules.length}`)
      if (modules.length > 0) {
        modules.forEach((module) => {
          console.log(`   - Module ${module.order}: ${module.title}`)
        })
      }
    }
    console.log('')

    // Check Quizzes
    console.log('⏳ Checking Quizzes...')
    const quizzes = await prisma.quiz.findMany({
      include: {
        module: {
          select: {
            title: true,
            order: true,
          },
        },
      },
      orderBy: [
        { module: { order: 'asc' } },
        { order: 'asc' },
      ],
    })

    console.log(`📊 Quizzes: ${quizzes.length}`)
    if (quizzes.length === 35) {
      console.log('   ✅ All 35 quiz questions found (5 per module)!')
    } else {
      console.log(`   ⚠️  Expected 35 quizzes, found ${quizzes.length}`)
    }

    // Group by module
    const quizzesByModule = quizzes.reduce((acc, quiz) => {
      const key = quiz.module.title
      if (!acc[key]) acc[key] = []
      acc[key].push(quiz)
      return acc
    }, {} as Record<string, typeof quizzes>)

    Object.entries(quizzesByModule).forEach(([moduleTitle, moduleQuizzes]) => {
      console.log(`   📝 ${moduleTitle}: ${moduleQuizzes.length} questions`)
    })
    console.log('')

    // Check User Progress table structure
    console.log('⏳ Verifying User Tracking Setup...')
    const userProgressColumns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'UserProgress'
      ORDER BY column_name
    `

    console.log('✅ UserProgress table tracks:')
    userProgressColumns.forEach((col) => {
      console.log(`   - ${col.column_name} (${col.data_type})`)
    })
    console.log('')

    const quizAttemptColumns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'QuizAttempt'
      ORDER BY column_name
    `

    console.log('✅ QuizAttempt table tracks:')
    quizAttemptColumns.forEach((col) => {
      console.log(`   - ${col.column_name} (${col.data_type})`)
    })
    console.log('')

    // Summary
    console.log('📋 Database Seeding Summary:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`   Tables:        ${tables.length} ✅`)
    console.log(`   Users:         ${users.length} ${users.length >= 1 ? '✅' : '❌'}`)
    console.log(`   Modules:       ${modules.length}/7 ${modules.length === 7 ? '✅' : '❌'}`)
    console.log(`   Quizzes:       ${quizzes.length}/35 ${quizzes.length === 35 ? '✅' : '❌'}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    if (users.length >= 1 && modules.length === 7 && quizzes.length === 35) {
      console.log('🎉 Database is fully seeded and ready!')
      console.log('')
      console.log('✅ User tracking is configured:')
      console.log('   - User accounts (email, name, password)')
      console.log('   - User progress (modules completed, quiz scores, time spent)')
      console.log('   - Quiz attempts (individual answers, correct/incorrect)')
      console.log('   - Badges earned')
      console.log('   - Certificates issued')
      console.log('')
      console.log('🚀 Your app is ready to track user data!')
    } else {
      console.log('⚠️  Database is partially seeded.')
      console.log('   Run: npm run db:setup-complete')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Error:', error)
    if (error instanceof Error) {
      console.error(`   Message: ${error.message}\n`)
      if (error.message.includes('does not exist')) {
        console.error('💡 Database schema not created yet.')
        console.error('   Run: npm run db:setup-complete')
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

