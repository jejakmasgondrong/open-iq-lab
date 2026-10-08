export type ShapeName = "circle" | "square" | "triangle" | "diamond";

export type CellElement = {
  color: number;
  shape: number;
  slot: number;
  nudge: number;
  offset: number;
  size: number;
};

export type Cell = CellElement[];

export type ItemOption = {
  cell: Cell;
  correct: boolean;
  ruleDistance: number;
};

export type ItemRuleEntry = {
  group: string;
  attr: string;
  code: number;
};

export type Item = {
  id: string;
  clone: number;
  template: number;
  shapeSet: number;
  distractorType: string;
  nElements: number;
  nRules: number;
  ruleEntries: ItemRuleEntry[];
  ruleCodes: Record<string, { code: number; alongColumns: boolean }>;
  activeRules: string[];
  params: {
    beta: number;
    alpha3pl: number;
    gamma: number;
    alpha2pl: number;
  };
  vocab: {
    colors: string[];
    shapes: ShapeName[];
    sizes: number[];
    slots: string[];
    nudgeV: number[][];
    nudgeH: number[][];
  };
  matrix: (Cell | null)[];
  options: ItemOption[];
};

export type ItemBank = {
  source: string;
  items: Item[];
};

export const ATTR_LABELS: Record<string, string> = {
  color: "warna",
  shape: "bentuk",
  size: "ukuran",
  pos_tri: "posisi segitiga",
  pos_row: "posisi baris",
  pos_col: "posisi kolom",
};

export function mergeBanks(banks: ItemBank[]): Item[] {
  return banks.flatMap((bank) => bank.items);
}

/**
 * Fixed order: easiest first, by calibrated difficulty (beta), ties by item id
 * so the order is stable across runs.
 *
 * Kept for the item statistics table and the self-check. The test itself no
 * longer walks this list, it uses nextItem.
 */
export function byDifficulty(items: Item[]): Item[] {
  return [...items].sort((a, b) => a.params.beta - b.params.beta || a.id.localeCompare(b.id));
}

/**
 * Adaptive test shape.
 *
 * MIN_ITEMS is one full MaRs-IB short form, so a short test still has the same
 * length as the published form it comes from. TARGET_SE is the precision the
 * test stops at, because 0.35 is roughly what the best possible 36 item bank can
 * reach, not an arbitrary round number.
 */
export const MIN_ITEMS = 12;
export const TARGET_SE = 0.35;

/** Item information at a theta: alpha squared times the Bernoulli variance. */
export function information(item: Item, theta: number): number {
  const alpha = item.params.alpha2pl;
  const prob = 1 / (1 + Math.exp(-alpha * (theta - item.params.beta)));
  return alpha * alpha * prob * (1 - prob);
}

/**
 * Next item of an adaptive test: the unadministered item with the most
 * information at the current theta, ties broken by item id so a given answer
 * pattern always produces the same order. Returns undefined when the bank is
 * used up.
 *
 * The honest limit of this bank: its beta range stops at 1.6, so a very strong
 * or very weak answer pattern drives theta past the hardest or easiest item and
 * no further item is informative. Those runs always use all 36 items and end
 * with a standard error near 0.5, wider than TARGET_SE. That is the bank, not
 * the selection rule, so the report has to say it out loud.
 */
export function nextItem(items: Item[], answered: string[], theta: number): Item | undefined {
  let best: Item | undefined;
  let bestInfo = -1;
  for (const item of items) {
    if (answered.includes(item.id)) continue;
    const value = information(item, theta);
    if (value > bestInfo || (value === bestInfo && best !== undefined && item.id < best.id)) {
      best = item;
      bestInfo = value;
    }
  }
  return best;
}

/** True once the test has enough items and is precise enough to stop. */
export function shouldStop(answeredCount: number, standardError: number): boolean {
  return answeredCount >= MIN_ITEMS && standardError <= TARGET_SE;
}