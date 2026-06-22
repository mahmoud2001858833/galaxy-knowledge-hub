import { AbsoluteFill, Series, Audio, staticFile } from "remotion";
import { Bg } from "./damij/components/Bg";
import { SlideFrame } from "./damij/components/SlideFrame";
import { SlideBody } from "./damij/components/SlideBody";
import { SLIDES } from "./damij/script";
import { SLIDE_FRAMES, TOTAL } from "./damij/theme";

export { TOTAL as DAMIJ_TOTAL };

export const DamijZayedVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Bg />
      <Audio src={staticFile("audio/bg-music.mp3")} volume={0.32} loop />
      <Series>
        {SLIDES.map((slide, i) => (
          <Series.Sequence key={slide.n} durationInFrames={SLIDE_FRAMES[i]}>
            <SlideFrame
              slideIndex={i}
              total={SLIDES.length}
              kicker={slide.kicker}
              accent={slide.accent}
              speakerNotes={slide.speakerNotes}
              durationFrames={SLIDE_FRAMES[i]}
            >
              <SlideBody slide={slide} />
            </SlideFrame>
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
