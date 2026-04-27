import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { C } from "../theme";

const cairo = loadCairo("normal", { weights: ["700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700", "900"] });

const stats = [
  { num: "+200", label: "أداة تعليمية", color: C.primary },
  { num: "+150", label: "محاكاة تفاعلية", color: C.accent },
  { num: "+125", label: "أداة ذكاء اصطناعي", color: C.accent2 },
];

const StatCard: React.FC<{ s: typeof stats[number]; delay: number }> = ({ s, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
  const numProg = interpolate(spring({ frame: frame - delay - 6, fps, config: { damping: 20 } }), [0, 1], [0, 1]);

  return (
    <div
      style={{
        transform: `translateY(${interpolate(sp, [0, 1], [120, 0])}px) scale(${interpolate(sp, [0, 1], [0.8, 1])})`,
        opacity: sp,
        width: 380,
        height: 380,
        background: `linear-gradient(160deg, ${C.bgSoft}, #000)`,
        border: `2px solid ${s.color}55`,
        borderRadius: 24,
        padding: 40,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: `0 20px 60px ${s.color}33, inset 0 0 30px ${s.color}11`,
      }}
    >
      <div style={{ width: 60, height: 4, background: s.color, boxShadow: `0 0 20px ${s.color}` }} />
      <div>
        <div
          style={{
            fontFamily: orbitron.fontFamily,
            fontSize: 140,
            fontWeight: 900,
            color: s.color,
            lineHeight: 1,
            opacity: numProg,
            textShadow: `0 0 30px ${s.color}88`,
          }}
        >
          {s.num}
        </div>
        <div
          style={{
            fontFamily: cairo.fontFamily,
            fontSize: 32,
            color: C.text,
            marginTop: 16,
            fontWeight: 700,
          }}
        >
          {s.label}
        </div>
      </div>
    </div>
  );
};

export const Scene2Vision: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerSp = spring({ frame, fps, config: { damping: 18 } });
  const exitOpacity = interpolate(frame, [130, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: exitOpacity }}>
      <div
        style={{
          opacity: headerSp,
          transform: `translateY(${interpolate(headerSp, [0, 1], [-40, 0])}px)`,
          textAlign: "center",
          marginBottom: 60,
        }}
      >
        <div style={{ fontFamily: orbitron.fontFamily, color: C.accent, fontSize: 22, letterSpacing: 10, marginBottom: 16 }}>
          THE VISION
        </div>
        <h2 style={{ fontFamily: cairo.fontFamily, fontSize: 90, color: C.text, margin: 0, fontWeight: 900 }}>
          أرقام تصنع الفرق
        </h2>
      </div>

      <div style={{ display: "flex", gap: 40 }}>
        {stats.map((s, i) => (
          <StatCard key={i} s={s} delay={15 + i * 10} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
