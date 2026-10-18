import { CATS, allItems, billsOf, sumItems } from './utils.js'
const r2 = (n) => Math.round((n || 0) * 100) / 100
const nums = (s) => [s.qty, s.cost, s.pay, s.sales, s.coProfit, s.empProfit].map(r2)
const H = ['Pieces', 'Company cost', 'Employee pay (sales)', 'Customer sales', 'Company profit', 'Employee profit']

export function buildSheets(db, month) {
  const bills = billsOf(db, month), items = allItems(bills), t = sumItems(items)
  const ename = (id) => db.employees.find((e) => e.id === id)?.name || '—'
  const vmap = Object.fromEntries(db.varieties.map((v) => [v.id, v]))
  const pays = db.payments.filter((p) => p.date.startsWith(month))
  const paidAll = pays.reduce((a, p) => a + p.amount, 0)
  const byCat = Object.entries(CATS).map(([k, label]) => [label, ...nums(sumItems(items.filter((i) => (i.category || 'icecream') === k)))])

  const Summary = [
    ['MONTHLY REPORT', month], [],
    ['Total pieces', r2(t.qty)], ['Company cost of goods (Rate Company)', r2(t.cost)], ['Sales to employees (Rate)', r2(t.pay)],
    ['Customer sales (Rate Work)', r2(t.sales)], ['TOTAL COMPANY PROFIT', r2(t.coProfit)], ['TOTAL EMPLOYEE PROFIT', r2(t.empProfit)],
    ['Payments received (Bayar)', r2(paidAll)], ['Balance due from employees', r2(t.pay - paidAll)], [],
    ['By category', ...H], ...byCat, ['TOTAL', ...nums(t)],
  ]
  const ByVariety = [['Product', 'Category', ...H],
    ...db.varieties.map((v) => [v, sumItems(items.filter((i) => i.varietyId === v.id))]).filter(([, s]) => s.qty > 0).map(([v, s]) => [v.name, CATS[v.category] || v.category, ...nums(s)]),
    ['TOTAL', '', ...nums(t)]]
  const ByEmployee = [['Employee', 'Pieces', 'Company cost', 'Employee pays (owes)', 'Paid', 'Balance', 'Customer sales', 'Employee profit', 'Company profit'],
    ...db.employees.map((e) => { const s = sumItems(items.filter((i) => i.employeeId === e.id)); const p = pays.filter((x) => x.employeeId === e.id).reduce((a, x) => a + x.amount, 0)
      return [e.name, r2(s.qty), r2(s.cost), r2(s.pay), r2(p), r2(s.pay - p), r2(s.sales), r2(s.empProfit), r2(s.coProfit)] }),
    ['TOTAL', r2(t.qty), r2(t.cost), r2(t.pay), r2(paidAll), r2(t.pay - paidAll), r2(t.sales), r2(t.empProfit), r2(t.coProfit)]]
  const dates = [...new Set(bills.map((b) => b.date))].sort()
  const ByDay = [['Date', ...H], ...dates.map((d) => [d, ...nums(sumItems(allItems(bills.filter((b) => b.date === d))))]), ['TOTAL', ...nums(t)]]
  const Details = [['Date', 'Employee', 'Category', 'Product', 'Qty', 'Rate Company', 'Rate (employee)', 'Rate Work (customer)', 'Company cost', 'Employee pay', 'Customer sales', 'Company profit', 'Employee profit'],
    ...items.sort((a, b) => a.date.localeCompare(b.date)).map((i) => [i.date, ename(i.employeeId), CATS[i.category || 'icecream'], i.name || vmap[i.varietyId]?.name || '—', i.qty, i.cost, i.empRate, i.sellRate,
      r2(i.qty * i.cost), r2(i.qty * i.empRate), r2(i.qty * i.sellRate), r2(i.qty * (i.empRate - i.cost)), r2(i.qty * (i.sellRate - i.empRate))]),
    ['TOTAL', '', '', '', r2(t.qty), '', '', '', r2(t.cost), r2(t.pay), r2(t.sales), r2(t.coProfit), r2(t.empProfit)]]
  const Payments = [['Date', 'Employee', 'Amount'], ...pays.sort((a, b) => a.date.localeCompare(b.date)).map((p) => [p.date, ename(p.employeeId), p.amount]), ['TOTAL', '', r2(paidAll)]]
  return { Summary, 'By Product': ByVariety, 'By Employee': ByEmployee, 'By Day': ByDay, 'Bill Details': Details, Payments }
}

export async function exportXlsx(db, month) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  for (const [name, rows] of Object.entries(buildSheets(db, month))) {
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = rows.reduce((w, r) => { r.forEach((c, i) => { w[i] = Math.min(40, Math.max(w[i] || 8, String(c ?? '').length + 2)) }); return w }, []).map((wch) => ({ wch }))
    XLSX.utils.book_append_sheet(wb, ws, name)
  }
  XLSX.writeFile(wb, `report-${month}.xlsx`)
}
