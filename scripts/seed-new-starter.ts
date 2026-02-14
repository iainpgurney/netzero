import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding New Starter Training course...')

  // Check if course already exists
  const existing = await prisma.course.findUnique({
    where: { slug: 'new-starter' },
  })

  if (existing) {
    console.log('⚠️ New Starter course already exists, deleting and recreating...')
    await prisma.course.delete({ where: { slug: 'new-starter' } })
  }

  // Create New Starter Training Course
  const course = await prisma.course.create({
    data: {
      slug: 'new-starter',
      title: 'New Starter Training',
      description: 'Everything you need to get up to speed at Carma. Company overview, product walkthrough, systems training and compliance essentials.',
      icon: '🚀',
      isActive: true,
    },
  })
  console.log('✅ Created course: New Starter Training')

  // Module 1: Company Overview
  const companyOverview = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Company Overview',
      description: 'Understand what Carma exists to do, how we are different, what we say yes and no to, and how your role connects to real-world impact.',
      order: 1,
      duration: 30,
      badgeName: 'Carma Foundations',
      badgeEmoji: '🏛️',
      content: JSON.stringify({
        sections: [
          {
            title: 'Who We Are',
            content: `Carma is building the world's most trusted climate marketplace.

That does not mean a typical marketplace where products are simply bought and sold.

It means:
• Climate, nature, and social outcomes are converted into verifiable assets
• Evidence comes before transactions
• Trust is built on data quality, not branding

We operate across:
• 7 countries
• 600+ customers
• 120+ supported projects

But scale is not the point. Integrity is.`,
          },
          {
            title: 'Our Vision',
            content: `The world's most trusted climate marketplace.

In practical terms, this means:
• Climate includes carbon AND nature capital
• Social value is treated as a core input, not an afterthought
• Evidence is reusable across reporting, compliance, procurement, and claims
• Transactions only follow verified data

We are not here to sell green claims.
We are here to build defensible, audit-ready outcomes.`,
          },
          {
            title: 'Our Mission',
            content: `To equip businesses with credible sustainability solutions that drive real change and competitive advantage.

Key clarification — Solutions = action + evidence.

Not software alone. Not certificates alone. Not marketing claims.

Real change means:
• Trees planted
• Ecosystems restored
• Veterans employed
• Communities supported

Competitive advantage means:
• Reduced regulatory risk
• Stronger audit defensibility
• Faster procurement decisions
• Higher integrity reporting`,
          },
          {
            title: 'The Carma Way',
            content: `We put people first.
We build partnerships.
We deliver real-world action.
We convert that action into trusted, reusable evidence.

Carbon credits:
• Are an output, not the product
• Only exist where integrity thresholds are met

Tree planting:
• Is core delivery, not a marketing activity
• Feeds directly into measurement and reporting

Technology:
• Supports verification
• Does not replace ecology or human expertise`,
          },
          {
            title: 'What We Do Not Do',
            content: `We do NOT:
• Resell low-integrity third-party credits
• Operate as a pure broker
• Sell claims without primary evidence
• Rely on unverifiable estimates
• Build products that weaken our ability to defend claims in 2026 and beyond

If it does not:
1. Improve real-world environmental or social outcomes
AND
2. Strengthen evidence quality

It does not belong at Carma.`,
          },
          {
            title: 'Our Operating Model',
            content: `Everything sits inside one loop:

Action → Measurement → Verification

Action:
• Nature restoration
• Tree planting
• Veteran employment
• Social value delivery

Measurement:
• Ecological assessment
• Environmental monitoring
• Social value capture

Verification:
• Audit-ready datasets
• Third-party compatible evidence
• Clear scope and defined limits

Nothing skips this loop. Nothing bypasses evidence.`,
          },
          {
            title: 'Transparency and Giving Back',
            content: `Core principles:

Transparency:
We openly communicate what we measure, how we measure it, and where the limits are. We define scope clearly. We do not overclaim.

Giving Back:
Impact is not abstract. It is delivered through tangible projects. Community and environmental benefits are built into our operating model.

Accountability:
Every claim must be defendable. Every dataset must be explainable. Every outcome must be traceable.`,
          },
          {
            title: 'Your Responsibility as a Carma Team Member',
            content: `Regardless of your role, you are responsible for protecting trust.

Before launching, selling, designing, or approving anything, ask:

1. Does this improve real-world environmental or social outcomes?
2. Does this strengthen the quality of our evidence?
3. Could we defend this in an audit in 2026 or beyond?
4. Are we clear about scope and limitations?

If the answer is unclear, escalate.
Integrity always wins over speed.`,
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What makes Carma different from a traditional carbon broker?',
            options: JSON.stringify([
              'We sell the highest volume of carbon credits',
              'We convert climate, nature and social outcomes into verifiable assets with evidence before transactions',
              'We focus primarily on marketing green claims to businesses',
              'We operate as a pure marketplace connecting buyers and sellers',
            ]),
            correctAnswer: 1,
            explanation: 'Carma is not a typical broker. We convert outcomes into verifiable assets where evidence comes before transactions and trust is built on data quality.',
            order: 1,
          },
          {
            question: 'Why are carbon credits considered an output rather than the primary product at Carma?',
            options: JSON.stringify([
              'Because carbon credits are not profitable',
              'Because they only exist where integrity thresholds are met — the real product is verified action and evidence',
              'Because Carma does not deal in carbon credits at all',
              'Because carbon credits are only sold to government bodies',
            ]),
            correctAnswer: 1,
            explanation: 'Carbon credits are an output, not the product. They only exist where integrity thresholds are met. The real product is the verified action and the trusted evidence behind it.',
            order: 2,
          },
          {
            question: 'What is the correct order of Carma\'s operating model loop?',
            options: JSON.stringify([
              'Verification → Action → Measurement',
              'Measurement → Verification → Action',
              'Action → Measurement → Verification',
              'Action → Verification → Measurement',
            ]),
            correctAnswer: 2,
            explanation: 'The operating loop is Action → Measurement → Verification. Nothing skips this loop and nothing bypasses evidence.',
            order: 3,
          },
          {
            question: 'Which of the following would Carma say NO to?',
            options: JSON.stringify([
              'Restoring a degraded ecosystem and measuring the outcomes',
              'Reselling low-integrity third-party credits without primary evidence',
              'Converting verified social value into reusable evidence',
              'Building audit-ready datasets with clear scope and limits',
            ]),
            correctAnswer: 1,
            explanation: 'Carma does not resell low-integrity third-party credits, operate as a pure broker, or sell claims without primary evidence.',
            order: 4,
          },
          {
            question: 'Before launching, selling or approving anything at Carma, what should you ask yourself?',
            options: JSON.stringify([
              'Will this increase our revenue this quarter?',
              'Does this improve real-world outcomes AND strengthen our evidence quality?',
              'Is this what our competitors are doing?',
              'Will this generate the most carbon credits possible?',
            ]),
            correctAnswer: 1,
            explanation: 'Every decision should pass two tests: does it improve real-world environmental or social outcomes, and does it strengthen evidence quality. If the answer is unclear, escalate.',
            order: 5,
          },
        ],
      },
    },
  })
  console.log('✅ Created module: Company Overview (5 quiz questions)')

  console.log('\n🎉 New Starter Training course seeded successfully!')
  console.log(`   Course ID: ${course.id}`)
  console.log(`   Module ID: ${companyOverview.id}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
