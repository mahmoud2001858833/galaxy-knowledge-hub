import confetti from 'canvas-confetti';

let cachedVoices: SpeechSynthesisVoice[] = [];
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    if (!synth) return resolve([]);
    const v = synth.getVoices();
    if (v.length) { cachedVoices = v; return resolve(v); }
    synth.onvoiceschanged = () => { cachedVoices = synth.getVoices(); resolve(cachedVoices); };
    setTimeout(() => resolve(synth.getVoices()), 800);
  });
}

export async function speakArabic(text: string) {
  try {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    if (!cachedVoices.length) await loadVoices();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    u.rate = 0.95;
    u.pitch = 1.05;
    const arVoice = cachedVoices.find(v => v.lang?.toLowerCase().startsWith('ar'));
    if (arVoice) u.voice = arVoice;
    synth.speak(u);
  } catch { /* ignore */ }
}

export function greetChild(name?: string) {
  const safe = (name || '').trim();
  speakArabic(safe ? `أهلاً يا ${safe}! هيا نلعب معاً.` : 'أهلاً بك! هيا نلعب معاً.');
}

export function cheerChild(name?: string, accuracy?: number) {
  const safe = (name || '').trim();
  const great = (accuracy ?? 0) >= 0.7;
  const phrases = great
    ? [`أحسنت يا ${safe || 'بطل'}! رائع جداً!`, `${safe || 'يا بطل'}، عمل ممتاز!`, `${safe || 'صديقي'}! أنت نجم!`]
    : [`جربنا يا ${safe || 'صديقي'}! المرة الجاية أحسن!`, `${safe || 'يا بطل'}، لا بأس، نحاول مرة ثانية!`];
  speakArabic(phrases[Math.floor(Math.random() * phrases.length)]);
}

export function celebrate(strong = false) {
  const burst = (origin: { x: number; y: number }) =>
    confetti({
      particleCount: strong ? 120 : 70,
      spread: 75,
      startVelocity: 45,
      origin,
      scalar: 1.1,
      colors: ['#7DD3FC', '#FCA5A5', '#A7F3D0', '#FCD34D', '#C4B5FD', '#F9A8D4'],
    });
  burst({ x: 0.2, y: 0.6 });
  burst({ x: 0.8, y: 0.6 });
  if (strong) setTimeout(() => burst({ x: 0.5, y: 0.4 }), 250);
}

export function vibrateSuccess() {
  try { (navigator as any).vibrate?.([60, 40, 80]); } catch { /* ignore */ }
}

let audioCtx: AudioContext | null = null;
function ctx() {
  if (!audioCtx) {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}
export function playTone(freq: number, durMs = 180, type: OscillatorType = 'sine', gain = 0.18) {
  try {
    const ac = ctx(); if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + durMs / 1000);
  } catch { /* ignore */ }
}
export function sfxSuccess() { playTone(660, 120, 'sine'); setTimeout(() => playTone(880, 160, 'sine'), 110); }
export function sfxClick() { playTone(520, 60, 'triangle', 0.1); }

export function getActiveChildName(): string | undefined {
  try {
    const raw = localStorage.getItem('autism_active_profile');
    if (!raw) return undefined;
    return JSON.parse(raw)?.child_name || undefined;
  } catch { return undefined; }
}
export function getActiveParentEmail(): string | undefined {
  try {
    const raw = localStorage.getItem('autism_active_profile');
    if (!raw) return undefined;
    return JSON.parse(raw)?.parent_email || undefined;
  } catch { return undefined; }
}
