import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { type Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof Error
            ? error.cause.message
            : null,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const protectedProcedure = t.procedure.use(isAuthenticated)

// Admin emails - users with these emails have admin access
const ADMIN_EMAILS = [
  'iain.gurney@gmail.com',
  'iain.gurney@carma.earth',
].map(email => email.toLowerCase())

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const userEmail = ctx.session.user.email?.toLowerCase()
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Admin access required' 
    })
  }

  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

export const adminProcedure = protectedProcedure.use(isAdmin)

