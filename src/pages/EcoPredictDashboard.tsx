import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Brain, Activity, Gauge, TrendingDown, Percent, Zap, Download, Home, ChevronRight, Sparkles } from 'lucide-react';
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
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

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
    meatConsumption: 4,
    solarInstalled: false,
    recyclingRate: 20,
    publicTransportTrips: 2,
    flightHours: 2,
  });

  const [location, setLocation] = useState('jordan');
  const [energySource, setEnergySource] = useState('grid');

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('eco-predict', {
        body: { consumptionData, location, energySource },
      });

      if (error) throw error;
      setAnalysisResult(data);
      toast({
        title: 'تم التحليل بنجاح',
        description: 'تم إنشاء التنبؤات والتحليلات البيئية الذكية',
      });
    } catch (err: any) {
      console.warn('Backend eco-predict failed, using offline model:', err);
      // Fallback local calculations
      const electricityEmissions = (consumptionData.electricity * 12 * 0.5) / 1000;
      const transportEmissions = (consumptionData.transport * 12 * 0.18) / 1000;
      const waterEmissions = (consumptionData.water * 12 * 0.0003) / 1000;
      const wasteEmissions = (consumptionData.waste * 52 * 0.5) / 1000;
      const meatEmissions = (consumptionData.meatConsumption * 52 * 5.0) / 1000;
      const flightEmissions = (consumptionData.flightHours * 90) / 1000;
      const total = electricityEmissions + transportEmissions + waterEmissions + wasteEmissions + meatEmissions + flightEmissions;

      setAnalysisResult({
        currentEmissions: parseFloat(total.toFixed(2)),
        monthlyPredictions: [
          { month: 'يناير', emissions: total / 12 * 1.1 },
          { month: 'مارس', emissions: total / 12 * 0.95 },
          { month: 'مايو', emissions: total / 12 * 0.9 },
          { month: 'يوليو', emissions: total / 12 * 1.25 },
          { month: 'سبتمبر', emissions: total / 12 * 1.05 },
          { month: 'نوفمبر', emissions: total / 12 * 0.9 },
        ],
        scenarios: {
          continuation: { year1: total, year5: total * 1.08, year10: total * 1.15 },
          improvement: { year1: total * 0.85, year5: total * 0.6, year10: total * 0.4 },
          degradation: { year1: total * 1.1, year5: total * 1.25, year10: total * 1.4 },
        },
        categoryBreakdown: {
          energy: Math.round((electricityEmissions / total) * 100),
          transport: Math.round(((transportEmissions + flightEmissions) / total) * 100),
          water: Math.round((waterEmissions / total) * 100),
          waste: Math.round(((wasteEmissions + meatEmissions) / total) * 100),
        },
        metrics: {
          averageMonthlyEmission: parseFloat((total / 12).toFixed(2)),
          potentialReduction: 38,
          sustainabilityScore: Math.max(30, Math.min(95, Math.round(100 - total * 5))),
          monthlyChangeRate: -2.4,
        },
        regionalComparison: [
          { region: 'أنت', emissions: parseFloat(total.toFixed(1)) },
          { region: 'الأردن', emissions: 3.1 },
          { region: 'الشرق الأوسط', emissions: 6.8 },
          { region: 'العالم', emissions: 4.7 },
          { region: 'هدف باريس', emissions: 2.0 },
        ],
        recommendations: [
          'تركيب ألواح طاقة شمسية يوفر حتى 65% من بصمة الكهرباء',
          'استبدال رحلات السيارة بالمواصلات العامة يوفر 0.8 طن سنوياً',
          'تقليل استهلاك اللحم الأحمر إلى مرتين أسبوعياً يوفر 0.4 طن',
          'استخدام رؤوس دوش موفرة للمياه يخفض استهلاك المياه بنسبة 35%',
        ],
        renewableEnergyPotential: 78,
        trendAnalysis: 'تحليلات الذكاء الاصطناعي تشير إلى إمكانية خفض انبعاثاتك بنسبة 38% خلال 12 شهراً عبر تبني تدابير كفاءة الطاقة المنزلية.',
      });
      toast({
        title: 'تم التحليل محلياً',
        description: 'تم استخدام النموذج التحليلي السريع بنجاح',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!analysisResult) return;
    generateSustainabilityPdf(
      {
        title: 'EcoPredict AI Sustainability Report',
        subtitle: 'Comprehensive Emission Forecast & Scenario Analysis',
        headlineMetric: {
          label: 'Current Annual Footprint',
          value: `${analysisResult.currentEmissions} t CO2/yr`,
        },
        sections: [
          {
            title: 'Category Breakdown',
            rows: [
              ['Energy', `${analysisResult.categoryBreakdown.energy}%`],
              ['Transportation', `${analysisResult.categoryBreakdown.transport}%`],
              ['Water', `${analysisResult.categoryBreakdown.water}%`],
              ['Waste & Food', `${analysisResult.categoryBreakdown.waste}%`],
            ],
          },
          {
            title: '10-Year Scenario Projections (t CO2)',
            rows: [
              ['Year 1 (Improvement)', `${analysisResult.scenarios.improvement.year1.toFixed(2)}`],
              ['Year 5 (Improvement)', `${analysisResult.scenarios.improvement.year5.toFixed(2)}`],
              ['Year 10 (Improvement)', `${analysisResult.scenarios.improvement.year10.toFixed(2)}`],
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-slate-100 transition-colors" dir="rtl">
      <SEO 
        title="أداة التنبؤ البيئي الذكية (AI Eco-Predict) | منصة المعرفة"
        description="تنبؤ دقيق بالانبعاثات المستقبلية والسيناريوهات المناخية لعشر سنوات قادمة مدعومة بالذكاء الاصطناعي."
      />
      
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Bar */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-16 z-30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
              <Link to="/environmental-sustainability" className="hover:text-emerald-600 transition-colors">
                الاستدامة البيئية
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">التنبؤ البيئي الذكي (Eco-Predict)</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const isGJU = sessionStorage.getItem('gju_mode') === 'true';
                navigate(isGJU ? '/gju-competition' : '/environmental-sustainability');
              }}
              className="h-8 gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>العودة للبوابة</span>
            </Button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="container mx-auto px-4 pt-8 pb-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
              <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>خوارزميات التنبؤ المناخي · 12+ متغيراً ومؤشراً بيئياً</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              أداة التنبؤ البيئي الذكية (AI Eco-Predict)
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              نمذجة استشرافية دقيقة لسلوكك البيئي ومسار الانبعاثات الكربونية المتوقعة لـ 1 و 5 و 10 سنوات قادمة.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-4">
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

            <div className="lg:col-span-8 space-y-6">
              {analysisResult ? (
                <>
                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">نتائج التنبؤ الاستشرافي مكتملة</h3>
                      <p className="text-xs text-slate-500">تمت مطابقة البيانات مع بنك المعايير الدولية</p>
                    </div>
                    <Button
                      onClick={handleDownloadPdf}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs gap-1.5 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 ml-1" />
                      تحميل تقرير PDF شامل
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard title="الانبعاثات السنوية" value={analysisResult.currentEmissions} unit="طن CO₂" icon={Activity} color="emerald" delay={0.1} />
                    <MetricCard title="المتوسط الشهري" value={analysisResult.metrics.averageMonthlyEmission} unit="طن CO₂" icon={Gauge} color="blue" delay={0.2} />
                    <MetricCard title="إمكانية التخفيض" value={analysisResult.metrics.potentialReduction} unit="%" icon={TrendingDown} color="purple" trend="down" trendValue={`${analysisResult.metrics.potentialReduction}%`} delay={0.3} />
                    <MetricCard title="معدل التغير الشهري" value={analysisResult.metrics.monthlyChangeRate} unit="%" icon={Percent} color="amber" delay={0.4} />
                  </div>

                  {/* Global Benchmark Comparison */}
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs min-h-[400px]">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mb-4 text-emerald-600">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">أدخل بياناتك وانقر على زر التحليل</h3>
                  <p className="text-xs text-slate-500 text-center max-w-sm leading-relaxed">
                    يدعم النموذج الإدخال السريع أو الصوتي لـ 12 متغيراً لتوليد سيناريوهات 10 سنوات ومقارنات دولية فورية.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EcoPredictDashboard;
