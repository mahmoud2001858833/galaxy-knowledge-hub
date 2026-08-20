/** Isolated geometric-optics engine: thin lenses, spherical mirrors, refraction and prism dispersion. */

export type OpticsMode = 'lens' | 'mirror' | 'refraction';

export interface OpticsParams {
  mode: OpticsMode;
  /** Lens/mirror focal length (cm) — negative = diverging lens / convex mirror */
  focalLength: number;
  /** Object distance from the optic (cm) */
  objectDistance: number;
  /** Object height (cm) */
  objectHeight: number;
  /** Refraction: incidence angle (deg) */
  incidenceAngle: number;
  /** Refractive index of the first medium */
  n1: number;
  /** Refractive index of the second medium */
  n2: number;
  /** Prism apex angle (deg) */
  prismAngle: number;
  /** Number of rays traced from the object */
  rayCount: number;
}

export interface OpticsStats {
  imageDistance: number; // cm (positive = real for lens/mirror convention used)
  magnification: number;
  imageHeight: number; // cm
  real: boolean;
  inverted: boolean;
  power: number; // dioptres
  refractionAngle: number; // deg (NaN when total internal reflection)
  criticalAngle: number; // deg (NaN if n1 <= n2)
  totalInternalReflection: boolean;
  deviation: number; // deg — prism minimum deviation
  dispersion: number; // deg between red and violet
  reflectance: number; // 0..1 (unpolarised Fresnel)
}

const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

export function computeOptics(p: OpticsParams): OpticsStats {
  const f = p.focalLength;
  const dO = Math.max(p.objectDistance, 0.1);

  // 1/f = 1/do + 1/di  (same form for thin lens and mirror with sign conventions)
  const inv = 1 / f - 1 / dO;
  const imageDistance = Math.abs(inv) < 1e-6 ? Infinity : 1 / inv;
  const magnification = Number.isFinite(imageDistance) ? -imageDistance / dO : -Infinity;
  const imageHeight = magnification * p.objectHeight;
  const real = Number.isFinite(imageDistance) && imageDistance > 0;
  const inverted = magnification < 0;
  const power = 100 / f; // dioptres for f in cm

  // Snell's law
  const theta1 = rad(p.incidenceAngle);
  const sinT2 = (p.n1 * Math.sin(theta1)) / Math.max(p.n2, 1e-6);
  const tir = sinT2 > 1;
  const refractionAngle = tir ? NaN : deg(Math.asin(sinT2));
  const criticalAngle = p.n1 > p.n2 ? deg(Math.asin(Math.min(p.n2 / p.n1, 1))) : NaN;

  // Prism minimum deviation: D = 2·asin(n·sin(A/2)) − A
  const A = rad(p.prismAngle);
  const nRel = p.n2 / Math.max(p.n1, 1e-6);
  const arg = Math.min(nRel * Math.sin(A / 2), 1);
  const deviation = deg(2 * Math.asin(arg) - A);
  const argV = Math.min((nRel + 0.02) * Math.sin(A / 2), 1);
  const argR = Math.min((nRel - 0.02) * Math.sin(A / 2), 1);
  const dispersion = deg(2 * Math.asin(argV) - 2 * Math.asin(argR));

  // Fresnel reflectance (unpolarised)
  let reflectance = 1;
  if (!tir) {
    const t2 = Math.asin(sinT2);
    const rs =
      (p.n1 * Math.cos(theta1) - p.n2 * Math.cos(t2)) /
      (p.n1 * Math.cos(theta1) + p.n2 * Math.cos(t2));
    const rp =
      (p.n1 * Math.cos(t2) - p.n2 * Math.cos(theta1)) /
      (p.n1 * Math.cos(t2) + p.n2 * Math.cos(theta1));
    reflectance = (rs * rs + rp * rp) / 2;
  }

  return {
    imageDistance,
    magnification,
    imageHeight,
    real,
    inverted,
    power,
    refractionAngle,
    criticalAngle,
    totalInternalReflection: tir,
    deviation,
    dispersion,
    reflectance,
  };
}

/** Image distance & magnification as the object moves. */
export function imagingCurve(p: OpticsParams, points = 80, maxDist = 100) {
  const out: { d: number; 'بُعد الصورة (سم)': number; 'التكبير': number }[] = [];
  for (let i = 1; i <= points; i++) {
    const dO = (i / points) * maxDist;
    const inv = 1 / p.focalLength - 1 / dO;
    const di = Math.abs(inv) < 1e-6 ? 0 : 1 / inv;
    const clamped = Math.max(Math.min(di, 400), -400);
    out.push({
      d: Number(dO.toFixed(1)),
      'بُعد الصورة (سم)': Number(clamped.toFixed(1)),
      'التكبير': Number(Math.max(Math.min(-di / dO, 10), -10).toFixed(2)),
    });
  }
  return out;
}

/** Snell curve: refraction angle vs incidence angle. */
export function snellCurve(p: OpticsParams, points = 90) {
  const out: { i: number; 'زاوية الانكسار (°)': number; 'الانعكاسية (%)': number }[] = [];
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * 89.5;
    const s = (p.n1 * Math.sin(rad(a))) / Math.max(p.n2, 1e-6);
    const t = s > 1 ? 90 : deg(Math.asin(s));
    const st = { ...p, incidenceAngle: a };
    out.push({
      i: Number(a.toFixed(1)),
      'زاوية الانكسار (°)': Number(t.toFixed(2)),
      'الانعكاسية (%)': Number((computeOptics(st).reflectance * 100).toFixed(1)),
    });
  }
  return out;
}
