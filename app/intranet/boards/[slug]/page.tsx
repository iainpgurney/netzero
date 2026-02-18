'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Plus,
  ArrowLeft,
  Trash2,
  ArrowRight,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CircleDot,
  X,
  User,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSession } from 'next-auth/react'

const COLUMNS = [
  { id: 'todo', label: 'To Do', icon: CircleDot, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { id: 'doing', label: 'Doing', icon: Clock, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'blocked', label: 'Blocked', icon: AlertTriangle, color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'done', label: 'Done', icon: CheckCircle2, color: 'bg-green-50 text-green-700 border-green-200' },
] as const

type Status = 'todo' | 'doing' | 'blocked' | 'done'

const STATUS_TRANSITIONS: Record<Status, Status[]> = {
  todo: ['doing'],
  doing: ['blocked', 'done'],
  blocked: ['doing'],
  done: ['todo'],
}

export default function KanbanBoardPage() {
  const params = useParams()
  const slug = (params?.slug as string) || ''
  const { data: session } = useSession()
  const [showNewCard, setShowNewCard] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newAssigneeId, setNewAssigneeId] = useState<string>('')
  const [selectedCard, setSelectedCard] = useState<{
    id: string
    title: string
    description: string | null
    status: string
    assigneeId: string | null
    assignee: { id: string; name: string | null; image: string | null; email: string | null } | null
  } | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<Status>('todo')
  const [editAssigneeId, setEditAssigneeId] = useState<string>('')

  const userId = session?.user?.id ?? null
  const userRole = session?.user?.role || 'MEMBER'
  const userDeptSlug = session?.user?.departmentSlug ?? null
  const isSuperAdmin = userRole === 'SUPER_ADMIN'
  const isOwnDept = slug === userDeptSlug
  const canAddCard = isSuperAdmin || isOwnDept
  const isCardOwner = (card: { assigneeId: string | null }) =>
    card.assigneeId === userId || isSuperAdmin || (!card.assigneeId && isOwnDept)

  const { data: departments } = trpc.rbac.getDepartments.useQuery()
  const department = departments?.find((d) => d.slug === slug)

  const {
    data: cards,
    isLoading,
    refetch,
  } = trpc.kanban.getCards.useQuery(
    { departmentSlug: slug },
    { enabled: !!slug }
  )
  const { data: boardUsers } = trpc.kanban.getUsersForBoard.useQuery(
    { departmentSlug: slug },
    { enabled: !!slug && (canAddCard || (!!selectedCard && isCardOwner(selectedCard))) }
  )

  const createCard = trpc.kanban.createCard.useMutation({
    onSuccess: () => {
      refetch()
      setNewTitle('')
      setNewDescription('')
      setNewAssigneeId('')
      setShowNewCard(false)
    },
  })

  const updateCard = trpc.kanban.updateCard.useMutation({
    onSuccess: () => refetch(),
  })

  const moveCard = trpc.kanban.moveCard.useMutation({
    onSuccess: () => refetch(),
  })

  const deleteCard = trpc.kanban.deleteCard.useMutation({
    onSuccess: () => refetch(),
  })

  const handleCreateCard = () => {
    if (!newTitle.trim()) return
    createCard.mutate({
      departmentSlug: slug,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      assigneeId: newAssigneeId || undefined,
    })
  }

  const openCardModal = (card: NonNullable<typeof cards>[number]) => {
    setSelectedCard(card)
    setEditTitle(card.title)
    setEditDescription(card.description ?? '')
    setEditStatus(card.status as Status)
    setEditAssigneeId(card.assigneeId ?? '')
  }

  const handleSaveCard = () => {
    if (!selectedCard) return
    updateCard.mutate(
      {
        cardId: selectedCard.id,
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        assigneeId: editAssigneeId || null,
        status: editStatus,
      },
      { onSuccess: () => setSelectedCard(null) }
    )
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  const cardsByStatus = COLUMNS.map((col) => ({
    ...col,
    cards: (cards || []).filter((c) => c.status === col.id),
  }))

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/intranet/boards">
              <Button variant="ghost" size="sm" className="rounded-lg">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Boards
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">{department?.icon}</span>
                {department?.name || slug} Board
              </h1>
              <p className="text-sm text-gray-500">
                {canAddCard
                  ? 'Done cards are automatically removed after 30 days. Only the task owner can edit.'
                  : 'Click a card to view details. Only the task owner can edit.'}
              </p>
            </div>
          </div>
          {canAddCard && (
            <Button
              onClick={() => setShowNewCard(true)}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Card
            </Button>
          )}
        </div>

        {/* New card form */}
        {canAddCard && showNewCard && (
          <Card className="mb-6 border-green-200 bg-green-50/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Card title..."
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCard()}
                  />
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Description (optional)..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  />
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Assignee</label>
                    <select
                      value={newAssigneeId}
                      onChange={(e) => setNewAssigneeId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Unassigned</option>
                      {boardUsers?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={handleCreateCard}
                    disabled={!newTitle.trim() || createCard.isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowNewCard(false)
                      setNewTitle('')
                      setNewDescription('')
                      setNewAssigneeId('')
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kanban columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardsByStatus.map((column) => {
            const Icon = column.icon
            return (
              <div key={column.id} className="flex flex-col">
                {/* Column header */}
                <div
                  className={`flex items-center justify-between px-3 py-2 rounded-t-xl border ${column.color}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold text-sm">{column.label}</span>
                  </div>
                  <span className="text-xs font-medium bg-white/60 px-2 py-0.5 rounded-full">
                    {column.cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 bg-gray-50/50 border border-t-0 border-gray-200 rounded-b-xl p-2 space-y-2 min-h-[200px]">
                  {column.cards.map((card) => (
                    <Card
                      key={card.id}
                      className="shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
                      onClick={() => openCardModal(card)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 leading-tight">
                            {card.title}
                          </h4>
                          {isCardOwner(card) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteCard.mutate({ cardId: card.id })
                              }}
                              className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {card.description && (
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {card.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            {isCardOwner(card) && boardUsers ? (
                              (() => {
                                const assigneeOptions = [...boardUsers]
                                if (card.assignee && !assigneeOptions.find((u) => u.id === card.assignee?.id)) {
                                  assigneeOptions.push({ id: card.assignee.id, name: card.assignee.name, email: card.assignee.email, image: card.assignee.image })
                                }
                                return (
                                  <select
                                    value={card.assigneeId ?? ''}
                                    onChange={(e) => {
                                      const val = e.target.value
                                      updateCard.mutate({
                                        cardId: card.id,
                                        assigneeId: val || null,
                                      })
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 w-full max-w-[140px]"
                                    title="Assign task owner"
                                  >
                                    <option value="">Unassigned</option>
                                    {assigneeOptions.map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.name || u.email}
                                      </option>
                                    ))}
                                  </select>
                                )
                              })()
                            ) : card.assignee ? (
                              <div className="flex items-center gap-1.5" title={card.assignee.name ?? card.assignee.email ?? undefined}>
                                {card.assignee.image ? (
                                  <img
                                    src={card.assignee.image}
                                    alt=""
                                    className="w-5 h-5 rounded-full flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <User className="w-3 h-3 text-gray-500" />
                                  </div>
                                )}
                                <span className="text-xs text-gray-600 truncate">
                                  {card.assignee.name || card.assignee.email}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Unassigned</span>
                            )}
                          </div>

                          {/* Move buttons - only shown if user is owner */}
                          {isCardOwner(card) && (
                            <div className="flex gap-0.5">
                              {STATUS_TRANSITIONS[card.status as Status]?.map((target) => {
                                const targetCol = COLUMNS.find((c) => c.id === target)
                                if (!targetCol) return null
                                return (
                                  <button
                                    key={target}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      moveCard.mutate({
                                        cardId: card.id,
                                        status: target,
                                      })
                                    }}
                                    className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                                    title={`Move to ${targetCol.label}`}
                                  >
                                    {target === 'done' ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    ) : target === 'blocked' ? (
                                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                    ) : (
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {column.cards.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-gray-400">
                      No cards
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Card detail modal */}
        <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Task details</DialogTitle>
            </DialogHeader>
            {selectedCard && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="modal-title">Title</Label>
                  {selectedCard && isCardOwner(selectedCard) ? (
                    <Input
                      id="modal-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 font-medium text-gray-900">{selectedCard.title}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="modal-desc">Description</Label>
                  {selectedCard && isCardOwner(selectedCard) ? (
                    <textarea
                      id="modal-desc"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedCard.description || 'No description'}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Status</Label>
                  {selectedCard && isCardOwner(selectedCard) ? (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as Status)}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {COLUMNS.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-600">
                      {COLUMNS.find((c) => c.id === selectedCard.status)?.label ?? selectedCard.status}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Assignee</Label>
                  {selectedCard && isCardOwner(selectedCard) && boardUsers ? (
                    <select
                      value={editAssigneeId}
                      onChange={(e) => setEditAssigneeId(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Unassigned</option>
                      {[
                        ...boardUsers,
                        ...(selectedCard.assignee && !boardUsers.find((u) => u.id === selectedCard.assignee?.id)
                          ? [{ id: selectedCard.assignee.id, name: selectedCard.assignee.name, email: selectedCard.assignee.email, image: selectedCard.assignee.image }]
                          : []),
                      ].map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                      {selectedCard.assignee ? (
                        <>
                          {selectedCard.assignee.image ? (
                            <img src={selectedCard.assignee.image} alt="" className="w-5 h-5 rounded-full" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                          {selectedCard.assignee.name || selectedCard.assignee.email}
                        </>
                      ) : (
                        'Unassigned'
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              {selectedCard && isCardOwner(selectedCard) && (
                <Button onClick={handleSaveCard} disabled={!editTitle.trim() || updateCard.isLoading}>
                  Save changes
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedCard(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
