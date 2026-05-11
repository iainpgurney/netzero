import type { CurriculumModule } from '../carma-design-basics-curriculum.types'

export const carmaDesignBasicsM01: CurriculumModule = {
  order: 1,
  title: 'Design foundations for non-designers',
  description:
    'The five visual principles that fix most amateur design before you touch a tool.',
  duration: 30,
  badgeName: 'Sharp Eye',
  badgeEmoji: '👁️',
  content: {
    sections: [
      {
        title: 'Why this comes before Canva',
        content: `Most bad marketing design is not a tool problem. It is an eye problem. You can have Canva Pro, every template, and the best brand kit in the world, and still produce work that looks amateur because the underlying composition is wrong. This module gives you the five principles that, once internalised, will make every choice in Canva easier and faster.

The goal is not to make you a designer. It is to make you someone who can spot when something is off and fix it without guessing. You will learn the names of the things you have always vaguely sensed but could not articulate.`,
      },
      {
        title: 'Principle 1: Visual hierarchy',
        content: `Hierarchy is the order in which the eye moves through a design. In a good design, the most important thing is seen first, the second most important thing second, and so on. In a bad design, everything shouts at once and the eye does not know where to land.

You create hierarchy through size, weight, colour, and position. A 48-point bold headline beats a 14-point paragraph every time. The single biggest mistake new designers make is treating every element as equally important. Decide what the one thing is. Make it obvious. Everything else supports it.`,
      },
      {
        title: 'Principle 2: Contrast',
        content: `Contrast is the difference between elements. Light against dark. Big against small. Thin against thick. Without contrast, things blur together and the design feels flat. With too little contrast, text becomes unreadable, especially on mobile.

The practical test: squint at your design. If the headline still pops, your contrast is working. If everything turns to mush, it is not. Aim for a contrast ratio of at least 4.5 to 1 for body text against its background. Canva has a built-in contrast checker.`,
      },
      {
        title: 'Principle 3: Alignment',
        content: `Alignment is the invisible line that ties elements together. Left-aligned text shares an edge. Centred elements share a midpoint. When elements do not align to anything, the design feels chaotic even if the individual pieces look fine.

Pick an alignment and commit. Mixing left, centre, and right alignment in the same composition almost never works. When in doubt, left-align everything. It is the most readable and the hardest to get wrong.`,
      },
      {
        title: 'Principle 4: Proximity',
        content: `Things that belong together should sit close together. Things that do not belong should sit further apart. A headline and its subtitle are one unit. A logo and a CTA button are not. New designers tend to space everything equally, which makes the design read as one undifferentiated block.

Group related elements tightly. Use generous space between groups. The space is doing work, even when it looks empty.`,
      },
      {
        title: 'Principle 5: Whitespace',
        content: `Whitespace, or negative space, is the empty area around and between elements. It is not wasted space. It is what gives your design room to breathe and tells the eye where to rest.

Beginners crowd their designs because empty space feels like a missed opportunity. It is not. A single sharp headline on a mostly empty canvas looks more confident, more premium, and more readable than the same headline crammed in with three supporting graphics. When in doubt, take something out.`,
      },
      {
        title: 'How to apply this',
        content: `Before you open Canva for any piece of work, ask yourself four questions. What is the one thing the viewer should see first? Is there enough contrast for it to stand out? Are my elements aligned to a shared edge? Have I given the design room to breathe?

If the answer to any of those is no, fix it before worrying about colours, fonts, or icons. The principles do the heavy lifting. The styling is the polish on top.`,
      },
    ],
    keyTakeaways: [
      'Bad design is usually a composition problem, not a tool problem',
      'Decide on the single most important element and make it dominate',
      'Squint at your design to check whether contrast is doing its job',
      'Commit to one alignment system and apply it consistently',
      'Group related elements tightly and separate unrelated ones with generous space',
      'Empty space is a design choice, not a missed opportunity',
    ],
  },
  quizzes: [
    {
      question: 'What is visual hierarchy?',
      options: [
        'The order in which the eye moves through a design',
        'The ranking of brand colours from primary to tertiary',
        'A Canva feature that auto-arranges elements',
        'The number of layers in a design file',
      ],
      correctAnswer: 0,
      explanation:
        'Visual hierarchy is the order in which the eye moves through a design. You create it through size, weight, colour, and position so the viewer sees the most important thing first.',
      order: 1,
    },
    {
      question: 'What is the quickest practical test for whether your design has enough contrast?',
      options: [
        'Print it in black and white',
        'Squint at it and see if the headline still pops',
        'Check the file size',
        'Ask a colleague if they like it',
      ],
      correctAnswer: 1,
      explanation:
        'Squinting blurs detail and reveals whether contrast is doing its job. If the headline still stands out when blurred, the contrast is working.',
      order: 2,
    },
    {
      question:
        'When elements in a design do not align to a shared edge or midpoint, the design tends to feel:',
      options: [
        'Premium and confident',
        'Modern and minimalist',
        'Chaotic, even if the individual pieces look fine',
        'Balanced and harmonious',
      ],
      correctAnswer: 2,
      explanation:
        'Alignment is the invisible line that ties elements together. Without it, even good-looking individual elements read as chaotic.',
      order: 3,
    },
    {
      question: 'According to the proximity principle, how should related elements be arranged?',
      options: [
        'Spaced evenly with all other elements on the canvas',
        'Tightly grouped together, with more space separating them from unrelated elements',
        'Centred on the canvas regardless of relationship',
        'Always stacked vertically',
      ],
      correctAnswer: 1,
      explanation:
        'Things that belong together should sit close together, and things that do not should sit further apart. Equal spacing makes everything read as one block.',
      order: 4,
    },
    {
      question:
        'A new designer feels uncomfortable leaving empty space in a layout and adds extra graphics to fill it. What is the better instinct?',
      options: [
        'Add more graphics until the canvas is full',
        'Increase the headline size until it touches the edges',
        'Leave the empty space — it gives the design room to breathe',
        'Add a background pattern to remove the empty space',
      ],
      correctAnswer: 2,
      explanation:
        'Whitespace is a design choice, not wasted space. Empty area around elements makes the design feel more confident and more readable.',
      order: 5,
    },
  ],
}
