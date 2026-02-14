import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'

export default async function RagLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/')
  }

  // RAG is restricted to C-Suite, Admins, and Super Admins only
  const role = session.user?.role as string | undefined
  const deptName = session.user?.departmentName as string | undefined
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN'
  const isCsuite = deptName === 'C-Suite'

  if (!isAdmin && !isCsuite) {
    redirect('/intranet')
  }

  return <>{children}</>
}
