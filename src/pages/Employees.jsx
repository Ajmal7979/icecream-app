import React, { useState } from 'react'
import { useStore } from '../store.jsx'
import { CATS, allItems, billsOf, money, sumItems, today } from '../utils.js'

export default function Employees() {
  const { db, addEmployee, deleteEmployee, addPayment, deletePayment } = useStore()
  const [name, setName] = useState('')
  const [month, setMonth] = useState(today().slice(0, 7))
  const [pay, setPay] = useState({})
  return (
    <>
      <div className="head"><h1>Employees</h1><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
      <form className="card form" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { addEmployee(name.trim()); setName('') } }}>
        <input placeholder="New employee name" value={name} onChange={(e) => setName(e.target.value)} /><button className="btn">+ Add employee</button></form>
      {db.employees.map((e) => {
        const bills = billsOf(db, month, e.id).sort((a, b) => a.date.localeCompare(b.date))
        const s = sumItems(allItems(bills))
        const pays = db.payments.filter((p) => p.employeeId === e.id && p.date.startsWith(month))
        const paid = pays.reduce((a, p) => a + p.amount, 0)
        return (
          <div className="card" key={e.id}>
            <div className="head"><h3>{e.name}</h3><button className="link" onClick={() => confirm(`Remove ${e.name}? Bills are kept.`) && deleteEmployee(e.id)}>Remove</button></div>
            <div className="grid4">
              <div className="mstat"><span>Pieces</span><b>{s.qty}</b></div><div className="mstat"><span>Owes company</span><b>{money(s.pay)}</b></div>
              <div className="mstat"><span>Paid</span><b>{money(paid)}</b></div><div className={'mstat ' + (s.pay - paid > 0 ? 'neg' : 'pos')}><span>Balance</span><b>{money(s.pay - paid)}</b></div>
              <div className="mstat"><span>Employee profit</span><b>{money(s.empProfit)}</b></div><div className="mstat"><span>Company profit from</span><b>{money(s.coProfit)}</b></div></div>
            <p className="small">{Object.entries(CATS).map(([k, l]) => { const c = sumItems(allItems(bills).filter((i) => (i.category || 'icecream') === k)); return <span key={k} className="chip">{l}: {c.qty} pcs · {money(c.pay)}</span> })}</p>
            <form className="row" onSubmit={(ev) => { ev.preventDefault(); if (+pay[e.id] > 0) { addPayment({ employeeId: e.id, date: today(), amount: +pay[e.id] }); setPay({ ...pay, [e.id]: '' }) } }}>
              <input type="number" placeholder="Payment received (Bayar)" value={pay[e.id] || ''} onChange={(ev) => setPay({ ...pay, [e.id]: ev.target.value })} /><button className="btn ghost">Record payment</button></form>
            <table className="rt"><thead><tr><th>Date</th><th>Pieces</th><th>Pay</th><th>Emp. profit</th><th>Co. profit</th></tr></thead>
              <tbody>{bills.map((b) => { const x = sumItems(b.items); return <tr key={b.id}><td>{b.date}</td><td>{x.qty}</td><td>{money(x.pay)}</td><td>{money(x.empProfit)}</td><td>{money(x.coProfit)}</td></tr> })}</tbody></table>
            {pays.length > 0 && <p className="small">Payments: {pays.map((p) => <span key={p.id} className="chip">{p.date.slice(8)} · {money(p.amount)} <button className="link" onClick={() => deletePayment(p.id)}>✕</button></span>)}</p>}
          </div>)
      })}
    </>
  )
}
