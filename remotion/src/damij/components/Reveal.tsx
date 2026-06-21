import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const Reveal: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  y?: number;
}> = ({ delay = 0, children, style, y = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 90 } });
  const blur = interpolate(sp, [0, 1], [12, 0]);
  return (
    <div
      style={{
        opacity: sp,
        transform: `translateY(${interpolate(sp, [0, 1], [y, 0])}px)`,
        filter: `blur(${blur}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
