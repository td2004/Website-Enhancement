// Knowledge base for the Portfolio RAG Assistant.
//
// Each entry is a "chunk" — a small, self-contained passage that the retriever
// can score against a question. In a production RAG system these chunks would
// be embedded into vectors and stored in a vector database; here they live in
// memory and are scored client-side (see src/lib/rag.js). Keeping each chunk
// focused on a single topic makes retrieval far more accurate.
//
// To extend the assistant's knowledge, just add more chunks. No retraining,
// no redeploy of a model — that is the core advantage of RAG.

export const KNOWLEDGE_BASE = [
  {
    id: 'profile-summary',
    source: 'About · Summary',
    text: 'Arpitha is a final-year Bachelor of Software Engineering student at the University of Technology Sydney (UTS), based in Sydney, Australia, graduating in 2026. She is looking for graduate and intern software engineering roles. She builds clean React frontends, pragmatic Node.js backends, and applied-AI features such as retrieval-augmented generation over real data.',
  },
  {
    id: 'education',
    source: 'About · Education',
    text: 'Arpitha studies a Bachelor of Software Engineering at the University of Technology Sydney, expected to graduate in 2026. Her coursework covers software design and architecture, web and mobile development, databases, data structures and algorithms, artificial intelligence and machine learning, and cloud computing. She has built team projects using React, Node.js, and React Native under agile and scrum processes.',
  },
  {
    id: 'skills-languages',
    source: 'Skills · Languages',
    text: 'Arpitha is most comfortable in JavaScript and TypeScript, and also works in Python, Java, SQL, and C#. Her strongest stack is React on the frontend with Node.js and Express on the backend.',
  },
  {
    id: 'skills-ai',
    source: 'Skills · AI and ML',
    text: 'Arpitha works with applied AI and machine learning: retrieval-augmented generation (RAG), large language models (LLMs), text embeddings, vector search, prompt engineering, and natural language processing. She has used Python with scikit-learn for classical machine learning in coursework, and built RAG pipelines that ground LLM answers in a trusted document set to reduce hallucination.',
  },
  {
    id: 'skills-data-cloud',
    source: 'Skills · Data and Cloud',
    text: 'On the data and cloud side, Arpitha works with PostgreSQL and other relational databases, vector databases for semantic search, REST API design, Docker, and CI/CD pipelines. She deploys to Vercel using serverless functions and has used Firebase for authentication and realtime data.',
  },
  {
    id: 'project-rag',
    source: 'Project · Portfolio RAG Assistant',
    text: 'The Portfolio RAG Assistant is a retrieval-augmented generation app that lets recruiters ask questions about Arpitha and get answers grounded in a curated knowledge base. When a question comes in, the system retrieves the most relevant passages using TF-IDF vectorisation and cosine similarity, then either composes an extractive answer from those passages or, when an LLM API key is configured, asks a language model to write a natural answer using only the retrieved context. Every answer shows its sources, so claims are verifiable. It is built with React and a Vercel serverless function, and it falls back gracefully to fully client-side retrieval when no model is available.',
  },
  {
    id: 'project-rag-learnings',
    source: 'Project · RAG Assistant · What I learned',
    text: 'Building the RAG Assistant taught Arpitha that retrieval quality matters more than the model. Good chunking, keeping each passage focused on one topic, and sensible scoring did more for answer quality than swapping models. She also learned to always show retrieved sources so answers are auditable, and to design for graceful degradation so the demo still works without a paid API key.',
  },
  {
    id: 'project-stocks',
    source: 'Project · ASX Top 50 Stock Tracker',
    text: 'The ASX Top 50 Stock Tracker is a live data viewer for the largest companies listed on the Australian Securities Exchange, sortable by price and market cap and filterable by sector. It is built with React and Material UI, backed by a Vercel serverless function that proxies the Financial Modeling Prep API so the API key never reaches the browser. A 60-second in-memory cache keeps it within free-tier limits.',
  },
  {
    id: 'project-stocks-learnings',
    source: 'Project · Stock Tracker · What I learned',
    text: 'The key lesson from the Stock Tracker was that API keys belong on the server. The original version called the data API directly from the browser with the key embedded; moving it behind a serverless proxy fixed both the key leak and a CORS issue. It also taught Arpitha about caching to respect rate limits.',
  },
  {
    id: 'project-qr',
    source: 'Project · QR Code Generator',
    text: 'The QR Code Generator turns any URL or text into a downloadable QR code as a PNG. It is purely client-side with no backend and no tracking, built with React, the Canvas API, and SVG.',
  },
  {
    id: 'engineering-values',
    source: 'About · How I work',
    text: 'Arpitha enjoys the full loop of building software: designing the UI, wiring up the data layer, deploying, and iterating. She cares about clean architecture, readable code, secure handling of secrets, graceful error handling and fallbacks, and the small polish details that make a product feel finished. She works comfortably in agile teams.',
  },
  {
    id: 'contact',
    source: 'Contact',
    text: 'To contact or hire Arpitha, reach her by email at tdarpitha2004@gmail.com. She is available and open to graduate and intern software engineering roles for 2026, and is happy to chat about frontend, full-stack, or applied-AI work. Her GitHub and LinkedIn profiles are linked in the site footer, and a contact form is on the Contact page.',
  },
];
