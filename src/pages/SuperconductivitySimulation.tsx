import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Cylinder, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Magnet, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, Sparkles, BookOpen, Layers, Zap, Compass, Eye, ShieldAlert, Snowflake, Thermometer,
  Volume2, VolumeX, Download, Maximize2, Minimize2, Lightbulb 
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

interface SuperconductorMaterial {
  id: string;
  nameAr: string;
  nameEn: string;
  criticalTempK: number;
  type: 'Type I' | 'Type II';
  description: string;
  color: string;
}

const MATERIALS: SuperconductorMaterial[] = [
  { id: 'ybco', nameAr: 'خزف YBCO الفائق (YBa₂Cu₃O₇)', nameEn: 'YBCO', criticalTempK: 93, type: 'Type II', description: 'موصل فائق فائق الحرارة يبرد بالنيتروجين السائل (77K)', color: '#334155' },
  { id: 'bscco', nameAr: 'مركب BSCCO (Bi-2223)', nameEn: 'BSCCO', criticalTempK: 108, type: 'Type II', description: 'يستخدم في كابلات نقل الطاقة فائقة الكفاءة', color: '#1e293b' },
  { id: 'mgb2', nameAr: 'ثنائي بوريد المغنيسيوم (MgB₂)', nameEn: 'MgB2', criticalTempK: 39, type: 'Type II', description: 'معدن فائق التوصيل منخفض التكلفة', color: '#475569' },
  { id: 'mercury', nameAr: 'الزئبق الصلب (كامرلنغ أونس 1911)', nameEn: 'Mercury', criticalTempK: 4.2, type: 'Type I', description: 'أول موصل فائق تم اكتشافه بالهيليوم السائل', color: '#94a3b8' },
];

interface Superconductor3DProps {
  temperatureK: number;
  selectedMaterial: SuperconductorMaterial;
  isSuperconducting: boolean;
  isPlaying: boolean;
}

function Superconductivity3DScene({
  temperatureK,
  selectedMaterial,
  isSuperconducting,
  isPlaying,
}: Superconductor3DProps) {
  const magnetRef = useRef<THREE.Group>(null);
  const fogRef = useRef<THREE.Group>(null);

  const fogCount = 40;
  const fogData = useMemo(() => {
    return Array.from({ length: fogCount }, () => ({
      x: (Math.random() - 0.5) * 3.5,
      y: -0.6 + Math.random() * 0.4,
      z: (Math.random() - 0.5) * 3.5,
      vy: 0.008 + Math.random() * 0.012,
    }));
  }, [fogCount]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    if (magnetRef.current) {
      if (isSuperconducting) {
        magnetRef.current.position.y = THREE.MathUtils.lerp(
          magnetRef.current.position.y,
          1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.08,
          0.05
        );
        magnetRef.current.rotation.y += 0.02;
        magnetRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.05;
      } else {
        magnetRef.current.position.y = THREE.MathUtils.lerp(magnetRef.current.position.y, 0.25, 0.08);
        magnetRef.current.rotation.y = 0;
        magnetRef.current.rotation.x = 0;
      }
    }

    if (fogRef.current && temperatureK <= 120) {
      for (let i = 0; i < fogCount; i++) {
        const p = fogData[i];
        const mesh = fogRef.current.children[i] as THREE.Mesh;
        if (!mesh) continue;

        p.y += p.vy;
        if (p.y > 1.8) {
          p.y = -0.6;
          p.x = (Math.random() - 0.5) * 3.5;
          p.z = (Math.random() - 0.5) * 3.5;
        }
        mesh.position.set(p.x, p.y, p.z);
      }
    }
  });

  return (
    <group>
      {/* CRYOGENIC DISH */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[3.2, 3.5, 0.5, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* LIQUID NITROGEN POOL */}
      {temperatureK <= 100 && (
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[3.0, 3.0, 0.1, 32]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.8}
            opacity={0.6}
            transparent
            roughness={0.1}
          />
        </mesh>
      )}

      {/* SUPERCONDUCTOR DISK */}
      <group position={[0, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[1.8, 1.8, 0.35, 32]} />
          <meshStandardMaterial
            color={selectedMaterial.color}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        <Html position={[0, -0.45, 0]} center>
          <div className="bg-slate-900/90 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            قرص التوصيل الفائق ({selectedMaterial.nameAr})
          </div>
        </Html>
      </group>

      {/* FLOATING MAGNET */}
      <group ref={magnetRef} position={[0, 0.25, 0]}>
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.7, 0.24, 0.7]} />
          <meshStandardMaterial color="#ef4444" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.12, 0]}>
          <boxGeometry args={[0.7, 0.24, 0.7]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
        </mesh>
        <Html position={[0, 0.45, 0]} center>
          <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap ${
            isSuperconducting ? 'bg-cyan-500 text-slate-950 font-extrabold animate-bounce' : 'bg-slate-800 text-slate-400'
          }`}>
            {isSuperconducting ? 'طفو كمي حر (Meissner) ⚡' : 'مغناطيس نيوديميوم (مستقر)'}
          </div>
        </Html>
      </group>

      {/* EXPELLED MAGNETIC FLUX */}
      {isSuperconducting ? (
        <group position={[0, 0.5, 0]}>
          {[-1.4, 0, 1.4].map((z, idx) => (
            <mesh key={`flux-${idx}`} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[1.6, 0.02, 16, 32, Math.PI]} />
              <meshBasicMaterial color="#38bdf8" opacity={0.6} transparent />
            </mesh>
          ))}
        </group>
      ) : (
        <group position={[0, 0, 0]}>
          {[-0.8, 0, 0.8].map((x, idx) => (
            <mesh key={`norm-flux-${idx}`} position={[x, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 2.4, 8]} />
              <meshBasicMaterial color="#ef4444" opacity={0.35} transparent />
            </mesh>
          ))}
        </group>
      )}

      {/* NITROGEN VAPOR FOG */}
      {temperatureK <= 100 && (
        <group ref={fogRef}>
          {fogData.map((_, i) => (
            <mesh key={`fog-${i}`}>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshBasicMaterial color="#e0f2fe" opacity={0.3} transparent />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export default function SuperconductivitySimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [selectedMaterial, setSelectedMaterial] = useState<SuperconductorMaterial>(MATERIALS[0]);
  const [temperatureK, setTemperatureK] = useState<number>(77);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Quiz States
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const isSuperconducting = temperatureK < selectedMaterial.criticalTempK;

  const electricalResistanceOhms = useMemo(() => {
    if (isSuperconducting) return 0.0;
    const deltaT = temperatureK - selectedMaterial.criticalTempK;
    return +(0.5 + deltaT * 0.04).toFixed(3);
  }, [temperatureK, selectedMaterial, isSuperconducting]);

  const handleCoolWithNitrogen = () => {
    setTemperatureK(77);
    labSound.playCryoHiss();
  };

  const setCameraView = (view: 'default' | 'top' | 'magnet' | 'disk') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'default') {
      controls.object.position.set(0, 2.5, 7.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      controls.object.position.set(0, 9.0, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'magnet') {
      controls.object.position.set(0, 1.2, 3.2);
      controls.target.set(0, 1.0, 0);
    } else if (view === 'disk') {
      controls.object.position.set(3.5, 0.5, 3.5);
      controls.target.set(0, 0, 0);
    }
    controls.update();
    labSound.playLaserPulse(600);
  };

  const toggleSound = () => {
    const muted = labSound.toggleMute();
    setIsMuted(muted);
  };

  const handleExportDataCSV = () => {
    const headers = 'Material,CriticalTemp(K),CurrentTemp(K),Resistance(Ohm),IsSuperconducting,MagneticFieldInternal(T)\n';
    const row = `${selectedMaterial.nameEn},${selectedMaterial.criticalTempK},${temperatureK},${electricalResistanceOhms},${isSuperconducting},${isSuperconducting ? 0 : 0.85}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `superconductivity_${selectedMaterial.id}_data.csv`;
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
    if (selected === 0) {
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
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-2xl shadow-lg shadow-cyan-500/20">
                <Magnet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300 bg-clip-text text-transparent">
                  الموصلية الفائقة وتأثير مايسنر ثلاثية الأبعاد (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  انعدام المقاومة تماماً R=0، طرد المجال المغناطيسي B=0، والطفو الكمي (Quantum Levitation)
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

        {/* Live Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">درجة الحرارة (T)</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">{temperatureK} K</p>
              <span className="text-[10px] text-slate-500 font-mono">{(temperatureK - 273.15).toFixed(1)}°C</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الحرارة الحرجة (Tc)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{selectedMaterial.criticalTempK} K</p>
              <span className="text-[10px] text-slate-500">{selectedMaterial.nameEn}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">المقاومة الكهربائية (R)</span>
              <p className={`text-lg font-bold font-mono ${isSuperconducting ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`}>
                {isSuperconducting ? '0.0000 Ω' : `${electricalResistanceOhms} Ω`}
              </p>
              <span className="text-[10px] text-slate-500">{isSuperconducting ? 'موصل فائق مثالي' : 'مقاومة عادية'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">المجال الداخلي (B_in)</span>
              <p className="text-lg font-bold text-purple-400 font-mono">{isSuperconducting ? '0.00 Tesla' : 'مخترق'}</p>
              <span className="text-[10px] text-slate-500">{isSuperconducting ? 'طرد تام (مايسنر)' : 'نفاذ مغناطيسي'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حالة الطفو الكمي</span>
              <p className={`text-xs font-bold mt-1 ${isSuperconducting ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isSuperconducting ? '⚡ طفو وتثبيت كمي' : 'لا يوجد طفو'}
              </p>
              <span className="text-[10px] text-slate-500">{isSuperconducting ? 'مستقر في الهواء' : 'مستقر على السطح'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">نوع الموصل الفائق</span>
              <p className="text-sm font-bold text-sky-300 mt-1">{selectedMaterial.type}</p>
              <span className="text-[10px] text-slate-500">{selectedMaterial.nameAr.split(' ')[0]}</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
              <Activity className="w-4 h-4" />
              حوض التبريد والطفو ثلاثي الأبعاد (3D View)
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              تأثير مايسنر ونظرية BCS
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
                      <Magnet className="w-4 h-4 text-cyan-400" />
                      الطفو المغناطيسي الكمي وطرد الفيض ثلاثي الأبعاد (3D Scene)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${isSuperconducting ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-400'}`}>
                        {isSuperconducting ? '✓ موصلية فائقة (T < Tc)' : 'حالة طبيعية (T > Tc)'}
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
                    <Canvas camera={{ position: [0, 2.5, 7.5], fov: 45 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 10, 10]} intensity={1.2} />
                      <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#38bdf8" />
                      <Superconductivity3DScene
                        temperatureK={temperatureK}
                        selectedMaterial={selectedMaterial}
                        isSuperconducting={isSuperconducting}
                        isPlaying={isPlaying}
                      />
                      <OrbitControls
                        ref={controlsRef}
                        enablePan={true}
                        enableZoom={true}
                        minDistance={3.5}
                        maxDistance={14}
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
                        onClick={() => setCameraView('magnet')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        المغناطيس
                      </button>
                      <button
                        onClick={() => setCameraView('disk')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        القرص الفائق
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
                      <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>
                        {isSuperconducting
                          ? `💡 الموصلية الفائقة نشطة (${temperatureK}K < ${selectedMaterial.criticalTempK}K): المقاومة R = 0 تماماً، وطرد خطوط الفيض المغناطيسي (تأثير مايسنر B=0) يجعل المغناطيس يطفو بثبات.`
                          : `💡 درجة الحرارة (${temperatureK}K) أعلى من الحرارة الحرجة Tc (${selectedMaterial.criticalTempK}K). اضغط على "سكب النيتروجين السائل" لتبريد القرص وبدء الطفو.`}
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
                      <Thermometer className="w-4 h-4 text-cyan-400" />
                      التحكم بالحرارة ونوع المادة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Material Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر مادة الموصل الفائق</label>
                      <div className="space-y-1.5">
                        {MATERIALS.map((mat) => (
                          <button
                            key={mat.id}
                            onClick={() => {
                              setSelectedMaterial(mat);
                              labSound.playLaserPulse(500);
                            }}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedMaterial.id === mat.id
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{mat.nameAr}</div>
                            <div className="text-[10px] opacity-75">Tc = {mat.criticalTempK} K ({mat.criticalTempK - 273}°C) • {mat.type}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Temperature Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">درجة الحرارة (Temperature)</label>
                        <span className="text-xs font-mono text-cyan-400 font-bold">{temperatureK} K</span>
                      </div>
                      <Slider
                        value={[temperatureK]}
                        min={2}
                        max={150}
                        step={1}
                        onValueChange={(val) => setTemperatureK(val[0])}
                        className="py-1"
                      />
                    </div>

                    {/* Liquid Nitrogen Quick Cool Button */}
                    <div className="pt-2">
                      <Button
                        onClick={handleCoolWithNitrogen}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Snowflake className="w-4 h-4" />
                        سكب النيتروجين السائل (تبريد فوري 77K)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-cyan-300">فيزياء الموصلية الفائقة وتأثير مايسنر (1933)</h3>
              <p>
                اكتشف فالتر مايسنر وروبرت أوشنفلد أن الموصل الفائق ليس مجرد مادة ذات مقاومة صفرية (R=0)، بل هو <strong>دايامغناطيسي مثالي</strong> يقوم بطرد جميع خطوط المجال المغناطيسي من داخله تماماً (B=0) عند تبريده تحت درجة الحرارة الحرجة Tc.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. نظرية أزواج كوبر (BCS Theory)</h4>
                  <p className="text-xs text-slate-400">
                    عند درجات الحرارة المنخفضة، تترابط الإلكترونات في أزواج تسمى &quot;أزواج كوبر&quot; بفضل التفاعل مع اهتزازات الشبكة البلورية، وتتحرك دون أي تصادم أو فقدان للطاقة.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. ظاهرة التثبيت الكمي (Flux Pinning)</h4>
                  <p className="text-xs text-slate-400">
                    في الموصلات الفائقة من النوع الثاني، تخترق خطوط مغناطيسية دقيقة الشوائب وتُحبس كمياً، مما يثبت المغناطيس في الفضاء بشكل مستقر ومذهل ثلاثي الأبعاد.
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
                  اختبار مفاهيم الموصلية الفائقة
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: ما هو الفارق الجوهري بين موصل كهربائي مثالي ذي مقاومة صفرية (R=0) وبين موصل فائق حقيقي يخضع لتأثير مايسنر؟
                </p>
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'الموصل الفائق الحقيقي يطرد المجال المغناطيسي من داخله تماماً (B = 0) ليصبح دايامغناطيسياً مثالياً.' },
                    { id: 1, text: 'الموصل الفائق يسخن عند مرور التيار.' },
                    { id: 2, text: 'الموصل المثالي لا ينقل التيار المستمر.' },
                    { id: 3, text: 'لا يوجد أي فارق على الإطلاق.' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      disabled={quizSubmitted}
                      onClick={() => handleQuizSubmit(option.id)}
                      className={`w-full text-right p-3 rounded-xl border text-sm transition-all ${
                        quizSubmitted
                          ? option.id === 0
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
                  <div className={`p-3 rounded-xl text-xs ${quizAnswer === 0 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
                    {quizAnswer === 0 ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>إجابة صحيحة وممتازة! تأثير مايسنر (B = 0 داخل الموصل الفائق) هو السمة الكمية الفريدة التي تميز الموصل الفائق عن أي موصل تقليدي ذي مقاومة منعدمة.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. طرد المجال المغناطيسي (تأثير مايسنر B=0) هو الخاصية الجوهرية الإضافية للموصل الفائق.</span>
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
