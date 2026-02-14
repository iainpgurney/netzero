import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Security Training module...')

  const course = await prisma.course.findUnique({
    where: { slug: 'new-starter' },
  })

  if (!course) {
    console.error('❌ New Starter course not found. Run seed-new-starter.ts first.')
    process.exit(1)
  }

  const existing = await prisma.module.findFirst({
    where: { courseId: course.id, order: 4 },
  })

  if (existing) {
    console.log('⚠️ Security Training module already exists, deleting and recreating...')
    await prisma.module.delete({ where: { id: existing.id } })
  }

  const securityTraining = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Security Training',
      description: 'Understand your responsibilities under Carma\'s ISMS, information classification, AI security protocols, and incident response.',
      order: 4,
      duration: 25,
      badgeName: 'Security Guardian',
      badgeEmoji: '🛡️',
      content: JSON.stringify({
        sections: [
          {
            title: 'Our Information Security Framework',
            content: `Carma operates an Information Security Management System (ISMS) aligned with:
• ISO/IEC 27001:2022
• Cyber Essentials

The ISMS applies to:
• Hardware (laptops, servers, mobile devices)
• Software (source code, licensed software)
• Information (electronic and paper records)
• Infrastructure (offices, communications)
• People (staff, contractors, partners)
• Outsourced services (cloud, payroll, SaaS providers)

Security is organisation-wide. If you use it, you are responsible for protecting it.`,
          },
          {
            title: 'Information Classification',
            content: `All information must be treated according to its classification:

1. Unclassified — Public information. No specific controls required.
2. Shared — Shared externally but controlled.
3. Company Only — Internal use only.
4. Confidential — Restricted to named individuals or groups.

When in doubt: treat information as Confidential.

Never downgrade classification casually.`,
          },
          {
            title: 'Governance, Risk and Compliance',
            content: `Security is structured and accountable.

Management Information Security Forum (MISF) — Provides direction and approval.
Information Security Manager (ISM) — Implements and manages ISMS decisions.
Risk Owners — Manage and report risks in their area.
All Staff — Must comply with ISMS policies and complete mandatory training.

Security is not the IT team's job. It is everyone's job.

Risk Management:
Risks are identified, assessed, treated, and reviewed quarterly. Residual risks must be accepted by Risk Owners. If you see a vulnerability, report it. Do not ignore it. Do not assume someone else has seen it.

Supplier and Third-Party Security:
All third-party services must undergo due diligence, onboarding checks, and ongoing monitoring. Supplier risks are recorded and reviewed quarterly. Before using a new tool, it must be approved. Shadow IT is a risk.`,
          },
          {
            title: 'Legal and Regulatory Compliance',
            content: `Carma complies with:
• GDPR
• Data Protection Act
• PECR
• Computer Misuse Act
• Copyright law
• Companies Act

Violations can result in:
• Financial penalties
• Regulatory action
• Reputational damage
• Criminal liability

Handle data like regulators are watching. Because they can.`,
          },
          {
            title: 'AI Security — The Traffic Light System',
            content: `Carma operates on Google Workspace Business Standard. Gemini data is contractually private but we do NOT have Enterprise DLP. The system cannot automatically stop you from leaking data. Security relies on you following the rules.

GREEN ZONE — Google Gemini (Approved for internal business data)
You may:
• Summarise internal meetings
• Analyse Drive documents
• Draft client emails
• Debug code (no exposed keys)
Safety rule: Use @Drive instead of uploading files. Keep data inside the secure cloud.

YELLOW ZONE — ChatGPT / Claude / Midjourney (Public domain only)
Assume anything typed becomes public knowledge.
Allowed: Creative brainstorming, anonymous data formatting, generic formula help.
Strictly prohibited: Real client names, real financial figures, internal strategy documents, file uploads.

RED ZONE — NEVER enter into ANY AI tool:
1. Passwords
2. API keys
3. Private encryption keys
4. Banking PINs
5. National Insurance numbers
6. Home addresses
7. Medical data
8. Crown Jewel source code
9. Unsigned contracts
10. Active litigation or NDAs

If it feels sensitive, it probably is.`,
          },
          {
            title: 'AI Departmental Guidance',
            content: `Finance:
• Gemini: Analyse reports, draft invoice emails
• ChatGPT: Explain tax concepts in generic terms

Marketing:
• Gemini: Turn Drive strategies into blog posts
• ChatGPT: Brainstorm creative ideas

Sales:
• Gemini: Summarise client email chains
• ChatGPT: Roleplay negotiations

Support:
• Gemini: Draft replies from knowledge base
• ChatGPT: Rewrite tone (remove names first)

Dev/Tech:
• Gemini: Explain internal snippets
• ChatGPT: Generic syntax help only`,
          },
          {
            title: 'Incident Response',
            content: `If you accidentally paste Red Zone data into an AI tool:

1. STOP immediately
2. DELETE the conversation if possible
3. REPORT to customer.services@carma.earth within 1 hour

Carma operates a blameless reporting culture. You will not be punished for reporting a mistake. You may face consequences for hiding one.

Continuous Improvement:
Carma follows the PDCA cycle — Plan, Do, Check, Act. Security is reviewed annually. Audits are conducted quarterly. External audits may occur. Security is not static. It evolves.`,
          },
          {
            title: 'Your Security Obligations',
            content: `You must:
• Complete annual mandatory security training
• Follow classification rules
• Use AI within defined zones
• Protect credentials
• Report incidents promptly
• Avoid unapproved software
• Lock devices when unattended
• Use MFA on all systems

If unsure: Pause. Ask. Escalate.

Speed never beats security.

By completing this module, you confirm that you have read and understood:
• IS 03 Information Security Policy
• IS 39 AI Security & Data Protection Policy
• This Security Training Guide

Failure to comply may result in disciplinary action.`,
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What security standards does Carma\'s ISMS align with?',
            options: JSON.stringify([
              'PCI DSS and SOX',
              'ISO/IEC 27001:2022 and Cyber Essentials',
              'HIPAA and NIST',
              'SOC 2 and FedRAMP',
            ]),
            correctAnswer: 1,
            explanation: 'Carma\'s Information Security Management System is aligned with ISO/IEC 27001:2022 and Cyber Essentials.',
            order: 1,
          },
          {
            question: 'How should you treat information when you are unsure of its classification?',
            options: JSON.stringify([
              'Treat it as Unclassified to make sharing easier',
              'Ask a colleague what they think',
              'Treat it as Confidential',
              'Post it in the general Slack channel to check',
            ]),
            correctAnswer: 2,
            explanation: 'When in doubt, treat information as Confidential. Never downgrade classification casually.',
            order: 2,
          },
          {
            question: 'Which AI zone is ChatGPT / Claude in, and what is the key rule?',
            options: JSON.stringify([
              'Green Zone — approved for all internal data',
              'Yellow Zone — public domain only, assume anything typed becomes public',
              'Red Zone — never use under any circumstances',
              'Green Zone — approved but only for code',
            ]),
            correctAnswer: 1,
            explanation: 'ChatGPT and Claude are in the Yellow Zone. You must assume anything typed becomes public knowledge. Only use for public domain content like brainstorming or generic help.',
            order: 3,
          },
          {
            question: 'You accidentally paste a client\'s financial data into ChatGPT. What should you do?',
            options: JSON.stringify([
              'Ignore it — the data is probably already public',
              'Delete your browser history and say nothing',
              'Stop immediately, delete the conversation, and report to customer.services@carma.earth within 1 hour',
              'Wait until the next quarterly review to mention it',
            ]),
            correctAnswer: 2,
            explanation: 'Stop immediately, delete the conversation if possible, and report to customer.services@carma.earth within 1 hour. Carma operates a blameless reporting culture — you will not be punished for reporting, but you may face consequences for hiding it.',
            order: 4,
          },
          {
            question: 'Which of the following is a RED ZONE item that must NEVER be entered into any AI tool?',
            options: JSON.stringify([
              'A generic blog post draft',
              'A brainstorming list of marketing ideas',
              'API keys, passwords, or unsigned contracts',
              'A request to explain a public tax concept',
            ]),
            correctAnswer: 2,
            explanation: 'API keys, passwords, unsigned contracts, and other sensitive items are Red Zone — they must NEVER be entered into any AI tool. This also includes National Insurance numbers, medical data, home addresses, and active litigation details.',
            order: 5,
          },
        ],
      },
    },
  })
  console.log('✅ Created module: Security Training (5 quiz questions)')

  console.log('\n🎉 Security Training module seeded successfully!')
  console.log(`   Module ID: ${securityTraining.id}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
