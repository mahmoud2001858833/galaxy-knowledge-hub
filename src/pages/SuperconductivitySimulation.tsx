import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Magnet, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, BookOpen, Thermometer, Maximize2, Minimize2, 
  Volume2, VolumeX, Download, Lightbulb, Target, CheckSquare, Zap 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';
import { labSound } from '@/utils/labAudio';

interface SuperconductorMaterial {
  id: string;
  nameAr: string;
  nameEn: string;
  tcKelvin: number;
  typeAr: string;
  description: string;
  color: string;
}

const MATERIALS: SuperconductorMaterial[] = [
  { id: 'ybco', nameAr: 'مركب YBCO (YBa₂Cu₃O₇)', nameEn: 'YBCO', tcKelvin: 93.0, typeAr: 'فائق توصيل عالي الحرارة (HTS)', description: 'يعمل بالنيتروجين السائل (77 K)', color: '#38bdf8' },
  { id: 'bscco', nameAr: 'مركب BSCCO', nameEn: 'BSCCO', tcKelvin: 108.0, typeAr: 'فائق توصيل فائق القدرة', description: 'يستخدم في كابلات نقل الطاقة الخارقة', color: '#a855f7' },
  { id: 'nb3sn', nameAr: 'سبيكة النيوبيوم والقصدير (Nb₃Sn)', nameEn: 'Nb3Sn', tcKelvin: 18.3, typeAr: 'فائق توصيل تقليدي (LTS)', description: 'مغناطيسات مصادم الهادرونات الكبير LHC ومفاعلات ITER', color: '#fbbf24' },
  { id: 'mercury', nameAr: 'الزئبق (Hg) - أونيس 1911', nameEn: 'Mercury', tcKelvin: 4.2, typeAr: 'أول فائق توصيل مكتشف', description: 'اكتشفه كامرلنغ أونس في الهيليوم السائل', color: '#94a3b8' },
];

interface Superconductor3DProps {
  temperatureK: number;
  selectedMaterial: SuperconductorMaterial;
  isSuperconducting: boolean;
  isPlaying: boolean;
}

function Meissner3DScene({
  temperatureK,
  selectedMaterial,
  isSuperconducting,
  isPlaying,
}: Superconductor3DProps) {
  const magnetRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Group>(null);

  const levitationHeight = isSuperconducting ? 1.4 : 0.25;

  useFrame((state) => {
    if (!isPlaying) return;

    if (magnetRef.current) {
      magnetRef.current.position.y = THREE.MathUtils.lerp(
        magnetRef.current.position.y,
        levitationHeight,
        0.05
      );

      if (isSuperconducting) {
        magnetRef.current.rotation.y += 0.015;
        magnetRef.current.position.y += Math.sin(state.clock.elapsedTime * 4) * 0.003;
      }
    }
  });

  return (
    <group>
      {/* CRYOSTAT CONTAINER / DISH */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[3.2, 3.0, 0.8, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* LIQUID NITROGEN / HELIUM POOL */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[2.9, 2.9, 0.15, 32]} />
        <meshPhysicalMaterial
          color="#93c5fd"
          transmission={0.8}
          opacity={0.6}
          transparent
          roughness={0.1}
        />
      </mesh>

      {/* SUPERCONDUCTING CERAMIC PELLET */}
      <group ref={diskRef} position={[0, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[1.8, 1.8, 0.35, 32]} />
          <meshStandardMaterial
            color={selectedMaterial.color}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <Html position={[0, -0.4, 1.9]} center>
          <div className="bg-slate-900/90 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            قرص: {selectedMaterial.nameAr} (Tc = {selectedMaterial.tcKelvin} K)
          </div>
        </Html>
      </group>

      {/* LEVITATING NEODYMIUM MAGNET */}
      <group ref={magnetRef} position={[0, 0.25, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.2, 24]} />
          <meshStandardMaterial color="#ef4444" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.2, 24]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.9} roughness={0.1} />
        </mesh>
        <Html position={[0, 0.55, 0]} center>
          <div className="bg-slate-900/90 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            مغناطيس نيوديميوم (N/S)
          </div>
        </Html>
      </group>

      {/* MAGNETIC EXPULSION FIELD LINES */}
      {isSuperconducting && (
        <group position={[0, 0.6, 0]}>
          {[-1.5, -0.9, 0.9, 1.5].map((x, idx) => (
            <mesh key={`field-${idx}`} position={[x, 0.2, 0]} rotation={[0, 0, x > 0 ? -Math.PI / 4 : Math.PI / 4]}>
              <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
              <meshBasicMaterial color="#38bdf8" opacity={0.6} transparent />
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
  const [temperatureK, setTemperatureK] = useState<number>(77.0);
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

  const isSuperconducting = temperatureK < selectedMaterial.tcKelvin;

  const electricalResistanceOhms = useMemo(() => {
    if (isSuperconducting) return 0.0;
    const diff = temperatureK - selectedMaterial.tcKelvin;
    return +(0.05 + diff * 0.008).toFixed(4);
  }, [temperatureK, isSuperconducting, selectedMaterial]);

  // Mission check
  useEffect(() => {
    // Mission 1: Cool YBCO below 93K with liquid nitrogen
    if (selectedMaterial.id === 'ybco' && isSuperconducting && !mission1Completed) {
      setMission1Completed(true);
      labSound.playSuccessChime();
    }
    // Mission 2: Observe resistance drop to exact 0.0000 Ω
    if (electricalResistanceOhms === 0 && !mission2Completed) {
      setMission2Completed(true);
      labSound.playSuccessChime();
    }
    // Mission 3: Test low temperature superconductor (Mercury or Nb3Sn) below 18K
    if ((selectedMaterial.id === 'nb3sn' || selectedMaterial.id === 'mercury') && isSuperconducting && !mission3Completed) {
      setMission3Completed(true);
      labSound.playSuccessChime();
    }
  }, [selectedMaterial, isSuperconducting, electricalResistanceOhms, mission1Completed, mission2Completed, mission3Completed]);

  const resistanceCurveData = useMemo(() => {
    const data = [];
    for (let t = 2; t <= 150; t += 4) {
      const isSC = t < selectedMaterial.tcKelvin;
      const res = isSC ? 0 : 0.05 + (t - selectedMaterial.tcKelvin) * 0.008;
      data.push({
        temperature: t,
        resistance: +res.toFixed(4),
      });
    }
    return data;
  }, [selectedMaterial]);

  const setCameraView = (view: 'default' | 'top' | 'levitation' | 'side') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'default') {
      controls.object.position.set(0, 3.5, 7.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      controls.object.position.set(0, 8.5, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'levitation') {
      controls.object.position.set(0, 0.8, 3.2);
      controls.target.set(0, 0.6, 0);
    } else if (view === 'side') {
      controls.object.position.set(7.5, 0, 0);
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
    const headers = 'Material,CriticalTemp(K),CurrentTemp(K),Resistance(Ohms),IsSuperconducting,MagneticState\n';
    const row = `${selectedMaterial.nameEn},${selectedMaterial.tcKelvin},${temperatureK},${electricalResistanceOhms},${isSuperconducting},${isSuperconducting ? 'Meissner Levitation' : 'Normal State'}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `superconductivity_${selectedMaterial.id}.csv`;
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
              <div className="p-3 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 rounded-2xl shadow-lg shadow-cyan-500/20">
                <Magnet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 bg-clip-text text-transparent">
                  الموصلية الفائقة وتأثير مايسنر ثلاثي الأبعاد (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  انعدام المقاومة الكهربائية، طرد خطوط المجال المغناطيسي، وظاهرة الطفو المغناطيسي الكمي
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

        {/* Live Cryo Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">درجة الحرارة (T)</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">{temperatureK.toFixed(1)} K</p>
              <span className="text-[10px] text-slate-500">{(temperatureK - 273.15).toFixed(1)} °C</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الحرارة الحرجة (Tc)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{selectedMaterial.tcKelvin} K</p>
              <span className="text-[10px] text-slate-500">عتبة الموصلية الفائقة</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">المقاومة النوعية (R)</span>
              <p className={`text-lg font-bold font-mono ${isSuperconducting ? 'text-emerald-400' : 'text-slate-300'}`}>
                {electricalResistanceOhms.toFixed(4)} Ω
              </p>
              <span className="text-[10px] text-slate-500">{isSuperconducting ? 'صفر مطلق (0.0000)' : 'مقاومة عادية'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">تأثير مايسنر (Meissner)</span>
              <p className={`text-sm font-bold mt-1 ${isSuperconducting ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isSuperconducting ? '✓ طرد كامل للمجال B=0' : 'نفاذ المجال المغناطيسي'}
              </p>
              <span className="text-[10px] text-slate-500">{isSuperconducting ? 'طفو مغناطيسي نشط' : 'استقرار على السطح'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الحالة الكمية للمادة</span>
              <p className={`text-xs font-bold mt-1 ${isSuperconducting ? 'text-cyan-400' : 'text-slate-400'}`}>
                {isSuperconducting ? 'أزواج كوبر (Cooper Pairs)' : 'إلكترونات حرة عادية'}
              </p>
              <span className="text-[10px] text-slate-500">{selectedMaterial.nameAr.split(' ')[0]}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">سائل التبريد المستعمل</span>
              <p className="text-xs font-bold text-sky-400 mt-1">
                {selectedMaterial.tcKelvin > 77 ? 'نيتروجين سائل (77 K)' : 'هيليوم سائل (4.2 K)'}
              </p>
              <span className="text-[10px] text-slate-500">حمام التبريد الفائق</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
              <Activity className="w-4 h-4" />
              الطفو المغناطيسي ثلاثي الأبعاد (3D Levitation)
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Target className="w-4 h-4" />
              مهام وتحديات مايسنر ({[mission1Completed, mission2Completed, mission3Completed].filter(Boolean).length}/3)
            </TabsTrigger>
            <TabsTrigger value="curve" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Zap className="w-4 h-4" />
              منحنى هبوط المقاومة لصفر
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              نظرية BCS وأزواج كوبر
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
                      وعاء التبريد والطفو المغناطيسي ثلاثي الأبعاد (3D Meissner Effect)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${isSuperconducting ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-400'}`}>
                        {isSuperconducting ? '✓ حالة موصلية فائقة (R = 0)' : 'حالة توصيل عادية'}
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
                    <Canvas camera={{ position: [0, 3.5, 7.5], fov: 45 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 10, 10]} intensity={1.2} />
                      <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#38bdf8" />
                      <Meissner3DScene
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
                        onClick={() => setCameraView('levitation')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        الطفو
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
                      <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>
                        {isSuperconducting
                          ? `💡 تأثير مايسنر نشط (T = ${temperatureK}K < Tc = ${selectedMaterial.tcKelvin}K): تم طرد جميع خطوط المجال المغناطيسي بالكامل (B=0)، ويطفو المغناطيس في الهواء بلا أي احتكاك.`
                          : `💡 المادة في الحالة العادية (T = ${temperatureK}K > Tc = ${selectedMaterial.tcKelvin}K): خفض درجة الحرارة بواسطة المنزلق لتفعيل ظاهرة التوصيل الفائق.`}
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
                      التحكم بدرجة الحرارة ومادة الفائق
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Material Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر مادة فائق التوصيل</label>
                      <div className="space-y-1.5">
                        {MATERIALS.map((mat) => (
                          <button
                            key={mat.id}
                            onClick={() => {
                              setSelectedMaterial(mat);
                              labSound.playLaserPulse(450);
                            }}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedMaterial.id === mat.id
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{mat.nameAr}</div>
                            <div className="text-[10px] opacity-75 font-mono">الحرارة الحرجة Tc = {mat.tcKelvin} K</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Temperature Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">درجة حرارة العينة (Temperature)</label>
                        <span className={`text-xs font-mono font-bold ${isSuperconducting ? 'text-cyan-400' : 'text-orange-400'}`}>
                          {temperatureK.toFixed(1)} K ({(temperatureK - 273.15).toFixed(1)} °C)
                        </span>
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

                    {/* Quick Cool Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        onClick={() => {
                          setTemperatureK(77);
                          labSound.playSuccessChime();
                        }}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                      >
                        نيتروجين سائل (77 K)
                      </Button>
                      <Button
                        onClick={() => {
                          setTemperatureK(4.2);
                          labSound.playSuccessChime();
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                      >
                        هيليوم سائل (4.2 K)
                      </Button>
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
                  مهام وتحديات الموصلية الفائقة (Superconductivity Missions)
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  أكمل هذه المهام لاكتشاف أسرار الطفو الكمي وانعدام المقاومة الكهربائية.
                </p>
              </div>

              <div className="space-y-4">
                {/* Mission 1 */}
                <div className={`p-4 rounded-xl border transition-all ${mission1Completed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckSquare className={`w-4 h-4 ${mission1Completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        المهمة 1: تبريد مركب YBCO بالنيتروجين السائل (77 K) وتفعيل الطفو
                      </div>
                      <p className="text-xs text-slate-400">
                        اختر مركب YBCO (حرارته الحرجة 93K) واضبط الحرارة عند 77K لمشاهدة طفو المغناطيس الدائم في الهواء.
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
                        المهمة 2: رصد هبوط المقاومة الكهربائية إلى الصفر المطلق (0.0000 Ω)
                      </div>
                      <p className="text-xs text-slate-400">
                        راقب مؤشر المقاومة الكهربائية عند النزول تحت الحرارة الحرجة Tc لتأكيد انتقال التيار بدون أي فقد طاقي.
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
                        المهمة 3: اختبار فائقات التوصيل التقليدية بالهيليوم السائل (4.2 K)
                      </div>
                      <p className="text-xs text-slate-400">
                        اختر عينة الزئبق أو النيوبيوم-قصدير وقم بتبريدها بالهيليوم السائل لدراسة فائقات التوصيل الكلاسيكية.
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

          {/* TAB 3: Curve */}
          <TabsContent value="curve" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 shadow-xl">
              <CardTitle className="text-base font-bold text-sky-300 mb-2">منحنى المقاومة الكهربائية مقابل درجة الحرارة (R vs T)</CardTitle>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resistanceCurveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="temperature" stroke="#94a3b8" label={{ value: 'درجة الحرارة (K)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" label={{ value: 'المقاومة (Ω)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                    <ReferenceLine x={selectedMaterial.tcKelvin} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Tc = ${selectedMaterial.tcKelvin} K`, fill: '#f59e0b', fontSize: 11 }} />
                    <Line type="monotone" dataKey="resistance" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="المقاومة" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-cyan-300">الفيزياء الكمية للموصلية الفائقة وتأثير مايسنر</h3>
              <p>
                تحدث الموصلية الفائقة عندما تترابط الإلكترونات في أزواج تسمى <strong>أزواج كوبر (Cooper Pairs)</strong> عبر التفاعل مع اهتزازات الشبكة البلورية (الفونونات)، فتسري في المادة كحالة كمية واحدة دون أي تصادم أو مقاومة أومية.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. تأثير مايسنر-أوكسنفيلد (1933)</h4>
                  <p className="text-xs text-slate-400">
                    طرد فائق التوصيل لجميع خطوط المجال المغناطيسي من داخله (B = 0) عبر توليد تيارات سطحية مستمرة تعاكس المجال الخارجي وتسبب الطفو.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. نظرية BCS (جائزة نوبل 1972)</h4>
                  <p className="text-xs text-slate-400">
                    باردين، كوبر، وشريفر فسروا الآلية المجهرية لتشكل الفجوة الطاقية الكمية التي تحمي أزواج كوبر من التبعثر.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 5: Quiz */}
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
                  سؤال: ما الذي يميز فائق التوصيل الحقيقي عن موصل مثالي ذي مقاومة صفرية فقط؟
                </p>
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'أنه يوصل الحرارة بسرعة الضوء.' },
                    { id: 1, text: 'طرد خطوط المجال المغناطيسي النشط من داخله (تأثير مايسنر B = 0) بغض النظر عن ترتيب تطبيق المجال والتبريد.' },
                    { id: 2, text: 'أنه يفقد كتلته عند التبريد.' },
                    { id: 3, text: 'أنه يعمل فقط في الفضاء الخارجي.' },
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
                        <span>إجابة صحيحة ورائعة! تأثير مايسنر (طرد المجال المغناطيسي التلقائي) هو السمة الجوهرية المميزة لفائق التوصيل الحقيقي عن أي موصل كلاسيكي مثالي.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. تأثير مايسنر وطرد خطوط الفيض المغناطيسي هو الخاصية المميزة للموصلية الفائقة.</span>
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
