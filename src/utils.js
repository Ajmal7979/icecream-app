// Same maths as the Excel sheet:
//  Employee pay     = qty x Rate          (what the employee owes the company)
//  Employee sales   = qty x Rate Work     (what the employee collects from customers)
//  Employee profit  = qty x (Rate Work - Rate)
//  Company profit   = qty x (Rate - Rate Company)
export const money = (n) => '₹' + (Math.round((n || 0) * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
export const today = () => new Date().toISOString().slice(0, 10)
export const monthOf = (d) => d.slice(0, 7)
export function lineTotals(i) {
  return { pay: i.qty * i.empRate, sales: i.qty * i.sellRate, cost: i.qty * i.cost,
    empProfit: i.qty * (i.sellRate - i.empRate), coProfit: i.qty * (i.empRate - i.cost) }
}
export function sumItems(items) {
  return items.reduce((a, i) => { const t = lineTotals(i); return { qty: a.qty + i.qty, pay: a.pay + t.pay, sales: a.sales + t.sales, cost: a.cost + t.cost, empProfit: a.empProfit + t.empProfit, coProfit: a.coProfit + t.coProfit } },
    { qty: 0, pay: 0, sales: 0, cost: 0, empProfit: 0, coProfit: 0 })
}
export const billsOf = (db, month, empId) => db.bills.filter((b) => monthOf(b.date) === month && (!empId || b.employeeId === empId))
export const allItems = (bills) => bills.flatMap((b) => b.items.map((i) => ({ ...i, date: b.date, employeeId: b.employeeId })))
export function downloadCsv(name, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = name; a.click()
}
export const CATS = { icecream: 'Ice Cream', idiyappam: 'Idiyappam' }
// Rate for one employee on one product (falls back to the product's default rate)
export const rateFor = (db, empId, v) => {
  const o = db.rates?.[empId]?.[v.id]
  return { empRate: o?.empRate ?? v.empRate, sellRate: o?.sellRate ?? v.sellRate, custom: !!o }
}
