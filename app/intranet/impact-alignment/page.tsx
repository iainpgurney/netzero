'use client'

import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import {
  Compass,
  ArrowRight,
  Users,
  Eye,
  Lightbulb,
  RefreshCw,
  Clock,
  CalendarCheck,
} from 'lucide-react'

export default function ImpactAlignmentPage() {
  const { data: profile, isLoading } = trpc.impactAlignment.getMyProfile.useQuery()
  const { data: reassessInfo } = trpc.impactAlignment.canReassess.useQuery()
  const { data: teamAverages } = trpc.impactAlignment.getTeamAverages.useQuery()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  if (profile) {
    return <ReturningUser profile={profile} reassessInfo={reassessInfo} teamAverages={teamAverages} />
  }

  return <FirstTimeUser />
}

function FirstTimeUser() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-4">
            <Compass className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Understand How You Create Impact
          </h1>
          <p className="text-gray-500 text-lg">
            Discover your energy orientation across 5 dimensions and help your team work better together.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">This is about energy, not personality</h3>
                <p className="text-sm text-gray-600 mt-1">
                  We all have areas where we naturally put more energy. This assessment measures your
                  energy across 5 dimensions: Strategist, Game Changer, Implementer, Play Maker,
                  and Polisher.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Eye className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Profiles are visible to your team</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your profile will be shared with your department. This transparency helps
                  everyone understand how to collaborate more effectively.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Better synergy and collaboration</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Understanding where everyone sits helps teams play to their strengths,
                  support each other in stretch areas, and reduce friction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-amber-800">
            <strong>A note on energy bias:</strong> Low energy in an area doesn't mean you can't do it —
            it means it takes more conscious effort. This is about awareness, not excuses.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>This assessment can only be taken once every 6 months.</strong> Take your time
              and answer honestly — your responses should reflect genuine self-awareness, not how
              you feel today.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/intranet/impact-alignment/assess">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8">
              Start Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-xs text-gray-400 mt-3">30 questions across 5 dimensions — takes about 8-10 minutes</p>
        </div>
      </div>
    </main>
  )
}

function ReturningUser({
  profile,
  reassessInfo,
  teamAverages,
}: {
  profile: any
  reassessInfo: any
  teamAverages: any
}) {
  const lastUpdated = new Date(profile.lastGeneratedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const dimensions = [
    { label: 'Strategist', key: 'strategistScore', score: profile.assessment.strategistScore, color: 'bg-cyan-100 text-cyan-700' },
    { label: 'Game Changer', key: 'ideasScore', score: profile.assessment.ideasScore, color: 'bg-blue-100 text-blue-700' },
    { label: 'Implementer', key: 'executionScore', score: profile.assessment.executionScore, color: 'bg-orange-100 text-orange-700' },
    { label: 'Play Maker', key: 'peopleScore', score: profile.assessment.peopleScore, color: 'bg-purple-100 text-purple-700' },
    { label: 'Polisher', key: 'excellenceScore', score: profile.assessment.excellenceScore, color: 'bg-emerald-100 text-emerald-700' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-6 h-6 text-green-600" />
              Impact Alignment
            </h1>
            <p className="text-sm text-gray-500 mt-1">Last updated {lastUpdated}</p>
          </div>
          <div className="flex gap-2">
            {reassessInfo?.canReassess && (
              <Link href="/intranet/impact-alignment/assess">
                <Button variant="outline" className="rounded-xl">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reassess
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Your Energy Profile</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {(profile.narrativeJson as { energyMapSummary?: string })?.energyMapSummary ??
                profile.headlineSummary}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
              {dimensions.map((dim) => (
                <div key={dim.label} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${dim.color} text-lg font-bold mb-1`}>
                    {dim.score}
                  </div>
                  <p className="text-xs font-medium text-gray-500">{dim.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {teamAverages && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-gray-900 mb-3">How You Compare to Your Team</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Strategist', yours: profile.assessment.strategistScore, team: teamAverages.averages.strategist },
                  { label: 'Game Changer', yours: profile.assessment.ideasScore, team: teamAverages.averages.ideas },
                  { label: 'Implementer', yours: profile.assessment.executionScore, team: teamAverages.averages.execution },
                  { label: 'Play Maker', yours: profile.assessment.peopleScore, team: teamAverages.averages.people },
                  { label: 'Polisher', yours: profile.assessment.excellenceScore, team: teamAverages.averages.excellence },
                ].map((dim) => {
                  const diff = dim.yours - dim.team
                  return (
                    <div key={dim.label} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 mb-1">{dim.label}</p>
                      <p className="text-lg font-bold text-gray-900">{dim.yours}</p>
                      <p className={`text-xs ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)} vs team
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reassessment Status */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {reassessInfo?.canReassess ? (
                <>
                  <CalendarCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">You are eligible to reassess</p>
                    <p className="text-xs text-gray-500">Take the assessment again when you feel your energy orientation has shifted.</p>
                  </div>
                  <Link href="/intranet/impact-alignment/assess">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
                      Reassess
                    </Button>
                  </Link>
                </>
              ) : reassessInfo?.nextDate ? (
                <>
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Next reassessment available</p>
                    <p className="text-xs text-gray-500">
                      {new Date(reassessInfo.nextDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Link href="/intranet/impact-alignment/profile">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
              View Full Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/intranet/impact-alignment/team">
            <Button variant="outline" className="rounded-xl">
              <Users className="w-4 h-4 mr-1" />
              View Team
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
