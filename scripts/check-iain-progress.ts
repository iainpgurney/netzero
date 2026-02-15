import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'iain.gurney@carma.earth' },
  })
  if (!user) {
    console.log('User not found')
    return
  }

  const course = await prisma.course.findUnique({
    where: { slug: 'new-starter' },
    include: {
      modules: { orderBy: { order: 'asc' } },
    },
  })
  if (!course) {
    console.log('New Starter course not found')
    return
  }

  const progress = await prisma.userProgress.findMany({
    where: { userId: user.id },
    include: { module: true },
  })

  console.log(`\nUser: ${user.email}`)
  console.log(`New Starter course: ${course.modules.length} modules\n`)

  for (const m of course.modules) {
    const p = progress.find((x) => x.moduleId === m.id)
    const completed = p?.completed ?? false
    const status = completed ? '✅ COMPLETED' : '❌ not completed'
    console.log(`  Module ${m.order}: ${m.title}`)
    console.log(`    ID: ${m.id}`)
    console.log(`    Progress: ${status}`)
    if (p) {
      console.log(`    completedAt: ${p.completedAt?.toISOString() ?? 'null'}`)
      console.log(`    quizScore: ${p.quizScore ?? 'null'}`)
    } else {
      console.log(`    (no UserProgress record)`)
    }
    console.log('')
  }

  const completedOrders = new Set(
    course.modules
      .filter((m) => {
        const p = progress.find((x) => x.moduleId === m.id)
        return p?.completed === true
      })
      .map((m) => m.order)
  )
  console.log('Completed module orders:', Array.from(completedOrders).sort().join(', ') || 'none')
  console.log('')

  for (const m of course.modules) {
    const isLocked = m.order === 1 ? false : !completedOrders.has(m.order - 1)
    console.log(`  Module ${m.order} isLocked: ${isLocked} (needs module ${m.order - 1} completed: ${completedOrders.has(m.order - 1)})`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
