'use client'

import { useState, useEffect } from 'react'
import SignInButton from './sign-in-button'
import SignUpButton from './sign-up-button'

export default function AuthPageClient() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  // Listen for URL hash changes to switch modes
  useEffect(() => {
    const hash = window.location.hash
    if (hash === '#signup') {
      setMode('signup')
    } else if (hash === '#signin' || hash === '') {
      setMode('signin')
    }
  }, [])

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash === '#signup') {
        setMode('signup')
      } else {
        setMode('signin')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="w-full max-w-md">
      {/* Tabs */}
      <div className="flex mb-4 bg-gray-900 rounded-lg p-1">
        <button
          onClick={() => {
            setMode('signin')
            window.location.hash = ''
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'signin'
              ? 'bg-green-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setMode('signup')
            window.location.hash = 'signup'
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'signup'
              ? 'bg-green-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Form */}
      {mode === 'signin' ? <SignInButton /> : <SignUpButton onSuccess={() => setMode('signin')} />}
    </div>
  )
}

