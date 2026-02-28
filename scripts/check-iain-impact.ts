import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
})

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'iain.gurney@carma.earth' },
  })
  if (!user) { console.log('User not found'); return }

  const assessments = await prisma.impactAssessment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      strategistScore: true,
      ideasScore: true,
      executionScore: true,
      peopleScore: true,
      excellenceScore: true,
      createdAt: true,
    },
  })
  console.log('Assessments:', JSON.stringify(assessments, null, 2))

  const profiles = await prisma.impactProfile.findMany({
    where: { userId: user.id },
    select: { id: true, assessmentId: true, version: true, lastGeneratedAt: true },
  })
  console.log('Profiles:', JSON.stringify(profiles, null, 2))
}

main().finally(() => prisma.$disconnect())
