import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Flame, Target, Bell, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SpacedReview, SpacedLesson, SUBJECTS } from './types';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
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
  const { toast } = useToast();

  const todaysReviews = reviews.filter(r => {
    const reviewDate = startOfDay(new Date(r.scheduled_date));
    const today = startOfDay(new Date());
    return (isToday(reviewDate) || isBefore(reviewDate, today)) && !r.is_completed;
  });

  const completedToday = reviews.filter(r => {
    if (!r.completed_at) return false;
    return isToday(new Date(r.completed_at));
  });

  const progress = todaysReviews.length + completedToday.length > 0
    ? Math.round((completedToday.length / (todaysReviews.length + completedToday.length)) * 100)
    : 100;

  const getSubjectInfo = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return null;
    return SUBJECTS.find(s => s.value === lesson.subject_name);
  };

  const getLessonName = (lessonId: string) => {
    return lessons.find(l => l.id === lessonId)?.lesson_name || 'درس غير معروف';
  };

  const handleComplete = async (reviewId: string) => {
    setCompleting(reviewId);
    const success = await onComplete(reviewId);
    setCompleting(null);

    if (success && todaysReviews.length === 1) {
      toast({
        title: '🎉 مبروك! أكملت جميع مهام اليوم',
        description: 'استمر على هذا المستوى الرائع!',
      });
    }
  };

  // Show notification on mount if there are pending reviews
  useEffect(() => {
    if (todaysReviews.length > 0) {
      const subjects = [...new Set(todaysReviews.map(r => {
        const subject = getSubjectInfo(r.lesson_id);
        return subject?.label;
      }).filter(Boolean))];

      toast({
        title: `📚 لديك ${todaysReviews.length} مراجعات اليوم!`,
        description: `المواد: ${subjects.join('، ')}`,
      });
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
              <span className="text-white font-bold">{completedToday.length}/{todaysReviews.length + completedToday.length}</span>
            </div>
            <Progress value={progress} className="h-3 bg-slate-700" />
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-green-400">{completedToday.length} مكتملة</span>
              <span className="text-amber-400">{todaysReviews.length} متبقية</span>
            </div>
          </div>

          {/* Tasks List */}
          {todaysReviews.length === 0 ? (
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
            <div className="space-y-3">
              <AnimatePresence>
                {todaysReviews.map((review, index) => {
                  const subject = getSubjectInfo(review.lesson_id);
                  const isOverdue = isBefore(new Date(review.scheduled_date), startOfDay(new Date()));

                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        p-4 rounded-xl border transition-all duration-300
                        ${isOverdue 
                          ? 'bg-red-950/30 border-red-500/30' 
                          : 'bg-amber-950/30 border-amber-500/30'
                        }
                        hover:scale-[1.02]
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {subject && (
                            <div
                              className="w-2 h-12 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <BookOpen className="h-4 w-4 text-slate-400" />
                              <span className="text-white font-medium">
                                {getLessonName(review.lesson_id)}
                              </span>
                              <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                                المراجعة #{review.review_number}
                              </Badge>
                              {isOverdue && (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                  متأخرة
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                              <span style={{ color: subject?.color }}>{subject?.label}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(review.scheduled_date), 'd MMMM', { locale: ar })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleComplete(review.id)}
                          disabled={completing === review.id}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6"
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
                              <CheckCircle2 className="h-4 w-4 ml-2" />
                              تم الإنجاز
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TodaysTasks;
