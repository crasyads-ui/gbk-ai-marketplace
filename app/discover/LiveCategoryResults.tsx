'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getApprovedListings } from '../../lib/supabase'

const categoryNames:Record<string,string> = {
  'travel-tourism':'Travel & Tourism','food-restaurants':'Food & Restaurants','real-estate':'Real Estate',
  'local-services':'Local Services','shopping':'Shopping','learning':'Learning','agriculture':'Agriculture',
  'shipping-logistics':'Shipping & Logistics','bookings':'Bookings','ai-digital-services':'AI & Digital Services'
}
const tagMap:Record<string,string> = {
  'Food & Restaurants':'Food','Travel & Tourism':'Travel','Real Estate':'Property','Local Services':'Services',
  Shopping:'Shopping',Learning:'Learning',Agriculture:'Agriculture','Shipping & Logistics':'Shipping',
  Bookings:'Bookings','AI & Digital Services':'Digital'
}

export default function LiveCategoryResults({slug}:{slug:string}){
  const title=categoryNames[slug]||'Marketplace'
  const [rows,setRows]=useState<any[]>([]),[globalRows,setGlobalRows]=useState<any[]>([])
  const [loading,setLoading]=useState(true),[globalLoading,setGlobalLoading]=useState(true)
  const [error,setError]=useState(''),[globalMessage,setGlobalMessage]=useState(''),[search,setSearch]=useState('')

  async function searchGlobal(q:string){
    const query=q.trim()||title
    setGlobalLoading(true);setGlobalMessage('')
    try{
      const r=await fetch('/api/global-discovery',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,language:'en'})})
      const d=await r.json()
      if(!r.ok)throw new Error(d?.error||'Global GBK AI Search failed.')
      setGlobalRows(Array.isArray(d?.results)?d.results:[])
      setGlobalMessage(d?.message||'')
    }catch(e){setGlobalRows([]);setGlobalMessage(e instanceof Error?e.message:'Global GBK AI Search is unavailable right now.')}
    finally{setGlobalLoading(false)}
  }

  useEffect(()=>{
    let active=true
    setLoading(true)
    getApprovedListings().then(data=>{if(active)setRows(Array.isArray(data)?data:[])}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Unable to load live businesses.')}).finally(()=>{if(active)setLoading(false)})
    searchGlobal(title)
    return()=>{active=false}
  },[title])

  const results=useMemo(()=>{
    const q=search.trim().toLowerCase(),wanted=tagMap[title]||''
    return rows.filter(x=>{
      const category=x.marketplace_categories?.name||''
      const categoryMatch=category===title||category.toLowerCase().includes(title.toLowerCase())||(wanted&&category.toLowerCase().includes(wanted.toLowerCase()))
      if(!categoryMatch)return false
      if(!q)return true
      return [x.business_name,x.title,x.description,x.city,x.country,category].filter(Boolean).join(' ').toLowerCase().includes(q)
    })
  },[rows,search,title])

  return <section className="dashboard-list" style={{marginTop:28}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
      <div><span className="eyebrow">LIVE MARKETPLACE</span><h2 style={{margin:'6px 0 0'}}>Available {title} businesses</h2></div>
      <strong>{loading?'Loading…':`${results.length} marketplace result${results.length===1?'':'s'}`}</strong>
    </div>

    <div style={{display:'flex',gap:10,marginTop:16,flexWrap:'wrap'}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${title} by business, service or city`} style={{flex:'1 1 260px'}} />
      <button className="primary" onClick={()=>searchGlobal(search||title)} disabled={globalLoading}>{globalLoading?'Searching…':'🌍 Global GBK AI Search'}</button>
    </div>

    {loading && <p style={{marginTop:18}}>Finding approved and verified businesses…</p>}
    {!loading && error && <p style={{marginTop:18}}>Live marketplace listings are temporarily unavailable.</p>}
    {!loading && !error && results.length>0 && <div className="dashboard-grid" style={{marginTop:18}}>{results.map(x=><article className="dashboard-card" key={x.id} style={{textAlign:'left'}}>
      {x.image_url && <img src={x.image_url} alt={x.business_name||x.title||'Business'} style={{width:'100%',height:150,objectFit:'cover',borderRadius:12,marginBottom:12}} />}
      <strong>{x.business_name||x.title||'Business'}</strong>
      {x.title && x.title!==x.business_name && <div style={{marginTop:4,fontWeight:600}}>{x.title}</div>}
      <small style={{display:'block',marginTop:7,lineHeight:1.5}}>{x.description||`Discover ${title} services.`}</small>
      {(x.city||x.country) && <small style={{display:'block',marginTop:7}}>📍 {[x.city,x.country].filter(Boolean).join(', ')}</small>}
      <Link className="primary inline-button" style={{marginTop:12}} href={'/?q='+encodeURIComponent(x.business_name||x.title||title)}>View / Request →</Link>
    </article>)}</div>}

    <div style={{marginTop:30}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <div><span className="eyebrow">GLOBAL DISCOVERY</span><h2 style={{margin:'6px 0 0'}}>GBK AI global search results</h2></div>
        <strong>{globalLoading?'Searching…':`${globalRows.length} global result${globalRows.length===1?'':'s'}`}</strong>
      </div>
      {!globalLoading && globalMessage && <p style={{marginTop:12,fontSize:14}}>{globalMessage}</p>}
      {!globalLoading && globalRows.length>0 && <div className="dashboard-grid" style={{marginTop:16}}>{globalRows.map((x:any)=><article className="dashboard-card" key={x.id} style={{textAlign:'left'}}>
        {x.image_url && <img src={x.image_url} alt={x.title||'Business'} style={{width:'100%',height:150,objectFit:'cover',borderRadius:12,marginBottom:12}} />}
        <strong>{x.title||'Business'}</strong>
        <small style={{display:'block',marginTop:7,lineHeight:1.5}}>{x.text||x.address||'Global business discovery result.'}</small>
        {(x.city||x.country||x.address) && <small style={{display:'block',marginTop:7}}>📍 {x.address||[x.city,x.country].filter(Boolean).join(', ')}</small>}
        {x.sourceLabel && <small style={{display:'block',marginTop:7}}>Source: {x.sourceLabel}</small>}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
          {x.url && <a className="outline" href={x.url} target="_blank" rel="noreferrer">Open business ↗</a>}
          <Link className="primary inline-button" href={'/?q='+encodeURIComponent(x.title||title)}>Ask GBK AI →</Link>
        </div>
      </article>)}</div>}
    </div>

    {!loading && !error && results.length===0 && <p style={{marginTop:18}}>No approved businesses are listed in this category yet. Global GBK AI Search is available above.</p>}
  </section>
}
