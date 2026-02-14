'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { PostHogProvider } from '@/components/posthog-provider'

function getBaseUrl() {
  if (typeof window !== 'undefined') return ''
  // Use NEXTAUTH_URL in production, fallback to VERCEL_URL or localhost for development
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 60 seconds — reduces re-fetches on navigation
            cacheTime: 10 * 60 * 1000, // 10 minutes (React Query v4)
            refetchOnWindowFocus: false,
            // refetchOnMount: true (default) — required for reliable navigation
          },
        },
      })
  )
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    })
  )

  return (
    <PostHogProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </trpc.Provider>
    </PostHogProvider>
  )
}

