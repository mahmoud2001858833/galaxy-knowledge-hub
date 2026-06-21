export const D = {
  bg: "#0F172A",
  bgSoft: "#172033",
  ink: "#0B1226",
  primary: "#3B82F6",
  accent: "#7C3AED",
  hope: "#10B981",
  text: "#FFFFFF",
  muted: "#94A3B8",
  fade: "#E2E8F0",
};

export const FPS = 30;

// Scene durations in frames (30fps)
export const DUR = {
  cover: 15 * FPS, // 0
  s1: 60 * FPS,    // 1 what
  s2: 70 * FPS,    // 2 inspire
  s3: 75 * FPS,    // 3 sustain
  s4: 70 * FPS,    // 4 deserve
  cta: 15 * FPS,   // 5 close
};

export const TOTAL = Object.values(DUR).reduce((a, b) => a + b, 0);
