'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { LayoutGrid, User, Menu, X, Shield, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import SignOutButton from '@/components/sign-out-button'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ROLE_LABELS } from '@/lib/rbac'

export default function HubNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const userRole = session?.user?.role || 'MEMBER'
  const departmentName = session?.user?.departmentName
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN'

  const navItems = [
    {
      href: '/hub',
      label: 'Module Hub',
      icon: LayoutGrid,
    },
    {
      href: '/dashboard/profile',
      label: 'Profile',
      icon: User,
    },
    ...(isAdmin
      ? [
          {
            href: '/dashboard/admin',
            label: 'Admin',
            icon: Shield,
          },
        ]
      : []),
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center h-16 px-6">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link
            href="/intranet"
            className="flex items-center hover:opacity-90 transition-opacity"
          >
            <div className="bg-black p-2 rounded-lg flex-shrink-0">
              <Image
                src="/carma-logo.png"
                alt="Carma Logo"
                width={90}
                height={30}
                className="h-auto"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Center-left: Title */}
        <div className="flex items-center ml-4 mr-6">
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Company Resource Platform
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1 flex-1 justify-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/hub'
                ? pathname === '/hub'
                : pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false)

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'rounded-lg h-9 px-3 flex items-center gap-2 transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Right: User info + Sign Out */}
        <div className="flex items-center gap-3 flex-shrink-0">
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

      {/* Mobile Header */}
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
              <span className="text-sm font-bold text-gray-900 truncate">Resource Platform</span>
            </Link>

            <div className="flex items-center gap-2">
              <SignOutButton />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden h-9 w-9"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-200 py-2 bg-white">
            {/* User info */}
            <div className="px-4 py-2 mb-1 border-b border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                {departmentName && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-full">
                    <Building2 className="w-3 h-3" />
                    {departmentName}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-full">
                  <Shield className="w-3 h-3" />
                  {ROLE_LABELS[userRole] || 'Member'}
                </span>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/hub'
                  ? pathname === '/hub'
                  : pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 transition-colors',
                      isActive
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
