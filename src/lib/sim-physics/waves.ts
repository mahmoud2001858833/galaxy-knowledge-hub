/** Isolated wave & sound engine (travelling waves, Doppler effect, interference/beats). */

export type WaveMode = 'wave' | 'doppler' | 'interference';

export const SOUND_SPEED_AIR = 343; // m/s at 20°C

export interface WaveParams {
  mode: WaveMode;
  /** Travelling wave */
  amplitude: number; // m (visual)
  frequency: number; // Hz
  waveSpeed: number; // m/s
  damping: number; // 0..1 attenuation per metre
  /** Doppler */
  sourceSpeed: number; // m/s (positive = approaching observer)
  observerSpeed: number; // m/s (positive = moving toward source)
  sourceFrequency: number; // Hz
  mediumSpeed: number; // m/s
  /** Interference */
  freqA: number; // Hz
  freqB: number; // Hz
  phaseDeg: number; // degrees between the two sources
  sourceGap: number; // m between the two sources
}

export interface WaveStats {
  wavelength: number; // m
  period: number; // s
  angularFreq: number; // rad/s
  waveNumber: number; // rad/m
  maxSpeed: number; // m/s (particle)
  intensityDb: number; // dB (relative)
  // doppler
  approachFreq: number; // Hz
  recedeFreq: number; // Hz
  machNumber: number;
  sonicBoom: boolean;
  shiftPercent: number;
  // interference
  beatFrequency: number; // Hz
  combinedAmplitude: number;
  constructive: boolean;
  pathDifference: number; // m
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function computeWaves(p: WaveParams): WaveStats {
  const wavelength = p.waveSpeed / Math.max(p.frequency, 0.001);
  const period = 1 / Math.max(p.frequency, 0.001);
  const omega = 2 * Math.PI * p.frequency;
  const k = (2 * Math.PI) / Math.max(wavelength, 1e-6);
  const maxSpeed = omega * p.amplitude;
  const intensityDb = 20 * Math.log10(Math.max(p.amplitude, 1e-4) / 1e-4);

  const c = Math.max(p.mediumSpeed, 1);
  const approachFreq =
    (p.sourceFrequency * (c + p.observerSpeed)) / Math.max(c - p.sourceSpeed, 1e-3);
  const recedeFreq =
    (p.sourceFrequency * (c - p.observerSpeed)) / Math.max(c + p.sourceSpeed, 1e-3);
  const machNumber = p.sourceSpeed / c;
  const sonicBoom = machNumber >= 1;
  const shiftPercent = ((approachFreq - p.sourceFrequency) / p.sourceFrequency) * 100;

  const beatFrequency = Math.abs(p.freqA - p.freqB);
  const phase = (p.phaseDeg * Math.PI) / 180;
  const combinedAmplitude = 2 * p.amplitude * Math.abs(Math.cos(phase / 2));
  const constructive = combinedAmplitude > p.amplitude * 1.4;
  const pathDifference = (phase / (2 * Math.PI)) * wavelength;

  return {
    wavelength,
    period,
    angularFreq: omega,
    waveNumber: k,
    maxSpeed,
    intensityDb,
    approachFreq,
    recedeFreq,
    machNumber,
    sonicBoom,
    shiftPercent,
    beatFrequency,
    combinedAmplitude,
    constructive,
    pathDifference,
  };
}

/** y(x) snapshot of a damped travelling wave. */
export function waveProfile(p: WaveParams, t = 0, points = 160, length = 20) {
  const { waveNumber: k, angularFreq: omega } = computeWaves(p);
  const out: { x: number; 'الإزاحة (م)': number; 'الغلاف': number }[] = [];
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * length;
    const env = p.amplitude * Math.exp(-clamp(p.damping, 0, 1) * x);
    out.push({
      x: Number(x.toFixed(2)),
      'الإزاحة (م)': Number((env * Math.sin(k * x - omega * t)).toFixed(4)),
      'الغلاف': Number(env.toFixed(4)),
    });
  }
  return out;
}

/** Superposition of the two interference sources over time (shows beats). */
export function beatProfile(p: WaveParams, points = 220, duration = 1) {
  const out: { t: number; 'المحصلة': number; 'الغلاف': number }[] = [];
  const phase = (p.phaseDeg * Math.PI) / 180;
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * duration;
    const a = p.amplitude * Math.sin(2 * Math.PI * p.freqA * t);
    const b = p.amplitude * Math.sin(2 * Math.PI * p.freqB * t + phase);
    const env = 2 * p.amplitude * Math.abs(Math.cos(Math.PI * (p.freqA - p.freqB) * t));
    out.push({
      t: Number(t.toFixed(3)),
      'المحصلة': Number((a + b).toFixed(4)),
      'الغلاف': Number(env.toFixed(4)),
    });
  }
  return out;
}

/** Observed frequency as a function of source speed (Doppler curve). */
export function dopplerCurve(p: WaveParams, points = 60) {
  const c = Math.max(p.mediumSpeed, 1);
  const out: { v: number; 'مقترب (Hz)': number; 'مبتعد (Hz)': number }[] = [];
  for (let i = 0; i <= points; i++) {
    const v = (i / points) * (c * 0.9);
    out.push({
      v: Math.round(v),
      'مقترب (Hz)': Number(((p.sourceFrequency * c) / Math.max(c - v, 1e-3)).toFixed(1)),
      'مبتعد (Hz)': Number(((p.sourceFrequency * c) / (c + v)).toFixed(1)),
    });
  }
  return out;
}
