import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ban,
  Check,
  Copy,
  KeyRound,
  Laptop,
  Loader2,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  Square,
  TerminalSquare,
  Trash2,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { PageHeader, PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTeamRoles } from '@/components/team/teamApi';
import {
  authHashFor,
  forgetSecret,
  loadSecret,
  newDeviceSecret,
  pairingCode,
  saveSecret,
  signJob,
} from '@/components/terminal/terminalCrypto';
import {
  isOnline,
  supabaseEndpoint,
  useDeviceJobs,
  useDevices,
  type RemoteChunk,
  type RemoteDevice,
  type RemoteJob,
} from '@/components/terminal/useTerminal';

type Target = 'claude' | 'antigravity';

const STATUS: Record<string, { label: string; tone: string }> = {
  queued: { label: 'بانتظار الجهاز', tone: 'text-muted-foreground' },
  running: { label: 'قيد التنفيذ', tone: 'text-warning' },
  done: { label: 'تم', tone: 'text-success' },
  error: { label: 'خطأ', tone: 'text-destructive' },
  cancelled: { label: 'أُلغي', tone: 'text-muted-foreground' },
  rejected: { label: 'رفضه الجهاز', tone: 'text-destructive' },
};

const CopyBox: React.FC<{ text: string }> = ({ text }) => {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-muted p-2" dir="ltr">
      <code className="flex-1 whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">{text}</code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(text).then(() => {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          });
        }}
        className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
        aria-label="نسخ"
      >
        {done ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

const setupCommands = (code: string) => {
  const origin = window.location.origin;
  return [
    `mkdir -p ~/.zarwa-bridge && curl -fsSL ${origin}/zarwa-bridge.mjs -o ~/.zarwa-bridge/zarwa-bridge.mjs`,
    `cd ~/path/to/your/project && node ~/.zarwa-bridge/zarwa-bridge.mjs pair ${code}`,
    `node ~/.zarwa-bridge/zarwa-bridge.mjs`,
  ];
};

/** Register a new computer; the secret is generated here and shown only once. */
const AddDeviceDialog: React.FC<{ open: boolean; onClose: () => void; onAdded: (id: string) => void }> = ({ open, onClose, onAdded }) => {
  const [name, setName] = useState('جهازي');
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCode(null);
      setName('جهازي');
    }
  }, [open]);

  const create = async () => {
    setSaving(true);
    try {
      const id = crypto.randomUUID();
      const secret = newDeviceSecret();
      const { error } = await supabase.from('remote_devices').insert({ id, name: name.trim() || 'جهازي', auth_hash: await authHashFor(secret) });
      if (error) throw error;
      saveSecret(id, secret);
      const { url, key } = supabaseEndpoint();
      setCode(pairingCode(url, key, id, secret));
      onAdded(id);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const cmds = code ? setupCommands(code) : [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl text-right" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>ربط جهاز جديد</DialogTitle>
          <DialogDescription className="text-right">
            الجسر برنامج صغير يعمل على جهازك ويستقبل الطلبات من هذه الصفحة. لا يفتح أي منفذ على جهازك.
          </DialogDescription>
        </DialogHeader>

        {!code ? (
          <div className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الجهاز" />
            <Button onClick={create} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              إنشاء مفتاح الجهاز
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <p className="rounded-2xl bg-warning/10 p-3 text-xs font-semibold leading-relaxed text-warning">
              رمز الربط يظهر مرة واحدة فقط ويحتوي سر الجهاز. لا تشاركه مع أحد. إن فقدته احذف الجهاز وأنشئ واحداً جديداً.
            </p>
            <ol className="space-y-3">
              <li className="space-y-1.5">
                <div className="font-bold">1. نزّل الجسر (يحتاج Node 18 أو أحدث):</div>
                <CopyBox text={cmds[0]} />
              </li>
              <li className="space-y-1.5">
                <div className="font-bold">2. ادخل مجلد المشروع الذي سيعمل فيه Claude، ثم اربط الجهاز:</div>
                <CopyBox text={cmds[1]} />
              </li>
              <li className="space-y-1.5">
                <div className="font-bold">3. شغّل الجسر واترك النافذة مفتوحة:</div>
                <CopyBox text={cmds[2]} />
                <div className="text-xs text-muted-foreground">
                  ليعمل دائماً في الخلفية على macOS: <code dir="ltr">node ~/.zarwa-bridge/zarwa-bridge.mjs install-service</code>
                </div>
              </li>
            </ol>
            <Button onClick={onClose} className="w-full">
              تم
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ChunkLine: React.FC<{ chunk: RemoteChunk }> = ({ chunk }) => {
  if (chunk.kind === 'tool')
    return (
      <div className="flex items-start gap-1.5 font-mono text-[12px] text-primary" dir="ltr">
        <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span className="break-all text-left">{chunk.content}</span>
      </div>
    );
  if (chunk.kind === 'system') return <div className="font-mono text-[11px] text-muted-foreground">{chunk.content}</div>;
  return <div className="whitespace-pre-wrap break-words leading-relaxed" dir="auto">{chunk.content}</div>;
};

const JobBlock: React.FC<{ job: RemoteJob; chunks: RemoteChunk[] }> = ({ job, chunks }) => {
  const st = STATUS[job.status] ?? STATUS.queued;
  const hasText = chunks.some((c) => c.kind === 'text');
  return (
    <div className="space-y-2 border-b border-border pb-4 last:border-0">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 font-mono font-black text-primary">❯</span>
        <div className="flex-1 whitespace-pre-wrap break-words font-semibold" dir="auto">
          {job.prompt}
        </div>
        <span className={`shrink-0 text-[11px] font-bold ${st.tone}`}>
          {job.target === 'antigravity' ? 'Antigravity' : 'Claude'} · {st.label}
          {(job.status === 'running' || job.status === 'queued') && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />}
        </span>
      </div>
      <div className="space-y-1.5 pr-5 text-sm">
        {chunks.map((c) => (
          <ChunkLine key={c.id} chunk={c} />
        ))}
        {job.status === 'done' && job.result && !hasText && <div className="whitespace-pre-wrap leading-relaxed">{job.result}</div>}
        {job.error && <div className="whitespace-pre-wrap rounded-xl bg-destructive/10 p-2 text-xs text-destructive">{job.error}</div>}
        {job.cost_usd != null && <div className="text-[10px] text-muted-foreground">التكلفة: ${Number(job.cost_usd).toFixed(4)}</div>}
      </div>
    </div>
  );
};

const Terminal: React.FC<{ device: RemoteDevice }> = ({ device }) => {
  const [secret, setSecret] = useState<string | null>(() => loadSecret(device.id));
  const [paste, setPaste] = useState('');
  const [target, setTarget] = useState<Target>('claude');
  const [continueSession, setContinueSession] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [sending, setSending] = useState(false);
  const { jobs, chunks } = useDeviceJobs(device.id);
  const bottom = useRef<HTMLDivElement>(null);
  const online = isOnline(device);
  const info = (device.bridge_info ?? {}) as { workdir?: string; claude?: boolean; antigravity?: boolean; host?: string };

  useEffect(() => setSecret(loadSecret(device.id)), [device.id]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, [jobs.length, chunks]);

  const active = jobs.find((j) => j.status === 'queued' || j.status === 'running');
  const lastSession = useMemo(() => [...jobs].reverse().find((j) => j.target === 'claude' && j.session_id)?.session_id ?? null, [jobs]);

  const send = async () => {
    const text = prompt.trim();
    if (!text || !secret) return;
    setSending(true);
    try {
      const job = {
        id: crypto.randomUUID(),
        target,
        resume_session: target === 'claude' && continueSession ? lastSession : null,
        issued_at: Date.now(),
        prompt: text,
      };
      const signature = await signJob(secret, device.id, job);
      const { error } = await supabase.from('remote_jobs').insert({ ...job, device_id: device.id, signature });
      if (error) throw error;
      setPrompt('');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const cancel = async () => {
    if (!active) return;
    const { error } = await supabase.rpc('remote_cancel_job', { p_job_id: active.id });
    if (error) toast.error(error.message);
  };

  if (!secret) {
    return (
      <div className="space-y-3 rounded-3xl border border-border bg-card p-6">
        <h3 className="font-bold">هذا المتصفح لا يملك سر الجهاز</h3>
        <p className="text-sm text-muted-foreground">
          سر الجهاز يُحفظ فقط في المتصفح الذي أنشأه. الصق رمز الربط هنا لتستخدم الطرفية من هذا المتصفح، أو احذف الجهاز وأنشئ واحداً جديداً.
        </p>
        <div className="flex gap-2">
          <Input dir="ltr" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="رمز الربط" className="font-mono text-xs" />
          <Button
            onClick={() => {
              try {
                const p = JSON.parse(atob(paste.trim().replace(/-/g, '+').replace(/_/g, '/')));
                if (p.d !== device.id || !p.s) throw new Error();
                saveSecret(device.id, p.s);
                setSecret(p.s);
                setPaste('');
              } catch {
                toast.error('الرمز لا يخص هذا الجهاز');
              }
            }}
          >
            حفظ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <span className={`flex items-center gap-1.5 text-xs font-bold ${online ? 'text-success' : 'text-muted-foreground'}`}>
          <span className={`h-2 w-2 rounded-full ${online ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
          {online ? 'متصل' : 'غير متصل'}
        </span>
        {info.workdir && (
          <span className="truncate font-mono text-[11px] text-muted-foreground" dir="ltr">
            {info.host ? `${info.host}:` : ''}
            {info.workdir}
          </span>
        )}
        <div className="mr-auto flex gap-1 rounded-xl bg-muted p-1">
          {(['claude', 'antigravity'] as Target[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTarget(t)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${target === t ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            >
              {t === 'claude' ? 'Claude Code' : 'Antigravity'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[60vh] min-h-[320px] space-y-4 overflow-y-auto p-4">
        {jobs.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <TerminalSquare className="mx-auto mb-3 h-10 w-10 opacity-40" />
            اكتب طلبك وسيُنفَّذ على جهازك.
          </div>
        )}
        {jobs.map((j) => (
          <JobBlock key={j.id} job={j} chunks={chunks[j.id] ?? []} />
        ))}
        <div ref={bottom} />
      </div>

      <div className="space-y-2 border-t border-border p-3">
        {target === 'claude' && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={continueSession} onChange={(e) => setContinueSession(e.target.checked)} className="accent-[hsl(var(--primary))]" />
              متابعة نفس المحادثة {lastSession ? '' : '(لا توجد بعد)'}
            </label>
            {lastSession && continueSession && (
              <button type="button" onClick={() => setContinueSession(false)} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3 w-3" /> محادثة جديدة
              </button>
            )}
          </div>
        )}
        {target === 'antigravity' && (
          <p className="text-xs text-muted-foreground">يُفتح الطلب في وكيل Antigravity على جهازك، وردّه يظهر داخل التطبيق هناك.</p>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={online ? 'اكتب طلبك… (Enter للإرسال، Shift+Enter لسطر جديد)' : 'الجهاز غير متصل؛ سيُنفَّذ الطلب عند تشغيل الجسر'}
            className="min-h-12 flex-1 resize-none"
            dir="auto"
          />
          {active ? (
            <Button variant="destructive" size="icon" onClick={cancel} aria-label="إيقاف">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" onClick={send} disabled={sending || !prompt.trim()} aria-label="إرسال">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const TerminalPage: React.FC = () => {
  const { loading, userId, roles } = useTeamRoles();
  const isPrincipal = roles.includes('principal');
  const { devices, reload } = useDevices();
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const usable = devices.filter((d) => !d.revoked);
  useEffect(() => {
    if (!selected && usable[0]) setSelected(usable[0].id);
  }, [usable, selected]);
  const device = usable.find((d) => d.id === selected);

  const revoke = async (d: RemoteDevice) => {
    if (!window.confirm(`إلغاء ربط "${d.name}"؟ سيتوقف الجسر عن استقبال الطلبات فوراً.`)) return;
    const { error } = await supabase.from('remote_devices').update({ revoked: true }).eq('id', d.id);
    if (error) toast.error(error.message);
    forgetSecret(d.id);
    if (selected === d.id) setSelected(null);
    reload();
  };

  const remove = async (d: RemoteDevice) => {
    if (!window.confirm(`حذف "${d.name}" وكل سجل طلباته؟`)) return;
    const { error } = await supabase.from('remote_devices').delete().eq('id', d.id);
    if (error) toast.error(error.message);
    forgetSecret(d.id);
    reload();
  };

  return (
    <PageShell>
      <SEO title="الطرفية | ذروة العلم" description="إرسال الطلبات إلى Claude Code أو Antigravity على جهازك" />
      <PageHeader
        title="الطرفية"
        description="أرسل طلباتك من المنصة إلى Claude Code أو Antigravity على جهازك، وتابع التنفيذ مباشرة."
        icon={TerminalSquare}
        crumbs={[{ label: 'الرئيسية', to: '/' }, { label: 'الطرفية' }]}
        actions={
          isPrincipal ? (
            <Button onClick={() => setAdding(true)} className="gap-2">
              <Plus className="h-4 w-4" /> ربط جهاز
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !userId ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm">
          <Link to="/auth" className="font-bold text-primary hover:underline">
            سجّل الدخول
          </Link>{' '}
          لاستخدام الطرفية.
        </div>
      ) : !isPrincipal ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">الطرفية متاحة لرئيس المنصة فقط.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-3">
            {usable.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                لا توجد أجهزة مربوطة. اضغط "ربط جهاز" للبدء.
              </div>
            )}
            {usable.map((d) => (
              <div
                key={d.id}
                className={`rounded-2xl border p-3 transition ${d.id === selected ? 'border-primary/50 bg-accent/50' : 'border-border bg-card'}`}
              >
                <button type="button" onClick={() => setSelected(d.id)} className="flex w-full items-center gap-2 text-right">
                  <Laptop className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate font-bold">{d.name}</span>
                  <span className={`h-2 w-2 rounded-full ${isOnline(d) ? 'bg-success' : 'bg-muted-foreground/50'}`} />
                </button>
                <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
                  <button type="button" onClick={() => revoke(d)} className="inline-flex items-center gap-1 hover:text-destructive">
                    <Ban className="h-3 w-3" /> إلغاء الربط
                  </button>
                  <button type="button" onClick={() => remove(d)} className="inline-flex items-center gap-1 hover:text-destructive">
                    <Trash2 className="h-3 w-3" /> حذف
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-2 rounded-2xl bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              كل طلب موقّع بسر الجهاز المحفوظ في هذا المتصفح وعلى جهازك فقط. الجسر يرفض أي طلب غير موقّع أو أقدم من 10 دقائق.
            </div>
          </aside>
          {device ? <Terminal key={device.id} device={device} /> : <div />}
        </div>
      )}

      <AddDeviceDialog
        open={adding}
        onClose={() => setAdding(false)}
        onAdded={(id) => {
          reload();
          setSelected(id);
        }}
      />
    </PageShell>
  );
};

export default TerminalPage;
