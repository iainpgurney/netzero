'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function SignOutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: '/' })}
      variant="outline"
      className="text-sm"
    >
      Sign Out
    </Button>
  )
}

