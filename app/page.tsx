'use client'

import { useEffect, useMemo, useState } from 'react'
import InstallPWA from './InstallPWA'
import { getApprovedListings, signIn, signUp, submitListingRequest } from '../lib/supabase'

const categories = [
  {name:'Food & Restaurants', icon:'🍴', tag:'Food'},
  {name:'Travel & Tourism', icon:'🌍', tag:'Travel'},
  {name:'Real Estate', icon:'🏡', tag:'Property'},
  {name:'Local Services', icon:'🔧', tag:'Services'},
  {name:'Shopping', icon:'🛒', tag:'Shopping'},
  {name:'AI & Digital Services', icon:'✨', tag:'Digital'},
]

const listings = [
  {icon:'🍽️', title:'Local Food & Dining', text:'Discover restaurants, cafes and food offers near you.', tag:'Food', keywords:'restaurant cafe food dining'},
  {icon:'✈️', title:'Travel & Tourism', text:'Find stays, tours, experiences and travel services.', tag:'Travel', keywords:'hotel travel tours tourism'},
  {icon:'🏠', title:'Real Estate', text:'Explore properties, plots and trusted local agents.', tag:'Property', keywords:'plots property house real estate'},
  {icon:'🛠️', title:'Local Services', text:'Connect with verified service providers and professionals.', tag:'Services', keywords:'services repair professionals'},
  {icon:'🛍️', title:'Shopping', text:'Discover local products, stores and special offers.', tag:'Shopping', keywords:'shopping stores products offers'},
  {icon:'🤖', title:'AI & Digital Services', text:'Access AI tools, digital products and business services.', tag:'Digital', keywords:'ai tools digital software'},
]

export default function Home() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [showBusiness, setShowBusiness] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [authMode, setAuthMode] = useState<'signin'|'signup'>('signin')
  const [authMessage, setAuthMessage] = useState('')
  const [liveListings, setLiveListings] = useState<any[]>([])
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    getApprovedListings().then(setLiveListings).catch(() => setLiveListings([]))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const local = listings.filter(item => {
      const matchesFilter = filter === 'All' || item.tag === filter
      const matchesQuery = !q || `${item.title} ${item.text} ${item.keywords}`.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
    const real = liveListings.map(item => ({
      icon: '📍', title: item.title || item.business_name, text: item.description || `Discover ${item.business_name} in ${item.city || item.country || 'your area'}.`, tag: item.category?.name || 'Marketplace', keywords: `${item.business_name} ${item.title} ${item.city || ''} ${item.country || ''}`
    })).filter(item => {
      const matchesFilter = filter === 'All' || item.tag === filter || item.tag === 'Marketplace'
      return !q || `${item.title} ${item.text} ${item.keywords}`.toLowerCase().includes(q)
    })
    return [...real, ...local]
  }, [query, filter, liveListings])

  const scrollToExplore = () => document.getElementById('explore')?.scrollIntoView({behavior:'smooth'})

  async function handleAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAuthMessage('')
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')
    try {
      const data = authMode === 'signin' ? await signIn(email, password) : await signUp(email, password)
      setUserEmail(data.user?.email || email)
      setAuthMessage(authMode === 'signup' && !data.access_token ? 'Account created. Check your email if confirmation is enabled.' : 'Signed in successfully.')
      if (data.access_token) localStorage.setItem('gbk_marketplace_session', data.access_token)
    } catch (err) {
      setAuthMessage(err instanceof Error ? err.message : 'Please try again.')
    }
  }

  async function handleBusiness(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    try {
      await submitListingRequest({
        business_name: String(form.get('business_name') || ''),
        category: String(form.get('category') || ''),
        city_country: String(form.get('city_country') || ''),
        contact: String(form.get('contact') || ''),
        user_id: null,
      })
      setSubmitted(true)
    } catch {
      setSubmitted(false)
      setAuthMessage('We could not submit the request right now. Please try again.')
    }
  }

  return <main>
    <header className="nav">
      <div className="brand"><span className="logo">GBK</span><span>AI Marketplace</span></div>
      <div className="links"><a href="#explore">Explore</a><a href="#categories">Categories</a><a href="#business">For Business</a><button onClick={() => {setAuthMessage('');setShowAuth(true)}}>{userEmail ? userEmail : 'Sign in'}</button></div>
    </header>
    <InstallPWA />

    <section className="hero">
      <div className="hero-inner">
        <div className="eyebrow">GLOBAL MARKETPLACE • AI-FIRST</div>
        <h1>Find what you need.<br/><em>Buy local. Go global.</em></h1>
        <p>Discover stores, services, experiences and digital products — powered by GBK AI.</p>
        <form className="search" onSubmit={e => {e.preventDefault(); scrollToExplore()}}>
          <span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="What are you looking for?" aria-label="Marketplace search"/><button type="submit">Search</button>
        </form>
        <div className="quick"><span>Popular:</span>{['Restaurants','Hotels','Plots','Services','AI Tools'].map(x=><button key={x} onClick={() => {setQuery(x); scrollToExplore()}}>{x}</button>)}</div>
      </div>
    </section>

    <section id="categories" className="section">
      <div className="section-head"><div><span className="eyebrow">EXPLORE</span><h2>Everything in one marketplace</h2></div><button className="text-button" onClick={scrollToExplore}>View all →</button></div>
      <div className="categories">{categories.map(c=><button className="category" key={c.name} onClick={() => {setFilter(c.tag); scrollToExplore()}}><span>{c.icon}</span><strong>{c.name}</strong><small>Explore →</small></button>)}</div>
    </section>

    <section id="explore" className="section muted">
      <div className="section-head"><div><span className="eyebrow">GBK AI DISCOVERY</span><h2>Explore opportunities around you</h2><p className="result-count">{filtered.length} results available</p></div><div className="filters">{['All','Food','Travel','Property','Services','Shopping','Digital'].map(x=><button key={x} className={filter===x?'active':''} onClick={() => setFilter(x)}>{x}</button>)}</div></div>
      <div className="cards">{filtered.map((x, i)=><article className="card" key={`${x.title}-${i}`}><div className="card-icon">{x.icon}</div><div className="tag">{x.tag}</div><h3>{x.title}</h3><p>{x.text}</p><button className="outline" onClick={() => {setQuery(x.tag); window.scrollTo({top:0,behavior:'smooth'})}}>Explore</button></article>)}</div>
      {filtered.length === 0 && <div className="empty"><h3>No matching marketplace result</h3><p>Try another search or browse all categories.</p><button className="outline" onClick={() => {setQuery('');setFilter('All')}}>Show all</button></div>}
    </section>

    <section id="business" className="business"><div><span className="eyebrow">FOR BUSINESS</span><h2>Bring your business to the global marketplace.</h2><p>Create your listing, reach new customers and grow with AI-powered discovery.</p></div><button onClick={() => {setSubmitted(false);setShowBusiness(true)}}>List your business →</button></section>

    <footer><div className="brand"><span className="logo">GBK</span><span>AI Marketplace</span></div><span>© 2026 GBK AI • Discover. Connect. Grow.</span></footer>

    {showBusiness && <div className="modal-backdrop" onClick={() => setShowBusiness(false)}><div className="modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowBusiness(false)}>×</button>{submitted ? <div className="success"><div className="success-icon">✓</div><h2>Request received</h2><p>Your business listing request has been saved for marketplace review.</p><button className="primary" onClick={() => setShowBusiness(false)}>Done</button></div> : <><span className="eyebrow">FOR BUSINESS</span><h2>List your business</h2><p className="modal-copy">Submit your business for review and publication.</p><form onSubmit={handleBusiness}><label>Business name<input name="business_name" required placeholder="Your business name"/></label><label>Category<select name="category" required defaultValue=""><option value="" disabled>Select category</option>{categories.map(c=><option key={c.name} value={c.tag}>{c.name}</option>)}</select></label><label>City / Country<input name="city_country" required placeholder="e.g. Hyderabad, India"/></label><label>Phone or email<input name="contact" required placeholder="Contact details"/></label><button className="primary" type="submit">Submit listing request</button></form></>}</div></div>}

    {showAuth && <div className="modal-backdrop" onClick={() => setShowAuth(false)}><div className="modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowAuth(false)}>×</button><span className="eyebrow">GBK AI ACCOUNT</span><h2>{authMode === 'signin' ? 'Sign in' : 'Create account'}</h2><p className="modal-copy">Use your email to manage marketplace activity.</p><form onSubmit={handleAuth}><label>Email<input name="email" type="email" required placeholder="you@example.com"/></label><label>Password<input name="password" type="password" minLength={6} required placeholder="Minimum 6 characters"/></label><button className="primary" type="submit">{authMode === 'signin' ? 'Sign in' : 'Create account'}</button></form>{authMessage && <p className="result-count">{authMessage}</p>}<button className="text-button" onClick={() => {setAuthMode(authMode === 'signin' ? 'signup' : 'signin');setAuthMessage('')}}>{authMode === 'signin' ? 'Create a new account' : 'Already have an account? Sign in'}</button></div></div>}
  </main>
}
