import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface FluidLab3DProps {
  mode: 'archimedes' | 'pascal' | 'bernoulli';
  fluidDensity: number;    // kg/m³
  objectDensity: number;   // kg/m³
  pipeRadius: number;      // mm or arbitrary unit
  isPlaying: boolean;
}

export default function FluidLab3DScene({
  mode,
  fluidDensity,
  objectDensity,
  pipeRadius,
  isPlaying,
}: FluidLab3DProps) {
  // Common time ticker
  const timeRef = useRef(0);

  // ARCHIMEDES REFS & MEMO
  const archimedesRatio = objectDensity / fluidDensity;
  const submergedFraction = Math.min(1, Math.max(0, archimedesRatio));
  const buoyantForce = submergedFraction * fluidDensity * 0.0098;
  const gravityForce = objectDensity * 0.0098;

  // PASCAL CONSTANTS
  const leftRadius = 0.5;
  const rightRadius = 1.3;
  const areaRatio = Math.pow(rightRadius / leftRadius, 2);

  // BERNOULLI PARTICLES
  const particleCount = 75;
  const particleData = useMemo(() => {
    return Array.from({ length: particleCount }, () => ({
      x: -4 + Math.random() * 8,
      y: (Math.random() - 0.5) * 0.8,
      z: (Math.random() - 0.5) * 0.8,
      offset: Math.random() * 10,
    }));
  }, [particleCount]);

  const venturiRef = useRef<THREE.Group>(null);
  const cubeRef = useRef<THREE.Mesh>(null);
  const leftPistonRef = useRef<THREE.Group>(null);
  const rightPistonRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    const t = timeRef.current;

    // Archimedes floating oscillation
    if (cubeRef.current) {
      const bobbing = Math.sin(t * 2) * 0.04;
      let targetY = 0;
      if (archimedesRatio < 1) {
        // Floating: rests near surface with submerged proportion
        targetY = 0.6 - (1 - submergedFraction) * 0.7 + bobbing;
      } else if (archimedesRatio === 1) {
        // Neutral buoyancy
        targetY = 0.0 + bobbing;
      } else {
        // Sinking to bottom
        targetY = -1.1 + Math.sin(t * 0.5) * 0.01;
      }
      cubeRef.current.position.y = THREE.MathUtils.lerp(cubeRef.current.position.y, targetY, 0.08);
    }

    // Pascal hydraulic press pulsation
    if (leftPistonRef.current && rightPistonRef.current) {
      const stroke = Math.sin(t * 1.5) * 0.35;
      leftPistonRef.current.position.y = 0.5 + stroke;
      // Right piston moves inversely scaled by 1 / areaRatio
      rightPistonRef.current.position.y = 0.2 - stroke / areaRatio;
    }

    // Bernoulli Venturi particle flow
    if (venturiRef.current && mode === 'bernoulli') {
      for (let i = 0; i < particleCount; i++) {
        const p = particleData[i];
        const mesh = venturiRef.current.children[i] as THREE.Mesh;
        if (!mesh) continue;

        // Throat constriction is between x = -1.2 and x = 1.2
        const inThroat = Math.abs(p.x) < 1.0;
        const currentSpeed = inThroat ? 3.5 : 1.2;
        p.x += currentSpeed * delta;

        if (p.x > 4.2) {
          p.x = -4.2;
        }

        // Radial scale based on pipe width
        const widthFactor = inThroat ? 0.45 : 0.95;
        mesh.position.set(p.x, p.y * widthFactor, p.z * widthFactor);

        // Color coding by velocity / pressure
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (inThroat) {
          mat.color.setHex(0x38bdf8); // High speed, low pressure (cyan)
        } else {
          mat.color.setHex(0x3b82f6); // Low speed, higher pressure (blue)
        }
      }
    }
  });

  return (
    <group>
      {/* ===================== MODE 1: ARCHIMEDES BUOYANCY ===================== */}
      {mode === 'archimedes' && (
        <group>
          {/* Glass Beaker Vessel */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1.8, 1.8, 3.2, 32, 1, true]} />
            <meshPhysicalMaterial
              color="#94a3b8"
              transmission={0.92}
              opacity={0.3}
              transparent
              roughness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Glass Base */}
          <mesh position={[0, -1.6, 0]}>
            <cylinderGeometry args={[1.85, 1.85, 0.1, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>

          {/* Liquid Volume */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[1.76, 1.76, 2.7, 32]} />
            <meshPhysicalMaterial
              color={fluidDensity >= 1200 ? '#eab308' : fluidDensity <= 800 ? '#f97316' : '#0284c7'}
              transmission={0.7}
              opacity={0.65}
              transparent
              roughness={0.1}
            />
          </mesh>

          {/* Meniscus / Liquid Surface Ring */}
          <mesh position={[0, 1.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0, 1.76, 32]} />
            <meshBasicMaterial color="#38bdf8" opacity={0.4} transparent />
          </mesh>

          {/* Submerged / Floating Object */}
          <mesh
            ref={cubeRef}
            position={[0, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.9, 0.9, 0.9]} />
            <meshStandardMaterial
              color={archimedesRatio > 1 ? '#ef4444' : archimedesRatio === 1 ? '#eab308' : '#10b981'}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>

          {/* Buoyant Force Vector (Green Upward Arrow) */}
          <group position={[0.7, 0, 0]}>
            <mesh position={[0, Math.min(1.2, buoyantForce / 15), 0]}>
              <cylinderGeometry args={[0.03, 0.03, Math.min(1.2, buoyantForce / 7.5), 8]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
            <mesh position={[0, Math.min(1.2, buoyantForce / 15) * 2 + 0.1, 0]}>
              <coneGeometry args={[0.08, 0.2, 8]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
            <Html position={[0, Math.min(1.2, buoyantForce / 15) * 2 + 0.35, 0]} center>
              <div className="bg-emerald-950/90 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/40 whitespace-nowrap shadow-lg">
                قوة الطفو Fb: {(buoyantForce * 100).toFixed(1)} N
              </div>
            </Html>
          </group>

          {/* Weight Force Vector (Red Downward Arrow) */}
          <group position={[-0.7, 0, 0]}>
            <mesh position={[0, -Math.min(1.2, gravityForce / 15), 0]}>
              <cylinderGeometry args={[0.03, 0.03, Math.min(1.2, gravityForce / 7.5), 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, -Math.min(1.2, gravityForce / 15) * 2 - 0.1, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.08, 0.2, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <Html position={[0, -Math.min(1.2, gravityForce / 15) * 2 - 0.35, 0]} center>
              <div className="bg-red-950/90 text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/40 whitespace-nowrap shadow-lg">
                الوزن W: {(gravityForce * 100).toFixed(1)} N
              </div>
            </Html>
          </group>

          {/* Depth Markings on Beaker */}
          {[-1.0, -0.5, 0.0, 0.5, 1.0].map((dy) => (
            <mesh key={`mark-${dy}`} position={[1.81, dy, 0]}>
              <boxGeometry args={[0.05, 0.02, 0.2]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
          ))}
        </group>
      )}

      {/* ===================== MODE 2: PASCAL HYDRAULIC PRESS ===================== */}
      {mode === 'pascal' && (
        <group>
          {/* Base Foundation */}
          <mesh position={[0, -1.8, 0]}>
            <boxGeometry args={[5.2, 0.3, 2.5]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>

          {/* Left Cylinder (Narrow A1) */}
          <mesh position={[-1.6, -0.4, 0]}>
            <cylinderGeometry args={[leftRadius, leftRadius, 2.4, 24, 1, true]} />
            <meshPhysicalMaterial color="#94a3b8" transmission={0.85} opacity={0.35} transparent side={THREE.DoubleSide} />
          </mesh>

          {/* Right Cylinder (Wide A2) */}
          <mesh position={[1.4, -0.4, 0]}>
            <cylinderGeometry args={[rightRadius, rightRadius, 2.4, 32, 1, true]} />
            <meshPhysicalMaterial color="#94a3b8" transmission={0.85} opacity={0.35} transparent side={THREE.DoubleSide} />
          </mesh>

          {/* Horizontal Connecting Pipe */}
          <mesh position={[-0.1, -1.35, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.3, 0.3, 3.2, 24]} />
            <meshPhysicalMaterial color="#0284c7" opacity={0.7} transparent roughness={0.1} />
          </mesh>

          {/* Hydraulic Fluid in Cylinders */}
          <mesh position={[-1.6, -0.9, 0]}>
            <cylinderGeometry args={[leftRadius - 0.02, leftRadius - 0.02, 1.4, 24]} />
            <meshStandardMaterial color="#0284c7" opacity={0.85} transparent />
          </mesh>
          <mesh position={[1.4, -0.9, 0]}>
            <cylinderGeometry args={[rightRadius - 0.02, rightRadius - 0.02, 1.4, 32]} />
            <meshStandardMaterial color="#0284c7" opacity={0.85} transparent />
          </mesh>

          {/* Left Input Piston Assembly */}
          <group ref={leftPistonRef} position={[-1.6, 0.5, 0]}>
            <mesh>
              <cylinderGeometry args={[leftRadius - 0.04, leftRadius - 0.04, 0.25, 24]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1.4, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
            </mesh>
            {/* Input Force Arrow */}
            <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI]}>
              <coneGeometry args={[0.12, 0.25, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <Html position={[0, 2.2, 0]} center>
              <div className="bg-amber-950/90 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 whitespace-nowrap shadow-lg">
                قوة الإدخال F1 = 50 N
              </div>
            </Html>
          </group>

          {/* Right Output Piston Assembly (Large Area) */}
          <group ref={rightPistonRef} position={[1.4, 0.2, 0]}>
            <mesh>
              <cylinderGeometry args={[rightRadius - 0.04, rightRadius - 0.04, 0.35, 32]} />
              <meshStandardMaterial color="#10b981" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 1.0, 16]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
            </mesh>
            {/* Heavy Car / Load on Top */}
            <mesh position={[0, 1.3, 0]}>
              <boxGeometry args={[1.8, 0.4, 1.0]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 1.7, 0]}>
              <boxGeometry args={[1.2, 0.5, 0.9]} />
              <meshStandardMaterial color="#3b82f6" metalness={0.7} />
            </mesh>
            <Html position={[0, 2.2, 0]} center>
              <div className="bg-emerald-950/90 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/40 whitespace-nowrap shadow-lg">
                قوة الرفع F2 = {(50 * areaRatio).toFixed(0)} N (مضاعفة {areaRatio.toFixed(1)}×)
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* ===================== MODE 3: BERNOULLI VENTURI TUBE ===================== */}
      {mode === 'bernoulli' && (
        <group>
          {/* Inlet Wide Tube (Left) */}
          <mesh position={[-2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1.1, 1.1, 3.0, 32, 1, true]} />
            <meshPhysicalMaterial color="#94a3b8" transmission={0.9} opacity={0.3} transparent side={THREE.DoubleSide} />
          </mesh>

          {/* Narrow Constriction Throat (Center) */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.5, 0.5, 2.0, 32, 1, true]} />
            <meshPhysicalMaterial color="#38bdf8" transmission={0.9} opacity={0.35} transparent side={THREE.DoubleSide} />
          </mesh>

          {/* Outlet Wide Tube (Right) */}
          <mesh position={[2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1.1, 1.1, 3.0, 32, 1, true]} />
            <meshPhysicalMaterial color="#94a3b8" transmission={0.9} opacity={0.3} transparent side={THREE.DoubleSide} />
          </mesh>

          {/* Left Transition Cone */}
          <mesh position={[-1.25, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[1.1, 0.5, 0.5, 32, 1, true]} />
            <meshPhysicalMaterial color="#94a3b8" transmission={0.9} opacity={0.3} transparent side={THREE.DoubleSide} />
          </mesh>

          {/* Right Transition Cone */}
          <mesh position={[1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[1.1, 0.5, 0.5, 32, 1, true]} />
            <meshPhysicalMaterial color="#94a3b8" transmission={0.9} opacity={0.3} transparent side={THREE.DoubleSide} />
          </mesh>

          {/* Vertical Manometers (Liquid Standpipes) */}
          {/* 1. Inlet Manometer (High Liquid Column = High Pressure) */}
          <group position={[-2.5, 1.1, 0]}>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1.6, 16, 1, true]} />
              <meshPhysicalMaterial color="#94a3b8" transmission={0.9} opacity={0.35} transparent side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 1.2, 16]} />
              <meshStandardMaterial color="#0284c7" opacity={0.85} transparent />
            </mesh>
            <Html position={[0, 1.8, 0]} center>
              <div className="bg-sky-950/90 text-sky-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-sky-400/40 whitespace-nowrap shadow-lg">
                P1: ضغط مرتفع
              </div>
            </Html>
          </group>

          {/* 2. Throat Manometer (Low Liquid Column = Low Pressure) */}
          <group position={[0, 0.5, 0]}>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1.6, 16, 1, true]} />
              <meshPhysicalMaterial color="#94a3b8" transmission={0.9} opacity={0.35} transparent side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.4, 16]} />
              <meshStandardMaterial color="#0284c7" opacity={0.85} transparent />
            </mesh>
            <Html position={[0, 1.8, 0]} center>
              <div className="bg-cyan-950/90 text-cyan-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-cyan-400/40 whitespace-nowrap shadow-lg">
                P2: ضغط منخفض (سرعة عالية)
              </div>
            </Html>
          </group>

          {/* 3. Outlet Manometer (Recovered Pressure) */}
          <group position={[2.5, 1.1, 0]}>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1.6, 16, 1, true]} />
              <meshPhysicalMaterial color="#94a3b8" transmission={0.9} opacity={0.35} transparent side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 1.1, 16]} />
              <meshStandardMaterial color="#0284c7" opacity={0.85} transparent />
            </mesh>
            <Html position={[0, 1.8, 0]} center>
              <div className="bg-sky-950/90 text-sky-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-sky-400/40 whitespace-nowrap shadow-lg">
                P3: ضغط مستعاد
              </div>
            </Html>
          </group>

          {/* Fluid Streamline Particles */}
          <group ref={venturiRef}>
            {particleData.map((_, idx) => (
              <mesh key={`venturi-part-${idx}`}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
              </mesh>
            ))}
          </group>
        </group>
      )}
    </group>
  );
}
