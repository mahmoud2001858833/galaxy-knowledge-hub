import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Layers, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, BookOpen, Zap, Maximize2, Minimize2, 
  Volume2, VolumeX, Download, Lightbulb, Target, CheckSquare 
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

interface CrystalSample {
  id: string;
  nameAr: string;
  nameEn: string;
  dSpacingAngstrom: number;
  crystalSystemAr: string;
  color: string;
}

const CRYSTALS: CrystalSample[] = [
  { id: 'nacl', nameAr: 'ملح الطعام (NaCl)', nameEn: 'Sodium Chloride', dSpacingAngstrom: 2.82, crystalSystemAr: 'مكعب مركزي الوجه (FCC)', color: '#38bdf8' },
  { id: 'silicon', nameAr: 'السيليكون (Si)', nameEn: 'Silicon (111)', dSpacingAngstrom: 3.13, crystalSystemAr: 'بنية الألماس المكعبة', color: '#cbd5e1' },
  { id: 'aluminum', nameAr: 'الألمنيوم (Al)', nameEn: 'Aluminum (200)', dSpacingAngstrom: 2.02, crystalSystemAr: 'مكعب مركزي الأوجه', color: '#94a3b8' },
  { id: 'gold', nameAr: 'الذهب (Au)', nameEn: 'Gold (111)', dSpacingAngstrom: 2.35, crystalSystemAr: 'مكعب مركزي الأوجه', color: '#fbbf24' },
];

const XRAY_WAVELENGTH_ANGSTROM = 1.5406;

interface XRD3DProps {
  thetaDeg: number;
  selectedCrystal: CrystalSample;
  isConstructive: boolean;
  isPlaying: boolean;
}

function Goniometer3DScene({
  thetaDeg,
  selectedCrystal,
  isConstructive,
  isPlaying,
}: XRD3DProps) {
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const detectorAngleRad = ((2 * thetaDeg) * Math.PI) / 180;

  const latticePoints = useMemo(() => {
    const points: Array<[number, number, number, boolean]> = [];
    for (let x = -2; x <= 2; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -2; z <= 2; z++) {
          const isIonA = (x + y + z) % 2 === 0;
          points.push([x * 0.45, y * 0.45, z * 0.45, isIonA]);
        }
      }
    }
    return points;
  }, []);

  return (
    <group>
      {/* BASE GONIOMETER PLATTER */}
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[3.8, 4.0, 0.4, 48]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* ROTATING CRYSTAL SAMPLE */}
      <group rotation={[0, -thetaRad, 0]}>
        {latticePoints.map((pt, idx) => (
          <mesh key={`atom-${idx}`} position={[pt[0], pt[1], pt[2]]}>
            <sphereGeometry args={[pt[3] ? 0.09 : 0.06, 12, 12]} />
            <meshStandardMaterial
              color={pt[3] ? selectedCrystal.color : '#f1f5f9'}
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
        ))}
        <mesh position={[0, -0.9, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 1.0, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} />
        </mesh>
      </group>

      {/* X-RAY TUBE */}
      <group position={[-3.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.45, 1.5, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
        </mesh>
        <Html position={[0, 1.8, 0]} center>
          <div className="bg-slate-900/90 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            أنبوب الأشعة السينية (Cu Kα)
          </div>
        </Html>
      </group>

      {/* INCIDENT BEAM */}
      <mesh position={[-1.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 3.5, 8]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* ROTATING DETECTOR ARM */}
      <group rotation={[0, detectorAngleRad, 0]}>
        <mesh position={[2.2, -1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 3.2, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh position={[3.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.5, 1.4, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>

        <mesh position={[1.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 3.6, 8]} />
          <meshBasicMaterial
            color={isConstructive ? '#22c55e' : '#64748b'}
            opacity={isConstructive ? 0.9 : 0.25}
            transparent
          />
        </mesh>

        {isConstructive && (
          <pointLight position={[3.6, 0, 0]} color="#22c55e" intensity={4} distance={4} />
        )}

        <Html position={[3.6, 1.0, 0]} center>
          <div className="bg-slate-900/90 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            كاشف الحيود (2θ = {(2 * thetaDeg).toFixed(1)}°)
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function XRayDiffractionSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [selectedCrystal, setSelectedCrystal] = useState<CrystalSample>(CRYSTALS[0]);
  const [thetaDeg, setThetaDeg] = useState<number>(15.8);
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

  const theoreticalPeakTheta = useMemo(() => {
    const sinTheta = XRAY_WAVELENGTH_ANGSTROM / (2 * selectedCrystal.dSpacingAngstrom);
    const rad = Math.asin(sinTheta);
    return +(rad * (180 / Math.PI)).toFixed(1);
  }, [selectedCrystal]);

  const isConstructive = Math.abs(thetaDeg - theoreticalPeakTheta) < 0.6;

  const relativeIntensity = useMemo(() => {
    const diff = thetaDeg - theoreticalPeakTheta;
    const peak = 100 / (1 + Math.pow(diff / 0.5, 2));
    return +peak.toFixed(1);
  }, [thetaDeg, theoreticalPeakTheta]);

  // Mission check
  useEffect(() => {
    // Mission 1: Find Bragg peak of NaCl (approx 15.8°)
    if (selectedCrystal.id === 'nacl' && isConstructive && !mission1Completed) {
      setMission1Completed(true);
      labSound.playSuccessChime();
    }
    // Mission 2: Find Silicon (111) peak
    if (selectedCrystal.id === 'silicon' && isConstructive && !mission2Completed) {
      setMission2Completed(true);
      labSound.playSuccessChime();
    }
    // Mission 3: Test Aluminum or Gold
    if ((selectedCrystal.id === 'aluminum' || selectedCrystal.id === 'gold') && isConstructive && !mission3Completed) {
      setMission3Completed(true);
      labSound.playSuccessChime();
    }
  }, [selectedCrystal, isConstructive, mission1Completed, mission2Completed, mission3Completed]);

  const xrdData = useMemo(() => {
    const data = [];
    for (let t = 8; t <= 45; t += 0.5) {
      const diff1 = t - theoreticalPeakTheta;
      const peak1 = 100 / (1 + Math.pow(diff1 / 0.4, 2));
      const sinTheta2 = (2 * XRAY_WAVELENGTH_ANGSTROM) / (2 * selectedCrystal.dSpacingAngstrom);
      let peak2 = 0;
      if (sinTheta2 <= 1) {
        const theta2 = Math.asin(sinTheta2) * (180 / Math.PI);
        const diff2 = t - theta2;
        peak2 = 45 / (1 + Math.pow(diff2 / 0.4, 2));
      }

      data.push({
        twoTheta: +(2 * t).toFixed(1),
        theta: t,
        intensity: +(peak1 + peak2 + (Math.random() * 2)).toFixed(1),
      });
    }
    return data;
  }, [theoreticalPeakTheta, selectedCrystal]);

  const setCameraView = (view: 'default' | 'top' | 'crystal' | 'detector') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'default') {
      controls.object.position.set(0, 5.5, 8.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      controls.object.position.set(0, 9.5, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'crystal') {
      controls.object.position.set(0, 1.2, 3.2);
      controls.target.set(0, 0, 0);
    } else if (view === 'detector') {
      controls.object.position.set(5.5, 2.0, 3.5);
      controls.target.set(3.6, 0, 0);
    }
    controls.update();
    labSound.playLaserPulse(650);
  };

  const toggleSound = () => {
    const muted = labSound.toggleMute();
    setIsMuted(muted);
  };

  const handleExportDataCSV = () => {
    const headers = 'Crystal,dSpacing(Angstrom),Theta(deg),TwoTheta(deg),RelativeIntensity(%),IsBraggPeak\n';
    const row = `${selectedCrystal.nameEn},${selectedCrystal.dSpacingAngstrom},${thetaDeg.toFixed(1)},${(2 * thetaDeg).toFixed(1)},${relativeIntensity},${isConstructive}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xrd_diffraction_${selectedCrystal.id}.csv`;
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
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 bg-clip-text text-transparent">
                  حيود الأشعة السينية وقانون براغ ثلاثية الأبعاد (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  تداخل الأشعة السينية على المستويات الذرية وقياس أبعاد الشبكة البلورية بدقة الأنغستروم
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
              <span className="text-xs text-slate-400">زاوية الحيود (θ)</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">{thetaDeg.toFixed(1)}°</p>
              <span className="text-[10px] text-slate-500">زاوية السقوط</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">زاوية الكاشف (2θ)</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{(2 * thetaDeg).toFixed(1)}°</p>
              <span className="text-[10px] text-slate-500">ذراع مقياس الزوايا</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">المسافة البينية (d)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{selectedCrystal.dSpacingAngstrom} Å</p>
              <span className="text-[10px] text-slate-500">{selectedCrystal.nameAr.split(' ')[0]}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">شدة إشارة الحيود</span>
              <p className={`text-lg font-bold font-mono ${isConstructive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}>
                {relativeIntensity}%
              </p>
              <span className="text-[10px] text-slate-500">{isConstructive ? 'قمة تداخل بناء' : 'تداخل هدام'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">زاوية القمة النظرية</span>
              <p className="text-lg font-bold text-purple-400 font-mono">{theoreticalPeakTheta}°</p>
              <span className="text-[10px] text-slate-500">2θ = {(2 * theoreticalPeakTheta).toFixed(1)}°</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الطول الموجي للأشعة</span>
              <p className="text-lg font-bold text-slate-200 font-mono">1.5406 Å</p>
              <span className="text-[10px] text-slate-500">نحاس Cu Kα</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">
              <Activity className="w-4 h-4" />
              مقياس الزوايا البلوري ثلاثي الأبعاد (3D Goniometer)
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Target className="w-4 h-4" />
              مهام وتحديات براغ ({[mission1Completed, mission2Completed, mission3Completed].filter(Boolean).length}/3)
            </TabsTrigger>
            <TabsTrigger value="diffractogram" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Layers className="w-4 h-4" />
              مخطط الحيود (XRD Diffractogram)
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              قانون براغ والشبكات البلورية
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
                      <Layers className="w-4 h-4 text-cyan-400" />
                      جهاز حيود الأشعة السينية ثلاثي الأبعاد (3D XRD)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${isConstructive ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-400'}`}>
                        {isConstructive ? '✓ تداخل بناء (nλ = 2d sinθ)' : 'تداخل هدام'}
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
                    <Canvas camera={{ position: [0, 5.5, 8.5], fov: 45 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 10, 10]} intensity={1.2} />
                      <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#38bdf8" />
                      <Goniometer3DScene
                        thetaDeg={thetaDeg}
                        selectedCrystal={selectedCrystal}
                        isConstructive={isConstructive}
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
                        onClick={() => setCameraView('crystal')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        البلورة
                      </button>
                      <button
                        onClick={() => setCameraView('detector')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        الكاشف
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
                        {isConstructive
                          ? `💡 تحقق شرط براغ (2d sinθ = λ): عند الزاوية θ = ${thetaDeg.toFixed(1)}° تتطابق قمم الموجات المنعكسة فيحدث تداخل بناء وشدة عظمى.`
                          : `💡 الزاوية الحالية (${thetaDeg.toFixed(1)}°) لا تحقق شرط التداخل البناء. حرك المنزلق أو اضغط على زر "الانتقال لقمة الحيود".`}
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
                      <Zap className="w-4 h-4 text-cyan-400" />
                      التحكم بزاوية السقوط والبلورة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Crystal Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر العينة البلورية</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {CRYSTALS.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCrystal(c);
                              labSound.playLaserPulse(500);
                            }}
                            className={`p-2 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedCrystal.id === c.id
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{c.nameAr}</div>
                            <div className="text-[10px] opacity-75 font-mono">d = {c.dSpacingAngstrom} Å</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Theta Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">زاوية السقوط (θ)</label>
                        <span className="text-xs font-mono text-cyan-400 font-bold">{thetaDeg.toFixed(1)}° (2θ = {(2 * thetaDeg).toFixed(1)}°)</span>
                      </div>
                      <Slider
                        value={[thetaDeg]}
                        min={5}
                        max={45}
                        step={0.1}
                        onValueChange={(val) => {
                          setThetaDeg(val[0]);
                          if (Math.abs(val[0] - theoreticalPeakTheta) < 0.6) {
                            labSound.playGeigerClick();
                          }
                        }}
                        className="py-1"
                      />
                    </div>

                    {/* Snap to Peak */}
                    <div className="pt-2">
                      <Button
                        onClick={() => {
                          setThetaDeg(theoreticalPeakTheta);
                          labSound.playSuccessChime();
                        }}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                      >
                        الانتقال التلقائي لقمة الحيود ({theoreticalPeakTheta}°)
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
                  مهام وتحديات حيود براغ المعملية (Bragg XRD Missions)
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  أكمل هذه المهام لتحديد أبعاد الشبكات البلورية المختلفة باستخدام الأشعة السينية.
                </p>
              </div>

              <div className="space-y-4">
                {/* Mission 1 */}
                <div className={`p-4 rounded-xl border transition-all ${mission1Completed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckSquare className={`w-4 h-4 ${mission1Completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        المهمة 1: رصد قمة حيود ملح الطعام NaCl عند زاوية 15.8°
                      </div>
                      <p className="text-xs text-slate-400">
                        حرك ذراع مقياس الزوايا حتى تصل زاوية السقوط إلى 15.8° (2θ = 31.6°) لملاحظة حدوث التداخل البناء وإضاءة الكاشف بالأخضر.
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
                        المهمة 2: قياس أبعاد بلورة السيليكون Si (111)
                      </div>
                      <p className="text-xs text-slate-400">
                        اختر عينة السيليكون (d = 3.13 Å) واضبط الزاوية عند 14.2° لرصد قمة الحيود الرئيسية.
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
                        المهمة 3: فحص عينة معدنية (الألمنيوم أو الذهب)
                      </div>
                      <p className="text-xs text-slate-400">
                        اختر عينة الألمنيوم أو الذهب وحقق شرط براغ لرصد انعكاس المستويات الذرية المعدنية.
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

          {/* TAB 3: Diffractogram */}
          <TabsContent value="diffractogram" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 shadow-xl">
              <CardTitle className="text-base font-bold text-sky-300 mb-2">مخطط شدة الحيود مع زاوية الكاشف (XRD Diffractogram)</CardTitle>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={xrdData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="twoTheta" stroke="#94a3b8" label={{ value: '2θ (درجات)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" label={{ value: 'الشدة النسبية (a.u.)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                    <ReferenceLine x={+(2 * theoreticalPeakTheta).toFixed(1)} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'قمة الحيود n=1', fill: '#22c55e', fontSize: 10 }} />
                    <Line type="monotone" dataKey="intensity" stroke="#38bdf8" strokeWidth={2} dot={false} name="الشدة" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-cyan-300">قانون براغ وحيود الأشعة السينية (جائزة نوبل 1915)</h3>
              <p>
                استنتج ويليام هنري براغ وابنه ويليام لورنس براغ القانون الأساسي لحيود الأشعة السينية على البلورات، والذي مكّن العلماء من معرفة التركيب الذري ثلاثي الأبعاد للمواد والمركبات الحيوية بما فيها الـ DNA.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. معادلة براغ للحيود</h4>
                  <p className="text-sm font-mono text-cyan-300">n · λ = 2 · d · sin(θ)</p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. شرط تطبيق القانون</h4>
                  <p className="text-xs text-slate-400">
                    يجب أن يكون الطول الموجي للأشعة السينية مقارباً للمسافة بين الذرات (λ ≈ d ≈ 1 Å = 0.1 nm).
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
                  اختبار مفاهيم حيود براغ
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: لماذا تستخدم الأشعة السينية تحديداً (وليس الضوء المرئي) لدراسة التركيب الذري والشبكة البلورية للمعادن؟
                </p>
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'لأن الأشعة السينية لا تتأثر بالحرارة.' },
                    { id: 1, text: 'لأن طولها الموجي (حوالي 1 أنغستروم) يماثل تقريباً المسافات البينية الفاصلة بين الذرات في البلورة.' },
                    { id: 2, text: 'لأن الأشعة السينية غير مرئية للعين.' },
                    { id: 3, text: 'لأن سرعة الأشعة السينية تفوق سرعة الضوء.' },
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
                        <span>إجابة صحيحة ورائعة! لكي يحدث حيود قابل للقياس يجب أن يكون الطول الموجي مقاربًا لأبعاد الفجوات والمستويات البلورية (في حدود 0.1 نانومتر أو 1 أنغستروم).</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. شرط حدوث الحيود هو توافق الطول الموجي للموجة مع أبعاد المسافات الذرية في البلورة.</span>
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
