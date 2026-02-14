import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import AdminDashboardClient from './admin-dashboard-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing users, departments, and module access',
}

export default async function AdminDashboardPage() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      redirect('/')
    }

    const userRole = session.user.role || 'MEMBER'

    // Only ADMIN and SUPER_ADMIN can access
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      console.log('[ADMIN PAGE] Access denied - insufficient role:', userRole)
      redirect('/hub')
    }

    return <AdminDashboardClient />
  } catch (error) {
    console.error('[ADMIN PAGE] Error:', error)
    redirect('/hub')
  }
}
