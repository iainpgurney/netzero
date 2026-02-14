import { PrismaClient as NetZeroPrisma } from '@prisma/client'

/**
 * Migrate RAG data from the standalone RAG database into NetZero
 * 
 * The RAG app uses a separate database on the same server.
 * This script reads departments + status history from the RAG DB
 * and maps them into the NetZero Department model (by slug).
 */

// NetZero database (uses DATABASE_URL from .env)
const netzero = new NetZeroPrisma()

// RAG database — set RAG_DATABASE_URL in .env for migration (same host, /rag database)
const ragDbUrl = process.env.RAG_DATABASE_URL
if (!ragDbUrl) {
  console.error('RAG_DATABASE_URL is required. Set it in .env (e.g. same as DATABASE_URL but with /rag)')
  process.exit(1)
}
const rag = new NetZeroPrisma({
  datasources: { db: { url: ragDbUrl } },
})

async function migrateRagData() {
  console.log('🔄 Migrating RAG data from standalone RAG database...\n')

  // 1. Read all departments from the RAG database
  // The RAG DB has a different schema shape, so we query raw
  const ragDepartments: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    order: number
    currentStatus: string
    currentReason: string | null
    priority: string | null
    lastUpdated: Date
    updatedBy: string | null
  }> = await rag.$queryRaw`
    SELECT id, name, slug, description, "order", "currentStatus", "currentReason", priority, "lastUpdated", "updatedBy"
    FROM "Department"
    ORDER BY "order" ASC
  `

  console.log(`📊 Found ${ragDepartments.length} departments in RAG database:\n`)

  for (const ragDept of ragDepartments) {
    const emoji =
      ragDept.currentStatus === 'GREEN' ? '🟢' :
      ragDept.currentStatus === 'AMBER' ? '🟠' : '🔴'
    console.log(`  ${emoji} ${ragDept.name} (${ragDept.slug}) → ${ragDept.currentStatus}`)
    if (ragDept.currentReason) {
      console.log(`     "${ragDept.currentReason.substring(0, 80)}${ragDept.currentReason.length > 80 ? '...' : ''}"`)
    }
    if (ragDept.priority) {
      console.log(`     Priority: ${ragDept.priority}`)
    }

    // Find matching department in NetZero by slug
    // Handle slug mismatches between RAG and NetZero
    const slugMap: Record<string, string> = {
      'customer-service': 'customer-services',
    }
    const mappedSlug = slugMap[ragDept.slug] || ragDept.slug

    const netzeroDept = await netzero.department.findUnique({
      where: { slug: mappedSlug },
    })

    if (!netzeroDept) {
      console.log(`     ⚠️ No matching department in NetZero for slug "${ragDept.slug}", skipping`)
      continue
    }

    // Update the NetZero department with RAG data
    await netzero.department.update({
      where: { id: netzeroDept.id },
      data: {
        ragStatus: ragDept.currentStatus,
        ragReason: ragDept.currentReason,
        ragPriority: ragDept.priority,
        ragLastUpdated: ragDept.lastUpdated,
        ragUpdatedBy: ragDept.updatedBy,
      },
    })

    console.log(`     ✅ Updated in NetZero`)
  }

  // 2. Migrate status history
  console.log('\n📜 Migrating status history...\n')

  const ragHistory: Array<{
    id: string
    departmentId: string
    status: string
    reason: string
    updatedBy: string | null
    createdAt: Date
  }> = await rag.$queryRaw`
    SELECT id, "departmentId", status, reason, "updatedBy", "createdAt"
    FROM "StatusHistory"
    ORDER BY "createdAt" ASC
  `

  console.log(`  Found ${ragHistory.length} history entries`)

  // Clear existing NetZero RAG history (from seed data)
  await netzero.ragStatusHistory.deleteMany({})
  console.log('  🗑️ Cleared existing seed history')

  // Build a RAG-department-ID to NetZero-department-ID map
  const slugMap: Record<string, string> = {
    'customer-service': 'customer-services',
  }
  const ragIdToNetzeroId: Record<string, string> = {}
  for (const ragDept of ragDepartments) {
    const mappedSlug = slugMap[ragDept.slug] || ragDept.slug
    const netzeroDept = await netzero.department.findUnique({
      where: { slug: mappedSlug },
    })
    if (netzeroDept) {
      ragIdToNetzeroId[ragDept.id] = netzeroDept.id
    }
  }

  let migrated = 0
  let skipped = 0

  for (const entry of ragHistory) {
    const netzeroDepId = ragIdToNetzeroId[entry.departmentId]
    if (!netzeroDepId) {
      skipped++
      continue
    }

    await netzero.ragStatusHistory.create({
      data: {
        departmentId: netzeroDepId,
        status: entry.status,
        reason: entry.reason,
        updatedBy: entry.updatedBy,
        createdAt: entry.createdAt,
      },
    })
    migrated++
  }

  console.log(`  ✅ Migrated ${migrated} history entries`)
  if (skipped > 0) {
    console.log(`  ⏭️ Skipped ${skipped} entries (no matching department)`)
  }

  console.log('\n✨ RAG data migration complete!')
}

migrateRagData()
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await rag.$disconnect()
    await netzero.$disconnect()
  })
