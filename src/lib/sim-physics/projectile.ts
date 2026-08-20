/**
 * Pure projectile-motion physics — isolated from rendering so it can be tested
 * and reused by both the 3D scene and the analytics charts.
 */

export interface ProjectileParams {
  /** Initial speed in m/s */
  speed: number;
  /** Launch angle in degrees (vertical plane) */
  angle: number;
  /** Azimuth in degrees around the vertical axis (0 = along +X) */
  azimuth?: number;
  /** Launch height in metres */
  height: number;
  /** Gravitational acceleration in m/s^2 */
  gravity: number;
  /** Linear drag coefficient k in a = -k*v (1/s). 0 = vacuum */
  drag: number;
  /** Projectile mass in kg (used for energy readings) */
  mass: number;
}

export interface ProjectileSample {
  t: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  speed: number;
  ke: number;
  pe: number;
  total: number;
}

export const GRAVITY_PRESETS: Record<string, { label: string; g: number }> = {
  earth: { label: 'الأرض', g: 9.81 },
  moon: { label: 'القمر', g: 1.62 },
  mars: { label: 'المريخ', g: 3.72 },
  jupiter: { label: 'المشتري', g: 24.79 },
  space: { label: 'الفضاء', g: 0 },
};

const DEG = Math.PI / 180;

function sample(
  t: number,
  x: number,
  y: number,
  z: number,
  vx: number,
  vy: number,
  vz: number,
  p: ProjectileParams
): ProjectileSample {
  const speed = Math.hypot(vx, vy, vz);
  const ke = 0.5 * p.mass * speed * speed;
  const pe = p.mass * p.gravity * Math.max(y, 0);
  return { t, x, y, z, vx, vy, vz, speed, ke, pe, total: ke + pe };
}

/**
 * Integrates the trajectory with RK-free semi-implicit Euler at a small step.
 * Handles linear air drag; with drag = 0 it reproduces the analytic parabola.
 */
export function simulateTrajectory(p: ProjectileParams, dt = 0.005, maxTime = 120): ProjectileSample[] {
  const az = (p.azimuth ?? 0) * DEG;
  const el = p.angle * DEG;
  let vx = p.speed * Math.cos(el) * Math.cos(az);
  let vz = p.speed * Math.cos(el) * Math.sin(az);
  let vy = p.speed * Math.sin(el);
  let x = 0;
  let y = p.height;
  let z = 0;
  let t = 0;

  const out: ProjectileSample[] = [sample(t, x, y, z, vx, vy, vz, p)];

  while (t < maxTime) {
    const ax = -p.drag * vx;
    const ay = -p.gravity - p.drag * vy;
    const az2 = -p.drag * vz;

    vx += ax * dt;
    vy += ay * dt;
    vz += az2 * dt;

    const prevY = y;
    x += vx * dt;
    y += vy * dt;
    z += vz * dt;
    t += dt;

    if (y <= 0 && prevY > 0) {
      // linear interpolation onto the ground plane
      const f = prevY / (prevY - y);
      const xi = x - vx * dt * (1 - f);
      const zi = z - vz * dt * (1 - f);
      out.push(sample(t, xi, 0, zi, vx, vy, vz, p));
      break;
    }

    if (out.length === 0 || t - out[out.length - 1].t >= 0.02) {
      out.push(sample(t, x, y, z, vx, vy, vz, p));
    }

    if (p.gravity === 0 && x > 400) break;
  }

  return out;
}

export interface ProjectileStats {
  range: number;
  maxHeight: number;
  flightTime: number;
  impactSpeed: number;
  impactAngle: number;
  initialEnergy: number;
}

export function computeStats(samples: ProjectileSample[]): ProjectileStats {
  if (!samples.length) {
    return { range: 0, maxHeight: 0, flightTime: 0, impactSpeed: 0, impactAngle: 0, initialEnergy: 0 };
  }
  const last = samples[samples.length - 1];
  const maxHeight = samples.reduce((m, s) => Math.max(m, s.y), 0);
  const horizontal = Math.hypot(last.x, last.z);
  const impactAngle = Math.abs(Math.atan2(last.vy, Math.hypot(last.vx, last.vz)) / DEG);
  return {
    range: horizontal,
    maxHeight,
    flightTime: last.t,
    impactSpeed: last.speed,
    impactAngle,
    initialEnergy: samples[0].total,
  };
}

/** Analytic (vacuum) range — used to show students the ideal vs. real difference. */
export function analyticRange(speed: number, angleDeg: number, height: number, g: number): number {
  if (g <= 0) return Infinity;
  const a = angleDeg * DEG;
  const vy = speed * Math.sin(a);
  const vx = speed * Math.cos(a);
  const t = (vy + Math.sqrt(vy * vy + 2 * g * height)) / g;
  return vx * t;
}

/** Sample the trajectory at (approximately) a given time. */
export function sampleAt(samples: ProjectileSample[], t: number): ProjectileSample {
  if (!samples.length) return sample(0, 0, 0, 0, 0, 0, 0, { mass: 1, gravity: 9.81 } as ProjectileParams);
  if (t <= 0) return samples[0];
  const last = samples[samples.length - 1];
  if (t >= last.t) return last;
  let lo = 0;
  let hi = samples.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].t <= t) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const f = (t - a.t) / Math.max(b.t - a.t, 1e-6);
  const lerp = (u: number, v: number) => u + (v - u) * f;
  return {
    t,
    x: lerp(a.x, b.x),
    y: lerp(a.y, b.y),
    z: lerp(a.z, b.z),
    vx: lerp(a.vx, b.vx),
    vy: lerp(a.vy, b.vy),
    vz: lerp(a.vz, b.vz),
    speed: lerp(a.speed, b.speed),
    ke: lerp(a.ke, b.ke),
    pe: lerp(a.pe, b.pe),
    total: lerp(a.total, b.total),
  };
}
