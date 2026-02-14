'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Building2,
  Shield,
  LayoutGrid,
  ChevronDown,
  Activity,
  Save,
  Plus,
  X,
} from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac'
import type { SystemRole } from '@/lib/rbac'

type Tab = 'progress' | 'rbac' | 'rag'

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<Tab>('rbac')

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration</h1>
          <p className="text-gray-600">Manage users, roles, departments, and module access</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-200 w-fit">
          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'rbac'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            Users & Permissions
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'progress'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Training Progress
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'rag'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            RAG Settings
          </button>
        </div>

        {activeTab === 'rbac' ? <RBACManagement /> : activeTab === 'rag' ? <RagSettings /> : <ProgressDashboard />}
      </div>
    </div>
  )
}

// ==========================================
// RBAC Management Tab
// ==========================================

function RBACManagement() {
  const { data: rbacOverview, isLoading, refetch } = trpc.rbac.getRBACOverview.useQuery()
  const { data: users, refetch: refetchUsers } = trpc.rbac.getAllUsersWithRBAC.useQuery()
  const { data: departments } = trpc.rbac.getDepartments.useQuery()
  const { data: googleConfig } = trpc.rbac.isGoogleAdminConfigured.useQuery()
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const updateRole = trpc.rbac.updateUserRole.useMutation({
    onSuccess: () => {
      refetchUsers()
      refetch()
    },
  })

  const updateDepartment = trpc.rbac.updateUserDepartment.useMutation({
    onSuccess: () => {
      refetchUsers()
      refetch()
    },
  })

  const updateModuleAccess = trpc.rbac.updateDepartmentModuleAccess.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const syncAllFromGoogle = trpc.rbac.syncAllFromGoogle.useMutation({
    onSuccess: (data) => {
      setSyncMessage(data.message)
      refetchUsers()
      refetch()
      setTimeout(() => setSyncMessage(null), 5000)
    },
    onError: (error) => {
      setSyncMessage(`Error: ${error.message}`)
      setTimeout(() => setSyncMessage(null), 8000)
    },
  })

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-green-600 mb-4" />
        <p className="text-gray-600">Loading RBAC data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rbacOverview?.totalUsers || 0}</p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rbacOverview?.departments.length || 0}</p>
                <p className="text-xs text-gray-500">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rbacOverview?.modules.length || 0}</p>
                <p className="text-xs text-gray-500">Modules</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="flex flex-wrap gap-1">
                  {rbacOverview?.usersByRole.map((r) => (
                    <span key={r.role} className="text-xs text-gray-500">
                      {r.count} {ROLE_LABELS[r.role as SystemRole] || r.role}
                      {r !== rbacOverview.usersByRole[rbacOverview.usersByRole.length - 1] ? ',' : ''}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">By Role</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Google Admin Sync */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Google Workspace Sync</h3>
                <p className="text-sm text-gray-600">
                  {googleConfig?.configured
                    ? 'Auto-assign departments from Google Admin Organizational Units'
                    : 'Configure GOOGLE_SA_CLIENT_EMAIL and GOOGLE_SA_PRIVATE_KEY to enable'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {syncMessage && (
                <span className="text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  {syncMessage}
                </span>
              )}
              <Button
                onClick={() => syncAllFromGoogle.mutate()}
                disabled={!googleConfig?.configured || syncAllFromGoogle.isLoading}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {syncAllFromGoogle.isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sync All from Google
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department → Module Access Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Department Module Access
          </CardTitle>
          <CardDescription>
            Manage which modules each department can access. Click to toggle permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium text-gray-700">Department</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">Users</th>
                  {rbacOverview?.modules.map((mod) => (
                    <th key={mod.id} className="text-center p-3 text-sm font-medium text-gray-700">
                      <span>{mod.icon} {mod.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rbacOverview?.departments.map((dept) => (
                  <tr key={dept.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{dept.icon}</span>
                        <div>
                          <span className="font-medium text-sm">{dept.name}</span>
                          <p className="text-xs text-gray-400">{dept.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center text-sm text-gray-600">
                      {dept._count.users}
                    </td>
                    {rbacOverview?.modules.map((mod) => {
                      const access = dept.moduleAccess.find(
                        (a) => a.platformModule.slug === mod.slug
                      )
                      const hasView = access?.canView ?? false
                      const hasEdit = access?.canEdit ?? false
                      const hasManage = access?.canManage ?? false

                      return (
                        <td key={mod.id} className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {/* View */}
                            <button
                              onClick={() =>
                                updateModuleAccess.mutate({
                                  departmentId: dept.id,
                                  platformModuleId: mod.id,
                                  canView: !hasView,
                                  canEdit: !hasView ? hasEdit : false,
                                  canManage: !hasView ? hasManage : false,
                                })
                              }
                              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                                hasView
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {hasView ? 'View' : 'No Access'}
                            </button>
                            {hasView && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    updateModuleAccess.mutate({
                                      departmentId: dept.id,
                                      platformModuleId: mod.id,
                                      canView: true,
                                      canEdit: !hasEdit,
                                      canManage: hasManage,
                                    })
                                  }
                                  className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors ${
                                    hasEdit
                                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    updateModuleAccess.mutate({
                                      departmentId: dept.id,
                                      platformModuleId: mod.id,
                                      canView: true,
                                      canEdit: hasEdit,
                                      canManage: !hasManage,
                                    })
                                  }
                                  className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors ${
                                    hasManage
                                      ? 'bg-purple-100 text-purple-700 border-purple-200'
                                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  Manage
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Users Table with Role/Department Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>Assign roles and departments to users</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchUsers()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium text-gray-700">User</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700">Email</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700">Role</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700">Department</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-700">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || 'User'}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                            {(user.name || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-sm">{user.name || 'Unnamed'}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{user.email}</td>
                    <td className="p-3">
                      <div className="relative inline-block">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateRole.mutate({
                              userId: user.id,
                              role: e.target.value as SystemRole,
                            })
                          }
                          className={`appearance-none text-xs font-medium px-3 py-1.5 pr-7 rounded-full border cursor-pointer ${
                            ROLE_COLORS[user.role as SystemRole] || ROLE_COLORS.MEMBER
                          }`}
                        >
                          <option value="MEMBER">Member</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative inline-block">
                        <select
                          value={user.department?.id || ''}
                          onChange={(e) =>
                            updateDepartment.mutate({
                              userId: user.id,
                              departmentId: e.target.value || null,
                            })
                          }
                          className="appearance-none text-xs font-medium px-3 py-1.5 pr-7 rounded-full border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        >
                          <option value="">No Department</option>
                          {departments?.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                      </div>
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================
// Training Progress Tab (existing functionality)
// ==========================================

function ProgressDashboard() {
  const { data: users, isLoading, error, refetch } = trpc.admin.getAllUsers.useQuery()

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-green-600 mb-4" />
        <p className="text-gray-600">Loading user data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Error Loading Progress Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {users && users.length > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Training Progress ({users.length} users)</CardTitle>
                <CardDescription>Course completion and average quiz scores</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium text-gray-700">User</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-700">Email</th>
                    {users[0]?.courseProgress.map((course) => (
                      <th key={course.courseId} className="text-center p-3 text-sm font-medium text-gray-700">
                        <div className="flex flex-col items-center gap-1">
                          <span>{course.courseTitle}</span>
                          <span className="text-xs font-normal text-gray-500">
                            ({course.totalModules} modules)
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {user.image && (
                            <img
                              src={user.image}
                              alt={user.name || 'User'}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <span className="font-medium">{user.name || 'Unnamed'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{user.email}</td>
                      {user.courseProgress.map((course) => (
                        <td key={course.courseId} className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              {course.completedModules === course.totalModules ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : course.completedModules > 0 ? (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                              )}
                              <span className="text-sm font-medium">
                                {course.completedModules}/{course.totalModules}
                              </span>
                            </div>
                            {course.averageScore !== null ? (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <TrendingUp className="h-3 w-3" />
                                <span>{course.averageScore.toFixed(0)}%</span>
                              </div>
                            ) : course.completedModules > 0 ? (
                              <span className="text-xs text-gray-400">No score</span>
                            ) : (
                              <span className="text-xs text-gray-300">&mdash;</span>
                            )}
                            {course.completedModules > 0 && (
                              <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className="bg-green-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${course.completionRate}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">No users found</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {users && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Users with Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter((u) => u.courseProgress.some((c) => c.completedModules > 0)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.reduce(
                  (sum, u) =>
                    sum +
                    u.courseProgress.filter((c) => c.completedModules === c.totalModules).length,
                  0
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ==========================================
// RAG Settings Tab
// ==========================================

function RagSettings() {
  const { data: keyMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = trpc.rag.getKeyMetrics.useQuery()
  const { data: priorities, isLoading: prioritiesLoading, refetch: refetchPriorities } = trpc.rag.getPriorities.useQuery()

  const updateMetrics = trpc.rag.updateKeyMetrics.useMutation({
    onSuccess: () => {
      refetchMetrics()
      setMetricsSaved(true)
      setTimeout(() => setMetricsSaved(false), 2000)
    },
  })

  const updatePriorities = trpc.rag.updatePriorities.useMutation({
    onSuccess: () => {
      refetchPriorities()
      setPrioritiesSaved(true)
      setTimeout(() => setPrioritiesSaved(false), 2000)
    },
  })

  const [metricValues, setMetricValues] = useState<Record<string, string>>({})
  const [priorityLabels, setPriorityLabels] = useState<string[]>([])
  const [newPriority, setNewPriority] = useState('')
  const [metricsSaved, setMetricsSaved] = useState(false)
  const [prioritiesSaved, setPrioritiesSaved] = useState(false)
  const [metricsInitialized, setMetricsInitialized] = useState(false)
  const [prioritiesInitialized, setPrioritiesInitialized] = useState(false)

  // Initialize form state from loaded data
  if (keyMetrics && !metricsInitialized) {
    const values: Record<string, string> = {}
    keyMetrics.forEach((m) => { values[m.id] = m.value })
    setMetricValues(values)
    setMetricsInitialized(true)
  }

  if (priorities && !prioritiesInitialized) {
    setPriorityLabels(priorities.map((p) => p.label))
    setPrioritiesInitialized(true)
  }

  const handleSaveMetrics = () => {
    if (!keyMetrics) return
    const updates = keyMetrics.map((m) => ({
      id: m.id,
      value: metricValues[m.id] || '',
    }))
    updateMetrics.mutate(updates)
  }

  const handleSavePriorities = () => {
    const data = priorityLabels
      .filter((l) => l.trim())
      .map((label, i) => ({ label: label.trim(), order: i + 1 }))
    updatePriorities.mutate(data)
  }

  const handleAddPriority = () => {
    if (!newPriority.trim()) return
    setPriorityLabels([...priorityLabels, newPriority.trim()])
    setNewPriority('')
  }

  const handleRemovePriority = (index: number) => {
    setPriorityLabels(priorityLabels.filter((_, i) => i !== index))
  }

  if (metricsLoading || prioritiesLoading) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-green-600 mb-4" />
        <p className="text-gray-600">Loading RAG settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Key Metrics
              </CardTitle>
              <CardDescription>Set the key metric values displayed on the RAG dashboard</CardDescription>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSaveMetrics}
              disabled={updateMetrics.isLoading}
            >
              {metricsSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {updateMetrics.isLoading ? 'Saving...' : 'Save Metrics'}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {keyMetrics?.map((metric) => (
              <div key={metric.id} className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">{metric.label}</label>
                <input
                  type="text"
                  value={metricValues[metric.id] || ''}
                  onChange={(e) =>
                    setMetricValues({ ...metricValues, [metric.id]: e.target.value })
                  }
                  placeholder={`Enter ${metric.label.toLowerCase()}...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Q1 Priorities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Priorities
              </CardTitle>
              <CardDescription>Manage the quarterly priorities shown on the RAG dashboard</CardDescription>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSavePriorities}
              disabled={updatePriorities.isLoading}
            >
              {prioritiesSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {updatePriorities.isLoading ? 'Saving...' : 'Save Priorities'}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {priorityLabels.map((label, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-400 w-6">{index + 1}.</span>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => {
                    const updated = [...priorityLabels]
                    updated[index] = e.target.value
                    setPriorityLabels(updated)
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-600"
                  onClick={() => handleRemovePriority(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <div className="flex items-center gap-2 pt-2">
              <span className="w-6" />
              <input
                type="text"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPriority()}
                placeholder="Add a new priority..."
                className="flex-1 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleAddPriority}
                disabled={!newPriority.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
