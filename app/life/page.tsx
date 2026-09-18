'use client'
import {useEffect,useMemo,useState} from 'react'

type Task={id:string;time:string;title:string;category:string;status:'pending'|'done';service?:string}
const defaultTasks:Task[]=[
{id:'wake',time:'06:00',title:'Wake up & start your day',category:'Wellness',status:'pending'},
{id:'plan',time:'06:15',title:'Review today’s priorities',category:'Planning',status:'pending'},
{id:'walk',time:'06:30',title:'Walk / exercise',category:'Wellness',status:'pending'},
{id:'breakfast',time:'08:00',title:'Breakfast',category:'Food',status:'pending',service:'Find breakfast nearby'},
{id:'work',time:'09:00',title:'Work / meetings',category:'Work',status:'pending'},
{id:'lunch',time:'13:00',title:'Lunch',category:'Food',status:'pending',service:'Find lunch nearby'},
{id:'errands',time:'16:00',title:'Shopping / services / personal errands',category:'Services',status:'pending',service:'Find local services'},
{id:'dinner',time:'20:00',title:'Dinner & family time',category:'Food',status:'pending',service:'Find dinner nearby'},
{id:'review',time:'21:30',title:'Review completed & pending tasks',category:'Planning',status:'pending'},
{id:'sleep',time:'22:00',title:'Good night / sleep',category:'Wellness',status:'pending'}
]
const profileKey='gbk_life_profile'
const profileDefaults={wake:'06:00',sleep:'22:00',work:'',language:'English',home:'',food:'',transport:'',shopping:'',family:'',preferences:''}
const tripNeeds:[string,string,string][]=[
['Before departure','✈️ Transport tickets','Book Hyderabad → Delhi travel and keep confirmation in one place.'],
['Before departure','🏨 Stay','Find and book accommodation near the destination.'],
['Before departure','🚕 Airport / station transfer','Arrange pickup and return transfer.'],
['Delhi','📍 Local transport','Find cabs, rentals or public transport for each appointment.'],
['Delhi','🍴 Food','Plan breakfast, lunch and dinner near the day’s locations.'],
['Delhi','💼 Meetings / appointments','Add exact times, addresses and reminders.'],
['Delhi','🛍️ Shopping / errands','Add requested purchases and local services.'],
['Delhi','🚑 Emergency / essentials','Keep important contacts, documents and essential services accessible.'],
['Return','✈️ Return travel','Book Delhi → Hyderabad and schedule transfer to departure point.'],
['After return','🏠 Home services','Add any pending home, family or personal tasks.']
]
function key(){return 'gbk_life_tasks'}
export default function Life(){
 const [profile,setProfile]=useState<any>(profileDefaults),[request,setRequest]=useState(''),[generated,setGenerated]=useState(''),[profileSaved,setProfileSaved]=useState(false),[tasks,setTasks]=useState<Task[]>(defaultTasks),[route,setRoute]=useState('Hyderabad'),[destination,setDestination]=useState('Delhi'),[returnTo,setReturnTo]=useState('Hyderabad'),[trip,setTrip]=useState(false),[tripDate,setTripDate]=useState(''),[returnDate,setReturnDate]=useState(''),[custom,setCustom]=useState(''),[customTime,setCustomTime]=useState('10:00'),[alert,setAlert]=useState(false)
 useEffect(()=>{try{const p=JSON.parse(localStorage.getItem(profileKey)||'null');if(p)setProfile({...profileDefaults,...p});const x=JSON.parse(localStorage.getItem(key())||'null');if(Array.isArray(x))setTasks(x)}catch{}},[])
 useEffect(()=>{localStorage.setItem(key(),JSON.stringify(tasks));localStorage.setItem(profileKey,JSON.stringify(profile))},[tasks,profile])
 const done=tasks.filter(x=>x.status==='done').length
 function toggle(id:string){setTasks(v=>v.map(x=>x.id===id?{...x,status:x.status==='done'?'pending':'done'}:x))}
 function add(){if(!custom.trim())return;setTasks(v=>[...v,{id:crypto.randomUUID(),time:customTime,title:custom.trim(),category:'Personal',status:'pending' as const}].sort((a,b)=>a.time.localeCompare(b.time)));setCustom('')}
 function reset(){setTasks(defaultTasks)}
 function openSearch(text:string){window.location.href='/?q='+encodeURIComponent(text)}
 async function createAiPlan(){const q=request.trim();if(!q){setGenerated('Please describe what you need first.');return}try{const r=await fetch('/api/ai-search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q,language:profile.language||'English'})});const d=await r.json();if(!r.ok)throw new Error(d?.error||'Plan could not be created');const p=d.plan;setGenerated((d.answer||'Plan created.')+' '+(p?.missing?.length?`Still needed: ${p.missing.join(', ')}.`:'Your request is ready for marketplace matching.')+' You confirm before any booking or payment.')}catch{setGenerated('The AI planner is temporarily unavailable. You can still use the marketplace search below.')}}
 function enableAlerts(){if(typeof Notification==='undefined'){setAlert(false);return}Notification.requestPermission().then(p=>setAlert(p==='granted'))}
 const tripTitle=useMemo(()=>route&&destination&&returnTo?route+' → '+destination+' → '+returnTo:'Trip planner',[route,destination,returnTo])
 return <main className="dashboard-page"><header className="nav"><a className="brand" href="/"><span className="logo">GBK</span><span>AI Marketplace</span></a><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><a className="text-button" href="/">Marketplace</a><a className="primary inline-button" href="/dashboard">Dashboard</a></div></header>
 <section className="section"><span className="eyebrow">GBK AI LIFE • A TO Z</span><h1>From Good Morning to Good Night</h1><p>One personal plan for your day. Tell GBK AI what you need and connect each task to marketplace services.</p>
 <div className="dashboard-list" style={{marginTop:24}}>
 <div style={{display:'flex',justifyContent:'space-between',gap:16,flexWrap:'wrap',alignItems:'center'}}><div><span className="eyebrow">STEP 1</span><h2>👤 My Life Profile</h2><p>Optional details help GBK AI personalize your plan. You can change them anytime.</p></div></div>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>
 <label>Wake-up time<input type="time" value={profile.wake} onChange={e=>setProfile({...profile,wake:e.target.value})} style={input}/></label>
 <label>Sleep time<input type="time" value={profile.sleep} onChange={e=>setProfile({...profile,sleep:e.target.value})} style={input}/></label>
 <label>Work / main schedule<input value={profile.work} onChange={e=>setProfile({...profile,work:e.target.value})} placeholder="e.g. Office 09:00–18:00" style={input}/></label>
 <label>Preferred language<input value={profile.language} onChange={e=>setProfile({...profile,language:e.target.value})} placeholder="English / Telugu / Hindi…" style={input}/></label>
 <label>Home / base city<input value={profile.home} onChange={e=>setProfile({...profile,home:e.target.value})} placeholder="e.g. Hyderabad, India" style={input}/></label>
 <label>Food preferences<input value={profile.food} onChange={e=>setProfile({...profile,food:e.target.value})} placeholder="e.g. vegetarian" style={input}/></label>
 <label>Transport preference<input value={profile.transport} onChange={e=>setProfile({...profile,transport:e.target.value})} placeholder="e.g. cab / metro / own car" style={input}/></label>
 <label>Regular shopping<input value={profile.shopping} onChange={e=>setProfile({...profile,shopping:e.target.value})} placeholder="e.g. groceries" style={input}/></label>
 <label>Family needs<input value={profile.family} onChange={e=>setProfile({...profile,family:e.target.value})} placeholder="Optional" style={input}/></label>
 <label>Other preferences<input value={profile.preferences} onChange={e=>setProfile({...profile,preferences:e.target.value})} placeholder="Optional" style={input}/></label>
 </div><button className="primary inline-button" style={{marginTop:14}} onClick={()=>{localStorage.setItem(profileKey,JSON.stringify(profile));setProfileSaved(true);setTimeout(()=>setProfileSaved(false),2000)}}>Save My Life Profile</button>{profileSaved&&<span style={{marginLeft:10}}>✓ Saved on this device</span>}
 </div>
 <div className="dashboard-list"><span className="eyebrow">STEP 2</span><h2>🤖 Tell GBK AI what you need</h2><p>Use normal language — you do not need to choose a category.</p><textarea value={request} onChange={e=>setRequest(e.target.value)} placeholder="Example: Tomorrow I need to travel Hyderabad to Delhi for a business meeting, stay one night, have dinner and return Thursday." style={{...input,minHeight:110,resize:'vertical'}}/><button className="primary inline-button" style={{marginTop:12}} onClick={createAiPlan}>Create My A-to-Z Plan →</button>{generated&&<div className="ai-result" style={{marginTop:16}}><span className="eyebrow">GBK AI PLAN</span><p>{generated}</p></div>}</div>
 <div className="dashboard-grid"><div className="dashboard-card"><span>☀️</span><strong>{tasks.length}</strong><small>Today’s tasks</small></div><div className="dashboard-card"><span>✅</span><strong>{done}</strong><small>Completed</small></div><div className="dashboard-card"><span>⏳</span><strong>{tasks.length-done}</strong><small>Pending</small></div><div className="dashboard-card"><span>🔔</span><strong>{alert?'ON':'OFF'}</strong><small>Alerts</small></div></div>
 <div className="dashboard-list"><div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><h2>🗓️ My Day</h2><p>Complete tasks as the day moves forward. Pending tasks stay visible so they can be rescheduled.</p></div><div style={{display:'flex',gap:8}}><button className="text-button" onClick={enableAlerts}>🔔 {alert?'Alerts enabled':'Enable alerts'}</button><button className="text-button" onClick={reset}>Reset sample day</button></div></div>{tasks.map(x=><div className="row" key={x.id}><div style={{display:'flex',gap:14,alignItems:'flex-start',flex:1}}><strong style={{minWidth:52}}>{x.time}</strong><div><strong>{x.title}</strong><small>{x.category}{x.service?' • '+x.service:''}</small></div></div><div style={{display:'flex',gap:8,alignItems:'center'}}>{x.service&&<button className="text-button" onClick={()=>openSearch(x.service||'Find service')}>Find →</button>}<button className="primary inline-button" onClick={()=>toggle(x.id)}>{x.status==='done'?'✓ Done':'Complete'}</button></div></div>)}
 <div style={{display:'flex',gap:8,marginTop:16,flexWrap:'wrap'}}><input type="time" value={customTime} onChange={e=>setCustomTime(e.target.value)} style={input}/><input value={custom} onChange={e=>setCustom(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')add()}} placeholder="Add a personal task…" style={{...input,flex:'1 1 240px'}}/><button className="primary inline-button" onClick={add}>+ Add task</button></div></div>
 <div className="dashboard-list"><span className="eyebrow">TRAVEL CONCIERGE</span><h2>✈️ Plan an entire trip</h2><p>Example: <b>Hyderabad → Delhi → Hyderabad</b>. GBK AI can organize the journey into transport, stay, local travel, food, appointments, shopping, reminders and return travel.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}><label>From<input value={route} onChange={e=>setRoute(e.target.value)} style={input}/></label><label>Destination<input value={destination} onChange={e=>setDestination(e.target.value)} style={input}/></label><label>Return to<input value={returnTo} onChange={e=>setReturnTo(e.target.value)} style={input}/></label><label>Departure date<input type="date" value={tripDate} onChange={e=>setTripDate(e.target.value)} style={input}/></label><label>Return date<input type="date" value={returnDate} onChange={e=>setReturnDate(e.target.value)} style={input}/></label></div><button className="primary inline-button" style={{marginTop:14}} onClick={()=>setTrip(true)}>Build A-to-Z trip plan →</button>{trip&&<div style={{marginTop:20}}><h3>{tripTitle}</h3>{tripNeeds.map((n,i)=><div className="row" key={i}><div><strong>{n[1]}</strong><small>{n[0]} • {n[2]}</small></div><button className="text-button" onClick={()=>openSearch(n[1])}>Find service →</button></div>)}</div>}</div>
 <div className="dashboard-list"><h2>🤖 How GBK AI should work</h2><div className="row"><div><strong>1. Understand</strong><small>“I need to travel Hyderabad to Delhi for two days.”</small></div></div><div className="row"><div><strong>2. Plan</strong><small>Build the timetable, route, services, bookings and reminders.</small></div></div><div className="row"><div><strong>3. Ask only what is missing</strong><small>Dates, passengers, budget, preferences or other essential details.</small></div></div><div className="row"><div><strong>4. Connect marketplace services</strong><small>Search providers, compare available options, then let the user choose and book/pay.</small></div></div><div className="row"><div><strong>5. Track & reschedule</strong><small>Completed tasks are marked done; unfinished tasks remain pending for rescheduling.</small></div></div></div>
 </section></main>
}
const input={width:'100%',padding:12,border:'1px solid #ccdcd6',borderRadius:12,fontSize:15,boxSizing:'border-box' as const,marginTop:6}
