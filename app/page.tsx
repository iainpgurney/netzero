import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/server/auth'
import SignInButton from '@/components/sign-in-button'
import Image from 'next/image'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-sm">
        <div className="flex justify-center mb-8">
          <div className="bg-black p-4 rounded-lg">
            <Image
              src="/carma-logo.png"
              alt="Carma Logo"
              width={180}
              height={60}
              priority
              className="h-auto"
            />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-center mb-8 text-white">Welcome to NetZero</h1>
        <div className="flex justify-center">
          <SignInButton />
        </div>
      </div>
    </main>
  )
}

