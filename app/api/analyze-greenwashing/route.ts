import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithLLM } from '@/lib/greenwashing-llm'

/**
 * API route for LLM-powered greenwashing analysis
 * POST /api/analyze-greenwashing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { statement, sourceType, industry } = body

    if (!statement || typeof statement !== 'string' || statement.trim().length === 0) {
      return NextResponse.json(
        { error: 'Statement is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Validate statement length (prevent abuse)
    if (statement.length > 5000) {
      return NextResponse.json(
        { error: 'Statement too long. Maximum 5000 characters.' },
        { status: 400 }
      )
    }

    // Call LLM analysis
    const analysis = await analyzeWithLLM(
      statement.trim(),
      sourceType,
      industry
    )

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('Error in analyze-greenwashing API:', error)
    
    // Don't expose internal errors to client
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Check if it's an API key error
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API configuration error. Please check server configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to analyze statement. Please try again.' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}


