import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const updates = [
  { slug: 'board',             description: 'Sets governance, approves strategy and major decisions, and ensures we deliver on our mission with integrity.' },
  { slug: 'c-suite',           description: 'Leads vision, strategy and culture — turning real impact into trusted evidence and building the climate platform people can trust.' },
  { slug: 'finance',           description: 'Manages funding, pricing and reporting — ensuring financial sustainability so we can scale impact and deliver long-term value.' },
  { slug: 'marketing',         description: "Tells Carma's story — brand, content and communications that amplify real impact and build trust with stakeholders." },
  { slug: 'sales',             description: 'Brings in partners and customers — growing revenue and relationships so more businesses can take credible climate action.' },
  { slug: 'operations',        description: 'Delivers projects on the ground — nature restoration, tree planting and social value programmes that create real outcomes.' },
  { slug: 'customer-services', description: 'Supports clients from onboarding to success — helping them track, verify and share their impact with confidence.' },
  { slug: 'development',       description: 'Builds the platform and data systems — MyCarma, verification tools and infrastructure that make evidence audit-ready.' },
  { slug: 'hr',                description: 'Grows and supports our people — hiring, development and culture so the team can deliver impact at their best.' },
]

async function main() {
  console.log('Updating team descriptions...')
  for (const { slug, description } of updates) {
    const result = await prisma.department.updateMany({
      where: { slug },
      data: { description },
    })
    console.log(`  ${slug}: ${result.count > 0 ? '✅' : '⚠️ not found'}`)
  }
  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
