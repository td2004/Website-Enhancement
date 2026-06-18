// Vercel serverless function: GET /api/stocks
//
// Proxies Financial Modeling Prep so the API key never touches the browser.
// Returns the top 50 ASX-listed stocks by market cap.
//
// Required environment variable on Vercel: FMP_API_KEY
//
// To run locally:
//   npm i -g vercel
//   vercel dev    # serves /api/* on http://localhost:3000

const CACHE_TTL_MS = 60_000; // 1 minute cache to stay polite with the free tier
let cache = { at: 0, data: null };

export default async function handler(req, res) {
  // Allow only GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Serve from cache if fresh
  if (cache.data && Date.now() - cache.at < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(cache.data);
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return res
      .status(503)
      .json({ error: 'FMP_API_KEY not configured on the server' });
  }

  try {
    // 1) Get the list of ASX-listed companies
    const listUrl = `https://financialmodelingprep.com/api/v3/symbol/ASX?apikey=${apiKey}`;
    const listResp = await fetch(listUrl);
    if (!listResp.ok) {
      throw new Error(`Upstream ${listResp.status}`);
    }
    const list = await listResp.json();

    // 2) Pick top 50 by market cap (some entries have null caps)
    const top = (Array.isArray(list) ? list : [])
      .filter((s) => s.symbol && s.marketCap)
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 50);

    // 3) Get richer quote data for those symbols (price, change %)
    const symbols = top.map((s) => s.symbol).join(',');
    const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=${apiKey}`;
    const quoteResp = await fetch(quoteUrl);
    const quotes = quoteResp.ok ? await quoteResp.json() : [];

    // 4) Merge: prefer quote data for price/change, list data for sector
    const byListSymbol = new Map(top.map((s) => [s.symbol, s]));
    const merged = quotes.map((q) => {
      const meta = byListSymbol.get(q.symbol) || {};
      return {
        symbol: q.symbol,
        name: q.name || meta.name,
        sector: meta.sector || meta.industry || null,
        price: q.price ?? meta.price,
        changesPercentage: q.changesPercentage ?? null,
        marketCap: q.marketCap ?? meta.marketCap,
      };
    });

    cache = { at: Date.now(), data: merged };
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(merged);
  } catch (err) {
    console.error('stocks api failed:', err);
    return res
      .status(502)
      .json({ error: 'Failed to fetch upstream data', detail: err.message });
  }
}
