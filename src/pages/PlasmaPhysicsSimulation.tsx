import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

interface PlasmaParticle {
  x: number; y: number; vx: number; vy: number;
  charge: number; color: string; trail: {x:number,y:number}[];
}

const PlasmaPhysicsSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<PlasmaParticle[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [temperature, setTemperature] = useState(5000);
  const [magneticField, setMagneticField] = useState(50);
  const [activeTab, setActiveTab] = useState('ionization');

  const initParticles = useCallback(() => {
    const ps: PlasmaParticle[] = [];
    for (let i = 0; i < 80; i++) {
      const charge = Math.random() > 0.5 ? 1 : -1;
      const speed = (temperature / 2000) * (1 + Math.random() * 2);
      const angle = Math.random() * Math.PI * 2;
      ps.push({
        x: 100 + Math.random() * 400, y: 50 + Math.random() * 300,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        charge, color: charge > 0 ? '#ff6b6b' : '#4ecdc4',
        trail: [],
      });
    }
    particlesRef.current = ps;
  }, [temperature]);

  useEffect(() => { initParticles(); }, [initParticles]);

  const drawIonization = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0a2e');
    grad.addColorStop(1, '#1a0a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Container
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 30, w - 100, h - 60);

    // Update & draw particles
    const B = magneticField / 100;
    particlesRef.current.forEach(p => {
      if (isPlaying) {
        // Lorentz force effect
        const fx = p.charge * p.vy * B * 0.5;
        const fy = -p.charge * p.vx * B * 0.5;
        p.vx += fx * 0.1;
        p.vy += fy * 0.1;
        p.x += p.vx;
        p.y += p.vy;
        // Bounce
        if (p.x < 55 || p.x > w - 55) p.vx *= -1;
        if (p.y < 35 || p.y > h - 35) p.vy *= -1;
        p.x = Math.max(55, Math.min(w - 55, p.x));
        p.y = Math.max(35, Math.min(h - 35, p.y));
        p.trail.push({x: p.x, y: p.y});
        if (p.trail.length > 8) p.trail.shift();
      }
      // Draw trail
      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        p.trail.forEach(t => ctx.lineTo(t.x, t.y));
        ctx.strokeStyle = p.color + '40';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.charge > 0 ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      // Glow
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`درجة الحرارة: ${temperature} K`, w / 2, h - 8);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('● أيون موجب', w / 4, 20);
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText('● إلكترون', 3 * w / 4, 20);
  }, [isPlaying, temperature, magneticField]);

  const drawMagneticConfinement = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a1628');
    grad.addColorStop(1, '#0a0a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Tokamak ring
    const cx = w / 2, cy = h / 2;
    const rx = 180, ry = 120;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 30, ry - 20, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#6366f144';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Magnetic field lines
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + (Date.now() / 2000);
      const x1 = cx + Math.cos(angle) * (rx - 15);
      const y1 = cy + Math.sin(angle) * (ry - 10);
      ctx.beginPath();
      ctx.arc(x1, y1, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#a78bfa';
      ctx.fill();
    }

    // Plasma ring
    const time = Date.now() / 1000;
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2 + time * 2;
      const r = rx - 15 + Math.sin(angle * 3 + time) * 8;
      const rY = ry - 10 + Math.sin(angle * 3 + time) * 5;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * rY;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(i * 9 + time * 50) % 360}, 100%, 70%)`;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('حصر البلازما المغناطيسي (توكاماك)', cx, 20);
  }, []);

  const drawApplications = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a1020');
    grad.addColorStop(1, '#1a0530');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const apps = [
      { name: 'شاشات البلازما', x: w * 0.2, y: h * 0.25, color: '#f472b6' },
      { name: 'قطع البلازما', x: w * 0.5, y: h * 0.25, color: '#fb923c' },
      { name: 'الاندماج النووي', x: w * 0.8, y: h * 0.25, color: '#a78bfa' },
      { name: 'البرق', x: w * 0.2, y: h * 0.65, color: '#fbbf24' },
      { name: 'الشفق القطبي', x: w * 0.5, y: h * 0.65, color: '#34d399' },
      { name: 'النجوم', x: w * 0.8, y: h * 0.65, color: '#f87171' },
    ];

    const time = Date.now() / 1000;
    apps.forEach((app, i) => {
      // Animated circle
      const pulse = Math.sin(time * 2 + i) * 5;
      ctx.beginPath();
      ctx.arc(app.x, app.y, 30 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = app.color + '30';
      ctx.fill();
      ctx.strokeStyle = app.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Plasma particles inside
      for (let j = 0; j < 5; j++) {
        const a = time * 3 + j * 1.2 + i;
        const px = app.x + Math.cos(a) * (15 + pulse * 0.5);
        const py = app.y + Math.sin(a) * (15 + pulse * 0.5);
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = app.color;
        ctx.fill();
      }

      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(app.name, app.x, app.y + 50);
    });

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('تطبيقات البلازما', w / 2, h - 15);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      if (activeTab === 'ionization') drawIonization(ctx, w, h);
      else if (activeTab === 'confinement') drawMagneticConfinement(ctx, w, h);
      else drawApplications(ctx, w, h);
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawIonization, drawMagneticConfinement, drawApplications]);

  const quizQuestions = [
    { question: 'ما هي البلازما؟', options: ['غاز بارد', 'غاز متأين', 'سائل ساخن', 'صلب متوهج'], correctIndex: 1, explanation: 'البلازما هي حالة رابعة للمادة تتكون من غاز متأين يحتوي على إلكترونات حرة وأيونات.' },
    { question: 'ما نسبة المادة المرئية في الكون التي توجد كبلازما؟', options: ['10%', '50%', '75%', '99%'], correctIndex: 3, explanation: 'أكثر من 99% من المادة المرئية في الكون هي بلازما، بما في ذلك النجوم.' },
    { question: 'ما الجهاز المستخدم لحصر البلازما في أبحاث الاندماج النووي؟', options: ['مسرع خطي', 'توكاماك', 'مجهر إلكتروني', 'مطياف'], correctIndex: 1, explanation: 'التوكاماك يستخدم مجالات مغناطيسية لحصر البلازما الساخنة لتحقيق الاندماج النووي.' },
    { question: 'ما درجة الحرارة التقريبية لقلب الشمس؟', options: ['15 مليون كلفن', '1000 كلفن', '100 ألف كلفن', '1 مليار كلفن'], correctIndex: 0, explanation: 'درجة حرارة قلب الشمس حوالي 15 مليون كلفن، وهي كافية لإحداث تفاعلات اندماج نووي.' },
    { question: 'ما تأثير المجال المغناطيسي على جسيمات البلازما؟', options: ['تتحرك في مسارات حلزونية', 'تتوقف عن الحركة', 'تتسارع للأمام فقط', 'لا تتأثر'], correctIndex: 0, explanation: 'قوة لورنتز تجبر الجسيمات المشحونة على التحرك في مسارات حلزونية حول خطوط المجال المغناطيسي.' },
  ];

  return (
    <SimulationLayout title="فيزياء البلازما" titleGradient="from-purple-400 to-pink-400" backgroundGradient="from-slate-900 via-purple-900 to-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 w-full">
              <TabsTrigger value="ionization" className="flex-1 text-xs">التأين</TabsTrigger>
              <TabsTrigger value="confinement" className="flex-1 text-xs">الحصر المغناطيسي</TabsTrigger>
              <TabsTrigger value="applications" className="flex-1 text-xs">التطبيقات</TabsTrigger>
            </TabsList>
          </Tabs>
          <canvas ref={canvasRef} width={600} height={400} className="w-full rounded-xl border border-purple-500/30 bg-slate-900" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsPlaying(!isPlaying)} className="border-purple-500/50 text-purple-300">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" onClick={initParticles} className="border-purple-500/50 text-purple-300">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
          {activeTab === 'ionization' && (
            <div className="space-y-3 p-3 bg-slate-800/40 rounded-xl">
              <div>
                <label className="text-xs text-slate-400">درجة الحرارة: {temperature} K</label>
                <Slider value={[temperature]} onValueChange={v => setTemperature(v[0])} min={1000} max={50000} step={500} className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-slate-400">شدة المجال المغناطيسي: {magneticField}%</label>
                <Slider value={[magneticField]} onValueChange={v => setMagneticField(v[0])} min={0} max={100} step={5} className="mt-1" />
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <InfoSection
            data={[
              { label: 'درجة الحرارة', value: temperature, unit: 'K', color: 'text-purple-300' },
              { label: 'المجال المغناطيسي', value: magneticField, unit: '%', color: 'text-pink-300' },
              { label: 'درجة التأين', value: Math.min(100, temperature / 500), unit: '%', color: 'text-cyan-300' },
            ]}
            formulas={[
              { name: 'طاقة التأين', formula: 'E = 13.6 eV (للهيدروجين)', description: 'الطاقة اللازمة لإزالة إلكترون' },
              { name: 'قوة لورنتز', formula: 'F = qv × B', description: 'القوة على شحنة متحركة في مجال مغناطيسي' },
            ]}
            facts={[
              'البلازما هي الحالة الرابعة للمادة',
              'الشمس كرة عملاقة من البلازما',
              'البرق هو مثال على البلازما في الطبيعة',
              'شاشات البلازما تستخدم غازات متأينة لإنتاج الضوء',
            ]}
            explanation="البلازما تتكون عند تسخين الغاز لدرجات حرارة عالية جداً فتنفصل الإلكترونات عن الذرات مكونة خليطاً من الأيونات والإلكترونات الحرة."
          />
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default PlasmaPhysicsSimulation;
