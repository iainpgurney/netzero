import NextAuth from 'next-auth'
import { authOptions } from '@/server/auth'
import { NextRequest } from 'next/server'

const handler = NextAuth(authOptions)

export async function GET(req: NextRequest) {
  try {
    return await handler(req)
  } catch (error) {
    console.error('[AUTH ROUTE] GET error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Authentication failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handler(req)
  } catch (error) {
    console.error('[AUTH ROUTE] POST error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Authentication failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

