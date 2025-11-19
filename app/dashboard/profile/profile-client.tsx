'use client'

import { useEffect } from 'react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Award, Calendar, BookOpen, Printer } from 'lucide-react'

export default function ProfileClient() {
  const { data: badges, isLoading: badgesLoading } = trpc.learning.getUserBadges.useQuery()
  const { data: certificates, isLoading: certificatesLoading, error: certificatesError } = trpc.learning.getUserCertificates.useQuery()
  const generateMissingCertificates = trpc.learning.generateMissingCertificates.useMutation()
  const utils = trpc.useUtils()

  const isLoading = badgesLoading || certificatesLoading

  // Debug logging
  if (typeof window !== 'undefined' && certificates) {
    console.log('Certificates data:', certificates)
    console.log('Certificates count:', certificates.length)
  }
  if (certificatesError) {
    console.error('Certificates error:', certificatesError)
  }

  // Auto-generate missing certificates on mount
  useEffect(() => {
    if (!isLoading && !certificatesError) {
      generateMissingCertificates.mutate(undefined, {
        onSuccess: (result) => {
          if (result.created > 0) {
            console.log(`Generated ${result.created} missing certificate(s)`)
            utils.learning.getUserCertificates.invalidate()
          }
        },
        onError: (error) => {
          console.error('Error generating missing certificates:', error)
        },
      })
    }
  }, [isLoading, certificatesError, generateMissingCertificates, utils])

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-green-50 to-white">
      <div className="z-10 max-w-6xl w-full mx-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600 text-base sm:text-lg">View your achievements and certificates</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading your achievements...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Badges Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-600" />
                  Badges Earned
                </CardTitle>
                <CardDescription>
                  {badges && badges.length > 0
                    ? `You've earned ${badges.length} badge${badges.length !== 1 ? 's' : ''}`
                    : 'Complete modules to earn badges!'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {badges && badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges
                      .filter((badge) => badge.module) // Filter out badges with missing modules
                      .map((badge) => (
                        <div
                          key={badge.id}
                          className="p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors flex flex-col h-full"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-4xl flex-shrink-0">
                              {badge.module?.badgeEmoji || '🏆'}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {badge.module?.badgeName || 'Badge'}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {badge.module?.title || 'Module'}
                              </p>
                              <p className="text-xs text-gray-500 mb-3">
                                {badge.module?.course?.title || 'Course'}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  Earned {new Date(badge.earnedAt).toLocaleDateString('en-GB', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No badges earned yet</p>
                    <Link href="/dashboard">
                      <Button>Start Learning</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certificates Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-green-600" />
                  Certificates
                </CardTitle>
                <CardDescription>
                  {certificates && certificates.length > 0
                    ? `You have ${certificates.length} certificate${certificates.length !== 1 ? 's' : ''}`
                    : 'Complete courses to earn certificates!'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {certificatesError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">Error loading certificates: {certificatesError.message}</p>
                  </div>
                )}
                {certificates && certificates.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const validCertificates = certificates.filter((cert) => cert.course)
                      const invalidCertificates = certificates.filter((cert) => !cert.course)
                      
                      if (invalidCertificates.length > 0) {
                        console.warn(`Found ${invalidCertificates.length} certificate(s) without course data:`, invalidCertificates)
                      }
                      
                      if (validCertificates.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">No valid certificates found</p>
                            <p className="text-sm text-gray-500">
                              Found {certificates.length} certificate(s) but none have valid course data.
                            </p>
                          </div>
                        )
                      }
                      
                      return validCertificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="p-6 border-2 border-green-200 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors flex flex-col"
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div className="bg-green-100 rounded-full p-3 flex-shrink-0">
                              <Award className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                              <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                                {cert.module ? (
                                  <>
                                    {cert.module.title} - Module Certificate
                                  </>
                                ) : (
                                  <>
                                    {cert.course?.title || 'Course'} - Course Certificate
                                  </>
                                )}
                              </h3>
                              {cert.businessName && (
                                <p className="text-sm text-gray-700 mb-2">
                                  <strong>Business:</strong> {cert.businessName}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" />
                                  <span>{cert.course?.title || 'Course'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-auto pt-4 flex gap-2">
                                {cert.module && cert.course?.slug ? (
                                  <Link
                                    href={`/dashboard/learning/${cert.course.slug}/modules/${cert.module.id}/certificate?print=true`}
                                    className="flex-1"
                                  >
                                    <Button size="sm" variant="default" className="w-full">
                                      <Printer className="w-4 h-4 mr-2" />
                                      Print Certificate
                                    </Button>
                                  </Link>
                                ) : cert.course?.slug ? (
                                  <Link
                                    href={`/dashboard/learning/${cert.course.slug}/certificate?print=true`}
                                    className="flex-1"
                                  >
                                    <Button size="sm" variant="default" className="w-full">
                                      <Printer className="w-4 h-4 mr-2" />
                                      Print Certificate
                                    </Button>
                                  </Link>
                                ) : null}
                                {cert.module && cert.course?.slug ? (
                                  <Link
                                    href={`/dashboard/learning/${cert.course.slug}/modules/${cert.module.id}/certificate`}
                                    className="flex-1"
                                  >
                                    <Button size="sm" variant="outline" className="w-full">
                                      View Certificate
                                    </Button>
                                  </Link>
                                ) : cert.course?.slug ? (
                                  <Link
                                    href={`/dashboard/learning/${cert.course.slug}/certificate`}
                                    className="flex-1"
                                  >
                                    <Button size="sm" variant="outline" className="w-full">
                                      View Certificate
                                    </Button>
                                  </Link>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No certificates earned yet</p>
                    <Link href="/dashboard">
                      <Button>Start Learning</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-700 mb-1">
                      {badges?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Badges Earned</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-700 mb-1">
                      {certificates?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Certificates</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}

