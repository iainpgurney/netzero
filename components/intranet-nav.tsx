'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Building,
  Users,
  UsersRound,
  FolderKanban,
  Columns3,
  GraduationCap,
  FileText,
  Shield,
  Menu,
  X,
  Building2,
  Activity,
  ScrollText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import SignOutButton from '@/components/sign-out-button'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ROLE_LABELS } from '@/lib/rbac'

const NAV_ITEMS = [
  { href: '/intranet/company', label: 'Company', icon: Building },
  { href: '/intranet/people', label: 'People', icon: Users },
  { href: '/intranet/teams', label: 'Teams', icon: UsersRound },
  { href: 'https://carma-earth.releasedhub.com/carma-roadmap/roadmap/f106484c', label: 'Roadmap', icon: FolderKanban, external: true },
  { href: '/intranet/boards', label: 'Boards', icon: Columns3 },
  { href: '/intranet/training', label: 'Training', icon: GraduationCap },
  { href: '/intranet/resources', label: 'Resources', icon: FileText },
]

export default function IntranetNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()

  const userRole = session?.user?.role || 'MEMBER'
  const departmentName = session?.user?.departmentName
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'
  const isCsuite = departmentName === 'C-Suite' || isAdmin

  const allItems = [
    ...NAV_ITEMS,
    ...(isCsuite
      ? [{ href: '/intranet/rag', label: 'RAG', icon: Activity }]
      : []),
    ...(isAdmin
      ? [
          { href: '/intranet/audit', label: 'Audit', icon: ScrollText },
          { href: '/dashboard/admin', label: 'Admin', icon: Shield },
        ]
      : []),
  ]

  function isActive(href: string) {
    if (href === '/intranet') return pathname === '/intranet'
    // Training nav item should also highlight for LMS pages (/dashboard, /courses, /resources)
    if (href === '/intranet/training') {
      return pathname === href || (pathname?.startsWith(href + '/') ?? false)
        || (pathname?.startsWith('/dashboard') ?? false)
        || (pathname?.startsWith('/courses') ?? false)
        || pathname === '/resources'
    }
    return pathname === href || (pathname?.startsWith(href + '/') ?? false)
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Desktop */}
      <div className="hidden lg:flex items-center h-14 px-4">
        <div className="flex-shrink-0">
          <Link
            href="/intranet"
            className="flex items-center hover:opacity-90 transition-opacity"
          >
            <div className="bg-black p-1.5 rounded-lg">
              <Image
                src="/carma-logo.png"
                alt="Carma Logo"
                width={80}
                height={27}
                className="h-auto"
                priority
              />
            </div>
          </Link>
        </div>

        <div className="h-8 w-px bg-gray-200 mx-3" />

        <div className="flex items-center gap-0.5 flex-1">
          {allItems.map((item) => {
            const Icon = item.icon
            const active = !('external' in item) && isActive(item.href)
            const btn = (
              <Button
                variant={active ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'rounded-lg h-8 px-2.5 flex items-center gap-1.5 transition-all whitespace-nowrap',
                  active
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium text-xs">{item.label}</span>
              </Button>
            )
            return 'external' in item ? (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                {btn}
              </a>
            ) : (
              <Link key={item.href} href={item.href}>
                {btn}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {departmentName && (
            <span className="hidden xl:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-full">
              <Building2 className="w-3 h-3" />
              {departmentName}
            </span>
          )}
          <span className="hidden xl:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-full">
            <Shield className="w-3 h-3" />
            {ROLE_LABELS[userRole] || 'Member'}
          </span>
          <SignOutButton />
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <Link
              href="/intranet"
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <div className="bg-black p-1.5 rounded-lg flex-shrink-0">
                <Image
                  src="/carma-logo.png"
                  alt="Carma Logo"
                  width={70}
                  height={23}
                  className="h-auto"
                  priority
                />
              </div>
              <span className="text-sm font-bold text-gray-900 truncate">Carma</span>
            </Link>
            <div className="flex items-center gap-2">
              <SignOutButton />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-9 w-9"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-200 py-2 bg-white max-h-[70vh] overflow-y-auto">
            {allItems.map((item) => {
              const Icon = item.icon
              const active = !('external' in item) && isActive(item.href)
              const inner = (
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors',
                    active
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              )
              return 'external' in item ? (
                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>
                  {inner}
                </a>
              ) : (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  {inner}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
