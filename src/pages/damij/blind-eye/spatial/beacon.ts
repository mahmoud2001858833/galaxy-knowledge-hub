// Audio beacon toward the destination: a short ping panned to the side the target is on, faster as
// the user gets closer and higher-pitched when they face it. Works with headphones or the speaker.

let ctx: AudioContext | null = null;

/** Create/resume the audio context; call from a tap so mobile browsers allow sound. */
export function unlockAudio() {
  const C = window.AudioContext || (window as any).webkitAudioContext;
  if (!C) return;
  if (!ctx) ctx = new C();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

function ping(freq: number, pan: number, gain = 0.16) {
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  let node: AudioNode = osc;
  if (ctx.createStereoPanner) {
    const p = ctx.createStereoPanner();
    p.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), t);
    osc.connect(p);
    node = p;
  }
  node.connect(g);
  g.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.15);
}

export class Beacon {
  private timer: number | null = null;
  private rel = 0;
  private dist = 5;
  enabled = true;

  update(rel: number, dist: number) {
    this.rel = rel;
    this.dist = dist;
    if (this.timer == null && this.enabled) this.loop();
  }

  private loop = () => {
    const facing = Math.abs(this.rel) <= 15;
    const behind = Math.abs(this.rel) >= 120;
    const pan = Math.sin((this.rel * Math.PI) / 180);
    ping(facing ? 1046 : behind ? 392 : 659, pan, facing ? 0.18 : 0.13);
    const gap = Math.max(220, Math.min(1300, this.dist * 260));
    this.timer = window.setTimeout(this.loop, gap);
  };

  stop() {
    if (this.timer != null) window.clearTimeout(this.timer);
    this.timer = null;
  }
}

/** Short confirmation chirps. */
export const chirp = {
  found: () => { ping(784, 0, 0.14); window.setTimeout(() => ping(1175, 0, 0.14), 110); },
  shot: () => ping(1400, 0, 0.06),
  arrived: () => { ping(784, 0); window.setTimeout(() => ping(988, 0), 120); window.setTimeout(() => ping(1318, 0), 240); },
  warn: (pan = 0) => { ping(330, pan, 0.22); window.setTimeout(() => ping(330, pan, 0.22), 140); },
};
