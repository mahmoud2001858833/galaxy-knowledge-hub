import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { D } from "../theme";

const cairo = loadCairo("normal", { weights: ["700", "900"], subsets: ["arabic"] });
const amiri = loadAmiri("normal", { weights: ["400", "700"], subsets: ["arabic"] });

export const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 200, stiffness: 60 } });
  const sp2 = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const sp3 = spring({ frame: frame - 75, fps, config: { damping: 200 } });
  const sp4 = spring({ frame: frame - 140, fps, config: { damping: 200 } });
  const ruleW = interpolate(frame, [100, 170], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", direction: "rtl", padding: 60 }}>
      <div style={{ opacity: sp, transform: `scale(${interpolate(sp, [0, 1], [0.88, 1])})`, marginBottom: 22 }}>
        <Img src={staticFile("damij-logo.png")} style={{ width: 140, height: 140, objectFit: "contain" }} />
      </div>

      <div
        style={{
          opacity: sp2,
          transform: `translateY(${interpolate(sp2, [0, 1], [20, 0])}px)`,
          fontFamily: cairo.fontFamily,
          fontWeight: 900,
          fontSize: 78,
          color: D.primary,
          textAlign: "center",
          lineHeight: 1.15,
          letterSpacing: -1,
        }}
      >
        من قلبِ الأردنِّ
        <span style={{ color: D.gold }}>…  إلى العالم</span>
      </div>

      <div style={{ width: 280 * ruleW, height: 2, background: D.gold, margin: "26px 0 18px" }} />

      <div
        style={{
          opacity: sp3,
          fontFamily: cairo.fontFamily,
          fontSize: 26,
          color: D.ink,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        دامِج  ·  جسرُ العدالةِ الرقميةِ الشامل
      </div>

      <div
        style={{
          opacity: sp4,
          marginTop: 40,
          fontFamily: amiri.fontFamily,
          fontSize: 20,
          color: D.muted,
          textAlign: "center",
          lineHeight: 2,
          maxWidth: 900,
        }}
      >
        ترسيخاً لإرثِ الأبِ المؤسس
        <br />
        <span style={{ color: D.ink, fontWeight: 700, fontSize: 22 }}>الشيخِ زايدِ بنِ سلطانَ آلِ نهيان</span>
        <br />
        طيَّبَ اللهُ ثراه
      </div>

      <div style={{ opacity: sp4, marginTop: 36, fontFamily: amiri.fontFamily, fontSize: 14, letterSpacing: 6, color: D.muted }}>
        ANABA  SECONDARY  SCHOOL  ·  JORDAN  ·  2026
      </div>
      <div style={{ opacity: sp4, marginTop: 6, fontFamily: cairo.fontFamily, fontSize: 13, color: D.muted }}>
        تم إنشاء المنصة بواسطة مدرسة عنبة الثانوية الشاملة للبنين
      </div>
    </AbsoluteFill>
  );
};
