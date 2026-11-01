import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, Clock, Gauge, Loader2, Lock, RefreshCw, ShieldCheck, TerminalSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { PageHeader, PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { WebTerminal, callTerminal, type QuotaInfo, type SessionEnd, type SessionInfo } from '@/components/terminal/WebTerminal';

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

const useCountdown = (iso: string | null) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!iso) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [iso]);
  if (!iso) return null;
  const left = Math.max(0, new Date(iso).getTime() - now);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return `${m}:${String(s).padStart(2, '0')}`;
};

const TerminalPage: React.FC = () => {
  const [state, setState] = useState<StartState>({ kind: 'loading' });
  const [ended, setEnded] = useState<SessionEnd | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const started = useRef(false);

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
          setQuota(q as QuotaInfo | null);
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
        const row = payload.new as QuotaInfo & { email: string };
        if (row.email === userEmail) setQuota(row);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userEmail, isPrincipal]);

  const countdown = useCountdown(state.kind === 'ready' && !ended ? state.session.expires_at : null);
  const onEnded = useCallback((e: SessionEnd) => setEnded(e), []);

  return (
    <PageShell>
      <SEO title="الطرفية | ذروة العلم" description="طرفية سحابية تعمل داخل المتصفح لإدارة وفحص المنصة" />
      <PageHeader
        title="الطرفية"
        description="طرفية سحابية تعمل بالكامل داخل المتصفح. الأوامر تُنفَّذ على خوادم المنصة بعد التحقق من صلاحيتك وحصتك."
        icon={TerminalSquare}
        crumbs={[{ label: 'الرئيسية', to: '/' }, { label: 'الطرفية' }]}
        actions={
          isPrincipal ? (
            <Button asChild variant="outline">
              <Link to="/admin?tab=terminal">إدارة الصلاحيات والحصص</Link>
            </Button>
          ) : undefined
        }
      />

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
              {countdown && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> متبقٍ {countdown}
                </span>
              )}
              <span className="mr-auto flex gap-1.5" dir="ltr" aria-hidden>
                <span className="h-3 w-3 rounded-full bg-destructive/70" />
                <span className="h-3 w-3 rounded-full bg-warning/70" />
                <span className="h-3 w-3 rounded-full bg-success/70" />
              </span>
            </div>
            <WebTerminal key={state.session.session_id} session={state.session} onEnded={onEnded} onQuota={(q) => q && setQuota(q)} />
          </div>

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
            اكتب <code dir="ltr">help</code> لعرض الأوامر. الأسهم ↑↓ للسجل، و<code dir="ltr">Ctrl+C</code> لإلغاء السطر، و<code dir="ltr">clear</code> لمسح الشاشة. مخرجات الطرفية بالإنجليزية لأن الطرفيات لا تعرض العربية بشكل صحيح.
          </p>
        </div>
      )}
    </PageShell>
  );
};

export default TerminalPage;
