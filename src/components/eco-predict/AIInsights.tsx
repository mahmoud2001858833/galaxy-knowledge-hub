import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, TrendingDown, Leaf, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AIInsightsProps {
  recommendations: string[];
  renewableEnergyPotential: number;
  trendAnalysis: string;
  sustainabilityScore: number;
}

const AIInsights: React.FC<AIInsightsProps> = ({
  recommendations,
  renewableEnergyPotential,
  trendAnalysis,
  sustainabilityScore
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'ممتاز';
    if (score >= 60) return 'جيد';
    if (score >= 40) return 'متوسط';
    return 'يحتاج تحسين';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-6 border border-indigo-500/20 shadow-2xl"
    >
      <h3 className="text-xl font-bold text-indigo-400 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <Brain className="w-5 h-5" />
        </div>
        رؤى الذكاء الاصطناعي
      </h3>

      {/* Sustainability Score */}
      <div className="mb-6 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300">مؤشر الاستدامة</span>
          <span className={`text-2xl font-bold ${getScoreColor(sustainabilityScore)}`}>
            {sustainabilityScore}/100
          </span>
        </div>
        <Progress value={sustainabilityScore} className="h-3 bg-slate-700" />
        <p className={`text-sm mt-2 ${getScoreColor(sustainabilityScore)}`}>
          التقييم: {getScoreLabel(sustainabilityScore)}
        </p>
      </div>

      {/* Renewable Energy Potential */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-2xl border border-emerald-500/20">
        <div className="flex items-center gap-3 mb-3">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-300 font-semibold">إمكانية الطاقة المتجددة</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Progress value={renewableEnergyPotential} className="h-3 bg-slate-700" />
          </div>
          <span className="text-emerald-400 font-bold text-xl">{renewableEnergyPotential}%</span>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="mb-6 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <TrendingDown className="w-5 h-5 text-blue-400" />
          <span className="text-blue-300 font-semibold">تحليل الاتجاهات</span>
        </div>
        <p className="text-gray-300 leading-relaxed">{trendAnalysis}</p>
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-300 font-semibold">توصيات التحسين</span>
        </div>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-yellow-500/30 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-400 text-xs font-bold">{index + 1}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{rec}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AIInsights;
