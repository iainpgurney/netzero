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
  Pen,
  Cog,
} from 'lucide-react'
import { trpc } from '@/lib/trpc'

const MODULES = [
  { order: 1, title: 'Company Overview', description: 'Understand what Carma exists to do, how we are different, what we say yes and no to, and how your role connects to real-world impact.', duration: 30, badge: '🏛️ Carma Foundations', icon: Building2, color: 'bg-green-100 text-green-700' },
  { order: 2, title: 'Product Walkthrough', description: 'Learn how to demo MyCarma, explain every marketing asset, and position Carma as action + evidence + amplification.', duration: 45, badge: '🖥️ Product Expert', icon: Monitor, color: 'bg-blue-100 text-blue-700' },
  { order: 3, title: 'Systems Training', description: 'Learn how to use Google Workspace, Slack, and the Company Resource Platform effectively at Carma.', duration: 40, badge: '⚙️ Systems Pro', icon: Cog, color: 'bg-purple-100 text-purple-700' },
  { order: 4, title: 'Security Training', description: 'Understand your responsibilities under Carma\'s ISMS, information classification, AI security protocols, and incident response.', duration: 25, badge: '🛡️ Security Guardian', icon: ShieldCheck, color: 'bg-red-100 text-red-700' },
  { order: 5, title: 'Carbon | Trees | Kelp', description: 'How Carma benefits the environment and fights climate change. Understand carbon sequestration, trees, kelp, and how to explain Carma\'s impact.', duration: 45, badge: '🌊 Climate Impact Champion', icon: Leaf, color: 'bg-emerald-100 text-emerald-700' },
  { order: 6, title: 'Social Impact | Veterans | Community Value', description: 'How Carma delivers measurable social impact. Understand veteran employment, VSV Certificates, and how to explain Carma\'s social value.', duration: 35, badge: '🤝 Social Impact Champion', icon: Heart, color: 'bg-pink-100 text-pink-700' },
  { order: 7, title: 'Carma Tone of Voice', description: 'How Carma speaks. Learn our voice: Passionate, Optimistic, Personal. Clear, warm, action-oriented. Do\'s, don\'ts and self-test before publishing.', duration: 20, badge: '✍️ Voice Champion', icon: Pen, color: 'bg-amber-100 text-amber-700' },
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

        {/* Start / Continue CTA */}
        <Link href="/dashboard/learning/new-starter" className="block mb-8">
          <Card className="border-green-300 bg-green-50 hover:shadow-lg transition-all group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {newStarterCourse ? (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-semibold text-green-700">
                          {newStarterCourse.progress.completionPercentage === 100
                            ? 'All Complete!'
                            : newStarterCourse.progress.completedModules > 0
                              ? 'Continue where you left off'
                              : 'Ready to begin'}
                        </span>
                        {newStarterCourse.progress.completionPercentage === 100 && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 bg-green-200 rounded-full h-2.5 max-w-md">
                          <div
                            className={`h-2.5 rounded-full transition-all ${newStarterCourse.progress.completionPercentage === 100 ? 'bg-green-600' : 'bg-green-500'}`}
                            style={{ width: `${newStarterCourse.progress.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-green-700 font-medium">
                          {newStarterCourse.progress.completedModules}/{newStarterCourse.progress.totalModules} modules
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-lg font-semibold text-green-800">Start New Starter Training</p>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium group-hover:bg-green-700 transition-colors">
                  {newStarterCourse?.progress.completionPercentage === 100 ? 'Review' : newStarterCourse?.progress.completedModules ? 'Continue' : 'Start'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Training Modules */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">What You&apos;ll Learn</h2>
          <div className="grid gap-3">
            {MODULES.map((mod) => {
              const Icon = mod.icon
              return (
                <Card key={mod.order} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm shrink-0">
                        {mod.order}
                      </div>
                      <div className={`p-2 rounded-lg shrink-0 ${mod.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{mod.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{mod.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {mod.duration} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            Module + Quiz
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="text-gray-500">{mod.badge}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <p className="text-sm text-gray-400 mt-3 text-center">Total duration: {MODULES.reduce((sum, m) => sum + m.duration, 0)} minutes across {MODULES.length} modules</p>
        </section>
      </div>
    </div>
  )
}
