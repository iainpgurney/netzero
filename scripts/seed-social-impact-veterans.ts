import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Social Impact | Veterans | Community Value module...')

  const course = await prisma.course.findUnique({
    where: { slug: 'new-starter' },
  })

  if (!course) {
    console.error('❌ New Starter course not found. Run seed-new-starter.ts first.')
    process.exit(1)
  }

  // Skip if module exists — never delete (preserves UserProgress & Badges)
  const existing = await prisma.module.findFirst({
    where: { courseId: course.id, title: 'Social Impact | Veterans | Community Value' },
  })
  if (existing) {
    console.log('⏭️ Social Impact | Veterans | Community Value already exists. Skipping to preserve user progress.')
    return
  }

  const maxOrder = await prisma.module.findFirst({
    where: { courseId: course.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  const order = (maxOrder?.order ?? 5) + 1

  const module = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Social Impact | Veterans | Community Value',
      description: 'How Carma delivers measurable social impact. Understand veteran employment, VSV Certificates, and how to explain Carma\'s social value.',
      order,
      duration: 35,
      badgeName: 'Social Impact Champion',
      badgeEmoji: '🤝',
      content: JSON.stringify({
        sections: [
          {
            title: 'Social Impact Is Not a Side Project',
            content: `At Carma, social impact is not a marketing layer.

It is part of our operating model.

Veterans are not beneficiaries on the sidelines.
They are directly involved in delivering UK nature restoration projects.

This means:

• Restoration work is physically executed by UK Veterans.
• Veteran employment is embedded into project delivery.
• Social outcomes are measurable and linked to each project.

This is the social engine of the business.`,
          },
          {
            title: 'Armed Forces Covenant (Silver Award)',
            content: `Carma is a Silver Award member of the Armed Forces Covenant.

This means:

• We have formal policies supporting veteran employment.
• We are independently recognised for supporting veterans and their families.
• We actively create pathways for Armed Forces personnel into civilian careers.

This is not symbolic.
It is externally validated commitment.

Key Message:

We do not simply support veterans in principle.
We integrate them into delivery.`,
          },
          {
            title: 'Direct Veteran Employment',
            content: `Our UK restoration projects are led by UK Veterans.

Why this matters:

Veterans bring:
• Precision
• Discipline
• Operational planning skills
• Field execution capability

This strengthens:

• On-site verification
• Planting accuracy
• Project reliability
• Quality control

Veterans are our "boots on the ground."

They help ensure that restoration work:
• Actually happens
• Is executed correctly
• Is defensible under audit

This is social impact tied directly to environmental integrity.`,
          },
          {
            title: 'Financial Commitment & Training',
            content: `Carma commits 3% of solution revenue to veteran-focused charity partners.

For UK tree projects:
• We support HighGround
• We support Standing Tall Foundation

This funding provides:

• Mental health support
• Reintegration assistance
• Technical retraining
• Pathways into green and climate careers

This creates:

• Stable employment opportunities
• Long-term career transitions
• Skills development in emerging sectors

Key Principle:

Every environmental project supports both planet and people.`,
          },
          {
            title: 'VSV (Veteran Social Value) Certificates',
            content: `Carma does not rely on storytelling.

We provide VSV Certificates.

These are:

• Audit-ready
• Project-specific
• Linked to real veteran employment hours
• Linked to measurable wellbeing outcomes

Clients can view these inside the MyCarma platform.

What this means:

If a client funds a UK restoration project,
they can see:

• Veteran hours created
• Social value generated
• Economic impact delivered

This turns community support into defensible evidence.`,
          },
          {
            title: 'UK Economic Impact',
            content: `For UK products, Carma maintains:

100% UK supply chain retention.

This ensures:

• Every pound spent stays in the UK economy.
• Local veteran businesses benefit.
• Regional suppliers are supported.
• Economic value is not exported.

This strengthens:

• Local resilience
• Veteran-led enterprise
• Community reinvestment

Social impact is not abstract.
It is geographically grounded.`,
          },
          {
            title: "How This Fits Into Carma's Model",
            content: `Carma integrates:

Environmental Impact
+
Social Impact
+
Economic Retention

Into a single loop.

Environmental action creates:
• Tree planting
• Habitat restoration

Social impact creates:
• Veteran employment
• Skills development
• Mental health support

Economic impact creates:
• Local business support
• Regional value retention

All of this is:
Measured
Documented
Verifiable`,
          },
          {
            title: "How to Explain Carma's Social Impact",
            content: `If someone asks:

"How does Carma create social impact?"

Answer:

Carma integrates UK veterans directly into our nature restoration work, funds veteran support and retraining through our charity partners, and provides audit-ready evidence of real employment hours and social value created by each project.

If someone asks:

"Is this just CSR?"

Answer:

No. Veteran employment is embedded into project delivery. It strengthens execution, verification, and quality. Social value is a structural part of the model, not a donation add-on.`,
          },
          {
            title: 'What Makes This Defensible',
            content: `Carma's social impact is:

• Independently recognised (Armed Forces Covenant Silver Award)
• Directly linked to employment
• Financially committed (3% revenue allocation)
• UK supply chain retained
• Measured and documented (VSV Certificates)

This allows clients to:

• Include veteran employment in tenders
• Demonstrate social value under audit
• Meet procurement social value criteria
• Prove impact, not just claim it`,
          },
          {
            title: 'Summary',
            content: `Carma does not treat social impact as a story.

We:

• Employ veterans in real restoration work
• Fund veteran mental health and retraining
• Retain UK economic value
• Provide audit-ready evidence of social outcomes

We turn community support into measurable, defensible social value.

Planet and people.
Delivered together.`,
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'How are veterans directly involved in Carma\'s projects?',
            options: JSON.stringify([
              'They receive donations only',
              'UK restoration projects are led by UK Veterans — they physically execute restoration work and bring precision, discipline, and operational skills',
              'They advise from the sidelines',
              'They work only in marketing',
            ]),
            correctAnswer: 1,
            explanation: 'Veterans are our "boots on the ground." They lead UK restoration projects, execute the work, and strengthen on-site verification, planting accuracy, and quality control.',
            order: 1,
          },
          {
            question: 'What does the 3% revenue commitment fund?',
            options: JSON.stringify([
              'General marketing',
              'Mental health support, reintegration assistance, technical retraining, and pathways into green careers through HighGround and Standing Tall Foundation',
              'Carbon offset purchases',
              'Office overheads',
            ]),
            correctAnswer: 1,
            explanation: 'Carma commits 3% of solution revenue to veteran-focused charity partners (HighGround, Standing Tall Foundation) for mental health support, reintegration, retraining, and green career pathways.',
            order: 2,
          },
          {
            question: 'What is a VSV Certificate?',
            options: JSON.stringify([
              'A marketing brochure',
              'An audit-ready, project-specific certificate linked to real veteran employment hours and measurable wellbeing outcomes, viewable in MyCarma',
              'A carbon credit',
              'An internal training document',
            ]),
            correctAnswer: 1,
            explanation: 'VSV (Veteran Social Value) Certificates are audit-ready, project-specific evidence linked to real veteran employment hours and measurable wellbeing outcomes. Clients can view them in MyCarma.',
            order: 3,
          },
          {
            question: 'Why does UK supply chain retention matter?',
            options: JSON.stringify([
              'It reduces costs',
              'Every pound spent stays in the UK economy — local veteran businesses benefit, regional suppliers are supported, and economic value is not exported',
              'It speeds up delivery',
              'It simplifies logistics',
            ]),
            correctAnswer: 1,
            explanation: '100% UK supply chain retention ensures local veteran businesses benefit, regional suppliers are supported, and economic value strengthens local resilience and community reinvestment.',
            order: 4,
          },
          {
            question: 'How would you explain Carma\'s social impact in two sentences?',
            options: JSON.stringify([
              'Carma plants trees and sells carbon credits.',
              'Carma integrates UK veterans directly into nature restoration work, funds veteran support and retraining through charity partners, and provides audit-ready evidence of real employment hours and social value created by each project. Social value is a structural part of the model, not a donation add-on.',
              'Carma donates to veterans.',
              'Carma has a CSR programme.',
            ]),
            correctAnswer: 1,
            explanation: 'Carma embeds veteran employment into project delivery, funds support through partners, and provides audit-ready evidence. Social value is structural, not a donation add-on.',
            order: 5,
          },
        ],
      },
    },
  })

  console.log('✅ Created module: Social Impact | Veterans | Community Value (5 quiz questions)')
  console.log(`   Module ID: ${module.id}`)
  console.log(`   Order: ${order}`)
  console.log('\n🎉 Social Impact | Veterans | Community Value module seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
