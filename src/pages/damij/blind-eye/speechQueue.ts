// Single-voice, no-earcon speech queue for Blind Eye.
// Only TTS comes out of the device — no tones, no vibration, no audio FX.

import type { BELang } from './i18n';
import { BE_BCP47 } from './i18n';

export type SpeechPriority = 'critical' | 'directional' | 'descriptive';

type SpeechItem = {
  text: string;
  priority: SpeechPriority;
  rate?: number;
  pitch?: number;
  pan?: number; // ignored (kept for back-compat)
  lang?: BELang;
  enqueuedAt: number;
  onEnd?: () => void;
};

const voicesCache: Partial<Record<BELang, SpeechSynthesisVoice | null>> = {};
let activeLang: BELang = 'en';
let queue: SpeechItem[] = [];
let speakingItem: SpeechItem | null = null;
let lastSpokenHash: { key: string; t: number } = { key: '', t: 0 };
let lastAnySpeechAt = 0;
let volume = 1;

function scoreVoice(v: SpeechSynthesisVoice, lang: BELang) {
  const name = v.name.toLowerCase();
  const target = BE_BCP47[lang];
  let s = 0;
  if (/google/.test(name)) s += 10;
  if (/natural/.test(name)) s += 8;
  if (/microsoft/.test(name)) s += 6;
  if (/online/.test(name)) s += 4;
  if (/premium|enhanced|wavenet/.test(name)) s += 5;
  if (v.lang.toLowerCase() === target.toLowerCase()) s += 4;
  else if (v.lang.toLowerCase().startsWith(lang.toLowerCase())) s += 2;
  if (v.default) s += 1;
  return s;
}

export function setActiveLang(lang: BELang) {
  activeLang = lang;
  refreshVoices();
}

export function refreshVoices() {
  if (!('speechSynthesis' in window)) return;
  const all = window.speechSynthesis.getVoices();
  for (const lang of Object.keys(BE_BCP47) as BELang[]) {
    const prefix = lang.toLowerCase();
    const candidates = all.filter(v => v.lang.toLowerCase().startsWith(prefix));
    candidates.sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));
    voicesCache[lang] = candidates[0] ?? null;
  }
}

export function pickArabicVoice() { refreshVoices(); }

export function isSpeaking() { return speakingItem !== null; }

export function setSpeechVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
}

function priWeight(p: SpeechPriority) {
  return p === 'critical' ? 3 : p === 'directional' ? 2 : 1;
}

// Unified, elegant voice params — same breath for every utterance.
function unifiedRate(lang: BELang) { return lang === 'ar' ? 1.0 : 1.05; }

function drainQueue() {
  if (speakingItem) return;
  const now = Date.now();
  // Drop stale items aggressively for snappy guidance.
  queue = queue.filter(q => {
    if (q.priority === 'descriptive' && now - q.enqueuedAt > 500) return false;
    if (q.priority === 'directional' && now - q.enqueuedAt > 1500) return false;
    return true;
  });
  if (queue.length === 0) return;
  queue.sort((a, b) => priWeight(b.priority) - priWeight(a.priority) || a.enqueuedAt - b.enqueuedAt);
  const item = queue.shift()!;
  speakingItem = item;
  lastAnySpeechAt = now;

  if (!('speechSynthesis' in window)) { speakingItem = null; return; }
  const lang = item.lang ?? activeLang;
  const u = new SpeechSynthesisUtterance(item.text);
  u.lang = BE_BCP47[lang];
  const voice = voicesCache[lang];
  if (voice) u.voice = voice;
  // Unified params — ignore per-item rate/pitch overrides for a consistent voice.
  u.rate = unifiedRate(lang);
  u.pitch = 1.0;
  u.volume = volume;
  const finish = () => {
    speakingItem = null;
    item.onEnd?.();
    setTimeout(drainQueue, 20);
  };
  u.onend = finish;
  u.onerror = finish;
  try { window.speechSynthesis.speak(u); } catch { finish(); }
}

export function enqueueSpeech(item: Omit<SpeechItem, 'enqueuedAt'>) {
  if (!('speechSynthesis' in window)) return;
  const full: SpeechItem = { ...item, enqueuedAt: Date.now() };
  if (full.priority === 'critical') {
    try { window.speechSynthesis.cancel(); } catch {}
    speakingItem = null;
    queue = queue.filter(q => q.priority === 'critical');
  }
  queue.push(full);
  drainQueue();
}

export function speakDedup(
  text: string,
  hashKey: string,
  priority: SpeechPriority,
  windowMs = 1500,
  opts: { rate?: number; pitch?: number; onEnd?: () => void; lang?: BELang } = {},
) {
  const now = Date.now();
  if (hashKey === lastSpokenHash.key && now - lastSpokenHash.t < windowMs && priority !== 'critical') return;
  lastSpokenHash = { key: hashKey, t: now };
  enqueueSpeech({ text, priority, ...opts });
}

export function timeSinceLastSpeech() {
  return Date.now() - lastAnySpeechAt;
}

export function cancelAllSpeech() {
  try { window.speechSynthesis.cancel(); } catch {}
  queue = [];
  speakingItem = null;
}

// Web Audio API Spatial Earcons Synthesizer (Zero-latency, offline, stereo panning)
let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtxClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq: number, durationMs: number, type: OscillatorType = 'sine', pan = 0, gainLevel = 0.15) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    if (ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), ctx.currentTime);
      osc.connect(panner);
      panner.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {}
}

export const earcons = {
  scanTick: () => playTone(880, 50, 'sine', 0, 0.08),
  approach: () => {
    playTone(440, 90, 'triangle', 0, 0.12);
    setTimeout(() => playTone(660, 120, 'triangle', 0, 0.12), 100);
  },
  away: () => {
    playTone(660, 90, 'sine', 0, 0.1);
    setTimeout(() => playTone(330, 120, 'sine', 0, 0.1), 100);
  },
  hazard: (pan = 0) => {
    playTone(750, 80, 'sawtooth', pan, 0.2);
    setTimeout(() => playTone(850, 120, 'sawtooth', pan, 0.22), 90);
  },
  pointLeft: () => playTone(480, 100, 'sine', -0.85, 0.15),
  pointRight: () => playTone(480, 100, 'sine', 0.85, 0.15),
  pointAhead: () => playTone(540, 80, 'sine', 0, 0.12),
  sceneChange: () => playTone(400, 60, 'sine', 0, 0.08),
};

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch {}
  }
}

