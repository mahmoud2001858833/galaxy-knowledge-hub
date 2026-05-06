// Haptic priority bus: serializes navigator.vibrate calls so that
// instructional cues (success/error) and focus pulses always interrupt
// lower-priority humming/edge ticks. Higher number = higher priority.

export type HapticPriority = 'hum' | 'edge' | 'pulse' | 'cue';

const RANK: Record<HapticPriority, number> = {
  hum: 1,    // continuous texture humming
  edge: 2,   // edge clicks, focus engaged ticks
  pulse: 3,  // focus pulse
  cue: 4,    // success / error (always wins)
};

let activePriority: HapticPriority | null = null;
let activeUntil = 0;     // performance.now() when current cue ends
let lockUntil = 0;       // hard lock for cues (no lower priority can run)

const supportsVibration = () =>
  typeof navigator !== 'undefined' && 'vibrate' in navigator;

const totalDuration = (p: number | number[]) =>
  Array.isArray(p) ? p.reduce((a, b) => a + b, 0) : p;

/**
 * Try to play a vibration at the given priority.
 * Returns true if accepted, false if suppressed by a higher-priority active cue.
 * Cues additionally lock out lower priorities for `lockMs` after they finish.
 */
export function hapticPlay(
  priority: HapticPriority,
  pattern: number | number[],
  opts: { lockMs?: number } = {}
): boolean {
  if (!supportsVibration()) return false;
  const now = performance.now();
  const myRank = RANK[priority];

  // Locked by a recent cue?
  if (now < lockUntil && myRank < RANK.cue) return false;

  // Active higher-priority pattern still running?
  if (activePriority && now < activeUntil && RANK[activePriority] > myRank) return false;

  // If our priority >= active, we may interrupt: cancel previous.
  navigator.vibrate(0);
  navigator.vibrate(pattern);

  const dur = totalDuration(pattern);
  activePriority = priority;
  activeUntil = now + dur;

  if (priority === 'cue') {
    const lock = opts.lockMs ?? 200;
    lockUntil = now + dur + lock;
  }
  return true;
}

/** Stop everything immediately and clear the lock. */
export function hapticStop() {
  if (!supportsVibration()) return;
  navigator.vibrate(0);
  activePriority = null;
  activeUntil = 0;
  lockUntil = 0;
}

/** True if a cue is currently locking lower-priority vibrations. */
export function isHapticLocked(): boolean {
  return performance.now() < lockUntil;
}
