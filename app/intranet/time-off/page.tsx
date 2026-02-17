'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/lib/trpc'
import {
  CalendarDays,
  Users,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from 'lucide-react'
export default function TimeOffDashboardPage() {
  const { data: leaveYear, isLoading: loadingYear } =
    trpc.timeOff.getCurrentLeaveYear.useQuery()
  const { data: stats, isLoading: loadingStats } =
    trpc.timeOff.getDashboardStats.useQuery(
      { leaveYearId: leaveYear?.id ?? '' },
      { enabled: !!leaveYear?.id }
    )

  const isLoading = loadingYear || loadingStats

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
        <p className="text-sm text-gray-500 mt-0.5">
          Leave year: {yearLabel}
        </p>
      </div>

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Pending requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.pendingRequests ?? 0}
            </p>
          </CardContent>
        </Card>
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
