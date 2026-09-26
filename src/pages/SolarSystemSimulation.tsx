import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ArrowLeft, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Sun, Moon, Clock, Eye, Layers, Orbit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import { useSolarSystemPhysics, CelestialBody } from '@/hooks/useSolarSystemPhysics';
import SolarSystem3DScene from '@/components/astronomy/SolarSystem3DScene';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';
import { labSound } from '@/utils/labAudio';

const solarChallenges: Challenge[] = [
  {
    id: 'mars_exploration',
    title: 'استكشاف الكوكب الأحمر (المريخ)',
    description: 'حدد كوكب المريخ (Mars) وافحص بياناته المدارية (الدور: ~687 يوماً) واثبت 3 ثوانٍ.',
    targetMetric: 'الكوكب المحدد',
    targetValue: 1,
    unit: 'كوكب',
    holdDuration: 3,
    check: (m) => m.selectedBody === 'mars',
  },
  {
    id: 'jupiter_titan',
    title: 'عملاق النظام الشمسي (المشتري)',
    description: 'حدد كوكب المشتري (Jupiter) وتعرف على كتلته الهائلة التي تفوق كل الكواكب مجتمعة واثبت 3 ثوانٍ.',
    targetMetric: 'الكوكب المحدد',
    targetValue: 1,
    unit: 'كوكب',
    holdDuration: 3,
    check: (m) => m.selectedBody === 'jupiter',
  },
  {
    id: 'saturn_rings',
    title: 'سيد الحلقات الكوكبية (زحل)',
    description: 'حدد كوكب زحل (Saturn) واستعرض نظامه الحلقي الجليدي وميله المحوري واثبت 3 ثوانٍ.',
    targetMetric: 'الكوكب المحدد',
    targetValue: 1,
    unit: 'كوكب',
    holdDuration: 3,
    check: (m) => m.selectedBody === 'saturn',
  },
];

const SolarSystemSimulation = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<CelestialBody | null>(null);
  const [viewScale, setViewScale] = useState(1);

  const {
    state,
    selectBody,
    setTimeScale,
    togglePause,
    toggleOrbits,
    toggleLabels,
    resetSimulation,
    selectedBodyInfo,
  } = useSolarSystemPhysics();

  const planets = state.bodies.filter((b) => b.type === 'planet' || b.type === 'dwarf-planet');

  const planetColors: Record<string, string> = {
    'عطارد': '#B5B5B5',
    'الزهرة': '#E6C229',
    'الأرض': '#4A90D9',
    'المريخ': '#E27B58',
    'المشتري': '#C9A86C',
    'زحل': '#E4D191',
    'أورانوس': '#7DE3F4',
    'نبتون': '#4B70DD',
    'بلوتو': '#9CA6B5',
    'Mercury': '#B5B5B5',
    'Venus': '#E6C229',
    'Earth': '#4A90D9',
    'Mars': '#E27B58',
    'Jupiter': '#C9A86C',
    'Saturn': '#E4D191',
    'Uranus': '#7DE3F4',
    'Neptune': '#4B70DD',
    'Pluto': '#9CA6B5',
  };

  // 2D Canvas Drawing Fallback
  useEffect(() => {
    if (viewMode !== '2d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.fillStyle = isDarkMode ? '#0a0a1a' : '#f0f5ff';
    ctx.fillRect(0, 0, width, height);

    if (isDarkMode) {
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 1.5;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const scale = 80 * viewScale * state.distanceScale;

    if (state.showOrbits) {
      planets.forEach((planet) => {
        ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, planet.orbitalRadius * scale, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // Sun in 2D
    ctx.beginPath();
    ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Planets in 2D
    planets.forEach((p, idx) => {
      const angle = (idx * 0.8) + (state.elapsedDays / (p.orbitalPeriod || 365)) * Math.PI * 2;
      const r = p.orbitalRadius * scale;
      const px = centerX + Math.cos(angle) * r;
      const py = centerY + Math.sin(angle) * r;

      ctx.beginPath();
      ctx.arc(px, py, Math.max(3, p.radius / 15000), 0, Math.PI * 2);
      ctx.fillStyle = planetColors[p.nameAr] || '#38bdf8';
      ctx.fill();

      if (state.showLabels) {
        ctx.fillStyle = isDarkMode ? '#cbd5e1' : '#1e293b';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.nameAr, px, py - 6);
      }
    });
  }, [viewMode, isDarkMode, viewScale, state.distanceScale, state.showOrbits, state.showLabels, state.elapsedDays, planets]);

  const handleSelectPlanet = (bodyId: string) => {
    selectBody(bodyId);
    const found = state.bodies.find((b) => b.id === bodyId) || null;
    setSelectedPlanet(found);
    labSound.playLaserPulse(400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4" dir="rtl">
      <StarField />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 flex-wrap gap-3"
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              const isGJU = sessionStorage.getItem('gju_mode') === 'true';
              navigate(isGJU ? '/gju-competition' : '/scientific-simulations');
            }}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            العودة للتجارب
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
              <Sun className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-amber-300 via-orange-400 to-sky-400 bg-clip-text text-transparent">
                محاكاة النظام الشمسي والميكانيكا الكوكبية ثلاثية الأبعاد (3D Solar System)
              </h1>
              <p className="text-xs text-slate-400">
                استكشاف مدارات كواكب المجموعة الشمسية وقوانين كبلر والحسابات الفلكية الدقيقة
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className="text-xs border-slate-700 bg-slate-900/80 text-slate-200"
          >
            {viewMode === '3d' ? <Eye className="w-3.5 h-3.5 ml-1 text-amber-400" /> : <Layers className="w-3.5 h-3.5 ml-1 text-sky-400" />}
            {viewMode === '3d' ? 'عرض 3D Solar Arena' : 'عرض 2D Canvas'}
          </Button>
          <Badge variant="outline" className="bg-slate-900 border-slate-700 text-xs">
            <Clock className="w-3 h-3 ml-1 text-amber-400" />
            سرعة الزمن: {state.timeScale}x
          </Badge>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Viewport */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 space-y-4"
        >
          <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            {viewMode === '3d' ? (
              <div className="h-[520px] relative">
                <Canvas camera={{ position: [0, 14, 18], fov: 45 }}>
                  <ambientLight intensity={0.2} />
                  <SolarSystem3DScene
                    bodies={state.bodies}
                    selectedBody={state.selectedBody}
                    onSelectBody={handleSelectPlanet}
                    timeScale={state.timeScale}
                    isPaused={state.isPaused}
                    showOrbits={state.showOrbits}
                    showLabels={state.showLabels}
                  />
                  <OrbitControls enablePan={true} enableZoom={true} minDistance={3} maxDistance={35} />
                </Canvas>

                {/* CyberLab HUD */}
                <div className="absolute top-3 left-3 pointer-events-none">
                  <CyberLabHUD
                    metrics={[
                      { label: 'الجرم المحدد', value: selectedBodyInfo?.nameAr || 'الشمس', color: '#f59e0b' },
                      { label: 'البعد عن الشمس', value: selectedBodyInfo ? `${selectedBodyInfo.orbitalRadius?.toFixed(2)} AU` : '0 AU', color: '#38bdf8' },
                      { label: 'الدور المداري', value: selectedBodyInfo ? `${selectedBodyInfo.orbitalPeriod?.toFixed(0)} d` : '---', color: '#10b981' },
                      { label: 'السرعة المدارية', value: selectedBodyInfo ? `${selectedBodyInfo.orbitalVelocity?.toFixed(1)} km/s` : '---', color: '#ec4899' },
                    ]}
                    status={state.isPaused ? 'IDLE' : 'ACTIVE'}
                    waveformData={[
                      (selectedBodyInfo?.orbitalVelocity || 30) % 35,
                      (selectedBodyInfo?.orbitalRadius || 1) * 8,
                      state.timeScale % 25,
                      20,
                    ]}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={500}
                  className="w-full rounded-lg"
                  style={{ maxHeight: '520px' }}
                />
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <Card className="bg-slate-900/90 border-slate-800 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={togglePause}
                  className={`text-xs ${!state.isPaused ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {!state.isPaused ? <Pause className="w-4 h-4 ml-1.5" /> : <Play className="w-4 h-4 ml-1.5" />}
                  {!state.isPaused ? 'إيقاف مؤقت' : 'تشغيل المدارات'}
                </Button>
                <Button variant="outline" size="sm" onClick={resetSimulation} className="border-slate-700 text-xs">
                  <RotateCcw className="w-3.5 h-3.5 ml-1" />
                  إعادة
                </Button>
              </div>

              <div className="flex items-center gap-4 flex-1 max-w-xs">
                <span className="text-xs text-slate-300 font-mono">السرعة:</span>
                <Slider
                  value={[state.timeScale]}
                  onValueChange={([v]) => setTimeScale(v)}
                  min={0.1}
                  max={60}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-xs font-mono text-cyan-400">{state.timeScale}x</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.showOrbits}
                    onChange={toggleOrbits}
                    className="rounded border-slate-700"
                  />
                  المدارات
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.showLabels}
                    onChange={toggleLabels}
                    className="rounded border-slate-700"
                  />
                  الأسماء
                </label>
              </div>
            </div>
          </Card>

          {/* Gamified Challenge Engine */}
          <LabChallengeEngine
            challenges={solarChallenges}
            currentMetrics={{
              selectedBody: state.selectedBody,
              timeScale: state.timeScale,
              isPaused: state.isPaused,
            }}
          />
        </motion.div>

        {/* Side Panel: Planets & Kepler Laws & CoPilot */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full lg:w-96 space-y-4"
        >
          {/* AI Lab CoPilot */}
          <LiveAILabCoPilot
            experimentName="النظام الشمسي والميكانيكا الفلكية"
            currentMetrics={{
              selectedPlanet: selectedBodyInfo?.nameAr || 'الشمس',
              orbitalRadiusAU: selectedBodyInfo?.orbitalRadius,
              orbitalPeriodDays: selectedBodyInfo?.orbitalPeriod,
              orbitalVelocityKms: selectedBodyInfo?.orbitalVelocity,
              temperatureK: selectedBodyInfo?.surfaceTemperature,
            }}
            hint={
              selectedBodyInfo
                ? `${selectedBodyInfo.nameAr}: يبعد ${selectedBodyInfo.orbitalRadius?.toFixed(2)} وحدة فلكية عن الشمس ويستغرق ${selectedBodyInfo.orbitalPeriod?.toFixed(0)} يوماً ليكمل دورة واحدة وفق قانون كبلر الثالث T² ∝ a³.`
                : 'انقر على أي كوكب لعرض خصائصه الفيزيائية والمدارية ومقارنتها بالأرض.'
            }
          />

          <Tabs defaultValue="planets" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-slate-900 border border-slate-800">
              <TabsTrigger value="planets" className="text-xs">كواكب المجموعة</TabsTrigger>
              <TabsTrigger value="laws" className="text-xs">قوانين كبلر</TabsTrigger>
            </TabsList>

            <TabsContent value="planets">
              <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-3">
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {planets.map((planet) => (
                    <div
                      key={planet.id}
                      onClick={() => handleSelectPlanet(planet.id)}
                      className={`p-2 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                        state.selectedBody === planet.id
                          ? 'bg-sky-500/20 border-sky-500 text-sky-200'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: planetColors[planet.name] || planetColors[planet.nameAr] }}
                        />
                        <span className="font-bold text-xs">{planet.nameAr}</span>
                      </div>
                      <span className="text-[10px] opacity-75 font-mono">
                        {planet.orbitalRadius?.toFixed(2)} AU
                      </span>
                    </div>
                  ))}
                </div>

                {/* Selected Planet Details */}
                <AnimatePresence>
                  {selectedBodyInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                        <span className="font-bold text-amber-300 text-sm">{selectedBodyInfo.nameAr}</span>
                        <Badge variant="outline" className="text-[10px] border-slate-700">
                          {selectedBodyInfo.name}
                        </Badge>
                      </div>
                      <p className="text-slate-400">📏 نصف القطر: {selectedBodyInfo.radius?.toLocaleString()} km</p>
                      <p className="text-slate-400">⚖️ الكتلة: {selectedBodyInfo.mass?.toExponential(2)} kg</p>
                      <p className="text-slate-400">📍 البعد عن الشمس: {selectedBodyInfo.orbitalRadius?.toFixed(2)} AU</p>
                      <p className="text-slate-400">🔄 زمن الدورة: {selectedBodyInfo.orbitalPeriod?.toFixed(1)} يوم</p>
                      <p className="text-slate-400">🌀 السرعة المدارية: {selectedBodyInfo.orbitalVelocity?.toFixed(2)} km/s</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </TabsContent>

            <TabsContent value="laws">
              <Card className="p-4 bg-slate-900/90 border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-sky-400">1. المدارات الإهليلجية</h4>
                  <p>تدور الكواكب حول الشمس في مدارات إهليلجية تقع الشمس في إحدى بؤرتيها.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-emerald-400">2. المساحات المتساوية</h4>
                  <p>الخط الواصل بين الكوكب والشمس يمسح مساحات متساوية في أزمنة متساوية (dA/dt = ثابت).</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-purple-400">3. القانون التوافقي</h4>
                  <p>مربع زمن الدورة يتناسب طردياً مع مكعب نصف المحور الأكبر: T² = (4π²/GM) · a³.</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default SolarSystemSimulation;