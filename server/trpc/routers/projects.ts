import { z } from 'zod'
import { router, protectedProcedure, managerProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const projectsRouter = router({
  // Get all active projects
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.project.findMany({
      where: { isArchived: false },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }),

  // Get archived projects
  getArchived: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.project.findMany({
      where: { isArchived: true },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }),

  // Create project (MANAGER+)
  create: managerProcedure
    .input(
      z.object({
        name: z.string().min(1),
        objective: z.string().optional(),
        status: z.enum(['active', 'on-hold', 'completed']).default('active'),
        timeline: z.string().optional(),
        link: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.project.create({
        data: {
          ...input,
          ownerId: ctx.session.user.id,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      })
    }),

  // Update project (MANAGER+)
  update: managerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        objective: z.string().nullable().optional(),
        status: z.enum(['active', 'on-hold', 'completed']).optional(),
        timeline: z.string().nullable().optional(),
        link: z.string().nullable().optional(),
        isArchived: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.project.update({
        where: { id },
        data,
        include: {
          owner: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      })
    }),

  // Delete project (MANAGER+)
  delete: managerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.project.delete({ where: { id: input.id } })
    }),
})
