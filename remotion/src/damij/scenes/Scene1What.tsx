import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { D } from "../theme";
import { Reveal } from "../components/Reveal";

const cairo = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700"] });

const SYSTEMS = [
  { ar: "عين الأعمى", en: "BLIND VISION", color: D.primary },
  { ar: "برايل", en: "BRAILLE", color: D.accent },
  { ar: "ترجمة الإشارة", en: "SIGN LANG", color: D.hope },
  { ar: "ADHD", en: "FOCUS", color: D.primary },
  { ar: "جسر الحواس", en: "SENSORY", color: D.accent },
  { ar: "المختبر السريري", en: "CLINICAL", color: D.hope },
  { ar: "التوحد", en: "AUTISM", color: D.primary },
  { ar: "الإدارة", en: "ADMIN", color: D.accent },
];

export const Scene1What: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [60 * 30 - 30, 60 * 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ direction: "rtl", padding: "100px 120px", opacity: exit, flexDirection: "column", justifyContent: "center" }}>
      <Reveal delay={5}>
        <div style={{ fontFamily: orbitron.fontFamily, color: D.primary, fontSize: 18, letterSpacing: 10, marginBottom: 16 }}>
          01 — THE PROJECT
        </div>
      </Reveal>
      <Reveal delay={15}>
        <h1 style={{ fontFamily: cairo.fontFamily, fontSize: 96, fontWeight: 900, color: D.text, margin: 0, lineHeight: 1.1 }}>
          ما هو <span style={{ color: D.primary }}>"دامج"</span>؟
        </h1>
      </Reveal>
      <Reveal delay={40} y={20}>
        <p style={{ fontFamily: cairo.fontFamily, fontSize: 36, color: D.fade, marginTop: 30, marginBottom: 60, maxWidth: 1400, lineHeight: 1.5, fontWeight: 400 }}>
          منصة سيادية ذكية تُحوّل ذوي الإعاقة من فئة مستقبِلة
          إلى شركاء في صناعة المعرفة.
        </p>
      </Reveal>

      {/* 8 systems grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 20 }}>
        {SYSTEMS.map((s, i) => (
          <Reveal key={i} delay={70 + i * 12} y={40}>
            <div
              style={{
                background: `linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
                border: `1px solid ${s.color}55`,
                borderRadius: 18,
                padding: "28px 24px",
                height: 140,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ width: 36, height: 3, background: s.color, boxShadow: `0 0 12px ${s.color}` }} />
              <div>
                <div style={{ fontFamily: cairo.fontFamily, fontSize: 28, color: D.text, fontWeight: 700 }}>{s.ar}</div>
                <div style={{ fontFamily: orbitron.fontFamily, fontSize: 12, color: D.muted, letterSpacing: 3, marginTop: 6 }}>{s.en}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={70 + 8 * 12 + 30} y={20}>
        <div style={{ marginTop: 60, fontFamily: cairo.fontFamily, fontSize: 32, color: D.hope, fontWeight: 700 }}>
          ابتكارنا في الدمج: ثمانية أنظمة • خوارزميات عصبية واحدة • منصة مفتوحة المصدر
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
