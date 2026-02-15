'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { DepartmentCard, type RAGStatus } from '@/components/rag/DepartmentCard'
import { UpdateStatusModal } from '@/components/rag/UpdateStatusModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, Loader2, Users, Target, TrendingDown, ThumbsUp, CheckCircle2, Pencil, Save, Plus, X } from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { useSession } from 'next-auth/react'

interface Department {
  id: string
  name: string
  slug: string
  currentStatus: RAGStatus
  currentReason: string
  lastUpdated: Date
  order: number
  priority?: 'P1' | 'P2' | 'P3' | null
  previousStatus?: RAGStatus | null
  reasonChanged?: boolean
}

export default function RagDashboardPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'MEMBER'
  const departmentName = session?.user?.departmentName as string | undefined
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'
  const isCsuite = departmentName === 'C-Suite' || isAdmin
  const canEdit = isCsuite

  const {
    data: departments = [],
    isLoading,
    error,
    refetch,
  } = trpc.rag.getAll.useQuery()

  const { data: keyMetrics = [], refetch: refetchMetrics } = trpc.rag.getKeyMetrics.useQuery()
  const { data: priorities = [], refetch: refetchPriorities } = trpc.rag.getPriorities.useQuery()

  const updateStatusMutation = trpc.rag.updateStatus.useMutation({
    onSuccess: () => {
      refetch()
      setIsModalOpen(false)
      setSelectedDepartment(null)
    },
  })

  const updateMetricsMutation = trpc.rag.updateKeyMetrics.useMutation({
    onSuccess: () => {
      refetchMetrics()
      setEditingMetrics(false)
    },
  })

  const updatePrioritiesMutation = trpc.rag.updatePriorities.useMutation({
    onSuccess: () => {
      refetchPriorities()
      setEditingPriorities(false)
    },
  })

  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Inline editing state
  const [editingMetrics, setEditingMetrics] = useState(false)
  const [editMetricValues, setEditMetricValues] = useState<Record<string, string>>({})
  const [editingPriorities, setEditingPriorities] = useState(false)
  const [editPriorityLabels, setEditPriorityLabels] = useState<string[]>([])
  const [newPriorityText, setNewPriorityText] = useState('')

  const [editMetricTargets, setEditMetricTargets] = useState<Record<string, string>>({})
  const [editMetricTrends, setEditMetricTrends] = useState<Record<string, string>>({})

  const startEditingMetrics = () => {
    const values: Record<string, string> = {}
    const targets: Record<string, string> = {}
    const trends: Record<string, string> = {}
    keyMetrics.forEach((m) => {
      values[m.id] = m.value
      targets[m.id] = (m as { targetValue?: string | null }).targetValue || ''
      trends[m.id] = (m as { trend?: string | null }).trend || ''
    })
    setEditMetricValues(values)
    setEditMetricTargets(targets)
    setEditMetricTrends(trends)
    setEditingMetrics(true)
  }

  const saveMetrics = () => {
    const updates = keyMetrics.map((m) => ({
      id: m.id,
      value: editMetricValues[m.id] || '',
      targetValue: editMetricTargets[m.id] || null,
      trend: editMetricTrends[m.id] || null,
    }))
    updateMetricsMutation.mutate(updates)
  }

  const startEditingPriorities = () => {
    setEditPriorityLabels(priorities.map((p) => p.label))
    setEditingPriorities(true)
  }

  const savePriorities = () => {
    const data = editPriorityLabels
      .filter((l) => l.trim())
      .map((label, i) => ({ label: label.trim(), order: i + 1 }))
    updatePrioritiesMutation.mutate(data)
  }

  const addPriority = () => {
    if (!newPriorityText.trim()) return
    setEditPriorityLabels([...editPriorityLabels, newPriorityText.trim()])
    setNewPriorityText('')
  }

  const removePriority = (index: number) => {
    setEditPriorityLabels(editPriorityLabels.filter((_, i) => i !== index))
  }

  const handleDepartmentClick = (dept: Department) => {
    setSelectedDepartment(dept)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = async (
    departmentId: string,
    status: RAGStatus,
    reason: string,
    priority: 'P1' | 'P2' | 'P3' | null
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        departmentId,
        status: status.toUpperCase() as 'GREEN' | 'AMBER' | 'RED',
        reason,
        priority: priority || undefined,
      })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const statusCounts = {
    green: departments.filter((d) => d.currentStatus === 'green').length,
    amber: departments.filter((d) => d.currentStatus === 'amber').length,
    red: departments.filter((d) => d.currentStatus === 'red').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="mt-4 text-gray-600">Loading RAG dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">Failed to load departments</p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Link
                href="/intranet"
                className="flex-shrink-0 hover:opacity-90 transition-opacity"
              >
                <div className="bg-black rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
                  <Image
                    src="/carma-logo.png"
                    alt="Carma Logo"
                    width={80}
                    height={27}
                    className="h-auto"
                    priority
                  />
                </div>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-xl sm:text-2xl md:text-3xl text-foreground truncate">
                  Department Health Monitor
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 italic hidden sm:block">
                  Alone we can do so little; together we can do so much.
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <span className="inline-flex h-3 w-3 rounded-full bg-green-500"
                style={{ boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.2)' }} />
              <span className="text-xs sm:text-sm font-medium text-green-700">
                {statusCounts.green} Healthy
              </span>
            </div>
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
              <span className="inline-flex h-3 w-3 rounded-full bg-amber-500"
                style={{ boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.2)' }} />
              <span className="text-xs sm:text-sm font-medium text-amber-600">
                {statusCounts.amber} Caution
              </span>
            </div>
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <span className="inline-flex h-3 w-3 rounded-full bg-red-500"
                style={{ boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)' }} />
              <span className="text-xs sm:text-sm font-medium text-red-600">
                {statusCounts.red} Critical
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics & Priorities */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Metrics */}
          {keyMetrics.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  Key Metrics
                </h2>
                {canEdit && !editingMetrics && (
                  <button
                    onClick={startEditingMetrics}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {editingMetrics && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingMetrics(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={saveMetrics}
                      disabled={updateMetricsMutation.isLoading}
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Save
                    </Button>
                  </div>
                )}
              </div>

              {editingMetrics ? (
                <div className="grid grid-cols-2 gap-3">
                  {keyMetrics.map((metric) => (
                    <Card key={metric.id}>
                      <CardContent className="pt-4 pb-3 space-y-2">
                        <label className="text-xs text-gray-500 block">{metric.label}</label>
                        <input
                          type="text"
                          value={editMetricValues[metric.id] || ''}
                          onChange={(e) =>
                            setEditMetricValues({ ...editMetricValues, [metric.id]: e.target.value })
                          }
                          placeholder="Current value"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={editMetricTargets[metric.id] || ''}
                          onChange={(e) =>
                            setEditMetricTargets({ ...editMetricTargets, [metric.id]: e.target.value })
                          }
                          placeholder="Target (e.g. £1m, 1,000, 5%)"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={editMetricTrends[metric.id] || ''}
                          onChange={(e) =>
                            setEditMetricTrends({ ...editMetricTrends, [metric.id]: e.target.value })
                          }
                          placeholder="Trend (e.g. +32 this quarter)"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {keyMetrics.map((metric) => {
                    const icons: Record<string, typeof Users> = {
                      'Revenue Target': Target,
                      'Active Customers': Users,
                      'Churn Target': TrendingDown,
                      'CSAT': ThumbsUp,
                    }
                    const Icon = icons[metric.label] || Target
                    const targetValue = (metric as { targetValue?: string | null }).targetValue
                    const trend = (metric as { trend?: string | null }).trend
                    return (
                      <Card key={metric.id}>
                        <CardContent className="pt-5 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <Icon className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            {metric.value || '—'}
                            {targetValue && <span className="text-base font-normal text-gray-500"> / {targetValue}</span>}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{metric.label}</p>
                          {trend && <p className="text-xs text-gray-600 mt-1">Trend: {trend}</p>}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Priorities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                Priorities
              </h2>
              {canEdit && !editingPriorities && (
                <button
                  onClick={startEditingPriorities}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {editingPriorities && (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditingPriorities(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={savePriorities}
                    disabled={updatePrioritiesMutation.isLoading}
                  >
                    <Save className="w-3.5 h-3.5 mr-1" />
                    Save
                  </Button>
                </div>
              )}
            </div>

            {editingPriorities ? (
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="space-y-2">
                    {editPriorityLabels.map((label, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-400 w-5">{index + 1}.</span>
                        <input
                          type="text"
                          value={label}
                          onChange={(e) => {
                            const updated = [...editPriorityLabels]
                            updated[index] = e.target.value
                            setEditPriorityLabels(updated)
                          }}
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => removePriority(index)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="w-5" />
                      <input
                        type="text"
                        value={newPriorityText}
                        onChange={(e) => setNewPriorityText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addPriority()}
                        placeholder="Add priority..."
                        className="flex-1 px-2 py-1.5 border border-dashed border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={addPriority}
                        disabled={!newPriorityText.trim()}
                        className="text-gray-400 hover:text-green-600 transition-colors disabled:opacity-30"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : priorities.length > 0 ? (
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="space-y-3">
                    {priorities.map((priority) => (
                      <div key={priority.id} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {priority.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-5 pb-4 text-center text-sm text-gray-400">
                  No priorities set
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {departments
            .sort((a, b) => a.order - b.order)
            .map((dept) => (
              <DepartmentCard
                key={dept.id}
                name={dept.name}
                status={dept.currentStatus}
                reason={dept.currentReason}
                lastUpdated={new Date(dept.lastUpdated)}
                priority={dept.priority}
                previousStatus={dept.previousStatus}
                reasonChanged={dept.reasonChanged}
                onClick={() => handleDepartmentClick(dept)}
              />
            ))}
        </div>
      </main>

      {/* Update Status Modal */}
      {selectedDepartment && (
        <UpdateStatusModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedDepartment(null)
          }}
          department={selectedDepartment}
          onSubmit={(status, reason, priority) =>
            handleStatusUpdate(selectedDepartment.id, status, reason, priority)
          }
        />
      )}
    </div>
  )
}
