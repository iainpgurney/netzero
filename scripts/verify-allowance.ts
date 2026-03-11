/**
 * Verify allowance calculation for Greg, Iain, Jim
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getCarmaTwoYearBonusDays(googleOrgJoinDate: Date | null): number {
  if (!googleOrgJoinDate) return 0
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
  return googleOrgJoinDate <= twoYearsAgo ? 2 : 0
}

async function main() {
  const names = ['Greg Morris', 'Iain Gurney', 'Jim Holland']
  const users = await prisma.user.findMany({
    where: { name: { in: names } },
    select: {
      id: true,
      name: true,
      email: true,
      googleOrgJoinDate: true,
    },
  })

  console.log('User googleOrgJoinDate and calculated allowance:\n')
  for (const u of users) {
    const bonus = getCarmaTwoYearBonusDays(u.googleOrgJoinDate)
    const allowance = 23 + bonus
    console.log(`  ${u.name}:`)
    console.log(`    googleOrgJoinDate: ${u.googleOrgJoinDate?.toISOString() ?? 'NULL'}`)
    console.log(`    Carma bonus: ${bonus} days`)
    console.log(`    Total allowance: ${allowance} days`)
    console.log()
  }

  // Also check getEmployeesWithSummaries logic
  const leaveYear = await prisma.leaveYear.findFirst({
    where: { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
  })
  if (leaveYear) {
    const usersWithGoogle = await prisma.user.findMany({
      where: { name: { in: names }, email: { not: null } },
      select: { id: true, name: true, googleOrgJoinDate: true },
    })
    const policies = await prisma.leavePolicy.findMany({
      where: { leaveYearId: leaveYear.id, userId: { in: usersWithGoogle.map((u) => u.id) } },
    })
    const policyMap = new Map(policies.map((p) => [p.userId, p]))
    console.log(`Leave year ${leaveYear.id} (${leaveYear.startDate.toISOString().slice(0, 10)} - ${leaveYear.endDate.toISOString().slice(0, 10)}):\n`)
    for (const u of usersWithGoogle) {
      const policy = policyMap.get(u.id)
      const bonus = getCarmaTwoYearBonusDays(u.googleOrgJoinDate)
      const base = policy?.annualLeaveAllowance ?? 23
      const allowance = base + bonus
      console.log(`  ${u.name}: base=${base}, bonus=${bonus}, allowance=${allowance}`)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
