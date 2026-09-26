import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Clock, Ruler, Zap, Eye, Layers } from 'lucide-react';
import { InfoSection, QuizSection } from '@/components/simulations';
import RelativityLab3DScene from '@/components/relativity/RelativityLab3DScene';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';
import { labSound } from '@/utils/labAudio';

const c = 299792458; // Speed of light m/s

const relativityChallenges: Challenge[] = [
  {
    id: 'moderate_gamma',
    title: 'عامل لورنتز المعتدل (γ ≈ 1.15)',
    description: 'اضبط السرعة على 50% من سرعة الضوء (v = 0.50 c) وشاهد بداية تمدد الزمن الملحوظ واثبت 3 ثوانٍ.',
    targetMetric: 'السرعة % c',
    targetValue: 50,
    unit: '% c',
    holdDuration: 3,
    check: (m) => Math.abs((m.velocityPercent ?? 0) - 50) <= 2,
  },
  {
    id: 'double_time',
    title: 'مضاعفة زمن لورنتز (γ ≥ 2.00)',
    description: 'ارفع السرعة إلى ≥ 86.6% c لتشهد تدفق الزمن بمعدل النصف تماماً (تمدد الزمن للضعف) واثبت 3 ثوانٍ.',
    targetMetric: 'عامل لورنتز γ',
    targetValue: 2.0,
    unit: 'γ',
    holdDuration: 3,
    check: (m) => (m.gamma ?? 0) >= 2.0,
  },
  {
    id: 'ultra_relativistic',
    title: 'الحافة الفائقة لسرعة الضوء (v ≥ 95% c)',
    description: 'ادفع بالسرعة نحو الحاجز الأقصى (≥ 95% c) ولاحظ انكماش طول المركبة لأقل من ثلث طولها الأصلي واثبت 3 ثوانٍ.',
    targetMetric: 'السرعة القصوى',
    targetValue: 95,
    unit: '% c',
    holdDuration: 3,
    check: (m) => (m.velocityPercent ?? 0) >= 95,
  },
];

const SpecialRelativitySimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [activeTab, setActiveTab] = useState<'time-dilation' | 'length-contraction' | 'mass-energy'>('time-dilation');
  const [velocityPercent, setVelocityPercent] = useState(60);
  const timeRef = useRef(0);

  const beta = velocityPercent / 100;
  const gamma = useMemo(() => {
    return 1 / Math.sqrt(Math.max(0.0001, 1 - Math.pow(beta, 2)));
  }, [beta]);

  const speedKms = Math.round((beta * c) / 1000);
  const timeDilationPct = Number(((1 - 1 / gamma) * 100).toFixed(1));
  const lengthContractionPct = Number(((1 - 1 / gamma) * 100).toFixed(1));

  // 2D Drawing Fallback
  const drawTimeDilation = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = timeRef.current;
    const cx = w / 2;

    const drawClock = (x: number, y: number, r: number, speed: number, label: string, color: string) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(15,23,42,0.8)';
      ctx.fill();

      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * (r - 10), y + Math.sin(a) * (r - 10));
        ctx.lineTo(x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3));
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      const sa = (t * speed) % (Math.PI * 2) - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(sa) * (r - 15), y + Math.sin(sa) * (r - 15));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y + r + 25);
    };

    drawClock(cx - 140, h / 2 - 20, 70, 2, 'ساعة ثابتة (المراقب)', '#22c55e');
    drawClock(cx + 140, h / 2 - 20, 70, 2 / gamma, 'ساعة متحركة (المسافر)', '#f59e0b');

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Δt' = γ × Δt₀ = ${gamma.toFixed(3)} × Δt₀`, cx, h - 30);
  }, [gamma]);

  const drawLengthContraction = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const restLen = 220;
    const contractedLen = restLen / gamma;

    const y1 = h / 2 - 60;
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(cx - restLen / 2, y1 - 15, restLen, 30);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`الطول الساكن L₀ = ${restLen} m`, cx, y1 + 35);

    const y2 = h / 2 + 50;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - contractedLen / 2, y2 - 15, contractedLen, 30);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`الطول المتقلص L = ${(restLen / gamma).toFixed(1)} m`, cx, y2 + 35);
  }, [gamma]);

  const drawMassEnergy = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;

    ctx.fillStyle = '#ec4899';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`E = γ m₀ c² = ${gamma.toFixed(3)} E₀`, cx, h / 2);
  }, [gamma]);

  useEffect(() => {
    if (viewMode !== '2d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const animate = () => {
      if (isPlaying) timeRef.current += 0.016;
      const w = canvas.width;
      const h = canvas.height;
      if (activeTab === 'time-dilation') drawTimeDilation(ctx, w, h);
      else if (activeTab === 'length-contraction') drawLengthContraction(ctx, w, h);
      else drawMassEnergy(ctx, w, h);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [viewMode, activeTab, isPlaying, drawTimeDilation, drawLengthContraction, drawMassEnergy]);

  const formulas = [
    { name: 'معامل لورنتز', formula: 'γ = 1/√(1-v²/c²)', description: 'العامل الحاسم الذي يحدد مقدار التأثيرات النسبية' },
    { name: 'تمدد الزمن', formula: "Δt = γ · Δt₀", description: 'الزمن يمر أبطأ بالنسبة للمراقب المتحرك بسرعة نسبية' },
    { name: 'تقلص الطول', formula: 'L = L₀ / γ', description: 'الأجسام المتحركة تتقلص في اتجاه حركتها فقط' },
    { name: 'تكافؤ الكتلة والطاقة', formula: 'E = γ · m₀ · c²', description: 'الطاقة الكلية تشمل طاقة السكون والطاقة الحركية النسبية' },
  ];

  const quizQuestions = [
    { question: 'ماذا يحدث لمعدل سريان الزمن داخل مركبة تقترب من سرعة الضوء مقارنة بالأرض؟', options: ['يتباطأ الزمن بالنسبة لساعة الأرض', 'يتسارع الزمن', 'يتوقف تماماً عند أي سرعة', 'لا يتأثر'], correctIndex: 0, explanation: 'حسب النسبية الخاصة، الزمن يتمدد (يمر أبطأ) كلما اقتربت السرعة من سرعة الضوء c.' },
    { question: 'ما قيمة معامل لورنتز γ عند السكون (v = 0)؟', options: ['1', '0', '∞', 'غير محددة'], correctIndex: 0, explanation: 'عند v = 0 يصبح γ = 1/√(1-0) = 1، مما يعني انعدام التأثيرات النسبية وظهور الفيزياء الكلاسيكية.' },
    { question: 'كم تساوي الطاقة المكافئة لكتلة 1 كغ من المادة حسب E = mc²؟', options: ['9 × 10¹⁶ جول', '3 × 10⁸ جول', '1 جول', '6.02 × 10²³ جول'], correctIndex: 0, explanation: 'E = 1 × (3 × 10⁸)² = 9 × 10¹⁶ جول، وهي طاقة هائلة تعادل انفجار 21.5 ميغاطن من مادة TNT.' },
    { question: 'ما الفرضية الثورية الأساسية لألبرت أينشتاين في النسبية الخاصة؟', options: ['سرعة الضوء في الفراغ ثابتة ومطلقة لجميع المراقبين', 'الزمن والمكان مطلقان', 'الكتلة لا تتغير بالسرعة', 'الكون ساكن لا يتمدد'], correctIndex: 0, explanation: 'فرضية أينشتاين أن سرعة الضوء في الفراغ (c) ثابتة دائماً لجميع المراقبين في كافة الأطر القصورية.' },
    { question: 'لماذا يستحيل على أي جسم ذي كتلة سكون تجاوز سرعة الضوء؟', options: ['لأن كتلته النسبية وطاقته المطلوبة تتجهان إلى اللانهاية', 'بسبب احتكاك الفضاء', 'بسبب نفاد الوقود فقط', 'بسبب تبريد المحرك'], correctIndex: 0, explanation: 'عند v → c يتجه γ إلى اللانهاية، فتتطلب زيادة السرعة طاقة لا نهائية يستحيل توفيرها في الكون.' },
  ];

  return (
    <SimulationLayout
      title="النسبية الخاصة والزمكان ثلاثي الأبعاد"
      titleGradient="from-amber-400 via-orange-300 to-rose-400"
      backgroundGradient="from-slate-950 via-amber-950/30 to-slate-950"
    >
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); labSound.playLaserPulse(400); }} className="w-full" dir="rtl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1">
            <TabsTrigger value="time-dilation" className="text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Clock className="w-3.5 h-3.5 ml-1" />
              تمدد الزمن وساعة الضوء
            </TabsTrigger>
            <TabsTrigger value="length-contraction" className="text-xs data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300">
              <Ruler className="w-3.5 h-3.5 ml-1" />
              تقلص الطول لورنتز
            </TabsTrigger>
            <TabsTrigger value="mass-energy" className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              <Zap className="w-3.5 h-3.5 ml-1" />
              تكافؤ الكتلة والطاقة E = mc²
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
              className="text-xs border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5"
            >
              {viewMode === '3d' ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <Layers className="w-3.5 h-3.5 text-sky-400" />}
              {viewMode === '3d' ? 'عرض 3D Warp Arena' : 'عرض 2D Canvas'}
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

        {/* Viewport Box */}
        <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
          {viewMode === '3d' ? (
            <div className="h-[460px] relative">
              <Canvas camera={{ position: [0, 1.5, 6.5], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 15, 10]} intensity={1.2} />
                <directionalLight position={[-10, -5, -5]} intensity={0.4} color="#f59e0b" />
                <RelativityLab3DScene
                  mode={activeTab}
                  velocityPercent={velocityPercent}
                  gamma={gamma}
                  isPlaying={isPlaying}
                />
                <OrbitControls enablePan={true} enableZoom={true} minDistance={3} maxDistance={14} />
              </Canvas>

              {/* CyberLab HUD */}
              <div className="absolute top-3 left-3 pointer-events-none">
                <CyberLabHUD
                  metrics={[
                    { label: 'السرعة v', value: `${velocityPercent}% c`, color: '#f59e0b' },
                    { label: 'معامل لورنتز γ', value: gamma.toFixed(4), color: '#38bdf8' },
                    { label: 'السرعة الفعلية', value: `${speedKms.toLocaleString()} km/s`, color: '#10b981' },
                    { label: 'تمدد الزمن Δt', value: `+${timeDilationPct}%`, color: '#c084fc' },
                    { label: 'انكماش الطول L', value: `${(100 / gamma).toFixed(1)}%`, color: '#f43f5e' },
                  ]}
                  status={velocityPercent >= 90 ? 'ERROR' : isPlaying ? 'ACTIVE' : 'IDLE'}
                  waveformData={[
                    gamma * 10,
                    velocityPercent % 30,
                    timeDilationPct % 35,
                    20,
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
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
              <span>السرعة النسبية كنسبة من سرعة الضوء (v/c)</span>
              <span className="font-mono text-amber-400 font-bold">{velocityPercent}% c</span>
            </div>
            <Slider min={0} max={99} step={1} value={[velocityPercent]} onValueChange={([v]) => setVelocityPercent(v)} />
            <div className="flex justify-between text-[10px] text-slate-500 mt-2">
              <span>0% (سكون كلاسيكي)</span>
              <span>86.6% (تضاعف الزمن γ=2)</span>
              <span>99% (أقصى سرعة relativistic)</span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 flex flex-col justify-center">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-300">معامل لورنتز الحسابي (Lorentz Factor γ):</span>
              <span className="text-xl font-bold font-mono text-cyan-400">{gamma.toFixed(4)}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              الزمن يمر أبطأ بنسبة {timeDilationPct}% والطول يتقلص إلى {(100 / gamma).toFixed(1)}% من قيمته الأصلية.
            </p>
          </div>
        </div>
      </Tabs>

      {/* Gamified Challenges */}
      <div className="mt-6">
        <LabChallengeEngine
          challenges={relativityChallenges}
          currentMetrics={{
            velocityPercent: velocityPercent,
            gamma: gamma,
          }}
        />
      </div>

      {/* Live AI Lab CoPilot */}
      <div className="mt-4">
        <LiveAILabCoPilot
          experimentName="النسبية الخاصة والزمكان"
          currentMetrics={{
            mode: activeTab,
            velocityPercent: velocityPercent,
            speedKms: speedKms,
            gamma: Number(gamma.toFixed(4)),
            timeDilationPct: timeDilationPct,
          }}
          hint={
            activeTab === 'time-dilation'
              ? `بسبب ثبات سرعة الضوء c، يقطع الفوتون في الساعة المتحركة مساراً قطرياً أطول، مما يتطلب وقتاً أطول لكل نبضة (Δt = γ Δt₀).`
              : activeTab === 'length-contraction'
              ? 'التقلص اللورنتزي يحدث فقط في الاتجاه الموازي لخط الحركة، بينما تبقى الأبعاد العمودية دون أي تغيير.'
              : 'كلما اقتربت السرعة من c، تزداد مقاومة الجسم للتسارع وتتجه كتلته النسبية m = γ m₀ إلى اللانهاية.'
          }
        />
      </div>

      {/* Scientific Theory & Quiz */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoSection
          formulas={formulas}
          explanation="النسبية الخاصة لأينشتاين (1905) أحدثت ثورة جذرية في مفاهيم الزمان والمكان المطلقين، وأثبتت أن قياسات الزمن والأطوال نسبية وتعتمد على الحالة الحركية للمراقب."
          facts={[
            'سرعة الضوء في الفراغ 299,792,458 م/ث هي الثابت الكوني المطلق والسرعة القصوى للمعلومات',
            'أنظمة الملاحة بالأقمار الصناعية GPS تتطلب تصحيحات نسبية يومية دقيقة لمنع أخطاء بمقدار 10 كم',
            'جسيمات الميونات المتولدة في طبقات الجو العليا تصل للأرض فقط بفضل تمدد عمرها الزمني النسبي',
            'غرام واحد فقط من المادة يحتوي طاقة ذرية تعادل 21.5 ألف طن من مادة TNT شديدة الانفجار',
          ]}
        />
        <QuizSection questions={quizQuestions} />
      </div>
    </SimulationLayout>
  );
};

export default SpecialRelativitySimulation;
