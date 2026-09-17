import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const query = String(body?.query || '').trim()

    if (!query) {
      return NextResponse.json({ error: 'Please enter a marketplace search.' }, { status: 400 })
    }

    const endpoint = process.env.GBK_AI_API_URL || 'https://ask.gbkai.com/api/marketplace'
    const apiKey = process.env.GBK_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'GBK AI API key is not configured.' }, { status: 503 })
    }

    const form = new FormData()
    form.append(
      'message',
      `You are the AI assistant for GBK AI Marketplace. Help the user discover marketplace categories and explain what they should search for. User request: ${query}`,
    )
    form.append('language', 'en-US')

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || 'GBK AI service returned an error.' },
        { status: response.status },
      )
    }

    return NextResponse.json({
      answer: String(data?.answer || data?.message || data?.response || 'GBK AI processed your marketplace request.'),
    })
  } catch {
    return NextResponse.json({ error: 'GBK AI Marketplace search could not be processed.' }, { status: 500 })
  }
}
