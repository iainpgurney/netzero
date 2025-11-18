import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import LearningHubClient from './learning-hub-client'

export default async function LearningHubPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return <LearningHubClient />
}

