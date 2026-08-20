import { Html } from '@react-three/drei';
import { ReactNode } from 'react';

interface SimLabel3DProps {
  position: [number, number, number];
  children: ReactNode;
  variant?: 'default' | 'accent' | 'muted';
  distanceFactor?: number;
  occlude?: boolean;
}

const variantClass: Record<NonNullable<SimLabel3DProps['variant']>, string> = {
  default: 'bg-card/90 text-card-foreground border-border',
  accent: 'bg-primary/90 text-primary-foreground border-primary',
  muted: 'bg-muted/90 text-muted-foreground border-border',
};

/** Arabic-safe in-scene label. */
export const SimLabel3D = ({
  position,
  children,
  variant = 'default',
  distanceFactor = 10,
  occlude = false,
}: SimLabel3DProps) => (
  <Html position={position} center distanceFactor={distanceFactor} occlude={occlude} zIndexRange={[10, 0]}>
    <div
      dir="rtl"
      className={`pointer-events-none select-none whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold shadow-md backdrop-blur-sm ${variantClass[variant]}`}
    >
      {children}
    </div>
  </Html>
);
