import React, { useRef, useEffect, useState, useCallback } from 'react';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Droplets, Waves, ArrowDown } from 'lucide-react';
import { InfoSection, QuizSection } from '@/components/simulations';

const FluidMechanicsSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('archimedes');
  const [fluidDensity, setFluidDensity] = useState(1000);
  const [objectDensity, setObjectDensity] = useState(500);
  const [pipeRadius, setPipeRadius] = useState(50);

  const drawArchimedes = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = Date.now() / 1000;
    const waterTop = 140;
    const waterH = 240;

    // Container
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w/2 - 120, waterTop - 20);
    ctx.lineTo(w/2 - 120, waterTop + waterH);
    ctx.lineTo(w/2 + 120, waterTop + waterH);
    ctx.lineTo(w/2 + 120, waterTop - 20);
    ctx.stroke();

    // Water with waves
    ctx.fillStyle = 'rgba(59,130,246,0.4)';
    ctx.beginPath();
    ctx.moveTo(w/2 - 119, waterTop);
    for (let x = w/2 - 119; x <= w/2 + 119; x++) {
      const wave = Math.sin(t * 2 + x * 0.05) * 3;
      ctx.lineTo(x, waterTop + wave);
    }
    ctx.lineTo(w/2 + 119, waterTop + waterH);
    ctx.lineTo(w/2 - 119, waterTop + waterH);
    ctx.closePath();
    ctx.fill();

    // Object (cube)
    const ratio = objectDensity / fluidDensity;
    const objSize = 60;
    const submerged = Math.min(1, ratio);
    const objY = waterTop - objSize * (1 - submerged) + Math.sin(t * 1.5) * 3;

    // Shadow in water
    if (submerged > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(w/2 - objSize/2 + 5, objY + objSize + 5, objSize, 10);
    }

    // Object
    const objColor = ratio > 1 ? '#ef4444' : ratio > 0.7 ? '#f97316' : '#22c55e';
    ctx.fillStyle = objColor;
    ctx.fillRect(w/2 - objSize/2, objY, objSize, objSize);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(w/2 - objSize/2, objY, objSize, objSize);

    // Forces arrows
    const centerX = w/2;
    const centerY = objY + objSize/2;

    // Weight (down)
    const weightLen = objectDensity / 20;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY);
    ctx.lineTo(centerX - 40, centerY + weightLen);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY + weightLen + 10);
    ctx.lineTo(centerX - 45, centerY + weightLen);
    ctx.lineTo(centerX - 35, centerY + weightLen);
    ctx.fill();
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('الوزن', centerX - 40, centerY + weightLen + 25);

    // Buoyancy (up)
    const buoyLen = (fluidDensity * submerged) / 20;
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(centerX + 40, centerY);
    ctx.lineTo(centerX + 40, centerY - buoyLen);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(centerX + 40, centerY - buoyLen - 10);
    ctx.lineTo(centerX + 35, centerY - buoyLen);
    ctx.lineTo(centerX + 45, centerY - buoyLen);
    ctx.fill();
    ctx.fillText('الطفو', centerX + 40, centerY - buoyLen - 15);

    // Info
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`كثافة السائل: ${fluidDensity} kg/m³`, w - 20, 30);
    ctx.fillText(`كثافة الجسم: ${objectDensity} kg/m³`, w - 20, 50);
    ctx.fillText(`النسبة: ${ratio.toFixed(2)}`, w - 20, 70);
    ctx.fillText(ratio > 1 ? '🔴 يغرق' : ratio === 1 ? '🟡 يطفو على السطح' : '🟢 يطفو', w - 20, 90);

    // Archimedes formula
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Fb = ρf × V × g', w/2, h - 20);
  }, [fluidDensity, objectDensity]);

  const drawPascal = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = Date.now() / 1000;
    const cx = w / 2;

    // Hydraulic press
    const leftR = 30;
    const rightR = 80;
    const baseY = 250;

    // Tubes
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 150 - leftR, baseY - 200, leftR * 2, 200);
    ctx.fillRect(cx + 150 - rightR, baseY - 150, rightR * 2, 150);

    // Connecting tube
    ctx.fillRect(cx - 150, baseY - 30, 300, 30);

    // Fluid
    ctx.fillStyle = 'rgba(59,130,246,0.5)';
    const press = Math.sin(t) * 20;
    ctx.fillRect(cx - 150 - leftR + 3, baseY - 160 + press, leftR * 2 - 6, 160 - press);
    ctx.fillRect(cx + 150 - rightR + 3, baseY - 120 - press * (leftR*leftR)/(rightR*rightR), rightR * 2 - 6, 120 + press * (leftR*leftR)/(rightR*rightR));
    ctx.fillRect(cx - 147, baseY - 27, 294, 24);

    // Pistons
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 150 - leftR + 2, baseY - 165 + press, leftR * 2 - 4, 10);
    ctx.fillRect(cx + 150 - rightR + 2, baseY - 125 - press * (leftR*leftR)/(rightR*rightR), rightR * 2 - 4, 10);

    // Force arrows
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    const f1 = 50;
    ctx.beginPath();
    ctx.moveTo(cx - 150, baseY - 200);
    ctx.lineTo(cx - 150, baseY - 200 - f1);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`F₁ = ${f1}N`, cx - 150, baseY - 260);

    const f2 = f1 * (rightR * rightR) / (leftR * leftR);
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(cx + 150, baseY - 170);
    ctx.lineTo(cx + 150, baseY - 170 - Math.min(f2 / 2, 80));
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.fillText(`F₂ = ${f2.toFixed(0)}N`, cx + 150, baseY - 260);

    // Labels
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px sans-serif';
    ctx.fillText(`A₁ = ${(Math.PI * leftR * leftR / 100).toFixed(0)} cm²`, cx - 150, baseY + 40);
    ctx.fillText(`A₂ = ${(Math.PI * rightR * rightR / 100).toFixed(0)} cm²`, cx + 150, baseY + 40);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#f97316';
    ctx.fillText('F₁/A₁ = F₂/A₂', cx, h - 30);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('قانون باسكال: الضغط ينتقل بالتساوي في جميع الاتجاهات', cx, h - 10);
  }, []);

  const drawBernoulli = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = Date.now() / 1000;
    const cy = h / 2;

    // Pipe with narrow section
    const narrowR = pipeRadius * 0.4;
    ctx.fillStyle = '#334155';
    // Top wall
    ctx.beginPath();
    ctx.moveTo(0, cy - pipeRadius);
    ctx.lineTo(w * 0.3, cy - pipeRadius);
    ctx.quadraticCurveTo(w * 0.4, cy - narrowR, w * 0.5, cy - narrowR);
    ctx.lineTo(w * 0.6, cy - narrowR);
    ctx.quadraticCurveTo(w * 0.7, cy - pipeRadius, w * 0.8, cy - pipeRadius);
    ctx.lineTo(w, cy - pipeRadius);
    ctx.lineTo(w, cy - pipeRadius - 10);
    ctx.lineTo(0, cy - pipeRadius - 10);
    ctx.fill();
    // Bottom wall
    ctx.beginPath();
    ctx.moveTo(0, cy + pipeRadius);
    ctx.lineTo(w * 0.3, cy + pipeRadius);
    ctx.quadraticCurveTo(w * 0.4, cy + narrowR, w * 0.5, cy + narrowR);
    ctx.lineTo(w * 0.6, cy + narrowR);
    ctx.quadraticCurveTo(w * 0.7, cy + pipeRadius, w * 0.8, cy + pipeRadius);
    ctx.lineTo(w, cy + pipeRadius);
    ctx.lineTo(w, cy + pipeRadius + 10);
    ctx.lineTo(0, cy + pipeRadius + 10);
    ctx.fill();

    // Flow particles
    for (let i = 0; i < 30; i++) {
      const baseX = ((t * 80 + i * 25) % (w + 20)) - 10;
      const yOff = (i % 5 - 2) * 10;
      let localR = pipeRadius;
      if (baseX > w * 0.3 && baseX < w * 0.7) {
        const mid = w * 0.5;
        const dist = Math.abs(baseX - mid) / (w * 0.2);
        localR = narrowR + (pipeRadius - narrowR) * dist;
      }
      const py = cy + yOff * (localR / pipeRadius);
      const speed = pipeRadius / Math.max(localR, 10);
      const size = 3 + speed;
      ctx.beginPath();
      ctx.arc(baseX, py, size, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${200 + speed * 20}, 100%, 60%)`;
      ctx.fill();
    }

    // Pressure indicators
    const sections = [
      { x: w * 0.15, label: 'منطقة واسعة', p: 'عالي', v: 'منخفضة', color: '#22c55e' },
      { x: w * 0.5, label: 'منطقة ضيقة', p: 'منخفض', v: 'عالية', color: '#ef4444' },
      { x: w * 0.85, label: 'منطقة واسعة', p: 'عالي', v: 'منخفضة', color: '#22c55e' },
    ];

    sections.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.label, s.x, 40);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px sans-serif';
      ctx.fillText(`الضغط: ${s.p}`, s.x, 60);
      ctx.fillText(`السرعة: ${s.v}`, s.x, 75);
    });

    // Bernoulli equation
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('P + ½ρv² + ρgh = ثابت', w / 2, h - 30);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('معادلة برنولي: مجموع الضغط والطاقة الحركية وطاقة الوضع ثابت', w / 2, h - 10);
  }, [pipeRadius]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (activeTab === 'archimedes') drawArchimedes(ctx, w, h);
      else if (activeTab === 'pascal') drawPascal(ctx, w, h);
      else drawBernoulli(ctx, w, h);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, drawArchimedes, drawPascal, drawBernoulli]);

  const formulas = [
    { name: 'قانون أرخميدس', formula: 'Fb = ρf × Vf × g', description: 'قوة الطفو تساوي وزن المائع المُزاح' },
    { name: 'قانون باسكال', formula: 'P₁ = P₂ (F₁/A₁ = F₂/A₂)', description: 'الضغط ينتقل بالتساوي في جميع الاتجاهات' },
    { name: 'معادلة برنولي', formula: 'P + ½ρv² + ρgh = const', description: 'حفظ الطاقة في الموائع المتحركة' },
    { name: 'معادلة الاستمرارية', formula: 'A₁v₁ = A₂v₂', description: 'حفظ الكتلة في أنبوب متغير المقطع' },
  ];

  const quizQuestions = [
    { question: 'ماذا يحدث للجسم إذا كانت كثافته أقل من كثافة السائل؟', options: ['يطفو', 'يغرق', 'يبقى معلقاً', 'يتبخر'], correctIndex: 0, explanation: 'عندما تكون كثافة الجسم أقل من كثافة السائل، تكون قوة الطفو أكبر من وزن الجسم فيطفو.' },
    { question: 'حسب معادلة برنولي، عندما تزداد سرعة المائع:', options: ['ينقص الضغط', 'يزداد الضغط', 'يبقى الضغط ثابتاً', 'يتوقف التدفق'], correctIndex: 0, explanation: 'معادلة برنولي تنص على أن زيادة السرعة يقابلها نقصان في الضغط للحفاظ على ثبات الطاقة الكلية.' },
    { question: 'ما هو تطبيق عملي لقانون باسكال؟', options: ['المكبس الهيدروليكي', 'المحرك الحراري', 'المولد الكهربائي', 'العدسة المكبرة'], correctIndex: 0, explanation: 'المكبس الهيدروليكي يستخدم مبدأ باسكال لمضاعفة القوة عبر مساحات مختلفة.' },
    { question: 'لماذا ترتفع الطائرة في الهواء؟', options: ['بسبب فرق الضغط فوق وتحت الجناح (برنولي)', 'بسبب خفة وزنها', 'بسبب قوة المحرك فقط', 'بسبب الجاذبية'], correctIndex: 0, explanation: 'شكل الجناح يجعل الهواء يتحرك أسرع فوقه مما يقلل الضغط ويخلق قوة رفع (مبدأ برنولي).' },
    { question: 'ما الذي يحدد ضغط المائع عند عمق معين؟', options: ['كثافة المائع والعمق', 'شكل الوعاء', 'لون المائع', 'درجة الحرارة فقط'], correctIndex: 0, explanation: 'ضغط المائع عند عمق h يساوي P = ρgh ويعتمد على كثافة المائع والعمق فقط.' },
  ];

  return (
    <SimulationLayout title="الموائع وقوى الطفو" titleGradient="from-blue-400 to-cyan-400" backgroundGradient="from-slate-900 via-blue-900/30 to-slate-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="grid grid-cols-3 mb-4 bg-white/10">
          <TabsTrigger value="archimedes" className="text-xs"><Droplets className="w-3 h-3 ml-1" />أرخميدس</TabsTrigger>
          <TabsTrigger value="pascal" className="text-xs"><ArrowDown className="w-3 h-3 ml-1" />باسكال</TabsTrigger>
          <TabsTrigger value="bernoulli" className="text-xs"><Waves className="w-3 h-3 ml-1" />برنولي</TabsTrigger>
        </TabsList>

        <div className="bg-black/40 rounded-xl p-4 backdrop-blur-sm border border-white/10">
          <canvas ref={canvasRef} width={700} height={420} className="w-full rounded-lg" style={{ maxHeight: '420px' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {activeTab === 'archimedes' && (
            <>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/70 text-sm mb-2 block">كثافة السائل: {fluidDensity} kg/m³</label>
                <Slider min={500} max={2000} step={50} value={[fluidDensity]} onValueChange={([v]) => setFluidDensity(v)} />
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <label className="text-white/70 text-sm mb-2 block">كثافة الجسم: {objectDensity} kg/m³</label>
                <Slider min={100} max={3000} step={50} value={[objectDensity]} onValueChange={([v]) => setObjectDensity(v)} />
              </div>
            </>
          )}
          {activeTab === 'bernoulli' && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="text-white/70 text-sm mb-2 block">قطر الأنبوب: {pipeRadius}</label>
              <Slider min={30} max={80} step={5} value={[pipeRadius]} onValueChange={([v]) => setPipeRadius(v)} />
            </div>
          )}
        </div>
      </Tabs>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoSection
          formulas={formulas}
          explanation="ميكانيكا الموائع تدرس سلوك السوائل والغازات عند السكون والحركة. تشمل مفاهيم الطفو والضغط الهيدروستاتيكي وتدفق الموائع."
          facts={[
            'الماء غير قابل للانضغاط تقريباً وهذا أساس عمل الأنظمة الهيدروليكية',
            'أرخميدس اكتشف قانون الطفو أثناء استحمامه وصرخ "يوريكا!"',
            'طائرة البوينغ 747 تولد قوة رفع تعادل 400 طن بفضل مبدأ برنولي',
            'الضغط في أعمق نقطة في المحيط (خندق ماريانا) يبلغ 1100 ضغط جوي',
          ]}
        />
        <QuizSection questions={quizQuestions} />
      </div>
    </SimulationLayout>
  );
};

export default FluidMechanicsSimulation;
