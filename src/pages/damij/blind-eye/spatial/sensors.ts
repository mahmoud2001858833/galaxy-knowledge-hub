// Phone pose for the room map: which way the back camera faces (compass heading), how far it is
// tilted down, and when the user takes a step. Everything runs on the device.

/**
 * iOS only shows the motion/orientation prompts when asked from inside a tap handler, so this must be
 * called synchronously from the gesture (both requests start before the first await).
 */
export async function requestSensorPermissions(): Promise<boolean> {
  const DOE: any = (window as any).DeviceOrientationEvent;
  const DME: any = (window as any).DeviceMotionEvent;
  const asks: Promise<string>[] = [];
  try { if (DOE?.requestPermission) asks.push(DOE.requestPermission()); } catch { /* not in a gesture */ }
  try { if (DME?.requestPermission) asks.push(DME.requestPermission()); } catch { /* not in a gesture */ }
  if (!asks.length) return true; // Android / desktop: no prompt
  const res = await Promise.allSettled(asks);
  return res.every((r) => r.status === 'fulfilled' && r.value === 'granted');
}

const RAD = Math.PI / 180;

/** Compass direction of the back camera (W3C DeviceOrientation spec, works when the phone is upright). */
export function cameraHeading(alpha: number, beta: number, gamma: number): number {
  const x = beta * RAD, y = gamma * RAD, z = alpha * RAD;
  const cX = Math.cos(x), cY = Math.cos(y), cZ = Math.cos(z);
  const sX = Math.sin(x), sY = Math.sin(y), sZ = Math.sin(z);
  const vx = -cZ * sY - sZ * sX * cY;
  const vy = -sZ * sY + cZ * sX * cY;
  let h = Math.atan(vx / vy);
  if (vy < 0) h += Math.PI;
  else if (vx < 0) h += 2 * Math.PI;
  return (h / RAD + 360) % 360;
}

export const norm360 = (d: number) => ((d % 360) + 360) % 360;
/** Signed difference a - b in (-180, 180]. */
export const angleDiff = (a: number, b: number) => {
  let d = norm360(a) - norm360(b);
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
};

export type PoseListener = (heading: number) => void;

/**
 * Smoothed camera heading. Uses the compass when the browser has one; otherwise integrates the
 * gyroscope (relative heading, starts at 0) so turning still moves things around on the map.
 */
export class HeadingTracker {
  heading = 0;
  /** Degrees the camera points below the horizon (null until the phone reports it). */
  pitchDown: number | null = null;
  source: 'compass' | 'gyro' | 'none' = 'none';
  private vx = 0;
  private vy = 1;
  private gUp: [number, number, number] | null = null;
  private lastGyroT = 0;
  private listeners = new Set<PoseListener>();
  private evt: string;

  constructor() {
    this.evt = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
  }

  onChange(fn: PoseListener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  start() {
    window.addEventListener(this.evt, this.onOrientation as EventListener, true);
    window.addEventListener('devicemotion', this.onMotion);
  }

  stop() {
    window.removeEventListener(this.evt, this.onOrientation as EventListener, true);
    window.removeEventListener('devicemotion', this.onMotion);
    this.listeners.clear();
  }

  private push(h: number, k: number) {
    // low-pass on the unit circle so 359° -> 1° does not swing through 180°
    this.vx = this.vx * (1 - k) + Math.sin(h * RAD) * k;
    this.vy = this.vy * (1 - k) + Math.cos(h * RAD) * k;
    this.heading = norm360(Math.atan2(this.vx, this.vy) / RAD);
    this.listeners.forEach((fn) => fn(this.heading));
  }

  private onOrientation = (e: DeviceOrientationEvent) => {
    if (typeof e.beta === 'number') {
      // upright portrait: beta = 90; tilting the top away (camera down) lowers beta
      if (Math.abs(e.gamma ?? 0) < 45) this.pitchDown = Math.max(-40, Math.min(80, 90 - e.beta));
    }
    const wk = (e as any).webkitCompassHeading as number | undefined;
    let h: number | null = null;
    if (typeof wk === 'number' && !Number.isNaN(wk)) h = wk;
    else if (e.absolute !== false && typeof e.alpha === 'number' && typeof e.beta === 'number' && typeof e.gamma === 'number') {
      h = cameraHeading(e.alpha, e.beta, e.gamma);
    }
    if (h == null) return;
    const first = this.source !== 'compass';
    this.source = 'compass';
    if (first) { this.vx = Math.sin(h * RAD); this.vy = Math.cos(h * RAD); }
    this.push(h, first ? 1 : 0.35);
  };

  private onMotion = (e: DeviceMotionEvent) => {
    const g = e.accelerationIncludingGravity;
    if (g && g.x != null && g.y != null && g.z != null) {
      const m = Math.hypot(g.x, g.y, g.z) || 1;
      this.gUp = [g.x / m, g.y / m, g.z / m];
    }
    if (this.source === 'compass') return;
    const r = e.rotationRate;
    const now = performance.now();
    const dt = this.lastGyroT ? (now - this.lastGyroT) / 1000 : 0;
    this.lastGyroT = now;
    if (!r || !this.gUp || dt <= 0 || dt > 0.5) return;
    // yaw rate = rotation about the vertical axis; clockwise (seen from above) = heading increases
    const yaw = -((r.beta ?? 0) * this.gUp[0] + (r.gamma ?? 0) * this.gUp[1] + (r.alpha ?? 0) * this.gUp[2]);
    if (Math.abs(yaw) < 2) return; // gyro noise
    this.source = 'gyro';
    this.push(this.heading + yaw * dt, 1);
  };
}

/** Step counter from the accelerometer (peak detection on the vertical bounce). */
export class StepDetector {
  private smooth = 9.8;
  private base = 9.8;
  private above = false;
  private peak = 0;
  private lastStep = 0;
  constructor(private onStep: () => void) {}

  start() { window.addEventListener('devicemotion', this.handler); }
  stop() { window.removeEventListener('devicemotion', this.handler); }

  private handler = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity;
    if (!a || a.x == null || a.y == null || a.z == null) return;
    const mag = Math.hypot(a.x, a.y, a.z);
    this.smooth = this.smooth * 0.75 + mag * 0.25;
    this.base = this.base * 0.98 + mag * 0.02;
    const d = this.smooth - this.base;
    const now = performance.now();
    if (!this.above && d > 1.1) { this.above = true; this.peak = d; }
    else if (this.above) {
      this.peak = Math.max(this.peak, d);
      if (d < 0.2) {
        this.above = false;
        // a real step: clear bounce, 0.3-2 s apart
        if (this.peak > 1.4 && this.peak < 9 && now - this.lastStep > 300) {
          this.lastStep = now;
          this.onStep();
        }
      }
    }
  };
}
