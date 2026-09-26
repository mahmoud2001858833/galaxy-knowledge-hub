import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Cylinder, Torus, Box, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Play, Pause, RotateCcw, Zap, Compass, Magnet, RotateCw, Activity, Eye, Layers } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

// Core Framework
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import CinematicCameraController, { CameraPreset } from '@/components/simulations/CinematicCameraController';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

type WireType = 'straight' | 'loop' | 'solenoid' | 'motor';

// 3D Magnetic Field and Conductor Engine
const ElectromagnetismEngine3D: React.FC<{
  wireType: WireType;
  current: number;
  showFieldLines: boolean;
  showCompass: boolean;
  isPlaying: boolean;
}> = ({ wireType, current, showFieldLines, showCompass, isPlaying }) => {
  const motorRotorRef = useRef<THREE.Group>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  // Rotate motor armature and animate electron drift
  useFrame((state, delta) => {
    if (motorRotorRef.current && isPlaying && wireType === 'motor') {
      const motorRPM = current * 60;
      motorRotorRef.current.rotation.y += delta * (motorRPM / 60) * Math.PI * 2;
    }
    if (particleGroupRef.current && isPlaying) {
      particleGroupRef.current.rotation.y += delta * (current * 0.4);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Wooden / Slate Workbench Plate */}
      <mesh position={[0, -2.2, 0]}>
        <boxGeometry args={[10, 0.3, 8]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* MODE 1: STRAIGHT CONDUCTOR WIRE */}
      {wireType === 'straight' && (
        <group position={[0, 0, 0]}>
          {/* Vertical Heavy Copper Rod */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 4.4, 32]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Terminal Caps */}
          <mesh position={[0, 2.2, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.2, 24]} />
            <meshStandardMaterial color="#ef4444" metalness={0.8} />
          </mesh>
          <mesh position={[0, -2.1, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.2, 24]} />
            <meshStandardMaterial color="#3b82f6" metalness={0.8} />
          </mesh>

          {/* Current Direction Arrow */}
          <Html position={[0.4, 1.2, 0]} center distanceFactor={10}>
            <div className="bg-amber-950/80 text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/50 flex items-center gap-1">
              <span>↑ التيار I = {current.toFixed(1)}A</span>
            </div>
          </Html>

          {/* Concentric Magnetic Field Rings (Biot-Savart Law) */}
          {showFieldLines && (
            <group ref={particleGroupRef}>
              {[0.9, 1.6, 2.3, 3.0].map((radius, idx) => (
                <group key={`field-ring-${idx}`}>
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[radius, 0.025, 16, 64]} />
                    <meshStandardMaterial
                      color="#c084fc"
                      emissive="#9333ea"
                      emissiveIntensity={Math.max(0.4, (current / 10) * 1.5)}
                      transparent
                      opacity={0.75}
                    />
                  </mesh>

                  {/* Compass Needles Orbiting on the Field Line */}
                  {showCompass && (
                    <group
                      position={[
                        radius * Math.cos((idx * Math.PI) / 2),
                        0,
                        radius * Math.sin((idx * Math.PI) / 2),
                      ]}
                      rotation={[0, -(idx * Math.PI) / 2 - Math.PI / 2, 0]}
                    >
                      {/* Compass dial base */}
                      <mesh position={[0, -0.05, 0]}>
                        <cylinderGeometry args={[0.22, 0.22, 0.05, 24]} />
                        <meshStandardMaterial color="#0f172a" />
                      </mesh>
                      {/* North Needle (Red) */}
                      <mesh position={[0.1, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]}>
                        <coneGeometry args={[0.06, 0.2, 8]} />
                        <meshStandardMaterial color="#ef4444" />
                      </mesh>
                      {/* South Needle (Silver) */}
                      <mesh position={[-0.1, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <coneGeometry args={[0.06, 0.2, 8]} />
                        <meshStandardMaterial color="#cbd5e1" />
                      </mesh>
                    </group>
                  )}
                </group>
              ))}
            </group>
          )}
        </group>
      )}

      {/* MODE 2: CIRCULAR WIRE LOOP */}
      {wireType === 'loop' && (
        <group position={[0, 0, 0]}>
          {/* Circular Copper Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.8, 0.09, 24, 64]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Center Magnetic Dipole Flux Beam */}
          {showFieldLines && (
            <group>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 4.0, 16]} />
                <meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={1.2} />
              </mesh>
              {/* Looping field return curves */}
              {[-1.2, 1.2].map((ox) => (
                <mesh key={`loop-curve-${ox}`} position={[ox * 1.8, 0, 0]} rotation={[0, 0, ox > 0 ? 0.3 : -0.3]}>
                  <torusGeometry args={[1.5, 0.03, 16, 48, Math.PI]} />
                  <meshStandardMaterial color="#a855f7" transparent opacity={0.6} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      )}

      {/* MODE 3: SOLENOID ELECTROMAGNET WITH FERROMAGNETIC CORE */}
      {wireType === 'solenoid' && (
        <group position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          {/* Soft Iron Core Cylinder */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 4.2, 32]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.3} />
          </mesh>

          {/* Solenoid Copper Helix Turns (represented by stacked coils) */}
          {Array.from({ length: 18 }, (_, i) => {
            const py = -1.8 + i * 0.21;
            return (
              <mesh key={`solenoid-turn-${i}`} position={[0, py, 0]}>
                <torusGeometry args={[0.55, 0.06, 16, 32]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
              </mesh>
            );
          })}

          {/* Internal Dense Magnetic Flux Lines */}
          {showFieldLines && (
            <group>
              {[-0.2, 0, 0.2].map((xOffset, idx) => (
                <mesh key={`flux-${idx}`} position={[xOffset, 0, 0]}>
                  <cylinderGeometry args={[0.04, 0.04, 5.5, 16]} />
                  <meshStandardMaterial
                    color="#c084fc"
                    emissive="#a855f7"
                    emissiveIntensity={Math.min(2.5, (current / 5) * 2)}
                  />
                </mesh>
              ))}
            </group>
          )}
        </group>
      )}

      {/* MODE 4: DC ELECTRIC MOTOR & LORENTZ TORQUE */}
      {wireType === 'motor' && (
        <group position={[0, 0, 0]}>
          {/* Permanent Stator Magnets */}
          {/* North Pole (Red) */}
          <mesh position={[-2.4, 0, 0]}>
            <boxGeometry args={[1.0, 1.8, 2.5]} />
            <meshStandardMaterial color="#dc2626" metalness={0.3} roughness={0.4} />
          </mesh>
          <Html position={[-2.4, 1.2, 0]} center distanceFactor={10}>
            <div className="bg-red-950 text-red-200 font-bold px-1.5 py-0.5 rounded text-xs border border-red-500">
              قطب شمالي (N)
            </div>
          </Html>

          {/* South Pole (Blue) */}
          <mesh position={[2.4, 0, 0]}>
            <boxGeometry args={[1.0, 1.8, 2.5]} />
            <meshStandardMaterial color="#2563eb" metalness={0.3} roughness={0.4} />
          </mesh>
          <Html position={[2.4, 1.2, 0]} center distanceFactor={10}>
            <div className="bg-blue-950 text-blue-200 font-bold px-1.5 py-0.5 rounded text-xs border border-blue-500">
              قطب جنوبي (S)
            </div>
          </Html>

          {/* Stator Uniform Magnetic Field Lines (N -> S) */}
          {showFieldLines && (
            <group>
              {[-0.6, 0, 0.6].map((zy, idx) => (
                <mesh key={`stator-field-${idx}`} position={[0, zy * 0.8, zy * 0.8]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.02, 0.02, 3.8, 12]} />
                  <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
                </mesh>
              ))}
            </group>
          )}

          {/* Rotating Rotor Armature Coil on Axle */}
          <group ref={motorRotorRef}>
            {/* Central Steel Shaft */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 3.5, 16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
            {/* Rectangular Copper Coil Loop */}
            <mesh position={[0.9, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 2.2, 16]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} />
            </mesh>
            <mesh position={[-0.9, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 2.2, 16]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} />
            </mesh>
            <mesh position={[0, 1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 1.8, 16]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} />
            </mesh>
            <mesh position={[0, -1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 1.8, 16]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} />
            </mesh>

            {/* Split-ring Commutator */}
            <mesh position={[0, -1.4, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.3, 16]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.8} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};

export const ElectromagnetismLabSimulation: React.FC = () => {
  const [wireType, setWireType] = useState<WireType>('straight');
  const [current, setCurrent] = useState(5.0); // Amperes
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showCompass, setShowCompass] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  // Physical calculations:
  // mu0 = 4*pi*1e-7 T*m/A
  // Straight wire at r = 5 cm: B = (mu0 * I) / (2 * pi * r) = (2e-7 * I) / 0.05 = 4e-6 * I T = 4 * I microTesla
  const fieldAt5cmMicroTesla = useMemo(() => {
    switch (wireType) {
      case 'straight':
        return current * 4.0; // microTesla
      case 'loop':
        return current * 12.5; // microTesla at center
      case 'solenoid':
        return current * 45.0; // microTesla inside (n = 1000 turns/m)
      case 'motor':
        return current * 15.0; // Torque coefficient proxy
    }
  }, [wireType, current]);

  // Motor RPM calculation
  const motorRPM = useMemo(() => {
    return Math.round(current * 60);
  }, [current]);

  // CyberLab HUD Metrics
  const hudMetrics = useMemo(() => {
    return [
      {
        id: 'current',
        label: 'شدة التيار الكهربائي (I)',
        value: current,
        unit: 'A',
        status: current > 8 ? ('warning' as const) : ('normal' as const),
        min: 0.5,
        max: 10,
      },
      {
        id: 'mag_field',
        label: 'شدة المجال المغناطيسي (B)',
        value: Number(fieldAt5cmMicroTesla.toFixed(1)),
        unit: 'μT',
        status: 'normal' as const,
        min: 1,
        max: 500,
      },
      {
        id: 'rpm',
        label: wireType === 'motor' ? 'سرعة دوران المحرك' : 'عزم ثنائي القطب',
        value: wireType === 'motor' ? motorRPM : Number((current * 0.18).toFixed(2)),
        unit: wireType === 'motor' ? 'RPM' : 'A·m²',
        status: 'normal' as const,
        min: 0,
        max: 600,
      },
      {
        id: 'permeability',
        label: 'نفاذية الفراغ المغناطيسية (μ₀)',
        value: 1.256,
        unit: 'μH/m',
        status: 'normal' as const,
        min: 1.2,
        max: 1.3,
      },
    ];
  }, [current, fieldAt5cmMicroTesla, wireType, motorRPM]);

  // Gamified Challenges
  const challenges: Challenge[] = useMemo(() => {
    return [
      {
        id: 'biot_savart_high',
        title: 'توليد مجال كهرومغناطيسي قوي (بيو-سافار)',
        description: 'في وضع السلك المستقيم، ارفع التيار الكهربائي إلى 8.0A أو أكثر لمشاهدة الانحراف الحاد لإبر البوصلات.',
        targetMetric: 'شدة التيار الكهربائي (I)',
        targetValue: 8.5,
        unit: 'A',
        currentValue: wireType === 'straight' ? current : 0,
        holdTimeRequired: 3,
        tolerance: 1.0,
        isCompleted: false,
        hint: 'اختر السلك المستقيم وارفع التيار إلى أكثر من 8A.',
      },
      {
        id: 'solenoid_flux',
        title: 'مضاعفة التدفق داخل السولينويد',
        description: 'انتقل لوضع السولينويد واضبط التيار لإنتاج كثافة تدفق تتجاوز 300 μTesla داخل النواة الحديدية.',
        targetMetric: 'شدة المجال المغناطيسي (B)',
        targetValue: 315,
        unit: 'μT',
        currentValue: wireType === 'solenoid' ? fieldAt5cmMicroTesla : 0,
        holdTimeRequired: 3,
        tolerance: 50,
        isCompleted: false,
        hint: 'اختر السولينويد وارفع شدة التيار إلى 7A أو أكثر.',
      },
      {
        id: 'lorentz_motor_speed',
        title: 'تسريع محرك لورنتز الكهربائي',
        description: 'انتقل إلى محرك التيار المستمر DC واجعل سرعة الدوران تتجاوز 400 RPM بتطبيق عزم لورنتز فائق.',
        targetMetric: 'سرعة دوران المحرك',
        targetValue: 420,
        unit: 'RPM',
        currentValue: wireType === 'motor' ? motorRPM : 0,
        holdTimeRequired: 2,
        tolerance: 50,
        isCompleted: false,
        hint: 'اختر وضع المحرك الكهربائي وارفع التيار فوق 7A.',
      },
    ];
  }, [wireType, current, fieldAt5cmMicroTesla, motorRPM]);

  const quizQuestions = [
    {
      question: 'وفق قاعدة اليد اليمنى، إذا كان الإبهام يشير إلى اتجاه التيار في سلك مستقيم، فإلى ماذا تشير الأصابع المنحنية؟',
      options: [
        'اتجاه القوة الكهربائية',
        'اتجاه دوائر خطوط المجال المغناطيسي حول السلك',
        'اتجاه حركة الإلكترونات الحقيقية',
        'اتجاه الحرارة المتولدة',
      ],
      correctIndex: 1,
      explanation: 'قاعدة اليد اليمنى تنص على أن دوران الأصابع حول السلك يحدد اتجاه خطوط المجال المغناطيسي الحلقية.',
    },
    {
      question: 'لماذا يعتبر المجال المغناطيسي داخل السولينويد (الملف الحلزوني) منتظماً وقوياً جداً؟',
      options: [
        'لأنه لا يحتوي على أسلاك',
        'بسبب تراكم وتراكب المجالات الناتجة عن جميع الحلقات المتوازية في اتجاه محوري واحد موحد',
        'بسبب انعدام مقاومة النحاس',
        'لأنه يعمل في الفراغ فقط',
      ],
      correctIndex: 1,
      explanation: 'تتحد مجالات الحلقات الفردية داخل الملف لتعطي مجالاً خطياً منتظماً موازياً للمحور بقيمة B = μ₀ n I.',
    },
    {
      question: 'ما هو المبدأ الفيزيائي الذي يرتكز عليه دوران المحرك الكهربائي (DC Motor)؟',
      options: [
        'قوة كولوم الكهروستاتيكية الساكنة فقط',
        'قوة لورنتز المغناطيسية (F = I L × B) المؤثرة على جانبي الملف المتعاكسين بالتيار مولدة عزم ازدواج',
        'التمدد الحراري للأسلاك',
        'تأثير الجاذبية الأرضية',
      ],
      correctIndex: 1,
      explanation: 'التيار يسري في اتجاهين متعاكسين على ضلعي الملف، مما ينتج قوتين مغناطيسيتين متعاكستين تشكلان عزم ازدواج (Torque) يدير العمود.',
    },
  ];

  return (
    <SimulationLayout
      title="مختبر الكهرومغناطيسية ومحرك لورنتز 3D"
      titleGradient="from-purple-400 via-fuchsia-300 to-blue-400"
      backgroundGradient="from-slate-950 via-slate-900 to-purple-950"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 3D Canvas Viewport */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-purple-500/30 bg-slate-950 shadow-2xl shadow-purple-950/40">
            <Canvas camera={{ position: [0, 2.5, 6], fov: 45 }}>
              <ambientLight intensity={0.7} />
              <pointLight position={[10, 10, 10]} intensity={1.2} />
              <pointLight position={[-10, -5, -6]} intensity={0.6} color="#a855f7" />
              <directionalLight position={[0, 8, 4]} intensity={0.8} />

              <CinematicCameraController preset={cameraPreset} />

              <Float speed={0.5} rotationIntensity={0.03} floatIntensity={0.05}>
                <ElectromagnetismEngine3D
                  wireType={wireType}
                  current={current}
                  showFieldLines={showFieldLines}
                  showCompass={showCompass}
                  isPlaying={isPlaying}
                />
              </Float>

              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>

            {/* CyberLab HUD Overlay */}
            <CyberLabHUD
              metrics={hudMetrics}
              title={`الكهرومغناطيسية • ${wireType === 'straight' ? 'سلك بيو-سافار' : wireType === 'loop' ? 'ملف دائري' : wireType === 'solenoid' ? 'سولينويد بنواة حديد' : 'محرك لورنتز DC'}`}
              status="active"
              oscilloscopeWaveform="sine"
              oscilloscopeFrequency={wireType === 'motor' ? motorRPM / 100 : current}
            />

            {/* Live Camera Presets */}
            <div className="absolute top-4 left-4 z-20 flex gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
              <Button size="sm" variant={cameraPreset === 'overview' ? 'default' : 'ghost'} onClick={() => setCameraPreset('overview')} className="h-7 text-xs px-2.5 text-purple-300">شامل</Button>
              <Button size="sm" variant={cameraPreset === 'microscopic' ? 'default' : 'ghost'} onClick={() => setCameraPreset('microscopic')} className="h-7 text-xs px-2.5 text-purple-300">محور المجال</Button>
              <Button size="sm" variant={cameraPreset === 'flow' ? 'default' : 'ghost'} onClick={() => setCameraPreset('flow')} className="h-7 text-xs px-2.5 text-purple-300">مسار الدوران</Button>
              <Button size="sm" variant={cameraPreset === 'orbit360' ? 'default' : 'ghost'} onClick={() => setCameraPreset('orbit360')} className="h-7 text-xs px-2.5 text-purple-300">دوران 360°</Button>
            </div>

            {/* Bottom Playback Overlay */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCurrent(5.0)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                title="إعادة ضبط"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mode Selector & Current Sliders */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
            <Tabs value={wireType} onValueChange={(val) => setWireType(val as WireType)}>
              <TabsList className="bg-slate-800/80 w-full grid grid-cols-4">
                <TabsTrigger value="straight" className="text-xs">سلك مستقيم</TabsTrigger>
                <TabsTrigger value="loop" className="text-xs">ملف دائري</TabsTrigger>
                <TabsTrigger value="solenoid" className="text-xs">سولينويد</TabsTrigger>
                <TabsTrigger value="motor" className="text-xs">محرك كهربائي</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Current Slider */}
            <div className="space-y-2 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  شدة التيار الكهربائي (Current):
                </span>
                <span className="font-mono text-purple-400 font-bold">{current.toFixed(1)} A</span>
              </div>
              <Slider
                value={[current]}
                onValueChange={(val) => setCurrent(val[0])}
                min={0.5}
                max={10.0}
                step={0.1}
              />
            </div>

            {/* Visual Options Toggles */}
            <div className="flex gap-4 p-2 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={showFieldLines} onCheckedChange={setShowFieldLines} />
                <span>إظهار خطوط المجال المغناطيسي</span>
              </label>
              {wireType === 'straight' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={showCompass} onCheckedChange={setShowCompass} />
                  <span>إظهار إبر البوصلة المغناطيسية</span>
                </label>
              )}
            </div>
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
              title: 'الكهرومغناطيسية ومحرك لورنتز',
              currentStep: `المنظومة المغناطيسية: ${wireType}`,
              userAction: `تطبيق تيار ${current.toFixed(1)} A ومراقبة الحقل الناتج ${fieldAt5cmMicroTesla.toFixed(1)} μT`,
              activeMetrics: {
                wireType: wireType,
                current: `${current.toFixed(1)} A`,
                magneticField: `${fieldAt5cmMicroTesla.toFixed(1)} μT`,
                motorRPM: wireType === 'motor' ? `${motorRPM} RPM` : 'غير نشط',
              }
            }}
            suggestions={[
              'كيف يفسر قانون بيو-سافار تناقص شدة المجال المغناطيسي مع البعد عن السلك؟',
              'لماذا تزيد النواة الحديدية (Ferromagnetic Core) شدة حقل السولينويد مئات المرات؟',
              'ما دور المبدل (Commutator) وفرش الكربون في استمرار دوران محرك التيار المستمر؟',
              'اشرح كيف تنشأ قوة لورنتز من تفاعل الإلكترونات المتحركة مع المجال الخارجي.',
            ]}
          />

          {/* Educational Information Section */}
          <InfoSection
            data={[
              { label: 'المنظومة النشطة', value: wireType, color: 'text-purple-300' },
              { label: 'كثافة التدفق B', value: `${fieldAt5cmMicroTesla.toFixed(1)} μT`, color: 'text-fuchsia-300' },
              { label: 'شدة التيار I', value: `${current.toFixed(1)} A`, color: 'text-amber-300' },
              { label: 'سرعة المحرك', value: wireType === 'motor' ? `${motorRPM} RPM` : '-', color: 'text-cyan-300' },
            ]}
            formulas={[
              { name: 'قانون بيو-سافار للسلك المستقيم', formula: 'B = (μ₀ × I) / (2π × r)', description: 'شدة المجال تتناسب طردياً مع التيار وعكسياً مع المسافة r' },
              { name: 'مجال السولينويد المنتظم', formula: 'B = μ₀ × n × I', description: 'حيث n هو عدد اللفات في وحدة الطول (Turns/meter)' },
              { name: 'عزم ازدواج المحرك الكهربائي', formula: 'τ = N × I × A × B × sin(θ)', description: 'العزم الميكانيكي المؤدي لدوران الملف بين القطبين' },
            ]}
            explanation="الكهرومغناطيسية هي إحدى القوى الأساسية الأربع في الكون، وتكشف أن الشحنات الكهربائية المتحركة (التيارات) تولد بالضرورة مجالاً مغناطيسياً يدور حولها. هذا الاكتشاف الثوري هو الأساس الذي بنيت عليه الحضارة الحديثة من محركات كهربائية ومولدات ومحولات وأجهزة الرنين المغناطيسي."
            facts={[
              'في عام 1820، لاحظ هانز كريستيان أورستد بالصدفة انحراف إبرة بوصلة موضوعة بجوار سلك عند مرور تيار كهربائي فيه، رابطاً الكهرباء بالمغناطيسية لأول مرة.',
              'أقوى مغناطيس كهربائي أرضي في مختبر ماغنت لاب يولد مجالاً يصل إلى 45.5 تسلا، أي أقوى بحوالي مليون مرة من مجال الأرض المغناطيسي الطبيعي!',
            ]}
          />

          {/* Interactive Quiz Section */}
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default ElectromagnetismLabSimulation;
