/**
 * «مرآة التشريح» drawing engine: turns MediaPipe hand / face landmarks into a solid, fully
 * opaque illustrated anatomy overlay (bones, teeth, a few facial muscles) — like a textbook
 * plate glued onto the live picture, not a translucent x-ray — plus labelled leader lines.
 * Pure canvas code, no React. Colours here are illustration content, not UI chrome.
 */
import type { AnatomyPartId } from '@/config/anatomyMirror';
import { ANATOMY_PARTS } from '@/config/anatomyMirror';

export interface Pt {
  x: number;
  y: number;
}
export interface LabelAnchor {
  id: AnatomyPartId;
  at: Pt;
  /** which column the label prefers: -1 left, 1 right, 0 nearest */
  side?: -1 | 0 | 1;
}
export interface LabelHit {
  id: AnatomyPartId;
  anchor: Pt;
  x: number;
  y: number;
  w: number;
  h: number;
}

// ------------------------------------------------------------------ vector helpers
const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const norm = (a: Pt): Pt => {
  const l = Math.hypot(a.x, a.y) || 1;
  return { x: a.x / l, y: a.y / l };
};
const perp = (a: Pt): Pt => ({ x: -a.y, y: a.x });
const avg = (...ps: Pt[]): Pt => mul(ps.reduce(add, { x: 0, y: 0 }), 1 / ps.length);

// Solid, opaque bone / cavity palette. No alpha < 1 here — translucency is what made the first
// version look hazy instead of like a crisp illustrated overlay.
const BONE_LIGHT = '#fffaf0';
const BONE_MID = '#ead9b5';
const BONE_EDGE = '#b89a66';
const BONE_OUTLINE = 'rgba(58, 42, 20, 0.9)';
const CAVITY = '#0a0806';

function boneFill(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, w: number) {
  const n = perp(norm(sub(b, a)));
  const m = lerp(a, b, 0.5);
  const g = ctx.createLinearGradient(m.x + n.x * w, m.y + n.y * w, m.x - n.x * w, m.y - n.y * w);
  g.addColorStop(0, BONE_EDGE);
  g.addColorStop(0.3, BONE_LIGHT);
  g.addColorStop(0.68, BONE_MID);
  g.addColorStop(1, BONE_EDGE);
  return g;
}

/**
 * A long bone: a waisted shaft with knobbly ends, from a to b (ends pulled in for the joint
 * gap). Fully opaque, with a dark contact shadow for grounding, a crisp outline and a glossy
 * highlight streak — the look of a solid illustrated bone, not a glowing x-ray.
 */
function longBone(ctx: CanvasRenderingContext2D, a0: Pt, b0: Pt, w: number, tuft = false) {
  const d = norm(sub(b0, a0));
  const gap = w * 0.28;
  const a = add(a0, mul(d, gap));
  const b = sub(b0, mul(d, tuft ? gap * 0.3 : gap));
  if (dist(a, b) < w * 0.6) return;
  const n = perp(d);
  const m = lerp(a, b, 0.5);
  const end = w * 0.5;
  const waist = w * 0.32;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = w * 0.3;
  ctx.shadowOffsetX = n.x * w * 0.12;
  ctx.shadowOffsetY = n.y * w * 0.12;
  ctx.fillStyle = boneFill(ctx, a, b, w);
  ctx.beginPath();
  ctx.moveTo(a.x + n.x * end, a.y + n.y * end);
  ctx.quadraticCurveTo(m.x + n.x * waist, m.y + n.y * waist, b.x + n.x * end, b.y + n.y * end);
  ctx.lineTo(b.x - n.x * end, b.y - n.y * end);
  ctx.quadraticCurveTo(m.x - n.x * waist, m.y - n.y * waist, a.x - n.x * end, a.y - n.y * end);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = Math.max(1, w * 0.06);
  ctx.strokeStyle = BONE_OUTLINE;
  ctx.stroke();
  // condyles: two lobes at each end, same bone colour, each with its own crisp edge
  for (const p of [a, b]) {
    for (const s of [-1, 1]) {
      const c = add(p, mul(n, s * w * 0.22));
      ctx.beginPath();
      ctx.arc(c.x, c.y, w * (p === b && tuft ? 0.34 : 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = Math.max(1, w * 0.05);
      ctx.stroke();
    }
  }
  // glossy highlight streak down the shaft (ivory sheen)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = Math.max(1, w * 0.13);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(lerp(a, m, 0.25).x + n.x * end * 0.32, lerp(a, m, 0.25).y + n.y * end * 0.32);
  ctx.quadraticCurveTo(
    m.x + n.x * waist * 0.28,
    m.y + n.y * waist * 0.28,
    lerp(m, b, 0.75).x + n.x * end * 0.32,
    lerp(m, b, 0.75).y + n.y * end * 0.32,
  );
  ctx.stroke();
  // marrow line
  ctx.strokeStyle = 'rgba(150, 120, 80, 0.5)';
  ctx.lineWidth = Math.max(1, w * 0.07);
  ctx.beginPath();
  ctx.moveTo(lerp(a, b, 0.18).x, lerp(a, b, 0.18).y);
  ctx.lineTo(lerp(a, b, 0.82).x, lerp(a, b, 0.82).y);
  ctx.stroke();
  ctx.restore();
}

/** A short rounded bone (carpal, trapezium): opaque, shaded, with its own crisp edge so
 * neighbouring bones read as separate pieces rather than one fused mass. */
function blob(ctx: CanvasRenderingContext2D, c: Pt, rx: number, ry: number, angle: number) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = rx * 0.3;
  ctx.shadowOffsetY = ry * 0.15;
  const g = ctx.createRadialGradient(c.x - rx * 0.3, c.y - ry * 0.3, 1, c.x, c.y, Math.max(rx, ry));
  g.addColorStop(0, BONE_LIGHT);
  g.addColorStop(0.7, BONE_MID);
  g.addColorStop(1, BONE_EDGE);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, rx, ry, angle, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = Math.max(1, rx * 0.14);
  ctx.strokeStyle = BONE_OUTLINE;
  ctx.stroke();
  ctx.restore();
}

/**
 * A short bowed bone bridge (zygomatic arch, brow ridge): a solid shaded ribbon from a to b
 * bulging through control point m, with an outline and a glossy highlight — reused wherever a
 * flat, raised bone needs more presence than a plain stroke.
 */
function ridge(ctx: CanvasRenderingContext2D, a: Pt, m: Pt, b: Pt, width: number) {
  // a turned head can collapse the far side's landmarks onto the near side — skip rather than
  // draw a squashed, overlapping shape
  if (dist(a, b) < width * 0.4) return;
  const d = norm(sub(b, a));
  const n = perp(d);
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = width * 0.3;
  ctx.shadowOffsetX = n.x * width * 0.14;
  ctx.shadowOffsetY = n.y * width * 0.14;
  const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
  g.addColorStop(0, BONE_EDGE);
  g.addColorStop(0.5, BONE_LIGHT);
  g.addColorStop(1, BONE_EDGE);
  ctx.fillStyle = g;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(a.x + n.x * width * 0.5, a.y + n.y * width * 0.5);
  ctx.quadraticCurveTo(m.x + n.x * width * 0.5, m.y + n.y * width * 0.5, b.x + n.x * width * 0.5, b.y + n.y * width * 0.5);
  ctx.lineTo(b.x - n.x * width * 0.5, b.y - n.y * width * 0.5);
  ctx.quadraticCurveTo(m.x - n.x * width * 0.5, m.y - n.y * width * 0.5, a.x - n.x * width * 0.5, a.y - n.y * width * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = Math.max(1, width * 0.1);
  ctx.strokeStyle = BONE_OUTLINE;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = Math.max(1, width * 0.15);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(lerp(a, m, 0.3).x + n.x * width * 0.1, lerp(a, m, 0.3).y + n.y * width * 0.1);
  ctx.quadraticCurveTo(
    m.x + n.x * width * 0.1,
    m.y + n.y * width * 0.1,
    lerp(m, b, 0.7).x + n.x * width * 0.1,
    lerp(m, b, 0.7).y + n.y * width * 0.1,
  );
  ctx.stroke();
  ctx.restore();
}

/** Smooth closed curve through points (midpoint quadratic). */
function smoothPath(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  const n = pts.length;
  ctx.beginPath();
  const m0 = lerp(pts[n - 1], pts[0], 0.5);
  ctx.moveTo(m0.x, m0.y);
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const m = lerp(p, pts[(i + 1) % n], 0.5);
    ctx.quadraticCurveTo(p.x, p.y, m.x, m.y);
  }
  ctx.closePath();
}

// ------------------------------------------------------------------ hand
const FINGERS = [
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
];

/** Draws one hand's skeleton; returns label anchors (only used for the first hand). */
export function drawHand(ctx: CanvasRenderingContext2D, lm: Pt[], canvasW: number, canvasH: number): LabelAnchor[] {
  const W = lm[0];
  const pl = dist(W, lm[9]); // palm length
  if (pl < 12) return [];
  const pw = dist(lm[5], lm[17]); // palm width
  const fore = norm(sub(W, lerp(lm[5], lm[17], 0.5))); // towards the elbow
  const thumbSide = norm(sub(lm[2], lm[17]));

  // forearm: radius (thumb side) and ulna
  const radA = add(W, mul(thumbSide, pw * 0.22));
  const ulnA = add(W, mul(thumbSide, -pw * 0.24));
  longBone(ctx, add(radA, mul(fore, pl * 1.7)), add(radA, mul(fore, pl * 0.02)), pl * 0.2);
  longBone(ctx, add(ulnA, mul(fore, pl * 1.7)), add(ulnA, mul(fore, pl * 0.1)), pl * 0.16);

  // metacarpal bases and the carpal rows
  const bases = FINGERS.map((f) => lerp(W, lm[f[0]], 0.4));
  const angle = Math.atan2(fore.y, fore.x);
  const carpR = pw * 0.085;
  const distalRow = bases.map((b) => lerp(W, b, 0.78));
  const rowCenter = avg(...bases.map((b) => lerp(W, b, 0.42)));
  const proximalRow = bases.map((b) => lerp(rowCenter, lerp(W, b, 0.42), 0.8));
  [...proximalRow, ...distalRow].forEach((c) => blob(ctx, c, carpR * 1.05, carpR * 0.85, angle));
  blob(ctx, lerp(lm[1], distalRow[0], 0.45), carpR, carpR * 0.8, angle); // trapezium under the thumb

  // metacarpals
  longBone(ctx, lm[1], lm[2], pl * 0.13);
  FINGERS.forEach((f, i) => longBone(ctx, bases[i], lm[f[0]], pl * 0.12));
  // phalanges
  longBone(ctx, lm[2], lm[3], pl * 0.11);
  longBone(ctx, lm[3], lerp(lm[3], lm[4], 0.86), pl * 0.095, true);
  for (const [mcp, pip, dip, tip] of FINGERS) {
    longBone(ctx, lm[mcp], lm[pip], pl * 0.11);
    longBone(ctx, lm[pip], lm[dip], pl * 0.095);
    longBone(ctx, lm[dip], lerp(lm[dip], lm[tip], 0.86), pl * 0.08, true);
  }

  const inside = (p: Pt) => p.x > 0 && p.y > 0 && p.x < canvasW && p.y < canvasH;
  const anchors: LabelAnchor[] = [
    { id: 'distal', at: lerp(lm[11], lm[12], 0.45) },
    { id: 'middle', at: lerp(lm[14], lm[15], 0.5) },
    { id: 'proximal', at: lerp(lm[17], lm[18], 0.5) },
    { id: 'metacarpals', at: lerp(bases[1], lm[9], 0.55) },
    { id: 'carpals', at: avg(...distalRow, ...proximalRow) },
    { id: 'radius', at: add(radA, mul(fore, pl * 0.7)) },
    { id: 'ulna', at: add(ulnA, mul(fore, pl * 0.95)) },
  ];
  return anchors.filter((a) => inside(a.at));
}

// ------------------------------------------------------------------ face / skull
const JAW_OUTER = [93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323];
const LOWER_LIP_OUTER = [291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61];
const UPPER_LIP_OUTER = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
const UPPER_LIP_INNER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308];
const LOWER_LIP_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308];

/** Point along a polyline at fraction t (by length). */
function along(pts: Pt[], t: number): Pt {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = dist(pts[i - 1], pts[i]);
    seg.push(l);
    total += l;
  }
  let target = t * total;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i]) return lerp(pts[i], pts[i + 1], seg[i] ? target / seg[i] : 0);
    target -= seg[i];
  }
  return pts[pts.length - 1];
}

function suture(ctx: CanvasRenderingContext2D, pts: Pt[], amp: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(100, 78, 44, 0.8)';
  ctx.lineWidth = Math.max(1, amp * 0.35);
  ctx.beginPath();
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = along(pts, t);
    const q = along(pts, Math.min(1, t + 0.01));
    const n = perp(norm(sub(q, p)));
    const z = add(p, mul(n, (i % 2 ? 1 : -1) * amp));
    if (i) ctx.lineTo(z.x, z.y);
    else ctx.moveTo(z.x, z.y);
  }
  ctx.stroke();
  ctx.restore();
}

function muscleFill(ctx: CanvasRenderingContext2D, from: Pt, to: Pt) {
  const g = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
  g.addColorStop(0, '#d8474c');
  g.addColorStop(0.5, '#9c111f');
  g.addColorStop(1, '#d8474c');
  return g;
}

const MUSCLE_OUTLINE = 'rgba(62, 8, 12, 0.85)';
const ARTERY_MID = '#9c0f26';
const ARTERY_LIGHT = '#e8384f';
const ARTERY_OUTLINE = 'rgba(42, 4, 10, 0.88)';
const BRAIN_LIGHT = '#e9bcc5';
const BRAIN_MID = '#c988a0';
const BRAIN_DARK = '#9b5570';

/**
 * A tapering, outlined blood-vessel line through a few points — drawn as three passes (dark
 * outline, coloured body, a thin pale sheen) so it reads as a glossy opaque tube, not a flat
 * stroke, and sits consistently with the bone/muscle rendering.
 */
function vessel(ctx: CanvasRenderingContext2D, pts: Pt[], width: number) {
  if (pts.length < 2 || dist(pts[0], pts[pts.length - 1]) < width * 0.3) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = width * 0.45;
  ctx.shadowOffsetY = width * 0.18;
  ctx.strokeStyle = ARTERY_OUTLINE;
  ctx.lineWidth = width * 1.3;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  const g = ctx.createLinearGradient(pts[0].x, pts[0].y, pts[pts.length - 1].x, pts[pts.length - 1].y);
  g.addColorStop(0, ARTERY_MID);
  g.addColorStop(1, ARTERY_LIGHT);
  ctx.strokeStyle = g;
  ctx.lineWidth = width;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = Math.max(1, width * 0.3);
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
  ctx.restore();
}

/**
 * A round "window" cut into the skull revealing the brain: a bone rim, a shaded brain fill and a
 * few wavy gyrus lines (reusing `suture`'s zigzag walk along a two-point line).
 */
function brainWindow(ctx: CanvasRenderingContext2D, c: Pt, fx: Pt, fy: Pt, rx: number, ry: number, roll: number) {
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = rx * 0.25;
  ctx.fillStyle = BONE_EDGE;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, rx * 1.14, ry * 1.14, roll, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  const g = ctx.createRadialGradient(c.x - rx * 0.3, c.y - ry * 0.3, rx * 0.1, c.x, c.y, rx * 1.05);
  g.addColorStop(0, BRAIN_LIGHT);
  g.addColorStop(0.6, BRAIN_MID);
  g.addColorStop(1, BRAIN_DARK);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, rx, ry, roll, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1, rx * 0.06);
  ctx.strokeStyle = BONE_OUTLINE;
  ctx.stroke();
  const at2 = (u: number, v: number) => add(c, add(mul(fx, u * rx), mul(fy, v * ry)));
  const amp = rx * 0.045;
  suture(ctx, [at2(-0.75, -0.35), at2(0.75, -0.35)], amp);
  suture(ctx, [at2(-0.8, 0.02), at2(0.8, 0.02)], amp);
  suture(ctx, [at2(-0.7, 0.42), at2(0.7, 0.42)], amp);
  suture(ctx, [at2(0, -0.85), at2(0, 0.85)], amp * 0.8);
  ctx.restore();
}

/** Striations: lines between two edges of a muscle. */
function fibres(ctx: CanvasRenderingContext2D, edgeA: [Pt, Pt], edgeB: [Pt, Pt], n: number, w: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 190, 190, 0.5)';
  ctx.lineWidth = Math.max(1, w);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const a = lerp(edgeA[0], edgeA[1], t);
    const b = lerp(edgeB[0], edgeB[1], t);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFace(
  ctx: CanvasRenderingContext2D,
  lm: Pt[],
  opts: { muscles: boolean; organs: boolean },
): LabelAnchor[] {
  const P = (i: number) => lm[i];
  const Wd = dist(P(234), P(454));
  const H = dist(P(10), P(152));
  if (Wd < 30) return [];
  const fx = norm(sub(P(454), P(234)));
  let fy = norm(sub(P(152), P(10)));
  fy = norm(sub(fy, mul(fx, fx.x * fy.x + fx.y * fy.y))); // orthogonal, towards the chin
  const O = P(168); // between the eyes
  const at = (u: number, v: number) => add(O, add(mul(fx, u * Wd), mul(fy, v * H)));
  const roll = Math.atan2(fx.y, fx.x);
  const ew = (dist(P(33), P(133)) + dist(P(263), P(362))) / 2;

  // cranium ellipse in the face frame
  const cc = at(0, -0.14);
  const crx = Wd * 0.6;
  const cry = H * 0.6;
  const brow = 0.1; // cranium stops below the brow line

  // 1) muscles drawn first (temporalis at the temple) so the opaque skull sits cleanly over them
  if (opts.muscles) {
    for (const s of [-1, 1]) {
      const top1 = at(s * 0.3, -0.5);
      const top2 = at(s * 0.52, -0.22);
      const coronoid = at(s * 0.33, 0.33);
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = Wd * 0.015;
      ctx.fillStyle = muscleFill(ctx, top1, coronoid);
      ctx.beginPath();
      ctx.moveTo(coronoid.x, coronoid.y);
      ctx.lineTo(top1.x, top1.y);
      const ctrl = at(s * 0.56, -0.48);
      ctx.quadraticCurveTo(ctrl.x, ctrl.y, top2.x, top2.y);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = Wd * 0.006;
      ctx.strokeStyle = MUSCLE_OUTLINE;
      ctx.stroke();
      fibres(ctx, [top1, top2], [coronoid, coronoid], 9, Wd * 0.004);
      ctx.restore();
    }
  }

  // 2) cranium (clipped above the brow, fully opaque), then the sutures
  ctx.save();
  const clipA = at(-2, brow);
  const clipB = at(2, brow);
  ctx.beginPath();
  ctx.moveTo(clipA.x, clipA.y);
  ctx.lineTo(clipB.x, clipB.y);
  const far = mul(fy, -H * 4);
  ctx.lineTo(clipB.x + far.x, clipB.y + far.y);
  ctx.lineTo(clipA.x + far.x, clipA.y + far.y);
  ctx.closePath();
  ctx.clip();
  const g = ctx.createRadialGradient(cc.x - crx * 0.25, cc.y - cry * 0.35, crx * 0.1, cc.x, cc.y, crx * 1.1);
  g.addColorStop(0, BONE_LIGHT);
  g.addColorStop(0.55, BONE_MID);
  g.addColorStop(1, BONE_EDGE);
  ctx.fillStyle = g;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = Wd * 0.025;
  ctx.beginPath();
  ctx.ellipse(cc.x, cc.y, crx, cry, roll, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = Wd * 0.012;
  ctx.strokeStyle = BONE_OUTLINE;
  ctx.stroke();
  ctx.restore();
  suture(ctx, [at(-0.52, -0.26), at(-0.3, -0.5), at(0, -0.57), at(0.3, -0.5), at(0.52, -0.26)], Wd * 0.009);
  suture(ctx, [at(0, -0.57), at(0, -0.7)], Wd * 0.008);

  // 3) mid-face: brow ridge line down to the upper lip (maxilla + zygomatic region), opaque
  const tL = at(-0.5, brow);
  const tR = at(0.5, brow);
  ctx.save();
  const mg = ctx.createLinearGradient(at(0, brow).x, at(0, brow).y, P(0).x, P(0).y);
  mg.addColorStop(0, BONE_LIGHT);
  mg.addColorStop(1, BONE_MID);
  ctx.fillStyle = mg;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = Wd * 0.018;
  smoothPath(ctx, [tL, P(234), P(93), lerp(P(132), P(61), 0.35), ...UPPER_LIP_OUTER.map(P), lerp(P(361), P(291), 0.35), P(323), P(454), tR, at(0, brow - 0.02)]);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = Wd * 0.01;
  ctx.strokeStyle = BONE_OUTLINE;
  ctx.stroke();
  ctx.restore();

  // 4) mandible (follows the jaw and the lower lip, so it opens with the mouth), opaque
  ctx.save();
  const jg = ctx.createLinearGradient(P(13).x, P(13).y, P(152).x, P(152).y);
  jg.addColorStop(0, BONE_LIGHT);
  jg.addColorStop(1, BONE_MID);
  ctx.fillStyle = jg;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = Wd * 0.02;
  smoothPath(ctx, [...JAW_OUTER.map(P), lerp(P(323), P(291), 0.3), ...LOWER_LIP_OUTER.map(P), lerp(P(93), P(61), 0.3)]);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = Wd * 0.01;
  ctx.strokeStyle = BONE_OUTLINE;
  ctx.stroke();
  // midline suture (symphysis menti) + chin boss highlight
  ctx.strokeStyle = 'rgba(100, 78, 44, 0.6)';
  ctx.lineWidth = Math.max(1, Wd * 0.004);
  ctx.beginPath();
  ctx.moveTo(lerp(P(17), P(152), 0.15).x, lerp(P(17), P(152), 0.15).y);
  ctx.lineTo(P(152).x, P(152).y);
  ctx.stroke();
  ctx.restore();
  // mental foramina
  for (const i of [176, 400]) {
    const c = lerp(P(i), P(17), 0.45);
    ctx.fillStyle = 'rgba(35, 26, 14, 0.85)';
    ctx.beginPath();
    ctx.arc(c.x, c.y, Wd * 0.009, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5) cheekbones: a solid zygomatic arch bridge from the temple to the cheekbone
  for (const [eye, sideP] of [
    [33, 234],
    [263, 454],
  ] as const) {
    const a = add(lerp(P(eye), P(sideP), 0.05), mul(fy, ew * 0.55));
    const b = add(P(sideP), mul(fy, H * 0.04));
    const m = add(lerp(a, b, 0.5), mul(fy, ew * 0.25));
    ridge(ctx, a, m, b, ew * 0.34);
  }

  // 6) brow ridge (supraorbital ridge) above each eye socket
  for (const s of [-1, 1] as const) {
    const a = at(s * 0.1, -0.06);
    const b = at(s * 0.48, 0.04);
    const m = add(lerp(a, b, 0.5), mul(fy, -ew * 0.16));
    ridge(ctx, a, m, b, ew * 0.26);
  }

  // 7) eye sockets: just the bone rim, opaque — the real eye stays visible inside it.
  // A turned head brings both eyes close together in the 2D projection; drawing two rings
  // then reads as a muddled "glasses" shape, so past that point only the near eye gets one.
  const eyes = [avg(P(33), P(133)), avg(P(263), P(362))];
  const eyeGap = dist(eyes[0], eyes[1]);
  const showBothEyes = eyeGap > ew * 1.15;
  const eyeTargets = showBothEyes ? eyes : [avg(eyes[0], eyes[1])];
  const orbitRx = ew * (showBothEyes ? 0.8 : 0.95);
  const orbitRy = ew * (showBothEyes ? 0.68 : 0.8);
  for (const c of eyeTargets) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = ew * 0.18;
    const og = ctx.createLinearGradient(c.x - ew * 0.5, c.y - ew * 0.5, c.x + ew * 0.5, c.y + ew * 0.5);
    og.addColorStop(0, BONE_LIGHT);
    og.addColorStop(1, BONE_MID);
    ctx.strokeStyle = og;
    ctx.lineWidth = ew * 0.17;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y - ew * 0.04, orbitRx, orbitRy, roll, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = BONE_OUTLINE;
    ctx.lineWidth = Math.max(1, ew * 0.03);
    ctx.stroke();
    ctx.restore();
  }

  // 8) nasal bones and the nasal cavity (the skull's actual opening, so a solid dark cavity
  // with a visible septum is the anatomically correct look, not a transparency issue)
  const nTop = lerp(P(6), P(4), 0.42);
  const nW = dist(P(98), P(327));
  longBone(ctx, P(6), nTop, ew * 0.32);
  ctx.save();
  ctx.fillStyle = CAVITY;
  const nl = add(P(98), mul(fy, -H * 0.02));
  const nr = add(P(327), mul(fy, -H * 0.02));
  const nb = lerp(P(2), P(0), 0.25);
  ctx.beginPath();
  ctx.moveTo(nTop.x, nTop.y);
  ctx.bezierCurveTo(nTop.x - fx.x * nW * 0.35, nTop.y - fx.y * nW * 0.35, nl.x, nl.y - fy.y * nW * 0.2, nl.x + fx.x * nW * 0.05, nl.y);
  ctx.quadraticCurveTo(nb.x - fx.x * nW * 0.25, nb.y - fx.y * nW * 0.25, nb.x, nb.y);
  ctx.quadraticCurveTo(nb.x + fx.x * nW * 0.25, nb.y + fx.y * nW * 0.25, nr.x - fx.x * nW * 0.05, nr.y);
  ctx.bezierCurveTo(nr.x, nr.y - fy.y * nW * 0.2, nTop.x + fx.x * nW * 0.35, nTop.y + fx.y * nW * 0.35, nTop.x, nTop.y);
  ctx.fill();
  // septum
  ctx.strokeStyle = 'rgba(230, 220, 195, 0.75)';
  ctx.lineWidth = nW * 0.05;
  ctx.beginPath();
  const sTop = lerp(nTop, nb, 0.35);
  ctx.moveTo(sTop.x, sTop.y);
  ctx.lineTo(nb.x, nb.y);
  ctx.stroke();
  ctx.restore();

  // 9) orbicularis oris (around the lips), drawn before the teeth, opaque
  const mw = dist(P(61), P(291));
  if (opts.muscles) {
    ctx.save();
    ctx.strokeStyle = '#c8303c';
    ctx.lineWidth = mw * 0.17;
    ctx.lineJoin = 'round';
    smoothPath(ctx, [...UPPER_LIP_OUTER.map(P), ...LOWER_LIP_OUTER.slice(1, -1).map(P)]);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 190, 190, 0.45)';
    ctx.lineWidth = Math.max(1, mw * 0.014);
    ctx.stroke();
    ctx.restore();
  }

  // 10) teeth: upper row hangs from the upper inner lip, lower row stands on the lower one
  const upper = UPPER_LIP_INNER.map(P);
  const lower = LOWER_LIP_INNER.map(P);
  const n = 10;
  const toothW = (mw * 0.92) / n;
  const drawRow = (line: Pt[], dir: 1 | -1) => {
    for (let i = 0; i < n; i++) {
      const t = 0.06 + (0.88 * (i + 0.5)) / n;
      const base = along(line, t);
      const centrality = 1 - Math.abs(t - 0.5) * 2; // 1 in the middle, 0 at the corners
      const h = mw * (0.1 + 0.08 * centrality);
      const w = toothW * (0.82 + 0.2 * centrality);
      const tip = add(base, mul(fy, -dir * h * 0.15));
      const root = add(base, mul(fy, -dir * h));
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = w * 0.25;
      const tg = ctx.createLinearGradient(root.x, root.y, tip.x, tip.y);
      tg.addColorStop(0, '#e8dcc0');
      tg.addColorStop(1, '#fffdf6');
      ctx.fillStyle = tg;
      ctx.beginPath();
      const half = mul(fx, w / 2);
      ctx.moveTo(root.x - half.x, root.y - half.y);
      ctx.lineTo(root.x + half.x, root.y + half.y);
      ctx.lineTo(tip.x + half.x * 0.9, tip.y + half.y * 0.9);
      ctx.quadraticCurveTo(tip.x + mul(fy, dir * h * 0.15).x, tip.y + mul(fy, dir * h * 0.15).y, tip.x - half.x * 0.9, tip.y - half.y * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(90, 70, 40, 0.7)';
      ctx.lineWidth = Math.max(1, mw * 0.01);
      ctx.stroke();
      ctx.restore();
    }
  };
  drawRow(upper, 1);
  drawRow(lower, -1);

  // 11) masseter over the jaw angle, opaque
  let masseterAt: Pt | null = null;
  if (opts.muscles) {
    for (const [sideP, angleP, s] of [
      [234, 172, -1],
      [454, 397, 1],
    ] as const) {
      const top1 = add(lerp(P(sideP), at(s * 0.3, 0.2), 0.25), mul(fy, H * 0.07));
      const top2 = at(s * 0.3, 0.26);
      const bot2 = lerp(P(angleP), P(152), 0.18);
      const bot1 = lerp(P(angleP), P(sideP), 0.12);
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = Wd * 0.012;
      ctx.fillStyle = muscleFill(ctx, top1, bot2);
      smoothPath(ctx, [top1, lerp(top1, top2, 0.5), top2, lerp(top2, bot2, 0.5), bot2, lerp(bot2, bot1, 0.5), bot1, lerp(bot1, top1, 0.5)]);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = Wd * 0.006;
      ctx.strokeStyle = MUSCLE_OUTLINE;
      ctx.stroke();
      fibres(ctx, [top1, top2], [bot1, bot2], 8, Wd * 0.003);
      ctx.restore();
      if (s === 1) masseterAt = avg(top1, top2, bot1, bot2);
    }
  }

  // 12) organs & vessels: a brain window through the skull, plus the two classic palpable
  // arteries of the head — drawn last so they sit cleanly on top of the bone/muscle layers
  let brainAt: Pt | null = null;
  let temporalArteryAt: Pt | null = null;
  let facialArteryAt: Pt | null = null;
  if (opts.organs) {
    const bc = at(0, -0.36);
    brainWindow(ctx, bc, fx, fy, Wd * 0.3, H * 0.26, roll);
    brainAt = bc;

    for (const [eyeP, sideP, jawAngle, mouthCorner, s] of [
      [33, 234, 172, 61, -1],
      [263, 454, 397, 291, 1],
    ] as const) {
      // superficial temporal artery: up from in front of the ear, forking over the temple
      const base = add(lerp(P(eyeP), P(sideP), 0.1), mul(fy, ew * 0.5));
      const mid = at(s * 0.5, -0.3);
      const frontalTip = at(s * 0.36, -0.58);
      const parietalTip = at(s * 0.6, -0.46);
      vessel(ctx, [base, mid, frontalTip], ew * 0.09);
      vessel(ctx, [mid, parietalTip], ew * 0.065);
      if (s === 1) temporalArteryAt = lerp(base, mid, 0.55);

      // facial artery: from the jaw angle, over the jaw border, across the cheek to the
      // corner of the mouth, then up beside the nose
      const p0 = lerp(P(jawAngle), P(152), 0.3);
      const p1 = at(s * 0.4, 0.14);
      const p2 = lerp(P(mouthCorner), p1, 0.4);
      const p3 = at(s * 0.16, -0.1);
      vessel(ctx, [p0, p1, p2, p3], ew * 0.075);
      if (s === 1) facialArteryAt = p2;
    }
  }

  const anchors: LabelAnchor[] = [
    { id: 'parietal', at: at(0.22, -0.62), side: 1 },
    { id: 'frontal', at: at(-0.12, -0.3), side: -1 },
    { id: 'temporal', at: at(-0.47, -0.08), side: -1 },
    { id: 'orbit', at: add(eyeTargets[eyeTargets.length - 1], mul(fx, orbitRx * 0.7)), side: 1 },
    { id: 'nasal', at: lerp(nTop, nb, 0.55), side: -1 },
    { id: 'zygomatic', at: add(lerp(P(263), P(454), 0.55), mul(fy, ew * 0.75)), side: 1 },
    { id: 'maxilla', at: lerp(P(205), P(61), 0.4), side: -1 },
    { id: 'upperTeeth', at: along(upper, 0.72), side: 1 },
    { id: 'lowerTeeth', at: along(lower, 0.72), side: 1 },
    { id: 'mandible', at: lerp(P(148), P(136), 0.4), side: -1 },
  ];
  if (opts.muscles) {
    anchors.push(
      { id: 'temporalis', at: at(-0.44, -0.3), side: -1 },
      { id: 'orbicularis', at: lerp(P(291), P(375), 0.5), side: 1 },
    );
    if (masseterAt) anchors.push({ id: 'masseter', at: masseterAt, side: 1 });
  }
  if (opts.organs) {
    if (brainAt) anchors.push({ id: 'brain', at: add(brainAt, mul(fy, -H * 0.18)), side: 0 });
    if (temporalArteryAt) anchors.push({ id: 'temporalArtery', at: temporalArteryAt, side: -1 });
    if (facialArteryAt) anchors.push({ id: 'facialArtery', at: facialArteryAt, side: 1 });
  }
  return anchors;
}

// ------------------------------------------------------------------ labels
/**
 * Lays the labels out in two columns at the canvas edges (like a textbook plate) and draws the
 * leader lines. `unit` is canvas pixels per CSS pixel, so text keeps the same size on any screen.
 */
export function drawLabels(
  ctx: CanvasRenderingContext2D,
  anchors: LabelAnchor[],
  canvasW: number,
  canvasH: number,
  unit: number,
  highlight: AnatomyPartId | null,
): LabelHit[] {
  if (!anchors.length) return [];
  const font = 12.5 * unit;
  const padX = 8 * unit;
  const h = font + 10 * unit;
  const gap = 5 * unit;
  const margin = 8 * unit;
  ctx.save();
  ctx.font = `700 ${font}px Cairo, system-ui, sans-serif`;
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const cx = anchors.reduce((s, a) => s + a.at.x, 0) / anchors.length;
  const columns: Record<'L' | 'R', LabelAnchor[]> = { L: [], R: [] };
  for (const a of anchors) {
    // by position (works mirrored or not); the hint only decides anchors near the middle
    const nearMiddle = Math.abs(a.at.x - cx) < canvasW * 0.03;
    const side = nearMiddle && a.side ? (a.side < 0 ? 'L' : 'R') : a.at.x < cx ? 'L' : 'R';
    columns[side].push(a);
  }
  // keep the columns balanced
  while (columns.L.length > columns.R.length + 3) columns.R.push(columns.L.pop()!);
  while (columns.R.length > columns.L.length + 3) columns.L.push(columns.R.pop()!);

  const hits: LabelHit[] = [];
  const placed: { a: LabelAnchor; text: string; x: number; y: number; w: number; lineEnd: Pt }[] = [];
  for (const key of ['L', 'R'] as const) {
    const list = columns[key].sort((a, b) => a.at.y - b.at.y);
    // spread vertically without overlap, staying inside the canvas
    const ys = list.map((a) => a.at.y - h / 2);
    for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + h + gap);
    // keep clear of the zoom / camera buttons along the bottom of the stage
    const overflow = (ys[ys.length - 1] ?? 0) + h + margin + 56 * unit - canvasH;
    if (overflow > 0) for (let i = 0; i < ys.length; i++) ys[i] -= overflow;
    for (let i = 0; i < ys.length; i++) ys[i] = Math.max(ys[i], margin + i * (h + gap));

    list.forEach((a, i) => {
      const text = ANATOMY_PARTS[a.id].name;
      const w = ctx.measureText(text).width + padX * 2;
      const x = key === 'L' ? margin : canvasW - margin - w;
      placed.push({ a, text, x, y: ys[i], w, lineEnd: { x: key === 'L' ? x + w : x, y: ys[i] + h / 2 } });
    });
  }

  // all leader lines first, then the dots and pills on top, so no line crosses a label
  for (const p of placed) {
    const on = highlight === p.a.id;
    ctx.strokeStyle = on ? 'rgba(255, 214, 102, 0.95)' : 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.4 * unit;
    ctx.beginPath();
    ctx.moveTo(p.a.at.x, p.a.at.y);
    ctx.lineTo(p.lineEnd.x, p.lineEnd.y);
    ctx.stroke();
  }
  for (const p of placed) {
    const on = highlight === p.a.id;
    ctx.fillStyle = on ? '#ffd666' : '#ffffff';
    ctx.beginPath();
    ctx.arc(p.a.at.x, p.a.at.y, 3.2 * unit, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(10, 14, 28, 0.9)';
    ctx.lineWidth = 1.2 * unit;
    ctx.stroke();
  }
  for (const p of placed) {
    const on = highlight === p.a.id;
    ctx.fillStyle = on ? 'rgba(120, 82, 0, 0.92)' : 'rgba(10, 14, 28, 0.82)';
    ctx.strokeStyle = on ? 'rgba(255, 214, 102, 0.9)' : 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.2 * unit;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, h, h / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(p.text, p.x + p.w / 2, p.y + h / 2 + unit);
    hits.push({ id: p.a.id, anchor: p.a.at, x: p.x, y: p.y, w: p.w, h });
  }
  ctx.restore();
  return hits;
}

/** Exponential smoothing so the overlay does not jitter. */
export function smooth(prev: Pt[] | undefined, next: Pt[], k = 0.55): Pt[] {
  if (!prev || prev.length !== next.length) return next;
  // a big jump (new hand / fast move) resets instead of dragging
  if (dist(prev[0], next[0]) > 80) return next;
  return next.map((p, i) => lerp(prev[i], p, k));
}
