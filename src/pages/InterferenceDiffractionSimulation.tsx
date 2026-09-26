import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Aperture, CircleDot, Waves, Eye, Layers } from 'lucide-react';
import { InfoSection, QuizSection } from '@/components/simulations';
import InterferenceDiffraction3DScene, { wavelengthToRGB } from '@/components/optics/InterferenceDiffraction3DScene';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';
import { labSound } from '@/utils/labAudio';

const waveChallenges: Challenge[] = [
  {
    id: 'red_fringes',
    title: 'توسيع الهدب بطول موجي أحمر',
    description: 'اضبط الطول الموجي لليزر إلى نطاق الضوء الأحمر (λ ≥ 650 nm) لملاحظة تباعد الهدب واثبت 3 ثوانٍ.',
    targetMetric: 'الطول الموجي λ',
    targetValue: 650,
    unit: 'nm',
    holdDuration: 3,
    check: (m) => (m.wavelength ?? 0) >= 650,
  },
  {
    id: 'dense_fringes',
    title: 'تضييق الفواصل الهدبية',
    description: 'في الشق المزدوج، زد المسافة بين الشقين إلى d ≥ 75 μm لتقريب الهدب ومضاعفة عددها واثبت 3 ثوانٍ.',
    targetMetric: 'المسافة d',
    targetValue: 75,
    unit: 'μm',
    holdDuration: 3,
    check: (m) => m.mode === 'double-slit' && (m.slitDistance ?? 0) >= 75,
  },
  {
    id: 'violet_newton',
    title: 'انكماش حلقات نيوتن البنفسجية',
    description: 'انتقل لنمط حلقات نيوتن واختر ضوءاً بنفسجياً فائق الطاقة (λ ≤ 430 nm) لمشاهدة انكماش أنصاف أقطار الحلقات.',
    targetMetric: 'أشعة بنفسجية',
    targetValue: 430,
    unit: 'nm',
    holdDuration: 3,
    check: (m) => m.mode === 'newton-rings' && (m.wavelength ?? 0) <= 430,
  },
];

const InterferenceDiffractionSimulation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [activeTab, setActiveTab] = useState<'double-slit' | 'single-slit' | 'newton-rings'>('double-slit');
  const [wavelength, setWavelength] = useState(550);
  const [slitDistance, setSlitDistance] = useState(50);
  const [slitWidth, setSlitWidth] = useState(10);
  const timeRef = useRef(0);

  const wavelengthToColor = (wl: number): string => {
    return wavelengthToRGB(wl).hex;
  };

  const drawDoubleSlit = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = timeRef.current;
    const color = wavelengthToColor(wavelength);
    const cy = h / 2;
    const barrierX = w * 0.35;
    const screenX = w * 0.85;
    const d = slitDistance;

    const sourceX = 30;
    for (let r = 0; r < 15; r++) {
      const radius = ((t * 100 + r * 30) % 400);
      if (radius < 5) continue;
      ctx.beginPath();
      ctx.arc(sourceX, cy, radius, -0.4, 0.4);
      ctx.strokeStyle = `${color}${Math.max(0, Math.floor(30 - radius * 0.08)).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = '#475569';
    ctx.fillRect(barrierX - 4, 0, 8, cy - d / 2 - slitWidth / 2);
    ctx.fillRect(barrierX - 4, cy - d / 2 + slitWidth / 2, 8, d - slitWidth);
    ctx.fillRect(barrierX - 4, cy + d / 2 + slitWidth / 2, 8, h - cy - d / 2 - slitWidth / 2);

    const slit1Y = cy - d / 2;
    const slit2Y = cy + d / 2;

    for (let r = 0; r < 20; r++) {
      const radius = ((t * 80 + r * 25) % 500);
      if (radius < 5) continue;
      const alpha = Math.max(0, 25 - radius * 0.05);
      const alphaHex = Math.floor(alpha).toString(16).padStart(2, '0');

      ctx.beginPath();
      ctx.arc(barrierX + 4, slit1Y, radius, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = `${color}${alphaHex}`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(barrierX + 4, slit2Y, radius, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = `${color}${alphaHex}`;
      ctx.stroke();
    }

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(screenX - 3, 0, 6, h);

    const lambda = wavelength / 1000;
    for (let y = 0; y < h; y++) {
      const dy = y - cy;
      const r1 = Math.sqrt((screenX - barrierX) ** 2 + (dy + d / 2) ** 2);
      const r2 = Math.sqrt((screenX - barrierX) ** 2 + (dy - d / 2) ** 2);
      const pathDiff = (r2 - r1);
      const phase = (pathDiff / (lambda * 50)) * Math.PI * 2;
      const intensity = Math.cos(phase / 2) ** 2;

      const beta = (Math.PI * slitWidth * dy) / (lambda * 50 * (screenX - barrierX));
      const envelope = beta === 0 ? 1 : (Math.sin(beta) / beta) ** 2;

      const finalI = intensity * envelope;
      const rgb = Math.floor(finalI * 255);
      ctx.fillStyle = `rgb(${rgb}, ${Math.floor(rgb * 0.8)}, ${Math.floor(rgb * 0.6)})`;
      ctx.fillRect(screenX + 8, y, 25, 1);
    }

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('المصدر', sourceX, 25);
    ctx.fillText('الحاجز', barrierX, 25);
    ctx.fillText('الشاشة', screenX + 15, 25);

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Δy = λL/d', w / 2, h - 20);
  }, [wavelength, slitDistance, slitWidth]);

  const drawSingleSlit = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const t = timeRef.current;
    const color = wavelengthToColor(wavelength);
    const cy = h / 2;
    const barrierX = w * 0.4;
    const screenX = w * 0.85;
    const a = slitWidth * 2;

    for (let i = 0; i < 10; i++) {
      const x = ((t * 80 + i * 40) % (barrierX - 20));
      ctx.strokeStyle = `${color}40`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, cy - 100);
      ctx.lineTo(x, cy + 100);
      ctx.stroke();
    }

    ctx.fillStyle = '#475569';
    ctx.fillRect(barrierX - 4, 0, 8, cy - a / 2);
    ctx.fillRect(barrierX - 4, cy + a / 2, 8, h - cy - a / 2);

    for (let r = 0; r < 15; r++) {
      const radius = ((t * 60 + r * 30) % 400);
      if (radius < 5) continue;
      ctx.beginPath();
      ctx.arc(barrierX + 4, cy, radius, -Math.PI / 2, Math.PI / 2);
      ctx.strokeStyle = `${color}${Math.max(0, Math.floor(25 - radius * 0.06)).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(screenX - 3, 0, 6, h);

    const lambda = wavelength / 1000;
    for (let y = 0; y < h; y++) {
      const dy = y - cy;
      const beta = (Math.PI * a * dy) / (lambda * 50 * (screenX - barrierX));
      const intensity = beta === 0 ? 1 : (Math.sin(beta) / beta) ** 2;
      const rgb = Math.floor(intensity * 255);
      ctx.fillStyle = `rgb(${rgb}, ${Math.floor(rgb * 0.8)}, ${Math.floor(rgb * 0.6)})`;
      ctx.fillRect(screenX + 8, y, 25, 1);
    }

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('a sinθ = mλ (الحد الأدنى)', w / 2, h - 20);
  }, [wavelength, slitWidth]);

  const drawNewtonRings = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const color = wavelengthToColor(wavelength);
    const lambda = wavelength;

    const maxR = Math.min(w, h) / 2 - 40;
    for (let r = 1; r < 50; r++) {
      const ringR = Math.sqrt(r * lambda * 0.3);
      if (ringR > maxR) break;

      const intensity = (1 + Math.cos(r * Math.PI)) / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = intensity > 0.5 ? color : '#0f172a';
      ctx.lineWidth = Math.max(1, lambda * 0.01);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('rₙ = √(nλR)', cx, h - 20);
  }, [wavelength]);

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
      if (activeTab === 'double-slit') drawDoubleSlit(ctx, w, h);
      else if (activeTab === 'single-slit') drawSingleSlit(ctx, w, h);
      else drawNewtonRings(ctx, w, h);
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [viewMode, activeTab, isPlaying, drawDoubleSlit, drawSingleSlit, drawNewtonRings]);

  // Derived optical measurements
  const L_screen = 1.0; // 1 meter screen distance
  const fringeSpacingMm = +( (wavelength * 1e-9 * L_screen) / (slitDistance * 1e-6) * 1000 ).toFixed(2);
  const singleSlitWidthMm = +( (2 * wavelength * 1e-9 * L_screen) / (slitWidth * 1e-6) * 1000 ).toFixed(2);
  const newtonRing1Mm = +( Math.sqrt(1 * wavelength * 1e-9 * 1.5) * 1000 ).toFixed(2);

  const formulas = [
    { name: 'تجربة يونج', formula: 'Δy = λL/d', description: 'المسافة بين هدب متتالية على الشاشة' },
    { name: 'حيود الشق الواحد', formula: 'a sinθ = mλ', description: 'شرط التداخل الهدام في الشق الواحد' },
    { name: 'حلقات نيوتن', formula: 'rₙ = √(nλR)', description: 'نصف قطر الحلقة المضيئة رقم n' },
    { name: 'شرط التداخل البناء', formula: 'Δ = mλ (m = 0,1,2,...)', description: 'يحدث تداخل بنّاء عند فرق مسير = عدد صحيح × طول موجي' },
  ];

  const quizQuestions = [
    { question: 'في تجربة الشق المزدوج، ماذا يحدث عند زيادة المسافة بين الشقين؟', options: ['تقل المسافة بين الهدب', 'تزداد المسافة بين الهدب', 'لا تتغير', 'يختفي النمط'], correctIndex: 0, explanation: 'حسب Δy = λL/d، زيادة d (المسافة بين الشقين) تقلل المسافة بين الهدب وتجعلها أكثر تقارباً.' },
    { question: 'ما شرط الحد الأدنى في حيود الشق الواحد؟', options: ['a sinθ = mλ', 'a sinθ = (m+½)λ', 'd sinθ = mλ', 'θ = 0'], correctIndex: 0, explanation: 'الحد الأدنى (التداخل الهدام) في الشق الواحد يحدث عندما a sinθ = mλ حيث m عدد صحيح غير صفري.' },
    { question: 'لماذا تكون البقعة المركزية في حلقات نيوتن مظلمة؟', options: ['بسبب تغير الطور عند الانعكاس بمقدار π', 'بسبب الامتصاص', 'بسبب التشتت', 'بسبب الانكسار'], correctIndex: 0, explanation: 'عند الانعكاس من وسط أكثف ضوئياً، يحدث تغير في الطور بمقدار 180° (π) مما يسبب تداخلاً هداماً في المركز.' },
    { question: 'ما الذي يثبت أن الضوء موجة كهرومغناطيسية؟', options: ['ظاهرة التداخل والحيود', 'انتقاله في خط مستقيم', 'سرعته العالية', 'قدرته على التسخين'], correctIndex: 0, explanation: 'التداخل والحيود لا يمكن تفسيرهما إلا بالنموذج الموجي للضوء، وهما الدليل القاطع على طبيعته الموجية.' },
    { question: 'ماذا يحدث لنمط الحيود عند تقليل عرض الشق؟', options: ['يتسع النمط وينتشر أكثر', 'يضيق النمط', 'يختفي', 'لا يتغير'], correctIndex: 0, explanation: 'كلما قل عرض الشق ازداد اتساع نمط الحيود، لأن زاوية الحيود sinθ = λ/a تتناسب عكسياً مع عرض الشق.' },
  ];

  const spectrumGradient = 'linear-gradient(to right, #7c3aed, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)';

  return (
    <SimulationLayout
      title="التداخل والحيود الضوئي ثلاثي الأبعاد"
      titleGradient="from-indigo-400 via-purple-300 to-pink-400"
      backgroundGradient="from-slate-950 via-indigo-950/40 to-slate-950"
    >
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); labSound.playLaserPulse(400); }} className="w-full" dir="rtl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1">
            <TabsTrigger value="double-slit" className="text-xs data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <Aperture className="w-3.5 h-3.5 ml-1" />
              الشق المزدوج (Young)
            </TabsTrigger>
            <TabsTrigger value="single-slit" className="text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              <CircleDot className="w-3.5 h-3.5 ml-1" />
              الشق الواحد (Fraunhofer)
            </TabsTrigger>
            <TabsTrigger value="newton-rings" className="text-xs data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-300">
              <Waves className="w-3.5 h-3.5 ml-1" />
              حلقات نيوتن (Newton Rings)
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
              className="text-xs border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5"
            >
              {viewMode === '3d' ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <Layers className="w-3.5 h-3.5 text-cyan-400" />}
              {viewMode === '3d' ? 'عرض 3D Optical Bench' : 'عرض 2D Canvas'}
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
              <Canvas camera={{ position: [0, 2.5, 7.5], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 15, 10]} intensity={1.2} />
                <directionalLight position={[-10, 5, -5]} intensity={0.5} color={wavelengthToColor(wavelength)} />
                <InterferenceDiffraction3DScene
                  mode={activeTab}
                  wavelength={wavelength}
                  slitDistance={slitDistance}
                  slitWidth={slitWidth}
                  isPlaying={isPlaying}
                />
                <OrbitControls enablePan={true} enableZoom={true} minDistance={3} maxDistance={15} />
              </Canvas>

              {/* CyberLab HUD */}
              <div className="absolute top-3 left-3 pointer-events-none">
                <CyberLabHUD
                  metrics={
                    activeTab === 'double-slit'
                      ? [
                          { label: 'الطول الموجي λ', value: wavelength, unit: 'nm', color: wavelengthToColor(wavelength) },
                          { label: 'فاصل الهدب Δy', value: fringeSpacingMm, unit: 'mm', color: '#10b981' },
                          { label: 'المسافة بين الشقين', value: slitDistance, unit: 'μm', color: '#38bdf8' },
                          { label: 'عرض الشق a', value: slitWidth, unit: 'μm', color: '#f59e0b' },
                        ]
                      : activeTab === 'single-slit'
                      ? [
                          { label: 'الطول الموجي λ', value: wavelength, unit: 'nm', color: wavelengthToColor(wavelength) },
                          { label: 'عرض الهدب المركزي', value: singleSlitWidthMm, unit: 'mm', color: '#10b981' },
                          { label: 'عرض الشق a', value: slitWidth, unit: 'μm', color: '#f59e0b' },
                        ]
                      : [
                          { label: 'الطول الموجي λ', value: wavelength, unit: 'nm', color: wavelengthToColor(wavelength) },
                          { label: 'نصف قطر أول حلقة', value: newtonRing1Mm, unit: 'mm', color: '#ec4899' },
                          { label: 'الطور المركزي', value: 'Δφ = π (هدام)', color: '#94a3b8' },
                        ]
                  }
                  status={isPlaying ? 'ACTIVE' : 'IDLE'}
                  waveformData={[
                    (fringeSpacingMm * 10) % 35,
                    (wavelength / 20) % 30,
                    slitDistance % 25,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
              <span>الطول الموجي (Wavelength λ)</span>
              <span className="font-mono" style={{ color: wavelengthToColor(wavelength) }}>{wavelength} nm</span>
            </div>
            <div className="h-2 rounded-full mb-3" style={{ background: spectrumGradient }} />
            <Slider min={380} max={750} step={5} value={[wavelength]} onValueChange={([v]) => setWavelength(v)} />
          </div>

          {activeTab === 'double-slit' && (
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
                <span>المسافة بين الشقين (Slit Distance d)</span>
                <span className="font-mono text-cyan-400">{slitDistance} μm</span>
              </div>
              <Slider min={20} max={100} step={5} value={[slitDistance]} onValueChange={([v]) => setSlitDistance(v)} />
            </div>
          )}

          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 font-semibold mb-2">
              <span>عرض الشق (Slit Width a)</span>
              <span className="font-mono text-amber-400">{slitWidth} μm</span>
            </div>
            <Slider min={3} max={30} step={1} value={[slitWidth]} onValueChange={([v]) => setSlitWidth(v)} />
          </div>
        </div>
      </Tabs>

      {/* Gamified Challenge Engine */}
      <div className="mt-6">
        <LabChallengeEngine
          challenges={waveChallenges}
          currentMetrics={{
            mode: activeTab,
            wavelength: wavelength,
            slitDistance: slitDistance,
            slitWidth: slitWidth,
            fringeSpacingMm: fringeSpacingMm,
          }}
        />
      </div>

      {/* Live AI Lab CoPilot */}
      <div className="mt-4">
        <LiveAILabCoPilot
          experimentName="التداخل والحيود الضوئي"
          currentMetrics={{
            mode: activeTab,
            wavelength: wavelength,
            slitDistance: activeTab === 'double-slit' ? slitDistance : undefined,
            slitWidth: slitWidth,
            fringeSpacingMm: activeTab === 'double-slit' ? fringeSpacingMm : undefined,
          }}
          hint={
            activeTab === 'double-slit'
              ? `المسافة بين الهدب Δy = λL/d. بزيادة الطول الموجي لليزر (${wavelength} nm)، تتسع المسافة بين خطوط التداخل على الشاشة.`
              : activeTab === 'single-slit'
              ? 'اتساع الهدب المركزي يعادل ضعف الهدب الجانبية، وكلما ضاق الشق انتشر نمط الحيود على زاوية أوسع.'
              : 'المركز مظلم دائماً لأن الانعكاس من السطح السفلي للوح الزجاجي يغير طور الموجة بمقدار نصف دورة (π).'
          }
        />
      </div>

      {/* Scientific Background & Quiz */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoSection
          formulas={formulas}
          explanation="التداخل والحيود ظاهرتان تثبتان الطبيعة الموجية للضوء. التداخل ينتج من تراكب موجتين أو أكثر متشاكهتين، بينما الحيود ينتج من انحناء الموجات الكهرومغناطيسية حول الحواف والفتحات الضيقة."
          facts={[
            'تجربة توماس يونج (1801) للشق المزدوج حسمت الجدل التاريخي وأثبتت طبيعة الضوء الموجية',
            'ألوان فقاعات الصابون وأجنحة الفراشات المورفو ناتجة عن تداخل الأغشية الرقيقة دون أي صبغات',
            'حيود الأشعة السينية مكن روزاليند فرانكلين وواطسون وكريك من اكتشاف اللولب المزدوج لـ DNA',
            'تقنية الهولوغرام والتصوير التجسيمي ثلاثي الأبعاد تعتمد كلياً على تداخل حزمتي ليزر متشاكهتين',
          ]}
        />
        <QuizSection questions={quizQuestions} />
      </div>
    </SimulationLayout>
  );
};

export default InterferenceDiffractionSimulation;
