import { AbsoluteFill, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { D, FPS } from "../theme";
import { Reveal, KenBurns } from "../components/Reveal";

const cairo = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const amiri = loadAmiri("normal", { weights: ["400", "700"], subsets: ["arabic"] });

const SYSTEMS = [
  { ar: "عين الأعمى", note: "تحويل المرئيات إلى صوت", c: "#1A3766" },
  { ar: "نظام برايل", note: "تعليم ذكي للكفيف", c: "#1E6FA8" },
  { ar: "ترجمة الإشارة", note: "كاميرا تترجم لحظياً", c: "#228889" },
  { ar: "تركيز الـADHD", note: "ألعاب تأهيلية تكيفية", c: "#E8A12C" },
  { ar: "جسر الحواس", note: "تكييف الواجهات حسياً", c: "#B85A3E" },
  { ar: "المختبر السريري", note: "محاكاة فحوصات طبية", c: "#2A9163" },
  { ar: "دعم التوحد", note: "خطط علاجية فردية", c: "#1A3766" },
  { ar: "إدارة المدرسة", note: "لوحة قيادة شاملة", c: "#1E6FA8" },
];

export const Scene1What: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [55 * FPS - 25, 55 * FPS], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ direction: "rtl", opacity: exit, padding: "60px 80px", flexDirection: "row", gap: 50 }}>
      {/* Left: image column */}
      <div style={{ flex: 1.1, display: "flex", flexDirection: "column", gap: 16 }}>
        <Reveal delay={5}>
          <div style={{ fontFamily: amiri.fontFamily, color: D.gold, fontSize: 16, letterSpacing: 6 }}>
            ٠١  ·  المـشـروع
          </div>
        </Reveal>
        <Reveal delay={12}>
          <h1 style={{ fontFamily: cairo.fontFamily, fontSize: 76, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.05 }}>
            ما هو <span style={{ color: D.gold }}>"دامِج"؟</span>
          </h1>
        </Reveal>
        <Reveal delay={30}>
          <p style={{ fontFamily: cairo.fontFamily, fontSize: 22, color: D.fade, margin: 0, lineHeight: 1.7, maxWidth: 580 }}>
            منصةٌ سياديةٌ ذكية تحوّل ذوي الإعاقة
            من فئةٍ مستقبِلة إلى شركاءَ في صناعة المعرفة،
            عبر ثمانية أنظمةٍ متكاملةٍ تحت سقفٍ واحد.
          </p>
        </Reveal>

        <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
          <Reveal delay={48}>
            <KenBurns
              src={staticFile("images/damij-braille.jpg")}
              delay={48}
              duration={300}
              scaleFrom={1.08}
              scaleTo={1.22}
              style={{ width: 320, height: 220, borderRadius: 10, border: `1px solid ${D.border}` }}
              overlay={`linear-gradient(180deg, transparent 40%, ${D.primary}55)`}
            />
          </Reveal>
          <Reveal delay={70}>
            <KenBurns
              src={staticFile("images/damij-sign.jpg")}
              delay={70}
              duration={300}
              scaleFrom={1.08}
              scaleTo={1.22}
              panX={-20}
              style={{ width: 240, height: 220, borderRadius: 10, border: `1px solid ${D.border}` }}
              overlay={`linear-gradient(180deg, transparent 40%, ${D.primary}55)`}
            />
          </Reveal>
        </div>
      </div>

      {/* Right: 8 systems grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignContent: "center" }}>
        {SYSTEMS.map((s, i) => (
          <Reveal key={i} delay={40 + i * 9} y={20}>
            <div
              style={{
                background: D.surface,
                border: `1px solid ${D.border}`,
                borderRight: `3px solid ${s.c}`,
                borderRadius: 10,
                padding: "18px 20px",
                minHeight: 92,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(14,30,54,0.04)",
              }}
            >
              <div style={{ fontFamily: cairo.fontFamily, fontSize: 22, color: D.ink, fontWeight: 700 }}>{s.ar}</div>
              <div style={{ fontFamily: cairo.fontFamily, fontSize: 14, color: D.muted, marginTop: 4, fontWeight: 400 }}>{s.note}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </AbsoluteFill>
  );
};
