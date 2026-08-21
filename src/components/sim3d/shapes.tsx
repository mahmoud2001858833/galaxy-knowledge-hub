import { forwardRef } from 'react';
import {
  Sphere as DreiSphere,
  Box as DreiBox,
  Torus as DreiTorus,
  Cylinder as DreiCylinder,
  Cone as DreiCone,
  Plane as DreiPlane,
  Circle as DreiCircle,
  Ring as DreiRing,
  Tube as DreiTube,
} from '@react-three/drei';

/**
 * The dev-only component tagger injects `data-lov-*` props into JSX elements.
 * react-three-fiber treats dashed props as pierced paths (`data.lov.id`) and
 * crashes. These thin wrappers strip any `data-*` prop before it reaches three.
 */
const strip = (props: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const key in props) {
    if (key.startsWith('data-')) continue;
    out[key] = props[key];
  }
  return out;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (Comp: any) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forwardRef<any, any>((props, ref) => <Comp ref={ref} {...strip(props)} />);

export const Sphere = wrap(DreiSphere);
export const Box = wrap(DreiBox);
export const Torus = wrap(DreiTorus);
export const Cylinder = wrap(DreiCylinder);
export const Cone = wrap(DreiCone);
export const Plane = wrap(DreiPlane);
export const Circle = wrap(DreiCircle);
export const Ring = wrap(DreiRing);
export const Tube = wrap(DreiTube);
