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

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/\brestaurants\b/g, 'restaurant')
    .replace(/\btravel agencies\b/g, 'travel agency')
    .replace(/\btravel agents\b/g, 'travel agent')
    .replace(/\btour agencies\b/g, 'tour agency')
    .replace(/\btour operators\b/g, 'tour operator')
    .replace(/\bhotels\b/g, 'hotel')
    .replace(/\bresorts\b/g, 'resort')
    .replace(/\bhostels\b/g, 'hostel')
    .replace(/\bcafes\b/g, 'cafe')
    .replace(/\bbakeries\b/g, 'bakery')
    .replace(/\bpharmacies\b/g, 'pharmacy')
    .replace(/\bgrocery stores\b/g, 'grocery')
    .replace(/\bsupermarkets\b/g, 'supermarket')
    .replace(/\bclothing stores\b/g, 'clothing store')
    .replace(/\belectronics stores\b/g, 'electronics store')
    .replace(/\bfurniture stores\b/g, 'furniture store')
    .replace(/\bjewellery stores\b/g, 'jewelry store')
    .replace(/\bjewelry stores\b/g, 'jewelry store')
    .replace(/\bbeauty salons\b/g, 'beauty salon')
    .replace(/\bcar repairs\b/g, 'car repair')
    .replace(/\bcourier services\b/g, 'courier')
    .replace(/\bshipping services\b/g, 'shipping')
    .replace(/\breal estate agents\b/g, 'real estate agent')
    .replace(/\bestate agents\b/g, 'estate agent')
    .replace(/\bplumbers\b/g, 'plumber')
    .replace(/\belectricians\b/g, 'electrician')
    .replace(/\blawyers\b/g, 'lawyer')
    .replace(/\bdoctors\b/g, 'doctor')
    .replace(/\bdentists\b/g, 'dentist')
    .replace(/\bhospitals\b/g, 'hospital')
    .replace(/\bclinics\b/g, 'clinic')
    .replace(/\bschools\b/g, 'school')
    .replace(/\buniversities\b/g, 'university')
    .replace(/\bcolleges\b/g, 'college')
    .replace(/\bgyms\b/g, 'gym')
    .replace(/\bstores\b/g, 'store')
    .replace(/\bshops\b/g, 'shop')
    .replace(/\bservices\b/g, 'service')
    .replace(/\s+/g, ' ')
    .trim()
}

function inferCategory(query: string) {
  const q = normalizeSearchText(query)
  if (/restaurant|food|cafe|dining|meal|dinner|bakery|pizza|bar/.test(q)) return 'Food'
  if (/hotel|travel|tour|holiday|flight|airport|stay|resort|hostel|lodging/.test(q)) return 'Travel'
  if (/repair|service|plumb|electric|clean|salon|ac|maintenance|mechanic|lawyer|doctor|dentist|clinic/.test(q)) return 'Services'
  if (/grocery|kirana|pharmacy|clothing|fashion|electronics|furniture|jewellery|jewelry|store|shop|supermarket|shopping/.test(q)) return 'Stores'
  if (/shipping|courier|parcel|logistics|freight|delivery/.test(q)) return 'Shipping'
  if (/plot|property|real estate|house|land|rent|villa|apartment|estate agent/.test(q)) return 'Property'
  if (/learn|learning|school|college|course|tutor|education|english/.test(q)) return 'Learning'
  return 'Marketplace'
}

function googleIncludedType(query: string) {
  const q = normalizeSearchText(query)
  if (/restaurant|food|dining|meal|dinner|pizza/.test(q)) return 'restaurant'
  if (/cafe|coffee/.test(q)) return 'cafe'
  if (/bakery/.test(q)) return 'bakery'
  if (/hotel|lodging|stay/.test(q)) return 'hotel'
  if (/resort/.test(q)) return 'resort_hotel'
  if (/hostel/.test(q)) return 'hostel'
  if (/travel agency|travel agent/.test(q)) return 'travel_agency'
  if (/tour operator|tourism|tour agency/.test(q)) return 'tour_agency'
  if (/pharmacy/.test(q)) return 'pharmacy'
  if (/grocery/.test(q)) return 'grocery_store'
  if (/supermarket/.test(q)) return 'supermarket'
  if (/kirana/.test(q)) return 'convenience_store'
  if (/clothing|fashion/.test(q)) return 'clothing_store'
  if (/electronics/.test(q)) return 'electronics_store'
  if (/furniture/.test(q)) return 'furniture_store'
  if (/jewelry|jewellery/.test(q)) return 'jewelry_store'
  if (/salon|beauty/.test(q)) return 'beauty_salon'
  if (/car repair|auto repair|mechanic/.test(q)) return 'car_repair'
  if (/courier/.test(q)) return 'courier_service'
  if (/shipping|freight/.test(q)) return 'shipping_service'
  if (/real estate|estate agent|property/.test(q)) return 'real_estate_agency'
  if (/plumb/.test(q)) return 'plumber'
  if (/electric/.test(q)) return 'electrician'
  if (/lawyer|legal/.test(q)) return 'lawyer'
  if (/doctor|physician/.test(q)) return 'doctor'
  if (/dentist/.test(q)) return 'dentist'
  if (/hospital/.test(q)) return 'hospital'
  if (/clinic/.test(q)) return 'medical_clinic'
  if (/school/.test(q)) return 'school'
  if (/university|college/.test(q)) return 'university'
  if (/gym|fitness/.test(q)) return 'gym'
  if (/pet store/.test(q)) return 'pet_store'
  return ''
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
  const businessClasses = new Set(['amenity','shop','tourism','office','craft','healthcare','leisure'])
  const places = (Array.isArray(data) ? data : []).filter((p: any) => businessClasses.has(String(p?.class || '').toLowerCase()))
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
  const termPatterns = [
    /travel agency|travel agent|tour operator|tourism|tour agency/i,
    /hotel|resort|hostel|lodging|stay/i,
    /restaurant|food|dining|meal|dinner|pizza/i,
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
    /car repair|auto repair|mechanic/i,
    /plumber|electrician|lawyer|doctor|dentist|hospital|clinic/i,
    /school|university|college/i,
    /gym|fitness/i,
    /\b(?:book|booking|reserve|reservation)\b/i
  ]
  for (const pattern of termPatterns) {
    const location = query.replace(pattern, '').replace(/\s+/g, ' ').trim()
    if (location && location.toLowerCase() !== query.toLowerCase()) return location
  }
  return ''
}

function discoveryTerm(query: string) {
  const q = normalizeSearchText(query)
  if (/hotel.*(book|booking|reserve|reservation)|\b(book|booking|reserve|reservation)\b.*hotel/.test(q)) return 'hotel'
  if (/restaurant.*(book|booking|reserve|reservation)|\b(book|booking|reserve|reservation)\b.*restaurant/.test(q)) return 'restaurant'
  if (/travel agency|travel agent|tour operator|tourism|tour agency/.test(q)) return 'travel agency'
  if (/hotel|resort|hostel|lodging|stay/.test(q)) return 'hotel'
  if (/restaurant|food|dining|meal|dinner|pizza/.test(q)) return 'restaurant'
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
  if (/plumber/.test(q)) return 'plumber'
  if (/electrician|electric/.test(q)) return 'electrician'
  if (/lawyer|legal/.test(q)) return 'lawyer'
  if (/doctor|physician/.test(q)) return 'doctor'
  if (/dentist/.test(q)) return 'dentist'
  if (/hospital/.test(q)) return 'hospital'
  if (/clinic/.test(q)) return 'clinic'
  if (/school|college|university|learning|learn/.test(q)) return 'school'
  if (/gym|fitness/.test(q)) return 'gym'
  if (/pet store/.test(q)) return 'pet store'
  if (/shopping|shop|store/.test(q)) return 'store'
  return query
}

function osmIncludeForQuery(query: string) {
  const q = normalizeSearchText(query)
  if (/hotel.*(book|booking|reserve|reservation)|\b(book|booking|reserve|reservation)\b.*hotel/.test(q)) return 'osm.tourism.hotel,osm.tourism.hostel,osm.tourism.motel,osm.tourism.guest_house,osm.tourism.resort'
  if (/restaurant.*(book|booking|reserve|reservation)|\b(book|booking|reserve|reservation)\b.*restaurant/.test(q)) return 'osm.amenity.restaurant'
  if (/travel agency|travel agent|tour operator|tourism|tour agency/.test(q)) return 'osm.office.travel_agent'
  if (/hotel|resort|hostel|lodging|stay/.test(q)) return 'osm.tourism.hotel,osm.tourism.hostel,osm.tourism.motel,osm.tourism.guest_house,osm.tourism.resort'
  if (/restaurant|food|dining|meal|dinner|pizza/.test(q)) return 'osm.amenity.restaurant'
  if (/cafe|coffee/.test(q)) return 'osm.amenity.cafe'
  if (/bakery/.test(q)) return 'osm.shop.bakery'
  if (/courier|shipping|parcel|logistics|freight|delivery/.test(q)) return 'osm.office.courier'
  if (/pharmacy/.test(q)) return 'osm.amenity.pharmacy'
  if (/grocery|supermarket|kirana/.test(q)) return 'osm.shop.supermarket'
  if (/clothing|fashion/.test(q)) return 'osm.shop.clothes'
  if (/electronics/.test(q)) return 'osm.shop.electronics'
  if (/jewelry|jewellery/.test(q)) return 'osm.shop.jewelry'
  if (/real estate|property|estate agent/.test(q)) return 'osm.office.estate_agent'
  if (/salon|beauty/.test(q)) return 'osm.shop.beauty'
  if (/car repair|auto repair|mechanic/.test(q)) return 'osm.shop.car_repair'
  return ''
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
    const rawQuery = String(body?.query || '').trim()
    const query = normalizeSearchText(rawQuery)
    if (!query) return NextResponse.json({ error: 'Please enter what you need.' }, { status: 400 })

    const location = String(body?.location || '').trim()
    const latitude = Number(body?.latitude)
    const longitude = Number(body?.longitude)
    const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
    const searchText = location && !query.toLowerCase().includes(location.toLowerCase())
      ? `${query} near ${location}`
      : query

    const googleKey = String(process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '').trim()
    const yelpKey = String(process.env.YELP_API_KEY || '').trim()
    const results: DiscoveryResult[] = []
    const providers: string[] = []
    const providerErrors: string[] = []

    // OpenStreetMap/Nominatim is a user-triggered fallback, not the primary
    // commercial directory. Keep it to one request per user search and obey
    // the public service's usage policy.
    try {
      const osmLocation = extractLocation(query, location).replace(/^\b(?:in|near|at)\b\s+/i, '').trim()
      const term = discoveryTerm(query)
      const osmSearchText = osmLocation ? term + ' ' + osmLocation : term
      const headers = {
        'User-Agent': 'GBK-AI-Marketplace/1.5 (+https://market.gbkai.com; contact: info@gbkai.com)',
        'Accept': 'application/json'
      }
      const params = new URLSearchParams({
        q: osmSearchText,
        format: 'jsonv2',
        addressdetails: '1',
        limit: '20',
        layer: 'poi',
        'accept-language': String(body?.language || 'en').split('-')[0]
      })
      const osmInclude = osmIncludeForQuery(query)
      // Category filters are strongest when the user supplied a location.
      // For broad global searches such as "Food", leave the filter off so
      // Nominatim can still return its best POI matches instead of zero rows.
      if (osmInclude && (osmLocation || location || hasCoordinates)) params.set('include', osmInclude)
      if (hasCoordinates && !osmLocation && !location) {
        const delta = 0.25
        params.set('viewbox', `${longitude-delta},${latitude+delta},${longitude+delta},${latitude-delta}`)
      }
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers,
        next: { revalidate: 300 }
      })
      const data = await response.json().catch(() => [])
      if (response.ok) {
        const osmRows = openStreetMapResults(data, query).slice(0, 10)
        if (osmRows.length) {
          providers.push('openstreetmap')
          results.push(...osmRows)
        } else {
          providerErrors.push('OpenStreetMap: no matching POIs found')
        }
      } else {
        providerErrors.push(`OpenStreetMap ${response.status}: fallback request failed`)
      }
    } catch (error) {
      providerErrors.push(`OpenStreetMap: ${error instanceof Error ? error.message : 'request failed'}`)
    }

    if (googleKey) {
      providers.push('google_places')
      try {
        const googleBody:any = {
          textQuery: searchText,
          pageSize: 20,
          languageCode: String(body?.language || 'en')
        }
        const includedType = googleIncludedType(query)
        if (includedType) googleBody.includedType = includedType
        if (hasCoordinates && !/\b(?:in|near|at)\b/i.test(query)) {
          googleBody.locationBias = {
            circle: {
              center: { latitude, longitude },
              radius: 50000
            }
          }
        }
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount'
          },
          body: JSON.stringify(googleBody),
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

    const commercialConfigured = Boolean(googleKey || yelpKey)
    const fallbackConfigured = providers.includes('openstreetmap') || providerErrors.some(x => x.startsWith('OpenStreetMap'))
    return NextResponse.json({
      query,
      searchText,
      category: inferCategory(query),
      providers,
      configured: commercialConfigured || fallbackConfigured,
      rawQuery,
      commercialConfigured,
      results: unique.slice(0, 20),
      providerErrors,
      message: unique.length
        ? `Found ${unique.length} live external marketplace options.`
        : commercialConfigured
          ? 'No live matches were returned. Try a business type plus city/country, for example “restaurants Hyderabad”, “courier Singapore”, or “travel agency Dubai”.'
          : 'Live global commercial search needs a configured business directory provider. OpenStreetMap is available as a fallback for user-triggered POI searches.',
      attribution: providers.includes('openstreetmap') ? '© OpenStreetMap contributors' : undefined
    })
  } catch {
    return NextResponse.json({ error: 'Global marketplace discovery failed.' }, { status: 502 })
  }
}
