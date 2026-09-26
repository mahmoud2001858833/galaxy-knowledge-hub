import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface MolecularBio3DSceneProps {
  simulationType: 'replication' | 'transcription' | 'translation' | 'pcr';
  time: number;
  speed: number;
  cameraPreset: 'system' | 'fork' | 'ribosome' | 'helix';
}

const BASE_COLORS: Record<string, string> = {
  A: '#ef4444', // Red (Adenine)
  T: '#3b82f6', // Blue (Thymine)
  G: '#10b981', // Green (Guanine)
  C: '#f59e0b', // Yellow (Cytosine)
  U: '#ec4899', // Pink (Uracil)
};

// 3D Double Helix Base-Pair Rungs
const DoubleHelix3D: React.FC<{ time: number; length?: number }> = ({ time, length = 20 }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const basePairs = useMemo(() => {
    const pairs: Array<{
      y: number;
      angle: number;
      base1: string;
      base2: string;
    }> = [];

    const seq1 = ['A', 'T', 'G', 'C', 'A', 'A', 'T', 'C', 'G', 'G', 'A', 'T', 'C', 'G', 'T', 'A', 'C', 'G', 'A', 'T'];
    const comp: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };

    for (let i = 0; i < length; i++) {
      const y = (i - length / 2) * 0.7;
      const angle = (i * 0.45);
      const b1 = seq1[i % seq1.length];
      const b2 = comp[b1];
      pairs.push({ y, angle, base1: b1, base2: b2 });
    }
    return pairs;
  }, [length]);

  return (
    <group ref={groupRef}>
      {basePairs.map((p, i) => {
        const radius = 1.8;
        const x1 = Math.cos(p.angle) * radius;
        const z1 = Math.sin(p.angle) * radius;
        const x2 = -x1;
        const z2 = -z1;

        return (
          <group key={i} position={[0, p.y, 0]}>
            {/* Phosphate Backbone Spheres */}
            <mesh position={[x1, 0, z1]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color="#8b5cf6" roughness={0.3} metalness={0.2} />
            </mesh>
            <mesh position={[x2, 0, z2]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color="#8b5cf6" roughness={0.3} metalness={0.2} />
            </mesh>

            {/* Base 1 Cylinder half */}
            <mesh
              position={[x1 * 0.5, 0, z1 * 0.5]}
              rotation={[0, -p.angle, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.1, 0.1, radius, 8]} />
              <meshStandardMaterial color={BASE_COLORS[p.base1]} roughness={0.4} />
            </mesh>

            {/* Base 2 Cylinder half */}
            <mesh
              position={[x2 * 0.5, 0, z2 * 0.5]}
              rotation={[0, -p.angle, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.1, 0.1, radius, 8]} />
              <meshStandardMaterial color={BASE_COLORS[p.base2]} roughness={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// 3D Replication Fork with Helicase & Polymerase
const ReplicationFork3D: React.FC<{ time: number }> = ({ time }) => {
  const forkProgress = (time * 0.4) % 6;

  return (
    <group>
      {/* Intact DNA Double Helix entering from right */}
      <group position={[3.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <DoubleHelix3D time={time} length={10} />
      </group>

      {/* Helicase Enzyme (Unwinding Ring) */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.5, 0.4, 16, 32]} />
        <meshStandardMaterial color="#06b6d4" roughness={0.3} metalness={0.5} wireframe={false} />
      </mesh>
      <Html position={[0, 2.2, 0]} center distanceFactor={12}>
        <div className="px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500 text-[10px] text-cyan-200 font-bold whitespace-nowrap shadow-md">
          🌀 إنزيم الهيليكاز (Helicase)
        </div>
      </Html>

      {/* Unwound Leading Strand (Top Branch) */}
      <group position={[-3.5, 2, 0]}>
        {[-3, -2, -1, 0, 1].map((x, i) => (
          <mesh key={i} position={[x * 0.9, 0, 0]}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshStandardMaterial color={BASE_COLORS[['A', 'T', 'G', 'C', 'A'][i]]} />
          </mesh>
        ))}

        {/* DNA Polymerase on Leading Strand */}
        <mesh position={[-1.2, 0.4, 0]}>
          <boxGeometry args={[1.6, 1.2, 1.2]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.4} metalness={0.3} />
        </mesh>
        <Html position={[-1.2, 1.5, 0]} center distanceFactor={12}>
          <div className="px-2 py-0.5 rounded-full bg-purple-950/90 border border-purple-500 text-[10px] text-purple-200 font-bold whitespace-nowrap shadow-md">
            🧬 بوليميراز DNA (Leading)
          </div>
        </Html>
      </group>

      {/* Unwound Lagging Strand (Bottom Branch with Okazaki fragments) */}
      <group position={[-3.5, -2, 0]}>
        {[-3, -2, -1, 0, 1].map((x, i) => (
          <mesh key={i} position={[x * 0.9, 0, 0]}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshStandardMaterial color={BASE_COLORS[['T', 'A', 'C', 'G', 'T'][i]]} />
          </mesh>
        ))}

        {/* Okazaki Fragment Block */}
        <mesh position={[-0.8, -0.4, 0]}>
          <boxGeometry args={[1.4, 1.0, 1.0]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.3} />
        </mesh>
        <Html position={[-0.8, -1.4, 0]} center distanceFactor={12}>
          <div className="px-2 py-0.5 rounded-full bg-amber-950/90 border border-amber-500 text-[10px] text-amber-200 font-bold whitespace-nowrap shadow-md">
            قطع أوكازاكي (Lagging)
          </div>
        </Html>
      </group>
    </group>
  );
};

// 3D Transcription Component (RNA Polymerase synthesizing mRNA)
const Transcription3D: React.FC<{ time: number }> = ({ time }) => {
  return (
    <group>
      {/* Central RNA Polymerase Enzyme Complex */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2.2, 24, 24]} />
        <meshStandardMaterial
          color="#0284c7"
          roughness={0.4}
          metalness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      <Html position={[0, 3, 0]} center distanceFactor={12}>
        <div className="px-2.5 py-1 rounded-xl bg-blue-950/90 border border-blue-400 text-xs text-blue-200 font-bold shadow-lg">
          🔬 إنزيم بوليميراز RNA (RNA Polymerase)
        </div>
      </Html>

      {/* Emerging single-stranded mRNA with Uracil */}
      <group position={[0, -1.8, 1.2]}>
        {[-4, -3, -2, -1, 0, 1, 2, 3].map((idx) => {
          const bases = ['A', 'U', 'G', 'C', 'A', 'U', 'C', 'G'];
          const b = bases[(idx + 4) % bases.length];
          return (
            <mesh key={idx} position={[idx * 0.7, Math.sin(idx * 0.8 + time * 2) * 0.3, 0]}>
              <sphereGeometry args={[0.22, 14, 14]} />
              <meshStandardMaterial color={BASE_COLORS[b]} emissive={BASE_COLORS[b]} emissiveIntensity={0.2} />
            </mesh>
          );
        })}
        <Html position={[0, -0.8, 0]} center distanceFactor={12}>
          <div className="px-2 py-0.5 rounded-full bg-pink-950/90 border border-pink-500 text-[10px] text-pink-200 font-bold whitespace-nowrap shadow-md">
            شريط الرنا المرسال (mRNA)
          </div>
        </Html>
      </group>
    </group>
  );
};

// 3D Translation (Ribosome assembling Polypeptide Chain)
const Translation3D: React.FC<{ time: number }> = ({ time }) => {
  const animOffset = (time * 0.5) % 1;

  return (
    <group>
      {/* Large Ribosomal Subunit 50S (Top) */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[2.0, 24, 24]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Small Ribosomal Subunit 30S (Bottom) */}
      <mesh position={[0, -1.4, 0]}>
        <sphereGeometry args={[1.5, 24, 24]} />
        <meshStandardMaterial color="#a855f7" roughness={0.5} metalness={0.2} />
      </mesh>

      <Html position={[0, 3.6, 0]} center distanceFactor={12}>
        <div className="px-2.5 py-1 rounded-xl bg-purple-950/90 border border-purple-400 text-xs text-purple-200 font-bold shadow-lg">
          🏭 الريبوسوم (Ribosome Complex 70S/80S)
        </div>
      </Html>

      {/* mRNA passing through the groove */}
      <group position={[0, -0.2, 1.8]}>
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[(i - animOffset) * 0.8, 0, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color={BASE_COLORS[['A', 'U', 'G', 'C', 'A', 'U', 'C', 'G', 'A'][(i + 4) % 9]]} />
          </mesh>
        ))}
      </group>

      {/* Nascent Polypeptide Amino Acid Beads emerging from exit tunnel */}
      <group position={[0, 3.2, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const colors = ['#f43f5e', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
          return (
            <mesh key={i} position={[Math.sin(i * 0.7) * 0.6, i * 0.55, Math.cos(i * 0.7) * 0.6]}>
              <sphereGeometry args={[0.28, 16, 16]} />
              <meshStandardMaterial color={colors[i]} roughness={0.3} metalness={0.3} />
            </mesh>
          );
        })}
        <Html position={[0, 3.8, 0]} center distanceFactor={12}>
          <div className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500 text-[10px] text-emerald-200 font-bold whitespace-nowrap shadow-md">
            سلسلة عديد الببتيد (Polypeptide Chain)
          </div>
        </Html>
      </group>
    </group>
  );
};

// Camera Controller
const CameraPresetController: React.FC<{ preset: string }> = ({ preset }) => {
  useFrame(({ camera }) => {
    let target = new THREE.Vector3(0, 0, 0);
    let targetPos = new THREE.Vector3(0, 2, 12);

    if (preset === 'system') {
      targetPos.set(0, 2, 12);
    } else if (preset === 'fork') {
      targetPos.set(-2, 1, 8);
      target.set(-1, 0, 0);
    } else if (preset === 'ribosome') {
      targetPos.set(0, 1, 9);
      target.set(0, 1, 0);
    } else if (preset === 'helix') {
      targetPos.set(0, 0, 7);
    }

    camera.position.lerp(targetPos, 0.05);
    camera.lookAt(target);
  });
  return null;
};

export const MolecularBio3DScene: React.FC<MolecularBio3DSceneProps> = ({
  simulationType,
  time,
  speed,
  cameraPreset
}) => {
  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden">
      <Canvas
        camera={{ position: [0, 2, 12], fov: 46 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#070a13']} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />

        <CameraPresetController preset={cameraPreset} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.06} maxDistance={25} minDistance={3} />

        {/* Dynamic Mode Rendering */}
        {simulationType === 'replication' && (
          <ReplicationFork3D time={time * speed} />
        )}

        {simulationType === 'transcription' && (
          <Transcription3D time={time * speed} />
        )}

        {simulationType === 'translation' && (
          <Translation3D time={time * speed} />
        )}

        {simulationType === 'pcr' && (
          <group>
            {/* Double Helix duplicating exponentially */}
            <group position={[-2.5, 0, 0]}>
              <DoubleHelix3D time={time * speed} length={14} />
            </group>
            <group position={[2.5, 0, 0]}>
              <DoubleHelix3D time={time * speed + 2} length={14} />
            </group>
          </group>
        )}
      </Canvas>
    </div>
  );
};

export default MolecularBio3DScene;
