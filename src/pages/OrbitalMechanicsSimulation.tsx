import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Rocket, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, BookOpen, Globe2, Maximize2, Minimize2, 
  Volume2, VolumeX, Download, Lightbulb, Target, CheckSquare, Zap 
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
import OrbitalMechanics3DScene from '@/components/astronomy/OrbitalMechanics3DScene';
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

const MU_EARTH = 3.986004418e14; // m³/s² (G * M_earth)
const R_EARTH_KM = 6371; // Earth radius in km

interface OrbitPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  perigeeAltKm: number;
  apogeeAltKm: number;
  description: string;
}

const PRESETS: OrbitPreset[] = [
  { id: 'leo', nameAr: 'مدار أرضي منخفض (LEO - محطة ISS)', nameEn: 'LEO', perigeeAltKm: 420, apogeeAltKm: 420, description: 'مدار المحطة الفضائية الدولية ومقر معظم الأقمار' },
  { id: 'geo', nameAr: 'مدار جغرافي ثابت (GEO)', nameEn: 'GEO', perigeeAltKm: 35786, apogeeAltKm: 35786, description: 'مدار أقمار الاتصالات والطقس الثابتة فوق خط الاستواء' },
  { id: 'gto', nameAr: 'مدار النقل الثابت (GTO Transfer)', nameEn: 'GTO', perigeeAltKm: 420, apogeeAltKm: 35786, description: 'مسار هوهمان الإهليلجي للانتقال من LEO إلى GEO' },
  { id: 'molniya', nameAr: 'مدار مولنيا عالي الإهليلجية', nameEn: 'Molniya', perigeeAltKm: 600, apogeeAltKm: 39800, description: 'مدار روسي لتغطية المناطق القطبية الشمالية' },
];

const orbitalChallenges: Challenge[] = [
  {
    id: 'leo_orbit',
    title: 'تحقيق المدار الأرضي المنخفض (LEO)',
    description: 'اضبط مداراً دائرياً منخفضاً (الارتفاع ≤ 500 km والإهليلجية e ≤ 0.05) بسرعة v ≈ 7.66 km/s واثبت 3 ثوانٍ.',
    targetMetric: 'الارتفاع LEO',
    targetValue: 500,
    unit: 'km',
    holdDuration: 3,
    check: (m) => (m.perigeeAltKm ?? 0) <= 500 && (m.apogeeAltKm ?? 0) <= 500 && (m.eccentricity ?? 0) <= 0.05,
  },
  {
    id: 'gto_transfer',
    title: 'مسار هوهمان الانتقالي (GTO)',
    description: 'أنشئ مدار نقل إهليلجي بحضيض LEO (≤ 600 km) وأوج GEO (≥ 34000 km) واثبت 3 ثوانٍ.',
    targetMetric: 'أوج GTO',
    targetValue: 34000,
    unit: 'km',
    holdDuration: 3,
    check: (m) => (m.perigeeAltKm ?? 0) <= 600 && (m.apogeeAltKm ?? 0) >= 34000,
  },
  {
    id: 'geo_orbit',
    title: 'المدار الجغرافي المتزامن (GEO)',
    description: 'اضبط ارتفاع المدار على 35786 km (بفارق أقل من 1000 km) ليتزامن زمن الدورة مع 24 ساعة أرضية.',
    targetMetric: 'ارتفاع GEO',
    targetValue: 35786,
    unit: 'km',
    holdDuration: 3,
    check: (m) => Math.abs((m.perigeeAltKm ?? 0) - 35786) < 1000 && Math.abs((m.apogeeAltKm ?? 0) - 35786) < 1000,
  },
];

export default function OrbitalMechanicsSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [selectedPreset, setSelectedPreset] = useState<OrbitPreset>(PRESETS[0]);
  const [perigeeAltKm, setPerigeeAltKm] = useState<number>(420);
  const [apogeeAltKm, setApogeeAltKm] = useState<number>(420);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [trueAnomalyDeg, setTrueAnomalyDeg] = useState<number>(0);

  // Quiz state
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Physics Calculations
  const rPerigeeKm = R_EARTH_KM + perigeeAltKm;
  const rApogeeKm = R_EARTH_KM + apogeeAltKm;
  const semiMajorAxisKm = (rPerigeeKm + rApogeeKm) / 2;
  const semiMajorAxisM = semiMajorAxisKm * 1000;

  const eccentricity = (rApogeeKm - rPerigeeKm) / (rApogeeKm + rPerigeeKm);

  // Kepler's Third Law for period: T = 2π √(a³ / μ)
  const orbitalPeriodSec = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxisM, 3) / MU_EARTH);
  const orbitalPeriodMin = +(orbitalPeriodSec / 60).toFixed(1);
  const orbitalPeriodHours = +(orbitalPeriodSec / 3600).toFixed(2);

  // Current radius at true anomaly: r = a(1 - e²) / (1 + e cos(ν))
  const trueAnomalyRad = (trueAnomalyDeg * Math.PI) / 180;
  const currentR_Km = (semiMajorAxisKm * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomalyRad));
  const currentAltKm = +(currentR_Km - R_EARTH_KM).toFixed(0);

  // Vis-Viva Equation: v² = μ(2/r - 1/a)
  const currentR_M = currentR_Km * 1000;
  const currentVelocityMs = Math.sqrt(MU_EARTH * (2 / currentR_M - 1 / semiMajorAxisM));
  const currentVelocityKms = +(currentVelocityMs / 1000).toFixed(2);

  // Hohmann Transfer delta-v (LEO to GEO)
  const deltaV_LEO_to_GTO = useMemo(() => {
    const r1 = (R_EARTH_KM + 420) * 1000;
    const r2 = (R_EARTH_KM + 35786) * 1000;
    const vLEO = Math.sqrt(MU_EARTH / r1);
    const vTransferPerigee = Math.sqrt(MU_EARTH * (2 / r1 - 2 / (r1 + r2)));
    return +((vTransferPerigee - vLEO) / 1000).toFixed(2);
  }, []);

  const deltaV_GTO_to_GEO = useMemo(() => {
    const r1 = (R_EARTH_KM + 420) * 1000;
    const r2 = (R_EARTH_KM + 35786) * 1000;
    const vGEO = Math.sqrt(MU_EARTH / r2);
    const vTransferApogee = Math.sqrt(MU_EARTH * (2 / r2 - 2 / (r1 + r2)));
    return +((vGEO - vTransferApogee) / 1000).toFixed(2);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const meanMotionDegPerSec = (360 / (orbitalPeriodMin * 60)) * 40;
      setTrueAnomalyDeg((a) => (a + meanMotionDegPerSec) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, orbitalPeriodMin]);

  const handleApplyPreset = (p: OrbitPreset) => {
    setSelectedPreset(p);
    setPerigeeAltKm(p.perigeeAltKm);
    setApogeeAltKm(p.apogeeAltKm);
    labSound.playRocketBurst();
  };

  const setCameraView = (view: 'default' | 'top' | 'satellite' | 'earth') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'default') {
      controls.object.position.set(0, 6.0, 10.0);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      controls.object.position.set(0, 13.0, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'satellite') {
      controls.object.position.set(2.5, 1.5, 3.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'earth') {
      controls.object.position.set(0, 1.0, 3.2);
      controls.target.set(0, 0, 0);
    }
    controls.update();
    labSound.playLaserPulse(650);
  };

  const toggleSound = () => {
    const muted = labSound.toggleMute();
    setIsMuted(muted);
  };

  const handleExportDataCSV = () => {
    const headers = 'Orbit,PerigeeAlt(km),ApogeeAlt(km),Eccentricity,Period(min),CurrentAlt(km),Velocity(km/s),DeltaV_Hohmann1(km/s),DeltaV_Hohmann2(km/s)\n';
    const row = `${selectedPreset.nameEn},${perigeeAltKm},${apogeeAltKm},${eccentricity.toFixed(3)},${orbitalPeriodMin},${currentAltKm},${currentVelocityKms},${deltaV_LEO_to_GTO},${deltaV_GTO_to_GEO}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orbital_telemetry_${selectedPreset.id}.csv`;
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
              <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/20">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                  ميكانيكا المدارات الفضائية ومناورات هوهمان ثلاثية الأبعاد (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  حسابات كبلر، مناورات الدفع الصاروخي \(\Delta v\)، والانتقال بين المدارات الأرضية LEO و GEO
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

        {/* Live Flight Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">السرعة المدارية الحالية (v)</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{currentVelocityKms} km/s</p>
              <span className="text-[10px] text-slate-500 font-mono">{(currentVelocityKms * 3600).toFixed(0)} km/h</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الارتفاع المداري اللحظي</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{currentAltKm.toLocaleString()} km</p>
              <span className="text-[10px] text-slate-500">فوق سطح الأرض</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">زمن الدورة الكاملة (T)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">
                {orbitalPeriodHours >= 2 ? `${orbitalPeriodHours} h` : `${orbitalPeriodMin} m`}
              </p>
              <span className="text-[10px] text-slate-500">قانون كبلر الثالث</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">معامل الإهليلجية (e)</span>
              <p className="text-lg font-bold text-purple-400 font-mono">{eccentricity.toFixed(3)}</p>
              <span className="text-[10px] text-slate-500">{eccentricity < 0.01 ? 'دائري' : 'إهليلجي'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">نصف المحور الأكبر (a)</span>
              <p className="text-lg font-bold text-slate-200 font-mono">{semiMajorAxisKm.toLocaleString()} km</p>
              <span className="text-[10px] text-slate-500">من مركز الأرض</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">دفع النقل هوهمان Δv</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">{(deltaV_LEO_to_GTO + deltaV_GTO_to_GEO).toFixed(2)} km/s</p>
              <span className="text-[10px] text-slate-500">إجمالي نقل LEO→GEO</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <Activity className="w-4 h-4" />
              المدار الفضائي ثلاثي الأبعاد (3D Space Arena)
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Target className="w-4 h-4" />
              تحديات الميكانيكا المدارية
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              قوانين كبلر ومعادلة فيس-فيفا
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
                      <Globe2 className="w-4 h-4 text-blue-400" />
                      المسار المداري حول كوكب الأرض (Keplerian Orbit 3D)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-blue-500/50 text-blue-300 bg-blue-500/10">
                        {selectedPreset.nameEn}
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
                    <Canvas camera={{ position: [0, 6.0, 10.0], fov: 45 }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[10, 10, 10]} intensity={1.5} />
                      <directionalLight position={[-10, -5, -10]} intensity={0.3} color="#38bdf8" />
                      <OrbitalMechanics3DScene
                        currentR_Km={currentR_Km}
                        semiMajorAxisKm={semiMajorAxisKm}
                        eccentricity={eccentricity}
                        trueAnomalyRad={trueAnomalyRad}
                        currentVelocityKms={currentVelocityKms}
                        perigeeAltKm={perigeeAltKm}
                        apogeeAltKm={apogeeAltKm}
                        isPlaying={isPlaying}
                      />
                      <OrbitControls
                        ref={controlsRef}
                        enablePan={true}
                        enableZoom={true}
                        minDistance={3.5}
                        maxDistance={22}
                      />
                    </Canvas>

                    {/* CyberLab HUD */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <CyberLabHUD
                        metrics={[
                          { label: 'السرعة v', value: currentVelocityKms, unit: 'km/s', color: '#10b981' },
                          { label: 'الارتفاع h', value: currentAltKm, unit: 'km', color: '#38bdf8' },
                          { label: 'زمن الدورة T', value: `${orbitalPeriodMin} m`, color: '#f59e0b' },
                          { label: 'الإهليلجية e', value: eccentricity.toFixed(3), color: '#c084fc' },
                        ]}
                        status={isPlaying ? 'ACTIVE' : 'IDLE'}
                        waveformData={[
                          (currentVelocityKms * 5) % 35,
                          (currentAltKm / 1000) % 30,
                          eccentricity * 35,
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
                        onClick={() => setCameraView('satellite')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        القمر الصناعي
                      </button>
                      <button
                        onClick={() => setCameraView('earth')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        الأرض
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
                      <Rocket className="w-4 h-4 text-blue-400" />
                      إعدادات المدار ومناورات الدفع
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Orbit Presets */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر مداراً قياسياً</label>
                      <div className="space-y-1.5">
                        {PRESETS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleApplyPreset(p)}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedPreset.id === p.id
                                ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/10'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{p.nameAr}</div>
                            <div className="text-[10px] opacity-75">{p.perigeeAltKm}x{p.apogeeAltKm} كم • {p.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Perigee Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">ارتفاع نقطة الحضيض (Perigee Alt)</label>
                        <span className="text-xs font-mono text-cyan-400 font-bold">{perigeeAltKm.toLocaleString()} km</span>
                      </div>
                      <Slider
                        value={[perigeeAltKm]}
                        min={200}
                        max={36000}
                        step={100}
                        onValueChange={(val) => setPerigeeAltKm(Math.min(val[0], apogeeAltKm))}
                        className="py-1"
                      />
                    </div>

                    {/* Apogee Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">ارتفاع نقطة الأوج (Apogee Alt)</label>
                        <span className="text-xs font-mono text-amber-400 font-bold">{apogeeAltKm.toLocaleString()} km</span>
                      </div>
                      <Slider
                        value={[apogeeAltKm]}
                        min={200}
                        max={40000}
                        step={100}
                        onValueChange={(val) => setApogeeAltKm(Math.max(val[0], perigeeAltKm))}
                        className="py-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* AI Lab CoPilot */}
                <LiveAILabCoPilot
                  experimentName="الميكانيكا المدارية والفلكية"
                  currentMetrics={{
                    orbit: selectedPreset.nameEn,
                    perigeeKm: perigeeAltKm,
                    apogeeKm: apogeeAltKm,
                    eccentricity: Number(eccentricity.toFixed(3)),
                    velocityKms: currentVelocityKms,
                    altitudeKm: currentAltKm,
                    periodMin: orbitalPeriodMin,
                  }}
                  hint={`قانون كبلر الثاني: سرعة القمر تبلغ ذروتها عند الحضيض (${perigeeAltKm} km) وتصل أدناها عند الأوج (${apogeeAltKm} km). معادلة فيس-فيفا تحكم السرعة في كل نقطة: v² = μ(2/r - 1/a).`}
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Challenges Engine */}
          <TabsContent value="challenges" className="space-y-4">
            <LabChallengeEngine
              challenges={orbitalChallenges}
              currentMetrics={{
                perigeeAltKm: perigeeAltKm,
                apogeeAltKm: apogeeAltKm,
                eccentricity: eccentricity,
                currentVelocityKms: currentVelocityKms,
              }}
            />
          </TabsContent>

          {/* TAB 3: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-sky-300">قوانين كبلر والميكانيكا المدارية الفلكية</h3>
              <p>
                تخضع حركة الأقمار الصناعية والمركبات الفضائية لقوانين يوهانس كبلر وقانون الجاذبية العام لنيوتن ومعادلة الطاقة المدارية (Vis-Viva Equation).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. معادلة فيس-فيفا (Vis-Viva Equation)</h4>
                  <p className="text-sm font-mono text-sky-300">v² = GM · (2/r - 1/a)</p>
                  <p className="text-xs text-slate-400">
                    تحدد السرعة المدارية v عند أي مسافة r من مركز الجرم الجاذب كدالة لنصف المحور الأكبر a وثابت الجاذبية القياسي GM.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. مناورة نقل هوهمان (Hohmann Transfer)</h4>
                  <p className="text-sm font-mono text-sky-300">Δv_total = Δv₁ + Δv₂</p>
                  <p className="text-xs text-slate-400">
                    أكثر المناورات الفضائية كفاءة في استهلاك الوقود لنقل قمر صناعي بين مدارين دائريين متحدي المركز باستخدام مدار إهليلجي وسيط.
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
                  اختبار مفاهيم الميكانيكا المدارية
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: في مدار إهليلجي حول الأرض، أين تكون السرعة المدارية للقمر الصناعي في أعلى قيمة لها؟
                </p>
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'عند نقطة الأوج (Apogee - أبعد نقطة عن الأرض).' },
                    { id: 1, text: 'عند نقطة الحضيض (Perigee - أقرب نقطة إلى الأرض).' },
                    { id: 2, text: 'السرعة ثابتة في جميع نقاط المدار.' },
                    { id: 3, text: 'عند القطب الشمالي فقط.' },
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
                        <span>إجابة صحيحة! وفقاً لقانون كبلر الثاني (حفظ الزخم الزاوي)، يقطع نصف القطر مساحات متساوية في أزمنة متساوية، فتصل السرعة إلى ذروتها القصوى عند الحضيض (Perigee).</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. السرعة تبلغ أعلى قيمة عند الحضيض (Perigee) بسبب قرب القمر من مركز الجاذبية.</span>
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
