/**
 * Shared copy for intranet pages and AI training export.
 * Text-only data — UI concerns (icons, colors) are added in components.
 */

export const COMPANY_VALUES = [
  {
    title: 'Trust',
    description:
      'We build trust through transparency, accuracy, and consistency. Our data and our word are reliable.',
    inPractice: [
      'Document decisions and evidence. Share openly.',
      'Never overclaim. Define scope clearly.',
      'Audit-ready by default.',
    ],
  },
  {
    title: 'Impact',
    description:
      'Every decision is measured by its climate outcome. We exist to advance social and environmental impact.',
    inPractice: [
      'Measure outcomes, not activity.',
      'Evidence before transactions.',
      'Real trees, real ecosystems, real people.',
    ],
  },
  {
    title: 'Innovation',
    description:
      'We challenge assumptions and pioneer new approaches. The climate crisis demands bold, creative solutions.',
    inPractice: [
      'Test assumptions. Iterate quickly.',
      'Learn from failures. Share learnings.',
      'Build for 2026 and beyond.',
    ],
  },
  {
    title: 'People First',
    description:
      'We invest in our people. Great climate solutions come from teams that feel supported and empowered.',
    inPractice: [
      'Support before blame.',
      'Clear roles and ownership.',
      'Growth paths for everyone.',
    ],
  },
] as const

export const COMPANY_HOW_WE_WORK = [
  {
    title: 'Meetings',
    description:
      'Every meeting must have a clear purpose and outcome. Keep them short, usually 25 to 50 minutes. If it can be handled in a message, do that instead.',
  },
  {
    title: 'Decisions',
    description:
      'Be clear about who is responsible. Write decisions down. Once we agree, we move forward together.',
  },
  {
    title: 'Communication',
    description:
      'Share updates openly. Write things down. Use Slack for quick chats, email or documents for important matters. Keep everything in the right place so others can find it.',
  },
] as const

export const COMPANY_VISION = {
  headline: "The world's most trusted climate platform",
  paragraphs: [
    "Carma exists to deliver real environmental and social impact, and turn that impact into trusted, audit-ready evidence and assets.",
    'We are building a climate platform people can trust.',
    'We focus on proof, not promises. Real evidence, not hype. Quality over quantity. Long term integrity over short term deals.',
  ],
} as const

export const COMPANY_WHAT_MEANS_IN_PRACTICE = [
  'We prioritise evidence over speed.',
  'We do not sell unverifiable credits.',
  'We build audit-ready systems.',
  'We say no to low-integrity revenue.',
  'We protect long-term trust over short-term deals.',
] as const

export const COMPANY_DECISION_STRUCTURE = {
  board: ['Approves strategy', 'Sets company targets'],
  cSuite: ['Owns execution', 'Accountable for £1m, 1,000 customers, 5% churn'],
  departmentLeads: ['Own functional delivery'],
} as const

export const PEOPLE_MILESTONES = [
  {
    phase: 'First 30 Days',
    subtitle: 'Learn & Absorb',
    items: [
      { text: 'Complete onboarding training modules', href: '/intranet/training' },
      { text: 'Meet your team and key stakeholders across the business', href: '/intranet/teams' },
      { text: "Understand Carma's product, customers, and mission", href: '/intranet/company' },
      { text: 'Learn about our company and people', href: '/intranet/company' },
      { text: 'Shadow team members and attend key meetings', href: '/intranet/teams' },
      { text: 'Set up your work environment and access', href: '/intranet/resources' },
    ],
  },
  {
    phase: 'First 60 Days',
    subtitle: 'Contribute',
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
    items: [
      { text: 'Own a meaningful workstream or deliverable end-to-end', href: '/intranet/boards' },
      { text: 'Complete your 90-day review with your manager', href: '/intranet/people' },
      { text: 'Propose at least one improvement to how we work', href: '/intranet/boards' },
      { text: 'Be fully autonomous in your day-to-day responsibilities', href: '/intranet/people' },
      { text: 'Set your goals for the next quarter with your manager', href: '/intranet/people' },
    ],
  },
] as const

export const PEOPLE_POLICIES = [
  {
    title: 'Leave Request Form',
    description:
      'Annual leave, sick leave, parental leave, and how to book time off.',
    href: 'https://docs.google.com/forms/d/1zxLKuKH6ngEIiBEWl-8JPRBbXHLCoa0DcbjodCNy1i4/edit',
  },
  {
    title: 'Expenses Policy',
    description:
      'How to submit expenses, approved categories, and reimbursement timelines.',
    href: 'https://docs.google.com/document/d/1J_-N1FKotCFhFiZ62204lqlE9aEEbeEstdrrS4CuQ1c/edit?tab=t.0',
  },
  {
    title: 'Code of Conduct',
    description:
      'Our expectations for professional behaviour, inclusivity, and respect.',
    href: 'https://docs.google.com/document/d/1CQb2d_bEKejSE5T5mz12WnCHv3P0hdzo/edit',
  },
  {
    title: 'Security Policy',
    description: 'Information security, access control, and incident response.',
    href: 'https://drive.google.com/drive/folders/1I01nDO4CuMPMeo2x6P-Yw0o0vsb3AZR0?usp=drive_link',
  },
  {
    title: 'AI Policy',
    description: 'Guidelines for using AI tools in your work.',
    href: 'https://drive.google.com/drive/folders/1Qoysn29LbvauHQGPTV5TV9zKZWQzv4JW?usp=drive_link',
  },
  {
    title: 'Data Handling Policy',
    description: 'How we collect, store, and protect data.',
    href: 'https://drive.google.com/drive/folders/1I01nDO4CuMPMeo2x6P-Yw0o0vsb3AZR0?usp=drive_link',
  },
  {
    title: 'Access Control Policy',
    description: 'Who can access what, and how access is managed.',
    href: 'https://drive.google.com/drive/folders/1I01nDO4CuMPMeo2x6P-Yw0o0vsb3AZR0?usp=drive_link',
  },
] as const

export const PEOPLE_CORE_VALUES = [
  'Do the right thing',
  'Be passionate',
  'Be authentic',
] as const

export const PEOPLE_ROLES_AND_RESPONSIBILITIES = {
  intro:
    "At Carma, roles are defined by outcomes, not tasks. Every role has a clear description of what success looks like, the key responsibilities, and how it connects to the wider team and company goals.",
  principles: [
    {
      title: 'Outcome-Oriented',
      description:
        'We define success by the results you deliver, not the hours you work.',
    },
    {
      title: 'Cross-Functional',
      description:
        'Roles often span teams. Collaboration is a feature, not a friction.',
    },
    {
      title: 'Growth Paths',
      description:
        'Whether you want to grow as a specialist or move into management — we want you to feel empowered and realise your potential.',
    },
    {
      title: 'Ownership',
      description:
        'You own your domain. Autonomy with accountability is how we scale.',
    },
  ],
} as const

export const PEOPLE_PERFORMANCE_FRAMEWORK = {
  intro:
    'Performance at Carma is a continuous conversation, not an annual event. Our framework is designed to support your growth while keeping the business aligned.',
  cadences: [
    {
      frequency: 'Daily',
      frequencyColor: 'green',
      title: 'Stand-up Check-ins',
      description:
        'Quick daily stand-up with your team to share progress, priorities for the day, and any blockers.',
    },
    {
      frequency: 'Weekly',
      frequencyColor: 'blue',
      title: 'Team Retros',
      description:
        'Weekly team retrospective to reflect on what went well, what to improve, and actions for the week ahead.',
    },
    {
      frequency: '6M',
      frequencyColor: 'purple',
      title: '6-Month Reviews',
      description:
        'Structured review of goals, achievements, and development areas. Set objectives for the next 6 months.',
    },
  ],
  ratingsNote:
    'Performance ratings follow a 4-point scale: Exceeding, Meeting, Developing, and Below Expectations. Ratings are calibrated across teams to ensure fairness.',
} as const

export const QUICK_LINKS = [
  {
    href: 'https://docs.google.com/forms/d/1zxLKuKH6ngEIiBEWl-8JPRBbXHLCoa0DcbjodCNy1i4/edit',
    label: 'Leave',
    description: 'Book and manage leave',
    external: true,
  },
  {
    href: '/intranet/boards',
    label: 'Kanban Boards',
    description: 'Team boards and workflows',
    external: false,
  },
  {
    href: 'https://carma-earth.releasedhub.com/carma-roadmap/roadmap/f106484c',
    label: 'Roadmap',
    description: 'View product roadmap',
    external: true,
  },
  {
    href: '/intranet/people',
    label: 'Joiners Guide',
    description: 'Onboarding and policies',
    external: false,
  },
  {
    href: '/intranet/training',
    label: 'Training',
    description: 'Courses and certifications',
    external: false,
  },
] as const

export const TEAM_MISSION_TEMPLATE =
  "The {departmentName} team plays a key role in delivering Carma's mission — to equip businesses with credible sustainability solutions that drive real change and competitive advantage. We focus on real-world impact, trusted evidence, and long-term integrity."
