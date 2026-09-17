export default function Dashboard() {
  return (
    <main style={{maxWidth:1100,margin:'0 auto',padding:24,fontFamily:'Arial,sans-serif'}}>
      <a href="/">← GBK AI Marketplace</a>
      <p style={{letterSpacing:2,fontWeight:700,marginTop:48}}>GBK AI MARKETPLACE</p>
      <h1>Business Dashboard</h1>
      <p>Manage your marketplace presence, listings, enquiries and orders.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginTop:32}}>
        <a href="/" style={{padding:24,border:'1px solid #ddd',borderRadius:20}}>🏪<br/><b>Business listing</b><br/>Create or update your listing.</a>
        <a href="/" style={{padding:24,border:'1px solid #ddd',borderRadius:20}}>📩<br/><b>Enquiries</b><br/>Manage customer enquiries.</a>
        <a href="/" style={{padding:24,border:'1px solid #ddd',borderRadius:20}}>🛒<br/><b>Orders</b><br/>Track marketplace orders.</a>
        <a href="/" style={{padding:24,border:'1px solid #ddd',borderRadius:20}}>⭐<br/><b>Reviews</b><br/>View customer reviews.</a>
      </div>
    </main>
  )
}
