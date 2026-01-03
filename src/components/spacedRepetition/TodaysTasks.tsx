import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Flame, Target, BookOpen, AlertTriangle, Calendar, PartyPopper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SpacedReview, SpacedLesson, SUBJECTS, DIFFICULTY_LEVELS } from './types';
import { format, isToday, isBefore, startOfDay, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface TodaysTasksProps {
  reviews: SpacedReview[];
  lessons: SpacedLesson[];
  streak: number;
  onComplete: (reviewId: string) => Promise<boolean>;
}

const TodaysTasks: React.FC<TodaysTasksProps> = ({ reviews, lessons, streak, onComplete }) => {
  const [completing, setCompleting] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  // Get today's and overdue reviews
  const getTodaysReviews = useCallback(() => {
    const today = startOfDay(new Date());
    return reviews.filter(r => {
      const reviewDate = startOfDay(new Date(r.scheduled_date));
      return isToday(reviewDate) && !r.is_completed;
    });
  }, [reviews]);

  const getOverdueReviews = useCallback(() => {
    const today = startOfDay(new Date());
    return reviews.filter(r => {
      const reviewDate = startOfDay(new Date(r.scheduled_date));
      return isBefore(reviewDate, today) && !r.is_completed;
    });
  }, [reviews]);

  const getUpcomingReviews = useCallback(() => {
    const today = startOfDay(new Date());
    const weekLater = addDays(today, 7);
    return reviews.filter(r => {
      const reviewDate = startOfDay(new Date(r.scheduled_date));
      return !isBefore(reviewDate, today) && !isToday(reviewDate) && isBefore(reviewDate, weekLater) && !r.is_completed;
    }).slice(0, 5);
  }, [reviews]);

  const todaysReviews = getTodaysReviews();
  const overdueReviews = getOverdueReviews();
  const upcomingReviews = getUpcomingReviews();
  const allPendingReviews = [...overdueReviews, ...todaysReviews];

  const completedToday = reviews.filter(r => {
    if (!r.completed_at) return false;
    return isToday(new Date(r.completed_at));
  });

  const totalTasks = allPendingReviews.length + completedToday.length;
  const progress = totalTasks > 0 ? Math.round((completedToday.length / totalTasks) * 100) : 100;

  const getSubjectInfo = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return null;
    return SUBJECTS.find(s => s.value === lesson.subject_name);
  };

  const getLessonInfo = (lessonId: string) => {
    return lessons.find(l => l.id === lessonId);
  };

  const getEstimatedTime = (lessonId: string) => {
    const lesson = getLessonInfo(lessonId);
    if (!lesson) return 15;
    const difficulty = DIFFICULTY_LEVELS.find(d => d.value === lesson.difficulty);
    return Math.round((lesson.study_duration || 30) * (difficulty?.multiplier || 1) * 0.3);
  };

  const playSuccessSound = () => {
    try {
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const playCompletionSound = () => {
    try {
      const audio = new Audio('/sounds/celebration.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleComplete = async (reviewId: string) => {
    setCompleting(reviewId);
    const success = await onComplete(reviewId);
    setCompleting(null);

    if (success) {
      playSuccessSound();
      
      // Check if all tasks completed
      if (allPendingReviews.length === 1) {
        setShowConfetti(true);
        playCompletionSound();
        toast({
          title: '🎉 مبروك! أكملت جميع مهام اليوم',
          description: 'استمر على هذا المستوى الرائع!',
        });
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  };

  const renderReviewCard = (review: SpacedReview, isOverdue: boolean = false) => {
    const subject = getSubjectInfo(review.lesson_id);
    const lesson = getLessonInfo(review.lesson_id);
    const estimatedTime = getEstimatedTime(review.lesson_id);

    return (
      <motion.div
        key={review.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        layout
        className={`
          p-4 rounded-xl border transition-all duration-300
          ${isOverdue 
            ? 'bg-red-950/30 border-red-500/30' 
            : 'bg-amber-950/30 border-amber-500/30'
          }
          hover:scale-[1.01] hover:shadow-lg
        `}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {subject && (
              <div
                className="w-2 h-16 rounded-full flex-shrink-0"
                style={{ backgroundColor: subject.color }}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <BookOpen className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-white font-medium truncate">
                  {lesson?.lesson_name || 'درس غير معروف'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                  المراجعة #{review.review_number}
                </Badge>
                {isOverdue && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <AlertTriangle className="h-3 w-3 ml-1" />
                    متأخرة
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span style={{ color: subject?.color }}>{subject?.label}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{estimatedTime} دقيقة
                </span>
                {!isOverdue && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(review.scheduled_date), 'd MMMM', { locale: ar })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => handleComplete(review.id)}
            disabled={completing === review.id}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 md:px-6 flex-shrink-0"
          >
            {completing === review.id ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                ⏳
              </motion.span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 ml-1 md:ml-2" />
                <span className="hidden sm:inline">تم الإنجاز</span>
                <span className="sm:hidden">تم</span>
              </>
            )}
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <PartyPopper className="h-24 w-24 text-amber-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white">🎉 أحسنت!</h2>
            </motion.div>
            {/* Confetti particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 500,
                  scale: [0, 1, 0.5],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  backgroundColor: ['#fbbf24', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'][i % 5],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-950/90 border-indigo-500/30 backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-b border-indigo-500/20 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <Target className="h-6 w-6 text-amber-400" />
              </div>
              مهمات اليوم
            </CardTitle>
            <div className="flex items-center gap-4">
              {/* Streak Indicator */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 rounded-full border border-orange-500/30">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-white font-bold">{streak}</span>
                <span className="text-orange-400 text-sm">يوم متتالي</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {/* Progress Section */}
          <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300">التقدم اليومي</span>
              <span className="text-white font-bold">{completedToday.length}/{totalTasks}</span>
            </div>
            <Progress 
              value={progress} 
              className="h-3 bg-slate-700"
            />
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-green-400">✅ {completedToday.length} مكتملة</span>
              {overdueReviews.length > 0 && (
                <span className="text-red-400">⚠️ {overdueReviews.length} متأخرة</span>
              )}
              <span className="text-amber-400">📚 {todaysReviews.length} لليوم</span>
            </div>
          </div>

          {/* All Done State */}
          {allPendingReviews.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 className="h-20 w-20 mx-auto text-green-400 mb-4" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">🎉 أحسنت!</h3>
              <p className="text-slate-400">لا توجد مراجعات متبقية لليوم</p>
              <p className="text-slate-500 text-sm mt-2">استمر على هذا الأداء الرائع!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overdue Reviews */}
              {overdueReviews.length > 0 && (
                <div>
                  <h3 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    مراجعات متأخرة ({overdueReviews.length})
                  </h3>
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {overdueReviews.map((review) => renderReviewCard(review, true))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Today's Reviews */}
              {todaysReviews.length > 0 && (
                <div>
                  <h3 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    مراجعات اليوم ({todaysReviews.length})
                  </h3>
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {todaysReviews.map((review) => renderReviewCard(review, false))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Reviews Section */}
      {upcomingReviews.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-900/80 to-blue-950/80 border-blue-500/30 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              المراجعات القادمة (هذا الأسبوع)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-2">
              {upcomingReviews.map((review) => {
                const subject = getSubjectInfo(review.lesson_id);
                const lesson = getLessonInfo(review.lesson_id);
                
                return (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      {subject && (
                        <div
                          className="w-1.5 h-10 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                      )}
                      <div>
                        <span className="text-white text-sm">{lesson?.lesson_name}</span>
                        <div className="flex items-center gap-2 text-xs">
                          <span style={{ color: subject?.color }}>{subject?.label}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-purple-400">المراجعة #{review.review_number}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                      {format(new Date(review.scheduled_date), 'EEEE', { locale: ar })}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default TodaysTasks;
