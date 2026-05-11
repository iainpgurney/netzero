import type { CurriculumModule } from '../carma-design-basics-curriculum.types'

export const carmaDesignBasicsM06: CurriculumModule = {
  order: 6,
  title: 'Slide decks',
  description:
    'Building decks that hold attention, with structure before style and one idea per slide.',
  duration: 40,
  badgeName: 'Deck Builder',
  badgeEmoji: '📊',
  content: {
    sections: [
      {
        title: 'Structure before style',
        content: `The single most common failure in slide decks is starting in the editor. You open Canva or PowerPoint, pick a template, and start filling slides. Two hours later you have something that looks fine but does not actually argue anything. Structure first, slides second.

Write the deck as a list of one-line messages before you make a single slide. Each line is the headline of a slide. If the line does not stand on its own as a statement, the slide is not yet sharp enough. Claude is good for this — describe the audience and the goal, ask for a deck outline as a list of slide headlines.`,
      },
      {
        title: 'One idea per slide',
        content: `Every slide should communicate exactly one idea. If you find yourself needing two headlines, you have two slides. If the slide has three bullet points making three separate arguments, it is three slides. The instinct to compress everything onto one slide to save the audience time has the opposite effect. Dense slides slow the audience down and lose them.

The headline is the idea. Everything else on the slide supports the headline. If a chart, image, or bullet does not support the headline, it does not belong on the slide. Cut it or move it.`,
      },
      {
        title: 'When to use a template and when to build from scratch',
        content: `For internal decks, sales decks, and partner pitches, work from the Carma deck template. The template carries the brand and saves time. Customise within the template — choose layouts, swap images — but do not redesign the master slides without a good reason.

For board decks, finance updates, and one-off strategic pieces, building from scratch is often better. These decks are dense, specific, and rarely reusable. A custom layout for each slide is appropriate. Use the brand kit colours and fonts, but do not try to force the standard template onto content it was not designed for.`,
      },
      {
        title: 'Presenter notes',
        content: `Presenter notes are the script that goes with each slide. They are not the same as the slide content. The slide is what the audience sees. The notes are what the presenter says. New designers often leave notes empty, which means the presenter has to invent the narration on the day.

Fill the notes with the two or three sentences the presenter should say while the slide is on screen. This serves the presenter, makes the deck reusable, and forces you to clarify what the slide is actually for. If you cannot write two sentences of narration for a slide, the slide is not pulling its weight.`,
      },
      {
        title: 'Export formats',
        content: `Different audiences need different exports. For sales decks sent over email, export as PDF — it preserves layout across devices and prevents the recipient from editing. For decks you will present live, keep the PPTX or Canva link and use presenter view. For board decks that need annotation, export as PDF with notes pages.

File size matters. A 50 MB PPTX of a 12-slide deck is almost always images that were not compressed. Compress images in the deck before export. Most recipients will not download a 50 MB email attachment.`,
      },
      {
        title: 'Worked example: a partner pitch',
        content: `You are building a 10-slide partner pitch. Start in Claude with the audience — a sustainability lead at a UK manufacturer. Goal — secure a 30-minute follow-up call. Ask for a 10-slide outline as one-line headlines.

Claude returns: 1) The problem they have. 2) Why current solutions fall short. 3) Our approach in one sentence. 4) Proof point one. 5) Proof point two. 6) How we work with partners. 7) Pricing in a single line. 8) The team. 9) What happens next. 10) Contact and CTA.

Open the Carma deck template. Build each slide as a single headline with supporting visual or chart. Write presenter notes for each. Export as PDF for cold send, keep the editable file for the call.`,
      },
    ],
    keyTakeaways: [
      'Write the deck as a list of one-line headlines before opening the editor',
      'One idea per slide — if there are two ideas, there are two slides',
      'Use the standard template for sales and partner decks, build from scratch for one-off strategic decks',
      'Fill presenter notes with what the presenter should actually say',
      'Match the export format to the audience — PDF for email, PPTX for live, compressed images always',
    ],
  },
  quizzes: [
    {
      question: 'What is the recommended first step when building a slide deck?',
      options: [
        'Open Canva and start filling templates',
        'Write the deck as a list of one-line headlines, one per slide, before opening the editor',
        'Choose the colour scheme',
        'Find images to use',
      ],
      correctAnswer: 1,
      explanation:
        'Structure before style. A list of one-line headlines forces you to clarify the argument before committing time to visual execution.',
      order: 1,
    },
    {
      question: 'A slide has three bullet points making three separate arguments. What should you do?',
      options: [
        'Make the bullets bigger',
        'Add a chart to illustrate them',
        'Split it into three slides — one idea per slide',
        'Move them all to the presenter notes',
      ],
      correctAnswer: 2,
      explanation:
        'Each slide should communicate exactly one idea. Three arguments means three slides. Dense slides lose the audience.',
      order: 2,
    },
    {
      question: 'When should you build a deck from scratch rather than using the standard template?',
      options: [
        'Always — templates are for amateurs',
        'Never — always use the template',
        'For dense, one-off strategic pieces like board decks where the standard template does not fit the content',
        'Only when you have lots of time',
      ],
      correctAnswer: 2,
      explanation:
        'Standard templates work well for sales and partner pitches. One-off strategic decks with dense, specific content often need custom layouts within the brand kit.',
      order: 3,
    },
    {
      question: 'What should the presenter notes contain?',
      options: [
        'Nothing — leave them empty',
        'A copy of the slide text',
        'Two or three sentences the presenter should actually say while the slide is on screen',
        'A list of references',
      ],
      correctAnswer: 2,
      explanation:
        'Notes are the script. They make the deck reusable by future presenters and force you to articulate what the slide is for.',
      order: 4,
    },
    {
      question: 'You are sending a sales deck over email. Which export format is most appropriate?',
      options: [
        'PPTX, uncompressed, at 80 MB',
        'PDF with compressed images, so layout is preserved and the file is small enough to email',
        'An editable Canva link only',
        'A PNG of each slide',
      ],
      correctAnswer: 1,
      explanation:
        'PDF preserves layout across devices and prevents accidental edits. Compressed images keep the file size reasonable for email.',
      order: 5,
    },
  ],
}
