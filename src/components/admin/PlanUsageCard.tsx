import React from 'react';
import { Bot, Gauge, Info, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WINDOW_LABEL, perMillion, resetText, usePlanLimits, type PlanLimits, type Window } from '@/components/terminal/usePlanLimits';

/**
 * How much of the principal's Claude and Antigravity subscriptions is used now, and what 1M tokens
 * costs of each window, measured from the jobs that ran through the bridge.
 */

const Meter: React.FC<{ label: string; w: Window }> = ({ label, w }) => {
  const pct = Math.round(w.used * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-semibold">{label}</span>
        <span className="text-muted-foreground">
          {pct}%{resetText(w.resets) && ` · يتجدد ${resetText(w.resets)}`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${pct >= 90 ? 'bg-destructive' : pct >= 70 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const Measured: React.FC<{ limits: PlanLimits | null; agent: 'claude' | 'antigravity'; wins: string[] }> = ({ limits, agent, wins }) => {
  const rows = wins.map((w) => ({ w, s: perMillion(limits, agent, w) })).filter((r) => r.s);
  if (!rows.length)
    return <p className="text-xs text-muted-foreground">لا توجد قياسات بعد. تظهر تلقائياً بعد أول رسائل تمرّ عبر الجسر بالنسخة الجديدة.</p>;
  return (
    <ul className="space-y-1 text-xs">
      {rows.map(({ w, s }) => (
        <li key={w} className="flex justify-between gap-2">
          <span>1M توكن ≈</span>
          <span className="font-bold">
            {s!.per_million!.toFixed(1)}% من {WINDOW_LABEL[w] ?? w}
            <span className="mr-1 font-normal text-muted-foreground">(من {s!.samples} رسالة)</span>
          </span>
        </li>
      ))}
    </ul>
  );
};

export const PlanUsageCard: React.FC = () => {
  const { limits, reload } = usePlanLimits();
  const claude = limits?.claude;
  const ag = limits?.antigravity;
  const agModels = Object.entries(ag?.models ?? {}).sort((a, b) => b[1].used - a[1].used);

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="flex items-center gap-2 font-bold">
          <Gauge className="h-4 w-4" /> استهلاك اشتراكاتك
        </h3>
        <Button size="sm" variant="ghost" className="mr-auto h-8 gap-1" onClick={reload}>
          <RefreshCw className="h-3.5 w-3.5" /> تحديث
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 font-bold">
            <Bot className="h-4 w-4 text-brand-from" /> Claude
          </div>
          {claude && Object.keys(claude.windows).length ? (
            <>
              {Object.entries(claude.windows).map(([k, w]) => (
                <Meter key={k} label={WINDOW_LABEL[k] ?? k} w={w} />
              ))}
              <p className="text-[11px] text-muted-foreground">آخر قراءة: {new Date(claude.at).toLocaleString('ar-JO', { timeZone: 'Asia/Amman', timeStyle: 'short', dateStyle: 'short' })}، من آخر رسالة لـ Claude عبر الجسر.</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">لا توجد قراءة بعد. Claude يرسل نسبة الاستهلاك مع كل رسالة، فتظهر هنا بعد أول رسالة عبر الجسر.</p>
          )}
          <Measured limits={limits} agent="claude" wins={['five_hour', 'seven_day']} />
        </div>

        <div className="space-y-3 rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="h-4 w-4 text-brand-to" /> Antigravity
          </div>
          {agModels.length ? (
            agModels.slice(0, 5).map(([id, w]) => <Meter key={id} label={w.label} w={w} />)
          ) : (
            <p className="text-xs text-muted-foreground">لا توجد قراءة بعد. تظهر عندما يكون Antigravity مفتوحاً والجسر متصلاً (تتحدث كل 10 دقائق).</p>
          )}
          <Measured limits={limits} agent="antigravity" wins={['quota']} />
        </div>
      </div>

      <div className="flex gap-2 rounded-2xl bg-muted/50 p-3 text-xs leading-6 text-muted-foreground">
        <Info className="mt-1 h-4 w-4 shrink-0" />
        <div>
          Anthropic وGoogle لا تنشران عدد التوكن المسموح في نافذة الخمس ساعات أو الحد الأسبوعي، فهما يعتمدان على باقتك وعلى النموذج وحجم السياق. لذلك
          تُحسب النسب هنا من استخدامك الفعلي: يسجّل الجسر النسبة قبل كل رسالة وبعدها، ويقارنها بعدد التوكن الذي استُهلك. التوكن يشمل كل ما يقرؤه
          الوكيل من المشروع (ومنه المخزّن مؤقتاً)، واستخدامك أنت لـ Claude خارج المنصة في الوقت نفسه يدخل في القياس، فكلما زادت الرسائل صار الرقم أدق.
        </div>
      </div>
    </section>
  );
};

export default PlanUsageCard;
