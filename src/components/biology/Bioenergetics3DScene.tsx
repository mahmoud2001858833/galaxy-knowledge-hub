import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Bioenergetics3DSceneProps {
  mode: 'photosynthesis' | 'respiration' | 'cycle';
  lightIntensity: number;
  time: number;
  speed: number;
  cameraPreset: 'system' | 'chloroplast' | 'mitochondria' | 'membrane';
}

// 3D Chloroplast Component with Thylakoids & Stroma
const Chloroplast3D: React.FC<{ lightIntensity: number; time: number }> = ({ lightIntensity, time }) => {
  const chloroplastRef = useRef<THREE.Group>(null);
  const photonsRef = useRef<THREE.Points>(null);

  useFrame(() => {
    if (chloroplastRef.current) {
      chloroplastRef.current.rotation.y += 0.003;
    }
  });

  // Photon stream
  const photonCount = Math.floor((lightIntensity / 100) * 80) + 10;
  const photonPositions = useMemo(() => {
    const pos = new Float32Array(photonCount * 3);
    for (let i = 0; i < photonCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 1] = 4 + Math.random() * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return pos;
  }, [photonCount]);

  useFrame(() => {
    if (photonsRef.current) {
      const arr = photonsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < photonCount; i++) {
        arr[i * 3 + 1] -= 0.08;
        if (arr[i * 3 + 1] < 0.2) {
          arr[i * 3 + 1] = 4 + Math.random() * 2;
        }
      }
      photonsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={chloroplastRef}>
      {/* Outer Envelope (Translucent Green) */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 16]} />
        <meshStandardMaterial
          color="#15803d"
          transparent
          opacity={0.35}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Membrane */}
      <mesh scale={[0.92, 0.92, 0.92]}>
        <sphereGeometry args={[2.5, 24, 16]} />
        <meshStandardMaterial
          color="#166534"
          transparent
          opacity={0.25}
          wireframe
        />
      </mesh>

      {/* Thylakoid Grana Discs (Stacks of Thylakoids) */}
      {[
        [-1.0, 0, -0.6],
        [1.0, 0.2, -0.4],
        [-0.4, -0.3, 0.8],
        [0.8, -0.2, 0.7],
        [0, 0.5, 0]
      ].map((stackPos, sIdx) => (
        <group key={sIdx} position={[stackPos[0], stackPos[1], stackPos[2]]}>
          {[-0.4, -0.2, 0, 0.2, 0.4].map((y, dIdx) => (
            <mesh key={dIdx} position={[0, y, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.08, 16]} />
              <meshStandardMaterial
                color="#22c55e"
                emissive="#15803d"
                emissiveIntensity={0.3 * (lightIntensity / 100)}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Incoming Photons */}
      <points ref={photonsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[photonPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#fde047"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Released Oxygen & Glucose Tags */}
      <Html position={[0, 3.2, 0]} center distanceFactor={14}>
        <div className="px-2.5 py-1 rounded-xl bg-emerald-950/90 border border-emerald-400 text-xs font-bold text-emerald-200 shadow-lg">
          🌱 البلاستيدة الخضراء (Chloroplast)
        </div>
      </Html>

      <Html position={[2.2, 1.2, 0]} center distanceFactor={14}>
        <div className="px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500 text-[10px] text-cyan-200 font-bold whitespace-nowrap shadow-md">
          ينتج: O₂ + جلوكوز C₆H₁₂O₆
        </div>
      </Html>
    </group>
  );
};

// 3D Mitochondria with Cristae Folds & ATP Synthase Nanomotor
const Mitochondria3D: React.FC<{ time: number }> = ({ time }) => {
  const mitoRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (mitoRef.current) mitoRef.current.rotation.y += 0.003;
    if (rotorRef.current) rotorRef.current.rotation.y += 0.06;
  });

  return (
    <group ref={mitoRef}>
      {/* Outer Membrane (Elongated Capsule) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[1.5, 2.8, 16, 32]} />
        <meshStandardMaterial
          color="#ea580c"
          transparent
          opacity={0.35}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Membrane Folded Cristae Ribs */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.0, 0.15, 8, 24, Math.PI * 1.5]} />
          <meshStandardMaterial color="#c2410c" roughness={0.4} />
        </mesh>
      ))}

      {/* ATP Synthase Nanomotor Rotary Complex */}
      <group position={[0, -0.2, 0]}>
        {/* Stator */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.6, 12]} />
          <meshStandardMaterial color="#8b5cf6" metalness={0.4} />
        </mesh>
        {/* Rotor Turbine */}
        <mesh ref={rotorRef} position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 6]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Floating ATP Energy Orbs */}
      {[0, 1, 2, 3].map((idx) => {
        const angle = time * 2 + (idx * Math.PI) / 2;
        const rad = 1.4;
        return (
          <mesh key={idx} position={[Math.cos(angle) * rad, 1.2, Math.sin(angle) * rad]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#eab308" emissive="#facc15" emissiveIntensity={0.8} />
          </mesh>
        );
      })}

      <Html position={[0, 3.0, 0]} center distanceFactor={14}>
        <div className="px-2.5 py-1 rounded-xl bg-orange-950/90 border border-orange-500 text-xs font-bold text-orange-200 shadow-lg">
          ⚡ الميتوكوندريا ومحرك ATP Synthase
        </div>
      </Html>

      <Html position={[2.2, 0.5, 0]} center distanceFactor={14}>
        <div className="px-2 py-0.5 rounded-full bg-yellow-950/90 border border-yellow-500 text-[10px] text-yellow-200 font-bold whitespace-nowrap shadow-md">
          إنتاج الطاقة: 36-38 ATP
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
    } else if (preset === 'chloroplast') {
      targetPos.set(-2, 1, 7);
      target.set(-1, 0, 0);
    } else if (preset === 'mitochondria') {
      targetPos.set(2, 1, 7);
      target.set(1, 0, 0);
    } else if (preset === 'membrane') {
      targetPos.set(0, 0.5, 4.5);
    }

    camera.position.lerp(targetPos, 0.05);
    camera.lookAt(target);
  });
  return null;
};

export const Bioenergetics3DScene: React.FC<Bioenergetics3DSceneProps> = ({
  mode,
  lightIntensity,
  time,
  cameraPreset
}) => {
  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden">
      <Canvas
        camera={{ position: [0, 2, 11], fov: 46 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#050c14']} />

        <ambientLight intensity={0.4} />
        <pointLight position={[10, 15, 10]} intensity={1.4} color="#fef08a" />
        <directionalLight position={[-10, 10, -5]} intensity={0.6} />

        <CameraPresetController preset={cameraPreset} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.06} maxDistance={25} minDistance={3} />

        {/* Dynamic Mode Rendering */}
        {mode === 'photosynthesis' && (
          <Chloroplast3D lightIntensity={lightIntensity} time={time} />
        )}

        {mode === 'respiration' && (
          <Mitochondria3D time={time} />
        )}

        {mode === 'cycle' && (
          <group>
            {/* Chloroplast on left */}
            <group position={[-3.2, 0, 0]} scale={[0.8, 0.8, 0.8]}>
              <Chloroplast3D lightIntensity={lightIntensity} time={time} />
            </group>

            {/* Mitochondria on right */}
            <group position={[3.2, 0, 0]} scale={[0.8, 0.8, 0.8]}>
              <Mitochondria3D time={time} />
            </group>

            {/* Exchange arrows between both */}
            <Html position={[0, 1.2, 0]} center distanceFactor={14}>
              <div className="px-2 py-1 rounded-xl bg-slate-900/90 border border-slate-700 text-[10px] text-slate-300 font-bold whitespace-nowrap shadow-md text-center">
                🔄 O₂ + سكريات ⟷ CO₂ + H₂O
              </div>
            </Html>
          </group>
        )}
      </Canvas>
    </div>
  );
};

export default Bioenergetics3DScene;
