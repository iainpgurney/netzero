import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { audit, AuditActions } from '@/server/audit'

/**
 * RAG (Red/Amber/Green) router
 * Handles department health status tracking
 */
export const ragRouter = router({
  /**
   * Get all departments with their current RAG status
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const departments = await ctx.prisma.department.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        ragHistory: {
          take: 2,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    return departments.map((dept) => {
      // Get previous status from history (second entry)
      const previousStatusEntry = dept.ragHistory[1]
      const previousStatus = previousStatusEntry
        ? (previousStatusEntry.status.toLowerCase() as 'green' | 'amber' | 'red')
        : null

      // Compare reasons to detect if reason changed while status stayed same
      const previousReason = previousStatusEntry?.reason || ''
      const currentReason = dept.ragReason || ''
      const reasonChanged = !!previousStatusEntry && previousReason !== currentReason

      return {
        id: dept.id,
        name: dept.name,
        slug: dept.slug,
        description: dept.description,
        order: dept.order,
        currentStatus: dept.ragStatus.toLowerCase() as 'green' | 'amber' | 'red',
        currentReason: dept.ragReason || '',
        priority: dept.ragPriority as 'P1' | 'P2' | 'P3' | null,
        lastUpdated: dept.ragLastUpdated,
        updatedBy: dept.ragUpdatedBy,
        previousStatus,
        reasonChanged,
      }
    })
  }),

  /**
   * Update a department's RAG status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        departmentId: z.string(),
        status: z.enum(['GREEN', 'AMBER', 'RED']),
        reason: z.string().min(10, 'Reason must be at least 10 characters'),
        priority: z.enum(['P1', 'P2', 'P3']).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { departmentId, status, reason, priority } = input
      const userId = ctx.session.user.id

      const department = await ctx.prisma.department.findUnique({
        where: { id: departmentId },
      })

      if (!department) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Department not found',
        })
      }

      // Update department RAG fields
      const updatedDepartment = await ctx.prisma.department.update({
        where: { id: departmentId },
        data: {
          ragStatus: status,
          ragReason: reason,
          ragPriority: priority ?? null,
          ragLastUpdated: new Date(),
          ragUpdatedBy: userId,
        },
      })

      // Create status history entry
      await ctx.prisma.ragStatusHistory.create({
        data: {
          departmentId,
          status,
          reason,
          updatedBy: userId,
        },
      })

      // Audit: RAG status updated
      audit({
        action: AuditActions.RAG_STATUS_UPDATED,
        category: 'RAG',
        userId,
        userEmail: ctx.session.user.email ?? undefined,
        detail: `RAG status for ${department.name} changed to ${status}`,
        targetId: departmentId,
        targetType: 'Department',
        metadata: { departmentName: department.name, status, reason, priority },
      })

      return {
        id: updatedDepartment.id,
        name: updatedDepartment.name,
        slug: updatedDepartment.slug,
        currentStatus: updatedDepartment.ragStatus.toLowerCase() as 'green' | 'amber' | 'red',
        currentReason: updatedDepartment.ragReason || '',
        priority: updatedDepartment.ragPriority as 'P1' | 'P2' | 'P3' | null,
        lastUpdated: updatedDepartment.ragLastUpdated,
        updatedBy: updatedDepartment.ragUpdatedBy,
      }
    }),

  /**
   * Get status history for a department
   */
  getHistory: protectedProcedure
    .input(z.object({ departmentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const history = await ctx.prisma.ragStatusHistory.findMany({
        where: { departmentId: input.departmentId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })

      return history.map((entry) => ({
        id: entry.id,
        status: entry.status.toLowerCase() as 'green' | 'amber' | 'red',
        reason: entry.reason,
        updatedBy: entry.updatedBy,
        createdAt: entry.createdAt,
      }))
    }),

  /**
   * Get a single department's RAG status by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const department = await ctx.prisma.department.findUnique({
        where: { id: input.id },
        include: {
          ragHistory: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!department) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Department not found',
        })
      }

      return {
        id: department.id,
        name: department.name,
        slug: department.slug,
        description: department.description,
        order: department.order,
        currentStatus: department.ragStatus.toLowerCase() as 'green' | 'amber' | 'red',
        currentReason: department.ragReason || '',
        priority: department.ragPriority as 'P1' | 'P2' | 'P3' | null,
        lastUpdated: department.ragLastUpdated,
        updatedBy: department.ragUpdatedBy,
        history: department.ragHistory.map((entry) => ({
          id: entry.id,
          status: entry.status.toLowerCase() as 'green' | 'amber' | 'red',
          reason: entry.reason,
          updatedBy: entry.updatedBy,
          createdAt: entry.createdAt,
        })),
      }
    }),

  // ==========================================
  // Key Metrics
  // ==========================================

  getKeyMetrics: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.ragKeyMetric.findMany({
      orderBy: { order: 'asc' },
    })
  }),

  updateKeyMetrics: adminProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          value: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      for (const metric of input) {
        await ctx.prisma.ragKeyMetric.update({
          where: { id: metric.id },
          data: { value: metric.value },
        })
      }
      return { success: true }
    }),

  // ==========================================
  // Q1 Priorities
  // ==========================================

  getPriorities: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.ragPriority.findMany({
      orderBy: { order: 'asc' },
    })
  }),

  updatePriorities: adminProcedure
    .input(
      z.array(
        z.object({
          label: z.string().min(1),
          order: z.number(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      // Replace all priorities
      await ctx.prisma.ragPriority.deleteMany({})
      for (const priority of input) {
        await ctx.prisma.ragPriority.create({
          data: priority,
        })
      }
      return { success: true }
    }),
})
