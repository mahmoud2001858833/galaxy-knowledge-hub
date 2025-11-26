import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface PressureMachine3DProps {
  position: [number, number, number];
  pressure?: number;
  isActive?: boolean;
}

export const PressureMachine3D = ({ 
  position, 
  pressure = 1.0,
  isActive = false
}: PressureMachine3DProps) => {
  const gaugeNeedleRef = useRef<THREE.Group>(null);
  const pistonRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (gaugeNeedleRef.current) {
      const targetRotation = -Math.PI / 2 + (pressure / 10) * Math.PI;
      gaugeNeedleRef.current.rotation.z = THREE.MathUtils.lerp(
        gaugeNeedleRef.current.rotation.z,
        targetRotation,
        0.1
      );
    }

    if (pistonRef.current && isActive) {
      const time = state.clock.elapsedTime;
      pistonRef.current.position.y = Math.sin(time * 3) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Base platform */}
      <mesh position={[0, -1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.2, 2]} />
        <meshStandardMaterial 
          color="#2c3e50"
          roughness={0.5}
          metalness={0.7}
        />
      </mesh>

      {/* Main cylinder body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 2, 32]} />
        <meshStandardMaterial 
          color="#34495e"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Piston inside */}
      <mesh ref={pistonRef} position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.3, 32]} />
        <meshStandardMaterial 
          color="#7f8c8d"
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.3, 32]} />
        <meshStandardMaterial 
          color="#2c3e50"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Pressure gauge */}
      <group position={[0.8, 0.5, 0]} rotation={[0, 0, 0]}>
        {/* Gauge body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.15, 32]} />
          <meshStandardMaterial 
            color="#ecf0f1"
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>

        {/* Gauge face */}
        <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.32, 32]} />
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.2}
          />
        </mesh>

        {/* Gauge markings */}
        {Array.from({ length: 11 }, (_, i) => {
          const angle = -Math.PI / 2 + (i / 10) * Math.PI;
          const x = Math.cos(angle) * 0.25;
          const y = Math.sin(angle) * 0.25;
          return (
            <mesh 
              key={i} 
              position={[x, y, 0.09]} 
              rotation={[Math.PI / 2, 0, angle]}
            >
              <boxGeometry args={[0.02, 0.001, 0.08]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
          );
        })}

        {/* Gauge needle */}
        <group ref={gaugeNeedleRef} position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
          <mesh>
            <boxGeometry args={[0.25, 0.001, 0.03]} />
            <meshStandardMaterial 
              color="#e74c3c"
              emissive="#e74c3c"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Needle center */}
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.002, 16]} />
            <meshStandardMaterial color="#2c3e50" />
          </mesh>
        </group>

        {/* Gauge glass */}
        <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.33, 32]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transparent
            opacity={0.3}
            transmission={0.9}
            roughness={0.05}
          />
        </mesh>
      </group>

      {/* Connecting pipe to gauge */}
      <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.8, 16]} />
        <meshStandardMaterial 
          color="#7f8c8d"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Control valve */}
      <mesh position={[-0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
        <meshStandardMaterial 
          color="#e67e22"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Valve handle */}
      <mesh position={[-0.8, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
        <meshStandardMaterial 
          color="#2c3e50"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Bottom connection pipes */}
      <mesh position={[0, -0.8, 0.6]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.8, 16]} />
        <meshStandardMaterial 
          color="#7f8c8d"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Status indicator light */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={isActive ? '#00ff00' : '#ff0000'}
          emissive={isActive ? '#00ff00' : '#ff0000'}
          emissiveIntensity={isActive ? 1 : 0.5}
        />
      </mesh>

      {/* Digital pressure display */}
      <mesh position={[0, -0.5, 0.61]} castShadow>
        <planeGeometry args={[0.6, 0.2]} />
        <meshStandardMaterial 
          color="#000000"
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>

      <Text
        position={[0, -0.5, 0.62]}
        fontSize={0.12}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
      >
        {pressure.toFixed(2)} atm
      </Text>

      {/* Label */}
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        جهاز الضغط
      </Text>
    </group>
  );
};