import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking courses in database...\n')

  try {
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    console.log(`📚 Found ${courses.length} course(s):\n`)

    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`)
      console.log(`   Slug: ${course.slug}`)
      console.log(`   Active: ${course.isActive ? '✅' : '❌'}`)
      console.log(`   Modules: ${course.modules.length}`)
      console.log(`   Icon: ${course.icon || 'None'}`)
      console.log('')
    })

    // Check specifically for netzero
    const netZeroCourse = courses.find(c => c.slug === 'netzero')
    if (netZeroCourse) {
      console.log('✅ Net Zero course found!')
      console.log(`   Active: ${netZeroCourse.isActive}`)
      console.log(`   Modules: ${netZeroCourse.modules.length}`)
    } else {
      console.log('❌ Net Zero course NOT found!')
      console.log('   Available slugs:', courses.map(c => c.slug).join(', '))
    }
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

