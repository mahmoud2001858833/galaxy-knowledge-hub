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
  private listen() {
    if (!this.alive || this.busy) return;
    this.set('listening');
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return; // typing only
    if (this.recActive) return;
    const rec = new SR();
    rec.lang = 'ar-JO';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    let finalText = '';
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      this.o.onCaption('user', (finalText + interim).trim());
    };
    rec.onerror = () => { /* no-speech / aborted: onend restarts */ };
    rec.onend = () => {
      this.recActive = false;
      this.rec = null;
      const text = finalText.trim();
      if (text) this.heard(text);
      else if (this.alive && !this.busy && this.status === 'listening') window.setTimeout(() => this.listen(), 250);
    };
    try { rec.start(); this.rec = rec; this.recActive = true; } catch { /* already started */ }
  }

  private stopListening() {
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
    this.stopListening();
    this.interrupt();
    this.busy = true;
    this.set('thinking');
    this.history.push({ role: 'user', content: text });
    if (!text.startsWith('[النظام]')) this.o.onTurn?.('user', text);
    this.o.onError(null);
    try {
      for (let round = 0; round < 10 && this.alive; round++) {
        const res = await this.call({ messages: this.history, pages: this.o.pages(), current: location.pathname + location.search });
        if (Array.isArray(res.added)) this.history.push(...res.added);
        if (res.took) console.info('[admin-brain] round', round, res.took);
        if (res.client_calls?.length) {
          const talking = res.say ? this.say(res.say) : Promise.resolve();
          for (const c of res.client_calls) {
            let out: unknown;
            try { out = await this.o.onTool(c.name, c.args ?? {}); } catch (e) { out = { ok: false, error: String(e) }; }
            this.history.push({ role: 'tool', tool_call_id: c.id, content: JSON.stringify(out ?? { ok: true }).slice(0, 8000) });
          }
          await talking;
          if (this.alive) this.set('thinking');
          continue;
        }
        const reply = String(res.reply ?? '').trim();
        if (reply) await this.say(reply);
        break;
      }
    } catch (e) {
      console.warn('admin brain', e);
      const why = e instanceof DOMException && e.name === 'TimeoutError' ? 'السيرفر ما رد خلال دقيقة' : String((e as Error)?.message ?? e);
      this.o.onError(`خطأ: ${why}`);
      await this.say('صار عندي خلل بالاتصال، جرّب كمان مرة.');
    } finally {
      this.busy = false;
      this.listen();
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
    this.stopListening();
    this.set('speaking');
    try {
      const r = await fetch(FN_URL, {
        method: 'POST',
        signal: AbortSignal.timeout(25_000),
        headers: { ...(await this.auth()), 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'speak', text }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(`الصوت: ${j?.error ?? r.status}`);
      }
      const url = URL.createObjectURL(await r.blob());
      if (!this.alive) return;
      await this.play(url);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('admin brain voice', e);
      await this.browserVoice(text);
    }
  }

  private play(url: string) {
    return new Promise<void>((resolve) => {
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
      let loud = 0;
      // barge-in: if the admin starts talking over her, she stops and listens
      const watch = window.setInterval(() => {
        const mic = this.micLevel(), out = this.outLevel();
        loud = mic > 0.32 && mic > out * 0.9 + 0.12 ? loud + 1 : 0;
        if (loud >= 4) this.stopSpeech?.();
      }, 70);
      const done = () => { window.clearInterval(watch); this.stopSpeech = null; this.audio = null; resolve(); };
      this.stopSpeech = () => { a.pause(); done(); };
      a.onended = done;
      a.onerror = done;
      a.play().catch(done);
    });
  }

  private browserVoice(text: string) {
    return new Promise<void>((resolve) => {
      const synth = window.speechSynthesis;
      if (!synth) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA';
      const v = synth.getVoices().find((x) => x.lang.startsWith('ar'));
      if (v) u.voice = v;
      const done = () => { this.stopSpeech = null; resolve(); };
      this.stopSpeech = () => { synth.cancel(); done(); };
      u.onend = done;
      u.onerror = done;
      synth.cancel();
      synth.speak(u);
      // Chrome sometimes never fires onend (e.g. no Arabic voice): don't hang the conversation
      window.setTimeout(() => { if (this.stopSpeech) done(); }, 1500 + text.length * 90);
    });
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
  private micLevel() { return this.read(this.inAnalyser); }
  private outLevel() { return this.read(this.outAnalyser); }

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
