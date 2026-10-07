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