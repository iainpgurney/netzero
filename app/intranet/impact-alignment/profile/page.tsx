'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Compass,
  ArrowLeft,
  Users,
  Lock,
  Sparkles,
  AlertTriangle,
  Zap,
  Handshake,
  Target,
  BarChart3,
  Scale,
  MessageSquare,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

type NarrativeJson = {
  energyMapSummary?: string
  whereYouCreateImpact?: string[]
  areasRequiringIntentionalEnergy?: string
  underStressYouTendTo?: string[]
  howToWorkEffectivelyWithYou?: string[]
  teamInteractionInsight?: string
  roleFitOverlay?: string
  energyCostIndicator?: string
  accountabilityStatement?: string
}

function formatEditLockRemaining(editLockedUntil: Date): string {
  const ms = new Date(editLockedUntil).getTime() - Date.now()
  const hours = Math.ceil(ms / (1000 * 60 * 60))
  if (hours < 24) return `${hours}h`
  const days = Math.ceil(hours / 24)
  return `${days}d`
}

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  strategist: { bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-white' },
  ideas: { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-white' },
  execution: { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-white' },
  people: { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-white' },
  excellence: { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-white' },
}

function BubbleMatrix({ scores }: { scores: { strategist: number; ideas: number; execution: number; people: number; excellence: number } }) {
  const minSize = 36
  const maxSize = 72
  const getSize = (score: number) => minSize + ((score - 1) / 9) * (maxSize - minSize)

  const bubbles = [
    { key: 'strategist', label: 'Strategist', score: scores.strategist, x: 25, y: 25 },
    { key: 'ideas', label: 'Game Changer', score: scores.ideas, x: 75, y: 25 },
    { key: 'execution', label: 'Implementer', score: scores.execution, x: 25, y: 75 },
    { key: 'excellence', label: 'Polisher', score: scores.excellence, x: 75, y: 75 },
    { key: 'people', label: 'Play Maker', score: scores.people, x: 50, y: 50 },
  ]

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Axis labels */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Imagination</div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Action</div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider rotate-[-90deg]">Pragmatism</div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider rotate-90">Obsession</div>

      {/* Grid lines */}
      <div className="absolute inset-4 border border-gray-200 rounded-lg">
        <div className="absolute top-1/2 left-0 right-0 border-t border-gray-100" />
        <div className="absolute left-1/2 top-0 bottom-0 border-l border-gray-100" />
      </div>

      {/* Bubbles */}
      {bubbles.map((b) => {
        const size = getSize(b.score)
        const colors = ROLE_COLORS[b.key]
        return (
          <div
            key={b.key}
            className="absolute flex flex-col items-center"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`${colors.bg} ${colors.text} rounded-full flex items-center justify-center font-bold shadow-lg border-2 ${colors.border}`}
              style={{ width: size, height: size, fontSize: size > 48 ? 20 : 16 }}
            >
              {b.score}
            </div>
            <span className="text-[10px] font-medium text-gray-600 mt-1 whitespace-nowrap">{b.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function EnergyLevelGuide() {
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
        <p className="text-2xl font-bold text-red-600 mb-1">1-3</p>
        <p className="text-xs text-gray-700 leading-relaxed">
          Low energy zone. Higher energy cost. You may tend to avoid these activities. Can sometimes help you make a better impact.
        </p>
      </div>
      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
        <p className="text-2xl font-bold text-amber-600 mb-1">4-6</p>
        <p className="text-xs text-gray-700 leading-relaxed">
          Moderate zone. You have some energy for these activities. Areas you can draw upon when needed to make your best impact.
        </p>
      </div>
      <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
        <p className="text-2xl font-bold text-green-600 mb-1">7-10</p>
        <p className="text-xs text-gray-700 leading-relaxed">
          High energy zone. Natural energy source. Be aware of being drawn in too quickly or for too long.
        </p>
      </div>
    </div>
  )
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const SUGGESTED_PROMPTS = [
  { label: 'My Impact', prompt: 'Analyse my individual impact profile. Show my potential assets and liabilities for each energy dimension, immediate opportunities, development focus areas, and give me 5 specific actions for the next 30 days.' },
  { label: 'Collaboration', prompt: 'Based on my profile and my colleagues\' profiles, how can I collaborate most effectively? Show the energy dimension pairs, where I add value, potential friction points, and suggest working agreements.' },
  { label: 'Workload', prompt: 'How should I structure my workload to maximise energy for impact? Show energy boost vs drain tasks for each energy dimension and give me an ideal task sequence and weekly planning ritual.' },
  { label: 'Conflict', prompt: 'What are my likely conflict triggers based on my energy dimensions? Show the best conflict strategy for each, what to avoid, and give me preparation steps and conversation framing.' },
  { label: 'Team Performance', prompt: 'Analyse our team\'s energy dimension distribution. Show team assets and liabilities, improvement levers, and give 3 alignment actions, 2 structure adjustments, and 1 facilitation technique.' },
  { label: 'Well-being', prompt: 'Analyse my energy drain patterns based on my energy dimensions. Show recovery strategies, daily rituals, and give me a boundary rule, energy protection habit, and burnout early warning signs.' },
  { label: 'Job Approach', prompt: 'How should I approach my role based on my energy profile? Show strategic job levers and risk zones for each energy dimension, plus task rebalancing ideas and performance safeguards.' },
  { label: 'Weekly Structure', prompt: 'How can I structure my week for optimal energy and productivity? Show weekly leverage points and risk days for each energy dimension, with Monday reset, mid-week calibration, and Friday review rituals.' },
  { label: 'Meetings', prompt: 'How can I be most impactful in meetings? Show how each of my energy dimensions adds value in meetings, the risks, and give me pre-meeting preparation, in-room behaviour, and post-meeting follow-through advice.' },
  { label: 'Project Planning', prompt: 'Based on our team profiles, how should we run a project planning meeting? Give a team impact summary, then a structured agenda covering Vision, Scope, Execution, Standards, and Ownership phases.' },
  { label: 'Reflect', prompt: 'I\'d like to reflect on my impact profile. Give me 3 strengths I underuse, 2 strengths I overuse, 1 growth edge, and 1 strategic stretch.' },
]

function ImpactChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMessage: ChatMessage = { role: 'user', content: content.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    try {
      const response = await fetch('/api/impact-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(err || 'Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let assistantContent = ''
      setMessages([...updatedMessages, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantContent += decoder.decode(value, { stream: true })
        setMessages([...updatedMessages, { role: 'assistant', content: assistantContent }])
      }
    } catch (err: any) {
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` },
      ])
    } finally {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-0">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-900">ChatGCT — Impact Assistant</h2>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {isOpen && (
          <div className="border-t border-gray-100">
            {messages.length === 0 && (
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-3">Your AI Impact Assistant. Ask about your profile, team dynamics, workload, conflict, meetings, and more.</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((sp) => (
                    <button
                      key={sp.label}
                      onClick={() => sendMessage(sp.prompt)}
                      disabled={isStreaming}
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50"
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.length > 0 && (
              <div ref={messagesContainerRef} className="max-h-[32rem] overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.content.split('\n').map((line, j) => (
                        <p key={j} className={j > 0 ? 'mt-2' : ''}>
                          {line}
                        </p>
                      ))}
                      {msg.role === 'assistant' && msg.content === '' && isStreaming && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            {messages.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SUGGESTED_PROMPTS.map((sp) => (
                    <button
                      key={sp.label}
                      onClick={() => sendMessage(sp.prompt)}
                      disabled={isStreaming}
                      className="text-[10px] px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full transition-colors disabled:opacity-50"
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 border-t border-gray-100">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your profile, team, or working strategies..."
                  rows={1}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isStreaming}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3"
                >
                  {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { data: profile, isLoading } = trpc.impactAlignment.getMyProfile.useQuery()
  const { data: assessmentHistory } = trpc.impactAlignment.getAssessmentHistory.useQuery()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No profile yet</h2>
          <p className="text-gray-500 mb-4">Complete the assessment to see your Impact Profile.</p>
          <Link href="/intranet/impact-alignment">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl">
              Get Started
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  const narrative = profile.narrativeJson as NarrativeJson | null
  const isNewFormat = !!narrative?.energyMapSummary

  const chartData = [
    { dimension: 'Strategist', score: profile.assessment.strategistScore, fullMark: 10 },
    { dimension: 'Game Changer', score: profile.assessment.ideasScore, fullMark: 10 },
    { dimension: 'Implementer', score: profile.assessment.executionScore, fullMark: 10 },
    { dimension: 'Play Maker', score: profile.assessment.peopleScore, fullMark: 10 },
    { dimension: 'Polisher', score: profile.assessment.excellenceScore, fullMark: 10 },
  ]

  const isLocked = new Date() < new Date(profile.editLockedUntil)
  const lockLabel = isLocked ? formatEditLockRemaining(profile.editLockedUntil) : null

  const lastCompleted = new Date(profile.lastGeneratedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const significantShift =
    assessmentHistory &&
    assessmentHistory.length >= 2 &&
    (Math.abs(profile.assessment.strategistScore - (assessmentHistory[1]?.strategistScore ?? 0)) > 3 ||
      Math.abs(profile.assessment.ideasScore - (assessmentHistory[1]?.ideasScore ?? 0)) > 3 ||
      Math.abs(profile.assessment.executionScore - (assessmentHistory[1]?.executionScore ?? 0)) > 3 ||
      Math.abs(profile.assessment.peopleScore - (assessmentHistory[1]?.peopleScore ?? 0)) > 3 ||
      Math.abs(profile.assessment.excellenceScore - (assessmentHistory[1]?.excellenceScore ?? 0)) > 3)

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/intranet/impact-alignment">
              <Button variant="ghost" size="sm" className="rounded-lg">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Compass className="w-6 h-6 text-green-600" />
              Impact Profile
            </h1>
          </div>
          <div className="flex gap-2">
            {isLocked ? (
              <Button variant="outline" disabled className="rounded-xl text-xs">
                <Lock className="w-3.5 h-3.5 mr-1" />
                Edit in {lockLabel}
              </Button>
            ) : (
              <Link href="/intranet/impact-alignment/assess">
                <Button variant="outline" className="rounded-xl">Edit Profile</Button>
              </Link>
            )}
            <Link href="/intranet/impact-alignment/team">
              <Button variant="outline" className="rounded-xl">
                <Users className="w-4 h-4 mr-1" />
                Team
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-1">Name: {session?.user?.name || 'Team Member'}</p>
            <p className="text-sm text-gray-500">
              Last Completed: {lastCompleted}
              {profile.version ? ` (v${profile.version})` : ''}
            </p>
          </CardContent>
        </Card>

        {/* AI Chat */}
        <ImpactChat />

        {significantShift && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>Significant shift detected.</strong> Your scores differ by more than 3 points from your
            previous assessment. Reflect on whether this represents growth, context change, or emotional state.
          </div>
        )}

        {/* Score Matrix (Bubble Chart) */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Your Score Matrix</h2>
            <BubbleMatrix
              scores={{
                strategist: profile.assessment.strategistScore,
                ideas: profile.assessment.ideasScore,
                execution: profile.assessment.executionScore,
                people: profile.assessment.peopleScore,
                excellence: profile.assessment.excellenceScore,
              }}
            />
          </CardContent>
        </Card>

        {/* Energy Level Guide */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Your Energy Levels</h2>
            <p className="text-sm text-gray-500 mb-4">
              These are a measurement of Energy for Impact. They are not test scores — there is no right or wrong profile.
            </p>
            <EnergyLevelGuide />
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Energy Map</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickCount={6}
                  />
                  <Radar
                    name="You"
                    dataKey="score"
                    stroke="#16a34a"
                    fill="#16a34a"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {isNewFormat ? (
          <>
            <Card className="mb-4">
              <CardContent className="p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Energy Map Summary</h2>
                <p className="text-gray-700 leading-relaxed">{narrative.energyMapSummary}</p>
              </CardContent>
            </Card>

            {narrative.whereYouCreateImpact?.length ? (
              <Card className="mb-4">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <h2 className="font-semibold text-gray-900">Where You Naturally Create Impact</h2>
                  </div>
                  <ul className="space-y-2">
                    {narrative.whereYouCreateImpact.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {narrative.areasRequiringIntentionalEnergy && (
              <Card className="mb-4">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-amber-600" />
                    <h2 className="font-semibold text-gray-900">Areas That Require More Intentional Energy</h2>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {narrative.areasRequiringIntentionalEnergy}
                  </p>
                </CardContent>
              </Card>
            )}

            {narrative.underStressYouTendTo?.length ? (
              <Card className="mb-4">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-red-500" />
                    <h2 className="font-semibold text-gray-900">Under Stress You Tend To</h2>
                  </div>
                  <ul className="space-y-2">
                    {narrative.underStressYouTendTo.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {narrative.howToWorkEffectivelyWithYou?.length ? (
              <Card className="mb-4">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Handshake className="w-5 h-5 text-blue-600" />
                    <h2 className="font-semibold text-gray-900">How To Work Effectively With You</h2>
                  </div>
                  <ul className="space-y-2">
                    {narrative.howToWorkEffectivelyWithYou.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {narrative.teamInteractionInsight && (
              <Card className="mb-4">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h2 className="font-semibold text-gray-900">Team Interaction Insight</h2>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {narrative.teamInteractionInsight}
                  </p>
                </CardContent>
              </Card>
            )}

            {narrative.roleFitOverlay && (
              <Card className="mb-4">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <h2 className="font-semibold text-gray-900">Role Fit Overlay</h2>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{narrative.roleFitOverlay}</p>
                </CardContent>
              </Card>
            )}

            {narrative.energyCostIndicator && (
              <Card className="mb-4">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="w-5 h-5 text-teal-600" />
                    <h2 className="font-semibold text-gray-900">Energy Cost Indicator</h2>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {narrative.energyCostIndicator}
                  </p>
                </CardContent>
              </Card>
            )}

            {narrative.accountabilityStatement && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-gray-600" />
                    <h2 className="font-semibold text-gray-900">Accountability</h2>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{narrative.accountabilityStatement}</p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            <Card className="mb-6">
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed">{profile.headlineSummary}</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Assessment History */}
        {assessmentHistory && assessmentHistory.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Assessment History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                      <th className="text-center py-2 text-gray-500 font-medium">Strat.</th>
                      <th className="text-center py-2 text-gray-500 font-medium">Ideas</th>
                      <th className="text-center py-2 text-gray-500 font-medium">Exec.</th>
                      <th className="text-center py-2 text-gray-500 font-medium">People</th>
                      <th className="text-center py-2 text-gray-500 font-medium">Excel.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessmentHistory.map((a) => (
                      <tr key={a.id} className="border-b border-gray-100">
                        <td className="py-2 text-gray-700">
                          {new Date(a.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-2 text-center">{a.strategistScore}</td>
                        <td className="py-2 text-center">{a.ideasScore}</td>
                        <td className="py-2 text-center">{a.executionScore}</td>
                        <td className="py-2 text-center">{a.peopleScore}</td>
                        <td className="py-2 text-center">{a.excellenceScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
