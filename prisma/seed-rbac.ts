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
  { name: 'Board',             slug: 'board',              icon: '👑', color: '#6B21A8', description: 'Sets governance, approves strategy and major decisions, and ensures we deliver on our mission with integrity.', googleOUPath: '/Board',              order: 1 },
  { name: 'C-Suite',           slug: 'c-suite',            icon: '🏢', color: '#1D4ED8', description: 'Leads vision, strategy and culture — turning real impact into trusted evidence and building the climate platform people can trust.', googleOUPath: '/C-Suite',            order: 2 },
  { name: 'Finance',           slug: 'finance',            icon: '💰', color: '#059669', description: 'Manages funding, pricing and reporting — ensuring financial sustainability so we can scale impact and deliver long-term value.', googleOUPath: '/Finance',            order: 3 },
  { name: 'Marketing',         slug: 'marketing',          icon: '📢', color: '#DC2626', description: 'Tells Carma\'s story — brand, content and communications that amplify real impact and build trust with stakeholders.', googleOUPath: '/Marketing',          order: 4 },
  { name: 'Sales',             slug: 'sales',              icon: '🤝', color: '#D97706', description: 'Brings in partners and customers — growing revenue and relationships so more businesses can take credible climate action.', googleOUPath: '/Sales',              order: 5 },
  { name: 'Operations',        slug: 'operations',         icon: '⚙️', color: '#4B5563', description: 'Delivers projects on the ground — nature restoration, tree planting and social value programmes that create real outcomes.', googleOUPath: '/Operations',         order: 6 },
  { name: 'Customer Services', slug: 'customer-services',  icon: '🎧', color: '#0891B2', description: 'Supports clients from onboarding to success — helping them track, verify and share their impact with confidence.', googleOUPath: '/Customer Services',  order: 7 },
  { name: 'Development',       slug: 'development',        icon: '💻', color: '#7C3AED', description: 'Builds the platform and data systems — MyCarma, verification tools and infrastructure that make evidence audit-ready.', googleOUPath: '/Development',        order: 8 },
  { name: 'HR',                slug: 'hr',                 icon: '👥', color: '#EC4899', description: 'Grows and supports our people — hiring, development and culture so the team can deliver impact at their best.', googleOUPath: '/HR',                 order: 9 },
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
  ],
  'c-suite': [
    // C-Suite has full access to everything
    { moduleSlug: 'training', canView: true, canEdit: true, canManage: true },
    { moduleSlug: 'management', canView: true, canEdit: true, canManage: true },
    { moduleSlug: 'bcorp', canView: true, canEdit: true, canManage: true },
    { moduleSlug: 'rag', canView: true, canEdit: true, canManage: true },
  ],
  'finance': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: false, canManage: false },
  ],
  'marketing': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: false, canManage: false },
  ],
  'sales': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: false, canManage: false },
  ],
  'operations': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: true, canManage: false },
  ],
  'customer-services': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: false, canManage: false },
  ],
  'development': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: false, canManage: false },
  ],
  'hr': [
    { moduleSlug: 'training', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'management', canView: true, canEdit: false, canManage: false },
    { moduleSlug: 'bcorp', canView: true, canEdit: false, canManage: false },
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

  // 4. Set up admin user
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
