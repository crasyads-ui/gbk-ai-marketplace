'use client'
import { useEffect, useState } from 'react'
import { getMyMarketplaceAIRequests } from '../../lib/supabase'
export default function RequestsPage(){
 const [items,setItems]=useState<any[]>([])
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 useEffect(()=>{const token=localStorage.getItem('gbk_marketplace_session')||'';if(!token){setError('Please sign in to view your requests.');setLoading(false);return}getMyMarketplaceAIRequests(token).then(setItems).catch(e=>setError(e instanceof Error?e.message:'Unable to load requests.')).finally(()=>setLoading(false))},[])
 return <main style={{minHeight:'100vh',background:'#edf4f1',padding:'24px 16px'}}><div style={{maxWidth:900,margin:'0 auto'}}><a href="/">← GBK AI Marketplace</a><h1 style={{marginTop:24}}>My GBK AI Requests</h1>{loading&&<p>Loading…</p>}{error&&<p>{error}</p>}{!loading&&!error&&!items.length&&<p>No requests yet. <a href="/">Ask GBK AI for anything.</a></p>}<div style={{display:'grid',gap:14}}>{items.map((x:any)=><article key={x.id} style={{background:'#fff',borderRadius:16,padding:18,border:'1px solid #d7e4df'}}><small>{x.category} · {x.status}</small><h3>{x.request_text}</h3><p>{x.location_text||'Location not specified'}</p></article>)}</div></div></main>
}