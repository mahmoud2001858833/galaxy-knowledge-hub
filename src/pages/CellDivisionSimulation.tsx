import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

const CellDivisionSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('mitosis');
  const [phase, setPhase] = useState(0);

  const mitosisPhases = ['الطور البيني', 'الطور التمهيدي', 'الطور الاستوائي', 'الطور الانفصالي', 'الطور النهائي'];
  const meiosisPhases = ['الطور التمهيدي I', 'الطور الاستوائي I', 'الطور الانفصالي I', 'الطور التمهيدي II', 'الطور الاستوائي II', 'الطور الانفصالي II'];

  const currentPhases = activeTab === 'mitosis' ? mitosisPhases : meiosisPhases;

  const drawMitosis = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = Date.now() / 1000;
    const cx = w / 2, cy = h / 2;
    const phaseName = mitosisPhases[Math.min(phase, mitosisPhases.length - 1)];

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`الانقسام المتساوي - ${phaseName}`, cx, 25);

    if (phase === 0) {
      // Interphase - intact cell with nucleus
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.fillStyle = '#1e40af20';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Nucleus
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f140';
      ctx.fill();
      ctx.strokeStyle = '#6366f1';
      ctx.stroke();
      // Chromatin (loose threads)
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const sx = cx - 20 + Math.random() * 40;
        const sy = cy - 20 + Math.random() * 40;
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(sx + Math.sin(t + i) * 10, sy + 10, sx + Math.cos(t + i) * 15, sy + 20);
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText('DNA يتضاعف استعداداً للانقسام', cx, h - 30);
    } else if (phase === 1) {
      // Prophase - chromosomes condense
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.fillStyle = '#1e40af20';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Condensed chromosomes (X shapes)
      const chroms = [[-20, -20], [20, -20], [-20, 20], [20, 20]];
      chroms.forEach(([dx, dy], i) => {
        const px = cx + dx, py = cy + dy;
        ctx.beginPath();
        ctx.moveTo(px - 8, py - 10);
        ctx.lineTo(px + 8, py + 10);
        ctx.moveTo(px + 8, py - 10);
        ctx.lineTo(px - 8, py + 10);
        ctx.strokeStyle = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'][i];
        ctx.lineWidth = 4;
        ctx.stroke();
      });
      // Spindle fibers forming
      ctx.strokeStyle = '#94a3b850';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - 120, cy);
        ctx.lineTo(cx + Math.sin(i) * 30, cy + Math.cos(i * 2) * 30);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 120, cy);
        ctx.lineTo(cx + Math.sin(i) * 30, cy + Math.cos(i * 2) * 30);
        ctx.stroke();
      }
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText('الكروموسومات تتكثف وتظهر خيوط المغزل', cx, h - 30);
    } else if (phase === 2) {
      // Metaphase - chromosomes align
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.fillStyle = '#1e40af20';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Spindle poles
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx - 120, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 120, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      // Chromosomes aligned at center
      const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
      colors.forEach((c, i) => {
        const py = cy - 30 + i * 20;
        // Spindle fibers
        ctx.strokeStyle = '#94a3b830';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx - 120, cy);
        ctx.lineTo(cx, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 120, cy);
        ctx.lineTo(cx, py);
        ctx.stroke();
        // X chromosome
        ctx.beginPath();
        ctx.moveTo(cx - 6, py - 8);
        ctx.lineTo(cx + 6, py + 8);
        ctx.moveTo(cx + 6, py - 8);
        ctx.lineTo(cx - 6, py + 8);
        ctx.strokeStyle = c;
        ctx.lineWidth = 4;
        ctx.stroke();
      });
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText('الكروموسومات تصطف في منتصف الخلية', cx, h - 30);
    } else if (phase === 3) {
      // Anaphase - chromosomes separate
      const sep = Math.sin(t * 2) * 20 + 40;
      ctx.beginPath();
      ctx.arc(cx, cy, 100 + sep * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#1e40af10';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
      const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
      colors.forEach((c, i) => {
        const py = cy - 20 + i * 15;
        // Left chromatid
        ctx.fillStyle = c;
        ctx.fillRect(cx - sep - 5, py - 5, 4, 10);
        // Right chromatid
        ctx.fillRect(cx + sep + 1, py - 5, 4, 10);
        // Fibers
        ctx.strokeStyle = '#94a3b830';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx - 130, cy);
        ctx.lineTo(cx - sep - 3, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 130, cy);
        ctx.lineTo(cx + sep + 3, py);
        ctx.stroke();
      });
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText('الكروماتيدات تنفصل وتتحرك نحو القطبين', cx, h - 30);
    } else {
      // Telophase + cytokinesis
      const offset = 80;
      // Two new cells forming
      ctx.beginPath();
      ctx.arc(cx - offset, cy, 65, 0, Math.PI * 2);
      ctx.fillStyle = '#1e40af20';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + offset, cy, 65, 0, Math.PI * 2);
      ctx.fillStyle = '#1e40af20';
      ctx.fill();
      ctx.stroke();
      // New nuclei
      ctx.beginPath();
      ctx.arc(cx - offset, cy, 25, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f130';
      ctx.fill();
      ctx.strokeStyle = '#6366f1';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + offset, cy, 25, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f130';
      ctx.fill();
      ctx.stroke();
      // Chromosomes inside
      const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];
      colors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(cx - offset - 10 + (i % 2) * 12, cy - 10 + Math.floor(i / 2) * 12, 3, 8);
        ctx.fillRect(cx + offset - 10 + (i % 2) * 12, cy - 10 + Math.floor(i / 2) * 12, 3, 8);
      });
      // Cleavage furrow
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 70);
      ctx.lineTo(cx, cy + 70);
      ctx.strokeStyle = '#f59e0b80';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText('خليتان بنتان متطابقتان وراثياً', cx, h - 30);
    }

    // Phase indicator
    mitosisPhases.forEach((p, i) => {
      const px = 50 + (i / (mitosisPhases.length - 1)) * (w - 100);
      ctx.beginPath();
      ctx.arc(px, h - 60, 6, 0, Math.PI * 2);
      ctx.fillStyle = i === phase ? '#22c55e' : i < phase ? '#22c55e60' : '#47556940';
      ctx.fill();
    });
  }, [phase]);

  const drawMeiosis = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const phaseName = meiosisPhases[Math.min(phase, meiosisPhases.length - 1)];
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`الانقسام المنصف - ${phaseName}`, w / 2, 25);

    const cx = w / 2, cy = h / 2;

    if (phase <= 2) {
      // Division I
      const div1Progress = phase / 2;
      const cellR = 90 - div1Progress * 20;
      if (phase < 2) {
        ctx.beginPath();
        ctx.arc(cx, cy, cellR, 0, Math.PI * 2);
        ctx.fillStyle = '#7c3aed15';
        ctx.fill();
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Homologous pairs
        const pairs = [['#ef4444', '#f87171'], ['#3b82f6', '#60a5fa']];
        pairs.forEach(([c1, c2], i) => {
          const dy = -20 + i * 40;
          const sep = phase === 0 ? 5 : phase === 1 ? 0 : 30;
          ctx.fillStyle = c1;
          ctx.fillRect(cx - sep - 4, cy + dy - 8, 4, 16);
          ctx.fillStyle = c2;
          ctx.fillRect(cx + sep, cy + dy - 8, 4, 16);
        });
      } else {
        // Two cells after Division I
        [-60, 60].forEach((dx, ci) => {
          ctx.beginPath();
          ctx.arc(cx + dx, cy, 55, 0, Math.PI * 2);
          ctx.fillStyle = '#7c3aed10';
          ctx.fill();
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          const colors = ci === 0 ? ['#ef4444', '#3b82f6'] : ['#f87171', '#60a5fa'];
          colors.forEach((c, i) => {
            ctx.fillStyle = c;
            ctx.fillRect(cx + dx - 5, cy - 15 + i * 20, 4, 12);
          });
        });
      }
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText(phase === 0 ? 'الأزواج المتماثلة تتقارب (العبور الجيني)' : phase === 1 ? 'الأزواج تصطف في المنتصف' : 'الكروموسومات المتماثلة تنفصل', cx, h - 30);
    } else {
      // Division II
      const subPhase = phase - 3;
      const cells = [[-120, cy], [-40, cy], [40, cy], [120, cy]];
      if (subPhase < 2) {
        // Two cells dividing
        [-60, 60].forEach((dx, ci) => {
          ctx.beginPath();
          ctx.arc(cx + dx, cy, 55, 0, Math.PI * 2);
          ctx.fillStyle = '#7c3aed10';
          ctx.fill();
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          const colors = ci === 0 ? ['#ef4444', '#3b82f6'] : ['#f87171', '#60a5fa'];
          const sep = subPhase * 15;
          colors.forEach((c, i) => {
            ctx.fillStyle = c;
            ctx.fillRect(cx + dx - sep - 2, cy - 10 + i * 15, 3, 10);
            ctx.fillRect(cx + dx + sep - 1, cy - 10 + i * 15, 3, 10);
          });
        });
      } else {
        // Four haploid cells
        const positions = [[-130, cy], [-45, cy], [45, cy], [130, cy]];
        const cellColors = [['#ef4444'], ['#3b82f6'], ['#f87171'], ['#60a5fa']];
        positions.forEach(([x, y], i) => {
          ctx.beginPath();
          ctx.arc(cx + x, y, 35, 0, Math.PI * 2);
          ctx.fillStyle = '#7c3aed10';
          ctx.fill();
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = cellColors[i][0];
          ctx.fillRect(cx + x - 2, y - 5, 4, 10);
        });
      }
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.fillText(subPhase < 2 ? 'الكروماتيدات الشقيقة تنفصل' : '4 خلايا أحادية المجموعة الكروموسومية', cx, h - 30);
    }

    // Phase dots
    meiosisPhases.forEach((p, i) => {
      const px = 40 + (i / (meiosisPhases.length - 1)) * (w - 80);
      ctx.beginPath();
      ctx.arc(px, h - 60, 5, 0, Math.PI * 2);
      ctx.fillStyle = i === phase ? '#a78bfa' : i < phase ? '#a78bfa60' : '#47556940';
      ctx.fill();
    });
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      if (activeTab === 'mitosis') drawMitosis(ctx, canvas.width, canvas.height);
      else drawMeiosis(ctx, canvas.width, canvas.height);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawMitosis, drawMeiosis]);

  // Auto-advance phases
  useEffect(() => {
    if (!isPlaying) return;
    const maxPhase = activeTab === 'mitosis' ? mitosisPhases.length - 1 : meiosisPhases.length - 1;
    const interval = setInterval(() => {
      setPhase(p => p >= maxPhase ? 0 : p + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying, activeTab]);

  useEffect(() => { setPhase(0); }, [activeTab]);

  const quizQuestions = [
    { question: 'كم خلية تنتج من الانقسام المتساوي؟', options: ['1', '2', '4', '8'], correctIndex: 1, explanation: 'الانقسام المتساوي ينتج خليتين بنتين متطابقتين وراثياً مع الخلية الأم.' },
    { question: 'ما نوع الخلايا الناتجة من الانقسام المنصف؟', options: ['ثنائية المجموعة', 'أحادية المجموعة', 'ثلاثية المجموعة', 'رباعية المجموعة'], correctIndex: 1, explanation: 'الانقسام المنصف ينتج 4 خلايا أحادية المجموعة الكروموسومية (أمشاج).' },
    { question: 'في أي طور تصطف الكروموسومات في منتصف الخلية؟', options: ['التمهيدي', 'الاستوائي', 'الانفصالي', 'النهائي'], correctIndex: 1, explanation: 'في الطور الاستوائي تصطف الكروموسومات على خط استواء الخلية.' },
    { question: 'ما أهمية الانقسام المنصف؟', options: ['تكوين الأمشاج (الحيوانات المنوية والبويضات)', 'النمو والتعويض', 'إصلاح الأنسجة', 'تكوين خلايا الدم'], correctIndex: 0, explanation: 'الانقسام المنصف ضروري لتكوين الأمشاج وضمان ثبات عدد الكروموسومات عبر الأجيال.' },
    { question: 'ما العبور الجيني (Crossing Over)؟', options: ['تبادل قطع بين الكروموسومات المتماثلة', 'انقسام النواة', 'تضاعف DNA', 'حركة الكروموسومات'], correctIndex: 0, explanation: 'العبور الجيني يحدث في الطور التمهيدي I حيث تتبادل الكروموسومات المتماثلة قطعاً منها مما يزيد التنوع الوراثي.' },
  ];

  return (
    <SimulationLayout title="الانقسام الخلوي" titleGradient="from-violet-400 to-fuchsia-400" backgroundGradient="from-slate-900 via-violet-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 w-full">
              <TabsTrigger value="mitosis" className="flex-1 text-xs">الانقسام المتساوي</TabsTrigger>
              <TabsTrigger value="meiosis" className="flex-1 text-xs">الانقسام المنصف</TabsTrigger>
            </TabsList>
          </Tabs>
          <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-xl border border-violet-500/30 bg-slate-900" />
          <div className="flex gap-2 items-center">
            <Button size="sm" variant="outline" onClick={() => setIsPlaying(!isPlaying)} className="border-violet-500/50 text-violet-300">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPhase(0)} className="border-violet-500/50 text-violet-300">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <Slider value={[phase]} onValueChange={v => { setPhase(v[0]); setIsPlaying(false); }} min={0} max={currentPhases.length - 1} step={1} />
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {currentPhases.map((p, i) => (
              <Button key={i} size="sm" variant={phase === i ? "default" : "outline"} onClick={() => { setPhase(i); setIsPlaying(false); }} className={`text-[10px] ${phase === i ? 'bg-violet-600' : 'border-violet-500/30 text-violet-300'}`}>
                {p}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'نوع الانقسام', value: activeTab === 'mitosis' ? 'متساوي' : 'منصف', color: 'text-violet-300' },
              { label: 'المرحلة', value: currentPhases[phase], color: 'text-fuchsia-300' },
              { label: 'الخلايا الناتجة', value: activeTab === 'mitosis' ? '2' : '4', color: 'text-cyan-300' },
            ]}
            formulas={[
              { name: 'المتساوي', formula: '2n → 2n + 2n', description: 'خليتان ثنائيتان متطابقتان' },
              { name: 'المنصف', formula: '2n → n + n + n + n', description: '4 خلايا أحادية مختلفة' },
            ]}
            facts={[
              'الانقسام المتساوي للنمو والتعويض',
              'الانقسام المنصف لإنتاج الأمشاج (الحيوانات المنوية والبويضات)',
              'العبور الجيني يزيد التنوع الوراثي',
            ]}
          />
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default CellDivisionSimulation;
