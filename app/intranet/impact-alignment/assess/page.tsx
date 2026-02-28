'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Map,
  Lightbulb,
  Zap,
  Users,
  Star,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
} from 'lucide-react'

const SECTIONS = [
  {
    id: 'strategist',
    label: 'Strategist',
    subtitle: 'Vision & Direction',
    icon: Map,
    color: 'text-cyan-600 bg-cyan-50',
    questions: [
      'I naturally think about where things are heading long-term.',
      'I prefer to understand the full picture before making decisions.',
      'I enjoy connecting ideas from different areas to form a coherent plan.',
      'I focus more on strategy than day-to-day operations.',
      'I find it energising to map out future possibilities and pathways.',
      'I often think about how today\'s decisions will play out months or years from now.',
    ],
  },
  {
    id: 'ideas',
    label: 'Game Changer',
    subtitle: 'Innovation & Disruption',
    icon: Lightbulb,
    color: 'text-blue-600 bg-blue-50',
    questions: [
      'I frequently think about how things could be radically improved.',
      'I get energised by new possibilities more than optimising what exists.',
      'I become restless if work feels repetitive.',
      'I enjoy challenging existing assumptions.',
      'I would rather start something new than maintain something stable.',
      'I feel frustrated when ideas are dismissed too quickly.',
    ],
  },
  {
    id: 'execution',
    label: 'Implementer',
    subtitle: 'Action & Delivery',
    icon: Zap,
    color: 'text-orange-600 bg-orange-50',
    questions: [
      'I get satisfaction from completing tasks efficiently.',
      'I prefer action over extended discussion.',
      'I move quickly from decision to implementation.',
      'I am comfortable taking responsibility for outcomes.',
      'I dislike leaving tasks unfinished.',
      'I prioritise progress over perfection.',
    ],
  },
  {
    id: 'people',
    label: 'Play Maker',
    subtitle: 'Collaboration & Alignment',
    icon: Users,
    color: 'text-purple-600 bg-purple-50',
    questions: [
      'I naturally consider how decisions affect others.',
      'I prefer alignment before major action.',
      'I am comfortable facilitating group discussion.',
      'I notice interpersonal tension quickly.',
      'I value consensus over unilateral decisions.',
      'I invest time in maintaining relationships at work.',
    ],
  },
  {
    id: 'excellence',
    label: 'Polisher',
    subtitle: 'Standards & Refinement',
    icon: Star,
    color: 'text-emerald-600 bg-emerald-50',
    questions: [
      'I find it difficult to accept work that is "good enough."',
      'I instinctively look for ways to improve output.',
      'I care deeply about quality and detail.',
      'I become frustrated with sloppy execution.',
      'I hold myself to very high standards.',
      'I often refine work beyond minimum requirements.',
    ],
  },
] as const

type Phase = 'assess' | 'review' | 'confirm' | 'generating'

export default function AssessmentPage() {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(0)
  const [answers, setAnswers] = useState<number[]>(Array(30).fill(5))
  const [phase, setPhase] = useState<Phase>('assess')
  const [agreed, setAgreed] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: reassessInfo, isLoading: checkingCooldown } = trpc.impactAlignment.canReassess.useQuery()
  const { data: existingProfile } = trpc.impactAlignment.getMyProfile.useQuery()
  const utils = trpc.useUtils()

  useEffect(() => {
    if (!checkingCooldown && existingProfile && reassessInfo && !reassessInfo.canReassess) {
      router.replace('/intranet/impact-alignment')
    }
  }, [checkingCooldown, existingProfile, reassessInfo, router])

  const submitAssessment = trpc.impactAlignment.submitAssessment.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.impactAlignment.getMyProfile.invalidate(),
        utils.impactAlignment.canReassess.invalidate(),
        utils.impactAlignment.getAssessmentHistory.invalidate(),
        utils.impactAlignment.getTeamAverages.invalidate(),
        utils.impactAlignment.getTeamProfiles.invalidate(),
      ])
      router.push(
        data.significantShiftDetected
          ? '/intranet/impact-alignment?shift=1'
          : '/intranet/impact-alignment'
      )
    },
    onError: (err) => {
      setSubmitError(err.message || 'Something went wrong. Please try again.')
      setPhase('review')
    },
  })

  const section = SECTIONS[currentSection]
  const sectionOffset = currentSection * 6
  const progress = phase === 'assess'
    ? ((currentSection + 1) / SECTIONS.length) * 100
    : 100

  const setAnswer = (questionIndex: number, value: number) => {
    const newAnswers = [...answers]
    newAnswers[sectionOffset + questionIndex] = value
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      setPhase('review')
    }
  }

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleSubmit = () => {
    setSubmitError(null)
    setPhase('generating')
    submitAssessment.mutate({ answers })
  }

  if (checkingCooldown) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </main>
    )
  }

  if (existingProfile && reassessInfo && !reassessInfo.canReassess) {
    return null
  }

  if (phase === 'generating') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Generating your Impact Profile...
          </h2>
          <p className="text-gray-500">
            Our AI is analysing your responses to create your personalised profile.
          </p>
        </div>
      </main>
    )
  }

  if (phase === 'review' || phase === 'confirm') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Your Responses</h1>
          <p className="text-sm text-gray-500 mb-6">
            Check your answers before submitting. You can go back to adjust if needed.
          </p>

          {SECTIONS.map((sec, sIdx) => {
            const Icon = sec.icon
            return (
              <Card key={sec.id} className="mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${sec.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{sec.label}</h3>
                    <span className="text-xs text-gray-400 ml-auto">
                      Avg: {(answers.slice(sIdx * 6, sIdx * 6 + 6).reduce((a, b) => a + b, 0) / 6).toFixed(1)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sec.questions.map((q, qIdx) => (
                      <div key={qIdx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex-1 mr-3 line-clamp-1">{q}</span>
                        <span className="font-medium text-gray-900 w-6 text-right">
                          {answers[sIdx * 6 + qIdx]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
              <strong>Submission failed:</strong> {submitError}
              <p className="mt-1 text-red-600">
                Check that OPENAI_API_KEY is set in your environment. You can try again or go back to edit your answers.
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setSubmitError(null)
                setCurrentSection(0)
                setPhase('assess')
              }}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Go Back
            </Button>
            <Button
              onClick={() => {
                setSubmitError(null)
                setPhase('confirm')
              }}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
            >
              Submit
              <Check className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        <Dialog open={phase === 'confirm'} onOpenChange={(open) => !open && (setPhase('review'), setSubmitError(null))}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Before you submit</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                Your Impact Alignment profile will be <strong>visible to your team</strong>. This
                is designed to help everyone understand how to work together more effectively.
              </p>
              <p>
                You are responsible for the accuracy of your responses. Be honest — this only works
                if people reflect genuinely.
              </p>
              <p className="text-amber-700 font-medium">
                You will not be able to retake this assessment for 6 months.
              </p>
              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  I understand my profile will be visible to my team and I have answered honestly.
                </span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPhase('review')}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!agreed}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Confirm & Generate Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    )
  }

  const Icon = section.icon

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {existingProfile && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
            You are retaking the assessment. Your previous profile will be replaced.
          </div>
        )}
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">
              Section {currentSection + 1} of {SECTIONS.length}
            </span>
            <span className="text-sm text-gray-500">
              {section.label}: {section.subtitle}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{section.label}</h1>
            <p className="text-sm text-gray-500">{section.subtitle}</p>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {section.questions.map((question, qIdx) => (
            <Card key={qIdx}>
              <CardContent className="p-4">
                <p className="text-sm font-medium text-gray-800 mb-4">{question}</p>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 w-16 text-right">Disagree</span>
                  <div className="flex-1">
                    <Slider
                      value={[answers[sectionOffset + qIdx]]}
                      onValueChange={([val]) => setAnswer(qIdx, val)}
                      min={1}
                      max={10}
                      step={1}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12">Agree</span>
                  <span className="text-lg font-bold text-gray-900 w-8 text-center">
                    {answers[sectionOffset + qIdx]}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentSection === 0}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
          >
            {currentSection === SECTIONS.length - 1 ? 'Review' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </main>
  )
}
