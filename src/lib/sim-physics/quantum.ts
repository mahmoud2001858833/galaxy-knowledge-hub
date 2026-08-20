/** Isolated quantum engine: double slit, rectangular-barrier tunnelling, and infinite-well superposition. */

export const H_PLANCK = 6.62607015e-34;
export const HBAR = H_PLANCK / (2 * Math.PI);
export const M_E = 9.1093837015e-31;
export const E_CHARGE = 1.602176634e-19;

export type QuantumMode = 'doubleslit' | 'tunnel' | 'superposition';

export interface QuantumParams {
  mode: QuantumMode;
  /** Particle kinetic energy (eV) */
  energy: number;
  /** Slit separation (nm) */
  slitSeparation: number;
  /** Slit width (nm) */
  slitWidth: number;
  /** Screen distance (µm) */
  screenDistance: number;
  /** Barrier height (eV) and width (nm) */
  barrierHeight: number;
  barrierWidth: number;
  /** Infinite well width (nm) and mixed states */
  wellWidth: number;
  stateN: number;
  stateM: number;
  /** Mixing amplitude for state m (0..1) */
  mixing: number;
  /** Whether a which-path detector is active (collapses interference) */
  observed: boolean;
}

export interface QuantumStats {
  deBroglie: number; // nm
  momentum: number; // kg·m/s
  fringeSpacing: number; // µm on screen
  maxOrder: number;
  transmission: number; // 0..1
  reflection: number;
  decayLength: number; // nm inside the barrier
  classicallyAllowed: boolean;
  energyN: number; // eV
  energyM: number; // eV
  beatPeriod: number; // fs
  uncertainty: number; // Δx·Δp / (ħ/2)
}

const nm = 1e-9;

export function computeQuantum(p: QuantumParams): QuantumStats {
  const E = Math.max(p.energy, 1e-4) * E_CHARGE;
  const momentum = Math.sqrt(2 * M_E * E);
  const lambda = H_PLANCK / momentum; // m
  const deBroglie = lambda / nm;

  // double slit: y = mλL/d
  const d = Math.max(p.slitSeparation * nm, 1e-12);
  const L = p.screenDistance * 1e-6;
  const fringeSpacing = ((lambda * L) / d) * 1e6; // µm
  const maxOrder = Math.floor(d / lambda);

  // rectangular barrier
  const V0 = p.barrierHeight * E_CHARGE;
  const a = p.barrierWidth * nm;
  let transmission: number;
  const classicallyAllowed = E >= V0;
  let decayLength = Infinity;
  if (!classicallyAllowed) {
    const kappa = Math.sqrt((2 * M_E * (V0 - E)) / (HBAR * HBAR));
    decayLength = 1 / kappa / nm;
    const sinh = Math.sinh(kappa * a);
    transmission = 1 / (1 + (V0 * V0 * sinh * sinh) / (4 * E * (V0 - E)));
  } else if (Math.abs(E - V0) < 1e-30) {
    transmission = 1 / (1 + (M_E * V0 * a * a) / (2 * HBAR * HBAR));
  } else {
    const k2 = Math.sqrt((2 * M_E * (E - V0)) / (HBAR * HBAR));
    const sin = Math.sin(k2 * a);
    transmission = 1 / (1 + (V0 * V0 * sin * sin) / (4 * E * (E - V0)));
  }
  transmission = Math.min(Math.max(transmission, 0), 1);

  // infinite well levels: E_n = n²h²/(8mL²)
  const Lw = Math.max(p.wellWidth * nm, 1e-12);
  const e1 = (H_PLANCK * H_PLANCK) / (8 * M_E * Lw * Lw);
  const energyN = (e1 * p.stateN * p.stateN) / E_CHARGE;
  const energyM = (e1 * p.stateM * p.stateM) / E_CHARGE;
  const dE = Math.abs(energyM - energyN) * E_CHARGE;
  const beatPeriod = dE > 0 ? (H_PLANCK / dE) * 1e15 : Infinity; // fs

  // slit-diffraction uncertainty estimate
  const dx = p.slitWidth * nm;
  const dp = HBAR / (2 * dx);
  const uncertainty = (dx * dp) / (HBAR / 2);

  return {
    deBroglie,
    momentum,
    fringeSpacing,
    maxOrder,
    transmission,
    reflection: 1 - transmission,
    decayLength,
    classicallyAllowed,
    energyN,
    energyM,
    beatPeriod,
    uncertainty,
  };
}

/** Intensity pattern on the screen (double slit × single-slit envelope). */
export function interferencePattern(p: QuantumParams, points = 220) {
  const E = Math.max(p.energy, 1e-4) * E_CHARGE;
  const lambda = H_PLANCK / Math.sqrt(2 * M_E * E);
  const d = p.slitSeparation * nm;
  const w = p.slitWidth * nm;
  const L = p.screenDistance * 1e-6;
  const span = 12 * ((lambda * L) / d);
  const out: { y: number; 'الشدة': number; 'الغلاف': number }[] = [];
  for (let i = 0; i <= points; i++) {
    const y = -span / 2 + (i / points) * span;
    const theta = Math.atan2(y, L);
    const beta = (Math.PI * w * Math.sin(theta)) / lambda;
    const envelope = beta === 0 ? 1 : Math.pow(Math.sin(beta) / beta, 2);
    const delta = (Math.PI * d * Math.sin(theta)) / lambda;
    const two = Math.pow(Math.cos(delta), 2);
    const intensity = p.observed ? envelope : envelope * two;
    out.push({
      y: Number((y * 1e6).toFixed(3)),
      'الشدة': Number(intensity.toFixed(4)),
      'الغلاف': Number(envelope.toFixed(4)),
    });
  }
  return out;
}

/** Transmission probability vs energy for the current barrier. */
export function tunnellingCurve(p: QuantumParams, points = 120) {
  const out: { E: number; 'احتمال النفاذ (%)': number }[] = [];
  for (let i = 1; i <= points; i++) {
    const energy = (i / points) * p.barrierHeight * 2;
    const st = computeQuantum({ ...p, energy });
    out.push({
      E: Number(energy.toFixed(2)),
      'احتمال النفاذ (%)': Number((st.transmission * 100).toFixed(3)),
    });
  }
  return out;
}

/** Normalised |ψ|² of the mixed state inside the infinite well at time t (fs). */
export function wellDensity(p: QuantumParams, tFs = 0, points = 160) {
  const out: { x: number; 'كثافة الاحتمال': number; 'ψ': number }[] = [];
  const c1 = Math.sqrt(1 - p.mixing);
  const c2 = Math.sqrt(p.mixing);
  const Lw = Math.max(p.wellWidth, 0.01);
  const st = computeQuantum(p);
  const w1 = (st.energyN * E_CHARGE) / HBAR;
  const w2 = (st.energyM * E_CHARGE) / HBAR;
  const t = tFs * 1e-15;
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * Lw;
    const p1 = Math.sqrt(2 / Lw) * Math.sin((p.stateN * Math.PI * x) / Lw);
    const p2 = Math.sqrt(2 / Lw) * Math.sin((p.stateM * Math.PI * x) / Lw);
    const re = c1 * p1 * Math.cos(w1 * t) + c2 * p2 * Math.cos(w2 * t);
    const im = -(c1 * p1 * Math.sin(w1 * t) + c2 * p2 * Math.sin(w2 * t));
    out.push({
      x: Number(x.toFixed(3)),
      'كثافة الاحتمال': Number((re * re + im * im).toFixed(4)),
      'ψ': Number(re.toFixed(4)),
    });
  }
  return out;
}
