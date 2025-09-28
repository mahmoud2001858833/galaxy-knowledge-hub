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
      <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-indigo-950 via-purple-900 to-black" dir="rtl">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <StarField starCount={200} />
        </div>
        
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-4xl">
          <Button
            onClick={() => navigate('/falak-knowledge-ai')}
            variant="ghost"
            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 mb-4 w-fit"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للمساعد الذكي
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-sm border border-purple-400/30 mb-4">
              <Target className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2">
              تقييم مستوى الطالب
            </h1>
            <p className="text-white/80">السؤال {currentQuestion + 1} من {questions.length}</p>
          </motion.div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-white/60">التقدم</span>
              <span className="text-sm text-white/80">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="p-8 bg-black/20 backdrop-blur-sm border-purple-500/20">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm">
                  {question.subject}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  question.level === 'easy' ? 'bg-green-600/30 text-green-200' :
                  question.level === 'medium' ? 'bg-yellow-600/30 text-yellow-200' :
                  'bg-red-600/30 text-red-200'
                }`}>
                  {question.level === 'easy' ? 'سهل' : 
                   question.level === 'medium' ? 'متوسط' : 'صعب'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-6">{question.text}</h2>
            </div>

            <div className="grid gap-4">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="p-4 text-right bg-gray-800/50 hover:bg-purple-600/30 border border-gray-600/50 hover:border-purple-500/50 rounded-lg text-white transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="ml-3 text-purple-300">{String.fromCharCode(65 + index)})</span>
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
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-indigo-950 via-purple-900 to-black" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={200} />
      </div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-6xl">
        <Button
          onClick={() => navigate('/falak-knowledge-ai')}
          variant="ghost"
          className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 mb-4 w-fit"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للمساعد الذكي
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-400/30 mb-4">
            <Award className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2">
            نتائج التقييم
          </h1>
          <p className="text-white/80">تحليل شامل لمستواك الأكاديمي</p>
        </motion.div>

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overall Score */}
            <Card className="lg:col-span-1 p-6 bg-gradient-to-br from-green-900/30 to-blue-900/30 border-green-500/30">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">الدرجة الإجمالية</h3>
                <div className="text-5xl font-bold text-green-400 mb-4">
                  {analysis.overallScore}%
                </div>
                <div className={`px-4 py-2 rounded-full text-sm ${
                  analysis.overallScore >= 80 ? 'bg-green-600/30 text-green-200' :
                  analysis.overallScore >= 60 ? 'bg-yellow-600/30 text-yellow-200' :
                  'bg-red-600/30 text-red-200'
                }`}>
                  {analysis.overallScore >= 80 ? 'ممتاز' :
                   analysis.overallScore >= 60 ? 'جيد' : 'يحتاج تحسين'}
                </div>
              </div>
            </Card>

            {/* Subject Scores */}
            <Card className="lg:col-span-2 p-6 bg-black/20 backdrop-blur-sm border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 ml-2" />
                الدرجات حسب المادة
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(analysis.subjectScores).map(([subject, score]) => (
                  <div key={subject} className="p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{subject}</span>
                      <span className={`font-bold ${
                        score >= 75 ? 'text-green-400' :
                        score >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {score}%
                      </span>
                    </div>
                    <Progress 
                      value={score} 
                      className={`h-2 ${
                        score >= 75 ? '[&>div]:bg-green-500' :
                        score >= 50 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <Card className="p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 ml-2 text-green-400" />
                  نقاط القوة
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center text-green-200">
                      <CheckCircle className="w-4 h-4 ml-2 text-green-400" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Weaknesses */}
            {analysis.weaknesses.length > 0 && (
              <Card className="p-6 bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 ml-2 text-red-400" />
                  نقاط تحتاج تحسين
                </h3>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-center text-red-200">
                      <AlertCircle className="w-4 h-4 ml-2 text-red-400" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Recommendations */}
            <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Brain className="w-5 h-5 ml-2 text-blue-400" />
                توصيات للتحسين
              </h3>
              <ul className="space-y-3">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-blue-200 text-sm leading-relaxed">
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