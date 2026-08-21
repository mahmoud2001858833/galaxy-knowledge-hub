/**
 * Chemical kinetics: rate laws, Arrhenius temperature dependence,
 * collision theory fractions, catalysis and concentration-time integration.
 * Concentrations in mol/L, temperature in K, energies in kJ/mol.
 */

export type KineticsMode = 'collisions' | 'progress' | 'energy';

export interface Reaction {
  id: string;
  name: string;
  equation: string;
  /** Activation energy without catalyst (kJ/mol). */
  ea: number;
  /** Activation energy with catalyst (kJ/mol). */
  eaCat: number;
  /** Enthalpy change (kJ/mol); negative = exothermic. */
  dH: number;
  /** Pre-exponential factor (1/s scale, simplified). */
  a: number;
  /** Reaction order in the main reactant. */
  order: 1 | 2;
  colorA: string;
  colorB: string;
  colorP: string;
}

export const REACTIONS: Reaction[] = [
  {
    id: 'h2o2',
    name: 'تفكك فوق أكسيد الهيدروجين',
    equation: '2H₂O₂ → 2H₂O + O₂',
    ea: 75,
    eaCat: 25,
    dH: -98,
    a: 6e9,
    order: 1,
    colorA: '#38bdf8',
    colorB: '#a3e635',
    colorP: '#f59e0b',
  },
  {
    id: 'thio',
    name: 'ثيوكبريتات الصوديوم مع الحمض',
    equation: 'Na₂S₂O₃ + 2HCl → S + SO₂ + 2NaCl + H₂O',
    ea: 52,
    eaCat: 34,
    dH: -41,
    a: 2.2e7,
    order: 2,
    colorA: '#f472b6',
    colorB: '#facc15',
    colorP: '#94a3b8',
  },
  {
    id: 'nh3',
    name: 'تخليق الأمونيا (هابر)',
    equation: 'N₂ + 3H₂ ⇌ 2NH₃',
    ea: 230,
    eaCat: 103,
    dH: -92,
    a: 8e11,
    order: 2,
    colorA: '#22d3ee',
    colorB: '#e2e8f0',
    colorP: '#818cf8',
  },
  {
    id: 'ester',
    name: 'تحلل الإستر المائي',
    equation: 'CH₃COOC₂H₅ + H₂O → CH₃COOH + C₂H₅OH',
    ea: 68,
    eaCat: 46,
    dH: -12,
    a: 1.5e8,
    order: 1,
    colorA: '#c084fc',
    colorB: '#38bdf8',
    colorP: '#4ade80',
  },
  {
    id: 'iodine',
    name: 'ساعة اليود',
    equation: 'S₂O₈²⁻ + 2I⁻ → 2SO₄²⁻ + I₂',
    ea: 56,
    eaCat: 38,
    dH: -60,
    a: 4.5e7,
    order: 2,
    colorA: '#fb7185',
    colorB: '#fde047',
    colorP: '#7c3aed',
  },
];

export const findReaction = (id: string): Reaction =>
  REACTIONS.find((r) => r.id === id) ?? REACTIONS[0];

const R_KJ = 0.008314; // kJ/mol·K

export interface KineticsParams {
  reactionId: string;
  /** Initial concentration of the main reactant (mol/L). */
  concentration: number;
  temperature: number; // K
  catalyst: boolean;
  /** Surface area factor 1..5 (grain size effect). */
  surface: number;
  /** Elapsed reaction time (s). */
  time: number;
}

export interface KineticsStats {
  reaction: Reaction;
  /** Effective activation energy (kJ/mol). */
  ea: number;
  /** Rate constant k. */
  k: number;
  /** Instantaneous rate (mol/L·s). */
  rate: number;
  /** Remaining reactant concentration at t (mol/L). */
  remaining: number;
  /** Product concentration at t (mol/L). */
  product: number;
  /** Conversion fraction 0..1. */
  conversion: number;
  /** Half-life (s). */
  halfLife: number;
  /** Fraction of collisions with E ≥ Ea. */
  successFraction: number;
  /** Relative collision frequency (visual). */
  collisionRate: number;
  /** Speed-up factor thanks to the catalyst. */
  catalystBoost: number;
}

/** Arrhenius rate constant with catalyst and surface-area enhancement. */
export function rateConstant(r: Reaction, tempK: number, catalyst: boolean, surface = 1): number {
  const ea = catalyst ? r.eaCat : r.ea;
  return r.a * Math.exp(-ea / (R_KJ * Math.max(tempK, 1))) * (0.6 + 0.4 * surface);
}

/** Fraction of molecules exceeding Ea (Maxwell–Boltzmann tail). */
export function successFraction(ea: number, tempK: number): number {
  return Math.exp(-ea / (R_KJ * Math.max(tempK, 1)));
}

/** Concentration at time t for first- or second-order kinetics. */
export function concentrationAt(r: Reaction, c0: number, k: number, t: number): number {
  if (r.order === 1) return c0 * Math.exp(-k * t);
  return c0 / (1 + k * c0 * t);
}

export function computeKinetics(p: KineticsParams): KineticsStats {
  const r = findReaction(p.reactionId);
  const ea = p.catalyst ? r.eaCat : r.ea;
  const k = rateConstant(r, p.temperature, p.catalyst, p.surface);
  const remaining = Math.max(0, concentrationAt(r, p.concentration, k, p.time));
  const rate = r.order === 1 ? k * remaining : k * remaining * remaining;
  const halfLife = r.order === 1 ? Math.log(2) / Math.max(k, 1e-12) : 1 / Math.max(k * p.concentration, 1e-12);
  const sf = successFraction(ea, p.temperature);
  const kNo = rateConstant(r, p.temperature, false, p.surface);

  return {
    reaction: r,
    ea,
    k,
    rate,
    remaining,
    product: Math.max(0, p.concentration - remaining),
    conversion: p.concentration > 0 ? 1 - remaining / p.concentration : 0,
    halfLife,
    successFraction: sf,
    collisionRate: Math.sqrt(p.temperature / 300) * p.concentration * (0.6 + 0.4 * p.surface),
    catalystBoost: k / Math.max(kNo, 1e-12),
  };
}

/** Concentration–time curves for reactant and product. */
export function progressCurve(p: KineticsParams, points = 120) {
  const r = findReaction(p.reactionId);
  const k = rateConstant(r, p.temperature, p.catalyst, p.surface);
  const tEnd = Math.max(
    4,
    Math.min(600, (r.order === 1 ? Math.log(2) / Math.max(k, 1e-9) : 1 / Math.max(k * p.concentration, 1e-9)) * 6)
  );
  const out: { t: number; reactant: number; product: number; rate: number }[] = [];
  for (let i = 0; i <= points; i++) {
    const t = (tEnd * i) / points;
    const c = concentrationAt(r, p.concentration, k, t);
    const rate = r.order === 1 ? k * c : k * c * c;
    out.push({
      t: Number(t.toFixed(2)),
      reactant: Number(c.toFixed(4)),
      product: Number((p.concentration - c).toFixed(4)),
      rate: Number(rate.toFixed(5)),
    });
  }
  return out;
}

/** Arrhenius plot: ln k vs 1000/T, with and without catalyst. */
export function arrheniusPlot(p: KineticsParams, points = 40) {
  const r = findReaction(p.reactionId);
  const out: { invT: number; lnk: number; lnkCat: number; temp: number }[] = [];
  for (let i = 0; i <= points; i++) {
    const t = 250 + (i * 500) / points;
    out.push({
      temp: Math.round(t),
      invT: Number((1000 / t).toFixed(3)),
      lnk: Number(Math.log(rateConstant(r, t, false, p.surface)).toFixed(3)),
      lnkCat: Number(Math.log(rateConstant(r, t, true, p.surface)).toFixed(3)),
    });
  }
  return out;
}

/** Reaction-coordinate energy profile (kJ/mol) for the plot and the 3D hill. */
export function energyProfile(reactionId: string, catalyst: boolean, points = 80) {
  const r = findReaction(reactionId);
  const ea = catalyst ? r.eaCat : r.ea;
  const out: { x: number; e: number }[] = [];
  for (let i = 0; i <= points; i++) {
    const x = i / points;
    const bump = ea * Math.exp(-Math.pow((x - 0.45) / 0.16, 2));
    const base = r.dH * (1 / (1 + Math.exp(-(x - 0.5) * 12)));
    out.push({ x: Number(x.toFixed(3)), e: Number((base + bump).toFixed(2)) });
  }
  return out;
}

/** Boltzmann energy distribution used for the collision-theory chart. */
export function energyDistribution(tempK: number, eaLine: number, points = 70) {
  const out: { e: number; f: number; active: number }[] = [];
  const eMax = Math.max(eaLine * 1.8, 120);
  for (let i = 0; i <= points; i++) {
    const e = (eMax * i) / points;
    const f = Math.sqrt(e) * Math.exp(-e / (R_KJ * Math.max(tempK, 1))) * 40;
    out.push({
      e: Number(e.toFixed(1)),
      f: Number(f.toFixed(6)),
      active: e >= eaLine ? Number(f.toFixed(6)) : 0,
    });
  }
  return out;
}
