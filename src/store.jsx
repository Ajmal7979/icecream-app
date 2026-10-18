import React, { createContext, useContext, useEffect, useState } from 'react'
import seed from './seed.json'

const KEY = 'icecream-db-v2', OLD = 'icecream-db-v1'
// Adds category + per-employee rates to older saved data, keeps everything the user already entered.
function migrate(d) {
  const varieties = d.varieties.map((v) => ({ category: 'icecream', ...v }))
  seed.varieties.filter((v) => v.category === 'idiyappam' && !varieties.some((x) => x.id === v.id)).forEach((v) => varieties.push(v))
  const cat = Object.fromEntries(varieties.map((v) => [v.id, v.category]))
  const rates = {}
  for (const [e, m] of Object.entries(d.rates || {})) for (const [vid, o] of Object.entries(m)) {
    const v = varieties.find((x) => x.id === vid); if (!v) continue
    const p = {}
    if (o.empRate !== undefined && o.empRate !== v.empRate) p.empRate = o.empRate
    if (o.sellRate !== undefined && o.sellRate !== v.sellRate) p.sellRate = o.sellRate
    if (Object.keys(p).length) { rates[e] = rates[e] || {}; rates[e][vid] = p }
  }
  return { ...d, varieties, rates, bills: d.bills.map((b) => ({ ...b, items: b.items.map((i) => ({ category: cat[i.varietyId] || 'icecream', ...i })) })) }
}
// STORAGE LAYER: today = browser localStorage. For Firebase, replace load()/save() with Firestore reads/writes.
const load = () => { try { const s = localStorage.getItem(KEY) || localStorage.getItem(OLD); return migrate(s ? JSON.parse(s) : seed) } catch { return migrate(seed) } }
const save = (d) => localStorage.setItem(KEY, JSON.stringify(d))
const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)

const Ctx = createContext()
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [db, setDb] = useState(load)
  useEffect(() => save(db), [db])
  const up = (k, fn) => setDb((d) => ({ ...d, [k]: fn(d[k]) }))
  const api = {
    db,
    addVariety: (v) => up('varieties', (l) => [...l, { ...v, id: uid('v') }]),
    updateVariety: (id, v) => up('varieties', (l) => l.map((x) => (x.id === id ? { ...x, ...v } : x))),
    deleteVariety: (id) => up('varieties', (l) => l.filter((x) => x.id !== id)),
    // per-employee rate override: { empRate, sellRate } for one product
    setRate: (empId, varId, patch) => up('rates', (m) => ({ ...m, [empId]: { ...m[empId], [varId]: { ...m[empId]?.[varId], ...patch } } })),
    clearRate: (empId, varId) => up('rates', (m) => { const e = { ...m[empId] }; delete e[varId]; return { ...m, [empId]: e } }),
    addEmployee: (name) => up('employees', (l) => [...l, { id: uid('e'), name }]),
    deleteEmployee: (id) => up('employees', (l) => l.filter((x) => x.id !== id)),
    addBill: (b) => up('bills', (l) => [...l, { ...b, id: uid('b') }]),
    deleteBill: (id) => up('bills', (l) => l.filter((x) => x.id !== id)),
    addPayment: (p) => up('payments', (l) => [...l, { ...p, id: uid('p') }]),
    deletePayment: (id) => up('payments', (l) => l.filter((x) => x.id !== id)),
    resetToExcel: () => setDb(migrate(seed)),
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
