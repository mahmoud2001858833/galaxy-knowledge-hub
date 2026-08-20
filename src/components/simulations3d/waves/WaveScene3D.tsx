import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { SimStage, SimControls, SimLabel3D, useSimQuality } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import { WaveMode, WaveParams, WaveStats } from '@/lib/sim-physics/waves';

interface WaveScene3DProps {
  mode: WaveMode;
  params: WaveParams;
  stats: WaveStats;
  playing: boolean;
  timeScale: number;
  showVectors: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

/** Animated 3D string / travelling wave with medium particles. */
const TravellingWave = ({
  params,
  stats,
  playing,
  timeScale,
  showVectors,
  resetKey,
}: Pick<WaveScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'showVectors' | 'resetKey'>) => {
  const { settings } = useSimQuality();
  const t = useRef(0);
  const last = useRef(resetKey);
  const lineRef = useRef<any>(null);
  const particles = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const N = Math.max(60, Math.min(settings.segments * 4, 220));
  const LENGTH = 20;
  const count = Math.max(14, Math.floor(settings.particles / 12));

  const basePoints = useMemo(
    () => Array.from({ length: N + 1 }, (_, i) => new THREE.Vector3((i / N) * LENGTH - LENGTH / 2, 0, 0)),
    [N]
  );

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale;
    const k = stats.waveNumber;
    const w = stats.angularFreq;

    const pts = basePoints.map((v, i) => {
      const x = (i / N) * LENGTH;
      const env = params.amplitude * Math.exp(-params.damping * x);
      v.set(x - LENGTH / 2, env * Math.sin(k * x - w * t.current) * 3, 0);
      return v;
    });
    lineRef.current?.geometry?.setFromPoints(pts);

    if (particles.current) {
      for (let i = 0; i < count; i++) {
        const x = (i / (count - 1)) * LENGTH;
        const env = params.amplitude * Math.exp(-params.damping * x);
        dummy.position.set(x - LENGTH / 2, env * Math.sin(k * x - w * t.current) * 3, 0);
        dummy.updateMatrix();
        particles.current.setMatrixAt(i, dummy.matrix);
      }
      particles.current.instanceMatrix.needsUpdate = true;
    }
  });

  const wl = Math.min(stats.wavelength, LENGTH);

  return (
    <group position={[0, 4, 0]}>
      <Line ref={lineRef} points={basePoints} color="#38bdf8" lineWidth={3} />

      <instancedMesh ref={particles} args={[undefined as any, undefined as any, count]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#f472b6" emissive="#be185d" emissiveIntensity={0.4} />
      </instancedMesh>

      {/* equilibrium axis */}
      <Line
        points={[
          [-LENGTH / 2, 0, 0],
          [LENGTH / 2, 0, 0],
        ]}
        color="#64748b"
        lineWidth={1}
        dashed
        dashSize={0.4}
        gapSize={0.3}
      />

      {/* wavelength marker */}
      <Line
        points={[
          [-LENGTH / 2, -3.2, 0],
          [-LENGTH / 2 + wl, -3.2, 0],
        ]}
        color="#facc15"
        lineWidth={3}
      />
      <SimLabel3D position={[-LENGTH / 2 + wl / 2, -3.9, 0]} variant="accent" distanceFactor={22}>
        λ = {stats.wavelength.toFixed(2)} م
      </SimLabel3D>

      {showVectors && (
        <>
          <Line
            points={[
              [LENGTH / 2 - 1, 0, 0],
              [LENGTH / 2 + 1.4, 0, 0],
            ]}
            color="#22c55e"
            lineWidth={3}
          />
          <SimLabel3D position={[LENGTH / 2 + 2, 0.6, 0]} distanceFactor={22}>
            v = {params.waveSpeed.toFixed(0)} م/ث
          </SimLabel3D>
          <Line
            points={[
              [-LENGTH / 2, 0, 0],
              [-LENGTH / 2, params.amplitude * 3, 0],
            ]}
            color="#f97316"
            lineWidth={3}
          />
          <SimLabel3D position={[-LENGTH / 2 - 1.4, params.amplitude * 1.6, 0]} variant="muted" distanceFactor={22}>
            السعة A
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

/** Expanding spherical wavefronts from a moving source (Doppler / Mach cone). */
const DopplerScene = ({
  params,
  stats,
  playing,
  timeScale,
  resetKey,
}: Pick<WaveScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'resetKey'>) => {
  const RINGS = 9;
  const S = 0.03; // world units per metre
  const src = useRef<THREE.Group>(null);
  const obs = useRef<THREE.Group>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const emitted = useRef<{ x: number; age: number }[]>([]);
  const t = useRef(0);
  const last = useRef(resetKey);

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
      emitted.current = [];
    }
    const dt = playing ? delta * timeScale : 0;
    t.current += dt;

    const span = 24;
    const sx = ((t.current * params.sourceSpeed * S) % span) - span / 2;
    if (src.current) src.current.position.x = sx;
    if (obs.current) obs.current.position.x = span / 2 - 2;

    // emit a new wavefront every period
    const period = 1 / Math.max(params.sourceFrequency / 60, 0.5);
    if (dt > 0) {
      const lastRing = emitted.current[emitted.current.length - 1];
      if (!lastRing || lastRing.age > period) emitted.current.push({ x: sx, age: 0 });
      emitted.current.forEach((r) => (r.age += dt));
      if (emitted.current.length > RINGS) emitted.current.shift();
    }

    ringRefs.current.forEach((m, i) => {
      const r = emitted.current[i];
      if (!m) return;
      if (!r) {
        m.visible = false;
        return;
      }
      m.visible = true;
      const radius = Math.max(r.age * params.mediumSpeed * S, 0.05);
      m.position.set(r.x, 0.4, 0);
      m.scale.setScalar(radius);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0.5 - r.age * 0.12, 0);
    });
  });

  return (
    <group>
      <SimStage size={60} ruler rulerLength={12} rulerStep={4} unitScale={Math.round(1 / S)} rulerUnit="م" />

      {Array.from({ length: RINGS }).map((_, i) => (
        <mesh key={i} ref={(el) => (ringRefs.current[i] = el)} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.97, 1, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <group ref={src} position={[0, 0.6, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.7, 0.7]} />
          <meshStandardMaterial color="#ef4444" metalness={0.4} roughness={0.35} />
        </mesh>
        <SimLabel3D position={[0, 1.2, 0]} variant="accent" distanceFactor={26}>
          المصدر {params.sourceFrequency.toFixed(0)} هرتز
          {stats.sonicBoom ? ' — اختراق حاجز الصوت' : ''}
        </SimLabel3D>
      </group>

      <group ref={obs} position={[10, 0.7, 0]}>
        <Sphere args={[0.4, 20, 20]}>
          <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.3} />
        </Sphere>
        <SimLabel3D position={[0, 1.1, 0]} distanceFactor={26}>
          المُراقب: {stats.approachFreq.toFixed(1)} هرتز
        </SimLabel3D>
      </group>

      <SimLabel3D position={[-10, 3, 0]} variant="muted" distanceFactor={30}>
        ماخ = {stats.machNumber.toFixed(2)}
      </SimLabel3D>
    </group>
  );
};

/** Two coherent sources on a water surface — interference pattern. */
const InterferenceScene = ({
  params,
  stats,
  playing,
  timeScale,
  resetKey,
}: Pick<WaveScene3DProps, 'params' | 'stats' | 'playing' | 'timeScale' | 'resetKey'>) => {
  const { settings } = useSimQuality();
  const seg = Math.max(48, Math.min(settings.segments * 2, 110));
  const SIZE = 22;
  const meshRef = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  const last = useRef(resetKey);

  const geometry = useMemo(() => new THREE.PlaneGeometry(SIZE, SIZE, seg, seg), [seg]);

  const gap = params.sourceGap;
  const s1 = useMemo(() => new THREE.Vector2(-gap / 2, 0), [gap]);
  const s2 = useMemo(() => new THREE.Vector2(gap / 2, 0), [gap]);

  useFrame((_, delta) => {
    if (last.current !== resetKey) {
      last.current = resetKey;
      t.current = 0;
    }
    if (playing) t.current += delta * timeScale;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    const k = stats.waveNumber;
    const phase = (params.phaseDeg * Math.PI) / 180;
    const wA = 2 * Math.PI * params.freqA;
    const wB = 2 * Math.PI * params.freqB;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r1 = Math.hypot(x - s1.x, y - s1.y);
      const r2 = Math.hypot(x - s2.x, y - s2.y);
      const a1 = (params.amplitude / (1 + 0.25 * r1)) * Math.sin(k * r1 - wA * t.current);
      const a2 = (params.amplitude / (1 + 0.25 * r2)) * Math.sin(k * r2 - wB * t.current + phase);
      pos.setZ(i, (a1 + a2) * 3);
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.2, 0]}>
        <meshStandardMaterial
          color="#0ea5e9"
          metalness={0.35}
          roughness={0.25}
          side={THREE.DoubleSide}
          transparent
          opacity={0.92}
          wireframe={false}
        />
      </mesh>

      {[s1, s2].map((s, i) => (
        <group key={i} position={[s.x, 1.6, -s.y]}>
          <Sphere args={[0.35, 18, 18]}>
            <meshStandardMaterial
              color={i === 0 ? '#f97316' : '#a855f7'}
              emissive={i === 0 ? '#ea580c' : '#7e22ce'}
              emissiveIntensity={0.5}
            />
          </Sphere>
          <SimLabel3D position={[0, 1, 0]} distanceFactor={26}>
            المصدر {i === 0 ? 'أ' : 'ب'} — {(i === 0 ? params.freqA : params.freqB).toFixed(1)} هرتز
          </SimLabel3D>
        </group>
      ))}

      <SimLabel3D position={[0, 5, -SIZE / 2]} variant={stats.constructive ? 'accent' : 'muted'} distanceFactor={34}>
        {stats.constructive ? 'تداخل بنّاء' : 'تداخل هدّام جزئي'} — نبضات {stats.beatFrequency.toFixed(2)} هرتز
      </SimLabel3D>
    </group>
  );
};

export const WaveScene3D = (props: WaveScene3DProps) => {
  const { mode, view, autoRotate } = props;
  const { settings } = useSimQuality();

  return (
    <>
      <SimControls
        view={view}
        autoRotate={autoRotate}
        scale={mode === 'wave' ? 1.1 : 1}
        target={mode === 'wave' ? [0, 4, 0] : [0, 1.5, 0]}
        maxDistance={90}
      />
      <directionalLight
        position={[10, 18, 12]}
        intensity={1.3}
        castShadow={settings.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.45} />
      {mode === 'wave' && <TravellingWave {...props} />}
      {mode === 'doppler' && <DopplerScene {...props} />}
      {mode === 'interference' && <InterferenceScene {...props} />}
    </>
  );
};

export default WaveScene3D;
