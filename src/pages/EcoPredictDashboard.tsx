import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Activity, Gauge, TrendingDown, Percent, Zap, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EcoInputForm, { ConsumptionData } from '@/components/eco-predict/EcoInputForm';
import MetricCard from '@/components/eco-predict/MetricCard';
import EmissionsTimeline from '@/components/eco-predict/EmissionsTimeline';
import CategoryPieChart from '@/components/eco-predict/CategoryPieChart';
import ScenarioComparison from '@/components/eco-predict/ScenarioComparison';
import RegionalBarChart from '@/components/eco-predict/RegionalBarChart';
import AIInsights from '@/components/eco-predict/AIInsights';
import GlobalComparisonChart from '@/components/eco/GlobalComparisonChart';
import WhatIfScenarios from '@/components/eco/WhatIfScenarios';
import AIRecommendationsPanel from '@/components/eco/AIRecommendationsPanel';
import MultiViewChart from '@/components/eco/MultiViewChart';
import { generateSustainabilityPdf, GLOBAL_CO2_BENCHMARKS } from '@/lib/sustainabilityPdf';

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
    householdSize: 4,
    homeArea: 150,
    flightsPerYear: 2,
    meatMealsPerWeek: 3,
    recyclingRate: 30,
    shoppingFrequency: 5,
    acHoursPerDay: 6,
  });
  const [location, setLocation] = useState('jordan');
  const [energySource, setEnergySource] = useState('grid');

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('eco-predict-ai', {
        body: { consumptionData, location, energySource },
      });

      if (error) throw error;

      setAnalysisResult(data);
      toast({ title: 'تم التحليل بنجاح', description: 'تم إنشاء تقرير التنبؤ البيئي الشامل' });
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

  const handleDownloadPdf = () => {
    if (!analysisResult) return;
    generateSustainabilityPdf(
      {
        title: 'AI Eco-Predict Report',
        subtitle: `Location: ${location} · Energy: ${energySource}`,
        headlineMetric: {
          label: 'Annual CO2 Emissions',
          value: `${analysisResult.currentEmissions.toFixed(2)} t CO2/yr`,
        },
        sections: [
          {
            title: 'Consumption Inputs',
            rows: [
              ['Electricity (kWh/mo)', consumptionData.electricity],
              ['Water (L/mo)', consumptionData.water],
              ['Car distance (km/mo)', consumptionData.transport],
              ['Flights / year', consumptionData.flightsPerYear],
              ['Waste (kg/mo)', consumptionData.waste],
              ['Recycling rate (%)', consumptionData.recyclingRate],
              ['Household size', consumptionData.householdSize],
              ['Home area (m2)', consumptionData.homeArea],
              ['Red meat meals / week', consumptionData.meatMealsPerWeek],
              ['Shopping frequency', consumptionData.shoppingFrequency],
              ['AC hours / day', consumptionData.acHoursPerDay],
              ['Fuel type', consumptionData.fuelType],
            ],
          },
          {
            title: 'Key Metrics',
            rows: [
              ['Avg monthly emission (t)', analysisResult.metrics.averageMonthlyEmission.toFixed(2)],
              ['Potential reduction (%)', analysisResult.metrics.potentialReduction.toFixed(1)],
              ['Sustainability score', `${analysisResult.metrics.sustainabilityScore}/100`],
              ['Monthly change rate (%)', analysisResult.metrics.monthlyChangeRate.toFixed(2)],
              ['Renewable potential (%)', analysisResult.renewableEnergyPotential.toFixed(0)],
            ],
          },
          {
            title: 'Category Breakdown (t CO2/yr)',
            rows: [
              ['Energy', analysisResult.categoryBreakdown.energy.toFixed(2)],
              ['Transport', analysisResult.categoryBreakdown.transport.toFixed(2)],
              ['Water', analysisResult.categoryBreakdown.water.toFixed(2)],
              ['Waste', analysisResult.categoryBreakdown.waste.toFixed(2)],
            ],
          },
          {
            title: 'Future Scenarios (t CO2)',
            rows: [
              ['Continuation - 1y', analysisResult.scenarios.continuation.year1.toFixed(2)],
              ['Continuation - 5y', analysisResult.scenarios.continuation.year5.toFixed(2)],
              ['Continuation - 10y', analysisResult.scenarios.continuation.year10.toFixed(2)],
              ['Improvement - 5y', analysisResult.scenarios.improvement.year5.toFixed(2)],
              ['Improvement - 10y', analysisResult.scenarios.improvement.year10.toFixed(2)],
              ['Degradation - 10y', analysisResult.scenarios.degradation.year10.toFixed(2)],
            ],
          },
        ],
        comparison: [
          { label: 'You', value: analysisResult.currentEmissions, unit: 't CO2/yr' },
          ...GLOBAL_CO2_BENCHMARKS,
        ],
        recommendations: analysisResult.recommendations,
        footer: `EcoPredict AI Report · Generated ${new Date().toLocaleString()}`,
      },
      `eco-predict-report-${Date.now()}.pdf`
    );
    toast({ title: 'تم تنزيل التقرير', description: 'تم إنشاء تقرير PDF شامل بنجاح' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 text-white" dir="rtl">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

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
          
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                أداة التنبؤ البيئي الذكية
              </h1>
              <p className="text-gray-400 text-sm">AI Eco-Predict · 12+ مدخلاً متقدماً</p>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          <div className="lg:col-span-2 space-y-6">
            {analysisResult ? (
              <>
                <div className="flex justify-end">
                  <Button
                    onClick={handleDownloadPdf}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25"
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل تقرير PDF شامل
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard title="الانبعاثات السنوية" value={analysisResult.currentEmissions} unit="طن CO₂" icon={Activity} color="emerald" delay={0.1} />
                  <MetricCard title="المتوسط الشهري" value={analysisResult.metrics.averageMonthlyEmission} unit="طن CO₂" icon={Gauge} color="blue" delay={0.2} />
                  <MetricCard title="إمكانية التخفيض" value={analysisResult.metrics.potentialReduction} unit="%" icon={TrendingDown} color="purple" trend="down" trendValue={`${analysisResult.metrics.potentialReduction}%`} delay={0.3} />
                  <MetricCard title="معدل التغير الشهري" value={analysisResult.metrics.monthlyChangeRate} unit="%" icon={Percent} color="amber" delay={0.4} />
                </div>

                {/* NEW: Global Benchmark Comparison */}
                <GlobalComparisonChart userValue={analysisResult.currentEmissions} unit="طن CO₂/سنة" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EmissionsTimeline data={analysisResult.monthlyPredictions} />
                  <CategoryPieChart data={analysisResult.categoryBreakdown} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ScenarioComparison scenarios={analysisResult.scenarios} />
                  <RegionalBarChart data={analysisResult.regionalComparison} />
                </div>

                <AIInsights
                  recommendations={analysisResult.recommendations}
                  renewableEnergyPotential={analysisResult.renewableEnergyPotential}
                  trendAnalysis={analysisResult.trendAnalysis}
                  sustainabilityScore={analysisResult.metrics.sustainabilityScore}
                />
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-96 bg-slate-900/50 rounded-3xl border border-slate-700/50">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6">
                  <Zap className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">أدخل بياناتك للبدء</h3>
                <p className="text-gray-500 text-center max-w-md">
                  املأ النموذج بـ 12+ مدخلاً (يدعم الإدخال الصوتي 🎤) للحصول على تحليل شامل ومقارنة عالمية وتقرير PDF
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
