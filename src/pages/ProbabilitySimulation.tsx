import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, RotateCcw, Dice1 } from 'lucide-react';

type SimMode = 'dice' | 'coin' | 'normal';

const ProbabilitySimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [mode, setMode] = useState<SimMode>('dice');
  const [trials, setTrials] = useState(100);
  const [results, setResults] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const resultsRef = useRef<number[]>([]);

  const runExperiment = useCallback(() => {
    setIsRunning(true);
    const newResults: number[] = [];
    if (mode === 'dice') {
      for (let i = 0; i < trials; i++) newResults.push(Math.floor(Math.random() * 6) + 1);
    } else if (mode === 'coin') {
      for (let i = 0; i < trials; i++) newResults.push(Math.random() < 0.5 ? 0 : 1);
    } else {
      // Box-Muller for normal distribution
      for (let i = 0; i < trials; i++) {
        const u1 = Math.random(), u2 = Math.random();
        newResults.push(Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2));
      }
    }
    resultsRef.current = newResults;
    setResults(newResults);
    setIsRunning(false);
  }, [mode, trials]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width / 2, H = canvas.height / 2;
    ctx.clearRect(0, 0, W * 2, H * 2);
    ctx.save();

    const data = resultsRef.current;
    if (data.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('اضغط "تشغيل التجربة" للبدء', W, H);
      ctx.restore();
      return;
    }

    const margin = 50;
    const chartW = W - margin * 2;
    const chartH = H - margin * 2;

    if (mode === 'dice') {
      const counts = [0,0,0,0,0,0];
      data.forEach(d => counts[d - 1]++);
      const max = Math.max(...counts, 1);
      const barW = chartW / 6;
      counts.forEach((c, i) => {
        const barH = (c / max) * chartH;
        const x = margin + i * barW;
        const y = margin + chartH - barH;
        const gradient = ctx.createLinearGradient(x, y, x, y + barH);
        gradient.addColorStop(0, `hsl(${i * 60}, 70%, 60%)`);
        gradient.addColorStop(1, `hsl(${i * 60}, 70%, 40%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 5, y, barW - 10, barH);
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${i + 1}`, x + barW / 2, margin + chartH + 20);
        ctx.fillText(`${c}`, x + barW / 2, y - 5);
      });
    } else if (mode === 'coin') {
      const heads = data.filter(d => d === 1).length;
      const tails = data.length - heads;
      // Pie chart
      const cx = W, cy = H;
      const r = Math.min(chartW, chartH) / 2.5;
      const headAngle = (heads / data.length) * 2 * Math.PI;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, 0, headAngle);
      ctx.fillStyle = '#4ade80'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, headAngle, 2 * Math.PI);
      ctx.fillStyle = '#f87171'; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`صورة: ${heads} (${(heads/data.length*100).toFixed(1)}%)`, cx, cy + r + 30);
      ctx.fillText(`كتابة: ${tails} (${(tails/data.length*100).toFixed(1)}%)`, cx, cy + r + 50);
    } else {
      // Histogram for normal distribution
      const bins = 20;
      const minVal = Math.min(...data), maxVal = Math.max(...data);
      const range = maxVal - minVal || 1;
      const binCounts = new Array(bins).fill(0);
      data.forEach(d => {
        const idx = Math.min(Math.floor(((d - minVal) / range) * bins), bins - 1);
        binCounts[idx]++;
      });
      const max = Math.max(...binCounts, 1);
      const barW = chartW / bins;
      binCounts.forEach((c, i) => {
        const barH = (c / max) * chartH;
        const x = margin + i * barW;
        const y = margin + chartH - barH;
        ctx.fillStyle = `rgba(129, 140, 248, ${0.4 + (c / max) * 0.6})`;
        ctx.fillRect(x + 1, y, barW - 2, barH);
      });
      // Bell curve overlay
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath();
      const mean = data.reduce((a,b) => a+b, 0) / data.length;
      const std = Math.sqrt(data.reduce((a,b) => a + (b-mean)**2, 0) / data.length);
      for (let i = 0; i <= chartW; i++) {
        const x = minVal + (i / chartW) * range;
        const gaussY = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
        const normalizedY = (gaussY * std * Math.sqrt(2 * Math.PI)) * chartH;
        const px = margin + i;
        const py = margin + chartH - normalizedY;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Title
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`عدد التجارب: ${data.length}`, W, 25);
    ctx.restore();
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(2, 2);
  }, []);

  useEffect(() => {
    const animate = () => {
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw, results]);

  const mean = results.length > 0 ? results.reduce((a,b) => a+b, 0) / results.length : 0;

  return (
    <SimulationLayout title="نظرية الاحتمالات" titleGradient="from-green-400 to-cyan-400" backgroundGradient="from-slate-900 via-green-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <canvas ref={canvasRef} className="w-full rounded-xl border border-green-500/30 bg-slate-900/80" style={{ height: '500px' }} />
          <div className="flex gap-2 mt-3 justify-center flex-wrap">
            <Button onClick={runExperiment} disabled={isRunning} size="sm" className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-1" /> تشغيل التجربة
            </Button>
            <Button onClick={() => { resultsRef.current = []; setResults([]); }} size="sm" variant="outline" className="border-green-500 text-green-400">
              <RotateCcw className="w-4 h-4 mr-1" /> إعادة
            </Button>
            {(['dice','coin','normal'] as SimMode[]).map(m => (
              <Button key={m} size="sm" onClick={() => { setMode(m); resultsRef.current = []; setResults([]); }}
                className={mode === m ? 'bg-cyan-600' : 'bg-slate-700'}>
                {m === 'dice' ? '🎲 نرد' : m === 'coin' ? '🪙 عملة' : '📊 توزيع طبيعي'}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-slate-800/60 rounded-xl border border-green-500/30">
            <h3 className="text-sm font-bold text-green-300 mb-3">عدد التجارب</h3>
            <Slider value={[trials]} onValueChange={v => setTrials(v[0])} min={10} max={10000} step={10} />
            <span className="text-xs text-slate-400 mt-1 block">{trials} تجربة</span>
          </div>
          <InfoSection
            data={[
              { label: 'عدد التجارب', value: results.length, color: 'text-green-300' },
              { label: 'المتوسط', value: mean, color: 'text-cyan-300' },
            ]}
            explanation="نظرية الاحتمالات تدرس قياس إمكانية وقوع الأحداث. قانون الأعداد الكبيرة يثبت أن المتوسط التجريبي يقترب من القيمة المتوقعة كلما زاد عدد التجارب."
            formulas={[
              { name: 'الاحتمال', formula: 'P(A) = n(A) / n(S)', description: 'عدد النتائج المرغوبة ÷ الإجمالي' },
              { name: 'المتوسط', formula: 'μ = Σxᵢ / n', description: 'مجموع القيم ÷ عددها' },
              { name: 'الانحراف المعياري', formula: 'σ = √(Σ(xᵢ-μ)² / n)', description: 'يقيس تشتت البيانات حول المتوسط' },
              { name: 'التوزيع الطبيعي', formula: 'f(x) = e^(-(x-μ)²/2σ²) / (σ√2π)', description: 'منحنى الجرس الشهير' },
            ]}
            facts={[
              'قانون الأعداد الكبيرة: كلما زادت التجارب اقترب المتوسط من القيمة المتوقعة',
              'احتمال الحصول على 6 في رمي النرد = 1/6 ≈ 16.67%',
              'التوزيع الطبيعي يصف 68% من البيانات ضمن انحراف معياري واحد من المتوسط',
              'مفارقة عيد الميلاد: في مجموعة من 23 شخصاً، احتمال تطابق عيد ميلاد اثنين يتجاوز 50%',
            ]}
          />
          <QuizSection questions={[
            { question: 'ما احتمال الحصول على صورة عند رمي عملة؟', options: ['1/4', '1/2', '1/3', '1/6'], correctIndex: 1, explanation: 'نتيجتان محتملتان (صورة أو كتابة)، والمرغوبة واحدة: P = 1/2' },
            { question: 'ما المتوسط المتوقع لرمي نرد؟', options: ['3', '3.5', '4', '2.5'], correctIndex: 1, explanation: 'المتوسط = (1+2+3+4+5+6)/6 = 21/6 = 3.5' },
            { question: 'ما احتمال الحصول على رقم زوجي عند رمي نرد؟', options: ['1/3', '1/2', '2/3', '1/6'], correctIndex: 1, explanation: 'الأرقام الزوجية: 2، 4، 6 = 3 من أصل 6 = 1/2' },
            { question: 'ما نسبة البيانات ضمن انحراف معياري واحد في التوزيع الطبيعي؟', options: ['50%', '68%', '95%', '99%'], correctIndex: 1, explanation: 'قاعدة 68-95-99.7: حوالي 68% من البيانات تقع ضمن ±σ من المتوسط' },
            { question: 'عند رمي عملتين، ما احتمال الحصول على صورتين؟', options: ['1/2', '1/3', '1/4', '1/8'], correctIndex: 2, explanation: 'P(صورة وصورة) = 1/2 × 1/2 = 1/4 (أحداث مستقلة)' },
          ]} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default ProbabilitySimulation;
