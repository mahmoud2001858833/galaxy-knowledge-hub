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
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: "damij-zayed",
  puppeteerInstance: browser,
});
console.log("Composition:", composition.durationInFrames, "frames");

await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: process.env.OUT || "/mnt/documents/damij-zayed-video.mp4",
  puppeteerInstance: browser,
  muted: false,
  concurrency: 1,
  onProgress: ({ progress }) => {
    const p = Math.round(progress * 100);
    if (p % 5 === 0) process.stdout.write(`${p}% `);
  },
});
console.log("\nDone.");
await browser.close({ silent: false });
