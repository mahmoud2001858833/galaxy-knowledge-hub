import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

/** Generic upward reveal (kept for backwards compat) */
export const Reveal: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  y?: number;
}> = ({ delay = 0, children, style, y = 24 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 60, mass: 0.9 } });
  return (
    <div
      style={{
        opacity: sp,
        transform: `translateY(${interpolate(sp, [0, 1], [y, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** RTL reveal — elements enter from the right and settle left */
export const RevealRTL: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  x?: number;
  scaleFrom?: number;
}> = ({ delay = 0, children, style, x = 140, scaleFrom = 0.96 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - delay, fps, config: { damping: 180, stiffness: 80, mass: 0.7 } });
  const tx = interpolate(sp, [0, 1], [x, 0]);
  const scale = interpolate(sp, [0, 1], [scaleFrom, 1]);
  return (
    <div
      style={{
        opacity: sp,
        transform: `translateX(${tx}px) scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
