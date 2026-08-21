import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import {
  PHASE_LABEL,
  PhaseMode,
  PhaseParams,
  PhaseStats,
  phaseDiagramCurves,
} from '@/lib/sim-physics/statesofmatter';

interface StatesScene3DProps {
  mode: PhaseMode;
  params: PhaseParams;
  stats: PhaseStats;
  playing: boolean;
  timeScale: number;
  showParticles: boolean;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const BOX = { w: 10, h: 8, d: 10 };

/** Transparent container walls. */
const Container = () => (
  <group position={[0, BOX.h / 2, 0]}>
    <mesh>
      <boxGeometry args={[BOX.w, BOX.h, BOX.d]} />
      <meshPhysicalMaterial
        color="#cbd5e1"
        transparent
        opacity={0.1}
        roughness={0.05}
        transmission={0.9}
        thickness={0.3}
        side={THREE.BackSide}
      />
    </mesh>
    <lineSegments>
      <edgesGeometry args={[new THREE.BoxGeometry(BOX.w, BOX.h, BOX.d)]} />
      <lineBasicMaterial color="#64748b" />
    </lineSegments>
  </group>
);

/** Kinetic particle system whose behaviour depends on the current phase. */
const Particles = ({
  stats,
  playing,
  timeScale,
  showVectors,
  resetKey,
}: {
  stats: PhaseStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  resetKey: number;
}) => {
  const { settings } = useSimQuality();
  const count = Math.min(settings.particles, 260);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const state = useMemo(() => {
    const nx = Math.ceil(Math.cbrt(count));
    const lattice: THREE.Vector3[] = [];
    const pos: THREE.Vector3[] = [];
    const vel: THREE.Vector3[] = [];
    const spacing = 1.05;
    let i = 0;
    for (let x = 0; x < nx && i < count; x++)
      for (let y = 0; y < nx && i < count; y++)
        for (let z = 0; z < nx && i < count; z++, i++) {
          const p = new THREE.Vector3(
            (x - (nx - 1) / 2) * spacing,
            (y - (nx - 1) / 2) * spacing + BOX.h / 2 - 1.5,
            (z - (nx - 1) / 2) * spacing
          );
          lattice.push(p.clone());
          pos.push(p.clone());
          vel.push(
            new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2)
          );
        }
    return { lattice, pos, vel };
  }, [count, resetKey]);

  const phase = stats.phase;
  const speed = 0.25 + stats.progress * 1.2 + (phase === 'gas' ? 3.2 : phase === 'liquid' ? 1.1 : 0);
  const color = stats.substance.color;

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = playing ? Math.min(delta, 0.05) * timeScale : 0;
    const half = { x: BOX.w / 2 - 0.4, y: BOX.h - 0.6, z: BOX.d / 2 - 0.4 };
    const liquidTop = BOX.h * 0.45;

    for (let i = 0; i < state.pos.length; i++) {
      const p = state.pos[i];
      const v = state.vel[i];
      if (phase === 'solid') {
        // vibrate around lattice site
        const amp = 0.05 + stats.progress * 0.22;
        const l = state.lattice[i];
        p.x = l.x + Math.sin(performance.now() * 0.004 + i) * amp;
        p.y = l.y + Math.cos(performance.now() * 0.005 + i * 1.7) * amp;
        p.z = l.z + Math.sin(performance.now() * 0.0045 + i * 2.3) * amp;
      } else {
        p.addScaledVector(v, dt * speed);
        if (phase === 'liquid') {
          // gravity settling + cohesion to a liquid pool
          v.y -= dt * 2.2;
          if (p.y < 0.4) {
            p.y = 0.4;
            v.y = Math.abs(v.y) * 0.5;
          }
          if (p.y > liquidTop) v.y -= dt * 4;
        }
        if (Math.abs(p.x) > half.x) {
          p.x = Math.sign(p.x) * half.x;
          v.x *= -1;
        }
        if (Math.abs(p.z) > half.z) {
          p.z = Math.sign(p.z) * half.z;
          v.z *= -1;
        }
        if (p.y > half.y) {
          p.y = half.y;
          v.y *= -1;
        }
        if (p.y < 0.35) {
          p.y = 0.35;
          v.y = Math.abs(v.y);
        }
      }
      dummy.position.copy(p);
      const s = 0.32 + (phase === 'gas' ? 0.02 : 0.06);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]} castShadow={false}>
        <sphereGeometry args={[1, settings.segments >= 32 ? 16 : 8, settings.segments >= 32 ? 16 : 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={phase === 'gas' ? 0.55 : 0.25}
          roughness={0.35}
          metalness={0.1}
        />
      </instancedMesh>
      {showVectors && phase !== 'solid' && (
        <SimLabel3D position={[0, BOX.h + 1.2, 0]} variant="accent" distanceFactor={22}>
          سرعة الجذر التربيعي المتوسطة: {Math.round(stats.rmsSpeed)} م/ث
        </SimLabel3D>
      )}
    </group>
  );
};

/** Thermometer + pressure piston showing the macroscopic state. */
const Instruments = ({ stats, params }: { stats: PhaseStats; params: PhaseParams }) => {
  const tMin = 1;
  const tMax = Math.max(stats.boilingPoint * 1.4, params.temperature * 1.1);
  const frac = Math.max(0.02, Math.min(1, (params.temperature - tMin) / (tMax - tMin)));
  const pistonY = BOX.h * (0.35 + 0.6 / (1 + params.pressure * 0.35));

  return (
    <group>
      {/* thermometer */}
      <group position={[BOX.w / 2 + 2.4, 0, 0]}>
        <mesh position={[0, 4.2, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 8.4, 24, 1, true]} />
          <meshPhysicalMaterial color="#e2e8f0" transparent opacity={0.25} transmission={0.85} thickness={0.2} />
        </mesh>
        <mesh position={[0, (8.2 * frac) / 2, 0]}>
          <cylinderGeometry args={[0.3, 0.3, Math.max(8.2 * frac, 0.1), 20]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
        <SimLabel3D position={[0, 9.4, 0]} distanceFactor={20}>
          {Math.round(params.temperature)} K / {Math.round(params.temperature - 273.15)}°م
        </SimLabel3D>
      </group>

      {/* pressure piston */}
      <group position={[0, pistonY, 0]}>
        <mesh castShadow>
          <boxGeometry args={[BOX.w - 0.4, 0.35, BOX.d - 0.4]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 2.6, 18]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.25} />
        </mesh>
        <SimLabel3D position={[-BOX.w / 2 - 1.6, 0.4, 0]} variant="muted" distanceFactor={20}>
          الضغط {params.pressure.toFixed(2)} atm
        </SimLabel3D>
      </group>

      <SimLabel3D position={[0, -0.9, BOX.d / 2 + 0.6]} variant="accent" distanceFactor={20}>
        الحالة: {PHASE_LABEL[stats.phase]}
        {stats.supercritical ? ' (فوق حرج)' : ''}
      </SimLabel3D>
    </group>
  );
};

/** Heating mode: energy bar + block melting/boiling under a burner. */
const HeatingScene = ({ stats, params, playing, timeScale }: { stats: PhaseStats; params: PhaseParams; playing: boolean; timeScale: number }) => {
  const flameRef = useRef<THREE.Mesh>(null);
  const sampleRef = useRef<THREE.Mesh>(null);

  useFrame((clock) => {
    const t = clock.clock.elapsedTime * (playing ? timeScale : 0);
    if (flameRef.current) {
      const s = 1 + Math.sin(t * 9) * 0.12;
      flameRef.current.scale.set(s, 1 + Math.sin(t * 7) * 0.2, s);
    }
    if (sampleRef.current && stats.phase !== 'solid') {
      sampleRef.current.rotation.y += 0.004 * timeScale;
    }
  });

  const fillRatio = Math.min(1, stats.energyStored / Math.max(stats.energyStored + stats.energyToGas, 1e-6));
  const sampleH = stats.phase === 'gas' ? 0.4 : stats.phase === 'liquid' ? 1.4 : 2.6;

  return (
    <group>
      {/* burner */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[2.4, 2.8, 0.5, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh ref={flameRef} position={[0, 1.2, 0]}>
        <coneGeometry args={[1.1, 2, 20]} />
        <meshStandardMaterial color="#f97316" emissive="#fb923c" emissiveIntensity={1.2} transparent opacity={0.75} />
      </mesh>

      {/* container */}
      <mesh position={[0, 3.6, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 4.4, 40, 1, true]} />
        <meshPhysicalMaterial
          color="#cbd5e1"
          transparent
          opacity={0.15}
          transmission={0.9}
          thickness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* sample */}
      <mesh ref={sampleRef} position={[0, 1.9 + sampleH / 2, 0]} castShadow>
        {stats.phase === 'solid' ? (
          <boxGeometry args={[2.4, sampleH, 2.4]} />
        ) : (
          <cylinderGeometry args={[2.05, 2.05, sampleH, 36]} />
        )}
        <meshPhysicalMaterial
          color={stats.substance.color}
          transparent
          opacity={stats.phase === 'gas' ? 0.28 : stats.phase === 'liquid' ? 0.8 : 1}
          roughness={stats.phase === 'solid' ? 0.6 : 0.15}
          transmission={stats.phase === 'liquid' ? 0.35 : 0}
        />
      </mesh>

      {/* energy tower */}
      <group position={[5.6, 0, 0]}>
        <mesh position={[0, 4, 0]}>
          <boxGeometry args={[1.1, 8, 1.1]} />
          <meshStandardMaterial color="#1e293b" transparent opacity={0.4} />
        </mesh>
        <mesh position={[0, (8 * fillRatio) / 2, 0]}>
          <boxGeometry args={[1.02, Math.max(8 * fillRatio, 0.05), 1.02]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.55} />
        </mesh>
        <SimLabel3D position={[0, 8.9, 0]} distanceFactor={20}>
          الطاقة المخزّنة {stats.energyStored.toFixed(1)} kJ
        </SimLabel3D>
      </group>

      <SimLabel3D position={[0, 8.6, 0]} variant="accent" distanceFactor={20}>
        {stats.substance.name} — {PHASE_LABEL[stats.phase]} عند {Math.round(params.temperature)} K
      </SimLabel3D>
      <SimLabel3D position={[-5.4, 3.4, 0]} variant="muted" distanceFactor={20}>
        الانصهار {Math.round(stats.meltingPoint)} K · الغليان {Math.round(stats.boilingPoint)} K
      </SimLabel3D>
    </group>
  );
};

/** 3D phase diagram: pressure (log) vs temperature with a live state marker. */
const DiagramScene = ({ stats, params }: { stats: PhaseStats; params: PhaseParams }) => {
  const curves = useMemo(() => phaseDiagramCurves(params.substanceId), [params.substanceId]);
  const s = stats.substance;

  const W = 14;
  const H = 9;
  const logP = (p: number) => Math.log10(Math.max(p, 1e-8));
  const pMin = logP(Math.max(s.triple.p * 0.01, 1e-8));
  const pMax = logP(s.critical.p * 1.2);
  const tMin = Math.max(s.triple.t * 0.5, 1);
  const tMax = s.critical.t * 1.15;

  const toXY = (t: number, p: number): [number, number] => [
    ((Math.min(Math.max(t, tMin), tMax) - tMin) / (tMax - tMin)) * W - W / 2,
    ((logP(p) - pMin) / (pMax - pMin)) * H,
  ];

  const buildLine = (pts: { t: number; p: number }[], color: string) => {
    const positions = new Float32Array(pts.length * 3);
    pts.forEach((pt, i) => {
      const [x, y] = toXY(pt.t, pt.p);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
    });
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return (
      <line>
        <primitive object={geom} attach="geometry" />
        <lineBasicMaterial color={color} linewidth={2} />
      </line>
    );
  };

  const [mx, my] = toXY(params.temperature, params.pressure);

  return (
    <group position={[0, 1, 0]}>
      <mesh position={[0, H / 2, -0.15]}>
        <planeGeometry args={[W + 1.2, H + 1.4]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>

      {buildLine(curves.fusion, '#60a5fa')}
      {buildLine(curves.vapor, '#f472b6')}
      {buildLine(curves.sublim, '#a3e635')}

      {/* triple + critical points */}
      {[
        { pt: curves.triple, color: '#facc15', label: 'النقطة الثلاثية' },
        { pt: curves.critical, color: '#ef4444', label: 'النقطة الحرجة' },
      ].map((m) => {
        const [x, y] = toXY(m.pt.t, m.pt.p);
        return (
          <group key={m.label} position={[x, y, 0.1]}>
            <mesh>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.7} />
            </mesh>
            <SimLabel3D position={[0, 0.75, 0]} variant="muted" distanceFactor={24}>
              {m.label}
            </SimLabel3D>
          </group>
        );
      })}

      {/* live state marker */}
      <group position={[mx, my, 0.2]}>
        <mesh>
          <sphereGeometry args={[0.32, 20, 20]} />
          <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={1} />
        </mesh>
        <SimLabel3D position={[0, 0.9, 0]} variant="accent" distanceFactor={22}>
          {PHASE_LABEL[stats.phase]} · {Math.round(params.temperature)} K · {params.pressure.toFixed(2)} atm
        </SimLabel3D>
      </group>

      <SimLabel3D position={[0, -0.9, 0]} variant="muted" distanceFactor={24}>
        درجة الحرارة ⟶
      </SimLabel3D>
      <SimLabel3D position={[-W / 2 - 1.4, H / 2, 0]} variant="muted" distanceFactor={24}>
        الضغط (لوغاريتمي) ⟶
      </SimLabel3D>
    </group>
  );
};

export const StatesScene3D = ({
  mode,
  params,
  stats,
  playing,
  timeScale,
  showParticles,
  showVectors,
  view,
  autoRotate,
  resetKey,
}: StatesScene3DProps) => (
  <>
    <SimControls
      view={view}
      autoRotate={autoRotate}
      target={[0, mode === 'diagram' ? 5 : 4, 0]}
      scale={mode === 'diagram' ? 1.1 : 0.95}
      minDistance={8}
      maxDistance={70}
      clampGround={mode !== 'diagram'}
    />
    <SimStage size={44} showGrid={mode !== 'diagram'} showAxes={false} />

    {mode === 'particles' && (
      <>
        <Container />
        {showParticles && (
          <Particles
            stats={stats}
            playing={playing}
            timeScale={timeScale}
            showVectors={showVectors}
            resetKey={resetKey}
          />
        )}
        <Instruments stats={stats} params={params} />
      </>
    )}

    {mode === 'heating' && (
      <HeatingScene stats={stats} params={params} playing={playing} timeScale={timeScale} />
    )}

    {mode === 'diagram' && <DiagramScene stats={stats} params={params} />}
  </>
);

export default StatesScene3D;
