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
  CalendarDays,
  Compass,
  ChevronDown,
  MoreHorizontal,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import SignOutButton from '@/components/sign-out-button'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ROLE_LABELS } from '@/lib/rbac'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
}

type NavGroup = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

function buildNavGroups(
  canAccessTimeOff: boolean,
  isCsuite: boolean,
  isAdmin: boolean
): NavGroup[] {
  const groups: NavGroup[] = [
    {
      label: 'Company',
      icon: Building,
      items: [
        { href: '/intranet/company', label: 'Company', icon: Building },
        { href: '/intranet/people', label: 'People', icon: Users },
        { href: '/intranet/teams', label: 'Teams', icon: UsersRound },
      ],
    },
    {
      label: 'Work',
      icon: Columns3,
      items: [
        { href: '/intranet/boards', label: 'Boards', icon: Columns3 },
        { href: 'https://carma-earth.releasedhub.com/carma-roadmap/roadmap/f106484c', label: 'Roadmap', icon: FolderKanban, external: true },
      ],
    },
    {
      label: 'Learning',
      icon: GraduationCap,
      items: [
        { href: '/intranet/training', label: 'Training', icon: GraduationCap },
        { href: '/intranet/resources', label: 'Resources', icon: FileText },
        { href: '/intranet/impact-alignment', label: 'Impact', icon: Compass },
      ],
    },
    {
      label: 'Leave',
      icon: CalendarDays,
      items: [
        { href: '/intranet/time-off/request', label: 'Request leave', icon: CalendarDays },
        ...(canAccessTimeOff ? [{ href: '/intranet/time-off', label: 'Time Off', icon: CalendarDays }] : []),
      ],
    },
  ]

  const moreItems: NavItem[] = []
  if (isCsuite) moreItems.push({ href: '/intranet/rag', label: 'RAG', icon: Activity })
  if (isAdmin) {
    moreItems.push({ href: '/intranet/raci', label: 'RACI', icon: ClipboardList })
    moreItems.push({ href: '/intranet/audit', label: 'Audit', icon: ScrollText })
    moreItems.push({ href: '/dashboard/admin', label: 'Admin', icon: Shield })
  }
  if (moreItems.length > 0) {
    groups.push({ label: 'More', icon: MoreHorizontal, items: moreItems })
  }

  return groups
}

function NavDropdown({
  group,
  isActive,
}: {
  group: NavGroup
  isActive: (href: string) => boolean
}) {
  const Icon = group.icon
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const groupActive = group.items.some((item) => !('external' in item) && isActive(item.href))

  return (
    <div ref={ref} className="relative">
      <Button
        variant={groupActive ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setOpen(!open)}
        className={cn(
          'rounded-lg h-8 px-2.5 flex items-center gap-1.5 transition-all whitespace-nowrap',
          groupActive
            ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        )}
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="font-medium text-xs">{group.label}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </Button>
      {open && (
        <div className="absolute top-full left-0 mt-1 py-1.5 min-w-[180px] bg-white rounded-lg border border-gray-200 shadow-lg z-50">
          {group.items.map((item) => {
            const ItemIcon = item.icon
            const active = !('external' in item) && isActive(item.href)
            const linkClass = cn(
              'flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'
            )
            const content = (
              <>
                <ItemIcon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </>
            )
            if ('external' in item && item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  {content}
                </a>
              )
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {content}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function IntranetNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const { data: session } = useSession()

  const userRole = session?.user?.role || 'MEMBER'
  const departmentName = session?.user?.departmentName
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'
  const isCsuite = departmentName === 'C-Suite' || isAdmin
  const canAccessTimeOff =
    isAdmin || departmentName === 'C-Suite' || departmentName === 'Finance' || departmentName === 'HR'

  const navGroups = buildNavGroups(canAccessTimeOff, isCsuite, isAdmin)

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

        <div className="flex items-center gap-1 flex-1">
          {navGroups.map((group) => (
            <NavDropdown key={group.label} group={group} isActive={isActive} />
          ))}
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
              className="flex items-center flex-1 min-w-0"
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
            {navGroups.map((group) => {
              const Icon = group.icon
              const expanded = mobileExpanded === group.label
              return (
                <div key={group.label}>
                  <button
                    onClick={() => setMobileExpanded(expanded ? null : group.label)}
                    className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {group.label}
                    </div>
                    <ChevronDown className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')} />
                  </button>
                  {expanded && (
                    <div className="pl-12 pr-4 pb-2 space-y-0.5">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon
                        const active = !('external' in item) && isActive(item.href)
                        const inner = (
                          <div
                            className={cn(
                              'flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors',
                              active
                                ? 'bg-green-50 text-green-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            )}
                          >
                            <ItemIcon className="w-4 h-4" />
                            <span className="font-medium text-sm">{item.label}</span>
                          </div>
                        )
                        if ('external' in item && item.external) {
                          return (
                            <a
                              key={item.href}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {inner}
                            </a>
                          )
                        }
                        return (
                          <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                            {inner}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
