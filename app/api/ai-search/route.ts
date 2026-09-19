import { NextResponse } from 'next/server'

function classify(query: string) {
  const q = query.toLowerCase()
  if (/restaurant|food|cafe|dining|meal|dinner|lunch/.test(q)) return 'Food & Restaurants'
  if (/flight|hotel|travel|tour|holiday|trip|stay|airport|cab|taxi|restaurant booking|appointment|reserve|reservation|ticket|booking/.test(q)) return 'Bookings'
  if (/ship|shipping|courier|parcel|logistics|freight|delivery|pickup|tracking/.test(q)) return 'Shipping & Logistics'
  if (/learn|learning|education|course|tutor|english|pronunciation|grammar|study|skill/.test(q)) return 'Learning'
  if (/agri|agriculture|farm|farmer|crop|pest|disease|harvest|soil|weather.*crop/.test(q)) return 'Agriculture'
  if (/spiritual|prayer|meditation|scripture|mantra|temple|dharma|devotional/.test(q)) return 'Spiritual'
  if (/plot|property|real estate|house|land|rent|villa|apartment/.test(q)) return 'Real Estate'
  if (/repair|service|plumb|electric|clean|salon|ac|maintenance/.test(q)) return 'Local Services'
  if (/local store|near me|kirana|grocery|pharmacy|bakery|clothing|fashion|electronics|mobile shop|furniture|hardware|jewellery|jewelry|gift shop|flower shop|pet shop/.test(q)) return 'Local Stores'
  if (/shop|store|product|buy|price|laptop|phone|computer/.test(q)) return 'Shopping'
  if (/ai|software|digital|tool|app|website/.test(q)) return 'AI & Digital Services'
  return 'GBK AI Marketplace'
}

function buildPlan(query: string, category: string) {
  const q = query.toLowerCase()
  const action = /\b(book|reserve|buy|purchase|rent|hire|sell|find|need|looking|send|ship|learn|diagnose|plan)\b/.test(q) ? 'Find, prepare and connect the right service' : 'Understand and organize your request'
  const needsConfirmation = /\b(book|reserve|buy|purchase|pay|rent|hire)\b/.test(q)
  const steps = ['Understand your request', 'Route it to the relevant GBK AI tool', 'Search approved marketplace providers or connected live APIs when available', 'Compare available options and explain what is included', needsConfirmation ? 'Ask you to confirm before any booking or payment' : 'Show matching options and next steps']
  const missing: string[] = []
  if (/book|reserve|dinner|restaurant|hotel/.test(q) && !/\b\d+\b/.test(q)) missing.push('date/time or party size, if relevant')
  if (/under|budget|price/.test(q) && !/[₹$€£]\s?\d|\b\d+[kKlLmM]?\b/.test(q)) missing.push('budget')
  if (/travel|trip|hotel|flight/.test(q) && !/\b(to|from|hyderabad|delhi|dubai|london|singapore)\b/.test(q)) missing.push('origin and destination')
  return { action, category, steps, missing, needsConfirmation }
}

function fallbackAnswer(query: string, language: string, category: string) {
  const languageNote = language === 'en-US' ? '' : ` in ${language}`
  return `GBK AI Marketplace is ready to help${languageNote}. Your request is best matched with ${category}. Browse the marketplace results below for approved listings.`
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const query = String(body?.query || '').trim()
    const language = String(body?.language || 'en-US').trim() || 'en-US'
    if (!query) return NextResponse.json({ error: 'Please enter a marketplace search.' }, { status: 400 })

    const category = classify(query)
    const plan = buildPlan(query, category)
    const endpoint = String(process.env.GBK_AI_API_URL || '').trim()
    const apiKey = process.env.GBK_AI_API_KEY
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
            return NextResponse.json({ answer, plan, category })
          }
        }
      } catch {} finally { clearTimeout(timeout) }
    }

    return NextResponse.json({ answer: fallbackAnswer(query, language, category), plan, category, fallback: true })
  } catch {
    return NextResponse.json({ error: 'GBK AI Marketplace search could not be processed.' }, { status: 502 })
  }
}
