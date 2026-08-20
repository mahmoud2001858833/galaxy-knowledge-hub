import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { AstronomyMode, AstronomyParams, AstronomyStats } from '@/lib/sim-physics/astronomy';

interface AstronomyScene3DProps {
  mode: AstronomyMode;
  params: AstronomyParams;
  stats: AstronomyStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

type Sub = Pick<AstronomyScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors' | 'resetKey'>;

const SCALE = 6; // scene units per AU (visual)

/** Solve Kepler's equation M = E - e sinE by Newton iteration. */
const eccentricAnomaly = (M: number, e: number) => {
  let E = M;
  for (let i = 0; i < 6; i += 1) {
    E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
};

/** Elliptical orbit with Kepler's 2nd law: equal areas swept in equal times. */
const OrbitScene = ({ params, stats, playing, timeScale, showVectors, resetKey }: Sub) => {
  const planet = useRef<THREE.Mesh>(null);
  const sweep = useRef<THREE.Mesh>(null);
  const radius = useRef<THREE.Group>(null);
  const t = useRef(0);
  const last = useRef(resetKey);

  const a = Math.min(params.semiMajorAu, 5) * SCALE;
  const e = params.eccentricity;
  const b = a * Math.sqrt(1 - e * e);
  const c = a * e;

  const ellipse = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 180; i += 1) {
      const th = (i / 180) * Math.PI * 2;
      pts.push([Math.cos(th) * a - c, 0.02, Math.sin(th) * b]);
    }
    return pts;
  }, [a, b, c]);

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale * 0.35 * Math.sqrt(1 / Math.max(params.semiMajorAu, 0.1));

    const M = t.current % (Math.PI * 2);
    const E = eccentricAnomaly(M, e);
    const x = a * Math.cos(E) - c;
    const z = b * Math.sin(E);

    if (planet.current) {
      planet.current.position.set(x, 0.9, z);
      planet.current.rotation.y += delta * 1.2;
    }
    if (radius.current) {
      const len = Math.hypot(x, z);
      radius.current.position.set(x / 2, 0.4, z / 2);
      radius.current.rotation.y = -Math.atan2(z, x);
      radius.current.scale.set(len || 0.001, 1, 1);
    }
    if (sweep.current) {
      sweep.current.rotation.y = -Math.atan2(z, x);
      const len = Math.hypot(x, z);
      sweep.current.scale.setScalar(len / 6);
    }
  });

  return (
    <group>
      <SimStage size={Math.max(40, a * 3)} ruler={false} />

      {/* Star at the focus */}
      <Sphere args={[1.5 * Math.cbrt(params.starMasses), 32, 32]} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.6} toneMapped={false} />
      </Sphere>
      <pointLight position={[0, 1.2, 0]} intensity={5} color="#fdba74" distance={a * 6 + 40} />

      <Line points={ellipse} color="#38bdf8" lineWidth={2} />

      {/* swept area wedge */}
      <mesh ref={sweep} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6, 32, 0, 0.35]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>

      {showVectors && (
        <group ref={radius}>
          <mesh>
            <boxGeometry args={[1, 0.08, 0.08]} />
            <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={0.6} />
          </mesh>
        </group>
      )}

      <Sphere ref={planet} args={[0.8, 28, 28]}>
        <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={0.3} roughness={0.5} />
      </Sphere>

      <SimLabel3D position={[0, a * 0.55 + 6, 0]} variant="accent" distanceFactor={40}>
        الدور = {stats.periodYears.toFixed(3)} سنة — a = {params.semiMajorAu.toFixed(2)} AU، e = {e.toFixed(2)}
      </SimLabel3D>
      <SimLabel3D position={[0, a * 0.55 + 4.4, 0]} variant="muted" distanceFactor={40}>
        الحضيض {(stats.perihelionSpeed / 1000).toFixed(2)} كم/ث — الأوج {(stats.aphelionSpeed / 1000).toFixed(2)} كم/ث
      </SimLabel3D>
    </group>
  );
};

/** Lunar phases: sunlight from one side, moon orbits earth, terminator visible. */
const PhaseScene = ({ params, stats, playing, timeScale, resetKey }: Sub) => {
  const moon = useRef<THREE.Group>(null);
  const t = useRef(0);
  const last = useRef(resetKey);
  const R = 9;

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale * 0.4;
    const ang = ((params.phaseDeg * Math.PI) / 180 + t.current) % (Math.PI * 2);
    if (moon.current) {
      moon.current.position.set(Math.sin(ang) * R, 4 + Math.sin(ang) * 0, -Math.cos(ang) * R);
    }
  });

  return (
    <group>
      <SimStage size={44} ruler={false} />

      {/* Sunlight direction (from -Z) */}
      <directionalLight position={[0, 6, -40]} intensity={2.4} color="#fff7ed" />
      <Sphere args={[2.2, 32, 32]} position={[0, 4, -22]}>
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.8} toneMapped={false} />
      </Sphere>
      <SimLabel3D position={[0, 7.6, -22]} variant="muted" distanceFactor={38}>
        الشمس
      </SimLabel3D>

      {/* Earth */}
      <Sphere args={[2.4, 40, 40]} position={[0, 4, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#2563eb" roughness={0.65} metalness={0.05} />
      </Sphere>
      <SimLabel3D position={[0, 7.6, 0]} distanceFactor={38}>
        الأرض
      </SimLabel3D>

      {/* Moon orbit ring */}
      <Line
        points={Array.from({ length: 121 }, (_, i) => {
          const th = (i / 120) * Math.PI * 2;
          return [Math.sin(th) * R, 4, -Math.cos(th) * R] as [number, number, number];
        })}
        color="#94a3b8"
        lineWidth={1.5}
        dashed
        dashSize={0.5}
        gapSize={0.35}
      />

      <group ref={moon}>
        <Sphere args={[0.9, 32, 32]} castShadow>
          <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
        </Sphere>
      </group>

      <SimLabel3D position={[0, 13, 0]} variant="accent" distanceFactor={40}>
        {stats.phaseName} — الجزء المضيء {(stats.illuminatedFraction * 100).toFixed(1)}%
      </SimLabel3D>
    </group>
  );
};

/** Eclipse geometry: shadow cones between sun, moon and earth. */
const EclipseScene = ({ params, stats, playing, timeScale, resetKey }: Sub) => {
  const { settings } = useSimQuality();
  const moon = useRef<THREE.Group>(null);
  const cone = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const last = useRef(resetKey);

  const solar = stats.eclipseType.includes('كسوف');
  const dist = 9 * params.moonDistanceFactor;
  const tilt = (params.inclinationDeg * Math.PI) / 180;

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale * 0.5;
    const drift = Math.sin(t.current) * 1.2;
    if (moon.current) {
      const z = solar ? -dist : dist;
      moon.current.position.set(drift * (stats.eclipsePossible ? 0.15 : 1), 4 + Math.tan(tilt) * dist, z);
    }
    if (cone.current) {
      cone.current.visible = true;
      const mat = cone.current.material as THREE.MeshBasicMaterial;
      mat.opacity = stats.eclipsePossible ? 0.4 : 0.18;
    }
  });

  return (
    <group>
      <SimStage size={48} ruler={false} />
      <directionalLight position={[0, 6, -40]} intensity={2.2} color="#fff7ed" castShadow={settings.shadows} />

      <Sphere args={[2.6, 32, 32]} position={[0, 4, -26]}>
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.8} toneMapped={false} />
      </Sphere>

      <Sphere args={[2.4, 40, 40]} position={[0, 4, 0]} receiveShadow>
        <meshStandardMaterial color="#1d4ed8" roughness={0.7} />
      </Sphere>

      <group ref={moon}>
        <Sphere args={[0.95, 32, 32]} castShadow>
          <meshStandardMaterial color="#cbd5e1" roughness={0.95} />
        </Sphere>
        {/* Umbra cone extending away from the sun */}
        <mesh ref={cone} position={[0, 0, 5]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.95, 10, 24, 1, true]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <SimLabel3D position={[0, 13.4, 0]} variant={stats.eclipsePossible ? 'accent' : 'muted'} distanceFactor={42}>
        {stats.eclipseType}
      </SimLabel3D>
      <SimLabel3D position={[0, 11.8, 0]} variant="muted" distanceFactor={42}>
        قطر القمر الزاوي {stats.angularDiameterMoon.toFixed(3)}° مقابل الشمس {stats.angularDiameterSun.toFixed(3)}°
      </SimLabel3D>
      <SimLabel3D position={[0, 10.2, 0]} variant="muted" distanceFactor={42}>
        الميل المداري {params.inclinationDeg.toFixed(2)}° — زاوية الطور {params.phaseDeg.toFixed(0)}°
      </SimLabel3D>
    </group>
  );
};

export const AstronomyScene3D = (props: AstronomyScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls view={view} autoRotate={autoRotate} target={[0, 4, 0]} maxDistance={120} />
      <directionalLight position={[16, 24, 18]} intensity={0.6} castShadow={settings.shadows} shadow-mapSize={[1024, 1024]} />
      <ambientLight intensity={0.35} />
      {mode === 'orbits' && <OrbitScene {...props} />}
      {mode === 'phases' && <PhaseScene {...props} />}
      {mode === 'eclipse' && <EclipseScene {...props} />}
    </>
  );
};

export default AstronomyScene3D;
