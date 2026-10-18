import React, { useState } from 'react'
import { useStore } from '../store.jsx'
import { CATS, allItems, billsOf, money, sumItems, today } from '../utils.js'
import { exportXlsx } from '../export.js'

export default function Reports() {
  const { db, resetToExcel } = useStore()
  const [month, setMonth] = useState(today().slice(0, 7))
  const bills = billsOf(db, month)
  const items = allItems(bills)
  const t = sumItems(items)
  const byV = db.varieties.map((v) => ({ v, s: sumItems(items.filter((i) => i.varietyId === v.id)) })).filter((x) => x.s.qty > 0)
  const byE = db.employees.map((e) => ({ e, s: sumItems(items.filter((i) => i.employeeId === e.id)) }))
  const exportAll = () => exportXlsx(db, month)
  return (
    <>
      <div className="head"><h1>Monthly Report</h1><div className="row"><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /><button className="btn" onClick={exportAll}>⬇ Export Excel</button></div></div>
      <div className="grid4">
        <div className="card stat"><div className="lbl">Cost of goods (Rate Company)</div><div className="val">{money(t.cost)}</div></div>
        <div className="card stat"><div className="lbl">Sales to employees (Rate)</div><div className="val">{money(t.pay)}</div></div>
        <div className="card stat green"><div className="lbl">Total company profit</div><div className="val">{money(t.coProfit)}</div></div>
        <div className="card stat blue"><div className="lbl">Employees' profit</div><div className="val">{money(t.empProfit)}</div></div>
      </div>
      <div className="card"><h3>By product</h3><table className="rt"><thead><tr><th>Product</th><th>Pieces</th><th>Cost</th><th>Sales</th><th>Company profit</th><th>Employee profit</th></tr></thead>
        <tbody>{byV.map(({ v, s }) => <tr key={v.id}><td>{v.name}</td><td>{s.qty}</td><td>{money(s.cost)}</td><td>{money(s.pay)}</td><td className="pos">{money(s.coProfit)}</td><td>{money(s.empProfit)}</td></tr>)}
          <tr className="tot"><td>Total</td><td>{t.qty}</td><td>{money(t.cost)}</td><td>{money(t.pay)}</td><td>{money(t.coProfit)}</td><td>{money(t.empProfit)}</td></tr></tbody></table></div>
      <div className="card"><h3>By category</h3><table className="rt"><thead><tr><th>Category</th><th>Pieces</th><th>Cost</th><th>Sales</th><th>Company profit</th><th>Employee profit</th></tr></thead>
        <tbody>{Object.entries(CATS).map(([k, l]) => { const s = sumItems(items.filter((i) => (i.category || 'icecream') === k)); return <tr key={k}><td>{l}</td><td>{s.qty}</td><td>{money(s.cost)}</td><td>{money(s.pay)}</td><td className="pos">{money(s.coProfit)}</td><td>{money(s.empProfit)}</td></tr> })}</tbody></table></div>
      <div className="card"><h3>By employee</h3><table className="rt"><thead><tr><th>Employee</th><th>Pieces</th><th>Sales</th><th>Employee profit</th><th>Company profit</th></tr></thead>
        <tbody>{byE.map(({ e, s }) => <tr key={e.id}><td>{e.name}</td><td>{s.qty}</td><td>{money(s.pay)}</td><td>{money(s.empProfit)}</td><td>{money(s.coProfit)}</td></tr>)}</tbody></table></div>
      <p className="hint"><button className="link" onClick={() => confirm('Replace all data with the original Excel data?') && resetToExcel()}>Reset data to Excel import</button></p>
    </>
  )
}
