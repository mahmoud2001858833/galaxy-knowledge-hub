import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Eye, Layers, Atom, Sparkles, Compass, ShieldAlert, Cpu } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

// Core Framework
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import CinematicCameraController, { CameraPreset } from '@/components/simulations/CinematicCameraController';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

interface AtomData {
  element: 'C' | 'H' | 'O' | 'N' | 'Cl';
  pos: [number, number, number];
  name?: string;
}

interface BondData {
  from: number;
  to: number;
  type?: 'single' | 'double' | 'triple';
}

interface MoleculeConfig {
  id: string;
  name: string;
  arabicName: string;
  formula: string;
  category: string;
  atoms: AtomData[];
  bonds: BondData[];
  hybridization: string;
  geometry: string;
  bondAngle: number; // degrees
  dipoleMoment: number; // Debye
  molWeight: number; // g/mol
  torsionEnergy: number; // kJ/mol
  irFrequency: number; // cm^-1
  description: string;
}

// Atom color & radius palette according to CPK standards
const ATOM_PROPS = {
  C: { color: '#334155', glow: '#64748b', radiusStick: 0.42, radiusSpace: 0.95, label: 'C' },
  H: { color: '#f8fafc', glow: '#cbd5e1', radiusStick: 0.26, radiusSpace: 0.62, label: 'H' },
  O: { color: '#ef4444', glow: '#f87171', radiusStick: 0.38, radiusSpace: 0.88, label: 'O' },
  N: { color: '#3b82f6', glow: '#60a5fa', radiusStick: 0.40, radiusSpace: 0.90, label: 'N' },
  Cl: { color: '#10b981', glow: '#34d399', radiusStick: 0.46, radiusSpace: 1.05, label: 'Cl' },
};

const MOLECULES: MoleculeConfig[] = [
  {
    id: 'methane',
    name: 'Methane',
    arabicName: 'الميثان (CH₄)',
    formula: 'CH₄',
    category: 'ألكان هيدروكربوني مشبع',
    hybridization: 'sp³',
    geometry: 'رباعي الأوجه منتظم (Tetrahedral)',
    bondAngle: 109.5,
    dipoleMoment: 0.0,
    molWeight: 16.04,
    torsionEnergy: 12.5,
    irFrequency: 3019,
    description: 'أبسط مركب عضوي وهيدروكربون، تتخذ فيه أربع روابط C-H زوايا متساوية 109.5° لتقليل التنافر الإلكتروني.',
    atoms: [
      { element: 'C', pos: [0, 0, 0] },
      { element: 'H', pos: [0, 1.25, 0] },
      { element: 'H', pos: [1.18, -0.42, 0] },
      { element: 'H', pos: [-0.59, -0.42, 1.02] },
      { element: 'H', pos: [-0.59, -0.42, -1.02] },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 0, to: 4 },
    ]
  },
  {
    id: 'ethene',
    name: 'Ethene',
    arabicName: 'الإيثين (C₂H₄)',
    formula: 'C₂H₄',
    category: 'ألكين غير مشبع (رابطة مزدوجة)',
    hybridization: 'sp²',
    geometry: 'مثلثي مستوٍ (Trigonal Planar)',
    bondAngle: 121.3,
    dipoleMoment: 0.0,
    molWeight: 28.05,
    torsionEnergy: 265.0, // High barrier due to pi bond
    irFrequency: 1623,
    description: 'يحتوي على رابطة تساهمية ثنائية (واحدة سيجما σ وواحدة باي π)، مما يمنع الدوران الحر ويفرض بنية مسطحة تماماً.',
    atoms: [
      { element: 'C', pos: [-0.75, 0, 0] },
      { element: 'C', pos: [0.75, 0, 0] },
      { element: 'H', pos: [-1.4, 0.95, 0] },
      { element: 'H', pos: [-1.4, -0.95, 0] },
      { element: 'H', pos: [1.4, 0.95, 0] },
      { element: 'H', pos: [1.4, -0.95, 0] },
    ],
    bonds: [
      { from: 0, to: 1, type: 'double' },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 1, to: 4 },
      { from: 1, to: 5 },
    ]
  },
  {
    id: 'ethyne',
    name: 'Ethyne (Acetylene)',
    arabicName: 'الأسيتيلين / الإيثاين (C₂H₂)',
    formula: 'C₂H₂',
    category: 'ألكاين غير مشبع (رابطة ثلاثية)',
    hybridization: 'sp',
    geometry: 'خطي متناظر (Linear)',
    bondAngle: 180.0,
    dipoleMoment: 0.0,
    molWeight: 26.04,
    torsionEnergy: 380.0,
    irFrequency: 2110,
    description: 'يحتوي على رابطة ثلاثية فائقة القوة (رابطة σ ورابطتا π متعامدتان)، بزاوية خطية تامة 180° ونشاط كيميائي عالٍ.',
    atoms: [
      { element: 'C', pos: [-0.65, 0, 0] },
      { element: 'C', pos: [0.65, 0, 0] },
      { element: 'H', pos: [-1.75, 0, 0] },
      { element: 'H', pos: [1.75, 0, 0] },
    ],
    bonds: [
      { from: 0, to: 1, type: 'triple' },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
    ]
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    arabicName: 'الإيثانول (C₂H₅OH)',
    formula: 'C₂H₅OH',
    category: 'كحول أليفاتي قطبي',
    hybridization: 'sp³',
    geometry: 'مائل حول الأكسجين (Bent / Tetrahedral)',
    bondAngle: 104.5,
    dipoleMoment: 1.69,
    molWeight: 46.07,
    torsionEnergy: 18.2,
    irFrequency: 3350, // O-H broad stretch
    description: 'كحول يحتوي على مجموعة هيدروكسيل (-OH) مانحة لرابطة هيدروجينية، مما يمنحه قطبية عالية وقابلية امتزاج تامة بالماء.',
    atoms: [
      { element: 'C', pos: [-1.2, -0.2, 0] },
      { element: 'C', pos: [0.2, 0.4, 0] },
      { element: 'O', pos: [1.35, -0.45, 0] },
      { element: 'H', pos: [2.15, -0.1, 0] },
      { element: 'H', pos: [-1.25, -1.25, 0] },
      { element: 'H', pos: [-1.65, 0.25, 0.9] },
      { element: 'H', pos: [-1.65, 0.25, -0.9] },
      { element: 'H', pos: [0.25, 1.05, 0.9] },
      { element: 'H', pos: [0.25, 1.05, -0.9] },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 0, to: 4 },
      { from: 0, to: 5 },
      { from: 0, to: 6 },
      { from: 1, to: 7 },
      { from: 1, to: 8 },
    ]
  },
  {
    id: 'acetic_acid',
    name: 'Acetic Acid',
    arabicName: 'حمض الخليك / الأسيتيك (CH₃COOH)',
    formula: 'CH₃COOH',
    category: 'حمض كربوكسيلي',
    hybridization: 'sp² / sp³',
    geometry: 'مستوٍ عند الكربون الكربونيلي',
    bondAngle: 120.0,
    dipoleMoment: 1.74,
    molWeight: 60.05,
    torsionEnergy: 21.0,
    irFrequency: 1715, // Carbonyl stretch
    description: 'حمض كربوكسيلي يتضمن مجموعة كربونيل (C=O) وهيدروكسيل (-OH) متصلين بنفس الكربون، مما يمنحه خواص حامضية ورنين إلكتروني.',
    atoms: [
      { element: 'C', pos: [-1.25, 0, 0] },
      { element: 'C', pos: [0.25, 0.1, 0] },
      { element: 'O', pos: [0.85, 1.25, 0] }, // carbonyl
      { element: 'O', pos: [0.95, -1.05, 0] }, // hydroxyl
      { element: 'H', pos: [1.88, -0.95, 0] },
      { element: 'H', pos: [-1.65, -0.95, 0] },
      { element: 'H', pos: [-1.55, 0.55, 0.9] },
      { element: 'H', pos: [-1.55, 0.55, -0.9] },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 1, to: 2, type: 'double' },
      { from: 1, to: 3 },
      { from: 3, to: 4 },
      { from: 0, to: 5 },
      { from: 0, to: 6 },
      { from: 0, to: 7 },
    ]
  },
  {
    id: 'benzene',
    name: 'Benzene',
    arabicName: 'البنزين العطري (C₆H₆)',
    formula: 'C₆H₆',
    category: 'مركب أروماتي بحلقة رنينية سداسية',
    hybridization: 'sp²',
    geometry: 'حلقي سداسي مستوٍ (Planar Hexagonal)',
    bondAngle: 120.0,
    dipoleMoment: 0.0,
    molWeight: 78.11,
    torsionEnergy: 152.0, // High resonance energy
    irFrequency: 1480,
    description: 'أيقونة الكيمياء العضوية، ست ذرات كربون في حلقة سداسية تتشارك 6 إلكترونات باي متمركزة في سحابة رنينية فوق وتحت مستوى الحلقة.',
    atoms: [
      ...Array.from({ length: 6 }, (_, i) => {
        const angle = (i * Math.PI) / 3;
        return {
          element: 'C' as const,
          pos: [1.45 * Math.cos(angle), 1.45 * Math.sin(angle), 0] as [number, number, number],
        };
      }),
      ...Array.from({ length: 6 }, (_, i) => {
        const angle = (i * Math.PI) / 3;
        return {
          element: 'H' as const,
          pos: [2.55 * Math.cos(angle), 2.55 * Math.sin(angle), 0] as [number, number, number],
        };
      }),
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 0 },
      { from: 0, to: 6 },
      { from: 1, to: 7 },
      { from: 2, to: 8 },
      { from: 3, to: 9 },
      { from: 4, to: 10 },
      { from: 5, to: 11 },
    ]
  },
  {
    id: 'alanine',
    name: 'Alanine (Chiral)',
    arabicName: 'الألانين اللامتناظر (L/D Alanine)',
    formula: 'CH₃CH(NH₂)COOH',
    category: 'حمض أميني كايرالي (Chiral Stereocenter)',
    hybridization: 'sp³',
    geometry: 'مركز تماثل فراغي كايرالي (Stereocenter)',
    bondAngle: 109.5,
    dipoleMoment: 2.15,
    molWeight: 89.09,
    torsionEnergy: 24.5,
    irFrequency: 1680,
    description: 'حمض أميني كايرالي، كربونه المركزي متصل بأربع مجموعات مختلفة (-H, -CH₃, -NH₂, -COOH). لا ينطبق على صورته في المرآة (مركبان فراغيان Enantiomers).',
    atoms: [
      { element: 'C', pos: [0, 0, 0], name: 'Cα' },
      { element: 'H', pos: [0, 0, -1.15] },
      { element: 'N', pos: [-1.2, 0.7, 0.4] },
      { element: 'H', pos: [-1.8, 0.2, 0.95] },
      { element: 'H', pos: [-1.2, 1.6, 0.6] },
      { element: 'C', pos: [1.3, 0.6, 0.2] },
      { element: 'O', pos: [1.8, 1.6, -0.2] },
      { element: 'O', pos: [1.8, -0.4, 0.8] },
      { element: 'H', pos: [2.6, -0.3, 0.9] },
      { element: 'C', pos: [-0.2, -1.4, 0.5] },
      { element: 'H', pos: [-1.15, -1.8, 0.2] },
      { element: 'H', pos: [0.6, -1.9, 0.1] },
      { element: 'H', pos: [-0.2, -1.4, 1.55] },
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 2, to: 3 },
      { from: 2, to: 4 },
      { from: 0, to: 5 },
      { from: 5, to: 6, type: 'double' },
      { from: 5, to: 7 },
      { from: 7, to: 8 },
      { from: 0, to: 9 },
      { from: 9, to: 10 },
      { from: 9, to: 11 },
      { from: 9, to: 12 },
    ]
  }
];

// 3D Cylinder Bond Component
const Bond3D: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  type?: 'single' | 'double' | 'triple';
  color?: string;
}> = ({ start, end, type = 'single', color = '#94a3b8' }) => {
  const p1 = useMemo(() => new THREE.Vector3(...start), [start]);
  const p2 = useMemo(() => new THREE.Vector3(...end), [end]);
  const dir = useMemo(() => new THREE.Vector3().subVectors(p2, p1), [p1, p2]);
  const len = dir.length();
  const mid = useMemo(() => new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5), [p1, p2]);

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    q.setFromUnitVectors(up, dir.clone().normalize());
    return q;
  }, [dir]);

  const perp = useMemo(() => {
    const p = new THREE.Vector3(0, 0, 1).cross(dir).normalize().multiplyScalar(0.09);
    if (p.lengthSq() < 0.001) {
      p.set(1, 0, 0).cross(dir).normalize().multiplyScalar(0.09);
    }
    return p;
  }, [dir]);

  if (type === 'double') {
    const mid1 = mid.clone().add(perp);
    const mid2 = mid.clone().sub(perp);
    return (
      <group>
        <mesh position={mid1} quaternion={quaternion}>
          <cylinderGeometry args={[0.04, 0.04, len, 12]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={mid2} quaternion={quaternion}>
          <cylinderGeometry args={[0.04, 0.04, len, 12]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  if (type === 'triple') {
    const mid1 = mid.clone().add(perp);
    const mid2 = mid.clone().sub(perp);
    return (
      <group>
        <mesh position={mid} quaternion={quaternion}>
          <cylinderGeometry args={[0.035, 0.035, len, 12]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={mid1} quaternion={quaternion}>
          <cylinderGeometry args={[0.035, 0.035, len, 12]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={mid2} quaternion={quaternion}>
          <cylinderGeometry args={[0.035, 0.035, len, 12]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[0.055, 0.055, len, 16]} />
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.35} />
    </mesh>
  );
};

// 3D Molecular Mesh Viewer
const MolecularEngine3D: React.FC<{
  molecule: MoleculeConfig;
  renderMode: 'ballStick' | 'spaceFill' | 'wireframe';
  showLabels: boolean;
  isChiralFlipped: boolean;
  temperature: number;
  isPlaying: boolean;
}> = ({ molecule, renderMode, showLabels, isChiralFlipped, temperature, isPlaying }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Compute thermal vibration and rotation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (isPlaying) {
      // Natural thermal tumble
      const rotSpeed = 0.35 + (temperature / 100) * 0.4;
      groupRef.current.rotation.y += delta * rotSpeed;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
  });

  // Calculate coordinates with chirality reflection if enabled
  const atomsTransformed = useMemo(() => {
    return molecule.atoms.map(atom => {
      const x = atom.pos[0];
      const y = atom.pos[1];
      const z = isChiralFlipped ? -atom.pos[2] : atom.pos[2];
      return { ...atom, pos: [x, y, z] as [number, number, number] };
    });
  }, [molecule, isChiralFlipped]);

  return (
    <group ref={groupRef}>
      {/* Benzene pi resonance delocalized rings */}
      {molecule.id === 'benzene' && (
        <group>
          {/* Upper Pi cloud */}
          <mesh position={[0, 0, 0.45]}>
            <torusGeometry args={[1.35, 0.12, 16, 64]} />
            <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.6} transparent opacity={0.65} />
          </mesh>
          {/* Lower Pi cloud */}
          <mesh position={[0, 0, -0.45]}>
            <torusGeometry args={[1.35, 0.12, 16, 64]} />
            <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={0.6} transparent opacity={0.65} />
          </mesh>
        </group>
      )}

      {/* Render Bonds (Ball & Stick mode or Wireframe) */}
      {renderMode !== 'spaceFill' &&
        molecule.bonds.map((bond, idx) => {
          const start = atomsTransformed[bond.from]?.pos;
          const end = atomsTransformed[bond.to]?.pos;
          if (!start || !end) return null;
          return (
            <Bond3D
              key={`bond-${idx}-${bond.from}-${bond.to}`}
              start={start}
              end={end}
              type={bond.type}
              color={renderMode === 'wireframe' ? '#38bdf8' : '#94a3b8'}
            />
          );
        })}

      {/* Render Atoms */}
      {atomsTransformed.map((atom, idx) => {
        const props = ATOM_PROPS[atom.element];
        const radius = renderMode === 'spaceFill' ? props.radiusSpace : props.radiusStick;

        return (
          <group key={`atom-${idx}-${atom.element}`} position={atom.pos}>
            <mesh>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshStandardMaterial
                color={props.color}
                emissive={props.glow}
                emissiveIntensity={0.2}
                metalness={atom.element === 'C' ? 0.3 : 0.1}
                roughness={0.25}
                wireframe={renderMode === 'wireframe'}
              />
            </mesh>

            {/* Subtle Aura Halo */}
            <mesh scale={1.08}>
              <sphereGeometry args={[radius, 16, 16]} />
              <meshBasicMaterial
                color={props.glow}
                transparent
                opacity={0.12}
                side={THREE.BackSide}
              />
            </mesh>

            {/* In-scene 3D Atom Label */}
            {showLabels && (
              <Html distanceFactor={10} position={[0, radius + 0.25, 0]} center>
                <div className="bg-slate-900/90 text-white border border-slate-700 rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold shadow-lg pointer-events-none select-none whitespace-nowrap">
                  {atom.name || props.label}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

export const OrganicChemistrySimulation: React.FC = () => {
  const [selectedMoleculeIdx, setSelectedMoleculeIdx] = useState(0);
  const [renderMode, setRenderMode] = useState<'ballStick' | 'spaceFill' | 'wireframe'>('ballStick');
  const [isPlaying, setIsPlaying] = useState(true);
  const [temperature, setTemperature] = useState(25); // Celsius
  const [showLabels, setShowLabels] = useState(true);
  const [isChiralFlipped, setIsChiralFlipped] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  const currentMolecule = MOLECULES[selectedMoleculeIdx];

  // Dynamic telemetry metrics for HUD
  const hudMetrics = useMemo(() => {
    return [
      {
        id: 'angle',
        label: 'زاوية الروابط',
        value: currentMolecule.bondAngle,
        unit: '°',
        status: 'normal' as const,
        min: 90,
        max: 180,
      },
      {
        id: 'dipole',
        label: 'عزم ثنائي القطب',
        value: currentMolecule.dipoleMoment,
        unit: 'Debye',
        status: currentMolecule.dipoleMoment > 1.5 ? ('warning' as const) : ('normal' as const),
        min: 0,
        max: 3.5,
      },
      {
        id: 'molweight',
        label: 'الكتلة المولية',
        value: currentMolecule.molWeight,
        unit: 'g/mol',
        status: 'normal' as const,
        min: 10,
        max: 100,
      },
      {
        id: 'torsion',
        label: 'طاقة الالتواء والتهجين',
        value: currentMolecule.torsionEnergy,
        unit: 'kJ/mol',
        status: currentMolecule.torsionEnergy > 200 ? ('critical' as const) : ('normal' as const),
        min: 0,
        max: 400,
      },
    ];
  }, [currentMolecule]);

  // Gamified Challenges
  const challenges: Challenge[] = useMemo(() => {
    return [
      {
        id: 'unsaturated_hydrocarbon',
        title: 'استكشاف الهيدروكربونات غير المشبعة (sp² / sp)',
        description: 'انتقل إلى جزيء الإيثين (C₂H₄) أو الأسيتيلين (C₂H₂) وتفحص الرابطة المزدوجة أو الثلاثية لتقييم منع الدوران الحر وزاوية الرابطة.',
        targetMetric: 'زاوية الروابط',
        targetValue: 120,
        unit: '°',
        currentValue: currentMolecule.bondAngle,
        holdTimeRequired: 3,
        tolerance: 2,
        isCompleted: false,
        hint: 'اختر الإيثين (C₂H₄) من قائمة الجزيئات في الأعلى حيث التهجين sp² بزاوية 121.3°.',
      },
      {
        id: 'polar_functional_group',
        title: 'عزل مجموعة وظيفية عالية القطبية',
        description: 'قم باختيار مركب يحتوي على مجموعة كحولية (-OH) أو كربوكسيلية (-COOH) بحيث يتجاوز عزم ثنائي القطب 1.6 ديباي.',
        targetMetric: 'عزم ثنائي القطب',
        targetValue: 1.7,
        unit: 'Debye',
        currentValue: currentMolecule.dipoleMoment,
        holdTimeRequired: 3,
        tolerance: 0.15,
        isCompleted: false,
        hint: 'اختر الإيثانول (1.69 Debye) أو حمض الأسيتيك (1.74 Debye) لملاحظة تأثير شحنة الأكسجين السالبة جزئياً.',
      },
      {
        id: 'chiral_inversion',
        title: 'الكيمياء الفراغية وتماثل الإنانتيومر (Enantiomer)',
        description: 'انتقل إلى حمض الألانين وقم بعكس التماثل الفراغي للمركب لمشاهدة المتشاكل الضوئي المرآوي L-Alanine vs D-Alanine.',
        targetMetric: 'عكس التماثل الكايرالي',
        targetValue: 1,
        unit: 'state',
        currentValue: currentMolecule.id === 'alanine' && isChiralFlipped ? 1 : 0,
        holdTimeRequired: 3,
        tolerance: 0.1,
        isCompleted: false,
        hint: 'اختر جزيء "الألانين اللامتناظر" ثم اضغط على زر "عكس التماثل المرآوي (Invert)".',
      },
    ];
  }, [currentMolecule, isChiralFlipped]);

  const quizQuestions = [
    {
      question: 'ما هو التهجين المداري لذرات الكربون في جزيء البنزين العطري؟',
      options: ['sp³', 'sp²', 'sp', 'dsp²'],
      correctIndex: 1,
      explanation: 'ذرات الكربون الست في البنزين ذات تهجين sp² مستوٍ بزاوية 120°، وتشارك إلكترون p المتبقي لتكوين سحابة رنينية delocalized.',
    },
    {
      question: 'لماذا لا يمكن للجزيئات ذات الروابط المزدوجة الدوران بحرية حول محور الرابطة كالألكانات؟',
      options: [
        'بسبب كبر كتلة ذرة الكربون',
        'بسبب تداخل الرابطة باي (π) الجانبي الذي ينكسر عند الالتواء',
        'بسبب التنافر مع الأكسجين',
        'بسبب انخفاض درجة الحرارة دائماً',
      ],
      correctIndex: 1,
      explanation: 'الرابطة باي تنتج من تداخل جانبي بين مدارات p المتوازية؛ وأي دوران يؤدي لكسر هذا التداخل مما يتطلب طاقة هائلة (~265 kJ/mol).',
    },
    {
      question: 'ما الشرط الأساسي لامتلاك الجزيء العضوي خاصية الكايرالية (Chirality) والنشاط الضوئي؟',
      options: [
        'احتوائه على رابطة ثلاثية فقط',
        'اتصال ذرة كربون مركزية بأربع مجموعات كيميائية مختلفة تماماً',
        'أن يكون وزنه المولي أكثر من 200 g/mol',
        'احتوائه على حلقة سداسية مغلقة',
      ],
      correctIndex: 1,
      explanation: 'مركز الكايرالية يتطلب كربون غير متناظر (Asymmetric Carbon) مرتبط بأربع مجموعات مختلفة بحيث لا ينطبق الجزيء على صورته في المرآة.',
    },
    {
      question: 'ما المجموعة الوظيفية المميزة في الكحولات؟',
      options: ['-COOH كربوكسيل', '-OH هيدروكسيل', '-NH₂ أمين', '-CHO ألدهيد'],
      correctIndex: 1,
      explanation: 'مجموعة الهيدروكسيل (-OH) هي المجموعة الوظيفية المميزة لكافة الكحولات مثل الميثانول والإيثانول.',
    },
  ];

  return (
    <SimulationLayout
      title="مختبر الكيمياء العضوية والفراغية 3D"
      titleGradient="from-emerald-400 via-teal-300 to-cyan-400"
      backgroundGradient="from-slate-950 via-slate-900 to-emerald-950"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 3D Canvas Viewport */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950 shadow-2xl shadow-emerald-950/40">
            {/* Real-time 3D Scene */}
            <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }}>
              <ambientLight intensity={0.7} />
              <pointLight position={[10, 10, 10]} intensity={1.2} />
              <pointLight position={[-10, -10, -5]} intensity={0.6} color="#34d399" />
              <directionalLight position={[0, 8, 4]} intensity={0.8} />

              <CinematicCameraController preset={cameraPreset} />

              <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
                <MolecularEngine3D
                  molecule={currentMolecule}
                  renderMode={renderMode}
                  showLabels={showLabels}
                  isChiralFlipped={isChiralFlipped}
                  temperature={temperature}
                  isPlaying={isPlaying}
                />
              </Float>

              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>

            {/* CyberLab HUD Overlay */}
            <CyberLabHUD
              metrics={hudMetrics}
              title={`${currentMolecule.arabicName} • ${currentMolecule.hybridization}`}
              status="active"
              oscilloscopeWaveform="sine"
              oscilloscopeFrequency={currentMolecule.irFrequency / 500}
            />

            {/* Live Camera Presets Floating Pill */}
            <div className="absolute top-4 left-4 z-20 flex gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
              <Button
                size="sm"
                variant={cameraPreset === 'overview' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('overview')}
                className="h-7 text-xs px-2.5 text-emerald-300"
              >
                شامل
              </Button>
              <Button
                size="sm"
                variant={cameraPreset === 'microscopic' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('microscopic')}
                className="h-7 text-xs px-2.5 text-emerald-300"
              >
                ذري دقيق
              </Button>
              <Button
                size="sm"
                variant={cameraPreset === 'flow' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('flow')}
                className="h-7 text-xs px-2.5 text-emerald-300"
              >
                محور الرابطة
              </Button>
              <Button
                size="sm"
                variant={cameraPreset === 'orbit360' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('orbit360')}
                className="h-7 text-xs px-2.5 text-emerald-300"
              >
                دوران 360°
              </Button>
            </div>

            {/* Quick Render Modes & Playback Overlay */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsChiralFlipped(false);
                  setTemperature(25);
                }}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                title="إعادة ضبط"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <div className="h-4 w-px bg-slate-700 mx-1" />
              <span className="text-[11px] text-slate-400 font-mono">طراز العرض:</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={renderMode === 'ballStick' ? 'default' : 'ghost'}
                  onClick={() => setRenderMode('ballStick')}
                  className="h-7 text-xs px-2 bg-emerald-600/40 text-emerald-300 hover:bg-emerald-600/60"
                >
                  عصي وكرات
                </Button>
                <Button
                  size="sm"
                  variant={renderMode === 'spaceFill' ? 'default' : 'ghost'}
                  onClick={() => setRenderMode('spaceFill')}
                  className="h-7 text-xs px-2 text-cyan-300 hover:bg-cyan-600/30"
                >
                  فان دير فالس
                </Button>
                <Button
                  size="sm"
                  variant={renderMode === 'wireframe' ? 'default' : 'ghost'}
                  onClick={() => setRenderMode('wireframe')}
                  className="h-7 text-xs px-2 text-blue-300 hover:bg-blue-600/30"
                >
                  هيكل شبكي
                </Button>
              </div>
            </div>
          </div>

          {/* Molecule Selection Cards Bar */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <Atom className="w-4 h-4 text-emerald-400" />
                <span>اختر الجزيء العضوي للفحص المجسم:</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLabels(!showLabels)}
                  className={`h-7 text-xs border-slate-700 ${showLabels ? 'text-emerald-300 bg-emerald-950/40' : 'text-slate-400'}`}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  {showLabels ? 'إخفاء أسماء الذرات' : 'إظهار أسماء الذرات'}
                </Button>
                {currentMolecule.id === 'alanine' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsChiralFlipped(!isChiralFlipped)}
                    className="h-7 text-xs border-amber-500/50 text-amber-300 bg-amber-950/30 hover:bg-amber-900/40"
                  >
                    <Compass className="w-3.5 h-3.5 mr-1" />
                    عكس التماثل المرآوي (Invert)
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {MOLECULES.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMoleculeIdx(idx);
                    setIsChiralFlipped(false);
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                    selectedMoleculeIdx === idx
                      ? 'border-emerald-500 bg-emerald-950/50 shadow-md shadow-emerald-900/30 text-white'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold">{m.name}</span>
                  <span className="text-[11px] font-mono text-emerald-400 mt-0.5">{m.formula}</span>
                </button>
              ))}
            </div>

            {/* Molecule Detailed Spec Pill */}
            <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">{currentMolecule.arabicName}:</span>
                <span>{currentMolecule.description}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 font-mono">
                <span>التهجين: <strong className="text-cyan-300">{currentMolecule.hybridization}</strong></span>
                <span>الشكل: <strong className="text-teal-300">{currentMolecule.geometry}</strong></span>
              </div>
            </div>

            {/* Temperature Slider for Vibration Simulation */}
            <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
              <span className="whitespace-nowrap">درجة الحرارة (الاهتزاز الحراري):</span>
              <Slider
                value={[temperature]}
                onValueChange={(val) => setTemperature(val[0])}
                min={-50}
                max={150}
                step={5}
                className="flex-1"
              />
              <span className="font-mono text-emerald-400 w-12 text-left">{temperature}°C</span>
            </div>
          </div>

          {/* Gamified Laboratory Challenges */}
          <LabChallengeEngine
            challenges={challenges}
            onChallengeComplete={(c) => {
              console.log('Challenge completed:', c.title);
            }}
          />
        </div>

        {/* Right Pedagogical & Interactive CoPilot Sidebar */}
        <div className="space-y-4">
          {/* AI Lab CoPilot */}
          <LiveAILabCoPilot
            experimentContext={{
              title: 'الكيمياء العضوية والفراغية',
              currentStep: `فحص جزيء ${currentMolecule.arabicName} ذو التهجين ${currentMolecule.hybridization}`,
              userAction: `استكشاف التوزيع الفراغي للروابط والزاوية ${currentMolecule.bondAngle}°`,
              activeMetrics: {
                molecule: currentMolecule.name,
                hybridization: currentMolecule.hybridization,
                bondAngle: `${currentMolecule.bondAngle}°`,
                dipoleMoment: `${currentMolecule.dipoleMoment} D`,
                molWeight: `${currentMolecule.molWeight} g/mol`,
                resonance: currentMolecule.id === 'benzene' ? 'سحابة باي الحلقية' : 'غير أروماتي',
              }
            }}
            suggestions={[
              'ما الفرق بين الرابطة سيجما والرابطة باي في الإيثين؟',
              'كيف يؤثر عزم ثنائي القطب في درجة غليان الإيثانول مقارنة بالميثان؟',
              'اشرح مفهوم عدم التطابق المرآوي (Chirality) في الأحماض الأمينية.',
              'لماذا يمتلك حلقة البنزين ثباتاً غير عادي (طاقة الرنين)؟',
            ]}
          />

          {/* Educational Information & Chemical Data */}
          <InfoSection
            data={[
              { label: 'المركب المحدد', value: currentMolecule.arabicName, color: 'text-emerald-300' },
              { label: 'التهجين المداري', value: currentMolecule.hybridization, color: 'text-cyan-300' },
              { label: 'الهندسة الجزيئية', value: currentMolecule.geometry, color: 'text-teal-300' },
              { label: 'عزم الاستقطاب', value: `${currentMolecule.dipoleMoment} D`, color: 'text-amber-300' },
              { label: 'تردد طيف IR المقدر', value: `${currentMolecule.irFrequency} cm⁻¹`, color: 'text-purple-300' },
            ]}
            formulas={[
              { name: 'الألكانات المشبعة', formula: 'CₙH₂ₙ₊₂', description: 'جميع الروابط أحادية سيجما σ ذات تهجين sp³ بزاوية 109.5°' },
              { name: 'الألكينات غير المشبعة', formula: 'CₙH₂ₙ', description: 'تحتوي رابطة مزدوجة واحدة (σ + π) وتمنع الدوران الحر' },
              { name: 'طاقة الرنين في البنزين', formula: 'ΔH_res ≈ 152 kJ/mol', description: 'ثبات فائق ناتج عن لا تمركز إلكترونات باي 6π في الحلقة' },
            ]}
            explanation="تعتمد الكيمياء العضوية على ذرة الكربون وقدرتها الفريدة على تشكيل أربع روابط تساهمية قوية وسلاسل طويلة وحلقات معقدة. إن التوزيع الفراغي ثلاثي الأبعاد (Stereochemistry) هو الذي يحدد التفاعلية الحيوية، حيث تميز المستقبلات الخلوية والأدوية بين المتشاكلات الفراغية بدقة متناهية."
            facts={[
              'الكربون هو العنصر الوحيد القادر على تكوين ملايين المركبات المتنوعة بفضل قدرته على الارتباط المتكرر (Catenation).',
              'في عام 1865، توصل أوغست كيكولي إلى البنية الحلقية للبنزين بعد أن حلم بحية تعض ذيلها (أوربوروس).',
              'جسم الإنسان يستخدم فقط المتشاكلات الفراغية من النوع L في بناء البروتينات (L-Amino Acids)، بينما يستخدم السكريات من النوع D.',
              'الرابطة باي لا تسمح بالدوران المحوري، مما يؤدي لظاهرة المتشكلات الهندسية (Cis/Trans Isomerism).',
            ]}
          />

          {/* Conceptual Quiz Section */}
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default OrganicChemistrySimulation;
