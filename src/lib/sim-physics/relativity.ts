/** Isolated special-relativity engine: time dilation, length contraction, and mass–energy. */

export const C_LIGHT = 299792458; // m/s
export const MEV = 1.602176634e-13; // J per MeV

export type RelativityMode = 'dilation' | 'contraction' | 'energy';

export interface RelativityParams {
  mode: RelativityMode;
  /** Speed as a fraction of c (0..0.999999) */
  beta: number;
  /** Proper time interval measured on the moving clock (s) */
  properTime: number;
  /** Proper length of the moving object (m) */
  properLength: number;
  /** Rest mass (kg) */
  restMass: number;
  /** Second velocity for relativistic velocity addition (fraction of c) */
  betaSecond: number;
  /** Journey distance for the twin paradox (light-years) */
  journeyLy: number;
}

export interface RelativityStats {
  gamma: number;
  speed: number; // m/s
  dilatedTime: number; // s (observer frame)
  contractedLength: number; // m
  relativisticMass: number; // kg
  restEnergy: number; // MeV
  totalEnergy: number; // MeV
  kineticEnergy: number; // MeV
  momentum: number; // MeV/c
  addedBeta: number; // relativistic velocity addition result
  classicalBeta: number; // naive sum
  dopplerApproach: number; // frequency ratio
  dopplerRecede: number;
  earthYears: number; // twin paradox
  travellerYears: number;
  ageGap: number;
}

export const gammaOf = (beta: number) => 1 / Math.sqrt(Math.max(1 - beta * beta, 1e-12));

export function computeRelativity(p: RelativityParams): RelativityStats {
  const beta = Math.min(Math.max(p.beta, 0), 0.999999);
  const gamma = gammaOf(beta);
  const speed = beta * C_LIGHT;

  const dilatedTime = p.properTime * gamma;
  const contractedLength = p.properLength / gamma;

  const relativisticMass = p.restMass * gamma;
  const restEnergy = (p.restMass * C_LIGHT * C_LIGHT) / MEV;
  const totalEnergy = restEnergy * gamma;
  const kineticEnergy = totalEnergy - restEnergy;
  const momentum = restEnergy * gamma * beta; // MeV/c

  const b2 = Math.min(Math.max(p.betaSecond, 0), 0.999999);
  const addedBeta = (beta + b2) / (1 + beta * b2);
  const classicalBeta = beta + b2;

  const dopplerApproach = Math.sqrt((1 + beta) / (1 - beta));
  const dopplerRecede = Math.sqrt((1 - beta) / (1 + beta));

  const earthYears = beta > 0 ? (2 * p.journeyLy) / beta : Infinity;
  const travellerYears = earthYears / gamma;

  return {
    gamma,
    speed,
    dilatedTime,
    contractedLength,
    relativisticMass,
    restEnergy,
    totalEnergy,
    kineticEnergy,
    momentum,
    addedBeta,
    classicalBeta,
    dopplerApproach,
    dopplerRecede,
    earthYears,
    travellerYears,
    ageGap: earthYears - travellerYears,
  };
}

/** γ, contracted length ratio and dilated time ratio versus β. */
export function gammaCurve(points = 120) {
  const data: { beta: number; 'معامل لورنتز γ': number; 'نسبة الطول L/L₀': number }[] = [];
  for (let i = 0; i <= points; i++) {
    const beta = (i / points) * 0.995;
    const g = gammaOf(beta);
    data.push({
      beta: Number(beta.toFixed(3)),
      'معامل لورنتز γ': Number(Math.min(g, 12).toFixed(3)),
      'نسبة الطول L/L₀': Number((1 / g).toFixed(4)),
    });
  }
  return data;
}

/** Kinetic energy (as multiples of rest energy) versus β — relativistic vs classical. */
export function energyCurve(points = 120) {
  const data: { beta: number; 'النسبية KE/E₀': number; 'الكلاسيكية KE/E₀': number }[] = [];
  for (let i = 0; i <= points; i++) {
    const beta = (i / points) * 0.99;
    const rel = gammaOf(beta) - 1;
    const cls = 0.5 * beta * beta;
    data.push({
      beta: Number(beta.toFixed(3)),
      'النسبية KE/E₀': Number(Math.min(rel, 8).toFixed(4)),
      'الكلاسيكية KE/E₀': Number(cls.toFixed(4)),
    });
  }
  return data;
}
