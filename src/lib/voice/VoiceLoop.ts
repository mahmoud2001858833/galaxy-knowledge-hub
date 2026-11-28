// Shared "ears + mouth" for voice-to-voice features: the browser's own speech recognition (Chrome/
// Edge/Safari, Arabic) listens continuously, a server "speak" action answers with natural TTS
// (falling back to the browser voice), and one recognition session stays on for the whole
// conversation so the admin can interrupt her mid-sentence just by talking.
//
// This is backend-agnostic on purpose: it only knows "heard text -> tell the caller" and "given
// text -> speak it". The caller owns the actual turn (what the brain does with heard text, and
// when the reply is ready to speak) — see src/components/admin-brain/voiceBrain.ts for the
// admin-brain-specific version this was distilled from; that file is left untouched to avoid any
// risk to the already-proven orb, while new voice features (e.g. OmniMind) build on this shared base.

export type VoiceStatus = 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error' | 'closed';

// The Web Speech API (SpeechRecognition) isn't in TS's DOM lib types; loosely typed like the
// admin-brain original this was distilled from, rather than fighting non-standard globals.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionLike = any;

export interface VoiceLoopOptions {
  /** The edge function URL that implements `{ action: 'speak', text }` -> audio/wav. */
  speakUrl: string;
  auth: () => Promise<Record<string, string>>;
  onStatus: (s: VoiceStatus) => void;
  onCaption: (who: 'user' | 'ai', text: string) => void;
  /** The admin finished saying (or typing) something; the caller runs its own turn and eventually calls `say()`. */
  onHeard: (text: string) => void;
  onError: (msg: string | null) => void;
}

export class VoiceLoop {
  private status: VoiceStatus = 'closed';
  private alive = false;
  private rec: SpeechRecognitionLike | null = null;
  private recActive = false;
  private mic: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private inAnalyser: AnalyserNode | null = null;
  private outAnalyser: AnalyserNode | null = null;
  private stopSpeech: (() => void) | null = null;

  constructor(private o: VoiceLoopOptions) {}

  private set(s: VoiceStatus) {
    if (this.status === s) return;
    this.status = s;
    this.o.onStatus(s);
  }

  get supported() {
    return Boolean((window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);
  }

  async start(greeting?: string) {
    this.alive = true;
    this.set('connecting');
    this.ctx = new AudioContext();
    try {
      this.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const src = this.ctx.createMediaStreamSource(this.mic);
      this.inAnalyser = this.ctx.createAnalyser();
      this.inAnalyser.fftSize = 256;
      src.connect(this.inAnalyser);
    } catch { /* no mic: the admin can still type */ }
    if (greeting) await this.say(greeting);
    this.listen();
  }

  // ---------- ears ----------
  // ONE speech recogniser stays on for the whole conversation (Chrome allows only one at a time):
  //  - while she talks, what it hears is compared with her own sentence: her echo from the speakers
  //    is ignored, real words from the admin stop her at once;
  //  - it keeps collecting while the admin pauses to think, and sends only after ~1.6s of silence.
  private consumed = 0;
  private collected = '';
  private silence = 0;
  private spoken = new Set<string>();
  private echoUntil = 0;

  listen() {
    if (!this.alive) return;
    this.set('listening');
    this.ensureRecognition();
  }

  private ensureRecognition() {
    const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!SR || this.recActive || !this.alive) return;
    const rec: SpeechRecognitionLike = new SR();
    rec.lang = 'ar-JO';
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    this.consumed = 0;
    rec.onresult = (e: SpeechRecognitionLike) => {
      let fin = '', inter = '', lastFinal = this.consumed;
      for (let i = this.consumed; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) { fin += t + ' '; lastFinal = i + 1; } else inter += t;
      }
      const text = (fin + inter).trim();
      if (!text) return;
      if (this.status === 'speaking' || Date.now() < this.echoUntil) {
        const words = normWords(text);
        const foreign = words.filter((w) => !this.spoken.has(w));
        const isEcho = foreign.length < 2 || foreign.length / Math.max(1, words.length) < 0.5;
        if (isEcho) { this.consumed = lastFinal; return; }
        this.stopSpeech?.();
      }
      this.consumed = lastFinal;
      if (fin) this.collected += fin;
      const now = (this.collected + inter).trim();
      this.o.onCaption('user', now);
      if (this.status !== 'speaking' && this.status !== 'thinking') this.set('listening');
      window.clearTimeout(this.silence);
      this.silence = window.setTimeout(() => this.flush(inter), inter ? 2000 : 1600);
    };
    rec.onerror = (ev: SpeechRecognitionLike) => {
      if (ev?.error === 'not-allowed') this.o.onError('المتصفح منع الميكروفون. اسمح له من أيقونة القفل جنب الرابط.');
    };
    rec.onend = () => {
      this.recActive = false;
      this.rec = null;
      if (this.alive) window.setTimeout(() => this.ensureRecognition(), 150);
    };
    try { rec.start(); this.rec = rec; this.recActive = true; } catch { /* busy: onend retries */ }
  }

  private flush(pendingInterim: string) {
    const text = (this.collected + pendingInterim).trim();
    this.collected = '';
    if (pendingInterim) this.consumed += 1;
    if (text) this.o.onHeard(text);
  }

  private stopListening() {
    window.clearTimeout(this.silence);
    try { this.rec?.abort(); } catch { /* ignore */ }
    this.rec = null;
    this.recActive = false;
  }

  /** Call once the caller's turn is fully done, to go back to "listening" (no-op if already closed). */
  doneThinking() {
    if (this.alive && this.status !== 'speaking') this.listen();
  }

  setThinking() {
    if (this.alive) this.set('thinking');
  }

  // ---------- mouth ----------
  async say(text: string) {
    if (!this.alive || !text) return;
    this.o.onCaption('ai', text);
    this.spoken = new Set(normWords(text));
    this.set('speaking');
    this.ensureRecognition();
    try {
      await this.speakOut(text);
    } finally {
      this.echoUntil = Date.now() + 1200;
      if (this.alive) this.listen();
    }
  }

  private async speakOut(text: string) {
    const parts = splitSentences(text);
    let started = false;
    try {
      if (Date.now() < this.serverVoiceOffUntil) throw new Error('server voice unavailable');
      const fetches: Promise<string>[] = [];
      const get = (i: number) => (fetches[i] ??= this.fetchVoice(parts[i]));
      get(0);
      for (let i = 0; i < parts.length; i++) {
        if (!this.alive || this.status !== 'speaking') return;
        const url = await get(i);
        if (i + 1 < parts.length) void get(i + 1).catch(() => '');
        started = true;
        const finished = await this.play(url);
        URL.revokeObjectURL(url);
        if (!finished) return;
      }
    } catch (e) {
      console.warn('voice loop tts', e);
      if (!String(e).includes('server voice unavailable')) this.serverVoiceOffUntil = Date.now() + 2 * 60_000;
      if (!started && this.alive && this.status === 'speaking') await this.browserVoice(text);
    }
  }

  private async fetchVoice(part: string) {
    const r = await fetch(this.o.speakUrl, {
      method: 'POST',
      signal: AbortSignal.timeout(25_000),
      headers: { ...(await this.o.auth()), 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'speak', text: part }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error(`الصوت: ${j?.error ?? r.status}`);
    }
    return URL.createObjectURL(await r.blob());
  }

  private serverVoiceOffUntil = 0;

  private play(url: string) {
    return new Promise<boolean>((resolve) => {
      const a = new Audio(url);
      try {
        if (this.ctx) {
          const src = this.ctx.createMediaElementSource(a);
          this.outAnalyser = this.ctx.createAnalyser();
          this.outAnalyser.fftSize = 256;
          src.connect(this.outAnalyser);
          this.outAnalyser.connect(this.ctx.destination);
          void this.ctx.resume();
        }
      } catch { /* level meter optional */ }
      let settled = false;
      const done = (natural: boolean) => {
        if (settled) return;
        settled = true;
        this.stopSpeech = null;
        resolve(natural);
      };
      this.stopSpeech = () => { a.pause(); done(false); };
      a.onended = () => done(true);
      a.onerror = () => done(true);
      a.play().catch(() => done(true));
    });
  }

  private async browserVoice(text: string) {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (!synth.getVoices().length) {
      await new Promise<void>((r) => { synth.onvoiceschanged = () => r(); window.setTimeout(r, 800); });
    }
    synth.cancel();
    await new Promise((r) => setTimeout(r, 80));
    const { voice, isFemale } = pickFemaleArabic(synth.getVoices());
    for (const part of splitSentences(text)) {
      if (!this.alive || this.status !== 'speaking') return;
      const finished = await new Promise<boolean>((resolve) => {
        const u = new SpeechSynthesisUtterance(part);
        u.lang = voice?.lang || 'ar-SA';
        if (voice) u.voice = voice;
        u.pitch = isFemale ? 1.05 : 1.6;
        let settled = false;
        const done = (natural: boolean) => { if (settled) return; settled = true; window.clearTimeout(guard); this.stopSpeech = null; resolve(natural); };
        this.stopSpeech = () => { synth.cancel(); done(false); };
        u.onend = () => done(true);
        u.onerror = () => done(true);
        synth.speak(u);
        if (synth.paused) synth.resume();
        const guard = window.setTimeout(() => done(true), 2000 + part.length * 110);
      });
      if (!finished) return;
    }
  }

  interrupt() {
    this.stopSpeech?.();
  }

  private read(a: AnalyserNode | null) {
    if (!a) return 0;
    const buf = new Uint8Array(a.frequencyBinCount);
    a.getByteFrequencyData(buf);
    let s = 0;
    for (let i = 0; i < buf.length; i++) s += buf[i];
    return Math.min(1, s / buf.length / 90);
  }

  level(): number {
    const a = this.status === 'speaking' ? this.outAnalyser : this.status === 'listening' ? this.inAnalyser : null;
    if (!a) return this.status === 'speaking' ? 0.3 + 0.2 * Math.sin(performance.now() / 120) : 0;
    return this.read(a);
  }

  close() {
    this.alive = false;
    this.interrupt();
    this.stopListening();
    this.mic?.getTracks().forEach((t) => t.stop());
    try { void this.ctx?.close(); } catch { /* ignore */ }
    this.set('closed');
  }
}

const normWords = (t: string) =>
  t.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ًٌٍَُِّْـ،.؟?!,]/g, ' ')
    .split(/\s+/).filter((w) => w.length > 1);

const FEMALE = /(laila|layla|mariam|maryam|amira|hoda|huda|salma|zariyah|sana|hala|noura|fatima|amina|rana|reem|female|woman|google)/i;
const MALE = /(majed|maged|tarik|tariq|naayf|naif|hamed|shakir|omar|male)/i;

function pickFemaleArabic(voices: SpeechSynthesisVoice[]) {
  const ar = voices.filter((v) => v.lang?.toLowerCase().startsWith('ar'));
  const female = ar.find((v) => FEMALE.test(v.name) && !/\bmale\b/i.test(v.name)) ?? ar.find((v) => !MALE.test(v.name));
  return female ? { voice: female, isFemale: true } : { voice: ar[0] ?? null, isFemale: false };
}

function splitSentences(text: string): string[] {
  const out: string[] = [];
  for (const sentence of text.replace(/\s+/g, ' ').split(/(?<=[.!؟?\n])\s+/)) {
    let rest = sentence.trim();
    while (rest.length > 170) {
      const cut = Math.max(rest.lastIndexOf('،', 170), rest.lastIndexOf(',', 170), rest.lastIndexOf(' ', 170));
      const at = cut > 40 ? cut + 1 : 170;
      out.push(rest.slice(0, at).trim());
      rest = rest.slice(at).trim();
    }
    if (rest) out.push(rest);
  }
  return out.length ? out : [text];
}
