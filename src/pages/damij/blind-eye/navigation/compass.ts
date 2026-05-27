// Device compass: provides true/magnetic heading (0-360, 0 = north, 90 = east).
// Returns an unsubscribe function. iOS requires a user gesture to grant permission.

export type CompassCallback = (heading: number) => void;

export async function requestCompassPermission(): Promise<boolean> {
  try {
    const anyDOE: any = (window as any).DeviceOrientationEvent;
    if (anyDOE && typeof anyDOE.requestPermission === 'function') {
      const res = await anyDOE.requestPermission();
      return res === 'granted';
    }
  } catch {}
  return true; // Android / desktop: no explicit permission gate
}

export function startCompass(cb: CompassCallback): () => void {
  let last = 0;
  const handler = (e: DeviceOrientationEvent) => {
    // webkitCompassHeading on iOS = degrees clockwise from magnetic north (already heading)
    const wk = (e as any).webkitCompassHeading as number | undefined;
    let heading: number | null = null;
    if (typeof wk === 'number' && !Number.isNaN(wk)) {
      heading = wk;
    } else if (typeof e.alpha === 'number' && !Number.isNaN(e.alpha)) {
      // alpha = rotation around Z (0 = device facing north when flat). Heading ≈ 360 - alpha.
      heading = (360 - e.alpha) % 360;
    }
    if (heading == null) return;
    const now = Date.now();
    if (now - last < 200) return; // throttle to ~5 Hz
    last = now;
    cb(((heading % 360) + 360) % 360);
  };
  // Prefer absolute orientation when available
  const evtName = ('ondeviceorientationabsolute' in window) ? 'deviceorientationabsolute' : 'deviceorientation';
  window.addEventListener(evtName as any, handler as any, true);
  return () => window.removeEventListener(evtName as any, handler as any, true);
}
