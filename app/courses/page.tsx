import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import CoursesClient from './courses-client'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return <CoursesClient />
}


