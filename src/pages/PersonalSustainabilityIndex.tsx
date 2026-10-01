import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, BarChart as BarChartIcon, CheckCircle, Target, 
  TrendingUp, Download, Home, ChevronRight, RotateCcw, 
  Sparkles, Leaf, Award, Compass 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VoiceNumberInput from '@/components/eco/VoiceNumberInput';
import GlobalComparisonChart from '@/components/eco/GlobalComparisonChart';
import MultiViewChart from '@/components/eco/MultiViewChart';
import WhatIfScenarios from '@/components/eco/WhatIfScenarios';
import AIRecommendationsPanel from '@/components/eco/AIRecommendationsPanel';
import { generateSustainabilityPdf } from '@/lib/sustainabilityPdf';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

interface Question {
  id: number;
  category: string;
  text: string;
  type: 'frequency' | 'yesno' | 'choice' | 'number';
  options?: string[];
  unit?: string;
}

const PersonalSustainabilityIndex = () => {
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
    { id: 0, category: 'المواصلات', text: 'كيف تذهب إلى المدرسة/العمل عادة؟', type: 'choice', options: ['المشي', 'الدراجة', 'الحافلة العامة', 'السيارة', 'التاكسي', 'الدراجة النارية'] },
    { id: 1, category: 'المواصلات', text: 'كم كيلومتر تسافر بالسيارة أسبوعياً؟', type: 'number', unit: 'كم' },
    { id: 2, category: 'المواصلات', text: 'كم رحلة طيران تقوم بها سنوياً؟', type: 'choice', options: ['0', '1-2', '3-5', '6+'] },
    { id: 3, category: 'المواصلات', text: 'هل تستخدم المواصلات العامة بدلاً من السيارة؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 4, category: 'المواصلات', text: 'هل تشارك السيارة مع آخرين (carpooling)؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },

    // === Energy (6) ===
    { id: 5, category: 'الطاقة', text: 'هل تطفئ الأنوار عند مغادرة الغرفة؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 6, category: 'الطاقة', text: 'هل تفصل الشواحن والأجهزة عند عدم الاستخدام؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 7, category: 'الطاقة', text: 'ما نسبة المصابيح الموفرة (LED) في منزلك؟', type: 'choice', options: ['0%', '25%', '50%', '75%', '100%'] },
    { id: 8, category: 'الطاقة', text: 'كم ساعة تشغّل التكييف يومياً صيفاً؟', type: 'number', unit: 'ساعة' },
    { id: 9, category: 'الطاقة', text: 'كم استهلاك الكهرباء الشهري في منزلك؟', type: 'number', unit: 'ك.و.س' },
    { id: 10, category: 'الطاقة', text: 'هل تستخدم طاقة متجددة (شمسية)؟', type: 'choice', options: ['لا', 'جزئياً', 'كلياً'] },

    // === Food (5) ===
    { id: 11, category: 'الغذاء', text: 'كم وجبة تحتوي على لحم أحمر أسبوعياً؟', type: 'number', unit: 'وجبة' },
    { id: 12, category: 'الغذاء', text: 'كم وجبة نباتية تتناول أسبوعياً؟', type: 'number', unit: 'وجبة' },
    { id: 13, category: 'الغذاء', text: 'هل تحاول تجنب هدر الطعام؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 14, category: 'الغذاء', text: 'هل تشتري منتجات محلية وموسمية؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 15, category: 'الغذاء', text: 'كم مرة تطلب وجبات جاهزة (تغليف بلاستيكي)؟', type: 'number', unit: 'مرة/أسبوع' },

    // === Waste (4) ===
    { id: 16, category: 'النفايات', text: 'هل تفصل النفايات في المنزل؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 17, category: 'النفايات', text: 'هل تحوّل بقايا الطعام إلى سماد طبيعي؟', type: 'yesno', options: ['نعم', 'لا'] },
    { id: 18, category: 'النفايات', text: 'كم كيس بلاستيكي تستخدم أسبوعياً؟', type: 'number', unit: 'كيس' },
    { id: 19, category: 'النفايات', text: 'هل تحمل كيس تسوق قابل لإعادة الاستخدام؟', type: 'yesno', options: ['نعم', 'لا'] },

    // === Water (4) ===
    { id: 20, category: 'المياه', text: 'كم دقيقة تستحم في المرة الواحدة؟', type: 'number', unit: 'دقيقة' },
    { id: 21, category: 'المياه', text: 'هل تغلق الصنبور أثناء تنظيف الأسنان؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 22, category: 'المياه', text: 'هل لديك نباتات أو تزرع أشجاراً؟', type: 'yesno', options: ['نعم', 'لا'] },
    { id: 23, category: 'المياه', text: 'هل تجمع مياه الأمطار للسقي؟', type: 'yesno', options: ['نعم', 'لا'] },

    // === Consumption (3) ===
    { id: 24, category: 'الاستهلاك', text: 'كم مرة تشتري ملابس جديدة سنوياً؟', type: 'choice', options: ['0-5', '6-10', '11-20', '21-30', '30+'] },
    { id: 25, category: 'الاستهلاك', text: 'هل تصلح الأشياء بدلاً من استبدالها؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 26, category: 'الاستهلاك', text: 'هل تشتري سلعاً مستعملة (second-hand)؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },

    // === Habits (3) ===
    { id: 27, category: 'العادات البيئية', text: 'هل تستخدم زجاجة ماء بلاستيكية يومياً؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 28, category: 'العادات البيئية', text: 'هل تشارك في تنظيف بيئتك المحلية؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
    { id: 29, category: 'العادات البيئية', text: 'هل تنشر الوعي البيئي بين معارفك؟', type: 'frequency', options: ['أبداً', 'نادراً', 'أحياناً', 'غالباً', 'دائماً'] },
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
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  const calculateResults = (allAnswers: Record<number, any>) => {
    const categoryScores: Record<string, number> = {
      'المواصلات': 0, 'الطاقة': 0, 'الغذاء': 0, 'النفايات': 0, 'المياه': 0, 'الاستهلاك': 0, 'العادات البيئية': 0,
    };
    const categoryWeights = {
      'المواصلات': 22, 'الطاقة': 22, 'الغذاء': 18, 'النفايات': 13, 'المياه': 12, 'الاستهلاك': 8, 'العادات البيئية': 5,
    };

    const positiveKeywords = ['تطفئ', 'تفصل', 'تحاول', 'تستخدم المواصلات', 'تغطي', 'تصلح', 'تتبرع', 'تفضل', 'تعيد ملء', 'تشارك', 'تختار', 'تشتري منتجات', 'تشتري سلعاً', 'تنشر', 'تغلق', 'تجمع'];
    const isPositive = (text: string) => positiveKeywords.some(k => text.includes(k));
    const positiveYesno = ['تحمل', 'تحويل', 'نباتات', 'منظم', 'توفير', 'تجمع'];

    questions.forEach((q) => {
      const answer = allAnswers[q.id];
      if (answer === undefined || answer === null) return;
      let score = 0;

      if (q.type === 'frequency') {
        const fwd = { 'أبداً': 0, 'نادراً': 25, 'أحياناً': 50, 'غالباً': 75, 'دائماً': 100 };
        const inv = { 'أبداً': 100, 'نادراً': 75, 'أحياناً': 50, 'غالباً': 25, 'دائماً': 0 };
        score = isPositive(q.text) ? (fwd as any)[answer] ?? 0 : (inv as any)[answer] ?? 0;
      } else if (q.type === 'yesno') {
        const positive = positiveYesno.some(k => q.text.includes(k));
        score = positive ? (answer === 'نعم' ? 100 : 0) : (answer === 'لا' ? 100 : 0);
      } else if (q.type === 'choice') {
        if (q.text.includes('تذهب')) {
          score = ({ 'المشي': 100, 'الدراجة': 90, 'الحافلة العامة': 70, 'السيارة': 30, 'التاكسي': 20, 'الدراجة النارية': 40 } as any)[answer] ?? 0;
        } else if (q.text.includes('LED')) {
          score = parseInt(answer);
        } else if (q.text.includes('طيران')) {
          score = ({ '0': 100, '1-2': 70, '3-5': 40, '6+': 0 } as any)[answer] ?? 0;
        } else if (q.text.includes('متجددة')) {
          score = ({ 'لا': 0, 'جزئياً': 60, 'كلياً': 100 } as any)[answer] ?? 0;
        } else if (q.text.includes('ملابس')) {
          score = ({ '0-5': 100, '6-10': 70, '11-20': 50, '21-30': 25, '30+': 0 } as any)[answer] ?? 0;
        }
      } else if (q.type === 'number') {
        const n = parseFloat(answer) || 0;
        if (q.text.includes('لحم أحمر')) score = Math.max(0, 100 - n * 12);
        else if (q.text.includes('نباتية')) score = Math.min(100, n * 12);
        else if (q.text.includes('بالسيارة')) score = Math.max(0, 100 - n * 0.4);
        else if (q.text.includes('التكييف')) score = Math.max(0, 100 - n * 8);
        else if (q.text.includes('الكهرباء')) score = Math.max(0, 100 - n * 0.1);
        else if (q.text.includes('بلاستيكي') || q.text.includes('كيس')) score = Math.max(0, 100 - n * 10);
        else if (q.text.includes('وجبات جاهزة')) score = Math.max(0, 100 - n * 15);
        else if (q.text.includes('تستحم')) score = n <= 5 ? 100 : Math.max(0, 100 - (n - 5) * 8);
        else score = 50;
      }
      categoryScores[q.category] += score;
    });

    const categoryAverages = Object.entries(categoryScores).map(([cat, sum]) => {
      const count = questions.filter(q => q.category === cat).length;
      return { category: cat, score: count ? Math.round(sum / count) : 0 };
    });

    let weightedScore = 0;
    categoryAverages.forEach(({ category, score }) => {
      weightedScore += (score * (categoryWeights as any)[category]) / 100;
    });
    const overallScore = Math.round(weightedScore);

    // Estimate annual CO2 (tons) from inverse of score
    const estimatedCO2 = Math.max(1.0, ((100 - overallScore) / 100) * 12);

    const recommendations = [
      'استبدل المصابيح التقليدية بمصابيح LED لتوفير 75% من استهلاك الإنارة',
      'قلّل وجبات اللحم الأحمر إلى 1-2 أسبوعياً لتوفير ~300 كج CO₂ سنوياً',
      'استخدم المواصلات العامة أو شارك السيارة لتوفير ~600 كج CO₂ سنوياً',
      'افصل النفايات وحوّل بقايا الطعام إلى سماد طبيعي',
      'استبدل الزجاجات البلاستيكية بقارورة مياه قابلة لإعادة الاستخدام',
    ].slice(0, 5);

    setResults({ overallScore, categoryScores: categoryAverages, recommendations, estimatedCO2 });
    setShowResults(true);
    toast({ title: 'تم حساب مؤشر الاستدامة', description: `نقاطك: ${overallScore}%` });
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
      title: 'Personal Sustainability Index Report',
      subtitle: `Total Questions Answered: ${questions.length}`,
      headlineMetric: { label: 'Overall Sustainability Score', value: `${results.overallScore} / 100` },
      sections: [
        {
          title: 'Category Breakdown',
          rows: results.categoryScores.map((c: any) => [c.category, `${c.score}%`]),
        },
        {
          title: 'Estimated Footprint',
          rows: [['Annual CO2 (tons)', results.estimatedCO2.toFixed(2)]],
        },
      ],
      comparison: [
        { label: 'You', value: results.estimatedCO2, unit: 't CO2/yr' },
        { label: 'Paris Goal 2030', value: 2.0, unit: 't CO2/yr' },
        { label: 'Jordan Average', value: 3.1, unit: 't CO2/yr' },
        { label: 'World Average', value: 4.7, unit: 't CO2/yr' },
        { label: 'EU Average', value: 6.2, unit: 't CO2/yr' },
        { label: 'USA Average', value: 14.4, unit: 't CO2/yr' },
      ],
      recommendations: results.recommendations,
      footer: `Personal Sustainability Index · ${new Date().toLocaleString()}`,
    }, `sustainability-index-${Date.now()}.pdf`);
    toast({ title: 'تم تنزيل التقرير', description: 'تقرير PDF جاهز' });
  };

  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-slate-100 transition-colors" dir={dir}>
      <SEO 
        title="مؤشر الاستدامة الشخصي التفاعلي | منصة المعرفة"
        description="مقياس شامل ومتقدم بـ 30 مؤشراً لتقييم بصمتك البيئية وعاداتك المستدامة مع تحليل بياني بالرادار والأعمدة."
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
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">مؤشر الاستدامة الشخصي</span>
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

        <div className="container mx-auto px-4 pt-8 max-w-6xl">
          {showResults && results ? (
            /* RESULTS VIEW */
            <div>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                    <Award className="w-3.5 h-3.5" />
                    <span>تقرير الاستدامة الشخصي الشامل</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    نتائج مؤشر الاستدامة الشخصي
                  </h1>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button onClick={resetQuiz} variant="outline" className="border-slate-200 dark:border-slate-800 gap-1.5 text-xs">
                    <RotateCcw className="w-3.5 h-3.5" />
                    إعادة التقييم
                  </Button>
                  <Button onClick={handleDownloadPdf} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
                    <Download className="w-3.5 h-3.5" />
                    تحميل التقرير (PDF)
                  </Button>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Score Card */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-4">
                  <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl h-full flex flex-col justify-between overflow-hidden">
                    <CardHeader className="text-center pb-2 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 justify-center">
                        <Target className="w-4 h-4 text-emerald-600" />
                        النتيجة الإجمالية
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center p-6 space-y-4">
                      <div className="relative inline-flex items-center justify-center">
                        <div className="text-6xl font-black text-emerald-600 dark:text-emerald-400">
                          {results.overallScore}%
                        </div>
                      </div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                        {results.overallScore >= 80 ? 'ممتاز! أنت نموذج يحتذى به في الالتزام البيئي والمناخي.' :
                          results.overallScore >= 60 ? 'جيد جداً! لديك التزام بيئي ملحوظ مع فرص لتحسين بعض العادات اليومية.' :
                            results.overallScore >= 40 ? 'متوسط! يمكنك إحداث نقلة كبيرة باتباع التوصيات المخصصة أدناه.' : 'يحتاج إلى تحسين! ابدأ بالخطوات البسيطة لتخفيف بصمتك.'}
                      </p>
                      
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 text-right">
                        <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">البصمة السنوية المقدرة:</span>
                        <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                          {results.estimatedCO2.toFixed(2)} <span className="text-xs font-normal text-slate-500">طن CO₂/سنة</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Radar Chart */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-8">
                  <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl h-full overflow-hidden">
                    <CardHeader className="pb-2 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        رادار الأداء عبر المحاور السبعة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ResponsiveContainer width="100%" height={260}>
                        <RadarChart data={results.categoryScores.map((c: any) => ({ category: c.category, score: c.score, fullMark: 100 }))}>
                          <PolarGrid stroke="#cbd5e1" strokeOpacity={0.5} />
                          <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                          <Radar name="نتيجتك" dataKey="score" stroke="#059669" fill="#10b981" fillOpacity={0.35} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a', fontSize: 12 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Category Breakdown Bar Chart */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-12">
                  <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20 py-4">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">تفصيل النتائج حسب المجال</CardTitle>
                      <CardDescription className="text-xs text-slate-500">نسبة الالتزام والفاعلية في كل فئة</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
                        {results.categoryScores.map((c: any, i: number) => (
                          <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-center">
                            <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium truncate">{c.category}</div>
                            <div className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg mt-1">{c.score}%</div>
                            <Progress value={c.score} className="h-1.5 mt-2 bg-slate-200 dark:bg-slate-700 [&>div]:bg-emerald-500" />
                          </div>
                        ))}
                      </div>

                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={results.categoryScores} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                          <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a', fontSize: 12 }} />
                          <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Multi-view and comparisons */}
                <div className="lg:col-span-12 space-y-6">
                  <MultiViewChart
                    title="رؤية متعددة لأدائك البيئي"
                    description="بدّل بين عرض الأعمدة، الخط، الدائرة، والرادار"
                    unit="%"
                    colorScheme="emerald"
                    data={results.categoryScores.map((c: any) => ({ name: c.category, value: c.score }))}
                  />

                  <GlobalComparisonChart userValue={results.estimatedCO2} unit="طن CO₂/سنة" />

                  <WhatIfScenarios baselineEmissions={results.estimatedCO2} unit="طن CO₂/سنة" />

                  <AIRecommendationsPanel
                    context="sustainability_index"
                    userData={{ overallScore: results.overallScore, categoryScores: results.categoryScores }}
                    currentEmissions={results.estimatedCO2}
                  />

                  {/* Recommendations */}
                  <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/20 py-4">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        خطة العمل السريعة المقترحة لك
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {results.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0">
                              {i + 1}
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 text-xs font-medium leading-relaxed">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            /* QUIZ VIEW */
            <div className="max-w-2xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-3">
                  <Compass className="w-3.5 h-3.5" />
                  <span>تقييم الاستدامة الشخصي · 30 معياراً معتمداً</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                  مؤشر الاستدامة الشخصي
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                  أجب بدقة لتتعرف على نقاط قوتك البيئية ومجالات التطوير المتاحة.
                </p>
              </motion.div>

              {/* Progress */}
              <div className="mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-xs font-semibold mb-2 text-slate-600 dark:text-slate-400">
                  <span>السؤال {currentQuestion + 1} من {questions.length}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-emerald-500" />
              </div>

              {/* Question Card */}
              <motion.div key={currentQuestion} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                        فئة: {q.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">#{q.id + 1}</span>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mt-3 leading-snug">
                      {q.text}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4">
                    {q.type === 'number' ? (
                      <div className="space-y-4">
                        <VoiceNumberInput
                          label={`أدخل القيمة التقديرية (${q.unit})`}
                          value={numericValue}
                          onChange={setNumericValue}
                          placeholder="0"
                        />
                        <Button 
                          onClick={() => handleAnswer(numericValue)} 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 rounded-xl shadow-xs"
                        >
                          تأكيد ومتابعة
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5">
                        {q.options?.map((option, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            onClick={() => handleAnswer(option)}
                            className="p-4 text-right justify-start bg-slate-50 hover:bg-emerald-50/80 dark:bg-slate-800/40 dark:hover:bg-emerald-950/30 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-400 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-all shadow-2xs h-auto text-sm"
                          >
                            <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 text-xs flex items-center justify-center shrink-0 ml-3 font-mono">
                              {index + 1}
                            </span>
                            <span>{option}</span>
                          </Button>
                        ))}
                      </div>
                    )}

                    {currentQuestion > 0 && (
                      <div className="pt-2 flex justify-start">
                        <Button onClick={goBack} variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white gap-1">
                          ← السؤال السابق
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PersonalSustainabilityIndex;
