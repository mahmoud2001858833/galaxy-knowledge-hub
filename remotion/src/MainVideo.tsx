import { AbsoluteFill, Series } from "remotion";
import { Background } from "./components/Background";
import { Scene1Cover } from "./scenes/Scene1Cover";
import { Scene2Vision } from "./scenes/Scene2Vision";
import { Scene3Features } from "./scenes/Scene3Features";
import { Scene4Builder } from "./scenes/Scene4Builder";
import { Scene5CTA } from "./scenes/Scene5CTA";

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Series>
        <Series.Sequence durationInFrames={150}>
          <Scene1Cover />
        </Series.Sequence>
        <Series.Sequence durationInFrames={170}>
          <Scene2Vision />
        </Series.Sequence>
        <Series.Sequence durationInFrames={200}>
          <Scene3Features />
        </Series.Sequence>
        <Series.Sequence durationInFrames={220}>
          <Scene4Builder />
        </Series.Sequence>
        <Series.Sequence durationInFrames={100}>
          <Scene5CTA />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
