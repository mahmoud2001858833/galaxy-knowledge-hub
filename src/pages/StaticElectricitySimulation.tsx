import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Cylinder, Box, Html } from '@react-three/drei';
import * as THREE from 'three';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Play, Pause, RotateCcw, Zap, Plus, Minus, Eye, Sparkles, Activity } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

// Core Framework
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import CinematicCameraController, { CameraPreset } from '@/components/simulations/CinematicCameraController';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

type ElectrostaticMode = 'coulomb' | 'electroscope' | 'vandegraaff';

// 3D Electrostatic Engine
const ElectrostaticEngine3D: React.FC<{
  mode: ElectrostaticMode;
  chargeQ1: number; // microCoulombs
  chargeQ2: number;
  distance: number; // cm
  chargeStrength: number;
  isPlaying: boolean;
}> = ({ mode, chargeQ1, chargeQ2, distance, chargeStrength, isPlaying }) => {
  const sparkRef = useRef<THREE.Group>(null);
  const beltChargesRef = useRef<THREE.Group>(null);

  // Animate Van de Graaff belt charges & spark jitter
  useFrame((state, delta) => {
    if (beltChargesRef.current && isPlaying) {
      beltChargesRef.current.children.forEach((child, i) => {
        child.position.y = -1.2 + ((state.clock.elapsedTime * 2 + i * 0.4) % 2.4);
      });
    }
  });

  // Coulomb force calculation: F = k * |q1 * q2| / r^2 (k = 8.99e9)
  // Distance in meters: r = distance / 100
  const rMeters = Math.max(0.02, distance / 100);
  const coulombForceN = (8.99e9 * Math.abs(chargeQ1 * 1e-6 * chargeQ2 * 1e-6)) / (rMeters * rMeters);
  const isRepulsive = (chargeQ1 * chargeQ2) > 0;

  // Electroscope deflection angle in radians
  const electroscopeAngle = Math.min(Math.PI / 3, (chargeStrength / 10) * (Math.PI / 4));

  return (
    <group position={[0, -0.2, 0]}>
      {/* Insulated Laboratory Bench Surface */}
      <mesh position={[0, -2.2, 0]}>
        <boxGeometry args={[11, 0.3, 8]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* MODE 1: COULOMB'S LAW & 3D POINT CHARGES */}
      {mode === 'coulomb' && (
        <group position={[0, 0, 0]}>
          {/* Charge Q1 (Left) */}
          <group position={[-distance / 20, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.45, 32, 32]} />
              <meshStandardMaterial
                color={chargeQ1 > 0 ? '#ef4444' : '#3b82f6'}
                emissive={chargeQ1 > 0 ? '#ef4444' : '#3b82f6'}
                emissiveIntensity={0.6}
                roughness={0.2}
              />
            </mesh>
            <pointLight position={[0, 0, 0]} color={chargeQ1 > 0 ? '#ef4444' : '#3b82f6'} intensity={1.5} distance={3} />
            <Html position={[0, 0.8, 0]} center distanceFactor={10}>
              <div className={`font-mono text-xs px-2 py-0.5 rounded border font-bold ${chargeQ1 > 0 ? 'bg-red-950 text-red-300 border-red-500' : 'bg-blue-950 text-blue-300 border-blue-500'}`}>
                Q₁ = {chargeQ1 > 0 ? `+${chargeQ1}` : chargeQ1} μC
              </div>
            </Html>
            {/* Force Vector Arrow */}
            <mesh position={[(isRepulsive ? -0.7 : 0.7), 0, 0]} rotation={[0, 0, isRepulsive ? Math.PI / 2 : -Math.PI / 2]}>
              <coneGeometry args={[0.12, 0.4, 16]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
          </group>

          {/* Charge Q2 (Right) */}
          <group position={[distance / 20, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.45, 32, 32]} />
              <meshStandardMaterial
                color={chargeQ2 > 0 ? '#ef4444' : '#3b82f6'}
                emissive={chargeQ2 > 0 ? '#ef4444' : '#3b82f6'}
                emissiveIntensity={0.6}
                roughness={0.2}
              />
            </mesh>
            <pointLight position={[0, 0, 0]} color={chargeQ2 > 0 ? '#ef4444' : '#3b82f6'} intensity={1.5} distance={3} />
            <Html position={[0, 0.8, 0]} center distanceFactor={10}>
              <div className={`font-mono text-xs px-2 py-0.5 rounded border font-bold ${chargeQ2 > 0 ? 'bg-red-950 text-red-300 border-red-500' : 'bg-blue-950 text-blue-300 border-blue-500'}`}>
                Q₂ = {chargeQ2 > 0 ? `+${chargeQ2}` : chargeQ2} μC
              </div>
            </Html>
            {/* Force Vector Arrow */}
            <mesh position={[(isRepulsive ? 0.7 : -0.7), 0, 0]} rotation={[0, 0, isRepulsive ? -Math.PI / 2 : Math.PI / 2]}>
              <coneGeometry args={[0.12, 0.4, 16]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
          </group>

          {/* Electric Flux Connection Lines between Q1 and Q2 */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, distance / 10, 16]} />
            <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
          </mesh>
        </group>
      )}

      {/* MODE 2: GOLD-LEAF ELECTROSCOPE */}
      {mode === 'electroscope' && (
        <group position={[0, 0, 0]}>
          {/* Glass Jar Body */}
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 2.4, 32, 1, true]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.92}
              transparent
              roughness={0.06}
              ior={1.5}
            />
          </mesh>
          {/* Wooden base and top stopper */}
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[1.25, 1.25, 0.15, 32]} />
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </mesh>

          {/* Top Brass Collector Disc */}
          <mesh position={[0, 1.35, 0]}>
            <cylinderGeometry args={[0.65, 0.65, 0.1, 32]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Brass Vertical Stem Rod */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 1.9, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Gold Leaves Diverging (Left and Right) */}
          <group position={[0, -0.6, 0]}>
            {/* Left Gold Leaf */}
            <mesh
              position={[-Math.sin(electroscopeAngle) * 0.35, -Math.cos(electroscopeAngle) * 0.35, 0]}
              rotation={[0, 0, electroscopeAngle]}
            >
              <boxGeometry args={[0.05, 0.8, 0.2]} />
              <meshStandardMaterial color="#fef08a" metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Right Gold Leaf */}
            <mesh
              position={[Math.sin(electroscopeAngle) * 0.35, -Math.cos(electroscopeAngle) * 0.35, 0]}
              rotation={[0, 0, -electroscopeAngle]}
            >
              <boxGeometry args={[0.05, 0.8, 0.2]} />
              <meshStandardMaterial color="#fef08a" metalness={0.95} roughness={0.05} />
            </mesh>
          </group>

          {/* Angle Indicator Tag */}
          <Html position={[0, -1.3, 0]} center distanceFactor={10}>
            <div className="bg-slate-900/90 text-amber-300 font-mono text-xs px-2 py-1 rounded border border-amber-500/50">
              زاوية الانفراج θ = {((Math.min(Math.PI / 3, (chargeStrength / 10) * (Math.PI / 4)) * 180) / Math.PI).toFixed(1)}°
            </div>
          </Html>
        </group>
      )}

      {/* MODE 3: VAN DE GRAAFF GENERATOR */}
      {mode === 'vandegraaff' && (
        <group position={[0, 0, 0]}>
          {/* Motor / Base Chamber */}
          <mesh position={[0, -1.6, 0]}>
            <cylinderGeometry args={[1.1, 1.2, 0.8, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Insulating Acrylic Column */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 2.2, 24, 1, true]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.9}
              transparent
              roughness={0.08}
            />
          </mesh>

          {/* Moving Rubber Belt with Carried Positive Charges */}
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.1, 2.1, 0.25]} />
            <meshStandardMaterial color="#ef4444" roughness={0.8} />
          </mesh>

          {/* Animated charges on belt */}
          <group ref={beltChargesRef}>
            {[0, 1, 2, 3, 4].map((ci) => (
              <mesh key={`bcharge-${ci}`} position={[0.08, -1.0 + ci * 0.45, 0]}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshBasicMaterial color="#fef08a" />
              </mesh>
            ))}
          </group>

          {/* Top Polished Metallic Aluminum Dome Sphere */}
          <mesh position={[0, 1.3, 0]}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshStandardMaterial
              color="#cbd5e1"
              metalness={0.95}
              roughness={0.08}
              emissive="#c084fc"
              emissiveIntensity={chargeStrength > 6 ? 0.3 : 0.05}
            />
          </mesh>

          {/* High Voltage Lightning Sparks when Charge is high */}
          {chargeStrength > 5 && isPlaying && (
            <group ref={sparkRef}>
              {[-1.2, 1.2, 0].map((sx, idx) => (
                <mesh key={`spark-${idx}`} position={[sx * 1.1, 1.3 + (idx - 1) * 0.4, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
                  <meshBasicMaterial color="#c084fc" />
                </mesh>
              ))}
              <pointLight position={[0, 1.3, 0]} color="#c084fc" intensity={chargeStrength * 0.5} distance={4} />
            </group>
          )}

          {/* High-Voltage Readout */}
          <Html position={[0, 2.8, 0]} center distanceFactor={10}>
            <div className="bg-slate-900/90 text-purple-300 font-mono text-xs px-2.5 py-1 rounded border border-purple-500/60 shadow-lg">
              جهد القبة: {(chargeStrength * 45).toFixed(0)} kV
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};

export const StaticElectricitySimulation: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ElectrostaticMode>('coulomb');
  const [chargeQ1, setChargeQ1] = useState(4); // microCoulombs
  const [chargeQ2, setChargeQ2] = useState(-4);
  const [distance, setDistance] = useState(25); // cm
  const [chargeStrength, setChargeStrength] = useState(7); // 1 to 10
  const [isPlaying, setIsPlaying] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  // Coulomb Force calculation (N)
  const rMeters = Math.max(0.02, distance / 100);
  const forceNewtons = useMemo(() => {
    return (8.99e9 * Math.abs(chargeQ1 * 1e-6 * chargeQ2 * 1e-6)) / (rMeters * rMeters);
  }, [chargeQ1, chargeQ2, rMeters]);

  // CyberLab HUD Metrics
  const hudMetrics = useMemo(() => {
    return [
      {
        id: 'force',
        label: 'قوة كولوم الكهروستاتيكية (F)',
        value: Number(forceNewtons.toFixed(3)),
        unit: 'N',
        status: forceNewtons > 5 ? ('warning' as const) : ('normal' as const),
        min: 0,
        max: 20,
      },
      {
        id: 'dist',
        label: 'المسافة بين الشحنتين (r)',
        value: distance,
        unit: 'cm',
        status: 'normal' as const,
        min: 5,
        max: 50,
      },
      {
        id: 'dome_voltage',
        label: activeMode === 'vandegraaff' ? 'جهد القبة العالي' : 'ثابت كولوم (k)',
        value: activeMode === 'vandegraaff' ? chargeStrength * 45 : 8.99,
        unit: activeMode === 'vandegraaff' ? 'kV' : 'GN·m²/C²',
        status: 'normal' as const,
        min: 0,
        max: 500,
      },
      {
        id: 'leaf_angle',
        label: activeMode === 'electroscope' ? 'زاوية انفراج الورقتين' : 'شدة المجال الكهربائي E',
        value: activeMode === 'electroscope' ? Number(((chargeStrength / 10) * 45).toFixed(1)) : Number((forceNewtons / (Math.abs(chargeQ2) * 1e-6 || 1)).toFixed(0)),
        unit: activeMode === 'electroscope' ? '°' : 'N/C',
        status: 'normal' as const,
        min: 0,
        max: 90,
      },
    ];
  }, [forceNewtons, distance, activeMode, chargeStrength, chargeQ2]);

  // Gamified Challenges
  const challenges: Challenge[] = useMemo(() => {
    return [
      {
        id: 'coulomb_attraction',
        title: 'قوة التجاذب والتنافر بين الشحنات',
        description: 'في وضع قانون كولوم، قلل المسافة بين الشحنتين حتى تتجاوز قوة كولوم الكهروستاتيكية 4.0 N.',
        targetMetric: 'قوة كولوم الكهروستاتيكية (F)',
        targetValue: 4.5,
        unit: 'N',
        currentValue: activeMode === 'coulomb' ? forceNewtons : 0,
        holdTimeRequired: 3,
        tolerance: 1.0,
        isCompleted: false,
        hint: 'قلل المسافة بين الشحنتين إلى أقل من 15 cm مع إبقاء الشحنتين عند ±4 μC.',
      },
      {
        id: 'electroscope_divergence',
        title: 'انفراج أقصى لورقتي الكشاف الذهبيتين',
        description: 'انتقل لوضع الكشاف الكهربائي وارفع شحنة التأثير حتى تتجاوز زاوية انفراج الورقتين 35°.',
        targetMetric: 'زاوية انفراج الورقتين',
        targetValue: 36,
        unit: '°',
        currentValue: activeMode === 'electroscope' ? (chargeStrength / 10) * 45 : 0,
        holdTimeRequired: 2,
        tolerance: 4,
        isCompleted: false,
        hint: 'اختر الكشاف الكهربائي وارفع شريط شدة الشحنة لأكثر من 8.',
      },
      {
        id: 'vandegraaff_breakdown',
        title: 'تفريغ صاعقة فان دي غراف الفائقة',
        description: 'ارفع جهد مولد فان دي غراف إلى أكثر من 350 kV لكسر عازلية الهواء وتوليد شرارات برق حية.',
        targetMetric: 'جهد القبة العالي',
        targetValue: 360,
        unit: 'kV',
        currentValue: activeMode === 'vandegraaff' ? chargeStrength * 45 : 0,
        holdTimeRequired: 2,
        tolerance: 50,
        isCompleted: false,
        hint: 'اختر مولد فان دي غراف وارفع شدة الشحن إلى أقصاها.',
      },
    ];
  }, [activeMode, forceNewtons, chargeStrength]);

  const quizQuestions = [
    {
      question: 'وفق قانون كولوم، ماذا يحدث للقوة الكهروستاتيكية بين شحنتين إذا انخفضت المسافة بينهما إلى النصف؟',
      options: ['تقل إلى النصف', 'تتضاعف 4 مرات (تزداد 4 أضعاف)', 'تبقى ثابتة', 'تتضاعف مرتين فقط'],
      correctIndex: 1,
      explanation: 'القوة تتناسب عكسياً مع مربع المسافة (F ∝ 1/r²)، لذا إنقاص المسافة للنصف يضاعف القوة بمقدار 1/(0.5)² = 4 مرات.',
    },
    {
      question: 'لماذا تنفرج ورقتا الكشاف الكهربائي المصنوعتان من الذهب عند لمس قرصه بجسم مشحون؟',
      options: [
        'بسبب وزنهما الخفيف فقط',
        'بسبب اكتسابهما شحنتين متماثلتين في النوع مما يولد قوة تنافر كهروستاتيكية بينهما',
        'بسبب المغناطيسية الأرضية',
        'بسبب تيارات الهواء داخل الوعاء',
      ],
      correctIndex: 1,
      explanation: 'تنتقل الشحنات الكهربائية عبر الساق الموصلة إلى الورقتين المتجاورتين، فتكتسبان نفس الشحنة وتتنافران وفق قانون كولوم.',
    },
    {
      question: 'أين تتجمع الشحنات الكهربائية الزائدة في الموصلات المجوفة كقبة مولد فان دي غراف؟',
      options: [
        'في المركز الداخلي للمجال',
        'على السطح الخارجي تماماً للموصل وفق قانون غاوس',
        'في قاع العمود فقط',
        'تتوزع بالتساوي بين الداخل والخارج',
      ],
      correctIndex: 1,
      explanation: 'وفق قانون غاوس وتنافر الشحنات، تتباعد الشحنات إلى أقصى مسافة ممكنة فتستقر حصرياً على السطح الخارجي، ويبقى المجال داخل التجويف صفراً (قفص فاراداي).',
    },
  ];

  return (
    <SimulationLayout
      title="مختبر الكهرباء الساكنة ومولد فان دي غراف 3D"
      titleGradient="from-amber-400 via-yellow-300 to-purple-400"
      backgroundGradient="from-slate-950 via-slate-900 to-amber-950"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 3D Electrostatics Viewport */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950 shadow-2xl shadow-amber-950/40">
            <Canvas camera={{ position: [0, 2.0, 6.0], fov: 45 }}>
              <ambientLight intensity={0.7} />
              <pointLight position={[10, 10, 10]} intensity={1.2} />
              <pointLight position={[-10, -5, -6]} intensity={0.6} color="#f59e0b" />
              <directionalLight position={[0, 8, 4]} intensity={0.8} />

              <CinematicCameraController preset={cameraPreset} />

              <Float speed={0.5} rotationIntensity={0.02} floatIntensity={0.04}>
                <ElectrostaticEngine3D
                  mode={activeMode}
                  chargeQ1={chargeQ1}
                  chargeQ2={chargeQ2}
                  distance={distance}
                  chargeStrength={chargeStrength}
                  isPlaying={isPlaying}
                />
              </Float>

              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>

            {/* CyberLab HUD Overlay */}
            <CyberLabHUD
              metrics={hudMetrics}
              title={`الكهرباء الساكنة • ${activeMode === 'coulomb' ? 'قانون كولوم والشحنات النقطية' : activeMode === 'electroscope' ? 'كشاف الورقتين الذهبيتين' : 'مولد فان دي غراف'}`}
              status="active"
              oscilloscopeWaveform={activeMode === 'vandegraaff' ? 'noise' : 'sine'}
              oscilloscopeFrequency={forceNewtons > 5 ? 8 : 2}
            />

            {/* Live Camera Presets */}
            <div className="absolute top-4 left-4 z-20 flex gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
              <Button size="sm" variant={cameraPreset === 'overview' ? 'default' : 'ghost'} onClick={() => setCameraPreset('overview')} className="h-7 text-xs px-2.5 text-amber-300">شامل</Button>
              <Button size="sm" variant={cameraPreset === 'microscopic' ? 'default' : 'ghost'} onClick={() => setCameraPreset('microscopic')} className="h-7 text-xs px-2.5 text-amber-300">مجهري</Button>
              <Button size="sm" variant={cameraPreset === 'flow' ? 'default' : 'ghost'} onClick={() => setCameraPreset('flow')} className="h-7 text-xs px-2.5 text-amber-300">مسار الشحنات</Button>
              <Button size="sm" variant={cameraPreset === 'orbit360' ? 'default' : 'ghost'} onClick={() => setCameraPreset('orbit360')} className="h-7 text-xs px-2.5 text-amber-300">دوران 360°</Button>
            </div>

            {/* Bottom Playback Overlay */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 w-8 p-0 text-amber-400 hover:text-amber-300"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDistance(25);
                  setChargeStrength(7);
                  setChargeQ1(4);
                  setChargeQ2(-4);
                }}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                title="إعادة ضبط"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mode Selector & Control Sliders */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
            <Tabs value={activeMode} onValueChange={(val) => setActiveMode(val as ElectrostaticMode)}>
              <TabsList className="bg-slate-800/80 w-full grid grid-cols-3">
                <TabsTrigger value="coulomb" className="text-xs">قانون كولوم</TabsTrigger>
                <TabsTrigger value="electroscope" className="text-xs">الكشاف الكهربائي</TabsTrigger>
                <TabsTrigger value="vandegraaff" className="text-xs">مولد فان دي غراف</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Coulomb Mode Controls */}
            {activeMode === 'coulomb' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>مقدار الشحنة الأولى (Q₁):</span>
                      <span className="font-mono text-red-400 font-bold">{chargeQ1} μC</span>
                    </div>
                    <Slider value={[chargeQ1]} onValueChange={(val) => setChargeQ1(val[0])} min={-10} max={10} step={1} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>مقدار الشحنة الثانية (Q₂):</span>
                      <span className="font-mono text-blue-400 font-bold">{chargeQ2} μC</span>
                    </div>
                    <Slider value={[chargeQ2]} onValueChange={(val) => setChargeQ2(val[0])} min={-10} max={10} step={1} />
                  </div>
                </div>

                <div className="space-y-2 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span>المسافة الفاصلة بين الشحنتين (Distance r):</span>
                    <span className="font-mono text-amber-400 font-bold">{distance} cm</span>
                  </div>
                  <Slider value={[distance]} onValueChange={(val) => setDistance(val[0])} min={5} max={50} step={1} />
                </div>
              </div>
            )}

            {/* Electroscope / Van de Graaff Controls */}
            {activeMode !== 'coulomb' && (
              <div className="space-y-2 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>شدة الشحن والتأثير (Charge Level):</span>
                  <span className="font-mono text-amber-400 font-bold">{chargeStrength} / 10</span>
                </div>
                <Slider
                  value={[chargeStrength]}
                  onValueChange={(val) => setChargeStrength(val[0])}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            )}
          </div>

          {/* Gamified Laboratory Challenges */}
          <LabChallengeEngine
            challenges={challenges}
            onChallengeComplete={(c) => {
              console.log('Challenge completed:', c.title);
            }}
          />
        </div>

        {/* Right Pedagogical & Live CoPilot Column */}
        <div className="space-y-4">
          {/* AI Lab CoPilot */}
          <LiveAILabCoPilot
            experimentContext={{
              title: 'الكهرباء الساكنة ومولد فان دي غراف',
              currentStep: `المنظومة الكهروستاتيكية: ${activeMode}`,
              userAction:
                activeMode === 'coulomb'
                  ? `حساب القوة المتبادلة F = ${forceNewtons.toFixed(3)} N عند المسافة ${distance} cm`
                  : activeMode === 'electroscope'
                  ? `مراقبة زاوية الانفراج ${((Math.min(Math.PI / 3, (chargeStrength / 10) * (Math.PI / 4)) * 180) / Math.PI).toFixed(1)}° للورقتين`
                  : `توليد جهد القبة ${(chargeStrength * 45).toFixed(0)} kV وحدوث الانهيار العازل`,
              activeMetrics: {
                mode: activeMode,
                force: `${forceNewtons.toFixed(3)} N`,
                distance: `${distance} cm`,
                chargeStrength: `${chargeStrength} / 10`,
              }
            }}
            suggestions={[
              'كيف يُفسر قانون غاوس غياب أي شحنات كهربائية داخل تجويف قبة فان دي غراف؟',
              'ما هي الشروط الجوية التي تسهل حدوث انهيار العازلية الكهربائية للهواء؟',
              'ما الفرق بين الشحن بالتوصيل (Conduction) والشحن بالتأثير (Induction)؟',
              'لماذا تعتبر قوة كولوم متطابقة رياضياً مع قانون الجذب العام لنيوتن مع اختلاف الإشارة؟',
            ]}
          />

          {/* Educational Information Section */}
          <InfoSection
            data={[
              { label: 'المنظومة النشطة', value: activeMode, color: 'text-amber-300' },
              { label: 'القوة الكهروستاتيكية', value: `${forceNewtons.toFixed(3)} N`, color: 'text-yellow-300' },
              { label: 'المسافة الفاصلة', value: `${distance} cm`, color: 'text-teal-300' },
              { label: 'نوع التأثير', value: (chargeQ1 * chargeQ2) > 0 ? 'تنافر (Repulsion)' : 'تجاذب (Attraction)', color: 'text-rose-300' },
            ]}
            formulas={[
              { name: 'قانون كولوم', formula: 'F = k × |q₁ × q₂| / r²', description: 'القوة المتبادلة بين شحنتين نقطيتين تتناسب عكسياً مع مربع البعد' },
              { name: 'ثابت كولوم الكهروستاتيكي', formula: 'k = 1 / (4πε₀) ≈ 8.99 × 10⁹ N·m²/C²', description: 'ثابت التناسب في الفراغ' },
              { name: 'جهد السطح الكروي لقبة غراف', formula: 'V = k × Q / R', description: 'الجهد الكهربائي يتناسب طردياً مع الشحنة وعكسياً مع نصف قطر القبة' },
            ]}
            explanation="الكهرباء الساكنة (Electrostatics) هي دراسة الشحنات الكهربائية في حالة السكون والقوى والمجالات الناشئة عنها. شكلت هذه التجارب النواة الأولى لفهم بنية الذرة والإلكترونات، وتُستخدم تطبيقاتها اليوم في مرسبات الدخان الصناعية، وآلات التصوير بالليزر، ومولدات المسرعات النووية."
            facts={[
              'الشحنة الكهربائية كمية مكممة ومحفوظة؛ فأي شحنة في الكون هي مضاعف صحيح لشحنة الإلكترون الأولية e = 1.602 × 10⁻¹⁹ كولوم.',
              'برق العواصف الرعدية هو تفريغ إلكتروستاتيكي طبيعي ضخم ينقل مليارات الجولات من الطاقة خلال أجزاء من المليون من الثانية.',
            ]}
          />

          {/* Interactive Quiz Section */}
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default StaticElectricitySimulation;
