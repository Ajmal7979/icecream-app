import React, { useEffect } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import IceCream from './pages/IceCream.jsx'
import Bill from './pages/Bill.jsx'
import Employees from './pages/Employees.jsx'
import Reports from './pages/Reports.jsx'
import { useStore } from './store.jsx'
import { signOut } from 'firebase/auth'
import { auth } from './firebase.js'

const nav = [['/', 'Dashboard', '📊'], ['/bill', 'Bill', '🧾'], ['/icecream', 'Rates', '🍦'], ['/employees', 'Employees', '👥'], ['/reports', 'Reports', '📈']]
export default function App() {
  const { db, ready, cloud, importData } = useStore()
  // phone layout: turn table rows into cards, labelling each cell from its column header
  useEffect(() => {
    const run = () => document.querySelectorAll('table.rt').forEach((t) => { const h = [...t.querySelectorAll('thead th')].map((x) => x.textContent.trim()); t.querySelectorAll('tbody tr').forEach((tr) => [...tr.children].forEach((td, i) => td.setAttribute('data-label', h[i] || ''))) })
    run(); const o = new MutationObserver(run); o.observe(document.getElementById('root'), { childList: true, subtree: true }); return () => o.disconnect()
  }, [])
  return (
    <div className="layout">
      <aside className="side">
        <div className="brand">🍨 <span>Ice Cream<br />Wholesale</span></div>
        {nav.map(([to, label, ic]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => 'nav' + (isActive ? ' on' : '')}><span>{ic}</span>{label}</NavLink>)}
        {cloud && <button className="nav out" onClick={() => signOut(auth)}><span>🚪</span>Sign out</button>}
      </aside>
      <main className="main">
        {cloud && !ready ? <p>Loading…</p> : <>
        {cloud && db.varieties.length === 0 && <div className="banner">Cloud database is empty. <button className="btn" onClick={() => confirm('Copy the starting data (Excel import / this browser) into the cloud?') && importData()}>Import starting data</button></div>}
        <Routes>
          <Route path="/" element={<Dashboard />} /><Route path="/bill" element={<Bill />} />
          <Route path="/icecream" element={<IceCream />} /><Route path="/employees" element={<Employees />} />
          <Route path="/reports" element={<Reports />} />
        </Routes></>}
      </main>
    </div>
  )
}