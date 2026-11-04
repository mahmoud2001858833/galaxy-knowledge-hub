import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bot, Check, Loader2, Mail, Sparkles, SquareTerminal, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { WINDOW_LABEL, perMillion, usePlanLimits, type PlanLimits } from '@/components/terminal/usePlanLimits';
import {
  AGENT_LABEL,
  AGENT_SCOPE,
  DEFAULT_ALLOWANCE,
  PRESETS,
  allowanceColumns,
  allowanceFromRow,
  fmtTokens,
  parseTokens,
  whatFits,
  type AgentAllowance,
  type AgentKey,
  type Allowance,
} from '@/components/terminal/agentUsage';

/**
 * Grant (or edit) terminal access. New access goes to one or more of the platform's AI managers
 * (team role ai_manager) and/or typed emails, with an allowance per agent. The dialog explains in
 * plain words what the allowance is enough for before anything is saved.
 */

type Quota = Tables<'usage_quotas'>;
type Member = Pick<Tables<'team_members'>, 'user_id' | 'email' | 'display_name'>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NumberField: React.FC<{ label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100000,
  suffix,
}) => (
  <label className="space-y-1 text-xs font-semibold text-muted-foreground">
    {label}
    <div className="flex items-center gap-2">
      <Input
        dir="ltr"
        inputMode="numeric"
        value={String(value)}
        onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value.replace(/[^\d]/g, ''), 10) || 0)))}
        className="h-9 w-24 text-center font-normal text-foreground"
      />
      {suffix && <span className="font-normal">{suffix}</span>}
    </div>
  </label>
);

const TokenField: React.FC<{ value: number | null; onChange: (v: number | null) => void }> = ({ value, onChange }) => {
  const [text, setText] = useState(value == null ? '' : fmtTokens(value));
  useEffect(() => setText(value == null ? '' : fmtTokens(value)), [value]);
  const parsed = parseTokens(text);
  return (
    <label className="space-y-1 text-xs font-semibold text-muted-foreground">
      توكن يومياً
      <div className="flex items-center gap-2">
        <Input
          dir="ltr"
          value={text}
          placeholder="∞"
          onChange={(e) => setText(e.target.value)}
          onBlur={() => parsed !== undefined && onChange(parsed)}
          className={`h-9 w-28 text-center font-normal text-foreground ${parsed === undefined ? 'border-destructive' : ''}`}
        />
        <span className="font-normal">مثل 500k أو 1.5M، فارغ = بلا حد</span>
      </div>
    </label>
  );
};

/** What the daily token limit means for the principal's own subscription (measured, see PlanUsageCard). */
const PlanShare: React.FC<{ agent: AgentKey; tokens: number | null; limits: PlanLimits | null }> = ({ agent, tokens, limits }) => {
  const wins = agent === 'claude' ? ['five_hour', 'seven_day'] : ['quota'];
  const rows = wins.map((w) => ({ w, s: perMillion(limits, agent, w) })).filter((r) => r.s);
  return (
    <div className="rounded-xl border border-border bg-background/70 p-3 text-xs">
      <div className="mb-1 font-bold text-foreground">كم يأخذ من اشتراكك؟</div>
      {tokens == null ? (
        <p className="text-muted-foreground">بلا حد توكن: قد يستهلك كامل نافذتك إذا استخدمه بكثافة.</p>
      ) : rows.length ? (
        <ul className="space-y-1">
          {rows.map(({ w, s }) => {
            const day = (tokens / 1e6) * s!.per_million!;
            return (
              <li key={w} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{WINDOW_LABEL[w] ?? w}</span>
                <span className="font-semibold">
                  ≈ {Math.min(100, w === 'seven_day' ? day * 7 : day).toFixed(day < 10 ? 1 : 0)}%
                  <span className="mr-1 font-normal text-muted-foreground">{w === 'seven_day' ? 'إذا استُهلك الحد كل يوم' : 'إذا استُهلك حد اليوم دفعة واحدة'}</span>
                </span>
              </li>
            );
          })}
          <li className="text-muted-foreground">محسوب من {rows[0].s!.samples} رسالة فعلية: 1M توكن ≈ {rows.map(({ w, s }) => `${s!.per_million!.toFixed(1)}% من ${WINDOW_LABEL[w] ?? w}`).join('، و')}.</li>
        </ul>
      ) : (
        <p className="text-muted-foreground">لا توجد قياسات بعد: لا تنشر Anthropic ولا Google عدد التوكن في الحدود، فيحسبه الجسر من استخدامك الفعلي بعد أول رسائل.</p>
      )}
    </div>
  );
};

const AgentCard: React.FC<{ agent: AgentKey; value: AgentAllowance; onChange: (v: AgentAllowance) => void; limits: PlanLimits | null }> = ({ agent, value, onChange, limits }) => {
  const Icon = agent === 'claude' ? Bot : Sparkles;
  const scope = AGENT_SCOPE[agent];
  const fits = whatFits(agent, value);
  return (
    <section className={`space-y-3 rounded-2xl border p-4 transition ${value.enabled ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30'}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${agent === 'claude' ? 'text-brand-from' : 'text-brand-to'}`} />
        <h4 className="font-bold">{AGENT_LABEL[agent]}</h4>
        <Switch className="mr-auto" checked={value.enabled} onCheckedChange={(v) => onChange({ ...value, enabled: v })} aria-label={`السماح بـ ${AGENT_LABEL[agent]}`} />
      </div>
      {value.enabled ? (
        <>
          <div className="flex flex-wrap gap-4">
            <NumberField label="رسائل يومياً" value={value.messages} onChange={(messages) => onChange({ ...value, messages })} suffix="رسالة" />
            <TokenField value={value.tokens} onChange={(tokens) => onChange({ ...value, tokens })} />
          </div>
          <div className="rounded-xl bg-background/70 p-3 text-xs">
            <div className="mb-1.5 font-bold text-foreground">ماذا يكفي هذا يومياً؟ (تقريباً)</div>
            <ul className="space-y-1">
              {fits.map((f) => (
                <li key={f.label} className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-semibold">
                    {f.n === 0 ? 'لا يكفي' : `≈ ${f.n} مرة`}
                    <span className="mr-1 font-normal text-muted-foreground" dir="ltr">
                      (~{fmtTokens(f.tokens)}/task)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-muted-foreground">
              {fits[1].limitedBy === 'tokens'
                ? 'حد التوكن هو الذي يحدّ الاستخدام هنا، لا عدد الرسائل.'
                : 'عدد الرسائل هو الذي يحدّ الاستخدام هنا، لا التوكن.'}{' '}
              التوكن يشمل كل ما يقرؤه الوكيل من المشروع وكل ما يكتبه.
            </p>
          </div>
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <ul className="space-y-1">
              {scope.can.map((c) => (
                <li key={c} className="flex gap-1.5">
                  <Check className="h-3.5 w-3.5 shrink-0 text-success" /> {c}
                </li>
              ))}
            </ul>
            <ul className="space-y-1">
              {scope.cannot.map((c) => (
                <li key={c} className="flex gap-1.5 text-muted-foreground">
                  <X className="h-3.5 w-3.5 shrink-0 text-destructive" /> {c}
                </li>
              ))}
            </ul>
          </div>
          <PlanShare agent={agent} tokens={value.tokens} limits={limits} />
          {agent === 'antigravity' && limits?.policy && !limits.policy.antigravityOthers ? (
            <p className="flex gap-1.5 rounded-xl bg-destructive/10 p-2 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              مقفل الآن على جهازك: سيظهر للمستخدم «Antigravity on this computer is for the principal only» حتى تضع antigravity.allowOthers: true في
              ~/.zarwa-bridge/config.json وتعيد تشغيل الجسر. وكيل Antigravity ينفّذ أي أمر على جهازك بلا قيود.
            </p>
          ) : (
            scope.note && (
              <p className="flex gap-1.5 rounded-xl bg-warning/10 p-2 text-xs text-warning">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {scope.note}
              </p>
            )
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">معطّل: لن يظهر له تبويب {AGENT_LABEL[agent]} في الطرفية.</p>
      )}
    </section>
  );
};

export const TerminalGrantDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotas: Quota[];
  editing?: Quota | null;
  onSaved: () => void;
}> = ({ open, onOpenChange, quotas, editing, onSaved }) => {
  const [managers, setManagers] = useState<Member[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [typed, setTyped] = useState('');
  const [a, setA] = useState<Allowance>(DEFAULT_ALLOWANCE);
  const [preset, setPreset] = useState<string>('medium');
  const [saving, setSaving] = useState(false);
  const { limits } = usePlanLimits(open);

  const has = useMemo(() => new Set(quotas.map((q) => q.email.toLowerCase())), [quotas]);

  useEffect(() => {
    if (!open) return;
    setPicked(new Set());
    setTyped('');
    if (editing) {
      setA(allowanceFromRow(editing));
      setPreset('custom');
    } else {
      setA(DEFAULT_ALLOWANCE);
      setPreset('medium');
      supabase
        .from('team_members')
        .select('user_id, email, display_name')
        .eq('role', 'ai_manager')
        .order('created_at')
        .then(({ data }) => setManagers(data ?? []));
    }
  }, [open, editing]);

  const typedEmails = typed
    .split(/[\s,،;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const badTyped = typedEmails.filter((e) => !EMAIL.test(e));
  const targets = editing ? [editing.email] : [...new Set([...picked, ...typedEmails.filter((e) => EMAIL.test(e))])];
  const neededCommands = (a.claude.enabled ? a.claude.messages : 0) + (a.antigravity.enabled ? a.antigravity.messages : 0);

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    setPreset(id);
    if (!p) return;
    setA((cur) => ({
      ...cur,
      claude: { ...cur.claude, ...p.claude },
      antigravity: { ...cur.antigravity, ...p.antigravity },
      sessionMinutes: p.sessionMinutes,
      dailyCommands: Math.max(cur.dailyCommands, p.claude.messages + p.antigravity.messages + 20),
    }));
  };
  const setAgent = (agent: AgentKey, v: AgentAllowance) => {
    setPreset('custom');
    setA((cur) => ({ ...cur, [agent]: v }));
  };

  const save = async () => {
    if (!targets.length) return toast.error('اختر مسؤولاً واحداً على الأقل أو اكتب إيميلاً');
    if (badTyped.length) return toast.error(`إيميل غير صحيح: ${badTyped.join('، ')}`);
    // every agent message is also a terminal command, so the command limit must leave room for them
    const cols = { ...allowanceColumns(a), daily_limit: Math.max(a.dailyCommands, neededCommands) };
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from('usage_quotas').update(cols).eq('id', editing.id);
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success(`حُدّث استخدام ${editing.email}`);
    } else {
      const done: string[] = [];
      const failed: string[] = [];
      for (const email of targets) {
        if (has.has(email)) {
          failed.push(`${email} (لديه صلاحية مسبقاً)`);
          continue;
        }
        const { error } = await supabase.from('usage_quotas').insert({ email, ...cols } as never);
        if (error) failed.push(`${email} (${error.message})`);
        else done.push(email);
      }
      setSaving(false);
      if (done.length) toast.success(`مُنحت الصلاحية لـ ${done.length} ${done.length === 1 ? 'مستخدم' : 'مستخدمين'}`);
      if (failed.length) toast.error(`لم تُمنح لـ: ${failed.join('، ')}`);
      if (!done.length) return;
    }
    onSaved();
    onOpenChange(false);
  };

  const toggle = (email: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(email)) n.delete(email);
      else n.add(email);
      return n;
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto" dir="rtl">
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle>{editing ? 'تعديل الاستخدام المسموح' : 'إضافة مستخدم للطرفية'}</DialogTitle>
          <DialogDescription>
            {editing ? (
              <span dir="ltr">{editing.email}</span>
            ) : (
              'اختر من مسؤولي الذكاء الاصطناعي في المنصة أو اكتب إيميلاً، ثم حدّد ما يُسمح له به لكل وكيل.'
            )}
          </DialogDescription>
        </DialogHeader>

        {!editing && (
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold">
              <UserCheck className="h-4 w-4" /> مسؤولو الذكاء الاصطناعي
            </h4>
            {managers === null ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : managers.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا يوجد أحد بدور «مسؤول الذكاء الاصطناعي» في فريق المنصة بعد.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {managers.map((m) => {
                  const email = m.email.toLowerCase();
                  const already = has.has(email);
                  const on = picked.has(email);
                  return (
                    <button
                      key={m.user_id}
                      type="button"
                      disabled={already}
                      onClick={() => toggle(email)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-start transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        on ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
                        {on && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{m.display_name || email.split('@')[0]}</span>
                        <span className="block truncate text-xs text-muted-foreground" dir="ltr">
                          {email}
                        </span>
                      </span>
                      {already && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">لديه صلاحية</span>}
                    </button>
                  );
                })}
              </div>
            )}
            <label className="block space-y-1">
              <span className="flex items-center gap-2 text-sm font-bold">
                <Mail className="h-4 w-4" /> أو إيميل آخر
              </span>
              <Input dir="ltr" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="email@example.com, another@example.com" className="text-left" />
              <span className="text-xs text-muted-foreground">يمكن كتابة أكثر من إيميل مفصولة بفاصلة. يجب أن يكون صاحب الإيميل مسجلاً في المنصة.</span>
            </label>
            {targets.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {targets.map((t) => (
                  <span key={t} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary" dir="ltr">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="space-y-2">
          <h4 className="text-sm font-bold">حجم الاستخدام</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[...PRESETS, { id: 'custom', label: 'مخصّص', hint: 'حدّد الأرقام بنفسك' }].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`rounded-xl border p-3 text-start transition ${preset === p.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
              >
                <div className="text-sm font-bold">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.hint}</div>
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-3 lg:grid-cols-2">
          <AgentCard agent="claude" value={a.claude} onChange={(v) => setAgent('claude', v)} limits={limits} />
          <AgentCard agent="antigravity" value={a.antigravity} onChange={(v) => setAgent('antigravity', v)} limits={limits} />
        </div>

        <section className="space-y-3 rounded-2xl border border-border p-4">
          <h4 className="text-sm font-bold">الجلسة والأوامر</h4>
          <div className="flex flex-wrap gap-4">
            <NumberField label="أوامر يومياً (كل الأنواع)" value={a.dailyCommands} onChange={(dailyCommands) => setA((c) => ({ ...c, dailyCommands }))} />
            <NumberField label="مدة الجلسة" value={a.sessionMinutes} min={1} max={1440} onChange={(sessionMinutes) => setA((c) => ({ ...c, sessionMinutes }))} suffix="دقيقة" />
          </div>
          {a.dailyCommands < neededCommands && (
            <p className="text-xs text-warning">كل رسالة لوكيل تُحسب أمراً أيضاً، لذلك سيُرفع حد الأوامر تلقائياً إلى {neededCommands}.</p>
          )}
          <div className="flex items-start gap-3">
            <SquareTerminal className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div className="flex-1 text-xs">
              <div className="font-bold">Shell على جهازك</div>
              <div className="text-muted-foreground">
                يعطيه نفس صلاحيات حسابك على الماك (قراءة وحذف أي ملف). يبقى مقفلاً على جهازك إلا إذا فعّلت <code dir="ltr">shell.allowOthers</code>.
              </div>
            </div>
            <Switch
              checked={a.shell}
              onCheckedChange={(v) => {
                if (v && !window.confirm('السماح بأوامر Shell على جهازك يعطي المستخدم نفس صلاحيات حسابك. متأكد؟')) return;
                setA((c) => ({ ...c, shell: v }));
              }}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-muted/50 p-4 text-sm leading-7">
          <div className="font-bold">الخلاصة</div>
          {!a.claude.enabled && !a.antigravity.enabled && !a.shell ? (
            <p className="text-muted-foreground">سيستخدم أوامر المنصة فقط (help وstatus…) دون أي وكيل ذكاء.</p>
          ) : (
            <ul className="list-disc pr-5 text-muted-foreground">
              {(['claude', 'antigravity'] as const)
                .filter((k) => a[k].enabled)
                .map((k) => (
                  <li key={k}>
                    {AGENT_LABEL[k]}: حتى {a[k].messages} رسالة و<span dir="ltr">{fmtTokens(a[k].tokens)}</span> توكن يومياً، أي نحو {whatFits(k, a[k])[1].n} تعديل صغير.
                  </li>
                ))}
              {a.shell && <li>Shell مفعّل على جهازك.</li>}
              <li>العدّ يتصفّر يومياً بتوقيت عمّان. كل تعديل ينتظر موافقتك قبل رفعه.</li>
              <li>الحد يُفحص قبل كل رسالة، فقد تتجاوز آخر رسالة في اليوم الحد قليلاً.</li>
            </ul>
          )}
        </section>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button onClick={save} disabled={saving || (!editing && !targets.length)} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editing ? 'حفظ التعديل' : targets.length > 1 ? `منح الصلاحية لـ ${targets.length} مستخدمين` : 'منح الصلاحية'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TerminalGrantDialog;
