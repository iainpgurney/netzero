'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function SignInButton() {
  const [email, setEmail] = useState('demo@netzero.com')
  const [password, setPassword] = useState('demo123')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dashboard',
        redirect: false,
      })

      console.log('Sign in result:', result)

      if (result?.error) {
        console.error('Login error details:', result)
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else {
          setError(`Login failed: ${result.error}. Check browser console and server logs for details.`)
        }
      } else if (result?.ok) {
        console.log('Login successful! Redirecting...')
        window.location.href = '/dashboard'
      } else {
        console.error('Unexpected login result:', result)
        setError('Login failed. Please check your credentials and try again.')
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError(`An error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Use the demo account to access the Learning Hub</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <div className="text-xs text-gray-500 text-center mt-4 space-y-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="font-semibold text-blue-900 mb-2">Demo Account Credentials:</p>
              <div className="space-y-1 text-blue-800">
                <p><strong>Email:</strong> demo@netzero.com</p>
                <p><strong>Password:</strong> demo123</p>
              </div>
            </div>
            <div className="p-2 bg-green-50 border border-green-200 rounded text-green-800">
              <p className="font-semibold">✅ Ready to Login!</p>
              <p className="text-xs">The demo account is set up and ready to use.</p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

