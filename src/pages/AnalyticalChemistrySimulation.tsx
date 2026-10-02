import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Cylinder, Sphere, Box, Html } from '@react-three/drei';
import * as THREE from 'three';
import SimulationLayout from '@/components/simulations/SimulationLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Droplets, Activity, Eye, Zap, Layers, Sparkles } from 'lucide-react';
import InfoSection from '@/components/simulations/InfoSection';
import QuizSection from '@/components/simulations/QuizSection';

// Core Framework
import CyberLabHUD from '@/components/simulations/CyberLabHUD';
import LiveAILabCoPilot from '@/components/simulations/LiveAILabCoPilot';
import CinematicCameraController, { CameraPreset } from '@/components/simulations/CinematicCameraController';
import LabChallengeEngine, { Challenge } from '@/components/simulations/LabChallengeEngine';

type AnalyticalMode = 'titration' | 'spectroscopy' | 'chromatography' | 'phmeter';

// Helper: Calculate pH during titration of 25mL 0.1M HCl with 0.1M NaOH
const calculateTitrationPH = (volAdded: number): number => {
  if (volAdded < 24.0) {
    const unreacted = (25.0 - volAdded) / (25.0 + volAdded);
    return Math.max(1.0, 1.0 - Math.log10(Math.max(unreacted * 0.1, 1e-6)));
  } else if (volAdded <= 26.0) {
    // Equivalence steep transition around 25.0 mL
    const delta = volAdded - 25.0;
    return 7.0 + delta * 3.5;
  } else {
    const excess = (volAdded - 25.0) / (25.0 + volAdded);
    const pOH = -Math.log10(Math.max(excess * 0.1, 1e-6));
    return Math.min(13.5, 14.0 - pOH);
  }
};

// Mode 1: 3D Titration Rig
const TitrationRig3D: React.FC<{
  titrantVol: number;
  isPlaying: boolean;
}> = ({ titrantVol, isPlaying }) => {
  const stirRef = useRef<THREE.Mesh>(null);
  const dropRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (stirRef.current && isPlaying) {
      stirRef.current.rotation.y += delta * 12;
    }
    if (dropRef.current && isPlaying && titrantVol < 48) {
      const dropCycle = (state.clock.elapsedTime * 4) % 1;
      dropRef.current.position.y = 1.3 - dropCycle * 1.5;
      dropRef.current.scale.setScalar(dropCycle > 0.95 ? 0.01 : 1);
    }
  });

  const pH = calculateTitrationPH(titrantVol);
  // Color transition for Phenolphthalein indicator: Colorless (pH < 8.2) -> Pink -> Magenta (pH > 10)
  const solutionColor = useMemo(() => {
    if (pH < 8.2) return new THREE.Color('#38bdf8').multiplyScalar(0.4); // Pale clear water
    const intensity = Math.min(1, (pH - 8.2) / 2.0);
    const c = new THREE.Color('#e0e7ff').lerp(new THREE.Color('#ec4899'), intensity);
    return c;
  }, [pH]);

  const buretteLiquidHeight = Math.max(0.1, (50 - titrantVol) / 50 * 2.2);

  return (
    <group position={[0, -0.4, 0]}>
      {/* Magnetic Stirrer Base Plate */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.4, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Top ceramic plate */}
      <mesh position={[0, -1.28, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.05, 32]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Erlenmeyer Conical Flask */}
      <group position={[0, -0.4, 0]}>
        {/* Glass body (cone) */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.35, 1.1, 1.6, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.92}
            opacity={1}
            transparent
            roughness={0.08}
            ior={1.5}
            thickness={0.2}
          />
        </mesh>
        {/* Flask neck */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.5, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.92}
            opacity={1}
            transparent
            roughness={0.08}
            ior={1.5}
            thickness={0.2}
          />
        </mesh>
        {/* Solution inside flask */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.85, 1.05, 0.85, 32]} />
          <meshStandardMaterial
            color={solutionColor}
            transparent
            opacity={0.75}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Magnetic Stir Flea (rotating bar) */}
        <mesh ref={stirRef} position={[0, -0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>

        {/* Swirling Vortex Effect */}
        {isPlaying && (
          <mesh position={[0, 0.05, 0]}>
            <coneGeometry args={[0.4, 0.5, 16]} />
            <meshStandardMaterial color={solutionColor} transparent opacity={0.4} />
          </mesh>
        )}
      </group>

      {/* Burette Glass Tube Stand & Clamp */}
      <mesh position={[-1.2, 0.8, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 4.4, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Stand Base */}
      <mesh position={[-1.0, -1.45, 0]}>
        <boxGeometry args={[1.0, 0.15, 0.8]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      {/* Burette Clamp arm */}
      <mesh position={[-0.6, 2.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>

      {/* Burette Glass Tube */}
      <group position={[0, 2.5, 0]}>
        {/* Outer Burette Wall */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 2.6, 24, 1, true]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.9}
            transparent
            roughness={0.1}
            ior={1.48}
            thickness={0.1}
          />
        </mesh>
        {/* Liquid remaining inside burette */}
        <mesh position={[0, -1.3 + buretteLiquidHeight / 2, 0]}>
          <cylinderGeometry args={[0.12, 0.12, buretteLiquidHeight, 24]} />
          <meshStandardMaterial color="#f43f5e" transparent opacity={0.8} roughness={0.1} />
        </mesh>

        {/* Burette Stopcock Valve */}
        <mesh position={[0, -1.4, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.45, 16]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.6} />
        </mesh>
        {/* Burette Fine Dispensing Tip */}
        <mesh position={[0, -1.65, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.1, 0.4, 16]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} transparent roughness={0.1} />
        </mesh>
      </group>

      {/* Falling Droplet Stream */}
      <mesh ref={dropRef} position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#f43f5e" transparent opacity={0.85} roughness={0.1} />
      </mesh>
    </group>
  );
};

// Mode 2: 3D UV-Vis Spectrophotometer & Beer-Lambert Cuvette
const SpectroscopyRig3D: React.FC<{
  wavelength: number;
  concentration: number;
  extinctionCoeff: number;
  pathLength: number;
  isPlaying: boolean;
}> = ({ wavelength, concentration, extinctionCoeff, pathLength, isPlaying }) => {
  const beamRef = useRef<THREE.Mesh>(null);

  // Beer-Lambert law: A = epsilon * c * l
  const absorbance = extinctionCoeff * concentration * pathLength;
  const transmittance = Math.pow(10, -absorbance); // 0.0 to 1.0

  // Calculate RGB color from wavelength (380 - 780 nm)
  const beamColor = useMemo(() => {
    let r = 0, g = 0, b = 0;
    if (wavelength >= 380 && wavelength < 440) {
      r = -(wavelength - 440) / (440 - 380);
      b = 1.0;
    } else if (wavelength >= 440 && wavelength < 490) {
      g = (wavelength - 440) / (490 - 440);
      b = 1.0;
    } else if (wavelength >= 490 && wavelength < 510) {
      g = 1.0;
      b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength < 580) {
      r = (wavelength - 510) / (580 - 510);
      g = 1.0;
    } else if (wavelength >= 580 && wavelength < 645) {
      r = 1.0;
      g = -(wavelength - 645) / (645 - 580);
    } else if (wavelength >= 645 && wavelength <= 780) {
      r = 1.0;
    }
    return new THREE.Color(r, g, b);
  }, [wavelength]);

  return (
    <group position={[0, 0, 0]}>
      {/* Light Source Lamp Housing */}
      <mesh position={[-2.8, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Lamp lens */}
      <mesh position={[-2.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 24]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.5} />
      </mesh>

      {/* Monochromator Prism */}
      <mesh position={[-1.5, 0, 0]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.7, 3]} />
        <meshPhysicalMaterial
          color="#a5f3fc"
          transmission={0.9}
          transparent
          ior={1.65}
          roughness={0.05}
        />
      </mesh>

      {/* Incoming Monochromatic Light Beam (I_0) */}
      <mesh position={[-0.75, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 16]} />
        <meshBasicMaterial color={beamColor} transparent opacity={0.95} />
      </mesh>

      {/* Optical Quartz Cuvette (Cell) */}
      <group position={[0, 0, 0]}>
        {/* Cuvette Quartz Body */}
        <mesh>
          <boxGeometry args={[0.6, 1.6, 0.6]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.95}
            transparent
            ior={1.46}
            roughness={0.04}
            thickness={0.05}
          />
        </mesh>
        {/* Chemical Solution Inside Cuvette */}
        <mesh>
          <boxGeometry args={[0.5, 1.4, 0.5]} />
          <meshStandardMaterial
            color="#0284c7"
            transparent
            opacity={0.25 + concentration * 0.7}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* Transmitted Attenuated Light Beam (I) */}
      <mesh ref={beamRef} position={[1.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 16]} />
        <meshBasicMaterial
          color={beamColor}
          transparent
          opacity={Math.max(0.05, transmittance * 0.95)}
        />
      </mesh>

      {/* Photoelectric Detector / Photodiode Array */}
      <mesh position={[2.0, 0, 0]}>
        <boxGeometry args={[0.6, 1.2, 0.8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Sensor slit */}
      <mesh position={[1.68, 0, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.1]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>

      {/* Real-time Optical Ray Glow */}
      <pointLight position={[-0.75, 0, 0]} color={beamColor} intensity={0.8} distance={2} />
      <pointLight position={[1.0, 0, 0]} color={beamColor} intensity={transmittance * 0.8} distance={2} />
    </group>
  );
};

// Mode 3: 3D Chromatography Column & Separation Chamber
const ChromatographyRig3D: React.FC<{
  elutionProgress: number; // 0 to 1
  isPlaying: boolean;
}> = ({ elutionProgress, isPlaying }) => {
  // 3 sample dye bands with distinct retention factors Rf
  const bands = [
    { name: 'كاروتين (Carotene)', color: '#f59e0b', rf: 0.82 },
    { name: 'كلوروفيل أ (Chlorophyll a)', color: '#10b981', rf: 0.55 },
    { name: 'زانثوفيل (Xanthophyll)', color: '#ef4444', rf: 0.32 },
  ];

  return (
    <group position={[0, -0.3, 0]}>
      {/* Chromatography Glass Column */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 3.2, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.92}
          transparent
          ior={1.48}
          roughness={0.06}
          thickness={0.1}
        />
      </mesh>

      {/* Stationary Phase (Packed Silica Gel / Alumina) */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 2.6, 32]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} transparent opacity={0.65} />
      </mesh>

      {/* Solvent Front Eluting Line */}
      <mesh position={[0, 1.7 - elutionProgress * 2.5, 0]}>
        <cylinderGeometry args={[0.275, 0.275, 0.04, 32]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
      </mesh>

      {/* Moving Analyte Separation Bands */}
      {bands.map((band, idx) => {
        const bandY = 1.6 - elutionProgress * 2.4 * band.rf;
        return (
          <mesh key={idx} position={[0, bandY, 0]}>
            <cylinderGeometry args={[0.272, 0.272, 0.18, 32]} />
            <meshStandardMaterial
              color={band.color}
              emissive={band.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.85}
              roughness={0.4}
            />
          </mesh>
        );
      })}

      {/* Bottom Stopcock & Drip Tip */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>
      <mesh position={[0, -1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.35, 16]} />
        <meshStandardMaterial color="#0284c7" metalness={0.5} />
      </mesh>

      {/* Collection Fraction Test Tube */}
      <mesh position={[0, -2.1, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 1.2, 24, 1, true]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.92} transparent roughness={0.08} />
      </mesh>
      {/* Eluent Liquid collected in tube */}
      <mesh position={[0, -2.4 + elutionProgress * 0.4, 0]}>
        <cylinderGeometry args={[0.16, 0.16, Math.max(0.05, elutionProgress * 0.8), 24]} />
        <meshStandardMaterial color="#f59e0b" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

// Mode 4: 3D Combination pH Glass Electrode Meter
const PHMeterRig3D: React.FC<{
  phValue: number;
  temperature: number;
}> = ({ phValue, temperature }) => {
  // Nernst Equation potential: E = E0 - (2.303 RT/F) * pH
  // At 25°C, slope is ~ 59.16 mV per pH unit
  const slope = (54.2 + (temperature / 100) * 19.8);
  const cellVoltageMV = (7.0 - phValue) * slope;

  const solColor = useMemo(() => {
    // Universal indicator color scheme
    if (phValue < 3) return '#ef4444'; // Red
    if (phValue < 6) return '#f97316'; // Orange
    if (phValue < 8) return '#22c55e'; // Green (Neutral)
    if (phValue < 11) return '#06b6d4'; // Blue
    return '#8b5cf6'; // Violet
  }, [phValue]);

  return (
    <group position={[0, 0, 0]}>
      {/* Sample Beaker */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 1.8, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={0.93}
          transparent
          ior={1.48}
          roughness={0.06}
          thickness={0.15}
        />
      </mesh>
      {/* Buffer Solution in beaker */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[1.15, 1.15, 1.3, 32]} />
        <meshStandardMaterial color={solColor} transparent opacity={0.7} roughness={0.15} />
      </mesh>

      {/* Combination pH Glass Electrode Probe */}
      <group position={[0, 0.5, 0]}>
        {/* Epoxy probe body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 2.2, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Sensitive Glass Membrane Bulb */}
        <mesh position={[0, -1.15, 0]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshPhysicalMaterial
            color="#67e8f9"
            transmission={0.88}
            transparent
            ior={1.52}
            roughness={0.02}
            emissive="#06b6d4"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Internal Ag/AgCl reference wire */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.6, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Top cable connector */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.3, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>
    </group>
  );
};

export const AnalyticalChemistrySimulation: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AnalyticalMode>('titration');
  const [isPlaying, setIsPlaying] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');

  // Mode 1: Titration State
  const [titrantVolume, setTitrantVolume] = useState(20.0); // mL added

  // Mode 2: Spectroscopy State
  const [wavelength, setWavelength] = useState(520); // nm
  const [concentration, setConcentration] = useState(0.4); // mol/L
  const [extinctionCoeff, setExtinctionCoeff] = useState(2.8); // L/(mol*cm)
  const pathLength = 1.0; // cm

  // Mode 3: Chromatography State
  const [elutionTime, setElutionTime] = useState(0.45); // 0 to 1

  // Mode 4: pH Meter State
  const [solutionPH, setSolutionPH] = useState(7.0);
  const [temperature, setTemperature] = useState(25); // °C

  // Dynamic calculations
  const titrationPH = useMemo(() => calculateTitrationPH(titrantVolume), [titrantVolume]);
  const absorbance = useMemo(() => extinctionCoeff * concentration * pathLength, [extinctionCoeff, concentration]);
  const transmittancePercent = useMemo(() => Math.pow(10, -absorbance) * 100, [absorbance]);

  // HUD Telemetry Metrics based on current analytical mode
  const hudMetrics = useMemo(() => {
    switch (activeMode) {
      case 'titration':
        return [
          {
            id: 'ph',
            label: 'الأس الهيدروجيني (pH)',
            value: Number(titrationPH.toFixed(2)),
            unit: 'pH',
            status: titrationPH > 6.5 && titrationPH < 7.5 ? ('critical' as const) : ('normal' as const),
            min: 0,
            max: 14,
          },
          {
            id: 'vol',
            label: 'حجم المعاير (NaOH)',
            value: Number(titrantVolume.toFixed(1)),
            unit: 'mL',
            status: 'normal' as const,
            min: 0,
            max: 50,
          },
          {
            id: 'equiv',
            label: 'القرب من التكافؤ',
            value: Number(Math.max(0, 100 - Math.abs(titrantVolume - 25) * 8).toFixed(0)),
            unit: '%',
            status: Math.abs(titrantVolume - 25) < 0.5 ? ('critical' as const) : ('normal' as const),
            min: 0,
            max: 100,
          },
          {
            id: 'stir_speed',
            label: 'سرعة التحريك المغناطيسي',
            value: isPlaying ? 450 : 0,
            unit: 'RPM',
            status: 'normal' as const,
            min: 0,
            max: 1000,
          },
        ];
      case 'spectroscopy':
        return [
          {
            id: 'absorbance',
            label: 'الامتصاص الضوئي (A)',
            value: Number(absorbance.toFixed(3)),
            unit: 'AU',
            status: absorbance > 1.0 ? ('warning' as const) : ('normal' as const),
            min: 0,
            max: 2.5,
          },
          {
            id: 'transmittance',
            label: 'النفاذية الضوئية (T%)',
            value: Number(transmittancePercent.toFixed(1)),
            unit: '%',
            status: 'normal' as const,
            min: 0,
            max: 100,
          },
          {
            id: 'wavelength',
            label: 'الطول الموجي المستهدف',
            value: wavelength,
            unit: 'nm',
            status: 'normal' as const,
            min: 380,
            max: 780,
          },
          {
            id: 'conc',
            label: 'تركيز العينة (c)',
            value: concentration,
            unit: 'M',
            status: 'normal' as const,
            min: 0.05,
            max: 1.0,
          },
        ];
      case 'chromatography':
        return [
          {
            id: 'front',
            label: 'جبهة المذيب (Solvent Front)',
            value: Number((elutionTime * 12.0).toFixed(1)),
            unit: 'cm',
            status: 'normal' as const,
            min: 0,
            max: 12,
          },
          {
            id: 'rf_carotene',
            label: 'معامل Rf للكاروتين',
            value: 0.82,
            unit: 'Rf',
            status: 'normal' as const,
            min: 0,
            max: 1,
          },
          {
            id: 'rf_chlorophyll',
            label: 'معامل Rf للكلوروفيل',
            value: 0.55,
            unit: 'Rf',
            status: 'normal' as const,
            min: 0,
            max: 1,
          },
          {
            id: 'flow_rate',
            label: 'معدل سريان العمود',
            value: isPlaying ? 1.4 : 0,
            unit: 'mL/min',
            status: 'normal' as const,
            min: 0,
            max: 3,
          },
        ];
      case 'phmeter':
        return [
          {
            id: 'meter_ph',
            label: 'قراءة المسبار الرقمي',
            value: Number(solutionPH.toFixed(2)),
            unit: 'pH',
            status: 'normal' as const,
            min: 0,
            max: 14,
          },
          {
            id: 'cell_emf',
            label: 'القوة الدافعة للمسبار',
            value: Number(((7.0 - solutionPH) * 59.16).toFixed(1)),
            unit: 'mV',
            status: 'normal' as const,
            min: -400,
            max: 400,
          },
          {
            id: 'temperature',
            label: 'تعويض الحرارة التلقائي (ATC)',
            value: temperature,
            unit: '°C',
            status: 'normal' as const,
            min: 0,
            max: 60,
          },
          {
            id: 'h_conc',
            label: 'تركيز أيونات [H⁺]',
            value: Number(Math.pow(10, -solutionPH) * 1e6).toFixed(2),
            unit: 'μM',
            status: 'normal' as const,
            min: 0,
            max: 1000,
          },
        ];
    }
  }, [activeMode, titrationPH, titrantVolume, isPlaying, absorbance, transmittancePercent, wavelength, concentration, elutionTime, solutionPH, temperature]);

  // Gamified Challenges
  const challenges: Challenge[] = useMemo(() => {
    return [
      {
        id: 'titration_equivalence',
        title: 'نقطة التكافؤ التامة في المعايرة',
        description: 'اضبط حجم المعاير NaOH للوصول بدقة فائقة لنقطة التكافؤ والتعادل الحجمي (pH = 7.0 ± 0.5) عند 25.0 mL.',
        targetMetric: 'الأس الهيدروجيني (pH)',
        targetValue: 7.0,
        unit: 'pH',
        currentValue: activeMode === 'titration' ? titrationPH : 0,
        holdTimeRequired: 3,
        tolerance: 0.5,
        isCompleted: false,
        hint: 'انتقل لتبويب "المعايرة الحجمية" وحرك شريط الحجم بدقة ليقترب من 25.0 mL.',
      },
      {
        id: 'beer_lambert_ideal',
        title: 'معايرة الامتصاص الضوئي المثالي (Beer-Lambert)',
        description: 'في جهاز التحليل الطيفي، اضبط تركيز المحلول ومعامل الامتصاص بحيث يقع الامتصاص (A) بين 0.80 و 0.88 لتحقيق أعلى دقة قياس.',
        targetMetric: 'الامتصاص الضوئي (A)',
        targetValue: 0.84,
        unit: 'AU',
        currentValue: activeMode === 'spectroscopy' ? absorbance : 0,
        holdTimeRequired: 3,
        tolerance: 0.05,
        isCompleted: false,
        hint: 'انتقل لتبويب "التحليل الطيفي" واضبط التركيز إلى حوالي 0.30 M مع معامل امتصاص 2.8.',
      },
      {
        id: 'chromatography_separation',
        title: 'فصل صبغات العمود الكروماتوغرافي',
        description: 'اسمح بتدفق المذيب حتى تتجاوز جبهة المذيب (Solvent Front) مسافة 9.0 cm وتحصل على فصل تام لحزم الأصباغ.',
        targetMetric: 'جبهة المذيب',
        targetValue: 9.0,
        unit: 'cm',
        currentValue: activeMode === 'chromatography' ? elutionTime * 12.0 : 0,
        holdTimeRequired: 2,
        tolerance: 1.0,
        isCompleted: false,
        hint: 'انتقل لتبويب "الكروماتوغرافيا" ودع شريط تقدم الفصل يصل إلى أكثر من 75%.',
      },
    ];
  }, [activeMode, titrationPH, absorbance, elutionTime]);

  const quizQuestions = [
    {
      question: 'ما هي نقطة التكافؤ (Equivalence Point) في معايرة حمض وقاعدة؟',
      options: [
        'النقطة التي يتغير عندها لون الكاشف فقط',
        'النقطة التي تتساوى عندها مكافئات الحمض مع مكافئات القاعدة تماماً وفق المعاملات المتكافئة',
        'النقطة التي يغلي عندها المحلول في الدورق',
        'بداية خروج القطرات من السحاحة',
      ],
      correctIndex: 1,
      explanation: 'نقطة التكافؤ هي النقطة الكيميائية الدقيقة لتكافؤ أيونات الهيدروجين والهيدروكسيد، بينما نقطة النهاية (End Point) هي النقطة التجريبية لتغير لون الكاشف.',
    },
    {
      question: 'وفق قانون بير-لامبرت (A = ε × c × l)، ماذا يحدث للامتصاص الضوئي إذا تضاعف تركيز العينة مرتين؟',
      options: [
        'يقل الامتصاص إلى النصف',
        'يتضاعف الامتصاص الضوئي إلى الضعف خطياً',
        'يزداد الامتصاص بمقدار 10 أضعاف لوغاريتمياً',
        'يبقى ثابتاً ولا يتأثر بالتركيز',
      ],
      correctIndex: 1,
      explanation: 'العلاقة خطية طردية ومباشرة بين الامتصاص الضوئي والتركيز المولي للمادة الماصة وفق قانون بير-لامبرت.',
    },
    {
      question: 'ما هو معامل الاحتجاز أو الاستبقاء (Rf) في الكروماتوغرافيا؟',
      options: [
        'المسافة التي قطعتها المادة مقسومة على المسافة التي قطعتها جبهة المذيب',
        'سرعة تدفق السائل من قاع العمود',
        'الوزن الجزيئي للصبغة المفصولة',
        'درجة حرارة حجرة الفصل',
      ],
      correctIndex: 0,
      explanation: 'معامل Rf هو النسبة بين المسافة التي قطعها المركب إلى المسافة الكلية التي قطعها المذيب المستحلب.',
    },
    {
      question: 'لماذا يتطلب قطب الـ pH الزجاجي تعويضاً حرارياً أوتوماتيكياً (ATC)؟',
      options: [
        'لأن الزجاج ينكسر عند تغير الحرارة',
        'لأن ميل استجابة نيرنست (Nernst Slope = 2.303 RT/F) يتناسب طردياً مع درجة الحرارة المطلقة بالكلفن',
        'لأن الماء يتبخر بسرعة',
        'لتغيير لون القطب',
      ],
      correctIndex: 1,
      explanation: 'معادلة نيرنست تتضمن معامل درجة الحرارة المطلقة T، مما يغير جهد المسبار لكل وحدة pH بمقدار 0.2 mV لكل درجة مئوية.',
    },
  ];

  return (
    <SimulationLayout
      title="مختبر الكيمياء التحليلية والمطيافية 3D"
      titleGradient="from-cyan-400 via-teal-300 to-emerald-400"
      backgroundGradient="from-slate-950 via-slate-900 to-cyan-950"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 3D Viewport Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 shadow-2xl shadow-cyan-950/40">
            <Canvas camera={{ position: [0, 1.2, 5.5], fov: 45 }}>
              <ambientLight intensity={0.7} />
              <pointLight position={[8, 8, 8]} intensity={1.2} />
              <pointLight position={[-8, -5, -4]} intensity={0.6} color="#06b6d4" />
              <directionalLight position={[0, 6, 4]} intensity={0.8} />

              <CinematicCameraController preset={cameraPreset} />

              <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.1}>
                {activeMode === 'titration' && (
                  <TitrationRig3D titrantVol={titrantVolume} isPlaying={isPlaying} />
                )}
                {activeMode === 'spectroscopy' && (
                  <SpectroscopyRig3D
                    wavelength={wavelength}
                    concentration={concentration}
                    extinctionCoeff={extinctionCoeff}
                    pathLength={pathLength}
                    isPlaying={isPlaying}
                  />
                )}
                {activeMode === 'chromatography' && (
                  <ChromatographyRig3D
                    elutionProgress={elutionTime}
                    isPlaying={isPlaying}
                  />
                )}
                {activeMode === 'phmeter' && (
                  <PHMeterRig3D
                    phValue={solutionPH}
                    temperature={temperature}
                  />
                )}
              </Float>

              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            </Canvas>

            {/* CyberLab HUD Overlay */}
            <CyberLabHUD
              metrics={hudMetrics}
              title={
                activeMode === 'titration'
                  ? 'المعايرة الحجمية وتغير الأس الهيدروجيني'
                  : activeMode === 'spectroscopy'
                  ? 'مطياف الأشعة المرئية • قانون بير-لامبرت'
                  : activeMode === 'chromatography'
                  ? 'العمود الكروماتوغرافي وفصل الصبغات'
                  : 'مسبار قطب الزجاج الرقمي وتوازن نيرنست'
              }
              status="active"
              oscilloscopeWaveform={activeMode === 'spectroscopy' ? 'triangle' : 'sine'}
              oscilloscopeFrequency={activeMode === 'titration' ? titrantVolume / 10 : 3.5}
            />

            {/* Camera Presets Selector */}
            <div className="absolute top-4 left-4 z-20 flex gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
              <Button
                size="sm"
                variant={cameraPreset === 'overview' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('overview')}
                className="h-7 text-xs px-2.5 text-cyan-300"
              >
                شامل
              </Button>
              <Button
                size="sm"
                variant={cameraPreset === 'microscopic' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('microscopic')}
                className="h-7 text-xs px-2.5 text-cyan-300"
              >
                مجهري دقيق
              </Button>
              <Button
                size="sm"
                variant={cameraPreset === 'flow' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('flow')}
                className="h-7 text-xs px-2.5 text-cyan-300"
              >
                تدفق الحزمة
              </Button>
              <Button
                size="sm"
                variant={cameraPreset === 'orbit360' ? 'default' : 'ghost'}
                onClick={() => setCameraPreset('orbit360')}
                className="h-7 text-xs px-2.5 text-cyan-300"
              >
                دوران 360°
              </Button>
            </div>

            {/* Bottom Playback & Reset Bar */}
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 w-8 p-0 text-cyan-400 hover:text-cyan-300"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTitrantVolume(0);
                  setElutionTime(0.1);
                  setSolutionPH(7.0);
                }}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                title="إعادة ضبط"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Analytical Mode Selector & Parameter Controls */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>اختر المنظومة التحليلية:</span>
              </div>
            </div>

            <Tabs value={activeMode} onValueChange={(val) => setActiveMode(val as AnalyticalMode)}>
              <TabsList className="bg-slate-800/80 w-full grid grid-cols-4">
                <TabsTrigger value="titration" className="text-xs">المعايرة الحجمية</TabsTrigger>
                <TabsTrigger value="spectroscopy" className="text-xs">التحليل الطيفي</TabsTrigger>
                <TabsTrigger value="chromatography" className="text-xs">الكروماتوغرافيا</TabsTrigger>
                <TabsTrigger value="phmeter" className="text-xs">مسبار الـ pH</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Mode-specific Controls */}
            {activeMode === 'titration' && (
              <div className="space-y-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>حجم المحلول القياسي المضاف من السحاحة (NaOH):</span>
                  <span className="font-mono text-cyan-400 font-bold">{titrantVolume.toFixed(1)} mL</span>
                </div>
                <Slider
                  value={[titrantVolume]}
                  onValueChange={(val) => setTitrantVolume(val[0])}
                  min={0}
                  max={50}
                  step={0.1}
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>0 mL (حمض قوي)</span>
                  <span className="text-amber-400">نقطة التكافؤ ~ 25.0 mL</span>
                  <span>50 mL (فائض قاعدة)</span>
                </div>
              </div>
            )}

            {activeMode === 'spectroscopy' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>الطول الموجي للضوء (λ):</span>
                    <span className="font-mono text-cyan-400 font-bold">{wavelength} nm</span>
                  </div>
                  <Slider
                    value={[wavelength]}
                    onValueChange={(val) => setWavelength(val[0])}
                    min={380}
                    max={780}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>تركيز المادة الماصة (c):</span>
                    <span className="font-mono text-teal-400 font-bold">{concentration.toFixed(2)} M</span>
                  </div>
                  <Slider
                    value={[concentration]}
                    onValueChange={(val) => setConcentration(val[0])}
                    min={0.05}
                    max={1.0}
                    step={0.02}
                  />
                </div>
              </div>
            )}

            {activeMode === 'chromatography' && (
              <div className="space-y-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span>تقدم سريان المذيب (Elution Progress):</span>
                  <span className="font-mono text-cyan-400 font-bold">{Math.round(elutionTime * 100)}%</span>
                </div>
                <Slider
                  value={[elutionTime]}
                  onValueChange={(val) => setElutionTime(val[0])}
                  min={0.05}
                  max={1.0}
                  step={0.01}
                />
              </div>
            )}

            {activeMode === 'phmeter' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>الأس الهيدروجيني للمحلول (pH):</span>
                    <span className="font-mono text-cyan-400 font-bold">{solutionPH.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[solutionPH]}
                    onValueChange={(val) => setSolutionPH(val[0])}
                    min={0}
                    max={14}
                    step={0.1}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>درجة الحرارة للتعويض (ATC):</span>
                    <span className="font-mono text-amber-400 font-bold">{temperature}°C</span>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={(val) => setTemperature(val[0])}
                    min={5}
                    max={60}
                    step={1}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Gamified Laboratory Challenges */}
          <LabChallengeEngine
            challenges={challenges}
            onChallengeComplete={(c) => {
              console.log('Challenge completed:', c.title);
            }}
          />
        </div>

        {/* Right Pedagogical & Live CoPilot Column */}
        <div className="space-y-4">
          {/* AI Lab CoPilot */}
          <LiveAILabCoPilot
            experimentContext={{
              title: 'الكيمياء التحليلية والمطيافية',
              currentStep: `تشغيل المنظومة: ${activeMode}`,
              userAction:
                activeMode === 'titration'
                  ? `إضافة حجم ${titrantVolume.toFixed(1)} mL وحساب نقطة التكافؤ`
                  : activeMode === 'spectroscopy'
                  ? `قياس الامتصاص الضوئي عند الطول الموجي ${wavelength} nm والتركيز ${concentration} M`
                  : activeMode === 'chromatography'
                  ? `فصل الصبغات بحساب معامل الاحتجاز Rf للجبهة`
                  : `معايرة مسبار نيرنست عند درجة حرارة ${temperature}°C`,
              activeMetrics: {
                analyticalMode: activeMode,
                pH: activeMode === 'titration' ? titrationPH.toFixed(2) : solutionPH.toFixed(2),
                absorbance: absorbance.toFixed(3),
                transmittance: `${transmittancePercent.toFixed(1)}%`,
                solventFront: `${(elutionTime * 12.0).toFixed(1)} cm`,
              }
            }}
            suggestions={[
              'كيف تختلف نقطة النهاية (End Point) عن نقطة التكافؤ الحقيقية؟',
              'ما هي الحدود الفيزيائية لقانون بير-لامبرت عند التراكيز المرتفعة؟',
              'كيف يؤثر استقطاب المذيب في قيم معاملات الاحتجاز Rf في الكروماتوغرافيا؟',
              'اشرح آلية توليد الجهد الكهربائي عبر الغشاء الزجاجي في مسبار pH.',
            ]}
          />

          {/* Educational Information Section */}
          <InfoSection
            data={[
              { label: 'المنظومة التحليلية', value: activeMode, color: 'text-cyan-300' },
              { label: 'قيمة الامتصاص A', value: absorbance.toFixed(3), color: 'text-teal-300' },
              { label: 'النفاذية الضوئية T', value: `${transmittancePercent.toFixed(1)}%`, color: 'text-emerald-300' },
              { label: 'الأس الهيدروجيني pH', value: activeMode === 'titration' ? titrationPH.toFixed(2) : solutionPH.toFixed(2), color: 'text-amber-300' },
            ]}
            formulas={[
              { name: 'قانون بير-لامبرت', formula: 'A = ε × c × l', description: 'الامتصاص الضوئي يساوي حاصل ضرب معامل الامتصاص في التركيز وطول المسار' },
              { name: 'معامل الاحتجاز الكروماتوغرافي', formula: 'Rf = d_substance / d_solvent', description: 'نسبة المسافة التي قطعتها العينة إلى مسافة جبهة المذيب' },
              { name: 'معادلة نيرنست للجهد الكهربائي', formula: 'E = E° - (2.303 RT / F) × pH', description: 'الجهد الناتج عن الغشاء الزجاجي يتناسب خطياً مع الرقم الهيدروجيني والحرارة' },
            ]}
            explanation="الكيمياء التحليلية هي العلم الذي يحدد ماهية وكمية المركبات الكيميائية في المواد. تُعد تقنيات المعايرة الحجمية الدقيقة والتحليل الطيفي بالأشعة فوق البنفسجية والمرئية وفصل الكروماتوغرافيا ركائز أساسية في مراقبة جودة الأدوية، والتحاليل الجنائية والطبية، ومراقبة تلوث البيئة."
            facts={[
              'قانون بير-لامبرت ينهار عند التراكيز العالية (> 0.01 M) بسبب التفاعلات الكهروستاتيكية وتغير معامل الانكسار للمحلول.',
              'الكروماتوغرافيا ابتكار طوره عالم النبات الروسي ميخائيل تسفيت عام 1900 لفصل أصباغ أوراق النبات كاليخضور والكاروتين.',
              'تحتوي السحاحات التحليلية الحديثة ومجسات الـ pH على معالجات دقيقة مدمجة تقرأ تغيرات الجهد بأجزاء الملي فولت وتجري تصحيحاً حرارياً لحظياً.',
            ]}
          />

          {/* Interactive Quiz Section */}
          <QuizSection questions={quizQuestions} />
        </div>
      </div>
    </SimulationLayout>
  );
};

export default AnalyticalChemistrySimulation;
