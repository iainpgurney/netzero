import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import CertificateClient from './certificate-client'

export const dynamic = 'force-dynamic'

export default async function CertificatePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return <CertificateClient />
}

