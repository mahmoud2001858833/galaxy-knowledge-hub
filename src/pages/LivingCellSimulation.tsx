import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Cylinder, Trail, Ring } from '@react-three/drei';
import * as THREE from 'three';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Dna, 
  Zap, 
  Eye, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Microscope,
  Info,
  Maximize2
} from 'lucide-react';
import { CyberLabHUD, HUDMetric } from '@/components/simulations/CyberLabHUD';
import { LiveAILabCoPilot } from '@/components/simulations/LiveAILabCoPilot';
import { CinematicCameraController, CameraPreset } from '@/components/simulations/CinematicCameraController';
import { LabChallengeEngine } from '@/components/simulations/LabChallengeEngine';
import { labSound } from '@/utils/labAudio';

// ==========================================
// 3D ORGANELLE & CELL GEOMETRIES
// ==========================================

interface OrganelleProps {
  name: string;
  arabicName: string;
  desc: string;
  selected: boolean;
  onSelect: (name: string) => void;
  stainColor?: string;
}

// 1. The Nucleus (النواة + النوية)
const Nucleus3D: React.FC<OrganelleProps & { position: [number, number, number]; scale?: number }> = ({
  name,
  arabicName,
  selected,
  onSelect,
  position,
  scale = 1
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const nucleolusRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
    if (nucleolusRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      nucleolusRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group 
      ref={meshRef} 
      position={position} 
      scale={scale}
      onClick={(e) => { e.stopPropagation(); onSelect(name); }}
    >
      {/* Outer Nuclear Envelope with subtle wireframe pores */}
      <Sphere args={[1.5, 32, 32]}>
        <meshStandardMaterial
          color={selected ? "#a855f7" : "#7c3aed"}
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={0.75}
          emissive={selected ? "#c084fc" : "#4c1d95"}
          emissiveIntensity={selected ? 0.8 : 0.25}
        />
      </Sphere>

      {/* Inner Nucleolus (النوية) */}
      <Sphere ref={nucleolusRef} args={[0.6, 24, 24]}>
        <meshStandardMaterial
          color="#f43f5e"
          emissive="#fb7185"
          emissiveIntensity={0.9}
          roughness={0.2}
        />
      </Sphere>

      {/* Chromatin / DNA threads looping inside */}
      <Ring args={[0.8, 0.95, 32]} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.6} />
      </Ring>
      <Ring args={[1.0, 1.15, 32]} rotation={[-Math.PI / 3, 0, Math.PI / 4]}>
        <meshBasicMaterial color="#e879f9" side={THREE.DoubleSide} transparent opacity={0.5} />
      </Ring>
    </group>
  );
};

// 2. Mitochondrion (الميتوكوندريا - محطة الطاقة)
const Mitochondrion3D: React.FC<OrganelleProps & { position: [number, number, number]; rotation: [number, number, number]; atpRate: number }> = ({
  name,
  selected,
  onSelect,
  position,
  rotation,
  atpRate
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.003;
    }
    if (glowRef.current) {
      glowRef.current.intensity = (atpRate / 100) * 1.5 + Math.sin(state.clock.elapsedTime * 8) * 0.3;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onSelect(name); }}
    >
      {/* Outer capsule */}
      <Cylinder args={[0.35, 0.35, 1.2, 20]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial
          color={selected ? "#fb923c" : "#ea580c"}
          emissive={selected ? "#f97316" : "#c2410c"}
          emissiveIntensity={selected ? 0.9 : 0.35 * (atpRate / 100)}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.85}
        />
      </Cylinder>
      {/* Capsule Caps */}
      <Sphere args={[0.35, 16, 16]} position={[-0.6, 0, 0]}>
        <meshStandardMaterial color="#ea580c" emissive="#c2410c" emissiveIntensity={0.3} />
      </Sphere>
      <Sphere args={[0.35, 16, 16]} position={[0.6, 0, 0]}>
        <meshStandardMaterial color="#ea580c" emissive="#c2410c" emissiveIntensity={0.3} />
      </Sphere>

      {/* Internal Cristae (الأعراف المطوية) */}
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
        <Ring key={i} args={[0.1, 0.28, 16]} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} transparent opacity={0.7} />
        </Ring>
      ))}

      {/* ATP Synthesis Glow */}
      <pointLight ref={glowRef} color="#f59e0b" distance={3} intensity={1} />
    </group>
  );
};

// 3. Golgi Apparatus (جهاز غولجي)
const Golgi3D: React.FC<OrganelleProps & { position: [number, number, number]; rotation: [number, number, number] }> = ({
  name,
  selected,
  onSelect,
  position,
  rotation
}) => {
  return (
    <group 
      position={position} 
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onSelect(name); }}
    >
      {/* 4 Curved Cisternae Ribbons */}
      {[-0.35, -0.12, 0.12, 0.35].map((z, idx) => (
        <group key={idx} position={[0, 0, z]}>
          <Cylinder 
            args={[1.1 - Math.abs(z) * 0.5, 1.1 - Math.abs(z) * 0.5, 0.1, 24, 1, false, 0, Math.PI * 0.7]} 
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color={selected ? "#fbbf24" : "#d97706"}
              emissive={selected ? "#f59e0b" : "#b45309"}
              emissiveIntensity={selected ? 0.8 : 0.3}
              roughness={0.4}
              metalness={0.1}
            />
          </Cylinder>
          {/* Vesicles budding off */}
          <Sphere args={[0.08, 12, 12]} position={[0.7 + idx * 0.1, 0.2 - idx * 0.1, 0]}>
            <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={0.6} />
          </Sphere>
        </group>
      ))}
    </group>
  );
};

// 4. Endoplasmic Reticulum (الشبكة الإندوبلازمية)
const EndoplasmicReticulum3D: React.FC<OrganelleProps & { position: [number, number, number]; rough?: boolean }> = ({
  name,
  selected,
  onSelect,
  position,
  rough = true
}) => {
  return (
    <group 
      position={position} 
      onClick={(e) => { e.stopPropagation(); onSelect(name); }}
    >
      {/* Wavy sheets */}
      {[0, 0.3, 0.6].map((offset, i) => (
        <group key={i} position={[offset * 0.8, offset * 0.4, 0]} rotation={[0, i * 0.4, i * 0.2]}>
          <Ring args={[1.6 + offset, 2.0 + offset, 24, 1, 0, Math.PI * 0.65]}>
            <meshStandardMaterial
              color={selected ? "#34d399" : rough ? "#059669" : "#10b981"}
              emissive={rough ? "#047857" : "#059669"}
              emissiveIntensity={selected ? 0.7 : 0.25}
              roughness={0.4}
              side={THREE.DoubleSide}
            />
          </Ring>
        </group>
      ))}
    </group>
  );
};

// 5. Chloroplast (البلاستيدة الخضراء - خاصة بالنبات)
const Chloroplast3D: React.FC<OrganelleProps & { position: [number, number, number]; rotation: [number, number, number] }> = ({
  name,
  selected,
  onSelect,
  position,
  rotation
}) => {
  return (
    <group 
      position={position} 
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onSelect(name); }}
    >
      {/* Outer Envelope */}
      <Sphere args={[0.5, 24, 16]} scale={[1.4, 0.8, 0.7]}>
        <meshStandardMaterial
          color={selected ? "#4ade80" : "#16a34a"}
          emissive={selected ? "#22c55e" : "#15803d"}
          emissiveIntensity={selected ? 0.9 : 0.35}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.88}
        />
      </Sphere>

      {/* Thylakoid Stacks (Grana - أقراص الثايلاكويد) */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {[-0.1, 0, 0.1].map((y, j) => (
            <Cylinder key={j} args={[0.16, 0.16, 0.04, 12]} position={[0, y, 0]}>
              <meshStandardMaterial color="#86efac" emissive="#22c55e" emissiveIntensity={0.7} />
            </Cylinder>
          ))}
        </group>
      ))}
      <pointLight color="#22c55e" distance={2} intensity={0.8} />
    </group>
  );
};

// 6. Central Vacuole (الفجوة المركزية الكبيرة - نباتية)
const CentralVacuole3D: React.FC<OrganelleProps & { turgorFactor: number }> = ({
  name,
  selected,
  onSelect,
  turgorFactor
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
      const s = turgorFactor + pulse;
      meshRef.current.scale.set(s * 1.8, s * 1.8, s * 1.4);
    }
  });

  return (
    <Sphere 
      ref={meshRef} 
      args={[1.1, 32, 32]} 
      position={[0.3, -0.2, 0.2]}
      onClick={(e) => { e.stopPropagation(); onSelect(name); }}
    >
      <meshStandardMaterial
        color={selected ? "#38bdf8" : "#0284c7"}
        emissive={selected ? "#0ea5e9" : "#0369a1"}
        emissiveIntensity={selected ? 0.7 : 0.25}
        roughness={0.1}
        metalness={0.1}
        transparent
        opacity={0.45}
      />
    </Sphere>
  );
};

// 7. Bacterial Nucleoid & Flagellum (المادة الوراثية الحرة والسوط البكتيري)
const BacterialStructures3D: React.FC<{ onSelect: (name: string) => void; selectedOrganelle: string | null }> = ({
  onSelect,
  selectedOrganelle
}) => {
  const flagellumRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (flagellumRef.current) {
      flagellumRef.current.rotation.x += delta * 12; // Rapid rotary motor movement
    }
  });

  return (
    <group>
      {/* Coiled Nucleoid (DNA loop without membrane) */}
      <group onClick={(e) => { e.stopPropagation(); onSelect('المادة الوراثية الحرة (Nucleoid)'); }}>
        {[0, 0.4, -0.4].map((z, i) => (
          <Ring key={i} args={[0.4 + i * 0.1, 0.6 + i * 0.15, 20]} position={[0, 0, z]} rotation={[i, i * 0.5, 0]}>
            <meshBasicMaterial 
              color={selectedOrganelle?.includes('المادة الوراثية') ? "#ec4899" : "#a855f7"} 
              side={THREE.DoubleSide} 
              transparent 
              opacity={0.7} 
            />
          </Ring>
        ))}
      </group>

      {/* Rotating Bacterial Flagellum (السوط) */}
      <group ref={flagellumRef} position={[-2.8, 0, 0]} onClick={(e) => { e.stopPropagation(); onSelect('السوط البكتيري (Flagellum)'); }}>
        <Cylinder args={[0.04, 0.04, 2.5, 12]} position={[-1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#cbd5e1" emissive="#94a3b8" emissiveIntensity={0.5} roughness={0.3} />
        </Cylinder>
        <Sphere args={[0.18, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
        </Sphere>
      </group>
    </group>
  );
};

// ==========================================
// FULL 3D CELL SCENE
// ==========================================

interface CellSceneProps {
  cellType: 'animal' | 'plant' | 'bacteria';
  atpRate: number;
  osmoticPressure: number; // 0: Hypotonic, 50: Isotonic, 100: Hypertonic
  selectedOrganelle: string | null;
  onSelectOrganelle: (name: string) => void;
  mitosisStage: string;
}

const CellScene3D: React.FC<CellSceneProps> = ({
  cellType,
  atpRate,
  osmoticPressure,
  selectedOrganelle,
  onSelectOrganelle,
  mitosisStage
}) => {
  const membraneRef = useRef<THREE.Mesh>(null);

  // Osmotic swelling / shrinkage factor
  const sizeFactor = useMemo(() => {
    // 0: Hypotonic (swollen), 50: Normal, 100: Shrunk (crenated / plasmolysed)
    if (osmoticPressure < 50) {
      return 1 + ((50 - osmoticPressure) / 50) * 0.25;
    } else {
      return 1 - ((osmoticPressure - 50) / 50) * 0.22;
    }
  }, [osmoticPressure]);

  useFrame((state) => {
    if (membraneRef.current) {
      const wobble = Math.sin(state.clock.elapsedTime * 1.5) * 0.015;
      const s = sizeFactor + wobble;
      if (cellType === 'animal') {
        membraneRef.current.scale.set(s * 3.8, s * 3.2, s * 3.2);
      } else if (cellType === 'plant') {
        membraneRef.current.scale.set(s * 3.4, s * 2.8, s * 2.8);
      } else {
        membraneRef.current.scale.set(s * 4.4, s * 2.0, s * 2.0);
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#38bdf8" />

      {/* Floating Cytoplasmic Ribosome Particles */}
      {useMemo(() => {
        const count = cellType === 'bacteria' ? 35 : 55;
        const pts: [number, number, number][] = [];
        for (let i = 0; i < count; i++) {
          pts.push([
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 3.5,
            (Math.random() - 0.5) * 3.5
          ]);
        }
        return pts.map((pt, i) => (
          <Float key={i} speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <Sphere args={[0.04, 8, 8]} position={pt}>
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
            </Sphere>
          </Float>
        ));
      }, [cellType])}

      {/* CELL OUTER MEMBRANE / WALL */}
      {cellType === 'animal' && (
        <Sphere 
          ref={membraneRef} 
          args={[1, 32, 32]} 
          onClick={() => onSelectOrganelle('الغشاء البلازمي (Plasma Membrane)')}
        >
          <meshStandardMaterial
            color={selectedOrganelle?.includes('الغشاء') ? "#ec4899" : "#38bdf8"}
            emissive={selectedOrganelle?.includes('الغشاء') ? "#f43f5e" : "#0284c7"}
            emissiveIntensity={0.2}
            roughness={0.15}
            metalness={0.2}
            transparent
            opacity={0.32}
            side={THREE.DoubleSide}
          />
        </Sphere>
      )}

      {cellType === 'plant' && (
        <group>
          {/* Rigid Hexagonal / Chamfered Box for Cell Wall */}
          <mesh onClick={() => onSelectOrganelle('جدار الخلية السليولوزي (Cell Wall)')}>
            <boxGeometry args={[7.5, 6.0, 5.5]} />
            <meshStandardMaterial
              color={selectedOrganelle?.includes('جدار') ? "#22c55e" : "#15803d"}
              emissive="#166534"
              emissiveIntensity={0.25}
              wireframe
              roughness={0.8}
            />
          </mesh>
          {/* Inner plasma membrane */}
          <Sphere 
            ref={membraneRef} 
            args={[1, 32, 32]} 
            onClick={() => onSelectOrganelle('الغشاء البلازمي (Plasma Membrane)')}
          >
            <meshStandardMaterial
              color="#4ade80"
              emissive="#15803d"
              emissiveIntensity={0.2}
              transparent
              opacity={0.38}
              side={THREE.DoubleSide}
            />
          </Sphere>
        </group>
      )}

      {cellType === 'bacteria' && (
        <group>
          {/* Capsule / Cell Wall (Cylinder + Hemisphere Caps) */}
          <Cylinder 
            args={[1.1, 1.1, 3.2, 32]} 
            rotation={[0, 0, Math.PI / 2]} 
            onClick={() => onSelectOrganelle('المحفظة والجدار الخلوي (Capsule & Wall)')}
          >
            <meshStandardMaterial
              color="#0d9488"
              emissive="#115e59"
              emissiveIntensity={0.35}
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </Cylinder>
          <Sphere args={[1.1, 32, 16]} position={[-1.6, 0, 0]}>
            <meshStandardMaterial color="#0d9488" transparent opacity={0.35} side={THREE.DoubleSide} />
          </Sphere>
          <Sphere args={[1.1, 32, 16]} position={[1.6, 0, 0]}>
            <meshStandardMaterial color="#0d9488" transparent opacity={0.35} side={THREE.DoubleSide} />
          </Sphere>

          <BacterialStructures3D onSelect={onSelectOrganelle} selectedOrganelle={selectedOrganelle} />
        </group>
      )}

      {/* INTERNAL ORGANELLES FOR ANIMAL / PLANT */}
      {cellType !== 'bacteria' && (
        <>
          {/* Nucleus */}
          <Nucleus3D
            name="النواة (Nucleus & Nucleolus)"
            arabicName="النواة والنوية"
            desc="مركز القيادة والتحكم الخلوي، يحتوي على المادة الوراثية DNA ويوجه تخليق البروتينات عبر النسخ."
            selected={selectedOrganelle?.includes('النواة') ?? false}
            onSelect={onSelectOrganelle}
            position={cellType === 'plant' ? [-1.6, 0.4, 0] : [0, 0, 0]}
            scale={cellType === 'plant' ? 0.85 : 1.0}
          />

          {/* Mitochondria */}
          <Mitochondrion3D
            name="الميتوكوندريا (Mitochondria)"
            arabicName="الميتوكوندريا"
            desc="محطات توليد الطاقة الحيوية للخلية؛ تقوم بأكسدة الجلوكوز عبر دورة كريبس وسلسلة نقل الإلكترون لإنتاج ATP."
            selected={selectedOrganelle?.includes('الميتوكوندريا') ?? false}
            onSelect={onSelectOrganelle}
            position={[-1.8, 1.2, 0.5]}
            rotation={[0.3, 0.4, 0.2]}
            atpRate={atpRate}
          />
          <Mitochondrion3D
            name="الميتوكوندريا (Mitochondria)"
            arabicName="الميتوكوندريا"
            desc="محطات توليد الطاقة الحيوية للخلية؛ تقوم بأكسدة الجلوكوز عبر دورة كريبس وسلسلة نقل الإلكترون لإنتاج ATP."
            selected={selectedOrganelle?.includes('الميتوكوندريا') ?? false}
            onSelect={onSelectOrganelle}
            position={[1.5, -1.1, -0.6]}
            rotation={[-0.2, 0.8, -0.4]}
            atpRate={atpRate}
          />
          {cellType === 'animal' && (
            <Mitochondrion3D
              name="الميتوكوندريا (Mitochondria)"
              arabicName="الميتوكوندريا"
              desc="محطات توليد الطاقة الحيوية للخلية؛ تقوم بأكسدة الجلوكوز عبر دورة كريبس وسلسلة نقل الإلكترون لإنتاج ATP."
              selected={selectedOrganelle?.includes('الميتوكوندريا') ?? false}
              onSelect={onSelectOrganelle}
              position={[1.2, 1.4, 0.8]}
              rotation={[0.6, -0.3, 0.5]}
              atpRate={atpRate}
            />
          )}

          {/* Golgi Apparatus */}
          <Golgi3D
            name="جهاز غولجي (Golgi Apparatus)"
            arabicName="جهاز غولجي"
            desc="مركز التعديل والتغليف والشحن الجزيئي؛ يقوم بفرز وتعبئة البروتينات في حويصلات إفرازية."
            selected={selectedOrganelle?.includes('غولجي') ?? false}
            onSelect={onSelectOrganelle}
            position={[-1.2, -1.3, 0.7]}
            rotation={[0.2, -0.4, 0.1]}
          />

          {/* Endoplasmic Reticulum */}
          <EndoplasmicReticulum3D
            name="الشبكة الإندوبلازمية (Endoplasmic Reticulum)"
            arabicName="الشبكة الإندوبلازمية"
            desc="شبكة أنبوبية غشائية واسعة؛ الشبكة الخشنة تصنع البروتينات بواسطة الرايبوسومات، والملساء تصنع الدهون والستيرويدات وتزيل السمية."
            selected={selectedOrganelle?.includes('الشبكة') ?? false}
            onSelect={onSelectOrganelle}
            position={cellType === 'plant' ? [-1.6, 0.4, 0] : [0, 0, 0]}
            rough={true}
          />

          {/* Lysosomes (Animal Cell) */}
          {cellType === 'animal' && (
            <group onClick={(e) => { e.stopPropagation(); onSelectOrganelle('الجسيمات الحالة (Lysosomes)'); }}>
              {[
                [-1.5, -0.4, -1.2],
                [1.6, 0.6, -1.0],
                [-0.8, 1.6, -0.8]
              ].map((pos, idx) => (
                <Sphere key={idx} args={[0.22, 16, 16]} position={pos as [number, number, number]}>
                  <meshStandardMaterial
                    color={selectedOrganelle?.includes('الحالة') ? "#f43f5e" : "#e11d48"}
                    emissive="#be123c"
                    emissiveIntensity={selectedOrganelle?.includes('الحالة') ? 0.9 : 0.4}
                    roughness={0.2}
                  />
                </Sphere>
              ))}
            </group>
          )}

          {/* Plant Specific: Chloroplasts and Central Vacuole */}
          {cellType === 'plant' && (
            <>
              <CentralVacuole3D
                name="الفجوة المركزية الكبيرة (Central Vacuole)"
                arabicName="الفجوة المركزية"
                desc="مستودع مائي عضوي يشغل أكثر من 60% من حجم الخلية النباتية؛ يحافظ على ضغط الامتلاء (Turgor Pressure) لدعم النبتة وتخزين الأيونات."
                selected={selectedOrganelle?.includes('الفجوة') ?? false}
                onSelect={onSelectOrganelle}
                turgorFactor={sizeFactor}
              />

              {/* Multiple Chloroplasts */}
              <Chloroplast3D
                name="البلاستيدات الخضراء (Chloroplasts)"
                arabicName="البلاستيدات الخضراء"
                desc="مصانع البناء الضوئي؛ تحتوي على صبغة الكلوروفيل وأقراص الثايلاكويد لتحويل الطاقة الشمسية وCO2 إلى جلوكوز وأكسجين."
                selected={selectedOrganelle?.includes('البلاستيدات') ?? false}
                onSelect={onSelectOrganelle}
                position={[2.0, 1.2, 0.4]}
                rotation={[0.3, 0.2, -0.2]}
              />
              <Chloroplast3D
                name="البلاستيدات الخضراء (Chloroplasts)"
                arabicName="البلاستيدات الخضراء"
                desc="مصانع البناء الضوئي؛ تحتوي على صبغة الكلوروفيل وأقراص الثايلاكويد لتحويل الطاقة الشمسية وCO2 إلى جلوكوز وأكسجين."
                selected={selectedOrganelle?.includes('البلاستيدات') ?? false}
                onSelect={onSelectOrganelle}
                position={[2.2, -1.1, 0.2]}
                rotation={[-0.2, 0.5, 0.3]}
              />
              <Chloroplast3D
                name="البلاستيدات الخضراء (Chloroplasts)"
                arabicName="البلاستيدات الخضراء"
                desc="مصانع البناء الضوئي؛ تحتوي على صبغة الكلوروفيل وأقراص الثايلاكويد لتحويل الطاقة الشمسية وCO2 إلى جلوكوز وأكسجين."
                selected={selectedOrganelle?.includes('البلاستيدات') ?? false}
                onSelect={onSelectOrganelle}
                position={[-1.2, -1.8, -0.5]}
                rotation={[0.4, -0.4, 0.1]}
              />
            </>
          )}
        </>
      )}

      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={18}
      />
    </>
  );
};

// ==========================================
// MAIN LIVING CELL SIMULATION PAGE
// ==========================================

const LivingCellSimulation = () => {
  const [cellType, setCellType] = useState<'animal' | 'plant' | 'bacteria'>('animal');
  const [atpRate, setAtpRate] = useState<number>(75);
  const [osmoticPressure, setOsmoticPressure] = useState<number>(50); // 50 = Isotonic
  const [selectedOrganelle, setSelectedOrganelle] = useState<string | null>('النواة (Nucleus & Nucleolus)');
  const [mitosisStage, setMitosisStage] = useState<string>('الطور البيني (Interphase)');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  // Detailed Organelle Database
  const organelleDetails: Record<string, { arabicName: string; function: string; bioChem: string; pathology: string; icon: any }> = {
    'النواة (Nucleus & Nucleolus)': {
      arabicName: 'النواة والنوية',
      function: 'مستودع الشيفرة الوراثية وتنسيق عمليات النسخ وتخليق الحمض النووي الريبوزي وتجميع الرايبوسومات.',
      bioChem: 'تحتوي على DNA المتحد مع بروتينات الهستون (كروماتين) وإنزيمات بلمرة الـ RNA.',
      pathology: 'خلل الغلاف النووي يسبب متلازمات الشيخوخة المبكرة (مثل Hutchinson-Gilford Progeria).',
      icon: Dna
    },
    'الميتوكوندريا (Mitochondria)': {
      arabicName: 'الميتوكوندريا',
      function: 'توليد جزيئات الطاقة ATP عبر التنفس الخلوي وأكسدة الأحماض الدهنية.',
      bioChem: 'تمتلك DNA حلقي خاص بها وسلسلة نقل إلكترون في الغشاء الداخلي المطوي.',
      pathology: 'اعتلالات الميتوكوندريا الوراثية تؤدي إلى ضعف العضلات والتنكس العصبي السريع.',
      icon: Zap
    },
    'جهاز غولجي (Golgi Apparatus)': {
      arabicName: 'جهاز غولجي',
      function: 'إضافة السكريات للبروتينات وتغليفها في حويصلات وتوجيهها للمستقبلات أو إفرازها خارجياً.',
      bioChem: 'مجموعة من الصهاريج المفلطحة المستقطبة (Cis-face لاستقبال المواد، Trans-face للشحن).',
      pathology: 'اضطرابات النقل في غولجي تؤدي إلى متلازمات سوء غلكزة البروتينات الخلقية (CDG).',
      icon: Layers
    },
    'الشبكة الإندوبلازمية (Endoplasmic Reticulum)': {
      arabicName: 'الشبكة الإندوبلازمية',
      function: 'تصنيع البروتينات الإفرازية والغشائية (الخشنة)، وتخليق الدهون والستيرويدات وتخزين الكالسيوم (الملساء).',
      bioChem: 'أغشية دهنية ممتدة مع الغلاف النووي، الخشنة مرصعة بآلاف الرايبوسومات النشطة.',
      pathology: 'إجهاد الشبكة الإندوبلازمية (ER Stress) يحفز موت الخلية المبرمج (Apoptosis) في السكري.',
      icon: Activity
    },
    'البلاستيدات الخضراء (Chloroplasts)': {
      arabicName: 'البلاستيدات الخضراء',
      function: 'التقاط الفوتونات الضوئية عبر صبغات الكلوروفيل وتثبيت غاز ثاني أكسيد الكربون لإنتاج السكريات.',
      bioChem: 'تتكون من غشائين وثايلاكويدات مصفوفة في حزم (Grana) مغمورة في الستروما السائلة.',
      pathology: 'نقص المغنيسيوم أو الحديد يثبط تكوين الكلوروفيل مما يسبب ابيضاض أوراق النبات (Chlorosis).',
      icon: Sparkles
    },
    'الفجوة المركزية الكبيرة (Central Vacuole)': {
      arabicName: 'الفجوة المركزية الكبيرة',
      function: 'توليد ضغط الامتلاء الهيدروستاتيكي الذي يعطي النبتة دعامتها وصلابتها، وتخزين المغذيات والصبغات.',
      bioChem: 'محاطة بغشاء شبه منفذ يُدعى التونوبلاست (Tonoplast) يحتوي مضخات بروتون نشطة.',
      pathology: 'فقدان الماء في البيئة الجافة يسبب انخفاض الضغط وذبول النبتة الفوري (Wilting).',
      icon: ShieldCheck
    },
    'الغشاء البلازمي (Plasma Membrane)': {
      arabicName: 'الغشاء البلازمي',
      function: 'حاجز نصف نافذ ذكي ينظم حركة الأيونات والمغذيات ويحتوي مستقبلات الإشارات الهرمونية.',
      bioChem: 'طبقة دهنية مزدوجة من الفوسفوليبيدات والبروتينات الغائرة والكوليسترول (النموذج الفسيفسائي السائل).',
      pathology: 'طفرات قنوات الكلوريد في الغشاء تسبب مرض التليف الكيسي (Cystic Fibrosis).',
      icon: Microscope
    },
    'المادة الوراثية الحرة (Nucleoid)': {
      arabicName: 'المادة الوراثية الحرة (البكتيريا)',
      function: 'شريط DNA حلقي مفرد يحتوي كافة الجينات الأساسية للبكتيريا بدون غلاف نووي.',
      bioChem: 'ملتوي ومكثف بمساعدة بروتينات شبيهة بالهستونات دون وجود نوية.',
      pathology: 'تستهدفها المضادات الحيوية مثل الكينولونات (Ciprofloxacin) لتثبيط إنزيم DNA Gyrase.',
      icon: Dna
    },
    'السوط البكتيري (Flagellum)': {
      arabicName: 'السوط البكتيري الدوار',
      function: 'محرك نانوي دوار فائق السرعة يدفع البكتيريا باتجاه المحفزات الكيميائية (Chemotaxis).',
      bioChem: 'يتألف من بروتين الفلاجيلين ويعمل بتدفق البروتونات عبر محرك كهرومغناطيسي حيوي في الغشاء.',
      pathology: 'يعد عامل ضراوة رئيسي يمكن البكتيريا من اختراق بطانة الأمعاء والمجاري البولية.',
      icon: Zap
    }
  };

  const currentDetails = selectedOrganelle ? organelleDetails[selectedOrganelle] || {
    arabicName: selectedOrganelle,
    function: 'عضية حيوية تقوم بوظائف فسيولوجية نوعية داخل السيتوسول.',
    bioChem: 'مركبات كيميائية وبروتينية متخصصة.',
    pathology: 'تؤثر على صحة ونشاط الخلية العام.',
    icon: Info
  } : null;

  const handleSelectOrganelle = (name: string) => {
    labSound.play('success');
    setSelectedOrganelle(name);
  };

  // Challenges for Cytology Lab
  const challenges = [
    {
      id: 'atp-boost',
      title: 'محطة الطاقة الخلوية',
      description: 'ارفع إنتاجية جزيئات ATP فوق 85 nmol/s لتلبية الاحتياجات الأيضية مع الحفاظ على الاتزان.',
      targetDescription: 'معدل ATP > 85 nmol/s',
      checkSuccess: () => atpRate >= 85,
      points: 150,
      badge: 'مهندس الطاقة الأيضية'
    },
    {
      id: 'osmotic-balance',
      title: 'التوازن الإسموزي الدقيق',
      description: 'اضبط الضغط الإسموزي للبيئة الخارجية على الوضع المتوازن تماماً (Isotonic: 45 - 55 mOsm/L) لمنع انكماش أو انفجار الخلية.',
      targetDescription: 'الضغط الإسموزي بين 45 و 55',
      checkSuccess: () => osmoticPressure >= 45 && osmoticPressure <= 55,
      points: 200,
      badge: 'حارس الغشاء البلازمي'
    },
    {
      id: 'organelle-inspector',
      title: 'فحص مجهري متخصص',
      description: 'افحص الميتوكوندريا أو البلاستيدات الخضراء أو النواة وتعرف على كيمياء عضيات الخلية.',
      targetDescription: 'فحص عضية رئيسية نشطة',
      checkSuccess: () => !!selectedOrganelle && (selectedOrganelle.includes('الميتوكوندريا') || selectedOrganelle.includes('البلاستيدات') || selectedOrganelle.includes('النواة')),
      points: 120,
      badge: 'عالم البيولوجيا الخلوية'
    }
  ];

  return (
    <SimulationLayout 
      title="مختبر بيولوجيا الخلية والمجهر الإلكتروني ثلاثي الأبعاد" 
      titleGradient="from-cyan-400 via-pink-400 to-emerald-400" 
      backgroundGradient="from-slate-950 via-purple-950/40 to-slate-950"
    >
      <div className="space-y-6">
        
        {/* TOP CONTROLS & HUD */}
        <CyberLabHUD
          title="محطة القياسات السيتوبلازمية والمجهرية"
          statusBadge={osmoticPressure < 20 ? 'CRITICAL OSMOSIS' : osmoticPressure > 80 ? 'HYPERTONIC' : 'ISOTONIC STABLE'}
          showWaveform={true}
          waveformColor={cellType === 'animal' ? '#ec4899' : cellType === 'plant' ? '#22c55e' : '#06b6d4'}
          metrics={[
            {
              id: 'atp',
              label: 'معدل إنتاج الـ ATP',
              value: Math.round(atpRate * 1.4),
              unit: 'nmol/s',
              color: 'text-amber-400',
              progressPercent: atpRate,
              trend: atpRate > 50 ? 'up' : 'down'
            },
            {
              id: 'osmotic',
              label: 'الضغط الإسموزي',
              value: Math.round(280 + (osmoticPressure - 50) * 1.5),
              unit: 'mOsm/L',
              color: Math.abs(osmoticPressure - 50) < 10 ? 'text-cyan-400' : 'text-rose-400',
              progressPercent: osmoticPressure,
              trend: 'stable'
            },
            {
              id: 'ph',
              label: 'حموضة السيتوسول pH',
              value: Number((7.2 + (atpRate - 50) * 0.003).toFixed(2)),
              unit: 'pH',
              color: 'text-emerald-400',
              progressPercent: 75,
              trend: 'stable'
            },
            {
              id: 'perm',
              label: 'نفاذية الغشاء',
              value: Math.round(85 + Math.sin(atpRate * 0.1) * 8),
              unit: '%',
              color: 'text-purple-400',
              progressPercent: 85,
              trend: 'stable'
            }
          ]}
        />

        {/* MAIN INTERACTIVE 3D WORKSTATION */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* 3D VIEWPORT (3 COLS) */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Viewport Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-xl">
              
              {/* Cell Type Tabs */}
              <Tabs value={cellType} onValueChange={(v) => { setCellType(v as any); labSound.play('click'); }} className="w-full sm:w-auto">
                <TabsList className="bg-slate-800/80 border border-slate-700/60 p-1">
                  <TabsTrigger value="animal" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-xs px-3 py-1.5 rounded-lg">
                    🔬 خلية حيوانية
                  </TabsTrigger>
                  <TabsTrigger value="plant" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-xs px-3 py-1.5 rounded-lg">
                    🌿 خلية نباتية
                  </TabsTrigger>
                  <TabsTrigger value="bacteria" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-xs px-3 py-1.5 rounded-lg">
                    🦠 خلية بكتيرية
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Camera Presets */}
              <CinematicCameraController 
                activePreset={cameraPreset} 
                onSelectPreset={(p) => { setCameraPreset(p); labSound.play('whoosh'); }} 
              />
            </div>

            {/* 3D Canvas Box */}
            <div className="relative w-full h-[540px] md:h-[620px] rounded-3xl overflow-hidden border border-cyan-500/30 bg-radial from-slate-900 via-slate-950 to-black shadow-2xl">
              
              <Canvas camera={{ position: [0, 2, 8.5], fov: 45 }}>
                <CellScene3D
                  cellType={cellType}
                  atpRate={atpRate}
                  osmoticPressure={osmoticPressure}
                  selectedOrganelle={selectedOrganelle}
                  onSelectOrganelle={handleSelectOrganelle}
                  mitosisStage={mitosisStage}
                />
              </Canvas>

              {/* Overlay Holographic Organelle Tag */}
              {selectedOrganelle && (
                <div className="absolute top-4 left-4 p-3 bg-slate-900/85 backdrop-blur-md border border-cyan-500/50 rounded-2xl text-xs text-white max-w-xs shadow-xl animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>العضية المحددة تحت المجهر</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-1">
                    {selectedOrganelle}
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {currentDetails?.function}
                  </p>
                </div>
              )}

              {/* Viewport Info Overlay Indicator */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[11px] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>دوران حر 360° • انقر على أي عضية لفحصها</span>
              </div>
            </div>

            {/* Physiological & Environmental Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-lg">
              
              {/* ATP Rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Zap className="w-4 h-4" />
                    معدل التنفس الخلوي وتوليد الـ ATP
                  </span>
                  <Badge variant="outline" className="text-amber-400 border-amber-500/40">
                    {atpRate}%
                  </Badge>
                </div>
                <Slider
                  value={[atpRate]}
                  onValueChange={(val) => setAtpRate(val[0])}
                  min={10}
                  max={100}
                  step={1}
                  className="py-1"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>سكون خامل (10%)</span>
                  <span>نشاط أيضي فائق (100%)</span>
                </div>
              </div>

              {/* Osmotic Pressure Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <ShieldCheck className="w-4 h-4" />
                    الضغط الإسموزي للمحلول الخارجي
                  </span>
                  <Badge 
                    variant="outline" 
                    className={osmoticPressure < 40 ? 'text-blue-400 border-blue-500/40' : osmoticPressure > 60 ? 'text-rose-400 border-rose-500/40' : 'text-emerald-400 border-emerald-500/40'}
                  >
                    {osmoticPressure < 40 ? 'منخفض التركيز (Hypotonic)' : osmoticPressure > 60 ? 'مرتفع التركيز (Hypertonic)' : 'متوازن (Isotonic)'}
                  </Badge>
                </div>
                <Slider
                  value={[osmoticPressure]}
                  onValueChange={(val) => setOsmoticPressure(val[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="py-1"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>انتفاخ بالماء (Hypo)</span>
                  <span>متزن (Iso)</span>
                  <span>انكماش وسحب ماء (Hyper)</span>
                </div>
              </div>

            </div>

          </div>

          {/* SIDE PANEL: CO-PILOT, DETAILS & CHALLENGES (1 COL) */}
          <div className="xl:col-span-1 space-y-4">
            
            {/* AI Co-Pilot */}
            <LiveAILabCoPilot
              simName="مختبر بيولوجيا الخلية والمجهر الإلكتروني 3D"
              subject="biology"
              liveHint={
                osmoticPressure < 30
                  ? 'تحذير أسموزي: المحلول منخفض التركيز بشدة (Hypotonic) مما يتسبب في تدفق مفرط للماء وخطر انفجار الغشاء.'
                  : osmoticPressure > 70
                  ? 'تحذير: المحلول مرتفع التركيز (Hypertonic)، الماء يخرج من السيتوبلازم مسبباً انكماش الخلية وبلزمتها.'
                  : atpRate < 30
                  ? 'تنبيه طاقة: الميتوكوندريا تعمل بالحد الأدنى من التنفس الخلوي، انتاج ATP شحيح.'
                  : 'الخلية في وضع فسيولوجي مستقر؛ افحص العضيات بالماوس لمشاهدة تفاصيل كيمياء الخلية.'
              }
              currentParameters={{
                'نوع الخلية': cellType === 'animal' ? 'خلية حيوانية حقيقية النواة' : cellType === 'plant' ? 'خلية نباتية حقيقية النواة' : 'خلية بكتيرية بدائية النواة',
                'العضية المفحوصة': selectedOrganelle || 'نظرة عامة',
                'معدل إنتاج ATP': `${atpRate}%`,
                'البيئة الأسموزية': osmoticPressure < 40 ? 'منخفض التركيز (خطر انتفاخ)' : osmoticPressure > 60 ? 'مرتفع التركيز (خطر بلزمة وانكماش)' : 'متوازن مثالي (Isotonic)',
                'حموضة السيتوسول': `${(7.2 + (atpRate - 50) * 0.003).toFixed(2)} pH`
              }}
            />

            {/* Organelle Scientific Card */}
            {currentDetails && (
              <div className="p-4 bg-gradient-to-br from-slate-900/90 to-purple-950/40 backdrop-blur-md rounded-2xl border border-purple-500/30 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm border-b border-purple-500/20 pb-2">
                  <currentDetails.icon className="w-5 h-5 text-purple-400" />
                  <span>{currentDetails.arabicName}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block mb-0.5">الوظيفة الحيوية:</span>
                    <p className="text-slate-200 leading-relaxed">{currentDetails.function}</p>
                  </div>
                  <div>
                    <span className="text-cyan-400 font-medium block mb-0.5">التركيب الكيميائي والجزيئي:</span>
                    <p className="text-slate-300 leading-relaxed">{currentDetails.bioChem}</p>
                  </div>
                  <div>
                    <span className="text-rose-400 font-medium block mb-0.5">الاعتلال المرضي المرتبط:</span>
                    <p className="text-slate-300 leading-relaxed">{currentDetails.pathology}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Gamified Challenge Engine */}
            <LabChallengeEngine challenges={challenges} />

          </div>

        </div>

      </div>
    </SimulationLayout>
  );
};

export default LivingCellSimulation;
