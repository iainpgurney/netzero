'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trpc } from '@/lib/trpc'
import {
  Loader2,
  Settings,
  Plus,
  RotateCcw,
  Calendar,
  AlertTriangle,
} from 'lucide-react'

export default function TimeOffSettingsPage() {
  const utils = trpc.useUtils()
  const { data: leaveYears, isLoading: loadingYears } =
    trpc.timeOff.listAllLeaveYears.useQuery()
  const { data: currentYear } = trpc.timeOff.getCurrentLeaveYear.useQuery()

  const [createStart, setCreateStart] = useState('2026-04-01')
  const [createEnd, setCreateEnd] = useState('2027-03-31')
  const [rolloverFromId, setRolloverFromId] = useState<string>('')
  const [maxCarryOver, setMaxCarryOver] = useState(5)
  const [isCreating, setIsCreating] = useState(false)
  const [isRollingOver, setIsRollingOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createYear = trpc.timeOff.createLeaveYear.useMutation({
    onSuccess: () => {
      utils.timeOff.listAllLeaveYears.invalidate()
      utils.timeOff.getCurrentLeaveYear.invalidate()
      setIsCreating(false)
      setError(null)
    },
    onError: (e) => {
      setError(e.message)
      setIsCreating(false)
    },
  })

  const rollover = trpc.timeOff.rolloverToNewYear.useMutation({
    onSuccess: () => {
      utils.timeOff.listAllLeaveYears.invalidate()
      utils.timeOff.getCurrentLeaveYear.invalidate()
      utils.timeOff.getEmployeesWithSummaries.invalidate()
      setIsRollingOver(false)
      setRolloverFromId('')
      setError(null)
    },
    onError: (e) => {
      setError(e.message)
      setIsRollingOver(false)
    },
  })

  const handleCreate = () => {
    setError(null)
    const start = new Date(createStart)
    const end = new Date(createEnd)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Invalid dates')
      return
    }
    setIsCreating(true)
    createYear.mutate({ startDate: start, endDate: end })
  }

  const handleRollover = () => {
    if (!rolloverFromId) {
      setError('Select a leave year to roll over from')
      return
    }
    setError(null)
    setIsRollingOver(true)
    rollover.mutate({
      fromLeaveYearId: rolloverFromId,
      maxCarryOverDays: maxCarryOver,
    })
  }

  if (loadingYears) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Leave Year Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage leave years and roll over to a new year with carry forward.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-800 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Leave years list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Leave years
          </CardTitle>
          <p className="text-sm text-gray-500 font-normal">
            All leave years. Historical data is retained. Current year is highlighted.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaveYears?.length === 0 ? (
              <p className="text-sm text-gray-500">No leave years yet.</p>
            ) : (
              leaveYears?.map((ly) => {
                const isCurrent = currentYear?.id === ly.id
                const label = `${new Date(ly.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} – ${new Date(ly.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                return (
                  <div
                    key={ly.id}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                      isCurrent ? 'bg-sky-50 border border-sky-200' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {label}
                      {isCurrent && (
                        <span className="ml-2 text-xs text-sky-600 font-normal">(current)</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {ly._count.policies} policies · {ly._count.entries} entries
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create leave year manually */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create leave year
          </CardTitle>
          <p className="text-sm text-gray-500 font-normal">
            Add a new leave year with custom dates (e.g. 1 April 2026 – 31 March 2027).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="create-start">Start date</Label>
              <Input
                id="create-start"
                type="date"
                value={createStart}
                onChange={(e) => setCreateStart(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-end">End date</Label>
              <Input
                id="create-end"
                type="date"
                value={createEnd}
                onChange={(e) => setCreateEnd(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Create leave year
          </Button>
        </CardContent>
      </Card>

      {/* Rollover to new year */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Roll over to new year
          </CardTitle>
          <p className="text-sm text-gray-500 font-normal">
            Create the next leave year (1 April – 31 March) and copy policies with carry forward of unused days.
            Historical leave entries are retained.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rollover-from">Roll over from</Label>
            <select
              id="rollover-from"
              value={rolloverFromId}
              onChange={(e) => setRolloverFromId(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select leave year</option>
              {leaveYears?.map((ly) => (
                <option key={ly.id} value={ly.id}>
                  {new Date(ly.startDate).getFullYear()}–{new Date(ly.endDate).getFullYear()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="max-carry">Max carry forward (days)</Label>
            <Input
              id="max-carry"
              type="number"
              min={0}
              max={23}
              value={maxCarryOver}
              onChange={(e) => setMaxCarryOver(parseInt(e.target.value, 10) || 0)}
              className="mt-1 w-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              Unused days above this limit are not carried forward (default 5).
            </p>
          </div>
          <Button
            onClick={handleRollover}
            disabled={isRollingOver || !rolloverFromId}
          >
            {isRollingOver ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Roll over to new year
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
