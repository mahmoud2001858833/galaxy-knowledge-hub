import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage } from '@/components/sim3d';
import {
  heartGeometry,
  lungGeometry,
  brainGeometry,
  cerebellumGeometry,
  kidneyGeometry,
  stomachGeometry,
  liverGeometry,
  muscleGeometry,
  boneGeometry,
  tissueMaterial,
} from './anatomy';
import type { SimView } from '@/components/sim3d';
import type { BodyParams, BodyStats, BodySystem } from '@/lib/sim-physics/humanbody';

interface BodyScene3DProps {
  system: BodySystem;
  params: BodyParams;
  stats: BodyStats;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
  onSelectOrgan?: (id: string) => void;
  selectedOrgan?: string;
}

/** Built once and shared by every organ mesh. */
const GEO = {
  heart: heartGeometry(),
  lungL: lungGeometry(-1),
  lungR: lungGeometry(1),
  brain: brainGeometry(),
  cerebellum: cerebellumGeometry(),
  kidney: kidneyGeometry(),
  stomach: stomachGeometry(),
  liver: liverGeometry(),
  muscleBelly: muscleGeometry(1, 3.4),
  muscleLong: muscleGeometry(0.78, 3.6),
  humerus: boneGeometry(5),
  radius: boneGeometry(4.2),
};

const rand = (s: number) => {
  const x = Math.sin(s * 91.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Cardiac contraction envelope: fast systole, slower diastole. */
const cardiacPhase = (u: number) => {
  if (u < 0.35) return Math.sin((u / 0.35) * Math.PI) ** 1.5;
  return 0;
};

/* ------------------------------------------------------------------ */
/* Circulatory                                                         */
/* ------------------------------------------------------------------ */

const heartCurve = (radius: number, y: number, offsetX: number) =>
  new THREE.CatmullRomCurve3(
    Array.from({ length: 40 }, (_, i) => {
      const a = (i / 39) * Math.PI * 2;
      return new THREE.Vector3(offsetX + Math.cos(a) * radius, y + Math.sin(a) * radius * 1.35, Math.sin(a * 2) * 0.9);
    }),
    true
  );

const Circulatory = ({ stats, params, playing, timeScale, showLabels, onSelect, selected }: {
  stats: BodyStats;
  params: BodyParams;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
  onSelect?: (id: string) => void;
  selected?: string;
}) => {
  const t = useRef(0);
  const ventricles = useRef<THREE.Group>(null);
  const atria = useRef<THREE.Group>(null);
  const oxyRef = useRef<THREE.Group>(null);
  const deoxyRef = useRef<THREE.Group>(null);

  const systemicLoop = useMemo(() => heartCurve(6.2, 4.5, 6.5), []);
  const pulmonaryLoop = useMemo(() => heartCurve(4.6, 5.6, -6.2), []);

  useFrame((_, d) => {
    if (playing) t.current += d * timeScale * (params.heartRate / 60);
    const u = t.current % 1;
    const squeeze = cardiacPhase(u);
    if (ventricles.current) {
      const s = 1 - squeeze * 0.22;
      ventricles.current.scale.set(s, 1 - squeeze * 0.14, s);
    }
    if (atria.current) {
      const a = 1 - Math.max(0, Math.sin(((u + 0.82) % 1) * Math.PI * 2)) * 0.16;
      atria.current.scale.set(a, a, a);
    }
    const flow = 0.15 + (stats.cardiacOutput / 12) * 0.85;
    if (oxyRef.current) {
      oxyRef.current.children.forEach((c, i) => {
        const p = systemicLoop.getPointAt(((t.current * flow + i / oxyRef.current!.children.length) % 1 + 1) % 1);
        c.position.copy(p);
      });
    }
    if (deoxyRef.current) {
      deoxyRef.current.children.forEach((c, i) => {
        const p = pulmonaryLoop.getPointAt(((t.current * flow * 1.15 + i / deoxyRef.current!.children.length) % 1 + 1) % 1);
        c.position.copy(p);
      });
    }
  });

  const chamber = (
    id: string,
    pos: [number, number, number],
    scale: [number, number, number],
    color: string,
    emissive: number
  ) => (
    <mesh
      position={pos}
      scale={scale}
      castShadow
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
      }}
    >
      <sphereGeometry args={[1, 40, 30]} />
      <meshPhysicalMaterial {...tissueMaterial(color, color, selected === id ? 0.75 : emissive)} />
    </mesh>
  );

  return (
    <group position={[0, 0.5, 0]}>
      {/* pulmonary (blue) loop tube */}
      <mesh><tubeGeometry args={[pulmonaryLoop, 64, 0.28, 12, true]} />
        <meshStandardMaterial color="#1d4ed8" transparent opacity={0.35} emissive="#3b82f6" emissiveIntensity={0.2} />
      </mesh>
      {/* systemic (red) loop tube */}
      <mesh><tubeGeometry args={[systemicLoop, 64, 0.3, 12, true]} />
        <meshStandardMaterial color="#b91c1c" transparent opacity={0.35} emissive="#ef4444" emissiveIntensity={0.2} />
      </mesh>

      {/* lungs on the pulmonary side */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={s > 0 ? GEO.lungR : GEO.lungL} position={[-6.2 + s * 2.1, 10.5, 0]} scale={[1.4, 1.5, 1.25]}>
          <meshPhysicalMaterial
            {...tissueMaterial('#f9a8d4', '#fb7185', 0.1, 0.38)}
            transmission={0.6}
            thickness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* body tissue block on the systemic side */}
      <mesh position={[12.9, 4.5, 0]} scale={[1.6, 2.4, 1.4]}>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.85} transparent opacity={0.45} />
      </mesh>

      {/* heart */}
      <group position={[0, 5.4, 0]}>
        <group ref={atria}>
          {chamber('ra', [-1.35, 1.75, 0], [1.25, 0.95, 1.1], '#3b82f6', 0.3)}
          {chamber('la', [1.35, 1.75, 0], [1.25, 0.95, 1.1], '#ef4444', 0.3)}
        </group>
        <group ref={ventricles}>
          {/* myocardium shell */}
          <mesh geometry={GEO.heart} position={[0, -0.1, 0]} scale={[2.5, 2.2, 2.1]} castShadow>
            <meshPhysicalMaterial
              {...tissueMaterial('#9f1239', '#ef4444', 0.12, 0.34)}
              transmission={0.35}
              thickness={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
          {chamber('rv', [-1.5, -0.55, 0], [1.5, 1.7, 1.35], '#2563eb', 0.32)}
          {chamber('lv', [1.5, -0.6, 0], [1.75, 1.95, 1.5], '#dc2626', 0.36)}
        </group>
        {/* septum */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.22, 4, 2.2]} />
          <meshStandardMaterial color="#9f1239" roughness={0.6} />
        </mesh>
        {/* aorta + pulmonary artery */}
        <mesh position={[1.9, 3.1, 0]} rotation={[0, 0, -0.5]}>
          <torusGeometry args={[1.5, 0.4, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[-1.9, 3.1, 0]} rotation={[0, 0, Math.PI + 0.5]}>
          <torusGeometry args={[1.3, 0.34, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.25} />
        </mesh>
      </group>

      {/* capillary exchange bed */}
      <group
        position={[12.9, 4.5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.('cap');
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[0, -1.8 + i * 0.4, 0]}>
            <torusGeometry args={[1.1, 0.06, 8, 24]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>

      {/* red cells */}
      <group ref={oxyRef}>
        {Array.from({ length: 26 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.24, 10, 10]} />
            <meshStandardMaterial
              color={stats.spo2 > 92 ? '#ef4444' : '#9f1239'}
              emissive="#ef4444"
              emissiveIntensity={0.35 + (stats.spo2 / 100) * 0.5}
            />
          </mesh>
        ))}
      </group>
      <group ref={deoxyRef}>
        {Array.from({ length: 22 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.22, 10, 10]} />
            <meshStandardMaterial color="#1e40af" emissive="#3b82f6" emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>

      {showLabels && (
        <>
          <SimLabel3D position={[0, 9.6, 0]} variant="accent" distanceFactor={46}>
            القلب — {params.heartRate} نبضة/د · النتاج {stats.cardiacOutput.toFixed(1)} ل/د
          </SimLabel3D>
          <SimLabel3D position={[-8.5, 13.4, 0]} distanceFactor={46}>
            الدورة الرئوية: تحميل O₂
          </SimLabel3D>
          <SimLabel3D position={[13.4, 8.4, 0]} distanceFactor={46}>
            الدورة الجهازية: تسليم O₂ للأنسجة
          </SimLabel3D>
          <SimLabel3D position={[4.6, 3.2, 0]} variant="accent" distanceFactor={46}>
            {stats.systolic.toFixed(0)}/{stats.diastolic.toFixed(0)} mmHg
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Respiratory                                                         */
/* ------------------------------------------------------------------ */

const Respiratory = ({ stats, params, playing, timeScale, showLabels, onSelect, selected }: {
  stats: BodyStats;
  params: BodyParams;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
  onSelect?: (id: string) => void;
  selected?: string;
}) => {
  const t = useRef(0);
  const lungs = useRef<THREE.Group>(null);
  const diaphragm = useRef<THREE.Mesh>(null);
  const air = useRef<THREE.Group>(null);
  const o2 = useRef<THREE.Group>(null);
  const co2 = useRef<THREE.Group>(null);

  useFrame((_, d) => {
    if (playing) t.current += d * timeScale * (params.breathRate / 60);
    const u = t.current % 1;
    const insp = u < 0.4 ? Math.sin((u / 0.4) * (Math.PI / 2)) : Math.cos(((u - 0.4) / 0.6) * (Math.PI / 2));
    const amp = 0.12 + (params.tidalVolume / 2500) * 0.5;
    if (lungs.current) {
      const s = 1 + insp * amp;
      lungs.current.scale.set(s, 1 + insp * amp * 1.25, s);
    }
    if (diaphragm.current) diaphragm.current.position.y = 2.4 - insp * 1.1;
    if (air.current) {
      air.current.children.forEach((c, i) => {
        const u2 = (t.current * 1.6 + rand(i)) % 1;
        c.position.set((rand(i + 2) - 0.5) * 0.9, 15.5 - u2 * 5.5, (rand(i + 3) - 0.5) * 0.9);
        c.visible = insp > 0.1;
      });
    }
    if (o2.current) {
      o2.current.children.forEach((c, i) => {
        const u2 = (t.current * 1.1 + rand(i + 7)) % 1;
        const base = i % 2 === 0 ? -3.6 : 3.6;
        c.position.set(base + (i % 2 === 0 ? 1 : -1) * u2 * 2.4, 8.2 + (rand(i) - 0.5) * 3.4, (rand(i + 5) - 0.5) * 2);
        c.visible = i / 20 < stats.spo2 / 100;
      });
    }
    if (co2.current) {
      co2.current.children.forEach((c, i) => {
        const u2 = (t.current * 0.9 + rand(i + 13)) % 1;
        const base = i % 2 === 0 ? -1.2 : 1.2;
        c.position.set(base - (i % 2 === 0 ? 1 : -1) * u2 * 2.4, 7.6 + (rand(i + 1) - 0.5) * 3.2, (rand(i + 8) - 0.5) * 2);
      });
    }
  });

  const alveoliCluster = (sign: number) => (
    <group
      position={[sign * 3.4, 7.4, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.('alveoli');
      }}
    >
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.5, Math.sin(a) * 1.9, Math.sin(a * 2) * 0.8]}>
            <sphereGeometry args={[0.62, 18, 14]} />
            <meshPhysicalMaterial
              color="#38bdf8"
              transparent
              opacity={0.55}
              transmission={0.5}
              emissive="#0ea5e9"
              emissiveIntensity={selected === 'alveoli' ? 0.6 : 0.2 + (stats.spo2 / 100) * 0.25}
            />
          </mesh>
        );
      })}
    </group>
  );

  return (
    <group>
      {/* trachea */}
      <mesh
        position={[0, 12.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.('trachea');
        }}
      >
        <cylinderGeometry args={[0.62, 0.62, 5.2, 20]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} emissive="#94a3b8" emissiveIntensity={selected === 'trachea' ? 0.4 : 0.05} />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[0, 10.2 + i * 0.58, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.68, 0.1, 8, 24]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
      ))}

      {/* bronchi */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * 1.5, 9.4, 0]}
          rotation={[0, 0, s * 0.75]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.('bronchi');
          }}
        >
          <cylinderGeometry args={[0.34, 0.44, 3.1, 16]} />
          <meshStandardMaterial color="#94a3b8" emissive="#64748b" emissiveIntensity={selected === 'bronchi' ? 0.5 : 0.05} />
        </mesh>
      ))}

      {/* lungs */}
      <group ref={lungs} position={[0, 7.4, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} geometry={s > 0 ? GEO.lungR : GEO.lungL} position={[s * 3.4, 0, 0]} scale={[2.0, 2.1, 1.85]}>
            <meshPhysicalMaterial
              {...tissueMaterial('#fb7185', '#f43f5e', 0.08, 0.26)}
              transmission={0.7}
              thickness={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {alveoliCluster(-1)}
        {alveoliCluster(1)}
      </group>

      {/* diaphragm */}
      <mesh
        ref={diaphragm}
        position={[0, 2.4, 0]}
        rotation={[Math.PI, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.('diaphragm');
        }}
      >
        <sphereGeometry args={[5.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
        <meshStandardMaterial
          color="#f97316"
          side={THREE.DoubleSide}
          roughness={0.6}
          emissive="#ea580c"
          emissiveIntensity={selected === 'diaphragm' ? 0.5 : 0.15}
        />
      </mesh>

      {/* rib cage hint */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0, 4.6 + i * 1.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[5.4 - Math.abs(i - 2.5) * 0.35, 0.14, 8, 40]} />
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.28} />
        </mesh>
      ))}

      <group ref={air}>
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshBasicMaterial color="#e0f2fe" toneMapped={false} transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
      <group ref={o2}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={0.7} />
          </mesh>
        ))}
      </group>
      <group ref={co2}>
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.26, 0.26, 0.26]} />
            <meshStandardMaterial color="#94a3b8" emissive="#64748b" emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>

      {showLabels && (
        <>
          <SimLabel3D position={[0, 16.2, 0]} variant="accent" distanceFactor={48}>
            التهوية {stats.minuteVentilation.toFixed(1)} ل/د · {params.breathRate} نفس/د
          </SimLabel3D>
          <SimLabel3D position={[6.4, 9.2, 0]} distanceFactor={48}>
            SpO₂ {stats.spo2.toFixed(0)}% · PaO₂ {stats.pao2.toFixed(0)} mmHg
          </SimLabel3D>
          <SimLabel3D position={[-6.6, 6.2, 0]} distanceFactor={48}>
            PaCO₂ {stats.paco2.toFixed(0)} mmHg · pH {stats.ph.toFixed(2)}
          </SimLabel3D>
          <SimLabel3D position={[0, 1.2, 0]} distanceFactor={48}>
            الحجاب الحاجز — محرّك الشهيق
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Nervous                                                             */
/* ------------------------------------------------------------------ */

const Nervous = ({ stats, playing, timeScale, showLabels, onSelect, selected }: {
  stats: BodyStats;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
  onSelect?: (id: string) => void;
  selected?: string;
}) => {
  const t = useRef(0);
  const impulse = useRef<THREE.Mesh>(null);
  const vesicles = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.Group>(null);

  const axonPath = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => {
        const u = i / 39;
        return [-9 + u * 18, 3.2 + Math.sin(u * Math.PI) * 0.6, 0] as [number, number, number];
      }),
    []
  );

  useFrame((_, d) => {
    if (playing) t.current += d * timeScale;
    const speed = stats.conductionVelocity / 60;
    const u = (t.current * speed * 0.6) % 1;
    if (impulse.current) impulse.current.position.set(-9 + u * 18, 3.2 + Math.sin(u * Math.PI) * 0.6, 0);
    if (nodes.current) {
      nodes.current.children.forEach((c, i) => {
        const mesh = c as THREE.Mesh;
        const nodeU = i / (nodes.current!.children.length - 1);
        const near = Math.max(0, 1 - Math.abs(nodeU - u) * 14);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.15 + near * 2.2;
      });
    }
    if (vesicles.current) {
      vesicles.current.children.forEach((c, i) => {
        const v = (t.current * 0.9 + rand(i)) % 1;
        c.position.set(9.4 + v * 1.6, 3.2 + (rand(i + 2) - 0.5) * 1.1, (rand(i + 4) - 0.5) * 1.1);
      });
    }
  });

  return (
    <group>
      {/* brain */}
      <group
        position={[0, 12.5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.('brain');
        }}
      >
        <mesh geometry={GEO.brain} scale={[2.5, 2.2, 2.1]} castShadow>
          <meshPhysicalMaterial {...tissueMaterial('#c4b5fd', '#8b5cf6', selected === 'brain' ? 0.55 : 0.16)} />
        </mesh>
        {/* cerebellum */}
        <mesh geometry={GEO.cerebellum} position={[0, -1.7, -2.0]} scale={[1.35, 1.3, 1.0]}>
          <meshPhysicalMaterial {...tissueMaterial('#a78bfa', '#7c3aed', 0.12)} />
        </mesh>
      </group>

      {/* spinal cord */}
      <mesh
        position={[0, 7.4, -0.6]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.('cord');
        }}
      >
        <cylinderGeometry args={[0.42, 0.5, 6.4, 16]} />
        <meshStandardMaterial color="#ddd6fe" emissive="#a78bfa" emissiveIntensity={selected === 'cord' ? 0.5 : 0.12} />
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[0, 4.6 + i * 0.72, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.72, 0.16, 8, 20]} />
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.45} />
        </mesh>
      ))}

      {/* neuron: soma, dendrites, myelinated axon, terminal */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.('axon');
        }}
      >
        <mesh position={[-9.6, 3.2, 0]}>
          <sphereGeometry args={[1.1, 24, 18]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.3} />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[-10.8 + Math.cos(a) * 0.4, 3.2 + Math.sin(a) * 1.5, Math.sin(a) * 0.6]} rotation={[0, 0, a]}>
              <cylinderGeometry args={[0.06, 0.14, 1.8, 8]} />
              <meshStandardMaterial color="#fcd34d" />
            </mesh>
          );
        })}
        <Line points={axonPath} color="#fde68a" lineWidth={2} transparent opacity={0.5} />
        {/* myelin sheaths */}
        <group ref={nodes}>
          {Array.from({ length: 9 }).map((_, i) => {
            const u = (i + 0.5) / 9;
            return (
              <mesh key={i} position={[-9 + u * 18, 3.2 + Math.sin(u * Math.PI) * 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.42, 1.1, 6, 12]} />
                <meshStandardMaterial color="#f1f5f9" emissive="#facc15" emissiveIntensity={0.15} roughness={0.4} />
              </mesh>
            );
          })}
        </group>
        <mesh ref={impulse}>
          <sphereGeometry args={[0.36, 14, 14]} />
          <meshBasicMaterial color="#22d3ee" toneMapped={false} />
        </mesh>
      </group>

      {/* synapse */}
      <group
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.('synapse');
        }}
      >
        <mesh position={[9.2, 3.2, 0]}>
          <sphereGeometry args={[0.95, 20, 16]} />
          <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={selected === 'synapse' ? 0.7 : 0.3} />
        </mesh>
        <mesh position={[11.9, 3.2, 0]}>
          <boxGeometry args={[0.5, 2.6, 2.6]} />
          <meshStandardMaterial color="#0f766e" transparent opacity={0.6} />
        </mesh>
        <group ref={vesicles}>
          {Array.from({ length: 14 }).map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.14, 8, 8]} />
              <meshBasicMaterial color="#6ee7b7" toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>

      {showLabels && (
        <>
          <SimLabel3D position={[0, 16.2, 0]} variant="accent" distanceFactor={48}>
            الدماغ والحبل الشوكي — الجهاز العصبي المركزي
          </SimLabel3D>
          <SimLabel3D position={[-11.6, 5.4, 0]} distanceFactor={48}>
            جسم الخلية والتشعّبات
          </SimLabel3D>
          <SimLabel3D position={[0, 5.4, 0]} variant="accent" distanceFactor={48}>
            توصيل قفزي {stats.conductionVelocity.toFixed(0)} م/ث
          </SimLabel3D>
          <SimLabel3D position={[11.4, 5.6, 0]} distanceFactor={48}>
            المشبك — زمن الانعكاس {stats.reflexLatency.toFixed(0)} م.ث
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Digestive                                                           */
/* ------------------------------------------------------------------ */

const Digestive = ({ stats, playing, timeScale, showLabels, onSelect, selected }: {
  stats: BodyStats;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
  onSelect?: (id: string) => void;
  selected?: string;
}) => {
  const t = useRef(0);
  const bolus = useRef<THREE.Group>(null);
  const nutrients = useRef<THREE.Group>(null);

  const tract = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 14.5, 0),
        new THREE.Vector3(0, 11.5, 0),
        new THREE.Vector3(-0.4, 9.2, 0),
        new THREE.Vector3(-1.8, 8.2, 0.3),
        new THREE.Vector3(-2.6, 6.9, 0),
        new THREE.Vector3(-1.2, 6.1, -0.3),
        new THREE.Vector3(0.6, 5.9, 0.4),
        new THREE.Vector3(2.2, 5.2, -0.4),
        new THREE.Vector3(0.4, 4.4, 0.5),
        new THREE.Vector3(-1.8, 4.0, -0.4),
        new THREE.Vector3(-2.4, 3.0, 0.3),
        new THREE.Vector3(0.2, 2.6, -0.3),
        new THREE.Vector3(2.6, 2.4, 0.2),
        new THREE.Vector3(3.0, 4.6, 0),
        new THREE.Vector3(0, 5.6, -1.6),
        new THREE.Vector3(-3.0, 4.6, 0),
        new THREE.Vector3(-3.0, 2.0, 0),
        new THREE.Vector3(-0.2, 1.0, 0),
      ]),
    []
  );

  useFrame((_, d) => {
    if (playing) t.current += d * timeScale * 0.06 * (30 / Math.max(6, stats.transitTime));
    if (bolus.current) {
      bolus.current.children.forEach((c, i) => {
        const u = ((t.current + i * 0.16) % 1 + 1) % 1;
        c.position.copy(tract.getPointAt(u));
        const s = 0.55 - u * 0.32;
        c.scale.setScalar(Math.max(0.16, s));
      });
    }
    if (nutrients.current) {
      nutrients.current.children.forEach((c, i) => {
        const u = (t.current * 6 + rand(i)) % 1;
        const a = rand(i + 3) * Math.PI * 2;
        c.position.set(Math.cos(a) * (1.4 + u * 3), 3.4 + (rand(i + 1) - 0.5) * 3, Math.sin(a) * (1.4 + u * 3));
      });
    }
  });

  const organ = (id: string, node: JSX.Element) => (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(id);
      }}
    >
      {node}
    </group>
  );

  return (
    <group>
      <mesh><tubeGeometry args={[tract, 200, 0.42, 12, false]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.32} emissive="#f59e0b" emissiveIntensity={0.14} />
      </mesh>

      {organ(
        'mouth',
        <mesh position={[0, 15.2, 0]}>
          <sphereGeometry args={[1.1, 20, 16]} />
          <meshStandardMaterial color="#fb7185" emissive="#f43f5e" emissiveIntensity={selected === 'mouth' ? 0.6 : 0.18} />
        </mesh>
      )}
      {organ(
        'stomach',
        <mesh geometry={GEO.stomach} position={[-2.1, 7.6, 0]} rotation={[0, 0, 0.35]} scale={[1.25, 1.25, 1.05]} castShadow>
          <meshPhysicalMaterial {...tissueMaterial('#f97316', '#ea580c', selected === 'stomach' ? 0.6 : 0.18)} side={THREE.DoubleSide} />
        </mesh>
      )}
      {organ(
        'liver',
        <group>
          <mesh geometry={GEO.liver} position={[2.9, 8.4, 0]} rotation={[0, 0, -0.12]} scale={[1.25, 1.5, 1.25]} castShadow>
            <meshPhysicalMaterial {...tissueMaterial('#84cc16', '#65a30d', selected === 'liver' ? 0.55 : 0.14)} />
          </mesh>
          <mesh position={[0.9, 6.9, 0]} rotation={[0, 0, -0.5]} scale={[1.6, 0.45, 0.6]}>
            <sphereGeometry args={[1, 18, 14]} />
            <meshStandardMaterial color="#a3e635" emissive="#4d7c0f" emissiveIntensity={0.2} />
          </mesh>
        </group>
      )}
      {organ(
        'sintestine',
        <group ref={nutrients}>
          {Array.from({ length: 26 }).map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.16, 8, 8]} />
              <meshBasicMaterial color="#facc15" toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
      {organ(
        'lintestine',
        <mesh position={[0, 3.4, -1.6]} visible={false}>
          <boxGeometry args={[1, 1, 1]} />
        </mesh>
      )}

      {/* villi ring illustrating absorption surface */}
      <group position={[0, 3.4, 0]}>
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 4.6, 0.6 + Math.sin(i) * 0.2, Math.sin(a) * 4.6]}>
              <capsuleGeometry args={[0.12, 0.6, 4, 8]} />
              <meshStandardMaterial color="#fda4af" emissive="#fb7185" emissiveIntensity={0.25} />
            </mesh>
          );
        })}
      </group>

      <group ref={bolus}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#a16207" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {showLabels && (
        <>
          <SimLabel3D position={[0, 16.6, 0]} variant="accent" distanceFactor={44}>
            زمن العبور ≈ {stats.transitTime.toFixed(0)} ساعة
          </SimLabel3D>
          <SimLabel3D position={[-5, 8.6, 0]} distanceFactor={44}>
            المعدة: pH ≈ 2 — بيبسين
          </SimLabel3D>
          <SimLabel3D position={[5.4, 9.6, 0]} distanceFactor={44}>
            الكبد والبنكرياس: صفراء وإنزيمات
          </SimLabel3D>
          <SimLabel3D position={[0, 0.2, 0]} distanceFactor={44}>
            الأمعاء الغليظة: امتصاص الماء
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Urinary (nephron)                                                   */
/* ------------------------------------------------------------------ */

const Urinary = ({ stats, playing, timeScale, showLabels, onSelect, selected }: {
  stats: BodyStats;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
  onSelect?: (id: string) => void;
  selected?: string;
}) => {
  const t = useRef(0);
  const filtrate = useRef<THREE.Group>(null);
  const reabsorbed = useRef<THREE.Group>(null);

  const nephron = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5.4, 9.4, 0),
        new THREE.Vector3(-3.4, 9.0, 0.6),
        new THREE.Vector3(-2.0, 8.2, -0.6),
        new THREE.Vector3(-1.0, 7.0, 0.5),
        new THREE.Vector3(-0.6, 5.0, 0),
        new THREE.Vector3(-0.4, 3.0, 0),
        new THREE.Vector3(0.4, 2.2, 0),
        new THREE.Vector3(1.2, 3.4, 0),
        new THREE.Vector3(1.6, 5.6, 0),
        new THREE.Vector3(2.6, 7.2, -0.5),
        new THREE.Vector3(4.0, 7.6, 0.4),
        new THREE.Vector3(4.6, 6.0, 0),
        new THREE.Vector3(4.8, 2.0, 0),
        new THREE.Vector3(4.8, 0.4, 0),
      ]),
    []
  );

  useFrame((_, d) => {
    if (playing) t.current += d * timeScale * (0.15 + (stats.gfr / 125) * 0.35);
    if (filtrate.current) {
      filtrate.current.children.forEach((c, i) => {
        const u = ((t.current + i / filtrate.current!.children.length) % 1 + 1) % 1;
        c.position.copy(nephron.getPointAt(u));
        const keep = 1 - stats.urineOutput / 5;
        c.visible = u < 0.55 || i / filtrate.current!.children.length > keep * 0.7;
      });
    }
    if (reabsorbed.current) {
      reabsorbed.current.children.forEach((c, i) => {
        const u = (t.current * 1.6 + rand(i)) % 1;
        const src = nephron.getPointAt(0.25 + rand(i + 2) * 0.5);
        c.position.set(src.x - u * 3.4, src.y + u * 1.2, src.z + (rand(i + 3) - 0.5) * 1.2);
      });
    }
  });

  return (
    <group>
      {/* kidney silhouette */}
      <mesh geometry={GEO.kidney} position={[0, 6, -2.6]} rotation={[0, Math.PI, 0]} scale={[4.4, 4.4, 3.2]}>
        <meshPhysicalMaterial
          {...tissueMaterial('#7f1d1d', '#b91c1c', 0.08, 0.18)}
          transmission={0.7}
          thickness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* glomerulus */}
      <group
        position={[-5.4, 9.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.('glom');
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.6, Math.sin(a) * 0.6, Math.sin(a * 2) * 0.4]} rotation={[a, a, 0]}>
              <torusKnotGeometry args={[0.35, 0.09, 40, 8]} />
              <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={selected === 'glom' ? 0.8 : 0.35} />
            </mesh>
          );
        })}
        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[1.1, 20, 16]} />
          <meshPhysicalMaterial color="#fca5a5" transparent opacity={0.2} transmission={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <mesh><tubeGeometry args={[nephron, 220, 0.26, 10, false]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.4} emissive="#0284c7" emissiveIntensity={0.2} />
      </mesh>

      {/* segment highlights */}
      {([['pct', 0.22, '#22d3ee'], ['loop', 0.5, '#0ea5e9'], ['collect', 0.9, '#6366f1']] as const).map(([id, u, color]) => {
        const p = nephron.getPointAt(u);
        return (
          <mesh
            key={id}
            position={[p.x, p.y, p.z]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(id);
            }}
          >
            <sphereGeometry args={[0.5, 16, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected === id ? 0.9 : 0.35} transparent opacity={0.8} />
          </mesh>
        );
      })}

      {/* collecting duct → bladder */}
      <mesh position={[4.8, -0.9, 0]} scale={[1.5, 1.2, 1.2]}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial color="#fde047" transparent opacity={0.5} emissive="#facc15" emissiveIntensity={0.3} />
      </mesh>

      <group ref={filtrate}>
        {Array.from({ length: 24 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.17, 8, 8]} />
            <meshBasicMaterial color="#fef08a" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <group ref={reabsorbed}>
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshBasicMaterial color="#67e8f9" toneMapped={false} />
          </mesh>
        ))}
      </group>

      {showLabels && (
        <>
          <SimLabel3D position={[-5.4, 11.4, 0]} variant="accent" distanceFactor={44}>
            الترشيح الكبيبي {stats.gfr.toFixed(0)} مل/د
          </SimLabel3D>
          <SimLabel3D position={[-4.2, 5.6, 0]} distanceFactor={44}>
            إعادة امتصاص &gt; 99% من الراشح
          </SimLabel3D>
          <SimLabel3D position={[7.2, 1.6, 0]} variant="accent" distanceFactor={44}>
            إدرار البول {stats.urineOutput.toFixed(1)} ل/يوم
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Muscular                                                            */
/* ------------------------------------------------------------------ */

const Muscular = ({ stats, params, playing, timeScale, showLabels, onSelect, selected }: {
  stats: BodyStats;
  params: BodyParams;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
  onSelect?: (id: string) => void;
  selected?: string;
}) => {
  const t = useRef(0);
  const forearm = useRef<THREE.Group>(null);
  const biceps = useRef<THREE.Mesh>(null);
  const triceps = useRef<THREE.Mesh>(null);
  const heads = useRef<THREE.Group>(null);
  const thin = useRef<THREE.Group>(null);

  useFrame((_, d) => {
    if (playing) t.current += d * timeScale * (0.5 + params.activity * 2);
    const c = (Math.sin(t.current * Math.PI * 2) + 1) / 2; // 0..1 contraction
    if (forearm.current) forearm.current.rotation.z = -0.15 - c * 1.5;
    if (biceps.current) {
      biceps.current.scale.set(1 + c * 0.4, 1 - c * 0.22, 1 + c * 0.4);
    }
    if (triceps.current) {
      triceps.current.scale.set(1 - c * 0.2, 1 + c * 0.14, 1 - c * 0.2);
    }
    if (thin.current) thin.current.position.x = -c * 1.1;
    if (heads.current) {
      heads.current.children.forEach((h, i) => {
        h.rotation.z = Math.sin(t.current * 6 + i) * 0.55 * (0.3 + params.activity);
      });
    }
  });

  return (
    <group>
      {/* upper arm bone (humerus) */}
      <group position={[-3, 10, 0]}>
        <mesh
          position={[0, -2.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.('bone');
          }}
        >
          <primitive object={GEO.humerus} attach="geometry" />
          <meshPhysicalMaterial color="#e8edf3" roughness={0.5} clearcoat={0.3} emissive="#94a3b8" emissiveIntensity={selected === 'bone' ? 0.4 : 0.05} />
        </mesh>

        <mesh
          ref={biceps}
          position={[0.9, -2.2, 0]}
          scale={[1, 1, 1]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.('biceps');
          }}
        >
          <primitive object={GEO.muscleBelly} attach="geometry" />
          <meshPhysicalMaterial {...tissueMaterial('#ef4444', '#dc2626', selected === 'biceps' ? 0.6 : 0.2)} />
        </mesh>
        <mesh
          ref={triceps}
          position={[-0.95, -2.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.('triceps');
          }}
        >
          <primitive object={GEO.muscleLong} attach="geometry" />
          <meshPhysicalMaterial {...tissueMaterial('#f97316', '#ea580c', selected === 'triceps' ? 0.6 : 0.16)} />
        </mesh>

        {/* elbow joint + forearm */}
        <mesh position={[0, -4.7, 0]}>
          <sphereGeometry args={[0.68, 20, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} />
        </mesh>
        <group ref={forearm} position={[0, -4.7, 0]}>
          <mesh position={[2.1, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
            <primitive object={GEO.radius} attach="geometry" />
            <meshPhysicalMaterial color="#dbe3ec" roughness={0.5} clearcoat={0.3} />
          </mesh>
          <mesh position={[4.4, -0.2, 0]}>
            <sphereGeometry args={[0.55, 16, 12]} />
            <meshStandardMaterial color="#fca5a5" roughness={0.7} />
          </mesh>
        </group>
      </group>

      {/* sarcomere zoom */}
      <group
        position={[5.5, 5.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.('sarcomere');
        }}
      >
        {/* thick filament (myosin) */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 6, 16]} />
          <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={selected === 'sarcomere' ? 0.55 : 0.25} />
        </mesh>
        <group ref={heads}>
          {Array.from({ length: 12 }).map((_, i) => {
            const x = -2.6 + i * 0.48;
            const up = i % 2 === 0 ? 1 : -1;
            return (
              <mesh key={i} position={[x, up * 0.5, 0]} rotation={[0, 0, 0]}>
                <boxGeometry args={[0.16, 0.6, 0.16]} />
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.4} />
              </mesh>
            );
          })}
        </group>
        {/* thin filaments (actin) */}
        <group ref={thin}>
          {[1, -1].map((s) => (
            <mesh key={s} position={[s * 4.2, s * 1.05, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.16, 0.16, 4.4, 12]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.35} />
            </mesh>
          ))}
        </group>
        {/* Z-lines */}
        {[-5.2, 5.2].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.18, 3, 1.6]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        ))}
      </group>

      {showLabels && (
        <>
          <SimLabel3D position={[-3, 12.8, 0]} variant="accent" distanceFactor={46}>
            عمل متضاد: قابضة تنقبض وباسطة ترتخي
          </SimLabel3D>
          <SimLabel3D position={[5.5, 8.4, 0]} distanceFactor={46}>
            القُسيم العضلي — الخيوط المنزلقة
          </SimLabel3D>
          <SimLabel3D position={[5.5, 2.2, 0]} variant="accent" distanceFactor={46}>
            القدرة {stats.musclePower.toFixed(0)} واط · لاكتات {stats.lactate.toFixed(1)} ممول/ل
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ */

export const BodyScene3D = ({
  system,
  params,
  stats,
  playing,
  timeScale,
  showLabels,
  view,
  autoRotate,
  resetKey,
  onSelectOrgan,
  selectedOrgan,
}: BodyScene3DProps) => {
  const target: [number, number, number] =
    system === 'circulatory'
      ? [4, 5.5, 0]
      : system === 'respiratory'
      ? [0, 8, 0]
      : system === 'nervous'
      ? [0, 8, 0]
      : system === 'digestive'
      ? [0, 8, 0]
      : system === 'urinary'
      ? [0, 6, 0]
      : [1, 6.5, 0];

  return (
    <group key={resetKey}>
      <SimStage size={54} showGrid showAxes={false} />
      <SimControls view={view} target={target} autoRotate={autoRotate} minDistance={9} maxDistance={70} />

      {system === 'circulatory' && (
        <Circulatory
          stats={stats}
          params={params}
          playing={playing}
          timeScale={timeScale}
          showLabels={showLabels}
          onSelect={onSelectOrgan}
          selected={selectedOrgan}
        />
      )}
      {system === 'respiratory' && (
        <Respiratory
          stats={stats}
          params={params}
          playing={playing}
          timeScale={timeScale}
          showLabels={showLabels}
          onSelect={onSelectOrgan}
          selected={selectedOrgan}
        />
      )}
      {system === 'nervous' && (
        <Nervous
          stats={stats}
          playing={playing}
          timeScale={timeScale}
          showLabels={showLabels}
          onSelect={onSelectOrgan}
          selected={selectedOrgan}
        />
      )}
      {system === 'digestive' && (
        <Digestive
          stats={stats}
          playing={playing}
          timeScale={timeScale}
          showLabels={showLabels}
          onSelect={onSelectOrgan}
          selected={selectedOrgan}
        />
      )}
      {system === 'urinary' && (
        <Urinary
          stats={stats}
          playing={playing}
          timeScale={timeScale}
          showLabels={showLabels}
          onSelect={onSelectOrgan}
          selected={selectedOrgan}
        />
      )}
      {system === 'muscular' && (
        <Muscular
          stats={stats}
          params={params}
          playing={playing}
          timeScale={timeScale}
          showLabels={showLabels}
          onSelect={onSelectOrgan}
          selected={selectedOrgan}
        />
      )}

      <pointLight position={[10, 16, 12]} intensity={30} color="#fecaca" distance={60} />
      <pointLight position={[-12, 8, -10]} intensity={18} color="#bfdbfe" distance={60} />
    </group>
  );
};

export default BodyScene3D;
