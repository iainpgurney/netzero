import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import CertificateClient from '../../certificate/certificate-client'

export default async function CourseCertificatePage({
  params,
}: {
  params: { courseSlug: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading certificate...</div>}>
      <CertificateClient courseSlug={params.courseSlug} />
    </Suspense>
  )
}

