// Vercel serverless function: GET /api/stocks
//
// Proxies Financial Modeling Prep so the API key never touches the browser.
// Returns the top 50 ASX-listed stocks by market cap.
//
// Uses FMP's current "stable" API (https://financialmodelingprep.com/stable/*),
// which replaces the deprecated legacy /api/v3/* routes.
//
// Required environment variable on Vercel: FMP_API_KEY
//
// NOTE: Non-US exchanges (like ASX) and the batch-quote endpoint may require a
// paid FMP plan. If the screener returns an error, we surface it (502) so the
// frontend can fall back to sample data; if only batch-quote is unavailable,
// we still return prices/market caps and leave "Change %" blank.
//
// To run locally:
//   npm i -g vercel
//   vercel dev    # serves /api/* on http://localhost:3000

const BASE = 'https://financialmodelingprep.com/stable';
const CACHE_TTL_MS = 60_000; // 1 minute cache to stay polite with the free tier
let cache = { at: 0, data: null };

// FMP sometimes returns errors as a JSON object rather than an array, e.g.
// { "Error Message": "..." } or { message: "..." }. Pull out a readable string.
function extractError(payload) {
  if (payload && !Array.isArray(payload) && typeof payload === 'object') {
    return payload['Error Message'] || payload.message || JSON.stringify(payload);
  }
  return null;
}

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
    // 1) Screen ASX-listed, actively-trading companies. The screener returns
    //    symbol, name, sector, price and market cap in a single call.
    const screenerUrl =
      `${BASE}/company-screener?exchange=ASX&isActivelyTrading=true` +
      `&marketCapMoreThan=100000000&limit=1000&apikey=${apiKey}`;
    const listResp = await fetch(screenerUrl);
    const list = await listResp.json();

    const listError = extractError(list);
    if (!listResp.ok || listError) {
      throw new Error(listError || `Upstream ${listResp.status}`);
    }

    // 2) Top 50 by market cap (screener has no sort param, so sort here).
    const top = (Array.isArray(list) ? list : [])
      .filter((s) => s.symbol && s.marketCap)
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 50);

    // 3) Best-effort: enrich with intraday change % via batch quotes. This
    //    endpoint may be gated on some plans, so failure here is non-fatal.
    const symbols = top.map((s) => s.symbol).join(',');
    let changeBySymbol = new Map();
    try {
      const quoteResp = await fetch(
        `${BASE}/batch-quote?symbols=${symbols}&apikey=${apiKey}`,
      );
      if (quoteResp.ok) {
        const quotes = await quoteResp.json();
        if (Array.isArray(quotes)) {
          changeBySymbol = new Map(
            quotes.map((q) => [q.symbol, q.changePercentage]),
          );
        }
      }
    } catch (quoteErr) {
      console.warn('batch-quote unavailable, skipping change %:', quoteErr.message);
    }

    // 4) Normalise to the shape the frontend expects.
    const merged = top.map((s) => ({
      symbol: s.symbol,
      name: s.companyName || s.name,
      sector: s.sector || s.industry || null,
      price: s.price ?? null,
      changesPercentage: changeBySymbol.has(s.symbol)
        ? changeBySymbol.get(s.symbol)
        : null,
      marketCap: s.marketCap ?? null,
    }));

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
