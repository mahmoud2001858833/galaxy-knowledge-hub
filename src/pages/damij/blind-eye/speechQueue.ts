// Prioritized speech queue + earcons + spatial audio for Blind Eye
// Bilingual-aware (English + Arabic) with stronger dedup + heartbeat suppression.

import type { BELang } from './i18n';
import { BE_BCP47 } from './i18n';

export type SpeechPriority = 'critical' | 'directional' | 'descriptive';

type SpeechItem = {
  text: string;
  priority: SpeechPriority;
  rate?: number;
  pitch?: number;
  pan?: number;
  lang?: BELang;
  enqueuedAt: number;
  onEnd?: () => void;
};

const voicesCache: Record<BELang, SpeechSynthesisVoice | null> = { en: null, ar: null };
let activeLang: BELang = 'en';
let audioCtx: AudioContext | null = null;
let panNode: StereoPannerNode | null = null;
let queue: SpeechItem[] = [];
let speakingItem: SpeechItem | null = null;
let lastSpokenHash: { key: string; t: number } = { key: '', t: 0 };
let lastAnySpeechAt = 0;
let volume = 1;

function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch {}
  }
  if (audioCtx && !panNode && (audioCtx as any).createStereoPanner) {
    try { panNode = audioCtx.createStereoPanner(); panNode.connect(audioCtx.destination); } catch {}
  }
  return audioCtx;
}

function scoreVoice(v: SpeechSynthesisVoice, lang: BELang) {
  const name = v.name.toLowerCase();
  let s = 0;
  // Prefer "Natural"/"Online"/"Google"/"Microsoft" voices when available
  if (/natural/.test(name)) s += 8;
  if (/online/.test(name)) s += 5;
  if (/google/.test(name)) s += 6;
  if (/microsoft/.test(name)) s += 4;
  if (/premium|enhanced|wavenet/.test(name)) s += 5;
  if (lang === 'en') {
    if (v.lang === 'en-US') s += 4;
    else if (v.lang === 'en-GB') s += 3;
    else if (/^en/i.test(v.lang)) s += 2;
  } else {
    if (v.lang === 'ar-SA') s += 4;
    else if (v.lang === 'ar-EG') s += 3;
    else if (/^ar/i.test(v.lang)) s += 2;
  }
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
  for (const lang of ['en', 'ar'] as BELang[]) {
    const candidates = all.filter(v => v.lang.toLowerCase().startsWith(lang));
    candidates.sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));
    voicesCache[lang] = candidates[0] ?? null;
  }
}

// Back-compat: keep old name used elsewhere
export function pickArabicVoice() {
  refreshVoices();
}

export function isSpeaking() {
  return speakingItem !== null;
}

export function setSpeechVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
}

function priWeight(p: SpeechPriority) {
  return p === 'critical' ? 3 : p === 'directional' ? 2 : 1;
}

function drainQueue() {
  if (speakingItem) return;
  const now = Date.now();
  // Drop stale descriptive items (>800ms) and stale directional (>2.5s)
  queue = queue.filter(q => {
    if (q.priority === 'descriptive' && now - q.enqueuedAt > 800) return false;
    if (q.priority === 'directional' && now - q.enqueuedAt > 2500) return false;
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
  u.rate = item.rate ?? (lang === 'ar' ? 0.98 : 1.05);
  u.pitch = item.pitch ?? 1;
  u.volume = volume;
  const finish = () => {
    speakingItem = null;
    item.onEnd?.();
    setTimeout(drainQueue, 30);
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
  windowMs = 3500,
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

// Earcons -----------------------------------------------------
function tone(freq: number, durMs: number, pan = 0, gainPeak = 0.25) {
  const ctx = ensureAudio();
  if (!ctx) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.type = 'sine';
    const dest = panNode || ctx.destination;
    if (panNode) panNode.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), ctx.currentTime);
    o.connect(g);
    g.connect(dest);
    const dur = durMs / 1000;
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gainPeak * volume, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  } catch {}
}

export const earcons = {
  scanTick: () => tone(420, 50, 0, 0.05),
  approach: () => { tone(660, 100, 0, 0.18); setTimeout(() => tone(880, 100, 0, 0.2), 110); },
  away:     () => { tone(660, 100, 0, 0.18); setTimeout(() => tone(440, 100, 0, 0.18), 110); },
  hazard:   (pan = 0) => { tone(1100, 90, pan, 0.3); setTimeout(() => tone(1100, 90, pan, 0.3), 130); },
  pointLeft:  () => tone(700, 80, -0.9, 0.25),
  pointRight: () => tone(700, 80,  0.9, 0.25),
  pointAhead: () => tone(700, 80,  0.0, 0.25),
  sceneChange: () => { tone(520, 70, 0, 0.18); setTimeout(() => tone(780, 70, 0, 0.18), 80); },
};

export function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) {
    try { (navigator as any).vibrate(pattern); } catch {}
  }
}
