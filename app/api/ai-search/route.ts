import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const query = String(body?.query || '').trim()
    const language = String(body?.language || 'en-US').trim() || 'en-US'
    if (!query) return NextResponse.json({ error: 'Please enter a marketplace search.' }, { status: 400 })

    // Use the configured production API first. If it is not configured on this
    // project, connect directly to the live GBK ASK server endpoint.
    const endpoint = process.env.GBK_AI_API_URL || 'https://ask.gbkai.com/api/ask'
    const apiKey = process.env.GBK_AI_API_KEY

    const form = new FormData()
    form.append('message', `You are helping users search GBK AI Marketplace. User request: ${query}. Give a concise helpful marketplace-oriented response. Reply in the selected language (${language}). Do not invent specific businesses, prices, availability, or ratings.`)
    form.append('language', language)

    const headers:HeadersInit={}
    if(apiKey) headers.Authorization=`Bearer ${apiKey}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)
    let response: Response
    try {
      response = await fetch(endpoint, { method:'POST', headers, body:form, cache:'no-store', signal:controller.signal })
    } finally {
      clearTimeout(timeout)
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok) return NextResponse.json({ error: data?.error || `GBK AI service returned HTTP ${response.status}.` }, { status: 502 })

    const answer = String(data?.answer || data?.message || data?.response || '').trim()
    if (!answer) return NextResponse.json({ error: 'GBK AI returned an empty response.' }, { status: 502 })

    // Never show the setup placeholder as if it were an AI answer.
    if (/add GBK_AI_API_URL|interface is ready|connect your live AI engine/i.test(answer)) {
      return NextResponse.json({ error: 'GBK AI is not connected to its live engine yet.' }, { status: 503 })
    }

    return NextResponse.json({ answer })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error && error.name === 'AbortError' ? 'GBK AI request timed out. Please try again.' : 'GBK AI Marketplace search could not be processed.' }, { status: 502 })
  }
}
