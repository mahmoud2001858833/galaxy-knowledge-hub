/**
 * الكيمياء الكهربائية — محرك حسابي
 * Galvanic cells (Nernst), electrolysis (Faraday's laws) and corrosion rate.
 */

export const F = 96485.332; // C/mol
export const R_GAS = 8.314462; // J/(mol·K)

export type ElectroMode = 'galvanic' | 'electrolysis' | 'corrosion';

export interface Electrode {
  id: string;
  name: string;
  symbol: string;
  /** standard reduction potential in volts */
  e0: number;
  /** electrons exchanged */
  n: number;
  /** molar mass g/mol */
  molarMass: number;
  color: string;
}

export const ELECTRODES: Electrode[] = [
  { id: 'li', name: 'ليثيوم', symbol: 'Li⁺/Li', e0: -3.04, n: 1, molarMass: 6.94, color: '#c4b5fd' },
  { id: 'mg', name: 'مغنيسيوم', symbol: 'Mg²⁺/Mg', e0: -2.37, n: 2, molarMass: 24.31, color: '#cbd5e1' },
  { id: 'al', name: 'ألمنيوم', symbol: 'Al³⁺/Al', e0: -1.66, n: 3, molarMass: 26.98, color: '#94a3b8' },
  { id: 'zn', name: 'خارصين', symbol: 'Zn²⁺/Zn', e0: -0.76, n: 2, molarMass: 65.38, color: '#a3a3a3' },
  { id: 'fe', name: 'حديد', symbol: 'Fe²⁺/Fe', e0: -0.44, n: 2, molarMass: 55.85, color: '#78716c' },
  { id: 'ni', name: 'نيكل', symbol: 'Ni²⁺/Ni', e0: -0.25, n: 2, molarMass: 58.69, color: '#d4d4d8' },
  { id: 'pb', name: 'رصاص', symbol: 'Pb²⁺/Pb', e0: -0.13, n: 2, molarMass: 207.2, color: '#64748b' },
  { id: 'h', name: 'هيدروجين', symbol: 'H⁺/H₂', e0: 0.0, n: 2, molarMass: 1.008, color: '#e0f2fe' },
  { id: 'cu', name: 'نحاس', symbol: 'Cu²⁺/Cu', e0: 0.34, n: 2, molarMass: 63.55, color: '#f97316' },
  { id: 'ag', name: 'فضة', symbol: 'Ag⁺/Ag', e0: 0.8, n: 1, molarMass: 107.87, color: '#e2e8f0' },
  { id: 'au', name: 'ذهب', symbol: 'Au³⁺/Au', e0: 1.5, n: 3, molarMass: 196.97, color: '#fbbf24' },
];

export const findElectrode = (id: string) => ELECTRODES.find((e) => e.id === id) ?? ELECTRODES[3];

export interface ElectroParams {
  mode: ElectroMode;
  anodeId: string;
  cathodeId: string;
  /** anode ion concentration mol/L */
  anodeConc: number;
  /** cathode ion concentration mol/L */
  cathodeConc: number;
  /** temperature in Kelvin */
  temperature: number;
  /** applied voltage for electrolysis (V) */
  appliedVoltage: number;
  /** current in amperes */
  current: number;
  /** run time in minutes */
  minutes: number;
  /** electrolyte salinity for corrosion 0-1 */
  salinity: number;
  /** protective coating / cathodic protection 0-1 */
  protection: number;
}

export interface ElectroStats {
  e0Cell: number;
  eCell: number;
  reactionQuotient: number;
  nElectrons: number;
  deltaG: number; // J/mol
  deltaG0: number;
  equilibriumK: number;
  spontaneous: boolean;
  charge: number; // C
  molesDeposited: number;
  massDeposited: number; // g
  gasVolume: number; // L at STP (if gas)
  power: number; // W
  energy: number; // J
  decompositionVoltage: number;
  electrolysisActive: boolean;
  corrosionCurrentDensity: number; // µA/cm²
  corrosionRateMmPerYear: number;
  yearsToPerforate: number;
  anodeName: string;
  cathodeName: string;
  cellNotation: string;
}

export const computeElectro = (p: ElectroParams): ElectroStats => {
  const anode = findElectrode(p.anodeId);
  const cathode = findElectrode(p.cathodeId);
  const T = Math.max(p.temperature, 200);
  const n = Math.max(1, Math.min(anode.n, cathode.n) === 0 ? 2 : lcmSmall(anode.n, cathode.n));

  const e0Cell = cathode.e0 - anode.e0;
  const Q = Math.pow(Math.max(p.anodeConc, 1e-6), anode.n) / Math.pow(Math.max(p.cathodeConc, 1e-6), cathode.n);
  const eCell = e0Cell - ((R_GAS * T) / (n * F)) * Math.log(Q);

  const deltaG0 = -n * F * e0Cell;
  const deltaG = -n * F * eCell;
  const equilibriumK = Math.exp((n * F * e0Cell) / (R_GAS * T));

  const seconds = Math.max(p.minutes, 0) * 60;
  const charge = p.current * seconds;
  const molesDeposited = charge / (n * F);
  const massDeposited = molesDeposited * cathode.molarMass;
  const gasVolume = molesDeposited * 22.414;

  const decompositionVoltage = Math.abs(e0Cell) + 0.4; // includes typical overpotential
  const electrolysisActive = p.appliedVoltage > decompositionVoltage;
  const power = p.appliedVoltage * p.current;
  const energy = power * seconds;

  // corrosion: driving force from potential difference vs oxygen electrode (0.4 V)
  const drive = Math.max(0.4 - anode.e0, 0);
  const icorr = drive * 40 * (0.15 + p.salinity) * (1 - Math.min(p.protection, 0.98));
  const density = 7.8; // g/cm³ typical steel
  const corrosionRateMmPerYear =
    (3.27e-3 * icorr * (anode.molarMass / anode.n)) / density / 10; // mm/yr from µA/cm²
  const yearsToPerforate = corrosionRateMmPerYear > 1e-6 ? 3 / corrosionRateMmPerYear : Infinity;

  return {
    e0Cell,
    eCell,
    reactionQuotient: Q,
    nElectrons: n,
    deltaG,
    deltaG0,
    equilibriumK,
    spontaneous: eCell > 0,
    charge,
    molesDeposited,
    massDeposited,
    gasVolume,
    power,
    energy,
    decompositionVoltage,
    electrolysisActive,
    corrosionCurrentDensity: icorr,
    corrosionRateMmPerYear,
    yearsToPerforate,
    anodeName: anode.name,
    cathodeName: cathode.name,
    cellNotation: `${anode.symbol} ∥ ${cathode.symbol}`,
  };
};

function lcmSmall(a: number, b: number) {
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  return (a * b) / gcd(a, b);
}

/** Nernst curve: cell voltage vs log10(Q). */
export const nernstCurve = (e0: number, n: number, T = 298.15, points = 61) =>
  Array.from({ length: points }, (_, i) => {
    const logQ = -6 + (i / (points - 1)) * 12;
    const e = e0 - ((R_GAS * T) / (n * F)) * Math.log(10) * logQ;
    return {
      'log Q': Number(logQ.toFixed(2)),
      'جهد الخلية (V)': Number(e.toFixed(4)),
    };
  });

/** Faraday deposition curve: mass vs time for a given current. */
export const faradayCurve = (current: number, molarMass: number, n: number, maxMinutes = 60, points = 41) =>
  Array.from({ length: points }, (_, i) => {
    const min = (i / (points - 1)) * maxMinutes;
    const mass = ((current * min * 60) / (n * F)) * molarMass;
    return {
      'الزمن (دقيقة)': Number(min.toFixed(1)),
      'الكتلة المترسبة (g)': Number(mass.toFixed(4)),
    };
  });

/** Galvanic series ordering for teaching. */
export const galvanicSeries = () =>
  [...ELECTRODES]
    .sort((a, b) => a.e0 - b.e0)
    .map((e) => ({ 'القطب': e.name, 'الجهد القياسي (V)': e.e0 }));
