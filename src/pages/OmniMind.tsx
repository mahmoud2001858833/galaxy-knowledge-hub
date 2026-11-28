import React, { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, BookOpen, Image as ImageIcon, Map as MapIcon, Share2, FlaskConical, Loader2, Mic, MicOff } from 'lucide-react';
import { PageShell, PageHeader } from '@/components/layout/PageShell';
import { supabase } from '@/integrations/supabase/client';
import { useIsPlatformAdmin } from '@/hooks/useIsPlatformAdmin';
import { InteractiveMindMap, type MindMapNode } from '@/components/shared/InteractiveMindMap';
import { ConceptGraph, type ConceptNode, type ConceptEdge } from '@/components/omniMind/ConceptGraph';
import { runExperiment, type ExperimentResult } from '@/components/admin-brain/experiments';
import ExperimentPanel from '@/components/admin-brain/ExperimentPanel';
import { SIMULATION_PAGES } from '@/components/admin-brain/simulationPages';
import { VoiceLoop, type VoiceStatus } from '@/lib/voice/VoiceLoop';

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
  const listEnd = useRef<HTMLDivElement>(null);
  const [experiment, setExperiment] = useState<ExperimentResult | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // rehydrate the last session's text transcript on load (tool-rendered attachments are not
  // reconstructed on reload yet — a known scope cut for this first version)
  useEffect(() => {
    const last = localStorage.getItem(LAST_SESSION_KEY);
    if (!last) return;
    callOmniMind({ action: 'session_messages', session_id: last })
      .then((res: { messages?: { role: string; content: string }[] }) => {
        const msgs = (res.messages ?? []).filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content));
        if (!msgs.length) return;
        setSessionId(last);
        setTurns(msgs.map((m) => ({ id: ++turnId.current, who: m.role === 'user' ? 'user' : 'assistant', text: m.content })));
      })
      .catch(() => localStorage.removeItem(LAST_SESSION_KEY));
  }, []);

  useEffect(() => { listEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [turns, busy]);

  const addTurn = (who: Turn['who'], text: string, attachment?: Attachment) => {
    setTurns((t) => [...t, { id: ++turnId.current, who, text, attachment }]);
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
      const res = await callOmniMind({ ...payload, session_id: sessionIdRef.current, pages: pagesForTools() });
      if (gen !== turnGenRef.current) return; // superseded while this was in flight
      if (res.session_id && res.session_id !== sessionIdRef.current) {
        sessionIdRef.current = res.session_id;
        setSessionId(res.session_id);
        localStorage.setItem(LAST_SESSION_KEY, res.session_id);
      }
      if (res.error) throw new Error(res.error);
      if (res.client_calls?.length) {
        const saying = res.say && viaVoice ? voiceRef.current?.say(res.say) : undefined;
        if (res.say) addTurn('assistant', res.say);
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
        addTurn('assistant', res.reply);
        if (viaVoice) await voiceRef.current?.say(res.reply);
        return;
      }
      if (viaVoice) voiceRef.current?.doneThinking();
      return;
    }
  }

  async function send(text: string, viaVoice = false) {
    const t = text.trim();
    if (!t) return;
    const gen = ++turnGenRef.current;
    setInput('');
    setError(null);
    addTurn('user', t);
    setBusy(true);
    if (viaVoice) voiceRef.current?.setThinking();
    try {
      await runTurn({ user_message: t }, gen, viaVoice);
    } catch (e) {
      if (gen === turnGenRef.current) {
        setError(String((e as Error)?.message ?? e));
        if (viaVoice) await voiceRef.current?.say('صار عندي خلل، جرّب كمان مرة.');
      }
    } finally {
      if (gen === turnGenRef.current) setBusy(false);
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
      />

      <div className="flex flex-col rounded-3xl border border-border bg-card shadow-sm" style={{ minHeight: '60vh' }}>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
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
                {t.text && (
                  <div
                    className={
                      t.who === 'user'
                        ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-brand-from to-brand-to px-4 py-2 text-sm text-primary-foreground shadow'
                        : 'rounded-2xl rounded-bl-md border border-border bg-background/80 px-4 py-2 text-sm leading-relaxed text-foreground shadow-sm'
                    }
                  >
                    {t.text}
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
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل عن أي درس، أو اطلب صورة أو خريطة أو تجربة…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
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
    </PageShell>
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
        <InteractiveMindMap
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
