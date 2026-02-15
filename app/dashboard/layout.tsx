import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import IntranetNav from '@/components/intranet-nav'
import HelperButton from '@/components/helper-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  return (
    <>
      <IntranetNav />
      {children}
      <HelperButton />
    </>
  )
}

