import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Activity, Gauge, TrendingDown, Percent, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EcoInputForm from '@/components/eco-predict/EcoInputForm';
import MetricCard from '@/components/eco-predict/MetricCard';
import EmissionsTimeline from '@/components/eco-predict/EmissionsTimeline';
import CategoryPieChart from '@/components/eco-predict/CategoryPieChart';
import ScenarioComparison from '@/components/eco-predict/ScenarioComparison';
import RegionalBarChart from '@/components/eco-predict/RegionalBarChart';
import AIInsights from '@/components/eco-predict/AIInsights';

interface ConsumptionData {
  electricity: number;
  water: number;
  transport: number;
  fuelType: string;
  waste: number;
}

interface AnalysisResult {
  currentEmissions: number;
  monthlyPredictions: Array<{ month: string; emissions: number }>;
  scenarios: {
    continuation: { year1: number; year5: number; year10: number };
    improvement: { year1: number; year5: number; year10: number };
    degradation: { year1: number; year5: number; year10: number };
  };
  categoryBreakdown: {
    energy: number;
    transport: number;
    water: number;
    waste: number;
  };
  metrics: {
    averageMonthlyEmission: number;
    potentialReduction: number;
    sustainabilityScore: number;
    monthlyChangeRate: number;
  };
  regionalComparison: Array<{ region: string; emissions: number }>;
  recommendations: string[];
  renewableEnergyPotential: number;
  trendAnalysis: string;
}

const EcoPredictDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const [consumptionData, setConsumptionData] = useState<ConsumptionData>({
    electricity: 500,
    water: 15000,
    transport: 1000,
    fuelType: 'gasoline',
    waste: 50,
  });
  const [location, setLocation] = useState('jordan');
  const [energySource, setEnergySource] = useState('grid');

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('eco-predict-ai', {
        body: {
          consumptionData,
          location,
          energySource,
        },
      });

      if (error) throw error;

      setAnalysisResult(data);
      toast({
        title: 'تم التحليل بنجاح',
        description: 'تم إنشاء تقرير التنبؤ البيئي الشامل',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'خطأ في التحليل',
        description: 'حدث خطأ أثناء تحليل البيانات. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 text-white" dir="rtl">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              const isGJU = sessionStorage.getItem('gju_mode') === 'true';
              navigate(isGJU ? '/gju-competition' : '/environmental-sustainability');
            }}
            className="text-gray-300 hover:text-white hover:bg-white/10"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            العودة
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                أداة التنبؤ البيئي الذكية
              </h1>
              <p className="text-gray-400 text-sm">AI Eco-Predict</p>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <EcoInputForm
              consumptionData={consumptionData}
              setConsumptionData={setConsumptionData}
              location={location}
              setLocation={setLocation}
              energySource={energySource}
              setEnergySource={setEnergySource}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {analysisResult ? (
              <>
                {/* Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    title="الانبعاثات السنوية"
                    value={analysisResult.currentEmissions}
                    unit="طن CO₂"
                    icon={Activity}
                    color="emerald"
                    delay={0.1}
                  />
                  <MetricCard
                    title="المتوسط الشهري"
                    value={analysisResult.metrics.averageMonthlyEmission}
                    unit="طن CO₂"
                    icon={Gauge}
                    color="blue"
                    delay={0.2}
                  />
                  <MetricCard
                    title="إمكانية التخفيض"
                    value={analysisResult.metrics.potentialReduction}
                    unit="%"
                    icon={TrendingDown}
                    color="purple"
                    trend="down"
                    trendValue={`${analysisResult.metrics.potentialReduction}%`}
                    delay={0.3}
                  />
                  <MetricCard
                    title="معدل التغير الشهري"
                    value={analysisResult.metrics.monthlyChangeRate}
                    unit="%"
                    icon={Percent}
                    color="amber"
                    delay={0.4}
                  />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EmissionsTimeline data={analysisResult.monthlyPredictions} />
                  <CategoryPieChart data={analysisResult.categoryBreakdown} />
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ScenarioComparison scenarios={analysisResult.scenarios} />
                  <RegionalBarChart data={analysisResult.regionalComparison} />
                </div>

                {/* AI Insights */}
                <AIInsights
                  recommendations={analysisResult.recommendations}
                  renewableEnergyPotential={analysisResult.renewableEnergyPotential}
                  trendAnalysis={analysisResult.trendAnalysis}
                  sustainabilityScore={analysisResult.metrics.sustainabilityScore}
                />
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-96 bg-slate-900/50 rounded-3xl border border-slate-700/50"
              >
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6">
                  <Zap className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">أدخل بياناتك للبدء</h3>
                <p className="text-gray-500 text-center max-w-md">
                  قم بإدخال بيانات استهلاكك للطاقة والمياه والنقل والنفايات للحصول على تحليل شامل وتوقعات بيئية مستقبلية
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EcoPredictDashboard;
