import type { CurriculumModule } from '../carma-design-basics-curriculum.types'

export const carmaDesignBasicsM05: CurriculumModule = {
  order: 5,
  title: "Social media posts that don't look amateur",
  description:
    'Platform specs, post types, and a repeatable workflow for producing social assets that read as intentional.',
  duration: 50,
  badgeName: 'Social Sharp',
  badgeEmoji: '📱',
  content: {
    sections: [
      {
        title: 'Platform specs you actually need',
        content: `Each platform has dozens of supported formats. You need a handful. For LinkedIn, the workhorses are the square post at 1200 by 1200 and the document carousel at 1080 by 1350. For Instagram, the portrait post at 1080 by 1350 and the story at 1080 by 1920. For Facebook, the square at 1200 by 1200 and the cover at 1640 by 859.

Design at portrait or square wherever possible. Mobile is the default viewing context for all of these platforms. A wide landscape design that looks great on your desktop will display as a thin strip on a phone, which is where 80 percent or more of your audience will see it.`,
      },
      {
        title: 'Single posts: the anatomy',
        content: `A good single social post has four parts, even if they are not all visible. A hook in the first line of copy or headline. A clear visual focal point. A supporting detail or proof point. A call to action. Strip any of those and the post weakens.

The most common failure is burying the hook. The first thing someone sees on a feed is the headline or the first sentence of the copy. If that does not stop the scroll, the rest does not matter. Write the hook first, then build the post around it. Do not save the interesting bit for the third paragraph.`,
      },
      {
        title: 'Carousels: structure beats decoration',
        content: `Carousels are the highest-engagement format on LinkedIn and the second-highest on Instagram. They work because each slide is a small commitment from the viewer, and the swipe is a low-friction next action. A good carousel has a hook slide, a problem or context slide, two to four substance slides, and a CTA slide.

Do not over-decorate. The most-saved LinkedIn carousels are typographic — large bold headline, supporting text, one image or none. Trying to make every slide visually elaborate dilutes the message and slows production. Aim for ten minutes per slide once you have the structure. If a slide is taking thirty, it is over-designed.`,
      },
      {
        title: 'Pairing copy and image',
        content: `On most social platforms, the caption and the image are two separate canvases that work together. The image carries the hook and the proof point. The caption carries the story, the context, and the call to action. They should not duplicate each other.

A common mistake is putting the entire post copy onto the image. Image text should be short — six to ten words for a headline, fewer for a subhead. Anything longer goes in the caption. The image is for stopping the scroll. The caption is for what happens after the scroll has stopped.`,
      },
      {
        title: 'Worked example: blog to carousel',
        content: `Start with a published blog post. In Claude, paste the blog and ask for an eight-slide carousel outline with a headline and two-line body for each slide. Specify the audience and the goal. Claude returns the structure.

Move to Canva. Pick a square or portrait template, strip it down, apply the brand kit. Build slide one with the hook. Use Magic Resize to duplicate the canvas seven more times. Fill each slide with the structure Claude produced. Add a hero image where it earns its place. Export as PNG, upload to the platform, and write the caption as a third step.

This loop takes ninety minutes for a polished carousel. Done without the structure step, it takes a half day and produces a weaker result.`,
      },
      {
        title: 'Mistakes to avoid',
        content: `A short list of failure modes seen in junior social design. Using all caps for body text — fine for short labels, unreadable for sentences. Centring everything by default — left alignment is more readable for most copy. Using more than two fonts — one heading font and one body font is enough. Putting the logo too large — a small mark in the corner is enough; the audience knows who you are by the third post.

Also: gradient backgrounds with low-contrast text, drop shadows on everything, three different colours of accent in one tile, and decorative icons that do not communicate anything. When in doubt, take something out.`,
      },
    ],
    keyTakeaways: [
      'Design at portrait or square — mobile is the default viewing context',
      'Hook first, everything else supports the hook',
      'Carousels work because each slide is a small commitment; keep them typographic and structured',
      'Image text should be short; long copy goes in the caption',
      'A repeatable workflow — Claude for structure, Canva for execution — produces better work in less time',
      'Most amateur mistakes come from adding rather than removing',
    ],
  },
  quizzes: [
    {
      question: 'What is the default orientation to design for on social platforms?',
      options: [
        'Wide landscape, because desktops are the primary viewing context',
        'Portrait or square, because mobile is the default viewing context',
        'Always 1:1 square regardless of platform',
        'Whatever the template suggests',
      ],
      correctAnswer: 1,
      explanation:
        'Most social viewing happens on mobile. Wide landscape designs display as thin strips on phones, where the majority of the audience will see them.',
      order: 1,
    },
    {
      question: 'Where should the hook of a social post live?',
      options: [
        'In the third paragraph, after building context',
        'In the first line of copy or in the headline, so it stops the scroll immediately',
        'In a footer at the bottom of the image',
        'It does not matter where the hook lives',
      ],
      correctAnswer: 1,
      explanation:
        'The first thing someone sees on a feed is the headline or the opening line. If that does not stop the scroll, the rest of the post is not seen.',
      order: 2,
    },
    {
      question: 'What is the recommended structure for a LinkedIn carousel?',
      options: [
        'Twelve slides of dense text, all equally weighted',
        'A hook slide, a context slide, two to four substance slides, and a CTA slide',
        'One image per slide with no text',
        'Random ordering — the algorithm decides',
      ],
      correctAnswer: 1,
      explanation:
        'A structured carousel has a clear hook, builds context, delivers substance, and closes with a call to action. Each slide is a small commitment the viewer makes to swipe.',
      order: 3,
    },
    {
      question: 'How should image text and caption text relate to each other?',
      options: [
        'The caption should repeat the image text word-for-word',
        'They should be two separate canvases — image carries the hook, caption carries the story and CTA',
        'The image should contain the full caption',
        'The caption should be empty if the image has text',
      ],
      correctAnswer: 1,
      explanation:
        'Image text is for stopping the scroll. Caption text is for what happens after the scroll has stopped. They work together rather than duplicating each other.',
      order: 4,
    },
    {
      question: 'Which of these is a common amateur mistake on social tiles?',
      options: [
        'Using one heading font and one body font',
        'Left-aligning body copy',
        'Using more than two fonts and putting the logo too large',
        'Designing in portrait orientation',
      ],
      correctAnswer: 2,
      explanation:
        'Two fonts is the upper limit for most work. A small logo in the corner is enough — making it large signals amateur design and steals attention from the hook.',
      order: 5,
    },
    {
      question: 'In the blog-to-carousel workflow, which step happens in Claude rather than Canva?',
      options: [
        'Adding the hero image',
        'Selecting the brand colours',
        'Generating the eight-slide outline with headlines and body for each',
        'Exporting the final PNG',
      ],
      correctAnswer: 2,
      explanation:
        'Claude handles the structural and copy work — outline, headlines, body. Canva handles the visual execution.',
      order: 6,
    },
  ],
}
