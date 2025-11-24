'use client'

import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, ArrowRight, Search, Wrench } from 'lucide-react'

export default function DashboardClient() {
  const { data: courses, isLoading, error } = trpc.learning.getCourses.useQuery()

  // Debug logging (always log errors, even in production for debugging)
  console.log('[DASHBOARD] Courses data:', {
    courses,
    isLoading,
    error: error ? {
      message: error.message,
      code: error.data?.code,
      shape: error.data,
    } : null,
    coursesCount: courses?.length,
    courseSlugs: courses?.map(c => c.slug),
    environment: process.env.NODE_ENV,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    const errorMessage = error.message || 'Unknown error occurred'
    const isDatabaseError = errorMessage.includes('DATABASE_URL') || 
                           errorMessage.includes('database') || 
                           errorMessage.includes('connection') ||
                           errorMessage.includes('P1001') ||
                           errorMessage.includes('Can\'t reach')
    
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Error Loading Courses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-700 font-medium">{errorMessage}</p>
          
          {isDatabaseError && (
            <div className="bg-red-100 p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-red-900">Database Connection Issue</p>
              <p className="text-sm text-red-800">
                The production database may not be connected or seeded. 
                Check DigitalOcean logs and verify DATABASE_URL is set correctly.
              </p>
              <p className="text-xs text-red-700 mt-2">
                Error code: {error.data?.code || 'UNKNOWN'}
              </p>
            </div>
          )}
          
          <div className="text-xs text-gray-600 space-y-1">
            <p>To fix this:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Check DigitalOcean App Platform → Runtime Logs</li>
              <li>Verify DATABASE_URL environment variable is set</li>
              <li>Seed the production database: <code className="bg-gray-200 px-1 rounded">npm run db:seed</code></li>
              <li>Check database connection: <code className="bg-gray-200 px-1 rounded">npm run check-production-db</code></li>
            </ol>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get icon mapping for courses
  const getCourseIcon = (slug: string, icon?: string | null) => {
    if (icon) return icon
    // Fallback icons based on slug
    if (slug === 'netzero') return '🌍'
    if (slug === 'greenwashing') return '🌿'
    if (slug === 'carbon-credit-integrity') return '⚖️'
    return '📚'
  }

  // Filter out courses with no modules (shouldn't happen, but safety check)
  const validCourses = courses?.filter(c => c.moduleCount > 0) || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Render all courses dynamically */}
      {validCourses.length > 0 ? (
        validCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getCourseIcon(course.slug, course.icon)}</span>
                  <div>
                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                    <CardDescription className="mt-2">{course.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.moduleCount} modules</span>
                </div>
                {course.progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-green-600">
                        {Math.round(course.progress.completionPercentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${course.progress.completionPercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4">
                <Link href={`/dashboard/learning/${course.slug}`} className="block">
                  <Button className="w-full" size="lg">
                    {course.progress && course.progress.completedModules > 0
                      ? 'Continue Learning'
                      : 'Start Course'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              {courses && courses.length === 0 
                ? 'No courses available' 
                : 'Loading courses...'}
            </p>
            {process.env.NODE_ENV === 'development' && courses && (
              <p className="text-center text-xs text-gray-400 mt-2">
                Debug: {courses.length} courses found, {validCourses.length} valid
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resources Card - Always show */}
      <Card className="hover:shadow-lg transition-shadow bg-green-50 border-green-200 flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Resources & Tools</CardTitle>
                <CardDescription className="mt-2">
                  Access helpful tools including the Greenwashing Checker
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Wrench className="w-4 h-4" />
              <span>Greenwashing Checker & Analysis Tools</span>
            </div>
            <p className="text-sm text-gray-700">
              Analyze statements, claims, images, and websites to detect potential greenwashing.
              Get detailed analysis with trust scores and improvement suggestions.
            </p>
          </div>
          <div className="mt-6 pt-4">
            <Link href="/resources" className="block">
              <Button className="w-full" size="lg" variant="default">
                Access Resources
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
