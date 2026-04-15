import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Brain, Monitor, Cpu, Users, Heart, Dumbbell, BookOpen, Sparkles, Zap, Trophy, Star, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const STEPS = [
  'intro', 'domain', 'data', 'environment', 'awakening', 'training', 'agent', 'leaderboard', 'presentation'
] as const;
type Step = typeof STEPS[number];

const domains = [
  { id: 'education', label: '📚 تعليمي', labelEn: 'Education', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
  { id: 'health', label: '🏥 صحي', labelEn: 'Health', icon: Heart, color: 'from-green-500 to-emerald-500' },
  { id: 'personal', label: '🧠 شخصي', labelEn: 'Personal', icon: Brain, color: 'from-purple-500 to-violet-500' },
  { id: 'sports', label: '⚽ رياضي', labelEn: 'Sports', icon: Dumbbell, color: 'from-orange-500 to-red-500' },
];

const HassanGardenAI = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('intro');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [studentName, setStudentName] = useState('');
  const [interests, setInterests] = useState('');
  const [trainingData, setTrainingData] = useState('');
  const [accuracy, setAccuracy] = useState(0);
  const [trainingPhase, setTrainingPhase] = useState(0);
  const [aiQuestions, setAiQuestions] = useState<{question: string; options: string[]; correct: number}[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [agentReady, setAgentReady] = useState(false);
  const [agentChat, setAgentChat] = useState<{role: string; text: string}[]>([]);
  const [agentInput, setAgentInput] = useState('');
  const [presLang, setPresLang] = useState<'ar'|'en'>('ar');

  const stepIndex = STEPS.indexOf(step);

  const goNext = () => {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  };
  const goBack = () => {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  };

  // Simulate training progress
  const startTraining = () => {
    setAccuracy(0);
    setTrainingPhase(0);
    const phases = [15, 35, 55, 72, 88, 95];
    let i = 0;
    const interval = setInterval(() => {
      if (i < phases.length) {
        setAccuracy(phases[i]);
        setTrainingPhase(i + 1);
        i++;
      } else {
        clearInterval(interval);
        goNext();
      }
    }, 800);
  };

  // Generate AI questions
  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-puzzles', {
        body: {
          subject: selectedDomain === 'education' ? 'physics' : selectedDomain === 'health' ? 'biology' : 'mathematics',
          difficulty: 'متوسط',
          count: 4,
          topicDescription: `أسئلة تحليلية عن الذكاء الاصطناعي في مجال ${domains.find(d => d.id === selectedDomain)?.label || 'عام'} مناسبة لطالب اسمه ${studentName} يهتم بـ ${interests}. الأسئلة يجب أن تكون عن مفاهيم AI مثل: ما الهدف من النموذج؟ ما أهم عامل يؤثر على النتيجة؟ كيف نحسن الأداء؟`,
          skipImageGeneration: true
        }
      });
      
      if (data?.puzzles?.length) {
        setAiQuestions(data.puzzles.map((p: any) => ({
          question: p.question,
          options: p.options,
          correct: p.options.indexOf(p.correct_answer)
        })));
      } else {
        // Fallback questions
        setAiQuestions([
          { question: 'ما هو الهدف الرئيسي من تدريب نموذج الذكاء الاصطناعي؟', options: ['حفظ البيانات فقط', 'التعلم من الأنماط واتخاذ قرارات', 'استهلاك الطاقة', 'تخزين الصور'], correct: 1 },
          { question: 'ما أهم عامل يؤثر على دقة النموذج؟', options: ['لون الشاشة', 'جودة وكمية البيانات', 'حجم الجهاز', 'سرعة الإنترنت'], correct: 1 },
          { question: 'ماذا يحدث إذا تجاهلنا متغيراً مهماً؟', options: ['لا شيء', 'تتحسن الدقة', 'تنخفض دقة النموذج', 'يتوقف الجهاز'], correct: 2 },
          { question: 'كيف يمكن تحسين أداء النموذج؟', options: ['إيقاف التدريب', 'زيادة بيانات التدريب وضبط المعاملات', 'حذف كل البيانات', 'تجاهل الأخطاء'], correct: 1 },
        ]);
      }
    } catch {
      setAiQuestions([
        { question: 'ما هو الهدف الرئيسي من تدريب نموذج الذكاء الاصطناعي؟', options: ['حفظ البيانات فقط', 'التعلم من الأنماط واتخاذ قرارات', 'استهلاك الطاقة', 'تخزين الصور'], correct: 1 },
        { question: 'ما أهم عامل يؤثر على دقة النموذج؟', options: ['لون الشاشة', 'جودة وكمية البيانات', 'حجم الجهاز', 'سرعة الإنترنت'], correct: 1 },
        { question: 'ماذا يحدث إذا تجاهلنا متغيراً مهماً؟', options: ['لا شيء', 'تتحسن الدقة', 'تنخفض دقة النموذج', 'يتوقف الجهاز'], correct: 2 },
        { question: 'كيف يمكن تحسين أداء النموذج؟', options: ['إيقاف التدريب', 'زيادة بيانات التدريب وضبط المعاملات', 'حذف كل البيانات', 'تجاهل الأخطاء'], correct: 1 },
      ]);
    }
    setIsLoading(false);
  };

  const answerQuestion = (optionIndex: number) => {
    if (aiQuestions[currentQ]?.correct === optionIndex) {
      setScore(s => s + 25);
      setAccuracy(a => Math.min(100, a + 3));
      toast({ title: '✅ إجابة صحيحة!', description: 'أحسنت! تم تحسين دقة النموذج' });
    } else {
      toast({ title: '❌ إجابة خاطئة', description: 'حاول مرة أخرى في السؤال القادم', variant: 'destructive' });
    }
    if (currentQ < aiQuestions.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      setAgentReady(true);
      goNext();
    }
  };

  const chatWithAgent = async () => {
    if (!agentInput.trim()) return;
    const userMsg = agentInput;
    setAgentChat(c => [...c, { role: 'user', text: userMsg }]);
    setAgentInput('');
    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('generate-ai-puzzles', {
        body: {
          subject: 'mathematics',
          difficulty: 'سهل',
          count: 1,
          topicDescription: `أنت وكيل ذكاء اصطناعي اسمك "${studentName}-AI" متخصص في مجال ${domains.find(d => d.id === selectedDomain)?.label}. أجب على السؤال التالي بشكل مختصر ومفيد: ${userMsg}`,
          skipImageGeneration: true,
          returnRawResponse: true
        }
      });
      setAgentChat(c => [...c, { role: 'agent', text: data?.rawResponse || data?.puzzles?.[0]?.question || 'أنا وكيلك الذكي! اسألني أي شيء عن مجال تخصصي 🤖' }]);
    } catch {
      setAgentChat(c => [...c, { role: 'agent', text: `مرحباً! أنا ${studentName}-AI. أستطيع مساعدتك في مجال ${domains.find(d => d.id === selectedDomain)?.label}! 🤖` }]);
    }
    setIsLoading(false);
  };

  const agentId = `AG-${studentName.slice(0,3).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

  // Presentation content
  const presContent = {
    ar: [
      { title: '🎯 الفكرة العامة', text: 'يهدف قسم الذكاء الاصطناعي إلى تقديم تجربة تعليمية تفاعلية، تمكّن الطالب من فهم الذكاء الاصطناعي عملياً من خلال بناء نموذج خاص به خطوة بخطوة.' },
      { title: '🚀 رحلة الطالب', text: 'تبدأ من التعريف بالذكاء الاصطناعي → اختيار المجال → إدخال البيانات → بناء البيئة التعليمية → لحظة الإدراك → التدريب التفاعلي → إنتاج الوكيل الذكي.' },
      { title: '💡 لحظة الإدراك', text: 'المرحلة المفصلية حيث يتحول AI من مجرد مخزن معلومات إلى نظام يفهم ويحلل، مع تحول بصري من "جهاز" إلى "شخص مفكر".' },
      { title: '🤖 الوكيل الذكي', text: 'في النهاية يحصل الطالب على AI خاص باسمه، مبني على بياناته، يمكنه التفاعل معه بالسؤال والجواب.' },
      { title: '🏆 التنافس والتحفيز', text: 'نظام نقاط وترتيب وجوائز حسب الأداء، مع إمكانية العودة لتطوير النموذج ومقارنته مع نماذج أخرى.' },
      { title: '⚙️ المتطلبات التقنية', text: 'منصة ويب تفاعلية، قاعدة بيانات، نماذج AI مدرّبة مسبقاً (Pre-trained Models)، نظام توليد أسئلة، ونظام تتبع التقدم.' },
      { title: '⚠️ ملاحظة مهمة', text: 'هذا النظام يعتمد على نماذج مدرّبة مسبقاً وليس تدريب من الصفر، لأن التدريب الحقيقي يتطلب تكلفة عالية وموارد حوسبة ضخمة. الهدف تعليمي تفاعلي.' },
    ],
    en: [
      { title: '🎯 General Idea', text: 'The AI section aims to provide an interactive educational experience, enabling students to understand AI practically by building their own model step by step.' },
      { title: '🚀 Student Journey', text: 'Starts from AI introduction → domain selection → data input → learning environment → Awakening Moment → interactive training → AI Agent production.' },
      { title: '💡 Awakening Moment', text: 'The pivotal stage where AI transforms from a mere data store to a system that understands and analyzes, with a visual transition from "device" to "thinker".' },
      { title: '🤖 AI Agent', text: 'At the end, the student gets a personalized AI named after them, built on their data, capable of Q&A interaction.' },
      { title: '🏆 Competition & Motivation', text: 'Points, rankings, and awards based on performance, with the ability to return and improve the model and compare with others.' },
      { title: '⚙️ Technical Requirements', text: 'Interactive web platform, database, pre-trained AI models, question generation system, and progress tracking system.' },
      { title: '⚠️ Important Note', text: 'This system relies on pre-trained models, not training from scratch, as real training requires high costs and massive computing resources. The goal is interactive education.' },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-gray-950 text-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-violet-500/20 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white/70 hover:text-white">
            <ArrowRight className="w-4 h-4 ml-1" /> الرئيسية
          </Button>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
            🤖 حديقة الحسن - الذكاء الاصطناعي
          </h1>
          <div className="text-xs text-white/50">{stepIndex + 1}/{STEPS.length}</div>
        </div>
        {/* Progress bar */}
        <div className="max-w-5xl mx-auto mt-2">
          <Progress value={((stepIndex + 1) / STEPS.length) * 100} className="h-1.5 bg-gray-800" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: INTRO */}
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="text-center space-y-8">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="mx-auto w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <Monitor className="w-16 h-16 text-white" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold">مرحباً بك في عالم الذكاء الاصطناعي!</h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                هل تساءلت يوماً كيف يفكر الذكاء الاصطناعي؟ 🤔<br/>
                في هذه الرحلة التفاعلية، ستبني نموذج AI خاص بك خطوة بخطوة!
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {[
                  { icon: '📊', label: 'أدخل بياناتك' },
                  { icon: '🧠', label: 'درّب النموذج' },
                  { icon: '🤖', label: 'أنشئ وكيلك الذكي' },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.2 }} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-sm text-white/80">{item.label}</div>
                  </motion.div>
                ))}
              </div>
              <Button onClick={goNext} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-8 py-3 text-lg rounded-xl hover:shadow-xl hover:shadow-violet-500/30 transition-all">
                ابدأ الرحلة <Sparkles className="w-5 h-5 mr-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: DOMAIN SELECTION */}
          {step === 'domain' && (
            <motion.div key="domain" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3">اختر مجال نموذجك</h2>
                <p className="text-white/60">في أي مجال تريد أن يتخصص ذكاؤك الاصطناعي؟</p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                {domains.map(d => (
                  <motion.div key={d.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDomain(d.id)}
                    className={`cursor-pointer rounded-2xl p-6 text-center border-2 transition-all ${selectedDomain === d.id ? 'border-violet-400 bg-violet-500/20 shadow-lg shadow-violet-500/20' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                    <d.icon className="w-10 h-10 mx-auto mb-3 text-white" />
                    <div className="text-lg font-bold">{d.label}</div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between max-w-lg mx-auto">
                <Button variant="ghost" onClick={goBack} className="text-white/60"><ArrowRight className="w-4 h-4 ml-1" /> رجوع</Button>
                <Button onClick={goNext} disabled={!selectedDomain} className="bg-gradient-to-r from-violet-500 to-fuchsia-500">التالي <ArrowLeft className="w-4 h-4 mr-1" /></Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: DATA INPUT */}
          {step === 'data' && (
            <motion.div key="data" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-6 max-w-lg mx-auto">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3">أدخل بيانات التدريب</h2>
                <p className="text-white/60">هذه البيانات ستُستخدم لتدريب نموذجك الخاص</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">اسمك</label>
                  <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="أدخل اسمك..." className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">اهتماماتك</label>
                  <Input value={interests} onChange={e => setInterests(e.target.value)} placeholder="مثل: البرمجة، الرياضيات، الفن..." className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">بيانات التدريب (اختياري)</label>
                  <textarea value={trainingData} onChange={e => setTrainingData(e.target.value)} placeholder="أدخل أي بيانات إضافية مثل: درجاتك، عاداتك، أهدافك..." className="w-full min-h-[100px] rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 p-3 text-sm" />
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={goBack} className="text-white/60"><ArrowRight className="w-4 h-4 ml-1" /> رجوع</Button>
                <Button onClick={goNext} disabled={!studentName.trim()} className="bg-gradient-to-r from-violet-500 to-fuchsia-500">بدء التدريب <Zap className="w-4 h-4 mr-1" /></Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ENVIRONMENT / TRAINING PROGRESS */}
          {step === 'environment' && (
            <motion.div key="env" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-8 max-w-lg mx-auto text-center">
              <h2 className="text-3xl font-bold">البيئة التعليمية</h2>
              <p className="text-white/60">جاري تحليل بياناتك وبناء نموذجك...</p>

              <motion.div animate={{ rotate: accuracy < 95 ? [0, 360] : 0 }} transition={{ duration: 2, repeat: accuracy < 95 ? Infinity : 0, ease: 'linear' }}
                className="mx-auto w-28 h-28 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl">
                <Cpu className="w-14 h-14 text-white" />
              </motion.div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">دقة النموذج</span>
                  <span className="text-violet-400 font-bold">{accuracy}%</span>
                </div>
                <Progress value={accuracy} className="h-3 bg-gray-800" />
                <div className="text-sm text-white/50">المرحلة {trainingPhase} من 6</div>
              </div>

              {accuracy === 0 && (
                <Button onClick={startTraining} className="bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8">
                  🚀 ابدأ التدريب
                </Button>
              )}
              {accuracy >= 95 && (
                <div className="text-green-400 font-bold text-lg">✅ اكتمل التدريب الأساسي!</div>
              )}
            </motion.div>
          )}

          {/* STEP 5: AWAKENING MOMENT */}
          {step === 'awakening' && (
            <motion.div key="awaken" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-8">
              <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500">
                ⚡ لحظة الإدراك - Awakening Moment
              </motion.h2>
              <p className="text-white/70 text-lg">نموذجك يتحول الآن من مخزن بيانات... إلى نظام يفهم ويحلل!</p>

              <div className="flex items-center justify-center gap-8 my-8">
                <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0.3 }} transition={{ delay: 2 }} className="text-center">
                  <div className="w-24 h-24 rounded-2xl bg-gray-700 flex items-center justify-center mb-2">
                    <Monitor className="w-12 h-12 text-gray-400" />
                  </div>
                  <span className="text-sm text-white/50">جهاز عادي</span>
                </motion.div>

                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5 }} className="text-4xl">→</motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.5, type: 'spring' }} className="text-center">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-2 shadow-xl shadow-violet-500/40">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <span className="text-sm text-violet-300 font-bold">مفكر ذكي!</span>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }} className="space-y-3">
                <p className="text-white/60">الآن يستطيع نموذجك: التوقع 📈 | الإجابة 💬 | التحليل 🔍</p>
                <Button onClick={() => { generateQuestions(); goNext(); }} className="bg-gradient-to-r from-amber-500 to-orange-500 px-8">
                  ابدأ التدريب التفاعلي <Sparkles className="w-4 h-4 mr-1" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 6: INTERACTIVE TRAINING */}
          {step === 'training' && (
            <motion.div key="training" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-lg mx-auto">
              <h2 className="text-2xl font-bold text-center">🧪 التدريب التفاعلي</h2>
              <p className="text-white/60 text-center text-sm">كل إجابة تؤثر على دقة وسلوك نموذجك!</p>

              <div className="flex justify-between text-sm text-white/50">
                <span>النقاط: <span className="text-violet-400 font-bold">{score}</span></span>
                <span>الدقة: <span className="text-green-400 font-bold">{accuracy}%</span></span>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Cpu className="w-12 h-12 text-violet-400 mx-auto" />
                  </motion.div>
                  <p className="text-white/60 mt-4">جاري توليد الأسئلة بالذكاء الاصطناعي...</p>
                </div>
              ) : aiQuestions.length > 0 ? (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6 space-y-4">
                    <div className="text-xs text-white/40 mb-2">السؤال {currentQ + 1} من {aiQuestions.length}</div>
                    <h3 className="text-lg font-bold text-white">{aiQuestions[currentQ]?.question}</h3>
                    <div className="space-y-2">
                      {aiQuestions[currentQ]?.options.map((opt, i) => (
                        <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => answerQuestion(i)}
                          className="w-full text-right p-3 rounded-xl bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-400/50 transition-all text-white/80 text-sm">
                          {opt}
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8">
                  <Button onClick={generateQuestions} className="bg-gradient-to-r from-violet-500 to-fuchsia-500">
                    توليد الأسئلة <Brain className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 7: AI AGENT */}
          {step === 'agent' && (
            <motion.div key="agent" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-lg mx-auto">
              <div className="text-center space-y-4">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/40">
                  <Brain className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold">🎉 وكيلك الذكي جاهز!</h2>
                <p className="text-violet-300 font-semibold text-xl">{studentName}-AI</p>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                  <div className="text-sm text-white/60">معرّف الوكيل: <span className="font-mono text-violet-400">{agentId}</span></div>
                  <div className="text-sm text-white/60">الدقة: <span className="text-green-400">{accuracy}%</span></div>
                  <div className="text-sm text-white/60">النقاط: <span className="text-amber-400">{score}</span></div>
                  <div className="text-sm text-white/60">التخصص: {domains.find(d => d.id === selectedDomain)?.label}</div>
                </div>
              </div>

              {/* Chat */}
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="p-3 bg-violet-500/10 border-b border-white/10 text-sm font-bold text-center">💬 تحدث مع وكيلك</div>
                <div className="h-48 overflow-y-auto p-3 space-y-2">
                  {agentChat.length === 0 && <p className="text-white/30 text-center text-sm mt-8">اسأل وكيلك أي سؤال...</p>}
                  {agentChat.map((m, i) => (
                    <div key={i} className={`text-sm p-2 rounded-lg max-w-[80%] ${m.role === 'user' ? 'bg-violet-500/20 mr-auto' : 'bg-white/10 ml-auto'}`}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-white/10 flex gap-2">
                  <Input value={agentInput} onChange={e => setAgentInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && chatWithAgent()} placeholder="اكتب سؤالك..." className="bg-white/10 border-white/20 text-white text-sm placeholder:text-white/40" />
                  <Button onClick={chatWithAgent} disabled={isLoading} size="sm" className="bg-violet-500">إرسال</Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={goBack} className="text-white/60"><ArrowRight className="w-4 h-4 ml-1" /> رجوع</Button>
                <Button onClick={goNext} className="bg-gradient-to-r from-violet-500 to-fuchsia-500">لوحة المتصدرين <Trophy className="w-4 h-4 mr-1" /></Button>
              </div>
            </motion.div>
          )}

          {/* STEP 8: LEADERBOARD */}
          {step === 'leaderboard' && (
            <motion.div key="leader" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-lg mx-auto">
              <h2 className="text-3xl font-bold text-center">🏆 لوحة المتصدرين</h2>
              <div className="space-y-3">
                {[
                  { name: `${studentName}-AI`, score, accuracy, isYou: true },
                  { name: 'أحمد-AI', score: 85, accuracy: 92, isYou: false },
                  { name: 'سارة-AI', score: 70, accuracy: 88, isYou: false },
                  { name: 'محمد-AI', score: 60, accuracy: 85, isYou: false },
                ].sort((a, b) => b.score - a.score).map((entry, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${entry.isYou ? 'bg-violet-500/20 border-violet-400/50' : 'bg-white/5 border-white/10'}`}>
                    <div className="text-2xl font-bold text-white/30 w-8">{i + 1}</div>
                    <div className="flex-1">
                      <div className="font-bold text-white">{entry.name} {entry.isYou && '⭐'}</div>
                      <div className="text-xs text-white/50">دقة: {entry.accuracy}%</div>
                    </div>
                    <div className="text-lg font-bold text-amber-400">{entry.score} نقطة</div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={goBack} className="text-white/60"><ArrowRight className="w-4 h-4 ml-1" /> رجوع</Button>
                <Button onClick={goNext} className="bg-gradient-to-r from-violet-500 to-fuchsia-500">العرض التقديمي <Globe className="w-4 h-4 mr-1" /></Button>
              </div>
            </motion.div>
          )}

          {/* STEP 9: PRESENTATION */}
          {step === 'presentation' && (
            <motion.div key="pres" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">📋 العرض التقديمي للمشروع</h2>
                <p className="text-white/60">تصوّر حديقة الحسن للعلوم - قسم الذكاء الاصطناعي التفاعلي</p>
                <div className="flex justify-center gap-2">
                  <Button onClick={() => setPresLang('ar')} variant={presLang === 'ar' ? 'default' : 'ghost'} size="sm" className={presLang === 'ar' ? 'bg-violet-500' : 'text-white/60'}>عربي</Button>
                  <Button onClick={() => setPresLang('en')} variant={presLang === 'en' ? 'default' : 'ghost'} size="sm" className={presLang === 'en' ? 'bg-violet-500' : 'text-white/60'}>English</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir={presLang === 'en' ? 'ltr' : 'rtl'}>
                {presContent[presLang].map((slide, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-violet-400/30 transition-all">
                    <h3 className="text-lg font-bold text-violet-300 mb-3">{slide.title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{slide.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Ideas section */}
              <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-2xl p-6 border border-violet-400/20">
                <h3 className="text-xl font-bold text-violet-300 mb-4">💡 أفكار مقترحة للتطوير</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    '🏅 نظام شارات - مكافآت عند إكمال النماذج',
                    '⚔️ تحدي بين الطلاب - مسابقة أسبوعية',
                    '🎨 معرض النماذج - عرض وتقييم من الزملاء',
                    '📄 تصدير PDF - تقرير احترافي للرحلة',
                    '📚 ربط بالمواد - كل مجال مرتبط بمادة دراسية',
                    '🧬 محاكاة الشبكة العصبية - عرض بصري تفاعلي',
                    '👨‍🏫 وضع المعلم - متابعة تقدم الطلاب',
                  ].map((idea, i) => (
                    <div key={i} className="text-sm text-white/70 bg-white/5 rounded-lg p-3">{idea}</div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={goBack} className="text-white/60"><ArrowRight className="w-4 h-4 ml-1" /> رجوع</Button>
                <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-violet-500 to-fuchsia-500">العودة للرئيسية</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HassanGardenAI;
