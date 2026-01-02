import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, Clock, Filter, BookOpen, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SpacedReview, SpacedLesson, SUBJECTS } from './types';
import { format, isToday, isBefore, startOfDay, isAfter } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ReviewScheduleTableProps {
  reviews: SpacedReview[];
  lessons: SpacedLesson[];
  onComplete: (reviewId: string) => Promise<boolean>;
  onDeleteLesson: (lessonId: string) => Promise<void>;
}

const ReviewScheduleTable: React.FC<ReviewScheduleTableProps> = ({
  reviews,
  lessons,
  onComplete,
  onDeleteLesson,
}) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'overdue'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [completing, setCompleting] = useState<string | null>(null);

  const getSubjectInfo = (subjectName: string) => {
    return SUBJECTS.find(s => s.value === subjectName) || SUBJECTS[SUBJECTS.length - 1];
  };

  const getReviewStatus = (review: SpacedReview) => {
    if (review.is_completed) return 'completed';
    const reviewDate = startOfDay(new Date(review.scheduled_date));
    const today = startOfDay(new Date());
    if (isToday(reviewDate)) return 'today';
    if (isBefore(reviewDate, today)) return 'overdue';
    return 'upcoming';
  };

  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by subject
    if (subjectFilter !== 'all') {
      const lessonIds = lessons.filter(l => l.subject_name === subjectFilter).map(l => l.id);
      filtered = filtered.filter(r => lessonIds.includes(r.lesson_id));
    }

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(r => getReviewStatus(r) === filter);
    }

    return filtered;
  }, [reviews, lessons, filter, subjectFilter]);

  const handleComplete = async (reviewId: string) => {
    setCompleting(reviewId);
    await onComplete(reviewId);
    setCompleting(null);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { label: 'مكتملة', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      today: { label: 'اليوم', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      overdue: { label: 'متأخرة', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      upcoming: { label: 'قادمة', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    };
    const badge = badges[status as keyof typeof badges];
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  const getLessonForReview = (review: SpacedReview) => {
    return lessons.find(l => l.id === review.lesson_id);
  };

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
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Calendar className="h-6 w-6 text-indigo-400" />
              </div>
              جدول المراجعة الذكي
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                <SelectTrigger className="w-32 bg-slate-800/50 border-indigo-500/30 text-white">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-indigo-500/30">
                  <SelectItem value="all" className="text-white">الكل</SelectItem>
                  <SelectItem value="today" className="text-white">اليوم</SelectItem>
                  <SelectItem value="upcoming" className="text-white">قادمة</SelectItem>
                  <SelectItem value="overdue" className="text-white">متأخرة</SelectItem>
                  <SelectItem value="completed" className="text-white">مكتملة</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-36 bg-slate-800/50 border-indigo-500/30 text-white">
                  <BookOpen className="h-4 w-4 ml-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-indigo-500/30">
                  <SelectItem value="all" className="text-white">كل المواد</SelectItem>
                  {SUBJECTS.map(subject => (
                    <SelectItem key={subject.value} value={subject.value} className="text-white">
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 text-lg">لا توجد مراجعات حالياً</p>
              <p className="text-slate-500 text-sm mt-2">أضف دروساً جديدة لبدء جدول المراجعة</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {filteredReviews.map((review, index) => {
                  const lesson = getLessonForReview(review);
                  const subject = lesson ? getSubjectInfo(lesson.subject_name) : null;
                  const status = getReviewStatus(review);

                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        p-4 rounded-xl border transition-all duration-300
                        ${status === 'completed' ? 'bg-green-950/30 border-green-500/30' : ''}
                        ${status === 'today' ? 'bg-amber-950/30 border-amber-500/30' : ''}
                        ${status === 'overdue' ? 'bg-red-950/30 border-red-500/30' : ''}
                        ${status === 'upcoming' ? 'bg-slate-800/50 border-slate-700/50' : ''}
                      `}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {subject && (
                            <div
                              className="w-3 h-10 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-medium">
                                {lesson?.lesson_name || 'درس محذوف'}
                              </span>
                              <Badge variant="outline" className="text-indigo-400 border-indigo-500/30">
                                {subject?.label}
                              </Badge>
                              <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                                المراجعة #{review.review_number}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(review.scheduled_date), 'EEEE، d MMMM yyyy', { locale: ar })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.round(review.memory_retention)}% تذكر متوقع
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(status)}
                          {!review.is_completed && (
                            <Button
                              size="sm"
                              onClick={() => handleComplete(review.id)}
                              disabled={completing === review.id}
                              className="bg-green-600 hover:bg-green-500 text-white"
                            >
                              {completing === review.id ? (
                                <span className="animate-spin">⏳</span>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 ml-1" />
                                  تم
                                </>
                              )}
                            </Button>
                          )}
                          {lesson && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteLesson(lesson.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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

export default ReviewScheduleTable;
