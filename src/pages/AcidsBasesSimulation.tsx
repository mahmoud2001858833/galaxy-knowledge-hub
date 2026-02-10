import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const AcidsBasesSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [activeTab, setActiveTab] = useState('ph-scale');
  const [ph, setPh] = useState(7);
  const [acidVolume, setAcidVolume] = useState(0);
  const [baseVolume, setBaseVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(true);

  const getPhColor = (val: number): string => {
    if (val <= 2) return '#ef4444';
    if (val <= 4) return '#f97316';
    if (val <= 6) return '#eab308';
    if (val <= 8) return '#22c55e';
    if (val <= 10) return '#3b82f6';
    if (val <= 12) return '#6366f1';
    return '#7c3aed';
  };

  const drawPhScale = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // pH scale bar
    const barX = 60, barY = 60, barW = w - 120, barH = 50;
    for (let i = 0; i <= 14; i++) {
      const x = barX + (i / 14) * barW;
      const sw = barW / 14;
      ctx.fillStyle = getPhColor(i);
      ctx.fillRect(x, barY, sw + 1, barH);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(String(i), x + sw / 2, barY + barH + 20);
    }

    // Labels
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('حمضي', barX + barW * 0.15, barY - 10);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('متعادل', barX + barW * 0.5, barY - 10);
    ctx.fillStyle = '#6366f1';
    ctx.fillText('قاعدي', barX + barW * 0.85, barY - 10);

    // Current pH indicator
    const indicatorX = barX + (ph / 14) * barW;
    ctx.beginPath();
    ctx.moveTo(indicatorX, barY - 5);
    ctx.lineTo(indicatorX - 10, barY - 25);
    ctx.lineTo(indicatorX + 10, barY - 25);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px Arial';
    ctx.fillText(ph.toFixed(1), indicatorX, barY - 12);

    // Beaker with solution
    const bx = w / 2 - 80, by = 160, bw = 160, bh = 180;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by + bh);
    ctx.lineTo(bx + bw, by + bh);
    ctx.lineTo(bx + bw, by);
    ctx.stroke();

    // Solution
    const solColor = getPhColor(ph);
    const solGrad = ctx.createLinearGradient(bx, by + 30, bx, by + bh);
    solGrad.addColorStop(0, solColor + '60');
    solGrad.addColorStop(1, solColor + 'cc');
    ctx.fillStyle = solGrad;
    ctx.fillRect(bx + 2, by + 30, bw - 4, bh - 32);

    // Bubbles
    const time = Date.now() / 1000;
    if (ph < 3 || ph > 11) {
      for (let i = 0; i < 8; i++) {
        const bub = ((time * 30 + i * 40) % (bh - 40));
        ctx.beginPath();
        ctx.arc(bx + 20 + Math.sin(time + i) * 10 + (i % 4) * 35, by + bh - 10 - bub, 3 + Math.sin(time * 2 + i) * 1, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff30';
        ctx.fill();
      }
    }

    // pH value display
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`pH = ${ph.toFixed(1)}`, w / 2, h - 25);

    // Examples
    const examples: Record<string, { name: string; ph: number }[]> = {
      acids: [
        { name: 'حمض المعدة', ph: 1.5 }, { name: 'عصير الليمون', ph: 2 },
        { name: 'الخل', ph: 3 }, { name: 'القهوة', ph: 5 },
      ],
      bases: [
        { name: 'صابون', ph: 10 }, { name: 'مبيض', ph: 12.5 },
        { name: 'بيكربونات الصوديوم', ph: 8.5 }, { name: 'الأمونيا', ph: 11 },
      ],
    };

    ctx.font = '10px Arial';
    ctx.fillStyle = '#94a3b8';
    let yPos = by + 10;
    examples.acids.forEach(ex => {
      const ex_x = barX + (ex.ph / 14) * barW;
      ctx.fillStyle = getPhColor(ex.ph);
      ctx.beginPath();
      ctx.arc(ex_x, barY + barH + 40, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(ex.name, ex_x, barY + barH + 55);
    });
  }, [ph]);

  const drawTitration = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Burette
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(w / 2 - 15, 30, 30, 120);
    ctx.stroke();
    // Burette liquid
    const buretteLevel = (50 - acidVolume) / 50;
    ctx.fillStyle = '#ef444480';
    ctx.fillRect(w / 2 - 13, 32 + (1 - buretteLevel) * 116, 26, buretteLevel * 116);

    // Drip
    if (isPlaying && acidVolume < 50) {
      const time = Date.now() / 500;
      const dripY = 150 + (time % 1) * 80;
      if (dripY < 230) {
        ctx.beginPath();
        ctx.ellipse(w / 2, dripY, 3, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      }
    }

    // Flask
    const fx = w / 2 - 60, fy = 230, fw = 120, fh = 130;
    ctx.beginPath();
    ctx.moveTo(fx + 30, fy);
    ctx.lineTo(fx, fy + fh);
    ctx.lineTo(fx + fw, fy + fh);
    ctx.lineTo(fx + fw - 30, fy);
    ctx.strokeStyle = '#64748b';
    ctx.stroke();

    // Flask solution
    const mixPh = baseVolume > 0 ? 14 - (acidVolume / baseVolume) * 7 : 7;
    const clampedPh = Math.max(0, Math.min(14, mixPh));
    ctx.fillStyle = getPhColor(clampedPh) + '90';
    ctx.beginPath();
    const fillLevel = 0.7;
    const topY = fy + fh * (1 - fillLevel);
    const topW = fw - 60 * (1 - fillLevel);
    ctx.moveTo(w / 2 - topW / 2, topY);
    ctx.lineTo(fx + 5, fy + fh - 2);
    ctx.lineTo(fx + fw - 5, fy + fh - 2);
    ctx.lineTo(w / 2 + topW / 2, topY);
    ctx.closePath();
    ctx.fill();

    // Titration curve (right side)
    const graphX = w - 200, graphY = 50, graphW = 170, graphH = 300;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphW, graphH);

    // Draw titration curve
    ctx.beginPath();
    ctx.moveTo(graphX, graphY + graphH - 20);
    for (let v = 0; v <= 50; v++) {
      const x = graphX + (v / 50) * graphW;
      let y_ph;
      if (v < 24) y_ph = 2 + v * 0.2;
      else if (v < 26) y_ph = 7 + (v - 25) * 5;
      else y_ph = 12 + (v - 26) * 0.05;
      y_ph = Math.min(14, Math.max(0, y_ph));
      const y = graphY + graphH - (y_ph / 14) * graphH;
      if (v === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current point
    const curX = graphX + (acidVolume / 50) * graphW;
    let curPh;
    if (acidVolume < 24) curPh = 2 + acidVolume * 0.2;
    else if (acidVolume < 26) curPh = 7 + (acidVolume - 25) * 5;
    else curPh = 12 + (acidVolume - 26) * 0.05;
    curPh = Math.min(14, Math.max(0, curPh));
    const curY = graphY + graphH - (curPh / 14) * graphH;
    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('حجم الحمض (mL)', graphX + graphW / 2, graphY + graphH + 20);
    ctx.fillText('منحنى المعايرة', graphX + graphW / 2, graphY - 5);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`pH = ${clampedPh.toFixed(1)}`, w / 2, h - 15);
  }, [acidVolume, baseVolume, isPlaying]);

  const drawBufferSolutions = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('المحاليل المنظمة (Buffer Solutions)', w / 2, 30);

    const time = Date.now() / 1000;

    // Two beakers comparison
    const beakers = [
      { label: 'ماء عادي', x: w * 0.25, ph: 7 + Math.sin(time) * 3, color: '#3b82f6' },
      { label: 'محلول منظم', x: w * 0.75, ph: 7 + Math.sin(time) * 0.3, color: '#22c55e' },
    ];

    beakers.forEach(b => {
      const bx = b.x - 60, by = 80, bw = 120, bh = 150;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      ctx.fillStyle = getPhColor(b.ph) + '80';
      ctx.fillRect(bx + 2, by + 30, bw - 4, bh - 32);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x, by - 8);
      ctx.fillText(`pH = ${b.ph.toFixed(1)}`, b.x, by + bh + 20);
    });

    // Explanation
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('عند إضافة حمض أو قاعدة:', w / 2, 280);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('الماء العادي: يتغير pH بشكل كبير', w / 2, 305);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('المحلول المنظم: يحافظ على pH ثابت تقريباً', w / 2, 325);

    // Henderson-Hasselbalch
    ctx.fillStyle = '#fbbf24';
    ctx.font = '14px monospace';
    ctx.fillText('pH = pKa + log([A⁻]/[HA])', w / 2, 365);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Arial';
    ctx.fillText('معادلة هندرسون-هاسلبالخ', w / 2, 385);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      if (activeTab === 'ph-scale') drawPhScale(ctx, w, h);
      else if (activeTab === 'titration') drawTitration(ctx, w, h);
      else drawBufferSolutions(ctx, w, h);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawPhScale, drawTitration, drawBufferSolutions]);

  const quizQuestions = [
    { question: 'ما قيمة pH الماء النقي؟', options: ['0', '5', '7', '14'], correctIndex: 2, explanation: 'الماء النقي متعادل وله pH = 7 حيث تركيز H⁺ يساوي تركيز OH⁻.' },
    { question: 'أي من التالي حمض قوي؟', options: ['حمض الأسيتيك', 'حمض الهيدروكلوريك', 'حمض الكربونيك', 'حمض الستريك'], correctIndex: 1, explanation: 'HCl حمض قوي يتأين بالكامل في الماء، بينما البقية أحماض ضعيفة.' },
    { question: 'ما وظيفة المحلول المنظم؟', options: ['تسريع التفاعل', 'مقاومة تغير pH', 'زيادة الحموضة', 'تقليل القاعدية'], correctIndex: 1, explanation: 'المحلول المنظم يقاوم التغير في pH عند إضافة كميات صغيرة من حمض أو قاعدة.' },
  ];

  return (
    <SimulationLayout title="الأحماض والقواعد" titleGradient="from-yellow-400 to-red-400" backgroundGradient="from-slate-900 via-red-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 w-full">
              <TabsTrigger value="ph-scale" className="flex-1 text-xs">مقياس pH</TabsTrigger>
              <TabsTrigger value="titration" className="flex-1 text-xs">المعايرة</TabsTrigger>
              <TabsTrigger value="buffer" className="flex-1 text-xs">المحاليل المنظمة</TabsTrigger>
            </TabsList>
          </Tabs>
          <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-xl border border-yellow-500/30 bg-slate-900" />
          <div className="space-y-3 p-3 bg-slate-800/40 rounded-xl">
            {activeTab === 'ph-scale' && (
              <div>
                <label className="text-xs text-slate-400">قيمة pH: {ph.toFixed(1)}</label>
                <Slider value={[ph]} onValueChange={v => setPh(v[0])} min={0} max={14} step={0.1} className="mt-1" />
              </div>
            )}
            {activeTab === 'titration' && (
              <div>
                <label className="text-xs text-slate-400">حجم الحمض المضاف: {acidVolume} mL</label>
                <Slider value={[acidVolume]} onValueChange={v => setAcidVolume(v[0])} min={0} max={50} step={1} className="mt-1" />
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'pH', value: activeTab === 'titration' ? Math.max(0, Math.min(14, 14 - (acidVolume / baseVolume) * 7)) : ph, color: 'text-yellow-300' },
              { label: 'تركيز H⁺', value: `10⁻${ph.toFixed(0)}`, unit: 'M', color: 'text-red-300' },
              { label: 'الطبيعة', value: ph < 7 ? 'حمضي' : ph > 7 ? 'قاعدي' : 'متعادل', color: ph < 7 ? 'text-red-300' : ph > 7 ? 'text-blue-300' : 'text-green-300' },
            ]}
            formulas={[
              { name: 'تعريف pH', formula: 'pH = -log[H⁺]', description: 'اللوغاريتم السالب لتركيز أيونات الهيدروجين' },
              { name: 'العلاقة التكاملية', formula: 'pH + pOH = 14', description: 'عند 25°C' },
            ]}
            facts={[
              'دم الإنسان محلول منظم بـ pH ≈ 7.4',
              'المطر الحمضي له pH أقل من 5.6',
              'حمض المعدة (HCl) له pH حوالي 1.5-3.5',
            ]}
          />
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default AcidsBasesSimulation;
