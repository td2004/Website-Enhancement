// Vercel serverless function: POST /api/agent
//
// An *agentic* endpoint — unlike /api/rag (a single retrieve-then-answer call),
// this runs a tool-use loop with Claude: the model reads the question, decides
// which tool(s) to call, we execute them, feed the results back, and repeat
// until it can answer. The tools reuse pieces the site already runs:
//
//   search_portfolio   -> the RAG knowledge base + retrieval (src/lib/rag.js)
//   get_asx_stocks     -> the existing /api/stocks proxy (live market data)
//   list_github_repos  -> Arpitha's public repos via the GitHub API
//
// The response includes the final answer AND a `trace` of every tool call, so
// the frontend can *show* the agent thinking and acting — the whole point of an
// agent demo.
//
// Required environment variable on Vercel: ANTHROPIC_API_KEY
// (The key never reaches the browser — only this server function reads it.)

import Anthropic from '@anthropic-ai/sdk';
import { KNOWLEDGE_BASE } from '../src/data/knowledgeBase.js';
import { buildIndex, retrieve } from '../src/lib/rag.js';

// Default to the latest, most capable Claude model. For a public demo you may
// prefer 'claude-haiku-4-5' or 'claude-sonnet-5' for lower latency/cost — see
// the note in the README. Opus gives the best tool-use reasoning.
const MODEL = 'claude-opus-4-8';
const MAX_STEPS = 6; // cap the agent loop so one request can't run away
const GITHUB_USER = 'td2004';

// Build the retrieval index once per warm function instance (corpus is static).
const index = buildIndex(KNOWLEDGE_BASE);

const SYSTEM_PROMPT = `You are an agent embedded in Arpitha's software-engineering portfolio.
You help recruiters by answering questions using the tools available to you — do not answer from prior knowledge about Arpitha; use search_portfolio for anything about her.

Guidance:
- Decide which tool(s) a question needs. A question may need several (e.g. "which ASX stock in your tracker is biggest, and what did you build with React?" needs get_asx_stocks AND search_portfolio).
- For anything about Arpitha (skills, projects, education, contact, experience), call search_portfolio.
- For live market data, call get_asx_stocks. For her actual code/repositories, call list_github_repos.
- Ground every claim in tool results. If the tools don't cover it, say so plainly rather than guessing.
- Keep the final answer concise and professional (2-5 sentences). Speak about Arpitha in the third person.`;

const TOOLS = [
  {
    name: 'search_portfolio',
    description:
      "Search Arpitha's portfolio knowledge base (skills, projects, education, how she works, contact details) and return the most relevant passages. Use this for any question about Arpitha herself.",
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query, e.g. "React projects" or "AI experience".',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_asx_stocks',
    description:
      'Get live data for the top ASX-listed companies (symbol, name, sector, price, change %, market cap). Use this for questions about current market data in the stock tracker.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'list_github_repos',
    description:
      "List Arpitha's public GitHub repositories (name, description, primary language, stars, URL). Use this for questions about her actual code and projects on GitHub.",
    input_schema: { type: 'object', properties: {} },
  },
];

// --- Tool implementations -------------------------------------------------

function searchPortfolio(query) {
  const hits = retrieve(query || '', index, 4);
  if (!hits.length) return 'No matching passages found in the portfolio knowledge base.';
  return hits
    .map((h, i) => `[${i + 1}] (${h.source}) ${h.text}`)
    .join('\n\n');
}

async function getAsxStocks(baseUrl) {
  const resp = await fetch(`${baseUrl}/api/stocks`);
  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    return `Stock data unavailable (status ${resp.status}). ${detail}`.trim();
  }
  const data = await resp.json();
  if (!Array.isArray(data) || data.length === 0) return 'No stock data returned.';
  // Trim to keep the tool result compact.
  const rows = data.slice(0, 25).map((s) => ({
    symbol: s.symbol,
    name: s.name,
    sector: s.sector,
    price: s.price,
    changePct: s.changesPercentage,
    marketCap: s.marketCap,
  }));
  return JSON.stringify(rows);
}

async function listGithubRepos() {
  const resp = await fetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=100`,
    { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-agent' } },
  );
  if (!resp.ok) return `GitHub API unavailable (status ${resp.status}).`;
  const repos = await resp.json();
  if (!Array.isArray(repos) || repos.length === 0) return 'No public repositories found.';
  const trimmed = repos
    .filter((r) => !r.fork)
    .map((r) => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      url: r.html_url,
      updated: r.updated_at,
    }));
  return JSON.stringify(trimmed);
}

// Route a tool call to its implementation. Returns a string result.
async function runTool(name, input, baseUrl) {
  switch (name) {
    case 'search_portfolio':
      return searchPortfolio(input?.query);
    case 'get_asx_stocks':
      return getAsxStocks(baseUrl);
    case 'list_github_repos':
      return listGithubRepos();
    default:
      return `Unknown tool: ${name}`;
  }
}

// A short, human-readable label for the trace shown in the UI.
function traceLabel(name, input) {
  if (name === 'search_portfolio') return `search_portfolio("${input?.query ?? ''}")`;
  return `${name}()`;
}

// --- Handler --------------------------------------------------------------

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured', fallback: true });
  }

  const question = req.body?.question;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'question is required' });
  }

  // Base URL for calling our own /api/stocks (works on Vercel and `vercel dev`).
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${req.headers.host}`;

  const client = new Anthropic({ apiKey });
  const messages = [{ role: 'user', content: question }];
  const trace = [];

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        output_config: { effort: 'low' }, // snappy, fewer tool round-trips for a demo
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
      });

      if (response.stop_reason !== 'tool_use') {
        // Final answer — pull the text out.
        const answer = response.content
          .filter((b) => b.type === 'text')
          .map((b) => b.text)
          .join('\n')
          .trim();
        return res.status(200).json({ answer, trace, model: MODEL });
      }

      // Execute every tool the model asked for, in parallel.
      messages.push({ role: 'assistant', content: response.content });
      const toolUses = response.content.filter((b) => b.type === 'tool_use');
      const results = await Promise.all(
        toolUses.map(async (tu) => {
          const result = await runTool(tu.name, tu.input, baseUrl);
          trace.push({ tool: traceLabel(tu.name, tu.input), name: tu.name });
          return { type: 'tool_result', tool_use_id: tu.id, content: String(result) };
        }),
      );
      messages.push({ role: 'user', content: results });
    }

    // Ran out of steps without a final answer.
    return res.status(200).json({
      answer:
        "I wasn't able to finish reasoning about that within my step limit. Try a more specific question.",
      trace,
      model: MODEL,
    });
  } catch (err) {
    console.error('agent api failed:', err);
    return res.status(502).json({ error: 'Agent request failed', detail: err.message });
  }
}

// Give the agent loop room to run (multiple tool round-trips). Vercel Hobby
// caps this lower; on Pro it can use the full 60s.
export const config = { maxDuration: 60 };
