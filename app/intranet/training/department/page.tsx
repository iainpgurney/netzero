import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building,
  ArrowLeft,
  Play,
  ExternalLink,
  BookOpen,
  Target,
  TrendingUp,
  Code,
  Cog,
  Calculator,
  Headphones,
} from 'lucide-react'

const departments = [
  {
    name: 'Sales',
    icon: TrendingUp,
    colour: 'bg-blue-100 text-blue-700',
    coreSkills: ['Consultative selling', 'Carbon market knowledge', 'CRM management', 'Pipeline forecasting', 'Client relationship building'],
    recordings: [
      { title: 'Sales pitch masterclass', duration: '45 mins' },
      { title: 'Handling objections in carbon markets', duration: '30 mins' },
      { title: 'Demo walkthrough best practices', duration: '25 mins' },
    ],
    externalCourses: ['HubSpot Sales Certification', 'SPIN Selling Methodology', 'Voluntary Carbon Market Fundamentals'],
    playbooks: ['New business outreach playbook', 'Enterprise sales playbook', 'Renewal and upsell playbook'],
  },
  {
    name: 'Marketing',
    icon: Target,
    colour: 'bg-pink-100 text-pink-700',
    coreSkills: ['Content strategy', 'SEO & analytics', 'Brand management', 'Event planning', 'Social media management'],
    recordings: [
      { title: 'Carma brand voice and tone', duration: '20 mins' },
      { title: 'Content calendar and workflow', duration: '35 mins' },
      { title: 'Analytics and reporting deep dive', duration: '40 mins' },
    ],
    externalCourses: ['Google Analytics Certification', 'HubSpot Content Marketing', 'Climate Communications Masterclass'],
    playbooks: ['Content publication playbook', 'Campaign launch playbook', 'Event management playbook'],
  },
  {
    name: 'Engineering / Development',
    icon: Code,
    colour: 'bg-purple-100 text-purple-700',
    coreSkills: ['TypeScript & Next.js', 'Database design', 'API development', 'Testing & CI/CD', 'Code review practices'],
    recordings: [
      { title: 'Codebase architecture overview', duration: '50 mins' },
      { title: 'Deployment pipeline walkthrough', duration: '30 mins' },
      { title: 'Security best practices for devs', duration: '35 mins' },
    ],
    externalCourses: ['AWS Cloud Practitioner', 'Advanced TypeScript Patterns', 'OWASP Security Fundamentals'],
    playbooks: ['Sprint workflow playbook', 'Incident response playbook', 'Code review playbook'],
  },
  {
    name: 'Operations',
    icon: Cog,
    colour: 'bg-amber-100 text-amber-700',
    coreSkills: ['Process optimisation', 'Carbon credit verification', 'Vendor management', 'Quality assurance', 'Supply chain management'],
    recordings: [
      { title: 'Carbon credit lifecycle explained', duration: '40 mins' },
      { title: 'Verification and validation process', duration: '35 mins' },
      { title: 'Operational metrics and KPIs', duration: '25 mins' },
    ],
    externalCourses: ['Verra VCS Program Guide', 'Gold Standard Certification', 'Lean Six Sigma Yellow Belt'],
    playbooks: ['Credit verification playbook', 'Vendor onboarding playbook', 'Quality assurance playbook'],
  },
  {
    name: 'Finance',
    icon: Calculator,
    colour: 'bg-emerald-100 text-emerald-700',
    coreSkills: ['Financial reporting', 'Budgeting & forecasting', 'Revenue recognition', 'Tax compliance', 'Carbon market pricing'],
    recordings: [
      { title: 'Finance systems and tools overview', duration: '30 mins' },
      { title: 'Month-end close process', duration: '25 mins' },
      { title: 'Carbon credit accounting treatment', duration: '40 mins' },
    ],
    externalCourses: ['IFRS for Carbon Credits', 'Xero Advanced Certification', 'FP&A Best Practices'],
    playbooks: ['Month-end close playbook', 'Expense management playbook', 'Revenue recognition playbook'],
  },
  {
    name: 'Customer Services',
    icon: Headphones,
    colour: 'bg-cyan-100 text-cyan-700',
    coreSkills: ['Client communication', 'Platform troubleshooting', 'Ticket management', 'Escalation procedures', 'Product knowledge'],
    recordings: [
      { title: 'Support ticket workflow', duration: '20 mins' },
      { title: 'Common issues and resolutions', duration: '35 mins' },
      { title: 'Escalation and handover process', duration: '25 mins' },
    ],
    externalCourses: ['Zendesk Support Certification', 'Customer Success Fundamentals', 'Effective Written Communication'],
    playbooks: ['Ticket handling playbook', 'Escalation playbook', 'Client feedback playbook'],
  },
]

export default function DepartmentTrainingPage() {
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building className="h-7 w-7 text-purple-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Department Training</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Role-specific skills, internal recordings, external courses and playbooks organised by department.
          </p>
        </div>

        {/* Department Sections */}
        <div className="space-y-10">
          {departments.map((dept) => (
            <section key={dept.name} id={dept.name.toLowerCase().replace(/[\s\/]/g, '-')}>
              <Card className="overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${dept.colour.split(' ')[0]}`}>
                      <dept.icon className={`h-6 w-6 ${dept.colour.split(' ')[1]}`} />
                    </div>
                    <CardTitle className="text-xl">{dept.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Core Skills */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-700" />
                        Core Skills Required
                      </h4>
                      <ul className="space-y-1.5">
                        {dept.coreSkills.map((skill) => (
                          <li key={skill} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Internal Training Recordings */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Play className="h-4 w-4 text-green-700" />
                        Internal Training Recordings
                      </h4>
                      <div className="space-y-2">
                        {dept.recordings.map((rec) => (
                          <div
                            key={rec.title}
                            className="flex items-center justify-between p-2.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <span className="text-sm text-gray-700">{rec.title}</span>
                            <span className="text-xs text-gray-400 shrink-0 ml-2">{rec.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* External Courses */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-green-700" />
                        External Courses
                      </h4>
                      <ul className="space-y-1.5">
                        {dept.externalCourses.map((course) => (
                          <li key={course} className="text-sm text-gray-600 flex items-center gap-2">
                            <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {course}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Playbooks */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-700" />
                        Playbooks
                      </h4>
                      <ul className="space-y-1.5">
                        {dept.playbooks.map((playbook) => (
                          <li key={playbook} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                            {playbook}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
