import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { D } from "../theme";

const cairo = loadCairo("normal", { weights: ["700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700"] });

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 22 } });
  const sp2 = spring({ frame: frame - 30, fps, config: { damping: 22 } });
  const sp3 = spring({ frame: frame - 90, fps, config: { damping: 24 } });
  const sp4 = spring({ frame: frame - 180, fps, config: { damping: 22 } });
  const pulse = Math.sin(frame * 0.12) * 15 + 40;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", direction: "rtl" }}>
      <div style={{ opacity: sp, transform: `scale(${interpolate(sp, [0, 1], [0.85, 1])})`, marginBottom: 30 }}>
        <Img src={staticFile("damij-logo.png")} style={{ width: 200, height: 200, objectFit: "contain", filter: `drop-shadow(0 0 ${pulse}px rgba(124,58,237,0.6))` }} />
      </div>
      <div
        style={{
          opacity: sp2,
          transform: `translateY(${interpolate(sp2, [0, 1], [30, 0])}px)`,
          fontFamily: cairo.fontFamily,
          fontWeight: 900,
          fontSize: 70,
          color: D.text,
          textAlign: "center",
          lineHeight: 1.2,
          background: `linear-gradient(135deg, ${D.text}, ${D.primary} 50%, ${D.accent})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        من قلبِ الأردن… إلى العالم
      </div>
      <div
        style={{
          opacity: sp3,
          transform: `translateY(${interpolate(sp3, [0, 1], [20, 0])}px)`,
          marginTop: 24,
          fontFamily: cairo.fontFamily,
          fontSize: 30,
          color: D.fade,
          fontWeight: 700,
        }}
      >
        دامِج — جسرُ العدالةِ الرقميةِ الشامل
      </div>
      <div
        style={{
          opacity: sp4,
          marginTop: 60,
          fontFamily: cairo.fontFamily,
          fontSize: 22,
          color: D.muted,
          textAlign: "center",
          lineHeight: 1.8,
          maxWidth: 900,
        }}
      >
        ترسيخاً لإرثِ الأبِ المؤسس الشيخِ زايدِ بنِ سلطانَ آلِ نهيان<br />
        طيَّبَ اللهُ ثراه
      </div>
      <div style={{ opacity: sp4, marginTop: 40, fontFamily: orbitron.fontFamily, fontSize: 14, letterSpacing: 6, color: D.muted }}>
        ANABA SECONDARY SCHOOL · JORDAN · 2026
      </div>
    </AbsoluteFill>
  );
};
