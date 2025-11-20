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
  handler = NextAuth(authOptions)
} catch (error) {
  console.error('[AUTH ROUTE] Failed to initialize NextAuth:', error)
  // Create a fallback handler that returns errors
  handler = ((req: any) => {
    return new Response(
      JSON.stringify({ error: 'Authentication service unavailable', message: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }) as any
}

// Wrap handlers to detect URL from request if NEXTAUTH_URL is not set
async function handleRequest(req: NextRequest, method: 'GET' | 'POST') {
  try {
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
    
    return await handler(req as any)
  } catch (error) {
    console.error('[AUTH ROUTE] Error handling request:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Authentication request failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
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

