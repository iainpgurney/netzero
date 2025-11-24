import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import AdminDashboardClient from './admin-dashboard-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Admin emails - users with these emails have admin access
const ADMIN_EMAILS = [
  'iain.gurney@gmail.com',
  'iain.gurney@carma.earth',
].map(email => email.toLowerCase())

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing users and courses',
}

export default async function AdminDashboardPage() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      redirect('/')
    }

    const userEmail = session.user.email?.toLowerCase()
    
    // Debug logging
    console.log('[ADMIN PAGE] Checking admin access:', {
      userEmail,
      adminEmails: ADMIN_EMAILS,
      isAdmin: userEmail && ADMIN_EMAILS.includes(userEmail),
      sessionExists: !!session,
    })

    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      console.log('[ADMIN PAGE] Access denied, redirecting to dashboard')
      redirect('/dashboard')
    }

    return <AdminDashboardClient />
  } catch (error) {
    console.error('[ADMIN PAGE] Error:', error)
    redirect('/dashboard')
  }
}

