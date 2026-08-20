import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { RelativityMode, RelativityParams, RelativityStats } from '@/lib/sim-physics/relativity';

interface RelativityScene3DProps {
  mode: RelativityMode;
  params: RelativityParams;
  stats: RelativityStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

type ScenePick = Pick<
  RelativityScene3DProps,
  'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors' | 'resetKey'
>;

const CLOCK_H = 4; // world height of a light clock

/** Two light clocks: one at rest, one moving — the moving one ticks slower. */
const LightClocks = ({ params, stats, playing, timeScale, showVectors, resetKey }: ScenePick) => {
  const t = useRef(0);
  const last = useRef(resetKey);
  const restPhoton = useRef<THREE.Mesh>(null);
  const movePhoton = useRef<THREE.Mesh>(null);
  const movingGroup = useRef<THREE.Group>(null);
  const restTicks = useRef(0);
  const moveTicks = useRef(0);
  const tickLabel = useRef<{ rest: number; moving: number }>({ rest: 0, moving: 0 });

  const SPAN = 26;

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
      restTicks.current = 0;
      moveTicks.current = 0;
    }
    if (playing) t.current += delta * timeScale;
    const time = t.current;

    // rest clock: one full bounce per second
    const phase = (time % 1) / 1;
    if (restPhoton.current) restPhoton.current.position.y = CLOCK_H * (1 - Math.abs(1 - 2 * phase));
    restTicks.current = Math.floor(time);

    // moving clock: proper time runs slower by 1/γ
    const tp = time / stats.gamma;
    const mp = (tp % 1) / 1;
    if (movePhoton.current) movePhoton.current.position.y = CLOCK_H * (1 - Math.abs(1 - 2 * mp));
    moveTicks.current = Math.floor(tp);

    if (movingGroup.current) {
      const x = ((time * params.beta * 6) % SPAN) - SPAN / 2;
      movingGroup.current.position.x = x;
    }
    tickLabel.current = { rest: restTicks.current, moving: moveTicks.current };
  });

  const frame = (color: string) => (
    <>
      <Line
        points={[
          [-1, 0, 0],
          [1, 0, 0],
        ]}
        color={color}
        lineWidth={4}
      />
      <Line
        points={[
          [-1, CLOCK_H, 0],
          [1, CLOCK_H, 0],
        ]}
        color={color}
        lineWidth={4}
      />
      <Line
        points={[
          [0, 0, 0],
          [0, CLOCK_H, 0],
        ]}
        color="#334155"
        lineWidth={1}
        dashed
        dashSize={0.3}
        gapSize={0.25}
      />
    </>
  );

  return (
    <group>
      <SimStage size={50} ruler rulerLength={12} rulerStep={4} rulerUnit="و" />

      {/* rest clock */}
      <group position={[-8, 0.4, -4]}>
        {frame('#22c55e')}
        <mesh ref={restPhoton}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={1.2} />
        </mesh>
        <SimLabel3D position={[0, CLOCK_H + 1.1, 0]} distanceFactor={26}>
          ساعة ساكنة — الزمن الذاتي {params.properTime.toFixed(1)} ث
        </SimLabel3D>
      </group>

      {/* moving clock */}
      <group ref={movingGroup} position={[0, 0.4, 4]}>
        <group scale={[1 / stats.gamma, 1, 1]}>{frame('#38bdf8')}</group>
        <mesh ref={movePhoton}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#f472b6" emissive="#db2777" emissiveIntensity={1.2} />
        </mesh>
        <SimLabel3D position={[0, CLOCK_H + 1.1, 0]} variant="accent" distanceFactor={26}>
          ساعة متحركة — β = {params.beta.toFixed(3)} ، γ = {stats.gamma.toFixed(3)}
        </SimLabel3D>
        {showVectors && (
          <>
            <Line
              points={[
                [0, 1.6, 0],
                [3, 1.6, 0],
              ]}
              color="#f97316"
              lineWidth={3}
            />
            <SimLabel3D position={[3.6, 2.1, 0]} variant="muted" distanceFactor={26}>
              v = {(stats.speed / 1e6).toFixed(1)} × 10⁶ م/ث
            </SimLabel3D>
          </>
        )}
      </group>

      <SimLabel3D position={[0, CLOCK_H + 3.4, 0]} variant="muted" distanceFactor={34}>
        Δt = γ · Δt₀ = {stats.dilatedTime.toFixed(3)} ث مقابل {params.properTime.toFixed(1)} ث
      </SimLabel3D>
    </group>
  );
};

/** A rest rod versus the same rod contracted along the motion axis. */
const ContractionScene = ({ params, stats, playing, timeScale, showVectors, resetKey }: ScenePick) => {
  const t = useRef(0);
  const last = useRef(resetKey);
  const ship = useRef<THREE.Group>(null);
  const SPAN = 28;
  const scaleWorld = 12 / Math.max(params.properLength, 1e-6); // world units per metre

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale;
    if (ship.current) ship.current.position.x = ((t.current * params.beta * 7) % SPAN) - SPAN / 2;
  });

  const restLen = params.properLength * scaleWorld;
  const movLen = stats.contractedLength * scaleWorld;

  return (
    <group>
      <SimStage size={54} ruler rulerLength={14} rulerStep={2} rulerUnit="و" />

      {/* rest rod */}
      <group position={[0, 1.2, -6]}>
        <Box args={[restLen, 1, 1.6]} castShadow>
          <meshStandardMaterial color="#22c55e" metalness={0.35} roughness={0.35} />
        </Box>
        <SimLabel3D position={[0, 1.6, 0]} distanceFactor={28}>
          الطول الذاتي L₀ = {params.properLength.toFixed(2)} م
        </SimLabel3D>
      </group>

      {/* moving contracted rod */}
      <group ref={ship} position={[0, 1.2, 5]}>
        <Box args={[Math.max(movLen, 0.05), 1, 1.6]} castShadow>
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.35} metalness={0.45} roughness={0.25} />
        </Box>
        <SimLabel3D position={[0, 1.8, 0]} variant="accent" distanceFactor={28}>
          L = L₀/γ = {stats.contractedLength.toFixed(3)} م
        </SimLabel3D>
        {showVectors && (
          <Line
            points={[
              [movLen / 2, 0, 0],
              [movLen / 2 + 2.4, 0, 0],
            ]}
            color="#f97316"
            lineWidth={3}
          />
        )}
      </group>

      <SimLabel3D position={[0, 6, 0]} variant="muted" distanceFactor={34}>
        نسبة التقلّص L/L₀ = {(1 / stats.gamma).toFixed(4)}
      </SimLabel3D>
    </group>
  );
};

/** Mass–energy: a particle whose energy bars grow as β approaches 1. */
const EnergyScene = ({ params, stats, playing, timeScale, showVectors, resetKey }: ScenePick) => {
  const t = useRef(0);
  const last = useRef(resetKey);
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);

  const ratio = stats.totalEnergy / Math.max(stats.restEnergy, 1e-12);
  const restH = 2.5;
  const kinH = Math.min(restH * (ratio - 1), 14);

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale;
    const pulse = 1 + 0.12 * Math.sin(t.current * (2 + params.beta * 18));
    core.current?.scale.setScalar(pulse);
    if (halo.current) {
      halo.current.scale.setScalar(1 + 0.5 * Math.min(ratio - 1, 6) * (0.9 + 0.1 * Math.sin(t.current * 4)));
      (halo.current.material as THREE.MeshBasicMaterial).opacity = Math.min(0.08 + 0.05 * (ratio - 1), 0.45);
    }
  });

  const bar = (x: number, h: number, color: string, label: string) => (
    <group position={[x, 0, 6]}>
      <mesh position={[0, Math.max(h, 0.02) / 2, 0]} castShadow>
        <boxGeometry args={[1.6, Math.max(h, 0.02), 1.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
      </mesh>
      <SimLabel3D position={[0, Math.max(h, 0.02) + 0.9, 0]} distanceFactor={26}>
        {label}
      </SimLabel3D>
    </group>
  );

  return (
    <group>
      <SimStage size={54} />

      <group position={[-6, 3.2, -2]}>
        <mesh ref={core} castShadow>
          <sphereGeometry args={[1.1, 32, 32]} />
          <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.8} metalness={0.4} roughness={0.2} />
        </mesh>
        <mesh ref={halo}>
          <sphereGeometry args={[1.6, 24, 24]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.15} />
        </mesh>
        <SimLabel3D position={[0, 2.6, 0]} variant="accent" distanceFactor={28}>
          m = γ·m₀ = {stats.relativisticMass.toExponential(3)} كغم
        </SimLabel3D>
        {showVectors && (
          <SimLabel3D position={[0, -2.2, 0]} variant="muted" distanceFactor={28}>
            p = {stats.momentum.toFixed(2)} MeV/c
          </SimLabel3D>
        )}
      </group>

      {bar(2, restH, '#22c55e', `E₀ = ${stats.restEnergy.toFixed(2)} MeV`)}
      {bar(5, kinH, '#f97316', `KE = ${stats.kineticEnergy.toFixed(2)} MeV`)}
      {bar(8, Math.min(restH + kinH, 16), '#38bdf8', `E = ${stats.totalEnergy.toFixed(2)} MeV`)}

      <SimLabel3D position={[5, 16, 6]} variant="muted" distanceFactor={36}>
        E = γ m₀c² — تحتاج طاقة لا نهائية للوصول إلى c
      </SimLabel3D>
    </group>
  );
};

export const RelativityScene3D = (props: RelativityScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls view={view} autoRotate={autoRotate} scale={1.05} target={[0, 3, 0]} maxDistance={90} />
      <directionalLight position={[12, 20, 14]} intensity={1.25} castShadow={settings.shadows} shadow-mapSize={[1024, 1024]} />
      <ambientLight intensity={0.5} />
      {mode === 'dilation' && <LightClocks {...props} />}
      {mode === 'contraction' && <ContractionScene {...props} />}
      {mode === 'energy' && <EnergyScene {...props} />}
    </>
  );
};

export default RelativityScene3D;
