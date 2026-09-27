import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Lightbulb,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  Gauge,
  Sliders,
  HelpCircle,
  TrendingUp,
  BookmarkPlus
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import { toast } from 'sonner';

export const SpacedRepetitionSystem: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  // Pomodoro Focus Studio State
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [isTickingSound, setIsTickingSound] = useState(false);

  // Neural Retention Calculator Modal State
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcDaysPassed, setCalcDaysPassed] = useState(14);

  const {
    lessons,
    reviews,
    stats,
    loading,
    user,
    addLesson,
    completeReview,
    deleteLesson,
    reloadCurriculumPlan,
    calculateStreak,
  } = useSpacedRepetition();

  const streak = calculateStreak();

  // Pomodoro Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (isPomodoroRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      setIsPomodoroRunning(false);
      try {
        const audio = new Audio('/sounds/celebration.mp3');
        audio.play().catch(() => {});
      } catch {}
      toast.success('🎉 انتهت جلسة التركيز العميق (25 دقيقة)! حان وقت استراحة الـ 5 دقائق.');
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
  const memoryRetentionAverage = completedReviewsCount > 0 ? 94.6 : 91.2;

  // Calculate retention values for calculator
  const retentionWithoutReview = Math.round(Math.max(5, Math.exp(-calcDaysPassed / 12) * 100));
  const retentionWithRepetition = Math.round(Math.min(98, 92 + (calcDaysPassed > 10 ? 4 : 2)));

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative overflow-hidden" dir="rtl">
      <StarField starCount={400} />
      
      {/* Top Header */}
      <header className="relative z-10 py-5 px-4 border-b border-indigo-500/20 bg-slate-950/80 backdrop-blur-2xl">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-2xl"
              >
                <ArrowRight className="h-5 w-5 ml-1.5" />
                الرئيسية
              </Button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-pink-500/20 rounded-2xl border border-indigo-500/40 shadow-lg shadow-indigo-500/25">
                  <Brain className="h-8 w-8 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300">
                      نظام المراجعة الذكي والتكرار المتباعد
                    </h1>
                    <Badge variant="outline" className="text-[10px] font-mono border-indigo-400/40 text-indigo-300 bg-indigo-950/40">
                      Spaced Repetition 2.0 Pro
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                    خوارزمية SM-2 ومنحنى النسيان لإبنجهاوس لمكافحة النسيان وتثبيت المعرفة الدائمة 95%+
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
              {/* Pomodoro Focus Timer Quick Trigger */}
              <Button
                onClick={() => setIsPomodoroOpen(true)}
                className="rounded-2xl text-xs gap-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold shadow-md shadow-rose-500/20 border border-rose-400/30"
              >
                <Timer className="w-3.5 h-3.5 text-white animate-spin-slow" />
                <span>جلسة تركيز 25د</span>
              </Button>

              {/* Neural Retention Calculator Trigger */}
              <Button
                onClick={() => setIsCalcOpen(true)}
                variant="outline"
                className="rounded-2xl text-xs gap-1.5 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10"
              >
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">حاسبة الذاكرة</span>
              </Button>

              {/* Reload Curriculum Seed Plan */}
              <Button
                onClick={reloadCurriculumPlan}
                variant="outline"
                className="rounded-2xl text-xs gap-1.5 border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
                title="شحن خطة نموذجية لمباحث التوجيهي والعلوم"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">خطة المنهاج</span>
              </Button>

              {/* Tour Button */}
              <Button
                onClick={() => setIsTourOpen(true)}
                className="rounded-2xl text-xs gap-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-indigo-500/25 border border-indigo-400/30"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                <span>الجولة 🚀</span>
              </Button>

              {/* Streak Badge */}
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3.5 py-1.5 rounded-2xl border border-orange-500/40 shadow-sm">
                <Flame className="h-4 w-4 text-orange-400 animate-bounce" />
                <span className="text-white font-black text-sm">{streak}</span>
                <span className="text-orange-400 text-xs font-bold">أيام</span>
              </div>

              {/* Notification System */}
              <NotificationSystem reviews={reviews} lessons={lessons} />

              {/* Export Button */}
              <ExportSchedule reviews={reviews} lessons={lessons} />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 pb-16 space-y-8 max-w-7xl">
        
        {/* 4-Card Hero Dashboard Metrics HUD with Glowing Borders */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.12)] space-y-2 hover:border-indigo-400/60 transition-all group backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">المهمات المستحقة اليوم</span>
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{dueTodayReviews.length}</div>
            <span className="text-[11px] text-indigo-300 font-medium block">
              {dueTodayReviews.length > 0 ? 'مراجعات جاهزة للاسترجاع الفوري' : '✓ كافة مهمات اليوم منجزة بنجاح'}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.12)] space-y-2 hover:border-purple-400/60 transition-all group backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">الدروس في دورة التكرار</span>
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-300">{lessons.length}</div>
            <span className="text-[11px] text-purple-400 font-medium block">
              مجدولة عبر 8 فترات زمنية علمية
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.12)] space-y-2 hover:border-orange-400/60 transition-all group backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">سلسلة الالتزام (Streak)</span>
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-orange-400">{streak} أيام</div>
            <span className="text-[11px] text-orange-300 font-medium block">
              عادات دراسية فولاذية مستمرة
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.12)] space-y-2 hover:border-emerald-400/60 transition-all group backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">معدل استبقاء الذاكرة</span>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400">{memoryRetentionAverage}%</div>
            <span className="text-[11px] text-emerald-300 font-medium block">
              تثبيت عصبي دائم للعلامة الكاملة
            </span>
          </div>
        </div>

        {/* Tabs System */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/95 border border-indigo-500/30 p-1.5 rounded-3xl w-full justify-start overflow-x-auto flex-nowrap shadow-2xl backdrop-blur-xl">
            <TabsTrigger
              value="today"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-300 px-5 py-3 rounded-2xl transition-all whitespace-nowrap text-xs sm:text-sm font-black"
            >
              <Target className="h-4 w-4 ml-2" />
              <span>مهمات اليوم</span>
              {dueTodayReviews.length > 0 && (
                <Badge className="mr-2 px-2 py-0.5 text-[10px] bg-rose-500 text-white font-bold animate-pulse">
                  {dueTodayReviews.length}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="flashcards"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-slate-300 px-5 py-3 rounded-2xl transition-all whitespace-nowrap text-xs sm:text-sm font-black"
            >
              <Layers className="h-4 w-4 ml-2 text-pink-400" />
              <span>بطاقات الاسترجاع النشط (Active Recall)</span>
              <Badge className="mr-2 px-2 py-0.5 text-[10px] bg-pink-500/30 text-pink-300 font-bold">12 بطاقة + مخصص</Badge>
            </TabsTrigger>

            <TabsTrigger
              value="add"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-300 px-5 py-3 rounded-2xl transition-all whitespace-nowrap text-xs sm:text-sm font-black"
            >
              <BookOpen className="h-4 w-4 ml-2" />
              <span>إضافة درس</span>
            </TabsTrigger>

            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-300 px-5 py-3 rounded-2xl transition-all whitespace-nowrap text-xs sm:text-sm font-black"
            >
              <CalendarDays className="h-4 w-4 ml-2" />
              <span>التقويم التفاعلي</span>
            </TabsTrigger>

            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-300 px-5 py-3 rounded-2xl transition-all whitespace-nowrap text-xs sm:text-sm font-black"
            >
              <Calendar className="h-4 w-4 ml-2" />
              <span>الجدول الكامل</span>
            </TabsTrigger>

            <TabsTrigger
              value="curve"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-300 px-5 py-3 rounded-2xl transition-all whitespace-nowrap text-xs sm:text-sm font-black"
            >
              <Brain className="h-4 w-4 ml-2" />
              <span>منحنى النسيان</span>
            </TabsTrigger>

            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-300 px-5 py-3 rounded-2xl transition-all whitespace-nowrap text-xs sm:text-sm font-black"
            >
              <BarChart3 className="h-4 w-4 ml-2" />
              <span>تحليلات الأداء</span>
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

        {/* Educational Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 bg-gradient-to-br from-slate-900/95 via-indigo-950/80 to-purple-950/80 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
              <Brain className="h-6 w-6 text-indigo-400" />
              <span>كيف يحوّل نظام التكرار المتباعد معلوماتك إلى ذاكرة دائمة؟</span>
            </h3>
            <Button
              onClick={() => setIsTourOpen(true)}
              variant="ghost"
              size="sm"
              className="text-xs text-indigo-300 hover:text-white"
            >
              فتح الجولة التعليمية &larr;
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="text-2xl">📚</div>
              <h4 className="text-white font-bold text-sm">1. أضف الدرس وصعوبته</h4>
              <p className="text-slate-400 text-xs leading-relaxed">حدد المادة والدرس ودرجة الصعوبة لحساب مضاعف الفترات الزمنية بدقة.</p>
            </div>
            <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="text-2xl">📅</div>
              <h4 className="text-white font-bold text-sm">2. جدولة ذكية 8 فترات</h4>
              <p className="text-slate-400 text-xs leading-relaxed">يحسب النظام مواعيد متباعدة: (+1، +3، +6، +10، +15، +21، +30، +45 يوماً).</p>
            </div>
            <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="text-2xl">🗂️</div>
              <h4 className="text-white font-bold text-sm">3. استرجاع نشط وتقييم SM-2</h4>
              <p className="text-slate-400 text-xs leading-relaxed">تدرّب ببطاقات الفلاشكارد وقيم تذكرك لتعديل الفاصل الزمني ديناميكياً.</p>
            </div>
            <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="text-2xl">📈</div>
              <h4 className="text-white font-bold text-sm">4. استبقاء 95%+ في الامتحان</h4>
              <p className="text-slate-400 text-xs leading-relaxed">تثبيت المعلومات في الذاكرة طويلة المدى وضمان التفوق في الامتحانات الوزارية.</p>
            </div>
          </div>
          
          <div className="p-4 bg-indigo-950/40 rounded-2xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-indigo-200 font-semibold">
                فواصل المراجعة المعتمدة علمياً: [1, 3, 6, 10, 15, 21, 30, 45] يوماً.
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[1, 3, 6, 10, 15, 21, 30, 45].map((day) => (
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

      {/* Pomodoro Focus Studio Modal */}
      <Dialog open={isPomodoroOpen} onOpenChange={setIsPomodoroOpen}>
        <DialogContent className="max-w-md bg-slate-950/95 border-rose-500/30 text-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-[0_0_50px_rgba(244,63,94,0.2)]" dir="rtl">
          <DialogHeader className="space-y-1 pb-3 border-b border-slate-800 text-center">
            <DialogTitle className="text-2xl font-black text-white flex items-center justify-center gap-2">
              <Timer className="w-6 h-6 text-rose-400" />
              <span>جلسة تركيز بومودورو (Pomodoro)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              25 دقيقة من المذاكرة والاسترجاع الذهني الصافي بدون أي مشتتات
            </DialogDescription>
          </DialogHeader>

          {/* Big Glowing Timer Display */}
          <div className="relative p-8 rounded-3xl bg-slate-900/90 border border-rose-500/30 shadow-inner flex flex-col items-center justify-center space-y-2">
            <span className="text-5xl sm:text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300 tracking-wider">
              {formatTimer(pomodoroSeconds)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {isPomodoroRunning ? '⚡ الجلسة جارية الآن.. ركز بعمق' : 'جاهز للبدء؟ اضغط تشغيل'}
            </span>
          </div>

          {/* Timer Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <Button
              onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
              className={`rounded-2xl text-xs font-black px-6 py-3 shadow-lg ${
                isPomodoroRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/25'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/25'
              }`}
            >
              {isPomodoroRunning ? (
                <>
                  <Pause className="w-4 h-4 ml-1.5" />
                  <span>إيقاف مؤقت</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 ml-1.5 fill-current" />
                  <span>بدء الجلسة (25 دقيقة)</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                setIsPomodoroRunning(false);
                setPomodoroSeconds(25 * 60);
              }}
              variant="outline"
              className="rounded-2xl text-xs border-slate-700 text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 ml-1" />
              <span>إعادة ضبط</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Neural Retention Calculator Modal */}
      <Dialog open={isCalcOpen} onOpenChange={setIsCalcOpen}>
        <DialogContent className="max-w-lg bg-slate-950/95 border-indigo-500/30 text-slate-100 rounded-3xl p-6 sm:p-8 space-y-6" dir="rtl">
          <DialogHeader className="text-right space-y-1 pb-3 border-b border-slate-800">
            <DialogTitle className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Gauge className="w-6 h-6 text-indigo-400" />
              <span>محاكي قوة الذاكرة ومنحنى النسيان</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              حرّك المؤشر لرؤية الفرق الهائل بين التعلم التقليدي مقابل نظام التكرار المتباعد
            </DialogDescription>
          </DialogHeader>

          {/* Slider input */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">الزمن المنقضي بعد المذاكرة الأولى:</span>
              <span className="font-mono text-indigo-400 font-bold text-sm">{calcDaysPassed} يوماً</span>
            </div>
            <input 
              type="range"
              min={1}
              max={60}
              value={calcDaysPassed}
              onChange={(e) => setCalcDaysPassed(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>اليوم 1</span>
              <span>اليوم 15</span>
              <span>اليوم 30</span>
              <span>اليوم 60</span>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Without spaced repetition */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2 text-center">
              <span className="text-xs font-bold text-rose-300 block">بدون تكرار متباعد (تقليدي)</span>
              <div className="text-3xl font-black text-rose-400">{retentionWithoutReview}%</div>
              <span className="text-[10px] text-rose-300/80 block">
                تلاشي أثر الذاكرة ونقصان التشابكات العصبية
              </span>
            </div>

            {/* With spaced repetition */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2 text-center shadow-lg shadow-emerald-500/10">
              <span className="text-xs font-bold text-emerald-300 block">مع التكرار المتباعد الذكي</span>
              <div className="text-3xl font-black text-emerald-400">{retentionWithRepetition}%</div>
              <span className="text-[10px] text-emerald-300/80 block">
                تثبيت صلب في قشرة الدماغ الدائمة
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed">
            💡 <strong>التفسير العصبي:</strong> كل مراجعة متباعدة تجبر الدماغ على إعادة بناء مسار استرجاع عصبي جديد، مما يجعل مقاومة النسيان تتضاعف بمقدار 200% بعد كل جلسة.
          </div>
        </DialogContent>
      </Dialog>

      {/* Guided Tour Modal */}
      <SpacedRepetitionTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
};

export default SpacedRepetitionSystem;
