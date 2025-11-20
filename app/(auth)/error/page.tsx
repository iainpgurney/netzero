export const dynamic = 'force-dynamic'

interface AuthErrorPageProps {
  searchParams: { error?: string }
}

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const error = searchParams?.error || null

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
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Sign In Error
        </h1>
        <p style={{ color: '#374151', marginBottom: '0.5rem' }}>{errorMessage}</p>
        {errorDetails && (
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
            {errorDetails}
          </p>
        )}
        {error && (
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
            Error code: {error}
          </p>
        )}
        <div style={{ marginTop: '1.5rem' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#2563EB',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.375rem',
              fontWeight: '500'
            }}
          >
            Return to Sign In
          </a>
        </div>
      </div>
    </div>
  )
}
