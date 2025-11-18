import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/trpc/routers/app'
import { createContext } from '@/server/trpc/context'
import { NextResponse } from 'next/server'

const handler = async (req: Request) => {
  try {
    return await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext,
      onError:
        process.env.NODE_ENV === 'development'
          ? ({ path, error }) => {
              console.error(`❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`)
            }
          : undefined,
    })
  } catch (error) {
    console.error('❌ tRPC handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export { handler as GET, handler as POST }

