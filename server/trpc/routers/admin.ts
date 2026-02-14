import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { audit } from '@/server/audit'

export const adminRouter = router({
  // Get all users with course scores and completion summary
  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    // Get all courses first
    const courses = await ctx.prisma.course.findMany({
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const users = await ctx.prisma.user.findMany({
      include: {
        progress: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return users.map((user) => {
      // Group progress by course
      const courseProgress = courses.map((course) => {
        const courseModules = course.modules
        const userCourseProgress = user.progress.filter(
          (p) => p.module.courseId === course.id
        )

        const completedModules = userCourseProgress.filter((p) => p.completed)
        const totalModules = courseModules.length
        const completedCount = completedModules.length

        // Calculate average quiz score for completed modules
        const scoresWithValues = completedModules
          .map((p) => p.quizScore)
          .filter((score): score is number => score !== null)
        const averageScore =
          scoresWithValues.length > 0
            ? scoresWithValues.reduce((a, b) => a + b, 0) / scoresWithValues.length
            : null

        // Get individual module scores
        const moduleScores = courseModules.map((module) => {
          const progress = userCourseProgress.find((p) => p.moduleId === module.id)
          return {
            moduleId: module.id,
            moduleTitle: module.title,
            moduleOrder: module.order,
            completed: progress?.completed || false,
            quizScore: progress?.quizScore || null,
            completedAt: progress?.completedAt || null,
          }
        })

        return {
          courseId: course.id,
          courseSlug: course.slug,
          courseTitle: course.title,
          totalModules,
          completedModules: completedCount,
          completionRate: totalModules > 0 ? (completedCount / totalModules) * 100 : 0,
          averageScore: averageScore ? Math.round(averageScore * 100) / 100 : null,
          moduleScores,
        }
      })

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        courseProgress,
      }
    })
  }),

  // Get all users with their progress (detailed version - keeping for backward compatibility)
  getAllUsersDetailed: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      include: {
        progress: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        badges: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
        certificates: {
          include: {
            course: true,
            module: true,
          },
        },
        _count: {
          select: {
            progress: true,
            badges: true,
            certificates: true,
            quizAttempts: true,
            greenwashingSearches: true,
            greenwashingFeedback: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return users.map((user) => {
      const completedModules = user.progress.filter((p) => p.completed)
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        emailVerified: user.emailVerified,
        completedModules: completedModules.length,
        totalModulesStarted: user.progress.length,
        badgesEarned: user.badges.length,
        certificatesEarned: user.certificates.length,
        quizAttempts: user._count.quizAttempts,
        greenwashingSearches: user._count.greenwashingSearches,
        greenwashingFeedback: user._count.greenwashingFeedback,
        progress: user.progress.map((p) => ({
          id: p.id,
          moduleId: p.moduleId,
          moduleTitle: p.module.title,
          courseTitle: p.module.course.title,
          courseSlug: p.module.course.slug,
          completed: p.completed,
          completedAt: p.completedAt,
          timeSpent: p.timeSpent,
          quizScore: p.quizScore,
          quizAttempts: p.quizAttempts,
          lastAccessed: p.lastAccessed,
        })),
        badges: user.badges.map((b) => ({
          id: b.id,
          moduleId: b.moduleId,
          moduleTitle: b.module.title,
          badgeName: b.module.badgeName,
          badgeEmoji: b.module.badgeEmoji,
          earnedAt: b.earnedAt,
        })),
        certificates: user.certificates.map((c) => ({
          id: c.id,
          courseId: c.courseId,
          courseTitle: c.course.title,
          moduleId: c.moduleId,
          moduleTitle: c.module?.title || null,
          issuedAt: c.issuedAt,
          certificateUrl: c.certificateUrl,
          businessName: c.businessName,
        })),
      }
    })
  }),

  // Get detailed user information
  getUserDetails: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          progress: {
            include: {
              module: {
                include: {
                  course: true,
                  quizzes: true,
                },
              },
            },
            orderBy: {
              lastAccessed: 'desc',
            },
          },
          badges: {
            include: {
              module: {
                include: {
                  course: true,
                },
              },
            },
            orderBy: {
              earnedAt: 'desc',
            },
          },
          certificates: {
            include: {
              course: true,
              module: true,
            },
            orderBy: {
              issuedAt: 'desc',
            },
          },
          quizAttempts: {
            include: {
              quiz: {
                include: {
                  module: {
                    include: {
                      course: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              attemptedAt: 'desc',
            },
            take: 50, // Limit to recent attempts
          },
          greenwashingSearches: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 20, // Limit to recent searches
          },
          greenwashingFeedback: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 20, // Limit to recent feedback
          },
        },
      })

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        emailVerified: user.emailVerified,
        progress: user.progress,
        badges: user.badges,
        certificates: user.certificates,
        quizAttempts: user.quizAttempts,
        greenwashingSearches: user.greenwashingSearches,
        greenwashingFeedback: user.greenwashingFeedback,
      }
    }),

  // Get platform statistics
  getStatistics: adminProcedure.query(async ({ ctx }) => {
    const [
      totalUsers,
      totalCourses,
      totalModules,
      totalProgress,
      completedModules,
      totalBadges,
      totalCertificates,
      totalQuizAttempts,
      totalGreenwashingSearches,
      totalGreenwashingFeedback,
      usersWithProgress,
      usersWithCompletedModules,
    ] = await Promise.all([
      ctx.prisma.user.count(),
      ctx.prisma.course.count(),
      ctx.prisma.module.count(),
      ctx.prisma.userProgress.count(),
      ctx.prisma.userProgress.count({ where: { completed: true } }),
      ctx.prisma.badge.count(),
      ctx.prisma.certificate.count(),
      ctx.prisma.quizAttempt.count(),
      ctx.prisma.greenwashingSearch.count(),
      ctx.prisma.greenwashingFeedback.count(),
      ctx.prisma.userProgress.groupBy({
        by: ['userId'],
        _count: true,
      }),
      ctx.prisma.userProgress.groupBy({
        by: ['userId'],
        where: { completed: true },
        _count: true,
      }),
    ])

    // Calculate completion rate
    const completionRate =
      totalProgress > 0 ? (completedModules / totalProgress) * 100 : 0

    // Calculate average modules per user
    const avgModulesPerUser =
      usersWithProgress.length > 0
        ? totalProgress / usersWithProgress.length
        : 0

    // Calculate average completed modules per user
    const avgCompletedPerUser =
      usersWithCompletedModules.length > 0
        ? completedModules / usersWithCompletedModules.length
        : 0

    return {
      users: {
        total: totalUsers,
        withProgress: usersWithProgress.length,
        withCompletedModules: usersWithCompletedModules.length,
      },
      courses: {
        total: totalCourses,
      },
      modules: {
        total: totalModules,
      },
      progress: {
        total: totalProgress,
        completed: completedModules,
        completionRate: Math.round(completionRate * 100) / 100,
        avgPerUser: Math.round(avgModulesPerUser * 100) / 100,
        avgCompletedPerUser: Math.round(avgCompletedPerUser * 100) / 100,
      },
      badges: {
        total: totalBadges,
      },
      certificates: {
        total: totalCertificates,
      },
      quizAttempts: {
        total: totalQuizAttempts,
      },
      greenwashing: {
        searches: totalGreenwashingSearches,
        feedback: totalGreenwashingFeedback,
      },
    }
  }),

  // Mark module as completed for a user
  markModuleCompleted: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        moduleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify module exists
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

      // Verify user exists
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Upsert progress
      const progress = await ctx.prisma.userProgress.upsert({
        where: {
          userId_moduleId: {
            userId: input.userId,
            moduleId: input.moduleId,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          userId: input.userId,
          moduleId: input.moduleId,
          completed: true,
          completedAt: new Date(),
        },
      })

      // Create badge if it doesn't exist
      await ctx.prisma.badge.upsert({
        where: {
          userId_moduleId: {
            userId: input.userId,
            moduleId: input.moduleId,
          },
        },
        update: {},
        create: {
          userId: input.userId,
          moduleId: input.moduleId,
        },
      })

      // Create certificate if it doesn't exist
      await ctx.prisma.certificate.upsert({
        where: {
          userId_courseId_moduleId: {
            userId: input.userId,
            courseId: module.courseId,
            moduleId: input.moduleId,
          },
        },
        update: {},
        create: {
          userId: input.userId,
          courseId: module.courseId,
          moduleId: input.moduleId,
        },
      })

      // Audit: admin marked module as completed
      audit({
        action: 'ADMIN_MARK_COMPLETED',
        category: 'ADMIN',
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email ?? undefined,
        detail: `Admin marked module "${module.title}" complete for user ${user.email}`,
        targetId: input.userId,
        targetType: 'User',
        metadata: { moduleId: input.moduleId, moduleTitle: module.title, targetUserId: input.userId, targetEmail: user.email },
      })

      return progress
    }),

  // Reset user progress for a module
  resetModuleProgress: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        moduleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.userProgress.deleteMany({
        where: {
          userId: input.userId,
          moduleId: input.moduleId,
        },
      })

      await ctx.prisma.badge.deleteMany({
        where: {
          userId: input.userId,
          moduleId: input.moduleId,
        },
      })

      await ctx.prisma.certificate.deleteMany({
        where: {
          userId: input.userId,
          moduleId: input.moduleId,
        },
      })

      // Audit: admin reset module progress
      audit({
        action: 'ADMIN_RESET_PROGRESS',
        category: 'ADMIN',
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email ?? undefined,
        severity: 'WARN',
        detail: `Admin reset progress for module ${input.moduleId} for user ${input.userId}`,
        targetId: input.userId,
        targetType: 'User',
        metadata: { moduleId: input.moduleId, targetUserId: input.userId },
      })

      return { success: true }
    }),
})

