import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  CalendarDays,
  Receipt,
  ShieldCheck,
  Target,
  Star,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Clock,
  BookOpen,
  Heart,
  Sparkles,
  Shield,
} from 'lucide-react'
import Link from 'next/link'

const MILESTONES = [
  {
    phase: 'First 30 Days',
    subtitle: 'Learn & Absorb',
    color: 'border-green-500 bg-green-50',
    dotColor: 'bg-green-500',
    items: [
      { text: 'Complete onboarding training modules', href: '/intranet/training' },
      { text: 'Meet your team and key stakeholders across the business', href: '/intranet/teams' },
      { text: 'Understand Carma\'s product, customers, and mission', href: '/intranet/company' },
      { text: 'Learn about our company and people', href: '/intranet/company' },
      { text: 'Shadow team members and attend key meetings', href: '/intranet/teams' },
      { text: 'Set up your work environment and access', href: '/intranet/resources' },
    ],
  },
  {
    phase: 'First 60 Days',
    subtitle: 'Contribute',
    color: 'border-blue-500 bg-blue-50',
    dotColor: 'bg-blue-500',
    items: [
      { text: 'Take ownership of your first tasks or projects', href: '/intranet/boards' },
      { text: 'Join daily stand-ups and weekly team retros', href: '/intranet/teams' },
      { text: 'Build relationships across departments', href: '/intranet/teams' },
      { text: 'Give and receive your first round of feedback', href: '/intranet/people' },
      { text: 'Identify one area where you can add immediate value', href: '/intranet/boards' },
    ],
  },
  {
    phase: 'First 90 Days',
    subtitle: 'Own & Lead',
    color: 'border-purple-500 bg-purple-50',
    dotColor: 'bg-purple-500',
    items: [
      { text: 'Own a meaningful workstream or deliverable end-to-end', href: '/intranet/boards' },
      { text: 'Complete your 90-day review with your manager', href: '/intranet/people' },
      { text: 'Propose at least one improvement to how we work', href: '/intranet/boards' },
      { text: 'Be fully autonomous in your day-to-day responsibilities', href: '/intranet/people' },
      { text: 'Set your goals for the next quarter with your manager', href: '/intranet/people' },
    ],
  },
]

const POLICIES = [
  {
    title: 'Leave Policy',
    description: 'Annual leave, sick leave, parental leave, and how to book time off.',
    icon: CalendarDays,
    color: 'text-blue-600 bg-blue-50',
    href: 'https://docs.google.com/forms/d/1zxLKuKH6ngEIiBEWl-8JPRBbXHLCoa0DcbjodCNy1i4/edit',
  },
  {
    title: 'Expenses Policy',
    description: 'How to submit expenses, approved categories, and reimbursement timelines.',
    icon: Receipt,
    color: 'text-emerald-600 bg-emerald-50',
    href: 'https://docs.google.com/document/d/1J_-N1FKotCFhFiZ62204lqlE9aEEbeEstdrrS4CuQ1c/edit?tab=t.0',
  },
  {
    title: 'Code of Conduct',
    description: 'Our expectations for professional behaviour, inclusivity, and respect.',
    icon: ShieldCheck,
    color: 'text-amber-600 bg-amber-50',
    href: 'https://docs.google.com/document/d/1CQb2d_bEKejSE5T5mz12WnCHv3P0hdzo/edit',
  },
  {
    title: 'Security Policy',
    description: 'Information security, access control, and incident response.',
    icon: ShieldCheck,
    color: 'text-red-600 bg-red-50',
    href: 'https://drive.google.com/drive/folders/1I01nDO4CuMPMeo2x6P-Yw0o0vsb3AZR0?usp=drive_link',
  },
  {
    title: 'AI Policy',
    description: 'Guidelines for using AI tools in your work.',
    icon: ShieldCheck,
    color: 'text-violet-600 bg-violet-50',
    href: 'https://drive.google.com/drive/folders/1Qoysn29LbvauHQGPTV5TV9zKZWQzv4JW?usp=drive_link',
  },
  {
    title: 'Data Handling Policy',
    description: 'How we collect, store, and protect data.',
    icon: ShieldCheck,
    color: 'text-cyan-600 bg-cyan-50',
    href: 'https://drive.google.com/drive/folders/1I01nDO4CuMPMeo2x6P-Yw0o0vsb3AZR0?usp=drive_link',
  },
  {
    title: 'Access Control Policy',
    description: 'Who can access what, and how access is managed.',
    icon: ShieldCheck,
    color: 'text-orange-600 bg-orange-50',
    href: 'https://drive.google.com/drive/folders/1I01nDO4CuMPMeo2x6P-Yw0o0vsb3AZR0?usp=drive_link',
  },
]

export default function PeoplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">People</h1>
          </div>
          <p className="text-gray-500 mt-1 ml-[52px]">
            Everything you need to know about working at Carma
          </p>
        </div>

        {/* Core Values */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-green-600" />
            Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-t-4 border-t-green-500">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Do the right thing</h3>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-green-500">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Be passionate</h3>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-green-500">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-green-700" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Be authentic</h3>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Joiners Guide */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            Joiners Guide
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gray-200 hidden md:block" />

            <div className="space-y-6">
              {MILESTONES.map((milestone, index) => (
                <div key={milestone.phase} className="relative flex gap-6">
                  {/* Timeline dot */}
                  <div className="hidden md:flex flex-col items-center pt-6">
                    <div className={`w-10 h-10 rounded-full ${milestone.dotColor} flex items-center justify-center z-10 shadow-sm`}>
                      <span className="text-white font-bold text-sm">{(index + 1) * 30}</span>
                    </div>
                  </div>

                  {/* Content card */}
                  <Card className={`flex-1 border-l-4 ${milestone.color}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400 md:hidden" />
                        <CardTitle className="text-lg">{milestone.phase}</CardTitle>
                        <span className="text-sm text-gray-500 font-normal">— {milestone.subtitle}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {milestone.items.map((item) => (
                          <li key={item.text} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <Link href={item.href} className="text-green-700 hover:text-green-800 hover:underline">
                              {item.text}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Policies */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Policies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {POLICIES.map((policy) => {
              const Icon = policy.icon
              return (
                <a key={policy.title} href={policy.href} target="_blank" rel="noopener noreferrer">
                  <Card className="hover:shadow-md transition-shadow h-full group cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${policy.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-base group-hover:text-green-600 transition-colors flex items-center gap-1">
                          {policy.title}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{policy.description}</p>
                    </CardContent>
                  </Card>
                </a>
              )
            })}
          </div>
        </section>

        {/* Roles & Responsibilities */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            Roles &amp; Responsibilities
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-600 leading-relaxed">
                At Carma, roles are defined by <strong>outcomes, not tasks</strong>. Every role has a
                clear description of what success looks like, the key responsibilities, and how it
                connects to the wider team and company goals.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <Target className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Outcome-Oriented</h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      We define success by the results you deliver, not the hours you work.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <Users className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Cross-Functional</h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Roles often span teams. Collaboration is a feature, not a friction.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <Star className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Growth Paths</h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Whether you want to grow as a specialist or move into management — we want you to feel empowered and realise your potential.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <Briefcase className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">Ownership</h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      You own your domain. Autonomy with accountability is how we scale.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Performance Framework */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-green-600" />
            Performance Framework
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Performance at Carma is a continuous conversation, not an annual event. Our framework
                is designed to support your growth while keeping the business aligned.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="border rounded-lg p-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-green-600">Daily</span>
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900">Stand-up Check-ins</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Quick daily stand-up with your team to share progress, priorities for the day, and
                    any blockers.
                  </p>
                </div>
                <div className="border rounded-lg p-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-blue-600">Weekly</span>
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900">Team Retros</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Weekly team retrospective to reflect on what went well, what to improve, and actions
                    for the week ahead.
                  </p>
                </div>
                <div className="border rounded-lg p-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-purple-600">6M</span>
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900">6-Month Reviews</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Structured review of goals, achievements, and development areas. Set objectives for
                    the next 6 months.
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500 pt-2">
                Performance ratings follow a 4-point scale: <strong>Exceeding</strong>,{' '}
                <strong>Meeting</strong>, <strong>Developing</strong>, and{' '}
                <strong>Below Expectations</strong>. Ratings are calibrated across teams to ensure
                fairness.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
