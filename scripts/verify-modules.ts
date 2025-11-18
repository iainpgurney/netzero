import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying modules in database...\n')

  try {
    const modules = await prisma.module.findMany({
      orderBy: { order: 'asc' },
      include: {
        quizzes: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (modules.length === 0) {
      console.log('❌ No modules found in database!')
      console.log('   Run: npm run db:seed')
      process.exit(1)
    }

    console.log(`✅ Found ${modules.length} modules:\n`)

    modules.forEach((module) => {
      console.log(`   ${module.order}. ${module.title}`)
      console.log(`      Duration: ${module.duration} min`)
      console.log(`      Badge: ${module.badgeEmoji} ${module.badgeName}`)
      console.log(`      Quizzes: ${module.quizzes.length}`)
      console.log('')
    })

    console.log('✅ All modules are ready!')
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

