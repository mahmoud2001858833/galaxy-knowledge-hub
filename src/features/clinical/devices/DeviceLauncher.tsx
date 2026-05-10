import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DEVICE_REGISTRY, type CaseContext } from './registry';
import InteractiveECG from './InteractiveECG';
import InteractiveStethoscope from './InteractiveStethoscope';
import { SimBP, SimPulseOx, SimThermo, SimGCS, WoundControlKit } from './simulators';

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

const DeviceLauncher: React.FC<Props> = ({ sessionId, caseCategory, caseContext, onApplied }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Device | null>(null);
  const [showAll, setShowAll] = useState(true);

  const ctx: CaseContext = caseContext || { category: caseCategory };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('clinical_devices').select('*').order('name_ar');
      setDevices((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => devices.filter(d => {
    const matchSpec = showAll || !d.applicable_specialties?.length || d.applicable_specialties.includes(caseCategory);
    const matchSearch = !search || d.name_ar.includes(search) || (d.name_en || '').toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  }), [devices, search, caseCategory, showAll]);

  // Persist a device-use event locally (no AI required)
  const recordUse = async (deviceKey: string, deviceName: string, reading: { reading_ar: string; vitals?: any; success_score?: number }) => {
    try {
      const { data: s } = await supabase.from('clinical_sessions').select('attention,anxiety,progress,started_at').eq('id', sessionId).maybeSingle();
      const t_ms = s?.started_at ? Date.now() - new Date(s.started_at).getTime() : 0;
      await supabase.from('clinical_session_events').insert([
        { session_id: sessionId, t_ms, actor: 'student', event_type: 'device_use',
          payload: { action: `استخدم جهاز: ${deviceName}` },
          attention: s?.attention ?? 50, anxiety: s?.anxiety ?? 50, progress: s?.progress ?? 0 },
        { session_id: sessionId, t_ms: t_ms + 1, actor: 'system', event_type: 'clinical_note',
          payload: { note: reading.reading_ar, vitals: reading.vitals, score: reading.success_score ?? 80 },
          attention: s?.attention ?? 50, anxiety: s?.anxiety ?? 50, progress: Math.min(100, (s?.progress ?? 0) + 3) },
      ]);
      toast.success('✓ تم تسجيل القراءة في الجلسة');
      onApplied?.();
    } catch (e: any) {
      toast.error(e?.message || 'تعذّر تسجيل الحدث');
    }
  };

  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن جهاز…"
            className="w-full pr-7 pl-3 py-1.5 rounded-lg border bg-white text-xs" />
        </div>
        <label className="text-[11px] flex items-center gap-1">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> عرض الكل
        </label>
      </div>

      {/* Always-on simulators */}
      <AlwaysOnSimulators ctx={ctx} onApply={(name, r) => recordUse(name, name, r)} />

      {/* Device grid */}
      <div className="rounded-xl border bg-white">
        {loading && <div className="p-4 text-center text-xs"><Loader2 className="inline w-4 h-4 animate-spin" /></div>}
        {!loading && filtered.length === 0 && <div className="p-4 text-center text-xs text-slate-500">لا أجهزة مطابقة. فعّل "عرض الكل".</div>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 p-1">
          {filtered.map(d => (
            <button key={d.id} onClick={() => setSelected(d)}
              className={`text-right p-2 rounded-lg border hover:bg-sky-50 hover:shadow transition ${selected?.id === d.id ? 'bg-sky-100 border-sky-300 ring-1 ring-sky-300' : 'bg-white'}`}>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span className="text-base leading-none">{d.icon || '🩺'}</span>
                <span className="line-clamp-1">{d.name_ar}</span>
              </div>
              <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{d.description_ar}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected device renders its own interactive simulator */}
      {selected && (
        <DeviceRenderer device={selected} ctx={ctx} onApply={(r) => recordUse(selected.key, selected.name_ar, r)} />
      )}
      <div className="text-[10px] text-center text-slate-400">محاكاة تعليمية — ليست بديلاً عن الفحص أو الجهاز الحقيقي</div>
    </div>
  );
};

// Renders the right component for the selected device, with safe fallback
const DeviceRenderer: React.FC<{ device: any; ctx: CaseContext; onApply: (r: any) => void }> = ({ device, ctx, onApply }) => {
  const Comp = DEVICE_REGISTRY[device.key];
  if (Comp) {
    // Built-in components (ECG/AED/Stetho) take their own props; sim components take ctx+onApply.
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
  // Generic fallback
  return (
    <div className="p-3 rounded-2xl border bg-white space-y-2">
      <div className="text-sm font-bold">{device.icon || '🩺'} {device.name_ar}</div>
      <div className="text-xs text-slate-600">{device.description_ar}</div>
      <div className="p-2 bg-slate-50 rounded text-[11px]">قراءة افتراضية: ضمن المعدل الطبيعي للمريض. اعتمدها كحدث في الجلسة.</div>
      <button onClick={() => onApply({ reading_ar: `${device.name_ar}: قراءة طبيعية` })} className="w-full py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-xs font-bold">✓ اعتمد القراءة كحدث</button>
    </div>
  );
};

// Always-on simulators tailored to specialty
const AlwaysOnSimulators: React.FC<{ ctx: CaseContext; onApply: (name: string, r: any) => void }> = ({ ctx, onApply }) => {
  const cat = ctx.category;
  const isCardiac = /cardio|heart|قلب/i.test(cat);
  const isResp = /pulm|resp|lung|تنفس|رئة/i.test(cat);
  const isTrauma = /emergency|trauma|ortho/i.test(cat);
  const isNeuro = /neuro|psychiatry|autism|adhd/i.test(cat);
  const isPeds = /pediatric|طفل/i.test(cat);

  return (
    <div className="rounded-2xl border bg-gradient-to-b from-sky-50/60 to-white p-3 space-y-3">
      <div className="text-xs font-extrabold text-[hsl(var(--damij-primary))]">📡 محاكيات مباشرة (تعمل دائماً حسب الحالة)</div>
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
