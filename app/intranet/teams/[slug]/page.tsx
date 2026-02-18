'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Columns3,
  GraduationCap,
  Loader2,
  Users,
  Mail,
  Pencil,
  Save,
  Send,
} from 'lucide-react'
import { ROLE_LABELS } from '@/lib/rbac'
import type { SystemRole } from '@/lib/rbac'
import { useSession } from 'next-auth/react'

export default function TeamDetailPage() {
  const params = useParams()
  const slug = (params?.slug as string) || ''
  const { data: session } = useSession()

  const userRole = session?.user?.role || 'MEMBER'
  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  const { data: departments, isLoading: loadingDepts, refetch: refetchDepts } =
    trpc.rbac.getDepartments.useQuery()

  const department = departments?.find((d) => d.slug === slug)

  const { data: deptDetail, isLoading: loadingDetail } =
    trpc.rbac.getDepartmentWithUsers.useQuery(
      { departmentId: department?.id ?? '' },
      { enabled: !!department?.id }
    )

  const updateMission = trpc.rbac.updateMission.useMutation({
    onSuccess: () => {
      refetchDepts()
      setEditingMission(false)
    },
  })

  const isLoading = loadingDepts || (!!department && loadingDetail)

  const [editingMission, setEditingMission] = useState(false)
  const [missionDraft, setMissionDraft] = useState('')

  const defaultMission = `The ${department?.name || ''} team plays a key role in delivering Carma's mission — to equip businesses with credible sustainability solutions that drive real change and competitive advantage. We focus on real-world impact, trusted evidence, and long-term integrity.`

  const currentMission = (department as any)?.mission || defaultMission

  const startEditingMission = () => {
    setMissionDraft(currentMission)
    setEditingMission(true)
  }

  const saveMission = () => {
    if (!department) return
    updateMission.mutate({
      departmentId: department.id,
      mission: missionDraft.trim(),
    })
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Back link */}
        <Link
          href="/intranet/teams"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Teams
        </Link>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {/* Not found */}
        {!isLoading && !department && (
          <div className="text-center py-20 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3" />
            <p>Department not found.</p>
          </div>
        )}

        {department && (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
              <span className="text-5xl">{department.icon}</span>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {department.name}
                </h1>
                <p className="mt-1 text-gray-500">{department.description}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/intranet/boards/${slug}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Columns3 className="w-4 h-4" />
                    Kanban Board
                  </Button>
                </Link>
                <Link href="/intranet/training/department">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    Training
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mission */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Team Mission</CardTitle>
                  {isSuperAdmin && !editingMission && (
                    <button
                      onClick={startEditingMission}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {editingMission && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingMission(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={saveMission}
                        disabled={updateMission.isLoading}
                      >
                        <Save className="w-3.5 h-3.5 mr-1" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingMission ? (
                  <textarea
                    value={missionDraft}
                    onChange={(e) => setMissionDraft(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 leading-relaxed focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed">
                    {currentMission}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  {deptDetail?.users?.length ?? department._count.users} members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDetail && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                )}
                {deptDetail?.users && deptDetail.users.length > 0 && (
                  <div className="divide-y divide-gray-100">
                    {deptDetail.users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        {/* Avatar */}
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name ?? ''}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-sm">
                            {(user.name ?? 'U').charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name ?? 'Unnamed'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {user.jobTitle && <span>{user.jobTitle}</span>}
                            {user.jobTitle && user.email && (
                              <span className="text-gray-300">|</span>
                            )}
                            {user.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Role badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          {ROLE_LABELS[user.role as SystemRole] ?? user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {deptDetail?.users && deptDetail.users.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">
                    No members in this department yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* How To Submit Requests — Development, Marketing, Sales, Customer Services */}
            {['development', 'customer-support', 'product', 'rev-ops'].includes(slug) && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Send className="w-5 h-5 text-green-600" />
                    How To Submit Requests
                  </CardTitle>
                  <CardDescription>
                    One clear entry point for development, marketing and account-related requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">
                    For any development, marketing or account-related request, email:
                  </p>
                  <a
                    href="mailto:customer.services@carma.earth"
                    className="inline-flex items-center gap-2 text-lg font-semibold text-green-700 hover:text-green-800 hover:underline"
                  >
                    <Mail className="w-5 h-5" />
                    customer.services@carma.earth
                  </a>
                  <div className="pt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Please include:</p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Clear subject line</li>
                      <li>Brief summary of the request</li>
                      <li>Desired outcome</li>
                      <li>Deadline (if applicable)</li>
                      <li>Any supporting documents or links</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500 pt-2">
                    All requests will be triaged and routed internally.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
