import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  GraduationCap, 
  Users, 
  Award, 
  Download, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  BrainCircuit, 
  Atom, 
  ChevronRight,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { toast } from 'sonner';

export const InstitutionalLearningAnalytics: React.FC = () => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  // Discipline Distribution Data
  const disciplineData = [
    { name: 'الفيزياء 3D', students: 1240, labsCompleted: 3450, avgScore: 84, color: '#06b6d4' },
    { name: 'الكيمياء', students: 1120, labsCompleted: 2980, avgScore: 81, color: '#3b82f6' },
    { name: 'الأحياء والجينات', students: 980, labsCompleted: 2410, avgScore: 88, color: '#10b981' },
    { name: 'الرياضيات والمنطق', students: 1450, labsCompleted: 4120, avgScore: 79, color: '#f59e0b' },
    { name: 'الفلك والفضاء', students: 860, labsCompleted: 1980, avgScore: 92, color: '#8b5cf6' },
    { name: 'الروبوتات والذكاء', students: 1040, labsCompleted: 2890, avgScore: 86, color: '#ec4899' },
    { name: 'الدمج ولغة الإشارة', students: 720, labsCompleted: 1650, avgScore: 94, color: '#14b8a6' },
  ];

  // Bloom's Cognitive Mastery
  const bloomLevels = [
    { level: 'التذكر (Knowledge)', score: 92, fullMark: 100 },
    { level: 'الفهم (Comprehension)', score: 86, fullMark: 100 },
    { level: 'التطبيق المخبري (Application)', score: 81, fullMark: 100 },
    { level: 'التحليل الرياضي (Analysis)', score: 74, fullMark: 100 },
    { level: 'التقويم والنقد (Evaluation)', score: 68, fullMark: 100 },
    { level: 'الابتكار والتركيب (Creation)', score: 72, fullMark: 100 },
  ];

  // Hourly Peak Traffic
  const hourlyTraffic = [
    { hour: '07:00 ص', active: 320 },
    { hour: '09:00 ص', active: 940 },
    { hour: '11:00 ص', active: 1420 },
    { hour: '01:00 م', active: 1150 },
    { hour: '04:00 م', active: 890 },
    { hour: '06:00 م', active: 1680 },
    { hour: '08:00 م', active: 1840 },
    { hour: '10:00 م', active: 1220 },
  ];

  // Early-Warning Alerts
  const interventionAlerts = [
    { id: 'a-1', topic: 'الاتزان الكيميائي ومبدأ لوشاتيليه', grade: 'الأول الثانوي العلمي', failRate: '34%', recommendation: 'إرسال محاكاة ميكانيكية تعويضية للطلاب' },
    { id: 'a-2', topic: 'تفاضل الدوال الدائرية المعقدة', grade: 'الثاني الثانوي العلمي (توجيهي)', failRate: '29%', recommendation: 'تفعيل جلسة تدريب مخصصة مع وكيل الرياضيات الذكي' },
    { id: 'a-3', topic: 'الانقسام المنصف والعبور الجيني', grade: 'العاشر الأساسي', failRate: '26%', recommendation: 'مراجعة فيديو ثلاثي الأبعاد مع أسئلة تقييم فورية' }
  ];

  const handleExportCSV = () => {
    let csv = "المبحث,الطلاب النشطون,المحاكيات المنجزة,متوسط الإتقان\n";
    disciplineData.forEach(d => {
      csv += `${d.name},${d.students},${d.labsCompleted},${d.avgScore}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-analytics-report-${Date.now()}.csv`;
    a.click();
    toast.success('تم تصدير تقرير التحليلات المؤسسية (CSV)');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ذكاء الأعمال والتحليلات الأكاديمية المتقدمة (Institutional Academic BI)</span>
          </div>
          <h2 className="text-2xl font-black text-white">استوديو القياس والذكاء المؤسسي المتقدم</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            مؤشرات حية لمعدلات إتقان المناهج، مستويات بلوم المعرفية، الإنذار المبكر للتعثر الدراسي، وساعات الذروة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-11 px-5 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <Download className="w-4 h-4 ml-1" />
            <span>تصدير تقرير الإدارة والوزارة (CSV)</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>متوسط الإتقان العام</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">84.2%</div>
          <p className="text-[11px] text-slate-400 mt-1">+3.8% مقارنة بالشهر السابق</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>جلسات المختبر المنجزة</span>
            <Atom className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-600 font-mono">18,910</div>
          <p className="text-[11px] text-slate-400 mt-1">عبر 49 محاكاة علمية</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>أسئلة ذكية تم حلها</span>
            <BrainCircuit className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 font-mono">42,650</div>
          <p className="text-[11px] text-slate-400 mt-1">بمستويات بلوم التقييمية</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>تنبيهات التدخل المبكر</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">{interventionAlerts.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">مهارات تتطلب تدعيماً</p>
        </div>
      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Discipline Engagement */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">مقارنة الإقبال ومعدل الإتقان عبر المباحث العلمية</h3>
              <p className="text-xs text-slate-500">حجم التجارب المنجزة ومتوسط درجات الطلاب في كل حقل</p>
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disciplineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 12 }} />
                <Bar dataKey="avgScore" fill="#3b82f6" radius={[6, 6, 0, 0]} name="متوسط نسبة الإتقان %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bloom Taxonomy Radar */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">مستويات بلوم المعرفية</h3>
            <p className="text-xs text-slate-500">توزيع اكتساب مهارات التفكير العليا</p>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={bloomLevels}>
                <PolarGrid stroke="#cbd5e1" strokeOpacity={0.5} />
                <PolarAngleAxis dataKey="level" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <Radar name="درجة الإتقان" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Traffic Line Chart */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">خريطة النشاط والتفاعل الزمني للطلاب</h3>
            <p className="text-xs text-slate-500">توزيع فترات التعلم الذاتي وحل الواجبات عبر ساعات اليوم</p>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 12 }} />
                <Line type="monotone" dataKey="active" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} name="الطلاب المتصلين" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Early Warning Interventions */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">نظام الإنذار المبكر ودعم التعثر الأكاديمي</h3>
              <p className="text-xs text-slate-500">المفاهيم الأكثر صعوبة مع خطة المعالجة التعويضية المقترحة</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {interventionAlerts.map(alert => (
              <div key={alert.id} className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{alert.topic}</span>
                  <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-mono text-[10px]">
                    نسبة الصعوبة: {alert.failRate}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-500">المرحلة المستهدفة: {alert.grade}</div>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>الإجراء المقترح: {alert.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalLearningAnalytics;
