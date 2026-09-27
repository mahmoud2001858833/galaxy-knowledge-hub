import React, { useState, useEffect } from 'react';
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
  FolderPlus, 
  X,
  ZoomIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import UploadImageDrawer from '@/components/visualLibrary/UploadImageDrawer';
import { CURATED_VISUAL_ASSETS, VisualAsset } from '@/data/visualLibraryData';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export const VisualLibrary: React.FC = () => {
  const [assets, setAssets] = useState<VisualAsset[]>(CURATED_VISUAL_ASSETS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetModal, setSelectedAssetModal] = useState<VisualAsset | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Fetch additional user-uploaded images from Supabase
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
            subject: item.subject || 'physics',
            subjectLabel: item.subject === 'physics' ? 'الفيزياء' : item.subject === 'chemistry' ? 'الكيمياء' : item.subject === 'biology' ? 'الأحياء' : item.subject === 'mathematics' ? 'الرياضيات' : 'العلوم',
            category: 'مخططات ورسوم تعليمية',
            imageUrl: item.image_url,
            resolution: 'Full HD',
            tags: [item.subject || 'علوم', 'تعليم'],
            downloadsCount: 180
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

  // Filtered Assets
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === 'all' || asset.subject === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      asset.title.toLowerCase().includes(q) ||
      asset.description.toLowerCase().includes(q) ||
      asset.category.toLowerCase().includes(q) ||
      asset.tags.some(t => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'كافة المخططات والصور', icon: '🎨', count: assets.length },
    { id: 'physics', label: 'الفيزياء والكم والذرية', icon: '⚛️', count: assets.filter(a => a.subject === 'physics').length },
    { id: 'chemistry', label: 'الكيمياء والروابط الجزيئية', icon: '🧪', count: assets.filter(a => a.subject === 'chemistry').length },
    { id: 'biology', label: 'الوراثة والحمض النووي DNA', icon: '🧬', count: assets.filter(a => a.subject === 'biology').length },
    { id: 'robotics', label: 'الدوائر ومخططات Pinout', icon: '🤖', count: assets.filter(a => a.subject === 'robotics').length },
    { id: 'space', label: 'الفلك والثقوب السوداء', icon: '🌌', count: assets.filter(a => a.subject === 'space').length },
    { id: 'mathematics', label: 'الرسوم الفراغية والهندسة', icon: '📐', count: assets.filter(a => a.subject === 'mathematics').length },
  ];

  const handleDownload = (asset: VisualAsset) => {
    const link = document.createElement('a');
    link.href = asset.imageUrl;
    link.download = `${asset.title}.jpg`;
    link.target = '_blank';
    link.click();
    toast.success(`جاري تنزيل "${asset.title}" بالأبعاد الأصلية`);
  };

  const copyImageLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ رابط الصورة إلى الحافظة');
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#050814] text-slate-100 transition-colors duration-300 relative overflow-hidden" dir="rtl">
      <SEO 
        title="المكتبة البصرية التعليمية - Visual Educational Library" 
        description="استكشف مئات المخططات العلمية عالية الدقة 4K، الرسوم البيانية، ونماذج المحاكاة ثلاثية الأبعاد في الفيزياء، الكيمياء، والأحياء" 
        keywords="المكتبة البصرية, انفوجرافيك علمي, رسوم بيانية, فيزياء, كيمياء, ذروة العلم, مخططات 4K" 
      />

      <StarField starCount={400} />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10 max-w-7xl space-y-8">
        {/* Luxury Hero Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900/90 to-purple-950/70 border border-blue-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5 shadow-sm">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  المكتبة البصرية التعليمية فائقة الدقة (Visual Science Studio)
                </span>
                <Badge variant="outline" className="text-[11px] font-mono border-purple-400/30 text-purple-300">
                  4K Ultra-HD Diagrams
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-200 to-purple-300 leading-tight">
                أطلس المخططات العلمية والانفوجرافيك عالي الدقة
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                مكتبة متكاملة تضم مئات الرسوم التوضيحية، المخططات التشريحية، ومصفوفات الدوائر الإلكترونية المصممة خصيصاً لتبسيط مفاهيم المنهاج، والمربوطة مباشرة بمختبرات المحاكاة ثلاثية الأبعاد 3D.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <UploadImageDrawer />
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 text-[11px]">إجمالي المخططات الرقمية</span>
              <div className="text-xl font-black text-white">{assets.length} مخططاً علمياً</div>
              <span className="text-[10px] text-blue-400 font-bold">بدقة تصل إلى 4K</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[11px]">جاهزية التنزيل</span>
              <div className="text-xl font-black text-cyan-400">100% مفتوحة المصدر</div>
              <span className="text-[10px] text-slate-400">متاحة بجودة أصلية مجاناً</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[11px]">الارتباط بالمختبرات</span>
              <div className="text-xl font-black text-purple-400">محاكاة 3D حية</div>
              <span className="text-[10px] text-purple-300">فتح مباشر للتجربة التفاعلية</span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[11px]">مرات التنزيل والاستعراض</span>
              <div className="text-xl font-black text-emerald-400">
                {assets.reduce((acc, a) => acc + a.downloadsCount, 0).toLocaleString()} تحميلاً
              </div>
              <span className="text-[10px] text-emerald-300">مستخدمة في أوراق العمل المدرسية</span>
            </div>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400/50 shadow-lg shadow-blue-500/20 scale-[1.02]'
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

        {/* Search & Fast Filter Bar */}
        <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المخطط، المفهوم، أو الكلمات المفتاحية (مثال: بور، DNA، كريسبر، ليدار)..."
              className="h-10 pr-10 text-xs sm:text-sm rounded-2xl bg-slate-800/80 border-slate-700/80 text-slate-100 placeholder:text-slate-500"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            عرض {filteredAssets.length} من أصل {assets.length}
          </span>
        </div>

        {/* Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <motion.div
              key={asset.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-blue-500/40 shadow-xl overflow-hidden flex flex-col justify-between transition-all group hover:shadow-blue-500/10"
            >
              {/* Image Preview with Hover Overlay */}
              <div 
                onClick={() => setSelectedAssetModal(asset)}
                className="relative h-56 overflow-hidden cursor-pointer bg-slate-950"
              >
                <img 
                  src={asset.imageUrl} 
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Resolution Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <Badge className="bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-400/30 text-[10px] font-mono font-bold">
                    {asset.resolution}
                  </Badge>
                  <Badge className="bg-blue-600/90 text-white text-[10px] font-bold">
                    {asset.subjectLabel}
                  </Badge>
                </div>

                {/* Hover Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-xs">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-lg">
                    <Maximize2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-bold text-slate-200">{asset.category}</span>
                  <span className="text-slate-400 font-mono">📥 {asset.downloadsCount} تحميلاً</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-white group-hover:text-blue-300 transition-colors leading-snug">
                    {asset.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {asset.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {asset.tags.map((t, idx) => (
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
                    className="flex-1 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-500/20 gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>معاينة وتكبير</span>
                  </Button>

                  {asset.simulationUrl && (
                    <Link to={asset.simulationUrl} target="_blank">
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-xl border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                        title={asset.simulationName || 'فتح المحاكاة ثلاثية الأبعاد 3D'}
                      >
                        <Atom className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}

                  <Button
                    onClick={() => handleDownload(asset)}
                    size="icon"
                    variant="outline"
                    className="rounded-xl border-slate-700 text-slate-300 hover:text-white"
                    title="تنزيل بالأبعاد الكاملة"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-600" />
            <p className="text-sm font-bold">لا توجد مخططات أو صور تعليمية مطابقة لبحثك.</p>
            <p className="text-xs text-slate-500">جرب البحث بكلمات أخرى أو تصفح كافة الأقسام.</p>
          </div>
        )}
      </main>

      {/* Interactive Lightbox Modal */}
      <AnimatePresence>
        {selectedAssetModal && (
          <Dialog open={!!selectedAssetModal} onOpenChange={() => setSelectedAssetModal(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-800 text-slate-100 rounded-3xl p-6 space-y-6" dir="rtl">
              <DialogHeader className="text-right space-y-2 pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs">
                      {selectedAssetModal.subjectLabel}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono border-cyan-400/40 text-cyan-400">
                      {selectedAssetModal.resolution}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    📥 {selectedAssetModal.downloadsCount} تحميلاً
                  </span>
                </div>

                <DialogTitle className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {selectedAssetModal.title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-400">
                  {selectedAssetModal.category}
                </DialogDescription>
              </DialogHeader>

              {/* Lightbox Main Image Display */}
              <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center min-h-[350px]">
                <img 
                  src={selectedAssetModal.imageUrl} 
                  alt={selectedAssetModal.title}
                  className={`max-h-[500px] w-auto object-contain transition-transform duration-300 ${
                    isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />

                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-xs text-white border border-slate-700 flex items-center gap-1.5"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>{isZoomed ? 'تصغير' : 'تكبير 150%'}</span>
                </button>
              </div>

              {/* Description & Scientific Details */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-cyan-400">الشرح العلمي والتفاصيل المنهجية:</h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedAssetModal.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedAssetModal.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related 3D Simulation Link Banner */}
              {selectedAssetModal.simulationUrl && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/30 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Atom className="w-4 h-4 text-purple-400" />
                      <span>المختبر التفاعلي المرتبط بهذا الرسم البياني</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      جرّب المفهوم عملياً داخل {selectedAssetModal.simulationName}
                    </p>
                  </div>

                  <Link to={selectedAssetModal.simulationUrl} target="_blank">
                    <Button size="sm" className="rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white gap-1 shrink-0 shadow-md">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>تشغيل المحاكاة 3D</span>
                    </Button>
                  </Link>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <Button
                  onClick={() => setSelectedAssetModal(null)}
                  variant="outline"
                  className="rounded-xl text-xs"
                >
                  إغلاق
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => copyImageLink(selectedAssetModal.imageUrl)}
                    variant="outline"
                    className="rounded-xl text-xs gap-1 border-slate-700"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الرابط</span>
                  </Button>

                  <Button
                    onClick={() => handleDownload(selectedAssetModal)}
                    className="rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>تنزيل المخطط بالأبعاد الكاملة (4K)</span>
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
