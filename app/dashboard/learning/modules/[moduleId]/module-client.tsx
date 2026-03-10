'use client'

import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock, Award, ArrowRight, Printer, Lock, Circle } from 'lucide-react'
import QuizComponent from './quiz-component'

export default function ModuleClient({ moduleId }: { moduleId: string }) {
  const [currentSection, setCurrentSection] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const { data: module, isLoading } = trpc.learning.getModule.useQuery({ moduleId })
  const { data: nextModule } = trpc.learning.getNextModule.useQuery({ moduleId })
  const { data: courseData } = trpc.learning.getModules.useQuery(
    { courseSlug: module?.course?.slug || 'netzero' },
    { enabled: !!module?.course?.slug }
  )
  const allModules = courseData?.modules || []
  
  const courseSlug = module?.course?.slug || 'netzero'
  const isInternalCourse = courseSlug === 'new-starter'
  const backToTrainingHref = isInternalCourse ? '/intranet/training/new-starter' : `/dashboard/learning/${courseSlug}`
  const updateProgress = trpc.learning.updateProgress.useMutation()
  const completeModule = trpc.learning.completeModule.useMutation()
  const utils = trpc.useUtils()

  // Track time spent accurately
  useEffect(() => {
    // Wait for module to load before tracking progress
    if (!moduleId || !module || isLoading) return

    // Double-check module ID matches - prevent stale IDs
    if (module.id !== moduleId) {
      console.warn(`Module ID mismatch: expected ${module.id}, got ${moduleId}`)
      return
    }

    let lastSavedTime = Date.now()
    let saveInterval: NodeJS.Timeout | null = null

    // Function to save elapsed time
    const saveTime = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - lastSavedTime) / 1000) // seconds
      
      if (elapsed > 0 && moduleId && module && module.id === moduleId) {
        updateProgress.mutate(
          { moduleId: module.id, timeSpent: elapsed }, // Use module.id to ensure we have the correct ID
          {
            onError: (error) => {
              // Silently handle errors - module might not exist or user might not be authenticated
              console.warn('Failed to update progress:', error.message)
            },
            onSuccess: (result) => {
              // If module not found, the mutation returns null - that's okay
              if (result === null) {
                console.warn(`Module ${moduleId} not found in database - may have been reseeded`)
              }
            },
          }
        )
        lastSavedTime = now
      }
    }

    // Initial progress update (only if module exists and IDs match)
    if (moduleId && module && module.id === moduleId) {
      updateProgress.mutate(
        { moduleId: module.id }, // Use module.id to ensure we have the correct ID
        {
          onError: (error) => {
            // Silently handle errors - module might not exist or user might not be authenticated
            console.warn('Failed to update progress:', error.message)
          },
          onSuccess: (result) => {
            // If module not found, the mutation returns null - that's okay
            if (result === null) {
              console.warn(`Module ${moduleId} not found in database - may have been reseeded`)
            }
          },
        }
      )
    }

    // Save time every 30 seconds to prevent data loss
    saveInterval = setInterval(saveTime, 30000)

    // Save time when page becomes hidden (user switches tabs, closes window, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveTime()
      }
    }

    // Save time before page unloads
    const handleBeforeUnload = () => {
      saveTime()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup: save any remaining time when component unmounts
    return () => {
      if (saveInterval) {
        clearInterval(saveInterval)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      saveTime() // Final save
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, module, isLoading]) // Wait for module to load

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="max-w-4xl w-full">Loading...</div>
      </main>
    )
  }

  if (!module) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="max-w-4xl w-full">Module not found</div>
      </main>
    )
  }

  // Module order 1 should never be locked - double check on client side
  // Override isLocked if it's incorrectly set for module 1
  const effectiveIsLocked = module.order === 1 ? false : module.isLocked

  if (effectiveIsLocked) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="max-w-4xl w-full">
          <Card>
            <CardHeader>
              <CardTitle>Module Locked</CardTitle>
              <CardDescription>
                Please complete the previous module to unlock this one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={backToTrainingHref}>
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {isInternalCourse ? 'Training' : 'Course'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const content = JSON.parse(module.content || '{}')
  const sections = content.sections || []
  const keyTakeaways = content.keyTakeaways || []

  const handleComplete = async () => {
    await completeModule.mutateAsync({ moduleId })
    await utils.learning.getDashboardStats.invalidate()
    await utils.learning.getModules.invalidate()
    await utils.learning.getUserBadges.invalidate()
  }

  const handleQuizComplete = async () => {
    setShowQuiz(false)
    await handleComplete()
    setIsCompleted(true)
  }

  return (
    <main className="flex min-h-screen flex-col p-8 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl w-full mx-auto">
        {/* Header */}
          <div className="mb-6">
            <Link href={backToTrainingHref}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {isInternalCourse ? 'Training' : 'Course'}
              </Button>
            </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Module {module.order}: {module.title}
              </h1>
              <p className="text-gray-600">{module.description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {module.duration} min
            </div>
          </div>
        </div>

        {isCompleted ? (
          <div className="space-y-6">
            {/* Completion Banner */}
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">🎉</div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Module Complete!</h2>
                    <p className="text-gray-600">
                      You&apos;ve finished Module {module.order}: {module.title}
                    </p>
                  </div>
                  {module.badgeEmoji && (
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-3xl block">{module.badgeEmoji}</span>
                      <p className="text-xs font-medium text-gray-700 mt-1">{module.badgeName}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Action */}
            {nextModule ? (
              <Link href={`/dashboard/learning/${nextModule.courseSlug || courseSlug}/modules/${nextModule.id}`} className="block">
                <Card className="border-blue-200 bg-blue-50/50 hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Up Next</p>
                        <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          Module {nextModule.order}: {nextModule.title}
                        </p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="border-green-300 bg-green-50">
                <CardContent className="p-5 text-center">
                  <p className="text-lg font-semibold text-green-800 mb-3">All modules complete! 🎓</p>
                  <Link href={`/dashboard/learning/${courseSlug}/certificate`}>
                    <Button size="lg">
                      <Award className="w-4 h-4 mr-2" />
                      View Course Certificate
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* All Modules Progress */}
            {allModules.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Your Progress</CardTitle>
                  <CardDescription>
                    {allModules.filter((m: any) => m.progress?.completed).length} of {allModules.length} modules complete
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {allModules.map((m: any) => {
                      const completed = m.progress?.completed || m.id === moduleId
                      const isCurrent = m.id === moduleId
                      const isLocked = m.order === 1 ? false : (m.isLocked && !completed)
                      return (
                        <Link
                          key={m.id}
                          href={isLocked ? '#' : `/dashboard/learning/${courseSlug}/modules/${m.id}`}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            isCurrent
                              ? 'border-green-300 bg-green-50'
                              : completed
                                ? 'border-green-200 bg-green-50/30 hover:bg-green-50'
                                : isLocked
                                  ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : isLocked ? (
                              <Lock className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${completed ? 'text-green-800' : isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                              Module {m.order}: {m.title}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">{m.duration} min</span>
                          {isCurrent && (
                            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">Just completed</span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Link href={backToTrainingHref}>
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {isInternalCourse ? 'Training' : 'Course Overview'}
              </Button>
            </Link>
          </div>
        ) : !showQuiz ? (
          <>
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600">
                  Section {currentSection + 1} of {sections.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Content Sections */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{sections[currentSection]?.title || 'Content'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {sections[currentSection]?.content || 'No content available'}
                  </p>
                  {sections[currentSection]?.source && (
                    <p className="text-sm text-gray-500 mt-4 italic">
                      Source: {sections[currentSection].source}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
              >
                Previous
              </Button>
              {currentSection < sections.length - 1 ? (
                <Button onClick={() => setCurrentSection(currentSection + 1)}>Next</Button>
              ) : (
                <Button onClick={() => setShowQuiz(true)}>Take Quiz</Button>
              )}
            </div>

            {/* Key Takeaways */}
            {currentSection === sections.length - 1 && keyTakeaways.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Key Takeaways
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {keyTakeaways.map((takeaway: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <QuizComponent
            moduleId={moduleId}
            quizzes={module.quizzes}
            onComplete={handleQuizComplete}
            badgeName={module.badgeName}
            badgeEmoji={module.badgeEmoji}
            courseSlug={courseSlug}
          />
        )}
      </div>
    </main>
  )
}

