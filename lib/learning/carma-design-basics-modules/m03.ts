import type { CurriculumModule } from '../carma-design-basics-curriculum.types'

export const carmaDesignBasicsM03: CurriculumModule = {
  order: 3,
  title: 'Canva from zero',
  description:
    'A practical walkthrough of the Canva interface, brand kit, templates, and team library.',
  duration: 45,
  badgeName: 'Canva Operator',
  badgeEmoji: '🛠️',
  content: {
    sections: [
      {
        title: 'Orientating yourself in Canva',
        content: `Canva looks busy on first opening because it tries to be everything to everyone. Ignore most of it. The parts you will use daily are the home screen, the editor, the brand hub, and the folder system. Everything else is occasional or irrelevant for now.

From the home screen you create a new design by size or by template. The editor is where the actual work happens. The brand hub stores your brand kit. The folder system organises finished designs. Spend the first ten minutes clicking around without trying to make anything, so the layout stops being noise.`,
      },
      {
        title: 'The editor in detail',
        content: `The left sidebar holds your asset panels — templates, elements, uploads, text, brand, projects, apps. The canvas sits in the centre. The top bar shows file actions, share, and download. The right side holds context-sensitive panels that appear when you select an element.

The two shortcuts that will save you the most time are T for adding text and R for adding a rectangle. The two settings that will save you the most frustration are turning on rulers and turning on snap-to-grid. Both live under the View menu.`,
      },
      {
        title: 'Templates: use them, do not depend on them',
        content: `Canva templates are a starting point, not a finished product. The trap for new marketers is to pick a template, swap in your text, and publish. The result looks like everyone else's template. Use templates to learn composition, then strip them down and rebuild with Carma's brand applied.

A better workflow is to pick a template close to what you want, delete everything inside it, and rebuild using the original as a positional reference. You inherit the layout intelligence without inheriting the generic visual identity. Over time, your reworked templates become your team library.`,
      },
      {
        title: 'Magic Resize and format families',
        content: `Magic Resize is the feature that takes one design and converts it to multiple platform sizes at once. A LinkedIn post becomes an Instagram square, a story, a Facebook cover, all from a single source. It is not perfect — text often needs nudging — but it is dramatically faster than rebuilding from scratch.

The practical workflow is to design once at the most constrained size, usually a square or portrait, then resize outward. Build a family of related assets rather than a one-off. Most social campaigns need three to five formats, and Magic Resize is the difference between an hour of work and an afternoon.`,
      },
      {
        title: 'Folders, team library, and naming',
        content: `A messy Canva account becomes unusable within three months. Set up folders from day one. The structure that works is by purpose, not by date — Social, Decks, Product, Templates, Archive. Inside each, sub-folders by campaign or channel.

Naming matters more than you think. "Untitled Design 47" is invisible. "2026-05 LinkedIn carbon credit launch — square" is findable. Adopt a naming convention from the first file and stick to it. Future you will thank present you.`,
      },
      {
        title: 'Building the team template library',
        content: `As you build assets, the good ones become reusable. A LinkedIn quote-card layout that worked once will work again. Save those as team templates in the brand hub. Over six months, the library grows from a handful of inherited templates to a working set of twenty or thirty proven layouts.

The rule for what becomes a template is simple. If you would use this layout again with different content, it is a template. If it is one-off, it is not. Templates should be empty shells with placeholder text, not finished designs with last week's copy still in them.`,
      },
    ],
    keyTakeaways: [
      "Ignore most of Canva's interface — focus on home, editor, brand hub, and folders",
      'Templates are starting points, not finished products; rebuild them with Carma branding',
      'Magic Resize turns one design into a family of platform sizes',
      'Folders and a naming convention from day one prevent the account becoming unusable',
      'Reusable layouts become team templates over time, growing the library',
    ],
  },
  quizzes: [
    {
      question: 'What is the biggest trap when using Canva templates?',
      options: [
        'They cost too much money',
        'Picking one, swapping in your text, and publishing — the result looks generic',
        'They cannot be edited',
        'They are only available in specific sizes',
      ],
      correctAnswer: 1,
      explanation:
        "Templates used as finished products produce work that looks like everyone else's. They are starting points to learn composition, not finished assets.",
      order: 1,
    },
    {
      question: 'What does Magic Resize do?',
      options: [
        'Compresses image file sizes for faster upload',
        'Converts one design into multiple platform sizes from a single source',
        'Automatically writes alt text',
        'Removes backgrounds from photos',
      ],
      correctAnswer: 1,
      explanation:
        'Magic Resize converts a design into a family of platform sizes, which is much faster than rebuilding each format from scratch.',
      order: 2,
    },
    {
      question:
        'When designing a multi-platform social campaign, what is the recommended starting size?',
      options: [
        'The largest format, then resize down',
        'The most constrained size, usually a square or portrait, then resize outward',
        'Always 1920 by 1080',
        'It does not matter — start anywhere',
      ],
      correctAnswer: 1,
      explanation:
        'Designing at the most constrained size first means text and layout choices will still work when you resize to wider formats. Going the other way often breaks composition.',
      order: 3,
    },
    {
      question: 'Which folder structure is recommended for a working Canva account?',
      options: [
        'By date of creation',
        'By designer name',
        'By purpose, such as Social, Decks, Product, Templates, Archive',
        'No folders — use search instead',
      ],
      correctAnswer: 2,
      explanation:
        'Folders organised by purpose rather than date stay useful as the account grows. Sub-folders by campaign or channel sit inside the purpose folders.',
      order: 4,
    },
    {
      question: 'What qualifies a design to be saved as a team template?',
      options: [
        'Any design that is finished',
        'Only designs approved by senior leadership',
        'A layout you would use again with different content, saved as an empty shell',
        'Designs that took the longest to create',
      ],
      correctAnswer: 2,
      explanation:
        'Templates should be reusable empty shells with placeholder text. A finished design with old copy still in it is not a template.',
      order: 5,
    },
  ],
}
