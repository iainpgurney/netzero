import type { CurriculumModule } from '../carma-design-basics-curriculum.types'

export const carmaDesignBasicsM04: CurriculumModule = {
  order: 4,
  title: 'Claude as your design thinking partner',
  description:
    'Using Claude to plan, brief, and iterate on design work before and during execution in Canva.',
  duration: 40,
  badgeName: 'Claude Operator',
  badgeEmoji: '🤖',
  content: {
    sections: [
      {
        title: 'What Claude is good at',
        content: `Claude is a thinking partner, not a design tool. Where it earns its keep is the work that happens before you open Canva and during the iteration cycle. Briefing a piece of work, generating copy variants, repurposing one piece of content into many, structuring a deck outline, critiquing a draft, writing alt text — these are where Claude saves hours.

Claude is also good at unblocking. If you are staring at a blank canvas wondering where to start, describing the goal to Claude and asking for three different angles will usually surface the one that clicks. The cost of asking is near zero. The cost of staring at a blank canvas for an hour is significant.`,
      },
      {
        title: 'What Claude is not good at',
        content: `Claude does not execute finished visual designs. It will not produce a polished social tile or a slide deck you can ship. Image generation is improving but is not reliable for brand work. Layout decisions, typography choices in the editor, photography selection — these stay with you and Canva.

The mental model is to think of Claude as a senior colleague you can pull in for a five-minute conversation at any point. They can brief you, critique your work, suggest angles, write copy. They cannot draw the thing. That is still your job.`,
      },
      {
        title: 'Setting up a Carma project in Claude',
        content: `The single highest-leverage thing you can do in Claude is set up a project. A project holds context that persists across conversations — the Carma brand document, examples of past work, your tone-of-voice guide, links to key pages. Once that context is loaded, every conversation starts with Claude already knowing the basics. You stop re-explaining who Carma is at the top of every chat.

The Carma marketing project should contain the brand document, a short summary of products and audience, a sample of past social posts you would point to as good examples, and your tone-of-voice rules. Update it as those documents evolve. The project becomes a force multiplier on every brief you write.`,
      },
      {
        title: 'How to brief Claude',
        content: `A good brief to Claude looks like a good brief to a colleague. Audience, purpose, channel, key message, constraints, examples of what good looks like. Vague briefs produce vague output. Specific briefs produce useful output. If you would not give a one-line brief to a designer, do not give one to Claude.

The rough template is: I need a [thing] for [audience] on [channel] to communicate [message]. Constraints are [list]. The tone should be [description]. Here is an example of what good looks like: [paste]. Then ask Claude to produce three variants rather than one. Comparing options is more useful than judging a single draft.`,
      },
      {
        title: 'The Claude-to-Canva workflow',
        content: `The repeatable pattern is: brief in Claude, draft copy in Claude, structure in Claude, execute in Canva, critique in Claude, refine in Canva, sign off. Each step has Claude doing the cognitive work and Canva doing the visual work.

For a social carousel: ask Claude to break a blog into eight tile ideas, write the headline and body for each, suggest a hero image for each. Then build the tiles in Canva. Bring the finished tiles back to Claude as a screenshot and ask for feedback on hierarchy and copy. Iterate. This loop is where Claude pays for itself.`,
      },
      {
        title: 'Practical examples',
        content: `A few worked examples of where Claude beats staring at a blank canvas. Repurposing: give Claude a blog post and ask for eight social tile concepts, three LinkedIn post drafts, and a slide deck outline. You now have a week of content from one source.

Critique: paste a screenshot of your draft tile and ask what could be tightened. Claude will spot the things you have stopped seeing because you have looked at the file for too long. Variants: ask Claude to write the same headline in five tones — formal, plain, punchy, technical, conversational. Pick the one that fits.

Deck outlines: describe the audience and goal, ask Claude for a five-slide structure with the one-line message for each slide. Build the slides from the structure rather than freestyling.`,
      },
    ],
    keyTakeaways: [
      'Claude is a thinking partner, not a design tool',
      'Set up a Carma project once so context persists across conversations',
      'Brief Claude like you would brief a colleague — audience, purpose, channel, constraints, examples',
      'Ask for variants, not a single draft, so you can compare',
      'The workflow is: think with Claude, execute in Canva, critique in Claude, refine in Canva',
      'Use Claude to repurpose one piece of content into many, and to critique drafts you have stared at too long',
    ],
  },
  quizzes: [
    {
      question: 'Which best describes the role of Claude in the design workflow?',
      options: [
        'It replaces Canva for finished visual design',
        'It generates final polished images you can ship',
        'It is a thinking partner for briefing, copy, structure, and critique — execution stays in Canva',
        'It only writes alt text',
      ],
      correctAnswer: 2,
      explanation:
        'Claude handles the cognitive work before and during the design cycle. Layout, typography, and final visual decisions stay in Canva with you.',
      order: 1,
    },
    {
      question: 'Why set up a Carma project in Claude?',
      options: [
        'To make Claude run faster',
        'So context such as the brand document and tone-of-voice rules persists across conversations',
        'Because projects are required to use Claude',
        'To store finished designs',
      ],
      correctAnswer: 1,
      explanation:
        'A project holds context that persists, so you stop re-explaining who Carma is at the start of every conversation. It becomes a force multiplier on every brief.',
      order: 2,
    },
    {
      question: 'What does a good brief to Claude include?',
      options: [
        'Just the headline you want',
        'Audience, purpose, channel, key message, constraints, and examples of what good looks like',
        'Only a link to the website',
        'A single one-word prompt',
      ],
      correctAnswer: 1,
      explanation:
        'Vague briefs produce vague output. The same level of detail you would give a colleague produces useful output from Claude.',
      order: 3,
    },
    {
      question: 'When asking Claude for copy, what is the recommended approach?',
      options: [
        'Ask for a single perfect draft',
        'Ask for three variants so you can compare',
        'Ask for ten variants so you have lots of options',
        'Do not ask for copy at all',
      ],
      correctAnswer: 1,
      explanation:
        'Comparing two or three options is more useful than judging a single draft in isolation. Ten is too many to evaluate properly.',
      order: 4,
    },
    {
      question:
        'You have been staring at a draft tile for an hour and cannot tell if it is working. What is a sensible next step?',
      options: [
        'Publish it and hope for the best',
        'Start over from scratch',
        'Paste a screenshot into Claude and ask for critique on hierarchy and copy',
        'Add more graphics',
      ],
      correctAnswer: 2,
      explanation:
        'Claude can spot things you have stopped seeing because of familiarity. Critique on a screenshot is one of the most useful patterns in the workflow.',
      order: 5,
    },
  ],
}
