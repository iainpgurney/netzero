import { z } from 'zod'
import { router, protectedProcedure, timeOffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { createLeaveEvents, deleteLeaveEvents } from '@/server/google-calendar'

// UK leave year: 1 April - 31 March
function getLeaveYearBounds(date: Date): { start: Date; end: Date; label: string } {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const startYear = month >= 4 ? year : year - 1
  const endYear = startYear + 1
  return {
    start: new Date(startYear, 3, 1), // 1 April
    end: new Date(endYear, 2, 31, 23, 59, 59), // 31 March
    label: `${startYear}-${String(endYear).slice(-2)}`,
  }
}

function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && end1 >= start2
}

function getBusinessDays(start: Date, end: Date): number {
  let count = 0
  const d = new Date(start)
  d.setHours(0, 0, 0, 0)
  const endD = new Date(end)
  endD.setHours(23, 59, 59, 999)
  while (d <= endD) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

// Duration including half-days: single day AM/PM = 0.5, full day = 1
function getDurationDays(
  start: Date,
  end: Date,
  isSingleDay?: boolean,
  singleDayPart?: string
): number {
  const fullDays = getBusinessDays(start, end)
  if (fullDays === 0) return 0
  if (isSingleDay && singleDayPart === 'AM') return 0.5
  if (isSingleDay && singleDayPart === 'PM') return 0.5
  return fullDays
}

export const timeOffRouter = router({
  getCurrentLeaveYear: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const bounds = getLeaveYearBounds(now)
    let leaveYear = await ctx.prisma.leaveYear.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    })
    if (!leaveYear) {
      leaveYear = await ctx.prisma.leaveYear.create({
        data: {
          startDate: bounds.start,
          endDate: bounds.end,
        },
      })
    }
    return leaveYear
  }),

  getEmployees: timeOffProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      where: { email: { not: null } },
      select: {
        id: true,
        name: true,
        email: true,
        departmentId: true,
        department: { select: { name: true, slug: true } },
      },
      orderBy: { name: 'asc' },
    })
    return users
  }),

  getEmployeesWithSummaries: timeOffProcedure
    .input(z.object({ leaveYearId: z.string() }))
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          department: { select: { name: true } },
        },
        orderBy: { name: 'asc' },
      })
      const policies = await ctx.prisma.leavePolicy.findMany({
        where: { leaveYearId: input.leaveYearId },
      })
      const annualUsed = await ctx.prisma.leaveEntry.groupBy({
        by: ['userId'],
        where: {
          leaveYearId: input.leaveYearId,
          type: { in: ['annual_leave', 'personal_leave'] },
          status: 'approved',
        },
        _sum: { durationDays: true },
      })
      const sickUsed = await ctx.prisma.leaveEntry.groupBy({
        by: ['userId'],
        where: {
          leaveYearId: input.leaveYearId,
          type: 'sick_leave',
          status: 'approved',
        },
        _sum: { durationDays: true },
      })
      const volunteerUsed = await ctx.prisma.leaveEntry.groupBy({
        by: ['userId'],
        where: {
          leaveYearId: input.leaveYearId,
          type: 'volunteer_leave',
          status: 'approved',
        },
        _sum: { durationDays: true },
      })
      const tilAgg = await ctx.prisma.timeInLieuAdjustment.groupBy({
        by: ['userId'],
        where: { leaveYearId: input.leaveYearId },
        _sum: { days: true },
      })
      const tilMap = new Map(tilAgg.map((t) => [t.userId, t._sum.days ?? 0]))
      const annualMap = new Map(annualUsed.map((a) => [a.userId, a._sum.durationDays ?? 0]))
      const sickMap = new Map(sickUsed.map((s) => [s.userId, s._sum.durationDays ?? 0]))
      const volunteerMap = new Map(volunteerUsed.map((v) => [v.userId, v._sum.durationDays ?? 0]))
      const policyMap = new Map(policies.map((p) => [p.userId, p]))

      return users.map((u) => {
        const policy = policyMap.get(u.id)
        const allowance = policy?.annualLeaveAllowance ?? 25
        const carryOver = policy?.carryOverDays ?? 0
        const adjustment = policy?.adjustmentDays ?? 0
        const timeInLieu = tilMap.get(u.id) ?? 0
        const used = annualMap.get(u.id) ?? 0
        const remaining = allowance + carryOver + adjustment + timeInLieu - used
        const sickDays = sickMap.get(u.id) ?? 0
        const volunteerDays = volunteerMap.get(u.id) ?? 0
        return {
          ...u,
          allowance,
          used,
          remaining,
          sickDays,
          timeInLieu,
          volunteerDays,
        }
      })
    }),

  getEmployeeLeaveSummary: timeOffProcedure
    .input(z.object({ userId: z.string(), leaveYearId: z.string() }))
    .query(async ({ ctx, input }) => {
      const policy = await ctx.prisma.leavePolicy.findUnique({
        where: {
          userId_leaveYearId: { userId: input.userId, leaveYearId: input.leaveYearId },
        },
      })
      const approvedAnnual = await ctx.prisma.leaveEntry.aggregate({
        where: {
          userId: input.userId,
          leaveYearId: input.leaveYearId,
          type: { in: ['annual_leave', 'personal_leave'] },
          status: 'approved',
        },
        _sum: { durationDays: true },
      })
      const sickEntries = await ctx.prisma.leaveEntry.aggregate({
        where: {
          userId: input.userId,
          leaveYearId: input.leaveYearId,
          type: 'sick_leave',
          status: 'approved',
        },
        _sum: { durationDays: true },
      })
      const volunteerEntries = await ctx.prisma.leaveEntry.aggregate({
        where: {
          userId: input.userId,
          leaveYearId: input.leaveYearId,
          type: 'volunteer_leave',
          status: 'approved',
        },
        _sum: { durationDays: true },
      })
      const tilSum = await ctx.prisma.timeInLieuAdjustment.aggregate({
        where: {
          userId: input.userId,
          leaveYearId: input.leaveYearId,
        },
        _sum: { days: true },
      })
      const allowance = policy?.annualLeaveAllowance ?? 25
      const carryOver = policy?.carryOverDays ?? 0
      const adjustment = policy?.adjustmentDays ?? 0
      const timeInLieu = tilSum._sum.days ?? 0
      const used = approvedAnnual._sum.durationDays ?? 0
      const remaining = allowance + carryOver + adjustment + timeInLieu - used
      return {
        policy,
        allowance,
        carryOver,
        adjustment,
        timeInLieu,
        used,
        remaining,
        sickDays: sickEntries._sum.durationDays ?? 0,
        volunteerDays: volunteerEntries._sum.durationDays ?? 0,
      }
    }),

  getTimeInLieuAdjustments: timeOffProcedure
    .input(z.object({ userId: z.string(), leaveYearId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.timeInLieuAdjustment.findMany({
        where: {
          userId: input.userId,
          leaveYearId: input.leaveYearId,
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  getTimeInLieuAdjustmentsForYear: timeOffProcedure
    .input(z.object({ leaveYearId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.timeInLieuAdjustment.findMany({
        where: { leaveYearId: input.leaveYearId },
        include: {
          user: { select: { id: true, name: true, email: true, department: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      })
    }),

  addTimeInLieuAdjustment: timeOffProcedure
    .input(
      z.object({
        userId: z.string(),
        leaveYearId: z.string(),
        days: z.number().min(0.5),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const leaveYear = await ctx.prisma.leaveYear.findUnique({
        where: { id: input.leaveYearId },
      })
      if (!leaveYear) throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave year not found' })
      const targetUser = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: { name: true },
      })
      if (!targetUser) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      const currentUser = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { name: true },
      })
      const adjustment = await ctx.prisma.timeInLieuAdjustment.create({
        data: {
          userId: input.userId,
          leaveYearId: input.leaveYearId,
          days: input.days,
          reason: input.reason ?? null,
          addedById: ctx.session.user.id,
          addedByName: currentUser?.name ?? null,
        },
      })
      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: 'ADJUST_ALLOWANCE',
          userId: ctx.session.user.id,
          targetId: adjustment.id,
          detail: `Added ${input.days} day(s) time in lieu for ${targetUser.name}${input.reason ? `: ${input.reason}` : ''}`,
          metadata: JSON.stringify({ type: 'time_in_lieu', days: input.days }),
        },
      })
      return adjustment
    }),

  getLeaveEntries: timeOffProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        leaveYearId: z.string(),
        type: z.string().optional(),
        status: z.enum(['requested', 'approved', 'rejected', 'cancelled', 'pending_manager_approval', 'needs_discussion', 'pending_cancellation']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const isSelf = input.userId === ctx.session.user.id
      if (input.userId && !isSelf) {
        // Admin viewing another user - timeOffProcedure already enforces access
      } else if (!input.userId) {
        // Admin viewing all - need to allow
      }
      const entries = await ctx.prisma.leaveEntry.findMany({
        where: {
          ...(input.userId && { userId: input.userId }),
          leaveYearId: input.leaveYearId,
          ...(input.type && { type: input.type }),
          ...(input.status && { status: input.status }),
        },
        include: {
          user: { select: { id: true, name: true, email: true, department: { select: { name: true } } } },
          createdBy: { select: { name: true, email: true } },
        },
        orderBy: { startDate: 'asc' },
      })
      return entries
    }),

  createLeaveEntry: timeOffProcedure
    .input(
      z.object({
        userId: z.string(),
        leaveYearId: z.string(),
        type: z.enum(['annual_leave', 'sick_leave', 'unpaid_leave']),
        startDate: z.date(),
        endDate: z.date(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const leaveYear = await ctx.prisma.leaveYear.findUnique({
        where: { id: input.leaveYearId },
      })
      if (!leaveYear) throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave year not found' })

      const start = new Date(input.startDate)
      const end = new Date(input.endDate)
      if (start < leaveYear.startDate || end > leaveYear.endDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Leave must fall within current leave year (1 April - 31 March)',
        })
      }

      const durationDays = getBusinessDays(start, end)
      const usesAllowance = ['annual_leave', 'personal_leave'].includes(input.type)
      if (usesAllowance) {
        const summary = await ctx.prisma.leavePolicy.findUnique({
          where: { userId_leaveYearId: { userId: input.userId, leaveYearId: input.leaveYearId } },
        })
        const [approved, tilSum] = await Promise.all([
          ctx.prisma.leaveEntry.aggregate({
            where: {
              userId: input.userId,
              leaveYearId: input.leaveYearId,
              type: { in: ['annual_leave', 'personal_leave'] },
              status: 'approved',
            },
            _sum: { durationDays: true },
          }),
          ctx.prisma.timeInLieuAdjustment.aggregate({
            where: { userId: input.userId, leaveYearId: input.leaveYearId },
            _sum: { days: true },
          }),
        ])
        const allowance =
          (summary?.annualLeaveAllowance ?? 25) +
          (summary?.carryOverDays ?? 0) +
          (summary?.adjustmentDays ?? 0) +
          (tilSum._sum.days ?? 0)
        const used = approved._sum.durationDays ?? 0
        if (used + durationDays > allowance) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient balance. Remaining: ${allowance - used} days`,
          })
        }
      }

      let googleEventId: string | null = null
      let sharedEventId: string | null = null
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: { name: true, email: true },
      })
      const isSickLeave = input.type === 'sick_leave'
      if (isSickLeave && user?.email) {
        const startCal = new Date(start)
        const endCal = new Date(end)
        startCal.setHours(0, 0, 0, 0)
        endCal.setHours(23, 59, 59, 999)
        const result = await createLeaveEvents(
          user.email,
          user.name || 'Unknown',
          startCal,
          endCal,
          'sick_leave'
        )
        googleEventId = result.googleEventId
        sharedEventId = result.sharedEventId
      }

      const entry = await ctx.prisma.leaveEntry.create({
        data: {
          userId: input.userId,
          leaveYearId: input.leaveYearId,
          type: input.type,
          startDate: start,
          endDate: end,
          durationDays,
          status: isSickLeave ? 'approved' : 'requested',
          createdById: ctx.session.user.id,
          reason: input.reason,
          googleEventId: isSickLeave ? googleEventId : null,
          sharedEventId: isSickLeave ? sharedEventId : null,
        },
        include: {
          user: { select: { name: true, email: true } },
        },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: isSickLeave ? 'CREATE' : 'CREATE',
          userId: ctx.session.user.id,
          targetId: entry.id,
          detail: `Created ${input.type} for ${entry.user.name}${isSickLeave ? ' (auto-approved)' : ''}`,
          metadata: JSON.stringify({ startDate: start.toISOString(), endDate: end.toISOString() }),
        },
      })

      return entry
    }),

  approveLeaveEntry: timeOffProcedure
    .input(z.object({ entryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.leaveEntry.findUnique({
        where: { id: input.entryId },
        include: {
          user: { select: { id: true, name: true, email: true, departmentId: true } },
          leaveYear: true,
        },
      })
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave entry not found' })
      const pendingStatuses = ['requested', 'pending_manager_approval']
      if (!pendingStatuses.includes(entry.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Entry is not pending approval' })
      }

      const usesAllowance = ['annual_leave', 'personal_leave'].includes(entry.type)
      if (usesAllowance && entry.user.departmentId) {
        const deptColleagues = await ctx.prisma.user.findMany({
          where: {
            departmentId: entry.user.departmentId,
            id: { not: entry.userId },
          },
          select: { id: true },
        })
        const colleagueIds = deptColleagues.map((c) => c.id)
        const overlapping = await ctx.prisma.leaveEntry.findMany({
          where: {
            userId: { in: colleagueIds },
            type: { in: ['annual_leave', 'personal_leave'] },
            status: 'approved',
            leaveYearId: entry.leaveYearId,
          },
        })
        const hasConflict = overlapping.some((o) =>
          datesOverlap(entry.startDate, entry.endDate, o.startDate, o.endDate)
        )
        if (hasConflict) {
          const conflictEntries = overlapping.filter((o) =>
            datesOverlap(entry.startDate, entry.endDate, o.startDate, o.endDate)
          )
          const names = await ctx.prisma.user.findMany({
            where: { id: { in: conflictEntries.map((c) => c.userId) } },
            select: { name: true },
          })
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Department colleague(s) already have approved leave: ${names.map((u) => u.name).join(', ')}`,
          })
        }
      }

      let googleEventId: string | null = null
      let sharedEventId: string | null = null
      const userEmail = entry.user.email
      if (userEmail) {
        const start = new Date(entry.startDate)
        const end = new Date(entry.endDate)
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        const calendarType: 'annual_leave' | 'sick_leave' | 'volunteer_leave' =
          entry.type === 'sick_leave'
            ? 'sick_leave'
            : entry.type === 'volunteer_leave'
            ? 'volunteer_leave'
            : 'annual_leave'
        const result = await createLeaveEvents(
          userEmail,
          entry.user.name || 'Unknown',
          start,
          end,
          calendarType
        )
        googleEventId = result.googleEventId
        sharedEventId = result.sharedEventId
      }

      const updated = await ctx.prisma.leaveEntry.update({
        where: { id: input.entryId },
        data: {
          status: 'approved',
          googleEventId,
          sharedEventId,
          conflictCheckResult: JSON.stringify({ checked: true, conflicts: [] }),
        },
        include: {
          user: { select: { name: true, email: true } },
        },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: 'APPROVE',
          userId: ctx.session.user.id,
          targetId: entry.id,
          detail: `Approved ${entry.type} for ${entry.user.name}`,
        },
      })

      return updated
    }),

  rejectLeaveEntry: timeOffProcedure
    .input(z.object({ entryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.leaveEntry.findUnique({
        where: { id: input.entryId },
        include: { user: { select: { name: true } } },
      })
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave entry not found' })
      const pendingStatuses = ['requested', 'pending_manager_approval']
      if (!pendingStatuses.includes(entry.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Entry is not pending approval' })
      }

      const updated = await ctx.prisma.leaveEntry.update({
        where: { id: input.entryId },
        data: { status: 'rejected' },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: 'REJECT',
          userId: ctx.session.user.id,
          targetId: entry.id,
          detail: `Rejected ${entry.type} for ${entry.user.name}`,
        },
      })

      return updated
    }),

  updateLeavePolicy: timeOffProcedure
    .input(
      z.object({
        userId: z.string(),
        leaveYearId: z.string(),
        annualLeaveAllowance: z.number().min(0).optional(),
        carryOverDays: z.number().min(0).optional(),
        adjustmentDays: z.number().optional(),
        sickTrackingMode: z.enum(['tracked', 'unlimited']).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { annualLeaveAllowance, carryOverDays, adjustmentDays, sickTrackingMode, notes } = input
      const policy = await ctx.prisma.leavePolicy.upsert({
        where: {
          userId_leaveYearId: { userId: input.userId, leaveYearId: input.leaveYearId },
        },
        update: {
          ...(annualLeaveAllowance !== undefined && { annualLeaveAllowance }),
          ...(carryOverDays !== undefined && { carryOverDays }),
          ...(adjustmentDays !== undefined && { adjustmentDays }),
          ...(sickTrackingMode !== undefined && { sickTrackingMode }),
          ...(notes !== undefined && { notes }),
        },
        create: {
          userId: input.userId,
          leaveYearId: input.leaveYearId,
          annualLeaveAllowance: annualLeaveAllowance ?? 25,
          carryOverDays: carryOverDays ?? 0,
          adjustmentDays: adjustmentDays ?? 0,
          sickTrackingMode: sickTrackingMode ?? 'tracked',
          notes: notes ?? null,
        },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: 'ADJUST_ALLOWANCE',
          userId: ctx.session.user.id,
          targetId: policy.id,
          detail: `Updated leave policy for user ${input.userId}`,
          metadata: JSON.stringify(input),
        },
      })

      return policy
    }),

  getConflictCheck: timeOffProcedure
    .input(
      z.object({
        userId: z.string(),
        leaveYearId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: { departmentId: true },
      })
      if (!user?.departmentId) return { conflicts: [], hasConflict: false }

      const colleagues = await ctx.prisma.user.findMany({
        where: { departmentId: user.departmentId, id: { not: input.userId } },
        select: { id: true, name: true },
      })
      const overlapping = await ctx.prisma.leaveEntry.findMany({
        where: {
          userId: { in: colleagues.map((c) => c.id) },
          type: 'annual_leave',
          status: 'approved',
          leaveYearId: input.leaveYearId,
        },
        include: { user: { select: { name: true } } },
      })
      const conflicts = overlapping.filter((o) =>
        datesOverlap(input.startDate, input.endDate, o.startDate, o.endDate)
      )
      return {
        conflicts: conflicts.map((c) => ({ name: c.user.name, startDate: c.startDate, endDate: c.endDate })),
        hasConflict: conflicts.length > 0,
      }
    }),

  getDashboardStats: timeOffProcedure
    .input(z.object({ leaveYearId: z.string() }))
    .query(async ({ ctx, input }) => {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

      const [leaveThisMonth, upcomingLeave, sickThisMonth, pendingRequests] = await Promise.all([
        ctx.prisma.leaveEntry.aggregate({
          where: {
            leaveYearId: input.leaveYearId,
            type: { in: ['annual_leave', 'personal_leave'] },
            status: 'approved',
            startDate: { lte: monthEnd },
            endDate: { gte: monthStart },
          },
          _sum: { durationDays: true },
        }),
        ctx.prisma.leaveEntry.count({
          where: {
            leaveYearId: input.leaveYearId,
            type: { in: ['annual_leave', 'personal_leave'] },
            status: 'approved',
            startDate: { gte: now },
          },
        }),
        ctx.prisma.leaveEntry.aggregate({
          where: {
            leaveYearId: input.leaveYearId,
            type: 'sick_leave',
            status: 'approved',
            startDate: { lte: monthEnd },
            endDate: { gte: monthStart },
          },
          _sum: { durationDays: true },
        }),
        ctx.prisma.leaveEntry.count({
          where: {
            leaveYearId: input.leaveYearId,
            status: { in: ['requested', 'pending_manager_approval'] },
          },
        }),
      ])

      return {
        leaveBookedThisMonth: leaveThisMonth._sum.durationDays ?? 0,
        upcomingLeave,
        sickDaysThisMonth: sickThisMonth._sum.durationDays ?? 0,
        pendingRequests,
      }
    }),

  getUsersForManagerDropdown: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      where: { email: { not: null } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    })
    return users
  }),

  submitLeaveRequest: protectedProcedure
    .input(
      z.object({
        employeeName: z.string().min(1),
        managerId: z.string().min(1),
        startDate: z.date(),
        endDate: z.date(),
        isSingleDay: z.boolean(),
        singleDayPart: z.enum(['AM', 'PM', 'full_day']).optional(),
        numberOfDays: z.number().min(0.5),
        leaveType: z.enum([
          'sick_leave',
          'bereavement_immediate',
          'bereavement_other',
          'personal_leave',
          'annual_leave',
          'volunteer_leave',
          'jury_duty',
          'emergency_leave',
          'temporary_leave',
          'leave_without_pay',
          'other',
        ]),
        leaveTypeOther: z.string().optional(),
        reason: z.string().min(1),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date()
      const bounds = getLeaveYearBounds(now)
      let leaveYear = await ctx.prisma.leaveYear.findFirst({
        where: {
          startDate: { lte: now },
          endDate: { gte: now },
        },
      })
      if (!leaveYear) {
        leaveYear = await ctx.prisma.leaveYear.create({
          data: {
            startDate: bounds.start,
            endDate: bounds.end,
          },
        })
      }

      const start = new Date(input.startDate)
      const end = new Date(input.endDate)
      if (end < start) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End date must be the same as or after the start date.',
        })
      }
      if (start < leaveYear.startDate || end > leaveYear.endDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Leave must fall within current leave year (1 April - 31 March)',
        })
      }

      const usesAllowance = ['annual_leave', 'personal_leave'].includes(input.leaveType)
      if (usesAllowance) {
        const [summary, approved, tilSum] = await Promise.all([
          ctx.prisma.leavePolicy.findUnique({
            where: {
              userId_leaveYearId: { userId: ctx.session.user.id, leaveYearId: leaveYear.id },
            },
          }),
          ctx.prisma.leaveEntry.aggregate({
            where: {
              userId: ctx.session.user.id,
              leaveYearId: leaveYear.id,
              type: { in: ['annual_leave', 'personal_leave'] },
              status: 'approved',
            },
            _sum: { durationDays: true },
          }),
          ctx.prisma.timeInLieuAdjustment.aggregate({
            where: { userId: ctx.session.user.id, leaveYearId: leaveYear.id },
            _sum: { days: true },
          }),
        ])
        const allowance =
          (summary?.annualLeaveAllowance ?? 25) +
          (summary?.carryOverDays ?? 0) +
          (summary?.adjustmentDays ?? 0) +
          (tilSum._sum.days ?? 0)
        const used = approved._sum.durationDays ?? 0
        if (used + input.numberOfDays > allowance) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient balance. Remaining: ${allowance - used} days`,
          })
        }
      }

      const VOLUNTEER_DAYS_ALLOWANCE = 2
      if (input.leaveType === 'volunteer_leave') {
        const volunteerUsed = await ctx.prisma.leaveEntry.aggregate({
          where: {
            userId: ctx.session.user.id,
            leaveYearId: leaveYear.id,
            type: 'volunteer_leave',
            status: { in: ['approved', 'pending_manager_approval', 'pending_cancellation'] },
          },
          _sum: { durationDays: true },
        })
        const used = volunteerUsed._sum.durationDays ?? 0
        if (used + input.numberOfDays > VOLUNTEER_DAYS_ALLOWANCE) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Volunteer days limit: ${VOLUNTEER_DAYS_ALLOWANCE} per year. Remaining: ${VOLUNTEER_DAYS_ALLOWANCE - used} days`,
          })
        }
      }

      const manager = await ctx.prisma.user.findUnique({
        where: { id: input.managerId },
        select: { name: true },
      })

      const entry = await ctx.prisma.leaveEntry.create({
        data: {
          userId: ctx.session.user.id,
          leaveYearId: leaveYear.id,
          type: input.leaveType,
          startDate: start,
          endDate: end,
          durationDays: input.numberOfDays,
          allDay: !input.isSingleDay || input.singleDayPart === 'full_day',
          status: 'pending_manager_approval',
          createdById: ctx.session.user.id,
          reason: input.reason,
          isSingleDay: input.isSingleDay,
          singleDayPart: input.singleDayPart ?? null,
          leaveTypeOther: input.leaveTypeOther ?? null,
          notes: input.notes ?? null,
          managerId: input.managerId,
          managerName: manager?.name ?? null,
        },
        include: {
          user: { select: { name: true, email: true } },
          leaveYear: true,
        },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: 'CREATE',
          userId: ctx.session.user.id,
          targetId: entry.id,
          detail: `Submitted leave request for ${entry.user.name}`,
          metadata: JSON.stringify({ leaveType: input.leaveType, startDate: start.toISOString(), endDate: end.toISOString() }),
        },
      })

      return entry
    }),

  getMyLeaveRequests: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date()
    let leaveYear = await ctx.prisma.leaveYear.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    })
    if (!leaveYear) return []

    const entries = await ctx.prisma.leaveEntry.findMany({
      where: {
        userId: ctx.session.user.id,
        leaveYearId: leaveYear.id,
      },
      include: {
        leaveYear: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return entries
  }),

  updateMyLeaveRequest: protectedProcedure
    .input(
      z.object({
        entryId: z.string(),
        employeeName: z.string().min(1).optional(),
        managerId: z.string().min(1).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        isSingleDay: z.boolean().optional(),
        singleDayPart: z.enum(['AM', 'PM', 'full_day']).optional(),
        numberOfDays: z.number().min(0.5).optional(),
        leaveType: z
          .enum([
            'sick_leave',
            'bereavement_immediate',
            'bereavement_other',
            'personal_leave',
            'annual_leave',
            'volunteer_leave',
            'jury_duty',
            'emergency_leave',
            'temporary_leave',
            'leave_without_pay',
            'other',
          ])
          .optional(),
        leaveTypeOther: z.string().optional(),
        reason: z.string().min(1).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.leaveEntry.findUnique({
        where: { id: input.entryId },
        include: { leaveYear: true },
      })
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave entry not found' })
      if (entry.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own requests' })
      }
      if (entry.status !== 'pending_manager_approval') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot edit after approval or rejection' })
      }

      const updates: Record<string, unknown> = {}
      if (input.employeeName !== undefined) {
        // No employeeName on LeaveEntry - stored via user
        // Skip or we could add a display name override
      }
      if (input.managerId !== undefined) {
        const manager = await ctx.prisma.user.findUnique({
          where: { id: input.managerId },
          select: { name: true },
        })
        updates.managerId = input.managerId
        updates.managerName = manager?.name ?? null
      }
      if (input.startDate !== undefined) updates.startDate = input.startDate
      if (input.endDate !== undefined) updates.endDate = input.endDate
      if (input.isSingleDay !== undefined) updates.isSingleDay = input.isSingleDay
      if (input.singleDayPart !== undefined) updates.singleDayPart = input.singleDayPart
      if (input.numberOfDays !== undefined) updates.durationDays = input.numberOfDays
      if (input.leaveType !== undefined) updates.type = input.leaveType
      if (input.leaveTypeOther !== undefined) updates.leaveTypeOther = input.leaveTypeOther
      if (input.reason !== undefined) updates.reason = input.reason
      if (input.notes !== undefined) updates.notes = input.notes

      if (input.startDate && input.endDate && input.endDate < input.startDate) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'End date must be the same as or after the start date.',
        })
      }
      if (input.startDate && input.startDate < entry.leaveYear.startDate) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Start date outside leave year' })
      }
      if (input.endDate && input.endDate > entry.leaveYear.endDate) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'End date outside leave year' })
      }

      const newLeaveType = input.leaveType ?? entry.type
      const newNumberOfDays = input.numberOfDays ?? entry.durationDays
      const VOLUNTEER_DAYS_ALLOWANCE = 2
      if (newLeaveType === 'volunteer_leave') {
        const volunteerUsed = await ctx.prisma.leaveEntry.aggregate({
          where: {
            userId: entry.userId,
            leaveYearId: entry.leaveYearId,
            type: 'volunteer_leave',
            status: { in: ['approved', 'pending_manager_approval', 'pending_cancellation'] },
            id: { not: entry.id },
          },
          _sum: { durationDays: true },
        })
        const used = volunteerUsed._sum.durationDays ?? 0
        if (used + newNumberOfDays > VOLUNTEER_DAYS_ALLOWANCE) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Volunteer days limit: ${VOLUNTEER_DAYS_ALLOWANCE} per year. Remaining: ${VOLUNTEER_DAYS_ALLOWANCE - used} days`,
          })
        }
      }

      const updated = await ctx.prisma.leaveEntry.update({
        where: { id: input.entryId },
        data: updates,
        include: {
          user: { select: { name: true, email: true } },
          leaveYear: true,
        },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: 'CREATE',
          userId: ctx.session.user.id,
          targetId: entry.id,
          detail: 'Updated leave request',
          metadata: JSON.stringify(updates),
        },
      })

      return updated
    }),

  getPendingForManager: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date()
    let leaveYear = await ctx.prisma.leaveYear.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    })
    if (!leaveYear) return []

    const entries = await ctx.prisma.leaveEntry.findMany({
      where: {
        managerId: ctx.session.user.id,
        leaveYearId: leaveYear.id,
        status: { in: ['pending_manager_approval', 'pending_cancellation'] },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        leaveYear: true,
      },
      orderBy: { createdAt: 'asc' },
    })
    return entries
  }),

  managerApproveLeave: protectedProcedure
    .input(
      z.object({
        entryId: z.string(),
        approval: z.enum(['yes', 'no', 'speak_to_line_manager']),
        managerNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.leaveEntry.findUnique({
        where: { id: input.entryId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          leaveYear: true,
        },
      })
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave entry not found' })
      if (entry.managerId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not the assigned manager for this request' })
      }
      if (entry.status !== 'pending_manager_approval') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Request has already been processed' })
      }

      const statusMap = {
        yes: 'approved' as const,
        no: 'rejected' as const,
        speak_to_line_manager: 'needs_discussion' as const,
      }
      const newStatus = statusMap[input.approval]

      let googleEventId: string | null = null
      let sharedEventId: string | null = null
      if (newStatus === 'approved' && entry.user.email) {
        const start = new Date(entry.startDate)
        const end = new Date(entry.endDate)
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        const calendarType: 'annual_leave' | 'sick_leave' | 'volunteer_leave' =
          entry.type === 'sick_leave'
            ? 'sick_leave'
            : entry.type === 'volunteer_leave'
            ? 'volunteer_leave'
            : 'annual_leave'
        const result = await createLeaveEvents(
          entry.user.email,
          entry.user.name || 'Unknown',
          start,
          end,
          calendarType
        )
        googleEventId = result.googleEventId
        sharedEventId = result.sharedEventId
      }

      const updated = await ctx.prisma.leaveEntry.update({
        where: { id: input.entryId },
        data: {
          status: newStatus,
          managerApproval: input.approval,
          managerNotes: input.managerNotes ?? null,
          ...(newStatus === 'approved' && { googleEventId, sharedEventId }),
        },
        include: {
          user: { select: { name: true, email: true } },
        },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: input.approval === 'yes' ? 'APPROVE' : input.approval === 'no' ? 'REJECT' : 'APPROVE',
          userId: ctx.session.user.id,
          targetId: entry.id,
          detail: `Manager ${input.approval} for ${entry.user.name}`,
          metadata: JSON.stringify({ approval: input.approval, managerNotes: input.managerNotes }),
        },
      })

      return updated
    }),

  requestCancelLeave: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.leaveEntry.findUnique({
        where: { id: input.entryId },
        include: { user: { select: { name: true } } },
      })
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave entry not found' })
      if (entry.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only request cancellation for your own leave' })
      }
      const allowedStatuses = ['pending_manager_approval', 'needs_discussion', 'approved']
      if (!allowedStatuses.includes(entry.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot request cancellation for this leave status',
        })
      }

      const updated = await ctx.prisma.leaveEntry.update({
        where: { id: input.entryId },
        data: {
          status: 'pending_cancellation',
          statusBeforeCancellation: entry.status,
        },
        include: {
          user: { select: { name: true, email: true } },
          leaveYear: true,
        },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: 'CANCEL_REQUESTED',
          userId: ctx.session.user.id,
          targetId: entry.id,
          detail: 'Employee requested cancellation',
        },
      })

      return updated
    }),

  approveCancelRequest: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.leaveEntry.findUnique({
        where: { id: input.entryId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          leaveYear: true,
        },
      })
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave entry not found' })
      if (entry.managerId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not the assigned manager for this request' })
      }
      if (entry.status !== 'pending_cancellation') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Entry is not pending cancellation approval' })
      }

      if (entry.statusBeforeCancellation === 'approved' && (entry.googleEventId || entry.sharedEventId) && entry.user.email) {
        await deleteLeaveEvents(entry.googleEventId, entry.sharedEventId, entry.user.email)
      }

      const updated = await ctx.prisma.leaveEntry.update({
        where: { id: input.entryId },
        data: {
          status: 'cancelled',
          statusBeforeCancellation: null,
          googleEventId: null,
          sharedEventId: null,
        },
        include: {
          user: { select: { name: true, email: true } },
        },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: 'CANCEL_APPROVED',
          userId: ctx.session.user.id,
          targetId: entry.id,
          detail: 'Manager approved cancellation',
        },
      })

      return updated
    }),

  rejectCancelRequest: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.leaveEntry.findUnique({
        where: { id: input.entryId },
        include: { user: { select: { name: true } } },
      })
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave entry not found' })
      if (entry.managerId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not the assigned manager for this request' })
      }
      if (entry.status !== 'pending_cancellation') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Entry is not pending cancellation approval' })
      }
      const revertStatus = entry.statusBeforeCancellation ?? 'pending_manager_approval'

      const updated = await ctx.prisma.leaveEntry.update({
        where: { id: input.entryId },
        data: {
          status: revertStatus,
          statusBeforeCancellation: null,
        },
        include: {
          user: { select: { name: true, email: true } },
          leaveYear: true,
        },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: 'CANCEL_REJECTED',
          userId: ctx.session.user.id,
          targetId: entry.id,
          detail: 'Manager rejected cancellation',
        },
      })

      return updated
    }),

  cancelLeaveEntry: timeOffProcedure
    .input(z.object({ entryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.leaveEntry.findUnique({
        where: { id: input.entryId },
        include: {
          user: { select: { name: true, email: true } },
        },
      })
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave entry not found' })
      const allowedStatuses = ['pending_manager_approval', 'needs_discussion', 'approved', 'pending_cancellation']
      if (!allowedStatuses.includes(entry.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel this leave entry',
        })
      }

      const wasApproved = entry.status === 'approved' || entry.statusBeforeCancellation === 'approved'
      if (wasApproved && (entry.googleEventId || entry.sharedEventId) && entry.user.email) {
        await deleteLeaveEvents(entry.googleEventId, entry.sharedEventId, entry.user.email)
      }

      const updated = await ctx.prisma.leaveEntry.update({
        where: { id: input.entryId },
        data: {
          status: 'cancelled',
          statusBeforeCancellation: null,
          googleEventId: null,
          sharedEventId: null,
        },
        include: {
          user: { select: { name: true, email: true } },
        },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: 'CANCEL',
          userId: ctx.session.user.id,
          targetId: entry.id,
          detail: 'HR cancelled request',
        },
      })

      return updated
    }),

  cancelLeaveRequestAsManager: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.prisma.leaveEntry.findUnique({
        where: { id: input.entryId },
        include: {
          user: { select: { name: true, email: true } },
        },
      })
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Leave entry not found' })
      if (entry.managerId !== ctx.session.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not the assigned manager for this request' })
      }
      const allowedStatuses = ['pending_manager_approval', 'needs_discussion', 'approved']
      if (!allowedStatuses.includes(entry.status)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot cancel this leave entry',
        })
      }

      if (entry.status === 'approved' && (entry.googleEventId || entry.sharedEventId) && entry.user.email) {
        await deleteLeaveEvents(entry.googleEventId, entry.sharedEventId, entry.user.email)
      }

      const updated = await ctx.prisma.leaveEntry.update({
        where: { id: input.entryId },
        data: {
          status: 'cancelled',
          statusBeforeCancellation: null,
          googleEventId: null,
          sharedEventId: null,
        },
        include: {
          user: { select: { name: true, email: true } },
        },
      })

      await ctx.prisma.leaveAuditLog.create({
        data: {
          action: 'CANCEL',
          userId: ctx.session.user.id,
          targetId: entry.id,
          detail: 'Manager cancelled request',
        },
      })

      return updated
    }),

  getMyLeaveSummary: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const bounds = getLeaveYearBounds(now)
    let leaveYear = await ctx.prisma.leaveYear.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    })
    if (!leaveYear) {
      leaveYear = await ctx.prisma.leaveYear.create({
        data: {
          startDate: bounds.start,
          endDate: bounds.end,
        },
      })
    }

    const policy = await ctx.prisma.leavePolicy.findUnique({
      where: {
        userId_leaveYearId: { userId: ctx.session.user.id, leaveYearId: leaveYear.id },
      },
    })
    const approvedAnnual = await ctx.prisma.leaveEntry.aggregate({
      where: {
        userId: ctx.session.user.id,
        leaveYearId: leaveYear.id,
        type: { in: ['annual_leave', 'personal_leave'] },
        status: 'approved',
      },
      _sum: { durationDays: true },
    })
    const sickEntries = await ctx.prisma.leaveEntry.aggregate({
      where: {
        userId: ctx.session.user.id,
        leaveYearId: leaveYear.id,
        type: 'sick_leave',
        status: 'approved',
      },
      _sum: { durationDays: true },
    })
    const upcoming = await ctx.prisma.leaveEntry.findMany({
      where: {
        userId: ctx.session.user.id,
        leaveYearId: leaveYear.id,
        status: 'approved',
        startDate: { gte: new Date() },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    })

    const tilSum = await ctx.prisma.timeInLieuAdjustment.aggregate({
      where: {
        userId: ctx.session.user.id,
        leaveYearId: leaveYear.id,
      },
      _sum: { days: true },
    })
    const allowance = policy?.annualLeaveAllowance ?? 25
    const carryOver = policy?.carryOverDays ?? 0
    const adjustment = policy?.adjustmentDays ?? 0
    const timeInLieu = tilSum._sum.days ?? 0
    const used = approvedAnnual._sum.durationDays ?? 0
    const remaining = allowance + carryOver + adjustment + timeInLieu - used

    return {
      leaveYear: `${bounds.start.getFullYear()}-${bounds.end.getFullYear()}`,
      allowance,
      carryOver,
      adjustment,
      timeInLieu,
      used,
      remaining,
      sickDays: sickEntries._sum.durationDays ?? 0,
      upcoming,
    }
  }),
})
