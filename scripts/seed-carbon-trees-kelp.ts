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
    include: { quizzes: true },
  })

  const contentData = {
    sections: [
      {
        title: 'What Is the Problem with Carbon?',
        content: `Short answer: none. Carbon is essential for life. The real problem is our consumption of it.

Carbon is in our cells, in our food, in the air around us, and locked deep underground as fossil fuels.

Think of it like a bank account.

For most of human history, carbon flowed in a natural cycle. Plants absorb CO2. Animals eat plants. We exhale it back. The system roughly balanced.

But fossil fuels changed the equation.

We started withdrawing carbon that had been locked underground for millions of years and spending it like a never-ending supply of free energy.

Now we are massively overdrawn on our carbon account. The atmosphere is carrying a debt built up over 150 years of industrialisation.

That is the real problem.`,
      },
      {
        title: 'Where Do Carbon Credits Fit?',
        content: `A carbon credit is simply a certificate. One credit equals one tonne of CO2 removed or avoided.

And just like money, it only has value if it is backed by something real.

No real impact, no real value.

Now, the elephant in the room. The carbon credit market has had serious issues — scandals and bad actors. Here are simpler, everyday analogies anyone can grasp.

Additionality
If the project would have happened anyway, the credit changes nothing. It is like saying you are on a diet because you skipped dessert… but you never eat dessert anyway. Big so what.

Over-crediting
Issuing more credits than real impact. It is like a shop selling 100 gift vouchers when they only have 60 products in stock. The maths does not add up.

Permanence
If the carbon goes back into the air later, the benefit is temporary. It is like mopping up water from a leak but not fixing the pipe. It looks dry for now, but the problem comes back.

Leakage
Emissions move instead of stopping. It is like squeezing a balloon. You push the air down in one place, it pops up somewhere else.

Double counting
The same tonne claimed twice. It is like two people trying to use the same concert ticket to get through the door. Only one of them can be right.

Greenwashing
Using credits instead of cutting your own pollution. It is like paying someone to go to the gym for you and claiming you got fit.

Transparency
If you cannot see where it came from, you cannot trust it. It is like buying a diamond with no certificate. Maybe it is real. Maybe it is not. You need proof.`,
      },
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
  }

  const quizData = [
    {
      question: 'What is the real problem with carbon?',
      options: JSON.stringify([
        'Carbon itself is toxic and harmful',
        'Carbon is essential for life; the real problem is our consumption of it — we have overdrawn our carbon account',
        'Carbon only exists in fossil fuels',
        'Carbon cannot be stored naturally',
      ]),
      correctAnswer: 1,
      explanation: 'Carbon is essential for life. The real problem is our consumption — we have been withdrawing carbon locked underground for millions of years and spending it like a never-ending supply, leaving the atmosphere massively overdrawn.',
      order: 1,
    },
    {
      question: 'What is a carbon credit?',
      options: JSON.stringify([
        'A tax on carbon emissions',
        'A certificate — one credit equals one tonne of CO2 removed or avoided; it only has value if backed by something real',
        'A government subsidy for green energy',
        'A type of fossil fuel',
      ]),
      correctAnswer: 1,
      explanation: 'A carbon credit is simply a certificate. One credit equals one tonne of CO2 removed or avoided. Like money, it only has value if backed by something real. No real impact, no real value.',
      order: 2,
    },
    {
      question: 'What does "additionality" mean in carbon credits?',
      options: JSON.stringify([
        'The project creates additional biodiversity',
        'If the project would have happened anyway, the credit changes nothing — like claiming a diet win for skipping dessert you never eat',
        'The buyer purchases extra credits for safety',
        'The credit is additional to government regulations',
      ]),
      correctAnswer: 1,
      explanation: 'Additionality means the emissions reduction would not have occurred without the credit. If the project would have happened anyway, the credit changes nothing. Big so what.',
      order: 3,
    },
    {
      question: 'What is "over-crediting"?',
      options: JSON.stringify([
        'Credits that cost too much',
        'Issuing more credits than real impact — like a shop selling 100 gift vouchers when they only have 60 products',
        'Credits from overseas projects',
        'Credits that are verified twice',
      ]),
      correctAnswer: 1,
      explanation: 'Over-crediting means issuing more credits than the real impact. The maths does not add up.',
      order: 4,
    },
    {
      question: 'What does "permanence" mean in carbon credits?',
      options: JSON.stringify([
        'The company that issued the credit is permanent',
        'If the carbon goes back into the air later, the benefit is temporary — like mopping a leak but not fixing the pipe',
        'The credit price stays the same forever',
        'The project must run for 100 years',
      ]),
      correctAnswer: 1,
      explanation: 'Permanence means the carbon must stay stored. If it goes back into the air later, the benefit is temporary. It looks dry for now, but the problem comes back.',
      order: 5,
    },
    {
      question: 'What is "leakage" in carbon credits?',
      options: JSON.stringify([
        'Money leaking from the project',
        'Emissions move instead of stopping — like squeezing a balloon: push air down in one place, it pops up somewhere else',
        'Carbon leaking from storage tanks',
        'Data being lost in reporting',
      ]),
      correctAnswer: 1,
      explanation: 'Leakage means emissions move instead of stopping. You push the air down in one place, it pops up somewhere else.',
      order: 6,
    },
    {
      question: 'What is "double counting" in carbon credits?',
      options: JSON.stringify([
        'Counting credits twice in your inventory',
        'The same tonne claimed twice — like two people trying to use the same concert ticket',
        'Buying credits from two different projects',
        'Reporting carbon in two different units',
      ]),
      correctAnswer: 1,
      explanation: 'Double counting means the same tonne is claimed twice. It is like two people trying to use the same concert ticket to get through the door. Only one of them can be right.',
      order: 7,
    },
    {
      question: 'What is "greenwashing" in the context of carbon credits?',
      options: JSON.stringify([
        'Using green packaging for credits',
        'Using credits instead of cutting your own pollution — like paying someone to go to the gym for you and claiming you got fit',
        'Planting trees in urban areas',
        'Reporting carbon data in a green colour',
      ]),
      correctAnswer: 1,
      explanation: 'Greenwashing is using credits instead of cutting your own pollution. It is like paying someone to go to the gym for you and claiming you got fit.',
      order: 8,
    },
    {
      question: 'Why does transparency matter in carbon credits?',
      options: JSON.stringify([
        'It makes the credits more expensive',
        'If you cannot see where it came from, you cannot trust it — like buying a diamond with no certificate',
        'Transparency is only required for large companies',
        'It is optional for voluntary credits',
      ]),
      correctAnswer: 1,
      explanation: 'If you cannot see where a credit came from, you cannot trust it. It is like buying a diamond with no certificate. Maybe it is real. Maybe it is not. You need proof.',
      order: 9,
    },
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
      order: 10,
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
      order: 11,
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
      order: 12,
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
      order: 13,
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
      order: 14,
    },
  ]

  if (existing) {
    console.log('📝 Carbon | Trees | Kelp already exists. Updating with new content and quiz questions...')
    await prisma.quiz.deleteMany({ where: { moduleId: existing.id } })
    await prisma.module.update({
      where: { id: existing.id },
      data: {
        content: JSON.stringify(contentData),
        duration: 45,
      },
    })
    for (const q of quizData) {
      await prisma.quiz.create({
        data: { ...q, moduleId: existing.id },
      })
    }
    console.log('✅ Updated module: Carbon | Trees | Kelp (14 quiz questions)')
    console.log(`   Module ID: ${existing.id}`)
    console.log('\n🎉 Carbon | Trees | Kelp updated successfully!')
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
      duration: 45,
      badgeName: 'Climate Impact Champion',
      badgeEmoji: '🌊',
      content: JSON.stringify(contentData),
      quizzes: {
        create: quizData,
      },
    },
  })

  console.log('✅ Created module: Carbon | Trees | Kelp (14 quiz questions)')
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
