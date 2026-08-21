import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Target, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, BookOpen, Atom, Maximize2, Minimize2, 
  Volume2, VolumeX, Download, Lightbulb, CheckSquare
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

interface FoilMaterial {
  id: string;
  nameAr: string;
  nameEn: string;
  atomicNumberZ: number;
  symbol: string;
  color: string;
}

const FOIL_MATERIALS: FoilMaterial[] = [
  { id: 'gold', nameAr: 'الذهب (Au - Z=79)', nameEn: 'Gold', atomicNumberZ: 79, symbol: 'Au', color: '#fbbf24' },
  { id: 'silver', nameAr: 'الفضة (Ag - Z=47)', nameEn: 'Silver', atomicNumberZ: 47, symbol: 'Ag', color: '#cbd5e1' },
  { id: 'copper', nameAr: 'النحاس (Cu - Z=29)', nameEn: 'Copper', atomicNumberZ: 29, symbol: 'Cu', color: '#f97316' },
  { id: 'aluminum', nameAr: 'الألمنيوم (Al - Z=13)', nameEn: 'Aluminum', atomicNumberZ: 13, symbol: 'Al', color: '#94a3b8' },
];

interface AlphaParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  active: boolean;
}

interface Rutherford3DProps {
  modelType: 'rutherford' | 'thomson';
  selectedFoil: FoilMaterial;
  beamEnergyMeV: number;
  beamIntensity: number;
  isPlaying: boolean;
  onRecordStats: (forward: number, medium: number, back: number) => void;
}

function RutherfordChamber3D({
  modelType,
  selectedFoil,
  beamEnergyMeV,
  beamIntensity,
  isPlaying,
  onRecordStats,
}: Rutherford3DProps) {
  const particlesRef = useRef<THREE.Group>(null);
  const maxParticles = 40;

  const statsRef = useRef({ forward: 0, medium: 0, back: 0, lastReport: 0 });

  const particles = useRef<AlphaParticle[]>([]);
  if (particles.current.length === 0) {
    particles.current = Array.from({ length: maxParticles }, () => ({
      x: -4.8,
      y: (Math.random() - 0.5) * 1.2,
      z: (Math.random() - 0.5) * 1.2,
      vx: 0.14,
      vy: 0,
      vz: 0,
      active: false,
    }));
  }

  useFrame(() => {
    if (!isPlaying) return;

    const activeCountTarget = Math.max(5, Math.round((beamIntensity / 100) * maxParticles));
    const speed = 0.12 + (beamEnergyMeV / 10) * 0.08;

    for (let i = 0; i < maxParticles; i++) {
      const p = particles.current[i];
      const mesh = particlesRef.current?.children[i] as THREE.Mesh;
      if (!mesh) continue;

      if (i < activeCountTarget) {
        mesh.visible = true;

        if (!p.active) {
          p.x = -4.8;
          p.y = (Math.random() - 0.5) * 1.2;
          p.z = (Math.random() - 0.5) * 1.2;
          p.vx = speed;
          p.vy = 0;
          p.vz = 0;
          p.active = true;
        }

        if (p.active) {
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          // Coulomb scattering near the nucleus
          if (modelType === 'rutherford') {
            const distSq = p.x * p.x + p.y * p.y + p.z * p.z;
            const dist = Math.sqrt(distSq);

            if (dist < 1.4 && p.x < 0.6) {
              const coulombForce = (selectedFoil.atomicNumberZ * 0.0028) / (distSq + 0.02);
              p.vx += (p.x / dist) * coulombForce;
              p.vy += (p.y / dist) * coulombForce;
              p.vz += (p.z / dist) * coulombForce;
            }
          }

          // Reach detector screen radius
          const radFromCenter = Math.sqrt(p.x * p.x + p.z * p.z);
          if (radFromCenter >= 3.8 || p.x > 4.2 || Math.abs(p.y) > 2.5) {
            const angleRad = Math.atan2(Math.sqrt(p.y * p.y + p.z * p.z), p.x);
            const angleDeg = angleRad * (180 / Math.PI);

            if (angleDeg < 45) {
              statsRef.current.forward++;
            } else if (angleDeg <= 90) {
              statsRef.current.medium++;
            } else {
              statsRef.current.back++;
            }

            p.active = false;
          }

          mesh.position.set(p.x, p.y, p.z);
        }
      } else {
        mesh.visible = false;
      }
    }

    const now = performance.now();
    if (now - statsRef.current.lastReport > 250) {
      statsRef.current.lastReport = now;
      onRecordStats(statsRef.current.forward, statsRef.current.medium, statsRef.current.back);
    }
  });

  return (
    <group>
      {/* CYLINDRICAL ZINC SULFIDE DETECTOR SCREEN */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[4.0, 4.0, 3.2, 48, 1, true]} />
        <meshStandardMaterial
          color="#15803d"
          emissive="#166534"
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
          roughness={0.5}
        />
      </mesh>

      {/* Screen Rings */}
      <mesh position={[0, -1.65, 0]}>
        <cylinderGeometry args={[4.08, 4.08, 0.15, 48]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <cylinderGeometry args={[4.08, 4.08, 0.15, 48]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>

      {/* ALPHA EMITTER GUN */}
      <group position={[-5.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 1.1, 1.1]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.8, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 0.7, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
        <Html position={[0, 0.9, 0]} center>
          <div className="bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            مدفع ألفا α
          </div>
        </Html>
      </group>

      {/* TARGET FOIL AND NUCLEUS */}
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.06, 2.6, 2.6]} />
          <meshStandardMaterial
            color={selectedFoil.color}
            metalness={0.9}
            roughness={0.15}
            opacity={0.65}
            transparent
          />
        </mesh>

        {modelType === 'rutherford' ? (
          <group>
            <mesh>
              <sphereGeometry args={[0.26, 24, 24]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.9} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.85, 16, 16]} />
              <meshBasicMaterial color="#f87171" opacity={0.2} transparent wireframe />
            </mesh>
            <Html position={[0, 0.55, 0]} center>
              <div className="bg-slate-900/90 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/40 pointer-events-none whitespace-nowrap shadow-lg">
                النواة (Z={selectedFoil.atomicNumberZ}+)
              </div>
            </Html>
          </group>
        ) : (
          <group>
            <mesh>
              <sphereGeometry args={[1.2, 24, 24]} />
              <meshBasicMaterial color="#38bdf8" opacity={0.25} transparent />
            </mesh>
            {[-0.4, 0, 0.4].map((off, idx) => (
              <mesh key={`elec-${idx}`} position={[off * 0.7, off * 0.5, off * 0.3]}>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.5} />
              </mesh>
            ))}
            <Html position={[0, 0.7, 0]} center>
              <div className="bg-slate-900/90 text-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-sky-500/40 pointer-events-none whitespace-nowrap shadow-lg">
                نموذج طومسون (شحنة موزعة)
              </div>
            </Html>
          </group>
        )}
      </group>

      {/* ALPHA PARTICLES */}
      <group ref={particlesRef}>
        {particles.current.map((_, i) => (
          <mesh key={`alpha-${i}`} visible={false}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial
              color="#fde047"
              emissive="#eab308"
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function RutherfordScatteringSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [modelType, setModelType] = useState<'rutherford' | 'thomson'>('rutherford');
  const [selectedFoil, setSelectedFoil] = useState<FoilMaterial>(FOIL_MATERIALS[0]);
  const [beamEnergyMeV, setBeamEnergyMeV] = useState<number>(5.5);
  const [beamIntensity, setBeamIntensity] = useState<number>(75);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Missions
  const [mission1Completed, setMission1Completed] = useState<boolean>(false);
  const [mission2Completed, setMission2Completed] = useState<boolean>(false);
  const [mission3Completed, setMission3Completed] = useState<boolean>(false);

  // Scattering Counters
  const [forwardDeflected, setForwardDeflected] = useState<number>(0);
  const [mediumDeflected, setMediumDeflected] = useState<number>(0);
  const [backScattered, setBackScattered] = useState<number>(0);

  // Quiz State
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const totalFired = forwardDeflected + mediumDeflected + backScattered;

  const closestApproachFm = useMemo(() => {
    const dmin = (1.44 * 2 * selectedFoil.atomicNumberZ) / beamEnergyMeV;
    return +dmin.toFixed(2);
  }, [selectedFoil, beamEnergyMeV]);

  const handleRecordStats = (forward: number, medium: number, back: number) => {
    setForwardDeflected(forward);
    setMediumDeflected(medium);
    setBackScattered(back);
  };

  useEffect(() => {
    // Mission 1: Fire beam and observe forward deflection
    if (forwardDeflected > 30 && !mission1Completed) {
      setMission1Completed(true);
      labSound.playSuccessChime();
    }
    // Mission 2: Observe rare backscattering in Rutherford model
    if (modelType === 'rutherford' && backScattered >= 1 && !mission2Completed) {
      setMission2Completed(true);
      labSound.playSuccessChime();
    }
    // Mission 3: Test low atomic number foil (Aluminum)
    if (selectedFoil.id === 'aluminum' && totalFired > 40 && !mission3Completed) {
      setMission3Completed(true);
      labSound.playSuccessChime();
    }
  }, [forwardDeflected, backScattered, modelType, selectedFoil, totalFired, mission1Completed, mission2Completed, mission3Completed]);

  const handleResetCounters = () => {
    setForwardDeflected(0);
    setMediumDeflected(0);
    setBackScattered(0);
  };

  const setCameraView = (view: 'default' | 'top' | 'nucleus' | 'gun') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'default') {
      controls.object.position.set(0, 6.0, 9.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      controls.object.position.set(0, 11.0, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'nucleus') {
      controls.object.position.set(0, 0.5, 2.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'gun') {
      controls.object.position.set(-6.5, 1.0, 2.0);
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
    const headers = 'Foil,AtomicNumber(Z),BeamEnergy(MeV),TotalFired,ForwardDeflected(<45deg),MediumDeflected(45-90deg),BackScattered(>90deg),ClosestApproach(fm)\n';
    const row = `${selectedFoil.nameEn},${selectedFoil.atomicNumberZ},${beamEnergyMeV},${totalFired},${forwardDeflected},${mediumDeflected},${backScattered},${closestApproachFm}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rutherford_scattering_${selectedFoil.id}.csv`;
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
              <div className="p-3 bg-gradient-to-br from-yellow-500 via-amber-600 to-red-600 rounded-2xl shadow-lg shadow-yellow-500/20">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-200 to-red-400 bg-clip-text text-transparent">
                  تشتت رذرفورد واكتشاف النواة الذرية ثلاثية الأبعاد (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  إطلاق جسيمات ألفا \(\alpha\) نحو رقائق المعادن وكشف النواة الذرية ذات الكثافة والشحنة المركزة
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
              <span className="text-xs text-slate-400">إجمالي الجسيمات المطلقة</span>
              <p className="text-lg font-bold text-slate-200">{totalFired}</p>
              <span className="text-[10px] text-slate-500">جسيمات ألفا α</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">عبور مباشر (0° - 45°)</span>
              <p className="text-lg font-bold text-sky-400">{forwardDeflected}</p>
              <span className="text-[10px] text-slate-500">
                {totalFired > 0 ? `${((forwardDeflected / totalFired) * 100).toFixed(1)}%` : '0%'}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">انحراف متوسط (45° - 90°)</span>
              <p className="text-lg font-bold text-amber-400">{mediumDeflected}</p>
              <span className="text-[10px] text-slate-500">
                {totalFired > 0 ? `${((mediumDeflected / totalFired) * 100).toFixed(1)}%` : '0%'}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">ارتداد خلفي (&gt; 90°)</span>
              <p className="text-lg font-bold text-red-400 font-mono">{backScattered}</p>
              <span className="text-[10px] text-slate-500">
                {totalFired > 0 ? `${((backScattered / totalFired) * 100).toFixed(2)}%` : '0%'} (دليل النواة)
              </span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">أقرب مسافة اقتراب (d_min)</span>
              <p className="text-lg font-bold text-purple-400">{closestApproachFm} fm</p>
              <span className="text-[10px] text-slate-500 font-mono">1 fm = 10⁻¹⁵ m</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">النموذج الذري المفعل</span>
              <p className="text-xs font-bold text-emerald-400 mt-1">
                {modelType === 'rutherford' ? 'نموذج رذرفورد النووي' : 'نموذج طومسون'}
              </p>
              <span className="text-[10px] text-slate-500">{selectedFoil.nameAr}</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-300">
              <Activity className="w-4 h-4" />
              المختبر والغرفة الاسطوانية ثلاثية الأبعاد (3D Chamber)
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Target className="w-4 h-4" />
              المهام والتحديات ({[mission1Completed, mission2Completed, mission3Completed].filter(Boolean).length}/3)
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              الاشتقاق وقانون كولوم للتشتت
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
                      <Atom className="w-4 h-4 text-yellow-400" />
                      شاشة كبريتيد الخارصين الأسطوانية وتشتت ألفا ثلاثية الأبعاد (3D)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 bg-yellow-500/10">
                        {selectedFoil.nameAr}
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
                    <Canvas camera={{ position: [0, 6.0, 9.5], fov: 45 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 12, 10]} intensity={1.2} />
                      <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#fde047" />
                      <RutherfordChamber3D
                        modelType={modelType}
                        selectedFoil={selectedFoil}
                        beamEnergyMeV={beamEnergyMeV}
                        beamIntensity={beamIntensity}
                        isPlaying={isPlaying}
                        onRecordStats={handleRecordStats}
                      />
                      <OrbitControls
                        ref={controlsRef}
                        enablePan={true}
                        enableZoom={true}
                        minDistance={4}
                        maxDistance={18}
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
                        onClick={() => setCameraView('nucleus')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        النواة
                      </button>
                      <button
                        onClick={() => setCameraView('gun')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        المدفع
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
                      <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0" />
                      <span>
                        {modelType === 'rutherford'
                          ? `💡 رذرفورد: ترتد جسيمات ألفا بزوايا حادة نادرة (${backScattered} ارتداد) عند مواجهتها للنواة الموجبة المركزة مباشرة (Z=${selectedFoil.atomicNumberZ}).`
                          : `💡 طومسون: تعبر جميع جسيمات ألفا في خطوط مستقيمة دون أي ارتداد خلفي بسبب انتشار الشحنة الموجبة في كامل الحجم.`}
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
                      <Target className="w-4 h-4 text-yellow-400" />
                      التحكم بالمدفع والرقائق المعدنية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Model Switcher */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">النموذج الذري للمقارنة</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setModelType('rutherford');
                            handleResetCounters();
                            labSound.playGeigerClick();
                          }}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                            modelType === 'rutherford'
                              ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300 shadow-md shadow-yellow-500/10'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400'
                          }`}
                        >
                          نموذج رذرفورد النووي
                        </button>
                        <button
                          onClick={() => {
                            setModelType('thomson');
                            handleResetCounters();
                            labSound.playGeigerClick();
                          }}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                            modelType === 'thomson'
                              ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400'
                          }`}
                        >
                          نموذج طومسون
                        </button>
                      </div>
                    </div>

                    {/* Foil Material Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر مادة الرقيقة المعدنية</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {FOIL_MATERIALS.map((foil) => (
                          <button
                            key={foil.id}
                            onClick={() => {
                              setSelectedFoil(foil);
                              handleResetCounters();
                              labSound.playGeigerClick();
                            }}
                            className={`p-2 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedFoil.id === foil.id
                                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{foil.nameAr}</div>
                            <div className="text-[10px] opacity-75 font-mono">العدد الذري: {foil.atomicNumberZ}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Beam Energy Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">طاقة جسيمات ألفا (Energy)</label>
                        <span className="text-xs font-mono text-yellow-400 font-bold">{beamEnergyMeV.toFixed(1)} MeV</span>
                      </div>
                      <Slider
                        value={[beamEnergyMeV]}
                        min={2.0}
                        max={10.0}
                        step={0.1}
                        onValueChange={(val) => setBeamEnergyMeV(val[0])}
                        className="py-1"
                      />
                    </div>

                    {/* Beam Intensity Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">كثافة حزمة الجسيمات (Intensity)</label>
                        <span className="text-xs font-mono text-amber-400 font-bold">{beamIntensity}%</span>
                      </div>
                      <Slider
                        value={[beamIntensity]}
                        min={10}
                        max={100}
                        step={5}
                        onValueChange={(val) => setBeamIntensity(val[0])}
                        className="py-1"
                      />
                    </div>

                    {/* Clear Button */}
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        onClick={handleResetCounters}
                        className="w-full border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs"
                      >
                        تصفير عدادات التشتت
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
                  مهام وتحديات استكشاف النواة الذرية (Rutherford Missions)
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  أكمل هذه المهام لتكرار التجربة التاريخية التي أثبتت وجود النواة المركزية للذرة عام 1911.
                </p>
              </div>

              <div className="space-y-4">
                {/* Mission 1 */}
                <div className={`p-4 rounded-xl border transition-all ${mission1Completed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckSquare className={`w-4 h-4 ${mission1Completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        المهمة 1: رصد العبور المباشر لغالبية جسيمات ألفا (&gt; 98%)
                      </div>
                      <p className="text-xs text-slate-400">
                        أطلق حزمة ألفا ولاحظ كيف أن الغالبية الساحقة من الجسيمات تعبر دون انحراف، مما يثبت أن معظم حجم الذرة فراغ.
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
                        المهمة 2: رصد الارتداد الخلفي الحاسم بزاوية منفرجة (&gt; 90°)
                      </div>
                      <p className="text-xs text-slate-400">
                        اختر رقيقة الذهب (Z=79) ونموذج رذرفورد وراقب تسجيل ارتداد خلفي للجسيمات التي تواجه النواة مباشرة.
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
                        المهمة 3: مقارنة قوة التنافر الكولومي مع تغير العدد الذري (Z)
                      </div>
                      <p className="text-xs text-slate-400">
                        غير مادة الرقيقة إلى الألمنيوم (Z=13) ولاحظ انخفاض قوة التنافر مقارنة بالذهب بسبب صغر شحنة النواة.
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
              <h3 className="text-xl font-bold text-yellow-300">تشتت جسيمات ألفا واكتشاف النواة الذرية (1911)</h3>
              <p>
                قام إرنست رذرفورد بمعاونة جيجر ومارسدن بإطلاق جسيمات ألفا الموجبة نحو رقيقة ذهب بالغة الرقة، وكانت المفاجأة التاريخية بارتداد عدد ضئيل جداً من الجسيمات بزوايا تفوق 90°، مما أثبت أن معظم كتلة الذرة وشحنتها الموجبة متمركزة في حيز متناهي الصغر يُدعى <strong>النواة</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">1. قانون رذرفورد للتشتت التفاضلي</h4>
                  <p className="text-sm font-mono text-yellow-300">dσ/dΩ ∝ (z² Z² e⁴) / (Ek² sin⁴(θ/2))</p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">2. أقرب مسافة اقتراب للنواة</h4>
                  <p className="text-sm font-mono text-yellow-300">d_min = (1 / 4πε₀) · (2 Z e² / Ek)</p>
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
                  اختبار استنتاجات تجربة رذرفورد
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: ما هو الاستنتاج الفيزيائي المباشر من ارتداد نسبة ضئيلة جداً (حوالي 1 من كل 8000) من جسيمات ألفا بزوايا منفرجة أكبر من 90°؟
                </p>
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'أن الشحنة الموجبة موزعة بانتظام في كامل حجم الذرة.' },
                    { id: 1, text: 'أن معظم كتلة الذرة وشحنتها الموجبة متمركزة في حيز متناهي الصغر ذي كثافة هائلة يسمى النواة.' },
                    { id: 2, text: 'أن جسيمات ألفا سالبة الشحنة وتنجذب للإلكترونات.' },
                    { id: 3, text: 'أن الذرة صلبة ومصمتة بالكامل ولا يوجد فراغ بداخلها.' },
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
                        <span>إجابة صحيحة ورائعة! الارتداد الخلفي مستحيل الحدوث إلا إذا واجه جسيم ألفا قوة كولومية هائلة ناجمة عن تركيز الشحنة والكتلة في نقطة بالغة الصغر (النواة).</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. الارتداد النادر يثبت وجود نواة شديدة الكثافة في مركز الذرة، بينما معظم حجم الذرة فراغ تعبره الجسيمات دون انحراف.</span>
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
