import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface ChemicalBottle3DProps {
  position: [number, number, number];
  chemicalColor: string;
  label: string;
  formula: string;
  dangerLevel: 'safe' | 'caution' | 'danger';
}

export const ChemicalBottle3D = ({ 
  position, 
  chemicalColor,
  label,
  formula,
  dangerLevel
}: ChemicalBottle3DProps) => {
  const labelColor = dangerLevel === 'danger' ? '#ff0000' : 
                     dangerLevel === 'caution' ? '#ff9800' : '#4caf50';

  return (
    <group position={position}>
      {/* Bottle body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.8, 32]} />
        <meshPhysicalMaterial
          color={chemicalColor}
          transparent
          opacity={0.6}
          roughness={0.2}
          metalness={0.0}
          transmission={0.7}
          thickness={0.5}
        />
      </mesh>

      {/* Bottle neck */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.2, 32]} />
        <meshPhysicalMaterial
          color="#dddddd"
          transparent
          opacity={0.5}
          roughness={0.2}
          transmission={0.8}
        />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 32]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Label background */}
      <mesh position={[0, 0, 0.16]}>
        <planeGeometry args={[0.28, 0.5]} />
        <meshStandardMaterial 
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Chemical name */}
      <Text
        position={[0, 0.15, 0.17]}
        fontSize={0.06}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.25}
      >
        {label}
      </Text>

      {/* Formula */}
      <Text
        position={[0, 0.05, 0.17]}
        fontSize={0.08}
        color="#1a1a1a"
        anchorX="center"
        anchorY="middle"
        font="bold"
      >
        {formula}
      </Text>

      {/* Danger indicator */}
      <mesh position={[0, -0.15, 0.17]}>
        <circleGeometry args={[0.05, 32]} />
        <meshBasicMaterial color={labelColor} />
      </mesh>

      {/* Warning symbol */}
      {dangerLevel !== 'safe' && (
        <Text
          position={[0, -0.15, 0.18]}
          fontSize={0.06}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          !
        </Text>
      )}
    </group>
  );
};
