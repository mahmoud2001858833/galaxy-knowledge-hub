import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const NuclearApplicationsSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('carbon-dating');
  const [halfLives, setHalfLives] = useState(0);
  const [time, setTime] = useState(0);

  const drawCarbonDating = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = Date.now() / 1000;
    const decayFraction = Math.pow(0.5, halfLives);
    const totalAtoms = 100;
    const remaining = Math.floor(totalAtoms * decayFraction);

    // Title
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('التأريخ بالكربون-14', w / 2, 25);

    // Atom grid
    const gridX = 50, gridY = 50, cols = 10, cellSize = 22;
    for (let i = 0; i < totalAtoms; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const x = gridX + col * cellSize + cellSize / 2;
      const y = gridY + row * cellSize + cellSize / 2;
      const isC14 = i < remaining;

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = isC14 ? '#22c55e' : '#475569';
      if (isC14) { ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 6; }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Legend
    ctx.fillStyle = '#22c55e';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`● C-14 (${remaining})`, w - 40, 70);
    ctx.fillStyle = '#475569';
    ctx.fillText(`● N-14 (${totalAtoms - remaining})`, w - 40, 90);

    // Decay curve
    const gx = 300, gy = 60, gw = 250, gh = 200;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(gx, gy, gw, gh);

    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = gx + (i / 100) * gw;
      const y = gy + gh - Math.pow(0.5, i / 20) * gh;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current position on curve
    const cx = gx + (halfLives / 5) * gw;
    const cy = gy + gh - decayFraction * gh;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Info
    ctx.fillStyle = '#fbbf24';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`عدد أنصاف الأعمار: ${halfLives.toFixed(1)}`, w / 2, h - 40);
    ctx.fillText(`العمر: ${(halfLives * 5730).toFixed(0)} سنة`, w / 2, h - 18);
  }, [halfLives]);

  const drawNuclearMedicine = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = Date.now() / 1000;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('الطب النووي', w / 2, 25);

    // Human body outline (simplified)
    const cx = w / 2, cy = h / 2 + 20;
    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - 100, 25, 0, Math.PI * 2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Body
    ctx.beginPath();
    ctx.moveTo(cx, cy - 75);
    ctx.lineTo(cx, cy + 40);
    ctx.moveTo(cx - 50, cy - 50);
    ctx.lineTo(cx + 50, cy - 50);
    ctx.moveTo(cx, cy + 40);
    ctx.lineTo(cx - 30, cy + 100);
    ctx.moveTo(cx, cy + 40);
    ctx.lineTo(cx + 30, cy + 100);
    ctx.stroke();

    // Radioactive tracer spots
    const spots = [
      { x: cx, y: cy - 100, label: 'مسح الدماغ', isotope: 'Tc-99m' },
      { x: cx - 15, y: cy - 35, label: 'مسح القلب', isotope: 'Tl-201' },
      { x: cx + 20, y: cy - 15, label: 'مسح الكبد', isotope: 'Tc-99m' },
      { x: cx, y: cy + 80, label: 'مسح العظام', isotope: 'Tc-99m' },
    ];

    spots.forEach((s, i) => {
      const pulse = Math.sin(t * 3 + i) * 5 + 10;
      ctx.beginPath();
      ctx.arc(s.x, s.y, pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34, 197, 94, ${0.3 + Math.sin(t * 3 + i) * 0.2})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Arial';
      ctx.textAlign = i < 2 ? 'right' : 'left';
      const labelX = i < 2 ? s.x - 25 : s.x + 25;
      ctx.fillText(s.label, labelX, s.y - 5);
      ctx.fillStyle = '#22c55e';
      ctx.fillText(s.isotope, labelX, s.y + 10);
    });
  }, []);

  const drawNuclearReactor = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = Date.now() / 1000;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('محطة الطاقة النووية', w / 2, 25);

    // Reactor vessel
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.roundRect(80, 100, 150, 200, 10);
    ctx.fill();
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fuel rods
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(100 + i * 25, 130, 8, 140);
      // Glow
      const glow = Math.sin(t * 4 + i) * 0.3 + 0.5;
      ctx.fillStyle = `rgba(251, 191, 36, ${glow})`;
      ctx.fillRect(95 + i * 25, 130, 18, 140);
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('قضبان الوقود', 155, 320);
    ctx.fillText('(يورانيوم-235)', 155, 335);

    // Steam generator
    ctx.fillStyle = '#1e40af';
    ctx.beginPath();
    ctx.roundRect(280, 120, 80, 160, 8);
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.stroke();

    // Pipes
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(230, 170);
    ctx.lineTo(280, 170);
    ctx.stroke();
    ctx.strokeStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(230, 250);
    ctx.lineTo(280, 250);
    ctx.stroke();

    // Turbine
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(430, 180, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.stroke();
    // Blades
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + t * 3;
      ctx.beginPath();
      ctx.moveTo(430, 180);
      ctx.lineTo(430 + Math.cos(a) * 35, 180 + Math.sin(a) * 35);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Arial';
    ctx.fillText('توربين', 430, 235);

    // Generator
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(490, 155, 60, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('⚡', 520, 185);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Arial';
    ctx.fillText('مولد', 520, 220);

    // Steam pipe
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(360, 170);
    ctx.lineTo(390, 170);
    ctx.stroke();

    // Steam particles
    for (let i = 0; i < 6; i++) {
      const sx = 340 + Math.sin(t * 2 + i) * 10;
      const sy = 100 - i * 12 - (t * 20 % 30);
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff20';
      ctx.fill();
    }

    // Energy output
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('طاقة كهربائية: ~1000 MW', w / 2, h - 20);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const cw = canvas.width, ch = canvas.height;
      if (activeTab === 'carbon-dating') drawCarbonDating(ctx, cw, ch);
      else if (activeTab === 'medicine') drawNuclearMedicine(ctx, cw, ch);
      else drawNuclearReactor(ctx, cw, ch);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawCarbonDating, drawNuclearMedicine, drawNuclearReactor]);

  const quizQuestions = [
    { question: 'ما هو عمر النصف للكربون-14؟', options: ['1000 سنة', '5730 سنة', '10000 سنة', '100000 سنة'], correctIndex: 1, explanation: 'عمر النصف للكربون-14 هو 5730 سنة، مما يجعله مناسباً لتأريخ المواد حتى ~50000 سنة.' },
    { question: 'ما النظير المستخدم في مسح القلب؟', options: ['I-131', 'Tl-201', 'Co-60', 'U-235'], correctIndex: 1, explanation: 'الثاليوم-201 يستخدم في التصوير القلبي لأنه يتراكم في عضلة القلب.' },
    { question: 'ما الوقود الرئيسي في المفاعلات النووية؟', options: ['الكربون-14', 'اليورانيوم-235', 'الكوبالت-60', 'الراديوم-226'], correctIndex: 1, explanation: 'اليورانيوم-235 هو النظير القابل للانشطار المستخدم في معظم المفاعلات النووية.' },
    { question: 'ما الفرق بين الانشطار والاندماج النووي؟', options: ['الانشطار يقسم نواة ثقيلة والاندماج يدمج أنوية خفيفة', 'لا فرق', 'الانشطار أسرع', 'الاندماج لا ينتج طاقة'], correctIndex: 0, explanation: 'الانشطار يقسم نواة ثقيلة (مثل U-235) إلى أنوية أخف، بينما الاندماج يدمج أنوية خفيفة (مثل الهيدروجين) لتكوين نواة أثقل.' },
    { question: 'ما أنواع الإشعاع النووي الثلاثة الرئيسية؟', options: ['ألفا وبيتا وغاما', 'أحمر وأخضر وأزرق', 'فوق بنفسجي وتحت أحمر وميكروويف', 'سيني وغاما وكوني'], correctIndex: 0, explanation: 'الأنواع الثلاثة هي: ألفا (نوى هيليوم)، بيتا (إلكترونات)، وغاما (فوتونات عالية الطاقة).' },
  ];

  return (
    <SimulationLayout title="الكيمياء النووية التطبيقية" titleGradient="from-green-400 to-yellow-400" backgroundGradient="from-slate-900 via-green-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 w-full">
              <TabsTrigger value="carbon-dating" className="flex-1 text-xs">التأريخ بالكربون</TabsTrigger>
              <TabsTrigger value="medicine" className="flex-1 text-xs">الطب النووي</TabsTrigger>
              <TabsTrigger value="reactor" className="flex-1 text-xs">المفاعل النووي</TabsTrigger>
            </TabsList>
          </Tabs>
          <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-xl border border-green-500/30 bg-slate-900" />
          {activeTab === 'carbon-dating' && (
            <div className="space-y-3 p-3 bg-slate-800/40 rounded-xl">
              <div>
                <label className="text-xs text-slate-400">عدد أنصاف الأعمار: {halfLives.toFixed(1)}</label>
                <Slider value={[halfLives]} onValueChange={v => setHalfLives(v[0])} min={0} max={5} step={0.1} className="mt-1" />
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'أنصاف الأعمار', value: halfLives, color: 'text-green-300' },
              { label: 'العمر المقدر', value: (halfLives * 5730).toFixed(0), unit: 'سنة', color: 'text-yellow-300' },
              { label: 'النسبة المتبقية', value: (Math.pow(0.5, halfLives) * 100).toFixed(1), unit: '%', color: 'text-cyan-300' },
            ]}
            formulas={[
              { name: 'قانون التحلل', formula: 'N(t) = N₀·(1/2)^(t/t½)', description: 'كمية المادة المتبقية بعد زمن t' },
            ]}
            explanation="الكيمياء النووية التطبيقية تستخدم النظائر المشعة في التأريخ الأثري والطب والطاقة. التحلل الإشعاعي عملية طبيعية تتحول فيها الأنوية غير المستقرة إلى أنوية أكثر استقراراً."
            facts={[
              'التأريخ بالكربون-14 اكتشفه ويلارد ليبي عام 1949 وحاز على نوبل',
              'النظائر المشعة تستخدم في علاج السرطان بتدمير الخلايا السرطانية',
              'المفاعلات النووية تنتج ~10% من الكهرباء العالمية بدون انبعاثات CO₂',
              'كارثة تشيرنوبيل (1986) وفوكوشيما (2011) أبرز حوادث المفاعلات النووية',
            ]}
          />
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default NuclearApplicationsSimulation;
