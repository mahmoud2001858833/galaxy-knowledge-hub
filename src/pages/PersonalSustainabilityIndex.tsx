import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart as BarChartIcon, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  Download, 
  RefreshCcw,
  Sparkles,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VoiceNumberInput from '@/components/eco/VoiceNumberInput';
import GlobalComparisonChart from '@/components/eco/GlobalComparisonChart';
import MultiViewChart from '@/components/eco/MultiViewChart';
import WhatIfScenarios from '@/components/eco/WhatIfScenarios';
import AIRecommendationsPanel from '@/components/eco/AIRecommendationsPanel';
import { generateSustainabilityPdf } from '@/lib/sustainabilityPdf';
import { PageShell, PageHeader } from '@/components/layout/PageShell';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell 
} from 'recharts';

interface Question {
  id: number;
  category: string;
  text: string;
  type: 'frequency' | 'yesno' | 'choice' | 'number';
  options?: string[];
  unit?: string;
}

const PersonalSustainabilityIndex: React.FC = () => {
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [numericValue, setNumericValue] = useState<number>(0);

  const questions: Question[] = useMemo(() => [
    // === Transportation (5) ===
    { id: 0, category: 'Transportation', text: 'كيف تذهب إلى المدرسة/العمل عادة؟', type: 'choice', options: ['المشي', 'الدراجة', 'الحافلة العامة', 'السيارة', 'التاكسي', 'الدراجة النارية'] },
    { id: 1, category: 'Transportation', text: 'كم كيلومتر تسافر بالسيارة أسبوعياً؟', type: 'number', unit: 'كم' },
    { id: 2, category: 'Transportation', text: 'كم رحلة طيران تقوم بها سنوياً؟', type: 'choice', options: ['0', '1-2', '3-5', '6+'] },
    { id: 3, category: 'Transportation', text: 'هل تستخدم المواصلات العامة بدلاً من السيارة؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 4, category: 'Transportation', text: 'هل تشارك السيارة مع آخرين (carpooling)؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },

    // === Energy (6) ===
    { id: 5, category: 'Energy', text: 'هل تطفئ الأنوار عند مغادرة الغرفة؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 6, category: 'Energy', text: 'هل تفصل الشواحن والأجهزة عند عدم الاستخدام؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 7, category: 'Energy', text: 'ما نسبة المصابيح الموفرة (LED) في منزلك؟', type: 'choice', options: ['0%', '25%', '50%', '75%', '100%'] },
    { id: 8, category: 'Energy', text: 'كم ساعة تشغّل التكييف يومياً صيفاً؟', type: 'number', unit: 'ساعة' },
    { id: 9, category: 'Energy', text: 'كم استهلاك الكهرباء الشهري في منزلك؟', type: 'number', unit: 'ك.و.س' },
    { id: 10, category: 'Energy', text: 'هل تستخدم طاقة متجددة (شمسية)؟', type: 'choice', options: ['لا', 'جزئياً', 'كلياً'] },

    // === Food (5) ===
    { id: 11, category: 'Food', text: 'كم وجبة تحتوي على لحم أحمر أسبوعياً؟', type: 'number', unit: 'وجبة' },
    { id: 12, category: 'Food', text: 'كم وجبة نباتية تتناول أسبوعياً؟', type: 'number', unit: 'وجبة' },
    { id: 13, category: 'Food', text: 'هل تحاول تجنب هدر الطعام؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 14, category: 'Food', text: 'هل تشتري منتجات محلية وموسمية؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 15, category: 'Food', text: 'كم مرة تطلب وجبات جاهزة (تغليف بلاستيكي)؟', type: 'number', unit: 'مرة/أسبوع' },

    // === Waste (4) ===
    { id: 16, category: 'Waste', text: 'هل تفصل النفايات في المنزل؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 17, category: 'Waste', text: 'هل تحوّل بقايا الطعام إلى سماد طبيعي؟', type: 'yesno', options: ['نعم', 'لا'] },
    { id: 18, category: 'Waste', text: 'كم كيس بلاستيكي تستخدم أسبوعياً؟', type: 'number', unit: 'كيس' },
    { id: 19, category: 'Waste', text: 'هل تحمل كيس تسوق قابل لإعادة الاستخدام؟', type: 'yesno', options: ['نعم', 'لا'] },

    // === Water (4) ===
    { id: 20, category: 'Water', text: 'كم دقيقة تستحم في المرة الواحدة؟', type: 'number', unit: 'دقيقة' },
    { id: 21, category: 'Water', text: 'هل تغلق الصنبور أثناء تنظيف الأسنان؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 22, category: 'Water', text: 'هل لديك نباتات أو تزرع أشجاراً؟', type: 'yesno', options: ['نعم', 'لا'] },
    { id: 23, category: 'Water', text: 'هل تجمع مياه الأمطار للسقي؟', type: 'yesno', options: ['نعم', 'لا'] },

    // === Consumption (3) ===
    { id: 24, category: 'Consumption', text: 'كم مرة تشتري ملابس جديدة سنوياً؟', type: 'choice', options: ['0-5', '6-10', '11-20', '21-30', '30+'] },
    { id: 25, category: 'Consumption', text: 'هل تصلح الأشياء بدلاً من استبدالها؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 26, category: 'Consumption', text: 'هل تشتري سلعاً مستعملة (second-hand)؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },

    // === Habits (3) ===
    { id: 27, category: 'Habits', text: 'هل تستخدم زجاجة ماء بلاستيكية يومياً؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 28, category: 'Habits', text: 'هل تشارك في تنظيف بيئتك المحلية؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 29, category: 'Habits', text: 'هل تنشر الوعي البيئي بين معارفك؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
  ], []);

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
    setNumericValue(0);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults({ ...answers, [currentQuestion]: value });
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = (finalAnswers: Record<number, any>) => {
    let score = 0;
    const categoryTotals: Record<string, { earned: number; possible: number }> = {
      Transportation: { earned: 0, possible: 25 },
      Energy: { earned: 0, possible: 30 },
      Food: { earned: 0, possible: 25 },
      Waste: { earned: 0, possible: 20 },
      Water: { earned: 0, possible: 20 },
      Consumption: { earned: 0, possible: 15 },
      Habits: { earned: 0, possible: 15 },
    };

    questions.forEach((q) => {
      const ans = finalAnswers[q.id];
      let pts = 0;

      if (q.type === 'frequency') {
        const map: Record<string, number> = { 'أبداً': 1, 'نادراً': 2, 'أحياناً': 3, 'غالباً': 4, 'دائماً': 5 };
        pts = map[ans] || 3;
        if (q.id === 27) pts = 6 - pts;
      } else if (q.type === 'yesno') {
        pts = ans === 'نعم' ? 5 : 1;
      } else if (q.type === 'choice') {
        if (q.id === 0) {
          const map: Record<string, number> = { 'المشي': 5, 'الدراجة': 5, 'الحافلة العامة': 4, 'السيارة': 1, 'التاكسي': 2, 'الدراجة النارية': 2 };
          pts = map[ans] || 3;
        } else if (q.id === 2) {
          const map: Record<string, number> = { '0': 5, '1-2': 3, '3-5': 2, '6+': 1 };
          pts = map[ans] || 3;
        } else if (q.id === 7) {
          const map: Record<string, number> = { '0%': 1, '25%': 2, '50%': 3, '75%': 4, '100%': 5 };
          pts = map[ans] || 3;
        } else if (q.id === 10) {
          pts = ans === 'كلياً' ? 5 : ans === 'جزئياً' ? 3 : 1;
        } else if (q.id === 24) {
          const map: Record<string, number> = { '0-5': 5, '6-10': 4, '11-20': 3, '21-30': 2, '30+': 1 };
          pts = map[ans] || 3;
        }
      } else if (q.type === 'number') {
        const val = Number(ans) || 0;
        if (q.id === 1) pts = val < 50 ? 5 : val < 150 ? 3 : 1;
        else if (q.id === 8) pts = val < 2 ? 5 : val < 6 ? 3 : 1;
        else if (q.id === 9) pts = val < 200 ? 5 : val < 500 ? 3 : 1;
        else if (q.id === 11) pts = val < 2 ? 5 : val < 5 ? 3 : 1;
        else if (q.id === 12) pts = val > 5 ? 5 : val > 2 ? 3 : 1;
        else if (q.id === 15) pts = val < 1 ? 5 : val < 3 ? 3 : 1;
        else if (q.id === 18) pts = val < 2 ? 5 : val < 5 ? 3 : 1;
        else if (q.id === 20) pts = val < 5 ? 5 : val < 10 ? 3 : 1;
      }

      categoryTotals[q.category].earned += pts;
      score += pts;
    });

    const totalPossible = Object.values(categoryTotals).reduce((sum, c) => sum + c.possible, 0);
    const overallPercentage = Math.round((score / totalPossible) * 100);

    const categoryScores = [
      { category: 'المواصلات', score: Math.round((categoryTotals.Transportation.earned / categoryTotals.Transportation.possible) * 100) },
      { category: 'الطاقة', score: Math.round((categoryTotals.Energy.earned / categoryTotals.Energy.possible) * 100) },
      { category: 'الغذاء', score: Math.round((categoryTotals.Food.earned / categoryTotals.Food.possible) * 100) },
      { category: 'النفايات', score: Math.round((categoryTotals.Waste.earned / categoryTotals.Waste.possible) * 100) },
      { category: 'المياه', score: Math.round((categoryTotals.Water.earned / categoryTotals.Water.possible) * 100) },
      { category: 'الاستهلاك', score: Math.round((categoryTotals.Consumption.earned / categoryTotals.Consumption.possible) * 100) },
      { category: 'العادات', score: Math.round((categoryTotals.Habits.earned / categoryTotals.Habits.possible) * 100) },
    ];

    const estimatedCO2 = Math.max(0.8, 6.5 - (overallPercentage / 100) * 4.5);

    const recommendations = [];
    if (categoryScores[0].score < 60) recommendations.push('استخدم النقل العام أو المشي/الدراجة للمسافات القصيرة بدلاً من السيارة.');
    if (categoryScores[1].score < 60) recommendations.push('استبدل المصابيح المتبقية بـ LED وافصل الشواحن عند عدم الاستخدام.');
    if (categoryScores[2].score < 60) recommendations.push('قلل من تناول اللحوم الحمراء بمعدل يومين أسبوعياً وركّز على الأغذية المحلية.');
    if (categoryScores[3].score < 60) recommendations.push('ابدأ بفصل النفايات في المنزل واحمل كيس تسوق قماشي دائم.');
    if (categoryScores[4].score < 60) recommendations.push('قلل مدة الاستحمام وركّب مرشدات تدفق المياه على الصنابير.');
    if (categoryScores[5].score < 60) recommendations.push('اشترِ بحكمة وحاول إصلاح الأجهزة والملابس بدلاً من استبدالها فوراً.');
    if (categoryScores[6].score < 60) recommendations.push('احمل زجاجة ماء معدنية وشارك في المبادرات والأنشطة البيئية التطوعية.');
    if (recommendations.length === 0) recommendations.push('ممتاز! استمر على هذا النهج وشارك تجربتك كقدوة لزملائك.');

    setResults({
      overallScore: overallPercentage,
      categoryScores,
      estimatedCO2,
      recommendations,
    });
    setShowResults(true);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults(null);
    setNumericValue(0);
  };

  const handleDownloadPdf = () => {
    if (!results) return;
    generateSustainabilityPdf({
      title: 'تقرير مؤشر الاستدامة الشخصي',
      subtitle: `عدد الأسئلة المنجزة: ${questions.length}`,
      headlineMetric: { label: 'النتيجة الإجمالية', value: `${results.overallScore}%` },
      sections: [
        {
          title: 'النتائج حسب المجال',
          rows: results.categoryScores.map((c: any) => [c.category, `${c.score}%`]),
        },
        {
          title: 'البصمة الكربونية التقديرية',
          rows: [['الانبعاثات السنوية', `${results.estimatedCO2.toFixed(2)} طن CO₂/سنة`]],
        },
      ],
      comparison: [
        { label: 'نتيجتك', value: results.estimatedCO2, unit: 't CO2/yr' },
        { label: 'هدف باريس 2030', value: 2.0, unit: 't CO2/yr' },
        { label: 'متوسط الأردن', value: 3.1, unit: 't CO2/yr' },
        { label: 'المعدل العالمي', value: 4.7, unit: 't CO2/yr' },
        { label: 'معدل الاتحاد الأوروبي', value: 6.2, unit: 't CO2/yr' },
        { label: 'معدل الولايات المتحدة', value: 14.4, unit: 't CO2/yr' },
      ],
      recommendations: results.recommendations,
      footer: `مؤشر الاستدامة الشخصي · ذروة العلم · ${new Date().toLocaleString('ar-JO')}`,
    }, `sustainability-index-${Date.now()}.pdf`);
    toast({ title: 'تم تنزيل التقرير', description: 'تقرير PDF جاهز بنجاح' });
  };

  if (showResults && results) {
    const radarData = results.categoryScores.map((c: any) => ({ category: c.category, score: c.score, fullMark: 100 }));
    const barColors = ['#0284c7', '#0d9488', '#16a34a', '#ca8a04', '#9333ea', '#e11d48', '#2563eb'];

    return (
      <PageShell>
        <SEO 
          title="نتائج مؤشر الاستدامة الشخصي | ذروة العلم"
          description="تحليل شامل لسلوكك البيئي عبر 7 مجالات رئيسية مع توصيات وتقرير PDF."
        />

        <PageHeader
          title="نتائج مؤشر الاستدامة الشخصي"
          description="تحليل شامل لسلوكك البيئي عبر 7 مجالات رئيسية مع مقارنات وتوصيات عملية للتحسين المستمر."
          icon={BarChartIcon}
          crumbs={[
            { label: 'الرئيسية', to: '/' },
            { label: 'المجتمع المدرسي', to: '/school' },
            { label: 'الاستدامة البيئية', to: '/environmental-sustainability' },
            { label: 'نتائج التقييم' },
          ]}
          actions={
            <div className="flex gap-2">
              <Button onClick={handleDownloadPdf} className="rounded-2xl font-bold">
                <Download className="w-4 h-4 ml-2" />
                تحميل تقرير PDF
              </Button>
              <Button variant="outline" onClick={resetQuiz} className="rounded-2xl">
                <RefreshCcw className="w-4 h-4 ml-2" />
                إعادة التقييم
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Score */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="rounded-3xl border border-border bg-card shadow-sm h-full flex flex-col justify-between p-6">
              <CardHeader className="text-center p-0 mb-4">
                <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  النتيجة الإجمالية للاستدامة
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center p-0 space-y-4">
                <div className="text-7xl font-black text-primary tracking-tight">
                  {results.overallScore}%
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {results.overallScore >= 80 ? 'ممتاز! أنت ملتزم بيئياً بدرجة عالية وتعتبر قدوة مجتمعية.' :
                    results.overallScore >= 60 ? 'جيد جداً! لديك ممارسات بيئية واعية مع فرصة لمزيد من التحسين.' :
                      results.overallScore >= 40 ? 'متوسط! يمكنك إحداث فارق كبير عبر تطبيق التوصيات المقترحة أدناه.' : 'يحتاج إلى تحسين! ابدأ بخطوات بسيطة لترشيد استهلاكك اليومي.'}
                </p>

                <div className="rounded-2xl bg-muted/40 border border-border p-4 text-center">
                  <div className="text-xs text-muted-foreground">البصمة الكربونية السنوية التقديرية</div>
                  <div className="text-2xl font-black text-card-foreground mt-1">
                    {results.estimatedCO2.toFixed(2)} طن CO₂/سنة
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Radar Profile */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="rounded-3xl border border-border bg-card shadow-sm h-full p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  الملف البيئي الشامل (رادار)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  توزيع نقاطك عبر المجالات السبعة
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
                    <Radar name="نتيجتك" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, color: 'hsl(var(--card-foreground))' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown Bar Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <Card className="rounded-3xl border border-border bg-card shadow-sm p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-bold">النتائج التفصيلية بالفئات</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">نسبة التزامك في كل قطاع مقارنة بالمعيار المثالي</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={results.categoryScores} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, color: 'hsl(var(--card-foreground))' }} />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {results.categoryScores.map((_: any, i: number) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
                  {results.categoryScores.map((c: any, i: number) => (
                    <div key={i} className="rounded-2xl bg-muted/40 border border-border p-3 text-center">
                      <div className="text-muted-foreground text-xs">{c.category}</div>
                      <div className="text-card-foreground font-bold text-lg mt-0.5">{c.score}%</div>
                      <Progress value={c.score} className="h-1.5 mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interactive Multi-View Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="lg:col-span-2">
            <MultiViewChart
              title="رؤية بيانية متعددة لأدائك"
              description="بدّل بين عرض الأعمدة، الخط، الدائرة، والرادار بسهولة"
              unit="%"
              colorScheme="emerald"
              data={results.categoryScores.map((c: any) => ({ name: c.category, value: c.score }))}
            />
          </motion.div>

          {/* Global Comparison */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <GlobalComparisonChart userValue={results.estimatedCO2} unit="طن CO₂/سنة" />
          </motion.div>

          {/* What-If Scenarios */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="lg:col-span-2">
            <WhatIfScenarios baselineEmissions={results.estimatedCO2} unit="طن CO₂/سنة" />
          </motion.div>

          {/* AI Recommendations Panel */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <AIRecommendationsPanel
              context="sustainability_index"
              userData={{ overallScore: results.overallScore, categoryScores: results.categoryScores }}
              currentEmissions={results.estimatedCO2}
            />
          </motion.div>

          {/* Recommendations Card */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }} className="lg:col-span-2">
            <Card className="rounded-3xl border border-border bg-card shadow-sm p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  خطة التحسين والتوصيات المخصصة
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  إجراءات فورية مقترحة لرفع نتيجتك وتقليل بصمتك الكربونية
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="rounded-2xl bg-muted/40 border border-border p-4 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-card-foreground leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  // Quiz View
  const q = questions[currentQuestion];
  const progressPercent = Math.round(((currentQuestion + 1) / questions.length) * 100);

  return (
    <PageShell>
      <SEO 
        title="مؤشر الاستدامة الشخصي | ذروة العلم"
        description="تقييم متقدم بـ 29 سؤالاً عبر 7 فئات بيئية مع دعم الإدخال الصوتي."
      />

      <PageHeader
        title="مؤشر الاستدامة الشخصي"
        description={`تقييم شامل عبر ${questions.length} سؤالاً في 7 فئات رئيسية، يدعم الإدخال الصوتي ويحلل بصمتك بدقة.`}
        icon={BarChartIcon}
        crumbs={[
          { label: 'الرئيسية', to: '/' },
          { label: 'المجتمع المدرسي', to: '/school' },
          { label: 'الاستدامة البيئية', to: '/environmental-sustainability' },
          { label: 'مؤشر الاستدامة الشخصي' }
        ]}
      />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Bar Card */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>السؤال {currentQuestion + 1} من {questions.length}</span>
            <span className="text-primary">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 rounded-full" />
        </div>

        {/* Question Card */}
        <motion.div 
          key={currentQuestion} 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.25 }}
        >
          <Card className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <CardHeader className="p-0 mb-6">
              <div className="flex items-center justify-between gap-3 mb-2">
                <Badge variant="secondary" className="text-xs">
                  الفئة: {q.category}
                </Badge>
                <span className="text-xs text-muted-foreground">سؤال تفاعلي</span>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-card-foreground leading-snug">
                {q.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-5">
              {q.type === 'number' ? (
                <div className="space-y-4">
                  <VoiceNumberInput
                    label={`أدخل القيمة (${q.unit})`}
                    value={numericValue}
                    onChange={setNumericValue}
                    placeholder="0"
                  />
                  <Button 
                    onClick={() => handleAnswer(numericValue)} 
                    className="w-full h-12 rounded-2xl font-bold"
                  >
                    تأكيد والانتقال للتالي
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {q.options?.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleAnswer(option)}
                      className="p-4 h-auto text-right justify-start rounded-2xl border-border bg-background hover:border-primary/40 hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-all"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {currentQuestion > 0 && (
                <div className="pt-2">
                  <Button 
                    onClick={goBack} 
                    variant="ghost" 
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ← السؤال السابق
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default PersonalSustainabilityIndex;
