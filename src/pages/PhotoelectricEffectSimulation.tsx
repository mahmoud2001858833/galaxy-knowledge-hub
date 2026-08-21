import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Atom, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, Sparkles, BookOpen, Layers, Sun, Zap, Eye, Maximize2, Minimize2, 
  Volume2, VolumeX, Download, Lightbulb, Target, CheckSquare, BarChart3
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

// Physical Constants
const H_EV_S = 4.135667696e-15; // Planck's constant in eV·s
const C = 299792458; // Speed of light in m/s
const H_J_S = 6.62607015e-34; // Planck's constant in J·s

interface MetalTarget {
  id: string;
  nameAr: string;
  nameEn: string;
  workFunctionEV: number;
  thresholdWlNm: number;
  color: string;
}

const METALS: MetalTarget[] = [
  { id: 'cesium', nameAr: 'السيزيوم (Cs)', nameEn: 'Cesium', workFunctionEV: 2.14, thresholdWlNm: 579, color: '#fef08a' },
  { id: 'potassium', nameAr: 'البوتاسيوم (K)', nameEn: 'Potassium', workFunctionEV: 2.30, thresholdWlNm: 539, color: '#e2e8f0' },
  { id: 'sodium', nameAr: 'الصوديوم (Na)', nameEn: 'Sodium', workFunctionEV: 2.75, thresholdWlNm: 451, color: '#cbd5e1' },
  { id: 'zinc', nameAr: 'الزنك (Zn)', nameEn: 'Zinc', workFunctionEV: 4.31, thresholdWlNm: 288, color: '#94a3b8' },
  { id: 'copper', nameAr: 'النحاس (Cu)', nameEn: 'Copper', workFunctionEV: 4.65, thresholdWlNm: 267, color: '#f97316' },
  { id: 'platinum', nameAr: 'البلاتين (Pt)', nameEn: 'Platinum', workFunctionEV: 5.65, thresholdWlNm: 219, color: '#e2e8f0' },
];

function getWavelengthColor(wl: number): string {
  if (wl < 380) return '#a855f7';
  if (wl < 440) return '#6366f1';
  if (wl < 490) return '#3b82f6';
  if (wl < 530) return '#10b981';
  if (wl < 580) return '#eab308';
  if (wl < 640) return '#f97316';
  return '#ef4444';
}

interface Phototube3DProps {
  wavelengthNm: number;
  intensity: number;
  voltage: number;
  selectedMetal: MetalTarget;
  isPlaying: boolean;
  isEmitting: boolean;
  maxKineticEnergyEV: number;
}

function PhotocellChamber3D({
  wavelengthNm,
  intensity,
  voltage,
  selectedMetal,
  isPlaying,
  isEmitting,
  maxKineticEnergyEV,
}: Phototube3DProps) {
  const beamColor = getWavelengthColor(wavelengthNm);
  const electronsRef = useRef<THREE.Group>(null);
  const photonsRef = useRef<THREE.Group>(null);

  const electronCount = 45;
  const photonCount = 35;

  const electronData = useMemo(() => {
    return Array.from({ length: electronCount }, () => ({
      x: -2.8,
      y: (Math.random() - 0.5) * 1.4,
      z: (Math.random() - 0.5) * 1.4,
      vx: 0.05 + Math.random() * 0.05,
      vy: (Math.random() - 0.5) * 0.015,
      vz: (Math.random() - 0.5) * 0.015,
    }));
  }, [electronCount]);

  const photonData = useMemo(() => {
    return Array.from({ length: photonCount }, () => ({
      x: 0,
      y: 4.2,
      z: (Math.random() - 0.5) * 1.2,
      targetY: (Math.random() - 0.5) * 1.4,
      progress: Math.random(),
      speed: 0.03 + Math.random() * 0.02,
    }));
  }, [photonCount]);

  useFrame(() => {
    if (!isPlaying) return;

    // Photons
    if (photonsRef.current && intensity > 0) {
      const activePhotons = Math.min(photonCount, Math.ceil((intensity / 100) * photonCount));
      for (let i = 0; i < photonCount; i++) {
        const child = photonsRef.current.children[i] as THREE.Mesh;
        if (!child) continue;

        if (i < activePhotons) {
          child.visible = true;
          const p = photonData[i];
          p.progress += p.speed;
          if (p.progress >= 1) {
            p.progress = 0;
            p.z = (Math.random() - 0.5) * 1.2;
            p.targetY = (Math.random() - 0.5) * 1.4;
          }
          child.position.x = THREE.MathUtils.lerp(0, -2.8, p.progress);
          child.position.y = THREE.MathUtils.lerp(3.8, p.targetY, p.progress);
          child.position.z = THREE.MathUtils.lerp(p.z, 0, p.progress);
        } else {
          child.visible = false;
        }
      }
    }

    // Photoelectrons
    if (electronsRef.current) {
      const maxAllowed = isEmitting ? Math.ceil((intensity / 100) * electronCount) : 0;
      const initialVelocityBase = Math.sqrt(Math.max(0.01, maxKineticEnergyEV)) * 0.07;
      const fieldAccel = (voltage / 5.6) * 0.0035;

      for (let i = 0; i < electronCount; i++) {
        const child = electronsRef.current.children[i] as THREE.Mesh;
        if (!child) continue;

        if (i < maxAllowed && isEmitting) {
          child.visible = true;
          const e = electronData[i];

          e.vx += fieldAccel;
          e.x += e.vx;
          e.y += e.vy;
          e.z += e.vz;

          if (e.x >= 2.8 || (e.vx <= 0 && e.x <= -2.8) || Math.abs(e.y) > 1.7 || Math.abs(e.z) > 1.7) {
            e.x = -2.8;
            e.y = (Math.random() - 0.5) * 1.4;
            e.z = (Math.random() - 0.5) * 1.4;
            e.vx = initialVelocityBase * (0.6 + Math.random() * 0.8);
            e.vy = (Math.random() - 0.5) * 0.015;
            e.vz = (Math.random() - 0.5) * 0.015;
          }

          child.position.set(e.x, e.y, e.z);
        } else {
          child.visible = false;
        }
      }
    }
  });

  return (
    <group>
      {/* 3D Glass Tube Envelope */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[2.2, 2.2, 7.2, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#a5f3fc"
          transmission={0.92}
          opacity={0.3}
          transparent
          roughness={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Target Plate (Cathode - Emitter) */}
      <group position={[-2.8, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[1.8, 1.8, 0.2, 32]} />
          <meshStandardMaterial
            color={selectedMetal.color}
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
        <Html position={[0, 2.2, 0]} center>
          <div className="bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            المهبط (كاثود): {selectedMetal.nameAr}
          </div>
        </Html>
      </group>

      {/* Collector Plate (Anode) */}
      <group position={[2.8, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[1.8, 1.8, 0.2, 32]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.15} />
        </mesh>
        <Html position={[0, 2.2, 0]} center>
          <div className="bg-slate-900/90 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            المصعد (أنود جامع)
          </div>
        </Html>
      </group>

      {/* Light Source Lamp */}
      <group position={[0, 4.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.6, 1.2, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <pointLight color={beamColor} intensity={intensity > 0 ? 3.5 : 0} distance={6} />
      </group>

      {/* Light Beam Cone */}
      {intensity > 0 && (
        <mesh position={[-1.4, 2.0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.3, 1.6, 4.0, 24, 1, true]} />
          <meshBasicMaterial
            color={beamColor}
            opacity={Math.min(0.6, (intensity / 100) * 0.6)}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Photons */}
      <group ref={photonsRef}>
        {Array.from({ length: photonCount }).map((_, i) => (
          <mesh key={`photon-${i}`} visible={false}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshBasicMaterial color={beamColor} />
          </mesh>
        ))}
      </group>

      {/* Photoelectrons */}
      <group ref={electronsRef}>
        {Array.from({ length: electronCount }).map((_, i) => (
          <mesh key={`electron-${i}`} visible={false}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function PhotoelectricEffectSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [selectedMetal, setSelectedMetal] = useState<MetalTarget>(METALS[0]);
  const [wavelengthNm, setWavelengthNm] = useState<number>(450);
  const [intensity, setIntensity] = useState<number>(80);
  const [voltage, setVoltage] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Guided Missions Progress
  const [mission1Completed, setMission1Completed] = useState<boolean>(false);
  const [mission2Completed, setMission2Completed] = useState<boolean>(false);
  const [mission3Completed, setMission3Completed] = useState<boolean>(false);

  // Quiz States
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Physical Calculations
  const frequencyHz = (C / (wavelengthNm * 1e-9));
  const photonEnergyEV = (H_EV_S * frequencyHz);
  const maxKineticEnergyEV = Math.max(0, photonEnergyEV - selectedMetal.workFunctionEV);
  const isEmitting = wavelengthNm <= selectedMetal.thresholdWlNm && intensity > 0;
  const stoppingVoltage = isEmitting ? maxKineticEnergyEV : 0;
  const isCurrentFlowing = isEmitting && (voltage >= -stoppingVoltage);
  const photocurrentUA = isCurrentFlowing
    ? +( (intensity * 0.15) * Math.min(1.5, Math.max(0.05, (voltage + stoppingVoltage) / (stoppingVoltage + 0.1))) ).toFixed(2)
    : 0.0;

  // Realtime mission check
  useEffect(() => {
    // Mission 1: Find threshold wavelength (tune wavelength within 10nm of threshold with intensity > 0)
    if (Math.abs(wavelengthNm - selectedMetal.thresholdWlNm) <= 12 && intensity > 20) {
      if (!mission1Completed) {
        setMission1Completed(true);
        labSound.playSuccessChime();
      }
    }
    // Mission 2: Find stopping voltage (set voltage within 0.15V of -stoppingVoltage while emitting)
    if (isEmitting && Math.abs(voltage - (-stoppingVoltage)) <= 0.15 && stoppingVoltage > 0.3) {
      if (!mission2Completed) {
        setMission2Completed(true);
        labSound.playSuccessChime();
      }
    }
    // Mission 3: Test UV light below 300nm on high work function metal (Zinc or Copper)
    if ((selectedMetal.id === 'zinc' || selectedMetal.id === 'copper' || selectedMetal.id === 'platinum') && wavelengthNm <= 280 && isEmitting) {
      if (!mission3Completed) {
        setMission3Completed(true);
        labSound.playSuccessChime();
      }
    }
  }, [wavelengthNm, intensity, voltage, selectedMetal, stoppingVoltage, isEmitting, mission1Completed, mission2Completed, mission3Completed]);

  // Graph Data: Stopping Potential vs Frequency
  const graphData = useMemo(() => {
    const data = [];
    for (let wl = 200; wl <= 650; wl += 25) {
      const f = C / (wl * 1e-9);
      const ePhoton = H_EV_S * f;
      const kMax = Math.max(0, ePhoton - selectedMetal.workFunctionEV);
      data.push({
        wl,
        frequencyPHz: +(f / 1e15).toFixed(3),
        kMaxEV: +kMax.toFixed(2),
        photonEnergy: +ePhoton.toFixed(2),
      });
    }
    return data;
  }, [selectedMetal]);

  const setCameraView = (view: 'default' | 'top' | 'cathode' | 'anode') => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    if (view === 'default') {
      controls.object.position.set(0, 3.5, 9.5);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      controls.object.position.set(0, 11.0, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'cathode') {
      controls.object.position.set(-3.5, 1.0, 3.5);
      controls.target.set(-2.8, 0, 0);
    } else if (view === 'anode') {
      controls.object.position.set(3.5, 1.0, 3.5);
      controls.target.set(2.8, 0, 0);
    }
    controls.update();
    labSound.playLaserPulse(600);
  };

  const toggleSound = () => {
    const muted = labSound.toggleMute();
    setIsMuted(muted);
  };

  const handleExportDataCSV = () => {
    const headers = 'Metal,WorkFunction(eV),Wavelength(nm),Frequency(PHz),PhotonEnergy(eV),MaxKE(eV),Voltage(V),Current(uA)\n';
    const row = `${selectedMetal.nameEn},${selectedMetal.workFunctionEV},${wavelengthNm},${(frequencyHz / 1e15).toFixed(3)},${photonEnergyEV.toFixed(2)},${maxKineticEnergyEV.toFixed(2)},${voltage.toFixed(2)},${photocurrentUA}\n`;
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `photoelectric_${selectedMetal.id}_data.csv`;
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
              <div className="p-3 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20">
                <Atom className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 bg-clip-text text-transparent">
                  الظاهرة الكهروضوئية وثابت بلانك ثلاثية الأبعاد (3D Pro)
                </h1>
                <p className="text-sm text-slate-400">
                  تفسير أينشتاين للكم الضوئي وتكميم الطاقة وانبعاث الإلكترونات الضوئية (جائزة نوبل 1921)
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
              <span className="text-xs text-slate-400">طاقة الفوتون الساقط (E)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{photonEnergyEV.toFixed(2)} eV</p>
              <span className="text-[10px] text-slate-500 font-mono">{(photonEnergyEV * 1.602e-19).toExponential(2)} J</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">دالة الشغل للمعدن (Φ)</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{selectedMetal.workFunctionEV.toFixed(2)} eV</p>
              <span className="text-[10px] text-slate-500">طول عتبة: {selectedMetal.thresholdWlNm} nm</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">أقصى طاقة حركية (K_max)</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{maxKineticEnergyEV.toFixed(2)} eV</p>
              <span className="text-[10px] text-slate-500">{isEmitting ? 'انبعاث إلكترونات ضوئية' : 'لا يوجد انبعاث'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">جهد الإيقاف (V₀)</span>
              <p className="text-lg font-bold text-purple-400 font-mono">-{stoppingVoltage.toFixed(2)} V</p>
              <span className="text-[10px] text-slate-500">يوقف أسرع الإلكترونات</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">التيار الكهروضوئي (I)</span>
              <p className={`text-lg font-bold font-mono ${photocurrentUA > 0 ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}>
                {photocurrentUA} µA
              </p>
              <span className="text-[10px] text-slate-500">{photocurrentUA > 0 ? 'دائرة مغلقة وتيار سارٍ' : 'تيار متوقف (0)'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">حالة الانبعاث</span>
              <p className={`text-xs font-bold mt-1 ${isEmitting ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isEmitting ? '✓ فوتونات كافية للتحرير' : '✗ التردد أقل من العتبة'}
              </p>
              <span className="text-[10px] text-slate-500">{selectedMetal.nameAr}</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Activity className="w-4 h-4" />
              الخلية الكهروضوئية ثلاثية الأبعاد (3D Lab)
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Target className="w-4 h-4" />
              المهام التعليمية والتحديات ({[mission1Completed, mission2Completed, mission3Completed].filter(Boolean).length}/3)
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <BarChart3 className="w-4 h-4" />
              الرسم البياني وثابت بلانك
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              معادلة أينشتاين والنظرية
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
                      <Sun className="w-4 h-4 text-amber-400" />
                      أنبوب الخلية الكهروضوئية ثلاثي الأبعاد (3D Phototube)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${isEmitting ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-400'}`}>
                        {isEmitting ? '✓ انبعاث كهروضوئي نشط' : 'لا يوجد تحرير إلكترونات'}
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
                    <Canvas camera={{ position: [0, 3.5, 9.5], fov: 45 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 10, 10]} intensity={1.2} />
                      <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#fef08a" />
                      <PhotocellChamber3D
                        wavelengthNm={wavelengthNm}
                        intensity={intensity}
                        voltage={voltage}
                        selectedMetal={selectedMetal}
                        isPlaying={isPlaying}
                        isEmitting={isEmitting}
                        maxKineticEnergyEV={maxKineticEnergyEV}
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
                        onClick={() => setCameraView('cathode')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        الكاثود (المعدن)
                      </button>
                      <button
                        onClick={() => setCameraView('anode')}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        الأنود (الجامع)
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
                        {isEmitting
                          ? `💡 فوتونات الضوء (${wavelengthNm}nm / ${photonEnergyEV.toFixed(2)}eV) تملك طاقة أعلى من دالة الشغل (${selectedMetal.workFunctionEV}eV). الإلكترونات تنطلق بطاقة حركية ${maxKineticEnergyEV.toFixed(2)}eV.`
                          : `💡 طاقة الفوتون (${photonEnergyEV.toFixed(2)}eV) أقل من دالة شغل ${selectedMetal.nameAr} (${selectedMetal.workFunctionEV}eV). قلل الطول الموجي تحت ${selectedMetal.thresholdWlNm}nm لبدء الانبعاث.`}
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
                      التحكم بمصدر الضوء والجهد
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Metal Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر مادة الكاثود (Target Metal)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {METALS.map((metal) => (
                          <button
                            key={metal.id}
                            onClick={() => {
                              setSelectedMetal(metal);
                              labSound.playLaserPulse(500);
                            }}
                            className={`p-2 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedMetal.id === metal.id
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            <div className="font-bold text-slate-200">{metal.nameAr}</div>
                            <div className="text-[10px] opacity-75 font-mono">Φ = {metal.workFunctionEV} eV</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wavelength Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">الطول الموجي للضوء (Wavelength λ)</label>
                        <span className="text-xs font-mono font-bold" style={{ color: getWavelengthColor(wavelengthNm) }}>
                          {wavelengthNm} nm ({photonEnergyEV.toFixed(2)} eV)
                        </span>
                      </div>
                      <Slider
                        value={[wavelengthNm]}
                        min={180}
                        max={750}
                        step={5}
                        onValueChange={(val) => setWavelengthNm(val[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>أشعة فوق بنفسجية (180nm)</span>
                        <span>ضوء مرئي</span>
                        <span>أحمر (750nm)</span>
                      </div>
                    </div>

                    {/* Intensity Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">شدة الإضاءة (Light Intensity)</label>
                        <span className="text-xs font-mono text-amber-400 font-bold">{intensity}%</span>
                      </div>
                      <Slider
                        value={[intensity]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={(val) => setIntensity(val[0])}
                        className="py-1"
                      />
                    </div>

                    {/* Voltage Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">جهد البطارية (Voltage)</label>
                        <span className="text-xs font-mono text-purple-400 font-bold">{voltage > 0 ? `+${voltage.toFixed(2)}` : voltage.toFixed(2)} V</span>
                      </div>
                      <Slider
                        value={[voltage]}
                        min={-5.0}
                        max={5.0}
                        step={0.05}
                        onValueChange={(val) => setVoltage(val[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>جهد إعاقة (-5V)</span>
                        <span>0V</span>
                        <span>جهد تسريع (+5V)</span>
                      </div>
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
                  مهام وتحديات الاكتشاف المعملي الموجه (Guided Lab Challenges)
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  أكمل هذه المهام بالتحكم بالمتغيرات داخل المشهد الثلاثي الأبعاد لتأكيد فهمك العملي للظاهرة الكهروضوئية.
                </p>
              </div>

              <div className="space-y-4">
                {/* Mission 1 */}
                <div className={`p-4 rounded-xl border transition-all ${mission1Completed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <CheckSquare className={`w-4 h-4 ${mission1Completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                        المهمة 1: تحديد طول موجة العتبة (Threshold Wavelength)
                      </div>
                      <p className="text-xs text-slate-400">
                        اختر أي معدن (مثل السيزيوم أو الصوديوم)، ثم اضبط الطول الموجي لليزر بالقرب من طول موجة العتبة الخاص به وشاهد نقطة بدء انبعاث الإلكترونات.
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
                        المهمة 2: قياس جهد الإيقاف (Stopping Voltage V₀)
                      </div>
                      <p className="text-xs text-slate-400">
                        شغّل الانبعاث الكهروضوئي، ثم حرك منزلق الجهد باتجاه القيم السالبة حتى يصل التيار إلى الصفر تماماً وتتوقف أسرع الإلكترونات.
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
                        المهمة 3: تحرير الإلكترونات من المعادن ذات دالة الشغل العالية (UV Photoemission)
                      </div>
                      <p className="text-xs text-slate-400">
                        اختر معدن الزنك أو النحاس أو البلاتين، واضبط مصدر الضوء على نطاق الأشعة فوق البنفسجية القصيرة (&lt; 280nm) لتحرير الإلكترونات منها.
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

          {/* TAB 3: Charts */}
          <TabsContent value="charts" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 shadow-xl space-y-4">
              <CardTitle className="text-base font-bold text-sky-300">الرسم البياني: أقصى طاقة حركية للإلكترونات مقابل تردد الضوء (K_max vs Frequency)</CardTitle>
              <p className="text-xs text-slate-400">
                ميل هذا الخط المستقيم يمثل القيمة الدقيقة لثابت بلانك \(h = 4.136 \times 10^{-15} \text{ eV}\cdot\text{s}\)، وتقاطع الخط مع المحور الأفقي يمثل تردد العتبة \(f_0\).
              </p>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="frequencyPHz" stroke="#94a3b8" label={{ value: 'التردد (PHz = 10¹⁵ Hz)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis stroke="#94a3b8" label={{ value: 'أقصى طاقة حركية K_max (eV)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                    <ReferenceLine y={0} stroke="#64748b" />
                    <Line type="monotone" dataKey="kMaxEV" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3 }} name="الطاقة الحركية K_max" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: Theory */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-amber-300">الفيزياء الكوانتية للظاهرة الكهروضوئية (أينشتاين 1905)</h3>
              <p>
                عجزت الفيزياء الكلاسيكية الموجية عن تفسير الظاهرة الكهروضوئية لأنها افترضت أن زيادة شدة الضوء تزيد طاقة الإلكترونات، بينما أثبتت التجارب أن طاقة الإلكترونات تعتمد حصرياً على <strong>تردد الضوء</strong> وليس شدته.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">1. معادلة أينشتاين الكهروضوئية</h4>
                  <p className="text-sm font-mono text-amber-300">E = h · f = Φ + K_max</p>
                  <p className="text-xs text-slate-400">طاقة الفوتون = دالة الشغل للمعدن + أقصى طاقة حركية للإلكترون المتحرر.</p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">2. جهد الإيقاف (Stopping Potential)</h4>
                  <p className="text-sm font-mono text-amber-300">e · V₀ = K_max = h · f - Φ</p>
                  <p className="text-xs text-slate-400">الجهد الكهربائي العكسي اللازم لإيقاف أسرع الإلكترونات الضوئية عن الوصول للمصعد.</p>
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
                  اختبار استيعاب الظاهرة الكهروضوئية
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: إذا قمنا بمضاعفة شدة الضوء الساقط (Intensity) مع تثبيت تردده فوق تردد العتبة، فماذا يحدث لأقصى طاقة حركية للإلكترونات ولعدد الإلكترونات المنبعثة في الثانية؟
                </p>
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'تتضاعف الطاقة الحركية ويبقى عدد الإلكترونات ثابتاً.' },
                    { id: 1, text: 'تبقى أقصى طاقة حركية ثابتة، بينما يتضاعف عدد الإلكترونات المنبعثة (يتضاعف شدة التيار).' },
                    { id: 2, text: 'يتضاعف كلاهما.' },
                    { id: 3, text: 'يتوقف انبعاث الإلكترونات.' },
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
                        <span>إجابة صحيحة ورائعة! شدة الضوء تعني عدد الفوتونات الساقطة، وبالتالي تزيد عدد الإلكترونات المتحررة (التيار) دون التأثير على طاقة الإلكترون الواحد التي يحددها التردد حصراً.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. زيادة شدة الضوء تزيد عدد الإلكترونات المتحررة (التيار)، لكن طاقة الإلكترون تعتمد فقط على تردد الضوء.</span>
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
