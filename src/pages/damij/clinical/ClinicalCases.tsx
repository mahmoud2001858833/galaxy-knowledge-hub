import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Search, User, ArrowLeft, ArrowRight, LayoutGrid, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  ClinicalCase, SEVERITY_LABEL, CATEGORY_LABEL, CATEGORY_EMOJI,
  CATEGORY_THEME, CATEGORIES, caseAvatarFromName,
} from '@/features/clinical/types';

const GROUP_LABEL: Record<string, { ar: string; emoji: string }> = {
  special: { ar: 'التربية الخاصة', emoji: '🧠' },
  medical: { ar: 'التخصصات الطبية', emoji: '🏥' },
};

const ClinicalCases: React.FC = () => {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCat = searchParams.get('cat') || '';

  useEffect(() => { (async () => {
    const { data } = await supabase.from('clinical_cases').select('*').order('category').limit(500);
    setCases((data as any) || []);
    setLoading(false);
  })(); }, []);

  const countByCat = useMemo(() => {
    const m: Record<string, number> = {};
    cases.forEach(c => { m[c.category] = (m[c.category] || 0) + 1; });
    return m;
  }, [cases]);

  const filteredCases = useMemo(() => {
    let list = cases;
    if (activeCat) list = list.filter(c => c.category === activeCat);
    if (q) {
      const ql = q.toLowerCase();
      list = list.filter(c =>
        `${c.name_ar} ${c.summary_ar} ${CATEGORY_LABEL[c.category]}`.toLowerCase().includes(ql)
      );
    }
    return list;
  }, [cases, activeCat, q]);

  const searchMode = !!q && !activeCat;

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  const activeCatMeta = CATEGORIES.find(c => c.key === activeCat);
  const activeTheme = activeCat ? CATEGORY_THEME[activeCat] : null;

  return (
    <div className="px-4 sm:px-6 pt-8 pb-16 max-w-6xl mx-auto" dir="rtl">
      {/* Hero */}
      <Link to="/damij/clinical" className="inline-flex items-center gap-1 mb-4 text-xs px-3 py-1.5 rounded-lg bg-white border hover:border-[hsl(var(--damij-accent-2))]/40">
        <ArrowRight className="w-3 h-3" /> مختبر المحاكاة
      </Link>

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-700 to-violet-700 text-white p-6 sm:p-8 mb-6 shadow-xl">
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <h1 className="relative text-2xl sm:text-3xl font-extrabold mb-2">مكتبة الحالات الافتراضية</h1>
        <p className="relative text-white/85 text-sm max-w-2xl">
          {cases.length} حالة مصنّفة في {CATEGORIES.length} فئة طبية وتربوية. اختر فئة لاستعراض حالاتها، أو ابحث مباشرة بالاسم/التشخيص.
        </p>

        <div className="relative mt-5 max-w-lg">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-white/70" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن حالة بالاسم أو التشخيص…"
            className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-white/15 backdrop-blur border border-white/20 text-sm text-white placeholder-white/60 focus:bg-white/20 outline-none" />
          {q && <button onClick={() => setQ('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"><X className="w-4 h-4" /></button>}
        </div>
      </header>

      {/* Active category banner */}
      {activeCat && activeCatMeta && activeTheme && (
        <div className={`rounded-3xl p-5 mb-5 border bg-gradient-to-br ${activeTheme.from} ${activeTheme.to}`}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`w-14 h-14 rounded-2xl bg-white shadow-md ring-2 ${activeTheme.ring} flex items-center justify-center text-3xl`}>
              {activeCatMeta.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-extrabold text-xl ${activeTheme.text}`}>{activeCatMeta.ar}</div>
              <div className="text-xs text-slate-600">{filteredCases.length} حالة متاحة</div>
            </div>
            <button onClick={() => setSearchParams({})}
              className="px-3 py-1.5 rounded-lg bg-white border text-xs font-bold flex items-center gap-1">
              <LayoutGrid className="w-3 h-3" /> كل الفئات
            </button>
          </div>
        </div>
      )}

      {/* Categories grid OR cases grid */}
      {!activeCat && !searchMode ? (
        <CategoriesView countByCat={countByCat} onPick={(k) => setSearchParams({ cat: k })} />
      ) : (
        <CasesGrid cases={filteredCases} totalCases={cases.length} />
      )}
    </div>
  );
};

const CategoriesView: React.FC<{ countByCat: Record<string, number>; onPick: (k: string) => void }> = ({ countByCat, onPick }) => {
  const groups = [['special', 'medical']] as const;
  return (
    <div className="space-y-8">
      {(['special', 'medical'] as const).map(grp => {
        const cats = CATEGORIES.filter(c => c.group === grp);
        const meta = GROUP_LABEL[grp];
        return (
          <section key={grp}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{meta.emoji}</span>
              <h2 className="text-lg font-extrabold text-[hsl(var(--damij-primary))]">{meta.ar}</h2>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">{cats.length} فئة</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {cats.map(cat => {
                const t = CATEGORY_THEME[cat.key];
                const count = countByCat[cat.key] || 0;
                const disabled = count === 0;
                return (
                  <button key={cat.key} disabled={disabled} onClick={() => onPick(cat.key)}
                    className={`group relative overflow-hidden aspect-square rounded-3xl border bg-white text-right transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-2xl hover:border-transparent'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${t.from} ${t.to} opacity-90`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    {/* Big emoji "image" */}
                    <div className="absolute inset-0 flex items-center justify-center text-[5rem] sm:text-[6rem] opacity-90 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                      {cat.emoji}
                    </div>
                    {/* Bottom info */}
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
                      <div className="font-extrabold text-sm sm:text-base leading-tight drop-shadow">{cat.ar}</div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] sm:text-xs bg-white/25 backdrop-blur px-2 py-0.5 rounded-full font-bold">{count} حالة</span>
                        <ArrowLeft className="w-4 h-4 opacity-80 group-hover:-translate-x-1 transition" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

const CasesGrid: React.FC<{ cases: ClinicalCase[]; totalCases: number }> = ({ cases, totalCases }) => {
  if (cases.length === 0) {
    return (
      <div className="text-center text-slate-500 py-16 border-2 border-dashed rounded-3xl bg-white">
        {totalCases === 0 ? 'لا توجد حالات بعد.' : 'لا حالات مطابقة لبحثك.'}
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cases.map(c => {
        const theme = CATEGORY_THEME[c.category] || CATEGORY_THEME.internal;
        const avatar = caseAvatarFromName(c.name_ar + c.code);
        return (
          <Link key={c.id} to={`/damij/clinical/case/${c.id}`}
            className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 hover:border-[hsl(var(--damij-accent-2))]/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className={`h-20 bg-gradient-to-br ${theme.from} ${theme.to}`} />
            <div className="px-5 pb-5 -mt-10">
              <div className={`w-16 h-16 rounded-2xl bg-white shadow-md ring-2 ${theme.ring} flex items-center justify-center text-3xl mb-3`}>
                {avatar}
              </div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="font-extrabold text-[hsl(var(--damij-primary))] text-base leading-tight">{c.name_ar}</div>
                <span className="text-xl opacity-70 shrink-0">{CATEGORY_EMOJI[c.category]}</span>
              </div>
              <div className="text-xs text-slate-500 mb-2"><User className="w-3 h-3 inline ml-1" />{c.age_years} سنة • {c.gender}</div>
              <p className="text-sm text-slate-700 line-clamp-3 mb-3 min-h-[60px]">{c.summary_ar}</p>
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
  );
};

export default ClinicalCases;
