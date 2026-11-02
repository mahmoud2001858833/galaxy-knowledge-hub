// Live voice link to OpenAI Realtime over WebRTC (speech in, speech out, interruptible).
// The session's instructions/tools are fixed by the admin-brain-session Edge Function.

export type BrainStatus = 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error' | 'closed';

export type ToolHandler = (name: string, args: Record<string, unknown>) => Promise<unknown>;

type Opts = {
  clientSecret: string;
  onStatus: (s: BrainStatus) => void;
  onCaption: (who: 'user' | 'ai', text: string, final: boolean) => void;
  onUserSaid: (text: string) => void;
  onTool: ToolHandler;
};

export class RealtimeBrain {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private mic: MediaStream | null = null;
  private audioEl: HTMLAudioElement;
  private ctx: AudioContext | null = null;
  private outAnalyser: AnalyserNode | null = null;
  private inAnalyser: AnalyserNode | null = null;
  private aiText = '';
  private status: BrainStatus = 'connecting';

  constructor(private o: Opts) {
    this.audioEl = document.createElement('audio');
    this.audioEl.autoplay = true;
  }

  private set(s: BrainStatus) {
    if (this.status === s) return;
    this.status = s;
    this.o.onStatus(s);
  }

  async connect() {
    this.set('connecting');
    const pc = new RTCPeerConnection();
    this.pc = pc;
    this.ctx = new AudioContext();
    pc.ontrack = (e) => {
      this.audioEl.srcObject = e.streams[0];
      try {
        const src = this.ctx!.createMediaStreamSource(e.streams[0]);
        this.outAnalyser = this.ctx!.createAnalyser();
        this.outAnalyser.fftSize = 256;
        src.connect(this.outAnalyser);
      } catch { /* level meter is optional */ }
    };
    this.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    this.mic.getTracks().forEach((t) => pc.addTrack(t, this.mic!));
    try {
      const src = this.ctx.createMediaStreamSource(this.mic);
      this.inAnalyser = this.ctx.createAnalyser();
      this.inAnalyser.fftSize = 256;
      src.connect(this.inAnalyser);
    } catch { /* optional */ }

    const dc = pc.createDataChannel('oai-events');
    this.dc = dc;
    dc.onmessage = (m) => { try { this.onEvent(JSON.parse(m.data)); } catch { /* ignore */ } };
    dc.onopen = () => {
      this.set('listening');
      // open with a short greeting so the admin hears her right away
      this.send({ type: 'response.create', response: { instructions: 'رحّبي بالمدير بجملة قصيرة جداً واسأليه شو بدّه.' } });
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const r = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      body: offer.sdp,
      headers: { Authorization: `Bearer ${this.o.clientSecret}`, 'Content-Type': 'application/sdp' },
    });
    if (!r.ok) throw new Error(`realtime ${r.status}`);
    await pc.setRemoteDescription({ type: 'answer', sdp: await r.text() });
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') this.set('error');
    };
  }

  /** 0..1 loudness of whoever is talking (for the orb's pulse). */
  level(): number {
    const a = this.status === 'speaking' ? this.outAnalyser : this.inAnalyser;
    if (!a) return 0;
    const buf = new Uint8Array(a.frequencyBinCount);
    a.getByteFrequencyData(buf);
    let s = 0;
    for (let i = 0; i < buf.length; i++) s += buf[i];
    return Math.min(1, s / buf.length / 90);
  }

  send(evt: unknown) {
    if (this.dc?.readyState === 'open') this.dc.send(JSON.stringify(evt));
  }

  /** Tell the model something happened (e.g. the admin confirmed on screen) and let it speak. */
  notify(text: string) {
    this.send({ type: 'conversation.item.create', item: { type: 'message', role: 'user', content: [{ type: 'input_text', text }] } });
    this.send({ type: 'response.create' });
  }

  private async onEvent(e: any) {
    switch (e.type) {
      case 'input_audio_buffer.speech_started':
        this.set('listening');
        break;
      case 'input_audio_buffer.speech_stopped':
        this.set('thinking');
        break;
      case 'conversation.item.input_audio_transcription.delta':
        if (e.delta) this.o.onCaption('user', e.delta, false);
        break;
      case 'conversation.item.input_audio_transcription.completed':
        if (e.transcript) { this.o.onCaption('user', e.transcript, true); this.o.onUserSaid(e.transcript); }
        break;
      case 'output_audio_buffer.started':
        this.set('speaking');
        break;
      case 'output_audio_buffer.stopped':
        this.set('listening');
        break;
      case 'response.output_audio_transcript.delta':
        this.aiText += e.delta ?? '';
        this.o.onCaption('ai', this.aiText, false);
        break;
      case 'response.output_audio_transcript.done':
        this.o.onCaption('ai', e.transcript ?? this.aiText, true);
        this.aiText = '';
        break;
      case 'response.function_call_arguments.done': {
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(e.arguments || '{}'); } catch { /* empty */ }
        let output: unknown;
        try { output = await this.o.onTool(e.name, args); } catch (err) { output = { ok: false, error: String(err) }; }
        this.send({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: e.call_id, output: JSON.stringify(output ?? { ok: true }) } });
        this.send({ type: 'response.create' });
        break;
      }
      case 'error':
        console.warn('realtime error', e.error);
        break;
    }
  }

  close() {
    try { this.dc?.close(); } catch { /* ignore */ }
    try { this.pc?.close(); } catch { /* ignore */ }
    this.mic?.getTracks().forEach((t) => t.stop());
    try { this.ctx?.close(); } catch { /* ignore */ }
    this.audioEl.srcObject = null;
    this.set('closed');
  }
}
