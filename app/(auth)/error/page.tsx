import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">Authentication Error</h1>
        <p className="text-center mb-8 text-muted-foreground">
          There was an error signing in. Please try again.
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

