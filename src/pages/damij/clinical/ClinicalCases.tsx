import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, User, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  ClinicalCase, SEVERITY_LABEL, CATEGORY_LABEL, CATEGORY_EMOJI,
  CATEGORY_THEME, caseAvatarFromName,
} from '@/features/clinical/types';

const ClinicalCases: React.FC = () => {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => { (async () => {
    const { data } = await supabase.from('clinical_cases').select('*').order('category').limit(500);
    setCases((data as any) || []);
    setLoading(false);
  })(); }, []);

  const filtered = useMemo(() => cases.filter(c =>
    !q || `${c.name_ar} ${c.summary_ar} ${CATEGORY_LABEL[c.category]}`.toLowerCase().includes(q.toLowerCase())
  ), [cases, q]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  return (
    <div className="px-6 pt-10 pb-16 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">مكتبة الحالات الافتراضية</h1>
      <p className="text-slate-600 mb-6">{filtered.length} حالة جاهزة من أصل {cases.length} • كل حالة بهوية بصرية مميّزة وموارد كاملة</p>

      <div className="relative mb-8 max-w-md">
        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث بالاسم أو التشخيص…"
          className="w-full pr-10 pl-3 py-2.5 rounded-xl border bg-white text-sm shadow-sm focus:ring-2 focus:ring-[hsl(var(--damij-accent-2))]/30" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-16 border-2 border-dashed rounded-2xl">
          {cases.length === 0 ? 'لا توجد حالات بعد.' : 'لا حالات مطابقة لبحثك.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => {
            const theme = CATEGORY_THEME[c.category] || CATEGORY_THEME.internal;
            const avatar = caseAvatarFromName(c.name_ar + c.code);
            return (
              <Link key={c.id} to={`/damij/clinical/case/${c.id}`}
                className={`group relative overflow-hidden rounded-3xl bg-white border border-slate-200 hover:border-[hsl(var(--damij-accent-2))]/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}>
                <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${theme.from} ${theme.to}`} />
                <div className="relative p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-white shadow-md ring-2 ${theme.ring} flex items-center justify-center text-3xl shrink-0`}>
                      {avatar}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="font-extrabold text-[hsl(var(--damij-primary))] text-lg leading-tight">{c.name_ar}</div>
                      <div className="text-xs text-slate-500 mt-0.5"><User className="w-3 h-3 inline ml-1" />{c.age_years} سنة • {c.gender}</div>
                    </div>
                    <span className="text-2xl opacity-70">{CATEGORY_EMOJI[c.category]}</span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-3 mb-4 min-h-[60px]">{c.summary_ar}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full bg-white border ${theme.text} font-bold`}>{CATEGORY_LABEL[c.category]}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold">{SEVERITY_LABEL[c.severity]}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">حالة جاهزة</span>
                    <span className={`flex items-center gap-1 text-sm font-bold ${theme.text} group-hover:gap-2 transition-all`}>
                      افتح الملف <ArrowLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ClinicalCases;
