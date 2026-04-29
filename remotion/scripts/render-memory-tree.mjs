import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
});
console.log("Bundled.");

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: "memory-tree",
  puppeteerInstance: browser,
});
console.log("Composition selected:", composition.durationInFrames, "frames");

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: process.env.OUT || "/mnt/documents/memory-tree-explainer_v2.mp4",
  puppeteerInstance: browser,
  muted: true,
  concurrency: 1,
  onProgress: ({ progress }) => {
    if (Math.floor(progress * 100) % 10 === 0) console.log(`progress: ${Math.round(progress * 100)}%`);
  },
});
console.log("Render done.");

await browser.close({ silent: false });
