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
 * test stops at; the bank holds enough items in every part of the difficulty
 * range to reach it, unlike the earlier 36 item bank.
 */
export const MIN_ITEMS = 12;
export const TARGET_SE = 0.35;

/**
 * Hard length limit. Without it a perfect or hopeless answer pattern walks the
 * whole bank, because the bank now spans the full difficulty range and keeps
 * offering items. Forty items is a reasonable sitting; the report has to state
 * which limit ended the test and what precision was actually reached.
 */
export const MAX_ITEMS = 40;

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
 * The bank holds two items per rule pattern and never three, so one pattern is
 * never counted twice and the reported precision stays inside what the items
 * can actually support. See assertBankShape in the self-check.
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

/** True once the test is precise enough, or long enough, to stop. */
export function shouldStop(answeredCount: number, standardError: number): boolean {
  return (
    answeredCount >= MAX_ITEMS || (answeredCount >= MIN_ITEMS && standardError <= TARGET_SE)
  );
}