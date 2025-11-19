'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { Download, Share2, ArrowLeft, Award, Printer } from 'lucide-react'
import { useRef } from 'react'

interface ModuleCertificateClientProps {
  moduleId: string
  courseSlug: string
}

export default function ModuleCertificateClient({ moduleId, courseSlug }: ModuleCertificateClientProps) {
  const certificateRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const shouldAutoPrint = searchParams?.get('print') === 'true'
  
  const { data: certificate, isLoading } = trpc.learning.getModuleCertificate.useQuery({ moduleId })
  const generateCertificate = trpc.learning.generateModuleCertificate.useMutation()
  const utils = trpc.useUtils()

  // Auto-generate certificate if it doesn't exist
  useEffect(() => {
    if (!isLoading && !certificate && !generateCertificate.isLoading) {
      const storedBusinessName = typeof window !== 'undefined' 
        ? localStorage.getItem(`businessName_${courseSlug}`) 
        : null
      
      generateCertificate.mutate(
        {
          moduleId,
          businessName: storedBusinessName || undefined,
        },
        {
          onSuccess: () => {
            utils.learning.getModuleCertificate.invalidate({ moduleId })
          },
        }
      )
    }
  }, [isLoading, certificate, moduleId, courseSlug, generateCertificate, utils])

  // Auto-print when print=true is in URL
  useEffect(() => {
    if (shouldAutoPrint && certificate && !isLoading && !generateCertificate.isLoading) {
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [shouldAutoPrint, certificate, isLoading, generateCertificate.isLoading])

  const handleGenerate = async () => {
    // Get business name from localStorage if available
    const storedBusinessName = typeof window !== 'undefined' 
      ? localStorage.getItem(`businessName_${courseSlug}`) 
      : null
    
    await generateCertificate.mutateAsync({ 
      moduleId,
      businessName: storedBusinessName || undefined,
    })
    await utils.learning.getModuleCertificate.invalidate({ moduleId })
  }

  const handleDownload = () => {
    if (!certificateRef.current) return

    // Create a canvas to render the certificate
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1200
    canvas.height = 800

    // Draw background
    ctx.fillStyle = '#f0fdf4'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw border
    ctx.strokeStyle = '#16a34a'
    ctx.lineWidth = 8
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

    // Draw title
    ctx.fillStyle = '#15803d'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Certificate of Completion', canvas.width / 2, 150)

    // Draw module title
    ctx.fillStyle = '#166534'
    ctx.font = '32px Arial'
    const moduleTitle = certificate?.module?.title || 'Module'
    ctx.fillText(moduleTitle, canvas.width / 2, 220)

    // Draw name
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 36px Arial'
    ctx.fillText(
      `This is to certify that ${certificate?.user.name || 'the participant'}`,
      canvas.width / 2,
      320
    )

    // Draw completion text
    ctx.fillText(
      `has successfully completed`,
      canvas.width / 2,
      380
    )
    ctx.fillText(
      moduleTitle,
      canvas.width / 2,
      430
    )

    // Draw date
    ctx.fillStyle = '#6b7280'
    ctx.font = '24px Arial'
    const date = certificate?.issuedAt
      ? new Date(certificate.issuedAt).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
    ctx.fillText(`Issued on ${date}`, canvas.width / 2, 550)

    // Draw badge
    ctx.font = '80px Arial'
    ctx.fillText('🌍', canvas.width / 2, 680)

    // Convert to image and download
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'module-certificate.png'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Carma Root Certificate',
          text: `I've completed ${certificate?.module?.title || 'a module'}! 🌍`,
          url: window.location.href,
        })
      } catch (err) {
        // Error sharing - user can try again
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('Certificate link copied to clipboard!')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading || generateCertificate.isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <div className="max-w-4xl w-full">Loading certificate...</div>
      </main>
    )
  }

  if (!certificate && !generateCertificate.isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl w-full">
          <Link href={`/dashboard/learning/${courseSlug}/modules/${moduleId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Module
            </Button>
          </Link>
          <Card>
            <CardHeader>
              <CardTitle>Certificate Not Available</CardTitle>
              <CardDescription>
                Complete this module to generate your certificate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGenerate} disabled={generateCertificate.isLoading}>
                {generateCertificate.isLoading ? 'Generating...' : 'Generate Certificate'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const issuedDate = certificate.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .certificate-container {
            page-break-after: avoid;
            page-break-inside: avoid;
            margin: 0;
            padding: 2cm;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .certificate-content {
            border: 0.5cm solid #16a34a !important;
            padding: 2cm;
            min-height: 21cm;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        }
      `}</style>

      <main className="flex min-h-screen flex-col items-center p-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl w-full">
          <div className="no-print mb-6">
            <Link href={`/dashboard/learning/${courseSlug}/modules/${moduleId}`}>
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Module
              </Button>
            </Link>
          </div>

          {/* Certificate */}
          <div
            ref={certificateRef}
            className="certificate-container bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-600 rounded-lg p-12 shadow-2xl mb-6 relative"
          >
            <div className="certificate-content text-center space-y-6 relative">
              {/* Decorative border elements */}
              <div className="absolute top-4 left-4 w-16 h-16 border-4 border-green-600 rounded-full opacity-20"></div>
              <div className="absolute top-4 right-4 w-16 h-16 border-4 border-green-600 rounded-full opacity-20"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 border-4 border-green-600 rounded-full opacity-20"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 border-4 border-green-600 rounded-full opacity-20"></div>

              {/* Carma Logo */}
              <div className="flex justify-center mb-4">
                <div className="bg-black p-3 rounded-lg">
                  <Image
                    src="/carma-logo.png"
                    alt="Carma Logo"
                    width={180}
                    height={60}
                    className="h-auto"
                  />
                </div>
              </div>

              {/* Certificate Header */}
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <Award className="w-20 h-20 text-green-600" />
                </div>
              </div>

              <h1 className="text-5xl font-bold text-green-800 mb-2">
                Certificate of Completion
              </h1>
              
              <h2 className="text-3xl text-green-700 mb-8">
                {certificate?.module?.title || 'Module'}
              </h2>

              {/* Decorative line */}
              <div className="flex items-center justify-center my-8">
                <div className="w-24 h-1 bg-green-600"></div>
                <div className="mx-4 text-green-600 text-2xl">✦</div>
                <div className="w-24 h-1 bg-green-600"></div>
              </div>

              {/* Certificate Body */}
              <div className="space-y-4 my-8">
                <p className="text-2xl text-gray-700">
                  This is to certify that
                </p>
                <p className="text-4xl font-bold text-gray-900 my-6">
                  {certificate.user.name || 'Participant'}
                </p>
                {certificate.businessName && (
                  <p className="text-2xl text-gray-700 font-semibold mb-4">
                    {certificate.businessName}
                  </p>
                )}
                <p className="text-xl text-gray-700 leading-relaxed">
                  has successfully completed
                </p>
                <p className="text-xl text-gray-700 mb-8">
                  {certificate?.module?.title || 'this module'} of the {certificate?.course?.title || 'Carma Root Training Suite'}
                </p>
              </div>

              {/* Earth Icon */}
              <div className="text-8xl my-8">🌍</div>

              {/* Date */}
              <div className="mt-8 pt-8 border-t-2 border-green-300">
                <p className="text-lg text-gray-600">
                  Issued on {issuedDate}
                </p>
              </div>

              {/* Certificate ID */}
              <div className="mt-6 text-sm text-gray-500">
                Certificate ID: {certificate.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <Card className="no-print">
            <CardHeader>
              <CardTitle>Share Your Achievement</CardTitle>
              <CardDescription>
                Print, download, or share your certificate to celebrate your completion!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 flex-wrap">
              <Button onClick={handlePrint} className="flex-1 min-w-[150px]">
                <Printer className="w-4 h-4 mr-2" />
                Print Certificate
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1 min-w-[150px]">
                <Download className="w-4 h-4 mr-2" />
                Download as Image
              </Button>
              <Button onClick={handleShare} variant="outline" className="flex-1 min-w-[150px]">
                <Share2 className="w-4 h-4 mr-2" />
                Share Certificate
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

