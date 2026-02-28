import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  CalendarDays,
  Receipt,
  ShieldCheck,
  Target,
  Star,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Clock,
  BookOpen,
  Heart,
  Sparkles,
  Shield,
  Trophy,
} from 'lucide-react'
import Link from 'next/link'
import {
  PEOPLE_MILESTONES,
  PEOPLE_POLICIES,
  PEOPLE_CORE_VALUES,
  PEOPLE_ROLES_AND_RESPONSIBILITIES,
  PEOPLE_PERFORMANCE_FRAMEWORK,
} from '@/lib/copy'

const MILESTONE_STYLES: Record<string, { color: string; dotColor: string }> = {
  'First 30 Days': { color: 'border-green-500 bg-green-50', dotColor: 'bg-green-500' },
  'First 60 Days': { color: 'border-blue-500 bg-blue-50', dotColor: 'bg-blue-500' },
  'First 90 Days': { color: 'border-purple-500 bg-purple-50', dotColor: 'bg-purple-500' },
}
const POLICY_ICONS: Record<string, typeof CalendarDays> = {
  'Leave Request Form': CalendarDays,
  'Expenses Policy': Receipt,
  'Code of Conduct': ShieldCheck,
  'Security Policy': ShieldCheck,
  'AI Policy': ShieldCheck,
  'Data Handling Policy': ShieldCheck,
  'Access Control Policy': ShieldCheck,
  'Team Bonus Policy': Trophy,
}
const CADENCE_COLORS: Record<string, { bg: string; text: string }> = {
  green: { bg: 'bg-green-50', text: 'text-green-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
}
const POLICY_COLORS: Record<string, string> = {
  'Leave Request Form': 'text-blue-600 bg-blue-50',
  'Expenses Policy': 'text-emerald-600 bg-emerald-50',
  'Code of Conduct': 'text-amber-600 bg-amber-50',
  'Security Policy': 'text-red-600 bg-red-50',
  'AI Policy': 'text-violet-600 bg-violet-50',
  'Data Handling Policy': 'text-cyan-600 bg-cyan-50',
  'Access Control Policy': 'text-orange-600 bg-orange-50',
  'Team Bonus Policy': 'text-violet-600 bg-violet-50',
}

export default function PeoplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">People</h1>
          </div>
          <p className="text-gray-500 mt-1 ml-[52px]">
            Everything you need to know about working at Carma
          </p>
        </div>

        {/* Core Values */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-green-600" />
            Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PEOPLE_CORE_VALUES.map((value, i) => {
              const Icon = [Shield, Heart, Sparkles][i]
              return (
                <Card key={value} className="border-t-4 border-t-green-500">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-green-700" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{value}</h3>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Joiners Guide */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            Joiners Guide
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-200 hidden md:block" />

            <div className="space-y-6">
              {PEOPLE_MILESTONES.map((milestone, index) => {
                const styles = MILESTONE_STYLES[milestone.phase]
                return (
                <div key={milestone.phase} className="relative flex gap-6">
                  {/* Timeline dot */}
                  <div className="hidden md:flex flex-col items-center pt-6">
                    <div className={`w-10 h-10 rounded-full ${styles.dotColor} flex items-center justify-center z-10 shadow-sm`}>
                      <span className="text-white font-bold text-sm">{(index + 1) * 30}</span>
                    </div>
                  </div>

                  {/* Content card */}
                  <Card className={`flex-1 border-l-4 ${styles.color}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400 md:hidden" />
                        <CardTitle className="text-lg">{milestone.phase}</CardTitle>
                        <span className="text-sm text-gray-500 font-normal">— {milestone.subtitle}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {milestone.items.map((item) => (
                          <li key={item.text} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <Link href={item.href} className="text-green-700 hover:text-green-800 hover:underline">
                              {item.text}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )})}
            </div>
          </div>
        </section>

        {/* Policies */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Policies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PEOPLE_POLICIES.map((policy) => {
              const Icon = POLICY_ICONS[policy.title]
              return (
                <a key={policy.title} href={policy.href} target="_blank" rel="noopener noreferrer">
                  <Card className="hover:shadow-md transition-shadow h-full group cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${POLICY_COLORS[policy.title]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base group-hover:text-green-600 transition-colors flex items-center gap-1">
                          {policy.title}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{policy.description}</p>
                    </CardContent>
                  </Card>
                </a>
              )
            })}
          </div>
        </section>

        {/* Roles & Responsibilities */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            Roles &amp; Responsibilities
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-600 leading-relaxed">
                {PEOPLE_ROLES_AND_RESPONSIBILITIES.intro}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {PEOPLE_ROLES_AND_RESPONSIBILITIES.principles.map((p) => (
                  <div key={p.title} className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                    <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900">{p.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Performance Framework */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-green-600" />
            Performance Framework
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-600 leading-relaxed">
                {PEOPLE_PERFORMANCE_FRAMEWORK.intro}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {PEOPLE_PERFORMANCE_FRAMEWORK.cadences.map((c) => {
                  const colors = CADENCE_COLORS[c.frequencyColor]
                  return (
                  <div key={c.frequency} className="border rounded-lg p-5 text-center">
                    <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-3`}>
                      <span className={`text-lg font-bold ${colors.text}`}>{c.frequency}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900">{c.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{c.description}</p>
                  </div>
                  )
                })}
              </div>

              <p className="text-sm text-gray-500 pt-2">
                {PEOPLE_PERFORMANCE_FRAMEWORK.ratingsNote}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
