import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BunsenBurner3DProps {
  position: [number, number, number];
  isOn?: boolean;
  flameIntensity?: number;
}

export const BunsenBurner3D = ({ 
  position, 
  isOn = false,
  flameIntensity = 0.5 
}: BunsenBurner3DProps) => {
  const flameRef = useRef<THREE.Group>(null);
  const innerFlameRef = useRef<THREE.Mesh>(null);
  const outerFlameRef = useRef<THREE.Mesh>(null);

  const flameParticles = useMemo(() => {
    if (!isOn) return [];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      offset: Math.random() * Math.PI * 2,
      radius: 0.1 + Math.random() * 0.15,
      speed: 0.5 + Math.random() * 1.0,
      height: Math.random() * 0.5
    }));
  }, [isOn]);

  useFrame((state) => {
    if (!isOn || !flameRef.current) return;

    const time = state.clock.elapsedTime;

    // Flame flickering
    if (innerFlameRef.current) {
      const flicker = Math.sin(time * 10) * 0.1 + Math.cos(time * 7) * 0.05;
      innerFlameRef.current.scale.y = 1 + flicker * flameIntensity;
      innerFlameRef.current.scale.x = 1 - flicker * 0.5 * flameIntensity;
      innerFlameRef.current.scale.z = 1 - flicker * 0.5 * flameIntensity;
    }

    if (outerFlameRef.current) {
      const flicker = Math.sin(time * 8 + 1) * 0.12 + Math.cos(time * 6) * 0.06;
      outerFlameRef.current.scale.y = 1 + flicker * flameIntensity;
      outerFlameRef.current.scale.x = 1 - flicker * 0.3 * flameIntensity;
      outerFlameRef.current.scale.z = 1 - flicker * 0.3 * flameIntensity;
    }

    // Flame particles
    flameRef.current.children.forEach((particle, i) => {
      if (i < 2) return; // Skip inner and outer flame
      const data = flameParticles[i - 2];
      if (data) {
        particle.position.y = ((time * data.speed) % 1) * 0.8 + data.height;
        particle.position.x = Math.sin(time * 2 + data.offset) * data.radius * (1 - particle.position.y / 1.3);
        particle.position.z = Math.cos(time * 2 + data.offset) * data.radius * (1 - particle.position.y / 1.3);
        
        const fadeOut = 1 - (particle.position.y / 1.3);
        (particle as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          color: particle.position.y > 0.5 ? '#ff6600' : '#ffaa00',
          transparent: true,
          opacity: fadeOut * 0.8
        });
      }
    });
  });

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, -1.8, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.1, 32]} />
        <meshStandardMaterial 
          color="#2c2c2c"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Stand rod */}
      <mesh position={[0, -1.3, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.8, 16]} />
        <meshStandardMaterial 
          color="#2c2c2c"
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Burner base */}
      <mesh position={[0, -0.9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.18, 0.3, 32]} />
        <meshStandardMaterial 
          color="#4a4a4a"
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>

      {/* Gas tube */}
      <mesh position={[0, -1.0, 0.2]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 16]} />
        <meshStandardMaterial 
          color="#666666"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Burner top */}
      <mesh position={[0, -0.7, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.15, 32]} />
        <meshStandardMaterial 
          color="#5a5a5a"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Air holes */}
      <mesh position={[0, -0.75, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.05, 32]} />
        <meshStandardMaterial 
          color="#3a3a3a"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Flame */}
      {isOn && (
        <group ref={flameRef} position={[0, -0.5, 0]}>
          {/* Outer flame (orange) */}
          <mesh ref={outerFlameRef} castShadow>
            <coneGeometry args={[0.15 * flameIntensity, 0.6 * flameIntensity, 8]} />
            <meshBasicMaterial
              color="#ff6600"
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Inner flame (blue) */}
          <mesh ref={innerFlameRef} position={[0, 0.1, 0]} castShadow>
            <coneGeometry args={[0.08 * flameIntensity, 0.4 * flameIntensity, 8]} />
            <meshBasicMaterial
              color="#4444ff"
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Flame particles */}
          {flameParticles.map((particle) => (
            <mesh key={particle.id}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial
                color="#ffaa00"
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}

          {/* Glow */}
          <pointLight 
            position={[0, 0.2, 0]} 
            color="#ff6600" 
            intensity={flameIntensity * 2}
            distance={2}
          />
        </group>
      )}

      {/* Control knob */}
      <mesh position={[0.2, -0.9, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <meshStandardMaterial 
          color="#808080"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};
