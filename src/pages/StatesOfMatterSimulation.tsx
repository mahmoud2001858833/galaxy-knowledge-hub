import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Box, Cylinder, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Flame, Snowflake, Wind, Zap, Gauge, Layers, Sparkles } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

// Core Framework
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import CinematicCameraController, { CameraPreset } from '@/components/simulations/CinematicCameraController';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

type MatterState = 'solid' | 'liquid' | 'gas' | 'plasma';

interface Particle3D {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  latticeBase: THREE.Vector3;
  type: 'neutral' | 'ion' | 'electron';
}

// 3D Matter Chamber
const MatterChamber3D: React.FC<{
  temperature: number; // -50 to 3500 °C
  pressure: number;    // 0.1 to 10 atm
  isPlaying: boolean;
}> = ({ temperature, pressure, isPlaying }) => {
  const pointsRef = useRef<THREE.InstancedMesh>(null);
  const electronsRef = useRef<THREE.InstancedMesh>(null);
  const chamberBounds = { minX: -2.0, maxX: 2.0, minY: -1.8, maxY: 1.8, minZ: -2.0, maxZ: 2.0 };

  // Determine current thermodynamic state
  const state: MatterState = useMemo(() => {
    if (temperature < 0) return 'solid';
    if (temperature <= 100) return 'liquid';
    if (temperature < 2500) return 'gas';
    return 'plasma';
  }, [temperature]);

  // Generate 125 particles in a 5x5x5 regular crystal grid
  const particles = useMemo<Particle3D[]>(() => {
    const list: Particle3D[] = [];
    const countPerAxis = 5;
    const spacing = 0.7;
    for (let x = 0; x < countPerAxis; x++) {
      for (let y = 0; y < countPerAxis; y++) {
        for (let z = 0; z < countPerAxis; z++) {
          const bx = (x - 2) * spacing;
          const by = (y - 2) * spacing - 0.4;
          const bz = (z - 2) * spacing;
          list.push({
            pos: new THREE.Vector3(bx, by, bz),
            vel: new THREE.Vector3(
              (Math.random() - 0.5) * 0.05,
              (Math.random() - 0.5) * 0.05,
              (Math.random() - 0.5) * 0.05
            ),
            latticeBase: new THREE.Vector3(bx, by, bz),
            type: 'neutral',
          });
        }
      }
    }
    return list;
  }, []);

  // Extra electrons for plasma state
  const electrons = useMemo<Particle3D[]>(() => {
    return Array.from({ length: 60 }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      ),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      ),
      latticeBase: new THREE.Vector3(),
      type: 'electron',
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const dummyElectron = useMemo(() => new THREE.Object3D(), []);

  // Simulation step
  useFrame((_, delta) => {
    if (!pointsRef.current || !isPlaying) return;

    // Thermodynamic speed coefficient
    const kelvin = Math.max(10, temperature + 273.15);
    const thermalSpeed = Math.sqrt(kelvin / 300) * 1.6;

    // Update main particles
    particles.forEach((p, i) => {
      if (state === 'solid') {
        // Lattice harmonic oscillation around base position
        const amp = 0.02 + (Math.max(0, temperature + 50) / 100) * 0.08;
        p.pos.x = p.latticeBase.x + (Math.sin(p.pos.y * 10 + delta * 20 + i) * amp);
        p.pos.y = p.latticeBase.y + (Math.cos(p.pos.z * 10 + delta * 20 + i) * amp);
        p.pos.z = p.latticeBase.z + (Math.sin(p.pos.x * 10 + delta * 20 + i) * amp);
      } else if (state === 'liquid') {
        // Fluid shear & gravity settle
        p.vel.y -= 0.015; // Gravity
        p.vel.x += (Math.random() - 0.5) * 0.02 * thermalSpeed;
        p.vel.z += (Math.random() - 0.5) * 0.02 * thermalSpeed;
        p.vel.multiplyScalar(0.96); // Viscous drag

        p.pos.add(p.vel);

        // Bounds check (settles in bottom half)
        if (p.pos.y < chamberBounds.minY + 0.3) {
          p.pos.y = chamberBounds.minY + 0.3;
          p.vel.y *= -0.3;
        }
        if (p.pos.y > -0.2) {
          p.pos.y = -0.2;
          p.vel.y *= -0.3;
        }
        if (p.pos.x < chamberBounds.minX + 0.3) { p.pos.x = chamberBounds.minX + 0.3; p.vel.x *= -0.7; }
        if (p.pos.x > chamberBounds.maxX - 0.3) { p.pos.x = chamberBounds.maxX - 0.3; p.vel.x *= -0.7; }
        if (p.pos.z < chamberBounds.minZ + 0.3) { p.pos.z = chamberBounds.minZ + 0.3; p.vel.z *= -0.7; }
        if (p.pos.z > chamberBounds.maxZ - 0.3) { p.pos.z = chamberBounds.maxZ - 0.3; p.vel.z *= -0.7; }
      } else {
        // Gas / Plasma: Maxwell-Boltzmann free ballistic motion
        p.pos.addScaledVector(p.vel, thermalSpeed * (state === 'plasma' ? 1.5 : 1.0));

        // Wall collisions
        ['x', 'y', 'z'].forEach(axis => {
          const a = axis as 'x' | 'y' | 'z';
          const min = a === 'x' ? chamberBounds.minX : a === 'y' ? chamberBounds.minY : chamberBounds.minZ;
          const max = a === 'x' ? chamberBounds.maxX : a === 'y' ? chamberBounds.maxY : chamberBounds.maxZ;
          if (p.pos[a] < min + 0.3) {
            p.pos[a] = min + 0.3;
            p.vel[a] *= -1;
          }
          if (p.pos[a] > max - 0.3) {
            p.pos[a] = max - 0.3;
            p.vel[a] *= -1;
          }
        });
      }

      dummy.position.copy(p.pos);
      const scale = state === 'solid' ? 0.85 : state === 'plasma' ? 0.7 : 0.75;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      pointsRef.current!.setMatrixAt(i, dummy.matrix);
    });

    pointsRef.current.instanceMatrix.needsUpdate = true;

    // Update plasma electrons
    if (electronsRef.current && state === 'plasma') {
      electrons.forEach((e, i) => {
        e.pos.add(e.vel);
        if (Math.abs(e.pos.x) > 1.8) e.vel.x *= -1;
        if (Math.abs(e.pos.y) > 1.6) e.vel.y *= -1;
        if (Math.abs(e.pos.z) > 1.8) e.vel.z *= -1;

        dummyElectron.position.copy(e.pos);
        dummyElectron.scale.setScalar(0.25);
        dummyElectron.updateMatrix();
        electronsRef.current!.setMatrixAt(i, dummyElectron.matrix);
      });
      electronsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  // Color theme according to state
  const particleColor = useMemo(() => {
    switch (state) {
      case 'solid':
        return '#38bdf8'; // Crystal ice cyan
      case 'liquid':
        return '#0284c7'; // Liquid azure blue
      case 'gas':
        return '#f59e0b'; // Warm vapor amber
      case 'plasma':
        return '#ef4444'; // Glowing ion crimson
    }
  }, [state]);

  return (
    <group position={[0, 0, 0]}>
      {/* Transparent Glass Vacuum Chamber Cube */}
      <mesh>
        <boxGeometry args={[4.4, 4.0, 4.4]} />
        <meshPhysicalMaterial
          color="#0f172a"
          transmission={0.92}
          transparent
          opacity={0.3}
          roughness={0.1}
          ior={1.4}
        />
      </mesh>

      {/* Chamber Corner Pillars */}
      {[-2.2, 2.2].map(x =>
        [-2.2, 2.2].map(z => (
          <mesh key={`pillar-${x}-${z}`} position={[x, 0, z]}>
            <cylinderGeometry args={[0.08, 0.08, 4.1, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* Top & Bottom Solid Metal Flanges */}
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[4.6, 0.15, 4.6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0, -2.05, 0]}>
        <boxGeometry args={[4.6, 0.15, 4.6]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Heating / Cooling Base Grate */}
      <mesh position={[0, -1.95, 0]}>
        <boxGeometry args={[4.0, 0.05, 4.0]} />
        <meshStandardMaterial
          color={temperature > 100 ? '#ef4444' : temperature < 0 ? '#38bdf8' : '#64748b'}
          emissive={temperature > 100 ? '#ef4444' : temperature < 0 ? '#38bdf8' : '#000000'}
          emissiveIntensity={Math.min(1.5, Math.abs(temperature) / 200)}
        />
      </mesh>

      {/* Instanced Matter Particles (Nuclei / Atoms) */}
      <instancedMesh ref={pointsRef} args={[undefined, undefined, particles.length]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color={particleColor}
          emissive={particleColor}
          emissiveIntensity={state === 'plasma' ? 0.8 : 0.2}
          roughness={0.2}
          metalness={0.3}
        />
      </instancedMesh>

      {/* Instanced Free Electrons in Plasma State */}
      {state === 'plasma' && (
        <instancedMesh ref={electronsRef} args={[undefined, undefined, electrons.length]}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshBasicMaterial color="#60a5fa" />
        </instancedMesh>
      )}

      {/* Plasma High-voltage Glow Light */}
      {state === 'plasma' && (
        <pointLight position={[0, 0, 0]} color="#f43f5e" intensity={2.5} distance={6} />
      )}
    </group>
  );
};

export const StatesOfMatterSimulation: React.FC = () => {
  const [temperature, setTemperature] = useState(25); // Celsius
  const [pressure, setPressure] = useState(1.0);       // atm
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<'states' | 'phasediagram' | 'transitions'>('states');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  // Compute thermal physics metrics
  const kelvin = Math.max(10, temperature + 273.15);
  // RMS velocity for water/argon: v_rms = sqrt(3 R T / M)
  const rmsSpeed = Math.round(Math.sqrt((3 * 8.314 * kelvin) / 0.018));
  // Entropy proxy
  const entropy = Number((188.8 + 0.05 * (temperature - 25) + (temperature > 100 ? 109 : 0) + (temperature < 0 ? -22 : 0)).toFixed(1));

  // Determine state string
  const stateLabel = useMemo(() => {
    if (temperature < 0) return 'صلب (جليد متبلور ❄️)';
    if (temperature <= 100) return 'سائل (مائع لزج 💧)';
    if (temperature < 2500) return 'غاز (بخار متطاير 💨)';
    return 'بلازما (غاز متأين فائق ⚡)';
  }, [temperature]);

  // CyberLab HUD Metrics
  const hudMetrics = useMemo(() => {
    return [
      {
        id: 'temperature',
        label: 'درجة الحرارة (T)',
        value: temperature,
        unit: '°C',
        status: temperature > 1000 ? ('critical' as const) : temperature < 0 ? ('normal' as const) : ('normal' as const),
        min: -50,
        max: 3500,
      },
      {
        id: 'pressure',
        label: 'الضغط الداخلي (P)',
        value: pressure,
        unit: 'atm',
        status: pressure > 5 ? ('warning' as const) : ('normal' as const),
        min: 0.1,
        max: 10,
      },
      {
        id: 'rms',
        label: 'متوسط السرعة الحركية (v_rms)',
        value: rmsSpeed,
        unit: 'm/s',
        status: 'normal' as const,
        min: 200,
        max: 3000,
      },
      {
        id: 'entropy',
        label: 'الإنتروبيا العشوائية (S)',
        value: entropy,
        unit: 'J/mol·K',
        status: entropy > 250 ? ('warning' as const) : ('normal' as const),
        min: 150,
        max: 400,
      },
    ];
  }, [temperature, pressure, rmsSpeed, entropy]);

  // Gamified Challenges
  const challenges: Challenge[] = useMemo(() => {
    return [
      {
        id: 'boiling_vaporization',
        title: 'الوصول إلى نقطة الغليان والتبخر التام',
        description: 'ارفع درجة حرارة الغرفة إلى 100°C أو أكثر لمشاهدة تفكك الروابط الهيدروجينية وتحول السائل إلى غاز حر الحركة.',
        targetMetric: 'درجة الحرارة',
        targetValue: 120,
        unit: '°C',
        currentValue: temperature,
        holdTimeRequired: 3,
        tolerance: 30,
        isCompleted: false,
        hint: 'حرك منزلق درجة الحرارة إلى ما فوق 100°C لتنشيط حالة الغاز.',
      },
      {
        id: 'crystalline_solidification',
        title: 'التجميد والتبلور الشبكي الصلب',
        description: 'اخفض درجة الحرارة إلى ما دون الصفر المئوي (< 0°C) لمراقبة ترتب الجسيمات في شبكة بلورية متراصة مع اهتزازات موضعية.',
        targetMetric: 'درجة الحرارة',
        targetValue: -20,
        unit: '°C',
        currentValue: temperature,
        holdTimeRequired: 3,
        tolerance: 20,
        isCompleted: false,
        hint: 'اخفض الحرارة إلى قيمة سالبة (مثلاً -20°C) لتجميد المادة.',
      },
      {
        id: 'plasma_ionization',
        title: 'توليد الحالة الرابعة للمادة (البلازما المتأينة)',
        description: 'ارفع درجة الحرارة إلى النطاق الشمسي الفائق (> 2500°C) لنزع الإلكترونات عن النوى وتوليد بلازما نشطة كهربائياً.',
        targetMetric: 'درجة الحرارة',
        targetValue: 2800,
        unit: '°C',
        currentValue: temperature,
        holdTimeRequired: 3,
        tolerance: 400,
        isCompleted: false,
        hint: 'ارفع درجة الحرارة إلى أقصاها (> 2500°C) لمشاهدة وميض الإلكترونات الحرة والنوى المتأينة.',
      },
    ];
  }, [temperature]);

  const quizQuestions = [
    {
      question: 'ما الذي يحدد بشكل أساسي حالة المادة (صلبة، سائلة، أو غازية)؟',
      options: [
        'لون الوعاء الحاوي فقط',
        'التوازن بين الطاقة الحركية الحرارية للجزيئات وقوى التجاذب بين الجزيئية',
        'شحنة الإلكترونات الخارجية فقط',
        'كثافة الهواء الجوي المحيط بالوعاء',
      ],
      correctIndex: 1,
      explanation: 'الحالة الفيزيائية هي محصلة التنافس بين الطاقة الحركية (التي تحاول تشتيت الجزيئات مع زيادة الحرارة) وقوى التجاذب (فان دير فالس / الروابط الهيدروجينية).',
    },
    {
      question: 'ما هي النقطة الثلاثية (Triple Point) في مخطط أطوار المادة؟',
      options: [
        'درجة الحرارة التي يغلي عندها الماء ثلاث مرات',
        'الحالة الديناميكية الحرارية الدقيقة من الضغط والحرارة التي تتعايش عندها الأطوار الثلاثة (صلب، سائل، غاز) في اتزان تام',
        'أعلى ضغط يمكن أن يتحمله الغاز قبل الانفجار',
        'نقطة التسامي المباشر للثلج الجاف',
      ],
      correctIndex: 1,
      explanation: 'النقطة الثلاثية للماء تحدث عند 0.01°C وضغط 0.006 atm، حيث تتساوى الطاقات الحرة وتتعايش الحالات الثلاث معاً.',
    },
    {
      question: 'لماذا تنخفض كثافة الجليد مقارنة بالماء السائل مما يجعله يطفو على السطح؟',
      options: [
        'لأن الجليد يفقد جزءاً من كتلته',
        'بسبب تشكل شبكة بلورية سداسية مفتوحة بواسطة الروابط الهيدروجينية تحتجز فراغات هوائية أكبر',
        'بسبب امتصاصه للغازات المحيطة',
        'لأن الجزيئات تتوقف تماماً عن الحركة',
      ],
      correctIndex: 1,
      explanation: 'الروابط الهيدروجينية تتبلور في بنية سداسية سفلية أقل تراصاً من السائل، وهي شذوذ مائي فريد يسمح بالحياة المائية تحت الأنهار المتجمدة.',
    },
    {
      question: 'ما هي البلازما، ولماذا توصف بالحالة الرابعة للمادة؟',
      options: [
        'محلول مائي يحتوي على بروتينات الدم فقط',
        'غاز متأين فائق الحرارة تنفصل فيه الإلكترونات عن أنويتها الذرية وتتحرك بحرية موصلة للكهرباء',
        'سائل شديد البرودة قرب الصفر المطلق',
        'معدن صلب تحت ضغط هائل في باطن الأرض',
      ],
      correctIndex: 1,
      explanation: 'البلازما تتكون عند درجات حرارة فائقة حيث تكتسب الإلكترونات طاقة كافية للتحرر من جذب النواة، مما يجعله وسطاً فائق التوصيل للكهرباء والمجالات المغناطيسية.',
    },
  ];

  return (
    <SimulationLayout
      title="مختبر حالات المادة والديناميكا الحرارية 3D"
      titleGradient="from-cyan-400 via-sky-300 to-indigo-400"
      backgroundGradient="from-slate-950 via-slate-900 to-sky-950"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 3D Particle Chamber Viewport */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-sky-500/30 bg-slate-950 shadow-2xl shadow-sky-950/40">
            <Canvas camera={{ position: [0, 1.8, 6.5], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={1.2} />
              <pointLight position={[-10, -5, -6]} intensity={0.6} color="#0284c7" />
              <directionalLight position={[0, 8, 4]} intensity={0.8} />

              <CinematicCameraController preset={cameraPreset} />

              <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.08}>
                <MatterChamber3D
                  temperature={temperature}
                  pressure={pressure}
                  isPlaying={isPlaying}
                />
              </Float>

              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>

            {/* CyberLab HUD Overlay */}
            <CyberLabHUD
              metrics={hudMetrics}
              title={`غرفة الأطوار الحرارية • الحالة: ${stateLabel}`}
              status="active"
              oscilloscopeWaveform={temperature > 2500 ? 'noise' : 'sine'}
              oscilloscopeFrequency={rmsSpeed / 200}
            />

            {/* Live Camera Presets */}
            <div className="absolute top-4 left-4 z-20 flex gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
              <Button
                size="sm"
                variant={cameraPreset === 'overview' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('overview')}
                className="h-7 text-xs px-2.5 text-sky-300"
              >
                شامل
              </Button>
              <Button
                size="sm"
                variant={cameraPreset === 'microscopic' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('microscopic')}
                className="h-7 text-xs px-2.5 text-sky-300"
              >
                مجهري بلوري
              </Button>
              <Button
                size="sm"
                variant={cameraPreset === 'flow' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('flow')}
                className="h-7 text-xs px-2.5 text-sky-300"
              >
                محور التدفق
              </Button>
              <Button
                size="sm"
                variant={cameraPreset === 'orbit360' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('orbit360')}
                className="h-7 text-xs px-2.5 text-sky-300"
              >
                دوران 360°
              </Button>
            </div>

            {/* Playback Controls Overlay */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 w-8 p-0 text-sky-400 hover:text-sky-300"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTemperature(25);
                  setPressure(1.0);
                }}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                title="إعادة ضبط"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Thermal & Pressure Thermodynamic Sliders */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-sky-300 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-sky-400" />
                <span>التحكم في المتغيرات الديناميكية الحرارية:</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                الحالة الآن: <strong className="text-sky-300">{stateLabel}</strong>
              </div>
            </div>

            {/* Quick State Presets */}
            <div className="grid grid-cols-4 gap-2">
              <Button
                size="sm"
                variant={temperature < 0 ? 'default' : 'outline'}
                onClick={() => setTemperature(-25)}
                className="text-xs border-sky-500/40 text-sky-300 bg-sky-950/30"
              >
                <Snowflake className="w-3.5 h-3.5 mr-1" />
                صلب (-25°C)
              </Button>
              <Button
                size="sm"
                variant={temperature >= 0 && temperature <= 100 ? 'default' : 'outline'}
                onClick={() => setTemperature(40)}
                className="text-xs border-blue-500/40 text-blue-300 bg-blue-950/30"
              >
                سائل (40°C)
              </Button>
              <Button
                size="sm"
                variant={temperature > 100 && temperature < 2500 ? 'default' : 'outline'}
                onClick={() => setTemperature(250)}
                className="text-xs border-amber-500/40 text-amber-300 bg-amber-950/30"
              >
                <Wind className="w-3.5 h-3.5 mr-1" />
                غاز (250°C)
              </Button>
              <Button
                size="sm"
                variant={temperature >= 2500 ? 'default' : 'outline'}
                onClick={() => setTemperature(3000)}
                className="text-xs border-rose-500/40 text-rose-300 bg-rose-950/30"
              >
                <Zap className="w-3.5 h-3.5 mr-1" />
                بلازما (3000°C)
              </Button>
            </div>

            {/* Continuous Temperature Slider */}
            <div className="space-y-2 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  درجة حرارة الغرفة (Temperature):
                </span>
                <span className="font-mono text-sky-400 font-bold">{temperature}°C ({kelvin.toFixed(1)} K)</span>
              </div>
              <Slider
                value={[temperature]}
                onValueChange={(val) => setTemperature(val[0])}
                min={-50}
                max={3500}
                step={10}
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span className="text-cyan-400">-50°C (تجميد فائق)</span>
                <span className="text-sky-300">0°C (انصهار)</span>
                <span className="text-amber-400">100°C (غليان)</span>
                <span className="text-rose-400">2500°C+ (تأين البلازما)</span>
              </div>
            </div>

            {/* Continuous Pressure Slider */}
            <div className="space-y-2 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>الضغط المسلط بواسطة المكبس (Pressure):</span>
                <span className="font-mono text-teal-400 font-bold">{pressure.toFixed(1)} atm</span>
              </div>
              <Slider
                value={[pressure]}
                onValueChange={(val) => setPressure(val[0])}
                min={0.1}
                max={10.0}
                step={0.1}
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
              title: 'حالات المادة والديناميكا الحرارية',
              currentStep: `الحالة الفيزيائية الحالية: ${stateLabel}`,
              userAction: `مراقبة اهتزاز وحركة 125 جسيماً عند درجة حرارة ${temperature}°C وضغط ${pressure.toFixed(1)} atm`,
              activeMetrics: {
                state: stateLabel,
                temperature: `${temperature}°C`,
                kelvin: `${kelvin.toFixed(1)} K`,
                pressure: `${pressure.toFixed(1)} atm`,
                rmsSpeed: `${rmsSpeed} m/s`,
                entropy: `${entropy} J/mol·K`,
              }
            }}
            suggestions={[
              'كيف تفسر معادلة ماكسويل-بولتزمان سرعات الجزيئات في الغاز؟',
              'ما هو السائل فائق الحرج (Supercritical Fluid) ومتى يتكون؟',
              'لماذا تبقى درجة الحرارة ثابتة أثناء حدوث التحول الطوري (الحرارة الكامنة)؟',
              'ما الفارق الجوهري في التوصيل الكهربائي بين الغاز العادي والبلازما؟',
            ]}
          />

          {/* Educational Information Section */}
          <InfoSection
            data={[
              { label: 'الحالة الفيزيائية', value: stateLabel.split(' ')[0], color: 'text-sky-300' },
              { label: 'متوسط السرعة الحركية', value: `${rmsSpeed} m/s`, color: 'text-teal-300' },
              { label: 'الإنتروبيا العشوائية', value: `${entropy} J/mol·K`, color: 'text-indigo-300' },
              { label: 'الضغط الداخلي', value: `${pressure.toFixed(1)} atm`, color: 'text-amber-300' },
            ]}
            formulas={[
              { name: 'متوسط السرعة الجزيئية الجذرية', formula: 'v_rms = √(3RT / M)', description: 'سرعة جزيئات الغاز تتناسب طردياً مع الجذر التربيعي لدرجة الحرارة المطلقة' },
              { name: 'معادلة كلاوزيوس-كلابيرون', formula: 'dP/dT = L / (T × ΔV)', description: 'تحدد ميل منحنى الاتزان بين طورين في مخطط الطور اعتماداً على الحرارة الكامنة L' },
              { name: 'قانون الغاز المثالي', formula: 'PV = nRT', description: 'العلاقة التأسيسية بين الضغط والحجم ودرجة الحرارة للغازات الخفيفة' },
            ]}
            explanation="تتحدد حالات المادة بناءً على الطاقة الحركية لجسيماتها مقارنة بقوى التجاذب بين الجزيئات. في الحالة الصلبة تتقيد الجسيمات باهتزازات موضعية داخل شبكة بلورية، وفي السائلة تنزلق بحرية مع الحفاظ على تماسك الحجم، وفي الغازية تتطاير بمسارات عشوائية، بينما عند درجات الحرارة الهائلة تتأين الذرات تماماً مشكلة البلازما التي تمثل أكثر من 99% من المادة المرئية في الكون."
            facts={[
              'الماء يمتلك شذوذاً فريداً في مخطط الطور، حيث يمتلك خط الانصهار (صلب-سائل) ميلاً سالباً نادراً؛ مما يعني أن زيادة الضغط تذيب الجليد بدلاً من تجميده.',
              'الهيليوم السائل يتحول عند درجة 2.17 كلفن إلى حالة "الميوعة الفائقة" (Superfluid) حيث تنعدم لزوجته تماماً ويمكنه التسلق على جدران الوعاء.',
              'تحدث ظاهرة التسامي في المريخ بكثرة حيث يتحول الجليد الجاف (CO₂) مباشرة إلى غاز دون المرور بحالة سائلة بسبب انخفاض الضغط الجوي.',
            ]}
          />

          {/* Interactive Quiz Section */}
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default StatesOfMatterSimulation;
