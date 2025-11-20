'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  let errorMessage = 'An error occurred during sign in.'
  let errorDetails = ''

  if (error === 'AccessDenied') {
    errorMessage = 'Access denied. Your email domain is not authorized.'
    errorDetails = 'Please contact your administrator to request access.'
  } else if (error === 'Configuration') {
    errorMessage = 'There is a problem with the server configuration.'
    errorDetails = 'Check your environment variables. This is a server-side issue.'
  } else if (error === 'Callback') {
    errorMessage = 'There was an error during the authentication callback.'
    errorDetails = 'Check your redirect URIs in Google Cloud Console match exactly.'
  } else if (error === 'OAuthSignin') {
    errorMessage = 'Error occurred while trying to sign in with Google.'
    errorDetails = 'Verify your OAuth credentials are correct.'
  } else if (error === 'OAuthCallback') {
    errorMessage = 'Error occurred in the OAuth callback.'
    errorDetails = 'Check your redirect URIs match exactly in Google Cloud Console.'
  } else if (error === 'OAuthCreateAccount') {
    errorMessage = 'Could not create OAuth account.'
    errorDetails = 'There was an issue creating your account.'
  } else if (error === 'EmailCreateAccount') {
    errorMessage = 'Could not create email account.'
    errorDetails = 'There was an issue creating your account.'
  } else if (error === 'EmailSignin') {
    errorMessage = 'Error sending email.'
    errorDetails = 'There was an issue sending the sign-in email.'
  } else if (error === 'CredentialsSignin') {
    errorMessage = 'Invalid credentials.'
    errorDetails = 'The email or password you entered is incorrect.'
  } else if (error === 'SessionRequired') {
    errorMessage = 'Session required.'
    errorDetails = 'Please sign in to access this page.'
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">Sign In Error</h1>
        <p className="text-gray-600">{errorMessage}</p>
        {errorDetails && <p className="text-sm text-gray-500">{errorDetails}</p>}
        {error && <p className="text-xs text-gray-400 mt-2">Error code: {error}</p>}
        <div className="pt-4">
          <Link href="/">
            <Button>Return to Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}

