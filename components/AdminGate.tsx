'use client';
import {useEffect,useState,type ReactNode} from 'react';
export default function AdminGate({children}:{children:ReactNode}){
 const [ready,setReady]=useState(false),[token,setToken]=useState(''),[error,setError]=useState(''),[checking,setChecking]=useState(true);
 useEffect(()=>{fetch('/api/admin-session').then(r=>r.json()).then(d=>setReady(d.authenticated)).catch(()=>setError('Server unavailable')).finally(()=>setChecking(false))},[]);
 if(checking)return <p>Checking session…</p>;
 if(ready)return <><div className="session-bar"><span>Oracle workspace</span><button onClick={async()=>{await fetch('/api/admin-session',{method:'DELETE'});setReady(false)}}>Sign out</button></div>{children}</>;
 return <form className="admin-login" onSubmit={async e=>{e.preventDefault();setError('');try{const r=await fetch('/api/admin-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});const d=await r.json();if(!r.ok)throw Error(d.error);setReady(true);setToken('');}catch(e){setError((e as Error).message)}}}><h1>Admin access</h1><p>Use the ADMIN_TOKEN from your local .env.local file.</p><label>Admin key<input type="password" autoComplete="current-password" value={token} onChange={e=>setToken(e.target.value)} required/></label><button className="action" type="submit">Sign in</button>{error&&<p role="alert">{error}</p>}</form>;
}
