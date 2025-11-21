import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

export const dynamic = 'force-dynamic'

/**
 * Diagnostic endpoint to check database state
 * Visit: https://netzero-gecrc.ondigitalocean.app/api/db-check
 */
export async function GET() {
  try {
    // Check courses
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
      },
    })

    // Check total counts
    const courseCount = await prisma.course.count()
    const moduleCount = await prisma.module.count()
    const quizCount = await prisma.quiz.count()
    const userCount = await prisma.user.count()

    return NextResponse.json({
      success: true,
      database: {
        courses: {
          total: courseCount,
          active: courses.length,
          list: courses.map((c) => ({
            id: c.id,
            slug: c.slug,
            title: c.title,
            isActive: c.isActive,
            moduleCount: c.modules.length,
            modules: c.modules.map((m) => ({
              id: m.id,
              title: m.title,
              order: m.order,
            })),
          })),
        },
        modules: {
          total: moduleCount,
        },
        quizzes: {
          total: quizCount,
        },
        users: {
          total: userCount,
        },
      },
      status: courseCount === 0 
        ? 'EMPTY - Database needs seeding'
        : courseCount > 0 && courses.length === 0
        ? 'ISSUE - Courses exist but none are active'
        : 'OK - Database has courses',
      instructions: courseCount === 0
        ? {
            step1: 'Set DATABASE_URL environment variable to your production database',
            step2: 'Run: npm run db:seed',
            step3: 'Or run: npm run db:setup-do',
            step4: 'Then refresh this page to verify',
          }
        : courses.length === 0
        ? {
            step1: 'Courses exist but none are marked as active',
            step2: 'Check Course.isActive field in database',
            step3: 'Or re-seed: npm run db:seed',
          }
        : {
            message: 'Database is seeded correctly',
            nextStep: 'Courses should appear in the app',
          },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

