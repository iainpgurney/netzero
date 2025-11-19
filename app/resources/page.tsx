import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import ResourcesClient from './resources-client'

export const dynamic = 'force-dynamic'

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return <ResourcesClient />
}


