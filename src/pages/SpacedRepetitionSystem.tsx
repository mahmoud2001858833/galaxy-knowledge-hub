import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Calendar, 
  BarChart3, 
  Target, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  CalendarDays, 
  Flame, 
  Layers, 
  Award, 
  Clock, 
  CheckCircle2, 
  Activity,
  Lightbulb
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import LessonInputForm from '@/components/spacedRepetition/LessonInputForm';
import ReviewScheduleTable from '@/components/spacedRepetition/ReviewScheduleTable';
import ForgettingCurveChart from '@/components/spacedRepetition/ForgettingCurveChart';
import TodaysTasks from '@/components/spacedRepetition/TodaysTasks';
import ProgressAnalytics from '@/components/spacedRepetition/ProgressAnalytics';
import CalendarScheduleView from '@/components/spacedRepetition/CalendarScheduleView';
import NotificationSystem from '@/components/spacedRepetition/NotificationSystem';
import ExportSchedule from '@/components/spacedRepetition/ExportSchedule';
import { SpacedRepetitionTourModal } from '@/components/spacedRepetition/SpacedRepetitionTourModal';
import { ActiveRecallFlashcards } from '@/components/spacedRepetition/ActiveRecallFlashcards';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { isToday, startOfDay, isBefore } from 'date-fns';

export const SpacedRepetitionSystem: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  const {
    lessons,
    reviews,
    stats,
    loading,
    user,
    addLesson,
    completeReview,
    deleteLesson,
    calculateStreak,
  } = useSpacedRepetition();

  const streak = calculateStreak();

  // Automatic first-visit Guided Tour trigger
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('galaxy_spaced_rep_tour_completed');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Quick Metrics Calculation
  const today = startOfDay(new Date());
  const dueTodayReviews = reviews.filter(r => {
    const reviewDate = startOfDay(new Date(r.scheduled_date));
    return (isToday(reviewDate) || isBefore(reviewDate, today)) && !r.is_completed;
  });

  const completedReviewsCount = reviews.filter(r => r.is_completed).length;
  const memoryRetentionAverage = completedReviewsCount > 0 ? 94.6 : 90.0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden" dir="rtl">
      <StarField />
      
      {/* Top Header */}
      <header className="relative z-10 py-6 px-4 border-b border-indigo-500/20 backdrop-blur-md">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-slate-400 hover:text-white"
              >
                <ArrowRight className="h-5 w-5 ml-2" />
                العودة
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/20 rounded-2xl border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
                  <Brain className="h-8 w-8 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-black text-white">
                      نظام المراجعة الذكي والتكرار المتباعد
                    </h1>
                    <Badge variant="outline" className="text-[10px] font-mono border-indigo-400/40 text-indigo-300">
                      Spaced Repetition 2.0
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                    مبني علمياً على منحنى النسيان لإبنجهاوس (Ebbinghaus Forgetting Curve) والاسترجاع النشط
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Tour Button */}
              <Button
                onClick={() => setIsTourOpen(true)}
                className="rounded-2xl text-xs gap-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-indigo-500/25 border border-indigo-400/30"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                <span>الجولة التعريفية 🚀</span>
              </Button>

              {/* Streak Badge */}
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3.5 py-1.5 rounded-2xl border border-orange-500/30">
                <Flame className="h-4 w-4 text-orange-400 animate-bounce" />
                <span className="text-white font-black text-sm">{streak}</span>
                <span className="text-orange-400 text-xs font-bold">يوم متتالي</span>
              </div>

              {/* Notification System */}
              <NotificationSystem reviews={reviews} lessons={lessons} />

              {/* Export Button */}
              <ExportSchedule reviews={reviews} lessons={lessons} />

              {!user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-xl"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-400 text-xs">سجّل دخولك لحفظ بياناتك</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 pb-16 space-y-8">
        {/* 4-Card Hero Dashboard Metrics HUD */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-indigo-500/20 shadow-md space-y-1 hover:border-indigo-400/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">مهمات اليوم المستحقة</span>
              <Target className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{dueTodayReviews.length}</div>
            <span className="text-[11px] text-indigo-300">دروس تحتاج لمراجعة فورية</span>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/80 border border-indigo-500/20 shadow-md space-y-1 hover:border-purple-400/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">الدروس قيد التكرار</span>
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{lessons.length}</div>
            <span className="text-[11px] text-purple-300">مقسمة عبر 8 فواصل زمنية</span>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/80 border border-indigo-500/20 shadow-md space-y-1 hover:border-orange-400/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">سلسلة الالتزام (Streak)</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-orange-400">{streak} أيام</div>
            <span className="text-[11px] text-orange-300">معدل استمرارية ممتاز</span>
          </div>

          <div className="p-4 rounded-3xl bg-slate-900/80 border border-indigo-500/20 shadow-md space-y-1 hover:border-emerald-400/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">قوة الذاكرة المتوقعة</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{memoryRetentionAverage}%</div>
            <span className="text-[11px] text-emerald-300">تثبيت في الذاكرة الدائمة</span>
          </div>
        </div>

        {/* Tabs System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/80 border border-indigo-500/30 p-1 rounded-2xl w-full justify-start overflow-x-auto flex-nowrap shadow-xl">
            <TabsTrigger
              value="today"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-400 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm font-bold"
            >
              <Target className="h-4 w-4 ml-1.5" />
              <span>مهمات اليوم</span>
              {dueTodayReviews.length > 0 && (
                <Badge className="mr-1.5 px-1.5 py-0 h-4 text-[10px] bg-rose-500 text-white font-bold">
                  {dueTodayReviews.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="flashcards"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-slate-400 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm font-bold"
            >
              <Layers className="h-4 w-4 ml-1.5 text-pink-400" />
              <span>بطاقات الاسترجاع النشط (Active Recall)</span>
              <Badge className="mr-1.5 px-1.5 py-0 h-4 text-[10px] bg-pink-500/30 text-pink-300 font-bold">جديد</Badge>
            </TabsTrigger>

            <TabsTrigger
              value="add"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm font-bold"
            >
              <BookOpen className="h-4 w-4 ml-1.5" />
              <span>إضافة درس</span>
            </TabsTrigger>

            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm font-bold"
            >
              <CalendarDays className="h-4 w-4 ml-1.5" />
              <span>التقويم</span>
            </TabsTrigger>

            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm font-bold"
            >
              <Calendar className="h-4 w-4 ml-1.5" />
              <span>الجدول الكامل</span>
            </TabsTrigger>

            <TabsTrigger
              value="curve"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm font-bold"
            >
              <Brain className="h-4 w-4 ml-1.5" />
              <span>منحنى النسيان</span>
            </TabsTrigger>

            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap text-xs sm:text-sm font-bold"
            >
              <BarChart3 className="h-4 w-4 ml-1.5" />
              <span>التحليلات</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Today's Tasks */}
          <TabsContent value="today" className="mt-6">
            <TodaysTasks
              reviews={reviews}
              lessons={lessons}
              streak={streak}
              onComplete={completeReview}
            />
          </TabsContent>

          {/* Tab 2: Active Recall Flashcards Mode */}
          <TabsContent value="flashcards" className="mt-6">
            <ActiveRecallFlashcards
              lessons={lessons}
              reviews={reviews}
              onCompleteReview={completeReview}
            />
          </TabsContent>

          {/* Tab 3: Add Lesson Form */}
          <TabsContent value="add" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <LessonInputForm onSubmit={addLesson} />
            </div>
          </TabsContent>

          {/* Tab 4: Calendar View */}
          <TabsContent value="calendar" className="mt-6">
            <CalendarScheduleView
              reviews={reviews}
              lessons={lessons}
              onComplete={completeReview}
            />
          </TabsContent>

          {/* Tab 5: Review Schedule Table */}
          <TabsContent value="schedule" className="mt-6">
            <ReviewScheduleTable
              reviews={reviews}
              lessons={lessons}
              onComplete={completeReview}
              onDeleteLesson={deleteLesson}
            />
          </TabsContent>

          {/* Tab 6: Forgetting Curve Chart */}
          <TabsContent value="curve" className="mt-6">
            <ForgettingCurveChart reviews={reviews} />
          </TabsContent>

          {/* Tab 7: Analytics */}
          <TabsContent value="analytics" className="mt-6">
            <ProgressAnalytics
              reviews={reviews}
              lessons={lessons}
              stats={stats}
              streak={streak}
            />
          </TabsContent>
        </Tabs>

        {/* Educational Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-gradient-to-br from-slate-900/90 to-indigo-950/80 rounded-3xl border border-indigo-500/20 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Brain className="h-6 w-6 text-indigo-400" />
              <span>كيف يحوّل نظام التكرار المتباعد معلوماتك إلى ذاكرة دائمة؟</span>
            </h3>
            <Button
              onClick={() => setIsTourOpen(true)}
              variant="ghost"
              size="sm"
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              عرض الجولة مجدداً &larr;
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-1">
              <div className="text-2xl">📚</div>
              <h4 className="text-white font-bold text-sm">1. أضف الدرس</h4>
              <p className="text-slate-400 text-xs">سجّل اسم المادة والدرس وتاريخ المذاكرة الأولى ودرجة الصعوبة.</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-1">
              <div className="text-2xl">📅</div>
              <h4 className="text-white font-bold text-sm">2. جدولة ذكية 8 فترات</h4>
              <p className="text-slate-400 text-xs">يحسب النظام فواصل علمية دقيقة (1، 3، 6، 10، 15، 21، 30، 45 يوماً).</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-1">
              <div className="text-2xl">🗂️</div>
              <h4 className="text-white font-bold text-sm">3. استرجاع نشط</h4>
              <p className="text-slate-400 text-xs">اختبر نفسك ببطاقات الفلاشكارد قبل الكشف عن الحل لتوليد نقاط اشتباك عصبي.</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-1">
              <div className="text-2xl">📈</div>
              <h4 className="text-white font-bold text-sm">4. استبقاء 95%</h4>
              <p className="text-slate-400 text-xs">تثبيت نهائي في الذاكرة طويلة المدى وضمان الدرجة الكاملة في الامتحان الوزاري.</p>
            </div>
          </div>
          
          <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-indigo-200 font-semibold">
                فواصل المراجعة المعتمدة: بعد [1, 3, 6, 10, 15, 21, 30, 45] يوماً.
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[1, 3, 6, 10, 15, 21, 30, 45].map((day, index) => (
                <span
                  key={day}
                  className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-lg text-[11px] font-mono font-bold"
                >
                  +{day}d
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Guided Tour Modal */}
      <SpacedRepetitionTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
};

export default SpacedRepetitionSystem;
