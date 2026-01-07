import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpacedReview, SpacedLesson, SUBJECTS } from './types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  isBefore, 
  startOfDay,
  addMonths,
  subMonths,
  getDay
} from 'date-fns';
import { ar } from 'date-fns/locale';
import DayDetailsDialog from './DayDetailsDialog';

interface CalendarScheduleViewProps {
  reviews: SpacedReview[];
  lessons: SpacedLesson[];
  onComplete: (reviewId: string) => Promise<boolean>;
}

const CalendarScheduleView: React.FC<CalendarScheduleViewProps> = ({ 
  reviews, 
  lessons, 
  onComplete 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekDays = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  // الشهر الثاني
  const secondMonth = addMonths(currentMonth, 1);

  const getCalendarDays = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const firstDayOfWeek = getDay(start);
    const paddingDays = Array(firstDayOfWeek).fill(null);
    return [...paddingDays, ...days];
  };

  const calendarDaysFirst = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
  const calendarDaysSecond = useMemo(() => getCalendarDays(secondMonth), [secondMonth]);

  const getReviewsForDay = (date: Date) => {
    return reviews.filter(r => isSameDay(new Date(r.scheduled_date), date));
  };

  const getDayStatus = (date: Date) => {
    const dayReviews = getReviewsForDay(date);
    if (dayReviews.length === 0) return null;

    const today = startOfDay(new Date());
    const dayDate = startOfDay(date);
    const completedCount = dayReviews.filter(r => r.is_completed).length;
    const totalCount = dayReviews.length;

    if (completedCount === totalCount) return 'completed';
    if (isSameDay(dayDate, today)) return 'today';
    if (isBefore(dayDate, today)) return 'overdue';
    return 'upcoming';
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed': return 'bg-green-500/30 border-green-500/50 text-green-400';
      case 'today': return 'bg-amber-500/30 border-amber-500/50 text-amber-400';
      case 'overdue': return 'bg-red-500/30 border-red-500/50 text-red-400';
      case 'upcoming': return 'bg-blue-500/30 border-blue-500/50 text-blue-400';
      default: return 'bg-slate-800/50 border-slate-700/50 text-slate-500';
    }
  };

  const getStatusEmoji = (status: string | null) => {
    switch (status) {
      case 'completed': return '✅';
      case 'today': return '🟠';
      case 'overdue': return '🔴';
      case 'upcoming': return '🔵';
      default: return '';
    }
  };

  const selectedDayReviews = selectedDate ? getReviewsForDay(selectedDate) : [];

  const renderCalendarGrid = (days: (Date | null)[], monthDate: Date) => (
    <div className="flex-1">
      {/* عنوان الشهر */}
      <div className="text-center mb-3">
        <span className="text-white font-medium text-lg">
          {format(monthDate, 'MMMM yyyy', { locale: ar })}
        </span>
      </div>

      {/* أيام الأسبوع */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={`${monthDate.toISOString()}-${day}`} className="text-center text-slate-400 text-xs py-1 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* شبكة التقويم */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${monthDate.toISOString()}-${index}`} className="aspect-square" />;
          }

          const status = getDayStatus(day);
          const dayReviews = getReviewsForDay(day);
          const statusColor = getStatusColor(status);
          const isCurrentDay = isToday(day);

          return (
            <motion.button
              key={day.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.005 }}
              onClick={() => dayReviews.length > 0 && setSelectedDate(day)}
              disabled={dayReviews.length === 0}
              className={`
                aspect-square p-0.5 rounded-lg border transition-all duration-200
                ${statusColor}
                ${dayReviews.length > 0 ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'cursor-default'}
                ${isCurrentDay ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900' : ''}
              `}
            >
              <div className="h-full flex flex-col items-center justify-center gap-0.5">
                <span className={`text-xs font-medium ${isCurrentDay ? 'text-amber-400' : ''}`}>
                  {format(day, 'd')}
                </span>
                {dayReviews.length > 0 && (
                  <div className="flex items-center gap-0.5">
                    <span className="text-[8px]">{getStatusEmoji(status)}</span>
                    <span className="text-[8px]">{dayReviews.length}</span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-950/90 border-indigo-500/30 backdrop-blur-xl">
        <CardHeader className="border-b border-indigo-500/20 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Calendar className="h-6 w-6 text-indigo-400" />
              </div>
              التقويم التفاعلي
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <span className="text-white font-medium text-sm">
                تنقل
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* عرض شهرين جنباً إلى جنب */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCalendarGrid(calendarDaysFirst, currentMonth)}
            {renderCalendarGrid(calendarDaysSecond, secondMonth)}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm border-t border-indigo-500/20 pt-4">
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span className="text-green-400">مكتملة</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🟠</span>
              <span className="text-amber-400">اليوم</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔴</span>
              <span className="text-red-400">متأخرة</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔵</span>
              <span className="text-blue-400">قادمة</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details Dialog */}
      <DayDetailsDialog
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        reviews={selectedDayReviews}
        lessons={lessons}
        onComplete={onComplete}
      />
    </>
  );
};

export default CalendarScheduleView;
