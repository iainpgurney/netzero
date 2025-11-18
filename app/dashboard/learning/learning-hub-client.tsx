'use client'

import { useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SignOutButton from '@/components/sign-out-button'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle2, Lock, Clock, Trophy, Award, ExternalLink } from 'lucide-react'

export default function LearningHubClient() {
  const { data: stats, isLoading: statsLoading, error: statsError } = trpc.learning.getDashboardStats.useQuery()
  const { data: modules, isLoading: modulesLoading, error: modulesError } = trpc.learning.getModules.useQuery()


  if (statsLoading || modulesLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="z-10 max-w-6xl w-full">
          <div className="text-center">Loading...</div>
        </div>
      </main>
    )
  }

  // Extract modules array - tRPC with superjson should return array directly
  const modulesList = Array.isArray(modules) ? modules : []

  // Show error if query failed
  if (modulesError) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="z-10 max-w-6xl w-full">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-4">
                {modulesError.message || 'Failed to load modules'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Error details: {JSON.stringify(modulesError, null, 2)}
              </p>
              <p className="text-sm text-gray-600">
                Please refresh the page or check your connection.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <main className="flex min-h-screen flex-col p-8 bg-gradient-to-b from-green-50 to-white">
      <div className="z-10 max-w-6xl w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-black p-3 rounded-lg">
              <Image
                src="/carma-logo.png"
                alt="Carma Logo"
                width={140}
                height={47}
                className="h-auto"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Net Zero Learning Hub</h1>
              <p className="text-gray-600 mt-2">
                Interactive tutorial and guide for businesses learning about net zero
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats?.completionPercentage || 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.completedModules || 0} of {stats?.totalModules || 0} modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Badges Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats?.badgesEarned || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                of {stats?.totalBadges || 0} available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Time Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats?.totalTimeSpent ? formatTime(stats.totalTimeSpent) : '0m'}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total learning time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Knowledge Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats?.knowledgePoints || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Points earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Ring */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Track your journey through the Net Zero Learning Hub</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - (stats?.completionPercentage || 0) / 100)}`}
                    className="text-green-600 transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {stats?.completionPercentage || 0}%
                  </span>
                </div>
              </div>
              <div className="flex-1">
                {stats?.currentModule ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current Module:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats.currentModule.title}
                    </p>
                    <Link href={`/dashboard/learning/modules/${stats.currentModule.id}`}>
                      <Button className="mt-4">Continue Learning</Button>
                    </Link>
                  </div>
                ) : stats?.hasCertificate ? (
                  <div>
                    <p className="text-lg font-semibold text-green-600 mb-2">
                      🎉 Congratulations!
                    </p>
                    <p className="text-gray-600 mb-4">
                      You&apos;ve completed all modules. View your certificate below.
                    </p>
                    <Link href="/dashboard/learning/certificate">
                      <Button>View Certificate</Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Ready to start your journey?
                    </p>
                    <p className="text-gray-600 mb-4">
                      Begin with Module 1: Net Zero Fundamentals
                    </p>
                    {modulesList.length > 0 && (
                      <Link href={`/dashboard/learning/modules/${modulesList[0].id}`}>
                        <Button>Start Learning</Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Badges */}
        {stats?.recentBadges && stats.recentBadges.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Recent Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {stats.recentBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <span className="text-4xl mb-2">{badge.module.badgeEmoji}</span>
                    <p className="text-sm font-medium text-gray-900 text-center">
                      {badge.module.badgeName}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Module Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Module Overview</CardTitle>
            <CardDescription>
              Complete modules in order to unlock the next one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modulesList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">
                    No modules available.
                  </p>
                  {modulesError ? (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-600 font-semibold mb-2">Error Loading Modules:</p>
                      <p className="text-sm text-red-700">{modulesError.message || 'Unknown error'}</p>
                      <p className="text-xs text-red-600 mt-2">
                        {modulesError.data?.code === 'UNAUTHORIZED' 
                          ? 'Please log out and log back in to refresh your session.'
                          : 'Check browser console (F12) for more details.'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mt-2">
                      Check browser console (F12) for debug information.
                    </p>
                  )}
                </div>
              ) : (
                modulesList.map((module) => {
                const isCompleted = module.progress?.completed || false
                const isLocked = module.isLocked || false
                const hasBadge = module.hasBadge || false

                return (
                  <Link
                    key={module.id}
                    href={isLocked ? '#' : `/dashboard/learning/modules/${module.id}`}
                    className={`block p-4 rounded-lg border-2 transition-all ${
                      isLocked
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                        : isCompleted
                          ? 'border-green-200 bg-green-50 hover:border-green-300'
                          : 'border-blue-200 bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : isLocked ? (
                            <Lock className="w-6 h-6 text-gray-400" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Module {module.order}: {module.title}
                            </h3>
                            {hasBadge && (
                              <span className="text-xl" title={module.badgeName}>
                                {module.badgeEmoji}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {module.duration} min
                            </span>
                            {module.progress && (
                              <>
                                {module.progress.quizScore !== null && (
                                  <span>Quiz: {Math.round(module.progress.quizScore)}%</span>
                                )}
                                {module.progress.timeSpent > 0 && (
                                  <span>
                                    Time: {formatTime(module.progress.timeSpent)}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {isLocked ? (
                        <span className="text-sm text-gray-400">Locked</span>
                      ) : isCompleted ? (
                        <span className="text-sm text-green-600 font-medium">Completed</span>
                      ) : (
                        <Button variant="outline" size="sm">
                          {module.progress ? 'Continue' : 'Start'}
                        </Button>
                      )}
                    </div>
                  </Link>
                )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer - Little Book of Net Zero */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Based on The Little Book of Net Zero
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  This Learning Hub is based on{' '}
                  <a
                    href="https://pages.bsigroup.com/l/35972/2023-12-14/3t76lq3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline font-semibold"
                  >
                    The Little Book of Net Zero
                  </a>
                  {' '}by BSI Group, providing businesses with practical guidance on achieving net zero emissions.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/little-book-of-net-zero">
                  <Button variant="outline" className="w-full md:w-auto">
                    Learn More
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a
                  href="https://pages.bsigroup.com/l/35972/2023-12-14/3t76lq3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full md:w-auto">
                    Download Original Guide
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

