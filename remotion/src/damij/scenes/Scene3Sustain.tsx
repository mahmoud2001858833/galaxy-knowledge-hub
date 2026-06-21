import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { D } from "../theme";
import { Reveal } from "../components/Reveal";

const cairo = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700", "900"] });

export const Scene3Sustain: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [75 * 30 - 30, 75 * 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ direction: "rtl", padding: "100px 120px", opacity: exit, flexDirection: "column", justifyContent: "center" }}>
      <Reveal delay={5}>
        <div style={{ fontFamily: orbitron.fontFamily, color: D.hope, fontSize: 18, letterSpacing: 10, marginBottom: 16 }}>
          03 — SUSTAINABILITY
        </div>
      </Reveal>
      <Reveal delay={15}>
        <h1 style={{ fontFamily: cairo.fontFamily, fontSize: 88, fontWeight: 900, color: D.text, margin: 0, lineHeight: 1.1 }}>
          مشروعٌ <span style={{ color: D.hope }}>يَدوم</span> سنوات،<br />
          لا أشهراً
        </h1>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, marginTop: 60 }}>
        <Reveal delay={50}>
          <div style={{ border: `1px solid ${D.primary}55`, borderRadius: 18, padding: 36, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: orbitron.fontFamily, fontSize: 14, color: D.muted, letterSpacing: 4, marginBottom: 12 }}>FUNDING</div>
            <div style={{ fontFamily: orbitron.fontFamily, fontSize: 96, fontWeight: 900, color: D.primary, lineHeight: 1 }}>$150K</div>
            <div style={{ fontFamily: cairo.fontFamily, fontSize: 26, color: D.fade, marginTop: 14, fontWeight: 700 }}>
              منحة الجائزة تكفي 5 سنوات تشغيل كاملة
            </div>
            <div style={{ fontFamily: cairo.fontFamily, fontSize: 18, color: D.muted, marginTop: 8 }}>
              الكلفة الشهرية ~$550 فقط
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ border: `1px solid ${D.accent}55`, borderRadius: 18, padding: 36, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: orbitron.fontFamily, fontSize: 14, color: D.muted, letterSpacing: 4, marginBottom: 12 }}>REVENUE MODEL</div>
            <div style={{ fontFamily: orbitron.fontFamily, fontSize: 96, fontWeight: 900, color: D.accent, lineHeight: 1 }}>B2B</div>
            <div style={{ fontFamily: cairo.fontFamily, fontSize: 26, color: D.fade, marginTop: 14, fontWeight: 700 }}>
              مجاني للأسر • مدفوع للجامعات الطبية
            </div>
            <div style={{ fontFamily: cairo.fontFamily, fontSize: 18, color: D.muted, marginTop: 8 }}>
              ترخيص الخوارزميات + APIs
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={130} y={20}>
        <div style={{ marginTop: 50, padding: 36, border: `1px solid ${D.hope}55`, borderRadius: 18, background: "rgba(16,185,129,0.06)" }}>
          <div style={{ fontFamily: orbitron.fontFamily, fontSize: 14, color: D.muted, letterSpacing: 4, marginBottom: 14 }}>INSTITUTIONAL ADOPTION</div>
          <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: cairo.fontFamily, fontSize: 28, color: D.text, fontWeight: 900 }}>وزارة التربية والتعليم</div>
              <div style={{ fontFamily: cairo.fontFamily, fontSize: 18, color: D.muted, marginTop: 4 }}>تبنٍّ رسمي + تعميم على المملكة</div>
            </div>
            <div style={{ width: 1, height: 60, background: D.muted }} />
            <div>
              <div style={{ fontFamily: cairo.fontFamily, fontSize: 28, color: D.text, fontWeight: 900 }}>سمو الأمير الحسن بن طلال</div>
              <div style={{ fontFamily: cairo.fontFamily, fontSize: 18, color: D.muted, marginTop: 4 }}>إشادة سامية وتأييد ملكي</div>
            </div>
            <div style={{ width: 1, height: 60, background: D.muted }} />
            <div>
              <div style={{ fontFamily: orbitron.fontFamily, fontSize: 36, color: D.hope, fontWeight: 900 }}>50,000+</div>
              <div style={{ fontFamily: cairo.fontFamily, fontSize: 18, color: D.muted, marginTop: 4 }}>مستفيد نشط خلال 3 سنوات</div>
            </div>
          </div>
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
