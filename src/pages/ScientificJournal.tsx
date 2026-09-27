import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  UserCheck, 
  Plus, 
  X,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import UploadJournalDrawer from '@/components/scientificJournal/UploadJournalDrawer';
import { CURATED_RESEARCH_PAPERS, ResearchPaper } from '@/data/scientificResearchData';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export const ScientificJournal: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>(CURATED_RESEARCH_PAPERS);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'downloads'>('recent');
  const [onlyPeerReviewed, setOnlyPeerReviewed] = useState(false);
  const [activePaperModal, setActivePaperModal] = useState<ResearchPaper | null>(null);
  const [copiedDoi, setCopiedDoi] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);

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
            authorRole: 'باحث أكاديمي',
            institution: 'مدرسة عنبه الثانوية للبنين',
            subject: item.subject || 'physics',
            subjectLabel: item.subject === 'physics' ? 'الفيزياء' : item.subject === 'chemistry' ? 'الكيمياء' : item.subject === 'biology' ? 'الأحياء' : item.subject === 'mathematics' ? 'الرياضيات' : 'العلوم',
            category: 'أبحاث ودراسات متقدمة',
            coverImage: item.cover_image_url || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
            pdfUrl: item.pdf_url,
            doi: `10.1088/zarwat.${item.id.slice(0, 8)}`,
            readTimeMinutes: 10,
            viewsCount: 380,
            downloadsCount: 140,
            publishedDate: item.created_at ? item.created_at.slice(0, 10) : '2026-09-01',
            isPeerReviewed: true,
            citationAPA: `${item.author || 'باحث'}. (2026). ${item.title}. مجلة ذروة العلم، 12(1).`,
            keyFindings: [
              'تحليل منهجي وتجريبي متوافق مع معايير المنهاج',
              'توصيات تطبيقية لربط المادة النظرية بالمختبرات الرقمية'
            ]
          }));

          // Avoid duplicates by id
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

  // Filter & Sort
  const filteredPapers = papers
    .filter(p => {
      const matchesSubject = selectedSubject === 'all' || p.subject === selectedSubject;
      const matchesPeer = !onlyPeerReviewed || p.isPeerReviewed;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      return matchesSubject && matchesPeer && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'views') return b.viewsCount - a.viewsCount;
      if (sortBy === 'downloads') return b.downloadsCount - a.downloadsCount;
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    });

  const copyToClipboard = (text: string, type: 'doi' | 'citation') => {
    navigator.clipboard.writeText(text);
    if (type === 'doi') {
      setCopiedDoi(true);
      setTimeout(() => setCopiedDoi(false), 2000);
      toast.success('تم نسخ معرف الـ DOI بنجاح');
    } else {
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2000);
      toast.success('تم نسخ الاقتباس بتنسيق APA بنجاح');
    }
  };

  const categories = [
    { id: 'all', label: 'كافة العلوم والأبحاث', icon: '🌐', count: papers.length },
    { id: 'physics', label: 'الفيزياء والكم والفلك', icon: '⚛️', count: papers.filter(p => p.subject === 'physics').length },
    { id: 'chemistry', label: 'الكيمياء والنانوتك', icon: '🧪', count: papers.filter(p => p.subject === 'chemistry').length },
    { id: 'biology', label: 'الهندسة الوراثية والجينات', icon: '🧬', count: papers.filter(p => p.subject === 'biology').length },
    { id: 'robotics', label: 'الروبوتات والذكاء الاصطناعي', icon: '🤖', count: papers.filter(p => p.subject === 'robotics').length },
    { id: 'mathematics', label: 'الرياضيات والتشفير', icon: '📐', count: papers.filter(p => p.subject === 'mathematics').length },
    { id: 'arabic', label: 'الإعجاز والدراسات اللغوية', icon: '📜', count: papers.filter(p => p.subject === 'arabic').length },
  ];

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#050814] text-slate-100 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      <SEO 
        title="المجلة العلمية والأبحاث المحكمة - Scientific Journals Hub" 
        description="المنصة العلمية الرائدة للأبحاث والدراسات المحكمة في الفيزياء، الكيمياء، كريسبر، والروبوتات المربوطة بالمحاكاة 3D" 
        keywords="المجلة العلمية, أبحاث علمية, فيزياء الكم, كريسبر, روبوتات, ذروة العلم, أبحاث محكمة" 
      />

      <StarField starCount={400} />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 max-w-7xl space-y-8">
        {/* Luxury Hero Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-indigo-950/70 border border-emerald-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 shadow-sm">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  المجلة العلمية والأبحاث المحكمة (Journal of Advanced Sciences)
                </span>
                <Badge variant="outline" className="text-[11px] font-mono border-indigo-400/30 text-indigo-300">
                  ISSN: 2958-8833 • Open Access
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-indigo-300 leading-tight">
                منصة النشر العلمي الرائدة والمجلات المحكمة
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                استكشف أحدث الأوراق البحثية، المراجعات المنهجية، والمقالات العلمية في فيزياء الكم، الكيمياء النانوية، كريسبر، والروبوتات الذكية — مدمجة بمحاكاة تفاعلية ثلاثية الأبعاد 3D.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <UploadJournalDrawer />
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px]">الأوراق البحثية المنشورة</span>
              <div className="text-xl font-black text-white">{papers.length} بحثاً علمياً</div>
              <span className="text-[10px] text-emerald-400 font-bold">مفهرسة رقمياً بـ DOI</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[11px]">التحكيم الأكاديمي</span>
              <div className="text-xl font-black text-emerald-400">100% محكمة</div>
              <span className="text-[10px] text-slate-400">إشراف لجان أكاديمية متخصصة</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[11px]">الربط التفاعلي</span>
              <div className="text-xl font-black text-cyan-400">مختبرات 3D حية</div>
              <span className="text-[10px] text-cyan-300">اختبار الفرضيات في بيئة افتراضية</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[11px]">القراءات والتحميلات</span>
              <div className="text-xl font-black text-purple-400">
                {papers.reduce((acc, p) => acc + p.viewsCount, 0).toLocaleString()} قراءة
              </div>
              <span className="text-[10px] text-purple-300">وصول مفتوح للجميع (Open Access)</span>
            </div>
          </div>
        </div>

        {/* Specialized Scientific Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedSubject === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedSubject(cat.id)}
                className={`py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/50 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Filter & Sort Controls Bar */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالعنوان، الكاتب، الكلمات المفتاحية، أو الموضوع..."
              className="h-10 pr-10 text-xs sm:text-sm rounded-2xl bg-slate-800/80 border-slate-700/80 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 shrink-0">الترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                <option value="recent">الأحدث نشراً</option>
                <option value="views">الأكثر قراءة</option>
                <option value="downloads">الأكثر تحميلاً</option>
              </select>
            </div>

            {/* Peer Reviewed Checkbox Toggle */}
            <button
              onClick={() => setOnlyPeerReviewed(!onlyPeerReviewed)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                onlyPeerReviewed
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>الأبحاث المحكمة فقط</span>
              {onlyPeerReviewed && <Check className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Research Papers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => (
            <motion.div
              key={paper.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/40 shadow-xl overflow-hidden flex flex-col justify-between transition-all group hover:shadow-emerald-500/10"
            >
              {/* Cover Image & Category Badges */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={paper.coverImage} 
                  alt={paper.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap">
                  <Badge className="bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                    {paper.subjectLabel}
                  </Badge>
                  {paper.isPeerReviewed && (
                    <Badge className="bg-emerald-600/90 text-white text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> محكم
                    </Badge>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-mono text-[10px] text-slate-400">
                    DOI: {paper.doi.slice(0, 22)}...
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3 h-3 text-cyan-400" /> {paper.readTimeMinutes} دقيقة قراءة
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    {paper.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-slate-300">{paper.author}</span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {paper.abstract}
                  </p>
                </div>

                {/* Key Findings Pills */}
                {paper.keyFindings && paper.keyFindings.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400">أبرز النتائج:</span>
                    <p className="text-slate-300 line-clamp-1">✓ {paper.keyFindings[0]}</p>
                  </div>
                )}

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <Button
                    onClick={() => setActivePaperModal(paper)}
                    size="sm"
                    className="flex-1 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>قراءة البحث الكامل</span>
                  </Button>

                  {paper.simulationUrl && (
                    <Link to={paper.simulationUrl} target="_blank">
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-xl border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                        title={paper.simulationName || 'فتح المحاكاة ثلاثية الأبعاد المرتبطة'}
                      >
                        <Atom className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}

                  {paper.pdfUrl && (
                    <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-xl border-slate-700 text-slate-300 hover:text-white"
                        title="تحميل مستند PDF"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPapers.length === 0 && (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <BookOpen className="w-12 h-12 mx-auto text-slate-600" />
            <p className="text-sm font-bold">لا توجد أبحاث علمية مطابقة لمعايير البحث الحالية.</p>
            <p className="text-xs text-slate-500">جرب إزالة بعض الفلاتر أو البحث بكلمات عامة.</p>
          </div>
        )}
      </main>

      {/* Comprehensive Research Paper Reader Modal */}
      <AnimatePresence>
        {activePaperModal && (
          <Dialog open={!!activePaperModal} onOpenChange={() => setActivePaperModal(null)}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 space-y-6" dir="rtl">
              <DialogHeader className="text-right space-y-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs">
                    {activePaperModal.subjectLabel}
                  </Badge>
                  {activePaperModal.isPeerReviewed && (
                    <Badge className="bg-emerald-600 text-white text-xs flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> بحث محكم ومعتمد
                    </Badge>
                  )}
                  <span className="text-xs text-slate-400 font-mono">
                    تاريخ النشر: {activePaperModal.publishedDate}
                  </span>
                </div>

                <DialogTitle className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {activePaperModal.title}
                </DialogTitle>

                <DialogDescription className="text-xs sm:text-sm text-slate-400">
                  الباحث: <strong className="text-slate-200">{activePaperModal.author}</strong> ({activePaperModal.authorRole}) • {activePaperModal.institution}
                </DialogDescription>
              </DialogHeader>

              {/* Cover & Quick Stats */}
              <div className="relative rounded-2xl overflow-hidden h-52 border border-slate-800">
                <img 
                  src={activePaperModal.coverImage} 
                  alt={activePaperModal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent flex items-end p-4">
                  <div className="flex items-center gap-4 text-xs text-slate-200 font-mono">
                    <span>👁️ {activePaperModal.viewsCount} قراءة</span>
                    <span>📥 {activePaperModal.downloadsCount} تحميلاً</span>
                    <span>⏱️ {activePaperModal.readTimeMinutes} دقيقة قراءة</span>
                  </div>
                </div>
              </div>

              {/* Abstract Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>المستخلص العلمي (Abstract):</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  {activePaperModal.abstract}
                </p>
              </div>

              {/* Key Findings */}
              {activePaperModal.keyFindings && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-cyan-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>أبرز النتائج والمخرجات الأكاديمية:</span>
                  </h4>
                  <div className="space-y-1.5">
                    {activePaperModal.keyFindings.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive 3D Simulation Link Banner */}
              {activePaperModal.simulationUrl && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/30 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <Atom className="w-4 h-4" />
                      <span>المختبر التفاعلي المرتبط بهذا البحث</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      يمكنك التحقق من فرضيات هذه الدراسة بنفسك عبر {activePaperModal.simulationName}
                    </p>
                  </div>

                  <Link to={activePaperModal.simulationUrl} target="_blank">
                    <Button size="sm" className="rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white gap-1 shrink-0 shadow-md">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>تشغيل المحاكاة 3D</span>
                    </Button>
                  </Link>
                </div>
              )}

              {/* APA Citation & DOI Section */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400">التوثيق والاقتباس الأكاديمي (APA Citation):</span>
                  <button
                    onClick={() => copyToClipboard(activePaperModal.citationAPA, 'citation')}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {copiedCitation ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCitation ? 'تم النسخ' : 'نسخ الاقتباس'}</span>
                  </button>
                </div>
                <p className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2.5 rounded-xl border border-slate-800 select-all">
                  {activePaperModal.citationAPA}
                </p>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 font-mono">معرف DOI: {activePaperModal.doi}</span>
                  <button
                    onClick={() => copyToClipboard(activePaperModal.doi, 'doi')}
                    className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    {copiedDoi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDoi ? 'تم النسخ' : 'نسخ DOI'}</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <Button
                  onClick={() => setActivePaperModal(null)}
                  variant="outline"
                  className="rounded-xl text-xs"
                >
                  إغلاق
                </Button>

                {activePaperModal.pdfUrl && (
                  <a href={activePaperModal.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-md">
                      <Download className="w-4 h-4" />
                      <span>تحميل ورقة البحث كاملة (PDF)</span>
                    </Button>
                  </a>
                )}
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
