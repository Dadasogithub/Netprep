# NetPrep — IBPS SO IT Officer Networking Mock Test Platform

A fully offline, frontend-only premium learning platform for **IBPS SO IT Officer (Professional Knowledge — Computer Networking)** preparation. Built with React, Tailwind CSS v4, and browser Local Storage — no backend, no database.

## What's included

- **148 original, fully-explained MCQs** across every syllabus topic (Network Fundamentals, OSI/TCP-IP, IPv4/IPv6/Subnetting/CIDR, Routing & Switching, Transport/Application protocols & ports, Security, WAN/Wireless, Cloud/SDN, and applied banking network scenarios). Every question includes: 4 options, correct answer, a full explanation, an explanation for **each** incorrect option, topic, subtopic, difficulty (Easy/Moderate/Hard), estimated solving time, a memory trick (where useful), and an exam tip.
- **Dashboard** — completion %, accuracy, streak, strong/weak topics, recent mock scores.
- **Practice Mode** — Topic-wise, Difficulty-wise, Random, Weak Topics, Bookmarked, Incorrect-only, plus search. Keyboard shortcuts (1-4 to answer, arrow keys to navigate).
- **Mock Test Engine** — 50 random questions with no repeats until the bank is exhausted, configurable timer (30/40/50 min), question palette with flag-for-review, auto-submit, full results screen with topic breakdown and a filterable answer review.
- **Analytics** — topic accuracy bar chart, difficulty distribution pie chart, mock score trend line chart, and a "frequently missed concepts" list.
- **Bookmarks** — save any question mid-practice, revisit/drill them later.
- **Settings** — light/dark mode, keyboard shortcut toggle, export progress as JSON, full local-data reset.
- **100% offline after first load.** All state (attempts, bookmarks, mock history, streak, settings) lives in `localStorage` via a single service layer (`src/services/storageService.js`) so a real backend could be swapped in later with minimal changes.

## Deploying for free

This is a static, frontend-only app (no backend, no database) — your data lives in each visitor's own browser Local Storage, so it works identically no matter where it's hosted. Easiest options:

**Netlify (drag & drop, zero setup)**
1. Run `npm run build` locally — this creates a `dist/` folder.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `dist/` folder in.
3. Done — you get a live URL immediately. The included `public/_redirects` file (copied into `dist/` on build) makes sure page refreshes on routes like `/practice` or `/mock` work correctly instead of 404ing.

**Vercel (connect to GitHub, auto-deploys on push)**
1. Push this project to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo. It auto-detects Vite — no config needed.
3. The included `vercel.json` handles client-side routing so all routes resolve correctly.

**Cloudflare Pages**
1. Push to GitHub, then connect the repo at [pages.cloudflare.com](https://pages.cloudflare.com).
2. Build command: `npm run build`, output directory: `dist`.
3. The same `_redirects` file is picked up automatically.

**GitHub Pages** works too, but needs two extra tweaks since it serves from a subpath and has no server-side rewrite support:
- Set `base: '/your-repo-name/'` in `vite.config.js`.
- Switch `BrowserRouter` to `HashRouter` in `src/App.jsx` (URLs become `#/practice` instead of `/practice`) — this sidesteps the need for server-side redirects entirely.

## Getting started

```bash
npm install
npm run dev       # start local dev server
npm run build     # production build -> dist/
npm run preview   # preview the production build
```

Then open the printed local URL in your browser.

## Project structure

```
src/
├── data/networking/       # the question bank, one module per topic cluster
│   ├── fundamentals.js
│   ├── osiTcpip.js
│   ├── addressing.js
│   ├── routingSwitching.js
│   ├── transportApp.js
│   ├── security.js
│   ├── wanWireless.js
│   ├── cloudSdn.js
│   ├── scenarios.js
│   └── index.js            # combines all modules into one array
├── services/
│   ├── storageService.js   # all localStorage reads/writes live here
│   └── questionService.js  # filtering, selection, analytics derived from the bank + storage
├── context/ThemeContext.jsx
├── components/             # Layout, QuestionCard, Timer, NetworkMesh, shared UI primitives
└── pages/                  # Dashboard, Practice, MockTest, Analytics, Bookmarks, Settings
```

## Extending the question bank

The brief calls for 400-500 questions; this build ships **148** high-quality, fully-original ones as a strong, working foundation across every listed topic — generating hundreds more in a single pass risked shallow, repetitive content. To grow the bank:

1. Add a new array of question objects to an existing file in `src/data/networking/`, or create a new topic file following the same schema (see any existing file for the exact shape: `id`, `topic`, `subtopic`, `difficulty`, `question`, `options`, `correctAnswer`, `explanation`, `incorrectExplanations`, `estimatedTime`, `memoryTrick`, `examTip`).
2. Keep `id` prefixes unique per file (e.g. `FND-016`, `SEC-021`) to avoid collisions — the app assumes globally unique IDs.
3. If you added a new file, import and spread it into `src/data/networking/index.js`.
4. No other code changes are needed — Dashboard, Practice, Mock Test, and Analytics all read from the combined bank automatically.

Just ask and I can generate additional batches (e.g. 50 more on Subnetting, or a fresh 100-question batch on Security) directly into this same structure.

## Notes

- No backend, database, or external API calls are used anywhere in this app — it fully satisfies the "frontend-only, offline-capable" requirement.
- Dark mode is the default theme; toggle in the sidebar or Settings.
