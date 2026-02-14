'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Shield,
  Activity,
  AlertTriangle,
  AlertCircle,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Info,
} from 'lucide-react'

const SEVERITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  INFO: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  WARN: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  ERROR: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-900', dot: 'bg-red-700' },
}

const CATEGORY_COLORS: Record<string, string> = {
  AUTH: 'bg-purple-100 text-purple-700',
  LEARNING: 'bg-green-100 text-green-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  SYSTEM: 'bg-gray-100 text-gray-700',
  KANBAN: 'bg-orange-100 text-orange-700',
  RAG: 'bg-teal-100 text-teal-700',
  INTRANET: 'bg-indigo-100 text-indigo-700',
}

export default function AuditLogsPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'MEMBER'
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'

  // Filters
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Queries
  const { data: summary, isLoading: summaryLoading } = trpc.audit.getSummary.useQuery(
    undefined,
    { enabled: isAdmin }
  )
  const { data: filterOptions } = trpc.audit.getFilterOptions.useQuery(
    undefined,
    { enabled: isAdmin }
  )
  const { data: logsData, isLoading: logsLoading, refetch } = trpc.audit.getLogs.useQuery(
    {
      page,
      pageSize: 50,
      category: categoryFilter || undefined,
      severity: severityFilter || undefined,
      search: searchQuery || undefined,
    },
    { enabled: isAdmin }
  )

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500">You need admin privileges to view audit logs.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  function formatTimestamp(ts: string | Date) {
    const d = new Date(ts)
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  function handleSearch() {
    setSearchQuery(searchInput)
    setPage(1)
  }

  function clearFilters() {
    setCategoryFilter('')
    setSeverityFilter('')
    setSearchQuery('')
    setSearchInput('')
    setPage(1)
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="h-7 w-7 text-gray-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          </div>
          <p className="text-gray-600 text-lg">
            System activity, user actions, and security events across the platform.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-500">Events (24h)</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summaryLoading ? '—' : summary?.last24h ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-gray-500">Events (7d)</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summaryLoading ? '—' : summary?.last7d ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-gray-500">Logins (24h)</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summaryLoading ? '—' : summary?.loginCount24h ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-gray-500">Warnings (7d)</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {summaryLoading ? '—' : summary?.warnCount ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-gray-500">Errors (7d)</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {summaryLoading ? '—' : summary?.errorCount ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500">Total Logs</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {summaryLoading ? '—' : summary?.totalLogs ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Errors */}
        {summary?.recentErrors && summary.recentErrors.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                Recent Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary.recentErrors.map((err) => (
                  <div key={err.id} className="flex items-start gap-3 text-sm">
                    <span className="text-red-500 whitespace-nowrap text-xs mt-0.5">
                      {formatTimestamp(err.timestamp)}
                    </span>
                    <span className="px-1.5 py-0.5 text-xs rounded bg-red-100 text-red-700 font-medium">
                      {err.action}
                    </span>
                    <span className="text-red-900 flex-1 truncate">{err.detail}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Filters:</span>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All categories</option>
                {filterOptions?.categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={severityFilter}
                onChange={(e) => { setSeverityFilter(e.target.value); setPage(1) }}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All severities</option>
                {filterOptions?.severities.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search logs..."
                    className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <Button size="sm" variant="outline" onClick={handleSearch} className="h-8">
                  Search
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-500 h-8"
              >
                Clear
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => refetch()}
                className="text-gray-500 h-8"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardContent className="p-0">
            {logsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Loading audit logs...</p>
              </div>
            ) : logsData && logsData.logs.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-4 py-3 font-medium text-gray-600 w-[160px]">Timestamp</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600 w-[80px]">Severity</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600 w-[90px]">Category</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600 w-[170px]">Action</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600 w-[160px]">User</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsData.logs.map((log) => {
                        const sev = SEVERITY_STYLES[log.severity] || SEVERITY_STYLES.INFO
                        const catColor = CATEGORY_COLORS[log.category] || 'bg-gray-100 text-gray-700'
                        return (
                          <tr key={log.id} className="border-b last:border-b-0 hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              {formatTimestamp(log.timestamp)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                                {log.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${catColor}`}>
                                {log.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-gray-700">
                              {log.action}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 truncate max-w-[160px]">
                              {log.userEmail || '—'}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 truncate max-w-[400px]" title={log.detail || ''}>
                              {log.detail || '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Showing {((page - 1) * 50) + 1}–{Math.min(page * 50, logsData.totalCount)} of {logsData.totalCount} logs
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="h-7 px-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-gray-600">
                      Page {page} of {logsData.totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= logsData.totalPages}
                      onClick={() => setPage(page + 1)}
                      className="h-7 px-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <Info className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {searchQuery || categoryFilter || severityFilter
                    ? 'No logs match the current filters.'
                    : 'No audit logs yet. Activity will appear here as users interact with the platform.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
