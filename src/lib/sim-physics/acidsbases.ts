/** Isolated acid–base engine: pH of strong/weak acids and bases, titration curves and buffers. */

export type AcidBaseMode = 'ph' | 'titration' | 'buffer';

export const KW = 1e-14;

export interface Solute {
  id: string;
  name: string;
  formula: string;
  /** Acid dissociation constant (for bases: Ka of the conjugate acid is derived from Kb). */
  ka: number;
  kind: 'acid' | 'base';
  strong: boolean;
}

export const ACIDS: Solute[] = [
  { id: 'hcl', name: 'حمض الهيدروكلوريك', formula: 'HCl', ka: 1e6, kind: 'acid', strong: true },
  { id: 'hno3', name: 'حمض النيتريك', formula: 'HNO₃', ka: 1e6, kind: 'acid', strong: true },
  { id: 'h2so4', name: 'حمض الكبريتيك', formula: 'H₂SO₄', ka: 1e6, kind: 'acid', strong: true },
  { id: 'hf', name: 'حمض الهيدروفلوريك', formula: 'HF', ka: 6.8e-4, kind: 'acid', strong: false },
  { id: 'hcooh', name: 'حمض الفورميك', formula: 'HCOOH', ka: 1.8e-4, kind: 'acid', strong: false },
  { id: 'ch3cooh', name: 'حمض الخليك', formula: 'CH₃COOH', ka: 1.8e-5, kind: 'acid', strong: false },
  { id: 'h2co3', name: 'حمض الكربونيك', formula: 'H₂CO₃', ka: 4.3e-7, kind: 'acid', strong: false },
  { id: 'hcn', name: 'حمض الهيدروسيانيك', formula: 'HCN', ka: 6.2e-10, kind: 'acid', strong: false },
];

export const BASES: Solute[] = [
  { id: 'naoh', name: 'هيدروكسيد الصوديوم', formula: 'NaOH', ka: KW / 1e6, kind: 'base', strong: true },
  { id: 'koh', name: 'هيدروكسيد البوتاسيوم', formula: 'KOH', ka: KW / 1e6, kind: 'base', strong: true },
  { id: 'nh3', name: 'النشادر', formula: 'NH₃', ka: KW / 1.8e-5, kind: 'base', strong: false },
  { id: 'ch3nh2', name: 'ميثيل أمين', formula: 'CH₃NH₂', ka: KW / 4.4e-4, kind: 'base', strong: false },
];

export interface Indicator {
  id: string;
  name: string;
  low: number;
  high: number;
  acidColor: string;
  baseColor: string;
}

export const INDICATORS: Indicator[] = [
  { id: 'universal', name: 'الكاشف العام', low: 4, high: 10, acidColor: '#ef4444', baseColor: '#6d28d9' },
  { id: 'methyl-orange', name: 'الميثيل البرتقالي', low: 3.1, high: 4.4, acidColor: '#dc2626', baseColor: '#f59e0b' },
  { id: 'bromothymol', name: 'أزرق البروموثيمول', low: 6.0, high: 7.6, acidColor: '#eab308', baseColor: '#2563eb' },
  { id: 'phenolphthalein', name: 'الفينولفثالين', low: 8.2, high: 10, acidColor: '#f8fafc', baseColor: '#db2777' },
  { id: 'litmus', name: 'عبّاد الشمس', low: 5, high: 8, acidColor: '#e11d48', baseColor: '#1d4ed8' },
];

export const findAcid = (id: string) => ACIDS.find((a) => a.id === id) ?? ACIDS[0];
export const findBase = (id: string) => BASES.find((b) => b.id === id) ?? BASES[0];
export const findIndicator = (id: string) => INDICATORS.find((i) => i.id === id) ?? INDICATORS[0];

export interface AcidBaseParams {
  mode: AcidBaseMode;
  acidId: string;
  baseId: string;
  /** Analyte concentration (M) */
  acidConc: number;
  /** Titrant concentration (M) */
  baseConc: number;
  /** Analyte volume (mL) */
  acidVolume: number;
  /** Titrant volume added (mL) */
  addedVolume: number;
  /** Buffer: weak acid concentration (M) */
  bufferAcid: number;
  /** Buffer: conjugate salt concentration (M) */
  bufferSalt: number;
  /** Buffer: strong base (mmol) added as a stress test — negative means strong acid added */
  bufferStress: number;
  indicatorId: string;
  /** true → titrate an acid with a base; false → titrate a base with an acid */
  acidAnalyte: boolean;
}

export interface AcidBaseStats {
  ph: number;
  poh: number;
  h: number;
  oh: number;
  ka: number;
  pka: number;
  kb: number;
  pkb: number;
  /** % ionisation of the weak species */
  ionisation: number;
  /** Titration equivalence volume (mL) */
  equivalenceVolume: number;
  /** Fraction of the equivalence point reached */
  fraction: number;
  /** Buffer capacity (mol per pH unit per litre) */
  bufferCapacity: number;
  /** pH shift caused by the stress addition */
  bufferShift: number;
  classification: string;
  colorHex: string;
  indicatorColor: string;
  /** true once the indicator has switched to its basic colour */
  indicatorTurned: boolean;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const pOf = (c: number) => -Math.log10(Math.max(c, 1e-15));

/** [H+] of a monoprotic weak acid of concentration C and constant Ka. */
export function weakAcidH(ka: number, c: number): number {
  if (c <= 0) return 1e-7;
  const x = (-ka + Math.sqrt(ka * ka + 4 * ka * c)) / 2;
  return Math.max(x, 1e-7);
}

/** [OH−] of a weak base of concentration C and constant Kb. */
export function weakBaseOH(kb: number, c: number): number {
  if (c <= 0) return 1e-7;
  const x = (-kb + Math.sqrt(kb * kb + 4 * kb * c)) / 2;
  return Math.max(x, 1e-7);
}

/** pH of a strong acid including the water contribution at very low concentration. */
export function strongAcidPh(c: number): number {
  const h = (c + Math.sqrt(c * c + 4 * KW)) / 2;
  return pOf(h);
}

export function strongBasePh(c: number): number {
  const oh = (c + Math.sqrt(c * c + 4 * KW)) / 2;
  return 14 + Math.log10(Math.max(oh, 1e-15));
}

/** pH at a given titrant volume for acid-in-flask (or base-in-flask) titrations. */
export function titrationPh(p: AcidBaseParams, addedMl: number): number {
  const acid = findAcid(p.acidId);
  const base = findBase(p.baseId);
  const analyteStrong = p.acidAnalyte ? acid.strong : base.strong;
  const va = Math.max(p.acidVolume, 1e-6) / 1000;
  const vb = Math.max(addedMl, 0) / 1000;
  const total = va + vb;

  const nAnalyte = va * (p.acidAnalyte ? p.acidConc : p.acidConc);
  const nTitrant = vb * p.baseConc;

  const ka = acid.ka;
  const kb = KW / base.ka;

  if (p.acidAnalyte) {
    // acid in flask, strong/weak base titrant assumed strong for the curve
    if (nTitrant < nAnalyte - 1e-12) {
      const left = (nAnalyte - nTitrant) / total;
      if (analyteStrong) return strongAcidPh(left);
      const salt = nTitrant / total;
      if (salt <= 1e-12) return pOf(weakAcidH(ka, left));
      return -Math.log10(ka) + Math.log10(salt / left);
    }
    if (Math.abs(nTitrant - nAnalyte) <= 1e-12) {
      if (analyteStrong) return 7;
      const cSalt = nAnalyte / total;
      const kbConj = KW / ka;
      return 14 + Math.log10(weakBaseOH(kbConj, cSalt));
    }
    const excess = (nTitrant - nAnalyte) / total;
    return strongBasePh(excess);
  }

  // base in flask, strong acid titrant
  if (nTitrant < nAnalyte - 1e-12) {
    const left = (nAnalyte - nTitrant) / total;
    if (analyteStrong) return strongBasePh(left);
    const salt = nTitrant / total;
    if (salt <= 1e-12) return 14 + Math.log10(weakBaseOH(kb, left));
    return 14 + Math.log10(kb) + Math.log10(left / salt);
  }
  if (Math.abs(nTitrant - nAnalyte) <= 1e-12) {
    if (analyteStrong) return 7;
    const cSalt = nAnalyte / total;
    return pOf(weakAcidH(KW / kb, cSalt));
  }
  const excess = (nTitrant - nAnalyte) / total;
  return strongAcidPh(excess);
}

/** Universal-indicator style colour for a pH value. */
export function phColor(ph: number): string {
  const stops: [number, string][] = [
    [0, '#b91c1c'],
    [2, '#ef4444'],
    [4, '#f97316'],
    [5, '#facc15'],
    [6, '#a3e635'],
    [7, '#22c55e'],
    [8, '#14b8a6'],
    [9, '#0ea5e9'],
    [11, '#4f46e5'],
    [14, '#6d28d9'],
  ];
  const v = clamp(ph, 0, 14);
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (v >= p0 && v <= p1) {
      const t = (v - p0) / (p1 - p0);
      return mix(c0, c1, t);
    }
  }
  return '#22c55e';
}

function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const out = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function classify(ph: number): string {
  if (ph < 3) return 'حمضي قوي جداً';
  if (ph < 6) return 'حمضي';
  if (ph < 6.9) return 'حمضي ضعيف';
  if (ph <= 7.1) return 'متعادل';
  if (ph < 9) return 'قاعدي ضعيف';
  if (ph < 12) return 'قاعدي';
  return 'قاعدي قوي جداً';
}

export function computeAcidBase(p: AcidBaseParams): AcidBaseStats {
  const acid = findAcid(p.acidId);
  const base = findBase(p.baseId);
  const indicator = findIndicator(p.indicatorId);

  let ph = 7;
  let ionisation = 0;
  let bufferCapacity = 0;
  let bufferShift = 0;

  const ka = p.acidAnalyte ? acid.ka : KW / (KW / base.ka);
  const kb = KW / acid.ka;

  if (p.mode === 'ph') {
    if (p.acidAnalyte) {
      if (acid.strong) {
        ph = strongAcidPh(p.acidConc);
        ionisation = 100;
      } else {
        const h = weakAcidH(acid.ka, p.acidConc);
        ph = pOf(h);
        ionisation = (h / Math.max(p.acidConc, 1e-9)) * 100;
      }
    } else {
      const kbB = KW / base.ka;
      if (base.strong) {
        ph = strongBasePh(p.acidConc);
        ionisation = 100;
      } else {
        const oh = weakBaseOH(kbB, p.acidConc);
        ph = 14 + Math.log10(oh);
        ionisation = (oh / Math.max(p.acidConc, 1e-9)) * 100;
      }
    }
  } else if (p.mode === 'titration') {
    ph = titrationPh(p, p.addedVolume);
    const h = Math.pow(10, -ph);
    ionisation = p.acidAnalyte
      ? clamp((h / Math.max(p.acidConc, 1e-9)) * 100, 0, 100)
      : clamp((Math.pow(10, ph - 14) / Math.max(p.acidConc, 1e-9)) * 100, 0, 100);
  } else {
    // buffer: Henderson–Hasselbalch on 1 L basis, with a stress addition in mmol
    const pka = -Math.log10(acid.ka);
    const acidMol = Math.max(p.bufferAcid - p.bufferStress / 1000, 1e-6);
    const saltMol = Math.max(p.bufferSalt + p.bufferStress / 1000, 1e-6);
    ph = pka + Math.log10(saltMol / acidMol);
    const base0 = pka + Math.log10(Math.max(p.bufferSalt, 1e-6) / Math.max(p.bufferAcid, 1e-6));
    bufferShift = ph - base0;
    const cTotal = p.bufferAcid + p.bufferSalt;
    const frac = (p.bufferAcid * p.bufferSalt) / Math.max(cTotal * cTotal, 1e-9);
    bufferCapacity = 2.303 * cTotal * frac;
    ionisation = (Math.pow(10, -ph) / Math.max(p.bufferAcid, 1e-9)) * 100;
  }

  ph = clamp(ph, 0, 14);
  const h = Math.pow(10, -ph);
  const oh = KW / h;

  const equivalenceVolume = (p.acidConc * p.acidVolume) / Math.max(p.baseConc, 1e-6);
  const fraction = p.addedVolume / Math.max(equivalenceVolume, 1e-6);

  const indicatorTurned = ph >= indicator.high;
  const indicatorColor =
    ph <= indicator.low
      ? indicator.acidColor
      : ph >= indicator.high
      ? indicator.baseColor
      : mix(indicator.acidColor, indicator.baseColor, (ph - indicator.low) / (indicator.high - indicator.low));

  return {
    ph,
    poh: 14 - ph,
    h,
    oh,
    ka: p.acidAnalyte ? acid.ka : ka,
    pka: -Math.log10(acid.ka),
    kb,
    pkb: -Math.log10(kb),
    ionisation: clamp(ionisation, 0, 100),
    equivalenceVolume,
    fraction: clamp(fraction, 0, 3),
    bufferCapacity,
    bufferShift,
    classification: classify(ph),
    colorHex: phColor(ph),
    indicatorColor,
    indicatorTurned,
  };
}

export interface TitrationPoint {
  'الحجم المضاف (mL)': number;
  'الأس الهيدروجيني': number;
}

/** Full titration curve up to twice the equivalence volume. */
export function titrationCurve(p: AcidBaseParams, points = 120): TitrationPoint[] {
  const veq = (p.acidConc * p.acidVolume) / Math.max(p.baseConc, 1e-6);
  const max = Math.max(veq * 2, 1);
  const out: TitrationPoint[] = [];
  for (let i = 0; i <= points; i++) {
    const v = (i / points) * max;
    out.push({
      'الحجم المضاف (mL)': Number(v.toFixed(2)),
      'الأس الهيدروجيني': Number(titrationPh(p, v).toFixed(3)),
    });
  }
  return out;
}

/** Buffer response: pH against added strong base (mmol per litre). */
export function bufferCurve(p: AcidBaseParams, points = 60) {
  const acid = findAcid(p.acidId);
  const pka = -Math.log10(acid.ka);
  const span = (p.bufferAcid + p.bufferSalt) * 1000;
  const out: { 'قاعدة مضافة (mmol)': number; 'محلول منظّم': number; 'ماء نقي': number }[] = [];
  for (let i = 0; i <= points; i++) {
    const added = -span / 2 + (span * i) / points;
    const a = Math.max(p.bufferAcid - added / 1000, 1e-6);
    const s = Math.max(p.bufferSalt + added / 1000, 1e-6);
    const plain = added >= 0 ? strongBasePh(Math.max(added / 1000, 1e-9)) : strongAcidPh(Math.max(-added / 1000, 1e-9));
    out.push({
      'قاعدة مضافة (mmol)': Number(added.toFixed(2)),
      'محلول منظّم': Number(clamp(pka + Math.log10(s / a), 0, 14).toFixed(3)),
      'ماء نقي': Number(clamp(plain, 0, 14).toFixed(3)),
    });
  }
  return out;
}

/** Concentration sweep: how pH varies with the analyte concentration. */
export function concentrationCurve(p: AcidBaseParams, points = 40) {
  const acid = findAcid(p.acidId);
  const base = findBase(p.baseId);
  const out: { 'التركيز (M)': number; 'الأس الهيدروجيني': number }[] = [];
  for (let i = 0; i <= points; i++) {
    const c = Math.pow(10, -5 + (5 * i) / points); // 1e-5 .. 1 M
    let ph: number;
    if (p.acidAnalyte) {
      ph = acid.strong ? strongAcidPh(c) : pOf(weakAcidH(acid.ka, c));
    } else {
      const kbB = KW / base.ka;
      ph = base.strong ? strongBasePh(c) : 14 + Math.log10(weakBaseOH(kbB, c));
    }
    out.push({ 'التركيز (M)': Number(c.toFixed(5)), 'الأس الهيدروجيني': Number(clamp(ph, 0, 14).toFixed(3)) });
  }
  return out;
}
