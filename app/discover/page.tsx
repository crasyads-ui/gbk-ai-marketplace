import Link from 'next/link'

const categories = [
  ['travel-tourism','Travel & Tourism','Find travel agencies, tours, hotels and travel services.'],
  ['food-restaurants','Food & Restaurants','Discover restaurants, cafes, food and dining services.'],
  ['real-estate','Real Estate','Find property businesses, agents and real-estate services.'],
  ['local-services','Local Services','Discover local professionals and service businesses.'],
  ['shopping','Shopping','Find stores, products and local shopping businesses.'],
  ['learning','Learning','Discover tutors, courses, language and education services.'],
  ['agriculture','Agriculture','Find agriculture businesses, products and services.'],
  ['shipping-logistics','Shipping & Logistics','Discover courier, freight, delivery and logistics providers.'],
  ['bookings','Bookings','Find businesses offering booking-based services and experiences.'],
  ['ai-digital-services','AI & Digital Services','Discover AI, software and digital service businesses.'],
]

export default function DiscoverPage() {
  return <main className="section">
    <span className="eyebrow">GBK AI MARKETPLACE</span>
    <h1>Discover businesses and services</h1>
    <p>Search freely, discover businesses, choose the business you want, and connect directly with the business owner.</p>
    <div className="dashboard-grid" style={{marginTop:24}}>
      {categories.map(([slug,title,description]) => <div className="dashboard-card" key={slug} style={{textAlign:'left',minHeight:150}}>
        <strong>{title}</strong>
        <small style={{display:'block',marginTop:8,lineHeight:1.5}}>{description}</small>
        <Link href={'/?q='+encodeURIComponent(title)} style={{display:'inline-block',marginTop:14,fontWeight:700}}>Search {title} →</Link>
      </div>)}
    </div>
    <div className="dashboard-list" style={{marginTop:24}}>
      <h2>Search the marketplace</h2>
      <p>Describe what you need in your own words. GBK AI helps organize the search; you make the final business selection.</p>
      <Link className="primary inline-button" href="/">Open GBK AI Search →</Link>
    </div>
  </main>
}
