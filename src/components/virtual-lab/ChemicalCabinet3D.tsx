import { Text } from '@react-three/drei';
import { CHEMICALS } from '@/data/virtual-lab-data';

interface ChemicalCabinet3DProps {
  position: [number, number, number];
  onSelectChemical?: (chemicalId: string) => void;
}

export const ChemicalCabinet3D = ({ position, onSelectChemical }: ChemicalCabinet3DProps) => {
  return (
    <group position={position}>
      {/* Cabinet body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5, 6, 1.5]} />
        <meshStandardMaterial 
          color="#8B7355"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Cabinet doors */}
      <mesh position={[-1.3, 0, 0.76]} castShadow>
        <boxGeometry args={[2.3, 5.8, 0.1]} />
        <meshStandardMaterial 
          color="#654321"
          roughness={0.5}
        />
      </mesh>

      <mesh position={[1.3, 0, 0.76]} castShadow>
        <boxGeometry args={[2.3, 5.8, 0.1]} />
        <meshStandardMaterial 
          color="#654321"
          roughness={0.5}
        />
      </mesh>

      {/* Door handles */}
      <mesh position={[-0.5, 0, 0.82]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} />
        <meshStandardMaterial 
          color="#C0C0C0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[0.5, 0, 0.82]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 16]} />
        <meshStandardMaterial 
          color="#C0C0C0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Shelves inside (visible through glass) */}
      {[-1.5, 0, 1.5].map((y) => (
        <mesh key={y} position={[0, y, 0.5]} castShadow>
          <boxGeometry args={[4.8, 0.1, 1.4]} />
          <meshStandardMaterial 
            color="#A0826D"
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* Glass panels on doors */}
      <mesh position={[-1.3, 1, 0.82]}>
        <planeGeometry args={[1.8, 3]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.3}
          transmission={0.8}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[1.3, 1, 0.82]}>
        <planeGeometry args={[1.8, 3]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transparent
          opacity={0.3}
          transmission={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Cabinet top */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[5.2, 0.3, 1.7]} />
        <meshStandardMaterial 
          color="#654321"
          roughness={0.5}
        />
      </mesh>

      {/* Cabinet bottom/base */}
      <mesh position={[0, -3.2, 0]} castShadow>
        <boxGeometry args={[5.2, 0.3, 1.7]} />
        <meshStandardMaterial 
          color="#654321"
          roughness={0.5}
        />
      </mesh>

      {/* Label on cabinet */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        المواد الكيميائية
      </Text>

      {/* Chemical bottles on shelves (sample display) */}
      {CHEMICALS.slice(0, 12).map((chemical, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const x = -1.5 + col * 1;
        const y = 1.5 - row * 1.5;
        const z = 0.5;

        return (
          <group key={chemical.id} position={[x, y, z]}>
            {/* Small bottle */}
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.07, 0.4, 16]} />
              <meshPhysicalMaterial
                color={chemical.color}
                transparent
                opacity={0.7}
                transmission={0.6}
              />
            </mesh>

            {/* Bottle cap */}
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
        );
      })}

      {/* Cabinet legs */}
      {[-2, 2].map((x) => (
        <mesh key={x} position={[x, -3.8, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}
    </group>
  );
};