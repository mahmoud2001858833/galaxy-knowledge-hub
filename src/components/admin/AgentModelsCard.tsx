import React, { useCallback, useEffect, useState } from 'react';
import { Cpu, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * The model each AI agent uses on the principal's computer. The lists come from the bridge
 * (bridge_devices.info.models: what Claude Code and the Antigravity app offer on this account);
 * the choice is stored in terminal_agent_settings and read by the bridge before every job.
 */

type Agent = 'claude' | 'antigravity';
type ModelOption = { id: string; label: string };
type Setting = { agent: Agent; model: string | null; model_label: string | null; updated_at: string };

const AGENTS: { key: Agent; name: string; hint: string }[] = [
  { key: 'claude', name: 'Claude Code', hint: 'الافتراضي هو نموذج حسابك في Claude Code' },
  { key: 'antigravity', name: 'Antigravity', hint: 'الافتراضي هو النموذج المختار داخل تطبيق Antigravity' },
];

export const AgentModelsCard: React.FC = () => {
  const [models, setModels] = useState<Record<Agent, ModelOption[]> | null>(null);
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [saving, setSaving] = useState<Agent | null>(null);

  const load = useCallback(async () => {
    const [dev, set] = await Promise.all([
      supabase.from('bridge_devices').select('info').eq('revoked', false).order('last_seen_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle(),
      supabase.from('terminal_agent_settings').select('*'),
    ]);
    const info = (dev.data?.info ?? {}) as { models?: Record<Agent, ModelOption[]> };
    setModels({ claude: info.models?.claude ?? [], antigravity: info.models?.antigravity ?? [] });
    setSettings(Object.fromEntries(((set.data ?? []) as Setting[]).map((s) => [s.agent, s])));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const choose = async (agent: Agent, id: string) => {
    const option = models?.[agent].find((m) => m.id === id);
    setSaving(agent);
    const { error } = await supabase
      .from('terminal_agent_settings')
      .update({ model: id || null, model_label: option?.label ?? null })
      .eq('agent', agent);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success(`${agent === 'claude' ? 'Claude' : 'Antigravity'}: ${option?.label ?? 'النموذج الافتراضي'} — يُطبَّق من الطلب التالي`);
    load();
  };

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 font-bold">
        <Cpu className="h-4 w-4" /> نموذج الذكاء لكل وكيل
      </h3>
      {models === null ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {AGENTS.map((a) => {
            const current = settings[a.key]?.model ?? '';
            const list = models[a.key];
            // keep a saved choice visible even if the bridge has not reported it (offline, renamed)
            const missing = current && !list.some((m) => m.id === current);
            return (
              <label key={a.key} className="space-y-1.5 rounded-2xl border border-border p-4 text-sm">
                <span className="flex items-center justify-between font-semibold">
                  {a.name}
                  {saving === a.key && <Loader2 className="h-4 w-4 animate-spin" />}
                </span>
                <select
                  value={current}
                  onChange={(e) => choose(a.key, e.target.value)}
                  disabled={saving !== null}
                  dir="ltr"
                  className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
                >
                  <option value="">Default</option>
                  {missing && <option value={current}>{settings[a.key]?.model_label ?? current}</option>}
                  {list.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <span className="block text-xs text-muted-foreground">
                  {list.length ? a.hint : 'شغّل الجسر على جهازك لتظهر النماذج المتاحة'}
                </span>
              </label>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        يسري الاختيار على كل مستخدمي الوكيل، ويظهر اسم النموذج في أول سطر من كل رد في الطرفية.
      </p>
    </section>
  );
};

export default AgentModelsCard;
