import { Text } from '@react-three/drei';

interface EquipmentCabinet3DProps {
  position: [number, number, number];
}

export const EquipmentCabinet3D = ({ position }: EquipmentCabinet3DProps) => {
  return (
    <group position={position}>
      {/* Cabinet body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 6, 1.5]} />
        <meshStandardMaterial 
          color="#8B7355"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Glass door */}
      <mesh position={[0, 0, 0.76]} castShadow>
        <boxGeometry args={[3.8, 5.8, 0.1]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.3}
          transmission={0.85}
          roughness={0.05}
        />
      </mesh>

      {/* Door frame */}
      <mesh position={[0, 0, 0.8]} castShadow>
        <boxGeometry args={[4, 6, 0.05]} />
        <meshStandardMaterial 
          color="#654321"
          roughness={0.5}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[1.5, 0, 0.85]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
        <meshStandardMaterial 
          color="#C0C0C0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Shelves */}
      {[-1.8, -0.6, 0.6, 1.8].map((y) => (
        <mesh key={y} position={[0, y, 0.5]} castShadow>
          <boxGeometry args={[3.8, 0.08, 1.4]} />
          <meshStandardMaterial 
            color="#A0826D"
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Equipment on shelves */}
      {/* Beakers on top shelf */}
      <mesh position={[-1.2, 1.9, 0.6]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 16]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.4}
          transmission={0.85}
        />
      </mesh>

      <mesh position={[-0.4, 1.9, 0.6]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 16]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.4}
          transmission={0.85}
        />
      </mesh>

      {/* Test tubes on second shelf */}
      {[-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].map((x) => (
        <mesh key={x} position={[x, 0.7, 0.6]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.25, 16]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transparent
            opacity={0.4}
            transmission={0.85}
          />
        </mesh>
      ))}

      {/* Flasks on third shelf */}
      <mesh position={[-0.8, -0.5, 0.6]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.4}
          transmission={0.85}
        />
      </mesh>

      <mesh position={[0.8, -0.5, 0.6]} castShadow>
        <coneGeometry args={[0.15, 0.3, 16]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.4}
          transmission={0.85}
        />
      </mesh>

      {/* Pipettes and tools on bottom shelf */}
      {[-1, -0.5, 0, 0.5, 1].map((x, i) => (
        <mesh 
          key={x} 
          position={[x, -1.7, 0.6]} 
          rotation={[0, 0, Math.PI / 6]}
          castShadow
        >
          <cylinderGeometry args={[0.02, 0.02, 0.4, 16]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transparent
            opacity={0.4}
            transmission={0.85}
          />
        </mesh>
      ))}

      {/* Cabinet top */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[4.2, 0.3, 1.7]} />
        <meshStandardMaterial 
          color="#654321"
          roughness={0.5}
        />
      </mesh>

      {/* Cabinet bottom */}
      <mesh position={[0, -3.2, 0]} castShadow>
        <boxGeometry args={[4.2, 0.3, 1.7]} />
        <meshStandardMaterial 
          color="#654321"
          roughness={0.5}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        الأدوات المعملية
      </Text>

      {/* Cabinet legs */}
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, -3.8, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}
    </group>
  );
};