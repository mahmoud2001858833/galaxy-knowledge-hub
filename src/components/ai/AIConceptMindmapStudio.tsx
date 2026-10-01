import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BrainCircuit, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Printer, 
  Maximize2, 
  Minimize2, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  BookOpen, 
  Atom, 
  Share2, 
  Search, 
  Check, 
  Info,
  Lightbulb,
  Cpu,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { geminiMultimodalService, type MindmapTreeNode } from '@/services/geminiMultimodalService';

// Curated Initial Jordanian Curriculum Mindmaps for Instant Pre-load
const INITIAL_CURRICULUM_MINDMAPS: { [key: string]: { rootTitle: string; discipline: string; grade: string; nodes: MindmapTreeNode[] } } = {
  faraday: {
    rootTitle: 'الحث الكهرومغناطيسي وقانون فاراداي ولينز',
    discipline: 'فيزياء',
    grade: 'توجيهي علمي',
    nodes: [
      {
        id: 'flux',
        label: 'التدفق المغناطيسي (Magnetic Flux)',
        category: 'المفهوم الأساسي',
        color: '#38bdf8',
        description: 'عدد خطوط المجال المغناطيسي التي تخترق وحدة المساحة عمودياً عليها.',
        formula: 'Φ = B · A · cos(θ)',
        children: [
          { id: 'flux-factors', label: 'عوامل التدفق', category: 'متغيرات', color: '#0284c7', description: 'شدة المجال (B)، مساحة السطح (A)، والزاوية (θ).' },
          { id: 'flux-unit', label: 'وحدة القياس: ويبر (Weber)', category: 'وحدات', color: '#0284c7', description: '1 ويبر = 1 تسلا × 1 م² = 1 فولت × ثانية.' }
        ]
      },
      {
        id: 'faraday-law',
        label: 'قانون فاراداي في الحث',
        category: 'القانون المركزي',
        color: '#a855f7',
        description: 'القوة الدافعة الكهربائية الحثية تتناسب طردياً مع المعدل الزمني لتغير التدفق المغناطيسي.',
        formula: 'ε = -N · (ΔΦ / Δt)',
        children: [
          { id: 'faraday-emf', label: 'القوة الدافعة الحثية (ε)', category: 'جهد', color: '#9333ea', description: 'جهد حثي ينشأ في الدارة المغلقة مسبباً تياراً حثياً.' },
          { id: 'faraday-rate', label: 'المعدل الزمني (ΔΦ/Δt)', category: 'اشتقاق', color: '#9333ea', description: 'ميل منحنى التدفق بالنسبة للزمن.' }
        ]
      },
      {
        id: 'lenz-law',
        label: 'قانون لينز والاتجاه',
        category: 'قانون حفظ الطاقة',
        color: '#10b981',
        description: 'يكون اتجاه التيار الحثي بحيث يولد مجالاً مغناطيسياً حثياً يقاوم التغير في التدفق المسبب له.',
        formula: 'إشارة السالب (-) في قانون فاراداي',
        children: [
          { id: 'lenz-increase', label: 'عند زيادة التدفق (تقريب مغناطيس)', category: 'مقاومة زيادة', color: '#059669', description: 'ينشأ مجال حثي معاكس للمجال الأصلي للتنافر.' },
          { id: 'lenz-decrease', label: 'عند نقصان التدفق (إبعاد مغناطيس)', category: 'مقاومة نقصان', color: '#059669', description: 'ينشأ مجال حثي باتجاه المجال الأصلي للتجاذب.' }
        ]
      },
      {
        id: 'apps',
        label: 'التطبيقات العملية والهندسية',
        category: 'تكنولوجيا وحياة',
        color: '#f59e0b',
        description: 'استثمار الحث الكهرومغناطيسي في الحضارة المعاصرة.',
        formula: 'كفاءة المحول: η = (P_out / P_in) × 100%',
        children: [
          { id: 'generator', label: 'المولدات الكهربائية (AC Generators)', category: 'توليد طاقة', color: '#d97706', description: 'تحويل الطاقة الميكانيكية إلى طاقة كهربائية دورانية.' },
          { id: 'transformer', label: 'المحولات الكهربائية (Transformers)', category: 'نقل القدرة', color: '#d97706', description: 'رفع وخفض الجهد المتناوب بكفاءة عالية عبر الحث المتبادل.' },
          { id: 'induction-cooker', label: 'طباخات الحث والفرامل المغناطيسية', category: 'تيارات دوامية', color: '#d97706', description: 'استخدام التيارات الدوامية (Eddy Currents) للتسخين أو الكبح السريع.' }
        ]
      }
    ]
  },
  equilibrium: {
    rootTitle: 'الاتزان الكيميائي ومبدأ لوشاتيليه',
    discipline: 'كيمياء',
    grade: 'توجيهي علمي',
    nodes: [
      {
        id: 'eq-concept',
        label: 'حالة الاتزان الديناميكي',
        category: 'تعريف أساسي',
        color: '#38bdf8',
        description: 'تساوي سرعتي التفاعل الأمامي والعكسي مع ثبوت تراكيز المواد المتفاعلة والناتجة.',
        formula: 'Rate(forward) = Rate(reverse)',
        children: [
          { id: 'eq-dynamic', label: 'اتزان ديناميكي لا استاتيكي', category: 'طبيعة', color: '#0284c7', description: 'التفاعلات مستمرة على المستوى الجزيئي وغير متوقفة.' }
        ]
      },
      {
        id: 'keq',
        label: 'ثابت الاتزان (Keq / Kc)',
        category: 'قانون رياضي',
        color: '#a855f7',
        description: 'حاصل ضرب تراكيز النواتج مقسوماً على المتفاعلات كل منها مرفوع لأس معامله.',
        formula: 'Kc = [C]^c · [D]^d / ([A]^a · [B]^b)',
        children: [
          { id: 'keq-value', label: 'دلالة قيمة Kc', category: 'تفسير', color: '#9333ea', description: 'Kc >> 1 يفضل النواتج، Kc << 1 يفضل المتفاعلات.' }
        ]
      },
      {
        id: 'le-chatelier',
        label: 'مبدأ لوشاتيليه والعوامل المؤثرة',
        category: 'قاعدة التدخل',
        color: '#10b981',
        description: 'إذا طرأ تغير على نظام في حالة اتزان، فإن النظام يعدل نفسه ليقلل من أثر هذا التغير.',
        formula: 'إزاحة موضع الاتزان (يمين / يسار)',
        children: [
          { id: 'le-conc', label: 'تأثير التركيز', category: 'عامل', color: '#059669', description: 'إضافة مادة تزيح الاتزان للطرف الآخر لاستهلاكها.' },
          { id: 'le-temp', label: 'تأثير درجة الحرارة', category: 'عامل وحيد يغير Kc', color: '#059669', description: 'في الماص: رفع الحرارة يزيح يميناً ويزيد Kc. في الطارد: العكس.' },
          { id: 'le-press', label: 'تأثير الضغط والحجم (للغازات)', category: 'عامل', color: '#059669', description: 'زيادة الضغط تزيح التفاعل نحو عدد المولات الغازية الأقل.' }
        ]
      }
    ]
  }
};

export const AIConceptMindmapStudio: React.FC = () => {
  // Input Form State
  const [topicInput, setTopicInput] = useState<string>('الحث الكهرومغناطيسي وقانون فاراداي ولينز');
  const [gradeLevel, setGradeLevel] = useState<string>('توجيهي علمي');
  const [discipline, setDiscipline] = useState<string>('فيزياء');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active Mindmap Tree
  const [currentMindmap, setCurrentMindmap] = useState<{
    rootTitle: string;
    discipline: string;
    grade: string;
    nodes: MindmapTreeNode[];
  }>(INITIAL_CURRICULUM_MINDMAPS.faraday);

  // Canvas View Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({
    flux: true,
    'faraday-law': true,
    'lenz-law': true,
    apps: true,
    'eq-concept': true,
    keq: true,
    'le-chatelier': true
  });
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<MindmapTreeNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const mindmapContainerRef = useRef<HTMLDivElement | null>(null);

  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Generate with AI
  const handleGenerateMindmap = async () => {
    if (!topicInput.trim()) {
      toast.error('يرجى كتابة عنوان المفهوم أو الدرس المطلوب');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedNodes = await geminiMultimodalService.generateMindmapHierarchy(
        topicInput,
        gradeLevel,
        discipline
      );

      setCurrentMindmap({
        rootTitle: topicInput,
        discipline,
        grade: gradeLevel,
        nodes: generatedNodes
      });

      // Expand all root nodes by default
      const initialExpanded: { [key: string]: boolean } = {};
      generatedNodes.forEach(node => {
        initialExpanded[node.id] = true;
      });
      setExpandedNodes(initialExpanded);

      toast.success('تم توليد الخريطة المفاهيمية بالذكاء الاصطناعي بنجاح!');
    } catch (err: any) {
      toast.error(err?.message || 'تعذر توليد الخريطة الذهنية');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export as PNG
  const handleExportPNG = async () => {
    if (!mindmapContainerRef.current) return;
    toast.info('جاري معالجة وتصدير الخريطة الذهنية بجودة فائقة...');
    
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(mindmapContainerRef.current, {
        scale: 2,
        backgroundColor: '#070919',
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `mindmap-${currentMindmap.rootTitle.replace(/\s+/g, '_')}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('تم تحميل صورة الخريطة الذهنية بنجاح!');
    } catch (err) {
      toast.error('حدث خطأ أثناء تصدير الصورة');
    }
  };

  return (
    <div className="w-full space-y-6 text-slate-900 dark:text-slate-100 font-sans" dir="rtl">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-cyan-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-md font-bold">
                استوديو الخرائط المفاهيمية التفاعلية 2.0 (AI Concept Maps)
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/30 font-bold">
                تحويل الدروس إلى شبكات بصرية
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              مولد الخرائط الذهنية الذكية للمناهج العلمية
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
              اكتب اسم أي درس من مناهج التوجيهي أو BTEC، وسيقوم الذكاء الاصطناعي بربط المفاهيم، وتوليد القوانين والعلاقات الرياضية، وتصدير خريطة تفاعلية قابلة للطي والطباعة.
            </p>
          </div>

          {/* Quick Presets Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentMindmap(INITIAL_CURRICULUM_MINDMAPS.faraday);
                setTopicInput(INITIAL_CURRICULUM_MINDMAPS.faraday.rootTitle);
              }}
              className="bg-white/15 border-white/30 text-white hover:bg-white/25 rounded-2xl text-xs gap-1"
            >
              <Atom className="w-3.5 h-3.5" />
              <span>خريطة فاراداي</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentMindmap(INITIAL_CURRICULUM_MINDMAPS.equilibrium);
                setTopicInput(INITIAL_CURRICULUM_MINDMAPS.equilibrium.rootTitle);
              }}
              className="bg-white/15 border-white/30 text-white hover:bg-white/25 rounded-2xl text-xs gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>خريطة الاتزان الكيميائي</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Generator Prompt Bar */}
      <div className="p-4 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>عنوان المفهوم العلمي أو الدرس المستهدف:</span>
            </label>
            <Input
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="مثال: قوانين كبلر في الفلك، سرعة التفاعل الكيميائي، التكامل وتطبيقاته..."
              className="h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              المرحلة والمسار:
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              <option value="توجيهي علمي">توجيهي علمي (وزاري)</option>
              <option value="BTEC هندسة">مسار BTEC هندسة</option>
              <option value="BTEC تكنولوجيا">BTEC تكنولوجيا معلومات</option>
              <option value="أول ثانوي علمي">أول ثانوي علمي</option>
              <option value="الصف العاشر">الصف العاشر الأساسي</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              المادة الدراسية:
            </label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              <option value="فيزياء">فيزياء</option>
              <option value="كيمياء">كيمياء</option>
              <option value="رياضيات">رياضيات</option>
              <option value="أحياء">أحياء وعلوم بيئية</option>
              <option value="روبوتات وتكنولوجيا">روبوتات وتكنولوجيا</option>
              <option value="فلك">علوم الفلك والفضاء</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Button
              onClick={handleGenerateMindmap}
              disabled={isGenerating}
              className="w-full h-11 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-purple-500/25 gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>توليد الشجرة...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>توليد الخريطة الذهنية 🚀</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Suggestions Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-bold">مفاهيم شائعة للتوليد السريع:</span>
          {[
            'الاحتكاك والحركة على المستويات المائلة',
            'الروابط التساهمية والأشكال الهندسية VSEPR',
            'الانقسام المنصف وعلم الوراثة المندلية',
            'الدوائر الرقمية والبوابات المنطقية Logic Gates',
            'التكامل بالتعويض وبالأجزاء',
            'قوانين الديناميكا الحرارية والإنتروبي'
          ].map((topic, i) => (
            <button
              key={i}
              onClick={() => { setTopicInput(topic); }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-300 text-[11px] transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Main Mindmap Canvas Container */}
      <div 
        ref={mindmapContainerRef}
        className={`p-6 md:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none p-10 overflow-y-auto' : 'min-h-[600px]'
        }`}
      >
        {/* Canvas Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-md">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">
                  خريطة مفاهيمية نشطة
                </Badge>
                <span className="text-xs text-slate-400">{currentMindmap.discipline} • {currentMindmap.grade}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-0.5 text-white">
                {currentMindmap.rootTitle}
              </h2>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
              className="rounded-xl border-slate-700 text-slate-300 hover:text-white h-9 px-2.5"
              title="تكبير الخريطة"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
              className="rounded-xl border-slate-700 text-slate-300 hover:text-white h-9 px-2.5"
              title="تصغير الخريطة"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(1)}
              className="rounded-xl border-slate-700 text-slate-300 hover:text-white h-9 px-2.5"
              title="إعادة ضبط الحجم"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExportPNG}
              className="rounded-xl border-purple-500/40 text-purple-300 hover:bg-purple-950/40 h-9 px-3 gap-1.5 text-xs font-bold"
            >
              <Download className="w-4 h-4" />
              <span>تصدير صورة HD</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="rounded-xl border-slate-700 text-slate-300 hover:text-white h-9 px-2.5"
              title="طباعة الخريطة"
            >
              <Printer className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl border-slate-700 text-slate-300 hover:text-white h-9 px-2.5"
              title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Tree Render Container */}
        <div 
          className="transition-transform duration-200 origin-top flex flex-col items-center space-y-10 py-6"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* ROOT CONCEPT NODE */}
          <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl text-center max-w-lg border-2 border-white/20 relative z-20">
            <span className="text-[11px] px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md font-bold uppercase tracking-wider">
              المفهوم المركزي للدرس
            </span>
            <h3 className="text-xl md:text-2xl font-black mt-1">
              {currentMindmap.rootTitle}
            </h3>
            <p className="text-xs text-blue-100 mt-1">
              شبكة الفروع المترابطة والقوانين والمعادلات الحاكمة
            </p>
          </div>

          {/* PRIMARY BRANCHES (4 to 6 CATEGORIES) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full max-w-7xl relative z-10">
            {currentMindmap.nodes.map((branch, idx) => {
              const isExpanded = !!expandedNodes[branch.id];
              return (
                <div 
                  key={branch.id || idx}
                  className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between"
                  style={{ borderTopColor: branch.color || '#38bdf8', borderTopWidth: 4 }}
                >
                  <div className="p-5 space-y-3">
                    
                    {/* Branch Title & Toggle */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <span 
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold inline-block"
                          style={{ backgroundColor: `${branch.color || '#38bdf8'}20`, color: branch.color || '#38bdf8' }}
                        >
                          {branch.category || 'فرع رئيسي'}
                        </span>
                        <h4 className="font-bold text-base text-white">
                          {branch.label}
                        </h4>
                      </div>

                      <button
                        onClick={() => toggleNode(branch.id)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title={isExpanded ? 'طي الفرع' : 'توسيع الفرع'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Description */}
                    {branch.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {branch.description}
                      </p>
                    )}

                    {/* Formula Pill */}
                    {branch.formula && (
                      <div 
                        onClick={() => setSelectedNodeDetails(branch)}
                        className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition-colors"
                        title="انقر لعرض تفاصيل القانون"
                      >
                        <span className="font-bold truncate" dir="ltr">{branch.formula}</span>
                        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
                      </div>
                    )}

                    {/* SUB-CHILDREN NODES */}
                    <AnimatePresence>
                      {isExpanded && branch.children && branch.children.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 pt-2 border-t border-slate-800"
                        >
                          <span className="text-[10px] text-slate-500 font-bold block">العقد الفرعية والتطبيقات:</span>
                          {branch.children.map((subNode, subIdx) => (
                            <div
                              key={subNode.id || subIdx}
                              onClick={() => setSelectedNodeDetails(subNode)}
                              className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition-all text-right group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-200 group-hover:text-cyan-400 transition-colors">
                                  {subNode.label}
                                </span>
                                <Badge className="text-[9px] bg-slate-800 text-slate-400 font-normal">
                                  {subNode.category}
                                </Badge>
                              </div>
                              {subNode.description && (
                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                                  {subNode.description}
                                </p>
                              )}
                              {subNode.formula && (
                                <div className="text-[10px] text-cyan-400 font-mono mt-1" dir="ltr">
                                  {subNode.formula}
                                </div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="p-3 bg-slate-950/50 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{branch.children?.length || 0} مفاهيم فرعية</span>
                    <button 
                      onClick={() => setSelectedNodeDetails(branch)}
                      className="text-cyan-400 hover:underline font-bold"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* NODE DETAILS INSPECTOR MODAL */}
      <AnimatePresence>
        {selectedNodeDetails && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 text-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3.5 h-3.5 rounded-full" 
                    style={{ backgroundColor: selectedNodeDetails.color || '#38bdf8' }} 
                  />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold">{selectedNodeDetails.category}</span>
                    <h3 className="font-bold text-base text-white">{selectedNodeDetails.label}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNodeDetails(null)} 
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400">التوضيح العلمي والمفهوم:</span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {selectedNodeDetails.description || 'لا يوجد شرح إضافي'}
                </p>
              </div>

              {/* Formula */}
              {selectedNodeDetails.formula && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400">القانون الرياضي أو الصيغة:</span>
                  <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-300 font-mono text-sm" dir="ltr">
                    {selectedNodeDetails.formula}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={() => setSelectedNodeDetails(null)}
                  className="rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-white"
                >
                  إغلاق
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AIConceptMindmapStudio;
