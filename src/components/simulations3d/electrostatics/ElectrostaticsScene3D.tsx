import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere, Cylinder, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import {
  ElectrostaticsMode,
  ElectrostaticsParams,
  ElectrostaticsStats,
  traceFieldLine,
} from '@/lib/sim-physics/electrostatics';

interface Props {
  mode: ElectrostaticsMode;
  params: ElectrostaticsParams;
  stats: ElectrostaticsStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const W = 3.2; // world units per metre

const ChargeBall = ({
  q,
  position,
  radius = 0.45,
  label,
}: {
  q: number;
  position: [number, number, number];
  radius?: number;
  label?: string;
}) => {
  const positive = q >= 0;
  const color = positive ? '#f43f5e' : '#38bdf8';
  return (
    <group position={position}>
      <Sphere args={[radius, 26, 26]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.25}
          metalness={0.3}
        />
      </Sphere>
      <Line
        points={[
          [-radius * 0.6, 0, radius + 0.02],
          [radius * 0.6, 0, radius + 0.02],
        ]}
        color="#ffffff"
        lineWidth={4}
      />
      {positive && (
        <Line
          points={[
            [0, -radius * 0.6, radius + 0.02],
            [0, radius * 0.6, radius + 0.02],
          ]}
          color="#ffffff"
          lineWidth={4}
        />
      )}
      {label && (
        <SimLabel3D position={[0, radius + 0.7, 0]} variant="muted" distanceFactor={22}>
          {label}
        </SimLabel3D>
      )}
      <pointLight color={color} intensity={0.8} distance={6} />
    </group>
  );
};

/** Coulomb's law: two charges with force arrows. */
const CoulombScene = ({ params, stats, playing, timeScale, showVectors }: Props) => {
  const t = useRef(0);
  const g1 = useRef<THREE.Group>(null);
  const g2 = useRef<THREE.Group>(null);
  const half = (params.separation / 100) * W * 0.5;

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale;
    const wob = Math.sin(t.current * 2) * 0.06;
    if (g1.current) g1.current.position.x = -half + wob * (stats.attractive ? 1 : -1);
    if (g2.current) g2.current.position.x = half - wob * (stats.attractive ? 1 : -1);
  });

  const arrowLen = Math.min(0.6 + Math.log10(1 + stats.force * 1e3) * 0.5, 3.2);
  const dir = stats.attractive ? 1 : -1;

  return (
    <group position={[0, 3, 0]}>
      <Line points={[[-10, 0, 0], [10, 0, 0]]} color="#475569" lineWidth={1} dashed dashSize={0.3} gapSize={0.25} />
      <group ref={g1} position={[-half, 0, 0]}>
        <ChargeBall q={params.q1} position={[0, 0, 0]} label={`q₁ = ${params.q1} nC`} />
        {showVectors && (
          <>
            <Line
              points={[
                [0, 0, 0],
                [dir * arrowLen, 0, 0],
              ]}
              color="#facc15"
              lineWidth={3}
            />
            <mesh position={[dir * (arrowLen + 0.15), 0, 0]} rotation={[0, 0, dir > 0 ? -Math.PI / 2 : Math.PI / 2]}>
              <coneGeometry args={[0.14, 0.32, 12]} />
              <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.5} />
            </mesh>
          </>
        )}
      </group>
      <group ref={g2} position={[half, 0, 0]}>
        <ChargeBall q={params.q2} position={[0, 0, 0]} label={`q₂ = ${params.q2} nC`} />
        {showVectors && (
          <>
            <Line
              points={[
                [0, 0, 0],
                [-dir * arrowLen, 0, 0],
              ]}
              color="#facc15"
              lineWidth={3}
            />
            <mesh
              position={[-dir * (arrowLen + 0.15), 0, 0]}
              rotation={[0, 0, dir > 0 ? Math.PI / 2 : -Math.PI / 2]}
            >
              <coneGeometry args={[0.14, 0.32, 12]} />
              <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.5} />
            </mesh>
          </>
        )}
      </group>

      {/* separation ruler */}
      <Line points={[[-half, -1.4, 0], [half, -1.4, 0]]} color="#22d3ee" lineWidth={2} />
      <SimLabel3D position={[0, -2.1, 0]} variant="accent" distanceFactor={24}>
        r = {params.separation.toFixed(1)} سم — F = {(stats.force * 1e3).toFixed(3)} mN (
        {stats.attractive ? 'تجاذب' : 'تنافر'})
      </SimLabel3D>
    </group>
  );
};

/** Field lines + equipotential rings + movable probe. */
const FieldScene = ({ params, stats, playing, timeScale, showVectors }: Props) => {
  const t = useRef(0);
  const probe = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const out: { pts: [number, number, number][]; color: string }[] = [];
    for (const c of params.charges) {
      const n = 12;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const sx = c.x + Math.cos(a) * 0.09;
        const sy = c.y + Math.sin(a) * 0.09;
        const dirSign: 1 | -1 = c.q >= 0 ? 1 : -1;
        const path = traceFieldLine(params.charges, sx, sy, dirSign);
        if (path.length > 3) {
          out.push({
            pts: path.map(([x, y]) => [x * W, y * W, 0] as [number, number, number]),
            color: c.q >= 0 ? '#fb7185' : '#60a5fa',
          });
        }
      }
    }
    return out;
  }, [params.charges]);

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale;
    if (probe.current) probe.current.position.y = params.probeY * W + Math.sin(t.current * 2) * 0.04;
  });

  const eScale = Math.min(Math.log10(1 + stats.fieldAtProbe) * 0.5, 3);
  const ang = (stats.fieldAngle * Math.PI) / 180;

  return (
    <group position={[0, 3, 0]}>
      {lines.map((l, i) => (
        <Line key={i} points={l.pts} color={l.color} lineWidth={1.4} transparent opacity={0.55} />
      ))}

      {/* equipotential rings around each charge */}
      {params.charges.map((c) =>
        [0.5, 1, 1.6].map((r) => (
          <Torus
            key={`${c.id}-${r}`}
            args={[r * W * 0.5, 0.015, 8, 64]}
            position={[c.x * W, c.y * W, 0]}
          >
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.25} />
          </Torus>
        ))
      )}

      {params.charges.map((c) => (
        <ChargeBall
          key={c.id}
          q={c.q}
          position={[c.x * W, c.y * W, 0]}
          radius={0.3}
          label={`${c.q > 0 ? '+' : ''}${c.q} nC`}
        />
      ))}

      {/* probe */}
      <group ref={probe} position={[params.probeX * W, params.probeY * W, 0]}>
        <Sphere args={[0.16, 18, 18]}>
          <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.8} />
        </Sphere>
        {showVectors && (
          <>
            <Line
              points={[
                [0, 0, 0],
                [Math.cos(ang) * eScale, Math.sin(ang) * eScale, 0],
              ]}
              color="#4ade80"
              lineWidth={3}
            />
            <mesh
              position={[Math.cos(ang) * (eScale + 0.15), Math.sin(ang) * (eScale + 0.15), 0]}
              rotation={[0, 0, ang - Math.PI / 2]}
            >
              <coneGeometry args={[0.12, 0.3, 12]} />
              <meshStandardMaterial color="#4ade80" emissive="#22c55e" emissiveIntensity={0.6} />
            </mesh>
          </>
        )}
        <SimLabel3D position={[0, -0.8, 0]} variant="accent" distanceFactor={22}>
          E = {(stats.fieldAtProbe / 1e3).toFixed(2)} kV/m — V = {(stats.potentialAtProbe / 1e3).toFixed(2)} kV
        </SimLabel3D>
      </group>
    </group>
  );
};

/** Van de Graaff generator with belt, dome and spark. */
const VanDeGraaffScene = ({ params, stats, playing, timeScale }: Props) => {
  const t = useRef(0);
  const belt = useRef<THREE.Group>(null);
  const spark = useRef<THREE.Group>(null);
  const R = Math.max((params.domeRadius / 100) * W, 0.5);
  const columnH = 4;

  const hairs = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const a = (i / 26) * Math.PI * 2;
        return { a, r: 0.9 + Math.random() * 0.4 };
      }),
    []
  );

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale;
    if (belt.current) {
      belt.current.children.forEach((c, i) => {
        const off = (t.current * params.beltSpeed * 1.2 + i * 0.25) % 1;
        c.position.y = off * columnH;
      });
    }
    if (spark.current) {
      spark.current.visible = stats.breakdown && Math.sin(t.current * 14) > 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* base + column */}
      <Cylinder args={[1.4, 1.6, 0.35, 32]} position={[0, 0.18, 0]}>
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
      </Cylinder>
      <Cylinder args={[0.28, 0.28, columnH, 24]} position={[0, columnH / 2 + 0.3, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.6} />
      </Cylinder>

      {/* belt charges */}
      <group ref={belt} position={[0, 0.4, 0.3]}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[0, 0, 0]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.9} />
          </mesh>
        ))}
      </group>

      {/* dome */}
      <Sphere args={[R, 40, 40]} position={[0, columnH + 0.3 + R * 0.6, 0]}>
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.95}
          roughness={0.08}
          emissive="#38bdf8"
          emissiveIntensity={stats.breakdown ? 0.35 : 0.08}
        />
      </Sphere>
      <SimLabel3D position={[0, columnH + 1 + R * 1.6, 0]} variant="accent" distanceFactor={26}>
        V = {(stats.domePotential / 1e3).toFixed(0)} kV — E = {(stats.domeSurfaceField / 1e6).toFixed(2)} MV/m
      </SimLabel3D>

      {/* surface charge hairs */}
      {hairs.map((h, i) => {
        const y = columnH + 0.3 + R * 0.6;
        const x = Math.cos(h.a) * R;
        const z = Math.sin(h.a) * R;
        return (
          <Line
            key={i}
            points={[
              [x, y, z],
              [x * h.r, y + 0.3, z * h.r],
            ]}
            color="#fb7185"
            lineWidth={1.5}
            transparent
            opacity={0.6}
          />
        );
      })}

      {/* grounded sphere + spark */}
      <group position={[R + 2.4, columnH + 0.3 + R * 0.6, 0]}>
        <Sphere args={[0.6, 26, 26]}>
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </Sphere>
        <Line points={[[0, -0.6, 0], [0, -(columnH + R), 0]]} color="#64748b" lineWidth={2} />
      </group>

      <group ref={spark} visible={false}>
        <Line
          points={Array.from({ length: 9 }, (_, i) => {
            const f = i / 8;
            return [
              R + f * 1.8,
              columnH + 0.3 + R * 0.6 + (i % 2 === 0 ? 0.12 : -0.12) * (1 - f),
              0,
            ] as [number, number, number];
          })}
          color="#a5f3fc"
          lineWidth={4}
        />
        <pointLight
          position={[R + 1, columnH + 0.3 + R * 0.6, 0]}
          color="#a5f3fc"
          intensity={4}
          distance={12}
        />
      </group>

      {stats.breakdown && (
        <SimLabel3D position={[R + 1.2, columnH + 1.6, 0]} distanceFactor={24}>
          انهيار الهواء! شرارة بطول ≈ {stats.sparkLength.toFixed(1)} سم
        </SimLabel3D>
      )}
    </group>
  );
};

export const ElectrostaticsScene3D = (props: Props) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls
        view={view}
        autoRotate={autoRotate}
        target={[0, mode === 'vandegraaff' ? 4 : 3, 0]}
        maxDistance={70}
      />
      <directionalLight
        position={[9, 16, 12]}
        intensity={1.1}
        castShadow={settings.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.45} />
      <SimStage size={40} showAxes={false} />
      {mode === 'coulomb' && <CoulombScene {...props} />}
      {mode === 'field' && <FieldScene {...props} />}
      {mode === 'vandegraaff' && <VanDeGraaffScene {...props} />}
    </>
  );
};

export default ElectrostaticsScene3D;
