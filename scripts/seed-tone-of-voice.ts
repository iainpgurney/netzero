import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Carma Tone of Voice module...')

  const course = await prisma.course.findUnique({
    where: { slug: 'new-starter' },
  })

  if (!course) {
    console.error('❌ New Starter course not found. Run seed-new-starter.ts first.')
    process.exit(1)
  }

  const existing = await prisma.module.findFirst({
    where: { courseId: course.id, title: 'Carma Tone of Voice' },
    include: { quizzes: true },
  })

  const contentData = {
    sections: [
      {
        title: 'Who We Are',
        content: `Carma speaks as a community, not a corporation.

We believe climate action should feel:

Achievable
Collective
Clear
Positive

"Doing good, together" is how we think, act and write.`,
      },
      {
        title: 'The Core Tone: P.O.P.',
        content: `Passionate

We genuinely care about climate action and social impact.
Our voice feels energised and purposeful.

Optimistic

We focus on solutions and progress.
We avoid doom-heavy climate fear.

Personal

We speak like a trusted partner.
We use "we", "you" and "us".
It feels like a conversation, not a lecture.`,
      },
      {
        title: 'How We Sound',
        content: `Clear and simple

Warm but confident

Encouraging, not preachy

Action-oriented

Human and grounded

Short sentences.
Active voice.
Strong verbs.
No unnecessary jargon.`,
      },
      {
        title: 'How We Frame Impact',
        content: `Not:
"You should reduce your carbon footprint."

Instead:
"Together, we can reduce emissions and restore nature."

We focus on:

Shared progress

Real-world action

Measurable outcomes

Practical next steps`,
      },
      {
        title: 'DO / DON\'T Checklist',
        content: `DO

✔ Use plain English
✔ Keep sentences tight and readable
✔ Speak directly to the reader
✔ Show the people behind the impact
✔ Emphasise measurable action
✔ Use confident, positive phrasing
✔ Make next steps clear

Example:
"Fund verified tree and kelp restoration. Track your impact. Share it with confidence."

DON'T

✘ Use corporate sustainability jargon
✘ Sound overly technical or academic
✘ Overpromise or exaggerate
✘ Lead with fear-based climate messaging
✘ Hide behind abstract language
✘ Sound cold or transactional

Avoid phrases like:

"Leveraging scalable environmental synergies"

"Holistic decarbonisation frameworks"

"Strategic ESG optimisation"

If it sounds like a consultancy slide, rewrite it.`,
      },
      {
        title: 'B2C vs B2B',
        content: `The tone stays the same.

Only emphasis changes.

B2C:

Make it simple

Show lifestyle fit

Focus on ease and affordability

B2B:

Emphasise transparency

Highlight measurable results

Reinforce audit-readiness and credibility

But always:
Passionate. Optimistic. Personal.`,
      },
      {
        title: 'Quick Self-Test Before Publishing',
        content: `Ask:

Does this sound human?

Is this clear to a non-expert?

Does this feel encouraging rather than alarming?

Is the action obvious?

Would I say this out loud in a real conversation?

If not, refine it.`,
      },
    ],
  }

  const quizData = [
    {
      question: 'What does P.O.P. stand for in Carma\'s tone of voice?',
      options: JSON.stringify([
        'Professional, Objective, Precise',
        'Passionate, Optimistic, Personal',
        'Positive, Open, Practical',
        'Plain, Original, Powerful',
      ]),
      correctAnswer: 1,
      explanation: 'P.O.P. stands for Passionate (we care, energised, purposeful), Optimistic (solutions and progress, not doom), and Personal (trusted partner, "we" and "you", conversation not lecture).',
      order: 1,
    },
    {
      question: 'How should we frame impact at Carma?',
      options: JSON.stringify([
        '"You should reduce your carbon footprint."',
        '"Together, we can reduce emissions and restore nature."',
        '"Carbon neutrality is mandatory."',
        '"Offset your emissions now."',
      ]),
      correctAnswer: 1,
      explanation: 'We focus on shared progress, real-world action, measurable outcomes and practical next steps. Not "you should" but "together, we can".',
      order: 2,
    },
    {
      question: 'Which of these phrases should we AVOID?',
      options: JSON.stringify([
        '"Fund verified tree and kelp restoration. Track your impact. Share it with confidence."',
        '"Leveraging scalable environmental synergies"',
        '"Together, we can reduce emissions and restore nature."',
        '"Show the people behind the impact."',
      ]),
      correctAnswer: 1,
      explanation: 'Avoid corporate sustainability jargon like "leveraging scalable environmental synergies", "holistic decarbonisation frameworks" or "strategic ESG optimisation". If it sounds like a consultancy slide, rewrite it.',
      order: 3,
    },
    {
      question: 'What is the key difference between B2C and B2B at Carma?',
      options: JSON.stringify([
        'The tone changes completely for B2B',
        'Only emphasis changes — the tone stays the same (Passionate, Optimistic, Personal)',
        'B2C uses technical language, B2B uses simple language',
        'B2B is more casual than B2C',
      ]),
      correctAnswer: 1,
      explanation: 'The tone stays the same. B2C: simple, lifestyle fit, ease and affordability. B2B: transparency, measurable results, audit-readiness. But always P.O.P.',
      order: 4,
    },
    {
      question: 'Before publishing, which question should you ask?',
      options: JSON.stringify([
        'Does this sound like a consultancy report?',
        'Would I say this out loud in a real conversation?',
        'Is this technical enough for experts?',
        'Does this use the most formal language?',
      ]),
      correctAnswer: 1,
      explanation: 'Quick self-test: Does it sound human? Is it clear to a non-expert? Does it feel encouraging? Is the action obvious? Would I say this out loud? If not, refine it.',
      order: 5,
    },
  ]

  if (existing) {
    console.log('📝 Carma Tone of Voice already exists. Updating with new content and quiz questions...')
    await prisma.quiz.deleteMany({ where: { moduleId: existing.id } })
    await prisma.module.update({
      where: { id: existing.id },
      data: {
        content: JSON.stringify(contentData),
        duration: 20,
      },
    })
    for (const q of quizData) {
      await prisma.quiz.create({
        data: { ...q, moduleId: existing.id },
      })
    }
    console.log('✅ Updated module: Carma Tone of Voice (5 quiz questions)')
    console.log(`   Module ID: ${existing.id}`)
    console.log('\n🎉 Carma Tone of Voice updated successfully!')
    return
  }

  const maxOrder = await prisma.module.findFirst({
    where: { courseId: course.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  const order = (maxOrder?.order ?? 0) + 1

  const module = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Carma Tone of Voice',
      description: 'How Carma speaks. Learn our voice: Passionate, Optimistic, Personal. Clear, warm, action-oriented. Do\'s, don\'ts and self-test before publishing.',
      order,
      duration: 20,
      badgeName: 'Voice Champion',
      badgeEmoji: '✍️',
      content: JSON.stringify(contentData),
      quizzes: {
        create: quizData,
      },
    },
  })

  console.log('✅ Created module: Carma Tone of Voice (5 quiz questions)')
  console.log(`   Module ID: ${module.id}`)
  console.log(`   Order: ${order}`)
  console.log('\n🎉 Carma Tone of Voice seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
