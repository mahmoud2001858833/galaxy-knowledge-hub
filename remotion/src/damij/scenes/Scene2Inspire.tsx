import { AbsoluteFill, staticFile, useCurrentFrame, interpolate } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { D, FPS } from "../theme";
import { Reveal, KenBurns } from "../components/Reveal";

const cairo = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const amiri = loadAmiri("normal", { weights: ["400", "700"], subsets: ["arabic"] });

const Counter: React.FC<{ to: number; suffix?: string; delay?: number; color: string }> = ({ to, suffix = "", delay = 0, color }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, Math.min(1, (frame - delay) / 60));
  const eased = 1 - Math.pow(1 - t, 3);
  const val = Math.round(to * eased);
  return (
    <div style={{ fontFamily: cairo.fontFamily, fontSize: 140, fontWeight: 900, color, lineHeight: 1, letterSpacing: -3 }}>
      {val}{suffix}
    </div>
  );
};

export const Scene2Inspire: React.FC = () => {
  const frame = useCurrentFrame();
  const exit = interpolate(frame, [55 * FPS - 25, 55 * FPS], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ direction: "rtl", opacity: exit, padding: "60px 80px", flexDirection: "column", justifyContent: "center" }}>
      <Reveal delay={5}>
        <div style={{ fontFamily: amiri.fontFamily, color: D.gold, fontSize: 16, letterSpacing: 6, marginBottom: 10 }}>
          ٠٢  ·  إلـهـام  الـطـلـبـة
        </div>
      </Reveal>
      <Reveal delay={12}>
        <h1 style={{ fontFamily: cairo.fontFamily, fontSize: 68, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.15, maxWidth: 1100 }}>
          من <span style={{ color: D.muted }}>مُستهلِكي</span> التكنولوجيا
          <br /> إلى <span style={{ color: D.gold }}>قادةِ</span> الحلول الإنسانية
        </h1>
      </Reveal>

      <div style={{ display: "flex", gap: 50, marginTop: 40, alignItems: "flex-start" }}>
        {/* Stats */}
        <div style={{ flex: 1.1, display: "flex", flexDirection: "column", gap: 28 }}>
          <Reveal delay={40}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 24, borderRight: `3px solid ${D.primary}`, paddingRight: 22 }}>
              <Counter to={15} delay={45} color={D.primary} />
              <div>
                <div style={{ fontFamily: cairo.fontFamily, fontSize: 22, color: D.ink, fontWeight: 700 }}>
                  طالباً يُتقنون البرمجة وقواعد البيانات
                </div>
                <div style={{ fontFamily: cairo.fontFamily, fontSize: 16, color: D.muted, marginTop: 4 }}>
                  إرثُ مشروع "ذروة العلم"
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={75}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 24, borderRight: `3px solid ${D.gold}`, paddingRight: 22 }}>
              <Counter to={30} suffix="+" delay={80} color={D.gold} />
              <div>
                <div style={{ fontFamily: cairo.fontFamily, fontSize: 22, color: D.ink, fontWeight: 700 }}>
                  طالباً جديداً يُؤهَّلون في الذكاء الاصطناعي
                </div>
                <div style={{ fontFamily: cairo.fontFamily, fontSize: 16, color: D.muted, marginTop: 4 }}>
                  والأمن السيبراني  ·  عبر منحة الجائزة
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={110}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 24, borderRight: `3px solid ${D.green}`, paddingRight: 22 }}>
              <div style={{ fontFamily: cairo.fontFamily, fontSize: 140, fontWeight: 900, color: D.green, lineHeight: 1, letterSpacing: -3 }}>∞</div>
              <div>
                <div style={{ fontFamily: cairo.fontFamily, fontSize: 22, color: D.ink, fontWeight: 700 }}>
                  ريادة أعمالٍ أخلاقيةٍ تخدم الإنسان
                </div>
                <div style={{ fontFamily: cairo.fontFamily, fontSize: 16, color: D.muted, marginTop: 4 }}>
                  التكنولوجيا  مسؤوليّةٌ  قبل  أن  تكون  مهارة
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Image */}
        <div style={{ flex: 0.9 }}>
          <Reveal delay={30}>
            <KenBurns
              src={staticFile("images/damij-coding.jpg")}
              delay={30}
              duration={500}
              scaleFrom={1.08}
              scaleTo={1.20}
              panY={-10}
              style={{ width: "100%", height: 460, borderRadius: 12, border: `1px solid ${D.border}` }}
              overlay={`linear-gradient(160deg, transparent 50%, ${D.primary}44)`}
            />
            <div style={{ marginTop: 12, fontFamily: amiri.fontFamily, fontSize: 14, color: D.muted, letterSpacing: 3, textAlign: "right" }}>
              ١٥٪  من  المنصة  مبنيّةٌ  بأيدي  طلابنا
            </div>
          </Reveal>
        </div>
      </div>
    </AbsoluteFill>
  );
};
