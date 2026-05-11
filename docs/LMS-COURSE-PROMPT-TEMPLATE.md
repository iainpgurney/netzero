# Claude prompt template for new LMS courses

Use this document whenever you want Claude to draft a new course in the shape our Learning Hub expects.

## Data model (NetZero)

Learning content maps to Prisma models in `prisma/schema.prisma`:

- **Course**: `slug`, `title`, `description`, `icon`, `isActive`
- **Module**: `courseId`, `title`, `description`, `order`, `duration`, `content` (JSON string), `badgeName`, `badgeEmoji`
- **Quiz**: `moduleId`, `question`, `options` (JSON string of a string array), `correctAnswer` (0-based index), `explanation`, `order`

The module UI parses `content` as JSON with `sections` and `keyTakeaways` — see `app/dashboard/learning/modules/[moduleId]/module-client.tsx`.

A full worked example (course + module + quizzes) lives in `prisma/seed.ts` (Net Zero course, first modules from roughly the `module1` / Net Zero Fundamentals block onward).

## How to use this with Claude

1. Copy the **Master prompt** block below and fill the bracketed fields for your course.
2. Optionally attach **one reference module** from `prisma/seed.ts` (course meta + one module + its quizzes) so tone and density match existing courses.
3. Ask for **two-part output**: (1) a short human outline, (2) a single **machine-ready JSON** object you can adapt into Prisma `create` calls.

---

## Master prompt (copy from `You are writing` through `No trailing commentary`)

```
You are writing LMS course content for our internal Learning Hub. Match the structure and tone of our existing courses: practical, UK-oriented where relevant, clear section titles, short paragraphs in each section body, optional source attribution when facts are cited.

## Course (top level)
- slug: kebab-case, unique, no spaces [e.g. marketing-design]
- title: [Marketing design for …]
- description: 2–4 sentences, audience + outcomes
- icon: single emoji [e.g. 🎨]
- isActive: true

## Modules (ordered sequence; module 1 is always unlocked)
For each module provide:
- order: integer starting at 1
- title: concise
- description: one sentence learner-facing summary
- duration: estimated minutes (integer)
- badgeName: short achievement name
- badgeEmoji: one emoji

### Module content JSON (exact keys)
Return a JSON object (not a string) with:
- sections: array of { title, content, source? }
  - title: section heading
  - content: 1–3 short paragraphs of teaching copy (plain text)
  - source: optional string (reference line)
- keyTakeaways: array of 3–6 bullet strings (no markdown in strings)

### Quizzes (per module)
For each module, 4–6 questions, order 1..N:
- question: string
- options: array of exactly 4 strings (mutually exclusive, one clearly best)
- correctAnswer: integer 0–3 (index into options; 0 = first option)
- explanation: 1–2 sentences why the correct answer is right

## Topic for this course
[Marketing design: e.g. brand systems, campaign creative, accessibility, channel specs, handoff to dev/print, green claims compliance if on-brand]

## Constraints
- Do not invent company-specific policies; use general best practice unless I specify otherwise.
- Keep language inclusive and professional.
- Ensure quiz answers are consistent with the module sections.

## Output format (strict)
1) Brief course outline (modules only, one line each).
2) Full structured data as a single JSON object:
{
  "course": { ... },
  "modules": [
    {
      "order": 1,
      "title": "...",
      "description": "...",
      "duration": 10,
      "badgeName": "...",
      "badgeEmoji": "...",
      "content": { "sections": [...], "keyTakeaways": [...] },
      "quizzes": [ { "question", "options", "correctAnswer", "explanation", "order" }, ... ]
    }
  ]
}
No trailing commentary outside the JSON block for part 2.
```

---

## Consistency checklist (after Claude responds)

| Field | Rule |
|--------|------|
| `slug` | Lowercase, hyphens, unique versus other courses in the database |
| `order` | Unique per course; contiguous `1..N` recommended |
| `content` | Valid JSON; must include `sections` (array) and `keyTakeaways` (array) |
| `options` | Exactly four strings per question; in the DB store with `JSON.stringify([...])` |
| `correctAnswer` | **0-based** index (`0` = first option), matching existing seed style |

---

## Optional: “Marketing design” module spine

Paste under **Topic for this course** if you want a default skeleton:

1. Brand and layout fundamentals  
2. Typography and colour for campaigns  
3. Digital vs print specs  
4. Accessibility and inclusive design  
5. Briefs, feedback, and approval workflow  
6. Sustainability / honest marketing claims (if aligned with your org)  

Adjust the number of modules to the depth you want.

---

## After generation (wire into the app)

1. Add or extend seed data in `prisma/seed.ts` (or a dedicated seed script), mirroring existing patterns:
   - `content`: `JSON.stringify({ sections, keyTakeaways })`
   - each quiz `options`: `JSON.stringify([...])`
2. Run `npx prisma db seed` (or your project’s seed command) as appropriate for your environment.
3. Open a module in the dashboard Learning Hub and confirm sections and quizzes render correctly.

For bulk copy review, see `scripts/export-copy-for-ai.ts` for how module JSON is interpreted elsewhere.
