const categories = ['Food & Restaurants','Travel & Tourism','Real Estate','Local Services','Shopping','Digital Services']
const listings = [
  {icon:'🍽️', title:'Local Food & Dining', text:'Discover restaurants, cafes and food offers near you.', tag:'Food'},
  {icon:'✈️', title:'Travel & Tourism', text:'Find stays, tours, experiences and travel services.', tag:'Travel'},
  {icon:'🏠', title:'Real Estate', text:'Explore properties, plots and trusted local agents.', tag:'Property'},
  {icon:'🛠️', title:'Local Services', text:'Connect with verified service providers and professionals.', tag:'Services'},
  {icon:'🛍️', title:'Shopping', text:'Discover local products, stores and special offers.', tag:'Shopping'},
  {icon:'🤖', title:'AI & Digital Services', text:'Access AI tools, digital products and business services.', tag:'Digital'}
]

export default function Home() {
  return <main>
    <header className="nav"><div className="brand"><span className="logo">GBK</span><span>AI Marketplace</span></div><div className="links"><a href="#explore">Explore</a><a href="#categories">Categories</a><a href="#business">For Business</a><button>Sign in</button></div></header>
    <section className="hero"><div className="hero-inner"><div className="eyebrow">GLOBAL MARKETPLACE • AI-FIRST</div><h1>Find what you need.<br/><em>Buy local. Go global.</em></h1><p>Discover stores, services, experiences and digital products — powered by GBK AI.</p><div className="search"><span>⌕</span><input placeholder="What are you looking for?"/><button>Search</button></div><div className="quick"><span>Popular:</span>{['Restaurants','Hotels','Plots','Services','AI Tools'].map(x=><a key={x} href="#explore">{x}</a>)}</div></div></section>
    <section id="categories" className="section"><div className="section-head"><div><span className="eyebrow">EXPLORE</span><h2>Everything in one marketplace</h2></div><a href="#explore">View all →</a></div><div className="categories">{categories.map((c,i)=><div className="category" key={c}><span>{['🍴','🌍','🏡','🔧','🛒','✨'][i]}</span><strong>{c}</strong><small>Explore →</small></div>)}</div></section>
    <section id="explore" className="section muted"><div className="section-head"><div><span className="eyebrow">GBK AI DISCOVERY</span><h2>Explore opportunities around you</h2></div><div className="filters"><button className="active">All</button><button>Nearby</button><button>Popular</button></div></div><div className="cards">{listings.map(x=><article className="card" key={x.title}><div className="card-icon">{x.icon}</div><div className="tag">{x.tag}</div><h3>{x.title}</h3><p>{x.text}</p><button className="outline">Explore</button></article>)}</div></section>
    <section id="business" className="business"><div><span className="eyebrow">FOR BUSINESS</span><h2>Bring your business to the global marketplace.</h2><p>Create your listing, reach new customers and grow with AI-powered discovery.</p></div><button>List your business →</button></section>
    <footer><div className="brand"><span className="logo">GBK</span><span>AI Marketplace</span></div><span>© 2026 GBK AI • Discover. Connect. Grow.</span></footer>
  </main>
}
