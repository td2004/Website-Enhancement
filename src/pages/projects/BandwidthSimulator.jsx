import { useEffect, useMemo, useRef, useState } from 'react';
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
  Slider,
  Divider,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GitHubIcon from '@mui/icons-material/GitHub';
import ReplayIcon from '@mui/icons-material/Replay';
import { simulate, histogram } from '../../lib/montecarlo.js';

const TAGS = ['Monte Carlo', 'Simulation', 'Statistics', 'Data analysis', 'React', 'Canvas'];

const DEFAULTS = {
  users: 150,
  activeProb: 0.4,
  meanDemand: 8,
  cvDemand: 0.6,
  capacity: 1000,
  timeSteps: 60,
  trials: 2000,
};

const PURPLE = '#7c5cff';
const CYAN = '#22d3ee';
const RED = '#f87171';

export default function BandwidthSimulator() {
  const [p, setP] = useState(DEFAULTS);
  const [seed, setSeed] = useState(1);
  const [running, setRunning] = useState(false);

  // Recompute whenever a parameter (or the seed) changes. Wrapped in a tiny
  // async tick so the progress bar can paint on heavier runs.
  const result = useMemo(() => simulate({ ...p, seed }), [p, seed]);

  const setParam = (key) => (_e, value) => setP((prev) => ({ ...prev, [key]: value }));

  const rerun = () => {
    setRunning(true);
    // new seed → a fresh set of random draws
    setTimeout(() => {
      setSeed((s) => s + 1);
      setRunning(false);
    }, 120);
  };

  const reset = () => {
    setP(DEFAULTS);
    setSeed(1);
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
        Bandwidth Monte Carlo Simulator
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 780, mb: 3, lineHeight: 1.7 }}>
        How likely is a shared network link to saturate? This tool answers that
        the way capacity planners do — by simulation, not guesswork. It models
        thousands of randomised traffic scenarios, builds the distribution of
        peak load, and reads off the percentiles and the probability of
        congestion. Everything runs live in your browser; drag a slider and the
        whole experiment re-runs.
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        {TAGS.map((tag) => (
          <Chip key={tag} label={tag} size="small" variant="outlined" />
        ))}
      </Stack>

      <Grid container spacing={4}>
        {/* Controls */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1 }}>
                  SCENARIO INPUTS
                </Typography>
                <Button size="small" onClick={reset} sx={{ color: 'text.secondary' }}>
                  Reset
                </Button>
              </Stack>

              <Control
                label="Users on the link"
                value={p.users}
                display={p.users}
                min={10}
                max={500}
                step={10}
                onChange={setParam('users')}
              />
              <Control
                label="Active probability"
                value={p.activeProb}
                display={`${Math.round(p.activeProb * 100)}%`}
                min={0.05}
                max={1}
                step={0.05}
                onChange={setParam('activeProb')}
              />
              <Control
                label="Mean demand / active user"
                value={p.meanDemand}
                display={`${p.meanDemand} Mbps`}
                min={1}
                max={50}
                step={1}
                onChange={setParam('meanDemand')}
              />
              <Control
                label="Demand variability (CV)"
                value={p.cvDemand}
                display={p.cvDemand.toFixed(2)}
                min={0.1}
                max={1.5}
                step={0.1}
                onChange={setParam('cvDemand')}
              />
              <Control
                label="Link capacity"
                value={p.capacity}
                display={`${p.capacity} Mbps`}
                min={200}
                max={3000}
                step={100}
                onChange={setParam('capacity')}
              />
              <Control
                label="Trials (Monte Carlo runs)"
                value={p.trials}
                display={p.trials.toLocaleString()}
                min={200}
                max={5000}
                step={200}
                onChange={setParam('trials')}
              />

              <Button
                onClick={rerun}
                startIcon={<ReplayIcon />}
                variant="outlined"
                fullWidth
                sx={{ mt: 1 }}
              >
                Re-run with new random draws
              </Button>
              <Box sx={{ height: 4, mt: 1.5 }}>
                {running && <LinearProgress sx={{ borderRadius: 1 }} />}
              </Box>
              <Typography variant="caption" color="text.secondary">
                Expected active users at any instant:{' '}
                <strong>{Math.round(result.expectedActive)}</strong> · seed {seed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1, mb: 2 }}>
                PEAK UTILISATION — {p.trials.toLocaleString()} SIMULATED SCENARIOS
              </Typography>

              <Histogram result={result} />

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Stat label="Median peak (P50)" value={pct(result.p50)} />
                <Stat label="P95 peak" value={pct(result.p95)} />
                <Stat label="P99 peak" value={pct(result.p99)} />
                <Stat
                  label="Congestion risk"
                  value={pct(result.congestionProb)}
                  highlight={result.congestionProb > 0.01}
                  tip="Share of scenarios where peak demand exceeded link capacity (>100%)."
                />
              </Grid>

              <Divider sx={{ my: 2.5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {readout(result)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* How it works */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1, mb: 2 }}>
                HOW IT WORKS
              </Typography>
              <Stack spacing={2}>
                <Step
                  n={1}
                  title="Model each user as random"
                  body="At every instant a user is transmitting with some probability, and an active user draws bandwidth from a right-skewed lognormal distribution — most users are light, a few are heavy."
                />
                <Step
                  n={2}
                  title="Simulate one scenario"
                  body="A trial steps through a time window, sums everyone's demand at each step, and records the worst moment — the peak load on the link."
                />
                <Step
                  n={3}
                  title="Repeat thousands of times"
                  body="Each trial uses fresh random draws from a seeded generator, so thousands of trials trace out the full distribution of peak load."
                />
                <Step
                  n={4}
                  title="Read off the risk"
                  body="From that distribution we take the P50/P95/P99 peaks and the fraction of trials that exceeded capacity — the congestion probability you actually plan against."
                />
              </Stack>
              <Box sx={{ mt: 3 }}>
                <Button
                  component="a"
                  href="https://github.com/td2004/bandwidth-simulator"
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
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <Section
                    title="The problem"
                    body="Sizing a shared link by average demand is a trap — averages hide the bursts that actually cause outages. The real question is the tail: how often does peak load blow past capacity?"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Section
                    title="Why Monte Carlo"
                    body="There's no clean closed-form answer once demand is skewed and bursty. Simulating thousands of randomised scenarios approximates the true distribution and surfaces the tail risk directly."
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Section
                    title="What I learned"
                    body="Variability dominates the tail: raising per-user variance moves P99 far more than the mean does. Seeding the RNG makes runs reproducible, and pushing the maths into pure functions made the whole thing trivial to test."
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" color="secondary" sx={{ letterSpacing: 1, mb: 1 }}>
                STACK
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 820 }}>
                React + Material UI for the UI. The simulation engine is a
                dependency-free module: a seeded mulberry32 PRNG, Box–Muller for
                normals, and a lognormal sampler parameterised by mean and
                coefficient of variation. The histogram is hand-drawn on a HTML5
                canvas, so the whole experiment runs client-side with no backend.
                The same engine shape scales to a worker or server for far larger
                runs.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

function pct(x) {
  return `${(x * 100).toFixed(x < 0.01 && x > 0 ? 2 : 1)}%`;
}

function readout(r) {
  const risk = r.congestionProb;
  if (risk <= 0.0001) {
    return `In this scenario the link is comfortably over-provisioned — peak demand never reached capacity across ${r.params.trials.toLocaleString()} trials. The P99 peak sat at ${pct(r.p99)}, leaving healthy headroom.`;
  }
  if (risk < 0.05) {
    return `The link mostly copes, but the tail bites: roughly ${pct(risk)} of scenarios saturated it, and the P99 peak reached ${pct(r.p99)}. That's the kind of low-probability, high-impact risk capacity planning exists to catch.`;
  }
  return `This link is under-provisioned for the load: about ${pct(risk)} of simulated scenarios exceeded capacity, with peaks up to ${pct(r.max)}. You'd add capacity, shape traffic, or cut the active rate before shipping this.`;
}

function Control({ label, value, display, min, max, step, onChange }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontFamily: '"JetBrains Mono", monospace', color: 'secondary.main' }}
        >
          {display}
        </Typography>
      </Stack>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        size="small"
        sx={{ mt: -0.5 }}
      />
    </Box>
  );
}

function Stat({ label, value, highlight, tip }) {
  const content = (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: highlight ? 'rgba(248,113,113,0.5)' : 'divider',
        bgcolor: highlight ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.02)',
        height: '100%',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontFamily: '"JetBrains Mono", monospace',
          color: highlight ? RED : 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
  return (
    <Grid item xs={6} sm={3}>
      {tip ? <Tooltip title={tip}>{content}</Tooltip> : content}
    </Grid>
  );
}

function Histogram({ result }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const cssW = wrap.clientWidth;
    const cssH = 220;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const { bins, edges, binWidth } = histogram(result.peaks, 30);
    if (!bins.length) return;

    const padL = 8;
    const padR = 8;
    const padB = 22;
    const padT = 8;
    const plotW = cssW - padL - padR;
    const plotH = cssH - padB - padT;
    const maxCount = Math.max(...bins);
    const minU = edges[0];
    const maxU = edges[edges.length - 1] + binWidth;
    const range = maxU - minU || 1;

    const xFor = (u) => padL + ((u - minU) / range) * plotW;

    // 100% capacity reference line
    if (1 >= minU && 1 <= maxU) {
      const x = xFor(1);
      ctx.strokeStyle = 'rgba(248,113,113,0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(248,113,113,0.9)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = x > cssW - 60 ? 'right' : 'left';
      ctx.fillText('capacity', x + (x > cssW - 60 ? -4 : 4), padT + 10);
    }

    // bars
    const gap = 1;
    const barW = plotW / bins.length;
    bins.forEach((count, i) => {
      const h = (count / maxCount) * plotH;
      const x = padL + i * barW;
      const y = padT + plotH - h;
      const binMid = edges[i] + binWidth / 2;
      const over = binMid > 1;
      const grad = ctx.createLinearGradient(0, y, 0, y + h);
      if (over) {
        grad.addColorStop(0, 'rgba(248,113,113,0.95)');
        grad.addColorStop(1, 'rgba(248,113,113,0.35)');
      } else {
        grad.addColorStop(0, PURPLE);
        grad.addColorStop(1, 'rgba(124,92,255,0.3)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x + gap / 2, y, Math.max(barW - gap, 1), h);
    });

    // x-axis ticks
    ctx.fillStyle = 'rgba(156,163,175,0.9)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const u = minU + (range * i) / ticks;
      ctx.fillText(`${Math.round(u * 100)}%`, xFor(u), cssH - 6);
    }
  }, [result]);

  return (
    <Box ref={wrapRef} sx={{ width: '100%' }}>
      <canvas ref={canvasRef} />
      <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
        <Legend color={PURPLE} label="within capacity" />
        <Legend color={RED} label="over capacity" />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          x: peak utilisation · y: scenario count
        </Typography>
      </Stack>
    </Box>
  );
}

function Legend({ color, label }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color }} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
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
