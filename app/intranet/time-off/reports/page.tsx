'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc'
import { Loader2, Download } from 'lucide-react'

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export default function TimeOffReportsPage() {
  const { data: leaveYear } = trpc.timeOff.getCurrentLeaveYear.useQuery()
  const { data: employeesWithSummaries } =
    trpc.timeOff.getEmployeesWithSummaries.useQuery(
      { leaveYearId: leaveYear?.id ?? '' },
      { enabled: !!leaveYear?.id }
    )
  const { data: allEntries } = trpc.timeOff.getLeaveEntries.useQuery(
    { leaveYearId: leaveYear?.id ?? '', status: 'approved' },
    { enabled: !!leaveYear?.id }
  )

  const [loadingReport, setLoadingReport] = useState<string | null>(null)

  const exportAnnualLeave = () => {
    if (!leaveYear || !employeesWithSummaries) return
    setLoadingReport('annual')
    try {
      const rows: string[][] = [
        ['Name', 'Email', 'Department', 'Allowance', 'Used', 'Remaining', 'Sick Days'],
      ]
      for (const emp of employeesWithSummaries) {
        rows.push([
          emp.name ?? '',
          emp.email ?? '',
          emp.department?.name ?? '',
          String(emp.allowance ?? 0),
          String(emp.used ?? 0),
          String(emp.remaining ?? 0),
          String(emp.sickDays ?? 0),
        ])
      }
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      downloadCSV(
        `annual-leave-${leaveYear.startDate.toISOString().slice(0, 7)}.csv`,
        csv
      )
    } finally {
      setLoadingReport(null)
    }
  }

  const exportSickDays = () => {
    if (!leaveYear || !employeesWithSummaries) return
    setLoadingReport('sick')
    try {
      const rows: string[][] = [['Name', 'Sick Days (this year)']]
      for (const emp of employeesWithSummaries) {
        if ((emp.sickDays ?? 0) > 0) {
          rows.push([emp.name ?? '', String(emp.sickDays)])
        }
      }
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      downloadCSV(`sick-days-${leaveYear.startDate.toISOString().slice(0, 7)}.csv`, csv)
    } finally {
      setLoadingReport(null)
    }
  }

  const exportUpcoming = () => {
    if (!leaveYear || !allEntries) return
    setLoadingReport('upcoming')
    try {
      const now = new Date()
      const in90 = new Date(now)
      in90.setDate(in90.getDate() + 90)
      const upcoming = allEntries.filter((e) => {
        const start = new Date(e.startDate)
        return start >= now && start <= in90
      })
      const rows: string[][] = [
        ['Name', 'Department', 'Type', 'Start', 'End', 'Days'],
      ]
      for (const e of upcoming) {
        rows.push([
          e.user?.name ?? '',
          e.user?.department?.name ?? '',
          e.type?.replace('_', ' ') ?? '',
          e.startDate ? new Date(e.startDate).toLocaleDateString('en-GB') : '',
          e.endDate ? new Date(e.endDate).toLocaleDateString('en-GB') : '',
          String(e.durationDays ?? 0),
        ])
      }
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      downloadCSV('upcoming-absences.csv', csv)
    } finally {
      setLoadingReport(null)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
      <p className="text-sm text-gray-500">
        Export data for the current leave year (
        {leaveYear
          ? `${leaveYear.startDate.toLocaleDateString('en-GB')} - ${leaveYear.endDate.toLocaleDateString('en-GB')}`
          : '—'}
        )
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Annual leave summary</CardTitle>
            <p className="text-sm text-gray-500">
              Allowance, used, remaining and sick days per employee
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={exportAnnualLeave}
              disabled={!leaveYear || !employeesWithSummaries || loadingReport !== null}
            >
              {loadingReport === 'annual' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export CSV
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sick days</CardTitle>
            <p className="text-sm text-gray-500">
              Sick days used per employee this leave year
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={exportSickDays}
              disabled={!leaveYear || loadingReport !== null}
            >
              {loadingReport === 'sick' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export CSV
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming absences</CardTitle>
            <p className="text-sm text-gray-500">
              Approved leave in the next 90 days
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={exportUpcoming}
              disabled={!leaveYear || loadingReport !== null}
            >
              {loadingReport === 'upcoming' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
