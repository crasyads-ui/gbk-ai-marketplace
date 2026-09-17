const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yjwgnapymqetxvksqacd.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Y3n5bVO3xveBnyt4LKbCPg_f5ilMSuz'

export async function supabaseRequest(path: string, options: RequestInit = {}, token?: string) {
  const headers = new Headers(options.headers)
  headers.set('apikey', SUPABASE_KEY)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${SUPABASE_URL}${path}`, { ...options, headers })
}

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.message || data?.error_description || data?.msg || 'Request failed')
  return data
}

export async function submitListingRequest(data: {business_name: string; category: string; city_country: string; contact: string; user_id?: string | null}) {
  const response = await supabaseRequest('/rest/v1/marketplace_listing_requests', {method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(data)})
  if (!response.ok) throw new Error('Unable to submit listing request')
}

export async function signIn(email: string, password: string) {
  const response = await supabaseRequest('/auth/v1/token?grant_type=password', {method:'POST',body:JSON.stringify({email,password})})
  return readJson(response)
}

export async function signUp(email: string, password: string) {
  const response = await supabaseRequest('/auth/v1/signup', {method:'POST',body:JSON.stringify({email,password})})
  return readJson(response)
}

export async function getApprovedListings() {
  const response = await supabaseRequest('/rest/v1/marketplace_listings?select=*,marketplace_categories(name,icon)&status=eq.approved&order=created_at.desc')
  return readJson(response)
}

export async function getListing(id: string) {
  const response = await supabaseRequest(`/rest/v1/marketplace_listings?select=*,marketplace_categories(name,icon)&id=eq.${encodeURIComponent(id)}&limit=1`)
  const data = await readJson(response)
  return data[0] || null
}

export async function getMyListings(token: string) {
  const response = await supabaseRequest('/rest/v1/marketplace_listings?select=*&order=created_at.desc', {headers:{Prefer:'return=representation'}}, token)
  return readJson(response)
}

export async function getMyListingRequests(token: string) {
  const response = await supabaseRequest('/rest/v1/marketplace_listing_requests?select=*&order=created_at.desc', {}, token)
  return readJson(response)
}

export async function getMyEnquiries(token: string) {
  const response = await supabaseRequest('/rest/v1/marketplace_enquiries?select=*&order=created_at.desc', {}, token)
  return readJson(response)
}

export async function getMyOrders(token: string) {
  const response = await supabaseRequest('/rest/v1/marketplace_orders?select=*&order=created_at.desc', {}, token)
  return readJson(response)
}

export async function getListingReviews(listingId: string) {
  const response = await supabaseRequest(`/rest/v1/marketplace_reviews?select=*&listing_id=eq.${encodeURIComponent(listingId)}&order=created_at.desc`)
  return readJson(response)
}

export async function submitEnquiry(data: {listing_id:string;user_id?:string|null;name:string;contact:string;message:string}, token?: string) {
  const response = await supabaseRequest('/rest/v1/marketplace_enquiries', {method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(data)}, token)
  if (!response.ok) throw new Error('Unable to send enquiry')
}

export async function addFavorite(listingId: string, userId: string, token: string) {
  const response = await supabaseRequest('/rest/v1/marketplace_favorites', {method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({listing_id:listingId,user_id:userId})}, token)
  if (!response.ok && response.status !== 409) throw new Error('Unable to save favorite')
}

export async function removeFavorite(listingId: string, userId: string, token: string) {
  const response = await supabaseRequest(`/rest/v1/marketplace_favorites?listing_id=eq.${encodeURIComponent(listingId)}&user_id=eq.${encodeURIComponent(userId)}`, {method:'DELETE'}, token)
  if (!response.ok) throw new Error('Unable to remove favorite')
}

export function tokenUserId(token: string) {
  try { const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); return payload.sub || null } catch { return null }
}
