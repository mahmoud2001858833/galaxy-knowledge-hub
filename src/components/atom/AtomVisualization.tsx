import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Ring, Cylinder, Float, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Particle } from '@/types/atom';
import { ORBITAL_CAPACITY } from '@/types/atom';
import { Sparkles, Eye, Zap, Layers, RefreshCw } from 'lucide-react';
import { labSound } from '@/utils/labAudio';

interface AtomVisualizationProps {
  particles: Particle[];
  onAddParticle?: (type: 'proton' | 'neutron' | 'electron') => void;
  onRemoveParticle?: (type: 'proton' | 'neutron' | 'electron') => void;
}

// ----------------------------------------------------
// 3D NUCLEON COMPONENT (PROTON OR NEUTRON)
// ----------------------------------------------------
interface Nucleon3DProps {
  type: 'proton' | 'neutron';
  position: [number, number, number];
  id: string;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

const Nucleon3D: React.FC<Nucleon3DProps> = ({ type, position, id, isHovered, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const isProton = type === 'proton';

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle quantum thermal vibration inside the nucleus
      const t = state.clock.elapsedTime * 6;
      meshRef.current.position.x = position[0] + Math.sin(t + position[1]) * 0.015;
      meshRef.current.position.y = position[1] + Math.cos(t + position[2]) * 0.015;
      meshRef.current.position.z = position[2] + Math.sin(t + position[0]) * 0.015;
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[0.26, 24, 24]}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); onHover(id); }}
      onPointerOut={() => onHover(null)}
    >
      <meshStandardMaterial
        color={isProton ? (isHovered ? "#ff2a5f" : "#ef4444") : (isHovered ? "#94a3b8" : "#64748b")}
        emissive={isProton ? "#dc2626" : "#475569"}
        emissiveIntensity={isHovered ? 0.9 : isProton ? 0.45 : 0.2}
        roughness={0.25}
        metalness={0.4}
      />
    </Sphere>
  );
};

// ----------------------------------------------------
// 3D NUCLEUS CLUSTER PACKING
// ----------------------------------------------------
const NucleusCluster3D: React.FC<{
  protons: Particle[];
  neutrons: Particle[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  isStable: boolean;
}> = ({ protons, neutrons, hoveredId, onHover, isStable }) => {
  const groupRef = useRef<THREE.Group>(null);
  const total = protons.length + neutrons.length;

  // Generate tightly packed spherical coordinates (Fibonacci lattice)
  const nucleonPositions = useMemo(() => {
    const list: { particle: Particle; pos: [number, number, number] }[] = [];
    const all = [...protons, ...neutrons];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    all.forEach((p, i) => {
      if (total === 1) {
        list.push({ particle: p, pos: [0, 0, 0] });
        return;
      }
      const y = 1 - (i / Math.max(1, total - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Shell radius expands with cubic root of mass number A
      const clusterRadius = Math.max(0.4, Math.cbrt(total) * 0.42);
      list.push({
        particle: p,
        pos: [x * clusterRadius, y * clusterRadius, z * clusterRadius]
      });
    });
    return list;
  }, [protons, neutrons, total]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Slow tumble of the nucleus
      groupRef.current.rotation.y += delta * 0.25;
      groupRef.current.rotation.x += delta * 0.15;

      // If unstable, simulate nuclear wobble / threat of alpha decay
      if (!isStable && total > 2) {
        const jitter = Math.sin(state.clock.elapsedTime * 25) * 0.04;
        groupRef.current.position.set(jitter, jitter * 0.7, -jitter * 0.5);
      } else {
        groupRef.current.position.set(0, 0, 0);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Strong Force Glow */}
      {total > 0 && (
        <pointLight
          color={isStable ? "#fbbf24" : "#f43f5e"}
          intensity={Math.min(2.5, 0.5 + total * 0.1)}
          distance={4}
        />
      )}

      {/* Meson Exchange / Strong Force Binding Halo */}
      {total > 1 && (
        <Sphere args={[Math.cbrt(total) * 0.55 + 0.1, 24, 24]}>
          <meshBasicMaterial
            color={isStable ? "#f59e0b" : "#e11d48"}
            transparent
            opacity={0.12}
            wireframe
          />
        </Sphere>
      )}

      {nucleonPositions.map(({ particle, pos }) => (
        <Nucleon3D
          key={particle.id}
          id={particle.id}
          type={particle.type as 'proton' | 'neutron'}
          position={pos}
          isHovered={hoveredId === particle.id}
          onHover={onHover}
        />
      ))}
    </group>
  );
};

// ----------------------------------------------------
// 3D ORBITING ELECTRON WITH TRAIL
// ----------------------------------------------------
const OrbitingElectron3D: React.FC<{
  radius: number;
  speed: number;
  initialAngle: number;
  inclination: [number, number, number];
  id: string;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}> = ({ radius, speed, initialAngle, inclination, id, isHovered, onHover }) => {
  const electronRef = useRef<THREE.Group>(null);
  const angleRef = useRef<number>(initialAngle);

  useFrame((state, delta) => {
    angleRef.current += delta * speed;
    if (electronRef.current) {
      const x = Math.cos(angleRef.current) * radius;
      const z = Math.sin(angleRef.current) * radius;
      electronRef.current.position.set(x, 0, z);
    }
  });

  return (
    <group rotation={inclination}>
      <group ref={electronRef}>
        {/* Electron point light */}
        <pointLight color="#38bdf8" intensity={0.6} distance={1.5} />
        <Sphere
          args={[0.13, 16, 16]}
          onPointerOver={(e) => { e.stopPropagation(); onHover(id); }}
          onPointerOut={() => onHover(null)}
        >
          <meshStandardMaterial
            color={isHovered ? "#67e8f9" : "#0284c7"}
            emissive="#38bdf8"
            emissiveIntensity={isHovered ? 1.0 : 0.75}
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
      </group>
    </group>
  );
};

// ----------------------------------------------------
// 3D BOHR ORBITAL RINGS & ELECTRONS
// ----------------------------------------------------
const BohrOrbits3D: React.FC<{
  electrons: Particle[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  showQuantumCloud: boolean;
}> = ({ electrons, hoveredId, onHover, showQuantumCloud }) => {
  // Shell Radii scaled nicely for 3D view
  const shellRadii = [2.2, 3.4, 4.7, 6.0, 7.3, 8.6, 9.8];

  // Distribute electrons into levels
  const electronsPerLevel: Particle[][] = ORBITAL_CAPACITY.map(() => []);
  let eCount = 0;
  electrons.forEach((e, idx) => {
    let accumulated = 0;
    for (let lvl = 0; lvl < ORBITAL_CAPACITY.length; lvl++) {
      if (idx < accumulated + ORBITAL_CAPACITY[lvl]) {
        electronsPerLevel[lvl].push(e);
        break;
      }
      accumulated += ORBITAL_CAPACITY[lvl];
    }
  });

  return (
    <group>
      {shellRadii.map((radius, levelIdx) => {
        const levelElectrons = electronsPerLevel[levelIdx] || [];
        const capacity = ORBITAL_CAPACITY[levelIdx];
        const isOccupied = levelElectrons.length > 0;
        const isFull = levelElectrons.length >= capacity;

        // Slight inclination tilt for 3D realism
        const tilt: [number, number, number] = [
          (levelIdx * 0.18) % 0.6,
          (levelIdx * 0.25) % 0.8,
          0
        ];

        return (
          <group key={levelIdx}>
            {/* 3D Ring representation of the Bohr shell */}
            <Ring
              args={[radius - 0.025, radius + 0.025, 64]}
              rotation={[Math.PI / 2 + tilt[0], tilt[1], tilt[2]]}
            >
              <meshBasicMaterial
                color={isFull ? "#22c55e" : isOccupied ? "#38bdf8" : "#475569"}
                transparent
                opacity={isOccupied ? 0.55 : 0.2}
                side={THREE.DoubleSide}
              />
            </Ring>

            {/* Optional Quantum Probability Cloud Shroud */}
            {showQuantumCloud && isOccupied && (
              <Sphere args={[radius, 32, 16]}>
                <meshStandardMaterial
                  color="#0284c7"
                  transparent
                  opacity={0.06}
                  wireframe
                />
              </Sphere>
            )}

            {/* Render Electrons orbiting this level */}
            {levelElectrons.map((electron, eIdx) => {
              const baseAngle = (eIdx / levelElectrons.length) * Math.PI * 2;
              // Orbital speed decreases with distance (Kepler / Bohr: v ~ 1/n)
              const speed = (2.2 / (levelIdx + 1)) * 0.9;

              return (
                <OrbitingElectron3D
                  key={electron.id}
                  id={electron.id}
                  radius={radius}
                  speed={speed}
                  initialAngle={baseAngle}
                  inclination={[Math.PI / 2 + tilt[0], tilt[1], tilt[2]]}
                  isHovered={hoveredId === electron.id}
                  onHover={onHover}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

// ----------------------------------------------------
// PHOTON EMISSION BURST EFFECT
// ----------------------------------------------------
const PhotonBurst: React.FC<{ active: boolean; wavelength: number }> = ({ active, wavelength }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current && active) {
      meshRef.current.scale.addScalar(delta * 12);
      meshRef.current.rotation.y += delta * 5;
    }
  });

  if (!active) return null;

  return (
    <Ring ref={meshRef} args={[0.2, 0.4, 32]} rotation={[Math.PI / 2, 0, 0]}>
      <meshBasicMaterial color="#a855f7" transparent opacity={0.8} side={THREE.DoubleSide} />
    </Ring>
  );
};

// ====================================================
// MAIN ATOM VISUALIZATION EXPORT
// ====================================================
export const AtomVisualization: React.FC<AtomVisualizationProps> = ({
  particles,
  onAddParticle,
  onRemoveParticle
}) => {
  const [hoveredParticleId, setHoveredParticleId] = useState<string | null>(null);
  const [showQuantumCloud, setShowQuantumCloud] = useState<boolean>(false);
  const [photonBurst, setPhotonBurst] = useState<boolean>(false);

  const protons = useMemo(() => particles.filter(p => p.type === 'proton'), [particles]);
  const neutrons = useMemo(() => particles.filter(p => p.type === 'neutron'), [particles]);
  const electrons = useMemo(() => particles.filter(p => p.type === 'electron'), [particles]);

  // Nuclear stability check: N/Z ratio ~ 1.0 to 1.5
  const isStable = useMemo(() => {
    if (protons.length === 0) return true;
    if (protons.length === 1 && neutrons.length <= 1) return true;
    const ratio = neutrons.length / protons.length;
    return ratio >= 0.8 && ratio <= 1.6;
  }, [protons.length, neutrons.length]);

  // Trigger quantum excitation jump & photon emission
  const triggerQuantumJump = () => {
    labSound.play('laser');
    setPhotonBurst(true);
    setTimeout(() => setPhotonBurst(false), 1200);
  };

  const hoveredParticle = particles.find(p => p.id === hoveredParticleId);

  return (
    <Card className="bg-slate-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl overflow-hidden shadow-2xl">
      <CardContent className="p-0">
        
        {/* TOP VIEWPORT BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-cyan-300">محاكي الذرة المجسم ثلاثي الأبعاد 3D</span>
            <Badge variant="outline" className={isStable ? "text-emerald-400 border-emerald-500/40 text-[10px]" : "text-rose-400 border-rose-500/40 text-[10px] animate-pulse"}>
              {isStable ? "نواة مستقرة" : "نواة غير مستقرة (نشاط إشعاعي)"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={showQuantumCloud ? "default" : "outline"}
              onClick={() => { setShowQuantumCloud(!showQuantumCloud); labSound.play('click'); }}
              className="text-xs h-7 gap-1.5 border-white/20"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showQuantumCloud ? "إخفاء السحابة الكمية" : "السحابة الاحتمالية الكمية"}</span>
            </Button>

            <Button
              size="sm"
              onClick={triggerQuantumJump}
              disabled={electrons.length === 0}
              className="text-xs h-7 gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>قفزة كمية وانبعاث فوتون</span>
            </Button>
          </div>
        </div>

        {/* 3D CANVAS VIEWPORT */}
        <div className="relative w-full h-[520px] md:h-[620px] bg-radial from-slate-900 via-slate-950 to-black overflow-hidden">
          
          <Canvas camera={{ position: [0, 8, 12], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 15, 10]} intensity={1.2} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />

            {/* Nucleus Cluster in 3D */}
            <NucleusCluster3D
              protons={protons}
              neutrons={neutrons}
              hoveredId={hoveredParticleId}
              onHover={setHoveredParticleId}
              isStable={isStable}
            />

            {/* Bohr Shells and Orbiting Electrons in 3D */}
            <BohrOrbits3D
              electrons={electrons}
              hoveredId={hoveredParticleId}
              onHover={setHoveredParticleId}
              showQuantumCloud={showQuantumCloud}
            />

            {/* Quantum Jump Photon Burst */}
            <PhotonBurst active={photonBurst} wavelength={656} />

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={25}
            />
          </Canvas>

          {/* OVERLAY: HOVERED PARTICLE TELEMETRY */}
          {hoveredParticle && (
            <div className="absolute top-4 left-4 p-3 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-2xl text-xs text-white shadow-xl animate-in fade-in">
              <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>جسيم محدد: {hoveredParticle.type === 'proton' ? 'بروتون (P+)' : hoveredParticle.type === 'neutron' ? 'نيوترون (n°)' : 'إلكترون (e-)'}</span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-0.5">
                <div>الشحنة: {hoveredParticle.type === 'proton' ? '+1.602 × 10⁻¹⁹ C' : hoveredParticle.type === 'neutron' ? '0 C (متعادل)' : '-1.602 × 10⁻¹⁹ C'}</div>
                <div>الكتلة: {hoveredParticle.type === 'electron' ? '9.109 × 10⁻³¹ kg' : '1.673 × 10⁻²⁷ kg'}</div>
              </div>
            </div>
          )}

          {/* QUICK BOTTOM LEGEND */}
          <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 p-2.5 bg-black/70 backdrop-blur-md rounded-2xl border border-white/10 text-xs text-white">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 shadow-md shadow-red-500/50" />
              <span>بروتون ({protons.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-500 shadow-md shadow-slate-500/50" />
              <span>نيوترون ({neutrons.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
              <span>إلكترون ({electrons.length})</span>
            </div>
          </div>

          {/* TOUCH/MOUSE INSTRUCTION */}
          <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
            تدوير 360° حر • عجلة الفأرة للتكبير والاقتراب من النواة
          </div>

        </div>

      </CardContent>
    </Card>
  );
};

export default AtomVisualization;
