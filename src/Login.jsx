import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase.js'

function Login() {
  const [email, setEmail] = useState(''), [pass, setPass] = useState(''), [err, setErr] = useState('')
  const submit = async (e) => { e.preventDefault(); setErr(''); try { await signInWithEmailAndPassword(auth, email, pass) } catch { setErr('Wrong email or password') } }
  return (
    <div className="loginwrap"><form className="card login" onSubmit={submit}>
      <div className="brand" style={{ color: '#1e2233' }}>🍨 <span>Ice Cream Wholesale</span></div>
      <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" required placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
      {err && <div className="neg">{err}</div>}
      <button className="btn wide">Sign in</button>
    </form></div>
  )
}
export function AuthGate({ children }) {
  const [user, setUser] = useState(undefined)
  useEffect(() => onAuthStateChanged(auth, setUser), [])
  if (user === undefined) return <div className="loginwrap">Loading…</div>
  return user ? children : <Login />
}