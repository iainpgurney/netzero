import { z } from 'zod'
import { router, adminProcedure } from '../trpc'

export const auditRouter = router({
  // Get audit logs with filters and pagination
  getLogs: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(10).max(100).default(50),
        category: z.string().optional(),
        severity: z.string().optional(),
        action: z.string().optional(),
        userId: z.string().optional(),
        search: z.string().optional(),
        from: z.string().optional(), // ISO date string
        to: z.string().optional(),   // ISO date string
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1
      const pageSize = input?.pageSize ?? 50
      const skip = (page - 1) * pageSize

      // Build where clause
      const where: Record<string, unknown> = {}

      if (input?.category) {
        where.category = input.category
      }
      if (input?.severity) {
        where.severity = input.severity
      }
      if (input?.action) {
        where.action = input.action
      }
      if (input?.userId) {
        where.userId = input.userId
      }
      if (input?.search) {
        where.OR = [
          { detail: { contains: input.search, mode: 'insensitive' } },
          { userEmail: { contains: input.search, mode: 'insensitive' } },
          { action: { contains: input.search, mode: 'insensitive' } },
        ]
      }
      if (input?.from || input?.to) {
        where.timestamp = {}
        if (input?.from) {
          (where.timestamp as Record<string, unknown>).gte = new Date(input.from)
        }
        if (input?.to) {
          (where.timestamp as Record<string, unknown>).lte = new Date(input.to)
        }
      }

      const [logs, totalCount] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          skip,
          take: pageSize,
        }),
        ctx.prisma.auditLog.count({ where }),
      ])

      return {
        logs,
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      }
    }),

  // Get summary stats for the dashboard
  getSummary: adminProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalLogs,
      last24h,
      last7d,
      errorCount,
      warnCount,
      loginCount24h,
      categoryCounts,
      recentErrors,
    ] = await Promise.all([
      ctx.prisma.auditLog.count(),
      ctx.prisma.auditLog.count({ where: { timestamp: { gte: twentyFourHoursAgo } } }),
      ctx.prisma.auditLog.count({ where: { timestamp: { gte: sevenDaysAgo } } }),
      ctx.prisma.auditLog.count({ where: { severity: 'ERROR', timestamp: { gte: sevenDaysAgo } } }),
      ctx.prisma.auditLog.count({ where: { severity: 'WARN', timestamp: { gte: sevenDaysAgo } } }),
      ctx.prisma.auditLog.count({
        where: { action: 'USER_LOGIN', timestamp: { gte: twentyFourHoursAgo } },
      }),
      ctx.prisma.auditLog.groupBy({
        by: ['category'],
        _count: { id: true },
        where: { timestamp: { gte: sevenDaysAgo } },
        orderBy: { _count: { id: 'desc' } },
      }),
      ctx.prisma.auditLog.findMany({
        where: { severity: { in: ['ERROR', 'CRITICAL'] } },
        orderBy: { timestamp: 'desc' },
        take: 5,
      }),
    ])

    return {
      totalLogs,
      last24h,
      last7d,
      errorCount,
      warnCount,
      loginCount24h,
      categoryCounts: categoryCounts.map((c) => ({
        category: c.category,
        count: c._count.id,
      })),
      recentErrors,
    }
  }),

  // Get distinct values for filter dropdowns
  getFilterOptions: adminProcedure.query(async ({ ctx }) => {
    const [categories, actions, severities] = await Promise.all([
      ctx.prisma.auditLog.findMany({
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      }),
      ctx.prisma.auditLog.findMany({
        select: { action: true },
        distinct: ['action'],
        orderBy: { action: 'asc' },
      }),
      ctx.prisma.auditLog.findMany({
        select: { severity: true },
        distinct: ['severity'],
        orderBy: { severity: 'asc' },
      }),
    ])

    return {
      categories: categories.map((c) => c.category),
      actions: actions.map((a) => a.action),
      severities: severities.map((s) => s.severity),
    }
  }),
})
