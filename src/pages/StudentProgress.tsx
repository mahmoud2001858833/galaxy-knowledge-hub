import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Brain, Award, TrendingUp, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  subject: string;
  level: 'easy' | 'medium' | 'hard';
}

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overallScore: number;
  subjectScores: { [key: string]: number };
}

const questions: Question[] = [
  {
    id: 1,
    text: "ما هو ناتج 5 × 7؟",
    options: ["30", "35", "40", "45"],
    correct: 1,
    subject: "رياضيات",
    level: "easy"
  },
  {
    id: 2,
    text: "ما هي عاصمة الأردن؟",
    options: ["إربد", "عمان", "الزرقاء", "العقبة"],
    correct: 1,
    subject: "جغرافيا",
    level: "easy"
  },
  {
    id: 3,
    text: "ما هو الغاز المسؤول عن التنفس؟",
    options: ["النيتروجين", "الأكسجين", "ثاني أكسيد الكربون", "الهيدروجين"],
    correct: 1,
    subject: "علوم",
    level: "medium"
  },
  {
    id: 4,
    text: "من هو كاتب رواية 'مدن الملح'؟",
    options: ["نجيب محفوظ", "عبد الرحمن منيف", "غسان كنفاني", "جبرا إبراهيم جبرا"],
    correct: 1,
    subject: "لغة عربية",
    level: "hard"
  },
  {
    id: 5,
    text: "ما هو حل المعادلة 2x + 6 = 14؟",
    options: ["x = 2", "x = 4", "x = 6", "x = 8"],
    correct: 1,
    subject: "رياضيات",
    level: "medium"
  },
  {
    id: 6,
    text: "في أي قارة تقع الأردن؟",
    options: ["أفريقيا", "آسيا", "أوروبا", "أمريكا"],
    correct: 1,
    subject: "جغرافيا",
    level: "easy"
  },
  {
    id: 7,
    text: "ما هي وحدة قياس القوة؟",
    options: ["الجول", "النيوتن", "الوات", "الباسكال"],
    correct: 1,
    subject: "فيزياء",
    level: "medium"
  },
  {
    id: 8,
    text: "من هو أول خليفة راشد؟",
    options: ["عمر بن الخطاب", "أبو بكر الصديق", "عثمان بن عفان", "علي بن أبي طالب"],
    correct: 1,
    subject: "تاريخ",
    level: "easy"
  },
  {
    id: 9,
    text: "ما هو الكسر المكافئ لـ 1/2؟",
    options: ["2/3", "3/6", "4/6", "5/8"],
    correct: 1,
    subject: "رياضيات",
    level: "easy"
  },
  {
    id: 10,
    text: "ما هو البحر الذي تطل عليه مدينة العقبة الأردنية؟",
    options: ["البحر المتوسط", "البحر الأحمر", "الخليج العربي", "بحر العرب"],
    correct: 1,
    subject: "جغرافيا",
    level: "medium"
  },
  {
    id: 11,
    text: "ما هي المادة الكيميائية التي يحتويها ملح الطعام؟",
    options: ["كلوريد الصوديوم", "كلوريد البوتاسيوم", "كبريتات الصوديوم", "نترات الصوديوم"],
    correct: 0,
    subject: "كيمياء",
    level: "medium"
  },
  {
    id: 12,
    text: "من هو الصحابي الذي لُقب بـ'الفاروق'؟",
    options: ["أبو بكر الصديق", "عمر بن الخطاب", "علي بن أبي طالب", "عثمان بن عفان"],
    correct: 1,
    subject: "تربية إسلامية",
    level: "easy"
  },
  {
    id: 13,
    text: "ما هو ناتج (3 + 2) × 4؟",
    options: ["14", "20", "24", "32"],
    correct: 1,
    subject: "رياضيات",
    level: "medium"
  },
  {
    id: 14,
    text: "ما هو العنصر الكيميائي الذي رمزه O؟",
    options: ["الهيدروجين", "الأكسجين", "الكربون", "النيتروجين"],
    correct: 1,
    subject: "كيمياء",
    level: "easy"
  },
  {
    id: 15,
    text: "ما هي السورة التي تُقرأ في صلاة الجمعة؟",
    options: ["سورة البقرة", "سورة الكهف", "سورة يس", "سورة الملك"],
    correct: 1,
    subject: "تربية إسلامية",
    level: "medium"
  },
  {
    id: 16,
    text: "إذا كانت سرعة السيارة 60 كم/ساعة، كم تقطع في نصف ساعة؟",
    options: ["20 كم", "30 كم", "40 كم", "50 كم"],
    correct: 1,
    subject: "رياضيات",
    level: "hard"
  },
  {
    id: 17,
    text: "ما هي عملية تحويل الماء من سائل إلى غاز؟",
    options: ["التكثف", "التبخر", "التجمد", "الذوبان"],
    correct: 1,
    subject: "علوم",
    level: "medium"
  },
  {
    id: 18,
    text: "ما هو عدد أركان الإسلام؟",
    options: ["3", "4", "5", "6"],
    correct: 2,
    subject: "تربية إسلامية",
    level: "easy"
  },
  {
    id: 19,
    text: "ما هي عاصمة فلسطين؟",
    options: ["رام الله", "القدس", "نابلس", "غزة"],
    correct: 1,
    subject: "جغرافيا",
    level: "easy"
  },
  {
    id: 20,
    text: "ما هو قانون نيوتن الثاني؟",
    options: ["F = m × a", "E = m × c²", "P = m × v", "W = F × d"],
    correct: 0,
    subject: "فيزياء",
    level: "hard"
  },
  {
    id: 21,
    text: "ما هي أكبر محافظة في الأردن من حيث المساحة؟",
    options: ["العقبة", "معان", "إربد", "الزرقاء"],
    correct: 1,
    subject: "جغرافيا",
    level: "hard"
  },
  {
    id: 22,
    text: "ما هو الرقم الهيدروجيني للماء النقي؟",
    options: ["5", "7", "9", "11"],
    correct: 1,
    subject: "كيمياء",
    level: "medium"
  },
  {
    id: 23,
    text: "من هو خال النبي صلى الله عليه وسلم؟",
    options: ["أبو طالب", "العباس", "سعد بن معاذ", "سعد بن أبي وقاص"],
    correct: 1,
    subject: "تربية إسلامية",
    level: "hard"
  },
  {
    id: 24,
    text: "ما هو جذر العدد 144؟",
    options: ["10", "11", "12", "13"],
    correct: 2,
    subject: "رياضيات",
    level: "medium"
  },
  {
    id: 25,
    text: "ما هو أطول نهر في العالم؟",
    options: ["نهر النيل", "نهر الأمازون", "نهر اليانغتسي", "نهر المسيسيبي"],
    correct: 0,
    subject: "جغرافيا",
    level: "medium"
  }
];

const StudentProgress = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [startTime] = useState(Date.now());

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      analyzeResults(newAnswers);
    }
  };

  const analyzeResults = (userAnswers: number[]) => {
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1000 / 60; // in minutes

    let correctCount = 0;
    const subjectScores: { [key: string]: { correct: number; total: number } } = {};

    questions.forEach((question, index) => {
      const subject = question.subject;
      if (!subjectScores[subject]) {
        subjectScores[subject] = { correct: 0, total: 0 };
      }
      
      subjectScores[subject].total++;
      
      if (userAnswers[index] === question.correct) {
        correctCount++;
        subjectScores[subject].correct++;
      }
    });

    const overallScore = Math.round((correctCount / questions.length) * 100);
    
    const finalSubjectScores: { [key: string]: number } = {};
    Object.keys(subjectScores).forEach(subject => {
      finalSubjectScores[subject] = Math.round(
        (subjectScores[subject].correct / subjectScores[subject].total) * 100
      );
    });

    const strengths = Object.keys(finalSubjectScores).filter(
      subject => finalSubjectScores[subject] >= 75
    );

    const weaknesses = Object.keys(finalSubjectScores).filter(
      subject => finalSubjectScores[subject] < 60
    );

    const recommendations = [
      overallScore >= 80 
        ? "أداء ممتاز! استمر في هذا المستوى" 
        : overallScore >= 60 
        ? "أداء جيد، يمكن تحسينه بالمزيد من الممارسة"
        : "يحتاج إلى مراجعة شاملة وتركيز إضافي",
      
      timeTaken < 5 
        ? "سرعة إجابة ممتازة، لكن تأكد من دقة الإجابات" 
        : "خذ وقتك الكافي في التفكير قبل الإجابة",
      
      weaknesses.length > 0 
        ? `ركز على تحسين مستواك في: ${weaknesses.join(', ')}`
        : "حافظ على مستواك المتميز في جميع المواد"
    ];

    const result: AnalysisResult = {
      strengths,
      weaknesses,
      recommendations,
      overallScore,
      subjectScores: finalSubjectScores
    };

    setAnalysis(result);
    setIsCompleted(true);

    toast({
      title: "تم إكمال التقييم",
      description: `درجتك الإجمالية: ${overallScore}%`,
    });
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setIsCompleted(false);
    setAnalysis(null);
  };

  if (!isCompleted) {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white transition-colors duration-300" dir="rtl">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <StarField starCount={200} />
        </div>
        
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-4xl">
          <Button
            onClick={() => navigate('/falak-knowledge-ai')}
            variant="ghost"
            className="text-purple-600 dark:text-indigo-400 hover:text-purple-700 dark:hover:text-indigo-300 hover:bg-purple-50 dark:hover:bg-indigo-900/30 mb-4 w-fit font-medium"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للمساعد الذكي
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 dark:bg-gradient-to-r dark:from-purple-500/20 dark:to-indigo-500/20 backdrop-blur-sm border border-purple-400/30 mb-4 shadow-sm dark:shadow-none">
              <Target className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400 mb-2">
              تقييم مستوى الطالب
            </h1>
            <p className="text-slate-600 dark:text-white/80">السؤال {currentQuestion + 1} من {questions.length}</p>
          </motion.div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-500 dark:text-white/60">التقدم</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-white/80">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="p-8 bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/80 dark:border-purple-500/20 shadow-md dark:shadow-none">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-200 rounded-full text-sm font-medium">
                  {question.subject}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  question.level === 'easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-green-600/30 dark:text-green-200' :
                  question.level === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-yellow-600/30 dark:text-yellow-200' :
                  'bg-rose-100 text-rose-700 dark:bg-red-600/30 dark:text-red-200'
                }`}>
                  {question.level === 'easy' ? 'سهل' : 
                   question.level === 'medium' ? 'متوسط' : 'صعب'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{question.text}</h2>
            </div>

            <div className="grid gap-4">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="p-4 text-right bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-800 dark:bg-gray-800/50 dark:hover:bg-purple-600/30 dark:border-gray-600/50 dark:hover:border-purple-500/50 dark:text-white rounded-xl transition-all duration-200 font-medium shadow-sm dark:shadow-none"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="ml-3 text-purple-600 dark:text-purple-300 font-bold">{String.fromCharCode(65 + index)})</span>
                  {option}
                </motion.button>
              ))}
            </div>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-right bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-white transition-colors duration-300" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={200} />
      </div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-6xl">
        <Button
          onClick={() => navigate('/falak-knowledge-ai')}
          variant="ghost"
          className="text-purple-600 dark:text-indigo-400 hover:text-purple-700 dark:hover:text-indigo-300 hover:bg-purple-50 dark:hover:bg-indigo-900/30 mb-4 w-fit font-medium"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للمساعد الذكي
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 dark:bg-gradient-to-r dark:from-green-500/20 dark:to-blue-500/20 backdrop-blur-sm border border-emerald-400/30 mb-4 shadow-sm dark:shadow-none">
            <Award className="w-10 h-10 text-emerald-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-green-400 dark:to-blue-400 mb-2">
            نتائج التقييم
          </h1>
          <p className="text-slate-600 dark:text-white/80">تحليل شامل لمستواك الأكاديمي</p>
        </motion.div>

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Score */}
            <Card className="lg:col-span-1 p-6 bg-white/95 dark:bg-gradient-to-br dark:from-green-900/30 dark:to-blue-900/30 border border-slate-200/80 dark:border-green-500/30 shadow-md dark:shadow-none">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-emerald-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">الدرجة الإجمالية</h3>
                <div className="text-5xl font-bold text-emerald-600 dark:text-green-400 mb-4">
                  {analysis.overallScore}%
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                  analysis.overallScore >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-green-600/30 dark:text-green-200' :
                  analysis.overallScore >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-yellow-600/30 dark:text-yellow-200' :
                  'bg-rose-100 text-rose-700 dark:bg-red-600/30 dark:text-red-200'
                }`}>
                  {analysis.overallScore >= 80 ? 'ممتاز' :
                   analysis.overallScore >= 60 ? 'جيد' : 'يحتاج تحسين'}
                </div>
              </div>
            </Card>

            {/* Subject Scores */}
            <Card className="lg:col-span-2 p-6 bg-white/95 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/80 dark:border-purple-500/20 shadow-md dark:shadow-none">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 ml-2 text-purple-600 dark:text-purple-400" />
                الدرجات حسب المادة
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(analysis.subjectScores).map(([subject, score]) => (
                  <div key={subject} className="p-4 bg-slate-50 dark:bg-gray-800/30 border border-slate-100 dark:border-transparent rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-800 dark:text-white font-medium">{subject}</span>
                      <span className={`font-bold ${
                        score >= 75 ? 'text-emerald-600 dark:text-green-400' :
                        score >= 50 ? 'text-amber-600 dark:text-yellow-400' : 'text-rose-600 dark:text-red-400'
                      }`}>
                        {score}%
                      </span>
                    </div>
                    <Progress 
                      value={score} 
                      className={`h-2 ${
                        score >= 75 ? '[&>div]:bg-emerald-500 dark:[&>div]:bg-green-500' :
                        score >= 50 ? '[&>div]:bg-amber-500 dark:[&>div]:bg-yellow-500' : '[&>div]:bg-rose-500 dark:[&>div]:bg-red-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <Card className="p-6 bg-emerald-50/80 dark:bg-gradient-to-br dark:from-green-900/30 dark:to-emerald-900/30 border border-emerald-200 dark:border-green-500/30 shadow-sm dark:shadow-none">
                <h3 className="text-xl font-bold text-emerald-900 dark:text-white mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 ml-2 text-emerald-600 dark:text-green-400" />
                  نقاط القوة
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center text-emerald-800 dark:text-green-200 font-medium">
                      <CheckCircle className="w-4 h-4 ml-2 text-emerald-600 dark:text-green-400" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Weaknesses */}
            {analysis.weaknesses.length > 0 && (
              <Card className="p-6 bg-rose-50/80 dark:bg-gradient-to-br dark:from-red-900/30 dark:to-orange-900/30 border border-rose-200 dark:border-red-500/30 shadow-sm dark:shadow-none">
                <h3 className="text-xl font-bold text-rose-900 dark:text-white mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 ml-2 text-rose-600 dark:text-red-400" />
                  نقاط تحتاج تحسين
                </h3>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-center text-rose-800 dark:text-red-200 font-medium">
                      <AlertCircle className="w-4 h-4 ml-2 text-rose-600 dark:text-red-400" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="p-6 bg-indigo-50/80 dark:bg-gradient-to-br dark:from-blue-900/30 dark:to-purple-900/30 border border-indigo-200 dark:border-blue-500/30 shadow-sm dark:shadow-none">
              <h3 className="text-xl font-bold text-indigo-900 dark:text-white mb-4 flex items-center">
                <Brain className="w-5 h-5 ml-2 text-indigo-600 dark:text-blue-400" />
                توصيات للتحسين
              </h3>
              <ul className="space-y-3">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-indigo-950 dark:text-blue-200 text-sm leading-relaxed font-medium">
                    • {recommendation}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={resetTest}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3"
          >
            إعادة التقييم
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentProgress;