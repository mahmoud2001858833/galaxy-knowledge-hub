/** Isolated electromagnetism engine: field of a straight wire, solenoid, Faraday induction and Lorentz force. */

export type EMMode = 'wire' | 'solenoid' | 'induction';

export const MU0 = 4 * Math.PI * 1e-7; // T·m/A
export const ELECTRON_CHARGE = 1.602176634e-19; // C

export interface EMParams {
  mode: EMMode;
  /** Straight wire / solenoid current (A) */
  current: number;
  /** Radial distance for the wire reading (m) */
  distance: number;
  /** Solenoid turns */
  turns: number;
  /** Solenoid length (m) */
  coilLength: number;
  /** Solenoid core relative permeability (1 = air, ~1000 = iron) */
  coreMu: number;
  /** Induction: loop area (m²) */
  loopArea: number;
  /** Induction: external field magnitude (T) */
  fieldStrength: number;
  /** Induction: rotation speed (rev/s) */
  rotationSpeed: number;
  /** Induction: loop resistance (Ω) */
  resistance: number;
  /** Charge test: particle speed (m/s) */
  chargeSpeed: number;
}

export interface EMStats {
  wireField: number; // T
  solenoidField: number; // T
  turnsPerMetre: number;
  magneticMoment: number; // A·m²
  inductance: number; // H
  peakEmf: number; // V
  rmsEmf: number; // V
  peakCurrent: number; // A
  power: number; // W
  fluxMax: number; // Wb
  angularFreq: number; // rad/s
  lorentzForce: number; // N
  gyroRadius: number; // m
  energyDensity: number; // J/m³
}

export function computeEM(p: EMParams): EMStats {
  const r = Math.max(p.distance, 1e-3);
  const wireField = (MU0 * Math.abs(p.current)) / (2 * Math.PI * r);

  const n = p.turns / Math.max(p.coilLength, 1e-3);
  const solenoidField = MU0 * p.coreMu * n * Math.abs(p.current);
  const area = Math.max(p.loopArea, 1e-4);
  const magneticMoment = p.turns * Math.abs(p.current) * area;
  const inductance = MU0 * p.coreMu * n * p.turns * area;

  const omega = 2 * Math.PI * p.rotationSpeed;
  const fluxMax = p.fieldStrength * area;
  const peakEmf = fluxMax * omega * p.turns;
  const rmsEmf = peakEmf / Math.SQRT2;
  const peakCurrent = peakEmf / Math.max(p.resistance, 1e-3);
  const power = (rmsEmf * rmsEmf) / Math.max(p.resistance, 1e-3);

  const lorentzForce = ELECTRON_CHARGE * p.chargeSpeed * p.fieldStrength;
  const gyroRadius =
    (9.1093837e-31 * p.chargeSpeed) /
    Math.max(ELECTRON_CHARGE * p.fieldStrength, 1e-30);

  const energyDensity = (solenoidField * solenoidField) / (2 * MU0 * Math.max(p.coreMu, 1));

  return {
    wireField,
    solenoidField,
    turnsPerMetre: n,
    magneticMoment,
    inductance,
    peakEmf,
    rmsEmf,
    peakCurrent,
    power,
    fluxMax,
    angularFreq: omega,
    lorentzForce,
    gyroRadius,
    energyDensity,
  };
}

/** B(r) for a straight wire — inverse distance law. */
export function wireFieldCurve(p: EMParams, points = 60, maxR = 0.5) {
  const out: { r: number; 'B (µT)': number }[] = [];
  for (let i = 1; i <= points; i++) {
    const r = (i / points) * maxR;
    out.push({
      r: Number(r.toFixed(3)),
      'B (µT)': Number(((MU0 * Math.abs(p.current)) / (2 * Math.PI * r) * 1e6).toFixed(2)),
    });
  }
  return out;
}

/** B inside a solenoid as turns vary. */
export function solenoidCurve(p: EMParams, points = 40, maxTurns = 2000) {
  const out: { turns: number; 'B (mT)': number }[] = [];
  for (let i = 1; i <= points; i++) {
    const N = Math.round((i / points) * maxTurns);
    const n = N / Math.max(p.coilLength, 1e-3);
    out.push({
      turns: N,
      'B (mT)': Number((MU0 * p.coreMu * n * Math.abs(p.current) * 1e3).toFixed(3)),
    });
  }
  return out;
}

/** Sinusoidal induced EMF and current over one period. */
export function emfCurve(p: EMParams, points = 180) {
  const s = computeEM(p);
  const period = 1 / Math.max(p.rotationSpeed, 0.01);
  const out: { t: number; 'الجهد الحثي (V)': number; 'التدفق (mWb)': number }[] = [];
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * period * 2;
    out.push({
      t: Number(t.toFixed(4)),
      'الجهد الحثي (V)': Number((s.peakEmf * Math.sin(s.angularFreq * t)).toFixed(3)),
      'التدفق (mWb)': Number((s.fluxMax * Math.cos(s.angularFreq * t) * 1e3).toFixed(3)),
    });
  }
  return out;
}
