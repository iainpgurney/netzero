'use client'

import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle2, Clock, TrendingUp } from 'lucide-react'

export default function AdminDashboardClient() {
  const { data: users, isLoading, error, refetch } = trpc.admin.getAllUsers.useQuery()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-green-600 mb-4" />
            <p className="text-gray-600">Loading user data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error Loading Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                {error.message || 'Failed to load admin data. Please check your permissions.'}
              </p>
              {error.data?.code === 'FORBIDDEN' && (
                <p className="text-sm text-red-600">
                  You don't have admin access. Only authorized users can access this page.
                </p>
              )}
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Progress Dashboard</h1>
            <p className="text-gray-600">Track course completion and quiz scores for all users</p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Users Table */}
        {users && users.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>All Users ({users.length})</CardTitle>
              <CardDescription>Course completion and average quiz scores</CardDescription>
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
                              {/* Completion */}
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
                              {/* Score */}
                              {course.averageScore !== null ? (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <TrendingUp className="h-3 w-3" />
                                  <span>{course.averageScore.toFixed(0)}%</span>
                                </div>
                              ) : course.completedModules > 0 ? (
                                <span className="text-xs text-gray-400">No score</span>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                              {/* Completion Rate */}
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
    </div>
  )
}
