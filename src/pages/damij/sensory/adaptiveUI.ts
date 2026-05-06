// adaptiveUI.ts — applies live adaptive interface based on sensory profile + ambient state
import type { SensoryProfile } from './SensoryProfileSetup';

export const ADAPTIVE_KEY = 'damij_adaptive_ui_v1';
export const ADAPTIVE_EVT = 'damij:adaptive-ui-changed';

export interface AdaptiveSettings {
  enabled: boolean;
  autoNightByTime: boolean;     // 19:00 → 06:00 → dark
  autoNightByLight: boolean;    // ambient light sensor
  autoBoostSize: boolean;       // low_vision → larger
  reduceMotion: boolean;        // distraction → less animation
  colorBlindFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  scale: number;                // 1.0 .. 1.6
  contrast: 'normal' | 'high' | 'ultra';
  density: 'comfortable' | 'compact' | 'minimal'; // stimuli density
  ambientLux?: number | null;
  lastAppliedAt?: string;
}

export const DEFAULT_ADAPTIVE: AdaptiveSettings = {
  enabled: true,
  autoNightByTime: true,
  autoNightByLight: true,
  autoBoostSize: true,
  reduceMotion: true,
  colorBlindFilter: 'none',
  scale: 1,
  contrast: 'normal',
  density: 'comfortable',
  ambientLux: null,
};

export function loadAdaptive(): AdaptiveSettings {
  try {
    const raw = localStorage.getItem(ADAPTIVE_KEY);
    if (raw) return { ...DEFAULT_ADAPTIVE, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_ADAPTIVE };
}

export function saveAdaptive(s: AdaptiveSettings) {
  s.lastAppliedAt = new Date().toISOString();
  localStorage.setItem(ADAPTIVE_KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent(ADAPTIVE_EVT, { detail: s }));
}

/** Derive recommended settings from profile + current environment. */
export function deriveFromProfile(profile: SensoryProfile | null, ambientLux: number | null): AdaptiveSettings {
  const base = loadAdaptive();
  if (!profile) return base;
  const next: AdaptiveSettings = { ...base, ambientLux };

  // 1) Color
  if (profile.vision === 'color_blind') {
    // default to deuteranopia filter (most common); user may override
    if (next.colorBlindFilter === 'none') next.colorBlindFilter = 'deuteranopia';
  }

  // Night by time
  const hour = new Date().getHours();
  const isNightTime = hour >= 19 || hour < 6;
  const lowLight = typeof ambientLux === 'number' && ambientLux < 30;

  if (next.autoNightByTime && isNightTime) {
    // override scheme via contrast/density bump signal — actual color scheme is set by class
  }
  if (next.autoNightByLight && lowLight) {
    // dim mode handled by data-attribute
  }

  // 2) Size
  if (next.autoBoostSize) {
    if (profile.vision === 'low_vision') next.scale = Math.max(next.scale, 1.35);
    if (profile.vision === 'partial_blind') next.scale = Math.max(next.scale, 1.5);
    if (profile.fontSize === 'lg') next.scale = Math.max(next.scale, 1.2);
    if (profile.fontSize === 'xl') next.scale = Math.max(next.scale, 1.45);
  }

  // 3) Speed / stimuli density
  if (profile.focus === 'easily_distracted') {
    next.reduceMotion = true;
    next.density = 'minimal';
  } else if (profile.focus === 'low_attention') {
    next.reduceMotion = true;
    next.density = 'compact';
  }

  // High contrast for partial vision / photosensitive
  if (profile.colorScheme === 'high_contrast') next.contrast = 'ultra';
  else if (profile.vision === 'low_vision' || profile.vision === 'partial_blind') next.contrast = 'high';

  return next;
}

/** Apply settings to document — uses CSS variables + data-attrs scoped to .damij-adaptive root. */
export function applyAdaptive(s: AdaptiveSettings) {
  const root = document.documentElement;
  root.classList.toggle('damij-adaptive-on', s.enabled);
  root.dataset.damijContrast = s.contrast;
  root.dataset.damijDensity = s.density;
  root.dataset.damijReduceMotion = s.reduceMotion ? '1' : '0';
  root.dataset.damijCbf = s.colorBlindFilter;

  // Night detection
  const hour = new Date().getHours();
  const isNight = (s.autoNightByTime && (hour >= 19 || hour < 6))
    || (s.autoNightByLight && typeof s.ambientLux === 'number' && s.ambientLux < 30);
  root.dataset.damijNight = isNight ? '1' : '0';

  // Scale via CSS variable (used by adaptive css)
  root.style.setProperty('--damij-adaptive-scale', String(s.scale));
}

/** Try to get ambient light (Chrome on Android / experimental). */
export async function readAmbientLux(): Promise<number | null> {
  try {
    // @ts-ignore experimental API
    if ('AmbientLightSensor' in window) {
      // @ts-ignore
      const sensor = new (window as any).AmbientLightSensor({ frequency: 1 });
      return await new Promise<number | null>((res) => {
        const t = setTimeout(() => { try { sensor.stop(); } catch {} res(null); }, 1500);
        sensor.onreading = () => {
          clearTimeout(t);
          const v = sensor.illuminance;
          try { sensor.stop(); } catch {}
          res(typeof v === 'number' ? v : null);
        };
        sensor.onerror = () => { clearTimeout(t); res(null); };
        sensor.start();
      });
    }
  } catch {}
  return null;
}

/** Initialize on app start: load + apply, listen for changes, refresh on hour change. */
export function initAdaptiveUI() {
  const apply = () => applyAdaptive(loadAdaptive());
  apply();
  window.addEventListener(ADAPTIVE_EVT, () => apply());
  // refresh every 10 min for time-of-day + ambient
  setInterval(async () => {
    const cur = loadAdaptive();
    if (!cur.enabled) return;
    if (cur.autoNightByLight) cur.ambientLux = await readAmbientLux();
    saveAdaptive(cur);
  }, 10 * 60 * 1000);
}
