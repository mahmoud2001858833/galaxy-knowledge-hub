import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { ElectroMode, ElectroParams, ElectroStats, findElectrode } from '@/lib/sim-physics/electrochemistry';

interface ElectroScene3DProps {
  mode: ElectroMode;
  params: ElectroParams;
  stats: ElectroStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

type Sub = Pick<ElectroScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors' | 'resetKey'>;

/** Glass beaker filled with electrolyte. */
const Beaker = ({ x, color, label }: { x: number; color: string; label: string }) => (
  <group position={[x, 0, 0]}>
    <Cylinder args={[3, 3, 5, 40, 1, true]} position={[0, 2.5, 0]}>
      <meshPhysicalMaterial
        color="#cbd5e1"
        transparent
        opacity={0.18}
        roughness={0.05}
        transmission={0.85}
        thickness={0.4}
        side={THREE.DoubleSide}
      />
    </Cylinder>
    <Cylinder args={[2.9, 2.9, 3.6, 40]} position={[0, 1.9, 0]}>
      <meshPhysicalMaterial color={color} transparent opacity={0.42} roughness={0.2} transmission={0.5} />
    </Cylinder>
    <Cylinder args={[3, 3, 0.2, 40]} position={[0, 0.1, 0]}>
      <meshStandardMaterial color="#94a3b8" roughness={0.6} />
    </Cylinder>
    <SimLabel3D position={[0, -0.6, 0]} variant="muted" distanceFactor={34}>
      {label}
    </SimLabel3D>
  </group>
);

/** Metal plate electrode dipped in the solution. */
const Plate = ({
  x,
  color,
  scaleY = 1,
  label,
}: {
  x: number;
  color: string;
  scaleY?: number;
  label: string;
}) => (
  <group position={[x, 0, 0]}>
    <Box args={[0.5, 5.2 * scaleY, 1.8]} position={[0, 2.6 * scaleY + 0.3, 0]} castShadow>
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.28} />
    </Box>
    <SimLabel3D position={[0, 6.4, 0]} distanceFactor={34}>
      {label}
    </SimLabel3D>
  </group>
);

/** Electrons flowing along the external wire. */
const Electrons = ({
  points,
  count,
  speed,
  playing,
  resetKey,
}: {
  points: THREE.Vector3[];
  count: number;
  speed: number;
  playing: boolean;
  resetKey: number;
}) => {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  const last = useRef(resetKey);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * speed * 0.12;
    group.current?.children.forEach((child, i) => {
      const u = (t.current + i / count) % 1;
      const p = curve.getPoint(u);
      child.position.copy(p);
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/** Rising gas bubbles from an electrode. */
const Bubbles = ({ x, active, count, color }: { x: number; active: boolean; count: number; color: string }) => {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!active) return;
    group.current?.children.forEach((child) => {
      child.position.y += delta * (0.8 + child.position.x * 0.05 + 0.6);
      if (child.position.y > 3.6) child.position.y = 0.4;
    });
  });
  if (!active) return null;
  return (
    <group ref={group} position={[x, 0, 0]}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[(i % 5) * 0.18 - 0.36, 0.4 + (i / count) * 3.1, ((i % 4) - 1.5) * 0.25]}>
          <sphereGeometry args={[0.1 + (i % 3) * 0.04, 10, 10]} />
          <meshPhysicalMaterial color={color} transparent opacity={0.6} roughness={0.05} transmission={0.7} />
        </mesh>
      ))}
    </group>
  );
};

const SaltBridge = ({ label }: { label: string }) => {
  const pts = useMemo(
    () =>
      Array.from({ length: 41 }, (_, i) => {
        const u = i / 40;
        const x = -7 + u * 14;
        const y = 4.4 + Math.sin(u * Math.PI) * 2.4;
        return new THREE.Vector3(x, y, 0);
      }),
    []
  );
  const geom = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.45, 14, false), [pts]);
  return (
    <group>
      <mesh geometry={geom}>
        <meshPhysicalMaterial color="#a78bfa" transparent opacity={0.45} roughness={0.1} transmission={0.6} />
      </mesh>
      <SimLabel3D position={[0, 7.6, 0]} variant="accent" distanceFactor={34}>
        {label}
      </SimLabel3D>
    </group>
  );
};

/** Galvanic (voltaic) cell: spontaneous electron flow anode → cathode. */
const GalvanicScene = ({ params, stats, playing, timeScale, showVectors, resetKey }: Sub) => {
  const anode = findElectrode(params.anodeId);
  const cathode = findElectrode(params.cathodeId);

  const wire = useMemo(
    () => [
      new THREE.Vector3(-7, 6.2, 0),
      new THREE.Vector3(-7, 9.2, 0),
      new THREE.Vector3(-2, 10.2, 0),
      new THREE.Vector3(2, 10.2, 0),
      new THREE.Vector3(7, 9.2, 0),
      new THREE.Vector3(7, 6.2, 0),
    ],
    []
  );

  return (
    <group>
      <SimStage size={44} ruler={false} />

      <Beaker x={-7} color="#38bdf8" label={`محلول ${anode.name} ${params.anodeConc.toFixed(2)} M`} />
      <Beaker x={7} color="#22d3ee" label={`محلول ${cathode.name} ${params.cathodeConc.toFixed(2)} M`} />

      <Plate x={-7} color={anode.color} scaleY={0.9} label={`المصعد (−) ${anode.name}`} />
      <Plate x={7} color={cathode.color} scaleY={1.05} label={`المهبط (+) ${cathode.name}`} />

      <SaltBridge label="القنطرة الملحية KCl" />

      <Line points={wire.map((v) => [v.x, v.y, v.z] as [number, number, number])} color="#facc15" lineWidth={3} />

      {/* Voltmeter */}
      <group position={[0, 10.2, 0]}>
        <Box args={[3.4, 1.9, 0.6]}>
          <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.5} />
        </Box>
        <SimLabel3D position={[0, 0, 0.5]} variant={stats.spontaneous ? 'accent' : 'muted'} distanceFactor={30}>
          {stats.eCell.toFixed(3)} V
        </SimLabel3D>
      </group>

      {stats.spontaneous && (
        <Electrons points={wire} count={14} speed={timeScale * Math.max(stats.eCell, 0.05) * 4} playing={playing} resetKey={resetKey} />
      )}

      {showVectors && (
        <SimLabel3D position={[0, 12.4, 0]} variant="muted" distanceFactor={36}>
          الإلكترونات تسري من المصعد إلى المهبط ← اتجاه التيار عكسها
        </SimLabel3D>
      )}

      <SimLabel3D position={[0, 13.9, 0]} variant={stats.spontaneous ? 'accent' : 'muted'} distanceFactor={38}>
        {stats.spontaneous ? 'تفاعل تلقائي' : 'غير تلقائي — اعكس الأقطاب'} — ΔG = {(stats.deltaG / 1000).toFixed(1)} kJ/mol
      </SimLabel3D>
    </group>
  );
};

/** Electrolysis: external supply drives a non-spontaneous reaction. */
const ElectrolysisScene = ({ params, stats, playing, timeScale, resetKey }: Sub) => {
  const anode = findElectrode(params.anodeId);
  const cathode = findElectrode(params.cathodeId);
  const active = stats.electrolysisActive;
  const deposit = Math.min(stats.massDeposited / 8, 1);

  const wire = useMemo(
    () => [
      new THREE.Vector3(-3.5, 6.2, 0),
      new THREE.Vector3(-3.5, 9.6, 0),
      new THREE.Vector3(0, 10.6, 0),
      new THREE.Vector3(3.5, 9.6, 0),
      new THREE.Vector3(3.5, 6.2, 0),
    ],
    []
  );

  return (
    <group>
      <SimStage size={40} ruler={false} />

      <group>
        <Cylinder args={[5.4, 5.4, 5.2, 48, 1, true]} position={[0, 2.6, 0]}>
          <meshPhysicalMaterial
            color="#cbd5e1"
            transparent
            opacity={0.16}
            roughness={0.05}
            transmission={0.85}
            side={THREE.DoubleSide}
          />
        </Cylinder>
        <Cylinder args={[5.3, 5.3, 3.8, 48]} position={[0, 2, 0]}>
          <meshPhysicalMaterial color="#0ea5e9" transparent opacity={0.35} transmission={0.5} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[5.4, 5.4, 0.24, 48]} position={[0, 0.12, 0]}>
          <meshStandardMaterial color="#94a3b8" roughness={0.6} />
        </Cylinder>
      </group>

      <Plate x={-3.5} color={anode.color} scaleY={0.85} label={`المصعد (+) ${anode.name}`} />
      <group position={[3.5, 0, 0]}>
        <Box args={[0.5 + deposit * 0.9, 4.6, 1.8 + deposit * 0.7]} position={[0, 2.6, 0]} castShadow>
          <meshStandardMaterial color={cathode.color} metalness={0.85} roughness={0.25} />
        </Box>
        <SimLabel3D position={[0, 6.4, 0]} distanceFactor={34}>
          المهبط (−) {cathode.name}
        </SimLabel3D>
      </group>

      <Line points={wire.map((v) => [v.x, v.y, v.z] as [number, number, number])} color="#facc15" lineWidth={3} />

      {/* Power supply */}
      <group position={[0, 10.6, 0]}>
        <Box args={[3.8, 2, 0.7]}>
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
        </Box>
        <SimLabel3D position={[0, 0, 0.6]} variant={active ? 'accent' : 'muted'} distanceFactor={30}>
          {params.appliedVoltage.toFixed(2)} V / {params.current.toFixed(2)} A
        </SimLabel3D>
      </group>

      {active && (
        <Electrons points={wire} count={16} speed={timeScale * (1 + params.current)} playing={playing} resetKey={resetKey} />
      )}

      <Bubbles x={-3.5} active={active} count={16} color="#fef9c3" />

      <SimLabel3D position={[0, 13.2, 0]} variant={active ? 'accent' : 'muted'} distanceFactor={38}>
        {active
          ? `التحليل يعمل — ترسّب ${stats.massDeposited.toFixed(4)} g`
          : `الجهد أقل من جهد التفكك ${stats.decompositionVoltage.toFixed(2)} V`}
      </SimLabel3D>
      <SimLabel3D position={[0, 11.9, 0]} variant="muted" distanceFactor={38}>
        الشحنة {stats.charge.toFixed(0)} C — {stats.molesDeposited.toExponential(2)} mol
      </SimLabel3D>
    </group>
  );
};

/** Corrosion: iron bar pitting in saline electrolyte with optional protection. */
const CorrosionScene = ({ params, stats, playing, timeScale, resetKey }: Sub) => {
  const bar = useRef<THREE.Mesh>(null);
  const rust = useRef<THREE.Group>(null);
  const t = useRef(0);
  const last = useRef(resetKey);
  const { settings } = useSimQuality();

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
      if (bar.current) bar.current.scale.set(1, 1, 1);
    }
    if (playing) t.current += delta * timeScale;
    const loss = Math.min(t.current * stats.corrosionRateMmPerYear * 0.02, 0.7);
    if (bar.current) bar.current.scale.set(1 - loss, 1, 1 - loss);
    if (rust.current) {
      rust.current.children.forEach((c, i) => {
        const s = Math.min(0.15 + loss * (0.6 + (i % 4) * 0.15), 1);
        c.scale.setScalar(s);
      });
    }
  });

  const rustCount = settings.shadows ? 18 : 10;

  return (
    <group>
      <SimStage size={40} ruler={false} />

      <Cylinder args={[6, 6, 4, 48, 1, true]} position={[0, 2, 0]}>
        <meshPhysicalMaterial
          color="#cbd5e1"
          transparent
          opacity={0.16}
          roughness={0.05}
          transmission={0.85}
          side={THREE.DoubleSide}
        />
      </Cylinder>
      <Cylinder args={[5.9, 5.9, 3, 48]} position={[0, 1.6, 0]}>
        <meshPhysicalMaterial
          color={params.salinity > 0.5 ? '#0891b2' : '#38bdf8'}
          transparent
          opacity={0.32}
          transmission={0.55}
        />
      </Cylinder>

      {/* Iron bar */}
      <mesh ref={bar} position={[0, 2, 0]} castShadow>
        <boxGeometry args={[1.4, 6.6, 1.4]} />
        <meshStandardMaterial color="#78716c" metalness={0.8} roughness={0.35} />
      </mesh>

      {/* Rust blooms */}
      <group ref={rust}>
        {Array.from({ length: rustCount }, (_, i) => {
          const ang = (i / rustCount) * Math.PI * 2;
          const y = 0.6 + (i / rustCount) * 2.6;
          return (
            <mesh key={i} position={[Math.cos(ang) * 0.9, y, Math.sin(ang) * 0.9]}>
              <sphereGeometry args={[0.35, 12, 12]} />
              <meshStandardMaterial color="#b45309" roughness={0.95} />
            </mesh>
          );
        })}
      </group>

      {/* Sacrificial anode / protection */}
      {params.protection > 0.05 && (
        <group position={[3.6, 0, 0]}>
          <Cylinder args={[0.55, 0.55, 3.4, 20]} position={[0, 1.9, 0]}>
            <meshStandardMaterial color="#a3a3a3" metalness={0.85} roughness={0.3} />
          </Cylinder>
          <SimLabel3D position={[0, 4.4, 0]} variant="accent" distanceFactor={34}>
            مصعد تضحوي / حماية {(params.protection * 100).toFixed(0)}%
          </SimLabel3D>
        </group>
      )}

      <SimLabel3D position={[0, 10.6, 0]} variant="accent" distanceFactor={38}>
        معدّل التآكل {stats.corrosionRateMmPerYear.toFixed(4)} مم/سنة
      </SimLabel3D>
      <SimLabel3D position={[0, 9.3, 0]} variant="muted" distanceFactor={38}>
        تيار التآكل {stats.corrosionCurrentDensity.toFixed(2)} µA/cm² — الملوحة {(params.salinity * 100).toFixed(0)}%
      </SimLabel3D>
      <SimLabel3D position={[0, 8, 0]} variant="muted" distanceFactor={38}>
        {Number.isFinite(stats.yearsToPerforate)
          ? `زمن ثقب 3 مم ≈ ${stats.yearsToPerforate.toFixed(1)} سنة`
          : 'محمي تماماً'}
      </SimLabel3D>
    </group>
  );
};

export const ElectroScene3D = (props: ElectroScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls view={view} autoRotate={autoRotate} target={[0, 4, 0]} maxDistance={90} />
      <directionalLight position={[14, 22, 16]} intensity={1.1} castShadow={settings.shadows} shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-12, 10, -8]} intensity={0.4} />
      <ambientLight intensity={0.5} />
      {mode === 'galvanic' && <GalvanicScene {...props} />}
      {mode === 'electrolysis' && <ElectrolysisScene {...props} />}
      {mode === 'corrosion' && <CorrosionScene {...props} />}
    </>
  );
};

export default ElectroScene3D;
