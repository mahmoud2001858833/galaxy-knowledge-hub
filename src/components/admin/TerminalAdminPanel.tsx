import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Ban, Check, Copy, KeyRound, Laptop, Loader2, Plus, Power, RotateCcw, ScrollText, ShieldCheck, Square, TerminalSquare, Trash2, Users } from 'lucide-react';
import { useBridgeStatus } from '@/components/terminal/useBridgeStatus';
import { callTerminal } from '@/components/terminal/WebTerminal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useTeamRoles } from '@/components/team/teamApi';

/**
 * Terminal access & quotas (principal only — enforced by RLS and terminal_kill()).
 * Everything is live: sessions, usage and command logs update through realtime.
 */

type Quota = Tables<'usage_quotas'>;
type Session = Tables<'user_terminal_sessions'>;
type Log = Tables<'terminal_command_logs'>;

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('ar-JO', { timeZone: 'Asia/Amman', dateStyle: 'short', timeStyle: 'medium' }) : '—';
const minutesSince = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
const errText = (e: unknown) => (e as { message?: string })?.message ?? String(e);

const NumberCell: React.FC<{ value: number | null; onSave: (v: number | null) => void; nullable?: boolean; label: string }> = ({
  value,
  onSave,
  nullable,
  label,
}) => {
  const [v, setV] = useState(value == null ? '' : String(value));
  useEffect(() => setV(value == null ? '' : String(value)), [value]);
  const commit = () => {
    const next = v.trim() === '' ? (nullable ? null : value) : Math.max(0, parseInt(v, 10) || 0);
    if (next !== value) onSave(next);
  };
  return (
    <Input
      aria-label={label}
      value={v}
      onChange={(e) => setV(e.target.value.replace(/[^\d]/g, ''))}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      placeholder={nullable ? '∞' : ''}
      className="h-8 w-20 text-center"
      dir="ltr"
    />
  );
};

const useLive = () => {
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  const loadQuotas = useCallback(async () => {
    const { data } = await supabase.from('usage_quotas').select('*').order('email');
    setQuotas(data ?? []);
  }, []);
  const loadSessions = useCallback(async () => {
    const { data } = await supabase.from('user_terminal_sessions').select('*').order('started_at', { ascending: false }).limit(50);
    setSessions(data ?? []);
  }, []);
  const loadLogs = useCallback(async () => {
    const { data } = await supabase.from('terminal_command_logs').select('*').order('id', { ascending: false }).limit(150);
    setLogs(data ?? []);
  }, []);

  useEffect(() => {
    loadQuotas();
    loadSessions();
    loadLogs();
    const channel = supabase
      .channel(`terminal-admin-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usage_quotas' }, loadQuotas)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_terminal_sessions' }, loadSessions)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'terminal_command_logs' }, loadLogs)
      .subscribe();
    // session timers and "running" logs move without row changes
    const tick = window.setInterval(loadSessions, 30000);
    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(tick);
    };
  }, [loadQuotas, loadSessions, loadLogs]);

  return { quotas, sessions, logs, loadQuotas, loadSessions };
};


const CopyLine: React.FC<{ text: string }> = ({ text }) => {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-muted p-2" dir="ltr">
      <code className="flex-1 whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">{text}</code>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })}
        className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground"
        aria-label="نسخ"
      >
        {done ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

type BridgeJob = Tables<'bridge_jobs'>;

/** The principal's computer: online state, pairing, and jobs running on it right now. */
const BridgeCard: React.FC = () => {
  const { status, reload } = useBridgeStatus(true, 5000);
  const [code, setCode] = useState<string | null>(null);
  const [pairing, setPairing] = useState(false);
  const [running, setRunning] = useState<BridgeJob[]>([]);

  const loadRunning = useCallback(async () => {
    const { data } = await supabase.from('bridge_jobs').select('*').in('status', ['queued', 'running']).order('created_at');
    setRunning(data ?? []);
  }, []);
  useEffect(() => {
    loadRunning();
    const ch = supabase
      .channel(`bridge-admin-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bridge_jobs' }, loadRunning)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [loadRunning]);

  const pair = async () => {
    if (status?.paired !== false && !window.confirm('ربط جهاز جديد يلغي ربط الجهاز الحالي. متابعة؟')) return;
    setPairing(true);
    try {
      const res = await callTerminal({ action: 'pair', name: 'Mac' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      setCode(body.code);
      reload();
    } catch (e) {
      toast.error(errText(e));
    } finally {
      setPairing(false);
    }
  };

  const unpair = async () => {
    if (!window.confirm('إلغاء ربط الجهاز؟ يتوقف الجسر عن استقبال الأوامر فوراً.')) return;
    const { error } = await supabase.from('bridge_devices').update({ revoked: true }).eq('revoked', false);
    if (error) toast.error(errText(error));
    else {
      toast.success('أُلغي الربط');
      reload();
    }
  };

  const online = !!status?.online;
  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="flex items-center gap-2 font-bold">
          <Laptop className="h-4 w-4" /> الجسر إلى جهازك
        </h3>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${online ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
          <span className={`h-2 w-2 rounded-full ${online ? 'animate-pulse bg-success' : 'bg-muted-foreground'}`} />
          {online ? 'Bridge Online' : 'Bridge Offline'}
        </span>
        {status?.host && (
          <span className="text-xs text-muted-foreground" dir="ltr">
            {status.host}
            {status.workdir ? ` · ${status.workdir}` : ''}
          </span>
        )}
        {status?.last_seen_at && !online && <span className="text-xs text-muted-foreground">آخر ظهور: {fmt(status.last_seen_at)}</span>}
        <div className="mr-auto flex gap-2">
          <Button size="sm" onClick={pair} disabled={pairing} className="gap-1">
            {pairing ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} ربط جهازي
          </Button>
          {status?.paired !== false && status && (
            <Button size="sm" variant="outline" onClick={unpair}>
              إلغاء الربط
            </Button>
          )}
        </div>
      </div>

      {code && (
        <div className="space-y-2 rounded-2xl border border-warning/40 bg-warning/5 p-4 text-sm">
          <p className="text-xs font-semibold text-warning">رمز الربط يظهر مرة واحدة ويحتوي مفاتيح الجهاز. لا تشاركه.</p>
          <div className="font-bold">1. في مجلد المشروع على جهازك:</div>
          <CopyLine text={`npm run bridge -- pair ${code}`} />
          <div className="font-bold">2. شغّل الجسر (اترك النافذة مفتوحة):</div>
          <CopyLine text="npm run bridge" />
          <div className="text-xs text-muted-foreground">
            ليعمل دائماً في الخلفية: <code dir="ltr">npm run bridge -- install-service</code>
          </div>
        </div>
      )}
      {!code && !online && (
        <div className="space-y-2 text-sm">
          <div className="text-muted-foreground">لتشغيل الجسر على جهازك (بعد الربط مرة واحدة):</div>
          <CopyLine text="npm run bridge" />
        </div>
      )}

      {running.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-muted-foreground">يعمل الآن على جهازك</div>
          {running.map((j) => (
            <div key={j.id} className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2 text-xs">
              <span className={`font-bold ${j.kind === 'claude' ? 'text-primary' : 'text-warning'}`}>{j.kind}</span>
              <span className="flex-1 truncate font-mono" dir="ltr">
                {j.input}
              </span>
              <span className="text-muted-foreground">{j.status}</span>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 gap-1"
                onClick={async () => {
                  const { error } = await supabase.rpc('bridge_cancel_job', { p_job_id: j.id });
                  if (error) toast.error(errText(error));
                }}
              >
                <Square className="h-3 w-3" /> إيقاف
              </Button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        الأوامر تمرّ أولاً بفحص الصلاحية والحصة في السحابة، ثم تُوقَّع ويُنفّذها الجسر. أنت دائماً مسموح لك. للآخرين فعّل Claude أو Shell من جدول
        المستخدمين أدناه. Claude يعمل لهم للقراءة فقط، وShell لهم مقفل على جهازك إلا إذا غيّرت <code dir="ltr">shell.allowOthers</code> في{' '}
        <code dir="ltr">~/.zarwa-bridge/config.json</code>.
      </p>
    </section>
  );
};

export const TerminalAdminPanel: React.FC = () => {
  const { loading, roles } = useTeamRoles();
  const { quotas, sessions, logs, loadQuotas, loadSessions } = useLive();
  const [email, setEmail] = useState('');
  const [daily, setDaily] = useState('100');
  const [adding, setAdding] = useState(false);
  const [logFilter, setLogFilter] = useState('all');

  const emailOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of sessions) m.set(s.user_id, s.email);
    for (const q of quotas) m.set(q.user_id, q.email);
    return m;
  }, [sessions, quotas]);

  const active = sessions.filter((s) => s.status === 'active');
  const shownLogs = logFilter === 'all' ? logs : logs.filter((l) => l.user_id === logFilter);

  if (loading) return <Loader2 className="mx-auto my-16 h-6 w-6 animate-spin text-muted-foreground" />;
  if (!roles.includes('principal')) {
    return <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">إدارة الطرفية متاحة لرئيس المنصة فقط.</div>;
  }

  const update = async (q: Quota, patch: Partial<Quota>, ok?: string) => {
    const { error } = await supabase.from('usage_quotas').update(patch).eq('id', q.id);
    if (error) toast.error(errText(error));
    else {
      if (ok) toast.success(ok);
      loadQuotas();
    }
  };

  const grant = async () => {
    const value = email.trim().toLowerCase();
    if (!value.includes('@')) return toast.error('اكتب إيميلاً صحيحاً');
    setAdding(true);
    const { error } = await supabase.from('usage_quotas').insert({ email: value, daily_limit: Math.max(0, parseInt(daily, 10) || 0) } as never);
    setAdding(false);
    if (error) toast.error(error.code === '23505' ? 'لهذا الإيميل صلاحية مسبقاً' : errText(error));
    else {
      setEmail('');
      toast.success('مُنحت الصلاحية');
      loadQuotas();
    }
  };

  const kill = async (opts: { sessionId?: string; userId?: string; ban?: boolean }) => {
    const reason = opts.ban ? window.prompt('سبب الحظر (اختياري):') ?? undefined : undefined;
    if (opts.ban && reason === undefined) return;
    const { data, error } = await supabase.rpc('terminal_kill', {
      p_session_id: opts.sessionId ?? null,
      p_user_id: opts.userId ?? null,
      p_ban: !!opts.ban,
      p_reason: reason || null,
    } as never);
    if (error) toast.error(errText(error));
    else {
      toast.success(opts.ban ? 'أُنهيت الجلسات وحُظر المستخدم' : `أُنهيت ${data ?? 0} جلسة`);
      loadSessions();
      loadQuotas();
    }
  };

  const remove = async (q: Quota) => {
    if (!window.confirm(`سحب صلاحية ${q.email} نهائياً؟ ستُنهى جلساته فوراً.`)) return;
    const { error } = await supabase.from('usage_quotas').delete().eq('id', q.id);
    if (error) toast.error(errText(error));
    else loadQuotas();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-white">
          <TerminalSquare className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="font-bold">الطرفية: الصلاحيات والحصص</div>
          <div className="text-xs text-muted-foreground">كل التغييرات تنعكس فوراً على شاشة المستخدم، والقيود مفروضة في قاعدة البيانات.</div>
        </div>
        <div className="flex gap-4 text-center text-xs">
          <div>
            <div className="text-xl font-black text-success">{active.length}</div>جلسة نشطة
          </div>
          <div>
            <div className="text-xl font-black">{quotas.filter((q) => q.enabled && !q.banned).length}</div>مستخدم مفعّل
          </div>
          <div>
            <div className="text-xl font-black text-destructive">{quotas.filter((q) => q.banned).length}</div>محظور
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/terminal">فتح الطرفية</Link>
        </Button>
      </div>

      <BridgeCard />

      {/* active sessions + kill switch */}
      <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 font-bold">
          <Activity className="h-4 w-4 text-success" /> الجلسات النشطة الآن
        </h3>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد جلسات نشطة.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="text-right">
                  <th className="p-2">المستخدم</th>
                  <th className="p-2">بدأت</th>
                  <th className="p-2">المدة</th>
                  <th className="p-2">الأوامر</th>
                  <th className="p-2">تنتهي</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {active.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="p-2 font-semibold" dir="ltr">
                      {s.email} {s.is_principal && <ShieldCheck className="inline h-3.5 w-3.5 text-primary" />}
                    </td>
                    <td className="p-2 text-xs">{fmt(s.started_at)}</td>
                    <td className="p-2 text-xs">{minutesSince(s.started_at)} د</td>
                    <td className="p-2">{s.commands_count}</td>
                    <td className="p-2 text-xs">{s.expires_at ? fmt(s.expires_at) : 'بلا حد'}</td>
                    <td className="flex justify-end gap-2 p-2">
                      <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => kill({ sessionId: s.id })}>
                        <Power className="h-3.5 w-3.5" /> إنهاء
                      </Button>
                      {!s.is_principal && (
                        <Button size="sm" variant="destructive" className="h-8 gap-1" onClick={() => kill({ userId: s.user_id, ban: true })}>
                          <Ban className="h-3.5 w-3.5" /> إنهاء وحظر
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* access & quotas */}
      <section className="space-y-4 rounded-3xl border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 font-bold">
          <Users className="h-4 w-4" /> من يحق له استخدام الطرفية
        </h3>
        <div className="flex flex-wrap gap-2">
          <Input dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-64 text-left" />
          <Input dir="ltr" value={daily} onChange={(e) => setDaily(e.target.value.replace(/[^\d]/g, ''))} className="w-24 text-center" aria-label="الحد اليومي" />
          <Button onClick={grant} disabled={adding} className="gap-1">
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} منح الصلاحية
          </Button>
          <span className="self-center text-xs text-muted-foreground">يجب أن يكون صاحب الإيميل مسجلاً في المنصة. الرئيس لا يحتاج صلاحية ولا حدود عليه.</span>
        </div>

        {quotas.length === 0 ? (
          <p className="text-sm text-muted-foreground">لم تُمنح الصلاحية لأحد بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="text-right">
                  <th className="p-2">الإيميل</th>
                  <th className="p-2">مفعّل</th>
                  <th className="p-2">Claude</th>
                  <th className="p-2">Shell</th>
                  <th className="p-2">الحالة</th>
                  <th className="p-2">استهلاك اليوم</th>
                  <th className="p-2">حد يومي</th>
                  <th className="p-2">الكلي</th>
                  <th className="p-2">حد كلي</th>
                  <th className="p-2">بالدقيقة</th>
                  <th className="p-2">دقائق الجلسة</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {quotas.map((q) => {
                  const pct = q.daily_limit ? Math.min(100, Math.round((q.used_today / q.daily_limit) * 100)) : 100;
                  return (
                    <tr key={q.id} className="border-t border-border align-middle">
                      <td className="p-2 font-semibold" dir="ltr">
                        {q.email}
                      </td>
                      <td className="p-2">
                        <Switch checked={q.enabled} onCheckedChange={(v) => update(q, { enabled: v }, v ? 'فُعّلت الصلاحية' : 'سُحبت الصلاحية وأُنهيت الجلسات')} />
                      </td>
                      <td className="p-2">
                        <Switch checked={q.allow_claude} onCheckedChange={(v) => update(q, { allow_claude: v }, v ? 'سُمح له بـ Claude (قراءة فقط)' : 'أُوقف Claude له')} />
                      </td>
                      <td className="p-2">
                        <Switch
                          checked={q.allow_shell}
                          onCheckedChange={(v) => {
                            if (v && !window.confirm(`السماح لـ ${q.email} بتنفيذ أوامر Shell على جهازك يعطيه نفس صلاحيات حسابك على الماك (قراءة وحذف أي ملف). متأكد؟`)) return;
                            update(q, { allow_shell: v }, v ? 'سُمح له بـ Shell' : 'أُوقف Shell له');
                          }}
                        />
                      </td>
                      <td className="p-2">
                        {q.banned ? (
                          <button
                            type="button"
                            onClick={() => update(q, { banned: false, ban_reason: null }, 'رُفع الحظر')}
                            className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive hover:bg-destructive/20"
                            title={q.ban_reason ?? ''}
                          >
                            محظور · رفع
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => kill({ userId: q.user_id, ban: true })}
                            className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive"
                          >
                            حظر
                          </button>
                        )}
                      </td>
                      <td className="min-w-28 p-2">
                        <div className="text-xs">
                          {q.used_today} / {q.daily_limit}
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full ${pct >= 100 ? 'bg-destructive' : pct > 75 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="p-2">
                        <NumberCell label="حد يومي" value={q.daily_limit} onSave={(v) => update(q, { daily_limit: v ?? 0 }, 'عُدّل الحد اليومي')} />
                      </td>
                      <td className="p-2 text-xs">{q.used_total}</td>
                      <td className="p-2">
                        <NumberCell label="حد كلي" value={q.total_limit} nullable onSave={(v) => update(q, { total_limit: v }, 'عُدّل الحد الكلي')} />
                      </td>
                      <td className="p-2">
                        <NumberCell label="بالدقيقة" value={q.per_minute_limit} onSave={(v) => update(q, { per_minute_limit: Math.max(1, v ?? 1) }, 'عُدّل حد الدقيقة')} />
                      </td>
                      <td className="p-2">
                        <NumberCell label="دقائق الجلسة" value={q.session_minutes} onSave={(v) => update(q, { session_minutes: Math.min(1440, Math.max(1, v ?? 1)) }, 'عُدّل وقت الجلسة')} />
                      </td>
                      <td className="p-2">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" title="تصفير استهلاك اليوم" onClick={() => update(q, { used_today: 0 }, 'صُفّر استهلاك اليوم')}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive" title="سحب الصلاحية نهائياً" onClick={() => remove(q)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* command log */}
      <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="flex items-center gap-2 font-bold">
            <ScrollText className="h-4 w-4" /> سجل الأوامر (مباشر)
          </h3>
          <select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value)}
            className="mr-auto rounded-xl border border-border bg-background px-3 py-1.5 text-xs"
          >
            <option value="all">كل المستخدمين</option>
            {[...emailOf.entries()].map(([id, mail]) => (
              <option key={id} value={id}>
                {mail}
              </option>
            ))}
          </select>
        </div>
        <div className="max-h-96 overflow-y-auto rounded-2xl bg-muted/50 p-3 font-mono text-xs" dir="ltr">
          {shownLogs.length === 0 && <div className="text-muted-foreground">No commands yet.</div>}
          {shownLogs.map((l) => (
            <div key={l.id} className="flex gap-3 py-0.5" title={l.output_preview ?? ''}>
              <span className="shrink-0 text-muted-foreground">{fmt(l.created_at)}</span>
              <span
                className={`w-12 shrink-0 font-bold ${l.status === 'ok' ? 'text-success' : l.status === 'denied' ? 'text-destructive' : l.status === 'error' ? 'text-warning' : 'text-muted-foreground'}`}
              >
                {l.status}
              </span>
              <span className="w-56 shrink-0 truncate text-muted-foreground">{emailOf.get(l.user_id) ?? l.user_id.slice(0, 8)}</span>
              <span className="truncate">{l.command}</span>
              {l.status === 'denied' && l.output_preview && <span className="shrink-0 text-destructive">({l.output_preview})</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TerminalAdminPanel;
