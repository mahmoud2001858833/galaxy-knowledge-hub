import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { SimControls, SimLabel3D, SimStage } from '@/components/sim3d';
import type { SimView } from '@/components/sim3d';
import type { BioMode, PhotoParams, PhotoStats } from '@/lib/sim-physics/photosynthesis';

interface PhotoScene3DProps {
  mode: BioMode;
  params: PhotoParams;
  stats: PhotoStats;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
  view: SimView;
  autoRotate: boolean;
  resetKey: number;
}

const rand = (s: number) => {
  const x = Math.sin(s * 91.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Falling photons that hit the thylakoid stack. */
const Photons = ({ count, intensity, playing, timeScale }: { count: number; intensity: number; playing: boolean; timeScale: number }) => {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, d) => {
    if (playing) t.current += d * timeScale;
    if (!group.current) return;
    group.current.children.forEach((c, i) => {
      const speed = 3 + rand(i) * 2;
      const y = 12 - ((t.current * speed + rand(i + 5) * 12) % 12);
      c.position.set((rand(i + 1) - 0.5) * 14, y, (rand(i + 2) - 0.5) * 8);
      c.visible = i < count;
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.13, 8, 8]} />
          <meshBasicMaterial color="#fde047" transparent opacity={0.35 + intensity * 0.6} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/** Chloroplast: envelope, grana stacks, stroma, ATP synthase, Calvin cycle ring. */
const Chloroplast = ({ stats, params, playing, timeScale, showLabels }: {
  stats: PhotoStats;
  params: PhotoParams;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
}) => {
  const ringRef = useRef<THREE.Group>(null);
  const electrons = useRef<THREE.Group>(null);
  const o2 = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, d) => {
    if (playing) t.current += d * timeScale;
    if (ringRef.current) ringRef.current.rotation.y = t.current * (0.4 + stats.gross * 1.6);
    if (electrons.current) {
      electrons.current.children.forEach((c, i) => {
        const u = ((t.current * (0.4 + stats.gross) + i / 8) % 1);
        c.position.set(-5 + u * 9, 2.6 + Math.sin(u * Math.PI) * 1.4, 0);
      });
    }
    if (o2.current) {
      o2.current.children.forEach((c, i) => {
        const u = (t.current * 0.6 + rand(i) ) % 1;
        c.position.set(-6.4 + (rand(i + 3) - 0.5) * 1.2, 1.4 + u * 8, (rand(i + 7) - 0.5) * 1.4);
        c.visible = u < stats.o2Release * 2.2;
      });
    }
  });

  const green = new THREE.Color('#16a34a').lerp(new THREE.Color('#a3a3a3'), 1 - params.chlorophyll);

  return (
    <group position={[0, 4, 0]}>
      {/* envelope */}
      <mesh scale={[1.6, 0.72, 1]}>
        <sphereGeometry args={[7, 48, 32]} />
        <meshPhysicalMaterial color="#065f46" transparent opacity={0.16} transmission={0.75} thickness={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* grana stacks */}
      {[-4.5, -1.5, 1.5, 4.5].map((x, gi) => (
        <group key={gi} position={[x, -1.4, gi % 2 === 0 ? -1.6 : 1.6]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[0, i * 0.42, 0]} castShadow>
              <cylinderGeometry args={[1.15, 1.15, 0.28, 28]} />
              <meshStandardMaterial
                color={green}
                emissive={green}
                emissiveIntensity={0.15 + stats.gross * 0.6}
                roughness={0.45}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* electron transport chain along a thylakoid */}
      <group position={[0, 0.4, 0]}>
        <Line
          points={Array.from({ length: 30 }, (_, i) => {
            const u = i / 29;
            return [-5 + u * 9, 2.6 + Math.sin(u * Math.PI) * 1.4, 0] as [number, number, number];
          })}
          color="#38bdf8"
          lineWidth={2}
          transparent
          opacity={0.6}
        />
        <group ref={electrons}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.17, 10, 10]} />
              <meshBasicMaterial color="#22d3ee" toneMapped={false} />
            </mesh>
          ))}
        </group>
        {[-5, -1.5, 2, 4].map((x, i) => (
          <mesh key={i} position={[x, 2.6 + Math.sin(((x + 5) / 9) * Math.PI) * 1.4, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial color="#1d4ed8" emissive="#1d4ed8" emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>

      {/* Calvin cycle ring in the stroma */}
      <group ref={ringRef} position={[0, -3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.4, 0.18, 16, 48]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.4} />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 2.4, Math.sin(a) * 2.4, 0]}>
              <icosahedronGeometry args={[0.32, 0]} />
              <meshStandardMaterial color="#f8fafc" emissive="#bae6fd" emissiveIntensity={0.5} />
            </mesh>
          );
        })}
      </group>

      {/* released O2 bubbles */}
      <group ref={o2}>
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.5} transparent opacity={0.8} />
          </mesh>
        ))}
      </group>

      {showLabels && (
        <>
          <SimLabel3D position={[0, 5.6, 0]} variant="accent" distanceFactor={44}>
            البلاستيدة الخضراء — التفاعلات الضوئية ودورة كالفن
          </SimLabel3D>
          <SimLabel3D position={[5.6, 1.6, 0]} distanceFactor={44}>
            سلسلة نقل الإلكترون في الثايلاكويد
          </SimLabel3D>
          <SimLabel3D position={[0, -5.6, 0]} distanceFactor={44}>
            الستروما: تثبيت CO₂ بإنزيم روبيسكو
          </SimLabel3D>
          <SimLabel3D position={[-7, 6, 0]} variant="accent" distanceFactor={44}>
            O₂ متحرّر {(stats.o2Release * 100).toFixed(0)}%
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

/** Mitochondrion: outer membrane, cristae, matrix, proton gradient, ATP synthase. */
const Mitochondrion = ({ stats, playing, timeScale, showLabels }: {
  stats: PhotoStats;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
}) => {
  const rotor = useRef<THREE.Group>(null);
  const protons = useRef<THREE.Group>(null);
  const atp = useRef<THREE.Group>(null);
  const t = useRef(0);
  const aerobic = 1 - stats.anaerobicFraction;

  useFrame((_, d) => {
    if (playing) t.current += d * timeScale;
    if (rotor.current) rotor.current.rotation.y = t.current * (1 + aerobic * 6);
    if (protons.current) {
      protons.current.children.forEach((c, i) => {
        const u = (t.current * (0.3 + aerobic * 0.9) + rand(i)) % 1;
        const a = rand(i + 2) * Math.PI * 2;
        c.position.set(Math.cos(a) * 4.6 * (1 - u * 0.55), -2.4 + u * 4.6, Math.sin(a) * 2.4 * (1 - u * 0.55));
      });
    }
    if (atp.current) {
      atp.current.children.forEach((c, i) => {
        const u = (t.current * 0.5 + rand(i + 9)) % 1;
        c.position.set(1.6 + u * 5, 1.4 + Math.sin(u * 3) * 0.6, (rand(i) - 0.5) * 2);
        c.visible = u < aerobic;
      });
    }
  });

  return (
    <group position={[0, 4.5, 0]}>
      <mesh scale={[1.7, 0.85, 1]}>
        <sphereGeometry args={[6.4, 48, 32]} />
        <meshPhysicalMaterial color="#7f1d1d" transparent opacity={0.15} transmission={0.75} thickness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh scale={[1.55, 0.72, 0.88]}>
        <sphereGeometry args={[6.4, 40, 28]} />
        <meshBasicMaterial color="#f87171" wireframe transparent opacity={0.12} />
      </mesh>

      {/* cristae */}
      {[-6, -3.2, -0.4, 2.4, 5.2].map((x, i) => (
        <mesh key={i} position={[x, i % 2 === 0 ? 0.8 : -0.8, 0]} rotation={[0, 0, i % 2 === 0 ? 0.25 : -0.25]}>
          <torusGeometry args={[1.5, 0.28, 12, 28, Math.PI]} />
          <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={0.25 + aerobic * 0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* proton gradient particles */}
      <group ref={protons}>
        {Array.from({ length: 26 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#fbbf24" toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* ATP synthase rotor */}
      <group position={[0, 2.6, 0]}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 1.6, 12]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <group ref={rotor} position={[0, 1.1, 0]}>
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8]} rotation={[0, -a, 0]}>
                <boxGeometry args={[0.7, 0.42, 0.24]} />
                <meshStandardMaterial color="#34d399" emissive="#10b981" emissiveIntensity={0.45} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* produced ATP */}
      <group ref={atp}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i}>
            <octahedronGeometry args={[0.26, 0]} />
            <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={0.7} />
          </mesh>
        ))}
      </group>

      {showLabels && (
        <>
          <SimLabel3D position={[0, 5.4, 0]} variant="accent" distanceFactor={44}>
            الميتوكندريا — {stats.anaerobicFraction > 0.5 ? 'تنفّس لا هوائي (تخمّر)' : 'تنفّس هوائي'}
          </SimLabel3D>
          <SimLabel3D position={[0, 4.2, 0]} distanceFactor={44}>
            ATP سينثيز يدور بالتدرّج البروتوني
          </SimLabel3D>
          <SimLabel3D position={[-7.4, 0.5, 0]} distanceFactor={44}>
            الأعراف: سلسلة نقل الإلكترون
          </SimLabel3D>
          <SimLabel3D position={[7.4, 1.8, 0]} variant="accent" distanceFactor={44}>
            ATP ≈ {stats.atpRespiration.toFixed(1)}
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

/** Whole-plant gas exchange: leaf, gas bubbles up/down, light source. */
const GasExchange = ({ stats, params, playing, timeScale, showLabels }: {
  stats: PhotoStats;
  params: PhotoParams;
  playing: boolean;
  timeScale: number;
  showLabels: boolean;
}) => {
  const bubbles = useRef<THREE.Group>(null);
  const co2 = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, d) => {
    if (playing) t.current += d * timeScale;
    if (bubbles.current) {
      bubbles.current.children.forEach((c, i) => {
        const u = (t.current * 0.5 + rand(i)) % 1;
        c.position.set(-3 + (rand(i + 2) - 0.5) * 5, 1 + u * 9, (rand(i + 4) - 0.5) * 4);
        c.visible = i / 20 < Math.max(0, stats.net) * 2.4;
      });
    }
    if (co2.current) {
      co2.current.children.forEach((c, i) => {
        const u = (t.current * 0.45 + rand(i + 11)) % 1;
        c.position.set(3 + (rand(i + 3) - 0.5) * 5, 1 + u * 9, (rand(i + 6) - 0.5) * 4);
        c.visible = i / 20 < Math.max(0, -stats.net) * 2.4 + 0.15;
      });
    }
  });

  const leafColor = new THREE.Color('#22c55e').lerp(new THREE.Color('#a16207'), 1 - params.chlorophyll);

  return (
    <group>
      {/* light source */}
      <mesh position={[0, 13, 0]}>
        <sphereGeometry args={[0.9 + params.light / 100, 24, 24]} />
        <meshBasicMaterial color="#fde047" toneMapped={false} transparent opacity={0.35 + params.light / 140} />
      </mesh>
      <pointLight position={[0, 13, 0]} intensity={20 + params.light} color="#fef9c3" distance={40} />

      {/* stem */}
      <mesh position={[0, 3, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.36, 6, 16]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.7} />
      </mesh>
      {/* leaves */}
      {[[-1, 5, 0, 0.6], [1, 4.2, 0, -0.6], [0, 6.2, 1, 0.2]].map((l, i) => (
        <mesh key={i} position={[l[0] * 2.4, l[1], l[2] * 2]} rotation={[Math.PI / 2.4, 0, l[3]]} scale={[1.9, 1, 0.16]} castShadow>
          <sphereGeometry args={[1.5, 24, 16]} />
          <meshStandardMaterial color={leafColor} roughness={0.55} emissive={leafColor} emissiveIntensity={0.12} />
        </mesh>
      ))}
      {/* soil */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[2.4, 2, 0.7, 24]} />
        <meshStandardMaterial color="#44403c" roughness={0.95} />
      </mesh>

      <group ref={bubbles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.24, 10, 10]} />
            <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.6} transparent opacity={0.85} />
          </mesh>
        ))}
      </group>
      <group ref={co2}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#94a3b8" emissive="#64748b" emissiveIntensity={0.35} transparent opacity={0.8} />
          </mesh>
        ))}
      </group>

      {showLabels && (
        <>
          <SimLabel3D position={[-4.4, 9.6, 0]} variant="accent" distanceFactor={46}>
            O₂ صافٍ {(Math.max(0, stats.net) * 100).toFixed(0)}%
          </SimLabel3D>
          <SimLabel3D position={[4.4, 9.6, 0]} distanceFactor={46}>
            CO₂ / تنفّس {(stats.respiration * 100).toFixed(0)}%
          </SimLabel3D>
          <SimLabel3D position={[0, 11.4, 0]} variant="accent" distanceFactor={46}>
            {stats.balanceLabel} — العامل المحدّد: {stats.limiting}
          </SimLabel3D>
        </>
      )}
    </group>
  );
};

export const PhotoScene3D = ({
  mode,
  params,
  stats,
  playing,
  timeScale,
  showLabels,
  view,
  autoRotate,
  resetKey,
}: PhotoScene3DProps) => {
  const photonCount = useMemo(() => Math.round((params.light / 100) * 40), [params.light]);

  return (
    <group key={resetKey}>
      <SimStage size={46} showGrid showAxes={false} />
      <SimControls
        view={view}
        target={[0, mode === 'exchange' ? 5 : 4, 0]}
        autoRotate={autoRotate}
        minDistance={8}
        maxDistance={64}
      />

      {mode !== 'respiration' && (
        <Photons count={photonCount} intensity={params.light / 100} playing={playing} timeScale={timeScale} />
      )}

      {mode === 'photosynthesis' && (
        <Chloroplast stats={stats} params={params} playing={playing} timeScale={timeScale} showLabels={showLabels} />
      )}
      {mode === 'respiration' && (
        <Mitochondrion stats={stats} playing={playing} timeScale={timeScale} showLabels={showLabels} />
      )}
      {mode === 'exchange' && (
        <GasExchange stats={stats} params={params} playing={playing} timeScale={timeScale} showLabels={showLabels} />
      )}

      <pointLight position={[8, 12, 10]} intensity={26} color="#bbf7d0" distance={44} />
    </group>
  );
};

export default PhotoScene3D;
