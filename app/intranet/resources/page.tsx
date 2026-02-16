import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Palette,
  Scale,
  ExternalLink,
  ShieldCheck,
  Leaf,
  Search,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

const POLICY_LINKS = [
  {
    title: 'Standard Operating Procedures',
    description: 'Company SOPs including carbon credit verification, new hire setup, data retention and more',
    whenToUse: 'Use when you need step-by-step processes for common tasks. Reference before starting a new procedure.',
    icon: FileText,
    color: 'text-green-700 bg-green-100',
    href: 'https://docs.google.com/spreadsheets/d/18vz9ZMxjNWfWoGsQuhuoQdC1qqiC_26OdCs1qJUbPWA/edit?gid=0#gid=0',
  },
  {
    title: 'B Corp Policies',
    description: 'Environmental, social and governance policies supporting our B Corp certification',
    whenToUse: 'Use when preparing B Corp reports, impact assessments, or compliance documentation.',
    icon: Leaf,
    color: 'text-emerald-700 bg-emerald-100',
    href: 'https://drive.google.com/drive/folders/1Qoysn29LbvauHQGPTV5TV9zKZWQzv4JW?usp=drive_link',
  },
  {
    title: 'Security Policies',
    description: 'Information security, access control, incident response and remote working policies',
    whenToUse: 'Use when handling sensitive data, setting up access, or reporting a security incident.',
    icon: ShieldCheck,
    color: 'text-red-700 bg-red-100',
    href: 'https://drive.google.com/drive/folders/1I01nDO4CuMPMeo2x6P-Yw0o0vsb3AZR0?usp=drive_link',
  },
  {
    title: 'Legal Templates',
    description: 'NDAs, service agreements, employment contracts and data processing agreements',
    whenToUse: 'Use when drafting contracts, onboarding vendors, or need a legal document template.',
    icon: Scale,
    color: 'text-amber-700 bg-amber-100',
    href: 'https://drive.google.com/drive/folders/1FFtl6YyimGv4z8pOjTzoLmU1iXprANP4?usp=drive_link',
  },
]

export default function ResourcesPage() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources</h1>
          <p className="text-gray-600 text-lg">
            Policies, tools, brand assets and legal documents in one place.
          </p>
        </div>

        {/* Not Sure What You Need? */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Not Sure What You Need?</h2>
          <div className="flex flex-wrap gap-3">
            <a href="#policy-links" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-800 font-medium hover:bg-green-200 transition-colors">
              I need a policy
            </a>
            <a href="#policy-links" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800 font-medium hover:bg-blue-200 transition-colors">
              I need a process
            </a>
            <a href="#brand-assets" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 text-amber-800 font-medium hover:bg-amber-200 transition-colors">
              I need brand assets
            </a>
            <a href="#policy-links" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 text-purple-800 font-medium hover:bg-purple-200 transition-colors">
              I need legal templates
            </a>
          </div>
        </section>

        {/* Policy Links */}
        <section id="policy-links" className="mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {POLICY_LINKS.map((policy) => {
              const Icon = policy.icon
              return (
                <a
                  key={policy.title}
                  href={policy.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-green-300">
                    <CardContent className="pt-5 pb-4 px-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${policy.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                        {policy.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{policy.description}</p>
                      {policy.whenToUse && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-700">When To Use This</p>
                          <p className="text-xs text-gray-600">{policy.whenToUse}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Google Drive
                      </div>
                    </CardContent>
                  </Card>
                </a>
              )
            })}
          </div>
        </section>

        {/* Greenwash Checker */}
        <section className="mb-12">
          <Link href="/resources">
            <Card className="border-green-200 bg-green-50/50 hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <Search className="h-7 w-7 text-green-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Greenwash Checker</h3>
                      <p className="text-sm text-gray-600">
                        Analyze environmental claims, statements and websites for greenwashing, greenhushing and legitimacy.
                      </p>
                    </div>
                  </div>
                  <Button className="bg-green-700 hover:bg-green-800 text-white">
                    Open Checker
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Brand Assets */}
        <section id="brand-assets" className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Palette className="h-6 w-6 text-green-700" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Brand Assets</h2>
          </div>

          {/* Tone of Voice Summary */}
          <Card className="mb-6 border-green-200 bg-green-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Carma Tone of Voice — Quick Reference</CardTitle>
              <p className="text-sm text-gray-600 font-normal mt-1">
                &quot;Doing good, together&quot; — we speak as a community, not a corporation. Climate action should feel achievable, collective, clear and positive.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">The Core Tone: P.O.P.</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><strong>Passionate</strong> — energised, purposeful, we genuinely care</li>
                  <li><strong>Optimistic</strong> — solutions and progress, not doom</li>
                  <li><strong>Personal</strong> — trusted partner, &quot;we&quot; and &quot;you&quot;, conversation not lecture</li>
                </ul>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-800 text-sm mb-2">✓ DO</h4>
                  <p className="text-sm text-gray-600">Plain English, short sentences, speak directly, show people behind impact, confident and positive, clear next steps.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 text-sm mb-2">✗ DON&apos;T</h4>
                  <p className="text-sm text-gray-600">Corporate jargon, fear-based messaging, abstract language, cold or transactional. If it sounds like a consultancy slide, rewrite it.</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">Quick Self-Test Before Publishing</h4>
                <p className="text-sm text-gray-600">Does it sound human? Clear to a non-expert? Encouraging not alarming? Is the action obvious? Would I say this out loud? If not, refine it.</p>
              </div>
              <Link href="/dashboard/learning/new-starter" className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800">
                Complete the full Tone of Voice module
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Brand Guidelines</h3>
                  <p className="text-sm text-gray-500">
                    Complete guide to Carma&apos;s visual identity, tone of voice and usage rules.
                  </p>
                  <a href="https://drive.google.com/drive/folders/1IeiIKiOwWvAGGK7ft0zYhHzQv7-wnIzU?usp=drive_link" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Folder
                    </Button>
                  </a>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Company Logos</h3>
                  <p className="text-sm text-gray-500">
                    Primary, secondary and icon-only logos in SVG, PNG and EPS formats.
                  </p>
                  <a href="https://drive.google.com/drive/folders/1r7Vrt4_c6l7Ku7CiD9bcYRIB4I0dqhuS?usp=drive_link" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Folder
                    </Button>
                  </a>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Marketing Pack</h3>
                  <p className="text-sm text-gray-500">
                    Sales decks, one-pagers, case studies and marketing collateral.
                  </p>
                  <a href="https://drive.google.com/drive/folders/1SDkagZKEq588QTu6_tDAWrZWHIwz9dLL?usp=drive_link" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Folder
                    </Button>
                  </a>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Assets Folder</h3>
                  <p className="text-sm text-gray-500">
                    Images, icons, photography and other visual assets for use across channels.
                  </p>
                  <a href="https://drive.google.com/drive/folders/1SbZ6pzkqmLe8wKVvjof0VfrrlrgY3OKm?usp=drive_link" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="text-green-700 border-green-200 hover:bg-green-50">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Folder
                    </Button>
                  </a>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Colour Palette</h3>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-md bg-green-700" title="Carma Green #15803d" />
                    <div className="w-8 h-8 rounded-md bg-green-500" title="Carma Light Green #22c55e" />
                    <div className="w-8 h-8 rounded-md bg-gray-900" title="Carma Dark #111827" />
                    <div className="w-8 h-8 rounded-md bg-gray-100 border" title="Carma Light #f3f4f6" />
                    <div className="w-8 h-8 rounded-md bg-white border" title="White #ffffff" />
                  </div>
                  <p className="text-xs text-gray-400">Hover swatches for hex values</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  )
}
