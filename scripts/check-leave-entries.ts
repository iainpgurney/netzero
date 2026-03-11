import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const leaveYears = await prisma.leaveYear.findMany({
    orderBy: { startDate: 'desc' },
    take: 3,
  })
  console.log('Leave years:', leaveYears.map((ly) => ({ id: ly.id, start: ly.startDate, end: ly.endDate })))

  const entries = await prisma.leaveEntry.findMany({
    take: 20,
    orderBy: { startDate: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  })
  console.log('\nLeave entries (latest 20):', entries.length)
  entries.forEach((e) => {
    console.log(`  ${e.user.name} | ${e.type} | ${e.status} | ${e.startDate.toISOString().slice(0, 10)} - ${e.endDate.toISOString().slice(0, 10)}`)
  })

  const currentYear = leaveYears.find((ly) => ly.startDate <= new Date() && ly.endDate >= new Date())
  if (currentYear) {
    const currentYearEntries = await prisma.leaveEntry.count({
      where: { leaveYearId: currentYear.id },
    })
    const approvedCount = await prisma.leaveEntry.count({
      where: { leaveYearId: currentYear.id, status: 'approved' },
    })
    console.log(`\nCurrent leave year (${currentYear.id}): ${currentYearEntries} total, ${approvedCount} approved`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
