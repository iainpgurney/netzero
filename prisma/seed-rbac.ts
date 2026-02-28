import { PrismaClient, SystemRole } from '@prisma/client'

const prisma = new PrismaClient()

// ==========================================
// Departments — with Google Workspace OU paths
//
// The googleOUPath maps to Google Admin > Directory > Organizational Units
// When a user signs in via Google, their OU is fetched and matched
// to auto-assign them to the correct department.
// ==========================================
const departments = [
  { name: 'Board', slug: 'board', icon: '👑', color: '#6B21A8', description: 'Sets governance, approves strategy and major decisions.', googleOUPath: '/Board', order: 1 },
  { name: 'C Suite', slug: 'c-suite', icon: '🏢', color: '#1D4ED8', description: 'Leads vision, strategy and culture.', googleOUPath: '/C Suite', order: 2 },
  { name: 'Customer Support', slug: 'customer-support', icon: '🎧', color: '#0891B2', description: 'Supports clients from onboarding to success.', googleOUPath: '/Customer Support', order: 3 },
  { name: 'Development', slug: 'development', icon: '💻', color: '#7C3AED', description: 'Builds the platform and data systems.', googleOUPath: '/Development', order: 4 },
  { name: 'Finance', slug: 'finance', icon: '💰', color: '#059669', description: 'Manages funding, pricing and reporting.', googleOUPath: '/Finance', order: 5 },
  { name: 'Operations', slug: 'operations', icon: '⚙️', color: '#4B5563', description: 'Delivers projects on the ground.', googleOUPath: '/Operations', order: 6 },
  { name: 'Rev Ops', slug: 'rev-ops', icon: '📊', color: '#059669', description: 'Revenue operations and analytics.', googleOUPath: '/Rev Ops', order: 7 },
]

// ==========================================
// Platform Modules
// ==========================================
const platformModules = [
  {
    name: 'Training',
    slug: 'training',
    icon: '🎓',
    color: '#059669',
    route: '/dashboard',
    description: 'Learning hub with courses, certifications, and professional development',
    order: 1,
  },
  {
    name: 'Management',
    slug: 'management',
    icon: '📊',
    color: '#1D4ED8',
    route: '/management',
    description: 'Team management, performance tracking, and resource planning',
    order: 2,
  },
  {
    name: 'BCorp',
    slug: 'bcorp',
    icon: '🌱',
    color: '#16A34A',
    route: '/bcorp',
    description: 'B Corporation certification tracking, impact assessment, and compliance',
    order: 3,
  },
  {
    name: 'RAG Dashboard',
    slug: 'rag',
    icon: '🚦',
    color: '#00D97E',
    route: '/intranet/rag',
    description: 'Red/Amber/Green department health status tracker for executive oversight',
    order: 4,
  },
  {
    name: 'Time Off',
    slug: 'time-off',
    icon: '📅',
    color: '#0EA5E9',
    route: '/intranet/time-off',
    description: 'Annual leave and sick leave management for HR and Accounts',
    order: 5,
  },
  {
    name: 'Impact Alignment',
    slug: 'impact-alignment',
    icon: '🧭',
    color: '#16A34A',
    route: '/intranet/impact-alignment',
    description: 'Energy orientation profiles to improve team awareness, synergy and collaboration',
    order: 6,
  },
]

// ==========================================
// Default access matrix
// Which departments get access to which modules by default
// C-Suite gets FULL access to ALL modules (view + edit + manage)
// ==========================================
const defaultAccessMatrix: Record<string, { moduleSlug: string; canView: boolean; canEdit: boolean; canManage: boolean }[]> = {
  'board': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'impact-alignment', canView: true, canEdit: true, canManage: false },
  ],
  'c-suite': [
    // C-Suite has full access to everything
    { moduleSlug: 'training', canView: true, canEdit: true, canManage: true },
    { moduleSlug: 'management', canView: true, canEdit: true, canManage: true },
    { moduleSlug: 'bcorp', canView: true, canEdit: true, canManage: true },
    { moduleSlug: 'rag', canView: true, canEdit: true, canManage: true },
    { moduleSlug: 'time-off', canView: true, canEdit: true, canManage: true },
    { moduleSlug: 'impact-alignment', canView: true, canEdit: true, canManage: true },
  ],
  'finance': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'time-off', canView: true, canEdit: true, canManage: true },
    { moduleSlug: 'impact-alignment', canView: true, canEdit: true, canManage: false },
  ],
  'operations': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: true, canManage: false },
    { moduleSlug: 'impact-alignment', canView: true, canEdit: true, canManage: false },
  ],
  'customer-support': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'impact-alignment', canView: true, canEdit: true, canManage: false },
  ],
  'development': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'impact-alignment', canView: true, canEdit: true, canManage: false },
  ],
  'rev-ops': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'time-off', canView: true, canEdit: true, canManage: true },
    { moduleSlug: 'impact-alignment', canView: true, canEdit: true, canManage: false },
  ],
}

// ==========================================
// Admin user — iain.gurney@carma.earth is the primary admin
// ==========================================
const ADMIN_EMAIL = 'iain.gurney@carma.earth'

async function seedRBAC() {
  console.log('🚀 Starting RBAC seed...\n')

  // 1. Create departments with Google OU paths
  console.log('📁 Creating departments (with Google OU mappings)...')
  const createdDepartments: Record<string, string> = {}
  for (const dept of departments) {
    const result = await prisma.department.upsert({
      where: { slug: dept.slug },
      update: {
        name: dept.name,
        icon: dept.icon,
        color: dept.color,
        description: dept.description,
        googleOUPath: dept.googleOUPath,
        order: dept.order,
      },
      create: dept,
    })
    createdDepartments[dept.slug] = result.id
    console.log(`  ✅ ${dept.icon} ${dept.name}  ←  Google OU: ${dept.googleOUPath}`)
  }

  // Migrate users from customer-services to customer-support, then deactivate deprecated departments
  const customerSupportId = createdDepartments['customer-support']
  if (customerSupportId) {
    const customerServices = await prisma.department.findUnique({ where: { slug: 'customer-services' } })
    if (customerServices) {
      const migrated = await prisma.user.updateMany({
        where: { departmentId: customerServices.id },
        data: { departmentId: customerSupportId },
      })
      if (migrated.count > 0) {
        console.log(`  📦 Migrated ${migrated.count} user(s) from Customer Services → Customer Support`)
      }
    }
  }
  const deprecatedSlugs = ['marketing', 'sales', 'customer-services', 'hr', 'product']
  const deactivated = await prisma.department.updateMany({
    where: { slug: { in: deprecatedSlugs } },
    data: { isActive: false },
  })
  if (deactivated.count > 0) {
    console.log(`  ⚠️ Deactivated ${deactivated.count} deprecated department(s). Users in these depts should run "Sync from Google" to reassign.`)
  }

  // 2. Create platform modules
  console.log('\n📦 Creating platform modules...')
  const createdModules: Record<string, string> = {}
  for (const mod of platformModules) {
    const result = await prisma.platformModule.upsert({
      where: { slug: mod.slug },
      update: {
        name: mod.name,
        icon: mod.icon,
        color: mod.color,
        route: mod.route,
        description: mod.description,
        order: mod.order,
      },
      create: mod,
    })
    createdModules[mod.slug] = result.id
    console.log(`  ✅ ${mod.icon} ${mod.name} → ${mod.route}`)
  }

  // 3. Set up default access matrix
  console.log('\n🔐 Setting up department module access...')
  for (const [deptSlug, accesses] of Object.entries(defaultAccessMatrix)) {
    const departmentId = createdDepartments[deptSlug]
    if (!departmentId) {
      console.log(`  ⚠️ Department ${deptSlug} not found, skipping`)
      continue
    }

    for (const access of accesses) {
      const moduleId = createdModules[access.moduleSlug]
      if (!moduleId) {
        console.log(`  ⚠️ Module ${access.moduleSlug} not found, skipping`)
        continue
      }

      await prisma.departmentModuleAccess.upsert({
        where: {
          departmentId_platformModuleId: {
            departmentId,
            platformModuleId: moduleId,
          },
        },
        update: {
          canView: access.canView,
          canEdit: access.canEdit,
          canManage: access.canManage,
        },
        create: {
          departmentId,
          platformModuleId: moduleId,
          canView: access.canView,
          canEdit: access.canEdit,
          canManage: access.canManage,
        },
      })
    }

    const dept = departments.find(d => d.slug === deptSlug)
    const perms = accesses.map(a => {
      const p = [a.canView ? 'V' : '', a.canEdit ? 'E' : '', a.canManage ? 'M' : ''].filter(Boolean).join('')
      return `${a.moduleSlug}(${p})`
    }).join(', ')
    console.log(`  ✅ ${dept?.icon || '📁'} ${dept?.name || deptSlug} → [${perms}]`)
  }

  // 4. Create current leave year (UK: 1 April - 31 March)
  console.log('\n📅 Creating current leave year...')
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  // If we're Jan-Mar, current leave year started last April
  const leaveYearStart = month < 3
    ? new Date(year - 1, 3, 1)   // 1 April previous year
    : new Date(year, 3, 1)       // 1 April this year
  const leaveYearEnd = new Date(leaveYearStart.getFullYear() + 1, 2, 31) // 31 March next year

  const existing = await prisma.leaveYear.findFirst({
    where: {
      startDate: { lte: now },
      endDate: { gte: now },
    },
  })
  if (existing) {
    console.log(`  ✅ Leave year exists: ${leaveYearStart.toISOString().slice(0, 10)} → ${leaveYearEnd.toISOString().slice(0, 10)}`)
  } else {
    await prisma.leaveYear.create({
      data: {
        startDate: leaveYearStart,
        endDate: leaveYearEnd,
        locked: false,
      },
    })
    console.log(`  ✅ Leave year created: ${leaveYearStart.toISOString().slice(0, 10)} → ${leaveYearEnd.toISOString().slice(0, 10)}`)
  }

  // 5. Set up admin user
  console.log(`\n👤 Setting up admin: ${ADMIN_EMAIL}`)
  const adminUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  })
  if (adminUser) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        role: 'SUPER_ADMIN' as SystemRole,
        departmentId: createdDepartments['c-suite'] || null,
      },
    })
    console.log(`  ✅ ${ADMIN_EMAIL} → SUPER_ADMIN (C-Suite)`)
  } else {
    console.log(`  ⏭️ ${ADMIN_EMAIL} not found in database yet (will be set on first Google login)`)
  }

  // 5. Summary
  console.log('\n📊 RBAC Seed Summary:')
  console.log(`  • ${departments.length} departments created (with Google OU mappings)`)
  console.log(`  • ${platformModules.length} platform modules created`)
  
  const totalAccess = Object.values(defaultAccessMatrix).reduce((sum, arr) => sum + arr.length, 0)
  console.log(`  • ${totalAccess} department-module access rules created`)
  console.log(`  • C-Suite has FULL access to all ${platformModules.length} modules`)
  console.log(`  • Admin: ${ADMIN_EMAIL}`)
  
  console.log('\n🔗 Google Admin OU Mapping:')
  for (const dept of departments) {
    console.log(`  ${dept.googleOUPath.padEnd(25)} → ${dept.name}`)
  }
  
  console.log('\n✅ RBAC seed complete!')
}

seedRBAC()
  .catch((error) => {
    console.error('❌ RBAC seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
