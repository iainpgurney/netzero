/**
 * One-time script: Update all LeavePolicy records from 25 to 23 days annual allowance.
 * Run with: npx tsx scripts/update-leave-allowance-to-23.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.leavePolicy.updateMany({
    where: { annualLeaveAllowance: 25 },
    data: { annualLeaveAllowance: 23 },
  })
  console.log(`✅ Updated ${result.count} leave policy/policies from 25 to 23 days`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
