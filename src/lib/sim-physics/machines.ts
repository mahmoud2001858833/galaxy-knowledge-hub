/** Isolated simple-machines engine (levers, pulleys, gear trains) shared by the 3D scene, HUD and charts. */

export type MachineMode = 'lever' | 'pulley' | 'gears';

export const G0 = 9.80665; // m/s²

export interface MachineParams {
  mode: MachineMode;
  /** Lever: load mass (kg) */
  loadMass: number;
  /** Lever: distance from fulcrum to load (m) */
  loadArm: number;
  /** Lever: distance from fulcrum to effort (m) */
  effortArm: number;
  /** Lever class 1 | 2 | 3 */
  leverClass: 1 | 2 | 3;
  /** Pulley: number of movable pulleys */
  movablePulleys: number;
  /** Pulley: lifted height (m) */
  liftHeight: number;
  /** Machine efficiency (0..1) — friction losses */
  efficiency: number;
  /** Gears: teeth on driver gear */
  driverTeeth: number;
  /** Gears: teeth on driven gear */
  drivenTeeth: number;
  /** Gears: optional idler teeth (0 = none) */
  idlerTeeth: number;
  /** Gears: input speed (rpm) */
  inputRpm: number;
  /** Gears: input torque (N·m) */
  inputTorque: number;
}

export interface MachineStats {
  loadForce: number; // N
  // lever
  idealMA: number;
  actualMA: number;
  effortForce: number; // N
  effortDistance: number; // m
  loadDistance: number; // m
  torqueLoad: number; // N·m
  torqueEffort: number; // N·m
  balanced: boolean;
  // pulley
  supportingRopes: number;
  ropePull: number; // m
  // gears
  gearRatio: number;
  outputRpm: number;
  outputTorque: number; // N·m
  sameDirection: boolean;
  // energy
  workIn: number; // J
  workOut: number; // J
  lostEnergy: number; // J
  power: number; // W
}

const clampEff = (e: number) => Math.min(1, Math.max(0.2, e));

export function computeMachine(p: MachineParams): MachineStats {
  const eff = clampEff(p.efficiency);
  const loadForce = p.loadMass * G0;

  // ---- lever -------------------------------------------------------------
  // class 2 => load between fulcrum and effort (effort arm is total length)
  // class 3 => effort between fulcrum and load (effort arm < load arm)
  let loadArm = p.loadArm;
  let effortArm = p.effortArm;
  if (p.leverClass === 2) effortArm = Math.max(p.effortArm, p.loadArm + 0.05);
  if (p.leverClass === 3) effortArm = Math.min(p.effortArm, p.loadArm - 0.05 > 0.05 ? p.loadArm - 0.05 : 0.05);

  const leverIMA = effortArm / Math.max(0.01, loadArm);
  const leverEffort = loadForce / (leverIMA * eff);
  const leverLoadDist = 0.25 * loadArm; // small rotation ~0.25 rad
  const leverEffortDist = 0.25 * effortArm;

  // ---- pulley ------------------------------------------------------------
  const ropes = Math.max(1, Math.round(p.movablePulleys) * 2 || 1);
  const pulleyIMA = ropes;
  const pulleyEffort = loadForce / (pulleyIMA * eff);
  const ropePull = ropes * p.liftHeight;

  // ---- gears -------------------------------------------------------------
  const ratio = p.drivenTeeth / Math.max(1, p.driverTeeth);
  const outputRpm = p.inputRpm / ratio;
  const outputTorque = p.inputTorque * ratio * eff;
  // idler reverses direction one extra time
  const meshCount = p.idlerTeeth > 0 ? 2 : 1;
  const sameDirection = meshCount % 2 === 0;

  let idealMA = leverIMA;
  let effortForce = leverEffort;
  let effortDistance = leverEffortDist;
  let loadDistance = leverLoadDist;

  if (p.mode === 'pulley') {
    idealMA = pulleyIMA;
    effortForce = pulleyEffort;
    effortDistance = ropePull;
    loadDistance = p.liftHeight;
  } else if (p.mode === 'gears') {
    idealMA = ratio;
    effortForce = p.inputTorque;
    effortDistance = 2 * Math.PI;
    loadDistance = (2 * Math.PI) / ratio;
  }

  const workIn =
    p.mode === 'gears' ? p.inputTorque * 2 * Math.PI : effortForce * effortDistance;
  const workOut =
    p.mode === 'gears' ? outputTorque * loadDistance : loadForce * loadDistance;

  const power =
    p.mode === 'gears' ? (p.inputTorque * p.inputRpm * 2 * Math.PI) / 60 : workIn / 2;

  return {
    loadForce,
    idealMA,
    actualMA: idealMA * eff,
    effortForce,
    effortDistance,
    loadDistance,
    torqueLoad: loadForce * loadArm,
    torqueEffort: leverEffort * effortArm,
    balanced: Math.abs(loadForce * loadArm - leverEffort * effortArm) < loadForce * loadArm * 0.02,
    supportingRopes: ropes,
    ropePull,
    gearRatio: ratio,
    outputRpm,
    outputTorque,
    sameDirection,
    workIn,
    workOut,
    lostEnergy: Math.max(0, workIn - workOut),
    power,
  };
}

/** Effort force vs effort-arm length (lever curve). */
export function leverCurve(p: MachineParams) {
  const eff = clampEff(p.efficiency);
  const load = p.loadMass * G0;
  const out: { arm: number; 'قوة الجهد (N)': number; 'الفائدة الآلية': number }[] = [];
  for (let a = 0.2; a <= 3.01; a += 0.1) {
    const ma = a / Math.max(0.01, p.loadArm);
    out.push({
      arm: Number(a.toFixed(2)),
      'قوة الجهد (N)': Number((load / (ma * eff)).toFixed(1)),
      'الفائدة الآلية': Number((ma * eff).toFixed(2)),
    });
  }
  return out;
}

/** Effort force & rope pull vs number of movable pulleys. */
export function pulleyCurve(p: MachineParams) {
  const eff = clampEff(p.efficiency);
  const load = p.loadMass * G0;
  const out: { n: number; 'قوة الشد (N)': number; 'طول الحبل (م)': number }[] = [];
  for (let n = 1; n <= 6; n++) {
    const ropes = n * 2;
    out.push({
      n,
      'قوة الشد (N)': Number((load / (ropes * eff)).toFixed(1)),
      'طول الحبل (م)': Number((ropes * p.liftHeight).toFixed(2)),
    });
  }
  return out;
}

/** Output speed & torque vs gear ratio. */
export function gearCurve(p: MachineParams) {
  const eff = clampEff(p.efficiency);
  const out: { teeth: number; 'السرعة (rpm)': number; 'العزم (N·m)': number }[] = [];
  for (let t = 8; t <= 80; t += 4) {
    const ratio = t / Math.max(1, p.driverTeeth);
    out.push({
      teeth: t,
      'السرعة (rpm)': Number((p.inputRpm / ratio).toFixed(1)),
      'العزم (N·m)': Number((p.inputTorque * ratio * eff).toFixed(1)),
    });
  }
  return out;
}
