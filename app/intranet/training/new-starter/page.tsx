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
  Building2,
  Monitor,
  ShieldCheck,
  Leaf,
  Heart,
  Palette,
} from 'lucide-react'
import { trpc } from '@/lib/trpc'

const MODULES = [
  { order: 1, title: 'Company Overview', description: 'What Carma exists to do, how we are different, and how your role connects to real-world impact.', duration: 30, icon: Building2, color: 'bg-green-100 text-green-700' },
  { order: 2, title: 'Product Walkthrough', description: 'Our platforms, products, and how they create value for customers.', duration: 40, icon: Monitor, color: 'bg-blue-100 text-blue-700' },
  { order: 3, title: 'Systems Training', description: 'Tools, systems and processes you will use day-to-day.', duration: 30, icon: Monitor, color: 'bg-purple-100 text-purple-700' },
  { order: 4, title: 'Security & Compliance', description: 'Information security, data handling, and keeping our systems safe.', duration: 25, icon: ShieldCheck, color: 'bg-red-100 text-red-700' },
  { order: 5, title: 'Climate Impact & Carbon', description: 'Carbon credits, tree planting, nature-based solutions and MRV.', duration: 45, icon: Leaf, color: 'bg-emerald-100 text-emerald-700' },
  { order: 6, title: 'Social Value & Veterans', description: 'How we deliver social impact alongside environmental outcomes.', duration: 20, icon: Heart, color: 'bg-pink-100 text-pink-700' },
]

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

        {/* Overall Progress */}
        {newStarterCourse && (
          <Card className="mb-8 border-green-200 bg-green-50/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">Overall Progress</span>
                <span className="text-sm text-gray-500">
                  {newStarterCourse.progress.completedModules}/{newStarterCourse.progress.totalModules} modules complete
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${newStarterCourse.progress.completionPercentage === 100 ? 'bg-green-500' : 'bg-green-400'}`}
                  style={{ width: `${newStarterCourse.progress.completionPercentage}%` }}
                />
              </div>
              {newStarterCourse.progress.completionPercentage === 100 && (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-green-700 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  All modules complete!
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Training Modules */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Training Modules</h2>
          <div className="grid gap-4">
            {MODULES.map((mod) => {
              const Icon = mod.icon
              return (
                <Link key={mod.order} href="/dashboard/learning/new-starter" className="group block">
                  <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm shrink-0">
                          {mod.order}
                        </div>
                        <div className={`p-2 rounded-lg shrink-0 ${mod.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                            {mod.title}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">{mod.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {mod.duration} mins
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" />
                              Interactive Module
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
