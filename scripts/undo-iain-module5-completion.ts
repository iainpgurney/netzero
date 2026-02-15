/**
 * Undo the incorrect module 5 completion for iain.gurney.
 * User has not completed modules 5 and 6 - they should complete them themselves.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'iain.gurney@carma.earth' },
  })
  if (!user) {
    console.error('User not found')
    process.exit(1)
  }

  const carbon = await prisma.module.findFirst({
    where: {
      course: { slug: 'new-starter' },
      title: 'Carbon | Trees | Kelp',
    },
  })
  if (!carbon) {
    console.error('Carbon module not found')
    process.exit(1)
  }

  await prisma.userProgress.deleteMany({
    where: {
      userId: user.id,
      moduleId: carbon.id,
    },
  })
  console.log('Removed module 5 (Carbon | Trees | Kelp) completion for iain.gurney@carma.earth')
  console.log('Modules 5 and 6 remain unlocked (order fix kept). User can complete them.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
