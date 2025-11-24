import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking production database...\n')

  try {
    // Check if DATABASE_URL is set
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      console.error('❌ DATABASE_URL environment variable is not set!')
      console.log('\n📝 To check production database:')
      console.log('   1. Get DATABASE_URL from DigitalOcean App Platform → Settings → Environment Variables')
      console.log('   2. Set it in PowerShell:')
      console.log('      $env:DATABASE_URL="your-production-database-url"')
      console.log('   3. Run this script again: npm run check-production-db')
      process.exit(1)
    }

    // Check if it's production database (contains digitalocean)
    const isProduction = dbUrl.includes('digitalocean') || dbUrl.includes('ondigitalocean')
    if (!isProduction) {
      console.log('⚠️  Warning: DATABASE_URL does not appear to be production (DigitalOcean)')
      console.log('   Make sure you\'re using the production DATABASE_URL\n')
    }

    console.log('📊 Database Status:\n')

    // Check courses
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    console.log(`📚 Courses: ${courses.length}`)
    courses.forEach((course) => {
      console.log(`   - ${course.title} (${course.slug})`)
      console.log(`     Active: ${course.isActive ? '✅' : '❌'}`)
      console.log(`     Modules: ${course.modules.length}`)
    })

    // Check modules
    const modules = await prisma.module.count()
    console.log(`\n📖 Total Modules: ${modules}`)

    // Check users
    const users = await prisma.user.count()
    console.log(`\n👥 Total Users: ${users}`)

    // Check if Net Zero course exists
    const netZeroCourse = courses.find(c => c.slug === 'netzero')
    if (!netZeroCourse) {
      console.log('\n❌ Net Zero course is MISSING from production database!')
      console.log('\n🌱 To seed the production database:')
      console.log('   1. Make sure DATABASE_URL is set to production')
      console.log('   2. Run: npm run db:seed')
      console.log('   OR')
      console.log('   3. Run: npm run db:setup-do (includes verification)')
    } else {
      console.log('\n✅ Net Zero course found!')
      if (!netZeroCourse.isActive) {
        console.log('   ⚠️  But it\'s marked as inactive (isActive: false)')
      }
      if (netZeroCourse.modules.length === 0) {
        console.log('   ⚠️  But it has no modules!')
      }
    }

    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    if (courses.length === 0) {
      console.log('❌ Database is EMPTY - needs seeding!')
      console.log('\n📝 To seed:')
      console.log('   npm run db:seed')
    } else if (!netZeroCourse) {
      console.log('⚠️  Database has courses but Net Zero is missing')
      console.log('\n📝 To fix:')
      console.log('   npm run db:seed')
    } else {
      console.log('✅ Database looks good!')
      console.log('   If courses still don\'t show in the app, check:')
      console.log('   - App is using correct DATABASE_URL')
      console.log('   - App has been redeployed after seeding')
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('\n❌ Error connecting to database:', error)
    if (error instanceof Error) {
      if (error.message.includes('P1001') || error.message.includes('Can\'t reach')) {
        console.log('\n💡 Connection failed. Check:')
        console.log('   1. DATABASE_URL is correct')
        console.log('   2. DigitalOcean database is running')
        console.log('   3. Your IP is allowed (or firewall allows all)')
        console.log('   4. Connection string includes ?sslmode=require')
      }
    }
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

