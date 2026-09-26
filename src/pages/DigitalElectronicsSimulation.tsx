import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Box, Cylinder, Sphere, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Cpu, Binary, Zap, Eye, Database, Activity } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

// Core Framework
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import CinematicCameraController, { CameraPreset } from '@/components/simulations/CinematicCameraController';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

type DigitalMode = 'gates' | 'adder' | 'counter' | 'memory';
type LogicGateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR';

// 3D Integrated Circuit (DIP-14 Package) and Logic Gate Engine
const LogicCircuit3D: React.FC<{
  mode: DigitalMode;
  selectedGate: LogicGateType;
  inputA: boolean;
  inputB: boolean;
  clockTime: number;
  isPlaying: boolean;
}> = ({ mode, selectedGate, inputA, inputB, clockTime, isPlaying }) => {
  // Logic gate evaluation
  const outputQ = useMemo(() => {
    switch (selectedGate) {
      case 'AND': return inputA && inputB;
      case 'OR': return inputA || inputB;
      case 'NOT': return !inputA;
      case 'NAND': return !(inputA && inputB);
      case 'NOR': return !(inputA || inputB);
      case 'XOR': return inputA !== inputB;
    }
  }, [selectedGate, inputA, inputB]);

  // Half adder calculation
  const sum = inputA !== inputB;
  const carry = inputA && inputB;

  // Counter 8-bit state
  const counterVal = Math.floor(clockTime * 4) % 256;
  const counterBits = counterVal.toString(2).padStart(8, '0').split('').map(b => b === '1');

  return (
    <group position={[0, -0.2, 0]}>
      {/* Silicon Wafer Substrate / Printed Circuit Board */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[8.5, 0.2, 6.0]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Gold & Copper Printed Traces on PCB */}
      <mesh position={[0, -0.39, 0]}>
        <boxGeometry args={[8.0, 0.02, 5.5]} />
        <meshStandardMaterial color="#064e3b" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* MODE 1: 3D LOGIC GATES IC */}
      {mode === 'gates' && (
        <group position={[0, 0, 0]}>
          {/* DIP Microchip Body */}
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[3.2, 0.6, 1.8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.6} />
          </mesh>
          {/* Pin 1 notch marker */}
          <mesh position={[-1.5, 0.5, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.25, 16]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          {/* Metal IC Pins */}
          {[-1.2, -0.6, 0, 0.6, 1.2].map((px, idx) => (
            <group key={`pins-${idx}`}>
              <mesh position={[px, 0.05, 1.05]}>
                <boxGeometry args={[0.15, 0.5, 0.35]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[px, 0.05, -1.05]}>
                <boxGeometry args={[0.15, 0.5, 0.35]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          ))}

          {/* Logic Gate Label On Top Of Chip */}
          <Html position={[0, 0.7, 0]} center distanceFactor={10}>
            <div className="bg-slate-900/90 text-cyan-400 font-mono text-xs px-2 py-1 rounded border border-cyan-500/50 shadow-md whitespace-nowrap">
              74HC • {selectedGate} GATE
            </div>
          </Html>

          {/* Input A LED Indicator */}
          <group position={[-2.8, 0, -1.2]}>
            <mesh>
              <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial
                color={inputA ? '#22c55e' : '#334155'}
                emissive={inputA ? '#22c55e' : '#000000'}
                emissiveIntensity={inputA ? 1.5 : 0}
              />
            </mesh>
            <Html position={[0, 0.7, 0]} center distanceFactor={12}>
              <div className="text-[10px] font-mono text-slate-300 font-bold">
                A = {inputA ? '1 (HIGH)' : '0 (LOW)'}
              </div>
            </Html>
          </group>

          {/* Input B LED Indicator (if not NOT gate) */}
          {selectedGate !== 'NOT' && (
            <group position={[-2.8, 0, 1.2]}>
              <mesh>
                <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
                <meshStandardMaterial color="#334155" />
              </mesh>
              <mesh position={[0, 0.25, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                  color={inputB ? '#22c55e' : '#334155'}
                  emissive={inputB ? '#22c55e' : '#000000'}
                  emissiveIntensity={inputB ? 1.5 : 0}
                />
              </mesh>
              <Html position={[0, 0.7, 0]} center distanceFactor={12}>
                <div className="text-[10px] font-mono text-slate-300 font-bold">
                  B = {inputB ? '1 (HIGH)' : '0 (LOW)'}
                </div>
              </Html>
            </group>
          )}

          {/* Output Q LED Indicator */}
          <group position={[2.8, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.3, 0.35, 16]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <sphereGeometry args={[0.26, 16, 16]} />
              <meshStandardMaterial
                color={outputQ ? '#06b6d4' : '#1e293b'}
                emissive={outputQ ? '#06b6d4' : '#000000'}
                emissiveIntensity={outputQ ? 2.0 : 0}
              />
            </mesh>
            {outputQ && <pointLight position={[0, 0.4, 0]} color="#06b6d4" intensity={2} distance={3} />}
            <Html position={[0, 0.8, 0]} center distanceFactor={12}>
              <div className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${outputQ ? 'bg-cyan-950 text-cyan-300 border-cyan-400' : 'bg-slate-900 text-slate-500 border-slate-700'}`}>
                الخرج Q = {outputQ ? '1' : '0'}
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* MODE 2: 3D HALF ADDER */}
      {mode === 'adder' && (
        <group position={[0, 0, 0]}>
          {/* XOR Module (Sum) */}
          <mesh position={[-0.5, 0.3, -1.0]}>
            <boxGeometry args={[2.0, 0.5, 1.2]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.3} metalness={0.5} />
          </mesh>
          <Html position={[-0.5, 0.7, -1.0]} center distanceFactor={12}>
            <div className="bg-blue-950 text-blue-300 text-[10px] px-1.5 py-0.5 rounded border border-blue-500 font-mono">
              XOR (Sum)
            </div>
          </Html>

          {/* AND Module (Carry) */}
          <mesh position={[-0.5, 0.3, 1.0]}>
            <boxGeometry args={[2.0, 0.5, 1.2]} />
            <meshStandardMaterial color="#065f46" roughness={0.3} metalness={0.5} />
          </mesh>
          <Html position={[-0.5, 0.7, 1.0]} center distanceFactor={12}>
            <div className="bg-emerald-950 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500 font-mono">
              AND (Carry)
            </div>
          </Html>

          {/* Output Sum LED */}
          <group position={[2.5, 0, -1.0]}>
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color={sum ? '#38bdf8' : '#334155'} emissive={sum ? '#38bdf8' : '#000'} emissiveIntensity={sum ? 1.5 : 0} />
            </mesh>
            <Html position={[0, 0.6, 0]} center distanceFactor={12}>
              <div className="text-[10px] font-mono text-cyan-300 font-bold">Sum = {sum ? '1' : '0'}</div>
            </Html>
          </group>

          {/* Output Carry LED */}
          <group position={[2.5, 0, 1.0]}>
            <mesh position={[0, 0.2, 0]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color={carry ? '#f59e0b' : '#334155'} emissive={carry ? '#f59e0b' : '#000'} emissiveIntensity={carry ? 1.5 : 0} />
            </mesh>
            <Html position={[0, 0.6, 0]} center distanceFactor={12}>
              <div className="text-[10px] font-mono text-amber-300 font-bold">Carry = {carry ? '1' : '0'}</div>
            </Html>
          </group>
        </group>
      )}

      {/* MODE 3: 3D 8-BIT RIPPLE BINARY COUNTER */}
      {mode === 'counter' && (
        <group position={[0, 0, 0]}>
          {/* 8 Binary Bit Indicator Tubes */}
          {counterBits.map((bit, idx) => {
            const bx = -2.8 + idx * 0.8;
            return (
              <group key={`bit-${idx}`} position={[bx, 0, 0]}>
                <mesh position={[0, 0.1, 0]}>
                  <cylinderGeometry args={[0.22, 0.22, 0.3, 16]} />
                  <meshStandardMaterial color="#1e293b" />
                </mesh>
                <mesh position={[0, 0.4, 0]}>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial
                    color={bit ? '#22c55e' : '#334155'}
                    emissive={bit ? '#22c55e' : '#000000'}
                    emissiveIntensity={bit ? 1.6 : 0}
                  />
                </mesh>
                <Html position={[0, 0.8, 0]} center distanceFactor={12}>
                  <div className="text-[9px] font-mono text-slate-300 text-center font-bold">
                    <div>2^{7 - idx}</div>
                    <div className={bit ? 'text-green-400 font-bold' : 'text-slate-500'}>{bit ? '1' : '0'}</div>
                  </div>
                </Html>
              </group>
            );
          })}

          {/* 7-Segment Decimal Readout Panel */}
          <group position={[0, 0.3, -1.8]}>
            <mesh>
              <boxGeometry args={[2.5, 0.8, 0.4]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
            </mesh>
            <Html position={[0, 0.1, 0.25]} center distanceFactor={10}>
              <div className="bg-black/90 text-green-400 font-mono text-2xl font-bold tracking-widest px-3 py-1 rounded border border-green-500/60 shadow-lg">
                {counterVal}
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* MODE 4: 3D MEMORY FLIP-FLOP REGISTERS */}
      {mode === 'memory' && (
        <group position={[0, 0, 0]}>
          {/* 4 Register Rows */}
          {[0, 1, 2, 3].map((row) => (
            <group key={`row-${row}`} position={[0, 0.2, -1.8 + row * 1.2]}>
              <mesh>
                <boxGeometry args={[6.5, 0.35, 0.8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
              </mesh>
              <Html position={[-3.6, 0, 0]} center distanceFactor={12}>
                <div className="bg-slate-900 text-amber-400 font-mono text-[10px] px-1.5 py-0.5 rounded border border-slate-700">
                  REG {row}
                </div>
              </Html>
              {/* 4 Register Bits */}
              {[0, 1, 2, 3].map((b) => {
                const bitVal = Math.floor(clockTime * 2 + row + b) % 2 === 1;
                return (
                  <mesh key={`b-${b}`} position={[-1.2 + b * 0.9, 0.25, 0]}>
                    <cylinderGeometry args={[0.16, 0.16, 0.2, 16]} />
                    <meshStandardMaterial
                      color={bitVal ? '#38bdf8' : '#334155'}
                      emissive={bitVal ? '#38bdf8' : '#000'}
                      emissiveIntensity={bitVal ? 1.4 : 0}
                    />
                  </mesh>
                );
              })}
            </group>
          ))}
        </group>
      )}
    </group>
  );
};

export const DigitalElectronicsSimulation: React.FC = () => {
  const [activeMode, setActiveMode] = useState<DigitalMode>('gates');
  const [selectedGate, setSelectedGate] = useState<LogicGateType>('AND');
  const [inputA, setInputA] = useState(true);
  const [inputB, setInputB] = useState(false);
  const [clockFrequency, setClockFrequency] = useState(2); // Hz
  const [isPlaying, setIsPlaying] = useState(true);
  const [clockTime, setClockTime] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  // Clock animation loop
  const animRef = useRef<number>(0);
  React.useEffect(() => {
    let last = performance.now();
    const update = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (isPlaying) {
        setClockTime(t => t + dt * clockFrequency);
      }
      animRef.current = requestAnimationFrame(update);
    };
    animRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, clockFrequency]);

  // Current logic output
  const gateOutput = useMemo(() => {
    switch (selectedGate) {
      case 'AND': return inputA && inputB;
      case 'OR': return inputA || inputB;
      case 'NOT': return !inputA;
      case 'NAND': return !(inputA && inputB);
      case 'NOR': return !(inputA || inputB);
      case 'XOR': return inputA !== inputB;
    }
  }, [selectedGate, inputA, inputB]);

  const counterDecimal = Math.floor(clockTime * 4) % 256;

  // CyberLab HUD Metrics
  const hudMetrics = useMemo(() => {
    return [
      {
        id: 'clock_freq',
        label: 'تردد الساعة (Clock Frequency)',
        value: clockFrequency,
        unit: 'Hz',
        status: 'normal' as const,
        min: 0.5,
        max: 10,
      },
      {
        id: 'gate_q',
        label: 'الخرج المنطقي (Q)',
        value: gateOutput ? 1 : 0,
        unit: 'logic',
        status: gateOutput ? ('normal' as const) : ('warning' as const),
        min: 0,
        max: 1,
      },
      {
        id: 'counter_val',
        label: 'قيمة العداد الثنائي (8-bit)',
        value: counterDecimal,
        unit: 'DEC',
        status: 'normal' as const,
        min: 0,
        max: 255,
      },
      {
        id: 'prop_delay',
        label: 'زمن الانتشار المنطقي (t_pd)',
        value: 4.8,
        unit: 'ns',
        status: 'normal' as const,
        min: 1,
        max: 20,
      },
    ];
  }, [clockFrequency, gateOutput, counterDecimal]);

  // Gamified Challenges
  const challenges: Challenge[] = useMemo(() => {
    return [
      {
        id: 'universal_nand',
        title: 'بوابة NAND الشاملة (Universal Gate)',
        description: 'اختر بوابة NAND واضبط كلا المدخلين A=1 و B=1 لمشاهدة الحالة الوحيدة التي يكون فيها الخرج LOW (0).',
        targetMetric: 'الخرج المنطقي (Q)',
        targetValue: 0,
        unit: 'logic',
        currentValue: selectedGate === 'NAND' && inputA && inputB ? 0 : 1,
        holdTimeRequired: 3,
        tolerance: 0.1,
        isCompleted: false,
        hint: 'اختر بوابة NAND واجعل A و B كلاهما 1.',
      },
      {
        id: 'half_adder_carry',
        title: 'توليد بت الفائض (Carry Bit) في الجامع',
        description: 'انتقل إلى تبويب "الجامع الثنائي" واضبط A=1 و B=1 لمشاهدة إنتاج Carry=1 و Sum=0.',
        targetMetric: 'بت الفائض (Carry)',
        targetValue: 1,
        unit: 'bit',
        currentValue: activeMode === 'adder' && inputA && inputB ? 1 : 0,
        holdTimeRequired: 3,
        tolerance: 0.1,
        isCompleted: false,
        hint: 'اختر وضع الجامع النصفي واجعل A=1 و B=1 (1 + 1 = 10 بالثنائي).',
      },
      {
        id: 'clock_sync',
        title: 'مزامنة العداد الثنائي السريع',
        description: 'ارفع تردد الساعة إلى 5 Hz أو أكثر لمراقبة الانتقال السريع بين الأعداد الثنائية على مصفوفة LED.',
        targetMetric: 'تردد الساعة (Clock Frequency)',
        targetValue: 5,
        unit: 'Hz',
        currentValue: clockFrequency,
        holdTimeRequired: 2,
        tolerance: 1,
        isCompleted: false,
        hint: 'حرك منزلق تردد الساعة إلى 5 Hz أو أعلى.',
      },
    ];
  }, [selectedGate, inputA, inputB, activeMode, clockFrequency]);

  const quizQuestions = [
    {
      question: 'لماذا تسمى بوابتا NAND و NOR بالبوابات الشاملة (Universal Gates)؟',
      options: [
        'لأنها تعمل بجهد كهربائي عالمي موحد',
        'لأنه يمكن بناء أي دائرة أو معالج منطقي متكامل باستخدام أي منهما فقط دون الحاجة لأي بوابة أخرى',
        'لأنها تستخدم في جميع أجهزة التلفاز القديمة فقط',
        'لأنها تستهلك طاقة تقارب الصفر',
      ],
      correctIndex: 1,
      explanation: 'وفق الجبر البوليني، يمكن اشتقاق بوابات NOT و AND و OR باستخدام بوابات NAND أو NOR فقط، مما يجعلها أساس تصنيع رقائق السيليكون.',
    },
    {
      question: 'في نصف الجامع (Half Adder)، ما هما البوابتان المنطقيتان المستخدمتان لحساب المجموع (Sum) وبادئة الفائض (Carry)؟',
      options: [
        'XOR لحساب Sum، و AND لحساب Carry',
        'OR لحساب Sum، و NOT لحساب Carry',
        'NAND لحساب Sum، و NOR لحساب Carry',
        'AND لحساب Sum، و XOR لحساب Carry',
      ],
      correctIndex: 0,
      explanation: 'بوابة XOR تعطي 1 فقط عندما يختلف المدخلان (1+0=1 أو 0+1=1)، بينما بوابة AND تعطي 1 فقط عند 1+1 لرفع بت الفائض Carry.',
    },
    {
      question: 'كم عدداً ثنائياً مختلفاً يمكن لعداد 8-بت (8-bit Counter) تمثيله؟',
      options: ['8 أعداد', '64 عدداً', '256 عدداً (من 0 إلى 255)', '1024 عدداً'],
      correctIndex: 2,
      explanation: 'عدد الحالات هو 2⁸ = 256 قيمة مختلفة، تتراوح من 00000000 (صفر) إلى 11111111 (255).',
    },
  ];

  return (
    <SimulationLayout
      title="مختبر الإلكترونيات الرقمية والمعالجات 3D"
      titleGradient="from-cyan-400 via-teal-300 to-blue-400"
      backgroundGradient="from-slate-950 via-slate-900 to-cyan-950"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 3D Logic Wafer Viewport */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-2xl shadow-cyan-950/40">
            <Canvas camera={{ position: [0, 4.0, 5.5], fov: 45 }}>
              <ambientLight intensity={0.7} />
              <pointLight position={[8, 8, 8]} intensity={1.2} />
              <pointLight position={[-8, -6, -4]} intensity={0.5} color="#06b6d4" />
              <directionalLight position={[0, 6, 4]} intensity={0.8} />

              <CinematicCameraController preset={cameraPreset} />

              <Float speed={0.6} rotationIntensity={0.03} floatIntensity={0.05}>
                <LogicCircuit3D
                  mode={activeMode}
                  selectedGate={selectedGate}
                  inputA={inputA}
                  inputB={inputB}
                  clockTime={clockTime}
                  isPlaying={isPlaying}
                />
              </Float>

              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>

            {/* CyberLab HUD Overlay */}
            <CyberLabHUD
              metrics={hudMetrics}
              title={`المعمارية المنطقية: ${activeMode === 'gates' ? `بوابة ${selectedGate}` : activeMode === 'adder' ? 'جامع نصفي' : activeMode === 'counter' ? 'عداد تتابعي 8-بت' : 'سجلات الذاكرة'}`}
              status="active"
              oscilloscopeWaveform="square"
              oscilloscopeFrequency={clockFrequency}
            />

            {/* Live Camera Presets */}
            <div className="absolute top-4 left-4 z-20 flex gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
              <Button size="sm" variant={cameraPreset === 'overview' ? 'default' : 'ghost'} onClick={() => setCameraPreset('overview')} className="h-7 text-xs px-2.5 text-cyan-300">شامل</Button>
              <Button size="sm" variant={cameraPreset === 'microscopic' ? 'default' : 'ghost'} onClick={() => setCameraPreset('microscopic')} className="h-7 text-xs px-2.5 text-cyan-300">أرجل الرقاقة</Button>
              <Button size="sm" variant={cameraPreset === 'flow' ? 'default' : 'ghost'} onClick={() => setCameraPreset('flow')} className="h-7 text-xs px-2.5 text-cyan-300">نبض الساعة</Button>
              <Button size="sm" variant={cameraPreset === 'orbit360' ? 'default' : 'ghost'} onClick={() => setCameraPreset('orbit360')} className="h-7 text-xs px-2.5 text-cyan-300">دوران 360°</Button>
            </div>

            {/* Bottom Playback Overlay */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 w-8 p-0 text-cyan-400 hover:text-cyan-300"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setClockTime(0);
                  setInputA(true);
                  setInputB(false);
                }}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                title="إعادة ضبط"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mode Selector & Logic Input Controllers */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
            <Tabs value={activeMode} onValueChange={(val) => setActiveMode(val as DigitalMode)}>
              <TabsList className="bg-slate-800/80 w-full grid grid-cols-4">
                <TabsTrigger value="gates" className="text-xs">البوابات المنطقية</TabsTrigger>
                <TabsTrigger value="adder" className="text-xs">الجامع الثنائي</TabsTrigger>
                <TabsTrigger value="counter" className="text-xs">عداد 8-بت</TabsTrigger>
                <TabsTrigger value="memory" className="text-xs">خلايا الذاكرة</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Gates Mode Specific Controls */}
            {activeMode === 'gates' && (
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'] as LogicGateType[]).map((gate) => (
                    <Button
                      key={gate}
                      size="sm"
                      variant={selectedGate === gate ? 'default' : 'outline'}
                      onClick={() => setSelectedGate(gate)}
                      className={`text-xs px-3 ${selectedGate === gate ? 'bg-cyan-600 text-white' : 'border-slate-700 text-slate-300'}`}
                    >
                      بوابة {gate}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                  <span className="text-xs text-slate-300 font-semibold">تبديل المدخلات:</span>
                  <Button
                    size="sm"
                    variant={inputA ? 'default' : 'outline'}
                    onClick={() => setInputA(!inputA)}
                    className={inputA ? 'bg-emerald-600 text-white' : 'border-slate-700 text-slate-400'}
                  >
                    المدخل A = {inputA ? '1 (HIGH)' : '0 (LOW)'}
                  </Button>
                  {selectedGate !== 'NOT' && (
                    <Button
                      size="sm"
                      variant={inputB ? 'default' : 'outline'}
                      onClick={() => setInputB(!inputB)}
                      className={inputB ? 'bg-emerald-600 text-white' : 'border-slate-700 text-slate-400'}
                    >
                      المدخل B = {inputB ? '1 (HIGH)' : '0 (LOW)'}
                    </Button>
                  )}
                  <div className="mr-auto font-mono text-sm">
                    النتيجة:{' '}
                    <strong className={gateOutput ? 'text-cyan-400' : 'text-slate-500'}>
                      Q = {gateOutput ? '1' : '0'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Adder Mode Specific Controls */}
            {activeMode === 'adder' && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <Button
                  size="sm"
                  variant={inputA ? 'default' : 'outline'}
                  onClick={() => setInputA(!inputA)}
                  className={inputA ? 'bg-blue-600 text-white' : 'border-slate-700 text-slate-400'}
                >
                  البت A = {inputA ? '1' : '0'}
                </Button>
                <span className="text-sm font-bold text-slate-400">+</span>
                <Button
                  size="sm"
                  variant={inputB ? 'default' : 'outline'}
                  onClick={() => setInputB(!inputB)}
                  className={inputB ? 'bg-blue-600 text-white' : 'border-slate-700 text-slate-400'}
                >
                  البت B = {inputB ? '1' : '0'}
                </Button>
                <span className="text-sm font-bold text-slate-400">=</span>
                <div className="font-mono text-sm text-cyan-300">
                  Carry = {inputA && inputB ? '1' : '0'} | Sum = {inputA !== inputB ? '1' : '0'}
                </div>
              </div>
            )}

            {/* Counter / Frequency Slider */}
            <div className="space-y-2 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>تردد مولد نبضات الساعة (Clock Generator Frequency):</span>
                <span className="font-mono text-cyan-400 font-bold">{clockFrequency.toFixed(1)} Hz</span>
              </div>
              <Slider
                value={[clockFrequency]}
                onValueChange={(val) => setClockFrequency(val[0])}
                min={0.5}
                max={10.0}
                step={0.5}
              />
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
              title: 'الإلكترونيات الرقمية والمعالجات',
              currentStep: `الوضع النشط: ${activeMode}`,
              userAction: `التحقق من حالة الدائرة المنطقية عند التردد ${clockFrequency} Hz بالمدخلات A=${inputA ? '1' : '0'} و B=${inputB ? '1' : '0'}`,
              activeMetrics: {
                mode: activeMode,
                gate: selectedGate,
                inputA: inputA ? '1' : '0',
                inputB: inputB ? '1' : '0',
                outputQ: gateOutput ? '1' : '0',
                clockFrequency: `${clockFrequency} Hz`,
              }
            }}
            suggestions={[
              'كيف تستطيع بناء بوابة XOR باستخدام أربع بوابات NAND فقط؟',
              'ما الفرق بين الدوائر التوافقية (Combinational) والدوائر التتابعية (Sequential)؟',
              'ما هو زمن الاستقرار (Setup Time) وزمن المسك (Hold Time) في قلابات الذاكرة؟',
              'كيف يحول الجامع الكامل (Full Adder) مسألة الطرح إلى جمع باستخدام المتمم الثنائي (2s Complement)؟',
            ]}
          />

          {/* Educational Information Section */}
          <InfoSection
            data={[
              { label: 'المنظومة الرقمية', value: activeMode, color: 'text-cyan-300' },
              { label: 'الخرج اللحظي Q', value: gateOutput ? '1 (HIGH)' : '0 (LOW)', color: 'text-teal-300' },
              { label: 'تردد الساعة', value: `${clockFrequency} Hz`, color: 'text-amber-300' },
              { label: 'قيمة العداد الثنائي', value: `${counterDecimal} (0x${counterDecimal.toString(16).toUpperCase()})`, color: 'text-purple-300' },
            ]}
            formulas={[
              { name: 'قانون دي مورغان (De Morgan)', formula: '(A · B) = A + B', description: 'نفي حاصل الضرب المنطقي يساوي مجموع المنفيات' },
              { name: 'معادلة الجامع النصفي (Half Adder)', formula: 'Sum = A ⊕ B, Carry = A · B', description: 'الجمع الثنائي الأساسي لخانة واحدة' },
              { name: 'الجهد المنطقي لمعيار TTL', formula: 'V_IH ≥ 2.0V, V_IL ≤ 0.8V', description: 'عتبات الجهد الكهربائي لتمييز الصفر والواحد' },
            ]}
            explanation="الإلكترونيات الرقمية هي الركيزة الأساسية لكافة الحواسيب والهواتف الذكية والمعالجات الدقيقة. تعتمد على تمثيل كافة البيانات والمعادلات بحالتين منطقيتين فقط (0 و 1) باستخدام مليارات الترانزستورات المدمجة على رقاقة سيليكون نانوية."
            facts={[
              'أول معالج تجاري من إنتل (Intel 4004 عام 1971) احتوى على 2,300 ترانزستور فقط، بينما تحتوي معالجات اليوم على أكثر من 50 مليار ترانزستور على مساحة أصغر من ظفر الإصبع!',
              'قانون مور (Moore\'s Law) تنبأ بتضاعف عدد الترانزستورات على شريحة السيليكون كل عامين تقريباً.',
              'تستخدم الحواسيب النظام الثنائي (Binary) لأن الدوائر الإلكترونية أسهل وأكثر استقراراً في التمييز بين حالتي التشغيل (ON) والإيقاف (OFF) بدلاً من تمييز 10 مستويات جهد مختلفة.',
            ]}
          />

          {/* Interactive Quiz Section */}
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default DigitalElectronicsSimulation;
