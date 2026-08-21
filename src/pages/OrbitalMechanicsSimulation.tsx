import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Cylinder, Sphere, Box, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Rocket, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, Sparkles, BookOpen, Layers, Zap, Compass, Eye, ShieldAlert, Globe 
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

interface MissionProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  r1Km: number; // LEO radius (km)
  r2Km: number; // Target radius (km)
  targetNameAr: string;
  targetColor: string;
}

const MISSIONS: MissionProfile[] = [
  { id: 'leo-to-geo', nameAr: 'من المدار المنخفض إلى المدار الثابت (LEO ➔ GEO)', nameEn: 'LEO to GEO', r1Km: 6700, r2Km: 42164, targetNameAr: 'المدار الثابت GEO', targetColor: '#38bdf8' },
  { id: 'earth-to-moon', nameAr: 'رحلة مدار القمر (Apollo Earth-Moon)', nameEn: 'Earth to Moon', r1Km: 6700, r2Km: 384400, targetNameAr: 'القمر (Moon)', targetColor: '#e2e8f0' },
  { id: 'earth-to-mars', nameAr: 'الانتقال بين الكواكب (Earth ➔ Mars)', nameEn: 'Earth to Mars', r1Km: 149.6e6, r2Km: 227.9e6, targetNameAr: 'المريخ (Mars)', targetColor: '#f97316' },
];

const G = 6.67430e-11;
const EARTH_MASS_KG = 5.972e24;
const MU_EARTH = G * EARTH_MASS_KG; // Standard gravitational parameter ~ 3.986e14 m^3/s^2

type FlightPhase = 'orbit_1' | 'transfer' | 'orbit_2';

// 3D Orbital Scene
interface Orbital3DProps {
  mission: MissionProfile;
  phase: FlightPhase;
  isPlaying: boolean;
}

function OrbitalMechanics3DScene({ mission, phase, isPlaying }: Orbital3DProps) {
  const earthRef = useRef<THREE.Group>(null);
  const probeRef = useRef<THREE.Group>(null);
  const angleRef = useRef<number>(0);

  // Scaled radii for 3D visualization
  const r1_3D = 2.0;
  const r2_3D = 4.8;
  const a_transfer_3D = (r1_3D + r2_3D) / 2;
  const c_focus = a_transfer_3D - r1_3D; // ellipse offset

  useFrame((state, delta) => {
    if (!isPlaying) return;

    // Rotate Earth
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.005;
    }

    // Spacecraft Trajectory Animation
    if (probeRef.current) {
      if (phase === 'orbit_1') {
        angleRef.current += 0.03;
        const px = Math.cos(angleRef.current) * r1_3D;
        const pz = Math.sin(angleRef.current) * r1_3D;
        probeRef.current.position.set(px, 0, pz);
      } else if (phase === 'transfer') {
        // Elliptical trajectory from angle 0 to PI
        angleRef.current += 0.015;
        const e = (r2_3D - r1_3D) / (r2_3D + r1_3D);
        const r = (a_transfer_3D * (1 - e * e)) / (1 + e * Math.cos(angleRef.current));
        const px = Math.cos(angleRef.current) * r;
        const pz = Math.sin(angleRef.current) * r;
        probeRef.current.position.set(px, 0, pz);
      } else if (phase === 'orbit_2') {
        angleRef.current += 0.012;
        const px = Math.cos(angleRef.current) * r2_3D;
        const pz = Math.sin(angleRef.current) * r2_3D;
        probeRef.current.position.set(px, 0, pz);
      }
    }
  });

  return (
    <group>
      {/* 3D CENTRAL BODY: PLANET EARTH */}
      <group ref={earthRef}>
        <mesh>
          <sphereGeometry args={[1.0, 32, 32]} />
          <meshStandardMaterial color="#2563eb" roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Continents / Landmass Highlights */}
        <mesh>
          <sphereGeometry args={[1.01, 16, 16]} />
          <meshStandardMaterial color="#16a34a" wireframe opacity={0.3} transparent />
        </mesh>
        {/* Blue Atmosphere Glow */}
        <mesh>
          <sphereGeometry args={[1.12, 32, 32]} />
          <meshBasicMaterial color="#38bdf8" opacity={0.2} transparent side={THREE.BackSide} />
        </mesh>
        <Html position={[0, -1.3, 0]} center>
          <div className="bg-slate-900/90 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            كوكب الأرض
          </div>
        </Html>
      </group>

      {/* ORBIT 1 TRAJECTORY (Inner Circle LEO) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r1_3D - 0.02, r1_3D + 0.02, 64]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.6} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* HOHMANN TRANSFER ORBIT (Elliptical Path in Gold) */}
      <group position={[-c_focus, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[a_transfer_3D - 0.025, a_transfer_3D + 0.025, 64]} />
          <meshBasicMaterial color="#f59e0b" opacity={phase === 'transfer' ? 0.9 : 0.4} transparent side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ORBIT 2 TRAJECTORY (Outer Target Orbit) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r2_3D - 0.02, r2_3D + 0.02, 64]} />
        <meshBasicMaterial color="#a855f7" opacity={0.6} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* DESTINATION TARGET NODE */}
      <group position={[-r2_3D, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={mission.targetColor} metalness={0.5} roughness={0.3} />
        </mesh>
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-slate-900/90 text-purple-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-purple-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            {mission.targetNameAr}
          </div>
        </Html>
      </group>

      {/* 3D SPACECRAFT PROBE WITH THRUSTER */}
      <group ref={probeRef} position={[r1_3D, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.35]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Solar Panels */}
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.35, 0.02, 0.2]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.35, 0.02, 0.2]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        {/* Rocket Plume during Maneuver */}
        {phase === 'transfer' && (
          <group position={[0, 0, -0.3]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.1, 0.4, 12]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
            <pointLight color="#f97316" intensity={3} distance={2} />
          </group>
        )}
        <Html position={[0, 0.45, 0]} center>
          <div className="bg-slate-900/90 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            مركبة الفضاء 🚀
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function OrbitalMechanicsSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);

  // States
  const [selectedMission, setSelectedMission] = useState<MissionProfile>(MISSIONS[0]);
  const [phase, setPhase] = useState<FlightPhase>('orbit_1');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Quiz States
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Hohmann Transfer Astrodynamics Calculations
  const r1_m = selectedMission.r1Km * 1000;
  const r2_m = selectedMission.r2Km * 1000;
  const a_transfer_m = (r1_m + r2_m) / 2;

  // Orbital velocities in m/s (Vis-Viva equation: v^2 = mu * (2/r - 1/a))
  const v1 = Math.sqrt(MU_EARTH / r1_m); // Circular LEO velocity
  const v2 = Math.sqrt(MU_EARTH / r2_m); // Circular Target velocity
  const v_transfer_periapsis = Math.sqrt(MU_EARTH * (2 / r1_m - 1 / a_transfer_m));
  const v_transfer_apoapsis = Math.sqrt(MU_EARTH * (2 / r2_m - 1 / a_transfer_m));

  // Required Delta-V (Δv) for the 2 burns
  const deltaV1 = +(v_transfer_periapsis - v1).toFixed(1); // Injection burn at periapsis
  const deltaV2 = +(v2 - v_transfer_apoapsis).toFixed(1); // Circularization burn at apoapsis
  const totalDeltaV = +(deltaV1 + deltaV2).toFixed(1);

  // Transfer Time: T_transfer = pi * sqrt(a^3 / mu)
  const transferTimeHours = +( (Math.PI * Math.sqrt(Math.pow(a_transfer_m, 3) / MU_EARTH)) / 3600 ).toFixed(1);

  const handleExecuteBurn1 = () => {
    setPhase('transfer');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleExecuteBurn2 = () => {
    setPhase('orbit_2');
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
  };

  const handleResetFlight = () => {
    setPhase('orbit_1');
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
              <div className="p-3 bg-gradient-to-br from-sky-500 via-indigo-600 to-amber-500 rounded-2xl shadow-lg shadow-sky-500/20">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-sky-300 via-amber-200 to-purple-300 bg-clip-text text-transparent">
                  ميكانيكا المدارات ومناورة هوهمان ثلاثية الأبعاد (3D Orbital)
                </h1>
                <p className="text-sm text-slate-400">
                  تخطيط مناورات الدفع الصاروخي والانتقال الإهليلجي بين المدارات ومعادلة فيس-فيفا
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
              onClick={handleResetFlight}
              className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="w-4 h-4 ml-1 text-sky-400" />
              إعادة ضبط المسار
            </Button>
          </div>
        </div>

        {/* Live Astrodynamics Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">دفع الحقن الأول (Δv₁)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">+{deltaV1} m/s</p>
              <span className="text-[10px] text-slate-500">عند الحضيض (LEO)</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">دفع الاستقرار الثاني (Δv₂)</span>
              <p className="text-lg font-bold text-purple-400 font-mono">+{deltaV2} m/s</p>
              <span className="text-[10px] text-slate-500">عند الأوج (GEO)</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">مجموع الدفع الكلي (Δv_total)</span>
              <p className="text-lg font-bold text-cyan-400 font-mono">{totalDeltaV} m/s</p>
              <span className="text-[10px] text-slate-500 font-mono">{(totalDeltaV / 1000).toFixed(2)} km/s</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">زمن الرحلة الإهليلجية</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{transferTimeHours} h</p>
              <span className="text-[10px] text-slate-500">نصف الزمن الدوري</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">مرحلة الرحلة الحالية</span>
              <p className="text-xs font-bold text-slate-200 mt-1">
                {phase === 'orbit_1' && '1. المدار المنخفض LEO'}
                {phase === 'transfer' && '2. مسار هوهمان الإهليلجي'}
                {phase === 'orbit_2' && '3. المدار المستهدف النهائي ✓'}
              </p>
              <span className="text-[10px] text-slate-500">{selectedMission.nameEn}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">السرعة المدارية الابتدائية</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{v1.toFixed(0)} m/s</p>
              <span className="text-[10px] text-slate-500 font-mono">{(v1 * 3.6).toFixed(0)} km/h</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Activity className="w-4 h-4" />
              مسارات الفضاء المدارية ثلاثية الأبعاد (3D View)
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              معادلة فيس-فيفا وقوانين كبلر
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
                      <Globe className="w-4 h-4 text-sky-400" />
                      محاكي مدارات الفضاء ثلاثي الأبعاد (3D Space Flight Simulation)
                    </CardTitle>
                    <Badge variant="outline" className="border-sky-500/50 text-sky-300 bg-sky-500/10">
                      {selectedMission.nameAr.split(' ')[0]}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0 h-[440px] bg-slate-950 relative">
                    <Canvas camera={{ position: [0, 8.5, 9.5], fov: 45 }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[12, 10, 10]} intensity={1.2} />
                      <directionalLight position={[-12, -5, -10]} intensity={0.3} color="#38bdf8" />
                      <OrbitalMechanics3DScene
                        mission={selectedMission}
                        phase={phase}
                        isPlaying={isPlaying}
                      />
                      <OrbitControls
                        ref={controlsRef}
                        enablePan={true}
                        enableZoom={true}
                        minDistance={4}
                        maxDistance={22}
                      />
                    </Canvas>

                    {/* 3D Controls Helper */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>اسحب للتدوير 360° في الفضاء المداري • قرّب لمعاينة المركبة والأرض</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Controls Column */}
              <div className="space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800">
                    <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-sky-400" />
                      لوحة قيادة المهمة الفضائية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Mission Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر ملف المهمة الفضائية</label>
                      <div className="space-y-1.5">
                        {MISSIONS.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              setSelectedMission(m);
                              handleResetFlight();
                            }}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedMission.id === m.id
                                ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{m.nameAr}</div>
                            <div className="text-[10px] opacity-75">نصف القطر: {m.r1Km.toLocaleString()} ➔ {m.r2Km.toLocaleString()} km</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Flight Maneuver Execution Buttons */}
                    <div className="space-y-2 pt-2">
                      <Button
                        disabled={phase !== 'orbit_1'}
                        onClick={handleExecuteBurn1}
                        className={`w-full font-bold text-xs ${
                          phase === 'orbit_1'
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        1. إشعال المحرك الأول (Burn 1: +{deltaV1} m/s) 🚀
                      </Button>

                      <Button
                        disabled={phase !== 'transfer'}
                        onClick={handleExecuteBurn2}
                        className={`w-full font-bold text-xs ${
                          phase === 'transfer'
                            ? 'bg-purple-600 hover:bg-purple-500 text-white'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        2. إشعال المحرك الثاني (Burn 2: +{deltaV2} m/s) ✨
                      </Button>

                      {phase === 'orbit_2' && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-300 font-bold">
                          ✓ وصلت المركبة بنجاح إلى المدار المستهدف!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-sky-300">ميكانيكا المدارات الفضائية ومناورة هوهمان (1925)</h3>
              <p>
                ابتكر المهندس الألماني والتر هوهمان أكثر الطرق كفاءة واقتصاداً في استهلاك وقود الصواريخ للانتقال بين مدارين دائريين متحدي المركز حول جسم مركزي، باستخدام مدار بيضاوي انتقالي (Hohmann Transfer Orbit).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. معادلة فيس-فيفا (Vis-Viva Equation)</h4>
                  <p className="text-sm font-mono text-sky-300">v² = GM · (2/r - 1/a)</p>
                  <p className="text-xs text-slate-400">
                    تحدد السرعة المدارية للمركبة عند أي بعد r عن المركز بالاعتماد على نصف المحور الأكبر a للمدار.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. شرط الكفاءة القصوى</h4>
                  <p className="text-xs text-slate-400">
                    تتم عمليتا الدفع الصاروخي مماستين لاتجاه الحركة (Tangent) عند نقطتي الحضيض والأوج، مما يعظم تأثير أوبرث (Oberth Effect).
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
                  اختبار مفاهيم ديناميكا الفضاء
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: لماذا تعتبر مناورة هوهمان (Hohmann Transfer) هي الخيار القياسي لرحلات الفضاء بين الكواكب والمدارات؟
                </p>

                <div className="space-y-2">
                  {[
                    { id: 0, text: 'لأنها أسرع مناورة في زمن الوصول.' },
                    { id: 1, text: 'لأنها تستهلك أقل كمية ممكنة من الوقود وتوفر أدنى قيمة للتغير في السرعة (Δv).' },
                    { id: 2, text: 'لأنها لا تحتاج إلى أي توجيه أو حواسيب.' },
                    { id: 3, text: 'لأنها تسير في خط مستقيم نحو الهدف.' },
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
                        <span>إجابة صحيحة ومثالية! مناورة هوهمان هي الحل الأمثل لاقتصاد الوقود والـ Δv لنقل الأقمار الصناعية والمركبات الفضائية بين المدارات الدائرية.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. ميزة مناورة هوهمان الأساسية هي الاقتصاد الفائق في استهلاك الوقود ودفع الصاروخ.</span>
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
