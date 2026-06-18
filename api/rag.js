// Vercel serverless function: POST /api/rag
//
// The "G" in RAG — generation. The browser does retrieval client-side and
// sends the user's question plus the retrieved context here. If an LLM API key
// is configured, we ask the model to write a natural-language answer grounded
// ONLY in that context (this is what keeps RAG factual and auditable). If no
// key is set, we return 503 and the frontend falls back to a fully client-side
// extractive answer — so the demo always works.
//
// Optional environment variable on Vercel: OPENAI_API_KEY
//
// The key never touches the browser; only this server function reads it.

const SYSTEM_PROMPT = `You are a helpful assistant embedded in Arpitha's software-engineering portfolio.
Answer recruiter questions about Arpitha using ONLY the provided context passages.
Rules:
- If the context does not contain the answer, say you don't have that information rather than guessing.
- Keep answers concise (2-4 sentences) and professional.
- Speak about Arpitha in the third person.
- Do not invent projects, employers, grades, or dates that are not in the context.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // No model configured — tell the client to use its local fallback.
    return res
      .status(503)
      .json({ error: 'No LLM configured', fallback: true });
  }

  const { question, context } = req.body || {};
  if (!question || !Array.isArray(context) || context.length === 0) {
    return res.status(400).json({ error: 'question and context are required' });
  }

  const contextBlock = context
    .map((c, i) => `[${i + 1}] (${c.source}) ${c.text}`)
    .join('\n\n');

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 300,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Context passages:\n\n${contextBlock}\n\nQuestion: ${question}`,
          },
        ],
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      console.error('LLM upstream error:', resp.status, detail);
      return res.status(502).json({ error: 'LLM request failed', fallback: true });
    }

    const data = await resp.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      return res.status(502).json({ error: 'Empty LLM response', fallback: true });
    }

    return res.status(200).json({ answer, model: 'gpt-4o-mini' });
  } catch (err) {
    console.error('rag api failed:', err);
    return res
      .status(502)
      .json({ error: 'Generation failed', detail: err.message, fallback: true });
  }
}
