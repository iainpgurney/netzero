'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Columns3, Loader2, Star } from 'lucide-react'
import type { SystemRole } from '@/lib/rbac'
import { cn } from '@/lib/utils'

export default function BoardsPage() {
  const { data: session } = useSession()
  const { data: departments, isLoading } = trpc.rbac.getDepartments.useQuery()

  const userRole = (session?.user?.role ?? 'MEMBER') as SystemRole
  const userDeptSlug = session?.user?.departmentSlug ?? null
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'

  // All users can see all department boards
  const visibleDepartments = departments

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Boards</h1>
          <p className="mt-2 text-gray-500">
            Department Kanban boards for task tracking and workflow management.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {/* Department Grid */}
        {visibleDepartments && visibleDepartments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleDepartments.map((dept) => {
              const isOwn = dept.slug === userDeptSlug
              return (
                <Link key={dept.id} href={`/intranet/boards/${dept.slug}`}>
                  <Card
                    className={cn(
                      'h-full hover:shadow-md transition-all cursor-pointer group',
                      isOwn
                        ? 'border-green-300 bg-green-50/30 hover:border-green-400'
                        : 'hover:border-gray-300'
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{dept.icon}</span>
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2 group-hover:text-green-700 transition-colors">
                            {dept.name}
                            {isOwn && (
                              <Star className="w-4 h-4 text-green-600 fill-green-600" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-0.5">
                            {dept.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Columns3 className="w-4 h-4" />
                        <span>View board</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {visibleDepartments && visibleDepartments.length === 0 && !isLoading && (
          <div className="text-center py-20 text-gray-400">
            <Columns3 className="w-10 h-10 mx-auto mb-3" />
            <p className="mb-1">No boards available.</p>
            <p className="text-sm">
              {!isAdmin
                ? 'You are not assigned to a department yet. Contact an admin.'
                : 'No departments have been created.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
