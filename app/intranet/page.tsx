'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  Target,
  TrendingDown,
  Users,
  ThumbsUp,
  PoundSterling,
  Zap,
  CalendarDays,
  FolderKanban,
  Columns3,
  BookOpen,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Smile,
  Award,
  Trophy,
  Info,
} from 'lucide-react'
import { trpc } from '@/lib/trpc'

const QUICK_LINKS = [
  { href: 'https://docs.google.com/forms/d/1zxLKuKH6ngEIiBEWl-8JPRBbXHLCoa0DcbjodCNy1i4/edit', label: 'Leave', description: 'Book and manage leave', icon: CalendarDays, color: 'text-blue-600 bg-blue-50', external: true },
  { href: '/intranet/boards', label: 'Kanban Boards', description: 'Team boards and workflows', icon: Columns3, color: 'text-purple-600 bg-purple-50' },
  { href: 'https://carma-earth.releasedhub.com/carma-roadmap/roadmap/f106484c', label: 'Roadmap', description: 'View product roadmap', icon: FolderKanban, color: 'text-amber-600 bg-amber-50', external: true },
  { href: '/intranet/people', label: 'Joiners Guide', description: 'Onboarding and policies', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
  { href: '/intranet/training', label: 'Training', description: 'Courses and certifications', icon: GraduationCap, color: 'text-rose-600 bg-rose-50' },
]

const METRIC_ICONS: Record<string, typeof Users> = {
  'Revenue Target': PoundSterling,
  'Active Customers': Users,
  'Churn Target': TrendingDown,
  'CSAT': ThumbsUp,
}

export default function IntranetHomePage() {
  const { data: session } = useSession()
  const { data: keyMetrics = [] } = trpc.rag.getKeyMetrics.useQuery()
  const { data: priorities = [] } = trpc.rag.getPriorities.useQuery()
  const { data: badges = [] } = trpc.learning.getUserBadges.useQuery()
  const { data: certificates = [] } = trpc.learning.getUserCertificates.useQuery()

  const userName = session?.user?.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Welcome Header */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
            <Smile className="h-10 w-10 text-green-600" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userName}
            </h1>
            <p className="mt-1 text-lg text-gray-500">
              Carma LLAMA – Internal Operations System
            </p>
          </div>
        </div>

        {/* Company Targets — Revenue, Customers, Churn */}
        {keyMetrics.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2 flex-wrap">
              <Target className="w-5 h-5 text-green-600" />
              Company Targets
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                title="Targets for the current financial year (April–March)"
              >
                FY {(() => {
                  const now = new Date()
                  const year = now.getFullYear()
                  const month = now.getMonth() + 1
                  const fyStart = month >= 4 ? year : year - 1
                  const fyEnd = String((fyStart + 1) % 100).padStart(2, '0')
                  return `${fyStart}/${fyEnd}`
                })()}
              </span>
              <span
                className="text-gray-400 cursor-help"
                title="These are company-wide targets approved by the Board."
              >
                <Info className="w-4 h-4" />
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {keyMetrics.map((metric) => {
                  const Icon = METRIC_ICONS[metric.label] || Target
                  const isChurn = metric.label === 'Churn Target'
                  const churnVal = parseFloat((metric.value || '0').replace(/[^0-9.]/g, '')) || 0
                  const churnTarget = parseFloat((metric.targetValue || '5').replace(/[^0-9.]/g, '')) || 5
                  const churnOverTarget = isChurn && churnVal > churnTarget
                  const tooltip = isChurn
                    ? `Target: ${metric.targetValue || '5%'}. Red when above target.`
                    : `Current value vs target. ${metric.targetValue ? `Target: ${metric.targetValue}` : ''}`
                  return (
                    <Card key={metric.id} className={churnOverTarget ? 'border-red-200' : ''}>
                      <CardContent className="pt-6" title={tooltip}>
                        <div className="flex items-center justify-between mb-1">
                          <Icon className="w-5 h-5 text-gray-400" />
                          <Info className="w-4 h-4 text-gray-300" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          {metric.value || '—'}
                          {metric.targetValue && (
                            <span className="text-base font-normal text-gray-500"> / {metric.targetValue}</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{metric.label}</p>
                        {metric.trend && (
                          <p className="text-xs text-gray-600 mt-1">Trend: {metric.trend}</p>
                        )}
                        {churnOverTarget && (
                          <p className="text-xs text-red-600 font-medium mt-1">Above target</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </section>
        )}

        {/* Priorities */}
        {priorities.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Quarter Priorities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {priorities.map((priority) => (
                <Card key={priority.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">{priority.label}</CardTitle>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                      {priority.owner && <span>Owner: {priority.owner}</span>}
                      {priority.dueDate && (
                        <span>Due: {new Date(priority.dueDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                      {priority.status && <span className="font-medium">{priority.status}</span>}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Quick Links */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon
              const cardContent = (
                <Card className="hover:shadow-md transition-shadow h-full group cursor-pointer">
                  <CardContent className="pt-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${link.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 group-hover:text-green-600 transition-colors flex items-center gap-1">
                      {link.label}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                  </CardContent>
                </Card>
              )
              return link.external ? (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                  {cardContent}
                </a>
              ) : (
                <Link key={link.label} href={link.href}>
                  {cardContent}
                </Link>
              )
            })}
          </div>
        </section>

        {/* Badges & Certificates */}
        {(badges.length > 0 || certificates.length > 0) && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-green-600" />
              Your Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Badges */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Badges Earned
                    <span className="ml-auto text-sm font-normal text-gray-400">{badges.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {badges.length > 0 ? (
                    <div className="space-y-2">
                      {badges
                        .filter((b) => b.module)
                        .slice(0, 5)
                        .map((badge) => (
                          <div key={badge.id} className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 border border-yellow-100">
                            <span className="text-2xl flex-shrink-0">{badge.module?.badgeEmoji || '🏆'}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{badge.module?.badgeName || 'Badge'}</p>
                              <p className="text-xs text-gray-500 truncate">{badge.module?.course?.title || 'Course'}</p>
                            </div>
                          </div>
                        ))}
                      {badges.length > 5 && (
                        <Link href="/dashboard/profile" className="block text-center text-sm text-green-600 hover:text-green-700 font-medium pt-1">
                          View all {badges.length} badges →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Complete modules to earn badges!</p>
                  )}
                </CardContent>
              </Card>

              {/* Certificates */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    Certificates
                    <span className="ml-auto text-sm font-normal text-gray-400">{certificates.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {certificates.length > 0 ? (
                    <div className="space-y-2">
                      {certificates
                        .filter((c) => c.course)
                        .slice(0, 5)
                        .map((cert) => (
                          <Link
                            key={cert.id}
                            href={`/dashboard/learning/${cert.course?.slug || 'netzero'}/certificate`}
                            className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-100 hover:bg-green-100 transition-colors"
                          >
                            <div className="bg-green-100 rounded-full p-1.5 flex-shrink-0">
                              <Award className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{cert.course?.title || 'Course'}</p>
                              <p className="text-xs text-gray-500">
                                Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </Link>
                        ))}
                      {certificates.length > 5 && (
                        <Link href="/dashboard/profile" className="block text-center text-sm text-green-600 hover:text-green-700 font-medium pt-1">
                          View all {certificates.length} certificates →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Complete courses to earn certificates!</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
