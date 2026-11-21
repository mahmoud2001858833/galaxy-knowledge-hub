// What the central brain knows without being asked: problems that need the admin (bridge offline,
// preview down, late tasks, pending approvals) and what the AI costs. Polled cheaply (no AI call).
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronDown, Coins, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Issue = { level: 'red' | 'amber'; area: string; text: string };
type Spend = { calls: number; tokens: number; usd: number };
export type Pulse = {
  health: { at: string; issues: Issue[]; bridge: { devices: number; online: number; last_seen: string } };
  spend: { brain_today: Spend; brain_30d: Spend; agents_today: Spend };
};

export function useBrainPulse(everyMs = 3 * 60_000) {
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-brain', { body: { action: 'pulse' } });
      if (!error && data?.health) setPulse(data as Pulse); // keep the last good one on a blip
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh(); }, everyMs);
    return () => window.clearInterval(id);
  }, [refresh, everyMs]);
  return { pulse, loading, refresh };
}

const usd = (n: number) => (n < 0.01 ? (n === 0 ? '$0' : '<$0.01') : `$${n.toFixed(2)}`);
const kTokens = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}k` : String(n));

/** Status strip at the top of the brain panel: health + spend, expandable to the list of problems. */
export function InsightsBar({ pulse, loading, onRefresh, onAsk }: {
  pulse: Pulse | null; loading: boolean; onRefresh: () => void; onAsk: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (!pulse) return null;
  const { issues } = pulse.health;
  const red = issues.filter((i) => i.level === 'red').length;
  const ok = issues.length === 0;
  const s = pulse.spend;

  return (
    <div className="border-b border-border bg-background/40 px-4 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => !ok && setOpen((v) => !v)}
          aria-expanded={open}
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold transition-colors ${
            ok ? 'border-primary/30 bg-primary/10 text-primary'
              : red ? 'border-destructive/40 bg-destructive/10 text-destructive'
              : 'border-border bg-muted text-foreground'}`}
        >
          {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {ok ? 'كل شي تمام' : `${issues.length} تنبيه`}
          {!ok && <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />}
        </button>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground"
          title={`العقل آخر 30 يوم: ${usd(s.brain_30d.usd)} · ${s.brain_30d.calls} استدعاء`}>
          <Coins className="h-3.5 w-3.5 text-primary" />
          العقل اليوم {usd(s.brain_today.usd)} · {kTokens(s.brain_today.tokens)} توكن
        </span>
        {s.agents_today.calls > 0 && (
          <span className="rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground">
            الوكلاء اليوم: {s.agents_today.calls} مهمة · {kTokens(s.agents_today.tokens)}
          </span>
        )}
        <button type="button" onClick={onRefresh} aria-label="تحديث" className="ms-auto rounded-full p-1 text-muted-foreground hover:text-foreground">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && !ok && (
          <motion.ul className="mt-2 space-y-1.5 overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            {issues.map((i, n) => (
              <li key={n} className="flex items-start gap-2 rounded-xl border border-border bg-card px-3 py-2">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${i.level === 'red' ? 'bg-destructive' : 'bg-primary'}`} aria-hidden />
                <span className="flex-1 leading-relaxed text-foreground"><b className="text-muted-foreground">{i.area}: </b>{i.text}</span>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => onAsk('طمّنّي: شو المشاكل الحالية وكيف نحلها؟')}
                className="w-full rounded-xl bg-gradient-to-br from-brand-from to-brand-to px-3 py-2 font-semibold text-primary-foreground">
                اشرحيلي واقترحي حلول
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
