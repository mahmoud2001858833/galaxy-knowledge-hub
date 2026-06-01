// Spin-scan: tracks the user's full 360° rotation using compass heading deltas.
// Triggers progress callbacks at each quarter turn and completes near 320°.
// Falls back to devicemotion gyro integration when compass is unavailable.

import { startCompass } from './compass';

export type SpinHandle = {
  stop: () => void;
  getProgress: () => number; // 0..1
};

export type SpinOptions = {
  targetDeg?: number;       // default 320
  onProgress: (deg: number, pct: number) => void;
  onQuarter?: (q: 1 | 2 | 3 | 4) => void;
  onComplete: () => void;
};

export function startSpinScan(opts: SpinOptions): SpinHandle {
  const target = opts.targetDeg ?? 320;
  let lastHeading: number | null = null;
  let accumulated = 0;
  let quartersFired = 0;
  let completed = false;

  const tick = (heading: number) => {
    if (completed) return;
    if (lastHeading == null) { lastHeading = heading; return; }
    let delta = heading - lastHeading;
    // Wrap to [-180, 180] so a 359→1 jump counts as +2°, not -358°.
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastHeading = heading;
    accumulated += Math.abs(delta);

    const pct = Math.min(1, accumulated / target);
    opts.onProgress(accumulated, pct);

    const q = Math.min(4, Math.floor(accumulated / 90)) as 1 | 2 | 3 | 4;
    if (q > quartersFired && q >= 1) {
      quartersFired = q;
      opts.onQuarter?.(q);
    }

    if (accumulated >= target) {
      completed = true;
      opts.onComplete();
    }
  };

  // Primary: compass
  const stopCompass = startCompass(tick);

  // Fallback: integrate gyro rotationRate.alpha when compass doesn't fire (older Android browsers)
  let lastMotionT = 0;
  const motion = (e: DeviceMotionEvent) => {
    if (completed) return;
    const r = e.rotationRate;
    if (!r || typeof r.alpha !== 'number') return;
    const now = performance.now();
    if (!lastMotionT) { lastMotionT = now; return; }
    const dt = (now - lastMotionT) / 1000;
    lastMotionT = now;
    // Only use gyro if compass hasn't produced any heading after ~1s
    if (lastHeading != null) return;
    accumulated += Math.abs(r.alpha) * dt;
    const pct = Math.min(1, accumulated / target);
    opts.onProgress(accumulated, pct);
    if (accumulated >= target) { completed = true; opts.onComplete(); }
  };
  window.addEventListener('devicemotion', motion);

  return {
    stop: () => {
      completed = true;
      stopCompass();
      window.removeEventListener('devicemotion', motion);
    },
    getProgress: () => Math.min(1, accumulated / target),
  };
}
