import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Ban, Bot, Clock, Cloud, ExternalLink, FolderGit2, Gauge, Laptop, Loader2, Lock, Maximize2, Minimize2, MonitorSmartphone, RefreshCw, ShieldCheck, Sparkles, SquareTerminal, TerminalSquare } from 'lucide-react';
import { useBridgeStatus } from '@/components/terminal/useBridgeStatus';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { PageHeader, PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { WebTerminal, callTerminal, type AttachJob, type Mode, type QuotaInfo, type SessionEnd, type SessionInfo } from '@/components/terminal/WebTerminal';
import { findOpenAgentJob } from '@/components/terminal/openAgentJob';
import { fmtTokens, usageToday, type AgentKey, type AgentUsageRow } from '@/components/terminal/agentUsage';

type Quota = QuotaInfo & Partial<AgentUsageRow> & { allow_shell?: boolean; email?: string };

const TABS: { id: Mode; label: string; hint: string; icon: React.ElementType; accent: string }[] = [
  { id: 'cloud', label: 'المنصة', hint: 'أوامر المنصة: help وstatus وquota…', icon: Cloud, accent: 'text-primary' },
  { id: 'claude', label: 'Claude', hint: 'اكتب طلبك مباشرة، كل سطر رسالة إلى Claude Code', icon: Bot, accent: 'text-brand-from' },
  { id: 'antigravity', label: 'Antigravity', hint: 'اكتب طلبك مباشرة، كل سطر رسالة إلى وكيل Antigravity', icon: Sparkles, accent: 'text-brand-to' },
  { id: 'shell', label: 'Shell', hint: 'أوامر الطرفية على جهاز الرئيس داخل مجلد المشروع', icon: SquareTerminal, accent: 'text-warning' },
];
const TAB_KEY = 'zarwa-terminal-tab';
const readTab = (): Mode => {
  try {
    const v = window.localStorage.getItem(TAB_KEY);
    return (TABS.some((t) => t.id === v) ? v : 'cloud') as Mode;
  } catch {
    return 'cloud';
  }
};

const PROJECT_KEY = 'zarwa-terminal-project';
const readProject = () => {
  try {
    return window.localStorage.getItem(PROJECT_KEY) || 'main';
  } catch {
    return 'main';
  }
};

/**
 * Projects this user may work on besides ذروة العلم: all ready ones for the principal, the granted
 * ready ones for everyone else (RLS decides). Live, so a new grant shows up without a reload.
 */
interface TerminalProject {
  slug: string;
  name: string;
  /** locked to one agent: everything on it goes through that agent */
  agent_only?: 'antigravity' | 'claude' | null;
  preview_enabled?: boolean;
  preview_url?: string | null;
  preview_status?: string | null;
  preview_updated_at?: string | null;
}

const useTerminalProjects = (enabled: boolean) => {
  const [list, setList] = useState<TerminalProject[]>([]);
  useEffect(() => {
    if (!enabled) return;
    const load = () =>
      supabase
        .from('bridge_projects')
        .select('slug, name, agent_only, preview_enabled, preview_url, preview_status, preview_updated_at')
        .eq('status', 'ready')
        .order('name')
        .then(({ data }) => setList((data ?? []) as unknown as TerminalProject[]));
    load();
    const ch = supabase
      .channel(`terminal-projects-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bridge_projects' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bridge_project_grants' }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [enabled]);
  return list;
};

/**
 * The project's live preview ("Local View"): the bridge runs the project on the principal's computer
 * and shares it through a Cloudflare tunnel; this small window shows it and follows its link.
 */
const ProjectPreview: React.FC<{ project: TerminalProject }> = ({ project }) => {
  const [big, setBig] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const url = project.preview_url ?? null;
  const live = !!url;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2 text-sm">
        <div className="flex min-w-0 items-center gap-2">
          <MonitorSmartphone className="h-4 w-4 text-primary" aria-hidden />
          <span className="font-bold">معاينة حيّة — {project.name}</span>
          <span className={`h-2 w-2 rounded-full ${live ? 'bg-success' : 'bg-warning'}`} aria-hidden />
          <span className="truncate text-xs text-muted-foreground">{project.preview_status ?? (live ? 'يعمل' : 'بانتظار الجسر')}</span>
        </div>
        {live && (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={() => setReloadKey((k) => k + 1)} title="تحديث المعاينة">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setBig((b) => !b)} title={big ? 'صغّر' : 'كبّر'}>
              {big ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" asChild title="افتح في تبويب جديد">
              <a href={url!} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
            </Button>
          </div>
        )}
      </div>
      {live ? (
        <iframe
          key={`${url}-${reloadKey}`}
          src={url!}
          title={`معاينة ${project.name}`}
          className={`w-full bg-white ${big ? 'h-[80vh]' : 'h-[380px]'}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      ) : (
        <div className="p-6 text-center text-sm text-muted-foreground">
          {project.preview_status ?? 'المعاينة تظهر هنا حين يشغّل الجسر المشروع على جهاز الأدمن.'}
          <div className="mt-1 text-xs">تبدأ تلقائياً بعد أن يُنشئ Antigravity ملف package.json بأمر dev.</div>
        </div>
      )}
      <div className="border-t border-border px-4 py-1.5 text-[11px] text-muted-foreground">
        النسخة المحلية من جهاز الأدمن، وتتحدّث مع كل تعديل (اضغط تحديث إن لم تظهر التغييرات). لا تُنشر للناس إلا بعد موافقة الأدمن.
      </div>
    </div>
  );
};

/** Today's messages and tokens for an agent tab (non-principal users). */
const AgentMeter: React.FC<{ quota: Quota; agent: AgentKey }> = ({ quota, agent }) => {
  if (quota.agent_usage_day === undefined) return null;
  const u = usageToday(quota as AgentUsageRow, agent);
  const pct = (a: number, b: number | null) => (b ? Math.min(100, Math.round((a / b) * 100)) : 0);
  const bar = (p: number) => (p >= 100 ? 'bg-destructive' : p > 75 ? 'bg-warning' : 'bg-success');
  const mp = pct(u.messages, u.messagesLimit);
  const tp = pct(u.tokens, u.tokensLimit);
  return (
    <span className="flex items-center gap-3 text-muted-foreground">
      <span className="flex items-center gap-1.5">
        الرسائل {u.messages}/{u.messagesLimit}
        <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
          <span className={`block h-full ${bar(mp)}`} style={{ width: `${mp}%` }} />
        </span>
      </span>
      <span className="flex items-center gap-1.5" dir="rtl">
        التوكن <span dir="ltr">{fmtTokens(u.tokens)}/{fmtTokens(u.tokensLimit)}</span>
        {u.tokensLimit != null && (
          <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
            <span className={`block h-full ${bar(tp)}`} style={{ width: `${tp}%` }} />
          </span>
        )}
      </span>
    </span>
  );
};

type StartState =
  | { kind: 'loading' }
  | { kind: 'signed_out' }
  | { kind: 'denied'; reason: string; detail?: string | null }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; session: SessionInfo };

const DENIED_TEXT: Record<string, string> = {
  no_access: 'ليست لديك صلاحية استخدام الطرفية. اطلبها من رئيس المنصة.',
  banned: 'حسابك محظور من استخدام الطرفية.',
};

const END_TEXT: Record<SessionEnd['kind'], string> = {
  terminated: 'أنهى رئيس المنصة هذه الجلسة.',
  expired: 'انتهى وقت الجلسة.',
  closed: 'أُغلقت الجلسة.',
  denied: 'رُفضت الجلسة.',
};

const WARN_MS = 5 * 60 * 1000;

const useCountdown = (iso: string | null) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!iso) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [iso]);
  if (!iso) return null;
  const leftMs = Math.max(0, new Date(iso).getTime() - now);
  const h = Math.floor(leftMs / 3600000);
  const m = Math.floor((leftMs % 3600000) / 60000);
  const s = Math.floor((leftMs % 60000) / 1000);
  const text = h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  return { text, leftMs };
};

/**
 * The session's end time, live: the principal can extend a session from the admin panel, so the row is
 * watched through realtime (plus a slow refresh in case a realtime message is missed).
 */
const useLiveExpiry = (sessionId: string | null, initial: string | null) => {
  const [expiresAt, setExpiresAt] = useState<string | null>(initial);
  useEffect(() => setExpiresAt(initial), [sessionId, initial]);
  useEffect(() => {
    if (!sessionId) return;
    const load = () =>
      supabase
        .from('user_terminal_sessions')
        .select('expires_at')
        .eq('id', sessionId)
        .maybeSingle()
        .then(({ data }) => data && setExpiresAt(data.expires_at));
    const ch = supabase
      .channel(`terminal-expiry-${sessionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_terminal_sessions', filter: `id=eq.${sessionId}` }, (p) =>
        setExpiresAt((p.new as { expires_at: string | null }).expires_at),
      )
      .subscribe();
    const id = window.setInterval(load, 60000);
    return () => {
      supabase.removeChannel(ch);
      window.clearInterval(id);
    };
  }, [sessionId]);
  return expiresAt;
};

/** The terminal itself (session, tabs, terminals); used by /terminal and by the employees dashboard. */
export const TerminalWorkspace: React.FC = () => {
  const [state, setState] = useState<StartState>({ kind: 'loading' });
  const [ended, setEnded] = useState<SessionEnd | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [tab, setTab] = useState<Mode>(readTab);
  const [opened, setOpened] = useState<Set<Mode>>(() => new Set<Mode>(['cloud', readTab()]));
  const started = useRef(false);
  const projects = useTerminalProjects(state.kind === 'ready');
  const [projectPick, setProjectPick] = useState(readProject);
  // a project that was removed or whose grant was withdrawn falls back to ذروة العلم
  const project = projectPick !== 'main' && projects.some((p) => p.slug === projectPick) ? projectPick : 'main';
  const pickProject = (slug: string) => {
    setProjectPick(slug);
    try {
      window.localStorage.setItem(PROJECT_KEY, slug);
    } catch {
      /* private mode */
    }
  };

  const start = useCallback(async () => {
    setEnded(null);
    setState({ kind: 'loading' });
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setState({ kind: 'signed_out' });
      return;
    }
    try {
      const res = await callTerminal({ action: 'start' });
      const body = await res.json();
      if (body.ok) {
        setState({ kind: 'ready', session: body as SessionInfo });
        if (!body.is_principal) {
          const { data: q } = await supabase.from('usage_quotas').select('*').eq('user_id', data.session.user.id).maybeSingle();
          setQuota(q as Quota | null);
        }
      } else if (body.reason) setState({ kind: 'denied', reason: body.reason, detail: body.detail });
      else setState({ kind: 'error', message: body.error ?? `HTTP ${res.status}` });
    } catch (e) {
      setState({ kind: 'error', message: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    if (started.current) return; // StrictMode runs effects twice in development
    started.current = true;
    start();
  }, [start]);

  // Live quota: the principal's edits show up here without a reload
  const userEmail = state.kind === 'ready' ? state.session.email : null;
  const isPrincipal = state.kind === 'ready' && state.session.is_principal;
  useEffect(() => {
    if (!userEmail || isPrincipal) return;
    const channel = supabase
      .channel(`terminal-quota-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usage_quotas' }, (payload) => {
        if (payload.eventType === 'DELETE') return setQuota(null);
        const row = payload.new as Quota & { email: string };
        if (row.email === userEmail) setQuota(row);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail, isPrincipal]);

  const { status: bridge } = useBridgeStatus(state.kind === 'ready');
  const sessionId = state.kind === 'ready' ? state.session.session_id : null;
  const expiresAt = useLiveExpiry(sessionId, state.kind === 'ready' ? state.session.expires_at : null);
  const countdown = useCountdown(state.kind === 'ready' && !ended ? expiresAt : null);
  const warnShown = useRef<string | null>(null);
  const warning = !!countdown && countdown.leftMs > 0 && countdown.leftMs <= WARN_MS;
  useEffect(() => {
    // one toast per end time: an extension past the warning window re-arms it
    if (warning && expiresAt && warnShown.current !== expiresAt) {
      warnShown.current = expiresAt;
      toast.warning('تبقّى أقل من 5 دقائق على انتهاء جلسة الطرفية. احفظ عملك أو اطلب تمديد الوقت من الأدمن.');
    }
  }, [warning, expiresAt]);

  // An agent job still running from an earlier visit (the member left the page or lost the connection):
  // follow it in its agent's tab instead of letting a second one start.
  const [attachJob, setAttachJob] = useState<AttachJob | null>(null);
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id;
      if (!uid) return;
      const job = await findOpenAgentJob(uid);
      if (!cancelled) setAttachJob(job);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);
  const onAttachDone = useCallback(() => setAttachJob(null), []);
  const onEnded = useCallback((e: SessionEnd) => setEnded(e), []);
  const onQuota = useCallback((q: QuotaInfo | null) => q && setQuota((prev) => ({ ...(prev ?? {}), ...q }) as Quota), []);

  const allowed = (id: Mode) =>
    id === 'cloud' ||
    isPrincipal ||
    (id === 'claude' && !!quota?.allow_claude) ||
    (id === 'antigravity' && !!quota?.allow_antigravity) ||
    (id === 'shell' && !!quota?.allow_shell);
  const tabs = TABS.filter((t) => allowed(t.id));
  const current = tabs.some((t) => t.id === tab) ? tab : 'cloud';
  const pick = (id: Mode) => {
    setTab(id);
    setOpened((s) => (s.has(id) ? s : new Set(s).add(id)));
    try {
      window.localStorage.setItem(TAB_KEY, id);
    } catch {
      /* storage blocked */
    }
  };
  const currentTab = TABS.find((t) => t.id === current)!;
  const projectInfo = projects.find((p) => p.slug === project) ?? null;
  const lockedAgent = projectInfo?.agent_only ?? null;
  // a project locked to one agent opens that agent's terminal
  useEffect(() => {
    if (lockedAgent && current !== lockedAgent && tabs.some((t) => t.id === lockedAgent)) pick(lockedAgent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedAgent, project, tabs.length]);
  // the terminal that follows the running job: its agent's tab when the user has it, else the platform tab
  // decided once per job, after the member's quota (which tabs they have) has loaded
  const attachPick = useRef<{ job: string; tab: Mode } | null>(null);
  if (attachJob && (isPrincipal || quota) && attachPick.current?.job !== attachJob.id) {
    attachPick.current = { job: attachJob.id, tab: tabs.some((t) => t.id === attachJob.kind) ? (attachJob.kind as Mode) : 'cloud' };
  }
  const attachTab: Mode | null = attachJob && attachPick.current?.job === attachJob.id ? attachPick.current.tab : null;
  useEffect(() => {
    if (attachTab && attachTab !== current) pick(attachTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachTab]);

  return (
    <div className="space-y-4" dir="rtl">

      {state.kind === 'loading' && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {state.kind === 'signed_out' && (
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm">
          <Link to="/auth" className="font-bold text-primary hover:underline">
            سجّل الدخول
          </Link>{' '}
          لاستخدام الطرفية.
        </div>
      )}

      {(state.kind === 'denied' || state.kind === 'error') && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-10 text-center">
          {state.kind === 'denied' && state.reason === 'banned' ? (
            <Ban className="h-10 w-10 text-destructive" />
          ) : (
            <Lock className="h-10 w-10 text-muted-foreground" />
          )}
          <p className="font-bold">
            {state.kind === 'denied' ? DENIED_TEXT[state.reason] ?? 'لا يمكن فتح الطرفية.' : `تعذّر الاتصال بالطرفية: ${state.message}`}
          </p>
          {state.kind === 'denied' && state.detail && <p className="text-sm text-muted-foreground">السبب: {state.detail}</p>}
          <Button variant="outline" onClick={start} className="gap-2">
            <RefreshCw className="h-4 w-4" /> إعادة المحاولة
          </Button>
        </div>
      )}

      {state.kind === 'ready' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border px-4 py-3 text-xs">
              <span className={`flex items-center gap-1.5 font-bold ${ended ? 'text-destructive' : 'text-success'}`}>
                <span className={`h-2 w-2 rounded-full ${ended ? 'bg-destructive' : 'animate-pulse bg-success'}`} />
                {ended ? 'الجلسة منتهية' : 'متصل بالسحابة'}
              </span>
              <span className="text-muted-foreground" dir="ltr">
                {state.session.email}
              </span>
              {isPrincipal ? (
                <span className="flex items-center gap-1 font-semibold text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" /> الرئيس · بلا حدود
                </span>
              ) : (
                quota && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Gauge className="h-3.5 w-3.5" /> اليوم {quota.used_today}/{quota.daily_limit}
                    {quota.total_limit != null && ` · الكلي ${quota.used_total}/${quota.total_limit}`}
                  </span>
                )
              )}
              {bridge && (
                <span
                  className={`flex items-center gap-1 font-semibold ${bridge.online ? 'text-success' : 'text-muted-foreground'}`}
                  title={bridge.online ? `${bridge.name ?? ''} ${bridge.host ?? ''}` : 'شغّل npm run bridge على جهاز الرئيس'}
                >
                  <Laptop className="h-3.5 w-3.5" />
                  {bridge.online ? `الجسر متصل${bridge.host ? ` · ${bridge.host}` : ''}` : 'الجسر غير متصل'}
                </span>
              )}
              {isPrincipal && (
                <Link to="/admin?tab=terminal" className="font-semibold text-primary hover:underline">
                  إدارة الصلاحيات والحصص
                </Link>
              )}
              <span className="mr-auto flex gap-1.5" dir="ltr" aria-hidden>
                <span className="h-3 w-3 rounded-full bg-destructive/70" />
                <span className="h-3 w-3 rounded-full bg-warning/70" />
                <span className="h-3 w-3 rounded-full bg-success/70" />
              </span>
            </div>
            {!ended && (
              <div
                role="timer"
                aria-live="polite"
                className={`flex flex-wrap items-center gap-2 border-b border-border px-4 py-2 text-sm ${warning ? 'bg-warning/10 text-warning' : 'bg-muted/20'}`}
              >
                <Clock className="h-4 w-4" aria-hidden />
                <span className="font-semibold">وقت الجلسة المتبقي:</span>
                {isPrincipal || !expiresAt ? (
                  <span className="font-bold text-primary">بلا حدود</span>
                ) : countdown && countdown.leftMs > 0 ? (
                  <span className="font-mono font-bold" dir="ltr">
                    {countdown.text}
                  </span>
                ) : (
                  <span className="font-bold text-destructive">انتهى الوقت</span>
                )}
                {warning && <span className="text-xs">أقل من 5 دقائق — احفظ عملك أو اطلب التمديد من الأدمن.</span>}
              </div>
            )}
            {attachJob && !ended && (
              <div className="flex flex-wrap items-center gap-2 border-b border-border bg-primary/10 px-4 py-2 text-sm" role="status" aria-live="polite">
                <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                <span className="font-bold">🤖 الذكاء الاصطناعي يعمل على مهمتك…</span>
                <span className="text-xs text-muted-foreground">
                  بدأت المهمة في زيارة سابقة وما زالت تعمل. تُعرض مخرجاتها هنا مباشرة، والكتابة مقفلة حتى تنتهي (أو أوقفها بـ Ctrl+C / زر إيقاف).
                </span>
              </div>
            )}
            <div role="tablist" aria-label="نوع الطرفية" className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 px-2 pt-2">
              {tabs.map((t) => {
                const on = t.id === current;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    type="button"
                    aria-selected={on}
                    onClick={() => pick(t.id)}
                    className={`-mb-px flex items-center gap-2 rounded-t-xl border px-4 py-2 text-sm font-bold transition ${
                      on ? 'border-border border-b-card bg-card text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${on ? t.accent : ''}`} />
                    {t.label}
                  </button>
                );
              })}
            </div>
            {projects.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-4 py-2 text-xs">
                <FolderGit2 className="h-4 w-4 text-primary" aria-hidden />
                <span className="font-semibold">المشروع:</span>
                {[{ slug: 'main', name: 'ذروة العلم' }, ...projects].map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => pickProject(p.slug)}
                    aria-pressed={project === p.slug}
                    className={`rounded-full border px-3 py-1 transition ${project === p.slug ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    {p.name}
                  </button>
                ))}
                <span className="text-muted-foreground">
                  {lockedAgent
                    ? `هذا المشروع يعمل بـ ${lockedAgent === 'antigravity' ? 'Antigravity' : 'Claude'} فقط، داخل مجلده.`
                    : 'Claude وAntigravity وShell تعمل داخل مجلد المشروع المختار.'}
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2 text-xs">
              <span className="text-muted-foreground">{currentTab.hint}</span>
              {(current === 'claude' || current === 'antigravity') &&
                (isPrincipal ? (
                  <span className="font-semibold text-primary">بلا حدود</span>
                ) : (
                  quota && <AgentMeter quota={quota} agent={current} />
                ))}
            </div>
            {tabs
              .filter((t) => opened.has(t.id) || t.id === current)
              .map((t) => (
                <div key={t.id} className={t.id === current ? '' : 'hidden'} role="tabpanel" aria-label={t.label}>
                  <WebTerminal
                    key={`${state.session.session_id}-${t.id}`}
                    session={state.session}
                    onEnded={onEnded}
                    onQuota={onQuota}
                    fixedMode={t.id === 'cloud' ? undefined : (t.id as Exclude<Mode, 'cloud'>)}
                    primary={t.id === 'cloud'}
                    active={t.id === current}
                    project={project}
                    attachJob={attachTab === t.id ? attachJob : null}
                    onAttachDone={onAttachDone}
                  />
                </div>
              ))}
          </div>

          {projectInfo?.preview_enabled && <ProjectPreview project={projectInfo} />}

          {ended && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
              <span className="font-semibold text-destructive">
                {END_TEXT[ended.kind]}
                {ended.reason && ended.kind === 'terminated' ? ` (${ended.reason})` : ''}
              </span>
              <Button size="sm" variant="outline" onClick={start} className="gap-2">
                <RefreshCw className="h-4 w-4" /> جلسة جديدة
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            لكل وكيل طرفيته الخاصة في التبويبات أعلاه: افتح تبويب Claude أو Antigravity واكتب طلبك مباشرة دون كتابة اسم الوكيل. في تبويب المنصة اكتب <code dir="ltr">help</code> لعرض الأوامر. لا يمكن تنفيذ commit أو push من هنا: الملفات التي تتغير تُرسل تلقائياً كطلب موافقة للأدمن، وتُرفع فور موافقته (أو اكتب <code dir="ltr">submit</code> لإرسالها بنفسك). الأسهم ↑↓ للسجل، و<code dir="ltr">Ctrl+C</code> لإلغاء السطر، و<code dir="ltr">clear</code> لمسح الشاشة. مخرجات الطرفية بالإنجليزية لأن الطرفيات لا تعرض العربية بشكل صحيح.
          </p>
        </div>
      )}
    </div>
  );
};

const TerminalPage: React.FC = () => (
  <PageShell>
    <SEO title="الطرفية | ذروة العلم" description="طرفية سحابية تعمل داخل المتصفح لإدارة وفحص المنصة" />
    <PageHeader
      title="الطرفية"
      description="طرفية سحابية تعمل بالكامل داخل المتصفح. الأوامر تُنفَّذ على خوادم المنصة بعد التحقق من صلاحيتك وحصتك."
      icon={TerminalSquare}
      crumbs={[{ label: 'الرئيسية', to: '/' }, { label: 'الطرفية' }]}
    />
    <TerminalWorkspace />
  </PageShell>
);

export default TerminalPage;
