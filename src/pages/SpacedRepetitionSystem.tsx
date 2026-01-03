import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Calendar, BarChart3, Target, BookOpen, ArrowRight, Sparkles, CalendarDays, Flame } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';

const SpacedRepetitionSystem = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden" dir="rtl">
      <StarField />
      
      {/* Header */}
      <header className="relative z-10 py-6 px-4">
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
                <div className="p-3 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-2xl border border-indigo-500/30">
                  <Brain className="h-8 w-8 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    نظام المراجعة الذكي
                  </h1>
                  <p className="text-slate-400 text-sm">
                    مبني على منحنى النسيان (Ebbinghaus Forgetting Curve)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Streak Badge */}
              {streak > 0 && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 rounded-full border border-orange-500/30">
                  <Flame className="h-5 w-5 text-orange-400" />
                  <span className="text-white font-bold">{streak}</span>
                  <span className="text-orange-400 text-sm">يوم</span>
                </div>
              )}

              {/* Notification System */}
              <NotificationSystem reviews={reviews} lessons={lessons} />

              {/* Export Button */}
              <ExportSchedule reviews={reviews} lessons={lessons} />

              {!user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-400 text-sm">سجّل دخولك لحفظ بياناتك</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/80 border border-indigo-500/30 p-1 rounded-xl w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger
              value="today"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
            >
              <Target className="h-4 w-4 ml-2" />
              مهمات اليوم
            </TabsTrigger>
            <TabsTrigger
              value="add"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4 ml-2" />
              إضافة درس
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
            >
              <CalendarDays className="h-4 w-4 ml-2" />
              التقويم
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
            >
              <Calendar className="h-4 w-4 ml-2" />
              الجدول
            </TabsTrigger>
            <TabsTrigger
              value="curve"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
            >
              <Brain className="h-4 w-4 ml-2" />
              منحنى النسيان
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
            >
              <BarChart3 className="h-4 w-4 ml-2" />
              التحليلات
            </TabsTrigger>
          </TabsList>

          {/* Today's Tasks */}
          <TabsContent value="today" className="mt-6">
            <TodaysTasks
              reviews={reviews}
              lessons={lessons}
              streak={streak}
              onComplete={completeReview}
            />
          </TabsContent>

          {/* Add Lesson Form */}
          <TabsContent value="add" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <LessonInputForm onSubmit={addLesson} />
            </div>
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-6">
            <CalendarScheduleView
              reviews={reviews}
              lessons={lessons}
              onComplete={completeReview}
            />
          </TabsContent>

          {/* Review Schedule */}
          <TabsContent value="schedule" className="mt-6">
            <ReviewScheduleTable
              reviews={reviews}
              lessons={lessons}
              onComplete={completeReview}
              onDeleteLesson={deleteLesson}
            />
          </TabsContent>

          {/* Forgetting Curve */}
          <TabsContent value="curve" className="mt-6">
            <ForgettingCurveChart reviews={reviews} />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="mt-6">
            <ProgressAnalytics
              reviews={reviews}
              lessons={lessons}
              stats={stats}
              streak={streak}
            />
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-br from-slate-900/80 to-indigo-950/80 rounded-2xl border border-indigo-500/20"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-400" />
            كيف يعمل النظام؟
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="text-white font-medium mb-1">أضف الدرس</h4>
              <p className="text-slate-400 text-sm">سجّل اسم المادة والدرس وتاريخ الدراسة الأولى</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="text-2xl mb-2">📅</div>
              <h4 className="text-white font-medium mb-1">جدول تلقائي</h4>
              <p className="text-slate-400 text-sm">النظام يُنشئ 8 مواعيد مراجعة بفواصل زمنية علمية</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="text-2xl mb-2">🔔</div>
              <h4 className="text-white font-medium mb-1">تذكيرات ذكية</h4>
              <p className="text-slate-400 text-sm">تنبيهات يومية بالمراجعات المطلوبة</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="text-white font-medium mb-1">تثبيت المعلومات</h4>
              <p className="text-slate-400 text-sm">نسبة تذكر تصل إلى 95% بعد 45 يوم</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <h4 className="text-indigo-400 font-medium mb-2">📊 فواصل المراجعة (Spaced Repetition):</h4>
            <div className="flex flex-wrap gap-2">
              {[1, 3, 6, 10, 15, 21, 30, 45].map((day, index) => (
                <span
                  key={day}
                  className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm"
                >
                  المراجعة {index + 1}: بعد {day} يوم
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SpacedRepetitionSystem;
