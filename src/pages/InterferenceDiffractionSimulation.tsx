import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Aperture, CircleDot, Waves } from 'lucide-react';
import { InfoSection, QuizSection } from '@/components/simulations';

const InterferenceDiffractionSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('double-slit');
  const [wavelength, setWavelength] = useState(550);
  const [slitDistance, setSlitDistance] = useState(50);
  const [slitWidth, setSlitWidth] = useState(10);
  const timeRef = useRef(0);

  const wavelengthToColor = (wl: number): string => {
    if (wl < 380) return '#7c3aed';
    if (wl < 450) return `hsl(${270 - (wl - 380) * 2}, 100%, 50%)`;
    if (wl < 495) return `hsl(${240 - (wl - 450) * 2.5}, 100%, 50%)`;
    if (wl < 570) return `hsl(${120 + (wl - 495) * 0.5}, 100%, 45%)`;
    if (wl < 590) return `hsl(${60 - (wl - 570) * 3}, 100%, 50%)`;
    if (wl < 620) return `hsl(${30 - (wl - 590)}, 100%, 50%)`;
    if (wl < 750) return `hsl(0, 100%, ${50 - (wl - 620) * 0.2}%)`;
    return '#dc2626';
  };

  const drawDoubleSlit = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = timeRef.current;
    const color = wavelengthToColor(wavelength);
    const cy = h / 2;
    const barrierX = w * 0.35;
    const screenX = w * 0.85;
    const d = slitDistance;

    // Source waves
    const sourceX = 30;
    for (let r = 0; r < 15; r++) {
      const radius = ((t * 100 + r * 30) % 400);
      if (radius < 5) continue;
      ctx.beginPath();
      ctx.arc(sourceX, cy, radius, -0.4, 0.4);
      ctx.strokeStyle = `${color}${Math.max(0, Math.floor(30 - radius * 0.08)).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Barrier
    ctx.fillStyle = '#475569';
    ctx.fillRect(barrierX - 4, 0, 8, cy - d / 2 - slitWidth / 2);
    ctx.fillRect(barrierX - 4, cy - d / 2 + slitWidth / 2, 8, d - slitWidth);
    ctx.fillRect(barrierX - 4, cy + d / 2 + slitWidth / 2, 8, h - cy - d / 2 - slitWidth / 2);

    // Diffracted waves from each slit
    const slit1Y = cy - d / 2;
    const slit2Y = cy + d / 2;

    for (let r = 0; r < 20; r++) {
      const radius = ((t * 80 + r * 25) % 500);
      if (radius < 5) continue;
      const alpha = Math.max(0, 25 - radius * 0.05);
      const alphaHex = Math.floor(alpha).toString(16).padStart(2, '0');

      ctx.beginPath();
      ctx.arc(barrierX + 4, slit1Y, radius, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = `${color}${alphaHex}`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(barrierX + 4, slit2Y, radius, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = `${color}${alphaHex}`;
      ctx.stroke();
    }

    // Screen with interference pattern
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(screenX - 3, 0, 6, h);

    // Intensity pattern on screen
    const lambda = wavelength / 1000;
    for (let y = 0; y < h; y++) {
      const dy = y - cy;
      const r1 = Math.sqrt((screenX - barrierX) ** 2 + (dy + d / 2) ** 2);
      const r2 = Math.sqrt((screenX - barrierX) ** 2 + (dy - d / 2) ** 2);
      const pathDiff = (r2 - r1);
      const phase = (pathDiff / (lambda * 50)) * Math.PI * 2;
      const intensity = Math.cos(phase / 2) ** 2;

      // Single slit envelope
      const beta = (Math.PI * slitWidth * dy) / (lambda * 50 * (screenX - barrierX));
      const envelope = beta === 0 ? 1 : (Math.sin(beta) / beta) ** 2;

      const finalI = intensity * envelope;
      const rgb = Math.floor(finalI * 255);

      ctx.fillStyle = `rgb(${rgb}, ${Math.floor(rgb * 0.8)}, ${Math.floor(rgb * 0.6)})`;
      ctx.fillRect(screenX + 8, y, 25, 1);
    }

    // Labels
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('المصدر', sourceX, 25);
    ctx.fillText('الحاجز', barrierX, 25);
    ctx.fillText('الشاشة', screenX + 15, 25);

    // Slit labels
    ctx.fillStyle = color;
    ctx.font = '10px sans-serif';
    ctx.fillText('شق 1', barrierX + 30, slit1Y);
    ctx.fillText('شق 2', barrierX + 30, slit2Y);

    // Distance marker
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(barrierX + 15, slit1Y);
    ctx.lineTo(barrierX + 15, slit2Y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`d = ${d}`, barrierX + 25, cy);

    // Formula
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Δy = λL/d', w / 2, h - 20);
  }, [wavelength, slitDistance, slitWidth]);

  const drawSingleSlit = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = timeRef.current;
    const color = wavelengthToColor(wavelength);
    const cy = h / 2;
    const barrierX = w * 0.4;
    const screenX = w * 0.85;
    const a = slitWidth * 2;

    // Incoming plane waves
    for (let i = 0; i < 10; i++) {
      const x = ((t * 80 + i * 40) % (barrierX - 20));
      ctx.strokeStyle = `${color}40`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, cy - 100);
      ctx.lineTo(x, cy + 100);
      ctx.stroke();
    }

    // Barrier with single slit
    ctx.fillStyle = '#475569';
    ctx.fillRect(barrierX - 4, 0, 8, cy - a / 2);
    ctx.fillRect(barrierX - 4, cy + a / 2, 8, h - cy - a / 2);

    // Diffracted waves
    for (let r = 0; r < 15; r++) {
      const radius = ((t * 60 + r * 30) % 400);
      if (radius < 5) continue;
      ctx.beginPath();
      ctx.arc(barrierX + 4, cy, radius, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = `${color}${Math.max(0, Math.floor(25 - radius * 0.06)).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Screen pattern
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(screenX - 3, 0, 6, h);

    const lambda = wavelength / 1000;
    for (let y = 0; y < h; y++) {
      const dy = y - cy;
      const beta = (Math.PI * a * dy) / (lambda * 50 * (screenX - barrierX));
      const intensity = beta === 0 ? 1 : (Math.sin(beta) / beta) ** 2;
      const rgb = Math.floor(intensity * 255);
      ctx.fillStyle = `rgb(${rgb}, ${Math.floor(rgb * 0.8)}, ${Math.floor(rgb * 0.6)})`;
      ctx.fillRect(screenX + 8, y, 25, 1);
    }

    // Intensity graph overlay
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let y = 0; y < h; y++) {
      const dy = y - cy;
      const beta = (Math.PI * a * dy) / (lambda * 50 * (screenX - barrierX));
      const intensity = beta === 0 ? 1 : (Math.sin(beta) / beta) ** 2;
      const px = screenX + 40 + intensity * 60;
      if (y === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`عرض الشق: ${a}`, barrierX, 25);

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('a sinθ = mλ (الحد الأدنى)', w / 2, h - 20);
  }, [wavelength, slitWidth]);

  const drawNewtonRings = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const color = wavelengthToColor(wavelength);
    const lambda = wavelength;

    // Newton's rings
    const maxR = Math.min(w, h) / 2 - 40;
    for (let r = 1; r < 50; r++) {
      const ringR = Math.sqrt(r * lambda * 0.3);
      if (ringR > maxR) break;

      const intensity = (1 + Math.cos(r * Math.PI)) / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = intensity > 0.5 ? color : '#0f172a';
      ctx.lineWidth = Math.max(1, lambda * 0.01);
      ctx.stroke();
    }

    // Central dark spot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Labels
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('حلقات نيوتن', cx, 30);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`الطول الموجي: ${wavelength} nm`, cx, 50);
    ctx.fillText(`اللون: `, cx - 40, 70);
    ctx.fillStyle = color;
    ctx.fillText('■■■', cx + 10, 70);

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('rₙ = √(nλR)', cx, h - 20);
  }, [wavelength]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const animate = () => {
      if (isPlaying) timeRef.current += 0.016;
      const w = canvas.width;
      const h = canvas.height;
      if (activeTab === 'double-slit') drawDoubleSlit(ctx, w, h);
      else if (activeTab === 'single-slit') drawSingleSlit(ctx, w, h);
      else drawNewtonRings(ctx, w, h);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, isPlaying, drawDoubleSlit, drawSingleSlit, drawNewtonRings]);

  const formulas = [
    { name: 'تجربة يونج', formula: 'Δy = λL/d' },
    { name: 'حيود الشق الواحد', formula: 'a sinθ = mλ' },
    { name: 'حلقات نيوتن', formula: 'rₙ = √(nλR)' },
    { name: 'شرط التداخل البناء', formula: 'Δ = mλ (m = 0,1,2,...)' },
  ];

  const quizQuestions = [
    { question: 'في تجربة الشق المزدوج، ماذا يحدث عند زيادة المسافة بين الشقين؟', options: ['تقل المسافة بين الهدب', 'تزداد المسافة بين الهدب', 'لا تتغير', 'يختفي النمط'], correctIndex: 0 },
    { question: 'ما شرط الحد الأدنى في حيود الشق الواحد؟', options: ['a sinθ = mλ', 'a sinθ = (m+½)λ', 'd sinθ = mλ', 'θ = 0'], correctIndex: 0 },
    { question: 'لماذا تكون البقعة المركزية في حلقات نيوتن مظلمة؟', options: ['بسبب تغير الطور عند الانعكاس', 'بسبب الامتصاص', 'بسبب التشتت', 'بسبب الانكسار'], correctIndex: 0 },
  ];

  // Spectrum bar for wavelength
  const spectrumGradient = 'linear-gradient(to right, #7c3aed, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)';

  return (
    <SimulationLayout title="التداخل والحيود" titleGradient="from-indigo-400 to-pink-400" backgroundGradient="from-slate-900 via-indigo-900/30 to-slate-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="grid grid-cols-3 mb-4 bg-white/10">
          <TabsTrigger value="double-slit" className="text-xs"><Aperture className="w-3 h-3 ml-1" />الشق المزدوج</TabsTrigger>
          <TabsTrigger value="single-slit" className="text-xs"><CircleDot className="w-3 h-3 ml-1" />الشق الواحد</TabsTrigger>
          <TabsTrigger value="newton-rings" className="text-xs"><Waves className="w-3 h-3 ml-1" />حلقات نيوتن</TabsTrigger>
        </TabsList>

        <div className="bg-black/40 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <canvas ref={canvasRef} width={700} height={420} className="w-full rounded-lg" style={{ maxHeight: '420px' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="text-white/70 text-sm mb-2 block">الطول الموجي: {wavelength} nm</label>
            <div className="h-2 rounded-full mb-2" style={{ background: spectrumGradient }} />
            <Slider min={380} max={750} step={5} value={[wavelength]} onValueChange={([v]) => setWavelength(v)} />
          </div>
          {activeTab === 'double-slit' && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="text-white/70 text-sm mb-2 block">المسافة بين الشقين: {slitDistance}</label>
              <Slider min={20} max={100} step={5} value={[slitDistance]} onValueChange={([v]) => setSlitDistance(v)} />
            </div>
          )}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="text-white/70 text-sm mb-2 block">عرض الشق: {slitWidth}</label>
            <Slider min={3} max={30} step={1} value={[slitWidth]} onValueChange={([v]) => setSlitWidth(v)} />
          </div>
        </div>
      </Tabs>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoSection formulas={formulas} />
        <QuizSection questions={quizQuestions} />
      </div>
    </SimulationLayout>
  );
};

export default InterferenceDiffractionSimulation;
