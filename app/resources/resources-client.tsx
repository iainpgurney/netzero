'use client'

import { useState, type ReactElement, type ChangeEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Search, AlertTriangle, CheckCircle2, XCircle, Info, MessageSquare, RotateCcw, Loader2 } from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { createWorker } from 'tesseract.js'

interface ClaimAnalysis {
  claimText: string
  category: string
  riskLevel: 'high' | 'medium' | 'low'
  confidenceScore: number
  improvementSuggestions: string[]
  annotationTypes: string[]
}

interface TrustScore {
  overallScore: number
  claimValidity: number
  documentationQuality: number
  consistencyScore: number
}

interface FlaggedPhrase {
  text: string
  riskLevel: 'high' | 'medium' | 'low'
  startIndex?: number
  endIndex?: number
}

interface AnalysisResult {
  isGreenwashing: boolean
  confidence: number
  redFlags: string[]
  suggestions: string[]
  trustScore: TrustScore
  claimsAnalysis: ClaimAnalysis[]
  riskLevel: 'high' | 'medium' | 'low'
  improvementAreas: {
    highPriority: string[]
    mediumPriority: string[]
    lowPriority: string[]
  }
  detectionMethod?: 'rule-based' | 'llm' | 'hybrid'
  classification?: 'Greenwashing' | 'Greenhushing' | 'Greenwishing' | 'Legitimate'
  techniqueId?: string
  flaggedPhrases?: FlaggedPhrase[]
}

export default function ResourcesClient() {
  const [statement, setStatement] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [sourceType, setSourceType] = useState<'text' | 'image' | 'website'>('text')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isProcessingWebsite, setIsProcessingWebsite] = useState(false)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [useEnhancedAnalysis, setUseEnhancedAnalysis] = useState(false)
  const [isAnalyzingLLM, setIsAnalyzingLLM] = useState(false)
  
  const submitFeedback = trpc.learning.submitGreenwashingFeedback.useMutation()
  const logSearch = trpc.learning.logGreenwashingSearch.useMutation()

  const greenwashingKeywords = [
    'eco-friendly',
    'green',
    'sustainable',
    'natural',
    'environmentally safe',
    'carbon neutral',
    'zero waste',
    '100% recyclable',
    'biodegradable',
    'organic',
    'pure',
    'clean',
    'earth-friendly',
    'planet-friendly',
  ]

  const vagueTerms = [
    'eco-friendly',
    'eco friendly',
    'green',
    'natural',
    'sustainable',
    'environmentally safe',
    'earth-friendly',
    'planet-friendly',
    'clean',
    'pure',
    'environmentally friendly',
    'earth friendly',
    'planet friendly',
  ]

  // Claim categorization
  const categorizeClaim = (text: string): string => {
    const lower = text.toLowerCase()
    if (lower.includes('product') || lower.includes('made') || lower.includes('contains')) {
      return 'Product Claims'
    }
    if (lower.includes('company') || lower.includes('we') || lower.includes('our') || lower.includes('policy')) {
      return 'Company Policy Statements'
    }
    if (lower.includes('certified') || lower.includes('certification') || lower.includes('iso') || lower.includes('standard')) {
      return 'Certification Claims'
    }
    if (lower.match(/\d+%/) || lower.includes('reduce') || lower.includes('emission') || lower.includes('carbon')) {
      return 'Quantitative Claims'
    }
    if (lower.includes('impact') || lower.includes('environment') || lower.includes('sustainable')) {
      return 'Environmental Impact Claims'
    }
    return 'General Claim'
  }

  // Detect annotation types
  const detectAnnotationTypes = (text: string, foundVagueTerms: string[], hasProof: boolean): string[] => {
    const lower = text.toLowerCase()
    const types: string[] = []

    if (foundVagueTerms.length > 0 && !hasProof) {
      types.push('Vague/Ambiguous Claims')
    }
    if (!hasProof && (foundVagueTerms.length > 0 || lower.match(/\d+%/))) {
      types.push('Unsubstantiated Claims')
    }
    if (lower.includes('better than') || lower.includes('compared to')) {
      types.push('Hidden Trade-offs')
    }
    if (lower.includes('100%') && !lower.includes('certified')) {
      types.push('False Claims')
    }
    if (lower.includes('cfc-free') || lower.includes('already banned')) {
      types.push('Irrelevant Claims')
    }

    return types.length > 0 ? types : ['Verified Claim']
  }

  const checkGreenwashing = async () => {
    // Save previous analysis if exists
    if (analysis && statement.trim()) {
      saveCurrentAnalysis()
    }

    if (!statement.trim()) {
      return
    }

    // Run rule-based analysis first
    const ruleBasedResult = runRuleBasedAnalysis()
    
    // Determine if we should use LLM
    const shouldUseLLM = useEnhancedAnalysis || shouldUseLLMForStatement(statement, ruleBasedResult.trustScore.overallScore)
    
    let llmResult: any = null
    let detectionMethod: 'rule-based' | 'llm' | 'hybrid' = 'rule-based'
    
    if (shouldUseLLM) {
      setIsAnalyzingLLM(true)
      try {
        const response = await fetch('/api/analyze-greenwashing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            statement: statement.trim(),
            sourceType,
            industry: undefined, // Could be extracted or user-provided
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          llmResult = data.analysis
          detectionMethod = useEnhancedAnalysis ? 'llm' : 'hybrid'
        } else {
          console.warn('LLM analysis failed, using rule-based only')
        }
      } catch (error) {
        console.error('Error calling LLM API:', error)
        // Fall back to rule-based
      } finally {
        setIsAnalyzingLLM(false)
      }
    }
    
    // Merge results
    const finalResult = mergeAnalysisResults(ruleBasedResult, llmResult, detectionMethod)
    setAnalysis(finalResult)
    
    // Log search to database
    logSearch.mutate(
      {
        statement,
        isGreenwashing: finalResult.isGreenwashing,
        confidence: finalResult.confidence,
        riskLevel: finalResult.riskLevel,
        trustScore: finalResult.trustScore,
        category: finalResult.claimsAnalysis[0]?.category,
        annotationTypes: finalResult.claimsAnalysis[0]?.annotationTypes,
        redFlags: finalResult.redFlags,
        sourceType,
        imageUrl: imagePreview || undefined,
        websiteUrl: sourceType === 'website' ? websiteUrl : undefined,
        techniqueId: finalResult.techniqueId,
        classification: finalResult.classification,
      },
      {
        onError: (error) => {
          console.warn('Failed to log search:', error.message)
        },
      }
    )
  }

  const shouldUseLLMForStatement = (statement: string, ruleBasedScore: number): boolean => {
    const length = statement.trim().length
    const hasJargon = /(?:emission|scope|carbon|footprint|sustainability|esg|stakeholder|impact|metric|baseline|target|commitment|initiative)/i.test(statement)
    
    // Use LLM for complex cases
    if (length > 200) return true
    if (ruleBasedScore >= 60 && ruleBasedScore <= 80) return true // Ambiguous
    if (hasJargon && length > 100) return true
    
    return false
  }

  // Highlight flagged phrases in text
  const highlightFlaggedPhrases = (
    text: string,
    flaggedPhrases: FlaggedPhrase[]
  ) => {
    if (!flaggedPhrases || flaggedPhrases.length === 0) {
      return <span>{text}</span>
    }

    // Create a sorted list of highlights with their positions
    const highlights: Array<{
      start: number
      end: number
      riskLevel: 'high' | 'medium' | 'low'
      phrase: string
    }> = []

    const lowerText = text.toLowerCase()

    flaggedPhrases.forEach((phrase) => {
      const phraseText = phrase.text.trim()
      // Remove leading/trailing ellipsis and clean up
      const cleanPhrase = phraseText.replace(/^\.\.\./, '').replace(/\.\.\.$/, '').trim()
      const lowerPhrase = cleanPhrase.toLowerCase()
      
      if (lowerPhrase.length === 0) return
      
      // Find all occurrences of the phrase in the text (case-insensitive)
      let searchStart = 0
      let foundMatch = false
      
      while (true) {
        const index = lowerText.indexOf(lowerPhrase, searchStart)
        if (index === -1) {
          // If exact match not found, try to find partial matches (for phrases with punctuation differences)
          if (!foundMatch && lowerPhrase.length > 10) {
            // Try matching without punctuation
            const cleanLowerPhrase = lowerPhrase.replace(/[^\w\s]/g, '')
            const cleanLowerText = lowerText.replace(/[^\w\s]/g, '')
            const partialIndex = cleanLowerText.indexOf(cleanLowerPhrase)
            if (partialIndex >= 0) {
              // Map back to original text position (approximate)
              const charCount = (cleanLowerText.substring(0, partialIndex).match(/[^\w\s]/g) || []).length
              const mappedIndex = partialIndex + charCount
              if (mappedIndex < text.length) {
                highlights.push({
                  start: mappedIndex,
                  end: Math.min(mappedIndex + cleanPhrase.length, text.length),
                  riskLevel: phrase.riskLevel,
                  phrase: cleanPhrase,
                })
                foundMatch = true
              }
            }
          }
          break
        }
        
        // Check if this is a reasonable match (word boundary or at text boundaries)
        const beforeChar = index > 0 ? text[index - 1] : ' '
        const afterChar = index + cleanPhrase.length < text.length ? text[index + cleanPhrase.length] : ' '
        const isWordBoundary = /[\s\.,!?;:()\[\]{}"'\-]/.test(beforeChar) || /[\s\.,!?;:()\[\]{}"'\-]/.test(afterChar)
        const atStart = index === 0
        const atEnd = index + cleanPhrase.length >= text.length
        
        if (isWordBoundary || atStart || atEnd || cleanPhrase.length > 15) {
          highlights.push({
            start: index,
            end: index + cleanPhrase.length,
            riskLevel: phrase.riskLevel,
            phrase: cleanPhrase,
          })
          foundMatch = true
        }
        
        searchStart = index + 1
      }
    })

    // Sort highlights by start position
    highlights.sort((a, b) => a.start - b.start)

    // Remove overlapping highlights (prioritize high risk)
    const filteredHighlights: typeof highlights = []
    for (let i = 0; i < highlights.length; i++) {
      const current = highlights[i]
      let shouldAdd = true

      for (let j = 0; j < filteredHighlights.length; j++) {
        const existing = filteredHighlights[j]
        
        // Check for overlap
        if (
          (current.start >= existing.start && current.start < existing.end) ||
          (current.end > existing.start && current.end <= existing.end) ||
          (current.start <= existing.start && current.end >= existing.end)
        ) {
          // If overlapping, keep the one with higher risk
          const riskOrder = { high: 0, medium: 1, low: 2 }
          if (riskOrder[current.riskLevel] < riskOrder[existing.riskLevel]) {
            // Current has higher risk, replace existing
            filteredHighlights[j] = current
            shouldAdd = false
            break
          } else {
            // Existing has higher or equal risk, skip current
            shouldAdd = false
            break
          }
        }
      }

      if (shouldAdd) {
        filteredHighlights.push(current)
      }
    }

    // Sort again after filtering
    filteredHighlights.sort((a, b) => a.start - b.start)

    // Build React elements with highlights
    if (filteredHighlights.length === 0) {
      return <span>{text}</span>
    }

    const elements: ReactElement[] = []
    let lastIndex = 0

    filteredHighlights.forEach((highlight, idx) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>{text.substring(lastIndex, highlight.start)}</span>
        )
      }

      // Add highlighted text
      const highlightClass =
        highlight.riskLevel === 'high'
          ? 'bg-red-200 text-red-900'
          : highlight.riskLevel === 'medium'
          ? 'bg-yellow-200 text-yellow-900'
          : 'bg-gray-200 text-gray-700'

      elements.push(
        <span
          key={`highlight-${idx}`}
          className={`${highlightClass} font-medium px-0.5 rounded`}
          title={`${highlight.riskLevel.toUpperCase()} risk: ${highlight.phrase}`}
        >
          {text.substring(highlight.start, highlight.end)}
        </span>
      )

      lastIndex = highlight.end
    })

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(<span key="text-end">{text.substring(lastIndex)}</span>)
    }

    return <>{elements}</>
  }

  // Extract phrases containing flagged terms
  const extractFlaggedPhrases = (
    text: string,
    foundVagueTerms: string[],
    hasProof: boolean
  ): FlaggedPhrase[] => {
    const phrases: FlaggedPhrase[] = []
    const lowerText = text.toLowerCase()
    
    // Define proof indicators once for use throughout the function
    const proofIndicators = ['certified', 'verified', 'tested', 'proven', 'data', 'metric', 'standard', 'iso', 'audit']
    
    // Split text into sentences/phrases (by periods, exclamation, question marks, or newlines)
    const sentenceDelimiters = /[.!?]\s+|\n+/g
    const sentences = text.split(sentenceDelimiters).filter(s => s.trim().length > 0)
    
    // If no sentence delimiters found, treat entire text as one sentence
    if (sentences.length === 0) {
      sentences.push(text)
    }
    
    sentences.forEach((sentence) => {
      const lowerSentence = sentence.toLowerCase()
      const sentenceStart = text.indexOf(sentence)
      
      // Check for vague terms in this sentence
      const sentenceVagueTerms = foundVagueTerms.filter((term) =>
        lowerSentence.includes(term.toLowerCase())
      )
      
      if (sentenceVagueTerms.length > 0) {
        // Determine risk level based on context
        const sentenceHasProof = proofIndicators.some((indicator) => lowerSentence.includes(indicator))
        const sentenceHasPercentage = lowerSentence.match(/\d+%/) !== null
        
        let riskLevel: 'high' | 'medium' | 'low' = 'low'
        if (!sentenceHasProof && !sentenceHasPercentage) {
          riskLevel = 'high'
        } else if (sentenceHasProof || sentenceHasPercentage) {
          riskLevel = 'medium'
        }
        
        // Extract phrase (up to 200 chars, centered around the vague term)
        let phrase = sentence.trim()
        if (phrase.length > 200) {
          // Find the first vague term position
          const firstTerm = sentenceVagueTerms[0]
          const termIndex = lowerSentence.indexOf(firstTerm.toLowerCase())
          const start = Math.max(0, termIndex - 50)
          const end = Math.min(phrase.length, termIndex + firstTerm.length + 150)
          phrase = phrase.substring(start, end)
          if (start > 0) phrase = '...' + phrase
          if (end < sentence.length) phrase = phrase + '...'
        }
        
        phrases.push({
          text: phrase,
          riskLevel,
          startIndex: sentenceStart >= 0 ? sentenceStart : undefined,
          endIndex: sentenceStart >= 0 ? sentenceStart + sentence.length : undefined,
        })
      }
      
      // Check for absolute claims without proof
      const absoluteTerms = ['100%', 'completely', 'totally', 'fully', 'entirely', 'zero']
      const hasAbsolute = absoluteTerms.some((term) => lowerSentence.includes(term))
      if (hasAbsolute && !proofIndicators.some((indicator) => lowerSentence.includes(indicator))) {
        const existingPhrase = phrases.find(p => 
          p.startIndex === sentenceStart || 
          sentence.includes(p.text) || 
          p.text.includes(sentence.substring(0, 50))
        )
        if (!existingPhrase) {
          let phrase = sentence.trim()
          if (phrase.length > 200) {
            const absTerm = absoluteTerms.find(t => lowerSentence.includes(t))!
            const termIndex = lowerSentence.indexOf(absTerm)
            const start = Math.max(0, termIndex - 50)
            const end = Math.min(phrase.length, termIndex + absTerm.length + 150)
            phrase = phrase.substring(start, end)
            if (start > 0) phrase = '...' + phrase
            if (end < sentence.length) phrase = phrase + '...'
          }
          phrases.push({
            text: phrase,
            riskLevel: 'high',
            startIndex: sentenceStart >= 0 ? sentenceStart : undefined,
            endIndex: sentenceStart >= 0 ? sentenceStart + sentence.length : undefined,
          })
        }
      }
      
      // Check for comparison to worse alternatives
      if (
        lowerSentence.includes('better than') ||
        lowerSentence.includes('compared to') ||
        lowerSentence.includes(' vs ')
      ) {
        const existingPhrase = phrases.find(p => 
          p.startIndex === sentenceStart || 
          sentence.includes(p.text) || 
          p.text.includes(sentence.substring(0, 50))
        )
        if (!existingPhrase) {
          let phrase = sentence.trim()
          if (phrase.length > 200) {
            const compTerm = ['better than', 'compared to', ' vs '].find(t => lowerSentence.includes(t))!
            const termIndex = lowerSentence.indexOf(compTerm)
            const start = Math.max(0, termIndex - 50)
            const end = Math.min(phrase.length, termIndex + compTerm.length + 150)
            phrase = phrase.substring(start, end)
            if (start > 0) phrase = '...' + phrase
            if (end < sentence.length) phrase = phrase + '...'
          }
          phrases.push({
            text: phrase,
            riskLevel: 'medium',
            startIndex: sentenceStart >= 0 ? sentenceStart : undefined,
            endIndex: sentenceStart >= 0 ? sentenceStart + sentence.length : undefined,
          })
        }
      }
    })
    
    return phrases
  }

  const runRuleBasedAnalysis = () => {
    const lowerStatement = statement.toLowerCase()
    const redFlags: string[] = []
    const suggestions: string[] = []
    const highPriority: string[] = []
    const mediumPriority: string[] = []
    const lowPriority: string[] = []

    // Check for vague terms - these are ALWAYS red flags when used alone
    const foundVagueTerms = vagueTerms.filter((term) =>
      lowerStatement.includes(term.toLowerCase())
    )
    
    // Check if there's specific data/metrics/certification to back it up
    const proofIndicators = ['certified', 'verified', 'tested', 'proven', 'data', 'metric', 'standard', 'iso', 'audit']
    const hasProof = proofIndicators.some((indicator) => lowerStatement.includes(indicator))
    const hasPercentage = lowerStatement.match(/\d+%/) !== null
    const hasSpecificBacking = hasProof || hasPercentage || lowerStatement.includes('carbon neutral')
    
    // Extract flagged phrases
    const flaggedPhrases = extractFlaggedPhrases(statement, foundVagueTerms, hasProof)
    
    // Claim Validity Score (40%)
    let claimValidityScore = 100
    if (foundVagueTerms.length > 0 && !hasSpecificBacking) {
      claimValidityScore -= 60
      redFlags.push(`HIGH RISK: Uses vague terms without proof: "${foundVagueTerms.join('", "')}"`)
      highPriority.push('Replace vague terms with specific, measurable claims')
      suggestions.push('"Eco-friendly" and similar terms are vague and meaningless without specific, verifiable evidence.')
      suggestions.push('Example: Instead of "eco-friendly", say "Made with 50% recycled materials, certified by [organization]"')
    } else if (foundVagueTerms.length > 0 && hasSpecificBacking) {
      claimValidityScore -= 20
      redFlags.push(`MEDIUM RISK: Uses vague terms: ${foundVagueTerms.join(', ')}`)
      mediumPriority.push('Even with backing, vague terms can be misleading. Consider using more specific language.')
      suggestions.push('Consider replacing vague terms with more specific language even when backed by certification.')
    }

    // Documentation Quality Score (30%)
    let documentationQualityScore = 100
    if (!hasProof && foundVagueTerms.length > 0) {
      documentationQualityScore -= 50
      redFlags.push('HIGH RISK: Claims lack proof or verification')
      highPriority.push('Add third-party certification or specific data to support claims')
      suggestions.push('Add third-party certification or specific data to support claims')
    } else if (!hasProof && !foundVagueTerms.length) {
      documentationQualityScore -= 20
      mediumPriority.push('Consider adding supporting documentation or certification')
    }

    // Consistency Check Score (30%)
    let consistencyScore = 100
    
    // Check for excessive green imagery language
    const greenImagery = ['green', 'earth', 'planet', 'nature', 'eco', 'sustainable']
    const greenCount = greenImagery.filter((word) => lowerStatement.includes(word)).length
    if (greenCount > 3) {
      consistencyScore -= 30
      redFlags.push('MEDIUM RISK: Excessive use of green imagery language')
      mediumPriority.push('Focus on specific environmental benefits rather than green buzzwords')
      suggestions.push('Focus on specific environmental benefits rather than green buzzwords')
    }

    // Check for comparison to worse alternatives
    if (
      lowerStatement.includes('better than') ||
      lowerStatement.includes('compared to') ||
      lowerStatement.includes('vs')
    ) {
      consistencyScore -= 25
      redFlags.push('MEDIUM RISK: May be comparing to worse alternatives (lesser of two evils)')
      mediumPriority.push('Compare to industry standards or best practices instead')
      suggestions.push('Compare to industry standards or best practices instead')
    }

    // Check for absolute claims
    const absoluteTerms = ['100%', 'completely', 'totally', 'fully', 'entirely', 'zero']
    const hasAbsolute = absoluteTerms.some((term) => lowerStatement.includes(term))
    if (hasAbsolute && !hasProof) {
      consistencyScore -= 40
      redFlags.push('HIGH RISK: Uses absolute claims without verification')
      highPriority.push('Absolute claims require strong verification. Use qualified claims with specific metrics.')
      suggestions.push('Use qualified claims with specific metrics instead')
    } else if (hasAbsolute && hasProof) {
      consistencyScore -= 15
      lowPriority.push('Absolute claims are difficult to verify. Consider using qualified language.')
    }

    // Check for conflicting information
    if ((lowerStatement.includes('recyclable') && lowerStatement.includes('biodegradable')) ||
        (lowerStatement.includes('natural') && lowerStatement.includes('synthetic'))) {
      consistencyScore -= 35
      redFlags.push('MEDIUM RISK: Potentially conflicting claims detected')
      mediumPriority.push('Clarify conflicting information or provide context')
    }

    // Calculate overall trust score
    const overallScore = Math.round(
      (claimValidityScore * 0.40) +
      (documentationQualityScore * 0.30) +
      (consistencyScore * 0.30)
    )

    // Determine risk level
    let riskLevel: 'high' | 'medium' | 'low' = 'low'
    if (overallScore < 50 || highPriority.length > 0) {
      riskLevel = 'high'
    } else if (overallScore < 75 || mediumPriority.length > 0) {
      riskLevel = 'medium'
    }

    // Calculate confidence - represents how confident we are in our analysis
    // Higher trust scores = higher confidence
    // More red flags = higher confidence in greenwashing detection
    // More proof/backing = higher confidence in authenticity
    const hasVagueWithoutProof = foundVagueTerms.length > 0 && !hasProof
    
    // Base confidence from trust score (higher score = more confident)
    let confidence = Math.max(50, overallScore * 0.8) // Start at 50% minimum, scale with trust score
    
    // Increase confidence if we have clear indicators
    if (hasVagueWithoutProof && redFlags.length > 0) {
      // Clear greenwashing indicators = high confidence in detection
      confidence = Math.min(95, confidence + 20)
    } else if (hasProof && foundVagueTerms.length === 0 && redFlags.length === 0) {
      // Clear authentic indicators = high confidence in authenticity
      confidence = Math.min(95, confidence + 15)
    } else if (redFlags.length > 0) {
      // Some red flags = moderate confidence
      confidence = Math.min(90, confidence + (redFlags.length * 5))
    }
    
    // Adjust based on documentation quality
    if (documentationQualityScore >= 90 && hasProof) {
      confidence = Math.min(95, confidence + 10)
    } else if (documentationQualityScore < 50 && !hasProof) {
      confidence = Math.max(confidence - 10, 30)
    }
    
    // Final bounds check
    confidence = Math.min(95, Math.max(30, Math.round(confidence)))

    // Determine if greenwashing
    const isGreenwashing = overallScore < 70 || hasVagueWithoutProof || highPriority.length > 0

    // Categorize claim
    const category = categorizeClaim(statement)
    const annotationTypes = detectAnnotationTypes(statement, foundVagueTerms, hasProof)

    // Create claim analysis
    const claimsAnalysis: ClaimAnalysis[] = [{
      claimText: statement,
      category,
      riskLevel,
      confidenceScore: confidence,
      improvementSuggestions: [...highPriority, ...mediumPriority, ...lowPriority],
      annotationTypes,
    }]

    return {
      isGreenwashing,
      confidence,
      redFlags,
      suggestions: [...suggestions, ...highPriority, ...mediumPriority],
      trustScore: {
        overallScore,
        claimValidity: claimValidityScore,
        documentationQuality: documentationQualityScore,
        consistencyScore,
      },
      claimsAnalysis,
      riskLevel,
      improvementAreas: {
        highPriority,
        mediumPriority,
        lowPriority,
      },
      flaggedPhrases,
    }
  }

  // Merge flagged phrases from rule-based and LLM analysis
  const mergeFlaggedPhrases = (
    ruleBasedPhrases: FlaggedPhrase[],
    llmPhrases: FlaggedPhrase[] | undefined
  ): FlaggedPhrase[] => {
    const allPhrases: FlaggedPhrase[] = []
    const seenTexts = new Set<string>()
    
    // Helper to check if phrases overlap significantly
    const phrasesOverlap = (text1: string, text2: string): boolean => {
      const lower1 = text1.toLowerCase().trim()
      const lower2 = text2.toLowerCase().trim()
      // Check if one contains the other (with some tolerance for punctuation)
      const clean1 = lower1.replace(/[^\w\s]/g, '')
      const clean2 = lower2.replace(/[^\w\s]/g, '')
      return clean1.includes(clean2) || clean2.includes(clean1) || 
             (clean1.length > 0 && clean2.length > 0 && 
              (clean1.split(/\s+/).filter(w => clean2.includes(w)).length / Math.max(clean1.split(/\s+/).length, clean2.split(/\s+/).length)) > 0.5)
    }
    
    // Add rule-based phrases first
    ruleBasedPhrases.forEach((phrase) => {
      const key = phrase.text.toLowerCase().trim()
      if (!seenTexts.has(key)) {
        allPhrases.push(phrase)
        seenTexts.add(key)
      }
    })
    
    // Add LLM phrases, checking for overlaps
    if (llmPhrases && llmPhrases.length > 0) {
      llmPhrases.forEach((llmPhrase) => {
        const llmKey = llmPhrase.text.toLowerCase().trim()
        const isDuplicate = Array.from(seenTexts).some(seen => phrasesOverlap(seen, llmKey))
        
        if (!isDuplicate) {
          allPhrases.push(llmPhrase)
          seenTexts.add(llmKey)
        } else {
          // If duplicate but LLM has higher risk, update the existing phrase
          const existingIndex = allPhrases.findIndex(p => phrasesOverlap(p.text.toLowerCase().trim(), llmKey))
          if (existingIndex >= 0) {
            const existing = allPhrases[existingIndex]
            // Prioritize high risk over medium/low
            if (llmPhrase.riskLevel === 'high' && existing.riskLevel !== 'high') {
              allPhrases[existingIndex] = llmPhrase
            } else if (llmPhrase.riskLevel === 'medium' && existing.riskLevel === 'low') {
              allPhrases[existingIndex] = llmPhrase
            }
          }
        }
      })
    }
    
    // Sort by risk level (high first) and then by text
    return allPhrases.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 }
      const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
      if (riskDiff !== 0) return riskDiff
      return a.text.localeCompare(b.text)
    })
  }

  const mergeAnalysisResults = (
    ruleBased: ReturnType<typeof runRuleBasedAnalysis>,
    llmResult: any,
    detectionMethod: 'rule-based' | 'llm' | 'hybrid'
  ): AnalysisResult => {
    if (!llmResult) {
      return { ...ruleBased, detectionMethod: 'rule-based' }
    }

    // If LLM-only mode, use LLM results primarily
    if (detectionMethod === 'llm') {
      const isGreenwashing = llmResult.classification !== 'Legitimate'
      const llmConfidence = llmResult.confidence || 70
      
      // Convert LLM severity to risk level
      let riskLevel: 'high' | 'medium' | 'low' = 'low'
      if (llmResult.severityScore >= 0.7 || isGreenwashing) {
        riskLevel = 'high'
      } else if (llmResult.severityScore >= 0.4) {
        riskLevel = 'medium'
      }

      // Merge flagged phrases (LLM only, but include rule-based if available)
      const mergedPhrases = mergeFlaggedPhrases(
        ruleBased.flaggedPhrases || [],
        llmResult.flaggedPhrases || []
      )

      return {
        isGreenwashing,
        confidence: llmConfidence,
        redFlags: llmResult.redFlags || [],
        suggestions: llmResult.suggestions || [],
        trustScore: {
          overallScore: Math.round((1 - llmResult.severityScore) * 100),
          claimValidity: Math.round((1 - llmResult.severityScore) * 100),
          documentationQuality: isGreenwashing ? 50 : 90,
          consistencyScore: isGreenwashing ? 50 : 90,
        },
        claimsAnalysis: [{
          claimText: statement,
          category: categorizeClaim(statement),
          riskLevel,
          confidenceScore: llmConfidence,
          improvementSuggestions: llmResult.suggestions || [],
          annotationTypes: detectAnnotationTypes(statement, [], false),
        }],
        riskLevel,
        improvementAreas: {
          highPriority: isGreenwashing ? llmResult.redFlags?.slice(0, 3) || [] : [],
          mediumPriority: llmResult.suggestions?.slice(0, 3) || [],
          lowPriority: [],
        },
        detectionMethod: 'llm',
        classification: llmResult.classification,
        techniqueId: llmResult.techniqueId,
        flaggedPhrases: mergedPhrases.length > 0 ? mergedPhrases : undefined,
      }
    }

    // Hybrid mode: combine rule-based and LLM
    const isGreenwashing = ruleBased.isGreenwashing || (llmResult.classification !== 'Legitimate')
    
    // Weighted confidence: 60% LLM, 40% rule-based
    const hybridConfidence = Math.round(
      (llmResult.confidence || 70) * 0.6 + ruleBased.confidence * 0.4
    )

    // Merge red flags and suggestions
    const mergedRedFlags = [...new Set([...ruleBased.redFlags, ...(llmResult.redFlags || [])])]
    const mergedSuggestions = [...new Set([...ruleBased.suggestions, ...(llmResult.suggestions || [])])]

    // Use LLM classification if available
    const finalRiskLevel = llmResult.severityScore >= 0.7 ? 'high' : ruleBased.riskLevel

    // Merge flagged phrases from both methods
    const mergedPhrases = mergeFlaggedPhrases(
      ruleBased.flaggedPhrases || [],
      llmResult.flaggedPhrases || []
    )

    return {
      isGreenwashing,
      confidence: hybridConfidence,
      redFlags: mergedRedFlags,
      suggestions: mergedSuggestions,
      trustScore: {
        overallScore: Math.round(
          ruleBased.trustScore.overallScore * 0.5 + 
          (1 - llmResult.severityScore) * 100 * 0.5
        ),
        claimValidity: Math.round(
          ruleBased.trustScore.claimValidity * 0.5 + 
          (1 - llmResult.severityScore) * 100 * 0.5
        ),
        documentationQuality: ruleBased.trustScore.documentationQuality,
        consistencyScore: ruleBased.trustScore.consistencyScore,
      },
      claimsAnalysis: ruleBased.claimsAnalysis,
      riskLevel: finalRiskLevel,
      improvementAreas: {
        highPriority: [...ruleBased.improvementAreas.highPriority, ...(llmResult.redFlags?.slice(0, 2) || [])],
        mediumPriority: [...ruleBased.improvementAreas.mediumPriority, ...(llmResult.suggestions?.slice(0, 2) || [])],
        lowPriority: ruleBased.improvementAreas.lowPriority,
      },
      detectionMethod: 'hybrid',
      classification: llmResult.classification,
      techniqueId: llmResult.techniqueId,
      flaggedPhrases: mergedPhrases.length > 0 ? mergedPhrases : undefined,
    }
  }

  // Save current analysis before starting new search
  const saveCurrentAnalysis = () => {
    if (analysis && statement.trim()) {
      logSearch.mutate(
        {
          statement,
          isGreenwashing: analysis.isGreenwashing,
          confidence: analysis.confidence,
          riskLevel: analysis.riskLevel,
          trustScore: analysis.trustScore,
          category: analysis.claimsAnalysis[0]?.category,
          annotationTypes: analysis.claimsAnalysis[0]?.annotationTypes,
          redFlags: analysis.redFlags,
          sourceType,
          imageUrl: imagePreview || null,
          websiteUrl: sourceType === 'website' ? websiteUrl : null,
          techniqueId: analysis.techniqueId,
          classification: analysis.classification,
        },
        {
          onError: (error) => {
            console.warn('Failed to save search:', error.message)
          },
        }
      )
    }
  }

  const handleNewSearch = () => {
    saveCurrentAnalysis()
    setStatement('')
    setAnalysis(null)
    setShowFeedback(false)
    setFeedbackComment('')
    setFeedbackSubmitted(false)
    setImageFile(null)
    setImagePreview(null)
    setWebsiteUrl('')
    setSourceType('text')
  }

  // Handle statement change - save old analysis if exists
  const handleStatementChange = (newStatement: string) => {
    // If there's an existing analysis and user is typing a new statement, save the old one
    if (analysis && statement.trim() && newStatement !== statement) {
      saveCurrentAnalysis()
    }
    setStatement(newStatement)
  }

  // Handle image upload
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      setImageFile(file)
      setSourceType('image')
      setIsProcessingImage(true)
      setOcrProgress(0)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Extract text using OCR
      try {
        const worker = await createWorker('eng')
        
        // Use a global variable to track progress (avoids cloning issues)
        // We'll poll for progress updates instead of using logger callback
        let currentProgress = 0
        const progressInterval = setInterval(() => {
          if (currentProgress < 90) {
            // Simulate progress since we can't track it directly
            currentProgress += 10
            setOcrProgress(currentProgress)
          }
        }, 200)
        
        const { data } = await worker.recognize(file)
        
        clearInterval(progressInterval)
        setOcrProgress(100)
        
        await worker.terminate()

        // Set extracted text
        if (data.text && data.text.trim()) {
          setStatement(data.text.trim())
        } else {
          setStatement('')
          alert('No text could be extracted from this image. Please enter the text manually.')
        }
      } catch (error) {
        console.error('OCR Error:', error)
        setStatement('')
        alert('Failed to extract text from image. Please enter the text manually.')
      } finally {
        setIsProcessingImage(false)
        setOcrProgress(0)
      }
    }
  }

  // Handle website URL processing
  const handleWebsiteSubmit = async () => {
    if (!websiteUrl.trim()) return

    setIsProcessingWebsite(true)
    setSourceType('website')

    try {
      // Extract text from website
      const response = await fetch(`/api/extract-website-text?url=${encodeURIComponent(websiteUrl)}`)
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type') || ''
      let data: any
      
      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        // If not JSON, it's probably an HTML error page
        const text = await response.text()
        console.error('Non-JSON response from API:', text.substring(0, 200))
        alert(`Failed to extract text from website (Server Error: ${response.status})\n\nPlease try:\n1. Copying the text from the website manually\n2. Using a different URL\n3. Using the Text tab instead`)
        setStatement('')
        return
      }
      
      if (!response.ok) {
        // Show user-friendly error message
        const errorMessage = data.error || 'Failed to extract text from website'
        alert(`${errorMessage}\n\nPlease try:\n1. Copying the text from the website manually\n2. Using a different URL\n3. Using the Text tab instead`)
        setStatement('')
        return
      }
      
      // Set the extracted text as the statement
      if (data.text) {
        setStatement(data.text)
        if (data.message) {
          // Optionally show a notification that text was truncated
          console.log(data.message)
        }
      } else {
        throw new Error('No text was extracted')
      }
    } catch (error: any) {
      console.error('Error processing website:', error)
      const errorMessage = error.message || 'Failed to process website'
      alert(`${errorMessage}\n\nPlease try:\n1. Copying the text from the website manually\n2. Using a different URL\n3. Using the Text tab instead`)
      setStatement('')
    } finally {
      setIsProcessingWebsite(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-6xl w-full mx-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Greenwash Audit</h1>
          <p className="text-gray-600 text-base sm:text-lg mb-3">Analyze environmental claims for greenwashing, greenhushing, and legitimacy</p>
          <Link href="/dashboard" className="text-sm text-green-600 hover:text-green-700 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Greenwashing Checker */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Greenwashing Checker
            </CardTitle>
            <CardDescription>
              Enter a statement or claim to check if it sounds like greenwashing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enhanced Analysis Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enhanced-analysis"
                  checked={useEnhancedAnalysis}
                  onChange={(e) => setUseEnhancedAnalysis(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="enhanced-analysis" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Enhanced Analysis (AI-Powered)
                </label>
              </div>
              <span className="text-xs text-gray-500">
                {useEnhancedAnalysis ? 'Uses advanced AI detection' : 'Auto-enabled for complex cases'}
              </span>
            </div>
            {/* Source Type Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => {
                  handleNewSearch()
                  setSourceType('text')
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  sourceType === 'text'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => {
                  handleNewSearch()
                  setSourceType('image')
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  sourceType === 'image'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => {
                  handleNewSearch()
                  setSourceType('website')
                }}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  sourceType === 'website'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Website
              </button>
            </div>

            {/* Text Input */}
            {sourceType === 'text' && (
              <div>
                <label htmlFor="statement" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter statement or claim:
                </label>
                <textarea
                  id="statement"
                  value={statement}
                  onChange={(e) => handleStatementChange(e.target.value)}
                  placeholder='e.g., "Our product is 100% eco-friendly and sustainable"'
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
                />
              </div>
            )}

            {/* Image Upload */}
            {sourceType === 'image' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload an image:
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Max file size: 5MB. Supported formats: JPG, PNG, GIF</p>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="max-w-full h-auto rounded-lg border border-gray-300" />
                    {isProcessingImage ? (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">Extracting text from image...</p>
                            {ocrProgress > 0 && (
                              <div className="mt-2">
                                <div className="w-full bg-blue-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${ocrProgress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-blue-700 mt-1">{ocrProgress}% complete</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-2 text-sm text-gray-600">
                          <strong>Text extracted:</strong> You can edit the text below if needed.
                        </p>
                        <textarea
                          value={statement}
                          onChange={(e) => handleStatementChange(e.target.value)}
                          placeholder="Text will be automatically extracted from the image..."
                          className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Website URL */}
            {sourceType === 'website' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="website-url" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter website URL:
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="website-url"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com/page"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isProcessingWebsite}
                    />
                    <Button
                      onClick={handleWebsiteSubmit}
                      disabled={!websiteUrl.trim() || isProcessingWebsite}
                      type="button"
                    >
                      {isProcessingWebsite ? 'Processing...' : 'Extract'}
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">We&apos;ll extract text from the webpage for analysis</p>
                </div>
                {statement && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extracted text (you can edit):
                    </label>
                    <textarea
                      value={statement}
                      onChange={(e) => handleStatementChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
                    />
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={checkGreenwashing}
                className="flex-1" 
                size="lg" 
                disabled={!statement.trim() || (sourceType === 'image' && !imageFile && !statement.trim()) || isAnalyzingLLM}
              >
                {isAnalyzingLLM ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Check for Greenwashing
                  </>
                )}
              </Button>
              {analysis && (
                <Button onClick={handleNewSearch} variant="outline" size="lg">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Search
                </Button>
              )}
            </div>

            {analysis && (
              <div className="mt-6 space-y-4">
                {/* Original Text with Highlights */}
                {/* Always show for website scans, or if there are flagged phrases */}
                {((analysis.flaggedPhrases && analysis.flaggedPhrases.length > 0) || (sourceType === 'website' && websiteUrl && statement)) ? (
                  <Card className="bg-white border-gray-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5 text-gray-600" />
                        Original Text Analysis
                      </CardTitle>
                      <CardDescription>
                        {sourceType === 'website' && websiteUrl ? (
                          <>Analyzed text from: <strong>{websiteUrl}</strong></>
                        ) : analysis.flaggedPhrases && analysis.flaggedPhrases.length > 0 ? (
                          'Flagged phrases are highlighted below. Hover over highlights for details.'
                        ) : (
                          'Original text from source.'
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* URL Display (for website scans) - Always show prominently */}
                      {sourceType === 'website' && websiteUrl && (
                        <div className="pb-4 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-1">Source URL:</p>
                          <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-blue-600 hover:text-blue-800 hover:underline break-all font-medium"
                          >
                            {websiteUrl}
                          </a>
                        </div>
                      )}
                      
                      {/* Highlighted Text */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                          {highlightFlaggedPhrases(statement, analysis.flaggedPhrases || [])}
                        </div>
                      </div>
                      
                      {/* Legend - show if there are flagged phrases */}
                      {analysis.flaggedPhrases && analysis.flaggedPhrases.length > 0 && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-red-200 rounded"></span>
                            <span className="text-gray-700">High Risk</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-yellow-200 rounded"></span>
                            <span className="text-gray-700">Medium Risk</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : null}
                
                {/* Trust Score Card */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-600" />
                      Trust Score Analysis
                    </CardTitle>
                    <CardDescription>
                      Overall Score: <span className={`font-bold text-lg ${analysis.trustScore.overallScore >= 75 ? 'text-green-600' : analysis.trustScore.overallScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {analysis.trustScore.overallScore}/100
                      </span>
                      {analysis.detectionMethod && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({analysis.detectionMethod === 'llm' ? 'AI-Powered' : analysis.detectionMethod === 'hybrid' ? 'Hybrid Analysis' : 'Rule-Based'})
                        </span>
                      )}
                      {analysis.classification && (
                        <span className="ml-2 text-xs font-medium text-gray-700">
                          Classification: {analysis.classification}
                          {analysis.techniqueId && ` (${analysis.techniqueId})`}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Claim Validity (40%)</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${analysis.trustScore.claimValidity >= 75 ? 'bg-green-500' : analysis.trustScore.claimValidity >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${analysis.trustScore.claimValidity}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{analysis.trustScore.claimValidity}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Documentation Quality (30%)</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${analysis.trustScore.documentationQuality >= 75 ? 'bg-green-500' : analysis.trustScore.documentationQuality >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${analysis.trustScore.documentationQuality}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{analysis.trustScore.documentationQuality}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Consistency Score (30%)</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${analysis.trustScore.consistencyScore >= 75 ? 'bg-green-500' : analysis.trustScore.consistencyScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${analysis.trustScore.consistencyScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{analysis.trustScore.consistencyScore}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Main Analysis Card */}
                <Card className={analysis.isGreenwashing ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {analysis.isGreenwashing ? (
                        <>
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="text-red-800">
                            {analysis.riskLevel === 'high' ? 'HIGH RISK: ' : analysis.riskLevel === 'medium' ? 'MEDIUM RISK: ' : ''}
                            Potential Greenwashing Detected
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-green-800">Looks Authentic</span>
                        </>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Confidence: {analysis.confidence}% | Risk Level: <span className={`font-semibold ${analysis.riskLevel === 'high' ? 'text-red-600' : analysis.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {analysis.riskLevel.toUpperCase()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Claim Analysis */}
                    {analysis.claimsAnalysis.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Claim Analysis</h4>
                        {analysis.claimsAnalysis.map((claim, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Category:</span>
                              <span className="text-sm font-medium text-gray-900">{claim.category}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Annotation Types:</span>
                              <div className="flex flex-wrap gap-1">
                                {claim.annotationTypes.map((type, i) => (
                                  <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Improvement Areas by Priority */}
                    {(analysis.improvementAreas.highPriority.length > 0 || 
                      analysis.improvementAreas.mediumPriority.length > 0 || 
                      analysis.improvementAreas.lowPriority.length > 0) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Improvement Areas</h4>
                        
                        {analysis.improvementAreas.highPriority.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              High Priority
                            </h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                              {analysis.improvementAreas.highPriority.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysis.improvementAreas.mediumPriority.length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              Medium Priority
                            </h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                              {analysis.improvementAreas.mediumPriority.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysis.improvementAreas.lowPriority.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                              <Info className="w-4 h-4" />
                              Low Priority
                            </h5>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                              {analysis.improvementAreas.lowPriority.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Red Flags */}
                    {analysis.redFlags.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Red Flags:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {analysis.redFlags.map((flag, index) => (
                            <li key={index}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {analysis.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-600" />
                          Suggestions:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {analysis.suggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.redFlags.length === 0 && (
                      <div className="text-sm text-green-700">
                        <p className="font-semibold mb-2">✅ Good signs:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>No vague or meaningless terms detected</li>
                          <li>Claims appear to be specific and verifiable</li>
                          <li>No obvious red flags found</li>
                        </ul>
                      </div>
                    )}

                    {/* Feedback Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="ai-wrong"
                          checked={showFeedback}
                          onChange={(e) => setShowFeedback(e.target.checked)}
                          className="mt-1"
                        />
                        <label htmlFor="ai-wrong" className="text-sm text-gray-700 cursor-pointer flex-1">
                          <strong>AI, you are wrong</strong> - Help us improve by providing feedback
                        </label>
                      </div>
                      
                      {showFeedback && (
                        <div className="mt-4 space-y-3">
                          <div>
                            <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700 mb-2">
                              What should the correct analysis be?
                            </label>
                            <textarea
                              id="feedback-comment"
                              value={feedbackComment}
                              onChange={(e) => setFeedbackComment(e.target.value)}
                              placeholder="e.g., This should have been flagged as greenwashing because..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[80px] text-sm"
                            />
                          </div>
                          <Button
                            onClick={async () => {
                              if (!analysis) return
                              try {
                                await submitFeedback.mutateAsync({
                                  statement,
                                  wasGreenwashing: !analysis.isGreenwashing, // User thinks opposite of what AI said
                                  aiPrediction: analysis.isGreenwashing,
                                  userComment: feedbackComment || undefined,
                                })
                                setFeedbackSubmitted(true)
                                setTimeout(() => {
                                  setShowFeedback(false)
                                  setFeedbackComment('')
                                  setFeedbackSubmitted(false)
                                }, 3000)
                              } catch (error) {
                                console.error('Error submitting feedback:', error)
                              }
                            }}
                            variant="outline"
                            size="sm"
                            disabled={submitFeedback.isLoading || feedbackSubmitted}
                          >
                            {feedbackSubmitted ? '✓ Feedback Submitted' : 'Submit Feedback'}
                          </Button>
                          {feedbackSubmitted && (
                            <p className="text-sm text-green-600">
                              Thank you! Your feedback helps us improve the checker.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">About the Greenwashing Checker</h3>
                <p className="text-sm text-gray-700 mb-2">
                  This tool analyzes statements for common greenwashing indicators based on the Seven Sins of Greenwashing:
                </p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 mb-2">
                  <li>Hidden Trade-off</li>
                  <li>No Proof</li>
                  <li>Vagueness</li>
                  <li>Worshipping False Labels</li>
                  <li>Irrelevance</li>
                  <li>Lesser of Two Evils</li>
                  <li>Fibbing</li>
                </ul>
                <p className="text-xs text-gray-600">
                  This is an educational tool and should not be used as the sole basis for making business decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

