import { useRef } from 'react';
import { Sphere, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Atom3DProps {
  position: [number, number, number];
  color: string;
  symbol: string;
  element: string;
  size?: number;
  showLabel?: boolean;
  glowIntensity?: number;
}

export const Atom3D = ({ 
  position, 
  color, 
  symbol, 
  element,
  size = 0.4,
  showLabel = true,
  glowIntensity = 0.5
}: Atom3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      {/* Glow effect */}
      <Sphere ref={glowRef} args={[size * 1.3, 16, 16]}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={glowIntensity * 0.3}
        />
      </Sphere>
      
      {/* Main atom sphere */}
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* Label */}
      {showLabel && (
        <Html
          center
          distanceFactor={8}
          style={{
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            textShadow: '0 0 4px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {symbol}
        </Html>
      )}
    </group>
  );
};
