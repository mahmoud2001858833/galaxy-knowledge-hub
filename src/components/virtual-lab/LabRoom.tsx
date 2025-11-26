import { useRef } from 'react';
import * as THREE from 'three';

export const LabRoom = () => {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -3.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial 
          color="#f0f0f0"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Floor tiles pattern */}
      {Array.from({ length: 20 }, (_, i) =>
        Array.from({ length: 20 }, (_, j) => (
          <mesh
            key={`tile-${i}-${j}`}
            position={[-19 + i * 2, -3.19, -19 + j * 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[1.9, 1.9]} />
            <meshStandardMaterial 
              color={(i + j) % 2 === 0 ? '#e8e8e8' : '#f5f5f5'}
              roughness={0.7}
            />
          </mesh>
        ))
      )}

      {/* Back Wall */}
      <mesh position={[0, 5, -20]} receiveShadow>
        <planeGeometry args={[40, 16]} />
        <meshStandardMaterial 
          color="#d0d8e0"
          roughness={0.9}
        />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-20, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[40, 16]} />
        <meshStandardMaterial 
          color="#d5dce5"
          roughness={0.9}
        />
      </mesh>

      {/* Right Wall */}
      <mesh position={[20, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[40, 16]} />
        <meshStandardMaterial 
          color="#d5dce5"
          roughness={0.9}
        />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 13, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial 
          color="#ffffff"
          roughness={0.6}
        />
      </mesh>

      {/* Ceiling lights */}
      {[-10, 0, 10].map((x) =>
        [-10, 0, 10].map((z) => (
          <group key={`light-${x}-${z}`} position={[x, 12.5, z]}>
            <mesh>
              <boxGeometry args={[2, 0.2, 2]} />
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.8}
              />
            </mesh>
            <pointLight 
              color="#ffffff" 
              intensity={1.5}
              distance={15}
              castShadow
            />
          </group>
        ))
      )}

      {/* Window on back wall */}
      <mesh position={[-8, 8, -19.9]} receiveShadow>
        <planeGeometry args={[4, 3]} />
        <meshPhysicalMaterial 
          color="#87ceeb"
          transparent
          opacity={0.6}
          transmission={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Window frame */}
      <mesh position={[-8, 8, -19.95]}>
        <boxGeometry args={[4.2, 3.2, 0.1]} />
        <meshStandardMaterial 
          color="#2c3e50"
          roughness={0.5}
        />
      </mesh>

      {/* Door on left wall */}
      <mesh position={[-19.9, 2, 15]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.5, 4]} />
        <meshStandardMaterial 
          color="#5a4a3a"
          roughness={0.6}
        />
      </mesh>

      {/* Door frame */}
      <mesh position={[-19.95, 2, 15]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.7, 4.2, 0.1]} />
        <meshStandardMaterial 
          color="#3a2a1a"
          roughness={0.5}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[-19.85, 2, 14]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
        <meshStandardMaterial 
          color="#C0C0C0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Baseboard on walls */}
      <mesh position={[0, -2.5, -20]} receiveShadow>
        <boxGeometry args={[40, 0.4, 0.2]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>

      <mesh position={[-20, -2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[40, 0.4, 0.2]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>

      <mesh position={[20, -2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[40, 0.4, 0.2]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
    </group>
  );
};