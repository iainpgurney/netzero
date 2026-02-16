import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import AuthPageClient from '@/components/auth-page-client'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.warn('Could not get session (database may be unavailable):', error instanceof Error ? error.message : error)
  }

  if (session) {
    redirect('/intranet')
  }

  return (
    <main className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Left Panel - Branding & Module Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Top: Logo & Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-black p-3 rounded-xl shadow-lg">
              <Image
                src="/carma-logo.png"
                alt="Carma Logo"
                width={140}
                height={47}
                priority
                className="h-auto"
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mt-8 leading-tight">
            <span className="text-green-400">Carma</span> LLAMA
          </h1>
          <p className="text-lg text-gray-400 mt-4 max-w-lg">
            Your centralised hub for training, management tools, sustainability certification, and more.
          </p>
        </div>

        {/* Middle: Module Showcase */}
        <div className="relative z-10 space-y-4 my-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-6">Available Modules</p>
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-green-500/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                🎓
              </div>
              <div>
                <h3 className="text-white font-semibold">Training</h3>
                <p className="text-sm text-gray-400">Courses, certifications & professional development</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                📊
              </div>
              <div>
                <h3 className="text-white font-semibold">Management</h3>
                <p className="text-sm text-gray-400">Team management, performance & resource planning</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                🌱
              </div>
              <div>
                <h3 className="text-white font-semibold">BCorp</h3>
                <p className="text-sm text-gray-400">B Corporation certification & impact assessment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Vision / Mission / Carma Way */}
        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-6">
            {/* Our Vision */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">Our Vision</h3>
              <div className="h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-blue-400 mb-3" />
              <p className="text-sm text-gray-400 leading-relaxed">
                The world&apos;s most trusted climate platform
              </p>
            </div>

            {/* Our Mission */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">Our Mission</h3>
              <div className="h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mb-3" />
              <p className="text-sm text-gray-400 leading-relaxed">
                Delivering the verified impact businesses need to drive real change
              </p>
            </div>

            {/* The Carma Way */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">
                The <span className="text-green-400">Carma</span> Way
              </h3>
              <div className="h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-green-400 mb-3" />
              <p className="text-sm text-gray-400 leading-relaxed">
                Building trust and lasting impact through partnerships that put people first
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Google Sign In */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col items-center justify-center p-6 sm:p-12 bg-white lg:rounded-l-3xl">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-black p-2 rounded-lg">
              <Image
                src="/carma-logo.png"
                alt="Carma Logo"
                width={120}
                height={40}
                priority
                className="h-auto"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-green-600">Carma</span> LLAMA
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to access your modules</p>
        </div>

        <div className="w-full max-w-md text-center">
          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Welcome</h2>
            <p className="text-gray-500 mt-2">Sign in to access Carma LLAMA</p>
          </div>
          <AuthPageClient />
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <a
              href="https://www.carma.earth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-500 font-medium"
            >
              Carma
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
