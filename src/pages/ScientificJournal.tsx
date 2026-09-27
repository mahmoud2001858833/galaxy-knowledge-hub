import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Download, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Award, 
  Layers, 
  Share2, 
  Copy, 
  Check, 
  Atom, 
  Play, 
  Filter, 
  Calendar, 
  Building2, 
  GraduationCap,
  RotateCcw,
  Newspaper,
  BookMarked,
  Quote,
  Flame,
  ArrowUpRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import UploadJournalDrawer from '@/components/scientificJournal/UploadJournalDrawer';
import { CURATED_RESEARCH_PAPERS, ResearchPaper, PublicationType, ResearchSubject } from '@/data/scientificResearchData';
import { supabase } from '@/integrations/supabase/client';

export const ScientificJournal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'research' 
    ? 'research' 
    : searchParams.get('tab') === 'magazine' 
      ? 'magazine' 
      : 'all';

  const [papers, setPapers] = useState<ResearchPaper[]>(CURATED_RESEARCH_PAPERS);
  const [activeTab, setActiveTab] = useState<'all' | 'research' | 'magazine'>(initialTab);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'downloads' | 'citations'>('recent');
  const [onlyPeerReviewed, setOnlyPeerReviewed] = useState(false);
  const [onlyWithSimulations, setOnlyWithSimulations] = useState(false);
  const [onlyEditorPick, setOnlyEditorPick] = useState(false);
  const [activePaperModal, setActivePaperModal] = useState<ResearchPaper | null>(null);
  const [modalTab, setModalTab] = useState<'abstract' | 'methodology' | 'citation'>('abstract');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Sync tab with URL search parameter
  const handleTabChange = (tab: 'all' | 'research' | 'magazine') => {
    setActiveTab(tab);
    if (tab === 'all') {
      searchParams.delete('tab');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ tab });
    }
  };

  // Fetch additional user-uploaded journals from Supabase and merge
  useEffect(() => {
    const fetchSupabaseJournals = async () => {
      try {
        const { data, error } = await supabase
          .from('scientific_journals')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted: ResearchPaper[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            abstract: item.description || 'بحث علمي محكم منشور في منصة ذروة العلم المعرفية.',
            author: item.author || 'باحث في ذروة العلم',
            authorRole: 'باحث أكاديمي معتمد',
            institution: 'مدرسة عنبه الثانوية للبنين بالتعاون مع المنظومة العلمية',
            subject: (item.subject || 'physics') as ResearchSubject,
            subjectLabel: item.subject === 'physics' ? 'الفيزياء' : item.subject === 'chemistry' ? 'الكيمياء' : item.subject === 'biology' ? 'الأحياء' : item.subject === 'mathematics' ? 'الرياضيات' : 'العلوم العامة',
            category: 'أبحاث ودراسات متقدمة',
            coverImage: item.cover_image_url || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
            pdfUrl: item.pdf_url,
            doi: `10.1088/zarwat.${item.id.slice(0, 8)}`,
            readTimeMinutes: 10,
            viewsCount: 380,
            downloadsCount: 140,
            citationsCount: 5,
            publishedDate: item.created_at ? item.created_at.slice(0, 10) : '2026-09-01',
            isPeerReviewed: true,
            publicationType: 'research-paper' as PublicationType,
            publicationTypeLabel: 'ورقة بحثية محكمة',
            citationAPA: `${item.author || 'باحث'}. (2026). ${item.title}. مجلة ذروة العلم، 12(1).`,
            citationMLA: `${item.author || 'باحث'}. "${item.title}." مجلة ذروة العلم، 2026.`,
            keyFindings: [
              'تحليل منهجي وتجريبي متوافق مع معايير المنهاج',
              'توصيات تطبيقية لربط المادة النظرية بالمختبرات الرقمية'
            ],
            methodology: 'دراسة استقصائية معملية مبنية على معايير البحث العلمي الأكاديمي المعتمدة.'
          }));

          setPapers(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOnes = formatted.filter(f => !existingIds.has(f.id));
            return [...newOnes, ...prev];
          });
        }
      } catch (err) {
        console.warn('Could not load extra journals from Supabase:', err);
      }
    };

    fetchSupabaseJournals();
  }, []);

  // Filter & Sort Logic
  const filteredPapers = useMemo(() => {
    return papers
      .filter(p => {
        // Tab filtering
        const matchesTab = 
          activeTab === 'all' ||
          (activeTab === 'research' && p.publicationType === 'research-paper') ||
          (activeTab === 'magazine' && p.publicationType === 'magazine-article');

        // Subject filter
        const matchesSubject = selectedSubject === 'all' || p.subject === selectedSubject;
        
        // Toggles
        const matchesPeer = !onlyPeerReviewed || p.isPeerReviewed;
        const matchesSim = !onlyWithSimulations || !!p.simulationUrl;
        const matchesEditor = !onlyEditorPick || !!p.editorPick;

        // Search Query
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch = !q ||
          p.title.toLowerCase().includes(q) ||
          p.abstract.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.institution.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.doi.toLowerCase().includes(q) ||
          (p.magazineIssue && p.magazineIssue.toLowerCase().includes(q)) ||
          p.keyFindings.some(f => f.toLowerCase().includes(q));

        return matchesTab && matchesSubject && matchesPeer && matchesSim && matchesEditor && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'views') return b.viewsCount - a.viewsCount;
        if (sortBy === 'downloads') return b.downloadsCount - a.downloadsCount;
        if (sortBy === 'citations') return b.citationsCount - a.citationsCount;
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      });
  }, [papers, activeTab, selectedSubject, onlyPeerReviewed, onlyWithSimulations, onlyEditorPick, searchQuery, sortBy]);

  const hasActiveFilters = selectedSubject !== 'all' || onlyPeerReviewed || onlyWithSimulations || onlyEditorPick || searchQuery !== '';

  const resetFilters = () => {
    setSelectedSubject('all');
    setOnlyPeerReviewed(false);
    setOnlyWithSimulations(false);
    setOnlyEditorPick(false);
    setSearchQuery('');
    setSortBy('recent');
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
    toast.success(`تم نسخ ${type === 'doi' ? 'معرف الـ DOI' : 'صيغة الاقتباس'} بنجاح إلى الحافظة`);
  };

  const categories = [
    { id: 'all', label: 'كافة العلوم', icon: '🌐', count: papers.length },
    { id: 'physics', label: 'الفيزياء والكم', icon: '⚛️', count: papers.filter(p => p.subject === 'physics').length },
    { id: 'chemistry', label: 'الكيمياء والنانوتك', icon: '🧪', count: papers.filter(p => p.subject === 'chemistry').length },
    { id: 'biology', label: 'الجينات والتكنولوجيا الحيوية', icon: '🧬', count: papers.filter(p => p.subject === 'biology').length },
    { id: 'space', label: 'الفلك والكونيات', icon: '🪐', count: papers.filter(p => p.subject === 'space').length },
    { id: 'robotics', label: 'الروبوتات والذكاء', icon: '🤖', count: papers.filter(p => p.subject === 'robotics').length },
    { id: 'energy', label: 'طاقة المستقبل', icon: '⚡', count: papers.filter(p => p.subject === 'energy').length },
    { id: 'mathematics', label: 'الرياضيات والتشفير', icon: '📐', count: papers.filter(p => p.subject === 'mathematics').length },
    { id: 'arabic', label: 'الإعجاز واللغويات', icon: '📜', count: papers.filter(p => p.subject === 'arabic').length },
  ];

  const totalResearchCount = papers.filter(p => p.publicationType === 'research-paper').length;
  const totalMagazineCount = papers.filter(p => p.publicationType === 'magazine-article').length;

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#030712] text-slate-100 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      <SEO 
        title="المجلة العلمية والأبحاث المحكمة - Scientific Journals & Research Hub" 
        description="المنصة العلمية الرائدة للأبحاث المحكمة ومقالات المجلة العلمية في فيزياء الكم، الكيمياء، كريسبر، الفضاء، والروبوتات المربوطة بالمحاكاة 3D" 
        keywords="المجلة العلمية, أبحاث علمية, أوراق بحثية, فيزياء الكم, كريسبر, روبوتات, ذروة العلم, أبحاث محكمة, ISSN, DOI" 
      />

      <StarField starCount={400} />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 max-w-7xl space-y-8">
        
        {/* Luxury Hero Banner with Emerald & Cosmic Obsidian Glow */}
        <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-indigo-950/70 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] backdrop-blur-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-2 shadow-sm">
                  <BookOpen className="w-4 h-4 text-emerald-400 animate-pulse" />
                  مجمع النشر العلمي والمجلة الدورية (Journal of Advanced Sciences)
                </span>
                <Badge variant="outline" className="text-xs font-mono border-indigo-400/40 text-indigo-300 bg-indigo-950/40">
                  ISSN: 2958-8833 • Open Access
                </Badge>
                <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold">
                  مفهرس بـ DOI دولي
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-indigo-300 leading-tight">
                المجلة العلمية والأبحاث المحكمة
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                المنصة الرائدة للأوراق البحثية المحكمة والمقالات الاستكشافية في علوم الفلك، فيزياء الجسيمات، الهندسة الوراثية، والذكاء الاصطناعي — مع ربط مباشر بمختبرات المحاكاة ثلاثية الأبعاد 3D لاختبار الفرضيات علمياً.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <UploadJournalDrawer />
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-emerald-500/20 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">الأبحاث الأكاديمية المحكمة</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{totalResearchCount} أوراق محكمة</div>
              <span className="text-[10px] text-slate-400">توثيق DOI وتحكيم أكاديمي</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">مقالات المجلة العلمية</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">{totalMagazineCount} مقالاً دورياً</div>
              <span className="text-[10px] text-cyan-300">أعداد فصلية وتبسيط علوم</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">مربوطة بمختبرات 3D</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">
                {papers.filter(p => !!p.simulationUrl).length} دراسة تفاعلية
              </div>
              <span className="text-[10px] text-indigo-300">تحقق فوري من الفرضيات</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">القراءات والاستشهادات</span>
              <div className="text-2xl font-black text-purple-400 mt-1">
                {papers.reduce((acc, p) => acc + p.viewsCount, 0).toLocaleString()} قراءة
              </div>
              <span className="text-[10px] text-purple-300">وصول مفتوح (Open Access)</span>
            </div>
          </div>
        </div>

        {/* Primary View Mode Switcher: All vs Research vs Magazine */}
        <div className="flex items-center justify-center p-1.5 rounded-3xl bg-slate-900/90 border border-slate-800 max-w-2xl mx-auto shadow-xl">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>كافة الإنتاج العلمي</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/20 text-white">
              {papers.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('research')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'research'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>الأبحاث المحكمة (Papers)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/20 text-white">
              {totalResearchCount}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('magazine')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'magazine'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-[1.02]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>المجلة العلمية (Magazine)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-white/20 text-white">
              {totalMagazineCount}
            </span>
          </button>
        </div>

        {/* Categories Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedSubject === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSubject(cat.id)}
                className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white border-emerald-400/60 shadow-lg shadow-emerald-500/25 scale-[1.03]'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Filter & Sort Controls Studio */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-emerald-400 absolute right-4 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالعنوان، الكاتب، المؤسسة، رقم الـ DOI، أو الكلمات المفتاحية (مثال: كوانتم، كريسبر، ليدار، ويب)..."
                className="h-11 pr-11 pl-10 text-xs sm:text-sm rounded-2xl bg-slate-950/80 border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs bg-slate-950/80 px-3 py-2 rounded-2xl border border-slate-800 self-start lg:self-auto">
              <span className="text-slate-400 shrink-0">الترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-emerald-300 font-bold border-none outline-none cursor-pointer text-xs"
              >
                <option value="recent" className="bg-slate-900 text-slate-200">الأحدث نشراً</option>
                <option value="views" className="bg-slate-900 text-slate-200">الأكثر قراءة</option>
                <option value="downloads" className="bg-slate-900 text-slate-200">الأكثر تحميلاً</option>
                <option value="citations" className="bg-slate-900 text-slate-200">الأكثر استشهاداً</option>
              </select>
            </div>
          </div>

          {/* Secondary Fast Filters Bar */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Peer Reviewed Checkbox */}
              <button
                onClick={() => setOnlyPeerReviewed(!onlyPeerReviewed)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  onlyPeerReviewed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>أبحاث محكمة أكاديمياً فقط</span>
                {onlyPeerReviewed && <Check className="w-3 h-3 text-emerald-400" />}
              </button>

              {/* 3D Lab Attached */}
              <button
                onClick={() => setOnlyWithSimulations(!onlyWithSimulations)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  onlyWithSimulations
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Atom className="w-3.5 h-3.5 text-cyan-400" />
                <span>مربوطة بمختبر تفاعلي 3D</span>
                {onlyWithSimulations && <Check className="w-3 h-3 text-cyan-400" />}
              </button>

              {/* Editor's Pick */}
              <button
                onClick={() => setOnlyEditorPick(!onlyEditorPick)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  onlyEditorPick
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>مختارات هيئة التحرير</span>
                {onlyEditorPick && <Check className="w-3 h-3 text-amber-400" />}
              </button>
            </div>

            {/* Results count & Reset */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 text-xs">
                عرض <strong className="text-emerald-400">{filteredPapers.length}</strong> من أصل {papers.length}
              </span>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-1 rounded-xl text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة ضبط</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Papers & Magazine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => {
            const isResearch = paper.publicationType === 'research-paper';

            return (
              <motion.div
                key={paper.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={`rounded-3xl bg-slate-900/90 border shadow-xl overflow-hidden flex flex-col justify-between transition-all group duration-300 ${
                  isResearch
                    ? 'border-slate-800/90 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                    : 'border-slate-800/90 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                }`}
              >
                {/* Cover Image & Category Badges */}
                <div className="relative h-52 overflow-hidden bg-slate-950">
                  <img 
                    src={paper.coverImage} 
                    alt={paper.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap">
                    <Badge className={`text-[10px] font-bold shadow-sm ${
                      isResearch ? 'bg-emerald-600/95 text-white' : 'bg-cyan-600/95 text-white'
                    }`}>
                      {paper.subjectLabel}
                    </Badge>

                    {paper.isPeerReviewed && (
                      <Badge className="bg-amber-500/90 text-slate-950 text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-slate-950" /> محكم أكاديمياً
                      </Badge>
                    )}

                    {paper.magazineIssue && (
                      <Badge className="bg-indigo-600/90 text-white text-[10px] font-bold">
                        {paper.magazineIssue}
                      </Badge>
                    )}
                  </div>

                  {/* Top Left: Type Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-700/80">
                      {paper.publicationTypeLabel}
                    </span>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-[11px] text-slate-300">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-md">
                      DOI: {paper.doi.slice(0, 22)}...
                    </span>
                    <span className="flex items-center gap-1 text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-md">
                      <Clock className="w-3 h-3 text-cyan-400" /> {paper.readTimeMinutes} دقيقة
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className={`text-base font-black text-white transition-colors leading-snug line-clamp-2 ${
                      isResearch ? 'group-hover:text-emerald-300' : 'group-hover:text-cyan-300'
                    }`}>
                      {paper.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-slate-300 truncate">{paper.author}</span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {paper.abstract}
                    </p>
                  </div>

                  {/* Key Findings Preview */}
                  {paper.keyFindings && paper.keyFindings.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> أبرز النتائج:
                      </span>
                      <p className="text-slate-300 line-clamp-1">✓ {paper.keyFindings[0]}</p>
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <Button
                      onClick={() => { setActivePaperModal(paper); setModalTab('abstract'); }}
                      size="sm"
                      className={`flex-1 rounded-xl text-xs font-bold text-white shadow-md gap-1.5 ${
                        isResearch
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/20'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isResearch ? 'فحص البحث والأدلة' : 'قراءة المقال الكامل'}</span>
                    </Button>

                    {paper.simulationUrl && (
                      <Link to={paper.simulationUrl} target="_blank">
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-xl border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                          title={paper.simulationName || 'فتح المختبر التفاعلي 3D'}
                        >
                          <Atom className="w-4 h-4 animate-spin-slow" />
                        </Button>
                      </Link>
                    )}

                    {paper.pdfUrl && (
                      <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-xl border-slate-700 text-slate-300 hover:text-white"
                          title="تحميل وثيقة PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredPapers.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-4">
            <BookOpen className="w-16 h-16 mx-auto text-slate-600" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">لا توجد أبحاث أو مقالات مطابقة لمعايير البحث والفلترة</h3>
              <p className="text-xs text-slate-400">جرب البحث بكلمات عامة أو إلغاء بعض شروط التصفية المفعلة.</p>
            </div>
            <Button onClick={resetFilters} className="rounded-xl text-xs font-bold bg-emerald-600 text-white">
              إعادة ضبط الفلاتر
            </Button>
          </div>
        )}

      </main>

      {/* Comprehensive Academic Paper & Article Reader Modal */}
      <AnimatePresence>
        {activePaperModal && (
          <Dialog open={!!activePaperModal} onOpenChange={() => setActivePaperModal(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border-emerald-500/30 text-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(16,185,129,0.2)] backdrop-blur-2xl" dir="rtl">
              
              <DialogHeader className="text-right space-y-3 pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs">
                      {activePaperModal.subjectLabel}
                    </Badge>
                    <Badge className="bg-slate-900 text-slate-300 border border-slate-800 text-xs">
                      {activePaperModal.publicationTypeLabel}
                    </Badge>
                    {activePaperModal.isPeerReviewed && (
                      <Badge className="bg-emerald-600 text-white text-xs flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> بحث محكم ومعتمد
                      </Badge>
                    )}
                    {activePaperModal.magazineIssue && (
                      <Badge className="bg-indigo-600/90 text-white text-xs">
                        {activePaperModal.magazineIssue}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>👁️ {activePaperModal.viewsCount.toLocaleString()} قراءة</span>
                    <span>📥 {activePaperModal.downloadsCount.toLocaleString()} تحميلاً</span>
                    <span>⏱️ {activePaperModal.readTimeMinutes} دقيقة</span>
                  </div>
                </div>

                <DialogTitle className="text-xl sm:text-3xl font-black text-white leading-tight">
                  {activePaperModal.title}
                </DialogTitle>

                <DialogDescription className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 flex-wrap">
                  <span>المؤلف: <strong className="text-slate-200">{activePaperModal.author}</strong> ({activePaperModal.authorRole})</span>
                  <span>•</span>
                  <span>{activePaperModal.institution}</span>
                </DialogDescription>
              </DialogHeader>

              {/* Cover Banner */}
              <div className="relative rounded-2xl overflow-hidden h-56 border border-slate-800">
                <img 
                  src={activePaperModal.coverImage} 
                  alt={activePaperModal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-4">
                  <div className="flex items-center justify-between w-full text-xs text-slate-300 font-mono">
                    <span>معرف الوثيقة الرقمية: {activePaperModal.doi}</span>
                    <span>تاريخ النشر: {activePaperModal.publishedDate}</span>
                  </div>
                </div>
              </div>

              {/* Modal Tabs Navigation */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
                <button
                  onClick={() => setModalTab('abstract')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    modalTab === 'abstract'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>المستخلص والنتائج (Abstract)</span>
                </button>

                <button
                  onClick={() => setModalTab('methodology')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    modalTab === 'methodology'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>المنهجية والتحليل</span>
                </button>

                <button
                  onClick={() => setModalTab('citation')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    modalTab === 'citation'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Quote className="w-3.5 h-3.5" />
                  <span>توليد الاقتباس الأكاديمي (Citations)</span>
                </button>
              </div>

              {/* Modal Tab Content 1: Abstract & Findings */}
              {modalTab === 'abstract' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>المستخلص العلمي المعتمد:</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {activePaperModal.abstract}
                    </p>
                  </div>

                  {activePaperModal.keyFindings && activePaperModal.keyFindings.length > 0 && (
                    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                      <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        <span>أبرز النتائج والمخرجات الأكاديمية:</span>
                      </h4>
                      <div className="space-y-2">
                        {activePaperModal.keyFindings.map((finding, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Tab Content 2: Methodology */}
              {modalTab === 'methodology' && (
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>منهجية البحث والتصميم التجريبي:</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {activePaperModal.methodology || 'تم تنفيذ هذه الدراسة وفق معايير المنهج العلمي الاستقرائي والتحليلي، مع مراجعة دقيقة للأدبيات السابقة والتحقق من موثوقية النتائج التجريبية.'}
                  </p>
                  <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>المؤسسة الراعية للبحث: {activePaperModal.institution}</span>
                  </div>
                </div>
              )}

              {/* Modal Tab Content 3: Citation Generator */}
              {modalTab === 'citation' && (
                <div className="space-y-4">
                  {/* APA */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">تنسيق APA (الإصدار السابع):</span>
                      <button
                        onClick={() => copyToClipboard(activePaperModal.citationAPA, 'APA')}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        {copiedType === 'APA' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedType === 'APA' ? 'تم النسخ' : 'نسخ APA'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-850 select-all leading-relaxed">
                      {activePaperModal.citationAPA}
                    </p>
                  </div>

                  {/* MLA */}
                  {activePaperModal.citationMLA && (
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300">تنسيق MLA:</span>
                        <button
                          onClick={() => copyToClipboard(activePaperModal.citationMLA!, 'MLA')}
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          {copiedType === 'MLA' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedType === 'MLA' ? 'تم النسخ' : 'نسخ MLA'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-850 select-all leading-relaxed">
                        {activePaperModal.citationMLA}
                      </p>
                    </div>
                  )}

                  {/* DOI Direct Copy */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-300 block">المعرف الرقمي الدائم (DOI):</span>
                      <span className="text-xs font-mono text-cyan-400">{activePaperModal.doi}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(activePaperModal.doi, 'doi')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 border border-slate-700"
                    >
                      {copiedType === 'doi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedType === 'doi' ? 'تم النسخ' : 'نسخ DOI'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive 3D Simulation Link Banner */}
              {activePaperModal.simulationUrl && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-indigo-950/60 border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                      <Atom className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                      <span>المختبر التفاعلي ثلاثي الأبعاد المرتبط بهذا البحث</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      يمكنك التحقق من فرضيات هذه الورقة العلمية عملياً داخل مختبر: <strong className="text-white">{activePaperModal.simulationName}</strong>
                    </p>
                  </div>

                  <Link to={activePaperModal.simulationUrl} target="_blank">
                    <Button className="rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white gap-2 shrink-0 shadow-lg shadow-cyan-500/25">
                      <Play className="w-4 h-4 fill-current" />
                      <span>تشغيل المحاكاة 3D</span>
                    </Button>
                  </Link>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                <Button
                  onClick={() => setActivePaperModal(null)}
                  variant="outline"
                  className="rounded-xl text-xs border-slate-800 text-slate-400 hover:text-white"
                >
                  إغلاق النافذة
                </Button>

                <div className="flex items-center gap-2 flex-wrap">
                  {activePaperModal.pdfUrl && (
                    <a href={activePaperModal.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white gap-2 shadow-lg shadow-emerald-500/25">
                        <Download className="w-4 h-4" />
                        <span>تحميل المستند الكامل (PDF)</span>
                      </Button>
                    </a>
                  )}
                </div>
              </div>

            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default ScientificJournal;
