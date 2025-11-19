import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Route handler for /404 - prevents Next.js from generating static 404 page
export async function GET() {
  return NextResponse.json(
    { error: 'Not Found', message: 'The requested page does not exist' },
    { status: 404 }
  )
}

