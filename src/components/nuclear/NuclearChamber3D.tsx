import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

export type NuclearMode = 'fission' | 'fusion' | 'reactor';

interface NuclearChamber3DProps {
  mode: NuclearMode;
  // Fission props
  fissionStage: 'idle' | 'neutron_fired' | 'excited' | 'split' | 'fragments';
  // Fusion props
  plasmaTempMillionK: number;
  magneticFieldTesla: number;
  isFusing: boolean;
  // Reactor props
  controlRodPosition: number; // 0 (withdrawn) to 100 (fully inserted)
  coreTempC: number;
  kEff: number;
  cameraPreset: 'overview' | 'core' | 'nucleus' | 'tokamak';
}

// -------------------------------------------------------------
// Sub-component: 3D Quantum Nucleus (Protons & Neutrons Pack)
// -------------------------------------------------------------
function NucleusCluster3D({
  protons,
  neutrons,
  scale = 1,
  splitOffset = 0,
  splitProgress = 0, // 0 to 1
  colorTheme = 'uranium',
}: {
  protons: number;
  neutrons: number;
  scale?: number;
  splitOffset?: number;
  splitProgress?: number;
  colorTheme?: 'uranium' | 'barium' | 'krypton' | 'deuterium' | 'tritium' | 'helium';
}) {
  const clusterRef = useRef<THREE.Group>(null);

  // Generate deterministic packed sphere positions via Fibonacci lattice on concentric shells
  const nucleons = useMemo(() => {
    const total = Math.min(60, protons + neutrons); // Cap visual particles for 60fps performance
    const protonRatio = protons / (protons + neutrons);
    const particles = [];
    const radiusBase = Math.cbrt(total) * 0.42 * scale;

    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    for (let i = 0; i < total; i++) {
      const y = 1 - (i / (total - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      // Jitter for natural nucleon cluster packing
      const r = radiusBase * (0.45 + 0.55 * Math.cbrt((i + 1) / total));
      const x = Math.cos(theta) * radiusAtY * r;
      const z = Math.sin(theta) * radiusAtY * r;
      const py = y * r;

      const isProton = Math.random() < protonRatio;

      particles.push({
        position: [x, py, z] as [number, number, number],
        isProton,
        id: i,
      });
    }
    return particles;
  }, [protons, neutrons, scale]);

  useFrame(({ clock }) => {
    if (clusterRef.current) {
      const t = clock.getElapsedTime();
      clusterRef.current.rotation.y = t * 0.4;
      clusterRef.current.rotation.z = Math.sin(t * 0.3) * 0.15;
    }
  });

  return (
    <group ref={clusterRef} position={[splitOffset * splitProgress, 0, 0]}>
      {nucleons.map((n) => (
        <mesh key={n.id} position={n.position}>
          <sphereGeometry args={[0.22 * scale, 12, 12]} />
          <meshStandardMaterial
            color={
              n.isProton
                ? colorTheme === 'uranium'
                  ? '#ef4444' // Protons: bright red
                  : '#f97316'
                : colorTheme === 'uranium'
                ? '#38bdf8' // Neutrons: sky blue
                : '#94a3b8'
            }
            emissive={n.isProton ? '#b91c1c' : '#0284c7'}
            emissiveIntensity={0.25}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* Strong force gluon glow halo */}
      <mesh>
        <sphereGeometry args={[Math.cbrt(protons + neutrons) * 0.48 * scale, 16, 16]} />
        <meshBasicMaterial
          color={colorTheme === 'uranium' ? '#10b981' : '#38bdf8'}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: Fission 3D Stage
// -------------------------------------------------------------
function FissionScene3D({ stage }: { stage: 'idle' | 'neutron_fired' | 'excited' | 'split' | 'fragments' }) {
  const neutronRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (neutronRef.current) {
      if (stage === 'neutron_fired') {
        // Fly towards U-235 from left
        neutronRef.current.visible = true;
        const progress = (t * 2.5) % 1;
        neutronRef.current.position.x = -6 + progress * 6;
      } else if (stage === 'idle') {
        neutronRef.current.visible = true;
        neutronRef.current.position.set(-5, 0, 0);
      } else {
        neutronRef.current.visible = false;
      }
    }

    if (flashRef.current) {
      if (stage === 'split') {
        flashRef.current.visible = true;
        const s = 1 + Math.sin(t * 15) * 0.5;
        flashRef.current.scale.set(s, s, s);
      } else {
        flashRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Cherenkov Radiation Glow in pool */}
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[5, 5, 0.4, 32]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.8}
          transparent
          opacity={0.4}
          roughness={0.1}
        />
      </mesh>

      {/* Target U-235 / Compound Nucleus */}
      {stage !== 'split' && stage !== 'fragments' && (
        <group position={[0, 0, 0]}>
          <NucleusCluster3D
            protons={92}
            neutrons={143}
            scale={1.3}
            colorTheme="uranium"
          />
          <Html position={[0, 2.5, 0]} center>
            <div className="bg-slate-900/90 text-emerald-300 text-xs px-2.5 py-1 rounded-full border border-emerald-500/40 whitespace-nowrap shadow-lg">
              {stage === 'excited' ? 'نواة U-236 مُثارة وغير مستقرة' : 'نواة اليورانيوم ²³⁵U'}
            </div>
          </Html>
        </group>
      )}

      {/* Fission Split Fragments: Ba-141 and Kr-92 */}
      {(stage === 'split' || stage === 'fragments') && (
        <group>
          {/* Barium-141 flying left */}
          <group position={[-2.8, 0.5, 0]}>
            <NucleusCluster3D protons={56} neutrons={85} scale={1.0} colorTheme="barium" />
            <Html position={[0, 1.8, 0]} center>
              <div className="bg-slate-900/90 text-pink-300 text-[11px] px-2 py-0.5 rounded border border-pink-500/40 whitespace-nowrap">
                باريوم ¹⁴¹Ba (+86 MeV)
              </div>
            </Html>
          </group>

          {/* Krypton-92 flying right */}
          <group position={[2.8, -0.5, 0]}>
            <NucleusCluster3D protons={36} neutrons={56} scale={0.85} colorTheme="krypton" />
            <Html position={[0, -1.8, 0]} center>
              <div className="bg-slate-900/90 text-cyan-300 text-[11px] px-2 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap">
                كريبتون ⁹²Kr (+86 MeV)
              </div>
            </Html>
          </group>

          {/* 3 Prompt Neutrons emitting outward */}
          <mesh position={[-0.8, 2.2, 0.5]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0.8, -2.0, -0.5]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0, 1.8, -2.0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
          </mesh>

          {/* Gamma Ray Flash Wave */}
          <mesh ref={flashRef} position={[0, 0, 0]}>
            <sphereGeometry args={[2.5, 24, 24]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.35}
              wireframe
            />
          </mesh>
        </group>
      )}

      {/* Incident Neutron */}
      <mesh ref={neutronRef} position={[-5, 0, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.9} />
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-slate-900/90 text-sky-400 text-[10px] px-1.5 py-0.5 rounded border border-sky-500/30 whitespace-nowrap">
            نيوترون حر (n)
          </div>
        </Html>
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: Fusion Tokamak 3D Stage
// -------------------------------------------------------------
function FusionTokamak3D({
  plasmaTempMillionK,
  magneticFieldTesla,
  isFusing,
}: {
  plasmaTempMillionK: number;
  magneticFieldTesla: number;
  isFusing: boolean;
}) {
  const plasmaRingsRef = useRef<THREE.Group>(null);
  const coreFlashRef = useRef<THREE.PointLight>(null);

  // Plasma particle positions
  const plasmaParticles = useMemo(() => {
    const count = 120;
    const pts = [];
    for (let i = 0; i < count; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const R = 3.2; // major radius
      const r = 0.9 * Math.random(); // minor radius
      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const y = r * Math.sin(v);
      const z = (R + r * Math.cos(v)) * Math.sin(u);
      const isDeuterium = i % 2 === 0;
      pts.push({ position: [x, y, z] as [number, number, number], isDeuterium, u, v, r });
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (plasmaRingsRef.current) {
      // Rotation speed depends on plasma temperature & magnetic field
      const speed = 0.8 + (plasmaTempMillionK / 100) * 1.5;
      plasmaRingsRef.current.rotation.y = t * speed;
    }
    if (coreFlashRef.current) {
      coreFlashRef.current.intensity = isFusing ? 5.0 + Math.sin(t * 20) * 2.0 : 1.5;
    }
  });

  return (
    <group>
      {/* Tokamak Magnetic Field Confinement Torus Shell */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.2, 1.2, 24, 48]} />
        <meshPhysicalMaterial
          color="#334155"
          metalness={0.9}
          roughness={0.2}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Glowing Toroidal Magnetic Coils (D-shape rings) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 3.2, 0, Math.sin(angle) * 3.2]}
            rotation={[0, -angle, 0]}
          >
            <torusGeometry args={[1.35, 0.08, 12, 24]} />
            <meshStandardMaterial
              color="#0ea5e9"
              emissive="#0284c7"
              emissiveIntensity={0.5 * (magneticFieldTesla / 5)}
              metalness={0.8}
            />
          </mesh>
        );
      })}

      {/* Swirling Hot D-T Plasma Core */}
      <group ref={plasmaRingsRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.2, 0.75, 24, 64]} />
          <meshStandardMaterial
            color={isFusing ? '#fbbf24' : '#a855f7'}
            emissive={isFusing ? '#f59e0b' : '#7c3aed'}
            emissiveIntensity={isFusing ? 2.5 : 1.2}
            transparent
            opacity={0.55}
            roughness={0.1}
          />
        </mesh>

        {/* Plasma Ion Particles */}
        {plasmaParticles.map((p, i) => (
          <mesh key={i} position={p.position}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color={p.isDeuterium ? '#38bdf8' : '#c084fc'}
              emissive={p.isDeuterium ? '#0284c7' : '#9333ea'}
              emissiveIntensity={1.0}
            />
          </mesh>
        ))}
      </group>

      {/* Central Solenoid & Core Lighting */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 3.2, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
      </mesh>

      <pointLight
        ref={coreFlashRef}
        position={[0, 0, 0]}
        color={isFusing ? '#fef08a' : '#c084fc'}
        intensity={2.5}
        distance={10}
      />

      <Html position={[0, 3.2, 0]} center>
        <div className="bg-slate-900/90 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/40 whitespace-nowrap shadow-xl">
          {isFusing
            ? `🔥 اشتعال الاندماج النووي (T = ${plasmaTempMillionK}M K) → He-4 + n (17.6 MeV)`
            : `حصر مغناطيسي توكاماك (Tokamak Confinement B = ${magneticFieldTesla}T)`}
        </div>
      </Html>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: Reactor Lattice Core with Control Rods 3D
// -------------------------------------------------------------
function ReactorCore3D({
  controlRodPosition,
  coreTempC,
  kEff,
}: {
  controlRodPosition: number;
  coreTempC: number;
  kEff: number;
}) {
  const rodsRef = useRef<THREE.Group>(null);
  const bubblesRef = useRef<THREE.Group>(null);

  // Rods matrix: 4x4 array of fuel assemblies
  const fuelPins = useMemo(() => {
    const pins = [];
    for (let x = -1.5; x <= 1.5; x += 1.0) {
      for (let z = -1.5; z <= 1.5; z += 1.0) {
        pins.push({ x, z });
      }
    }
    return pins;
  }, []);

  // 4 Control Rods positioned in the interstitial slots
  const controlRodSlots = [
    { x: -0.5, z: -0.5 },
    { x: 0.5, z: -0.5 },
    { x: -0.5, z: 0.5 },
    { x: 0.5, z: 0.5 },
  ];

  // Calculate Y position for control rods:
  // position 0 = withdrawn (+2.2 Y), 100 = inserted (-0.2 Y)
  const rodY = 2.2 - (controlRodPosition / 100) * 2.4;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bubblesRef.current && kEff >= 1.0) {
      // Cherenkov boiling bubbles rising
      bubblesRef.current.children.forEach((child, i) => {
        child.position.y += 0.04 * (1 + (coreTempC / 1000));
        if (child.position.y > 2.0) {
          child.position.y = -2.0;
        }
      });
    }
  });

  return (
    <group>
      {/* Reactor Pressure Vessel (RPV) Outer Shell */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.8, 2.8, 5.0, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#1e293b"
          metalness={0.9}
          roughness={0.2}
          side={THREE.DoubleSide}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Cherenkov Water Pool Moderator */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[2.7, 2.7, 4.4, 32]} />
        <meshPhysicalMaterial
          color="#06b6d4"
          emissive={kEff >= 1.05 ? '#0284c7' : '#0891b2'}
          emissiveIntensity={0.4 + (kEff > 1.0 ? 0.6 : 0.1)}
          transparent
          opacity={0.45}
          roughness={0.05}
        />
      </mesh>

      {/* 4x4 Fuel Rod Assemblies (Uranium-235) */}
      {fuelPins.map((pin, i) => (
        <mesh key={`fuel-${i}`} position={[pin.x, 0, pin.z]}>
          <cylinderGeometry args={[0.15, 0.15, 3.8, 16]} />
          <meshStandardMaterial
            color={coreTempC > 650 ? '#ef4444' : '#10b981'}
            emissive={coreTempC > 650 ? '#dc2626' : '#059669'}
            emissiveIntensity={0.3 + (kEff > 1.0 ? (kEff - 1) * 2 : 0)}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* 4 Movable Control Rods (Cadmium/Boron Absorbers) */}
      <group ref={rodsRef} position={[0, rodY, 0]}>
        {controlRodSlots.map((slot, i) => (
          <group key={`ctrl-${i}`} position={[slot.x, 0, slot.z]}>
            <mesh>
              <cylinderGeometry args={[0.18, 0.18, 3.2, 16]} />
              <meshStandardMaterial
                color="#64748b"
                metalness={0.95}
                roughness={0.15}
              />
            </mesh>
          </group>
        ))}

        {/* Top Connecting Spider Assembly */}
        <mesh position={[0, 1.7, 0]}>
          <boxGeometry args={[1.6, 0.2, 1.6]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>

        <Html position={[0, 2.2, 0]} center>
          <div className="bg-slate-900/90 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/40 whitespace-nowrap shadow-lg">
            قضبان التحكم (كادميوم) إدخال: {controlRodPosition.toFixed(0)}%
          </div>
        </Html>
      </group>

      {/* Water Steam Bubbles */}
      <group ref={bubblesRef}>
        {Array.from({ length: 25 }).map((_, i) => (
          <mesh
            key={`bubble-${i}`}
            position={[
              (Math.random() - 0.5) * 3.0,
              (Math.random() - 0.5) * 3.0,
              (Math.random() - 0.5) * 3.0,
            ]}
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {/* Core Floor Grid */}
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[2.7, 2.7, 0.3, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} />
      </mesh>
    </group>
  );
}

function CameraHandler({ cameraPreset }: { cameraPreset: 'overview' | 'core' | 'nucleus' | 'tokamak' }) {
  const controlsRef = useRef<any>(null);

  useFrame(({ camera }) => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    if (cameraPreset === 'nucleus') {
      camera.position.lerp(new THREE.Vector3(0, 1.2, 5.0), 0.05);
      ctrl.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    } else if (cameraPreset === 'core') {
      camera.position.lerp(new THREE.Vector3(0, 5.5, 6.0), 0.05);
      ctrl.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    } else if (cameraPreset === 'tokamak') {
      camera.position.lerp(new THREE.Vector3(0, 6.0, 7.5), 0.05);
      ctrl.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    } else {
      camera.position.lerp(new THREE.Vector3(0, 4.0, 9.5), 0.05);
      ctrl.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }
    ctrl.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      minDistance={3.0}
      maxDistance={20}
    />
  );
}

// -------------------------------------------------------------
// Main NuclearChamber3D Component
// -------------------------------------------------------------
export const NuclearChamber3D: React.FC<NuclearChamber3DProps> = ({
  mode,
  fissionStage,
  plasmaTempMillionK,
  magneticFieldTesla,
  isFusing,
  controlRodPosition,
  coreTempC,
  kEff,
  cameraPreset,
}) => {
  return (
    <Canvas camera={{ position: [0, 4.0, 9.5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
      <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#38bdf8" />
      <pointLight position={[0, 0, 0]} intensity={1.0} color="#06b6d4" />

      {mode === 'fission' && <FissionScene3D stage={fissionStage} />}
      {mode === 'fusion' && (
        <FusionTokamak3D
          plasmaTempMillionK={plasmaTempMillionK}
          magneticFieldTesla={magneticFieldTesla}
          isFusing={isFusing}
        />
      )}
      {mode === 'reactor' && (
        <ReactorCore3D
          controlRodPosition={controlRodPosition}
          coreTempC={coreTempC}
          kEff={kEff}
        />
      )}

      <CameraHandler cameraPreset={cameraPreset} />
    </Canvas>
  );
};

export default NuclearChamber3D;
