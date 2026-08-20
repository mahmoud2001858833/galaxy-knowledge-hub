import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { MATERIALS, ThermoMode, ThermoStats, temperatureColor } from '@/lib/sim-physics/thermo';

interface ThermoScene3DProps {
  mode: ThermoMode;
  stats: ThermoStats;
  temperature: number;
  volume: number;
  tHot: number;
  tCold: number;
  materialKey: string;
  thickness: number;
  surfaceHot: number;
  surfaceCold: number;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const BOX_W = 5;
const BOX_D = 4;
const BOX_MAX_H = 4.5;
const COUNT = 140;

/** Ideal gas: piston cylinder with bouncing molecules. */
const IdealGasScene = ({
  stats,
  temperature,
  volume,
  playing,
  timeScale,
}: Pick<ThermoScene3DProps, 'stats' | 'temperature' | 'volume' | 'playing' | 'timeScale'>) => {
  const { settings } = useSimQuality();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const state = useRef<{ p: Float32Array; v: Float32Array } | null>(null);

  if (!state.current) {
    state.current = {
      p: Float32Array.from({ length: COUNT * 3 }, () => Math.random() - 0.5),
      v: Float32Array.from({ length: COUNT * 3 }, () => Math.random() * 2 - 1),
    };
  }

  const height = THREE.MathUtils.clamp((volume / 60) * BOX_MAX_H, 0.8, BOX_MAX_H);
  const speed = Math.sqrt(temperature / 300) * 1.6;
  const color = temperatureColor(temperature, 50, 1000);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const st = state.current;
    if (!mesh || !st) return;
    const dt = Math.min(delta, 0.05) * timeScale;
    const hx = BOX_W / 2 - 0.12;
    const hz = BOX_D / 2 - 0.12;
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      if (playing) {
        st.p[ix] += st.v[ix] * speed * dt;
        st.p[ix + 1] += st.v[ix + 1] * speed * dt;
        st.p[ix + 2] += st.v[ix + 2] * speed * dt;
      }
      // bounce inside the box in normalised coords
      if (st.p[ix] > 0.5 || st.p[ix] < -0.5) st.v[ix] *= -1;
      if (st.p[ix + 1] > 0.5 || st.p[ix + 1] < -0.5) st.v[ix + 1] *= -1;
      if (st.p[ix + 2] > 0.5 || st.p[ix + 2] < -0.5) st.v[ix + 2] *= -1;
      st.p[ix] = THREE.MathUtils.clamp(st.p[ix], -0.5, 0.5);
      st.p[ix + 1] = THREE.MathUtils.clamp(st.p[ix + 1], -0.5, 0.5);
      st.p[ix + 2] = THREE.MathUtils.clamp(st.p[ix + 2], -0.5, 0.5);

      dummy.position.set(
        st.p[ix] * hx * 2,
        0.15 + (st.p[ix + 1] + 0.5) * (height - 0.3),
        st.p[ix + 2] * hz * 2
      );
      dummy.scale.setScalar(0.09);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* cylinder walls */}
      <mesh position={[0, BOX_MAX_H / 2, 0]}>
        <boxGeometry args={[BOX_W, BOX_MAX_H, BOX_D]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          transparent
          opacity={0.07}
          transmission={0.9}
          thickness={0.2}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* base */}
      <mesh position={[0, 0.05, 0]} receiveShadow={settings.shadows}>
        <boxGeometry args={[BOX_W + 0.2, 0.1, BOX_D + 0.2]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* molecules */}
      <instancedMesh ref={meshRef} args={[undefined as never, undefined as never, COUNT]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} />
      </instancedMesh>

      {/* piston */}
      <group position={[0, height, 0]}>
        <mesh castShadow={settings.shadows}>
          <boxGeometry args={[BOX_W - 0.06, 0.22, BOX_D - 0.06]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 1.6, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
        <SimLabel3D position={[0, 2, 0]} variant="accent" distanceFactor={11}>
          P = {stats.pressureAtm.toFixed(2)} atm
        </SimLabel3D>
      </group>

      <SimLabel3D position={[-BOX_W / 2 - 1.1, height / 2, 0]} variant="muted" distanceFactor={11}>
        V = {volume.toFixed(1)} لتر
      </SimLabel3D>
      <SimLabel3D position={[BOX_W / 2 + 1.1, height / 2, 0]} distanceFactor={11}>
        T = {temperature.toFixed(0)} K · v_rms = {stats.vRms.toFixed(0)} م/ث
      </SimLabel3D>
    </group>
  );
};

/** Carnot engine: hot reservoir, cold reservoir, rotating engine and energy arrows. */
const CarnotScene = ({
  stats,
  tHot,
  tCold,
  playing,
  timeScale,
}: Pick<ThermoScene3DProps, 'stats' | 'tHot' | 'tCold' | 'playing' | 'timeScale'>) => {
  const wheelRef = useRef<THREE.Group>(null);
  const flowRef = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05) * timeScale;
    if (playing) {
      flowRef.current += dt;
      if (wheelRef.current) wheelRef.current.rotation.z -= dt * (0.6 + stats.efficiency * 6);
    }
  });

  const hotColor = temperatureColor(tHot, 250, 1400);
  const coldColor = temperatureColor(tCold, 150, 600);
  const beamW = (q: number) => THREE.MathUtils.clamp(q / 1400, 0.18, 1.4);

  return (
    <group>
      {/* hot reservoir */}
      <mesh position={[-4.5, 2, 0]} castShadow>
        <boxGeometry args={[2.4, 4, 2.4]} />
        <meshStandardMaterial color={hotColor} emissive={hotColor} emissiveIntensity={0.45} roughness={0.5} />
      </mesh>
      <SimLabel3D position={[-4.5, 4.7, 0]} variant="accent" distanceFactor={12}>
        الخزان الساخن {tHot.toFixed(0)} K
      </SimLabel3D>

      {/* cold reservoir */}
      <mesh position={[4.5, 2, 0]} castShadow>
        <boxGeometry args={[2.4, 4, 2.4]} />
        <meshStandardMaterial color={coldColor} emissive={coldColor} emissiveIntensity={0.35} roughness={0.5} />
      </mesh>
      <SimLabel3D position={[4.5, 4.7, 0]} variant="muted" distanceFactor={12}>
        الخزان البارد {tCold.toFixed(0)} K
      </SimLabel3D>

      {/* engine */}
      <group position={[0, 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1.3, 1.3, 1.4, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        <group ref={wheelRef}>
          <mesh position={[0, 0, 0.75]}>
            <torusGeometry args={[0.95, 0.12, 12, 40]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.5} metalness={0.6} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0, 0, 0.75]} rotation={[0, 0, (i * Math.PI) / 4]}>
              <boxGeometry args={[1.9, 0.08, 0.08]} />
              <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
        <SimLabel3D position={[0, 2.2, 0]} variant="accent" distanceFactor={11}>
          الكفاءة η = {(stats.efficiency * 100).toFixed(1)}%
        </SimLabel3D>
      </group>

      {/* Q_hot beam */}
      <mesh position={[-2.2, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[beamW(1200), beamW(1200), 2.4, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.6} transparent opacity={0.75} />
      </mesh>
      <SimLabel3D position={[-2.2, 1.0, 0]} variant="muted" distanceFactor={12}>
        Q_ساخن
      </SimLabel3D>

      {/* Q_cold beam */}
      <mesh position={[2.2, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[beamW(stats.qCold), beamW(stats.qCold), 2.4, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} transparent opacity={0.7} />
      </mesh>
      <SimLabel3D position={[2.2, 1.0, 0]} variant="muted" distanceFactor={12}>
        Q_بارد = {stats.qCold.toFixed(0)} J
      </SimLabel3D>

      {/* Work output upward */}
      <mesh position={[0, 4.2, 0]}>
        <cylinderGeometry args={[beamW(stats.work), beamW(stats.work), 1.8, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>
      <SimLabel3D position={[0, 5.4, 0]} distanceFactor={12}>
        الشغل W = {stats.work.toFixed(0)} J
      </SimLabel3D>

      <Line
        points={[
          [-6, 0.02, 2.5],
          [6, 0.02, 2.5],
        ]}
        color="#334155"
        lineWidth={1}
      />
    </group>
  );
};

/** Heat transfer through a wall: conduction, convection plume, radiation rings. */
const HeatTransferScene = ({
  stats,
  materialKey,
  thickness,
  surfaceHot,
  surfaceCold,
  playing,
  timeScale,
}: Pick<
  ThermoScene3DProps,
  'stats' | 'materialKey' | 'thickness' | 'surfaceHot' | 'surfaceCold' | 'playing' | 'timeScale'
>) => {
  const mat = MATERIALS.find((m) => m.key === materialKey) ?? MATERIALS[0];
  const wallW = THREE.MathUtils.clamp(thickness * 8, 0.2, 4);
  const flowRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05) * timeScale;
    if (playing) t.current += dt;
    const rate = THREE.MathUtils.clamp(stats.conduction / 4000, 0.15, 4);
    if (flowRef.current) {
      flowRef.current.children.forEach((c, i) => {
        const phase = (t.current * rate + i / 6) % 1;
        c.position.x = -3 + phase * 6;
        (c as THREE.Mesh).scale.setScalar(0.8 + Math.sin(phase * Math.PI) * 0.6);
      });
    }
    if (ringRef.current) {
      ringRef.current.children.forEach((c, i) => {
        const phase = (t.current * 0.6 + i / 4) % 1;
        c.scale.setScalar(0.4 + phase * 2.4);
        const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.opacity = 0.5 * (1 - phase);
      });
    }
  });

  const hotColor = temperatureColor(surfaceHot, 250, 900);
  const coldColor = temperatureColor(surfaceCold, 200, 500);

  return (
    <group>
      {/* hot side plate */}
      <mesh position={[-3, 2, 0]} castShadow>
        <boxGeometry args={[0.4, 3.4, 3.4]} />
        <meshStandardMaterial color={hotColor} emissive={hotColor} emissiveIntensity={0.5} />
      </mesh>
      <SimLabel3D position={[-3, 4.2, 0]} variant="accent" distanceFactor={12}>
        {surfaceHot.toFixed(0)} K
      </SimLabel3D>

      {/* the wall */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[wallW, 3.4, 3.4]} />
        <meshStandardMaterial color={mat.color} roughness={0.7} metalness={mat.k > 40 ? 0.6 : 0.05} />
      </mesh>
      <SimLabel3D position={[0, 4.2, 0]} distanceFactor={12}>
        {mat.name} · k = {mat.k} W/m·K · d = {thickness.toFixed(2)} م
      </SimLabel3D>

      {/* cold side plate */}
      <mesh position={[3, 2, 0]} castShadow>
        <boxGeometry args={[0.4, 3.4, 3.4]} />
        <meshStandardMaterial color={coldColor} emissive={coldColor} emissiveIntensity={0.35} />
      </mesh>
      <SimLabel3D position={[3, 4.2, 0]} variant="muted" distanceFactor={12}>
        {surfaceCold.toFixed(0)} K
      </SimLabel3D>

      {/* conduction packets */}
      <group ref={flowRef}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[-3, 2, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>

      {/* radiation rings on the hot side */}
      <group ref={ringRef} position={[-3.4, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i}>
            <ringGeometry args={[0.9, 1, 40]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      <SimLabel3D position={[0, 0.7, 0]} variant="muted" distanceFactor={12}>
        توصيل {stats.conduction.toFixed(0)} W · حمل {stats.convection.toFixed(0)} W · إشعاع{' '}
        {stats.radiation.toFixed(0)} W
      </SimLabel3D>
    </group>
  );
};

export const ThermoScene3D = (props: ThermoScene3DProps) => {
  const { mode, view, autoRotate } = props;

  return (
    <>
      <SimStage size={26} showGrid showAxes={false} />
      <SimControls
        view={view}
        autoRotate={autoRotate}
        target={[0, mode === 'ideal-gas' ? 2.2 : 2.2, 0]}
        scale={mode === 'ideal-gas' ? 0.6 : 0.75}
        minDistance={4}
        maxDistance={40}
      />
      {mode === 'ideal-gas' && <IdealGasScene {...props} />}
      {mode === 'carnot' && <CarnotScene {...props} />}
      {mode === 'heat-transfer' && <HeatTransferScene {...props} />}
    </>
  );
};
