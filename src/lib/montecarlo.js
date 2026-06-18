// Monte Carlo bandwidth-demand simulator — dependency-free and seeded.
//
// Models aggregate demand on a shared network link. Each of N users is
// independently "active" at any given instant with probability p, and an
// active user pulls a random amount of bandwidth drawn from a lognormal
// distribution (right-skewed — most users are light, a few are heavy, which
// is what real traffic looks like). For each trial we simulate a window of
// time steps, track the peak link utilisation, and repeat across thousands of
// trials to build an empirical distribution of peak load. From that we read
// off percentiles (P50/P95/P99) and the probability the link saturates.
//
// This is a clean-room re-implementation of the same statistical technique
// used in capacity planning — written entirely against synthetic inputs so it
// can be shared publicly.

// --- Seeded PRNG (mulberry32) so a run is reproducible and re-runs differ ---
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box–Muller: one standard normal sample from two uniforms.
function randn(rng) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Lognormal sample with a target arithmetic mean and coefficient of variation.
// We convert (mean, cv) into the underlying normal's (mu, sigma).
function lognormalSampler(mean, cv) {
  const sigma2 = Math.log(1 + cv * cv);
  const sigma = Math.sqrt(sigma2);
  const mu = Math.log(mean) - sigma2 / 2;
  return (rng) => Math.exp(mu + sigma * randn(rng));
}

function percentile(sortedAsc, q) {
  if (sortedAsc.length === 0) return 0;
  const idx = (sortedAsc.length - 1) * q;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  const w = idx - lo;
  return sortedAsc[lo] * (1 - w) + sortedAsc[hi] * w;
}

/**
 * Run the simulation.
 * @param {object} params
 * @param {number} params.users        number of users sharing the link
 * @param {number} params.activeProb   probability a user is transmitting at an instant (0..1)
 * @param {number} params.meanDemand   mean Mbps pulled by an active user
 * @param {number} params.cvDemand     coefficient of variation of per-user demand
 * @param {number} params.capacity     link capacity in Mbps
 * @param {number} params.timeSteps    time steps simulated per trial
 * @param {number} params.trials       number of Monte Carlo trials
 * @param {number} [params.seed]       PRNG seed
 * @returns {object} summary stats + peak-utilisation samples for plotting
 */
export function simulate(params) {
  const {
    users,
    activeProb,
    meanDemand,
    cvDemand,
    capacity,
    timeSteps,
    trials,
    seed = 1,
  } = params;

  const rng = mulberry32(seed);
  const sampleDemand = lognormalSampler(meanDemand, cvDemand);

  const peaks = new Float64Array(trials); // peak utilisation per trial (fraction of capacity)
  let congested = 0; // trials whose peak exceeded capacity

  for (let t = 0; t < trials; t++) {
    let peakLoad = 0;
    for (let s = 0; s < timeSteps; s++) {
      let agg = 0;
      for (let u = 0; u < users; u++) {
        if (rng() < activeProb) agg += sampleDemand(rng);
      }
      if (agg > peakLoad) peakLoad = agg;
    }
    const util = peakLoad / capacity;
    peaks[t] = util;
    if (util > 1) congested++;
  }

  const sorted = Array.from(peaks).sort((a, b) => a - b);
  const mean = sorted.reduce((acc, v) => acc + v, 0) / (sorted.length || 1);

  return {
    peaks: sorted, // ascending, fractions of capacity (1 = 100%)
    mean,
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
    max: sorted[sorted.length - 1] ?? 0,
    congestionProb: congested / (trials || 1),
    expectedActive: users * activeProb,
    params,
  };
}

/**
 * Bin peak-utilisation samples into a histogram for plotting.
 * @returns {{ bins: number[], edges: number[], binWidth: number }}
 */
export function histogram(values, binCount = 28) {
  if (!values.length) return { bins: [], edges: [], binWidth: 0 };
  const min = values[0];
  const max = values[values.length - 1];
  const span = max - min || 1;
  const binWidth = span / binCount;
  const bins = new Array(binCount).fill(0);
  for (const v of values) {
    let i = Math.floor((v - min) / binWidth);
    if (i >= binCount) i = binCount - 1;
    if (i < 0) i = 0;
    bins[i]++;
  }
  const edges = bins.map((_, i) => min + i * binWidth);
  return { bins, edges, binWidth };
}
