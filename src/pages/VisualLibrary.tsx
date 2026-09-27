import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import StarField from '@/components/StarField';
import Footer from '@/components/Footer';
import { 
  Image as ImageIcon, 
  Search, 
  Sparkles, 
  Download, 
  ExternalLink, 
  Maximize2, 
  Eye, 
  Atom, 
  Play, 
  Check, 
  Copy, 
  Share2, 
  Layers, 
  Tag, 
  X,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  LayoutGrid,
  ListFilter,
  Grid3X3,
  RotateCcw,
  CheckCircle2,
  FileDown,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import UploadImageDrawer from '@/components/visualLibrary/UploadImageDrawer';
import { CURATED_VISUAL_ASSETS, VisualAsset, AssetSubject, AssetType, EducationalLevel } from '@/data/visualLibraryData';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export const VisualLibrary: React.FC = () => {
  const [assets, setAssets] = useState<VisualAsset[]>(CURATED_VISUAL_ASSETS);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedResolution, setSelectedResolution] = useState<string>('all');
  const [onlyWithSimulations, setOnlyWithSimulations] = useState<boolean>(false);
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'downloads' | 'views' | 'recent' | 'title'>('downloads');
  const [viewMode, setViewMode] = useState<'grid' | 'detailed' | 'compact'>('grid');
  const [selectedAssetModal, setSelectedAssetModal] = useState<VisualAsset | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Fetch user-uploaded educational images from Supabase
  useEffect(() => {
    const fetchSupabaseImages = async () => {
      try {
        const { data, error } = await supabase
          .from('educational_images')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted: VisualAsset[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description || 'مخطط تعليمي عالي الدقة منشور في منصة ذروة العلم.',
            subject: (item.subject || 'physics') as AssetSubject,
            subjectLabel: item.subject === 'physics' ? 'الفيزياء' : item.subject === 'chemistry' ? 'الكيمياء' : item.subject === 'biology' ? 'الأحياء' : item.subject === 'mathematics' ? 'الرياضيات' : 'العلوم',
            category: 'مخططات ورسوم تعليمية',
            imageUrl: item.image_url,
            resolution: 'Full HD',
            assetType: 'diagram' as AssetType,
            assetTypeLabel: 'مخطط تعليمي',
            level: 'secondary' as EducationalLevel,
            levelLabel: 'المرحلة الثانوية',
            tags: [item.subject || 'علوم', 'تعليم', 'مخطط'],
            downloadsCount: 180,
            viewsCount: 420
          }));

          setAssets(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const newOnes = formatted.filter(f => !existingIds.has(f.id));
            return [...newOnes, ...prev];
          });
        }
      } catch (err) {
        console.warn('Could not load extra images from Supabase:', err);
      }
    };

    fetchSupabaseImages();
  }, []);

  // Filter & Sort Logic
  const filteredAssets = useMemo(() => {
    return assets
      .filter(asset => {
        const matchesSubject = selectedSubject === 'all' || asset.subject === selectedSubject;
        const matchesType = selectedType === 'all' || asset.assetType === selectedType;
        const matchesLevel = selectedLevel === 'all' || asset.level === selectedLevel || asset.level === 'all-levels';
        const matchesRes = selectedResolution === 'all' || 
          (selectedResolution === '4k' && (asset.resolution.includes('4K') || asset.resolution.includes('3840'))) ||
          (selectedResolution === 'vector' && asset.resolution.toLowerCase().includes('vector'));
        const matchesSim = !onlyWithSimulations || !!asset.simulationUrl;
        const matchesFeatured = !onlyFeatured || !!asset.isFeatured;

        const q = searchQuery.trim().toLowerCase();
        const matchesSearch = !q || 
          asset.title.toLowerCase().includes(q) ||
          asset.description.toLowerCase().includes(q) ||
          asset.category.toLowerCase().includes(q) ||
          asset.subjectLabel.toLowerCase().includes(q) ||
          asset.tags.some(t => t.toLowerCase().includes(q));

        return matchesSubject && matchesType && matchesLevel && matchesRes && matchesSim && matchesFeatured && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'downloads') return b.downloadsCount - a.downloadsCount;
        if (sortBy === 'views') return b.viewsCount - a.viewsCount;
        if (sortBy === 'title') return a.title.localeCompare(b.title, 'ar');
        return b.id.localeCompare(a.id); // pseudo-recent
      });
  }, [assets, selectedSubject, selectedType, selectedLevel, selectedResolution, onlyWithSimulations, onlyFeatured, searchQuery, sortBy]);

  const hasActiveFilters = selectedSubject !== 'all' || selectedType !== 'all' || selectedLevel !== 'all' || selectedResolution !== 'all' || onlyWithSimulations || onlyFeatured || searchQuery !== '';

  const resetFilters = () => {
    setSelectedSubject('all');
    setSelectedType('all');
    setSelectedLevel('all');
    setSelectedResolution('all');
    setOnlyWithSimulations(false);
    setOnlyFeatured(false);
    setSearchQuery('');
    setSortBy('downloads');
  };

  const subjectTabs = [
    { id: 'all', label: 'كافة العلوم', icon: '🌌', count: assets.length },
    { id: 'physics', label: 'الفيزياء والكم', icon: '⚛️', count: assets.filter(a => a.subject === 'physics').length },
    { id: 'chemistry', label: 'الكيمياء والروابط', icon: '🧪', count: assets.filter(a => a.subject === 'chemistry').length },
    { id: 'biology', label: 'الأحياء والجينات', icon: '🧬', count: assets.filter(a => a.subject === 'biology').length },
    { id: 'space', label: 'الفلك والكونيات', icon: '🪐', count: assets.filter(a => a.subject === 'space').length },
    { id: 'robotics', label: 'الروبوتات والذكاء', icon: '🤖', count: assets.filter(a => a.subject === 'robotics').length },
    { id: 'mathematics', label: 'الرياضيات الفراغية', icon: '📐', count: assets.filter(a => a.subject === 'mathematics').length },
  ];

  const typePills = [
    { id: 'all', label: 'الكل' },
    { id: 'infographic', label: 'انفوجرافيك تحليلي' },
    { id: '3d-model', label: 'مجسمات 3D تفاعلية' },
    { id: 'diagram', label: 'مخططات تقنية وبيانية' },
    { id: 'schematic', label: 'دوائر و Pinout' },
    { id: 'atlas', label: 'أطالس وخرائط' },
  ];

  const handleDownload = (asset: VisualAsset) => {
    const link = document.createElement('a');
    link.href = asset.imageUrl;
    link.download = `${asset.title}.jpg`;
    link.target = '_blank';
    link.click();
    toast.success(`جاري تنزيل "${asset.title}" بأقصى دقة أصلية (${asset.resolution})`);
  };

  const copyImageLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success('تم نسخ رابط الأصل البصري بنجاح');
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#030712] text-slate-100 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      <SEO 
        title="المكتبة البصرية العلمية 3D فائقة الدقة - Visual Science Studio" 
        description="استكشف مئات المخططات العلمية عالية الدقة 4K، الرسوم البيانية، ونماذج المحاكاة ثلاثية الأبعاد في الفيزياء، الكيمياء، الأحياء، والفلك" 
        keywords="المكتبة البصرية, انفوجرافيك علمي, رسوم بيانية, فيزياء, كيمياء, ذروة العلم, مخططات 4K, نماذج 3D" 
      />

      <StarField starCount={400} />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 max-w-7xl space-y-8">
        
        {/* Luxury Hero Banner with Cosmic Neon Accents */}
        <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-950/80 via-slate-900/90 to-cyan-950/70 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-2xl overflow-hidden">
          {/* Glowing orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-2 shadow-sm">
                  <ImageIcon className="w-4 h-4 text-cyan-400 animate-pulse" />
                  أطلس المخططات العلمية التفاعلية (Visual Science Atlas)
                </span>
                <Badge variant="outline" className="text-xs font-mono border-blue-400/40 text-blue-300 bg-blue-950/40">
                  4K Ultra-HD & Vector SVG
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  ✓ معتمدة وفق المناهج الحديثة
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 leading-tight">
                المكتبة البصرية والمخططات العلمية 3D
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                بوابتك الرقمية المرئية لمئات المخططات التشريحية، الرسوم البيانية الدقيقة، والتراكيب الجزيئية ثلاثية الأبعاد المصممة خصيصاً لتبسيط النظريات المعقدة وربطها مباشرة بالمختبرات الافتراضية.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <UploadImageDrawer />
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-cyan-500/20 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">إجمالي المخططات الرقمية</span>
              <div className="text-2xl font-black text-white mt-1">{assets.length} مخططاً</div>
              <span className="text-[10px] text-cyan-400 font-bold">بدقة فائقة حتى 4K</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">مربوطة بمختبرات حية</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {assets.filter(a => !!a.simulationUrl).length} تجربة 3D
              </div>
              <span className="text-[10px] text-cyan-300">فتح مباشر للمختبر الافتراضي</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">مجالات العلوم المغطاة</span>
              <div className="text-2xl font-black text-blue-400 mt-1">6 تخصصات رئيسية</div>
              <span className="text-[10px] text-slate-400">فيزياء • كيمياء • أحياء • فلك</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">التنزيلات والاستخدام</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {assets.reduce((acc, a) => acc + a.downloadsCount, 0).toLocaleString()} تحميلاً
              </div>
              <span className="text-[10px] text-emerald-300">متاحة مجاناً للطلبة والمعلمين</span>
            </div>
          </div>
        </div>

        {/* Main Controls & Deep Filtering Studio */}
        <div className="space-y-4">
          
          {/* Subject Pills Slider */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {subjectTabs.map((cat) => {
              const isSelected = selectedSubject === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSubject(cat.id)}
                  className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white border-cyan-400/60 shadow-lg shadow-cyan-500/25 scale-[1.03]'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white hover:bg-slate-850'
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

          {/* Filter Bar 1: Search + Fast Filter Switches + Sort & View Modes */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-4">
            
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-cyan-400 absolute right-4 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم المخطط، المفهوم العلمي، أو الكلمات المفتاحية (مثال: بور، DNA، كريسبر، ليدار، سنيل)..."
                  className="h-11 pr-11 pl-10 text-xs sm:text-sm rounded-2xl bg-slate-950/80 border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
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

              {/* Controls Group */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between lg:justify-end">
                {/* Sort selector */}
                <div className="flex items-center gap-1.5 text-xs bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 shrink-0">الترتيب:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-cyan-300 font-bold border-none outline-none cursor-pointer text-xs"
                  >
                    <option value="downloads" className="bg-slate-900 text-slate-200">الأكثر تحميلاً</option>
                    <option value="views" className="bg-slate-900 text-slate-200">الأكثر مشاهدة</option>
                    <option value="recent" className="bg-slate-900 text-slate-200">الأحدث إضافة</option>
                    <option value="title" className="bg-slate-900 text-slate-200">أبجدياً (أ-ي)</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="عرض الشبكة القياسي"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`p-2 rounded-xl transition-all ${
                      viewMode === 'detailed' 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="عرض البطاقات التفصيلية"
                  >
                    <ListFilter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`p-2 rounded-xl transition-all ${
                      viewMode === 'compact' 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="معرض الصور المصغر"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Bar 2: Secondary Facets (Type, Level, Resolution, Fast Toggles) */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Content Type Filter */}
                <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-2xl border border-slate-800/80">
                  {typePills.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                        selectedType === t.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Level selector */}
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="h-8 px-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 font-medium"
                >
                  <option value="all">كافة المراحل الدراسية</option>
                  <option value="basic">المرحلة الأساسية</option>
                  <option value="secondary">المرحلة الثانوية</option>
                  <option value="university-btec">مسار BTEC والجامعي</option>
                </select>

                {/* Resolution selector */}
                <select
                  value={selectedResolution}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                  className="h-8 px-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 font-medium"
                >
                  <option value="all">كافة دقات العرض</option>
                  <option value="4k">دقة فائقة 4K Ultra-HD</option>
                  <option value="vector">رسوم متجهة Vector SVG</option>
                </select>
              </div>

              {/* Quick Toggle Checkboxes & Reset */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* 3D Simulation Only Toggle */}
                <button
                  onClick={() => setOnlyWithSimulations(!onlyWithSimulations)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                    onlyWithSimulations
                      ? 'bg-purple-500/20 text-purple-300 border-purple-400/50 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Atom className="w-3.5 h-3.5 text-purple-400" />
                  <span>مربوطة بمختبر 3D فقط</span>
                  {onlyWithSimulations && <Check className="w-3 h-3 text-purple-400" />}
                </button>

                {/* Featured Toggle */}
                <button
                  onClick={() => setOnlyFeatured(!onlyFeatured)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border flex items-center gap-1.5 ${
                    onlyFeatured
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>المختارة والمميزة</span>
                  {onlyFeatured && <Check className="w-3 h-3 text-amber-400" />}
                </button>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة ضبط ({filteredAssets.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Results count banner */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
              <span className="font-mono">
                يتم عرض <strong className="text-cyan-400">{filteredAssets.length}</strong> من أصل {assets.length} أصلاً بيانياً
              </span>
              {hasActiveFilters && (
                <span className="text-[11px] text-amber-300/80">الفلاتر المتقدمة مفعّلة</span>
              )}
            </div>
          </div>
        </div>

        {/* Assets Cards Grid Display */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 shadow-xl overflow-hidden flex flex-col justify-between transition-all group hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1 duration-300"
              >
                {/* Image Preview with Hover Overlay */}
                <div 
                  onClick={() => setSelectedAssetModal(asset)}
                  className="relative h-60 overflow-hidden cursor-pointer bg-slate-950"
                >
                  <img 
                    src={asset.imageUrl} 
                    alt={asset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap">
                    <Badge className="bg-slate-950/90 backdrop-blur-md text-cyan-300 border border-cyan-400/30 text-[10px] font-mono font-bold shadow-sm">
                      {asset.resolution}
                    </Badge>
                    <Badge className="bg-blue-600/90 text-white text-[10px] font-bold shadow-sm">
                      {asset.subjectLabel}
                    </Badge>
                    {asset.isFeatured && (
                      <Badge className="bg-amber-500/90 text-slate-950 text-[10px] font-black">
                        ★ مميز
                      </Badge>
                    )}
                  </div>

                  {/* Top Left: Level Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/80">
                      {asset.levelLabel}
                    </span>
                  </div>

                  {/* Center Hover Action */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-xs">
                    <div className="p-3.5 rounded-2xl bg-cyan-500/20 backdrop-blur-md text-cyan-200 border border-cyan-400/40 shadow-xl flex items-center gap-2">
                      <Maximize2 className="w-5 h-5 text-cyan-300" />
                      <span className="text-xs font-bold">معاينة وتكبير 4K</span>
                    </div>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-[11px] text-slate-300">
                    <span className="font-bold text-slate-200 bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-md">
                      {asset.assetTypeLabel}
                    </span>
                    <span className="text-slate-300 font-mono bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-md">
                      📥 {asset.downloadsCount.toLocaleString()} تحميلاً
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
                      {asset.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {asset.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {asset.tags.slice(0, 4).map((t, idx) => (
                      <span 
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <Button
                      onClick={() => setSelectedAssetModal(asset)}
                      size="sm"
                      className="flex-1 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة وتكبير</span>
                    </Button>

                    {asset.simulationUrl && (
                      <Link to={asset.simulationUrl} target="_blank">
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-xl border-purple-500/40 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
                          title={asset.simulationName || 'فتح المختبر التفاعلي 3D'}
                        >
                          <Atom className="w-4 h-4 animate-spin-slow" />
                        </Button>
                      </Link>
                    )}

                    <Button
                      onClick={() => handleDownload(asset)}
                      size="icon"
                      variant="outline"
                      className="rounded-xl border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40"
                      title="تنزيل بالأبعاد الأصلية"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View Mode: Detailed Horizontal Cards */}
        {viewMode === 'detailed' && (
          <div className="space-y-4">
            {filteredAssets.map((asset) => (
              <motion.div
                key={asset.id}
                layout
                className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-6 shadow-xl transition-all group"
              >
                <div 
                  onClick={() => setSelectedAssetModal(asset)}
                  className="w-full sm:w-64 h-44 rounded-2xl overflow-hidden shrink-0 relative cursor-pointer bg-slate-950"
                >
                  <img 
                    src={asset.imageUrl} 
                    alt={asset.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono font-bold bg-slate-950/80 px-2 py-0.5 rounded text-cyan-300">
                    {asset.resolution}
                  </span>
                </div>

                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-blue-600/90 text-white text-[10px]">{asset.subjectLabel}</Badge>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">{asset.assetTypeLabel}</Badge>
                    <span className="text-xs text-slate-400">{asset.levelLabel}</span>
                    <span className="text-xs text-slate-500 font-mono mr-auto">📥 {asset.downloadsCount} تحميلاً</span>
                  </div>

                  <h3 
                    onClick={() => setSelectedAssetModal(asset)}
                    className="text-lg font-black text-white hover:text-cyan-300 cursor-pointer transition-colors"
                  >
                    {asset.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {asset.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {asset.simulationUrl && (
                        <Link to={asset.simulationUrl} target="_blank">
                          <Button size="sm" variant="outline" className="rounded-xl border-purple-500/40 text-purple-400 hover:bg-purple-500/20 text-xs gap-1.5">
                            <Atom className="w-3.5 h-3.5" />
                            <span>المختبر 3D</span>
                          </Button>
                        </Link>
                      )}
                      <Button
                        onClick={() => handleDownload(asset)}
                        size="sm"
                        className="rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تنزيل</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View Mode: Compact Gallery */}
        {viewMode === 'compact' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredAssets.map((asset) => (
              <motion.div
                key={asset.id}
                layout
                onClick={() => setSelectedAssetModal(asset)}
                className="group relative h-44 rounded-2xl overflow-hidden cursor-pointer bg-slate-950 border border-slate-800 hover:border-cyan-500/60 shadow-lg transition-all"
              >
                <img 
                  src={asset.imageUrl} 
                  alt={asset.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-2 right-2 left-2 space-y-1">
                  <span className="text-[9px] font-bold text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded inline-block">
                    {asset.subjectLabel}
                  </span>
                  <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                    {asset.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredAssets.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-4">
            <ImageIcon className="w-16 h-16 mx-auto text-slate-600" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">لا توجد مخططات علمية مطابقة لمعايير البحث والفلترة</h3>
              <p className="text-xs text-slate-400">جرب البحث بكلمات أخرى أو قم بإلغاء بعض الفلاتر المفعلة.</p>
            </div>
            <Button onClick={resetFilters} className="rounded-xl text-xs font-bold bg-cyan-600 text-white">
              إعادة ضبط كافة الفلاتر
            </Button>
          </div>
        )}

      </main>

      {/* Luxury Interactive Lightbox Modal */}
      <AnimatePresence>
        {selectedAssetModal && (
          <Dialog open={!!selectedAssetModal} onOpenChange={() => { setSelectedAssetModal(null); setIsZoomed(false); }}>
            <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-950/95 border-cyan-500/30 text-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(6,182,212,0.2)] backdrop-blur-2xl" dir="rtl">
              <DialogHeader className="text-right space-y-3 pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs">
                      {selectedAssetModal.subjectLabel}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono border-blue-400/40 text-blue-300">
                      {selectedAssetModal.resolution}
                    </Badge>
                    <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      {selectedAssetModal.assetTypeLabel}
                    </span>
                    <span className="text-xs text-purple-300 bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/30">
                      {selectedAssetModal.levelLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>👁️ {selectedAssetModal.viewsCount.toLocaleString()} مشاهدة</span>
                    <span>📥 {selectedAssetModal.downloadsCount.toLocaleString()} تنزيلاً</span>
                  </div>
                </div>

                <DialogTitle className="text-xl sm:text-3xl font-black text-white leading-tight">
                  {selectedAssetModal.title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-400">
                  {selectedAssetModal.category} • مرجع علمي رقمي مفتوح المصدر للطلبة والمعلمين
                </DialogDescription>
              </DialogHeader>

              {/* Lightbox Main Image Display with Pan & Zoom */}
              <div className="relative rounded-3xl overflow-hidden bg-black/80 border border-slate-800 flex items-center justify-center min-h-[380px] p-2">
                <img 
                  src={selectedAssetModal.imageUrl} 
                  alt={selectedAssetModal.title}
                  className={`max-h-[550px] w-auto object-contain transition-transform duration-300 select-none ${
                    isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />

                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-xs font-bold text-white border border-slate-700 flex items-center gap-2 shadow-lg hover:border-cyan-400"
                  >
                    {isZoomed ? <ZoomOut className="w-4 h-4 text-cyan-400" /> : <ZoomIn className="w-4 h-4 text-cyan-400" />}
                    <span>{isZoomed ? 'تصغير (100%)' : 'تكبير الفحص (150%)'}</span>
                  </button>
                </div>

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-xs font-mono text-cyan-300 border border-cyan-500/30">
                    {selectedAssetModal.resolution}
                  </span>
                </div>
              </div>

              {/* Description & Scientific Details */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>الشرح العلمي والتفاصيل المنهجية المعتمدة:</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedAssetModal.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                  {selectedAssetModal.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2.5 py-1 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related 3D Simulation Link Banner */}
              {selectedAssetModal.simulationUrl && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900/80 to-blue-950/60 border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-purple-300 flex items-center gap-2">
                      <Atom className="w-5 h-5 text-purple-400 animate-spin-slow" />
                      <span>المختبر التفاعلي المرتبط بهذا الرسم البياني</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      جرّب المفهوم عملياً داخل مختبر محاكاة: <strong className="text-white">{selectedAssetModal.simulationName}</strong>
                    </p>
                  </div>

                  <Link to={selectedAssetModal.simulationUrl} target="_blank">
                    <Button className="rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white gap-2 shrink-0 shadow-lg shadow-purple-500/25">
                      <Play className="w-4 h-4 fill-current" />
                      <span>تشغيل المختبر 3D الآن</span>
                    </Button>
                  </Link>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                <Button
                  onClick={() => { setSelectedAssetModal(null); setIsZoomed(false); }}
                  variant="outline"
                  className="rounded-xl text-xs border-slate-800 text-slate-400 hover:text-white"
                >
                  إغلاق النافذة
                </Button>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={() => copyImageLink(selectedAssetModal.imageUrl)}
                    variant="outline"
                    className="rounded-xl text-xs gap-1.5 border-slate-700 hover:border-slate-600 text-slate-200"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط المباشر'}</span>
                  </Button>

                  <Button
                    onClick={() => handleDownload(selectedAssetModal)}
                    className="rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white gap-2 shadow-lg shadow-cyan-500/25"
                  >
                    <Download className="w-4 h-4" />
                    <span>تنزيل الأصل البصري بالدقة الكاملة ({selectedAssetModal.resolution})</span>
                  </Button>
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

export default VisualLibrary;
