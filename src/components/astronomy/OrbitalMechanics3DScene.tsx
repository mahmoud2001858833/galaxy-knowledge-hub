import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Orbital3DProps {
  currentR_Km: number;
  semiMajorAxisKm: number;
  eccentricity: number;
  trueAnomalyRad: number;
  currentVelocityKms: number;
  perigeeAltKm: number;
  apogeeAltKm: number;
  isPlaying: boolean;
}

export default function OrbitalMechanics3DScene({
  currentR_Km,
  semiMajorAxisKm,
  eccentricity,
  trueAnomalyRad,
  currentVelocityKms,
  perigeeAltKm,
  apogeeAltKm,
  isPlaying,
}: Orbital3DProps) {
  const earthRef = useRef<THREE.Group>(null);
  const satelliteRef = useRef<THREE.Group>(null);

  const scaleDistance = (km: number) => {
    return 1.4 + (km / 42000) * 4.5;
  };

  const currentR3D = scaleDistance(currentR_Km);

  // Orbit path vertices
  const orbitPoints = useMemo(() => {
    const pts = [];
    const pKm = semiMajorAxisKm * (1 - eccentricity * eccentricity);
    for (let angle = 0; angle <= Math.PI * 2 + 0.05; angle += 0.05) {
      const r = pKm / (1 + eccentricity * Math.cos(angle));
      const r3D = scaleDistance(r);
      pts.push(new THREE.Vector3(Math.cos(angle) * r3D, 0, Math.sin(angle) * r3D));
    }
    return pts;
  }, [semiMajorAxisKm, eccentricity]);

  const orbitLineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(orbitPoints);
  }, [orbitPoints]);

  useFrame(() => {
    if (!isPlaying) return;

    if (earthRef.current) {
      earthRef.current.rotation.y += 0.003;
    }

    if (satelliteRef.current) {
      const sx = Math.cos(trueAnomalyRad) * currentR3D;
      const sz = Math.sin(trueAnomalyRad) * currentR3D;
      satelliteRef.current.position.set(sx, 0, sz);
      satelliteRef.current.rotation.y = -trueAnomalyRad;
    }
  });

  return (
    <group>
      {/* 1. 3D EARTH GLOBE WITH ATMOSPHERE */}
      <group ref={earthRef}>
        {/* Core Earth Sphere */}
        <mesh>
          <sphereGeometry args={[1.3, 48, 48]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>
        {/* Continents Relief Accent */}
        <mesh>
          <sphereGeometry args={[1.305, 32, 32]} />
          <meshStandardMaterial
            color="#15803d"
            roughness={0.9}
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
        {/* Atmosphere Rim Glow */}
        <mesh>
          <sphereGeometry args={[1.38, 32, 32]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.88}
            transparent
            opacity={0.3}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 2. EQUATORIAL REFERENCE PLANE & GEO RING */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[scaleDistance(35786) - 0.02, scaleDistance(35786) + 0.02, 64]} />
        <meshBasicMaterial color="#6366f1" opacity={0.3} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* 3. DYNAMIC KEPLERIAN ORBIT PATH */}
      <line geometry={orbitLineGeometry}>
        <lineBasicMaterial
          color={eccentricity > 0.4 ? '#f59e0b' : '#38bdf8'}
          linewidth={2}
          transparent
          opacity={0.8}
        />
      </line>

      {/* 4. PERIGEE & APOGEE MARKERS */}
      {/* Perigee Marker (Closest point to Earth) */}
      <group position={[scaleDistance(6371 + perigeeAltKm), 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        <Html position={[0, 0.4, 0]} center>
          <div className="bg-emerald-950/90 text-emerald-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            الحضيض Perigee ({perigeeAltKm} km)
          </div>
        </Html>
      </group>

      {/* Apogee Marker (Farthest point from Earth) */}
      <group position={[-scaleDistance(6371 + apogeeAltKm), 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <Html position={[0, 0.4, 0]} center>
          <div className="bg-red-950/90 text-red-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-red-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            الأوج Apogee ({apogeeAltKm} km)
          </div>
        </Html>
      </group>

      {/* 5. 3D SATELLITE WITH SOLAR PANELS & VELOCITY VECTOR */}
      <group ref={satelliteRef}>
        {/* Main Bus Box */}
        <mesh>
          <boxGeometry args={[0.22, 0.16, 0.22]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* High Gain Communication Antenna Dish */}
        <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <coneGeometry args={[0.12, 0.08, 16, 1, true]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} side={THREE.DoubleSide} />
        </mesh>

        {/* Dual Solar Wings */}
        {[-0.38, 0.38].map((sx) => (
          <group key={`wing-${sx}`} position={[sx, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.42, 0.015, 0.16]} />
              <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Photovoltaic Cells Grid Texture lines */}
            <mesh position={[0, 0.01, 0]}>
              <boxGeometry args={[0.4, 0.005, 0.14]} />
              <meshBasicMaterial color="#38bdf8" wireframe />
            </mesh>
          </group>
        ))}

        {/* Velocity Vector Arrow (Tangent to Motion) */}
        <group position={[0, 0, -0.2]}>
          <mesh position={[0, 0, -Math.min(0.6, currentVelocityKms / 15)]}>
            <cylinderGeometry args={[0.015, 0.015, Math.min(0.6, currentVelocityKms / 10), 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <mesh position={[0, 0, -Math.min(0.6, currentVelocityKms / 10) * 1.5 - 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.05, 0.12, 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>

        {/* Satellite Telemetry Tag */}
        <Html position={[0, 0.45, 0]} center>
          <div className="bg-slate-900/90 text-cyan-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            v = {currentVelocityKms.toFixed(2)} km/s
          </div>
        </Html>
      </group>
    </group>
  );
}
