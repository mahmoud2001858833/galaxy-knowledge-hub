/**
 * «مرآة التشريح» drawing engine: turns MediaPipe hand / face landmarks into an x-ray style
 * anatomy overlay (bones, teeth, a few facial muscles) plus labelled leader lines.
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

const BONE_LIGHT = '#fbf7ec';
const BONE_MID = '#e9dfc6';
const BONE_EDGE = '#b9a982';
const XRAY = 'rgba(6, 18, 44, 0.58)';
const CAVITY = 'rgba(8, 6, 4, 0.88)';

function boneFill(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, w: number) {
  const n = perp(norm(sub(b, a)));
  const m = lerp(a, b, 0.5);
  const g = ctx.createLinearGradient(m.x + n.x * w, m.y + n.y * w, m.x - n.x * w, m.y - n.y * w);
  g.addColorStop(0, BONE_EDGE);
  g.addColorStop(0.35, BONE_LIGHT);
  g.addColorStop(0.65, BONE_MID);
  g.addColorStop(1, BONE_EDGE);
  return g;
}

/** A long bone: a waisted shaft with knobbly ends, from a to b (ends pulled in for the joint gap). */
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
  ctx.fillStyle = boneFill(ctx, a, b, w);
  ctx.shadowColor = 'rgba(255, 250, 230, 0.45)';
  ctx.shadowBlur = w * 0.9;
  ctx.beginPath();
  ctx.moveTo(a.x + n.x * end, a.y + n.y * end);
  ctx.quadraticCurveTo(m.x + n.x * waist, m.y + n.y * waist, b.x + n.x * end, b.y + n.y * end);
  ctx.lineTo(b.x - n.x * end, b.y - n.y * end);
  ctx.quadraticCurveTo(m.x - n.x * waist, m.y - n.y * waist, a.x - n.x * end, a.y - n.y * end);
  ctx.closePath();
  ctx.fill();
  // condyles: two lobes at each end
  for (const p of [a, b]) {
    for (const s of [-1, 1]) {
      const c = add(p, mul(n, s * w * 0.22));
      ctx.beginPath();
      ctx.arc(c.x, c.y, w * (p === b && tuft ? 0.34 : 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.shadowBlur = 0;
  // marrow line
  ctx.strokeStyle = 'rgba(160, 140, 100, 0.35)';
  ctx.lineWidth = Math.max(1, w * 0.08);
  ctx.beginPath();
  ctx.moveTo(lerp(a, b, 0.18).x, lerp(a, b, 0.18).y);
  ctx.lineTo(lerp(a, b, 0.82).x, lerp(a, b, 0.82).y);
  ctx.stroke();
  ctx.restore();
}

function blob(ctx: CanvasRenderingContext2D, c: Pt, rx: number, ry: number, angle: number) {
  ctx.save();
  const g = ctx.createRadialGradient(c.x - rx * 0.3, c.y - ry * 0.3, 1, c.x, c.y, Math.max(rx, ry));
  g.addColorStop(0, BONE_LIGHT);
  g.addColorStop(0.7, BONE_MID);
  g.addColorStop(1, BONE_EDGE);
  ctx.fillStyle = g;
  ctx.shadowColor = 'rgba(255, 250, 230, 0.4)';
  ctx.shadowBlur = rx * 0.8;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y, rx, ry, angle, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function polyPath(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
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

  // x-ray tint: hand + forearm silhouette
  ctx.save();
  ctx.fillStyle = XRAY;
  ctx.strokeStyle = XRAY;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(6, 18, 44, 0.6)';
  ctx.shadowBlur = pl * 0.15;
  const armEnd = add(W, mul(fore, pl * 1.6));
  polyPath(ctx, [
    add(add(W, mul(thumbSide, pw * 0.42)), mul(fore, -pl * 0.05)),
    lm[2],
    lm[5],
    lm[9],
    lm[13],
    lm[17],
    add(W, mul(thumbSide, -pw * 0.45)),
    add(armEnd, mul(thumbSide, -pw * 0.5)),
    add(armEnd, mul(thumbSide, pw * 0.48)),
  ]);
  ctx.fill();
  ctx.lineWidth = pl * 0.3;
  for (const f of [[1, 2, 3, 4], ...FINGERS]) {
    ctx.beginPath();
    f.forEach((i, k) => (k ? ctx.lineTo(lm[i].x, lm[i].y) : ctx.moveTo(lm[i].x, lm[i].y)));
    ctx.stroke();
  }
  ctx.restore();

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
const OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
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
  ctx.strokeStyle = 'rgba(110, 90, 55, 0.7)';
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
  g.addColorStop(0, 'rgba(214, 64, 69, 0.82)');
  g.addColorStop(0.5, 'rgba(178, 34, 48, 0.85)');
  g.addColorStop(1, 'rgba(214, 64, 69, 0.8)');
  return g;
}

/** Striations: lines between two edges of a muscle. */
function fibres(ctx: CanvasRenderingContext2D, edgeA: [Pt, Pt], edgeB: [Pt, Pt], n: number, w: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 190, 190, 0.45)';
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
  opts: { muscles: boolean },
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
  const crx = Wd * 0.56;
  const cry = H * 0.56;
  const brow = 0.1; // cranium stops below the brow line

  // 1) x-ray tint over the whole head
  ctx.save();
  ctx.fillStyle = XRAY;
  ctx.shadowColor = XRAY;
  ctx.shadowBlur = Wd * 0.06;
  ctx.beginPath();
  ctx.ellipse(cc.x, cc.y, crx * 1.04, cry * 1.04, roll, Math.PI, Math.PI * 2);
  ctx.fill();
  polyPath(ctx, OVAL.map(P));
  ctx.fill();
  ctx.restore();

  // 2) muscles that sit under the bone outline (temporalis on the temple)
  if (opts.muscles) {
    for (const s of [-1, 1]) {
      const top1 = at(s * 0.3, -0.5);
      const top2 = at(s * 0.52, -0.22);
      const coronoid = at(s * 0.33, 0.33);
      ctx.save();
      ctx.fillStyle = muscleFill(ctx, top1, coronoid);
      ctx.beginPath();
      ctx.moveTo(coronoid.x, coronoid.y);
      ctx.lineTo(top1.x, top1.y);
      const ctrl = at(s * 0.56, -0.48);
      ctx.quadraticCurveTo(ctrl.x, ctrl.y, top2.x, top2.y);
      ctx.closePath();
      ctx.fill();
      fibres(ctx, [top1, top2], [coronoid, coronoid], 9, Wd * 0.004);
      ctx.restore();
    }
  }

  // 3) cranium (clipped above the brow), then the sutures
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
  g.addColorStop(0.65, BONE_MID);
  g.addColorStop(1, BONE_EDGE);
  ctx.fillStyle = g;
  ctx.globalAlpha = opts.muscles ? 0.78 : 0.9;
  ctx.shadowColor = 'rgba(255, 250, 230, 0.35)';
  ctx.shadowBlur = Wd * 0.05;
  ctx.beginPath();
  ctx.ellipse(cc.x, cc.y, crx, cry, roll, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  suture(ctx, [at(-0.52, -0.26), at(-0.3, -0.5), at(0, -0.57), at(0.3, -0.5), at(0.52, -0.26)], Wd * 0.008);
  suture(ctx, [at(0, -0.57), at(0, -0.7)], Wd * 0.007);
  if (opts.muscles) {
    // the temporalis shows through the thin temporal bone
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = 'rgba(200, 50, 60, 1)';
      ctx.beginPath();
      const c = at(s * 0.42, -0.12);
      ctx.ellipse(c.x, c.y, Wd * 0.1, H * 0.16, roll, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 4) mid-face: brow ridge to the upper lip (maxilla + zygomatic region)
  const tL = at(-0.5, brow);
  const tR = at(0.5, brow);
  ctx.save();
  const mg = ctx.createLinearGradient(at(0, brow).x, at(0, brow).y, P(0).x, P(0).y);
  mg.addColorStop(0, BONE_LIGHT);
  mg.addColorStop(1, BONE_MID);
  ctx.fillStyle = mg;
  ctx.globalAlpha = 0.9;
  smoothPath(ctx, [tL, P(234), P(93), lerp(P(132), P(61), 0.35), ...UPPER_LIP_OUTER.map(P), lerp(P(361), P(291), 0.35), P(323), P(454), tR, at(0, brow - 0.02)]);
  ctx.fill();
  ctx.restore();
  // cheek hollows below the cheekbones
  for (const [side, corner] of [
    [132, 61],
    [361, 291],
  ] as const) {
    const c = lerp(P(side), P(corner), 0.42);
    ctx.save();
    const hg = ctx.createRadialGradient(c.x, c.y, 1, c.x, c.y, Wd * 0.13);
    hg.addColorStop(0, 'rgba(20, 14, 8, 0.6)');
    hg.addColorStop(1, 'rgba(20, 14, 8, 0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(c.x, c.y, Wd * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 5) mandible (follows the jaw and the lower lip, so it opens with the mouth)
  ctx.save();
  const jg = ctx.createLinearGradient(P(13).x, P(13).y, P(152).x, P(152).y);
  jg.addColorStop(0, BONE_LIGHT);
  jg.addColorStop(1, BONE_MID);
  ctx.fillStyle = jg;
  ctx.globalAlpha = 0.93;
  ctx.shadowColor = 'rgba(255, 250, 230, 0.35)';
  ctx.shadowBlur = Wd * 0.03;
  smoothPath(ctx, [...JAW_OUTER.map(P), lerp(P(323), P(291), 0.3), ...LOWER_LIP_OUTER.map(P), lerp(P(93), P(61), 0.3)]);
  ctx.fill();
  ctx.restore();
  // mental foramina
  for (const i of [176, 400]) {
    const c = lerp(P(i), P(17), 0.45);
    ctx.fillStyle = 'rgba(40, 30, 18, 0.6)';
    ctx.beginPath();
    ctx.arc(c.x, c.y, Wd * 0.009, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6) cheekbones (zygomatic arch) as a raised ridge
  for (const [eye, sideP] of [
    [33, 234],
    [263, 454],
  ] as const) {
    const a = add(lerp(P(eye), P(sideP), 0.05), mul(fy, ew * 0.55));
    const b = add(P(sideP), mul(fy, H * 0.04));
    const m = add(lerp(a, b, 0.5), mul(fy, ew * 0.25));
    ctx.save();
    ctx.strokeStyle = BONE_LIGHT;
    ctx.lineCap = 'round';
    ctx.lineWidth = ew * 0.3;
    ctx.shadowColor = 'rgba(255, 250, 230, 0.6)';
    ctx.shadowBlur = ew * 0.3;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(m.x, m.y, b.x, b.y);
    ctx.stroke();
    ctx.restore();
  }

  // 7) eye sockets
  const eyes = [avg(P(33), P(133)), avg(P(263), P(362))];
  for (const c of eyes) {
    ctx.save();
    const og = ctx.createRadialGradient(c.x, c.y, ew * 0.1, c.x, c.y, ew * 0.8);
    og.addColorStop(0, 'rgba(3, 3, 6, 0.92)');
    og.addColorStop(0.75, 'rgba(25, 18, 10, 0.85)');
    og.addColorStop(1, 'rgba(60, 48, 30, 0.6)');
    ctx.fillStyle = og;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y - ew * 0.06, ew * 0.78, ew * 0.66, roll, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = BONE_LIGHT;
    ctx.lineWidth = ew * 0.12;
    ctx.globalAlpha = 0.85;
    ctx.stroke();
    ctx.restore();
  }

  // 8) nasal bones and the nasal cavity (pear-shaped opening)
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
  ctx.strokeStyle = 'rgba(230, 220, 195, 0.7)';
  ctx.lineWidth = nW * 0.05;
  ctx.beginPath();
  const sTop = lerp(nTop, nb, 0.35);
  ctx.moveTo(sTop.x, sTop.y);
  ctx.lineTo(nb.x, nb.y);
  ctx.stroke();
  ctx.restore();

  // 9) orbicularis oris (around the lips), drawn before the teeth
  const mw = dist(P(61), P(291));
  if (opts.muscles) {
    ctx.save();
    ctx.strokeStyle = 'rgba(200, 45, 58, 0.82)';
    ctx.lineWidth = mw * 0.16;
    ctx.lineJoin = 'round';
    smoothPath(ctx, [...UPPER_LIP_OUTER.map(P), ...LOWER_LIP_OUTER.slice(1, -1).map(P)]);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 190, 190, 0.35)';
    ctx.lineWidth = Math.max(1, mw * 0.012);
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
      const tg = ctx.createLinearGradient(root.x, root.y, tip.x, tip.y);
      tg.addColorStop(0, '#e8dcc0');
      tg.addColorStop(1, '#fffdf6');
      ctx.fillStyle = tg;
      ctx.strokeStyle = 'rgba(90, 70, 40, 0.55)';
      ctx.lineWidth = Math.max(1, mw * 0.008);
      ctx.beginPath();
      const half = mul(fx, w / 2);
      ctx.moveTo(root.x - half.x, root.y - half.y);
      ctx.lineTo(root.x + half.x, root.y + half.y);
      ctx.lineTo(tip.x + half.x * 0.9, tip.y + half.y * 0.9);
      ctx.quadraticCurveTo(tip.x + mul(fy, dir * h * 0.15).x, tip.y + mul(fy, dir * h * 0.15).y, tip.x - half.x * 0.9, tip.y - half.y * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  };
  drawRow(upper, 1);
  drawRow(lower, -1);

  // 11) masseter over the jaw angle
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
      ctx.fillStyle = muscleFill(ctx, top1, bot2);
      smoothPath(ctx, [top1, lerp(top1, top2, 0.5), top2, lerp(top2, bot2, 0.5), bot2, lerp(bot2, bot1, 0.5), bot1, lerp(bot1, top1, 0.5)]);
      ctx.fill();
      fibres(ctx, [top1, top2], [bot1, bot2], 8, Wd * 0.003);
      ctx.restore();
      if (s === 1) masseterAt = avg(top1, top2, bot1, bot2);
    }
  }

  const anchors: LabelAnchor[] = [
    { id: 'parietal', at: at(0.22, -0.62), side: 1 },
    { id: 'frontal', at: at(-0.12, -0.3), side: -1 },
    { id: 'temporal', at: at(-0.47, -0.08), side: -1 },
    { id: 'orbit', at: add(eyes[1], mul(fx, ew * 0.55)), side: 1 },
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
