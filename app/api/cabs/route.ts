import { NextResponse } from 'next/server'

type CabOption = { provider:string; vehicle:string; etaMinutes:number|null; fareMin:number|null; fareMax:number|null; currency:string|null; bookingAvailable:boolean; comparisonAllowed:boolean; note?:string }

async function geocode(address:string) {
  const key=String(process.env.GOOGLE_MAPS_API_KEY||'').trim()
  if(!key)return null
  const url='https://maps.googleapis.com/maps/api/geocode/json?address='+encodeURIComponent(address)+'&key='+encodeURIComponent(key)
  const response=await fetch(url,{cache:'no-store'})
  const data=await response.json().catch(()=>({}))
  const location=data?.results?.[0]?.geometry?.location
  if(!response.ok||!location)return null
  return {lat:Number(location.lat),lng:Number(location.lng)}
}

async function getOla(pickup:{lat:number,lng:number},destination:{lat:number,lng:number}):Promise<CabOption[]> {
  const appToken=String(process.env.OLA_X_APP_TOKEN||'').trim()
  if(!appToken)return []
  const base=String(process.env.OLA_RIDE_API_BASE_URL||'https://devapi.olacabs.com').replace(/\/$/,'')
  const url=base+'/v1/products?pickup_lat='+pickup.lat+'&pickup_lng='+pickup.lng+'&drop_lat='+destination.lat+'&drop_lng='+destination.lng+'&service_type=p2p'
  const headers:HeadersInit={'X-APP-TOKEN':appToken}
  const userToken=String(process.env.OLA_USER_ACCESS_TOKEN||'').trim()
  if(userToken)headers.Authorization='Bearer '+userToken
  const response=await fetch(url,{headers,cache:'no-store'})
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(data?.message||'Ola API unavailable')
  const categories=Array.isArray(data?.categories)?data.categories:[]
  return categories.filter((x:any)=>Number(x?.eta)>=0).map((x:any)=>({provider:'Ola',vehicle:String(x?.display_name||x?.id||'Ride'),etaMinutes:Number.isFinite(Number(x?.eta))?Number(x.eta):null,fareMin:Number.isFinite(Number(x?.ride_estimate?.amount_min))?Number(x.ride_estimate.amount_min):null,fareMax:Number.isFinite(Number(x?.ride_estimate?.amount_max))?Number(x.ride_estimate.amount_max):null,currency:String(x?.currency||'INR'),bookingAvailable:true,comparisonAllowed:true}))
}

async function getUber(pickup:{lat:number,lng:number}):Promise<CabOption[]> {
  const token=String(process.env.UBER_SERVER_TOKEN||'').trim()
  if(!token)return []
  const url='https://api.uber.com/v1.2/estimates/time?start_latitude='+pickup.lat+'&start_longitude='+pickup.lng
  const response=await fetch(url,{headers:{Authorization:'Bearer '+token,'Accept-Language':'en_US'},cache:'no-store'})
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(data?.message||'Uber API unavailable')
  return (Array.isArray(data?.times)?data.times:[]).filter((x:any)=>Number(x?.estimate)>=0).map((x:any)=>({provider:'Uber',vehicle:String(x?.localized_display_name||x?.display_name||'Ride'),etaMinutes:Math.max(1,Math.round(Number(x.estimate)/60)),fareMin:null,fareMax:null,currency:null,bookingAvailable:false,comparisonAllowed:false,note:'ETA available. Fare comparison is not displayed.'}))
}

export async function POST(request:Request) {
  try {
    const body=await request.json().catch(()=>({}))
    const pickupText=String(body?.pickup||'').trim(),destinationText=String(body?.destination||'').trim()
    const pickup=body?.pickupLat!=null&&body?.pickupLng!=null?{lat:Number(body.pickupLat),lng:Number(body.pickupLng)}:await geocode(pickupText)
    const destination=body?.destinationLat!=null&&body?.destinationLng!=null?{lat:Number(body.destinationLat),lng:Number(body.destinationLng)}:await geocode(destinationText)
    if(!pickup||!destination||!Number.isFinite(pickup.lat)||!Number.isFinite(pickup.lng)||!Number.isFinite(destination.lat)||!Number.isFinite(destination.lng))return NextResponse.json({error:'Cab APIs need map coordinates. Add GOOGLE_MAPS_API_KEY or send pickup/destination coordinates.'},{status:400})
    const settled=await Promise.allSettled([getOla(pickup,destination),getUber(pickup)])
    const options=settled.flatMap((r:any)=>r.status==='fulfilled'?r.value:[])
    const errors=settled.flatMap((r:any)=>r.status==='rejected'?[String(r.reason?.message||r.reason)]:[])
    options.sort((a:CabOption,b:CabOption)=>(a.etaMinutes??999)-(b.etaMinutes??999))
    return NextResponse.json({pickup,destination,options,providers:[{name:'Ola',configured:Boolean(process.env.OLA_X_APP_TOKEN),capabilities:'Live ride categories, ETA and fare estimate'},{name:'Uber',configured:Boolean(process.env.UBER_SERVER_TOKEN),capabilities:'Live ETA/product availability'}],errors})
  } catch { return NextResponse.json({error:'Cab provider search failed.'},{status:502}) }
}
