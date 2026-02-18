'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/lib/trpc'
import { useShowLeaveYear } from './show-leave-year-context'
import {
  CalendarDays,
  Users,
  AlertTriangle,
  Loader2,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
export default function TimeOffDashboardPage() {
  const { showLeaveYear, viewNextYear } = useShowLeaveYear()
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const { data: currentYear, isLoading: loadingCurrent } =
    trpc.timeOff.getCurrentLeaveYear.useQuery()
  const { data: nextYear, isLoading: loadingNext } =
    trpc.timeOff.getNextLeaveYear.useQuery()
  const leaveYear = viewNextYear && nextYear ? nextYear : currentYear
  const { data: stats, isLoading: loadingStats } =
    trpc.timeOff.getDashboardStats.useQuery(
      { leaveYearId: leaveYear?.id ?? '' },
      { enabled: !!leaveYear?.id }
    )

  const isLoading = loadingCurrent || loadingStats || (viewNextYear && loadingNext)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const yearLabel = leaveYear
    ? `${leaveYear.startDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })} - ${leaveYear.endDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}`
    : '—'

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        {showLeaveYear && (
          <p className="text-sm text-gray-500 mt-0.5">
            Leave year: {yearLabel}
            {viewNextYear && (
              <span className="ml-2 text-amber-600">(Excel for current year until 31 Mar)</span>
            )}
          </p>
        )}
      </div>

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
                <p>Employee fills in dates, leave type, reason and selects line manager. Submits via Request leave.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">2. Manager approves or rejects</p>
                <p>Managers see requests in &quot;Pending my approval&quot; on the <Link href="/intranet/time-off/request" className="text-sky-600 hover:underline">Request</Link> page. Approve, Reject, or &quot;Speak to line manager&quot;.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">3. Approved leave</p>
                <p>Approved leave appears on calendars. Employee can only edit while pending.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">4. Cancelling leave</p>
                <p>Employee requests cancellation → manager approves or rejects. Managers can cancel directly from pending items.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">5. Volunteer days</p>
                <p>Employees can request up to 2 volunteer days per year (separate from annual leave).</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">6. Time in lieu</p>
                <p>Managers/HR add overtime days via Employees → select employee → &quot;Add time in lieu&quot;. Trackable in Reports.</p>
              </div>
              <div>
                <p className="font-medium text-gray-800">7. HR &amp; reports</p>
                <p>HR manages all employees, can add leave and cancel any request. Export CSV reports from Reports.</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Leave this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.leaveBookedThisMonth ?? 0} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Upcoming leave
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.upcomingLeave ?? 0} entries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Sick days this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.sickDaysThisMonth ?? 0} days
            </p>
          </CardContent>
        </Card>
        <Link href="/intranet/time-off/request">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Pending your approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.pendingForManagerCount ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Approve or reject on Request page
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/intranet/time-off/employees">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Employees</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    View team list, allowances, and manage leave
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/intranet/time-off/calendar">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Calendar</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Team calendar view of approved leave
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Link href="/intranet/time-off/reports">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Reports</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Export annual leave, sick days, and upcoming absences (CSV)
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
