import { Composition } from "remotion";
import { MainVideo, TOTAL_DURATION } from "./MainVideo";

// Total = 150 + 170 + 610 + 220 + 110 = 1260 frames @ 30fps = 42 seconds
export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={TOTAL_DURATION}
    fps={30}
    width={1920}
    height={1080}
  />
);
