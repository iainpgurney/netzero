'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, XCircle, Award, ArrowRight } from 'lucide-react'

interface Quiz {
  id: string
  question: string
  options: string
  correctAnswer: number
  explanation: string | null
  order: number
}

interface QuizComponentProps {
  moduleId: string
  quizzes: Quiz[]
  onComplete: () => void
  badgeName: string
  badgeEmoji: string
  courseSlug?: string
}

export default function QuizComponent({
  moduleId,
  quizzes,
  onComplete,
  badgeName,
  badgeEmoji,
  courseSlug = 'netzero',
}: QuizComponentProps) {
  // Check if business name already exists in localStorage
  const getStoredBusinessName = () => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem(`businessName_${courseSlug}`) || ''
  }
  
  const [businessName, setBusinessName] = useState(getStoredBusinessName())
  const [showBusinessNameForm, setShowBusinessNameForm] = useState(!getStoredBusinessName())
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<Record<number, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const submitAnswer = trpc.learning.submitQuizAnswer.useMutation()
  const completeQuiz = trpc.learning.completeQuiz.useMutation()
  const { data: nextModule } = trpc.learning.getNextModule.useQuery({ moduleId })
  const utils = trpc.useUtils()

  const handleAnswerSelect = async (answerIndex: number) => {
    const quiz = quizzes[currentQuestion]
    if (!quiz || isSubmitting) return

    setIsSubmitting(true)
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: answerIndex })

    try {
      // Submit answer
      const result = await submitAnswer.mutateAsync({
        quizId: quiz.id,
        selectedAnswer: answerIndex,
      })

      setResults({ ...results, [currentQuestion]: result.isCorrect })
      setShowFeedback(true)
    } catch (error) {
      console.error('Error submitting answer:', error)
      // Still show feedback even if submission fails
      const isCorrect = answerIndex === quiz.correctAnswer
      setResults({ ...results, [currentQuestion]: isCorrect })
      setShowFeedback(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextQuestion = () => {
    setShowFeedback(false)
    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // All questions answered, show results
      setShowResults(true)
    }
  }

  const handleFinishQuiz = async (navigateToNext = false) => {
    const correctAnswers = Object.values(results).filter((r) => r).length
    const score = (correctAnswers / quizzes.length) * 100

    try {
      await completeQuiz.mutateAsync({
        moduleId,
        score,
      })

      // Invalidate all relevant queries to refresh data (including profile badges)
      await utils.learning.getDashboardStats.invalidate()
      await utils.learning.getModules.invalidate()
      await utils.learning.getUserBadges.invalidate()
      
      // If navigating to next module, invalidate its query too so it re-checks lock status
      if (navigateToNext && nextModule) {
        await utils.learning.getModule.invalidate({ moduleId: nextModule.id })
        // Navigate directly to next module
        window.location.href = `/dashboard/learning/${nextModule.courseSlug || courseSlug}/modules/${nextModule.id}`
      } else {
        // Call onComplete to show completion screen
        onComplete()
      }
    } catch (error) {
      console.error('Error completing quiz:', error)
      // Still proceed even if there's an error
      if (navigateToNext && nextModule) {
        await utils.learning.getModule.invalidate({ moduleId: nextModule.id })
        window.location.href = `/dashboard/learning/${nextModule.courseSlug || courseSlug}/modules/${nextModule.id}`
      } else {
        onComplete()
      }
    }
  }

  if (showResults) {
    const correctAnswers = Object.values(results).filter((r) => r).length
    const score = (correctAnswers / quizzes.length) * 100
    const passed = score >= 70

    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
          <CardDescription>You scored {Math.round(score)}%</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">{score >= 70 ? '🎉' : '📚'}</div>
            <h3 className="text-2xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Keep Learning!'}
            </h3>
            <p className="text-gray-600">
              You got {correctAnswers} out of {quizzes.length} questions correct.
            </p>
            {passed && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-6 h-6 text-yellow-600" />
                  <span className="text-2xl">{badgeEmoji}</span>
                </div>
                <p className="font-semibold text-gray-900">{badgeName}</p>
                <p className="text-sm text-gray-600 mt-1">Badge earned!</p>
              </div>
            )}
          </div>

          {/* Review Answers */}
          <div className="space-y-4">
            <h4 className="font-semibold">Review Your Answers</h4>
            {quizzes.map((quiz, index) => {
              const selectedAnswer = selectedAnswers[index]
              const isCorrect = results[index]
              const options = JSON.parse(quiz.options)

              return (
                <div
                  key={quiz.id}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="font-medium text-gray-900">{quiz.question}</p>
                  </div>
                  <div className="ml-7 space-y-2">
                    {options.map((option: string, optIndex: number) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded ${
                          optIndex === quiz.correctAnswer
                            ? 'bg-green-100 border border-green-300'
                            : optIndex === selectedAnswer && !isCorrect
                              ? 'bg-red-100 border border-red-300'
                              : 'bg-gray-50'
                        }`}
                      >
                        <span
                          className={
                            optIndex === quiz.correctAnswer
                              ? 'font-semibold text-green-800'
                              : optIndex === selectedAnswer && !isCorrect
                                ? 'font-semibold text-red-800'
                                : ''
                          }
                        >
                          {optIndex === quiz.correctAnswer && '✓ '}
                          {optIndex === selectedAnswer && !isCorrect && '✗ '}
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                  {quiz.explanation && (
                    <p className="mt-2 ml-7 text-sm text-gray-600 italic">
                      {quiz.explanation}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex flex-col gap-3">
            {nextModule ? (
              <>
                <Button
                  onClick={() => handleFinishQuiz(true)}
                  className="w-full"
                  size="lg"
                >
                  Next Module: {nextModule.title}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => handleFinishQuiz(false)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Back to Dashboard
                </Button>
              </>
            ) : (
              <Button onClick={() => handleFinishQuiz(false)} className="w-full" size="lg">
                Back to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show business name form first
  if (showBusinessNameForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Before You Begin</CardTitle>
          <CardDescription>
            Please provide your business name for your certificate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name:
            </label>
            <input
              id="business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-2 text-sm text-gray-500">
              This will appear on your certificate of completion
            </p>
          </div>
          <Button
            onClick={() => {
              if (businessName.trim()) {
                // Store business name in localStorage for certificate generation
                localStorage.setItem(`businessName_${courseSlug}`, businessName.trim())
                setShowBusinessNameForm(false)
              } else {
                alert('Please enter your business name')
              }
            }}
            className="w-full"
            size="lg"
            disabled={!businessName.trim()}
          >
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  const quiz = quizzes[currentQuestion]
  if (!quiz) return null

  const options = JSON.parse(quiz.options)
  const selectedAnswer = selectedAnswers[currentQuestion]
  const isAnswered = selectedAnswer !== undefined && showFeedback
  const isCorrect = results[currentQuestion]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Quiz</CardTitle>
        <CardDescription>
          Question {currentQuestion + 1} of {quizzes.length}
        </CardDescription>
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizzes.length) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">{quiz.question}</h3>
          
          {/* Feedback Banner */}
          {isAnswered && (
            <div
              className={`mb-4 p-4 rounded-lg border-2 flex items-center gap-3 ${
                isCorrect
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">Correct!</p>
                    <p className="text-sm text-green-700">Well done!</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-800">Incorrect</p>
                    <p className="text-sm text-red-700">Don&apos;t worry, keep learning!</p>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-2">
            {options.map((option: string, index: number) => {
              const isSelected = selectedAnswer === index
              const showCorrect = isAnswered && index === quiz.correctAnswer
              const showIncorrect = isAnswered && isSelected && !isCorrect

              return (
                <button
                  key={index}
                  onClick={() => !isAnswered && !isSubmitting && handleAnswerSelect(index)}
                  disabled={isAnswered || isSubmitting}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50'
                      : showIncorrect
                        ? 'border-red-500 bg-red-50'
                        : isSelected && !isAnswered
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                  } ${isAnswered || isSubmitting ? 'cursor-default opacity-75' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-2">
                    {isSubmitting && isSelected && (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {showIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
                    <span
                      className={
                        showCorrect
                          ? 'font-semibold text-green-800'
                          : showIncorrect
                            ? 'font-semibold text-red-800'
                            : 'text-gray-900'
                      }
                    >
                      {option}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
          
          {isAnswered && quiz.explanation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
              <p className="text-sm text-gray-700">{quiz.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleNextQuestion}
                size="lg"
                className="min-w-[120px]"
              >
                {currentQuestion < quizzes.length - 1 ? 'Next Question' : 'View Results'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

