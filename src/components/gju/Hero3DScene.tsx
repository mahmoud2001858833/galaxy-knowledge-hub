import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, MeshDistortMaterial, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Rotating distorted core ─── */
const Core: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.getElapsedTime() * 0.15;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });
  return (
    <mesh ref={ref}>
      <Icosahedron args={[1.4, 4]}>
        <MeshDistortMaterial
          color="#7c3aed"
          emissive="#06b6d4"
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.9}
          distort={0.35}
          speed={1.5}
        />
      </Icosahedron>
    </mesh>
  );
};

/* ─── Wireframe outer shell ─── */
const Shell: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = -state.clock.getElapsedTime() * 0.08;
    ref.current.rotation.z = state.clock.getElapsedTime() * 0.05;
  });
  return (
    <mesh ref={ref}>
      <Icosahedron args={[2.4, 1]}>
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.18} />
      </Icosahedron>
    </mesh>
  );
};

/* ─── Orbiting tech satellites ─── */
const Satellite: React.FC<{ radius: number; speed: number; offset: number; color: string }> = ({
  radius,
  speed,
  offset,
  color,
}) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = Math.sin(t * 0.7) * 0.4;
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <mesh ref={ref}>
        <Sphere args={[0.12, 16, 16]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </mesh>
    </Float>
  );
};

/* ─── Particle ring ─── */
const ParticleRing: React.FC = () => {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      const angle = (i / 800) * Math.PI * 2;
      const r = 3 + Math.random() * 0.6;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#a78bfa" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
};

/* ─── Scene composition ─── */
const Scene: React.FC = () => {
  const satellites = [
    { radius: 2.2, speed: 0.6, offset: 0, color: '#22d3ee' },
    { radius: 2.2, speed: 0.6, offset: Math.PI * 0.66, color: '#a855f7' },
    { radius: 2.2, speed: 0.6, offset: Math.PI * 1.33, color: '#10b981' },
    { radius: 2.8, speed: -0.4, offset: Math.PI * 0.5, color: '#f59e0b' },
    { radius: 2.8, speed: -0.4, offset: Math.PI * 1.5, color: '#ec4899' },
  ];

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#7c3aed" />
      <pointLight position={[-5, -3, 4]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[0, 5, -5]} intensity={0.6} color="#10b981" />

      <Stars radius={50} depth={30} count={1500} factor={3} fade speed={0.5} />
      <ParticleRing />
      <Shell />
      <Core />
      {satellites.map((s, i) => (
        <Satellite key={i} {...s} />
      ))}
    </>
  );
};

const Hero3DScene: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 55 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      {/* Soft vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#04040e_85%)]" />
    </div>
  );
};

export default Hero3DScene;
