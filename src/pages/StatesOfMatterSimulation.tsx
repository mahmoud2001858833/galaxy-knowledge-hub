import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

interface MatterParticle { x: number; y: number; vx: number; vy: number; baseX: number; baseY: number; }

const StatesOfMatterSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<MatterParticle[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [temperature, setTemperature] = useState(25);
  const [activeTab, setActiveTab] = useState('states');
  const [pressure, setPressure] = useState(1);

  const getState = (temp: number) => temp < 0 ? 'solid' : temp < 100 ? 'liquid' : 'gas';

  const initParticles = useCallback(() => {
    const ps: MatterParticle[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 10; col++) {
        const bx = 180 + col * 25, by = 100 + row * 25;
        ps.push({ x: bx, y: by, vx: 0, vy: 0, baseX: bx, baseY: by });
      }
    }
    particlesRef.current = ps;
  }, []);

  useEffect(() => { initParticles(); }, [initParticles]);

  const drawStates = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const state = getState(temperature);
    // Container
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(150, 70, 300, 260);

    // Temperature bar
    const tempNorm = (temperature + 50) / 200;
    const barH = 250;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(50, 80, 30, barH);
    const tempGrad = ctx.createLinearGradient(50, 80 + barH, 50, 80);
    tempGrad.addColorStop(0, '#3b82f6');
    tempGrad.addColorStop(0.5, '#f59e0b');
    tempGrad.addColorStop(1, '#ef4444');
    ctx.fillStyle = tempGrad;
    ctx.fillRect(50, 80 + barH * (1 - tempNorm), 30, barH * tempNorm);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${temperature}°C`, 65, 80 + barH + 20);

    // Update & draw particles based on state
    particlesRef.current.forEach(p => {
      if (!isPlaying) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = state === 'solid' ? '#60a5fa' : state === 'liquid' ? '#3b82f6' : '#93c5fd';
        ctx.fill();
        return;
      }

      if (state === 'solid') {
        // Vibrate around base position
        const vibration = temperature / 50 + 0.5;
        p.x = p.baseX + (Math.random() - 0.5) * vibration;
        p.y = p.baseY + (Math.random() - 0.5) * vibration;
      } else if (state === 'liquid') {
        const speed = temperature / 80;
        p.vx += (Math.random() - 0.5) * speed * 0.3;
        p.vy += (Math.random() - 0.5) * speed * 0.3 + 0.05;
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        // Stay in bottom half of container
        if (p.x < 155) { p.x = 155; p.vx *= -0.5; }
        if (p.x > 445) { p.x = 445; p.vx *= -0.5; }
        if (p.y < 180) { p.y = 180; p.vy *= -0.5; }
        if (p.y > 325) { p.y = 325; p.vy *= -0.5; }
      } else {
        // Gas - free movement
        const speed = (temperature - 80) / 40;
        p.vx += (Math.random() - 0.5) * speed * 0.2;
        p.vy += (Math.random() - 0.5) * speed * 0.2;
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 155 || p.x > 445) p.vx *= -1;
        if (p.y < 75 || p.y > 325) p.vy *= -1;
        p.x = Math.max(155, Math.min(445, p.x));
        p.y = Math.max(75, Math.min(325, p.y));
      }

      const color = state === 'solid' ? '#60a5fa' : state === 'liquid' ? '#3b82f6' : '#93c5fd';
      ctx.beginPath();
      ctx.arc(p.x, p.y, state === 'gas' ? 4 : 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // State label
    const stateNames: Record<string, string> = { solid: 'صلب ❄️', liquid: 'سائل 💧', gas: 'غاز 💨' };
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`الحالة: ${stateNames[state]}`, w / 2, h - 20);
  }, [isPlaying, temperature]);

  const drawPhaseDiagram = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const ox = 100, oy = h - 80;
    const gw = w - 160, gh = h - 140;

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, 40);
    ctx.lineTo(ox, oy);
    ctx.lineTo(w - 40, oy);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('درجة الحرارة (°C)', w / 2, oy + 40);
    ctx.save();
    ctx.translate(30, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('الضغط (atm)', 0, 0);
    ctx.restore();

    // Phase regions
    // Solid
    ctx.fillStyle = '#3b82f630';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, 80);
    ctx.lineTo(ox + gw * 0.3, oy - gh * 0.4);
    ctx.lineTo(ox + gw * 0.35, oy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('صلب', ox + gw * 0.15, oy - gh * 0.2);

    // Liquid
    ctx.fillStyle = '#22c55e30';
    ctx.beginPath();
    ctx.moveTo(ox + gw * 0.3, oy - gh * 0.4);
    ctx.lineTo(ox + gw * 0.35, oy);
    ctx.lineTo(ox + gw * 0.7, oy);
    ctx.lineTo(ox + gw * 0.5, oy - gh * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.fillText('سائل', ox + gw * 0.45, oy - gh * 0.3);

    // Gas
    ctx.fillStyle = '#f59e0b30';
    ctx.beginPath();
    ctx.moveTo(ox + gw * 0.3, oy - gh * 0.4);
    ctx.lineTo(ox + gw * 0.5, oy - gh * 0.7);
    ctx.lineTo(w - 50, 50);
    ctx.lineTo(w - 50, oy);
    ctx.lineTo(ox + gw * 0.35, oy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('غاز', ox + gw * 0.7, oy - gh * 0.15);

    // Triple point
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(ox + gw * 0.3, oy - gh * 0.4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.fillText('النقطة الثلاثية', ox + gw * 0.3, oy - gh * 0.4 - 12);

    // Current position
    const cx = ox + ((temperature + 50) / 200) * gw;
    const cy = oy - (pressure / 5) * gh;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 8px Arial';
    ctx.fillText('أنت', cx, cy + 3);
  }, [temperature, pressure]);

  const drawTransitions = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const time = Date.now() / 1000;
    const transitions = [
      { from: 'صلب', to: 'سائل', name: 'انصهار', reverse: 'تجمد', y: 80, color: '#3b82f6' },
      { from: 'سائل', to: 'غاز', name: 'تبخر', reverse: 'تكاثف', y: 170, color: '#22c55e' },
      { from: 'صلب', to: 'غاز', name: 'تسامي', reverse: 'ترسب', y: 260, color: '#f59e0b' },
    ];

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('التحولات بين حالات المادة', w / 2, 40);

    transitions.forEach((t, i) => {
      const arrowPulse = Math.sin(time * 2 + i) * 10;

      // From box
      ctx.fillStyle = t.color + '30';
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(50, t.y, 120, 60, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(t.from, 110, t.y + 35);

      // Forward arrow
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(180, t.y + 20);
      ctx.lineTo(380 + arrowPulse, t.y + 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(375 + arrowPulse, t.y + 15);
      ctx.lineTo(385 + arrowPulse, t.y + 20);
      ctx.lineTo(375 + arrowPulse, t.y + 25);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.font = '11px Arial';
      ctx.fillText(t.name + ' →', 280, t.y + 15);

      // Reverse arrow
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(380, t.y + 45);
      ctx.lineTo(180 - arrowPulse, t.y + 45);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = '11px Arial';
      ctx.fillText('← ' + t.reverse, 280, t.y + 58);

      // To box
      ctx.fillStyle = t.color + '30';
      ctx.strokeStyle = t.color;
      ctx.beginPath();
      ctx.roundRect(400, t.y, 120, 60, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(t.to, 460, t.y + 35);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      if (activeTab === 'states') drawStates(ctx, w, h);
      else if (activeTab === 'phase-diagram') drawPhaseDiagram(ctx, w, h);
      else drawTransitions(ctx, w, h);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawStates, drawPhaseDiagram, drawTransitions]);

  const quizQuestions = [
    { question: 'عند أي درجة حرارة يتحول الماء من سائل إلى غاز؟', options: ['0°C', '50°C', '100°C', '200°C'], correctIndex: 2, explanation: 'الماء يغلي عند 100°C تحت الضغط الجوي العادي.' },
    { question: 'ما اسم التحول المباشر من الحالة الصلبة إلى الغازية؟', options: ['التبخر', 'التسامي', 'الانصهار', 'التكاثف'], correctIndex: 1, explanation: 'التسامي هو تحول المادة من صلب إلى غاز مباشرة دون المرور بالحالة السائلة.' },
    { question: 'ماذا يحدث لحركة الجزيئات عند التسخين؟', options: ['تقل', 'تتوقف', 'تزداد', 'لا تتغير'], correctIndex: 2, explanation: 'زيادة الحرارة تزيد الطاقة الحركية للجزيئات فتتحرك بسرعة أكبر.' },
  ];

  return (
    <SimulationLayout title="حالات المادة والتحولات" titleGradient="from-cyan-400 to-blue-400" backgroundGradient="from-slate-900 via-cyan-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 w-full">
              <TabsTrigger value="states" className="flex-1 text-xs">حالات المادة</TabsTrigger>
              <TabsTrigger value="phase-diagram" className="flex-1 text-xs">مخطط الطور</TabsTrigger>
              <TabsTrigger value="transitions" className="flex-1 text-xs">التحولات</TabsTrigger>
            </TabsList>
          </Tabs>
          <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-xl border border-cyan-500/30 bg-slate-900" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsPlaying(!isPlaying)} className="border-cyan-500/50 text-cyan-300">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={initParticles} className="border-cyan-500/50 text-cyan-300">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3 p-3 bg-slate-800/40 rounded-xl">
            <div>
              <label className="text-xs text-slate-400">درجة الحرارة: {temperature}°C</label>
              <Slider value={[temperature]} onValueChange={v => setTemperature(v[0])} min={-50} max={150} step={1} className="mt-1" />
            </div>
            {activeTab === 'phase-diagram' && (
              <div>
                <label className="text-xs text-slate-400">الضغط: {pressure} atm</label>
                <Slider value={[pressure]} onValueChange={v => setPressure(v[0])} min={0.1} max={5} step={0.1} className="mt-1" />
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'درجة الحرارة', value: temperature, unit: '°C', color: 'text-cyan-300' },
              { label: 'الحالة', value: getState(temperature) === 'solid' ? 'صلب' : getState(temperature) === 'liquid' ? 'سائل' : 'غاز', color: 'text-blue-300' },
              { label: 'الضغط', value: pressure, unit: 'atm', color: 'text-violet-300' },
            ]}
            formulas={[
              { name: 'معادلة كلاوزيوس-كلابيرون', formula: 'dP/dT = ΔH/(T·ΔV)', description: 'العلاقة بين الضغط والحرارة عند التحول' },
            ]}
            facts={[
              'الماء من المواد القليلة التي يتمدد حجمها عند التجمد',
              'الهيليوم لا يتجمد عند الضغط الجوي العادي مهما انخفضت الحرارة',
              'التسامي يحدث في الثلج الجاف (CO₂) وكرات النفتالين',
            ]}
          />
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default StatesOfMatterSimulation;
