import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface InterferenceDiffraction3DProps {
  mode: 'double-slit' | 'single-slit' | 'newton-rings';
  wavelength: number;     // nm (380 to 750)
  slitDistance: number;   // μm
  slitWidth: number;      // μm
  isPlaying: boolean;
}

export function wavelengthToRGB(wl: number): { r: number; g: number; b: number; hex: string } {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380);
    b = 1.0;
  } else if (wl >= 440 && wl < 490) {
    g = (wl - 440) / (490 - 440);
    b = 1.0;
  } else if (wl >= 490 && wl < 510) {
    g = 1.0;
    b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510);
    g = 1.0;
  } else if (wl >= 580 && wl < 645) {
    r = 1.0;
    g = -(wl - 645) / (645 - 580);
  } else if (wl >= 645 && wl <= 750) {
    r = 1.0;
  } else {
    r = 0.5;
    g = 0.5;
    b = 0.5;
  }
  const hex = `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
  return { r, g, b, hex };
}

export default function InterferenceDiffraction3DScene({
  mode,
  wavelength,
  slitDistance,
  slitWidth,
  isPlaying,
}: InterferenceDiffraction3DProps) {
  const timeRef = useRef(0);
  const waveGroupRef = useRef<THREE.Group>(null);
  const laserBeamRef = useRef<THREE.Mesh>(null);
  const colorData = useMemo(() => wavelengthToRGB(wavelength), [wavelength]);

  // Generate 25 fringe strips for the screen
  const fringes = useMemo(() => {
    const strips = [];
    const count = 41;
    for (let i = 0; i < count; i++) {
      const yRel = (i - Math.floor(count / 2)) * 0.12;
      let intensity = 1.0;

      if (mode === 'double-slit') {
        const dNorm = slitDistance / 30;
        const phase = yRel * dNorm * (1000 / wavelength) * 2;
        const doubleSlitFactor = Math.pow(Math.cos(phase), 2);
        const singleSlitBeta = yRel * (slitWidth / 10) * 1.5;
        const envelope = singleSlitBeta === 0 ? 1 : Math.pow(Math.sin(singleSlitBeta) / singleSlitBeta, 2);
        intensity = doubleSlitFactor * envelope;
      } else if (mode === 'single-slit') {
        const beta = yRel * (slitWidth / 8) * (800 / wavelength) * 2;
        intensity = beta === 0 ? 1 : Math.pow(Math.sin(beta) / beta, 2);
      }
      strips.push({ y: yRel, intensity: Math.max(0, Math.min(1, intensity)) });
    }
    return strips;
  }, [mode, wavelength, slitDistance, slitWidth]);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta;
    const t = timeRef.current;

    if (waveGroupRef.current) {
      waveGroupRef.current.children.forEach((child, idx) => {
        const mesh = child as THREE.Mesh;
        const scale = ((t * 1.2 + idx * 0.15) % 2.5) + 0.1;
        mesh.scale.set(scale, scale, 1);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.7 * (1 - scale / 2.6));
      });
    }

    if (laserBeamRef.current) {
      const mat = laserBeamRef.current.material as THREE.MeshBasicMaterial;
      mat.color.set(colorData.hex);
    }
  });

  return (
    <group>
      {/* OPTICAL BENCH RAIL BASE */}
      <mesh position={[0, -1.8, 0]}>
        <boxGeometry args={[9.5, 0.25, 1.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Metric Rail Scale Marks */}
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((x) => (
        <mesh key={`mark-${x}`} position={[x, -1.65, 0.85]}>
          <boxGeometry args={[0.02, 0.08, 0.1]} />
          <meshBasicMaterial color="#64748b" />
        </mesh>
      ))}

      {/* ================= MODE 1 & 2: SLIT DIFFRACTION / INTERFERENCE ================= */}
      {(mode === 'double-slit' || mode === 'single-slit') && (
        <group>
          {/* Laser Head Emitting Coherent Monochromatic Light */}
          <group position={[-4.2, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.3, 0.35, 1.2, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Laser Aperture Ring */}
            <mesh position={[0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.06, 16]} />
              <meshBasicMaterial color={colorData.hex} />
            </mesh>
            <Html position={[0, 0.8, 0]} center>
              <div className="bg-slate-900/90 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow-lg">
                ليزر أحادي اللون: {wavelength} nm
              </div>
            </Html>
          </group>

          {/* Incident Laser Beam to Barrier */}
          <mesh ref={laserBeamRef} position={[-2.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 2.6, 12]} />
            <meshBasicMaterial color={colorData.hex} transparent opacity={0.85} />
          </mesh>

          {/* Precision Slit Aperture Mount / Barrier */}
          <group position={[-1.0, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.1, 3.2, 2.0]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
            </mesh>
            {/* Slit Apertures (Glowing slots) */}
            {mode === 'double-slit' ? (
              <>
                <mesh position={[0.06, 0.25 * (slitDistance / 50), 0]}>
                  <boxGeometry args={[0.02, 0.08 * (slitWidth / 10), 0.8]} />
                  <meshBasicMaterial color={colorData.hex} />
                </mesh>
                <mesh position={[0.06, -0.25 * (slitDistance / 50), 0]}>
                  <boxGeometry args={[0.02, 0.08 * (slitWidth / 10), 0.8]} />
                  <meshBasicMaterial color={colorData.hex} />
                </mesh>
                <Html position={[0, 1.9, 0]} center>
                  <div className="bg-cyan-950/90 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap shadow-lg">
                    حاجز الشق المزدوج: d = {slitDistance} μm
                  </div>
                </Html>
              </>
            ) : (
              <>
                <mesh position={[0.06, 0, 0]}>
                  <boxGeometry args={[0.02, 0.15 * (slitWidth / 10), 0.8]} />
                  <meshBasicMaterial color={colorData.hex} />
                </mesh>
                <Html position={[0, 1.9, 0]} center>
                  <div className="bg-cyan-950/90 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap shadow-lg">
                    حاجز الشق الأحادي: a = {slitWidth} μm
                  </div>
                </Html>
              </>
            )}
          </group>

          {/* Huygens Diffracted Wavefront Rings */}
          <group ref={waveGroupRef} position={[-0.9, 0, 0]}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <mesh key={`wave-${i}`} rotation={[0, Math.PI / 2, 0]}>
                <ringGeometry args={[0.4, 0.45, 32]} />
                <meshBasicMaterial color={colorData.hex} transparent opacity={0.4} side={THREE.DoubleSide} />
              </mesh>
            ))}
          </group>

          {/* Observation Screen */}
          <group position={[3.5, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.1, 3.8, 2.4]} />
              <meshStandardMaterial color="#090d16" roughness={0.8} />
            </mesh>

            {/* Interference / Diffraction Fringe Bands on Screen */}
            {fringes.map((f, idx) => (
              <mesh key={`fringe-${idx}`} position={[-0.06, f.y, 0]}>
                <boxGeometry args={[0.02, 0.08, 2.0]} />
                <meshBasicMaterial
                  color={colorData.hex}
                  transparent
                  opacity={f.intensity * 0.95}
                />
              </mesh>
            ))}

            <Html position={[0, 2.2, 0]} center>
              <div className="bg-slate-900/90 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow-lg">
                شاشة الرصد ومخطط الهدب
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* ================= MODE 3: NEWTON'S RINGS INTERFERENCE ================= */}
      {mode === 'newton-rings' && (
        <group position={[0, 0, 0]}>
          {/* Microscope Objective Tube from Top */}
          <group position={[0, 2.0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.4, 0.5, 1.2, 32]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            <mesh position={[0, -0.65, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.15, 24]} />
              <meshBasicMaterial color={colorData.hex} />
            </mesh>
            <Html position={[0, 0.9, 0]} center>
              <div className="bg-slate-900/90 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 shadow-lg">
                مجهر ضوئي بحلقات نيوتن
              </div>
            </Html>
          </group>

          {/* Optical Flat Glass Plate (Lower) */}
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[2.0, 2.0, 0.2, 32]} />
            <meshPhysicalMaterial
              color="#e2e8f0"
              transmission={0.92}
              opacity={0.35}
              transparent
              roughness={0.05}
            />
          </mesh>

          {/* Plano-Convex Lens (Upper Lens resting on flat) */}
          <mesh position={[0, -0.25, 0]}>
            <sphereGeometry args={[1.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 4]} />
            <meshPhysicalMaterial
              color="#93c5fd"
              transmission={0.9}
              opacity={0.4}
              transparent
              roughness={0.05}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Newton's Concentric Rings Projected on Interface */}
          <group position={[0, -0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {/* Dark Central Spot (Destructive reflection phase change π) */}
            <mesh>
              <circleGeometry args={[0.08, 32]} />
              <meshBasicMaterial color="#020617" />
            </mesh>

            {/* Concentric Newton Rings */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => {
              const radius = Math.sqrt(n * (wavelength / 550) * 0.18);
              return (
                <mesh key={`newton-ring-${n}`}>
                  <ringGeometry args={[radius, radius + 0.045, 64]} />
                  <meshBasicMaterial
                    color={colorData.hex}
                    transparent
                    opacity={0.85 / Math.sqrt(n)}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              );
            })}
          </group>
        </group>
      )}
    </group>
  );
}
