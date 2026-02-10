import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

interface Organism { x: number; y: number; color: string; fitness: number; size: number; speed: number; alive: boolean; }

const EvolutionSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const organismsRef = useRef<Organism[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('natural-selection');
  const [generation, setGeneration] = useState(1);
  const [mutationRate, setMutationRate] = useState(10);
  const [envColor, setEnvColor] = useState('#4a7c59');

  const initOrganisms = useCallback(() => {
    const orgs: Organism[] = [];
    for (let i = 0; i < 30; i++) {
      const hue = Math.random() * 360;
      orgs.push({
        x: 50 + Math.random() * 500, y: 80 + Math.random() * 260,
        color: `hsl(${hue}, 70%, 50%)`, fitness: Math.random(),
        size: 5 + Math.random() * 8, speed: 0.5 + Math.random() * 2, alive: true,
      });
    }
    organismsRef.current = orgs;
    setGeneration(1);
  }, []);

  useEffect(() => { initOrganisms(); }, [initOrganisms]);

  const drawNaturalSelection = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    // Environment background
    ctx.fillStyle = envColor + '30';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Ground
    ctx.fillStyle = envColor + '40';
    ctx.fillRect(0, h * 0.85, w, h * 0.15);

    const t = Date.now() / 1000;

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`الانتخاب الطبيعي - الجيل ${generation}`, w / 2, 20);

    // Update organisms
    organismsRef.current.forEach(org => {
      if (!org.alive || !isPlaying) return;
      org.x += (Math.random() - 0.5) * org.speed * 2;
      org.y += (Math.random() - 0.5) * org.speed;
      org.x = Math.max(10, Math.min(w - 10, org.x));
      org.y = Math.max(50, Math.min(h - 30, org.y));
    });

    // Draw organisms
    organismsRef.current.forEach(org => {
      if (!org.alive) return;
      ctx.beginPath();
      ctx.arc(org.x, org.y, org.size, 0, Math.PI * 2);
      ctx.fillStyle = org.color;
      ctx.fill();
      // Fitness indicator
      ctx.strokeStyle = org.fitness > 0.7 ? '#22c55e' : org.fitness > 0.4 ? '#f59e0b' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Stats
    const alive = organismsRef.current.filter(o => o.alive).length;
    const avgFitness = organismsRef.current.filter(o => o.alive).reduce((s, o) => s + o.fitness, 0) / Math.max(alive, 1);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`أحياء: ${alive} | متوسط اللياقة: ${avgFitness.toFixed(2)}`, w / 2, h - 8);
  }, [isPlaying, generation, envColor]);

  const drawMutations = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    const t = Date.now() / 1000;

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('الطفرات الجينية', w / 2, 25);

    // DNA strand
    const dnaX = w / 2;
    for (let i = 0; i < 20; i++) {
      const y = 60 + i * 16;
      const offset = Math.sin(t * 2 + i * 0.5) * 30;
      const isMutated = i === 8 || i === 14;

      // Left strand
      ctx.beginPath();
      ctx.arc(dnaX - 50 + offset, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = isMutated ? '#ef4444' : (i % 2 === 0 ? '#3b82f6' : '#22c55e');
      ctx.fill();

      // Right strand
      ctx.beginPath();
      ctx.arc(dnaX + 50 - offset, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = isMutated ? '#f97316' : (i % 2 === 0 ? '#f59e0b' : '#a78bfa');
      ctx.fill();

      // Base pair connection
      ctx.beginPath();
      ctx.moveTo(dnaX - 45 + offset, y);
      ctx.lineTo(dnaX + 45 - offset, y);
      ctx.strokeStyle = isMutated ? '#ef444460' : '#64748b40';
      ctx.lineWidth = isMutated ? 2 : 1;
      ctx.stroke();

      if (isMutated) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '9px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('← طفرة!', dnaX + 60, y + 3);
      }
    }

    // Types of mutations
    const types = [
      { name: 'استبدال', desc: 'تغيير قاعدة بأخرى', color: '#f59e0b', x: 80 },
      { name: 'إضافة', desc: 'إضافة قاعدة جديدة', color: '#22c55e', x: w / 2 },
      { name: 'حذف', desc: 'حذف قاعدة', color: '#ef4444', x: w - 80 },
    ];

    types.forEach(tp => {
      ctx.fillStyle = tp.color + '20';
      ctx.beginPath();
      ctx.roundRect(tp.x - 55, h - 60, 110, 45, 6);
      ctx.fill();
      ctx.fillStyle = tp.color;
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tp.name, tp.x, h - 38);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px Arial';
      ctx.fillText(tp.desc, tp.x, h - 22);
    });
  }, []);

  const drawAdaptation = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    const t = Date.now() / 1000;

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('بقاء الأصلح والتكيف', w / 2, 25);

    // Timeline of adaptation
    const stages = [
      { gen: 'الجيل 1', desc: 'تنوع عشوائي في الصفات', diversity: [0.2, 0.4, 0.6, 0.8, 1.0] },
      { gen: 'الجيل 10', desc: 'الأقوى ينجو ويتكاثر', diversity: [0.5, 0.6, 0.7, 0.8, 0.9] },
      { gen: 'الجيل 50', desc: 'الصفات المفيدة تسود', diversity: [0.7, 0.75, 0.8, 0.85, 0.9] },
      { gen: 'الجيل 100', desc: 'تكيف شبه كامل', diversity: [0.85, 0.88, 0.9, 0.92, 0.95] },
    ];

    stages.forEach((s, si) => {
      const y = 60 + si * 80;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(30, y, w - 60, 65, 8);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(s.gen, w - 45, y + 20);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Arial';
      ctx.fillText(s.desc, w - 45, y + 38);

      // Fitness circles
      s.diversity.forEach((d, di) => {
        const cx = 70 + di * 40;
        const pulse = Math.sin(t * 2 + si + di) * 2;
        ctx.beginPath();
        ctx.arc(cx, y + 30 + pulse, 8 + d * 5, 0, Math.PI * 2);
        const green = Math.floor(d * 200);
        ctx.fillStyle = `rgb(${255 - green}, ${green}, 50)`;
        ctx.fill();
      });
    });
  }, []);

  // Auto advance generation
  useEffect(() => {
    if (!isPlaying || activeTab !== 'natural-selection') return;
    const interval = setInterval(() => {
      // Selection: remove weakest
      const sorted = organismsRef.current.filter(o => o.alive).sort((a, b) => b.fitness - a.fitness);
      if (sorted.length > 10) {
        sorted.slice(-3).forEach(o => o.alive = false);
      }
      // Reproduction with mutation
      const parents = sorted.filter(o => o.alive).slice(0, 5);
      parents.forEach(p => {
        if (organismsRef.current.filter(o => o.alive).length < 30) {
          const mutation = (Math.random() - 0.5) * (mutationRate / 50);
          organismsRef.current.push({
            x: p.x + (Math.random() - 0.5) * 50,
            y: p.y + (Math.random() - 0.5) * 30,
            color: p.color, fitness: Math.max(0, Math.min(1, p.fitness + mutation)),
            size: p.size + (Math.random() - 0.5) * 2,
            speed: p.speed + (Math.random() - 0.5) * 0.3,
            alive: true,
          });
        }
      });
      setGeneration(g => g + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [isPlaying, activeTab, mutationRate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const cw = canvas.width, ch = canvas.height;
      if (activeTab === 'natural-selection') drawNaturalSelection(ctx, cw, ch);
      else if (activeTab === 'mutations') drawMutations(ctx, cw, ch);
      else drawAdaptation(ctx, cw, ch);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawNaturalSelection, drawMutations, drawAdaptation]);

  const quizQuestions = [
    { question: 'من صاحب نظرية التطور بالانتخاب الطبيعي؟', options: ['نيوتن', 'أينشتاين', 'داروين', 'مندل'], correctIndex: 2, explanation: 'تشارلز داروين نشر نظرية التطور بالانتخاب الطبيعي في كتابه "أصل الأنواع" عام 1859.' },
    { question: 'ما المقصود ببقاء الأصلح؟', options: ['بقاء الأقوى جسدياً', 'بقاء الأكثر تكيفاً مع البيئة', 'بقاء الأكبر حجماً', 'بقاء الأسرع'], correctIndex: 1, explanation: 'بقاء الأصلح يعني أن الكائنات الأكثر تكيفاً مع بيئتها هي التي تنجو وتتكاثر.' },
    { question: 'ما مصدر التنوع الوراثي؟', options: ['التغذية', 'الطفرات والتكاثر الجنسي', 'التعليم', 'البيئة فقط'], correctIndex: 1, explanation: 'الطفرات والتكاثر الجنسي (العبور والتوزيع الحر) هما المصدران الرئيسيان للتنوع الوراثي.' },
    { question: 'ما الدليل الأقوى على التطور؟', options: ['السجل الأحفوري والتشريح المقارن', 'لون الحيوانات', 'حجم الكائنات', 'سرعة الحركة'], correctIndex: 0, explanation: 'السجل الأحفوري يوثق تغير الكائنات عبر الزمن، والتشريح المقارن يكشف عن أعضاء متماثلة بين الأنواع.' },
    { question: 'ما الانتواع (Speciation)؟', options: ['تكوّن أنواع جديدة من نوع واحد', 'انقراض الأنواع', 'هجرة الحيوانات', 'تكاثر الأنواع'], correctIndex: 0, explanation: 'الانتواع يحدث عندما تنعزل مجموعة عن النوع الأصلي وتتراكم اختلافات وراثية كافية لتكوين نوع جديد.' },
  ];

  return (
    <SimulationLayout title="التطور والانتخاب الطبيعي" titleGradient="from-amber-400 to-green-400" backgroundGradient="from-slate-900 via-amber-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 w-full">
              <TabsTrigger value="natural-selection" className="flex-1 text-xs">الانتخاب الطبيعي</TabsTrigger>
              <TabsTrigger value="mutations" className="flex-1 text-xs">الطفرات</TabsTrigger>
              <TabsTrigger value="adaptation" className="flex-1 text-xs">التكيف</TabsTrigger>
            </TabsList>
          </Tabs>
          <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-xl border border-amber-500/30 bg-slate-900" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsPlaying(!isPlaying)} className="border-amber-500/50 text-amber-300">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={initOrganisms} className="border-amber-500/50 text-amber-300">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          {activeTab === 'natural-selection' && (
            <div className="p-3 bg-slate-800/40 rounded-xl">
              <label className="text-xs text-slate-400">معدل الطفرات: {mutationRate}%</label>
              <Slider value={[mutationRate]} onValueChange={v => setMutationRate(v[0])} min={1} max={50} step={1} className="mt-1" />
            </div>
          )}
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'الجيل', value: generation, color: 'text-amber-300' },
              { label: 'معدل الطفرات', value: mutationRate, unit: '%', color: 'text-green-300' },
              { label: 'أحياء', value: organismsRef.current.filter(o => o.alive).length, color: 'text-cyan-300' },
            ]}
            formulas={[
              { name: 'معادلة هاردي-واينبرغ', formula: 'p² + 2pq + q² = 1', description: 'توازن التردد الأليلي في غياب التطور' },
            ]}
            facts={[
              'التطور عملية تستغرق ملايين السنين عادة',
              'البكتيريا يمكن أن تتطور في أسابيع (مقاومة المضادات الحيوية)',
              'كل الكائنات الحية تشترك في سلف مشترك',
            ]}
          />
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default EvolutionSimulation;
