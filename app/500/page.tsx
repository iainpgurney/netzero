'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

// CRITICAL: Prevent static generation - this must be dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export default function ServerErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">500 - Server Error</h1>
        <p className="text-center mb-8 text-muted-foreground">
          Something went wrong on our end. Please try again later.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => window.location.reload()}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

