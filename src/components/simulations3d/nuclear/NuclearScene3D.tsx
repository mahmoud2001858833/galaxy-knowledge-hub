import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { NuclearMode, NuclearParams, NuclearStats } from '@/lib/sim-physics/nuclear';

interface NuclearScene3DProps {
  mode: NuclearMode;
  params: NuclearParams;
  stats: NuclearStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

type Sub = Pick<NuclearScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors' | 'resetKey'>;

/** Chain reaction: nuclei split and shoot neutrons that trigger further fissions. */
const FissionScene = ({ params, stats, playing, timeScale, showVectors, resetKey }: Sub) => {
  const { settings } = useSimQuality();
  const NUCLEI = Math.max(18, Math.min(Math.floor(settings.particles / 6), 60));
  const NEUTRONS = Math.max(30, Math.min(Math.floor(settings.particles / 3), 140));

  const nucleiMesh = useRef<THREE.InstancedMesh>(null);
  const neutronMesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const t = useRef(0);
  const last = useRef(resetKey);

  const sites = useMemo(
    () =>
      Array.from({ length: NUCLEI }, () => ({
        p: new THREE.Vector3((Math.random() - 0.5) * 18, 2 + Math.random() * 9, (Math.random() - 0.5) * 18),
        fireAt: 0.4 + Math.random() * 6,
      })),
    [NUCLEI, resetKey]
  );

  const neutrons = useMemo(
    () =>
      Array.from({ length: NEUTRONS }, (_, i) => {
        const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        return { origin: sites[i % sites.length].p, dir, birth: (i / NEUTRONS) * 6, speed: 3 + Math.random() * 3 };
      }),
    [NEUTRONS, sites]
  );

  const rate = Math.min(Math.max(params.multiplication, 0.2), 2.2);

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale;
    const cycle = 7;
    const tt = t.current % cycle;

    if (nucleiMesh.current) {
      sites.forEach((s, i) => {
        const fired = tt > s.fireAt;
        const pulse = fired ? Math.max(1.1 - (tt - s.fireAt) * 0.5, 0.35) : 1;
        dummy.position.copy(s.p);
        dummy.scale.setScalar(pulse);
        dummy.rotation.set(t.current * 0.4, t.current * 0.6, 0);
        dummy.updateMatrix();
        nucleiMesh.current!.setMatrixAt(i, dummy.matrix);
      });
      nucleiMesh.current.instanceMatrix.needsUpdate = true;
    }

    if (neutronMesh.current) {
      neutrons.forEach((n, i) => {
        const active = i / NEUTRONS < Math.min(rate / 2.2, 1);
        const age = Math.max(tt - n.birth * (1 / rate), 0);
        const d = age * n.speed;
        dummy.position.copy(n.origin).addScaledVector(n.dir, d);
        const visible = active && age > 0 && d < 22;
        dummy.scale.setScalar(visible ? 1 : 0.001);
        dummy.updateMatrix();
        neutronMesh.current!.setMatrixAt(i, dummy.matrix);
      });
      neutronMesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <SimStage size={44} ruler={false} />

      <instancedMesh ref={nucleiMesh} args={[undefined as any, undefined as any, NUCLEI]} castShadow>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial color="#22c55e" emissive="#15803d" emissiveIntensity={0.45} roughness={0.4} />
      </instancedMesh>

      <instancedMesh ref={neutronMesh} args={[undefined as any, undefined as any, NEUTRONS]}>
        <sphereGeometry args={[0.2, 10, 10]} />
        <meshStandardMaterial color="#f8fafc" emissive="#94a3b8" emissiveIntensity={0.6} />
      </instancedMesh>

      {showVectors && (
        <SimLabel3D position={[0, 14, 0]} variant={stats.critical ? 'accent' : 'muted'} distanceFactor={38}>
          k = {params.multiplication.toFixed(2)} — {stats.criticalityLabel}
        </SimLabel3D>
      )}
      <SimLabel3D position={[0, 12.4, 0]} distanceFactor={38}>
        نيوترونات الجيل {params.generations}: {stats.chainNeutrons.toExponential(2)}
      </SimLabel3D>
    </group>
  );
};

/** Fusion: deuterium and tritium orbiting into a hot plasma core producing helium + neutron. */
const FusionScene = ({ params, stats, playing, timeScale, resetKey }: Sub) => {
  const { settings } = useSimQuality();
  const COUNT = Math.max(24, Math.min(Math.floor(settings.particles / 4), 90));
  const ions = useRef<THREE.InstancedMesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const helium = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const t = useRef(0);
  const last = useRef(resetKey);

  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        r: 3 + Math.random() * 7,
        a: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * 4,
        s: 0.4 + Math.random() * 1.2,
      })),
    [COUNT]
  );

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale;
    const heat = Math.min(params.plasmaMK / 150, 2.2);

    if (ions.current) {
      seeds.forEach((s, i) => {
        const shrink = stats.ignited ? Math.max(1 - ((t.current * 0.25) % 1) * 0.7, 0.3) : 1;
        const ang = s.a + t.current * s.s * heat;
        const r = s.r * shrink * (1 / Math.max(params.confinement, 0.3)) * 0.9;
        dummy.position.set(Math.cos(ang) * r, 6 + s.y * shrink, Math.sin(ang) * r);
        dummy.scale.setScalar(0.9);
        dummy.updateMatrix();
        ions.current!.setMatrixAt(i, dummy.matrix);
      });
      ions.current.instanceMatrix.needsUpdate = true;
    }

    if (core.current) {
      const s = stats.ignited ? 1.6 + Math.sin(t.current * 6) * 0.25 : 0.7 + heat * 0.25;
      core.current.scale.setScalar(s);
      const mat = core.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = stats.ignited ? 2.4 : 0.5 + heat * 0.4;
    }
    if (helium.current) {
      helium.current.visible = stats.ignited;
      helium.current.position.x = ((t.current * 4) % 18) - 4;
      helium.current.rotation.y += delta * 2;
    }
  });

  return (
    <group>
      <SimStage size={44} ruler={false} />

      <mesh ref={core} position={[0, 6, 0]}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f97316" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 6, 0]} intensity={stats.ignited ? 6 : 2} color="#fb923c" distance={40} />

      <instancedMesh ref={ions} args={[undefined as any, undefined as any, COUNT]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.7} />
      </instancedMesh>

      <group ref={helium} position={[0, 6, 0]}>
        <Sphere args={[0.55, 20, 20]}>
          <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.8} />
        </Sphere>
        <SimLabel3D position={[0, 1.2, 0]} variant="accent" distanceFactor={26}>
          ⁴He + نيوترون (17.6 MeV)
        </SimLabel3D>
      </group>

      <SimLabel3D position={[0, 13, 0]} variant={stats.ignited ? 'accent' : 'muted'} distanceFactor={38}>
        {params.plasmaMK.toFixed(0)} مليون كلفن — {stats.ignited ? 'اشتعال الاندماج' : `مؤشر الاشتعال ${stats.ignitionScore.toFixed(2)}`}
      </SimLabel3D>
    </group>
  );
};

/** Radioactive decay: a shrinking cube of nuclei emitting alpha/beta/gamma trails. */
const DecayScene = ({ params, stats, playing, timeScale, resetKey }: Sub) => {
  const { settings } = useSimQuality();
  const COUNT = Math.max(60, Math.min(settings.particles, 260));
  const mesh = useRef<THREE.InstancedMesh>(null);
  const rays = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const t = useRef(0);
  const last = useRef(resetKey);

  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        p: new THREE.Vector3((Math.random() - 0.5) * 9, 4 + (Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9),
        dir: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        order: i / COUNT,
        phase: Math.random(),
      })),
    [COUNT]
  );

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale;
    const remaining = stats.remainingFraction;

    if (mesh.current) {
      seeds.forEach((s, i) => {
        const alive = s.order < remaining;
        dummy.position.copy(s.p);
        dummy.scale.setScalar(alive ? 0.34 : 0.001);
        dummy.updateMatrix();
        mesh.current!.setMatrixAt(i, dummy.matrix);
      });
      mesh.current.instanceMatrix.needsUpdate = true;
    }

    if (rays.current) {
      seeds.forEach((s, i) => {
        const decayed = s.order >= remaining;
        const prog = (t.current * 0.5 + s.phase) % 1;
        dummy.position.copy(s.p).addScaledVector(s.dir, prog * 12);
        dummy.scale.setScalar(decayed ? Math.max(0.22 * (1 - prog), 0.02) : 0.001);
        dummy.updateMatrix();
        rays.current!.setMatrixAt(i, dummy.matrix);
      });
      rays.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <SimStage size={40} ruler={false} />

      <instancedMesh ref={mesh} args={[undefined as any, undefined as any, COUNT]} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.45} />
      </instancedMesh>

      <instancedMesh ref={rays} args={[undefined as any, undefined as any, COUNT]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#f43f5e" emissive="#e11d48" emissiveIntensity={0.9} />
      </instancedMesh>

      <Line
        points={[
          [-6, 0.05, 6],
          [6, 0.05, 6],
        ]}
        color="#64748b"
        lineWidth={2}
        dashed
        dashSize={0.4}
        gapSize={0.3}
      />

      <SimLabel3D position={[0, 12, 0]} variant="accent" distanceFactor={38}>
        المتبقي {(stats.remainingFraction * 100).toFixed(2)}% — {stats.halfLivesPassed.toFixed(2)} عمر نصفي
      </SimLabel3D>
      <SimLabel3D position={[0, 10.6, 0]} variant="muted" distanceFactor={38}>
        الكتلة المتبقية {stats.remainingGrams.toFixed(3)} غم — النشاط {stats.activityBq.toExponential(2)} بيكريل
      </SimLabel3D>
    </group>
  );
};

export const NuclearScene3D = (props: NuclearScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls view={view} autoRotate={autoRotate} target={[0, 5, 0]} maxDistance={90} />
      <directionalLight position={[14, 22, 16]} intensity={1.2} castShadow={settings.shadows} shadow-mapSize={[1024, 1024]} />
      <ambientLight intensity={0.45} />
      {mode === 'fission' && <FissionScene {...props} />}
      {mode === 'fusion' && <FusionScene {...props} />}
      {mode === 'decay' && <DecayScene {...props} />}
    </>
  );
};

export default NuclearScene3D;
