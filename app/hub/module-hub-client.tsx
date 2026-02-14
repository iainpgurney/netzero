'use client'

import { trpc } from '@/lib/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Lock, Shield, Building2 } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac'
import type { Session } from 'next-auth'

// Module icon and color mapping
const MODULE_STYLES: Record<string, { gradient: string; iconBg: string; borderHover: string }> = {
  training: {
    gradient: 'from-green-500 to-emerald-600',
    iconBg: 'bg-green-100',
    borderHover: 'hover:border-green-400',
  },
  management: {
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100',
    borderHover: 'hover:border-blue-400',
  },
  bcorp: {
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100',
    borderHover: 'hover:border-emerald-400',
  },
}

const DEFAULT_STYLE = {
  gradient: 'from-gray-500 to-gray-600',
  iconBg: 'bg-gray-100',
  borderHover: 'hover:border-gray-400',
}

interface ModuleHubClientProps {
  session: Session
}

export default function ModuleHubClient({ session }: ModuleHubClientProps) {
  const { data: modules, isLoading } = trpc.rbac.getMyModules.useQuery()
  const { data: allModules } = trpc.rbac.getPlatformModules.useQuery()

  const userRole = session.user?.role || 'MEMBER'
  const departmentName = session.user?.departmentName
  const userName = session.user?.name || 'User'

  // Get accessible module slugs
  const accessibleSlugs = new Set(modules?.map((m) => m.slug) || [])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {userName.split(' ')[0]}
              </h1>
              <p className="text-gray-500 mt-1">
                Access your company modules and resources
              </p>
            </div>
            <div className="flex items-center gap-3">
              {departmentName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm">
                  <Building2 className="w-3.5 h-3.5" />
                  {departmentName}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${
                  ROLE_COLORS[userRole] || ROLE_COLORS.MEMBER
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                {ROLE_LABELS[userRole] || 'Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(allModules || []).map((module) => {
            const hasAccess = accessibleSlugs.has(module.slug)
            const style = MODULE_STYLES[module.slug] || DEFAULT_STYLE

            return (
              <Card
                key={module.id}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                  hasAccess
                    ? `border-transparent ${style.borderHover} hover:shadow-xl cursor-pointer`
                    : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${style.gradient}`} />

                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-xl ${style.iconBg} flex items-center justify-center text-3xl shadow-sm`}
                    >
                      {module.icon || '📦'}
                    </div>
                    {!hasAccess && (
                      <div className="flex items-center gap-1 text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded-full">
                        <Lock className="w-3 h-3" />
                        Restricted
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{module.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                    {module.description || 'Access this module for tools and resources.'}
                  </p>

                  {hasAccess ? (
                    <Link href={module.route} className="block">
                      <Button
                        className={`w-full h-11 bg-gradient-to-r ${style.gradient} text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all group-hover:scale-[1.02]`}
                      >
                        Open Module
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </Link>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-400">
                        Contact your administrator for access
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* No modules message */}
        {modules && modules.length === 0 && (
          <Card className="mt-4 rounded-2xl border-dashed border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No modules assigned yet
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Your administrator hasn&apos;t assigned any modules to your department yet.
                Please contact your admin to get access to the platform modules.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Admin Quick Actions */}
        {(userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') && (
          <div className="mt-8 p-6 bg-gray-900 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Administration
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Manage users, departments, roles, and module access
                </p>
              </div>
              <Link href="/dashboard/admin">
                <Button
                  className="bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl shadow-md"
                >
                  Admin Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
