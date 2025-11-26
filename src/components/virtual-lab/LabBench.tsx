import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const LabBench = () => {
  const benchRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (benchRef.current) {
      // Subtle ambient movement
      benchRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
    }
  });

  return (
    <group ref={benchRef} position={[0, -2, 0]}>
      {/* Main bench surface */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[12, 0.3, 6]} />
        <meshStandardMaterial 
          color="#8B7355"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Bench legs */}
      <mesh position={[-5.5, -1.5, 2.5]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3, 16]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[5.5, -1.5, 2.5]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3, 16]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[-5.5, -1.5, -2.5]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3, 16]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[5.5, -1.5, -2.5]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 3, 16]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Drawer */}
      <mesh position={[0, -0.5, 2.8]} castShadow>
        <boxGeometry args={[4, 0.6, 0.5]} />
        <meshStandardMaterial 
          color="#6B4423"
          roughness={0.6}
        />
      </mesh>

      {/* Drawer handle */}
      <mesh position={[0, -0.5, 3.1]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1.5, 16]} />
        <meshStandardMaterial 
          color="#C0C0C0"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Sink area */}
      <mesh position={[-4, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.7, 0.3, 32]} />
        <meshStandardMaterial 
          color="#808080"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Faucet */}
      <group position={[-4, 0.4, -0.5]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
          <meshStandardMaterial 
            color="#C0C0C0"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, 0.6, 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 16]} />
          <meshStandardMaterial 
            color="#C0C0C0"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Grid lines for reference */}
      <gridHelper args={[12, 20, '#444444', '#666666']} position={[0, 0.16, 0]} />
    </group>
  );
};
