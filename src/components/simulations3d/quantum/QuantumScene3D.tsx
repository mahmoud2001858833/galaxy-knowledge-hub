import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere, Box, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import {
  QuantumMode,
  QuantumParams,
  QuantumStats,
  interferencePattern,
  wellDensity,
} from '@/lib/sim-physics/quantum';

interface Props {
  mode: QuantumMode;
  params: QuantumParams;
  stats: QuantumStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const SCREEN_X = 9;
const SLIT_X = -1.5;
const SOURCE_X = -9;

/** Electron gun firing wave-packets toward the slits, then dots on the screen. */
const DoubleSlitScene = ({
  params,
  stats,
  playing,
  timeScale,
  showVectors,
  resetKey,
}: Pick<Props, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors' | 'resetKey'>) => {
  const { settings } = useSimQuality();
  const count = settings.shadows ? 90 : 45;
  const hitsRef = useRef<THREE.InstancedMesh>(null);
  const flyRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const state = useRef({ hits: 0, t: 0 });

  const pattern = useMemo(() => interferencePattern(params, 200), [params]);
  const halfSpan = Math.max(...pattern.map((p) => Math.abs(p.y))) || 1;

  // cumulative distribution for sampling landing positions
  const cdf = useMemo(() => {
    const acc: number[] = [];
    let sum = 0;
    for (const p of pattern) {
      sum += p['الشدة'];
      acc.push(sum);
    }
    return acc.map((v) => v / (sum || 1));
  }, [pattern]);

  const sampleY = () => {
    const r = Math.random();
    let lo = 0;
    let hi = cdf.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    return (pattern[lo].y / halfSpan) * 4.5;
  };

  const flyers = useRef(
    Array.from({ length: 26 }, (_, i) => ({
      p: i / 26,
      y: 0,
      z: 0,
      target: 0,
      tz: 0,
    }))
  );

  // reset accumulation when params change
  useMemo(() => {
    state.current.hits = 0;
    if (hitsRef.current) hitsRef.current.count = 0;
  }, [params, resetKey]);

  useFrame((_, delta) => {
    if (!playing) return;
    const dt = Math.min(delta, 0.05) * timeScale;
    state.current.t += dt;

    flyers.current.forEach((f, i) => {
      f.p += dt * (0.35 + (i % 5) * 0.05);
      if (f.p >= 1) {
        f.p -= 1;
        f.target = sampleY();
        f.tz = (Math.random() - 0.5) * 3.5;
        if (hitsRef.current) {
          const idx = state.current.hits % 900;
          dummy.position.set(SCREEN_X - 0.05, 1.2 + f.target, f.tz);
          dummy.scale.setScalar(0.09);
          dummy.updateMatrix();
          hitsRef.current.setMatrixAt(idx, dummy.matrix);
          state.current.hits++;
          hitsRef.current.count = Math.min(state.current.hits, 900);
          hitsRef.current.instanceMatrix.needsUpdate = true;
        }
      }
      if (flyRef.current) {
        const x = SOURCE_X + f.p * (SCREEN_X - SOURCE_X);
        const beyond = x > SLIT_X;
        const frac = beyond ? (x - SLIT_X) / (SCREEN_X - SLIT_X) : 0;
        const y = 1.2 + f.target * frac;
        const wob = beyond ? 0 : Math.sin(state.current.t * 6 + i) * 0.12;
        dummy.position.set(x, y + wob, f.tz * frac);
        dummy.scale.setScalar(0.13);
        dummy.updateMatrix();
        flyRef.current.setMatrixAt(i, dummy.matrix);
      }
    });
    if (flyRef.current) flyRef.current.instanceMatrix.needsUpdate = true;
  });

  // intensity bars on the screen
  const bars = useMemo(() => {
    const step = Math.max(1, Math.floor(pattern.length / 70));
    const arr: { y: number; v: number }[] = [];
    for (let i = 0; i < pattern.length; i += step) {
      arr.push({ y: (pattern[i].y / halfSpan) * 4.5, v: pattern[i]['الشدة'] });
    }
    return arr;
  }, [pattern, halfSpan]);

  const slitHalf = 0.35;
  const sep = Math.min(2.6, Math.max(0.5, params.slitSeparation / 220));

  return (
    <group>
      {/* electron gun */}
      <group position={[SOURCE_X, 1.2, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.5, 0.7, 1.4, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        <Sphere args={[0.22, 16, 16]} position={[0.8, 0, 0]}>
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.4} />
        </Sphere>
        <SimLabel3D position={[0, 1.4, 0]}>مدفع إلكترونات</SimLabel3D>
      </group>

      {/* barrier with two slits */}
      <group position={[SLIT_X, 1.2, 0]}>
        {[
          { y: 3.2, h: 3.2 },
          { y: 0, h: (sep - slitHalf) * 2 },
          { y: -3.2, h: 3.2 },
        ].map((b, i) => (
          <Box key={i} args={[0.18, Math.max(b.h, 0.05), 7]} position={[0, b.y, 0]}>
            <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.4} />
          </Box>
        ))}
        <SimLabel3D position={[0, 4.4, 0]}>{`شقّان — d = ${params.slitSeparation} nm`}</SimLabel3D>
        {params.observed && (
          <>
            <Torus args={[0.5, 0.06, 10, 28]} position={[0.5, sep, 0]} rotation={[0, Math.PI / 2, 0]}>
              <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.9} />
            </Torus>
            <SimLabel3D position={[1.4, sep + 0.9, 0]}>كاشف المسار (يُلغي التداخل)</SimLabel3D>
          </>
        )}
      </group>

      {/* flying electrons + accumulated hits */}
      <instancedMesh ref={flyRef} args={[undefined, undefined, 26]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
      </instancedMesh>
      <instancedMesh ref={hitsRef} args={[undefined, undefined, 900]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
      </instancedMesh>

      {/* detection screen */}
      <Box args={[0.2, 10, 7]} position={[SCREEN_X, 1.2, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </Box>
      <SimLabel3D position={[SCREEN_X, 6.6, 0]}>شاشة الكشف</SimLabel3D>

      {showVectors &&
        bars.map((b, i) => (
          <Box
            key={i}
            args={[Math.max(b.v * 2.2, 0.02), 0.1, 0.1]}
            position={[SCREEN_X + 0.2 + Math.max(b.v * 2.2, 0.02) / 2, 1.2 + b.y, 3.6]}
          >
            <meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={0.5} />
          </Box>
        ))}

      <SimLabel3D position={[SCREEN_X + 2.6, 1.2, 3.6]}>{`منحنى الشدة — تباعد الأهداب ${stats.fringeSpacing.toFixed(2)} µm`}</SimLabel3D>
    </group>
  );
};

/** Wave-packet hitting a rectangular potential barrier. */
const TunnelScene = ({
  params,
  stats,
  playing,
  timeScale,
  showVectors,
}: Pick<Props, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors'>) => {
  const packet = useRef<THREE.Group>(null);
  const t = useRef(0);
  const barrierW = Math.min(4, Math.max(0.3, params.barrierWidth * 1.6));
  const barrierH = Math.max(0.6, Math.min(6, params.barrierHeight * 0.9));
  const energyY = Math.max(0.2, Math.min(6, params.energy * 0.9));

  const wave = useMemo(() => {
    const pts: [number, number, number][] = [];
    const k = 2 + 8 / Math.max(stats.deBroglie, 0.2);
    for (let i = 0; i <= 220; i++) {
      const x = -9 + (i / 220) * 18;
      let amp = 0.7;
      if (x > -barrierW / 2 && x < barrierW / 2) {
        amp = stats.classicallyAllowed
          ? 0.7
          : 0.7 * Math.exp(-(x + barrierW / 2) / Math.max(stats.decayLength * 0.6, 0.15));
      } else if (x >= barrierW / 2) {
        amp = 0.7 * Math.sqrt(stats.transmission);
      }
      pts.push([x, energyY + amp * Math.sin(k * x), 0]);
    }
    return pts;
  }, [stats, barrierW, energyY]);

  useFrame((_, delta) => {
    if (!playing || !packet.current) return;
    t.current += Math.min(delta, 0.05) * timeScale * 1.2;
    const cycle = (t.current % 6) / 6;
    const x = -8 + cycle * 16;
    packet.current.position.x = x;
    const past = x > barrierW / 2;
    const scale = past ? Math.max(0.25, Math.sqrt(stats.transmission)) : 1;
    packet.current.scale.setScalar(scale);
  });

  return (
    <group>
      {/* potential barrier */}
      <Box args={[barrierW, barrierH, 3]} position={[0, barrierH / 2, 0]}>
        <meshStandardMaterial color="#7c3aed" transparent opacity={0.35} emissive="#7c3aed" emissiveIntensity={0.3} />
      </Box>
      <SimLabel3D position={[0, barrierH + 0.6, 0]}>{`V₀ = ${params.barrierHeight} eV`}</SimLabel3D>
      <SimLabel3D position={[0, -0.5, 1.8]}>{`a = ${params.barrierWidth} nm`}</SimLabel3D>

      {/* energy level */}
      <Line
        points={[
          [-9, energyY, 0],
          [9, energyY, 0],
        ]}
        color={stats.classicallyAllowed ? '#22c55e' : '#f97316'}
        lineWidth={2}
        dashed
        dashSize={0.3}
        gapSize={0.2}
      />
      <SimLabel3D position={[-7.5, energyY + 0.5, 0]}>{`E = ${params.energy.toFixed(2)} eV`}</SimLabel3D>

      {showVectors && <Line points={wave} color="#38bdf8" lineWidth={2.5} />}

      <group ref={packet} position={[-8, energyY, 0]}>
        <Sphere args={[0.35, 20, 20]}>
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.3} transparent opacity={0.85} />
        </Sphere>
        <Torus args={[0.6, 0.05, 10, 28]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.8} />
        </Torus>
      </group>

      <SimLabel3D position={[5.5, energyY + 2, 0]}>{`احتمال النفاذ T = ${(stats.transmission * 100).toFixed(2)} %`}</SimLabel3D>
      <SimLabel3D position={[-5.5, energyY + 2, 0]}>{`الانعكاس R = ${(stats.reflection * 100).toFixed(2)} %`}</SimLabel3D>
    </group>
  );
};

/** Particle in a box: |ψ|² surface oscillating in time. */
const WellScene = ({
  params,
  stats,
  playing,
  timeScale,
  showVectors,
}: Pick<Props, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors'>) => {
  const lineRef = useRef<THREE.Group>(null);
  const t = useRef(0);
  const [tick, setTick] = useMemo(() => {
    let v = 0;
    return [() => v, (x: number) => (v = x)] as const;
  }, []);
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const N = 60;

  useFrame((_, delta) => {
    if (playing) t.current += Math.min(delta, 0.05) * timeScale;
    setTick(t.current);
    if (!barsRef.current) return;
    const fs = (t.current * 1000) % (isFinite(stats.beatPeriod) ? stats.beatPeriod : 1000);
    const data = wellDensity(params, fs, N);
    const maxV = Math.max(...data.map((d) => d['كثافة الاحتمال']), 1e-6);
    data.forEach((d, i) => {
      const h = (d['كثافة الاحتمال'] / maxV) * 4.5 + 0.02;
      const x = -6 + (i / N) * 12;
      dummy.position.set(x, h / 2, 0);
      dummy.scale.set(0.16, h, 0.9);
      dummy.updateMatrix();
      barsRef.current!.setMatrixAt(i, dummy.matrix);
    });
    barsRef.current.instanceMatrix.needsUpdate = true;
  });

  const levels = useMemo(() => [1, 2, 3, 4].map((n) => ({ n, e: stats.energyN * (n * n) / (params.stateN * params.stateN) })), [stats, params.stateN]);

  return (
    <group ref={lineRef}>
      {/* infinite walls */}
      {[-6.4, 6.4].map((x) => (
        <Box key={x} args={[0.35, 7, 1.4]} position={[x, 3.5, 0]}>
          <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.35} />
        </Box>
      ))}
      <SimLabel3D position={[0, 6.2, 0]}>{`بئر جهد لانهائي L = ${params.wellWidth} nm`}</SimLabel3D>

      <instancedMesh ref={barsRef} args={[undefined, undefined, N + 1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.55} transparent opacity={0.9} />
      </instancedMesh>

      {showVectors &&
        levels.map((l, i) => (
          <group key={l.n}>
            <Line
              points={[
                [-6.2, 0.35 + i * 1.35, -1.6],
                [6.2, 0.35 + i * 1.35, -1.6],
              ]}
              color={l.n === params.stateN || l.n === params.stateM ? '#fbbf24' : '#475569'}
              lineWidth={l.n === params.stateN || l.n === params.stateM ? 3 : 1.5}
            />
            <SimLabel3D position={[7.4, 0.35 + i * 1.35, -1.6]}>{`n=${l.n} : ${l.e.toFixed(3)} eV`}</SimLabel3D>
          </group>
        ))}

      <SimLabel3D position={[0, -0.7, 1.6]}>
        {`|ψ|² — خلط n=${params.stateN} مع n=${params.stateM} (زمن النبض ${
          isFinite(stats.beatPeriod) ? stats.beatPeriod.toFixed(2) : '∞'
        } fs)`}
      </SimLabel3D>
    </group>
  );
};

export const QuantumScene3D = ({
  mode,
  params,
  stats,
  playing,
  timeScale,
  showVectors,
  view,
  autoRotate,
  resetKey,
}: Props) => {
  const { settings } = useSimQuality();

  return (
    <group>
      <SimControls view={view} autoRotate={autoRotate} target={[0, 2.5, 0]} maxDistance={70} />
      <directionalLight
        position={[8, 16, 12]}
        intensity={1.05}
        castShadow={settings.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.5} />
      <SimStage size={44} ruler={mode !== 'tunnel'} rulerLength={9} rulerStep={3} rulerUnit="" />

      {mode === 'doubleslit' && (
        <DoubleSlitScene
          params={params}
          stats={stats}
          playing={playing}
          timeScale={timeScale}
          showVectors={showVectors}
          resetKey={resetKey}
        />
      )}
      {mode === 'tunnel' && (
        <TunnelScene
          params={params}
          stats={stats}
          playing={playing}
          timeScale={timeScale}
          showVectors={showVectors}
        />
      )}
      {mode === 'superposition' && (
        <WellScene
          params={params}
          stats={stats}
          playing={playing}
          timeScale={timeScale}
          showVectors={showVectors}
        />
      )}
    </group>
  );
};

export default QuantumScene3D;
