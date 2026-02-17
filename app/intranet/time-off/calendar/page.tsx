'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/lib/trpc'
import { Loader2 } from 'lucide-react'

export default function TimeOffCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [deptFilter, setDeptFilter] = useState<string>('')

  const { data: leaveYear } = trpc.timeOff.getCurrentLeaveYear.useQuery()
  const { data: entries, isLoading } = trpc.timeOff.getLeaveEntries.useQuery(
    {
      leaveYearId: leaveYear?.id ?? '',
      status: 'approved',
    },
    { enabled: !!leaveYear?.id }
  )

  const filteredEntries = deptFilter
    ? entries?.filter((e) => e.user.department?.name === deptFilter)
    : entries

  const departments = [...new Set(entries?.map((e) => e.user.department?.name).filter(Boolean) as string[])].sort()

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate()
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay()
  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  const prevMonth = () => {
    if (currentMonth.month === 0) {
      setCurrentMonth({ year: currentMonth.year - 1, month: 11 })
    } else {
      setCurrentMonth({ year: currentMonth.year, month: currentMonth.month - 1 })
    }
  }

  const nextMonth = () => {
    if (currentMonth.month === 11) {
      setCurrentMonth({ year: currentMonth.year + 1, month: 0 })
    } else {
      setCurrentMonth({ year: currentMonth.year, month: currentMonth.month + 1 })
    }
  }

  const getEntriesForDay = (day: number) => {
    const date = new Date(currentMonth.year, currentMonth.month, day)
    return filteredEntries?.filter((e) => {
      const start = new Date(e.startDate)
      const end = new Date(e.endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return date >= start && date <= end
    }) ?? []
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const startOffset = firstDay === 0 ? 6 : firstDay - 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Team calendar</h2>
        <div className="flex items-center gap-4">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="px-2 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50"
            >
              Prev
            </button>
            <span className="font-medium min-w-[140px] text-center">{monthName}</span>
            <button
              onClick={nextMonth}
              className="px-2 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {weekDays.map((d) => (
              <div
                key={d}
                className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500"
              >
                {d}
              </div>
            ))}
            {Array.from({ length: startOffset + daysInMonth }).map((_, i) => {
              const day = i - startOffset + 1
              const isPadding = day < 1
              const dayEntries = !isPadding ? getEntriesForDay(day) : []
              return (
                <div
                  key={i}
                  className={`min-h-[80px] p-1 bg-white ${
                    isPadding ? 'bg-gray-50/50' : ''
                  }`}
                >
                  {!isPadding && (
                    <>
                      <span className="text-xs font-medium text-gray-500">{day}</span>
                      <div className="mt-1 space-y-0.5">
                        {dayEntries.slice(0, 3).map((e) => (
                          <div
                            key={e.id}
                            className={`text-xs truncate px-1 py-0.5 rounded ${
                              e.type === 'sick_leave'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                            title={`${e.user.name} - ${e.type.replace('_', ' ')}`}
                          >
                            {e.user.name?.split(' ')[0]}
                          </div>
                        ))}
                        {dayEntries.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{dayEntries.length - 3} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-3">
          <span className="w-3 h-3 rounded bg-green-100" />
          Annual leave
        </span>
        <span className="flex items-center gap-3">
          <span className="w-3 h-3 rounded bg-amber-100" />
          Sick leave
        </span>
      </div>
    </div>
  )
}
