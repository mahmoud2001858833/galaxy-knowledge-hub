import { AbsoluteFill, Series, Audio, Sequence, staticFile } from "remotion";
import { Bg } from "./damij/components/Bg";
import { SlideFrame } from "./damij/components/SlideFrame";
import { SlideBody } from "./damij/components/SlideBody";
import { SLIDES } from "./damij/script";
import { SLIDE_FRAMES_EACH, TOTAL } from "./damij/theme";

export { TOTAL as DAMIJ_TOTAL };

export const DamijZayedVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Bg />
      {/* Background music — soft */}
      <Audio src={staticFile("audio/bg-music.mp3")} volume={0.22} loop />

      {/* SFX layer — fire each slide's effects at its start */}
      {SLIDES.map((slide, i) => {
        const start = i * SLIDE_FRAMES_EACH;
        return (slide.sfx || []).map((kind, k) => (
          <Sequence
            key={`sfx-${i}-${k}`}
            from={start + k * 4}
            durationInFrames={kind === "whoosh" ? 20 : kind === "chime" ? 28 : 6}
          >
            <Audio
              src={staticFile(`audio/${kind}.mp3`)}
              volume={kind === "whoosh" ? 0.45 : kind === "chime" ? 0.35 : 0.3}
            />
          </Sequence>
        ));
      })}

      <Series>
        {SLIDES.map((slide, i) => (
          <Series.Sequence key={slide.n} durationInFrames={SLIDE_FRAMES_EACH}>
            <SlideFrame slideIndex={i} kicker={slide.kicker} accent={slide.accent}>
              <SlideBody slide={slide} />
            </SlideFrame>
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
