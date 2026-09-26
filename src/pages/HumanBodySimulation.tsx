import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Wind, Brain, Utensils, Activity, Play, Pause, RotateCcw, 
  Award, CheckCircle2, HelpCircle, BookOpen, Volume2, VolumeX, Download, 
  Maximize2, Minimize2, Sparkles, AlertCircle, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { labSound } from '@/utils/labAudio';
import { CyberLabHUD, HUDMetric } from '@/components/simulations/CyberLabHUD';
import { LiveAILabCoPilot } from '@/components/simulations/LiveAILabCoPilot';
import { CinematicCameraController, CameraPreset } from '@/components/simulations/CinematicCameraController';
import { LabChallengeEngine, ChallengeDef } from '@/components/simulations/LabChallengeEngine';

/* ─────────────────────────────────────────────────────────────
   3D SCENE: CIRCULATORY SYSTEM (BEATING 3D HEART & BLOOD FLOW)
   ───────────────────────────────────────────────────────────── */
interface CirculatorySceneProps {
  heartRate: number;
  strokeVolume: number;
  isPlaying: boolean;
  cameraPreset: CameraPreset;
}

function CirculatoryScene3D({ heartRate, strokeVolume, isPlaying }: CirculatorySceneProps) {
  const heartGroupRef = useRef<THREE.Group>(null);
  const bloodParticlesRef = useRef<THREE.Points>(null);

  // Cardiac cycle pulse frequency
  const pulseFreq = (heartRate / 60) * Math.PI * 2;

  // Generate blood cells in a systemic loop
  const particleCount = 180;
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * Math.PI * 2;
      // Figure-8 loop between heart and body/lungs
      pos[i * 3] = Math.sin(t) * 2.2;
      pos[i * 3 + 1] = Math.sin(t * 2) * 1.5;
      pos[i * 3 + 2] = Math.cos(t) * 0.8;

      // Oxygenated (red) vs deoxygenated (blue)
      if (Math.sin(t) > 0) {
        col[i * 3] = 0.95; col[i * 3 + 1] = 0.15; col[i * 3 + 2] = 0.2; // Red
      } else {
        col[i * 3] = 0.2; col[i * 3 + 1] = 0.45; col[i * 3 + 2] = 0.95; // Blue
      }
    }
    return { positions: pos, colors: col };
  }, [particleCount]);

  useFrame((state) => {
    if (!isPlaying) return;
    const t = state.clock.getElapsedTime();

    // Anatomical Heart Contraction (Systole and Diastole)
    if (heartGroupRef.current) {
      const beat = Math.sin(t * pulseFreq);
      const scaleFactor = 1 + (beat > 0.4 ? beat * 0.12 : 0);
      heartGroupRef.current.scale.set(scaleFactor, scaleFactor * 1.05, scaleFactor);
    }

    // Circulation of blood particles
    if (bloodParticlesRef.current) {
      const posAttr = bloodParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const speed = (heartRate / 60) * 0.015;
      for (let i = 0; i < particleCount; i++) {
        let curT = (i / particleCount) * Math.PI * 2 + (t * speed * 4);
        posAttr.setXYZ(
          i,
          Math.sin(curT) * 2.2,
          Math.sin(curT * 2) * 1.5,
          Math.cos(curT) * 0.8
        );
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Anatomical Heart Model */}
      <group ref={heartGroupRef} position={[0, 0.2, 0]}>
        {/* Left Ventricle & Apex */}
        <mesh position={[0.2, -0.3, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.55, 1.1, 24]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Right Ventricle */}
        <mesh position={[-0.25, -0.2, 0.15]} rotation={[0, 0, 0.2]}>
          <coneGeometry args={[0.45, 0.95, 24]} />
          <meshStandardMaterial color="#991b1b" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Left Atrium */}
        <mesh position={[0.3, 0.4, -0.1]}>
          <sphereGeometry args={[0.38, 20, 20]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} />
        </mesh>

        {/* Right Atrium */}
        <mesh position={[-0.35, 0.35, 0.1]}>
          <sphereGeometry args={[0.4, 20, 20]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
        </mesh>

        {/* Ascending Aorta Arch */}
        <mesh position={[0.1, 0.8, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.16, 0.16, 0.7, 16]} />
          <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.3} />
        </mesh>

        {/* Superior Vena Cava */}
        <mesh position={[-0.35, 0.8, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.6, 16]} />
          <meshStandardMaterial color="#2563eb" metalness={0.3} roughness={0.3} />
        </mesh>

        {/* Pulmonary Artery */}
        <mesh position={[-0.05, 0.6, 0.2]} rotation={[0.4, 0, 0.3]}>
          <cylinderGeometry args={[0.13, 0.13, 0.5, 16]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.3} />
        </mesh>

        <Html position={[0, 1.25, 0]} center>
          <div className="bg-slate-900/90 text-red-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            القلب البشري ({heartRate} BPM)
          </div>
        </Html>
      </group>

      {/* Blood Cell Particles */}
      <points ref={bloodParticlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} vertexColors transparent opacity={0.85} />
      </points>

      {/* Great Vessels Outline Tube */}
      <mesh>
        <torusGeometry args={[2.0, 0.04, 12, 48]} />
        <meshBasicMaterial color="#ef4444" opacity={0.25} transparent />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   3D SCENE: RESPIRATORY SYSTEM (VOLUMETRIC BREATHING LUNGS)
   ───────────────────────────────────────────────────────────── */
interface RespiratorySceneProps {
  respRate: number;
  tidalVolume: number;
  isPlaying: boolean;
}

function RespiratoryScene3D({ respRate, tidalVolume, isPlaying }: RespiratorySceneProps) {
  const leftLungRef = useRef<THREE.Mesh>(null);
  const rightLungRef = useRef<THREE.Mesh>(null);
  const diaphragmRef = useRef<THREE.Mesh>(null);

  const breathFreq = (respRate / 60) * Math.PI * 2;

  useFrame((state) => {
    if (!isPlaying) return;
    const t = state.clock.getElapsedTime();
    const breath = (Math.sin(t * breathFreq) + 1) * 0.5; // 0 to 1
    const expand = 1 + breath * (tidalVolume / 500) * 0.18;

    if (leftLungRef.current && rightLungRef.current) {
      leftLungRef.current.scale.set(expand, expand * 1.08, expand);
      rightLungRef.current.scale.set(expand * 1.05, expand * 1.1, expand * 1.05);
    }
    if (diaphragmRef.current) {
      diaphragmRef.current.position.y = -1.5 - breath * 0.35;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Trachea (Windpipe) */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 1.4, 24]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Cartilage Rings on Trachea */}
      {[-0.4, -0.1, 0.2, 0.5].map((y, i) => (
        <mesh key={i} position={[0, 1.2 + y, 0]}>
          <torusGeometry args={[0.22, 0.03, 8, 24]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      ))}

      {/* Primary Bronchi Left & Right */}
      <mesh position={[-0.4, 0.4, 0]} rotation={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.13, 0.13, 0.8, 16]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0.4, 0.4, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.13, 0.13, 0.8, 16]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* Right Lung (3 Lobes) */}
      <mesh ref={rightLungRef} position={[-0.9, -0.3, 0]}>
        <capsuleGeometry args={[0.65, 1.3, 16, 24]} />
        <meshStandardMaterial color="#f472b6" roughness={0.4} opacity={0.9} transparent />
      </mesh>

      {/* Left Lung (2 Lobes, Cardiac Notch) */}
      <mesh ref={leftLungRef} position={[0.9, -0.3, 0]}>
        <capsuleGeometry args={[0.58, 1.25, 16, 24]} />
        <meshStandardMaterial color="#f472b6" roughness={0.4} opacity={0.9} transparent />
      </mesh>

      {/* Diaphragm Muscle */}
      <mesh ref={diaphragmRef} position={[0, -1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.12, 32]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} />
      </mesh>

      <Html position={[0, 2.1, 0]} center>
        <div className="bg-slate-900/90 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-cyan-500/40 pointer-events-none whitespace-nowrap shadow-lg">
          القصبة الهوائية والرئتان ({respRate} نفس/دقيقة)
        </div>
      </Html>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   3D SCENE: NERVOUS SYSTEM (GLOWING BRAIN & NEURAL PULSES)
   ───────────────────────────────────────────────────────────── */
interface NervousSceneProps {
  firingRate: number;
  isPlaying: boolean;
}

function NervousScene3D({ firingRate, isPlaying }: NervousSceneProps) {
  const brainRef = useRef<THREE.Group>(null);
  const pulseGroupRef = useRef<THREE.Group>(null);

  const pulseCount = 30;
  const pulsePositions = useMemo(() => {
    return Array.from({ length: pulseCount }, (_, i) => ({
      startY: 0.8,
      speed: 0.04 + (i % 5) * 0.015,
      offset: (i / pulseCount) * Math.PI * 2
    }));
  }, [pulseCount]);

  useFrame((state) => {
    if (!isPlaying) return;
    const t = state.clock.getElapsedTime();

    if (brainRef.current) {
      // Bioluminescent pulsating brain glow
      const glow = 1 + Math.sin(t * (firingRate / 10)) * 0.08;
      brainRef.current.scale.set(glow, glow, glow);
    }

    if (pulseGroupRef.current) {
      pulseGroupRef.current.children.forEach((mesh, idx) => {
        const p = pulsePositions[idx];
        const y = p.startY - ((t * p.speed * (firingRate / 20)) % 2.8);
        mesh.position.y = y;
        mesh.position.x = Math.sin(y * 4 + p.offset) * 0.3;
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Brain Hemispheres */}
      <group ref={brainRef} position={[0, 0.9, 0]}>
        {/* Left Hemisphere */}
        <mesh position={[0.42, 0, 0]}>
          <sphereGeometry args={[0.65, 24, 24]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#7e22ce"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>
        {/* Right Hemisphere */}
        <mesh position={[-0.42, 0, 0]}>
          <sphereGeometry args={[0.65, 24, 24]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#7e22ce"
            emissiveIntensity={0.6}
            roughness={0.3}
          />
        </mesh>

        {/* Cerebellum */}
        <mesh position={[0, -0.45, -0.3]}>
          <sphereGeometry args={[0.38, 20, 20]} />
          <meshStandardMaterial color="#c084fc" roughness={0.4} />
        </mesh>
      </group>

      {/* Brainstem & Spinal Cord */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 2.2, 16]} />
        <meshStandardMaterial color="#f3e8ff" emissive="#c084fc" emissiveIntensity={0.4} />
      </mesh>

      {/* Firing Action Potentials (Neural Light Impulses) */}
      <group ref={pulseGroupRef}>
        {pulsePositions.map((_, i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        ))}
      </group>

      <Html position={[0, 1.8, 0]} center>
        <div className="bg-slate-900/90 text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-500/40 pointer-events-none whitespace-nowrap shadow-lg">
          القشرة المخية والحبل الشوكي ({firingRate} Hz)
        </div>
      </Html>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   3D SCENE: DIGESTIVE SYSTEM (PERISTALSIS & GASTRIC CHAMBER)
   ───────────────────────────────────────────────────────────── */
interface DigestiveSceneProps {
  acidPh: number;
  isPlaying: boolean;
}

function DigestiveScene3D({ acidPh, isPlaying }: DigestiveSceneProps) {
  const stomachRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!isPlaying) return;
    const t = state.clock.getElapsedTime();
    if (stomachRef.current) {
      // Peristaltic churning motion
      const wave = Math.sin(t * 2.5) * 0.05;
      stomachRef.current.scale.set(1 + wave, 1 - wave, 1 + wave * 0.5);
    }
  });

  // Color changes based on acid pH (red for strong acid 1.5, amber for 3.5)
  const acidColor = acidPh < 2.0 ? '#ef4444' : acidPh < 3.0 ? '#f97316' : '#eab308';

  return (
    <group position={[0, 0, 0]}>
      {/* Esophagus */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1.6, 16]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.5} />
      </mesh>

      {/* Stomach J-Shape */}
      <mesh ref={stomachRef} position={[0.2, 0.1, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.5, 0.8, 16, 24]} />
        <meshStandardMaterial color={acidColor} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Liver (Right Upper Quadrant) */}
      <mesh position={[-0.8, 0.35, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[1.1, 0.7, 0.6]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.6} />
      </mesh>

      {/* Small Intestine (Coils) */}
      <mesh position={[0, -0.9, 0]}>
        <torusGeometry args={[0.55, 0.22, 16, 32]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.6} />
      </mesh>
      <mesh position={[0, -1.2, 0.1]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.45, 0.2, 16, 32]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.6} />
      </mesh>

      <Html position={[0, 1.9, 0]} center>
        <div className="bg-slate-900/90 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/40 pointer-events-none whitespace-nowrap shadow-lg">
          المعدة والجهاز الهضمي (pH = {acidPh.toFixed(1)})
        </div>
      </Html>
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT: HUMAN BODY 3D SIMULATION
   ───────────────────────────────────────────────────────────── */
const HumanBodySimulation = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const [systemType, setSystemType] = useState<'circulatory' | 'respiratory' | 'nervous' | 'digestive'>('circulatory');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Physiologic Controls
  const [heartRate, setHeartRate] = useState(72); // BPM
  const [strokeVolume, setStrokeVolume] = useState(70); // mL
  const [respRate, setRespRate] = useState(16); // Breaths/min
  const [tidalVolume, setTidalVolume] = useState(500); // mL
  const [firingRate, setFiringRate] = useState(25); // Hz
  const [acidPh, setAcidPh] = useState(1.8);

  // Sound toggle
  const [isMuted, setIsMuted] = useState(false);
  const toggleAudio = () => {
    const muted = labSound.toggleMute();
    setIsMuted(muted);
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Calculated Physiologic Parameters
  const cardiacOutput = ((strokeVolume * heartRate) / 1000).toFixed(2); // L/min (Normal ~ 4.5-5.5)
  const systolicBP = Math.round(90 + (strokeVolume - 50) * 0.7 + (heartRate - 60) * 0.3);
  const diastolicBP = Math.round(60 + (heartRate - 60) * 0.25);
  const minuteVentilation = ((respRate * tidalVolume) / 1000).toFixed(1); // L/min

  // HUD Metrics
  const hudMetrics: HUDMetric[] = useMemo(() => {
    switch (systemType) {
      case 'circulatory':
        return [
          { id: 'hr', label: 'معدل النبض (HR)', value: heartRate, unit: 'BPM', color: heartRate > 100 ? 'text-rose-400' : 'text-emerald-400', progressPercent: (heartRate / 180) * 100 },
          { id: 'co', label: 'النتاج القلبي (CO)', value: cardiacOutput, unit: 'L/min', color: 'text-cyan-300', progressPercent: (parseFloat(cardiacOutput) / 10) * 100 },
          { id: 'bp', label: 'ضغط الدم (BP)', value: `${systolicBP}/${diastolicBP}`, unit: 'mmHg', color: 'text-amber-400' },
          { id: 'sv', label: 'حجم الضربة (SV)', value: strokeVolume, unit: 'mL', color: 'text-purple-300', progressPercent: (strokeVolume / 120) * 100 },
        ];
      case 'respiratory':
        return [
          { id: 'rr', label: 'معدل التنفس (RR)', value: respRate, unit: '/min', color: 'text-cyan-300', progressPercent: (respRate / 40) * 100 },
          { id: 'tv', label: 'حجم المد (TV)', value: tidalVolume, unit: 'mL', color: 'text-emerald-300', progressPercent: (tidalVolume / 800) * 100 },
          { id: 'mv', label: 'التهوية الدقيقة', value: minuteVentilation, unit: 'L/min', color: 'text-purple-300' },
          { id: 'o2', label: 'إشباع الأكسجين SpO₂', value: 98, unit: '%', color: 'text-teal-300', progressPercent: 98 },
        ];
      case 'nervous':
        return [
          { id: 'freq', label: 'تردد السيالات', value: firingRate, unit: 'Hz', color: 'text-purple-300', progressPercent: (firingRate / 60) * 100 },
          { id: 'velocity', label: 'سرعة التوصيل', value: 105, unit: 'm/s', color: 'text-cyan-300' },
          { id: 'potential', label: 'جهد الفعل', value: '+30', unit: 'mV', color: 'text-amber-300' },
          { id: 'state', label: 'حالة الاستجابة', value: firingRate > 35 ? 'استثارة قصوى' : 'نشاط متوازن', color: 'text-emerald-300' },
        ];
      case 'digestive':
        return [
          { id: 'ph', label: 'حموضة المعدة pH', value: acidPh.toFixed(1), color: acidPh < 2.0 ? 'text-rose-400' : 'text-amber-400', progressPercent: (acidPh / 7) * 100 },
          { id: 'peristalsis', label: 'حركة التمعج', value: 'نشطة', color: 'text-emerald-300' },
          { id: 'enzymes', label: 'إفراز الببسين', value: acidPh < 2.5 ? '100%' : '45%', color: 'text-cyan-300' },
          { id: 'absorption', label: 'كفاءة الامتصاص', value: '92%', color: 'text-teal-300' },
        ];
    }
  }, [systemType, heartRate, cardiacOutput, systolicBP, diastolicBP, strokeVolume, respRate, tidalVolume, minuteVentilation, firingRate, acidPh]);

  // Real-time AI Observer Hint
  const liveHint = useMemo(() => {
    if (systemType === 'circulatory') {
      if (heartRate > 110) return "ملاحظة فسيولوجية: تسارع في ضربات القلب (Tachycardia)! يزداد استهلاك الأكسجين العضلي مع انخفاض زمن الامتلاء البطيني.";
      if (heartRate < 55) return "ملاحظة فسيولوجية: تباطؤ النبض (Bradycardia)! لاحظ انخفاض النتاج القلبي إلا إذا زاد حجم الضربة SV تعويضياً.";
      return "النظام القلبي الوعائي في حالة استقرار ديناميكي ممتازة.";
    }
    if (systemType === 'respiratory') {
      if (respRate > 24) return "فرط تهوية تنفسي (Hyperventilation)! يزداد طرد CO₂ مما قد يرفع قلوية الدم التنفسية.";
      return "التهوية السنخية متطابقة مع متطلبات التروية الدموية الطبيعية.";
    }
    if (systemType === 'nervous') {
      return "السيالات العصبية تنتقل عبر الغمد المياليني بنمط النقل القفزي السريع (Saltatory Conduction).";
    }
    return "الوسط الحمضي المنخفض (pH 1.5-2.0) ضروري لتنشيط إنزيم الببسينوجين إلى ببسين وهضم البروتينات.";
  }, [systemType, heartRate, respRate]);

  // Gamified Lab Challenges
  const challenges: ChallengeDef[] = useMemo(() => [
    {
      id: 'target-co',
      title: 'تحدي النتاج القلبي الرياضي',
      description: 'اضبط معدل ضربات القلب وحجم الضربة للوصول إلى نتاج قلبي مثالي قدره 5.0 L/min (±0.3).',
      targetDescription: 'النتاج القلبي CO بين 4.7 و 5.3 لتر/دقيقة',
      durationSeconds: 45,
      requiredHoldSeconds: 3,
      checkSuccess: () => {
        const co = parseFloat(cardiacOutput);
        return co >= 4.7 && co <= 5.3;
      }
    },
    {
      id: 'respiratory-calm',
      title: 'تحدي ضبط التنفس التأملي',
      description: 'اخفض معدل التنفس إلى مجال الاسترخاء الهادئ (10 - 14 نفس/دقيقة) مع حجم مد ملائم.',
      targetDescription: 'معدل التنفس RR بين 10 و 14 نفس/دقيقة',
      durationSeconds: 30,
      requiredHoldSeconds: 3,
      checkSuccess: () => respRate >= 10 && respRate <= 14
    }
  ], [cardiacOutput, respRate]);

  // Camera Orbit Settings based on preset
  const orbitProps = useMemo(() => {
    switch (cameraPreset) {
      case 'microscopic':
        return { minDistance: 1.5, maxDistance: 3.5, autoRotate: false };
      case 'orbit':
        return { minDistance: 2.5, maxDistance: 7.0, autoRotate: true, autoRotateSpeed: 1.5 };
      default:
        return { minDistance: 2.0, maxDistance: 8.0, autoRotate: false };
    }
  }, [cameraPreset]);

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col text-right bg-gradient-to-b from-[#050714] via-[#090e28] to-[#040612] text-white relative selection:bg-cyan-500 selection:text-slate-950" dir="rtl">
      <StarField starCount={120} />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 relative z-10">
        
        {/* Navigation Breadcrumb & Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/experiments-section')}
              className="border-white/15 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 ml-1.5" />
              <span>العودة للمختبرات</span>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-cyan-300">
                  مختبر أجهزة جسم الإنسان ثلاثي الأبعاد
                </h1>
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] font-black">
                  3D ANATOMY LAB
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                استكشاف تشريحي وفسيولوجي تفاعلي مدعوم بالمحاكاة الحركية والذكاء الاصطناعي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={toggleAudio}
              className={`border-white/15 rounded-xl text-xs ${isMuted ? 'text-slate-500' : 'text-cyan-400'}`}
              title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`rounded-xl text-xs font-bold ${isPlaying ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'}`}
            >
              {isPlaying ? <Pause className="w-4 h-4 ml-1" /> : <Play className="w-4 h-4 ml-1" />}
              <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل النبض'}</span>
            </Button>
          </div>
        </div>

        {/* System Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'circulatory', label: 'الجهاز الدوري (القلب والدم)', icon: Heart, color: 'border-red-500/40 text-red-400' },
            { id: 'respiratory', label: 'الجهاز التنفسي (الرئتان)', icon: Wind, color: 'border-cyan-500/40 text-cyan-400' },
            { id: 'nervous', label: 'الجهاز العصبي (الدماغ)', icon: Brain, color: 'border-purple-500/40 text-purple-400' },
            { id: 'digestive', label: 'الجهاز الهضمي (المعدة)', icon: Utensils, color: 'border-amber-500/40 text-amber-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = systemType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSystemType(tab.id as any)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                  active 
                    ? `bg-white/[0.08] ${tab.color} shadow-lg shadow-black/40 font-bold`
                    : 'bg-slate-950/40 border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className={`p-2 rounded-xl bg-white/5 ${tab.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN VIEWPORT & CONTROLS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 3D Interactive Canvas Viewport (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative h-[480px] sm:h-[540px] rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-slate-950 via-[#070b1e] to-slate-950 shadow-2xl">
              
              {/* Three.js Canvas */}
              <Canvas
                camera={{ position: [0, 0, 4.5], fov: 45 }}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              >
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 8, 5]} intensity={1.2} />
                <pointLight position={[-4, -3, -2]} intensity={0.5} color="#38bdf8" />
                <pointLight position={[3, 3, 2]} intensity={0.8} color="#ec4899" />

                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  minDistance={orbitProps.minDistance}
                  maxDistance={orbitProps.maxDistance}
                  autoRotate={orbitProps.autoRotate}
                  autoRotateSpeed={orbitProps.autoRotateSpeed}
                />

                {systemType === 'circulatory' && (
                  <CirculatoryScene3D
                    heartRate={heartRate}
                    strokeVolume={strokeVolume}
                    isPlaying={isPlaying}
                    cameraPreset={cameraPreset}
                  />
                )}
                {systemType === 'respiratory' && (
                  <RespiratoryScene3D
                    respRate={respRate}
                    tidalVolume={tidalVolume}
                    isPlaying={isPlaying}
                  />
                )}
                {systemType === 'nervous' && (
                  <NervousScene3D
                    firingRate={firingRate}
                    isPlaying={isPlaying}
                  />
                )}
                {systemType === 'digestive' && (
                  <DigestiveScene3D
                    acidPh={acidPh}
                    isPlaying={isPlaying}
                  />
                )}
              </Canvas>

              {/* Floating Camera Presets & Fullscreen Overlay */}
              <div className="absolute top-4 right-4 left-4 flex justify-between pointer-events-none">
                <div className="pointer-events-auto">
                  <CinematicCameraController
                    currentPreset={cameraPreset}
                    onSelectPreset={setCameraPreset}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={toggleFullscreen}
                  />
                </div>
              </div>

              {/* Touch guide indicator */}
              <div className="absolute bottom-3 left-4 text-[10px] text-slate-400 bg-slate-950/70 px-2.5 py-1 rounded-full border border-white/10 pointer-events-none backdrop-blur-md">
                اسحب للتدوير 360° • عجلة الفأرة للتكبير والاقتراب
              </div>
            </div>

            {/* Cyber-Lab Live Telemetry HUD */}
            <CyberLabHUD
              title={`مؤشرات ${systemType === 'circulatory' ? 'الجهاز الدوري' : systemType === 'respiratory' ? 'الجهاز التنفسي' : systemType === 'nervous' ? 'الجهاز العصبي' : 'الجهاز الهضمي'}`}
              statusBadge="VITAL TELEMETRY"
              metrics={hudMetrics}
              showWaveform={true}
              waveformColor={systemType === 'circulatory' ? '#ef4444' : systemType === 'respiratory' ? '#06b6d4' : systemType === 'nervous' ? '#a855f7' : '#f59e0b'}
              waveformSpeed={heartRate / 60}
            />
          </div>

          {/* Interactive Parameters, AI Co-Pilot & Challenge Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Live AI Lab Co-Pilot */}
            <LiveAILabCoPilot
              simName="أجهزة جسم الإنسان"
              subject="biology"
              liveHint={liveHint}
              currentParameters={{
                'النظام النشط': systemType,
                'نبضات القلب': `${heartRate} BPM`,
                'النتاج القلبي': `${cardiacOutput} L/min`,
                'معدل التنفس': `${respRate} /min`,
                'حموضة المعدة': `${acidPh.toFixed(1)} pH`,
              }}
            />

            {/* Parameter Adjustment Card */}
            <Card className="bg-slate-950/80 border-white/10 text-white backdrop-blur-xl rounded-2xl shadow-xl">
              <CardHeader className="pb-3 border-b border-white/[0.08]">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>المعاملات الفسيولوجية التفاعلية</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-5">
                {systemType === 'circulatory' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">معدل نبضات القلب (HR):</span>
                        <span className="font-mono font-bold text-red-400">{heartRate} BPM</span>
                      </div>
                      <Slider
                        value={[heartRate]}
                        onValueChange={(val) => setHeartRate(val[0])}
                        min={45}
                        max={165}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">حجم الضربة (Stroke Volume):</span>
                        <span className="font-mono font-bold text-purple-300">{strokeVolume} mL</span>
                      </div>
                      <Slider
                        value={[strokeVolume]}
                        onValueChange={(val) => setStrokeVolume(val[0])}
                        min={45}
                        max={110}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {systemType === 'respiratory' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">معدل التنفس (Respiratory Rate):</span>
                        <span className="font-mono font-bold text-cyan-300">{respRate} نفس/دقيقة</span>
                      </div>
                      <Slider
                        value={[respRate]}
                        onValueChange={(val) => setRespRate(val[0])}
                        min={8}
                        max={35}
                        step={1}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-semibold">حجم المد التنفسي (Tidal Volume):</span>
                        <span className="font-mono font-bold text-emerald-300">{tidalVolume} mL</span>
                      </div>
                      <Slider
                        value={[tidalVolume]}
                        onValueChange={(val) => setTidalVolume(val[0])}
                        min={300}
                        max={800}
                        step={25}
                        className="cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {systemType === 'nervous' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">تردد السيالات العصبية:</span>
                      <span className="font-mono font-bold text-purple-300">{firingRate} Hz</span>
                    </div>
                    <Slider
                      value={[firingRate]}
                      onValueChange={(val) => setFiringRate(val[0])}
                      min={5}
                      max={55}
                      step={1}
                      className="cursor-pointer"
                    />
                  </div>
                )}

                {systemType === 'digestive' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">درجة حموضة المعدة (pH):</span>
                      <span className="font-mono font-bold text-amber-300">{acidPh.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[acidPh]}
                      onValueChange={(val) => setAcidPh(val[0])}
                      min={1.2}
                      max={5.0}
                      step={0.1}
                      className="cursor-pointer"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
                  <span>الحالة الفسيولوجية:</span>
                  <span className="text-emerald-400 font-bold">تفاعل ديناميكي نشط</span>
                </div>
              </CardContent>
            </Card>

            {/* Timed Challenge Mode */}
            <LabChallengeEngine challenges={challenges} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HumanBodySimulation;
