import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity, Gauge, Zap, TrendingUp, Radio } from 'lucide-react';

export interface HUDMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  color?: string; // Tailwind text color like 'text-cyan-400'
  icon?: React.ReactNode;
  progressPercent?: number; // 0 to 100
  trend?: 'up' | 'down' | 'stable';
}

interface CyberLabHUDProps {
  title?: string;
  statusBadge?: string;
  metrics: HUDMetric[];
  showWaveform?: boolean;
  waveformColor?: string;
  waveformSpeed?: number;
  className?: string;
}

export const CyberLabHUD: React.FC<CyberLabHUDProps> = ({
  title = "نظام المراقبة والقياس المباشر",
  statusBadge = "LIVE TELEMETRY",
  metrics,
  showWaveform = true,
  waveformColor = "#06b6d4",
  waveformSpeed = 1,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated live oscilloscope waveform
  useEffect(() => {
    if (!showWaveform) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const mid = h / 2;

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw oscilloscope sine/rhythm wave
      ctx.beginPath();
      ctx.strokeStyle = waveformColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = waveformColor;
      ctx.shadowBlur = 8;

      for (let x = 0; x < w; x++) {
        // Multi-harmonic waveform
        const y = mid + 
          Math.sin((x * 0.04) + phase) * 12 + 
          Math.sin((x * 0.08) - (phase * 1.5)) * 6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      phase += 0.05 * waveformSpeed;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [showWaveform, waveformColor, waveformSpeed]);

  return (
    <div className={`p-4 rounded-2xl bg-slate-950/75 border border-white/10 backdrop-blur-xl shadow-2xl ${className}`}>
      {/* HUD Header */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
          <span className="text-xs font-black tracking-wider uppercase text-cyan-300">
            {statusBadge}
          </span>
        </div>
        <span className="text-xs font-bold text-slate-300">
          {title}
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/15 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="truncate">{m.label}</span>
              {m.icon || <Activity className="w-3.5 h-3.5 text-slate-500" />}
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <span className={`text-xl font-black ${m.color || 'text-white'}`}>
                {m.value}
              </span>
              {m.unit && (
                <span className="text-[10px] font-bold text-slate-400">
                  {m.unit}
                </span>
              )}
            </div>

            {m.progressPercent !== undefined && (
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, m.progressPercent))}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Optional Embedded Live Waveform Oscilloscope */}
      {showWaveform && (
        <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400/80 font-mono whitespace-nowrap">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>SIGNAL</span>
          </div>
          <div className="flex-1 h-8 rounded-lg overflow-hidden bg-slate-900/80 border border-cyan-500/20">
            <canvas ref={canvasRef} width={280} height={32} className="w-full h-full block" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CyberLabHUD;
