/** Isolated thermodynamics engine shared by the 3D scene, HUD and charts. */

export type ThermoMode = 'ideal-gas' | 'carnot' | 'heat-transfer';
export type GasProcess = 'isothermal' | 'isobaric' | 'isochoric' | 'adiabatic';

export const R = 8.314; // J/(mol·K)
export const N_A = 6.02214076e23;
export const K_B = 1.380649e-23;
export const SIGMA = 5.670374419e-8; // Stefan–Boltzmann

export interface Material {
  key: string;
  name: string;
  k: number; // thermal conductivity W/(m·K)
  emissivity: number;
  color: string;
}

export const MATERIALS: Material[] = [
  { key: 'copper', name: 'نحاس', k: 401, emissivity: 0.04, color: '#f97316' },
  { key: 'aluminium', name: 'ألمنيوم', k: 237, emissivity: 0.09, color: '#cbd5e1' },
  { key: 'steel', name: 'فولاذ', k: 50, emissivity: 0.28, color: '#64748b' },
  { key: 'glass', name: 'زجاج', k: 1.05, emissivity: 0.92, color: '#7dd3fc' },
  { key: 'brick', name: 'طوب', k: 0.72, emissivity: 0.93, color: '#b45309' },
  { key: 'wood', name: 'خشب', k: 0.15, emissivity: 0.9, color: '#a16207' },
  { key: 'foam', name: 'عازل فوم', k: 0.033, emissivity: 0.75, color: '#22c55e' },
];

export interface ThermoParams {
  mode: ThermoMode;
  process: GasProcess;
  /** Moles of gas */
  moles: number;
  /** Temperature in K (ideal gas) */
  temperature: number;
  /** Volume in litres (ideal gas) */
  volume: number;
  /** Adiabatic index */
  gamma: number;
  /** Carnot hot reservoir K */
  tHot: number;
  /** Carnot cold reservoir K */
  tCold: number;
  /** Heat absorbed from hot reservoir, J */
  qHot: number;
  /** Heat transfer: material key */
  materialKey: string;
  /** Wall area m² */
  area: number;
  /** Wall thickness m */
  thickness: number;
  /** Hot side surface temperature K */
  surfaceHot: number;
  /** Cold side surface temperature K */
  surfaceCold: number;
  /** Convection coefficient W/(m²·K) */
  hConv: number;
}

export interface ThermoStats {
  // ideal gas
  pressure: number; // Pa
  pressureAtm: number;
  vRms: number; // m/s
  kineticPerMolecule: number; // J
  internalEnergy: number; // J
  molecules: number;
  density: number; // mol/L
  // carnot
  efficiency: number; // 0..1
  qCold: number; // J
  work: number; // J
  cop: number; // coefficient of performance as fridge
  entropyHot: number; // J/K
  // heat transfer
  conduction: number; // W
  convection: number; // W
  radiation: number; // W
  totalFlux: number; // W
  rValue: number; // m²·K/W
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function computeThermo(p: ThermoParams): ThermoStats {
  const V = Math.max(p.volume, 0.1) / 1000; // m³
  const T = Math.max(p.temperature, 1);
  const pressure = (p.moles * R * T) / V;

  const molarMass = 0.028; // N₂ kg/mol as the working gas
  const vRms = Math.sqrt((3 * R * T) / molarMass);
  const kineticPerMolecule = 1.5 * K_B * T;
  const internalEnergy = 1.5 * p.moles * R * T;
  const molecules = p.moles * N_A;

  const tHot = Math.max(p.tHot, p.tCold + 1);
  const efficiency = 1 - p.tCold / tHot;
  const work = p.qHot * efficiency;
  const qCold = p.qHot - work;
  const cop = p.tCold / Math.max(tHot - p.tCold, 1e-6);
  const entropyHot = p.qHot / tHot;

  const mat = MATERIALS.find((m) => m.key === p.materialKey) ?? MATERIALS[0];
  const dT = p.surfaceHot - p.surfaceCold;
  const conduction = (mat.k * p.area * dT) / Math.max(p.thickness, 0.001);
  const convection = p.hConv * p.area * dT;
  const radiation =
    mat.emissivity * SIGMA * p.area * (p.surfaceHot ** 4 - p.surfaceCold ** 4);
  const rValue = Math.max(p.thickness, 0.001) / mat.k;

  return {
    pressure,
    pressureAtm: pressure / 101325,
    vRms,
    kineticPerMolecule,
    internalEnergy,
    molecules,
    density: p.moles / Math.max(p.volume, 0.1),
    efficiency: clamp(efficiency, 0, 1),
    qCold,
    work,
    cop,
    entropyHot,
    conduction,
    convection,
    radiation,
    totalFlux: conduction + convection + radiation,
    rValue,
  };
}

/** Process curve on a P–V diagram starting from the current state. */
export function processCurve(p: ThermoParams) {
  const V0 = Math.max(p.volume, 0.1) / 1000;
  const T0 = Math.max(p.temperature, 1);
  const P0 = (p.moles * R * T0) / V0;
  const out: { volume: number; 'الضغط (kPa)': number; 'الحرارة (K)': number }[] = [];

  for (let i = 0; i <= 40; i++) {
    const V = ((0.4 + (i / 40) * 1.6) * V0);
    let P: number;
    let T: number;
    switch (p.process) {
      case 'isothermal':
        P = (p.moles * R * T0) / V;
        T = T0;
        break;
      case 'isobaric':
        P = P0;
        T = (P * V) / (p.moles * R);
        break;
      case 'isochoric':
        P = P0 * (V / V0); // shown as a vertical-ish reference (V fixed in practice)
        T = (P0 * V0) / (p.moles * R) * (V / V0);
        break;
      case 'adiabatic':
      default:
        P = P0 * (V0 / V) ** p.gamma;
        T = (P * V) / (p.moles * R);
        break;
    }
    out.push({
      volume: +(V * 1000).toFixed(1),
      'الضغط (kPa)': +(P / 1000).toFixed(2),
      'الحرارة (K)': +T.toFixed(1),
    });
  }
  return out;
}

/** Maxwell–Boltzmann speed distribution (N₂). */
export function speedDistribution(temperature: number) {
  const m = 0.028 / N_A;
  const T = Math.max(temperature, 1);
  const out: { speed: number; 'التوزيع': number }[] = [];
  for (let v = 0; v <= 2000; v += 40) {
    const f =
      4 *
      Math.PI *
      (m / (2 * Math.PI * K_B * T)) ** 1.5 *
      v ** 2 *
      Math.exp((-m * v ** 2) / (2 * K_B * T));
    out.push({ speed: v, 'التوزيع': +(f * 1000).toFixed(4) });
  }
  return out;
}

/** Carnot efficiency as a function of hot-reservoir temperature. */
export function efficiencySweep(p: ThermoParams) {
  const out: { tHot: number; 'الكفاءة %': number; 'الشغل (J)': number }[] = [];
  for (let t = p.tCold + 20; t <= 1500; t += 40) {
    const eff = 1 - p.tCold / t;
    out.push({ tHot: t, 'الكفاءة %': +(eff * 100).toFixed(1), 'الشغل (J)': +(p.qHot * eff).toFixed(0) });
  }
  return out;
}

/** Heat flux vs wall thickness for every material. */
export function thicknessSweep(p: ThermoParams) {
  const mat = MATERIALS.find((m) => m.key === p.materialKey) ?? MATERIALS[0];
  const dT = p.surfaceHot - p.surfaceCold;
  const out: { thickness: number; 'التوصيل (W)': number; 'المقاومة R': number }[] = [];
  for (let d = 0.01; d <= 0.5; d += 0.01) {
    out.push({
      thickness: +d.toFixed(2),
      'التوصيل (W)': +((mat.k * p.area * dT) / d).toFixed(1),
      'المقاومة R': +(d / mat.k).toFixed(3),
    });
  }
  return out;
}

/** Colour ramp from cold blue to hot white/orange. */
export function temperatureColor(T: number, min = 100, max = 1200) {
  const t = clamp((T - min) / (max - min), 0, 1);
  const hue = 220 - t * 220; // 220 (blue) → 0 (red)
  const light = 45 + t * 25;
  return `hsl(${hue}, 90%, ${light}%)`;
}
