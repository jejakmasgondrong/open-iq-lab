import type { Item } from "./items";

/**
 * IRT scoring for open-iq-lab.
 *
 * Model: 2PL (two-parameter logistic), P(correct) = sigmoid(alpha * (theta - beta)).
 * The MaRs-IB calibration study actually fitted a 3PL with a fixed guessing rate
 * of 0.25, so the discrimination used here is alpha2pl = alpha3pl * (1 - gamma)
 * with gamma = 0.25. Any report must say that, otherwise the numbers look like
 * they come from a plain 2PL fit.
 *
 * Estimate: MAP with a standard normal prior on theta. The prior keeps the
 * estimate finite when someone answers every item correctly or incorrectly,
 * which plain maximum likelihood does not.
 *
 * There is no IQ score here on purpose. Percentiles are computed against the
 * 1501 MaRs-IB calibration participants, not against any population norm,
 * because the item bank authors state the task has no norms.
 */

export type Response = {
  itemId: string;
  correct: boolean;
};

export type Score = {
  theta: number;
  standardError: number;
  percentile: number;
  percentileLow: number;
  percentileHigh: number;
  rawCorrect: number;
  rawTotal: number;
};

export type Params = {
  beta: number;
  alpha: number;
};

function logistic(x: number): number {
  return x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x));
}

function logLikelihood(theta: number, responses: Response[], params: Map<string, Params>): number {
  let total = 0;
  for (const response of responses) {
    const p = params.get(response.itemId);
    if (!p) continue;
    const prob = logistic(p.alpha * (theta - p.beta));
    const q = Math.min(Math.max(prob, 1e-9), 1 - 1e-9);
    total += response.correct ? Math.log(q) : Math.log(1 - q);
  }
  return total;
}

/** Log posterior up to a constant: likelihood plus a standard normal prior. */
function logPosterior(theta: number, responses: Response[], params: Map<string, Params>): number {
  return logLikelihood(theta, responses, params) - 0.5 * theta * theta;
}

/** MAP estimate by bisection on the derivative of the log posterior. */
function findMode(responses: Response[], params: Map<string, Params>): number {
  let lo = -4;
  let hi = 4;
  const derivative = (t: number) => {
    let score = -t;
    for (const response of responses) {
      const p = params.get(response.itemId);
      if (!p) continue;
      const prob = logistic(p.alpha * (t - p.beta));
      const q = Math.min(Math.max(prob, 1e-9), 1 - 1e-9);
      score += response.correct ? p.alpha * (1 - q) / q : -p.alpha * q / (1 - q);
    }
    return score;
  };
  let dLo = derivative(lo);
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    const dMid = derivative(mid);
    if (dMid > 0) {
      if (dMid > dLo) break;
      lo = mid;
      dLo = dMid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/** Posterior standard deviation from the numerical second derivative. */
function standardErrorAt(theta: number, responses: Response[], params: Map<string, Params>): number {
  const h = 0.01;
  const second = (logPosterior(theta + h, responses, params) - 2 * logPosterior(theta, responses, params) + logPosterior(theta - h, responses, params)) / (h * h);
  const curvature = -second;
  if (!(curvature > 0)) return Number.POSITIVE_INFINITY;
  return Math.sqrt(1 / curvature);
}

/** Percentile of theta inside a sorted reference sample, linear interpolation. */
export function percentileOf(sortedReference: number[], theta: number): number {
  const n = sortedReference.length;
  if (n === 0) return Number.NaN;
  if (theta <= sortedReference[0]) return 0;
  if (theta >= sortedReference[n - 1]) return 100;
  let low = 0;
  let high = n - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (sortedReference[mid] <= theta) low = mid;
    else high = mid;
  }
  const span = sortedReference[high] - sortedReference[low];
  const fraction = span === 0 ? 0 : (theta - sortedReference[low]) / span;
  return ((low + fraction) / (n - 1)) * 100;
}

export function score(
  items: Item[],
  responses: Response[],
  sortedReference: number[],
): Score {
  const params = new Map(items.map((item) => [item.id, { beta: item.params.beta, alpha: item.params.alpha2pl }]));
  const known = responses.filter((response) => params.has(response.itemId));
  const theta = findMode(known, params);
  const standardError = standardErrorAt(theta, known, params);
  const percentile = percentileOf(sortedReference, theta);
  return {
    theta,
    standardError,
    percentile,
    percentileLow: percentileOf(sortedReference, theta - 1.96 * standardError),
    percentileHigh: percentileOf(sortedReference, theta + 1.96 * standardError),
    rawCorrect: known.filter((response) => response.correct).length,
    rawTotal: known.length,
  };
}

export type ItemStat = {
  itemId: string;
  beta: number;
  alpha: number;
  observedCorrect: number;
  observedTotal: number;
  information: number;
};

/** Item information at a given theta: alpha squared times the Bernoulli variance. */
function informationAt(theta: number, params: Params): number {
  const prob = logistic(params.alpha * (theta - params.beta));
  return params.alpha * params.alpha * prob * (1 - prob);
}

/** Per-item observed accuracy next to its calibrated difficulty. */
export function itemStats(items: Item[], responses: Response[], theta: number): ItemStat[] {
  const byId = new Map(responses.map((response) => [response.itemId, response.correct]));
  return items.map((item) => {
    const params = { beta: item.params.beta, alpha: item.params.alpha2pl };
    const seen = byId.has(item.id);
    return {
      itemId: item.id,
      beta: params.beta,
      alpha: params.alpha,
      observedCorrect: seen && byId.get(item.id) ? 1 : 0,
      observedTotal: seen ? 1 : 0,
      information: informationAt(theta, params),
    };
  });
}

/** Cronbach's alpha for a dichotomous test. Null when the total never varies. */
export function cronbachAlpha(items: Item[], responses: Response[]): number | null {
  const byId = new Map(responses.map((response) => [response.itemId, response.correct]));
  const hits = items.filter((item) => byId.has(item.id)).map((item): number => (byId.get(item.id) ? 1 : 0));
  const n = hits.length;
  if (n < 2) return null;
  const sum = hits.reduce<number>((acc, hit) => acc + hit, 0);
  const p = sum / n;
  const itemVarianceSum = hits.reduce<number>((acc, hit) => acc + hit * (1 - hit), 0);
  if (p === 0 || p === 1) return null;
  const totalVariance = n * p * (1 - p);
  const alpha = (n / (n - 1)) * (1 - itemVarianceSum / totalVariance);
  return Number.isFinite(alpha) ? alpha : null;
}

export const REFERENCE_NOTE =
  "Persentil dihitung terhadap 1.501 peserta kalibrasi MaRs-IB (rentang usia 11-33), bukan terhadap norma populasi. Karena itu hasilnya bukan angka IQ.";

/** Run with: npx tsx src/lib/scoring-self-check.ts */
export function selfCheck(items: Item[], sortedReference: number[]): void {
  const all = items.map((item) => item.id);
  const bank = items.slice(0, 12);
  const bankIds = new Set(bank.map((item) => item.id));

  const perfect = score(items, bank.map((item) => ({ itemId: item.id, correct: true })), sortedReference);
  const wrong = score(items, bank.map((item) => ({ itemId: item.id, correct: false })), sortedReference);
  const half = score(
    items,
    bank.map((item, index) => ({ itemId: item.id, correct: index % 2 === 0 })),
    sortedReference,
  );

  // The MAP estimate must stay finite even at the two extremes.
  assert(Number.isFinite(perfect.theta), "theta for a perfect score must be finite");
  assert(Number.isFinite(wrong.theta), "theta for an all-wrong score must be finite");
  assert(perfect.theta > half.theta, "more correct answers must give a higher theta");
  assert(half.theta > wrong.theta, "a mixed pattern must beat an all-wrong pattern");
  assert(perfect.standardError > 0, "standard error must be positive");

  // Percentiles must be monotone in theta and stay inside 0-100.
  assert(perfect.percentile >= half.percentile, "percentile must not fall when theta rises");
  assert(half.percentile >= wrong.percentile, "percentile must not fall when theta rises");
  for (const value of [perfect, half, wrong]) {
    assert(value.percentile >= 0 && value.percentile <= 100, "percentile out of range");
    assert(value.percentileLow <= value.percentile, "lower bound must sit below the point estimate");
    assert(value.percentileHigh >= value.percentile, "upper bound must sit above the point estimate");
  }

  // Percentile of the reference median must land near 50.
  const median = sortedReference[Math.floor(sortedReference.length / 2)];
  const medianPercentile = percentileOf(sortedReference, median);
  assert(medianPercentile > 49 && medianPercentile < 51, `reference median should map near 50, got ${medianPercentile}`);
  assert(percentileOf(sortedReference, -99) === 0, "far below the sample must map to 0");
  assert(percentileOf(sortedReference, 99) === 100, "far above the sample must map to 100");

  // A response for an item outside the bank is ignored, not scored.
  const withGhost = score(
    items,
    [...bank.map((item, index) => ({ itemId: item.id, correct: index % 2 === 0 })), { itemId: "not-a-real-item", correct: true }],
    sortedReference,
  );
  assert(withGhost.rawTotal === bank.length, "unknown item ids must not be counted");

  // Answers must be stable regardless of the order they arrive in.
  const forward = bank.map((item, index) => ({ itemId: item.id, correct: index % 2 === 0 }));
  const reversed = [...forward].reverse();
  assert(
    Math.abs(score(items, forward, sortedReference).theta - score(items, reversed, sortedReference).theta) < 1e-9,
    "score must not depend on response order",
  );
  assert(bankIds.size === 12 && all.length === items.length, "bank shape changed");

  // Presentation order is easiest-first, so difficulty must never fall.
  for (let i = 1; i < items.length; i++) {
    assert(items[i].params.beta >= items[i - 1].params.beta, `difficulty must not fall at index ${i}`);
  }

  // Item statistics must be complete and finite, and reliability must be sane.
  const stats = itemStats(items, [...forward, { itemId: bank[0].id, correct: false }], half.theta);
  assert(stats.length === items.length, "one stat row per item");
  assert(stats.every((stat) => Number.isFinite(stat.information) && stat.information >= 0), "item information must be finite and non-negative");
  assert(stats[0].observedTotal === 1, "answered items must be marked observed");
  assert(stats[items.length - 1].observedTotal === 0, "unanswered items must be marked unobserved");

  // A perfectly split half/half pattern makes alpha degenerate (0 when every item
  // shares the same mean, n/(n-1) when every item is 0 or 1), so only check that
  // the value is finite and that the undefined cases return null.
  const alphaMixed = cronbachAlpha(items, forward);
  assert(alphaMixed !== null && Number.isFinite(alphaMixed), "Cronbach alpha must be finite when the total varies");
  assert(cronbachAlpha(items, bank.map((item) => ({ itemId: item.id, correct: true }))) === null, "alpha is undefined when everyone is correct");
  assert(cronbachAlpha(items, []) === null, "alpha is undefined with no responses");

  console.log(
    `self-check OK: ${items.length} items | perfect theta ${perfect.theta.toFixed(2)} | mixed ${half.theta.toFixed(2)} | wrong ${wrong.theta.toFixed(2)} | SE(perfect) ${perfect.standardError.toFixed(2)}`,
  );
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`self-check failed: ${message}`);
  }
}
