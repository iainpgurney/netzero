import { NextResponse } from 'next/server'

// Prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// Route handler for /500 - returns 500 status without using Pages Router
export async function GET() {
  return new NextResponse('Internal Server Error', { status: 500 })
}

