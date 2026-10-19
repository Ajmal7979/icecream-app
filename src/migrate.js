import seed from './seed.json'
export { seed }
// Adds category + per-employee rates to older saved data, keeps everything the user already entered.
export function migrate(d) {
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