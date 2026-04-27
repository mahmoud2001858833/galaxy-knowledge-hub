import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../theme";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const hueShift = interpolate(frame, [0, durationInFrames], [0, 40]);
  const drift = interpolate(frame, [0, durationInFrames], [0, 80]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${30 + drift}% ${40 - drift / 2}%, ${C.primary}33, transparent 55%), radial-gradient(circle at ${70 - drift / 2}% ${65 + drift / 3}%, ${C.accent}26, transparent 60%)`,
          filter: `hue-rotate(${hueShift}deg)`,
        }}
      />
      {/* Grid */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke={C.accent} strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
      </svg>
      {/* Floating particles */}
      {Array.from({ length: 30 }).map((_, i) => {
        const seed = i * 137.5;
        const x = (seed % width);
        const y = ((seed * 1.7) % height);
        const ySpeed = 20 + (i % 5) * 8;
        const offsetY = ((frame * ySpeed) / 60) % height;
        const size = 2 + (i % 4);
        const color = i % 3 === 0 ? C.primary : i % 3 === 1 ? C.accent : C.accent2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: (y - offsetY + height) % height,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: color,
              boxShadow: `0 0 ${size * 4}px ${color}`,
              opacity: 0.7,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
