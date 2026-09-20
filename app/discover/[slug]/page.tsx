import Link from 'next/link'

const names:Record<string,string> = {
  'travel-tourism':'Travel & Tourism','food-restaurants':'Food & Restaurants','real-estate':'Real Estate',
  'local-services':'Local Services','shopping':'Shopping','learning':'Learning','agriculture':'Agriculture',
  'shipping-logistics':'Shipping & Logistics','bookings':'Bookings','ai-digital-services':'AI & Digital Services'
}

export function generateStaticParams(){ return Object.keys(names).map(slug=>({slug})) }

export default async function CategoryPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params
  const title=names[slug]||'Marketplace'
  return <main className="section">
    <span className="eyebrow">GBK AI MARKETPLACE • SEARCH</span>
    <h1>{title}</h1>
    <p>Discover businesses and services in {title}. Search by business, service, city or requirement and choose directly from the available results.</p>
    <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:20}}>
      <Link className="primary inline-button" href={'/?q='+encodeURIComponent(title)}>Search {title} →</Link>
      <Link className="outline" href="/discover">All categories</Link>
    </div>
    <div className="dashboard-list" style={{marginTop:24}}>
      <h2>Customer choice</h2>
      <p>GBK AI provides search and discovery technology. The customer chooses the business and connects directly with the business owner.</p>
    </div>
  </main>
}
