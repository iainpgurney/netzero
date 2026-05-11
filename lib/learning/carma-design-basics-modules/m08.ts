import type { CurriculumModule } from '../carma-design-basics-curriculum.types'

export const carmaDesignBasicsM08: CurriculumModule = {
  order: 8,
  title: 'Product imagery and feedback loops',
  description:
    'Producing screenshots and mockups of Carma products, and running design reviews that improve the work.',
  duration: 35,
  badgeName: 'Polished Shipper',
  badgeEmoji: '✅',
  content: {
    sections: [
      {
        title: 'Screenshots that look intentional',
        content: `A screenshot of a product UI is one of the most common assets a marketer at Carma will need. MyCarma dashboards, the Shopify app, the Carma Carbon platform. The default — take a screenshot, crop, post — looks lazy. A few small steps make a screenshot look like a designed asset rather than a captured frame.

First, clean the data. Real user data should not appear in marketing screenshots — names, emails, real numbers. Use demo data or anonymise. Second, use a device frame. A bare browser screenshot looks like a bug report. A laptop or phone frame around it signals product. Canva has device mockup templates. Third, place the screenshot on a branded background rather than presenting it raw.`,
      },
      {
        title: 'Device mockups',
        content: `Device mockups put your product UI inside a realistic frame — a laptop, phone, or tablet. They communicate that something is a working product, not a sketch. Canva has a Mockups feature that does this in two clicks. Upload your screenshot, pick a device, done.

Do not over-rely on mockups. A screenshot in a laptop frame is good for hero images and case studies. A simple cropped screenshot with a labelled callout arrow is better for tutorial content and how-to posts. Match the format to the purpose.`,
      },
      {
        title: 'When to ask engineering for help',
        content: `Sometimes the screenshot you need does not exist yet. A new feature that has not shipped. A state of the UI that requires specific data. A view only an admin can see. These need engineering support to produce, and the right way to ask is with a clear written brief, not a Slack message saying "can you screenshot this for me".

The brief should specify which page, what data state, what device size, and whether the screenshot needs to be marked as not yet released. Engineering will produce a much better asset from a clear brief in two minutes than from a vague request that ping-pongs for an afternoon. Treat engineering time as a constrained resource, because it is.`,
      },
      {
        title: 'Giving and receiving feedback',
        content: `Design feedback is where junior marketers most often get stung. Two failure modes are common. Taking feedback personally, which slows everything down. Giving feedback as opinion rather than as observation, which makes the feedback hard to act on.

Good feedback is specific and impersonal. "The hierarchy feels off — the price is bigger than the headline" is actionable. "I don't like it" is not. When receiving feedback, separate the comment from yourself. The work is on the screen. The feedback is about the work, not about you. Ask for the reasoning behind any comment you do not understand.`,
      },
      {
        title: 'The review workflow',
        content: `Every piece of work that goes external should pass through a review before it ships. The lightweight version: draft in Canva, share the link, ask one colleague for feedback, revise, ship. The heavier version, for high-stakes assets such as launch campaigns or board-bound visuals: draft, internal review with two reviewers, revise, sign-off from the relevant lead, ship.

The trap is treating review as a formality. Reviewers spot things you have stopped seeing. Build review into the timeline rather than tacking it on at the end. A piece of work scheduled to publish Friday afternoon should be in review by Wednesday, not Friday morning.`,
      },
      {
        title: 'The pre-publish checklist',
        content: `Before any asset goes live, run a short checklist. Is the message clear in the first two seconds? Is the headline hierarchy correct? Is the contrast readable on mobile? Is the logo placement correct and not oversized? Are all data points correct and properly cited? Is the export format right for the channel? Have you saved the source file in the right folder with the right name?

This takes two minutes and catches the small errors that would otherwise be visible to the audience. Make it a habit. Embarrassing mistakes almost always show up because the checklist was skipped, not because the design was wrong.`,
      },
    ],
    keyTakeaways: [
      'Clean data, add a device frame, and place on a branded background to lift screenshots from lazy to intentional',
      'Match the mockup style to the purpose — laptop frames for hero, simple crops for tutorials',
      'Brief engineering clearly when you need a screenshot that requires their support',
      'Give feedback as specific observation, not opinion; receive feedback by separating it from yourself',
      'Build review into the timeline rather than tacking it on at the end',
      'A two-minute pre-publish checklist catches most embarrassing mistakes',
    ],
  },
  quizzes: [
    {
      question: 'What is the first thing to check before using a product screenshot in marketing?',
      options: [
        'The file format',
        'Whether the data shown is real user data that should be replaced with demo or anonymised data',
        'The colour saturation',
        'The screen resolution',
      ],
      correctAnswer: 1,
      explanation:
        'Real user data — names, emails, real numbers — should not appear in marketing screenshots. Use demo data or anonymise before publishing.',
      order: 1,
    },
    {
      question: 'When is a device mockup most useful?',
      options: [
        'For every screenshot, always',
        'For hero images and case studies where you want to signal a real working product',
        'Only for internal use',
        'Never — they look amateur',
      ],
      correctAnswer: 1,
      explanation:
        'Mockups communicate that something is a real product rather than a sketch. They suit hero images and case studies. Simple cropped screenshots are often better for tutorials and how-to content.',
      order: 2,
    },
    {
      question:
        'You need a screenshot of a feature that requires specific data and is not yet live. What is the right approach?',
      options: [
        'Make up the data and screenshot the closest available view',
        'Send a one-line Slack to engineering saying "can you screenshot this"',
        'Send a clear written brief specifying page, data state, device size, and whether to mark as unreleased',
        'Skip the asset and pick a different campaign',
      ],
      correctAnswer: 2,
      explanation:
        'A clear brief gets a better asset in less time. Vague requests ping-pong for hours. Engineering time is a constrained resource and a good brief respects that.',
      order: 3,
    },
    {
      question: 'Which of these is good design feedback?',
      options: [
        "I don't like it",
        'It feels weird',
        'The hierarchy feels off — the price is bigger than the headline, which buries the main message',
        'Just redo it',
      ],
      correctAnswer: 2,
      explanation:
        'Good feedback is specific and impersonal. It identifies the issue and points at why it matters, which makes it actionable.',
      order: 4,
    },
    {
      question: 'An asset is scheduled to publish on Friday afternoon. When should it be in review?',
      options: [
        'Friday morning, two hours before publishing',
        'By Wednesday, so revisions have time to happen properly',
        'Review is a formality — skip it',
        'Only if the campaign is over a certain budget',
      ],
      correctAnswer: 1,
      explanation:
        'Review needs to be built into the timeline, not tacked on. Reviewers catch things the maker has stopped seeing, and revisions need time.',
      order: 5,
    },
    {
      question: 'What does the two-minute pre-publish checklist achieve?',
      options: [
        'Nothing — it is bureaucracy',
        'It catches the small errors that would otherwise be visible to the audience, such as bad contrast on mobile or oversized logos',
        'It replaces the need for review',
        'It only checks file size',
      ],
      correctAnswer: 1,
      explanation:
        'Embarrassing mistakes almost always show up because someone skipped the checklist, not because the underlying design was bad. Two minutes saves the post-publish scramble.',
      order: 6,
    },
  ],
}
