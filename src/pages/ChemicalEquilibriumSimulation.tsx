import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Beaker, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, BookOpen, Layers, Gauge, Thermometer,
  Volume2, VolumeX, Download, Maximize2, Minimize2, Lightbulb 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import confetti from 'canvas-confetti';
import { labSound } from '@/utils/labAudio';

interface ReactionSystem {
  id: string;
  nameAr: string;
  equationAr: string;
  reactantsAr: string;
  productsAr: string;
  deltaH: number;
  deltaMolesGas: number;
  kcStandard: number;
  reactantColor: string;
  productColor: string;
}

const REACTIONS: ReactionSystem[] = [
  {
    id: 'haber',
    nameAr: 'تخليق الأمونيا (Haber-Bosch)',
    equationAr: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',
    reactantsAr: 'نيتروجين N₂ + هيدروجين H₂',
    productsAr: 'أمونيا NH₃',
    deltaH: -92.4,
    deltaMolesGas: -2,
    kcStandard: 0.5,
    reactantColor: '#fbbf24',
    productColor: '#38bdf8',
  },
  {
    id: 'no2-dimer',
    nameAr: 'توازن ثاني أكسيد النيتروجين الملون',
    equationAr: '2NO₂(g) [بني محمر] ⇌ N₂O₄(g) [عديم اللون]',
    reactantsAr: 'ثاني أكسيد النيتروجين NO₂ (بني محمر)',
    productsAr: 'رباعي أكسيد ثنائي النيتروجين N₂O₄ (شفاف)',
    deltaH: -57.2,
    deltaMolesGas: -1,
    kcStandard: 1.2,
    reactantColor: '#ef4444',
    productColor: '#93c5fd',
  },
  {
    id: 'hi-synthesis',
    nameAr: 'تكوين يوديد الهيدروجين',
    equationAr: 'H₂(g) + I₂(g) ⇌ 2HI(g)',
    reactantsAr: 'هيدروجين H₂ + بخار يود I₂ (بنفسجي)',
    productsAr: 'يوديد الهيدروجين HI (عديم اللون)',
    deltaH: +53.0,
    deltaMolesGas: 0,
    kcStandard: 50.0,
    reactantColor: '#a855f7',
    productColor: '#34d399',
  },
];

interface MoleculeState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  isProduct: boolean;
}

interface ReactorProps {
  temperatureK: number;
  pressureAtm: number;
  selectedReaction: ReactionSystem;
  ratioProducts: number;
  isPlaying: boolean;
}

function ReactorChamber3D({
  temperatureK,
  pressureAtm,
  selectedReaction,
  ratioProducts,
  isPlaying,
}: ReactorProps) {
  const moleculesRef = useRef<THREE.Group>(null);
  const cylinderRadius = 2.0;
  const maxMolecules = 50;

  // Chamber geometry based on pressure
  // At 1 atm: height = 3.6, at 5 atm: height = 1.6
  const chamberHeight = 4.2 / (1 + (pressureAtm - 0.5) * 0.35);
  const halfH = chamberHeight / 2;
  const pistonY = halfH;
  const effectiveRadius = cylinderRadius - 0.22;
  const effectiveHalfH = halfH - 0.22;

  // Stable list of molecule positions and velocities
  const molecules = useRef<MoleculeState[]>([]);
  if (molecules.current.length === 0) {
    molecules.current = Array.from({ length: maxMolecules }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * effectiveRadius * 0.85;
      return {
        x: Math.cos(angle) * r,
        y: (Math.random() - 0.5) * (effectiveHalfH * 1.5),
        z: Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.04,
        vy: (Math.random() - 0.5) * 0.04,
        vz: (Math.random() - 0.5) * 0.04,
        isProduct: i < Math.round(ratioProducts * maxMolecules),
      };
    });
  }

  // Update molecule types when ratio changes
  molecules.current.forEach((m, idx) => {
    m.isProduct = idx < Math.round(ratioProducts * maxMolecules);
  });

  useFrame(() => {
    if (!isPlaying) return;

    const speedScale = Math.sqrt(temperatureK / 300);

    molecules.current.forEach((m, i) => {
      m.x += m.vx * speedScale;
      m.y += m.vy * speedScale;
      m.z += m.vz * speedScale;

      // 1. STRICT CYLINDER RADIAL BOUNDARY (Never escape walls)
      const currentR = Math.sqrt(m.x * m.x + m.z * m.z);
      if (currentR > effectiveRadius) {
        // Push back inside
        const angle = Math.atan2(m.z, m.x);
        m.x = Math.cos(angle) * (effectiveRadius - 0.02);
        m.z = Math.sin(angle) * (effectiveRadius - 0.02);
        m.vx = -m.vx * (0.8 + Math.random() * 0.4);
        m.vz = -m.vz * (0.8 + Math.random() * 0.4);
      }

      // 2. STRICT VERTICAL BOUNDARY (Never escape Piston or Base)
      if (m.y > effectiveHalfH) {
        m.y = effectiveHalfH - 0.02;
        m.vy = -Math.abs(m.vy);
      } else if (m.y < -effectiveHalfH) {
        m.y = -effectiveHalfH + 0.02;
        m.vy = Math.abs(m.vy);
      }

      // Update 3D mesh
      const mesh = moleculesRef.current?.children[i] as THREE.Mesh;
      if (mesh) {
        mesh.position.set(m.x, m.y, m.z);
      }
    });
  });

  return (
    <group>
      {/* 3D TRANSPARENT GLASS CYLINDER */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[cylinderRadius, cylinderRadius, chamberHeight, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#94a3b8"
          transmission={0.92}
          opacity={0.3}
          transparent
          roughness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* SOLID BASE */}
      <mesh position={[0, -halfH - 0.15, 0]}>
        <cylinderGeometry args={[cylinderRadius + 0.15, cylinderRadius + 0.15, 0.3, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* MOVING PISTON */}
      <group position={[0, pistonY, 0]}>
        {/* Piston Disc */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[cylinderRadius - 0.02, cylinderRadius - 0.02, 0.22, 32]} />
          <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Piston Rod */}
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 2.2, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
        </mesh>
        <Html position={[0, 0.45, 0]} center>
          <div className="bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            المكبس ({pressureAtm.toFixed(1)} atm)
          </div>
        </Html>
      </group>

      {/* INTERNAL GAS MOLECULES */}
      <group ref={moleculesRef}>
        {molecules.current.map((m, idx) => (
          <mesh key={`mol-${idx}`} position={[m.x, m.y, m.z]}>
            <sphereGeometry args={[m.isProduct ? 0.13 : 0.1, 14, 14]} />
            <meshStandardMaterial
              color={m.isProduct ? selectedReaction.productColor : selectedReaction.reactantColor}
              emissive={m.isProduct ? selectedReaction.productColor : selectedReaction.reactantColor}
              emissiveIntensity={0.5}
              metalness={0.2}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function ChemicalEquilibriumSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [selectedReaction, setSelectedReaction] = useState<ReactionSystem>(REACTIONS[0]);
  const [temperatureK, setTemperatureK] = useState<number>(450);
  const [pressureAtm, setPressureAtm] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Concentrations
  const [concA, setConcA] = useState<number>(2.0);
  const [concB, setConcB] = useState<number>(3.0);
  const [concC, setConcC] = useState<number>(1.5);
  const [historyData, setHistoryData] = useState<Array<{ time: number; reactants: number; products: number }>>([]);

  // Quiz States
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const currentKc = useMemo(() => {
    const R_GAS = 8.314;
    const deltaH_J = selectedReaction.deltaH * 1000;
    const exponent = -(deltaH_J / R_GAS) * (1 / temperatureK - 1 / 298.15);
    const kc = selectedReaction.kcStandard * Math.exp(exponent);
    return Math.max(0.001, Math.min(999, +kc.toFixed(3)));
  }, [selectedReaction, temperatureK]);

  const Q = useMemo(() => {
    const q = concC / (concA * Math.max(0.1, concB));
    return +q.toFixed(3);
  }, [concA, concB, concC]);

  const ratioProducts = useMemo(() => {
    const total = concA + concB + concC;
    return total > 0 ? concC / total : 0.5;
  }, [concA, concB, concC]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      const rate = 0.05;
      const difference = currentKc - Q;

      setConcA((a) => Math.max(0.2, +(a - difference * rate * 0.4).toFixed(3)));
      setConcB((b) => Math.max(0.2, +(b - difference * rate * 0.4).toFixed(3)));
      setConcC((c) => Math.max(0.2, +(c + difference * rate * 0.6).toFixed(3)));

      setHistoryData((prev) => {
        const nextTime = prev.length > 0 ? prev[prev.length - 1].time + 1 : 0;
        const newEntry = {
          time: nextTime,
          reactants: +(concA + concB).toFixed(2),
          products: +concC.toFixed(2),
        };
        return [...prev.slice(-25), newEntry];
      });
    }, 300);

    return () => clearInterval(timer);
  }, [isPlaying, currentKc, Q, concA, concB, concC]);

  const setCameraView = (view: 'default' | 'top' | 'piston' | 'side') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'default') {
      controls.object.position.set(0, 2.5, 7.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      controls.object.position.set(0, 8.5, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'piston') {
      controls.object.position.set(0, 3.5, 3.5);
      controls.target.set(0, 1.5, 0);
    } else if (view === 'side') {
      controls.object.position.set(7.5, 0, 0);
      controls.target.set(0, 0, 0);
    }
    controls.update();
    labSound.playLaserPulse(550);
  };

  const toggleSound = () => {
    const muted = labSound.toggleMute();
    setIsMuted(muted);
  };

  const handleExportDataCSV = () => {
    const headers = 'Reaction,Temperature(K),Pressure(atm),Kc,Q,ReactantsConc(M),ProductsConc(M)\n';
    const row = `${selectedReaction.id},${temperatureK},${pressureAtm},${currentKc},${Q},${(concA + concB).toFixed(3)},${concC.toFixed(3)}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chemical_equilibrium_${selectedReaction.id}.csv`;
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
    setTemperatureK(450);
    setPressureAtm(1.0);
    setConcA(2.0);
    setConcB(3.0);
    setConcC(1.5);
    setHistoryData([]);
    if (controlsRef.current) {
      controlsRef.current.reset();
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
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Beaker className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400 bg-clip-text text-transparent">
                  الاتزان الكيميائي ومبدأ لوشاتيليه ثلاثي الأبعاد (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  محاكاة استجابة التفاعلات الكيميائية المتزنة لتغيرات الحرارة والضغط والتركيز في مفاعل حقيقي محكم
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
              onClick={handleReset}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              إعادة الضبط
            </Button>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">ثابت الاتزان (Kc)</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{currentKc}</p>
              <span className="text-[10px] text-slate-500">عند {temperatureK} K</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حاصل التفاعل (Q)</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">{Q}</p>
              <span className="text-[10px] text-slate-500">حالة التركيز اللحظية</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حرارة التفاعل (ΔH)</span>
              <p className={`text-lg font-bold font-mono ${selectedReaction.deltaH < 0 ? 'text-orange-400' : 'text-sky-400'}`}>
                {selectedReaction.deltaH} kJ
              </p>
              <span className="text-[10px] text-slate-500">{selectedReaction.deltaH < 0 ? 'طارد للحرارة' : 'ماص للحرارة'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">تغير مولات الغاز (Δn)</span>
              <p className="text-lg font-bold text-purple-400 font-mono">{selectedReaction.deltaMolesGas}</p>
              <span className="text-[10px] text-slate-500">حساسية الضغط</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حالة الاتزان</span>
              <p className="text-xs font-bold text-slate-200 mt-1">
                {Math.abs(Q - currentKc) < 0.1 ? '✓ في حالة اتزان ديناميكي' : Q < currentKc ? '⟶ يزاح نحو النواتج (طردي)' : '⟵ يزاح نحو المتفاعلات (عكسي)'}
              </p>
              <span className="text-[10px] text-slate-500">وفق مبدأ لوشاتيليه</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">المتفاعلات مقابل النواتج</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{(concA + concB).toFixed(1)} / {concC.toFixed(1)}</p>
              <span className="text-[10px] text-slate-500">مول/لتر (M)</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Activity className="w-4 h-4" />
              المفاعل الكيميائي ثلاثي الأبعاد (3D Reactor)
            </TabsTrigger>
            <TabsTrigger value="curves" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Layers className="w-4 h-4" />
              منحنيات التراكيز الحية
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              مبدأ لوشاتيليه ومعادلة فانت هوف
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
                      <Beaker className="w-4 h-4 text-emerald-400" />
                      مفاعل الغازات ثلاثي الأبعاد مع مكبس محكم (3D View)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 bg-emerald-500/10">
                        {selectedReaction.nameAr}
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
                      <directionalLight position={[8, 10, 8]} intensity={1.2} />
                      <directionalLight position={[-8, -5, -8]} intensity={0.4} color="#38bdf8" />
                      <ReactorChamber3D
                        temperatureK={temperatureK}
                        pressureAtm={pressureAtm}
                        selectedReaction={selectedReaction}
                        ratioProducts={ratioProducts}
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
                        onClick={() => setCameraView('piston')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        المكبس
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
                      <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        {Math.abs(Q - currentKc) < 0.1
                          ? `💡 النظام مستقر في حالة اتزان ديناميكي (Q ≈ Kc = ${currentKc}). الجزيئات محصورة بدقة داخل المفاعل.`
                          : Q < currentKc
                          ? `💡 التفاعل يزاح طردياً نحو تكوين النواتج (Q < Kc).`
                          : `💡 التفاعل يزاح عكسياً نحو المتفاعلات (Q > Kc).`}
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
                      <Gauge className="w-4 h-4 text-emerald-400" />
                      التحكم بظروف التفاعل
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Reaction Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر النظام الكيميائي</label>
                      <div className="space-y-1.5">
                        {REACTIONS.map((rxn) => (
                          <button
                            key={rxn.id}
                            onClick={() => {
                              setSelectedReaction(rxn);
                              handleReset();
                              labSound.playLaserPulse(450);
                            }}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedReaction.id === rxn.id
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{rxn.nameAr}</div>
                            <div className="text-[10px] opacity-75 font-mono">{rxn.equationAr}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Temperature Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                          <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                          درجة الحرارة (Temperature)
                        </label>
                        <span className="text-xs font-mono text-orange-400 font-bold">{temperatureK} K ({temperatureK - 273}°C)</span>
                      </div>
                      <Slider
                        value={[temperatureK]}
                        min={250}
                        max={800}
                        step={10}
                        onValueChange={(val) => setTemperatureK(val[0])}
                        className="py-1"
                      />
                    </div>

                    {/* Pressure Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-sky-400" />
                          الضغط الكلي (Pressure)
                        </label>
                        <span className="text-xs font-mono text-sky-400 font-bold">{pressureAtm.toFixed(1)} atm</span>
                      </div>
                      <Slider
                        value={[pressureAtm]}
                        min={0.5}
                        max={5.0}
                        step={0.1}
                        onValueChange={(val) => setPressureAtm(val[0])}
                        className="py-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Live Curves */}
          <TabsContent value="curves" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 shadow-xl">
              <CardTitle className="text-base font-bold text-sky-300 mb-2">تغير التراكيز الحية مع الزمن واستقرار الاتزان</CardTitle>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" label={{ value: 'الزمن (ثوانٍ)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" label={{ value: 'التركيز (mol/L)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="reactants" stroke="#fbbf24" strokeWidth={2} name="المتفاعلات" dot={false} />
                    <Line type="monotone" dataKey="products" stroke="#38bdf8" strokeWidth={2} name="النواتج" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 3: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-emerald-300">مبدأ لوشاتيليه والاتزان الكيميائي الديناميكي (1884)</h3>
              <p>
                ينص مبدأ لوشاتيليه على أنه: <em>&quot;إذا حدث تغير في أحد العوامل المؤثرة على نظام كيميائي في حالة اتزان (مثل التركيز أو الضغط أو درجة الحرارة)، فإن النظام يعدل من موضعه في الاتجاه الذي يقلل من تأثير هذا التغير&quot;</em>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">1. تأثير درجة الحرارة على Kc</h4>
                  <p className="text-xs text-slate-400">
                    في التفاعلات <strong>الطاردة للحرارة (ΔH &lt; 0)</strong>: رفع الحرارة يزيح الاتزان عكسياً ويقلل قيمة Kc.<br/>
                    في التفاعلات <strong>الماصة للحرارة (ΔH &gt; 0)</strong>: رفع الحرارة يزيح الاتزان طردياً ويزيد قيمة Kc.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">2. تأثير الضغط والحجم</h4>
                  <p className="text-xs text-slate-400">
                    زيادة الضغط (تقليل الحجم) يزيح الاتزان نحو الطرف الذي يحتوي على <strong>عدد مولات غازية أقل</strong> لتقليل الضغط الكلي.
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
                  اختبار مفاهيم مبدأ لوشاتيليه
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: في تفاعل تكوين الأمونيا الطارد للحرارة (N₂ + 3H₂ ⇌ 2NH₃ + حرارة)، ما هي الظروف التي تزيد من إنتاج غاز الأمونيا (NH₃)؟
                </p>
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'زيادة الضغط وخفض درجة الحرارة.' },
                    { id: 1, text: 'خفض الضغط ورفع درجة الحرارة.' },
                    { id: 2, text: 'سحب غاز النيتروجين من الوعاء.' },
                    { id: 3, text: 'زيادة حجم الوعاء مع التسخين.' },
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
                        <span>إجابة صحيحة ورائعة! زيادة الضغط تزيح التفاعل نحو المولات الأقل، وخفض الحرارة يزيح التفاعل الطارد للأمام.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. لزيادة إنتاج تفاعل طارد بمولات ناتجة أقل يجب زيادة الضغط وخفض درجة الحرارة.</span>
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
