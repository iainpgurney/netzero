'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc'
import { Loader2, Search } from 'lucide-react'

export default function TimeOffEmployeesPage() {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState<string>('')

  const { data: leaveYear, isLoading: loadingYear } =
    trpc.timeOff.getCurrentLeaveYear.useQuery()
  const { data: employees, isLoading: loadingEmployees } =
    trpc.timeOff.getEmployees.useQuery()

  const isLoading = loadingYear || loadingEmployees

  const departments = [...new Set(employees?.map((e) => e.department?.name).filter(Boolean) as string[])].sort()

  const filtered = employees?.filter((e) => {
    const matchSearch =
      !search ||
      (e.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (e.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchDept = !deptFilter || e.department?.name === deptFilter
    return matchSearch && matchDept
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Employees</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-48"
            />
          </div>
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
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Team list</CardTitle>
          <p className="text-sm text-gray-500">
            Click an employee to view their leave summary and manage entries
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Email</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-700">Department</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-900">{emp.name ?? '—'}</td>
                    <td className="py-3 px-2 text-gray-600">{emp.email ?? '—'}</td>
                    <td className="py-3 px-2 text-gray-600">{emp.department?.name ?? '—'}</td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        href={`/intranet/time-off/employees/${emp.id}`}
                        className="text-sky-600 hover:text-sky-700 font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!filtered || filtered.length === 0) && (
            <p className="text-center py-8 text-gray-500">No employees found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
