import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Prevent static generation - this page must be rendered at runtime
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">404 - Page Not Found</h1>
        <p className="text-center mb-8 text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

