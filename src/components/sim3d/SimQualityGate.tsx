import { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
import { SimQuality, detectQuality, detectWebGL, qualitySettings } from './quality';

interface SimQualityContextValue {
  quality: SimQuality;
  setQuality: (q: SimQuality) => void;
  settings: (typeof qualitySettings)[SimQuality];
  webglAvailable: boolean;
}

const SimQualityContext = createContext<SimQualityContextValue | null>(null);

export const useSimQuality = () => {
  const ctx = useContext(SimQualityContext);
  if (!ctx) {
    return {
      quality: 'medium' as SimQuality,
      setQuality: () => {},
      settings: qualitySettings.medium,
      webglAvailable: true,
    };
  }
  return ctx;
};

interface SimQualityGateProps {
  children: ReactNode;
  /** Rendered when WebGL is unavailable on the device. */
  fallback?: ReactNode;
}

export const SimQualityGate = ({ children, fallback }: SimQualityGateProps) => {
  const [quality, setQuality] = useState<SimQuality>('medium');
  const [webglAvailable, setWebglAvailable] = useState(true);

  useEffect(() => {
    setWebglAvailable(detectWebGL());
    setQuality(detectQuality());
  }, []);

  const value = useMemo(
    () => ({ quality, setQuality, settings: qualitySettings[quality], webglAvailable }),
    [quality, webglAvailable]
  );

  if (!webglAvailable) {
    return (
      <SimQualityContext.Provider value={value}>
        {fallback ?? (
          <div
            dir="rtl"
            className="w-full h-full min-h-[300px] flex items-center justify-center p-6 text-center bg-muted/30 rounded-xl border border-border"
          >
            <p className="text-muted-foreground text-sm leading-relaxed">
              متصفحك لا يدعم الرسم ثلاثي الأبعاد (WebGL). يُرجى تفعيل تسريع الرسوميات أو استخدام متصفح حديث
              لعرض التجربة بشكل كامل.
            </p>
          </div>
        )}
      </SimQualityContext.Provider>
    );
  }

  return <SimQualityContext.Provider value={value}>{children}</SimQualityContext.Provider>;
};
