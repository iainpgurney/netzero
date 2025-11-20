import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Diagnostic endpoint to check OAuth configuration
 * Visit: https://netzero-gecrc.ondigitalocean.app/api/oauth-check
 */
export async function GET() {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
    const nextAuthUrl = process.env.NEXTAUTH_URL?.trim()

    // Show first 20 chars and last 10 chars of Client ID for verification
    const clientIdPreview = googleClientId
      ? `${googleClientId.substring(0, 20)}...${googleClientId.substring(googleClientId.length - 10)}`
      : 'NOT SET'

    return NextResponse.json({
      success: true,
      oauth: {
        clientId: {
          set: !!googleClientId,
          preview: clientIdPreview,
          length: googleClientId?.length || 0,
          // Show the full Client ID (safe to expose - it's public)
          full: googleClientId || 'NOT SET',
        },
        clientSecret: {
          set: !!googleClientSecret,
          length: googleClientSecret?.length || 0,
          // Don't expose the secret, just confirm it exists
        },
        nextAuthUrl: nextAuthUrl || 'NOT SET',
        expectedRedirectUri: nextAuthUrl
          ? `${nextAuthUrl}/api/auth/callback/google`
          : 'NOT SET (NEXTAUTH_URL missing)',
      },
      instructions: {
        step1: 'Copy the "full" Client ID above',
        step2: 'Go to Google Cloud Console → APIs & Services → Credentials',
        step3: 'Find the OAuth Client ID that matches the "full" value above',
        step4: 'Verify that Client ID has this redirect URI:',
        redirectUri: nextAuthUrl
          ? `${nextAuthUrl}/api/auth/callback/google`
          : 'Set NEXTAUTH_URL first',
        step5: 'If the Client ID doesn\'t match, update GOOGLE_CLIENT_ID in DigitalOcean',
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

