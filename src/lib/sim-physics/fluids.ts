/** Isolated fluid-mechanics engine shared by the 3D scene, HUD and charts. */

export type FluidMode = 'archimedes' | 'bernoulli' | 'pressure';

export const G = 9.81;
export const P_ATM = 101325; // Pa

export interface FluidPreset {
  key: string;
  name: string;
  density: number; // kg/m³
  color: string;
}

export const FLUIDS: FluidPreset[] = [
  { key: 'water', name: 'ماء عذب', density: 1000, color: '#3b82f6' },
  { key: 'sea', name: 'ماء البحر', density: 1025, color: '#0ea5e9' },
  { key: 'oil', name: 'زيت', density: 920, color: '#ca8a04' },
  { key: 'alcohol', name: 'كحول إيثيلي', density: 789, color: '#a855f7' },
  { key: 'glycerin', name: 'جليسرين', density: 1260, color: '#14b8a6' },
  { key: 'mercury', name: 'زئبق', density: 13546, color: '#94a3b8' },
];

export const SOLIDS: FluidPreset[] = [
  { key: 'cork', name: 'فلّين', density: 240, color: '#d6b370' },
  { key: 'wood', name: 'خشب', density: 700, color: '#b45309' },
  { key: 'ice', name: 'جليد', density: 917, color: '#bae6fd' },
  { key: 'plastic', name: 'بلاستيك', density: 1150, color: '#22c55e' },
  { key: 'aluminium', name: 'ألمنيوم', density: 2700, color: '#cbd5e1' },
  { key: 'iron', name: 'حديد', density: 7870, color: '#64748b' },
];

export interface FluidParams {
  mode: FluidMode;
  /** Fluid density kg/m³ */
  fluidDensity: number;
  /** Object density kg/m³ (archimedes) */
  objectDensity: number;
  /** Cube edge length in metres (archimedes) */
  side: number;
  /** Depth of the measuring point in metres (pressure) */
  depth: number;
  /** Inlet radius in cm (bernoulli) */
  inletRadius: number;
  /** Throat radius in cm (bernoulli) */
  throatRadius: number;
  /** Volumetric flow rate in L/s (bernoulli) */
  flowRate: number;
  /** Height difference between inlet and throat, metres (bernoulli) */
  heightDrop: number;
}

export interface FluidStats {
  // Archimedes
  volume: number; // m³
  mass: number; // kg
  weight: number; // N
  submergedFraction: number; // 0..1
  submergedVolume: number; // m³
  buoyancy: number; // N
  netForce: number; // N (positive = upward)
  apparentWeight: number; // N
  floats: boolean;
  // Pressure
  gaugePressure: number; // Pa
  absolutePressure: number; // Pa
  pressureAtm: number; // atm
  waterColumn: number; // equivalent m of water
  // Bernoulli
  areaIn: number; // m²
  areaThroat: number; // m²
  vIn: number; // m/s
  vThroat: number; // m/s
  dynamicIn: number; // Pa
  dynamicThroat: number; // Pa
  pressureDrop: number; // Pa
  reynolds: number;
  regime: 'صفائحي' | 'انتقالي' | 'مضطرب';
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function computeFluid(p: FluidParams): FluidStats {
  const volume = p.side ** 3;
  const mass = volume * p.objectDensity;
  const weight = mass * G;

  const ratio = p.objectDensity / p.fluidDensity;
  const floats = ratio < 1;
  const submergedFraction = clamp(ratio, 0, 1);
  const submergedVolume = volume * submergedFraction;
  const buoyancy = p.fluidDensity * G * submergedVolume;
  const netForce = buoyancy - weight;
  const apparentWeight = Math.max(0, weight - p.fluidDensity * G * volume);

  const gaugePressure = p.fluidDensity * G * p.depth;
  const absolutePressure = gaugePressure + P_ATM;

  const areaIn = Math.PI * (p.inletRadius / 100) ** 2;
  const areaThroat = Math.PI * (p.throatRadius / 100) ** 2;
  const Q = p.flowRate / 1000; // m³/s
  const vIn = Q / Math.max(areaIn, 1e-6);
  const vThroat = Q / Math.max(areaThroat, 1e-6);
  const dynamicIn = 0.5 * p.fluidDensity * vIn ** 2;
  const dynamicThroat = 0.5 * p.fluidDensity * vThroat ** 2;
  // P1 + ½ρv1² + ρgh1 = P2 + ½ρv2² + ρgh2
  const pressureDrop =
    dynamicThroat - dynamicIn - p.fluidDensity * G * p.heightDrop;

  // Re = ρ v D / μ  (μ water ≈ 1.0e-3 Pa·s)
  const mu = 1.0e-3;
  const reynolds = (p.fluidDensity * vThroat * (2 * p.throatRadius) / 100) / mu;
  const regime = reynolds < 2300 ? 'صفائحي' : reynolds < 4000 ? 'انتقالي' : 'مضطرب';

  return {
    volume,
    mass,
    weight,
    submergedFraction,
    submergedVolume,
    buoyancy,
    netForce,
    apparentWeight,
    floats,
    gaugePressure,
    absolutePressure,
    pressureAtm: absolutePressure / P_ATM,
    waterColumn: gaugePressure / (1000 * G),
    areaIn,
    areaThroat,
    vIn,
    vThroat,
    dynamicIn,
    dynamicThroat,
    pressureDrop,
    reynolds,
    regime,
  };
}

/** Buoyancy vs object density sweep (for the chart). */
export function densitySweep(p: FluidParams) {
  const out: { density: number; 'جزء مغمور %': number; 'قوة الطفو (N)': number; 'الوزن (N)': number }[] = [];
  for (let d = 100; d <= 3000; d += 100) {
    const s = computeFluid({ ...p, objectDensity: d });
    out.push({
      density: d,
      'جزء مغمور %': +(s.submergedFraction * 100).toFixed(1),
      'قوة الطفو (N)': +s.buoyancy.toFixed(2),
      'الوزن (N)': +s.weight.toFixed(2),
    });
  }
  return out;
}

/** Pressure vs depth sweep. */
export function depthSweep(p: FluidParams) {
  const out: { depth: number; 'ضغط مقياسي (kPa)': number; 'ضغط مطلق (kPa)': number }[] = [];
  for (let h = 0; h <= 50; h += 2.5) {
    const s = computeFluid({ ...p, depth: h });
    out.push({
      depth: h,
      'ضغط مقياسي (kPa)': +(s.gaugePressure / 1000).toFixed(1),
      'ضغط مطلق (kPa)': +(s.absolutePressure / 1000).toFixed(1),
    });
  }
  return out;
}

/** Velocity / pressure along the venturi tube. */
export function venturiProfile(p: FluidParams) {
  const out: { x: number; 'السرعة (م/ث)': number; 'الضغط النسبي (kPa)': number }[] = [];
  const Q = p.flowRate / 1000;
  for (let i = 0; i <= 40; i++) {
    const x = i / 40; // 0..1 along tube
    const t = Math.exp(-(((x - 0.5) / 0.13) ** 2)); // throat bell
    const rCm = p.inletRadius + (p.throatRadius - p.inletRadius) * t;
    const a = Math.PI * (rCm / 100) ** 2;
    const v = Q / Math.max(a, 1e-6);
    const dyn = 0.5 * p.fluidDensity * v ** 2;
    out.push({
      x: +(x * 100).toFixed(0),
      'السرعة (م/ث)': +v.toFixed(2),
      'الضغط النسبي (kPa)': +(-dyn / 1000).toFixed(2),
    });
  }
  return out;
}

/** Tube radius (in world units) at a normalised position along the venturi. */
export function tubeRadiusAt(x: number, inletRadius: number, throatRadius: number) {
  const t = Math.exp(-(((x - 0.5) / 0.13) ** 2));
  return inletRadius + (throatRadius - inletRadius) * t;
}
