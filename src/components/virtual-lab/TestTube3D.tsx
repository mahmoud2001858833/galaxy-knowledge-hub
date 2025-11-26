import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TestTube3DProps {
  position: [number, number, number];
  liquidColor?: string;
  liquidLevel?: number;
  tiltAngle?: number;
}

export const TestTube3D = ({ 
  position, 
  liquidColor = '#e0f7fa',
  liquidLevel = 0,
  tiltAngle = 0
}: TestTube3DProps) => {
  const tubeRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (liquidRef.current && liquidLevel > 0) {
      const time = state.clock.elapsedTime;
      liquidRef.current.position.y = Math.sin(time * 2) * 0.01;
    }
  });

  return (
    <group ref={tubeRef} position={position} rotation={[0, 0, tiltAngle]}>
      {/* Test tube body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.5, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.0}
          transmission={0.9}
          thickness={0.3}
        />
      </mesh>

      {/* Test tube bottom (rounded) */}
      <mesh position={[0, -0.75, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.0}
          transmission={0.85}
        />
      </mesh>

      {/* Liquid */}
      {liquidLevel > 0 && (
        <>
          <mesh 
            ref={liquidRef}
            position={[0, -0.75 + (liquidLevel / 100) * 0.7, 0]} 
            castShadow
          >
            <cylinderGeometry args={[0.14, 0.14, (liquidLevel / 100) * 1.4, 32]} />
            <meshPhysicalMaterial
              color={liquidColor}
              transparent
              opacity={0.7}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>

          {/* Liquid bottom (rounded) */}
          <mesh position={[0, -0.75, 0]} castShadow>
            <sphereGeometry args={[0.14, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial
              color={liquidColor}
              transparent
              opacity={0.75}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        </>
      )}

      {/* Test tube rim */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <torusGeometry args={[0.15, 0.02, 16, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.5}
          roughness={0.1}
          transmission={0.8}
        />
      </mesh>
    </group>
  );
};
