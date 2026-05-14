import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DEVICE_REGISTRY, type CaseContext } from './registry';
import InteractiveECG from './InteractiveECG';
import InteractiveStethoscope from './InteractiveStethoscope';
import { SimBP, SimPulseOx, SimThermo, SimGCS, WoundControlKit } from './simulators';
import HelpTooltip from '../HelpTooltip';

interface Device {
  id: string; key: string; name_ar: string; name_en?: string; category: string;
  ui_kind: string; applicable_specialties: string[];
  default_params: Record<string, any>; description_ar?: string; safety_ar: string[]; icon?: string;
}

interface Props {
  sessionId: string;
  caseCategory: string;
  caseContext?: CaseContext;
  onApplied?: () => void;
}

// تصنيف بصري للأجهزة (لون + تسمية)
const CATEGORY_TONE: Record<string, { from: string; ring: string; text: string; ar: string }> = {
  vitals:      { from: 'from-blue-500/15',    ring: 'ring-blue-200',    text: 'text-blue-700',    ar: 'علامات حيوية' },
  cardiac:     { from: 'from-rose-500/15',    ring: 'ring-rose-200',    text: 'text-rose-700',    ar: 'قلب' },
  respiratory: { from: 'from-cyan-500/15',    ring: 'ring-cyan-200',    text: 'text-cyan-700',    ar: 'تنفّس' },
  neuro:       { from: 'from-purple-500/15',  ring: 'ring-purple-200',  text: 'text-purple-700',  ar: 'أعصاب' },
  imaging:     { from: 'from-slate-500/15',   ring: 'ring-slate-200',   text: 'text-slate-700',   ar: 'تصوير' },
  lab:         { from: 'from-amber-500/15',   ring: 'ring-amber-200',   text: 'text-amber-700',   ar: 'مختبر' },
  ortho:       { from: 'from-stone-500/15',   ring: 'ring-stone-200',   text: 'text-stone-700',   ar: 'عظام' },
  ent:         { from: 'from-teal-500/15',    ring: 'ring-teal-200',    text: 'text-teal-700',    ar: 'أنف وأذن' },
  ophthalmo:   { from: 'from-indigo-500/15',  ring: 'ring-indigo-200',  text: 'text-indigo-700',  ar: 'عيون' },
  emergency:   { from: 'from-red-500/15',     ring: 'ring-red-200',     text: 'text-red-700',     ar: 'طوارئ' },
  other:       { from: 'from-slate-400/15',   ring: 'ring-slate-200',   text: 'text-slate-600',   ar: 'أجهزة' },
};
const toneOf = (cat: string) => CATEGORY_TONE[cat] || CATEGORY_TONE.other;

const DeviceLauncher: React.FC<Props> = ({ sessionId, caseCategory, caseContext, onApplied }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Device | null>(null);

  // دمج vitals_state الحيّ مع caseContext لتعكس الأجهزة آخر القراءات
  const ctx: CaseContext = useMemo(() => ({
    ...(caseContext || { category: caseCategory }),
    vitals: { ...(caseContext?.vitals || {}), ...((caseContext as any)?.vitals_state || {}) },
  }), [caseContext, caseCategory]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('clinical_devices').select('*').order('name_ar');
      const all = (data as any) || [];
      // اعرض فقط الأجهزة المتاحة لهذه الحالة
      const filtered = all.filter((d: Device) =>
        !d.applicable_specialties?.length || d.applicable_specialties.includes(caseCategory)
      );
      setDevices(filtered.length ? filtered : all);
      setLoading(false);
    })();
  }, [caseCategory]);

  const filtered = useMemo(() => devices.filter(d =>
    !search || d.name_ar.includes(search) || (d.name_en || '').toLowerCase().includes(search.toLowerCase())
  ), [devices, search]);

  // مجموعة حسب category
  const grouped = useMemo(() => {
    const g: Record<string, Device[]> = {};
    filtered.forEach(d => { const k = d.category || 'other'; (g[k] ||= []).push(d); });
    return g;
  }, [filtered]);

  const recordUse = async (deviceKey: string, deviceName: string, reading: { reading_ar: string; vitals?: any; success_score?: number }) => {
    try {
      const { data: s } = await supabase.from('clinical_sessions')
        .select('attention,anxiety,progress,started_at,vitals_state').eq('id', sessionId).maybeSingle();
      const t_ms = s?.started_at ? Date.now() - new Date(s.started_at).getTime() : 0;
      const newVitals = { ...((s as any)?.vitals_state || {}), ...(reading.vitals || {}) };
      await supabase.from('clinical_session_events').insert([
        { session_id: sessionId, t_ms, actor: 'student', event_type: 'device_use',
          payload: { action: `استخدم جهاز: ${deviceName}` },
          attention: s?.attention ?? 50, anxiety: s?.anxiety ?? 50, progress: s?.progress ?? 0 },
        { session_id: sessionId, t_ms: t_ms + 1, actor: 'system', event_type: 'clinical_note',
          payload: { note: reading.reading_ar, vitals: reading.vitals, score: reading.success_score ?? 80 },
          attention: s?.attention ?? 50, anxiety: s?.anxiety ?? 50, progress: Math.min(100, (s?.progress ?? 0) + 3) },
      ]);
      // حدّث vitals_state إن أعطى الجهاز قراءة جديدة
      if (reading.vitals && Object.keys(reading.vitals).length) {
        await supabase.from('clinical_sessions').update({ vitals_state: newVitals } as any).eq('id', sessionId);
      }
      toast.success('✓ تم تسجيل القراءة في الجلسة');
      onApplied?.();
    } catch (e: any) {
      toast.error(e?.message || 'تعذّر تسجيل الحدث');
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن جهاز…"
          className="w-full pr-10 pl-3 py-2 rounded-xl border bg-white text-sm focus:ring-2 focus:ring-sky-200" />
      </div>

      {/* Always-on simulators */}
      <AlwaysOnSimulators ctx={ctx} onApply={(name, r) => recordUse(name, name, r)} />

      {loading ? (
        <div className="p-6 text-center text-xs"><Loader2 className="inline w-4 h-4 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 border rounded-2xl bg-white">لا أجهزة مطابقة.</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([catKey, items]) => {
            const tone = toneOf(catKey);
            return (
              <div key={catKey}>
                <div className={`flex items-center gap-2 mb-2`}>
                  <span className={`text-xs px-2.5 py-1 rounded-full bg-white border ${tone.text} font-bold`}>{tone.ar}</span>
                  <span className="text-[10px] text-slate-400">{items.length} جهاز</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {items.map(d => (
                    <button key={d.id} onClick={() => setSelected(d)}
                      className={`relative text-right p-3 rounded-2xl bg-white border hover:shadow-md transition group ${selected?.id === d.id ? `ring-2 ${tone.ring} border-transparent` : 'border-slate-200'}`}>
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tone.from} to-white border flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition`}>
                        {d.icon || '🩺'}
                      </div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">{d.name_ar}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{d.description_ar}</div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected device */}
      {selected && (
        <DeviceRenderer device={selected} ctx={ctx} onApply={(r) => recordUse(selected.key, selected.name_ar, r)} />
      )}
      <div className="text-[10px] text-center text-slate-400">محاكاة تعليمية — ليست بديلاً عن الفحص أو الجهاز الحقيقي</div>
    </div>
  );
};

const DeviceRenderer: React.FC<{ device: any; ctx: CaseContext; onApply: (r: any) => void }> = ({ device, ctx, onApply }) => {
  const Comp = DEVICE_REGISTRY[device.key];
  if (Comp) {
    if (device.key === 'ecg_12lead') {
      const rhythm = ctx.category==='cardiology' && (ctx.severity==='high'||ctx.severity==='critical') ? 'sinus_tachy' : 'sinus';
      return <div className="p-3 rounded-2xl border bg-white space-y-2">
        <Comp hr={ctx.vitals?.hr ?? 75} rhythm={rhythm as any} />
        <button onClick={() => onApply({ reading_ar: `ECG: ${rhythm} عند ${ctx.vitals?.hr ?? 75} bpm`, vitals: { hr: ctx.vitals?.hr ?? 75 } })} className="w-full py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-xs font-bold">✓ اعتمد القراءة كحدث</button>
      </div>;
    }
    if (device.key === 'aed') {
      return <div className="p-3 rounded-2xl border bg-white"><Comp rhythm="unknown" onShock={() => onApply({ reading_ar: 'تم تطبيق صدمة AED', success_score: 90 })} /></div>;
    }
    if (device.key === 'stethoscope') {
      const sound = ctx.category==='pulmonology' ? 'wheeze' : ctx.category==='cardiology' ? 'murmur' : 'normal_heart';
      return <div className="p-3 rounded-2xl border bg-white space-y-2">
        <Comp defaultSound={sound as any} />
        <button onClick={() => onApply({ reading_ar: `سمعت: ${sound}` })} className="w-full py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-xs font-bold">✓ اعتمد القراءة كحدث</button>
      </div>;
    }
    return <Comp ctx={ctx} onApply={onApply} />;
  }
  return (
    <div className="p-3 rounded-2xl border bg-white space-y-2">
      <div className="text-sm font-bold">{device.icon || '🩺'} {device.name_ar}</div>
      <div className="text-xs text-slate-600">{device.description_ar}</div>
      <div className="p-2 bg-slate-50 rounded text-[11px]">قراءة افتراضية: ضمن المعدل الطبيعي للمريض. اعتمدها كحدث في الجلسة.</div>
      <button onClick={() => onApply({ reading_ar: `${device.name_ar}: قراءة طبيعية` })} className="w-full py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-xs font-bold">✓ اعتمد القراءة كحدث</button>
    </div>
  );
};

const AlwaysOnSimulators: React.FC<{ ctx: CaseContext; onApply: (name: string, r: any) => void }> = ({ ctx, onApply }) => {
  const cat = ctx.category;
  const isCardiac = /cardio|heart|قلب/i.test(cat);
  const isResp = /pulm|resp|lung|تنفس|رئة/i.test(cat);
  const isTrauma = /emergency|trauma|ortho/i.test(cat);
  const isNeuro = /neuro|psychiatry|autism|adhd/i.test(cat);
  const isPeds = /pediatric|طفل/i.test(cat);

  return (
    <div className="rounded-2xl border bg-gradient-to-b from-sky-50/60 to-white p-3 space-y-3">
      <div className="text-xs font-extrabold text-[hsl(var(--damij-primary))]">📡 محاكيات حيّة (تعكس آخر قراءات المريض لحظياً)</div>
      <div className="grid md:grid-cols-2 gap-2">
        {isCardiac && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold">📈 ECG</div>
            <InteractiveECG hr={ctx.vitals?.hr ?? 88} rhythm={ctx.severity==='high'||ctx.severity==='critical' ? 'sinus_tachy' : 'sinus'} />
          </div>
        )}
        {(isCardiac || isTrauma || isResp || isPeds) && <SimPulseOx ctx={ctx} onApply={(r) => onApply('Pulse Ox', r)} />}
        {(isCardiac || isTrauma) && <SimBP ctx={ctx} onApply={(r) => onApply('BP', r)} />}
        {isResp && <InteractiveStethoscope defaultSound="wheeze" />}
        {isCardiac && <InteractiveStethoscope defaultSound="murmur" />}
        {isTrauma && <WoundControlKit ctx={ctx} onApply={(r) => onApply('Wound Kit', r)} />}
        {isNeuro && <SimGCS ctx={ctx} onApply={(r) => onApply('GCS', r)} />}
        {isPeds && <SimThermo ctx={ctx} onApply={(r) => onApply('Thermo', r)} />}
      </div>
    </div>
  );
};

export default DeviceLauncher;
