import type { Cell } from "@/lib/items";

const SLOT_POS: [number, number][] = [
  [32, 50],
  [68, 50],
  [50, 74],
];

const SHAPE_NAMES = ["circle", "square", "triangle", "diamond"] as const;

// Radius terbesar tiap bentuk dalam satuan viewBox. Diamond paling lebar (1.2),
// dipakai sebagai batas untuk semua bentuk supaya tidak ada yang keluar kotak.
const SHAPE_SPAN: Record<(typeof SHAPE_NAMES)[number], number> = {
  circle: 1,
  square: 1,
  triangle: 1.15,
  diamond: 1.2,
};

function clamp(value: number, span: number) {
  const limit = 99 - span;
  return Math.min(Math.max(value, span), limit);
}

type GlyphProps = {
  shape: number;
  color: string;
  x: number;
  y: number;
  r: number;
};

function Glyph({ shape, color, x, y, r }: GlyphProps) {
  switch (SHAPE_NAMES[shape]) {
    case "square":
      return (
        <rect x={x - r} y={y - r} width={r * 2} height={r * 2} fill={color} />
      );
    case "triangle":
      return (
        <polygon
          points={`${x},${y - r * 1.15} ${x + r},${y + r * 0.75} ${x - r},${y + r * 0.75}`}
          fill={color}
        />
      );
    case "diamond":
      return (
        <polygon
          points={`${x},${y - r * 1.2} ${x + r * 1.2},${y} ${x},${y + r * 1.2} ${x - r * 1.2},${y}`}
          fill={color}
        />
      );
    default:
      return <circle cx={x} cy={y} r={r} fill={color} />;
  }
}

type CellProps = {
  cell: Cell | null;
  colors: string[];
  sizes: number[];
  nudgeV: number[][];
  nudgeH: number[][];
  missingLabel?: string;
};

/**
 * Draws one cell of the 3x3 matrix. A null cell is the missing one.
 */
export default function MatrixCell({
  cell,
  colors,
  sizes,
  nudgeV,
  nudgeH,
  missingLabel = "?",
}: CellProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full" role="img">
      <rect
        x="1"
        y="1"
        width="98"
        height="98"
        rx="6"
        className={cell ? "fill-white/5 stroke-white/25" : "fill-white/10 stroke-white/50"}
        strokeWidth="2"
        strokeDasharray={cell ? undefined : "6 5"}
      />
      {cell === null && (
        <text
          x="50"
          y="60"
          textAnchor="middle"
          className="fill-white/60 text-[34px]"
        >
          {missingLabel}
        </text>
      )}
      {cell?.map((element, i) => {
        const base = SLOT_POS[element.slot % SLOT_POS.length];
        const [dy, dx] = nudgeV[element.nudge % nudgeV.length];
        const [hx, hy] = nudgeH[element.offset % nudgeH.length];
        const r = 14 * sizes[element.size % sizes.length];
        const span = r * SHAPE_SPAN[SHAPE_NAMES[element.shape]];
        return (
          <Glyph
            key={i}
            shape={element.shape}
            color={colors[element.color % colors.length]}
            x={clamp(base[0] + dx + hx, span)}
            y={clamp(base[1] + dy + hy, span)}
            r={r}
          />
        );
      })}
    </svg>
  );
}