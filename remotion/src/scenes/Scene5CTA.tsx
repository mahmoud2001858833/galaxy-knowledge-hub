import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { C } from "../theme";

const cairo = loadCairo("normal", { weights: ["700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700", "900"] });

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const ringScale = spring({ frame, fps, config: { damping: 10, stiffness: 80 } });
  const titleSp = spring({ frame: frame - 5, fps, config: { damping: 14, stiffness: 100 } });
  const urlSp = spring({ frame: frame - 25, fps, config: { damping: 18 } });
  const tagSp = spring({ frame: frame - 40, fps, config: { damping: 20 } });

  // Pulsing glow
  const pulse = Math.sin(frame * 0.15) * 20 + 60;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      {/* Burst rings */}
      {[1, 2, 3, 4, 5].map((i) => {
        const ro = interpolate(ringScale, [0, 1], [0, 1]) * i;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 300 * ro,
              height: 300 * ro,
              borderRadius: "50%",
              border: `2px solid ${i % 2 === 0 ? C.primary : C.accent}`,
              opacity: Math.max(0, 0.4 - i * 0.07),
            }}
          />
        );
      })}

      <div
        style={{
          opacity: titleSp,
          transform: `scale(${interpolate(titleSp, [0, 1], [0.7, 1])})`,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: orbitron.fontFamily, color: C.accent, fontSize: 28, letterSpacing: 14, marginBottom: 24 }}>
          START YOUR JOURNEY
        </div>
        <h1
          style={{
            fontFamily: cairo.fontFamily,
            fontSize: 200,
            fontWeight: 900,
            color: C.text,
            margin: 0,
            lineHeight: 1,
            background: `linear-gradient(135deg, ${C.text}, ${C.primary} 50%, ${C.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: `0 0 ${pulse}px ${C.primary}55`,
          }}
        >
          ابدأ الآن
        </h1>
      </div>

      <div
        style={{
          opacity: urlSp,
          transform: `translateY(${interpolate(urlSp, [0, 1], [40, 0])}px)`,
          marginTop: 50,
          padding: "20px 50px",
          background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
          borderRadius: 50,
          boxShadow: `0 20px 60px ${C.primary}66`,
        }}
      >
        <div style={{ fontFamily: orbitron.fontFamily, fontSize: 38, fontWeight: 900, color: "#000", letterSpacing: 2 }}>
          galaxy-knowledge-hub
        </div>
      </div>

      <div
        style={{
          opacity: tagSp,
          marginTop: 40,
          fontFamily: cairo.fontFamily,
          fontSize: 28,
          color: C.muted,
          fontWeight: 700,
          letterSpacing: 4,
        }}
      >
        ذروة العلم • منصة مستقبل التكنولوجيا
      </div>
    </AbsoluteFill>
  );
};
