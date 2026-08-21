import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import {
  CELL_PROFILES,
  CellMode,
  CellType,
  Organelle,
  TransportParams,
  TransportStats,
  organellesFor,
} from '@/lib/sim-physics/cell';

interface CellScene3DProps {
  mode: CellMode;
  cellType: CellType;
  selected: string | null;
  onSelect: (id: string) => void;
  transport: TransportParams;
  transportStats: TransportStats;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const RADIUS = 5;

/** Deterministic pseudo-random for stable organelle placement. */
const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

const OrganelleMesh = ({
  o,
  index,
  scale,
  highlight,
  dim,
  onSelect,
  showLabels,
  playing,
  timeScale,
}: {
  o: Organelle;
  index: number;
  scale: number;
  highlight: boolean;
  dim: boolean;
  onSelect: (id: string) => void;
  showLabels: boolean;
  playing: boolean;
  timeScale: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  const seed = index + o.id.length;
  const base = useMemo(() => {
    if (index === 0) return new THREE.Vector3(...o.pos).multiplyScalar(RADIUS * 0.85);
    const theta = rand(seed) * Math.PI * 2;
    const phi = Math.acos(2 * rand(seed + 1) - 1);
    const r = RADIUS * (0.35 + rand(seed + 2) * 0.5);
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  }, [index, o.pos, seed]);

  const t = useRef(rand(seed) * 10);

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale;
    if (!ref.current) return;
    ref.current.position.set(
      base.x + Math.sin(t.current * 0.6 + seed) * 0.12,
      base.y + Math.cos(t.current * 0.5 + seed) * 0.12,
      base.z + Math.sin(t.current * 0.4 + seed * 2) * 0.12
    );
    ref.current.rotation.y = t.current * 0.25;
    const target = highlight ? 1.25 : 1;
    const s = ref.current.scale.x + (target - ref.current.scale.x) * Math.min(1, delta * 6);
    ref.current.scale.setScalar(s);
  });

  const size = o.size * RADIUS * scale;
  const opacity = dim ? 0.25 : 1;

  return (
    <group ref={ref} onClick={(e) => { e.stopPropagation(); onSelect(o.id); }}>
      <mesh castShadow>
        {o.shape === 'sphere' && <sphereGeometry args={[size, 24, 24]} />}
        {o.shape === 'box' && <boxGeometry args={[size * 2.4, size * 0.5, size * 1.4]} />}
        {o.shape === 'tube' && <capsuleGeometry args={[size * 0.55, size * 1.8, 8, 16]} />}
        {o.shape === 'disc' && <cylinderGeometry args={[size * 1.2, size * 1.2, size * 0.5, 24]} />}
        <meshStandardMaterial
          color={o.color}
          emissive={o.color}
          emissiveIntensity={highlight ? 0.75 : 0.22}
          roughness={0.4}
          transparent
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>
      {(highlight || (showLabels && index === 0)) && (
        <SimLabel3D position={[0, size + 0.6, 0]} variant={highlight ? 'accent' : 'muted'} distanceFactor={30}>
          {o.name}
        </SimLabel3D>
      )}
    </group>
  );
};

/** Cell envelope: membrane (+ wall for plant/bacteria). */
const Envelope = ({
  cellType,
  scale,
  color,
  pulse,
  playing,
  timeScale,
}: {
  cellType: CellType;
  scale: number;
  color: string;
  pulse: boolean;
  playing: boolean;
  timeScale: number;
}) => {
  const membrane = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale;
    if (membrane.current) {
      const s = scale * (pulse ? 1 + Math.sin(t.current * 1.6) * 0.012 : 1);
      const cur = membrane.current.scale.x;
      membrane.current.scale.setScalar(cur + (s - cur) * Math.min(1, delta * 4));
    }
  });

  const rod = cellType === 'bacteria';

  return (
    <group>
      <mesh ref={membrane} scale={scale}>
        {rod ? (
          <capsuleGeometry args={[RADIUS * 0.62, RADIUS * 1.1, 16, 32]} />
        ) : (
          <sphereGeometry args={[RADIUS, 48, 48]} />
        )}
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.16}
          transmission={0.85}
          roughness={0.15}
          thickness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {cellType !== 'animal' && (
        <mesh>
          {rod ? (
            <capsuleGeometry args={[RADIUS * 0.72, RADIUS * 1.15, 16, 32]} />
          ) : (
            <boxGeometry args={[RADIUS * 2.3, RADIUS * 2.3, RADIUS * 2.3]} />
          )}
          <meshStandardMaterial
            color={cellType === 'plant' ? '#84cc16' : '#0ea5e9'}
            transparent
            opacity={0.14}
            roughness={0.8}
            side={THREE.DoubleSide}
            wireframe={cellType === 'plant'}
          />
        </mesh>
      )}
    </group>
  );
};

/** Mode 1 — explore a single cell. */
const ExploreScene = ({
  cellType,
  selected,
  onSelect,
  showLabels,
  playing,
  timeScale,
}: Pick<CellScene3DProps, 'cellType' | 'selected' | 'onSelect' | 'showLabels' | 'playing' | 'timeScale'>) => {
  const list = useMemo(() => organellesFor(cellType).filter((o) => o.id !== 'membrane' && o.id !== 'cellwall'), [cellType]);
  const profile = CELL_PROFILES[cellType];

  return (
    <group>
      <SimStage size={40} ruler={false} />
      <Envelope cellType={cellType} scale={1} color={profile.color} pulse playing={playing} timeScale={timeScale} />
      {list.flatMap((o) =>
        Array.from({ length: o.count }, (_, i) => (
          <OrganelleMesh
            key={`${o.id}-${i}`}
            o={o}
            index={i}
            scale={1}
            highlight={selected === o.id}
            dim={selected !== null && selected !== o.id}
            onSelect={onSelect}
            showLabels={showLabels}
            playing={playing}
            timeScale={timeScale}
          />
        ))
      )}
      <SimLabel3D position={[0, RADIUS + 2.6, 0]} variant="accent" distanceFactor={40}>
        {profile.name} — {profile.domain}
      </SimLabel3D>
      <SimLabel3D position={[0, RADIUS + 1.5, 0]} variant="muted" distanceFactor={40}>
        القطر النموذجي {profile.size} — انقر أي عضيّ لعرض وظيفته
      </SimLabel3D>
    </group>
  );
};

/** Mode 2 — three cells side by side. */
const CompareScene = ({
  selected,
  onSelect,
  showLabels,
  playing,
  timeScale,
}: Pick<CellScene3DProps, 'selected' | 'onSelect' | 'showLabels' | 'playing' | 'timeScale'>) => {
  const types: CellType[] = ['animal', 'plant', 'bacteria'];
  return (
    <group>
      <SimStage size={60} ruler={false} />
      {types.map((type, idx) => {
        const scale = type === 'bacteria' ? 0.55 : 0.75;
        const list = organellesFor(type).filter((o) => o.id !== 'membrane' && o.id !== 'cellwall');
        const profile = CELL_PROFILES[type];
        return (
          <group key={type} position={[(idx - 1) * 13, 0, 0]} scale={scale}>
            <Envelope cellType={type} scale={1} color={profile.color} pulse={false} playing={playing} timeScale={timeScale} />
            {list.flatMap((o) =>
              Array.from({ length: Math.max(1, Math.round(o.count / 2)) }, (_, i) => (
                <OrganelleMesh
                  key={`${type}-${o.id}-${i}`}
                  o={o}
                  index={i}
                  scale={0.9}
                  highlight={selected === o.id}
                  dim={selected !== null && selected !== o.id}
                  onSelect={onSelect}
                  showLabels={false}
                  playing={playing}
                  timeScale={timeScale}
                />
              ))
            )}
            <SimLabel3D position={[0, RADIUS + 2.2, 0]} variant="accent" distanceFactor={46}>
              {profile.name}
            </SimLabel3D>
            {showLabels && (
              <SimLabel3D position={[0, -RADIUS - 1.6, 0]} variant="muted" distanceFactor={46}>
                {profile.wall}
              </SimLabel3D>
            )}
          </group>
        );
      })}
    </group>
  );
};

/** Mode 3 — membrane transport and tonicity. */
const TransportScene = ({
  cellType,
  transport,
  stats,
  playing,
  timeScale,
  showLabels,
}: {
  cellType: CellType;
  transport: TransportParams;
  stats: TransportStats;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
}) => {
  const water = useRef<THREE.Group>(null);
  const solutes = useRef<THREE.Group>(null);
  const t = useRef(0);
  const { settings } = useSimQuality();
  const profile = CELL_PROFILES[cellType];

  const nWater = settings.shadows ? 40 : 20;
  const nSolute = settings.shadows ? 30 : 16;

  const waterSeeds = useMemo(
    () => Array.from({ length: nWater }, (_, i) => ({ th: rand(i) * Math.PI * 2, ph: rand(i + 7) * Math.PI, off: rand(i + 3) })),
    [nWater]
  );
  const soluteSeeds = useMemo(
    () => Array.from({ length: nSolute }, (_, i) => ({ th: rand(i + 50) * Math.PI * 2, ph: rand(i + 60) * Math.PI, off: rand(i + 70) })),
    [nSolute]
  );

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale;
    const inward = stats.waterFlux >= 0;
    water.current?.children.forEach((child, i) => {
      const s = waterSeeds[i];
      if (!s) return;
      const speed = 0.15 + Math.abs(stats.waterFlux) * 0.5;
      let u = (t.current * speed + s.off) % 1;
      if (!inward) u = 1 - u;
      const r = RADIUS * 2.1 - u * RADIUS * 1.5;
      child.position.set(
        r * Math.sin(s.ph) * Math.cos(s.th),
        r * Math.cos(s.ph),
        r * Math.sin(s.ph) * Math.sin(s.th)
      );
    });
    solutes.current?.children.forEach((child, i) => {
      const s = soluteSeeds[i];
      if (!s) return;
      const th = s.th + t.current * 0.25;
      const r = RADIUS * (1.35 + s.off * 0.8);
      child.position.set(r * Math.sin(s.ph) * Math.cos(th), r * Math.cos(s.ph) * 1.1, r * Math.sin(s.ph) * Math.sin(th));
    });
  });

  const soluteDensity = Math.max(2, Math.round((transport.outside / 600) * nSolute));

  return (
    <group>
      <SimStage size={48} ruler={false} />

      {/* External medium */}
      <mesh>
        <sphereGeometry args={[RADIUS * 2.35, 32, 32]} />
        <meshStandardMaterial
          color={stats.tonicity === 'hypertonic' ? '#f97316' : stats.tonicity === 'hypotonic' ? '#38bdf8' : '#22c55e'}
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </mesh>

      <Envelope
        cellType={cellType}
        scale={Math.cbrt(stats.volumeFactor)}
        color={stats.danger ? '#ef4444' : profile.color}
        pulse
        playing={playing}
        timeScale={timeScale}
      />

      {/* Membrane protein channels */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = RADIUS * Math.cbrt(stats.volumeFactor);
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} rotation={[0, -a, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 0.9, 12]} />
            <meshStandardMaterial
              color={transport.atp > 0.4 ? '#facc15' : '#64748b'}
              emissive={transport.atp > 0.4 ? '#facc15' : '#000000'}
              emissiveIntensity={transport.atp * 0.8}
              toneMapped={false}
            />
          </mesh>
        );
      })}

      {/* Water molecules */}
      <group ref={water}>
        {waterSeeds.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.6} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* External solute particles */}
      <group ref={solutes}>
        {soluteSeeds.map((_, i) => (
          <mesh key={i} visible={i < soluteDensity}>
            <boxGeometry args={[0.26, 0.26, 0.26]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} toneMapped={false} />
          </mesh>
        ))}
      </group>

      <SimLabel3D position={[0, RADIUS * 2.5, 0]} variant="accent" distanceFactor={46}>
        {stats.tonicityLabel} — حجم الخلية {(stats.volumeFactor * 100).toFixed(0)}%
      </SimLabel3D>
      {showLabels && (
        <>
          <SimLabel3D position={[0, RADIUS * 2.5 - 1.3, 0]} variant="muted" distanceFactor={46}>
            {stats.outcome}
          </SimLabel3D>
          <SimLabel3D position={[0, -RADIUS * 2.1, 0]} variant="muted" distanceFactor={46}>
            π = MRT = {stats.osmoticPressure.toFixed(3)} atm — الفرق {stats.gradient.toFixed(0)} mM
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

export const CellScene3D = (props: CellScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls view={view} autoRotate={autoRotate} target={[0, 0, 0]} maxDistance={110} />
      <directionalLight position={[12, 20, 14]} intensity={1.05} castShadow={settings.shadows} shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-12, 10, -8]} intensity={0.4} />
      <ambientLight intensity={0.6} />
      {mode === 'explore' && (
        <ExploreScene
          cellType={props.cellType}
          selected={props.selected}
          onSelect={props.onSelect}
          showLabels={props.showLabels}
          playing={props.playing}
          timeScale={props.timeScale}
        />
      )}
      {mode === 'compare' && (
        <CompareScene
          selected={props.selected}
          onSelect={props.onSelect}
          showLabels={props.showLabels}
          playing={props.playing}
          timeScale={props.timeScale}
        />
      )}
      {mode === 'transport' && (
        <TransportScene
          cellType={props.cellType}
          transport={props.transport}
          stats={props.transportStats}
          playing={props.playing}
          timeScale={props.timeScale}
          showLabels={props.showLabels}
        />
      )}
    </>
  );
};

export default CellScene3D;
