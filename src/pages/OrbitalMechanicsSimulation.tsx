import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Rocket, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, BookOpen, Globe2, Maximize2, Minimize2, 
  Volume2, VolumeX, Download, Lightbulb, Target, CheckSquare, Zap 
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

const MU_EARTH = 3.986004418e14; // m³/s² (G * M_earth)
const R_EARTH_KM = 6371; // Earth radius in km

interface OrbitPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  perigeeAltKm: number;
  apogeeAltKm: number;
  description: string;
}

const PRESETS: OrbitPreset[] = [
  { id: 'leo', nameAr: 'مدار أرضي منخفض (LEO - محطة ISS)', nameEn: 'LEO', perigeeAltKm: 420, apogeeAltKm: 420, description: 'مدار المحطة الفضائية الدولية ومقر معظم الأقمار' },
  { id: 'geo', nameAr: 'مدار جغرافي ثابت (GEO)', nameEn: 'GEO', perigeeAltKm: 35786, apogeeAltKm: 35786, description: 'مدار أقمار الاتصالات والطقس الثابتة فوق خط الاستواء' },
  { id: 'gto', nameAr: 'مدار النقل الثابت (GTO Transfer)', nameEn: 'GTO', perigeeAltKm: 420, apogeeAltKm: 35786, description: 'مسار هوهمان الإهليلجي للانتقال من LEO إلى GEO' },
  { id: 'molniya', nameAr: 'مدار مولنيا عالي الإهليلجية', nameEn: 'Molniya', perigeeAltKm: 600, apogeeAltKm: 39800, description: 'مدار روسي لتغطية المناطق القطبية الشمالية' },
];

interface Orbital3DProps {
  currentR_Km: number;
  semiMajorAxisKm: number;
  eccentricity: number;
  trueAnomalyRad: number;
  isPlaying: boolean;
}

function Orbital3DScene({
  currentR_Km,
  semiMajorAxisKm,
  eccentricity,
  trueAnomalyRad,
  isPlaying,
}: Orbital3DProps) {
  const earthRef = useRef<THREE.Group>(null);
  const satelliteRef = useRef<THREE.Group>(null);

  const scaleDistance = (km: number) => {
    return 1.4 + (km / 42000) * 4.5;
  };

  const currentR3D = scaleDistance(currentR_Km);

  // Orbit path vertices
  const orbitPoints = useMemo(() => {
    const pts = [];
    const pKm = semiMajorAxisKm * (1 - eccentricity * eccentricity);
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
      const r = pKm / (1 + eccentricity * Math.cos(angle));
      const r3D = scaleDistance(r);
      pts.push(new THREE.Vector3(Math.cos(angle) * r3D, 0, Math.sin(angle) * r3D));
    }
    return pts;
  }, [semiMajorAxisKm, eccentricity]);

  const orbitLineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(orbitPoints);
  }, [orbitPoints]);

  useFrame(() => {
    if (!isPlaying) return;

    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }

    if (satelliteRef.current) {
      const sx = Math.cos(trueAnomalyRad) * currentR3D;
      const sz = Math.sin(trueAnomalyRad) * currentR3D;
      satelliteRef.current.position.set(sx, 0, sz);
      satelliteRef.current.rotation.y = -trueAnomalyRad;
    }
  });

  return (
    <group>
      {/* 3D EARTH GLOBE */}
      <group ref={earthRef}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 36, 36]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} metalness={0.1} />
        </mesh>
        {/* Continents overlay ring */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.22, 16, 16]} />
          <meshBasicMaterial color="#10b981" wireframe opacity={0.25} transparent />
        </mesh>
      </group>

      {/* ORBITAL PATH TRAJECTORY */}
      <line geometry={orbitLineGeometry}>
        <lineBasicMaterial color="#38bdf8" opacity={0.8} transparent />
      </line>

      {/* 3D SATELLITE */}
      <group ref={satelliteRef}>
        <mesh>
          <boxGeometry args={[0.2, 0.12, 0.12]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Solar Panels */}
        <mesh position={[0.25, 0, 0]}>
          <boxGeometry args={[0.3, 0.02, 0.16]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.8} />
        </mesh>
        <mesh position={[-0.25, 0, 0]}>
          <boxGeometry args={[0.3, 0.02, 0.16]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.8} />
        </mesh>
        <pointLight color="#38bdf8" intensity={1.5} distance={2} />
        <Html position={[0, 0.45, 0]} center>
          <div className="bg-slate-900/90 text-sky-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-sky-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            القمر الصناعي ({currentR_Km.toLocaleString()} كم)
          </div>
        </Html>
      </group>
    </group>
  );
}

export default function OrbitalMechanicsSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [selectedPreset, setSelectedPreset] = useState<OrbitPreset>(PRESETS[0]);
  const [perigeeAltKm, setPerigeeAltKm] = useState<number>(420);
  const [apogeeAltKm, setApogeeAltKm] = useState<number>(420);
  const [trueAnomalyDeg, setTrueAnomalyDeg] = useState<number>(0);
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

  // Orbital Calculations
  const rPerigeeKm = R_EARTH_KM + perigeeAltKm;
  const rApogeeKm = R_EARTH_KM + apogeeAltKm;
  const semiMajorAxisKm = (rPerigeeKm + rApogeeKm) / 2;
  const eccentricity = Math.max(0, (rApogeeKm - rPerigeeKm) / (rApogeeKm + rPerigeeKm));

  const orbitalPeriodMin = useMemo(() => {
    const aMeters = semiMajorAxisKm * 1000;
    const periodSec = 2 * Math.PI * Math.sqrt(Math.pow(aMeters, 3) / MU_EARTH);
    return +(periodSec / 60).toFixed(1);
  }, [semiMajorAxisKm]);

  const trueAnomalyRad = (trueAnomalyDeg * Math.PI) / 180;
  const pKm = semiMajorAxisKm * (1 - eccentricity * eccentricity);
  const currentR_Km = pKm / (1 + eccentricity * Math.cos(trueAnomalyRad));
  const currentAltKm = +(currentR_Km - R_EARTH_KM).toFixed(0);

  const currentVelocityKms = useMemo(() => {
    const rMeters = currentR_Km * 1000;
    const aMeters = semiMajorAxisKm * 1000;
    const vMs = Math.sqrt(MU_EARTH * (2 / rMeters - 1 / aMeters));
    return +(vMs / 1000).toFixed(2);
  }, [currentR_Km, semiMajorAxisKm]);

  // Hohmann Delta-V from LEO (420km) to GEO (35786km)
  const deltaV_LEO_to_GTO = useMemo(() => {
    const r1 = (R_EARTH_KM + 420) * 1000;
    const r2 = (R_EARTH_KM + 35786) * 1000;
    const vLEO = Math.sqrt(MU_EARTH / r1);
    const vTransferPerigee = Math.sqrt(MU_EARTH * (2 / r1 - 2 / (r1 + r2)));
    return +((vTransferPerigee - vLEO) / 1000).toFixed(2); // km/s ≈ 2.45 km/s
  }, []);

  const deltaV_GTO_to_GEO = useMemo(() => {
    const r1 = (R_EARTH_KM + 420) * 1000;
    const r2 = (R_EARTH_KM + 35786) * 1000;
    const vGEO = Math.sqrt(MU_EARTH / r2);
    const vTransferApogee = Math.sqrt(MU_EARTH * (2 / r2 - 2 / (r1 + r2)));
    return +((vGEO - vTransferApogee) / 1000).toFixed(2); // km/s ≈ 1.47 km/s
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const meanMotionDegPerSec = (360 / (orbitalPeriodMin * 60)) * 40;
      setTrueAnomalyDeg((a) => (a + meanMotionDegPerSec) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, orbitalPeriodMin]);

  // Mission check
  useEffect(() => {
    // Mission 1: Circular LEO (< 500 km, ecc < 0.02)
    if (perigeeAltKm <= 500 && apogeeAltKm <= 500 && eccentricity < 0.02 && !mission1Completed) {
      setMission1Completed(true);
      labSound.playSuccessChime();
    }
    // Mission 2: Hohmann Transfer GTO
    if (perigeeAltKm <= 600 && apogeeAltKm >= 34000 && !mission2Completed) {
      setMission2Completed(true);
      labSound.playSuccessChime();
    }
    // Mission 3: Circular GEO (35786 km, ecc < 0.02)
    if (Math.abs(perigeeAltKm - 35786) < 1000 && Math.abs(apogeeAltKm - 35786) < 1000 && eccentricity < 0.02 && !mission3Completed) {
      setMission3Completed(true);
      labSound.playSuccessChime();
    }
  }, [perigeeAltKm, apogeeAltKm, eccentricity, mission1Completed, mission2Completed, mission3Completed]);

  const handleApplyPreset = (p: OrbitPreset) => {
    setSelectedPreset(p);
    setPerigeeAltKm(p.perigeeAltKm);
    setApogeeAltKm(p.apogeeAltKm);
    labSound.playRocketBurst();
  };

  const setCameraView = (view: 'default' | 'top' | 'satellite' | 'earth') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'default') {
      controls.object.position.set(0, 6.0, 10.0);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      controls.object.position.set(0, 13.0, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'satellite') {
      controls.object.position.set(2.5, 1.5, 3.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'earth') {
      controls.object.position.set(0, 1.0, 3.2);
      controls.target.set(0, 0, 0);
    }
    controls.update();
    labSound.playLaserPulse(650);
  };

  const toggleSound = () => {
    const muted = labSound.toggleMute();
    setIsMuted(muted);
  };

  const handleExportDataCSV = () => {
    const headers = 'Orbit,PerigeeAlt(km),ApogeeAlt(km),Eccentricity,Period(min),CurrentAlt(km),Velocity(km/s),DeltaV_Hohmann1(km/s),DeltaV_Hohmann2(km/s)\n';
    const row = `${selectedPreset.nameEn},${perigeeAltKm},${apogeeAltKm},${eccentricity.toFixed(3)},${orbitalPeriodMin},${currentAltKm},${currentVelocityKms},${deltaV_LEO_to_GTO},${deltaV_GTO_to_GEO}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orbital_telemetry_${selectedPreset.id}.csv`;
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
              <div className="p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/20">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                  ميكانيكا المدارات الفضائية ومناورات هوهمان ثلاثية الأبعاد (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  حسابات كبلر، مناورات الدفع الصاروخي \(\Delta v\)، والانتقال بين المدارات الأرضية LEO و GEO
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
              تصدير الملاحة (CSV)
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

        {/* Live Orbit Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الارتفاع اللحظي (Alt)</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{Number(currentAltKm).toLocaleString()} km</p>
              <span className="text-[10px] text-slate-500">فوق سطح الأرض</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">السرعة المدارية (v)</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{currentVelocityKms} km/s</p>
              <span className="text-[10px] text-slate-500 font-mono">{(currentVelocityKms * 3600).toFixed(0)} km/h</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">الزمن الدوري للمدار (T)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{orbitalPeriodMin} min</p>
              <span className="text-[10px] text-slate-500">{(orbitalPeriodMin / 60).toFixed(2)} ساعة للدورة</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">اللامركزية المدارية (e)</span>
              <p className="text-lg font-bold text-purple-400 font-mono">{eccentricity.toFixed(3)}</p>
              <span className="text-[10px] text-slate-500">{eccentricity === 0 ? 'مدار دائري تام' : 'مدار إهليلجي'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حضيض / أوج (Rp / Ra)</span>
              <p className="text-xs font-bold text-slate-200 mt-1 font-mono">{perigeeAltKm} / {apogeeAltKm} km</p>
              <span className="text-[10px] text-slate-500">نقاط المدار القصوى</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">دفع هوهمان (LEO ⟶ GEO)</span>
              <p className="text-sm font-bold text-cyan-400 mt-1 font-mono">{(deltaV_LEO_to_GTO + deltaV_GTO_to_GEO).toFixed(2)} km/s</p>
              <span className="text-[10px] text-slate-500">إجمالي الدفع المطلوب</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <Activity className="w-4 h-4" />
              المدار الفضائي ثلاثي الأبعاد (3D Orbit)
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Target className="w-4 h-4" />
              مهام الملاحة الفضائية ({[mission1Completed, mission2Completed, mission3Completed].filter(Boolean).length}/3)
            </TabsTrigger>
            <TabsTrigger value="hohmann" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Rocket className="w-4 h-4" />
              مناورات النقل المداري هوهمان
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              قوانين كبلر وميكانيكا الأجرام
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
                      <Globe2 className="w-4 h-4 text-blue-400" />
                      الأرض والمدار الفضائي ثلاثي الأبعاد (3D Space Environment)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-blue-500/50 text-blue-300 bg-blue-500/10">
                        {selectedPreset.nameAr.split('(')[0]}
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
                    <Canvas camera={{ position: [0, 6.0, 10.0], fov: 45 }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[10, 10, 10]} intensity={1.5} />
                      <directionalLight position={[-10, -5, -10]} intensity={0.3} color="#38bdf8" />
                      <Orbital3DScene
                        currentR_Km={currentR_Km}
                        semiMajorAxisKm={semiMajorAxisKm}
                        eccentricity={eccentricity}
                        trueAnomalyRad={trueAnomalyRad}
                        isPlaying={isPlaying}
                      />
                      <OrbitControls
                        ref={controlsRef}
                        enablePan={true}
                        enableZoom={true}
                        minDistance={3.5}
                        maxDistance={22}
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
                        onClick={() => setCameraView('satellite')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        القمر الصناعي
                      </button>
                      <button
                        onClick={() => setCameraView('earth')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        الأرض
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
                      <Lightbulb className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>
                        💡 وفق قانون كبلر الثاني: سرعة القمر الصناعي تبلغ ذروتها عند الحضيض ({perigeeAltKm} كم) وتصل إلى أدناها عند الأوج ({apogeeAltKm} كم).
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
                      <Rocket className="w-4 h-4 text-blue-400" />
                      إعدادات المدار ومناورات الدفع
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Orbit Presets */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر مداراً قياسياً</label>
                      <div className="space-y-1.5">
                        {PRESETS.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleApplyPreset(p)}
                            className={`w-full p-2.5 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedPreset.id === p.id
                                ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{p.nameAr}</div>
                            <div className="text-[10px] opacity-75">{p.perigeeAltKm}x{p.apogeeAltKm} كم • {p.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Perigee Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">ارتفاع نقطة الحضيض (Perigee Alt)</label>
                        <span className="text-xs font-mono text-cyan-400 font-bold">{perigeeAltKm.toLocaleString()} km</span>
                      </div>
                      <Slider
                        value={[perigeeAltKm]}
                        min={200}
                        max={36000}
                        step={100}
                        onValueChange={(val) => setPerigeeAltKm(Math.min(val[0], apogeeAltKm))}
                        className="py-1"
                      />
                    </div>

                    {/* Apogee Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">ارتفاع نقطة الأوج (Apogee Alt)</label>
                        <span className="text-xs font-mono text-amber-400 font-bold">{apogeeAltKm.toLocaleString()} km</span>
                      </div>
                      <Slider
                        value={[apogeeAltKm]}
                        min={200}
                        max={40000}
                        step={100}
                        onValueChange={(val) => setApogeeAltKm(Math.max(val[0], perigeeAltKm))}
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
                  مهام وتحديات الملاحة الفضائية (Orbital Navigation Missions)
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  أكمل هذه المهام الفضائية لقيادة القمر الصناعي عبر المدارات المختلفة وتطبيق مناورات هوهمان.
                </p>
              </div>

              <div className="space-y-4">
                {/* Mission 1 */}
                <div className={`p-4 rounded-xl border transition-all ${mission1Completed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckSquare className={`w-4 h-4 ${mission1Completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        المهمة 1: وضع القمر في مدار أرضي منخفض LEO دائري ومستقر (&lt; 500 كم)
                      </div>
                      <p className="text-xs text-slate-400">
                        اختر مدار LEO أو اجعل الحضيض والأوج متساويين عند حوالي 420 كم للحفاظ على سرعة مدارية تقارب 7.7 km/s وزمن دوري 90 دقيقة.
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
                        المهمة 2: إشعال مناورة النقل الأولى والانتقال إلى مدار GTO الإهليلجي
                      </div>
                      <p className="text-xs text-slate-400">
                        اختر مدار النقل GTO أو ارفع نقطة الأوج إلى 35,786 كم مع إبقاء الحضيض عند 420 كم لملاحظة مسار النقل الإهليلجي.
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
                        المهمة 3: تدوير المدار في المدار الجغرافي الثابت GEO (35,786 كم)
                      </div>
                      <p className="text-xs text-slate-400">
                        اضبط الحضيض والأوج معاً عند 35,786 كم ليصبح زمن الدورة 24 ساعة تماماً ويثبت القمر فوق نقطة جغرافية واحدة على الأرض.
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

          {/* TAB 3: Hohmann */}
          <TabsContent value="hohmann" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
              <CardTitle className="text-base font-bold text-cyan-300">تفاصيل مناورة هوهمان (Hohmann Transfer Trajectory)</CardTitle>
              <p className="text-xs text-slate-300">
                مناورة هوهمان هي المسار الأكثر كفاءة طاقياً للانتقال بين مدارين دائريين متحدي المركز حول جسم مركزي، وتتطلب إشعالين صاروخيين فقط:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-amber-300 text-sm">الإشعال الأول (Δv1) عند الحضيض في LEO</h4>
                  <p className="text-lg font-bold text-sky-400 font-mono">Δv₁ = +{deltaV_LEO_to_GTO} km/s</p>
                  <p className="text-xs text-slate-400">يرفع نقطة الأوج من 420 كم إلى 35,786 كم للدخول في مدار النقل GTO.</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <h4 className="font-bold text-amber-300 text-sm">الإشعال الثاني (Δv2) عند الأوج في GEO</h4>
                  <p className="text-lg font-bold text-emerald-400 font-mono">Δv₂ = +{deltaV_GTO_to_GEO} km/s</p>
                  <p className="text-xs text-slate-400">يرفع الحضيض إلى 35,786 كم لتدوير المدار وتثبيته في GEO.</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-blue-300">قوانين كبلر والميكانيكا المدارية لنيوتن</h3>
              <p>
                تتحرك جميع الأقمار الصناعية والأجرام الفضائية وفق قوانين كبلر الثلاثة للحركة الكوكبية المدعومة بقانون الجاذبية الكونية لنيوتن.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">1. قانون كبلر الثالث (الزمن الدوري)</h4>
                  <p className="text-sm font-mono text-cyan-300">T² = (4π² / GM) · a³</p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300">2. معادلة السرعة الحية (Vis-Viva Equation)</h4>
                  <p className="text-sm font-mono text-cyan-300">v² = GM · (2/r - 1/a)</p>
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
                  اختبار مفاهيم الميكانيكا المدارية
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: لماذا يستغرق القمر الصناعي في المدار الأرضي المنخفض LEO (400 كم) حوالي 90 دقيقة فقط لإكمال دورة حول الأرض، بينما يستغرق القمر في المدار الثابت GEO (35,786 كم) 24 ساعة كاملة؟
                </p>
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'بسبب قوة محركات القمر الصناعي في LEO.' },
                    { id: 1, text: 'وفق قانون كبلر الثالث، يتناسب مربع الزمن الدوري طردياً مع مكعب نصف المحور الأكبر للمدار (T² ∝ a³).' },
                    { id: 2, text: 'لأن الغلاف الجوي يدفع القمر في LEO بشكل أسرع.' },
                    { id: 3, text: 'لأن كتلة القمر في GEO أكبر بكثير.' },
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
                        <span>إجابة صحيحة ورائعة! قانون كبلر الثالث يحدد أن المدارات الأبعد تمتلك مسافات أطول وسرعات مدارية أبطأ، مما يجعل الزمن الدوري في GEO يعادل 24 ساعة ليتطابق مع دوران الأرض.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. السبب هو قانون كبلر الثالث الذي يربط نصف قطر المدار بالزمن الدوري المداري.</span>
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
