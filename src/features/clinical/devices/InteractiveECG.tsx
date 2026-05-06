import React, { useEffect, useRef, useState } from 'react';

// Procedural ECG canvas — draws a continuous waveform based on rhythm hint and HR.
// Supported rhythms: sinus, sinus_tachy, sinus_brady, afib, vt, vf, asystole.
type Rhythm = 'sinus' | 'sinus_tachy' | 'sinus_brady' | 'afib' | 'vt' | 'vf' | 'asystole';

interface Props {
  hr?: number;
  rhythm?: Rhythm;
  width?: number;
  height?: number;
  running?: boolean;
}

const InteractiveECG: React.FC<Props> = ({ hr = 75, rhythm = 'sinus', width = 600, height = 180, running = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const xRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width; canvas.height = height;
    // Grid
    const drawGrid = () => {
      ctx.fillStyle = '#fff5f5'; ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = '#fecaca'; ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 10) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
      for (let y = 0; y < height; y += 10) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
    };
    drawGrid();

    let raf = 0;
    const mid = height / 2;
    const speed = 1.5; // px per frame

    // Generate one beat sample at phase p∈[0,1] (sinus PQRST). Returns y offset in mm.
    const sinusBeat = (p: number): number => {
      // P wave: 0.05-0.13
      if (p > 0.05 && p < 0.13) return -8 * Math.sin(((p - 0.05) / 0.08) * Math.PI);
      // PR segment flat
      if (p > 0.13 && p < 0.18) return 0;
      // Q wave
      if (p > 0.18 && p < 0.20) return 6 * ((p - 0.18) / 0.02);
      // R wave (sharp up)
      if (p > 0.20 && p < 0.23) return -55 * ((p - 0.20) / 0.03);
      // S wave (sharp down)
      if (p > 0.23 && p < 0.26) return -55 + 70 * ((p - 0.23) / 0.03);
      // ST segment
      if (p > 0.26 && p < 0.36) return 0;
      // T wave
      if (p > 0.36 && p < 0.55) return -16 * Math.sin(((p - 0.36) / 0.19) * Math.PI);
      return 0;
    };

    const beatLengthSec = (effHr: number) => 60 / Math.max(20, effHr);

    const sample = (t: number): number => {
      switch (rhythm) {
        case 'asystole': return 0;
        case 'vf': return (Math.sin(t * 22) + Math.sin(t * 31 + 1) + Math.sin(t * 47 + 2)) * 18;
        case 'vt': {
          const period = beatLengthSec(180);
          const p = (t % period) / period;
          return -60 * Math.sin(p * Math.PI * 2) - 30 * Math.sin(p * Math.PI * 4);
        }
        case 'afib': {
          // No clear P, irregular RR
          const baseHr = 110 + Math.sin(t * 0.7) * 20;
          const period = beatLengthSec(baseHr) * (0.7 + 0.6 * Math.random());
          const p = (t % period) / period;
          const noise = (Math.random() - 0.5) * 4;
          return sinusBeat(p) * (p > 0.05 && p < 0.13 ? 0 : 1) + noise;
        }
        case 'sinus_tachy': {
          const period = beatLengthSec(Math.max(110, hr));
          return sinusBeat((t % period) / period);
        }
        case 'sinus_brady': {
          const period = beatLengthSec(Math.min(55, hr));
          return sinusBeat((t % period) / period);
        }
        default: {
          const period = beatLengthSec(hr);
          return sinusBeat((t % period) / period);
        }
      }
    };

    let prevY = mid;
    const tick = () => {
      if (!running) { raf = requestAnimationFrame(tick); return; }
      // Slide canvas left
      const img = ctx.getImageData(speed, 0, width - speed, height);
      drawGrid();
      ctx.putImageData(img, 0, 0);
      // Draw new column at right edge
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.6;
      const stepsPerFrame = speed;
      for (let i = 0; i < stepsPerFrame; i++) {
        tRef.current += 1 / 60 / stepsPerFrame;
        const y = mid + sample(tRef.current);
        const x = width - speed + i;
        ctx.beginPath(); ctx.moveTo(x - 1, prevY); ctx.lineTo(x, y); ctx.stroke();
        prevY = y;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hr, rhythm, width, height, running]);

  return <canvas ref={canvasRef} className="rounded-lg border w-full" style={{ maxWidth: width }} />;
};

export default InteractiveECG;
