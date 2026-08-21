import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { KineticsMode, KineticsParams, KineticsStats, energyProfile } from '@/lib/sim-physics/kinetics';

interface KineticsScene3DProps {
  mode: KineticsMode;
  params: KineticsParams;
  stats: KineticsStats;
  playing: boolean;
  timeScale: number;
  showParticles: boolean;
  showLabels: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const BOX = { w: 11, h: 8, d: 11 };

const Vessel = () => (
  <group position={[0, BOX.h / 2, 0]}>
    <mesh>
      <boxGeometry args={[BOX.w, BOX.h, BOX.d]} />
      <meshPhysicalMaterial
        color="#cbd5e1"
        transparent
        opacity={0.09}
        roughness={0.05}
        transmission={0.9}
        thickness={0.3}
        side={THREE.BackSide}
      />
    </mesh>
    <lineSegments>
      <edgesGeometry args={[new THREE.BoxGeometry(BOX.w, BOX.h, BOX.d)]} />
      <lineBasicMaterial color="#64748b" />
    </lineSegments>
  </group>
);

/** Collision-theory box: reactant particles bounce, successful collisions turn into product. */
const CollisionBox = ({
  stats,
  params,
  playing,
  timeScale,
  showLabels,
  resetKey,
}: {
  stats: KineticsStats;
  params: KineticsParams;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
  resetKey: number;
}) => {
  const { settings } = useSimQuality();
  const count = Math.min(settings.particles, 220);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);

  const state = useMemo(() => {
    const pos: THREE.Vector3[] = [];
    const vel: THREE.Vector3[] = [];
    const kind: number[] = []; // 0 = A, 1 = B, 2 = product
    for (let i = 0; i < count; i++) {
      pos.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * (BOX.w - 1.2),
          0.6 + Math.random() * (BOX.h - 1.4),
          (Math.random() - 0.5) * (BOX.d - 1.2)
        )
      );
      vel.push(
        new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
          .normalize()
          .multiplyScalar(1 + Math.random())
      );
      kind.push(i % 2);
    }
    return { pos, vel, kind };
  }, [count, resetKey]);

  const r = stats.reaction;
  const speed = 1.6 * Math.sqrt(params.temperature / 300) * timeScale;
  // how many particles should already be product, from the real conversion
  const targetProduct = Math.floor(stats.conversion * count);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = playing ? Math.min(delta, 0.05) : 0;
    const half = { x: BOX.w / 2 - 0.5, y: BOX.h - 0.6, z: BOX.d / 2 - 0.5 };

    let products = 0;
    for (let i = 0; i < count; i++) if (state.kind[i] === 2) products++;
    if (products < targetProduct) {
      for (let i = 0; i < count && products < targetProduct; i++) {
        if (state.kind[i] !== 2) {
          state.kind[i] = 2;
          products++;
        }
      }
    } else if (products > targetProduct) {
      for (let i = count - 1; i >= 0 && products > targetProduct; i--) {
        if (state.kind[i] === 2) {
          state.kind[i] = i % 2;
          products--;
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const p = state.pos[i];
      const v = state.vel[i];
      p.addScaledVector(v, dt * speed);
      if (Math.abs(p.x) > half.x) {
        p.x = Math.sign(p.x) * half.x;
        v.x *= -1;
      }
      if (Math.abs(p.z) > half.z) {
        p.z = Math.sign(p.z) * half.z;
        v.z *= -1;
      }
      if (p.y > half.y) {
        p.y = half.y;
        v.y *= -1;
      }
      if (p.y < 0.45) {
        p.y = 0.45;
        v.y = Math.abs(v.y);
      }
      dummy.position.copy(p);
      const k = state.kind[i];
      dummy.scale.setScalar(k === 2 ? 0.42 : k === 0 ? 0.34 : 0.3);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      colorObj.set(k === 2 ? r.colorP : k === 0 ? r.colorA : r.colorB);
      mesh.setColorAt(i, colorObj);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  const seg = settings.segments >= 32 ? 16 : 8;

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]}>
        <sphereGeometry args={[1, seg, seg]} />
        <meshStandardMaterial vertexColors emissiveIntensity={0.3} roughness={0.35} metalness={0.1} />
      </instancedMesh>
      {showLabels && (
        <SimLabel3D position={[0, BOX.h + 1.3, 0]} variant="accent" distanceFactor={22}>
          نسبة التصادمات الفعّالة: {(stats.successFraction * 100).toExponential(2)}%
        </SimLabel3D>
      )}
    </group>
  );
};

/** Two beakers: reactant draining, product filling, with rising bubbles. */
const ProgressScene = ({
  stats,
  params,
  playing,
  timeScale,
  showLabels,
}: {
  stats: KineticsStats;
  params: KineticsParams;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
}) => {
  const bubblesRef = useRef<THREE.Group>(null);
  const c0 = Math.max(params.concentration, 1e-6);
  const fracA = Math.max(0.02, stats.remaining / c0);
  const fracP = Math.max(0.02, stats.product / c0);

  useFrame((_, delta) => {
    const g = bubblesRef.current;
    if (!g || !playing) return;
    g.children.forEach((c, i) => {
      c.position.y += delta * timeScale * (0.8 + (i % 5) * 0.25) * (0.4 + stats.rate * 30);
      if (c.position.y > 5.5) c.position.y = 0.4;
    });
  });

  const beaker = (x: number, frac: number, color: string, label: string, value: string) => (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[2, 2, 6, 36, 1, true]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          transparent
          opacity={0.2}
          transmission={0.9}
          thickness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[2, 2, 0.12, 36]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, (5.6 * frac) / 2 + 0.15, 0]}>
        <cylinderGeometry args={[1.9, 1.9, Math.max(5.6 * frac, 0.05), 36]} />
        <meshStandardMaterial color={color} transparent opacity={0.75} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      {showLabels && (
        <SimLabel3D position={[0, 7, 0]} distanceFactor={22}>
          {label}: {value} mol/L
        </SimLabel3D>
      )}
    </group>
  );

  return (
    <group>
      {beaker(-3.4, fracA, stats.reaction.colorA, 'المتفاعل', stats.remaining.toFixed(3))}
      {beaker(3.4, fracP, stats.reaction.colorP, 'الناتج', stats.product.toFixed(3))}

      <group ref={bubblesRef} position={[3.4, 0, 0]}>
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(i) * 1.3,
              0.4 + ((i * 5.1) % 5),
              Math.sin(i * 1.7) * 1.3,
            ]}
          >
            <sphereGeometry args={[0.12 + (i % 3) * 0.04, 10, 10]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>

      {params.catalyst && (
        <group position={[0, 0.4, 3.6]}>
          <mesh castShadow>
            <boxGeometry args={[2.4, 0.6, 1.4]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.25} />
          </mesh>
          {showLabels && (
            <SimLabel3D position={[0, 1.4, 0]} variant="accent" distanceFactor={22}>
              عامل حفّاز نشط
            </SimLabel3D>
          )}
        </group>
      )}

      {showLabels && (
        <SimLabel3D position={[0, 8.4, 0]} variant="accent" distanceFactor={24}>
          التحوّل: {(stats.conversion * 100).toFixed(1)}% · السرعة {stats.rate.toExponential(2)} mol/L·s
        </SimLabel3D>
      )}
    </group>
  );
};

/** 3D reaction-coordinate energy hill with a rolling reaction marker. */
const EnergyScene = ({
  params,
  stats,
  playing,
  timeScale,
  showLabels,
}: {
  params: KineticsParams;
  stats: KineticsStats;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
}) => {
  const W = 16;
  const SCALE = 0.045;

  const build = (catalyst: boolean) => {
    const pts = energyProfile(params.reactionId, catalyst).map(
      (p) => new THREE.Vector3(p.x * W - W / 2, p.e * SCALE + 3, 0)
    );
    return new THREE.CatmullRomCurve3(pts);
  };

  const curveMain = useMemo(() => build(params.catalyst), [params.reactionId, params.catalyst]);
  const curveAlt = useMemo(() => build(!params.catalyst), [params.reactionId, params.catalyst]);

  const ballRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    if (!ballRef.current) return;
    if (playing) tRef.current = (tRef.current + delta * 0.16 * timeScale) % 1;
    const p = curveMain.getPoint(tRef.current);
    ballRef.current.position.set(p.x, p.y + 0.45, 0);
  });

  const tubeMain = useMemo(() => new THREE.TubeGeometry(curveMain, 120, 0.16, 10, false), [curveMain]);
  const tubeAlt = useMemo(() => new THREE.TubeGeometry(curveAlt, 120, 0.08, 8, false), [curveAlt]);

  const peak = stats.ea * SCALE + 3;

  return (
    <group>
      <mesh geometry={tubeMain}>
        <meshStandardMaterial
          color={params.catalyst ? '#22c55e' : '#f97316'}
          emissive={params.catalyst ? '#22c55e' : '#f97316'}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh geometry={tubeAlt}>
        <meshStandardMaterial color="#64748b" transparent opacity={0.5} />
      </mesh>

      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[0.42, 20, 20]} />
        <meshStandardMaterial color={stats.reaction.colorA} emissive={stats.reaction.colorA} emissiveIntensity={0.5} />
      </mesh>

      {/* Ea marker */}
      <mesh position={[-W / 2 + W * 0.45, (peak + 3) / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, Math.max(peak - 3, 0.1), 8]} />
        <meshStandardMaterial color="#f43f5e" />
      </mesh>

      {showLabels && (
        <>
          <SimLabel3D position={[-W / 2 + W * 0.45, peak + 1.1, 0]} variant="accent" distanceFactor={26}>
            Ea = {stats.ea} kJ/mol {params.catalyst ? '(بمحفّز)' : ''}
          </SimLabel3D>
          <SimLabel3D position={[-W / 2, 3.6, 0]} distanceFactor={26}>
            المتفاعلات
          </SimLabel3D>
          <SimLabel3D position={[W / 2, stats.reaction.dH * SCALE + 3.6, 0]} distanceFactor={26}>
            النواتج · ΔH = {stats.reaction.dH} kJ/mol
          </SimLabel3D>
          <SimLabel3D position={[0, 0.6, 0]} variant="muted" distanceFactor={26}>
            إحداثي التفاعل ⟶
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

export const KineticsScene3D = ({
  mode,
  params,
  stats,
  playing,
  timeScale,
  showParticles,
  showLabels,
  view,
  autoRotate,
  resetKey,
}: KineticsScene3DProps) => (
  <>
    <SimControls
      view={view}
      autoRotate={autoRotate}
      target={[0, mode === 'energy' ? 4 : 4, 0]}
      scale={mode === 'energy' ? 1.15 : 0.95}
      minDistance={8}
      maxDistance={70}
      clampGround
    />
    <SimStage size={44} showGrid showAxes={false} />

    {mode === 'collisions' && (
      <>
        <Vessel />
        {showParticles && (
          <CollisionBox
            stats={stats}
            params={params}
            playing={playing}
            timeScale={timeScale}
            showLabels={showLabels}
            resetKey={resetKey}
          />
        )}
      </>
    )}

    {mode === 'progress' && (
      <ProgressScene
        stats={stats}
        params={params}
        playing={playing}
        timeScale={timeScale}
        showLabels={showLabels}
      />
    )}

    {mode === 'energy' && (
      <EnergyScene params={params} stats={stats} playing={playing} timeScale={timeScale} showLabels={showLabels} />
    )}
  </>
);

export default KineticsScene3D;
