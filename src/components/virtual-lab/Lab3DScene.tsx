import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { LabRoom } from './LabRoom';
import { LabBench } from './LabBench';
import { Beaker3D } from './Beaker3D';
import { BunsenBurner3D } from './BunsenBurner3D';
import { ChemicalBottle3D } from './ChemicalBottle3D';
import { ChemicalCabinet3D } from './ChemicalCabinet3D';
import { EquipmentCabinet3D } from './EquipmentCabinet3D';
import { Oven3D } from './Oven3D';
import { PressureMachine3D } from './PressureMachine3D';
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
    <div className="w-full h-[700px] rounded-lg overflow-hidden border-2 border-primary/20 shadow-2xl bg-gradient-to-b from-gray-900 to-gray-800">
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 18]} fov={60} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2.2}
            target={[0, 0, 0]}
            enableDamping
            dampingFactor={0.05}
            rotateSpeed={0.8}
            zoomSpeed={1.2}
          />

          {/* Advanced Lighting */}
          <ambientLight intensity={0.4} />
          
          {/* Main directional light (sun) */}
          <directionalLight 
            position={[10, 15, 10]} 
            intensity={1.2}
            castShadow
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
          />
          
          {/* Fill lights */}
          <pointLight position={[-10, 8, -10]} intensity={0.4} color="#a0c0ff" />
          <pointLight position={[10, 8, -10]} intensity={0.4} color="#ffa0a0" />
          <pointLight position={[0, 8, 10]} intensity={0.3} color="#ffffff" />
          
          {/* Spotlights for work area */}
          <spotLight 
            position={[0, 12, 0]} 
            angle={0.4} 
            penumbra={0.8} 
            intensity={1.5}
            castShadow
          />
          
          <spotLight 
            position={[-8, 10, -8]} 
            angle={0.5} 
            penumbra={1} 
            intensity={0.8}
            castShadow
          />

          {/* Environment */}
          <Environment preset="city" />
          
          {/* Lab Room */}
          <LabRoom />
          
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

          {/* Chemical Cabinet (left wall) */}
          <ChemicalCabinet3D position={[-15, 0, -5]} />

          {/* Equipment Cabinet (right wall) */}
          <EquipmentCabinet3D position={[15, 0, -5]} />

          {/* Oven (back left corner) */}
          <Oven3D 
            position={[-10, -1.5, -15]} 
            isOn={temperature > 100}
            temperature={temperature}
          />

          {/* Pressure Machine (back right corner) */}
          <PressureMachine3D 
            position={[10, -1.5, -15]} 
            pressure={1.0}
            isActive={burnerOn}
          />

          {/* Chemical Bottles on Bench */}
          {selectedChemicals.slice(0, 4).map((chemical, index) => (
            <ChemicalBottle3D
              key={chemical.id}
              position={[
                -4 + index * 1.8, 
                0.8, 
                -2
              ]}
              chemicalColor={chemical.color}
              label={chemical.nameAr}
              formula={chemical.formula}
              dangerLevel={chemical.danger_level}
            />
          ))}

          {/* Test Tubes Rack on Bench */}
          <group position={[5, 0.3, -1]}>
            {/* Test tube rack base */}
            <mesh castShadow>
              <boxGeometry args={[1.5, 0.1, 0.5]} />
              <meshStandardMaterial color="#8B7355" />
            </mesh>
            
            {/* Test tube holders */}
            {[0, 1, 2, 3].map((i) => (
              <group key={i} position={[-0.6 + i * 0.4, 0, 0]}>
                <mesh position={[0, 0.1, 0]} castShadow>
                  <cylinderGeometry args={[0.06, 0.06, 0.15, 16]} />
                  <meshStandardMaterial color="#654321" />
                </mesh>
                <TestTube3D 
                  position={[0, 0.3, 0]} 
                  liquidLevel={i === 0 ? 30 : 0}
                  liquidColor={i === 0 ? '#4682b4' : '#e0f7fa'}
                />
              </group>
            ))}
          </group>

          {/* Safety equipment on wall */}
          <group position={[-18, 2, 8]}>
            {/* Fire extinguisher */}
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 1, 16]} />
              <meshStandardMaterial color="#ff0000" metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.6, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
              <meshStandardMaterial color="#2c2c2c" />
            </mesh>
          </group>

          {/* Safety shower on wall */}
          <group position={[18, 4, 8]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.08, 2, 16]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.9} />
            </mesh>
            <mesh position={[0, 1.2, 0]} castShadow>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshStandardMaterial color="#4682b4" />
            </mesh>
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};
