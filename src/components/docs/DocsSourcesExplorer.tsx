import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  BookOpen,
  Atom,
  FlaskConical,
  Calculator,
  Bot,
  Brain,
  Telescope,
  HeartPulse,
  GraduationCap,
  Lightbulb,
  Server,
  Copy,
  ExternalLink,
  CheckCircle2,
  FileText,
  Download,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Award,
  BookMarked,
  X,
  Share2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ALL_PLATFORM_SOURCES,
  SOURCE_CATEGORIES,
  TOTAL_SOURCES_COUNT,
  PlatformSource
} from '@/data/platformSourcesData';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  physics: Atom,
  chemistry: FlaskConical,
  mathematics: Calculator,
  robotics: Bot,
  ai: Brain,
  astronomy: Telescope,
  medicine_damij: HeartPulse,
  tawjihi_btec: GraduationCap,
  edtech: Lightbulb,
  software_cloud: Server
};

export const DocsSourcesExplorer: React.FC = () => {
  const { toast } = useToast();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'id' | 'year' | 'title'>('id');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Selected Source Modal State
  const [activeModalSource, setActiveModalSource] = useState<PlatformSource | null>(null);

  // Filter & Search Logic
  const filteredSources = useMemo(() => {
    let result = ALL_PLATFORM_SOURCES;

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category === selectedCategory);
    }

    // Filter by Type
    if (selectedType !== 'all') {
      result = result.filter(s => s.type === selectedType);
    }

    // Search Query (Searches in title, authors, org, overview, platformUsage, keyTopics)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.authors.toLowerCase().includes(q) ||
        s.organization.toLowerCase().includes(q) ||
        s.overview.toLowerCase().includes(q) ||
        s.platformUsage.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.keyTopics.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort Logic
    return [...result].sort((a, b) => {
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'title') return a.title.localeCompare(b.title, 'ar');
      return a.id.localeCompare(b.id);
    });
  }, [searchQuery, selectedCategory, selectedType, sortBy]);

  // Pagination Math
  const totalPages = Math.ceil(filteredSources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSources = filteredSources.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const copyCitation = (source: PlatformSource) => {
    const citation = `${source.authors} (${source.year}). ${source.title}. ${source.organization}. ${source.link || ''}`;
    navigator.clipboard.writeText(citation);
    toast({
      title: '📋 تم نسخ التوثيق الأكاديمي',
      description: `تم نسخ توثيق (${source.id}) بصيغة APA بنجاح.`
    });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ALL_PLATFORM_SOURCES, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Galaxy_Platform_Sources_Full_Catalog_${TOTAL_SOURCES_COUNT}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    toast({
      title: '📥 تم تصدير الدليل كاملاً',
      description: `تم تنزيل ملف JSON يحتوي على ${TOTAL_SOURCES_COUNT} مصدر أكاديمي موثق.`
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Hero Statistics HUD */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 dark:from-blue-950/40 dark:via-slate-900/80 dark:to-indigo-950/30 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-500/30">
              <BookMarked className="w-3.5 h-3.5" />
              <span>المكتبة التوثيقية الشاملة والمصادر العلمية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              أكثر من {TOTAL_SOURCES_COUNT} مصدر ومرجع علمي معتمد بُنيت عليها المنصة
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              كل محاكاة، معادلة، أداة ذكاء اصطناعي، أو وحدة تعليمية في منصة ذروة العلم مستندة إلى أوراق بحثية محكمة دولياً، كتب مرجعية جامعية عالمية، معايير دولية (IUPAC, IEEE, DSM-5)، ومناهج وزارة التربية والتعليم الأردنية المعتمدة.
            </p>
          </div>

          <Button
            onClick={handleExportJSON}
            className="rounded-2xl text-xs font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shrink-0 py-5 px-4"
          >
            <Download className="w-4 h-4" />
            <span>تصدير دليل المصادر كاملاً (JSON)</span>
          </Button>
        </div>

        {/* 4 HUD Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">إجمالي المصادر المعتمدة</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {TOTAL_SOURCES_COUNT}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-bold">100% موثقة ومفهرسة</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">أوراق بحثية محكمة Q1/Q2</span>
            <span className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
              460+
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Nature, IEEE, Science</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">مراجع وكتب أكاديمية عالمية</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              310+
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">MIT, Caltech, Oxford</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">مناهج وطنية ومعايير رسمية</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              230+
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">وزارة التربية، BTEC، WHO</span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Suite */}
      <div className="space-y-4">
        {/* Search Bar & Dropdowns */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ابحث بالاسم، المؤلف، المؤسسة، أو أين استخدم في المنصة (مثال: Feynman, CRISPR, SLAM, التوجيهي)..."
              className="ps-10 pe-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs sm:text-sm h-11"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Filter & Sort Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 h-11 focus:outline-none"
            >
              <option value="all">كافة أنواع المراجع ({TOTAL_SOURCES_COUNT})</option>
              <option value="ورقة بحثية محكمة">أوراق بحثية محكمة</option>
              <option value="مرجع أكاديمي عالمي">مراجع أكاديمية عالمية</option>
              <option value="معيار دولي معتمد">معايير دولية معتمدة</option>
              <option value="منهاج وزاري رسمي">مناهج وزارية رسمية</option>
              <option value="توثيق تقني صناعي">توثيق تقني صناعي</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 h-11 focus:outline-none"
            >
              <option value="id">ترتيب حسب المعرف (ID)</option>
              <option value="year">السنة (الأحدث أولاً)</option>
              <option value="title">العنوان (أبجدياً)</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>جميع القطاعات</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {TOTAL_SOURCES_COUNT}
            </Badge>
          </button>

          {SOURCE_CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat.id] || BookOpen;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Overview Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span>يتم عرض النتائج:</span>
          <span className="font-bold text-slate-900 dark:text-white font-mono">
            {filteredSources.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredSources.length)}
          </span>
          <span>من أصل</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{filteredSources.length}</span>
          <span>مصدر مطابق</span>
        </div>

        <div className="flex items-center gap-2">
          <span>عدد العناصر بالصفحة:</span>
          {[25, 50, 100].map(size => (
            <button
              key={size}
              onClick={() => {
                setItemsPerPage(size);
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                itemsPerPage === size
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Sources Grid Display */}
      {paginatedSources.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">لم يتم العثور على مصادر مطابقة لبحثك</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            جرب كلمات بحث مختلفة أو أزل مرشحات الفئات لعرض كامل مصادر المنصة.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedType('all');
            }}
            className="text-xs rounded-xl mt-2"
          >
            إعادة تعيين المرشحات
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {paginatedSources.map((source) => {
            const Icon = CATEGORY_ICONS[source.category] || BookOpen;

            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4 hover:border-blue-400/50"
              >
                {/* Header: ID, Category & Type Badge, Year */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold border border-blue-500/20">
                      {source.id}
                    </span>
                    <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-700">
                      <Icon className="w-3 h-3 ml-1 text-blue-500" />
                      {source.categoryLabel}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {source.type}
                    </Badge>
                  </div>

                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
                    سنة النشر / الاعتماد: {source.year}
                  </span>
                </div>

                {/* Title & Authors */}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                    {source.title}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{source.authors}</span>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400">{source.organization}</span>
                  </div>
                </div>

                {/* 1. Overview ("نبذة عنه") */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                    <span>نبذة عن المصدر والمساهمة العلمية:</span>
                  </div>
                  <p>{source.overview}</p>
                </div>

                {/* 2. Platform Usage ("أين استخدم بالمنصة؟") */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>أين وكيف تم استخدامه وتطبيقه في المنصة؟</span>
                  </div>
                  <p>{source.platformUsage}</p>
                </div>

                {/* Bottom Row: Key topics & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {source.keyTopics.map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyCitation(source)}
                      className="text-xs rounded-xl border-slate-300 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-800 gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ التوثيق (APA)</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setActiveModalSource(source)}
                      className="text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>تفاصيل ووثيقة المصدر</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="rounded-xl text-xs"
          >
            <ChevronRight className="w-4 h-4 ml-1" /> السابق
          </Button>

          {/* Quick Page Jumps */}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let p = i + 1;
            if (totalPages > 7) {
              if (currentPage > 4 && currentPage < totalPages - 3) {
                p = currentPage - 3 + i;
              } else if (currentPage >= totalPages - 3) {
                p = totalPages - 6 + i;
              }
            }

            return (
              <Button
                key={p}
                size="sm"
                variant={currentPage === p ? 'default' : 'outline'}
                onClick={() => handlePageChange(p)}
                className={`rounded-xl text-xs font-mono w-9 h-9 p-0 ${
                  currentPage === p ? 'bg-blue-600 text-white' : ''
                }`}
              >
                {p}
              </Button>
            );
          })}

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="rounded-xl text-xs"
          >
            التالي <ChevronLeft className="w-4 h-4 mr-1" />
          </Button>
        </div>
      )}

      {/* Detailed Modal Dialog */}
      <AnimatePresence>
        {activeModalSource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalSource(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {activeModalSource.id}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {activeModalSource.categoryLabel}
                  </Badge>
                </div>
                <button
                  onClick={() => setActiveModalSource(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                  {activeModalSource.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">المؤلفون / الهيئة:</strong> {activeModalSource.authors}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">المؤسسة والناشر:</strong> {activeModalSource.organization} ({activeModalSource.year})
                </p>
              </div>

              {/* Overview Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  الملخص العلمي الموسع:
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {activeModalSource.overview}
                </p>
              </div>

              {/* Platform Integration Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  موقع وكيفية الاستخدام في منصة ذروة العلم:
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/20">
                  {activeModalSource.platformUsage}
                </p>
              </div>

              {/* BibTeX Citation Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>كود التوثيق المعياري (BibTeX):</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const bib = `@article{galaxy_${activeModalSource.id},\n  title={${activeModalSource.title}},\n  author={${activeModalSource.authors}},\n  year={${activeModalSource.year}},\n  organization={${activeModalSource.organization}},\n  note={Applied in Galaxy Knowledge Hub Platform}\n}`;
                      navigator.clipboard.writeText(bib);
                      toast({ title: 'تم نسخ كود BibTeX' });
                    }}
                    className="h-6 text-[10px] text-blue-600"
                  >
                    نسخ BibTeX
                  </Button>
                </div>
                <pre className="p-3 rounded-2xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto dir-ltr text-left border border-slate-800">
{`@article{galaxy_${activeModalSource.id},
  title={${activeModalSource.title}},
  author={${activeModalSource.authors}},
  year={${activeModalSource.year}},
  organization={${activeModalSource.organization}},
  note={Applied in Galaxy Knowledge Hub: ${activeModalSource.platformUsage}}
}`}
                </pre>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyCitation(activeModalSource)}
                  className="rounded-xl text-xs gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ التوثيق (APA)</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setActiveModalSource(null)}
                  className="rounded-xl text-xs bg-blue-600 text-white"
                >
                  إغلاق النافذة
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
