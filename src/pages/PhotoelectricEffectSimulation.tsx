import React, { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Sphere, Cylinder, Box, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Atom, Play, Pause, RotateCcw, Award, CheckCircle2, HelpCircle, 
  Activity, Sparkles, BookOpen, Layers, Sun, Zap, Compass, View, Eye, Maximize2, ShieldAlert
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

// Physical Constants
const H_EV_S = 4.135667696e-15; // Planck's constant in eV·s
const C = 299792458; // Speed of light in m/s
const H_J_S = 6.62607015e-34; // Planck's constant in J·s
const E_CHARGE = 1.602176634e-19; // Elementary charge in C

interface MetalTarget {
  id: string;
  nameAr: string;
  nameEn: string;
  workFunctionEV: number; // Work function Φ in eV
  thresholdWlNm: number; // Threshold wavelength in nm
  color: string;
  metalness: number;
  roughness: number;
}

const METALS: MetalTarget[] = [
  { id: 'cesium', nameAr: 'السيزيوم (Cs)', nameEn: 'Cesium', workFunctionEV: 2.14, thresholdWlNm: 579, color: '#fef08a', metalness: 0.9, roughness: 0.2 },
  { id: 'potassium', nameAr: 'البوتاسيوم (K)', nameEn: 'Potassium', workFunctionEV: 2.30, thresholdWlNm: 539, color: '#e2e8f0', metalness: 0.85, roughness: 0.25 },
  { id: 'sodium', nameAr: 'الصوديوم (Na)', nameEn: 'Sodium', workFunctionEV: 2.75, thresholdWlNm: 451, color: '#cbd5e1', metalness: 0.8, roughness: 0.3 },
  { id: 'zinc', nameAr: 'الزنك (Zn)', nameEn: 'Zinc', workFunctionEV: 4.31, thresholdWlNm: 288, color: '#94a3b8', metalness: 0.95, roughness: 0.15 },
  { id: 'copper', nameAr: 'النحاس (Cu)', nameEn: 'Copper', workFunctionEV: 4.65, thresholdWlNm: 267, color: '#f97316', metalness: 0.9, roughness: 0.2 },
  { id: 'platinum', nameAr: 'البلاتين (Pt)', nameEn: 'Platinum', workFunctionEV: 5.65, thresholdWlNm: 219, color: '#e2e8f0', metalness: 0.98, roughness: 0.1 },
];

function getWavelengthColor(wl: number): string {
  if (wl < 380) return '#a855f7'; // UV purple
  if (wl < 440) return '#6366f1'; // Violet
  if (wl < 490) return '#3b82f6'; // Blue
  if (wl < 530) return '#10b981'; // Green
  if (wl < 580) return '#eab308'; // Yellow
  if (wl < 640) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

// 3D Scene Components
interface Phototube3DProps {
  wavelengthNm: number;
  intensity: number;
  voltage: number;
  selectedMetal: MetalTarget;
  isPlaying: boolean;
  isEmitting: boolean;
  stoppingVoltage: number;
  maxKineticEnergyEV: number;
}

function PhotocellChamber3D({
  wavelengthNm,
  intensity,
  voltage,
  selectedMetal,
  isPlaying,
  isEmitting,
  stoppingVoltage,
  maxKineticEnergyEV,
}: Phototube3DProps) {
  const beamColor = getWavelengthColor(wavelengthNm);
  const electronsRef = useRef<THREE.Group>(null);
  const photonsRef = useRef<THREE.Group>(null);

  // Particles pools
  const electronCount = 45;
  const photonCount = 35;

  const electronData = useMemo(() => {
    return Array.from({ length: electronCount }, () => ({
      x: -2.8,
      y: (Math.random() - 0.5) * 1.6,
      z: (Math.random() - 0.5) * 1.6,
      vx: 0.05 + Math.random() * 0.06,
      vy: (Math.random() - 0.5) * 0.02,
      vz: (Math.random() - 0.5) * 0.02,
      active: false,
      age: Math.random() * 100,
    }));
  }, [electronCount]);

  const photonData = useMemo(() => {
    return Array.from({ length: photonCount }, () => ({
      x: 0,
      y: 4.5,
      z: (Math.random() - 0.5) * 1.2,
      targetX: -2.8,
      targetY: (Math.random() - 0.5) * 1.5,
      progress: Math.random(),
      speed: 0.02 + Math.random() * 0.015,
    }));
  }, [photonCount]);

  // Frame animation loop
  useFrame((state, delta) => {
    if (!isPlaying) return;

    // Animate Photons (Light Beam)
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
            p.targetY = (Math.random() - 0.5) * 1.5;
          }
          // Lerp from light source (x=0, y=3.8, z=0) to cathode plate (x=-2.8, y=p.targetY, z=0)
          child.position.x = THREE.MathUtils.lerp(0, -2.8, p.progress);
          child.position.y = THREE.MathUtils.lerp(3.8, p.targetY, p.progress);
          child.position.z = THREE.MathUtils.lerp(p.z, 0, p.progress);
        } else {
          child.visible = false;
        }
      }
    }

    // Animate Photoelectrons
    if (electronsRef.current) {
      const maxAllowed = isEmitting ? Math.ceil((intensity / 100) * electronCount) : 0;
      const initialVelocityBase = Math.sqrt(Math.max(0.01, maxKineticEnergyEV)) * 0.06;
      // Electric field acceleration: a = q * E = q * (V / d)
      const fieldAccel = (voltage / 5.6) * 0.003;

      for (let i = 0; i < electronCount; i++) {
        const child = electronsRef.current.children[i] as THREE.Mesh;
        if (!child) continue;

        if (i < maxAllowed && isEmitting) {
          child.visible = true;
          const e = electronData[i];

          // Update physics motion
          e.vx += fieldAccel;
          e.x += e.vx;
          e.y += e.vy;
          e.z += e.vz;

          // Check if reached anode (x >= 2.8) or repelled back to cathode (x < -2.8)
          if (e.x >= 2.8 || (e.vx <= 0 && e.x <= -2.8) || Math.abs(e.y) > 1.8 || Math.abs(e.z) > 1.8) {
            // Respawn electron at cathode surface
            e.x = -2.8 + Math.random() * 0.05;
            e.y = (Math.random() - 0.5) * 1.5;
            e.z = (Math.random() - 0.5) * 1.5;
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
      {/* 3D Glass Phototube Envelope */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[2.2, 2.2, 7.2, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#a5f3fc"
          transmission={0.92}
          opacity={0.35}
          transparent
          roughness={0.05}
          ior={1.45}
          reflectivity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Tube End Caps */}
      <mesh position={[-3.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[2.22, 2.22, 0.25, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[3.65, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[2.22, 2.22, 0.25, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* CATHODE (Emitter Metal Plate) */}
      <group position={[-2.8, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[1.7, 1.7, 0.15, 32]} />
          <meshStandardMaterial
            color={selectedMetal.color}
            metalness={selectedMetal.metalness}
            roughness={selectedMetal.roughness}
          />
        </mesh>
        {/* Cathode Terminal Rod */}
        <mesh position={[-0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <Html position={[0, -2.1, 0]} center>
          <div className="bg-slate-900/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            مهبط الكاثود ({selectedMetal.nameAr})
          </div>
        </Html>
      </group>

      {/* ANODE (Collector Wire Mesh / Plate) */}
      <group position={[2.8, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.6, 1.7, 32]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.6, 16]} />
          <meshBasicMaterial color="#38bdf8" wireframe opacity={0.5} transparent />
        </mesh>
        {/* Anode Terminal Rod */}
        <mesh position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.9, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <Html position={[0, -2.1, 0]} center>
          <div className="bg-slate-900/90 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            مصعد الأنود (المجمّع)
          </div>
        </Html>
      </group>

      {/* LASER / LIGHT SOURCE PROJECTOR */}
      <group position={[0, 3.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <mesh>
          <cylinderGeometry args={[0.35, 0.45, 1.2, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Laser Lens Glow */}
        <mesh position={[0, -0.62, 0]}>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshBasicMaterial color={beamColor} />
        </mesh>
        {/* Point light shining on cathode */}
        {intensity > 0 && (
          <pointLight color={beamColor} intensity={(intensity / 100) * 4} distance={7} decay={1.5} />
        )}
      </group>

      {/* 3D Light Cone Beam */}
      {intensity > 0 && (
        <mesh position={[-1.4, 1.9, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.3, 1.8, 4.0, 32, 1, true]} />
          <meshBasicMaterial color={beamColor} opacity={(intensity / 100) * 0.25} transparent side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* PHOTON PARTICLES (Stream of energy packets) */}
      <group ref={photonsRef}>
        {Array.from({ length: photonCount }).map((_, i) => (
          <mesh key={`photon-${i}`} visible={false}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color={beamColor} />
          </mesh>
        ))}
      </group>

      {/* PHOTOELECTRONS (Flying charged particles) */}
      <group ref={electronsRef}>
        {Array.from({ length: electronCount }).map((_, i) => (
          <mesh key={`electron-${i}`} visible={false}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        ))}
      </group>

      {/* Electric Field Indicator Grid */}
      {Math.abs(voltage) > 0.5 && (
        <group position={[0, 0, 0]}>
          {[-1.2, 0, 1.2].map((y, idx) => (
            <mesh key={`field-${idx}`} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 4.8, 8]} />
              <meshBasicMaterial color={voltage > 0 ? '#10b981' : '#ef4444'} opacity={0.35} transparent />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export default function PhotoelectricEffectSimulation() {
  const navigate = useNavigate();
  const controlsRef = useRef<any>(null);

  // Simulation Controls State
  const [selectedMetal, setSelectedMetal] = useState<MetalTarget>(METALS[0]);
  const [wavelengthNm, setWavelengthNm] = useState<number>(400); // 400 nm default
  const [intensity, setIntensity] = useState<number>(75); // 75% light intensity
  const [voltage, setVoltage] = useState<number>(0.0); // 0.0 V default
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('simulation');

  // Quiz State
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Physics Calculations
  const photonFrequencyHz = (C / (wavelengthNm * 1e-9));
  const photonEnergyEV = (H_EV_S * photonFrequencyHz);
  const photonEnergyJoules = (H_J_S * photonFrequencyHz);
  const maxKineticEnergyEV = Math.max(0, photonEnergyEV - selectedMetal.workFunctionEV);
  const isEmitting = photonEnergyEV >= selectedMetal.workFunctionEV && intensity > 0;
  const stoppingVoltage = maxKineticEnergyEV; // in Volts (V0 = Ek,max / e)
  const thresholdFrequencyHz = (selectedMetal.workFunctionEV / H_EV_S);

  // Saturation current (µA) proportional to intensity
  const saturationCurrent = useMemo(() => {
    if (!isEmitting) return 0;
    return (intensity / 100) * 12.5; // Max 12.5 µA at 100% intensity
  }, [isEmitting, intensity]);

  // Current calculation with applied voltage
  const currentMicroAmps = useMemo(() => {
    if (!isEmitting) return 0;
    if (voltage <= -stoppingVoltage) return 0;
    if (voltage >= 2.0) return saturationCurrent;
    // Gradual transition curve towards saturation
    const vDiff = voltage + stoppingVoltage;
    const factor = 1 - Math.exp(-vDiff / 1.2);
    return Math.min(saturationCurrent, Math.max(0, saturationCurrent * factor));
  }, [isEmitting, voltage, stoppingVoltage, saturationCurrent]);

  // Generate IV Curve Data for Recharts
  const ivData = useMemo(() => {
    const data = [];
    const minV = Math.min(-3.0, -stoppingVoltage - 1.0);
    const maxV = 4.0;
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const v = +(minV + (i / steps) * (maxV - minV)).toFixed(2);
      let cur = 0;
      if (isEmitting) {
        if (v <= -stoppingVoltage) {
          cur = 0;
        } else if (v >= 2.0) {
          cur = saturationCurrent;
        } else {
          const vDiff = v + stoppingVoltage;
          cur = saturationCurrent * (1 - Math.exp(-vDiff / 1.2));
        }
      }
      data.push({
        voltage: v,
        current: +cur.toFixed(2),
      });
    }
    return data;
  }, [isEmitting, stoppingVoltage, saturationCurrent]);

  // Generate Kinetic Energy vs Frequency Graph Data
  const ekFreqData = useMemo(() => {
    const data = [];
    const minF = 0.3e15; // 0.3 PHz
    const maxF = 1.8e15; // 1.8 PHz
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const f = minF + (i / steps) * (maxF - minF);
      const ePhoton = H_EV_S * f;
      const ek = Math.max(0, ePhoton - selectedMetal.workFunctionEV);
      data.push({
        frequencyPHz: +(f * 1e-15).toFixed(2),
        kineticEnergy: +ek.toFixed(2),
        photonEnergy: +ePhoton.toFixed(2),
      });
    }
    return data;
  }, [selectedMetal]);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleQuizSubmit = (selected: number) => {
    setQuizAnswer(selected);
    setQuizSubmitted(true);
    if (selected === 2) {
      setQuizScore((prev) => prev + 1);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col" dir="rtl">
      <StarField />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 pt-24 pb-16 relative z-10">
        {/* Top Header */}
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
              <div className="p-3 bg-gradient-to-br from-amber-500 to-indigo-600 rounded-2xl shadow-lg shadow-amber-500/20">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-200 to-indigo-300 bg-clip-text text-transparent">
                  الظاهرة الكهروضوئية وتكميم الضوء ثلاثية الأبعاد (3D)
                </h1>
                <p className="text-sm text-slate-400">
                  تجربة أينشتاين وماكس بلانك لتحرير الإلكترونات بالضوء وقياس جهد الإيقاف واستنتاج ثابت بلانك
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

        {/* Live Gauges Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">طاقة الفوتون الساقط (E)</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{photonEnergyEV.toFixed(2)} eV</p>
              <span className="text-[10px] text-slate-500 font-mono">{(photonEnergyJoules * 1e19).toFixed(2)} × 10⁻¹⁹ J</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">دالة شغل المعدن (Φ)</span>
              <p className="text-lg font-bold text-sky-400 font-mono">{selectedMetal.workFunctionEV.toFixed(2)} eV</p>
              <span className="text-[10px] text-slate-500">{selectedMetal.nameAr}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">طاقة الحركة العظمى (Ek)</span>
              <p className={`text-lg font-bold font-mono ${isEmitting ? 'text-emerald-400' : 'text-slate-500'}`}>
                {maxKineticEnergyEV.toFixed(2)} eV
              </p>
              <span className="text-[10px] text-slate-500">{isEmitting ? 'إلكترونات محررة' : 'دون حد التحرير'}</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">جهد الإيقاف الحرج (V₀)</span>
              <p className="text-lg font-bold text-purple-400 font-mono">-{stoppingVoltage.toFixed(2)} V</p>
              <span className="text-[10px] text-slate-500">ينعدم عنده التيار</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">التيار الكهروضوئي (I)</span>
              <p className={`text-lg font-bold font-mono ${currentMicroAmps > 0 ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`}>
                {currentMicroAmps.toFixed(2)} µA
              </p>
              <span className="text-[10px] text-slate-500">مقياس الأميتر</span>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-sm">
            <CardContent className="p-3 text-center">
              <span className="text-xs text-slate-400">التردد والطول الموجي</span>
              <p className="text-lg font-bold text-slate-200 font-mono">{wavelengthNm} nm</p>
              <span className="text-[10px] text-slate-500 font-mono">{(photonFrequencyHz * 1e-14).toFixed(2)} × 10¹⁴ Hz</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900/90 border border-slate-800 p-1 mb-6 rounded-xl">
            <TabsTrigger value="simulation" className="flex items-center gap-2 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
              <Activity className="w-4 h-4" />
              المختبر الافتراضي ثلاثي الأبعاد (3D Lab)
            </TabsTrigger>
            <TabsTrigger value="curves" className="flex items-center gap-2 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-300">
              <Layers className="w-4 h-4" />
              المنحنيات البيانية وثابت بلانك
            </TabsTrigger>
            <TabsTrigger value="theory" className="flex items-center gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300">
              <BookOpen className="w-4 h-4" />
              النظرية والمعادلات الرياضية
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center gap-2 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
              <Award className="w-4 h-4" />
              اختبار الفهم
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: 3D Simulation & Interactive Chamber */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 3D WebGL Canvas */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-2xl relative">
                  <CardHeader className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-200">
                      <Zap className="w-4 h-4 text-amber-400" />
                      أنبوبة التفريغ الكهروضوئية ثلاثية الأبعاد (3D Photocell Chamber)
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${isEmitting ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                        {isEmitting ? 'انبعاث نشط' : 'hf < Φ (لا يوجد انبعاث)'}
                      </Badge>
                      <Badge variant="outline" className="border-sky-500/50 text-sky-400 bg-sky-500/10">
                        3D تفاعلي
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 h-[440px] bg-slate-950 relative">
                    <Canvas camera={{ position: [0, 2.5, 8.5], fov: 45 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[10, 10, 10]} intensity={1.2} />
                      <directionalLight position={[-10, -5, -10]} intensity={0.5} color="#38bdf8" />
                      <PhotocellChamber3D
                        wavelengthNm={wavelengthNm}
                        intensity={intensity}
                        voltage={voltage}
                        selectedMetal={selectedMetal}
                        isPlaying={isPlaying}
                        isEmitting={isEmitting}
                        stoppingVoltage={stoppingVoltage}
                        maxKineticEnergyEV={maxKineticEnergyEV}
                      />
                      <OrbitControls
                        ref={controlsRef}
                        enablePan={true}
                        enableZoom={true}
                        minDistance={4}
                        maxDistance={15}
                        maxPolarAngle={Math.PI / 2 + 0.2}
                      />
                    </Canvas>

                    {/* 3D Scene Controls Overlay */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      <span>اسحب للتدوير 360° • مرّر للتقريب والتبعيد</span>
                    </div>

                    {/* Applied Voltage Indicator */}
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                      الجهد بين اللوحين:{' '}
                      <strong className={voltage > 0 ? 'text-emerald-400' : voltage < 0 ? 'text-red-400' : 'text-slate-200'}>
                        {voltage > 0 ? `+${voltage.toFixed(1)}` : voltage.toFixed(1)} V
                      </strong>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Controls Column */}
              <div className="space-y-4">
                <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                  <CardHeader className="py-3 px-4 border-b border-slate-800">
                    <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" />
                      لوحة التحكم التجريبية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-5">
                    {/* Metal Selector */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-2">اختر معدن المهبط (الكاثود)</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {METALS.map((metal) => (
                          <button
                            key={metal.id}
                            onClick={() => setSelectedMetal(metal)}
                            className={`p-2 rounded-xl text-xs font-medium border transition-all text-right ${
                              selectedMetal.id === metal.id
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <div className="font-bold">{metal.nameAr}</div>
                            <div className="text-[10px] opacity-75 font-mono">Φ = {metal.workFunctionEV} eV</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Wavelength Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">الطول الموجي للضوء (λ)</label>
                        <span className="text-xs font-mono font-bold" style={{ color: getWavelengthColor(wavelengthNm) }}>
                          {wavelengthNm} nm
                        </span>
                      </div>
                      <Slider
                        value={[wavelengthNm]}
                        min={100}
                        max={800}
                        step={5}
                        onValueChange={(val) => setWavelengthNm(val[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span className="text-purple-400">فوق بنفسجي (100nm)</span>
                        <span className="text-emerald-400">مرئي (500nm)</span>
                        <span className="text-red-400">تحت أحمر (800nm)</span>
                      </div>
                    </div>

                    {/* Light Intensity Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">شدة الإضاءة (Intensity)</label>
                        <span className="text-xs font-mono text-amber-400 font-bold">{intensity}%</span>
                      </div>
                      <Slider
                        value={[intensity]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(val) => setIntensity(val[0])}
                        className="py-1"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        زيادة الشدة تزيد من عدد الفوتونات والتيار الكهروضوئي دون تغيير طاقة الحركة.
                      </p>
                    </div>

                    {/* Voltage Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-slate-300">الجهد الكهربائي المطبق (Voltage)</label>
                        <span className={`text-xs font-mono font-bold ${voltage > 0 ? 'text-emerald-400' : voltage < 0 ? 'text-red-400' : 'text-slate-300'}`}>
                          {voltage > 0 ? `+${voltage.toFixed(1)}` : voltage.toFixed(1)} V
                        </span>
                      </div>
                      <Slider
                        value={[voltage]}
                        min={-6.0}
                        max={6.0}
                        step={0.1}
                        onValueChange={(val) => setVoltage(val[0])}
                        className="py-1"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span className="text-red-400">جهد عكسي معيق (-6V)</span>
                        <span>0V</span>
                        <span className="text-emerald-400">جهد طردي مسرع (+6V)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Curves & Planck Constant Calculation */}
          <TabsContent value="curves" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* I vs V Curve */}
              <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-200">
                    منحنى التيار مع الجهد (I-V Characteristic)
                  </CardTitle>
                  <p className="text-xs text-slate-400">
                    لاحظ كيف ينعدم التيار تماماً عند جهد الإيقاف V = -V₀ = -{stoppingVoltage.toFixed(2)} V
                  </p>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ivData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="voltage" stroke="#94a3b8" label={{ value: 'الجهد (V)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis stroke="#94a3b8" label={{ value: 'التيار (µA)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                      <ReferenceLine x={-stoppingVoltage} stroke="#a855f7" strokeDasharray="4 4" label={{ value: `V₀ = -${stoppingVoltage.toFixed(2)}V`, fill: '#a855f7', fontSize: 10 }} />
                      <ReferenceLine y={0} stroke="#64748b" />
                      <Line type="monotone" dataKey="current" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="التيار (µA)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Ek vs Frequency */}
              <Card className="bg-slate-900/90 border-slate-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-200">
                    طاقة الحركة العظمى مع التردد (Ek vs f)
                  </CardTitle>
                  <p className="text-xs text-slate-400">
                    ميل الخط المستقيم يمثل ثابت بلانك h = 4.14 × 10⁻¹⁵ eV·s
                  </p>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ekFreqData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="frequencyPHz" stroke="#94a3b8" label={{ value: 'التردد (PHz = 10¹⁵ Hz)', position: 'bottom', fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis stroke="#94a3b8" label={{ value: 'طاقة الحركة (eV)', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }} />
                      <ReferenceLine x={+(thresholdFrequencyHz * 1e-15).toFixed(2)} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'التردد الحرج f₀', fill: '#eab308', fontSize: 10 }} />
                      <Line type="monotone" dataKey="kineticEnergy" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="طاقة الحركة (eV)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: Theoretical Background */}
          <TabsContent value="theory" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4 text-slate-300 leading-relaxed">
              <h3 className="text-xl font-bold text-amber-300">الأسس الفيزيائية للظاهرة الكهروضوئية (Photoelectric Effect)</h3>
              <p>
                في عام 1905، قدّم ألبرت أينشتاين تفسيره الثوري للظاهرة الكهروضوئية مستنداً إلى فرضية ماكس بلانك لتكميم الطاقة، والتي نال عنها جائزة نوبل في الفيزياء عام 1921.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">1. معادلة أينشتاين الكهروضوئية</h4>
                  <p className="text-sm font-mono text-amber-300">Ek = hν - Φ = e·V₀</p>
                  <p className="text-xs text-slate-400">
                    طاقة الفوتون الساقط (hν) تتوزع بين تحرير الإلكترون بالتغلب على دالة الشغل (Φ) وإكسابه طاقة حركة عظمى (Ek).
                  </p>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400">2. التردد الحرج والطول الموجي الحرج</h4>
                  <p className="text-sm font-mono text-amber-300">f₀ = Φ / h,   λ₀ = hc / Φ</p>
                  <p className="text-xs text-slate-400">
                    أقل تردد ضوئي قادر على انتزاع إلكترون من سطح المعدن دون إكسابه طاقة حركة.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <h4 className="font-bold text-amber-300 mb-1">النتائج التجريبية التي عجزت الفيزياء الكلاسيكية عن تفسيرها:</h4>
                <ul className="list-disc list-inside text-xs space-y-1.5 text-slate-300">
                  <li>الانبعاث فوري وبدون أي تأخير زمني بمجرد سقوط الضوء المناسب.</li>
                  <li>طاقة حركة الإلكترونات تعتمد حصرياً على <strong>تردد الضوء</strong> وليس على شدته.</li>
                  <li>زيادة شدة الإضاءة تزيد من <strong>عدد الإلكترونات المنبعثة (التيار)</strong> فقط دون تغيير طاقتها الحركية.</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 4: Interactive Quiz */}
          <TabsContent value="quiz" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  اختبار فهم الظاهرة الكهروضوئية
                </h3>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                  النقاط: {quizScore}
                </Badge>
              </div>

              <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
                <p className="font-semibold text-slate-200">
                  سؤال: إذا قمنا بمضاعفة شدة الضوء الساقط (مع ثبات تردده)، فماذا يحدث لكل من طاقة الحركة العظمى للإلكترونات (Ek,max) وتيار الإشباع (Isat)؟
                </p>
                
                <div className="space-y-2">
                  {[
                    { id: 0, text: 'تتضاعف طاقة الحركة العظمى ويبقى التيار ثابتاً.' },
                    { id: 1, text: 'تتضاعف طاقة الحركة ويتضاعف التيار معاً.' },
                    { id: 2, text: 'تبقى طاقة الحركة العظمى ثابتة ويتضاعف تيار الإشباع.' },
                    { id: 3, text: 'ينعدم التيار تماماً.' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      disabled={quizSubmitted}
                      onClick={() => handleQuizSubmit(option.id)}
                      className={`w-full text-right p-3 rounded-xl border text-sm transition-all ${
                        quizSubmitted
                          ? option.id === 2
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
                  <div className={`p-3 rounded-xl text-xs ${quizAnswer === 2 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/10 text-red-300 border border-red-500/30'}`}>
                    {quizAnswer === 2 ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>إجابة صحيحة! شدة الضوء تمثل معدل تدفق الفوتونات، ومضاعفتها يضاعف عدد الإلكترونات المنبعثة وتيار الإشباع، بينما طاقة حركة كل إلكترون تعتمد فقط على تردد الضوء ودالة الشغل.</span>
                      </div>
                    ) : (
                      <span>إجابة غير صحيحة. طاقة الحركة العظمى تعتمد فقط على تردد الضوء (Ek = hf - Φ) ولا تتأثر بالشدة.</span>
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
