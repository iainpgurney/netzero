import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import NextAuthSessionProvider from './session-provider'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
})

export const metadata: Metadata = {
  title: 'Carma Root',
  description: 'Learn about the origin, truth, and fundamental principles of sustainability',
}

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} font-sans`}>
        <NextAuthSessionProvider>
          <Providers>{children}</Providers>
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}

