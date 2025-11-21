import { z } from 'zod'
import { protectedProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'

export const learningRouter = router({
  // Get all courses with user progress
  getCourses: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id

      const courses = await ctx.prisma.course.findMany({
        where: { isActive: true },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              userProgress: {
                where: { userId },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      })

      return courses.map((course) => {
        const completedModules = course.modules.filter((m) => m.userProgress[0]?.completed).length
        const totalModules = course.modules.length
        const completionPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

        return {
          id: course.id,
          slug: course.slug,
          title: course.title,
          description: course.description,
          icon: course.icon,
          moduleCount: totalModules,
          progress: {
            completedModules,
            totalModules,
            completionPercentage,
          },
        }
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Check if it's a DATABASE_URL error
      if (errorMessage.includes('postgresql://') || errorMessage.includes('postgres://') || errorMessage.includes('datasource')) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database configuration error: DATABASE_URL is not set correctly in DigitalOcean. It must start with postgresql:// and have no quotes or spaces.',
        })
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to load courses: ${errorMessage}`,
      })
    }
  }),

  // Get all modules for a specific course
  getModules: protectedProcedure
    .input(z.object({ courseSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const course = await ctx.prisma.course.findUnique({
        where: { slug: input.courseSlug },
        include: {
          modules: {
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
          },
        },
      })

      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
      }

      // Create a map of completed modules for quick lookup
      const completedModules = new Set(
        course.modules
          .filter((m) => m.userProgress[0]?.completed)
          .map((m) => m.order)
      )

      return {
        course: {
          id: course.id,
          slug: course.slug,
          title: course.title,
          description: course.description,
          icon: course.icon,
        },
        modules: course.modules.map((module) => {
          // Module 1 is always unlocked
          // Module N is unlocked if module N-1 is completed
          const isLocked = module.order > 1 && !completedModules.has(module.order - 1)
          
          return {
            ...module,
            progress: module.userProgress[0] || null,
            hasBadge: module.badges.length > 0,
            isLocked,
          }
        }),
      }
    }),

  // Get single module with content
  getModule: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const module = await ctx.prisma.module.findUnique({
        where: { id: input.moduleId },
        include: {
          course: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
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

      // Check if previous module is completed (within same course)
      const previousModule = await ctx.prisma.module.findFirst({
        where: {
          courseId: module.courseId,
          order: module.order - 1,
        },
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

      // Verify module exists before creating progress
      const module = await ctx.prisma.module.findUnique({
        where: { id: input.moduleId },
      })

      if (!module) {
        // Log for debugging but don't throw error - module might have been deleted/reseeded
        console.warn(`Module not found: ${input.moduleId} for user ${userId}`)
        // Return null instead of throwing to prevent client errors
        return null
      }

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

      // Verify module exists before creating progress
      const module = await ctx.prisma.module.findUnique({
        where: { id: input.moduleId },
        include: { course: true },
      })

      if (!module) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Module not found',
        })
      }

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

      // Auto-generate module certificate when module is completed
      try {
        // Check if certificate already exists
        const existingCert = await ctx.prisma.certificate.findFirst({
          where: {
            userId,
            courseId: module.courseId,
            moduleId: input.moduleId,
          },
        })

        // Create certificate if it doesn't exist
        if (!existingCert) {
          await ctx.prisma.certificate.create({
            data: {
              userId,
              courseId: module.courseId,
              moduleId: input.moduleId,
              businessName: null, // Will be set when user views/prints certificate
            },
          })
        }
      } catch (certError) {
        // Log but don't fail the module completion if certificate generation fails
        console.error('Error auto-generating module certificate:', certError)
      }

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

      // Verify module exists before creating progress
      const module = await ctx.prisma.module.findUnique({
        where: { id: input.moduleId },
      })

      if (!module) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Module not found',
        })
      }

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

        // Auto-generate module certificate when module is completed
        try {
          const module = await ctx.prisma.module.findUnique({
            where: { id: input.moduleId },
            include: { course: true },
          })

          if (module) {
            // Check if certificate already exists
            const existingCert = await ctx.prisma.certificate.findFirst({
              where: {
                userId,
                courseId: module.courseId,
                moduleId: input.moduleId,
              },
            })

            // Create certificate if it doesn't exist
            if (!existingCert) {
              await ctx.prisma.certificate.create({
                data: {
                  userId,
                  courseId: module.courseId,
                  moduleId: input.moduleId,
                  businessName: null, // Will be set when user views/prints certificate
                },
              })
            }
          }
        } catch (certError) {
          // Log but don't fail the quiz completion if certificate generation fails
          console.error('Error auto-generating module certificate:', certError)
        }
      }

      return progress
    }),

  // Get user dashboard stats for a course
  getDashboardStats: protectedProcedure
    .input(z.object({ courseSlug: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const courseSlug = input?.courseSlug || 'netzero'

      // Get course
      const course = await ctx.prisma.course.findUnique({
        where: { slug: courseSlug },
        include: {
          modules: {
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
      }

      const modules = course.modules

      // Get progress records - include those that might have orphaned moduleIds
      const allProgress = await ctx.prisma.userProgress.findMany({
        where: {
          userId,
        },
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      })

      // Filter progress to only include records for modules in this course
      // Also handle orphaned records (where moduleId doesn't match current modules)
      const progress = allProgress.filter((p) => {
        // If module exists and belongs to this course, include it
        if (p.module && p.module.courseId === course.id) {
          return true
        }
        // If module doesn't exist (orphaned), try to match by course + order if we can determine it
        // For now, we'll exclude orphaned records but log them
        if (!p.module) {
          console.warn(`Orphaned progress record found: userId=${userId}, moduleId=${p.moduleId}`)
        }
        return false
      })

      // Get badges - include those that might have orphaned moduleIds
      const allBadges = await ctx.prisma.badge.findMany({
        where: {
          userId,
        },
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      })

      // Filter badges to only include records for modules in this course
      const badges = allBadges.filter((b) => {
        // If module exists and belongs to this course, include it
        if (b.module && b.module.courseId === course.id) {
          return true
        }
        // If module doesn't exist (orphaned), log it
        if (!b.module) {
          console.warn(`Orphaned badge record found: userId=${userId}, moduleId=${b.moduleId}`)
        }
        return false
      })

      const completedModules = progress.filter((p) => p.completed).length
      const totalModules = modules.length
      const completionPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

      const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0)
      const totalKnowledgePoints = badges.length * 50 + completedModules * 25 // Simple scoring

      // Check for course certificate (moduleId is null for course certificates)
      const certificate = await ctx.prisma.certificate.findFirst({
        where: {
          userId,
          courseId: course.id,
          moduleId: null, // Course certificate
        },
      })

      // Debug logging
      console.log(`Dashboard Stats for ${courseSlug}:`, {
        userId,
        courseId: course.id,
        totalModules: modules.length,
        progressRecords: progress.length,
        completedModules,
        badgesCount: badges.length,
        totalTimeSpent,
        knowledgePoints: totalKnowledgePoints,
        progressDetails: progress.map((p) => ({
          moduleId: p.moduleId,
          moduleTitle: p.module?.title,
          completed: p.completed,
          timeSpent: p.timeSpent,
          quizScore: p.quizScore,
        })),
        badgeDetails: badges.map((b) => ({
          moduleId: b.moduleId,
          moduleTitle: b.module?.title,
        })),
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

  // Generate certificate for a specific course
  generateCertificate: protectedProcedure
    .input(z.object({ courseSlug: z.string(), businessName: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Get course
      const course = await ctx.prisma.course.findUnique({
        where: { slug: input.courseSlug },
        include: {
          modules: true,
        },
      })

      if (!course) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Course not found',
        })
      }

      // Check if all modules in this course are completed
      const progress = await ctx.prisma.userProgress.findMany({
        where: {
          userId,
          moduleId: { in: course.modules.map((m) => m.id) },
          completed: true,
        },
      })

      if (progress.length < course.modules.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `All ${course.modules.length} modules in ${course.title} must be completed to generate certificate`,
        })
      }

      // Check if certificate already exists for this course
      const existingCertificate = await ctx.prisma.certificate.findFirst({
        where: {
          userId,
          courseId: course.id,
          moduleId: null, // Course certificate only
        },
        include: {
          course: {
            include: {
              modules: true,
            },
          },
        },
      })

      if (existingCertificate) {
        return existingCertificate
      }

      // Create certificate
      const certificate = await ctx.prisma.certificate.create({
        data: {
          userId,
          courseId: course.id,
          moduleId: null, // Course certificate
          businessName: input.businessName || null,
        },
        include: {
          course: {
            include: {
              modules: true,
            },
          },
        },
      })

      return certificate
    }),

  // Submit feedback on greenwashing checker
  submitGreenwashingFeedback: protectedProcedure
    .input(
      z.object({
        statement: z.string().min(1),
        wasGreenwashing: z.boolean(),
        aiPrediction: z.boolean(),
        userComment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const feedback = await ctx.prisma.greenwashingFeedback.create({
        data: {
          userId,
          statement: input.statement,
          wasGreenwashing: input.wasGreenwashing,
          aiPrediction: input.aiPrediction,
          userComment: input.userComment || null,
        },
      })

      return feedback
    }),

  // Log greenwashing search for research purposes
  logGreenwashingSearch: protectedProcedure
    .input(
      z.object({
        statement: z.string().min(1),
        isGreenwashing: z.boolean(),
        confidence: z.number(),
        riskLevel: z.enum(['high', 'medium', 'low']),
        trustScore: z.object({
          overallScore: z.number(),
          claimValidity: z.number(),
          documentationQuality: z.number(),
          consistencyScore: z.number(),
        }),
        category: z.string().optional(),
        annotationTypes: z.array(z.string()).optional(),
        redFlags: z.array(z.string()).optional(),
        sourceType: z.enum(['text', 'image', 'website']).optional(),
        imageUrl: z.string().nullable().optional(),
        websiteUrl: z.string().nullable().optional(),
        techniqueId: z.string().optional(),
        classification: z.enum(['Greenwashing', 'Greenhushing', 'Greenwishing', 'Legitimate']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const search = await ctx.prisma.greenwashingSearch.create({
        data: {
          userId: userId || null,
          statement: input.statement,
          sourceType: input.sourceType || 'text',
          imageUrl: input.imageUrl || null,
          websiteUrl: input.websiteUrl || null,
          isGreenwashing: input.isGreenwashing,
          confidence: input.confidence,
          riskLevel: input.riskLevel,
          trustScore: input.trustScore.overallScore,
          claimValidity: input.trustScore.claimValidity,
          documentationQuality: input.trustScore.documentationQuality,
          consistencyScore: input.trustScore.consistencyScore,
          category: input.category || null,
          annotationTypes: input.annotationTypes ? JSON.stringify(input.annotationTypes) : null,
          redFlags: input.redFlags ? JSON.stringify(input.redFlags) : null,
          techniqueId: input.techniqueId || null,
          classification: input.classification || null,
        },
      })

      return search
    }),

  // Get certificate for a specific course
  getCertificate: protectedProcedure
    .input(z.object({ courseSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const course = await ctx.prisma.course.findUnique({
        where: { slug: input.courseSlug },
      })

      if (!course) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Course not found',
        })
      }

      const certificate = await ctx.prisma.certificate.findFirst({
        where: {
          userId,
          courseId: course.id,
          moduleId: null, // Course certificate only
        },
        include: {
          user: true,
          course: {
            include: {
              modules: true,
            },
          },
        },
      })

      return certificate
    }),

  // Generate certificate for a specific module
  generateModuleCertificate: protectedProcedure
    .input(z.object({ moduleId: z.string(), businessName: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Get module
      const module = await ctx.prisma.module.findUnique({
        where: { id: input.moduleId },
        include: {
          course: true,
        },
      })

      if (!module) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Module not found',
        })
      }

      // Check if module is completed
      const progress = await ctx.prisma.userProgress.findUnique({
        where: {
          userId_moduleId: {
            userId,
            moduleId: input.moduleId,
          },
        },
      })

      if (!progress || !progress.completed) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Module must be completed to generate certificate',
        })
      }

      // Check if certificate already exists for this module
      const existingCertificate = await ctx.prisma.certificate.findFirst({
        where: {
          userId,
          courseId: module.courseId,
          moduleId: input.moduleId,
        },
        include: {
          user: true,
          course: true,
          module: true,
        },
      })

      if (existingCertificate) {
        return existingCertificate
      }

      // Create certificate
      const certificate = await ctx.prisma.certificate.create({
        data: {
          userId,
          courseId: module.courseId,
          moduleId: input.moduleId,
          businessName: input.businessName || null,
        },
        include: {
          user: true,
          course: true,
          module: true,
        },
      })

      return certificate
    }),

  // Get certificate for a specific module
  getModuleCertificate: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      const module = await ctx.prisma.module.findUnique({
        where: { id: input.moduleId },
      })

      if (!module) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Module not found',
        })
      }

      const certificate = await ctx.prisma.certificate.findFirst({
        where: {
          userId,
          courseId: module.courseId,
          moduleId: input.moduleId,
        },
        include: {
          user: true,
          course: true,
          module: true,
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
        include: {
          course: {
            select: {
              slug: true,
            },
          },
        },
      })

      if (!currentModule) {
        return null
      }

      // Find the next module by order within the same course
      const nextModule = await ctx.prisma.module.findFirst({
        where: {
          courseId: currentModule.courseId,
          order: currentModule.order + 1,
        },
        include: {
          course: {
            select: {
              slug: true,
            },
          },
        },
      })

      return nextModule
        ? {
            id: nextModule.id,
            title: nextModule.title,
            order: nextModule.order,
            courseSlug: nextModule.course.slug,
          }
        : null
    }),

  // Get all badges for the current user
  getUserBadges: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id

      const badges = await ctx.prisma.badge.findMany({
      where: {
        userId,
      },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                slug: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        earnedAt: 'desc',
      },
    })

    return badges
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (errorMessage.includes('postgresql://') || errorMessage.includes('postgres://') || errorMessage.includes('datasource')) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database configuration error: DATABASE_URL is not set correctly in DigitalOcean. It must start with postgresql:// and have no quotes or spaces.',
        })
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to load badges: ${errorMessage}`,
      })
    }
  }),

  // Get all certificates for the current user
  getUserCertificates: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.session.user.id

      // First, get certificates with course data
      const certificates = await ctx.prisma.certificate.findMany({
      where: {
        userId,
      },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
      orderBy: {
        issuedAt: 'desc',
      },
    })

    // Then, fetch module data for certificates that have moduleId
    const certificatesWithModules = await Promise.all(
      certificates.map(async (cert) => {
        if (cert.moduleId) {
          const module = await ctx.prisma.module.findUnique({
            where: { id: cert.moduleId },
            select: {
              id: true,
              title: true,
              order: true,
            },
          })
          return { ...cert, module }
        }
        return { ...cert, module: null }
      })
    )

    // Log for debugging
    console.log(`Found ${certificatesWithModules.length} certificates for user ${userId}`)
    certificatesWithModules.forEach((cert, index) => {
      console.log(`Certificate ${index + 1}:`, {
        id: cert.id,
        courseId: cert.courseId,
        moduleId: cert.moduleId,
        course: cert.course ? cert.course.title : 'MISSING',
        module: cert.module ? cert.module.title : 'N/A',
      })
    })

    return certificatesWithModules
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (errorMessage.includes('postgresql://') || errorMessage.includes('postgres://') || errorMessage.includes('datasource')) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database configuration error: DATABASE_URL is not set correctly in DigitalOcean. It must start with postgresql:// and have no quotes or spaces.',
        })
      }
      
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to load certificates: ${errorMessage}`,
      })
    }
  }),

  // Generate missing certificates for completed modules (retroactive)
  generateMissingCertificates: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id

    // Get all completed modules for this user
    const completedProgress = await ctx.prisma.userProgress.findMany({
      where: {
        userId,
        completed: true,
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    })

    const createdCertificates = []

    // Generate certificates for completed modules that don't have one
    for (const progress of completedProgress) {
      if (!progress.module) continue

      // Check if certificate already exists
      const existingCert = await ctx.prisma.certificate.findFirst({
        where: {
          userId,
          courseId: progress.module.courseId,
          moduleId: progress.moduleId,
        },
      })

      // Create certificate if it doesn't exist
      if (!existingCert) {
        try {
          const cert = await ctx.prisma.certificate.create({
            data: {
              userId,
              courseId: progress.module.courseId,
              moduleId: progress.moduleId,
              businessName: null,
            },
          })
          createdCertificates.push(cert)
        } catch (error) {
          console.error(`Error creating certificate for module ${progress.moduleId}:`, error)
        }
      }
    }

    return {
      created: createdCertificates.length,
      certificates: createdCertificates,
    }
  }),

  // Migrate orphaned progress and badges to current modules (fixes reseed issues)
  migrateProgressToCurrentModules: protectedProcedure
    .input(z.object({ courseSlug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id

      // Get course with modules
      const course = await ctx.prisma.course.findUnique({
        where: { slug: input.courseSlug },
        include: {
          modules: {
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!course) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' })
      }

      // Get all progress records for this user
      const allProgress = await ctx.prisma.userProgress.findMany({
        where: { userId },
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      })

      // Get all badges for this user
      const allBadges = await ctx.prisma.badge.findMany({
        where: { userId },
        include: {
          module: {
            include: {
              course: true,
            },
          },
        },
      })

      // Find orphaned progress (where module doesn't exist or belongs to different course)
      const orphanedProgress = allProgress.filter(
        (p) => !p.module || (p.module.courseId !== course.id && p.module.course?.slug === input.courseSlug)
      )

      // Find orphaned badges
      const orphanedBadges = allBadges.filter(
        (b) => !b.module || (b.module.courseId !== course.id && b.module.course?.slug === input.courseSlug)
      )

      // For now, we'll delete orphaned records since we can't reliably match them to new modules
      // The user will need to re-complete modules, but at least their current progress will show correctly
      let deletedProgress = 0
      let deletedBadges = 0

      for (const orphaned of orphanedProgress) {
        try {
          await ctx.prisma.userProgress.delete({
            where: { id: orphaned.id },
          })
          deletedProgress++
        } catch (error) {
          console.error(`Error deleting orphaned progress ${orphaned.id}:`, error)
        }
      }

      for (const orphaned of orphanedBadges) {
        try {
          await ctx.prisma.badge.delete({
            where: { id: orphaned.id },
          })
          deletedBadges++
        } catch (error) {
          console.error(`Error deleting orphaned badge ${orphaned.id}:`, error)
        }
      }

      return {
        deletedProgress,
        deletedBadges,
        message: `Cleaned up ${deletedProgress} orphaned progress records and ${deletedBadges} orphaned badges. Your current progress should now display correctly.`,
      }
    }),
})

