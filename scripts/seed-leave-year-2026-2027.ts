/**
 * Seed the 2026-2027 leave year (1 April 2026 - 31 March 2027).
 * Run with: npx tsx scripts/seed-leave-year-2026-2027.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const START = new Date(2026, 3, 1) // 1 April 2026 (month 3 = April in 0-indexed)
const END = new Date(2027, 2, 31, 23, 59, 59) // 31 March 2027

async function main() {
  const existing = await prisma.leaveYear.findFirst({
    where: {
      startDate: { gte: new Date(2026, 2, 15), lte: new Date(2026, 3, 15) },
    },
  })
  if (existing) {
    console.log(`✅ Leave year 2026-2027 already exists: ${START.toISOString().slice(0, 10)} → ${END.toISOString().slice(0, 10)}`)
    return
  }
  await prisma.leaveYear.create({
    data: {
      startDate: START,
      endDate: END,
      locked: false,
    },
  })
  console.log(`✅ Created leave year 2026-2027: ${START.toISOString().slice(0, 10)} → ${END.toISOString().slice(0, 10)}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
