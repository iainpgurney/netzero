import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTNFDModules() {
  try {
    const tnfdCourse = await prisma.course.findUnique({
      where: { slug: 'tnfd-carma-integrated' },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            userProgress: true,
          },
        },
      },
    })

    if (!tnfdCourse) {
      console.log('❌ TNFD course not found')
      return
    }

    console.log(`\n📚 Course: ${tnfdCourse.title}`)
    console.log(`   Slug: ${tnfdCourse.slug}`)
    console.log(`   Modules: ${tnfdCourse.modules.length}\n`)

    for (const module of tnfdCourse.modules) {
      console.log(`Module ${module.order}: ${module.title}`)
      console.log(`   ID: ${module.id}`)
      console.log(`   Order: ${module.order}`)
      console.log(`   Progress records: ${module.userProgress.length}`)
      if (module.userProgress.length > 0) {
        module.userProgress.forEach((progress) => {
          console.log(`     - User: ${progress.userId}, Completed: ${progress.completed}`)
        })
      }
      console.log('')
    }

    // Check if module 1 exists and its order
    const module1 = tnfdCourse.modules.find((m) => m.order === 1)
    if (module1) {
      console.log(`✅ Module 1 found: ${module1.title} (ID: ${module1.id}, Order: ${module1.order})`)
    } else {
      console.log('❌ Module 1 not found!')
    }
  } catch (error) {
    console.error('Error checking TNFD modules:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTNFDModules()
