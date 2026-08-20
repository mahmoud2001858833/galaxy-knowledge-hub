import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { OpticsMode, OpticsParams, OpticsStats } from '@/lib/sim-physics/optics';

interface OpticsScene3DProps {
  mode: OpticsMode;
  params: OpticsParams;
  stats: OpticsStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const S = 0.12; // world units per cm

/** Arrow-shaped object / image on the optical axis. */
const ArrowObject = ({
  x,
  height,
  color,
  label,
  dashed = false,
}: {
  x: number;
  height: number;
  color: string;
  label: string;
  dashed?: boolean;
}) => {
  const h = height * S;
  const up = h >= 0;
  return (
    <group position={[x, 0, 0]}>
      <Line
        points={[
          [0, 0, 0],
          [0, h, 0],
        ]}
        color={color}
        lineWidth={4}
        dashed={dashed}
        dashSize={0.25}
        gapSize={0.2}
      />
      <mesh position={[0, h + (up ? 0.18 : -0.18), 0]} rotation={[0, 0, up ? 0 : Math.PI]}>
        <coneGeometry args={[0.16, 0.36, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
      <SimLabel3D position={[0, h + (up ? 0.9 : -0.9), 0]} variant="muted" distanceFactor={20}>
        {label}
      </SimLabel3D>
    </group>
  );
};

/** Thin lens or spherical mirror with principal-ray tracing. */
const ImagingScene = ({
  mode,
  params,
  stats,
  playing,
  timeScale,
}: Pick<OpticsScene3DProps, 'mode' | 'params' | 'stats' | 'playing' | 'timeScale'>) => {
  const { settings } = useSimQuality();
  const glow = useRef<THREE.PointLight>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    if (playing) t.current += delta * timeScale;
    if (glow.current) glow.current.intensity = 1.2 + Math.sin(t.current * 3) * 0.4;
  });

  const f = params.focalLength;
  const dO = params.objectDistance;
  const di = Number.isFinite(stats.imageDistance) ? stats.imageDistance : 0;
  const converging = f > 0;

  // object on -X side, image on +X for a real image
  const xO = -dO * S;
  const xI = (mode === 'mirror' ? -di : di) * S;
  const hO = params.objectHeight * S;
  const hI = stats.imageHeight * S;

  const rays = useMemo(() => {
    const list: { pts: [number, number, number][]; color: string }[] = [];
    if (!Number.isFinite(di)) return list;
    const imgX = xI;
    const imgY = hI;
    // ray 1: parallel to axis then through focus
    list.push({
      pts: [
        [xO, hO, 0],
        [0, hO, 0],
        [imgX, imgY, 0],
      ],
      color: '#f97316',
    });
    // ray 2: through the optical centre / vertex
    list.push({
      pts: [
        [xO, hO, 0],
        [0, 0, 0],
        [imgX, imgY, 0],
      ],
      color: '#22c55e',
    });
    // ray 3: through the near focus then parallel
    list.push({
      pts: [
        [xO, hO, 0],
        [0, -hO * 0.6, 0],
        [imgX, imgY, 0],
      ],
      color: '#a855f7',
    });
    return list;
  }, [xO, hO, xI, hI, di]);

  return (
    <group position={[0, 3, 0]}>
      {/* optical axis */}
      <Line
        points={[
          [-14, 0, 0],
          [14, 0, 0],
        ]}
        color="#64748b"
        lineWidth={1.5}
        dashed
        dashSize={0.4}
        gapSize={0.3}
      />

      {/* optic body */}
      {mode === 'lens' ? (
        <mesh scale={[converging ? 0.35 : 0.16, 1, 1]}>
          <sphereGeometry args={[2.4, settings.segments, settings.segments]} />
          <meshPhysicalMaterial
            color="#7dd3fc"
            transmission={0.85}
            thickness={1.2}
            roughness={0.05}
            metalness={0}
            transparent
            opacity={0.55}
          />
        </mesh>
      ) : (
        <Cylinder args={[2.4, 2.4, 0.2, 40]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.08} />
        </Cylinder>
      )}
      <SimLabel3D position={[0, 3, 0]} variant="accent" distanceFactor={24}>
        {mode === 'lens'
          ? converging
            ? 'عدسة محدبة (مجمِّعة)'
            : 'عدسة مقعرة (مفرِّقة)'
          : converging
          ? 'مرآة مقعّرة'
          : 'مرآة محدّبة'}
      </SimLabel3D>

      {/* focal points */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * Math.abs(f) * S, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#facc15" emissive="#eab308" emissiveIntensity={0.7} />
          </mesh>
          <SimLabel3D position={[0, -0.8, 0]} variant="muted" distanceFactor={20}>
            F {Math.abs(f).toFixed(0)} سم
          </SimLabel3D>
        </group>
      ))}

      {rays.map((r, i) => (
        <Line key={i} points={r.pts} color={r.color} lineWidth={2} transparent opacity={0.9} />
      ))}

      <ArrowObject x={xO} height={params.objectHeight} color="#38bdf8" label={`الجسم ${params.objectDistance.toFixed(0)} سم`} />
      {Number.isFinite(di) && (
        <ArrowObject
          x={xI}
          height={stats.imageHeight}
          color={stats.real ? '#f43f5e' : '#94a3b8'}
          dashed={!stats.real}
          label={`${stats.real ? 'صورة حقيقية' : 'صورة وهمية'} ×${Math.abs(stats.magnification).toFixed(2)}`}
        />
      )}

      <pointLight ref={glow} position={[xO, hO, 1]} color="#38bdf8" distance={10} />
    </group>
  );
};

/** Refraction at a flat interface + prism dispersion. */
const RefractionScene = ({
  params,
  stats,
  playing,
  timeScale,
}: Pick<OpticsScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale'>) => {
  const pulse = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const L = 8;
  const ang = (params.incidenceAngle * Math.PI) / 180;

  const incident: [number, number, number][] = [
    [-Math.sin(ang) * L, Math.cos(ang) * L, 0],
    [0, 0, 0],
  ];
  const reflected: [number, number, number][] = [
    [0, 0, 0],
    [Math.sin(ang) * L, Math.cos(ang) * L, 0],
  ];
  const rAng = stats.totalInternalReflection ? 0 : (stats.refractionAngle * Math.PI) / 180;
  const refracted: [number, number, number][] = [
    [0, 0, 0],
    [Math.sin(rAng) * L, -Math.cos(rAng) * L, 0],
  ];

  useFrame((_, delta) => {
    if (playing) t.current = (t.current + delta * timeScale * 0.4) % 1;
    if (pulse.current) {
      const a = t.current;
      pulse.current.position.set(
        -Math.sin(ang) * L * (1 - a),
        Math.cos(ang) * L * (1 - a),
        0
      );
    }
  });

  const spectrum = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#6366f1', '#a855f7'];

  return (
    <group position={[0, 5, 0]}>
      {/* media */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[18, 9, 6]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.06} />
      </mesh>
      <mesh position={[0, -4.5, 0]}>
        <boxGeometry args={[18, 9, 6]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.16} />
      </mesh>
      <Line points={[[-9, 0, 0], [9, 0, 0]]} color="#e2e8f0" lineWidth={2} />
      <Line points={[[0, -6, 0], [0, 6, 0]]} color="#64748b" lineWidth={1} dashed dashSize={0.3} gapSize={0.25} />

      <Line points={incident} color="#facc15" lineWidth={3} />
      <Line points={reflected} color="#f97316" lineWidth={2} transparent opacity={0.6} />
      {!stats.totalInternalReflection && <Line points={refracted} color="#38bdf8" lineWidth={3} />}

      {stats.totalInternalReflection && (
        <SimLabel3D position={[4, 2.6, 0]} variant="accent" distanceFactor={26}>
          انعكاس كلي داخلي — الزاوية الحرجة {stats.criticalAngle.toFixed(1)}°
        </SimLabel3D>
      )}

      <mesh ref={pulse}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={1} />
      </mesh>

      <SimLabel3D position={[-5.5, 5.5, 0]} variant="muted" distanceFactor={28}>
        n₁ = {params.n1.toFixed(2)} — زاوية السقوط {params.incidenceAngle.toFixed(0)}°
      </SimLabel3D>
      <SimLabel3D position={[5.5, -5.5, 0]} variant="muted" distanceFactor={28}>
        n₂ = {params.n2.toFixed(2)}
        {stats.totalInternalReflection ? '' : ` — الانكسار ${stats.refractionAngle.toFixed(1)}°`}
      </SimLabel3D>

      {/* prism + dispersion */}
      <group position={[-6.5, -3.5, -4]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.6, 1.6, 1.4, 3]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transmission={0.9}
            thickness={1.5}
            roughness={0.03}
            transparent
            opacity={0.6}
          />
        </mesh>
        <Line points={[[-4, 0, 0], [-1.4, 0, 0]]} color="#f8fafc" lineWidth={3} />
        {spectrum.map((c, i) => (
          <Line
            key={c}
            points={[
              [1.4, 0, 0],
              [6, -0.5 - i * 0.28, 0],
            ]}
            color={c}
            lineWidth={2.5}
          />
        ))}
        <SimLabel3D position={[0, 2.4, 0]} distanceFactor={26}>
          منشور — انحراف {stats.deviation.toFixed(1)}° وتشتت {stats.dispersion.toFixed(2)}°
        </SimLabel3D>
      </group>
    </group>
  );
};

export const OpticsScene3D = (props: OpticsScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls
        view={view}
        autoRotate={autoRotate}
        scale={1}
        target={[0, mode === 'refraction' ? 4 : 3, 0]}
        maxDistance={80}
      />
      <directionalLight
        position={[10, 18, 12]}
        intensity={1.2}
        castShadow={settings.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.5} />
      <SimStage size={44} showAxes={false} showGrid={mode !== 'refraction'} />
      {mode === 'refraction' ? <RefractionScene {...props} /> : <ImagingScene {...props} />}
    </>
  );
};

export default OpticsScene3D;
