import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const query = String(body?.query || '').trim()
    if (!query) return NextResponse.json({ error: 'Please enter a marketplace search.' }, { status: 400 })

    const endpoint = process.env.GBK_AI_API_URL
    const apiKey = process.env.GBK_AI_API_KEY
    if (!endpoint || !apiKey) {
      return NextResponse.json({ error: 'GBK AI API is not configured yet.' }, { status: 503 })
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `You are helping users search GBK AI Marketplace. User request: ${query}`, language: 'en-US' }),
      cache: 'no-store',
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) return NextResponse.json({ error: data?.error || 'GBK AI service returned an error.' }, { status: response.status })
    return NextResponse.json({ answer: String(data?.answer || data?.message || data?.response || 'GBK AI processed your marketplace request.') })
  } catch {
    return NextResponse.json({ error: 'GBK AI Marketplace search could not be processed.' }, { status: 500 })
  }
}
