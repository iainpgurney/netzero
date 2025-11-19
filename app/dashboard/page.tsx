import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, ArrowRight, ExternalLink, Search, Wrench, Award } from 'lucide-react'
import DashboardClient from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-green-50 to-white">
      <div className="z-10 max-w-6xl w-full mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome back, {session.user?.name ?? 'User'}!</CardTitle>
            <CardDescription>Access all your training courses and resources in one place</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {session.user?.email ?? 'N/A'}
                </p>
              </div>
              <Link href="/dashboard/profile">
                <Button variant="outline">
                  <Award className="w-4 h-4 mr-2" />
                  View My Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Courses and Resources Grid */}
        <DashboardClient />

        {/* Footer */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <p className="text-xs text-gray-500 text-center">
              Based on{' '}
              <a
                href="https://pages.bsigroup.com/l/35972/2023-12-14/3t76lq3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 underline"
              >
                The Little Book of Net Zero
              </a>
              {' '}by BSI Group
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

