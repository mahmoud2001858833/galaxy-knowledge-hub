import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface BlackHolePreset {
  id: string;
  nameAr: string;
  nameEn: string;
  solarMasses: number;
  typeAr: string;
  description: string;
  color: string;
}

interface BlackHole3DProps {
  probeDistanceMultiplier: number;
  isPlaying: boolean;
  selectedPreset: BlackHolePreset;
  timeDilationFactor: number;
}

export default function BlackHoleChamber3D({
  probeDistanceMultiplier,
  isPlaying,
  selectedPreset,
  timeDilationFactor,
}: BlackHole3DProps) {
  const diskRef = useRef<THREE.Group>(null);
  const probeRef = useRef<THREE.Group>(null);
  const jetRef = useRef<THREE.Group>(null);
  const angleRef = useRef<number>(0);
  const timeRef = useRef(0);

  const eventHorizonRadius = 1.2;
  const photonSphereRadius = eventHorizonRadius * 1.5;
  const iscoRadius = eventHorizonRadius * 3.0;

  // Polar Relativistic Jets Particles (Synchrotron radiation)
  const jetParticleCount = 60;
  const jetParticles = useMemo(() => {
    return Array.from({ length: jetParticleCount }, (_, idx) => {
      const isNorth = idx % 2 === 0;
      return {
        isNorth,
        distY: 1.2 + Math.random() * 4.5,
        radius: Math.random() * 0.25,
        angle: Math.random() * Math.PI * 2,
        speed: 0.08 + Math.random() * 0.05,
      };
    });
  }, [jetParticleCount]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    const t = timeRef.current;

    // Relativistic accretion disk spin
    if (diskRef.current) {
      diskRef.current.rotation.z += 0.012;
    }

    // Relativistic jets pulsate
    if (jetRef.current) {
      for (let i = 0; i < jetParticleCount; i++) {
        const p = jetParticles[i];
        const mesh = jetRef.current.children[i] as THREE.Mesh;
        if (!mesh) continue;

        p.distY += p.speed;
        if (p.distY > 5.5) {
          p.distY = 1.2;
        }

        const yPos = p.isNorth ? p.distY : -p.distY;
        const divergence = (p.distY / 5.5) * 0.6;
        const xPos = Math.cos(p.angle) * (p.radius + divergence);
        const zPos = Math.sin(p.angle) * (p.radius + divergence);

        mesh.position.set(xPos, yPos, zPos);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.85 * (1 - p.distY / 5.5));
      }
    }

    // Probe relativistic orbit with orbital velocity slowing with proper time
    if (probeRef.current) {
      const orbitalSpeed = (0.02 * Math.sqrt(eventHorizonRadius / Math.max(1.05, probeDistanceMultiplier)));
      angleRef.current += orbitalSpeed;

      const r3D = probeDistanceMultiplier * eventHorizonRadius;
      const px = Math.cos(angleRef.current) * r3D;
      const pz = Math.sin(angleRef.current) * r3D;
      probeRef.current.position.set(px, 0.15, pz);

      // Probe rotation
      probeRef.current.rotation.y = -angleRef.current;
    }
  });

  return (
    <group>
      {/* 1. BLACK HOLE EVENT HORIZON (Absolute Black Body, light cannot escape) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[eventHorizonRadius, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Relativistic Gravitational Redshift Glow Rim */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[eventHorizonRadius * 1.025, 32, 32]} />
        <meshBasicMaterial color="#ef4444" opacity={0.35} transparent side={THREE.BackSide} />
      </mesh>

      {/* 2. PHOTON SPHERE (Unstable photon orbit r = 1.5 rs) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[photonSphereRadius - 0.025, photonSphereRadius + 0.025, 64]} />
        <meshBasicMaterial color="#fde047" opacity={0.75} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* EINSTEIN RING GRAVITATIONAL LENSING HALO */}
      <mesh rotation={[0, 0, 0]}>
        <ringGeometry args={[eventHorizonRadius * 1.8, eventHorizonRadius * 1.86, 64]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.4} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* 3. ISCO RING (Innermost Stable Circular Orbit r = 3.0 rs) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[iscoRadius - 0.02, iscoRadius + 0.02, 64]} />
        <meshBasicMaterial color="#22c55e" opacity={0.5} transparent side={THREE.DoubleSide} />
      </mesh>

      {/* 4. RELATIVISTIC ACCRETION DISK (Doppler Boosted) */}
      <group ref={diskRef} rotation={[Math.PI / 3.2, 0, 0]}>
        {/* Inner Ultra-Hot X-Ray Boundary (Approaching relativistic velocity) */}
        <mesh>
          <ringGeometry args={[eventHorizonRadius * 1.2, iscoRadius * 1.3, 64]} />
          <meshBasicMaterial color="#38bdf8" opacity={0.8} transparent side={THREE.DoubleSide} />
        </mesh>
        {/* Mid Optical Disk */}
        <mesh>
          <ringGeometry args={[iscoRadius * 1.25, iscoRadius * 2.2, 64]} />
          <meshBasicMaterial color={selectedPreset.color} opacity={0.65} transparent side={THREE.DoubleSide} />
        </mesh>
        {/* Outer Cool Infrared Edge */}
        <mesh>
          <ringGeometry args={[iscoRadius * 2.15, iscoRadius * 3.4, 64]} />
          <meshBasicMaterial color="#ef4444" opacity={0.35} transparent side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 5. POLAR ASTROPHYSICAL JETS (Relativistic Plasma Beams) */}
      <group ref={jetRef}>
        {jetParticles.map((_, i) => (
          <mesh key={`jet-particle-${i}`}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>

      {/* 6. SPACETIME CURVATURE GRAVITATIONAL FUNNEL */}
      <group position={[0, -0.2, 0]}>
        {[-0.2, -0.6, -1.2, -2.0, -2.8].map((depth, idx) => {
          const rad = 5.8 - idx * 1.05;
          return (
            <mesh key={`curvature-${idx}`} position={[0, depth, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[rad - 0.02, rad + 0.02, 48]} />
              <meshBasicMaterial color="#475569" opacity={0.3} transparent side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>

      {/* 7. RELATIVISTIC PROBE SATELLITE */}
      <group ref={probeRef}>
        <mesh>
          <boxGeometry args={[0.3, 0.18, 0.3]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Solar Arrays */}
        {[-0.45, 0.45].map((sx) => (
          <mesh key={`solar-${sx}`} position={[sx, 0, 0]}>
            <boxGeometry args={[0.45, 0.02, 0.22]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} />
          </mesh>
        ))}
        {/* Spaghettification Visual Warning Needle */}
        {probeDistanceMultiplier <= 1.3 && (
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        )}
        <pointLight color="#38bdf8" intensity={1.8} distance={2.5} />
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-slate-900/90 text-cyan-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-500/40 pointer-events-none whitespace-nowrap shadow-lg">
            المسبار ({probeDistanceMultiplier.toFixed(2)} rs)
          </div>
        </Html>
      </group>
    </group>
  );
}
