/**
 * Photosynthesis and cellular respiration: limiting-factor rate models,
 * ATP accounting and net gas exchange.
 */

export type BioMode = 'photosynthesis' | 'respiration' | 'exchange';

export interface PhotoParams {
  /** Light intensity 0..100 (arbitrary units, klux-like). */
  light: number;
  /** CO2 concentration in ppm. */
  co2: number;
  /** Temperature in °C. */
  temperature: number;
  /** Chlorophyll / leaf health 0..1. */
  chlorophyll: number;
  /** O2 availability for respiration 0..100 %. */
  oxygen: number;
  /** Glucose supply for respiration 0..1. */
  glucose: number;
}

export const DEFAULT_PHOTO: PhotoParams = {
  light: 60,
  co2: 400,
  temperature: 25,
  chlorophyll: 0.9,
  oxygen: 21,
  glucose: 0.8,
};

/** Michaelis–Menten style saturation response. */
const saturate = (x: number, k: number) => x / (x + k);

/** Bell-shaped enzyme temperature response peaking near 30 °C, denaturing above 40 °C. */
export function temperatureFactor(tC: number, optimum = 30, width = 12): number {
  if (tC <= 0) return 0;
  const f = Math.exp(-((tC - optimum) ** 2) / (2 * width ** 2));
  const denature = tC > 42 ? Math.max(0, 1 - (tC - 42) / 8) : 1;
  return Math.max(0, f * denature);
}

export interface PhotoStats {
  /** Gross photosynthesis rate (relative units 0..~1). */
  gross: number;
  /** Respiration rate (relative units). */
  respiration: number;
  /** Net photosynthesis = gross − respiration. */
  net: number;
  /** Which factor currently limits the rate. */
  limiting: string;
  /** O2 released per unit time (relative). */
  o2Release: number;
  /** CO2 consumed per unit time (relative). */
  co2Uptake: number;
  /** ATP produced in the light reactions (relative). */
  atpLight: number;
  /** NADPH produced (relative). */
  nadph: number;
  /** ATP produced by aerobic respiration (relative). */
  atpRespiration: number;
  /** Fraction of respiration running anaerobically. */
  anaerobicFraction: number;
  /** True when net exchange is zero (compensation point). */
  atCompensation: boolean;
  /** Net direction label. */
  balanceLabel: string;
}

export function computePhoto(p: PhotoParams): PhotoStats {
  const lightF = saturate(p.light, 25);
  const co2F = saturate(Math.max(0, p.co2 - 50), 250);
  const tempF = temperatureFactor(p.temperature);
  const chl = Math.max(0, Math.min(1, p.chlorophyll));

  const gross = lightF * co2F * tempF * chl;

  // Respiration depends on temperature (Q10 ≈ 2), oxygen and substrate.
  const q10 = Math.pow(2, (p.temperature - 25) / 10);
  const o2F = saturate(p.oxygen, 5);
  const respirationAerobic = 0.32 * q10 * o2F * p.glucose * (p.temperature > 45 ? 0.2 : 1);
  const anaerobicFraction = 1 - o2F;
  const respiration = respirationAerobic + 0.06 * anaerobicFraction * p.glucose;

  const net = gross - respiration;

  const factors: Array<[string, number]> = [
    ['شدة الضوء', lightF],
    ['تركيز CO₂', co2F],
    ['درجة الحرارة', tempF],
    ['الكلوروفيل', chl],
  ];
  factors.sort((a, b) => a[1] - b[1]);
  const limiting = factors[0][0];

  return {
    gross,
    respiration,
    net,
    limiting,
    o2Release: Math.max(0, net),
    co2Uptake: Math.max(0, net),
    atpLight: gross * 3,
    nadph: gross * 2,
    // 32 ATP per glucose aerobically, 2 anaerobically.
    atpRespiration: respirationAerobic * 32 + anaerobicFraction * p.glucose * 2,
    anaerobicFraction,
    atCompensation: Math.abs(net) < 0.01,
    balanceLabel:
      Math.abs(net) < 0.01
        ? 'نقطة التعويض'
        : net > 0
        ? 'إنتاج صافٍ للأكسجين'
        : 'استهلاك صافٍ للأكسجين',
  };
}

/** Rate vs light intensity (light response curve). */
export function lightCurve(p: PhotoParams, points = 50) {
  return Array.from({ length: points + 1 }, (_, i) => {
    const light = (i / points) * 100;
    const s = computePhoto({ ...p, light });
    return {
      light: Number(light.toFixed(0)),
      gross: Number(s.gross.toFixed(3)),
      net: Number(s.net.toFixed(3)),
      respiration: Number(-s.respiration.toFixed(3)),
    };
  });
}

/** Rate vs temperature. */
export function temperatureCurve(p: PhotoParams, points = 50) {
  return Array.from({ length: points + 1 }, (_, i) => {
    const temperature = (i / points) * 50;
    const s = computePhoto({ ...p, temperature });
    return {
      temp: Number(temperature.toFixed(0)),
      gross: Number(s.gross.toFixed(3)),
      respiration: Number(s.respiration.toFixed(3)),
      net: Number(s.net.toFixed(3)),
    };
  });
}

/** Rate vs CO2 concentration. */
export function co2Curve(p: PhotoParams, points = 50) {
  return Array.from({ length: points + 1 }, (_, i) => {
    const co2 = (i / points) * 1200;
    const s = computePhoto({ ...p, co2 });
    return { co2: Number(co2.toFixed(0)), gross: Number(s.gross.toFixed(3)), net: Number(s.net.toFixed(3)) };
  });
}

export interface Stage {
  id: string;
  name: string;
  nameEn: string;
  place: string;
  inputs: string;
  outputs: string;
  atp: number;
  note: string;
  color: string;
}

export const PHOTO_STAGES: Stage[] = [
  {
    id: 'light',
    name: 'التفاعلات الضوئية',
    nameEn: 'Light Reactions',
    place: 'أغشية الثايلاكويد',
    inputs: 'ضوء + ماء H₂O + ADP + NADP⁺',
    outputs: 'ATP + NADPH + O₂',
    atp: 3,
    note: 'يُحلّل الماء ضوئياً فتتحرّر الإلكترونات والأكسجين، وتنتقل الإلكترونات عبر سلسلة النقل مكوّنة تدرّجاً بروتونياً يدير إنزيم ATP سينثيز.',
    color: '#22c55e',
  },
  {
    id: 'calvin',
    name: 'دورة كالفن',
    nameEn: 'Calvin Cycle',
    place: 'الستروما',
    inputs: 'CO₂ + ATP + NADPH',
    outputs: 'سكر ثلاثي G3P ← جلوكوز',
    atp: -3,
    note: 'يُثبَّت CO₂ بواسطة إنزيم روبيسكو على RuBP ثم يُختزل باستخدام ATP وNADPH لإنتاج G3P وإعادة توليد RuBP.',
    color: '#0ea5e9',
  },
];

export const RESP_STAGES: Stage[] = [
  {
    id: 'glycolysis',
    name: 'التحلل السكري',
    nameEn: 'Glycolysis',
    place: 'السيتوبلازم',
    inputs: 'جلوكوز (6 كربون)',
    outputs: '2 حمض بيروفيك + 2 ATP + 2 NADH',
    atp: 2,
    note: 'لا يحتاج أكسجين، ويحدث في جميع الخلايا.',
    color: '#f59e0b',
  },
  {
    id: 'krebs',
    name: 'دورة كربس',
    nameEn: 'Krebs Cycle',
    place: 'حشوة الميتوكندريا',
    inputs: 'أسيتيل CoA',
    outputs: '2 ATP + 6 NADH + 2 FADH₂ + CO₂',
    atp: 2,
    note: 'أكسدة كاملة للكربون وإطلاق ثاني أكسيد الكربون وحمل الإلكترونات على النواقل.',
    color: '#ef4444',
  },
  {
    id: 'etc',
    name: 'سلسلة نقل الإلكترون',
    nameEn: 'Electron Transport Chain',
    place: 'الغشاء الداخلي (الأعراف)',
    inputs: 'NADH + FADH₂ + O₂',
    outputs: '≈28 ATP + ماء',
    atp: 28,
    note: 'الأكسجين هو المستقبل النهائي للإلكترونات، والتدرّج البروتوني يدير ATP سينثيز.',
    color: '#8b5cf6',
  },
];

export const FERMENTATION = {
  name: 'التخمّر (لا هوائي)',
  atp: 2,
  note: 'عند نقص الأكسجين يتحوّل البيروفيك إلى حمض لاكتيك في العضلات أو إيثانول وCO₂ في الخميرة، بعائد 2 ATP فقط.',
};

export const EQUATIONS = {
  photosynthesis: '6CO₂ + 6H₂O + طاقة ضوئية → C₆H₁₂O₆ + 6O₂',
  respiration: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + طاقة (≈32 ATP)',
};

/** ATP contribution bars for the respiration chart. */
export const atpBreakdown = (aerobic: boolean) =>
  aerobic
    ? RESP_STAGES.map((s) => ({ name: s.name, atp: s.atp }))
    : [
        { name: 'التحلل السكري', atp: 2 },
        { name: 'التخمّر', atp: 0 },
      ];
