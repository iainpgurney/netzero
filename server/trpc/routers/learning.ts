import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'

export const learningRouter = router({
  // Get all modules with user progress
  getModules: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const modules = await ctx.prisma.module.findMany({
      orderBy: { order: 'asc' },
      include: {
        quizzes: {
          orderBy: { order: 'asc' },
        },
        userProgress: {
          where: { userId },
        },
        badges: {
          where: { userId },
        },
      },
    })

    // Create a map of completed modules for quick lookup
    const completedModules = new Set(
      modules
        .filter((m) => m.userProgress[0]?.completed)
        .map((m) => m.order)
    )

    return modules.map((module) => ({
      ...module,
      progress: module.userProgress[0] || null,
      hasBadge: module.badges.length > 0,
      isLocked: module.order > 1 && !completedModules.has(module.order - 1),
    }))
  }),

  // Get single module with content
  getModule: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const module = await ctx.prisma.module.findUnique({
        where: { id: input.moduleId },
        include: {
          quizzes: {
            orderBy: { order: 'asc' },
          },
          userProgress: {
            where: { userId },
          },
        },
      })

      if (!module) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Module not found' })
      }

      // Check if previous module is completed
      const previousModule = await ctx.prisma.module.findFirst({
        where: { order: module.order - 1 },
        include: {
          userProgress: {
            where: { userId },
          },
        },
      })

      const isLocked = module.order > 1 && !previousModule?.userProgress[0]?.completed

      return {
        ...module,
        progress: module.userProgress[0] || null,
        isLocked,
      }
    }),

  // Update progress (mark as accessed)
  updateProgress: protectedProcedure
    .input(
      z.object({
        moduleId: z.string(),
        timeSpent: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const progress = await ctx.prisma.userProgress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId: input.moduleId,
          },
        },
        update: {
          lastAccessed: new Date(),
          timeSpent: input.timeSpent
            ? {
                increment: input.timeSpent,
              }
            : undefined,
        },
        create: {
          userId,
          moduleId: input.moduleId,
          lastAccessed: new Date(),
          timeSpent: input.timeSpent || 0,
        },
      })

      return progress
    }),

  // Complete module
  completeModule: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const progress = await ctx.prisma.userProgress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId: input.moduleId,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          userId,
          moduleId: input.moduleId,
          completed: true,
          completedAt: new Date(),
        },
      })

      return progress
    }),

  // Submit quiz answer
  submitQuizAnswer: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        selectedAnswer: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const quiz = await ctx.prisma.quiz.findUnique({
        where: { id: input.quizId },
      })

      if (!quiz) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Quiz not found' })
      }

      const isCorrect = input.selectedAnswer === quiz.correctAnswer

      // Record attempt
      await ctx.prisma.quizAttempt.create({
        data: {
          userId,
          quizId: input.quizId,
          selectedAnswer: input.selectedAnswer,
          isCorrect,
        },
      })

      return {
        isCorrect,
        correctAnswer: quiz.correctAnswer,
        explanation: quiz.explanation,
      }
    }),

  // Complete quiz for a module
  completeQuiz: protectedProcedure
    .input(
      z.object({
        moduleId: z.string(),
        score: z.number(), // percentage
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Update progress with quiz score and mark as completed if passing (>= 70%)
      const progress = await ctx.prisma.userProgress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId: input.moduleId,
          },
        },
        update: {
          quizScore: input.score,
          quizAttempts: { increment: 1 },
          // Mark module as completed if passing score
          completed: input.score >= 70 ? true : undefined,
          completedAt: input.score >= 70 ? new Date() : undefined,
        },
        create: {
          userId,
          moduleId: input.moduleId,
          quizScore: input.score,
          quizAttempts: 1,
          completed: input.score >= 70,
          completedAt: input.score >= 70 ? new Date() : null,
        },
      })

      // Award badge if score is 70% or higher
      if (input.score >= 70) {
        await ctx.prisma.badge.upsert({
          where: {
            userId_moduleId: {
              userId,
              moduleId: input.moduleId,
            },
          },
          update: {},
          create: {
            userId,
            moduleId: input.moduleId,
          },
        })
      }

      return progress
    }),

  // Get user dashboard stats
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const modules = await ctx.prisma.module.findMany({
      orderBy: { order: 'asc' },
    })

    const progress = await ctx.prisma.userProgress.findMany({
      where: { userId },
      include: {
        module: true,
      },
    })

    const badges = await ctx.prisma.badge.findMany({
      where: { userId },
      include: {
        module: true,
      },
    })

    const completedModules = progress.filter((p) => p.completed).length
    const totalModules = modules.length
    const completionPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0)
    const totalKnowledgePoints = badges.length * 50 + completedModules * 25 // Simple scoring

    const certificate = await ctx.prisma.certificate.findUnique({
      where: { userId },
    })

    return {
      completionPercentage: Math.round(completionPercentage),
      completedModules,
      totalModules,
      badgesEarned: badges.length,
      totalBadges: totalModules,
      totalTimeSpent, // in seconds
      knowledgePoints: totalKnowledgePoints,
      hasCertificate: !!certificate,
      currentModule: progress.find((p) => !p.completed)?.module || null,
      recentBadges: badges.slice(-3).reverse(),
    }
  }),

  // Generate certificate
  generateCertificate: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Check if all modules are completed
    const modules = await ctx.prisma.module.findMany()
    const progress = await ctx.prisma.userProgress.findMany({
      where: { userId, completed: true },
    })

    if (progress.length < modules.length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'All modules must be completed to generate certificate',
      })
    }

    // Check if certificate already exists
    const existingCertificate = await ctx.prisma.certificate.findUnique({
      where: { userId },
    })

    if (existingCertificate) {
      return existingCertificate
    }

    // Create certificate
    const certificate = await ctx.prisma.certificate.create({
      data: {
        userId,
      },
    })

    return certificate
  }),

  // Get certificate
  getCertificate: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id

    const certificate = await ctx.prisma.certificate.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    })

    return certificate
  }),

  // Get next module after completing current one
  getNextModule: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const currentModule = await ctx.prisma.module.findUnique({
        where: { id: input.moduleId },
      })

      if (!currentModule) {
        return null
      }

      // Find the next module by order
      const nextModule = await ctx.prisma.module.findFirst({
        where: {
          order: currentModule.order + 1,
        },
      })

      return nextModule
        ? {
            id: nextModule.id,
            title: nextModule.title,
            order: nextModule.order,
          }
        : null
    }),
})

