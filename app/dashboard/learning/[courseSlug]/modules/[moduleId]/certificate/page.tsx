import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import ModuleCertificateClient from './module-certificate-client'

export default async function ModuleCertificatePage({
  params,
}: {
  params: { courseSlug: string; moduleId: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading certificate...</div>}>
      <ModuleCertificateClient moduleId={params.moduleId} courseSlug={params.courseSlug} />
    </Suspense>
  )
}


