import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

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

// Image with subtle Ken Burns + clip-path reveal
export const KenBurns: React.FC<{
  src: string;
  delay?: number;
  scaleFrom?: number;
  scaleTo?: number;
  panX?: number;
  panY?: number;
  duration?: number;
  style?: React.CSSProperties;
  overlay?: string;
}> = ({ src, delay = 0, scaleFrom = 1.05, scaleTo = 1.18, panX = 0, panY = 0, duration = 240, style, overlay }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, Math.min(1, (frame - delay) / duration));
  const scale = scaleFrom + (scaleTo - scaleFrom) * t;
  const tx = panX * t;
  const ty = panY * t;
  const reveal = interpolate(frame, [delay, delay + 25], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", overflow: "hidden", clipPath: `inset(0 ${100 - reveal}% 0 0)`, ...style }}>
      <img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
          transformOrigin: "center",
        }}
      />
      {overlay && <div style={{ position: "absolute", inset: 0, background: overlay }} />}
    </div>
  );
};
