const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yjwgnapymqetxvksqacd.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Y3n5bVO3xveBnyt4LKbCPg_f5ilMSuz'

export async function supabaseRequest(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)
  headers.set('apikey', SUPABASE_KEY)
  headers.set('Content-Type', 'application/json')
  return fetch(`${SUPABASE_URL}${path}`, { ...options, headers })
}

export async function submitListingRequest(data: {business_name: string; category: string; city_country: string; contact: string; user_id?: string | null}) {
  const response = await supabaseRequest('/rest/v1/marketplace_listing_requests', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Unable to submit listing request')
}

export async function signIn(email: string, password: string) {
  const response = await supabaseRequest('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error_description || data.msg || 'Sign in failed')
  return data
}

export async function signUp(email: string, password: string) {
  const response = await supabaseRequest('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error_description || data.msg || 'Sign up failed')
  return data
}

export async function getApprovedListings() {
  const response = await supabaseRequest('/rest/v1/marketplace_listings?select=*&status=eq.approved&order=created_at.desc')
  if (!response.ok) throw new Error('Unable to load listings')
  return response.json()
}
