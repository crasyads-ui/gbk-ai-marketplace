'use client'
import { useEffect, useState } from 'react'
import { getApprovedListings } from '../../lib/supabase'

export default function ListingsPage() {
  const [items,setItems]=useState<any[]>([])
  const [q,setQ]=useState('')
  useEffect(()=>{getApprovedListings().then(setItems).catch(()=>setItems([]))},[])
  const filtered=items.filter(x=>`${x.business_name||''} ${x.title||''} ${x.description||''} ${x.city||''} ${x.country||''}`.toLowerCase().includes(q.toLowerCase()))
  return <main style={{maxWidth:1100,margin:'0 auto',padding:24,fontFamily:'Arial,sans-serif'}}><header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,marginBottom:40}}><a href="/">← GBK AI Marketplace</a><a href="/dashboard">Business Dashboard</a></header><span style={{letterSpacing:2,fontWeight:700}}>DISCOVER</span><h1>Marketplace listings</h1><p>Find approved businesses, products and services.</p><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search business, city or service…" style={{width:'100%',padding:16,borderRadius:14,border:'1px solid #ddd',margin:'20px 0 30px',fontSize:16}}/><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:18}}>{filtered.map(x=><article key={x.id} style={{padding:22,border:'1px solid #ddd',borderRadius:20}}><small>{x.city}{x.country?`, ${x.country}`:''}</small><h2>{x.business_name||x.title}</h2><p>{x.description||'Marketplace listing'}</p>{x.verified&&<b>✓ Verified</b>} {x.price_from!=null&&<p>{x.currency||'USD'} {x.price_from}+</p>}<a href={`/listing?id=${x.id}`}>View details →</a></article>)}</div>{filtered.length===0&&<p>No approved listings found yet. Businesses can submit a listing from the homepage.</p>}</main>
