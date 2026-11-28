import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Sparkles, BookOpen, Image as ImageIcon, Map as MapIcon, Share2, FlaskConical, Loader2, Mic, MicOff,
  History, Plus, X, Paperclip, FileText,
} from 'lucide-react';
import { PageShell, PageHeader } from '@/components/layout/PageShell';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useIsPlatformAdmin } from '@/hooks/useIsPlatformAdmin';
import { OmniMindMap } from '@/components/omniMind/OmniMindMap';
import type { MindMapNode } from '@/components/shared/InteractiveMindMap';
import { ConceptGraph, type ConceptNode, type ConceptEdge } from '@/components/omniMind/ConceptGraph';
import { runExperiment, type ExperimentResult } from '@/components/admin-brain/experiments';
import ExperimentPanel from '@/components/admin-brain/ExperimentPanel';
import { SIMULATION_PAGES } from '@/components/admin-brain/simulationPages';
import { VoiceLoop, type VoiceStatus } from '@/lib/voice/VoiceLoop';
import { cleanScientificText } from '@/lib/text/cleanScientificText';

type Source = { bookId: string; bookTitle: string; pageNumber: number | null };

type Attachment =
  | { kind: 'image'; prompt: string; dataUrl: string }
  | { kind: 'mindmap'; rootTitle: string; subjectTitle: string; nodes: MindMapNode[] }
  | { kind: 'concept_map'; title: string; nodes: ConceptNode[]; edges: ConceptEdge[] }
  | { kind: 'experiment'; result: ExperimentResult }
  | { kind: 'experiment_link'; title: string; path: string };

interface Turn {
  id: number;
  who: 'user' | 'assistant';
  text: string;
  attachment?: Attachment;
  sources?: Source[];
  imagePreview?: string;
}

interface SessionRow {
  id: string;
  title: string;
  updated_at: string;
}

const LAST_SESSION_KEY = 'omni_mind_last_session_id';
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL || 'https://esifpjjehdnpkhyilctv.supabase.co'}/functions/v1/omni-mind`;

const VOICE_STATUS_AR: Record<VoiceStatus, string> = {
  connecting: 'لحظة…',
  listening: 'أسمعك… احكي',
  thinking: 'أفكر…',
  speaking: 'أحكي…',
  error: 'انقطع الاتصال',
  closed: '',
};

const SUGGESTIONS = [
  { icon: BookOpen, text: 'اشرح لي الحث الكهرومغناطيسي من كتاب الفيزياء' },
  { icon: ImageIcon, text: 'ارسم رسماً تعليمياً للدورة الدموية' },
  { icon: MapIcon, text: 'اعمل خريطة ذهنية لدرس التفاعلات الكيميائية' },
  { icon: Share2, text: 'وضّح العلاقة بين القوة والكتلة والتسارع بخريطة علاقات' },
  { icon: FlaskConical, text: 'اعرض لي تجربة تأثير دوبلر' },
];

async function auth() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('not signed in');
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  return { Authorization: `Bearer ${token}`, ...(anon ? { apikey: anon } : {}) };
}

async function callOmniMind(body: Record<string, unknown>) {
  const r = await fetch(FN_URL, {
    method: 'POST',
    signal: AbortSignal.timeout(130_000),
    headers: { ...(await auth()), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || `omni-mind ${r.status}`);
  return j;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

type HistoryMessage = { role: string; content: string; attachments?: { sources?: Source[] } | null };
function toTurns(msgs: HistoryMessage[], nextId: () => number): Turn[] {
  return msgs.map((m) => ({
    id: nextId(),
    who: m.role === 'user' ? 'user' : 'assistant',
    text: m.content,
    sources: m.attachments?.sources ?? undefined,
  }));
}

export default function OmniMind() {
  const { isAdmin, loading } = useIsPlatformAdmin();
  if (loading) return <GateShell><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></GateShell>;
  if (!isAdmin) return <GateShell><p className="text-muted-foreground">هذه الصفحة لمدير المنصة فقط حالياً.</p></GateShell>;
  return <OmniMindChat />;
}

function GateShell({ children }: { children: React.ReactNode }) {
  return (
    <PageShell>
      <PageHeader title="العقل الموسوعي" description="مساعد ذكاء اصطناعي موحّد" icon={Sparkles} />
      <div className="grid place-items-center rounded-3xl border border-border bg-card p-10">{children}</div>
    </PageShell>
  );
}

function OmniMindChat() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const turnId = useRef(0);
  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const listEnd = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const [experiment, setExperiment] = useState<ExperimentResult | null>(null);
  const [viewingSource, setViewingSource] = useState<Source | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // history sidebar
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);

  // pending image attachment for the next message
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadSession(id: string) {
    callOmniMind({ action: 'session_messages', session_id: id })
      .then((res: { messages?: HistoryMessage[] }) => {
        const msgs = (res.messages ?? []).filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content));
        setSessionId(id);
        sessionIdRef.current = id;
        localStorage.setItem(LAST_SESSION_KEY, id);
        setTurns(toTurns(msgs, () => ++turnId.current));
        setHistoryOpen(false);
      })
      .catch((e) => setError(String((e as Error)?.message ?? e)));
  }

  function newConversation() {
    setSessionId(null);
    sessionIdRef.current = null;
    localStorage.removeItem(LAST_SESSION_KEY);
    setTurns([]);
    setError(null);
    setHistoryOpen(false);
  }

  function openHistory() {
    setHistoryOpen((o) => !o);
    if (!sessions) {
      callOmniMind({ action: 'sessions' })
        .then((res: { sessions?: SessionRow[] }) => setSessions(res.sessions ?? []))
        .catch(() => setSessions([]));
    }
  }

  // rehydrate the last session's text transcript on load (tool-rendered attachments are not
  // reconstructed on reload yet — a known scope cut for this first version)
  useEffect(() => {
    const last = localStorage.getItem(LAST_SESSION_KEY);
    if (!last) return;
    callOmniMind({ action: 'session_messages', session_id: last })
      .then((res: { messages?: HistoryMessage[] }) => {
        const msgs = (res.messages ?? []).filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content));
        if (!msgs.length) return;
        setSessionId(last);
        setTurns(toTurns(msgs, () => ++turnId.current));
      })
      .catch(() => localStorage.removeItem(LAST_SESSION_KEY));
  }, []);

  // stick to bottom only while the admin hasn't scrolled up to read earlier messages
  useEffect(() => {
    if (stickToBottomRef.current) listEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, busy]);

  const onScroll = () => {
    const el = scrollBoxRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
  };

  const addTurn = (who: Turn['who'], text: string, attachment?: Attachment, extra?: Partial<Turn>) => {
    if (who === 'user') stickToBottomRef.current = true;
    setTurns((t) => [...t, { id: ++turnId.current, who, text, attachment, ...extra }]);
  };

  const pagesForTools = () => SIMULATION_PAGES;

  async function runClientTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'generate_image': {
        try {
          const { data, error: fnErr } = await supabase.functions.invoke('ai-image-generator', {
            body: { prompt: String(args.prompt ?? ''), action: 'generate', subject: args.subject },
          });
          if (fnErr) throw fnErr;
          const dataUrl = data?.imageData;
          if (!dataUrl) return { ok: false, error: 'no image returned' };
          addTurn('assistant', '', { kind: 'image', prompt: String(args.prompt ?? ''), dataUrl });
          return { ok: true, shown_to_admin: true };
        } catch (e) {
          return { ok: false, error: String(e).slice(0, 200) };
        }
      }
      case 'generate_mindmap': {
        const nodes = Array.isArray(args.nodes) ? (args.nodes as MindMapNode[]) : [];
        if (!nodes.length) return { ok: false, error: 'no nodes' };
        addTurn('assistant', '', {
          kind: 'mindmap',
          rootTitle: String(args.rootTitle ?? 'خريطة ذهنية'),
          subjectTitle: String(args.subjectTitle ?? ''),
          nodes,
        });
        return { ok: true, shown_to_admin: true, node_count: nodes.length };
      }
      case 'generate_concept_map': {
        const nodes = Array.isArray(args.nodes) ? (args.nodes as ConceptNode[]) : [];
        const edges = Array.isArray(args.edges) ? (args.edges as ConceptEdge[]) : [];
        if (!nodes.length) return { ok: false, error: 'no nodes' };
        addTurn('assistant', '', { kind: 'concept_map', title: String(args.title ?? 'خريطة علاقات'), nodes, edges });
        return { ok: true, shown_to_admin: true, node_count: nodes.length, edge_count: edges.length };
      }
      case 'show_experiment': {
        if (args.kind === 'inline') {
          const res = runExperiment(String(args.experiment ?? ''), (args.params ?? {}) as Record<string, unknown>);
          if (!res) return { ok: false, error: 'unknown experiment' };
          setExperiment(res);
          addTurn('assistant', '', { kind: 'experiment', result: res });
          return { ok: true, shown_to_admin: true, title: res.title, metrics: res.metrics };
        }
        if (args.kind === 'link') {
          const path = String(args.path ?? '');
          const match = SIMULATION_PAGES.find((p) => p.path === path);
          if (!match) return { ok: false, error: 'path not in the real lab list; call find_experiment first and use its exact path' };
          addTurn('assistant', '', { kind: 'experiment_link', title: match.title, path: match.path });
          return { ok: true, shown_to_admin: true, path: match.path };
        }
        return { ok: false, error: 'kind must be inline or link' };
      }
      default:
        return { ok: false, error: `unknown tool ${name}` };
    }
  }

  // bumped on every new send(); an in-flight turn checks this before touching UI/voice so a newer
  // turn (e.g. the admin interrupted by talking again) silently supersedes a stale one
  const turnGenRef = useRef(0);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('closed');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const voiceRef = useRef<VoiceLoop | null>(null);

  async function runTurn(payload: Record<string, unknown>, gen: number, viaVoice: boolean) {
    for (let round = 0; round < 10; round++) {
      if (gen !== turnGenRef.current) return;
      const res = await callOmniMind({ ...payload, session_id: sessionIdRef.current, pages: pagesForTools(), ...(viaVoice ? { voice: true } : {}) });
      if (gen !== turnGenRef.current) return; // superseded while this was in flight
      if (res.session_id && res.session_id !== sessionIdRef.current) {
        sessionIdRef.current = res.session_id;
        setSessionId(res.session_id);
        localStorage.setItem(LAST_SESSION_KEY, res.session_id);
      }
      if (res.error) throw new Error(res.error);
      const sources: Source[] | undefined = Array.isArray(res.sources) && res.sources.length ? res.sources : undefined;
      if (res.client_calls?.length) {
        const saying = res.say && viaVoice ? voiceRef.current?.say(res.say) : undefined;
        if (res.say) addTurn('assistant', res.say, undefined, { sources });
        const tool_results: { tool_call_id: string; content: string }[] = [];
        for (const c of res.client_calls as { id: string; name: string; args: Record<string, unknown> }[]) {
          const out = await runClientTool(c.name, c.args ?? {});
          tool_results.push({ tool_call_id: c.id, content: JSON.stringify(out ?? { ok: true }).slice(0, 2500) });
        }
        await saying;
        if (gen !== turnGenRef.current) return;
        if (viaVoice) voiceRef.current?.setThinking();
        payload = { tool_results };
        continue;
      }
      if (res.reply) {
        addTurn('assistant', res.reply, undefined, { sources });
        if (viaVoice) await voiceRef.current?.say(res.reply);
        return;
      }
      if (viaVoice) voiceRef.current?.doneThinking();
      return;
    }
  }

  async function send(text: string, viaVoice = false) {
    const t = text.trim();
    const image = pendingImage;
    if (!t && !image) return;
    const gen = ++turnGenRef.current;
    setInput('');
    setPendingImage(null);
    setError(null);
    addTurn('user', t, undefined, { imagePreview: image ?? undefined });
    setBusy(true);
    if (viaVoice) voiceRef.current?.setThinking();
    try {
      await runTurn({ user_message: t, ...(image ? { image_base64: image } : {}) }, gen, viaVoice);
    } catch (e) {
      if (gen === turnGenRef.current) {
        setError(String((e as Error)?.message ?? e));
        if (viaVoice) await voiceRef.current?.say('صار عندي خلل، جرّب كمان مرة.');
      }
    } finally {
      if (gen === turnGenRef.current) setBusy(false);
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('حالياً بس الصور مدعومة، لسا مش الملفات (PDF/Word).'); return; }
    if (file.size > 6 * 1024 * 1024) { setError('الصورة كبيرة (أكثر من 6 ميجا).'); return; }
    try {
      setPendingImage(await fileToDataUrl(file));
    } catch {
      setError('تعذّر قراءة الصورة.');
    }
  }

  function toggleVoice() {
    if (voiceRef.current) {
      voiceRef.current.close();
      voiceRef.current = null;
      setVoiceStatus('closed');
      return;
    }
    setVoiceError(null);
    const loop = new VoiceLoop({
      speakUrl: FN_URL,
      auth,
      onStatus: setVoiceStatus,
      onCaption: (who, text) => { if (who === 'user') setInput(text); },
      onHeard: (text) => void send(text, true),
      onError: setVoiceError,
    });
    voiceRef.current = loop;
    if (!loop.supported) setVoiceError('متصفحك ما بيدعم التعرف على الصوت؛ استعمل Chrome، أو اكتب تحت.');
    void loop.start('أهلين! اسألني عن أي درس.');
  }

  useEffect(() => () => voiceRef.current?.close(), []);

  return (
    <PageShell>
      <PageHeader
        title="العقل الموسوعي"
        description="مساعد تعليمي موحّد: إجابات من الكتب المرفوعة، صور تعليمية، خرائط ذهنية وعلاقات، وتجارب تفاعلية — للمدير فقط الآن."
        icon={Sparkles}
        actions={
          <button
            type="button"
            onClick={openHistory}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50"
          >
            <History className="h-3.5 w-3.5" /> سجلّ المحادثات
          </button>
        }
      />

      <div className="relative flex flex-col rounded-3xl border border-border bg-card shadow-sm" style={{ minHeight: '60vh' }}>
        {historyOpen && (
          <div className="absolute inset-x-0 top-0 z-20 max-h-72 overflow-y-auto rounded-t-3xl border-b border-border bg-card p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-semibold text-muted-foreground">المحادثات السابقة</p>
              <div className="flex items-center gap-2">
                <button onClick={newConversation} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <Plus className="h-3 w-3" /> جديدة
                </button>
                <button onClick={() => setHistoryOpen(false)} className="rounded-full p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
            </div>
            {sessions === null && <Loader2 className="mx-auto my-3 h-4 w-4 animate-spin text-muted-foreground" />}
            {sessions?.length === 0 && <p className="px-1 py-2 text-center text-xs text-muted-foreground">ما في محادثات سابقة بعد.</p>}
            {sessions?.map((s) => (
              <button
                key={s.id}
                onClick={() => loadSession(s.id)}
                className={`block w-full rounded-xl px-3 py-2 text-right text-xs hover:bg-background/70 ${s.id === sessionId ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
              >
                {s.title || 'محادثة بلا عنوان'}
              </button>
            ))}
          </div>
        )}

        <div ref={scrollBoxRef} onScroll={onScroll} className="flex-1 space-y-4 overflow-y-auto p-5">
          {turns.length === 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-6">
              {SUGGESTIONS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => send(text, voiceStatus !== 'closed')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-foreground shadow-sm hover:border-primary/50"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" /> {text}
                </button>
              ))}
            </div>
          )}
          {turns.map((t) => (
            <div key={t.id} className={`flex ${t.who === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className="max-w-[90%] space-y-2">
                {t.imagePreview && (
                  <img src={t.imagePreview} alt="مرفق" className="max-h-56 w-auto rounded-2xl border border-border" />
                )}
                {t.text && (
                  <div
                    className={
                      t.who === 'user'
                        ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-brand-from to-brand-to px-4 py-2 text-sm text-primary-foreground shadow'
                        : 'rounded-2xl rounded-bl-md border border-border bg-background/80 px-4 py-2.5 text-sm leading-relaxed text-foreground shadow-sm'
                    }
                  >
                    {t.who === 'assistant' ? <Markdown text={t.text} /> : t.text}
                  </div>
                )}
                {t.sources && t.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {t.sources.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setViewingSource(s)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-primary"
                      >
                        <FileText className="h-3 w-3" /> {s.bookTitle}{s.pageNumber ? ` — ص${s.pageNumber}` : ''}
                      </button>
                    ))}
                  </div>
                )}
                {t.attachment && <AttachmentView attachment={t.attachment} />}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-end">
              <div className="rounded-2xl border border-border bg-background/80 px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          {error && <p className="text-center text-xs text-destructive">{error}</p>}
          <div ref={listEnd} />
        </div>

        {voiceStatus !== 'closed' && (
          <div className="mx-3 mb-1 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${voiceStatus === 'listening' ? 'bg-primary animate-pulse' : voiceStatus === 'speaking' ? 'bg-brand-to' : 'bg-muted-foreground'}`} />
            {VOICE_STATUS_AR[voiceStatus]}
          </div>
        )}
        {voiceError && <p className="mx-3 mb-1 text-center text-xs text-destructive">{voiceError}</p>}

        {pendingImage && (
          <div className="mx-3 mb-1 flex items-center gap-2 rounded-2xl border border-border bg-background/60 p-1.5">
            <img src={pendingImage} alt="معاينة" className="h-10 w-10 rounded-xl object-cover" />
            <span className="flex-1 text-xs text-muted-foreground">صورة جاهزة للإرسال</span>
            <button onClick={() => setPendingImage(null)} className="rounded-full p-1 text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}

        <form
          className="m-3 flex items-center gap-2 rounded-full border border-border bg-background/80 p-1.5 pr-4 shadow-inner focus-within:border-primary/60"
          onSubmit={(e) => { e.preventDefault(); send(input, voiceStatus !== 'closed'); }}
        >
          <button
            type="button"
            onClick={toggleVoice}
            aria-label={voiceStatus === 'closed' ? 'تشغيل المحادثة الصوتية' : 'إيقاف المحادثة الصوتية'}
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${
              voiceStatus === 'closed' ? 'border-border text-muted-foreground hover:text-foreground' : 'border-primary/50 bg-primary/10 text-primary'
            }`}
          >
            {voiceStatus === 'closed' ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="إرفاق صورة"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-3.5 w-3.5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل عن أي درس، أو اطلب صورة أو خريطة أو تجربة…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            type="submit"
            disabled={busy || (!input.trim() && !pendingImage)}
            aria-label="إرسال"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-from to-brand-to text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {experiment && (
        <div className="mt-4">
          <ExperimentPanel res={experiment} onClose={() => setExperiment(null)} />
        </div>
      )}

      {viewingSource && <SourceModal source={viewingSource} onClose={() => setViewingSource(null)} />}
    </PageShell>
  );
}

function Markdown({ text }: { text: string }) {
  return (
    <div className="prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
          h1: ({ children }) => <h3 className="mb-1.5 mt-1 text-sm font-black text-foreground">{children}</h3>,
          h2: ({ children }) => <h4 className="mb-1.5 mt-1 text-sm font-black text-foreground">{children}</h4>,
          h3: ({ children }) => <h4 className="mb-1 mt-1 text-sm font-bold text-foreground">{children}</h4>,
          ul: ({ children }) => <ul className="mb-2 list-disc space-y-0.5 pr-5">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal space-y-0.5 pr-5">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          table: ({ children }) => (
            <div className="mb-2 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-background/80">{children}</thead>,
          th: ({ children }) => <th className="border-b border-border px-2 py-1.5 text-right font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-border/50 px-2 py-1.5">{children}</td>,
          code: ({ children }) => <code className="rounded bg-background px-1 py-0.5 font-mono text-[11px]" dir="ltr">{children}</code>,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="text-primary underline">{children}</a>,
        }}
      >
        {cleanScientificText(text)}
      </ReactMarkdown>
    </div>
  );
}

function SourceModal({ source, onClose }: { source: Source; onClose: () => void }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    setPdfUrl(null);
    setText(null);
    // real page image first (the book's own PDF, jumped to this page); extracted text only as a
    // fallback when the file isn't a PDF or the signed view URL fails
    supabase.functions.invoke('reference-books', { body: { action: 'view', bookId: source.bookId } })
      .then(({ data, error }) => {
        if (!alive) return;
        if (!error && data?.url && String(data?.mimeType ?? '').includes('pdf')) {
          setPdfUrl(`${data.url}#page=${source.pageNumber ?? 1}&view=FitH`);
          return;
        }
        return supabase.functions.invoke('reference-books', { body: { action: 'page', bookId: source.bookId, page: source.pageNumber } })
          .then(({ data: pageData, error: pageErr }) => {
            if (!alive) return;
            if (pageErr) { setErr(String(pageErr.message || pageErr)); return; }
            setText(pageData?.text || 'لا يوجد نص مستخرج لهذه الصفحة.');
          });
      })
      .catch((e) => { if (alive) setErr(String((e as Error)?.message ?? e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [source.bookId, source.pageNumber]);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn(
          'overflow-y-auto rounded-3xl border border-border bg-card p-5 shadow-2xl',
          pdfUrl ? 'h-[85vh] w-full max-w-3xl' : 'max-h-[80vh] w-full max-w-lg',
        )}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{source.bookTitle}</p>
            <p className="text-sm font-bold text-foreground">{source.pageNumber ? `صفحة ${source.pageNumber}` : 'بدون رقم صفحة'}</p>
          </div>
          <button onClick={onClose} aria-label="إغلاق" className="rounded-full border border-border p-1.5 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        {loading && <Loader2 className="mx-auto my-6 h-5 w-5 animate-spin text-muted-foreground" />}
        {err && <p className="text-xs text-destructive">{err}</p>}
        {pdfUrl && (
          <iframe src={pdfUrl} title={`${source.bookTitle} — صفحة ${source.pageNumber ?? ''}`} className="h-[calc(100%-3rem)] w-full rounded-2xl border border-border" />
        )}
        {text && <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>}
      </div>
    </div>
  );
}

function AttachmentView({ attachment }: { attachment: Attachment }) {
  switch (attachment.kind) {
    case 'image':
      return (
        <div className="overflow-hidden rounded-2xl border border-border bg-background/60 p-2">
          <img src={attachment.dataUrl} alt={attachment.prompt} className="max-h-96 w-auto rounded-xl" />
        </div>
      );
    case 'mindmap':
      return (
        <OmniMindMap
          rootTitle={attachment.rootTitle}
          subjectTitle={attachment.subjectTitle}
          nodes={attachment.nodes}
        />
      );
    case 'concept_map':
      return <ConceptGraph title={attachment.title} nodes={attachment.nodes} edges={attachment.edges} />;
    case 'experiment':
      return null; // shown via the ExperimentPanel modal above instead of inline
    case 'experiment_link':
      return (
        <a
          href={attachment.path}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-4 py-2 text-sm font-semibold text-primary hover:border-primary/50"
        >
          <FlaskConical className="h-4 w-4" /> افتح المختبر: {attachment.title}
        </a>
      );
    default:
      return null;
  }
}
