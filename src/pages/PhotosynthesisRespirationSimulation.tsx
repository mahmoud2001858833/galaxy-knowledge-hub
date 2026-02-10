import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const PhotosynthesisRespirationSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('photosynthesis');
  const [lightIntensity, setLightIntensity] = useState(70);

  const drawPhotosynthesis = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    const t = Date.now() / 1000;

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('البناء الضوئي', w / 2, 25);

    // Sun
    const sunBright = lightIntensity / 100;
    ctx.beginPath();
    ctx.arc(80, 60, 30, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251, 191, 36, ${sunBright})`;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 20 * sunBright;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Sun rays
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + t * 0.5;
      ctx.beginPath();
      ctx.moveTo(80 + Math.cos(a) * 35, 60 + Math.sin(a) * 35);
      ctx.lineTo(80 + Math.cos(a) * 50, 60 + Math.sin(a) * 50);
      ctx.strokeStyle = `rgba(251, 191, 36, ${sunBright * 0.5})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Light arrows to leaf
    const arrowCount = Math.floor(lightIntensity / 15);
    for (let i = 0; i < arrowCount; i++) {
      const progress = (t * 0.5 + i * 0.3) % 1;
      const sx = 120 + progress * 100, sy = 80 + progress * 60;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(251, 191, 36, ${(1 - progress) * sunBright})`;
      ctx.fill();
    }

    // Leaf (chloroplast)
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, 140, 80, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#16a34a30';
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Thylakoid stacks (grana)
    for (let g = 0; g < 3; g++) {
      const gx = w / 2 - 80 + g * 80;
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = `hsl(${140 + i * 5}, 70%, ${30 + Math.sin(t * 2 + g + i) * 10}%)`;
        ctx.beginPath();
        ctx.roundRect(gx - 20, h / 2 - 25 + i * 14, 40, 10, 3);
        ctx.fill();
      }
    }

    // Inputs & Outputs
    // CO2 input (left)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CO₂', 50, h / 2);
    for (let i = 0; i < 3; i++) {
      const px = 80 + ((t * 30 + i * 30) % 100);
      ctx.beginPath();
      ctx.arc(px, h / 2 + Math.sin(t + i) * 5, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b860';
      ctx.fill();
    }

    // H2O input (bottom)
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('H₂O', w / 2, h / 2 + 110);
    for (let i = 0; i < 3; i++) {
      const py = h / 2 + 90 - ((t * 20 + i * 20) % 60);
      ctx.beginPath();
      ctx.arc(w / 2 + Math.sin(t + i) * 10, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f660';
      ctx.fill();
    }

    // O2 output (right)
    ctx.fillStyle = '#22c55e';
    ctx.fillText('O₂', w - 50, h / 2);
    for (let i = 0; i < 3; i++) {
      const px = w - 80 - ((t * 25 + i * 25) % 80);
      ctx.beginPath();
      ctx.arc(px, h / 2 + Math.sin(t * 1.5 + i) * 8, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e60';
      ctx.fill();
    }

    // Glucose output (top)
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('C₆H₁₂O₆ (جلوكوز)', w / 2, h / 2 - 100);

    // Equation
    ctx.fillStyle = '#fbbf24';
    ctx.font = '13px monospace';
    ctx.fillText('6CO₂ + 6H₂O + ضوء → C₆H₁₂O₆ + 6O₂', w / 2, h - 25);
  }, [lightIntensity, isPlaying]);

  const drawRespiration = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    const t = Date.now() / 1000;

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('التنفس الخلوي', w / 2, 25);

    // Mitochondria
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, 150, 80, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ef444420';
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner membrane folds (cristae)
    for (let i = 0; i < 5; i++) {
      const fx = w / 2 - 100 + i * 50;
      ctx.beginPath();
      ctx.moveTo(fx, h / 2 + 30);
      ctx.quadraticCurveTo(fx + 10, h / 2 - 20, fx + 25, h / 2 + 30);
      ctx.strokeStyle = '#f8717180';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Stages boxes
    const stages = [
      { name: 'تحلل الجلوكوز', x: 80, y: 60, atp: '2 ATP', color: '#f59e0b' },
      { name: 'دورة كربس', x: w / 2, y: 60, atp: '2 ATP', color: '#22c55e' },
      { name: 'سلسلة نقل الإلكترون', x: w - 80, y: 60, atp: '34 ATP', color: '#3b82f6' },
    ];

    stages.forEach((s, i) => {
      const pulse = Math.sin(t * 2 + i) * 3;
      ctx.fillStyle = s.color + '20';
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(s.x - 55, s.y - 15 + pulse, 110, 35, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, s.x, s.y + 5 + pulse);
      ctx.fillStyle = s.color;
      ctx.font = 'bold 10px Arial';
      ctx.fillText(s.atp, s.x, s.y + 20 + pulse);

      // Arrow to next
      if (i < 2) {
        ctx.beginPath();
        ctx.moveTo(s.x + 60, s.y + pulse);
        ctx.lineTo(stages[i + 1].x - 60, stages[i + 1].y + pulse);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // ATP particles
    for (let i = 0; i < 6; i++) {
      const angle = t * 1.5 + i * 1;
      const ax = w / 2 + Math.cos(angle) * 100;
      const ay = h / 2 + Math.sin(angle) * 40;
      ctx.beginPath();
      ctx.arc(ax, ay, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000';
      ctx.font = 'bold 6px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ATP', ax, ay + 2);
    }

    // Inputs/Outputs
    ctx.fillStyle = '#f59e0b';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('C₆H₁₂O₆ →', 50, h / 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('O₂ →', 50, h / 2 + 25);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('← CO₂', w - 50, h / 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('← H₂O', w - 50, h / 2 + 25);

    // Total ATP
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('إجمالي ATP = 38', w / 2, h - 40);

    ctx.fillStyle = '#f87171';
    ctx.font = '13px monospace';
    ctx.fillText('C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38ATP', w / 2, h - 15);
  }, []);

  const drawComparison = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('مقارنة البناء الضوئي والتنفس الخلوي', w / 2, 25);

    const rows = [
      ['', 'البناء الضوئي', 'التنفس الخلوي'],
      ['الموقع', 'البلاستيدات الخضراء', 'الميتوكوندريا'],
      ['المتفاعلات', 'CO₂ + H₂O + ضوء', 'C₆H₁₂O₆ + O₂'],
      ['النواتج', 'C₆H₁₂O₆ + O₂', 'CO₂ + H₂O + ATP'],
      ['الطاقة', 'تمتص الطاقة الضوئية', 'تحرر الطاقة الكيميائية'],
      ['الوقت', 'أثناء النهار فقط', 'طوال الوقت'],
    ];

    const colW = (w - 80) / 3;
    const rowH = 50;
    const startY = 55;

    rows.forEach((row, ri) => {
      row.forEach((cell, ci) => {
        const x = 40 + ci * colW;
        const y = startY + ri * rowH;

        if (ri === 0) {
          ctx.fillStyle = ci === 1 ? '#22c55e30' : ci === 2 ? '#ef444430' : '#33415530';
        } else {
          ctx.fillStyle = ri % 2 === 0 ? '#1e293b' : '#1e293b80';
        }
        ctx.fillRect(x, y, colW, rowH);
        ctx.strokeStyle = '#33415560';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, colW, rowH);

        ctx.fillStyle = ri === 0 ? (ci === 1 ? '#22c55e' : ci === 2 ? '#ef4444' : '#94a3b8') : '#e2e8f0';
        ctx.font = ri === 0 ? 'bold 12px Arial' : '11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cell, x + colW / 2, y + rowH / 2);
      });
    });
    ctx.textBaseline = 'alphabetic';

    // Cycle arrow showing relationship
    const cy = startY + rows.length * rowH + 30;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('↺ العمليتان مترابطتان: نواتج إحداهما متفاعلات الأخرى', w / 2, cy);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const cw = canvas.width, ch = canvas.height;
      if (activeTab === 'photosynthesis') drawPhotosynthesis(ctx, cw, ch);
      else if (activeTab === 'respiration') drawRespiration(ctx, cw, ch);
      else drawComparison(ctx, cw, ch);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawPhotosynthesis, drawRespiration, drawComparison]);

  const quizQuestions = [
    { question: 'أين يحدث البناء الضوئي؟', options: ['الميتوكوندريا', 'النواة', 'البلاستيدات الخضراء', 'الرايبوسومات'], correctIndex: 2, explanation: 'البناء الضوئي يحدث في البلاستيدات الخضراء التي تحتوي على الكلوروفيل.' },
    { question: 'كم جزيء ATP ينتج من التنفس الخلوي الهوائي؟', options: ['2', '12', '36-38', '100'], correctIndex: 2, explanation: 'التنفس الخلوي الهوائي الكامل ينتج 36-38 جزيء ATP من جزيء جلوكوز واحد.' },
    { question: 'ما العلاقة بين البناء الضوئي والتنفس الخلوي؟', options: ['متعاكسان', 'متماثلان', 'لا علاقة بينهما', 'يحدثان معاً'], correctIndex: 0, explanation: 'البناء الضوئي والتنفس الخلوي عمليتان متعاكستان: نواتج إحداهما هي متفاعلات الأخرى.' },
  ];

  return (
    <SimulationLayout title="التمثيل الضوئي والتنفس" titleGradient="from-green-400 to-yellow-400" backgroundGradient="from-slate-900 via-emerald-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 w-full">
              <TabsTrigger value="photosynthesis" className="flex-1 text-xs">البناء الضوئي</TabsTrigger>
              <TabsTrigger value="respiration" className="flex-1 text-xs">التنفس الخلوي</TabsTrigger>
              <TabsTrigger value="comparison" className="flex-1 text-xs">مقارنة</TabsTrigger>
            </TabsList>
          </Tabs>
          <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-xl border border-emerald-500/30 bg-slate-900" />
          {activeTab === 'photosynthesis' && (
            <div className="p-3 bg-slate-800/40 rounded-xl">
              <label className="text-xs text-slate-400">شدة الإضاءة: {lightIntensity}%</label>
              <Slider value={[lightIntensity]} onValueChange={v => setLightIntensity(v[0])} min={0} max={100} step={5} className="mt-1" />
            </div>
          )}
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'شدة الإضاءة', value: lightIntensity, unit: '%', color: 'text-yellow-300' },
              { label: 'معدل البناء الضوئي', value: (lightIntensity * 0.8).toFixed(0), unit: '%', color: 'text-green-300' },
            ]}
            formulas={[
              { name: 'البناء الضوئي', formula: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', description: 'بوجود الضوء والكلوروفيل' },
              { name: 'التنفس الخلوي', formula: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP' },
            ]}
            facts={[
              'النباتات تنتج أكثر من 50% من الأكسجين على الأرض',
              'الطحالب البحرية مسؤولة عن معظم الباقي',
              'بدون البناء الضوئي لن تكون هناك حياة على الأرض',
            ]}
          />
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default PhotosynthesisRespirationSimulation;
