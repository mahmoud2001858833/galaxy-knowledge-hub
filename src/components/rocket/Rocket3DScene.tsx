import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Rocket3DProps {
  simulationType: 'launch' | 'staging' | 'orbit' | 'landing';
  thrust: number;
  altitude: number;
  velocity: number;
  fuel: number;
  isPlaying: boolean;
}

export default function Rocket3DScene({
  simulationType,
  thrust,
  altitude,
  velocity,
  fuel,
  isPlaying,
}: Rocket3DProps) {
  const timeRef = useRef(0);
  const rocketGroupRef = useRef<THREE.Group>(null);
  const boosterRef = useRef<THREE.Group>(null);
  const upperStageRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const smokeGroupRef = useRef<THREE.Group>(null);
  const legsRef = useRef<THREE.Group>(null);

  // Plume smoke particles
  const smokeCount = 40;
  const smokeParticles = useMemo(() => {
    return Array.from({ length: smokeCount }, () => ({
      x: 0,
      y: 0,
      z: 0,
      scale: 0.2,
      opacity: 0.8,
      speedY: 0.1,
    }));
  }, [smokeCount]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    const t = timeRef.current;

    // Rocket altitude positioning in 3D scene
    if (rocketGroupRef.current) {
      if (simulationType === 'launch') {
        const visualY = Math.min(6.0, (altitude / 100) * 4.0 - 1.5);
        rocketGroupRef.current.position.y = visualY;
        // Launch jitter / vibration
        if (thrust > 10 && fuel > 0) {
          rocketGroupRef.current.position.x = (Math.random() - 0.5) * 0.02;
          rocketGroupRef.current.position.z = (Math.random() - 0.5) * 0.02;
        }
      } else if (simulationType === 'staging') {
        rocketGroupRef.current.position.y = 1.0;
        // Separation animation
        if (boosterRef.current && upperStageRef.current) {
          const sepDist = Math.min(3.5, (t * 0.8) % 4.0);
          boosterRef.current.position.y = -sepDist * 0.8;
          upperStageRef.current.position.y = sepDist * 0.4;
        }
      } else if (simulationType === 'orbit') {
        // Orbital trajectory around Earth
        const orbAngle = t * 0.8;
        rocketGroupRef.current.position.set(
          Math.cos(orbAngle) * 3.8,
          Math.sin(orbAngle) * 1.5,
          Math.sin(orbAngle) * 3.8
        );
        rocketGroupRef.current.rotation.y = -orbAngle + Math.PI / 2;
        rocketGroupRef.current.rotation.z = Math.sin(orbAngle) * 0.2;
      } else if (simulationType === 'landing') {
        // Landing descent towards pad
        const descentProgress = Math.max(0, 1 - (t * 0.25) % 1);
        const landY = descentProgress * 5.0 - 1.5;
        rocketGroupRef.current.position.y = landY;
        // Deploy landing legs when near ground
        if (legsRef.current) {
          const legAngle = THREE.MathUtils.lerp(
            legsRef.current.rotation.z,
            descentProgress < 0.3 ? 0.6 : 0,
            0.1
          );
          legsRef.current.rotation.z = legAngle;
        }
      }
    }

    // Flame flicker & exhaust plume
    if (flameRef.current) {
      const activeThrust = fuel > 0 && thrust > 0;
      const flicker = 0.85 + Math.sin(t * 30) * 0.25;
      const flameLength = activeThrust ? (thrust / 100) * 1.8 * flicker : 0.01;
      flameRef.current.scale.set(1 + Math.sin(t * 20) * 0.1, flameLength, 1 + Math.cos(t * 20) * 0.1);
      flameRef.current.visible = activeThrust;
    }

    // Smoke trail animation
    if (smokeGroupRef.current && fuel > 0 && thrust > 10) {
      for (let i = 0; i < smokeCount; i++) {
        const mesh = smokeGroupRef.current.children[i] as THREE.Mesh;
        if (!mesh) continue;
        const p = smokeParticles[i];
        p.y -= 0.06;
        p.scale += 0.015;
        p.opacity -= 0.015;
        if (p.y < -3.5 || p.opacity <= 0) {
          p.y = 0;
          p.x = (Math.random() - 0.5) * 0.3;
          p.z = (Math.random() - 0.5) * 0.3;
          p.scale = 0.2;
          p.opacity = 0.7;
        }
        mesh.position.set(p.x, p.y, p.z);
        mesh.scale.setScalar(p.scale);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = p.opacity;
      }
    }
  });

  return (
    <group>
      {/* ================= ENVIRONMENT / SCENERY ================= */}
      {simulationType === 'orbit' ? (
        /* EARTH GLOBE IN ORBIT MODE */
        <group position={[0, -0.5, 0]}>
          <mesh>
            <sphereGeometry args={[2.0, 32, 32]} />
            <meshStandardMaterial color="#0284c7" roughness={0.6} metalness={0.1} />
          </mesh>
          {/* Atmosphere Glow */}
          <mesh>
            <sphereGeometry args={[2.1, 32, 32]} />
            <meshPhysicalMaterial color="#38bdf8" transmission={0.9} transparent opacity={0.3} />
          </mesh>
          {/* Orbital path line */}
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <ringGeometry args={[3.78, 3.82, 64]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.4} />
          </mesh>
        </group>
      ) : (
        /* LAUNCHPAD / DRONESHIP FOUNDATION */
        <group position={[0, -1.8, 0]}>
          {/* Ground / Ocean Platform */}
          <mesh>
            <cylinderGeometry args={[4.2, 4.5, 0.4, 32]} />
            <meshStandardMaterial
              color={simulationType === 'landing' ? '#0f172a' : '#1e293b'}
              metalness={0.8}
              roughness={0.4}
            />
          </mesh>

          {/* Droneship "Of Course I Still Love You" Bullseye in Landing Mode */}
          {simulationType === 'landing' && (
            <group position={[0, 0.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, 0.6, 32]} />
              <meshBasicMaterial color="#eab308" side={THREE.DoubleSide} />
            </group>
          )}

          {/* Launch Umbilical Tower in Launch Mode */}
          {simulationType === 'launch' && (
            <group position={[-1.8, 2.5, 0]}>
              {/* Lattice Truss */}
              <mesh>
                <boxGeometry args={[0.4, 5.0, 0.4]} />
                <meshStandardMaterial color="#ef4444" wireframe />
              </mesh>
              {/* Swing arm / Fuel Umbilical */}
              <mesh position={[0.7, 1.2, 0]}>
                <boxGeometry args={[1.2, 0.12, 0.12]} />
                <meshStandardMaterial color="#94a3b8" />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* ================= 3D ROCKET ASSEMBLY ================= */}
      <group ref={rocketGroupRef} position={[0, -1.5, 0]}>
        {/* STAGE 1 BOOSTER */}
        <group ref={boosterRef}>
          {/* Booster Main Fuel Tank Cylinder */}
          <mesh position={[0, 0.9, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 2.0, 32]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.3} />
          </mesh>

          {/* Interstage Carbon Ring */}
          <mesh position={[0, 1.95, 0]}>
            <cylinderGeometry args={[0.325, 0.325, 0.15, 32]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>

          {/* Grid Fins (Aerodynamic titanium control surfaces) */}
          {[-0.34, 0.34].map((gx) => (
            <mesh key={`grid-${gx}`} position={[gx, 1.8, 0]}>
              <boxGeometry args={[0.22, 0.18, 0.03]} />
              <meshStandardMaterial color="#475569" metalness={0.9} />
            </mesh>
          ))}

          {/* Octaweb Engine Cluster / Bells */}
          <group position={[0, -0.15, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.16, 0.35, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            {[-0.14, 0.14].map((ex) => (
              <mesh key={`eng-${ex}`} position={[ex, 0, 0]} rotation={[0, 0, Math.PI]}>
                <coneGeometry args={[0.1, 0.28, 16]} />
                <meshStandardMaterial color="#334155" metalness={0.9} />
              </mesh>
            ))}
          </group>

          {/* Deployable Landing Legs */}
          <group ref={legsRef} position={[0, 0.1, 0]}>
            {[-0.35, 0.35].map((lx) => (
              <mesh key={`leg-${lx}`} position={[lx, -0.2, 0]} rotation={[0, 0, lx > 0 ? -0.3 : 0.3]}>
                <cylinderGeometry args={[0.035, 0.02, 0.8, 8]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} />
              </mesh>
            ))}
          </group>
        </group>

        {/* STAGE 2 / UPPER STAGE & PAYLOAD FAIRING */}
        <group ref={upperStageRef} position={[0, 2.05, 0]}>
          {/* Stage 2 Vacuum Tank */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.9, 32]} />
            <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.3} />
          </mesh>

          {/* Payload Aerodynamic Fairing (Nosecone) */}
          <mesh position={[0, 1.35, 0]}>
            <coneGeometry args={[0.32, 0.8, 32]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.3} />
          </mesh>

          {/* Telemetry Tag */}
          <Html position={[0, 2.1, 0]} center>
            <div className="bg-slate-900/90 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow-lg">
              {simulationType === 'staging' ? 'المرحلة الثانية (Stage 2)' : 'الصاروخ المداري'}
            </div>
          </Html>
        </group>

        {/* VOLUMETRIC EXHAUST FLAME */}
        <group position={[0, -0.4, 0]}>
          <mesh ref={flameRef} position={[0, -0.8, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.28, 1.6, 16]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.9} />
          </mesh>
          {/* Inner Blue Shock Mach Diamonds */}
          <mesh position={[0, -0.6, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.14, 0.9, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.95} />
          </mesh>
        </group>

        {/* SMOKE TRAIL PARTICLES */}
        <group ref={smokeGroupRef} position={[0, -0.6, 0]}>
          {smokeParticles.map((_, i) => (
            <mesh key={`smoke-${i}`}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color="#94a3b8" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
