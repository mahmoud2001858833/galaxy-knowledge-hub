import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  color,
  trend,
  trendValue,
  delay = 0
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-red-400';
    if (trend === 'down') return 'text-emerald-400';
    return 'text-gray-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl p-5 border border-${color}-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-${color}-500/40`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold text-${color}-400`}>
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
        {unit && <span className="text-gray-500 text-sm">{unit}</span>}
      </div>
    </motion.div>
  );
};

export default MetricCard;
