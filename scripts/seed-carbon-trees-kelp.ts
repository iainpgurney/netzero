import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Carbon | Trees | Kelp module...')

  const course = await prisma.course.findUnique({
    where: { slug: 'new-starter' },
  })

  if (!course) {
    console.error('❌ New Starter course not found. Run seed-new-starter.ts first.')
    process.exit(1)
  }

  const existing = await prisma.module.findFirst({
    where: { courseId: course.id, title: 'Carbon | Trees | Kelp' },
  })

  if (existing) {
    console.log('⏭️ Carbon | Trees | Kelp already exists. Skipping to preserve user progress.')
    return
  }

  const maxOrder = await prisma.module.findFirst({
    where: { courseId: course.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  const order = (maxOrder?.order ?? 4) + 1

  const module = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Carbon | Trees | Kelp',
      description: 'How Carma benefits the environment and fights climate change. Understand carbon sequestration, trees, kelp, and how to explain Carma\'s impact.',
      order,
      duration: 35,
      badgeName: 'Climate Impact Champion',
      badgeEmoji: '🌊',
      content: JSON.stringify({
        sections: [
          {
            title: 'Climate Change in Simple Terms',
            content: `The Problem

Climate change is driven by excess greenhouse gases in the atmosphere.
The main one is carbon dioxide (CO2).

CO2 builds up when we:
• Burn fossil fuels
• Cut down forests
• Destroy natural ecosystems

More CO2 in the atmosphere means:
• Higher global temperatures
• Extreme weather events
• Rising sea levels
• Biodiversity loss
• Ecosystem instability

The Core Principle

If we want to fight climate change, we must:
1. Reduce emissions
2. Remove carbon from the atmosphere
3. Protect and restore natural ecosystems`,
          },
          {
            title: 'What Is Carbon Sequestration?',
            content: `Carbon sequestration is the process of capturing and storing carbon dioxide from the atmosphere.

Nature already does this through:
• Trees
• Forests
• Soil
• Oceans
• Kelp and marine ecosystems

Carma supports projects that increase natural carbon sequestration.

We do not just sell certificates.
We fund measurable environmental action.`,
          },
          {
            title: 'Trees: How They Help the Planet',
            content: `How Trees Fight Climate Change

Trees absorb CO2 during photosynthesis.
They store carbon in:
• Trunks
• Branches
• Roots
• Soil

This carbon can remain stored for decades or centuries if forests are protected.

Why Trees Matter Beyond Carbon

Trees also:
• Improve soil health
• Prevent erosion
• Increase biodiversity
• Support wildlife habitats
• Improve water cycles
• Create local employment
• Improve air quality

Tree planting is not just about carbon.
It is ecosystem restoration.

How Carma Uses Tree Projects

Carma:
• Funds tree planting projects
• Supports verified restoration programmes
• Tracks tree numbers and impact
• Converts activity into measurable environmental evidence

Key Message

Trees are a natural climate solution.
But they must be:
• Properly planted
• Monitored
• Protected long-term

Quality over quantity.`,
          },
          {
            title: "Kelp: The Ocean's Carbon Engine",
            content: `What Is Kelp?

Kelp is a fast-growing seaweed that forms underwater forests.

It grows extremely quickly and absorbs large amounts of CO2.

How Kelp Helps Fight Climate Change

Kelp:
• Absorbs carbon through photosynthesis
• Stores carbon in biomass
• Can contribute to long-term ocean carbon storage
• Restores marine ecosystems

Kelp forests also:
• Support marine biodiversity
• Improve water quality
• Provide habitat for fish
• Strengthen coastal resilience

Why Kelp Is Powerful

Unlike trees, kelp:
• Grows much faster
• Does not require land
• Helps restore damaged marine systems

Kelp is one of the most promising blue carbon solutions.

How Carma Supports Kelp

Carma:
• Funds kelp restoration initiatives
• Supports emerging blue carbon solutions
• Tracks impact
• Integrates kelp into environmental reporting frameworks

Key Message

Climate action is not land-only.
Oceans are critical.`,
          },
          {
            title: "Carma's Approach",
            content: `Carma is not just funding projects.
Carma delivers:

Action
Measurement
Verification

Action:
• Tree planting
• Kelp restoration
• Nature recovery
• Social value programmes

Measurement:
• Carbon impact
• Project data
• Environmental metrics

Verification:
• Evidence-based reporting
• Audit-ready outputs
• Transparent documentation

We focus on:
• Real projects
• Real outcomes
• Real evidence

We avoid:
• Vague claims
• Unverified offsets
• Low-integrity credits`,
          },
          {
            title: "How to Explain Carma's Impact",
            content: `If someone asks:

"What does Carma actually do for the environment?"

Simple Answer:

Carma funds and verifies real-world nature projects like tree planting and kelp restoration that remove carbon from the atmosphere and restore ecosystems. We then track and evidence that impact so businesses can prove their climate action credibly.

If someone asks:

"Is this just carbon offsetting?"

Answer:

Carma focuses on measurable environmental action supported by data and verification. Carbon credits are an output of real projects, not the starting point.`,
          },
          {
            title: 'Limitations and Honesty',
            content: `It is important to understand:

• Trees are not a substitute for reducing emissions.
• Nature-based solutions take time.
• Carbon removal must be combined with emission reduction.

Carma supports climate mitigation, but:
The first priority must always be emission reduction.

Integrity matters.`,
          },
          {
            title: 'Summary',
            content: `Carma fights climate change by:

• Funding natural carbon removal through trees and kelp
• Supporting ecosystem restoration
• Creating measurable, transparent environmental evidence
• Enabling credible climate action

We turn environmental action into trusted proof.

That is how we protect climate, nature, and integrity.`,
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'How do trees remove carbon from the atmosphere?',
            options: JSON.stringify([
              'Through respiration only',
              'Through photosynthesis — they absorb CO2 and store carbon in trunks, branches, roots, and soil',
              'By filtering water',
              'Through wind dispersal',
            ]),
            correctAnswer: 1,
            explanation: 'Trees absorb CO2 during photosynthesis and store carbon in their biomass (trunks, branches, roots) and in the soil. This carbon can remain stored for decades or centuries if forests are protected.',
            order: 1,
          },
          {
            question: 'What makes kelp different from trees in climate impact?',
            options: JSON.stringify([
              'Kelp does not absorb carbon',
              'Kelp grows much faster, does not require land, and helps restore damaged marine systems',
              'Trees are more effective than kelp',
              'Kelp only grows in tropical waters',
            ]),
            correctAnswer: 1,
            explanation: 'Kelp grows extremely quickly, does not require land, and helps restore damaged marine ecosystems. It is one of the most promising blue carbon solutions.',
            order: 2,
          },
          {
            question: 'Why is verification important in climate action?',
            options: JSON.stringify([
              'It is not important — trust is enough',
              'Verification ensures evidence-based reporting, audit-ready outputs, and transparent documentation so impact is credible',
              'Only for marketing purposes',
              'Verification is optional for small projects',
            ]),
            correctAnswer: 1,
            explanation: 'Verification creates measurable, transparent environmental evidence. It enables credible climate action and ensures we avoid vague claims and low-integrity credits.',
            order: 3,
          },
          {
            question: 'What are the three things we must do to fight climate change?',
            options: JSON.stringify([
              'Plant trees, fund kelp, sell credits',
              'Reduce emissions, remove carbon from the atmosphere, protect and restore natural ecosystems',
              'Measure, report, market',
              'Build software, track data, scale',
            ]),
            correctAnswer: 1,
            explanation: 'The core principle: we must reduce emissions, remove carbon from the atmosphere, and protect and restore natural ecosystems.',
            order: 4,
          },
          {
            question: 'What is Carma\'s approach to delivering environmental impact?',
            options: JSON.stringify([
              'Selling certificates first',
              'Action, Measurement, Verification — real projects, real outcomes, real evidence',
              'Marketing and branding only',
              'Software as the primary product',
            ]),
            correctAnswer: 1,
            explanation: 'Carma delivers Action (tree planting, kelp restoration, nature recovery), Measurement (carbon impact, project data), and Verification (evidence-based reporting, audit-ready outputs).',
            order: 5,
          },
        ],
      },
    },
  })

  console.log('✅ Created module: Carbon | Trees | Kelp (5 quiz questions)')
  console.log(`   Module ID: ${module.id}`)
  console.log(`   Order: ${order}`)
  console.log('\n🎉 Carbon | Trees | Kelp module seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
