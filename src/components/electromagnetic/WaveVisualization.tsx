import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface WaveVisualizationProps {
  frequency: number;
  amplitude: number;
  waveType: string;
  polarization?: 'linear' | 'circular';
}

const getWaveColors = (type: string) => {
  switch (type) {
    case 'radio': return { e: '#ef4444', b: '#3b82f6', glow: '#f87171' };
    case 'microwave': return { e: '#f97316', b: '#06b6d4', glow: '#fb923c' };
    case 'infrared': return { e: '#eab308', b: '#3b82f6', glow: '#facc15' };
    case 'visible': return { e: '#22c55e', b: '#a855f7', glow: '#4ade80' };
    case 'ultraviolet': return { e: '#a855f7', b: '#06b6d4', glow: '#c084fc' };
    case 'xray': return { e: '#3b82f6', b: '#ec4899', glow: '#60a5fa' };
    case 'gamma': return { e: '#6366f1', b: '#f43f5e', glow: '#818cf8' };
    default: return { e: '#22c55e', b: '#a855f7', glow: '#4ade80' };
  }
};

const MaxwellWave3D: React.FC<{
  frequency: number;
  amplitude: number;
  waveType: string;
  polarization: 'linear' | 'circular';
}> = ({ frequency, amplitude, waveType, polarization }) => {
  const lineERef = useRef<THREE.Line>(null);
  const lineBRef = useRef<THREE.Line>(null);
  const vectorsGroupRef = useRef<THREE.Group>(null);

  const colors = useMemo(() => getWaveColors(waveType), [waveType]);
  const numPoints = 120;
  const zSpan = 10;

  // Pre-allocated geometry vectors
  const pointsE = useMemo(() => Array.from({ length: numPoints }, () => new THREE.Vector3()), []);
  const pointsB = useMemo(() => Array.from({ length: numPoints }, () => new THREE.Vector3()), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 3.0;
    // Spatial wave number k
    const k = 2.5;

    for (let i = 0; i < numPoints; i++) {
      const z = -zSpan / 2 + (i / (numPoints - 1)) * zSpan;
      const phase = k * z - t;

      if (polarization === 'linear') {
        // Linear: E on Y, B on X
        const ey = Math.sin(phase) * amplitude * 1.2;
        const bx = Math.sin(phase) * amplitude * 1.2;
        pointsE[i].set(0, ey, z);
        pointsB[i].set(bx, 0, z);
      } else {
        // Circular Polarization: E rotates in XY, B rotates 90 deg out of phase
        const ex = Math.cos(phase) * amplitude * 1.0;
        const ey = Math.sin(phase) * amplitude * 1.0;
        const bx = -Math.sin(phase) * amplitude * 1.0;
        const by = Math.cos(phase) * amplitude * 1.0;
        pointsE[i].set(ex, ey, z);
        pointsB[i].set(bx, by, z);
      }
    }

    if (lineERef.current) {
      lineERef.current.geometry.setFromPoints(pointsE);
      lineERef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (lineBRef.current) {
      lineBRef.current.geometry.setFromPoints(pointsB);
      lineBRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Propagation Z-Axis Guide Rod */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, zSpan + 1.5, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>

      {/* Poynting Vector Arrow (Propagation Direction) */}
      <mesh position={[0, 0, zSpan / 2 + 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.5, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1} />
      </mesh>
      <Html position={[0, 0.4, zSpan / 2 + 0.9]} center distanceFactor={10}>
        <div className="bg-amber-950/80 text-amber-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500/50 whitespace-nowrap">
          متجه بوينتنج S⃗ (سرعة الضوء c)
        </div>
      </Html>

      {/* Electric Field (E) 3D Line */}
      <line ref={lineERef as any}>
        <bufferGeometry />
        <lineBasicMaterial color={colors.e} linewidth={3} />
      </line>

      {/* Magnetic Field (B) 3D Line */}
      <line ref={lineBRef as any}>
        <bufferGeometry />
        <lineBasicMaterial color={colors.b} linewidth={3} />
      </line>

      {/* Sample E and B Vector Combs */}
      {Array.from({ length: 11 }, (_, i) => {
        const z = -zSpan / 2 + (i / 10) * zSpan;
        return (
          <group key={`comb-${i}`} position={[0, 0, z]}>
            {/* Center node */}
            <mesh>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      })}

      {/* In-scene Orthogonal Labels */}
      <Html position={[0, amplitude * 1.5, -zSpan / 3]} center distanceFactor={12}>
        <div className="bg-emerald-950/90 text-emerald-300 font-mono text-xs px-2 py-0.5 rounded border border-emerald-500/60 shadow-md">
          المجال الكهربائي E⃗
        </div>
      </Html>
      <Html position={[amplitude * 1.5, 0, -zSpan / 3]} center distanceFactor={12}>
        <div className="bg-purple-950/90 text-purple-300 font-mono text-xs px-2 py-0.5 rounded border border-purple-500/60 shadow-md">
          المجال المغناطيسي B⃗
        </div>
      </Html>
    </group>
  );
};

export const WaveVisualization: React.FC<WaveVisualizationProps> = ({
  frequency,
  amplitude,
  waveType,
  polarization = 'linear',
}) => {
  return (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
      <Canvas camera={{ position: [3.5, 2.5, 7.0], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -5, -6]} intensity={0.6} color="#3b82f6" />
        <directionalLight position={[0, 8, 4]} intensity={0.8} />

        <Float speed={0.4} rotationIntensity={0.02} floatIntensity={0.03}>
          <MaxwellWave3D
            frequency={frequency}
            amplitude={amplitude}
            waveType={waveType}
            polarization={polarization}
          />
        </Float>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>

      {/* Speed of light indicator overlay */}
      <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-md flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-xs text-slate-300 font-mono">
          c = 299,792,458 m/s
        </span>
      </div>
    </div>
  );
};

export default WaveVisualization;
