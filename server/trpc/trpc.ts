import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { type Context } from './context'
import { type SystemRole, ROLE_HIERARCHY } from '@/lib/rbac'
import { audit, auditSystemError } from '@/server/audit'

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

// ==========================================
// Performance + error logging middleware
// ==========================================

const loggingMiddleware = t.middleware(async ({ path, type, ctx, next }) => {
  const start = Date.now()
  const result = await next()
  const durationMs = Date.now() - start

  // Log slow queries (> 3 seconds)
  if (durationMs > 3000) {
    audit({
      action: 'SLOW_QUERY',
      category: 'SYSTEM',
      severity: 'WARN',
      userId: ctx.session?.user?.id,
      userEmail: ctx.session?.user?.email ?? undefined,
      detail: `Slow ${type} ${path} took ${durationMs}ms`,
      metadata: { path, type, durationMs },
      durationMs,
    })
  }

  // Log tRPC errors
  if (!result.ok) {
    const err = result.error
    // Only log server errors, not auth/validation errors
    if (err.code === 'INTERNAL_SERVER_ERROR' || err.code === 'TIMEOUT') {
      auditSystemError(err, {
        action: 'API_ERROR',
        detail: `tRPC ${type} ${path} failed: ${err.message}`,
        metadata: { path, type, code: err.code, durationMs },
      })
    }
  }

  return result
})

export const router = t.router
export const publicProcedure = t.procedure.use(loggingMiddleware)

// ==========================================
// Authentication middleware
// ==========================================

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

// ==========================================
// Role-based middleware
// ==========================================

// Check if user has minimum role
function createRoleMiddleware(minimumRole: SystemRole) {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    const userRole = (ctx.session.user.role || 'MEMBER') as SystemRole
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0
    const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 0

    if (userLevel < requiredLevel) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Requires ${minimumRole} role or higher`,
      })
    }

    return next({
      ctx: {
        ...ctx,
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  })
}

// Admin procedure - requires ADMIN or SUPER_ADMIN
export const adminProcedure = protectedProcedure.use(createRoleMiddleware('ADMIN'))

// Manager procedure - requires MANAGER, ADMIN, or SUPER_ADMIN
export const managerProcedure = protectedProcedure.use(createRoleMiddleware('MANAGER'))

// Super admin procedure - requires SUPER_ADMIN only
export const superAdminProcedure = protectedProcedure.use(createRoleMiddleware('SUPER_ADMIN'))

// ==========================================
// Module access middleware
// ==========================================

export function createModuleAccessMiddleware(moduleSlug: string) {
  return t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }    const userRole = (ctx.session.user.role || 'MEMBER') as SystemRole
    
    // SUPER_ADMIN and ADMIN always have access
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      return next({
        ctx: {
          ...ctx,
          session: { ...ctx.session, user: ctx.session.user },
        },
      })
    }

    // Check module access from session
    const modules = ctx.session.user.modules || []
    const moduleAccess = modules.find((m: any) => m.moduleSlug === moduleSlug)

    if (!moduleAccess || !moduleAccess.canView) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Access to ${moduleSlug} module is not permitted for your department`,
      })
    }

    return next({
      ctx: {
        ...ctx,
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  })
}

// Pre-built module-specific procedures
export const trainingProcedure = protectedProcedure.use(createModuleAccessMiddleware('training'))
export const managementProcedure = protectedProcedure.use(createModuleAccessMiddleware('management'))
export const bcorpProcedure = protectedProcedure.use(createModuleAccessMiddleware('bcorp'))
export const ragProcedure = protectedProcedure.use(createModuleAccessMiddleware('rag'))