import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import SignOutButton from '@/components/sign-out-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, ArrowRight, ExternalLink } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-black p-3 rounded-lg">
              <Image
                src="/carma-logo.png"
                alt="Carma Logo"
                width={140}
                height={47}
                className="h-auto"
              />
            </div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
          </div>
          <SignOutButton />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome back!</CardTitle>
            <CardDescription>You are successfully authenticated.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {session.user?.name ?? 'N/A'}
              </p>
              <p>
                <strong>Email:</strong> {session.user?.email ?? 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Net Zero Learning Hub
            </CardTitle>
            <CardDescription>
              Interactive tutorial and guide for businesses learning about net zero
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Transform BSI's Little Book of Net Zero into an engaging, interactive learning
              experience. Complete 7 modules covering net zero fundamentals, UK's journey, energy
              efficiency, transition management, standards, case studies, and action planning.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/learning">
                <Button>
                  Go to Learning Hub
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/little-book-of-net-zero">
                <Button variant="outline">
                  Learn About The Little Book of Net Zero
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-4">
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

