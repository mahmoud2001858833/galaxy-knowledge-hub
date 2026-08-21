import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import {
  CYCLE_CHECKPOINTS,
  CYCLE_STAGES,
  DivisionMode,
  DivisionStats,
} from '@/lib/sim-physics/celldivision';

interface DivisionScene3DProps {
  mode: DivisionMode;
  stats: DivisionStats;
  /** 0..1 position on the cell-cycle wheel (cycle mode). */
  cycleT: number;
  showLabels: boolean;
  showSpindle: boolean;
  crossingOver: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const PAIR_COLORS = ['#f43f5e', '#38bdf8', '#f59e0b', '#a855f7'];
const CELL_R = 4.2;

/** One chromosome drawn as an X (two chromatids) or a single rod. */
const Chromosome = ({
  position,
  color,
  chromatids,
  angle,
  scale = 1,
  swapped,
}: {
  position: [number, number, number];
  color: string;
  chromatids: 1 | 2;
  angle: number;
  scale?: number;
  swapped?: boolean;
}) => {
  const tip = swapped ? '#22c55e' : color;
  return (
    <group position={position} rotation={[0, 0, angle]} scale={scale}>
      {chromatids === 2 ? (
        <>
          <group rotation={[0, 0, 0.32]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.17, 1.5, 6, 12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.85, 0]}>
              <sphereGeometry args={[0.19, 12, 12]} />
              <meshStandardMaterial color={tip} emissive={tip} emissiveIntensity={0.5} />
            </mesh>
          </group>
          <group rotation={[0, 0, -0.32]}>
            <mesh castShadow>
              <capsuleGeometry args={[0.17, 1.5, 6, 12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.85, 0]}>
              <sphereGeometry args={[0.19, 12, 12]} />
              <meshStandardMaterial color={tip} emissive={tip} emissiveIntensity={0.5} />
            </mesh>
          </group>
          {/* centromere */}
          <mesh>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#e2e8f0" emissive="#94a3b8" emissiveIntensity={0.4} />
          </mesh>
        </>
      ) : (
        <mesh castShadow>
          <capsuleGeometry args={[0.17, 1.5, 6, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.4} />
        </mesh>
      )}
    </group>
  );
};

const Membrane = ({
  center,
  radius,
  pinch,
  color = '#22d3ee',
}: {
  center: [number, number, number];
  radius: number;
  pinch: number;
  color?: string;
}) => (
  <group position={center}>
    <mesh scale={[1, Math.max(0.25, 1 - pinch * 0.55), 1]}>
      <sphereGeometry args={[radius, 40, 32]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.16}
        roughness={0.1}
        transmission={0.75}
        thickness={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
    <mesh scale={[1, Math.max(0.25, 1 - pinch * 0.55), 1]}>
      <sphereGeometry args={[radius * 1.005, 40, 32]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.12} />
    </mesh>
  </group>
);

const Centrosome = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh>
      <cylinderGeometry args={[0.12, 0.12, 0.5, 10]} />
      <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 0.5, 10]} />
      <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
    </mesh>
  </group>
);

/** A dividing cell with its chromosomes laid out for the current phase. */
const DividingCell = ({
  center,
  stats,
  mode,
  showSpindle,
  crossingOver,
  scale,
}: {
  center: [number, number, number];
  stats: DivisionStats;
  mode: DivisionMode;
  showSpindle: boolean;
  crossingOver: boolean;
  scale: number;
}) => {
  const id = stats.phase.id;
  const p = stats.phaseProgress;
  const r = CELL_R * scale;

  const meiosis = mode === 'meiosis';
  const pairs = 2; // 2n = 4 → two homologous pairs

  type Chr = { pos: [number, number, number]; color: string; chromatids: 1 | 2; angle: number; swapped?: boolean };

  const chromosomes = useMemo<Chr[]>(() => {
    const list: Chr[] = [];
    const push = (x: number, y: number, color: string, chromatids: 1 | 2, angle = 0, swapped = false) =>
      list.push({ pos: [x, y, 0], color, chromatids, angle, swapped });

    const spread = r * 0.55;

    if (id === 'interphase') {
      // loose chromatin threads
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        push(Math.cos(a) * spread * 0.5, Math.sin(a) * spread * 0.5, PAIR_COLORS[i % pairs], p > 0.5 ? 2 : 1, a);
      }
      return list;
    }
    if (id === 'prophase' || id === 'prophase1') {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + p * 1.2;
        const pairIdx = i % pairs;
        const near = meiosis ? 0.55 - p * 0.3 : 1;
        push(
          Math.cos(a) * spread * near,
          Math.sin(a) * spread * near,
          PAIR_COLORS[pairIdx],
          2,
          a,
          meiosis && crossingOver && p > 0.6
        );
      }
      return list;
    }
    if (id === 'metaphase') {
      for (let i = 0; i < 4; i++) {
        push(0, (i - 1.5) * (r * 0.42), PAIR_COLORS[i % pairs], 2, Math.PI / 2);
      }
      return list;
    }
    if (id === 'metaphase1') {
      for (let i = 0; i < 4; i++) {
        const side = i % 2 === 0 ? -0.55 : 0.55;
        push(side, (Math.floor(i / 2) - 0.5) * (r * 0.8), PAIR_COLORS[Math.floor(i / 2)], 2, Math.PI / 2, crossingOver && i % 2 === 1);
      }
      return list;
    }
    if (id === 'anaphase') {
      const d = p * r * 0.75;
      for (let i = 0; i < 4; i++) {
        const y = (i - 1.5) * (r * 0.36);
        push(-d - 0.3, y, PAIR_COLORS[i % pairs], 1, Math.PI / 2);
        push(d + 0.3, y, PAIR_COLORS[i % pairs], 1, Math.PI / 2);
      }
      return list;
    }
    if (id === 'anaphase1') {
      const d = p * r * 0.7;
      for (let i = 0; i < 2; i++) {
        const y = (i - 0.5) * (r * 0.8);
        push(-d - 0.5, y, PAIR_COLORS[i], 2, Math.PI / 2);
        push(d + 0.5, y, PAIR_COLORS[i], 2, Math.PI / 2, crossingOver);
      }
      return list;
    }
    if (id === 'telophase') {
      for (let i = 0; i < 4; i++) {
        const y = (i - 1.5) * (r * 0.3);
        push(-r * 0.62, y, PAIR_COLORS[i % pairs], 1, 0.4);
        push(r * 0.62, y, PAIR_COLORS[i % pairs], 1, -0.4);
      }
      return list;
    }
    if (id === 'cytokinesis' || id === 'telophase1' || id === 'metaphase2' || id === 'anaphase2' || id === 'telophase2') {
      return list; // handled per daughter cell below
    }
    return list;
  }, [id, p, r, meiosis, crossingOver, pairs]);

  const poleX = r * 0.95;
  const pinch = id === 'cytokinesis' || id === 'telophase1' ? Math.min(1, p) : 0;
  const nucleus = id === 'interphase' || id === 'telophase' || id === 'cytokinesis';
  const spindleActive =
    showSpindle && ['prophase', 'prophase1', 'metaphase', 'metaphase1', 'anaphase', 'anaphase1'].includes(id);

  return (
    <group position={center}>
      <Membrane center={[0, 0, 0]} radius={r} pinch={pinch} />

      {nucleus && (
        <mesh>
          <sphereGeometry args={[r * 0.62, 32, 24]} />
          <meshPhysicalMaterial color="#818cf8" transparent opacity={0.18} transmission={0.7} thickness={0.4} />
        </mesh>
      )}

      {spindleActive && (
        <>
          <Centrosome position={[-poleX, 0, 0]} />
          <Centrosome position={[poleX, 0, 0]} />
          {chromosomes.map((c, i) => (
            <group key={`f${i}`}>
              <Line points={[[-poleX, 0, 0], c.pos]} color="#94a3b8" lineWidth={1} transparent opacity={0.45} />
              <Line points={[[poleX, 0, 0], c.pos]} color="#94a3b8" lineWidth={1} transparent opacity={0.45} />
            </group>
          ))}
        </>
      )}

      {chromosomes.map((c, i) => (
        <Chromosome key={i} position={c.pos} color={c.color} chromatids={c.chromatids} angle={c.angle} swapped={c.swapped} scale={scale} />
      ))}
    </group>
  );
};

/** Cell-cycle wheel (G1, S, G2, M) with a rotating pointer and checkpoints. */
const CycleWheel = ({ t, showLabels }: { t: number; showLabels: boolean }) => {
  const total = CYCLE_STAGES.reduce((s, x) => s + x.hours, 0);
  const ptr = useRef<THREE.Group>(null);

  useFrame(() => {
    if (ptr.current) ptr.current.rotation.z = -t * Math.PI * 2;
  });

  let acc = 0;
  const arcs = CYCLE_STAGES.map((s) => {
    const start = (acc / total) * Math.PI * 2;
    acc += s.hours;
    const end = (acc / total) * Math.PI * 2;
    const mid = (start + end) / 2;
    return { ...s, start, end, mid };
  });

  return (
    <group position={[0, 4, 0]} rotation={[-Math.PI / 2.6, 0, 0]}>
      {arcs.map((a) => (
        <group key={a.id}>
          <mesh rotation={[0, 0, a.start]}>
            <ringGeometry args={[2.2, 4.4, 48, 1, 0, a.end - a.start]} />
            <meshStandardMaterial color={a.color} emissive={a.color} emissiveIntensity={0.35} side={THREE.DoubleSide} />
          </mesh>
          {showLabels && (
            <SimLabel3D position={[Math.cos(a.mid) * 5.6, Math.sin(a.mid) * 5.6, 0]} distanceFactor={34}>
              {a.name} — {a.hours} س
            </SimLabel3D>
          )}
        </group>
      ))}

      <group ref={ptr}>
        <mesh position={[0, 3.3, 0.35]}>
          <coneGeometry args={[0.35, 1.1, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#e2e8f0" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[0, 1.7, 0.35]}>
          <boxGeometry args={[0.16, 2.2, 0.16]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      </group>

      <mesh>
        <circleGeometry args={[2.1, 40]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {CYCLE_CHECKPOINTS.map((c, i) => {
        const at = [(11 / total) * Math.PI * 2, (23 / total) * Math.PI * 2, (23.6 / total) * Math.PI * 2][i];
        return (
          <mesh key={c.id} position={[Math.cos(at) * 4.6, Math.sin(at) * 4.6, 0.2]}>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

export const DivisionScene3D = ({
  mode,
  stats,
  cycleT,
  showLabels,
  showSpindle,
  crossingOver,
  view,
  autoRotate,
  resetKey,
}: DivisionScene3DProps) => {
  const { settings } = useSimQuality();
  const cells = stats.phase.cells;
  const id = stats.phase.id;
  const p = stats.phaseProgress;

  // Daughter-cell layout for late phases.
  const centers = useMemo<[number, number, number][]>(() => {
    if (cells === 1) return [[0, 3.6, 0]];
    if (cells === 2) return [[-5.2, 3.6, 0], [5.2, 3.6, 0]];
    return [
      [-5.2, 3.6, -4],
      [5.2, 3.6, -4],
      [-5.2, 3.6, 4],
      [5.2, 3.6, 4],
    ];
  }, [cells]);

  const scale = cells === 1 ? 1 : cells === 2 ? 0.72 : 0.55;

  return (
    <group key={resetKey}>
      <SimStage size={44} showGrid showAxes={false} />
      <SimControls
        view={view}
        scale={mode === 'cycle' ? 1.1 : 1}
        target={[0, 3.6, 0]}
        autoRotate={autoRotate}
        minDistance={8}
        maxDistance={60}
      />

      {mode === 'cycle' ? (
        <CycleWheel t={cycleT} showLabels={showLabels} />
      ) : cells === 1 ? (
        <DividingCell
          center={centers[0]}
          stats={stats}
          mode={mode}
          showSpindle={showSpindle}
          crossingOver={crossingOver}
          scale={1}
        />
      ) : (
        centers.map((c, i) => (
          <group key={i} position={c}>
            <Membrane center={[0, 0, 0]} radius={CELL_R * scale} pinch={0} />
            <mesh>
              <sphereGeometry args={[CELL_R * scale * 0.6, 28, 20]} />
              <meshPhysicalMaterial color="#818cf8" transparent opacity={0.16} transmission={0.7} thickness={0.4} />
            </mesh>
            {Array.from({ length: stats.phase.chromosomes / (id === 'anaphase2' ? 1 : 1) }).map((_, k) => {
              const spreadY = (k - (stats.phase.chromosomes - 1) / 2) * CELL_R * scale * 0.5;
              const anaSpread = id === 'anaphase2' ? (k % 2 === 0 ? -1 : 1) * p * CELL_R * scale * 0.7 : 0;
              const metaLine = id === 'metaphase2' ? 0 : anaSpread;
              return (
                <Chromosome
                  key={k}
                  position={[metaLine, id === 'metaphase2' ? spreadY : spreadY * 0.7, 0]}
                  color={PAIR_COLORS[k % PAIR_COLORS.length]}
                  chromatids={stats.phase.chromatids}
                  angle={id === 'metaphase2' || id === 'anaphase2' ? Math.PI / 2 : 0.4}
                  scale={scale}
                />
              );
            })}
            {showLabels && (
              <SimLabel3D position={[0, CELL_R * scale + 1.1, 0]} distanceFactor={40}>
                {stats.phase.ploidy}
              </SimLabel3D>
            )}
          </group>
        ))
      )}

      {mode !== 'cycle' && (
        <SimLabel3D position={[0, 11, 0]} variant="accent" distanceFactor={46}>
          {stats.phase.name} — {stats.phase.nameEn}
        </SimLabel3D>
      )}

      <pointLight position={[0, 12, 8]} intensity={30} color="#c7d2fe" distance={40} />
    </group>
  );
};

export default DivisionScene3D;
