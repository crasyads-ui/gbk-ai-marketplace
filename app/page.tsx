'use client'

import { useMemo, useState } from 'react'

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
  const [submitted, setSubmitted] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return listings.filter(item => {
      const matchesFilter = filter === 'All' || item.tag === filter
      const matchesQuery = !q || `${item.title} ${item.text} ${item.keywords}`.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [query, filter])

  const scrollToExplore = () => document.getElementById('explore')?.scrollIntoView({behavior:'smooth'})

  return <main>
    <header className="nav">
      <div className="brand"><span className="logo">GBK</span><span>AI Marketplace</span></div>
      <div className="links"><a href="#explore">Explore</a><a href="#categories">Categories</a><a href="#business">For Business</a><button onClick={() => setShowBusiness(true)}>Sign in</button></div>
    </header>

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
      <div className="section-head"><div><span className="eyebrow">GBK AI DISCOVERY</span><h2>Explore opportunities around you</h2><p className="result-count">{filtered.length} marketplace categories found</p></div><div className="filters">{['All','Food','Travel','Property','Services','Shopping','Digital'].map(x=><button key={x} className={filter===x?'active':''} onClick={() => setFilter(x)}>{x}</button>)}</div></div>
      <div className="cards">{filtered.map(x=><article className="card" key={x.title}><div className="card-icon">{x.icon}</div><div className="tag">{x.tag}</div><h3>{x.title}</h3><p>{x.text}</p><button className="outline" onClick={() => {setQuery(x.tag); window.scrollTo({top:0,behavior:'smooth'})}}>Explore</button></article>)}</div>
      {filtered.length === 0 && <div className="empty"><h3>No matching marketplace category</h3><p>Try another search or browse all categories.</p><button className="outline" onClick={() => {setQuery('');setFilter('All')}}>Show all</button></div>}
    </section>

    <section id="business" className="business"><div><span className="eyebrow">FOR BUSINESS</span><h2>Bring your business to the global marketplace.</h2><p>Create your listing, reach new customers and grow with AI-powered discovery.</p></div><button onClick={() => {setSubmitted(false);setShowBusiness(true)}}>List your business →</button></section>

    <footer><div className="brand"><span className="logo">GBK</span><span>AI Marketplace</span></div><span>© 2026 GBK AI • Discover. Connect. Grow.</span></footer>

    {showBusiness && <div className="modal-backdrop" onClick={() => setShowBusiness(false)}><div className="modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowBusiness(false)}>×</button>{submitted ? <div className="success"><div className="success-icon">✓</div><h2>Request received</h2><p>Your business listing request is ready for the GBK AI Marketplace team.</p><button className="primary" onClick={() => setShowBusiness(false)}>Done</button></div> : <><span className="eyebrow">FOR BUSINESS</span><h2>List your business</h2><p className="modal-copy">Start your marketplace listing. We’ll collect the basic details first.</p><form onSubmit={e => {e.preventDefault();setSubmitted(true)}}><label>Business name<input required placeholder="Your business name"/></label><label>Category<select required defaultValue=""><option value="" disabled>Select category</option>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></label><label>City / Country<input required placeholder="e.g. Hyderabad, India"/></label><label>Phone or email<input required placeholder="Contact details"/></label><button className="primary" type="submit">Submit listing request</button></form></>}</div></div>}
  </main>
}
