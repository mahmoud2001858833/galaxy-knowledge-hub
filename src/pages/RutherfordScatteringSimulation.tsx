import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Cylinder, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Target, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, Sparkles, BookOpen, Layers, Zap, Compass, Eye, ShieldAlert, Atom 
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

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  active: boolean;
  angleDeg: number;
}

// 3D Rutherford Scene
interface Rutherford3DProps {
  modelType: 'rutherford' | 'thomson';
  selectedFoil: FoilMaterial;
  beamEnergyMeV: number;
  beamIntensity: number;
  isPlaying: boolean;
  onParticleScattered: (angleDeg: number) => void;
}

function RutherfordChamber3D({
  modelType,
  selectedFoil,
  beamEnergyMeV,
  beamIntensity,
  isPlaying,
  onParticleScattered,
}: Rutherford3DProps) {
  const particlesRef = useRef<THREE.Group>(null);
  const flashesRef = useRef<THREE.Group>(null);

  const particleCount = 60;
  const particles = useMemo<Particle3D[]>(() => {
    return Array.from({ length: particleCount }, () => ({
      x: -4.5,
      y: (Math.random() - 0.5) * 1.6,
      z: (Math.random() - 0.5) * 1.6,
      vx: 0.12,
      vy: 0,
      vz: 0,
      active: false,
      angleDeg: 0,
    }));
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const maxAllowed = Math.ceil((beamIntensity / 100) * particleCount);

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];
      const mesh = particlesRef.current?.children[i] as THREE.Mesh;
      if (!mesh) continue;

      if (i < maxAllowed) {
        mesh.visible = true;

        if (!p.active) {
          // Initialize particle flight from collimator
          p.x = -4.5;
          p.y = (Math.random() - 0.5) * 1.6;
          p.z = (Math.random() - 0.5) * 1.6;
          p.vx = 0.12 + (beamEnergyMeV / 10) * 0.05;
          p.vy = 0;
          p.vz = 0;
          p.active = true;
          p.angleDeg = 0;
        }

        // Particle dynamics near target foil (x ≈ 0)
        if (p.active) {
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;

          // Coulomb interaction near gold nucleus at center (0,0,0)
          if (modelType === 'rutherford') {
            const distSq = p.x * p.x + p.y * p.y + p.z * p.z;
            const dist = Math.sqrt(distSq);

            if (dist < 1.2 && p.x < 0.6) {
              // Repulsive Coulomb force proportional to Z (atomic number) and 1/r^2
              const force = (selectedFoil.atomicNumberZ * 0.002) / (distSq + 0.04);
              p.vx += (p.x / dist) * force;
              p.vy += (p.y / dist) * force;
              p.vz += (p.z / dist) * force;
            }
          }
          // Thomson model: no deflection, passes straight through

          // Detect hit on cylindrical detector screen (radius ≈ 4.0)
          const radFromCenter = Math.sqrt(p.x * p.x + p.z * p.z);
          if (radFromCenter >= 4.0 || p.x > 4.5 || Math.abs(p.y) > 3.0) {
            // Calculate final scattering angle relative to forward beam (+x axis)
            const angle = Math.atan2(Math.sqrt(p.y * p.y + p.z * p.z), p.x) * (180 / Math.PI);
            onParticleScattered(angle);

            // Reset particle
            p.active = false;
          }

          mesh.position.set(p.x, p.y, p.z);
        }
      } else {
        mesh.visible = false;
      }
    }
  });

  return (
    <group>
      {/* 3D CYLINDRICAL ZINC SULFIDE DETECTOR SCREEN (360°) */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[4.2, 4.2, 3.2, 48, 1, true]} />
        <meshStandardMaterial
          color="#15803d"
          emissive="#166534"
          emissiveIntensity={0.2}
          side={THREE.DoubleSide}
          roughness={0.6}
        />
      </mesh>

      {/* DETECTOR SCREEN SUPPORTS */}
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[4.3, 4.3, 0.2, 48]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[4.3, 4.3, 0.2, 48]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>

      {/* 3D ALPHA EMITTER GUN (Lead Collimator Block) */}
      <group position={[-5.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.2, 1.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Collimator Gun Barrel */}
        <mesh position={[0.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
        <Html position={[0, 1.0, 0]} center>
          <div className="bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            مدفع جسيمات ألفا (Radium-226)
          </div>
        </Html>
      </group>

      {/* 3D GOLD / TARGET FOIL LATTICE (Center at x=0) */}
      <group position={[0, 0, 0]}>
        {/* Foil Sheet */}
        <mesh>
          <boxGeometry args={[0.08, 2.8, 2.8]} />
          <meshStandardMaterial
            color={selectedFoil.color}
            metalness={0.9}
            roughness={0.15}
            opacity={0.75}
            transparent
          />
        </mesh>

        {/* Central Atomic Nucleus (Rutherford Model) */}
        {modelType === 'rutherford' ? (
          <group>
            {/* Tiny Dense Positive Nucleus */}
            <mesh>
              <sphereGeometry args={[0.28, 24, 24]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.8} />
            </mesh>
            {/* Repulsive Positive Electric Field Halo */}
            <mesh>
              <sphereGeometry args={[0.9, 16, 16]} />
              <meshBasicMaterial color="#f87171" opacity={0.18} transparent wireframe />
            </mesh>
            <Html position={[0, 0.6, 0]} center>
              <div className="bg-slate-900/90 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/40 pointer-events-none whitespace-nowrap shadow-lg">
                نواة موجبة كثيفة (Z={selectedFoil.atomicNumberZ})
              </div>
            </Html>
          </group>
        ) : (
          /* Thomson Plum Pudding Model (Diffuse sphere) */
          <group>
            <mesh>
              <sphereGeometry args={[1.2, 24, 24]} />
              <meshBasicMaterial color="#38bdf8" opacity={0.25} transparent />
            </mesh>
            {/* Embedded Electrons */}
            {[-0.5, 0, 0.5].map((off, idx) => (
              <mesh key={`elec-${idx}`} position={[off * 0.7, off * 0.5, off * 0.3]}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.5} />
              </mesh>
            ))}
            <Html position={[0, 0.7, 0]} center>
              <div className="bg-slate-900/90 text-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-sky-500/40 pointer-events-none whitespace-nowrap shadow-lg">
                نموذج طومسون (شحنة موزعة بانتظام)
              </div>
            </Html>
          </group>
        )}
      </group>

      {/* 3D ALPHA PARTICLES STREAM */}
      <group ref={particlesRef}>
        {Array.from({ length: particleCount }).map((_, i) => (
          <mesh key={`alpha-${i}`} visible={false}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#fde047" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function RutherfordScatteringSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);

  // States
  const [modelType, setModelType] = useState<'rutherford' | 'thomson'>('rutherford');
  const [selectedFoil, setSelectedFoil] = useState<FoilMaterial>(FOIL_MATERIALS[0]);
  const [beamEnergyMeV, setBeamEnergyMeV] = useState<number>(5.5); // 5.5 MeV standard alpha energy
  const [beamIntensity, setBeamIntensity] = useState<number>(75);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Scattering Counters
  const [totalFired, setTotalFired] = useState<number>(0);
  const [forwardDeflected, setForwardDeflected] = useState<number>(0); // < 45 deg
  const [mediumDeflected, setMediumDeflected] = useState<number>(0); // 45 - 90 deg
  const [backScattered, setBackScattered] = useState<number>(0); // > 90 deg (Rutherford revelation)

  // Quiz State
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Closest approach distance: d_min = (1 / 4pi eps0) * (2 * Z * e^2) / E_k
  const closestApproachFm = useMemo(() => {
    // In femtometers (10^-15 m)
    const dmin = (1.44 * 2 * selectedFoil.atomicNumberZ) / beamEnergyMeV;
    return +dmin.toFixed(2);
  }, [selectedFoil, beamEnergyMeV]);

  const handleParticleScattered = (angleDeg: number) => {
    setTotalFired((prev) => prev + 1);
    if (angleDeg < 45) {
      setForwardDeflected((prev) => prev + 1);
    } else if (angleDeg <= 90) {
      setMediumDeflected((prev) => prev + 1);
    } else {
      setBackScattered((prev) => prev + 1);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
  };

  const handleResetCounters = () => {
    setTotalFired(0);
    setForwardDeflected(0);
    setMediumDeflected(0);
    setBackScattered(0);
  };

  const handleResetCamera = () => {
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
              <div className="p-3 bg-gradient-to-br from-yellow-500 via-amber-600 to-red-600 rounded-2xl shadow-lg shadow-yellow-500/20">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-200 to-red-400 bg-clip-text text-transparent">
                  تشتت رذرفورد واكتشاف النواة الذرية ثلاثية الأبعاد (3D)
                </h1>
                <p className="text-sm text-slate-400">
                  إطلاق جسيمات ألفا \(\alpha\) نحو رقائق المعادن وكشف النواة الذرية ذات الكثافة الهائلة
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
              onClick={handleResetCamera}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              إعادة ضبط الكاميرا
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
              <span className="text-xs text-slate-400">ارتداد خلفي نادراً (&gt; 90°)</span>
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
                {modelType === 'rutherford' ? 'نموذج رذرفورد النووي' : 'نموذج طومسون (فطيرة البرقوق)'}
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
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl relative">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Atom className="w-4 h-4 text-yellow-400" />
                      شاشة كبريتيد الخارصين الأسطوانية وتشتت ألفا ثلاثية الأبعاد (3D)
                    </CardTitle>
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 bg-yellow-500/10">
                      {selectedFoil.nameAr}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0 h-[440px] bg-slate-950 relative">
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
                        onParticleScattered={handleParticleScattered}
                      />
                      <OrbitControls
                        ref={controlsRef}
                        enablePan={true}
                        enableZoom={true}
                        minDistance={4}
                        maxDistance={18}
                      />
                    </Canvas>

                    {/* 3D Controls Helper */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>اسحب للتدوير 360° حول كاشف الزنك • قرّب لمعاينة النواة</span>
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
                          }}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                            modelType === 'thomson'
                              ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10'
                              : 'bg-slate-800/60 border-slate-700 text-slate-400'
                          }`}
                        >
                          نموذج طومسون (فطيرة البرقوق)
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

          {/* TAB 2: Theory */}
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
                  <p className="text-xs text-slate-400">
                    عدد الجسيمات المتشتتة يتناسب عكسياً مع القوة الرابعة لجيب نصف زاوية التشتت \(\sin^4(\theta/2)\).
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">2. أقرب مسافة اقتراب للنواة</h4>
                  <p className="text-sm font-mono text-yellow-300">d_min = (1 / 4πε₀) · (2 Z e² / Ek)</p>
                  <p className="text-xs text-slate-400">
                    المسافة التي تتحول عندها كل طاقة الحركة لجسيم ألفا المرتد 180° إلى طاقة وضع كهربائية كولومية.
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
