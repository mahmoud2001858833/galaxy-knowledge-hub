import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { FluidMode, FluidStats, tubeRadiusAt } from '@/lib/sim-physics/fluids';

interface ArrowProps {
  origin: [number, number, number];
  dir: THREE.Vector3;
  color: string;
  label?: string;
}

const VectorArrow = ({ origin, dir, color, label }: ArrowProps) => {
  const len = dir.length();
  if (len < 0.08) return null;
  const o = new THREE.Vector3(...origin);
  const end = o.clone().add(dir);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize()
  );
  return (
    <group>
      <Line points={[o.toArray(), end.toArray()]} color={color} lineWidth={2.5} />
      <mesh position={end.toArray()} quaternion={quat}>
        <coneGeometry args={[0.1, 0.28, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      {label && (
        <SimLabel3D
          position={end.clone().add(dir.clone().normalize().multiplyScalar(0.4)).toArray() as [number, number, number]}
          variant="muted"
          distanceFactor={9}
        >
          {label}
        </SimLabel3D>
      )}
    </group>
  );
};

/** Glass tank with a fluid volume inside. */
const Tank = ({
  width,
  height,
  depth,
  fluidHeight,
  fluidColor,
}: {
  width: number;
  height: number;
  depth: number;
  fluidHeight: number;
  fluidColor: string;
}) => (
  <group>
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, depth]} />
      <meshPhysicalMaterial
        color="#e2e8f0"
        transparent
        opacity={0.08}
        roughness={0.05}
        metalness={0}
        transmission={0.9}
        thickness={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
    <mesh position={[0, fluidHeight / 2, 0]}>
      <boxGeometry args={[width - 0.08, fluidHeight, depth - 0.08]} />
      <meshPhysicalMaterial
        color={fluidColor}
        transparent
        opacity={0.42}
        roughness={0.15}
        transmission={0.6}
        thickness={1}
      />
    </mesh>
    {/* water line */}
    <Line
      points={[
        [-width / 2, fluidHeight, -depth / 2],
        [width / 2, fluidHeight, -depth / 2],
        [width / 2, fluidHeight, depth / 2],
        [-width / 2, fluidHeight, depth / 2],
        [-width / 2, fluidHeight, -depth / 2],
      ]}
      color="#7dd3fc"
      lineWidth={1.5}
    />
  </group>
);

interface FluidScene3DProps {
  mode: FluidMode;
  stats: FluidStats;
  fluidColor: string;
  objectColor: string;
  side: number;
  depth: number;
  inletRadius: number;
  throatRadius: number;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const TANK_W = 6;
const TANK_H = 4.4;
const TANK_D = 4;
const FLUID_H = 3.4;

const ArchimedesScene = ({
  stats,
  fluidColor,
  objectColor,
  side,
  playing,
  timeScale,
  showVectors,
}: Pick<FluidScene3DProps, 'stats' | 'fluidColor' | 'objectColor' | 'side' | 'playing' | 'timeScale' | 'showVectors'>) => {
  const { settings } = useSimQuality();
  const cubeRef = useRef<THREE.Mesh>(null);
  const bobRef = useRef(0);
  const worldSide = THREE.MathUtils.clamp(side * 6, 0.6, 2.2);

  // Equilibrium: submerged fraction f → cube centre sits at FLUID_H - f*s + s/2
  const restY = FLUID_H - stats.submergedFraction * worldSide + worldSide / 2;
  const sunkY = worldSide / 2 + 0.05;
  const targetY = stats.floats ? restY : sunkY;

  useFrame((_, delta) => {
    if (!cubeRef.current) return;
    const dt = Math.min(delta, 0.05) * timeScale;
    if (playing) bobRef.current += dt * 1.4;
    const bob = stats.floats ? Math.sin(bobRef.current) * 0.05 : 0;
    cubeRef.current.position.y += (targetY + bob - cubeRef.current.position.y) * Math.min(1, dt * 3);
  });

  const vScale = THREE.MathUtils.clamp(2.4 / Math.max(stats.weight, stats.buoyancy, 1), 0.02, 0.6);

  return (
    <group>
      <Tank width={TANK_W} height={TANK_H} depth={TANK_D} fluidHeight={FLUID_H} fluidColor={fluidColor} />

      <mesh ref={cubeRef} position={[0, targetY, 0]} castShadow={settings.shadows}>
        <boxGeometry args={[worldSide, worldSide, worldSide]} />
        <meshStandardMaterial color={objectColor} roughness={0.4} metalness={0.25} />
      </mesh>

      {showVectors && (
        <>
          <VectorArrow
            origin={[0, targetY, 0]}
            dir={new THREE.Vector3(0, -1, 0).multiplyScalar(THREE.MathUtils.clamp(stats.weight * vScale, 0.3, 2.2))}
            color="#ef4444"
            label="W = mg"
          />
          <VectorArrow
            origin={[0, targetY, 0]}
            dir={new THREE.Vector3(0, 1, 0).multiplyScalar(THREE.MathUtils.clamp(stats.buoyancy * vScale, 0.3, 2.2))}
            color="#22c55e"
            label="F_b"
          />
        </>
      )}

      <SimLabel3D position={[0, FLUID_H + 0.7, 0]} variant="accent" distanceFactor={10}>
        {stats.floats
          ? `يطفو — الجزء المغمور ${(stats.submergedFraction * 100).toFixed(0)}%`
          : 'يغوص — الوزن أكبر من قوة الطفو'}
      </SimLabel3D>
      <SimLabel3D position={[TANK_W / 2 + 0.9, FLUID_H, 0]} variant="muted" distanceFactor={11}>
        سطح السائل
      </SimLabel3D>
    </group>
  );
};

const PressureScene = ({
  stats,
  fluidColor,
  depth,
  showVectors,
}: Pick<FluidScene3DProps, 'stats' | 'fluidColor' | 'depth' | 'showVectors'>) => {
  const maxDepth = 50;
  const H = 6.5;
  const probeY = H * (1 - THREE.MathUtils.clamp(depth / maxDepth, 0, 1));

  const bands = useMemo(() => [0, 10, 20, 30, 40, 50], []);

  return (
    <group>
      <Tank width={3.4} height={H + 0.4} depth={3.4} fluidHeight={H} fluidColor={fluidColor} />

      {bands.map((b) => {
        const y = H * (1 - b / maxDepth);
        return (
          <group key={b}>
            <Line
              points={[
                [-1.7, y, 1.7],
                [1.7, y, 1.7],
              ]}
              color="#475569"
              lineWidth={1}
            />
            <SimLabel3D position={[2.3, y, 1.7]} variant="muted" distanceFactor={14}>
              {b} م
            </SimLabel3D>
          </group>
        );
      })}

      {/* pressure probe */}
      <mesh position={[0, probeY, 0]}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.45} />
      </mesh>

      {showVectors &&
        [
          [1, 0, 0],
          [-1, 0, 0],
          [0, 1, 0],
          [0, -1, 0],
          [0, 0, 1],
          [0, 0, -1],
        ].map((d, i) => (
          <VectorArrow
            key={i}
            origin={[0, probeY, 0]}
            dir={new THREE.Vector3(...(d as [number, number, number])).multiplyScalar(
              THREE.MathUtils.clamp(0.35 + (stats.gaugePressure / 500000) * 2, 0.35, 1.6)
            )}
            color="#38bdf8"
          />
        ))}

      <SimLabel3D position={[0, probeY + 1, 0]} variant="accent" distanceFactor={10}>
        {(stats.gaugePressure / 1000).toFixed(1)} kPa عند {depth.toFixed(1)} م
      </SimLabel3D>
      <SimLabel3D position={[0, H + 0.9, 0]} variant="muted" distanceFactor={11}>
        الضغط الجوي 101.3 kPa
      </SimLabel3D>
    </group>
  );
};

const BernoulliScene = ({
  stats,
  fluidColor,
  inletRadius,
  throatRadius,
  playing,
  timeScale,
  showVectors,
}: Pick<
  FluidScene3DProps,
  'stats' | 'fluidColor' | 'inletRadius' | 'throatRadius' | 'playing' | 'timeScale' | 'showVectors'
>) => {
  const LEN = 9;
  const SEGMENTS = 48;
  const PARTICLES = 90;
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const progress = useRef<Float32Array>(new Float32Array(0));
  const offsets = useRef<Float32Array>(new Float32Array(0));

  if (progress.current.length !== PARTICLES) {
    progress.current = Float32Array.from({ length: PARTICLES }, () => Math.random());
    offsets.current = Float32Array.from({ length: PARTICLES * 2 }, () => Math.random() * 2 - 1);
  }

  const rWorld = (x: number) => tubeRadiusAt(x, inletRadius, throatRadius) / 12;

  const geometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(1, 1, 1, 32, SEGMENTS, true);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i); // -0.5..0.5
      const x = y + 0.5;
      const r = rWorld(x);
      pos.setX(i, pos.getX(i) * r);
      pos.setZ(i, pos.getZ(i) * r);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    g.rotateZ(Math.PI / 2);
    g.scale(LEN, 1, 1);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inletRadius, throatRadius]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const mesh = particlesRef.current;
    if (!mesh) return;
    const dt = Math.min(delta, 0.05) * timeScale;
    for (let i = 0; i < PARTICLES; i++) {
      const x = progress.current[i];
      const rc = tubeRadiusAt(x, inletRadius, throatRadius);
      const speedFactor = (inletRadius / Math.max(rc, 0.1)) ** 2;
      if (playing) {
        progress.current[i] = (x + dt * 0.12 * speedFactor * Math.max(0.4, stats.vIn)) % 1;
      }
      const px = (progress.current[i] - 0.5) * LEN;
      const r = rWorld(progress.current[i]) * 0.78;
      dummy.position.set(px, 2 + offsets.current[i * 2] * r, offsets.current[i * 2 + 1] * r);
      dummy.scale.setScalar(0.06);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  const manometer = (x: number, label: string, value: number, color: string) => {
    const r = rWorld((x + LEN / 2) / LEN);
    const h = THREE.MathUtils.clamp(1.6 - value / 12000, 0.15, 2.6);
    return (
      <group position={[x, 2 + r, 0]}>
        <mesh position={[0, h / 2, 0]}>
          <cylinderGeometry args={[0.07, 0.07, h, 12]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.35} />
        </mesh>
        <mesh position={[0, h * 0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, h * 0.8, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
        </mesh>
        <SimLabel3D position={[0, h + 0.45, 0]} variant="muted" distanceFactor={11}>
          {label}
        </SimLabel3D>
      </group>
    );
  };

  return (
    <group>
      {/* tube shell */}
      <mesh position={[0, 2, 0]} geometry={geometry}>
        <meshPhysicalMaterial
          color="#cbd5e1"
          transparent
          opacity={0.16}
          roughness={0.05}
          transmission={0.9}
          thickness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* fluid core */}
      <mesh position={[0, 2, 0]} geometry={geometry} scale={[1, 0.92, 0.92]}>
        <meshStandardMaterial color={fluidColor} transparent opacity={0.28} />
      </mesh>

      {/* flowing particles */}
      <instancedMesh ref={particlesRef} args={[undefined as never, undefined as never, PARTICLES]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={0.6} />
      </instancedMesh>

      {/* supports */}
      {[-LEN / 2 + 0.4, LEN / 2 - 0.4].map((x) => (
        <mesh key={x} position={[x, 1, 0]}>
          <boxGeometry args={[0.4, 2, 0.6]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
      ))}

      {manometer(-LEN / 2 + 1.2, `P₁ عالٍ`, stats.dynamicIn, '#22c55e')}
      {manometer(0, `P₂ منخفض`, stats.dynamicThroat, '#ef4444')}

      {showVectors && (
        <>
          <VectorArrow
            origin={[-LEN / 2 + 1.2, 2, 0]}
            dir={new THREE.Vector3(THREE.MathUtils.clamp(stats.vIn * 0.18, 0.3, 1.6), 0, 0)}
            color="#22c55e"
            label={`v₁ ${stats.vIn.toFixed(1)}`}
          />
          <VectorArrow
            origin={[0.3, 2, 0]}
            dir={new THREE.Vector3(THREE.MathUtils.clamp(stats.vThroat * 0.18, 0.3, 2.6), 0, 0)}
            color="#f97316"
            label={`v₂ ${stats.vThroat.toFixed(1)}`}
          />
        </>
      )}

      <SimLabel3D position={[0, 4.4, 0]} variant="accent" distanceFactor={11}>
        الحلق أضيق ⇐ السرعة أكبر والضغط أقل ({(stats.pressureDrop / 1000).toFixed(2)} kPa)
      </SimLabel3D>
      <SimLabel3D position={[0, 0.4, 0]} variant="muted" distanceFactor={12}>
        نظام الجريان: {stats.regime} (Re ≈ {stats.reynolds.toFixed(0)})
      </SimLabel3D>
    </group>
  );
};

export const FluidScene3D = (props: FluidScene3DProps) => {
  const { mode, view, autoRotate } = props;

  const target: [number, number, number] =
    mode === 'pressure' ? [0, 3.2, 0] : mode === 'bernoulli' ? [0, 2, 0] : [0, 2, 0];

  return (
    <>
      <SimStage size={26} showGrid showAxes={false} />
      <SimControls
        view={view}
        autoRotate={autoRotate}
        target={target}
        scale={mode === 'bernoulli' ? 0.85 : mode === 'pressure' ? 0.75 : 0.62}
        minDistance={4}
        maxDistance={40}
      />

      {mode === 'archimedes' && <ArchimedesScene {...props} />}
      {mode === 'pressure' && <PressureScene {...props} />}
      {mode === 'bernoulli' && <BernoulliScene {...props} />}
    </>
  );
};
