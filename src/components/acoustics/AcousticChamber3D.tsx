import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface AcousticChamber3DProps {
  simulationType: 'wave' | 'doppler' | 'interference';
  frequency: number;       // Hz
  amplitude: number;       // %
  waveType: 'sine' | 'square' | 'triangle' | 'sawtooth';
  dopplerSpeed: number;    // m/s
  isPlaying: boolean;
}

export default function AcousticChamber3D({
  simulationType,
  frequency,
  amplitude,
  waveType,
  dopplerSpeed,
  isPlaying,
}: AcousticChamber3DProps) {
  const timeRef = useRef(0);
  const waveRibbonRef = useRef<THREE.Mesh>(null);
  const dopplerVehicleRef = useRef<THREE.Group>(null);
  const shockConeRef = useRef<THREE.Mesh>(null);

  // Mode 1: 3D Air Molecule Particles (Longitudinal / Transverse compression)
  const particleCount = 100;
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, idx) => {
      const baseX = (idx / particleCount) * 8 - 4;
      const baseY = (Math.random() - 0.5) * 1.5;
      const baseZ = (Math.random() - 0.5) * 1.5;
      return { baseX, baseY, baseZ };
    });
  }, [particleCount]);

  const particlesRef = useRef<THREE.Group>(null);

  // Mode 2: Doppler expanding sound shells (10 shells)
  const shellCount = 8;
  const shellData = useMemo(() => {
    return Array.from({ length: shellCount }, (_, idx) => ({
      originX: 0,
      radius: idx * 0.6,
      opacity: 1,
    }));
  }, [shellCount]);
  const shellsGroupRef = useRef<THREE.Group>(null);

  // Mode 3: Interference grid
  const gridSize = 32;
  const surfaceGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(8, 8, gridSize, gridSize);
  }, [gridSize]);
  const surfaceRef = useRef<THREE.Mesh>(null);

  const speedOfSound = 343; // m/s
  const machNumber = (dopplerSpeed * 3) / speedOfSound;

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    const t = timeRef.current;
    const omega = (frequency / 200) * Math.PI * 2;
    const k = (frequency / 100) * 1.2;

    // 1. WAVE SIMULATION PARTICLES
    if (simulationType === 'wave' && particlesRef.current) {
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        const mesh = particlesRef.current.children[i] as THREE.Mesh;
        if (!mesh) continue;

        const phase = k * p.baseX - omega * t;
        let displacement = 0;
        switch (waveType) {
          case 'sine':
            displacement = Math.sin(phase);
            break;
          case 'square':
            displacement = Math.sign(Math.sin(phase));
            break;
          case 'triangle':
            displacement = (2 / Math.PI) * Math.asin(Math.sin(phase));
            break;
          case 'sawtooth':
            displacement = 2 * ((phase / (2 * Math.PI)) % 1) - 1;
            break;
        }

        const ampNorm = (amplitude / 100) * 0.45;
        // Longitudinal oscillation along X and transverse along Y
        mesh.position.set(
          p.baseX + displacement * ampNorm * 0.8,
          p.baseY + displacement * ampNorm,
          p.baseZ
        );

        // Color coding by compression
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (displacement > 0.3) {
          mat.color.setHex(0x10b981); // Crest / compression (green)
        } else if (displacement < -0.3) {
          mat.color.setHex(0x38bdf8); // Trough / rarefaction (cyan)
        } else {
          mat.color.setHex(0xf59e0b); // Neutral (amber)
        }
      }
    }

    // 2. DOPPLER SIMULATION
    if (simulationType === 'doppler') {
      const vehicleX = Math.sin(t * 1.5) * 2.8;
      const vehicleVx = Math.cos(t * 1.5) * (dopplerSpeed / 18);

      if (dopplerVehicleRef.current) {
        dopplerVehicleRef.current.position.x = vehicleX;
        dopplerVehicleRef.current.rotation.y = vehicleVx >= 0 ? 0 : Math.PI;
      }

      // Update shells
      if (shellsGroupRef.current) {
        for (let i = 0; i < shellCount; i++) {
          const mesh = shellsGroupRef.current.children[i] as THREE.Mesh;
          if (!mesh) continue;

          const progress = ((t * 1.2 + i * (1 / shellCount)) % 1);
          const currentRadius = progress * 4.0 + 0.1;
          // Offset origin in opposite direction of movement
          const originX = vehicleX - vehicleVx * progress * 1.2;

          mesh.position.set(originX, 0, 0);
          mesh.scale.set(currentRadius, currentRadius, currentRadius);
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.max(0, 0.6 * (1 - progress));
        }
      }
    }

    // 3. INTERFERENCE SURFACE
    if (simulationType === 'interference' && surfaceRef.current) {
      const posAttr = surfaceGeometry.attributes.position;
      const s1 = new THREE.Vector2(-1.8, 0);
      const s2 = new THREE.Vector2(1.8, 0);

      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const d1 = Math.sqrt((x - s1.x) ** 2 + (y - s1.y) ** 2);
        const d2 = Math.sqrt((x - s2.x) ** 2 + (y - s2.y) ** 2);

        const z1 = Math.sin(k * d1 - omega * t);
        const z2 = Math.sin(k * d2 - omega * t);
        const zTotal = (z1 + z2) * (amplitude / 100) * 0.35;

        posAttr.setZ(i, zTotal);
      }
      posAttr.needsUpdate = true;
      surfaceGeometry.computeVertexNormals();
    }
  });

  return (
    <group>
      {/* ANECHOIC CHAMBER SURROUNDING WEDGES */}
      <mesh position={[0, -2.0, 0]}>
        <boxGeometry args={[10.5, 0.3, 10.5]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.4} />
      </mesh>

      {/* Acoustic Foam Wedges Grid on Floor */}
      {[-4, -2, 0, 2, 4].map((x) =>
        [-4, -2, 0, 2, 4].map((z) => (
          <mesh key={`wedge-${x}-${z}`} position={[x, -1.75, z]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[0.3, 0.4, 4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* ===================== MODE 1: 3D SOUND PRESSURE WAVE ===================== */}
      {simulationType === 'wave' && (
        <group>
          {/* 3D Speaker Emitter on the Left */}
          <group position={[-4.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.9, 0.4, 0.8, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.41, 0]}>
              <cylinderGeometry args={[0.75, 0.75, 0.05, 24]} />
              <meshStandardMaterial color="#0284c7" />
            </mesh>
            <Html position={[0, 1.2, 0]} center>
              <div className="bg-slate-900/90 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap shadow-lg">
                مكبر الصوت: {frequency} Hz
              </div>
            </Html>
          </group>

          {/* 3D Air Molecule Particles Field */}
          <group ref={particlesRef}>
            {particles.map((_, i) => (
              <mesh key={`air-part-${i}`}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshStandardMaterial color="#10b981" roughness={0.3} />
              </mesh>
            ))}
          </group>

          {/* Wave Envelope Boundary Lines */}
          <mesh position={[0, (amplitude / 100) * 0.8 + 0.5, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 8.5, 8]} rotation={[0, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, -((amplitude / 100) * 0.8 + 0.5), 0]}>
            <cylinderGeometry args={[0.015, 0.015, 8.5, 8]} rotation={[0, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
          </mesh>
        </group>
      )}

      {/* ===================== MODE 2: 3D DOPPLER EFFECT ===================== */}
      {simulationType === 'doppler' && (
        <group>
          {/* Moving Sound Vehicle (Siren) */}
          <group ref={dopplerVehicleRef} position={[0, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.9, 0.45, 0.5]} />
              <meshStandardMaterial color="#ef4444" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Siren Beacon */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <Html position={[0, 0.7, 0]} center>
              <div className="bg-red-950/90 text-red-200 text-[10px] font-mono px-2 py-0.5 rounded border border-red-500/50 shadow-lg whitespace-nowrap">
                مصدر متحرك {dopplerSpeed} m/s
              </div>
            </Html>
          </group>

          {/* Expanding Spherical Sound Wave Shells */}
          <group ref={shellsGroupRef}>
            {shellData.map((_, i) => (
              <mesh key={`doppler-shell-${i}`}>
                <ringGeometry args={[1, 1.04, 32]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>

          {/* Stationary Observers (Front & Rear) */}
          <group position={[3.8, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
              <meshStandardMaterial color="#10b981" />
            </mesh>
            <Html position={[0, 0.7, 0]} center>
              <div className="bg-emerald-950/90 text-emerald-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/40 whitespace-nowrap shadow-lg">
                راصد أمامي (تردد مرتفع)
              </div>
            </Html>
          </group>

          <group position={[-3.8, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
            <Html position={[0, 0.7, 0]} center>
              <div className="bg-blue-950/90 text-blue-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-blue-500/40 whitespace-nowrap shadow-lg">
                راصد خلفي (تردد منخفض)
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* ===================== MODE 3: 3D ACOUSTIC INTERFERENCE ===================== */}
      {simulationType === 'interference' && (
        <group>
          {/* Dual Speakers */}
          <group position={[-1.8, 0, -2.5]}>
            <mesh rotation={[Math.PI / 4, 0, 0]}>
              <cylinderGeometry args={[0.5, 0.25, 0.6, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <Html position={[0, 0.6, 0]} center>
              <div className="bg-slate-900/90 text-cyan-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap shadow-lg">
                مصدر S1
              </div>
            </Html>
          </group>

          <group position={[1.8, 0, -2.5]}>
            <mesh rotation={[Math.PI / 4, 0, 0]}>
              <cylinderGeometry args={[0.5, 0.25, 0.6, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <Html position={[0, 0.6, 0]} center>
              <div className="bg-slate-900/90 text-cyan-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap shadow-lg">
                مصدر S2
              </div>
            </Html>
          </group>

          {/* 3D Wave Interference Mesh Surface */}
          <mesh
            ref={surfaceRef}
            geometry={surfaceGeometry}
            rotation={[-Math.PI / 2.5, 0, 0]}
            position={[0, -0.4, 0]}
          >
            <meshStandardMaterial
              color="#0284c7"
              wireframe
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
