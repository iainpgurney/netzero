'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Loader2 } from 'lucide-react'

export default function TeamsPage() {
  const { data: departments, isLoading } = trpc.rbac.getDepartments.useQuery()

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="mt-2 text-gray-500">
            Browse departments and meet the people behind Carma.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {/* Department Grid */}
        {departments && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.map((dept) => (
              <Card key={dept.id} className="h-full hover:shadow-md hover:border-green-200 transition-all group">
                <Link href={`/intranet/teams/${dept.slug}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{dept.icon}</span>
                      <div>
                        <CardTitle className="text-lg group-hover:text-green-700 transition-colors">
                          {dept.name}
                        </CardTitle>
                        <CardDescription className="mt-0.5">
                          {dept.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                      <Users className="w-4 h-4" />
                      <span>
                        {dept._count.users} {dept._count.users === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                    {/* How To Submit Requests — for relevant teams */}
                    {['development', 'marketing', 'sales', 'customer-services'].includes(dept.slug) && (
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">How To Submit Requests</h4>
                        <p className="text-xs text-gray-600 mb-2">
                          For any development, marketing or account-related request, email:{' '}
                          <a href="mailto:customer.services@carma.earth" className="text-green-700 font-medium hover:underline">
                            customer.services@carma.earth
                          </a>
                        </p>
                        <ul className="text-xs text-gray-500 space-y-0.5">
                          <li>• Clear subject line</li>
                          <li>• Summary of request</li>
                          <li>• Desired outcome</li>
                          <li>• Deadline (if applicable)</li>
                          <li>• Supporting documents</li>
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {departments && departments.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3" />
            <p>No departments found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
