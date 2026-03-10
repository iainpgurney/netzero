'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  UserPlus,
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Lock,
  Circle,
} from 'lucide-react'
import { trpc } from '@/lib/trpc'

export default function NewStarterTrainingPage() {
  const { data: courseData, isLoading } = trpc.learning.getModules.useQuery({ courseSlug: 'new-starter' })
  const modules = courseData?.modules || []
  const course = courseData?.course

  const completedCount = modules.filter((m: any) => m.progress?.completed).length
  const totalCount = modules.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const currentModule = modules.find((m: any) => !m.progress?.completed && !(m.order === 1 ? false : m.isLocked))
  const allDone = totalCount > 0 && completedCount === totalCount

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link
          href="/intranet/training"
          className="inline-flex items-center text-sm text-gray-500 hover:text-green-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Training Hub
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-7 w-7 text-blue-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">New Starter Training</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Welcome to Carma! Complete these modules in your first two weeks to get up to speed quickly.
          </p>
        </div>

        {isLoading && (
          <div className="space-y-3 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse bg-white border rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && totalCount > 0 && (
          <>
            {/* Progress + CTA */}
            <Card className="mb-8 border-green-200 bg-green-50/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {allDone ? 'All Complete!' : completedCount > 0 ? 'Keep going!' : 'Ready to begin'}
                    </span>
                    {allDone && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  </div>
                  <span className="text-sm text-gray-500">{completedCount} / {totalCount} modules</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2.5 mb-4">
                  <div
                    className={`h-2.5 rounded-full transition-all ${allDone ? 'bg-green-600' : 'bg-green-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {currentModule && (
                  <Link
                    href={`/dashboard/learning/new-starter/modules/${(currentModule as any).id}`}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                  >
                    {completedCount > 0 ? 'Continue' : 'Start'}: Module {(currentModule as any).order} — {(currentModule as any).title}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {allDone && (
                  <Link
                    href="/dashboard/learning/new-starter/certificate"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                  >
                    View Certificate
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Module List */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Training Modules</h2>
              <div className="space-y-3">
                {modules.map((mod: any) => {
                  const completed = mod.progress?.completed || false
                  const locked = mod.order === 1 ? false : (mod.isLocked || false)
                  const href = locked ? '#' : `/dashboard/learning/new-starter/modules/${mod.id}`

                  return (
                    <Link key={mod.id} href={href} className={`block group ${locked ? 'pointer-events-none' : ''}`}>
                      <Card className={`transition-all ${
                        completed
                          ? 'border-green-200 bg-green-50/40 hover:shadow-md'
                          : locked
                            ? 'border-gray-200 bg-gray-50 opacity-60'
                            : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {completed ? (
                                <CheckCircle2 className="w-7 h-7 text-green-600" />
                              ) : locked ? (
                                <Lock className="w-7 h-7 text-gray-300" />
                              ) : (
                                <div className="w-7 h-7 rounded-full border-2 border-green-400 flex items-center justify-center">
                                  <span className="text-xs font-bold text-green-600">{mod.order}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className={`font-semibold ${completed ? 'text-green-800' : locked ? 'text-gray-400' : 'text-gray-900 group-hover:text-green-700'} transition-colors`}>
                                  Module {mod.order}: {mod.title}
                                </h3>
                                {mod.hasBadge && (
                                  <span className="text-lg" title={mod.badgeName}>{mod.badgeEmoji}</span>
                                )}
                              </div>
                              <p className={`text-sm mb-1.5 ${locked ? 'text-gray-400' : 'text-gray-500'}`}>{mod.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {mod.duration} mins
                                </span>
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3.5 w-3.5" />
                                  {mod.quizzes?.length || '?'} quiz questions
                                </span>
                                {mod.progress?.quizScore !== undefined && mod.progress?.quizScore !== null && (
                                  <span className={`font-medium ${mod.progress.quizScore >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                                    Quiz: {Math.round(mod.progress.quizScore)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {completed ? (
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">Complete</span>
                              ) : locked ? (
                                <span className="text-xs text-gray-400">Locked</span>
                              ) : (
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
              <p className="text-sm text-gray-400 mt-4 text-center">
                {totalCount} modules · {modules.reduce((sum: number, m: any) => sum + (m.duration || 0), 0)} minutes total
              </p>
            </section>
          </>
        )}

        {!isLoading && totalCount === 0 && (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Training modules are being set up.</p>
              <p className="text-sm text-gray-400">Please check back shortly or contact your manager.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
