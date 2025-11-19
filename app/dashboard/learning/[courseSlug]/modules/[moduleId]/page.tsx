import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import ModuleClient from '../../../modules/[moduleId]/module-client'

export default async function CourseModulePage({
  params,
}: {
  params: { courseSlug: string; moduleId: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return <ModuleClient moduleId={params.moduleId} />
}


