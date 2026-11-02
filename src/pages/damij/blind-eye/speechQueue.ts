// Speech for Blind Eye: one queue, by priority.
// - Natural voice (Gemini TTS through the blind-eye-voice function) when it is fast enough, played
//   through Web Audio; the phone's built-in voice otherwise. Everything heard once is cached, and
//   phrases known in advance are fetched before they are needed.
// - Long texts are spoken sentence by sentence (built-in voices cut off after ~15 s).
// - `urgent` items (an obstacle right ahead) interrupt anything, immediately, in the built-in voice.

import type { BELang } from './i18n';
import { BE_BCP47 } from './i18n';
import { audioContext } from './spatial/beacon';

export type SpeechPriority = 'critical' | 'directional' | 'descriptive';

type SpeechItem = {
  text: string;
  priority: SpeechPriority;
  urgent?: boolean;
  rate?: number;
  pitch?: number;
  pan?: number; // kept for back-compat
  lang?: BELang;
  enqueuedAt: number;
  onEnd?: () => void;
};

type VoiceFetcher = (text: string, lang: BELang) => Promise<ArrayBuffer | null>;

const voicesCache: Partial<Record<BELang, SpeechSynthesisVoice | null>> = {};
let activeLang: BELang = 'en';
let queue: SpeechItem[] = [];
let speakingItem: SpeechItem | null = null;
let lastSpokenHash: { key: string; t: number } = { key: '', t: 0 };
let lastAnySpeechAt = 0;
let lastText = '';
let volume = 1;
let source: AudioBufferSourceNode | null = null;
let generation = 0;

// natural voice
let fetcher: VoiceFetcher | null = null;
const audioCache = new Map<string, AudioBuffer>();
const inflight = new Map<string, Promise<AudioBuffer | null>>();
let failures = 0;
let disabledUntil = 0;

export function cleanSpokenText(raw: string, lang: BELang = 'ar'): string {
  if (!raw) return '';
  let clean = raw
    .replace(/[*#_~`>[\]()]/g, ' ')
    .replace(/http\S+/g, ' ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (lang === 'ar') {
    clean = clean
      .replace(/\bJOD\b|\bJD\b/gi, 'دينار أردني')
      .replace(/\bSAR\b/gi, 'ريال سعودي')
      .replace(/\bAED\b/gi, 'درهم إماراتي')
      .replace(/\bEGP\b/gi, 'جنيه مصري')
      .replace(/\bKWD\b/gi, 'دينار كويتي')
      .replace(/\bQAR\b/gi, 'ريال قطري')
      .replace(/\bUSD\b|\$/g, 'دولار')
      .replace(/\bEUR\b|€/g, 'يورو')
      .replace(/(\d+)\s*(m|م)\b/gi, '$1 متر')
      .replace(/(\d+)\s*(cm|سم)\b/gi, '$1 سنتيمتر')
      .replace(/(\d+)\s*(km|كم)\b/gi, '$1 كيلومتر')
      .replace(/%/g, ' بالمئة ')
      .replace(/[!؛;]/g, '، ')
      .replace(/[—–]/g, '، ')
      .replace(/([،,.])\s*([،,.])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return clean;
}

/** Sentence-sized pieces (≤ ~170 chars) so no single utterance runs long. */
export function splitForSpeech(text: string, max = 170): string[] {
  const sentences = text.split(/(?<=[.!؟?])\s+/).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  let cur = '';
  for (const s of sentences) {
    if (s.length > max) {
      if (cur) { out.push(cur); cur = ''; }
      // very long sentence: break at commas
      let part = '';
      for (const c of s.split(/(?<=[،,])\s+/)) {
        if ((part + ' ' + c).trim().length > max && part) { out.push(part); part = c; } else part = (part + ' ' + c).trim();
      }
      if (part) out.push(part);
    } else if ((cur + ' ' + s).trim().length > max) { out.push(cur); cur = s; } else cur = (cur + ' ' + s).trim();
  }
  if (cur) out.push(cur);
  return out.length ? out : [text];
}

function scoreVoice(v: SpeechSynthesisVoice, lang: BELang) {
  const name = v.name.toLowerCase();
  const vLang = v.lang.toLowerCase().replace('_', '-');
  const target = BE_BCP47[lang].toLowerCase();
  if (!vLang.startsWith(lang.toLowerCase())) return -10000;
  let s = 100;
  if (vLang === target) s += 40;
  if (/natural|neural|wavenet|enhanced|premium|online/.test(name)) s += 60;
  if (/google/.test(name)) s += 40;
  if (/microsoft/.test(name)) s += 35;
  if (/apple|siri/.test(name)) s += 30;
  if (lang === 'ar') {
    if (/majed|ماجد/.test(name)) s += 90;
    if (/tarik|طارق/.test(name)) s += 85;
    if (/laila|ليلى/.test(name)) s += 80;
    if (/mariam|مريم/.test(name)) s += 75;
    if (/hamed|حامد|salma|سلمى|shakir|شاكر|zariyah|hoda/.test(name)) s += 75;
  }
  if (v.localService) s += 10; // works offline, starts faster
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
    const candidates = all.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(lang.toLowerCase()));
    candidates.sort((a, b) => scoreVoice(b, lang) - scoreVoice(a, lang));
    voicesCache[lang] = candidates[0] ?? null;
  }
}

export function pickArabicVoice() { refreshVoices(); }
export function isSpeaking() { return speakingItem !== null; }
export function setSpeechVolume(v: number) { volume = Math.max(0, Math.min(1, v)); }

// ------------------------------------------------------------------ natural voice

/** Turn on the natural voice; `fetch` returns WAV/MP3 bytes for a text (or null). */
export function enableNaturalVoice(fetch: VoiceFetcher | null) {
  fetcher = fetch;
}

const naturalUsable = () => !!fetcher && Date.now() > disabledUntil && !!audioContext();

function loadNatural(text: string, lang: BELang): Promise<AudioBuffer | null> {
  const key = `${lang}|${text}`;
  const hit = audioCache.get(key);
  if (hit) return Promise.resolve(hit);
  const running = inflight.get(key);
  if (running) return running;
  if (!naturalUsable()) return Promise.resolve(null);
  const p = (async () => {
    try {
      const bytes = await fetcher!(text, lang);
      const ctx = audioContext();
      if (!bytes || !ctx) throw new Error('no audio');
      const buf = await ctx.decodeAudioData(bytes);
      audioCache.set(key, buf);
      if (audioCache.size > 250) audioCache.delete(audioCache.keys().next().value!);
      failures = 0;
      return buf;
    } catch {
      // stop trying for a while if the service keeps failing
      failures += 1;
      if (failures >= 3) { disabledUntil = Date.now() + 60_000; failures = 0; }
      return null;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

/** Fetch phrases ahead of time so they play instantly in the natural voice. */
export function prefetchSpeech(texts: string[], lang: BELang = activeLang) {
  for (const t of texts) {
    for (const piece of splitForSpeech(cleanSpokenText(t, lang))) void loadNatural(piece, lang);
  }
}

// ------------------------------------------------------------------ queue

function priWeight(it: SpeechItem) {
  return it.urgent ? 4 : it.priority === 'critical' ? 3 : it.priority === 'directional' ? 2 : 1;
}

function unifiedRate(lang: BELang) { return lang === 'ar' ? 0.95 : 1.0; }

function stopOutput() {
  generation += 1;
  try { source?.stop(); } catch { /* already stopped */ }
  source = null;
  try { window.speechSynthesis.cancel(); } catch { /* no speech */ }
}

function speakDevice(item: SpeechItem, text: string, lang: BELang, finish: () => void) {
  if (!('speechSynthesis' in window)) { finish(); return; }
  const u = new SpeechSynthesisUtterance(text);
  const voice = voicesCache[lang];
  if (voice) { u.voice = voice; u.lang = voice.lang || BE_BCP47[lang]; } else u.lang = BE_BCP47[lang];
  u.rate = item.rate ?? unifiedRate(lang);
  u.pitch = item.pitch ?? 1.0;
  u.volume = volume;
  u.onend = finish;
  u.onerror = finish;
  try { window.speechSynthesis.speak(u); } catch { finish(); }
}

function playBuffer(buf: AudioBuffer, finish: () => void) {
  const ctx = audioContext();
  if (!ctx) { finish(); return; }
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  g.gain.value = volume;
  src.buffer = buf;
  src.connect(g);
  g.connect(ctx.destination);
  src.onended = finish;
  source = src;
  src.start();
}

function drainQueue() {
  if (speakingItem) return;
  const now = Date.now();
  // guidance goes stale quickly
  queue = queue.filter((q) => !(q.priority === 'descriptive' && now - q.enqueuedAt > 8000) && !(q.priority === 'directional' && now - q.enqueuedAt > 2500));
  if (queue.length === 0) return;
  queue.sort((a, b) => priWeight(b) - priWeight(a) || a.enqueuedAt - b.enqueuedAt);
  const item = queue.shift()!;
  speakingItem = item;
  lastAnySpeechAt = now;
  const lang = item.lang ?? activeLang;
  const text = cleanSpokenText(item.text, lang);
  if (!text) { speakingItem = null; setTimeout(drainQueue, 0); return; }
  lastText = text;
  const gen = ++generation;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    if (gen !== generation) return; // cancelled: whoever cancelled continues the queue
    speakingItem = null;
    source = null;
    item.onEnd?.();
    setTimeout(drainQueue, 30);
  };
  const key = `${lang}|${text}`;
  const cached = audioCache.get(key);
  if (cached && !item.urgent) { playBuffer(cached, finish); return; }
  if (item.urgent || !naturalUsable()) {
    speakDevice(item, text, lang, finish);
    if (!item.urgent) void loadNatural(text, lang); // next time it will be natural
    return;
  }
  // wait a little for the natural voice; long descriptions are worth a longer wait
  const wait = text.length > 60 ? 3500 : 1300;
  let settled = false;
  const fallback = window.setTimeout(() => {
    if (settled || gen !== generation) return;
    settled = true;
    speakDevice(item, text, lang, finish);
  }, wait);
  loadNatural(text, lang).then((buf) => {
    if (settled || gen !== generation) return;
    settled = true;
    window.clearTimeout(fallback);
    if (buf) playBuffer(buf, finish);
    else speakDevice(item, text, lang, finish);
  });
}

export function enqueueSpeech(item: Omit<SpeechItem, 'enqueuedAt'>) {
  if (!('speechSynthesis' in window) && !fetcher) return;
  const lang = item.lang ?? activeLang;
  const pieces = splitForSpeech(item.text);
  const now = Date.now();
  const items: SpeechItem[] = pieces.map((p, i) => ({
    ...item, text: p, enqueuedAt: now + i * 0.001, onEnd: i === pieces.length - 1 ? item.onEnd : undefined,
  }));
  // start fetching every piece now so they play back to back
  if (!item.urgent && pieces.length > 1) for (const p of pieces) void loadNatural(cleanSpokenText(p, lang), lang);

  if (item.urgent || item.priority === 'critical') {
    const cleanNew = cleanSpokenText(items[0].text, lang);
    // the same alert is already being said: don't stutter
    if (speakingItem && cleanSpokenText(speakingItem.text, speakingItem.lang ?? activeLang) === cleanNew && now - speakingItem.enqueuedAt < 1500) return;
    if (speakingItem && (item.urgent ? !speakingItem.urgent : speakingItem.priority !== 'critical')) {
      stopOutput();
      speakingItem = null;
    }
    queue = item.urgent ? queue.filter((q) => q.urgent || q.priority === 'critical') : queue.filter((q) => q.priority === 'critical');
  }
  queue.push(...items);
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

/**
 * True when a recognised phrase is most likely the phone hearing its own voice (the microphone
 * stays open while we speak): most of its words were in what we said in the last few seconds.
 */
export function isEcho(heard: string): boolean {
  if (!lastText) return false;
  if (!speakingItem && Date.now() - lastAnySpeechAt > 6000) return false;
  const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w.length > 1);
  const said = new Set(norm(lastText));
  const words = norm(heard);
  if (!words.length) return false;
  return words.filter((w) => said.has(w)).length / words.length >= 0.6;
}

export function timeSinceLastSpeech() {
  return Date.now() - lastAnySpeechAt;
}

export function cancelAllSpeech() {
  stopOutput();
  queue = [];
  speakingItem = null;
}

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch { /* not supported */ }
  }
}
