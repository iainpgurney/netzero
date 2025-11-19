import { NextResponse } from 'next/server'

// Prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// Route handler for /404 - returns 404 status without using Pages Router
export async function GET() {
  return new NextResponse('Not Found', { status: 404 })
}

