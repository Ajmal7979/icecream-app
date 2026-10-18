import React, { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../store.jsx'
import { CATS, allItems, billsOf, money, sumItems, today } from '../utils.js'

export const Stat = ({ label, value, tone }) => <div className={'card stat ' + (tone || '')}><div className="lbl">{label}</div><div className="val">{value}</div></div>

export default function Dashboard() {
  const { db } = useStore()
  const [month, setMonth] = useState(today().slice(0, 7))
  const bills = billsOf(db, month)
  const t = sumItems(allItems(bills))
  const days = new Date(+month.slice(0, 4), +month.slice(5, 7), 0).getDate()
  const perDay = Array.from({ length: days }, (_, k) => {
    const d = `${month}-${String(k + 1).padStart(2, '0')}`
    const s = sumItems(allItems(bills.filter((b) => b.date === d)))
    return { day: k + 1, sales: +s.pay.toFixed(2), profit: +s.coProfit.toFixed(2) }
  })
  const todayS = sumItems(allItems(bills.filter((b) => b.date === today())))
  const perEmp = db.employees.map((e) => {
    const s = sumItems(allItems(bills.filter((b) => b.employeeId === e.id)))
    const paid = db.payments.filter((p) => p.employeeId === e.id && p.date.startsWith(month)).reduce((a, p) => a + p.amount, 0)
    return { e, s, paid }
  })
  return (
    <>
      <div className="head"><h1>Dashboard</h1><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
      <div className="grid4">
        <Stat label="Month sales (to employees)" value={money(t.pay)} />
        <Stat label="Company profit" value={money(t.coProfit)} tone="green" />
        <Stat label="Employees' profit" value={money(t.empProfit)} tone="blue" />
        <Stat label="Pieces sold" value={t.qty.toLocaleString('en-IN')} />
      </div>
      <div className="card"><h3>Per-day sales <small>Today: {money(todayS.pay)}</small></h3>
        <div style={{ height: 280 }}><ResponsiveContainer><BarChart data={perDay}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="day" /><YAxis /><Tooltip formatter={(v) => money(v)} labelFormatter={(d) => `Day ${d}`} />
          <Bar dataKey="sales" name="Sales" fill="#6c5ce7" radius={[4, 4, 0, 0]} /><Bar dataKey="profit" name="Company profit" fill="#00b894" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
      <div className="card"><h3>By employee</h3>
        <table className="rt"><thead><tr><th>Employee</th><th>Pieces</th><th>Owes company</th><th>Paid</th><th>Balance</th><th>Employee profit</th><th>Company profit</th></tr></thead>
          <tbody>{perEmp.map(({ e, s, paid }) => <tr key={e.id}><td>{e.name}</td><td>{s.qty}</td><td>{money(s.pay)}</td><td>{money(paid)}</td><td className={s.pay - paid > 0 ? 'neg' : 'pos'}>{money(s.pay - paid)}</td><td>{money(s.empProfit)}</td><td>{money(s.coProfit)}</td></tr>)}</tbody></table></div>
      <div className="card"><h3>By category</h3>
        <table className="rt"><thead><tr><th>Category</th><th>Pieces</th><th>Sales</th><th>Employee profit</th><th>Company profit</th></tr></thead>
          <tbody>{Object.entries(CATS).map(([k, l]) => { const s = sumItems(allItems(bills).filter((i) => (i.category || 'icecream') === k)); return <tr key={k}><td>{l}</td><td>{s.qty}</td><td>{money(s.pay)}</td><td>{money(s.empProfit)}</td><td>{money(s.coProfit)}</td></tr> })}</tbody></table></div>
    </>
  )
}
