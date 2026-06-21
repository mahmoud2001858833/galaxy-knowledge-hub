import { AbsoluteFill, Series, Audio, staticFile } from "remotion";
import { Bg } from "./damij/components/Bg";
import { SceneCover } from "./damij/scenes/SceneCover";
import { Scene1What } from "./damij/scenes/Scene1What";
import { Scene2Inspire } from "./damij/scenes/Scene2Inspire";
import { Scene3Sustain } from "./damij/scenes/Scene3Sustain";
import { Scene4Deserve } from "./damij/scenes/Scene4Deserve";
import { SceneCTA } from "./damij/scenes/SceneCTA";
import { DUR, TOTAL } from "./damij/theme";

export { TOTAL as DAMIJ_TOTAL };

export const DamijZayedVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Bg />
      <Audio src={staticFile("audio/damij-vo-ar.mp3")} volume={1} />
      <Audio src={staticFile("audio/bg-music.mp3")} volume={0.18} loop />
      <Series>
        <Series.Sequence durationInFrames={DUR.cover}><SceneCover /></Series.Sequence>
        <Series.Sequence durationInFrames={DUR.s1}><Scene1What /></Series.Sequence>
        <Series.Sequence durationInFrames={DUR.s2}><Scene2Inspire /></Series.Sequence>
        <Series.Sequence durationInFrames={DUR.s3}><Scene3Sustain /></Series.Sequence>
        <Series.Sequence durationInFrames={DUR.s4}><Scene4Deserve /></Series.Sequence>
        <Series.Sequence durationInFrames={DUR.cta}><SceneCTA /></Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
