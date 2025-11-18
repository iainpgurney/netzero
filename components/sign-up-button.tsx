'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface SignUpButtonProps {
  onSuccess?: () => void
}

export default function SignUpButton({ onSuccess }: SignUpButtonProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const register = trpc.user.register.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const result = await register.mutateAsync({
        name,
        email,
        password,
      })

      if (result.success) {
        setSuccess(true)
        // Clear form
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        // Call onSuccess callback if provided
        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 2000) // Wait 2 seconds before switching
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Created!</CardTitle>
          <CardDescription>Your account has been successfully created</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 mb-4">
            <p className="font-semibold mb-2">✅ Success!</p>
            <p className="text-sm">
              You can now sign in with your email and password.
            </p>
          </div>
          <Button
            onClick={() => {
              setSuccess(false)
              if (onSuccess) {
                onSuccess()
              } else {
                window.location.hash = 'signin'
                window.location.reload()
              }
            }}
            className="w-full"
            size="lg"
          >
            Go to Sign In
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Sign up to access the Net Zero Learning Hub</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              minLength={2}
            />
          </div>
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
              minLength={6}
            />
            <p className="text-xs text-gray-500">Must be at least 6 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our terms of service and privacy policy.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

