import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { D, FPS } from "../theme";

const cairo = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const amiri = loadAmiri("normal", { weights: ["400", "700"], subsets: ["arabic"] });

export const SceneCover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const logoSp = spring({ frame, fps, config: { damping: 200, stiffness: 70 } });
  const titleSp = spring({ frame: frame - 25, fps, config: { damping: 200 } });
  const subSp = spring({ frame: frame - 55, fps, config: { damping: 200 } });
  const lineW = interpolate(frame, [70, 130], [0, 1], { extrapolateRight: "clamp" });
  const kickerOp = interpolate(frame, [90, 130], [0, 1], { extrapolateRight: "clamp" });
  const imgOp = interpolate(frame, [10, 60], [0, 0.18], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [18 * FPS - 25, 18 * FPS], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ direction: "rtl", opacity: exit }}>
      {/* faint photo wash */}
      <div style={{ position: "absolute", inset: 0, opacity: imgOp }}>
        <Img src={staticFile("images/damij-jordan.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(40%)" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${D.bg}EE 0%, ${D.bg}CC 50%, ${D.bg}EE 100%)` }} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {/* logo */}
        <div style={{ transform: `scale(${interpolate(logoSp, [0, 1], [0.7, 1])})`, opacity: logoSp, marginBottom: 28 }}>
          <Img src={staticFile("damij-logo.png")} style={{ width: 180, height: 180, objectFit: "contain" }} />
        </div>

        {/* eyebrow */}
        <div style={{ opacity: titleSp, fontFamily: amiri.fontFamily, color: D.gold, fontSize: 22, letterSpacing: 8, marginBottom: 18 }}>
          جـائـزة  زايـد  للاسـتـدامـة  ٢٠٢٦
        </div>

        {/* title */}
        <div
          style={{
            opacity: titleSp,
            transform: `translateY(${interpolate(titleSp, [0, 1], [30, 0])}px)`,
            fontFamily: cairo.fontFamily,
            fontWeight: 900,
            fontSize: 180,
            color: D.primary,
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          دامِـج
        </div>

        {/* gold rule */}
        <div style={{ width: 320 * lineW, height: 3, background: D.gold, margin: "30px 0 22px" }} />

        {/* subtitle */}
        <div
          style={{
            opacity: subSp,
            transform: `translateY(${interpolate(subSp, [0, 1], [16, 0])}px)`,
            fontFamily: cairo.fontFamily,
            fontSize: 34,
            color: D.ink,
            fontWeight: 700,
          }}
        >
          منظومة الدمج الرقمية الشاملة
        </div>
        <div
          style={{
            opacity: subSp,
            marginTop: 12,
            fontFamily: cairo.fontFamily,
            fontSize: 22,
            color: D.muted,
            fontWeight: 400,
            maxWidth: 900,
            textAlign: "center",
            lineHeight: 1.7,
          }}
        >
          عدالةٌ تعليميةٌ من قلب الأردن  ·  مدرسة عنبة الثانوية الشاملة للبنين
        </div>

        <div style={{ opacity: kickerOp, marginTop: 60, fontFamily: amiri.fontFamily, fontSize: 18, letterSpacing: 6, color: D.muted }}>
          ANABA  SCHOOL  ·  JORDAN
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
