import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Droplets, Waves, ArrowDown, Eye, Layers } from 'lucide-react';
import { InfoSection, QuizSection } from '@/components/simulations';
import FluidLab3DScene from '@/components/fluids/FluidLab3DScene';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';
import { labSound } from '@/utils/labAudio';

const fluidChallenges: Challenge[] = [
  {
    id: 'neutral_buoyancy',
    title: 'تحقيق الطفو المحايد (Neutral Buoyancy)',
    description: 'اضبط كثافة الجسم لتتساوى تقريباً مع كثافة السائل (|ρ_obj - ρ_f| ≤ 50 kg/m³) واثبت لمدة 3 ثوانٍ.',
    targetMetric: 'فارق الكثافة',
    targetValue: 50,
    unit: 'kg/m³',
    holdDuration: 3,
    check: (m) => m.mode === 'archimedes' && Math.abs((m.objectDensity ?? 0) - (m.fluidDensity ?? 0)) <= 50,
  },
  {
    id: 'pascal_advantage',
    title: 'مضاعفة قوة باسكال الهيدروليكية',
    description: 'انتقل لنمط باسكال وشاهد مضاعفة القوة الميكانيكية بأكثر من 6.5 أضعاف لمدة 3 ثوانٍ.',
    targetMetric: 'نمط باسكال',
    targetValue: 1,
    unit: 'حالة',
    holdDuration: 3,
    check: (m) => m.mode === 'pascal',
  },
  {
    id: 'bernoulli_throat',
    title: 'تضيق فنتوري وخنق المائع (Venturi Constriction)',
    description: 'انتقل لنمط برنولي وارفع قطر الأنبوب الخارجي إلى ≥ 65 لملاحظة هبوط الضغط وزيادة سرعة المائع في الخانق.',
    targetMetric: 'قطر الأنبوب',
    targetValue: 65,
    unit: 'mm',
    holdDuration: 3,
    check: (m) => m.mode === 'bernoulli' && (m.pipeRadius ?? 0) >= 65,
  },
];

const FluidMechanicsSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [activeTab, setActiveTab] = useState<'archimedes' | 'pascal' | 'bernoulli'>('archimedes');
  const [fluidDensity, setFluidDensity] = useState(1000);
  const [objectDensity, setObjectDensity] = useState(500);
  const [pipeRadius, setPipeRadius] = useState(50);

  // 2D Drawing: Archimedes
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
    ctx.moveTo(w / 2 - 120, waterTop - 20);
    ctx.lineTo(w / 2 - 120, waterTop + waterH);
    ctx.lineTo(w / 2 + 120, waterTop + waterH);
    ctx.lineTo(w / 2 + 120, waterTop - 20);
    ctx.stroke();

    // Water with waves
    ctx.fillStyle = 'rgba(59,130,246,0.4)';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 119, waterTop);
    for (let x = w / 2 - 119; x <= w / 2 + 119; x++) {
      const wave = Math.sin(t * 2 + x * 0.05) * 3;
      ctx.lineTo(x, waterTop + wave);
    }
    ctx.lineTo(w / 2 + 119, waterTop + waterH);
    ctx.lineTo(w / 2 - 119, waterTop + waterH);
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
      ctx.fillRect(w / 2 - objSize / 2 + 5, objY + objSize + 5, objSize, 10);
    }

    // Object
    const objColor = ratio > 1 ? '#ef4444' : ratio > 0.7 ? '#f97316' : '#22c55e';
    ctx.fillStyle = objColor;
    ctx.fillRect(w / 2 - objSize / 2, objY, objSize, objSize);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(w / 2 - objSize / 2, objY, objSize, objSize);

    // Forces arrows
    const centerX = w / 2;
    const centerY = objY + objSize / 2;

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
    ctx.fillText('الوزن W', centerX - 40, centerY + weightLen + 25);

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
    ctx.fillText('الطفو Fb', centerX + 40, centerY - buoyLen - 15);

    // Info
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`كثافة السائل: ${fluidDensity} kg/m³`, w - 20, 30);
    ctx.fillText(`كثافة الجسم: ${objectDensity} kg/m³`, w - 20, 50);
    ctx.fillText(`النسبة: ${ratio.toFixed(2)}`, w - 20, 70);
    ctx.fillText(ratio > 1 ? '🔴 يغرق' : ratio === 1 ? '🟡 طفو محايد' : '🟢 يطفو', w - 20, 90);

    // Archimedes formula
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Fb = ρf × V × g', w / 2, h - 20);
  }, [fluidDensity, objectDensity]);

  // 2D Drawing: Pascal
  const drawPascal = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = Date.now() / 1000;
    const cx = w / 2;

    const leftR = 30;
    const rightR = 80;
    const baseY = 250;

    // Tubes
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 150 - leftR, baseY - 200, leftR * 2, 200);
    ctx.fillRect(cx + 150 - rightR, baseY - 150, rightR * 2, 150);
    ctx.fillRect(cx - 150, baseY - 30, 300, 30);

    // Fluid
    ctx.fillStyle = 'rgba(59,130,246,0.5)';
    const press = Math.sin(t) * 20;
    ctx.fillRect(cx - 150 - leftR + 3, baseY - 160 + press, leftR * 2 - 6, 160 - press);
    ctx.fillRect(cx + 150 - rightR + 3, baseY - 120 - press * (leftR * leftR) / (rightR * rightR), rightR * 2 - 6, 120 + press * (leftR * leftR) / (rightR * rightR));
    ctx.fillRect(cx - 147, baseY - 27, 294, 24);

    // Pistons
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 150 - leftR + 2, baseY - 165 + press, leftR * 2 - 4, 10);
    ctx.fillRect(cx + 150 - rightR + 2, baseY - 125 - press * (leftR * leftR) / (rightR * rightR), rightR * 2 - 4, 10);

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

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px sans-serif';
    ctx.fillText(`A₁ = ${(Math.PI * leftR * leftR / 100).toFixed(0)} cm²`, cx - 150, baseY + 40);
    ctx.fillText(`A₂ = ${(Math.PI * rightR * rightR / 100).toFixed(0)} cm²`, cx + 150, baseY + 40);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#f97316';
    ctx.fillText('F₁/A₁ = F₂/A₂', cx, h - 30);
  }, []);

  // 2D Drawing: Bernoulli
  const drawBernoulli = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = Date.now() / 1000;
    const cy = h / 2;
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

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('P + ½ρv² + ρgh = ثابت', w / 2, h - 30);
  }, [pipeRadius]);

  useEffect(() => {
    if (viewMode !== '2d') return;
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
  }, [viewMode, activeTab, drawArchimedes, drawPascal, drawBernoulli]);

  // Derived telemetry metrics
  const archimedesRatio = objectDensity / fluidDensity;
  const submergedPct = Math.min(100, Math.round(archimedesRatio * 100));
  const buoyantN = Math.round(Math.min(1, archimedesRatio) * fluidDensity * 0.0098 * 100);
  const weightN = Math.round(objectDensity * 0.0098 * 100);
  const pascalAdvantage = Math.pow(1.3 / 0.5, 2);
  const venturiSpeedup = Math.pow(pipeRadius / (pipeRadius * 0.45), 2);

  const formulas = [
    { name: 'قانون أرخميدس', formula: 'Fb = ρf × Vf × g', description: 'قوة الطفو تساوي وزن المائع المُزاح' },
    { name: 'قانون باسكال', formula: 'P₁ = P₂ (F₁/A₁ = F₂/A₂)', description: 'الضغط ينتقل بالتساوي في جميع الاتجاهات' },
    { name: 'معادلة برنولي', formula: 'P + ½ρv² + ρgh = const', description: 'حفظ الطاقة في الموائع المتحركة' },
    { name: 'معادلة الاستمرارية', formula: 'A₁v₁ = A₂v₂', description: 'حفظ الكتلة في أنبوب متغير المقطع' },
  ];

  const quizQuestions = [
    { question: 'ماذا يحدث للجسم إذا كانت كثافته أقل من كثافة السائل؟', options: ['يطفو', 'يغرق', 'يبقى معلقاً', 'يتبخر'], correctIndex: 0, explanation: 'عندما تكون كثافة الجسم أقل من كثافة السائل، تكون قوة الطفو أكبر من وزن الجسم فيطفو.' },
    { question: 'حسب معادلة برنولي، عندما تزداد سرعة المائع في الاختناق:', options: ['ينقص الضغط', 'يزداد الضغط', 'يبقى الضغط ثابتاً', 'يتوقف التدفق'], correctIndex: 0, explanation: 'معادلة برنولي تنص على أن زيادة السرعة يقابلها نقصان في الضغط للحفاظ على ثبات الطاقة الكلية.' },
    { question: 'ما هو تطبيق عملي مباشر لقانون باسكال؟', options: ['المكبس الهيدروليكي للمركبات', 'المحرك الحراري', 'المولد الكهربائي', 'العدسة المكبرة'], correctIndex: 0, explanation: 'المكبس الهيدروليكي يستخدم مبدأ باسكال لمضاعفة القوة عبر مساحات مكابس مختلفة.' },
    { question: 'لماذا ترتفع الطائرة في الهواء؟', options: ['بسبب فرق الضغط فوق وتحت الجناح (برنولي)', 'بسبب خفة وزنها', 'بسبب قوة المحرك فقط', 'بسبب الجاذبية'], correctIndex: 0, explanation: 'شكل الجناح المحدب يجعل الهواء يتدفق أسرع فوقه فينخفض الضغط العلوي وتتولد قوة الرفع.' },
    { question: 'ما الذي يحدد الضغط الهيدروستاتيكي لسائل عند عمق معين؟', options: ['كثافة المائع وعمق السائل', 'شكل الإناء وحجمه', 'لون السائل', 'درجة الحرارة فقط'], correctIndex: 0, explanation: 'ضغط السائل الساكن يعتمد حصراً على P = ρgh (الكثافة وتسارع الجاذبية والعمق).' },
  ];

  return (
    <SimulationLayout
      title="الموائع وقوى الطفو والديناميكا الهيدروليكية"
      titleGradient="from-blue-400 via-cyan-300 to-teal-400"
      backgroundGradient="from-slate-950 via-blue-950/40 to-slate-950"
    >
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); labSound.playLaserPulse(400); }} className="w-full" dir="rtl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1">
            <TabsTrigger value="archimedes" className="text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
              <Droplets className="w-3.5 h-3.5 ml-1" />
              أرخميدس والطفو
            </TabsTrigger>
            <TabsTrigger value="pascal" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <ArrowDown className="w-3.5 h-3.5 ml-1" />
              باسكال والمكبس الهيدروليكي
            </TabsTrigger>
            <TabsTrigger value="bernoulli" className="text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <Waves className="w-3.5 h-3.5 ml-1" />
              برنولي وأنبوب فنتوري
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
              className="text-xs border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5"
            >
              {viewMode === '3d' ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <Layers className="w-3.5 h-3.5 text-indigo-400" />}
              {viewMode === '3d' ? 'عرض 3D Arena' : 'عرض 2D Canvas'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-slate-700 bg-slate-900/80 text-slate-200"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </Button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
          {viewMode === '3d' ? (
            <div className="h-[460px] relative">
              <Canvas camera={{ position: [0, 1.5, 6.5], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 15, 10]} intensity={1.2} />
                <directionalLight position={[-10, -5, -5]} intensity={0.4} color="#38bdf8" />
                <FluidLab3DScene
                  mode={activeTab}
                  fluidDensity={fluidDensity}
                  objectDensity={objectDensity}
                  pipeRadius={pipeRadius}
                  isPlaying={isPlaying}
                />
                <OrbitControls enablePan={true} enableZoom={true} minDistance={3} maxDistance={14} />
              </Canvas>

              {/* CyberLab HUD */}
              <div className="absolute top-3 left-3 pointer-events-none">
                <CyberLabHUD
                  metrics={
                    activeTab === 'archimedes'
                      ? [
                          { label: 'قوة الطفو Fb', value: buoyantN, unit: 'N', color: '#10b981' },
                          { label: 'الوزن W', value: weightN, unit: 'N', color: '#ef4444' },
                          { label: 'نسبة الغمر', value: `${submergedPct}%`, color: '#38bdf8' },
                          { label: 'الحالة', value: archimedesRatio > 1 ? 'يغرق' : archimedesRatio === 1 ? 'معلق' : 'يطفو', color: '#f59e0b' },
                        ]
                      : activeTab === 'pascal'
                      ? [
                          { label: 'قوة الإدخال F1', value: 50, unit: 'N', color: '#f59e0b' },
                          { label: 'قوة الرفع F2', value: Math.round(50 * pascalAdvantage), unit: 'N', color: '#10b981' },
                          { label: 'المضاعفة', value: `${pascalAdvantage.toFixed(1)}×`, color: '#38bdf8' },
                        ]
                      : [
                          { label: 'قطر الأنبوب', value: pipeRadius, unit: 'mm', color: '#38bdf8' },
                          { label: 'تسارع الخانق', value: `${venturiSpeedup.toFixed(1)}×`, color: '#10b981' },
                          { label: 'انخفاض ضغط P2', value: 'منخفض', color: '#ef4444' },
                        ]
                  }
                  status={isPlaying ? 'ACTIVE' : 'IDLE'}
                  waveformData={[
                    buoyantN % 40,
                    weightN % 35,
                    activeTab === 'bernoulli' ? venturiSpeedup * 5 : 20,
                    30,
                  ]}
                />
              </div>
            </div>
          ) : (
            <div className="p-4">
              <canvas ref={canvasRef} width={700} height={420} className="w-full rounded-lg" style={{ maxHeight: '420px' }} />
            </div>
          )}
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {activeTab === 'archimedes' && (
            <>
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
                  <span>كثافة السائل (Fluid Density ρf)</span>
                  <span className="font-mono text-cyan-400">{fluidDensity} kg/m³</span>
                </div>
                <Slider min={500} max={2000} step={50} value={[fluidDensity]} onValueChange={([v]) => setFluidDensity(v)} />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>بنزين (700)</span>
                  <span>ماء نقي (1000)</span>
                  <span>عسل (1420)</span>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
                  <span>كثافة الجسم المغمور (Object Density ρobj)</span>
                  <span className="font-mono text-amber-400">{objectDensity} kg/m³</span>
                </div>
                <Slider min={100} max={3000} step={50} value={[objectDensity]} onValueChange={([v]) => setObjectDensity(v)} />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>خشب خفيف (300)</span>
                  <span>بلاستيك (900)</span>
                  <span>ألومنيوم (2700)</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'bernoulli' && (
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 md:col-span-2">
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
                <span>قطر الأنبوب الخارجي (Pipe Outer Diameter)</span>
                <span className="font-mono text-cyan-400">{pipeRadius} mm</span>
              </div>
              <Slider min={30} max={80} step={5} value={[pipeRadius]} onValueChange={([v]) => setPipeRadius(v)} />
            </div>
          )}
        </div>
      </Tabs>

      {/* Gamified Challenges */}
      <div className="mt-6">
        <LabChallengeEngine
          challenges={fluidChallenges}
          currentMetrics={{
            mode: activeTab,
            fluidDensity: fluidDensity,
            objectDensity: objectDensity,
            pipeRadius: pipeRadius,
            buoyantN: buoyantN,
            weightN: weightN,
          }}
        />
      </div>

      {/* AI Lab CoPilot */}
      <div className="mt-4">
        <LiveAILabCoPilot
          experimentName="ميكانيكا الموائع والطفو"
          currentMetrics={{
            mode: activeTab,
            fluidDensity: fluidDensity,
            objectDensity: objectDensity,
            densityRatio: Number(archimedesRatio.toFixed(2)),
            submergedPct: submergedPct,
            buoyantN: buoyantN,
            weightN: weightN,
            pipeRadius: activeTab === 'bernoulli' ? pipeRadius : undefined,
          }}
          hint={
            activeTab === 'archimedes'
              ? archimedesRatio > 1
                ? 'الجسم يغرق لأن وزنه أكبر من قوة الطفو العظمى للمائع المزاح.'
                : 'الجسم يطفو مستقراً عند النقطة التي يتساوى عندها وزن المائع المزاح مع وزن الجسم الكلي.'
              : activeTab === 'pascal'
              ? 'الضغط ينتقل بالتساوي في المائع المحصور، ومساحة المكبس الكبير تضاعف القوة بنفس نسبة المساحة A2/A1.'
              : 'في تضيق فنتوري، تزداد سرعة التدفق للحفاظ على تدفق الكتلة مما يتسبب في هبوط فوري للضغط الجانبي.'
          }
        />
      </div>

      {/* Scientific Theory & Quiz */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoSection
          formulas={formulas}
          explanation="ميكانيكا الموائع تدرس سلوك السوائل والغازات عند السكون والحركة. تشمل مفاهيم الطفو وقاعدة أرخميدس، والضغط الهيدروستاتيكي، ومبدأ باسكال، وتدفق برنولي في الأنابيب الخانقة."
          facts={[
            'الماء غير قابل للانضغاط تقريباً وهذا أساس عمل المكابس والأنظمة الهيدروليكية',
            'أرخميدس اكتشف قانون الطفو أثناء استحمامه وصرخ باليونانية "يوريكا!"',
            'طائرة البوينغ 747 تولد قوة رفع تعادل مئات الأطنان بفضل مبدأ برنولي وانحناء الهواء',
            'الضغط في أعمق نقطة في المحيط (خندق ماريانا) يتجاوز 1100 ضغط جوي',
          ]}
        />
        <QuizSection questions={quizQuestions} />
      </div>
    </SimulationLayout>
  );
};

export default FluidMechanicsSimulation;
