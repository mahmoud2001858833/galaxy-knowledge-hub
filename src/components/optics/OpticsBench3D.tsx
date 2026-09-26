import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export type OpticsMode = 'prism' | 'lens' | 'interference' | 'polarization';

interface OpticsBench3DProps {
  mode: OpticsMode;
  prismAngle: number;
  focalLength: number;
  lensType: 'convex' | 'concave';
  slitDistance: number;
  polarizerAngle: number;
  isPlaying: boolean;
  cameraPreset: 'bench' | 'prism' | 'screen' | 'top';
}

// -------------------------------------------------------------
// Sub-component: 3D Dispersive Glass Prism with Snell Rays
// -------------------------------------------------------------
function PrismMode3D({ prismAngle }: { prismAngle: number }) {
  const prismRef = useRef<THREE.Mesh>(null);

  // Generate triangular prism geometry based on apex angle
  const { geometry, rays } = useMemo(() => {
    const angleRad = (prismAngle * Math.PI) / 180;
    const side = 2.4;
    const height = 2.2;
    const halfWidth = side * Math.sin(angleRad / 2);
    const depth = 3.0;

    const shape = new THREE.Shape();
    shape.moveTo(0, height / 2);
    shape.lineTo(-halfWidth, -height / 2);
    shape.lineTo(halfWidth, -height / 2);
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth,
      bevelEnabled: false,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();

    // Calculate Snell's law refraction for 7 spectral colors:
    // Cauchy dispersion formula: n(lambda) = 1.51 + B / lambda^2
    const spectralColors = [
      { name: 'Red', color: '#ef4444', n: 1.512 },
      { name: 'Orange', color: '#f97316', n: 1.515 },
      { name: 'Yellow', color: '#eab308', n: 1.518 },
      { name: 'Green', color: '#22c55e', n: 1.522 },
      { name: 'Cyan', color: '#06b6d4', n: 1.526 },
      { name: 'Blue', color: '#3b82f6', n: 1.530 },
      { name: 'Violet', color: '#a855f7', n: 1.536 },
    ];

    const incidentAngle = 0.52; // ~30 deg
    const rayLines = spectralColors.map((sc) => {
      // Snell: sin(theta2) = sin(theta1) / n
      const thetaRefracted = Math.asin(Math.sin(incidentAngle) / sc.n);
      const exitAngle = thetaRefracted * 1.6;

      // Points: Laser source -> Prism entry face -> Prism exit face -> Detector screen
      const p0 = new THREE.Vector3(-4.5, 0, 0);
      const p1 = new THREE.Vector3(-halfWidth * 0.8, -0.2, 0);
      const p2 = new THREE.Vector3(halfWidth * 0.8, -0.1 + (sc.n - 1.52) * 0.8, 0);
      const p3 = new THREE.Vector3(4.5, 0.4 + (sc.n - 1.52) * 4.5, 0);

      const lineGeom = new THREE.BufferGeometry().setFromPoints([p0, p1, p2, p3]);
      return { geom: lineGeom, color: sc.color, name: sc.name };
    });

    return { geometry: geom, rays: rayLines };
  }, [prismAngle]);

  return (
    <group>
      {/* 3D Glass Prism */}
      <mesh ref={prismRef} geometry={geometry} rotation={[0, 0, 0]}>
        <meshPhysicalMaterial
          color="#dbeafe"
          transmission={0.94}
          opacity={0.4}
          transparent
          roughness={0.05}
          ior={1.52}
          reflectivity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Incident White Laser Beam */}
      <mesh position={[-2.4, -0.1, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 4.2, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      {/* Laser Emitter Torch */}
      <group position={[-4.5, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.25, 0.9, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        <pointLight color="#ffffff" intensity={2.5} distance={5} />
      </group>

      {/* 7 Dispersed Spectral Rays */}
      {rays.map((ray, i) => (
        <primitive
          key={i}
          object={
            new THREE.Line(
              ray.geom,
              new THREE.LineBasicMaterial({ color: ray.color, linewidth: 2, transparent: true, opacity: 0.9 })
            )
          }
        />
      ))}

      {/* White Observation Screen */}
      <group position={[4.6, 0.5, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.5, 3.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <Html position={[0, 1.8, 0]} center>
          <div className="bg-slate-900/90 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/40 whitespace-nowrap shadow-lg">
            شاشة رصد الطيف الضوئي (Rainbow Dispersion)
          </div>
        </Html>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: 3D Thin Lens Mode (Convex / Concave)
// -------------------------------------------------------------
function LensMode3D({
  focalLength,
  lensType,
}: {
  focalLength: number;
  lensType: 'convex' | 'concave';
}) {
  const fNorm = focalLength / 40; // Normalize for 3D world units (approx 2 to 5 units)
  const isConvex = lensType === 'convex';

  // Ray trajectories through lens:
  // Parallel rays refract through focal point F on opposite side (for convex) or diverge from F (for concave)
  const rayLines = useMemo(() => {
    const rayYs = [-1.0, -0.5, 0, 0.5, 1.0];
    return rayYs.map((y) => {
      const pStart = new THREE.Vector3(-4.5, y, 0);
      const pLens = new THREE.Vector3(0, y, 0);
      let pEnd: THREE.Vector3;

      if (isConvex) {
        // Intersects focal point at (fNorm, 0, 0) and continues
        const slope = -y / fNorm;
        const xDist = 4.5;
        pEnd = new THREE.Vector3(xDist, y + slope * xDist, 0);
      } else {
        // Concave diverges away from virtual focus at (-fNorm, 0, 0)
        const slope = y / fNorm;
        const xDist = 4.5;
        pEnd = new THREE.Vector3(xDist, y + slope * xDist, 0);
      }

      const geom = new THREE.BufferGeometry().setFromPoints([pStart, pLens, pEnd]);
      return { geom, color: '#38bdf8' };
    });
  }, [fNorm, isConvex]);

  return (
    <group>
      {/* 3D Glass Lens */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.6, 1.6, isConvex ? 0.35 : 0.15, 32]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transmission={0.92}
            transparent
            opacity={0.4}
            roughness={0.05}
            ior={1.5}
          />
        </mesh>

        {/* Brass Lens Holder Rim */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.65, 0.08, 16, 32]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
        </mesh>

        <Html position={[0, 2.0, 0]} center>
          <div className="bg-slate-900/90 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap shadow-lg">
            {isConvex ? `عدسة محدبة مجمعة (f = +${focalLength} mm)` : `عدسة مقعرة مفرقة (f = -${focalLength} mm)`}
          </div>
        </Html>
      </group>

      {/* Optical Axis Line */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 10.0, 8]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.5} />
      </mesh>

      {/* Focal Point Markers */}
      <mesh position={[fNorm, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" />
        <Html position={[0, -0.4, 0]} center>
          <div className="text-[10px] text-red-400 font-bold font-mono">F</div>
        </Html>
      </mesh>
      <mesh position={[-fNorm, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" />
        <Html position={[0, -0.4, 0]} center>
          <div className="text-[10px] text-red-400 font-bold font-mono">F'</div>
        </Html>
      </mesh>

      {/* Light Rays */}
      {rayLines.map((ray, i) => (
        <primitive
          key={i}
          object={
            new THREE.Line(
              ray.geom,
              new THREE.LineBasicMaterial({ color: ray.color, linewidth: 2, transparent: true, opacity: 0.85 })
            )
          }
        />
      ))}
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: 3D Young's Double Slit Interference
// -------------------------------------------------------------
function InterferenceMode3D({ slitDistance }: { slitDistance: number }) {
  const dNorm = slitDistance / 40;

  // Wave ripple arcs
  const ripples = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      r: (i + 1) * 0.5,
      id: i,
    }));
  }, []);

  return (
    <group>
      {/* Laser Light Emitter */}
      <mesh position={[-4.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.6} />
      </mesh>

      {/* Incident Coherent Green Beam */}
      <mesh position={[-2.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.6, 16]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.8} />
      </mesh>

      {/* Double Slit Barrier Plate */}
      <group position={[-1.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.1, 3.2, 2.0]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
        {/* Slit 1 and Slit 2 apertures */}
        <mesh position={[0, dNorm / 2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>
        <mesh position={[0, -dNorm / 2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>

        <Html position={[0, 1.8, 0]} center>
          <div className="bg-slate-900/90 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 whitespace-nowrap shadow-lg">
            حاجز الشق المزدوج (d = {slitDistance * 2} μm)
          </div>
        </Html>
      </group>

      {/* Propagating Wavefront Arcs from Slits */}
      {ripples.map((rip) => (
        <group key={`rip-${rip.id}`} position={[-1.2, 0, 0]}>
          <mesh position={[rip.r, dNorm / 2, 0]} rotation={[0, 0, 0]}>
            <ringGeometry args={[rip.r * 0.85, rip.r * 0.88, 32, 1, -Math.PI / 3, (2 * Math.PI) / 3]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.25 / (rip.id + 1)} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[rip.r, -dNorm / 2, 0]} rotation={[0, 0, 0]}>
            <ringGeometry args={[rip.r * 0.85, rip.r * 0.88, 32, 1, -Math.PI / 3, (2 * Math.PI) / 3]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.25 / (rip.id + 1)} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Screen with Interference Fringes Pattern */}
      <group position={[4.2, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.5, 3.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} side={THREE.DoubleSide} />
        </mesh>

        {/* Interference Fringes Bars (Bright & Dark Bands) */}
        {Array.from({ length: 15 }).map((_, i) => {
          const y = (i - 7) * 0.18;
          const m = Math.abs(i - 7);
          const intensity = Math.pow(Math.cos(m * 0.4), 2);
          return (
            <mesh key={`fringe-${i}`} position={[-0.01, y, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[1.8, 0.08]} />
              <meshBasicMaterial color="#22c55e" transparent opacity={intensity * 0.9} />
            </mesh>
          );
        })}

        <Html position={[0, 1.8, 0]} center>
          <div className="bg-slate-900/90 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 whitespace-nowrap shadow-lg">
            أهداب التداخل (Interference Fringes: d·sin θ = mλ)
          </div>
        </Html>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: 3D Polarization & Malus's Law Mode
// -------------------------------------------------------------
function PolarizationMode3D({ polarizerAngle }: { polarizerAngle: number }) {
  const angleRad = (polarizerAngle * Math.PI) / 180;
  // Malus intensity: I = I0 * cos^2(theta)
  const transmittedIntensity = Math.pow(Math.cos(angleRad), 2);

  return (
    <group>
      {/* Unpolarized Laser Source */}
      <mesh position={[-4.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.8, 16]} />
        <meshStandardMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={0.6} />
      </mesh>

      {/* Unpolarized Multi-plane Oscillations Beam */}
      <mesh position={[-3.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 2.2, 16]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.9} />
      </mesh>

      {/* Polarizer Filter 1 (Fixed Vertical 0 deg) */}
      <group position={[-1.8, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[1.3, 1.3, 0.1, 32]} />
          <meshPhysicalMaterial color="#38bdf8" transmission={0.7} transparent opacity={0.4} roughness={0.1} />
        </mesh>
        {/* Polarizing Grid Slits */}
        {[-0.6, -0.3, 0, 0.3, 0.6].map((x, i) => (
          <mesh key={i} position={[0.06, 0, x]}>
            <boxGeometry args={[0.02, 1.8, 0.02]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        ))}
        <Html position={[0, 1.6, 0]} center>
          <div className="bg-slate-900/90 text-sky-300 text-[10px] px-2 py-0.5 rounded border border-sky-500/40 whitespace-nowrap shadow-lg">
            المستقطب الأول (Polarizer 0°)
          </div>
        </Html>
      </group>

      {/* Linearly Polarized Beam (Vertical) */}
      <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.4, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
      </mesh>

      {/* Analyzer Filter 2 (Rotatable at polarizerAngle) */}
      <group position={[1.2, 0, 0]} rotation={[angleRad, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[1.3, 1.3, 0.1, 32]} />
          <meshPhysicalMaterial color="#f59e0b" transmission={0.7} transparent opacity={0.4} roughness={0.1} />
        </mesh>
        {/* Rotated Grid Slits */}
        {[-0.6, -0.3, 0, 0.3, 0.6].map((x, i) => (
          <mesh key={i} position={[0.06, 0, x]}>
            <boxGeometry args={[0.02, 1.8, 0.02]} />
            <meshBasicMaterial color="#d97706" />
          </mesh>
        ))}
        <Html position={[0, 1.6, 0]} center>
          <div className="bg-slate-900/90 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/40 whitespace-nowrap shadow-lg">
            المحلل (Analyzer θ = {polarizerAngle}°)
          </div>
        </Html>
      </group>

      {/* Transmitted Beam according to Malus's Law */}
      <mesh position={[2.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 3.0, 16]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={Math.max(0.05, transmittedIntensity * 0.9)}
        />
      </mesh>

      {/* Photodetector Target Screen */}
      <group position={[4.4, 0, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.0, 2.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
        <Html position={[0, 1.4, 0]} center>
          <div className="bg-slate-900/90 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/40 whitespace-nowrap shadow-lg font-mono">
            I = {(transmittedIntensity * 100).toFixed(1)}% I₀ (قانون مالوس)
          </div>
        </Html>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: 3D Optical Bench Rail Base
// -------------------------------------------------------------
function OpticalRailBase() {
  return (
    <group position={[0, -1.6, 0]}>
      {/* Dual Anodized Aluminum Rails */}
      <mesh position={[0, 0, 0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 10.5, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, -0.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 10.5, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Heavy Steel Support Legs */}
      <mesh position={[-4.5, -0.4, 0]}>
        <boxGeometry args={[0.6, 0.8, 1.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[4.5, -0.4, 0]}>
        <boxGeometry args={[0.6, 0.8, 1.4]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: Camera Handler
// -------------------------------------------------------------
function OpticsCameraHandler({ cameraPreset }: { cameraPreset: 'bench' | 'prism' | 'screen' | 'top' }) {
  const controlsRef = useRef<any>(null);

  useFrame(({ camera }) => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    if (cameraPreset === 'prism') {
      camera.position.lerp(new THREE.Vector3(0, 1.2, 3.8), 0.05);
      ctrl.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    } else if (cameraPreset === 'screen') {
      camera.position.lerp(new THREE.Vector3(4.0, 1.5, 2.5), 0.05);
      ctrl.target.lerp(new THREE.Vector3(4.2, 0.5, 0), 0.05);
    } else if (cameraPreset === 'top') {
      camera.position.lerp(new THREE.Vector3(0, 8.5, 0.1), 0.05);
      ctrl.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    } else {
      camera.position.lerp(new THREE.Vector3(0, 2.5, 8.5), 0.05);
      ctrl.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }
    ctrl.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      minDistance={2.0}
      maxDistance={20}
    />
  );
}

// -------------------------------------------------------------
// Main Component: OpticsBench3D
// -------------------------------------------------------------
export const OpticsBench3D: React.FC<OpticsBench3DProps> = ({
  mode,
  prismAngle,
  focalLength,
  lensType,
  slitDistance,
  polarizerAngle,
  cameraPreset,
}) => {
  return (
    <Canvas camera={{ position: [0, 2.5, 8.5], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
      <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#38bdf8" />

      <OpticalRailBase />

      {mode === 'prism' && <PrismMode3D prismAngle={prismAngle} />}
      {mode === 'lens' && <LensMode3D focalLength={focalLength} lensType={lensType} />}
      {mode === 'interference' && <InterferenceMode3D slitDistance={slitDistance} />}
      {mode === 'polarization' && <PolarizationMode3D polarizerAngle={polarizerAngle} />}

      <OpticsCameraHandler cameraPreset={cameraPreset} />
    </Canvas>
  );
};

export default OpticsBench3D;
