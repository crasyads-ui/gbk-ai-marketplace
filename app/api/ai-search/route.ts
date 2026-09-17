import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const query = String(body?.query || '').trim()
    if (!query) return NextResponse.json({ error: 'Please enter a marketplace search.' }, { status: 400 })

    const endpoint = process.env.GBK_AI_API_URL
    const apiKey = process.env.GBK_AI_API_KEY
    if (!endpoint) return NextResponse.json({ error: 'GBK AI API URL is not configured yet.' }, { status: 503 })

    const form = new FormData()
    form.append('message', `You are helping users search GBK AI Marketplace. User request: ${query}. Give a concise helpful marketplace-oriented response. Do not invent specific businesses, prices, availability, or ratings.`)
    form.append('language', 'en-US')

    const headers:HeadersInit={}
    if(apiKey) headers.Authorization=`Bearer ${apiKey}`
    const response = await fetch(endpoint, { method:'POST', headers, body:form, cache:'no-store' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) return NextResponse.json({ error: data?.error || 'GBK AI service returned an error.' }, { status: response.status })
    return NextResponse.json({ answer: String(data?.answer || data?.message || data?.response || 'GBK AI processed your marketplace request.') })
  } catch {
    return NextResponse.json({ error: 'GBK AI Marketplace search could not be processed.' }, { status: 500 })
  }
}
