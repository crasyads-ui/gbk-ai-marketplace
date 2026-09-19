import { NextResponse } from 'next/server'

type DiscoveryResult = {
  id: string
  title: string
  text: string
  category: string
  city?: string
  country?: string
  address?: string
  phone?: string
  website?: string
  url?: string
  image_url?: string
  rating?: number
  review_count?: number
  source: string
  sourceLabel: string
  external: true
  claimable: boolean
}

function inferCategory(query: string) {
  const q = query.toLowerCase()
  if (/restaurant|food|cafe|dining|meal|dinner|bakery/.test(q)) return 'Food'
  if (/hotel|travel|tour|holiday|flight|airport|stay/.test(q)) return 'Travel'
  if (/repair|service|plumb|electric|clean|salon|ac|maintenance/.test(q)) return 'Services'
  if (/grocery|kirana|pharmacy|clothing|fashion|electronics|furniture|jewellery|jewelry|store|shop/.test(q)) return 'Stores'
  if (/shipping|courier|parcel|logistics|freight|delivery/.test(q)) return 'Shipping'
  if (/plot|property|real estate|house|land|rent|villa|apartment/.test(q)) return 'Property'
  return 'Marketplace'
}

function googleResults(data: any, query: string): DiscoveryResult[] {
  return Array.isArray(data?.places) ? data.places.map((p: any) => {
    const title = String(p?.displayName?.text || 'Business').trim()
    const address = String(p?.formattedAddress || '').trim()
    const phone = String(p?.nationalPhoneNumber || p?.internationalPhoneNumber || '').trim()
    const website = String(p?.websiteUri || '').trim()
    const url = String(p?.googleMapsUri || '').trim()
    const rating = typeof p?.rating === 'number' ? p.rating : undefined
    const reviewCount = typeof p?.userRatingCount === 'number' ? p.userRatingCount : undefined
    const id = String(p?.id || p?.name || title)
    return {
      id: `google:${id}`,
      title,
      text: address || `Discovered through Google Places for “${query}”.`,
      category: inferCategory(query),
      address,
      phone: phone || undefined,
      website: website || undefined,
      url: url || undefined,
      rating,
      review_count: reviewCount,
      source: 'google_places',
      sourceLabel: 'Google Places',
      external: true,
      claimable: true
    }
  }) : []
}

function yelpResults(data: any, query: string): DiscoveryResult[] {
  return Array.isArray(data?.businesses) ? data.businesses.map((b: any) => {
    const title = String(b?.name || 'Business').trim()
    const loc = b?.location || {}
    const address = [loc?.address1, loc?.city, loc?.state, loc?.zip_code].filter(Boolean).join(', ')
    return {
      id: `yelp:${String(b?.id || title)}`,
      title,
      text: address || `Discovered through Yelp for “${query}”.`,
      category: inferCategory(query),
      city: String(loc?.city || '').trim() || undefined,
      country: String(loc?.country || '').trim() || undefined,
      address,
      phone: String(b?.display_phone || b?.phone || '').trim() || undefined,
      url: String(b?.url || '').trim() || undefined,
      image_url: String(b?.image_url || '').trim() || undefined,
      rating: typeof b?.rating === 'number' ? b.rating : undefined,
      review_count: typeof b?.review_count === 'number' ? b.review_count : undefined,
      source: 'yelp_places',
      sourceLabel: 'Yelp Places',
      external: true,
      claimable: true
    }
  }) : []
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const query = String(body?.query || '').trim()
    if (!query) return NextResponse.json({ error: 'Please enter what you need.' }, { status: 400 })

    const location = String(body?.location || '').trim()
    const searchText = location && !query.toLowerCase().includes(location.toLowerCase())
      ? `${query} near ${location}`
      : query

    const googleKey = String(process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '').trim()
    const yelpKey = String(process.env.YELP_API_KEY || '').trim()
    const results: DiscoveryResult[] = []
    const providers: string[] = []

    if (googleKey) {
      providers.push('google_places')
      try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount'
          },
          body: JSON.stringify({
            textQuery: searchText,
            maxResultCount: 10,
            languageCode: String(body?.language || 'en')
          }),
          cache: 'no-store'
        })
        if (response.ok) results.push(...googleResults(await response.json(), query))
      } catch {}
    }

    if (yelpKey) {
      providers.push('yelp_places')
      try {
        const params = new URLSearchParams({ term: query, location: location || query, limit: '10' })
        const response = await fetch(`https://api.yelp.com/v3/businesses/search?${params.toString()}`, {
          headers: { Authorization: `Bearer ${yelpKey}` },
          cache: 'no-store'
        })
        if (response.ok) results.push(...yelpResults(await response.json(), query))
      } catch {}
    }

    const unique = Array.from(new Map(results.map(r => [
      `${r.title.toLowerCase()}|${(r.address || '').toLowerCase()}`,
      r
    ])).values())

    return NextResponse.json({
      query,
      searchText,
      category: inferCategory(query),
      providers,
      configured: providers.length > 0,
      results: unique.slice(0, 20),
      message: providers.length
        ? (unique.length ? `Found ${unique.length} external marketplace options.` : 'The connected discovery providers returned no matching businesses.')
        : 'No global discovery provider is configured yet. Add GOOGLE_PLACES_API_KEY or YELP_API_KEY in Vercel to enable real external business discovery.'
    })
  } catch {
    return NextResponse.json({ error: 'Global marketplace discovery failed.' }, { status: 502 })
  }
}
