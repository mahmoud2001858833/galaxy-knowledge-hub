import { AbsoluteFill, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { D, FPS } from "../theme";
import { Reveal, KenBurns } from "../components/Reveal";

const cairo = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const amiri = loadAmiri("normal", { weights: ["400", "700"], subsets: ["arabic"] });

const PROOFS = [
  { num: "١٥٪", label: "من المنصة بُنيت داخلياً", c: D.primary },
  { num: "٥٠٠+", label: "متخصصٍ أيّدوا المشروع", c: D.gold },
  { num: "٠٤", label: "صرحٍ طبيٍّ اعتمدت دامج", c: D.teal },
  { num: "#١", label: "البحث العلمي بالمملكة ٢٠٢٦", c: D.green },
];

const HOSPITALS = ["وزارة الصحة الأردنية", "مستشفى الملك المؤسس الجامعي", "مستشفى الأميرة بسمة", "مستشفى الرحمة التعليمي للأطفال"];
const AWARDS = ["جائزة الحسن بن طلال للتميّز العلمي", "جائزة أنا موهوب", "أولمبياد الكيمياء الوطني"];

export const Scene4Deserve: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [55 * FPS - 25, 55 * FPS], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ direction: "rtl", opacity: exit, padding: "55px 80px", flexDirection: "column" }}>
      <Reveal delay={5}>
        <div style={{ fontFamily: amiri.fontFamily, color: D.gold, fontSize: 16, letterSpacing: 6, marginBottom: 10 }}>
          ٠٤  ·  لـمـاذا  نـسـتـحـقّ  الـفـوز
        </div>
      </Reveal>
      <Reveal delay={12}>
        <h1 style={{ fontFamily: cairo.fontFamily, fontSize: 64, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.15 }}>
          سجلُّ نجاحٍ <span style={{ color: D.gold }}>موثَّق</span>،
          لا فكرةٌ نظريّة.
        </h1>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 28 }}>
        {PROOFS.map((p, i) => (
          <Reveal key={i} delay={32 + i * 11} y={22}>
            <div
              style={{
                background: D.surface,
                border: `1px solid ${D.border}`,
                borderBottom: `3px solid ${p.c}`,
                borderRadius: 10,
                padding: "20px 22px",
                boxShadow: "0 4px 14px rgba(14,30,54,0.05)",
              }}
            >
              <div style={{ fontFamily: cairo.fontFamily, fontSize: 56, fontWeight: 900, color: p.c, lineHeight: 1 }}>{p.num}</div>
              <div style={{ fontFamily: cairo.fontFamily, fontSize: 17, color: D.fade, marginTop: 10, fontWeight: 700, lineHeight: 1.4 }}>{p.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div style={{ display: "flex", gap: 30, marginTop: 32 }}>
        <Reveal delay={90} y={18}>
          <div style={{ width: 340 }}>
            <KenBurns
              src={staticFile("images/damij-legacy.jpg")}
              delay={90}
              duration={400}
              scaleFrom={1.10}
              scaleTo={1.20}
              style={{ width: "100%", height: 250, borderRadius: 10, border: `1px solid ${D.border}` }}
              overlay={`linear-gradient(180deg, transparent 50%, ${D.primary}55)`}
            />
          </div>
        </Reveal>

        <div style={{ flex: 1, display: "flex", gap: 36 }}>
          <Reveal delay={100}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: amiri.fontFamily, fontSize: 14, color: D.muted, letterSpacing: 4, marginBottom: 14 }}>
                اعتمادات طبية
              </div>
              {HOSPITALS.map((h, i) => (
                <div key={i} style={{ fontFamily: cairo.fontFamily, fontSize: 18, color: D.ink, fontWeight: 700, marginBottom: 8 }}>
                  <span style={{ color: D.teal, marginLeft: 10 }}>◆</span>
                  {h}
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: amiri.fontFamily, fontSize: 14, color: D.muted, letterSpacing: 4, marginBottom: 14 }}>
                جوائز وطنية
              </div>
              {AWARDS.map((a, i) => (
                <div key={i} style={{ fontFamily: cairo.fontFamily, fontSize: 18, color: D.ink, fontWeight: 700, marginBottom: 8 }}>
                  <span style={{ color: D.gold, marginLeft: 10 }}>◆</span>
                  {a}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </AbsoluteFill>
  );
};
