import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const pathname = url.pathname
    const searchParams = url.searchParams
    
    // Try to initialize NextAuth
    let nextAuthTest = { status: 'not_tested' }
    try {
      const NextAuth = (await import('next-auth')).default
      const { authOptions } = await import('@/server/auth')
      
      // Try to create handler
      const handler = NextAuth(authOptions)
      nextAuthTest = {
        status: 'handler_created',
        hasHandler: !!handler,
      }
      
      // Try to call handler with a test request
      try {
        const testUrl = new URL('/api/auth/providers', url.origin)
        const testReq = new Request(testUrl.toString(), {
          method: 'GET',
          headers: req.headers,
        })
        
        // Don't actually call it, just verify it exists
        nextAuthTest = {
          ...nextAuthTest,
          handlerType: typeof handler,
          canCall: typeof handler === 'function',
        }
      } catch (callError) {
        nextAuthTest = {
          ...nextAuthTest,
          callError: callError instanceof Error ? callError.message : String(callError),
        }
      }
    } catch (error) {
      nextAuthTest = {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined,
      }
    }
    
    return NextResponse.json({
      success: true,
      request: {
        pathname,
        searchParams: Object.fromEntries(searchParams),
        method: req.method,
      },
      nextAuth: nextAuthTest,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[DEBUG-AUTH] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

