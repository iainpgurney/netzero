import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testModuleLock() {
  try {
    // Find a user (or use a test user ID)
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ No user found in database')
      return
    }

    console.log(`\n👤 Testing with user: ${user.email || user.id}\n`)

    // Find TNFD course
    const tnfdCourse = await prisma.course.findUnique({
      where: { slug: 'tnfd-carma-integrated' },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            userProgress: {
              where: { userId: user.id },
            },
            badges: true,
          },
        },
      },
    })

    if (!tnfdCourse) {
      console.log('❌ TNFD course not found')
      return
    }

    const module1 = tnfdCourse.modules.find((m) => m.order === 1)
    if (!module1) {
      console.log('❌ Module 1 not found')
      return
    }

    console.log(`\n📦 Module 1 Details:`)
    console.log(`   ID: ${module1.id}`)
    console.log(`   Order: ${module1.order} (type: ${typeof module1.order})`)
    console.log(`   Title: ${module1.title}`)
    console.log(`   User Progress: ${module1.userProgress.length} records`)
    console.log(`   Completed: ${module1.userProgress[0]?.completed || false}`)

    // Simulate the getModule logic
    console.log(`\n🔍 Simulating getModule logic:`)
    console.log(`   module.order === 1: ${module1.order === 1}`)
    console.log(`   Number(module.order) === 1: ${Number(module1.order) === 1}`)
    
    let isLocked: boolean
    if (module1.order === 1 || Number(module1.order) === 1) {
      isLocked = false
      console.log(`   ✅ Module 1 detected - setting isLocked = false`)
    } else {
      // Check previous module
      const previousModule = await prisma.module.findFirst({
        where: {
          courseId: module1.courseId,
          order: module1.order - 1,
        },
        include: {
          userProgress: {
            where: { userId: user.id },
          },
        },
      })
      isLocked = !previousModule?.userProgress[0]?.completed
      console.log(`   ⚠️  Not module 1 - checking previous module`)
      console.log(`   Previous module completed: ${previousModule?.userProgress[0]?.completed || false}`)
    }

    console.log(`\n📊 Result:`)
    console.log(`   isLocked: ${isLocked}`)
    console.log(`   Should be unlocked: ${!isLocked}`)

    // Also test getModules logic
    console.log(`\n🔍 Simulating getModules logic:`)
    const completedModules = new Set(
      tnfdCourse.modules
        .filter((m) => m.userProgress[0]?.completed)
        .map((m) => m.order)
    )
    console.log(`   Completed modules: ${Array.from(completedModules).join(', ') || 'none'}`)
    
    const module1Locked = module1.order === 1 ? false : !completedModules.has(module1.order - 1)
    console.log(`   Module 1 isLocked from getModules: ${module1Locked}`)
    console.log(`   Should be unlocked: ${!module1Locked}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testModuleLock()
