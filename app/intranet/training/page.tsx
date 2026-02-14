'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  UserPlus,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Trophy,
  CheckCircle2,
  BarChart3,
} from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { useSession } from 'next-auth/react'

export default function TrainingHubPage() {
  const { data: courses, isLoading } = trpc.learning.getCourses.useQuery()
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'MEMBER'
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'

  function getCourseEmoji(slug: string) {
    if (slug === 'greenwashing') return '🌿'
    if (slug === 'netzero') return '🌍'
    if (slug === 'carbon-credit-integrity') return '🛡️'
    if (slug === 'tnfd') return '🦋'
    return '📚'
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="h-7 w-7 text-green-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Training Hub</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Develop your skills and stay compliant. Browse training by category or access your enrolled courses below.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-4 mb-10">
          {/* New Starter Training */}
          <Link href="/intranet/training/new-starter" className="group block">
            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent group-hover:border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                    <UserPlus className="h-7 w-7 text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">New Starter Training</h3>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">Onboarding</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Everything you need to get up to speed in your first 30 days. Company overview, product walkthrough, systems training and compliance essentials.
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Certificates & Badges */}
          <Link href="/dashboard/profile" className="group block">
            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent group-hover:border-l-amber-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-amber-100 rounded-xl flex-shrink-0">
                    <Trophy className="h-7 w-7 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">Certificates &amp; Badges</h3>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">Achievements</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      View your earned certificates, badges and achievements. Download or share your certificates of completion.
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Training Tracker — Admin only */}
          {isAdmin && (
            <Link href="/intranet/training/tracker" className="group block">
              <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent group-hover:border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                      <BarChart3 className="h-7 w-7 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Training Tracker</h3>
                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">Admin</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        View team training progress, course completion rates, and quiz scores across the organisation.
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {/* LMS Courses */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-700" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Courses</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4" />
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-1" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isComplete = course.progress.completionPercentage === 100
                const hasStarted = course.progress.completedModules > 0
                return (
                  <Link key={course.id} href={`/dashboard/learning/${course.slug}`} className="group block">
                    <Card className="h-full hover:shadow-lg transition-all duration-200 border-t-4 border-t-green-500 group-hover:border-t-green-600">
                      <CardContent className="p-6">
                        <div className="text-3xl mb-3">{getCourseEmoji(course.slug)}</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                          {course.description}
                        </p>

                        {/* Progress */}
                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                            <span>{course.progress.completedModules} / {course.progress.totalModules} modules</span>
                            <span>{Math.round(course.progress.completionPercentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-green-400'}`}
                              style={{ width: `${course.progress.completionPercentage}%` }}
                            />
                          </div>
                          <div className="mt-3 flex items-center text-sm font-medium">
                            {isComplete ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Completed
                              </span>
                            ) : hasStarted ? (
                              <span className="text-green-700 flex items-center gap-1 group-hover:text-green-800">
                                Continue learning
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </span>
                            ) : (
                              <span className="text-green-700 flex items-center gap-1 group-hover:text-green-800">
                                Start course
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No courses available yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
