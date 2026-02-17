'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { trpc } from '@/lib/trpc'
import {
  ArrowLeft,
  Loader2,
  Plus,
  Check,
  X,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react'

export default function TimeOffEmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.userId as string

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addType, setAddType] = useState<'annual_leave' | 'sick_leave'>('annual_leave')
  const [addStart, setAddStart] = useState('')
  const [addEnd, setAddEnd] = useState('')
  const [addReason, setAddReason] = useState('')

  const { data: leaveYear } = trpc.timeOff.getCurrentLeaveYear.useQuery()
  const { data: employees } = trpc.timeOff.getEmployees.useQuery()
  const employee = employees?.find((e) => e.id === userId)
  const { data: summary, refetch: refetchSummary } =
    trpc.timeOff.getEmployeeLeaveSummary.useQuery(
      { userId, leaveYearId: leaveYear?.id ?? '' },
      { enabled: !!userId && !!leaveYear?.id }
    )
  const { data: entries, refetch: refetchEntries } =
    trpc.timeOff.getLeaveEntries.useQuery(
      { userId, leaveYearId: leaveYear?.id ?? '' },
      { enabled: !!userId && !!leaveYear?.id }
    )

  const createMutation = trpc.timeOff.createLeaveEntry.useMutation({
    onSuccess: () => {
      refetchEntries()
      refetchSummary()
      setAddModalOpen(false)
      setAddStart('')
      setAddEnd('')
      setAddReason('')
    },
  })
  const approveMutation = trpc.timeOff.approveLeaveEntry.useMutation({
    onSuccess: () => {
      refetchEntries()
      refetchSummary()
    },
  })
  const rejectMutation = trpc.timeOff.rejectLeaveEntry.useMutation({
    onSuccess: () => {
      refetchEntries()
      refetchSummary()
    },
  })

  const handleAddLeave = () => {
    const start = new Date(addStart)
    const end = new Date(addEnd)
    if (!leaveYear?.id || isNaN(start.getTime()) || isNaN(end.getTime())) return
    createMutation.mutate({
      userId,
      leaveYearId: leaveYear.id,
      type: addType,
      startDate: start,
      endDate: end,
      reason: addReason || undefined,
    })
  }

  const handleApprove = (entryId: string) => {
    approveMutation.mutate({ entryId })
  }

  const handleReject = (entryId: string) => {
    rejectMutation.mutate({ entryId })
  }

  if (!employee) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Employee not found</p>
        <Link href="/intranet/time-off/employees" className="text-sky-600 mt-2 inline-block">
          Back to employees
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/intranet/time-off/employees"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        All employees
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{employee.name ?? 'Unknown'}</h2>
          <p className="text-gray-500">{employee.email}</p>
          <p className="text-sm text-gray-400">{employee.department?.name ?? 'No department'}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAddType('annual_leave')
              setAddModalOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add annual leave
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAddType('sick_leave')
              setAddModalOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add sick leave
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Allowance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.allowance ?? 0} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.used ?? 0} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{summary?.remaining ?? 0} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Sick days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.sickDays ?? 0} days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave entries</CardTitle>
          <p className="text-sm text-gray-500">All leave for current year</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entries?.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 bg-gray-50/50"
              >
                <div>
                  <span className="font-medium capitalize">
                    {entry.type.replace('_', ' ')}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {entry.startDate.toLocaleDateString('en-GB')} –{' '}
                    {entry.endDate.toLocaleDateString('en-GB')}
                  </span>
                  <span className="text-gray-400 ml-2">({entry.durationDays} days)</span>
                  {entry.reason && (
                    <p className="text-sm text-gray-500 mt-0.5">{entry.reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      entry.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : entry.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : entry.status === 'needs_discussion'
                        ? 'bg-amber-100 text-amber-800'
                        : entry.status === 'requested' || entry.status === 'pending_manager_approval'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {entry.status === 'pending_manager_approval'
                      ? 'Pending manager'
                      : entry.status === 'needs_discussion'
                      ? 'Needs discussion'
                      : entry.status}
                  </span>
                  {(entry.status === 'requested' || entry.status === 'pending_manager_approval') && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(entry.id)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(entry.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          {(!entries || entries.length === 0) && (
            <p className="text-center py-8 text-gray-500">No leave entries</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {addType === 'annual_leave' ? 'annual' : 'sick'} leave
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Start date</Label>
              <Input
                type="date"
                value={addStart}
                onChange={(e) => setAddStart(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>End date</Label>
              <Input
                type="date"
                value={addEnd}
                onChange={(e) => setAddEnd(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Reason (optional)</Label>
              <Input
                value={addReason}
                onChange={(e) => setAddReason(e.target.value)}
                placeholder="e.g. Holiday"
                className="mt-1"
              />
            </div>
            {createMutation.error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {createMutation.error.message}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddLeave}
              disabled={!addStart || !addEnd || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Add leave'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
