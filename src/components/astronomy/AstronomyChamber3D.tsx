import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface AstronomyChamber3DProps {
  simulationType: 'solar' | 'lunar' | 'phases' | 'orbits';
  time: number;
  showShadows: boolean;
  showOrbits: boolean;
  sunIntensity: number;
  cameraPreset: 'system' | 'earth' | 'moon' | 'top';
  onMoonAngleChange?: (angle: number) => void;
}

// 3D Sun Component with corona glow
const SunObject: React.FC<{ position: [number, number, number]; intensity: number }> = ({ position, intensity }) => {
  const coronaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (coronaRef.current) {
      coronaRef.current.rotation.z += 0.002;
      const s = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.04;
      coronaRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position}>
      {/* Sun Photosphere */}
      <mesh>
        <sphereGeometry args={[2.8, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>

      {/* Emissive Corona Glow Sphere */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[3.4, 32, 32]} />
        <meshBasicMaterial
          color="#ff7700"
          transparent
          opacity={0.35 * intensity}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Point light emitting from sun center */}
      <pointLight color="#fff4cc" intensity={2.5 * intensity} distance={60} decay={1} />
      <directionalLight position={[0, 0, 0]} target-position={[10, 0, 0]} intensity={1.8 * intensity} />

      <Html position={[0, 3.8, 0]} center distanceFactor={15}>
        <div className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[10px] text-amber-200 font-bold whitespace-nowrap shadow-md">
          ☀️ الشمس (Sun)
        </div>
      </Html>
    </group>
  );
};

// 3D Earth Component with atmosphere and day/night terminator
const EarthObject: React.FC<{ 
  position: [number, number, number]; 
  sunPosition: [number, number, number];
  isTotality?: boolean;
}> = ({ position, sunPosition, isTotality }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.004;
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.005;
  });

  return (
    <group position={position} rotation={[0, 0, THREE.MathUtils.degToRad(23.44)]}>
      {/* Earth Surface */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshStandardMaterial
          color="#1e40af"
          roughness={0.6}
          metalness={0.1}
          emissive="#064e3b"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Continents overlay approximation */}
      <mesh>
        <sphereGeometry args={[1.61, 32, 32]} />
        <meshStandardMaterial
          color="#15803d"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Cloud & Atmosphere Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.66, 32, 32]} />
        <meshStandardMaterial
          color="#93c5fd"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Totality Eclipse Umbra Shadow Spot on Earth */}
      {isTotality && (
        <mesh position={[0, 0, 1.63]}>
          <circleGeometry args={[0.3, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.9} />
        </mesh>
      )}

      <Html position={[0, 2.2, 0]} center distanceFactor={15}>
        <div className="px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-[10px] text-blue-200 font-bold whitespace-nowrap shadow-md">
          🌍 الأرض (Earth)
        </div>
      </Html>
    </group>
  );
};

// 3D Moon Component with crater texture & shadow tint
const MoonObject: React.FC<{ 
  position: [number, number, number];
  isLunarEclipsed?: boolean;
}> = ({ position, isLunarEclipsed }) => {
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (moonRef.current) moonRef.current.rotation.y += 0.003;
  });

  return (
    <group position={position}>
      <mesh ref={moonRef} castShadow receiveShadow>
        <sphereGeometry args={[0.65, 24, 24]} />
        <meshStandardMaterial
          color={isLunarEclipsed ? "#991b1b" : "#cbd5e1"}
          emissive={isLunarEclipsed ? "#7f1d1d" : "#000000"}
          emissiveIntensity={isLunarEclipsed ? 0.6 : 0}
          roughness={0.9}
        />
      </mesh>

      <Html position={[0, 1.1, 0]} center distanceFactor={15}>
        <div className={`px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap shadow-md ${
          isLunarEclipsed 
            ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse' 
            : 'bg-slate-900/80 border-slate-600 text-slate-200'
        }`}>
          {isLunarEclipsed ? '🌑 قمر دموي (Blood Moon)' : '🌙 القمر (Moon)'}
        </div>
      </Html>
    </group>
  );
};

// Volumetric Umbra and Penumbra Shadow Cones
const ShadowGeometry: React.FC<{
  sourcePos: [number, number, number];
  occluderPos: [number, number, number];
  type: 'solar' | 'lunar';
}> = ({ sourcePos, occluderPos, type }) => {
  const umbraMeshRef = useRef<THREE.Mesh>(null);
  const penumbraMeshRef = useRef<THREE.Mesh>(null);

  const direction = new THREE.Vector3(
    occluderPos[0] - sourcePos[0],
    occluderPos[1] - sourcePos[1],
    occluderPos[2] - sourcePos[2]
  ).normalize();

  const length = type === 'solar' ? 6 : 9;
  const targetPos = new THREE.Vector3(...occluderPos).add(direction.clone().multiplyScalar(length / 2));

  return (
    <group>
      {/* Dark Umbra Cone */}
      <mesh position={[targetPos.x, targetPos.y, targetPos.z]}>
        <cylinderGeometry args={[0.08, type === 'solar' ? 0.65 : 1.6, length, 16, 1, true]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Expanding Penumbra Cone */}
      <mesh position={[targetPos.x, targetPos.y, targetPos.z]}>
        <cylinderGeometry args={[0.9, type === 'solar' ? 0.65 : 1.6, length, 16, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Camera Controller Preset
const CameraPresetController: React.FC<{ preset: string }> = ({ preset }) => {
  useFrame(({ camera }) => {
    let target = new THREE.Vector3(0, 0, 0);
    let targetPos = new THREE.Vector3(0, 6, 18);

    if (preset === 'system') {
      targetPos.set(0, 8, 20);
    } else if (preset === 'earth') {
      targetPos.set(7, 2, 7);
      target.set(6, 0, 0);
    } else if (preset === 'moon') {
      targetPos.set(3, 1, 4);
      target.set(3, 0, 0);
    } else if (preset === 'top') {
      targetPos.set(0, 24, 0.1);
    }

    camera.position.lerp(targetPos, 0.05);
    camera.lookAt(target);
  });
  return null;
};

export const AstronomyChamber3D: React.FC<AstronomyChamber3DProps> = ({
  simulationType,
  time,
  showShadows,
  showOrbits,
  sunIntensity,
  cameraPreset
}) => {
  // Coordinates based on simulation type
  const { sunPos, earthPos, moonPos, isSolarTotality, isLunarEclipsed } = useMemo(() => {
    if (simulationType === 'solar') {
      // Sun at left (-12), Earth at right (6)
      const sunP: [number, number, number] = [-11, 0, 0];
      const earthP: [number, number, number] = [6, 0, 0];
      
      // Moon travels along transit line crossing between Sun & Earth
      const moonX = -2 + Math.sin(time * 0.4) * 5;
      const moonY = Math.cos(time * 0.4) * 0.4;
      const moonP: [number, number, number] = [moonX, moonY, 0];

      // Totality when Moon is directly aligned with Sun-Earth axis
      const isTotality = Math.abs(moonX - 1.5) < 0.6;

      return { sunPos: sunP, earthPos: earthP, moonPos: moonP, isSolarTotality: isTotality, isLunarEclipsed: false };
    } 
    
    if (simulationType === 'lunar') {
      // Sun at left (-12), Earth at center (0), Moon passing behind Earth
      const sunP: [number, number, number] = [-12, 0, 0];
      const earthP: [number, number, number] = [0, 0, 0];
      
      const moonAngle = time * 0.5;
      const moonRadius = 6.5;
      const moonX = earthP[0] + Math.cos(moonAngle) * moonRadius;
      const moonZ = Math.sin(moonAngle) * moonRadius;
      const moonP: [number, number, number] = [moonX, 0, moonZ];

      // Lunar eclipse happens when Moon is behind Earth relative to Sun (X > 5 and |Z| < 1.5)
      const isEclipsed = moonX > 4.5 && Math.abs(moonZ) < 1.4;

      return { sunPos: sunP, earthPos: earthP, moonPos: moonP, isSolarTotality: false, isLunarEclipsed: isEclipsed };
    }

    // Default: Moon Phases or Orbits
    const sunP: [number, number, number] = [-14, 0, 0];
    const earthP: [number, number, number] = [0, 0, 0];
    const moonAngle = time * 0.6;
    const moonRadius = 5.2;
    const moonX = Math.cos(moonAngle) * moonRadius;
    const moonZ = Math.sin(moonAngle) * moonRadius;
    const moonP: [number, number, number] = [moonX, 0, moonZ];

    return { sunPos: sunP, earthPos: earthP, moonPos: moonP, isSolarTotality: false, isLunarEclipsed: false };
  }, [simulationType, time]);

  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden">
      <Canvas
        camera={{ position: [0, 8, 20], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#030712']} />
        
        {/* Starfield */}
        <Stars radius={120} depth={50} count={3500} factor={4} saturation={0.5} fade speed={1} />
        
        {/* Ambient celestial lighting */}
        <ambientLight intensity={0.12} />
        
        <CameraPresetController preset={cameraPreset} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.06} maxDistance={40} minDistance={4} />

        {/* 3D Sun */}
        <SunObject position={sunPos} intensity={sunIntensity} />

        {/* 3D Earth */}
        <EarthObject position={earthPos} sunPosition={sunPos} isTotality={isSolarTotality} />

        {/* 3D Moon */}
        <MoonObject position={moonPos} isLunarEclipsed={isLunarEclipsed} />

        {/* Moon Orbit Trajectory Ring */}
        {showOrbits && (
          <mesh rotation={[Math.PI / 2, 0, 0]} position={earthPos}>
            <ringGeometry args={[5.15, 5.25, 64]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Umbra & Penumbra Volumetric Cones */}
        {showShadows && simulationType === 'solar' && (
          <ShadowGeometry sourcePos={sunPos} occluderPos={moonPos} type="solar" />
        )}

        {showShadows && simulationType === 'lunar' && (
          <ShadowGeometry sourcePos={sunPos} occluderPos={earthPos} type="lunar" />
        )}

        {/* Alignment Light Ray Guides */}
        <line>
          <bufferGeometry attach="geometry">
            <float32BufferAttribute
              attach="attributes-position"
              args={[new Float32Array([sunPos[0], sunPos[1], sunPos[2], earthPos[0], earthPos[1], earthPos[2]]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#fef08a" transparent opacity={0.15} />
        </line>
      </Canvas>

      {/* In-Canvas Dynamic Alignment Banner */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
        {isSolarTotality && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/60 backdrop-blur-md text-amber-200 text-xs font-bold flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>💍 كسوف كلي نشط: ظاهرة خاتم الماس (Diamond Ring Effect)!</span>
          </div>
        )}

        {isLunarEclipsed && (
          <div className="px-3 py-1.5 rounded-xl bg-red-600/20 border border-red-500/60 backdrop-blur-md text-red-200 text-xs font-bold flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>🔴 خسوف كلي نشط: القمر في منطقة ظل الأرض (Rayleigh Scattering)!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstronomyChamber3D;
