import { AbsoluteFill, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { D, FPS } from "../theme";
import { Reveal, KenBurns } from "../components/Reveal";

const cairo = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const amiri = loadAmiri("normal", { weights: ["400", "700"], subsets: ["arabic"] });

const PILLARS = [
  { title: "تمويلٌ متين", body: "١٥٠٬٠٠٠$ كافيةٌ لخمسِ سنواتٍ من التشغيل (٥٥٠$/شهر)", c: D.primary },
  { title: "نموذجُ SaaS", body: "اشتراكٌ مدرسيٌّ يُحقّق اكتفاءً ذاتياً بعد العام الثاني", c: D.gold },
  { title: "تبنٍّ حكومي", body: "وزارة التربية والتعليم  ·  مؤسسة الأمير الحسن", c: D.teal },
  { title: "أثرٌ متعاظم", body: "+٥٠٬٠٠٠ مستفيدٍ متوقَّعٍ خلال ٣ سنوات", c: D.green },
];

export const Scene3Sustain: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [60 * FPS - 25, 60 * FPS], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ direction: "rtl", opacity: exit, padding: "60px 80px", flexDirection: "row", gap: 50 }}>
      {/* Left: image */}
      <div style={{ flex: 0.9 }}>
        <Reveal delay={15}>
          <KenBurns
            src={staticFile("images/damij-students.jpg")}
            delay={15}
            duration={550}
            scaleFrom={1.10}
            scaleTo={1.22}
            panX={20}
            style={{ width: "100%", height: 560, borderRadius: 12, border: `1px solid ${D.border}` }}
            overlay={`linear-gradient(170deg, ${D.primary}30 0%, transparent 40%, ${D.primary}77 100%)`}
          />
        </Reveal>
      </div>

      {/* Right: pillars */}
      <div style={{ flex: 1.1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Reveal delay={5}>
          <div style={{ fontFamily: amiri.fontFamily, color: D.gold, fontSize: 16, letterSpacing: 6, marginBottom: 10 }}>
            ٠٣  ·  الاسـتـدامـة  والأثـر
          </div>
        </Reveal>
        <Reveal delay={12}>
          <h1 style={{ fontFamily: cairo.fontFamily, fontSize: 64, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.15 }}>
            مشروعٌ يعيشُ <span style={{ color: D.gold }}>أكثرَ من خمسةِ أعوام</span>،
            <br />ويُحدثُ أثراً يتجاوزُ المدرسة.
          </h1>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 36 }}>
          {PILLARS.map((p, i) => (
            <Reveal key={i} delay={40 + i * 14} y={22}>
              <div
                style={{
                  background: D.surface,
                  border: `1px solid ${D.border}`,
                  borderTop: `3px solid ${p.c}`,
                  borderRadius: 10,
                  padding: "18px 22px",
                  minHeight: 130,
                  boxShadow: "0 4px 14px rgba(14,30,54,0.05)",
                }}
              >
                <div style={{ fontFamily: cairo.fontFamily, fontSize: 24, fontWeight: 700, color: p.c }}>{p.title}</div>
                <div style={{ fontFamily: cairo.fontFamily, fontSize: 17, color: D.fade, marginTop: 8, lineHeight: 1.6 }}>{p.body}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} y={16}>
          <div
            style={{
              marginTop: 26,
              padding: "16px 22px",
              borderRight: `4px solid ${D.gold}`,
              background: `${D.gold}10`,
              fontFamily: cairo.fontFamily,
              fontSize: 20,
              color: D.ink,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            مفتوحُ المصدرِ  ·  ينطلقُ من الأردنِّ ليُغطّيَ الشرقَ الأوسط وشمالَ أفريقيا.
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
