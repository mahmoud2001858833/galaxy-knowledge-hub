import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { EMWaveMode, EMWaveParams, EMWaveStats, bandList } from '@/lib/sim-physics/emwaves';

interface EMWavesScene3DProps {
  mode: EMWaveMode;
  params: EMWaveParams;
  stats: EMWaveStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

type Sub = Pick<EMWavesScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors' | 'resetKey'>;

const LENGTH = 26;

/** E ⟂ B ⟂ k travelling wave with field vector combs. */
const PropagationScene = ({ params, stats, playing, timeScale, showVectors, resetKey }: Sub) => {
  const { settings } = useSimQuality();
  const N = Math.max(80, Math.min(settings.segments * 4, 240));
  const COMBS = Math.max(12, Math.floor(settings.particles / 20));

  const t = useRef(0);
  const last = useRef(resetKey);
  const eLine = useRef<any>(null);
  const bLine = useRef<any>(null);
  const eBars = useRef<THREE.InstancedMesh>(null);
  const bBars = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const base = useMemo(
    () => Array.from({ length: N + 1 }, (_, i) => new THREE.Vector3((i / N) * LENGTH - LENGTH / 2, 0, 0)),
    [N]
  );
  const baseB = useMemo(
    () => Array.from({ length: N + 1 }, (_, i) => new THREE.Vector3((i / N) * LENGTH - LENGTH / 2, 0, 0)),
    [N]
  );

  // visual wave number: 2π / (visual wavelength), keep 1.5–6 cycles on screen
  const kVis = useMemo(() => {
    const cycles = 3;
    return (2 * Math.PI * cycles) / LENGTH;
  }, []);

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale * (1 / params.refractiveIndex);
    const A = params.amplitude * 2.6;
    const phase = t.current * 3;

    const eP = base.map((v, i) => {
      const x = (i / N) * LENGTH - LENGTH / 2;
      v.set(x, A * Math.sin(kVis * (x + LENGTH / 2) - phase), 0);
      return v;
    });
    eLine.current?.geometry?.setFromPoints(eP);

    const bP = baseB.map((v, i) => {
      const x = (i / N) * LENGTH - LENGTH / 2;
      v.set(x, 0, A * Math.sin(kVis * (x + LENGTH / 2) - phase));
      return v;
    });
    bLine.current?.geometry?.setFromPoints(bP);

    const fill = (mesh: THREE.InstancedMesh | null, axis: 'y' | 'z') => {
      if (!mesh) return;
      for (let i = 0; i < COMBS; i++) {
        const x = (i / (COMBS - 1)) * LENGTH - LENGTH / 2;
        const val = A * Math.sin(kVis * (x + LENGTH / 2) - phase);
        const h = Math.max(Math.abs(val), 0.001);
        dummy.position.set(x, axis === 'y' ? val / 2 : 0, axis === 'z' ? val / 2 : 0);
        dummy.rotation.set(axis === 'z' ? Math.PI / 2 : 0, 0, 0);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    };
    fill(eBars.current, 'y');
    fill(bBars.current, 'z');
  });

  return (
    <group position={[0, 5, 0]}>
      <Line ref={eLine} points={base} color={stats.visibleColor === '#94a3b8' ? '#38bdf8' : stats.visibleColor} lineWidth={4} />
      <Line ref={bLine} points={baseB} color="#f472b6" lineWidth={4} />

      {showVectors && (
        <>
          <instancedMesh ref={eBars} args={[undefined as any, undefined as any, COMBS]}>
            <cylinderGeometry args={[0.045, 0.045, 1, 8]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
          </instancedMesh>
          <instancedMesh ref={bBars} args={[undefined as any, undefined as any, COMBS]}>
            <cylinderGeometry args={[0.045, 0.045, 1, 8]} />
            <meshStandardMaterial color="#f472b6" emissive="#be185d" emissiveIntensity={0.5} />
          </instancedMesh>
        </>
      )}

      {/* propagation axis k */}
      <Line
        points={[
          [-LENGTH / 2 - 1, 0, 0],
          [LENGTH / 2 + 2, 0, 0],
        ]}
        color="#94a3b8"
        lineWidth={2}
        dashed
        dashSize={0.4}
        gapSize={0.25}
      />
      <SimLabel3D position={[LENGTH / 2 + 3.2, 0, 0]} variant="accent" distanceFactor={28}>
        اتجاه الانتشار k — c/n = {(stats.speedInMedium / 1e8).toFixed(2)}×10⁸ م/ث
      </SimLabel3D>
      <SimLabel3D position={[-LENGTH / 2, params.amplitude * 3.4, 0]} distanceFactor={28}>
        المجال الكهربائي E ({stats.eField.toFixed(0)} فولت/م)
      </SimLabel3D>
      <SimLabel3D position={[-LENGTH / 2, 0, params.amplitude * 3.4]} variant="muted" distanceFactor={28}>
        المجال المغناطيسي B ({(stats.bField * 1e9).toFixed(2)} نانوتسلا)
      </SimLabel3D>
      <SimLabel3D position={[0, -4.2, 0]} variant={stats.ionizing ? 'accent' : 'muted'} distanceFactor={32}>
        {stats.bandLabel} — λ = {stats.wavelength >= 1 ? `${stats.wavelength.toFixed(2)} م` : `${stats.wavelengthNm.toExponential(2)} نانومتر`}
      </SimLabel3D>
    </group>
  );
};

/** Spectrum ladder: photon energy bars for every band with a live marker. */
const SpectrumScene = ({ stats, playing, timeScale, resetKey }: Sub) => {
  const marker = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const last = useRef(resetKey);

  const bands = useMemo(
    () =>
      bandList.map((b, i) => ({
        ...b,
        x: (i - (bandList.length - 1) / 2) * 3.4,
        color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#8b5cf6', '#3b82f6', '#e2e8f0'][i],
        height: 1.2 + i * 1.5,
      })),
    []
  );

  const activeX = bands.find((b) => b.id === stats.band)?.x ?? 0;

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale;
    if (marker.current) {
      marker.current.position.x += (activeX - marker.current.position.x) * 0.12;
      marker.current.position.y = 12 + Math.sin(t.current * 3) * 0.4;
      marker.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group>
      <SimStage size={44} ruler={false} />
      {bands.map((b) => (
        <group key={b.id} position={[b.x, 0, 0]}>
          <mesh position={[0, b.height / 2, 0]} castShadow>
            <boxGeometry args={[2.2, b.height, 2.2]} />
            <meshStandardMaterial
              color={b.color}
              emissive={b.color}
              emissiveIntensity={stats.band === b.id ? 0.85 : 0.15}
              metalness={0.3}
              roughness={0.35}
            />
          </mesh>
          <SimLabel3D
            position={[0, b.height + 0.9, 0]}
            variant={stats.band === b.id ? 'accent' : 'muted'}
            distanceFactor={34}
          >
            {b.label}
          </SimLabel3D>
        </group>
      ))}

      <mesh ref={marker} position={[activeX, 12, 0]}>
        <octahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={0.9} />
      </mesh>

      <SimLabel3D position={[0, 14.4, 0]} variant="accent" distanceFactor={40}>
        طاقة الفوتون = {stats.photonEnergyEv < 1 ? stats.photonEnergyEv.toExponential(3) : stats.photonEnergyEv.toFixed(3)} إلكترون فولت
        {stats.ionizing ? ' — إشعاع مؤيّن' : ' — إشعاع غير مؤيّن'}
      </SimLabel3D>
    </group>
  );
};

/** Photon beam hitting a metal plate through a polarizer: Malus + photoelectric effect. */
const InteractionScene = ({ params, stats, playing, timeScale, resetKey }: Sub) => {
  const { settings } = useSimQuality();
  const COUNT = Math.max(16, Math.floor(settings.particles / 8));
  const photons = useRef<THREE.InstancedMesh>(null);
  const electrons = useRef<THREE.InstancedMesh>(null);
  const polarizer = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const t = useRef(0);
  const last = useRef(resetKey);

  const seeds = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => ({ off: i / COUNT, y: (Math.random() - 0.5) * 2, z: (Math.random() - 0.5) * 2 })),
    [COUNT]
  );

  const transmitFrac = Math.cos((params.polarizerDeg * Math.PI) / 180) ** 2;

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale;

    if (polarizer.current) polarizer.current.rotation.x = (params.polarizerDeg * Math.PI) / 180;

    if (photons.current) {
      for (let i = 0; i < COUNT; i++) {
        const s = seeds[i];
        const prog = (t.current * 0.35 + s.off) % 1;
        const x = -14 + prog * 26;
        const passes = i / COUNT < transmitFrac;
        const alive = x < 0 || passes;
        dummy.position.set(alive ? x : 0, 3 + s.y, s.z);
        dummy.scale.setScalar(alive ? 1 : 0.001);
        dummy.updateMatrix();
        photons.current.setMatrixAt(i, dummy.matrix);
      }
      photons.current.instanceMatrix.needsUpdate = true;
    }

    if (electrons.current) {
      for (let i = 0; i < COUNT; i++) {
        const s = seeds[i];
        const emit = stats.photoelectric && i / COUNT < transmitFrac;
        const prog = (t.current * (0.3 + stats.ejectedElectronEv * 0.02) + s.off) % 1;
        dummy.position.set(12 + prog * 6, 3 + s.y + prog * 2.2, s.z + prog * 1.4);
        dummy.scale.setScalar(emit ? 1 : 0.001);
        dummy.updateMatrix();
        electrons.current.setMatrixAt(i, dummy.matrix);
      }
      electrons.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <SimStage size={44} ruler rulerLength={12} rulerStep={4} unitScale={1} rulerUnit="وحدة" />

      {/* source */}
      <group position={[-15, 3, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[1, 1.3, 2.4, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
        <SimLabel3D position={[0, 2.2, 0]} distanceFactor={30}>
          مصدر {stats.bandLabel}
        </SimLabel3D>
      </group>

      {/* polarizer */}
      <group position={[0, 3, 0]}>
        <mesh ref={polarizer}>
          <torusGeometry args={[2.4, 0.16, 12, 40]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.5} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[4.4, 4.4]} />
          <meshStandardMaterial color="#0ea5e9" transparent opacity={0.14} side={THREE.DoubleSide} />
        </mesh>
        <SimLabel3D position={[0, 3.6, 0]} variant="accent" distanceFactor={30}>
          مستقطِب {params.polarizerDeg.toFixed(0)}° — نفاذية {(transmitFrac * 100).toFixed(1)}%
        </SimLabel3D>
      </group>

      {/* metal target */}
      <group position={[12, 3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 5, 5]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        <SimLabel3D position={[0, 3.6, 0]} variant={stats.photoelectric ? 'accent' : 'muted'} distanceFactor={30}>
          {stats.photoelectric
            ? `انبعاث كهروضوئي — طاقة الإلكترون ${stats.ejectedElectronEv.toFixed(2)} eV`
            : `لا انبعاث — الفوتون أقل من دالة الشغل ${params.workFunctionEv.toFixed(2)} eV`}
        </SimLabel3D>
      </group>

      <instancedMesh ref={photons} args={[undefined as any, undefined as any, COUNT]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial
          color={stats.visibleColor === '#94a3b8' ? '#fbbf24' : stats.visibleColor}
          emissive={stats.visibleColor === '#94a3b8' ? '#f59e0b' : stats.visibleColor}
          emissiveIntensity={0.8}
        />
      </instancedMesh>

      <instancedMesh ref={electrons} args={[undefined as any, undefined as any, COUNT]}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.7} />
      </instancedMesh>

      <Torus args={[0.01, 0.01, 3, 3]} />
      <Sphere args={[0.01, 3, 3]} />
    </group>
  );
};

export const EMWavesScene3D = (props: EMWavesScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls
        view={view}
        autoRotate={autoRotate}
        scale={mode === 'propagation' ? 1.15 : 1}
        target={mode === 'propagation' ? [0, 5, 0] : [0, 4, 0]}
        maxDistance={95}
      />
      <directionalLight position={[12, 20, 14]} intensity={1.25} castShadow={settings.shadows} shadow-mapSize={[1024, 1024]} />
      <ambientLight intensity={0.5} />
      {mode === 'propagation' && <PropagationScene {...props} />}
      {mode === 'spectrum' && <SpectrumScene {...props} />}
      {mode === 'interaction' && <InteractionScene {...props} />}
    </>
  );
};

export default EMWavesScene3D;
