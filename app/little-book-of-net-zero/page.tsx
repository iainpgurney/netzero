import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function LittleBookOfNetZeroPage() {
  return (
    <main className="flex min-h-screen flex-col p-8 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-black p-3 rounded-lg">
              <Image
                src="/carma-logo.png"
                alt="Carma Logo"
                width={140}
                height={47}
                className="h-auto"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-gray-900 mb-2">
              The Little Book of Net Zero 2023
            </CardTitle>
            <CardDescription className="text-lg">
              Our straightforward &apos;how-to&apos; guide to help you start your sustainability journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                You probably didn&apos;t think much about climate change when you started your business. 
                But climate change affects us all, and we can all play a part in combatting it. 
                In order to address this problem, the UK has set a target to achieve &apos;Net Zero&apos; GHG 
                emissions by 2050. A goal that will only be achieved with the help of businesses.
              </p>

              <p className="text-gray-700 leading-relaxed text-lg">
                The Little Book of Net Zero offers all businesses, particularly small to medium-sized 
                enterprises (SMEs), the opportunity to look at the 2050 UK government&apos;s climate goal 
                as a win-win scenario.
              </p>

              <div className="mt-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Making a firm commitment to achieve net zero in your business will mean that you will:
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Become more sustainable and socially responsible</h4>
                      <p className="text-gray-600 text-sm">
                        Demonstrate your commitment to environmental stewardship and corporate responsibility.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Take control of energy costs</h4>
                      <p className="text-gray-600 text-sm">
                        Reduce operational expenses through improved energy efficiency and sustainable practices.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <CheckCircle2 className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Improve performance</h4>
                      <p className="text-gray-600 text-sm">
                        Enhance operational efficiency and drive innovation through sustainable business practices.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <CheckCircle2 className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Become resilient</h4>
                      <p className="text-gray-600 text-sm">
                        Build long-term business resilience and adapt to changing market conditions and regulations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <a
                href="https://pages.bsigroup.com/l/35972/2023-12-14/3t76lq3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <Button size="lg" className="w-full sm:w-auto">
                  Download The Little Book of Net Zero
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <p className="text-sm text-gray-500 mt-2">
                Source: BSI Group - The Little Book of Net Zero 2023
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700 text-center">
              This Learning Hub is based on{' '}
              <a
                href="https://pages.bsigroup.com/l/35972/2023-12-14/3t76lq3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-semibold"
              >
                The Little Book of Net Zero
              </a>
              {' '}by BSI Group, providing businesses with practical guidance on achieving net zero emissions.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

