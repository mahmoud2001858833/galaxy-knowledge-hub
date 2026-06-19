import React, { useMemo, useState } from 'react';
import { BookMarked, ExternalLink, Search, Filter, Copy, Check, Download } from 'lucide-react';
import { SOURCES, CATEGORY_LABELS, SOURCE_COUNT, type SourceCategory } from './sourcesData';

const TYPE_LABEL: Record<string, string> = {
  guideline: 'إرشادات',
  research: 'بحث',
  book: 'كتاب',
  standard: 'معيار',
  tool: 'أداة',
  dataset: 'بيانات',
  model: 'نموذج',
};

const SourcesLibrary: React.FC = () => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<SourceCategory | 'all'>('all');
  const [copied, setCopied] = useState<'none' | 'all' | 'filtered'>('none');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return SOURCES.filter((s) => {
      if (cat !== 'all' && s.category !== cat) return false;
      if (!query) return true;
      return (
        s.title.toLowerCase().includes(query) ||
        s.authors.toLowerCase().includes(query) ||
        s.usedIn.toLowerCase().includes(query) ||
        s.note.toLowerCase().includes(query)
      );
    });
  }, [q, cat]);

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
          `   • أين استُخدم في منصة دامج: ${s.usedIn}\n` +
          `   • الشرح: ${s.note}\n` +
          `   • الرابط: ${s.url}\n`
      )
      .join('\n');

  const copyToClipboard = async (text: string, kind: 'all' | 'filtered') => {
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
    setTimeout(() => setCopied('none'), 2500);
  };

  const downloadTxt = () => {
    const header =
      `المكتبة العلمية الموثّقة — منصة دامج\n` +
      `إجمالي المصادر: ${SOURCES.length}\n` +
      `تاريخ التصدير: ${new Date().toLocaleString('ar')}\n` +
      `——————————————————————————————\n\n`;
    const blob = new Blob([header + formatSources(SOURCES)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `damij-scientific-sources-${SOURCES.length}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 sm:px-6 pt-10 pb-16 max-w-6xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-2">
        <BookMarked className="w-8 h-8 text-[hsl(var(--damij-primary))]" />
        <h1 className="text-3xl font-bold text-[hsl(var(--damij-primary))]">المكتبة العلمية الموثّقة</h1>
      </div>
      <p className="text-[hsl(var(--damij-text))]/70 mb-2">
        أكثر من <span className="font-bold text-[hsl(var(--damij-primary))]">{SOURCE_COUNT}</span> مرجعاً علمياً ودولياً تُبنى عليها كل أدوات منصة دامج.
      </p>
      <p className="text-xs text-[hsl(var(--damij-text))]/60 mb-4">
        كل مصدر يوضّح: المؤلف، السنة، الجهة، أين استُخدم داخل المنصة، الشرح العلمي، والرابط الرسمي الخاص به.
      </p>

      {/* Copy / Download bar */}
      <div className="flex flex-wrap gap-2 mb-6 p-3 rounded-2xl bg-[hsl(var(--damij-accent))]/10 border border-[hsl(var(--damij-primary))]/15">
        <button
          onClick={() => copyToClipboard(formatSources(SOURCES), 'all')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-sm font-bold hover:opacity-90 transition"
        >
          {copied === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied === 'all' ? 'تم نسخ كل المصادر ✓' : `نسخ كل المصادر (${SOURCES.length})`}
        </button>
        <button
          onClick={() => copyToClipboard(formatSources(filtered), 'filtered')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[hsl(var(--damij-primary))]/30 text-[hsl(var(--damij-primary))] text-sm font-bold hover:bg-[hsl(var(--damij-primary))]/5 transition"
        >
          {copied === 'filtered' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied === 'filtered' ? 'تم نسخ النتائج ✓' : `نسخ النتائج الظاهرة (${filtered.length})`}
        </button>
        <button
          onClick={downloadTxt}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[hsl(var(--damij-primary))]/30 text-[hsl(var(--damij-text))] text-sm font-bold hover:bg-[hsl(var(--damij-primary))]/5 transition"
        >
          <Download className="w-4 h-4" />
          تنزيل ملف TXT
        </button>
        <div className="flex-1 min-w-[200px] text-[11px] text-[hsl(var(--damij-text))]/60 self-center leading-relaxed">
          النسخ يشمل: العنوان، المؤلف، السنة، الفئة، مكان الاستخدام في المنصة، الشرح، والرابط الرسمي لكل مصدر.
        </div>
      </div>


      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--damij-text))]/40" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن مصدر، أو مؤلف، أو ميزة استُخدم فيها..."
          className="w-full pr-10 pl-4 py-3 rounded-xl bg-white border border-[hsl(var(--damij-primary))]/15 focus:border-[hsl(var(--damij-primary))]/50 outline-none text-sm"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCat('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
            cat === 'all'
              ? 'bg-[hsl(var(--damij-primary))] text-white'
              : 'bg-white border border-[hsl(var(--damij-primary))]/15 text-[hsl(var(--damij-text))]/70'
          }`}
        >
          الكل ({counts.all})
        </button>
        {(Object.keys(CATEGORY_LABELS) as SourceCategory[]).map((k) => (
          <button
            key={k}
            onClick={() => setCat(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              cat === k
                ? 'bg-[hsl(var(--damij-primary))] text-white'
                : 'bg-white border border-[hsl(var(--damij-primary))]/15 text-[hsl(var(--damij-text))]/70'
            }`}
          >
            {CATEGORY_LABELS[k]} ({counts[k] || 0})
          </button>
        ))}
      </div>

      <div className="text-sm text-[hsl(var(--damij-text))]/60 mb-3 flex items-center gap-2">
        <Filter className="w-3.5 h-3.5" />
        تظهر {filtered.length} نتيجة
      </div>

      {/* Sources list */}
      <div className="space-y-3">
        {filtered.map((s) => (
          <article
            key={s.id}
            className="p-5 rounded-2xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 hover:shadow-md hover:border-[hsl(var(--damij-primary))]/30 transition-all"
          >
            <header className="flex items-start justify-between gap-3 mb-2 flex-wrap">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[hsl(var(--damij-primary))] leading-snug">
                  {s.title}
                </h3>
                <p className="text-xs text-[hsl(var(--damij-text))]/60 mt-1">
                  {s.authors} · {s.year}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--damij-accent))]/25 text-[hsl(var(--damij-primary))] font-semibold whitespace-nowrap">
                  {CATEGORY_LABELS[s.category]}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[hsl(var(--damij-primary))]/20 text-[hsl(var(--damij-text))]/70 font-semibold whitespace-nowrap">
                  {TYPE_LABEL[s.type] || s.type}
                </span>
              </div>
            </header>

            <p className="text-sm text-[hsl(var(--damij-text))]/85 leading-relaxed mb-3">
              {s.note}
            </p>

            <div className="rounded-lg bg-white/60 border border-[hsl(var(--damij-primary))]/10 p-3 mb-3">
              <div className="text-[11px] font-bold text-[hsl(var(--damij-primary))]/80 mb-1">
                ⚙️ أين استُخدم في المنصة
              </div>
              <div className="text-xs text-[hsl(var(--damij-text))]/75">{s.usedIn}</div>
            </div>

            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--damij-accent-2))] hover:underline font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              فتح المصدر الأصلي
            </a>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[hsl(var(--damij-text))]/50">
            لا توجد مراجع مطابقة لبحثك.
          </div>
        )}
      </div>
    </div>
  );
};

export default SourcesLibrary;
