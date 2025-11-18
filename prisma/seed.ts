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

  // Clear existing data (except users)
  await prisma.quizAttempt.deleteMany()
  await prisma.badge.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.userProgress.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.module.deleteMany()

  // Module 1: Net Zero Fundamentals
  const module1 = await prisma.module.create({
    data: {
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
