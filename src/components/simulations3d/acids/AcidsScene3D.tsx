import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import {
  AcidBaseMode,
  AcidBaseParams,
  AcidBaseStats,
  findAcid,
  findBase,
  findIndicator,
  phColor,
} from '@/lib/sim-physics/acidsbases';

interface AcidsScene3DProps {
  mode: AcidBaseMode;
  params: AcidBaseParams;
  stats: AcidBaseStats;
  playing: boolean;
  timeScale: number;
  showParticles: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

type Sub = Pick<AcidsScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'showParticles' | 'resetKey'>;

/** Transparent glass beaker with a coloured liquid column. */
const Beaker = ({
  position = [0, 0, 0] as [number, number, number],
  radius = 3,
  height = 5,
  fill = 0.7,
  color,
  label,
}: {
  position?: [number, number, number];
  radius?: number;
  height?: number;
  fill?: number;
  color: string;
  label?: string;
}) => {
  const liquidH = Math.max(height * fill, 0.2);
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius, height, 44, 1, true]} />
        <meshPhysicalMaterial
          color="#cbd5e1"
          transparent
          opacity={0.16}
          roughness={0.05}
          transmission={0.88}
          thickness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, liquidH / 2 + 0.12, 0]}>
        <cylinderGeometry args={[radius - 0.08, radius - 0.08, liquidH, 44]} />
        <meshPhysicalMaterial color={color} transparent opacity={0.55} roughness={0.15} transmission={0.42} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[radius, radius, 0.14, 44]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} />
      </mesh>
      {label && (
        <SimLabel3D position={[0, -0.7, 0]} variant="muted" distanceFactor={34}>
          {label}
        </SimLabel3D>
      )}
    </group>
  );
};

/** H⁺ / OH⁻ ions swirling inside the solution. */
const Ions = ({
  count,
  radius,
  height,
  color,
  playing,
  speed,
  offset = 0,
}: {
  count: number;
  radius: number;
  height: number;
  color: string;
  playing: boolean;
  speed: number;
  offset?: number;
}) => {
  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        r: 0.3 + Math.random() * (radius - 0.5),
        a: Math.random() * Math.PI * 2,
        y: 0.3 + Math.random() * (height - 0.6),
        w: 0.4 + Math.random() * 0.8,
      })),
    [count, radius, height]
  );
  const t = useRef(0);

  useFrame((_, delta) => {
    if (playing) t.current += delta * speed;
    group.current?.children.forEach((child, i) => {
      const s = seeds[i];
      if (!s) return;
      const a = s.a + t.current * s.w;
      child.position.set(Math.cos(a) * s.r + offset, s.y + Math.sin(t.current * s.w + i) * 0.18, Math.sin(a) * s.r);
    });
  });

  return (
    <group ref={group}>
      {seeds.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/** Mode 1 — pH meter: a beaker whose colour tracks the pH plus a vertical pH scale. */
const PhScene = ({ params, stats, playing, timeScale, showParticles }: Sub) => {
  const probe = useRef<THREE.Mesh>(null);
  const marker = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const { settings } = useSimQuality();

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale;
    if (probe.current) probe.current.position.y = 4.6 + Math.sin(t.current * 1.6) * 0.12;
    if (marker.current) {
      const target = (stats.ph / 14) * 12 + 0.4;
      marker.current.position.y += (target - marker.current.position.y) * Math.min(1, delta * 5);
    }
  });

  const acidic = stats.ph < 7;
  const ionCount = settings.shadows ? 26 : 14;

  return (
    <group>
      <SimStage size={40} ruler={false} />
      <Beaker color={stats.colorHex} fill={0.72} label={params.acidAnalyte ? findAcid(params.acidId).formula : findBase(params.baseId).formula} />

      {showParticles && (
        <>
          <Ions
            count={Math.max(3, Math.round((ionCount * (14 - stats.ph)) / 14))}
            radius={2.6}
            height={3.4}
            color="#f97316"
            playing={playing}
            speed={0.9 * timeScale}
          />
          <Ions
            count={Math.max(3, Math.round((ionCount * stats.ph) / 14))}
            radius={2.2}
            height={3.2}
            color="#38bdf8"
            playing={playing}
            speed={0.7 * timeScale}
          />
        </>
      )}

      {/* pH probe */}
      <mesh ref={probe} position={[1.6, 4.6, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 5, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* pH scale tower */}
      <group position={[7.5, 0, 0]}>
        {Array.from({ length: 15 }, (_, i) => (
          <mesh key={i} position={[0, 0.4 + (i / 14) * 12, 0]}>
            <boxGeometry args={[1.2, 0.8, 1.2]} />
            <meshStandardMaterial color={phColor(i)} roughness={0.5} />
          </mesh>
        ))}
        <mesh ref={marker} position={[1.6, 0.4, 0]}>
          <coneGeometry args={[0.45, 1, 4]} />
          <meshStandardMaterial color="#fafafa" emissive="#fafafa" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
        <SimLabel3D position={[0, 13.4, 0]} variant="muted" distanceFactor={38}>
          مقياس pH ‎0 → 14
        </SimLabel3D>
      </group>

      <SimLabel3D position={[0, 8.4, 0]} variant="accent" distanceFactor={38}>
        pH = {stats.ph.toFixed(2)} — {stats.classification}
      </SimLabel3D>
      <SimLabel3D position={[0, 7.2, 0]} variant="muted" distanceFactor={38}>
        [H⁺] = {stats.h.toExponential(2)} M — [OH⁻] = {stats.oh.toExponential(2)} M
      </SimLabel3D>
      <SimLabel3D position={[0, 6.1, 0]} variant="muted" distanceFactor={38}>
        {acidic ? 'أيونات H⁺ (برتقالي) هي الغالبة' : 'أيونات OH⁻ (أزرق) هي الغالبة'} — التأيّن {stats.ionisation.toFixed(2)}%
      </SimLabel3D>
    </group>
  );
};

/** Mode 2 — burette titration into a conical flask with a stirrer and live colour change. */
const TitrationScene = ({ params, stats, playing, timeScale, resetKey }: Sub) => {
  const drop = useRef<THREE.Mesh>(null);
  const stirrer = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const last = useRef(resetKey);
  const indicator = findIndicator(params.indicatorId);

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale;
    if (drop.current) {
      const u = (t.current * 1.6) % 1;
      drop.current.position.y = 11.6 - u * 6.4;
      drop.current.visible = params.addedVolume > 0;
    }
    if (stirrer.current) stirrer.current.rotation.y = t.current * 6;
  });

  const buretteFill = Math.max(0.05, 1 - params.addedVolume / Math.max(params.acidVolume * 1.6, 1));
  const flaskFill = Math.min(0.85, 0.5 + params.addedVolume / Math.max(params.acidVolume * 4, 1));

  return (
    <group>
      <SimStage size={44} ruler={false} />

      {/* Stand */}
      <mesh position={[-4.4, 6, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 12, 14]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-4.4, 0.15, 0]}>
        <boxGeometry args={[4, 0.3, 3]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>
      <mesh position={[-2.2, 11.6, 0]}>
        <boxGeometry args={[4.6, 0.28, 0.5]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.45} />
      </mesh>

      {/* Burette */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 12, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 8, 26, 1, true]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            transparent
            opacity={0.2}
            transmission={0.9}
            roughness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 8.1 + (8 * buretteFill) / 2, 0]}>
          <cylinderGeometry args={[0.47, 0.47, 8 * buretteFill, 26]} />
          <meshPhysicalMaterial color="#60a5fa" transparent opacity={0.6} transmission={0.4} />
        </mesh>
        <mesh position={[0, 7.7, 0]}>
          <coneGeometry args={[0.55, 0.9, 20]} />
          <meshPhysicalMaterial color="#e2e8f0" transparent opacity={0.28} transmission={0.85} />
        </mesh>
        <mesh position={[0, 7, 0]}>
          <boxGeometry args={[1.1, 0.35, 0.35]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} />
        </mesh>
        <SimLabel3D position={[2.4, 15, 0]} distanceFactor={40}>
          سحّاحة {findBase(params.baseId).formula} — {params.baseConc.toFixed(2)} M
        </SimLabel3D>
      </group>

      {/* Falling drop */}
      <mesh ref={drop} position={[0, 11.6, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* Conical flask */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 2.4, 0]}>
          <coneGeometry args={[3.2, 4.8, 40, 1, true]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            transparent
            opacity={0.16}
            transmission={0.9}
            roughness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 5.6, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 1.8, 24, 1, true]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            transparent
            opacity={0.2}
            transmission={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Liquid inside the cone */}
        <mesh position={[0, (4.8 * flaskFill) / 2 + 0.08, 0]}>
          <coneGeometry args={[3.1 * flaskFill + 0.35, 4.8 * flaskFill, 40]} />
          <meshPhysicalMaterial
            color={stats.indicatorColor}
            transparent
            opacity={0.72}
            transmission={0.28}
            roughness={0.2}
            emissive={stats.indicatorTurned ? stats.indicatorColor : '#000000'}
            emissiveIntensity={stats.indicatorTurned ? 0.35 : 0}
          />
        </mesh>
        <mesh ref={stirrer} position={[0, 0.35, 0]}>
          <boxGeometry args={[1.4, 0.2, 0.3]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>
      </group>

      {/* Stirrer plate */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[4, 4, 0.3, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      <SimLabel3D position={[6.4, 6.4, 0]} variant="accent" distanceFactor={40}>
        pH = {stats.ph.toFixed(2)}
      </SimLabel3D>
      <SimLabel3D position={[6.4, 5.3, 0]} variant="muted" distanceFactor={40}>
        المضاف {params.addedVolume.toFixed(2)} mL من {stats.equivalenceVolume.toFixed(2)} mL
      </SimLabel3D>
      <SimLabel3D position={[6.4, 4.2, 0]} variant="muted" distanceFactor={40}>
        الكاشف: {indicator.name} — {stats.indicatorTurned ? 'تغيّر اللون' : 'لم يتغيّر بعد'}
      </SimLabel3D>
      <SimLabel3D
        position={[0, 9.2, 0]}
        variant={Math.abs(stats.fraction - 1) < 0.02 ? 'accent' : 'muted'}
        distanceFactor={40}
      >
        {Math.abs(stats.fraction - 1) < 0.02
          ? 'نقطة التكافؤ! مولات الحمض = مولات القاعدة'
          : stats.fraction < 1
          ? `قبل التكافؤ — ${(stats.fraction * 100).toFixed(0)}%`
          : `بعد التكافؤ — فائض قاعدي`}
      </SimLabel3D>
    </group>
  );
};

/** Mode 3 — buffer vs pure water: two beakers stressed with the same added base. */
const BufferScene = ({ params, stats, playing, timeScale }: Sub) => {
  const bar = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const acid = findAcid(params.acidId);
  const pka = -Math.log10(acid.ka);

  const plainPh =
    params.bufferStress >= 0
      ? Math.min(14, 14 + Math.log10(Math.max(params.bufferStress / 1000, 1e-9)))
      : Math.max(0, -Math.log10(Math.max(-params.bufferStress / 1000, 1e-9)));

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale;
    if (bar.current) bar.current.rotation.y = t.current * 0.6;
  });

  return (
    <group>
      <SimStage size={44} ruler={false} />

      <Beaker position={[-5, 0, 0]} radius={2.8} color={stats.colorHex} fill={0.7} label="محلول منظّم" />
      <Beaker position={[5, 0, 0]} radius={2.8} color={phColor(plainPh)} fill={0.7} label="ماء نقي (غير منظّم)" />

      {/* Ratio pillars: HA vs A⁻ */}
      <group position={[0, 0, -6]}>
        <mesh position={[-1.2, Math.max(params.bufferAcid, 0.02) * 6, 0]}>
          <boxGeometry args={[1.4, Math.max(params.bufferAcid, 0.02) * 12, 1.4]} />
          <meshStandardMaterial color="#f97316" roughness={0.4} />
        </mesh>
        <SimLabel3D position={[-1.2, Math.max(params.bufferAcid, 0.02) * 12 + 0.9, 0]} distanceFactor={38}>
          [HA] {params.bufferAcid.toFixed(2)} M
        </SimLabel3D>
        <mesh position={[1.2, Math.max(params.bufferSalt, 0.02) * 6, 0]}>
          <boxGeometry args={[1.4, Math.max(params.bufferSalt, 0.02) * 12, 1.4]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.4} />
        </mesh>
        <SimLabel3D position={[1.2, Math.max(params.bufferSalt, 0.02) * 12 + 0.9, 0]} distanceFactor={38}>
          [A⁻] {params.bufferSalt.toFixed(2)} M
        </SimLabel3D>
      </group>

      {/* Rotating pKa marker */}
      <mesh ref={bar} position={[0, 6.6, 0]}>
        <torusGeometry args={[1.5, 0.12, 12, 40]} />
        <meshStandardMaterial color="#a3e635" emissive="#65a30d" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>

      <SimLabel3D position={[-5, 7.4, 0]} variant="accent" distanceFactor={40}>
        pH = {stats.ph.toFixed(2)} (Δ {stats.bufferShift >= 0 ? '+' : ''}
        {stats.bufferShift.toFixed(2)})
      </SimLabel3D>
      <SimLabel3D position={[5, 7.4, 0]} variant="muted" distanceFactor={40}>
        pH = {plainPh.toFixed(2)}
      </SimLabel3D>
      <SimLabel3D position={[0, 9.4, 0]} variant="accent" distanceFactor={42}>
        pKa = {pka.toFixed(2)} — السعة التنظيمية {stats.bufferCapacity.toFixed(3)} mol/L
      </SimLabel3D>
      <SimLabel3D position={[0, 8.3, 0]} variant="muted" distanceFactor={42}>
        pH = pKa + log([A⁻]/[HA])
      </SimLabel3D>
    </group>
  );
};

export const AcidsScene3D = (props: AcidsScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls view={view} autoRotate={autoRotate} target={[0, 4, 0]} maxDistance={90} />
      <directionalLight position={[12, 20, 14]} intensity={1.1} castShadow={settings.shadows} shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-12, 10, -8]} intensity={0.4} />
      <ambientLight intensity={0.55} />
      {mode === 'ph' && <PhScene {...props} />}
      {mode === 'titration' && <TitrationScene {...props} />}
      {mode === 'buffer' && <BufferScene {...props} />}
    </>
  );
};

export default AcidsScene3D;
