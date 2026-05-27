// Lightweight fall detection using DeviceMotion.
// Heuristic: a brief free-fall (low total acceleration) followed by a sharp impact spike,
// then ~1s of low motion (user is on the ground).

export type FallCallback = () => void;

export function startFallDetection(onFall: FallCallback): () => void {
  let state: 'idle' | 'freefall' | 'impact' = 'idle';
  let freefallStart = 0;
  let impactAt = 0;
  let lastFire = 0;

  const handler = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity || e.acceleration;
    if (!a || a.x == null || a.y == null || a.z == null) return;
    const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
    const now = Date.now();

    if (state === 'idle') {
      // Free fall: total accel close to zero for ~100ms
      if (mag < 3.5) { state = 'freefall'; freefallStart = now; }
    } else if (state === 'freefall') {
      if (mag > 25) { state = 'impact'; impactAt = now; }
      else if (now - freefallStart > 600) state = 'idle';
    } else if (state === 'impact') {
      // After impact wait ~800ms: if motion stays low, it's a likely fall.
      if (now - impactAt > 800) {
        state = 'idle';
        if (mag < 13 && now - lastFire > 10000) {
          lastFire = now;
          try { onFall(); } catch {}
        }
      }
    }
  };

  window.addEventListener('devicemotion', handler);
  return () => window.removeEventListener('devicemotion', handler);
}

export async function requestMotionPermission(): Promise<boolean> {
  try {
    const anyDM: any = (window as any).DeviceMotionEvent;
    if (anyDM && typeof anyDM.requestPermission === 'function') {
      const r = await anyDM.requestPermission();
      return r === 'granted';
    }
  } catch {}
  return true;
}
