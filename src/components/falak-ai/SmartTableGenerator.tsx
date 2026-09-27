import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Table as TableIcon, 
  Sparkles, 
  Download, 
  Copy, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  FileSpreadsheet, 
  Printer, 
  Palette, 
  RefreshCw, 
  Share2, 
  Calendar, 
  BookOpen, 
  Clock, 
  Target,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export interface TableData {
  title: string;
  description: string;
  category: 'schedule' | 'comparison' | 'grades' | 'revision' | 'custom';
  columns: string[];
  rows: string[][];
}

const PRESET_TABLES: Record<string, TableData> = {
  tawjihi_weekly: {
    title: 'الجدول الأسبوعي الذهبي لطلبة التوجيهي العلمي (نظام 6 ساعات)',
    description: 'خطة موزونة بدقة بين المواد العلمية الثقيلة، فترات الراحة، وحل أسئلة السنوات السابقة',
    category: 'schedule',
    columns: ['اليوم', 'الفترة الصباحية (7:00 - 10:00)', 'فترة الظهيرة (11:30 - 2:30)', 'الفترة المسائية (5:00 - 8:00)', 'جلسة المراجعة السريعة والحلول'],
    rows: [
      ['السبت', 'الفيزياء: ميكانيكا الكم والذرة', 'الكيمياء: سرعة التفاعل', 'الرياضيات: تطبيقات التفاضل', 'حل 20 سؤال اختيار من متعدد'],
      ['الأحد', 'الرياضيات: المعدلات الزمنية', 'العلوم الحياتية: الوراثة الجزيئية', 'اللغة الإنجليزية: قواعد التعبير', 'تلخيص القوانين في بطاقات مراجعة'],
      ['الإثنين', 'الفيزياء: فيزياء النواة والـ LHC', 'الكيمياء: الاتزان والديناميكا', 'التربية الإسلامية: فقه المعاملات', 'تطبيق تجربة محاكاة ثلاثية الأبعاد 3D'],
      ['الثلاثاء', 'الرياضيات: المساحات والحجوم', 'العلوم الحياتية: تقانة كريسبر', 'اللغة العربية التخصص: البلاغة', 'حل امتحان وزاري تجريبي مصغر'],
      ['الأربعاء', 'الكيمياء: الكيمياء العضوية', 'الفيزياء: الحث الكهرومغناطيسي', 'تاريخ الأردن: المحطات التاريخية', 'مراجعة الأخطاء في بنك الأسئلة'],
      ['الخميس', 'الرياضيات: مراجعة شاملة للوحدة', 'العلوم الحياتية: الهندسة الوراثية', 'مراجعة حرة لأصعب المسائل', 'جلسة استرخاء وتحفيز نفسي'],
      ['الجمعة', 'عطلة صباحية وصلاة الجمعة', 'جلسة حل أسئلة الوزارة للسنوات الماضية', 'تقييم الإنجاز عبر ذروة العلم الذكي', 'وضع خطة الأسبوع القادم']
    ]
  },
  physics_nuclear_comparison: {
    title: 'جدول مقارنة علمي دقيق: الانشطار النووي vs الاندماج النووي',
    description: 'مقارنة فيزيائية مفصلة وفق منهاج التوجيهي والفيزياء النووية الحديثة',
    category: 'comparison',
    columns: ['وجه المقارنة', 'الانشطار النووي (Nuclear Fission)', 'الاندماج النووي (Nuclear Fusion)', 'الأهمية في فيزياء الطاقة'],
    rows: [
      ['التعريف الفيزيائي', 'انقسام نواة ثقيلة غير مستقرة (مثل U-235) إلى نواتين متوسطتي الكتلة', 'اندماج نواتين خفيفتين (مثل نظائر الهيدروجين) لتكوين نواة أثقل', 'تحرير طاقة هائلة ناتجة عن تحول فرق الكتلة (E=mc²)'],
      ['الوقود النووي المستخدم', 'اليورانيوم-235 أو البلوتونيوم-239 النادر', 'الديوتيريوم والتريتيوم (متوفر بكثرة في ماء البحر)', 'الاندماج وقوده غير ناضب مقارنة باليورانيوم'],
      ['الطاقة المتحررة لكل وحدة كتلة', 'عالية (~200 MeV لكل تفاعل)', 'فائقة جداً (أكبر بـ 3-4 أضعاف لكل كغم من الانشطار)', 'الاندماج يمثل طاقة النجوم والشمس'],
      ['الشروط الحرارية المطلوبة', 'تحدث بحرارة الغرفة العادية بتسليط نيوترون بطيء', 'تتطلب بلازما بحرارة ملايين الدرجات المئوية للتغلب على تنافر كولوم', 'الاندماج يتطلب احتواء مغناطيسي فائق (Tokamak)'],
      ['النفايات الإشعاعية', 'نفايات مشعة طويلة الأجل تتطلب دفناً جيولوجياً معقداً', 'نفايات إشعاعية شبه معدومة، نظيفة بيئياً', 'الاندماج هو المصدر المستقبلي الآمن للطاقة'],
      ['أمثلة واقعية ومحاكاة', 'المفاعلات النووية التجارية وقنبلة هيروشيما', 'قلب الشمس، القنبلة الهيدروجينية، ومفاعل ITER', 'يمكن محاكاته في مختبر LHC بالمنصة']
    ]
  },
  acids_bases_comparison: {
    title: 'مصفوفة مقارنة نظريات الحموض والقواعد (أرهينيوس، برونستد، لويس)',
    description: 'جدول شامل يوضح الفروق الجوهرية والقصور في كل نظرية لكيمياء الثانوية العامة',
    category: 'comparison',
    columns: ['المعيار', 'مفهوم أرهينيوس (Arrhenius)', 'مفهوم برونستد-لوري (Brønsted-Lowry)', 'مفهوم لويس (Lewis)'],
    rows: [
      ['تعريف الحمض', 'مادة تتأين في الماء وتنتج أيونات الهيدروجين (H⁺)', 'مادة قادرة على منح بروتون (مانح للبروتون H⁺)', 'مادة قادرة على استقبال زوج أو أكثر من الإلكترونات غير الرابطة'],
      ['تعريف القاعدة', 'مادة تتأين في الماء وتنتج أيونات الهيدروكسيد (OH⁻)', 'مادة قادرة على استقبال بروتون (مستقبل للبروتون H⁺)', 'مادة قادرة على منح زوج أو أكثر من الإلكترونات غير الرابطة'],
      ['شرط الوسط والمذيب', 'يشترط وجود وسط مائي فقط (H₂O)', 'لا يشترط الماء، يفسر التفاعلات في أي وسط', 'أشمل النظريات، يفسر التفاعلات بدون انتقال بروتونات'],
      ['تفسير السلوك (NH₃)', 'عجز عن تفسير قاعدية الأمونيا لعدم احتوائها على OH', 'فسر قاعديتها لأنها تستقبل بروتوناً لتصبح NH₄⁺', 'فسر قاعديتها لوجود زوج إلكترونات حر على ذرة النيتروجين'],
      ['أوجه القصور والحدود', 'اقتصر على المحاليل المائية ولم يفسر السلوك الحمضي لـ CO₂', 'لم يفسر التفاعلات التي لا تتضمن انتقال بروتون (مثل BF₃ مع NH₃)', 'يعد المفهوم الأشمل لكيمياء المعقدات والتناسق']
    ]
  },
  bloom_grade_distribution: {
    title: 'مصفوفة الأوزان النسبية للامتحانات ومستويات هرم بلوم المعرفية',
    description: 'جدول معتمد لتوزيع درجات الاختبارات وفق المستويات المعرفية الستة',
    category: 'grades',
    columns: ['المستوى المعرفي (هرم بلوم)', 'الوزن النسبي (%)', 'عدد الأسئلة المقترح (من 50)', 'طبيعة الأسئلة والأفعال الإجرائية', 'المخرجات المعرفية المقاسة'],
    rows: [
      ['1. التذكر والاسترجاع (Remembering)', '20%', '10 أسئلة', 'عرّف، اذكر، عدد، صل بين المفاهيم', 'استحضار الحقائق والمصطلحات العلمية والقوانين'],
      ['2. الفهم والاستيعاب (Understanding)', '25%', '13 سؤالاً', 'فسّر، علل، وضح، قارن، أعد صياغة', 'إدراك المعاني، التنبؤ بالنتائج، وتفسير الظواهر'],
      ['3. التطبيق الحسابي (Applying)', '25%', '12 سؤالاً', 'احسب، جد قيمة، طبّق القانون، مثّل بيانياً', 'استخدام القوانين الرياضية في مواقف جديدة'],
      ['4. التحليل والاستنتاج (Analyzing)', '15%', '8 أسئلة', 'حلل المنحنى، استنتج العلاقة، فكك النظام', 'تحديد أجزاء المسألة والربط بين المتغيرات الفيزيائية'],
      ['5. التقويم وإصدار الحكم (Evaluating)', '10%', '5 أسئلة', 'احكم على صحة الفرضية، انقد الاستنتاج، بيّن الخطأ', 'تقييم دقة النتائج التجريبية والتوصيات العلمية'],
      ['6. الابتكار والتصميم (Creating)', '5%', '2 سؤالان', 'اقترح تصميماً، صمم دائرة، ابتكر خوارزمية', 'دمج العناصر لبناء نموذج جديد أو حل مشكلة غير مألوفة']
    ]
  },
  revision_30days_plan: {
    title: 'خطة المراجعة النهائية المكثفة (30 يوماً قبل الامتحانات الوزارية)',
    description: 'جدول زمني مرحلي لإنهاء المواد والحلول التجريبية مع فترات التكرار المتباعد',
    category: 'revision',
    columns: ['المرحلة الزمنية', 'المواد المستهدفة', 'معدل الإنجاز اليومي', 'طريقة الاستذكار المعتمدة', 'مؤشر الجاهزية المطلوب'],
    rows: [
      ['الأيام (1 - 7)', 'الفيزياء + الرياضيات', 'فصلان كاملان يومياً + 30 مسألة', 'خرائط ذهنية وحل نماذج القوانين بالورقة والقلم', 'حل 85% من أسئلة السنوات السابقة بدون مراجعة'],
      ['الأيام (8 - 14)', 'الكيمياء + العلوم الحياتية', 'وحدة ونصف يومياً مع حفظ المعادلات', 'التسميع الذاتي والمحاكاة التفاعلية 3D', 'إتقان آليات التفاعل والمسائل الوراثية 90%'],
      ['الأيام (15 - 21)', 'اللغات (عربي وإنجليزي) + المشتركة', 'درسان قواعد + 3 نصوص واستيعاب يومياً', 'كتابة مواضيع التعبير وحل قطع القراءة الوزارية', 'إنهاء بنك الأسئلة بالكامل بزمن قياسي'],
      ['الأيام (22 - 27)', 'المحاكاة الوزارية الشاملة (Mock Exams)', 'امتحانان كاملان يومياً تحت ضغط الوقت', 'الجلوس في بيئة هادئة ومؤقت ساعتين لكل امتحان', 'تحقيق معدل فوق 92% وتدوين الملاحظات الدقيقة'],
      ['الأيام (28 - 30)', 'المراجعة الخاطفة والنقاء الذهني', 'قراءة ملخصات "ذروة العلم" والقوانين المركزة', 'النوم الكافي وتنظيم التغذية وجلسات استرخاء', 'طمأنينة وثقة كاملة وجاهزية 100%']
    ]
  }
};

interface SmartTableGeneratorProps {
  initialPrompt?: string;
  onTableGenerated?: (table: TableData) => void;
}

export const SmartTableGenerator: React.FC<SmartTableGeneratorProps> = ({ 
  initialPrompt = '',
  onTableGenerated 
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [currentTable, setCurrentTable] = useState<TableData>(PRESET_TABLES.tawjihi_weekly);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tableTheme, setTableTheme] = useState<'cosmic' | 'emerald' | 'slate' | 'amber'>('cosmic');
  const [isEditingCell, setIsEditingCell] = useState<{ r: number; c: number } | null>(null);
  const [cellValue, setCellValue] = useState('');

  // AI-like Table Synthesis Engine
  const generateTableFromPrompt = (userPrompt: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);

      const pLower = userPrompt.toLowerCase();
      let generated: TableData;

      if (pLower.includes('فيزياء') && (pLower.includes('نوو') || pLower.includes('انشطار') || pLower.includes('اندماج'))) {
        generated = PRESET_TABLES.physics_nuclear_comparison;
      } else if (pLower.includes('كيمياء') || pLower.includes('حمض') || pLower.includes('قواعد') || pLower.includes('أرهينيوس')) {
        generated = PRESET_TABLES.acids_bases_comparison;
      } else if (pLower.includes('بلوم') || pLower.includes('علامات') || pLower.includes('توزيع') || pLower.includes('مستويات')) {
        generated = PRESET_TABLES.bloom_grade_distribution;
      } else if (pLower.includes('30') || pLower.includes('مراجعة') || pLower.includes('امتحان')) {
        generated = PRESET_TABLES.revision_30days_plan;
      } else if (pLower.includes('يومي') || pLower.includes('ساعات') || pLower.includes('جدول')) {
        generated = {
          title: `جدول مخصص ذكي: ${userPrompt.slice(0, 45)}...`,
          description: 'تم تصميم هذا الجدول بالذكاء الاصطناعي وفق أحدث معايير المنهاج والتنظيم الأكاديمي',
          category: 'schedule',
          columns: ['الفترة الزمنية', 'المادة / النشاط المستهدف', 'الهدف المنجز', 'أسلوب الدراسة', 'التقييم الذاتي'],
          rows: [
            ['الفترة الأولى (8:00 - 10:30)', 'المادة الصعبة (فيزياء / رياضيات)', 'فهم وإتقان القوانين الرئيسية', 'حل مسائل تدرجية باليد', 'ممتاز (إتقان 90%)'],
            ['استراحة ذهنية (10:30 - 11:00)', 'مشي خفيف + مشروب صحي', 'تجديد النشاط العصبي', 'ابتعاد تام عن الشاشات', 'راحة تامة'],
            ['الفترة الثانية (11:00 - 1:30)', 'المادة العلمية الثانية (كيمياء / أحياء)', 'حفظ المفاهيم والمعادلات', 'التسميع الذاتي والمحاكاة 3D', 'جيد جداً'],
            ['استراحة الغداء والصلاة (1:30 - 3:00)', 'صلاة الظهر وغداء خفيف', 'راحة روحية وجسدية', 'استرخاء مع العائلة', 'توازن نفسي'],
            ['الفترة الثالثة (3:00 - 5:30)', 'المواد المشتركة (لغات / تاريخ)', 'قراءة النصوص وحفظ القواعد', 'حل أسئلة سنوات سابقة', 'إنجاز كامل'],
            ['الفترة المسائية (6:30 - 8:30)', 'المراجعة الشاملة وحل الامتحانات', 'اختبار تجريبي على المنصة', 'حل 25 سؤال بنك الأسئلة', 'جاهزية عالية']
          ]
        };
      } else {
        generated = {
          title: `جدول تحليلي دقيق: ${userPrompt}`,
          description: 'مصفوفة معرفية مهيكلة تم توليدها بالذكاء الاصطناعي لمساعدتك على التفوق',
          category: 'custom',
          columns: ['العنصر / المحور', 'الوصف والتفاصيل', 'الأهمية في المنهاج', 'المخرجات المستهدفة', 'ملاحظات وتوجيهات'],
          rows: [
            ['المحور الأول: الأساس النظري', 'فهم المبادئ الجوهرية والتعاريف', 'أساسي للإجابة عن أسئلة التفسير', 'استيعاب دقيق بنسبة 100%', 'مراجعة أسبوعية'],
            ['المحور الثاني: التطبيق العملي', 'حل المسائل الحسابية والمعادلات', 'يشكل 40% من علامة الاختبار', 'السرعة والدقة في الحساب', 'استخدام الآلة الحاسبة بمهارة'],
            ['المحور الثالث: الربط والتفكير العالي', 'تجارب المحاكاة ثلاثية الأبعاد 3D', 'أسئلة التميز والقدرات العليا', 'تحليل المنحنيات البيانية', 'الاستعانة بـ "ذروة العلم الذكي"'],
            ['المحور الرابع: المراجعة الذاتية', 'حل امتحانات إلكترونية مقننة', 'قياس الثغرات وتلافيها', 'ثقة تامة في الامتحان الوزاري', 'توثيق الأخطاء في دفتر الملاحظات']
          ]
        };
      }

      setCurrentTable(generated);
      if (onTableGenerated) onTableGenerated(generated);
      toast.success('✨ تم توليد الجدول بالذكاء الاصطناعي بدقة فائقة وبأعلى مستويات التنظيم!');
    }, 600);
  };

  // Add Row
  const handleAddRow = () => {
    const emptyRow = new Array(currentTable.columns.length).fill('قيمة جديدة...');
    setCurrentTable({
      ...currentTable,
      rows: [...currentTable.rows, emptyRow]
    });
    toast.success('تمت إضافة صف جديد للجدول');
  };

  // Delete Row
  const handleDeleteRow = (rowIndex: number) => {
    if (currentTable.rows.length <= 1) {
      toast.error('لا يمكن حذف جميع الصفوف!');
      return;
    }
    const updated = currentTable.rows.filter((_, i) => i !== rowIndex);
    setCurrentTable({ ...currentTable, rows: updated });
    toast.info('تم حذف الصف المحدد');
  };

  // Cell Editing
  const startEditCell = (r: number, c: number) => {
    setIsEditingCell({ r, c });
    setCellValue(currentTable.rows[r][c]);
  };

  const saveCell = () => {
    if (!isEditingCell) return;
    const { r, c } = isEditingCell;
    const newRows = [...currentTable.rows];
    newRows[r] = [...newRows[r]];
    newRows[r][c] = cellValue;
    setCurrentTable({ ...currentTable, rows: newRows });
    setIsEditingCell(null);
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = [currentTable.columns, ...currentTable.rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الجدول');
    XLSX.writeFile(wb, `${currentTable.title.slice(0, 30)}.xlsx`);
    toast.success('📥 تم تصدير الجدول بصيغة Excel (XLSX) بنجاح!');
  };

  // Copy Markdown
  const copyAsMarkdown = () => {
    const header = `| ${currentTable.columns.join(' | ')} |`;
    const separator = `| ${currentTable.columns.map(() => '---').join(' | ')} |`;
    const rows = currentTable.rows.map(r => `| ${r.join(' | ')} |`).join('\n');
    const md = `${header}\n${separator}\n${rows}`;
    navigator.clipboard.writeText(md);
    toast.success('📋 تم نسخ الجدول بتنسيق Markdown إلى الحافظة!');
  };

  // Print Table
  const printTable = () => {
    window.print();
  };

  // Theme Classes
  const themeStyles = {
    cosmic: {
      header: 'bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-purple-900/80 text-purple-100 border-purple-500/30',
      rowEven: 'bg-purple-950/20 hover:bg-purple-900/30 text-slate-100',
      rowOdd: 'bg-indigo-950/10 hover:bg-indigo-900/20 text-slate-100',
      border: 'border-purple-500/20',
      accent: 'text-indigo-400'
    },
    emerald: {
      header: 'bg-gradient-to-r from-emerald-900/80 via-teal-900/80 to-emerald-900/80 text-emerald-100 border-emerald-500/30',
      rowEven: 'bg-emerald-950/20 hover:bg-emerald-900/30 text-slate-100',
      rowOdd: 'bg-teal-950/10 hover:bg-teal-900/20 text-slate-100',
      border: 'border-emerald-500/20',
      accent: 'text-emerald-400'
    },
    slate: {
      header: 'bg-slate-800 text-slate-100 border-slate-700',
      rowEven: 'bg-slate-900/50 hover:bg-slate-800/50 text-slate-100',
      rowOdd: 'bg-slate-950/30 hover:bg-slate-800/30 text-slate-100',
      border: 'border-slate-800',
      accent: 'text-cyan-400'
    },
    amber: {
      header: 'bg-gradient-to-r from-amber-900/80 via-orange-900/80 to-amber-900/80 text-amber-100 border-amber-500/30',
      rowEven: 'bg-amber-950/20 hover:bg-amber-900/30 text-slate-100',
      rowOdd: 'bg-orange-950/10 hover:bg-orange-900/20 text-slate-100',
      border: 'border-amber-500/20',
      accent: 'text-amber-400'
    }
  }[tableTheme];

  return (
    <div className="space-y-6">
      {/* Studio Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950/80 border border-indigo-500/30 shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <TableIcon className="w-3.5 h-3.5" />
                استوديو الجداول الذكي المدمج في ذروة العلم
              </span>
              <Badge variant="outline" className="text-[11px] font-mono border-purple-400/30 text-purple-300">
                Ultra-Precision Tables v2.0
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              أنشئ أي جدول دراسي، مقارنة علمية، أو مصفوفة درجات بدقة فائقة
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl">
              اطلب من الذكاء الاصطناعي بناء جداول تنظيم الوقت، مقارنات الفيزياء والكيمياء، ومخططات المراجعة مع تعديل الخلايا الحية وتصدير فوري لـ Excel و PDF
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              onClick={exportToExcel}
              className="rounded-2xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير Excel</span>
            </Button>
            <Button
              onClick={printTable}
              variant="outline"
              className="rounded-2xl text-xs gap-1.5 border-indigo-400/30 text-indigo-200 hover:bg-indigo-900/30"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة</span>
            </Button>
          </div>
        </div>
      </div>

      {/* AI Prompt Input Bar */}
      <div className="p-4 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/20 shadow-md space-y-3">
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') generateTableFromPrompt(prompt);
            }}
            placeholder="اكتب وصف الجدول الذي تريده (مثال: جدول مراجعة لمادة الكيمياء قبل الامتحان بأسبوع مع تخصيص فترات لحل المسائل)..."
            className="h-11 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
          />
          <Button
            onClick={() => generateTableFromPrompt(prompt)}
            disabled={isGenerating || !prompt.trim()}
            className="h-11 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold shadow-md shadow-indigo-500/25 shrink-0 gap-1.5"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'جارٍ البناء...' : 'توليد الجدول الآن'}</span>
          </Button>
        </div>

        {/* Quick Presets Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">قوالب جاهزة:</span>
          <button
            onClick={() => setCurrentTable(PRESET_TABLES.tawjihi_weekly)}
            className="px-3 py-1 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-medium shrink-0 transition-all border border-purple-400/20"
          >
            📅 جدول التوجيهي الأسبوعي (6 ساعات)
          </button>
          <button
            onClick={() => setCurrentTable(PRESET_TABLES.physics_nuclear_comparison)}
            className="px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-medium shrink-0 transition-all border border-cyan-400/20"
          >
            ⚛️ مقارنة الانشطار والاندماج النووي
          </button>
          <button
            onClick={() => setCurrentTable(PRESET_TABLES.acids_bases_comparison)}
            className="px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-medium shrink-0 transition-all border border-blue-400/20"
          >
            🧪 مقارنة الحموض والقواعد (أرهينيوس، برونستد، لويس)
          </button>
          <button
            onClick={() => setCurrentTable(PRESET_TABLES.bloom_grade_distribution)}
            className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 font-medium shrink-0 transition-all border border-amber-400/20"
          >
            📊 توزيع درجات هرم بلوم
          </button>
          <button
            onClick={() => setCurrentTable(PRESET_TABLES.revision_30days_plan)}
            className="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-medium shrink-0 transition-all border border-emerald-400/20"
          >
            🎯 خطة مراجعة الـ 30 يوماً
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-500/20 shadow-xl space-y-4">
        {/* Table Title and Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-indigo-500" />
              <span>{currentTable.title}</span>
            </h3>
            <p className="text-xs text-slate-500">{currentTable.description}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Color Palette Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['cosmic', 'emerald', 'slate', 'amber'] as const).map((thm) => (
                <button
                  key={thm}
                  onClick={() => setTableTheme(thm)}
                  className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all ${
                    tableTheme === thm ? 'ring-2 ring-indigo-400 scale-105' : 'opacity-60'
                  }`}
                  style={{
                    backgroundColor:
                      thm === 'cosmic' ? '#6366f1' :
                      thm === 'emerald' ? '#10b981' :
                      thm === 'slate' ? '#64748b' : '#f59e0b'
                  }}
                  title={`طابع ${thm}`}
                />
              ))}
            </div>

            <Button
              onClick={handleAddRow}
              size="sm"
              variant="outline"
              className="rounded-xl text-xs gap-1 border-slate-200 dark:border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة صف</span>
            </Button>

            <Button
              onClick={copyAsMarkdown}
              size="sm"
              variant="outline"
              className="rounded-xl text-xs gap-1 border-slate-200 dark:border-slate-700"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ Markdown</span>
            </Button>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className={themeStyles.header}>
                {currentTable.columns.map((col, ci) => (
                  <th key={ci} className="py-3 px-4 font-black tracking-wide border-b border-inherit">
                    {col}
                  </th>
                ))}
                <th className="py-3 px-2 w-12 text-center border-b border-inherit">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {currentTable.rows.map((row, ri) => {
                const isEven = ri % 2 === 0;
                return (
                  <tr
                    key={ri}
                    className={`transition-colors ${isEven ? themeStyles.rowEven : themeStyles.rowOdd}`}
                  >
                    {row.map((cell, ci) => {
                      const isEditing = isEditingCell?.r === ri && isEditingCell?.c === ci;
                      return (
                        <td
                          key={ci}
                          onDoubleClick={() => startEditCell(ri, ci)}
                          className="py-3 px-4 leading-relaxed cursor-pointer relative group"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={cellValue}
                                onChange={(e) => setCellValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveCell();
                                  if (e.key === 'Escape') setIsEditingCell(null);
                                }}
                                autoFocus
                                className="h-8 text-xs bg-slate-900 text-white rounded-lg border-indigo-400"
                              />
                              <button
                                onClick={saveCell}
                                className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2">
                              <span>{cell}</span>
                              <button
                                onClick={() => startEditCell(ri, ci)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-400"
                                title="انقر للتعديل"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleDeleteRow(ri)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                        title="حذف الصف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tip / Footer Info */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1">
            💡 <strong>تلميح تفاعلي:</strong> انقر مرتين على أي خلية لتعديل محتواها مباشرة ثم اضغط Enter للحفظ.
          </span>
          <span className="font-mono">
            {currentTable.rows.length} صفوف • {currentTable.columns.length} أعمدة
          </span>
        </div>
      </div>
    </div>
  );
};
