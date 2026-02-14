import { prisma } from '@/server/db/prisma'

// ==========================================
// Audit Log Categories & Actions
// ==========================================

export type AuditCategory = 'AUTH' | 'LEARNING' | 'ADMIN' | 'SYSTEM' | 'KANBAN' | 'RAG' | 'INTRANET'
export type AuditSeverity = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'

export const AuditActions = {
  // Auth
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_LOGIN_FAILED: 'USER_LOGIN_FAILED',
  USER_DOMAIN_BLOCKED: 'USER_DOMAIN_BLOCKED',

  // Learning
  COURSE_STARTED: 'COURSE_STARTED',
  MODULE_STARTED: 'MODULE_STARTED',
  MODULE_COMPLETED: 'MODULE_COMPLETED',
  QUIZ_COMPLETED: 'QUIZ_COMPLETED',
  BADGE_EARNED: 'BADGE_EARNED',
  CERTIFICATE_GENERATED: 'CERTIFICATE_GENERATED',

  // Admin
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  USER_DEPARTMENT_CHANGED: 'USER_DEPARTMENT_CHANGED',
  RAG_STATUS_UPDATED: 'RAG_STATUS_UPDATED',
  RAG_METRIC_UPDATED: 'RAG_METRIC_UPDATED',
  RAG_PRIORITY_UPDATED: 'RAG_PRIORITY_UPDATED',
  MISSION_UPDATED: 'MISSION_UPDATED',

  // Kanban
  KANBAN_CARD_CREATED: 'KANBAN_CARD_CREATED',
  KANBAN_CARD_UPDATED: 'KANBAN_CARD_UPDATED',
  KANBAN_CARD_DELETED: 'KANBAN_CARD_DELETED',

  // System
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  SLOW_QUERY: 'SLOW_QUERY',
  API_ERROR: 'API_ERROR',
  SYSTEM_STARTUP: 'SYSTEM_STARTUP',
} as const

// ==========================================
// Audit Log Helper
// ==========================================

interface AuditLogEntry {
  userId?: string | null
  userEmail?: string | null
  action: string
  category: AuditCategory
  severity?: AuditSeverity
  detail?: string
  metadata?: Record<string, unknown>
  targetId?: string
  targetType?: string
  ipAddress?: string
  userAgent?: string
  durationMs?: number
}

/**
 * Write an audit log entry. Fire-and-forget — errors are caught and logged
 * to console so they never break the main request flow.
 */
export async function audit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        userEmail: entry.userEmail ?? null,
        action: entry.action,
        category: entry.category,
        severity: entry.severity ?? 'INFO',
        detail: entry.detail ?? null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        targetId: entry.targetId ?? null,
        targetType: entry.targetType ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        durationMs: entry.durationMs ?? null,
      },
    })
  } catch (err) {
    // Never let audit logging break the app
    console.error('[AUDIT] Failed to write audit log:', err)
  }
}

/**
 * Convenience: log a system error with full context.
 */
export async function auditSystemError(
  error: unknown,
  context?: { action?: string; detail?: string; metadata?: Record<string, unknown> }
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined

  await audit({
    action: context?.action ?? AuditActions.SYSTEM_ERROR,
    category: 'SYSTEM',
    severity: 'ERROR',
    detail: context?.detail ?? message,
    metadata: {
      ...context?.metadata,
      errorMessage: message,
      stack: stack?.substring(0, 500), // Trim stack trace
    },
  })
}

/**
 * Convenience: log an auth event.
 */
export async function auditAuth(
  action: string,
  opts: {
    userId?: string
    userEmail?: string
    severity?: AuditSeverity
    detail?: string
    metadata?: Record<string, unknown>
    ipAddress?: string
  }
): Promise<void> {
  await audit({
    action,
    category: 'AUTH',
    severity: opts.severity ?? 'INFO',
    userId: opts.userId,
    userEmail: opts.userEmail,
    detail: opts.detail,
    metadata: opts.metadata,
    ipAddress: opts.ipAddress,
  })
}
