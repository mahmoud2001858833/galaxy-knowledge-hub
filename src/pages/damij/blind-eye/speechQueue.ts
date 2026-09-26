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

export function cleanSpokenText(raw: string, lang: BELang = 'ar'): string {
  if (!raw) return '';
  let clean = raw
    // Strip markdown formatting & links
    .replace(/[*#_~`>[\]()]/g, ' ')
    .replace(/http\S+/g, ' ')
    // Strip emoji characters
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (lang === 'ar') {
    // Expand currency abbreviations into natural spoken Arabic
    clean = clean
      .replace(/\bJOD\b|\bJD\b/gi, 'دينار أردني')
      .replace(/\bSAR\b/gi, 'ريال سعودي')
      .replace(/\bAED\b/gi, 'درهم إماراتي')
      .replace(/\bEGP\b/gi, 'جنيه مصري')
      .replace(/\bKWD\b/gi, 'دينار كويتي')
      .replace(/\bQAR\b/gi, 'ريال قطري')
      .replace(/\bUSD\b|\$/g, 'دولار')
      .replace(/\bEUR\b|€/g, 'يورو');

    // Expand measurement units
    clean = clean
      .replace(/(\d+)\s*(m|م)\b/gi, '$1 متر')
      .replace(/(\d+)\s*(cm|سم)\b/gi, '$1 سنتيمتر')
      .replace(/(\d+)\s*(km|كم)\b/gi, '$1 كيلومتر')
      .replace(/%/g, ' بالمئة ');

    // Normalize punctuation to natural cadence
    clean = clean
      .replace(/[!؛;]/g, '، ')
      .replace(/[:—–-]/g, ' ')
      .replace(/([،,.])\s*([،,.])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return clean;
}

function scoreVoice(v: SpeechSynthesisVoice, lang: BELang) {
  const name = v.name.toLowerCase();
  const vLang = v.lang.toLowerCase().replace('_', '-');
  const target = BE_BCP47[lang].toLowerCase();
  const langPrefix = lang.toLowerCase();

  // Strict check: if voice language does NOT match requested language, disqualify completely!
  const matchesLang = vLang.startsWith(langPrefix) || vLang.includes(langPrefix);
  if (!matchesLang) return -10000;

  let s = 100; // Base score for correct language
  if (vLang === target) s += 40; // Exact locale match

  // Prioritize premium, natural neural voices
  if (/natural|neural|wavenet|enhanced|premium/.test(name)) s += 60;
  if (/google/.test(name)) s += 40;
  if (/microsoft/.test(name)) s += 35;
  if (/apple|siri/.test(name)) s += 30;

  // Specific top-rated Arabic voices on iOS / Mac / Android / Windows
  if (lang === 'ar') {
    if (/majed|ماجد/.test(name)) s += 90;
    if (/tarik|طارق/.test(name)) s += 85;
    if (/laila|ليلى/.test(name)) s += 80;
    if (/mariam|مريم/.test(name)) s += 75;
    if (/hamed|حامد|salma|سلمى|shakir|شاكر/.test(name)) s += 75;
  }

  if (v.default) s += 5;
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
    const candidates = all.filter(v => {
      const vl = v.lang.toLowerCase().replace('_', '-');
      return vl.startsWith(prefix) || vl.includes(prefix);
    });
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

// Unified, elegant voice params — smooth articulation for Arabic.
function unifiedRate(lang: BELang) { return lang === 'ar' ? 0.94 : 1.0; }

function drainQueue() {
  if (speakingItem) return;
  const now = Date.now();
  // Drop stale items aggressively for snappy guidance.
  queue = queue.filter(q => {
    if (q.priority === 'descriptive' && now - q.enqueuedAt > 600) return false;
    if (q.priority === 'directional' && now - q.enqueuedAt > 1800) return false;
    return true;
  });
  if (queue.length === 0) return;
  queue.sort((a, b) => priWeight(b.priority) - priWeight(a.priority) || a.enqueuedAt - b.enqueuedAt);
  const item = queue.shift()!;
  speakingItem = item;
  lastAnySpeechAt = now;

  if (!('speechSynthesis' in window)) { speakingItem = null; return; }
  const lang = item.lang ?? activeLang;
  const cleanedText = cleanSpokenText(item.text, lang);
  if (!cleanedText) { speakingItem = null; return; }

  const u = new SpeechSynthesisUtterance(cleanedText);
  const voice = voicesCache[lang];
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang || BE_BCP47[lang];
  } else {
    u.lang = BE_BCP47[lang];
  }
  u.rate = item.rate ?? unifiedRate(lang);
  u.pitch = item.pitch ?? 1.0;
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
    const lang = full.lang ?? activeLang;
    const cleanNew = cleanSpokenText(full.text, lang);
    const cleanCurrent = speakingItem ? cleanSpokenText(speakingItem.text, speakingItem.lang ?? activeLang) : '';

    // If currently speaking the exact same alert within 1500ms, ignore duplicate spam
    if (speakingItem && cleanCurrent === cleanNew && Date.now() - speakingItem.enqueuedAt < 1500) {
      return;
    }

    // If currently speaking a lower priority message, interrupt immediately
    if (speakingItem && speakingItem.priority !== 'critical') {
      try { window.speechSynthesis.cancel(); } catch {}
      speakingItem = null;
    }
    // Drop lower priority items from queue
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

