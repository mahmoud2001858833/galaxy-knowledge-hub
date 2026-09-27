import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  Plus, 
  Send, 
  Search, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Bell, 
  Eye, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface Announcement {
  id: string;
  title: string;
  category: 'urgent' | 'exams' | 'academic' | 'robotics' | 'general';
  categoryLabel: string;
  targetAudience: 'all' | 'students' | 'teachers' | 'parents';
  audienceLabel: string;
  content: string;
  author: string;
  createdAt: string;
  viewsCount: number;
  acknowledgedCount: number;
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'بدء التسجيل في الأولمبياد الوطني للروبوتات وحلبة الكود A*',
    category: 'robotics',
    categoryLabel: 'تحديات ومسابقات علمية',
    targetAudience: 'students',
    audienceLabel: 'الطلاب فقط',
    content: 'تدعو إدارة المنصة كافة طلبة مسار الروبوتات والذكاء الاصطناعي و BTEC للمشاركة في منافسات الملاحة الذاتية 2D Maze Arena وتصفيات الذراع الآلية الذكية.',
    author: 'م. حسام القاسم - قسم الروبوتات',
    createdAt: '2026-09-27 10:30',
    viewsCount: 420,
    acknowledgedCount: 185
  },
  {
    id: 'ann-2',
    title: 'جدول الامتحانات التشخيصية المقننة وفق مستويات بلوم للفصل الأول',
    category: 'exams',
    categoryLabel: 'جداول وتقييمات',
    targetAudience: 'all',
    audienceLabel: 'كافة مستخدمي المنصة',
    content: 'تم اعتماد جدول الاختبارات التشخيصية الإلكترونية للمباحث العلمية (فيزياء، كيمياء، أحياء، رياضيات). يرجى مراجعة بنك الأسئلة والمحاكيات ثلاثية الأبعاد المرتبطة بكل درس.',
    author: 'د. سامية نصر - الشؤون التعليمية',
    createdAt: '2026-09-26 14:00',
    viewsCount: 890,
    acknowledgedCount: 540
  },
  {
    id: 'ann-3',
    title: 'تعميم إداري: تحديث معايير الاعتماد الأكاديمي لمقررات BTEC',
    category: 'academic',
    categoryLabel: 'تعميم إداري',
    targetAudience: 'teachers',
    audienceLabel: 'المعلمون والمشرفون',
    content: 'يرجى من جميع معلمي المسار التقني والهندسي رفع خطط الدروس والروابط المباشرة لنفق الرياح والمختبرات الافتراضية ضمن منصة LCM المحدثة قبل نهاية الأسبوع.',
    author: 'المشرف العام - إدارة مدرسة عنبه',
    createdAt: '2026-09-25 09:15',
    viewsCount: 38,
    acknowledgedCount: 22
  }
];

export const SchoolBroadcastsManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newAnn, setNewAnn] = useState({
    title: '',
    category: 'academic' as Announcement['category'],
    targetAudience: 'all' as Announcement['targetAudience'],
    content: '',
    author: 'إدارة المنصة المدرسية'
  });

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.content) {
      toast.error('يرجى كتابة عنوان ونص التعميم');
      return;
    }

    const catLabels: Record<Announcement['category'], string> = {
      urgent: 'عاجل وهام',
      exams: 'امتحانات وتقييم',
      academic: 'تعميم إداري',
      robotics: 'روبوتات وتحديات',
      general: 'إعلان عام'
    };

    const audLabels: Record<Announcement['targetAudience'], string> = {
      all: 'الجميع',
      students: 'الطلاب فقط',
      teachers: 'المعلمون فقط',
      parents: 'أولياء الأمور'
    };

    const created: Announcement = {
      id: 'ann-' + Date.now(),
      title: newAnn.title,
      category: newAnn.category,
      categoryLabel: catLabels[newAnn.category],
      targetAudience: newAnn.targetAudience,
      audienceLabel: audLabels[newAnn.targetAudience],
      content: newAnn.content,
      author: newAnn.author,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      viewsCount: 1,
      acknowledgedCount: 0
    };

    setAnnouncements([created, ...announcements]);
    setIsCreateModalOpen(false);
    setNewAnn({
      title: '',
      category: 'academic',
      targetAudience: 'all',
      content: '',
      author: 'إدارة المنصة المدرسية'
    });
    toast.success('تم بث التعميم ونشره فورياً لجميع الفئات المستهدفة!');
  };

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success('تم حذف التعميم');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/20 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              مركز التعاميم والإعلانات المدرسية الإدارية
            </span>
            <Badge variant="outline" className="text-[11px] font-mono border-amber-500/30 text-amber-600">
              Broadcast System v2.0
            </Badge>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
            بث التوجيهات المدرسية والتعاميم الفورية
          </h2>
          <p className="text-xs text-slate-500">
            إرسال إشعارات جماعية موجهة للطلاب والمعلمين وأولياء الأمور مع تتبع نسب القراءة والاطلاع
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-2xl text-xs gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء وبث تعميم جديد</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالعنوان، الكاتب، المحتوى..."
            className="h-9 pr-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
        >
          <option value="all">كافة التصنيفات</option>
          <option value="urgent">عاجل وهام</option>
          <option value="exams">امتحانات وتقييم</option>
          <option value="academic">تعميم إداري</option>
          <option value="robotics">روبوتات وتحديات</option>
          <option value="general">عام</option>
        </select>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.map((ann) => (
          <div
            key={ann.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-amber-400/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                  ann.category === 'urgent'
                    ? 'bg-rose-500/10 text-rose-600 border border-rose-400/20'
                    : ann.category === 'exams'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-400/20'
                    : ann.category === 'robotics'
                    ? 'bg-purple-500/10 text-purple-600 border border-purple-400/20'
                    : 'bg-cyan-500/10 text-cyan-600 border border-cyan-400/20'
                }`}>
                  {ann.categoryLabel}
                </span>

                <Badge variant="outline" className="text-[10px]">
                  موجّه إلى: {ann.audienceLabel}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {ann.createdAt}
                </span>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {ann.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              {ann.content}
            </p>

            <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                المرسل: {ann.author}
              </span>

              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                  <Eye className="w-3.5 h-3.5" /> {ann.viewsCount} مشاهدة
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {ann.acknowledgedCount} تم التأكيد
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            لا توجد تعاميم أو إعلانات مطابقة لمعايير البحث.
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">إنشاء وبث تعميم مدرسي إداري</h3>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">عنوان التعميم:</label>
                  <Input
                    value={newAnn.title}
                    onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                    placeholder="اكتب عنواناً واضحاً للتعميم..."
                    className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">التصنيف:</label>
                    <select
                      value={newAnn.category}
                      onChange={(e) => setNewAnn({ ...newAnn, category: e.target.value as any })}
                      className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                    >
                      <option value="academic">تعميم إداري</option>
                      <option value="exams">امتحانات وتقييم</option>
                      <option value="urgent">عاجل وهام</option>
                      <option value="robotics">روبوتات وتحديات</option>
                      <option value="general">إعلان عام</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">الفئة المستهدفة:</label>
                    <select
                      value={newAnn.targetAudience}
                      onChange={(e) => setNewAnn({ ...newAnn, targetAudience: e.target.value as any })}
                      className="w-full h-9 px-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                    >
                      <option value="all">كافة المنصة (طلاب + معلمين + أولياء أمور)</option>
                      <option value="students">الطلاب فقط</option>
                      <option value="teachers">المعلمون والمشرفون فقط</option>
                      <option value="parents">أولياء الأمور فقط</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">نص وتفاصيل التعميم:</label>
                  <Textarea
                    value={newAnn.content}
                    onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                    placeholder="اكتب التوجيهات الإدارية أو التعليمات بالتفصيل..."
                    className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 min-h-[90px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">الجهة المصدرة / الكاتب:</label>
                  <Input
                    value={newAnn.author}
                    onChange={(e) => setNewAnn({ ...newAnn, author: e.target.value })}
                    className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="rounded-xl text-xs"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl text-xs bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold"
                  >
                    <Send className="w-3.5 h-3.5 ml-1" />
                    بث ونشر الآن
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
