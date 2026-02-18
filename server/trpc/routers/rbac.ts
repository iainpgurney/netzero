import { z } from 'zod'
import { router, protectedProcedure, adminProcedure, superAdminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import {
  syncUserDepartmentFromGoogle,
  syncAllGoogleUserDepartments,
  isGoogleAdminConfigured,
} from '../../google-admin'

export const rbacRouter = router({
  // ==========================================
  // Department queries
  // ==========================================

  getDepartments: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.department.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    })
  }),

  // Org chart: all departments with user names (visible to all authenticated users)
  getOrgChart: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.department.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        order: true,
        users: {
          select: {
            id: true,
            name: true,
            jobTitle: true,
            image: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    })
  }),

  // All authenticated users can view teams and member contact details
  getDepartmentWithUsers: protectedProcedure
    .input(z.object({ departmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.department.findUnique({
        where: { id: input.departmentId },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true,
              jobTitle: true,
              createdAt: true,
            },
          },
          moduleAccess: {
            include: {
              platformModule: true,
            },
          },
        },
      })
    }),

  // Update department mission (SUPER_ADMIN only)
  updateMission: superAdminProcedure
    .input(z.object({
      departmentId: z.string(),
      mission: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.department.update({
        where: { id: input.departmentId },
        data: { mission: input.mission },
      })
    }),

  // ==========================================
  // Platform module queries
  // ==========================================

  getPlatformModules: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.platformModule.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
  }),

  // Get modules the current user has access to
  getMyModules: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id
    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        departmentId: true,
        department: {
          select: {
            moduleAccess: {
              include: {
                platformModule: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
    }

    // SUPER_ADMIN and ADMIN get all modules
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      const allModules = await ctx.prisma.platformModule.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      })
      return allModules.map((m) => ({
        ...m,
        canView: true,
        canEdit: true,
        canManage: user.role === 'SUPER_ADMIN',
      }))
    }

    // For regular users, return modules based on department access
    if (!user.department?.moduleAccess) {
      return []
    }

    return user.department.moduleAccess
      .filter((access) => access.canView && access.platformModule.isActive)
      .map((access) => ({
        ...access.platformModule,
        canView: access.canView,
        canEdit: access.canEdit,
        canManage: access.canManage,
      }))
      .sort((a, b) => a.order - b.order)
  }),

  // ==========================================
  // User management (Admin only)
  // ==========================================

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'MEMBER']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only SUPER_ADMIN can assign SUPER_ADMIN or ADMIN roles
      const currentUserRole = ctx.session.user.role
      if (
        (input.role === 'SUPER_ADMIN' || input.role === 'ADMIN') &&
        currentUserRole !== 'SUPER_ADMIN'
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only Super Admins can assign Admin or Super Admin roles',
        })
      }

      return ctx.prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
        },
      })
    }),

  updateUserDepartment: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        departmentId: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: input.userId },
        data: { departmentId: input.departmentId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
          department: {
            select: { name: true, slug: true },
          },
        },
      })
    }),

  // ==========================================
  // Module access management (Admin only)
  // ==========================================

  updateDepartmentModuleAccess: adminProcedure
    .input(
      z.object({
        departmentId: z.string(),
        platformModuleId: z.string(),
        canView: z.boolean(),
        canEdit: z.boolean(),
        canManage: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.departmentModuleAccess.upsert({
        where: {
          departmentId_platformModuleId: {
            departmentId: input.departmentId,
            platformModuleId: input.platformModuleId,
          },
        },
        create: {
          departmentId: input.departmentId,
          platformModuleId: input.platformModuleId,
          canView: input.canView,
          canEdit: input.canEdit,
          canManage: input.canManage,
        },
        update: {
          canView: input.canView,
          canEdit: input.canEdit,
          canManage: input.canManage,
        },
      })
    }),

  removeDepartmentModuleAccess: adminProcedure
    .input(
      z.object({
        departmentId: z.string(),
        platformModuleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.departmentModuleAccess.delete({
        where: {
          departmentId_platformModuleId: {
            departmentId: input.departmentId,
            platformModuleId: input.platformModuleId,
          },
        },
      })
    }),

  // ==========================================
  // RBAC overview (Admin dashboard)
  // ==========================================

  getRBACOverview: adminProcedure.query(async ({ ctx }) => {
    const [departments, modules, usersByRole, totalUsers] = await Promise.all([
      ctx.prisma.department.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { users: true } },
          moduleAccess: {
            include: {
              platformModule: {
                select: { name: true, slug: true, icon: true },
              },
            },
          },
        },
      }),
      ctx.prisma.platformModule.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      ctx.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      ctx.prisma.user.count(),
    ])

    return {
      departments,
      modules,
      usersByRole: usersByRole.map((r) => ({
        role: r.role,
        count: r._count.role,
      })),
      totalUsers,
    }
  }),

  // Get all users with RBAC info for admin management
  getAllUsersWithRBAC: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobTitle: true,
        image: true,
        createdAt: true,
        department: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
      },
    })
  }),

  // ==========================================
  // Google Admin OU Sync
  // ==========================================

  // Check if Google Admin SDK is configured (admin only)
  isGoogleAdminConfigured: adminProcedure.query(() => {
    return { configured: isGoogleAdminConfigured() }
  }),

  // Check if Google Admin SDK is configured (any authenticated user - for UI to show sync button)
  isGoogleAdminConfiguredForUI: protectedProcedure.query(() => {
    return { configured: isGoogleAdminConfigured() }
  }),

  // Sync a single user's department from Google OU
  syncUserFromGoogle: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: { id: true, email: true },
      })

      if (!user?.email) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found or has no email' })
      }

      if (!isGoogleAdminConfigured()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Google Admin SDK is not configured. Set GOOGLE_SA_CLIENT_EMAIL and GOOGLE_SA_PRIVATE_KEY environment variables.',
        })
      }

      const result = await syncUserDepartmentFromGoogle(user.id, user.email)
      return {
        success: !!result.departmentId,
        departmentName: result.departmentName,
        message: result.departmentId
          ? `Assigned to ${result.departmentName}`
          : 'No matching department found for this user\'s Google OU',
      }
    }),

  // Bulk sync all Google users' departments from their OUs
  syncAllFromGoogle: adminProcedure.mutation(async () => {
    if (!isGoogleAdminConfigured()) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Google Admin SDK is not configured. Set GOOGLE_SA_CLIENT_EMAIL and GOOGLE_SA_PRIVATE_KEY environment variables.',
      })
    }

    const stats = await syncAllGoogleUserDepartments()
    return {
      ...stats,
      message: `Created ${stats.created} new users, synced ${stats.synced} departments, skipped ${stats.skipped}, ${stats.errors} errors`,
    }
  }),
})
