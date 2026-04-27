import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { loadFont as loadJet } from "@remotion/google-fonts/JetBrainsMono";
import { C } from "../theme";

const cairo = loadCairo("normal", { weights: ["700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700"] });
const jet = loadJet("normal", { weights: ["400", "700"] });

const codeLines = [
  { t: "// AI Platform Builder", c: C.muted },
  { t: "const platform = createApp({", c: C.text },
  { t: "  name: 'منصة تعليمية',", c: C.accent2 },
  { t: "  ai: 'gemini-3-pro',", c: C.accent },
  { t: "  ui: 'tailwind + react'", c: C.primary },
  { t: "});", c: C.text },
  { t: "▶ Generating... ✓ Done", c: C.accent },
];

export const Scene4Builder: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const browserSp = spring({ frame, fps, config: { damping: 15, stiffness: 110 } });
  const exitOpacity = interpolate(frame, [180, 200], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", opacity: exitOpacity, gap: 80 }}>
      {/* Left: text */}
      <div style={{ width: 560, opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }), transform: `translateX(${interpolate(spring({ frame: frame - 10, fps, config: { damping: 20 } }), [0, 1], [-80, 0])}px)` }}>
        <div style={{ fontFamily: orbitron.fontFamily, color: C.accent, fontSize: 22, letterSpacing: 10, marginBottom: 20 }}>
          AI BUILDER
        </div>
        <h2 style={{ fontFamily: cairo.fontFamily, fontSize: 88, color: C.text, margin: 0, fontWeight: 900, lineHeight: 1.05 }}>
          من فكرة <br />
          <span style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            إلى منصة كاملة
          </span>
        </h2>
        <div style={{ fontFamily: cairo.fontFamily, fontSize: 28, color: C.muted, marginTop: 24, fontWeight: 700, lineHeight: 1.5 }}>
          اكتب فكرتك بالعربية، وسيتولّى الذكاء الاصطناعي بناء الكود والواجهة والمعاينة الحية.
        </div>
      </div>

      {/* Right: browser mockup */}
      <div
        style={{
          transform: `translateY(${interpolate(browserSp, [0, 1], [80, 0])}px) scale(${interpolate(browserSp, [0, 1], [0.9, 1])})`,
          opacity: browserSp,
          width: 720,
          height: 480,
          background: "#000",
          borderRadius: 18,
          border: `1.5px solid ${C.line}`,
          boxShadow: `0 30px 80px ${C.primary}33, 0 0 60px ${C.accent}22`,
          overflow: "hidden",
        }}
      >
        {/* Browser bar */}
        <div style={{ height: 44, background: C.bgSoft, display: "flex", alignItems: "center", padding: "0 16px", gap: 8, borderBottom: `1px solid ${C.line}` }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          <div style={{ flex: 1, height: 24, background: "#000", borderRadius: 6, marginLeft: 16, display: "flex", alignItems: "center", padding: "0 12px", fontFamily: jet.fontFamily, fontSize: 13, color: C.muted }}>
            peak-of-science.ai/builder
          </div>
        </div>
        {/* Code area */}
        <div style={{ padding: 32, fontFamily: jet.fontFamily, fontSize: 22, lineHeight: 1.7 }}>
          {codeLines.map((line, i) => {
            const lineOpacity = interpolate(frame, [40 + i * 12, 55 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ color: line.c, opacity: lineOpacity }}>
                {line.t}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
