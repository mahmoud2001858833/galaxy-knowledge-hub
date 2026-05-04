import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Hand, Globe, Star, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { DICTIONARY, CATEGORIES, type DictWord } from '@/features/sign-language/dictionary';
import { fetchTitlesIfNeeded, loadTitles, getFavorites, type TitleMap } from '@/features/sign-language/dictionaryCache';
import { SPOKEN_LANGUAGES, type SpokenLang } from '@/features/sign-language/languages';
import { SIGN_SYSTEMS } from '@/features/sign-language/signSystems';
import WordDetailSheet from '@/features/sign-language/WordDetailSheet';

const SignDictionary: React.FC = () => {
  const [lang, setLang] = useState<SpokenLang>(
    SPOKEN_LANGUAGES.find(l => l.code === 'ar-SA') || SPOKEN_LANGUAGES[0],
  );
  const [signSystem, setSignSystem] = useState<string>('ArSL');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [titles, setTitles] = useState<TitleMap>(() => loadTitles('ar-SA'));
  const [translatingProgress, setTranslatingProgress] = useState<{ done: number; total: number } | null>(null);
  const [selected, setSelected] = useState<DictWord | null>(null);
  const [langSearch, setLangSearch] = useState('');
  const [favs, setFavs] = useState<string[]>(getFavorites());
  const [visibleCount, setVisibleCount] = useState(60);

  // Load / fetch titles when language changes
  useEffect(() => {
    let cancelled = false;
    setTitles(loadTitles(lang.code));
    setVisibleCount(60);
    if (lang.code.startsWith('ar')) return;
    setTranslatingProgress({ done: 0, total: DICTIONARY.length });
    fetchTitlesIfNeeded(lang.code, lang.name, (done, total) => {
      if (!cancelled) setTranslatingProgress({ done, total });
    })
      .then((map) => {
        if (cancelled) return;
        setTitles(map);
        setTranslatingProgress(null);
      })
      .catch((e) => {
        if (cancelled) return;
        toast.error(e?.message || 'فشلت الترجمة الدفعية، سيتم البحث بالعربية');
        setTranslatingProgress(null);
      });
    return () => { cancelled = true; };
  }, [lang]);

  // Refresh favorites when sheet closes
  useEffect(() => {
    if (selected === null) setFavs(getFavorites());
  }, [selected]);

  const filteredLangs = langSearch
    ? SPOKEN_LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
        l.code.toLowerCase().includes(langSearch.toLowerCase()),
      )
    : SPOKEN_LANGUAGES;

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: DICTIONARY.length, favorites: favs.length };
    for (const cat of CATEGORIES) c[cat.key] = 0;
    for (const w of DICTIONARY) c[w.category] = (c[w.category] || 0) + 1;
    return c;
  }, [favs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DICTIONARY.filter(w => {
      if (category === 'favorites' ? !favs.includes(w.id) : (category !== 'all' && w.category !== category)) return false;
      if (!q) return true;
      const translated = (titles[w.ar] || '').toLowerCase();
      return w.ar.toLowerCase().includes(q) || translated.includes(q) || w.id.toLowerCase().includes(q);
    });
  }, [query, category, titles, favs]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="px-4 sm:px-6 pt-12 pb-16 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[hsl(var(--damij-primary))] mb-2 flex items-center gap-3">
          <Globe className="w-9 h-9" /> القاموس العالمي للغة الإشارة
        </h1>
        <p className="text-slate-600">
          {DICTIONARY.length}+ مصطلح في {CATEGORIES.length} فئة · يدعم {SPOKEN_LANGUAGES.length}+ لغة و {SIGN_SYSTEMS.length} نظام إشارة
        </p>
      </div>

      {/* Top controls */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Sign system */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-4">
          <label className="text-sm font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2 mb-2">
            <Hand className="w-4 h-4" /> نظام الإشارة
          </label>
          <select
            value={signSystem}
            onChange={(e) => setSignSystem(e.target.value)}
            className="w-full p-3 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white"
          >
            {SIGN_SYSTEMS.map(s => (
              <option key={s.code} value={s.code}>{s.nativeName} — {s.code} · {s.region}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-4">
          <label className="text-sm font-bold text-[hsl(var(--damij-primary))] flex items-center justify-between mb-2">
            <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> لغة العرض</span>
            <span className="text-xs font-normal text-slate-500">المختارة: {lang.flag} {lang.nativeName}</span>
          </label>
          <input
            value={langSearch}
            onChange={(e) => setLangSearch(e.target.value)}
            placeholder="ابحث عن لغة (English, Français, 中文…)"
            className="w-full p-2 mb-2 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white text-sm"
          />
          <select
            value={lang.code}
            onChange={(e) => setLang(SPOKEN_LANGUAGES.find(l => l.code === e.target.value)!)}
            size={4}
            className="w-full p-2 rounded-xl border border-[hsl(var(--damij-primary))]/20 bg-white text-sm"
          >
            {filteredLangs.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.nativeName} — {l.name} ({l.code})</option>
            ))}
          </select>
          {translatingProgress && (
            <div className="mt-2 text-xs text-[hsl(var(--damij-primary))] flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              ترجمة العناوين إلى {lang.nativeName}… ({translatingProgress.done}/{translatingProgress.total})
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--damij-primary))]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`ابحث في ${DICTIONARY.length} مصطلحاً (بالعربية أو ${lang.nativeName})…`}
          className="w-full p-4 pr-12 rounded-2xl border-2 border-[hsl(var(--damij-primary))]/20 bg-white text-lg shadow-sm focus:outline-none focus:border-[hsl(var(--damij-primary))]/50"
          dir="auto"
        />
      </div>

      {/* Layout: categories + grid */}
      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Categories sidebar */}
        <aside className="bg-white rounded-2xl border border-[hsl(var(--damij-primary))]/15 p-3 h-fit max-h-[600px] overflow-y-auto sticky top-4">
          <h3 className="text-sm font-bold text-[hsl(var(--damij-primary))] mb-2 px-2">الفئات</h3>
          <div className="space-y-1">
            <button
              onClick={() => setCategory('all')}
              className={`w-full text-right px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-colors ${
                category === 'all' ? 'bg-[hsl(var(--damij-primary))] text-white font-bold' : 'hover:bg-slate-100'
              }`}
            >
              <span>🌍 الكل</span>
              <span className="text-xs opacity-70">{counts.all}</span>
            </button>
            <button
              onClick={() => setCategory('favorites')}
              className={`w-full text-right px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-colors ${
                category === 'favorites' ? 'bg-yellow-500 text-white font-bold' : 'hover:bg-slate-100'
              }`}
            >
              <span><Star className="w-3.5 h-3.5 inline mb-0.5" /> مفضلتي</span>
              <span className="text-xs opacity-70">{counts.favorites}</span>
            </button>
            <div className="border-t border-slate-200 my-2" />
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`w-full text-right px-3 py-2 rounded-xl text-sm flex items-center justify-between transition-colors ${
                  category === cat.key ? 'bg-[hsl(var(--damij-primary))] text-white font-bold' : 'hover:bg-slate-100'
                }`}
              >
                <span>{cat.emoji} {cat.ar}</span>
                <span className="text-xs opacity-70">{counts[cat.key]}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Grid */}
        <main>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <Search className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">لا توجد نتائج. جرّب كلمة أخرى أو فئة مختلفة.</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-slate-500 mb-3">{filtered.length} نتيجة</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {visible.map((w) => {
                  const translated = titles[w.ar];
                  const isFav = favs.includes(w.id);
                  return (
                    <motion.button
                      key={w.id}
                      onClick={() => setSelected(w)}
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="aspect-square bg-white rounded-2xl border-2 border-[hsl(var(--damij-primary))]/10 hover:border-[hsl(var(--damij-primary))]/40 hover:shadow-xl p-3 flex flex-col items-center justify-center text-center transition-all relative"
                    >
                      {isFav && <Star className="w-3.5 h-3.5 absolute top-2 left-2 fill-yellow-400 text-yellow-400" />}
                      <div className="text-4xl mb-2">{w.emoji}</div>
                      <div className="font-bold text-[hsl(var(--damij-primary))] text-sm leading-tight">{w.ar}</div>
                      {translated && translated !== w.ar && (
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1" dir="auto">{translated}</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              {visibleCount < filtered.length && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setVisibleCount(c => c + 60)}
                    className="px-6 py-3 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> عرض المزيد ({filtered.length - visibleCount} متبقي)
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Detail sheet */}
      <WordDetailSheet
        word={selected}
        langCode={lang.code}
        langName={lang.name}
        langFlag={lang.flag}
        signSystem={signSystem}
        onClose={() => setSelected(null)}
      />
    </div>
  );
};

export default SignDictionary;
