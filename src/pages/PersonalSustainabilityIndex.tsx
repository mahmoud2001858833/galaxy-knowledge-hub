import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BarChart, CheckCircle, Target, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PersonalSustainabilityIndex = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const questions = [
    {
      id: 1,
      category: "Transportation",
      text: "هل تستخدم زجاجة ماء بلاستيكية لمرة واحدة يومياً؟",
      type: "frequency",
      options: ["أبداً", "نادراً", "أحياناً", "غالباً", "دائماً"]
    },
    {
      id: 2,
      category: "Energy", 
      text: "هل تحمل كيس تسوق قابل لإعادة الاستخدام؟",
      type: "yesno",
      options: ["نعم", "لا"]
    },
    {
      id: 3,
      category: "Transportation",
      text: "كيف تذهب إلى المدرسة عادة؟",
      type: "choice",
      options: ["المشي", "الدراجة", "الحافلة العامة", "السيارة", "التاكسي", "الدراجة النارية"]
    },
    {
      id: 4,
      category: "Transportation",
      text: "كم كيلومتر تسافر بالسيارة أسبوعياً؟",
      type: "number",
      unit: "كم"
    },
    {
      id: 5,
      category: "Energy",
      text: "هل تطفئ الأنوار عند مغادرة الغرفة؟",
      type: "frequency",
      options: ["أبداً", "نادراً", "أحياناً", "غالباً", "دائماً"]
    },
    {
      id: 6,
      category: "Energy",
      text: "هل تفصل الشواحن والأجهزة عند عدم الاستخدام؟",
      type: "frequency",
      options: ["أبداً", "نادراً", "أحياناً", "غالباً", "دائماً"]
    },
    {
      id: 7,
      category: "Energy",
      text: "ما نسبة المصابيح الموفرة للطاقة (LED) في منزلك؟",
      type: "choice",
      options: ["0%", "25%", "50%", "75%", "100%"]
    },
    {
      id: 8,
      category: "Transportation",
      text: "كم رحلة طيران تقوم بها سنوياً؟",
      type: "choice",
      options: ["0", "1-2", "3-5", "6+"]
    },
    {
      id: 9,
      category: "Waste",
      text: "هل تفصل النفايات (ورق/بلاستيك/زجاج/معدن) في المنزل؟",
      type: "frequency",
      options: ["أبداً", "نادراً", "أحياناً", "غالباً", "دائماً"]
    },
    {
      id: 10,
      category: "Waste",
      text: "هل تقوم بتحويل بقايا الطعام إلى سماد طبيعي؟",
      type: "yesno",
      options: ["نعم", "لا"]
    },
    {
      id: 11,
      category: "Food",
      text: "كم وجبة تحتوي على لحم أحمر (بقر/خروف) أسبوعياً؟",
      type: "number",
      unit: "وجبة"
    },
    {
      id: 12,
      category: "Food",
      text: "كم وجبة نباتية تتناول أسبوعياً؟",
      type: "number",
      unit: "وجبة"
    },
    {
      id: 13,
      category: "Food",
      text: "هل تحاول تجنب هدر الطعام؟",
      type: "frequency",
      options: ["أبداً", "نادراً", "أحياناً", "غالباً", "دائماً"]
    },
    {
      id: 14,
      category: "Consumption",
      text: "كم مرة تشتري ملابس جديدة سنوياً؟",
      type: "choice",
      options: ["0-5", "6-10", "11-20", "21-30", "30+"]
    },
    {
      id: 15,
      category: "Consumption",
      text: "هل تصلح أو ترقع الملابس بدلاً من استبدالها؟",
      type: "frequency",
      options: ["أبداً", "نادراً", "أحياناً", "غالباً", "دائماً"]
    },
    {
      id: 16,
      category: "Water",
      text: "هل لديك نباتات في المنزل أو تزرع الأشجار؟",
      type: "yesno",
      options: ["نعم", "لا"]
    },
    {
      id: 17,
      category: "Water",
      text: "هل تقطع النباتات/الأشجار في حديقتك بانتظام؟",
      type: "frequency",
      options: ["أبداً", "نادراً", "أحياناً", "غالباً", "دائماً"]
    },
    {
      id: 18,
      category: "Habits",
      text: "هل تحرق نفايات الحديقة؟",
      type: "yesno",
      options: ["نعم", "لا"]
    },
    {
      id: 19,
      category: "Habits",
      text: "هل تدخن؟",
      type: "frequency",
      options: ["أبداً", "نادراً", "أحياناً", "غالباً", "دائماً"]
    },
    {
      id: 20,
      category: "Energy",
      text: "هل تغطي الأواني أثناء الطبخ لتوفير الطاقة؟",
      type: "frequency",
      options: ["أبداً", "نادراً", "أحياناً", "غالباً", "دائماً"]
    }
  ];

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const categoryScores = {
      Transportation: 0,
      Energy: 0,
      Food: 0,
      Waste: 0,
      Water: 0,
      Consumption: 0,
      Habits: 0
    };

    const categoryWeights = {
      Transportation: 25,
      Energy: 25,
      Food: 20,
      Waste: 15,
      Water: 10,
      Consumption: 10,
      Habits: 5
    };

    // Calculate scores for each category
    questions.forEach((question, index) => {
      const answer = answers[index];
      let score = 0;

      if (question.type === 'frequency') {
        const frequencyScores = { "أبداً": 0, "نادراً": 25, "أحياناً": 50, "غالباً": 75, "دائماً": 100 };
        // For positive environmental actions, use normal scoring
        if (question.text.includes('تطفئ') || question.text.includes('تفصل') || question.text.includes('تحاول') || question.text.includes('تستخدم المواصلات') || question.text.includes('تغطي') || question.text.includes('تصلح') || question.text.includes('تتبرع') || question.text.includes('تفضل') || question.text.includes('تعيد ملء') || question.text.includes('تشارك') || question.text.includes('تختار')) {
          score = frequencyScores[answer as keyof typeof frequencyScores] || 0;
        } else {
          // For negative environmental actions, invert the scoring
          const invertedScores = { "أبداً": 100, "نادراً": 75, "أحياناً": 50, "غالباً": 25, "دائماً": 0 };
          score = invertedScores[answer as keyof typeof invertedScores] || 0;
        }
      } else if (question.type === 'yesno') {
        // For positive environmental actions
        if (question.text.includes('تحمل') || question.text.includes('تحويل') || question.text.includes('نباتات') || question.text.includes('منظم') || question.text.includes('توفير')) {
          score = answer === 'نعم' ? 100 : 0;
        } else {
          score = answer === 'لا' ? 100 : 0;
        }
      } else if (question.type === 'choice') {
        // Custom scoring for choice questions
        if (question.text.includes('تذهب إلى المدرسة')) {
          const transportScores = { "المشي": 100, "الدراجة": 90, "الحافلة العامة": 70, "السيارة": 30, "التاكسي": 20, "الدراجة النارية": 40 };
          score = transportScores[answer as keyof typeof transportScores] || 0;
        } else if (question.text.includes('LED')) {
          const ledScores = { "0%": 0, "25%": 25, "50%": 50, "75%": 75, "100%": 100 };
          score = ledScores[answer as keyof typeof ledScores] || 0;
        } else if (question.text.includes('رحلة طيران')) {
          const flightScores = { "0": 100, "1-2": 70, "3-5": 40, "6+": 0 };
          score = flightScores[answer as keyof typeof flightScores] || 0;
        } else if (question.text.includes('ملابس جديدة')) {
          const clothingScores = { "0-5": 100, "6-10": 70, "11-20": 50, "21-30": 25, "30+": 0 };
          score = clothingScores[answer as keyof typeof clothingScores] || 0;
        } else if (question.text.includes('الاستحمام')) {
          const showerScores = { "مرة واحدة - 5 دقائق": 100, "مرة واحدة - 10 دقائق": 75, "مرة واحدة - 15+ دقيقة": 50, "مرتان يومياً": 25, "أكثر من مرتين": 0 };
          score = showerScores[answer as keyof typeof showerScores] || 0;
        }
      } else if (question.type === 'number') {
        // For numeric answers, provide basic scoring
        const numAnswer = parseInt(answer) || 0;
        if (question.text.includes('لحم أحمر')) {
          score = Math.max(0, 100 - (numAnswer * 15)); // Less red meat = higher score
        } else if (question.text.includes('نباتية')) {
          score = Math.min(100, numAnswer * 15); // More plant-based = higher score
        } else {
          score = 50; // Default middle score for other numeric answers
        }
      }

      categoryScores[question.category as keyof typeof categoryScores] += score;
    });

    // Calculate weighted average
    let totalWeightedScore = 0;
    Object.entries(categoryScores).forEach(([category, score]) => {
      const categoryQuestionCount = questions.filter(q => q.category === category).length;
      const avgCategoryScore = categoryQuestionCount > 0 ? score / categoryQuestionCount : 0;
      const weight = categoryWeights[category as keyof typeof categoryWeights];
      totalWeightedScore += (avgCategoryScore * weight) / 100;
    });

    const overallScore = Math.round(totalWeightedScore);
    
    // Generate recommendations
    const recommendations = [
      { action: "استخدم كيس تسوق قابل لإعادة الاستخدام", impact: "توفير 10 كيس بلاستيكي شهرياً", scoreIncrease: 5 },
      { action: "اطفئ الأنوار عند مغادرة الغرفة", impact: "توفير 50 كيلو واط ساعة سنوياً", scoreIncrease: 8 },
      { action: "قلل من استهلاك اللحوم الحمراء", impact: "تقليل 200 كج CO2 سنوياً", scoreIncrease: 12 }
    ];

    setResults({
      overallScore,
      categoryScores: Object.entries(categoryScores).map(([category, score]) => ({
        category,
        score: Math.round(score / questions.filter(q => q.category === category).length)
      })),
      recommendations
    });
    
    setShowResults(true);
    toast({
      title: "تم حساب مؤشر الاستدامة",
      description: `نقاطك: ${overallScore}%`
    });
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults(null);
  };

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-950 via-green-950 to-blue-950 p-4" dir={dir}>
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <Button
              variant="outline"
              onClick={() => {
                const isGJU = sessionStorage.getItem('gju_mode') === 'true';
                navigate(isGJU ? '/gju-competition' : '/environmental-sustainability');
              }}
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChart className="w-10 h-10 text-teal-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-white to-green-400">
                نتائج مؤشر الاستدامة الشخصي
              </h1>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-white flex items-center gap-2 justify-center">
                    <Target className="w-5 h-5" />
                    النتيجة الإجمالية
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-6xl font-bold text-teal-400 mb-4">
                    {results.overallScore}%
                  </div>
                  <p className="text-white/80 mb-4">
                    {results.overallScore >= 80 ? "ممتاز! أنت ملتزم بيئياً بدرجة عالية" :
                     results.overallScore >= 60 ? "جيد! لديك التزام بيئي جيد مع مجال للتحسين" :
                     results.overallScore >= 40 ? "متوسط! يمكنك تحسين ممارساتك البيئية" :
                     "يحتاج تحسين! ابدأ بتطبيق التوصيات"}
                  </p>
                  <Button onClick={resetQuiz} className="bg-teal-600 hover:bg-teal-700">
                    إعادة الاختبار
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    النتائج بالفئات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.categoryScores.map((category: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-sm">{category.category}</span>
                        <span className="text-white font-medium">{category.score}%</span>
                      </div>
                      <Progress value={category.score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    التوصيات للتحسين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {results.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="text-white font-medium mb-2">{rec.action}</h4>
                        <p className="text-white/70 text-sm mb-2">{rec.impact}</p>
                        <div className="text-teal-400 text-sm font-medium">
                          +{rec.scoreIncrease} نقاط
                        </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-green-950 to-blue-950 p-4" dir={dir}>
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="outline"
            onClick={() => {
              const isGJU = sessionStorage.getItem('gju_mode') === 'true';
              navigate(isGJU ? '/gju-competition' : '/environmental-sustainability');
            }}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart className="w-10 h-10 text-teal-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-white to-green-400">
              مؤشر الاستدامة الشخصي
            </h1>
          </div>
          <p className="text-white/70 text-lg">
            اكتشف مستوى التزامك البيئي من خلال {questions.length} سؤال
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-sm">
              السؤال {currentQuestion + 1} من {questions.length}
            </span>
            <span className="text-white text-sm">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
        </motion.div>

        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                {questions[currentQuestion].text}
              </CardTitle>
              <CardDescription className="text-teal-300">
                الفئة: {questions[currentQuestion].category}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions[currentQuestion].type === 'number' ? (
                <div className="space-y-4">
                  <input
                    type="number"
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white"
                    placeholder={`أدخل الرقم (${questions[currentQuestion].unit})`}
                    onChange={(e) => handleAnswer(parseInt(e.target.value) || 0)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {questions[currentQuestion].options?.map((option, index) => (
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PersonalSustainabilityIndex;