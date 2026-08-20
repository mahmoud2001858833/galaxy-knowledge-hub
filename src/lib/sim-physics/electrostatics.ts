/** Isolated electrostatics engine: Coulomb's law, electric field/potential mapping, Van de Graaff. */

export const K_E = 8.9875517923e9; // N·m²/C²
export const EPS0 = 8.8541878128e-12;
export const ELEMENTARY_CHARGE = 1.602176634e-19;

export type ElectrostaticsMode = 'coulomb' | 'field' | 'vandegraaff';

export interface PointCharge {
  id: string;
  /** charge in nanocoulombs */
  q: number;
  /** position in metres */
  x: number;
  y: number;
}

export interface ElectrostaticsParams {
  mode: ElectrostaticsMode;
  /** charge 1 and 2 in nC (coulomb mode) */
  q1: number;
  q2: number;
  /** separation in cm */
  separation: number;
  /** relative permittivity of the medium */
  epsilonR: number;
  /** field-mode charges */
  charges: PointCharge[];
  /** probe position (m) */
  probeX: number;
  probeY: number;
  /** Van de Graaff dome radius (cm) and accumulated charge (µC) */
  domeRadius: number;
  domeCharge: number;
  /** belt speed (arbitrary 0..3) */
  beltSpeed: number;
}

export interface ElectrostaticsStats {
  force: number; // N
  attractive: boolean;
  fieldAtProbe: number; // V/m
  fieldAngle: number; // deg
  fieldX: number;
  fieldY: number;
  potentialAtProbe: number; // V
  potentialEnergy: number; // J
  domeSurfaceField: number; // V/m
  domePotential: number; // V
  breakdown: boolean; // exceeds 3 MV/m air breakdown
  sparkLength: number; // cm
  electronsTransferred: number;
  capacitance: number; // F of the dome
}

const nC = 1e-9;

export function computeElectrostatics(p: ElectrostaticsParams): ElectrostaticsStats {
  const k = K_E / Math.max(p.epsilonR, 1);
  const r = Math.max(p.separation / 100, 0.005);
  const q1 = p.q1 * nC;
  const q2 = p.q2 * nC;

  const force = (k * Math.abs(q1 * q2)) / (r * r);
  const attractive = q1 * q2 < 0;
  const potentialEnergy = (k * q1 * q2) / r;

  // superposition at the probe
  let ex = 0;
  let ey = 0;
  let v = 0;
  for (const c of p.charges) {
    const dx = p.probeX - c.x;
    const dy = p.probeY - c.y;
    const d2 = Math.max(dx * dx + dy * dy, 1e-4);
    const d = Math.sqrt(d2);
    const e = (k * c.q * nC) / d2;
    ex += (e * dx) / d;
    ey += (e * dy) / d;
    v += (k * c.q * nC) / d;
  }
  const fieldAtProbe = Math.hypot(ex, ey);
  const fieldAngle = (Math.atan2(ey, ex) * 180) / Math.PI;

  // Van de Graaff dome
  const R = Math.max(p.domeRadius / 100, 0.02);
  const Q = p.domeCharge * 1e-6;
  const domeSurfaceField = (K_E * Math.abs(Q)) / (R * R);
  const domePotential = (K_E * Q) / R;
  const breakdown = domeSurfaceField > 3e6;
  const sparkLength = breakdown ? Math.min((Math.abs(domePotential) / 3e6) * 100, 60) : 0;
  const electronsTransferred = Math.abs(Q) / ELEMENTARY_CHARGE;
  const capacitance = 4 * Math.PI * EPS0 * R;

  return {
    force,
    attractive,
    fieldAtProbe,
    fieldAngle,
    fieldX: ex,
    fieldY: ey,
    potentialAtProbe: v,
    potentialEnergy,
    domeSurfaceField,
    domePotential,
    breakdown,
    sparkLength,
    electronsTransferred,
    capacitance,
  };
}

/** Field vector at an arbitrary point (used by the 3D scene for field lines). */
export function fieldAt(charges: PointCharge[], x: number, y: number, epsilonR = 1) {
  const k = K_E / Math.max(epsilonR, 1);
  let ex = 0;
  let ey = 0;
  for (const c of charges) {
    const dx = x - c.x;
    const dy = y - c.y;
    const d2 = Math.max(dx * dx + dy * dy, 4e-4);
    const d = Math.sqrt(d2);
    const e = (k * c.q * nC) / d2;
    ex += (e * dx) / d;
    ey += (e * dy) / d;
  }
  return { ex, ey, mag: Math.hypot(ex, ey) };
}

/** Trace one field line by integrating the field direction. */
export function traceFieldLine(
  charges: PointCharge[],
  startX: number,
  startY: number,
  direction: 1 | -1,
  steps = 220,
  step = 0.035
): [number, number][] {
  const pts: [number, number][] = [];
  let x = startX;
  let y = startY;
  for (let i = 0; i < steps; i++) {
    const { ex, ey, mag } = fieldAt(charges, x, y);
    if (!Number.isFinite(mag) || mag === 0) break;
    x += (direction * ex * step) / mag;
    y += (direction * ey * step) / mag;
    if (Math.abs(x) > 5 || Math.abs(y) > 5) break;
    pts.push([x, y]);
    if (charges.some((c) => Math.hypot(x - c.x, y - c.y) < 0.06)) break;
  }
  return pts;
}

/** Force vs separation curve. */
export function forceCurve(p: ElectrostaticsParams, points = 80) {
  const out: { r: number; 'القوة (mN)': number; 'طاقة الوضع (mJ)': number }[] = [];
  const k = K_E / Math.max(p.epsilonR, 1);
  for (let i = 1; i <= points; i++) {
    const r = (i / points) * 0.5 + 0.01;
    const f = (k * Math.abs(p.q1 * nC * p.q2 * nC)) / (r * r);
    const u = (k * p.q1 * nC * p.q2 * nC) / r;
    out.push({
      r: Number((r * 100).toFixed(1)),
      'القوة (mN)': Number(Math.min(f * 1e3, 5000).toFixed(3)),
      'طاقة الوضع (mJ)': Number(Math.max(Math.min(u * 1e3, 5000), -5000).toFixed(3)),
    });
  }
  return out;
}

/** Potential and field along the x-axis through the configured charges. */
export function potentialProfile(p: ElectrostaticsParams, points = 120) {
  const out: { x: number; 'الجهد (kV)': number; 'المجال (kV/m)': number }[] = [];
  for (let i = 0; i <= points; i++) {
    const x = -2 + (i / points) * 4;
    const { ex, ey } = fieldAt(p.charges, x, 0.001, p.epsilonR);
    let v = 0;
    const k = K_E / Math.max(p.epsilonR, 1);
    for (const c of p.charges) {
      const d = Math.max(Math.hypot(x - c.x, 0.001 - c.y), 0.02);
      v += (k * c.q * nC) / d;
    }
    out.push({
      x: Number(x.toFixed(2)),
      'الجهد (kV)': Number(Math.max(Math.min(v / 1e3, 200), -200).toFixed(2)),
      'المجال (kV/m)': Number(Math.min(Math.hypot(ex, ey) / 1e3, 400).toFixed(2)),
    });
  }
  return out;
}
