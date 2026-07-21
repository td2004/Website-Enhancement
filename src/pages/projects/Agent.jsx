import { useEffect, useRef, useState } from 'react';
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
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GitHubIcon from '@mui/icons-material/GitHub';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';

const TAGS = ['Agentic AI', 'Tool use', 'Claude', 'React', 'Serverless'];

const SUGGESTIONS = [
  'Which company in your stock tracker has the biggest market cap?',
  'What has Arpitha built with React, and what are her GitHub repos?',
  'What AI experience does she have, and is she available for hire?',
];

const GREETING = {
  role: 'assistant',
  text: "Hi! I'm an AI agent for Arpitha's portfolio. Unlike a plain chatbot, I decide which tools to call searching her portfolio, pulling live ASX stock data, or listing her GitHub repos — then answer from what I find. Ask me something and watch the tool calls appear.",
  trace: [],
};

// Friendly labels for the raw tool names returned in the trace.
const TOOL_META = {
  search_portfolio: { label: 'Searched portfolio', color: 'primary' },
  get_asx_stocks: { label: 'Fetched live ASX data', color: 'secondary' },
  list_github_repos: { label: 'Listed GitHub repos', color: 'default' },
};

export default function Agent() {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
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

    try {
      const res = await axios.post('/api/agent', { question: q }, { timeout: 60000 });
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: res.data.answer, trace: res.data.trace || [] },
      ]);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 503) {
        // No API key on the server — the agent can't run without a live model.
        setNotConfigured(true);
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: "The agent isn't configured yet — it needs an ANTHROPIC_API_KEY on the server to call Claude. (Set it in the Vercel environment variables to bring it online.)",
            trace: [],
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: 'Something went wrong reaching the agent. Please try again in a moment.',
            trace: [],
          },
        ]);
      }
    } finally {
      setBusy(false);
    }
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
        Portfolio AI Agent
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 760, mb: 3, lineHeight: 1.7 }}>
        An agent not just a chatbot. It reasons about your question, decides
        which tools to call (portfolio search, live stock data, or my GitHub
        repos), runs them, and answers from the results. Every tool call is shown
        so you can see it think and act.
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        {TAGS.map((tag) => (
          <Chip key={tag} label={tag} size="small" variant="outlined" />
        ))}
      </Stack>

      {notConfigured && (
        <Alert severity="info" sx={{ mb: 3 }}>
          The live agent needs <code>ANTHROPIC_API_KEY</code> set in the server's
          Vercel environment variables. Until then it can't call the model.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Chat demo */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: { md: 560 } }}>
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1 }}>
                ASK THE AGENT
              </Typography>
            </CardContent>

            {/* Messages */}
            <Box
              ref={scrollRef}
              sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1, minHeight: 280 }}
            >
              <Stack spacing={2}>
                {messages.map((m, i) => (
                  <Message key={i} message={m} />
                ))}
                {busy && (
                  <Box sx={{ pl: 5 }}>
                    <LinearProgress sx={{ maxWidth: 120, borderRadius: 1 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
                      thinking &amp; calling tools…
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Suggestions */}
            {messages.length <= 1 && (
              <Box sx={{ px: 2, pt: 1.5 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {SUGGESTIONS.map((s) => (
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
                  placeholder="Ask the agent…"
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
                  title="Reason about the question"
                  body="Claude reads your question and decides which tools — if any — it needs to answer it accurately."
                />
                <Step
                  n={2}
                  title="Call tools & read results"
                  body="It calls the tools (portfolio search, live ASX stock data, GitHub repos), the server runs them, and the results are fed back to the model."
                />
                <Step
                  n={3}
                  title="Loop until done"
                  body="It can call several tools across multiple steps chaining them together before it has enough to answer."
                />
                <Step
                  n={4}
                  title="Answer, grounded in tools"
                  body="The final answer is composed only from what the tools returned, and every tool call is shown for transparency."
                />
              </Stack>
              <Box sx={{ mt: 3 }}>
                <Button
                  component="a"
                  href="https://github.com/td2004/portfolio-agent"
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
                    title="RAG vs. agent"
                    body="The RAG assistant retrieves then answers in one shot. This agent decides which tools to use and can chain several together — the difference between looking something up and taking action."
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Section
                    title="Reusing what I built"
                    body="The tools wrap pieces already running on this site: the RAG knowledge base, the live ASX stock proxy, and my GitHub. The agent composes them rather than re-implementing them."
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Section
                    title="Stack"
                    body="React + Material UI on the frontend. A Vercel serverless function runs a Claude tool-use loop (the key stays server-side), executing each tool and looping until the model can answer."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function Message({ message }) {
  const isUser = message.role === 'user';
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
        {/* Tool-call trace — the agentic reveal */}
        {message.trace?.length > 0 && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
            {message.trace.map((t, i) => {
              const meta = TOOL_META[t.name] || { label: t.tool, color: 'default' };
              return (
                <Chip
                  key={i}
                  icon={<BuildIcon sx={{ fontSize: 14 }} />}
                  label={meta.label}
                  size="small"
                  color={meta.color}
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.68rem' }}
                />
              );
            })}
          </Stack>
        )}
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
      </Box>
    </Stack>
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
