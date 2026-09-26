import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Ballistics3DSceneProps {
  mode: 'projectile' | 'pendulum' | 'freefall';
  angle: number;
  initialVelocity: number;
  height: number;
  gravity: number;
  airResistance: number;
  isLaunched: boolean;
  trajectory: Array<{ x: number; y: number }>;
  currentPosition: { x: number; y: number };
  // Pendulum props
  pendulumAngle: number;
  pendulumLength: number;
  // Freefall props
  freeFallPosition: number;
  freeFallHeight: number;
  cameraPreset: 'overview' | 'cannon' | 'target' | 'top';
}

// -------------------------------------------------------------
// Sub-component: 3D Artillery Cannon
// -------------------------------------------------------------
function Cannon3D({ angle, height }: { angle: number; height: number }) {
  const barrelRef = useRef<THREE.Group>(null);
  const angleRad = (angle * Math.PI) / 180;

  useFrame(() => {
    if (barrelRef.current) {
      barrelRef.current.rotation.z = angleRad;
    }
  });

  return (
    <group position={[-5, -1.8 + height * 0.1, 0]}>
      {/* Heavy Steel Turret Mount */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 0.8, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Wheel Carriage */}
      <mesh position={[0, 0.4, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.1, 12, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.4, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.1, 12, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* Elevating Barrel */}
      <group ref={barrelRef} position={[0, 0.6, 0]}>
        <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.24, 2.0, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Muzzle ring */}
        <mesh position={[1.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.15, 24]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} />
        </mesh>
      </group>

      <Html position={[0, 1.8, 0]} center>
        <div className="bg-slate-900/90 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/40 whitespace-nowrap shadow-lg">
          مدفع الإطلاق (θ = {angle}°)
        </div>
      </Html>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: 3D Projectile Trajectory & Ball
// -------------------------------------------------------------
function ProjectileFlight3D({
  currentPosition,
  trajectory,
  isLaunched,
}: {
  currentPosition: { x: number; y: number };
  trajectory: Array<{ x: number; y: number }>;
  isLaunched: boolean;
}) {
  const ballRef = useRef<THREE.Mesh>(null);

  // Convert 2D physics coordinates to 3D scene units
  // physics origin is around (-5, -1.8)
  const posX = -5 + currentPosition.x * 0.08;
  const posY = -1.8 + currentPosition.y * 0.08;

  // Generate 3D trajectory line points
  const points = useMemo(() => {
    return trajectory.map((p) => new THREE.Vector3(-5 + p.x * 0.08, -1.8 + p.y * 0.08, 0));
  }, [trajectory]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <group>
      {/* Flight Trajectory Arc */}
      {points.length > 1 && (
        <primitive
          object={
            new THREE.Line(
              lineGeometry,
              new THREE.LineBasicMaterial({ color: '#f59e0b', linewidth: 3, transparent: true, opacity: 0.85 })
            )
          }
        />
      )}

      {/* Flying Cannonball */}
      {isLaunched && (
        <group position={[posX, posY, 0]}>
          <mesh ref={ballRef}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#f97316" emissive="#c2410c" emissiveIntensity={0.6} metalness={0.8} />
          </mesh>
          <pointLight color="#f97316" intensity={1.5} distance={3} />
        </group>
      )}

      {/* Target Zone Ground Marker (at approx 150m) */}
      <group position={[-5 + 150 * 0.08, -1.78, 0]}>
        {/* Concentric Bullseye Rings */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.2, 32]} />
          <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.8, 32]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4, 32]} />
          <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
        </mesh>
        <Html position={[0, 1.0, 0]} center>
          <div className="bg-slate-900/90 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-500/40 whitespace-nowrap shadow-lg">
            🎯 الهدف (150m Target)
          </div>
        </Html>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: 3D Pendulum
// -------------------------------------------------------------
function Pendulum3D({
  angle,
  length,
}: {
  angle: number;
  length: number;
}) {
  const normLen = (length / 100) * 3.5;
  const angleRad = (angle * Math.PI) / 180;
  const bobX = Math.sin(angleRad) * normLen;
  const bobY = 2.0 - Math.cos(angleRad) * normLen;

  const wireGeom = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 2.0, 0),
      new THREE.Vector3(bobX, bobY, 0),
    ]);
  }, [bobX, bobY]);

  return (
    <group position={[0, 0, 0]}>
      {/* Ceiling Mount */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[1.5, 0.2, 1.0]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
      </mesh>

      {/* String */}
      <primitive
        object={
          new THREE.Line(
            wireGeom,
            new THREE.LineBasicMaterial({ color: '#94a3b8', linewidth: 2 })
          )
        }
      />

      {/* Metallic Bob */}
      <mesh position={[bobX, bobY, 0]}>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.15} />
      </mesh>

      <Html position={[bobX, bobY - 0.7, 0]} center>
        <div className="bg-slate-900/90 text-sky-300 text-[10px] px-2 py-0.5 rounded border border-sky-500/40 whitespace-nowrap shadow-lg">
          كتلة البندول (L = {length} cm, θ = {angle.toFixed(1)}°)
        </div>
      </Html>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: 3D Freefall Drop Tower
// -------------------------------------------------------------
function Freefall3D({
  position,
  height,
}: {
  position: number;
  height: number;
}) {
  const normY = -1.8 + (position / Math.max(height, 1)) * 4.5;

  return (
    <group position={[0, 0, 0]}>
      {/* Drop Tower Truss Column */}
      <mesh position={[-1.0, 0.6, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 5.0, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.8} />
      </mesh>

      {/* Height Grids */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.8, -1.8 + i * 0.9, 0]}>
          <boxGeometry args={[0.4, 0.05, 0.4]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}

      {/* Falling Sphere */}
      <group position={[0, normY, 0]}>
        <mesh>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.5} metalness={0.8} />
        </mesh>
        <Html position={[1.2, 0, 0]} center>
          <div className="bg-slate-900/90 text-rose-300 text-[10px] px-2 py-0.5 rounded border border-rose-500/40 whitespace-nowrap shadow-lg">
            h = {position.toFixed(1)} m
          </div>
        </Html>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: Ground Floor & Grid
// -------------------------------------------------------------
function GroundEnvironment() {
  return (
    <group position={[0, -1.85, 0]}>
      {/* Infinite Grid */}
      <gridHelper args={[30, 30, '#38bdf8', '#1e293b']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[35, 35]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Sub-component: Camera Controller
// -------------------------------------------------------------
function BallisticsCameraHandler({ cameraPreset }: { cameraPreset: 'overview' | 'cannon' | 'target' | 'top' }) {
  const controlsRef = useRef<any>(null);

  useFrame(({ camera }) => {
    if (!controlsRef.current) return;
    const ctrl = controlsRef.current;
    if (cameraPreset === 'cannon') {
      camera.position.lerp(new THREE.Vector3(-3.5, 0.5, 3.5), 0.05);
      ctrl.target.lerp(new THREE.Vector3(-5, -0.5, 0), 0.05);
    } else if (cameraPreset === 'target') {
      camera.position.lerp(new THREE.Vector3(7.0, 1.2, 3.5), 0.05);
      ctrl.target.lerp(new THREE.Vector3(7.0, -1.5, 0), 0.05);
    } else if (cameraPreset === 'top') {
      camera.position.lerp(new THREE.Vector3(1.0, 12.0, 0.1), 0.05);
      ctrl.target.lerp(new THREE.Vector3(1.0, -1.0, 0), 0.05);
    } else {
      camera.position.lerp(new THREE.Vector3(1.0, 3.2, 10.5), 0.05);
      ctrl.target.lerp(new THREE.Vector3(1.0, 0, 0), 0.05);
    }
    ctrl.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      minDistance={2.5}
      maxDistance={25}
    />
  );
}

// -------------------------------------------------------------
// Main Component: Ballistics3DScene
// -------------------------------------------------------------
export const Ballistics3DScene: React.FC<Ballistics3DSceneProps> = ({
  mode,
  angle,
  initialVelocity,
  height,
  isLaunched,
  trajectory,
  currentPosition,
  pendulumAngle,
  pendulumLength,
  freeFallPosition,
  freeFallHeight,
  cameraPreset,
}) => {
  return (
    <Canvas camera={{ position: [1.0, 3.2, 10.5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
      <directionalLight position={[-10, 5, -10]} intensity={0.4} color="#38bdf8" />

      <GroundEnvironment />

      {mode === 'projectile' && (
        <>
          <Cannon3D angle={angle} height={height} />
          <ProjectileFlight3D
            currentPosition={currentPosition}
            trajectory={trajectory}
            isLaunched={isLaunched}
          />
        </>
      )}

      {mode === 'pendulum' && (
        <Pendulum3D angle={pendulumAngle} length={pendulumLength} />
      )}

      {mode === 'freefall' && (
        <Freefall3D position={freeFallPosition} height={freeFallHeight} />
      )}

      <BallisticsCameraHandler cameraPreset={cameraPreset} />
    </Canvas>
  );
};

export default Ballistics3DScene;
