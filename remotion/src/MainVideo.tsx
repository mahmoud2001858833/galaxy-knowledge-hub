import { AbsoluteFill, Series } from "remotion";
import { Background } from "./components/Background";
import { Scene1Cover } from "./scenes/Scene1Cover";
import { Scene2Vision } from "./scenes/Scene2Vision";
import { Scene3Sections, SCENE3_DURATION } from "./scenes/Scene3Sections";
import { Scene4Builder } from "./scenes/Scene4Builder";
import { Scene5CTA } from "./scenes/Scene5CTA";

export const SCENE_DURATIONS = {
  s1: 150,
  s2: 170,
  s3: SCENE3_DURATION, // 610
  s4: 220,
  s5: 110,
};

export const TOTAL_DURATION =
  SCENE_DURATIONS.s1 + SCENE_DURATIONS.s2 + SCENE_DURATIONS.s3 + SCENE_DURATIONS.s4 + SCENE_DURATIONS.s5;

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Series>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s1}>
          <Scene1Cover />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s2}>
          <Scene2Vision />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s3}>
          <Scene3Sections />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s4}>
          <Scene4Builder />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_DURATIONS.s5}>
          <Scene5CTA />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
