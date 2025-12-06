import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GitBranch } from 'lucide-react';

interface Scenarios {
  continuation: { year1: number; year5: number; year10: number };
  improvement: { year1: number; year5: number; year10: number };
  degradation: { year1: number; year5: number; year10: number };
}

interface ScenarioComparisonProps {
  scenarios: Scenarios;
}

const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({ scenarios }) => {
  const chartData = [
    {
      period: 'السنة الأولى',
      استمرار: scenarios.continuation.year1,
      تحسين: scenarios.improvement.year1,
      تدهور: scenarios.degradation.year1,
    },
    {
      period: 'بعد 5 سنوات',
      استمرار: scenarios.continuation.year5,
      تحسين: scenarios.improvement.year5,
      تدهور: scenarios.degradation.year5,
    },
    {
      period: 'بعد 10 سنوات',
      استمرار: scenarios.continuation.year10,
      تحسين: scenarios.improvement.year10,
      تدهور: scenarios.degradation.year10,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-6 border border-amber-500/20 shadow-2xl"
    >
      <h3 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <GitBranch className="w-5 h-5" />
        </div>
        مقارنة السيناريوهات المستقبلية
      </h3>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-500/20 rounded-xl p-3 text-center">
          <div className="w-4 h-4 bg-gray-400 rounded-full mx-auto mb-2"></div>
          <span className="text-gray-300 text-sm">سيناريو الاستمرار</span>
        </div>
        <div className="bg-emerald-500/20 rounded-xl p-3 text-center">
          <div className="w-4 h-4 bg-emerald-400 rounded-full mx-auto mb-2"></div>
          <span className="text-emerald-300 text-sm">سيناريو التحسين</span>
        </div>
        <div className="bg-red-500/20 rounded-xl p-3 text-center">
          <div className="w-4 h-4 bg-red-400 rounded-full mx-auto mb-2"></div>
          <span className="text-red-300 text-sm">سيناريو التدهور</span>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="period" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(1)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                color: '#fff'
              }}
              formatter={(value: number) => [`${value.toFixed(2)} طن CO₂`, '']}
            />
            <Bar dataKey="استمرار" fill="#9ca3af" radius={[4, 4, 0, 0]} />
            <Bar dataKey="تحسين" fill="#34d399" radius={[4, 4, 0, 0]} />
            <Bar dataKey="تدهور" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default ScenarioComparison;
