import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { C } from "../theme";

const cairo = loadCairo("normal", { weights: ["700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700", "900"] });

export const Scene1Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const ringScale = spring({ frame, fps, config: { damping: 12, stiffness: 90 } });
  const titleY = spring({ frame: frame - 8, fps, config: { damping: 18 } });
  const subOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const kickerX = interpolate(spring({ frame: frame - 4, fps, config: { damping: 20 } }), [0, 1], [-100, 0]);

  const exitOpacity = interpolate(frame, [110, 135], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      {/* Concentric rings */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: width / 2,
            top: height / 2,
            width: 200 * i * ringScale,
            height: 200 * i * ringScale,
            marginLeft: -(100 * i * ringScale),
            marginTop: -(100 * i * ringScale),
            borderRadius: "50%",
            border: `2px solid ${i % 2 === 0 ? C.primary : C.accent}`,
            opacity: 0.25 - i * 0.04,
          }}
        />
      ))}

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div
          style={{
            transform: `translateX(${kickerX}px)`,
            color: C.accent,
            fontFamily: orbitron.fontFamily,
            fontSize: 28,
            letterSpacing: 14,
            marginBottom: 30,
            opacity: interpolate(frame, [4, 20], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          PEAK OF SCIENCE
        </div>

        <h1
          style={{
            transform: `translateY(${interpolate(titleY, [0, 1], [80, 0])}px)`,
            opacity: titleY,
            fontFamily: cairo.fontFamily,
            fontWeight: 900,
            fontSize: 180,
            color: C.text,
            margin: 0,
            lineHeight: 1,
            textShadow: `0 0 40px ${C.primary}66`,
            background: `linear-gradient(135deg, ${C.text} 0%, ${C.accent} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          مستقبل التكنولوجيا
        </h1>

        <div
          style={{
            opacity: subOpacity,
            color: C.muted,
            fontFamily: cairo.fontFamily,
            fontSize: 32,
            marginTop: 24,
            letterSpacing: 4,
          }}
        >
          منصة الإبداع • الذكاء الاصطناعي • البرمجة
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
