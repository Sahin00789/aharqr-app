/**
 * Shared artwork for the printable table-QR sticker.
 *
 * The same geometry is rendered twice: once with `@react-pdf/renderer` SVG
 * primitives (the printed A4 sheet) and once with plain DOM `<svg>` (the
 * on-screen sticker preview in the Tables screen). Keeping the shapes in one
 * place guarantees the preview matches what gets printed.
 *
 * The motifs are inspired by Indian block-print textiles and rangoli: quarter
 * rosettes in the corners, a hem of triangles, kolam dot columns and a
 * double-line border — all in very light tints so the QR plate and the ink
 * text keep full contrast and the card stays cheap to print.
 */

export const STICKER_W = 267;
export const STICKER_H = 364;

export type StickerShape =
  | {
      kind: "circle";
      cx: number;
      cy: number;
      r: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      kind: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      kind: "path";
      d: string;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
    };

const CREAM = "#fffdfa";
const SAFFRON = "#fdf1e4";
const MINT = "#eaf2ee";
const MARIGOLD = "#f9e4cd";
const MARIGOLD_LINE = "#f3d9bd";
const DOT = "#eec49f";
const LINE = "#eed9c0";
const LINE_SOFT = "#f9ecdf";
const HEM = "#fbf2e8";

const round = (v: number) => Math.round(v * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** A leaf/petal that grows outward from `(cx, cy)` along `angle`. */
function petalD(
  cx: number,
  cy: number,
  angle: number,
  rBase: number,
  rTip: number,
  halfWidth: number,
): string {
  const ux = Math.cos(rad(angle));
  const uy = Math.sin(rad(angle));
  const px = -uy;
  const py = ux;
  const bx = cx + rBase * ux;
  const by = cy + rBase * uy;
  const tx = cx + rTip * ux;
  const ty = cy + rTip * uy;
  const mid = rBase + (rTip - rBase) * 0.55;
  const c1x = cx + mid * ux + halfWidth * px;
  const c1y = cy + mid * uy + halfWidth * py;
  const c2x = cx + mid * ux - halfWidth * px;
  const c2y = cy + mid * uy - halfWidth * py;
  return `M${round(bx)} ${round(by)} Q${round(c1x)} ${round(c1y)} ${round(
    tx,
  )} ${round(ty)} Q${round(c2x)} ${round(c2y)} ${round(bx)} ${round(by)} Z`;
}

function diamondD(x: number, y: number, half: number): string {
  return `M${round(x)} ${round(y - half)} L${round(x + half)} ${round(
    y,
  )} L${round(x)} ${round(y + half)} L${round(x - half)} ${round(y)} Z`;
}

/** Quarter rangoli rosette pinned to a card corner. */
function cornerMandala(
  cx: number,
  cy: number,
  from: number,
  to: number,
): StickerShape[] {
  const shapes: StickerShape[] = [];
  const petals = 5;

  for (let i = 0; i < petals; i += 1) {
    const angle = from + ((to - from) * i) / (petals - 1);
    shapes.push({
      kind: "path",
      d: petalD(cx, cy, angle, 14, 40, 7),
      fill: MARIGOLD,
    });
  }

  /* inner ring of small petals for a layered rangoli look */
  for (let i = 0; i < 4; i += 1) {
    const angle = from + ((to - from) * (i + 0.5)) / 4;
    shapes.push({
      kind: "path",
      d: petalD(cx, cy, angle, 5, 13, 3.6),
      fill: LINE_SOFT,
    });
  }

  shapes.push({
    kind: "circle",
    cx,
    cy,
    r: 47,
    stroke: MARIGOLD_LINE,
    strokeWidth: 0.9,
  });
  shapes.push({
    kind: "circle",
    cx,
    cy,
    r: 54,
    stroke: LINE_SOFT,
    strokeWidth: 0.6,
  });

  for (let i = 0; i < 4; i += 1) {
    const angle = from + ((to - from) * (i + 0.5)) / 4;
    shapes.push({
      kind: "circle",
      cx: round(cx + 62 * Math.cos(rad(angle))),
      cy: round(cy + 62 * Math.sin(rad(angle))),
      r: 1.9,
      fill: DOT,
    });
  }

  return shapes;
}

/**
 * Vertical "buti" border: small repeating floral sprigs with a diamond
 * between them, like the block-printed edge of an Indian textile.
 */
function butiColumn(x: number): StickerShape[] {
  const shapes: StickerShape[] = [];
  const sprigs = [96, 182, 268];

  sprigs.forEach((y) => {
    [240, 270, 300].forEach((angle) => {
      shapes.push({
        kind: "path",
        d: petalD(x, y, angle, 3, 13, 4),
        fill: MARIGOLD,
      });
    });
    [204, 336].forEach((angle) => {
      shapes.push({
        kind: "path",
        d: petalD(x, y, angle, 3, 9, 2.6),
        fill: LINE_SOFT,
      });
    });
    shapes.push({ kind: "circle", cx: x, cy: y - 17, r: 1.7, fill: DOT });
  });

  [139, 225].forEach((y) => {
    shapes.push({ kind: "path", d: diamondD(x, y, 4.5), fill: MARIGOLD_LINE });
  });

  return shapes;
}

/** Triangular block-print hem along the bottom edge. */
function hem(): StickerShape[] {
  const shapes: StickerShape[] = [];
  const step = 13.35;
  for (let x = 0; x < STICKER_W; x += step) {
    shapes.push({
      kind: "path",
      d: `M${round(x)} ${STICKER_H} L${round(x + step / 2)} ${round(
        STICKER_H - 9,
      )} L${round(x + step)} ${STICKER_H} Z`,
      fill: HEM,
    });
  }
  return shapes;
}

/** Full decorative layer, drawn behind the sticker content. */
export function stickerArt(): StickerShape[] {
  return [
    {
      kind: "rect",
      x: 0,
      y: 0,
      width: STICKER_W,
      height: STICKER_H,
      fill: CREAM,
    },

    /* soft colour blooms, kept to the corners */
    { kind: "circle", cx: STICKER_W + 5, cy: -16, r: 74, fill: SAFFRON },
    { kind: "circle", cx: -12, cy: STICKER_H + 2, r: 76, fill: MINT },
    {
      kind: "circle",
      cx: STICKER_W - 6,
      cy: STICKER_H - 62,
      r: 40,
      fill: "#fdf6ef",
    },

    /* block-print frame */
    {
      kind: "rect",
      x: 7,
      y: 12,
      width: STICKER_W - 14,
      height: STICKER_H - 19,
      rx: 14,
      stroke: LINE,
      strokeWidth: 0.9,
    },
    {
      kind: "rect",
      x: 10.5,
      y: 15.5,
      width: STICKER_W - 21,
      height: STICKER_H - 26,
      rx: 11,
      stroke: LINE_SOFT,
      strokeWidth: 0.5,
    },

    /* rangoli rosettes in the four corners */
    ...cornerMandala(0, 4, 6, 86),
    ...cornerMandala(STICKER_W, 4, 94, 174),
    ...cornerMandala(0, STICKER_H - 2, 274, 354),
    ...cornerMandala(STICKER_W, STICKER_H - 2, 186, 266),

    /* kolam dot borders down both sides */
    ...butiColumn(16),
    ...butiColumn(STICKER_W - 16),

    /* block-print hem */
    ...hem(),
  ];
}
