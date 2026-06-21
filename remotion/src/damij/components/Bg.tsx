import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { D } from "../theme";

// Quiet editorial backdrop — soft warm light bg with subtle navy/gold washes.
export const Bg: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [0, 30]);

  return (
    <AbsoluteFill style={{ backgroundColor: D.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            `radial-gradient(900px 600px at ${15 + drift / 3}% ${20}%, ${D.primary}14, transparent 60%),` +
            `radial-gradient(800px 500px at ${80 - drift / 4}% ${85}%, ${D.gold}14, transparent 60%),` +
            `radial-gradient(700px 400px at 50% 50%, ${D.teal}08, transparent 70%)`,
        }}
      />
      {/* hairline grid */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.05 }}>
        <defs>
          <pattern id="dg" width="160" height="160" patternUnits="userSpaceOnUse">
            <path d="M 160 0 L 0 0 0 160" fill="none" stroke={D.ink} strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#dg)" />
      </svg>
      {/* corner gold rule */}
      <div style={{ position: "absolute", top: 60, right: 60, width: 90, height: 2, background: D.gold }} />
      <div style={{ position: "absolute", bottom: 60, left: 60, width: 90, height: 2, background: D.primary }} />
    </AbsoluteFill>
  );
};
