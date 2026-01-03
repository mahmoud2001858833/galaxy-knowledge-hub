import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SpacedReview, SpacedLesson, SUBJECTS } from './types';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DayDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  reviews: SpacedReview[];
  lessons: SpacedLesson[];
  onComplete: (reviewId: string) => Promise<boolean>;
}

const DayDetailsDialog: React.FC<DayDetailsDialogProps> = ({
  isOpen,
  onClose,
  date,
  reviews,
  lessons,
  onComplete,
}) => {
  const [completing, setCompleting] = useState<string | null>(null);

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
    await onComplete(reviewId);
    setCompleting(null);
  };

  const getDayStatus = () => {
    if (!date) return 'upcoming';
    const today = startOfDay(new Date());
    const dayDate = startOfDay(date);
    if (isToday(dayDate)) return 'today';
    if (isBefore(dayDate, today)) return 'overdue';
    return 'upcoming';
  };

  const status = getDayStatus();

  if (!isOpen || !date) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl border border-indigo-500/30 w-full max-w-lg max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className={`
            p-4 border-b border-indigo-500/20
            ${status === 'today' ? 'bg-amber-500/10' : status === 'overdue' ? 'bg-red-500/10' : 'bg-blue-500/10'}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-xl
                  ${status === 'today' ? 'bg-amber-500/20' : status === 'overdue' ? 'bg-red-500/20' : 'bg-blue-500/20'}
                `}>
                  {status === 'overdue' ? (
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  ) : (
                    <Clock className="h-6 w-6 text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {format(date, 'EEEE، d MMMM yyyy', { locale: ar })}
                  </h3>
                  <p className={`text-sm ${status === 'overdue' ? 'text-red-400' : 'text-slate-400'}`}>
                    {status === 'today' ? 'مراجعات اليوم' : status === 'overdue' ? 'مراجعات متأخرة' : 'مراجعات مجدولة'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                لا توجد مراجعات في هذا اليوم
              </div>
            ) : (
              reviews.map((review, index) => {
                const subject = getSubjectInfo(review.lesson_id);
                
                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      p-4 rounded-xl border transition-all duration-300
                      ${review.is_completed
                        ? 'bg-green-950/30 border-green-500/30'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {subject && (
                          <div
                            className="w-2 h-16 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: subject.color }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <BookOpen className="h-4 w-4 text-slate-400" />
                            <span className="text-white font-medium">
                              {getLessonName(review.lesson_id)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm" style={{ color: subject?.color }}>
                              {subject?.label}
                            </span>
                            <Badge variant="outline" className="text-purple-400 border-purple-500/30 text-xs">
                              المراجعة #{review.review_number}
                            </Badge>
                          </div>
                          {review.memory_retention && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="text-xs text-slate-400">نسبة التذكر المتوقعة:</div>
                              <div className="text-xs text-indigo-400 font-medium">
                                {review.memory_retention}%
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {review.is_completed ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle2 className="h-3 w-3 ml-1" />
                            مكتمل
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleComplete(review.id)}
                            disabled={completing === review.id}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
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
                                <CheckCircle2 className="h-4 w-4 ml-1" />
                                تم
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Summary */}
          {reviews.length > 0 && (
            <div className="p-4 border-t border-indigo-500/20 bg-slate-900/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  إجمالي المراجعات: {reviews.length}
                </span>
                <span className="text-green-400">
                  المكتمل: {reviews.filter(r => r.is_completed).length}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DayDetailsDialog;
