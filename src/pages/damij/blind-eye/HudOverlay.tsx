import React, { useEffect, useRef } from 'react';

export type DetectedPoint = {
  x: number; // 0..1
  y: number; // 0..1
  w?: number;
  h?: number;
  label: string;
  hazard: 'low' | 'medium' | 'high';
  proximity: number; // 0..100
  source: 'ai' | 'local';
};

type Props = {
  points: DetectedPoint[];
  bestPath?: 'left' | 'center' | 'right';
  showLabels?: boolean;
  showGrid?: boolean;
};

const hazardColor = (h: 'low' | 'medium' | 'high') =>
  h === 'high' ? '#ef4444' : h === 'medium' ? '#f59e0b' : '#10b981';

const HudOverlay: React.FC<Props> = ({ points, bestPath, showLabels = true, showGrid = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const r = c.getBoundingClientRect();
      c.width = Math.floor(r.width * dpr);
      c.height = Math.floor(r.height * dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      phaseRef.current += 0.08;
      const pulse = 0.5 + 0.5 * Math.sin(phaseRef.current);

      if (showGrid) {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1 * dpr;
        for (let i = 1; i < 3; i++) {
          ctx.beginPath(); ctx.moveTo((W / 3) * i, 0); ctx.lineTo((W / 3) * i, H); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, (H / 3) * i); ctx.lineTo(W, (H / 3) * i); ctx.stroke();
        }
      }

      // Best path corridor
      if (bestPath) {
        const colW = W / 3;
        const x = bestPath === 'left' ? 0 : bestPath === 'right' ? 2 * colW : colW;
        ctx.fillStyle = 'rgba(16,185,129,0.10)';
        ctx.fillRect(x, H * 0.55, colW, H * 0.45);
        ctx.strokeStyle = 'rgba(16,185,129,0.55)';
        ctx.lineWidth = 2 * dpr;
        ctx.strokeRect(x + 4, H * 0.55, colW - 8, H * 0.45);
      }

      // Points
      for (const p of points) {
        const cx = p.x * W;
        const cy = p.y * H;
        const baseR = Math.max(10 * dpr, (p.proximity / 100) * 30 * dpr);
        const color = hazardColor(p.hazard);

        // pulse ring for high hazard
        if (p.hazard === 'high') {
          ctx.beginPath();
          ctx.arc(cx, cy, baseR + 10 * dpr * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.5 * (1 - pulse * 0.6);
          ctx.lineWidth = 3 * dpr;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // bbox if available
        if (p.w && p.h) {
          const bw = p.w * W, bh = p.h * H;
          ctx.strokeStyle = color;
          ctx.globalAlpha = p.source === 'local' ? 0.5 : 0.85;
          ctx.lineWidth = 2 * dpr;
          ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
          ctx.globalAlpha = 1;
        }

        // dot
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.source === 'local' ? 0.6 : 0.95;
        ctx.fill();
        ctx.globalAlpha = 1;

        // dot border
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * 0.45, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 1.5 * dpr;
        ctx.stroke();

        // label
        if (showLabels && p.label && p.source === 'ai') {
          ctx.font = `bold ${12 * dpr}px system-ui, sans-serif`;
          const text = p.label;
          const tw = ctx.measureText(text).width;
          const padX = 6 * dpr, padY = 3 * dpr;
          const ty = cy - baseR - 8 * dpr;
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(cx - tw / 2 - padX, ty - 14 * dpr, tw + padX * 2, 18 * dpr + padY);
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, cx, ty - 4 * dpr);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [points, bestPath, showLabels, showGrid]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export default HudOverlay;
