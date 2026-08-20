import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Torus, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { EMMode, EMParams, EMStats } from '@/lib/sim-physics/em';

interface EMScene3DProps {
  mode: EMMode;
  params: EMParams;
  stats: EMStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

/** Straight current-carrying wire with concentric circular field loops (right-hand rule). */
const WireScene = ({
  params,
  stats,
  playing,
  timeScale,
  showVectors,
}: Pick<EMScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors'>) => {
  const { settings } = useSimQuality();
  const electrons = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const t = useRef(0);
  const count = Math.max(10, Math.floor(settings.particles / 25));
  const H = 14;

  const rings = useMemo(() => [1.2, 2.2, 3.4, 4.8], []);
  const ringPts = (r: number) =>
    Array.from({ length: 65 }, (_, i) => {
      const a = (i / 64) * Math.PI * 2;
      return [Math.cos(a) * r, 0, Math.sin(a) * r] as [number, number, number];
    });

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale * Math.sign(params.current || 1);
    if (!electrons.current) return;
    for (let i = 0; i < count; i++) {
      const y = (((i / count + t.current * 0.25) % 1) * H) - H / 2;
      dummy.position.set(0, y, 0);
      dummy.updateMatrix();
      electrons.current.setMatrixAt(i, dummy.matrix);
    }
    electrons.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <SimStage size={40} showAxes={false} />

      {/* wire */}
      <Cylinder args={[0.14, 0.14, H, 20]} position={[0, H / 2 - 1, 0]}>
        <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.25} />
      </Cylinder>
      <instancedMesh
        ref={electrons}
        args={[undefined as any, undefined as any, count]}
        position={[0, H / 2 - 1, 0]}
      >
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.8} />
      </instancedMesh>
      <SimLabel3D position={[0.9, H - 1.6, 0]} variant="accent" distanceFactor={30}>
        التيار I = {params.current.toFixed(1)} أمبير
      </SimLabel3D>

      {/* field loops at several heights */}
      {[1.5, 5, 8.5].map((y) =>
        rings.map((r) => (
          <group key={`${y}-${r}`} position={[0, y, 0]}>
            <Line points={ringPts(r)} color="#a855f7" lineWidth={1.5} transparent opacity={0.55} />
          </group>
        ))
      )}

      {/* measurement point */}
      <group position={[Math.min(params.distance * 20, 6), 5, 0]}>
        <mesh>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.5} />
        </mesh>
        <SimLabel3D position={[0, 1, 0]} distanceFactor={26}>
          B = {(stats.wireField * 1e6).toFixed(2)} ميكروتسلا
        </SimLabel3D>
      </group>
      <Line
        points={[
          [0, 5, 0],
          [Math.min(params.distance * 20, 6), 5, 0],
        ]}
        color="#94a3b8"
        lineWidth={1.5}
        dashed
        dashSize={0.3}
        gapSize={0.25}
      />

      {showVectors && (
        <>
          <Line points={[[0, 0.2, 0], [0, H - 1.2, 0]]} color="#22c55e" lineWidth={3} />
          <SimLabel3D position={[-2.6, 8.5, 0]} variant="muted" distanceFactor={30}>
            قاعدة اليد اليمنى: الإبهام مع التيار والأصابع مع B
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

/** Solenoid coil with an internal uniform field and optional iron core. */
const SolenoidScene = ({
  params,
  stats,
  playing,
  timeScale,
  showVectors,
}: Pick<EMScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors'>) => {
  const group = useRef<THREE.Group>(null);
  const R = 2.2;
  const L = 10;
  const loops = 14;

  useFrame((_, delta) => {
    if (playing && group.current) group.current.rotation.y += delta * timeScale * 0.35;
  });

  const helix = useMemo(() => {
    const pts: [number, number, number][] = [];
    const total = loops * 40;
    for (let i = 0; i <= total; i++) {
      const a = (i / 40) * Math.PI * 2;
      const x = (i / total) * L - L / 2;
      pts.push([x, Math.sin(a) * R, Math.cos(a) * R]);
    }
    return pts;
  }, []);

  const insideLines = useMemo(
    () =>
      [-1.2, -0.6, 0, 0.6, 1.2].map((z) => [
        [-L / 2 - 1.5, z, 0],
        [L / 2 + 1.5, z, 0],
      ] as [number, number, number][]),
    []
  );

  return (
    <group>
      <SimStage size={40} showAxes={false} />
      <group ref={group} position={[0, 5, 0]}>
        <Line points={helix} color="#f97316" lineWidth={3} />

        {params.coreMu > 50 && (
          <Cylinder args={[R * 0.55, R * 0.55, L, 24]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.35} />
          </Cylinder>
        )}

        {insideLines.map((pts, i) => (
          <Line key={i} points={pts} color="#38bdf8" lineWidth={2} transparent opacity={0.8} />
        ))}

        {showVectors && (
          <>
            <Line points={[[L / 2 + 1.5, 0, 0], [L / 2 + 3, 0, 0]]} color="#22c55e" lineWidth={4} />
            <SimLabel3D position={[L / 2 + 4, 0.8, 0]} variant="accent" distanceFactor={28}>
              B داخلي منتظم
            </SimLabel3D>
          </>
        )}

        <SimLabel3D position={[0, R + 1.4, 0]} distanceFactor={30}>
          B = {(stats.solenoidField * 1e3).toFixed(3)} ملي تسلا — n = {stats.turnsPerMetre.toFixed(0)} لفة/م
        </SimLabel3D>
        <SimLabel3D position={[0, -R - 1.4, 0]} variant="muted" distanceFactor={30}>
          {params.coreMu > 50 ? 'قلب حديدي' : 'قلب هوائي'} — L = {(stats.inductance * 1e3).toFixed(2)} ملي هنري
        </SimLabel3D>
      </group>
    </group>
  );
};

/** Rotating loop inside a uniform field — Faraday's law generator. */
const InductionScene = ({
  params,
  stats,
  playing,
  timeScale,
  showVectors,
  resetKey,
}: Pick<EMScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors' | 'resetKey'>) => {
  const loop = useRef<THREE.Group>(null);
  const bulb = useRef<THREE.Mesh>(null);
  const angle = useRef(0);
  const last = useRef(resetKey);

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      angle.current = 0;
    }
    if (playing) angle.current += delta * timeScale * params.rotationSpeed * 2;
    if (loop.current) loop.current.rotation.y = angle.current;
    if (bulb.current) {
      const emf = Math.abs(Math.sin(angle.current));
      const mat = bulb.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = emf * Math.min(stats.peakCurrent * 2, 4);
    }
  });

  const fieldLines = useMemo(() => {
    const pts: [number, number, number][][] = [];
    for (let i = -3; i <= 3; i++) {
      for (let j = -1; j <= 1; j++) {
        pts.push([
          [i * 1.6, 0.4, j * 2.4],
          [i * 1.6, 9, j * 2.4],
        ]);
      }
    }
    return pts;
  }, []);

  return (
    <group>
      <SimStage size={40} showAxes={false} />

      {fieldLines.map((pts, i) => (
        <Line key={i} points={pts} color="#3b82f6" lineWidth={1} transparent opacity={0.35} />
      ))}
      <SimLabel3D position={[-6.5, 8.5, 0]} variant="muted" distanceFactor={30}>
        مجال منتظم B = {params.fieldStrength.toFixed(2)} تسلا
      </SimLabel3D>

      <group ref={loop} position={[0, 5, 0]}>
        <Torus args={[2.2, 0.09, 12, 48]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.25} />
        </Torus>
        <mesh>
          <circleGeometry args={[2.2, 40]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
        {showVectors && (
          <Line points={[[0, 0, 0], [0, 0, 3]]} color="#ef4444" lineWidth={3} />
        )}
      </group>

      {/* load / lamp */}
      <group position={[6.5, 1.4, 0]}>
        <mesh ref={bulb}>
          <sphereGeometry args={[0.7, 20, 20]} />
          <meshStandardMaterial color="#fde68a" emissive="#facc15" emissiveIntensity={0.4} />
        </mesh>
        <SimLabel3D position={[0, 1.4, 0]} variant="accent" distanceFactor={26}>
          ε_max = {stats.peakEmf.toFixed(2)} فولت
        </SimLabel3D>
        <SimLabel3D position={[0, -1.2, 0]} distanceFactor={26}>
          I_max = {stats.peakCurrent.toFixed(2)} أمبير
        </SimLabel3D>
      </group>

      <Line
        points={[
          [2.2, 5, 0],
          [6.5, 5, 0],
          [6.5, 2.1, 0],
        ]}
        color="#94a3b8"
        lineWidth={2}
      />
    </group>
  );
};

export const EMScene3D = (props: EMScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls
        view={view}
        autoRotate={autoRotate}
        scale={1.1}
        target={[0, 4.5, 0]}
        maxDistance={90}
      />
      <directionalLight
        position={[12, 20, 12]}
        intensity={1.3}
        castShadow={settings.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.45} />
      {mode === 'wire' && <WireScene {...props} />}
      {mode === 'solenoid' && <SolenoidScene {...props} />}
      {mode === 'induction' && <InductionScene {...props} />}
    </>
  );
};

export default EMScene3D;
