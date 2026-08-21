import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import {
  AnalyticalMode,
  ChromatoParams,
  SpectroParams,
  SpectroStats,
  TitrationParams,
  TitrationStats,
  computeChromato,
} from '@/lib/sim-physics/analytical';

interface AnalyticalScene3DProps {
  mode: AnalyticalMode;
  titration: TitrationParams;
  titrationStats: TitrationStats;
  spectro: SpectroParams;
  spectroStats: SpectroStats;
  chromato: ChromatoParams;
  playing: boolean;
  timeScale: number;
  showParticles: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

/** Wavelength (nm) → approximate visible colour. */
const wavelengthColor = (nm: number): string => {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm < 380) {
    r = 0.4;
    b = 0.6;
  } else if (nm < 440) {
    r = (440 - nm) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = (510 - nm) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = (645 - nm) / 65;
  } else if (nm <= 780) {
    r = 1;
  } else {
    r = 0.7;
  }
  const to = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
};

/* --------------- titration mode --------------- */

const TitrationScene = ({
  params,
  stats,
  playing,
  timeScale,
  showParticles,
  resetKey,
}: {
  params: TitrationParams;
  stats: TitrationStats;
  playing: boolean;
  timeScale: number;
  showParticles: boolean;
  resetKey: number;
}) => {
  const drop = useRef<THREE.Mesh>(null);
  const stirrer = useRef<THREE.Mesh>(null);
  const needle = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const last = useRef(resetKey);
  const { settings } = useSimQuality();

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale;
    if (drop.current) {
      const u = (t.current * 1.5) % 1;
      drop.current.position.y = 11.4 - u * 6.2;
      drop.current.visible = params.vb > 0;
    }
    if (stirrer.current) stirrer.current.rotation.y = t.current * 7;
    if (needle.current) {
      const target = -Math.PI / 2 + (stats.ph / 14) * Math.PI;
      needle.current.rotation.z += (target - needle.current.rotation.z) * Math.min(1, delta * 4);
    }
  });

  const buretteFill = Math.max(0.04, 1 - params.vb / Math.max(stats.veq * 2, 1));
  const flaskFill = Math.min(0.88, 0.48 + params.vb / Math.max(params.va * 4, 1));
  const bubbles = settings.shadows ? 18 : 9;

  return (
    <group>
      <SimStage size={46} ruler={false} />

      {/* Stand */}
      <mesh position={[-4.6, 6, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 12, 14]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-4.6, 0.2, 0]}>
        <boxGeometry args={[4, 0.35, 3]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>
      <mesh position={[-2.4, 11.4, 0]}>
        <boxGeometry args={[4.8, 0.28, 0.5]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.45} />
      </mesh>

      {/* Burette with graduation rings */}
      <group>
        <mesh position={[0, 11.9, 0]}>
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
        <mesh position={[0, 7.95 + (8 * buretteFill) / 2, 0]}>
          <cylinderGeometry args={[0.47, 0.47, 8 * buretteFill, 26]} />
          <meshPhysicalMaterial color="#60a5fa" transparent opacity={0.62} transmission={0.4} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[0, 8.4 + i * 0.85, 0]}>
            <torusGeometry args={[0.56, 0.025, 6, 24]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
        ))}
        <mesh position={[0, 7.6, 0]}>
          <coneGeometry args={[0.55, 0.9, 20]} />
          <meshPhysicalMaterial color="#e2e8f0" transparent opacity={0.28} transmission={0.85} />
        </mesh>
        <mesh position={[0, 6.9, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 1.2, 12]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.4} roughness={0.4} />
        </mesh>
        <SimLabel3D position={[2.6, 15, 0]} distanceFactor={42}>
          سحّاحة NaOH — {params.cb.toFixed(3)} M
        </SimLabel3D>
      </group>

      <mesh ref={drop} position={[0, 11.4, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>

      {/* Conical flask */}
      <group>
        <mesh position={[0, 2.4, 0]}>
          <coneGeometry args={[3.2, 4.8, 40, 1, true]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            transparent
            opacity={0.15}
            transmission={0.9}
            roughness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 5.6, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 1.8, 24, 1, true]} />
          <meshPhysicalMaterial color="#e2e8f0" transparent opacity={0.2} transmission={0.9} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, (4.8 * flaskFill) / 2 + 0.08, 0]}>
          <coneGeometry args={[3.1 * flaskFill + 0.32, 4.8 * flaskFill, 40]} />
          <meshPhysicalMaterial
            color={stats.indicatorColor}
            transparent
            opacity={0.75}
            transmission={0.25}
            roughness={0.2}
            emissive={stats.atEndPoint ? stats.indicatorColor : '#000000'}
            emissiveIntensity={stats.atEndPoint ? 0.45 : 0}
          />
        </mesh>
        <mesh ref={stirrer} position={[0, 0.35, 0]}>
          <boxGeometry args={[1.4, 0.2, 0.3]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>
        {showParticles &&
          Array.from({ length: bubbles }, (_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / bubbles) * Math.PI * 2) * (0.4 + (i % 4) * 0.4),
                0.4 + ((i * 0.37) % (4.8 * flaskFill)),
                Math.sin((i / bubbles) * Math.PI * 2) * (0.4 + (i % 3) * 0.4),
              ]}
            >
              <sphereGeometry args={[0.09, 8, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.35} />
            </mesh>
          ))}
      </group>

      {/* Magnetic stirrer plate */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[4, 4, 0.3, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* pH meter dial */}
      <group position={[8.5, 4.5, 0]}>
        <mesh>
          <cylinderGeometry args={[2.4, 2.4, 0.4, 40]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh ref={needle} position={[0, 0.3, 0]}>
          <boxGeometry args={[0.12, 0.1, 3.6]} />
          <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
        <SimLabel3D position={[0, 3.1, 0]} variant="accent" distanceFactor={40}>
          pH = {stats.ph.toFixed(2)}
        </SimLabel3D>
      </group>

      <SimLabel3D position={[0, 9.4, 0]} variant={stats.atEndPoint ? 'accent' : 'muted'} distanceFactor={42}>
        {stats.atEndPoint
          ? 'نقطة النهاية! مولات القاعدة = مولات الحمض'
          : stats.pastEquivalence
          ? 'تجاوزنا نقطة التكافؤ — فائض قاعدي'
          : `المضاف ${params.vb.toFixed(2)} mL من ${stats.veq.toFixed(2)} mL`}
      </SimLabel3D>
      <SimLabel3D position={[0, 8.3, 0]} variant="muted" distanceFactor={42}>
        العيّنة {stats.analyte.formula} — الكاشف {stats.indicator.name}
      </SimLabel3D>
    </group>
  );
};

/* --------------- spectrophotometry mode --------------- */

const SpectroScene = ({
  params,
  stats,
  playing,
  timeScale,
  showParticles,
}: {
  params: SpectroParams;
  stats: SpectroStats;
  playing: boolean;
  timeScale: number;
  showParticles: boolean;
}) => {
  const photons = useRef<THREE.Group>(null);
  const detector = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const color = wavelengthColor(params.lambda);
  const transmitted = stats.transmittance / 100;

  const seeds = useMemo(
    () => Array.from({ length: 24 }, (_, i) => ({ off: i / 24, y: (i % 3) * 0.3 - 0.3, z: (i % 5) * 0.22 - 0.44 })),
    []
  );

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale;
    photons.current?.children.forEach((child, i) => {
      const s = seeds[i];
      if (!s) return;
      const u = (t.current * 0.55 + s.off) % 1;
      const x = -9 + u * 18;
      child.position.set(x, 3.6 + s.y, s.z);
      const past = x > 0.5;
      const m = child as THREE.Mesh;
      const mat = m.material as THREE.MeshStandardMaterial;
      mat.opacity = past ? Math.max(0.05, transmitted) : 1;
      m.visible = !past || Math.random() < 0.98;
      m.scale.setScalar(past ? 0.6 + transmitted * 0.6 : 1);
    });
    if (detector.current) {
      const mat = detector.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.2 + transmitted * 1.6;
    }
  });

  return (
    <group>
      <SimStage size={46} ruler={false} />

      {/* Light source */}
      <group position={[-10, 3.6, 0]}>
        <mesh>
          <boxGeometry args={[2.4, 2.4, 2.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[1.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.55, 0.35, 0.6, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
        <pointLight position={[1.6, 0, 0]} color={color} intensity={2.4} distance={16} />
        <SimLabel3D position={[0, 2.4, 0]} distanceFactor={40}>
          مصدر ضوئي — λ = {params.lambda.toFixed(0)} nm
        </SimLabel3D>
      </group>

      {/* Monochromator prism */}
      <group position={[-5.6, 3.6, 0]}>
        <mesh rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[1, 1, 1.4, 3]} />
          <meshPhysicalMaterial color="#e2e8f0" transparent opacity={0.35} transmission={0.9} roughness={0.05} />
        </mesh>
        <SimLabel3D position={[0, -1.9, 0]} variant="muted" distanceFactor={40}>
          مُفرِّق الطول الموجي
        </SimLabel3D>
      </group>

      {/* Cuvette */}
      <group position={[0, 3.6, 0]}>
        <mesh>
          <boxGeometry args={[Math.max(params.path * 1.6, 0.6), 3.4, 2]} />
          <meshPhysicalMaterial
            color="#cbd5e1"
            transparent
            opacity={0.18}
            transmission={0.9}
            roughness={0.05}
            thickness={0.4}
          />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[Math.max(params.path * 1.6, 0.6) - 0.12, 2.5, 1.86]} />
          <meshPhysicalMaterial
            color={stats.sample.color}
            transparent
            opacity={Math.min(0.9, 0.2 + stats.absorbance * 0.4)}
            transmission={0.35}
            roughness={0.15}
          />
        </mesh>
        {showParticles &&
          Array.from({ length: 14 }, (_, i) => (
            <mesh
              key={i}
              position={[
                ((i % 5) - 2) * (params.path * 0.3),
                -1.2 + ((i * 0.31) % 2.2),
                ((i % 3) - 1) * 0.55,
              ]}
            >
              <sphereGeometry args={[0.11, 8, 8]} />
              <meshStandardMaterial
                color={stats.sample.color}
                emissive={stats.sample.color}
                emissiveIntensity={0.5}
                toneMapped={false}
              />
            </mesh>
          ))}
        <SimLabel3D position={[0, 2.6, 0]} variant="muted" distanceFactor={40}>
          الخلية b = {params.path.toFixed(2)} cm — c = {params.conc.toExponential(2)} M
        </SimLabel3D>
      </group>

      {/* Photon beam */}
      <group ref={photons}>
        {seeds.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1.2}
              transparent
              opacity={1}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Detector */}
      <group position={[8.6, 3.6, 0]}>
        <mesh ref={detector}>
          <boxGeometry args={[2.2, 2.8, 2.2]} />
          <meshStandardMaterial color="#0f172a" emissive={color} emissiveIntensity={0.4} roughness={0.5} />
        </mesh>
        <SimLabel3D position={[0, 2.6, 0]} variant="accent" distanceFactor={40}>
          A = {stats.absorbance.toFixed(3)} — T = {stats.transmittance.toFixed(1)}%
        </SimLabel3D>
      </group>

      {/* Transmittance bar */}
      <group position={[0, 0.4, -6]}>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[12, 0.5, 0.6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[-6 + (transmitted * 12) / 2, 0.6, 0.35]}>
          <boxGeometry args={[Math.max(transmitted * 12, 0.05), 0.62, 0.2]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
        <SimLabel3D position={[0, 1.6, 0]} variant="muted" distanceFactor={40}>
          A = ε·b·c (قانون بير-لامبرت) — ε = {stats.epsilonAt.toFixed(1)} L/mol·cm
        </SimLabel3D>
      </group>

      <SimLabel3D position={[0, 8.6, 0]} variant={stats.detectionOk ? 'accent' : 'muted'} distanceFactor={44}>
        {stats.detectionOk
          ? 'الامتصاصية ضمن المدى الموثوق (0.1 – 1.0)'
          : stats.absorbance < 0.1
          ? 'الامتصاصية منخفضة جداً — زد التركيز أو طول المسار'
          : 'الامتصاصية مرتفعة — خفّف العيّنة'}
      </SimLabel3D>
    </group>
  );
};

/* --------------- chromatography mode --------------- */

const ChromatoScene = ({
  params,
  playing,
  timeScale,
}: {
  params: ChromatoParams;
  playing: boolean;
  timeScale: number;
}) => {
  const front = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const result = useMemo(() => computeChromato(params), [params]);
  const plateH = 14;
  const scale = plateH / Math.max(params.runLength, 1);

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale;
    if (front.current) front.current.position.y = 1 + result.frontDistance * scale;
  });

  return (
    <group>
      <SimStage size={46} ruler={false} />

      {/* Developing chamber */}
      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[10, 16, 6]} />
        <meshPhysicalMaterial
          color="#cbd5e1"
          transparent
          opacity={0.12}
          transmission={0.9}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Solvent pool */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[9.6, 1.2, 5.6]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.45} transmission={0.5} />
      </mesh>

      {/* TLC plate */}
      <mesh position={[0, 8, 0]}>
        <boxGeometry args={[6, 15, 0.3]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* Baseline */}
      <mesh position={[0, 1, 0.2]}>
        <boxGeometry args={[6, 0.08, 0.05]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <SimLabel3D position={[-4.4, 1, 0]} variant="muted" distanceFactor={44}>
        خط البداية
      </SimLabel3D>

      {/* Solvent front */}
      <mesh ref={front} position={[0, 1, 0.22]}>
        <boxGeometry args={[6, 0.12, 0.06]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.7} toneMapped={false} />
      </mesh>

      {/* Spots */}
      {result.spots.map((s, i) => (
        <group key={s.analyte.id} position={[-2.1 + i * 1.4, 1 + s.distance * scale, 0.3]}>
          <mesh>
            <sphereGeometry args={[0.42, 16, 16]} />
            <meshStandardMaterial
              color={s.analyte.color}
              emissive={s.analyte.color}
              emissiveIntensity={0.55}
              toneMapped={false}
            />
          </mesh>
          <SimLabel3D position={[0, 0.85, 0]} variant="muted" distanceFactor={46}>
            Rf {s.rf.toFixed(2)}
          </SimLabel3D>
        </group>
      ))}

      <SimLabel3D position={[0, 17.6, 0]} variant="accent" distanceFactor={48}>
        Rf = مسافة المادة ÷ مسافة المذيب — الفصل {result.resolution.toFixed(2)} cm
      </SimLabel3D>
      <SimLabel3D position={[0, 16.4, 0]} variant="muted" distanceFactor={48}>
        قطبية المذيب {params.solventPolarity.toFixed(2)} — جبهة المذيب {result.frontDistance.toFixed(2)} cm
      </SimLabel3D>
    </group>
  );
};

export const AnalyticalScene3D = (props: AnalyticalScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls view={view} autoRotate={autoRotate} target={[0, mode === 'chromato' ? 8 : 4, 0]} maxDistance={100} />
      <directionalLight position={[12, 20, 14]} intensity={1.1} castShadow={settings.shadows} shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-12, 10, -8]} intensity={0.4} />
      <ambientLight intensity={0.55} />
      {mode === 'titration' && (
        <TitrationScene
          params={props.titration}
          stats={props.titrationStats}
          playing={props.playing}
          timeScale={props.timeScale}
          showParticles={props.showParticles}
          resetKey={props.resetKey}
        />
      )}
      {mode === 'spectro' && (
        <SpectroScene
          params={props.spectro}
          stats={props.spectroStats}
          playing={props.playing}
          timeScale={props.timeScale}
          showParticles={props.showParticles}
        />
      )}
      {mode === 'chromato' && (
        <ChromatoScene params={props.chromato} playing={props.playing} timeScale={props.timeScale} />
      )}
    </>
  );
};

export default AnalyticalScene3D;
