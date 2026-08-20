import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Trail, Sphere, Ring, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import type { CircularMode, CircularStats } from '@/lib/sim-physics/circular';

interface VectorArrowProps {
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  color: string;
  label?: string;
}

const VectorArrow = ({ origin, dir, color, label }: VectorArrowProps) => {
  const len = dir.length();
  if (len < 0.06) return null;
  const end = origin.clone().add(dir);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  return (
    <group>
      <Line points={[origin.toArray(), end.toArray()]} color={color} lineWidth={2.5} />
      <mesh position={end.toArray()} quaternion={quat}>
        <coneGeometry args={[0.09, 0.26, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {label && (
        <SimLabel3D
          position={end.clone().add(dir.clone().normalize().multiplyScalar(0.35)).toArray() as [number, number, number]}
          variant="muted"
          distanceFactor={9}
        >
          {label}
        </SimLabel3D>
      )}
    </group>
  );
};

interface CircularScene3DProps {
  mode: CircularMode;
  stats: CircularStats;
  worldRadius: number;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  showTrail: boolean;
  /** String cut → the body flies off along the tangent (inertia demo). */
  released: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
  onTick?: (phi: number, released: boolean) => void;
}

export const CircularScene3D = ({
  mode,
  stats,
  worldRadius,
  playing,
  timeScale,
  showVectors,
  showTrail,
  released,
  view,
  autoRotate,
  resetKey,
  onTick,
}: CircularScene3DProps) => {
  const { settings } = useSimQuality();
  const bodyRef = useRef<THREE.Mesh>(null);
  const phiRef = useRef(0);
  const releasePos = useRef(new THREE.Vector3());
  const releaseDir = useRef(new THREE.Vector3(0, 0, 1));
  const flightRef = useRef(0);
  const wasReleased = useRef(false);

  const [tick, setTick] = useState(0);

  // reset
  useMemo(() => {
    phiRef.current = 0;
    flightRef.current = 0;
    wasReleased.current = false;
  }, [resetKey, mode]);

  const coneHeight = useMemo(() => {
    if (mode !== 'conical') return 0;
    const theta = (stats.coneAngle * Math.PI) / 180;
    return worldRadius / Math.max(0.15, Math.tan(theta));
  }, [mode, stats.coneAngle, worldRadius]);

  const bodyY = mode === 'orbit' ? 0 : 0.6;

  const circlePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push([Math.cos(a) * worldRadius, bodyY, Math.sin(a) * worldRadius]);
    }
    return pts;
  }, [worldRadius, bodyY]);

  // Visual angular speed: keep it readable regardless of the real ω
  const visualOmega = useMemo(() => {
    if (mode === 'orbit') return THREE.MathUtils.clamp(stats.omega * 900, 0.15, 2.5);
    return THREE.MathUtils.clamp(stats.omega, 0.1, 6);
  }, [mode, stats.omega]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05) * timeScale;
    if (!bodyRef.current) return;

    if (released) {
      if (!wasReleased.current) {
        wasReleased.current = true;
        flightRef.current = 0;
        const phi = phiRef.current;
        releasePos.current.set(Math.cos(phi) * worldRadius, bodyY, Math.sin(phi) * worldRadius);
        releaseDir.current.set(-Math.sin(phi), 0, Math.cos(phi)).normalize();
      }
      if (playing) flightRef.current += dt;
      const d = flightRef.current * visualOmega * worldRadius;
      const p = releasePos.current.clone().add(releaseDir.current.clone().multiplyScalar(d));
      bodyRef.current.position.copy(p);
    } else {
      wasReleased.current = false;
      if (playing) phiRef.current += visualOmega * dt;
      const phi = phiRef.current;
      bodyRef.current.position.set(Math.cos(phi) * worldRadius, bodyY, Math.sin(phi) * worldRadius);
    }

    setTick((t) => (t + 1) % 1000);
    onTick?.(phiRef.current, released);
  });

  const phi = phiRef.current;
  const pos = released
    ? (bodyRef.current?.position.clone() ?? new THREE.Vector3())
    : new THREE.Vector3(Math.cos(phi) * worldRadius, bodyY, Math.sin(phi) * worldRadius);

  const tangent = new THREE.Vector3(-Math.sin(phi), 0, Math.cos(phi));
  const inward = new THREE.Vector3(-Math.cos(phi), 0, -Math.sin(phi));

  const vLen = THREE.MathUtils.clamp(worldRadius * 0.45, 0.6, 3);
  const aLen = THREE.MathUtils.clamp(Math.log10(1 + stats.ac) * 0.9, 0.5, 3);

  const anchor: [number, number, number] =
    mode === 'conical' ? [0, bodyY + coneHeight, 0] : [0, bodyY, 0];

  return (
    <>
      <SimStage
        size={30}
        ruler={mode !== 'orbit'}
        rulerLength={Math.ceil(worldRadius)}
        rulerStep={Math.max(1, Math.round(worldRadius / 4))}
        unitScale={mode === 'orbit' ? 1 : 1 / 1.6}
        rulerUnit={mode === 'orbit' ? 'كم' : 'م'}
        showGrid={mode !== 'orbit'}
      />
      <SimControls view={view} autoRotate={autoRotate} target={[0, 1, 0]} minDistance={4} maxDistance={45} />

      {/* Central body */}
      {mode === 'orbit' ? (
        <mesh position={[0, 0, 0]} castShadow receiveShadow={settings.shadows}>
          <sphereGeometry args={[2.2, 48, 48]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.6} metalness={0.15} emissive="#0b3ea8" emissiveIntensity={0.25} />
        </mesh>
      ) : (
        <group>
          {mode === 'conical' && (
            <mesh position={[0, bodyY + coneHeight, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.18, 0.25, 20]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
            </mesh>
          )}
          {mode === 'conical' && (
            <mesh position={[0, (bodyY + coneHeight) / 2, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.12, bodyY + coneHeight, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
            </mesh>
          )}
          <mesh position={[0, bodyY, 0]} castShadow>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}

      {/* Orbit / circular path */}
      <Line points={circlePoints} color="#38bdf8" lineWidth={1.5} dashed dashSize={0.25} gapSize={0.18} />

      {/* Radius plane ring for conical cone visualisation */}
      {mode === 'conical' && !released && (
        <Line
          points={[anchor, pos.toArray() as [number, number, number]]}
          color="#e2e8f0"
          lineWidth={2}
        />
      )}
      {mode !== 'conical' && !released && (
        <Line points={[[0, bodyY, 0], pos.toArray() as [number, number, number]]} color="#e2e8f0" lineWidth={2} />
      )}

      {/* Moving body */}
      {showTrail && settings.shadows ? (
        <Trail width={2.5} length={6} color={new THREE.Color('#22d3ee')} attenuation={(w) => w}>
          <mesh ref={bodyRef} castShadow>
            <sphereGeometry args={[0.28, 28, 28]} />
            <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.55} metalness={0.4} roughness={0.25} />
          </mesh>
        </Trail>
      ) : (
        <mesh ref={bodyRef} castShadow>
          <sphereGeometry args={[0.28, 28, 28]} />
          <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.55} metalness={0.4} roughness={0.25} />
        </mesh>
      )}

      {/* Vectors */}
      {showVectors && !released && (
        <>
          <VectorArrow origin={pos} dir={tangent.clone().multiplyScalar(vLen)} color="#22c55e" label="v" />
          <VectorArrow origin={pos} dir={inward.clone().multiplyScalar(aLen)} color="#ef4444" label="a_c" />
          {mode === 'conical' && (
            <VectorArrow
              origin={pos}
              dir={new THREE.Vector3(...anchor).sub(pos).normalize().multiplyScalar(aLen * 0.9)}
              color="#a855f7"
              label="T"
            />
          )}
          {mode === 'conical' && (
            <VectorArrow origin={pos} dir={new THREE.Vector3(0, -1, 0).multiplyScalar(aLen * 0.6)} color="#f59e0b" label="mg" />
          )}
        </>
      )}

      {showVectors && released && (
        <VectorArrow origin={pos} dir={releaseDir.current.clone().multiplyScalar(vLen)} color="#22c55e" label="v (مماسية)" />
      )}

      {/* Labels */}
      <SimLabel3D position={[0, mode === 'orbit' ? 2.8 : bodyY + 1.1, 0]} variant="muted" distanceFactor={12}>
        {mode === 'orbit' ? 'الأرض' : mode === 'conical' ? 'نقطة التعليق' : 'مركز الدوران'}
      </SimLabel3D>

      <SimLabel3D
        position={[worldRadius * 0.55, bodyY + 0.45, 0]}
        variant="accent"
        distanceFactor={12}
      >
        {mode === 'orbit' ? `r = ${stats.stringLength.toFixed(0)} كم` : `r = ${(worldRadius / 1.6).toFixed(2)} م`}
      </SimLabel3D>

      {mode === 'conical' && (
        <SimLabel3D position={[0.6, bodyY + coneHeight - 0.5, 0]} distanceFactor={12}>
          θ = {stats.coneAngle.toFixed(1)}°
        </SimLabel3D>
      )}
    </>
  );
};
