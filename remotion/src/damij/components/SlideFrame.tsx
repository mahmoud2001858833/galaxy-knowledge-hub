import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { D, SLIDE_FRAMES_EACH, TOTAL_SLIDES, TOTAL } from "../theme";

const cairo = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const manrope = loadManrope("normal", { weights: ["500", "700", "800"], subsets: ["latin"] });

export const FONTS = { cairo: cairo.fontFamily, manrope: manrope.fontFamily };

export const useSlideOpacity = (totalFrames: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200, stiffness: 90, mass: 0.5 } });
  const exit = interpolate(frame, [totalFrames - 14, totalFrames - 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(enter, [0, 1], [1.02, 1]);
  return { opacity: Math.min(enter, exit), scale };
};

export const SlideFrame: React.FC<{
  slideIndex: number;
  kicker: string;
  accent: string;
  children: React.ReactNode;
}> = ({ slideIndex, kicker, accent, children }) => {
  const { opacity, scale } = useSlideOpacity(SLIDE_FRAMES_EACH);
  const frame = useCurrentFrame();

  const globalFrame = slideIndex * SLIDE_FRAMES_EACH + frame;
  const progress = Math.min(1, globalFrame / TOTAL);

  return (
    <AbsoluteFill style={{ direction: "rtl", opacity, transform: `scale(${scale})` }}>
      {/* Top progress bar — thin gold */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "#E2E7EE", zIndex: 10 }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: accent }} />
      </div>

      {/* Header */}
      <div style={{
        position: "absolute", top: 28, right: 80, left: 80,
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 5,
      }}>
        <div style={{ fontFamily: manrope.fontFamily, fontWeight: 700, fontSize: 12, color: D.muted, letterSpacing: 6 }}>
          {kicker}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 24, height: 2, background: accent }} />
          <div style={{ fontFamily: manrope.fontFamily, fontWeight: 800, fontSize: 13, color: D.primary, letterSpacing: 2 }}>
            {String(slideIndex + 1).padStart(2, "0")} / {String(TOTAL_SLIDES).padStart(2, "0")}
          </div>
        </div>
      </div>

      {/* Main body — generous padding, no overlap */}
      <div style={{ position: "absolute", inset: 0, padding: "90px 90px 80px 90px" }}>
        {children}
      </div>

      {/* Footer brand */}
      <div style={{
        position: "absolute", bottom: 22, right: 80, left: 80,
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 9,
      }}>
        <div style={{ fontFamily: cairo.fontFamily, fontSize: 11, color: D.muted, letterSpacing: 2 }}>
          مدرسة عنبه الثانية الشاملة للبنين  ·  إربد  ·  الأردن
        </div>
        <div style={{ fontFamily: manrope.fontFamily, fontWeight: 700, fontSize: 12, color: D.primary, letterSpacing: 2 }}>
          damij-jo.life
        </div>
      </div>
    </AbsoluteFill>
  );
};
