import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowRight, Play, BookOpen, ClipboardList, Pill, Stethoscope, Brain, Headphones, MessageCircle, Eye, Ear, BookMarked } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  ClinicalCase, ClinicalProtocol, CATEGORY_LABEL, SEVERITY_LABEL,
  CATEGORY_EMOJI, CATEGORY_THEME, caseAvatarFromName,
} from '@/features/clinical/types';

interface DeviceLite { id: string; key: string; name_ar: string; category: string; description_ar?: string; icon?: string; applicable_specialties: string[]; }
interface CatalogItem { id: string; category: string; name_ar: string; short_ar?: string; condition_keys?: string[]; evidence_level?: string; }

const RESOURCE_GROUPS: { key: string; ar: string; icon: any; tone: string }[] = [
  { key: 'medication',  ar: 'الأدوية الموصى بها',   icon: Pill,           tone: 'from-rose-50 to-white border-rose-200/60' },
  { key: 'behavioral',  ar: 'العلاج السلوكي',       icon: Brain,          tone: 'from-purple-50 to-white border-purple-200/60' },
  { key: 'sensory',     ar: 'التدخّلات الحسّية',     icon: Headphones,     tone: 'from-cyan-50 to-white border-cyan-200/60' },
  { key: 'aac',         ar: 'التواصل البديل',       icon: MessageCircle,  tone: 'from-emerald-50 to-white border-emerald-200/60' },
  { key: 'visual_aid',  ar: 'الوسائل البصرية',      icon: Eye,            tone: 'from-indigo-50 to-white border-indigo-200/60' },
  { key: 'hearing_aid', ar: 'الوسائل السمعية',      icon: Ear,            tone: 'from-sky-50 to-white border-sky-200/60' },
  { key: 'educational', ar: 'الإجراءات التربوية',   icon: BookMarked,     tone: 'from-amber-50 to-white border-amber-200/60' },
];

const ClinicalCaseDetail: React.FC = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [c, setC] = useState<ClinicalCase | null>(null);
  const [protocols, setProtocols] = useState<ClinicalProtocol[]>([]);
  const [devices, setDevices] = useState<DeviceLite[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => { (async () => {
    if (!caseId) return;
    const { data: cd } = await supabase.from('clinical_cases').select('*').eq('id', caseId).maybeSingle();
    setC(cd as any);
    if (cd) {
      const cat = (cd as any).category;
      const [{ data: ps }, { data: ds }, { data: cat_items }] = await Promise.all([
        supabase.from('clinical_protocols').select('*').eq('category', cat).order('name_ar'),
        supabase.from('clinical_devices').select('id,key,name_ar,category,description_ar,icon,applicable_specialties').order('name_ar'),
        supabase.from('clinical_interventions_catalog').select('id,category,name_ar,short_ar,condition_keys,evidence_level')
          .contains('condition_keys', [cat]).order('name_ar').limit(120),
      ]);
      setProtocols((ps as any) || []);
      const filtered = ((ds as any) || []).filter((d: DeviceLite) =>
        !d.applicable_specialties?.length || d.applicable_specialties.includes(cat)
      );
      setDevices(filtered.length ? filtered : ((ds as any) || []));
      setCatalog((cat_items as any) || []);
    }
    setLoading(false);
  })(); }, [caseId]);

  const startSession = async (protocolId: string) => {
    setStarting(protocolId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('سجّل الدخول أولاً'); navigate('/auth'); return; }
      const { data, error } = await supabase.from('clinical_sessions').insert({
        user_id: user.id, case_id: caseId!, protocol_id: protocolId,
        vitals_state: (c as any)?.vitals_initial || {},
      } as any).select('id').single();
      if (error) throw error;
      navigate(`/damij/clinical/lab/${data.id}`);
    } catch (e: any) { toast.error(e?.message ?? 'تعذّر بدء الجلسة'); }
    finally { setStarting(null); }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;
  if (!c) return <div className="text-center pt-20">الحالة غير موجودة</div>;

  const theme = CATEGORY_THEME[c.category] || CATEGORY_THEME.internal;
  const avatar = caseAvatarFromName(c.name_ar + (c as any).code, (c as any).gender);
  const itemsByCat = (k: string) => catalog.filter(x => x.category === k);

  return (
    <div className="px-6 pt-8 pb-16 max-w-6xl mx-auto" dir="rtl">
      <button onClick={() => navigate('/damij/clinical/cases')}
        className="px-3 py-1.5 mb-4 rounded-lg bg-white border text-sm flex items-center gap-1 hover:bg-slate-50">
        <ArrowRight className="w-4 h-4" /> الحالات
      </button>

      {/* Hero */}
      <header className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${theme.from} ${theme.to} mb-8`}>
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className={`w-28 h-28 rounded-3xl bg-white shadow-xl ring-4 ${theme.ring} flex items-center justify-center text-6xl shrink-0`}>
            {avatar}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-xs px-3 py-1 rounded-full bg-white border font-bold ${theme.text}`}>
                {CATEGORY_EMOJI[c.category]} {CATEGORY_LABEL[c.category]}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">{SEVERITY_LABEL[c.severity]}</span>
              <span className="text-xs px-3 py-1 rounded-full bg-white border">{c.age_years} سنة • {c.gender}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">{c.name_ar}</h1>
            <p className="text-slate-700 leading-relaxed">{c.summary_ar}</p>
          </div>
        </div>
        {protocols.length > 0 && (
          <div className="px-6 sm:px-8 pb-6">
            <button
              onClick={() => startSession(protocols[0].id)} disabled={!!starting}
              className="px-6 py-3 rounded-2xl bg-[hsl(var(--damij-primary))] text-white text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-60 transition-all">
              {starting === protocols[0].id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              ابدأ الجلسة الآن — {protocols[0].name_ar}
            </button>
          </div>
        )}
      </header>

      {/* Background sections */}
      <section className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white border">
          <h3 className="font-bold flex items-center gap-2 mb-2 text-[hsl(var(--damij-primary))]"><BookOpen className="w-4 h-4" /> التاريخ المرضي</h3>
          <p className="text-sm text-slate-700 leading-relaxed">{c.history_ar}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border">
          <h3 className="font-bold flex items-center gap-2 mb-2 text-[hsl(var(--damij-primary))]"><ClipboardList className="w-4 h-4" /> العلامات الظاهرة</h3>
          <ul className="text-sm text-slate-700 list-disc pr-4 space-y-1">
            {(c.presenting_signs_ar || []).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        {c.sensory_profile && Object.keys(c.sensory_profile).length > 0 && (
          <div className="p-5 rounded-2xl bg-white border md:col-span-2">
            <h3 className="font-bold mb-3 text-[hsl(var(--damij-primary))]">الملف الحسّي</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {Object.entries(c.sensory_profile).map(([k, v]) => (
                <div key={k} className="p-2.5 rounded-lg bg-slate-50 border">
                  <div className="text-xs text-slate-500">{k}</div>
                  <div className="font-bold">{v as string}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Current medications */}
      <section className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-white border border-rose-200/60">
        <h3 className="font-bold flex items-center gap-2 mb-3 text-rose-700">
          <Pill className="w-4 h-4" /> الأدوية الحالية للمريض
        </h3>
        {(c.current_medications && c.current_medications.length > 0) ? (
          <div className="flex flex-wrap gap-2">
            {c.current_medications.map((m, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-white border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-1">💊 {m}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">لا أدوية مسجلة لهذا المريض حالياً.</p>
        )}
      </section>

      {/* All resource groups (medications recommended, behavioral, sensory, aac, visual, hearing, educational) */}
      <h2 className="text-xl font-bold text-[hsl(var(--damij-primary))] mb-3">الموارد العلاجية الجاهزة لهذه الحالة</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {RESOURCE_GROUPS.map(g => {
          const items = itemsByCat(g.key);
          const Icon = g.icon;
          return (
            <div key={g.key} className={`p-4 rounded-2xl bg-gradient-to-b ${g.tone} border`}>
              <h3 className="font-bold flex items-center gap-2 mb-3 text-[hsl(var(--damij-primary))]">
                <Icon className="w-4 h-4" /> {g.ar}
                <span className="text-[10px] mr-auto text-slate-500 font-normal">{items.length}</span>
              </h3>
              {items.length === 0 ? (
                <p className="text-xs text-slate-500">لا عناصر مخصّصة بعد لهذه الفئة. يمكنك تجربة أي تدخّل من نوع "{g.ar}" داخل الجلسة.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {items.slice(0, 8).map(it => (
                    <span key={it.id} className="px-2.5 py-1 rounded-full bg-white border text-[11px] font-medium text-slate-700">
                      {it.name_ar}
                      {it.evidence_level && <span className="text-[9px] text-emerald-600 mr-1">[{it.evidence_level}]</span>}
                    </span>
                  ))}
                  {items.length > 8 && <span className="text-[10px] text-slate-500 self-center">+{items.length - 8}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Devices */}
      <section className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-200/60">
        <h3 className="font-bold flex items-center gap-2 mb-3 text-sky-700">
          <Stethoscope className="w-4 h-4" /> الأجهزة الطبية المتاحة لهذه الحالة
          <span className="text-[10px] mr-auto text-slate-500 font-normal">{devices.length}</span>
        </h3>
        {devices.length === 0 ? (
          <p className="text-sm text-slate-500">لا أجهزة مرتبطة بهذه الفئة بعد.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {devices.map(d => (
              <div key={d.id} className="p-3 rounded-xl bg-white border hover:border-sky-300 hover:shadow-md transition group">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-xl mb-2 group-hover:scale-105 transition">
                  {d.icon || '🩺'}
                </div>
                <div className="text-xs font-bold text-slate-800 line-clamp-1">{d.name_ar}</div>
                <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{d.description_ar}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Protocols */}
      <h2 className="text-xl font-bold text-[hsl(var(--damij-primary))] mb-3">اختر بروتوكولاً لبدء الجلسة</h2>
      {protocols.length === 0 ? (
        <div className="text-center text-slate-500 py-10 border-2 border-dashed rounded-2xl">لا بروتوكولات لهذه الفئة بعد.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {protocols.map(p => (
            <div key={p.id} className="p-4 rounded-2xl bg-white border flex flex-col hover:border-[hsl(var(--damij-accent-2))]/40 hover:shadow-md transition">
              <div className="font-bold text-[hsl(var(--damij-primary))]">{p.name_ar}</div>
              <div className="text-xs text-slate-500 mb-1">{p.short_ar}</div>
              <p className="text-sm text-slate-700 flex-1">{p.goal_ar}</p>
              <div className="text-xs text-slate-500 mt-2">{(p.steps || []).length} خطوات</div>
              <button onClick={() => startSession(p.id)} disabled={!!starting}
                className="mt-3 px-4 py-2 rounded-xl bg-[hsl(var(--damij-accent-2))] text-white text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-60">
                {starting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                ابدأ التجربة
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ClinicalCaseDetail;
