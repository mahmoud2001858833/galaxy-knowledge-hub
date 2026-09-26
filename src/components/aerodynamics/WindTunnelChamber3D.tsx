import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface AirfoilModel {
  id: string;
  nameAr: string;
  nameEn: string;
  clMax: number;
  stallAngleDeg: number;
  description: string;
  camber: number;
  thickness: number;
}

interface WindTunnel3DProps {
  alphaDeg: number;
  windSpeedMs: number;
  selectedAirfoil: AirfoilModel;
  isStalled: boolean;
  liftForceN: number;
  dragForceN: number;
  isPlaying: boolean;
  showPressureVectors?: boolean;
  showShockwave?: boolean;
}

// Generate realistic NACA 4-digit airfoil 2D shape for Three.js extrusion
function createNacaShape(camberPercent: number, thicknessPercent: number, chord: number = 2.4): THREE.Shape {
  const shape = new THREE.Shape();
  const m = camberPercent / 100; // max camber
  const p = 0.4; // location of max camber (40% chord)
  const t = thicknessPercent / 100; // thickness ratio

  const pointsCount = 40;
  const upperPoints: THREE.Vector2[] = [];
  const lowerPoints: THREE.Vector2[] = [];

  for (let i = 0; i <= pointsCount; i++) {
    // Cosine spacing for high resolution at leading & trailing edges
    const beta = (i / pointsCount) * Math.PI;
    const xRel = (1 - Math.cos(beta)) / 2; // 0 to 1
    const x = xRel * chord - chord / 2; // centered around 0

    // Thickness distribution
    const yt = 5 * t * chord * (
      0.2969 * Math.sqrt(Math.max(0, xRel)) -
      0.1260 * xRel -
      0.3516 * Math.pow(xRel, 2) +
      0.2843 * Math.pow(xRel, 3) -
      0.1036 * Math.pow(xRel, 4)
    );

    // Camber line and slope
    let yc = 0;
    let dyc_dx = 0;
    if (m > 0) {
      if (xRel <= p) {
        yc = (m / Math.pow(p, 2)) * (2 * p * xRel - Math.pow(xRel, 2)) * chord;
        dyc_dx = (2 * m / Math.pow(p, 2)) * (p - xRel);
      } else {
        yc = (m / Math.pow(1 - p, 2)) * ((1 - 2 * p) + 2 * p * xRel - Math.pow(xRel, 2)) * chord;
        dyc_dx = (2 * m / Math.pow(1 - p, 2)) * (p - xRel);
      }
    }
    const theta = Math.atan(dyc_dx);

    const xu = x - yt * Math.sin(theta);
    const yu = yc + yt * Math.cos(theta);
    const xl = x + yt * Math.sin(theta);
    const yl = yc - yt * Math.cos(theta);

    upperPoints.push(new THREE.Vector2(xu, yu));
    lowerPoints.push(new THREE.Vector2(xl, yl));
  }

  // Build continuous closed loop from trailing edge forward along upper curve, then back along lower curve
  shape.moveTo(upperPoints[upperPoints.length - 1].x, upperPoints[upperPoints.length - 1].y);
  for (let i = upperPoints.length - 2; i >= 0; i--) {
    shape.lineTo(upperPoints[i].x, upperPoints[i].y);
  }
  for (let i = 1; i < lowerPoints.length; i++) {
    shape.lineTo(lowerPoints[i].x, lowerPoints[i].y);
  }
  shape.closePath();

  return shape;
}

export default function WindTunnelChamber3D({
  alphaDeg,
  windSpeedMs,
  selectedAirfoil,
  isStalled,
  liftForceN,
  dragForceN,
  isPlaying,
  showPressureVectors = true,
  showShockwave = true,
}: WindTunnel3DProps) {
  const streamlinesRef = useRef<THREE.Group>(null);
  const vortexRef = useRef<THREE.Group>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);

  // NACA airfoil geometry memoization
  const airfoilGeometry = useMemo(() => {
    const shape = createNacaShape(
      selectedAirfoil.camber,
      selectedAirfoil.thickness,
      2.5
    );
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 2,
      depth: 3.2,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.03,
      bevelSegments: 3,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }, [selectedAirfoil]);

  // Streamlines smoke particles (120 particles across 4 height channels)
  const particleCount = 140;
  const particleData = useMemo(() => {
    return Array.from({ length: particleCount }, (_, idx) => {
      const row = (idx % 14) - 7;
      const initialY = (row / 7) * 1.5 + (Math.random() - 0.5) * 0.1;
      const initialZ = ((Math.floor(idx / 14) % 10) - 4.5) * 0.3;
      return {
        x: -5.5 + Math.random() * 0.8,
        y: initialY,
        baseY: initialY,
        z: initialZ,
        speed: 0.08 + Math.random() * 0.03,
        vorticity: 0,
      };
    });
  }, [particleCount]);

  // Stall wake vortex particles (30 swirling elements)
  const vortexCount = 35;
  const vortexData = useMemo(() => {
    return Array.from({ length: vortexCount }, () => ({
      x: 1.2 + Math.random() * 2.5,
      y: 0.2 + (Math.random() - 0.5) * 1.2,
      z: (Math.random() - 0.5) * 2.8,
      angle: Math.random() * Math.PI * 2,
      radius: 0.2 + Math.random() * 0.5,
      rotSpeed: 0.05 + Math.random() * 0.08,
      decay: Math.random(),
    }));
  }, [vortexCount]);

  const alphaRad = (-alphaDeg * Math.PI) / 180;
  const machNumber = windSpeedMs / 340; // Reference speed of sound: ~340 m/s

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const speedMultiplier = (windSpeedMs / 45);

    // Update Streamlines
    for (let i = 0; i < particleCount; i++) {
      const p = particleData[i];
      const mesh = streamlinesRef.current?.children[i] as THREE.Mesh;
      if (!mesh) continue;

      p.x += p.speed * speedMultiplier;

      // Deflection around airfoil
      if (p.x > -1.6 && p.x < 1.6) {
        const isUpper = p.baseY > 0;
        // Upper flow accelerates and is pushed upward by angle of attack
        if (isUpper) {
          p.y = p.baseY + Math.sin(Math.abs(alphaRad)) * 0.45 * (1 - Math.abs(p.x) / 1.6);
          // Bernoulli velocity color
          const mat = mesh.material as THREE.MeshBasicMaterial;
          if (isStalled) {
            mat.color.setHex(0xef4444); // Red turbulent
          } else {
            mat.color.setHex(0x06b6d4); // Cyan fast Bernoulli
          }
        } else {
          p.y = p.baseY - Math.sin(Math.abs(alphaRad)) * 0.25 * (1 - Math.abs(p.x) / 1.6);
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.color.setHex(0xf59e0b); // Amber stagnation/higher pressure
        }
      } else if (p.x >= 1.6) {
        // Downwash effect behind trailing edge
        const downwash = Math.sin(alphaRad) * 0.35;
        p.y = p.baseY + downwash;
        if (isStalled && p.baseY > 0) {
          // Turbulent jitter
          p.y += (Math.random() - 0.5) * 0.12;
          p.z += (Math.random() - 0.5) * 0.12;
        }
      }

      // Reset when exiting chamber
      if (p.x > 5.5) {
        p.x = -5.5;
        p.y = p.baseY;
      }

      mesh.position.set(p.x, p.y, p.z);
    }

    // Update Stall Vortices
    if (vortexRef.current && isStalled) {
      for (let i = 0; i < vortexCount; i++) {
        const v = vortexData[i];
        const vMesh = vortexRef.current.children[i] as THREE.Mesh;
        if (!vMesh) continue;

        v.angle += v.rotSpeed * speedMultiplier;
        v.x += 0.03 * speedMultiplier;
        if (v.x > 5.0) {
          v.x = 1.2 + Math.random() * 0.5;
        }

        const currentY = v.y + Math.sin(v.angle) * v.radius;
        const currentZ = v.z + Math.cos(v.angle) * v.radius;
        vMesh.position.set(v.x, currentY, currentZ);
        vMesh.scale.setScalar(0.7 + Math.sin(v.angle) * 0.3);
      }
    }

    // Transonic Shockwave pulse
    if (shockwaveRef.current) {
      shockwaveRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group>
      {/* WIND TUNNEL CASING */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[11.5, 4.4, 4.4]} />
        <meshPhysicalMaterial
          color="#0f172a"
          transmission={0.88}
          opacity={0.35}
          transparent
          roughness={0.08}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Structural Girders & Flanges */}
      {[-5.75, -2.875, 0, 2.875, 5.75].map((x, i) => (
        <group key={`girder-${i}`} position={[x, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.2, 4.5, 4.5]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Hex bolts */}
          {[-2.1, 2.1].map((by) => (
            <mesh key={`bolt-${by}`} position={[0, by, 2.27]}>
              <cylinderGeometry args={[0.06, 0.06, 0.1, 6]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Honeycomb Flow Straightener at Inlet (Left) */}
      <group position={[-5.6, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 4.1, 4.1]} />
          <meshStandardMaterial color="#0284c7" wireframe transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Exhaust Diffuser Screen at Outlet (Right) */}
      <group position={[5.6, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 4.1, 4.1]} />
          <meshStandardMaterial color="#334155" wireframe transparent opacity={0.4} />
        </mesh>
      </group>

      {/* DYNAMIC 3D AIRFOIL / WING */}
      <group position={[0, 0, 0]} rotation={[0, 0, alphaRad]}>
        <mesh geometry={airfoilGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={isStalled ? '#f87171' : '#e2e8f0'}
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>

        {/* Wing Spar and Internal Ribs Accent */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 3.5, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Chord Centerline & Leading Edge Indicator */}
        <mesh position={[-1.25, 0, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Pressure Vector Needles (Surface $C_p$ profile) */}
        {showPressureVectors && (
          <group>
            {/* Upper suction arrows (pointing upward/away from surface: low pressure) */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((px, idx) => {
              const needleHeight = (liftForceN / 1200) * (1 - Math.abs(px) / 1.5) * 0.8;
              return (
                <group key={`cp-up-${idx}`} position={[px, 0.35, 0]}>
                  <mesh position={[0, needleHeight / 2, 0]}>
                    <cylinderGeometry args={[0.015, 0.015, Math.max(0.1, needleHeight), 6]} />
                    <meshBasicMaterial color="#38bdf8" />
                  </mesh>
                  <mesh position={[0, needleHeight + 0.05, 0]}>
                    <coneGeometry args={[0.04, 0.08, 6]} />
                    <meshBasicMaterial color="#38bdf8" />
                  </mesh>
                </group>
              );
            })}

            {/* Lower pressure arrows (pointing into lower surface: high pressure) */}
            {[-0.6, 0, 0.6].map((px, idx) => {
              const needleHeight = (liftForceN / 2000) * 0.4;
              return (
                <group key={`cp-down-${idx}`} position={[px, -0.35, 0]}>
                  <mesh position={[0, -needleHeight / 2, 0]}>
                    <cylinderGeometry args={[0.015, 0.015, Math.max(0.08, needleHeight), 6]} />
                    <meshBasicMaterial color="#f97316" />
                  </mesh>
                  <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI]}>
                    <coneGeometry args={[0.035, 0.07, 6]} />
                    <meshBasicMaterial color="#f97316" />
                  </mesh>
                </group>
              );
            })}
          </group>
        )}
      </group>

      {/* TOTAL LIFT VECTOR (Vertical Green Arrow) */}
      {liftForceN > 10 && (
        <group position={[0, 0.3, 0]}>
          <mesh position={[0, Math.min(2.2, liftForceN / 800), 0]}>
            <cylinderGeometry args={[0.04, 0.04, Math.min(2.2, liftForceN / 400), 12]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <mesh position={[0, Math.min(2.2, liftForceN / 800) * 2 + 0.1, 0]}>
            <coneGeometry args={[0.12, 0.25, 12]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <Html position={[0, Math.min(2.2, liftForceN / 800) * 2 + 0.45, 0]} center>
            <div className="bg-emerald-950/90 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-emerald-500/50 shadow-lg whitespace-nowrap">
              قوة الرفع L = {liftForceN.toFixed(0)} N
            </div>
          </Html>
        </group>
      )}

      {/* TOTAL DRAG VECTOR (Horizontal Red Arrow) */}
      {dragForceN > 5 && (
        <group position={[0, 0, 0]}>
          <mesh position={[Math.min(2.2, dragForceN / 300), 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, Math.min(2.2, dragForceN / 150), 12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[Math.min(2.2, dragForceN / 300) * 2 + 0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.1, 0.22, 12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <Html position={[Math.min(2.2, dragForceN / 300) * 2 + 0.4, 0, 0]} center>
            <div className="bg-red-950/90 text-red-300 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-red-500/50 shadow-lg whitespace-nowrap">
              قوة السحب D = {dragForceN.toFixed(0)} N
            </div>
          </Html>
        </group>
      )}

      {/* TRANSONIC / SUPERSONIC MACH SHOCKWAVE CONE */}
      {showShockwave && machNumber >= 0.75 && (
        <group position={[-1.25, 0, 0]}>
          <mesh ref={shockwaveRef} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[1.8 * Math.tan(Math.asin(Math.min(0.99, 1 / Math.max(1, machNumber)))), 2.2, 32, 1, true]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={Math.min(0.5, (machNumber - 0.7) * 1.5)}
              side={THREE.DoubleSide}
              wireframe
            />
          </mesh>
          <Html position={[-0.8, 1.8, 0]} center>
            <div className="bg-sky-950/90 text-sky-300 text-[10px] font-mono px-2 py-0.5 rounded border border-sky-400/50 whitespace-nowrap shadow-lg">
              صدمة هوائية Mach {machNumber.toFixed(2)}
            </div>
          </Html>
        </group>
      )}

      {/* STREAMLINES PARTICLE FIELD */}
      <group ref={streamlinesRef}>
        {particleData.map((_, i) => (
          <mesh key={`streamline-${i}`}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial
              color={isStalled && particleData[i].x > 0.5 ? '#ef4444' : '#38bdf8'}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* STALL TURBULENT WAKE VORTICES */}
      {isStalled && (
        <group ref={vortexRef}>
          {vortexData.map((_, idx) => (
            <mesh key={`vortex-${idx}`}>
              <ringGeometry args={[0.08, 0.14, 8]} />
              <meshBasicMaterial color="#f87171" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
