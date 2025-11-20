'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, User, Menu, X, BookOpen, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import SignOutButton from '@/components/sign-out-button'
import { useState } from 'react'

export default function DashboardNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/courses',
      label: 'Courses',
      icon: BookOpen,
    },
    {
      href: '/resources',
      label: 'Greenwash Audit',
      icon: Search,
    },
    {
      href: '/dashboard/profile',
      label: 'Profile',
      icon: User,
    },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center h-20 w-full">
        {/* Left: Logo - Flush to left edge */}
        <div className="flex-shrink-0 pl-4 lg:pl-6">
          <a 
            href="https://www.carma.earth" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center hover:opacity-90 transition-opacity"
          >
            <div className="bg-black p-2 rounded-lg flex-shrink-0">
              <Image
                src="/carma-logo.png"
                alt="Carma Logo"
                width={100}
                height={33}
                className="h-auto"
                priority
              />
            </div>
          </a>
        </div>

        {/* Center: Text Container - Constrained width to prevent overflow */}
        <div className="flex items-center flex-shrink-0 px-4 min-w-0 max-w-md">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 leading-tight truncate">Carma Root Training Suite</h1>
            <p className="text-xs text-gray-600 leading-tight truncate">
              Learn about the origin, truth, and fundamental principles of sustainability
            </p>
          </div>
        </div>

        {/* Navigation - Between text and sign out */}
        <div className="flex items-center gap-2 flex-1 justify-center min-w-0 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            let isActive = false
            if (item.href === '/dashboard') {
              isActive = pathname === '/dashboard' || (pathname?.startsWith('/dashboard/') ?? false)
            } else if (item.href === '/courses') {
              isActive = pathname === '/courses' || (pathname?.startsWith('/courses/') ?? false)
            } else if (item.href === '/resources') {
              isActive = pathname === '/resources'
            } else {
              isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false)
            }
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'rounded-lg h-10 px-3 flex items-center gap-2 transition-all whitespace-nowrap',
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

        {/* Right: Sign Out - Flush to right edge */}
        <div className="flex-shrink-0 pr-4 lg:pr-6">
          <SignOutButton />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Branding */}
            <a 
              href="https://www.carma.earth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <div className="bg-black p-2 rounded-lg flex-shrink-0">
                <Image
                  src="/carma-logo.png"
                  alt="Carma Logo"
                  width={80}
                  height={27}
                  className="h-auto"
                  priority
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">Carma Root</h1>
                <p className="text-xs text-gray-600 leading-tight truncate">Training Suite</p>
              </div>
            </a>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2">
              <SignOutButton />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Branding */}
            <a 
              href="https://www.carma.earth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <div className="bg-black p-2 rounded-lg flex-shrink-0">
                <Image
                  src="/carma-logo.png"
                  alt="Carma Logo"
                  width={80}
                  height={27}
                  className="h-auto"
                  priority
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">Carma Root</h1>
                <p className="text-xs text-gray-600 leading-tight truncate">Training Suite</p>
              </div>
            </a>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2">
              <SignOutButton />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="border-t border-gray-200 py-2 bg-white">
              {navItems.map((item) => {
                const Icon = item.icon
                let isActive = false
                if (item.href === '/dashboard') {
                  isActive = pathname === '/dashboard' || (pathname?.startsWith('/dashboard/') ?? false)
                } else if (item.href === '/courses') {
                  isActive = pathname === '/courses' || (pathname?.startsWith('/courses/') ?? false)
                } else if (item.href === '/resources') {
                  isActive = pathname === '/resources'
                } else {
                  isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false)
                }
                
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
      </div>
    </nav>
  )
}

