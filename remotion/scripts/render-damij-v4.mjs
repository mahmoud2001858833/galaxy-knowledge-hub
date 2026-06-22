import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import { execSync } from "node:child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "node:fs";

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

const videoOnly = "/tmp/damij-v4-video-only.mp4";
await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation: videoOnly,
  puppeteerInstance: browser,
  muted: true,
  concurrency: 3,
  jpegQuality: 80,
  onProgress: ({ progress }) => {
    const p = Math.round(progress * 100);
    if (p % 5 === 0) process.stdout.write(`${p}% `);
  },
});
console.log("\nVideo rendered.");
await browser.close({ silent: false });

// ===== Audio pipeline =====
const totalSec = composition.durationInFrames / composition.fps;
console.log(`Total duration: ${totalSec}s`);

const bgRaw = path.resolve(__dirname, "../public/audio/bg-music.mp3");
const bgProcessed = "/tmp/damij-v4-bg.mp3";
const whoosh = path.resolve(__dirname, "../public/audio/whoosh.mp3");
const chime = path.resolve(__dirname, "../public/audio/chime.mp3");
const tick = path.resolve(__dirname, "../public/audio/tick.mp3");

// Process bg music: warmer, with reverb tail, looped to length, fade in/out
console.log("Processing background music...");
execSync(
  `ffmpeg -y -stream_loop -1 -i "${bgRaw}" ` +
  `-af "highpass=f=80,lowpass=f=9000,aecho=0.7:0.6:60:0.25,dynaudnorm=f=200:g=15,afade=in:st=0:d=2,afade=out:st=${totalSec - 3}:d=3,volume=0.55" ` +
  `-t ${totalSec} -c:a libmp3lame -b:a 192k "${bgProcessed}"`,
  { stdio: "inherit" }
);

// Build SFX timeline matching script.ts sfx arrays
const SLIDE_SEC = 5;
const FPS = composition.fps;

// Mirror SLIDES sfx — simplified: each slide n has whoosh at slide start (frame 0)
// chime at frame 18 (count-up reveal) for bigNumber slides, tick stagger for bullets
// We embed timing per-slide based on script.ts structure.

// Read script to extract sfx
const scriptPath = path.resolve("remotion/src/damij/script.ts");
const scriptSrc = fs.readFileSync(scriptPath, "utf8");
// crude parse: split by "n: " markers
const slideBlocks = scriptSrc.split(/\n\s*\{\s*\n?\s*n:\s*/).slice(1);
const sfxEvents = []; // { t, file, vol }
slideBlocks.forEach((block, i) => {
  const slideStart = i * SLIDE_SEC;
  const sfxMatch = block.match(/sfx:\s*\[([^\]]+)\]/);
  if (!sfxMatch) return;
  const kinds = [...sfxMatch[1].matchAll(/"(whoosh|chime|tick)"/g)].map(m => m[1]);
  kinds.forEach((kind, k) => {
    const offset = kind === "whoosh" ? 0 : kind === "chime" ? 0.6 : 0.15 * k;
    sfxEvents.push({
      t: slideStart + offset,
      file: kind === "whoosh" ? whoosh : kind === "chime" ? chime : tick,
      vol: kind === "whoosh" ? 0.35 : kind === "chime" ? 0.28 : 0.18,
    });
  });
});
console.log(`SFX events: ${sfxEvents.length}`);

// Build ffmpeg command: bg + many SFX delayed
const inputs = [`-i "${bgProcessed}"`];
sfxEvents.forEach(e => inputs.push(`-i "${e.file}"`));

const filterParts = [];
sfxEvents.forEach((e, i) => {
  const ms = Math.round(e.t * 1000);
  filterParts.push(`[${i + 1}:a]adelay=${ms}|${ms},volume=${e.vol}[s${i}]`);
});
const mixInputs = ["[0:a]"].concat(sfxEvents.map((_, i) => `[s${i}]`)).join("");
filterParts.push(`${mixInputs}amix=inputs=${sfxEvents.length + 1}:duration=first:dropout_transition=0:normalize=0[mix]`);

const mixed = "/tmp/damij-v4-mixed.mp3";
console.log("Mixing audio...");
execSync(
  `ffmpeg -y ${inputs.join(" ")} -filter_complex "${filterParts.join(";")}" -map "[mix]" -c:a libmp3lame -b:a 192k "${mixed}"`,
  { stdio: "inherit", maxBuffer: 1024 * 1024 * 50 }
);

// Mux
const finalOut = "/mnt/documents/damij-zayed-video-v4.mp4";
console.log("Muxing final video...");
execSync(
  `ffmpeg -y -i "${videoOnly}" -i "${mixed}" -c:v copy -c:a aac -b:a 192k -shortest "${finalOut}"`,
  { stdio: "inherit" }
);
console.log("DONE ->", finalOut);
