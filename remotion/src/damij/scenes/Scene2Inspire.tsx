import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { D } from "../theme";
import { Reveal } from "../components/Reveal";

const cairo = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700", "900"] });

export const Scene2Inspire: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [70 * 30 - 30, 70 * 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ direction: "rtl", padding: "100px 120px", opacity: exit, flexDirection: "column", justifyContent: "center" }}>
      <Reveal delay={5}>
        <div style={{ fontFamily: orbitron.fontFamily, color: D.accent, fontSize: 18, letterSpacing: 10, marginBottom: 16 }}>
          02 — INSPIRING STUDENTS
        </div>
      </Reveal>
      <Reveal delay={15}>
        <h1 style={{ fontFamily: cairo.fontFamily, fontSize: 88, fontWeight: 900, color: D.text, margin: 0, lineHeight: 1.1 }}>
          من <span style={{ color: D.muted }}>مُستهلِكي</span> التكنولوجيا<br />
          إلى <span style={{ color: D.accent }}>قادةِ</span> الحلول
        </h1>
      </Reveal>

      {/* Two big numbers */}
      <div style={{ display: "flex", gap: 60, marginTop: 80 }}>
        <Reveal delay={50}>
          <div style={{ borderRight: `2px solid ${D.primary}`, paddingRight: 40 }}>
            <div style={{ fontFamily: orbitron.fontFamily, fontSize: 180, fontWeight: 900, color: D.primary, lineHeight: 1 }}>15</div>
            <div style={{ fontFamily: cairo.fontFamily, fontSize: 28, color: D.fade, marginTop: 12, fontWeight: 700 }}>
              طالباً يتقنون<br />البرمجة وقواعد البيانات
            </div>
            <div style={{ fontFamily: cairo.fontFamily, fontSize: 18, color: D.muted, marginTop: 8 }}>
              إرث مشروع "ذروة العلم"
            </div>
          </div>
        </Reveal>
        <Reveal delay={85}>
          <div style={{ borderRight: `2px solid ${D.accent}`, paddingRight: 40 }}>
            <div style={{ fontFamily: orbitron.fontFamily, fontSize: 180, fontWeight: 900, color: D.accent, lineHeight: 1 }}>+30</div>
            <div style={{ fontFamily: cairo.fontFamily, fontSize: 28, color: D.fade, marginTop: 12, fontWeight: 700 }}>
              طالباً جديداً سيُؤهَّلون<br />في AI والأمن السيبراني
            </div>
            <div style={{ fontFamily: cairo.fontFamily, fontSize: 18, color: D.muted, marginTop: 8 }}>
              عبر منحة الجائزة
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div>
            <div style={{ fontFamily: orbitron.fontFamily, fontSize: 180, fontWeight: 900, color: D.hope, lineHeight: 1 }}>∞</div>
            <div style={{ fontFamily: cairo.fontFamily, fontSize: 28, color: D.fade, marginTop: 12, fontWeight: 700 }}>
              ريادة أعمال أخلاقية<br />تخدم الإنسان
            </div>
            <div style={{ fontFamily: cairo.fontFamily, fontSize: 18, color: D.muted, marginTop: 8 }}>
              التكنولوجيا مسؤولية
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={160} y={20}>
        <div style={{ marginTop: 100, fontFamily: cairo.fontFamily, fontSize: 32, color: D.text, fontWeight: 700, maxWidth: 1400, lineHeight: 1.5 }}>
          ريادة الأعمال الحقيقية تبدأ بحلِّ معاناةِ إنسان.
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
