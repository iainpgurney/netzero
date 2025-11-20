import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test 1: Basic response
    const basicTest = { test: 'basic', timestamp: new Date().toISOString() }
    
    // Test 2: Environment variables
    const envTest = {
      hasNEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NODE_ENV: process.env.NODE_ENV,
      hasGOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      hasGOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    }
    
    // Test 3: Try importing auth module
    let authTest = { status: 'not_tested' }
    try {
      const { authOptions } = await import('@/server/auth')
      authTest = { 
        status: 'success',
        hasProviders: !!authOptions.providers,
        providerCount: authOptions.providers?.length || 0,
      }
    } catch (error) {
      authTest = {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }
    }
    
    // Test 4: Try importing Prisma
    let prismaTest = { status: 'not_tested' }
    try {
      const { prisma } = await import('@/server/db')
      // Try a simple query
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
      ])
      prismaTest = { status: 'success', connected: true }
    } catch (error) {
      prismaTest = {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        connected: false,
      }
    }
    
    return NextResponse.json({
      success: true,
      tests: {
        basic: basicTest,
        environment: envTest,
        authModule: authTest,
        database: prismaTest,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[DEBUG] Error in debug endpoint:', error)
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

