import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

interface Molecule { x: number; y: number; vx: number; vy: number; type: 'reactant' | 'product'; color: string; radius: number; }

const ChemicalKineticsSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const moleculesRef = useRef<Molecule[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [temperature, setTemperature] = useState(300);
  const [concentration, setConcentration] = useState(50);
  const [catalyst, setCatalyst] = useState(false);
  const [activeTab, setActiveTab] = useState('reaction-rate');
  const [reacted, setReacted] = useState(0);
  const reactedRef = useRef(0);

  const initMolecules = useCallback(() => {
    const ps: Molecule[] = [];
    const count = Math.floor(concentration * 0.8);
    for (let i = 0; i < count; i++) {
      const speed = Math.sqrt(temperature / 150) * (0.5 + Math.random());
      const angle = Math.random() * Math.PI * 2;
      ps.push({
        x: 60 + Math.random() * 480, y: 60 + Math.random() * 280,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        type: 'reactant', color: '#60a5fa', radius: 6,
      });
    }
    moleculesRef.current = ps;
    reactedRef.current = 0;
    setReacted(0);
  }, [concentration, temperature]);

  useEffect(() => { initMolecules(); }, [initMolecules]);

  const drawReactionRate = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Container (beaker shape)
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(50, h - 50);
    ctx.lineTo(w - 50, h - 50);
    ctx.lineTo(w - 50, 50);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Activation energy threshold line
    const Ea = catalyst ? 150 : 250;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(50, Ea);
    ctx.lineTo(w - 50, Ea);
    ctx.strokeStyle = '#f59e0b80';
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f59e0b';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`طاقة التنشيط ${catalyst ? '(مع عامل مساعد)' : ''}`, w - 55, Ea - 5);

    // Update molecules
    const collisionThreshold = catalyst ? 1.5 : 3;
    moleculesRef.current.forEach((m, i) => {
      if (!isPlaying) return;
      m.x += m.vx;
      m.y += m.vy;
      if (m.x < 55 || m.x > w - 55) m.vx *= -1;
      if (m.y < 55 || m.y > h - 55) m.vy *= -1;
      m.x = Math.max(55, Math.min(w - 55, m.x));
      m.y = Math.max(55, Math.min(h - 55, m.y));

      // Check collisions for reaction
      if (m.type === 'reactant') {
        for (let j = i + 1; j < moleculesRef.current.length; j++) {
          const other = moleculesRef.current[j];
          if (other.type !== 'reactant') continue;
          const dx = m.x - other.x, dy = m.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const relSpeed = Math.sqrt((m.vx - other.vx) ** 2 + (m.vy - other.vy) ** 2);
          if (dist < 15 && relSpeed > collisionThreshold) {
            m.type = 'product'; m.color = '#f472b6'; m.radius = 5;
            other.type = 'product'; other.color = '#f472b6'; other.radius = 5;
            reactedRef.current += 2;
            setReacted(reactedRef.current);
            break;
          }
        }
      }
    });

    // Draw molecules
    moleculesRef.current.forEach(m => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      ctx.fillStyle = m.color;
      ctx.shadowColor = m.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Legend
    ctx.fillStyle = '#60a5fa'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
    ctx.fillText('● المتفاعلات', w * 0.3, 40);
    ctx.fillStyle = '#f472b6';
    ctx.fillText('● النواتج', w * 0.7, 40);
  }, [isPlaying, catalyst]);

  const drawActivationEnergy = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Energy diagram
    const baseY = h - 80;
    const peakY = 80;
    const midX = w / 2;

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 40);
    ctx.lineTo(60, baseY + 20);
    ctx.lineTo(w - 40, baseY + 20);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('مسار التفاعل', midX, baseY + 45);
    ctx.save();
    ctx.translate(20, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('الطاقة', 0, 0);
    ctx.restore();

    // Without catalyst curve
    ctx.beginPath();
    ctx.moveTo(80, baseY - 40);
    ctx.quadraticCurveTo(midX, peakY, w - 80, baseY - 100);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();

    // With catalyst curve
    ctx.beginPath();
    ctx.moveTo(80, baseY - 40);
    ctx.quadraticCurveTo(midX, peakY + 80, w - 80, baseY - 100);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#ef4444';
    ctx.fillText('بدون عامل مساعد', midX - 80, peakY - 10);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('مع عامل مساعد', midX + 80, peakY + 60);

    // Ea arrows
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('Ea', midX - 30, (peakY + baseY - 40) / 2);
    ctx.fillText("Ea'", midX + 50, (peakY + 80 + baseY - 40) / 2);

    // Reactants / Products labels
    ctx.fillStyle = '#60a5fa';
    ctx.fillText('المتفاعلات', 120, baseY - 15);
    ctx.fillStyle = '#f472b6';
    ctx.fillText('النواتج', w - 120, baseY - 75);
  }, []);

  const drawCatalystEffect = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const time = Date.now() / 1000;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('تأثير العوامل على سرعة التفاعل', w / 2, 30);

    const factors = [
      { name: 'الحرارة ↑', effect: 'سرعة ↑', color: '#ef4444', y: 80 },
      { name: 'التركيز ↑', effect: 'سرعة ↑', color: '#3b82f6', y: 140 },
      { name: 'العامل المساعد', effect: 'سرعة ↑↑', color: '#22c55e', y: 200 },
      { name: 'مساحة السطح ↑', effect: 'سرعة ↑', color: '#f59e0b', y: 260 },
    ];

    factors.forEach((f, i) => {
      const barWidth = 150 + Math.sin(time * 2 + i) * 30;
      // Bar bg
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(w / 2 - 20, f.y, 250, 30);
      // Bar fill
      ctx.fillStyle = f.color + '80';
      ctx.fillRect(w / 2 - 20, f.y, barWidth, 30);
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(w / 2 - 20, f.y, 250, 30);

      ctx.fillStyle = '#fff';
      ctx.font = '13px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(f.name, w / 2 - 30, f.y + 20);
      ctx.textAlign = 'left';
      ctx.fillStyle = f.color;
      ctx.fillText(f.effect, w / 2 + 260, f.y + 20);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      if (activeTab === 'reaction-rate') drawReactionRate(ctx, w, h);
      else if (activeTab === 'activation-energy') drawActivationEnergy(ctx, w, h);
      else drawCatalystEffect(ctx, w, h);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawReactionRate, drawActivationEnergy, drawCatalystEffect]);

  const quizQuestions = [
    { question: 'ما تأثير زيادة درجة الحرارة على سرعة التفاعل؟', options: ['تقل السرعة', 'تزيد السرعة', 'لا تأثير', 'يتوقف التفاعل'], correctIndex: 1, explanation: 'زيادة الحرارة تزيد الطاقة الحركية للجزيئات مما يزيد عدد التصادمات الفعالة.' },
    { question: 'كيف يؤثر العامل المساعد على التفاعل؟', options: ['يزيد طاقة التنشيط', 'يقلل طاقة التنشيط', 'يغير النواتج', 'يزيد حرارة التفاعل'], correctIndex: 1, explanation: 'العامل المساعد يوفر مساراً بديلاً بطاقة تنشيط أقل دون أن يستهلك في التفاعل.' },
    { question: 'ما وحدة قياس سرعة التفاعل؟', options: ['mol/L', 'mol/L·s', 'J/mol', 'K/s'], correctIndex: 1, explanation: 'سرعة التفاعل تقاس بتغير التركيز (mol/L) لكل وحدة زمن (s).' },
  ];

  return (
    <SimulationLayout title="حركية التفاعلات الكيميائية" titleGradient="from-blue-400 to-cyan-400" backgroundGradient="from-slate-900 via-blue-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 w-full">
              <TabsTrigger value="reaction-rate" className="flex-1 text-xs">سرعة التفاعل</TabsTrigger>
              <TabsTrigger value="activation-energy" className="flex-1 text-xs">طاقة التنشيط</TabsTrigger>
              <TabsTrigger value="factors" className="flex-1 text-xs">العوامل المؤثرة</TabsTrigger>
            </TabsList>
          </Tabs>
          <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-xl border border-blue-500/30 bg-slate-900" />
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setIsPlaying(!isPlaying)} className="border-blue-500/50 text-blue-300">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={initMolecules} className="border-blue-500/50 text-blue-300">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button size="sm" variant={catalyst ? "default" : "outline"} onClick={() => setCatalyst(!catalyst)} className={catalyst ? "bg-green-600" : "border-green-500/50 text-green-300"}>
              عامل مساعد
            </Button>
          </div>
          {activeTab === 'reaction-rate' && (
            <div className="space-y-3 p-3 bg-slate-800/40 rounded-xl">
              <div>
                <label className="text-xs text-slate-400">درجة الحرارة: {temperature} K</label>
                <Slider value={[temperature]} onValueChange={v => setTemperature(v[0])} min={200} max={800} step={10} className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-slate-400">التركيز: {concentration}%</label>
                <Slider value={[concentration]} onValueChange={v => setConcentration(v[0])} min={10} max={100} step={5} className="mt-1" />
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'درجة الحرارة', value: temperature, unit: 'K', color: 'text-red-300' },
              { label: 'التركيز', value: concentration, unit: '%', color: 'text-blue-300' },
              { label: 'عدد الجزيئات المتفاعلة', value: reacted, color: 'text-pink-300' },
              { label: 'العامل المساعد', value: catalyst ? 'نشط' : 'غير نشط', color: catalyst ? 'text-green-300' : 'text-gray-400' },
            ]}
            formulas={[
              { name: 'قانون أرهينيوس', formula: 'k = A·e^(-Ea/RT)', description: 'العلاقة بين ثابت السرعة والحرارة' },
              { name: 'سرعة التفاعل', formula: 'r = k·[A]^m·[B]^n', description: 'تعتمد على التركيز ورتبة التفاعل' },
            ]}
            facts={[
              'مضاعفة الحرارة 10°C تضاعف سرعة التفاعل',
              'الإنزيمات هي عوامل مساعدة بيولوجية',
              'صدأ الحديد تفاعل بطيء جداً مقارنة بالاحتراق',
            ]}
          />
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default ChemicalKineticsSimulation;
