import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Route handler for /500 - prevents Next.js from generating static 500 page
export async function GET() {
  return NextResponse.json(
    { error: 'Internal Server Error', message: 'Something went wrong' },
    { status: 500 }
  )
}

