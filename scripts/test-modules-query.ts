import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing modules query...\n')

  try {
    // Get demo user
    const user = await prisma.user.findUnique({
      where: { email: 'demo@netzero.com' },
    })

    if (!user) {
      console.log('❌ Demo user not found!')
      console.log('   Run: npm run create-demo-user')
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})\n`)

    // Test the same query as the tRPC endpoint
    const modules = await prisma.module.findMany({
      orderBy: { order: 'asc' },
      include: {
        quizzes: {
          orderBy: { order: 'asc' },
        },
        userProgress: {
          where: { userId: user.id },
        },
        badges: {
          where: { userId: user.id },
        },
      },
    })

    console.log(`✅ Found ${modules.length} modules:\n`)

    modules.forEach((module) => {
      console.log(`   ${module.order}. ${module.title}`)
      console.log(`      Progress: ${module.userProgress.length > 0 ? 'Yes' : 'No'}`)
      console.log(`      Badges: ${module.badges.length}`)
      console.log(`      Quizzes: ${module.quizzes.length}`)
      console.log('')
    })

    if (modules.length === 0) {
      console.log('❌ No modules found!')
      console.log('   Run: npm run db:seed')
      process.exit(1)
    }

    console.log('✅ Query test successful!')
  } catch (error) {
    console.error('❌ Error:', error)
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

