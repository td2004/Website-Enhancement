// Central place to update your name, contact details and social links.
// Every page reads from here, so changing one value updates the whole site.

export const PROFILE = {
  name: 'Arpitha',
  role: 'Software Engineer',
  shortBio:
    'Final-year Software Engineering student at the University of Technology Sydney. I build things that ship — clean React frontends, pragmatic Node backends, and increasingly, applied-AI features like retrieval-augmented generation (RAG) over real data. I care about the small details that make products feel finished.',
  location: 'Sydney, Australia',
  university: 'University of Technology Sydney',
  degree: 'Bachelor of Software Engineering',
  graduationYear: '2026',
};

export const SOCIAL = {
  email: 'tdarpitha2004@gmail.com',
  github: 'https://github.com/td2004',
  linkedin: 'www.linkedin.com/in/arpitha-thogarapalli-269647232',
  resume: '/resume.pdf',
};

export const SKILLS = {
  Languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'C#'],
  'AI / ML': [
    'RAG',
    'LLMs',
    'Embeddings',
    'Vector search',
    'Prompt engineering',
    'NLP',
    'scikit-learn',
  ],
  Frameworks: ['React', 'Node.js', 'Express', 'React Native', 'Material UI'],
  'Data & Cloud': [
    'PostgreSQL',
    'Vector DBs',
    'REST APIs',
    'Vercel',
    'Docker',
    'CI/CD',
    'Firebase',
  ],
  Concepts: [
    'System design',
    'Data structures & algorithms',
    'Software architecture',
    'Monte Carlo simulation',
    'Statistical analysis',
    'Testing',
    'Agile / Scrum',
  ],
  Tools: ['Git', 'Vite', 'Figma'],
};

export const PROJECTS = [
  {
    slug: 'portfolio-agent',
    title: 'Portfolio AI Agent',
    summary:
      'An AI agent — not just a chatbot. It reasons about your question, decides which tools to call (portfolio search, live ASX stock data, or my GitHub repos), runs them, and answers from the results — with every tool call shown. Built on a Claude tool-use loop.',
    tags: ['Agentic AI', 'Tool use', 'Claude', 'React', 'Serverless'],
    href: '/projects/portfolio-agent',
    repo: 'https://github.com/td2004/portfolio-agent',
    featured: true,
  },
  {
    slug: 'bandwidth-simulator',
    title: 'Bandwidth Monte Carlo Simulator',
    summary:
      'A clean-room Monte Carlo engine for network capacity planning. It simulates thousands of randomised traffic scenarios, builds the distribution of peak link load, and reads off P50/P95/P99 peaks and the probability of congestion — all live in the browser, no backend.',
    tags: ['Monte Carlo', 'Simulation', 'Statistics', 'Data analysis', 'React', 'Canvas'],
    href: '/projects/bandwidth-simulator',
    repo: 'https://github.com/td2004/bandwidth-simulator',
    featured: true,
  },
  {
    slug: 'rag-assistant',
    title: 'Portfolio RAG Assistant',
    summary:
      'Ask my portfolio anything. A retrieval-augmented generation assistant that searches a knowledge base about my work, retrieves the most relevant passages, and answers with cited sources. Runs entirely in the browser with an optional LLM backend.',
    tags: ['RAG', 'Embeddings', 'Vector search', 'React', 'Serverless'],
    href: '/projects/rag-assistant',
    repo: 'https://github.com/td2004/rag-assistant',
    featured: true,
  },
  {
    slug: 'stock-tracker',
    title: 'ASX Top 50 Stock Tracker',
    summary:
      'Live data viewer for the largest ASX-listed companies, sortable by price and market cap. Backed by a serverless function that proxies a financial data API.',
    tags: ['React', 'MUI', 'Vercel Serverless', 'REST API'],
    href: '/projects/stock-tracker',
    repo: 'https://github.com/td2004/stock-tracker',
    featured: true,
  },
  {
    slug: 'qr-generator',
    title: 'QR Code Generator',
    summary:
      'Generate a QR code from any URL or text, then download it as a PNG. Pure client-side — no backend, no tracking.',
    tags: ['React', 'MUI', 'Canvas API', 'SVG'],
    href: '/projects/qr-generator',
    repo: 'https://github.com/td2004/qr-generator',
    featured: false,
  },
];
