import React, { useEffect, useState } from 'react'
import { Ctx, useStore } from './ctx.js'
import { migrate } from './migrate.js'
export { useStore }
import { collection, deleteDoc, deleteField, doc, onSnapshot, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import seed from './seed.json'
import { cloud, fdb } from './firebase.js'

const KEY = 'icecream-db-v2', OLD = 'icecream-db-v1'
const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)

const loadLocal = () => { try { const s = localStorage.getItem(KEY) || localStorage.getItem(OLD); return migrate(s ? JSON.parse(s) : seed) } catch { return migrate(seed) } }

/* ---------------- LOCAL MODE (browser storage) ---------------- */
function LocalProvider({ children }) {
  const [db, setDb] = useState(loadLocal)
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(db)), [db])
  const up = (k, fn) => setDb((d) => ({ ...d, [k]: fn(d[k]) }))
  const api = {
    db, cloud: false, ready: true,
    addVariety: (v) => up('varieties', (l) => [...l, { ...v, id: uid('v') }]),
    updateVariety: (id, v) => up('varieties', (l) => l.map((x) => (x.id === id ? { ...x, ...v } : x))),
    deleteVariety: (id) => up('varieties', (l) => l.filter((x) => x.id !== id)),
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

/* ---------------- CLOUD MODE (Firestore, live sync) ---------------- */
const COLS = ['varieties', 'employees', 'bills', 'payments']
function CloudProvider({ children }) {
  const [db, setDb] = useState({ varieties: [], employees: [], bills: [], payments: [], rates: {} })
  const [loaded, setLoaded] = useState({})
  useEffect(() => {
    const mark = (c) => setLoaded((l) => ({ ...l, [c]: true }))
    const fail = (e) => alert('Database error: ' + e.message)
    const subs = COLS.map((c) => onSnapshot(collection(fdb, c), (snap) => {
      const rows = snap.docs.map((x) => ({ ...x.data(), id: x.id })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setDb((d) => ({ ...d, [c]: c === 'varieties' ? rows.map((v) => ({ category: 'icecream', ...v })) : rows })); mark(c)
    }, fail))
    subs.push(onSnapshot(collection(fdb, 'rates'), (snap) => { setDb((d) => ({ ...d, rates: Object.fromEntries(snap.docs.map((x) => [x.id, x.data()])) })); mark('rates') }, fail))
    return () => subs.forEach((u) => u())
  }, [])
  const run = (p) => p.catch((e) => alert('Save failed: ' + e.message))
  const put = (c, id, data) => run(setDoc(doc(fdb, c, id), data))
  const importData = async () => {           // one-time: copy this browser's data (or the Excel data) into Firestore
    const s = loadLocal(), ops = []
    s.varieties.forEach((v, i) => ops.push([doc(fdb, 'varieties', v.id), { ...v, order: i }]))
    s.employees.forEach((e, i) => ops.push([doc(fdb, 'employees', e.id), { ...e, order: i }]))
    s.bills.forEach((b) => ops.push([doc(fdb, 'bills', b.id), b]))
    s.payments.forEach((p) => ops.push([doc(fdb, 'payments', p.id), p]))
    Object.entries(s.rates).forEach(([e, m]) => ops.push([doc(fdb, 'rates', e), m]))
    for (let i = 0; i < ops.length; i += 400) { const b = writeBatch(fdb); ops.slice(i, i + 400).forEach(([r, d]) => b.set(r, d)); await b.commit() }
  }
  const api = {
    db, cloud: true, ready: [...COLS, 'rates'].every((c) => loaded[c]), importData,
    addVariety: (v) => put('varieties', uid('v'), { ...v, order: Date.now() }),
    updateVariety: (id, v) => run(updateDoc(doc(fdb, 'varieties', id), v)),
    deleteVariety: (id) => run(deleteDoc(doc(fdb, 'varieties', id))),
    setRate: (empId, varId, patch) => run(setDoc(doc(fdb, 'rates', empId), { [varId]: patch }, { merge: true })),
    clearRate: (empId, varId) => run(updateDoc(doc(fdb, 'rates', empId), { [varId]: deleteField() })),
    addEmployee: (name) => put('employees', uid('e'), { name, order: Date.now() }),
    deleteEmployee: (id) => run(deleteDoc(doc(fdb, 'employees', id))),
    addBill: (b) => put('bills', uid('b'), b),
    deleteBill: (id) => run(deleteDoc(doc(fdb, 'bills', id))),
    addPayment: (p) => put('payments', uid('p'), p),
    deletePayment: (id) => run(deleteDoc(doc(fdb, 'payments', id))),
  }
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
export const StoreProvider = cloud ? CloudProvider : LocalProvider