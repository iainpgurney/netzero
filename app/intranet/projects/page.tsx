'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Archive,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FolderKanban,
  Loader2,
  Plus,
  X,
} from 'lucide-react'
import { hasMinimumRole } from '@/lib/rbac'
import type { SystemRole } from '@/lib/rbac'

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  'on-hold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
}

export default function ProjectsPage() {
  const { data: session } = useSession()
  const utils = trpc.useUtils()

  const userRole = (session?.user?.role ?? 'MEMBER') as SystemRole
  const canManage = hasMinimumRole(userRole, 'MANAGER')

  const { data: projects, isLoading } = trpc.projects.getAll.useQuery()
  const { data: archivedProjects, isLoading: loadingArchived } =
    trpc.projects.getArchived.useQuery()

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate()
      setShowForm(false)
      resetForm()
    },
  })

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.getAll.invalidate()
      utils.projects.getArchived.invalidate()
    },
  })

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formObjective, setFormObjective] = useState('')
  const [formStatus, setFormStatus] = useState<'active' | 'on-hold' | 'completed'>('active')
  const [formTimeline, setFormTimeline] = useState('')
  const [formLink, setFormLink] = useState('')

  // Archive section
  const [archiveOpen, setArchiveOpen] = useState(false)

  function resetForm() {
    setFormName('')
    setFormObjective('')
    setFormStatus('active')
    setFormTimeline('')
    setFormLink('')
  }

  function handleCreate() {
    if (!formName.trim()) return
    createMutation.mutate({
      name: formName.trim(),
      objective: formObjective.trim() || undefined,
      status: formStatus,
      timeline: formTimeline.trim() || undefined,
      link: formLink.trim() || undefined,
    })
  }

  function handleArchive(id: string) {
    updateMutation.mutate({ id, isArchived: true })
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-2 text-gray-500">
              Track active initiatives and company-wide projects.
            </p>
          </div>
          {canManage && !showForm && (
            <Button
              onClick={() => setShowForm(true)}
              size="sm"
              className="gap-1.5 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          )}
        </div>

        {/* Inline create form */}
        {showForm && (
          <Card className="mb-6 border-green-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">New Project</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Project name *"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
                <input
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Objective"
                  value={formObjective}
                  onChange={(e) => setFormObjective(e.target.value)}
                />
                <select
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as 'active' | 'on-hold' | 'completed')
                  }
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
                <input
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Timeline (e.g. Q1 2026)"
                  value={formTimeline}
                  onChange={(e) => setFormTimeline(e.target.value)}
                />
                <input
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:col-span-2"
                  placeholder="External link (optional)"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  size="sm"
                  className="gap-1.5 bg-green-600 hover:bg-green-700"
                  onClick={handleCreate}
                  disabled={!formName.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {/* Active Projects Table */}
        {projects && projects.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-green-600" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="text-left font-medium text-gray-500 px-4 py-3">
                        Name
                      </th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3">
                        Owner
                      </th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3 hidden md:table-cell">
                        Objective
                      </th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3">
                        Status
                      </th>
                      <th className="text-left font-medium text-gray-500 px-4 py-3 hidden lg:table-cell">
                        Timeline
                      </th>
                      <th className="text-right font-medium text-gray-500 px-4 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {project.name}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {project.owner?.image ? (
                              <img
                                src={project.owner.image}
                                alt=""
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                                {(project.owner?.name ?? '?').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-gray-600 truncate max-w-[120px]">
                              {project.owner?.name ?? 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[200px] truncate">
                          {project.objective ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_BADGE[project.status] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                          {project.timeline ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {project.link && (
                              <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                title="Open external link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            {canManage && (
                              <button
                                onClick={() => handleArchive(project.id)}
                                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                title="Archive project"
                                disabled={updateMutation.isPending}
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {projects && projects.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-400 mb-8">
            <FolderKanban className="w-10 h-10 mx-auto mb-3" />
            <p>No active projects yet.</p>
          </div>
        )}

        {/* Archived Projects (Collapsible) */}
        {archivedProjects && archivedProjects.length > 0 && (
          <Card>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setArchiveOpen(!archiveOpen)}
            >
              <CardTitle className="text-lg flex items-center gap-2 text-gray-500">
                {archiveOpen ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <Archive className="w-5 h-5" />
                Completed Archive
                <span className="text-sm font-normal text-gray-400">
                  ({archivedProjects.length})
                </span>
              </CardTitle>
            </CardHeader>
            {archiveOpen && (
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50/50">
                        <th className="text-left font-medium text-gray-500 px-4 py-3">
                          Name
                        </th>
                        <th className="text-left font-medium text-gray-500 px-4 py-3">
                          Owner
                        </th>
                        <th className="text-left font-medium text-gray-500 px-4 py-3 hidden md:table-cell">
                          Objective
                        </th>
                        <th className="text-left font-medium text-gray-500 px-4 py-3">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {archivedProjects.map((project) => (
                        <tr key={project.id} className="text-gray-400">
                          <td className="px-4 py-3 font-medium">
                            {project.name}
                          </td>
                          <td className="px-4 py-3">
                            {project.owner?.name ?? 'Unknown'}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell max-w-[200px] truncate">
                            {project.objective ?? '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                              {project.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
