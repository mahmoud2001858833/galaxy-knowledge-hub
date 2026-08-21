import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Droplets, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, Sparkles, BookOpen, Layers, Zap, Eye, Maximize2, Minimize2, 
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

// Physical Constants
const E_TRUE = 1.602176634e-19; // Elementary charge in Coulombs
const G_CONST = 9.80665; // m/s²
const OIL_DENSITY = 886; // kg/m³
const AIR_DENSITY = 1.204; // kg/m³
const AIR_VISCOSITY = 1.81e-5; // Pa·s (η)
const PLATE_DISTANCE_M = 0.016; // 16 mm between plates

interface Droplet3D {
  id: number;
  radiusM: number;
  radiusUm: number;
  massKg: number;
  numCharges: number;
  chargeC: number;
  x: number;
  y: number;
  z: number;
  vy: number;
  color: string;
}

interface Millikan3DProps {
  voltage: number;
  isPlaying: boolean;
  isXRayOn: boolean;
  droplets: Droplet3D[];
  selectedDropletId: number;
  onSelectDroplet: (id: number) => void;
}

function MillikanChamber3D({
  voltage,
  isPlaying,
  isXRayOn,
  droplets,
  selectedDropletId,
  onSelectDroplet,
}: Millikan3DProps) {
  const dropletsRef = useRef<THREE.Group>(null);
  const electricField = voltage / PLATE_DISTANCE_M;

  useFrame(() => {
    if (!isPlaying) return;

    droplets.forEach((d) => {
      const effectiveDensity = OIL_DENSITY - AIR_DENSITY;
      const volume = (4 / 3) * Math.PI * Math.pow(d.radiusM, 3);
      const fg = volume * effectiveDensity * G_CONST;
      const fe = d.chargeC * electricField;
      const stokesFactor = 6 * Math.PI * AIR_VISCOSITY * d.radiusM;

      const netForce = fe - fg - (d.vy * stokesFactor);
      const accel = netForce / d.massKg;

      d.vy += accel * 0.0005;
      d.y += d.vy * 0.04;

      if (d.y > 1.65) {
        d.y = 1.65;
        d.vy = 0;
      } else if (d.y < -1.65) {
        d.y = -1.65;
        d.vy = 0;
      }
    });

    if (dropletsRef.current) {
      droplets.forEach((d, i) => {
        const mesh = dropletsRef.current?.children[i] as THREE.Mesh;
        if (mesh) {
          mesh.position.set(d.x, d.y, d.z);
        }
      });
    }
  });

  return (
    <group>
      {/* 3D Glass Cylindrical Chamber */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 4.4, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#93c5fd"
          transmission={0.9}
          opacity={0.3}
          transparent
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* TOP CAPACITOR PLATE (+) */}
      <group position={[0, 1.85, 0]}>
        <mesh>
          <cylinderGeometry args={[3.0, 3.0, 0.25, 32]} />
          <meshStandardMaterial color={voltage > 0 ? '#ef4444' : '#475569'} metalness={0.9} roughness={0.2} />
        </mesh>
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-slate-900/90 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            لوح علوي (+ موجب)
          </div>
        </Html>
      </group>

      {/* BOTTOM CAPACITOR PLATE (-) */}
      <group position={[0, -1.85, 0]}>
        <mesh>
          <cylinderGeometry args={[3.0, 3.0, 0.25, 32]} />
          <meshStandardMaterial color={voltage > 0 ? '#3b82f6' : '#475569'} metalness={0.9} roughness={0.2} />
        </mesh>
        <Html position={[0, -0.5, 0]} center>
          <div className="bg-slate-900/90 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            لوح سفلي (- سالب)
          </div>
        </Html>
      </group>

      {/* X-RAY TUBE */}
      <group position={[3.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.4, 0.55, 1.4, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
        </mesh>
        {isXRayOn && (
          <pointLight color="#a855f7" intensity={5} distance={6} decay={1.5} />
        )}
      </group>

      {/* X-Ray Ionizing Beam */}
      {isXRayOn && (
        <mesh position={[1.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[1.5, 3.2, 24, 1, true]} />
          <meshBasicMaterial color="#c084fc" opacity={0.35} transparent side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 3D OIL DROPLETS */}
      <group ref={dropletsRef}>
        {droplets.map((d) => {
          const isSelected = d.id === selectedDropletId;
          return (
            <mesh
              key={`drop-${d.id}`}
              position={[d.x, d.y, d.z]}
              onClick={() => onSelectDroplet(d.id)}
            >
              <sphereGeometry args={[isSelected ? 0.18 : 0.12, 16, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#38bdf8' : d.color}
                emissive={isSelected ? '#0284c7' : '#000000'}
                emissiveIntensity={isSelected ? 0.6 : 0}
                roughness={0.1}
                metalness={0.3}
              />
              {isSelected && (
                <Html position={[0, 0.4, 0]} center>
                  <div className="bg-sky-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none">
                    القطرة {d.id} ({d.numCharges}e)
                  </div>
                </Html>
              )}
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export default function MillikanOilDropSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [voltage, setVoltage] = useState<number>(380);
  const [isXRayOn, setIsXRayOn] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [selectedDropletId, setSelectedDropletId] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [calculationLog, setCalculationLog] = useState<Array<{ id: number; radiusUm: number; vBalance: number; qExp: number; nEstimated: number; eCalculated: number }>>([]);

  // Missions
  const [mission1Completed, setMission1Completed] = useState<boolean>(false);
  const [mission2Completed, setMission2Completed] = useState<boolean>(false);
  const [mission3Completed, setMission3Completed] = useState<boolean>(false);

  // Quiz states
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const [droplets, setDroplets] = useState<Droplet3D[]>(() => {
    return [
      { id: 1, radiusUm: 1.25, radiusM: 1.25e-6, massKg: (4 / 3) * Math.PI * Math.pow(1.25e-6, 3) * OIL_DENSITY, numCharges: 3, chargeC: 3 * E_TRUE, x: 0, y: 0.2, z: 0, vy: 0, color: '#fbbf24' },
      { id: 2, radiusUm: 1.05, radiusM: 1.05e-6, massKg: (4 / 3) * Math.PI * Math.pow(1.05e-6, 3) * OIL_DENSITY, numCharges: 2, chargeC: 2 * E_TRUE, x: -0.9, y: 0.6, z: 0.4, vy: 0, color: '#f59e0b' },
      { id: 3, radiusUm: 1.45, radiusM: 1.45e-6, massKg: (4 / 3) * Math.PI * Math.pow(1.45e-6, 3) * OIL_DENSITY, numCharges: 5, chargeC: 5 * E_TRUE, x: 0.8, y: -0.4, z: -0.3, vy: 0, color: '#f97316' },
      { id: 4, radiusUm: 0.95, radiusM: 0.95e-6, massKg: (4 / 3) * Math.PI * Math.pow(0.95e-6, 3) * OIL_DENSITY, numCharges: 1, chargeC: 1 * E_TRUE, x: 0.3, y: -0.8, z: 0.6, vy: 0, color: '#fbbf24' },
      { id: 5, radiusUm: 1.35, radiusM: 1.35e-6, massKg: (4 / 3) * Math.PI * Math.pow(1.35e-6, 3) * OIL_DENSITY, numCharges: 4, chargeC: 4 * E_TRUE, x: -0.6, y: -0.1, z: -0.5, vy: 0, color: '#f59e0b' },
    ];
  });

  const selectedDroplet = useMemo(() => {
    return droplets.find((d) => d.id === selectedDropletId) || droplets[0];
  }, [droplets, selectedDropletId]);

  const balanceVoltage = useMemo(() => {
    const effectiveDensity = OIL_DENSITY - AIR_DENSITY;
    const vol = (4 / 3) * Math.PI * Math.pow(selectedDroplet.radiusM, 3);
    const weight = vol * effectiveDensity * G_CONST;
    const vBal = (weight * PLATE_DISTANCE_M) / selectedDroplet.chargeC;
    return Math.round(vBal);
  }, [selectedDroplet]);

  const isBalanced = Math.abs(voltage - balanceVoltage) < 4;

  useEffect(() => {
    // Mission 1: Balance any droplet
    if (isBalanced && !mission1Completed) {
      setMission1Completed(true);
      labSound.playSuccessChime();
    }
    // Mission 3: Record 3 balanced droplet readings
    if (calculationLog.length >= 3 && !mission3Completed) {
      setMission3Completed(true);
      labSound.playSuccessChime();
    }
  }, [isBalanced, calculationLog, mission1Completed, mission3Completed]);

  const handleXRayPulse = () => {
    setIsXRayOn(true);
    labSound.playElectricZap();
    if (!mission2Completed) {
      setMission2Completed(true);
    }
    setTimeout(() => setIsXRayOn(false), 1200);

    setDroplets((prev) =>
      prev.map((d) => {
        const deltaN = Math.floor(Math.random() * 3) - 1;
        const newN = Math.max(1, Math.min(8, d.numCharges + deltaN));
        return {
          ...d,
          numCharges: newN,
          chargeC: newN * E_TRUE,
        };
      })
    );
  };

  const handleRecordMeasurement = () => {
    const qExp = (selectedDroplet.massKg * G_CONST * PLATE_DISTANCE_M) / voltage;
    const nEst = Math.max(1, Math.round(qExp / E_TRUE));
    const eCalc = qExp / nEst;

    setCalculationLog((prev) => [
      ...prev,
      {
        id: selectedDroplet.id,
        radiusUm: selectedDroplet.radiusUm,
        vBalance: voltage,
        qExp: qExp,
        nEstimated: nEst,
        eCalculated: eCalc,
      },
    ]);

    labSound.playSuccessChime();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const setCameraView = (view: 'default' | 'top' | 'microscope') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'default') {
      controls.object.position.set(0, 0, 7.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      controls.object.position.set(0, 8.5, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'microscope') {
      controls.object.position.set(0, 0, 4.2);
      controls.target.set(0, 0, 0);
    }
    controls.update();
    labSound.playGeigerClick();
  };

  const toggleSound = () => {
    const muted = labSound.toggleMute();
    setIsMuted(muted);
  };

  const handleExportDataCSV = () => {
    const headers = 'DropletID,Radius(um),BalanceVoltage(V),CalculatedCharge(C),NumCharges(n),Estimated_e(C)\n';
    const rows = calculationLog
      .map((l) => `${l.id},${l.radiusUm},${l.vBalance},${l.qExp.toExponential(3)},${l.nEstimated},${l.eCalculated.toExponential(3)}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `millikan_oil_drop_measurements.csv`;
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
              <div className="p-3 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 rounded-2xl shadow-lg shadow-amber-500/20">
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent">
                  تجربة قطرة الزيت لميليكان وتكميم الشحنة (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  موازنة قطرات الزيت في المجال الكهربائي واستنتاج شحنة الإلكترون الأساسية e = 1.602 × 10⁻¹⁹ C
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
              disabled={calculationLog.length === 0}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              تصدير السجل (CSV)
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
              <span className="text-xs text-slate-400">الجهد المطبق (V)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{voltage} V</p>
              <span className="text-[10px] text-slate-500">جهد التوازن: {balanceVoltage} V</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">شدة المجال (E)</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{(voltage / PLATE_DISTANCE_M).toFixed(0)} V/m</p>
              <span className="text-[10px] text-slate-500">d = 16 mm</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">نصف قطر القطرة (r)</span>
              <p className="text-lg font-bold text-slate-200 font-mono">{selectedDroplet.radiusUm} µm</p>
              <span className="text-[10px] text-slate-500">ميكرومتر</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">شحنة القطرة (q)</span>
              <p className="text-lg font-bold text-purple-400 font-mono">{(selectedDroplet.chargeC * 1e19).toFixed(2)} × 10⁻¹⁹ C</p>
              <span className="text-[10px] text-slate-500">{selectedDroplet.numCharges} شحنات ({selectedDroplet.numCharges}e)</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حالة اتزان القطرة</span>
              <p className={`text-sm font-bold mt-1 ${isBalanced ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isBalanced ? '✓ متزنة تماماً (Fe = Fg)' : 'حركة غير متزنة'}
              </p>
              <span className="text-[10px] text-slate-500">{isBalanced ? 'جاهزة للتسجيل' : 'اضبط الجهد'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">القياسات المسجلة</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">{calculationLog.length}</p>
              <span className="text-[10px] text-slate-500">في سجل التجارب</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Activity className="w-4 h-4" />
              المجهر والمكثف ثلاثي الأبعاد (3D Chamber)
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Target className="w-4 h-4" />
              مهام التحدي المعملي ({[mission1Completed, mission2Completed, mission3Completed].filter(Boolean).length}/3)
            </TabsTrigger>
            <TabsTrigger value="logbook" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Layers className="w-4 h-4" />
              سجل قياس الشحنات e
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              النظرية والاشتقاق الرياضي
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
                      <Droplets className="w-4 h-4 text-amber-400" />
                      غرفة قطرات الزيت ومجال ميليكان ثلاثي الأبعاد (3D View)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10">
                        قطرة {selectedDroplet.id} مختارة
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
                    <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
                      <ambientLight intensity={0.7} />
                      <directionalLight position={[8, 10, 8]} intensity={1.2} />
                      <directionalLight position={[-8, -5, -8]} intensity={0.4} color="#f59e0b" />
                      <MillikanChamber3D
                        voltage={voltage}
                        isPlaying={isPlaying}
                        isXRayOn={isXRayOn}
                        droplets={droplets}
                        selectedDropletId={selectedDropletId}
                        onSelectDroplet={(id) => {
                          setSelectedDropletId(id);
                          labSound.playGeigerClick();
                        }}
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
                        onClick={() => setCameraView('microscope')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        المجهر
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
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        {isBalanced
                          ? `💡 أحسنت! قطرة ${selectedDroplet.id} متزنة تماماً عند ${voltage}V. اضغط على "تسجيل قراءة الاتزان" لحساب شحنتها.`
                          : voltage < balanceVoltage
                          ? `💡 الجهد (${voltage}V) ضعيف. قوة الجاذبية للأسفل تفوق القوة الكهربائية. ارفع الجهد نحو ${balanceVoltage}V.`
                          : `💡 الجهد (${voltage}V) مرتفع جداً. القوة الكهربائية تدفع القطرة للأعلى. خفّض الجهد نحو ${balanceVoltage}V.`}
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
                      <Zap className="w-4 h-4 text-amber-400" />
                      لوحة موازنة وتأيين القطرة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Droplet Selection */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر القطرة المستهدفة</label>
                      <div className="grid grid-cols-5 gap-1">
                        {droplets.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => {
                              setSelectedDropletId(d.id);
                              labSound.playGeigerClick();
                            }}
                            className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                              selectedDropletId === d.id
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            قطرة {d.id}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Voltage Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">جهد المكثف (Voltage)</label>
                        <span className="text-xs font-mono text-amber-400 font-bold">{voltage} V</span>
                      </div>
                      <Slider
                        value={[voltage]}
                        min={0}
                        max={1000}
                        step={1}
                        onValueChange={(val) => setVoltage(val[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>0 V</span>
                        <span className="text-amber-400 font-bold">التوازن ≈ {balanceVoltage} V</span>
                        <span>1000 V</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <Button
                        onClick={handleXRayPulse}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        إطلاق ومضة أشعة سينية X-Ray (تأيين)
                      </Button>

                      <Button
                        disabled={!isBalanced}
                        onClick={handleRecordMeasurement}
                        className={`w-full font-bold text-xs flex items-center justify-center gap-2 ${
                          isBalanced
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        تسجيل قراءة الاتزان في السجل
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
                  مهام وتحديات الاكتشاف المعملي لميليكان (Lab Challenges)
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  أكمل هذه التحديات العملية داخل المختبر ثلاثي الأبعاد لاكتشاف شحنة الإلكترون وتكميم الكهرباء.
                </p>
              </div>

              <div className="space-y-4">
                {/* Mission 1 */}
                <div className={`p-4 rounded-xl border transition-all ${mission1Completed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckSquare className={`w-4 h-4 ${mission1Completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        المهمة 1: موازنة إحدى قطرات الزيت في الهواء (Fe = Fg)
                      </div>
                      <p className="text-xs text-slate-400">
                        اختر أي قطرة واضبط منزلق الجهد بدقة حتى تتوقف القطرة عن الصعود أو الهبوط وتصبح متزنة تماماً.
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
                        المهمة 2: تأيين هواء الغرفة بواسطة الأشعة السينية (X-Ray Ionization)
                      </div>
                      <p className="text-xs text-slate-400">
                        اضغط على زر &quot;إطلاق ومضة أشعة سينية&quot; لمشاهدة اكتساب أو فقدان القطرة لإلكترونات وتغير عدد شحناتها.
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
                        المهمة 3: تسجيل 3 قراءات اتزان مختلفة في السجل واستنتاج قيمة e
                      </div>
                      <p className="text-xs text-slate-400">
                        سجل 3 قطرات متزنة على الأقل في السجل المعملي وملاحظة كيف أن كل الشحنات هي مضاعفات صحيحة لـ \(1.6 \times 10^{-19}\) كولوم.
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

          {/* TAB 3: Logbook */}
          <TabsContent value="logbook" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg font-bold text-sky-300">سجل قياسات الشحنة واستنتاج شحنة الإلكترون e</CardTitle>
                {calculationLog.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportDataCSV}
                    className="border-slate-700 text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    تصدير CSV
                  </Button>
                )}
              </div>
              {calculationLog.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  لم تقم بتسجيل أي قراءة بعد. قم بموازنة إحدى القطرات في المختبر ثلاثي الأبعاد واضغط على زر &quot;تسجيل قراءة الاتزان&quot;.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                        <th className="p-3">رقم القطرة</th>
                        <th className="p-3">نصف القطر (µm)</th>
                        <th className="p-3">جهد الاتزان V</th>
                        <th className="p-3">الشحنة المحسوبة q (C)</th>
                        <th className="p-3">عدد الشحنات n</th>
                        <th className="p-3">قيمة e المستنتجة (C)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculationLog.map((log, idx) => (
                        <tr key={idx} className="border-b border-slate-800/60 font-mono text-slate-200">
                          <td className="p-3 text-amber-300">قطرة {log.id}</td>
                          <td className="p-3">{log.radiusUm}</td>
                          <td className="p-3">{log.vBalance} V</td>
                          <td className="p-3 text-purple-300">{(log.qExp * 1e19).toFixed(3)} × 10⁻¹⁹</td>
                          <td className="p-3 text-sky-300">{log.nEstimated}</td>
                          <td className="p-3 text-emerald-400 font-bold">{(log.eCalculated * 1e19).toFixed(3)} × 10⁻¹⁹</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* TAB 4: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-amber-300">الأسس الفيزيائية لتجربة قطرة الزيت لروبيرت ميليكان (1909)</h3>
              <p>
                نال الفيزيائي الأمريكي روبرت ميليكان جائزة نوبل في الفيزياء عام 1923 لقياسه الدقيق لشحنة الإلكترون وإثباته أن الشحنة الكهربائية كمية مكممة ومضاعفة صحيحة للشحنة الأساسية \(e\).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">1. معادلة اتزان القطرة في المجال الكهربائي</h4>
                  <p className="text-sm font-mono text-amber-300">Fe = Fg  ⟹  q · (V / d) = m · g</p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">2. مبدأ تكميم الشحنة الكهربائية</h4>
                  <p className="text-sm font-mono text-amber-300">q = n · e    (n = ±1, ±2, ±3, ...)</p>
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
                  اختبار فهم تجربة ميليكان
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: إذا تم قياس شحنات 3 قطرات زيت مختلفة وكانت: 3.2 × 10⁻¹⁹ C، 4.8 × 10⁻¹⁹ C، و 8.0 × 10⁻¹⁹ C، فما هي قيمة الشحنة الأساسية الأولية e؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: '3.2 × 10⁻¹⁹ C' },
                    { id: 1, text: '1.6 × 10⁻¹⁹ C (القاسم المشترك الأكبر)' },
                    { id: 2, text: '4.8 × 10⁻¹⁹ C' },
                    { id: 3, text: '0.8 × 10⁻¹⁹ C' },
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
                        <span>إجابة صحيحة تماماً! القاسم المشترك الأكبر لجميع هذه الشحنات هو 1.6 × 10⁻¹⁹ C، وهي شحنة الإلكترون الواحد (2e, 3e, 5e).</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. من خلال إيجاد العامل المشترك الأصغر للقيم المعطاة نجد أن جميعها مضاعفات للعدد 1.6 × 10⁻¹⁹ C.</span>
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
