import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Atom, 
  BrainCircuit, 
  TrendingUp, 
  Award, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Cpu, 
  Layers, 
  FileText, 
  BarChart3, 
  Clock, 
  ArrowUpRight, 
  Zap, 
  Server, 
  Compass, 
  Eye, 
  GraduationCap, 
  HelpCircle, 
  Printer
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Sample data for Platform Activity & Engagement
const WEEKLY_TRAFFIC_DATA = [
  { day: 'السبت', activeUsers: 620, simRuns: 340, completedLessons: 280, aiQueries: 890 },
  { day: 'الأحد', activeUsers: 1150, simRuns: 780, completedLessons: 620, aiQueries: 1450 },
  { day: 'الإثنين', activeUsers: 1420, simRuns: 950, completedLessons: 840, aiQueries: 1890 },
  { day: 'الثلاثاء', activeUsers: 1380, simRuns: 890, completedLessons: 790, aiQueries: 1720 },
  { day: 'الأربعاء', activeUsers: 1560, simRuns: 1040, completedLessons: 910, aiQueries: 2100 },
  { day: 'الخميس', activeUsers: 1290, simRuns: 820, completedLessons: 730, aiQueries: 1640 },
  { day: 'الجمعة', activeUsers: 740, simRuns: 450, completedLessons: 390, aiQueries: 980 },
];

const MONTHLY_TRAFFIC_DATA = [
  { day: 'الأسبوع 1', activeUsers: 4800, simRuns: 3100, completedLessons: 2600, aiQueries: 6200 },
  { day: 'الأسبوع 2', activeUsers: 5900, simRuns: 3800, completedLessons: 3200, aiQueries: 7800 },
  { day: 'الأسبوع 3', activeUsers: 6700, simRuns: 4400, completedLessons: 3900, aiQueries: 8900 },
  { day: 'الأسبوع 4', activeUsers: 7450, simRuns: 5100, completedLessons: 4350, aiQueries: 9800 },
];

const SUBJECT_PERFORMANCE_DATA = [
  { subject: 'الفيزياء الحديثة', mastery: 89, classAvg: 84, students: 480, fill: '#06b6d4' },
  { subject: 'الكيمياء العامة', mastery: 86, classAvg: 81, students: 450, fill: '#3b82f6' },
  { subject: 'العلوم الحياتية', mastery: 92, classAvg: 87, students: 510, fill: '#10b981' },
  { subject: 'الرياضيات المتقدمة', mastery: 83, classAvg: 78, students: 430, fill: '#8b5cf6' },
  { subject: 'الروبوتات والذكاء', mastery: 95, classAvg: 90, students: 390, fill: '#f59e0b' },
  { subject: 'مسار BTEC التقني', mastery: 88, classAvg: 82, students: 290, fill: '#ec4899' },
  { subject: 'التربية الخاصة والدمج', mastery: 91, classAvg: 88, students: 160, fill: '#14b8a6' },
];

const PLATFORM_USAGE_BREAKDOWN = [
  { name: 'المختبرات الافتراضية 3D', value: 34, color: '#06b6d4' },
  { name: 'المقررات والدروس الرقمية', value: 26, color: '#3b82f6' },
  { name: 'بنك الأسئلة والاختبارات', value: 18, color: '#8b5cf6' },
  { name: 'معمل الروبوتات والذكاء', value: 14, color: '#f59e0b' },
  { name: 'غرف الدعم والمساعد الذكي', value: 8, color: '#10b981' },
];

const SKILL_PROGRESSION_DATA = [
  { month: 'سبتمبر', foundation: 70, applied: 60, advanced: 48 },
  { month: 'أكتوبر', foundation: 78, applied: 68, advanced: 56 },
  { month: 'نوفمبر', foundation: 84, applied: 75, advanced: 65 },
  { month: 'ديسمبر', foundation: 89, applied: 82, advanced: 74 },
  { month: 'يناير', foundation: 94, applied: 88, advanced: 82 },
];

interface ExecutiveOverviewTabProps {
  onNavigateTab?: (tabId: string) => void;
}

export const ExecutiveOverviewTab: React.FC<ExecutiveOverviewTabProps> = ({ onNavigateTab }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const trafficData = timeRange === 'week' ? WEEKLY_TRAFFIC_DATA : MONTHLY_TRAFFIC_DATA;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('تم تحديث بيانات الرؤية العامة والمؤشرات التنفيذية بنجاح!');
    }, 600);
  };

  const handleExportReport = () => {
    window.print();
    toast.success('جارٍ تجهيز مسودة التقرير التنفيذي الشامل للطباعة أو الحفظ كـ PDF');
  };

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* Header and Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-400/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              الرؤية العامة والملخص التنفيذي الشامل (360° Vision)
            </span>
            <Badge variant="outline" className="text-[11px] font-mono border-emerald-500/30 text-emerald-600">
              Live Production v2.0
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5">
            لوحة القيادة الأكاديمية ومنظومة إدارة التعلم والمحتوى (LCM)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            نظرة شمولية موحدة تغطي كافة أبعاد المنصة: الطلاب، المناهج الرقمية، التجارب ثلاثية الأبعاد، وكفاءة البنية التحتية
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap print:hidden">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="rounded-xl text-xs gap-1.5 border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-500' : ''}`} />
            <span>تحديث المؤشرات</span>
          </Button>

          <Button
            onClick={handleExportReport}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-cyan-400"
          >
            <Printer className="w-3.5 h-3.5 text-blue-500" />
            <span>طباعة / تصدير تقرير تنفيذي</span>
          </Button>

          {onNavigateTab && (
            <Button
              onClick={() => onNavigateTab('lcm')}
              className="rounded-xl text-xs gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-md shadow-cyan-500/20"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>إدارة المقررات (LCM)</span>
            </Button>
          )}
        </div>
      </div>

      {/* AI Executive Digest / Smart Executive Brief */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 border border-cyan-500/20 dark:border-cyan-500/10 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/30">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>الموجز التنفيذي الذكي للمنصة (Executive AI Platform Digest)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500 text-white font-mono font-bold">
                  تحديث تلقائي
                </span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                آخر تحليل: اليوم {new Date().toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              تسجل المنصة اليوم استقراراً تشغيلياً بنسبة <strong className="text-emerald-600 dark:text-emerald-400 font-bold">99.98%</strong> مع نمو تفاعلي أسبوعي يبلغ <strong className="text-cyan-600 dark:text-cyan-400 font-bold">+18.4%</strong> في تشغيل المحاكيات التفاعلية. حقق مسار <em>الروبوتات والذكاء الاصطناعي</em> أعلى نسبة إتقان مهارات بلغت <strong className="text-purple-600 dark:text-purple-400 font-bold">95%</strong>، تلاه مسار <em>العلوم الحياتية ومختبر كريسبر</em> بنسبة <strong className="text-purple-600 dark:text-purple-400 font-bold">92%</strong>. تم إنجاز أكثر من <strong>8,950</strong> استعلاماً بالذكاء الاصطناعي مع معدل زمن استجابة استثنائي بلغ <strong>340ms</strong>. جميع الفهارس وقواعد البيانات والمختبرات الافتراضية الـ 49 تعمل بكامل طاقتها دون أي أعطال مسجلة.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> مؤشر الجاهزية الأكاديمية: ممتاز
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-500" /> متوسط زمن الجلسة: 28.5 دقيقة
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" /> معدل النجاح في الاختبارات: 87.4%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 8-Card Detailed KPI Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Users */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-cyan-400/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">الطلاب والمنتسبين</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">1,840</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center">
              <ArrowUpRight className="w-3 h-3 ml-0.5" /> +22%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">منهم 1,420 طالب نشط هذا الأسبوع</p>
        </div>

        {/* Card 2: LCM Courses */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-blue-400/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">المقررات الرقمية (LCM)</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">32</span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
              340 درساً
            </span>
          </div>
          <p className="text-[11px] text-slate-500">تغطي 7 صفوف ومسار BTEC والدمج</p>
        </div>

        {/* Card 3: 3D Simulations */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-cyan-400/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">المختبرات والمحاكاة 3D</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Atom className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">49</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              جاهزية 100%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">أكثر من 5,200 تشغيل أسبوعي</p>
        </div>

        {/* Card 4: Questions Bank */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-amber-400/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">بنك الأسئلة والتقييم</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">2,450</span>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">
              هرم بلوم
            </span>
          </div>
          <p className="text-[11px] text-slate-500">مصنفة وفق 6 مستويات معرفية</p>
        </div>

        {/* Card 5: Mastery Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-emerald-400/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">معدل التحصيل العام</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">87.4%</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center">
              <ArrowUpRight className="w-3 h-3 ml-0.5" /> +6.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">تحسن ملحوظ في المهارات التطبيقية</p>
        </div>

        {/* Card 6: Faculty Staff */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-rose-400/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">الكادر التعليمي والمشرفين</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">24</span>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              6 أقسام
            </span>
          </div>
          <p className="text-[11px] text-slate-500">بمتوسط 14 صفاً تفاعلياً مداراً</p>
        </div>

        {/* Card 7: AI Prompts */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-indigo-400/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">استعلامات الذكاء الاصطناعي</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">14.2K</span>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              340ms رد
            </span>
          </div>
          <p className="text-[11px] text-slate-500">مساعد حل المسائل وتوليد الاختبارات</p>
        </div>

        {/* Card 8: System Health */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-teal-400/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold">الجاهزية والـ Latency</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">99.99%</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              22ms استجابة
            </span>
          </div>
          <p className="text-[11px] text-slate-500">سيرفرات فائقة التوافق مع الهواتف</p>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart 1: Platform Engagement & Activity Trends (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-500" />
                <span>حركة النشاط وتفاعل الطلاب الأسبوعي والشهري</span>
              </h3>
              <p className="text-xs text-slate-500">تتبع تشغيل المحاكيات، إكمال الدروس، واستعلامات الذكاء الاصطناعي</p>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeRange === 'week'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                الأسبوع الحالي
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  timeRange === 'month'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                آخر 30 يوماً
              </button>
            </div>
          </div>

          <div className="h-[310px] w-full pt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSims" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorLessons" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '12px',
                    direction: 'rtl'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="activeUsers" name="الطلاب النشطون" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="simRuns" name="تشغيل المحاكيات 3D" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSims)" />
                <Area type="monotone" dataKey="completedLessons" name="الدروس المكتملة" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLessons)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Usage Breakdown (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" />
              <span>توزيع اهتمام واستخدام الأقسام</span>
            </h3>
            <p className="text-xs text-slate-500">نسبة تفاعل الطلاب مع أركان المنصة</p>
          </div>

          <div className="h-[210px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PLATFORM_USAGE_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {PLATFORM_USAGE_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'النسبة']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                    direction: 'rtl'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {PLATFORM_USAGE_BREAKDOWN.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 2: Subject Mastery & Performance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BarChart: Subject Mastery (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span>مؤشر التحصيل والأداء الأكاديمي حسب المباحث والمجالات</span>
              </h3>
              <p className="text-xs text-slate-500">مقارنة نسبة إتقان الطلاب (Mastery Rate) مع متوسط الدرجات الفصلي</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              تقييم المخرجات المعرفية
            </span>
          </div>

          <div className="h-[290px] w-full pt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUBJECT_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="subject" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" interval={0} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '12px',
                    direction: 'rtl'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="mastery" name="نسبة إتقان المهارات (%)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="classAvg" name="متوسط تحصيل الصف (%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subsystem Health Matrix & Infrastructure Status (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>حالة المنظومات والخدمات الحية</span>
            </h3>
            <p className="text-xs text-slate-500">فحص فوري للبنية التحتية والمحركات</p>
          </div>

          <div className="space-y-3">
            {[
              { name: 'محرك المحاكاة 3D (WebGL / Three.js)', status: 'يعمل (60 FPS)', latency: '12ms', healthy: true },
              { name: 'قاعدة بيانات الطلاب والمقررات (Supabase)', status: 'متصلة ومؤمنة', latency: '18ms', healthy: true },
              { name: 'بوابة الذكاء الاصطناعي (AI LLM & Vision)', status: 'استجابة فائقة', latency: '340ms', healthy: true },
              { name: 'معمل الأردوينو و Wokwi Sandbox', status: 'Wasm Core جاهز', latency: '24ms', healthy: true },
              { name: 'بنك أسئلة بلوم ومولد الامتحانات', status: 'فهرسة مكتملة', latency: '15ms', healthy: true },
              { name: 'منظومة الدمج (برايل ولغة الإشارة)', status: 'جاهزية كاملة', latency: '20ms', healthy: true },
              { name: 'خوادم التخزين السحابي والـ CDN', status: 'توزيع عالمي', latency: '9ms', healthy: true },
            ].map((srv, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{srv.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 pr-4">{srv.status}</span>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] border-emerald-400/30 text-emerald-600 dark:text-emerald-400">
                  {srv.latency}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Summary: Curriculum Progression & Recent Academic Operations */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <span>سجل العمليات الأكاديمية والأنشطة اللحظية</span>
            </h3>
            <p className="text-xs text-slate-500">آخر المستجدات المسجلة من الطلاب والمعلمين على مستوى المدارس والصفوف</p>
          </div>
          {onNavigateTab && (
            <Button
              onClick={() => onNavigateTab('audit')}
              variant="ghost"
              size="sm"
              className="text-xs text-cyan-600 dark:text-cyan-400"
            >
              عرض سجل التدقيق الكامل &larr;
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 font-bold">مقرر الفيزياء</span>
              <span className="text-[10px] text-slate-400">منذ 6 دقائق</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">إكمال تجربة "مسرع الهادرونات الكبير"</h4>
            <p className="text-[11px] text-slate-500">أنهى 42 طالباً من الصف العاشر العلمي محاكاة تصادم البروتونات بنجاح 96%.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-bold">معمل الروبوتات</span>
              <span className="text-[10px] text-slate-400">منذ 18 دقيقة</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">سباق تحدي حلبة الكود A*</h4>
            <p className="text-[11px] text-slate-500">سجل الطالب زيد بني هاني زمناً قياسياً جديداً (42 خطوة) في فك متاهة الروبوت المستقل.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">التقييم الذكي</span>
              <span className="text-[10px] text-slate-400">منذ 34 دقيقة</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">توليد اختبار كمياء تشخيصي</h4>
            <p className="text-[11px] text-slate-500">قام أ. عمر الشناوي بتوليد اختبار مصفوف بمستويات بلوم المعرفية حول نظرية التصادم.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
