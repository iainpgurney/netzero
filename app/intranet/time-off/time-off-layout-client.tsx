'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { CalendarDays, Users, Calendar, FileText, LayoutDashboard, Send, List, Settings } from 'lucide-react'
import { LeaveYearProvider, useShowLeaveYear } from './show-leave-year-context'

function LeaveYearToggles() {
  const { showLeaveYear, setShowLeaveYear, viewNextYear, setViewNextYear } = useShowLeaveYear()
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => setShowLeaveYear(!showLeaveYear)}
        role="switch"
        aria-checked={showLeaveYear}
        aria-label={showLeaveYear ? 'Hide leave year' : 'Show leave year'}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <span
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${
            showLeaveYear ? 'bg-sky-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition ${
              showLeaveYear ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </span>
        <span className="text-xs">Show year</span>
      </button>
      <button
        type="button"
        onClick={() => setViewNextYear(!viewNextYear)}
        role="switch"
        aria-checked={viewNextYear}
        aria-label={viewNextYear ? 'View current year' : 'View next year'}
        title="Using Excel for current year until 31 March"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <span
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${
            viewNextYear ? 'bg-sky-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition ${
              viewNextYear ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </span>
        <span className="text-xs">View next year</span>
      </button>
    </div>
  )
}

export default function TimeOffLayoutClient({
  children,
  canAccessTimeOff,
}: {
  children: React.ReactNode
  canAccessTimeOff: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const isRequestPage = pathname?.includes('/request')

  useEffect(() => {
    if (!isRequestPage && !canAccessTimeOff) {
      router.replace('/intranet')
    }
  }, [isRequestPage, canAccessTimeOff, router])

  const requestNavItems = [
    { href: '/intranet/time-off/request', label: 'New request', icon: Send },
    { href: '/intranet/time-off/request#my-requests', label: 'My requests', icon: List },
  ]

  const adminNavItems = [
    { href: '/intranet/time-off', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/intranet/time-off/employees', label: 'Employees', icon: Users },
    { href: '/intranet/time-off/calendar', label: 'Calendar', icon: Calendar },
    { href: '/intranet/time-off/reports', label: 'Reports', icon: FileText },
    { href: '/intranet/time-off/settings', label: 'Settings', icon: Settings },
  ]

  const navItems = isRequestPage ? requestNavItems : adminNavItems

  return (
    <LeaveYearProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {isRequestPage ? 'Time Off Request' : 'Time Off Manager'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isRequestPage ? 'Submit and manage your leave requests' : 'Annual leave and sick leave'}
                  </p>
                </div>
              </div>
              {canAccessTimeOff && !isRequestPage && <LeaveYearToggles />}
            </div>
            <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-sky-100 text-sky-800'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
            {canAccessTimeOff && !isRequestPage && (
              <Link
                href="/intranet/time-off/request"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-sky-600 hover:bg-sky-50"
              >
                <Send className="w-4 h-4" />
                Request leave
              </Link>
            )}
            </nav>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </div>
    </LeaveYearProvider>
  )
}
