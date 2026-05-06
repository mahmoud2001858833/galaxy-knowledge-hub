import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Sparkles, CheckCircle2, Search, Stethoscope, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import InteractiveECG from './InteractiveECG';
import InteractiveAED from './InteractiveAED';
import InteractiveStethoscope from './InteractiveStethoscope';

interface Device {
  id: string; key: string; name_ar: string; name_en?: string; category: string;
  ui_kind: string; applicable_specialties: string[];
  default_params: Record<string, any>; description_ar?: string; safety_ar: string[];
}

interface Props { sessionId: string; caseCategory: string; onApplied?: () => void; }

const DeviceLauncher: React.FC<Props> = ({ sessionId, caseCategory, onApplied }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Device | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('clinical_devices').select('*').order('name_ar');
      setDevices((data as any) || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (selected) {
      const p: Record<string, string> = {};
      Object.entries(selected.default_params || {}).forEach(([k, v]) => { p[k] = String(v); });
      setParams(p);
      setResult(null);
    }
  }, [selected]);

  const filtered = useMemo(() => {
    return devices.filter(d => {
      const matchSpec = showAll || d.applicable_specialties.length === 0 || d.applicable_specialties.includes(caseCategory);
      const matchSearch = !search || d.name_ar.includes(search) || (d.name_en || '').toLowerCase().includes(search.toLowerCase());
      return matchSpec && matchSearch;
    });
  }, [devices, search, caseCategory, showAll]);

  const useDevice = async (apply = false) => {
    if (!selected) return;
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('clinical-device-use', {
        body: { sessionId, deviceKey: selected.key, params, apply },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      if (apply) { toast.success('تم اعتماد القراءة في الجلسة'); onApplied?.(); }
    } catch (e: any) {
      const m = e?.message ?? 'خطأ';
      if (m.includes('429')) toast.error('تم تجاوز الحد، حاول لاحقاً');
      else if (m.includes('402')) toast.error('انتهى رصيد AI');
      else toast.error(m);
    } finally { setRunning(false); }
  };

  // Determine ECG hints from AI result waveform_hint
  const ecgRhythm = useMemo<any>(() => {
    const h = (result?.waveform_hint || '').toLowerCase();
    if (h.includes('asystole')) return 'asystole';
    if (h.includes('vf') || h.includes('fibrillation') && h.includes('vent')) return 'vf';
    if (h.includes('vt') || (h.includes('ventricular') && h.includes('tachy'))) return 'vt';
    if (h.includes('afib') || h.includes('atrial fib')) return 'afib';
    if (h.includes('tachy')) return 'sinus_tachy';
    if (h.includes('brady')) return 'sinus_brady';
    return 'sinus';
  }, [result]);
  const ecgHr = result?.vitals?.hr || 75;

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

      {/* Device list */}
      <div className="rounded-xl border bg-white max-h-56 overflow-y-auto">
        {loading && <div className="p-4 text-center text-xs"><Loader2 className="inline w-4 h-4 animate-spin" /></div>}
        {!loading && filtered.length === 0 && <div className="p-4 text-center text-xs text-slate-500">لا أجهزة مطابقة. فعّل "عرض الكل".</div>}
        <div className="grid grid-cols-2 gap-1 p-1">
          {filtered.map(d => (
            <button key={d.id} onClick={() => setSelected(d)}
              className={`text-right p-2 rounded-lg border hover:bg-sky-50 ${selected?.id === d.id ? 'bg-sky-100 border-sky-300' : 'bg-white'}`}>
              <div className="text-xs font-bold flex items-center gap-1"><Stethoscope className="w-3 h-3" />{d.name_ar}</div>
              <div className="text-[10px] text-slate-500 line-clamp-1">{d.description_ar}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected device */}
      {selected && (
        <div className="p-3 rounded-2xl border bg-white space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">{selected.name_ar}</div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100">{selected.category}</span>
          </div>
          {selected.description_ar && <div className="text-xs text-slate-600">{selected.description_ar}</div>}

          {/* Interactive widgets */}
          {selected.ui_kind === 'interactive_ecg' && (
            <div className="space-y-1">
              <InteractiveECG hr={ecgHr} rhythm={ecgRhythm} />
              <div className="text-[11px] text-center text-slate-600">{result?.waveform_hint || 'اضغط "استخدم الجهاز" لتوليد إيقاع المريض'}</div>
            </div>
          )}
          {selected.ui_kind === 'interactive_aed' && (
            <InteractiveAED rhythm="unknown" onShock={() => useDevice(true)} />
          )}
          {selected.ui_kind === 'interactive_stetho' && <InteractiveStethoscope />}

          {/* Params */}
          {Object.keys(selected.default_params || {}).length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(selected.default_params || {}).map((k) => (
                <label key={k} className="text-[11px]">
                  <div className="text-slate-500 mb-0.5">{k}</div>
                  <input value={params[k] || ''} onChange={(e) => setParams({ ...params, [k]: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-md border text-xs" />
                </label>
              ))}
            </div>
          )}

          {selected.safety_ar?.length > 0 && (
            <div className="text-[11px] p-1.5 rounded bg-amber-50 border border-amber-200 flex gap-1 text-amber-700">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{selected.safety_ar.join('، ')}</span>
            </div>
          )}

          <button onClick={() => useDevice(false)} disabled={running}
            className="w-full py-2 rounded-xl bg-[hsl(var(--damij-accent-2))] text-white text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-50">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} استخدم الجهاز
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="p-3 rounded-2xl border bg-gradient-to-b from-sky-50/40 to-white space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-slate-500">دقة الإجراء</div>
              <div className="text-2xl font-extrabold text-[hsl(var(--damij-primary))]">{result.success_score ?? 0}%</div>
            </div>
            <div className="text-xs max-w-[60%] text-slate-700">
              <div className="font-bold mb-0.5">📟 القراءة:</div>
              <div>{result.reading_ar}</div>
            </div>
          </div>
          {result.vitals && (
            <div className="grid grid-cols-4 gap-1 text-[10px] text-center">
              {Object.entries(result.vitals).filter(([_, v]) => v != null).map(([k, v]) => (
                <div key={k} className="p-1 rounded bg-white border">
                  <div className="text-slate-500">{k}</div>
                  <div className="font-bold">{String(v)}</div>
                </div>
              ))}
            </div>
          )}
          {result.interpretation_ar && (
            <div className="text-xs p-2 rounded bg-slate-50 border"><b>تفسير: </b>{result.interpretation_ar}</div>
          )}
          {result.abnormal_findings_ar?.length > 0 && (
            <div className="text-[11px] text-rose-700"><b>نتائج شاذة: </b>{result.abnormal_findings_ar.join('، ')}</div>
          )}
          {result.recommended_next_steps_ar?.length > 0 && (
            <div className="text-[11px] text-emerald-700"><b>الخطوات التالية: </b>{result.recommended_next_steps_ar.join(' • ')}</div>
          )}
          <button onClick={() => useDevice(true)} disabled={running}
            className="w-full py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-50">
            <CheckCircle2 className="w-4 h-4" /> اعتمد كحدث في الجلسة
          </button>
        </div>
      )}
      <div className="text-[10px] text-center text-slate-400">محاكاة تعليمية — ليست بديلاً عن الفحص أو الجهاز الحقيقي</div>
    </div>
  );
};

export default DeviceLauncher;
