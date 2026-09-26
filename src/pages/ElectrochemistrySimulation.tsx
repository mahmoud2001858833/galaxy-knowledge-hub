import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Cylinder, Sphere, Ring, Float, Tube } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Battery, Zap, Droplet, Flame, RotateCcw, Lightbulb, Activity, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CyberLabHUD } from '@/components/simulations/CyberLabHUD';
import { LiveAILabCoPilot } from '@/components/simulations/LiveAILabCoPilot';
import { CinematicCameraController, CameraPreset } from '@/components/simulations/CinematicCameraController';
import { LabChallengeEngine } from '@/components/simulations/LabChallengeEngine';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';
import { labSound } from '@/utils/labAudio';

// ====================================================
// 3D DANIELL CELL (GALVANIC)
// ====================================================
const GalvanicCell3D: React.FC<{
  voltage: number;
  isPlaying: boolean;
}> = ({ voltage, isPlaying }) => {
  const electronStreamRef = useRef<THREE.Group>(null);
  const ionsGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (electronStreamRef.current && isPlaying) {
      electronStreamRef.current.children.forEach((child, i) => {
        const t = (state.clock.elapsedTime * 1.5 + i * 0.15) % 1;
        // Move from Zinc (left: -2) to Copper (right: 2) along arch wire
        const x = -2.0 + t * 4.0;
        const y = 2.4 + Math.sin(t * Math.PI) * 0.8;
        child.position.set(x, y, 0);
      });
    }

    if (ionsGroupRef.current && isPlaying) {
      ionsGroupRef.current.children.forEach((child, i) => {
        const t = (state.clock.elapsedTime * 0.8 + i * 0.18) % 1;
        // Ions in salt bridge arc
        const x = -1.3 + t * 2.6;
        const y = 1.3 + Math.sin(t * Math.PI) * 0.7;
        child.position.set(x, y, 0);
      });
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* 1. Left Beaker: Zinc Half-Cell (Zn in ZnSO4) */}
      <group position={[-2.0, 0, 0]}>
        {/* Glass beaker */}
        <Cylinder args={[1.1, 1.05, 2.5, 32, 1, true]} position={[0, 1.25, 0]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.92} opacity={0.3} transparent roughness={0.05} />
        </Cylinder>
        {/* Colorless / light ZnSO4 solution */}
        <Cylinder args={[1.04, 1.0, 1.8, 32]} position={[0, 0.9, 0]}>
          <meshStandardMaterial color="#93c5fd" emissive="#60a5fa" emissiveIntensity={0.2} transparent opacity={0.55} roughness={0.1} />
        </Cylinder>
        {/* Zinc Electrode (Grey Metal Strip Anode) */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.35, 2.4, 0.08]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 2. Right Beaker: Copper Half-Cell (Cu in CuSO4) */}
      <group position={[2.0, 0, 0]}>
        {/* Glass beaker */}
        <Cylinder args={[1.1, 1.05, 2.5, 32, 1, true]} position={[0, 1.25, 0]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.92} opacity={0.3} transparent roughness={0.05} />
        </Cylinder>
        {/* Deep blue CuSO4 solution */}
        <Cylinder args={[1.04, 1.0, 1.8, 32]} position={[0, 0.9, 0]}>
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} transparent opacity={0.8} roughness={0.1} />
        </Cylinder>
        {/* Copper Electrode (Bronze/Copper Strip Cathode) */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.35, 2.4, 0.08]} />
          <meshStandardMaterial color="#ea580c" metalness={0.7} roughness={0.25} />
        </mesh>
      </group>

      {/* 3. Inverted U-Tube Salt Bridge (الجسر الملحي) */}
      <group position={[0, 0.9, 0]}>
        {/* Left arm */}
        <Cylinder args={[0.18, 0.18, 1.2, 16]} position={[-1.3, 0.2, 0]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.4} transparent />
        </Cylinder>
        {/* Right arm */}
        <Cylinder args={[0.18, 0.18, 1.2, 16]} position={[1.3, 0.2, 0]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.4} transparent />
        </Cylinder>
        {/* Horizontal top bridge */}
        <Cylinder args={[0.18, 0.18, 2.6, 16]} position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.4} transparent />
        </Cylinder>
        {/* Agar gel electrolyte inside bridge */}
        <Cylinder args={[0.14, 0.14, 2.5, 16]} position={[0, 0.8, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={0.4} transparent opacity={0.6} />
        </Cylinder>

        {/* Migrating Ions inside salt bridge */}
        <group ref={ionsGroupRef}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Sphere key={i} args={[0.07, 12, 12]}>
              <meshStandardMaterial
                color={i % 2 === 0 ? "#f43f5e" : "#38bdf8"}
                emissive={i % 2 === 0 ? "#e11d48" : "#0284c7"}
                emissiveIntensity={0.8}
              />
            </Sphere>
          ))}
        </group>
      </group>

      {/* 4. External Electrical Circuit with Digital Voltmeter & Light Bulb */}
      <group position={[0, 3.2, 0]}>
        {/* Voltmeter Box */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.4, 0.9, 0.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Voltmeter Screen */}
        <mesh position={[0, 0.05, 0.21]}>
          <planeGeometry args={[1.1, 0.55]} />
          <meshStandardMaterial color="#000000" emissive="#059669" emissiveIntensity={0.3} />
        </mesh>
        {/* Voltmeter Value Display Glow */}
        <pointLight color="#10b981" intensity={0.8} distance={1.5} position={[0, 0.1, 0.4]} />

        {/* External connecting wires */}
        <mesh position={[-1.0, -0.4, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.04, 0.04, 2.2, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.5} />
        </mesh>
        <mesh position={[1.0, -0.4, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.04, 0.04, 2.2, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.5} />
        </mesh>

        {/* Flowing Electrons Stream along wire */}
        <group ref={electronStreamRef}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Sphere key={i} args={[0.05, 10, 10]}>
              <meshBasicMaterial color="#38bdf8" />
            </Sphere>
          ))}
        </group>
      </group>
    </group>
  );
};

// ====================================================
// 3D WATER ELECTROLYSIS APPARATUS (التحليل الكهربائي)
// ====================================================
const ElectrolysisCell3D: React.FC<{
  voltage: number;
  isPlaying: boolean;
}> = ({ voltage, isPlaying }) => {
  const h2BubblesRef = useRef<THREE.Group>(null);
  const o2BubblesRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (h2BubblesRef.current && isPlaying) {
      h2BubblesRef.current.children.forEach((b, i) => {
        const speed = 1.2 * (voltage / 1.5);
        const y = 0.4 + ((state.clock.elapsedTime * speed + i * 0.25) % 2.2);
        b.position.y = y;
      });
    }

    if (o2BubblesRef.current && isPlaying) {
      o2BubblesRef.current.children.forEach((b, i) => {
        const speed = 0.7 * (voltage / 1.5);
        const y = 0.4 + ((state.clock.elapsedTime * speed + i * 0.4) % 2.2);
        b.position.y = y;
      });
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Glass Tank */}
      <Cylinder args={[2.0, 1.9, 2.6, 32, 1, true]} position={[0, 1.3, 0]}>
        <meshPhysicalMaterial color="#ffffff" transmission={0.92} opacity={0.35} transparent roughness={0.05} />
      </Cylinder>
      {/* Water electrolyte */}
      <Cylinder args={[1.9, 1.85, 2.0, 32]} position={[0, 1.0, 0]}>
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.25} transparent opacity={0.65} roughness={0.1} />
      </Cylinder>

      {/* Left Cathode: Inverted Tube for H2 (Double volume) */}
      <group position={[-0.9, 1.6, 0]}>
        <Cylinder args={[0.35, 0.35, 2.8, 20, 1, true]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.4} transparent />
        </Cylinder>
        {/* Platinum electrode */}
        <Cylinder args={[0.06, 0.06, 1.8, 12]} position={[0, -0.5, 0]}>
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
        </Cylinder>
        {/* Rising Hydrogen bubbles (2x volume) */}
        <group ref={h2BubblesRef}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Sphere key={i} args={[0.05, 8, 8]} position={[Math.sin(i * 1.5) * 0.12, 0, Math.cos(i * 1.5) * 0.12]}>
              <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
            </Sphere>
          ))}
        </group>
      </group>

      {/* Right Anode: Inverted Tube for O2 (1x volume) */}
      <group position={[0.9, 1.6, 0]}>
        <Cylinder args={[0.35, 0.35, 2.8, 20, 1, true]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.4} transparent />
        </Cylinder>
        {/* Platinum electrode */}
        <Cylinder args={[0.06, 0.06, 1.8, 12]} position={[0, -0.5, 0]}>
          <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
        </Cylinder>
        {/* Rising Oxygen bubbles (1x volume) */}
        <group ref={o2BubblesRef}>
          {[0, 1, 2, 3].map((i) => (
            <Sphere key={i} args={[0.06, 8, 8]} position={[Math.sin(i * 1.8) * 0.1, 0, Math.cos(i * 1.8) * 0.1]}>
              <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
            </Sphere>
          ))}
        </group>
      </group>

      {/* DC Power Supply at top */}
      <group position={[0, 3.4, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 0.8, 0.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        <pointLight color="#f59e0b" intensity={0.9} distance={2} />
      </group>
    </group>
  );
};

// ====================================================
// 3D HYDROGEN FUEL CELL (خلية وقود الهيدروجين)
// ====================================================
const FuelCell3D: React.FC<{
  isPlaying: boolean;
}> = ({ isPlaying }) => {
  const membraneRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (membraneRef.current) {
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      (membraneRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
    }
  });

  return (
    <group position={[0, 0.2, 0]}>
      {/* Fuel Cell Sandwich Stack */}
      {/* 1. Anode Gas Channel (H2 in) */}
      <mesh position={[-1.2, 0, 0]}>
        <boxGeometry args={[0.6, 2.8, 2.8]} />
        <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.4} transparent opacity={0.8} />
      </mesh>

      {/* 2. Proton Exchange Membrane (PEM) in the middle */}
      <mesh ref={membraneRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.15, 3.0, 3.0]} />
        <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.8} roughness={0.2} />
      </mesh>

      {/* 3. Cathode Gas Channel (O2 in & H2O out) */}
      <mesh position={[1.2, 0, 0]}>
        <boxGeometry args={[0.6, 2.8, 2.8]} />
        <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.4} transparent opacity={0.8} />
      </mesh>

      {/* Clean Exhaust Water Drops (H2O) */}
      {isPlaying && (
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
          <Sphere args={[0.14, 16, 16]} position={[1.8, -1.2, 0]}>
            <meshStandardMaterial color="#38bdf8" roughness={0.1} transparent opacity={0.9} />
          </Sphere>
        </Float>
      )}

      {/* Electric Power Bulb lit above */}
      <group position={[0, 2.4, 0]}>
        <Sphere args={[0.4, 24, 24]}>
          <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={isPlaying ? 1.2 : 0.2} />
        </Sphere>
        <pointLight color="#f59e0b" intensity={isPlaying ? 1.5 : 0.1} distance={4} />
      </group>
    </group>
  );
};

// ====================================================
// MAIN ELECTROCHEMISTRY SIMULATION PAGE
// ====================================================
const ElectrochemistrySimulation = () => {
  const navigate = useNavigate();
  const [simulationType, setSimulationType] = useState<'galvanic' | 'electrolysis' | 'fuel'>('galvanic');
  const [voltage, setVoltage] = useState<number>(1.1);
  const [currentMilliAmps, setCurrentMilliAmps] = useState<number>(45);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  // Physical calculations
  const faradayConstant = 96485; // C/mol
  const gibbsFreeEnergy = -2 * faradayConstant * (voltage / 1000); // kJ/mol roughly

  const hudMetrics = [
    {
      id: 'voltage',
      label: 'القوة الدافعة الكهربائية (E°)',
      value: voltage.toFixed(2),
      unit: 'V',
      color: 'text-amber-400',
      progressPercent: (voltage / 2.5) * 100,
      trend: 'stable' as const
    },
    {
      id: 'current',
      label: 'شدة التيار الكهربائي',
      value: isPlaying ? currentMilliAmps : 0,
      unit: 'mA',
      color: 'text-cyan-400',
      progressPercent: (currentMilliAmps / 100) * 100,
      trend: isPlaying ? 'up' as const : 'down' as const
    },
    {
      id: 'gibbs',
      label: 'طاقة غيبس الحرة (ΔG°)',
      value: (gibbsFreeEnergy).toFixed(1),
      unit: 'kJ',
      color: gibbsFreeEnergy < 0 ? 'text-emerald-400' : 'text-rose-400',
      progressPercent: 80,
      trend: 'stable' as const
    },
    {
      id: 'reaction',
      label: 'تلقائية التفاعل',
      value: simulationType === 'galvanic' ? 'تلقائي (Spontaneous)' : simulationType === 'electrolysis' ? 'غير تلقائي (Electrolytic)' : 'وقود نظيف (Fuel)',
      unit: '',
      color: simulationType === 'galvanic' ? 'text-emerald-400' : 'text-purple-400',
      progressPercent: 100,
      trend: 'stable' as const
    }
  ];

  const challenges = [
    {
      id: 'standard-daniell',
      title: 'معايرة خلية دانييل القياسية',
      description: 'اضبط جهد الخلية الجلفانية بدقة على القيمة القياسية لتفاعل الخارصين والنحاس (1.10 V).',
      targetDescription: 'الجهد = 1.10 V',
      checkSuccess: () => simulationType === 'galvanic' && Math.abs(voltage - 1.10) < 0.05,
      points: 200,
      badge: 'خبير الخلايا الجلفانية'
    },
    {
      id: 'electrolysis-boost',
      title: 'تحفيز التحليل الكهربائي للماء',
      description: 'ارفع فرق الجهد فوق 1.8 V في وضع التحليل الكهربائي لمضاعفة وتيرة تصاعد غاز الهيدروجين.',
      targetDescription: 'الجهد > 1.8 V في وضع التحليل',
      checkSuccess: () => simulationType === 'electrolysis' && voltage >= 1.8,
      points: 150,
      badge: 'مولد الهيدروجين الأخضر'
    },
    {
      id: 'fuel-cell-ignition',
      title: 'تشغيل خلية وقود الهيدروجين',
      description: 'شغّل خلية الوقود لمشاهدة اندماج البروتونات وإنتاج الماء والطاقة النظيفة.',
      targetDescription: 'تشغيل وضع خلية الوقود',
      checkSuccess: () => simulationType === 'fuel' && isPlaying,
      points: 180,
      badge: 'مهندس الطاقة المستدامة'
    }
  ];

  const quizQuestions = [
    { question: 'في خلية دانييل الجلفانية، أين تحدث عملية الأكسدة وفقدان الإلكترونات؟', options: ['الكاثود (النحاس)', 'الأنود (الخارصين)', 'الجسر الملحي', 'المصباح'], correctIndex: 1, explanation: 'الأكسدة تحدث دائماً عند الأنود؛ حيث يتأكسد الخارصين Zn إلى أيونات Zn²⁺ ويفقد إلكترونين.' },
    { question: 'ما الوظيفة الأساسية للجسر الملحي في الخلية الجلفانية؟', options: ['توليد التيار الكهربائي', 'المحافظة على التعادل الكهربائي وإغلاق الدائرة', 'تسخين المحلول', 'امتصاص الأكسجين'], correctIndex: 1, explanation: 'الجسر الملحي يسمح بهجرة الأيونات لمنع تراكم الشحنات في نصفي الخلية، مما يحافظ على استمرار سريان التيار.' },
    { question: 'ما هو الناتج الوحيد العادم النظيف الصادر عن خلية وقود الهيدروجين؟', options: ['ثاني أكسيد الكربون', 'الماء H₂O', 'أول أكسيد الكربون', 'الأوزون'], correctIndex: 1, explanation: 'خلية الوقود تدمج غازي الهيدروجين والأكسجين كيميائياً لإنتاج طاقة كهربائية ونفاياتها هي ماء نقي H₂O فقط.' },
    { question: 'ما هي النسبة الحجمية للغازين المتصاعدين عند التحليل الكهربائي للماء النقي؟', options: ['1 : 1', '2 هيدروجين : 1 أكسجين', '1 هيدروجين : 2 أكسجين', '3 : 1'], correctIndex: 1, explanation: 'لأن جزيء الماء يتكون من ذرتي هيدروجين وذرة أكسجين (H₂O)، فإن حجم غاز الهيدروجين المتصاعد عند الكاثود يعادل ضعف حجم غاز الأكسجين عند الأنود.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 text-white p-4">
      
      {/* TOP HEADER */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => { const isGJU = sessionStorage.getItem('gju_mode') === 'true'; navigate(isGJU ? '/gju-competition' : '/scientific-simulations'); }}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة للمحاكاة'}
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
          ⚡ مختبر الكيمياء الكهربائية والخلايا الكهروكيميائية 3D
        </h1>
        <div className="w-24" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* LIVE HUD */}
        <CyberLabHUD
          title="محطة القياسات الكهروكيميائية الحية"
          statusBadge={simulationType === 'galvanic' ? "GALVANIC ACTIVE" : simulationType === 'electrolysis' ? "ELECTROLYSIS RUNNING" : "PEM FUEL CELL"}
          showWaveform={true}
          waveformColor={simulationType === 'galvanic' ? "#f59e0b" : simulationType === 'electrolysis' ? "#06b6d4" : "#10b981"}
          waveformSpeed={voltage}
          metrics={hudMetrics}
        />

        {/* MAIN WORKSTATION GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* 3D VIEWPORT & CONTROLS (3 COLS) */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Viewport Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-xl">
              
              {/* Simulation Mode Tabs */}
              <Tabs value={simulationType} onValueChange={(v) => { setSimulationType(v as any); labSound.play('click'); }}>
                <TabsList className="bg-slate-800/80 border border-slate-700/60 p-1">
                  <TabsTrigger value="galvanic" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                    🔋 خلية دانييل الجلفانية
                  </TabsTrigger>
                  <TabsTrigger value="electrolysis" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                    💧 التحليل الكهربائي للماء
                  </TabsTrigger>
                  <TabsTrigger value="fuel" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                    🌱 خلية وقود الهيدروجين
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Camera Presets */}
              <CinematicCameraController
                activePreset={cameraPreset}
                onSelectPreset={(p) => { setCameraPreset(p); labSound.play('whoosh'); }}
              />
            </div>

            {/* 3D Viewport Box */}
            <div className="relative w-full h-[520px] md:h-[600px] rounded-3xl overflow-hidden border border-amber-500/30 bg-radial from-slate-900 via-slate-950 to-black shadow-2xl">
              
              <Canvas camera={{ position: [0, 2.5, 7.5], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 15, 10]} intensity={1.3} />
                <pointLight position={[-10, -5, -5]} intensity={0.6} color="#38bdf8" />

                {simulationType === 'galvanic' && (
                  <GalvanicCell3D voltage={voltage} isPlaying={isPlaying} />
                )}

                {simulationType === 'electrolysis' && (
                  <ElectrolysisCell3D voltage={voltage} isPlaying={isPlaying} />
                )}

                {simulationType === 'fuel' && (
                  <FuelCell3D isPlaying={isPlaying} />
                )}

                <OrbitControls 
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={3.0}
                  maxDistance={16}
                />
              </Canvas>

              {/* Viewport Info Floating Badge */}
              <div className="absolute top-4 left-4 p-3 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl text-xs text-white shadow-xl">
                <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>
                    {simulationType === 'galvanic' ? 'خلية دانييل القياسية (Zn-Cu)' : 
                     simulationType === 'electrolysis' ? 'تحليل كهربائي: تفكيك الماء إلى H₂ و O₂' : 
                     'خلية وقود الهيدروجين الغشائية (PEM)'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {simulationType === 'galvanic' ? 'الأنود (Zn) يتأكسد والكاثود (Cu) يختزل مع سريان الإلكترونات عبر السلك.' : 
                   simulationType === 'electrolysis' ? 'فقاعات الهيدروجين تتصاعد عند الكاثود بنسبة ضعف فقاعات الأكسجين.' : 
                   'تفاعل نظيف يدمج الهيدروجين والأكسجين لإنتاج الماء والكهرباء.'}
                </div>
              </div>

              {/* Bottom Instructions */}
              <div className="absolute bottom-4 right-4 text-[11px] text-slate-400 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
                تدوير 360° حر • عجلة الفأرة للتكبير والتنقل بين الأقطاب
              </div>
            </div>

            {/* Slider Controls */}
            <div className="p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-lg space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <Battery className="w-4 h-4" />
                  التحكم في فرق الجهد الكهربائي (Voltage)
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-amber-400 border-amber-500/40">
                    {voltage.toFixed(2)} V
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-7 px-2 text-xs"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  </Button>
                </div>
              </div>
              <Slider
                value={[voltage]}
                onValueChange={(val) => { setVoltage(val[0]); setCurrentMilliAmps(Math.round(val[0] * 40)); }}
                min={0.5}
                max={2.5}
                step={0.05}
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>جهد منخفض (0.5 V)</span>
                <span className="text-amber-300 font-bold">الجهد القياسي لخلية دانييل (1.10 V)</span>
                <span>جهد فائق (2.5 V)</span>
              </div>
            </div>

          </div>

          {/* SIDEBAR: AI CO-PILOT, CHALLENGES & QUIZ (1 COL) */}
          <div className="xl:col-span-1 space-y-4">
            
            {/* Live AI Lab CoPilot */}
            <LiveAILabCoPilot
              simName="مختبر الكيمياء الكهربائية والخلايا الجلفانية 3D"
              subject="chemistry"
              liveHint={
                simulationType === 'galvanic' && Math.abs(voltage - 1.10) < 0.05
                  ? 'رائع! هذا هو جهد الخلية الجلفانية القياسي الدقيق (1.10 V) المحسوب من جهود الاختزال القياسية لقطبي Zn و Cu.'
                  : simulationType === 'electrolysis'
                  ? 'ملاحظة كيميائية: لاحظ كيف يتراكم غاز الهيدروجين عند الكاثود السالب بسرعة مضاعفة لغاز الأكسجين عند الأنود.'
                  : 'تفاعل وقود الهيدروجين ينتج تياراً مستمراً وبخار ماء نقي، وهو جوهر النقل الأخضر المستدام.'
              }
              currentParameters={{
                'نوع المنظومة الكهروكيميائية': simulationType === 'galvanic' ? 'خلية جلفانية' : simulationType === 'electrolysis' ? 'تحليل كهربائي' : 'خلية وقود',
                'فرق الجهد': `${voltage.toFixed(2)} V`,
                'شدة التيار': `${isPlaying ? currentMilliAmps : 0} mA`,
                'طاقة غيبس الحرة': `${gibbsFreeEnergy.toFixed(1)} kJ/mol`
              }}
            />

            {/* Challenges Engine */}
            <LabChallengeEngine challenges={challenges} />

            {/* Scientific Formulas & Info Card */}
            <InfoSection
              data={[
                { label: 'جهد الخلية E°', value: `${voltage.toFixed(2)} V`, color: 'text-amber-300' },
                { label: 'طاقة غيبس الحرة ΔG°', value: `${gibbsFreeEnergy.toFixed(1)} kJ`, color: 'text-emerald-300' },
                { label: 'نصف تفاعل الأكسدة (الأنود)', value: 'Zn → Zn²⁺ + 2e⁻', color: 'text-red-300' },
                { label: 'نصف تفاعل الاختزال (الكاثود)', value: 'Cu²⁺ + 2e⁻ → Cu', color: 'text-cyan-300' }
              ]}
              formulas={[
                { name: 'جهد الخلية القياسي', formula: 'E°cell = E°cathode - E°anode', description: 'الفرق بين جهود الاختزال المعيارية لنصفي الخلية' },
                { name: 'معادلة طاقة غيبس والجهد', formula: 'ΔG° = -nFE°cell', description: 'العلاقة بين التلقائية الثرموديناميكية والقوة الدافعة' },
                { name: 'معادلة نيرنست للجهد غير القياسي', formula: 'E = E° - (RT/nF) ln Q', description: 'لحساب الجهد عند تغير تراكيز المحاليل أو الحرارة' }
              ]}
              facts={[
                'سميت خلية دانييل نسبة إلى الكيميائي الإنجليزي جون دانييل عام 1836.',
                'التحليل الكهربائي للماء هو الأساس لصناعة الهيدروجين الأخضر للطاقة النظيفة.',
                'مركبات الفضاء تستخدم خلايا وقود الهيدروجين لتوليد الكهرباء وشرب المياه الناتجة منها!'
              ]}
            />

            {/* Interactive Quiz */}
            <QuizSection questions={quizQuestions} />

          </div>

        </div>

      </div>
    </div>
  );
};

export default ElectrochemistrySimulation;
