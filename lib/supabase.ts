const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yjwgnapymqetxvksqacd.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Y3n5bVO3xveBnyt4LKbCPg_f5ilMSuz'
export async function supabaseRequest(path:string,options:RequestInit={},token?:string){const headers=new Headers(options.headers);headers.set('apikey',SUPABASE_KEY);headers.set('Content-Type','application/json');if(token)headers.set('Authorization',`Bearer ${token}`);return fetch(`${SUPABASE_URL}${path}`,{...options,headers})}
async function readJson(r:Response){const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.message||d?.error_description||d?.msg||'Request failed');return d}
export async function submitListingRequest(data:any){const r=await supabaseRequest('/rest/v1/marketplace_listing_requests',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(data)});if(!r.ok)throw new Error('Unable to submit listing request')}
export async function signIn(email:string,password:string){return readJson(await supabaseRequest('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})}))}
export async function signUp(email:string,password:string){return readJson(await supabaseRequest('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password})}))}
export async function getApprovedListings(){return readJson(await supabaseRequest('/rest/v1/marketplace_listings?select=*,marketplace_categories(name,icon)&status=eq.approved&order=created_at.desc'))}
export async function aiMarketplaceSearch(query:string){
  const all=await getApprovedListings()
  const q=query.trim().toLowerCase()
  if(!q)return all
  const words=q.replace(/[^a-z0-9₹$€£]+/g,' ').split(/\s+/).filter(w=>w.length>1)
  const categoryWords:any={restaurant:'Food',restaurants:'Food',food:'Food',cafe:'Food',hotel:'Travel',hotels:'Travel',travel:'Travel',tour:'Travel',tours:'Travel',plot:'Property',plots:'Property',property:'Property',house:'Property',real:'Property',repair:'Services',service:'Services',services:'Services',ac:'Services',shopping:'Shopping',shop:'Shopping',store:'Shopping',stores:'Shopping',product:'Shopping',products:'Shopping',ai:'Digital',digital:'Digital',tools:'Digital'}
  const wantedCategories=new Set(words.map(w=>categoryWords[w]).filter(Boolean))
  return all.filter((x:any)=>{
    const hay=`${x.business_name||''} ${x.title||''} ${x.description||''} ${x.city||''} ${x.country||''} ${x.marketplace_categories?.name||''}`.toLowerCase()
    const categoryMatch=wantedCategories.size===0 || wantedCategories.has(x.marketplace_categories?.name)
    const wordMatch=words.some(w=>hay.includes(w))
    return categoryMatch && (wordMatch || wantedCategories.size>0)
  }).slice(0,30)
}
export async function getListing(id:string){const d=await readJson(await supabaseRequest(`/rest/v1/marketplace_listings?select=*,marketplace_categories(name,icon)&id=eq.${encodeURIComponent(id)}&limit=1`));return d[0]||null}
export async function getMyListings(token:string){return readJson(await supabaseRequest('/rest/v1/marketplace_listings?select=*&order=created_at.desc',{headers:{Prefer:'return=representation'}},token))}
export async function getMyListingRequests(token:string){return readJson(await supabaseRequest('/rest/v1/marketplace_listing_requests?select=*&order=created_at.desc',{},token))}
export async function getMyEnquiries(token:string){return readJson(await supabaseRequest('/rest/v1/marketplace_enquiries?select=*&order=created_at.desc',{},token))}
export async function getMyOrders(token:string){return readJson(await supabaseRequest('/rest/v1/marketplace_orders?select=*&order=created_at.desc',{},token))}
export async function getListingReviews(listingId:string){return readJson(await supabaseRequest(`/rest/v1/marketplace_reviews?select=*&listing_id=eq.${encodeURIComponent(listingId)}&order=created_at.desc`))}
export async function submitEnquiry(data:any,token?:string){const r=await supabaseRequest('/rest/v1/marketplace_enquiries',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(data)},token);if(!r.ok)throw new Error('Unable to send enquiry')}
export async function addFavorite(listingId:string,userId:string,token:string){const r=await supabaseRequest('/rest/v1/marketplace_favorites',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({listing_id:listingId,user_id:userId})},token);if(!r.ok&&r.status!==409)throw new Error('Unable to save favorite')}
export async function removeFavorite(listingId:string,userId:string,token:string){const r=await supabaseRequest(`/rest/v1/marketplace_favorites?listing_id=eq.${encodeURIComponent(listingId)}&user_id=eq.${encodeURIComponent(userId)}`,{method:'DELETE'},token);if(!r.ok)throw new Error('Unable to remove favorite')}
export function tokenUserId(token:string){try{const p=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));return p.sub||null}catch{return null}}
