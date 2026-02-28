import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'iain.gurney@carma.earth' },
  })

  if (!user) {
    console.log('User iain.gurney@carma.earth not found')
    return
  }

  console.log(`Found user: ${user.name} (${user.id})`)

  const deletedProfile = await prisma.impactProfile.deleteMany({
    where: { userId: user.id },
  })
  console.log(`Deleted ${deletedProfile.count} ImpactProfile record(s)`)

  const deletedAssessments = await prisma.impactAssessment.deleteMany({
    where: { userId: user.id },
  })
  console.log(`Deleted ${deletedAssessments.count} ImpactAssessment record(s)`)

  console.log('Reset complete. Iain can now take the assessment fresh.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
