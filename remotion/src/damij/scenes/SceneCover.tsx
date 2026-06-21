import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { D } from "../theme";

const cairo = loadCairo("normal", { weights: ["700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700"] });

export const SceneCover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoSp = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const titleSp = spring({ frame: frame - 20, fps, config: { damping: 22 } });
  const subSp = spring({ frame: frame - 45, fps, config: { damping: 24 } });
  const kickerOp = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [400, 450], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: exit, direction: "rtl" }}>
      <div style={{ transform: `scale(${interpolate(logoSp, [0, 1], [0.6, 1])})`, opacity: logoSp, marginBottom: 40 }}>
        <Img src={staticFile("damij-logo.png")} style={{ width: 320, height: 320, objectFit: "contain", filter: "drop-shadow(0 20px 60px rgba(59,130,246,0.4))" }} />
      </div>
      <div
        style={{
          opacity: titleSp,
          transform: `translateY(${interpolate(titleSp, [0, 1], [40, 0])}px)`,
          fontFamily: cairo.fontFamily,
          fontWeight: 900,
          fontSize: 140,
          color: D.text,
          lineHeight: 1,
          background: `linear-gradient(135deg, ${D.text}, ${D.primary} 60%, ${D.accent})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        دامِج
      </div>
      <div
        style={{
          opacity: subSp,
          transform: `translateY(${interpolate(subSp, [0, 1], [20, 0])}px)`,
          marginTop: 20,
          fontFamily: cairo.fontFamily,
          fontSize: 32,
          color: D.fade,
          fontWeight: 700,
        }}
      >
        منظومة الدمج الرقمية الشاملة
      </div>
      <div
        style={{
          opacity: kickerOp,
          marginTop: 60,
          fontFamily: orbitron.fontFamily,
          fontSize: 18,
          letterSpacing: 8,
          color: D.muted,
        }}
      >
        ZAYED SUSTAINABILITY PRIZE · ANABA SCHOOL
      </div>
    </AbsoluteFill>
  );
};
