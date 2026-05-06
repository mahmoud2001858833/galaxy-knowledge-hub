import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Sparkles, AlertTriangle, CheckCircle2, Pill, Brain, Headphones, Eye, Ear, ClipboardList, MessageCircle, Wand2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const INTERVENTION_CATEGORIES = [
  { key: 'medication',  ar: 'دواء',         icon: Pill },
  { key: 'behavioral',  ar: 'علاج سلوكي',   icon: Brain },
  { key: 'sensory',     ar: 'تدخّل حسّي',    icon: Headphones },
  { key: 'aac',         ar: 'تواصل بديل',   icon: MessageCircle },
  { key: 'visual_aid',  ar: 'وسيلة بصرية',  icon: Eye },
  { key: 'hearing_aid', ar: 'وسيلة سمعية',  icon: Ear },
  { key: 'educational', ar: 'إجراء تربوي',  icon: ClipboardList },
  { key: 'custom',      ar: 'مخصّص',        icon: Wand2 },
] as const;

type CatItem = {
  id: string; category: string; condition_keys: string[];
  name_ar: string; name_en?: string; short_ar?: string;
  default_params: Record<string, any>; mechanism_ar?: string;
  contraindications_ar: string[]; evidence_level?: string;
};

interface Props {
  sessionId: string;
  caseCategory: string;
  onApplied?: () => void;
}

const InterventionTryPanel: React.FC<Props> = ({ sessionId, caseCategory, onApplied }) => {
  const [cat, setCat] = useState<string>('medication');
  const [items, setItems] = useState<CatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CatItem | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [params, setParams] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [trialId, setTrialId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [search, setSearch] = useState('');

  const loadItems = async () => {
    if (cat === 'custom') { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('clinical_interventions_catalog')
      .select('*')
      .eq('category', cat)
      .contains('condition_keys', [caseCategory])
      .order('name_ar')
      .limit(40);
    setItems((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { loadItems(); setSelected(null); setResult(null); setTrialId(null); }, [cat, caseCategory]);

  useEffect(() => {
    if (selected) {
      const p: Record<string, string> = {};
      Object.entries(selected.default_params || {}).forEach(([k, v]) => { p[k] = String(v); });
      setParams(p);
    } else { setParams({}); }
  }, [selected]);

  const tryNow = async (apply = false) => {
    if (cat !== 'custom' && !selected) { toast.error('اختر عنصراً'); return; }
    if (cat === 'custom' && !customLabel.trim()) { toast.error('اكتب اسم التدخّل'); return; }
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('clinical-intervention-trial', {
        body: {
          sessionId,
          interventionId: selected?.id,
          customLabel: cat === 'custom' ? customLabel : undefined,
          category: cat,
          params,
          apply,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      setTrialId(data.trial?.id || null);
      if (apply) { toast.success('تم اعتماد التدخّل في الجلسة'); onApplied?.(); }
    } catch (e: any) {
      const m = e?.message ?? 'تعذّر التنفيذ';
      if (m.includes('429')) toast.error('تم تجاوز حد الطلبات، حاول بعد قليل');
      else if (m.includes('402')) toast.error('انتهى رصيد AI');
      else toast.error(m);
    } finally { setRunning(false); }
  };

  const applyCurrent = async () => {
    if (!result) return;
    setApplying(true);
    await tryNow(true);
    setApplying(false);
  };

  const cats = useMemo(() => INTERVENTION_CATEGORIES, []);

  return (
    <div className="space-y-3" dir="rtl">
      {/* Categories */}
      <div className="flex flex-wrap gap-1">
        {cats.map((c) => {
          const Icon = c.icon;
          const active = cat === c.key;
          return (
            <button key={c.key} onClick={() => setCat(c.key)}
              className={`px-2.5 py-1.5 rounded-full text-xs flex items-center gap-1 border ${active ? 'bg-[hsl(var(--damij-primary))] text-white border-transparent' : 'bg-white hover:bg-slate-50'}`}>
              <Icon className="w-3.5 h-3.5" /> {c.ar}
            </button>
          );
        })}
      </div>

      {/* Catalog list / custom input */}
      {cat === 'custom' ? (
        <div className="p-3 rounded-xl border bg-white">
          <label className="text-xs font-bold">اكتب أي تدخّل تريد تجربته</label>
          <input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="مثال: استخدام بطاقات PECS لمدة 15 دقيقة"
            className="mt-1 w-full px-3 py-2 rounded-lg border text-sm" />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <ParamInput label="الجرعة/الشدة" value={params.dose || ''} onChange={(v) => setParams({ ...params, dose: v })} />
            <ParamInput label="التكرار" value={params.frequency || ''} onChange={(v) => setParams({ ...params, frequency: v })} />
            <ParamInput label="المدة" value={params.duration || ''} onChange={(v) => setParams({ ...params, duration: v })} />
            <ParamInput label="ملاحظة" value={params.note || ''} onChange={(v) => setParams({ ...params, note: v })} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الكتالوج…"
              className="w-full pr-7 pl-3 py-1.5 rounded-lg border bg-white text-xs" />
          </div>
          <div className="rounded-xl border bg-white max-h-64 overflow-y-auto">
            {loading && <div className="p-4 text-center text-sm text-slate-500"><Loader2 className="inline w-4 h-4 animate-spin" /> تحميل…</div>}
            {!loading && items.filter(it => !search || it.name_ar.includes(search) || (it.short_ar || '').includes(search) || (it.name_en || '').toLowerCase().includes(search.toLowerCase())).length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                لا توجد عناصر مطابقة. جرّب بحثاً مختلفاً أو استخدم "مخصّص".
              </div>
            )}
            {items.filter(it => !search || it.name_ar.includes(search) || (it.short_ar || '').includes(search) || (it.name_en || '').toLowerCase().includes(search.toLowerCase())).map((it) => (
              <button key={it.id} onClick={() => setSelected(it)}
                className={`w-full text-right p-2.5 border-b last:border-0 hover:bg-slate-50 ${selected?.id === it.id ? 'bg-sky-50' : ''}`}>
                <div className="text-sm font-bold">{it.name_ar} {it.evidence_level && <span className="text-[10px] text-emerald-600 mr-1">[{it.evidence_level}]</span>}</div>
                {it.short_ar && <div className="text-xs text-slate-500 line-clamp-2">{it.short_ar}</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected params */}
      {selected && (
        <div className="p-3 rounded-xl border bg-white">
          <div className="text-sm font-bold mb-2">{selected.name_ar}</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(selected.default_params || {}).length === 0 ? (
              <ParamInput label="ملاحظة" value={params.note || ''} onChange={(v) => setParams({ ...params, note: v })} />
            ) : (
              Object.entries(selected.default_params || {}).map(([k]) => (
                <ParamInput key={k} label={k} value={params[k] || ''} onChange={(v) => setParams({ ...params, [k]: v })} />
              ))
            )}
          </div>
          {selected.contraindications_ar?.length > 0 && (
            <div className="mt-2 text-[11px] text-rose-600">⚠️ موانع: {selected.contraindications_ar.join('، ')}</div>
          )}
        </div>
      )}

      {/* Action */}
      <button onClick={() => tryNow(false)} disabled={running}
        className="w-full py-2.5 rounded-xl bg-[hsl(var(--damij-accent-2))] text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
        {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        جرّب الآن وشاهد النتيجة
      </button>

      <div className="text-[10px] text-center text-slate-400">محاكاة تعليمية — ليست وصفة طبية أو علاجية حقيقية</div>

      {/* Result */}
      {result && (
        <div className="p-3 rounded-2xl border bg-gradient-to-b from-emerald-50/40 to-white space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs text-slate-500">درجة المناسبة</div>
              <div className="text-2xl font-extrabold text-[hsl(var(--damij-primary))]">{result.success_score ?? 0}%</div>
            </div>
            <div className="text-xs text-slate-600 max-w-[60%]">
              <div className="font-bold mb-0.5">🧒 المريض:</div>
              <div className="line-clamp-3">{result.patient_say_ar}</div>
            </div>
          </div>

          {result.behavior_change_ar && (
            <div className="text-xs"><span className="font-bold">السلوك الملاحظ: </span>{result.behavior_change_ar}</div>
          )}

          {/* Immediate metrics */}
          <div className="grid grid-cols-3 gap-2">
            <Bar label="الانتباه" v={result.immediate_metrics?.attention} color="emerald" />
            <Bar label="القلق" v={result.immediate_metrics?.anxiety} color="rose" />
            <Bar label="التقدّم" v={result.immediate_metrics?.progress} color="sky" />
          </div>

          {/* Timeline */}
          {Array.isArray(result.timeline) && result.timeline.length > 0 && (
            <div>
              <div className="text-xs font-bold mb-1">📈 الخط الزمني المتوقَّع</div>
              <div className="grid grid-cols-4 gap-1 text-[10px] text-center">
                {result.timeline.map((t: any, i: number) => (
                  <div key={i} className="p-1.5 rounded-lg bg-white border">
                    <div className="font-bold">{t.t}</div>
                    <div className="text-emerald-600">⚡{t.attention}</div>
                    <div className="text-rose-600">😟{t.anxiety}</div>
                    <div className="text-sky-600">📈{t.progress}</div>
                    <div className="mt-1 text-slate-500 line-clamp-2">{t.symptoms_ar}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.safety_warnings_ar?.length > 0 && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs">
              <div className="font-bold text-rose-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> تحذيرات أمان</div>
              <ul className="list-disc pr-4 mt-1 text-rose-700">
                {result.safety_warnings_ar.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          {result.side_effects_ar?.length > 0 && (
            <div className="text-xs"><span className="font-bold">آثار جانبية محتملة: </span>{result.side_effects_ar.join('، ')}</div>
          )}

          {result.clinical_explanation_ar && (
            <div className="text-xs p-2 rounded-lg bg-slate-50 border">
              <span className="font-bold">🧠 تفسير سريري: </span>{result.clinical_explanation_ar}
            </div>
          )}

          {result.references_ar?.length > 0 && (
            <div className="text-[10px] text-slate-500">📚 {result.references_ar.join(' • ')}</div>
          )}

          <button onClick={applyCurrent} disabled={applying || running}
            className="w-full py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            اعتمد كحدث في الجلسة
          </button>
        </div>
      )}
    </div>
  );
};

const ParamInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <label className="text-[11px]">
    <div className="text-slate-500 mb-0.5">{label}</div>
    <input value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1.5 rounded-md border text-xs" />
  </label>
);

const Bar: React.FC<{ label: string; v?: number; color: string }> = ({ label, v, color }) => {
  const map: Record<string, string> = { emerald: 'bg-emerald-500', rose: 'bg-rose-500', sky: 'bg-sky-500' };
  const val = Number(v ?? 0);
  return (
    <div className="text-[11px]">
      <div className="flex justify-between"><span>{label}</span><span className="font-bold">{val}</span></div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${map[color]}`} style={{ width: `${Math.max(0, Math.min(100, val))}%` }} />
      </div>
    </div>
  );
};

export default InterventionTryPanel;
