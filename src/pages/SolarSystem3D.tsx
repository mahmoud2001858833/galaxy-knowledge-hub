import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, RotateCcw, Eye, EyeOff, Globe, ArrowLeft, Info, Maximize2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Enhanced planet data with more details
const PLANETS = [
  { 
    name: 'Mercury', nameAr: 'عطارد', 
    distance: 5, size: 0.4, color: '#b5b5b5', 
    orbitSpeed: 4.15, rotationSpeed: 0.017,
    glowColor: '#888888',
    info: 'أصغر كواكب المجموعة الشمسية وأقربها للشمس',
    facts: ['درجة حرارته تصل إلى 430°C', 'يومه يساوي 59 يوماً أرضياً', 'لا يملك أقماراً']
  },
  { 
    name: 'Venus', nameAr: 'الزهرة', 
    distance: 7, size: 0.9, color: '#ffd700', 
    orbitSpeed: 1.62, rotationSpeed: -0.004,
    glowColor: '#FFE066',
    info: 'ألمع كوكب في السماء، يدور بعكس اتجاه الكواكب الأخرى',
    facts: ['يُسمى توأم الأرض', 'أسخن كوكب في المجموعة', 'غلافه من CO₂']
  },
  { 
    name: 'Earth', nameAr: 'الأرض', 
    distance: 10, size: 1, color: '#4169e1', 
    orbitSpeed: 1, rotationSpeed: 1,
    glowColor: '#63B3ED',
    info: 'كوكبنا الأم، الكوكب الوحيد المعروف بوجود حياة عليه',
    facts: ['71% من سطحه ماء', 'له قمر واحد', 'عمره 4.5 مليار سنة'],
    hasMoon: true
  },
  { 
    name: 'Mars', nameAr: 'المريخ', 
    distance: 13, size: 0.5, color: '#cd5c5c', 
    orbitSpeed: 0.53, rotationSpeed: 0.97,
    glowColor: '#F56565',
    info: 'الكوكب الأحمر، يحتوي على أكبر بركان في المجموعة الشمسية',
    facts: ['جبل أوليمبوس أعلى جبل', 'له قمران: فوبوس وديموس', 'يومه 24.6 ساعة']
  },
  { 
    name: 'Jupiter', nameAr: 'المشتري', 
    distance: 18, size: 2.5, color: '#daa520', 
    orbitSpeed: 0.084, rotationSpeed: 2.4,
    glowColor: '#F6AD55',
    info: 'أكبر كواكب المجموعة الشمسية، له 95 قمراً معروفاً',
    facts: ['البقعة الحمراء عاصفة عملاقة', 'كتلته ضعف كل الكواكب', 'له حلقات خافتة'],
    hasStripes: true
  },
  { 
    name: 'Saturn', nameAr: 'زحل', 
    distance: 24, size: 2.2, color: '#f4a460', 
    orbitSpeed: 0.034, rotationSpeed: 2.2,
    glowColor: '#ECC94B',
    info: 'يتميز بحلقاته الجميلة المكونة من الجليد والصخور',
    facts: ['حلقاته من جليد وصخور', 'كثافته أقل من الماء', 'له 146 قمراً'],
    hasRings: true
  },
  { 
    name: 'Uranus', nameAr: 'أورانوس', 
    distance: 30, size: 1.5, color: '#40e0d0', 
    orbitSpeed: 0.012, rotationSpeed: -1.4,
    glowColor: '#4FD1C5',
    info: 'يميل محوره بشكل كبير، يبدو وكأنه يدور على جانبه',
    facts: ['مائل 98 درجة', 'أبرد غلاف جوي', 'اكتُشف 1781']
  },
  { 
    name: 'Neptune', nameAr: 'نبتون', 
    distance: 35, size: 1.4, color: '#4169e1', 
    orbitSpeed: 0.006, rotationSpeed: 1.5,
    glowColor: '#667EEA',
    info: 'أبعد الكواكب، تهب عليه أقوى رياح في المجموعة الشمسية',
    facts: ['رياحه 2000 كم/س', 'سنته 165 سنة أرضية', 'له 16 قمراً']
  }
];

// Enhanced Sun Component with corona effect
function Sun3D({ onClick }: { onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const corona2Ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (coronaRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08;
      coronaRef.current.scale.setScalar(scale);
      coronaRef.current.rotation.z += 0.001;
    }
    if (corona2Ref.current) {
      const scale = 1.1 + Math.cos(state.clock.elapsedTime * 1.5) * 0.05;
      corona2Ref.current.scale.setScalar(scale);
      corona2Ref.current.rotation.z -= 0.001;
    }
  });

  return (
    <group onClick={onClick}>
      {/* Sun core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>
      
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#FFD54F" transparent opacity={0.6} />
      </mesh>
      
      {/* Corona layer 1 */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[3.8, 32, 32]} />
        <meshBasicMaterial color="#FFA726" transparent opacity={0.3} />
      </mesh>
      
      {/* Corona layer 2 */}
      <mesh ref={corona2Ref}>
        <sphereGeometry args={[4.5, 32, 32]} />
        <meshBasicMaterial color="#FF7043" transparent opacity={0.15} />
      </mesh>
      
      {/* Point light from sun */}
      <pointLight color="#FFF5E0" intensity={3} distance={150} />
      <pointLight color="#FFA500" intensity={1} distance={80} />
    </group>
  );
}

// Enhanced Planet Component with glow
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
  const glowRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(Math.random() * Math.PI * 2);
  
  useFrame((state, delta) => {
    angleRef.current += delta * planet.orbitSpeed * timeScale * 0.1;
    
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * planet.distance;
      groupRef.current.position.z = Math.sin(angleRef.current) * planet.distance;
    }
    
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * planet.rotationSpeed * timeScale * 0.5;
    }

    // Glow pulse effect
    if (glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      glowRef.current.scale.setScalar(pulse);
    }
    
    if (moonRef.current && planet.hasMoon) {
      const moonAngle = state.clock.elapsedTime * 2 * timeScale;
      moonRef.current.position.x = Math.cos(moonAngle) * 1.8;
      moonRef.current.position.z = Math.sin(moonAngle) * 1.8;
    }
  });

  return (
    <>
      {/* Orbit path */}
      {showOrbits && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.distance - 0.03, planet.distance + 0.03, 128]} />
          <meshBasicMaterial 
            color={isSelected ? planet.glowColor : "#334155"} 
            transparent 
            opacity={isSelected ? 0.8 : 0.4} 
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      <group ref={groupRef} onClick={onClick}>
        {/* Planet glow effect */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[planet.size * 0.4, 32, 32]} />
          <meshBasicMaterial 
            color={planet.glowColor} 
            transparent 
            opacity={0.3}
          />
        </mesh>

        {/* Planet */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[planet.size * 0.3, 32, 32]} />
          <meshStandardMaterial 
            color={planet.color}
            roughness={0.7}
            metalness={0.3}
            emissive={planet.color}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Saturn's rings */}
        {planet.hasRings && (
          <group rotation={[Math.PI / 3, 0, 0]}>
            <mesh>
              <ringGeometry args={[planet.size * 0.45, planet.size * 0.55, 64]} />
              <meshBasicMaterial color="#D4A574" transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>
            <mesh>
              <ringGeometry args={[planet.size * 0.55, planet.size * 0.65, 64]} />
              <meshBasicMaterial color="#C9A66B" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
            <mesh>
              <ringGeometry args={[planet.size * 0.65, planet.size * 0.72, 64]} />
              <meshBasicMaterial color="#B8956F" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}
        
        {/* Earth's moon */}
        {planet.hasMoon && (
          <group>
            <mesh ref={moonRef}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#888888" emissive="#666666" emissiveIntensity={0.2} />
            </mesh>
          </group>
        )}
        
        {/* Selection ring */}
        {isSelected && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planet.size * 0.5, planet.size * 0.55, 32]} />
            <meshBasicMaterial color="#00FF00" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        )}
        
        {/* Planet label */}
        {showLabels && (
          <Html position={[0, planet.size * 0.5 + 0.6, 0]} center>
            <div className={`px-3 py-1.5 rounded-full text-white text-sm font-bold whitespace-nowrap transition-all ${
              isSelected ? 'bg-green-500/90 scale-110' : 'bg-black/70'
            }`}>
              {planet.nameAr}
            </div>
          </Html>
        )}
      </group>
    </>
  );
}

// Asteroid Belt with more asteroids
function AsteroidBelt({ count = 300 }: { count?: number }) {
  const asteroids = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 2.5;
      temp.push({
        position: [
          Math.cos(angle) * distance,
          (Math.random() - 0.5) * 0.8,
          Math.sin(angle) * distance
        ] as [number, number, number],
        size: 0.02 + Math.random() * 0.06
      });
    }
    return temp;
  }, [count]);

  return (
    <group>
      {asteroids.map((asteroid, i) => (
        <mesh key={i} position={asteroid.position}>
          <sphereGeometry args={[asteroid.size, 6, 6]} />
          <meshStandardMaterial color="#777777" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

// Camera Controller for smooth transitions
function CameraController({ target }: { target: [number, number, number] | null }) {
  const { camera } = useThree();
  
  useFrame(() => {
    if (target) {
      camera.position.lerp(new THREE.Vector3(target[0] + 8, target[1] + 5, target[2] + 8), 0.02);
      camera.lookAt(new THREE.Vector3(...target));
    }
  });
  
  return null;
}

export default function SolarSystem3D() {
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<typeof PLANETS[0] | null>(null);
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null);
  const [showInfo, setShowInfo] = useState(true);

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

  const resetCamera = () => {
    setCameraTarget(null);
    setSelectedPlanet(null);
  };

  return (
    <div className="min-h-screen bg-black relative" dir="rtl">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 40, 60], fov: 60 }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Stars radius={150} depth={60} count={8000} factor={5} saturation={0} />
          <ambientLight intensity={0.15} />
          <Sun3D onClick={handleSunClick} />
          
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
          
          <AsteroidBelt />
          <CameraController target={cameraTarget} />
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={8}
            maxDistance={120}
          />
        </Suspense>
      </Canvas>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div className="pointer-events-auto flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 ml-2" />
              رجوع
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                ☀️ النظام الشمسي ثلاثي الأبعاد
              </h1>
              <p className="text-gray-400 mt-1">استكشف الكواكب بتحكم كامل 360°</p>
            </div>
          </div>

          {/* Controls Panel */}
          <Card className="bg-black/80 border-gray-700 p-4 pointer-events-auto backdrop-blur-sm">
            <div className="flex flex-col gap-4">
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
                <Button variant="outline" size="sm" onClick={resetCamera} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  إعادة
                </Button>
              </div>

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

              <div className="flex gap-2">
                <Button
                  variant={showOrbits ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOrbits(!showOrbits)}
                  title="إظهار المدارات"
                >
                  <Globe className="w-4 h-4" />
                </Button>
                <Button
                  variant={showLabels ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowLabels(!showLabels)}
                  title="إظهار الأسماء"
                >
                  {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant={showInfo ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowInfo(!showInfo)}
                  title="إظهار المعلومات"
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Planet List - Left Side */}
      {showInfo && (
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto z-10"
        >
          <Card className="bg-black/80 border-gray-700 p-4 backdrop-blur-sm">
            <h3 className="text-white font-bold mb-3 text-center flex items-center gap-2">
              <Globe className="w-4 h-4" />
              الكواكب
            </h3>
            <div className="flex flex-col gap-2">
              {PLANETS.map((planet) => (
                <motion.button
                  key={planet.name}
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    selectedPlanet?.name === planet.name 
                      ? 'bg-gradient-to-r from-green-600/50 to-blue-600/50 border border-green-500' 
                      : 'hover:bg-white/10'
                  }`}
                  onClick={() => {
                    setSelectedPlanet(planet);
                    focusOnPlanet(planet);
                  }}
                >
                  <div 
                    className="w-5 h-5 rounded-full shadow-lg" 
                    style={{ 
                      backgroundColor: planet.color,
                      boxShadow: `0 0 10px ${planet.glowColor}`
                    }}
                  />
                  <span className="text-white text-sm">{planet.nameAr}</span>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Selected Planet Info - Bottom Right */}
      {selectedPlanet && showInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute right-4 bottom-4 pointer-events-auto z-10"
        >
          <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border-gray-700 p-5 max-w-md backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: selectedPlanet.color,
                  boxShadow: `0 0 25px ${selectedPlanet.glowColor}`
                }}
              >
                {selectedPlanet.hasRings && <span className="text-2xl">💫</span>}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedPlanet.nameAr}</h3>
                <p className="text-gray-400">{selectedPlanet.name}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="mr-auto"
                onClick={() => focusOnPlanet(selectedPlanet)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{selectedPlanet.info}</p>
            
            {/* Facts */}
            <div className="space-y-2 mb-4">
              {selectedPlanet.facts.map((fact, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-400">✦</span>
                  <span className="text-gray-300">{fact}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline" className="justify-center py-2">
                📏 البعد: {selectedPlanet.distance} وحدة
              </Badge>
              <Badge variant="outline" className="justify-center py-2">
                📐 الحجم: {selectedPlanet.size}x
              </Badge>
              <Badge variant="outline" className="justify-center py-2">
                🔄 سرعة المدار: {selectedPlanet.orbitSpeed}
              </Badge>
              <Badge variant="outline" className="justify-center py-2">
                🌀 سرعة الدوران: {Math.abs(selectedPlanet.rotationSpeed)}
              </Badge>
            </div>
            
            <div className="flex gap-2 mt-3">
              {selectedPlanet.hasRings && (
                <Badge className="bg-amber-600">💍 له حلقات</Badge>
              )}
              {selectedPlanet.hasMoon && (
                <Badge className="bg-gray-600">🌙 له قمر</Badge>
              )}
              {selectedPlanet.hasStripes && (
                <Badge className="bg-orange-600">🌀 له خطوط</Badge>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Sun Info when clicked */}
      {!selectedPlanet && showInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-4 bottom-4 pointer-events-auto z-10"
        >
          <Card className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 border-yellow-600/50 p-5 max-w-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50" />
              <div>
                <h3 className="text-xl font-bold text-white">الشمس ☀️</h3>
                <p className="text-yellow-200 text-sm">نجم المجموعة الشمسية</p>
              </div>
            </div>
            <p className="text-yellow-100 text-sm">
              نجم قزم أصفر في مركز مجموعتنا الشمسية. تشكل 99.86% من كتلة المجموعة الشمسية بأكملها.
            </p>
            <div className="mt-3 space-y-1 text-sm text-yellow-200">
              <p>🔥 درجة السطح: 5,500°C</p>
              <p>💫 العمر: 4.6 مليار سنة</p>
              <p>📏 القطر: 1.4 مليون كم</p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
