/**
 * States of matter physics: phase determination, Clausius–Clapeyron curves,
 * heating-curve energetics and kinetic particle speeds.
 * All temperatures in Kelvin, pressures in atm, energies in kJ.
 */

export type PhaseMode = 'particles' | 'heating' | 'diagram';
export type Phase = 'solid' | 'liquid' | 'gas';

export interface Substance {
  id: string;
  name: string;
  formula: string;
  /** Normal melting point at 1 atm (K). */
  tm: number;
  /** Normal boiling point at 1 atm (K). */
  tb: number;
  /** Triple point (K, atm). */
  triple: { t: number; p: number };
  /** Critical point (K, atm). */
  critical: { t: number; p: number };
  /** Specific heat capacities (J/g·K). */
  cSolid: number;
  cLiquid: number;
  cGas: number;
  /** Latent heats (J/g). */
  hFus: number;
  hVap: number;
  /** Molar mass (g/mol). */
  molarMass: number;
  color: string;
}

export const SUBSTANCES: Substance[] = [
  {
    id: 'water',
    name: 'الماء',
    formula: 'H₂O',
    tm: 273.15,
    tb: 373.15,
    triple: { t: 273.16, p: 0.006 },
    critical: { t: 647.1, p: 218 },
    cSolid: 2.09,
    cLiquid: 4.18,
    cGas: 2.01,
    hFus: 334,
    hVap: 2260,
    molarMass: 18.02,
    color: '#38bdf8',
  },
  {
    id: 'ethanol',
    name: 'الإيثانول',
    formula: 'C₂H₅OH',
    tm: 159,
    tb: 351.5,
    triple: { t: 150, p: 0.00000043 },
    critical: { t: 514, p: 61 },
    cSolid: 1.25,
    cLiquid: 2.44,
    cGas: 1.42,
    hFus: 109,
    hVap: 841,
    molarMass: 46.07,
    color: '#a78bfa',
  },
  {
    id: 'co2',
    name: 'ثاني أكسيد الكربون',
    formula: 'CO₂',
    tm: 216.6,
    tb: 194.7,
    triple: { t: 216.6, p: 5.11 },
    critical: { t: 304.1, p: 72.8 },
    cSolid: 0.7,
    cLiquid: 1.9,
    cGas: 0.85,
    hFus: 184,
    hVap: 574,
    molarMass: 44.01,
    color: '#94a3b8',
  },
  {
    id: 'iron',
    name: 'الحديد',
    formula: 'Fe',
    tm: 1811,
    tb: 3134,
    triple: { t: 1811, p: 0.00000001 },
    critical: { t: 9250, p: 8750 },
    cSolid: 0.45,
    cLiquid: 0.82,
    cGas: 0.44,
    hFus: 247,
    hVap: 6090,
    molarMass: 55.85,
    color: '#fb923c',
  },
  {
    id: 'nitrogen',
    name: 'النيتروجين',
    formula: 'N₂',
    tm: 63.1,
    tb: 77.4,
    triple: { t: 63.1, p: 0.124 },
    critical: { t: 126.2, p: 33.5 },
    cSolid: 1.0,
    cLiquid: 2.04,
    cGas: 1.04,
    hFus: 25.7,
    hVap: 199,
    molarMass: 28.01,
    color: '#22d3ee',
  },
];

export const findSubstance = (id: string): Substance =>
  SUBSTANCES.find((s) => s.id === id) ?? SUBSTANCES[0];

const R = 8.314; // J/mol·K

/** Boiling temperature at a given pressure via Clausius–Clapeyron. */
export function boilingAt(s: Substance, pressureAtm: number): number {
  const p = Math.max(pressureAtm, 1e-8);
  const dHvap = s.hVap * s.molarMass; // J/mol
  const inv = 1 / s.tb - (R / dHvap) * Math.log(p / 1);
  return 1 / inv;
}

/** Melting temperature shifts only slightly with pressure (linear approximation). */
export function meltingAt(s: Substance, pressureAtm: number): number {
  const slope = s.id === 'water' ? -0.0074 : 0.003; // K per atm
  return s.tm + slope * (pressureAtm - 1);
}

/** Sublimation curve temperature at a pressure below the triple point. */
export function sublimationAt(s: Substance, pressureAtm: number): number {
  const p = Math.max(pressureAtm, 1e-10);
  const dHsub = (s.hVap + s.hFus) * s.molarMass;
  const inv = 1 / s.triple.t - (R / dHsub) * Math.log(p / s.triple.p);
  return 1 / inv;
}

export function phaseAt(s: Substance, tempK: number, pressureAtm: number): Phase {
  if (tempK >= s.critical.t && pressureAtm >= s.critical.p) return 'gas'; // supercritical → treated as fluid/gas
  if (pressureAtm < s.triple.p) {
    return tempK < sublimationAt(s, pressureAtm) ? 'solid' : 'gas';
  }
  const tMelt = meltingAt(s, pressureAtm);
  const tBoil = boilingAt(s, pressureAtm);
  if (tempK < tMelt) return 'solid';
  if (tempK < tBoil) return 'liquid';
  return 'gas';
}

export const PHASE_LABEL: Record<Phase, string> = {
  solid: 'صلب',
  liquid: 'سائل',
  gas: 'غاز',
};

export interface PhaseParams {
  substanceId: string;
  temperature: number; // K
  pressure: number; // atm
  mass: number; // g
}

export interface PhaseStats {
  substance: Substance;
  phase: Phase;
  phaseLabel: string;
  meltingPoint: number;
  boilingPoint: number;
  /** RMS molecular speed (m/s). */
  rmsSpeed: number;
  /** Average kinetic energy per molecule (J). */
  kineticEnergy: number;
  /** Fraction 0..1 of how far the temperature is through the current phase window. */
  progress: number;
  /** Order parameter: 1 = ordered lattice, 0 = free gas. */
  order: number;
  /** Energy already stored from 0 K to current temperature (kJ). */
  energyStored: number;
  /** Total energy needed to fully vaporise the sample from current state (kJ). */
  energyToGas: number;
  density: number; // relative visual density
  supercritical: boolean;
}

const kB = 1.380649e-23;
const NA = 6.02214076e23;

export function computeStates(p: PhaseParams): PhaseStats {
  const s = findSubstance(p.substanceId);
  const t = Math.max(p.temperature, 1);
  const phase = phaseAt(s, t, p.pressure);
  const tMelt = meltingAt(s, p.pressure);
  const tBoil = boilingAt(s, p.pressure);

  const massMolar = s.molarMass / 1000; // kg/mol
  const rmsSpeed = Math.sqrt((3 * R * t) / massMolar);
  const kineticEnergy = 1.5 * kB * t;

  let progress = 0;
  if (phase === 'solid') progress = Math.min(1, t / Math.max(tMelt, 1));
  else if (phase === 'liquid') progress = (t - tMelt) / Math.max(tBoil - tMelt, 1);
  else progress = Math.min(1, (t - tBoil) / Math.max(tBoil * 0.5, 1));

  const order = phase === 'solid' ? 1 - 0.35 * progress : phase === 'liquid' ? 0.45 - 0.35 * progress : 0.02;

  // Energy stored heating from 0 K (kJ)
  let e = 0;
  if (t <= tMelt) e = (s.cSolid * p.mass * t) / 1000;
  else {
    e = (s.cSolid * p.mass * tMelt) / 1000 + (s.hFus * p.mass) / 1000;
    if (t <= tBoil) e += (s.cLiquid * p.mass * (t - tMelt)) / 1000;
    else {
      e += (s.cLiquid * p.mass * (tBoil - tMelt)) / 1000 + (s.hVap * p.mass) / 1000;
      e += (s.cGas * p.mass * (t - tBoil)) / 1000;
    }
  }

  const totalToGas =
    (s.cSolid * p.mass * tMelt) / 1000 +
    (s.hFus * p.mass) / 1000 +
    (s.cLiquid * p.mass * (tBoil - tMelt)) / 1000 +
    (s.hVap * p.mass) / 1000;

  const density = phase === 'solid' ? 1 : phase === 'liquid' ? 0.92 : 0.12;

  return {
    substance: s,
    phase,
    phaseLabel: PHASE_LABEL[phase],
    meltingPoint: tMelt,
    boilingPoint: tBoil,
    rmsSpeed,
    kineticEnergy,
    progress: Math.max(0, Math.min(1, progress)),
    order: Math.max(0, Math.min(1, order)),
    energyStored: e,
    energyToGas: Math.max(0, totalToGas - e),
    density,
    supercritical: t >= s.critical.t && p.pressure >= s.critical.p,
  };
}

/** Heating curve: temperature vs added energy (kJ) for the full solid→gas path. */
export function heatingCurve(p: PhaseParams, points = 160) {
  const s = findSubstance(p.substanceId);
  const tMelt = meltingAt(s, p.pressure);
  const tBoil = boilingAt(s, p.pressure);
  const start = Math.max(1, tMelt - 60);

  const eSolid = (s.cSolid * p.mass * (tMelt - start)) / 1000;
  const eFus = (s.hFus * p.mass) / 1000;
  const eLiquid = (s.cLiquid * p.mass * (tBoil - tMelt)) / 1000;
  const eVap = (s.hVap * p.mass) / 1000;
  const eGas = (s.cGas * p.mass * 60) / 1000;
  const total = eSolid + eFus + eLiquid + eVap + eGas;

  const out: { energy: number; temp: number; phase: string }[] = [];
  for (let i = 0; i <= points; i++) {
    const e = (total * i) / points;
    let temp: number;
    let phase: string;
    if (e <= eSolid) {
      temp = start + (e / Math.max(eSolid, 1e-9)) * (tMelt - start);
      phase = 'صلب';
    } else if (e <= eSolid + eFus) {
      temp = tMelt;
      phase = 'انصهار';
    } else if (e <= eSolid + eFus + eLiquid) {
      temp = tMelt + ((e - eSolid - eFus) / Math.max(eLiquid, 1e-9)) * (tBoil - tMelt);
      phase = 'سائل';
    } else if (e <= eSolid + eFus + eLiquid + eVap) {
      temp = tBoil;
      phase = 'تبخّر';
    } else {
      temp = tBoil + ((e - eSolid - eFus - eLiquid - eVap) / Math.max(eGas, 1e-9)) * 60;
      phase = 'غاز';
    }
    out.push({ energy: Number(e.toFixed(2)), temp: Number(temp.toFixed(1)), phase });
  }
  return out;
}

/** Phase-boundary curves for the P–T diagram (log-friendly pressures). */
export function phaseDiagramCurves(substanceId: string) {
  const s = findSubstance(substanceId);
  const fusion: { t: number; p: number }[] = [];
  const vapor: { t: number; p: number }[] = [];
  const sublim: { t: number; p: number }[] = [];

  for (let i = 0; i <= 60; i++) {
    const p = s.triple.p + ((s.critical.p - s.triple.p) * i) / 60;
    fusion.push({ t: Number(meltingAt(s, p).toFixed(2)), p: Number(p.toFixed(4)) });
    vapor.push({ t: Number(boilingAt(s, p).toFixed(2)), p: Number(p.toFixed(4)) });
  }
  for (let i = 0; i <= 40; i++) {
    const p = (s.triple.p * (i + 1)) / 41;
    sublim.push({ t: Number(sublimationAt(s, p).toFixed(2)), p: Number(p.toFixed(6)) });
  }
  return { fusion, vapor, sublim, triple: s.triple, critical: s.critical };
}

/** Maxwell–Boltzmann speed distribution for the chart. */
export function speedDistribution(substanceId: string, tempK: number, points = 60) {
  const s = findSubstance(substanceId);
  const m = s.molarMass / 1000 / NA;
  const t = Math.max(tempK, 1);
  const vMax = Math.sqrt((3 * R * t) / (s.molarMass / 1000)) * 2.5;
  const out: { v: number; f: number }[] = [];
  for (let i = 0; i <= points; i++) {
    const v = (vMax * i) / points;
    const f =
      4 *
      Math.PI *
      Math.pow(m / (2 * Math.PI * kB * t), 1.5) *
      v * v *
      Math.exp((-m * v * v) / (2 * kB * t));
    out.push({ v: Number(v.toFixed(1)), f: Number((f * 1000).toFixed(5)) });
  }
  return out;
}
