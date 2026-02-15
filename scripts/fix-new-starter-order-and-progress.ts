/**
 * Fix New Starter module order and mark module 5 completed for iain.gurney
 *
 * Problem: Carbon | Trees | Kelp and Social Impact were seeded with order 7 and 6,
 * creating a gap (no module 5). Module 6 and 7 stay locked because module 5 never exists.
 *
 * Fix:
 * 1. Carbon | Trees | Kelp → order 5
 * 2. Social Impact | Veterans | Community Value → order 6
 * 3. Mark Carbon (module 5) as completed for iain.gurney
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const course = await prisma.course.findUnique({
    where: { slug: 'new-starter' },
    include: { modules: { orderBy: { order: 'asc' } } },
  })
  if (!course) {
    console.error('New Starter course not found')
    process.exit(1)
  }

  const carbon = course.modules.find((m) => m.title === 'Carbon | Trees | Kelp')
  const social = course.modules.find((m) => m.title === 'Social Impact | Veterans | Community Value')

  if (!carbon || !social) {
    console.error('Carbon or Social Impact module not found')
    process.exit(1)
  }

  console.log('Current order:', { carbon: carbon.order, social: social.order })

  // Avoid unique constraint: move Carbon to temp order first
  await prisma.module.update({
    where: { id: carbon.id },
    data: { order: 99 },
  })
  console.log('Moved Carbon to temp order 99')

  // Set correct order: Carbon=5, Social=6
  await prisma.module.update({
    where: { id: carbon.id },
    data: { order: 5 },
  })
  await prisma.module.update({
    where: { id: social.id },
    data: { order: 6 },
  })
  console.log('Updated order: Carbon=5, Social Impact=6')

  // Mark Carbon (module 5) as completed for iain.gurney
  const user = await prisma.user.findUnique({
    where: { email: 'iain.gurney@carma.earth' },
  })
  if (!user) {
    console.error('User iain.gurney@carma.earth not found')
    process.exit(1)
  }

  await prisma.userProgress.upsert({
    where: {
      userId_moduleId: { userId: user.id, moduleId: carbon.id },
    },
    create: {
      userId: user.id,
      moduleId: carbon.id,
      completed: true,
      completedAt: new Date(),
      quizScore: 100,
    },
    update: {
      completed: true,
      completedAt: new Date(),
      quizScore: 100,
    },
  })
  console.log('Marked Carbon | Trees | Kelp as completed for iain.gurney@carma.earth')

  console.log('\nDone. Module 6 (Social Impact) should now be unlocked.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
