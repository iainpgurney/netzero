import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@netzero.com' },
    update: {},
    create: {
      email: 'demo@netzero.com',
      name: 'Demo User',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created demo user:', demoUser.email)

  // Clear existing data (except users and allowed domains)
  await prisma.quizAttempt.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.userProgress.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.module.deleteMany()
  await prisma.course.deleteMany()

  // Create allowed domains
  const carmaDomain = await prisma.allowedDomain.upsert({
    where: { domain: 'carma.earth' },
    update: { isActive: true },
    create: {
      domain: 'carma.earth',
      isActive: true,
    },
  })
  console.log('✅ Created allowed domain:', carmaDomain.domain)

  // Create Net Zero Course
  const netZeroCourse = await prisma.course.create({
    data: {
      slug: 'netzero',
      title: 'Net Zero Fundamentals',
      description: 'Interactive tutorial and guide for businesses learning about net zero',
      icon: '🌍',
      isActive: true,
    },
  })
  console.log('✅ Created course: Net Zero')

  // Create Greenwashing Course
  const greenwashingCourse = await prisma.course.create({
    data: {
      slug: 'greenwashing',
      title: 'Greenwashing Awareness',
      description: 'Learn to identify and avoid greenwashing in business practices',
      icon: '🌿',
      isActive: true,
    },
  })
  console.log('✅ Created course: Greenwashing')

  // Greenwashing Module 1: Understanding Greenwashing
  const gwModule1 = await prisma.module.create({
    data: {
      courseId: greenwashingCourse.id,
      title: 'Understanding Greenwashing',
      description: 'Learn what greenwashing is, why it matters, and how to recognize it in business communications.',
      order: 1,
      duration: 10,
      badgeName: 'Greenwashing Detective',
      badgeEmoji: '🔍',
      content: JSON.stringify({
        sections: [
          {
            title: 'What is Greenwashing?',
            content: 'Greenwashing is the practice of making misleading or unsubstantiated claims about the environmental benefits of a product, service, or company. It involves using marketing to create a false impression of environmental responsibility.\n\nCompanies engage in greenwashing to capitalize on growing consumer demand for sustainability without making meaningful changes to their business practices, operations, or environmental impact.',
          },
          {
            title: 'Why Greenwashing Matters',
            content: 'Greenwashing undermines genuine sustainability efforts and misleads consumers, employees, investors, and other stakeholders. It can:\n\n• Erode trust among all stakeholders\n• Delay real environmental progress\n• Create unfair competition\n• Damage brand reputation when exposed\n• Violate advertising standards and regulations',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What is the primary method Greenwashing uses to create a false impression?',
            options: JSON.stringify([
              'Investing heavily in environmental cleanups',
              'Using marketing to mislead consumers about environmental responsibility',
              'Transparently disclosing all carbon emissions',
              'Partnering with government regulators',
            ]),
            correctAnswer: 1,
            explanation: 'Greenwashing uses marketing to create a false impression of environmental responsibility without making meaningful changes.',
            order: 1,
          },
          {
            question: 'Why do companies typically engage in Greenwashing?',
            options: JSON.stringify([
              'To capitalize on consumer demand without making meaningful changes',
              'To actively pay more taxes',
              'To speed up the implementation of climate laws',
              'To reduce their marketing budget',
            ]),
            correctAnswer: 0,
            explanation: 'Companies engage in greenwashing to capitalize on growing consumer demand for sustainability without making meaningful changes to their business practices.',
            order: 2,
          },
          {
            question: 'A company labels a product "Earth-Conscious" but provides no definition. Which tactic is this?',
            options: JSON.stringify([
              'Fibbing',
              'Vague or Meaningless Terms',
              'Lesser of Two Evils',
              'Hidden Trade-offs',
            ]),
            correctAnswer: 1,
            explanation: 'Using undefined words like "Earth-Conscious" without clear standards or definitions is an example of vague or meaningless terms.',
            order: 3,
          },
          {
            question: 'Highlighting a minor green feature while ignoring a major pollutant in the supply chain is called:',
            options: JSON.stringify([
              'Irrelevant Claims',
              'Hidden Trade-offs',
              'Fibbing',
              'Worshipping False Labels',
            ]),
            correctAnswer: 1,
            explanation: 'Hidden trade-offs occur when a product is labeled "green" based on a single attribute while ignoring major environmental damage elsewhere.',
            order: 4,
          },
          {
            question: 'Advertising a product as "CFC-Free" when CFCs are already banned by law is an example of:',
            options: JSON.stringify([
              'Irrelevant Claims',
              'Lesser of Two Evils',
              'Lack of Proof',
              'Vague Terms',
            ]),
            correctAnswer: 0,
            explanation: 'Irrelevant claims cite benefits that are technically true but unhelpful, such as being "CFC-Free" when CFCs are already legally banned.',
            order: 5,
          },
          {
            question: 'If a cigarette company advertises "Organic Tobacco," which tactic are they likely using?',
            options: JSON.stringify([
              'Hidden Trade-offs',
              'Lesser of Two Evils',
              'No Proof',
              'Irrelevant Claims',
            ]),
            correctAnswer: 1,
            explanation: 'Lesser of two evils occurs when claiming a product is "green" when the entire product category is environmentally harmful.',
            order: 6,
          },
          {
            question: 'Beyond reputation damage, what is a formal consequence of Greenwashing?',
            options: JSON.stringify([
              'Violation of consumer protection and advertising laws',
              'Automatic tax exemptions',
              'Guaranteed government grants',
              'Increased stock prices',
            ]),
            correctAnswer: 0,
            explanation: 'Greenwashing can violate consumer protection and advertising laws, leading to legal consequences and regulatory action.',
            order: 7,
          },
        ],
      },
    },
  })
  console.log('✅ Created greenwashing module 1')

  // Greenwashing Module 2: Identifying Greenwashing
  const gwModule2 = await prisma.module.create({
    data: {
      courseId: greenwashingCourse.id,
      title: 'Identifying Greenwashing',
      description: 'Learn specific techniques to spot greenwashing in marketing, packaging, and corporate communications.',
      order: 2,
      duration: 12,
      badgeName: 'Greenwashing Spotter',
      badgeEmoji: '👁️',
      content: JSON.stringify({
        sections: [
          {
            title: 'The Seven Sins of Greenwashing',
            content: 'TerraChoice (now part of UL) identified seven common greenwashing sins:\n\n1. Hidden Trade-off: Claiming one green aspect while ignoring others\n2. No Proof: Making claims without evidence\n3. Vagueness: Using terms that are unclear or meaningless\n4. Worshipping False Labels: Implying third-party endorsement that doesn\'t exist\n5. Irrelevance: Claiming something that\'s already required\n6. Lesser of Two Evils: Comparing to worse alternatives\n7. Fibbing: Making outright false claims',
          },
          {
            title: 'Red Flags in Marketing',
            content: 'Watch for these warning signs:\n\n• Excessive use of green imagery (leaves, nature scenes)\n• Claims that sound too good to be true\n• Lack of specific data or metrics\n• Overemphasis on minor environmental improvements\n• Claims that can\'t be verified\n• Contradictory information across different channels',
          },
          {
            title: 'Questions to Ask',
            content: 'When evaluating environmental claims, ask:\n\n• Can this claim be verified?\n• Is there third-party certification?\n• What specific standards or metrics are used?\n• What\'s the full environmental impact, not just one aspect?\n• How does this compare to alternatives?\n• Is the company transparent about its practices?',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'How many "sins of greenwashing" were identified by TerraChoice?',
            options: JSON.stringify(['5', '6', '7', '8']),
            correctAnswer: 2,
            explanation: 'TerraChoice identified seven common greenwashing sins.',
            order: 1,
          },
          {
            question: 'What is the "hidden trade-off" sin?',
            options: JSON.stringify([
              'Making false claims',
              'Claiming one green aspect while ignoring others',
              'Using vague terms',
              'Comparing to worse alternatives',
            ]),
            correctAnswer: 1,
            explanation: 'Hidden trade-off involves highlighting one environmental benefit while ignoring negative impacts.',
            order: 2,
          },
          {
            question: 'What should you look for to verify environmental claims?',
            options: JSON.stringify([
              'Green imagery',
              'Third-party certification',
              'Bold marketing claims',
              'Vague terms',
            ]),
            correctAnswer: 1,
            explanation: 'Third-party certification provides credible verification of environmental claims.',
            order: 3,
          },
          {
            question: 'Which is a red flag for greenwashing?',
            options: JSON.stringify([
              'Specific data and metrics',
              'Third-party verification',
              'Claims that sound too good to be true',
              'Transparent reporting',
            ]),
            correctAnswer: 2,
            explanation: 'Claims that sound too good to be true are often a sign of greenwashing.',
            order: 4,
          },
          {
            question: 'What should you ask when evaluating environmental claims?',
            options: JSON.stringify([
              'Is it cheap?',
              'Can this claim be verified?',
              'Does it look good?',
              'Is it popular?',
            ]),
            correctAnswer: 1,
            explanation: 'Always verify environmental claims with evidence and third-party certification.',
            order: 5,
          },
        ],
      },
    },
  })
  console.log('✅ Created greenwashing module 2')

  // Greenwashing Module 3: Avoiding Greenwashing
  const gwModule3 = await prisma.module.create({
    data: {
      courseId: greenwashingCourse.id,
      title: 'Avoiding Greenwashing in Your Business',
      description: 'Learn how to communicate your sustainability efforts honestly and effectively without falling into greenwashing traps.',
      order: 3,
      duration: 15,
      badgeName: 'Authentic Communicator',
      badgeEmoji: '✅',
      content: JSON.stringify({
        sections: [
          {
            title: 'Principles of Authentic Communication',
            content: 'To avoid greenwashing:\n\n• Be specific and accurate\n• Provide evidence and proof\n• Use recognized standards and certifications\n• Be transparent about limitations\n• Focus on meaningful improvements\n• Avoid vague or meaningless terms\n• Consider the full lifecycle impact',
          },
          {
            title: 'Best Practices',
            content: 'When communicating sustainability:\n\n• Use third-party certifications (B-Corp, Fair Trade, etc.)\n• Provide specific metrics and data\n• Be honest about challenges and limitations\n• Show progress over time\n• Avoid overstating benefits\n• Ensure claims are relevant and meaningful\n• Make information easily accessible',
          },
          {
            title: 'Building Trust',
            content: 'Authentic sustainability communication:\n\n• Builds long-term brand value\n• Attracts conscious consumers\n• Reduces regulatory risk\n• Encourages genuine improvement\n• Creates competitive advantage\n• Fosters stakeholder trust',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What is a key principle of authentic sustainability communication?',
            options: JSON.stringify([
              'Use vague terms',
              'Be specific and accurate',
              'Make bold claims',
              'Hide limitations',
            ]),
            correctAnswer: 1,
            explanation: 'Being specific and accurate is essential for authentic communication.',
            order: 1,
          },
          {
            question: 'How can you build trust in sustainability claims?',
            options: JSON.stringify([
              'Use excessive green imagery',
              'Provide specific metrics and data',
              'Make vague promises',
              'Compare to worse alternatives',
            ]),
            correctAnswer: 1,
            explanation: 'Specific metrics and data provide credible evidence of sustainability efforts.',
            order: 2,
          },
          {
            question: 'What should you avoid when communicating sustainability?',
            options: JSON.stringify([
              'Third-party certifications',
              'Vague or meaningless terms',
              'Specific data',
              'Transparency',
            ]),
            correctAnswer: 1,
            explanation: 'Vague terms undermine credibility and can be seen as greenwashing.',
            order: 3,
          },
          {
            question: 'What helps verify sustainability claims?',
            options: JSON.stringify([
              'Bold marketing',
              'Third-party certifications',
              'Green imagery',
              'Vague terms',
            ]),
            correctAnswer: 1,
            explanation: 'Third-party certifications provide independent verification of claims.',
            order: 4,
          },
          {
            question: 'What is important when communicating sustainability?',
            options: JSON.stringify([
              'Overstating benefits',
              'Being honest about limitations',
              'Hiding challenges',
              'Making comparisons to worse alternatives',
            ]),
            correctAnswer: 1,
            explanation: 'Honesty about limitations builds trust and credibility.',
            order: 5,
          },
        ],
      },
    },
  })
  console.log('✅ Created greenwashing module 3')

  // Greenwashing Module 4: Case Studies & Examples
  const gwModule4 = await prisma.module.create({
    data: {
      courseId: greenwashingCourse.id,
      title: 'Case Studies & Real-World Examples',
      description: 'Examine real-world examples of greenwashing and learn from both positive and negative cases.',
      order: 4,
      duration: 12,
      badgeName: 'Case Study Analyst',
      badgeEmoji: '📚',
      content: JSON.stringify({
        sections: [
          {
            title: 'Famous Greenwashing Cases',
            content: 'Learn from real examples:\n\n• Volkswagen "Clean Diesel" scandal - False emissions claims\n• H&M "Conscious Collection" - Vague sustainability claims\n• BP rebranding to "Beyond Petroleum" - Misleading focus\n• Fiji Water "Carbon Negative" - Questionable offset claims\n• These cases show the importance of transparency and verification',
          },
          {
            title: 'What Went Wrong',
            content: 'Common patterns in greenwashing cases:\n\n• Overstating environmental benefits\n• Focusing on minor improvements while ignoring major impacts\n• Using misleading imagery and language\n• Lack of third-party verification\n• Contradictory practices across operations',
          },
          {
            title: 'Positive Examples',
            content: 'Companies doing it right:\n\n• Patagonia - Transparent supply chain and impact reporting\n• Interface - Clear metrics and progress tracking\n• Unilever - Comprehensive sustainability reporting\n• These companies provide specific data, third-party verification, and honest communication',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What was a key issue with Volkswagen\'s "Clean Diesel" campaign?',
            options: JSON.stringify([
              'It was too expensive',
              'False emissions claims',
              'Poor marketing',
              'Limited availability',
            ]),
            correctAnswer: 1,
            explanation: 'Volkswagen made false emissions claims, leading to a major scandal.',
            order: 1,
          },
          {
            question: 'What do positive greenwashing examples have in common?',
            options: JSON.stringify([
              'Vague claims',
              'Specific data and third-party verification',
              'Excessive green imagery',
              'Bold marketing promises',
            ]),
            correctAnswer: 1,
            explanation: 'Positive examples provide specific data, third-party verification, and transparent reporting.',
            order: 2,
          },
          {
            question: 'Why are case studies important for understanding greenwashing?',
            options: JSON.stringify([
              'They\'re entertaining',
              'They show real-world patterns and consequences',
              'They promote specific brands',
              'They\'re required by law',
            ]),
            correctAnswer: 1,
            explanation: 'Case studies help identify patterns and understand real-world consequences of greenwashing.',
            order: 3,
          },
          {
            question: 'What pattern is common in greenwashing cases?',
            options: JSON.stringify([
              'Overstating environmental benefits',
              'Understating benefits',
              'Perfect accuracy',
              'No claims at all',
            ]),
            correctAnswer: 0,
            explanation: 'Overstating environmental benefits while ignoring major impacts is a common greenwashing pattern.',
            order: 4,
          },
          {
            question: 'What should companies learn from greenwashing scandals?',
            options: JSON.stringify([
              'Avoid all environmental claims',
              'Be transparent, accurate, and verifiable',
              'Use more green imagery',
              'Focus only on marketing',
            ]),
            correctAnswer: 1,
            explanation: 'Companies should learn to be transparent, accurate, and provide verifiable claims.',
            order: 5,
          },
        ],
      },
    },
  })
  console.log('✅ Created greenwashing module 4')

  // Greenwashing Module 5: Regulations & Legal Framework
  const gwModule5 = await prisma.module.create({
    data: {
      courseId: greenwashingCourse.id,
      title: 'Regulations & Legal Framework',
      description: 'Understand the legal and regulatory landscape around greenwashing and environmental claims.',
      order: 5,
      duration: 10,
      badgeName: 'Regulatory Expert',
      badgeEmoji: '⚖️',
      content: JSON.stringify({
        sections: [
          {
            title: 'EU Green Claims Directive',
            content: 'European regulations:\n\n• Requires substantiation of environmental claims\n• Prohibits vague or unsubstantiated claims\n• Mandates lifecycle assessment for product claims\n• Requires clear, verifiable, and comparable information\n• Penalties for non-compliance can be significant',
          },
          {
            title: 'UK Competition and Markets Authority',
            content: 'UK Green Claims Code:\n\n• Claims must be truthful and accurate\n• Must be clear and unambiguous\n• Must not omit or hide important information\n• Must consider the full lifecycle\n• Must be substantiated\n• Violations can result in enforcement action',
          },
          {
            title: 'US Federal Trade Commission',
            content: 'FTC Green Guides:\n\n• Guidelines for environmental marketing claims\n• Defines terms like "recyclable," "biodegradable," "compostable"\n• Requires clear and prominent qualifications\n• Prohibits deceptive claims\n• Regular updates to address new claims',
          },
          {
            title: 'Global Standards',
            content: 'International frameworks:\n\n• ISO 14021 - Environmental labels and declarations\n• UN Guidelines for Consumer Protection\n• Various national advertising standards\n• Industry-specific regulations\n• Growing global harmonization efforts',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What does the EU Green Claims Directive require?',
            options: JSON.stringify([
              'No environmental claims',
              'Substantiation of environmental claims',
              'Only positive claims',
              'Claims without evidence',
            ]),
            correctAnswer: 1,
            explanation: 'The EU Green Claims Directive requires substantiation of all environmental claims.',
            order: 1,
          },
          {
            question: 'What can happen if companies violate greenwashing regulations?',
            options: JSON.stringify([
              'Nothing',
              'Enforcement action and penalties',
              'Automatic approval',
              'Increased sales',
            ]),
            correctAnswer: 1,
            explanation: 'Violations can result in enforcement action, fines, and other penalties.',
            order: 2,
          },
          {
            question: 'What must environmental claims be according to UK regulations?',
            options: JSON.stringify([
              'Vague and unclear',
              'Truthful, accurate, and substantiated',
              'Only positive',
              'Without qualifications',
            ]),
            correctAnswer: 1,
            explanation: 'UK regulations require claims to be truthful, accurate, clear, and substantiated.',
            order: 3,
          },
          {
            question: 'What do FTC Green Guides provide?',
            options: JSON.stringify([
              'Marketing strategies',
              'Guidelines for environmental marketing claims',
              'Product designs',
              'Pricing information',
            ]),
            correctAnswer: 1,
            explanation: 'FTC Green Guides provide guidelines for making environmental marketing claims.',
            order: 4,
          },
          {
            question: 'Why is understanding regulations important?',
            options: JSON.stringify([
              'To avoid legal issues',
              'To ensure compliance and avoid penalties',
              'To increase marketing budget',
              'To ignore requirements',
            ]),
            correctAnswer: 1,
            explanation: 'Understanding regulations helps ensure compliance and avoid legal penalties.',
            order: 5,
          },
        ],
      },
    },
  })
  console.log('✅ Created greenwashing module 5')

  // Greenwashing Module 6: Tools & Resources
  const gwModule6 = await prisma.module.create({
    data: {
      courseId: greenwashingCourse.id,
      title: 'Tools & Resources for Verification',
      description: 'Learn about tools, certifications, and resources to verify environmental claims and avoid greenwashing.',
      order: 6,
      duration: 10,
      badgeName: 'Verification Specialist',
      badgeEmoji: '🔧',
      content: JSON.stringify({
        sections: [
          {
            title: 'Third-Party Certifications',
            content: 'Recognized certifications:\n\n• B-Corp Certification - Overall business impact\n• Fair Trade - Ethical sourcing\n• Forest Stewardship Council (FSC) - Sustainable forestry\n• Energy Star - Energy efficiency\n• LEED - Building sustainability\n• Cradle to Cradle - Product lifecycle design\n• Look for recognized, independent certifications',
          },
          {
            title: 'Verification Tools',
            content: 'Tools to verify claims:\n\n• Lifecycle Assessment (LCA) databases\n• Carbon footprint calculators\n• Supply chain transparency tools\n• Environmental impact databases\n• Third-party audit reports\n• Industry benchmarks and standards',
          },
          {
            title: 'Research Resources',
            content: 'Where to find reliable information:\n\n• Company sustainability reports\n• Third-party ratings (CDP, MSCI ESG)\n• Industry associations\n• Academic research\n• Government databases\n• NGO reports and assessments',
          },
          {
            title: 'Red Flags to Watch For',
            content: 'Warning signs:\n\n• Claims without certification\n• Vague or undefined terms\n• Lack of supporting data\n• Contradictory information\n• Overemphasis on minor improvements\n• Claims that can\'t be verified\n• No third-party verification',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What is B-Corp Certification?',
            options: JSON.stringify([
              'A marketing term',
              'A recognized certification for overall business impact',
              'Only for large companies',
              'Not important',
            ]),
            correctAnswer: 1,
            explanation: 'B-Corp Certification is a recognized third-party certification for overall business impact.',
            order: 1,
          },
          {
            question: 'What should you look for when verifying claims?',
            options: JSON.stringify([
              'Only marketing materials',
              'Third-party certifications and supporting data',
              'Green imagery',
              'Bold promises',
            ]),
            correctAnswer: 1,
            explanation: 'Look for third-party certifications, supporting data, and verifiable information.',
            order: 2,
          },
          {
            question: 'What is a red flag for greenwashing?',
            options: JSON.stringify([
              'Third-party certification',
              'Claims without supporting data',
              'Specific metrics',
              'Transparent reporting',
            ]),
            correctAnswer: 1,
            explanation: 'Claims without supporting data or verification are red flags for greenwashing.',
            order: 3,
          },
          {
            question: 'Where can you find reliable sustainability information?',
            options: JSON.stringify([
              'Only company websites',
              'Company reports, third-party ratings, and verified databases',
              'Social media',
              'Marketing materials only',
            ]),
            correctAnswer: 1,
            explanation: 'Reliable information comes from company reports, third-party ratings, and verified databases.',
            order: 4,
          },
          {
            question: 'Why are third-party certifications important?',
            options: JSON.stringify([
              'They\'re not important',
              'They provide independent verification',
              'They cost money',
              'They\'re easy to get',
            ]),
            correctAnswer: 1,
            explanation: 'Third-party certifications provide independent verification of claims.',
            order: 5,
          },
        ],
      },
    },
  })
  console.log('✅ Created greenwashing module 6')

  // Greenwashing Module 7: Your Action Plan
  const gwModule7 = await prisma.module.create({
    data: {
      courseId: greenwashingCourse.id,
      title: 'Creating Your Anti-Greenwashing Action Plan',
      description: 'Develop a practical action plan to ensure your business communicates sustainability authentically and avoids greenwashing.',
      order: 7,
      duration: 15,
      badgeName: 'Greenwashing Prevention Champion',
      badgeEmoji: '🎯',
      content: JSON.stringify({
        sections: [
          {
            title: 'Audit Your Current Claims',
            content: 'Start by reviewing:\n\n• All marketing materials and websites\n• Product packaging and labels\n• Sustainability reports\n• Social media content\n• Advertising campaigns\n• Identify any vague, unsubstantiated, or potentially misleading claims',
          },
          {
            title: 'Establish Clear Guidelines',
            content: 'Create internal policies:\n\n• Define acceptable language and terms\n• Require evidence for all claims\n• Mandate third-party verification where appropriate\n• Establish review processes\n• Train marketing and communications teams\n• Create a claims approval process',
          },
          {
            title: 'Build Verification Systems',
            content: 'Implement processes:\n\n• Collect data to support claims\n• Obtain relevant certifications\n• Conduct lifecycle assessments\n• Maintain documentation\n• Regular audits and reviews\n• Update claims as practices improve',
          },
          {
            title: 'Communicate Authentically',
            content: 'Best practices:\n\n• Be specific and accurate\n• Show progress, not perfection\n• Be transparent about challenges\n• Use recognized standards\n• Provide accessible information\n• Engage stakeholders honestly\n• Build trust over time',
          },
          {
            title: 'Continuous Improvement',
            content: 'Ongoing efforts:\n\n• Regular review of claims\n• Update as practices improve\n• Stay informed about regulations\n• Learn from feedback\n• Benchmark against best practices\n• Celebrate genuine progress\n• Maintain accountability',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What should you do first when creating an anti-greenwashing plan?',
            options: JSON.stringify([
              'Ignore current claims',
              'Audit your current claims and materials',
              'Make new claims immediately',
              'Hide old claims',
            ]),
            correctAnswer: 1,
            explanation: 'Start by auditing all current claims and materials to identify potential issues.',
            order: 1,
          },
          {
            question: 'What should internal guidelines include?',
            options: JSON.stringify([
              'Vague terms only',
              'Clear definitions, evidence requirements, and review processes',
              'No guidelines needed',
              'Only positive claims',
            ]),
            correctAnswer: 1,
            explanation: 'Guidelines should include clear definitions, evidence requirements, and review processes.',
            order: 2,
          },
          {
            question: 'How should you communicate sustainability progress?',
            options: JSON.stringify([
              'Only show perfection',
              'Be specific, show progress, and be transparent',
              'Use only vague terms',
              'Hide challenges',
            ]),
            correctAnswer: 1,
            explanation: 'Communicate authentically by being specific, showing progress, and being transparent.',
            order: 3,
          },
          {
            question: 'What is important for continuous improvement?',
            options: JSON.stringify([
              'Never review claims',
              'Regular review, updates, and staying informed',
              'Set and forget',
              'Ignore feedback',
            ]),
            correctAnswer: 1,
            explanation: 'Continuous improvement requires regular review, updates, and staying informed.',
            order: 4,
          },
          {
            question: 'What builds long-term trust in sustainability communication?',
            options: JSON.stringify([
              'Bold claims',
              'Authentic, transparent, and verifiable communication over time',
              'Vague promises',
              'Green imagery only',
            ]),
            correctAnswer: 1,
            explanation: 'Long-term trust comes from authentic, transparent, and verifiable communication.',
            order: 5,
          },
        ],
      },
    },
  })
  console.log('✅ Created greenwashing module 7')

  // Create Carbon Credit Integrity Course
  const carbonCreditCourse = await prisma.course.create({
    data: {
      slug: 'carbon-credit-integrity',
      title: 'Carbon Credit Integrity',
      description: 'Understand the difference between avoidance and removal, and the new regulatory landscape (ICVCM)',
      icon: '⚖️',
      isActive: true,
    },
  })
  console.log('✅ Created course: Carbon Credit Integrity')

  // Carbon Credit Module 1: Carbon Credit Fundamentals
  const ccModule1 = await prisma.module.create({
    data: {
      courseId: carbonCreditCourse.id,
      title: 'Carbon Credit Fundamentals',
      description: 'Understand the difference between avoidance and removal, and the new regulatory landscape (ICVCM)',
      order: 1,
      duration: 8,
      badgeName: 'Carbon Credit Expert',
      badgeEmoji: '⚖️',
      content: JSON.stringify({
        sections: [
          {
            title: 'The New Landscape',
            content: 'The "Wild West" is Over\n\nHistorically, the voluntary carbon market was unregulated, leading to inconsistent quality. Today, a new global "Integrity" infrastructure has emerged to standardize the market.\n\nYou must now navigate three distinct authorities:\n\n• SBTi: Sets your reduction targets.\n• ICVCM: Regulates the quality of the credits you buy (Supply side).\n• VCMI: Regulates the claims you make about them (Demand side).',
            source: 'VCMI / ICVCM Joint Statement',
          },
          {
            title: 'Avoidance vs. Removal',
            content: 'Know What You Are Buying\n\nNot all carbon credits are the same. They fall into two main buckets:\n\nAvoidance Credits: Projects that prevent emissions that would have otherwise happened (e.g., protecting a forest from being cut down, or funding clean cookstoves).\n\nRemoval Credits: Projects that suck CO2 out of the atmosphere (e.g., planting new forests or Direct Air Capture technology).\n\nCritical Note: As you get closer to your Net-Zero target date (e.g., 2050), you are generally required to shift from Avoidance to Removal.',
          },
          {
            title: 'Key Takeaways',
            content: '📍 Key Takeaways\n\n✅ Three Pillars of Integrity: Strategy (SBTi), Quality (ICVCM), and Claims (VCMI).\n✅ Avoidance Credits: Prevent future emissions (e.g., forest protection).\n✅ Removal Credits: Extract existing CO2 from the air (e.g., reforestation, tech).\n✅ Evolution: The market is moving from "voluntary" to "quasi-regulated" by these bodies.',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'Which body is primarily responsible for setting the quality threshold for carbon credits (the "Supply Side")?',
            options: JSON.stringify([
              'The SBTi (Science Based Targets initiative)',
              'The ICVCM (Integrity Council for the Voluntary Carbon Market)',
              'The GHG Protocol',
              'The United Nations',
            ]),
            correctAnswer: 1,
            explanation: 'The ICVCM (Integrity Council for the Voluntary Carbon Market) regulates the quality of the credits you buy, focusing on the supply side.',
            order: 1,
          },
          {
            question: 'What is the difference between avoidance and removal credits?',
            options: JSON.stringify([
              'They are the same thing',
              'Avoidance prevents future emissions; removal extracts existing CO2',
              'Removal is cheaper than avoidance',
              'Avoidance is only for large companies',
            ]),
            correctAnswer: 1,
            explanation: 'Avoidance credits prevent emissions that would have otherwise happened, while removal credits extract CO2 that already exists in the atmosphere.',
            order: 2,
          },
          {
            question: 'As you approach your Net-Zero target date, what shift is generally required?',
            options: JSON.stringify([
              'From removal to avoidance',
              'From avoidance to removal',
              'No shift is needed',
              'Stop using credits entirely',
            ]),
            correctAnswer: 1,
            explanation: 'As you get closer to your Net-Zero target date, you are generally required to shift from Avoidance to Removal credits.',
            order: 3,
          },
        ],
      },
    },
  })
  console.log('✅ Created carbon credit module 1')

  // Carbon Credit Module 2: Strategy Before Spending
  const ccModule2 = await prisma.module.create({
    data: {
      courseId: carbonCreditCourse.id,
      title: 'Strategy Before Spending',
      description: 'Master the "Mitigation Hierarchy" and align with SBTi standards before buying credits',
      order: 2,
      duration: 10,
      badgeName: 'Strategic Buyer',
      badgeEmoji: '📉',
      content: JSON.stringify({
        sections: [
          {
            title: 'The Mitigation Hierarchy',
            content: 'Reduce First, Offset Later\n\nThe SBTi (Science Based Targets initiative) enforces a strict "Mitigation Hierarchy." You cannot buy carbon credits to replace your own emissions reductions.\n\nAbate (Reduce): Cut your own Scope 1, 2, and 3 emissions by ~90%.\n\nBeyond Value Chain Mitigation (BVCM): While you are reducing, you should buy credits to help the planet, but these do not count toward your reduction targets.\n\nNeutralize: Only at the very end (Net Zero) do you use credits to neutralize the final ~10% of residual emissions.',
          },
          {
            title: 'The Role of BVCM',
            content: 'What is BVCM?\n\n"Beyond Value Chain Mitigation" is the new term for what companies used to call "offsetting" during their transition.\n\nThe SBTi encourages companies to invest in BVCM (buying high-quality credits) immediately, but clarifies that this is a contribution to global climate goals, not a way to "cancel out" your own emissions ledger.',
            source: 'SBTi Corporate Net-Zero Standard',
          },
          {
            title: 'Key Takeaways',
            content: '📍 Key Takeaways\n\n✅ The Hierarchy: Avoid → Reduce → Contribute (BVCM) → Neutralize.\n✅ No Shortcuts: You cannot use credits to meet your near-term science-based targets.\n✅ BVCM: Investing in credits now is good, but it is an extra contribution, not a deduction.\n✅ Net Zero: Defined as reducing emissions by ~90% and neutralizing the last ~10%.',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'According to the SBTi, when is it appropriate to use carbon credits to "neutralize" emissions for a Net-Zero claim?',
            options: JSON.stringify([
              'Immediately, to offset your current footprint',
              'Instead of reducing Scope 3 emissions',
              'Only for the final ~10% of residual emissions after you have reduced the rest',
              'Whenever the price of carbon credits is low',
            ]),
            correctAnswer: 2,
            explanation: 'According to SBTi, credits should only be used to neutralize the final ~10% of residual emissions after reducing emissions by ~90%.',
            order: 1,
          },
          {
            question: 'What does BVCM stand for?',
            options: JSON.stringify([
              'Beyond Value Chain Mitigation',
              'Business Value Chain Management',
              'Best Value Carbon Markets',
              'Basic Voluntary Carbon Methods',
            ]),
            correctAnswer: 0,
            explanation: 'BVCM stands for "Beyond Value Chain Mitigation" - the new term for what companies used to call "offsetting" during their transition.',
            order: 2,
          },
          {
            question: 'What is the correct order of the Mitigation Hierarchy?',
            options: JSON.stringify([
              'Neutralize → Reduce → Contribute',
              'Avoid → Reduce → Contribute (BVCM) → Neutralize',
              'Buy Credits → Reduce → Neutralize',
              'Reduce → Buy Credits → Done',
            ]),
            correctAnswer: 1,
            explanation: 'The correct hierarchy is: Avoid → Reduce → Contribute (BVCM) → Neutralize. You must reduce first, then contribute, and only neutralize at the end.',
            order: 3,
          },
        ],
      },
    },
  })
  console.log('✅ Created carbon credit module 2')

  // Carbon Credit Module 3: Identifying High-Quality Credits
  const ccModule3 = await prisma.module.create({
    data: {
      courseId: carbonCreditCourse.id,
      title: 'Identifying High-Quality Credits',
      description: 'How to spot "junk" credits using the Core Carbon Principles (CCPs)',
      order: 3,
      duration: 12,
      badgeName: 'Quality Inspector',
      badgeEmoji: '✅',
      content: JSON.stringify({
        sections: [
          {
            title: 'The Core Carbon Principles',
            content: 'The "CCP-Eligible" Label\n\nThe ICVCM has released 10 "Core Carbon Principles" (CCPs) to identify high-quality credits. In the future, you should look for credits tagged as "CCP-Eligible" in registries.\n\nThis label protects you from buying "junk" credits that don\'t actually help the climate.',
          },
          {
            title: 'The "Big Three" Principles',
            content: 'How to Spot a Real Credit\n\nWhile there are 10 principles, these three are the most critical for your due diligence:\n\nAdditionality: Would this project have happened anyway? If a wind farm was profitable without your money, buying a credit from it is not additional.\n\nPermanence: How long will the carbon stay stored? (e.g., A forest protected for 100 years vs. 5 years).\n\nRobust Quantification: Is the math conservative? Does it account for "leakage" (e.g., protecting one forest but the loggers just moved to the next one)?',
            source: 'ICVCM Assessment Framework',
          },
          {
            title: 'Key Takeaways',
            content: '📍 Key Takeaways\n\n✅ Seek the Label: Prioritize credits that meet the ICVCM "Core Carbon Principles" (CCPs).\n✅ Additionality is Mandatory: If the project didn\'t need the credit revenue to exist, it\'s not a valid offset.\n✅ Check for Leakage: Ensure the emissions didn\'t just move to a neighboring area.\n✅ Vintage Matters: Older credits (e.g., from 2012) often have lower data quality than recent ones.',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What does "Additionality" mean in the context of a carbon credit?',
            options: JSON.stringify([
              'The project adds additional jobs to the local economy',
              'The project creates additional biodiversity benefits',
              'The emissions reduction would not have occurred without the revenue from the carbon credit',
              'The buyer purchases additional credits to be safe',
            ]),
            correctAnswer: 2,
            explanation: 'Additionality means the emissions reduction would not have occurred without the revenue from the carbon credit. If the project was profitable without credit revenue, it\'s not additional.',
            order: 1,
          },
          {
            question: 'What is "Permanence" in carbon credits?',
            options: JSON.stringify([
              'How permanent the company is',
              'How long the carbon will stay stored',
              'How permanent the credit price is',
              'How many years the project lasts',
            ]),
            correctAnswer: 1,
            explanation: 'Permanence refers to how long the carbon will stay stored. A forest protected for 100 years has better permanence than one protected for 5 years.',
            order: 2,
          },
          {
            question: 'What is "leakage" in the context of carbon credits?',
            options: JSON.stringify([
              'Credits leaking from the registry',
              'Emissions moving to a neighboring area when one area is protected',
              'Money leaking from the project',
              'Carbon leaking from storage',
            ]),
            correctAnswer: 1,
            explanation: 'Leakage occurs when protecting one area causes emissions to move to a neighboring area (e.g., protecting one forest but loggers move to the next one).',
            order: 3,
          },
        ],
      },
    },
  })
  console.log('✅ Created carbon credit module 3')

  // Carbon Credit Module 4: Claims & Disclosure
  const ccModule4 = await prisma.module.create({
    data: {
      courseId: carbonCreditCourse.id,
      title: 'Claims & Disclosure',
      description: 'Navigating the VCMI Claims Code and reporting requirements under IFRS S2',
      order: 4,
      duration: 10,
      badgeName: 'Compliance Expert',
      badgeEmoji: '📢',
      content: JSON.stringify({
        sections: [
          {
            title: 'The VCMI Claims Code',
            content: 'Careful What You Say\n\nThe VCMI (Voluntary Carbon Markets Integrity Initiative) provides a "Claims Code of Practice."\n\nDo Not Claim: "We are Carbon Neutral" (unless you have strictly met ISO 14068-1).\n\nDo Claim: "We have made a VCMI Carbon Integrity Claim" (Silver, Gold, or Platinum).\n\nTo make a valid claim, you must first prove you are on track with your own emissions cuts. You cannot buy your way to a Platinum claim if your own emissions are rising.',
          },
          {
            title: 'Reporting to Investors (IFRS S2)',
            content: 'The IFRS S2 Standard\n\nIf your company reports under IFRS/ISSB standards, you are now required to disclose details about your carbon credits in your annual report.\n\nYou must disclose:\n\n• The extent to which you rely on credits to meet targets.\n• Which third-party scheme verified the credits (e.g., Verra, Gold Standard).\n• The type of credit (Nature-based vs. Technology-based).\n• Whether the underlying project is classified as "removal" or "avoidance."',
            source: 'IFRS S2, Paragraph 36',
          },
          {
            title: 'Key Takeaways',
            content: '📍 Key Takeaways\n\n✅ Earn the Right to Claim: You must be on track with your own reductions before claiming credit status.\n✅ VCMI Tiers: Use the VCMI framework (Silver/Gold/Platinum) to validate your claims.\n✅ Transparency is Law: Under IFRS S2, you must disclose the specific details (type, verification, vintage) of credits used.\n✅ Avoid "Greenwashing": Vague terms like "Carbon Neutral" are high-risk; be specific about your "Contribution."',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'Under IFRS S2, which of the following must be disclosed regarding carbon credits?',
            options: JSON.stringify([
              'Only the total cost of the credits',
              'The type of credit (avoidance vs. removal) and the verification scheme used',
              'The names of the individuals who purchased them',
              'No disclosure is required for voluntary credits',
            ]),
            correctAnswer: 1,
            explanation: 'Under IFRS S2, companies must disclose the type of credit (avoidance vs. removal), the verification scheme used, and the extent to which they rely on credits.',
            order: 1,
          },
          {
            question: 'What must you prove before making a VCMI Carbon Integrity Claim?',
            options: JSON.stringify([
              'That you bought expensive credits',
              'That you are on track with your own emissions cuts',
              'That you have the most credits',
              'That credits are from your country',
            ]),
            correctAnswer: 1,
            explanation: 'To make a valid VCMI claim, you must first prove you are on track with your own emissions cuts. You cannot buy your way to a claim if your emissions are rising.',
            order: 2,
          },
          {
            question: 'Why should you avoid claiming "We are Carbon Neutral" without meeting ISO 14068-1?',
            options: JSON.stringify([
              'It\'s too expensive',
              'Vague terms like "Carbon Neutral" are high-risk and can be seen as greenwashing',
              'It requires too much paperwork',
              'It\'s not allowed by law',
            ]),
            correctAnswer: 1,
            explanation: 'Vague terms like "Carbon Neutral" are high-risk and can be seen as greenwashing. Instead, use specific VCMI framework claims (Silver/Gold/Platinum) or meet ISO 14068-1.',
            order: 3,
          },
        ],
      },
    },
  })
  console.log('✅ Created carbon credit module 4')

  // Module 1: Net Zero Fundamentals
  const module1 = await prisma.module.create({
    data: {
      courseId: netZeroCourse.id,
      title: 'Net Zero Fundamentals',
      description:
        'Understand net zero definition, why climate change matters, and the UK\'s 2050 net zero targets. Learn about SME\'s critical role in achieving net zero.',
      order: 1,
      duration: 8,
      badgeName: 'Net Zero Novice',
      badgeEmoji: '🌱',
      content: JSON.stringify({
        sections: [
          {
            title: 'What is Net Zero?',
            content:
              'Put simply, net zero means cutting greenhouse gas emissions to as close to zero as possible, with any remaining emissions re-absorbed from the atmosphere, by oceans and forests for instance.',
            source: 'UN definition, June 2021',
          },
          {
            title: 'Why Does Climate Change Matter?',
            content:
              'Climate change poses significant risks to businesses, communities, and ecosystems. Rising temperatures, extreme weather events, and resource scarcity are already impacting operations worldwide.',
          },
          {
            title: 'UK\'s 2050 Net Zero Target',
            content:
              'The UK has committed to achieving net zero emissions by 2050. This ambitious goal requires collective action from all sectors of the economy.',
          },
          {
            title: 'SMEs: The Critical Role',
            content:
              'Small and medium-sized enterprises (SMEs) represent 99% of UK businesses and are responsible for approximately 50% of business emissions. Your actions matter!',
          },
        ],
        keyTakeaways: [
          'Net zero means cutting emissions to near zero and offsetting the rest',
          'UK must achieve net zero by 2050',
          'SMEs represent 99% of UK businesses and 50% of business emissions',
          'Every business has a role to play in the transition',
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What does "net zero" mean?',
            options: JSON.stringify([
              'Producing zero emissions',
              'Cutting emissions to near zero and offsetting the rest',
              'Using only renewable energy',
              'Planting trees to offset all emissions',
            ]),
            correctAnswer: 1,
            explanation:
              'Net zero means cutting greenhouse gas emissions to as close to zero as possible, with any remaining emissions re-absorbed from the atmosphere.',
            order: 1,
          },
          {
            question: 'What percentage of UK businesses are SMEs?',
            options: JSON.stringify(['50%', '75%', '90%', '99%+']),
            correctAnswer: 3,
            explanation:
              'SMEs represent 99% of UK businesses, making them crucial to achieving net zero goals.',
            order: 2,
          },
          {
            question: 'By what year must the UK achieve net zero?',
            options: JSON.stringify(['2030', '2040', '2050', '2100']),
            correctAnswer: 2,
            explanation:
              'The UK has committed to achieving net zero emissions by 2050 under the Climate Change Act.',
            order: 3,
          },
          {
            question: 'What percentage of business emissions do SMEs account for?',
            options: JSON.stringify(['25%', '35%', '50%', '75%']),
            correctAnswer: 2,
            explanation:
              'SMEs are responsible for approximately 50% of business emissions in the UK.',
            order: 4,
          },
          {
            question: 'What is the difference between net zero and carbon neutral?',
            options: JSON.stringify([
              'They are the same thing',
              'Net zero focuses on all greenhouse gases, carbon neutral only on CO2',
              'Carbon neutral is more ambitious than net zero',
              'Net zero only applies to large businesses',
            ]),
            correctAnswer: 1,
            explanation:
              'Net zero addresses all greenhouse gases, while carbon neutral typically focuses only on carbon dioxide emissions.',
            order: 5,
          },
        ],
      },
    },
  })

  // Module 2: The UK's Net Zero Journey
  const module2 = await prisma.module.create({
    data: {
      courseId: netZeroCourse.id,
      title: "The UK's Net Zero Journey",
      description:
        'Explore UK\'s legal net zero commitment, understand the Net Zero Strategy, learn about Energy Security Strategy, and recognize business role and responsibilities.',
      order: 2,
      duration: 6,
      badgeName: 'UK Climate Champion',
      badgeEmoji: '🇬🇧',
      content: JSON.stringify({
        sections: [
          {
            title: 'UK\'s Legal Commitment',
            content:
              'The UK was the first major economy to pass net zero laws in 2019, amending the Climate Change Act 2008 to commit to net zero emissions by 2050.',
          },
          {
            title: 'Net Zero Strategy',
            content:
              'The UK\'s Net Zero Strategy outlines how the country will decarbonize all sectors of the economy, creating opportunities for businesses to innovate and grow.',
          },
          {
            title: 'Energy Security Strategy',
            content:
              'The Energy Security Strategy aims to accelerate homegrown power and build a more secure, affordable, and clean energy system.',
          },
          {
            title: 'Key Targets',
            content:
              'The UK aims for a 78% emissions reduction by 2035, with net zero by 2050. This represents a £90bn private investment opportunity by 2030.',
          },
        ],
        keyTakeaways: [
          'UK was first major economy to pass net zero laws (2019)',
          'Target: 78% emissions reduction by 2035',
          '£90bn private investment opportunity by 2030',
          'Businesses have a critical role in achieving these targets',
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'When did the UK pass net zero laws?',
            options: JSON.stringify(['2017', '2019', '2021', '2023']),
            correctAnswer: 1,
            explanation:
              'The UK was the first major economy to pass net zero laws in 2019, amending the Climate Change Act.',
            order: 1,
          },
          {
            question: 'What is the UK\'s target for emissions reduction by 2035?',
            options: JSON.stringify(['50%', '65%', '78%', '90%']),
            correctAnswer: 2,
            explanation:
              'The UK aims for a 78% emissions reduction by 2035 as part of its net zero journey.',
            order: 2,
          },
          {
            question: 'What is the estimated private investment opportunity by 2030?',
            options: JSON.stringify(['£30bn', '£60bn', '£90bn', '£120bn']),
            correctAnswer: 2,
            explanation:
              'The UK\'s net zero transition represents a £90bn private investment opportunity by 2030.',
            order: 3,
          },
          {
            question: 'What does the Energy Security Strategy focus on?',
            options: JSON.stringify([
              'Only renewable energy',
              'Homegrown power and energy security',
              'Nuclear power only',
              'Reducing energy consumption',
            ]),
            correctAnswer: 1,
            explanation:
              'The Energy Security Strategy aims to accelerate homegrown power and build a more secure energy system.',
            order: 4,
          },
          {
            question: 'Why is the UK\'s net zero commitment significant?',
            options: JSON.stringify([
              'It was the first major economy to pass such laws',
              'It only applies to large businesses',
              'It has no legal binding',
              'It focuses only on energy sector',
            ]),
            correctAnswer: 0,
            explanation:
              'The UK was the first major economy to pass net zero laws, setting a global precedent.',
            order: 5,
          },
        ],
      },
    },
  })

  // Module 3: Energy Efficiency Wins
  const module3 = await prisma.module.create({
    data: {
      courseId: netZeroCourse.id,
      title: 'Energy Efficiency Wins',
      description:
        'Identify practical energy reduction steps, understand cost-saving opportunities, learn "low-hanging fruit" vs. long-term investments, and recognize benefits beyond cost savings.',
      order: 3,
      duration: 10,
      badgeName: 'Energy Efficiency Expert',
      badgeEmoji: '⚡',
      content: JSON.stringify({
        sections: [
          {
            title: 'Quick Wins',
            content:
              'Start with simple changes that deliver immediate results: LED light bulbs, adjusting heating/cooling settings, reducing packaging waste, and optimizing equipment usage.',
          },
          {
            title: 'Medium-Term Investments',
            content:
              'Consider insulating buildings, switching to electric vehicles, and implementing energy-efficient equipment upgrades.',
          },
          {
            title: 'Long-Term Investments',
            content:
              'Install heat pumps, solar panels, and other renewable energy systems. These require larger upfront investment but deliver significant long-term savings.',
          },
          {
            title: 'Beyond Cost Savings',
            content:
              'Energy efficiency improves brand reputation, enhances employee morale, ensures regulatory compliance, and positions your business for future opportunities.',
          },
        ],
        keyTakeaways: [
          'Start with quick wins like LED bulbs and temperature adjustments',
          'Insulate buildings and switch to electric vehicles',
          'Consider solar panels and heat pumps for long-term savings',
          'Energy efficiency benefits go beyond cost savings',
        ],
        practicalActions: [
          'Insulating buildings',
          'Switching to electric vehicles',
          'Installing heat pumps or solar panels',
          'LED light bulbs',
          'Adjusting heating/cooling settings',
          'Reducing packaging waste',
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'Which is considered a "quick win" for energy efficiency?',
            options: JSON.stringify([
              'Installing solar panels',
              'Switching to LED light bulbs',
              'Building a new energy-efficient facility',
              'Implementing a complete HVAC overhaul',
            ]),
            correctAnswer: 1,
            explanation:
              'LED light bulbs are a quick win - easy to implement with immediate energy savings.',
            order: 1,
          },
          {
            question: 'What is a medium-term energy efficiency investment?',
            options: JSON.stringify([
              'Turning off lights',
              'Installing building insulation',
              'Installing solar panels',
              'Using less paper',
            ]),
            correctAnswer: 1,
            explanation:
              'Building insulation is a medium-term investment that requires some upfront cost but delivers ongoing savings.',
            order: 2,
          },
          {
            question: 'Which long-term investment typically has the highest ROI for energy savings?',
            options: JSON.stringify([
              'LED bulbs',
              'Solar panels',
              'Adjusting thermostat',
              'Reducing paper use',
            ]),
            correctAnswer: 1,
            explanation:
              'Solar panels require significant upfront investment but can provide substantial long-term energy savings and even generate revenue.',
            order: 3,
          },
          {
            question: 'Beyond cost savings, what is a key benefit of energy efficiency?',
            options: JSON.stringify([
              'Increased paperwork',
              'Improved brand reputation',
              'More complex operations',
              'Reduced employee satisfaction',
            ]),
            correctAnswer: 1,
            explanation:
              'Energy efficiency improves brand reputation, showing customers and stakeholders your commitment to sustainability.',
            order: 4,
          },
          {
            question: 'What percentage of energy costs can building insulation typically reduce?',
            options: JSON.stringify(['5-10%', '15-30%', '40-60%', '70-90%']),
            correctAnswer: 1,
            explanation:
              'Proper building insulation can typically reduce energy costs by 15-30% by reducing heating and cooling needs.',
            order: 5,
          },
        ],
      },
    },
  })

  // Module 4: Managing Your Transition
  const module4 = await prisma.module.create({
    data: {
      courseId: netZeroCourse.id,
      title: 'Managing Your Transition',
      description:
        'Take a rounded approach beyond just energy, develop innovation mindset, invest in necessary skills, understand carbon offsetting cautiously, and build collaboration networks.',
      order: 4,
      duration: 12,
      badgeName: 'Transition Manager',
      badgeEmoji: '🔄',
      content: JSON.stringify({
        sections: [
          {
            title: 'Take a Rounded Approach',
            content:
              'Net zero isn\'t just about energy. Consider waste reduction, sustainable design, supply chain management, and circular economy principles.',
          },
          {
            title: 'Innovate',
            content:
              'Think creatively: cycle-to-work schemes, EV subsidies, flexible working arrangements, and process innovations that reduce environmental impact.',
          },
          {
            title: 'Invest in Skills',
            content:
              'Equip your team with knowledge and skills to adapt, innovate, and drive progress. Training and development are investments in your net zero future.',
          },
          {
            title: 'Offset Carbon Cautiously',
            content:
              'Carbon offsetting should only be used with credible schemes and after prioritizing reduction. Offsets complement, not replace, emission reductions.',
          },
          {
            title: 'Collaborate',
            content:
              'Learn from others, influence suppliers, join industry networks, and share best practices. Collaboration accelerates progress.',
          },
          {
            title: 'Seek Guidance',
            content:
              'Access resources from SME Climate Hub, Federation for Small Businesses, chambers of commerce, and sustainability consultants.',
          },
        ],
        keyTakeaways: [
          'Take a rounded approach: energy + waste + design',
          'Innovate with schemes like cycle-to-work and EV subsidies',
          'Invest in skills and training for your team',
          'Offset carbon only with credible schemes, prioritize reduction',
          'Collaborate with others and seek guidance from experts',
        ],
        sixSteps: [
          'Take a rounded approach - Energy + waste reduction + design',
          'Innovate - Cycle-to-work schemes, EV subsidies',
          'Invest in skills - Adapt, innovate, assist progress',
          'Offset carbon - Only with credible schemes, prioritize reduction',
          'Collaborate - Learn from others, influence suppliers',
          'Seek guidance - SME Climate Hub, FSB, chambers of commerce',
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What does a "rounded approach" to net zero include?',
            options: JSON.stringify([
              'Only energy efficiency',
              'Energy + waste reduction + design',
              'Only carbon offsetting',
              'Only renewable energy',
            ]),
            correctAnswer: 1,
            explanation:
              'A rounded approach considers energy, waste reduction, sustainable design, and other factors beyond just energy.',
            order: 1,
          },
          {
            question: 'When should carbon offsetting be used?',
            options: JSON.stringify([
              'As the primary strategy',
              'Only with credible schemes after prioritizing reduction',
              'Instead of reducing emissions',
              'Only for large businesses',
            ]),
            correctAnswer: 1,
            explanation:
              'Carbon offsetting should only be used with credible schemes and after prioritizing emission reductions.',
            order: 2,
          },
          {
            question: 'What is an example of innovation for net zero?',
            options: JSON.stringify([
              'Doing nothing',
              'Cycle-to-work schemes',
              'Increasing energy use',
              'Avoiding collaboration',
            ]),
            correctAnswer: 1,
            explanation:
              'Cycle-to-work schemes are innovative approaches that reduce emissions while benefiting employees.',
            order: 3,
          },
          {
            question: 'Why is investing in skills important for net zero?',
            options: JSON.stringify([
              'It\'s not important',
              'To equip teams to adapt, innovate, and drive progress',
              'Only for large companies',
              'Skills don\'t matter',
            ]),
            correctAnswer: 1,
            explanation:
              'Investing in skills equips your team with knowledge to adapt, innovate, and drive net zero progress.',
            order: 4,
          },
          {
            question: 'Where can SMEs seek guidance for net zero?',
            options: JSON.stringify([
              'Nowhere',
              'SME Climate Hub, FSB, chambers of commerce',
              'Only from competitors',
              'Only from government',
            ]),
            correctAnswer: 1,
            explanation:
              'SMEs can seek guidance from SME Climate Hub, Federation for Small Businesses, chambers of commerce, and other resources.',
            order: 5,
          },
        ],
      },
    },
  })

  // Module 5: Standards & Certification
  const module5 = await prisma.module.create({
    data: {
      courseId: netZeroCourse.id,
      title: 'Standards & Certification',
      description:
        'Understand role of ISO standards, learn about ISO 50005 for SMEs, explore certification benefits, and recognize competitive advantages.',
      order: 5,
      duration: 10,
      badgeName: 'Standards Scholar',
      badgeEmoji: '📜',
      content: JSON.stringify({
        sections: [
          {
            title: 'ISO 50005 for SMEs',
            content:
              'ISO 50005 provides a phased approach to energy management specifically designed for SMEs, making it accessible and practical.',
          },
          {
            title: 'Key Standards',
            content:
              'ISO 14001 (Environmental Management), ISO 14064-1/2 (GHG Emissions Measurement), ISO 50001 (Energy Management), PAS 2060 (Carbon Neutrality), PAS 2050 (Carbon Footprinting).',
          },
          {
            title: 'Certification Benefits',
            content:
              '74% report reputational benefits, 63% see direct cost savings, 61% experience increased staff morale. Certification demonstrates commitment and drives continuous improvement.',
          },
          {
            title: 'Competitive Advantages',
            content:
              'Certification can open doors to new customers, tenders, and partnerships. It demonstrates credibility and commitment to sustainability.',
          },
        ],
        keyTakeaways: [
          'ISO 50005 provides a phased approach for SMEs',
          '74% report reputational benefits from ISO 14001',
          '63% see direct cost savings from certification',
          '61% experience increased staff morale',
          'Certification provides competitive advantages',
        ],
        standards: [
          'ISO 50005 - Phased energy management for SMEs',
          'ISO 14001 - Environmental management',
          'ISO 14064-1/2 - GHG emissions measurement',
          'ISO 50001 - Energy management',
          'PAS 2060 - Carbon neutrality',
          'PAS 2050 - Carbon footprinting',
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'Which ISO standard is specifically designed for SMEs?',
            options: JSON.stringify([
              'ISO 14001',
              'ISO 50005',
              'ISO 50001',
              'PAS 2060',
            ]),
            correctAnswer: 1,
            explanation:
              'ISO 50005 provides a phased approach to energy management specifically designed for SMEs.',
            order: 1,
          },
          {
            question: 'What percentage of businesses report reputational benefits from ISO 14001?',
            options: JSON.stringify(['50%', '63%', '74%', '85%']),
            correctAnswer: 2,
            explanation:
              '74% of businesses report reputational benefits from ISO 14001 certification.',
            order: 2,
          },
          {
            question: 'What percentage see direct cost savings from certification?',
            options: JSON.stringify(['50%', '63%', '74%', '85%']),
            correctAnswer: 1,
            explanation:
              '63% of businesses see direct cost savings from ISO 14001 certification.',
            order: 3,
          },
          {
            question: 'What does PAS 2060 cover?',
            options: JSON.stringify([
              'Energy management',
              'Carbon neutrality',
              'Environmental management',
              'GHG measurement',
            ]),
            correctAnswer: 1,
            explanation: 'PAS 2060 covers carbon neutrality standards.',
            order: 4,
          },
          {
            question: 'What is a key competitive advantage of certification?',
            options: JSON.stringify([
              'Increased paperwork',
              'Opens doors to new customers and tenders',
              'Higher costs',
              'No benefits',
            ]),
            correctAnswer: 1,
            explanation:
              'Certification can open doors to new customers, tenders, and partnerships, providing competitive advantages.',
            order: 5,
          },
        ],
      },
    },
  })

  // Module 6: Case Study - Real Impact
  const module6 = await prisma.module.create({
    data: {
      courseId: netZeroCourse.id,
      title: 'Case Study - Real Impact',
      description:
        'Learn from Avara Foods\' success, understand practical implementation, see measurable results (1000+ MWh savings), and recognize cultural transformation power.',
      order: 6,
      duration: 8,
      badgeName: 'Implementation Pro',
      badgeEmoji: '🏆',
      content: JSON.stringify({
        sections: [
          {
            title: 'Avara Foods Journey',
            content:
              'Avara Foods has been using ISO 50001 for 5 years, demonstrating long-term commitment to energy management and continuous improvement.',
          },
          {
            title: 'Measurable Results',
            content:
              'Saved 1000+ megawatt hours of grid electricity, installed 4 combined heat/power plants, 12 biomass boilers (wood chip/pellets), with consistent year-over-year reductions.',
          },
          {
            title: 'Cultural Transformation',
            content:
              'The success wasn\'t just about technology - it required cultural change, employee engagement, and leadership commitment.',
          },
          {
            title: 'Key Learnings',
            content:
              'ISO 50001 should be seen as a win-win situation that drives continual improvement, not red tape or bureaucracy. It requires passion and commitment from leadership.',
          },
        ],
        keyTakeaways: [
          '5 years using ISO 50001',
          'Saved 1000+ megawatt hours of grid electricity',
          'Installed 4 combined heat/power plants',
          '12 biomass boilers',
          'Consistent year-over-year reductions',
          'Cultural transformation is key to success',
        ],
        quote:
          '"I\'m really passionate about the scale and the impact that BS EN ISO 50001 can have. Other manufacturers should not see it as red tape or bureaucracy, but as a win-win situation that really drives continual improvement." - Baishakhi Sengupta, Avara',
      }),
      quizzes: {
        create: [
          {
            question: 'How long has Avara Foods been using ISO 50001?',
            options: JSON.stringify(['1 year', '3 years', '5 years', '10 years']),
            correctAnswer: 2,
            explanation:
              'Avara Foods has been using ISO 50001 for 5 years, showing long-term commitment.',
            order: 1,
          },
          {
            question: 'How much grid electricity has Avara Foods saved?',
            options: JSON.stringify([
              '100+ MWh',
              '500+ MWh',
              '1000+ MWh',
              '5000+ MWh',
            ]),
            correctAnswer: 2,
            explanation:
              'Avara Foods has saved 1000+ megawatt hours of grid electricity through their energy management efforts.',
            order: 2,
          },
          {
            question: 'How many combined heat/power plants has Avara Foods installed?',
            options: JSON.stringify(['1', '2', '4', '8']),
            correctAnswer: 2,
            explanation:
              'Avara Foods has installed 4 combined heat/power plants as part of their energy efficiency strategy.',
            order: 3,
          },
          {
            question: 'What does Baishakhi Sengupta say ISO 50001 should be seen as?',
            options: JSON.stringify([
              'Red tape',
              'A win-win situation that drives continual improvement',
              'Bureaucracy',
              'Unnecessary paperwork',
            ]),
            correctAnswer: 1,
            explanation:
              'Baishakhi Sengupta emphasizes that ISO 50001 should be seen as a win-win situation that drives continual improvement.',
            order: 4,
          },
          {
            question: 'What is key to Avara Foods\' success?',
            options: JSON.stringify([
              'Only technology',
              'Cultural transformation and employee engagement',
              'Avoiding standards',
              'Minimal investment',
            ]),
            correctAnswer: 1,
            explanation:
              'Avara Foods\' success required cultural transformation, employee engagement, and leadership commitment, not just technology.',
            order: 5,
          },
        ],
      },
    },
  })

  // Module 7: Your Action Plan
  const module7 = await prisma.module.create({
    data: {
      courseId: netZeroCourse.id,
      title: 'Your Action Plan',
      description:
        'Create personalized net zero roadmap, set SMART goals, identify accountability partners, and plan first 30/60/90 days.',
      order: 7,
      duration: 15,
      badgeName: 'Climate Action Hero',
      badgeEmoji: '🌍',
      content: JSON.stringify({
        sections: [
          {
            title: 'Commit Your Business',
            content:
              'Make a public commitment to net zero. Join initiatives like SME Climate Hub and communicate your commitment to stakeholders.',
          },
          {
            title: 'Set SMART Goals',
            content:
              'Create Specific, Measurable, Achievable, Relevant, and Time-bound goals. Start with quick wins, then plan medium and long-term actions.',
          },
          {
            title: '30/60/90 Day Plan',
            content:
              '30 days: Complete energy audit, identify quick wins, make initial commitments. 60 days: Implement quick wins, start medium-term planning. 90 days: Review progress, adjust strategy, plan long-term investments.',
          },
          {
            title: 'Identify Accountability Partners',
            content:
              'Find partners who can support your journey: sustainability consultants, industry peers, certification bodies, and internal champions.',
          },
          {
            title: 'Select Tools and Standards',
            content:
              'Choose appropriate tools and standards for your business size and sector. Consider ISO 50005 for SMEs, carbon footprinting tools, and energy management systems.',
          },
        ],
        keyTakeaways: [
          'Commit your business to net zero',
          'Set SMART goals',
          'Create a 30/60/90 day plan',
          'Identify accountability partners',
          'Select effective tools and standards',
          'Strive for energy efficiencies',
          'Take a rounded approach',
          'Innovate and collaborate',
        ],
        nextSteps: [
          'Commit your business to net zero',
          'Strive for energy efficiencies',
          'Consider benefits as much as costs',
          'Take a rounded approach',
          'Innovate',
          'Invest in skills',
          'Invest in credible offsetting schemes',
          'Collaborate',
          'Seek guidance',
          'Select effective tools and standards',
        ],
        resources: [
          {
            name: 'SME Climate Hub',
            url: 'https://businessclimatehub.org/uk/',
          },
          {
            name: 'Federation for Small Businesses',
            url: 'https://www.fsb.org.uk',
          },
          {
            name: 'BSI Standards',
            url: 'https://bsigroup.com',
          },
        ],
      }),
      quizzes: {
        create: [
          {
            question: 'What does SMART stand for in goal setting?',
            options: JSON.stringify([
              'Simple, Measurable, Achievable, Relevant, Timely',
              'Specific, Measurable, Achievable, Relevant, Time-bound',
              'Strategic, Measurable, Achievable, Relevant, Timely',
              'Specific, Meaningful, Achievable, Relevant, Time-bound',
            ]),
            correctAnswer: 1,
            explanation:
              'SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound.',
            order: 1,
          },
          {
            question: 'What should you do in the first 30 days?',
            options: JSON.stringify([
              'Install solar panels',
              'Complete energy audit and identify quick wins',
              'Get ISO certification',
              'Do nothing',
            ]),
            correctAnswer: 1,
            explanation:
              'In the first 30 days, complete an energy audit, identify quick wins, and make initial commitments.',
            order: 2,
          },
          {
            question: 'What is a key resource for SMEs starting their net zero journey?',
            options: JSON.stringify([
              'Only government websites',
              'SME Climate Hub',
              'Competitor websites',
              'Social media only',
            ]),
            correctAnswer: 1,
            explanation:
              'SME Climate Hub is a key resource specifically designed for SMEs starting their net zero journey.',
            order: 3,
          },
          {
            question: 'Why is identifying accountability partners important?',
            options: JSON.stringify([
              'It\'s not important',
              'They can support and guide your journey',
              'Only for large businesses',
              'Partners don\'t help',
            ]),
            correctAnswer: 1,
            explanation:
              'Accountability partners can provide support, guidance, and help maintain momentum in your net zero journey.',
            order: 4,
          },
          {
            question: 'What should be included in your action plan?',
            options: JSON.stringify([
              'Only energy efficiency',
              'Energy efficiencies, rounded approach, innovation, collaboration',
              'Only carbon offsetting',
              'Only certification',
            ]),
            correctAnswer: 1,
            explanation:
              'Your action plan should include energy efficiencies, a rounded approach, innovation, collaboration, and other key elements.',
            order: 5,
          },
        ],
      },
    },
  })

  console.log('✅ Database seeded successfully')
  console.log(`   Created ${await prisma.module.count()} modules`)
  console.log(`   Created ${await prisma.quiz.count()} quiz questions`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
