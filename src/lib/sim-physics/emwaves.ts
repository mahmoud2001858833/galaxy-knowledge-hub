/**
 * فيزياء الموجات الكهرومغناطيسية — محرك حسابي دقيق
 * Electromagnetic waves physics engine (SI units).
 */

export const C_LIGHT = 299792458; // m/s
export const PLANCK = 6.62607015e-34; // J·s
export const EV = 1.602176634e-19; // J
export const EPS0 = 8.8541878128e-12;
export const MU0 = 1.25663706212e-6;

export type EMWaveMode = 'propagation' | 'spectrum' | 'interaction';

export type EMBand =
  | 'radio'
  | 'microwave'
  | 'infrared'
  | 'visible'
  | 'ultraviolet'
  | 'xray'
  | 'gamma';

export interface EMWaveParams {
  mode: EMWaveMode;
  /** frequency in Hz */
  frequency: number;
  /** relative field amplitude (0.2 - 2) */
  amplitude: number;
  /** refractive index of the medium the wave enters */
  refractiveIndex: number;
  /** polarizer angle in degrees relative to the E field */
  polarizerDeg: number;
  /** target material work function in eV (photoelectric effect) */
  workFunctionEv: number;
}

export interface EMWaveStats {
  band: EMBand;
  bandLabel: string;
  wavelength: number; // m (vacuum)
  wavelengthNm: number;
  wavelengthInMedium: number; // m
  speedInMedium: number; // m/s
  angularFreq: number; // rad/s
  waveNumber: number; // rad/m
  period: number; // s
  photonEnergyJ: number;
  photonEnergyEv: number;
  photonMomentum: number; // kg·m/s
  eField: number; // V/m (scaled)
  bField: number; // T
  intensity: number; // W/m²
  poynting: number; // W/m²
  radiationPressure: number; // Pa
  transmittedIntensity: number; // after polarizer (Malus)
  ionizing: boolean;
  photoelectric: boolean;
  ejectedElectronEv: number;
  visibleColor: string;
}

const BANDS: { id: EMBand; label: string; min: number; max: number }[] = [
  { id: 'radio', label: 'موجات الراديو', min: 0, max: 3e9 },
  { id: 'microwave', label: 'الموجات الميكروية', min: 3e9, max: 3e11 },
  { id: 'infrared', label: 'الأشعة تحت الحمراء', min: 3e11, max: 4.3e14 },
  { id: 'visible', label: 'الضوء المرئي', min: 4.3e14, max: 7.7e14 },
  { id: 'ultraviolet', label: 'فوق البنفسجية', min: 7.7e14, max: 3e16 },
  { id: 'xray', label: 'الأشعة السينية', min: 3e16, max: 3e19 },
  { id: 'gamma', label: 'أشعة غاما', min: 3e19, max: Infinity },
];

export const bandOf = (frequency: number) =>
  BANDS.find((b) => frequency >= b.min && frequency < b.max) ?? BANDS[BANDS.length - 1];

export const bandList = BANDS;

/** Approximate sRGB colour for a visible wavelength (nm). */
export const wavelengthToColor = (nm: number): string => {
  if (nm < 380 || nm > 780) return '#94a3b8';
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else {
    r = 1;
  }
  let factor = 1;
  if (nm < 420) factor = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm > 700) factor = 0.3 + (0.7 * (780 - nm)) / 80;
  const to = (v: number) => Math.round(255 * Math.pow(Math.max(v, 0) * factor, 0.8));
  return `#${[to(r), to(g), to(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};

export const computeEMWave = (p: EMWaveParams): EMWaveStats => {
  const f = Math.max(p.frequency, 1);
  const n = Math.max(p.refractiveIndex, 1);
  const band = bandOf(f);

  const wavelength = C_LIGHT / f;
  const speedInMedium = C_LIGHT / n;
  const wavelengthInMedium = speedInMedium / f;
  const angularFreq = 2 * Math.PI * f;
  const waveNumber = angularFreq / speedInMedium;
  const period = 1 / f;

  const photonEnergyJ = PLANCK * f;
  const photonEnergyEv = photonEnergyJ / EV;
  const photonMomentum = photonEnergyJ / C_LIGHT;

  // Field amplitudes: use a reference of 100 V/m at amplitude = 1
  const eField = 100 * p.amplitude;
  const bField = eField / C_LIGHT;
  const intensity = 0.5 * EPS0 * C_LIGHT * eField * eField;
  const poynting = (eField * bField) / MU0 / 2;
  const radiationPressure = intensity / C_LIGHT;

  const theta = (p.polarizerDeg * Math.PI) / 180;
  const transmittedIntensity = intensity * Math.cos(theta) ** 2; // Malus

  const ionizing = photonEnergyEv >= 10;
  const photoelectric = photonEnergyEv > p.workFunctionEv;
  const ejectedElectronEv = Math.max(photonEnergyEv - p.workFunctionEv, 0);

  return {
    band: band.id,
    bandLabel: band.label,
    wavelength,
    wavelengthNm: wavelength * 1e9,
    wavelengthInMedium,
    speedInMedium,
    angularFreq,
    waveNumber,
    period,
    photonEnergyJ,
    photonEnergyEv,
    photonMomentum,
    eField,
    bField,
    intensity,
    poynting,
    radiationPressure,
    transmittedIntensity,
    ionizing,
    photoelectric,
    ejectedElectronEv,
    visibleColor: wavelengthToColor(wavelength * 1e9),
  };
};

/** Malus law curve: transmitted fraction vs polarizer angle. */
export const malusCurve = (points = 91) =>
  Array.from({ length: points }, (_, i) => {
    const deg = (i / (points - 1)) * 180;
    return {
      deg: Math.round(deg),
      'شدة نافذة I/I₀': Number(Math.cos((deg * Math.PI) / 180) ** 2).toFixed(4),
    };
  }).map((d) => ({ deg: d.deg, 'شدة نافذة I/I₀': Number(d['شدة نافذة I/I₀']) }));

/** Photon energy (eV) across the spectrum in log10(f) space. */
export const photonEnergyCurve = (points = 80) =>
  Array.from({ length: points }, (_, i) => {
    const logF = 5 + (i / (points - 1)) * 17; // 10^5 .. 10^22 Hz
    const f = Math.pow(10, logF);
    return {
      'log₁₀(f)': Number(logF.toFixed(2)),
      'طاقة الفوتون (eV)': Number(((PLANCK * f) / EV).toExponential(3)),
      'الطول الموجي (م)': Number((C_LIGHT / f).toExponential(3)),
    };
  });
