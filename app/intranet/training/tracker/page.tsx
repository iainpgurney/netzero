'use client'

import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

export default function TrainingTrackerPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'MEMBER'
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'

  const { data: users, isLoading } = trpc.admin.getAllUsers.useQuery(undefined, {
    enabled: isAdmin,
  })

  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [filterCourse, setFilterCourse] = useState<string>('all')

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">You do not have permission to view this page.</p>
            <Link href="/intranet/training" className="text-green-600 hover:text-green-700 text-sm mt-4 inline-block">
              Back to Training Hub
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get all unique courses from the data
  const allCourses = users?.[0]?.courseProgress?.map((cp) => ({
    id: cp.courseId,
    slug: cp.courseSlug,
    title: cp.courseTitle,
  })) || []

  // Summary stats
  const totalUsers = users?.length || 0
  const usersWithProgress = users?.filter((u) =>
    u.courseProgress.some((cp) => cp.completedModules > 0)
  ).length || 0
  const fullyComplete = users?.filter((u) =>
    u.courseProgress.every((cp) => cp.completionRate === 100)
  ).length || 0

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <Link
          href="/intranet/training"
          className="inline-flex items-center text-sm text-gray-500 hover:text-green-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Training Hub
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-7 w-7 text-green-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Training Tracker</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Track team training progress and course completion across the organisation.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  <p className="text-sm text-gray-500">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{usersWithProgress}</p>
                  <p className="text-sm text-gray-500">Started Training</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{fullyComplete}</p>
                  <p className="text-sm text-gray-500">All Courses Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Filter */}
        {allCourses.length > 1 && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">Filter by course:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterCourse('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterCourse === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Courses
              </button>
              {allCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setFilterCourse(course.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterCourse === course.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {course.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Table */}
        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Loading training data...</p>
              </div>
            </CardContent>
          </Card>
        ) : users && users.length > 0 ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Team Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Header row */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">User</div>
                {filterCourse === 'all' ? (
                  allCourses.map((course) => (
                    <div key={course.id} className={`${allCourses.length <= 3 ? 'col-span-3' : 'col-span-2'} text-center`}>
                      {course.title}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="col-span-3 text-center">Progress</div>
                    <div className="col-span-3 text-center">Score</div>
                    <div className="col-span-3 text-center">Status</div>
                  </>
                )}
              </div>

              {/* User rows */}
              <div className="divide-y divide-gray-100">
                {users.map((user) => {
                  const isExpanded = expandedUser === user.id
                  const filteredProgress = filterCourse === 'all'
                    ? user.courseProgress
                    : user.courseProgress.filter((cp) => cp.courseId === filterCourse)

                  return (
                    <div key={user.id}>
                      {/* Main row */}
                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                        className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {/* User info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0 md:flex-none md:w-1/4">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                            {user.image ? (
                              <img src={user.image} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-green-700">
                                  {user.name?.[0] || '?'}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-400 truncate md:hidden">{user.email}</p>
                            </div>
                          </div>

                          {/* Progress bars (desktop) */}
                          <div className="hidden md:flex flex-1 items-center gap-4">
                            {filteredProgress.map((cp) => (
                              <div key={cp.courseId} className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all ${
                                        cp.completionRate === 100 ? 'bg-green-500' : cp.completionRate > 0 ? 'bg-green-400' : 'bg-gray-200'
                                      }`}
                                      style={{ width: `${Math.max(cp.completionRate, 2)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-medium text-gray-500 w-10 text-right">
                                    {Math.round(cp.completionRate)}%
                                  </span>
                                  {cp.completionRate === 100 && (
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Mobile summary */}
                          <div className="md:hidden flex items-center gap-2">
                            {filteredProgress.every((cp) => cp.completionRate === 100) ? (
                              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Complete
                              </span>
                            ) : filteredProgress.some((cp) => cp.completedModules > 0) ? (
                              <span className="text-xs font-medium text-amber-600">In Progress</span>
                            ) : (
                              <span className="text-xs font-medium text-gray-400">Not Started</span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-6 pb-4 bg-gray-50/50">
                          <div className="pl-8 space-y-4">
                            {filteredProgress.map((cp) => (
                              <div key={cp.courseId} className="bg-white rounded-lg border p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-sm text-gray-900">{cp.courseTitle}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      {cp.completedModules}/{cp.totalModules} modules
                                    </span>
                                    {cp.averageScore !== null && (
                                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                        Avg: {cp.averageScore}%
                                      </span>
                                    )}
                                    {cp.completionRate === 100 ? (
                                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                                        Complete
                                      </span>
                                    ) : cp.completedModules > 0 ? (
                                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                                        In Progress
                                      </span>
                                    ) : (
                                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">
                                        Not Started
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {/* Module breakdown */}
                                <div className="space-y-1.5">
                                  {cp.moduleScores.map((ms) => (
                                    <div key={ms.moduleId} className="flex items-center gap-3 text-xs">
                                      {ms.completed ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                      )}
                                      <span className={`flex-1 ${ms.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {ms.moduleTitle}
                                      </span>
                                      {ms.quizScore !== null && (
                                        <span className={`font-medium ${ms.quizScore >= 80 ? 'text-green-600' : ms.quizScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                          {Math.round(ms.quizScore)}%
                                        </span>
                                      )}
                                      {ms.completedAt && (
                                        <span className="text-gray-400">
                                          {new Date(ms.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
