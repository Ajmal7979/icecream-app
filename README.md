# Ice Cream Wholesale App

## Run locally
    npm install
    npm run dev        # http://localhost:5173

Data is stored in your browser (localStorage) and pre-loaded from SEPTEMBER_26.xlsx (`src/seed.json`).
Re-import from a new Excel: `python scripts/extract_seed.py YOUR_FILE.xlsx`

## New in v2
- Rates page: pick an employee to give them their own Rate / Rate Work (old bills unchanged)
- Idiyappam category (separate products + rates, same employee can bill both)
- Reports -> Export Excel = multi-sheet .xlsx (Summary, By Product, By Employee, By Day, Bill Details, Payments) with totals
- Phone layout: bottom nav, card-style tables, sticky Save bar on Bill

## Formulas (same as the Excel)
- Employee pays company = qty x Rate
- Employee sales        = qty x Rate Work
- Employee profit       = qty x (Rate Work - Rate)
- Company profit        = qty x (Rate - Rate Company)

## Later: Firebase + Vercel
1. Firebase console -> create project -> Firestore. `npm i firebase`
2. In `src/store.jsx` replace load()/save() with Firestore reads/writes (one collection per key: varieties, employees, bills, payments).
3. Push to GitHub -> vercel.com -> Import -> Framework: Vite -> add Firebase keys as VITE_ env vars -> Deploy.
