import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere, Ring, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Globe, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, Sparkles, BookOpen, Layers, Zap, Compass, Eye, Timer, ShieldAlert 
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

interface BlackHolePreset {
  id: string;
  nameAr: string;
  nameEn: string;
  solarMasses: number;
  typeAr: string;
  description: string;
  color: string;
}

const PRESETS: BlackHolePreset[] = [
  { id: 'cygnus-x1', nameAr: 'الدجاجة X-1 (نجمي)', nameEn: 'Cygnus X-1', solarMasses: 21.2, typeAr: 'ثقب أسود نجمي', description: 'أول ثقب أسود تم تأكيد وجوده رصدياً في مجرتنا', color: '#38bdf8' },
  { id: 'sagittarius-a', nameAr: 'الرامي A* (مركز المجرة)', nameEn: 'Sagittarius A*', solarMasses: 4.15e6, typeAr: 'فائق الكتلة (SMBH)', description: 'الثقب الأسود الهائل في مركز مجرة درب التبانة', color: '#fbbf24' },
  { id: 'm87', nameAr: 'مسييه 87* (M87*)', nameEn: 'M87*', solarMasses: 6.5e9, typeAr: 'عملاق فائق الكتلة', description: 'أول ثقب أسود التقط له تلسكوب أفق الحدث EHT صورة مباشرة', color: '#f97316' },
];

const G = 6.67430e-11;
const C = 299792458;
const SOLAR_MASS_KG = 1.989e30;

// 3D Black Hole Scene
interface BlackHole3DProps {
  probeDistanceMultiplier: number;
  isPlaying: boolean;
  isFalling: boolean;
  selectedPreset: BlackHolePreset;
  timeDilationFactor: number;
}

function BlackHole3DScene({
  probeDistanceMultiplier,
  isPlaying,
  selectedPreset,
  timeDilationFactor,
}: BlackHole3DProps) {
  const diskRef = useRef<THREE.Group>(null);
  const probeRef = useRef<THREE.Group>(null);
  const angleRef = useRef<number>(0);

  // Scaled 3D scene units (Event Horizon = 1.0 unit radius)
  const eventHorizonRadius = 1.2;
  const photonSphereRadius = eventHorizonRadius * 1.5;
  const iscoRadius = eventHorizonRadius * 3.0;

  useFrame((state, delta) => {
    if (!isPlaying) return;

    // Rotate Accretion Disk
    if (diskRef.current) {
      diskRef.current.rotation.z += 0.008;
    }

    // Orbit Probe
    if (probeRef.current) {
      // Slower orbital rate at larger distances (Keplerian)
      const orbitalSpeed = (0.02 * Math.sqrt(eventHorizonRadius / Math.max(1.1, probeDistanceMultiplier)));
      angleRef.current += orbitalSpeed;

      const r3D = probeDistanceMultiplier * eventHorizonRadius;
      const px = Math.cos(angleRef.current) * r3D;
      const pz = Math.sin(angleRef.current) * r3D;
      probeRef.current.position.set(px, 0.15, pz);
    }
  });

  return (
    <group>
      {/* 3D EVENT HORIZON (Absolute Black Sphere) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[eventHorizonRadius, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Relativistic Gravitational Glow Rim */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[eventHorizonRadius * 1.03, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" opacity={0.25} transparent side={THREE.BackSide} />
      </mesh>

      {/* 3D PHOTON SPHERE (1.5 rs) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[photonSphereRadius - 0.03, photonSphereRadius + 0.03, 64]} />
        <meshBasicMaterial color="#fde047" opacity={0.6} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* 3D ACCRETION DISK (Multi-layered Glowing Rings) */}
      <group ref={diskRef} rotation={[Math.PI / 3, 0, 0]}>
        {/* Inner high-energy disk (Blueshifted / hotter) */}
        <mesh>
          <ringGeometry args={[iscoRadius * 0.7, iscoRadius * 1.4, 64]} />
          <meshBasicMaterial
            color="#38bdf8"
            opacity={0.7}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Main glowing thermal disk */}
        <mesh>
          <ringGeometry args={[iscoRadius * 1.35, iscoRadius * 2.2, 64]} />
          <meshBasicMaterial
            color={selectedPreset.color}
            opacity={0.55}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Outer cooler dust ring */}
        <mesh>
          <ringGeometry args={[iscoRadius * 2.15, iscoRadius * 3.2, 64]} />
          <meshBasicMaterial
            color="#ef4444"
            opacity={0.3}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 3D SPACETIME CURVATURE FUNNEL (Gravitational Well Grid) */}
      <group position={[0, -0.2, 0]}>
        {[-0.2, -0.6, -1.2, -2.0].map((depth, idx) => {
          const rad = 5.5 - idx * 1.1;
          return (
            <mesh key={`grid-${idx}`} position={[0, depth, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[rad - 0.02, rad + 0.02, 32]} />
              <meshBasicMaterial color="#475569" opacity={0.25} transparent side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>

      {/* 3D SPACE PROBE (Flying on Geodesic) */}
      <group ref={probeRef}>
        <mesh>
          <boxGeometry args={[0.25, 0.15, 0.25]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Solar Panels */}
        <mesh position={[0.35, 0, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.2]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-0.35, 0, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.2]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Probe Beacon */}
        <pointLight color="#38bdf8" intensity={1.5} distance={2} />
        <Html position={[0, 0.45, 0]} center>
          <div className="bg-slate-900/90 text-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-sky-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            المسبار ({probeDistanceMultiplier.toFixed(2)} rs)
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function BlackHoleSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);

  // States
  const [selectedPreset, setSelectedPreset] = useState<BlackHolePreset>(PRESETS[1]);
  const [probeDistanceMultiplier, setProbeDistanceMultiplier] = useState<number>(3.0);
  const [isFalling, setIsFalling] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

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
  const photonSphereKm = +(schwarzschildRadiusKm * 1.5).toFixed(2);

  // Current probe distance in meters & km
  const currentRadiusM = probeDistanceMultiplier * schwarzschildRadiusM;
  const currentRadiusKm = +(currentRadiusM / 1000).toFixed(2);

  // Gravitational Time Dilation Factor: dtau / dt = sqrt(1 - rs / r)
  const timeDilationFactor = useMemo(() => {
    if (probeDistanceMultiplier <= 1.0001) return 0.00001;
    return Math.sqrt(1 - 1 / probeDistanceMultiplier);
  }, [probeDistanceMultiplier]);

  // Gravitational Redshift: z = 1 / sqrt(1 - rs/r) - 1
  const gravitationalRedshift = useMemo(() => {
    if (probeDistanceMultiplier <= 1.0001) return 9999;
    return +( (1 / timeDilationFactor) - 1 ).toFixed(3);
  }, [probeDistanceMultiplier, timeDilationFactor]);

  // Simulation loop for falling probe and clocks
  React.useEffect(() => {
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
                  الثقوب السوداء وتمدد الزمن الثقالي ثلاثية الأبعاد (3D)
                </h1>
                <p className="text-sm text-slate-400">
                  استكشاف متريّة شفارتزشيلد، أفق الحدث، وتجمد ساعات المسبار عند حافة الزمكان
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
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
              إعادة ضبط المسبار والكاميرا
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
              {/* 3D WebGL Canvas */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl relative">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Eye className="w-4 h-4 text-purple-400" />
                      محاكاة الثقب الأسود وقرص التراكم ثلاثية الأبعاد (3D Scene)
                    </CardTitle>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-300 bg-purple-500/10">
                      {selectedPreset.nameAr}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0 h-[440px] bg-slate-950 relative">
                    <Canvas camera={{ position: [0, 4.5, 9.0], fov: 45 }}>
                      <ambientLight intensity={0.4} />
                      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />
                      <BlackHole3DScene
                        probeDistanceMultiplier={probeDistanceMultiplier}
                        isPlaying={isPlaying}
                        isFalling={isFalling}
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

                    {/* 3D Controls Helper */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>اسحب للتدوير 360° حول الثقب الأسود • قرّب وبعّد للمعاينة</span>
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
                            onClick={() => setSelectedPreset(preset)}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedPreset.id === preset.id
                                ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
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
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>أفق الحدث (1.0 rs)</span>
                        <span>كرة الفوتونات (1.5 rs)</span>
                        <span>مدار آمن (6.0 rs)</span>
                      </div>
                    </div>

                    {/* Fall towards event horizon button */}
                    <div className="pt-2">
                      <Button
                        onClick={() => setIsFalling(!isFalling)}
                        className={`w-full font-bold text-xs ${
                          isFalling
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }`}
                      >
                        {isFalling ? 'إيقاف السقوط الحر' : 'بدء السقوط الحر نحو أفق الحدث 🚀'}
                      </Button>
                      <p className="text-[10px] text-slate-500 text-center mt-2">
                        لاحظ كيف تبطؤ ساعة المسبار تدريجياً كلما اقترب من أفق الحدث حتى تتوقف كلياً.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-purple-300">الفيزياء النسبية للثقوب السوداء (النسبية العامة 1915)</h3>
              <p>
                في عام 1916، استنتج الفيزيائي الألماني كارل شفارتزشيلد أول حل دقيق لمعادلات أينشتاين للمجال، واصفاً هندسة الزمكان حول كتلة كروية غير دوارة.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. نصف قطر شفارتزشيلد (Schwarzschild Radius)</h4>
                  <p className="text-sm font-mono text-purple-300">rs = 2GM / c²</p>
                  <p className="text-xs text-slate-400">
                    هو نصف القطر الذي إذا انضغطت داخله أي كتلة M تصبح سرعة الإفلات مساوية لسرعة الضوء c، ويتشكل أفق الحدث.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. معادلة تمدد الزمن الثقالي</h4>
                  <p className="text-sm font-mono text-purple-300">dτ = dt · √(1 - rs / r)</p>
                  <p className="text-xs text-slate-400">
                    كلما اقترب الموضع r من rs، يقترب المقدار تحت الجذر من الصفر، ويتوقف الزمن dτ ⟹ 0 بالنسبة للراصد البعيد.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: Quiz */}
          <TabsContent value="quiz" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  اختبار مفاهيم النسبية العامة والثقوب السوداء
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: بالنسبة لراصد يقف بعيداً جداً عن ثقب أسود، ماذا يرى عندما يسقط رائد فضاء نحو أفق الحدث؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: 'يراه يعبر أفق الحدث بسرعة البرق ويختفي فوراً.' },
                    { id: 1, text: 'يراه يتباطأ تدريجياً ويتلاشى ضوؤه بسبب الإزاحة الحمراء التثاقلية، ويبدو كأنه تجمد للأبد عند أفق الحدث.' },
                    { id: 2, text: 'يرى ساعته تدق أسرع من المعتاد.' },
                    { id: 3, text: 'يرتد رائد الفضاء إلى الفضاء الخارجي.' },
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
                        <span>إجابة صحيحة ورائعة! بسبب تمدد الزمن التثاقلي اللانهائي عند أفق الحدث والإزاحة التثاقلية نحو الأحمر، يرى الراصد البعيد أن رائد الفضاء يتجمد ضوئياً ولا يعبر الأفق في زمن كوني محدود.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. تمدد الزمن الثقالي يجعل الحركة تبدو متباطئة للغاية حتى تتجمد عند أفق الحدث بالنسبة للراصد البعيد.</span>
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
