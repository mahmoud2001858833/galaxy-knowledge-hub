import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface ImmuneSystem3DSceneProps {
  mode: 'innate' | 'adaptive' | 'memory';
  antibodyCount: number;
  time: number;
  cameraPreset: 'system' | 'macrophage' | 'antibody' | 'virus';
}

// 3D Y-Shaped Antibody Component
const Antibody3D: React.FC<{ position: [number, number, number]; rotation?: [number, number, number] }> = ({
  position,
  rotation = [0, 0, 0]
}) => {
  return (
    <group position={position} rotation={rotation} scale={[0.45, 0.45, 0.45]}>
      {/* Stem (Fc Region) */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Left Fab Arm */}
      <mesh position={[-0.45, 0.35, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.1, 0.1, 1.0, 8]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Right Fab Arm */}
      <mesh position={[0.45, 0.35, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.1, 0.1, 1.0, 8]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Antigen-binding tips (Paratopes) */}
      <mesh position={[-0.8, 0.7, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.8, 0.7, 0]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

// 3D Pathogen (Virus with spikes)
const Virus3D: React.FC<{ position: [number, number, number]; isNeutralized?: boolean }> = ({
  position,
  isNeutralized
}) => {
  const virusRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (virusRef.current) {
      virusRef.current.rotation.y += 0.008;
      virusRef.current.rotation.x += 0.005;
    }
  });

  // 12 Spikes on dodecahedron vertices
  const spikes = useMemo(() => {
    const s = [];
    const phi = (1 + Math.sqrt(5)) / 2;
    const v = [
      [1, 1, 1], [-1, 1, 1], [1, -1, 1], [-1, -1, 1],
      [1, 1, -1], [-1, 1, -1], [1, -1, -1], [-1, -1, -1],
      [0, 1/phi, phi], [0, -1/phi, phi], [0, 1/phi, -phi], [0, -1/phi, -phi]
    ];
    for (const p of v) {
      const vec = new THREE.Vector3(p[0], p[1], p[2]).normalize().multiplyScalar(1.3);
      s.push([vec.x, vec.y, vec.z] as [number, number, number]);
    }
    return s;
  }, []);

  return (
    <group ref={virusRef} position={position}>
      {/* Central Viral Capsid */}
      <mesh>
        <dodecahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial
          color={isNeutralized ? "#64748b" : "#ef4444"}
          roughness={0.4}
          metalness={0.1}
          emissive={isNeutralized ? "#334155" : "#b91c1c"}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Surface Spikes (Antigens) */}
      {spikes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial
            color={isNeutralized ? "#94a3b8" : "#f97316"}
            emissive={isNeutralized ? "#475569" : "#ea580c"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      <Html position={[0, 1.8, 0]} center distanceFactor={14}>
        <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap shadow-md ${
          isNeutralized 
            ? 'bg-slate-900/90 border-slate-600 text-slate-400' 
            : 'bg-red-950/90 border-red-500 text-red-200 animate-pulse'
        }`}>
          {isNeutralized ? '🛡️ فيروس تم تحييده (Neutralized)' : '🦠 مستضد فيروسي نشط (Pathogen)'}
        </div>
      </Html>
    </group>
  );
};

// 3D Macrophage (Phagocyte with amoeboid motion)
const Macrophage3D: React.FC<{ time: number }> = ({ time }) => {
  const macroRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (macroRef.current) {
      const s = 1 + Math.sin(time * 3) * 0.05;
      macroRef.current.scale.set(s, 1 + Math.cos(time * 2.5) * 0.04, s);
    }
  });

  return (
    <group position={[-2.5, 0, 0]}>
      <mesh ref={macroRef}>
        <sphereGeometry args={[2.0, 24, 24]} />
        <meshStandardMaterial
          color="#d97706"
          roughness={0.6}
          metalness={0.1}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Nucleus inside macrophage */}
      <mesh position={[0.2, 0.2, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#92400e" roughness={0.4} />
      </mesh>

      {/* Pseudopodia engulfing arms */}
      <mesh position={[1.6, 0.4, 0]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.35, 1.2, 8, 16]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} />
      </mesh>
      <mesh position={[1.5, -0.6, 0]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.35, 1.2, 8, 16]} />
        <meshStandardMaterial color="#b45309" roughness={0.5} />
      </mesh>

      <Html position={[0, 2.5, 0]} center distanceFactor={14}>
        <div className="px-2.5 py-1 rounded-xl bg-amber-950/90 border border-amber-500 text-xs font-bold text-amber-200 shadow-lg">
          🧫 البلعم الكبير (Macrophage)
        </div>
      </Html>
    </group>
  );
};

// Camera Controller
const CameraPresetController: React.FC<{ preset: string }> = ({ preset }) => {
  useFrame(({ camera }) => {
    let target = new THREE.Vector3(0, 0, 0);
    let targetPos = new THREE.Vector3(0, 2, 11);

    if (preset === 'system') {
      targetPos.set(0, 2, 11);
    } else if (preset === 'macrophage') {
      targetPos.set(-2, 1, 6);
      target.set(-2.5, 0, 0);
    } else if (preset === 'antibody') {
      targetPos.set(1.5, 1, 5);
      target.set(1.5, 0, 0);
    } else if (preset === 'virus') {
      targetPos.set(2, 0.5, 4.5);
      target.set(2, 0, 0);
    }

    camera.position.lerp(targetPos, 0.05);
    camera.lookAt(target);
  });
  return null;
};

export const ImmuneSystem3DScene: React.FC<ImmuneSystem3DSceneProps> = ({
  mode,
  antibodyCount,
  time,
  cameraPreset
}) => {
  // Antibodies dynamic positions
  const antibodies = useMemo(() => {
    const list = [];
    const count = mode === 'innate' ? 2 : antibodyCount;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const rad = 2.4 + (i % 2) * 0.8;
      list.push({
        pos: [Math.cos(angle) * rad + 1.5, Math.sin(angle) * 1.5, Math.sin(angle * 2) * 1.2] as [number, number, number],
        rot: [0, 0, angle + Math.PI / 2] as [number, number, number]
      });
    }
    return list;
  }, [antibodyCount, mode]);

  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden">
      <Canvas
        camera={{ position: [0, 2, 11], fov: 46 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0a0814']} />

        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.3} color="#ffffff" />
        <pointLight position={[-10, -5, -5]} intensity={0.6} color="#38bdf8" />

        <CameraPresetController preset={cameraPreset} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.06} maxDistance={25} minDistance={3} />

        {/* Mode 1: Innate Immunity (Macrophage Phagocytosis) */}
        {mode === 'innate' && (
          <group>
            <Macrophage3D time={time} />
            <Virus3D position={[1.8, Math.sin(time * 2) * 0.4, 0]} isNeutralized={false} />
          </group>
        )}

        {/* Mode 2: Adaptive Immunity (Antibodies Neutralization) */}
        {mode === 'adaptive' && (
          <group>
            <Virus3D position={[0, 0, 0]} isNeutralized={antibodyCount >= 8} />
            {antibodies.map((ab, idx) => (
              <Antibody3D key={idx} position={ab.pos} rotation={ab.rot} />
            ))}
          </group>
        )}

        {/* Mode 3: Memory & Secondary Response */}
        {mode === 'memory' && (
          <group>
            <Virus3D position={[-2, 0, 0]} isNeutralized={true} />
            <Virus3D position={[2, 0.5, 0]} isNeutralized={true} />
            {antibodies.map((ab, idx) => (
              <Antibody3D key={idx} position={ab.pos} rotation={ab.rot} />
            ))}
          </group>
        )}
      </Canvas>
    </div>
  );
};

export default ImmuneSystem3DScene;
