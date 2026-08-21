import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Wind, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, BookOpen, Gauge, Maximize2, Minimize2, 
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

interface AirfoilModel {
  id: string;
  nameAr: string;
  nameEn: string;
  clMax: number;
  stallAngleDeg: number;
  description: string;
}

const AIRFOILS: AirfoilModel[] = [
  { id: 'naca-2412', nameAr: 'جناح طيران عام (NACA 2412)', nameEn: 'NACA 2412', clMax: 1.6, stallAngleDeg: 16, description: 'المقطع التقليدي لطائرات سيسنا والطيران المدني' },
  { id: 'naca-0012', nameAr: 'مقطع متماثل (NACA 0012)', nameEn: 'NACA 0012', clMax: 1.4, stallAngleDeg: 14, description: 'مقطع متماثل تماماً لدفات التوجيه ومراوح المروحيات' },
  { id: 'supercritical', nameAr: 'مقطع فوق حرج (Supercritical)', nameEn: 'Supercritical', clMax: 1.8, stallAngleDeg: 18, description: 'مقطع طائرات الركاب النفاثة للسرعات العالية' },
];

const AIR_DENSITY = 1.225;
const WING_AREA_M2 = 1.5;

interface WindTunnel3DProps {
  alphaDeg: number;
  windSpeedMs: number;
  selectedAirfoil: AirfoilModel;
  isStalled: boolean;
  liftForceN: number;
  dragForceN: number;
  isPlaying: boolean;
}

function WindTunnel3DScene({
  alphaDeg,
  windSpeedMs,
  selectedAirfoil,
  isStalled,
  liftForceN,
  dragForceN,
  isPlaying,
}: WindTunnel3DProps) {
  const streamlinesRef = useRef<THREE.Group>(null);
  const smokeParticleCount = 80;

  const smokeData = useMemo(() => {
    return Array.from({ length: smokeParticleCount }, () => ({
      x: -5.0 + Math.random() * 0.5,
      y: (Math.random() - 0.5) * 2.8,
      z: (Math.random() - 0.5) * 2.5,
      speed: 0.08 + Math.random() * 0.04,
      turbulent: false,
    }));
  }, [smokeParticleCount]);

  const alphaRad = (-alphaDeg * Math.PI) / 180;

  useFrame(() => {
    if (!isPlaying) return;

    const speedFactor = (windSpeedMs / 50);

    for (let i = 0; i < smokeParticleCount; i++) {
      const p = smokeData[i];
      const mesh = streamlinesRef.current?.children[i] as THREE.Mesh;
      if (!mesh) continue;

      p.x += p.speed * speedFactor;

      if (p.x > -1.5 && p.x < 1.5) {
        const isUpper = p.y > 0;
        if (isUpper) {
          p.y += (alphaDeg * 0.002);
        } else {
          p.y -= (alphaDeg * 0.001);
        }
      }

      if (isStalled && p.x > 0.8 && p.y > 0) {
        p.y += (Math.random() - 0.5) * 0.06;
        p.z += (Math.random() - 0.5) * 0.06;
      }

      if (p.x > 5.0) {
        p.x = -5.0;
        p.y = (Math.random() - 0.5) * 2.8;
        p.z = (Math.random() - 0.5) * 2.5;
      }

      mesh.position.set(p.x, p.y, p.z);
    }
  });

  return (
    <group>
      {/* TEST DUCT */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10.5, 3.8, 3.8]} />
        <meshPhysicalMaterial
          color="#94a3b8"
          transmission={0.92}
          opacity={0.25}
          transparent
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* FRAMES */}
      {[-5.2, -2.6, 0, 2.6, 5.2].map((x, idx) => (
        <group key={`frame-${idx}`} position={[x, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.15, 3.9, 3.9]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* AIRFOIL */}
      <group position={[0, 0, 0]} rotation={[0, 0, alphaRad]}>
        <mesh>
          <boxGeometry args={[2.4, 0.35, 2.8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.175, 0.175, 2.8, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        <mesh position={[1.35, 0, 0]}>
          <boxGeometry args={[0.3, 0.06, 2.8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 3.6, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
      </group>

      {/* FORCE VECTORS */}
      {liftForceN > 10 && (
        <group position={[0, 0.2, 0]}>
          <mesh position={[0, Math.min(2.0, liftForceN / 1200), 0]}>
            <cylinderGeometry args={[0.04, 0.04, Math.min(2.0, liftForceN / 600), 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <Html position={[0, Math.min(2.4, liftForceN / 600 + 0.4), 0]} center>
            <div className="bg-emerald-900/90 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/40 whitespace-nowrap shadow-lg">
              قوة الرفع L = {liftForceN.toFixed(0)} N
            </div>
          </Html>
        </group>
      )}

      {dragForceN > 5 && (
        <group position={[0, 0, 0]}>
          <mesh position={[Math.min(1.8, dragForceN / 400), 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, Math.min(1.8, dragForceN / 200), 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <Html position={[Math.min(2.2, dragForceN / 200 + 0.4), 0, 0]} center>
            <div className="bg-red-900/90 text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/40 whitespace-nowrap shadow-lg">
              قوة السحب D = {dragForceN.toFixed(0)} N
            </div>
          </Html>
        </group>
      )}

      {/* SMOKE PARTICLES */}
      <group ref={streamlinesRef}>
        {smokeData.map((_, i) => (
          <mesh key={`smoke-${i}`}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial
              color={isStalled && smokeData[i].x > 0.5 ? '#f87171' : '#38bdf8'}
              opacity={0.8}
              transparent
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

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

  // Missions
  const [mission1Completed, setMission1Completed] = useState<boolean>(false);
  const [mission2Completed, setMission2Completed] = useState<boolean>(false);
  const [mission3Completed, setMission3Completed] = useState<boolean>(false);

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
    const cl = 0.2 + alphaDeg * 0.105;
    return +Math.min(selectedAirfoil.clMax, cl).toFixed(2);
  }, [alphaDeg, isStalled, selectedAirfoil]);

  const Cd = useMemo(() => {
    const cd0 = 0.015;
    if (isStalled) {
      return +(0.25 + Math.pow((alphaDeg - selectedAirfoil.stallAngleDeg) / 10, 2) * 0.2).toFixed(3);
    }
    const cdInduced = (Cl * Cl) / (Math.PI * 6.0);
    return +(cd0 + cdInduced).toFixed(3);
  }, [alphaDeg, isStalled, Cl, selectedAirfoil]);

  const dynamicPressure = 0.5 * AIR_DENSITY * Math.pow(windSpeedMs, 2);
  const liftForceN = Math.max(0, +(dynamicPressure * WING_AREA_M2 * Cl).toFixed(0));
  const dragForceN = Math.max(0, +(dynamicPressure * WING_AREA_M2 * Cd).toFixed(0));
  const liftToDragRatio = Cd > 0 ? +(Cl / Cd).toFixed(1) : 0;

  useEffect(() => {
    // Mission 1: Generate high lift (> 800 N)
    if (liftForceN >= 800 && !isStalled && !mission1Completed) {
      setMission1Completed(true);
      labSound.playSuccessChime();
    }
    // Mission 2: Trigger aerodynamic stall (> critical alpha)
    if (isStalled && !mission2Completed) {
      setMission2Completed(true);
      labSound.playSuccessChime();
    }
    // Mission 3: Test Supercritical airfoil at high airspeed (> 70 m/s)
    if (selectedAirfoil.id === 'supercritical' && windSpeedMs >= 70 && !mission3Completed) {
      setMission3Completed(true);
      labSound.playSuccessChime();
    }
  }, [liftForceN, isStalled, selectedAirfoil, windSpeedMs, mission1Completed, mission2Completed, mission3Completed]);

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
    const headers = 'Airfoil,Alpha(deg),WindSpeed(m/s),Lift(N),Drag(N),Cl,Cd,L/D_Ratio,IsStalled\n';
    const row = `${selectedAirfoil.nameEn},${alphaDeg},${windSpeedMs},${liftForceN},${dragForceN},${Cl},${Cd},${liftToDragRatio},${isStalled}\n`;
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
                  محاكاة قوى الرفع والسحب ومبدأ برنولي وظاهرة الانهيار الهوائي (Aerodynamic Stall)
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
              <span className="text-xs text-slate-400">قوة الرفع الإجمالية (L)</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{liftForceN} N</p>
              <span className="text-[10px] text-slate-500">نيوتن</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">قوة السحب الإجمالية (D)</span>
              <p className="text-lg font-bold text-red-400 font-mono">{dragForceN} N</p>
              <span className="text-[10px] text-slate-500">مقاومة الهواء</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">معامل الرفع (Cl)</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{Cl}</p>
              <span className="text-[10px] text-slate-500">كفاءة المقطع</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">نسبة الرفع للسحب (L/D)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{liftToDragRatio}</p>
              <span className="text-[10px] text-slate-500">الكفاءة الديناميكية</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حالة تدفق الهواء</span>
              <p className={`text-xs font-bold mt-1 ${isStalled ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {isStalled ? '⚠️ انهيار هوائي (Stall)' : '✓ جريان انسيابي طبقي'}
              </p>
              <span className="text-[10px] text-slate-500">{isStalled ? 'انفصال الدوامات' : 'متزن'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">سرعة الهواء في النفق</span>
              <p className="text-lg font-bold text-slate-200 font-mono">{windSpeedMs} m/s</p>
              <span className="text-[10px] text-slate-500 font-mono">{(windSpeedMs * 3.6).toFixed(0)} km/h</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Activity className="w-4 h-4" />
              نفق الرياح ثلاثي الأبعاد (3D Wind Tunnel)
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Target className="w-4 h-4" />
              مهام الديناميكا الهوائية ({[mission1Completed, mission2Completed, mission3Completed].filter(Boolean).length}/3)
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
              {/* 3D WebGL Canvas */}
              <div className="lg:col-span-2 space-y-3" ref={containerRef}>
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl relative">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Wind className="w-4 h-4 text-sky-400" />
                      غرفة الاختبار وخطوط الدخان ثلاثية الأبعاد (3D Streamlines)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${isStalled ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-sky-500/50 text-sky-300 bg-sky-500/10'}`}>
                        {selectedAirfoil.nameAr.split(' ')[0]}
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
                  <CardContent className="p-0 h-[460px] bg-slate-950 relative">
                    <Canvas camera={{ position: [0, 2.5, 8.5], fov: 45 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 10, 10]} intensity={1.2} />
                      <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#38bdf8" />
                      <WindTunnel3DScene
                        alphaDeg={alphaDeg}
                        windSpeedMs={windSpeedMs}
                        selectedAirfoil={selectedAirfoil}
                        isStalled={isStalled}
                        liftForceN={liftForceN}
                        dragForceN={dragForceN}
                        isPlaying={isPlaying}
                      />
                      <OrbitControls
                        ref={controlsRef}
                        enablePan={true}
                        enableZoom={true}
                        minDistance={4}
                        maxDistance={16}
                      />
                    </Canvas>

                    {/* Camera Angle Presets */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-800 text-[11px]">
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

                    {/* Live Assistant Hint */}
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>
                        {isStalled
                          ? `⚠️ انهيار هوائي عند زاوية (${alphaDeg}° ≥ ${selectedAirfoil.stallAngleDeg}°): انفصلت خطوط الهواء الحمراء عن السطح العلوي، فانهارت قوة الرفع وقفزت مقاومة السحب إلى ${dragForceN} N.`
                          : `💡 جريان طبقي انسيابي: قوة الرفع (${liftForceN} N) تتناسب طردياً مع زاوية الهجوم ومربع السرعة (${windSpeedMs} m/s).`}
                      </span>
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
                                ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{foil.nameAr}</div>
                            <div className="text-[10px] opacity-75">زاوية الانهيار: {foil.stallAngleDeg}° • {foil.description}</div>
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
                        <span className="text-xs font-mono text-sky-400 font-bold">{windSpeedMs} m/s</span>
                      </div>
                      <Slider
                        value={[windSpeedMs]}
                        min={10}
                        max={100}
                        step={1}
                        onValueChange={(val) => setWindSpeedMs(val[0])}
                        className="py-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Guided Missions */}
          <TabsContent value="missions" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 shadow-xl space-y-6">
              <div>
                <CardTitle className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  مهام وتحديات نفق الرياح (Aerodynamic Missions)
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  أكمل هذه المهام لاكتشاف ديناميكا الطيران وتوليد الرفع وظاهرة الانهيار الهوائي.
                </p>
              </div>

              <div className="space-y-4">
                {/* Mission 1 */}
                <div className={`p-4 rounded-xl border transition-all ${mission1Completed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckSquare className={`w-4 h-4 ${mission1Completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        المهمة 1: توليد قوة رفع كافية للإقلاع (&gt; 800 N)
                      </div>
                      <p className="text-xs text-slate-400">
                        اضبط زاوية الهجوم (بين 6° و 12°) وزد سرعة الهواء في النفق لتوليد قوة رفع تفوق 800 نيوتن.
                      </p>
                    </div>
                    <Badge variant="outline" className={mission1Completed ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}>
                      {mission1Completed ? 'مكتملة ✓' : 'قيد الإنجاز'}
                    </Badge>
                  </div>
                </div>

                {/* Mission 2 */}
                <div className={`p-4 rounded-xl border transition-all ${mission2Completed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckSquare className={`w-4 h-4 ${mission2Completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        المهمة 2: اختبار الانهيار الهوائي (Aerodynamic Stall)
                      </div>
                      <p className="text-xs text-slate-400">
                        زد زاوية الهجوم لتتجاوز زاوية الانهيار الحرجة للجناح وراقب انفصال خطوط الدخان الحمراء وانهيار قوة الرفع.
                      </p>
                    </div>
                    <Badge variant="outline" className={mission2Completed ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}>
                      {mission2Completed ? 'مكتملة ✓' : 'قيد الإنجاز'}
                    </Badge>
                  </div>
                </div>

                {/* Mission 3 */}
                <div className={`p-4 rounded-xl border transition-all ${mission3Completed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckSquare className={`w-4 h-4 ${mission3Completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        المهمة 3: اختبار الجناح فوق الحرج (Supercritical Airfoil)
                      </div>
                      <p className="text-xs text-slate-400">
                        اختر المقطع فوق الحرج وارفع سرعة الرياح إلى أكثر من 70 m/s لملاحظة تحسن كفاءة الرفع عند السرعات العالية.
                      </p>
                    </div>
                    <Badge variant="outline" className={mission3Completed ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-500'}>
                      {mission3Completed ? 'مكتملة ✓' : 'قيد الإنجاز'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
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
