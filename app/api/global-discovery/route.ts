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

function openStreetMapResults(data: any, query: string): DiscoveryResult[] {
  // Nominatim /search returns a top-level array of place objects (not an
  // Overpass-style { elements: [] } response).
  const places = Array.isArray(data) ? data : []
  return places.map((p: any) => {
    const addressParts = p?.address || {}
    const title = String(p?.name || p?.display_name?.split(',')?.[0] || 'Place').trim()
    const address = String(p?.display_name || [
      addressParts?.house_number,
      addressParts?.road,
      addressParts?.city || addressParts?.town || addressParts?.village,
      addressParts?.state,
      addressParts?.country
    ].filter(Boolean).join(', ') || '').trim()
    const lat = String(p?.lat || '').trim()
    const lon = String(p?.lon || '').trim()
    const url = lat && lon
      ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat)}&mlon=${encodeURIComponent(lon)}#map=18/${encodeURIComponent(lat)}/${encodeURIComponent(lon)}`
      : ''
    return {
      id: `osm:${String(p?.osm_type || 'place')}:${String(p?.osm_id || `${title}|${address}`)}`,
      title,
      text: address || `Discovered through OpenStreetMap for “${query}”.`,
      category: inferCategory(query),
      city: String(addressParts?.city || addressParts?.town || addressParts?.village || '').trim() || undefined,
      country: String(addressParts?.country || '').trim() || undefined,
      address,
      url: url || undefined,
      source: 'openstreetmap',
      sourceLabel: 'OpenStreetMap',
      external: true,
      claimable: true
    }
  })
}

function extractLocation(query: string, explicitLocation: string) {
  if (explicitLocation) return explicitLocation.trim()
  const match = query.match(/\b(?:in|near|at)\s+(.+)$/i)
  if (match) return match[1].trim()

  // Also support natural searches such as “travel agency Hyderabad” where
  // the location is appended without the word “in”.
  const termPatterns = [
    /travel agency|tour operator|tourism/i,
    /hotel|resort|hostel|lodging|stay/i,
    /restaurant|food|dining|meal|dinner/i,
    /cafe|coffee/i,
    /bakery/i,
    /courier|shipping|parcel|logistics|freight|delivery/i,
    /pharmacy/i,
    /grocery|supermarket|kirana/i,
    /clothing|fashion/i,
    /electronics/i,
    /jewelry|jewellery/i,
    /real estate|property|estate agent/i,
    /salon|beauty/i,
    /car repair|auto repair|mechanic/i
  ]
  for (const pattern of termPatterns) {
    const location = query.replace(pattern, '').replace(/\s+/g, ' ').trim()
    if (location && location.toLowerCase() !== query.toLowerCase()) return location
  }
  return ''
}

function discoveryTerm(query: string) {
  const q = query.toLowerCase()
  if (/travel agency|tour operator|tourism/.test(q)) return 'travel agency'
  if (/hotel|resort|hostel|lodging|stay/.test(q)) return 'hotel'
  if (/restaurant|food|dining|meal|dinner/.test(q)) return 'restaurant'
  if (/cafe|coffee/.test(q)) return 'cafe'
  if (/bakery/.test(q)) return 'bakery'
  if (/courier|shipping|parcel|logistics|freight|delivery/.test(q)) return 'courier'
  if (/pharmacy/.test(q)) return 'pharmacy'
  if (/grocery|supermarket|kirana/.test(q)) return 'supermarket'
  if (/clothing|fashion/.test(q)) return 'clothing store'
  if (/electronics/.test(q)) return 'electronics store'
  if (/jewelry|jewellery/.test(q)) return 'jewelry store'
  if (/real estate|property|estate agent/.test(q)) return 'real estate agent'
  if (/salon|beauty/.test(q)) return 'beauty salon'
  if (/car repair|auto repair|mechanic/.test(q)) return 'car repair'
  return query
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
    const providerErrors: string[] = []

    // OpenStreetMap/Nominatim live discovery fallback.
    // Search by business category + requested location so unrelated city/place
    // names are not returned as businesses.
    try {
      const osmLocation = extractLocation(query, location)
      const term = discoveryTerm(query)
      const searchText = osmLocation ? `${term} ${osmLocation}` : term
      const params = new URLSearchParams({
        q: searchText,
        format: 'jsonv2',
        addressdetails: '1',
        limit: '10',
        'accept-language': String(body?.language || 'en').split('-')[0]
      })
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: {
          'User-Agent': 'GBK-AI-Marketplace/1.3 (+https://market.gbkai.com; contact: info@gbkai.com)',
          'Accept': 'application/json'
        },
        cache: 'no-store'
      })
      const data = await response.json().catch(() => [])
      if (response.ok) {
        const osmRows = openStreetMapResults(data, query)
        if (osmRows.length) {
          providers.push('openstreetmap')
          results.push(...osmRows)
        } else {
          providerErrors.push('OpenStreetMap: no matching global places found')
        }
      } else {
        providerErrors.push(`OpenStreetMap ${response.status}: global fallback request failed`)
      }
    } catch (error) {
      providerErrors.push(`OpenStreetMap: ${error instanceof Error ? error.message : 'request failed'}`)
    }

    if (googleKey) {
      providers.push('google_places')
      try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
          },
          body: JSON.stringify({
            textQuery: searchText,
            maxResultCount: 10,
            languageCode: String(body?.language || 'en')
          }),
          cache: 'no-store'
        })
        const data = await response.json().catch(() => ({}))
        if (response.ok) results.push(...googleResults(data, query))
        else providerErrors.push(`Google Places ${response.status}: ${String(data?.error?.message || data?.error?.status || 'request failed')}`)
      } catch (error) {
        providerErrors.push(`Google Places: ${error instanceof Error ? error.message : 'request failed'}`)
      }
    }

    if (yelpKey) {
      providers.push('yelp_places')
      try {
        const params = new URLSearchParams({ term: query, location: location || query, limit: '10' })
        const response = await fetch(`https://api.yelp.com/v3/businesses/search?${params.toString()}`, {
          headers: { Authorization: `Bearer ${yelpKey}` },
          cache: 'no-store'
        })
        const data = await response.json().catch(() => ({}))
        if (response.ok) results.push(...yelpResults(data, query))
        else providerErrors.push(`Yelp ${response.status}: ${String(data?.error?.description || data?.error?.code || 'request failed')}`)
      } catch (error) {
        providerErrors.push(`Yelp: ${error instanceof Error ? error.message : 'request failed'}`)
      }
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
      providerErrors,
      message: unique.length
        ? `Found ${unique.length} external global marketplace options.`
        : 'No global matches were returned. Try a business type plus city/country, for example “courier Singapore” or “travel agency Hyderabad”.'
    })
  } catch {
    return NextResponse.json({ error: 'Global marketplace discovery failed.' }, { status: 502 })
  }
}
