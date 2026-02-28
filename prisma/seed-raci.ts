import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const OUTCOMES = [
  // GOVERNANCE (1-5)
  { slug: 'board-governance', title: 'Board Governance & Risk Oversight', domain: 'GOVERNANCE' as const, kpi: 'Governance integrity / strategic approval', order: 1,
    assignments: [
      { personName: 'Board', role: 'R' as const },
      { personName: 'Iain', role: 'A' as const },
      { personName: 'Jim', role: 'C' as const },
      { personName: 'Leadership Team', role: 'I' as const },
    ],
  },
  { slug: '3-year-vision', title: '3-Year Vision', domain: 'GOVERNANCE' as const, kpi: 'Strategic alignment', order: 2,
    assignments: [
      { personName: 'Jim', role: 'R' as const, isJointAccountable: true },
      { personName: 'Iain', role: 'R' as const, isJointAccountable: true },
      { personName: 'Jim', role: 'A' as const },
      { personName: 'Iain', role: 'A' as const },
      { personName: 'Board', role: 'C' as const },
      { personName: 'Leadership Team', role: 'I' as const },
    ],
  },
  { slug: 'annual-revenue-target', title: 'Annual Revenue Target', domain: 'GOVERNANCE' as const, kpi: 'Revenue target hit %', order: 3,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Jim', role: 'A' as const },
      { personName: 'Iain', role: 'C' as const },
      { personName: 'Leadership Team', role: 'I' as const },
    ],
  },
  { slug: 'quarterly-priorities', title: 'Quarterly Priorities Execution', domain: 'GOVERNANCE' as const, kpi: '% Priorities completed', order: 4,
    assignments: [
      { personName: 'Iain', role: 'R' as const },
      { personName: 'Function Leads', role: 'A' as const },
      { personName: 'Jim', role: 'C' as const },
      { personName: 'Board', role: 'I' as const },
    ],
  },
  { slug: 'new-product-launch', title: 'New Product Launch Decision', domain: 'GOVERNANCE' as const, kpi: 'On-time launch / ROI', order: 5,
    assignments: [
      { personName: 'Iain', role: 'R' as const },
      { personName: 'Product & Dev', role: 'A' as const },
      { personName: 'Jim', role: 'C' as const },
      { personName: 'Board', role: 'I' as const },
    ],
  },

  // SALES (6-11)
  { slug: 'pipeline-value', title: 'Pipeline Value', domain: 'SALES' as const, kpi: 'Qualified pipeline value (GBP)', order: 6,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Jay', role: 'A' as const },
      { personName: 'Jim', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },
  { slug: 'closed-revenue', title: 'Closed Revenue', domain: 'SALES' as const, kpi: 'Closed revenue (GBP)', order: 7,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Jay', role: 'A' as const },
      { personName: 'Jim', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },
  { slug: 'brand-positioning', title: 'Brand Positioning', domain: 'SALES' as const, kpi: 'Lead quality / engagement', order: 8,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Hannah', role: 'A' as const },
      { personName: 'Jem', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },
  { slug: 'crm-integrity', title: 'CRM Integrity', domain: 'SALES' as const, kpi: 'CRM accuracy %', order: 9,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Jay', role: 'A' as const },
      { personName: 'Iain', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },
  { slug: 'forecast-accuracy', title: 'Forecast Accuracy', domain: 'SALES' as const, kpi: 'Forecast vs actual % variance', order: 10,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Jay', role: 'A' as const },
      { personName: 'Iain', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },
  { slug: 'customer-retention', title: 'Customer Retention & Growth', domain: 'SALES' as const, kpi: 'Retention rate / expansion revenue', order: 11,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Jay', role: 'A' as const },
      { personName: 'Iain', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },

  // PRODUCT_PLATFORM (12-13)
  { slug: 'platform-uptime', title: 'Platform Uptime and Baseline Data (Trust, CCX, MyCarma)', domain: 'PRODUCT_PLATFORM' as const, kpi: 'Platform uptime %', order: 12,
    assignments: [
      { personName: 'Iain', role: 'R' as const },
      { personName: 'Matthew', role: 'A' as const, notes: 'Trust/CCX' },
      { personName: 'Greg', role: 'A' as const, notes: 'MyCarma' },
      { personName: 'Jarek', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },
  { slug: 'product-roadmap', title: 'Product Roadmap Delivery', domain: 'PRODUCT_PLATFORM' as const, kpi: 'Feature delivery velocity', order: 13,
    assignments: [
      { personName: 'Iain', role: 'R' as const },
      { personName: 'Matthew', role: 'A' as const },
      { personName: 'Greg', role: 'A' as const },
      { personName: 'Jarek', role: 'A' as const },
      { personName: 'Greg', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },

  // DELIVERY_MRV (14-16)
  { slug: 'client-delivery-quality', title: 'Client Delivery Quality', domain: 'DELIVERY_MRV' as const, kpi: 'Client satisfaction score', order: 14,
    assignments: [
      { personName: 'Iain', role: 'R' as const },
      { personName: 'Jay', role: 'A' as const },
      { personName: 'Greg', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },
  { slug: 'tree-survival-mrv', title: 'Tree Survival & Field Data MRV / Integrity', domain: 'DELIVERY_MRV' as const, kpi: 'Tree survival rate %', order: 15,
    assignments: [
      { personName: 'Iain', role: 'R' as const },
      { personName: 'Field Partners', role: 'A' as const },
      { personName: 'Jim', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },
  { slug: 'tree-planting-days', title: 'Tree Planting Days', domain: 'DELIVERY_MRV' as const, kpi: 'Tree survival rate %', order: 16,
    assignments: [
      { personName: 'Iain', role: 'R' as const },
      { personName: 'Jim', role: 'A' as const },
      { personName: 'Paul Webb', role: 'A' as const },
      { personName: 'Iain', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },

  // PEOPLE (17-18)
  { slug: 'hiring', title: 'Hiring', domain: 'PEOPLE' as const, kpi: 'Time to hire / role performance', order: 17,
    assignments: [
      { personName: 'Iain', role: 'R' as const },
      { personName: 'Team Managers', role: 'A' as const },
      { personName: 'Jim', role: 'C' as const },
      { personName: 'Board', role: 'I' as const, notes: 'Senior Roles' },
    ],
  },
  { slug: 'support-client-activation', title: 'Support & Client Activation', domain: 'PEOPLE' as const, kpi: 'Activation time / response time', order: 18,
    assignments: [
      { personName: 'Iain', role: 'R' as const, isTemporary: true },
      { personName: 'Jay', role: 'A' as const },
      { personName: 'Greg', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },

  // FINANCE (19-25)
  { slug: 'cash-visibility', title: 'Cash Visibility', domain: 'FINANCE' as const, kpi: 'Days cash on hand', order: 19,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Sally', role: 'A' as const },
      { personName: 'Ben', role: 'C' as const },
      { personName: 'Iain', role: 'I' as const },
    ],
  },
  { slug: 'runway-management', title: 'Runway Management', domain: 'FINANCE' as const, kpi: 'Months runway', order: 20,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Sally', role: 'A' as const },
      { personName: 'Iain', role: 'C' as const },
      { personName: 'Board', role: 'I' as const },
    ],
  },
  { slug: 'gross-margin', title: 'Gross Margin', domain: 'FINANCE' as const, kpi: 'Gross margin %', order: 21,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Finance', role: 'A' as const },
      { personName: 'Iain', role: 'C' as const },
      { personName: 'Board', role: 'I' as const },
    ],
  },
  { slug: 'commission-accuracy', title: 'Commission Calculation Accuracy', domain: 'FINANCE' as const, kpi: 'Commission accuracy %', order: 22,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Sally', role: 'A' as const },
      { personName: 'Hannah', role: 'C' as const },
      { personName: 'Iain', role: 'I' as const },
    ],
  },
  { slug: 'budget-approval', title: 'Budget Approval', domain: 'FINANCE' as const, kpi: 'Budget variance %', order: 23,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'Finance', role: 'A' as const },
      { personName: 'Iain', role: 'C' as const },
      { personName: 'Board', role: 'I' as const },
    ],
  },
  { slug: 'legal-compliance', title: 'Legal & Compliance', domain: 'FINANCE' as const, kpi: 'Zero compliance breaches', order: 24,
    assignments: [
      { personName: 'Jim', role: 'R' as const },
      { personName: 'External Advisors', role: 'A' as const },
      { personName: 'Iain', role: 'C' as const },
      { personName: 'Board', role: 'I' as const },
    ],
  },
  { slug: 'capital-allocation', title: 'Capital Allocation', domain: 'FINANCE' as const, kpi: 'Return on capital deployed', order: 25,
    assignments: [
      { personName: 'Jim', role: 'R' as const, isJointAccountable: true },
      { personName: 'Iain', role: 'R' as const, isJointAccountable: true },
      { personName: 'Finance', role: 'A' as const },
      { personName: 'Board', role: 'C' as const },
      { personName: 'Team', role: 'I' as const },
    ],
  },
]

async function main() {
  console.log('Seeding RACI data...')

  const existing = await prisma.raciVersion.findFirst({ orderBy: { versionNumber: 'desc' } })
  if (existing) {
    console.log(`RACI version ${existing.versionNumber} already exists. Skipping seed.`)
    return
  }

  const version = await prisma.raciVersion.create({
    data: { versionNumber: 1 },
  })

  for (const outcome of OUTCOMES) {
    const created = await prisma.raciOutcome.create({
      data: {
        slug: outcome.slug,
        title: outcome.title,
        domain: outcome.domain,
        kpi: outcome.kpi,
        order: outcome.order,
        versionId: version.id,
      },
    })

    for (const a of outcome.assignments) {
      await prisma.raciAssignment.create({
        data: {
          outcomeId: created.id,
          personName: a.personName,
          role: a.role,
          isJointAccountable: (a as any).isJointAccountable ?? false,
          isTemporary: (a as any).isTemporary ?? false,
          notes: (a as any).notes ?? null,
        },
      })
    }
  }

  console.log(`Seeded RACI v1 with ${OUTCOMES.length} outcomes.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
