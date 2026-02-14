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
} from 'lucide-react'
import { trpc } from '@/lib/trpc'

export default function NewStarterTrainingPage() {
  const { data: courses } = trpc.learning.getCourses.useQuery()
  const newStarterCourse = courses?.find((c) => c.slug === 'new-starter')

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

        {/* Page Header */}
        <div className="mb-10">
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

        {/* Training Modules */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Training Modules</h2>
          <div className="grid gap-4">
            {/* Company Overview — LMS Module */}
            {newStarterCourse && (
              <Link href={`/dashboard/learning/new-starter`} className="group block">
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm shrink-0">
                        1
                      </div>
                      <div className="p-2 bg-green-50 rounded-lg shrink-0">
                        <BookOpen className="h-5 w-5 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">New Starter Training</h3>
                        <p className="text-sm text-gray-500 mb-2">
                          Company overview, product walkthrough, systems training and security — everything you need in your first 30 days.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            140 mins
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            4 Interactive Modules
                          </span>
                        </div>
                        {/* Progress */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${newStarterCourse.progress.completionPercentage === 100 ? 'bg-green-500' : 'bg-green-400'}`}
                              style={{ width: `${newStarterCourse.progress.completionPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {newStarterCourse.progress.completedModules}/{newStarterCourse.progress.totalModules} modules
                          </span>
                          {newStarterCourse.progress.completionPercentage === 100 && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

          </div>
        </section>

      </div>
    </div>
  )
}
