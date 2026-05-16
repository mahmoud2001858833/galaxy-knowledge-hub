// Prioritized speech queue + earcons + spatial audio for Blind Eye
// Web Speech API has no real queue per priority, so we manage it manually.

export type SpeechPriority = 'critical' | 'directional' | 'descriptive';

type SpeechItem = {
  text: string;
  priority: SpeechPriority;
  rate?: number;
  pitch?: number;
  pan?: number; // -1 left, 0 center, +1 right
  enqueuedAt: number;
  onEnd?: () => void;
};

let arabicVoice: SpeechSynthesisVoice | null = null;
let audioCtx: AudioContext | null = null;
let panNode: StereoPannerNode | null = null;
let queue: SpeechItem[] = [];
let speakingItem: SpeechItem | null = null;
let lastSpokenHash: { key: string; t: number } = { key: '', t: 0 };

function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch {}
  }
  if (audioCtx && !panNode && (audioCtx as any).createStereoPanner) {
    try { panNode = audioCtx.createStereoPanner(); panNode.connect(audioCtx.destination); } catch {}
  }
  return audioCtx;
}

export function pickArabicVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  arabicVoice = voices.find(v => /^ar/i.test(v.lang)) || null;
}

export function isSpeaking() {
  return speakingItem !== null;
}

function priWeight(p: SpeechPriority) {
  return p === 'critical' ? 3 : p === 'directional' ? 2 : 1;
}

function drainQueue() {
  if (speakingItem) return;
  // drop stale descriptive (>800ms old)
  const now = Date.now();
  queue = queue.filter(q => !(q.priority === 'descriptive' && now - q.enqueuedAt > 800));
  if (queue.length === 0) return;
  // sort by priority desc, then time
  queue.sort((a, b) => priWeight(b.priority) - priWeight(a.priority) || a.enqueuedAt - b.enqueuedAt);
  const item = queue.shift()!;
  speakingItem = item;

  if (!('speechSynthesis' in window)) { speakingItem = null; return; }
  const u = new SpeechSynthesisUtterance(item.text);
  u.lang = 'ar-SA';
  if (arabicVoice) u.voice = arabicVoice;
  u.rate = item.rate ?? 1.05;
  u.pitch = item.pitch ?? 1;
  u.volume = 1;
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
    // interrupt anything
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
  windowMs = 2500,
  opts: { rate?: number; pitch?: number; onEnd?: () => void } = {},
) {
  const now = Date.now();
  if (hashKey === lastSpokenHash.key && now - lastSpokenHash.t < windowMs && priority !== 'critical') return;
  lastSpokenHash = { key: hashKey, t: now };
  enqueueSpeech({ text, priority, ...opts });
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
    g.gain.exponentialRampToValueAtTime(gainPeak, ctx.currentTime + 0.01);
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
};

export function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) {
    try { (navigator as any).vibrate(pattern); } catch {}
  }
}
