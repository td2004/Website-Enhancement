import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Grid,
  TextField,
  IconButton,
  Divider,
  LinearProgress,
  Tooltip,
  Collapse,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GitHubIcon from '@mui/icons-material/GitHub';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonIcon from '@mui/icons-material/Person';
import SourceIcon from '@mui/icons-material/Source';
import { KNOWLEDGE_BASE } from '../../data/knowledgeBase.js';
import { buildIndex, retrieve, extractiveAnswer } from '../../lib/rag.js';

const TAGS = ['RAG', 'Embeddings', 'Vector search', 'React', 'Serverless'];

const SUGGESTIONS = [
  'What AI and machine learning experience does Arpitha have?',
  'Tell me about the RAG assistant project.',
  'What did she learn building the stock tracker?',
  'What is her tech stack?',
  'Is she available for hire and how do I contact her?',
];

const GREETING = {
  role: 'assistant',
  text: "Hi! I'm a retrieval-augmented assistant trained on Arpitha's portfolio. Ask me about her projects, skills, education, or how to get in touch — every answer cites the passages it was drawn from.",
  sources: [],
};

export default function RagAssistant() {
  const index = useMemo(() => buildIndex(KNOWLEDGE_BASE), []);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState(null); // 'llm' | 'local'
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const ask = async (question) => {
    const q = question.trim();
    if (!q || busy) return;

    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setBusy(true);

    // 1) Retrieval happens locally, always.
    const retrieved = retrieve(q, index, 3);

    // 2) Generation: try the serverless LLM, fall back to extractive answer.
    let answer = '';
    let usedMode = 'local';
    try {
      const res = await axios.post(
        '/api/rag',
        {
          question: q,
          context: retrieved.map(({ source, text }) => ({ source, text })),
        },
        { timeout: 15000 },
      );
      if (res.data?.answer) {
        answer = res.data.answer;
        usedMode = 'llm';
      } else {
        throw new Error('No answer');
      }
    } catch {
      answer = extractiveAnswer(q, retrieved);
      usedMode = 'local';
    }

    setMode(usedMode);
    setMessages((m) => [
      ...m,
      { role: 'assistant', text: answer, sources: retrieved },
    ]);
    setBusy(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} className="page-enter">
      <Button
        component={RouterLink}
        to="/projects"
        startIcon={<ArrowBackIcon />}
        color="inherit"
        sx={{ mb: 3 }}
      >
        All projects
      </Button>

      <Typography variant="overline" color="secondary" sx={{ letterSpacing: 2 }}>
        Project · Live demo
      </Typography>
      <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mt: 1, mb: 2 }}>
        Portfolio RAG Assistant
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 760, mb: 3, lineHeight: 1.7 }}>
        A retrieval-augmented generation (RAG) assistant you can actually use.
        Ask a question and it retrieves the most relevant passages from a
        knowledge base about my work, then answers with those sources cited —
        the same pattern used to ground LLMs on private data in production.
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        {TAGS.map((tag) => (
          <Chip key={tag} label={tag} size="small" variant="outlined" />
        ))}
      </Stack>

      <Grid container spacing={4}>
        {/* Chat demo */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: { md: 560 } }}>
            <CardContent sx={{ pb: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1 }}>
                  ASK MY PORTFOLIO
                </Typography>
                <ModeBadge mode={mode} />
              </Stack>
            </CardContent>

            {/* Messages */}
            <Box
              ref={scrollRef}
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 2,
                py: 1,
                minHeight: 280,
              }}
            >
              <Stack spacing={2}>
                {messages.map((m, i) => (
                  <Message key={i} message={m} />
                ))}
                {busy && (
                  <Box sx={{ pl: 5 }}>
                    <LinearProgress sx={{ maxWidth: 120, borderRadius: 1 }} />
                  </Box>
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Suggestions */}
            {messages.length <= 1 && (
              <Box sx={{ px: 2, pt: 1.5 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {SUGGESTIONS.slice(0, 3).map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      size="small"
                      onClick={() => ask(s)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Input */}
            <Box component="form" onSubmit={onSubmit} sx={{ p: 2 }}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask about my work…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={busy}
                />
                <IconButton type="submit" color="primary" disabled={busy || !input.trim()}>
                  <SendIcon />
                </IconButton>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* How it works */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ height: { md: 560 }, overflowY: 'auto' }}>
            <CardContent>
              <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1, mb: 2 }}>
                HOW IT WORKS
              </Typography>
              <Stack spacing={2}>
                <Step
                  n={1}
                  title="Index the knowledge base"
                  body={`${KNOWLEDGE_BASE.length} passages about my work are tokenised and turned into TF-IDF vectors — the same idea as embeddings in a vector database.`}
                />
                <Step
                  n={2}
                  title="Retrieve relevant context"
                  body="Your question is vectorised the same way and ranked against every passage by cosine similarity. The top 3 become the context."
                />
                <Step
                  n={3}
                  title="Generate a grounded answer"
                  body="A serverless function asks an LLM to answer using only that context. With no API key it falls back to an on-device extractive answer — so this demo always works."
                />
                <Step
                  n={4}
                  title="Cite the sources"
                  body="Every answer lists the passages it drew from, so claims stay auditable instead of hallucinated."
                />
              </Stack>
              <Box sx={{ mt: 3 }}>
                <Button
                  component="a"
                  href="https://github.com/td2004/rag-assistant"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<GitHubIcon />}
                  variant="outlined"
                  size="small"
                >
                  View source
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Case study */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                  <Section
                    title="The problem"
                    body="Recruiters skim. I wanted a way for them to interrogate my experience directly — 'does she know X?' — and get a truthful, sourced answer in seconds instead of hunting through pages."
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Section
                    title="Why RAG"
                    body="An LLM alone would confidently make things up about me. RAG grounds every answer in a knowledge base I control, and showing the retrieved sources makes each claim verifiable — the core technique for trustworthy AI on private data."
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Section
                    title="What I learned"
                    body="Retrieval quality matters more than the model: good chunking and scoring beat swapping models. Always surface sources, and design for graceful degradation so the product still works without a paid API."
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1, mb: 1 }}>
                STACK
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 820 }}>
                React + Material UI on the frontend. Retrieval runs in the browser
                with a dependency-free TF-IDF + cosine-similarity engine. Generation
                is a Vercel serverless function that proxies an LLM (so the API key
                never reaches the client) with an on-device extractive fallback. In
                production the TF-IDF step swaps cleanly for dense embeddings stored
                in a vector database like pgvector or Pinecone — the pipeline shape
                is identical.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function Message({ message }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);
  return (
    <Stack direction="row" spacing={1.5} sx={{ flexDirection: isUser ? 'row-reverse' : 'row' }}>
      <Box
        sx={{
          mt: 0.5,
          width: 32,
          height: 32,
          flexShrink: 0,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isUser ? 'rgba(34,211,238,0.15)' : 'rgba(124,92,255,0.15)',
          color: isUser ? 'secondary.main' : 'primary.main',
        }}
      >
        {isUser ? <PersonIcon fontSize="small" /> : <AutoAwesomeIcon fontSize="small" />}
      </Box>
      <Box sx={{ maxWidth: '85%' }}>
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderRadius: 2,
            bgcolor: isUser ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.04)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {message.text}
          </Typography>
        </Box>

        {message.sources?.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            <Button
              size="small"
              startIcon={<SourceIcon fontSize="small" />}
              onClick={() => setShowSources((v) => !v)}
              sx={{ color: 'text.secondary', textTransform: 'none', px: 0.5 }}
            >
              {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
            </Button>
            <Collapse in={showSources}>
              <Stack spacing={1} sx={{ mt: 0.5 }}>
                {message.sources.map((s) => (
                  <Box
                    key={s.id}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="secondary" sx={{ fontWeight: 600 }}>
                        {s.source}
                      </Typography>
                      <Tooltip title="Cosine similarity to your question">
                        <Chip
                          label={s.score.toFixed(2)}
                          size="small"
                          sx={{ height: 18, fontSize: '0.65rem', fontFamily: '"JetBrains Mono", monospace' }}
                        />
                      </Tooltip>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {s.text.length > 180 ? `${s.text.slice(0, 180)}…` : s.text}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Collapse>
          </Box>
        )}
      </Box>
    </Stack>
  );
}

function ModeBadge({ mode }) {
  if (!mode) return null;
  const isLlm = mode === 'llm';
  return (
    <Tooltip
      title={
        isLlm
          ? 'Answer generated by an LLM, grounded in retrieved context.'
          : 'No LLM configured — answer composed on-device from retrieved passages.'
      }
    >
      <Chip
        label={isLlm ? 'LLM generation' : 'On-device retrieval'}
        size="small"
        color={isLlm ? 'primary' : 'default'}
        variant="outlined"
        sx={{ height: 22, fontSize: '0.7rem' }}
      />
    </Tooltip>
  );
}

function Step({ n, title, body }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 26,
          height: 26,
          flexShrink: 0,
          borderRadius: '50%',
          bgcolor: 'rgba(124,92,255,0.15)',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
        }}
      >
        {n}
      </Box>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.25 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {body}
        </Typography>
      </Box>
    </Stack>
  );
}

function Section({ title, body }) {
  return (
    <Box>
      <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1, mb: 1 }}>
        {title.toUpperCase()}
      </Typography>
      <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {body}
      </Typography>
    </Box>
  );
}
