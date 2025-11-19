'use client'

import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, ArrowRight, Search, Wrench } from 'lucide-react'

export default function DashboardClient() {
  const { data: courses, isLoading } = trpc.learning.getCourses.useQuery()

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Net Zero Course */}
      {courses?.find((c) => c.slug === 'netzero') && (
        <Card className="hover:shadow-lg transition-shadow flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🌍</span>
                <div>
                  <CardTitle className="text-2xl">Net Zero Fundamentals</CardTitle>
                  <CardDescription className="mt-2">
                    Interactive tutorial and guide for businesses learning about net zero
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>
                  {courses.find((c) => c.slug === 'netzero')?.moduleCount || 7} modules
                </span>
              </div>
              {courses.find((c) => c.slug === 'netzero')?.progress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-green-600">
                      {Math.round(
                        courses.find((c) => c.slug === 'netzero')?.progress?.completionPercentage || 0
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          courses.find((c) => c.slug === 'netzero')?.progress?.completionPercentage || 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4">
              <Link href="/dashboard/learning/netzero" className="block">
                <Button className="w-full" size="lg">
                  {courses.find((c) => c.slug === 'netzero')?.progress
                    ? 'Continue Learning'
                    : 'Start Course'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Greenwashing Course */}
      {courses?.find((c) => c.slug === 'greenwashing') && (
        <Card className="hover:shadow-lg transition-shadow flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🌿</span>
                <div>
                  <CardTitle className="text-2xl">Greenwashing Awareness</CardTitle>
                  <CardDescription className="mt-2">
                    Learn to identify and avoid greenwashing in business practices
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>
                  {courses.find((c) => c.slug === 'greenwashing')?.moduleCount || 7} modules
                </span>
              </div>
              {courses.find((c) => c.slug === 'greenwashing')?.progress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-green-600">
                      {Math.round(
                        courses.find((c) => c.slug === 'greenwashing')?.progress?.completionPercentage || 0
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          courses.find((c) => c.slug === 'greenwashing')?.progress?.completionPercentage || 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4">
              <Link href="/dashboard/learning/greenwashing" className="block">
                <Button className="w-full" size="lg">
                  {courses.find((c) => c.slug === 'greenwashing')?.progress
                    ? 'Continue Learning'
                    : 'Start Course'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
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

