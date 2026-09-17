import { NextResponse } from 'next/server'

function fallbackAnswer(query: string, language: string) {
  const q = query.toLowerCase()
  const category =
    /restaurant|food|cafe|dining|meal/.test(q) ? 'Food & Restaurants' :
    /hotel|travel|tour|flight|holiday|trip/.test(q) ? 'Travel & Tourism' :
    /plot|property|real estate|house|land/.test(q) ? 'Real Estate' :
    /repair|service|plumb|electric|clean|salon/.test(q) ? 'Local Services' :
    /shop|store|product|buy|price/.test(q) ? 'Shopping' :
    /ai|software|digital|tool|app/.test(q) ? 'AI & Digital Services' :
    'GBK AI Marketplace'

  const languageNote = language === 'en-US' ? '' : ` in ${language}`
  return `GBK AI Marketplace is ready to help${languageNote}. Your request is best matched with ${category}. Browse the marketplace results below for approved listings.`
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const query = String(body?.query || '').trim()
    const language = String(body?.language || 'en-US').trim() || 'en-US'
    if (!query) return NextResponse.json({ error: 'Please enter a marketplace search.' }, { status: 400 })

    const endpoint = String(process.env.GBK_AI_API_URL || '').trim()
    const apiKey = process.env.GBK_AI_API_KEY

    // ask.gbkai.com is the public GBK ASK application itself, not an upstream
    // engine. Never call it from Marketplace or the request can loop back into
    // the same application and produce a 508/server error.
    const isSelfEndpoint = /(^|:)\/\/ask\.gbkai\.com(\/|$)/i.test(endpoint)

    if (endpoint && !isSelfEndpoint) {
      const form = new FormData()
      form.append('message', `You are helping users search GBK AI Marketplace. User request: ${query}. Give a concise helpful marketplace-oriented response. Reply in the selected language (${language}). Do not invent specific businesses, prices, availability, or ratings.`)
      form.append('language', language)

      const headers: HeadersInit = {}
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)
      try {
        const response = await fetch(endpoint, { method: 'POST', headers, body: form, cache: 'no-store', signal: controller.signal })
        const data = await response.json().catch(() => ({}))
        if (response.ok) {
          const answer = String(data?.answer || data?.message || data?.response || '').trim()
          if (answer && !/add GBK_AI_API_URL|interface is ready|connect your live AI engine/i.test(answer)) {
            return NextResponse.json({ answer })
          }
        }
      } catch {
        // Use the marketplace-safe response below if the external engine is unavailable.
      } finally {
        clearTimeout(timeout)
      }
    }

    return NextResponse.json({ answer: fallbackAnswer(query, language), fallback: true })
  } catch {
    return NextResponse.json({ error: 'GBK AI Marketplace search could not be processed.' }, { status: 502 })
  }
}
