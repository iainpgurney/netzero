import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc'

export const announcementsRouter = router({
  // Get latest announcements
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.announcement.findMany({
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    })
  }),

  // Create announcement (ADMIN+)
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        isPinned: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.announcement.create({
        data: {
          ...input,
          authorId: ctx.session.user.id,
        },
        include: {
          author: {
            select: { id: true, name: true, image: true },
          },
        },
      })
    }),

  // Delete announcement (ADMIN+)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.announcement.delete({ where: { id: input.id } })
    }),
})
