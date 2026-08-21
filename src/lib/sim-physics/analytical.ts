/**
 * Analytical chemistry: acid–base titration curves, Beer–Lambert
 * spectrophotometry and chromatographic separation (Rf / retention).
 */

export type AnalyticalMode = 'titration' | 'spectro' | 'chromato';

/* ---------------- titration ---------------- */

export interface Analyte {
  id: string;
  name: string;
  formula: string;
  /** pKa; null for a strong acid. */
  pka: number | null;
  /** Number of acidic protons. */
  protons: 1 | 2;
  color: string;
}

export const ANALYTES: Analyte[] = [
  { id: 'hcl', name: 'حمض الهيدروكلوريك', formula: 'HCl', pka: null, protons: 1, color: '#38bdf8' },
  { id: 'ch3cooh', name: 'حمض الإيثانويك', formula: 'CH₃COOH', pka: 4.76, protons: 1, color: '#f59e0b' },
  { id: 'hf', name: 'حمض الهيدروفلوريك', formula: 'HF', pka: 3.17, protons: 1, color: '#a3e635' },
  { id: 'hcn', name: 'حمض الهيدروسيانيك', formula: 'HCN', pka: 9.21, protons: 1, color: '#c084fc' },
  { id: 'h2co3', name: 'حمض الكربونيك', formula: 'H₂CO₃', pka: 6.35, protons: 2, color: '#94a3b8' },
];

export const findAnalyte = (id: string): Analyte => ANALYTES.find((a) => a.id === id) ?? ANALYTES[0];

export interface Indicator {
  id: string;
  name: string;
  low: number;
  high: number;
  colorAcid: string;
  colorBase: string;
}

export const INDICATORS: Indicator[] = [
  { id: 'phenolphthalein', name: 'الفينولفثالين', low: 8.2, high: 10, colorAcid: '#f1f5f9', colorBase: '#ec4899' },
  { id: 'methylorange', name: 'الميثيل البرتقالي', low: 3.1, high: 4.4, colorAcid: '#ef4444', colorBase: '#f59e0b' },
  { id: 'bromothymol', name: 'أزرق البروموثيمول', low: 6.0, high: 7.6, colorAcid: '#facc15', colorBase: '#2563eb' },
  { id: 'litmus', name: 'عبّاد الشمس', low: 5.0, high: 8.0, colorAcid: '#f87171', colorBase: '#60a5fa' },
];

export const findIndicator = (id: string): Indicator =>
  INDICATORS.find((i) => i.id === id) ?? INDICATORS[0];

export interface TitrationParams {
  analyteId: string;
  /** Analyte concentration (mol/L). */
  ca: number;
  /** Analyte volume (mL). */
  va: number;
  /** Titrant (strong base) concentration (mol/L). */
  cb: number;
  /** Volume of titrant added so far (mL). */
  vb: number;
  indicatorId: string;
}

const KW = 1e-14;

/** pH of the mixture after adding vb mL of strong base to the analyte. */
export function titrationPH(p: TitrationParams, vbOverride?: number): number {
  const a = findAnalyte(p.analyteId);
  const vb = vbOverride ?? p.vb;
  const molA = (p.ca * p.va) / 1000; // mol of acid (per proton set)
  const molB = (p.cb * vb) / 1000;
  const vTot = (p.va + vb) / 1000; // L
  const nProt = a.protons;
  const totalAcid = molA * nProt;

  if (a.pka === null) {
    // strong acid vs strong base
    const diff = totalAcid - molB;
    if (Math.abs(diff) < 1e-12) return 7;
    if (diff > 0) return -Math.log10(diff / vTot);
    return 14 + Math.log10(-diff / vTot);
  }

  const ka = Math.pow(10, -a.pka);
  if (molB <= 1e-15) {
    // weak acid alone: [H+] = sqrt(Ka·C)
    const c = totalAcid / vTot;
    const h = (-ka + Math.sqrt(ka * ka + 4 * ka * c)) / 2;
    return -Math.log10(Math.max(h, 1e-14));
  }
  if (molB < totalAcid - 1e-15) {
    // buffer region: Henderson–Hasselbalch
    const acid = totalAcid - molB;
    return a.pka + Math.log10(molB / acid);
  }
  if (Math.abs(molB - totalAcid) < 1e-12) {
    // equivalence: hydrolysis of conjugate base
    const cb = totalAcid / vTot;
    const kb = KW / ka;
    const oh = Math.sqrt(kb * cb);
    return 14 + Math.log10(Math.max(oh, 1e-14));
  }
  const excess = (molB - totalAcid) / vTot;
  return 14 + Math.log10(Math.max(excess, 1e-14));
}

export interface TitrationStats {
  analyte: Analyte;
  indicator: Indicator;
  ph: number;
  /** Equivalence-point volume (mL). */
  veq: number;
  /** Fraction of the equivalence volume already added. */
  fraction: number;
  pastEquivalence: boolean;
  /** Colour currently shown by the indicator. */
  indicatorColor: string;
  /** Indicator transition progress 0..1. */
  transition: number;
  /** True while within ±2% of the equivalence volume. */
  atEndPoint: boolean;
  /** Moles of acid remaining. */
  molRemaining: number;
}

function mixColor(c1: string, c2: string, t: number): string {
  const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [r1, g1, b1] = hex(c1);
  const [r2, g2, b2] = hex(c2);
  const m = (a: number, b: number) => Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
  return `#${[m(r1, r2), m(g1, g2), m(b1, b2)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function computeTitration(p: TitrationParams): TitrationStats {
  const a = findAnalyte(p.analyteId);
  const ind = findIndicator(p.indicatorId);
  const ph = titrationPH(p);
  const veq = (p.ca * p.va * a.protons) / Math.max(p.cb, 1e-9);
  const fraction = veq > 0 ? p.vb / veq : 0;
  const transition = (ph - ind.low) / Math.max(ind.high - ind.low, 0.01);
  const molRemaining = Math.max(0, (p.ca * p.va * a.protons) / 1000 - (p.cb * p.vb) / 1000);

  return {
    analyte: a,
    indicator: ind,
    ph,
    veq,
    fraction,
    pastEquivalence: p.vb > veq,
    indicatorColor: mixColor(ind.colorAcid, ind.colorBase, transition),
    transition: Math.max(0, Math.min(1, transition)),
    atEndPoint: veq > 0 && Math.abs(p.vb - veq) / veq < 0.02,
    molRemaining,
  };
}

/** Full titration curve pH vs added volume. */
export function titrationCurve(p: TitrationParams, points = 200) {
  const a = findAnalyte(p.analyteId);
  const veq = (p.ca * p.va * a.protons) / Math.max(p.cb, 1e-9);
  const vMax = veq * 2;
  const out: { v: number; ph: number }[] = [];
  for (let i = 0; i <= points; i++) {
    const v = (vMax * i) / points;
    out.push({ v: Number(v.toFixed(2)), ph: Number(titrationPH(p, v).toFixed(3)) });
  }
  return out;
}

/* ---------------- spectrophotometry ---------------- */

export interface Sample {
  id: string;
  name: string;
  /** Wavelength of maximum absorbance (nm). */
  lambdaMax: number;
  /** Molar absorptivity at λmax (L/mol·cm). */
  epsilon: number;
  /** Peak width (nm). */
  width: number;
  color: string;
}

export const SAMPLES: Sample[] = [
  { id: 'cuso4', name: 'كبريتات النحاس', lambdaMax: 810, epsilon: 12, width: 120, color: '#38bdf8' },
  { id: 'kmno4', name: 'برمنغنات البوتاسيوم', lambdaMax: 525, epsilon: 2300, width: 45, color: '#a855f7' },
  { id: 'k2cr2o7', name: 'ثنائي كرومات البوتاسيوم', lambdaMax: 350, epsilon: 3160, width: 60, color: '#f59e0b' },
  { id: 'nicl2', name: 'كلوريد النيكل', lambdaMax: 395, epsilon: 5.1, width: 90, color: '#22c55e' },
  { id: 'fescn', name: 'معقّد ثيوسيانات الحديد', lambdaMax: 447, epsilon: 4700, width: 55, color: '#ef4444' },
];

export const findSample = (id: string): Sample => SAMPLES.find((s) => s.id === id) ?? SAMPLES[0];

export interface SpectroParams {
  sampleId: string;
  /** Concentration (mol/L). */
  conc: number;
  /** Path length (cm). */
  path: number;
  /** Selected wavelength (nm). */
  lambda: number;
}

export interface SpectroStats {
  sample: Sample;
  epsilonAt: number;
  absorbance: number;
  transmittance: number;
  atPeak: boolean;
  /** Concentration back-calculated from A (validation of Beer's law). */
  detectionOk: boolean;
}

const epsAt = (s: Sample, lambda: number) =>
  s.epsilon * Math.exp(-Math.pow((lambda - s.lambdaMax) / s.width, 2));

export function computeSpectro(p: SpectroParams): SpectroStats {
  const s = findSample(p.sampleId);
  const e = epsAt(s, p.lambda);
  const a = e * p.conc * p.path;
  return {
    sample: s,
    epsilonAt: e,
    absorbance: a,
    transmittance: Math.pow(10, -a) * 100,
    atPeak: Math.abs(p.lambda - s.lambdaMax) < 8,
    detectionOk: a >= 0.1 && a <= 1.0,
  };
}

/** Absorbance spectrum across the visible/UV range. */
export function absorptionSpectrum(p: SpectroParams, points = 90) {
  const s = findSample(p.sampleId);
  const out: { lambda: number; a: number }[] = [];
  for (let i = 0; i <= points; i++) {
    const l = 250 + (i * 650) / points;
    out.push({ lambda: Math.round(l), a: Number((epsAt(s, l) * p.conc * p.path).toFixed(4)) });
  }
  return out;
}

/** Calibration line A vs concentration at the selected wavelength. */
export function calibrationLine(p: SpectroParams, points = 20) {
  const s = findSample(p.sampleId);
  const e = epsAt(s, p.lambda);
  const cMax = Math.max(p.conc * 2, 1e-4);
  return Array.from({ length: points + 1 }, (_, i) => {
    const c = (cMax * i) / points;
    return { c: Number(c.toExponential(2)), a: Number((e * c * p.path).toFixed(4)) };
  });
}

/* ---------------- chromatography ---------------- */

export interface Analyte2 {
  id: string;
  name: string;
  /** Relative polarity 0 (non-polar) .. 1 (very polar). */
  polarity: number;
  color: string;
}

export const MIXTURE: Analyte2[] = [
  { id: 'c1', name: 'صبغة أ (غير قطبية)', polarity: 0.15, color: '#f59e0b' },
  { id: 'c2', name: 'صبغة ب (متوسطة)', polarity: 0.45, color: '#22c55e' },
  { id: 'c3', name: 'صبغة ج (قطبية)', polarity: 0.7, color: '#3b82f6' },
  { id: 'c4', name: 'صبغة د (شديدة القطبية)', polarity: 0.9, color: '#ec4899' },
];

export interface ChromatoParams {
  /** Mobile-phase polarity 0..1. */
  solventPolarity: number;
  /** Development run length (cm). */
  runLength: number;
  /** Elapsed run fraction 0..1. */
  progress: number;
}

export interface Spot {
  analyte: Analyte2;
  rf: number;
  distance: number;
  resolvedFrom: number;
}

/** Rf grows when the solvent polarity matches the analyte polarity (silica, normal phase). */
export function computeRf(a: Analyte2, solventPolarity: number): number {
  const match = 1 - Math.abs(a.polarity - solventPolarity);
  const rf = Math.max(0.03, Math.min(0.97, 0.15 + 0.85 * match * (1 - a.polarity * 0.55)));
  return Number(rf.toFixed(3));
}

export function computeChromato(p: ChromatoParams): { spots: Spot[]; frontDistance: number; resolution: number } {
  const front = p.runLength * p.progress;
  const spots = MIXTURE.map((a) => {
    const rf = computeRf(a, p.solventPolarity);
    return { analyte: a, rf, distance: rf * front, resolvedFrom: 0 };
  }).sort((x, y) => x.distance - y.distance);

  let minGap = Infinity;
  for (let i = 1; i < spots.length; i++) {
    const gap = spots[i].distance - spots[i - 1].distance;
    spots[i].resolvedFrom = gap;
    minGap = Math.min(minGap, gap);
  }
  const resolution = Number((minGap === Infinity ? 0 : minGap).toFixed(2));
  return { spots, frontDistance: front, resolution };
}

/** Rf values across all solvent polarities, for the chart. */
export function rfSweep(points = 40) {
  return Array.from({ length: points + 1 }, (_, i) => {
    const sp = i / points;
    const row: Record<string, number> = { solvent: Number(sp.toFixed(2)) };
    MIXTURE.forEach((a) => {
      row[a.id] = computeRf(a, sp);
    });
    return row;
  });
}
