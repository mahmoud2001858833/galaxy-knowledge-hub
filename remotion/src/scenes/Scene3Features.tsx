import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { C } from "../theme";

const cairo = loadCairo("normal", { weights: ["700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700"] });

const features = [
  { icon: "{ }", title: "مولّد الكود", desc: "أنشئ كود احترافي بثوانٍ", color: C.primary },
  { icon: "</>", title: "مُصلح الأخطاء", desc: "حلول فورية ودقيقة", color: C.accent },
  { icon: "★", title: "باني المنصات AI", desc: "منصات كاملة من فكرة", color: C.accent2 },
  { icon: "✦", title: "محرر تفاعلي", desc: "معاينة لحظية للنتائج", color: C.primary },
  { icon: "◆", title: "متعدد اللغات", desc: "12+ لغة برمجة مدعومة", color: C.accent },
  { icon: "▲", title: "تصدير سريع", desc: "نشر بضغطة زر", color: C.accent2 },
];

const Card: React.FC<{ f: typeof features[number]; delay: number }> = ({ f, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 130 } });

  return (
    <div
      style={{
        transform: `translateY(${interpolate(sp, [0, 1], [60, 0])}px) scale(${interpolate(sp, [0, 1], [0.85, 1])})`,
        opacity: sp,
        width: 380,
        background: `linear-gradient(140deg, ${C.bgSoft}ee, #000c)`,
        border: `1.5px solid ${f.color}66`,
        borderRadius: 18,
        padding: 32,
        boxShadow: `0 12px 40px ${f.color}22`,
      }}
    >
      <div
        style={{
          width: 70,
          height: 70,
          background: `linear-gradient(135deg, ${f.color}, ${f.color}88)`,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: orbitron.fontFamily,
          fontSize: 28,
          fontWeight: 700,
          color: "#000",
          marginBottom: 20,
          boxShadow: `0 0 30px ${f.color}99`,
        }}
      >
        {f.icon}
      </div>
      <div style={{ fontFamily: cairo.fontFamily, fontSize: 30, color: C.text, fontWeight: 900, marginBottom: 8 }}>
        {f.title}
      </div>
      <div style={{ fontFamily: cairo.fontFamily, fontSize: 20, color: C.muted, fontWeight: 700 }}>
        {f.desc}
      </div>
    </div>
  );
};

export const Scene3Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerSp = spring({ frame, fps, config: { damping: 18 } });
  const exitOpacity = interpolate(frame, [160, 180], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: exitOpacity, padding: 60 }}>
      <div
        style={{
          opacity: headerSp,
          transform: `translateX(${interpolate(headerSp, [0, 1], [80, 0])}px)`,
          textAlign: "center",
          marginBottom: 50,
        }}
      >
        <div style={{ fontFamily: orbitron.fontFamily, color: C.primary, fontSize: 22, letterSpacing: 10, marginBottom: 12 }}>
          CORE FEATURES
        </div>
        <h2 style={{ fontFamily: cairo.fontFamily, fontSize: 80, color: C.text, margin: 0, fontWeight: 900 }}>
          أدوات استثنائية
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, maxWidth: 1400 }}>
        {features.map((f, i) => (
          <Card key={i} f={f} delay={15 + i * 6} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
