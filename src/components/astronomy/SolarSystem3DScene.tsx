import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { CelestialBody } from '@/hooks/useSolarSystemPhysics';

interface SolarSystem3DProps {
  bodies: CelestialBody[];
  selectedBody: string | null;
  onSelectBody: (id: string) => void;
  timeScale: number;
  isPaused: boolean;
  showOrbits: boolean;
  showLabels: boolean;
}

export default function SolarSystem3DScene({
  bodies,
  selectedBody,
  onSelectBody,
  timeScale,
  isPaused,
  showOrbits = true,
  showLabels = true,
}: SolarSystem3DProps) {
  const systemRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Scaled orbital radii for clear 3D visualization
  const planetScales: Record<string, { r: number; size: number }> = {
    sun: { r: 0, size: 1.2 },
    mercury: { r: 2.2, size: 0.14 },
    venus: { r: 3.2, size: 0.22 },
    earth: { r: 4.4, size: 0.25 },
    mars: { r: 5.6, size: 0.18 },
    jupiter: { r: 7.6, size: 0.55 },
    saturn: { r: 9.8, size: 0.46 },
    uranus: { r: 12.0, size: 0.35 },
    neptune: { r: 14.2, size: 0.34 },
    pluto: { r: 16.0, size: 0.10 },
  };

  const planets = useMemo(() => {
    return bodies.filter((b) => b.type === 'planet' || b.type === 'dwarf-planet');
  }, [bodies]);

  const sun = useMemo(() => {
    return bodies.find((b) => b.type === 'star') || bodies[0];
  }, [bodies]);

  useFrame((_, delta) => {
    if (isPaused) return;
    timeRef.current += delta * (timeScale / 15);
  });

  return (
    <group ref={systemRef}>
      {/* 1. CENTRAL STAR: THE SUN */}
      <group position={[0, 0, 0]} onClick={() => onSelectBody('sun')}>
        {/* Core Sun */}
        <mesh>
          <sphereGeometry args={[planetScales.sun.size, 32, 32]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
        {/* Sun Corona Glow */}
        <mesh>
          <sphereGeometry args={[planetScales.sun.size * 1.2, 32, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} side={THREE.BackSide} />
        </mesh>
        {/* Point Light illuminating the solar system */}
        <pointLight color="#fff7ed" intensity={3.0} distance={40} decay={0.8} />

        {showLabels && (
          <Html position={[0, planetScales.sun.size + 0.4, 0]} center>
            <div className="bg-amber-950/90 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/40 pointer-events-none whitespace-nowrap shadow-lg">
              الشمس (The Sun)
            </div>
          </Html>
        )}
      </group>

      {/* 2. PLANETARY BODIES & ORBIT RINGS */}
      {planets.map((planet) => {
        const config = planetScales[planet.id] || { r: 5, size: 0.2 };
        const periodFactor = Math.max(0.2, planet.orbitalPeriod / 365);
        const currentAngle = (timeRef.current / periodFactor) + (planet.orbitalRadius * 2);

        const px = Math.cos(currentAngle) * config.r;
        const pz = Math.sin(currentAngle) * config.r;
        const isSelected = selectedBody === planet.id;

        return (
          <group key={planet.id}>
            {/* Orbit Trace Ring */}
            {showOrbits && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[config.r - 0.02, config.r + 0.02, 64]} />
                <meshBasicMaterial
                  color={isSelected ? '#38bdf8' : '#334155'}
                  transparent
                  opacity={isSelected ? 0.8 : 0.25}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Orbiting Planet Group */}
            <group position={[px, 0, pz]} onClick={(e) => { e.stopPropagation(); onSelectBody(planet.id); }}>
              {/* Planet Sphere */}
              <mesh rotation={[0, timeRef.current * 2, (planet.axialTilt * Math.PI) / 180]}>
                <sphereGeometry args={[config.size, 24, 24]} />
                <meshStandardMaterial color={planet.color} roughness={0.7} metalness={0.1} />
              </mesh>

              {/* Saturn's Rings */}
              {planet.id === 'saturn' && (
                <mesh rotation={[(planet.axialTilt * Math.PI) / 180 + Math.PI / 3, 0, 0]}>
                  <ringGeometry args={[config.size * 1.4, config.size * 2.3, 32]} />
                  <meshStandardMaterial
                    color="#e4d191"
                    transparent
                    opacity={0.75}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}

              {/* Selection Ring Indicator */}
              {isSelected && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[config.size * 1.4, config.size * 1.5, 24]} />
                  <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
                </mesh>
              )}

              {/* Planet Label */}
              {showLabels && (
                <Html position={[0, config.size + 0.35, 0]} center>
                  <div
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer whitespace-nowrap shadow-lg transition-all ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 ring-2 ring-sky-300'
                        : 'bg-slate-900/90 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {planet.nameAr}
                  </div>
                </Html>
              )}
            </group>
          </group>
        );
      })}
    </group>
  );
}
