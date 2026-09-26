import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Cylinder, Sphere, Ring, Float } from '@react-three/drei';
import * as THREE from 'three';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Flame, 
  Sparkles, 
  RotateCcw, 
  Play, 
  Pause, 
  Gauge, 
  Layers, 
  Activity,
  Layers2
} from 'lucide-react';
import { CyberLabHUD } from '@/components/simulations/CyberLabHUD';
import { LiveAILabCoPilot } from '@/components/simulations/LiveAILabCoPilot';
import { CinematicCameraController, CameraPreset } from '@/components/simulations/CinematicCameraController';
import { LabChallengeEngine } from '@/components/simulations/LabChallengeEngine';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';
import { labSound } from '@/utils/labAudio';

// ====================================================
// 3D MOLECULAR COLLISION SIMULATION ENGINE
// ====================================================

interface Molecule3DData {
  id: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  isProduct: boolean;
}

const CollisionChamber3D: React.FC<{
  temperatureK: number;
  concentration: number;
  hasCatalyst: boolean;
  isPlaying: boolean;
  onReactionCount: (count: number) => void;
}> = ({ temperatureK, concentration, hasCatalyst, isPlaying, onReactionCount }) => {
  const containerRadius = 2.4;
  const containerHeight = 3.6;

  // Initialize particles
  const particles = useMemo(() => {
    const list: Molecule3DData[] = [];
    const count = Math.min(80, Math.floor(concentration * 0.75) + 15);
    const speedFactor = Math.sqrt(temperatureK / 300) * 1.5;

    for (let i = 0; i < count; i++) {
      list.push({
        id: i,
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * (containerRadius * 1.4),
          (Math.random() - 0.5) * (containerHeight * 0.7),
          (Math.random() - 0.5) * (containerRadius * 1.4)
        ),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * speedFactor,
          (Math.random() - 0.5) * speedFactor,
          (Math.random() - 0.5) * speedFactor
        ),
        isProduct: false
      });
    }
    return list;
  }, [concentration, temperatureK]);

  const catalystMeshRef = useRef<THREE.Mesh>(null);
  const flashLightRef = useRef<THREE.PointLight>(null);
  const flashIntensityRef = useRef<number>(0);

  // Activation Energy threshold (Lower with catalyst)
  const activationThreshold = useMemo(() => {
    return hasCatalyst ? 1.4 : 2.5;
  }, [hasCatalyst]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const baseSpeed = Math.sqrt(temperatureK / 300);
    let reactedThisFrame = 0;

    // Pulse catalyst mesh glow
    if (catalystMeshRef.current && hasCatalyst) {
      (catalystMeshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 
        0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.25;
    }

    // Decay reaction flash
    if (flashLightRef.current) {
      flashIntensityRef.current = Math.max(0, flashIntensityRef.current - delta * 4);
      flashLightRef.current.intensity = flashIntensityRef.current;
    }

    // Step physics for all molecules
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];

      // Update position
      p1.pos.addScaledVector(p1.vel, delta * baseSpeed * 1.8);

      // Radial container boundary rebound
      const horizontalDist = Math.sqrt(p1.pos.x * p1.pos.x + p1.pos.z * p1.pos.z);
      if (horizontalDist > containerRadius - 0.2) {
        const normalX = p1.pos.x / horizontalDist;
        const normalZ = p1.pos.z / horizontalDist;
        const dot = p1.vel.x * normalX + p1.vel.z * normalZ;
        p1.vel.x -= 2 * dot * normalX;
        p1.vel.z -= 2 * dot * normalZ;
      }

      // Height boundary rebound
      if (p1.pos.y > containerHeight / 2 - 0.2) {
        p1.pos.y = containerHeight / 2 - 0.2;
        p1.vel.y *= -1;
      } else if (p1.pos.y < -containerHeight / 2 + (hasCatalyst ? 0.4 : 0.2)) {
        p1.pos.y = -containerHeight / 2 + (hasCatalyst ? 0.4 : 0.2);
        p1.vel.y *= -1;

        // Catalyst surface interaction: adsorbed molecules react much faster!
        if (hasCatalyst && !p1.isProduct && Math.random() < 0.15) {
          p1.isProduct = true;
          reactedThisFrame++;
          flashIntensityRef.current = 1.8;
        }
      }

      // Inter-molecule collisions
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = p1.pos.distanceTo(p2.pos);

        if (dist < 0.35) {
          // Elastic rebound
          const collisionNormal = p1.pos.clone().sub(p2.pos).normalize();
          const relVel = p1.vel.clone().sub(p2.vel);
          const speed = relVel.length();

          // Exchange velocities
          p1.vel.addScaledVector(collisionNormal, 0.4);
          p2.vel.addScaledVector(collisionNormal, -0.4);

          // Check if energetic enough to overcome Activation Energy (Ea)
          if ((!p1.isProduct || !p2.isProduct) && speed > activationThreshold) {
            if (!p1.isProduct || !p2.isProduct) {
              p1.isProduct = true;
              p2.isProduct = true;
              reactedThisFrame += 2;
              flashIntensityRef.current = 2.2;
              labSound.playLaserPulse(700);
            }
          }
        }
      }
    }

    if (reactedThisFrame > 0) {
      const totalProducts = particles.filter(p => p.isProduct).length;
      onReactionCount(totalProducts);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Reaction Flash Light */}
      <pointLight ref={flashLightRef} color="#fbbf24" distance={5} intensity={0} />

      {/* 3D Glass Cylindrical Chamber */}
      <Cylinder args={[containerRadius, containerRadius, containerHeight, 32, 1, true]}>
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.92}
          opacity={0.25}
          transparent
          roughness={0.08}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </Cylinder>

      {/* Chamber Top & Bottom Metallic Caps */}
      <Cylinder args={[containerRadius + 0.1, containerRadius + 0.1, 0.15, 32]} position={[0, containerHeight / 2 + 0.08, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </Cylinder>
      <Cylinder args={[containerRadius + 0.1, containerRadius + 0.1, 0.15, 32]} position={[0, -containerHeight / 2 - 0.08, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </Cylinder>

      {/* Optional 3D Platinum Catalyst Honeycomb Grid at bottom */}
      {hasCatalyst && (
        <mesh ref={catalystMeshRef} position={[0, -containerHeight / 2 + 0.25, 0]}>
          <cylinderGeometry args={[containerRadius - 0.1, containerRadius - 0.1, 0.25, 24]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={0.6}
            metalness={0.85}
            roughness={0.2}
            wireframe
          />
        </mesh>
      )}

      {/* 3D Floating Molecules */}
      {particles.map((p) => (
        <group key={p.id} position={p.pos}>
          <Sphere args={[p.isProduct ? 0.14 : 0.12, 16, 16]}>
            <meshStandardMaterial
              color={p.isProduct ? "#f43f5e" : "#0284c7"}
              emissive={p.isProduct ? "#e11d48" : "#0ea5e9"}
              emissiveIntensity={p.isProduct ? 0.8 : 0.4}
              roughness={0.2}
              metalness={0.3}
            />
          </Sphere>
        </group>
      ))}
    </group>
  );
};

// ====================================================
// MAIN CHEMICAL KINETICS SIMULATION PAGE
// ====================================================
const ChemicalKineticsSimulation = () => {
  const [temperature, setTemperature] = useState<number>(350);
  const [concentration, setConcentration] = useState<number>(60);
  const [hasCatalyst, setHasCatalyst] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [productCount, setProductCount] = useState<number>(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  // Arrhenius equation approximations
  const eaWithout = 75; // kJ/mol
  const eaWith = 45; // kJ/mol
  const activeEa = hasCatalyst ? eaWith : eaWithout;

  // Rate constant k = A * exp(-Ea / RT)
  const R = 8.314e-3; // kJ/(mol*K)
  const rateConstantK = useMemo(() => {
    return Math.exp(-activeEa / (R * temperature)) * 1e7;
  }, [activeEa, temperature, R]);

  const totalMolecules = Math.min(80, Math.floor(concentration * 0.75) + 15);
  const yieldPercentage = Math.min(100, Math.round((productCount / Math.max(1, totalMolecules)) * 100));

  const hudMetrics = [
    {
      id: 'rate_k',
      label: 'ثابت السرعة (Arrhenius k)',
      value: rateConstantK.toFixed(2),
      unit: 's⁻¹',
      color: 'text-amber-400',
      progressPercent: Math.min(100, (rateConstantK / 50) * 100),
      trend: rateConstantK > 15 ? 'up' as const : 'stable' as const
    },
    {
      id: 'ea',
      label: 'طاقة التنشيط (Ea)',
      value: activeEa,
      unit: 'kJ/mol',
      color: hasCatalyst ? 'text-emerald-400' : 'text-rose-400',
      progressPercent: (activeEa / 100) * 100,
      trend: hasCatalyst ? 'down' as const : 'stable' as const
    },
    {
      id: 'yield',
      label: 'نسبة النواتج المتكونة',
      value: `${yieldPercentage}%`,
      unit: '',
      color: yieldPercentage > 70 ? 'text-emerald-400' : 'text-cyan-400',
      progressPercent: yieldPercentage,
      trend: 'up' as const
    },
    {
      id: 'temp_speed',
      label: 'السرعة الجزيئية RMS',
      value: Math.round(Math.sqrt((3 * 8.314 * temperature) / 0.028)),
      unit: 'm/s',
      color: 'text-purple-400',
      progressPercent: (temperature / 600) * 100,
      trend: 'stable' as const
    }
  ];

  const challenges = [
    {
      id: 'catalyst-activation',
      title: 'كسر حاجز طاقة التنشيط',
      description: 'فعّل العامل المساعد الحفاز وسخّن المفاعل لتجاوز نسبة تحول 75% من المتفاعلات إلى نواتج.',
      targetDescription: 'نسبة النواتج > 75% مع تفعيل الحافز',
      checkSuccess: () => hasCatalyst && yieldPercentage >= 75,
      points: 200,
      badge: 'مهندس المحفزات الكيميائية'
    },
    {
      id: 'speed-doubling',
      title: 'مضاعفة سرعة التفاعل الحرارية',
      description: 'ارفع درجة الحرارة فوق 450 K لملاحظة زيادة تردد التصادمات الجزيئية الفعالة وتضاعف ثابت السرعة k.',
      targetDescription: 'الحرارة > 450 K و k > 20',
      checkSuccess: () => temperature >= 450 && rateConstantK >= 20,
      points: 150,
      badge: 'خبير نظرية التصادم'
    },
    {
      id: 'high-concentration-yield',
      title: 'مضاعفة التصادمات بالتركيز',
      description: 'ارفع تركيز الجزيئات إلى 80% لتكثيف احتمالية التقاء الجزيئات في وحدة الحجم.',
      targetDescription: 'التركيز >= 80%',
      checkSuccess: () => concentration >= 80,
      points: 120,
      badge: 'مكثف التفاعلات الكيميائية'
    }
  ];

  const quizQuestions = [
    { question: 'ما هو الدور الأساسي للعامل المساعد (Catalyst) في التفاعل الكيميائي؟', options: ['زيادة طاقة التنشيط', 'خفض طاقة التنشيط وتوفير مسار بديل للتفاعل', 'زيادة كمية النواتج النهائية فقط', 'تبريد المفاعل'], correctIndex: 1, explanation: 'العامل المساعد يوفر مساراً بديلاً ذا طاقة تنشيط (Ea) أقل، مما يزيد من نسبة التصادمات الفعالة وسرعة التفاعل دون أن يُستهلك.' },
    { question: 'وفق نظرية التصادم، ما الشرطان الأساسيان لحدوث تصادم فعال؟', options: ['السرعة العالية فقط', 'طاقة كافية (تساوي أو تفوق Ea) والتوجيه الفراغي الصحيح', 'اللون المناسب والحرارة المنخفضة', 'وجود شحنات متماثلة'], correctIndex: 1, explanation: 'لكي يتفكك الرابط وتتشكل الروابط الجديدة، يجب أن تمتلك الجزيئات طاقة حركة تفوق طاقة التنشيط وأن تتصادم بزوايا هندسية مناسبة.' },
    { question: 'ماذا يحدث لسرعة التفاعل الكيميائي تقريباً عند رفع درجة الحرارة بمقدار 10 درجات مئوية؟', options: ['تتضاعف مرتين تقريباً', 'تنخفض إلى النصف', 'تبقى ثابتة دون تغيير', 'تتضاعف 100 مرة'], correctIndex: 0, explanation: 'كقاعدة تجريبية شائعة، زيادة 10°C تضاعف تقريباً عدد الجزيئات التي تمتلك طاقة تعادل أو تزيد عن Ea.' }
  ];

  return (
    <SimulationLayout 
      title="مختبر الحركية الكيميائية ونظرية التصادم ثلاثي الأبعاد 3D" 
      titleGradient="from-amber-400 via-emerald-400 to-cyan-400" 
      backgroundGradient="from-slate-950 via-slate-900 to-emerald-950/20"
    >
      <div className="space-y-6">
        
        {/* LIVE HUD */}
        <CyberLabHUD
          title="محطة القياسات الحركية ومعدل التصادم الجزيئي"
          statusBadge={hasCatalyst ? "CATALYZED CASCADE" : "UNCATALYZED REGIME"}
          showWaveform={true}
          waveformColor={hasCatalyst ? "#10b981" : "#f59e0b"}
          waveformSpeed={rateConstantK * 0.15}
          metrics={hudMetrics}
        />

        {/* MAIN WORKSTATION GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* 3D VIEWPORT & CONTROLS (3 COLS) */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-xl">
              
              {/* Catalyst Switch Toggle */}
              <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
                <Switch 
                  checked={hasCatalyst} 
                  onCheckedChange={(val) => { setHasCatalyst(val); labSound.play(val ? 'laser' : 'click'); }} 
                />
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${hasCatalyst ? 'text-emerald-400' : 'text-slate-400'}`} />
                  العامل الحفاز البلاتيني (Pt Catalyst): {hasCatalyst ? 'مفعل (Ea = 45 kJ)' : 'معطل (Ea = 75 kJ)'}
                </span>
              </div>

              {/* Camera Presets */}
              <CinematicCameraController
                activePreset={cameraPreset}
                onSelectPreset={(p) => { setCameraPreset(p); labSound.play('whoosh'); }}
              />
            </div>

            {/* 3D Viewport Box */}
            <div className="relative w-full h-[520px] md:h-[600px] rounded-3xl overflow-hidden border border-emerald-500/30 bg-radial from-slate-900 via-slate-950 to-black shadow-2xl">
              
              <Canvas camera={{ position: [0, 1.8, 6.5], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 15, 10]} intensity={1.3} />
                <pointLight position={[-10, -5, -5]} intensity={0.6} color="#38bdf8" />

                <CollisionChamber3D
                  temperatureK={temperature}
                  concentration={concentration}
                  hasCatalyst={hasCatalyst}
                  isPlaying={isPlaying}
                  onReactionCount={setProductCount}
                />

                <OrbitControls 
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={3.0}
                  maxDistance={15}
                />
              </Canvas>

              {/* Viewport Info Overlay */}
              <div className="absolute top-4 left-4 p-3 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl text-xs text-white shadow-xl">
                <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>محاكاة حركة الجزيئات والتصادمات الفعالة</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-1">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span>متفاعلات ({totalMolecules - productCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>نواتج ({productCount})</span>
                  </div>
                </div>
              </div>

              {/* Bottom Instructions */}
              <div className="absolute bottom-4 right-4 text-[11px] text-slate-400 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
                تدوير 360° حر • راقب وميض الطاقة الضوئي عند حدوث تصادم فعال
              </div>
            </div>

            {/* Sliders Control Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-lg">
              
              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Flame className="w-4 h-4" />
                    درجة الحرارة (Temperature)
                  </span>
                  <Badge variant="outline" className="text-amber-400 border-amber-500/40">
                    {temperature} K ({temperature - 273}°C)
                  </Badge>
                </div>
                <Slider
                  value={[temperature]}
                  onValueChange={(val) => setTemperature(val[0])}
                  min={200}
                  max={650}
                  step={10}
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>تبريد بطيء (200 K)</span>
                  <span>تسخين عالي وطاقة حركة فائقة (650 K)</span>
                </div>
              </div>

              {/* Concentration Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Gauge className="w-4 h-4" />
                    تركيز المواد المتفاعلة (Concentration)
                  </span>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-500/40">
                    {concentration}%
                  </Badge>
                </div>
                <Slider
                  value={[concentration]}
                  onValueChange={(val) => setConcentration(val[0])}
                  min={20}
                  max={100}
                  step={5}
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>محلول مخفف (20%)</span>
                  <span>كثافة جزيئية فائقة وتصادمات مضاعفة (100%)</span>
                </div>
              </div>

            </div>

          </div>

          {/* SIDEBAR: AI CO-PILOT, CHALLENGES & QUIZ (1 COL) */}
          <div className="xl:col-span-1 space-y-4">
            
            {/* Live AI Lab CoPilot */}
            <LiveAILabCoPilot
              simName="الحركية الكيميائية ونظرية التصادم 3D"
              subject="chemistry"
              liveHint={
                hasCatalyst
                  ? 'العامل الحفاز يخفض حاجز طاقة التنشيط Ea بنسبة 40%؛ تلاحظ الآن وميض النواتج بسرعة مضاعفة عند السطح المعدني.'
                  : temperature > 500
                  ? 'الحرارة العالية تزيد متوسط الطاقة الحركية (توزيع ماكسويل-بولتزمان)، مما يرفع نسبة الجزيئات القادرة على كسر الروابط.'
                  : 'التفاعل يعتمد على احتمالية التقاء الجزيئات بالسرعة والزاوية الهندسية الملائمة.'
              }
              currentParameters={{
                'درجة الحرارة': `${temperature} K`,
                'تركيز المتفاعلات': `${concentration}%`,
                'العامل الحفاز': hasCatalyst ? 'مفعل (بلاتين)' : 'معطل',
                'طاقة التنشيط Ea': `${activeEa} kJ/mol`,
                'ثابت السرعة k': rateConstantK.toFixed(2),
                'نسبة النواتج': `${yieldPercentage}%`
              }}
            />

            {/* Challenges Engine */}
            <LabChallengeEngine challenges={challenges} />

            {/* Scientific Formulas & Info Card */}
            <InfoSection
              data={[
                { label: 'طاقة التنشيط الحالية', value: `${activeEa} kJ/mol`, color: hasCatalyst ? 'text-emerald-300' : 'text-rose-300' },
                { label: 'ثابت معدل السرعة k', value: rateConstantK.toFixed(2), color: 'text-amber-300' },
                { label: 'الجزيئات المتفاعلة', value: `${productCount} / ${totalMolecules}`, color: 'text-cyan-300' },
              ]}
              formulas={[
                { name: 'معادلة أرينيوس (Arrhenius)', formula: 'k = A · e^(-Ea / RT)', description: 'العلاقة الأسية بين درجة الحرارة، طاقة التنشيط وثابت سرعة التفاعل' },
                { name: 'قانون سرعة التفاعل الكيميائي', formula: 'Rate = k [A]^m [B]^n', description: 'يعبر عن سرعة التفاعل بدلالة تراكيز المواد المتفاعلة' },
                { name: 'متوسط السرعة الجزيئية', formula: 'Vrms = √(3RT / M)', description: 'السرعة الجذرية لمتوسط مربعات سرعات الجزيئات في الغازات' }
              ]}
              facts={[
                'إنزيمات جسم الإنسان هي عوامل حفازة حيوية فائقة تسرع التفاعلات ملايين المرات تحت حرارة 37°C.',
                'السيارات الحديثة تحتوي على محول حفاز (Catalytic Converter) ينقي الغازات السامة في أجزاء من الثانية.',
                'المركب النشط المؤقت (Activated Complex) يتشكل في قمة منحنى طاقة التنشيط ويبقى لأجزاء من الفيمتو ثانية فقط!'
              ]}
            />

            {/* Interactive Quiz */}
            <QuizSection questions={quizQuestions} />

          </div>

        </div>

      </div>
    </SimulationLayout>
  );
};

export default ChemicalKineticsSimulation;
