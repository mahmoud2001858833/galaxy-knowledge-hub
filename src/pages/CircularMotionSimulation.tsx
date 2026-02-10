import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Circle, Globe, Orbit } from 'lucide-react';
import { InfoSection, QuizSection } from '@/components/simulations';

const CircularMotionSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('uniform');
  const [radius, setRadius] = useState(120);
  const [angularSpeed, setAngularSpeed] = useState(2);
  const [mass, setMass] = useState(1);
  const timeRef = useRef(0);

  const drawUniform = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2 - 50;
    const cy = h / 2;
    const t = timeRef.current;

    // Orbit path
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center point
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();

    // Object position
    const angle = t * angularSpeed;
    const ox = cx + Math.cos(angle) * radius;
    const oy = cy + Math.sin(angle) * radius;

    // String/tether
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ox, oy);
    ctx.stroke();

    // Velocity vector (tangential)
    const vLen = angularSpeed * radius * 0.3;
    const vx = -Math.sin(angle) * vLen;
    const vy = Math.cos(angle) * vLen;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + vx, oy + vy);
    ctx.stroke();
    // Arrow
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    const vAngle = Math.atan2(vy, vx);
    ctx.moveTo(ox + vx + Math.cos(vAngle) * 8, oy + vy + Math.sin(vAngle) * 8);
    ctx.lineTo(ox + vx + Math.cos(vAngle + 2.5) * 8, oy + vy + Math.sin(vAngle + 2.5) * 8);
    ctx.lineTo(ox + vx + Math.cos(vAngle - 2.5) * 8, oy + vy + Math.sin(vAngle - 2.5) * 8);
    ctx.fill();

    // Centripetal acceleration (toward center)
    const aLen = angularSpeed * angularSpeed * radius * 0.15;
    const ax = (cx - ox) / radius * aLen;
    const ay = (cy - oy) / radius * aLen;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + ax, oy + ay);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    const aAngle = Math.atan2(ay, ax);
    ctx.moveTo(ox + ax + Math.cos(aAngle) * 8, oy + ay + Math.sin(aAngle) * 8);
    ctx.lineTo(ox + ax + Math.cos(aAngle + 2.5) * 8, oy + ay + Math.sin(aAngle + 2.5) * 8);
    ctx.lineTo(ox + ax + Math.cos(aAngle - 2.5) * 8, oy + ay + Math.sin(aAngle - 2.5) * 8);
    ctx.fill();

    // Object
    ctx.beginPath();
    ctx.arc(ox, oy, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Legend
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('● السرعة الخطية (v)', w - 20, 30);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('● التسارع المركزي (ac)', w - 20, 50);

    // Values
    const v = angularSpeed * radius;
    const ac = angularSpeed * angularSpeed * radius;
    const Fc = mass * ac;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`ω = ${angularSpeed.toFixed(1)} rad/s`, w - 20, 90);
    ctx.fillText(`v = ${(v / 100).toFixed(2)} m/s`, w - 20, 110);
    ctx.fillText(`ac = ${(ac / 100).toFixed(2)} m/s²`, w - 20, 130);
    ctx.fillText(`Fc = ${(Fc / 100).toFixed(2)} N`, w - 20, 150);
    ctx.fillText(`T = ${(2 * Math.PI / angularSpeed).toFixed(2)} s`, w - 20, 170);
  }, [radius, angularSpeed, mass]);

  const drawSatellite = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const t = timeRef.current;

    // Earth
    const earthR = 50;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, earthR);
    gradient.addColorStop(0, '#1e40af');
    gradient.addColorStop(0.7, '#1d4ed8');
    gradient.addColorStop(1, '#1e3a5f');
    ctx.beginPath();
    ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    // Atmosphere glow
    ctx.beginPath();
    ctx.arc(cx, cy, earthR + 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(59,130,246,0.3)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Orbits
    const orbits = [
      { r: 90, speed: 3, color: '#f97316', label: 'LEO' },
      { r: 130, speed: 1.5, color: '#22c55e', label: 'MEO' },
      { r: 175, speed: 0.7, color: '#a855f7', label: 'GEO' },
    ];

    orbits.forEach(orbit => {
      // Path
      ctx.strokeStyle = `${orbit.color}33`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(cx, cy, orbit.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Satellite
      const angle = t * orbit.speed;
      const sx = cx + Math.cos(angle) * orbit.r;
      const sy = cy + Math.sin(angle) * orbit.r;

      // Trail
      ctx.strokeStyle = `${orbit.color}44`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 30; i++) {
        const ta = angle - i * 0.05;
        const tx = cx + Math.cos(ta) * orbit.r;
        const ty = cy + Math.sin(ta) * orbit.r;
        if (i === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = orbit.color;
      ctx.fill();
      ctx.shadowColor = orbit.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = orbit.color;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(orbit.label, sx, sy - 12);
    });

    // Info
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('v = √(GM/r)', cx, h - 40);
    ctx.fillText('كلما زاد نصف القطر، قلت السرعة المدارية', cx, h - 20);
  }, []);

  const drawNonUniform = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 30;
    const t = timeRef.current;
    const r = radius;

    // Vertical circle (like roller coaster)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Track rails
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
    ctx.stroke();

    // Speed varies with height (energy conservation)
    const angle = t * angularSpeed;
    const speed = Math.sqrt(Math.max(0.5, angularSpeed * angularSpeed + 2 * 9.8 * (1 + Math.sin(angle)) / 100));
    const ox = cx + Math.cos(angle) * r;
    const oy = cy + Math.sin(angle) * r;

    // Object
    ctx.beginPath();
    ctx.arc(ox, oy, 14, 0, Math.PI * 2);
    const speedColor = `hsl(${120 - speed * 15}, 100%, 50%)`;
    ctx.fillStyle = speedColor;
    ctx.fill();
    ctx.shadowColor = speedColor;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Weight vector (always down)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, oy + 40);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('mg', ox + 15, oy + 50);

    // Normal force
    const nx = (cx - ox) / r * 30;
    const ny = (cy - oy) / r * 30;
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + nx, oy + ny);
    ctx.stroke();
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('N', ox + nx + 10, oy + ny);

    // Position labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('أعلى نقطة', cx, cy - r - 20);
    ctx.fillText('أسفل نقطة', cx, cy + r + 30);
    ctx.fillText('السرعة تتغير مع الارتفاع', cx, 30);

    // Speed indicator
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`v = ${speed.toFixed(2)} m/s`, w - 20, 30);
  }, [radius, angularSpeed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const animate = () => {
      if (isPlaying) timeRef.current += 0.016;
      const w = canvas.width;
      const h = canvas.height;
      if (activeTab === 'uniform') drawUniform(ctx, w, h);
      else if (activeTab === 'satellite') drawSatellite(ctx, w, h);
      else drawNonUniform(ctx, w, h);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, isPlaying, drawUniform, drawSatellite, drawNonUniform]);

  const formulas = [
    { name: 'القوة المركزية', formula: 'Fc = mv²/r = mω²r' },
    { name: 'السرعة الخطية', formula: 'v = ωr' },
    { name: 'الدور', formula: 'T = 2π/ω' },
    { name: 'السرعة المدارية', formula: 'v = √(GM/r)' },
  ];

  const quizQuestions = [
    { question: 'ما اتجاه التسارع المركزي؟', options: ['نحو المركز', 'بعيداً عن المركز', 'مماسي للمسار', 'عمودي على المستوى'], correctIndex: 0 },
    { question: 'إذا تضاعف نصف القطر مع بقاء السرعة الزاوية ثابتة:', options: ['تتضاعف القوة المركزية', 'تنقص القوة للنصف', 'تبقى ثابتة', 'تتضاعف أربع مرات'], correctIndex: 0 },
    { question: 'في الحركة الدائرية غير المنتظمة:', options: ['السرعة تتغير مع الموقع', 'السرعة ثابتة', 'لا توجد قوة مركزية', 'التسارع صفر'], correctIndex: 0 },
  ];

  return (
    <SimulationLayout title="الحركة الدائرية والجاذبية" titleGradient="from-violet-400 to-purple-400" backgroundGradient="from-slate-900 via-violet-900/30 to-slate-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="grid grid-cols-3 mb-4 bg-white/10">
          <TabsTrigger value="uniform" className="text-xs"><Circle className="w-3 h-3 ml-1" />حركة دائرية منتظمة</TabsTrigger>
          <TabsTrigger value="satellite" className="text-xs"><Globe className="w-3 h-3 ml-1" />الأقمار الصناعية</TabsTrigger>
          <TabsTrigger value="non-uniform" className="text-xs"><Orbit className="w-3 h-3 ml-1" />حركة غير منتظمة</TabsTrigger>
        </TabsList>

        <div className="bg-black/40 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <canvas ref={canvasRef} width={700} height={420} className="w-full rounded-lg" style={{ maxHeight: '420px' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="text-white/70 text-sm mb-2 block">نصف القطر: {radius} px</label>
            <Slider min={60} max={180} step={5} value={[radius]} onValueChange={([v]) => setRadius(v)} />
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="text-white/70 text-sm mb-2 block">السرعة الزاوية: {angularSpeed.toFixed(1)} rad/s</label>
            <Slider min={0.5} max={5} step={0.1} value={[angularSpeed]} onValueChange={([v]) => setAngularSpeed(v)} />
          </div>
          <div className="flex gap-2 items-end">
            <Button onClick={() => setIsPlaying(!isPlaying)} variant="outline" className="bg-white/10 border-white/20 text-white">
              {isPlaying ? <Pause className="w-4 h-4 ml-1" /> : <Play className="w-4 h-4 ml-1" />}
              {isPlaying ? 'إيقاف' : 'تشغيل'}
            </Button>
            <Button onClick={() => { timeRef.current = 0; }} variant="outline" className="bg-white/10 border-white/20 text-white">
              <RotateCcw className="w-4 h-4 ml-1" />إعادة
            </Button>
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

export default CircularMotionSimulation;
