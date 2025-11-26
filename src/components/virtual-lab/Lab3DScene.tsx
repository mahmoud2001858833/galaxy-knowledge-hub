import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { LabBench } from './LabBench';
import { Beaker3D } from './Beaker3D';
import { BunsenBurner3D } from './BunsenBurner3D';
import { ChemicalBottle3D } from './ChemicalBottle3D';
import { TestTube3D } from './TestTube3D';
import { Chemical } from '@/data/virtual-lab-data';

interface Lab3DSceneProps {
  selectedChemicals: Chemical[];
  mixedColor: string;
  liquidLevel: number;
  temperature: number;
  showBubbles: boolean;
  showSteam: boolean;
  burnerOn: boolean;
  flameIntensity: number;
}

export const Lab3DScene = ({
  selectedChemicals,
  mixedColor,
  liquidLevel,
  temperature,
  showBubbles,
  showSteam,
  burnerOn,
  flameIntensity
}: Lab3DSceneProps) => {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border-2 border-primary/20 shadow-2xl">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2}
          />

          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          <spotLight 
            position={[0, 8, 0]} 
            angle={0.6} 
            penumbra={1} 
            intensity={0.8}
            castShadow
          />

          {/* Environment */}
          <Environment preset="apartment" />
          
          {/* Lab Setup */}
          <LabBench />
          
          {/* Main Beaker */}
          <Beaker3D 
            position={[0, 0.2, 0]}
            liquidColor={mixedColor}
            liquidLevel={liquidLevel}
            temperature={temperature}
            showBubbles={showBubbles}
            showSteam={showSteam}
            label="البيكر الرئيسي"
          />

          {/* Bunsen Burner */}
          <BunsenBurner3D 
            position={[0, -1.8, 0]}
            isOn={burnerOn}
            flameIntensity={flameIntensity}
          />

          {/* Chemical Bottles Display */}
          {selectedChemicals.slice(0, 4).map((chemical, index) => (
            <ChemicalBottle3D
              key={chemical.id}
              position={[
                -4 + index * 1.5, 
                0.5, 
                -2
              ]}
              chemicalColor={chemical.color}
              label={chemical.nameAr}
              formula={chemical.formula}
              dangerLevel={chemical.danger_level}
            />
          ))}

          {/* Test Tubes Rack */}
          <group position={[4, 0, -1]}>
            <TestTube3D position={[0, 0, 0]} liquidLevel={0} />
            <TestTube3D position={[0.4, 0, 0]} liquidLevel={0} />
            <TestTube3D position={[0.8, 0, 0]} liquidLevel={0} />
          </group>

          {/* Background */}
          <mesh position={[0, 0, -5]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#f5f5f5" />
          </mesh>

          {/* Floor shadow plane */}
          <mesh position={[0, -3.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <shadowMaterial opacity={0.3} />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
};
