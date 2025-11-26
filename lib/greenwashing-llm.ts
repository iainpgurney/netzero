/**
 * LLM-powered greenwashing detection utility
 * Uses OpenAI API to analyze environmental claims with advanced taxonomy
 */

import OpenAI from 'openai'

// Taxonomy definitions matching Python script
export const GREENWASHING_TECHNIQUES = [
  'GW_VAGUE_PROMISE',    // Vague, unsubstantiated environmental promises
  'GW_FALSE_LABEL',      // Misleading certifications or labels
  'GW_HIDDEN_TRADEOFF',  // Highlighting one green aspect while ignoring others
  'GW_FLUFF',            // Meaningless or irrelevant environmental claims
] as const

export const GREENHUSHING_TECHNIQUES = [
  'GH_SELECTIVE_SILENCE',  // Deliberately omitting negative environmental data
  'GH_GOAL_RETRACTION',    // Quietly removing or reducing sustainability goals
  'GH_DATA_MASKING',       // Hiding or obscuring environmental impact data
] as const

export const GREENWISHING_TECHNIQUES = [
  'GW_NO_PATHWAY',  // Aspirational goals without clear implementation plan
] as const

export const LEGITIMATE_TECHNIQUES = [
  'LEGIT_SCIENCE_BASED',        // Claims backed by scientific evidence
  'LEGIT_THIRD_PARTY_VERIFIED', // Claims verified by independent third parties
] as const

export type Classification = 'Greenwashing' | 'Greenhushing' | 'Greenwishing' | 'Legitimate'
export type TechniqueId = 
  | typeof GREENWASHING_TECHNIQUES[number]
  | typeof GREENHUSHING_TECHNIQUES[number]
  | typeof GREENWISHING_TECHNIQUES[number]
  | typeof LEGITIMATE_TECHNIQUES[number]

export interface FlaggedPhrase {
  text: string
  riskLevel: 'high' | 'medium' | 'low'
}

export interface LLMAnalysisResult {
  classification: Classification
  techniqueId: TechniqueId
  severityScore: number // 0.0 to 1.0
  explanation: string
  confidence: number // 0-100
  redFlags: string[]
  suggestions: string[]
  flaggedPhrases?: FlaggedPhrase[]
}

const SYSTEM_PROMPT = `You are a Forensic ESG Auditor with 20+ years of experience detecting corporate greenwashing, greenhushing, greenwishing, and legitimate sustainability claims.

Analyze the given environmental claim and classify it according to this taxonomy:

GREENWASHING Techniques:
- GW_VAGUE_PROMISE: Vague, unsubstantiated environmental promises without proof
- GW_FALSE_LABEL: Misleading certifications, labels, or third-party endorsements
- GW_HIDDEN_TRADEOFF: Highlighting one green aspect while ignoring negative impacts
- GW_FLUFF: Meaningless or irrelevant environmental claims

GREENHUSHING Techniques:
- GH_SELECTIVE_SILENCE: Deliberately omitting negative environmental data or impacts
- GH_GOAL_RETRACTION: Quietly removing or reducing previously stated sustainability goals
- GH_DATA_MASKING: Hiding or obscuring environmental impact data (e.g., Scope 3 emissions)

GREENWISHING Techniques:
- GW_NO_PATHWAY: Aspirational goals without clear implementation plan or timeline

LEGITIMATE Techniques:
- LEGIT_SCIENCE_BASED: Claims backed by peer-reviewed scientific evidence
- LEGIT_THIRD_PARTY_VERIFIED: Claims verified by independent third-party auditors

Return your analysis in JSON format with:
- classification: One of "Greenwashing", "Greenhushing", "Greenwishing", or "Legitimate"
- techniqueId: The specific technique identifier
- severityScore: 0.0 (low) to 1.0 (high) - how problematic/credible the claim is
- explanation: Detailed chain of thought reasoning
- confidence: 0-100 confidence in your analysis
- redFlags: Array of specific issues found (empty if legitimate)
- suggestions: Array of improvement suggestions (empty if legitimate)
- flaggedPhrases: Array of specific quoted text/phrases from the statement that demonstrate the issues. Each phrase should include:
  - text: The exact quoted text from the statement (preserve original capitalization and punctuation)
  - riskLevel: "high", "medium", or "low" based on severity
  Only include phrases that are problematic (not legitimate claims). Use exact quotes from the statement.

Be nuanced - real greenwashing is subtle and sophisticated. Look for:
- Vague terms without proof
- Missing context or data
- Aspirational goals without pathways
- Selective disclosure
- Third-party verification and scientific backing for legitimate claims`

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_STAGING
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Set OPENAI_API_KEY or OPENAI_API_KEY_STAGING environment variable.')
  }
  
  return new OpenAI({ apiKey })
}

export async function analyzeWithLLM(
  statement: string,
  sourceType?: 'text' | 'image' | 'website',
  industry?: string
): Promise<LLMAnalysisResult> {
  const client = getOpenAIClient()
  
  const userPrompt = `Analyze this environmental claim:

"${statement}"

${sourceType ? `Source Type: ${sourceType}` : ''}
${industry ? `Industry: ${industry}` : ''}

Provide a detailed analysis following the taxonomy. Return ONLY valid JSON matching the required format.`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Use GPT-4 for better accuracy
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    let analysis: Partial<LLMAnalysisResult>
    try {
      analysis = JSON.parse(content)
    } catch (error) {
      // Try extracting JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{.*?\})\s*```/s)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1])
      } else {
        throw new Error(`Failed to parse JSON response: ${content.substring(0, 200)}`)
      }
    }

    // Normalize redFlags to ensure they're strings
    const normalizeRedFlags = (flags: any[]): string[] => {
      if (!Array.isArray(flags)) return []
      return flags.map(flag => {
        // If it's already a string, return it
        if (typeof flag === 'string') return flag
        // If it's an object with a text property, extract it
        if (typeof flag === 'object' && flag !== null && 'text' in flag) {
          return typeof flag.text === 'string' ? flag.text : String(flag.text || '')
        }
        // Otherwise, convert to string
        return String(flag)
      }).filter(flag => flag.trim().length > 0)
    }

    // Validate and normalize response
    const result: LLMAnalysisResult = {
      classification: (analysis.classification as Classification) || 'Legitimate',
      techniqueId: (analysis.techniqueId as TechniqueId) || 'LEGIT_SCIENCE_BASED',
      severityScore: Math.max(0, Math.min(1, analysis.severityScore || 0)),
      explanation: analysis.explanation || 'No explanation provided',
      confidence: Math.max(0, Math.min(100, analysis.confidence || 50)),
      redFlags: Array.isArray(analysis.redFlags) ? normalizeRedFlags(analysis.redFlags) : [],
      suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : [],
      flaggedPhrases: Array.isArray(analysis.flaggedPhrases) 
        ? analysis.flaggedPhrases
            .filter((fp: any) => fp && typeof fp === 'object' && fp.text && fp.riskLevel)
            .map((fp: any) => ({
              text: typeof fp.text === 'string' && fp.text.trim().length > 0 ? fp.text.trim() : '',
              riskLevel: (fp.riskLevel === 'high' || fp.riskLevel === 'medium' || fp.riskLevel === 'low') 
                ? fp.riskLevel 
                : 'medium' as 'high' | 'medium' | 'low',
            }))
            .filter((fp: any) => fp.text.length > 0) // Remove empty phrases
        : undefined,
    }

    // Validate technique matches classification
    if (result.classification === 'Greenwashing' && !result.techniqueId.startsWith('GW_')) {
      console.warn(`Mismatch: Greenwashing classification but technique ${result.techniqueId}`)
    } else if (result.classification === 'Greenhushing' && !result.techniqueId.startsWith('GH_')) {
      console.warn(`Mismatch: Greenhushing classification but technique ${result.techniqueId}`)
    } else if (result.classification === 'Greenwishing' && result.techniqueId !== 'GW_NO_PATHWAY') {
      console.warn(`Mismatch: Greenwishing classification but technique ${result.techniqueId}`)
    } else if (result.classification === 'Legitimate' && !result.techniqueId.startsWith('LEGIT_')) {
      console.warn(`Mismatch: Legitimate classification but technique ${result.techniqueId}`)
    }

    return result
  } catch (error) {
    console.error('Error in LLM analysis:', error)
    throw error
  }
}

/**
 * Determine if LLM analysis should be used based on statement characteristics
 */
export function shouldUseLLM(statement: string, ruleBasedScore?: number): boolean {
  // Use LLM for:
  // 1. Long statements (>200 chars) - more complex
  // 2. Ambiguous rule-based results (score between 60-80)
  // 3. Contains financial/technical jargon
  const length = statement.trim().length
  const hasJargon = /(?:emission|scope|carbon|footprint|sustainability|esg|stakeholder|impact|metric|baseline|target|commitment|initiative)/i.test(statement)
  
  if (length > 200) return true
  if (ruleBasedScore !== undefined && ruleBasedScore >= 60 && ruleBasedScore <= 80) return true
  if (hasJargon && length > 100) return true
  
  return false
}


