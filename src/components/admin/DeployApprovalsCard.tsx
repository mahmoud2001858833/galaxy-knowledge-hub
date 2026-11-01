import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, FileCode2, GitCommitHorizontal, Loader2, ShieldAlert, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBridgeStatus } from '@/components/terminal/useBridgeStatus';

/**
 * Admin push & deploy approval gate. Nothing typed in /terminal can commit or push: the bridge files
 * the changed files here, and only the principal decides (terminal_deploy_decide() checks it in the
 * database). Approving makes the bridge commit and push exactly the reviewed files at once;
 * rejecting makes it restore them on the computer.
 */

type DeployRequest = Tables<'terminal_deploy_requests'>;
type ChangedFile = { path: string; change: 'added' | 'modified' | 'deleted' | 'renamed'; added?: number | null; removed?: number | null };

const CHANGE_LABEL: Record<ChangedFile['change'], { text: string; cls: string }> = {
  added: { text: 'جديد', cls: 'bg-success/10 text-success' },
  modified: { text: 'معدّل', cls: 'bg-primary/10 text-primary' },
  deleted: { text: 'محذوف', cls: 'bg-destructive/10 text-destructive' },
  renamed: { text: 'منقول', cls: 'bg-warning/10 text-warning' },
};

const STATUS: Record<string, { text: string; cls: string }> = {
  pending: { text: 'بانتظار موافقتك', cls: 'bg-warning/10 text-warning' },
  approved: { text: 'تمت الموافقة، بانتظار الجسر', cls: 'bg-primary/10 text-primary' },
  pushing: { text: 'جاري الرفع…', cls: 'bg-primary/10 text-primary' },
  deployed: { text: 'رُفع بنجاح', cls: 'bg-success/10 text-success' },
  rejected: { text: 'مرفوض', cls: 'bg-destructive/10 text-destructive' },
  failed: { text: 'فشل الرفع', cls: 'bg-destructive/10 text-destructive' },
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('ar-JO', { timeZone: 'Asia/Amman', dateStyle: 'short', timeStyle: 'short' }) : '—';
const filesOf = (r: DeployRequest) => (Array.isArray(r.changed_files) ? (r.changed_files as unknown as ChangedFile[]) : []);

const DiffView: React.FC<{ diff: string }> = ({ diff }) => {
  const lines = useMemo(() => diff.split('\n'), [diff]);
  return (
    <pre dir="ltr" className="max-h-[28rem] overflow-auto rounded-2xl border border-border bg-muted/40 p-3 text-left font-mono text-[11px] leading-5">
      {lines.map((l, i) => (
        <div
          key={i}
          className={
            l.startsWith('diff --git')
              ? 'mt-3 border-t border-border pt-2 font-bold text-foreground first:mt-0 first:border-0 first:pt-0'
              : l.startsWith('+++') || l.startsWith('---') || l.startsWith('index ') || l.startsWith('new file') || l.startsWith('deleted file')
                ? 'text-muted-foreground'
                : l.startsWith('@@')
                  ? 'text-primary'
                  : l.startsWith('+')
                    ? 'bg-success/10 text-success'
                    : l.startsWith('-')
                      ? 'bg-destructive/10 text-destructive'
                      : 'text-foreground/80'
          }
        >
          {l || ' '}
        </div>
      ))}
    </pre>
  );
};

const PendingRequest: React.FC<{ r: DeployRequest; online: boolean }> = ({ r, online }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(r.commit_message);
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  useEffect(() => setMessage(r.commit_message), [r.commit_message]);
  const files = filesOf(r);

  const decide = async (approve: boolean) => {
    if (!approve && !window.confirm(`رفض التعديل؟ ستُلغى التغييرات على ${files.length} ملف من جهازك فوراً.`)) return;
    setBusy(approve ? 'approve' : 'reject');
    // the hash ties the decision to exactly the changes on screen
    const { error } = await supabase.rpc('terminal_deploy_decide', {
      p_id: r.id,
      p_approve: approve,
      p_diff_hash: r.diff_hash,
      p_commit_message: approve ? message.trim() : null,
    });
    setBusy(null);
    if (error) toast.error(error.message);
    else toast.success(approve ? (online ? 'تمت الموافقة؛ الجسر يرفع التعديل الآن' : 'تمت الموافقة؛ سيُرفع التعديل فور اتصال الجسر') : 'رُفض التعديل وسيُلغى من الجهاز');
  };

  return (
    <article className="space-y-3 rounded-2xl border-2 border-warning/40 bg-warning/5 p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="font-bold text-foreground" dir="ltr">
          {r.user_email ?? '—'}
        </span>
        <span className="text-muted-foreground">{fmt(r.updated_at)}</span>
        {r.branch && (
          <span className="flex items-center gap-1 text-muted-foreground" dir="ltr">
            <GitCommitHorizontal className="h-3.5 w-3.5" /> {r.branch}
          </span>
        )}
        <span className={`rounded-full px-2 py-0.5 font-bold ${STATUS.pending.cls}`}>{STATUS.pending.text}</span>
      </div>

      {r.prompt && (
        <p dir="auto" className="line-clamp-4 whitespace-pre-wrap rounded-xl bg-background/60 p-3 text-sm">
          {r.prompt}
        </p>
      )}

      <label className="block space-y-1 text-xs font-semibold text-muted-foreground">
        وصف التعديل (رسالة الـ commit)
        <Input value={message} onChange={(e) => setMessage(e.target.value)} dir="auto" maxLength={300} className="text-sm font-normal text-foreground" />
      </label>

      <ul className="flex flex-wrap gap-2">
        {files.map((f) => (
          <li key={f.path} className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1 text-xs">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${CHANGE_LABEL[f.change]?.cls ?? ''}`}>{CHANGE_LABEL[f.change]?.text ?? f.change}</span>
            <span dir="ltr" className="font-mono">
              {f.path}
            </span>
            {(f.added != null || f.removed != null) && (
              <span dir="ltr" className="font-mono">
                <span className="text-success">+{f.added ?? 0}</span> <span className="text-destructive">−{f.removed ?? 0}</span>
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => decide(true)}
          disabled={!!busy || !message.trim()}
          className="gap-2 bg-success text-white hover:bg-success/90"
        >
          {busy === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} موافقة ورفع فوري
        </Button>
        <Button variant="destructive" onClick={() => decide(false)} disabled={!!busy} className="gap-2">
          {busy === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} رفض وإلغاء التعديل
        </Button>
        <Button variant="outline" onClick={() => setOpen((o) => !o)} className="gap-2">
          <FileCode2 className="h-4 w-4" /> {open ? 'إخفاء التغييرات' : 'عرض التغييرات'}
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {open && <DiffView diff={r.diff_preview || '(لا توجد تفاصيل)'} />}
    </article>
  );
};

const PastRequest: React.FC<{ r: DeployRequest }> = ({ r }) => {
  const [open, setOpen] = useState(false);
  const st = STATUS[r.status] ?? { text: r.status, cls: '' };
  const working = r.status === 'approved' || r.status === 'pushing';
  return (
    <li className="space-y-2 rounded-xl border border-border p-3 text-xs">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${st.cls}`}>
          {working && <Loader2 className="h-3 w-3 animate-spin" />}
          {st.text}
        </span>
        <span dir="auto" className="font-semibold text-foreground">
          {r.commit_message}
        </span>
        <span dir="ltr" className="text-muted-foreground">
          {r.user_email}
        </span>
        <span className="text-muted-foreground">{filesOf(r).length} ملف</span>
        {r.commit_sha && (
          <code dir="ltr" className="rounded bg-muted px-1.5 py-0.5">
            {r.commit_sha.slice(0, 7)}
          </code>
        )}
        <span className="text-muted-foreground">{fmt(r.completed_at ?? r.decided_at)}</span>
        {r.result_log && (
          <button type="button" onClick={() => setOpen((o) => !o)} className="text-primary hover:underline">
            {open ? 'إخفاء السجل' : 'السجل'}
          </button>
        )}
      </div>
      {open && r.result_log && (
        <pre dir="ltr" className="max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/50 p-2 text-left font-mono text-[11px]">
          {r.result_log}
        </pre>
      )}
    </li>
  );
};

export const DeployApprovalsCard: React.FC = () => {
  const { status: bridge } = useBridgeStatus(true, 5000);
  const [rows, setRows] = useState<DeployRequest[] | null>(null);

  const load = useCallback(async () => {
    const [pending, recent] = await Promise.all([
      supabase.from('terminal_deploy_requests').select('*').eq('status', 'pending').order('created_at'),
      supabase.from('terminal_deploy_requests').select('*').neq('status', 'pending').order('updated_at', { ascending: false }).limit(8),
    ]);
    setRows([...(pending.data ?? []), ...(recent.data ?? [])]);
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`deploy-approvals-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'terminal_deploy_requests' }, (payload) => {
        const r = payload.new as DeployRequest;
        if (payload.eventType === 'INSERT') toast.info(`طلب موافقة جديد على رفع تعديلات من ${r.user_email ?? 'مستخدم'}`);
        else if (payload.eventType === 'UPDATE' && r.status === 'deployed' && (payload.old as Partial<DeployRequest>)?.status !== 'deployed')
          toast.success(`رُفع التعديل ${r.commit_sha?.slice(0, 7) ?? ''} بنجاح`);
        else if (payload.eventType === 'UPDATE' && r.status === 'failed') toast.error('فشل رفع التعديل، افتح السجل للتفاصيل');
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const pending = rows?.filter((r) => r.status === 'pending') ?? [];
  const past = rows?.filter((r) => r.status !== 'pending') ?? [];
  const online = !!bridge?.online;

  return (
    <section className="space-y-4 rounded-3xl border-2 border-primary/30 bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="flex items-center gap-2 text-lg font-black">
          <ShieldAlert className="h-5 w-5 text-primary" /> طلبات الموافقة على رفع التعديلات
        </h3>
        <span
          className={`rounded-full px-3 py-1 text-sm font-black ${pending.length ? 'animate-pulse bg-warning text-white' : 'bg-muted text-muted-foreground'}`}
          aria-label={`${pending.length} طلب معلق`}
        >
          {pending.length}
        </span>
        <span className={`text-xs ${online ? 'text-success' : 'text-muted-foreground'}`}>
          {online ? 'الجسر متصل: الرفع يتم فور الموافقة' : 'الجسر غير متصل: تُنفَّذ القرارات عند اتصاله'}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        لا أحد يستطيع تنفيذ commit أو push من الطرفية. أي ملفات يغيّرها Claude أو أوامر الجهاز تصل إلى هنا، والموافقة ترفعها إلى GitHub فوراً
        (فينشرها Vercel تلقائياً)، والرفض يلغيها من جهازك.
      </p>

      {rows === null ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : pending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">لا توجد طلبات معلقة.</div>
      ) : (
        <div className="space-y-3">
          {pending.map((r) => (
            <PendingRequest key={r.id} r={r} online={online} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-muted-foreground">آخر القرارات</div>
          <ul className="space-y-2">
            {past.map((r) => (
              <PastRequest key={r.id} r={r} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default DeployApprovalsCard;
