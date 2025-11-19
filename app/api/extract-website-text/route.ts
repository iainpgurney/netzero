import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    // Validate URL format
    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format. Please include http:// or https://' },
        { status: 400 }
      )
    }

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are supported' },
        { status: 400 }
      )
    }

    // Fetch the webpage with timeout and proper headers
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'follow',
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.json(
          { 
            error: `Failed to fetch website (Status: ${response.status}). The website may require authentication or block automated requests.`,
            status: response.status 
          },
          { status: response.status }
        )
      }

      // Check content type
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('text/html')) {
        return NextResponse.json(
          { error: 'URL does not point to an HTML page. Please provide a webpage URL.' },
          { status: 400 }
        )
      }

      const html = await response.text()

      if (!html || html.length === 0) {
        return NextResponse.json(
          { error: 'Website returned empty content' },
          { status: 400 }
        )
      }

      // Simple text extraction (remove HTML tags and decode entities)
      let text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '') // Remove noscript
        .replace(/<[^>]+>/g, ' ') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&[a-z]+;/gi, ' ') // Remove other HTML entities
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()

      if (!text || text.length === 0) {
        return NextResponse.json(
          { error: 'No text content found on the webpage. The page may be dynamically loaded with JavaScript.' },
          { status: 400 }
        )
      }

      // Extract first 3000 characters (reasonable limit for analysis)
      text = text.substring(0, 3000)

      return NextResponse.json({ 
        text, 
        url,
        message: text.length >= 3000 ? 'Text truncated to 3000 characters' : 'Text extracted successfully'
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. The website took too long to respond.' },
          { status: 408 }
        )
      }
      
      throw fetchError
    }
  } catch (error: any) {
    console.error('Error extracting website text:', error)
    
    // Provide more specific error messages
    if (error.message?.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'Failed to connect to the website. Please check the URL and try again, or enter the text manually.' },
        { status: 500 }
      )
    }
    
    if (error.message?.includes('CORS')) {
      return NextResponse.json(
        { error: 'Website blocked the request due to CORS policy. Please enter the text manually.' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to extract text from website. Please try entering the text manually.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
