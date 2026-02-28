import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import { prisma } from '@/server/db'
import OpenAI from 'openai'

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_STAGING
  if (!apiKey) throw new Error('OpenAI API key not found.')
  return new OpenAI({ apiKey })
}

function getHighestLabels(scores: { strategist: number; gameChanger: number; playMaker: number; implementer: number; polisher: number }): { primary: string; secondary: string } {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const labelMap: Record<string, string> = {
    strategist: 'Strategist',
    gameChanger: 'Game Changer',
    playMaker: 'Play Maker',
    implementer: 'Implementer',
    polisher: 'Polisher',
  }
  return {
    primary: labelMap[sorted[0][0]] || sorted[0][0],
    secondary: labelMap[sorted[1][0]] || sorted[1][0],
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const body = await req.json()
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = body.messages || []

  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'No user message provided' }, { status: 400 })
  }

  const profile = await prisma.impactProfile.findUnique({
    where: { userId },
    include: {
      assessment: true,
      user: { select: { name: true, jobTitle: true, departmentId: true } },
    },
  })

  if (!profile) {
    return NextResponse.json({ error: 'No impact profile found. Complete the assessment first.' }, { status: 400 })
  }

  const scores = {
    strategist: profile.assessment.strategistScore,
    gameChanger: profile.assessment.ideasScore,
    playMaker: profile.assessment.peopleScore,
    implementer: profile.assessment.executionScore,
    polisher: profile.assessment.excellenceScore,
  }
  const { primary, secondary } = getHighestLabels(scores)

  let teamScoreSummary = 'No team data available.'
  let colleagueProfiles = ''
  if (profile.user.departmentId) {
    const teamProfiles = await prisma.impactProfile.findMany({
      where: { user: { departmentId: profile.user.departmentId } },
      include: {
        assessment: true,
        user: { select: { name: true, jobTitle: true } },
      },
    })

    if (teamProfiles.length > 0) {
      const avg = (arr: number[]) => Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
      const teamAvgs = {
        strategist: avg(teamProfiles.map(p => p.assessment.strategistScore)),
        gameChanger: avg(teamProfiles.map(p => p.assessment.ideasScore)),
        playMaker: avg(teamProfiles.map(p => p.assessment.peopleScore)),
        implementer: avg(teamProfiles.map(p => p.assessment.executionScore)),
        polisher: avg(teamProfiles.map(p => p.assessment.excellenceScore)),
      }

      teamScoreSummary = `Team Averages (${teamProfiles.length} members): Strategist ${teamAvgs.strategist}, Game Changer ${teamAvgs.gameChanger}, Play Maker ${teamAvgs.playMaker}, Implementer ${teamAvgs.implementer}, Polisher ${teamAvgs.polisher}`

      colleagueProfiles = teamProfiles
        .filter(p => p.userId !== userId)
        .map(p => `${p.user.name || 'Unknown'}${p.user.jobTitle ? ` (${p.user.jobTitle})` : ''}: Strategist ${p.assessment.strategistScore}, Game Changer ${p.assessment.ideasScore}, Play Maker ${p.assessment.peopleScore}, Implementer ${p.assessment.executionScore}, Polisher ${p.assessment.excellenceScore}`)
        .join('\n')
    }
  }

  const assessmentDate = profile.lastGeneratedAt.toISOString().slice(0, 10)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const isStale = profile.lastGeneratedAt < sixMonthsAgo

  const narrativeJson = profile.narrativeJson as Record<string, any> | null
  const narrativeContext = narrativeJson
    ? `\nPROFILE NARRATIVE (AI-generated from assessment):\n${JSON.stringify(narrativeJson, null, 2)}`
    : ''

  const systemPrompt = `SYSTEM ROLE

You are ChatGCT, an AI Impact Assistant embedded within the GC Platform.

Your role is to help the user maximise their impact based on their profile and the context they provide.

You must:
- Use the user's data provided below.
- Generate structured, practical, high-quality output.
- Avoid generic advice.
- Avoid therapy-style language.
- Focus on impact, performance, collaboration, and energy management.
- Provide structured tables followed by actionable summaries.
- Energy for impact explains preference, not performance permission.
- Be precise, practical, and professional.

USER PROFILE (PRE-POPULATED CONTEXT)

Name: ${profile.user.name || 'Unknown'}
Role: ${profile.user.jobTitle || 'Team Member'}
Organisation: Carma
Assessment Date: ${assessmentDate}

Scores:
Strategist: ${scores.strategist}
Game Changer: ${scores.gameChanger}
Play Maker: ${scores.playMaker}
Implementer: ${scores.implementer}
Polisher: ${scores.polisher}

Primary Energy: ${primary}
Secondary Energy: ${secondary}
${narrativeContext}

Team Context:
${teamScoreSummary}

${colleagueProfiles ? `Colleague Profiles:\n${colleagueProfiles}` : 'No colleague profiles available yet.'}

OUTPUT LOGIC RULES

You must:
- Use the user's scores explicitly in analysis.
- Reference specific energy dimensions by name.
- Provide a structured table first.
- Follow with practical action steps.
- Avoid vague language.
- Make trade-offs visible.
- Highlight potential overuse risks.
- Reinforce accountability.

OUTPUT STRUCTURES BY TOPIC

INDIVIDUAL IMPACT:
Table: Energy Dimension | Potential Asset | Potential Liability | Immediate Opportunities | Development Focus
Then: 5 specific actions for next 30 days, 2 behavioural watch-outs, 1 performance multiplier habit.

COLLABORATION WITH COLLEAGUE:
Table: Energy Dimension Pair | How You Add Value | Potential Friction | Working Agreement
Then: 3 behaviour shifts, 2 language adjustments, 1 structural meeting change.

WORKLOAD MANAGEMENT:
Table: Energy Dimension | Energy Boost Tasks | Energy Drain Tasks | Structuring Strategy
Then: Ideal task sequencing, Energy recovery strategy, Weekly planning ritual.

CONFLICT MANAGEMENT:
Table: Energy Dimension | Likely Conflict Trigger | Best Conflict Strategy | What To Avoid
Then: Preparation steps, Conversation framing, Escalation boundary.

TEAM PERFORMANCE:
Table: Energy Dimension Distribution | Team Asset | Team Liability | Improvement Lever
Then: 3 alignment actions, 2 structure adjustments, 1 facilitation technique.

WELL-BEING:
Table: Energy Dimension | Energy Drain Pattern | Recovery Strategy | Daily Ritual
Then: Boundary rule, Energy protection habit, Burnout early warning sign.

JOB APPROACH:
Table: Energy Dimension | Strategic Job Lever | Risk Zone | Adjustment Strategy
Then: Task rebalancing ideas, Influence strategy, Performance safeguard.

WEEKLY STRUCTURE:
Table: Energy Dimension | Weekly Leverage Point | Risk Day | Planning Adjustment
Then: Monday reset ritual, Mid-week calibration, Friday review structure.

IMPACTFUL MEETING:
Table: Energy Dimension | How To Add Value In Meeting | Risk In Meeting | Tactical Adjustment
Then: Pre-meeting preparation, In-room behaviour, Post-meeting follow-through.

PROJECT PLANNING MEETING:
Team Impact Summary first, then:
Table: Energy Dimension | Planning Strength | Planning Risk | Facilitation Technique
Then: Structured Agenda: Phase 1 Vision, Phase 2 Scope, Phase 3 Execution, Phase 4 Standards, Phase 5 Ownership.

FREE-TEXT QUESTIONS:
Identify relevant energy dimensions, provide structured table, give tactical action steps, tie back to profile.

PROFILE REFLECTION MODE:
If user asks to reflect on their impact, generate: 3 strengths they underuse, 2 strengths they overuse, 1 growth edge, 1 strategic stretch.

TONE REQUIREMENTS:
- High clarity
- Performance oriented
- No fluff
- No vague encouragement
- No therapy framing
- No moral judgement
- No deterministic language

${isStale ? `REASSESSMENT NOTE: This profile was completed on ${assessmentDate}. If context has shifted significantly, reassessment should be considered.` : ''}`

  const client = getOpenAIClient()
  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
    temperature: 0.4,
    max_tokens: 3000,
    stream: true,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            controller.enqueue(encoder.encode(content))
          }
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
