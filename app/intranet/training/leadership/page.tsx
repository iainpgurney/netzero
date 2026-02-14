import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Award,
  ArrowLeft,
  Users,
  MessageCircle,
  Lightbulb,
  Target,
  CheckCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react'

const managementExpectations = [
  { title: 'Lead by example', description: 'Demonstrate the behaviours and standards you expect from your team.' },
  { title: 'Create psychological safety', description: 'Foster an environment where people feel safe to speak up, ask questions and make mistakes.' },
  { title: 'Set clear expectations', description: 'Ensure every team member understands their role, goals and how success is measured.' },
  { title: 'Develop your people', description: 'Invest time in coaching, mentoring and creating growth opportunities for your reports.' },
  { title: 'Communicate transparently', description: 'Share context, explain decisions and keep your team informed about company direction.' },
  { title: 'Drive accountability', description: 'Hold yourself and your team to high standards while providing support to meet them.' },
]

const oneToOneGuide = [
  { heading: 'Cadence', content: 'Hold 1:1s weekly for 30 minutes minimum. Never cancel — reschedule if needed. This is your report\'s meeting, not yours.' },
  { heading: 'Preparation', content: 'Use a shared document for agenda items. Encourage your report to add topics first. Review their recent work and any feedback received.' },
  { heading: 'Structure', content: 'Start with a check-in (how are they doing?), then their agenda items, then your items. Save status updates for standups.' },
  { heading: 'Career Development', content: 'Dedicate at least one 1:1 per month to longer-term career goals, skill development and growth aspirations.' },
  { heading: 'Follow-up', content: 'Document action items and follow through. Nothing erodes trust faster than forgetting commitments made in 1:1s.' },
]

const feedbackFramework = [
  {
    step: 'Situation',
    description: 'Describe the specific situation or context. Be precise about when and where it happened.',
    example: '"In yesterday\'s client call with Acme Corp..."',
  },
  {
    step: 'Behaviour',
    description: 'Describe the observable behaviour — what you saw or heard. Avoid assumptions about intent.',
    example: '"...you interrupted the client twice while they were explaining their concerns..."',
  },
  {
    step: 'Impact',
    description: 'Explain the effect of the behaviour on the team, project or relationship.',
    example: '"...which made the client seem frustrated and may have undermined their confidence in us."',
  },
  {
    step: 'Request',
    description: 'Make a clear, actionable request for what you\'d like to see going forward.',
    example: '"Next time, I\'d like you to let the client finish their point before responding."',
  },
]

const decisionPrinciples = [
  {
    title: 'Reversible vs Irreversible',
    description: 'Distinguish between one-way and two-way doors. Move quickly on reversible decisions. Take more time and seek more input on irreversible ones.',
    icon: '🚪',
  },
  {
    title: 'Disagree and Commit',
    description: 'Once a decision is made, commit fully — even if you disagreed. Voice concerns during discussion, not during execution.',
    icon: '🤝',
  },
  {
    title: 'Data-Informed, Not Data-Dependent',
    description: 'Use data to inform decisions but don\'t wait for perfect data. 70% confidence is usually enough to act.',
    icon: '📊',
  },
  {
    title: 'Ownership Over Consensus',
    description: 'Decisions need an owner, not a committee. The decision owner gathers input but makes the final call.',
    icon: '👤',
  },
  {
    title: 'Write It Down',
    description: 'Document the decision, the reasoning and who was consulted. This creates institutional memory and accountability.',
    icon: '📝',
  },
  {
    title: 'Review and Learn',
    description: 'Revisit important decisions after 3–6 months. Were the assumptions correct? What would you do differently?',
    icon: '🔄',
  },
]

export default function LeadershipDevelopmentPage() {
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
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Award className="h-7 w-7 text-emerald-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Leadership Development</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Resources and guides for current and aspiring leaders at Carma. Good management is a skill — here&apos;s how we develop it.
          </p>
        </div>

        {/* Management Expectations */}
        <section className="mb-12">
          <Card>
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-700" />
                </div>
                <CardTitle className="text-xl">Management Expectations</CardTitle>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                What we expect from every people manager at Carma. These are non-negotiable foundations of good leadership here.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {managementExpectations.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Running 1:1s */}
        <section className="mb-12">
          <Card>
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-700" />
                </div>
                <CardTitle className="text-xl">Running Effective 1:1s</CardTitle>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                The 1:1 is your most important management tool. Here&apos;s how to make the most of it.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {oneToOneGuide.map((item, index) => (
                  <div key={item.heading} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.heading}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Giving Feedback */}
        <section className="mb-12">
          <Card>
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-amber-700" />
                </div>
                <CardTitle className="text-xl">Giving Feedback</CardTitle>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Use the SBI+R framework (Situation, Behaviour, Impact, Request) for clear, constructive feedback.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {feedbackFramework.map((item, index) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm shrink-0">
                      {item.step[0]}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.step}</h4>
                      <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                      <p className="text-sm text-gray-400 italic mt-1.5">{item.example}</p>
                    </div>
                    {index < feedbackFramework.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-300 mt-2 hidden md:block" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Tip:</span> Give feedback as close to the event as possible. Timely feedback is more impactful and easier to act on.
                  Positive feedback should be given publicly when appropriate; constructive feedback should always be private.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Decision-Making Principles */}
        <section className="mb-12">
          <Card>
            <CardHeader className="border-b bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-purple-700" />
                </div>
                <CardTitle className="text-xl">Decision-Making Principles</CardTitle>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                How we make decisions at Carma. These principles guide leaders in making faster, better choices.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {decisionPrinciples.map((principle) => (
                  <div key={principle.title} className="p-4 rounded-lg border hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{principle.icon}</span>
                      <h4 className="font-semibold text-gray-900">{principle.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{principle.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Further Reading */}
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <BookOpen className="h-7 w-7 text-green-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recommended Reading</h3>
                  <p className="text-sm text-gray-600">
                    Explore our curated leadership book list and external courses on the LMS.
                  </p>
                </div>
              </div>
              <Link href="/dashboard">
                <Button className="bg-green-700 hover:bg-green-800 text-white">
                  Browse Courses
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
