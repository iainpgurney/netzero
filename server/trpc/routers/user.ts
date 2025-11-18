import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'
import bcrypt from 'bcryptjs'
import { TRPCError } from '@trpc/server'

export const userRouter = router({
  // Register a new user
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'An account with this email already exists',
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 10)

      // Create user
      const user = await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          emailVerified: new Date(), // Auto-verify for simplicity
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      })

      return {
        success: true,
        user,
        message: 'Account created successfully! You can now sign in.',
      }
    }),

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) {
      throw new Error('User not found')
    }

    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }),
})

