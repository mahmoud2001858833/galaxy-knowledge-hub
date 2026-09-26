import React, { useMemo, useState } from 'react';
import { 
  BookMarked, 
  ExternalLink, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Layers, 
  FileText, 
  Bookmark, 
  X, 
  Share2 
} from 'lucide-react';
import { SOURCES, CATEGORY_LABELS, SOURCE_COUNT, type SourceCategory } from './sourcesData';
import sourcesLibraryBg from '@/assets/sources-library-section.jpg';

const TYPE_LABEL: Record<string, string> = {
  guideline: 'إرشادات ومعايير',
  research: 'ورقة بحثية محكمة',
  book: 'مرجع / كتاب علمي',
  standard: 'معيار دولي',
  tool: 'أداة / نظام عملي',
  dataset: 'مجموعة بيانات',
  model: 'نموذج إكلينيكي',
};

const SourcesLibrary: React.FC = () => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<SourceCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [copied, setCopied] = useState<'none' | 'all' | 'filtered' | string>('none');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SOURCES.filter((s) => {
      if (cat !== 'all' && s.category !== cat) return false;
      if (selectedType !== 'all' && s.type !== selectedType) return false;
      if (!query) return true;
      return (
        s.title.toLowerCase().includes(query) ||
        s.authors.toLowerCase().includes(query) ||
        s.usedIn.toLowerCase().includes(query) ||
        s.note.toLowerCase().includes(query)
      );
    });
  }, [q, cat, selectedType]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: SOURCES.length };
    SOURCES.forEach((s) => {
      map[s.category] = (map[s.category] || 0) + 1;
    });
    return map;
  }, []);

  const formatSources = (list: typeof SOURCES) =>
    list
      .map(
        (s, i) =>
          `${i + 1}. ${s.title}\n` +
          `   • المؤلف/الجهة: ${s.authors} (${s.year})\n` +
          `   • الفئة: ${CATEGORY_LABELS[s.category]}\n` +
          `   • أين استُخدم في المنصة: ${s.usedIn}\n` +
          `   • الشرح: ${s.note}\n` +
          `   • الرابط: ${s.url}\n`
      )
      .join('\n\n');

  const copyToClipboard = async (text: string, kind: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(kind);
    setTimeout(() => setCopied('none'), 2200);
  };

  const copySingleCitation = (s: typeof SOURCES[0]) => {
    // Generate standard APA style citation
    const citation = `${s.authors} (${s.year}). ${s.title}. Available at: ${s.url}`;
    copyToClipboard(citation, s.id);
  };

  const downloadTxt = () => {
    const header =
      `المكتبة العلمية والمصادر المعتمدة — منصة ذروة العلم ومنصة دامج\n` +
      `إجمالي المراجع الموثقة: ${SOURCES.length}\n` +
      `تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}\n` +
      `=================================================================\n\n`;
    const blob = new Blob([header + formatSources(SOURCES)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scientific-sources-library-${SOURCES.length}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 sm:px-6 pt-6 pb-20 max-w-6xl mx-auto" dir="rtl">
      {/* Bespoke Glowing Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-10 border border-teal-500/30 shadow-2xl bg-slate-900">
        <div className="relative h-64 sm:h-72 w-full overflow-hidden">
          <img
            src={sourcesLibraryBg}
            alt="المكتبة العلمية والمصادر"
            className="w-full h-full object-cover object-center scale-102 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/75 to-slate-950/40" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-xs font-bold w-fit mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>المستودع البحثي والمصادر الأكاديمية</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
            المكتبة العلمية والمصادر الموثّقة
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm max-w-3xl mt-2 leading-relaxed drop-shadow">
            أكثر من <span className="font-bold text-teal-300">{SOURCE_COUNT}</span> مرجعاً علمياً ودولياً محكّماً تستند إليها كافة أدوات المنصة، بروتوكولات التقييم، وتطبيقات التربية الخاصة والذكاء الاصطناعي.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4 pt-3 border-t border-white/10 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-teal-300">
              <BookMarked className="w-4 h-4" />
              {SOURCE_COUNT} مرجعاً موثقاً
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Layers className="w-4 h-4" />
              {Object.keys(CATEGORY_LABELS).length} تخصصات علمية
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <FileText className="w-4 h-4" />
              أدلة APA, WHO, W3C
            </span>
          </div>
        </div>
      </div>

      {/* Copy / Export Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 mb-8 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <button
          onClick={() => copyToClipboard(formatSources(SOURCES), 'all')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
        >
          {copied === 'all' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          {copied === 'all' ? 'تم نسخ جميع المراجع ✓' : `نسخ كل المصادر (${SOURCES.length})`}
        </button>

        <button
          onClick={() => copyToClipboard(formatSources(filtered), 'filtered')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
        >
          {copied === 'filtered' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied === 'filtered' ? 'تم نسخ النتائج الحالية ✓' : `نسخ النتائج الظاهرة (${filtered.length})`}
        </button>

        <button
          onClick={downloadTxt}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>تنزيل ملف مراجع (.TXT)</span>
        </button>

        <div className="hidden lg:block flex-1 text-[11px] text-slate-400 text-left pl-2">
          يتضمن التصدير: المؤلفين، سنة النشر، الرابط المباشر، وموضع التطبيق العملي.
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-5">
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالعنوان، اسم المؤلف، الجهة، أو التقنية المستخدمة فيها..."
          className="w-full pr-11 pl-10 py-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 text-white placeholder-slate-400 text-sm outline-none transition-all"
        />
        {q && (
          <button
            onClick={() => setQ('')}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-teal-400" />
          <span>التصنيف حسب التخصص:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCat('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              cat === 'all'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            الكل ({counts.all})
          </button>
          {(Object.keys(CATEGORY_LABELS) as SourceCategory[]).map((k) => (
            <button
              key={k}
              onClick={() => setCat(k)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                cat === k
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              {CATEGORY_LABELS[k]} ({counts[k] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Type Filter Chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
        <span className="text-[11px] font-semibold text-slate-400">نوع المرجع:</span>
        <button
          onClick={() => setSelectedType('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
            selectedType === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          جميع الأنواع
        </button>
        {Object.entries(TYPE_LABEL).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedType(key)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              selectedType === key
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-xs font-semibold text-slate-400 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BookMarked className="w-4 h-4 text-teal-400" />
          <span>يتم عرض {filtered.length} مرجعاً علمياً موثقاً</span>
        </div>
        {(q || cat !== 'all' || selectedType !== 'all') && (
          <button
            onClick={() => {
              setQ('');
              setCat('all');
              setSelectedType('all');
            }}
            className="text-xs text-teal-400 hover:underline"
          >
            إعادة ضبط الفلاتر
          </button>
        )}
      </div>

      {/* Sources List Grid */}
      <div className="space-y-4">
        {filtered.map((s) => {
          const isCopied = copied === s.id;
          return (
            <article
              key={s.id}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5 group"
            >
              <header className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {s.authors} · <span className="text-teal-400">{s.year}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold whitespace-nowrap">
                    {CATEGORY_LABELS[s.category]}
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold whitespace-nowrap">
                    {TYPE_LABEL[s.type] || s.type}
                  </span>
                </div>
              </header>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                {s.note}
              </p>

              {/* Where Used in Platform Card */}
              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 mb-4">
                <div className="text-[11px] font-bold text-teal-400 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <span>تطبيق هذا المرجع في المنصة:</span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">{s.usedIn}</div>
              </div>

              {/* Action Buttons: Open Link & Copy APA Citation */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 flex-wrap gap-2">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>الاطلاع على المصدر الأصلي</span>
                </a>

                <button
                  onClick={() => copySingleCitation(s)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isCopied
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-white'
                  }`}
                  title="نسخ توثيق المرجع وفق أسلوب APA"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'تم نسخ التوثيق (APA) ✓' : 'نسخ التوثيق (APA)'}</span>
                </button>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400">
            <BookMarked className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <h4 className="text-base font-bold text-slate-300 mb-1">لا توجد مراجع مطابقة</h4>
            <p className="text-xs text-slate-500">جرب البحث بكلمات عامة أو إلغاء بعض الفلاتر.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SourcesLibrary;

