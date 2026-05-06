// Shared haptic preferences for the Sensory Bridge.
// Stored in localStorage and consumed by SensoryImageTactile.

export type HapticIntensity = 'light' | 'medium' | 'strong';

export interface HapticSettings {
  intensity: HapticIntensity;
  edgeClick: HapticIntensity;       // Edge crossings (geometric mode)
  textureHum: HapticIntensity;      // Continuous humming inside regions
  successPattern: HapticIntensity;  // Success cue
  errorPattern: HapticIntensity;    // Error cue
  focusPulse: HapticIntensity;      // Focus point pulse
}

const KEY = 'damij_haptic_settings_v1';

export const DEFAULT_HAPTIC_SETTINGS: HapticSettings = {
  intensity: 'medium',
  edgeClick: 'medium',
  textureHum: 'light',
  successPattern: 'medium',
  errorPattern: 'strong',
  focusPulse: 'medium',
};

export function loadHapticSettings(): HapticSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_HAPTIC_SETTINGS };
    return { ...DEFAULT_HAPTIC_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_HAPTIC_SETTINGS };
  }
}

export function saveHapticSettings(s: HapticSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

// Multiplier applied to base vibration durations
export function intensityScale(level: HapticIntensity): number {
  return level === 'light' ? 0.55 : level === 'strong' ? 1.6 : 1;
}

// Concrete vibration patterns (in ms)
export function patternFor(kind: keyof Omit<HapticSettings, 'intensity'>, level: HapticIntensity): number[] {
  const k = intensityScale(level);
  const r = (n: number) => Math.max(8, Math.round(n * k));
  switch (kind) {
    case 'edgeClick':       return [r(15), 20, r(15)];
    case 'textureHum':      return [r(25)];
    case 'successPattern':  return [r(60), 90, r(60), 90, r(180)];
    case 'errorPattern':    return [r(40), 50, r(40), 50, r(80), 40, r(40)];
    case 'focusPulse':      return [r(60), 240];
  }
}
