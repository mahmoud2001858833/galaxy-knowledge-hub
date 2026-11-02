import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Gauge, TrendingDown, Percent, Zap, Download } from 'lucide-react';
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
import { generateSustainabilityPdf, GLOBAL_CO2_BENCHMARKS } from '@/lib/sustainabilityPdf';
import { PageShell, PageHeader } from '@/components/layout/PageShell';
import { SEO } from '@/components/SEO';

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
      console.error('Error analyzing:', error);
      toast({
        title: 'خطأ في التحليل',
        description: 'حدث خطأ أثناء معالجة البيانات، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!analysisResult) return;
    const recs = analysisResult.recommendations || [];
    generateSustainabilityPdf(
      {
        title: 'تقرير التنبؤ البيئي بالذكاء الاصطناعي',
        subtitle: `الموقع: ${location} · مصدر الطاقة: ${energySource}`,
        headlineMetric: {
          label: 'الانبعاثات السنوية التقديرية',
          value: `${analysisResult.currentEmissions} طن CO₂`,
        },
        sections: [
          {
            title: 'المؤشرات الرئيسية',
            rows: [
              ['المتوسط الشهري', `${analysisResult.metrics.averageMonthlyEmission} طن`],
              ['إمكانية التخفيض', `${analysisResult.metrics.potentialReduction}%`],
              ['معدل التغير الشهري', `${analysisResult.metrics.monthlyChangeRate}%`],
              ['درجة الاستدامة', `${analysisResult.metrics.sustainabilityScore}/100`],
            ],
          },
          {
            title: 'توزيع الانبعاثات حسب الفئة',
            rows: [
              ['الطاقة', `${analysisResult.categoryBreakdown.energy} طن`],
              ['المواصلات', `${analysisResult.categoryBreakdown.transport} طن`],
              ['المياه', `${analysisResult.categoryBreakdown.water} طن`],
              ['النفايات', `${analysisResult.categoryBreakdown.waste} طن`],
            ],
          },
          {
            title: 'سيناريوهات المستقبل (5 سنوات)',
            rows: [
              ['الاستمرار بنفس النمط', `${analysisResult.scenarios.continuation.year5} طن`],
              ['مع خطة التحسين', `${analysisResult.scenarios.improvement.year5} طن`],
              ['في حالة التدهور', `${analysisResult.scenarios.degradation.year5} طن`],
            ],
          },
        ],
        comparison: GLOBAL_CO2_BENCHMARKS.map((b) => ({
          label: b.label,
          value: b.value === 0 ? analysisResult.currentEmissions : b.value,
          unit: 'طن/سنة',
        })),
        recommendations: recs,
        footer: `ذروة العلم - أداة التنبؤ البيئي الذكية · ${new Date().toLocaleDateString('ar-JO')}`,
      },
      `eco-predict-report-${Date.now()}.pdf`
    );
    toast({ title: 'تم تنزيل التقرير', description: 'تم إنشاء تقرير PDF شامل بنجاح' });
  };

  return (
    <PageShell>
      <SEO 
        title="أداة التنبؤ البيئي الذكية | ذروة العلم"
        description="تحليل متقدم لبيانات استهلاكك وتوقع البصمة الكربونية المستقبلية باستخدام الذكاء الاصطناعي."
      />

      <PageHeader
        title="أداة التنبؤ البيئي الذكية"
        description="نموذج ذكاء اصطناعي يحلل بيانات استهلاك الطاقة والمياه والمواصلات، ويتنبأ بمسار انبعاثاتك مع سيناريوهات للتحسين."
        icon={Brain}
        crumbs={[
          { label: 'الرئيسية', to: '/' },
          { label: 'المجتمع المدرسي', to: '/school' },
          { label: 'الاستدامة البيئية', to: '/environmental-sustainability' },
          { label: 'أداة التنبؤ البيئي' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form column */}
        <div className="lg:col-span-5">
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

        {/* Results column */}
        <div className="lg:col-span-7 space-y-6">
          {analysisResult ? (
            <>
              <div className="flex justify-end">
                <Button
                  onClick={handleDownloadPdf}
                  className="rounded-2xl font-bold"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل تقرير PDF شامل
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center p-12 bg-card rounded-3xl border border-dashed border-border text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center mb-2">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">أدخل بياناتك لبدء التحليل</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                املأ النموذج في الجانب المقابل (يدعم الإدخال الصوتي 🎤) للحصول على تقرير تنبؤ شامل ومقارنة عالمية وسيناريوهات تحسين.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default EcoPredictDashboard;
