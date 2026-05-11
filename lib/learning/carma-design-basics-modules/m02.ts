import type { CurriculumModule } from '../carma-design-basics-curriculum.types'

export const carmaDesignBasicsM02: CurriculumModule = {
  order: 2,
  title: 'The Carma brand in practice',
  description:
    'Turning the existing brand doc into a working Canva brand kit and a clear set of visual rules.',
  duration: 40,
  badgeName: 'Brand Steward',
  badgeEmoji: '🌿',
  content: {
    sections: [
      {
        title: 'What a brand kit is and why it matters',
        content: `A brand kit is a set of locked assets and rules that mean every piece of work you produce looks like it came from the same organisation. Logos, colours, fonts, photography style, and tone of voice. Without one, every design becomes a fresh negotiation with yourself, and small inconsistencies pile up over time.

Carma already has a brand document. Your job is not to invent a new brand. It is to translate the existing document into a Canva brand kit that you and anyone else producing work can use without thinking. You are codifying decisions that have already been made.`,
      },
      {
        title: 'Setting up the Canva brand kit',
        content: `In Canva, open Brand Hub and create a new brand kit named Carma. Upload the primary logo, any approved variants such as monochrome or stacked, and the favicon. Add the brand colours as named swatches so they appear in every design picker. Set the brand fonts for headings, subheadings, and body, with the correct weights.

Do this once, properly, and every new design you start will inherit the right defaults. Skipping this step and picking colours and fonts ad hoc is the single biggest source of brand drift. Treat the brand kit setup as a real piece of work, not admin.`,
      },
      {
        title: 'Photography rules',
        content: `Photography is where most brands lose their identity. The shorthand for Carma is proof-led, project-led imagery. Owned photography of real Carma work — planting days, project sites, the team, partners — beats stock every time. If you cannot find an owned shot, the second-best option is licensed photography that looks like it could have been taken on a Carma project. Generic stock photography of forests, smokestacks, or smiling office workers is the failure mode.

You will hit gaps. The photo library is patchy. When that happens, the right move is to flag the gap, request a shot for the next planting day or project visit, and use a placeholder or licensed image marked clearly as temporary. Do not let a gap become permanent through reuse.`,
      },
      {
        title: 'Tone in visual work',
        content: `Carma's written tone is direct and proof-led. The visual equivalent is the same. Strong claims need supporting evidence on the page. A statistic without a source is weaker than a statistic with one. A photo of a project with a project name and location is stronger than a photo with no caption.

The principle is the same in image as in copy. If you cannot show the evidence, you do not have a proof point, you have a claim. This shapes the choices you make about what to put in a tile, what to caption, and what to leave out.`,
      },
      {
        title: 'What to lock and what to leave flexible',
        content: `Lock the things that, if varied, would make Carma look like a different organisation. Logo, primary colours, body font, photography style. Leave flexibility in the things that are creative choices within the system. Layout, composition, secondary colour combinations, illustration style.

A new marketer's instinct is often to either follow the brand doc rigidly or ignore it entirely. The right answer is in the middle. The brand kit is a set of rails, not a cage. You make creative decisions every time you produce a piece of work, but you make them inside the rails.`,
      },
    ],
    keyTakeaways: [
      'A brand kit codifies existing decisions, it does not invent new ones',
      'Set up the Canva brand kit properly once so every new design inherits the right defaults',
      'Owned project photography beats stock; flag gaps rather than reusing weak images',
      'Strong claims need visible evidence — caption photos, source statistics',
      'Lock identity elements, leave layout and composition flexible',
    ],
  },
  quizzes: [
    {
      question: 'What is the primary purpose of setting up a Canva brand kit?',
      options: [
        'To make Canva run faster',
        'So every new design inherits the right colours, fonts, and logo defaults without manual selection',
        'To prevent anyone else from editing the brand',
        'To replace the existing brand document',
      ],
      correctAnswer: 1,
      explanation:
        'The brand kit codifies existing decisions so every new design starts with the right defaults, which prevents brand drift over time.',
      order: 1,
    },
    {
      question: "Carma's photography style is best described as:",
      options: [
        'High-contrast black and white only',
        'Proof-led and project-led, with owned shots preferred over stock',
        'Stock photography of forests and smokestacks',
        'AI-generated images of nature',
      ],
      correctAnswer: 1,
      explanation:
        'Owned photography of real Carma projects, planting days, and team is the preferred style. Generic stock is the failure mode.',
      order: 2,
    },
    {
      question:
        'You need a project photo for a social tile but the photo library has a gap. What is the right move?',
      options: [
        'Reuse a generic stock smokestack image',
        'Skip the tile and post text only',
        'Flag the gap, request a shot for the next project visit, and use a clearly marked temporary image',
        'Generate a photo with AI and present it as real',
      ],
      correctAnswer: 2,
      explanation:
        'Gaps in the library should be flagged and filled by requesting real photography. A temporary placeholder is acceptable as long as it is clearly temporary and does not become permanent through reuse.',
      order: 3,
    },
    {
      question: 'Which elements of the brand should be locked, and which should remain flexible?',
      options: [
        'Lock everything including layout and composition',
        'Lock nothing and let each designer decide',
        'Lock identity elements like logo, colours, fonts, and photography style; leave layout and composition flexible',
        'Lock only the logo',
      ],
      correctAnswer: 2,
      explanation:
        'Identity elements should be locked because varying them would make Carma look like a different organisation. Layout and composition are creative choices made within the rails of the brand kit.',
      order: 4,
    },
    {
      question:
        'A claim like "we plant millions of trees" on a social tile is weaker without:',
      options: [
        'A logo in the corner',
        'Supporting evidence such as a source or project reference',
        'A drop shadow on the text',
        'A border around the image',
      ],
      correctAnswer: 1,
      explanation:
        "Carma's tone is proof-led. Claims need visible supporting evidence — a source, a project name, a verifiable number — otherwise they read as marketing puff.",
      order: 5,
    },
  ],
}
