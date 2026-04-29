import { Composition } from "remotion";
import { MainVideo, TOTAL_DURATION } from "./MainVideo";
import { MemoryTreeVideo, TOTAL as MT_TOTAL } from "./MemoryTreeVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={TOTAL_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="memory-tree"
      component={MemoryTreeVideo}
      durationInFrames={MT_TOTAL}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
