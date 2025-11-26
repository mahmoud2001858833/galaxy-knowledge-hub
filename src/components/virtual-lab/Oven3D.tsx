import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface Oven3DProps {
  position: [number, number, number];
  isOn?: boolean;
  temperature?: number;
}

export const Oven3D = ({ 
  position, 
  isOn = false,
  temperature = 25
}: Oven3DProps) => {
  const glowRef = useRef<THREE.Mesh>(null);
  const displayRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glowRef.current && isOn) {
      const time = state.clock.elapsedTime;
      const intensity = 0.8 + Math.sin(time * 2) * 0.2;
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    }
  });

  const glowColor = temperature > 300 ? '#ff4400' : 
                    temperature > 150 ? '#ff8800' : 
                    '#ffaa00';

  return (
    <group position={position}>
      {/* Oven body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 2.5, 1.5]} />
        <meshStandardMaterial 
          color="#e8e8e8"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Control panel top */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[2, 0.4, 1.5]} />
        <meshStandardMaterial 
          color="#2c2c2c"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Oven door */}
      <mesh position={[0, -0.2, 0.76]} castShadow>
        <boxGeometry args={[1.8, 2, 0.1]} />
        <meshStandardMaterial 
          color="#4a4a4a"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Door window */}
      <mesh position={[0, 0.2, 0.82]}>
        <planeGeometry args={[1.4, 1.2]} />
        <meshPhysicalMaterial 
          color={isOn ? glowColor : '#333333'}
          transparent
          opacity={0.6}
          transmission={0.5}
          emissive={isOn ? glowColor : '#000000'}
          emissiveIntensity={isOn ? 0.5 : 0}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[0, -1.2, 0.82]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 16]} />
        <meshStandardMaterial 
          color="#C0C0C0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Control knobs */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <mesh 
          key={i} 
          position={[x, 1.5, 0.8]} 
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
      ))}

      {/* Digital display */}
      <mesh 
        ref={displayRef}
        position={[0, 1.5, 0.76]} 
        castShadow
      >
        <planeGeometry args={[0.8, 0.25]} />
        <meshStandardMaterial 
          color="#000000"
          emissive={isOn ? '#00ff00' : '#003300'}
          emissiveIntensity={isOn ? 0.8 : 0.2}
        />
      </mesh>

      {/* Temperature display text */}
      {isOn && (
        <Text
          position={[0, 1.5, 0.77]}
          fontSize={0.15}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(temperature)}°C
        </Text>
      )}

      {/* Interior glow when on */}
      {isOn && (
        <mesh ref={glowRef} position={[0, 0, 0.5]}>
          <boxGeometry args={[1.6, 1.8, 0.1]} />
          <meshStandardMaterial 
            color={glowColor}
            emissive={glowColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      {/* Point light inside when on */}
      {isOn && (
        <pointLight 
          position={[0, 0, 0.5]}
          color={glowColor}
          intensity={temperature / 100}
          distance={3}
        />
      )}

      {/* Oven base/legs */}
      {[-0.8, 0.8].map((x) =>
        [-0.6, 0.6].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -1.5, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
            <meshStandardMaterial 
              color="#2c2c2c"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))
      )}

      {/* Label */}
      <Text
        position={[0, -1.7, 0]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        الفرن الكهربائي
      </Text>
    </group>
  );
};