import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import ModuleClient from './module-client'

export default async function ModulePage({
  params,
}: {
  params: { moduleId: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return <ModuleClient moduleId={params.moduleId} />
}

