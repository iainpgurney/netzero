/**
 * Export quiz, company, and people copy for AI training.
 * Outputs: exports/ai-training-copy.json and exports/ai-training-copy.md
 *
 * Run: npm run export:copy
 * Requires: seeded database (for quiz content and department descriptions)
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import {
  COMPANY_VALUES,
  COMPANY_HOW_WE_WORK,
  COMPANY_VISION,
  COMPANY_WHAT_MEANS_IN_PRACTICE,
  COMPANY_DECISION_STRUCTURE,
  PEOPLE_MILESTONES,
  PEOPLE_POLICIES,
  PEOPLE_CORE_VALUES,
  PEOPLE_ROLES_AND_RESPONSIBILITIES,
  PEOPLE_PERFORMANCE_FRAMEWORK,
  QUICK_LINKS,
  TEAM_MISSION_TEMPLATE,
} from '../lib/copy'

const prisma = new PrismaClient()

const EXPORTS_DIR = path.join(process.cwd(), 'exports')

async function main() {
  console.log('Exporting copy for AI training...\n')

  if (!fs.existsSync(EXPORTS_DIR)) {
    fs.mkdirSync(EXPORTS_DIR, { recursive: true })
    console.log(`Created ${EXPORTS_DIR}/\n`)
  }

  // 1. Quiz content from database
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          quizzes: { orderBy: { order: 'asc' } },
        },
      },
    },
  })

  const quizzes: Array<{
    course: string
    courseSlug: string
    module: string
    moduleDescription: string
    questions: Array<{
      question: string
      options: string[]
      correctAnswer: number
      explanation: string | null
    }>
  }> = []

  const modulesWithContent: Array<{
    course: string
    courseSlug: string
    module: string
    moduleDescription: string
    sections: Array<{ title: string; content: string; source?: string }>
  }> = []

  for (const course of courses) {
    for (const mod of course.modules) {
      const questions = mod.quizzes.map((q) => ({
        question: q.question,
        options: JSON.parse(q.options) as string[],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }))

      if (questions.length > 0) {
        quizzes.push({
          course: course.title,
          courseSlug: course.slug,
          module: mod.title,
          moduleDescription: mod.description,
          questions,
        })
      }

      // Extract module content sections
      try {
        const content = JSON.parse(mod.content) as { sections?: Array<{ title: string; content: string; source?: string }> }
        if (content?.sections?.length) {
          modulesWithContent.push({
            course: course.title,
            courseSlug: course.slug,
            module: mod.title,
            moduleDescription: mod.description,
            sections: content.sections,
          })
        }
      } catch {
        // Skip if content is not valid JSON
      }
    }
  }

  // 2. Department descriptions from database
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: { name: true, slug: true, description: true },
  })

  // 3. Build export payload
  const payload = {
    exportedAt: new Date().toISOString(),
    quizzes,
    modulesWithContent,
    company: {
      vision: COMPANY_VISION,
      whatMeansInPractice: COMPANY_WHAT_MEANS_IN_PRACTICE,
      values: COMPANY_VALUES,
      howWeWork: COMPANY_HOW_WE_WORK,
      decisionStructure: COMPANY_DECISION_STRUCTURE,
      departments: departments.map((d) => ({
        name: d.name,
        slug: d.slug,
        description: d.description,
      })),
    },
    people: {
      milestones: PEOPLE_MILESTONES,
      policies: PEOPLE_POLICIES,
      coreValues: PEOPLE_CORE_VALUES,
      rolesAndResponsibilities: PEOPLE_ROLES_AND_RESPONSIBILITIES,
      performanceFramework: PEOPLE_PERFORMANCE_FRAMEWORK,
      quickLinks: QUICK_LINKS,
      teamMissionTemplate: TEAM_MISSION_TEMPLATE,
    },
  }

  // 4. Write JSON
  const jsonPath = path.join(EXPORTS_DIR, 'ai-training-copy.json')
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf-8')
  console.log(`Wrote ${jsonPath}`)

  // 5. Write Markdown
  const md = buildMarkdown(payload)
  const mdPath = path.join(EXPORTS_DIR, 'ai-training-copy.md')
  fs.writeFileSync(mdPath, md, 'utf-8')
  console.log(`Wrote ${mdPath}`)

  console.log('\nDone. Use these files for AI training or RAG ingestion.')
}

function buildMarkdown(payload: {
  quizzes: Array<{
    course: string
    module: string
    questions: Array<{
      question: string
      options: string[]
      correctAnswer: number
      explanation: string | null
    }>
  }>
  modulesWithContent: Array<{
    course: string
    module: string
    sections: Array<{ title: string; content: string }>
  }>
  company: Record<string, unknown>
  people: Record<string, unknown>
}): string {
  const lines: string[] = [
    '# Carma AI Training Copy',
    '',
    `Exported: ${new Date().toISOString()}`,
    '',
    '---',
    '',
    '## Quizzes',
    '',
  ]

  for (const q of payload.quizzes) {
    lines.push(`### ${q.course} > ${q.module}`)
    lines.push('')
    for (const item of q.questions) {
      lines.push(`**Q:** ${item.question}`)
      lines.push(`**Options:** ${item.options.join(' | ')}`)
      lines.push(`**Correct:** ${item.options[item.correctAnswer]}`)
      if (item.explanation) lines.push(`**Explanation:** ${item.explanation}`)
      lines.push('')
    }
  }

  lines.push('---')
  lines.push('')
  lines.push('## Training Module Content')
  lines.push('')

  for (const m of payload.modulesWithContent) {
    lines.push(`### ${m.course} > ${m.module}`)
    lines.push('')
    for (const s of m.sections) {
      lines.push(`#### ${s.title}`)
      lines.push('')
      lines.push(s.content)
      lines.push('')
    }
  }

  lines.push('---')
  lines.push('')
  lines.push('## Company')
  lines.push('')
  lines.push(`### Vision: ${(payload.company.vision as { headline: string }).headline}`)
  lines.push('')
  for (const p of (payload.company.vision as { paragraphs: string[] }).paragraphs) {
    lines.push(p)
    lines.push('')
  }
  lines.push('### What This Means In Practice')
  for (const item of payload.company.whatMeansInPractice as string[]) {
    lines.push(`- ${item}`)
  }
  lines.push('')
  lines.push('### Values')
  for (const v of payload.company.values as Array<{ title: string; description: string; inPractice: string[] }>) {
    lines.push(`- **${v.title}:** ${v.description}`)
    for (const p of v.inPractice) lines.push(`  - ${p}`)
  }
  lines.push('')
  lines.push('### How We Work')
  for (const h of payload.company.howWeWork as Array<{ title: string; description: string }>) {
    lines.push(`- **${h.title}:** ${h.description}`)
  }
  lines.push('')
  lines.push('### Departments')
  for (const d of payload.company.departments as Array<{ name: string; description: string | null }>) {
    lines.push(`- **${d.name}:** ${d.description || ''}`)
  }

  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## People')
  lines.push('')
  lines.push('### Core Values')
  for (const v of payload.people.coreValues as string[]) {
    lines.push(`- ${v}`)
  }
  lines.push('')
  lines.push('### Joiners Guide (Milestones)')
  for (const m of payload.people.milestones as Array<{ phase: string; subtitle: string; items: Array<{ text: string }> }>) {
    lines.push(`- **${m.phase}** — ${m.subtitle}`)
    for (const i of m.items) lines.push(`  - ${i.text}`)
  }
  lines.push('')
  lines.push('### Policies')
  for (const p of payload.people.policies as Array<{ title: string; description: string }>) {
    lines.push(`- **${p.title}:** ${p.description}`)
  }
  lines.push('')
  const roles = payload.people.rolesAndResponsibilities as { intro: string; principles: Array<{ title: string; description: string }> }
  lines.push('### Roles & Responsibilities')
  lines.push(roles.intro)
  for (const r of roles.principles) {
    lines.push(`- **${r.title}:** ${r.description}`)
  }
  lines.push('')
  const perf = payload.people.performanceFramework as { intro: string; cadences: Array<{ frequency: string; title: string; description: string }>; ratingsNote: string }
  lines.push('### Performance Framework')
  lines.push(perf.intro)
  for (const c of perf.cadences) {
    lines.push(`- **${c.frequency} - ${c.title}:** ${c.description}`)
  }
  lines.push(perf.ratingsNote)
  lines.push('')
  lines.push('### Quick Links')
  for (const q of payload.people.quickLinks as Array<{ label: string; description: string }>) {
    lines.push(`- **${q.label}:** ${q.description}`)
  }
  lines.push('')
  lines.push(`### Team Mission Template: ${payload.people.teamMissionTemplate}`)

  return lines.join('\n')
}

main()
  .catch((err) => {
    console.error('Export failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
