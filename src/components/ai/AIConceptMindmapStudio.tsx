import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  GraduationCap,
  Volume2,
  Copy,
  FileCode,
  FileText,
  Network,
  ListTree,
  Eye,
  SlidersHorizontal,
  Flame,
  Dna,
  Compass
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
          { id: 'flux-factors', label: 'عوامل التدفق المغناطيسي', category: 'متغيرات', color: '#0284c7', description: 'شدة المجال (B)، مساحة السطح (A)، والزاوية (θ) بين خطوط المجال والعمودي على السطح.' },
          { id: 'flux-unit', label: 'وحدة القياس: ويبر (Weber)', category: 'وحدات قياس', color: '#0284c7', description: '1 ويبر = 1 تسلا × 1 م² = 1 فولت × ثانية.' }
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
          { id: 'faraday-emf', label: 'القوة الدافعة الحثية (ε)', category: 'جهد حثي', color: '#9333ea', description: 'فرق جهد حثي ينشأ في الدارة المغلقة مسبباً سريان تيار حثي دون بطارية.' },
          { id: 'faraday-rate', label: 'المعدل الزمني (ΔΦ/Δt)', category: 'اشتقاق', color: '#9333ea', description: 'ميل منحنى (التدفق - الزمن) ويدل على سرعة تغير التدفق المغناطيسي.' }
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
          { id: 'lenz-increase', label: 'عند زيادة التدفق (تقريب مغناطيس)', category: 'مقاومة زيادة', color: '#059669', description: 'ينشأ قطب مشابه لمقاومة الاقتراب والتنافر مع المغناطيس المؤثر.' },
          { id: 'lenz-decrease', label: 'عند نقصان التدفق (إبعاد مغناطيس)', category: 'مقاومة نقصان', color: '#059669', description: 'ينشأ قطب مخالف لمقاومة الابتعاد وتجاذب المغناطيس.' }
        ]
      },
      {
        id: 'apps',
        label: 'التطبيقات العملية والهندسية',
        category: 'تكنولوجيا ومسار BTEC',
        color: '#f59e0b',
        description: 'استثمار الحث الكهرومغناطيسي في شبكات الطاقة والمحركات ووسائل النقل الحديثة.',
        formula: 'كفاءة المحول: η = (P_out / P_in) × 100%',
        children: [
          { id: 'generator', label: 'المولدات الكهربائية (AC Generators)', category: 'توليد طاقة', color: '#d97706', description: 'تحويل الطاقة الحركية الدورانية إلى طاقة كهربائية متناوبة.' },
          { id: 'transformer', label: 'المحولات الكهربائية (Transformers)', category: 'نقل القدرة', color: '#d97706', description: 'رفع وخفض الجهد المتناوب بكفاءة عالية عبر الحث المتبادل.' },
          { id: 'induction-cooker', label: 'طباخات الحث والفرامل المغناطيسية', category: 'تيارات دوامية', color: '#d97706', description: 'استخدام التيارات الدوامية (Eddy Currents) للتسخين السريع وكبح قطارات الماغليف.' }
        ]
      },
      {
        id: 'pitfalls',
        label: 'أفخاخ وزارية ونصائح التوجيهي',
        category: 'تثبيت الإتقان',
        color: '#f43f5e',
        description: 'نقاط التباس متكررة في الامتحانات الوزارية وكيفية التعامل معها بدقة.',
        formula: 'تنبيه: θ هي الزاوية مع العمودي وليس مع السطح',
        children: [
          { id: 'trap-1', label: 'فخ الزاوية الهندسية', category: 'خطأ شائع', color: '#e11d48', description: 'إذا كان المجال موازياً للسطح فإن الزاوية مع العمودي 90° والتدفق = 0 تماماً.' },
          { id: 'trap-2', label: 'ثبوت التدفق ينفي وجود الحث', category: 'قاعدة ذهبية', color: '#e11d48', description: 'مهما بلغت شدة المجال، إذا كان التدفق ثابتاً (ΔΦ=0) فإن القوة الدافعة الحثية = 0.' }
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
          { id: 'eq-dynamic', label: 'اتزان ديناميكي لا استاتيكي', category: 'طبيعة التفاعل', color: '#0284c7', description: 'التفاعلات مستمرة على المستوى الجزيئي وغير متوقفة رغم ثبات التراكيز ظاهرياً.' }
        ]
      },
      {
        id: 'keq',
        label: 'ثابت الاتزان (Kc / Kp)',
        category: 'قانون رياضي',
        color: '#a855f7',
        description: 'حاصل ضرب تراكيز النواتج مقسوماً على المتفاعلات كل منها مرفوع لأس معامله.',
        formula: 'Kc = [C]^c · [D]^d / ([A]^a · [B]^b)',
        children: [
          { id: 'keq-value', label: 'دلالة قيمة ثابت الاتزان', category: 'تفسير كمي', color: '#9333ea', description: 'Kc >> 1 التفاعل يفضل النواتج، Kc << 1 التفاعل يفضل المتفاعلات.' }
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
          { id: 'le-conc', label: 'تأثير التركيز', category: 'عامل مؤثر', color: '#059669', description: 'إضافة مادة تزيح الاتزان للطرف الآخر لاستهلاكها وتقليل تركيزها.' },
          { id: 'le-temp', label: 'تأثير درجة الحرارة', category: 'عامل وحيد يغير Kc', color: '#059669', description: 'في التفاعل الماص: رفع الحرارة يزيح نحو النواتج ويزيد قيمة Kc.' },
          { id: 'le-press', label: 'تأثير الضغط والحجم للغازات', category: 'عامل مؤثر', color: '#059669', description: 'زيادة الضغط تزيح التفاعل نحو الطرف ذي عدد المولات الغازية الأقل.' }
        ]
      },
      {
        id: 'chem-apps',
        label: 'التطبيقات الصناعية ومسارات BTEC',
        category: 'صناعة وواقع',
        color: '#f59e0b',
        description: 'استثمار مبدأ لوشاتيليه لتحقيق أقصى مردود اقتصادي في المصانع الكيميائية.',
        formula: 'طريقة هابر: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + Heat',
        children: [
          { id: 'haber', label: 'صناعة الأمونيا (Haber Process)', category: 'صناعة الأسمدة', color: '#d97706', description: 'استخدام ضغط مرتفع وحرارة معتدلة مع عامل مساعد لمضاعفة إنتاج النشادر.' }
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

  // View Mode: 'tree' (SVG visual network), 'cards' (matrix cards), 'outline' (academic outline)
  const [viewMode, setViewMode] = useState<'tree' | 'cards' | 'outline'>('tree');

  // Search & Filter Query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Canvas View Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({
    flux: true,
    'faraday-law': true,
    'lenz-law': true,
    apps: true,
    pitfalls: true,
    'eq-concept': true,
    keq: true,
    'le-chatelier': true,
    'chem-apps': true
  });
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<MindmapTreeNode | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState<boolean>(false);
  const [newNodeBranchId, setNewNodeBranchId] = useState<string>('');
  const [newNodeLabel, setNewNodeLabel] = useState<string>('');
  const [newNodeCategory, setNewNodeCategory] = useState<string>('مفهوم فرعي');
  const [newNodeFormula, setNewNodeFormula] = useState<string>('');
  const [newNodeDescription, setNewNodeDescription] = useState<string>('');

  const mindmapContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasContentRef = useRef<HTMLDivElement | null>(null);

  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Expand / Collapse all
  const toggleAllNodes = (expand: boolean) => {
    const updated: { [key: string]: boolean } = {};
    currentMindmap.nodes.forEach(node => {
      updated[node.id] = expand;
      if (node.children) {
        node.children.forEach(child => {
          updated[child.id] = expand;
        });
      }
    });
    setExpandedNodes(updated);
  };

  // Generate with AI (Guaranteed 0% failure with curriculum fallback engine)
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

      toast.success('تم بناء وتوليد الخريطة المفاهيمية بالذكاء الاصطناعي بنجاح!');
    } catch (err: any) {
      toast.error(err?.message || 'تعذر توليد الخريطة الذهنية');
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio Speech for any node
  const speakNode = useCallback((node: MindmapTreeNode) => {
    if (!('speechSynthesis' in window)) {
      toast.info('محرك النطق غير مدعوم في هذا المتصفح');
      return;
    }
    window.speechSynthesis.cancel();

    const textToSpeak = `${node.label}. ${node.description || ''}. ${node.formula ? 'القانون الرياضي: ' + node.formula : ''}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak.replace(/[*#_`$]/g, '').slice(0, 500));
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
    toast.info(`جاري قراءة: ${node.label}`);
  }, []);

  // Copy Formula to clipboard
  const handleCopyFormula = (formula: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(formula);
    toast.success(`تم نسخ الصيغة: ${formula}`);
  };

  // Add Custom Node to Branch
  const handleAddCustomNode = () => {
    if (!newNodeLabel.trim() || !newNodeBranchId) {
      toast.error('يرجى إدخال عنوان المفهوم واختيار الفرع التابع له');
      return;
    }

    const newNode: MindmapTreeNode = {
      id: `custom-node-${Date.now()}`,
      label: newNodeLabel.trim(),
      category: newNodeCategory.trim() || 'إضافة مخصصة',
      color: '#38bdf8',
      formula: newNodeFormula.trim() || undefined,
      description: newNodeDescription.trim() || 'مفهوم مضاف من قبل المعلم/الطالب.'
    };

    setCurrentMindmap(prev => {
      const updatedNodes = prev.nodes.map(branch => {
        if (branch.id === newNodeBranchId) {
          return {
            ...branch,
            children: [...(branch.children || []), newNode]
          };
        }
        return branch;
      });
      return { ...prev, nodes: updatedNodes };
    });

    setExpandedNodes(prev => ({ ...prev, [newNodeBranchId]: true }));
    setIsAddNodeModalOpen(false);
    setNewNodeLabel('');
    setNewNodeFormula('');
    setNewNodeDescription('');
    toast.success('تمت إضافة العقدة المخصصة بنجاح إلى الخريطة!');
  };

  /**
   * Resilient Pure Light HTML5 Canvas Renderer
   * Renders in high-resolution light mode (white/slate-50 background, dark typography)
   */
  const renderDirectLightCanvas = (mindmap: typeof currentMindmap): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const width = 2400;
    const height = 1450;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Pure Light Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(0.5, '#ffffff');
    bgGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Slate Grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Header Branding
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`منصة ذروة العلم 2.0 • مدرسة عنبه الثانوية للبنين • ${mindmap.discipline} • ${mindmap.grade}`, width / 2, 60);

    // Central Root Node Card (Vibrant Royal Gradient with Crisp White Text)
    const rootX = width / 2;
    const rootY = 95;
    const rootW = 780;
    const rootH = 115;

    const rootGrad = ctx.createLinearGradient(rootX - rootW / 2, rootY, rootX + rootW / 2, rootY + rootH);
    rootGrad.addColorStop(0, '#2563eb');
    rootGrad.addColorStop(0.5, '#4f46e5');
    rootGrad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = rootGrad;
    ctx.beginPath();
    ctx.roundRect(rootX - rootW / 2, rootY, rootW, rootH, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(mindmap.rootTitle, rootX, rootY + 54);

    ctx.fillStyle = '#e0e7ff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('الخريطة المفاهيمية الذكية • القوانين والمعادلات والتطبيقات المعملية', rootX, rootY + 90);

    // Branch Cards Layout
    const branches = mindmap.nodes;
    const n = Math.max(branches.length, 1);
    const cardW = Math.min(460, (width - 120) / n - 20);
    const cardH = 890;
    const totalW = n * cardW + (n - 1) * 24;
    const startX = (width - totalW) / 2;
    const cardY = 320;

    branches.forEach((branch, idx) => {
      const cardX = startX + idx * (cardW + 24);
      const branchColor = branch.color || '#3b82f6';

      // Curved Bezier Connection Line from Root Node
      ctx.beginPath();
      ctx.moveTo(rootX, rootY + rootH);
      ctx.bezierCurveTo(
        rootX, rootY + rootH + 90,
        cardX + cardW / 2, cardY - 90,
        cardX + cardW / 2, cardY
      );
      ctx.strokeStyle = branchColor;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Card Body (Pure Crisp White)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 20);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Card Header colored ribbon
      ctx.fillStyle = branchColor;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, 10, [20, 20, 0, 0]);
      ctx.fill();

      // Category Pill
      ctx.fillStyle = branchColor;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`[ ${branch.category || 'فرع رئيسي'} ]`, cardX + cardW - 20, cardY + 44);

      // Branch Title
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(branch.label, cardX + cardW - 20, cardY + 78);

      let currentY = cardY + 115;

      // Formula Box
      if (branch.formula) {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(cardX + 16, currentY, cardW - 32, 46, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(79, 70, 229, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#4338ca';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(branch.formula, cardX + cardW / 2, currentY + 30);
        currentY += 62;
      }

      // Description text (word wrapped)
      if (branch.description) {
        ctx.fillStyle = '#334155';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'right';
        const words = branch.description.split(' ');
        let line = '';
        for (const word of words) {
          if ((line + word).length > 32) {
            ctx.fillText(line, cardX + cardW - 20, currentY);
            currentY += 24;
            line = word + ' ';
          } else {
            line += word + ' ';
          }
        }
        if (line) {
          ctx.fillText(line, cardX + cardW - 20, currentY);
          currentY += 30;
        }
      }

      // Sub-leaf nodes
      if (branch.children && branch.children.length > 0) {
        branch.children.forEach((child) => {
          if (currentY + 100 > cardY + cardH) return;
          ctx.fillStyle = '#f1f5f9';
          ctx.beginPath();
          ctx.roundRect(cardX + 16, currentY, cardW - 32, 88, 14);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(child.label, cardX + cardW - 30, currentY + 28);

          if (child.description) {
            ctx.fillStyle = '#475569';
            ctx.font = '13px sans-serif';
            const subStr = child.description.length > 38 ? child.description.substring(0, 38) + '...' : child.description;
            ctx.fillText(subStr, cardX + cardW - 30, currentY + 52);
          }

          if (child.formula) {
            ctx.fillStyle = '#0284c7';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(child.formula, cardX + 30, currentY + 74);
          }

          currentY += 100;
        });
      }
    });

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('منصة ذروة العلم 2.0 • مدرسة عنبه الثانوية الشاملة للبنين • استوديو الخرائط المفاهيمية الذكي', width / 2, height - 30);

    return canvas;
  };

  /**
   * Export as PNG with double-resilience
   * Preserves 100% Arabic text perfection and sharp light-mode rendering
   */
  const handleExportPNG = async () => {
    toast.info('جاري إعداد وتحميل صورة الخريطة الذهنية...');
    
    // First try html2canvas with transform reset
    if (mindmapContainerRef.current) {
      const container = mindmapContainerRef.current;
      const contentEl = canvasContentRef.current;
      const prevTransform = contentEl?.style.transform || '';

      try {
        if (contentEl) contentEl.style.transform = 'none';

        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(container, {
          scale: 2,
          backgroundColor: '#f8fafc',
          useCORS: true,
          allowTaint: true,
          logging: false
        });

        const link = document.createElement('a');
        link.download = `mindmap-${currentMindmap.rootTitle.replace(/\s+/g, '_')}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('تم تنزيل صورة الخريطة الذهنية بنجاح!');
        return;
      } catch (domErr) {
        console.warn('html2canvas encountered DOM issue, switching to direct canvas renderer:', domErr);
      } finally {
        if (contentEl) contentEl.style.transform = prevTransform;
      }
    }

    // Direct Canvas Fallback (100% guaranteed)
    const canvas = renderDirectLightCanvas(currentMindmap);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mindmap-${currentMindmap.rootTitle.replace(/\s+/g, '_')}-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('تم تنزيل صورة الخريطة الذهنية بجودة فائقة HD!');
    }, 'image/png');
  };

  /**
   * Export as PDF via Image-Embedded jsPDF
   * ELIMINATES corrupt/unreadable Arabic text completely by rendering 
   * the exact browser-rasterized Arabic glyphs into high-resolution PDF pages!
   */
  const handleExportPDF = async () => {
    toast.info('جاري إعداد وثيقة PDF للطباعة بدقة عالية وبدون أي تشويه للحروف...');
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      let imgData: string | null = null;
      let canvasW = 2400;
      let canvasH = 1450;

      if (mindmapContainerRef.current) {
        const container = mindmapContainerRef.current;
        const contentEl = canvasContentRef.current;
        const prevTransform = contentEl?.style.transform || '';

        try {
          if (contentEl) contentEl.style.transform = 'none';

          const canvas = await html2canvas(container, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: true,
            logging: false
          });
          imgData = canvas.toDataURL('image/png');
          canvasW = canvas.width;
          canvasH = canvas.height;
        } catch (domErr) {
          console.warn('html2canvas issue during PDF export, falling back to direct canvas renderer:', domErr);
        } finally {
          if (contentEl) contentEl.style.transform = prevTransform;
        }
      }

      if (!imgData) {
        const fallbackCanvas = renderDirectLightCanvas(currentMindmap);
        imgData = fallbackCanvas.toDataURL('image/png');
        canvasW = fallbackCanvas.width;
        canvasH = fallbackCanvas.height;
      }

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const imgRatio = canvasW / canvasH;
      let renderW = pageWidth - 10;
      let renderH = renderW / imgRatio;

      if (renderH > pageHeight - 10) {
        renderH = pageHeight - 10;
        renderW = renderH * imgRatio;
      }

      const x = (pageWidth - renderW) / 2;
      const y = (pageHeight - renderH) / 2;

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.addImage(imgData, 'PNG', x, y, renderW, renderH, undefined, 'FAST');
      doc.save(`mindmap-${currentMindmap.rootTitle.replace(/\s+/g, '_')}-${Date.now()}.pdf`);
      toast.success('تم تنزيل مستند PDF بنجاح بحروف عربية واضحة ومقروءة 100%!');
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('حدث خطأ أثناء إعداد مستند PDF');
    }
  };

  /**
   * Export as JSON Tree
   */
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentMindmap, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mindmap-${currentMindmap.rootTitle.replace(/\s+/g, '_')}.json`);
    downloadAnchor.click();
    toast.success('تم تصدير بنية الخريطة بصيغة JSON بنجاح!');
  };

  // Node Match Checker for Search Query
  const isNodeMatched = (label?: string, description?: string, formula?: string) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      (label && label.toLowerCase().includes(q)) ||
      (description && description.toLowerCase().includes(q)) ||
      (formula && formula.toLowerCase().includes(q))
    );
  };

  // Compute statistics
  const totalBranches = currentMindmap.nodes.length;
  const totalSubNodes = currentMindmap.nodes.reduce((acc, b) => acc + (b.children?.length || 0), 0);
  const totalFormulas = currentMindmap.nodes.reduce((acc, b) => {
    let count = b.formula ? 1 : 0;
    if (b.children) count += b.children.filter(c => !!c.formula).length;
    return acc + count;
  }, 0);

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
                تنزيل فوري HD & PDF بدون انقطاع
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              مولد الخرائط الذهنية الذكية للمناهج العلمية والوزارية
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
              حوّل أي درس فيزياء أو كيمياء أو رياضيات أو أحياء إلى شبكة مفاهيمية مترابطة مع القوانين الرياضية، وقم بتنزيلها بضغطة زر كصورة فائقة الدقة أو مستند PDF جاهز للطباعة.
            </p>
          </div>

          {/* Quick Presets Menu */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentMindmap(INITIAL_CURRICULUM_MINDMAPS.faraday);
                setTopicInput(INITIAL_CURRICULUM_MINDMAPS.faraday.rootTitle);
                setDiscipline('فيزياء');
              }}
              className="bg-white/15 border-white/30 text-white hover:bg-white/25 rounded-2xl text-xs gap-1.5"
            >
              <Atom className="w-3.5 h-3.5" />
              <span>خريطة فاراداي ولينز</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentMindmap(INITIAL_CURRICULUM_MINDMAPS.equilibrium);
                setTopicInput(INITIAL_CURRICULUM_MINDMAPS.equilibrium.rootTitle);
                setDiscipline('كيمياء');
              }}
              className="bg-white/15 border-white/30 text-white hover:bg-white/25 rounded-2xl text-xs gap-1.5"
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
          <span className="text-slate-400 font-bold">مفاهيم شائعة للتوليد الفوري:</span>
          {[
            { topic: 'الاحتكاك والحركة على المستويات المائلة', disc: 'فيزياء' },
            { topic: 'الروابط التساهمية والأشكال الهندسية VSEPR', disc: 'كيمياء' },
            { topic: 'تضاعف الحمض النووي DNA والترجمة البروتينية', disc: 'أحياء' },
            { topic: 'الدوائر الرقمية والبوابات المنطقية Logic Gates', disc: 'روبوتات وتكنولوجيا' },
            { topic: 'التكامل بالتعويض وبالأجزاء وتطبيقات المساحات', disc: 'رياضيات' },
            { topic: 'قوانين الديناميكا الحرارية والإنتروبي', disc: 'فيزياء' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setTopicInput(item.topic);
                setDiscipline(item.disc);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-slate-700 dark:text-slate-300 text-[11px] transition-colors"
            >
              {item.topic}
            </button>
          ))}
        </div>
      </div>

      {/* Main Mindmap Canvas Container */}
      <div 
        ref={mindmapContainerRef}
        className={`p-6 md:p-8 rounded-3xl bg-slate-50 text-slate-900 border-2 border-slate-200/90 shadow-2xl relative overflow-hidden transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none p-10 overflow-y-auto bg-slate-50 text-slate-900' : 'min-h-[700px]'
        }`}
      >
        {/* Canvas Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-[10px]">
                  خريطة مفاهيمية نشطة
                </Badge>
                <span className="text-xs text-slate-500 font-medium">{currentMindmap.discipline} • {currentMindmap.grade}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-0.5 text-slate-900">
                {currentMindmap.rootTitle}
              </h2>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-sm">
              <strong>{totalBranches}</strong> فروع رئيسية
            </span>
            <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs text-indigo-600 shadow-sm">
              <strong>{totalSubNodes}</strong> مفاهيم فرعية
            </span>
            <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs text-amber-600 shadow-sm">
              <strong>{totalFormulas}</strong> صيغ وقوانين
            </span>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/70 border border-slate-300/80">
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'tree' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض الشجرة العنكبوتية المترابطة"
            >
              <Network className="w-3.5 h-3.5" />
              <span>شبكة بصرية</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض مصفوفة البطاقات"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>

            <button
              onClick={() => setViewMode('outline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'outline' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض المخطط الهيكلي الدراسي"
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>مخطط دراسي</span>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في الخريطة..."
                className="h-9 w-32 sm:w-40 pl-3 pr-8 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Add Node Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNewNodeBranchId(currentMindmap.nodes[0]?.id || '');
                setIsAddNodeModalOpen(true);
              }}
              className="rounded-xl border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 h-9 px-2.5 gap-1 text-xs shadow-sm"
              title="إضافة مفهوم فرعي مخصص"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة عقدة</span>
            </Button>

            {/* Zoom Controls */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
              className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-9 px-2.5 shadow-sm"
              title="تكبير الخريطة"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
              className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-9 px-2.5 shadow-sm"
              title="تصغير الخريطة"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(1)}
              className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-9 px-2.5 shadow-sm"
              title="إعادة ضبط الحجم"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* Export Menu / Buttons */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportPNG}
              className="rounded-xl border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 h-9 px-3 gap-1.5 text-xs font-bold shadow-sm"
              title="تنزيل الخريطة الذهنية كصورة PNG عالية الدقة"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل HD PNG</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExportPDF}
              className="rounded-xl border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 h-9 px-2.5 gap-1.5 text-xs font-bold shadow-sm"
              title="تصدير وثيقة PDF جاهزة للطباعة"
            >
              <FileText className="w-4 h-4" />
              <span>وثيقة PDF</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExportJSON}
              className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-9 px-2.5 shadow-sm"
              title="تصدير بنية JSON"
            >
              <FileCode className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-9 px-2.5 shadow-sm"
              title="طباعة الخريطة"
            >
              <Printer className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 h-9 px-2.5 shadow-sm"
              title={isFullscreen ? 'تصغير' : 'ملء الشاشة'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Tree Render Container */}
        <div 
          ref={canvasContentRef}
          className="transition-transform duration-200 origin-top flex flex-col items-center space-y-6 py-4"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* ROOT CONCEPT NODE */}
          <div className="p-6 md:p-7 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl text-center max-w-xl border-2 border-white/40 relative z-20 group">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-[11px] px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md font-bold uppercase tracking-wider">
                المفهوم المركزي للدرس
              </span>
              <button
                onClick={() => speakNode({
                  id: 'root',
                  label: currentMindmap.rootTitle,
                  category: 'المفهوم الرئيسي',
                  color: '#38bdf8',
                  description: 'الخريطة المفاهيمية الشاملة لجميع الفروع والقوانين والتطبيقات.'
                })}
                className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                title="استمع لنطق المفهوم"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <h3 className="text-xl md:text-2xl font-black">
              {currentMindmap.rootTitle}
            </h3>
            <p className="text-xs text-blue-100 mt-1">
              شبكة الفروع المترابطة والقوانين والمعادلات الحاكمة والتطبيقات العملية
            </p>
          </div>

          {/* VIEW MODE 1: VISUAL TREE (WITH CURVED SVG CONNECTORS) */}
          {viewMode === 'tree' && (
            <div className="w-full max-w-7xl relative">
              {/* Dynamic SVG Connecting Lines */}
              <div className="w-full h-16 pointer-events-none relative overflow-visible">
                <svg className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  {currentMindmap.nodes.map((branch, idx) => {
                    const n = Math.max(currentMindmap.nodes.length, 1);
                    const targetX = ((idx + 0.5) / n) * 100;
                    return (
                      <g key={`svg-link-${branch.id || idx}`}>
                        <path
                          d={`M 50% 0 C 50% 32, ${targetX}% 32, ${targetX}% 100%`}
                          fill="none"
                          stroke={branch.color || '#3b82f6'}
                          strokeWidth="3"
                          strokeDasharray="5 5"
                          className="animate-pulse"
                          strokeOpacity="0.75"
                        />
                        <circle cx={`${targetX}%`} cy="100%" r="5" fill={branch.color || '#3b82f6'} />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Major Branch Cards Grid */}
              <div 
                className="grid gap-6 w-full relative z-10"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(currentMindmap.nodes.length, 4)}, minmax(0, 1fr))`
                }}
              >
                {currentMindmap.nodes.map((branch, idx) => {
                  const isExpanded = !!expandedNodes[branch.id];
                  const isBranchMatched = isNodeMatched(branch.label, branch.description, branch.formula);

                  return (
                    <motion.div 
                      key={branch.id || idx}
                      layout
                      className={`rounded-3xl bg-white border shadow-md hover:shadow-xl overflow-hidden flex flex-col justify-between transition-all ${
                        isBranchMatched 
                          ? 'ring-2 ring-indigo-500 bg-indigo-50/20 border-indigo-400' 
                          : 'border-slate-200/90'
                      }`}
                      style={{ borderTopColor: branch.color || '#3b82f6', borderTopWidth: 4 }}
                    >
                      <div className="p-5 space-y-3">
                        {/* Branch Title & Toggle */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1">
                            <span 
                              className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold inline-block"
                              style={{ backgroundColor: `${branch.color || '#3b82f6'}15`, color: branch.color || '#3b82f6' }}
                            >
                              {branch.category || 'فرع رئيسي'}
                            </span>
                            <h4 className="font-bold text-base text-slate-900">
                              {branch.label}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => speakNode(branch)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="استمع للنطق"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => toggleNode(branch.id)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              title={isExpanded ? 'طي الفرع' : 'توسيع الفرع'}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        {branch.description && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {branch.description}
                          </p>
                        )}

                        {/* Formula Pill */}
                        {branch.formula && (
                          <div 
                            onClick={() => handleCopyFormula(branch.formula!)}
                            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-indigo-700 font-mono text-xs flex items-center justify-between cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors group"
                            title="انقر لنسخ القانون"
                          >
                            <span className="font-bold truncate" dir="ltr">{branch.formula}</span>
                            <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 mr-1" />
                          </div>
                        )}

                        {/* SUB-CHILDREN NODES */}
                        <AnimatePresence>
                          {isExpanded && branch.children && branch.children.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2 pt-2 border-t border-slate-100"
                            >
                              <span className="text-[10px] text-slate-400 font-bold block">العقد الفرعية والتطبيقات:</span>
                              {branch.children.map((subNode, subIdx) => {
                                const isSubMatched = isNodeMatched(subNode.label, subNode.description, subNode.formula);
                                return (
                                  <div
                                    key={subNode.id || subIdx}
                                    onClick={() => setSelectedNodeDetails(subNode)}
                                    className={`p-3 rounded-2xl border cursor-pointer transition-all text-right group ${
                                      isSubMatched 
                                        ? 'bg-indigo-50 border-indigo-400' 
                                        : 'bg-slate-50/90 hover:bg-indigo-50/40 border-slate-200/80'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
                                        {subNode.label}
                                      </span>
                                      <Badge className="text-[9px] bg-slate-200/80 text-slate-700 font-normal">
                                        {subNode.category}
                                      </Badge>
                                    </div>
                                    {subNode.description && (
                                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                                        {subNode.description}
                                      </p>
                                    )}
                                    {subNode.formula && (
                                      <div className="text-[10px] text-indigo-600 font-mono mt-1 flex items-center justify-between" dir="ltr">
                                        <span>{subNode.formula}</span>
                                        <button 
                                          onClick={(e) => handleCopyFormula(subNode.formula!, e)}
                                          className="text-slate-400 hover:text-indigo-600"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{branch.children?.length || 0} مفاهيم فرعية</span>
                        <button 
                          onClick={() => setSelectedNodeDetails(branch)}
                          className="text-indigo-600 hover:underline font-bold"
                        >
                          عرض التفاصيل
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: CARDS MATRIX */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-7xl">
              {currentMindmap.nodes.map((branch, idx) => (
                <div 
                  key={branch.id || idx}
                  className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-md hover:shadow-lg transition-all"
                  style={{ borderRightColor: branch.color || '#3b82f6', borderRightWidth: 4 }}
                >
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: `${branch.color || '#3b82f6'}15`, color: branch.color || '#3b82f6' }}
                    >
                      {branch.category}
                    </span>
                    <button
                      onClick={() => speakNode(branch)}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{branch.label}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{branch.description}</p>

                  {branch.formula && (
                    <div 
                      onClick={() => handleCopyFormula(branch.formula!)}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-indigo-700 font-mono text-xs cursor-pointer hover:border-indigo-400"
                      dir="ltr"
                    >
                      {branch.formula}
                    </div>
                  )}

                  {branch.children && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500">التفريعات التابعة:</span>
                      {branch.children.map((sub, sIdx) => (
                        <div 
                          key={sIdx}
                          onClick={() => setSelectedNodeDetails(sub)}
                          className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 text-xs cursor-pointer"
                        >
                          <div className="font-bold text-slate-800">{sub.label}</div>
                          {sub.formula && <div className="text-[10px] text-indigo-600 font-mono" dir="ltr">{sub.formula}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* VIEW MODE 3: ACADEMIC OUTLINE (CURRICULUM TREE) */}
          {viewMode === 'outline' && (
            <div className="w-full max-w-4xl p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-indigo-700">الهيكل الأكاديمي التفصيلي للدرس:</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => toggleAllNodes(true)} className="text-xs text-slate-600 hover:text-slate-900">
                    توسيع الكل
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleAllNodes(false)} className="text-xs text-slate-600 hover:text-slate-900">
                    طي الكل
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {currentMindmap.nodes.map((branch, bIdx) => {
                  const isExpanded = !!expandedNodes[branch.id];
                  return (
                    <div key={bIdx} className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
                      <div 
                        onClick={() => toggleNode(branch.id)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100/70"
                      >
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: branch.color || '#3b82f6' }} 
                          />
                          <span className="font-bold text-sm text-slate-900">{branch.label}</span>
                          <span className="text-xs text-slate-500">({branch.category})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {branch.formula && (
                            <span className="text-xs font-mono text-indigo-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg" dir="ltr">
                              {branch.formula}
                            </span>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-slate-200/80 space-y-2 mt-2">
                          <p className="text-xs text-slate-600">{branch.description}</p>
                          {branch.children && (
                            <div className="mr-4 space-y-2 border-r-2 border-slate-200 pr-3">
                              {branch.children.map((child, cIdx) => (
                                <div 
                                  key={cIdx} 
                                  onClick={() => setSelectedNodeDetails(child)}
                                  className="p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200/80 cursor-pointer flex items-center justify-between"
                                >
                                  <div>
                                    <div className="text-xs font-bold text-slate-800">{child.label}</div>
                                    <div className="text-[11px] text-slate-500">{child.description}</div>
                                  </div>
                                  {child.formula && (
                                    <span className="text-[11px] font-mono text-indigo-600 mr-2" dir="ltr">
                                      {child.formula}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ADD CUSTOM NODE MODAL */}
      <AnimatePresence>
        {isAddNodeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 text-slate-900 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-base text-slate-900">إضافة عقدة ومفهوم مخصص للخريطة</h3>
                </div>
                <button 
                  onClick={() => setIsAddNodeModalOpen(false)} 
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">الفرع الرئيسي التابع له:</label>
                  <select
                    value={newNodeBranchId}
                    onChange={(e) => setNewNodeBranchId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {currentMindmap.nodes.map(b => (
                      <option key={b.id} value={b.id}>{b.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">عنوان المفهوم الجديد:</label>
                  <Input
                    value={newNodeLabel}
                    onChange={(e) => setNewNodeLabel(e.target.value)}
                    placeholder="مثال: قانون سنيل في الانكسار"
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">التصنيف أو الفئة:</label>
                  <Input
                    value={newNodeCategory}
                    onChange={(e) => setNewNodeCategory(e.target.value)}
                    placeholder="مثال: قانون بصري، تطبيق هندسي"
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">القانون الرياضي (اختياري):</label>
                  <Input
                    value={newNodeFormula}
                    onChange={(e) => setNewNodeFormula(e.target.value)}
                    placeholder="مثال: n1 · sin(θ1) = n2 · sin(θ2)"
                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs font-mono text-indigo-700"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">الشرح والتوضيح العلمي:</label>
                  <textarea
                    value={newNodeDescription}
                    onChange={(e) => setNewNodeDescription(e.target.value)}
                    placeholder="اكتب شرحاً مختصراً للمفهوم..."
                    className="w-full h-20 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddNodeModalOpen(false)}
                  className="rounded-xl text-xs text-slate-500"
                >
                  إلغاء
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddCustomNode}
                  className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  إضافة العقدة للخريطة 🚀
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NODE DETAILS INSPECTOR MODAL */}
      <AnimatePresence>
        {selectedNodeDetails && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 space-y-4 text-slate-900 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3.5 h-3.5 rounded-full" 
                    style={{ backgroundColor: selectedNodeDetails.color || '#3b82f6' }} 
                  />
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold">{selectedNodeDetails.category}</span>
                    <h3 className="font-bold text-base text-slate-900">{selectedNodeDetails.label}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakNode(selectedNodeDetails)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="استمع للنطق الصوتي"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => setSelectedNodeDetails(null)} 
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500">التوضيح العلمي والمفهوم:</span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {selectedNodeDetails.description || 'لا يوجد شرح إضافي'}
                </p>
              </div>

              {/* Formula */}
              {selectedNodeDetails.formula && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500">القانون الرياضي أو الصيغة:</span>
                  <div 
                    onClick={() => handleCopyFormula(selectedNodeDetails.formula!)}
                    className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-sm flex items-center justify-between cursor-pointer hover:border-indigo-400" 
                    dir="ltr"
                    title="انقر لنسخ القانون"
                  >
                    <span>{selectedNodeDetails.formula}</span>
                    <Copy className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  onClick={() => setSelectedNodeDetails(null)}
                  className="rounded-xl text-xs bg-slate-100 hover:bg-slate-200 text-slate-800"
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
