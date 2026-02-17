'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { trpc } from '@/lib/trpc'
import { CalendarDays, Loader2, ArrowRight } from 'lucide-react'

export function MyTimeOffCard() {
  const { data: summary, isLoading, isError } = trpc.timeOff.getMyLeaveSummary.useQuery()

  if (isLoading) {
    return (
      <Card className="border-sky-200 bg-sky-50/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary || isError) {
    return (
      <Card className="border-sky-200 bg-sky-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-sky-600" />
            My Time Off
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            {isError
              ? 'Unable to load your leave balance. Please try again or contact HR.'
              : 'Your leave balance will appear here once the current leave year is configured. Contact HR if you need assistance.'}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/intranet/time-off/request"
              className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              Request leave
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/intranet/time-off/request#my-requests"
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              My requests
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-sky-200 bg-sky-50/30 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-sky-600" />
            My Time Off
          </CardTitle>
          <span className="text-xs text-gray-500">Leave year {summary.leaveYear}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-gray-500">Allowance</p>
            <p className="text-lg font-bold text-gray-900">{summary.allowance} days</p>
          </div>
          {(summary.timeInLieu ?? 0) > 0 && (
            <div>
              <p className="text-xs text-gray-500">Time in lieu</p>
              <p className="text-lg font-bold text-amber-600">{summary.timeInLieu} days</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500">Used</p>
            <p className="text-lg font-bold text-gray-900">{summary.used} days</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-lg font-bold text-green-600">{summary.remaining} days</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Sick days</p>
            <p className="text-lg font-bold text-gray-900">{summary.sickDays} days</p>
          </div>
        </div>
        {summary.upcoming && summary.upcoming.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Upcoming leave</p>
            <ul className="space-y-1">
              {summary.upcoming.slice(0, 3).map((e) => (
                <li key={e.id} className="text-sm text-gray-600">
                  {e.startDate.toLocaleDateString('en-GB')} – {e.endDate.toLocaleDateString('en-GB')} ({e.durationDays} days)
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/intranet/time-off/request"
            className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700"
          >
            Request leave
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/intranet/time-off/request#my-requests"
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            My requests
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
