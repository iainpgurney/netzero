'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { trpc } from '@/lib/trpc'
import {
  Loader2,
  Send,
  Check,
  X,
  MessageCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  XCircle,
  HelpCircle,
} from 'lucide-react'

const LEAVE_TYPES = [
  { value: 'sick_leave', label: 'Sick leave (Illness or Injury)' },
  { value: 'bereavement_immediate', label: 'Bereavement leave (Immediate Family)' },
  { value: 'bereavement_other', label: 'Bereavement leave (Other)' },
  { value: 'personal_leave', label: 'Personal leave' },
  { value: 'annual_leave', label: 'Annual leave' },
  { value: 'jury_duty', label: 'Jury duty or legal leave' },
  { value: 'emergency_leave', label: 'Emergency leave' },
  { value: 'temporary_leave', label: 'Temporary leave' },
  { value: 'leave_without_pay', label: 'Leave without pay' },
  { value: 'other', label: 'Other' },
]

function getBusinessDays(start: Date, end: Date): number {
  let count = 0
  const d = new Date(start)
  d.setHours(0, 0, 0, 0)
  const endD = new Date(end)
  endD.setHours(23, 59, 59, 999)
  while (d <= endD) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++
    d.setDate(d.getDate() + 1)
  }
  return count
}

function getDurationDays(
  startStr: string,
  endStr: string,
  isSingleDay: boolean,
  singleDayPart: string
): number {
  if (!startStr || !endStr) return 0
  const start = new Date(startStr)
  const end = new Date(endStr)
  const fullDays = getBusinessDays(start, end)
  if (fullDays === 0) return 0
  if (isSingleDay && (singleDayPart === 'AM' || singleDayPart === 'PM')) return 0.5
  return fullDays
}

function EditRequestForm({
  entry,
  users,
  onCancel,
  isPending,
  onMutate,
}: {
  entry: { id: string; startDate: Date; endDate: Date; isSingleDay: boolean; singleDayPart: string | null; type: string; leaveTypeOther: string | null; reason: string | null; notes: string | null; managerId: string | null; durationDays: number }
  users: { id: string; name: string | null; email: string | null }[]
  onCancel: () => void
  isPending: boolean
  onMutate: (input: any) => void
}) {
  const [managerId, setManagerId] = useState(entry.managerId ?? '')
  const [startDate, setStartDate] = useState(entry.startDate.toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(entry.endDate.toISOString().slice(0, 10))
  const [isSingleDay, setIsSingleDay] = useState(entry.isSingleDay)
  const [singleDayPart, setSingleDayPart] = useState<'AM' | 'PM' | 'full_day'>((entry.singleDayPart as 'AM' | 'PM' | 'full_day') ?? 'full_day')
  const [numberOfDays, setNumberOfDays] = useState(entry.durationDays)
  const [leaveType, setLeaveType] = useState(entry.type)
  const [leaveTypeOther, setLeaveTypeOther] = useState(entry.leaveTypeOther ?? '')
  const [reason, setReason] = useState(entry.reason ?? '')
  const [notes, setNotes] = useState(entry.notes ?? '')

  useEffect(() => {
    setNumberOfDays(getDurationDays(startDate, endDate, isSingleDay, singleDayPart))
  }, [startDate, endDate, isSingleDay, singleDayPart])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (endDate < startDate) return
    onMutate({
      entryId: entry.id,
      managerId: managerId || undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isSingleDay,
      singleDayPart: isSingleDay ? singleDayPart : undefined,
      numberOfDays,
      leaveType,
      leaveTypeOther: leaveType === 'other' ? leaveTypeOther : undefined,
      reason,
      notes: notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 border rounded-lg bg-white space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Line manager</Label>
          <Select value={managerId} onChange={(e) => setManagerId(e.target.value)} className="mt-1">
            <option value="">Select</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Start date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>End date</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Number of days</Label>
          <Input type="number" min={0.5} step={0.5} value={numberOfDays} readOnly className="mt-1 bg-gray-50" />
        </div>
      </div>
      <div>
        <Label>Reason</Label>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="mt-1" required />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save changes'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default function TimeOffRequestPage() {
  const { data: session } = useSession()
  const [employeeName, setEmployeeName] = useState('')
  const [managerId, setManagerId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isSingleDay, setIsSingleDay] = useState(false)
  const [singleDayPart, setSingleDayPart] = useState<'AM' | 'PM' | 'full_day'>('full_day')
  const [numberOfDays, setNumberOfDays] = useState(0)
  const [leaveType, setLeaveType] = useState('annual_leave')
  const [leaveTypeOther, setLeaveTypeOther] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  const { data: users } = trpc.timeOff.getUsersForManagerDropdown.useQuery()
  const { data: myRequests, refetch: refetchMyRequests } = trpc.timeOff.getMyLeaveRequests.useQuery()
  const { data: pendingForManager, refetch: refetchPending } =
    trpc.timeOff.getPendingForManager.useQuery()

  const submitMutation = trpc.timeOff.submitLeaveRequest.useMutation({
    onSuccess: () => {
      refetchMyRequests()
      resetForm()
    },
    onError: (e) => setFormError(e.message),
  })
  const updateMutation = trpc.timeOff.updateMyLeaveRequest.useMutation({
    onSuccess: () => {
      refetchMyRequests()
      setEditingId(null)
    },
  })
  const managerApproveMutation = trpc.timeOff.managerApproveLeave.useMutation({
    onSuccess: () => {
      refetchPending()
      refetchMyRequests()
    },
  })
  const requestCancelMutation = trpc.timeOff.requestCancelLeave.useMutation({
    onSuccess: () => {
      refetchMyRequests()
      refetchPending()
    },
    onError: (e) => setFormError(e.message),
  })
  const approveCancelMutation = trpc.timeOff.approveCancelRequest.useMutation({
    onSuccess: () => {
      refetchPending()
      refetchMyRequests()
    },
  })
  const rejectCancelMutation = trpc.timeOff.rejectCancelRequest.useMutation({
    onSuccess: () => {
      refetchPending()
      refetchMyRequests()
    },
  })
  const cancelAsManagerMutation = trpc.timeOff.cancelLeaveRequestAsManager.useMutation({
    onSuccess: () => {
      refetchPending()
      refetchMyRequests()
    },
  })

  useEffect(() => {
    if (session?.user?.name) setEmployeeName(session.user.name as string)
  }, [session])

  useEffect(() => {
    const days = getDurationDays(startDate, endDate, isSingleDay, singleDayPart)
    setNumberOfDays(days)
  }, [startDate, endDate, isSingleDay, singleDayPart])

  useEffect(() => {
    if (startDate && endDate && startDate === endDate) {
      setIsSingleDay(true)
    }
  }, [startDate, endDate])

  const resetForm = () => {
    setManagerId('')
    setStartDate('')
    setEndDate('')
    setIsSingleDay(false)
    setSingleDayPart('full_day')
    setNumberOfDays(0)
    setLeaveType('annual_leave')
    setLeaveTypeOther('')
    setReason('')
    setNotes('')
    setFormError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!managerId) {
      setFormError('Please select your line manager')
      return
    }
    if (endDate < startDate) {
      setFormError('End date must be the same as or after the start date.')
      return
    }
    if (leaveType === 'other' && !leaveTypeOther.trim()) {
      setFormError('Please describe the leave type when selecting Other')
      return
    }
    if (!reason.trim()) {
      setFormError('Reason for leave is required')
      return
    }
    if (numberOfDays < 0.5) {
      setFormError('Please enter valid dates')
      return
    }

    submitMutation.mutate({
      employeeName,
      managerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isSingleDay,
      singleDayPart: isSingleDay ? singleDayPart : undefined,
      numberOfDays,
      leaveType: leaveType as any,
      leaveTypeOther: leaveType === 'other' ? leaveTypeOther : undefined,
      reason,
      notes: notes || undefined,
    })
  }

  const [managerNotesMap, setManagerNotesMap] = useState<Record<string, string>>({})

  const handleManagerApprove = (entryId: string, approval: 'yes' | 'no' | 'speak_to_line_manager') => {
    managerApproveMutation.mutate({
      entryId,
      approval,
      managerNotes: managerNotesMap[entryId] || undefined,
    })
  }

  const formatStatus = (status: string) => {
    const map: Record<string, string> = {
      pending_manager_approval: 'Pending manager approval',
      needs_discussion: 'Needs discussion',
      approved: 'Approved',
      rejected: 'Rejected',
      requested: 'Requested',
      cancelled: 'Cancelled',
      pending_cancellation: 'Cancellation requested',
    }
    return map[status] ?? status
  }

  const formatLeaveType = (type: string) => {
    return LEAVE_TYPES.find((t) => t.value === type)?.label ?? type
  }

  return (
    <div className="space-y-8">
      <p className="text-gray-600">
        Please submit the dates you need off and the type of leave. Your email is captured
        automatically.
      </p>

      {/* Instructions (collapsible) */}
      <Card className="border-sky-100">
        <button
          type="button"
          onClick={() => setInstructionsOpen(!instructionsOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-sky-50/50 transition-colors rounded-lg"
        >
          <span className="font-medium text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            How to use this system
          </span>
          {instructionsOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {instructionsOpen && (
          <CardContent className="pt-0 pb-4 px-4 space-y-4">
            <div className="text-sm text-gray-600 space-y-3">
              <div>
                <p className="font-medium text-gray-800">1. Employee submits request</p>
                <p>Fill in dates, leave type, reason and select your line manager. Submit.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">2. Manager approves or rejects</p>
                <p>Managers see requests in &quot;Pending my approval&quot;. Approve, Reject, or &quot;Speak to line manager&quot; if you need to discuss.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">3. Approved leave</p>
                <p>Approved leave appears on calendars. Employee can edit only while pending.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">4. Cancelling leave</p>
                <p>Employee clicks &quot;Request cancellation&quot; → manager approves or rejects. Managers can cancel directly from &quot;Pending my approval&quot;.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">5. Time in lieu</p>
                <p>Managers/HR add overtime days via Employees → select employee → &quot;Add time in lieu&quot;. Trackable in Reports.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">6. HR &amp; reports</p>
                <p>HR can manage all employees, add leave, cancel any request. Export CSV reports (annual leave, sick days, time in lieu) from Reports.</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Section 1: Time Off Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Time Off Request</CardTitle>
          <p className="text-sm text-gray-500 font-normal">
            Please submit the times you need to take off work and the type of leave you are
            taking.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="employeeName">Name</Label>
                <Input
                  id="employeeName"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="managerId">Line manager</Label>
                <Select
                  id="managerId"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  required
                  className="mt-1"
                >
                  <option value="">Select your line manager</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name ?? u.email} {u.email ? `(${u.email})` : ''}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startDate">Start leave date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End leave date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Is this a single day?</Label>
              <RadioGroup
                value={isSingleDay ? 'yes' : 'no'}
                onValueChange={(v) => setIsSingleDay(v === 'yes')}
                className="mt-2 flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="single-yes" />
                  <Label htmlFor="single-yes" className="font-normal cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="single-no" />
                  <Label htmlFor="single-no" className="font-normal cursor-pointer">
                    No
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {isSingleDay && (
              <div>
                <Label>AM / PM / Full day</Label>
                <RadioGroup
                  value={singleDayPart}
                  onValueChange={(v) => setSingleDayPart(v as 'AM' | 'PM' | 'full_day')}
                  className="mt-2 flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="AM" id="part-am" />
                    <Label htmlFor="part-am" className="font-normal cursor-pointer">
                      AM
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="PM" id="part-pm" />
                    <Label htmlFor="part-pm" className="font-normal cursor-pointer">
                      PM
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="full_day" id="part-full" />
                    <Label htmlFor="part-full" className="font-normal cursor-pointer">
                      Full day
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div>
              <Label htmlFor="numberOfDays">Number of days</Label>
              <Input
                id="numberOfDays"
                type="number"
                min={0.5}
                step={0.5}
                value={numberOfDays || ''}
                readOnly
                className="mt-1 bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                If unsure, put your best estimate. HR will confirm.
              </p>
            </div>

            <div>
              <Label htmlFor="leaveType">Type of leave</Label>
              <Select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                required
                className="mt-1"
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            {leaveType === 'other' && (
              <div>
                <Label htmlFor="leaveTypeOther">If Other: Describe</Label>
                <Input
                  id="leaveTypeOther"
                  value={leaveTypeOther}
                  onChange={(e) => setLeaveTypeOther(e.target.value)}
                  placeholder="Describe the leave type"
                  required={leaveType === 'other'}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason for leave</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason"
                required
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes"
                rows={2}
                className="mt-1"
              />
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}

            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My requests */}
      <section id="my-requests">
        <Card>
          <CardHeader>
            <CardTitle>My requests</CardTitle>
            <p className="text-sm text-gray-500 font-normal">
              Your leave requests for the current year. You can edit pending requests.
            </p>
          </CardHeader>
          <CardContent>
            {!myRequests?.length ? (
              <p className="text-gray-500 py-4">No requests yet</p>
            ) : (
              <div className="space-y-3">
                {myRequests.map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 bg-gray-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-medium">
                          {formatLeaveType(entry.type)} — {entry.durationDays} days
                        </span>
                        <span className="text-gray-500 ml-2">
                          {new Date(entry.startDate).toLocaleDateString('en-GB')} –{' '}
                          {new Date(entry.endDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : entry.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : entry.status === 'needs_discussion'
                            ? 'bg-amber-100 text-amber-800'
                            : entry.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-600'
                            : entry.status === 'pending_cancellation'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {formatStatus(entry.status)}
                      </span>
                    </div>
                    {entry.reason && (
                      <p className="text-sm text-gray-600">{entry.reason}</p>
                    )}
                    {/* Section 2 read-only for employees */}
                    {(entry.managerName || entry.managerApproval || entry.managerNotes) && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-sm">
                        <p className="font-medium text-gray-700 mb-1">Line manager only</p>
                        {entry.managerName && (
                          <p className="text-gray-600">Manager: {entry.managerName}</p>
                        )}
                        {entry.managerApproval && (
                          <p className="text-gray-600">
                            Approval: {entry.managerApproval === 'yes' ? 'Yes' : entry.managerApproval === 'no' ? 'No' : 'Speak to line manager'}
                          </p>
                        )}
                        {entry.managerNotes && (
                          <p className="text-gray-600">Notes: {entry.managerNotes}</p>
                        )}
                      </div>
                    )}
                    {entry.status === 'pending_manager_approval' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditingId(editingId === entry.id ? null : entry.id)
                          }
                        >
                          {editingId === entry.id ? (
                            <>Cancel edit <ChevronUp className="w-4 h-4 ml-1" /></>
                          ) : (
                            <>Edit request <ChevronDown className="w-4 h-4 ml-1" /></>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => requestCancelMutation.mutate({ entryId: entry.id })}
                          disabled={requestCancelMutation.isPending}
                        >
                          {requestCancelMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Request cancellation
                            </>
                          )}
                        </Button>
                        {editingId === entry.id && (
                          <EditRequestForm
                            entry={entry}
                            users={users ?? []}
                            onCancel={() => setEditingId(null)}
                            isPending={updateMutation.isPending}
                            onMutate={updateMutation.mutate}
                          />
                        )}
                      </>
                    )}
                    {(entry.status === 'needs_discussion' || entry.status === 'approved') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => requestCancelMutation.mutate({ entryId: entry.id })}
                        disabled={requestCancelMutation.isPending}
                      >
                        {requestCancelMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Request cancellation
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Pending approvals (for managers) */}
      {pendingForManager && pendingForManager.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending my approval</CardTitle>
            <p className="text-sm text-gray-500 font-normal">
              Line manager only. HR will follow up if needed.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingForManager.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 bg-sky-50/30 space-y-3"
                >
                  <div>
                    <span className="font-medium">{entry.user.name ?? entry.user.email}</span>
                    <span className="text-gray-500 ml-2">
                      {formatLeaveType(entry.type)} — {entry.durationDays} days
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(entry.startDate).toLocaleDateString('en-GB')} –{' '}
                    {new Date(entry.endDate).toLocaleDateString('en-GB')}
                  </p>
                  {entry.reason && (
                    <p className="text-sm text-gray-500">{entry.reason}</p>
                  )}
                  {entry.status === 'pending_cancellation' ? (
                    <>
                      <p className="text-sm font-medium text-amber-700">
                        {entry.user.name ?? entry.user.email} requested to cancel their leave
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approveCancelMutation.mutate({ entryId: entry.id })}
                          disabled={approveCancelMutation.isPending}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Approve cancellation
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectCancelMutation.mutate({ entryId: entry.id })}
                          disabled={rejectCancelMutation.isPending}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject cancellation
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label className="text-xs">Manager notes (optional)</Label>
                        <Textarea
                          value={managerNotesMap[entry.id] ?? ''}
                          onChange={(e) =>
                            setManagerNotesMap((m) => ({ ...m, [entry.id]: e.target.value }))
                          }
                          placeholder="Add notes for the employee..."
                          rows={2}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleManagerApprove(entry.id, 'yes')}
                          disabled={managerApproveMutation.isPending}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManagerApprove(entry.id, 'no')}
                          disabled={managerApproveMutation.isPending}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManagerApprove(entry.id, 'speak_to_line_manager')}
                          disabled={managerApproveMutation.isPending}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Speak to line manager
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelAsManagerMutation.mutate({ entryId: entry.id })}
                          disabled={cancelAsManagerMutation.isPending}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
