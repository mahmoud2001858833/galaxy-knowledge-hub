// Directional haptic feedback that runs alongside speech.
// Patterns chosen to be distinguishable without looking.

const KEY = 'damij.blindEye.haptics.v1';

export function isHapticsEnabled(): boolean {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return false;
  try {
    const v = localStorage.getItem(KEY);
    return v === null ? true : v === '1';
  } catch { return true; }
}

export function setHapticsEnabled(on: boolean) {
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch {}
}

function fire(pattern: number | number[]) {
  if (!isHapticsEnabled()) return;
  try { navigator.vibrate(pattern); } catch {}
}

export const haptics = {
  right: () => fire(80),
  left: () => fire(200),
  stop: () => fire([100, 60, 100, 60, 100]),
  ahead: () => fire([40, 40, 40]),
  back: () => fire([250, 80, 250]),
  alert: () => fire([60, 30, 60, 30, 200]),
  tap: () => fire(30),
};

export function hapticForDirection(dir: string) {
  switch (dir) {
    case 'left': case 'يسار': haptics.left(); break;
    case 'right': case 'يمين': haptics.right(); break;
    case 'stop': case 'قف': haptics.stop(); break;
    case 'back': case 'تراجع': haptics.back(); break;
    case 'center': case 'ahead': case 'أمام': haptics.ahead(); break;
  }
}
