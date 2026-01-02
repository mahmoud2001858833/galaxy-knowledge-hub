import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend, ReferenceLine, Scatter, ComposedChart } from 'recharts';
import { SpacedReview, REVIEW_INTERVALS } from './types';

interface ForgettingCurveChartProps {
  reviews: SpacedReview[];
}

const ForgettingCurveChart: React.FC<ForgettingCurveChartProps> = ({ reviews }) => {
  // Ebbinghaus forgetting curve: R = e^(-t/S)
  const forgettingCurve = (days: number, strength: number = 1) => {
    return Math.exp(-days / (strength * 10)) * 100;
  };

  // Retention with spaced repetition
  const retentionWithReview = (days: number, reviewCount: number) => {
    const strength = 1 + reviewCount * 0.5;
    const baseRetention = forgettingCurve(days, strength);
    return Math.min(baseRetention + reviewCount * 8, 100);
  };

  const chartData = useMemo(() => {
    const data = [];
    const totalDays = 50;

    for (let day = 0; day <= totalDays; day++) {
      // Count reviews completed before this day
      let reviewCount = 0;
      for (const interval of REVIEW_INTERVALS) {
        if (day >= interval) reviewCount++;
      }

      // Calculate base forgetting (without review)
      const withoutReview = forgettingCurve(day, 1);
      
      // Calculate retention with reviews
      const withReview = retentionWithReview(day, reviewCount);

      // Mark review points
      const isReviewDay = REVIEW_INTERVALS.includes(day);

      data.push({
        day,
        withoutReview: Math.max(withoutReview, 5),
        withReview: Math.min(withReview, 100),
        reviewPoint: isReviewDay ? withReview : null,
        label: `اليوم ${day}`,
      });
    }

    return data;
  }, []);

  const completedReviewsCount = reviews.filter(r => r.is_completed).length;
  const averageRetention = reviews.length > 0 
    ? Math.round(reviews.reduce((acc, r) => acc + (r.is_completed ? 95 : r.memory_retention), 0) / reviews.length)
    : 100;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-indigo-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {Math.round(entry.value)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-950/90 border-indigo-500/30 backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-b border-indigo-500/20 pb-4">
          <CardTitle className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Brain className="h-6 w-6 text-indigo-400" />
            </div>
            منحنى النسيان (Ebbinghaus Curve)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">مع المراجعة</span>
              </div>
              <p className="text-2xl font-bold text-white">{averageRetention}%</p>
              <p className="text-xs text-slate-400">نسبة التذكر</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">بدون مراجعة</span>
              </div>
              <p className="text-2xl font-bold text-white">~20%</p>
              <p className="text-xs text-slate-400">بعد 30 يوم</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Brain className="h-4 w-4" />
                <span className="text-sm">المراجعات</span>
              </div>
              <p className="text-2xl font-bold text-white">{completedReviewsCount}</p>
              <p className="text-xs text-slate-400">مراجعة مكتملة</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">التحسن</span>
              </div>
              <p className="text-2xl font-bold text-white">+{Math.max(averageRetention - 20, 0)}%</p>
              <p className="text-xs text-slate-400">مقارنة بالنسيان الطبيعي</p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="withReviewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="withoutReviewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="day" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  label={{ value: 'الأيام', position: 'bottom', fill: '#9ca3af' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  domain={[0, 100]}
                  label={{ value: 'نسبة التذكر %', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-slate-300">{value}</span>}
                />
                
                {/* Area for without review */}
                <Area
                  type="monotone"
                  dataKey="withoutReview"
                  name="بدون مراجعة"
                  stroke="#ef4444"
                  fill="url(#withoutReviewGradient)"
                  strokeWidth={2}
                />
                
                {/* Area for with review */}
                <Area
                  type="monotone"
                  dataKey="withReview"
                  name="مع المراجعة"
                  stroke="#22c55e"
                  fill="url(#withReviewGradient)"
                  strokeWidth={3}
                />

                {/* Review points */}
                <Scatter
                  dataKey="reviewPoint"
                  name="نقاط المراجعة"
                  fill="#8b5cf6"
                  shape={(props: any) => {
                    if (props.payload.reviewPoint === null) return null;
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={6}
                        fill="#8b5cf6"
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }}
                />

                {/* Reference lines for review days */}
                {REVIEW_INTERVALS.map((day) => (
                  <ReferenceLine
                    key={day}
                    x={day}
                    stroke="#8b5cf6"
                    strokeDasharray="5 5"
                    opacity={0.5}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Legend explanation */}
          <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <h4 className="text-white font-medium mb-3">📊 تفسير الرسم البياني:</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500 rounded" />
                <span className="text-slate-300">المنحنى الأحمر: النسيان الطبيعي بدون مراجعة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-green-500 rounded" />
                <span className="text-slate-300">المنحنى الأخضر: التذكر مع نظام المراجعة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded-full" />
                <span className="text-slate-300">النقاط البنفسجية: أوقات المراجعة المثالية</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ForgettingCurveChart;
