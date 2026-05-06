import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Filter, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORIES, CategoryKey, ClinicalCase, SEVERITY_LABEL, CATEGORY_LABEL, CATEGORY_EMOJI, CATEGORY_GROUP } from '@/features/clinical/types';

const ClinicalCases: React.FC = () => {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<CategoryKey | 'all'>('all');
  const [grp, setGrp] = useState<'all' | 'special' | 'medical'>('all');
  const [sev, setSev] = useState<'all' | 'mild' | 'moderate' | 'severe'>('all');
  const [age, setAge] = useState<'all' | 'child' | 'preteen' | 'teen'>('all');
  const [q, setQ] = useState('');

  useEffect(() => { (async () => {
    const { data } = await supabase.from('clinical_cases').select('*').order('category').limit(500);
    setCases((data as any) || []);
    setLoading(false);
  })(); }, []);

  const filtered = useMemo(() => cases.filter(c => {
    if (grp !== 'all' && CATEGORY_GROUP[c.category] !== grp) return false;
    if (cat !== 'all' && c.category !== cat) return false;
    if (sev !== 'all' && c.severity !== sev) return false;
    if (age !== 'all') {
      if (age === 'child' && c.age_years > 6) return false;
      if (age === 'preteen' && (c.age_years < 7 || c.age_years > 11)) return false;
      if (age === 'teen' && c.age_years < 12) return false;
    }
    if (q && !`${c.name_ar} ${c.summary_ar}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [cases, cat, grp, sev, age, q]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  return (
    <div className="px-6 pt-10 pb-16 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))] mb-2">مكتبة الحالات الافتراضية</h1>
      <p className="text-slate-600 mb-6">{filtered.length} حالة من أصل {cases.length}</p>

      <div className="grid sm:grid-cols-4 gap-2 mb-6">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث بالاسم/الملخص"
            className="w-full pr-9 pl-3 py-2 rounded-lg border bg-white text-sm" />
        </div>
        <select value={cat} onChange={e => setCat(e.target.value as any)} className="px-3 py-2 rounded-lg border bg-white text-sm">
          <option value="all">كل الفئات</option>
          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.ar}</option>)}
        </select>
        <select value={sev} onChange={e => setSev(e.target.value as any)} className="px-3 py-2 rounded-lg border bg-white text-sm">
          <option value="all">كل الشدّات</option>
          <option value="mild">خفيفة</option><option value="moderate">متوسطة</option><option value="severe">شديدة</option>
        </select>
        <select value={age} onChange={e => setAge(e.target.value as any)} className="px-3 py-2 rounded-lg border bg-white text-sm">
          <option value="all">كل الأعمار</option>
          <option value="child">طفولة (≤6)</option>
          <option value="preteen">7-11</option>
          <option value="teen">12+</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-slate-500 py-16 border-2 border-dashed rounded-2xl">
          {cases.length === 0 ? 'لا توجد حالات بعد. عُد إلى الصفحة الرئيسية وولّد المحتوى.' : 'لا حالات مطابقة للفلاتر.'}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <Link key={c.id} to={`/damij/clinical/case/${c.id}`}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[hsl(var(--damij-accent-2))]/40 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--damij-primary))]/10 flex items-center justify-center text-2xl">{CATEGORY_EMOJI[c.category]}</div>
                <div>
                  <div className="font-bold text-[hsl(var(--damij-primary))]">{c.name_ar}</div>
                  <div className="text-xs text-slate-500"><User className="w-3 h-3 inline ml-1" />{c.age_years} سنة • {c.gender}</div>
                </div>
              </div>
              <p className="text-sm text-slate-700 line-clamp-3 mb-3">{c.summary_ar}</p>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--damij-accent))]/20 text-[hsl(var(--damij-primary))] font-bold">{CATEGORY_LABEL[c.category]}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">{SEVERITY_LABEL[c.severity]}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default ClinicalCases;
