import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface LHCChamber3DProps {
  beamsLaunched: boolean;
  beamSpeed: number;
  beamEnergy: number; // in GeV (e.g. 450 to 14000)
  collisionActive: boolean;
  particleType: 'proton' | 'lead-ion';
  cameraPreset: 'tunnel' | 'detector' | 'collision' | 'overview';
}

// -------------------------------------------------------------
// Sub-component: 3D ATLAS/CMS Detector Shell
// -------------------------------------------------------------
function DetectorGeometry3D({ collisionActive }: { collisionActive: boolean }) {
  const detectorRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (detectorRef.current) {
      // Subtle ambient rotation when idle
      const t = clock.getElapsedTime();
      detectorRef.current.rotation.z = Math.sin(t * 0.2) * 0.03;
    }
  });

  return (
    <group ref={detectorRef} rotation={[0, 0, Math.PI / 2]}>
      {/* Outer Muon Spectrometer Shell */}
      <mesh>
        <cylinderGeometry args={[4.2, 4.2, 8.0, 32, 1, true]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.9}
          roughness={0.3}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Toroid Magnet Coils (8 barrel ribs) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[3.6, 0, 0]}>
              <boxGeometry args={[0.3, 7.6, 0.4]} />
              <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.4} metalness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Hadronic Calorimeter (HCAL) Orange-Bronze Layers */}
      <mesh>
        <cylinderGeometry args={[2.8, 2.8, 6.5, 32, 1, true]} />
        <meshStandardMaterial
          color="#d97706"
          metalness={0.85}
          roughness={0.25}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Electromagnetic Calorimeter (ECAL) Crystal Grid */}
      <mesh>
        <cylinderGeometry args={[1.8, 1.8, 5.0, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#06b6d4"
          transmission={0.8}
          roughness={0.1}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Silicon Tracker Inner Cylinder */}
      <mesh>
        <cylinderGeometry args={[0.9, 0.9, 3.8, 24, 1, true]} />
        <meshStandardMaterial
          color="#10b981"
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Beam Vacuum Pipes (Dual beam line entering detector) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 14.0, 32]} />
        <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.1} />
      </mesh>

      <Html position={[0, 0, 4.6]} center>
        <div className="bg-slate-900/90 text-cyan-300 text-[10px] px-2 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap shadow-lg">
          كاشف التصادمات متعدد الطبقات (ATLAS/CMS 3D Detector)
        </div>
      </Html>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: Relativistic Counter-rotating Beams
// -------------------------------------------------------------
function Beams3D({
  beamsLaunched,
  beamSpeed,
  particleType,
}: {
  beamsLaunched: boolean;
  beamSpeed: number;
  particleType: 'proton' | 'lead-ion';
}) {
  const beam1Ref = useRef<THREE.Group>(null);
  const beam2Ref = useRef<THREE.Group>(null);

  // Generate particle bunches for beam 1 (Clockwise / Right-to-Left) and beam 2 (Left-to-Right)
  const bunches = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      offset: (i / 18) * 12 - 6,
      id: i,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!beamsLaunched) return;
    const t = clock.getElapsedTime();
    const speedFactor = beamSpeed * 15;

    if (beam1Ref.current) {
      beam1Ref.current.children.forEach((child, i) => {
        // Move along X axis right to left
        let x = bunches[i].offset - (t * speedFactor) % 12;
        if (x < -6) x += 12;
        child.position.x = x;
      });
    }

    if (beam2Ref.current) {
      beam2Ref.current.children.forEach((child, i) => {
        // Move along X axis left to right
        let x = bunches[i].offset + (t * speedFactor) % 12;
        if (x > 6) x -= 12;
        child.position.x = x;
      });
    }
  });

  if (!beamsLaunched) return null;

  const particleColor1 = particleType === 'lead-ion' ? '#a855f7' : '#00f2fe';
  const particleColor2 = particleType === 'lead-ion' ? '#f43f5e' : '#fb923c';

  return (
    <group>
      {/* Beam 1 Particles (Cyan / Purple) */}
      <group ref={beam1Ref}>
        {bunches.map((b) => (
          <mesh key={`b1-${b.id}`} position={[b.offset, 0.05, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial
              color={particleColor1}
              emissive={particleColor1}
              emissiveIntensity={2.0}
            />
          </mesh>
        ))}
      </group>

      {/* Beam 2 Particles (Orange / Rose) */}
      <group ref={beam2Ref}>
        {bunches.map((b) => (
          <mesh key={`b2-${b.id}`} position={[b.offset, -0.05, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial
              color={particleColor2}
              emissive={particleColor2}
              emissiveIntensity={2.0}
            />
          </mesh>
        ))}
      </group>

      {/* Continuous Synchrotron Beam Glow Lines */}
      <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 12, 16]} />
        <meshBasicMaterial color={particleColor1} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 12, 16]} />
        <meshBasicMaterial color={particleColor2} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: 3D Collision Fireworks & Particle Event Tracks
// -------------------------------------------------------------
function CollisionTracks3D({
  isActive,
  beamEnergy,
}: {
  isActive: boolean;
  beamEnergy: number;
}) {
  const flashRef = useRef<THREE.Mesh>(null);
  const tracksGroupRef = useRef<THREE.Group>(null);

  // Generate 40 3D particle tracks (helical tracks in magnetic field)
  const tracks = useMemo(() => {
    const isHiggsEnergy = beamEnergy >= 10000;
    const numTracks = Math.min(60, Math.floor(beamEnergy / 200) + 25);
    const generated = [];

    for (let i = 0; i < numTracks; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = (Math.random() - 0.5) * Math.PI * 0.9;
      const charge = Math.random() > 0.5 ? 1 : -1;
      const pt = 0.5 + Math.random() * 4.0;
      const points: THREE.Vector3[] = [];

      // Helical trajectory curvature caused by 2-4 Tesla solenoidal magnetic field: r = pT / (qB)
      const steps = 30;
      const maxDist = 3.6;
      for (let s = 0; s <= steps; s++) {
        const r = (s / steps) * maxDist;
        const curveAngle = phi + (charge * r * 0.4) / pt;
        const x = r * Math.sin(theta);
        const y = r * Math.cos(theta) * Math.sin(curveAngle);
        const z = r * Math.cos(theta) * Math.cos(curveAngle);
        points.push(new THREE.Vector3(x, y, z));
      }

      // Identify particle track type
      let color = '#38bdf8'; // Muon
      let particleName = 'μ';
      if (i % 4 === 0) {
        color = '#ef4444'; // Electron
        particleName = 'e⁻';
      } else if (i % 4 === 1) {
        color = '#22c55e'; // Pion / Kaon
        particleName = 'π⁺';
      } else if (i % 4 === 2) {
        color = '#eab308'; // Hadron jet
        particleName = 'Jet';
      }

      // If rare Higgs candidate
      if (isHiggsEnergy && i === 0) {
        color = '#f59e0b';
        particleName = 'Higgs Boson (H → γγ)';
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      generated.push({ geometry, color, particleName, id: i });
    }

    return generated;
  }, [beamEnergy, isActive]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (flashRef.current) {
      if (isActive) {
        flashRef.current.visible = true;
        const s = 1.0 + Math.sin(t * 30) * 0.4;
        flashRef.current.scale.set(s, s, s);
      } else {
        flashRef.current.visible = false;
      }
    }
    if (tracksGroupRef.current) {
      tracksGroupRef.current.visible = isActive;
    }
  });

  return (
    <group>
      {/* Central Collision Vertex Flash */}
      <mesh ref={flashRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>

      {/* 3D Helical Event Tracks */}
      <group ref={tracksGroupRef}>
        {tracks.map((track) => (
          <primitive key={track.id} object={new THREE.Line(
            track.geometry,
            new THREE.LineBasicMaterial({ color: track.color, linewidth: 2, transparent: true, opacity: 0.85 })
          )} />
        ))}
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: Camera Handler
// -------------------------------------------------------------
function LHCCameraHandler({ cameraPreset }: { cameraPreset: 'tunnel' | 'detector' | 'collision' | 'overview' }) {
  const controlsRef = useRef<any>(null);

  useFrame(({ camera }) => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    if (cameraPreset === 'tunnel') {
      camera.position.lerp(new THREE.Vector3(6.5, 0.4, 0.5), 0.05);
      ctrl.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    } else if (cameraPreset === 'collision') {
      camera.position.lerp(new THREE.Vector3(0, 0.8, 2.2), 0.06);
      ctrl.target.lerp(new THREE.Vector3(0, 0, 0), 0.06);
    } else if (cameraPreset === 'detector') {
      camera.position.lerp(new THREE.Vector3(0, 5.0, 5.5), 0.05);
      ctrl.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    } else {
      camera.position.lerp(new THREE.Vector3(0, 4.2, 9.5), 0.05);
      ctrl.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }
    ctrl.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      minDistance={1.8}
      maxDistance={22}
    />
  );
}

// -------------------------------------------------------------
// Main Component: LHCChamber3D
// -------------------------------------------------------------
export const LHCChamber3D: React.FC<LHCChamber3DProps> = ({
  beamsLaunched,
  beamSpeed,
  beamEnergy,
  collisionActive,
  particleType,
  cameraPreset,
}) => {
  return (
    <Canvas camera={{ position: [0, 4.2, 9.5], fov: 45 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <directionalLight position={[-10, -5, -10]} intensity={0.4} color="#00f2fe" />
      <pointLight position={[0, 0, 0]} intensity={collisionActive ? 5.0 : 1.0} color={collisionActive ? '#fbbf24' : '#0284c7'} distance={12} />

      <DetectorGeometry3D collisionActive={collisionActive} />
      <Beams3D beamsLaunched={beamsLaunched} beamSpeed={beamSpeed} particleType={particleType} />
      <CollisionTracks3D isActive={collisionActive} beamEnergy={beamEnergy} />

      <LHCCameraHandler cameraPreset={cameraPreset} />
    </Canvas>
  );
};

export default LHCChamber3D;
