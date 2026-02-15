import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Default RAG statuses for departments
 * These set the initial Red/Amber/Green health status for each department
 */
const ragDefaults = [
  {
    slug: 'board',
    ragStatus: 'GREEN',
    ragReason: 'Board engaged and supportive. Strategic alignment strong.',
  },
  {
    slug: 'c-suite',
    ragStatus: 'GREEN',
    ragReason: 'Leadership team working well. Clear priorities set for Q4.',
  },
  {
    slug: 'marketing',
    ragStatus: 'GREEN',
    ragReason: 'Campaign performance 15% above target. Strong lead quality.',
  },
  {
    slug: 'operations',
    ragStatus: 'GREEN',
    ragReason: 'Processes running smoothly. KPIs all green.',
  },
  {
    slug: 'sales',
    ragStatus: 'GREEN',
    ragReason: 'Pipeline healthy at £2.5M. Conversion rate up 8% this month.',
  },
  {
    slug: 'customer-services',
    ragStatus: 'RED',
    ragReason: 'Response times jumped to 48hrs. Need to hire 2 support staff urgently.',
  },
  {
    slug: 'finance',
    ragStatus: 'AMBER',
    ragReason: 'Cash runway at 8 months. Monitoring closely ahead of next raise.',
  },
  {
    slug: 'development',
    ragStatus: 'GREEN',
    ragReason: 'Sprint velocity stable. Tech debt under control.',
  },
  {
    slug: 'hr',
    ragStatus: 'GREEN',
    ragReason: 'Team morale high. 2 new hires onboarding well.',
  },
]

async function seedRAG() {
  console.log('🚦 Seeding RAG statuses...\n')

  // NEVER overwrite user data — only seed when RAG has never been set
  const historyCount = await prisma.ragStatusHistory.count()
  if (historyCount > 0) {
    console.log(`  ⏭️ RAG data already exists (${historyCount} history entries). Skipping to preserve your data.\n`)
    return
  }

  for (const entry of ragDefaults) {
    const department = await prisma.department.findUnique({
      where: { slug: entry.slug },
    })

    if (!department) {
      console.log(`  ⚠️ Department "${entry.slug}" not found, skipping`)
      continue
    }

    // Only update if user hasn't set a reason (preserve any existing user input)
    if (department.ragReason && department.ragReason.trim().length > 0) {
      console.log(`  ⏭️ ${department.name} already has data, skipping`)
      continue
    }

    await prisma.department.update({
      where: { id: department.id },
      data: {
        ragStatus: entry.ragStatus,
        ragReason: entry.ragReason,
        ragLastUpdated: new Date(),
      },
    })

    await prisma.ragStatusHistory.create({
      data: {
        departmentId: department.id,
        status: entry.ragStatus,
        reason: entry.ragReason,
      },
    })

    const emoji =
      entry.ragStatus === 'GREEN' ? '🟢' :
      entry.ragStatus === 'AMBER' ? '🟠' : '🔴'
    console.log(`  ${emoji} ${department.name} → ${entry.ragStatus}`)
  }

  console.log('\n✅ RAG seed complete!')
}

async function seedKeyMetrics() {
  console.log('\n📊 Seeding RAG Key Metrics...\n')

  // Remove legacy metric labels
  await prisma.ragKeyMetric.deleteMany({
    where: { label: { in: ['% to Annual Target', 'Annual Churn'] } },
  })

  const metrics = [
    { label: 'Revenue Target', value: '', targetValue: '£1m', order: 1 },
    { label: 'Active Customers', value: '', targetValue: '1,000', order: 2 },
    { label: 'Churn Target', value: '', targetValue: '5%', order: 3 },
    { label: 'CSAT', value: '', targetValue: null as string | null, order: 4 },
  ]

  for (const metric of metrics) {
    await prisma.ragKeyMetric.upsert({
      where: { label: metric.label },
      update: { order: metric.order, targetValue: metric.targetValue || undefined },
      create: { label: metric.label, value: metric.value, order: metric.order, targetValue: metric.targetValue || undefined },
    })
    console.log(`  ✅ ${metric.label}`)
  }
}

async function seedPriorities() {
  console.log('\n🎯 Seeding Q1 2026 Priorities...\n')

  const priorities = [
    { label: 'Ship Trust System', order: 1 },
    { label: 'Launch Carma Assurance', order: 2 },
    { label: 'Team Growth', order: 3 },
  ]

  // Only seed if no priorities exist
  const existing = await prisma.ragPriority.count()
  if (existing > 0) {
    console.log(`  ⏭️ ${existing} priorities already exist, skipping`)
    return
  }

  for (const priority of priorities) {
    await prisma.ragPriority.create({ data: priority })
    console.log(`  ✅ ${priority.label}`)
  }
}

async function main() {
  await seedRAG()
  await seedKeyMetrics()
  await seedPriorities()
}

main()
  .catch((error) => {
    console.error('❌ RAG seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
