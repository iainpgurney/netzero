import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const DOMAIN_VALUES = ['GOVERNANCE', 'SALES', 'PRODUCT_PLATFORM', 'DELIVERY_MRV', 'PEOPLE', 'FINANCE'] as const
const ROLE_VALUES = ['R', 'A', 'C', 'I'] as const

export const raciRouter = router({
  getLatestVersion: protectedProcedure.query(async ({ ctx }) => {
    const version = await ctx.prisma.raciVersion.findFirst({
      orderBy: { versionNumber: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true } },
        outcomes: {
          orderBy: { order: 'asc' },
          include: { assignments: true },
        },
      },
    })
    return version
  }),

  getOutcomes: protectedProcedure
    .input(z.object({
      domain: z.enum(DOMAIN_VALUES).optional(),
      personName: z.string().optional(),
      kpiSearch: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const version = await ctx.prisma.raciVersion.findFirst({
        orderBy: { versionNumber: 'desc' },
        select: { id: true },
      })
      if (!version) return []

      const where: any = { versionId: version.id }
      if (input?.domain) where.domain = input.domain
      if (input?.kpiSearch) where.kpi = { contains: input.kpiSearch, mode: 'insensitive' }

      let outcomes = await ctx.prisma.raciOutcome.findMany({
        where,
        orderBy: { order: 'asc' },
        include: { assignments: true },
      })

      if (input?.personName) {
        outcomes = outcomes.filter(o =>
          o.assignments.some(a => a.personName.toLowerCase().includes(input.personName!.toLowerCase()))
        )
      }

      return outcomes
    }),

  getPersonLoad: protectedProcedure.query(async ({ ctx }) => {
    const version = await ctx.prisma.raciVersion.findFirst({
      orderBy: { versionNumber: 'desc' },
      select: { id: true },
    })
    if (!version) return []

    const outcomes = await ctx.prisma.raciOutcome.findMany({
      where: { versionId: version.id },
      include: { assignments: true },
    })

    const loadMap = new Map<string, { aCount: number; rCount: number; cCount: number; iCount: number; outcomes: string[]; isJointA: string[]; isTemporaryA: string[] }>()

    for (const outcome of outcomes) {
      for (const a of outcome.assignments) {
        if (!loadMap.has(a.personName)) {
          loadMap.set(a.personName, { aCount: 0, rCount: 0, cCount: 0, iCount: 0, outcomes: [], isJointA: [], isTemporaryA: [] })
        }
        const entry = loadMap.get(a.personName)!
        if (a.role === 'A') {
          entry.aCount++
          if (a.isJointAccountable) entry.isJointA.push(outcome.title)
          if (a.isTemporary) entry.isTemporaryA.push(outcome.title)
        }
        if (a.role === 'R') entry.rCount++
        if (a.role === 'C') entry.cCount++
        if (a.role === 'I') entry.iCount++
        if (!entry.outcomes.includes(outcome.title)) entry.outcomes.push(outcome.title)
      }
    }

    const OVERLOAD_THRESHOLD = 5
    return Array.from(loadMap.entries())
      .map(([personName, data]) => ({
        personName,
        ...data,
        isOverloaded: data.aCount > OVERLOAD_THRESHOLD,
      }))
      .sort((a, b) => b.aCount - a.aCount || b.rCount - a.rCount)
  }),

  getGapsConflicts: protectedProcedure.query(async ({ ctx }) => {
    const version = await ctx.prisma.raciVersion.findFirst({
      orderBy: { versionNumber: 'desc' },
      select: { id: true },
    })
    if (!version) return []

    const outcomes = await ctx.prisma.raciOutcome.findMany({
      where: { versionId: version.id },
      orderBy: { order: 'asc' },
      include: { assignments: true },
    })

    const issues: Array<{ outcomeId: string; outcomeTitle: string; type: string; detail: string }> = []

    for (const outcome of outcomes) {
      const accountables = outcome.assignments.filter(a => a.role === 'A')
      const responsibles = outcome.assignments.filter(a => a.role === 'R')

      if (accountables.length === 0) {
        issues.push({ outcomeId: outcome.id, outcomeTitle: outcome.title, type: 'MISSING_A', detail: 'No Accountable assigned' })
      } else if (accountables.length > 1 && !accountables.every(a => a.isJointAccountable)) {
        issues.push({ outcomeId: outcome.id, outcomeTitle: outcome.title, type: 'MULTIPLE_A', detail: `${accountables.length} Accountable without joint flag` })
      }

      if (responsibles.length === 0) {
        issues.push({ outcomeId: outcome.id, outcomeTitle: outcome.title, type: 'MISSING_R', detail: 'No Responsible assigned' })
      }

      const temporaryAs = accountables.filter(a => a.isTemporary)
      if (temporaryAs.length > 0) {
        issues.push({ outcomeId: outcome.id, outcomeTitle: outcome.title, type: 'TEMPORARY_A', detail: `Temporary Accountable: ${temporaryAs.map(a => a.personName).join(', ')}` })
      }

      if (!outcome.kpi || outcome.kpi === 'TBD') {
        issues.push({ outcomeId: outcome.id, outcomeTitle: outcome.title, type: 'MISSING_KPI', detail: 'KPI is missing or TBD' })
      }
    }

    return issues
  }),

  updateAssignment: adminProcedure
    .input(z.object({
      outcomeId: z.string(),
      personName: z.string().min(1),
      role: z.enum(ROLE_VALUES),
      isJointAccountable: z.boolean().optional(),
      isTemporary: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const outcome = await ctx.prisma.raciOutcome.findUnique({ where: { id: input.outcomeId } })
      if (!outcome) throw new TRPCError({ code: 'NOT_FOUND', message: 'Outcome not found' })

      const existing = await ctx.prisma.raciAssignment.findFirst({
        where: { outcomeId: input.outcomeId, personName: input.personName, role: input.role },
      })

      if (existing) {
        return ctx.prisma.raciAssignment.update({
          where: { id: existing.id },
          data: {
            isJointAccountable: input.isJointAccountable ?? existing.isJointAccountable,
            isTemporary: input.isTemporary ?? existing.isTemporary,
            notes: input.notes ?? existing.notes,
          },
        })
      }

      return ctx.prisma.raciAssignment.create({
        data: {
          outcomeId: input.outcomeId,
          personName: input.personName,
          role: input.role,
          isJointAccountable: input.isJointAccountable ?? false,
          isTemporary: input.isTemporary ?? false,
          notes: input.notes ?? null,
        },
      })
    }),

  removeAssignment: adminProcedure
    .input(z.object({ assignmentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.raciAssignment.delete({ where: { id: input.assignmentId } })
    }),

  createOutcome: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      domain: z.enum(DOMAIN_VALUES),
      kpi: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const version = await ctx.prisma.raciVersion.findFirst({ orderBy: { versionNumber: 'desc' } })
      if (!version) throw new TRPCError({ code: 'NOT_FOUND', message: 'No RACI version found' })

      const maxOrder = await ctx.prisma.raciOutcome.aggregate({
        where: { versionId: version.id },
        _max: { order: true },
      })

      const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      return ctx.prisma.raciOutcome.create({
        data: {
          slug,
          title: input.title,
          domain: input.domain,
          kpi: input.kpi,
          order: (maxOrder._max.order ?? 0) + 1,
          versionId: version.id,
        },
      })
    }),

  deleteOutcome: adminProcedure
    .input(z.object({ outcomeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.raciOutcome.delete({ where: { id: input.outcomeId } })
    }),

  updateKpi: adminProcedure
    .input(z.object({ outcomeId: z.string(), kpi: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.raciOutcome.update({
        where: { id: input.outcomeId },
        data: { kpi: input.kpi },
      })
    }),
})
