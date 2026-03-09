import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { audit, AuditActions } from '@/server/audit'

const CROSS_BOARD_ACCESS: Record<string, string[]> = {
  'hannah@carma.earth': ['rev-ops', 'c-suite'],
}

function hasCrossBoardAccess(email: string | null | undefined, departmentSlug: string): boolean {
  if (!email) return false
  return (CROSS_BOARD_ACCESS[email.toLowerCase()] ?? []).includes(departmentSlug)
}

export const kanbanRouter = router({
  getCrossBoardAccess: protectedProcedure
    .query(({ ctx }) => {
      const email = ctx.session.user.email?.toLowerCase() ?? ''
      return CROSS_BOARD_ACCESS[email] ?? []
    }),

  getUsersForBoard: protectedProcedure
    .input(z.object({ departmentSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const department = await ctx.prisma.department.findUnique({
        where: { slug: input.departmentSlug },
      })
      if (!department) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Department not found' })
      }
      const deptUsers = await ctx.prisma.user.findMany({
        where: { departmentId: department.id, email: { not: null } },
        select: { id: true, name: true, email: true, image: true },
        orderBy: { name: 'asc' },
      })
      if (deptUsers.length > 0) return deptUsers
      // Fallback: all users (e.g. if department not yet synced from Google)
      return ctx.prisma.user.findMany({
        where: { email: { not: null } },
        select: { id: true, name: true, email: true, image: true },
        orderBy: { name: 'asc' },
      })
    }),

  // Get cards for a department board
  getCards: protectedProcedure
    .input(z.object({ departmentSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const department = await ctx.prisma.department.findUnique({
        where: { slug: input.departmentSlug },
      })
      if (!department) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Department not found' })
      }

      // All authenticated users can view any department board

      // Auto-cleanup: delete done cards older than 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      await ctx.prisma.kanbanCard.deleteMany({
        where: {
          departmentId: department.id,
          status: 'done',
          doneAt: { lt: thirtyDaysAgo },
        },
      })

      return ctx.prisma.kanbanCard.findMany({
        where: { departmentId: department.id },
        include: {
          assignee: {
            select: { id: true, name: true, image: true, email: true },
          },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      })
    }),

  // Create a card
  createCard: protectedProcedure
    .input(
      z.object({
        departmentSlug: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        assigneeId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const department = await ctx.prisma.department.findUnique({
        where: { slug: input.departmentSlug },
      })
      if (!department) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Department not found' })
      }

      const userRole = ctx.session.user.role || 'MEMBER'
      const userDeptId = ctx.session.user.departmentId
      const userEmail = ctx.session.user.email?.toLowerCase() ?? ''
      const crossAccess = CROSS_BOARD_ACCESS[userEmail] ?? []
      const hasCrossAccess = crossAccess.includes(input.departmentSlug)
      if (userRole !== 'SUPER_ADMIN' && userDeptId !== department.id && !hasCrossAccess) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own department board' })
      }

      const maxOrder = await ctx.prisma.kanbanCard.aggregate({
        where: { departmentId: department.id, status: 'todo' },
        _max: { order: true },
      })

      const card = await ctx.prisma.kanbanCard.create({
        data: {
          departmentId: department.id,
          title: input.title,
          description: input.description,
          assigneeId: input.assigneeId,
          order: (maxOrder._max.order ?? -1) + 1,
        },
        include: {
          assignee: {
            select: { id: true, name: true, image: true, email: true },
          },
        },
      })

      audit({
        action: AuditActions.KANBAN_CARD_CREATED,
        category: 'KANBAN',
        userId: ctx.session.user.id,
        userEmail: ctx.session.user.email ?? undefined,
        detail: `Created card "${input.title}" in ${department.name}`,
        targetId: card.id,
        targetType: 'KanbanCard',
        metadata: { departmentSlug: input.departmentSlug },
      })

      return card
    }),

  // Move card to a new status
  moveCard: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        status: z.enum(['todo', 'doing', 'blocked', 'done']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.prisma.kanbanCard.findUnique({
        where: { id: input.cardId },
        include: { department: true },
      })
      if (!card) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const userRole = ctx.session.user.role || 'MEMBER'
      const isOwner = card.assigneeId === ctx.session.user.id
      const isUnassignedAndDeptMember = !card.assigneeId && ctx.session.user.departmentId === card.departmentId
      const crossAccess = hasCrossBoardAccess(ctx.session.user.email, card.department.slug)
      if (userRole !== 'SUPER_ADMIN' && !isOwner && !isUnassignedAndDeptMember && !crossAccess) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the task owner can edit this card' })
      }

      return ctx.prisma.kanbanCard.update({
        where: { id: input.cardId },
        data: {
          status: input.status,
          doneAt: input.status === 'done' ? new Date() : null,
        },
        include: {
          assignee: {
            select: { id: true, name: true, image: true, email: true },
          },
        },
      })
    }),

  updateCard: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        assigneeId: z.string().nullable().optional(),
        status: z.enum(['todo', 'doing', 'blocked', 'done']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.prisma.kanbanCard.findUnique({
        where: { id: input.cardId },
        include: { department: true },
      })
      if (!card) throw new TRPCError({ code: 'NOT_FOUND' })

      const userRole = ctx.session.user.role || 'MEMBER'
      const isOwner = card.assigneeId === ctx.session.user.id
      const isUnassignedAndDeptMember = !card.assigneeId && ctx.session.user.departmentId === card.departmentId
      const crossAccess = hasCrossBoardAccess(ctx.session.user.email, card.department.slug)
      if (userRole !== 'SUPER_ADMIN' && !isOwner && !isUnassignedAndDeptMember && !crossAccess) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the task owner can edit this card' })
      }

      const data: any = {}
      if (input.title !== undefined) data.title = input.title
      if (input.description !== undefined) data.description = input.description
      if (input.assigneeId !== undefined) data.assigneeId = input.assigneeId
      if (input.status !== undefined) {
        data.status = input.status
        data.doneAt = input.status === 'done' ? new Date() : null
      }

      return ctx.prisma.kanbanCard.update({
        where: { id: input.cardId },
        data,
        include: {
          assignee: {
            select: { id: true, name: true, image: true, email: true },
          },
        },
      })
    }),

  deleteCard: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.prisma.kanbanCard.findUnique({
        where: { id: input.cardId },
        include: { department: true },
      })
      if (!card) throw new TRPCError({ code: 'NOT_FOUND' })

      const userRole = ctx.session.user.role || 'MEMBER'
      const isOwner = card.assigneeId === ctx.session.user.id
      const isUnassignedAndDeptMember = !card.assigneeId && ctx.session.user.departmentId === card.departmentId
      const crossAccess = hasCrossBoardAccess(ctx.session.user.email, card.department.slug)
      if (userRole !== 'SUPER_ADMIN' && !isOwner && !isUnassignedAndDeptMember && !crossAccess) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the task owner can edit this card' })
      }

      return ctx.prisma.kanbanCard.delete({ where: { id: input.cardId } })
    }),
})
