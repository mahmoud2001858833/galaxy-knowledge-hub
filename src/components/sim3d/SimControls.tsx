import { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type SimView = 'default' | 'front' | 'top' | 'side' | 'section';

export const viewPositions: Record<SimView, [number, number, number]> = {
  default: [14, 9, 20],
  front: [6, 3, 22],
  top: [6, 26, 0.01],
  side: [26, 4, 0],
  section: [16, 12, 16],
};

interface SimControlsProps {
  view?: SimView;
  target?: [number, number, number];
  autoRotate?: boolean;
  enableZoom?: boolean;
  minDistance?: number;
  maxDistance?: number;
  /** Prevent going under the floor. */
  clampGround?: boolean;
}

/** Orbit controls + smooth camera preset transitions. Must live inside <SimCanvas>. */
export const SimControls = ({
  view = 'default',
  target = [0, 0, 0],
  autoRotate = false,
  enableZoom = true,
  minDistance = 3,
  maxDistance = 60,
  clampGround = true,
}: SimControlsProps) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const desired = useRef(new THREE.Vector3(...viewPositions[view]));
  const animating = useRef(false);

  useEffect(() => {
    desired.current.set(...viewPositions[view]);
    animating.current = true;
  }, [view]);

  useFrame(() => {
    if (animating.current) {
      camera.position.lerp(desired.current, 0.08);
      if (camera.position.distanceTo(desired.current) < 0.05) animating.current = false;
      controlsRef.current?.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={target}
      enableDamping
      dampingFactor={0.08}
      enableZoom={enableZoom}
      autoRotate={autoRotate}
      autoRotateSpeed={0.6}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={clampGround ? Math.PI / 2 - 0.02 : Math.PI}
      makeDefault
    />
  );
};
