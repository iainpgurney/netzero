import type { PrismaClient } from '@prisma/client'
import { carmaDesignBasicsCurriculum } from './carma-design-basics-curriculum'

/**
 * Idempotent seed: upserts course `carma-design-basics` and replaces all modules + quizzes.
 * Deletes existing modules for this course (cascades progress/quizzes for those modules).
 */
export async function seedCarmaDesignBasics(prisma: PrismaClient): Promise<void> {
  const { course, modules } = carmaDesignBasicsCurriculum

  const row = await prisma.course.upsert({
    where: { slug: course.slug },
    update: {
      title: course.title,
      description: course.description,
      icon: course.icon,
      isActive: course.isActive,
    },
    create: {
      slug: course.slug,
      title: course.title,
      description: course.description,
      icon: course.icon,
      isActive: course.isActive,
    },
  })

  await prisma.module.deleteMany({ where: { courseId: row.id } })

  for (const mod of modules) {
    await prisma.module.create({
      data: {
        courseId: row.id,
        title: mod.title,
        description: mod.description,
        order: mod.order,
        duration: mod.duration,
        badgeName: mod.badgeName,
        badgeEmoji: mod.badgeEmoji,
        content: JSON.stringify(mod.content),
        quizzes: {
          create: mod.quizzes.map((q) => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation ?? null,
            order: q.order,
          })),
        },
      },
    })
  }
}
