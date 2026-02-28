import OpenAI from 'openai'

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_STAGING
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Set OPENAI_API_KEY or OPENAI_API_KEY_STAGING.')
  }
  return new OpenAI({ apiKey })
}

const PROFILE_SYSTEM_PROMPT = `You are generating an internal Impact Alignment profile for Carma Llama.

This is:
- Not a personality diagnosis
- Not therapy
- Not motivational fluff
- Not a ranking system
- It is an operational awareness and accountability tool.

Your tone must be:
- Clear
- Direct
- Professional
- High-performance
- Concise but complete
- No corporate fluff
- No softening language

Energy orientation explains preference. It does not remove responsibility.
Do not justify weak performance.

INTERNAL MAPPING LOGIC (5 Energy Dimensions):
- Strategist = Maps the future (Imagination + Pragmatism) — strategic, big-picture, long-term thinking
- Ideas = Game Changer energy (Imagination + Obsession) — innovation, disruption, challenging assumptions
- Execution = Implementer energy (Action + Pragmatism) — delivery, action, getting things done
- People = Play Maker energy (centre) — orchestration, collaboration, alignment
- Excellence = Polisher energy (Action + Obsession) — quality, refinement, standards

These sit on a 2x2 grid:
- Y-axis: Imagination (top) to Action (bottom)
- X-axis: Pragmatism (left) to Obsession (right)
- Strategist: top-left, Game Changer/Ideas: top-right
- Implementer/Execution: bottom-left, Polisher/Excellence: bottom-right
- Play Maker/People: centre

ENERGY LEVELS:
- 1–3: Low energy zone. Higher energy cost. Person tends to avoid these activities.
- 4–6: Moderate zone. Can draw upon when needed but not predominant.
- 7–10: High energy zone. Natural energy source. Risk of being drawn in too quickly or for too long.

KEY RULES:
- Primary Orientation = Highest score
- Secondary Orientation = Second highest score
- Low score = Higher energy cost, not inability
- High score = Natural energy source, risk of overuse
- A low energy score can sometimes help make a better impact (avoids over-indexing)
- A high energy score can sometimes hinder impact (drawn in too quickly/long)

FORMATTING RULES:
- No emojis
- No soft therapeutic language
- No moral judgement
- No ranking language
- No references to GC Index by name
- No psychological diagnosis
- Keep it operational.

Respond with valid JSON matching the requested structure exactly.`

export interface ProfileInput {
  userName: string
  roleTitle: string
  assessmentDate: string
  strategistScore: number
  ideasScore: number
  executionScore: number
  peopleScore: number
  excellenceScore: number
  teamAverages?: {
    strategist: number
    ideas: number
    execution: number
    people: number
    excellence: number
  }
  teamMemberProfiles?: Array<{
    name: string
    strategist: number
    ideas: number
    execution: number
    people: number
    excellence: number
  }>
}

export interface ProfileOutput {
  energyMapSummary: string
  whereYouCreateImpact: string[]
  areasRequiringIntentionalEnergy: string
  underStressYouTendTo: string[]
  howToWorkEffectivelyWithYou: string[]
  teamInteractionInsight?: string
  roleFitOverlay?: string
  energyCostIndicator?: string
  accountabilityStatement: string
}

export async function generateImpactProfile(input: ProfileInput): Promise<ProfileOutput> {
  const client = getOpenAIClient()

  const teamContext = input.teamAverages
    ? `\nTeam Averages: Strategist ${input.teamAverages.strategist}, Ideas ${input.teamAverages.ideas}, Execution ${input.teamAverages.execution}, People ${input.teamAverages.people}, Excellence ${input.teamAverages.excellence}.`
    : ''

  const teamMembersContext = input.teamMemberProfiles?.length
    ? `\nTeam Member Profiles:\n${input.teamMemberProfiles
        .map(
          (m) =>
            `${m.name}: Strategist ${m.strategist}, Ideas ${m.ideas}, Execution ${m.execution}, People ${m.people}, Excellence ${m.excellence}`
        )
        .join('\n')}`
    : ''

  const userPrompt = `Generate an Impact Alignment profile.

INPUT VARIABLES:
User Name: ${input.userName}
Role Title: ${input.roleTitle}
Assessment Date: ${input.assessmentDate}

Scores (1–10):
Strategist: ${input.strategistScore}
Ideas: ${input.ideasScore}
Execution: ${input.executionScore}
People: ${input.peopleScore}
Excellence: ${input.excellenceScore}
${teamContext}${teamMembersContext}

OUTPUT FORMAT - Return JSON with this exact structure:

{
  "energyMapSummary": "One short paragraph (max 120 words) summarising how this person most naturally creates impact. Include Primary Orientation and Secondary Orientation based on highest scores. Reference all 5 dimensions.",
  "whereYouCreateImpact": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"],
  "areasRequiringIntentionalEnergy": "For each dimension scoring 1–6: explain why this area may feel draining, what behaviour may suffer, what discipline is required. End with: 'These areas require structure and discipline, not avoidance.'",
  "underStressYouTendTo": ["bullet 1", "bullet 2", "bullet 3"],
  "howToWorkEffectivelyWithYou": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5", "bullet 6"],
  "teamInteractionInsight": "If team data provided: compare user to team average across all 5 dimensions, complement zones, watch-out zones. If team member data provided, include 1-3 example working agreements. Otherwise omit or leave empty.",
  "roleFitOverlay": "Compare energy map to role. State Aligned Zones and Stretch Zones across all 5 dimensions. If stretch exists, explain how it can be managed through systems, structure, or partnerships.",
  "energyCostIndicator": "Classify each of the 5 dimensions as Energising (7-10), Neutral (4-6), or Energy Intensive (1-3). Then state: 'If your role requires sustained performance in an energy intensive zone, recovery and discipline must be intentional.'",
  "accountabilityStatement": "Energy orientation explains preference. It does not reduce responsibility. You are accountable for outcomes across all five dimensions — Strategist, Ideas, Execution, People, and Excellence — regardless of natural inclination."
}

RULES:
- whereYouCreateImpact: 3-5 bullets. Describe behaviours in high energy zones. Focus on contribution, not personality.
- underStressYouTendTo: 3 bullets. Predictable overuse or collapse patterns based on highest and lowest scores. Keep behavioural.
- howToWorkEffectivelyWithYou: 4-6 bullets. Include what motivates, what frustrates, how to align, what agreements prevent friction. No generic advice.
- Omit teamInteractionInsight, roleFitOverlay, or energyCostIndicator if you cannot generate meaningful content.`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: PROFILE_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from OpenAI')

  const parsed = JSON.parse(content) as ProfileOutput

  if (!parsed.energyMapSummary || !parsed.whereYouCreateImpact || !parsed.accountabilityStatement) {
    throw new Error('Invalid profile response structure from OpenAI')
  }

  return parsed
}

const PAIR_SYSTEM_PROMPT = `You are generating a pair comparison for two team members based on their Impact Alignment profiles.
The purpose is to help these two people work together more effectively.
Be practical, specific, and constructive. Focus on synergy and awareness.
Do NOT be judgmental or frame differences as problems — they are opportunities for complementary working.
Consider all 5 dimensions: Strategist, Ideas (Game Changer), Execution (Implementer), People (Play Maker), Excellence (Polisher).
Respond with valid JSON matching the requested structure exactly.`

export interface PairInput {
  person1: { name: string; strategist: number; ideas: number; execution: number; people: number; excellence: number }
  person2: { name: string; strategist: number; ideas: number; execution: number; people: number; excellence: number }
}

export interface PairOutput {
  complementaryAreas: string[]
  potentialFriction: string[]
  workingAgreement: string
}

export async function generatePairComparison(input: PairInput): Promise<PairOutput> {
  const client = getOpenAIClient()

  const userPrompt = `Compare these two team members' energy orientations and suggest how they can work together effectively.

${input.person1.name}: Strategist ${input.person1.strategist}, Ideas ${input.person1.ideas}, Execution ${input.person1.execution}, People ${input.person1.people}, Excellence ${input.person1.excellence}
${input.person2.name}: Strategist ${input.person2.strategist}, Ideas ${input.person2.ideas}, Execution ${input.person2.execution}, People ${input.person2.people}, Excellence ${input.person2.excellence}

Return JSON:
{
  "complementaryAreas": ["area 1", "area 2", "area 3"],
  "potentialFriction": ["friction point 1", "friction point 2"],
  "workingAgreement": "A 1-2 sentence practical suggestion for how these two should agree to work together based on their differences."
}`

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: PAIR_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
    max_tokens: 600,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No response from OpenAI')

  return JSON.parse(content) as PairOutput
}

export function generateTeamAwarenessTips(averages: {
  strategist: number
  ideas: number
  execution: number
  people: number
  excellence: number
}): string[] {
  const tips: string[] = []

  if (averages.strategist > 7) {
    tips.push(
      'Your team has strong strategic energy — make sure to pair long-term thinking with concrete short-term execution plans.'
    )
  }
  if (averages.strategist < 4) {
    tips.push(
      'Your team leans towards tactical over strategic — consider scheduling dedicated time for big-picture planning and horizon scanning.'
    )
  }
  if (averages.ideas > 7) {
    tips.push(
      'Your team has strong innovation energy — make sure to pair this with clear execution plans so great ideas don\'t stay on the whiteboard.'
    )
  }
  if (averages.ideas < 4) {
    tips.push(
      'Your team leans towards pragmatism over ideation — consider scheduling dedicated time for creative thinking and challenging the status quo.'
    )
  }
  if (averages.execution > 7) {
    tips.push(
      'Strong delivery energy across the team — watch for a tendency to rush past the planning stage or skip alignment conversations.'
    )
  }
  if (averages.execution < 4) {
    tips.push(
      'Low delivery energy across the team — be intentional about setting deadlines, tracking progress, and celebrating completed work.'
    )
  }
  if (averages.people > 7) {
    tips.push(
      'High collaboration energy — this is great for alignment, but be aware of decision paralysis when everyone wants consensus.'
    )
  }
  if (averages.people < 4) {
    tips.push(
      'Low alignment energy across the team — be intentional about check-ins before big decisions to avoid silos and miscommunication.'
    )
  }
  if (averages.excellence > 8) {
    tips.push(
      'Very high standards culture — watch for perfection bottlenecks that slow delivery. Agree on "good enough" thresholds upfront.'
    )
  }
  if (averages.excellence < 4) {
    tips.push(
      'The team may benefit from stronger quality checkpoints — consider peer review or agreed quality standards for important outputs.'
    )
  }

  if (tips.length === 0) {
    tips.push(
      'Your team has a balanced energy profile — leverage this by being deliberate about which energy to lean into for different types of work.'
    )
  }

  return tips
}
