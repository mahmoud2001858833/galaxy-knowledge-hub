import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Globe } from 'lucide-react';

interface RegionalData {
  region: string;
  emissions: number;
}

interface RegionalBarChartProps {
  data: RegionalData[];
}

const RegionalBarChart: React.FC<RegionalBarChartProps> = ({ data }) => {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-6 border border-teal-500/20 shadow-2xl"
    >
      <h3 className="text-xl font-bold text-teal-400 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
          <Globe className="w-5 h-5" />
        </div>
        مقارنة الانبعاثات حسب المنطقة
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number" 
              stroke="#9ca3af" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(1)}`}
            />
            <YAxis 
              type="category" 
              dataKey="region" 
              stroke="#9ca3af" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                borderRadius: '12px',
                color: '#fff'
              }}
              formatter={(value: number) => [`${value.toFixed(2)} طن CO₂/سنة`, 'الانبعاثات']}
            />
            <Bar dataKey="emissions" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default RegionalBarChart;
