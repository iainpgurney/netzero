import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Don't expose secrets, but show if they're set
  const diagnostics = {
    hasNEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_SECRET_LENGTH: process.env.NEXTAUTH_SECRET?.length || 0,
    hasGOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_ID_STARTS: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) || 'NOT SET',
    GOOGLE_CLIENT_ID_LENGTH: process.env.GOOGLE_CLIENT_ID?.length || 0,
    hasGOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_SECRET_LENGTH: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
    NODE_ENV: process.env.NODE_ENV,
    // Check for common issues
    issues: [] as string[],
  }

  // Check for common issues
  if (!diagnostics.hasNEXTAUTH_URL) {
    diagnostics.issues.push('NEXTAUTH_URL is not set')
  } else if (diagnostics.NEXTAUTH_URL.includes('localhost') && process.env.NODE_ENV === 'production') {
    diagnostics.issues.push('NEXTAUTH_URL contains localhost in production!')
  }

  if (!diagnostics.hasNEXTAUTH_SECRET) {
    diagnostics.issues.push('NEXTAUTH_SECRET is not set')
  } else if (diagnostics.NEXTAUTH_SECRET_LENGTH < 32) {
    diagnostics.issues.push(`NEXTAUTH_SECRET is too short (${diagnostics.NEXTAUTH_SECRET_LENGTH} chars, need 32+)`)
  }

  if (!diagnostics.hasGOOGLE_CLIENT_ID) {
    diagnostics.issues.push('GOOGLE_CLIENT_ID is not set')
  }

  if (!diagnostics.hasGOOGLE_CLIENT_SECRET) {
    diagnostics.issues.push('GOOGLE_CLIENT_SECRET is not set')
  } else if (diagnostics.GOOGLE_CLIENT_SECRET_LENGTH < 30) {
    diagnostics.issues.push(`GOOGLE_CLIENT_SECRET seems unusually short (${diagnostics.GOOGLE_CLIENT_SECRET_LENGTH} chars)`)
  }

  // Check for whitespace or quotes
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (clientId) {
    if (clientId.includes(' ')) {
      diagnostics.issues.push('GOOGLE_CLIENT_ID contains spaces (should be trimmed)')
    }
    if (clientId.startsWith('"') || clientId.startsWith("'")) {
      diagnostics.issues.push('GOOGLE_CLIENT_ID starts with quotes (remove quotes)')
    }
  }
  if (clientSecret) {
    if (clientSecret.includes(' ')) {
      diagnostics.issues.push('GOOGLE_CLIENT_SECRET contains spaces (should be trimmed)')
    }
    if (clientSecret.startsWith('"') || clientSecret.startsWith("'")) {
      diagnostics.issues.push('GOOGLE_CLIENT_SECRET starts with quotes (remove quotes)')
    }
  }

  return NextResponse.json(diagnostics, { status: diagnostics.issues.length > 0 ? 200 : 200 })
}

