import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import {
  FlightSample,
  RocketMode,
  RocketParams,
  RocketStats,
  R_EARTH,
} from '@/lib/sim-physics/rocket';

interface RocketScene3DProps {
  mode: RocketMode;
  params: RocketParams;
  stats: RocketStats;
  flight: FlightSample[];
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

/** Simple reusable rocket body. */
const RocketBody = ({
  scale = 1,
  flame = 0,
  legs = false,
}: {
  scale?: number;
  flame?: number;
  legs?: boolean;
}) => {
  const { settings } = useSimQuality();
  return (
    <group scale={scale}>
      <mesh position={[0, 0.9, 0]} castShadow={settings.shadows}>
        <cylinderGeometry args={[0.22, 0.22, 1.8, 20]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.05, 0]} castShadow={settings.shadows}>
        <coneGeometry args={[0.22, 0.5, 20]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.4} roughness={0.35} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 3) * Math.PI * 2) * 0.28,
            0.18,
            Math.sin((i / 3) * Math.PI * 2) * 0.28,
          ]}
          rotation={[0, -(i / 3) * Math.PI * 2, 0]}
        >
          <boxGeometry args={[0.05, 0.45, 0.3]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
      ))}
      {legs && (
        <group>
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 4) * Math.PI * 2) * 0.34,
                0.12,
                Math.sin((i / 4) * Math.PI * 2) * 0.34,
              ]}
              rotation={[Math.PI / 7, -(i / 4) * Math.PI * 2, 0]}
            >
              <boxGeometry args={[0.06, 0.55, 0.06]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </group>
      )}
      {flame > 0.02 && (
        <group position={[0, -0.1, 0]}>
          <mesh position={[0, -flame * 0.6, 0]}>
            <coneGeometry args={[0.18, flame * 1.4, 16, 1, true]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -flame * 0.35, 0]}>
            <coneGeometry args={[0.1, flame * 0.8, 16, 1, true]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          <pointLight color="#fb923c" intensity={flame * 6} distance={6} />
        </group>
      )}
    </group>
  );
};

/** Powered ascent along the integrated trajectory. */
const LaunchScene = ({
  flight,
  params,
  playing,
  timeScale,
  showVectors,
  resetKey,
}: Pick<RocketScene3DProps, 'flight' | 'params' | 'playing' | 'timeScale' | 'showVectors' | 'resetKey'>) => {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  const last = useRef(resetKey);
  const flameRef = useRef(0);

  // world scale: 1 unit ≈ 2 km
  const S = 1 / 2000;
  const path = useMemo(
    () =>
      flight
        .filter((_, i) => i % 3 === 0)
        .map((s) => [s.downrange * S, s.altitude * S, 0] as [number, number, number]),
    [flight]
  );

  const duration = flight.length ? flight[flight.length - 1].t : 1;

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current = (t.current + delta * timeScale * 8) % Math.max(duration, 1);
    const idx = Math.min(
      flight.length - 1,
      Math.max(0, Math.round((t.current / Math.max(duration, 1)) * (flight.length - 1)))
    );
    const s = flight[idx];
    if (!s || !group.current) return;
    const next = flight[Math.min(idx + 1, flight.length - 1)];
    group.current.position.set(s.downrange * S, s.altitude * S, 0);
    const dx = (next.downrange - s.downrange) * S;
    const dy = (next.altitude - s.altitude) * S;
    group.current.rotation.z = -Math.atan2(dx, Math.max(dy, 1e-6));
    flameRef.current = s.t < params.burnTime ? 1 : 0;
  });

  return (
    <group>
      <SimStage size={90} ruler rulerLength={40} rulerStep={10} unitScale={2} rulerUnit="كم" />

      {/* launch pad */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[1.2, 1.4, 0.2, 24]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <SimLabel3D position={[0, 1.4, 0]} variant="muted" distanceFactor={26}>
        منصة الإطلاق
      </SimLabel3D>

      {/* atmosphere layers */}
      {[
        { h: 12000, c: '#38bdf8', n: 'التروبوسفير 12 كم' },
        { h: 50000, c: '#818cf8', n: 'الستراتوسفير 50 كم' },
        { h: 100000, c: '#f472b6', n: 'خط كارمان 100 كم' },
      ].map((l) => (
        <group key={l.h}>
          <Line
            points={[
              [-40, l.h * S, 0],
              [60, l.h * S, 0],
            ]}
            color={l.c}
            lineWidth={1}
            dashed
            dashSize={1.2}
            gapSize={0.8}
          />
          <SimLabel3D position={[-24, l.h * S, 0]} variant="muted" distanceFactor={40}>
            {l.n}
          </SimLabel3D>
        </group>
      ))}

      {path.length > 1 && <Line points={path} color="#f97316" lineWidth={2} transparent opacity={0.7} />}

      <group ref={group}>
        <RocketBody scale={1.1} flame={flameRef.current ? 1.1 : 0} />
        {showVectors && (
          <>
            <Line points={[[0, 0, 0], [0, 2.6, 0]]} color="#22c55e" lineWidth={3} />
            <Line points={[[0, 0, 0], [0, -1.8, 0]]} color="#ef4444" lineWidth={3} />
          </>
        )}
      </group>
    </group>
  );
};

/** Orbital mechanics around a rendered planet. */
const OrbitScene = ({
  params,
  stats,
  playing,
  timeScale,
  showVectors,
}: Pick<RocketScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors'>) => {
  const sat = useRef<THREE.Group>(null);
  const theta = useRef(0);
  const planetR = 5;
  const scale = planetR / R_EARTH;
  const a = (stats.apoapsis + stats.periapsis) / 2;
  const e = (stats.apoapsis - stats.periapsis) / (stats.apoapsis + stats.periapsis);
  const aU = a * scale;
  const bU = aU * Math.sqrt(Math.max(1 - e * e, 0.0001));
  const cU = aU * e;

  const ellipse = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 160; i++) {
      const th = (i / 160) * Math.PI * 2;
      pts.push([Math.cos(th) * aU - cU, 0, Math.sin(th) * bU]);
    }
    return pts;
  }, [aU, bU, cU]);

  useFrame((_, delta) => {
    if (playing) theta.current += delta * timeScale * 0.4;
    if (!sat.current) return;
    const th = theta.current;
    const x = Math.cos(th) * aU - cU;
    const z = Math.sin(th) * bU;
    sat.current.position.set(x, 0, z);
    sat.current.rotation.y = -th;
  });

  return (
    <group>
      <Sphere args={[planetR, 48, 48]}>
        <meshStandardMaterial color="#1d4ed8" roughness={0.85} metalness={0.1} />
      </Sphere>
      <Sphere args={[planetR * 1.03, 32, 32]}>
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.12} side={THREE.BackSide} />
      </Sphere>
      <SimLabel3D position={[0, planetR + 0.8, 0]} variant="accent" distanceFactor={26}>
        الأرض — نصف القطر 6371 كم
      </SimLabel3D>

      <Line points={ellipse} color="#facc15" lineWidth={2} />

      <group ref={sat}>
        <Trail width={2} length={6} color="#f472b6" attenuation={(w) => w}>
          <mesh>
            <boxGeometry args={[0.35, 0.25, 0.25]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.25} />
          </mesh>
        </Trail>
        <mesh position={[0, 0, 0.5]}>
          <boxGeometry args={[0.6, 0.02, 0.35]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#1e40af" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0, -0.5]}>
          <boxGeometry args={[0.6, 0.02, 0.35]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#1e40af" emissiveIntensity={0.4} />
        </mesh>
        {showVectors && <Line points={[[0, 0, 0], [1.4, 0, 0]]} color="#22c55e" lineWidth={3} />}
        <SimLabel3D position={[0, 0.9, 0]} distanceFactor={22}>
          {(stats.orbitSpeed / 1000).toFixed(2)} كم/ث
        </SimLabel3D>
      </group>

      <SimLabel3D position={[aU * 1.05 - cU, 0, 0]} variant="muted" distanceFactor={30}>
        الحضيض {(params.altitude).toFixed(0)} كم
      </SimLabel3D>
      <SimLabel3D position={[-aU - cU - 0.6, 0, 0]} variant="muted" distanceFactor={30}>
        الأوج {((stats.apoapsis - R_EARTH) / 1000).toFixed(0)} كم
      </SimLabel3D>
    </group>
  );
};

/** Retro-propulsive landing with a suicide-burn marker. */
const LandingScene = ({
  params,
  stats,
  playing,
  timeScale,
  showVectors,
  resetKey,
}: Pick<RocketScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors' | 'resetKey'>) => {
  const group = useRef<THREE.Group>(null);
  const h = useRef(params.landAltitude);
  const v = useRef(params.landSpeed);
  const last = useRef(resetKey);
  const flame = useRef(0);
  const S = 12 / Math.max(params.landAltitude, 1); // world units per metre

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      h.current = params.landAltitude;
      v.current = params.landSpeed;
    }
    if (playing) {
      const dt = Math.min(delta, 0.05) * timeScale * 2;
      const burning = h.current <= stats.suicideBurnAlt;
      const acc = burning ? stats.landingDecel : -9.80665;
      v.current = Math.max(v.current - acc * dt * -1 * -1 + (burning ? 0 : 0), 0);
      // v decreases while burning, increases while free-falling
      v.current = burning
        ? Math.max(v.current - stats.landingDecel * dt, 0)
        : v.current + 9.80665 * dt;
      h.current -= v.current * dt;
      flame.current = burning ? 1 : 0;
      if (h.current <= 0) {
        h.current = params.landAltitude;
        v.current = params.landSpeed;
      }
    }
    if (group.current) group.current.position.y = Math.max(h.current, 0) * S + 0.4;
  });

  return (
    <group>
      <SimStage size={40} showAxes={false} />
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.6, 0.16, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <torusGeometry args={[1.6, 0.05, 8, 48]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.6} />
      </mesh>
      <SimLabel3D position={[3.2, 0.6, 0]} variant="muted" distanceFactor={22}>
        منصّة الهبوط
      </SimLabel3D>

      <Line
        points={[
          [-6, stats.suicideBurnAlt * S + 0.4, 0],
          [6, stats.suicideBurnAlt * S + 0.4, 0],
        ]}
        color="#f43f5e"
        lineWidth={2}
        dashed
        dashSize={0.5}
        gapSize={0.35}
      />
      <SimLabel3D position={[-4.5, stats.suicideBurnAlt * S + 0.9, 0]} variant="accent" distanceFactor={24}>
        بدء حرق التوقف {stats.suicideBurnAlt.toFixed(0)} م
      </SimLabel3D>

      <group ref={group}>
        <RocketBody scale={1.3} flame={flame.current ? 1.3 : 0} legs />
        {showVectors && (
          <>
            <Line points={[[0, 0, 0], [0, -2, 0]]} color="#ef4444" lineWidth={3} />
            {flame.current > 0 && <Line points={[[0, 0, 0], [0, 2.4, 0]]} color="#22c55e" lineWidth={3} />}
          </>
        )}
      </group>
    </group>
  );
};

export const RocketScene3D = (props: RocketScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls
        view={view}
        autoRotate={autoRotate}
        scale={mode === 'launch' ? 2.2 : 1.2}
        target={mode === 'launch' ? [8, 14, 0] : [0, 2, 0]}
        maxDistance={160}
      />
      <directionalLight
        position={[12, 20, 10]}
        intensity={1.4}
        castShadow={settings.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.4} />
      {mode === 'launch' && <LaunchScene {...props} />}
      {mode === 'orbit' && <OrbitScene {...props} />}
      {mode === 'landing' && <LandingScene {...props} />}
    </>
  );
};

export default RocketScene3D;
