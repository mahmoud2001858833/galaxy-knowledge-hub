/** Physics for uniform circular motion, conical pendulum and circular orbits. */

export type CircularMode = 'uniform' | 'conical' | 'orbit';

export const G_EARTH = 9.81;
/** Standard gravitational parameter of Earth (GM) in m³/s². */
export const MU_EARTH = 3.986e14;
export const R_EARTH_KM = 6371;

export interface CircularParams {
  /** Radius in meters (for orbit mode: orbital radius in km). */
  radius: number;
  /** Angular speed in rad/s (ignored in orbit mode — derived from radius). */
  omega: number;
  /** Mass of the moving body in kg. */
  mass: number;
  mode: CircularMode;
  gravity?: number;
}

export interface CircularStats {
  /** Angular speed rad/s */
  omega: number;
  /** Tangential speed m/s */
  v: number;
  /** Centripetal acceleration m/s² */
  ac: number;
  /** Centripetal force N */
  fc: number;
  /** Period s */
  period: number;
  /** Frequency Hz */
  frequency: number;
  /** RPM */
  rpm: number;
  /** Kinetic energy J */
  ke: number;
  /** Conical pendulum: cone half-angle in degrees (0 otherwise) */
  coneAngle: number;
  /** Conical pendulum: string length m */
  stringLength: number;
  /** String / gravitational force magnitude N */
  tension: number;
  /** Ratio ac / g — "how many g" the body feels */
  gForce: number;
  /** Orbit mode: altitude above surface (km) */
  altitudeKm: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function computeCircular(p: CircularParams): CircularStats {
  const g = p.gravity ?? G_EARTH;
  const m = Math.max(0.01, p.mass);

  if (p.mode === 'orbit') {
    // radius is given in km from Earth's centre
    const rKm = Math.max(R_EARTH_KM + 100, p.radius);
    const r = rKm * 1000;
    const v = Math.sqrt(MU_EARTH / r);
    const omega = v / r;
    const ac = (v * v) / r;
    return {
      omega,
      v,
      ac,
      fc: m * ac,
      period: (2 * Math.PI) / omega,
      frequency: omega / (2 * Math.PI),
      rpm: (omega * 60) / (2 * Math.PI),
      ke: 0.5 * m * v * v,
      coneAngle: 0,
      stringLength: rKm,
      tension: m * ac,
      gForce: ac / G_EARTH,
      altitudeKm: rKm - R_EARTH_KM,
    };
  }

  const r = Math.max(0.05, p.radius);
  const omega = Math.max(0.01, p.omega);
  const v = omega * r;
  const ac = omega * omega * r;
  const fc = m * ac;
  const period = (2 * Math.PI) / omega;

  let coneAngle = 0;
  let stringLength = r;
  let tension = fc;

  if (p.mode === 'conical') {
    // tan θ = ω²r / g  → θ measured from the vertical
    const theta = Math.atan2(ac, g);
    coneAngle = (theta * 180) / Math.PI;
    stringLength = r / Math.max(1e-3, Math.sin(theta));
    tension = m * Math.hypot(ac, g);
  }

  return {
    omega,
    v,
    ac,
    fc,
    period,
    frequency: 1 / period,
    rpm: 60 / period,
    ke: 0.5 * m * v * v,
    coneAngle,
    stringLength,
    tension,
    gForce: ac / G_EARTH,
    altitudeKm: 0,
  };
}

/** Scale real metres/kilometres into a comfortable world radius for the 3D scene. */
export function sceneRadius(p: CircularParams): number {
  if (p.mode === 'orbit') {
    return clamp(3 + ((p.radius - R_EARTH_KM) / 36000) * 6, 3.2, 9.5);
  }
  return clamp(p.radius * 1.6, 1.5, 8);
}

/** Position on the circle at angle φ (radians) for a given mode. */
export function positionAt(phi: number, worldR: number, mode: CircularMode, coneHeight: number) {
  const x = Math.cos(phi) * worldR;
  const z = Math.sin(phi) * worldR;
  const y = mode === 'uniform' ? 0.6 : mode === 'conical' ? 0.6 : 0;
  return [x, y, z] as [number, number, number];
}

export interface CircularChartPoint {
  radius: number;
  'التسارع المركزي': number;
  'القوة المركزية': number;
  السرعة: number;
}

/** Sweep radius while keeping ω constant — shows ac ∝ r. */
export function radiusSweep(p: CircularParams): CircularChartPoint[] {
  const points: CircularChartPoint[] = [];
  const max = p.mode === 'orbit' ? 42000 : 5;
  const min = p.mode === 'orbit' ? R_EARTH_KM + 200 : 0.2;
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const r = min + ((max - min) * i) / steps;
    const s = computeCircular({ ...p, radius: r });
    points.push({
      radius: Number(r.toFixed(p.mode === 'orbit' ? 0 : 2)),
      'التسارع المركزي': Number(s.ac.toFixed(3)),
      'القوة المركزية': Number(s.fc.toFixed(3)),
      السرعة: Number(s.v.toFixed(3)),
    });
  }
  return points;
}
