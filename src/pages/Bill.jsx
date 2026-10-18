import React, { useState } from 'react'
import { useStore } from '../store.jsx'
import { CATS, money, rateFor, sumItems, today } from '../utils.js'

export default function Bill() {
  const { db, addBill, deleteBill, addEmployee } = useStore()
  const [emp, setEmp] = useState(db.employees[0]?.id || '')
  const [date, setDate] = useState(today())
  const [qty, setQty] = useState({})
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('icecream')
  const change = (id, d) => setQty((s) => ({ ...s, [id]: Math.max(0, +((+s[id] || 0) + d).toFixed(2)) }))
  const items = db.varieties.filter((v) => qty[v.id] > 0).map((v) => { const r = rateFor(db, emp, v); return { varietyId: v.id, name: v.name, category: v.category, qty: +qty[v.id], cost: v.cost, empRate: r.empRate, sellRate: r.sellRate } })
  const t = sumItems(items)
  const save = () => {
    if (!emp) return alert('Add/select an employee first')
    if (!items.length) return alert('Enter at least one quantity')
    addBill({ date, employeeId: emp, items }); setQty({})
  }
  const recent = db.bills.filter((b) => !emp || b.employeeId === emp).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)
  const name = (id) => db.varieties.find((v) => v.id === id)?.name || '—'
  return (
    <>
      <div className="head"><h1>New Bill</h1>
        <div className="row">
          <select value={emp} onChange={(e) => setEmp(e.target.value)}>{db.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
          <button className="btn ghost" onClick={() => { const n = prompt('New employee name'); if (n) addEmployee(n.trim()) }}>+ Employee</button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div></div>
      <div className="seg">{Object.entries(CATS).map(([k, l]) => <button key={k} className={cat === k ? 'on' : ''} onClick={() => setCat(k)}>{k === 'icecream' ? '🍦' : '🥘'} {l}{items.some((i) => i.category === k) ? ' •' : ''}</button>)}</div>
      <div className="billgrid">
        <div>
          <input className="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="tiles">{db.varieties.filter((v) => v.category === cat && v.name.toLowerCase().includes(q.toLowerCase())).map((v) => { const r = rateFor(db, emp, v); const ice = cat === 'icecream'; return (
            <div key={v.id} className={'tile' + (qty[v.id] > 0 ? ' sel' : '')}>
              <div className="tn">{v.name}</div><div className="tp">Pays {money(r.empRate)} · sells {money(r.sellRate)}{r.custom ? ' ★' : ''}</div>
              <div className="qty"><button onClick={() => change(v.id, ice ? -5 : -1)}>−</button>
                <input type="number" step="any" inputMode="decimal" value={qty[v.id] || ''} placeholder="0" onChange={(e) => setQty({ ...qty, [v.id]: Math.max(0, +e.target.value) })} />
                <button onClick={() => change(v.id, ice ? 5 : 1)}>+</button></div>
              <div className="box">{ice ? <><button onClick={() => change(v.id, 1)}>+1</button><button onClick={() => change(v.id, v.pcsPerBox)}>+1 box ({v.pcsPerBox})</button></>
                : <><button onClick={() => change(v.id, 0.5)}>+0.5</button><button onClick={() => change(v.id, 10)}>+10</button></>}</div>
            </div>) })}</div>
          <p className="hint">★ = special rate set for this employee</p>
        </div>
        <div className="card sticky"><h3>Bill summary</h3>
          {items.length === 0 ? <p className="hint">Tap quantities to build the bill. You can mix Ice Cream and Idiyappam in one bill.</p> :
            <table className="mini"><tbody>{items.map((i) => <tr key={i.varietyId}><td>{i.name}</td><td>{i.qty} × {i.empRate}</td><td>{money(i.qty * i.empRate)}</td></tr>)}</tbody></table>}
          <div className="sumrow"><span>Pieces</span><b>{t.qty}</b></div>
          <div className="sumrow big"><span>Employee pays</span><b>{money(t.pay)}</b></div>
          <div className="sumrow"><span>Employee sells for</span><b>{money(t.sales)}</b></div>
          <div className="sumrow pos"><span>Employee profit</span><b>{money(t.empProfit)}</b></div>
          <div className="sumrow pos"><span>Company profit</span><b>{money(t.coProfit)}</b></div>
          <button className="btn wide" onClick={save}>Save bill</button></div>
      </div>
      <div className="paybar"><div><small>{t.qty} pcs · employee pays</small><b>{money(t.pay)}</b></div><button className="btn" onClick={save}>Save bill</button></div>
      <div className="card"><h3>Recent bills</h3><table className="rt"><thead><tr><th>Date</th><th>Employee</th><th>Items</th><th>Pieces</th><th>Amount</th><th></th></tr></thead>
        <tbody>{recent.map((b) => { const s = sumItems(b.items); return <tr key={b.id}><td>{b.date}</td><td>{db.employees.find((e) => e.id === b.employeeId)?.name}</td>
          <td className="small">{b.items.map((i) => `${i.name || name(i.varietyId)} ${i.qty}`).join(', ')}</td><td>{s.qty}</td><td>{money(s.pay)}</td>
          <td><button className="link" onClick={() => confirm('Delete this bill?') && deleteBill(b.id)}>✕</button></td></tr> })}</tbody></table></div>
    </>
  )
}
