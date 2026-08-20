/**
 * فيزياء الفلك المتقدم — محرك حسابي
 * Orbital mechanics, Kepler's laws, lunar phases and eclipse geometry.
 */

export const G = 6.6743e-11; // m³ kg⁻¹ s⁻²
export const AU = 1.495978707e11; // m
export const M_SUN = 1.98892e30; // kg
export const M_EARTH = 5.9722e24; // kg
export const R_EARTH = 6.371e6; // m
export const R_MOON = 1.7374e6; // m
export const R_SUN = 6.9634e8; // m
export const EARTH_MOON_D = 3.844e8; // m

export type AstronomyMode = 'orbits' | 'phases' | 'eclipse';

export interface AstronomyParams {
  mode: AstronomyMode;
  /** semi-major axis in AU */
  semiMajorAu: number;
  /** orbital eccentricity 0 - 0.9 */
  eccentricity: number;
  /** central star mass in solar masses */
  starMasses: number;
  /** moon phase angle in degrees (0 = new moon) */
  phaseDeg: number;
  /** lunar orbit inclination in degrees */
  inclinationDeg: number;
  /** moon distance factor (perigee 0.9 - apogee 1.1) */
  moonDistanceFactor: number;
}

export interface AstronomyStats {
  semiMajorM: number;
  periodSeconds: number;
  periodYears: number;
  periodDays: number;
  perihelionAu: number;
  aphelionAu: number;
  perihelionSpeed: number; // m/s
  aphelionSpeed: number; // m/s
  meanSpeed: number; // m/s
  escapeSpeed: number; // m/s
  orbitalEnergy: number; // J/kg (specific)
  arealVelocity: number; // m²/s
  keplerConstant: number; // T²/a³ in yr²/AU³
  illuminatedFraction: number;
  phaseName: string;
  moonDistance: number; // m
  angularDiameterMoon: number; // degrees
  angularDiameterSun: number; // degrees
  eclipseType: string;
  eclipsePossible: boolean;
  umbraLengthKm: number;
}

const PHASES: { max: number; name: string }[] = [
  { max: 22.5, name: 'محاق' },
  { max: 67.5, name: 'هلال متزايد' },
  { max: 112.5, name: 'تربيع أول' },
  { max: 157.5, name: 'أحدب متزايد' },
  { max: 202.5, name: 'بدر' },
  { max: 247.5, name: 'أحدب متناقص' },
  { max: 292.5, name: 'تربيع أخير' },
  { max: 337.5, name: 'هلال متناقص' },
  { max: 361, name: 'محاق' },
];

export const computeAstronomy = (p: AstronomyParams): AstronomyStats => {
  const a = Math.max(p.semiMajorAu, 0.05) * AU;
  const e = Math.min(Math.max(p.eccentricity, 0), 0.9);
  const M = Math.max(p.starMasses, 0.05) * M_SUN;
  const mu = G * M;

  const periodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / mu);
  const periodYears = periodSeconds / (365.25 * 24 * 3600);

  const rp = a * (1 - e);
  const ra = a * (1 + e);
  const vp = Math.sqrt((mu * (1 + e)) / (a * (1 - e)));
  const va = Math.sqrt((mu * (1 - e)) / (a * (1 + e)));
  const meanSpeed = (2 * Math.PI * a) / periodSeconds;
  const escapeSpeed = Math.sqrt((2 * mu) / a);
  const orbitalEnergy = -mu / (2 * a);
  const arealVelocity = 0.5 * rp * vp;
  const keplerConstant = Math.pow(periodYears, 2) / Math.pow(p.semiMajorAu, 3);

  // lunar phase
  const deg = ((p.phaseDeg % 360) + 360) % 360;
  const illuminatedFraction = (1 - Math.cos((deg * Math.PI) / 180)) / 2;
  const phaseName = PHASES.find((ph) => deg < ph.max)?.name ?? 'بدر';

  // eclipse geometry
  const moonDistance = EARTH_MOON_D * p.moonDistanceFactor;
  const angularDiameterMoon = 2 * Math.atan(R_MOON / moonDistance) * (180 / Math.PI);
  const angularDiameterSun = 2 * Math.atan(R_SUN / AU) * (180 / Math.PI);

  const nearNode = Math.abs(p.inclinationDeg) < 1.5;
  const nearNew = deg < 15 || deg > 345;
  const nearFull = Math.abs(deg - 180) < 15;

  let eclipseType = 'لا كسوف ولا خسوف';
  let eclipsePossible = false;
  if (nearNode && nearNew) {
    eclipsePossible = true;
    eclipseType = angularDiameterMoon >= angularDiameterSun ? 'كسوف كلي للشمس' : 'كسوف حلقي للشمس';
  } else if (nearNode && nearFull) {
    eclipsePossible = true;
    eclipseType = 'خسوف كلي للقمر';
  } else if (!nearNode && (nearNew || nearFull)) {
    eclipseType = 'الميل المداري يمنع الحدث';
  }

  const umbraLengthKm = ((R_MOON * moonDistance) / Math.max(R_SUN - R_MOON, 1)) / 1000;

  return {
    semiMajorM: a,
    periodSeconds,
    periodYears,
    periodDays: periodYears * 365.25,
    perihelionAu: rp / AU,
    aphelionAu: ra / AU,
    perihelionSpeed: vp,
    aphelionSpeed: va,
    meanSpeed,
    escapeSpeed,
    orbitalEnergy,
    arealVelocity,
    keplerConstant,
    illuminatedFraction,
    phaseName,
    moonDistance,
    angularDiameterMoon,
    angularDiameterSun,
    eclipseType,
    eclipsePossible,
    umbraLengthKm,
  };
};

/** Kepler's third law curve: T vs a. */
export const keplerCurve = (starMasses = 1, points = 60) =>
  Array.from({ length: points }, (_, i) => {
    const aAu = 0.2 + (i / (points - 1)) * 30;
    const a = aAu * AU;
    const T = (2 * Math.PI * Math.sqrt(Math.pow(a, 3) / (G * starMasses * M_SUN))) / (365.25 * 24 * 3600);
    return {
      'نصف المحور (AU)': Number(aAu.toFixed(2)),
      'الدور (سنة)': Number(T.toFixed(3)),
      'a^1.5': Number(Math.pow(aAu, 1.5).toFixed(3)),
    };
  });

/** Orbital speed vs true anomaly (vis-viva). */
export const speedCurve = (aAu: number, e: number, starMasses = 1, points = 73) => {
  const a = aAu * AU;
  const mu = G * starMasses * M_SUN;
  return Array.from({ length: points }, (_, i) => {
    const theta = (i / (points - 1)) * 360;
    const rad = (theta * Math.PI) / 180;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(rad));
    const v = Math.sqrt(mu * (2 / r - 1 / a));
    return {
      'الزاوية الحقيقية°': Math.round(theta),
      'السرعة (كم/ث)': Number((v / 1000).toFixed(3)),
      'المسافة (AU)': Number((r / AU).toFixed(3)),
    };
  });
};

/** Illuminated fraction across the lunar month. */
export const phaseCurve = (points = 73) =>
  Array.from({ length: points }, (_, i) => {
    const deg = (i / (points - 1)) * 360;
    return {
      'زاوية الطور°': Math.round(deg),
      'النسبة المضيئة %': Number((((1 - Math.cos((deg * Math.PI) / 180)) / 2) * 100).toFixed(2)),
    };
  });
