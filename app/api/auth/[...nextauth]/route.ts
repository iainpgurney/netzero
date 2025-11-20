import NextAuth from 'next-auth'
import { authOptions } from '@/server/auth'
import { NextRequest } from 'next/server'

// Log NEXTAUTH_URL at module load time for debugging
// This helps identify if environment variables are set correctly
let nextAuthUrl = process.env.NEXTAUTH_URL?.trim()
console.log('[AUTH ROUTE] NEXTAUTH_URL:', nextAuthUrl || 'NOT SET')
console.log('[AUTH ROUTE] NODE_ENV:', process.env.NODE_ENV)
console.log('[AUTH ROUTE] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing')

// Warn if NEXTAUTH_URL is not set or contains localhost in production
if (process.env.NODE_ENV === 'production') {
  if (!nextAuthUrl) {
    console.error('[AUTH ROUTE] ⚠️ CRITICAL: NEXTAUTH_URL is not set in production!')
    console.error('[AUTH ROUTE] OAuth callbacks will fail. Set NEXTAUTH_URL in DigitalOcean.')
  } else if (nextAuthUrl.includes('localhost')) {
    console.error('[AUTH ROUTE] ⚠️ CRITICAL: NEXTAUTH_URL contains localhost in production!')
    console.error('[AUTH ROUTE] Current value:', nextAuthUrl)
    console.error('[AUTH ROUTE] Should be: https://netzero-gecrc.ondigitalocean.app')
  }
}

let handler: ReturnType<typeof NextAuth>

try {
  console.log('[AUTH ROUTE] Initializing NextAuth...')
  handler = NextAuth(authOptions)
  console.log('[AUTH ROUTE] NextAuth initialized successfully')
} catch (error) {
  console.error('[AUTH ROUTE] Failed to initialize NextAuth:', error)
  console.error('[AUTH ROUTE] Error details:', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  })
  // Create a fallback handler that returns errors
  handler = ((req: any) => {
    console.error('[AUTH ROUTE] Using fallback handler due to initialization failure')
    return new Response(
      JSON.stringify({ 
        error: 'Authentication service unavailable', 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'NextAuth failed to initialize. Check server logs.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }) as any
}

// Wrap handlers to detect URL from request if NEXTAUTH_URL is not set
async function handleRequest(req: NextRequest, method: 'GET' | 'POST') {
  try {
    console.log(`[AUTH ROUTE] Handling ${method} request to:`, req.nextUrl.pathname)
    
    // In production, if NEXTAUTH_URL is not set, try to detect from request
    if (process.env.NODE_ENV === 'production' && !nextAuthUrl) {
      const host = req.headers.get('host')
      const protocol = req.headers.get('x-forwarded-proto') || req.headers.get('x-forwarded-ssl') === 'on' ? 'https' : 'http'
      
      if (host && !host.includes('localhost')) {
        const detectedUrl = `${protocol}://${host}`
        console.log('[AUTH ROUTE] Auto-detecting NEXTAUTH_URL from request:', detectedUrl)
        // Set temporarily for this request (NextAuth reads it at runtime)
        process.env.NEXTAUTH_URL = detectedUrl
      }
    }
    
    console.log('[AUTH ROUTE] Calling NextAuth handler...')
    // NextAuth expects a standard Request object
    // In App Router, NextRequest extends Request, so we can pass it directly
    const response = await handler(req)
    console.log('[AUTH ROUTE] NextAuth handler returned response with status:', response.status)
    return response
  } catch (error) {
    console.error('[AUTH ROUTE] Error handling request:', error)
    console.error('[AUTH ROUTE] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 10).join('\n') : undefined,
      requestPath: req.nextUrl.pathname,
      requestMethod: req.method,
    })
    return new Response(
      JSON.stringify({ 
        error: 'Authentication request failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        path: req.nextUrl.pathname,
        method: req.method,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req, 'GET')
}

export async function POST(req: NextRequest) {
  return handleRequest(req, 'POST')
}

