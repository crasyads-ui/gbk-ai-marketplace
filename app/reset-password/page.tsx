'use client'

import { useEffect, useState } from 'react'
import { supabaseRequest } from '../../lib/supabase'

export default function ResetPasswordPage(){
 const [ready,setReady]=useState(false),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[message,setMessage]=useState(''),[saving,setSaving]=useState(false)
 useEffect(()=>{
  const hash=window.location.hash
  const params=new URLSearchParams(hash.replace(/^#/,''))
  const token=params.get('access_token')
  if(token){localStorage.setItem('gbk_password_reset_token',token);setReady(true);return}
  const stored=localStorage.getItem('gbk_password_reset_token')
  setReady(!!stored)
 },[])
 async function submit(e:React.FormEvent){
  e.preventDefault();setMessage('')
  if(password.length<6){setMessage('Password must be at least 6 characters.');return}
  if(password!==confirm){setMessage('Passwords do not match.');return}
  const token=localStorage.getItem('gbk_password_reset_token')||''
  if(!token){setMessage('This reset link is missing or expired. Please request a new password reset email.');return}
  setSaving(true)
  try{
   const r=await supabaseRequest('/auth/v1/user',{method:'PUT',body:JSON.stringify({password}),},token)
   const d=await r.json().catch(()=>({}))
   if(!r.ok)throw new Error(d?.message||d?.error_description||'Unable to update password.')
   localStorage.removeItem('gbk_password_reset_token')
   setPassword('');setConfirm('')
   setMessage('✅ Password changed successfully. You can now sign in.')
  }catch(err){setMessage(err instanceof Error?err.message:'Unable to update password.')}
  finally{setSaving(false)}
 }
 return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f1f8f5'}}><section style={{width:'100%',maxWidth:520,background:'#fff',borderRadius:24,padding:28,boxShadow:'0 12px 40px rgba(0,0,0,.08)'}}><div style={{fontWeight:900,color:'#28715e',letterSpacing:2}}>GBK AI ACCOUNT</div><h1 style={{fontSize:38,margin:'12px 0'}}>Reset password</h1><p style={{color:'#60716b'}}>Choose a new password for your GBK AI Marketplace account.</p>{ready?<form onSubmit={submit} style={{display:'grid',gap:16}}><label>New password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" minLength={6} required placeholder="Minimum 6 characters" style={{width:'100%',padding:14,border:'1px solid #ccdcd6',borderRadius:12,marginTop:6}}/></label><label>Confirm password<input value={confirm} onChange={e=>setConfirm(e.target.value)} type="password" minLength={6} required placeholder="Enter it again" style={{width:'100%',padding:14,border:'1px solid #ccdcd6',borderRadius:12,marginTop:6}}/></label><button type="submit" disabled={saving} style={{padding:15,border:0,borderRadius:14,background:'#28715e',color:'#fff',fontWeight:800,fontSize:16}}>{saving?'Saving…':'Change password'}</button></form>:<p style={{fontWeight:700}}>Open the password-reset link from your email on this device. If you did not receive it, return to the marketplace and use <strong>Forgot password?</strong> again.</p>}{message&&<p style={{marginTop:16,fontWeight:700}}>{message}</p>}<p style={{marginTop:20}}><a href="/" style={{color:'#28715e',fontWeight:800}}>← Back to GBK AI Marketplace</a></p></section></main>
}
