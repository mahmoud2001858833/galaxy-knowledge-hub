import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import type { MachineMode, MachineParams, MachineStats } from '@/lib/sim-physics/machines';

interface MachineScene3DProps {
  mode: MachineMode;
  params: MachineParams;
  stats: MachineStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const Arrow = ({
  from,
  dir,
  length,
  color,
}: {
  from: [number, number, number];
  dir: [number, number, number];
  length: number;
  color: string;
}) => {
  const d = new THREE.Vector3(...dir).normalize();
  const end: [number, number, number] = [
    from[0] + d.x * length,
    from[1] + d.y * length,
    from[2] + d.z * length,
  ];
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
  const e = new THREE.Euler().setFromQuaternion(q);
  return (
    <group>
      <Line points={[from, end]} color={color} lineWidth={3} />
      <mesh position={end} rotation={[e.x, e.y, e.z]}>
        <coneGeometry args={[0.12, 0.35, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
};

/** Class 1/2/3 lever with a pivoting beam, weight block and effort hand. */
const LeverScene = ({ params, stats, playing, timeScale, showVectors, resetKey }: MachineScene3DProps) => {
  const beam = useRef<THREE.Group>(null);
  const t = useRef(0);
  const last = useRef(resetKey);
  const { settings } = useSimQuality();

  const loadArm = params.loadArm;
  const effortArm = params.leverClass === 3 ? Math.max(0.2, Math.min(params.effortArm, loadArm - 0.05)) : params.effortArm;

  // positions along the beam (x) relative to the fulcrum, per lever class
  const layout = useMemo(() => {
    if (params.leverClass === 1) return { fulcrum: 0, load: -loadArm, effort: effortArm };
    if (params.leverClass === 2) return { fulcrum: 0, load: loadArm, effort: Math.max(effortArm, loadArm + 0.4) };
    return { fulcrum: 0, load: loadArm, effort: effortArm };
  }, [params.leverClass, loadArm, effortArm]);

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += Math.min(delta, 0.05) * timeScale;
    const amp = stats.balanced ? 0.05 : 0.18;
    const tilt = Math.sin(t.current * 1.4) * amp;
    if (beam.current) beam.current.rotation.z = tilt;
  });

  const beamLen = Math.max(Math.abs(layout.load), Math.abs(layout.effort)) * 2 + 1.2;

  return (
    <group>
      <SimStage size={30} ruler rulerLength={6} rulerStep={1} />
      {/* fulcrum */}
      <mesh position={[0, 0.45, 0]} castShadow={settings.shadows}>
        <coneGeometry args={[0.55, 0.9, 4]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.4} />
      </mesh>
      <SimLabel3D position={[0, 0.15, 0.9]} variant="muted" distanceFactor={12}>
        نقطة الارتكاز
      </SimLabel3D>

      <group ref={beam} position={[0, 1, 0]}>
        <mesh castShadow={settings.shadows}>
          <boxGeometry args={[beamLen, 0.16, 0.6]} />
          <meshStandardMaterial color="#b45309" roughness={0.6} metalness={0.2} />
        </mesh>

        {/* load block */}
        <group position={[layout.load, 0.45, 0]}>
          <mesh castShadow={settings.shadows}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.5} />
          </mesh>
          <SimLabel3D position={[0, 0.75, 0]} distanceFactor={12}>
            الحِمل {params.loadMass} كغ ({stats.loadForce.toFixed(0)} N)
          </SimLabel3D>
          {showVectors && <Arrow from={[0, -0.35, 0]} dir={[0, -1, 0]} length={1.1} color="#ef4444" />}
        </group>

        {/* effort */}
        <group position={[layout.effort, 0.3, 0]}>
          <mesh castShadow={settings.shadows}>
            <cylinderGeometry args={[0.22, 0.22, 0.5, 20]} />
            <meshStandardMaterial color="#22c55e" metalness={0.4} roughness={0.4} />
          </mesh>
          <SimLabel3D position={[0, 0.85, 0]} variant="accent" distanceFactor={12}>
            الجهد {stats.effortForce.toFixed(0)} N
          </SimLabel3D>
          {showVectors && <Arrow from={[0, 0.3, 0]} dir={[0, -1, 0]} length={1.1} color="#22c55e" />}
        </group>
      </group>

      {/* arms */}
      <Line points={[[layout.load, 0.35, 0.5], [0, 0.35, 0.5]]} color="#ef4444" lineWidth={2} dashed dashSize={0.2} gapSize={0.12} />
      <Line points={[[0, 0.35, 0.5], [layout.effort, 0.35, 0.5]]} color="#22c55e" lineWidth={2} dashed dashSize={0.2} gapSize={0.12} />
      <SimLabel3D position={[layout.load / 2, 0.1, 1.2]} variant="muted" distanceFactor={14}>
        ذراع الحمل {loadArm.toFixed(2)} م
      </SimLabel3D>
      <SimLabel3D position={[layout.effort / 2, 0.1, 1.2]} variant="muted" distanceFactor={14}>
        ذراع الجهد {Math.abs(layout.effort).toFixed(2)} م
      </SimLabel3D>
    </group>
  );
};

/** Block-and-tackle pulley system: fixed pulleys above, movable pulleys carrying the load. */
const PulleyScene = ({ params, stats, playing, timeScale, showVectors, resetKey }: MachineScene3DProps) => {
  const loadGroup = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group>(null);
  const t = useRef(0);
  const last = useRef(resetKey);
  const { settings } = useSimQuality();

  const n = Math.max(1, Math.round(params.movablePulleys));
  const topY = 7;

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += Math.min(delta, 0.05) * timeScale;
    const lift = (Math.sin(t.current * 0.9 - Math.PI / 2) + 1) / 2; // 0..1
    if (loadGroup.current) loadGroup.current.position.y = 1 + lift * 2.4;
    if (wheels.current) wheels.current.rotation.z = -t.current * 2;
  });

  const Pulley = ({ position, color }: { position: [number, number, number]; color: string }) => (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow={settings.shadows}>
        <torusGeometry args={[0.45, 0.12, 10, 28]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.34, 0.34, 0.18, 20]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );

  return (
    <group>
      <SimStage size={30} showAxes={false} />
      {/* frame */}
      <mesh position={[0, topY + 0.3, 0]} castShadow={settings.shadows}>
        <boxGeometry args={[6, 0.35, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
      </mesh>
      {[-2.8, 2.8].map((x) => (
        <mesh key={x} position={[x, topY / 2, 0]} castShadow={settings.shadows}>
          <boxGeometry args={[0.3, topY, 0.3]} />
          <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}

      {/* fixed pulleys */}
      <group ref={wheels}>
        {Array.from({ length: n }).map((_, i) => (
          <Pulley key={`f${i}`} position={[-0.9 + i * 0.95, topY - 0.35, 0]} color="#38bdf8" />
        ))}
      </group>
      <SimLabel3D position={[-2.2, topY - 0.2, 0]} variant="muted" distanceFactor={16}>
        بكرات ثابتة ×{n}
      </SimLabel3D>

      {/* movable block + load */}
      <group ref={loadGroup}>
        {Array.from({ length: n }).map((_, i) => (
          <Pulley key={`m${i}`} position={[-0.9 + i * 0.95, 1.6, 0]} color="#f59e0b" />
        ))}
        <mesh position={[0, 0.6, 0]} castShadow={settings.shadows}>
          <boxGeometry args={[1.6, 1.1, 1.1]} />
          <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.5} />
        </mesh>
        <SimLabel3D position={[0, -0.3, 0]} distanceFactor={14}>
          {params.loadMass} كغ — {stats.loadForce.toFixed(0)} N
        </SimLabel3D>
        {showVectors && <Arrow from={[0, 0.05, 0]} dir={[0, -1, 0]} length={1.2} color="#ef4444" />}
        {/* rope segments between blocks */}
        {Array.from({ length: n }).map((_, i) => (
          <Line
            key={`r${i}`}
            points={[
              [-0.9 + i * 0.95, 1.6, 0.15],
              [-0.9 + i * 0.95, topY - 0.35, 0.15],
            ]}
            color="#e2e8f0"
            lineWidth={2}
          />
        ))}
      </group>

      {/* free end */}
      <Line points={[[-0.9 + (n - 1) * 0.95 + 0.45, topY - 0.35, -0.15], [2.2, topY - 0.35, -0.15], [2.2, 2.4, -0.15]]} color="#22c55e" lineWidth={2} />
      {showVectors && <Arrow from={[2.2, 2.4, -0.15]} dir={[0, -1, 0]} length={1.1} color="#22c55e" />}
      <SimLabel3D position={[3.1, 2.6, 0]} variant="accent" distanceFactor={14}>
        قوة الشد {stats.effortForce.toFixed(0)} N
      </SimLabel3D>
      <SimLabel3D position={[0, topY + 1.2, 0]} distanceFactor={18}>
        عدد الحبال الحاملة = {stats.supportingRopes} → الفائدة الآلية {stats.actualMA.toFixed(2)}
      </SimLabel3D>
    </group>
  );
};

const GearWheel = ({
  teeth,
  radius,
  color,
  thickness = 0.4,
}: {
  teeth: number;
  radius: number;
  color: string;
  thickness?: number;
}) => {
  const { settings } = useSimQuality();
  const count = Math.min(teeth, 60);
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow={settings.shadows}>
        <cylinderGeometry args={[radius, radius, thickness, 42]} />
        <meshStandardMaterial color={color} metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 0.22, radius * 0.22, thickness * 1.4, 20]} />
        <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.6} />
      </mesh>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * (radius + 0.11), 0, Math.sin(a) * (radius + 0.11)]}
            rotation={[0, -a, 0]}
            castShadow={settings.shadows}
          >
            <boxGeometry args={[0.24, thickness, (2 * Math.PI * radius) / count / 2]} />
            <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Meshed gear train: driver, optional idler and driven gear rotating at true ratios. */
const GearScene = ({ params, stats, playing, timeScale, showVectors, resetKey }: MachineScene3DProps) => {
  const driver = useRef<THREE.Group>(null);
  const idler = useRef<THREE.Group>(null);
  const driven = useRef<THREE.Group>(null);
  const t = useRef(0);
  const last = useRef(resetKey);

  const M = 0.055; // module: radius = teeth * M
  const rD = params.driverTeeth * M;
  const rI = params.idlerTeeth > 0 ? params.idlerTeeth * M : 0;
  const rN = params.drivenTeeth * M;

  const xDriver = -Math.max(2.5, rD + 1.5);
  const xIdler = rI > 0 ? xDriver + rD + rI + 0.22 : 0;
  const xDriven = rI > 0 ? xIdler + rI + rN + 0.22 : xDriver + rD + rN + 0.22;

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += Math.min(delta, 0.05) * timeScale;
    const w = (params.inputRpm / 60) * Math.PI * 2 * 0.06; // slowed for readability
    const a = t.current * w;
    if (driver.current) driver.current.rotation.y = a;
    if (idler.current && rI > 0) idler.current.rotation.y = -a * (params.driverTeeth / params.idlerTeeth);
    if (driven.current)
      driven.current.rotation.y =
        (rI > 0 ? 1 : -1) * a * (params.driverTeeth / params.drivenTeeth);
  });

  return (
    <group>
      <SimStage size={30} showAxes={false} />
      <mesh position={[(xDriver + xDriven) / 2, 0.9, -0.6]} receiveShadow>
        <boxGeometry args={[Math.abs(xDriven - xDriver) + 4, 3.6, 0.25]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      <group position={[xDriver, 1.8, 0]}>
        <group ref={driver}>
          <GearWheel teeth={params.driverTeeth} radius={rD} color="#38bdf8" />
        </group>
        <SimLabel3D position={[0, rD + 0.8, 0]} variant="accent" distanceFactor={16}>
          القائد {params.driverTeeth} سن — {params.inputRpm} rpm
        </SimLabel3D>
        {showVectors && <Arrow from={[0, -rD - 0.2, 0]} dir={[1, 0, 0]} length={1.2} color="#38bdf8" />}
      </group>

      {rI > 0 && (
        <group position={[xIdler, 1.8, 0]}>
          <group ref={idler}>
            <GearWheel teeth={params.idlerTeeth} radius={rI} color="#a78bfa" />
          </group>
          <SimLabel3D position={[0, rI + 0.8, 0]} variant="muted" distanceFactor={16}>
            ترس وسيط {params.idlerTeeth} سن
          </SimLabel3D>
        </group>
      )}

      <group position={[xDriven, 1.8, 0]}>
        <group ref={driven}>
          <GearWheel teeth={params.drivenTeeth} radius={rN} color="#f59e0b" />
        </group>
        <SimLabel3D position={[0, rN + 0.8, 0]} distanceFactor={16}>
          المقاد {params.drivenTeeth} سن — {stats.outputRpm.toFixed(0)} rpm
        </SimLabel3D>
        {showVectors && (
          <Arrow from={[0, -rN - 0.2, 0]} dir={[stats.sameDirection ? 1 : -1, 0, 0]} length={1.2} color="#f59e0b" />
        )}
      </group>

      <SimLabel3D position={[(xDriver + xDriven) / 2, 4.6, 0]} distanceFactor={20}>
        نسبة التروس {stats.gearRatio.toFixed(2)} : 1 — العزم الخارج {stats.outputTorque.toFixed(1)} N·m
      </SimLabel3D>
    </group>
  );
};

export const MachineScene3D = (props: MachineScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls
        view={view}
        autoRotate={autoRotate}
        scale={mode === 'pulley' ? 0.8 : 0.7}
        target={mode === 'pulley' ? [0, 3.5, 0] : [0, 1.6, 0]}
        maxDistance={70}
      />
      <directionalLight
        position={[8, 16, 10]}
        intensity={1.35}
        castShadow={settings.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.45} />
      {mode === 'lever' && <LeverScene {...props} />}
      {mode === 'pulley' && <PulleyScene {...props} />}
      {mode === 'gears' && <GearScene {...props} />}
    </>
  );
};

export default MachineScene3D;
