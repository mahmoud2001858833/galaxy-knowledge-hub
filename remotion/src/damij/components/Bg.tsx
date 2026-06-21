import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { D } from "../theme";

export const Bg: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [0, 60]);
  const hue = interpolate(frame, [0, durationInFrames], [0, 20]);

  return (
    <AbsoluteFill style={{ backgroundColor: D.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${25 + drift}% ${30 + drift / 2}%, ${D.primary}33, transparent 55%), radial-gradient(circle at ${75 - drift / 2}% ${70 - drift / 3}%, ${D.accent}26, transparent 60%), radial-gradient(circle at 50% 90%, ${D.hope}1A, transparent 50%)`,
          filter: `hue-rotate(${hue}deg)`,
        }}
      />
      {/* subtle grid */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.06 }}>
        <defs>
          <pattern id="dg" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke={D.fade} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#dg)" />
      </svg>
      {/* particles */}
      {Array.from({ length: 22 }).map((_, i) => {
        const seed = i * 173.3;
        const x = seed % width;
        const y = (seed * 1.9) % height;
        const speed = 14 + (i % 4) * 6;
        const offY = ((frame * speed) / 60) % height;
        const size = 1.5 + (i % 3);
        const color = i % 2 === 0 ? D.primary : D.accent;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: (y - offY + height) % height,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: color,
              boxShadow: `0 0 ${size * 5}px ${color}`,
              opacity: 0.55,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
