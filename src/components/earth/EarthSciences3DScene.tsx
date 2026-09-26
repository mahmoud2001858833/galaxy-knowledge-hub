import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface EarthSciences3DSceneProps {
  simulationType: 'earthquake' | 'volcano' | 'plates' | 'rocks';
  magnitude: number;
  time: number;
  showWaveforms: boolean;
  cutawayView: boolean;
  cameraPreset: 'front' | 'top' | 'cross-section' | 'hypocenter';
}

// 3D Earthquake Hypocenter & Seismic Waves Component
const Earthquake3D: React.FC<{ magnitude: number; time: number; showWaves: boolean }> = ({
  magnitude,
  time,
  showWaves
}) => {
  const shakeRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (shakeRef.current) {
      const intensity = (magnitude / 9) * 0.15;
      shakeRef.current.position.x = Math.sin(time * 25) * intensity;
      shakeRef.current.position.y = Math.cos(time * 30) * intensity * 0.5;
    }
  });

  // Generate expanding P-wave and S-wave spheres
  const waveCount = 4;
  const pWaves = useMemo(() => {
    return Array.from({ length: waveCount }).map((_, i) => (time * 4 + i * 2) % 12);
  }, [time]);

  const sWaves = useMemo(() => {
    return Array.from({ length: waveCount }).map((_, i) => (time * 2.2 + i * 2) % 12);
  }, [time]);

  return (
    <group>
      {/* Ground Layers */}
      <group ref={shakeRef}>
        {/* Surface Soil Layer */}
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[14, 0.6, 8]} />
          <meshStandardMaterial color="#2d5016" roughness={0.9} />
        </mesh>

        {/* Sedimentary Crust */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[14, 1.2, 8]} />
          <meshStandardMaterial color="#854d0e" roughness={0.8} />
        </mesh>

        {/* Hard Bedrock / Mantle */}
        <mesh position={[0, -1.2, 0]}>
          <boxGeometry args={[14, 3, 8]} />
          <meshStandardMaterial color="#3f2e1e" roughness={0.7} />
        </mesh>

        {/* Geological Fault Line Plane */}
        <mesh position={[-0.5, 0.2, 0]} rotation={[0, 0, 0.35]}>
          <boxGeometry args={[0.08, 4.5, 8.1]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.8} />
        </mesh>

        {/* Surface Buildings */}
        {[-4, -2, 2, 4.5].map((x, idx) => (
          <mesh key={idx} position={[x, 2.7 + (idx % 2) * 0.5, 0]}>
            <boxGeometry args={[1.2, 1.4 + (idx % 2) * 1.0, 1.2]} />
            <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Underground Focus / Hypocenter */}
      <mesh position={[-1.2, -1.2, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      <Html position={[-1.2, -0.6, 0]} center distanceFactor={12}>
        <div className="px-2 py-0.5 rounded-full bg-red-950/90 border border-red-500 text-[10px] text-red-200 font-bold whitespace-nowrap shadow-lg">
          📍 بؤرة الزلزال (Hypocenter)
        </div>
      </Html>

      {/* Expanding Primary (P) Waves - Longitudinal (Red-Yellow) */}
      {showWaves && pWaves.map((r, i) => (
        <mesh key={`p-${i}`} position={[-1.2, -1.2, 0]}>
          <sphereGeometry args={[r, 24, 24]} />
          <meshBasicMaterial
            color="#eab308"
            wireframe
            transparent
            opacity={Math.max(0, 0.6 - r / 12)}
          />
        </mesh>
      ))}

      {/* Expanding Secondary (S) Waves - Transverse Shear (Blue-Purple) */}
      {showWaves && sWaves.map((r, i) => (
        <mesh key={`s-${i}`} position={[-1.2, -1.2, 0]}>
          <sphereGeometry args={[r, 24, 24]} />
          <meshBasicMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={Math.max(0, 0.7 - r / 12)}
          />
        </mesh>
      ))}
    </group>
  );
};

// 3D Volcano & Magma Reservoir Component
const Volcano3D: React.FC<{ time: number }> = ({ time }) => {
  const particlesRef = useRef<THREE.Points>(null);

  // Generate volcanic plume particles
  const particleCount = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 1] = 2.5 + Math.random() * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += 0.06;
        pos[i * 3] += (Math.random() - 0.5) * 0.04;
        pos[i * 3 + 2] += (Math.random() - 0.5) * 0.04;
        if (pos[i * 3 + 1] > 7) {
          pos[i * 3 + 1] = 2.4;
          pos[i * 3] = (Math.random() - 0.5) * 0.4;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Stratovolcano Cone */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.8, 5.5, 3.2, 32, 1, false]} />
        <meshStandardMaterial color="#443425" roughness={0.9} />
      </mesh>

      {/* Caldera / Crater Rim */}
      <mesh position={[0, 2.75, 0]}>
        <cylinderGeometry args={[0.82, 0.7, 0.3, 32, 1, true]} />
        <meshStandardMaterial color="#1f1811" roughness={0.9} />
      </mesh>

      {/* Subterranean Magma Reservoir Chamber */}
      <mesh position={[0, -2, 0]}>
        <sphereGeometry args={[1.8, 24, 24]} />
        <meshStandardMaterial color="#ea580c" emissive="#f97316" emissiveIntensity={0.8} />
      </mesh>

      {/* Central Magma Conduit Tube */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 3.5, 16]} />
        <meshStandardMaterial color="#ea580c" emissive="#ef4444" emissiveIntensity={0.9} />
      </mesh>

      {/* Lava flow on mountain side */}
      <mesh position={[0.7, 1.4, 1.2]} rotation={[0.4, 0.2, -0.3]}>
        <boxGeometry args={[0.4, 2.2, 0.1]} />
        <meshStandardMaterial color="#f97316" emissive="#f59e0b" emissiveIntensity={0.9} />
      </mesh>

      {/* Erupting Ash & Pyroclastic Smoke Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.22}
          color="#f97316"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <Html position={[0, -2, 0]} center distanceFactor={14}>
        <div className="px-2 py-0.5 rounded-full bg-orange-950/90 border border-orange-500 text-[10px] text-orange-200 font-bold shadow-lg">
          🔥 غرفة الصهارة (Magma Chamber)
        </div>
      </Html>
    </group>
  );
};

// 3D Tectonic Plates Subduction Component
const Plates3D: React.FC<{ time: number }> = ({ time }) => {
  return (
    <group>
      {/* Continental Plate (Lighter, higher) */}
      <mesh position={[3.2, 1.2, 0]}>
        <boxGeometry args={[6, 2, 7]} />
        <meshStandardMaterial color="#57534e" roughness={0.8} />
      </mesh>

      {/* Oceanic Plate diving downwards into Asthenosphere (Subduction) */}
      <mesh position={[-3.2, 0.8, 0]}>
        <boxGeometry args={[6, 1.4, 7]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
      </mesh>

      {/* Subduction Slab diving under angle */}
      <mesh position={[0.2, -0.6, 0]} rotation={[0, 0, -0.6]}>
        <boxGeometry args={[3.5, 1.2, 7]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.7} />
      </mesh>

      {/* Melting Trench Magma Generation */}
      <mesh position={[1.4, -1.2, 0]}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#f97316" emissiveIntensity={0.8} />
      </mesh>

      {/* Mantle Beneath */}
      <mesh position={[0, -3, 0]}>
        <boxGeometry args={[14, 2.5, 7.5]} />
        <meshStandardMaterial color="#7c2d12" emissive="#431407" emissiveIntensity={0.3} />
      </mesh>

      <Html position={[3.2, 2.5, 0]} center distanceFactor={14}>
        <div className="px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-600 text-[10px] text-slate-200 font-bold shadow-md">
          صفيحة قارية (Continental)
        </div>
      </Html>

      <Html position={[-3.2, 2.5, 0]} center distanceFactor={14}>
        <div className="px-2 py-0.5 rounded-full bg-blue-950/90 border border-blue-500 text-[10px] text-blue-200 font-bold shadow-md">
          صفيحة محيطية (Oceanic Trench)
        </div>
      </Html>
    </group>
  );
};

// 3D Rock Cycle Transformation Component
const RockCycle3D: React.FC<{ time: number }> = ({ time }) => {
  return (
    <group>
      {/* 3 Rock Nodes in a Triangular Configuration */}
      {/* 1. Igneous Rocks (Top) */}
      <mesh position={[0, 3, 0]}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.2} emissive="#7f1d1d" emissiveIntensity={0.3} />
      </mesh>

      {/* 2. Sedimentary Rocks (Bottom Left) */}
      <mesh position={[-3.5, -1.8, 0]}>
        <boxGeometry args={[2, 1.5, 1.8]} />
        <meshStandardMaterial color="#d97706" roughness={0.9} />
      </mesh>

      {/* 3. Metamorphic Rocks (Bottom Right) */}
      <mesh position={[3.5, -1.8, 0]}>
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Labels */}
      <Html position={[0, 4.5, 0]} center distanceFactor={14}>
        <div className="px-2.5 py-1 rounded-xl bg-red-950/90 border border-red-500 text-xs font-bold text-red-200 shadow-md">
          🌋 صخور نارية (Igneous)
        </div>
      </Html>

      <Html position={[-3.5, -3.2, 0]} center distanceFactor={14}>
        <div className="px-2.5 py-1 rounded-xl bg-amber-950/90 border border-amber-500 text-xs font-bold text-amber-200 shadow-md">
          🏜️ صخور رسوبية (Sedimentary)
        </div>
      </Html>

      <Html position={[3.5, -3.2, 0]} center distanceFactor={14}>
        <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-500 text-xs font-bold text-slate-200 shadow-md">
          💎 صخور متحولة (Metamorphic)
        </div>
      </Html>
    </group>
  );
};

// Camera Controller
const CameraPresetController: React.FC<{ preset: string }> = ({ preset }) => {
  useFrame(({ camera }) => {
    let target = new THREE.Vector3(0, 0, 0);
    let targetPos = new THREE.Vector3(0, 4, 14);

    if (preset === 'front') {
      targetPos.set(0, 2, 14);
    } else if (preset === 'top') {
      targetPos.set(0, 16, 0.1);
    } else if (preset === 'cross-section') {
      targetPos.set(8, 3, 10);
    } else if (preset === 'hypocenter') {
      targetPos.set(-2, -0.5, 6);
      target.set(-1.2, -1.2, 0);
    }

    camera.position.lerp(targetPos, 0.05);
    camera.lookAt(target);
  });
  return null;
};

export const EarthSciences3DScene: React.FC<EarthSciences3DSceneProps> = ({
  simulationType,
  magnitude,
  time,
  showWaveforms,
  cameraPreset
}) => {
  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden">
      <Canvas
        camera={{ position: [0, 4, 14], fov: 48 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#090d16']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} />
        <directionalLight position={[-10, 5, -10]} intensity={0.4} />

        <CameraPresetController preset={cameraPreset} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxDistance={28} minDistance={3} />

        {/* Dynamic Mode Object Rendering */}
        {simulationType === 'earthquake' && (
          <Earthquake3D magnitude={magnitude} time={time} showWaves={showWaveforms} />
        )}

        {simulationType === 'volcano' && (
          <Volcano3D time={time} />
        )}

        {simulationType === 'plates' && (
          <Plates3D time={time} />
        )}

        {simulationType === 'rocks' && (
          <RockCycle3D time={time} />
        )}
      </Canvas>
    </div>
  );
};

export default EarthSciences3DScene;
