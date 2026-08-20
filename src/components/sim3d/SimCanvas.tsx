import { ReactNode, Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import { useSimQuality } from './SimQualityGate';

interface SimCanvasProps {
  children: ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
  fov?: number;
  /** CSS background classes for the canvas wrapper. */
  background?: string;
  environment?: 'city' | 'studio' | 'sunset' | 'night' | 'warehouse' | 'none';
}

/** Unified 3D canvas: lighting, shadows, environment, adaptive performance, tab pausing. */
export const SimCanvas = ({
  children,
  className = '',
  cameraPosition = [8, 5, 12],
  fov = 50,
  background = 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950',
  environment = 'city',
}: SimCanvasProps) => {
  const { settings } = useSimQuality();
  const [active, setActive] = useState(true);

  useEffect(() => {
    const onVisibility = () => setActive(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-xl ${background} ${className}`}>
      <Canvas
        shadows={settings.shadows}
        dpr={settings.dpr}
        frameloop={active ? 'always' : 'demand'}
        camera={{ position: cameraPosition, fov, near: 0.1, far: 500 }}
        gl={{ antialias: settings.shadows, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0b1220']} />
        <fog attach="fog" args={['#0b1220', 40, 120]} />

        <ambientLight intensity={0.55} />
        <hemisphereLight intensity={0.35} groundColor="#0f172a" />
        <directionalLight
          position={[10, 18, 8]}
          intensity={1.5}
          castShadow={settings.shadows}
          shadow-mapSize={[settings.shadows ? 1024 : 512, settings.shadows ? 1024 : 512]}
          shadow-camera-far={80}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <pointLight position={[-12, 8, -10]} intensity={0.5} color="#38bdf8" />

        <Suspense fallback={null}>
          {environment !== 'none' && <Environment preset={environment} />}
          {children}
          <Preload all />
        </Suspense>

        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
};

export const SimCanvasFallback = () => (
  <div className="flex h-full w-full min-h-[300px] items-center justify-center rounded-xl bg-muted/20">
    <div className="space-y-3 text-center">
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">جاري تحميل المشهد ثلاثي الأبعاد…</p>
    </div>
  </div>
);
