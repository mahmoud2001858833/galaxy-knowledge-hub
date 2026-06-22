import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { D, SLIDE_FRAMES, TOTAL } from "../theme";

const cairo = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const amiri = loadAmiri("normal", { weights: ["400", "700"], subsets: ["arabic"] });

export const FONTS = { cairo: cairo.fontFamily, amiri: amiri.fontFamily };

// Per-slide enter/exit fade
export const useSlideOpacity = (totalFrames: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200, stiffness: 80, mass: 0.6 } });
  const exit = interpolate(frame, [totalFrames - 18, totalFrames - 4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(enter, exit);
};

export const SlideFrame: React.FC<{
  slideIndex: number; // 0-based
  total: number;
  kicker: string;
  accent: string;
  speakerNotes: string;
  durationFrames: number;
  children: React.ReactNode;
}> = ({ slideIndex, total, kicker, accent, speakerNotes, durationFrames, children }) => {
  const op = useSlideOpacity(durationFrames);
  const frame = useCurrentFrame();

  // global progress bar (across full deck): compute frames elapsed before this slide
  const elapsedBefore = SLIDE_FRAMES.slice(0, slideIndex).reduce((a, b) => a + b, 0);
  const globalFrame = elapsedBefore + frame;
  const progress = Math.min(1, globalFrame / TOTAL);

  // caption typewriter-like fade
  const captionT = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ direction: "rtl", opacity: op }}>
      {/* Top progress bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#E2E7EE", zIndex: 10 }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: accent, transition: "none" }} />
      </div>

      {/* Header strip */}
      <div
        style={{
          position: "absolute",
          top: 22,
          right: 60,
          left: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 5,
        }}
      >
        <div style={{ fontFamily: amiri.fontFamily, fontSize: 14, color: D.muted, letterSpacing: 5 }}>
          {kicker}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 28, height: 2, background: accent }} />
          <div style={{ fontFamily: cairo.fontFamily, fontWeight: 700, fontSize: 14, color: D.primary, letterSpacing: 2 }}>
            {String(slideIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>
        </div>
      </div>

      {/* Main body */}
      <div style={{ position: "absolute", inset: 0, padding: "70px 60px 150px 60px" }}>{children}</div>

      {/* Speaker caption (subtitle) */}
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: 36,
          background: "rgba(14,30,54,0.94)",
          borderRight: `3px solid ${accent}`,
          borderRadius: 6,
          padding: "12px 18px",
          opacity: captionT * 0.96,
          zIndex: 8,
        }}
      >
        <div style={{ fontFamily: amiri.fontFamily, fontSize: 10, color: accent, letterSpacing: 3, marginBottom: 4 }}>
          نـصّ  الـطـالـب  ·  SPEAKER
        </div>
        <div
          style={{
            fontFamily: cairo.fontFamily,
            fontSize: 17,
            color: "#F4F6FA",
            lineHeight: 1.55,
            fontWeight: 400,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {speakerNotes}
        </div>
      </div>

      {/* Footer brand */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          right: 60,
          left: 60,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 9,
        }}
      >
        <div style={{ fontFamily: amiri.fontFamily, fontSize: 11, color: D.muted, letterSpacing: 3 }}>
          مـدرسـة  عـنـبـه  الـثـانـيـة  الـشـامـلـة  للـبـنـيـن  ·  إربـد  ·  الأردن
        </div>
        <div style={{ fontFamily: cairo.fontFamily, fontSize: 11, color: D.primary, letterSpacing: 2, fontWeight: 700 }}>
          damij-jo.life
        </div>
      </div>
    </AbsoluteFill>
  );
};
