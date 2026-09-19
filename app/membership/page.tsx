'use client'

import { useState } from 'react'

const methods = [
  { id: 'LOCAL_CURRENCY', icon: '💳', title: 'Local currency', text: 'Pay in the currency and payment method supported in your country.' },
  { id: 'USDT', icon: '₮', title: 'USDT', text: 'Pay the $1 equivalent in USDT on a supported network.' },
  { id: 'GBK', icon: '🪙', title: 'GBK', text: 'Pay the $1 equivalent in GBK from your connected wallet.' },
]

export default function MembershipPage() {
  const [method, setMethod] = useState('LOCAL_CURRENCY')
  const [message, setMessage] = useState('')

  function continueToPayment() {
    setMessage('Payment checkout is being connected. Your membership price is fixed at $1/month; the final local-currency, USDT or GBK amount will be shown before payment.')
  }

  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(180deg,#f3faf7 0%,#fff 55%)',padding:'28px 18px 60px'}}>
      <div style={{maxWidth:980,margin:'0 auto'}}>
        <a href="/" style={{textDecoration:'none',fontWeight:800,color:'#173c32'}}>← GBK AI Marketplace</a>
        <section style={{textAlign:'center',padding:'52px 10px 30px'}}>
          <div style={{letterSpacing:2,fontSize:13,fontWeight:800,color:'#28715e'}}>GBK AI GLOBAL MEMBERSHIP</div>
          <h1 style={{fontSize:'clamp(38px,7vw,68px)',lineHeight:1.02,margin:'12px 0'}}>One membership.<br/><span style={{color:'#28715e'}}>$1/month.</span></h1>
          <p style={{fontSize:18,lineHeight:1.6,maxWidth:680,margin:'0 auto',color:'#52635e'}}>One GBK AI account across the growing global ecosystem — Marketplace, Learn, Real Estate, Agriculture, AI tools and more.</p>
        </section>

        <section style={{background:'#fff',border:'1px solid #d9e8e2',borderRadius:28,padding:26,boxShadow:'0 18px 50px rgba(26,73,59,.08)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
            <div>
              <div style={{fontWeight:800,fontSize:18}}>Global Membership</div>
              <div style={{color:'#60736d',marginTop:5}}>Core membership · cancel anytime</div>
            </div>
            <div style={{fontSize:38,fontWeight:900}}>$1<span style={{fontSize:15,fontWeight:700,color:'#60736d'}}>/month</span></div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginTop:24}}>
            {methods.map(m => <button key={m.id} onClick={()=>setMethod(m.id)} style={{textAlign:'left',padding:18,borderRadius:18,border:method===m.id?'2px solid #28715e':'1px solid #d9e8e2',background:method===m.id?'#edf8f3':'#fff',cursor:'pointer'}}>
              <div style={{fontSize:27}}>{m.icon}</div>
              <div style={{fontWeight:800,marginTop:8}}>{m.title}</div>
              <div style={{fontSize:14,lineHeight:1.45,color:'#60736d',marginTop:5}}>{m.text}</div>
            </button>)}
          </div>

          <button onClick={continueToPayment} style={{width:'100%',marginTop:20,padding:'16px 20px',border:0,borderRadius:15,background:'#173c32',color:'#fff',fontSize:17,fontWeight:800,cursor:'pointer'}}>Continue with {methods.find(m=>m.id===method)?.title} →</button>

          {message && <div style={{marginTop:14,padding:14,borderRadius:14,background:'#f5f8f7',color:'#36564d',lineHeight:1.5}}>{message}</div>}
        </section>

        <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14,marginTop:24}}>
          {['One global account','Multiple GBK AI services','Local currency + USDT + GBK','Simple $1/month pricing'].map(x=><div key={x} style={{padding:18,borderRadius:18,background:'#fff',border:'1px solid #e4eee9',fontWeight:750}}>✓ {x}</div>)}
        </section>

        <p style={{textAlign:'center',fontSize:13,color:'#73827d',maxWidth:760,margin:'28px auto 0'}}>Membership payment is for access to GBK AI services. It is not an investment, does not represent a token purchase, and does not promise financial returns. Payment methods and availability may vary by country.</p>
      </div>
    </main>
  )
}
