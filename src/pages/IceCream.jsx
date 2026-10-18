import React, { useState } from 'react'
import { useStore } from '../store.jsx'
import { CATS, money, rateFor } from '../utils.js'

export default function IceCream() {
  const { db, addVariety, updateVariety, deleteVariety, setRate, clearRate } = useStore()
  const [emp, setEmp] = useState('')           // '' = default rates for everyone
  const [cat, setCat] = useState('icecream')
  const [q, setQ] = useState('')
  const blank = { name: '', pcsPerBox: 24, cost: '', empRate: '', sellRate: '' }
  const [f, setF] = useState(blank)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const empObj = db.employees.find((e) => e.id === emp)
  const rows = db.varieties.filter((v) => v.category === cat && v.name.toLowerCase().includes(q.toLowerCase()))
  const special = (v) => db.employees.filter((e) => db.rates?.[e.id]?.[v.id]).map((e) => e.name)
  const rate = (v) => (emp ? rateFor(db, emp, v) : { empRate: v.empRate, sellRate: v.sellRate, custom: false })
  const edit = (v, k, val) => { if (!Number.isFinite(val) || val === rate(v)[k]) return; emp ? setRate(emp, v.id, { [k]: val }) : updateVariety(v.id, { [k]: val }) }
  const num = (v, k, val, onSave) => <input className="cell" type="number" step="0.01" key={emp + v.id + k + val} defaultValue={val} onBlur={(e) => onSave(+e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
  const submit = (e) => { e.preventDefault(); addVariety({ category: cat, name: f.name.trim(), pcsPerBox: cat === 'icecream' ? +f.pcsPerBox || 1 : 1, cost: +f.cost, empRate: +f.empRate, sellRate: +f.sellRate }); setF(blank) }
  return (
    <>
      <div className="head"><h1>Rates</h1>
        <div className="row"><select value={emp} onChange={(e) => setEmp(e.target.value)}><option value="">Default (all employees)</option>{db.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
          <input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div></div>
      <div className="banner">Showing rates for <b>{empObj ? empObj.name : 'everyone (default)'}</b>{empObj && <> — change a price here and it applies only to {empObj.name}'s bills.</>}</div>
      <div className="seg">{Object.entries(CATS).map(([k, l]) => <button key={k} className={cat === k ? 'on' : ''} onClick={() => setCat(k)}>{k === 'icecream' ? '🍦' : '🥘'} {l}</button>)}</div>
      <form className="card form" onSubmit={submit}>
        <h3>Add new {CATS[cat]} product</h3>
        <input required placeholder="Name" value={f.name} onChange={set('name')} />
        {cat === 'icecream' && <input type="number" placeholder="Pcs / box" value={f.pcsPerBox} onChange={set('pcsPerBox')} />}
        <input required type="number" step="0.01" placeholder="Company cost / pc" value={f.cost} onChange={set('cost')} />
        <input required type="number" step="0.01" placeholder="Employee rate / pc" value={f.empRate} onChange={set('empRate')} />
        <input required type="number" step="0.01" placeholder="Customer rate / pc" value={f.sellRate} onChange={set('sellRate')} />
        <button className="btn">+ Add</button>
      </form>
      <div className="card"><table className="rt">
        <thead><tr><th>Product</th>{cat === 'icecream' && <th>Pcs/box</th>}<th>Company cost (Rate Company)</th><th>Employee rate (Rate)</th><th>Customer rate (Rate Work)</th><th>Company profit/pc</th><th>Employee profit/pc</th><th></th></tr></thead>
        <tbody>{rows.map((v) => { const r = rate(v); return (
          <tr key={v.id}><td><b>{v.name}</b> {r.custom && <span className="badge">{empObj.name}</span>}{!emp && special(v).length > 0 && <span className="badge" title="These employees have their own rate for this product, so a default change won't reach them">own rate: {special(v).join(', ')}</span>}</td>
            {cat === 'icecream' && <td>{num(v, 'pcs', v.pcsPerBox, (x) => updateVariety(v.id, { pcsPerBox: x }))}</td>}
            <td>{num(v, 'cost', v.cost, (x) => updateVariety(v.id, { cost: x }))}</td>
            <td>{num(v, 'e', r.empRate, (x) => edit(v, 'empRate', x))}</td><td>{num(v, 's', r.sellRate, (x) => edit(v, 'sellRate', x))}</td>
            <td className={r.empRate - v.cost >= 0 ? 'pos' : 'neg'}>{money(r.empRate - v.cost)}</td><td className={r.sellRate - r.empRate >= 0 ? 'pos' : 'neg'}>{money(r.sellRate - r.empRate)}</td>
            <td>{r.custom ? <button className="link" onClick={() => clearRate(emp, v.id)}>Reset</button> : !emp && <button className="link" onClick={() => confirm(`Delete ${v.name}?`) && deleteVariety(v.id)}>✕</button>}</td></tr>) })}</tbody></table>
        <p className="hint">Company cost is the same for everyone. Employee/customer rates follow the selected employee. Old bills keep the price they were billed at.</p></div>
    </>
  )
}
