import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, TorusKnot, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const RotatingKnot: React.FC<{ color: string }> = ({ color }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.25;
      ref.current.rotation.y += delta * 0.35;
    }
  });
  return (
    <TorusKnot ref={ref} args={[0.85, 0.27, 180, 24]} position={[0, 0, 0]}>
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.18} emissive={color} emissiveIntensity={0.35} />
    </TorusKnot>
  );
};

const InnerSphere: React.FC<{ color: string }> = ({ color }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });
  return (
    <Sphere ref={ref} args={[1.55, 64, 64]}>
      <MeshDistortMaterial color={color} distort={0.32} speed={1.6} roughness={0.25} metalness={0.4} transparent opacity={0.18} />
    </Sphere>
  );
};

const DamijLogo3D: React.FC<{ size?: number }> = ({ size = 280 }) => {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(var(--damij-primary))]/25 via-transparent to-[hsl(var(--damij-accent-2))]/25 blur-2xl pointer-events-none" />
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 5]} intensity={1.2} />
        <pointLight position={[-3, -2, 2]} intensity={0.6} color="#a78bfa" />
        <Suspense fallback={null}>
          <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.9}>
            <InnerSphere color="#7c3aed" />
            <RotatingKnot color="#06b6d4" />
          </Float>
          <Sparkles count={40} scale={4.5} size={2.5} speed={0.4} color="#a78bfa" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default DamijLogo3D;
