import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Product Walkthrough module...')

  // Find the new-starter course
  const course = await prisma.course.findUnique({
    where: { slug: 'new-starter' },
  })

  if (!course) {
    console.error('❌ New Starter course not found. Run seed-new-starter.ts first.')
    process.exit(1)
  }

  // Skip if module exists — never delete (preserves UserProgress & Badges)
  const existing = await prisma.module.findFirst({
    where: { courseId: course.id, order: 2 },
  })
  if (existing) {
    console.log('⏭️ Product Walkthrough already exists. Skipping to preserve user progress.')
    return
  }

  // Module 2: Product Walkthrough
  const productWalkthrough = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Product Walkthrough',
      description: 'Learn how to demo MyCarma, explain every marketing asset, and position Carma as action + evidence + amplification.',
      order: 2,
      duration: 45,
      badgeName: 'Product Expert',
      badgeEmoji: '🖥️',
      content: JSON.stringify({
        sections: [
          {
            title: 'Start With the Why',
            content: `Before touching the product, frame it properly.

Carma is not just funding projects. We help businesses:

1. Take real climate and social action
2. Track it transparently
3. Prove it with evidence
4. Share it confidently

The Marketing Pack exists to help customers amplify verified impact.`,
          },
          {
            title: 'MyCarma Dashboard',
            content: `Positioning: "MyCarma is your impact command centre."

Key talking points when demoing:
• Live impact metrics
• Trees funded
• Tonnes CO2 removed
• Donations to veterans
• Social impact breakdown
• Monthly environmental impact
• Community support contributions

Walkthrough steps:
1. Log into MyCarma
2. Open the dashboard
3. Highlight live counters
4. Show environmental vs social split
5. Emphasise: This is real-time, audit-ready data

Key message: Everything is measurable. Nothing is vague.`,
          },
          {
            title: 'Logos and Brand Alignment',
            content: `What to show:
• SVG and PNG downloads
• Different logo variations
• Light and dark versions

Position it as: "Brand alignment with verified impact."

• Customers can use the logo once they partner with Carma
• Assets are downloaded directly from MyCarma
• Usage should follow brand guidelines

Keep it tight. This is enablement, not decoration.`,
          },
          {
            title: 'Email Signatures',
            content: `Demo flow:
1. Show signature options
2. Explain they are added beneath existing email signatures
3. Emphasise passive daily amplification

Message to customer: "Every email becomes proof of action."

This is low effort, high visibility.`,
          },
          {
            title: 'Impact Map',
            content: `This is one of the strongest features.

Show:
• 2D map view
• 3D map view
• Global project coverage

Explain:
• Customisable
• Embedded on their own website
• Powered directly from live data

Key positioning: "This turns your climate action into visible, location-based proof."

It moves from claim to visual evidence.`,
          },
          {
            title: 'Website Badges',
            content: `Demo the badge variations:
• Horizontal white
• Horizontal black
• Vertical white
• Vertical black

Click "Copy Embed Code."

Explain:
• These are live counters
• They auto-update
• No manual edits required

Positioning: "If your impact grows, your badge grows with it."`,
          },
          {
            title: 'Social Media Assets',
            content: `Walkthrough:
1. Show downloadable LinkedIn and Meta formats
2. Explain pre-sized dimensions
3. Show milestone graphics (1,000 trees, 5,000 trees, etc.)
4. Open the pre-written caption templates

Stress that copy is editable but structured to include:
• Impact numbers
• Veteran support mention
• Partner tagging
• Hashtags

Engagement strategy:
• Tag @Carma
• Tag @HighGroundCharity
• Tag @StandingTallFoundation
• More comments = more reach

Key message: Impact should be shared, not hidden.`,
          },
          {
            title: 'Impact Certificates and Project Imagery',
            content: `Impact Certificates — formal proof:
• Open certificate and show tree totals
• Highlight project details
• Show downloadable PDF

Use cases: ESG reporting, internal comms, procurement documentation, investor decks.

This is evidence, not marketing fluff.

Project Imagery — real world proof:
• UK tree planting
• Africa tree planting
• USA projects
• Brazil projects
• Canada kelp projects

All imagery is dated, curated, and authentic.

Key positioning: "You are not buying a certificate. You are funding real-world action."`,
          },
          {
            title: 'Public Profile, Referrals and Bespoke Assets',
            content: `Public Profile Page (Coming Soon):
• Mini impact website, customisable, shareable link
• Position as: "Your own impact microsite powered by Carma."

Referral Programme:
• Show referral dashboard — total referrals, trees earned, financial value
• Positioning: "Grow your impact by growing the network."
• Supports community growth, more trees planted, more veterans supported

Bespoke Assets:
• Custom graphics available
• Branded overlays and company logo integration
• Contact marketing@carma.earth
• Position as: "Enterprise-ready support."`,
          },
          {
            title: 'How to Run a Perfect Demo',
            content: `Use this order:
1. Start with dashboard (proof)
2. Show impact map (visual)
3. Show badges (live embedding)
4. Show certificate (formal evidence)
5. Show social assets (amplification)
6. Close with referral programme (growth loop)

Never start with logos.
Never lead with marketing graphics.
Always lead with measurable impact.

Key messages to reinforce during every walkthrough:
• Impact is real
• Data is live
• Evidence is reusable
• Social value is embedded
• Veterans benefit
• Nothing is static or symbolic

The product is not the assets. The product is: Action. Measurement. Verification. Amplification.

MyCarma simply makes that visible.

If you cannot clearly explain how a feature strengthens trust, you are not ready to demo it. Master the story. Then master the screen.`,
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What should you always lead with when demoing MyCarma?',
            options: JSON.stringify([
              'Logos and brand assets',
              'Social media templates',
              'The dashboard showing measurable, real-time impact data',
              'The referral programme',
            ]),
            correctAnswer: 2,
            explanation: 'Always lead with measurable impact. Start with the dashboard showing live, audit-ready data — never start with logos or marketing graphics.',
            order: 1,
          },
          {
            question: 'What is the correct positioning for MyCarma?',
            options: JSON.stringify([
              'A marketing tool for green claims',
              'Your impact command centre with real-time, audit-ready data',
              'A social media scheduling platform',
              'A carbon credit trading dashboard',
            ]),
            correctAnswer: 1,
            explanation: 'MyCarma is positioned as "your impact command centre" — showing live impact metrics, environmental vs social split, and audit-ready data.',
            order: 2,
          },
          {
            question: 'What makes the Impact Map one of the strongest features?',
            options: JSON.stringify([
              'It looks visually impressive in presentations',
              'It turns climate action into visible, location-based proof embedded on their website',
              'It shows a list of all Carma customers',
              'It replaces the need for impact certificates',
            ]),
            correctAnswer: 1,
            explanation: 'The Impact Map is powerful because it turns climate action into visible, location-based proof — customisable, embeddable on their own website, and powered by live data.',
            order: 3,
          },
          {
            question: 'What is the correct demo order?',
            options: JSON.stringify([
              'Logos → Social → Badges → Certificate → Dashboard',
              'Dashboard → Impact Map → Badges → Certificate → Social Assets → Referral Programme',
              'Referral Programme → Certificate → Dashboard → Logos',
              'Social Assets → Email Signatures → Logos → Dashboard',
            ]),
            correctAnswer: 1,
            explanation: 'The correct order is: Dashboard (proof) → Impact Map (visual) → Badges (embedding) → Certificate (evidence) → Social Assets (amplification) → Referral Programme (growth loop).',
            order: 4,
          },
          {
            question: 'How should you position Impact Certificates to a customer?',
            options: JSON.stringify([
              'As a nice-to-have marketing graphic',
              'As formal documentation and evidence for ESG reporting, procurement, and investor decks',
              'As a replacement for the dashboard',
              'As a social media asset to post on LinkedIn',
            ]),
            correctAnswer: 1,
            explanation: 'Impact Certificates are formal documentation — used for ESG reporting, internal comms, procurement documentation, and investor decks. This is evidence, not marketing fluff.',
            order: 5,
          },
        ],
      },
    },
  })
  console.log('✅ Created module: Product Walkthrough (5 quiz questions)')

  console.log('\n🎉 Product Walkthrough module seeded successfully!')
  console.log(`   Module ID: ${productWalkthrough.id}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
