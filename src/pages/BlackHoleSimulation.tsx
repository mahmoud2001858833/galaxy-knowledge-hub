import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Globe, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, BookOpen, Timer, Eye, Maximize2, Minimize2, 
  Volume2, VolumeX, Download, Lightbulb, Target, CheckSquare, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';
import { labSound } from '@/utils/labAudio';
import BlackHoleChamber3D, { BlackHolePreset } from '@/components/astronomy/BlackHoleChamber3D';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

const PRESETS: BlackHolePreset[] = [
  { id: 'cygnus-x1', nameAr: 'الدجاجة X-1 (نجمي)', nameEn: 'Cygnus X-1', solarMasses: 21.2, typeAr: 'ثقب أسود نجمي', description: 'أول ثقب أسود تم تأكيد وجوده رصدياً في مجرتنا', color: '#38bdf8' },
  { id: 'sagittarius-a', nameAr: 'الرامي A* (مركز المجرة)', nameEn: 'Sagittarius A*', solarMasses: 4.15e6, typeAr: 'فائق الكتلة (SMBH)', description: 'الثقب الأسود الهائل في مركز مجرة درب التبانة', color: '#fbbf24' },
  { id: 'm87', nameAr: 'مسييه 87* (M87*)', nameEn: 'M87*', solarMasses: 6.5e9, typeAr: 'عملاق فائق الكتلة', description: 'أول ثقب أسود التقط له تلسكوب أفق الحدث EHT صورة مباشرة', color: '#f97316' },
];

const G = 6.67430e-11;
const C = 299792458;
const SOLAR_MASS_KG = 1.989e30;

const blackHoleChallenges: Challenge[] = [
  {
    id: 'isco_stabilization',
    title: 'مدار الاستقرار الدائري الأخير (ISCO Orbit)',
    description: 'وجّه المسبار ليستقر عند أضيق مدار دائري مستقر ممكن (r ≈ 3.00 rs ± 0.2) واثبت 3 ثوانٍ.',
    targetMetric: 'المسافة r',
    targetValue: 3.0,
    unit: 'rs',
    holdDuration: 3,
    check: (m) => Math.abs((m.probeDistance ?? 0) - 3.0) <= 0.25,
  },
  {
    id: 'photon_sphere',
    title: 'كرة مسار الفوتونات (Photon Sphere)',
    description: 'اقترب بالمسبار من مدار الفوتونات (r ≈ 1.50 rs ± 0.15) حيث تحني الجاذبية الضوء في دوائر مغلقة.',
    targetMetric: 'المسافة r',
    targetValue: 1.5,
    unit: 'rs',
    holdDuration: 3,
    check: (m) => Math.abs((m.probeDistance ?? 0) - 1.5) <= 0.15,
  },
  {
    id: 'horizon_freeze',
    title: 'تجميد الزمن عند أفق الحدث',
    description: 'انحدر بالمسبار إلى الحافة الفائقة (r ≤ 1.15 rs) لتشهد تباطؤ الزمن الخاص بالمسبار إلى أقل من 36% نسبة للأرض.',
    targetMetric: 'سريان الزمن',
    targetValue: 36,
    unit: '%',
    holdDuration: 3,
    check: (m) => (m.probeDistance ?? 0) <= 1.15,
  },
];

export default function BlackHoleSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [selectedPreset, setSelectedPreset] = useState<BlackHolePreset>(PRESETS[1]);
  const [probeDistanceMultiplier, setProbeDistanceMultiplier] = useState<number>(3.0);
  const [isFalling, setIsFalling] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Relative Clocks
  const [coordinateTimeSec, setCoordinateTimeSec] = useState<number>(0);
  const [probeProperTimeSec, setProbeProperTimeSec] = useState<number>(0);

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Physics Calculations
  const massKg = selectedPreset.solarMasses * SOLAR_MASS_KG;
  const schwarzschildRadiusM = (2 * G * massKg) / (C * C);
  const schwarzschildRadiusKm = +(schwarzschildRadiusM / 1000).toFixed(2);

  const currentRadiusM = probeDistanceMultiplier * schwarzschildRadiusM;
  const currentRadiusKm = +(currentRadiusM / 1000).toFixed(2);

  const timeDilationFactor = useMemo(() => {
    if (probeDistanceMultiplier <= 1.0001) return 0.00001;
    return Math.sqrt(1 - 1 / probeDistanceMultiplier);
  }, [probeDistanceMultiplier]);

  const gravitationalRedshift = useMemo(() => {
    if (probeDistanceMultiplier <= 1.0001) return 9999;
    return +( (1 / timeDilationFactor) - 1 ).toFixed(3);
  }, [probeDistanceMultiplier, timeDilationFactor]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCoordinateTimeSec((t) => t + 0.1);
      setProbeProperTimeSec((tau) => tau + 0.1 * timeDilationFactor);

      if (isFalling) {
        setProbeDistanceMultiplier((r) => {
          if (r <= 1.01) {
            setIsFalling(false);
            return 1.01;
          }
          const dr = 0.03 * Math.sqrt(Math.max(0.01, 1 - 1 / r));
          return Math.max(1.01, r - dr);
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, isFalling, timeDilationFactor]);

  const setCameraView = (view: 'default' | 'top' | 'event_horizon' | 'accretion_disk') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'default') {
      controls.object.position.set(0, 4.5, 9.0);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      controls.object.position.set(0, 11.0, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'event_horizon') {
      controls.object.position.set(0, 0.5, 2.8);
      controls.target.set(0, 0, 0);
    } else if (view === 'accretion_disk') {
      controls.object.position.set(5.5, 2.5, 5.5);
      controls.target.set(0, 0, 0);
    }
    controls.update();
    labSound.playLaserPulse(400);
  };

  const toggleSound = () => {
    const muted = labSound.toggleMute();
    setIsMuted(muted);
  };

  const handleExportTelemetryCSV = () => {
    const headers = 'Preset,Mass(M_sun),SchwarzschildRadius(km),ProbeDistance(rs),ProbeDistance(km),ProperTimeRate,Redshift,CoordinateTime(s),ProbeProperTime(s)\n';
    const row = `${selectedPreset.nameEn},${selectedPreset.solarMasses},${schwarzschildRadiusKm},${probeDistanceMultiplier.toFixed(3)},${currentRadiusKm},${(timeDilationFactor * 100).toFixed(2)}%,${gravitationalRedshift},${coordinateTimeSec.toFixed(1)},${probeProperTimeSec.toFixed(1)}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `black_hole_${selectedPreset.id}_telemetry.csv`;
    link.click();
    labSound.playSuccessChime();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleReset = () => {
    setProbeDistanceMultiplier(3.0);
    setIsFalling(false);
    setCoordinateTimeSec(0);
    setProbeProperTimeSec(0);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleQuizSubmit = (selected: number) => {
    setQuizAnswer(selected);
    setQuizSubmitted(true);
    if (selected === 1) {
      setQuizScore((prev) => prev + 1);
      labSound.playSuccessChime();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-24 pb-16 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate('/experiments')}
              className="text-slate-400 hover:text-white mb-2 p-0 h-auto font-normal flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              العودة إلى مختبر التجارب العلمية
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 via-indigo-600 to-black rounded-2xl shadow-lg shadow-purple-500/20 border border-purple-500/30">
                <Globe className="w-8 h-8 text-purple-200" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  الثقوب السوداء وتمدد الزمن الثقالي ثلاثية الأبعاد (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  استكشاف متريّة شفارتزشيلد، أفق الحدث، وتجمد ساعات المسبار عند حافة الزمكان
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportTelemetryCSV}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              تصدير التيليمترية (CSV)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              {isPlaying ? <Pause className="w-4 h-4 ml-1 text-amber-400" /> : <Play className="w-4 h-4 ml-1 text-emerald-400" />}
              {isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              إعادة الضبط
            </Button>
          </div>
        </div>

        {/* Live Relativistic Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">نصف قطر شفارتزشيلد (rs)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{schwarzschildRadiusKm.toLocaleString()} km</p>
              <span className="text-[10px] text-slate-500">أفق الحدث المباشر</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">مسافة المسبار الحالية (r)</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{probeDistanceMultiplier.toFixed(2)} rs</p>
              <span className="text-[10px] text-slate-500">{currentRadiusKm.toLocaleString()} km</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">معدل سريان زمن المسبار</span>
              <p className="text-lg font-bold text-purple-400 font-mono">{(timeDilationFactor * 100).toFixed(1)}%</p>
              <span className="text-[10px] text-slate-500">نسبة إلى راصد بعيد</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الإزاحة نحو الأحمر (Redshift)</span>
              <p className="text-lg font-bold text-rose-400 font-mono">+{gravitationalRedshift}</p>
              <span className="text-[10px] text-slate-500">خفوت الإشارات اللاسلكية</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">ساعة الراصد البعيد (t)</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{coordinateTimeSec.toFixed(1)} s</p>
              <span className="text-[10px] text-slate-500">زمن الإحداثيات الكوني</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">ساعة المسبار الخاصة (τ)</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">{probeProperTimeSec.toFixed(1)} s</p>
              <span className="text-[10px] text-slate-500">الزمن الذاتي الحقيقي</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              <Activity className="w-4 h-4" />
              أفق الحدث والمسبار ثلاثي الأبعاد (3D Space)
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Target className="w-4 h-4" />
              تحديات النسبية العامة
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              النسبية العامة ومتريّة شفارتزشيلد
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Award className="w-4 h-4" />
              اختبار الفهم
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: 3D Simulation */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 3D WebGL Canvas + HUD */}
              <div className="lg:col-span-2 space-y-3" ref={containerRef}>
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl relative">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Eye className="w-4 h-4 text-purple-400" />
                      محاكاة الثقب الأسود وقرص التراكم ثلاثية الأبعاد (3D Scene)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-purple-500/50 text-purple-300 bg-purple-500/10">
                        {selectedPreset.nameAr}
                      </Badge>
                      <button
                        onClick={toggleFullscreen}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                        title="ملء الشاشة"
                      >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 h-[520px] bg-slate-950 relative">
                    <Canvas camera={{ position: [0, 4.5, 9.0], fov: 45 }}>
                      <ambientLight intensity={0.4} />
                      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />
                      <BlackHoleChamber3D
                        probeDistanceMultiplier={probeDistanceMultiplier}
                        isPlaying={isPlaying}
                        selectedPreset={selectedPreset}
                        timeDilationFactor={timeDilationFactor}
                      />
                      <OrbitControls
                        ref={controlsRef}
                        enablePan={true}
                        enableZoom={true}
                        minDistance={3.5}
                        maxDistance={18}
                      />
                    </Canvas>

                    {/* CyberLab HUD */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <CyberLabHUD
                        metrics={[
                          { label: 'سريان زمن المسبار', value: `${(timeDilationFactor * 100).toFixed(1)}%`, color: '#c084fc' },
                          { label: 'المسافة r/rs', value: probeDistanceMultiplier.toFixed(2), color: '#38bdf8' },
                          { label: 'الانزياح الأحمر z', value: `+${gravitationalRedshift}`, color: '#f43f5e' },
                          { label: 'نصف قطر أفق الحدث', value: `${schwarzschildRadiusKm} km`, color: '#f59e0b' },
                        ]}
                        status={probeDistanceMultiplier <= 1.15 ? 'ERROR' : isPlaying ? 'ACTIVE' : 'IDLE'}
                        waveformData={[
                          timeDilationFactor * 40,
                          (probeDistanceMultiplier * 10) % 35,
                          gravitationalRedshift % 30,
                          20,
                        ]}
                      />
                    </div>

                    {/* Camera Angle Presets */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-[11px] z-10">
                      <button
                        onClick={() => setCameraView('default')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        المنظور العام
                      </button>
                      <button
                        onClick={() => setCameraView('event_horizon')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        أفق الحدث
                      </button>
                      <button
                        onClick={() => setCameraView('accretion_disk')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        قرص التراكم
                      </button>
                      <button
                        onClick={() => setCameraView('top')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        علوي
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Controls Column */}
              <div className="space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800">
                    <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                      <Timer className="w-4 h-4 text-purple-400" />
                      التحكم بالمسبار والثقب الأسود
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Preset Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر الثقب الأسود</label>
                      <div className="space-y-1.5">
                        {PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              setSelectedPreset(preset);
                              labSound.playLaserPulse(350);
                            }}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedPreset.id === preset.id
                                ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-500/10'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{preset.nameAr}</div>
                            <div className="text-[10px] opacity-75">{preset.typeAr} • {preset.solarMasses.toLocaleString()} M☉</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Radial Distance Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">مسافة المسبار (مضاعفات أفق الحدث)</label>
                        <span className="text-xs font-mono text-purple-400 font-bold">{probeDistanceMultiplier.toFixed(2)} rs</span>
                      </div>
                      <Slider
                        value={[probeDistanceMultiplier]}
                        min={1.01}
                        max={6.0}
                        step={0.01}
                        onValueChange={(val) => {
                          setProbeDistanceMultiplier(val[0]);
                          setIsFalling(false);
                        }}
                        className="py-1"
                      />
                    </div>

                    {/* Fall Button */}
                    <Button
                      onClick={() => setIsFalling(!isFalling)}
                      variant={isFalling ? 'destructive' : 'default'}
                      className="w-full text-xs"
                    >
                      {isFalling ? 'إلغاء السقوط الحر' : 'بدء السقوط الحر نحو أفق الحدث (Free Fall)'}
                    </Button>
                  </CardContent>
                </Card>

                {/* AI Lab CoPilot */}
                <LiveAILabCoPilot
                  experimentName="الثقوب السوداء والنسبية العامة"
                  currentMetrics={{
                    blackHole: selectedPreset.nameEn,
                    massSolar: selectedPreset.solarMasses,
                    schwarzschildRadiusKm: schwarzschildRadiusKm,
                    probeDistanceRs: Number(probeDistanceMultiplier.toFixed(2)),
                    timeDilationPct: Number((timeDilationFactor * 100).toFixed(1)),
                    redshift: gravitationalRedshift,
                  }}
                  hint={
                    probeDistanceMultiplier <= 1.15
                      ? 'تحذير: المسبار عند حافة أفق الحدث! تجمد الزمن تقريباً بالنسبة للراصد الخارجي، وقوى المد الثقالية تمزق الأجسام (التأثير المعكروني Spaghettification).'
                      : probeDistanceMultiplier <= 1.6
                      ? 'المسبار داخل كرة الفوتونات (r = 1.5 rs): الضوء نفسه يدور في مدارات دائرية، ولا يمكن لأي جسم البقاء في مدار مستقر دون دفع صاروخي مستمر.'
                      : `عامل تمدد الزمن: dt/dτ = √(1 - rs/r). ساعة المسبار تدق بمعدل ${(timeDilationFactor * 100).toFixed(1)}% من سرعة ساعة الراصد البعيد.`
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Challenges Engine */}
          <TabsContent value="challenges" className="space-y-4">
            <LabChallengeEngine
              challenges={blackHoleChallenges}
              currentMetrics={{
                probeDistance: probeDistanceMultiplier,
                timeDilationFactor: timeDilationFactor,
                presetId: selectedPreset.id,
              }}
            />
          </TabsContent>

          {/* TAB 3: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-purple-300">النسبية العامة وهندسة الزمكان المشوهة</h3>
              <p>
                وفقاً لنظرية النسبية العامة لأينشتاين (1915)، الثقب الأسود ليس مجرد جرم ذي جاذبية عالية، بل هو انحناء لا نهائي في نسيج الزمكان (Spacetime Curvature).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. نصف قطر شفارتزشيلد (Schwarzschild Radius)</h4>
                  <p className="text-sm font-mono text-purple-300">rs = 2GM / c²</p>
                  <p className="text-xs text-slate-400">
                    نصف القطر الحرج الذي إذا ضُغطت فيه كتلة الجرم M، تصبح سرعة الإفلات مساوية لسرعة الضوء تماماً، مشكلاً أفق الحدث (Event Horizon).
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. تمدد الزمن الثقالي (Gravitational Time Dilation)</h4>
                  <p className="text-sm font-mono text-purple-300">dτ = dt · √(1 - rs / r)</p>
                  <p className="text-xs text-slate-400">
                    كلما اقترب المسبار من أفق الحدث (r → rs)، يقترب الزمن الذاتي dτ من الصفر بالنسبة لراصد بعيد، فيبدو المسبار وكأنه تجمد للأبد عند الأفق.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: Quiz */}
          <TabsContent value="quiz" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  اختبار فهم فيزياء الثقوب السوداء
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: ماذا يرى راصد يقف على الأرض لساعة مسبار يقترب جداً من أفق حدث ثقب أسود؟
                </p>
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'تدق ساعة المسبار أسرع وتسبق ساعة الأرض.' },
                    { id: 1, text: 'تتباطأ ساعة المسبار تدريجياً وتبدو وكأنها تجمدت تماماً عند ملامسة أفق الحدث مع انزياح ضوئها للأحمر.' },
                    { id: 2, text: 'لا يحدث أي تغير في معدل سريان الزمن.' },
                    { id: 3, text: 'تعود عقارب الساعة للوراء ويسافر المسبار للماضي.' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      disabled={quizSubmitted}
                      onClick={() => handleQuizSubmit(option.id)}
                      className={`w-full text-right p-3 rounded-xl border text-sm transition-all ${
                        quizSubmitted
                          ? option.id === 1
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : quizAnswer === option.id
                            ? 'bg-red-500/20 border-red-500 text-red-300'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                          : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>

                {quizSubmitted && (
                  <div className={`p-3 rounded-xl text-xs ${quizAnswer === 1 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
                    {quizAnswer === 1 ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>إجابة عبقرية! بسبب تمدد الزمن الثقالي الشديد، يرى الراصد البعيد أن المسبار يتباطأ حتى يتجمد تماماً عند أفق الحدث، وتخفت إشاراته بسبب الإزاحة الثقالية نحو الأحمر اللانهائية.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. تمدد الزمن الثقالي يجعل المسبار يبدو بطيئاً جداً حتى يتجمد عند أفق الحدث.</span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
