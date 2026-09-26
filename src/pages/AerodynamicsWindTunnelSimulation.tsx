import React, { useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Wind, Play, Pause, RotateCcw, Award, 
  Activity, BookOpen, Gauge, Maximize2, Minimize2, 
  Volume2, VolumeX, Download, Target, HelpCircle, CheckCircle2,
  Sliders, Compass
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
import WindTunnelChamber3D, { AirfoilModel } from '@/components/aerodynamics/WindTunnelChamber3D';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

const AIRFOILS: AirfoilModel[] = [
  { 
    id: 'naca-2412', 
    nameAr: 'جناح طيران عام (NACA 2412)', 
    nameEn: 'NACA 2412', 
    clMax: 1.6, 
    stallAngleDeg: 16, 
    description: 'المقطع التقليدي لطائرات سيسنا والطيران المدني',
    camber: 2,
    thickness: 12
  },
  { 
    id: 'naca-0012', 
    nameAr: 'مقطع متماثل (NACA 0012)', 
    nameEn: 'NACA 0012', 
    clMax: 1.4, 
    stallAngleDeg: 14, 
    description: 'مقطع متماثل تماماً لدفات التوجيه ومراوح المروحيات',
    camber: 0,
    thickness: 12
  },
  { 
    id: 'naca-4415', 
    nameAr: 'جناح عالي الرفع (NACA 4415)', 
    nameEn: 'NACA 4415', 
    clMax: 1.95, 
    stallAngleDeg: 15, 
    description: 'مقطع مقعر عالي الانحناء مخصص لطائرات الشحن الثقيل',
    camber: 4,
    thickness: 15
  },
  { 
    id: 'supercritical', 
    nameAr: 'مقطع فوق حرج (Supercritical)', 
    nameEn: 'Supercritical', 
    clMax: 1.8, 
    stallAngleDeg: 18, 
    description: 'مقطع طائرات الركاب النفاثة للسرعات العالية و Mach > 0.75',
    camber: 1.5,
    thickness: 9
  },
];

const AIR_DENSITY = 1.225;
const WING_AREA_M2 = 1.5;

const aeroChallenges: Challenge[] = [
  {
    id: 'takeoff_lift',
    title: 'توليد رفع الإقلاع (Lift Generation)',
    description: 'اضبط زاوية الهجوم (بين 6° و 12°) وزد السرعة لتوليد قوة رفع L ≥ 800 N مع كفاءة L/D ≥ 8.',
    targetMetric: 'قوة الرفع L',
    targetValue: 800,
    unit: 'N',
    holdDuration: 3,
    check: (m) => (m.liftForceN ?? 0) >= 800 && (m.liftToDragRatio ?? 0) >= 8 && !(m.isStalled ?? false),
  },
  {
    id: 'stall_boundary',
    title: 'استكشاف الانهيار الحرج (Stall Boundary)',
    description: 'زد زاوية الهجوم لتتجاوز زاوية الانهيار الحرجة للجناح وراقب انفصال الدوامات وقفزة السحب.',
    targetMetric: 'الانهيار (Stall)',
    targetValue: 1,
    unit: 'حالة',
    holdDuration: 3,
    check: (m) => (m.isStalled ?? false) === true,
  },
  {
    id: 'transonic_cruise',
    title: 'اختراق السرعات العالية (Transonic High Speed)',
    description: 'اختر المقطع فوق الحرج (Supercritical) وارفع السرعة إلى ≥ 75 m/s للحفاظ على رفع مستقر L ≥ 1000 N.',
    targetMetric: 'السرعة الجوية',
    targetValue: 75,
    unit: 'm/s',
    holdDuration: 4,
    check: (m) => m.airfoilId === 'supercritical' && (m.windSpeedMs ?? 0) >= 75 && (m.liftForceN ?? 0) >= 1000,
  },
];

export default function AerodynamicsWindTunnelSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [selectedAirfoil, setSelectedAirfoil] = useState<AirfoilModel>(AIRFOILS[0]);
  const [alphaDeg, setAlphaDeg] = useState<number>(6.0);
  const [windSpeedMs, setWindSpeedMs] = useState<number>(45);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showPressureVectors, setShowPressureVectors] = useState<boolean>(true);
  const [showShockwave, setShowShockwave] = useState<boolean>(true);

  // Quiz States
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const isStalled = alphaDeg >= selectedAirfoil.stallAngleDeg;

  const Cl = useMemo(() => {
    if (alphaDeg < -8) return -0.4;
    if (isStalled) {
      return +(selectedAirfoil.clMax * 0.45 * Math.cos((alphaDeg * Math.PI) / 180)).toFixed(2);
    }
    const cl = 0.2 + (selectedAirfoil.camber * 0.08) + alphaDeg * 0.105;
    return +Math.min(selectedAirfoil.clMax, cl).toFixed(2);
  }, [alphaDeg, isStalled, selectedAirfoil]);

  const Cd = useMemo(() => {
    const cd0 = 0.015 + (selectedAirfoil.thickness / 100) * 0.04;
    if (isStalled) {
      return +(0.25 + Math.pow((alphaDeg - selectedAirfoil.stallAngleDeg) / 10, 2) * 0.22).toFixed(3);
    }
    const cdInduced = (Cl * Cl) / (Math.PI * 6.0);
    return +(cd0 + cdInduced).toFixed(3);
  }, [alphaDeg, isStalled, Cl, selectedAirfoil]);

  const dynamicPressure = 0.5 * AIR_DENSITY * Math.pow(windSpeedMs, 2);
  const liftForceN = Math.max(0, +(dynamicPressure * WING_AREA_M2 * Cl).toFixed(0));
  const dragForceN = Math.max(0, +(dynamicPressure * WING_AREA_M2 * Cd).toFixed(0));
  const liftToDragRatio = Cd > 0 ? +(Cl / Cd).toFixed(1) : 0;
  const machNumber = +(windSpeedMs / 340).toFixed(2);

  const setCameraView = (view: 'default' | 'top' | 'airfoil' | 'side') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'default') {
      controls.object.position.set(0, 2.5, 8.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      controls.object.position.set(0, 9.5, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'airfoil') {
      controls.object.position.set(0, 0.8, 3.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'side') {
      controls.object.position.set(7.5, 0, 0);
      controls.target.set(0, 0, 0);
    }
    controls.update();
    labSound.playLaserPulse(500);
  };

  const toggleSound = () => {
    const muted = labSound.toggleMute();
    setIsMuted(muted);
  };

  const handleExportDataCSV = () => {
    const headers = 'Airfoil,Alpha(deg),WindSpeed(m/s),Mach,Lift(N),Drag(N),Cl,Cd,L/D_Ratio,IsStalled\n';
    const row = `${selectedAirfoil.nameEn},${alphaDeg},${windSpeedMs},${machNumber},${liftForceN},${dragForceN},${Cl},${Cd},${liftToDragRatio},${isStalled}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wind_tunnel_${selectedAirfoil.id}.csv`;
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

  const handleQuizSubmit = (selected: number) => {
    setQuizAnswer(selected);
    setQuizSubmitted(true);
    if (selected === 2) {
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
              <div className="p-3 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl shadow-lg shadow-sky-500/20">
                <Wind className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                  نفق الرياح والديناميكا الهوائية ثلاثي الأبعاد (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  محاكاة هندسة مقاطع NACA، مبدأ برنولي، ظاهرة الانهيار الهوائي وتكون الصدمات
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
              onClick={handleExportDataCSV}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              تصدير البيانات (CSV)
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
              onClick={() => setCameraView('default')}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              إعادة الكاميرا
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Activity className="w-4 h-4" />
              نفق الرياح ثلاثي الأبعاد (3D Wind Tunnel)
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Target className="w-4 h-4" />
              تحديات الطيران التفاعلية
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              مبدأ برنولي ومعادلات نافيير-ستوكس
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
                      <Wind className="w-4 h-4 text-sky-400" />
                      غرفة الاختبار ومسار التدفق الهوائي (NACA Airfoil Flow)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${isStalled ? 'border-red-500/50 text-red-400 bg-red-500/10 animate-pulse' : 'border-sky-500/50 text-sky-300 bg-sky-500/10'}`}>
                        {isStalled ? '⚠️ STALL' : selectedAirfoil.nameEn}
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
                    <Canvas camera={{ position: [0, 2.5, 8.5], fov: 45 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 10, 10]} intensity={1.2} />
                      <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#38bdf8" />
                      <WindTunnelChamber3D
                        alphaDeg={alphaDeg}
                        windSpeedMs={windSpeedMs}
                        selectedAirfoil={selectedAirfoil}
                        isStalled={isStalled}
                        liftForceN={liftForceN}
                        dragForceN={dragForceN}
                        isPlaying={isPlaying}
                        showPressureVectors={showPressureVectors}
                        showShockwave={showShockwave}
                      />
                      <OrbitControls
                        ref={controlsRef}
                        enablePan={true}
                        enableZoom={true}
                        minDistance={4}
                        maxDistance={16}
                      />
                    </Canvas>

                    {/* CyberLab HUD Overlay */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <CyberLabHUD
                        metrics={[
                          { label: 'قوة الرفع L', value: liftForceN, unit: 'N', color: '#10b981' },
                          { label: 'قوة السحب D', value: dragForceN, unit: 'N', color: '#ef4444' },
                          { label: 'كفاءة L/D', value: liftToDragRatio, color: '#f59e0b' },
                          { label: 'معامل Cl', value: Cl, color: '#06b6d4' },
                          { label: 'Mach No', value: machNumber, color: machNumber >= 0.75 ? '#ec4899' : '#8b5cf6' },
                        ]}
                        status={isStalled ? 'ERROR' : isPlaying ? 'ACTIVE' : 'IDLE'}
                        waveformData={[
                          Cl * 20,
                          (liftForceN / 50) % 30,
                          isStalled ? Math.random() * 40 : Cl * 15,
                          (dragForceN / 20) % 25,
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
                        onClick={() => setCameraView('airfoil')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        الجناح
                      </button>
                      <button
                        onClick={() => setCameraView('side')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        جانبي
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
                      <Gauge className="w-4 h-4 text-sky-400" />
                      التحكم بزاوية الهجوم وسرعة الرياح
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Airfoil Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر مقطع الجناح</label>
                      <div className="space-y-1.5">
                        {AIRFOILS.map((foil) => (
                          <button
                            key={foil.id}
                            onClick={() => {
                              setSelectedAirfoil(foil);
                              labSound.playLaserPulse(400);
                            }}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedAirfoil.id === foil.id
                                ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-lg shadow-sky-500/10'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{foil.nameAr}</div>
                            <div className="text-[10px] opacity-75">انحناء: {foil.camber}% • سماكة: {foil.thickness}% • زاوية الانهيار: {foil.stallAngleDeg}°</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Angle Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">زاوية الهجوم (Angle of Attack α)</label>
                        <span className={`text-xs font-mono font-bold ${isStalled ? 'text-red-400' : 'text-emerald-400'}`}>
                          {alphaDeg > 0 ? `+${alphaDeg.toFixed(1)}` : alphaDeg.toFixed(1)}°
                        </span>
                      </div>
                      <Slider
                        value={[alphaDeg]}
                        min={-5}
                        max={25}
                        step={0.5}
                        onValueChange={(val) => setAlphaDeg(val[0])}
                        className="py-1"
                      />
                    </div>

                    {/* Wind Speed Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">سرعة الهواء (Airspeed)</label>
                        <span className="text-xs font-mono text-sky-400 font-bold">{windSpeedMs} m/s (Mach {machNumber})</span>
                      </div>
                      <Slider
                        value={[windSpeedMs]}
                        min={10}
                        max={110}
                        step={1}
                        onValueChange={(val) => setWindSpeedMs(val[0])}
                        className="py-1"
                      />
                    </div>

                    {/* Visual Toggles */}
                    <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPressureVectors(!showPressureVectors)}
                        className={`text-xs ${showPressureVectors ? 'border-sky-500/50 text-sky-300 bg-sky-500/10' : 'border-slate-800 text-slate-400'}`}
                      >
                        {showPressureVectors ? '✓ متجهات الضغط' : '✕ متجهات الضغط'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowShockwave(!showShockwave)}
                        className={`text-xs ${showShockwave ? 'border-indigo-500/50 text-indigo-300 bg-indigo-500/10' : 'border-slate-800 text-slate-400'}`}
                      >
                        {showShockwave ? '✓ موجات الصدمة' : '✕ موجات الصدمة'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Lab CoPilot */}
                <LiveAILabCoPilot
                  experimentName="نفق الرياح والديناميكا الهوائية"
                  currentMetrics={{
                    airfoil: selectedAirfoil.nameEn,
                    alphaDeg: alphaDeg,
                    windSpeedMs: windSpeedMs,
                    machNumber: machNumber,
                    liftForceN: liftForceN,
                    dragForceN: dragForceN,
                    cl: Cl,
                    cd: Cd,
                    liftToDragRatio: liftToDragRatio,
                    isStalled: isStalled,
                  }}
                  hint={isStalled 
                    ? `تحذير: تجاوزت الزاوية الحرجة (${selectedAirfoil.stallAngleDeg}°). انفصلت الطبقة الجدارية وانهار الرفع بنسبة تزيد عن 55%. اخفض الزاوية لاستعادة التدفق الانسيابي.`
                    : `سرعة الهواء فوق السطح المحدب تزداد مما يولد منطقة ضغط منخفض (مبدأ برنولي). نسبة الرفع للسحب الحالية هي ${liftToDragRatio}.`}
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Challenges Engine */}
          <TabsContent value="challenges" className="space-y-4">
            <LabChallengeEngine
              challenges={aeroChallenges}
              currentMetrics={{
                airfoilId: selectedAirfoil.id,
                alphaDeg: alphaDeg,
                windSpeedMs: windSpeedMs,
                liftForceN: liftForceN,
                dragForceN: dragForceN,
                liftToDragRatio: liftToDragRatio,
                isStalled: isStalled,
              }}
            />
          </TabsContent>

          {/* TAB 3: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-sky-300">فيزياء الطيران وميكانيكا الموائع الديناميكية</h3>
              <p>
                تتولد قوة الرفع (Lift) على أجنحة الطائرات بتكامل مبدأ برنولي (تفاضل الضغط بين السطحين العلوي والسفلي) وقانون نيوتن الثالث للحركة (دفع كتلة الهواء للأسفل Downwash).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. معادلة الرفع والسحب الديناميكي</h4>
                  <p className="text-sm font-mono text-sky-300">L = ½ · ρ · v² · S · Cl</p>
                  <p className="text-xs text-slate-400">حيث ρ هي كثافة الهواء (1.225 kg/m³)، و v هي سرعة الجريان، و S مساحة الجناح، و Cl معامل الرفع الديناميكي.</p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. ظاهرة الانهيار الهوائي (Stall)</h4>
                  <p className="text-xs text-slate-400">
                    عند تجاوز زاوية الهجوم الحرجة (Critical α)، تعجز الطبقة المتاخمة عن البقاء ملتصقة بالسطح العلوي للجناح، فتنفصل مكونة دوامات هوائية مضطربة تؤدي لانهيار الرفع وارتفاع السحب بشكل كبير.
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
                  اختبار مفاهيم الديناميكا الهوائية
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: ماذا يحدث لتدفق الهواء وقوة الرفع عندما تزيد زاوية الهجوم (α) عن زاوية الانهيار الحرجة للجناح؟
                </p>
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'تتضاعف قوة الرفع وتصل الطائرة لأعلى سرعة.' },
                    { id: 1, text: 'ينعدم السحب تماماً.' },
                    { id: 2, text: 'ينفصل تدفق الهواء عن السطح العلوي للجناح مشكلاً دوامات مضطربة، فتهبط قوة الرفع فجأة ويزداد السحب بشدة (Stall).' },
                    { id: 3, text: 'تتحول الطائرة إلى طائرة عمودية.' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      disabled={quizSubmitted}
                      onClick={() => handleQuizSubmit(option.id)}
                      className={`w-full text-right p-3 rounded-xl border text-sm transition-all ${
                        quizSubmitted
                          ? option.id === 2
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
                  <div className={`p-3 rounded-xl text-xs ${quizAnswer === 2 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
                    {quizAnswer === 2 ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>إجابة صحيحة ورائعة! الانهيار الهوائي (Stall) يحدث بسبب انفصال تدفق الهواء عن السطح العلوي عند الزوايا العالية، مما يفقد الجناح قدرته على توليد الرفع.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. تجاوز الزاوية الحرجة يؤدي إلى انفصال الهواء وانهيار الرفع (Stall).</span>
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
