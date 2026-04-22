import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BarChart as BarChartIcon, CheckCircle, Target, TrendingUp, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VoiceNumberInput from '@/components/eco/VoiceNumberInput';
import GlobalComparisonChart from '@/components/eco/GlobalComparisonChart';
import MultiViewChart from '@/components/eco/MultiViewChart';
import WhatIfScenarios from '@/components/eco/WhatIfScenarios';
import AIRecommendationsPanel from '@/components/eco/AIRecommendationsPanel';
import { generateSustainabilityPdf } from '@/lib/sustainabilityPdf';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

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
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  const calculateResults = (allAnswers: Record<number, any>) => {
    const categoryScores: Record<string, number> = {
      Transportation: 0, Energy: 0, Food: 0, Waste: 0, Water: 0, Consumption: 0, Habits: 0,
    };
    const categoryWeights = {
      Transportation: 22, Energy: 22, Food: 18, Waste: 13, Water: 12, Consumption: 8, Habits: 5,
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
      'استبدل الزجاجات البلاستيكية بقارورة قابلة لإعادة الاستخدام',
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

  if (showResults && results) {
    const radarData = results.categoryScores.map((c: any) => ({ category: c.category, score: c.score, fullMark: 100 }));
    const barColors = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899', '#84cc16'];

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-950 via-green-950 to-blue-950 p-4" dir={dir}>
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={() => {
              const isGJU = sessionStorage.getItem('gju_mode') === 'true';
              navigate(isGJU ? '/gju-competition' : '/environmental-sustainability');
            }} className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4" />العودة
            </Button>
            <Button onClick={handleDownloadPdf} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Download className="w-4 h-4 ml-2" />تحميل تقرير PDF
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChartIcon className="w-10 h-10 text-teal-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-white to-green-400">
                نتائج مؤشر الاستدامة الشخصي
              </h1>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm h-full">
                <CardHeader className="text-center">
                  <CardTitle className="text-white flex items-center gap-2 justify-center">
                    <Target className="w-5 h-5" />النتيجة الإجمالية
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-7xl font-bold text-teal-400 mb-4">{results.overallScore}%</div>
                  <p className="text-white/80 mb-4">
                    {results.overallScore >= 80 ? 'ممتاز! أنت ملتزم بيئياً بدرجة عالية' :
                      results.overallScore >= 60 ? 'جيد! لديك التزام بيئي مع مجال للتحسين' :
                        results.overallScore >= 40 ? 'متوسط! يمكنك تحسين ممارساتك' : 'يحتاج تحسين! ابدأ بالتوصيات'}
                  </p>
                  <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-3 mb-4">
                    <p className="text-amber-300 text-sm">بصمة كربونية تقديرية</p>
                    <p className="text-2xl font-bold text-white">{results.estimatedCO2.toFixed(2)} طن CO₂/سنة</p>
                  </div>
                  <Button onClick={resetQuiz} className="bg-teal-600 hover:bg-teal-700">إعادة الاختبار</Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><TrendingUp className="w-5 h-5" />الملف البيئي - رادار</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.2)" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: '#fff', fontSize: 11 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <Radar name="نتيجتك" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid #10b981', borderRadius: 12, color: '#fff' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">النتائج بالفئات</CardTitle>
                  <CardDescription className="text-white/60">أداؤك في كل مجال بيئي</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={results.categoryScores} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, color: '#fff' }} />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                        {results.categoryScores.map((_: any, i: number) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {results.categoryScores.map((c: any, i: number) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3">
                        <div className="text-white/70 text-xs">{c.category}</div>
                        <div className="text-white font-bold text-lg">{c.score}%</div>
                        <Progress value={c.score} className="h-1.5 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
              <GlobalComparisonChart userValue={results.estimatedCO2} unit="طن CO₂/سنة" />
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2"><CheckCircle className="w-5 h-5" />التوصيات للتحسين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold flex-shrink-0">{i + 1}</div>
                        <p className="text-white/90 text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-green-950 to-blue-950 p-4" dir={dir}>
      <div className="container mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => {
            const isGJU = sessionStorage.getItem('gju_mode') === 'true';
            navigate(isGJU ? '/gju-competition' : '/environmental-sustainability');
          }} className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4" />العودة
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChartIcon className="w-10 h-10 text-teal-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-white to-green-400">
              مؤشر الاستدامة الشخصي
            </h1>
          </div>
          <p className="text-white/70 text-lg">
            تقييم متقدم بـ {questions.length} سؤالاً · 7 فئات · يدعم الإدخال الصوتي 🎤
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-sm">السؤال {currentQuestion + 1} من {questions.length}</span>
            <span className="text-white text-sm">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
        </motion.div>

        <motion.div key={currentQuestion} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl">{q.text}</CardTitle>
              <CardDescription className="text-teal-300">الفئة: {q.category}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {q.type === 'number' ? (
                <div className="space-y-4">
                  <VoiceNumberInput
                    label={`أدخل القيمة (${q.unit})`}
                    value={numericValue}
                    onChange={setNumericValue}
                    placeholder="0"
                  />
                  <Button onClick={() => handleAnswer(numericValue)} className="w-full bg-teal-600 hover:bg-teal-700">
                    التالي
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {q.options?.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleAnswer(option)}
                      className="p-4 text-right justify-start bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {currentQuestion > 0 && (
                <Button onClick={goBack} variant="ghost" className="text-white/60 hover:text-white">
                  ← السؤال السابق
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PersonalSustainabilityIndex;
