import { useRef, useMemo } from 'react';
import { Cylinder } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Bond3DProps {
  start: [number, number, number];
  end: [number, number, number];
  type: 'single' | 'double' | 'triple';
  color?: string;
  animate?: boolean;
}

export const Bond3D = ({ 
  start, 
  end, 
  type, 
  color = '#888888',
  animate = false 
}: Bond3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const { position, rotation, length } = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const length = direction.length();
    const position = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
    
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    
    return {
      position: [position.x, position.y, position.z] as [number, number, number],
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
      length,
    };
  }, [start, end]);

  useFrame((state) => {
    if (animate && meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
      meshRef.current.scale.set(pulse, 1, pulse);
    }
  });

  const bondRadius = 0.08;
  const bondSpacing = 0.15;

  const renderBond = (offset: [number, number, number] = [0, 0, 0]) => (
    <Cylinder
      ref={offset[0] === 0 && offset[2] === 0 ? meshRef : undefined}
      args={[bondRadius, bondRadius, length, 8]}
      position={[position[0] + offset[0], position[1] + offset[1], position[2] + offset[2]]}
      rotation={rotation}
    >
      <meshStandardMaterial
        color={color}
        metalness={0.5}
        roughness={0.5}
      />
    </Cylinder>
  );

  return (
    <group>
      {type === 'single' && renderBond()}
      {type === 'double' && (
        <>
          {renderBond([bondSpacing, 0, 0])}
          {renderBond([-bondSpacing, 0, 0])}
        </>
      )}
      {type === 'triple' && (
        <>
          {renderBond()}
          {renderBond([bondSpacing, 0, bondSpacing])}
          {renderBond([-bondSpacing, 0, -bondSpacing])}
        </>
      )}
    </group>
  );
};
