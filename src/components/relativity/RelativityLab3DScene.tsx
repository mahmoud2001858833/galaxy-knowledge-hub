import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Relativity3DProps {
  mode: 'time-dilation' | 'length-contraction' | 'mass-energy';
  velocityPercent: number; // 0 to 99%
  gamma: number;
  isPlaying: boolean;
}

export default function RelativityLab3DScene({
  mode,
  velocityPercent,
  gamma,
  isPlaying,
}: Relativity3DProps) {
  const timeRef = useRef(0);
  const beta = velocityPercent / 100;

  // Mode 1: Moving light clock photon
  const photonRef = useRef<THREE.Mesh>(null);
  const lightClockRef = useRef<THREE.Group>(null);
  const stationaryPhotonRef = useRef<THREE.Mesh>(null);

  // Mode 2: Relativistic Spaceship
  const spaceshipRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Group>(null);

  // Starfield warp tunnel particles
  const starCount = 120;
  const starData = useMemo(() => {
    return Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 4,
      z: -6 + Math.random() * 12,
      speed: 0.1 + Math.random() * 0.1,
    }));
  }, [starCount]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    const t = timeRef.current;

    // 1. LIGHT CLOCK PHOTON BOUNCING
    const bounceHeight = 1.6;
    const bouncePeriod = 1.2;
    const stationaryY = Math.abs((t % bouncePeriod) - (bouncePeriod / 2)) / (bouncePeriod / 2) * bounceHeight - bounceHeight / 2;

    if (stationaryPhotonRef.current) {
      stationaryPhotonRef.current.position.y = stationaryY;
    }

    // Moving clock bounces slower by 1 / gamma
    const movingPeriod = bouncePeriod * gamma;
    const movingY = Math.abs((t % movingPeriod) - (movingPeriod / 2)) / (movingPeriod / 2) * bounceHeight - bounceHeight / 2;

    if (photonRef.current) {
      photonRef.current.position.y = movingY;
    }

    // 2. RELATIVISTIC SPACESHIP CONTRACTION
    if (spaceshipRef.current) {
      // Contract length along X-axis: scaleX = 1 / gamma
      const contractedScaleX = Math.max(0.08, 1 / gamma);
      spaceshipRef.current.scale.set(contractedScaleX, 1, 1);
      // Gentle drift
      spaceshipRef.current.position.x = Math.sin(t * 1.5) * 0.2;
    }

    // Starfield warp effect
    if (starsRef.current) {
      const warpSpeed = 1 + beta * 8;
      for (let i = 0; i < starCount; i++) {
        const star = starData[i];
        const mesh = starsRef.current.children[i] as THREE.Mesh;
        if (!mesh) continue;

        star.x -= star.speed * warpSpeed * delta * 4;
        if (star.x < -5.5) {
          star.x = 5.5;
          star.y = (Math.random() - 0.5) * 4;
          star.z = (Math.random() - 0.5) * 4;
        }

        mesh.position.set(star.x, star.y, star.z);

        // Relativistic Doppler color shift: blue in front, red behind
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (beta > 0.6) {
          mat.color.setHex(0x38bdf8); // Relativistic blueshift
        } else {
          mat.color.setHex(0xe2e8f0);
        }
      }
    }
  });

  return (
    <group>
      {/* ================= MODE 1: EINSTEIN LIGHT CLOCKS ================= */}
      {mode === 'time-dilation' && (
        <group>
          {/* STATIONARY LIGHT CLOCK (Left) */}
          <group position={[-2.4, 0, 0]}>
            {/* Top Mirror */}
            <mesh position={[0, 0.9, 0]}>
              <boxGeometry args={[0.8, 0.08, 0.5]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Bottom Mirror */}
            <mesh position={[0, -0.9, 0]}>
              <boxGeometry args={[0.8, 0.08, 0.5]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Support Rods */}
            {[-0.35, 0.35].map((rx) => (
              <mesh key={`rod-stat-${rx}`} position={[rx, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
            ))}
            {/* Stationary Photon (Bounces straight up and down) */}
            <mesh ref={stationaryPhotonRef} position={[0, 0, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>

            <Html position={[0, 1.35, 0]} center>
              <div className="bg-emerald-950/90 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/40 whitespace-nowrap shadow-lg">
                ساعة السكون (Rest Clock): Δt₀ = 1.0 s
              </div>
            </Html>
          </group>

          {/* MOVING LIGHT CLOCK (Right) */}
          <group ref={lightClockRef} position={[2.4, 0, 0]}>
            {/* Top Mirror */}
            <mesh position={[0, 0.9, 0]}>
              <boxGeometry args={[0.8, 0.08, 0.5]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Bottom Mirror */}
            <mesh position={[0, -0.9, 0]}>
              <boxGeometry args={[0.8, 0.08, 0.5]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Support Rods */}
            {[-0.35, 0.35].map((rx) => (
              <mesh key={`rod-mov-${rx}`} position={[rx, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
            ))}
            {/* Moving Photon (Bounces slower due to diagonal path) */}
            <mesh ref={photonRef} position={[0, 0, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>

            <Html position={[0, 1.35, 0]} center>
              <div className="bg-amber-950/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 whitespace-nowrap shadow-lg">
                ساعة الحركة: Δt = {gamma.toFixed(2)} s (تأخر {((1 - 1 / gamma) * 100).toFixed(0)}%)
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* ================= MODE 2: LORENTZ LENGTH CONTRACTION ================= */}
      {mode === 'length-contraction' && (
        <group>
          {/* Relativistic Warp Stars */}
          <group ref={starsRef}>
            {starData.map((_, i) => (
              <mesh key={`star-${i}`}>
                <boxGeometry args={[0.15, 0.02, 0.02]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
              </mesh>
            ))}
          </group>

          {/* Reference Rest Frame Ghost Spaceship Outline (Above) */}
          <group position={[0, 1.4, 0]}>
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.6, 3.2, 16]} />
              <meshStandardMaterial color="#10b981" wireframe transparent opacity={0.4} />
            </mesh>
            <Html position={[0, 0.9, 0]} center>
              <div className="bg-emerald-950/90 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/40 whitespace-nowrap shadow-lg">
                إطار السكون الأصلي L₀ = 100 m
              </div>
            </Html>
          </group>

          {/* Moving Relativistic Spaceship (Center) */}
          <group ref={spaceshipRef} position={[0, -0.6, 0]}>
            {/* Main Hull Cone */}
            <mesh rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.6, 3.2, 24]} />
              <meshStandardMaterial
                color={beta > 0.8 ? '#f43f5e' : '#e2e8f0'}
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
            {/* Cockpit Canopy */}
            <mesh position={[0.4, 0.2, 0]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshPhysicalMaterial color="#38bdf8" transmission={0.9} transparent opacity={0.7} />
            </mesh>
            {/* Plasma Engine Exhaust */}
            <mesh position={[-1.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <coneGeometry args={[0.3, 0.9, 16]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>

            <Html position={[0, -0.9, 0]} center>
              <div className="bg-rose-950/90 text-rose-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-500/40 whitespace-nowrap shadow-lg">
                الطول المتقلص L = {(100 / gamma).toFixed(1)} m (انكماش {((1 - 1 / gamma) * 100).toFixed(0)}%)
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* ================= MODE 3: MASS-ENERGY EQUIVALENCE ================= */}
      {mode === 'mass-energy' && (
        <group>
          {/* Particle Accelerator Ring Channel */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.8, 0.25, 16, 64]} />
            <meshPhysicalMaterial
              color="#334155"
              metalness={0.9}
              roughness={0.2}
              transmission={0.7}
              transparent
              opacity={0.5}
            />
          </mesh>

          {/* Magnetic Quadrupole Coils */}
          {[-2.8, 0, 2.8].map((px) => (
            <mesh key={`quad-${px}`} position={[px, 0, 0]}>
              <boxGeometry args={[0.6, 0.8, 0.8]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.8} />
            </mesh>
          ))}

          {/* Relativistic Mass Sphere (Expands as gamma grows) */}
          <group position={[Math.cos(timeRef.current * 4) * 2.8, 0, Math.sin(timeRef.current * 4) * 2.8]}>
            <mesh scale={Math.min(2.5, Math.pow(gamma, 0.45))}>
              <sphereGeometry args={[0.18, 24, 24]} />
              <meshStandardMaterial color="#ec4899" roughness={0.3} metalness={0.7} />
            </mesh>
            <pointLight color="#ec4899" intensity={2} distance={3} />
          </group>

          <Html position={[0, 0, 0]} center>
            <div className="bg-slate-900/90 text-center p-3 rounded-2xl border border-slate-700 shadow-2xl space-y-1">
              <div className="text-sm font-bold font-mono text-pink-400">E = γ m₀ c²</div>
              <div className="text-xs text-slate-300">الكتلة النسبية: m = {(1 * gamma).toFixed(2)} m₀</div>
              <div className="text-[10px] text-slate-500">الطاقة الحركية: KE = (γ - 1) m₀ c²</div>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
