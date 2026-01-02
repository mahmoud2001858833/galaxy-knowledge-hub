import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Calendar, BookOpen, Brain, Target, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { SpacedReview, SpacedLesson, SpacedStats, SUBJECTS } from './types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ProgressAnalyticsProps {
  reviews: SpacedReview[];
  lessons: SpacedLesson[];
  stats: SpacedStats[];
  streak: number;
}

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ reviews, lessons, stats, streak }) => {
  // Calculate statistics
  const statistics = useMemo(() => {
    const totalLessons = lessons.length;
    const completedReviews = reviews.filter(r => r.is_completed).length;
    const totalReviews = reviews.length;
    const completionRate = totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0;
    
    // Average retention
    const avgRetention = reviews.length > 0
      ? Math.round(reviews.reduce((acc, r) => acc + (r.is_completed ? 95 : r.memory_retention), 0) / reviews.length)
      : 100;

    // Most productive day
    const dayStats: Record<string, number> = {};
    reviews.filter(r => r.completed_at).forEach(r => {
      const day = format(new Date(r.completed_at!), 'EEEE', { locale: ar });
      dayStats[day] = (dayStats[day] || 0) + 1;
    });
    const mostProductiveDay = Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    // Subjects needing reinforcement
    const subjectCompletion: Record<string, { completed: number; total: number }> = {};
    lessons.forEach(lesson => {
      const lessonReviews = reviews.filter(r => r.lesson_id === lesson.id);
      const completed = lessonReviews.filter(r => r.is_completed).length;
      if (!subjectCompletion[lesson.subject_name]) {
        subjectCompletion[lesson.subject_name] = { completed: 0, total: 0 };
      }
      subjectCompletion[lesson.subject_name].completed += completed;
      subjectCompletion[lesson.subject_name].total += lessonReviews.length;
    });

    const needsReinforcement = Object.entries(subjectCompletion)
      .filter(([_, data]) => data.total > 0 && (data.completed / data.total) < 0.5)
      .map(([subject, _]) => SUBJECTS.find(s => s.value === subject)?.label || subject);

    return {
      totalLessons,
      completedReviews,
      totalReviews,
      completionRate,
      avgRetention,
      mostProductiveDay,
      needsReinforcement,
    };
  }, [reviews, lessons]);

  // Data for subject pie chart
  const subjectData = useMemo(() => {
    const counts: Record<string, number> = {};
    lessons.forEach(lesson => {
      counts[lesson.subject_name] = (counts[lesson.subject_name] || 0) + 1;
    });
    return Object.entries(counts).map(([subject, count]) => ({
      name: SUBJECTS.find(s => s.value === subject)?.label || subject,
      value: count,
      color: SUBJECTS.find(s => s.value === subject)?.color || '#6b7280',
    }));
  }, [lessons]);

  // Weekly progress data
  const weeklyData = useMemo(() => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 6 }); // Saturday
    const end = endOfWeek(now, { weekStartsOn: 6 });
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const dayReviews = reviews.filter(r => {
        if (!r.completed_at) return false;
        const completedDate = new Date(r.completed_at);
        return format(completedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      return {
        day: format(day, 'EEEE', { locale: ar }),
        shortDay: format(day, 'EEE', { locale: ar }),
        completed: dayReviews.length,
      };
    });
  }, [reviews]);

  // Last 7 days trend
  const trendData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayReviews = reviews.filter(r => {
        if (!r.completed_at) return false;
        return format(new Date(r.completed_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      return {
        date: format(date, 'd/M'),
        reviews: dayReviews.length,
        retention: dayReviews.length > 0
          ? Math.round(dayReviews.reduce((acc, r) => acc + r.memory_retention, 0) / dayReviews.length)
          : 0,
      };
    });
  }, [reviews]);

  const statCards = [
    { icon: BookOpen, label: 'إجمالي الدروس', value: statistics.totalLessons, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { icon: Target, label: 'المراجعات المكتملة', value: `${statistics.completedReviews}/${statistics.totalReviews}`, color: 'text-green-400', bg: 'bg-green-500/20' },
    { icon: Brain, label: 'نسبة التذكر', value: `${statistics.avgRetention}%`, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { icon: Flame, label: 'أيام الالتزام', value: streak, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { icon: TrendingUp, label: 'نسبة الإنجاز', value: `${statistics.completionRate}%`, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    { icon: Calendar, label: 'أكثر يوم إنتاجية', value: statistics.mostProductiveDay, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50">
              <CardContent className="p-4 text-center">
                <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-2`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Progress Bar Chart */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-950/90 border-indigo-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              التقدم الأسبوعي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="shortDay" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4f46e5', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="completed" name="مراجعات مكتملة" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subject Distribution Pie Chart */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-950/90 border-indigo-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              توزيع المواد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: '#9ca3af' }}
                    >
                      {subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4f46e5', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  لا توجد بيانات
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Line Chart */}
      <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-950/90 border-indigo-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            اتجاه آخر 7 أيام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4f46e5', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="reviews" name="المراجعات" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                <Line type="monotone" dataKey="retention" name="نسبة التذكر" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Reinforcement Alert */}
      {statistics.needsReinforcement.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-950/50 to-orange-950/50 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <Award className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">مواد تحتاج تعزيز</h4>
                <p className="text-amber-400 text-sm">
                  {statistics.needsReinforcement.join('، ')} - نسبة إنجاز منخفضة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default ProgressAnalytics;
