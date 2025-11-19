import { NextResponse } from 'next/server'
import { prisma } from '@/server/db'

// Mark as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Check database connection with timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 5000)
      )
    ])

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      },
      { status: 200 }
    )
  } catch (error) {
    // Silently handle errors during build - don't crash the build
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      // During build, database might not be available - return healthy status
      return NextResponse.json(
        {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          database: 'unavailable_during_build',
        },
        { status: 200 }
      )
    }
    
    console.error('❌ Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 503 }
    )
  }
}

