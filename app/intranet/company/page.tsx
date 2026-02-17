'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import {
  Heart,
  Lightbulb,
  Shield,
  Users,
  Building,
  MessageSquare,
  Scale,
  Megaphone,
  Globe,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { trpc } from '@/lib/trpc'
import {
  COMPANY_VALUES,
  COMPANY_HOW_WE_WORK,
  COMPANY_VISION,
  COMPANY_WHAT_MEANS_IN_PRACTICE,
  COMPANY_DECISION_STRUCTURE,
} from '@/lib/copy'

const VALUE_ICONS: Record<string, typeof Shield> = {
  Trust: Shield,
  Impact: Globe,
  Innovation: Lightbulb,
  'People First': Heart,
}
const VALUE_COLORS: Record<string, string> = {
  Trust: 'text-blue-600 bg-blue-50',
  Impact: 'text-green-600 bg-green-50',
  Innovation: 'text-amber-600 bg-amber-50',
  'People First': 'text-rose-600 bg-rose-50',
}
const HOW_WE_WORK_ICONS: Record<string, typeof Users> = {
  Meetings: Users,
  Decisions: Scale,
  Communication: Megaphone,
}
const HOW_WE_WORK_COLORS: Record<string, string> = {
  Meetings: 'text-purple-600 bg-purple-50',
  Decisions: 'text-indigo-600 bg-indigo-50',
  Communication: 'text-teal-600 bg-teal-50',
}

export default function CompanyPage() {
  const { data: departments, isLoading: loadingDepts, error: deptsError } = trpc.rbac.getOrgChart.useQuery()

  // Separate Board, C-Suite, and remaining departments
  const board = departments?.find((d) => d.slug === 'board')
  const csuite = departments?.find((d) => d.slug === 'c-suite')
  const otherDepts = departments
    ?.filter((d) => d.slug !== 'board' && d.slug !== 'c-suite')
    .sort((a, b) => a.order - b.order) ?? []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Vision & Strategy */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Company</h1>
          </div>
          <Card className="mt-6 border-green-200 bg-gradient-to-br from-green-50/50 to-white">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-green-700 mb-3">
                {COMPANY_VISION.headline}
              </h2>
              {COMPANY_VISION.paragraphs.map((p) => (
                <p key={p.slice(0, 30)} className="text-gray-600 leading-relaxed max-w-3xl mt-3 first:mt-0">
                  {p}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* What This Means In Practice */}
          <div className="mt-6 p-6 rounded-xl border-2 border-green-200 bg-green-50/30">
            <h3 className="text-lg font-bold text-gray-900 mb-3">What This Means In Practice</h3>
            <ul className="space-y-2 text-gray-700">
              {COMPANY_WHAT_MEANS_IN_PRACTICE.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Values & Principles */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-green-600" />
            Values &amp; Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMPANY_VALUES.map((value) => {
              const Icon = VALUE_ICONS[value.title]
              return (
                <Card key={value.title} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${VALUE_COLORS[value.title]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-700 mb-1">This means in practice:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {value.inPractice.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-1">
                            <span className="text-green-500">•</span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Organisation Chart */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-green-600" />
            Organisation Chart
          </h2>

          {loadingDepts && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {deptsError && (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6 text-center py-12">
                <p className="text-red-600 text-sm">Failed to load organisation chart. Please refresh the page.</p>
              </CardContent>
            </Card>
          )}

          {departments && departments.length > 0 && (
            <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 overflow-x-auto">
              <div className="flex flex-col items-center gap-4 min-w-[600px]">
                {/* Board */}
                {board && (
                  <>
                    <Link href={`/intranet/teams/${board.slug}`} className="block w-full max-w-3xl">
                      <div className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-6 py-3 text-center transition-colors cursor-pointer shadow-lg">
                        <h3 className="font-bold text-sm sm:text-base tracking-wide mb-1">
                          {board.name.toUpperCase()}
                        </h3>
                        <p className="text-xs text-purple-200">
                          {board.users.map((u) => u.name?.split(' ')[0]).filter(Boolean).join(' | ') || 'No members'}
                        </p>
                      </div>
                    </Link>
                    <div className="w-px h-6 bg-gray-600" />
                  </>
                )}

                {/* C-Suite */}
                {csuite && (
                  <>
                    <Link href={`/intranet/teams/${csuite.slug}`} className="block w-full max-w-3xl">
                      <div className="bg-green-500 hover:bg-green-400 text-white rounded-lg px-6 py-4 text-center transition-colors cursor-pointer shadow-lg">
                        <h3 className="font-bold text-base sm:text-lg mb-1">
                          {csuite.name}
                        </h3>
                        <p className="text-xs text-green-100">
                          {csuite.users.map((u) => {
                            const name = u.name || ''
                            const title = u.jobTitle ? ` ${u.jobTitle}` : ''
                            return `${name}${title}`
                          }).filter(Boolean).join('  |  ') || 'No members'}
                        </p>
                      </div>
                    </Link>

                    {/* Connector from C-Suite down */}
                    <div className="flex flex-col items-center w-full max-w-3xl">
                      <div className="w-px h-4 bg-gray-600" />
                      <div className="w-full h-px bg-gray-600" />
                    </div>
                  </>
                )}

                {/* Departments - flat row of blocks */}
                {otherDepts.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-3 w-full">
                    {otherDepts.map((dept) => (
                      <Link
                        key={dept.id}
                        href={`/intranet/teams/${dept.slug}`}
                        className="block"
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-px h-3 bg-gray-600" />
                          <div className="bg-green-500 hover:bg-green-400 text-white rounded-lg px-4 py-3 text-center transition-colors cursor-pointer shadow-md min-w-[130px] max-w-[180px]">
                            <h4 className="font-bold text-xs sm:text-sm mb-1">{dept.name}</h4>
                            {dept.users.length > 0 ? (
                              <div className="space-y-0.5">
                                {dept.users.map((u) => (
                                  <p key={u.id} className="text-[10px] text-green-100 leading-tight">
                                    {u.name || 'Unnamed'}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-green-200">No members</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Decision Structure Summary */}
          <div className="mt-6 p-6 rounded-xl border border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Decision Structure Summary</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Board</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-0.5">
                  {COMPANY_DECISION_STRUCTURE.board.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">C-Suite</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-0.5">
                  {COMPANY_DECISION_STRUCTURE.cSuite.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Department Leads</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-0.5">
                  {COMPANY_DECISION_STRUCTURE.departmentLeads.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            How We Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COMPANY_HOW_WE_WORK.map((item) => {
              const Icon = HOW_WE_WORK_ICONS[item.title]
              return (
                <Card key={item.title} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${HOW_WE_WORK_COLORS[item.title]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
