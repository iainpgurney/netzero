import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import TimeOffLayoutClient from './time-off-layout-client'

export default async function TimeOffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/')
  }

  const userRole = session.user.role || 'MEMBER'
  const departmentName = session.user.departmentName as string | undefined
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'
  const canAccessTimeOff =
    isAdmin ||
    departmentName === 'C-Suite' ||
    departmentName === 'Finance' ||
    departmentName === 'HR'

  return (
    <TimeOffLayoutClient canAccessTimeOff={canAccessTimeOff}>
      {children}
    </TimeOffLayoutClient>
  )
}
