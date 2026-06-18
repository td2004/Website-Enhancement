// Client-side retrieval engine for the Portfolio RAG Assistant.
//
// This is a compact, dependency-free implementation of the "R" in RAG —
// retrieval. It mirrors what a vector database does conceptually:
//
//   1. Turn every document chunk into a numeric vector (here: TF-IDF).
//   2. Turn the user's question into a vector the same way.
//   3. Rank chunks by cosine similarity to the question.
//   4. Return the top-k chunks as "context".
//
// A production system would swap TF-IDF for dense embeddings from a model and
// store them in a vector DB (pgvector, Pinecone, etc.), but the shape of the
// pipeline — embed, search, rank, ground — is exactly the same. Keeping it
// client-side means the demo works for recruiters with no API key and no cost.

const STOPWORDS = new Set([
  'a', 'about', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'by', 'can', 'could',
  'did', 'do', 'does', 'for', 'from', 'get', 'give', 'has', 'have', 'her', 'hers',
  'how', 'i', 'in', 'into', 'is', 'it', 'its', 'know', 'me', 'more', 'my', 'of',
  'on', 'or', 'she', 'so', 'some', 'tell', 'that', 'the', 'their', 'them', 'then',
  'there', 'they', 'this', 'to', 'use', 'used', 'uses', 'was', 'what', 'when',
  'where', 'which', 'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your',
]);

// Split text into normalised word tokens, dropping punctuation and stopwords.
export function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function termFrequencies(tokens) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return tf;
}

// Precompute an index over the knowledge base: per-document term frequencies
// plus inverse-document-frequency weights for the whole corpus.
export function buildIndex(chunks) {
  const docs = chunks.map((chunk) => {
    // Index the source label too (e.g. "Skills · Languages") so topic words a
    // user types — "languages", "contact", "project" — are retrievable even
    // when they only appear in the label, not the passage body.
    const tokens = tokenize(`${chunk.source} ${chunk.text}`);
    return { chunk, tokens, tf: termFrequencies(tokens) };
  });

  const df = new Map(); // how many docs each term appears in
  for (const doc of docs) {
    for (const term of new Set(doc.tokens)) {
      df.set(term, (df.get(term) || 0) + 1);
    }
  }

  const N = docs.length;
  const idf = new Map();
  for (const [term, count] of df) {
    // Smoothed IDF so common terms are down-weighted.
    idf.set(term, Math.log((N + 1) / (count + 1)) + 1);
  }

  // Turn each doc's term frequencies into an L2-normalised TF-IDF vector.
  for (const doc of docs) {
    const vec = new Map();
    let norm = 0;
    for (const [term, freq] of doc.tf) {
      const w = (freq / doc.tokens.length) * (idf.get(term) || 0);
      vec.set(term, w);
      norm += w * w;
    }
    norm = Math.sqrt(norm) || 1;
    for (const [term, w] of vec) vec.set(term, w / norm);
    doc.vector = vec;
  }

  return { docs, idf };
}

function vectorizeQuery(tokens, idf) {
  const tf = termFrequencies(tokens);
  const vec = new Map();
  let norm = 0;
  for (const [term, freq] of tf) {
    const w = (freq / tokens.length) * (idf.get(term) || 0);
    if (w > 0) {
      vec.set(term, w);
      norm += w * w;
    }
  }
  norm = Math.sqrt(norm) || 1;
  for (const [term, w] of vec) vec.set(term, w / norm);
  return vec;
}

function cosine(a, b) {
  // Both vectors are already L2-normalised, so the dot product is the cosine.
  let dot = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const [term, w] of small) {
    const other = large.get(term);
    if (other) dot += w * other;
  }
  return dot;
}

// Retrieve the top-k most relevant chunks for a question.
export function retrieve(query, index, k = 3) {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];
  const qVec = vectorizeQuery(qTokens, index.idf);

  return index.docs
    .map((doc) => ({
      ...doc.chunk,
      score: cosine(qVec, doc.vector),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

// Split a passage into rough sentences.
function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Compose an extractive answer when no LLM is available: pick the sentences
// from the retrieved chunks that overlap most with the question's terms.
export function extractiveAnswer(query, retrieved) {
  if (!retrieved.length) {
    return "I don't have anything in my knowledge base about that yet. Try asking about Arpitha's projects, skills, education, or how to get in touch.";
  }

  const qTerms = new Set(tokenize(query));
  const scored = [];
  for (const r of retrieved) {
    for (const sentence of sentences(r.text)) {
      const terms = tokenize(sentence);
      const overlap = terms.filter((t) => qTerms.has(t)).length;
      if (overlap > 0) {
        scored.push({ sentence, score: overlap + r.score });
      }
    }
  }

  if (scored.length === 0) {
    // No sentence-level overlap — fall back to the single best chunk.
    return retrieved[0].text;
  }

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.sentence);

  // De-duplicate while preserving order.
  return [...new Set(top)].join(' ');
}
