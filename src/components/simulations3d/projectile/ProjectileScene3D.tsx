import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Trail, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { ProjectileSample, sampleAt } from '@/lib/sim-physics/projectile';

/** World units per metre — keeps long ranges inside the visible stage. */
export const WORLD_SCALE = 0.2;

interface CannonProps {
  angle: number;
  azimuth: number;
  height: number;
}

const Cannon = ({ angle, azimuth, height }: CannonProps) => {
  const y = height * WORLD_SCALE;
  return (
    <group position={[0, 0, 0]} rotation={[0, -azimuth * (Math.PI / 180), 0]}>
      {/* support tower when launched from a height */}
      {height > 0.1 && (
        <mesh position={[0, y / 2, 0]} castShadow>
          <boxGeometry args={[0.5, y, 0.5]} />
          <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.3} />
        </mesh>
      )}
      <group position={[0, y, 0]} rotation={[0, 0, angle * (Math.PI / 180)]}>
        <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.24, 1.8, 20]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
      <mesh position={[0, y, 0]} castShadow>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
};

interface VectorArrowProps {
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  color: string;
  label?: string;
}

const VectorArrow = ({ origin, dir, color, label }: VectorArrowProps) => {
  const len = dir.length();
  if (len < 0.05) return null;
  const end = origin.clone().add(dir);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  return (
    <group>
      <Line points={[origin.toArray(), end.toArray()]} color={color} lineWidth={2.5} />
      <mesh position={end.toArray()} quaternion={quat}>
        <coneGeometry args={[0.12, 0.35, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {label && (
        <SimLabel3D position={[end.x, end.y + 0.35, end.z]} variant="muted" distanceFactor={14}>
          {label}
        </SimLabel3D>
      )}
    </group>
  );
};

interface ProjectileBodyProps {
  samples: ProjectileSample[];
  playing: boolean;
  speedFactor: number;
  showVectors: boolean;
  showTrail: boolean;
  onTick: (s: ProjectileSample, done: boolean) => void;
  resetKey: number;
}

const ProjectileBody = ({
  samples,
  playing,
  speedFactor,
  showVectors,
  showTrail,
  onTick,
  resetKey,
}: ProjectileBodyProps) => {
  const ballRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);
  const lastKey = useRef(resetKey);
  const vecGroup = useRef<THREE.Group>(null);
  const arrows = useRef<{ v: THREE.Vector3; vx: THREE.Vector3; vy: THREE.Vector3; pos: THREE.Vector3 }>({
    v: new THREE.Vector3(),
    vx: new THREE.Vector3(),
    vy: new THREE.Vector3(),
    pos: new THREE.Vector3(),
  });

  const total = samples.length ? samples[samples.length - 1].t : 0;

  useFrame((_, delta) => {
    if (lastKey.current !== resetKey) {
      lastKey.current = resetKey;
      time.current = 0;
    }
    if (playing && total > 0) {
      time.current = Math.min(time.current + delta * speedFactor, total);
    }
    const s = sampleAt(samples, time.current);
    if (ballRef.current) {
      ballRef.current.position.set(s.x * WORLD_SCALE, s.y * WORLD_SCALE, s.z * WORLD_SCALE);
    }
    arrows.current.pos.set(s.x * WORLD_SCALE, s.y * WORLD_SCALE, s.z * WORLD_SCALE);
    arrows.current.v.set(s.vx, s.vy, s.vz).multiplyScalar(0.06);
    arrows.current.vx.set(s.vx, 0, s.vz).multiplyScalar(0.06);
    arrows.current.vy.set(0, s.vy, 0).multiplyScalar(0.06);
    onTick(s, time.current >= total);
  });

  const current = sampleAt(samples, time.current);
  const pos = new THREE.Vector3(
    current.x * WORLD_SCALE,
    current.y * WORLD_SCALE,
    current.z * WORLD_SCALE
  );

  return (
    <group>
      {showTrail ? (
        <Trail width={2.5} length={7} color="#f59e0b" attenuation={(w) => w}>
          <mesh ref={ballRef} castShadow>
            <sphereGeometry args={[0.28, 24, 24]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} roughness={0.3} />
          </mesh>
        </Trail>
      ) : (
        <mesh ref={ballRef} castShadow>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      )}

      {showVectors && (
        <group ref={vecGroup}>
          <VectorArrow origin={pos} dir={arrows.current.v.clone()} color="#22d3ee" label="v" />
          <VectorArrow origin={pos} dir={arrows.current.vx.clone()} color="#a3e635" label="vₓ" />
          <VectorArrow origin={pos} dir={arrows.current.vy.clone()} color="#f472b6" label="v_y" />
        </group>
      )}
    </group>
  );
};

interface ProjectileScene3DProps {
  samples: ProjectileSample[];
  playing: boolean;
  speedFactor: number;
  showVectors: boolean;
  showTrail: boolean;
  showIdealPath: boolean;
  idealSamples: ProjectileSample[];
  angle: number;
  azimuth: number;
  height: number;
  targetDistance?: number;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
  onTick: (s: ProjectileSample, done: boolean) => void;
}

export const ProjectileScene3D = ({
  samples,
  playing,
  speedFactor,
  showVectors,
  showTrail,
  showIdealPath,
  idealSamples,
  angle,
  azimuth,
  height,
  targetDistance,
  view,
  autoRotate,
  resetKey,
  onTick,
}: ProjectileScene3DProps) => {
  const { settings } = useSimQuality();

  const pathPoints = useMemo(() => {
    const step = Math.max(1, Math.floor(samples.length / (settings.segments * 4)));
    return samples
      .filter((_, i) => i % step === 0)
      .map((s) => [s.x * WORLD_SCALE, s.y * WORLD_SCALE, s.z * WORLD_SCALE] as [number, number, number]);
  }, [samples, settings.segments]);

  const idealPoints = useMemo(() => {
    const step = Math.max(1, Math.floor(idealSamples.length / (settings.segments * 4)));
    return idealSamples
      .filter((_, i) => i % step === 0)
      .map((s) => [s.x * WORLD_SCALE, s.y * WORLD_SCALE, s.z * WORLD_SCALE] as [number, number, number]);
  }, [idealSamples, settings.segments]);

  const apex = useMemo(
    () => samples.reduce((m, s) => (s.y > m.y ? s : m), samples[0] ?? { x: 0, y: 0, z: 0 }),
    [samples]
  );
  const landing = samples[samples.length - 1];

  return (
    <>
      <SimControls view={view} target={[6, 1.5, 0]} autoRotate={autoRotate} maxDistance={80} />
      <SimStage size={80} ruler rulerLength={60} rulerStep={10} unitScale={1 / WORLD_SCALE} />

      <Cannon angle={angle} azimuth={azimuth} height={height} />

      {pathPoints.length > 1 && (
        <Line points={pathPoints} color="#38bdf8" lineWidth={2} dashed={false} transparent opacity={0.85} />
      )}
      {showIdealPath && idealPoints.length > 1 && (
        <Line points={idealPoints} color="#94a3b8" lineWidth={1.5} dashed dashSize={0.35} gapSize={0.25} />
      )}

      {apex && apex.y > 0.2 && (
        <SimLabel3D
          position={[apex.x * WORLD_SCALE, apex.y * WORLD_SCALE + 0.6, apex.z * WORLD_SCALE]}
          variant="accent"
        >
          أقصى ارتفاع {apex.y.toFixed(1)} م
        </SimLabel3D>
      )}

      {landing && (
        <group position={[landing.x * WORLD_SCALE, 0.03, landing.z * WORLD_SCALE]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.55, 32]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
          </mesh>
          <SimLabel3D position={[0, 0.9, 0]}>المدى {Math.hypot(landing.x, landing.z).toFixed(1)} م</SimLabel3D>
        </group>
      )}

      {targetDistance !== undefined && (
        <group position={[targetDistance * WORLD_SCALE, 0.05, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 1.0, 32]} />
            <meshBasicMaterial color="#22c55e" transparent opacity={0.85} />
          </mesh>
          <Sphere args={[0.12, 12, 12]}>
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
          </Sphere>
          <SimLabel3D position={[0, 1.2, 0]} variant="accent">
            الهدف {targetDistance} م
          </SimLabel3D>
        </group>
      )}

      <ProjectileBody
        samples={samples}
        playing={playing}
        speedFactor={speedFactor}
        showVectors={showVectors}
        showTrail={showTrail}
        onTick={onTick}
        resetKey={resetKey}
      />
    </>
  );
};
