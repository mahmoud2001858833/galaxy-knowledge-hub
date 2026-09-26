import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Cylinder, Sphere, Ring, Float } from '@react-three/drei';
import * as THREE from 'three';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FlaskConical, 
  Droplet, 
  Sparkles, 
  RotateCcw, 
  Play, 
  Pause, 
  Activity, 
  Beaker, 
  CheckCircle2,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { CyberLabHUD } from '@/components/simulations/CyberLabHUD';
import { LiveAILabCoPilot } from '@/components/simulations/LiveAILabCoPilot';
import { CinematicCameraController, CameraPreset } from '@/components/simulations/CinematicCameraController';
import { LabChallengeEngine } from '@/components/simulations/LabChallengeEngine';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';
import { labSound } from '@/utils/labAudio';

// Color calculation for pH
export const getPhColor = (val: number): string => {
  if (val <= 1.5) return '#ef4444'; // Strong red
  if (val <= 3.5) return '#f97316'; // Orange-red
  if (val <= 5.5) return '#facc15'; // Yellow
  if (val <= 6.5) return '#a3e635'; // Lime green
  if (val <= 7.5) return '#22c55e'; // Green (Neutral)
  if (val <= 9.0) return '#06b6d4'; // Cyan
  if (val <= 11.0) return '#3b82f6'; // Blue
  if (val <= 12.5) return '#6366f1'; // Indigo
  return '#9333ea'; // Purple/Violet
};

// ----------------------------------------------------
// 3D BEAKER WITH DYNAMIC FLUID & BUBBLES
// ----------------------------------------------------
const Beaker3D: React.FC<{
  ph: number;
  liquidLevel?: number;
  isStirring?: boolean;
}> = ({ ph, liquidLevel = 0.65, isStirring = false }) => {
  const liquidColor = useMemo(() => getPhColor(ph), [ph]);
  const stirRef = useRef<THREE.Mesh>(null);
  const bubblesGroup = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (stirRef.current && isStirring) {
      stirRef.current.rotation.y += delta * 15;
    }
    if (bubblesGroup.current) {
      bubblesGroup.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Glass Beaker Body */}
      <Cylinder args={[1.5, 1.45, 3.2, 32, 1, true]} position={[0, 1.6, 0]}>
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.92}
          opacity={0.3}
          transparent
          roughness={0.05}
          metalness={0.1}
          ior={1.5}
          side={THREE.DoubleSide}
        />
      </Cylinder>

      {/* Beaker Glass Base */}
      <Cylinder args={[1.45, 1.45, 0.15, 32]} position={[0, 0.08, 0]}>
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.4} transparent roughness={0.1} />
      </Cylinder>

      {/* Internal Liquid Volume */}
      <Cylinder 
        args={[1.42, 1.38, 3.0 * liquidLevel, 32]} 
        position={[0, (3.0 * liquidLevel) / 2 + 0.15, 0]}
      >
        <meshStandardMaterial
          color={liquidColor}
          emissive={liquidColor}
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.78}
        />
      </Cylinder>

      {/* Liquid Top Meniscus Ring */}
      <Ring 
        args={[0, 1.41, 32]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 3.0 * liquidLevel + 0.15, 0]}
      >
        <meshStandardMaterial
          color={liquidColor}
          emissive={liquidColor}
          emissiveIntensity={0.5}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </Ring>

      {/* Magnetic Stir Bar in base */}
      {isStirring && (
        <mesh ref={stirRef} position={[0, 0.22, 0]}>
          <capsuleGeometry args={[0.08, 0.45, 8, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.8} />
        </mesh>
      )}

      {/* Fuming Bubbles for extreme acid/base */}
      {(ph < 3.0 || ph > 11.5) && (
        <group ref={bubblesGroup}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Float key={i} speed={3} rotationIntensity={0.2} floatIntensity={0.8}>
              <Sphere 
                args={[0.06, 12, 12]} 
                position={[
                  Math.sin(i * 1.3) * 0.8,
                  1.0 + (i * 0.3) % (3.0 * liquidLevel),
                  Math.cos(i * 1.3) * 0.8
                ]}
              >
                <meshStandardMaterial color="#ffffff" transparent opacity={0.65} roughness={0.1} />
              </Sphere>
            </Float>
          ))}
        </group>
      )}

      {/* Measurement Graduation Lines on Beaker */}
      {[0.8, 1.4, 2.0, 2.6].map((y, i) => (
        <Ring key={i} args={[1.48, 1.49, 32, 1, 0, Math.PI * 0.4]} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </Ring>
      ))}

      {/* Glass Electrode Probe (مجس قياس الـ pH الزجاجي) */}
      <group position={[0.7, 1.8, 0.4]} rotation={[0, 0, -0.15]}>
        <Cylinder args={[0.12, 0.12, 2.8, 16]}>
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </Cylinder>
        {/* Sensitive Glass Bulb Tip */}
        <Sphere args={[0.16, 16, 16]} position={[0, -1.4, 0]}>
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} roughness={0.1} />
        </Sphere>
      </group>
    </group>
  );
};

// ----------------------------------------------------
// 3D TITRATION APPARATUS (BURETTE + DRIPS + FLASK)
// ----------------------------------------------------
const TitrationApparatus3D: React.FC<{
  acidVolume: number;
  baseVolume: number;
  isPlaying: boolean;
}> = ({ acidVolume, baseVolume, isPlaying }) => {
  const dripRef = useRef<THREE.Mesh>(null);
  
  // Calculate pH during strong acid - strong base titration
  const currentPh = useMemo(() => {
    // Equivalence at 25 ml
    if (acidVolume < 24.5) {
      return 13.0 - (acidVolume / 25) * 5.0;
    } else if (acidVolume <= 25.5) {
      return 7.0 - (acidVolume - 25.0) * 8.0;
    } else {
      return Math.max(1.0, 3.0 - ((acidVolume - 25) / 25) * 2.0);
    }
  }, [acidVolume]);

  const buretteFillRatio = (50 - acidVolume) / 50;

  useFrame((state) => {
    if (dripRef.current && isPlaying && acidVolume < 50) {
      const t = (state.clock.elapsedTime * 4) % 1;
      dripRef.current.position.y = 1.3 - t * 1.5;
      dripRef.current.scale.setScalar(1 - t * 0.4);
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* 1. Burette Stand & Clamp (حامل السحاحة المعدني) */}
      <Cylinder args={[0.06, 0.06, 6.5, 16]} position={[-1.6, 2.5, 0]}>
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </Cylinder>
      {/* Stand Base */}
      <mesh position={[-1.2, -0.1, 0]}>
        <boxGeometry args={[1.5, 0.2, 1.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Horizontal Clamp Arm */}
      <Cylinder args={[0.04, 0.04, 1.6, 12]} position={[-0.8, 4.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </Cylinder>

      {/* 2. Glass Burette Tube (السحاحة الزجاجية المدرجة) */}
      <group position={[0, 3.6, 0]}>
        <Cylinder args={[0.22, 0.22, 3.6, 24, 1, true]}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.92} opacity={0.3} transparent roughness={0.05} />
        </Cylinder>
        {/* Acid in Burette */}
        <Cylinder 
          args={[0.2, 0.2, 3.4 * buretteFillRatio, 24]} 
          position={[0, -1.7 + (3.4 * buretteFillRatio) / 2, 0]}
        >
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.4} transparent opacity={0.85} />
        </Cylinder>
        {/* Burette Stopcock Valve (صنبور السحاحة) */}
        <mesh position={[0, -1.9, 0]}>
          <boxGeometry args={[0.5, 0.12, 0.12]} />
          <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Burette Fine Tip */}
        <Cylinder args={[0.06, 0.03, 0.4, 16]} position={[0, -2.15, 0]}>
          <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
        </Cylinder>
      </group>

      {/* 3. Falling Liquid Drip */}
      {isPlaying && acidVolume < 50 && (
        <Sphere ref={dripRef} args={[0.06, 12, 12]} position={[0, 1.3, 0]}>
          <meshStandardMaterial color="#ef4444" emissive="#f87171" emissiveIntensity={0.6} />
        </Sphere>
      )}

      {/* 4. Erlenmeyer Flask at the Bottom (الدورق المخروطي مع السائل وقضيب التحريك) */}
      <Beaker3D ph={currentPh} liquidLevel={0.45 + (acidVolume / 50) * 0.3} isStirring={isPlaying} />
    </group>
  );
};

// ----------------------------------------------------
// 3D BUFFER SOLUTION RESILIENCE COMPARISON SCENE
// ----------------------------------------------------
const BufferComparison3D: React.FC<{
  addedDrops: number;
}> = ({ addedDrops }) => {
  // Water pH swings rapidly, Buffer pH changes minutely
  const waterPh = Math.max(1.5, 7.0 - addedDrops * 0.9);
  const bufferPh = Math.max(6.8, 7.4 - addedDrops * 0.05);

  return (
    <group position={[0, -0.4, 0]}>
      {/* Left: Pure Water Beaker */}
      <group position={[-2.2, 0, 0]}>
        <Beaker3D ph={waterPh} liquidLevel={0.6} />
      </group>

      {/* Right: Acetate Buffer Beaker */}
      <group position={[2.2, 0, 0]}>
        <Beaker3D ph={bufferPh} liquidLevel={0.6} />
      </group>
    </group>
  );
};

// ====================================================
// MAIN ACIDS & BASES 3D SIMULATION PAGE
// ====================================================
const AcidsBasesSimulation = () => {
  const [activeTab, setActiveTab] = useState<'ph-scale' | 'titration' | 'buffer'>('ph-scale');
  const [ph, setPh] = useState<number>(7.0);
  const [acidVolume, setAcidVolume] = useState<number>(0);
  const [baseVolume] = useState<number>(25);
  const [addedDrops, setAddedDrops] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  // Real world preset solutions
  const solutionPresets = [
    { name: 'حمض الهيدروكلوريك HCl', ph: 1.0, type: 'strong-acid' },
    { name: 'عصير ليمون طازج', ph: 2.2, type: 'weak-acid' },
    { name: 'حمض الخليك (الخل)', ph: 3.0, type: 'weak-acid' },
    { name: 'ماء نقي مقطر', ph: 7.0, type: 'neutral' },
    { name: 'دم الإنسان السليم', ph: 7.4, type: 'buffer' },
    { name: 'بيكربونات الصوديوم', ph: 8.4, type: 'weak-base' },
    { name: 'أمونيا منزلية', ph: 11.2, type: 'weak-base' },
    { name: 'هيدروكسيد الصوديوم NaOH', ph: 13.5, type: 'strong-base' },
  ];

  // Titration instantaneous pH calculation
  const currentTitrationPh = useMemo(() => {
    if (acidVolume < 24.5) {
      return 13.0 - (acidVolume / 25) * 5.0;
    } else if (acidVolume <= 25.5) {
      return 7.0 - (acidVolume - 25.0) * 8.0;
    } else {
      return Math.max(1.0, 3.0 - ((acidVolume - 25) / 25) * 2.0);
    }
  }, [acidVolume]);

  const effectivePh = activeTab === 'ph-scale' ? ph : activeTab === 'titration' ? currentTitrationPh : 7.4 - addedDrops * 0.05;
  const hConcentration = Math.pow(10, -effectivePh);
  const ohConcentration = Math.pow(10, -(14 - effectivePh));

  // Cyber-Lab HUD Metrics
  const hudMetrics = [
    {
      id: 'ph',
      label: 'الرقم الهيدروجيني pH',
      value: effectivePh.toFixed(2),
      unit: '',
      color: effectivePh < 6 ? 'text-rose-400' : effectivePh > 8 ? 'text-cyan-400' : 'text-emerald-400',
      progressPercent: (effectivePh / 14) * 100,
      trend: (effectivePh < 7 ? 'down' : 'up') as any
    },
    {
      id: 'h_ion',
      label: 'تركيز [H⁺]',
      value: hConcentration < 1e-4 ? hConcentration.toExponential(2) : hConcentration.toFixed(4),
      unit: 'M',
      color: 'text-amber-400',
      progressPercent: Math.min(100, (14 - effectivePh) * 7.1),
      trend: 'stable' as const
    },
    {
      id: 'oh_ion',
      label: 'تركيز [OH⁻]',
      value: ohConcentration < 1e-4 ? ohConcentration.toExponential(2) : ohConcentration.toFixed(4),
      unit: 'M',
      color: 'text-blue-400',
      progressPercent: Math.min(100, effectivePh * 7.1),
      trend: 'stable' as const
    },
    {
      id: 'nature',
      label: 'طبيعة الوسط',
      value: effectivePh < 6.8 ? 'حمضي (Acidic)' : effectivePh > 7.2 ? 'قاعدي (Basic)' : 'متعادل (Neutral)',
      unit: '',
      color: effectivePh < 6.8 ? 'text-red-400' : effectivePh > 7.2 ? 'text-indigo-400' : 'text-emerald-400',
      progressPercent: 100,
      trend: 'stable' as const
    }
  ];

  // Lab Challenge Engine Missions
  const challenges = [
    {
      id: 'titration-neutral',
      title: 'معايرة نقطة التكافؤ التامة',
      description: 'أضف الحمض من السحاحة بدقة وأوقف المعايرة تماماً عند نقطة التعادل (pH بين 6.8 و 7.2).',
      targetDescription: 'pH بين 6.8 و 7.2',
      checkSuccess: () => activeTab === 'titration' && currentTitrationPh >= 6.8 && currentTitrationPh <= 7.2,
      points: 200,
      badge: 'خبير المعايرة الكيميائية'
    },
    {
      id: 'blood-ph-safe',
      title: 'محاكاة حموضة الدم البشري',
      description: 'اضبط قيمة الرقم الهيدروجيني إلى المدى الفسيولوجي الدقيق لدم الإنسان (7.35 إلى 7.45).',
      targetDescription: 'pH بين 7.35 و 7.45',
      checkSuccess: () => activeTab === 'ph-scale' && ph >= 7.35 && ph <= 7.45,
      points: 150,
      badge: 'حارس الاتزان الحيوي'
    },
    {
      id: 'buffer-resilience',
      title: 'اختبار صلابة المحلول المنظم',
      description: 'أضف 5 قطرات حمض في وضع المحاليل المنظمة ولاحظ كيف يقاوم المحلول التغير مقارنة بالماء النقي.',
      targetDescription: 'إضافة 5 قطرات في وضع المنظم',
      checkSuccess: () => activeTab === 'buffer' && addedDrops >= 5,
      points: 180,
      badge: 'مهندس المحاليل المنظمة'
    }
  ];

  const quizQuestions = [
    { question: 'ما قيمة pH الماء النقي عند 25°C؟', options: ['0', '5', '7', '14'], correctIndex: 2, explanation: 'الماء النقي متعادل وله pH = 7 حيث تركيز H⁺ يساوي تركيز OH⁻.' },
    { question: 'أي من التالي يُعد حمضاً قوياً تام التأين؟', options: ['حمض الأسيتيك', 'حمض الهيدروكلوريك HCl', 'حمض الكربونيك', 'حمض الستريك'], correctIndex: 1, explanation: 'HCl حمض قوي يتأين بنسبة 100% في الماء، بينما بقية الخيارات أحماض ضعيفة.' },
    { question: 'ما وظيفة المحلول المنظم (Buffer)؟', options: ['تسريع التفاعل الكيميائي', 'مقاومة التغير الحاد في قيمة pH', 'زيادة الحموضة القصوى', 'تبخير المحلول'], correctIndex: 1, explanation: 'المحلول المنظم يتكون من حمض ضعيف وقاعدته المرافقة، فيقاوم تغير pH عند إضافة أحماض أو قواعد.' },
    { question: 'عند إضافة 25 mL من HCl (0.1M) إلى 25 mL من NaOH (0.1M)، ما قيمة pH الناتجة؟', options: ['1', '7', '13', '0'], correctIndex: 1, explanation: 'تفاعل تعادل تام بين حمض قوي وقاعدة قوية متساويي التركيز والحجم ينتج ماء وملحاً متعادلاً مع pH = 7.' },
    { question: 'إذا كان pH المحلول يساوي 3، فما هو تركيز أيون الهيدرونيوم [H⁺]؟', options: ['10⁻³ M', '10⁻¹¹ M', '3 M', '0.003 M'], correctIndex: 0, explanation: 'حسب التعريف الرياضي: [H⁺] = 10^(-pH) = 10^(-3) = 0.001 M.' }
  ];

  return (
    <SimulationLayout 
      title="مختبر الأحماض والقواعد والمعايرة الكيميائية 3D" 
      titleGradient="from-amber-400 via-rose-400 to-indigo-400" 
      backgroundGradient="from-slate-950 via-red-950/30 to-slate-950"
    >
      <div className="space-y-6">
        
        {/* TOP LIVE HUD */}
        <CyberLabHUD
          title="محطة الرصد الكيميائي وراسم معايرة الـ pH"
          statusBadge={effectivePh < 3 ? "STRONG ACIDIC" : effectivePh > 11 ? "STRONG BASIC" : "OPTIMAL REGIME"}
          showWaveform={true}
          waveformColor={getPhColor(effectivePh)}
          waveformSpeed={Math.max(0.5, Math.abs(effectivePh - 7) * 0.3)}
          metrics={hudMetrics}
        />

        {/* MAIN WORKSTATION GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* 3D CANVAS & CONTROLS (3 COLS) */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Viewport Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-xl">
              
              {/* Tab Selector */}
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); labSound.play('click'); }}>
                <TabsList className="bg-slate-800/80 border border-slate-700/60 p-1">
                  <TabsTrigger value="ph-scale" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                    🌡️ مقياس الـ pH والمحاليل
                  </TabsTrigger>
                  <TabsTrigger value="titration" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-rose-600 data-[state=active]:text-white">
                    🧪 المعايرة الحجمية والدورق
                  </TabsTrigger>
                  <TabsTrigger value="buffer" className="text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
                    🛡️ المحاليل المنظمة والمقارنة
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Camera Presets */}
              <CinematicCameraController
                activePreset={cameraPreset}
                onSelectPreset={(p) => { setCameraPreset(p); labSound.play('whoosh'); }}
              />
            </div>

            {/* 3D Viewport Frame */}
            <div className="relative w-full h-[520px] md:h-[600px] rounded-3xl overflow-hidden border border-amber-500/30 bg-radial from-slate-900 via-slate-950 to-black shadow-2xl">
              
              <Canvas camera={{ position: [0, 2.5, 6.5], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 15, 10]} intensity={1.3} />
                <pointLight position={[-10, -5, -5]} intensity={0.5} color="#38bdf8" />

                {activeTab === 'ph-scale' && (
                  <Beaker3D ph={ph} liquidLevel={0.7} isStirring={false} />
                )}

                {activeTab === 'titration' && (
                  <TitrationApparatus3D 
                    acidVolume={acidVolume} 
                    baseVolume={baseVolume} 
                    isPlaying={isPlaying} 
                  />
                )}

                {activeTab === 'buffer' && (
                  <BufferComparison3D addedDrops={addedDrops} />
                )}

                <OrbitControls 
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={2.5}
                  maxDistance={15}
                />
              </Canvas>

              {/* Real-time Floating Overlay Badge */}
              <div className="absolute top-4 left-4 p-3 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl text-xs text-white shadow-xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getPhColor(effectivePh) }} />
                  <span className="font-bold text-white">الرقم الهيدروجيني: {effectivePh.toFixed(2)}</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {effectivePh < 3 ? 'حمض قوي جداً (تأين كامل)' : effectivePh < 6.8 ? 'وسط حمضي' : effectivePh <= 7.2 ? 'نقطة التعادل التام' : effectivePh < 11 ? 'وسط قاعدي' : 'قاعدة قوية كاوية'}
                </div>
              </div>

              {/* Bottom Instructions */}
              <div className="absolute bottom-4 right-4 text-[11px] text-slate-400 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
                تدوير 360° حر • عجلة الفأرة للتكبير والاقتراب من الكأس
              </div>
            </div>

            {/* Interactive Physical Controls */}
            <div className="p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-lg space-y-4">
              
              {activeTab === 'ph-scale' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <FlaskConical className="w-4 h-4" />
                      التحكم اليدوي في الرقم الهيدروجيني (pH)
                    </span>
                    <Badge variant="outline" className="text-amber-400 border-amber-500/40">
                      pH = {ph.toFixed(2)}
                    </Badge>
                  </div>
                  <Slider
                    value={[ph]}
                    onValueChange={(val) => setPh(val[0])}
                    min={0}
                    max={14}
                    step={0.1}
                  />

                  {/* Preset solution quick selectors */}
                  <div className="pt-2">
                    <span className="text-[11px] text-slate-400 block mb-2 font-medium">محاليل كيميائية وواقعية شائعة:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {solutionPresets.map((sol, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant="outline"
                          onClick={() => { setPh(sol.ph); labSound.play('click'); }}
                          className={`text-xs justify-start h-8 border-white/10 ${Math.abs(ph - sol.ph) < 0.2 ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' : 'text-slate-300'}`}
                        >
                          <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: getPhColor(sol.ph) }} />
                          <span className="truncate">{sol.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'titration' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-rose-300">
                      <Droplet className="w-4 h-4" />
                      حجم الحمض القياسي المضاف من السحاحة (mL)
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-rose-400 border-rose-500/40">
                        {acidVolume.toFixed(1)} / 50 mL
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="h-7 px-2 text-xs"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setAcidVolume(0); labSound.play('click'); }}
                        className="h-7 px-2 text-xs border-white/20"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[acidVolume]}
                    onValueChange={(val) => setAcidVolume(val[0])}
                    min={0}
                    max={50}
                    step={0.2}
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>بداية المعايرة (0 mL - محلول قاعدي pH 13)</span>
                    <span className="text-amber-300 font-bold">نقطة التكافؤ (25 mL - pH 7)</span>
                    <span>فائض حمضي (50 mL - pH 1)</span>
                  </div>
                </div>
              )}

              {activeTab === 'buffer' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <Beaker className="w-4 h-4" />
                      إضافة قطرات حمض الهيدروكلوريك HCl إلى الكأسين
                    </span>
                    <Badge variant="outline" className="text-cyan-400 border-cyan-500/40">
                      {addedDrops} قطرات مضافة
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => { setAddedDrops(prev => Math.min(10, prev + 1)); labSound.play('laser'); }}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs"
                    >
                      <Droplet className="w-3.5 h-3.5 mr-1" />
                      أضف قطرة حمض قوية (+1)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setAddedDrops(0); labSound.play('click'); }}
                      className="text-xs border-white/20"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      إعادة ملء الكأسين
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-red-500/30">
                      <div className="font-bold text-red-400 mb-1">الكأس الأيسر (ماء مقطر عادي):</div>
                      <p className="text-slate-300 text-[11px]">ينهار الـ pH سريعاً من 7.0 إلى {Math.max(1.5, 7.0 - addedDrops * 0.9).toFixed(1)} لعدم وجود نظام تخزين أيوني.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/30">
                      <div className="font-bold text-emerald-400 mb-1">الكأس الأيمن (محلول أسيتات منظم):</div>
                      <p className="text-slate-300 text-[11px]">يقاوم تغير الـ pH ويبقى ثابتاً تقريباً عند {Math.max(6.8, 7.4 - addedDrops * 0.05).toFixed(1)} بفضل تفاعل أيونات الأسيتات.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* SIDEBAR: AI CO-PILOT, CHALLENGES & QUIZ (1 COL) */}
          <div className="xl:col-span-1 space-y-4">
            
            {/* Live AI Lab CoPilot */}
            <LiveAILabCoPilot
              simName="مختبر الأحماض والقواعد والمعايرة 3D"
              subject="chemistry"
              liveHint={
                activeTab === 'titration' && Math.abs(acidVolume - 25) < 1.0
                  ? 'انتبه جيداً: أنت الآن في نقطة التكافؤ الحرجة! قطرة واحدة إضافية ستقلب لون الكاشف كلياً.'
                  : effectivePh < 2.5
                  ? 'وسط شديد الحموضة: تركيز أيونات الهيدرونيوم مرتفع جداً؛ احذر من مخاطر تآكل الأنسجة والمعادن.'
                  : effectivePh > 12.0
                  ? 'وسط شديد القاعدية: تركيز أيونات الهيدروكسيد مرتفع جداً؛ صابوني الملمس وكاوٍ للجلد.'
                  : 'المحلول في نطاق الاتزان الكيميائي المعتدل.'
              }
              currentParameters={{
                'التبويب النشط': activeTab === 'ph-scale' ? 'مقياس pH' : activeTab === 'titration' ? 'معايرة حجمية' : 'مقارنة المحلول المنظم',
                'الرقم الهيدروجيني pH': effectivePh.toFixed(2),
                'تركيز [H+]': hConcentration.toExponential(2),
                'تركيز [OH-]': ohConcentration.toExponential(2),
                'حجم المعاير': `${acidVolume} mL`,
              }}
            />

            {/* Gamified Lab Challenges */}
            <LabChallengeEngine challenges={challenges} />

            {/* Scientific Information & Formulas Card */}
            <InfoSection
              data={[
                { label: 'الرقم الهيدروجيني pH', value: effectivePh.toFixed(2), color: 'text-amber-300' },
                { label: 'تركيز [H⁺]', value: `${hConcentration.toExponential(2)} M`, color: 'text-rose-300' },
                { label: 'طبيعة المحلول', value: effectivePh < 6.8 ? 'حمضي' : effectivePh > 7.2 ? 'قاعدي' : 'متعادل', color: effectivePh < 6.8 ? 'text-red-300' : effectivePh > 7.2 ? 'text-blue-300' : 'text-emerald-300' },
              ]}
              formulas={[
                { name: 'تعريف الرقم الهيدروجيني', formula: 'pH = -log[H⁺]', description: 'اللوغاريتم العشري السالب لفاعلية أيونات الهيدرونيوم' },
                { name: 'ثابت تأين الماء (عند 25°C)', formula: 'Kw = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴', description: 'العلاقة التكاملية بين الحموضة والقاعدية' },
                { name: 'معادلة هندرسون-هاسلبالخ', formula: 'pH = pKa + log([A⁻]/[HA])', description: 'لحساب قيمة الرقم الهيدروجيني للمحاليل المنظمة' }
              ]}
              explanation="الأحماض والقواعد تلعب دوراً جوهرياً في كافة العمليات الكيميائية والحيوية. تتراوح قيمة مقياس pH بين 0 و 14، حيث يمثل الرقم 7 نقطة التعادل التام كحال الماء النقي."
              facts={[
                'دم الإنسان محلول منظم فائق الدقة يحافظ على pH بين 7.35 و 7.45 لحماية حياة الخلايا.',
                'عصير المعدة يحتوي على حمض HCl بتركيز يجعله عند pH ≈ 1.5 لهضم البروتينات والقضاء على الميكروبات.',
                'المطر الحمضي ينتج عن ذوبان أكاسيد الكبريت والنيتروجين في ماء السحب ليهبط بـ pH أقل من 5.6.',
              ]}
            />

            {/* Interactive Quiz Section */}
            <QuizSection questions={quizQuestions} />

          </div>

        </div>

      </div>
    </SimulationLayout>
  );
};

export default AcidsBasesSimulation;
