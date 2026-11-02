// The living orb of "العقل المركزي", drawn on a canvas every frame:
// morphing plasma blobs, a glassy core with inner currents, a voice-reactive spectrum ring,
// orbiting particles with trails and ripples on loud moments. Colours come from the theme tokens
// (--brand-from / --brand-to), so it follows light/dark and any brand change.
import { useEffect, useRef } from 'react';
import type { BrainStatus } from './voiceBrain';

type Props = {
  status: BrainStatus;
  /** 0..1 loudness, read every frame */
  getLevel: () => number;
  /** quiet idle look for the corner */
  calm?: boolean;
};

type Particle = { a: number; r: number; s: number; z: number; tw: number };
type Ripple = { born: number; strength: number };

const token = (name: string, fallback: string) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

export default function BrainVisual({ status, getLevel, calm }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef(status);
  const calmRef = useRef(calm);
  statusRef.current = status;
  calmRef.current = calm;

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    let raf = 0;
    let lvl = 0;
    let spin = 0;
    let lastRipple = 0;
    const ripples: Ripple[] = [];
    const parts: Particle[] = Array.from({ length: 90 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: 1.08 + Math.random() * 0.42,
      s: (0.15 + Math.random() * 0.5) * (Math.random() < 0.5 ? 1 : -1),
      z: 0.4 + Math.random() * 0.9,
      tw: Math.random() * Math.PI * 2,
    }));
    let from = token('--brand-from', '220 90% 56%');
    let to = token('--brand-to', '270 85% 60%');
    const recolor = window.setInterval(() => { from = token('--brand-from', from); to = token('--brand-to', to); }, 1500);
    const c = (hsl: string, a: number) => `hsl(${hsl} / ${a})`;

    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      return dpr;
    };

    const blob = (cx: number, cy: number, R: number, t: number, seed: number, amp: number) => {
      const n = 9;
      const pts: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        const th = (i / n) * Math.PI * 2;
        const rr = R * (1 + amp * (Math.sin(th * 3 + t * 1.3 + seed) * 0.5 + Math.sin(th * 2 - t * 0.9 + seed * 2) * 0.35 + Math.sin(th * 5 + t * 2.1 + seed * 3) * 0.15));
        pts.push([cx + Math.cos(th + seed) * rr, cy + Math.sin(th + seed) * rr]);
      }
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const p0 = pts[i], p1 = pts[(i + 1) % n];
        const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
        if (i === 0) ctx.moveTo(mx, my); else ctx.quadraticCurveTo(p0[0], p0[1], mx, my);
      }
      const p0 = pts[0], p1 = pts[1];
      ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
      ctx.closePath();
    };

    const draw = (now: number) => {
      const dpr = fit();
      const W = cv.width, H = cv.height, cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.215; // the orb (= the button size); the rest of the canvas is room for the halo
      const t = now / 1000;
      const st = statusRef.current;
      const quiet = calmRef.current;
      const raw = Math.max(0, Math.min(1, getLevel()));
      lvl += (raw - lvl) * (raw > lvl ? 0.35 : 0.08);
      const thinking = st === 'thinking' || st === 'connecting';
      const speaking = st === 'speaking';
      spin += (thinking ? 0.045 : speaking ? 0.018 : 0.008) * (quiet ? 0.6 : 1);
      ctx.clearRect(0, 0, W, H);

      // 1. halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * (1.75 + lvl * 0.5));
      halo.addColorStop(0, c(to, 0.35 + lvl * 0.35));
      halo.addColorStop(0.5, c(from, 0.12 + lvl * 0.15));
      halo.addColorStop(1, c(from, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, W, H);

      // 2. ripples on loud moments
      if (!quiet && lvl > 0.42 && now - lastRipple > 380) { ripples.push({ born: now, strength: lvl }); lastRipple = now; }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const k = (now - ripples[i].born) / 1400;
        if (k >= 1) { ripples.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(cx, cy, R * (0.95 + k * 0.9), 0, Math.PI * 2);
        ctx.strokeStyle = c(k < 0.5 ? from : to, (1 - k) * 0.55 * ripples[i].strength);
        ctx.lineWidth = (1 - k) * 3 * dpr;
        ctx.stroke();
      }

      // 3. spectrum ring (voice) or orbiting arcs (thinking)
      if (!quiet) {
        ctx.save();
        ctx.translate(cx, cy);
        if (thinking) {
          for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            const r = R * (1.12 + k * 0.09);
            const a0 = spin * (k % 2 ? -1.6 : 2.2) + k * 2;
            ctx.arc(0, 0, r, a0, a0 + Math.PI * (0.35 + 0.25 * Math.sin(t * 2 + k)));
            ctx.strokeStyle = c(k % 2 ? to : from, 0.85 - k * 0.2);
            ctx.lineWidth = (2.6 - k * 0.6) * dpr;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        } else {
          const N = 120;
          for (let i = 0; i < N; i++) {
            const th = (i / N) * Math.PI * 2 + spin;
            const wob = 0.5 + 0.5 * Math.sin(i * 0.9 + t * 7) * Math.cos(i * 0.37 - t * 4.3);
            const len = R * (0.025 + (speaking || st === 'listening' ? lvl : 0.02) * 0.42 * wob);
            const r0 = R * 1.06;
            ctx.beginPath();
            ctx.moveTo(Math.cos(th) * r0, Math.sin(th) * r0);
            ctx.lineTo(Math.cos(th) * (r0 + len), Math.sin(th) * (r0 + len));
            ctx.strokeStyle = c(i % 2 ? from : to, 0.35 + wob * 0.55);
            ctx.lineWidth = 1.6 * dpr;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 4. orbiting particles with short trails
      const pSpeed = (thinking ? 3.2 : speaking ? 1.4 + lvl * 2 : 0.8) * (quiet ? 0.5 : 1);
      for (const p of parts) {
        p.a += p.s * 0.01 * pSpeed;
        const rr = R * (p.r + (speaking ? lvl * 0.25 * p.z : 0));
        const tilt = 0.55 + 0.45 * p.z;
        const x = cx + Math.cos(p.a) * rr, y = cy + Math.sin(p.a) * rr * tilt;
        const tx = cx + Math.cos(p.a - p.s * 0.09 * pSpeed) * rr, ty = cy + Math.sin(p.a - p.s * 0.09 * pSpeed) * rr * tilt;
        const alpha = (0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3 + p.tw))) * (quiet ? 0.5 : 1);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.strokeStyle = c(p.z > 0.85 ? to : from, alpha * 0.6);
        ctx.lineWidth = p.z * 1.4 * dpr;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, p.z * 1.3 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = c('0 0% 100%', alpha);
        ctx.fill();
      }

      // 5. plasma blobs
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const amp = (quiet ? 0.04 : 0.07) + lvl * 0.16 + (thinking ? 0.05 : 0);
      for (let k = 0; k < 3; k++) {
        blob(cx, cy, R * (0.93 + k * 0.03), t * (1 + k * 0.35) + (thinking ? spin * 2 : 0), k * 2.1, amp * (1 - k * 0.2));
        const g = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.25, R * 0.1, cx, cy, R * 1.1);
        g.addColorStop(0, c(k === 1 ? to : from, 0.55));
        g.addColorStop(1, c(k === 1 ? from : to, 0.08));
        ctx.fillStyle = g;
        ctx.fill();
      }
      ctx.restore();

      // 6. glass core with inner currents
      const coreR = R * (0.8 + lvl * 0.06);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      const core = ctx.createRadialGradient(cx - coreR * 0.35, cy - coreR * 0.4, coreR * 0.05, cx, cy, coreR);
      core.addColorStop(0, c('0 0% 100%', 0.95));
      core.addColorStop(0.22, c(from, 0.95));
      core.addColorStop(0.7, c(to, 0.95));
      core.addColorStop(1, c(to, 0.75));
      ctx.fillStyle = core;
      ctx.fill();
      ctx.clip();
      ctx.globalCompositeOperation = 'screen';
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        const ph = spin * (1.5 + k * 0.4) + k * 1.3;
        for (let i = 0; i <= 40; i++) {
          const u = i / 40;
          const x = cx + (u - 0.5) * coreR * 2.2;
          const y = cy + Math.sin(u * Math.PI * 2 + ph) * coreR * (0.18 + lvl * 0.35) + (k - 2) * coreR * 0.22;
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.strokeStyle = c('0 0% 100%', 0.12 + lvl * 0.25);
        ctx.lineWidth = (1.2 + k * 0.4) * dpr;
        ctx.stroke();
      }
      // bottom shade for depth
      const shade = ctx.createLinearGradient(cx, cy - coreR, cx, cy + coreR);
      shade.addColorStop(0.55, 'rgba(0,0,0,0)');
      shade.addColorStop(1, 'rgba(0,0,0,0.28)');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = shade;
      ctx.fillRect(cx - coreR, cy - coreR, coreR * 2, coreR * 2);
      ctx.restore();

      // 7. rim light + glint
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.strokeStyle = c('0 0% 100%', 0.35 + lvl * 0.3);
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();
      ctx.save();
      ctx.translate(cx - coreR * 0.32, cy - coreR * 0.45);
      ctx.rotate(-0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, coreR * 0.28, coreR * 0.12, 0, 0, Math.PI * 2);
      ctx.fillStyle = c('0 0% 100%', 0.5);
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.clearInterval(recolor); };
  }, [getLevel]);

  return <canvas ref={ref} className="pointer-events-none absolute -inset-[66%] h-[232%] w-[232%]" aria-hidden />;
}
