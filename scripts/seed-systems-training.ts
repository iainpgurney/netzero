import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Systems Training module...')

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
    where: { courseId: course.id, order: 3 },
  })
  if (existing) {
    console.log('⏭️ Systems Training already exists. Skipping to preserve user progress.')
    return
  }

  // Module 3: Systems Training
  const systemsTraining = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Systems Training',
      description: 'Learn how to use Google Workspace, Slack, and the Company Resource Platform effectively at Carma.',
      order: 3,
      duration: 40,
      badgeName: 'Systems Pro',
      badgeEmoji: '⚙️',
      content: JSON.stringify({
        sections: [
          {
            title: 'Gmail — External Communication',
            content: `Google Workspace is our external communication and documentation system. It includes Gmail, Google Drive, Docs, Sheets, Slides and Calendar.

Email is used for communication outside of Carma.

Use email for:
• Sharing information and updates with clients and partners
• Scheduling meetings
• Sending files and documents
• Customer support and enquiries
• Contracts and transactional communication
• Marketing communications

Do not use email for internal collaboration if Slack is more appropriate.

Email Best Practice:

1. Clear subject line — keep it concise and specific
2. Professional tone — no slang, abbreviations or emojis. Use correct grammar and punctuation
3. Personalise where possible — use the recipient's name
4. Structured layout — use paragraphs and bullet points. Keep it readable
5. Use your Carma email signature — include full name, job title, Carma contact details, relevant links
6. Respect time — keep it concise. Avoid unnecessary information
7. Proofread before sending

Email represents the brand. Write like it matters.`,
          },
          {
            title: 'Google Drive — File Storage and Collaboration',
            content: `Google Drive is our central document storage system.

Use Drive for:
• Contracts
• Proposals
• Reports
• Policies
• Marketing materials
• Operational documents

Key Rules:

1. Store files in the correct shared folder. Do not create isolated personal folders for company work.

2. Naming conventions must be clear.
   Example: 2026-01-CarbonCarma-Proposal-ClientName

3. Use shared drives where possible. Avoid storing business files in personal My Drive.

4. Never store company data offline. Do not save locally long term, keep sensitive printouts, or email documents to personal accounts.

5. Manage permissions correctly — Viewer, Commenter, Editor. Only grant access when necessary.

6. Use version history. Avoid downloading and re-uploading documents as final_v3.

Drive is our single source of truth. If it is not in Drive, it does not exist.`,
          },
          {
            title: 'Google Calendar',
            content: `Use Calendar for:
• Scheduling meetings
• Blocking focus time
• Team coordination

Rules:
• Always include a meeting agenda
• Add Google Meet link where required
• Invite only necessary participants
• Respect others' time`,
          },
          {
            title: 'Slack — Internal Communication',
            content: `Slack is Carma's internal real-time collaboration platform.

Use Slack instead of email for:
• Internal questions
• Quick updates
• Team coordination
• Cross-functional collaboration

Slack keeps work transparent and searchable.

Channel Discipline:
Always use the correct channel. Channels exist for teams, projects, departments, and announcements. Do not post random updates in general channels. Keep communication relevant and structured.

Tone and Professionalism:
Slack is informal but not casual.
• No sarcasm
• No unprofessional language
• No excessive emojis
• Write clearly

Assume messages may be read by leadership or referenced later.

Threading:
Always reply in threads. Do not start new messages in the main channel when a thread already exists for that topic. This keeps channels clean and discussions easy to follow.`,
          },
          {
            title: 'Slack — Notifications and Status',
            content: `Notification Management:
• Set working hours in Slack preferences
• Mute channels that are not relevant to your daily work
• Use "Do Not Disturb" during focus time
• Star important channels for quick access

Status Updates:
Keep your status current:
• In a meeting
• On lunch
• Working remotely
• Out of office

This helps the team know your availability without needing to ask.

Direct Messages:
Use DMs for:
• Quick one-to-one questions
• Sensitive topics
• Personal coordination

Do not use DMs for decisions that affect the wider team. Those belong in channels where others can see and contribute.`,
          },
          {
            title: 'Company Resource Platform',
            content: `The Carma intranet is your central hub for company information, policies, training, and resources.

What you will find:
• Company information and org chart
• People policies (leave, expenses, code of conduct)
• Team information and missions
• Training courses and certifications
• Resources (SOPs, security policies, brand assets)
• Kanban boards for department workflows

Key Rules:
• Check the intranet before asking — most answers are already there
• Use the training hub for onboarding and ongoing learning
• Access policies directly from the People section
• Brand assets and marketing materials are in Resources

The intranet is designed to be your first stop for information. Use it.`,
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'When should you use email instead of Slack at Carma?',
            options: JSON.stringify([
              'For all internal team discussions',
              'For external communication with clients and partners',
              'For quick questions to colleagues',
              'For sharing memes with the team',
            ]),
            correctAnswer: 1,
            explanation: 'Email is used for communication outside of Carma — clients, partners, contracts, and marketing. Internal communication should use Slack.',
            order: 1,
          },
          {
            question: 'What is the correct approach to file storage at Carma?',
            options: JSON.stringify([
              'Save important files to your desktop for quick access',
              'Email documents to your personal account as a backup',
              'Store all files in the correct shared Google Drive folder with clear naming conventions',
              'Create a personal folder in Google Drive for all your work',
            ]),
            correctAnswer: 2,
            explanation: 'Google Drive is the single source of truth. Files must be stored in the correct shared folder with clear naming conventions. Never store company data offline or in personal accounts.',
            order: 2,
          },
          {
            question: 'Why should you always reply in threads on Slack?',
            options: JSON.stringify([
              'It makes your messages look more professional',
              'It keeps channels clean and makes discussions easy to follow',
              'It prevents other people from seeing your messages',
              'It is only required for direct messages',
            ]),
            correctAnswer: 1,
            explanation: 'Threading keeps channels clean and discussions easy to follow. Do not start new messages in the main channel when a thread already exists for that topic.',
            order: 3,
          },
          {
            question: 'What should you do before asking a colleague a question?',
            options: JSON.stringify([
              'Send a direct message on Slack immediately',
              'Write a formal email to your manager',
              'Check the intranet first — most answers are already there',
              'Post in the general Slack channel',
            ]),
            correctAnswer: 2,
            explanation: 'The intranet is designed to be your first stop for information. Check it before asking — most answers about policies, processes, and resources are already there.',
            order: 4,
          },
          {
            question: 'Which of the following is correct email best practice at Carma?',
            options: JSON.stringify([
              'Use emojis and abbreviations to keep emails short',
              'Send emails without a subject line to save time',
              'Use a clear subject line, professional tone, and your Carma email signature',
              'CC everyone in the company on important updates',
            ]),
            correctAnswer: 2,
            explanation: 'Emails should have a clear subject line, professional tone with correct grammar, and your Carma email signature. Email represents the brand — write like it matters.',
            order: 5,
          },
        ],
      },
    },
  })
  console.log('✅ Created module: Systems Training (5 quiz questions)')

  console.log('\n🎉 Systems Training module seeded successfully!')
  console.log(`   Module ID: ${systemsTraining.id}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
