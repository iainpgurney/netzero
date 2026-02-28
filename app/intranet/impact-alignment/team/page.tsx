'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import {
  ArrowLeft,
  Compass,
  Lightbulb,
  Users as UsersIcon,
  Loader2,
} from 'lucide-react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const MEMBER_COLORS = [
  '#16a34a', '#2563eb', '#9333ea', '#ea580c', '#0891b2',
  '#dc2626', '#ca8a04', '#4f46e5', '#059669', '#db2777',
  '#7c3aed', '#0d9488',
]

export default function TeamDashboardPage() {
  const { data: teamProfiles, isLoading: loadingProfiles } =
    trpc.impactAlignment.getTeamProfiles.useQuery()
  const { data: teamAverages, isLoading: loadingAverages } =
    trpc.impactAlignment.getTeamAverages.useQuery()

  const [person1, setPerson1] = useState('')
  const [person2, setPerson2] = useState('')

  const pairComparison = trpc.impactAlignment.getPairComparison.useMutation()

  const handleCompare = () => {
    if (person1 && person2 && person1 !== person2) {
      pairComparison.mutate({ userId1: person1, userId2: person2 })
    }
  }

  const isLoading = loadingProfiles || loadingAverages

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-72 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  if (!teamProfiles || teamProfiles.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No team profiles yet</h2>
          <p className="text-gray-500 mb-4">
            Team members need to complete their Impact Alignment assessment first.
          </p>
          <Link href="/intranet/impact-alignment">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
              Back to Impact Alignment
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  const dimensions = ['Strategist', 'Game Changer', 'Implementer', 'Play Maker', 'Polisher'] as const
  const dimensionKeys = {
    'Strategist': 'strategistScore',
    'Game Changer': 'ideasScore',
    'Implementer': 'executionScore',
    'Play Maker': 'peopleScore',
    'Polisher': 'excellenceScore',
  } as const

  const avgKeys = {
    'Strategist': 'strategist',
    'Game Changer': 'ideas',
    'Implementer': 'execution',
    'Play Maker': 'people',
    'Polisher': 'excellence',
  } as const

  const radarData = dimensions.map((d) => {
    const row: Record<string, string | number> = { dimension: d }
    const key = dimensionKeys[d]
    teamProfiles.forEach((p) => {
      const name = p.user.name || p.user.id
      row[name] = p.assessment[key]
    })
    if (teamAverages) {
      const avgKey = avgKeys[d]
      row['Team Average'] = teamAverages.averages[avgKey]
    }
    return row
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/intranet/impact-alignment">
            <Button variant="ghost" size="sm" className="rounded-lg">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-6 h-6 text-green-600" />
              Team Energy Map
            </h1>
            <p className="text-sm text-gray-500">
              See where your team naturally puts energy — use this to improve collaboration.
            </p>
          </div>
        </div>

        {/* Team Radar Overlay */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Team Overlay</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickCount={6}
                  />
                  {teamProfiles.map((p, i) => (
                    <Radar
                      key={p.user.id}
                      name={p.user.name || 'Unknown'}
                      dataKey={p.user.name || p.user.id}
                      stroke={MEMBER_COLORS[i % MEMBER_COLORS.length]}
                      fill={MEMBER_COLORS[i % MEMBER_COLORS.length]}
                      fillOpacity={0.08}
                      strokeWidth={1.5}
                    />
                  ))}
                  {teamAverages && (
                    <Radar
                      name="Team Average"
                      dataKey="Team Average"
                      stroke="#374151"
                      fill="#374151"
                      fillOpacity={0.05}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                  )}
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scores Table */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Team Scores</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Name</th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">Strat.</th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">Ideas</th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">Exec.</th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">People</th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">Excel.</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {teamProfiles.map((p) => (
                    <tr key={p.user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {p.user.image ? (
                            <img src={p.user.image} alt="" className="w-6 h-6 rounded-full" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-green-700">
                                {(p.user.name || '?')[0]}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{p.user.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-medium">{p.assessment.strategistScore}</td>
                      <td className="py-2.5 px-2 text-center font-medium">{p.assessment.ideasScore}</td>
                      <td className="py-2.5 px-2 text-center font-medium">{p.assessment.executionScore}</td>
                      <td className="py-2.5 px-2 text-center font-medium">{p.assessment.peopleScore}</td>
                      <td className="py-2.5 px-2 text-center font-medium">{p.assessment.excellenceScore}</td>
                      <td className="py-2.5 px-3 text-gray-500">{p.user.jobTitle || '—'}</td>
                    </tr>
                  ))}
                  {teamAverages && (
                    <tr className="bg-gray-50 font-semibold">
                      <td className="py-2.5 px-3 text-gray-700">Team Average</td>
                      <td className="py-2.5 px-2 text-center">{teamAverages.averages.strategist}</td>
                      <td className="py-2.5 px-2 text-center">{teamAverages.averages.ideas}</td>
                      <td className="py-2.5 px-2 text-center">{teamAverages.averages.execution}</td>
                      <td className="py-2.5 px-2 text-center">{teamAverages.averages.people}</td>
                      <td className="py-2.5 px-2 text-center">{teamAverages.averages.excellence}</td>
                      <td className="py-2.5 px-3 text-gray-400 text-xs">
                        {teamAverages.memberCount} members
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Team Awareness Tips */}
        {teamAverages && teamAverages.tips.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-gray-900">Team Awareness</h2>
              </div>
              <div className="space-y-3">
                {teamAverages.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-900">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pair Comparison */}
        {teamProfiles.length >= 2 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-gray-900 mb-1">Pair Comparison</h2>
              <p className="text-sm text-gray-500 mb-4">
                Select two team members to see how their energy orientations complement each other.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <select
                  value={person1}
                  onChange={(e) => setPerson1(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select first person...</option>
                  {teamProfiles.map((p) => (
                    <option key={p.user.id} value={p.user.id}>
                      {p.user.name || 'Unknown'}
                    </option>
                  ))}
                </select>
                <select
                  value={person2}
                  onChange={(e) => setPerson2(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select second person...</option>
                  {teamProfiles
                    .filter((p) => p.user.id !== person1)
                    .map((p) => (
                      <option key={p.user.id} value={p.user.id}>
                        {p.user.name || 'Unknown'}
                      </option>
                    ))}
                </select>
                <Button
                  onClick={handleCompare}
                  disabled={!person1 || !person2 || person1 === person2 || pairComparison.isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                >
                  {pairComparison.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Compare'
                  )}
                </Button>
              </div>

              {pairComparison.data && (
                <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <h3 className="text-sm font-semibold text-green-700 mb-2">
                      Complementary Strengths
                    </h3>
                    <ul className="space-y-1.5">
                      {pairComparison.data.complementaryAreas.map((area, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-700 mb-2">
                      Where Friction May Arise
                    </h3>
                    <ul className="space-y-1.5">
                      {pairComparison.data.potentialFriction.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-700 mb-1">
                      Suggested Working Agreement
                    </h3>
                    <p className="text-sm text-blue-900">
                      {pairComparison.data.workingAgreement}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
