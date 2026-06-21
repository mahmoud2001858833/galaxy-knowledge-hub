// Damij brand palette — Editorial, Light, Institutional
export const D = {
  bg: "#F4F6FA",
  bgSoft: "#FFFFFF",
  surface: "#FFFFFF",
  border: "#D7DCE5",
  ink: "#0E1E36",
  text: "#0E1E36",
  primary: "#1A3766",   // deep institutional navy
  primary2: "#1E6FA8",  // steel blue
  gold: "#E8A12C",      // refined gold
  teal: "#228889",      // muted teal
  green: "#2A9163",     // sustainability
  warm: "#B85A3E",      // terracotta
  muted: "#6B7A8F",
  fade: "#3D4C66",
  // legacy aliases (used in some scenes)
  accent: "#E8A12C",
  hope: "#2A9163",
};

export const FPS = 30;

// Scene durations (frames @ 30fps) — ~4:25 total
export const DUR = {
  cover: 18 * FPS, // 540
  s1: 55 * FPS,    // 1650
  s2: 55 * FPS,    // 1650
  s3: 60 * FPS,    // 1800
  s4: 55 * FPS,    // 1650
  cta: 22 * FPS,   // 660
};

export const TOTAL = Object.values(DUR).reduce((a, b) => a + b, 0); // 7950
