# VitalLead — Patient Intake & Lead Intelligence System

A hospital patient intake and lead-scoring CRM, adapted from a sales lead-management
workflow (SalesGenie AI) into a healthcare context. Built with React, Recharts, and
PapaParse. Full project write-up: see `VitalLead_Project_Documentation.docx`.

## Features
- Patient registration & searchable lead database
- Rule-based Priority Scoring engine (Critical / High / Moderate / Routine)
- AI-style care recommendations per patient
- Auto-drafted personalised outreach emails
- Engagement/interaction timeline per patient
- Dashboard & analytics (condition mix, priority distribution, billing, test outcomes)
- CSV import — schema matches Kaggle's public "Healthcare Dataset" (55,500 records),
  so you can drop the real dataset in to replace the bundled demo data

## Tech stack
React 18 · Vite · Recharts · lucide-react · PapaParse · Tailwind (via CDN)

---

## Option A — Deploy with Vercel (recommended, works entirely from your phone)

1. Push this project to a GitHub repo (see below).
2. On your phone browser, go to vercel.com → sign in with GitHub.
3. Tap **Add New → Project**, select this repo.
4. Leave all settings as default (Vercel auto-detects Vite) → tap **Deploy**.
5. Vercel installs dependencies and builds it for you — no local `npm install` needed.
6. You'll get a live link like `vitallead.vercel.app` in a couple of minutes.

## Option B — Deploy with GitHub Pages

GitHub Pages only serves static files, so this project needs to be **built** first.
Since building requires `npm install` (which needs a computer, not just the phone
GitHub app), the easiest route is still Option A (Vercel) or building once on any
laptop/cyber cafe:
```
npm install
npm run build
```
This creates a `dist/` folder — upload the **contents** of `dist/` to a `gh-pages`
branch (or use the `dist` contents as your repo's Pages source).

---

## Uploading this project to GitHub from your phone

Using your usual workflow:
1. Download this project as a zip.
2. Extract it with **Files by Google**.
3. On github.com (mobile browser), create a new repo `vitallead`.
4. Use **Add file → Upload files**, then select the **contents** of the extracted
   folder (not the folder itself) — src/, package.json, index.html, vite.config.js,
   .gitignore, README.md — and upload.
5. Commit directly to `main`.

## Using the real Kaggle dataset

1. On Kaggle, search "Healthcare Dataset" (by prasad22) and download the CSV.
2. Open the deployed site → sidebar → **Import CSV** → select the file.
3. All 55,500 records load in, replacing the demo data — scoring and analytics
   recalculate automatically.
