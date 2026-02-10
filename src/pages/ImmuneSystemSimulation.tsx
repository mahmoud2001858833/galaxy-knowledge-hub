import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

interface Pathogen { x: number; y: number; vx: number; vy: number; alive: boolean; type: 'virus' | 'bacteria'; }
interface Antibody { x: number; y: number; targetX: number; targetY: number; }

const ImmuneSystemSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('innate');
  const pathogensRef = useRef<Pathogen[]>([]);
  const antibodiesRef = useRef<Antibody[]>([]);
  const [destroyed, setDestroyed] = useState(0);

  const initSimulation = useCallback(() => {
    const ps: Pathogen[] = [];
    for (let i = 0; i < 15; i++) {
      ps.push({
        x: Math.random() * 500 + 50, y: Math.random() * 300 + 50,
        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
        alive: true, type: Math.random() > 0.5 ? 'virus' : 'bacteria',
      });
    }
    pathogensRef.current = ps;
    antibodiesRef.current = [];
    setDestroyed(0);
  }, []);

  useEffect(() => { initSimulation(); }, [initSimulation]);

  const drawInnate = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    const t = Date.now() / 1000;

    ctx.fillStyle = '#fecaca20';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('المناعة الفطرية (غير المتخصصة)', w / 2, 25);

    // Skin barrier (top)
    ctx.fillStyle = '#92400e40';
    ctx.fillRect(0, 40, w, 15);
    ctx.fillStyle = '#a16207';
    ctx.font = '10px Arial';
    ctx.fillText('الجلد (خط الدفاع الأول)', w / 2, 52);

    // Macrophage (big white blood cell)
    const macX = 200 + Math.sin(t) * 50;
    const macY = 200 + Math.cos(t * 0.7) * 30;
    ctx.beginPath();
    ctx.arc(macX, macY, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#dbeafe80';
    ctx.fill();
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Pseudopods
    for (let i = 0; i < 5; i++) {
      const a = t * 1.5 + i * 1.2;
      ctx.beginPath();
      ctx.arc(macX + Math.cos(a) * 28, macY + Math.sin(a) * 28, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#bfdbfe60';
      ctx.fill();
    }
    ctx.fillStyle = '#1e40af';
    ctx.font = '8px Arial';
    ctx.fillText('بلعمية', macX, macY + 3);

    // Neutrophil
    const neuX = 400 + Math.cos(t * 0.8) * 40;
    const neuY = 250 + Math.sin(t * 1.2) * 25;
    ctx.beginPath();
    ctx.arc(neuX, neuY, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#c4b5fd60';
    ctx.fill();
    ctx.strokeStyle = '#a78bfa';
    ctx.stroke();
    ctx.fillStyle = '#7c3aed';
    ctx.font = '7px Arial';
    ctx.fillText('عدلة', neuX, neuY + 3);

    // NK Cell
    ctx.beginPath();
    ctx.arc(300, 300, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#fde68a40';
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.font = '7px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NK', 300, 303);

    // Pathogens
    pathogensRef.current.forEach(p => {
      if (!p.alive) return;
      if (isPlaying) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 10 || p.x > w - 10) p.vx *= -1;
        if (p.y < 60 || p.y > h - 10) p.vy *= -1;
        // Check if eaten by macrophage
        const dx = p.x - macX, dy = p.y - macY;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
          p.alive = false;
          setDestroyed(d => d + 1);
        }
      }
      ctx.beginPath();
      if (p.type === 'virus') {
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        // Spikes
        for (let s = 0; s < 6; s++) {
          const a = (s / 6) * Math.PI * 2;
          ctx.moveTo(p.x + Math.cos(a) * 6, p.y + Math.sin(a) * 6);
          ctx.lineTo(p.x + Math.cos(a) * 10, p.y + Math.sin(a) * 10);
        }
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.ellipse(p.x, p.y, 10, 5, t + p.x, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
      }
      ctx.fill();
    });

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`مسببات الأمراض المدمرة: ${destroyed}`, w / 2, h - 15);
  }, [isPlaying, destroyed]);

  const drawAdaptive = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    const t = Date.now() / 1000;

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('المناعة المكتسبة (المتخصصة)', w / 2, 25);

    // B Cell producing antibodies
    ctx.beginPath();
    ctx.arc(150, 200, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f640';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.fillText('خلية B', 150, 203);

    // T Cell
    ctx.beginPath();
    ctx.arc(450, 200, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#22c55e40';
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.fillText('خلية T', 450, 203);

    // Antibodies (Y shapes) emanating from B cell
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + t;
      const dist = 50 + Math.sin(t * 2 + i) * 15;
      const ax = 150 + Math.cos(angle) * dist;
      const ay = 200 + Math.sin(angle) * dist;

      // Y shape
      ctx.beginPath();
      ctx.moveTo(ax, ay + 8);
      ctx.lineTo(ax, ay);
      ctx.lineTo(ax - 5, ay - 6);
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + 5, ay - 6);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Antigen on virus
    const virusX = 300, virusY = 150;
    ctx.beginPath();
    ctx.arc(virusX, virusY, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#ef444480';
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(virusX + Math.cos(a) * 18, virusY + Math.sin(a) * 18, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
    }
    ctx.fillStyle = '#f97316';
    ctx.font = '9px Arial';
    ctx.fillText('مستضد (أنتيجين)', virusX, virusY + 30);

    // Antibody binding to antigen
    const bindY = virusY + Math.sin(t * 2) * 3;
    ctx.beginPath();
    ctx.moveTo(virusX + 20, bindY + 8);
    ctx.lineTo(virusX + 20, bindY);
    ctx.lineTo(virusX + 15, bindY - 6);
    ctx.moveTo(virusX + 20, bindY);
    ctx.lineTo(virusX + 25, bindY - 6);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Memory cells
    ctx.fillStyle = '#a78bfa40';
    ctx.beginPath();
    ctx.arc(300, 320, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a78bfa';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = '8px Arial';
    ctx.fillText('خلية ذاكرة', 300, 323);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Arial';
    ctx.fillText('تتذكر المستضد للاستجابة السريعة لاحقاً', 300, 355);
  }, []);

  const drawVaccination = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    const t = Date.now() / 1000;

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('آلية عمل اللقاحات', w / 2, 25);

    const steps = [
      { label: 'حقن اللقاح\n(فيروس ضعيف/ميت)', x: 80, y: 100, color: '#ef4444', icon: '💉' },
      { label: 'التعرف على\nالمستضد', x: 230, y: 100, color: '#f59e0b', icon: '🔍' },
      { label: 'إنتاج\nالأجسام المضادة', x: 380, y: 100, color: '#3b82f6', icon: '🛡️' },
      { label: 'تكوين\nخلايا الذاكرة', x: 530, y: 100, color: '#22c55e', icon: '🧠' },
    ];

    steps.forEach((s, i) => {
      const pulse = Math.sin(t * 2 + i * 0.8) * 3;
      ctx.fillStyle = s.color + '20';
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(s.x - 50, s.y - 25 + pulse, 100, 80, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(s.icon, s.x, s.y + pulse);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '9px Arial';
      const lines = s.label.split('\n');
      lines.forEach((line, li) => {
        ctx.fillText(line, s.x, s.y + 30 + li * 13 + pulse);
      });

      // Arrow
      if (i < steps.length - 1) {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x + 55, s.y + 15);
        ctx.lineTo(steps[i + 1].x - 55, steps[i + 1].y + 15);
        ctx.stroke();
      }
    });

    // Second encounter
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('عند التعرض الحقيقي:', w / 2, 230);

    const encounter = [
      { text: 'الفيروس يهاجم', x: 150, y: 280, color: '#ef4444' },
      { text: 'خلايا الذاكرة تتعرف عليه فوراً', x: w / 2, y: 280, color: '#a78bfa' },
      { text: 'استجابة سريعة وقوية!', x: w - 150, y: 280, color: '#22c55e' },
    ];

    encounter.forEach((e, i) => {
      ctx.fillStyle = e.color + '20';
      ctx.beginPath();
      ctx.roundRect(e.x - 80, e.y - 15, 160, 35, 6);
      ctx.fill();
      ctx.fillStyle = e.color;
      ctx.font = '11px Arial';
      ctx.fillText(e.text, e.x, e.y + 7);
      if (i < 2) {
        ctx.strokeStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(e.x + 85, e.y);
        ctx.lineTo(encounter[i + 1].x - 85, encounter[i + 1].y);
        ctx.stroke();
      }
    });

    ctx.fillStyle = '#fbbf24';
    ctx.font = '12px Arial';
    ctx.fillText('💡 اللقاح يدرب الجهاز المناعي دون التسبب بالمرض', w / 2, h - 20);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const cw = canvas.width, ch = canvas.height;
      if (activeTab === 'innate') drawInnate(ctx, cw, ch);
      else if (activeTab === 'adaptive') drawAdaptive(ctx, cw, ch);
      else drawVaccination(ctx, cw, ch);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawInnate, drawAdaptive, drawVaccination]);

  const quizQuestions = [
    { question: 'ما هو خط الدفاع الأول في الجسم؟', options: ['الأجسام المضادة', 'الجلد والأغشية المخاطية', 'خلايا T', 'خلايا B'], correctIndex: 1, explanation: 'الجلد والأغشية المخاطية يمثلان خط الدفاع الأول كحواجز فيزيائية ضد مسببات الأمراض.' },
    { question: 'ما نوع الخلايا التي تنتج الأجسام المضادة؟', options: ['خلايا T', 'خلايا B', 'البلعميات', 'خلايا NK'], correctIndex: 1, explanation: 'خلايا B (الخلايا البائية) هي المسؤولة عن إنتاج الأجسام المضادة المتخصصة.' },
    { question: 'كيف يعمل اللقاح؟', options: ['يقتل الفيروسات مباشرة', 'يدرب الجهاز المناعي', 'يقوي الجلد', 'ينتج مضادات حيوية'], correctIndex: 1, explanation: 'اللقاح يحتوي على فيروس ضعيف/ميت أو جزء منه لتدريب الجهاز المناعي على التعرف عليه.' },
  ];

  return (
    <SimulationLayout title="الجهاز المناعي" titleGradient="from-red-400 to-orange-400" backgroundGradient="from-slate-900 via-red-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 w-full">
              <TabsTrigger value="innate" className="flex-1 text-xs">المناعة الفطرية</TabsTrigger>
              <TabsTrigger value="adaptive" className="flex-1 text-xs">المناعة المكتسبة</TabsTrigger>
              <TabsTrigger value="vaccination" className="flex-1 text-xs">اللقاحات</TabsTrigger>
            </TabsList>
          </Tabs>
          <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-xl border border-red-500/30 bg-slate-900" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsPlaying(!isPlaying)} className="border-red-500/50 text-red-300">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={initSimulation} className="border-red-500/50 text-red-300">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'مسببات أمراض مدمرة', value: destroyed, color: 'text-red-300' },
              { label: 'نوع المناعة', value: activeTab === 'innate' ? 'فطرية' : activeTab === 'adaptive' ? 'مكتسبة' : 'لقاح', color: 'text-orange-300' },
            ]}
            facts={[
              'جسمك ينتج ملايين الأجسام المضادة كل يوم',
              'خلايا الذاكرة تعيش لسنوات وأحياناً مدى الحياة',
              'الحمى هي استجابة مناعية لقتل مسببات الأمراض',
              'حليب الأم يحتوي على أجسام مضادة تحمي الرضيع',
            ]}
            explanation="الجهاز المناعي نظام دفاعي معقد يحمي الجسم من مسببات الأمراض عبر خطوط دفاع متعددة."
          />
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default ImmuneSystemSimulation;
