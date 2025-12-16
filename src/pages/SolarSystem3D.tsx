import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, RotateCcw, ZoomIn, ZoomOut, 
  Info, Sun, Moon, Eye, EyeOff, Globe
} from 'lucide-react';

// Planet data with real proportions (scaled for visibility)
const PLANETS = [
  { 
    name: 'Mercury', nameAr: 'عطارد', 
    distance: 4, size: 0.4, color: '#b5b5b5', 
    orbitSpeed: 4.15, rotationSpeed: 0.017,
    info: 'أصغر كواكب المجموعة الشمسية وأقربها للشمس'
  },
  { 
    name: 'Venus', nameAr: 'الزهرة', 
    distance: 6, size: 0.9, color: '#ffd700', 
    orbitSpeed: 1.62, rotationSpeed: -0.004,
    info: 'ألمع كوكب في السماء، يدور بعكس اتجاه الكواكب الأخرى'
  },
  { 
    name: 'Earth', nameAr: 'الأرض', 
    distance: 8, size: 1, color: '#4169e1', 
    orbitSpeed: 1, rotationSpeed: 1,
    info: 'كوكبنا الأم، الكوكب الوحيد المعروف بوجود حياة عليه',
    hasMoon: true
  },
  { 
    name: 'Mars', nameAr: 'المريخ', 
    distance: 10, size: 0.5, color: '#cd5c5c', 
    orbitSpeed: 0.53, rotationSpeed: 0.97,
    info: 'الكوكب الأحمر، يحتوي على أكبر بركان في المجموعة الشمسية'
  },
  { 
    name: 'Jupiter', nameAr: 'المشتري', 
    distance: 14, size: 2.5, color: '#daa520', 
    orbitSpeed: 0.084, rotationSpeed: 2.4,
    info: 'أكبر كواكب المجموعة الشمسية، له 95 قمراً معروفاً',
    hasStripes: true
  },
  { 
    name: 'Saturn', nameAr: 'زحل', 
    distance: 18, size: 2.2, color: '#f4a460', 
    orbitSpeed: 0.034, rotationSpeed: 2.2,
    info: 'يتميز بحلقاته الجميلة المكونة من الجليد والصخور',
    hasRings: true
  },
  { 
    name: 'Uranus', nameAr: 'أورانوس', 
    distance: 22, size: 1.5, color: '#40e0d0', 
    orbitSpeed: 0.012, rotationSpeed: -1.4,
    info: 'يميل محوره بشكل كبير، يبدو وكأنه يدور على جانبه'
  },
  { 
    name: 'Neptune', nameAr: 'نبتون', 
    distance: 26, size: 1.4, color: '#4169e1', 
    orbitSpeed: 0.006, rotationSpeed: 1.5,
    info: 'أبعد الكواكب، تهب عليه أقوى رياح في المجموعة الشمسية'
  }
];

// Sun Component with glow effect
function Sun3D({ onClick }: { onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group onClick={onClick}>
      {/* Sun core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>
      
      {/* Sun glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial 
          color="#FFA500" 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Corona effect */}
      <mesh>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial 
          color="#FF6B00" 
          transparent 
          opacity={0.15}
        />
      </mesh>
      
      {/* Point light from sun */}
      <pointLight color="#FFF5E0" intensity={2} distance={100} />
    </group>
  );
}

// Planet Component
function Planet3D({ 
  planet, 
  timeScale, 
  showOrbits,
  showLabels,
  onClick,
  isSelected
}: { 
  planet: typeof PLANETS[0];
  timeScale: number;
  showOrbits: boolean;
  showLabels: boolean;
  onClick: () => void;
  isSelected: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  
  useFrame((state, delta) => {
    // Orbital movement
    angleRef.current += delta * planet.orbitSpeed * timeScale * 0.1;
    
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * planet.distance;
      groupRef.current.position.z = Math.sin(angleRef.current) * planet.distance;
    }
    
    // Planet rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * planet.rotationSpeed * timeScale * 0.5;
    }
    
    // Moon orbit (for Earth)
    if (moonRef.current && planet.hasMoon) {
      const moonAngle = state.clock.elapsedTime * 2 * timeScale;
      moonRef.current.position.x = Math.cos(moonAngle) * 1.5;
      moonRef.current.position.z = Math.sin(moonAngle) * 1.5;
    }
  });

  return (
    <>
      {/* Orbit path */}
      {showOrbits && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.distance - 0.02, planet.distance + 0.02, 128]} />
          <meshBasicMaterial 
            color={isSelected ? "#ffffff" : "#444466"} 
            transparent 
            opacity={isSelected ? 0.6 : 0.3} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      <group ref={groupRef} onClick={onClick}>
        {/* Planet */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[planet.size * 0.3, 32, 32]} />
          <meshStandardMaterial 
            color={planet.color}
            roughness={0.8}
            metalness={0.2}
          />
        </mesh>
        
        {/* Saturn's rings */}
        {planet.hasRings && (
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <ringGeometry args={[planet.size * 0.4, planet.size * 0.7, 64]} />
            <meshBasicMaterial 
              color="#D4A574" 
              transparent 
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
        
        {/* Earth's moon */}
        {planet.hasMoon && (
          <mesh ref={moonRef}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
        )}
        
        {/* Selection indicator */}
        {isSelected && (
          <mesh>
            <ringGeometry args={[planet.size * 0.5, planet.size * 0.55, 32]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
          </mesh>
        )}
        
        {/* Planet label */}
        {showLabels && (
          <Html position={[0, planet.size * 0.5 + 0.5, 0]} center>
            <div className="bg-black/70 px-2 py-1 rounded text-white text-xs whitespace-nowrap">
              {planet.nameAr}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

// Asteroid Belt
function AsteroidBelt({ count = 200 }: { count?: number }) {
  const asteroids = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 11 + Math.random() * 2;
      temp.push({
        position: [
          Math.cos(angle) * distance,
          (Math.random() - 0.5) * 0.5,
          Math.sin(angle) * distance
        ] as [number, number, number],
        size: 0.02 + Math.random() * 0.05
      });
    }
    return temp;
  }, [count]);

  return (
    <group>
      {asteroids.map((asteroid, i) => (
        <mesh key={i} position={asteroid.position}>
          <sphereGeometry args={[asteroid.size, 8, 8]} />
          <meshStandardMaterial color="#666666" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

// Camera Controller
function CameraController({ target }: { target: [number, number, number] | null }) {
  const { camera } = useThree();
  
  useFrame(() => {
    if (target) {
      camera.position.lerp(new THREE.Vector3(target[0] + 5, target[1] + 3, target[2] + 5), 0.02);
      camera.lookAt(new THREE.Vector3(...target));
    }
  });
  
  return null;
}

export default function SolarSystem3D() {
  const [isPaused, setIsPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<typeof PLANETS[0] | null>(null);
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null);

  const handlePlanetClick = (planet: typeof PLANETS[0]) => {
    setSelectedPlanet(planet);
  };

  const handleSunClick = () => {
    setSelectedPlanet(null);
    setCameraTarget(null);
  };

  const focusOnPlanet = (planet: typeof PLANETS[0]) => {
    const angle = Math.random() * Math.PI * 2;
    setCameraTarget([
      Math.cos(angle) * planet.distance,
      0,
      Math.sin(angle) * planet.distance
    ]);
  };

  return (
    <div className="min-h-screen bg-black relative" dir="rtl">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 30, 50], fov: 60 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Background stars */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />
          
          {/* Ambient light */}
          <ambientLight intensity={0.1} />
          
          {/* Sun */}
          <Sun3D onClick={handleSunClick} />
          
          {/* Planets */}
          {PLANETS.map((planet) => (
            <Planet3D
              key={planet.name}
              planet={planet}
              timeScale={isPaused ? 0 : timeScale}
              showOrbits={showOrbits}
              showLabels={showLabels}
              onClick={() => handlePlanetClick(planet)}
              isSelected={selectedPlanet?.name === planet.name}
            />
          ))}
          
          {/* Asteroid Belt */}
          <AsteroidBelt />
          
          {/* Camera controller */}
          <CameraController target={cameraTarget} />
          
          {/* Orbit controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={100}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          {/* Title */}
          <div className="pointer-events-auto">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Sun className="w-8 h-8 text-yellow-400" />
              محاكاة النظام الشمسي ثلاثية الأبعاد
            </h1>
            <p className="text-gray-400 mt-1">استكشف الكواكب بتحكم كامل 360°</p>
          </div>

          {/* Controls */}
          <Card className="bg-black/80 border-gray-700 p-4 pointer-events-auto">
            <div className="flex flex-col gap-4">
              {/* Play/Pause */}
              <div className="flex gap-2">
                <Button
                  variant={isPaused ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPaused(!isPaused)}
                  className="gap-2"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? 'تشغيل' : 'إيقاف'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTimeScale(1);
                    setSelectedPlanet(null);
                    setCameraTarget(null);
                  }}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  إعادة
                </Button>
              </div>

              {/* Time Scale */}
              <div>
                <label className="text-white text-sm mb-2 block">
                  سرعة الوقت: {timeScale.toFixed(1)}x
                </label>
                <Slider
                  value={[timeScale]}
                  onValueChange={([v]) => setTimeScale(v)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="w-40"
                />
              </div>

              {/* Toggle buttons */}
              <div className="flex gap-2">
                <Button
                  variant={showOrbits ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOrbits(!showOrbits)}
                >
                  <Globe className="w-4 h-4" />
                </Button>
                <Button
                  variant={showLabels ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowLabels(!showLabels)}
                >
                  {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Planet List */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
        <Card className="bg-black/80 border-gray-700 p-3">
          <h3 className="text-white font-semibold mb-3 text-center">الكواكب</h3>
          <div className="flex flex-col gap-2">
            {PLANETS.map((planet) => (
              <Button
                key={planet.name}
                variant={selectedPlanet?.name === planet.name ? "default" : "ghost"}
                size="sm"
                className="justify-start gap-2 text-white"
                onClick={() => {
                  setSelectedPlanet(planet);
                  focusOnPlanet(planet);
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: planet.color }}
                />
                {planet.nameAr}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Selected Planet Info */}
      {selectedPlanet && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-4 bottom-4 pointer-events-auto"
        >
          <Card className="bg-black/90 border-gray-700 p-4 max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-8 h-8 rounded-full" 
                style={{ backgroundColor: selectedPlanet.color }}
              />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedPlanet.nameAr}</h3>
                <p className="text-gray-400 text-sm">{selectedPlanet.name}</p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-3">{selectedPlanet.info}</p>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Badge variant="outline" className="justify-center">
                المسافة: {selectedPlanet.distance} وحدة
              </Badge>
              <Badge variant="outline" className="justify-center">
                الحجم: {selectedPlanet.size}
              </Badge>
              <Badge variant="outline" className="justify-center">
                سرعة المدار: {selectedPlanet.orbitSpeed}
              </Badge>
              <Badge variant="outline" className="justify-center">
                سرعة الدوران: {Math.abs(selectedPlanet.rotationSpeed)}
              </Badge>
            </div>
            
            {selectedPlanet.hasRings && (
              <Badge className="mt-2 bg-amber-600">له حلقات</Badge>
            )}
            {selectedPlanet.hasMoon && (
              <Badge className="mt-2 bg-gray-600 mr-2">له قمر</Badge>
            )}
          </Card>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-black/60 px-4 py-2 rounded-full text-gray-400 text-sm">
          اسحب للتدوير • اضغط Scroll للتقريب • انقر على كوكب للتفاصيل
        </div>
      </div>
    </div>
  );
}
