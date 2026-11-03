// The central AI's voice loop without an OpenAI key:
//   ears  = the browser's speech recognition (Chrome/Edge/Safari, Arabic),
//   brain = the admin-brain Edge Function (AI gateway + platform data tools),
//   mouth = admin-brain "speak" (natural TTS), falling back to the browser voice.
import { supabase } from '@/integrations/supabase/client';

export type BrainStatus = 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error' | 'closed';
export type ToolHandler = (name: string, args: Record<string, unknown>) => Promise<unknown>;

type Opts = {
  pages: () => { title: string; path: string }[];
  onStatus: (s: BrainStatus) => void;
  onCaption: (who: 'user' | 'ai', text: string) => void;
  /** return true when the UI consumed the utterance itself (e.g. a yes/no confirmation) */
  onUserSaid: (text: string) => boolean;
  onTool: ToolHandler;
  /** a readable reason when something fails (shown on screen) */
  onError: (msg: string | null) => void;
  /** a finished turn, for the conversation list */
  onTurn?: (who: 'user' | 'ai', text: string) => void;
};

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL || 'https://esifpjjehdnpkhyilctv.supabase.co'}/functions/v1/admin-brain`;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

type Msg = Record<string, unknown>;

export class VoiceBrain {
  private status: BrainStatus = 'closed';
  private alive = false;
  private history: Msg[] = [];
  private rec: any = null;
  private recActive = false;
  private mic: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private inAnalyser: AnalyserNode | null = null;
  private outAnalyser: AnalyserNode | null = null;
  private audio: HTMLAudioElement | null = null;
  private stopSpeech: (() => void) | null = null;
  private busy = false;
  private gen = 0;

  constructor(private o: Opts) {}

  private set(s: BrainStatus) {
    if (this.status === s) return;
    this.status = s;
    this.o.onStatus(s);
  }

  get supported() {
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  async start() {
    this.alive = true;
    this.set('connecting');
    this.ctx = new AudioContext();
    try {
      this.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const src = this.ctx.createMediaStreamSource(this.mic);
      this.inAnalyser = this.ctx.createAnalyser();
      this.inAnalyser.fftSize = 256;
      src.connect(this.inAnalyser);
    } catch {
      /* no mic: the admin can still type */
    }
    await this.say('أهلين! أنا العقل المركزي. شو بدك نعمل؟');
    this.listen();
  }

  // ---------- ears ----------
  // ONE speech recogniser stays on for the whole conversation (Chrome allows only one at a time):
  //  - while she talks, what it hears is compared with her own sentence: her echo from the speakers
  //    is ignored, real words from the admin stop her at once;
  //  - it keeps collecting while the admin pauses to think, and sends only after ~1.6 s of silence.
  private consumed = 0;      // results of the current recognition session already used/ignored
  private collected = '';    // what the admin said that hasn't been sent yet
  private silence = 0;
  private spoken = new Set<string>(); // words of the sentence she is saying now
  private echoUntil = 0;             // her words can still arrive late for a moment after she stops

  private listen() {
    if (!this.alive) return;
    if (!this.busy) this.set('listening');
    this.ensureRecognition();
  }

  private ensureRecognition() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || this.recActive || !this.alive) return;
    const rec = new SR();
    rec.lang = 'ar-JO';
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    this.consumed = 0;
    rec.onresult = (e: any) => {
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
        if (isEcho) { this.consumed = lastFinal; return; } // her own voice: drop it
        this.stopSpeech?.(); // the admin is talking: stop at once and listen
      }
      this.consumed = lastFinal;
      if (fin) this.collected += fin;
      const now = (this.collected + inter).trim();
      this.o.onCaption('user', now);
      if (this.status !== 'speaking' && this.status !== 'thinking') this.set('listening');
      window.clearTimeout(this.silence);
      this.silence = window.setTimeout(() => this.flush(inter), inter ? 2000 : 1600);
    };
    rec.onerror = (ev: any) => { if (ev?.error === 'not-allowed') this.o.onError('المتصفح منع الميكروفون. اسمح له من أيقونة القفل جنب الرابط.'); };
    rec.onend = () => {
      this.recActive = false;
      this.rec = null;
      // Chrome ends sessions on its own after a while: start again right away
      if (this.alive) window.setTimeout(() => this.ensureRecognition(), 150);
    };
    try { rec.start(); this.rec = rec; this.recActive = true; } catch { /* busy: onend retries */ }
  }

  private flush(pendingInterim: string) {
    const text = (this.collected + pendingInterim).trim();
    this.collected = '';
    if (pendingInterim) this.consumed += 1; // that interim result is used now
    if (text) this.heard(text);
  }

  private stopListening() {
    // kept for close(): the recogniser otherwise stays on during the whole conversation
    window.clearTimeout(this.silence);
    try { this.rec?.abort(); } catch { /* ignore */ }
    this.rec = null;
    this.recActive = false;
  }

  private heard(text: string) {
    if (this.o.onUserSaid(text)) { this.listen(); return; }
    void this.ask(text);
  }

  /** Typed input, or a system note from the UI (e.g. "the admin confirmed X"). */
  async ask(text: string) {
    if (!this.alive) return;
    const gen = ++this.gen; // a newer request (e.g. he interrupted) cancels this one
    this.interrupt();
    this.busy = true;
    this.set('thinking');
    this.history.push({ role: 'user', content: text });
    if (!text.startsWith('[النظام]')) this.o.onTurn?.('user', text);
    this.o.onError(null);
    try {
      for (let round = 0; round < 10 && this.alive && gen === this.gen; round++) {
        const res = await this.call({ messages: this.history, pages: this.o.pages(), current: location.pathname + location.search });
        if (gen !== this.gen) return;
        if (Array.isArray(res.added)) this.history.push(...res.added);
        if (res.took) console.info('[admin-brain] round', round, res.took);
        if (res.client_calls?.length) {
          const talking = res.say ? this.say(res.say) : Promise.resolve();
          for (const c of res.client_calls) {
            let out: unknown;
            try { out = await this.o.onTool(c.name, c.args ?? {}); } catch (e) { out = { ok: false, error: String(e) }; }
            this.history.push({ role: 'tool', tool_call_id: c.id, content: JSON.stringify(out ?? { ok: true }).slice(0, 2500) });
          }
          await talking;
          if (this.alive) this.set('thinking');
          continue;
        }
        const reply = String(res.reply ?? '').trim();
        if (reply && gen === this.gen) await this.say(reply);
        break;
      }
    } catch (e) {
      console.warn('admin brain', e);
      const why = e instanceof DOMException && e.name === 'TimeoutError' ? 'السيرفر ما رد خلال دقيقة' : String((e as Error)?.message ?? e);
      this.o.onError(`خطأ: ${why}`);
      await this.say('صار عندي خلل بالاتصال، جرّب كمان مرة.');
    } finally {
      if (gen === this.gen) {
        this.busy = false;
        this.listen();
      }
    }
  }

  private async auth() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('not signed in');
    return { Authorization: `Bearer ${token}`, ...(ANON ? { apikey: ANON } : {}) };
  }

  private async call(body: unknown): Promise<any> {
    const r = await fetch(FN_URL, { method: 'POST', signal: AbortSignal.timeout(100_000), headers: { ...(await this.auth()), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || `brain ${r.status}`);
    return j;
  }

  // ---------- mouth ----------
  private async say(text: string) {
    if (!this.alive || !text) return;
    this.o.onCaption('ai', text);
    this.o.onTurn?.('ai', text);
    this.spoken = new Set(normWords(text));
    this.set('speaking');
    this.ensureRecognition();
    try {
      await this.speakOut(text);
    } finally {
      this.echoUntil = Date.now() + 1200;
    }
  }

  /**
   * Natural voice from the server, sentence by sentence: the first sentence plays after ~1 s while
   * the next ones are being made. If the server voice fails, the browser's female Arabic voice takes over.
   */
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
        if (!finished) return; // interrupted
      }
    } catch (e) {
      console.warn('admin brain voice', e);
      if (!String(e).includes('server voice unavailable')) this.serverVoiceOffUntil = Date.now() + 2 * 60_000;
      if (!started && this.alive && this.status === 'speaking') await this.browserVoice(text);
    }
  }

  private async fetchVoice(part: string) {
    const r = await fetch(FN_URL, {
      method: 'POST',
      signal: AbortSignal.timeout(25_000),
      headers: { ...(await this.auth()), 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'speak', text: part }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      throw new Error(`الصوت: ${j?.error ?? r.status}`);
    }
    return URL.createObjectURL(await r.blob());
  }

  private serverVoiceOffUntil = 0;

  /** Plays one clip; resolves true when it ended by itself, false when she was interrupted. */
  private play(url: string) {
    return new Promise<boolean>((resolve) => {
      const a = new Audio(url);
      this.audio = a;
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
        this.audio = null;
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
    // voices load asynchronously the first time
    if (!synth.getVoices().length) {
      await new Promise<void>((r) => { synth.onvoiceschanged = () => r(); window.setTimeout(r, 800); });
    }
    synth.cancel();
    await new Promise((r) => setTimeout(r, 80)); // Chrome drops speak() issued right after cancel()
    const { voice, isFemale } = pickFemaleArabic(synth.getVoices());
    for (const part of splitSentences(text)) {
      if (!this.alive || this.status !== 'speaking') return;
      const finished = await new Promise<boolean>((resolve) => {
        const u = new SpeechSynthesisUtterance(part);
        u.lang = voice?.lang || 'ar-SA';
        if (voice) u.voice = voice;
        // only a male Arabic voice installed (e.g. macOS "Majed"): raise the pitch so it sounds softer
        u.pitch = isFemale ? 1.05 : 1.6;
        let settled = false;
        const done = (natural: boolean) => { if (settled) return; settled = true; window.clearTimeout(guard); this.stopSpeech = null; resolve(natural); };
        this.stopSpeech = () => { synth.cancel(); done(false); };
        u.onend = () => done(true);
        u.onerror = () => done(true);
        synth.speak(u);
        if (synth.paused) synth.resume();
        // Chrome sometimes never fires onend: don't hang the conversation
        const guard = window.setTimeout(() => done(true), 2000 + part.length * 110);
      });
      if (!finished) return;
    }
  }

  /** Stop talking now (the admin tapped the orb or started a new request). */
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

  /** 0..1 loudness of whoever is talking (for the orb's pulse). */
  level(): number {
    const a = this.status === 'speaking' ? this.outAnalyser : this.status === 'listening' ? this.inAnalyser : null;
    if (!a) return this.status === 'speaking' ? 0.3 + 0.2 * Math.sin(performance.now() / 120) : 0;
    const buf = new Uint8Array(a.frequencyBinCount);
    a.getByteFrequencyData(buf);
    let s = 0;
    for (let i = 0; i < buf.length; i++) s += buf[i];
    return Math.min(1, s / buf.length / 90);
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

// Arabic voices that are women, as named by macOS, Windows, Chrome/Android and Edge
const FEMALE = /(laila|layla|mariam|maryam|amira|hoda|huda|salma|zariyah|sana|hala|noura|fatima|amina|rana|reem|female|woman|google)/i;
const MALE = /(majed|maged|tarik|tariq|naayf|naif|hamed|shakir|omar|male)/i;

function pickFemaleArabic(voices: SpeechSynthesisVoice[]) {
  const ar = voices.filter((v) => v.lang?.toLowerCase().startsWith('ar'));
  const female = ar.find((v) => FEMALE.test(v.name) && !/\bmale\b/i.test(v.name)) ?? ar.find((v) => !MALE.test(v.name));
  return female ? { voice: female, isFemale: true } : { voice: ar[0] ?? null, isFemale: false };
}

/** Short pieces for speaking: by sentence, long sentences cut at commas (≤ ~170 chars each). */
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
