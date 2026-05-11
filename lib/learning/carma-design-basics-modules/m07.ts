import type { CurriculumModule } from '../carma-design-basics-curriculum.types'

export const carmaDesignBasicsM07: CurriculumModule = {
  order: 7,
  title: 'Short-form video',
  description:
    'Reels, Shorts, and LinkedIn video — what works, what does not, and how to produce them without a film background.',
  duration: 45,
  badgeName: 'Video Maker',
  badgeEmoji: '🎬',
  content: {
    sections: [
      {
        title: 'The format constraints',
        content: `Short-form video means vertical 9:16, between 15 and 90 seconds. Reels, TikTok, YouTube Shorts, and LinkedIn video all live in this space. LinkedIn supports horizontal 16:9 video too, but vertical performs better in the feed. Design for 9:16 as the default and crop or pad to other formats if needed.

The first three seconds decide whether the video is watched. If you have not shown the viewer why they should keep watching by second three, the scroll continues. This is the same hook principle as a social post, just compressed into a tighter window.`,
      },
      {
        title: 'Captions are not optional',
        content: `Around 80 percent of social video is watched with sound off. If your message depends on the audio, most viewers will not get it. Captions are mandatory, not optional. Auto-generated captions exist in Canva, CapCut, and the native platform editors, but they need a manual pass to fix errors and time the cuts.

Design caption placement carefully. The top and bottom thirds of the frame are partially obscured by the platform UI — username at the top, like and share buttons at the bottom. Keep captions in the middle 60 percent of the frame, large enough to read at arm's length on a phone.`,
      },
      {
        title: 'When to film, when to animate, when to use stock',
        content: `Film real Carma work whenever you can. Planting days, project visits, the team. Phone video shot well beats studio video shot generically. Hold the phone steady, frame vertically, get close to your subject, light from in front rather than behind. Audio matters more than picture — a clip-on lavalier mic for ten pounds is the single biggest quality improvement most marketers can make.

Animate when you have no footage and the message is data, process, or numbers. Canva has decent motion presets — text-in, scale, fade. Keep animation simple. A bouncing logo distracts from the message.

Use stock video sparingly and only when it is generic enough not to misrepresent — wide nature shots, abstract textures. Stock footage of someone holding a sapling that is clearly not a Carma project is the failure mode.`,
      },
      {
        title: 'Length and pacing',
        content: `Shorter is almost always better. The maximum useful length for most marketing video is 60 seconds. Most should be 15 to 30. Long videos require a strong story arc to hold attention. Short videos can survive on a single sharp point.

Pacing means cutting before the viewer's attention drops. A static shot for more than five seconds is usually too long unless the subject is moving or speaking compellingly. Cut to a new angle, a new subject, or text overlay before attention drifts. Watch your video at 1.5x speed — if it still works, your pacing is fine. If it drags, it dragged at 1x too.`,
      },
      {
        title: 'Sound and music',
        content: `If filming spoken word, mic the speaker. Phone microphones pick up too much ambient noise. If using music, pick something that supports the mood without competing with the message. Trending audio on TikTok and Reels boosts reach but be careful about commercial use rights for branded content.

Canva and CapCut both have built-in music libraries that are licensed for commercial use. Use those rather than ripping from elsewhere. A short, clean instrumental track at low volume under spoken word is almost always the right choice for Carma content.`,
      },
      {
        title: 'Worked example: 30-second planting day clip',
        content: `You have phone footage from a recent planting day — five clips of around 10 seconds each, showing arrival, planting, the team, a wide shot, and a goodbye. Goal: a 30-second LinkedIn video introducing the planting programme.

In Claude, write the structure. Hook in seconds 0-3 — a strong opening line as text overlay. Establishing shot 3-8. Action shots 8-20. Stat or proof point overlay 20-25. CTA 25-30. Ask Claude to write the captions.

In Canva or CapCut, drop in the clips, trim to fit, add the captions over the middle of the frame in brand colours, add a soft instrumental from the licensed library, export as 9:16 MP4. Total production time: 90 minutes for a polished clip.`,
      },
    ],
    keyTakeaways: [
      'Design for vertical 9:16 between 15 and 60 seconds — mobile is the default',
      'The first three seconds decide whether the video is watched',
      'Captions are mandatory because most video is watched with sound off',
      'Real Carma footage beats stock; phone video shot well beats studio video shot generically',
      "Cut before attention drops — most short videos benefit from faster pacing than feels natural",
      'Use licensed music from Canva or CapCut, not ripped audio',
    ],
  },
  quizzes: [
    {
      question: 'What is the default aspect ratio for short-form social video?',
      options: ['16:9 horizontal', '9:16 vertical', '1:1 square', '4:3 standard'],
      correctAnswer: 1,
      explanation:
        'Reels, TikTok, Shorts, and LinkedIn video all favour vertical 9:16 in the feed. Design for vertical first and adapt to other formats if needed.',
      order: 1,
    },
    {
      question: 'Why are captions essential on social video?',
      options: [
        'They are required by law',
        'Because around 80 percent of social video is watched with sound off',
        'They look more professional',
        'Algorithms boost captioned content',
      ],
      correctAnswer: 1,
      explanation:
        'Most social video is watched silently. Messages that depend on audio will be missed by the majority of viewers without captions.',
      order: 2,
    },
    {
      question: 'Where on the frame should captions sit?',
      options: [
        'At the very top of the frame',
        'At the very bottom of the frame',
        'In the middle 60 percent of the frame, away from the platform UI',
        'Anywhere — placement does not matter',
      ],
      correctAnswer: 2,
      explanation:
        'The top and bottom thirds are partially obscured by platform UI such as usernames and engagement buttons. Captions in the middle 60 percent stay readable.',
      order: 3,
    },
    {
      question:
        'What is the single biggest quality improvement most marketers can make for spoken-word video?',
      options: [
        'A 4K camera',
        'Studio lighting',
        'A clip-on lavalier mic for around ten pounds',
        'Editing software upgrades',
      ],
      correctAnswer: 2,
      explanation:
        'Audio matters more than picture quality for spoken-word content. A cheap clip-on mic dramatically improves perceived quality.',
      order: 4,
    },
    {
      question: 'When is using generic stock footage the failure mode?',
      options: [
        'Always — never use stock',
        'When it is clearly not Carma work but is presented in a way that implies it is',
        'When the colours are wrong',
        'When the file size is too large',
      ],
      correctAnswer: 1,
      explanation:
        'Generic stock that misrepresents — for example, a sapling close-up that is clearly not from a Carma project — undermines the proof-led brand. Wide abstract shots are usually fine.',
      order: 5,
    },
    {
      question: 'Your 60-second video feels slow when watched at 1x. What does watching it at 1.5x tell you?',
      options: [
        'Nothing useful',
        'If it still works at 1.5x, pacing is fine; if it drags at 1.5x, it definitely dragged at 1x',
        'It tells you the file is corrupted',
        'It only tests audio quality',
      ],
      correctAnswer: 1,
      explanation:
        'Watching at higher speed is a useful pacing test. Slow pacing at 1x usually means cuts need to happen sooner.',
      order: 6,
    },
  ],
}
