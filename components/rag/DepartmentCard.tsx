import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Clock, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react'

export type RAGStatus = 'green' | 'amber' | 'red'
export type StatusChangeDirection = 'up' | 'down' | 'side' | null

interface DepartmentCardProps {
  name: string
  status: RAGStatus
  reason: string
  lastUpdated: Date
  priority?: 'P1' | 'P2' | 'P3' | null
  previousStatus?: RAGStatus | null
  reasonChanged?: boolean
  onClick?: () => void
}

const statusConfig = {
  green: {
    label: 'Healthy',
    borderClass: 'border-green-300/40 hover:border-green-400/60',
    badgeClass: 'bg-green-50 text-green-700 border border-green-200',
    indicatorClass: 'bg-green-500',
    indicatorGlow: '0 0 0 3px rgba(34, 197, 94, 0.2)',
    cardShadow: '0 1px 3px 0 rgba(34, 197, 94, 0.1)',
    cardHoverShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.25)',
    emoji: '🟢',
  },
  amber: {
    label: 'Caution',
    borderClass: 'border-amber-300/40 hover:border-amber-400/60',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    indicatorClass: 'bg-amber-500',
    indicatorGlow: '0 0 0 3px rgba(245, 158, 11, 0.2)',
    cardShadow: '0 1px 3px 0 rgba(245, 158, 11, 0.1)',
    cardHoverShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
    emoji: '🟠',
  },
  red: {
    label: 'Critical',
    borderClass: 'border-red-300/40 hover:border-red-400/60',
    badgeClass: 'bg-red-50 text-red-700 border border-red-200',
    indicatorClass: 'bg-red-500',
    indicatorGlow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
    cardShadow: '0 1px 3px 0 rgba(239, 68, 68, 0.1)',
    cardHoverShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.25)',
    emoji: '🔴',
  },
}

function getStatusChangeDirection(
  previousStatus: RAGStatus | null | undefined,
  currentStatus: RAGStatus,
  reasonChanged?: boolean
): StatusChangeDirection {
  if (!previousStatus) return null

  if (previousStatus === 'red' && currentStatus === 'amber') return 'up'
  if (previousStatus === 'amber' && currentStatus === 'green') return 'up'

  if (previousStatus === 'green' && currentStatus === 'amber') return 'down'
  if (previousStatus === 'amber' && currentStatus === 'red') return 'down'

  if (previousStatus === currentStatus && reasonChanged) return 'side'

  return null
}

export function DepartmentCard({
  name,
  status,
  reason,
  lastUpdated,
  priority,
  previousStatus,
  reasonChanged,
  onClick,
}: DepartmentCardProps) {
  const config = statusConfig[status]
  const changeDirection = getStatusChangeDirection(previousStatus, status, reasonChanged)

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })
  }

  const ArrowIcon = () => {
    if (!changeDirection) return null

    const arrowConfig = {
      up: { icon: ArrowUp, className: 'text-green-600', title: 'Status improved' },
      down: { icon: ArrowDown, className: 'text-red-600', title: 'Status worsened' },
      side: { icon: ArrowRight, className: 'text-amber-600', title: 'Status unchanged, reason updated' },
    }

    const arrow = arrowConfig[changeDirection]
    const Icon = arrow.icon

    return (
      <Icon
        className={cn('h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0', arrow.className)}
        aria-label={arrow.title}
      />
    )
  }

  return (
    <Card
      className={cn(
        'rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg',
        config.borderClass,
        onClick && 'cursor-pointer'
      )}
      style={{
        boxShadow: config.cardShadow,
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = config.cardHoverShadow
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = config.cardShadow
      }}
      onClick={onClick}
    >
      {/* Department Name */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
          <h3 className="font-semibold text-base sm:text-lg text-foreground">{name}</h3>
          {changeDirection && <ArrowIcon />}
        </div>
        <span className="text-xl sm:text-2xl flex-shrink-0">{config.emoji}</span>
      </div>

      {/* Status Badge and Priority */}
      <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className={cn('inline-flex h-3 w-3 rounded-full', config.indicatorClass)}
            style={{ boxShadow: config.indicatorGlow }}
          />
          <span className={cn('px-2 py-1 rounded-md text-xs font-medium', config.badgeClass)}>
            {config.label}
          </span>
        </div>
        {priority && (
          <span
            className={cn(
              'px-2 py-1 rounded-md text-xs font-bold text-white',
              priority === 'P1' && 'bg-red-600',
              priority === 'P2' && 'bg-amber-600',
              priority === 'P3' && 'bg-blue-600'
            )}
          >
            {priority}
          </span>
        )}
      </div>

      {/* Reason Text */}
      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-3">
        {reason}
      </p>

      {/* Last Updated */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">{formatDate(lastUpdated)}</span>
      </div>
    </Card>
  )
}
