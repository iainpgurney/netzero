'use client'

import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function CoursesClient() {
  const { data: courses, isLoading } = trpc.learning.getCourses.useQuery()

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="max-w-6xl w-full">Loading courses...</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col p-8 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-6xl w-full mx-auto">

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses && courses.length > 0 ? (
            courses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {course.icon && (
                        <span className="text-4xl">{course.icon}</span>
                      )}
                      <div>
                        <CardTitle className="text-2xl">{course.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {course.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                            style={{ width: `${course.progress.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <Link href={`/dashboard/learning/${course.slug}`} className="block">
                      <Button className="w-full" size="lg">
                        {course.progress ? 'Continue Learning' : 'Start Course'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-2">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No courses available at this time.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resources Link */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Resources & Tools</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Access helpful tools including the Greenwashing Checker to analyze statements and claims.
                  </p>
                </div>
              </div>
              <Link href="/resources">
                <Button variant="outline" className="ml-4">
                  View Resources
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Free Access for Carma Users</h3>
                <p className="text-sm text-gray-700">
                  All training courses are available free of charge for users with approved business domains.
                  Sign in with your company email to get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

