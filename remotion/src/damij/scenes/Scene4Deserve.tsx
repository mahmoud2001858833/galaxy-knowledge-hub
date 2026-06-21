import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { D } from "../theme";
import { Reveal } from "../components/Reveal";

const cairo = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700", "900"] });

const PROOFS = [
  { num: "15%", label: "من المنصة مبنية ذاتياً (MVP)", c: D.primary },
  { num: "500+", label: "متخصص أيّدوا المنصة", c: D.accent },
  { num: "04", label: "صروح طبية اعتمدت المشروع", c: D.hope },
  { num: "#1", label: "البحث العلمي بالمملكة 2026", c: D.primary },
];

const HOSPITALS = ["وزارة الصحة", "الملك المؤسس الجامعي", "الأميرة بسمة", "رحمة التعليمي للأطفال"];
const AWARDS = ["جائزة الحسن بن طلال للتميّز العلمي", "جائزة أنا موهوب", "أولمبياد الكيمياء الوطني"];

export const Scene4Deserve: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [70 * 30 - 30, 70 * 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ direction: "rtl", padding: "80px 120px", opacity: exit, flexDirection: "column", justifyContent: "center" }}>
      <Reveal delay={5}>
        <div style={{ fontFamily: orbitron.fontFamily, color: D.primary, fontSize: 18, letterSpacing: 10, marginBottom: 16 }}>
          04 — WHY WE DESERVE TO WIN
        </div>
      </Reveal>
      <Reveal delay={15}>
        <h1 style={{ fontFamily: cairo.fontFamily, fontSize: 80, fontWeight: 900, color: D.text, margin: 0, lineHeight: 1.1 }}>
          سجلّ نجاحٍ <span style={{ color: D.primary }}>موثَّق</span>،<br />
          لا فكرةٌ نظرية.
        </h1>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 50 }}>
        {PROOFS.map((p, i) => (
          <Reveal key={i} delay={45 + i * 12} y={30}>
            <div style={{ border: `1px solid ${p.c}55`, borderRadius: 16, padding: 28, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ fontFamily: orbitron.fontFamily, fontSize: 64, fontWeight: 900, color: p.c, lineHeight: 1 }}>{p.num}</div>
              <div style={{ fontFamily: cairo.fontFamily, fontSize: 20, color: D.fade, marginTop: 10, fontWeight: 700 }}>{p.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={110} y={20}>
        <div style={{ marginTop: 50, display: "flex", gap: 60 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: orbitron.fontFamily, fontSize: 14, color: D.muted, letterSpacing: 4, marginBottom: 14 }}>MEDICAL ENDORSEMENTS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {HOSPITALS.map((h, i) => (
                <div key={i} style={{ fontFamily: cairo.fontFamily, fontSize: 22, color: D.text, fontWeight: 700 }}>
                  <span style={{ color: D.hope, marginLeft: 10 }}>✦</span>
                  {h}
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: orbitron.fontFamily, fontSize: 14, color: D.muted, letterSpacing: 4, marginBottom: 14 }}>NATIONAL AWARDS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {AWARDS.map((a, i) => (
                <div key={i} style={{ fontFamily: cairo.fontFamily, fontSize: 22, color: D.text, fontWeight: 700 }}>
                  <span style={{ color: D.accent, marginLeft: 10 }}>✦</span>
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </AbsoluteFill>
  );
};
