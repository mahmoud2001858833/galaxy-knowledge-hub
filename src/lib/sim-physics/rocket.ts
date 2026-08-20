/** Isolated rocket & orbital mechanics engine shared by the 3D scene, HUD and charts. */

export type RocketMode = 'launch' | 'orbit' | 'landing';

export const G = 6.6743e-11; // m³/(kg·s²)
export const M_EARTH = 5.972e24; // kg
export const R_EARTH = 6.371e6; // m
export const MU = G * M_EARTH; // standard gravitational parameter
export const G0 = 9.80665; // m/s²

export interface RocketParams {
  mode: RocketMode;
  /** Wet mass (kg) */
  wetMass: number;
  /** Dry mass (kg) */
  dryMass: number;
  /** Specific impulse (s) */
  isp: number;
  /** Burn time (s) */
  burnTime: number;
  /** Thrust (kN) */
  thrust: number;
  /** Drag coefficient */
  dragCoeff: number;
  /** Cross-section area (m²) */
  area: number;
  /** Launch angle from vertical (deg) */
  pitch: number;
  /** Orbit altitude (km) */
  altitude: number;
  /** Orbit eccentricity 0..0.8 */
  eccentricity: number;
  /** Landing start altitude (m) */
  landAltitude: number;
  /** Landing start descent speed (m/s) */
  landSpeed: number;
  /** Landing throttle 0..1 */
  throttle: number;
}

export interface RocketStats {
  // launch
  massFlow: number; // kg/s
  propellant: number; // kg
  deltaV: number; // m/s
  twr: number; // thrust to weight ratio
  massRatio: number;
  apogee: number; // m
  maxSpeed: number; // m/s
  maxQ: number; // Pa
  maxQAlt: number; // m
  burnoutAlt: number; // m
  reachesOrbit: boolean;
  // orbit
  orbitRadius: number; // m
  orbitSpeed: number; // m/s
  period: number; // s
  escapeSpeed: number; // m/s
  apoapsis: number; // m
  periapsis: number; // m
  specificEnergy: number; // J/kg
  // landing
  suicideBurnAlt: number; // m
  landingDecel: number; // m/s²
  touchdownSpeed: number; // m/s
  landingFuel: number; // kg
  safeLanding: boolean;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** US standard-ish exponential atmosphere. */
export function airDensity(altitude: number) {
  if (altitude > 120000) return 0;
  return 1.225 * Math.exp(-Math.max(altitude, 0) / 8500);
}

export interface FlightSample {
  t: number;
  altitude: number; // m
  downrange: number; // m
  speed: number; // m/s
  mass: number; // kg
  q: number; // Pa
  accel: number; // m/s²
}

/** Integrate a 2D powered ascent with drag and gravity losses. */
export function simulateAscent(p: RocketParams): FlightSample[] {
  const dt = 0.25;
  const propellant = Math.max(p.wetMass - p.dryMass, 1);
  const massFlow = propellant / Math.max(p.burnTime, 1);
  const thrustN = p.thrust * 1000;
  const pitch = (p.pitch * Math.PI) / 180;

  let t = 0;
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let mass = p.wetMass;
  const out: FlightSample[] = [];

  for (let i = 0; i < 4000; i++) {
    const burning = t < p.burnTime && mass > p.dryMass;
    const speed = Math.hypot(vx, vy);
    const rho = airDensity(y);
    const q = 0.5 * rho * speed * speed;
    const drag = q * p.dragCoeff * p.area;

    // thrust direction: vertical at start, tilting to `pitch` after 10 s
    const tilt = burning ? pitch * clamp((t - 8) / 25, 0, 1) : 0;
    let dirX = Math.sin(tilt);
    let dirY = Math.cos(tilt);
    if (!burning && speed > 1) {
      dirX = vx / speed;
      dirY = vy / speed;
    }

    const gLocal = MU / (R_EARTH + Math.max(y, 0)) ** 2;
    const T = burning ? thrustN : 0;
    const dragX = speed > 0.01 ? (-drag * vx) / speed : 0;
    const dragY = speed > 0.01 ? (-drag * vy) / speed : 0;

    const ax = (T * dirX + dragX) / mass;
    const ay = (T * dirY + dragY) / mass - gLocal;

    out.push({
      t: +t.toFixed(2),
      altitude: y,
      downrange: x,
      speed,
      mass,
      q,
      accel: Math.hypot(ax, ay),
    });

    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    if (burning) mass = Math.max(p.dryMass, mass - massFlow * dt);
    t += dt;

    if (y < 0 && t > 2) break;
    if (y > 400000) break;
  }
  return out;
}

export function computeRocket(p: RocketParams, flight: FlightSample[]): RocketStats {
  const propellant = Math.max(p.wetMass - p.dryMass, 1);
  const massFlow = propellant / Math.max(p.burnTime, 1);
  const massRatio = p.wetMass / Math.max(p.dryMass, 1);
  const deltaV = p.isp * G0 * Math.log(massRatio);
  const twr = (p.thrust * 1000) / (p.wetMass * G0);

  let apogee = 0;
  let maxSpeed = 0;
  let maxQ = 0;
  let maxQAlt = 0;
  let burnoutAlt = 0;
  for (const s of flight) {
    if (s.altitude > apogee) apogee = s.altitude;
    if (s.speed > maxSpeed) maxSpeed = s.speed;
    if (s.q > maxQ) {
      maxQ = s.q;
      maxQAlt = s.altitude;
    }
    if (s.t <= p.burnTime) burnoutAlt = s.altitude;
  }

  const orbitRadius = R_EARTH + p.altitude * 1000;
  const orbitSpeed = Math.sqrt(MU / orbitRadius);
  const period = 2 * Math.PI * Math.sqrt(orbitRadius ** 3 / MU);
  const escapeSpeed = Math.sqrt((2 * MU) / orbitRadius);
  const e = clamp(p.eccentricity, 0, 0.85);
  const a = orbitRadius / (1 - e); // treat the given radius as periapsis
  const apoapsis = a * (1 + e);
  const periapsis = orbitRadius;
  const specificEnergy = -MU / (2 * a);

  const decel = Math.max((p.thrust * 1000 * p.throttle) / Math.max(p.dryMass, 1) - G0, 0.1);
  const suicideBurnAlt = (p.landSpeed * p.landSpeed) / (2 * decel);
  const remaining = p.landAltitude - suicideBurnAlt;
  const impactSpeedSq =
    remaining >= 0
      ? p.landSpeed * p.landSpeed + 2 * G0 * remaining - 2 * decel * suicideBurnAlt
      : p.landSpeed * p.landSpeed - 2 * decel * p.landAltitude;
  const touchdownSpeed = Math.sqrt(Math.max(impactSpeedSq, 0));
  const burnDuration = p.landSpeed / decel;
  const landingFuel = (massFlow * p.throttle * burnDuration);

  return {
    massFlow,
    propellant,
    deltaV,
    twr,
    massRatio,
    apogee,
    maxSpeed,
    maxQ,
    maxQAlt,
    burnoutAlt,
    reachesOrbit: deltaV > 9400 && twr > 1.2,
    orbitRadius,
    orbitSpeed,
    period,
    escapeSpeed,
    apoapsis,
    periapsis,
    specificEnergy,
    suicideBurnAlt,
    landingDecel: decel,
    touchdownSpeed,
    landingFuel,
    safeLanding: touchdownSpeed < 6 && suicideBurnAlt < p.landAltitude,
  };
}

/** Trajectory chart data (km). */
export function trajectoryCurve(flight: FlightSample[]) {
  const step = Math.max(1, Math.floor(flight.length / 120));
  const out: { downrange: number; 'الارتفاع (km)': number; 'السرعة (m/s)': number }[] = [];
  for (let i = 0; i < flight.length; i += step) {
    const s = flight[i];
    out.push({
      downrange: +(s.downrange / 1000).toFixed(1),
      'الارتفاع (km)': +(s.altitude / 1000).toFixed(2),
      'السرعة (m/s)': +s.speed.toFixed(0),
    });
  }
  return out;
}

/** Dynamic pressure and acceleration versus time. */
export function loadsCurve(flight: FlightSample[]) {
  const step = Math.max(1, Math.floor(flight.length / 120));
  const out: { t: number; 'الضغط الديناميكي (kPa)': number; 'التسارع (g)': number }[] = [];
  for (let i = 0; i < flight.length; i += step) {
    const s = flight[i];
    out.push({
      t: s.t,
      'الضغط الديناميكي (kPa)': +(s.q / 1000).toFixed(2),
      'التسارع (g)': +(s.accel / G0).toFixed(2),
    });
  }
  return out;
}

/** Orbital speed and period versus altitude. */
export function orbitSweep() {
  const out: { altitude: number; 'السرعة (km/s)': number; 'الزمن الدوري (دقيقة)': number }[] = [];
  for (let h = 100; h <= 36000; h += h < 2000 ? 100 : 1000) {
    const r = R_EARTH + h * 1000;
    out.push({
      altitude: h,
      'السرعة (km/s)': +(Math.sqrt(MU / r) / 1000).toFixed(3),
      'الزمن الدوري (دقيقة)': +((2 * Math.PI * Math.sqrt(r ** 3 / MU)) / 60).toFixed(1),
    });
  }
  return out;
}

/** Landing profile: speed versus altitude with the suicide burn. */
export function landingProfile(p: RocketParams, s: RocketStats) {
  const out: { altitude: number; 'السرعة (m/s)': number }[] = [];
  for (let h = p.landAltitude; h >= 0; h -= p.landAltitude / 60) {
    let v: number;
    if (h > s.suicideBurnAlt) {
      v = Math.sqrt(Math.max(p.landSpeed ** 2 + 2 * G0 * (p.landAltitude - h), 0));
    } else {
      const vAtBurn = Math.sqrt(
        Math.max(p.landSpeed ** 2 + 2 * G0 * (p.landAltitude - s.suicideBurnAlt), 0)
      );
      v = Math.sqrt(Math.max(vAtBurn ** 2 - 2 * s.landingDecel * (s.suicideBurnAlt - h), 0));
    }
    out.push({ altitude: +h.toFixed(0), 'السرعة (m/s)': +v.toFixed(1) });
  }
  return out;
}
