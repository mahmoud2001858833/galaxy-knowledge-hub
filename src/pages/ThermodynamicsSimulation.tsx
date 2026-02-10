import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Thermometer, Wind, Gauge } from 'lucide-react';
import { InfoSection, QuizSection } from '@/components/simulations';

interface Particle {
  x: number; y: number; vx: number; vy: number; radius: number; color: string;
}

const ThermodynamicsSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [temperature, setTemperature] = useState(300);
  const [volume, setVolume] = useState(70);
  const [activeTab, setActiveTab] = useState('ideal-gas');
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const initParticles = useCallback((temp: number, vol: number) => {
    const count = 60;
    const speed = Math.sqrt(temp / 100);
    const ps: Particle[] = [];
    const w = vol * 4;
    const h = 300;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const s = speed * (0.5 + Math.random());
      const hue = Math.min(60, (temp - 100) / 15);
      ps.push({
        x: 60 + Math.random() * (w - 20),
        y: 60 + Math.random() * (h - 20),
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
        radius: 4,
        color: `hsl(${hue}, 100%, 50%)`,
      });
    }
    particlesRef.current = ps;
    setParticles(ps);
  }, []);

  useEffect(() => { initParticles(temperature, volume); }, [temperature, volume, initParticles]);

  const drawIdealGas = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const boxW = volume * 4;
    const boxH = 300;
    const boxX = 50;
    const boxY = 50;

    // Container
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Piston (right wall)
    const pistonX = boxX + boxW;
    ctx.fillStyle = '#64748b';
    ctx.fillRect(pistonX - 5, boxY, 15, boxH);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(pistonX + 10, boxY + boxH / 2 - 15, 40, 30);

    // Particles
    const ps = particlesRef.current;
    for (const p of ps) {
      if (isPlaying) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x - p.radius < boxX) { p.x = boxX + p.radius; p.vx *= -1; }
        if (p.x + p.radius > boxX + boxW - 10) { p.x = boxX + boxW - 10 - p.radius; p.vx *= -1; }
        if (p.y - p.radius < boxY) { p.y = boxY + p.radius; p.vy *= -1; }
        if (p.y + p.radius > boxY + boxH) { p.y = boxY + boxH - p.radius; p.vy *= -1; }
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const hue = Math.max(0, Math.min(60, 60 - speed * 10));
      ctx.fillStyle = `hsl(${hue}, 100%, 55%)`;
      ctx.fill();
      // Glow
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Pressure gauge
    const pressure = (temperature * ps.length) / (boxW * boxH) * 5000;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`P = ${pressure.toFixed(1)} Pa`, w - 20, 30);
    ctx.fillText(`T = ${temperature} K`, w - 20, 50);
    ctx.fillText(`V = ${(boxW * boxH / 1000).toFixed(1)} L`, w - 20, 70);

    // Maxwell-Boltzmann distribution (small graph)
    const graphX = w - 220;
    const graphY = h - 140;
    const graphW = 200;
    const graphH = 120;
    ctx.fillStyle = 'rgba(15,23,42,0.8)';
    ctx.fillRect(graphX, graphY, graphW, graphH);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(graphX, graphY, graphW, graphH);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('توزيع ماكسويل-بولتزمان', graphX + graphW / 2, graphY + 15);

    // Draw distribution curve
    ctx.beginPath();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    const kB = 1.38e-23;
    const m = 4.65e-26; // N2
    const T = temperature;
    for (let i = 0; i < graphW - 20; i++) {
      const v = (i / (graphW - 20)) * 1200;
      const f = 4 * Math.PI * Math.pow(m / (2 * Math.PI * kB * T), 1.5) * v * v * Math.exp(-m * v * v / (2 * kB * T));
      const y = graphY + graphH - 10 - f * 1e25 * (graphH - 30);
      if (i === 0) ctx.moveTo(graphX + 10 + i, Math.max(graphY + 20, y));
      else ctx.lineTo(graphX + 10 + i, Math.max(graphY + 20, y));
    }
    ctx.stroke();
  }, [temperature, volume, isPlaying]);

  const drawCarnot = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    // PV Diagram
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    // Axes
    ctx.beginPath();
    ctx.moveTo(cx - 180, cy + 120);
    ctx.lineTo(cx + 180, cy + 120);
    ctx.moveTo(cx - 180, cy + 120);
    ctx.lineTo(cx - 180, cy - 120);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('V (الحجم)', cx, cy + 145);
    ctx.save();
    ctx.translate(cx - 200, cy);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('P (الضغط)', 0, 0);
    ctx.restore();

    // Carnot cycle path
    const points = [
      { x: cx - 120, y: cy - 80 },  // 1 - isothermal expansion start
      { x: cx + 80, y: cy - 20 },   // 2 - adiabatic expansion
      { x: cx + 120, y: cy + 80 },  // 3 - isothermal compression
      { x: cx - 80, y: cy + 20 },   // 4 - adiabatic compression
    ];

    const t = (Date.now() / 2000) % 4;
    const step = Math.floor(t);

    // Draw cycle
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < 4; i++) {
      const next = points[(i + 1) % 4];
      ctx.quadraticCurveTo(
        (points[i].x + next.x) / 2 + (i % 2 === 0 ? -20 : 20),
        (points[i].y + next.y) / 2,
        next.x, next.y
      );
    }
    ctx.closePath();
    ctx.stroke();

    // Labels
    const labels = ['تمدد متساوي الحرارة', 'تمدد أديباتي', 'انضغاط متساوي الحرارة', 'انضغاط أديباتي'];
    const colors = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === step ? colors[i] : '#64748b';
      ctx.font = i === step ? 'bold 13px sans-serif' : '11px sans-serif';
      ctx.textAlign = 'center';
      const lx = (points[i].x + points[(i + 1) % 4].x) / 2;
      const ly = (points[i].y + points[(i + 1) % 4].y) / 2 + (i < 2 ? -25 : 25);
      ctx.fillText(labels[i], lx, ly);
    }

    // Moving dot
    const from = points[step];
    const to = points[(step + 1) % 4];
    const frac = t - step;
    const dotX = from.x + (to.x - from.x) * frac;
    const dotY = from.y + (to.y - from.y) * frac;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
    ctx.fillStyle = colors[step];
    ctx.fill();
    ctx.shadowColor = colors[step];
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Efficiency
    const Th = temperature;
    const Tc = 300;
    const efficiency = ((Th - Tc) / Th * 100);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`الكفاءة: ${efficiency > 0 ? efficiency.toFixed(1) : 0}%`, cx, cy + 170);
    ctx.font = '12px monospace';
    ctx.fillText(`η = 1 - Tc/Th = 1 - ${Tc}/${Th}`, cx, cy + 190);
  }, [temperature]);

  const drawHeatTransfer = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = Date.now() / 1000;

    // Three modes side by side
    const modes = [
      { name: 'التوصيل', nameEn: 'Conduction', color: '#ef4444', x: w * 0.17 },
      { name: 'الحمل', nameEn: 'Convection', color: '#f97316', x: w * 0.5 },
      { name: 'الإشعاع', nameEn: 'Radiation', color: '#eab308', x: w * 0.83 },
    ];

    modes.forEach((mode, idx) => {
      const bx = mode.x - 70;
      const by = 80;
      const bw = 140;
      const bh = 200;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = mode.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      ctx.fillStyle = mode.color;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(mode.name, mode.x, by - 10);

      if (idx === 0) {
        // Conduction - vibrating particles in a rod
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 3; j++) {
            const px = bx + 15 + i * 12;
            const py = by + 80 + j * 20;
            const vibration = Math.sin(t * 5 + i * 0.5) * (10 - i) * 0.3;
            const hue = 60 - i * 6;
            ctx.beginPath();
            ctx.arc(px + vibration, py, 5, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.fill();
          }
        }
        // Heat source
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx, by + 60, 15, 80);
      } else if (idx === 1) {
        // Convection - circulating arrows
        for (let i = 0; i < 8; i++) {
          const angle = (t * 0.5 + i * Math.PI / 4) % (Math.PI * 2);
          const rx = 40;
          const ry = 60;
          const px = mode.x + Math.cos(angle) * rx;
          const py = by + bh / 2 + Math.sin(angle) * ry;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          const heat = (1 + Math.sin(angle)) / 2;
          ctx.fillStyle = `hsl(${60 - heat * 60}, 100%, 50%)`;
          ctx.fill();
        }
        // Flame at bottom
        for (let i = 0; i < 5; i++) {
          const fx = mode.x - 10 + i * 5;
          const fy = by + bh - 10 - Math.sin(t * 3 + i) * 8;
          ctx.beginPath();
          ctx.arc(fx, fy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
        }
      } else {
        // Radiation - wavy lines
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(234,179,8,${0.3 + i * 0.1})`;
          ctx.lineWidth = 2;
          for (let x = 0; x < bw; x += 2) {
            const y = by + 40 + i * 30 + Math.sin(t * 2 + x * 0.1 + i) * 8;
            if (x === 0) ctx.moveTo(bx + x, y);
            else ctx.lineTo(bx + x, y);
          }
          ctx.stroke();
        }
        // Sun icon
        ctx.beginPath();
        ctx.arc(mode.x, by + 30, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#eab308';
        ctx.fill();
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Temperature bar
    const barY = h - 50;
    const gradient = ctx.createLinearGradient(50, barY, w - 50, barY);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.5, '#eab308');
    gradient.addColorStop(1, '#ef4444');
    ctx.fillStyle = gradient;
    ctx.fillRect(50, barY, w - 100, 15);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`درجة الحرارة: ${temperature} K`, w / 2, barY - 10);
  }, [temperature]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (activeTab === 'ideal-gas') drawIdealGas(ctx, w, h);
      else if (activeTab === 'carnot') drawCarnot(ctx, w, h);
      else if (activeTab === 'heat-transfer') drawHeatTransfer(ctx, w, h);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawIdealGas, drawCarnot, drawHeatTransfer]);

  const formulas = [
    { name: 'قانون الغاز المثالي', formula: 'PV = nRT' },
    { name: 'كفاءة كارنو', formula: 'η = 1 - Tc/Th' },
    { name: 'الطاقة الحركية', formula: 'KE = 3/2 kBT' },
    { name: 'القانون الأول', formula: 'ΔU = Q - W' },
  ];

  const quizQuestions = [
    { question: 'ما هي وحدة قياس درجة الحرارة في النظام الدولي؟', options: ['كلفن', 'سلسيوس', 'فهرنهايت', 'رانكن'], correctIndex: 0 },
    { question: 'ماذا يحدث لضغط الغاز عند زيادة الحرارة مع ثبات الحجم؟', options: ['يزداد', 'ينقص', 'يبقى ثابتاً', 'ينعدم'], correctIndex: 0 },
    { question: 'ما هي العملية التي لا يتم فيها تبادل حرارة مع المحيط؟', options: ['أديباتية', 'متساوية الحرارة', 'متساوية الضغط', 'متساوية الحجم'], correctIndex: 0 },
  ];

  return (
    <SimulationLayout title="الديناميكا الحرارية" titleGradient="from-orange-400 to-red-400" backgroundGradient="from-slate-900 via-red-900/30 to-slate-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="grid grid-cols-3 mb-4 bg-white/10">
          <TabsTrigger value="ideal-gas" className="text-xs"><Thermometer className="w-3 h-3 ml-1" />الغاز المثالي</TabsTrigger>
          <TabsTrigger value="carnot" className="text-xs"><Gauge className="w-3 h-3 ml-1" />محرك كارنو</TabsTrigger>
          <TabsTrigger value="heat-transfer" className="text-xs"><Wind className="w-3 h-3 ml-1" />انتقال الحرارة</TabsTrigger>
        </TabsList>

        <div className="bg-black/40 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <canvas ref={canvasRef} width={700} height={420} className="w-full rounded-lg" style={{ maxHeight: '420px' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <label className="text-white/70 text-sm mb-2 block">درجة الحرارة: {temperature} K</label>
            <Slider min={100} max={1000} step={10} value={[temperature]} onValueChange={([v]) => setTemperature(v)} />
          </div>
          {activeTab === 'ideal-gas' && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="text-white/70 text-sm mb-2 block">الحجم: {volume}%</label>
              <Slider min={30} max={100} step={5} value={[volume]} onValueChange={([v]) => setVolume(v)} />
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={() => setIsPlaying(!isPlaying)} variant="outline" className="bg-white/10 border-white/20 text-white">
              {isPlaying ? <Pause className="w-4 h-4 ml-1" /> : <Play className="w-4 h-4 ml-1" />}
              {isPlaying ? 'إيقاف' : 'تشغيل'}
            </Button>
            <Button onClick={() => initParticles(temperature, volume)} variant="outline" className="bg-white/10 border-white/20 text-white">
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

export default ThermodynamicsSimulation;
