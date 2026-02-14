import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Database,
  Leaf,
  Scale,
  Clock,
  AlertCircle,
  Play,
} from 'lucide-react'

const mandatoryTraining = [
  {
    title: 'Data Protection (GDPR)',
    description: 'Understand your obligations under UK GDPR and the Data Protection Act 2018. Covers lawful bases for processing, data subject rights, breach notification procedures and Carma\'s data handling policies.',
    icon: Database,
    iconBg: 'bg-blue-100',
    iconColour: 'text-blue-700',
    estimatedTime: '45 minutes',
    status: 'Not Started',
    topics: [
      'Lawful bases for processing personal data',
      'Data subject rights and how to handle requests',
      'Data breach identification and reporting',
      'Carma\'s data retention and deletion policies',
      'International data transfers',
    ],
  },
  {
    title: 'Security & MFA',
    description: 'Essential security practices for protecting Carma systems and data. Covers password management, multi-factor authentication, phishing awareness, device security and incident reporting.',
    icon: Lock,
    iconBg: 'bg-amber-100',
    iconColour: 'text-amber-700',
    estimatedTime: '30 minutes',
    status: 'Not Started',
    topics: [
      'Password policies and password manager setup',
      'Multi-factor authentication (MFA) enrollment',
      'Phishing and social engineering awareness',
      'Device security and encryption requirements',
      'Security incident reporting procedures',
    ],
  },
  {
    title: 'Carbon Market Integrity',
    description: 'Understanding the integrity frameworks governing voluntary carbon markets. Covers credit quality, additionality, permanence, verification standards and Carma\'s role in maintaining market trust.',
    icon: Leaf,
    iconBg: 'bg-green-100',
    iconColour: 'text-green-700',
    estimatedTime: '50 minutes',
    status: 'Not Started',
    topics: [
      'Voluntary carbon market fundamentals',
      'Credit quality criteria and additionality',
      'Permanence, leakage and double counting',
      'Verification standards (Verra, Gold Standard)',
      'Carma\'s integrity framework and commitments',
    ],
  },
  {
    title: 'Regulatory Compliance',
    description: 'Overview of the regulatory landscape affecting Carma\'s operations. Covers financial regulations, anti-money laundering obligations, sanctions screening and whistleblowing procedures.',
    icon: Scale,
    iconBg: 'bg-purple-100',
    iconColour: 'text-purple-700',
    estimatedTime: '40 minutes',
    status: 'Not Started',
    topics: [
      'Financial regulations applicable to carbon trading',
      'Anti-money laundering (AML) obligations',
      'Sanctions screening and due diligence',
      'Conflicts of interest and gifts policy',
      'Whistleblowing and escalation procedures',
    ],
  },
]

export default function MandatoryTrainingPage() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <Link
          href="/intranet/training"
          className="inline-flex items-center text-sm text-gray-500 hover:text-green-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Training Hub
        </Link>

        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <ShieldCheck className="h-7 w-7 text-amber-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Mandatory Training</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Required training for all Carma team members. Completion is tracked and must be renewed annually.
          </p>
        </div>

        {/* Status Banner */}
        <Card className="mb-8 border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  You have 4 outstanding mandatory training modules
                </p>
                <p className="text-xs text-amber-600">
                  Please complete all modules within 30 days of your start date, or by the annual renewal deadline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Cards */}
        <div className="space-y-6">
          {mandatoryTraining.map((training) => (
            <Card key={training.title} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${training.iconBg}`}>
                      <training.icon className={`h-6 w-6 ${training.iconColour}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{training.title}</CardTitle>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5" />
                          {training.estimatedTime}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {training.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-green-700 hover:bg-green-800 text-white shrink-0">
                    <Play className="h-4 w-4 mr-1" />
                    Start Training
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{training.description}</p>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Topics covered:</h4>
                  <ul className="grid md:grid-cols-2 gap-1.5">
                    {training.topics.map((topic) => (
                      <li key={topic} className="text-sm text-gray-500 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
