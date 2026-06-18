# Arpitha — Portfolio

Personal portfolio site showcasing my software engineering and applied-data
work. Built as a fast React single-page app with a few genuinely interactive
project demos — not just screenshots.

**Live demo:** _add your Vercel URL here once deployed_

## Tech stack

- **React 18** + **Vite 6** for the build
- **Material UI v6** + **Emotion** for components and theming
- **React Router v7** for client-side routing
- **Vercel Serverless Functions** (`/api/*`) for the stock proxy and the RAG LLM call
- Deployed on **Vercel**

## Featured projects

### Bandwidth Monte Carlo Simulator
An interactive capacity-planning tool. It models a shared network link where
each user transmits at random and active users draw bandwidth from a
right-skewed lognormal distribution, then runs thousands of Monte Carlo trials
to build the distribution of peak load. Drag any slider and the whole
experiment re-runs live, reporting P50 / P95 / P99 peaks and the probability
of congestion. The simulation engine (`src/lib/montecarlo.js`) is
dependency-free — a seeded mulberry32 PRNG, Box–Muller normals, and a
lognormal sampler — and the histogram is hand-drawn on an HTML5 canvas, so it
all runs client-side with no backend.

### Portfolio RAG Assistant
A retrieval-augmented generation assistant you can actually query. It retrieves
the most relevant passages from a knowledge base about my work using an
in-browser TF-IDF + cosine-similarity engine, then answers with the sources
cited. Generation runs through a Vercel serverless function (so the API key
never reaches the client) and gracefully falls back to an on-device extractive
answer when no key is configured — the demo always works.

### ASX Top 50 Stock Tracker
Live data viewer for the largest ASX-listed companies, sortable by price and
market cap. A Vercel serverless function proxies Financial Modeling Prep to
keep the API key off the client; without a key it falls back to mock data.

### QR Code Generator
Generate a QR code from any URL or text and download it as a PNG. Pure
client-side — no backend, no tracking. Demonstrates SVG → Canvas → PNG
rasterisation in the browser.

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server (frontend only)
npm run dev
# → http://localhost:5173

# 3. (Optional) run the serverless functions locally
npm i -g vercel
vercel dev
# → http://localhost:3000  (Vite proxies /api/* here)
```

If you don't run `vercel dev`, the stock tracker falls back to mock data and
the RAG assistant falls back to on-device retrieval — the rest of the site
works normally either way. The Monte Carlo simulator and QR generator need no
backend at all.

> **Note:** this project doesn't belong inside a cloud-synced folder
> (OneDrive, Dropbox, etc.). The sync layer corrupts `node_modules` mid-install.
> Keep it somewhere local like `C:\dev\arpitha-portfolio`.

## Environment variables

Both keys are **optional** — the site works without them thanks to the
fallbacks described above. Copy `.env.example` to `.env` for local serverless
development:

```bash
# .env (do NOT commit)
FMP_API_KEY=your_financialmodelingprep_key   # live stock data (api/stocks.js)
OPENAI_API_KEY=your_openai_key               # LLM-backed RAG answers (api/rag.js)
```

For production, set the same variables in your Vercel project under
**Settings → Environment Variables**.

## Project structure

```
.
├── api/
│   ├── stocks.js              # Vercel serverless function (FMP proxy)
│   └── rag.js                 # Vercel serverless function (OpenAI proxy for RAG)
├── public/
│   ├── favicon.svg
│   └── og-image.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── data/
│   │   ├── mockStocks.js      # Fallback data when the stock API is unreachable
│   │   └── knowledgeBase.js   # Passages the RAG assistant retrieves over
│   ├── lib/
│   │   ├── montecarlo.js      # Seeded Monte Carlo bandwidth-simulation engine
│   │   └── rag.js             # TF-IDF + cosine-similarity retrieval engine
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Projects.jsx
│   │   ├── Contact.jsx
│   │   ├── NotFound.jsx
│   │   └── projects/
│   │       ├── BandwidthSimulator.jsx
│   │       ├── RagAssistant.jsx
│   │       ├── StockTracker.jsx
│   │       └── QRGenerator.jsx
│   ├── App.jsx                # Routes
│   ├── config.js              # Profile, social, skills, projects (single source of truth)
│   ├── index.css              # Global styles
│   ├── main.jsx               # Entry point
│   └── theme.js               # MUI theme
├── index.html
├── package.json
├── vercel.json                # SPA fallback for client-side routing
└── vite.config.js
```

## Customising

Most personalisation lives in **`src/config.js`** — name, social links, skills,
and the project list. Update that file and the whole site reflects the changes.
Remember to replace the placeholder `github.com/your-username` and LinkedIn
handle with your real links.

## Deployment

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main

# 2. Import the repo at vercel.com → Add New → Project.
#    Vercel auto-detects Vite and deploys both the frontend and /api/* functions.
```

Every push to `main` triggers an automatic redeploy.

## License

MIT
