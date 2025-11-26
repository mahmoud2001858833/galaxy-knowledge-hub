import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface Beaker3DProps {
  position: [number, number, number];
  liquidColor?: string;
  liquidLevel?: number;
  temperature?: number;
  showBubbles?: boolean;
  showSteam?: boolean;
  label?: string;
}

export const Beaker3D = ({ 
  position, 
  liquidColor = '#e0f7fa', 
  liquidLevel = 0,
  temperature = 25,
  showBubbles = false,
  showSteam = false,
  label
}: Beaker3DProps) => {
  const liquidRef = useRef<THREE.Mesh>(null);
  const bubblesRef = useRef<THREE.Group>(null);
  const steamRef = useRef<THREE.Group>(null);

  const bubbles = useMemo(() => {
    if (!showBubbles) return [];
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      offset: Math.random() * Math.PI * 2,
      radius: 0.3 + Math.random() * 0.2,
      speed: 0.5 + Math.random() * 0.5
    }));
  }, [showBubbles]);

  const steamParticles = useMemo(() => {
    if (!showSteam) return [];
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      offset: Math.random() * Math.PI * 2,
      radius: 0.4 + Math.random() * 0.3,
      speed: 0.3 + Math.random() * 0.4
    }));
  }, [showSteam]);

  useFrame((state) => {
    // Liquid surface animation
    if (liquidRef.current && liquidLevel > 0) {
      const time = state.clock.elapsedTime;
      liquidRef.current.position.y = Math.sin(time * 2) * 0.02;
    }

    // Bubbles animation
    if (bubblesRef.current && showBubbles) {
      bubblesRef.current.children.forEach((bubble, i) => {
        const data = bubbles[i];
        if (data) {
          const time = state.clock.elapsedTime;
          bubble.position.y = (time * data.speed + data.offset) % 1.5 - 0.5;
          bubble.position.x = Math.sin(time + data.offset) * 0.2;
          bubble.scale.setScalar(0.8 + Math.sin(time * 2 + data.offset) * 0.2);
        }
      });
    }

    // Steam animation
    if (steamRef.current && showSteam) {
      steamRef.current.children.forEach((particle, i) => {
        const data = steamParticles[i];
        if (data) {
          const time = state.clock.elapsedTime;
          particle.position.y = (time * data.speed) % 2;
          particle.position.x = Math.sin(time + data.offset) * data.radius;
          particle.position.z = Math.cos(time + data.offset) * data.radius;
          const fadeOut = 1 - (particle.position.y / 2);
          (particle as THREE.Mesh).material = new THREE.MeshBasicMaterial({
            color: '#ffffff',
            transparent: true,
            opacity: fadeOut * 0.5
          });
        }
      });
    }
  });

  const glowIntensity = temperature > 80 ? (temperature - 80) / 100 : 0;

  return (
    <group position={position}>
      {/* Beaker glass */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.5, 2, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.0}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>

      {/* Beaker base */}
      <mesh position={[0, -1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.0}
          transmission={0.8}
        />
      </mesh>

      {/* Liquid */}
      {liquidLevel > 0 && (
        <mesh 
          ref={liquidRef}
          position={[0, -1 + (liquidLevel / 100) * 1.8, 0]} 
          castShadow
        >
          <cylinderGeometry args={[0.58, 0.48, (liquidLevel / 100) * 2, 32]} />
          <meshPhysicalMaterial
            color={liquidColor}
            transparent
            opacity={0.7}
            roughness={0.2}
            metalness={0.1}
            emissive={glowIntensity > 0 ? '#ff6600' : '#000000'}
            emissiveIntensity={glowIntensity}
          />
        </mesh>
      )}

      {/* Measurement marks */}
      {[25, 50, 75, 100].map((mark) => (
        <Text
          key={mark}
          position={[0.65, -1 + (mark / 100) * 1.8, 0]}
          fontSize={0.1}
          color="#333333"
          anchorX="left"
        >
          {mark}ml
        </Text>
      ))}

      {/* Bubbles */}
      {showBubbles && liquidLevel > 0 && (
        <group ref={bubblesRef} position={[0, -0.5, 0]}>
          {bubbles.map((bubble) => (
            <mesh key={bubble.id}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Steam */}
      {showSteam && (
        <group ref={steamRef} position={[0, 1.2, 0]}>
          {steamParticles.map((particle) => (
            <mesh key={particle.id}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.4}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Label */}
      {label && (
        <Text
          position={[0, -1.3, 0]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {label}
        </Text>
      )}
    </group>
  );
};
