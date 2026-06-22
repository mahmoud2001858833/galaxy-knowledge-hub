// Damij brand palette — Editorial, Light, Institutional
export const D = {
  bg: "#F4F6FA",
  bgSoft: "#FFFFFF",
  surface: "#FFFFFF",
  border: "#D7DCE5",
  ink: "#0E1E36",
  text: "#0E1E36",
  primary: "#1A3766",
  primary2: "#1E6FA8",
  gold: "#E8A12C",
  teal: "#228889",
  green: "#2A9163",
  warm: "#B85A3E",
  muted: "#6B7A8F",
  fade: "#3D4C66",
  accent: "#E8A12C",
  hope: "#2A9163",
};

export const FPS = 30;

// 10 slides — each scene = title duration in seconds.
export const SLIDE_SECS = [22, 30, 32, 38, 30, 36, 30, 36, 30, 16];
export const SLIDE_FRAMES = SLIDE_SECS.map((s) => s * FPS);
export const TOTAL = SLIDE_FRAMES.reduce((a, b) => a + b, 0); // 300s = 9000 frames
