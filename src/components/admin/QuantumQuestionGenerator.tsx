import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BrainCircuit, 
  FileText, 
  Download, 
  Copy, 
  Check, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Award, 
  Layers, 
  Zap, 
  Printer, 
  Play, 
  RotateCcw,
  Sliders,
  ChevronDown,
  Key,
  Wifi,
  RefreshCw,
  Eye,
  ShieldCheck,
  Timer,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { auditLogger } from '@/services/auditLogger';
import { 
  aiExamService, 
  type BloomLevel, 
  type QuestionType, 
  type GeneratedQuestion, 
  type FullExamStructure 
} from '@/services/aiExamService';

export const BLOOM_LEVELS: { id: BloomLevel; label: string; desc: string; color: string }[] = [
  { id: 'remember', label: 'تذكّر (Remember)', desc: 'استرجاع الحقائق والقوانين والمفاهيم الأساسية', color: 'from-blue-500 to-indigo-600' },
  { id: 'understand', label: 'فهم (Understand)', desc: 'تفسير الظواهر والمقارنة بين المفاهيم', color: 'from-cyan-500 to-blue-600' },
  { id: 'apply', label: 'تطبيق (Apply)', desc: 'استخدام القوانين في سياقات ومسائل جديدة', color: 'from-emerald-500 to-teal-600' },
  { id: 'analyze', label: 'تحليل (Analyze)', desc: 'تفكيك المسألة واستنتاج العلاقات والرسوم البيانية', color: 'from-amber-500 to-orange-600' },
  { id: 'evaluate', label: 'تقييم (Evaluate)', desc: 'إصدار أحكام ونقد الفرضيات والنتائج التجريبية', color: 'from-purple-500 to-pink-600' },
  { id: 'create', label: 'ابتكار (Create)', desc: 'تصميم تجربة أو ابتكار حل علمي غير تقليدي', color: 'from-rose-500 to-red-600' }
];

export const QuantumQuestionGenerator: React.FC = () => {
  // Engine & API Key State
  const [apiKey, setApiKey] = useState<string>(() => aiExamService.getConfig().apiKey);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [isKeyTesting, setIsKeyTesting] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{ connected: boolean; latency?: number; message: string }>({
    connected: true,
    latency: 18,
    message: 'المفتاح ak_live_ نشط ومدعوم بأعلى دقة توليد'
  });

  // Mode Selection: 'questions' vs 'full_exam'
  const [activeMode, setActiveMode] = useState<'questions' | 'full_exam'>('questions');

  // Question Generator Parameters
  const [subject, setSubject] = useState('الفيزياء الحديثة والكلاسيكية');
  const [targetLevel, setTargetLevel] = useState('الثانوية العامة (التوجيهي الأردني)');
  const [bloom, setBloom] = useState<BloomLevel>('analyze');
  const [qType, setQType] = useState<QuestionType>('mcq');
  const [count, setCount] = useState(4);
  const [topic, setTopic] = useState('ميكانيكا الكم: ظاهرة التأثير الكهروضوئي ومعادلة أينشتاين');
  const [additionalNotes, setAdditionalNotes] = useState('التركيز على دالة الشغل، تردد العتبة، وجهد الإيقاف مع تبرير الخيارات الخاطئة والرموز اللاتينية');
  
  // Exam Generator Parameters
  const [examDuration, setExamDuration] = useState(90);
  const [examTotalMarks, setExamTotalMarks] = useState(100);

  // Results State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [generatedExam, setGeneratedExam] = useState<FullExamStructure | null>(null);

  // Interactive Solver State
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Test Key Connection on Mount
  useEffect(() => {
    handleTestKey();
  }, []);

  const handleTestKey = async () => {
    setIsKeyTesting(true);
    const res = await aiExamService.testConnection();
    setKeyStatus({
      connected: res.success,
      latency: res.latencyMs,
      message: res.message
    });
    setIsKeyTesting(false);
  };

  const handleSaveApiKey = () => {
    aiExamService.saveConfig({ apiKey });
    toast.success('تم حفظ وتحديث مفتاح خدمة التوليد بنجاح!');
    handleTestKey();
  };

  // Generate Questions
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const questions = await aiExamService.generateQuestions({
        subject,
        targetLevel,
        bloom,
        qType,
        count,
        topic,
        additionalNotes
      });

      setGeneratedQuestions(questions);
      setUserAnswers({});
      setScoreSubmitted(false);

      auditLogger.record({
        action: 'AI_QUERY',
        module: 'Quantum Question Generator 2.0',
        description: `توليد ${questions.length} أسئلة علمية ذكية بمستوى بلوم (${bloom}) لموضوع (${topic})`,
        user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
        severity: 'info'
      });

      toast.success(`تم توليد ${questions.length} أسئلة علمية عالية الدقة بنجاح 🚀`);
    } catch {
      toast.error('تعذر إكمال التوليد، يرجى المحاولة ثانية');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Full Official Exam
  const handleGenerateOfficialExam = async () => {
    setIsGenerating(true);
    try {
      const exam = await aiExamService.generateOfficialExam({
        subject,
        gradeLevel: targetLevel,
        topic,
        durationMinutes: examDuration,
        totalMarks: examTotalMarks
      });

      setGeneratedExam(exam);
      setGeneratedQuestions(exam.sections.flatMap(s => s.questions));
      setUserAnswers({});
      setScoreSubmitted(false);

      auditLogger.record({
        action: 'AI_QUERY',
        module: 'Official Exam Generator',
        description: `توليد ورقة امتحان وزاري متكامل لمادة ${subject} (${examTotalMarks} علامة)`,
        user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
        severity: 'info'
      });

      toast.success('تم توليد ورقة الامتحان الوزاري المتكاملة بنجاح 📄');
    } catch {
      toast.error('حدث خطأ أثناء إعداد الامتحان');
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Questions to Clipboard
  const handleCopyQuestions = () => {
    if (generatedQuestions.length === 0) return;
    const text = generatedQuestions
      .map((q, idx) => {
        const bloomInfo = BLOOM_LEVELS.find((b) => b.id === q.bloomLevel)?.label;
        let str = `السؤال ${idx + 1} [${bloomInfo}] (${q.points} درجات):\n${q.questionText}\n`;
        if (q.options) {
          str += q.options.map((o) => `  ${o.label}) ${o.text}`).join('\n') + '\n';
        }
        str += `الإجابة الصحيحة: ${q.correctAnswer}\n`;
        str += `التبرير العلمي: ${q.rationale}\n`;
        if (q.steps) {
          str += `خطوات الحل:\n` + q.steps.join('\n') + '\n';
        }
        if (q.rubric) {
          str += `سلم التصحيح:\n` + q.rubric.join('\n') + '\n';
        }
        return str;
      })
      .join('\n--------------------------------------------------\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('تم نسخ كافة الأسئلة بتنسيق كامل إلى الحافظة!');
  };

  // Print Formatted Exam Paper
  const handlePrint = () => {
    window.print();
  };

  // Calculate score in interactive mode
  const totalPoints = generatedQuestions.reduce((acc, q) => acc + q.points, 0);
  const earnedPoints = generatedQuestions.reduce((acc, q) => {
    if (q.type === 'mcq' && q.options) {
      const selected = userAnswers[q.id];
      const correctOpt = q.options.find(o => o.isCorrect);
      if (selected && correctOpt && selected === correctOpt.label) {
        return acc + q.points;
      }
    } else if (q.type === 'true_false') {
      if (userAnswers[q.id] === q.correctAnswer) {
        return acc + q.points;
      }
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6 font-sans print:p-0" dir="rtl">
      {/* 1. Header Banner & Live Service Integration Badge */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-purple-600/10 border border-cyan-500/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1.5 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-bold border border-cyan-400/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>نظام الذكاء الاصطناعي لتوليد الامتحانات وبنوك الأسئلة 2.0</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            مولد الامتحانات والأسئلة الذكي عالي الدقة (Quantum Pedagogic Engine)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            منظومة مدعومة بمفتاح الذكاء الاصطناعي المباشر لتصميم امتحانات نموذجية بمستويات بلوم المعرفية، أسئلة موضوعية ومسائل حسابية مفصلة مع خطوات الحل وسلالم التصحيح.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            variant="outline"
            size="sm"
            className="rounded-2xl text-xs gap-1.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>إعدادات المفتاح والمزود</span>
          </Button>

          <Button
            onClick={() => setInteractiveMode(!interactiveMode)}
            variant="outline"
            size="sm"
            className={`rounded-2xl text-xs font-bold gap-1.5 ${
              interactiveMode ? 'bg-purple-500/20 text-purple-600 border-purple-400/30' : ''
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {interactiveMode ? 'إلغاء وضع المحاكاة' : 'وضع الاختبار التفاعلي'}
          </Button>
        </div>
      </div>

      {/* 2. API Key & Provider Live Status Panel */}
      <AnimatePresence>
        {showKeyConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/30 shadow-md space-y-4 print:hidden overflow-hidden"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  المفتاح النشط ومزود الذكاء الاصطناعي
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  keyStatus.connected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${keyStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {keyStatus.message}
                </span>

                <Button
                  onClick={handleTestKey}
                  disabled={isKeyTesting}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2 text-cyan-600 gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isKeyTesting ? 'animate-spin' : ''}`} />
                  <span>فحص الاتصال</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  مفتاح الـ API المشغل للخدمة (Active Live Key):
                </label>
                <div className="relative">
                  <Input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="ak_live_..."
                    className="h-10 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 pl-24"
                    dir="ltr"
                  />
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold font-mono">
                      ak_live ✓
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex items-end">
                <Button
                  onClick={handleSaveApiKey}
                  className="w-full h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  حفظ وتفعيل المفتاح فورياً
                </Button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              المفتاح مفعل ويعمل بأعلى جاهزية لإنشاء الامتحانات الوزارية وتوليد بنوك الأسئلة مع دعم خطوات الحل وسلالم التصحيح النموذجية.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Mode Toggle (Bloom Bank vs Full Ministerial Exam Paper) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 max-w-md print:hidden">
        <button
          onClick={() => setActiveMode('questions')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'questions'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>توليد بنك أسئلة متخصص (بلوم)</span>
        </button>

        <button
          onClick={() => setActiveMode('full_exam')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'full_exam'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>توليد ورقة امتحان رسمي متكامل</span>
        </button>
      </div>

      {/* 4. Main Configuration & Output Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        
        {/* Left Form: Parameters (Hidden on Print) */}
        <div className="lg:col-span-5 space-y-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <span>
              {activeMode === 'questions' ? 'معايير بنك الأسئلة المولد' : 'بيانات ورقة الامتحان الوزاري'}
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">المادة الدراسية:</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="الفيزياء الحديثة والكلاسيكية">الفيزياء الحديثة والكلاسيكية</option>
                <option value="الكيمياء الحركية والعضوية">الكيمياء الحركية والعضوية</option>
                <option value="العلوم الحياتية والوراثة">العلوم الحياتية والوراثة</option>
                <option value="الرياضيات المتقدمة والتفاضل">الرياضيات المتقدمة والتفاضل</option>
                <option value="تكنولوجيا المعلومات وBTEC">تكنولوجيا المعلومات BTEC</option>
                <option value="الروبوتات والذكاء الاصطناعي">الروبوتات والذكاء الاصطناعي</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">المستوى المستهدف:</label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="w-full text-xs h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              >
                <option value="الثانوية العامة (التوجيهي الأردني)">التوجيهي الأردني (الثانوية العامة)</option>
                <option value="الصف العاشر الأساسي">الصف العاشر الأساسي</option>
                <option value="مسار Pearson BTEC الدولي">مسار Pearson BTEC الدولي</option>
                <option value="أولمبياد العلوم الوطني">أولمبياد العلوم الوطني</option>
              </select>
            </div>
          </div>

          {activeMode === 'questions' ? (
            <>
              {/* Bloom Taxonomy Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>المستوى المعرفي (هرم بلوم):</span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-normal">
                    {BLOOM_LEVELS.find((b) => b.id === bloom)?.desc}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BLOOM_LEVELS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBloom(b.id)}
                      className={`p-2 rounded-xl text-[11px] font-bold transition-all border text-center ${
                        bloom === b.id
                          ? 'bg-gradient-to-r ' + b.color + ' text-white shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {b.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Type and Count */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نمط الأسئلة:</label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as QuestionType)}
                    className="w-full text-xs h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="mcq">اختيار من متعدد (مع تبرير البدائل)</option>
                    <option value="calculation">مسألة حسابية تفصيلية بالخطوات</option>
                    <option value="true_false">صح / خطأ مع تصحيح العبارة</option>
                    <option value="analytical">سؤال مقالي مع سلم تصحيح (Rubric)</option>
                    <option value="all_mixed">حزمة متنوعة وشاملة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">العدد المطلوب:</label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                    className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">مدة الامتحان (بالدقائق):</label>
                <Input
                  type="number"
                  min={30}
                  max={180}
                  value={examDuration}
                  onChange={(e) => setExamDuration(parseInt(e.target.value) || 90)}
                  className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">العلامة الكلية:</label>
                <Input
                  type="number"
                  min={20}
                  max={200}
                  value={examTotalMarks}
                  onChange={(e) => setExamTotalMarks(parseInt(e.target.value) || 100)}
                  className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>
          )}

          {/* Topic & Specific Notes */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الموضوع أو الوحدة الدراسية:</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: الحث الكهرومغناطيسي، الاتزان الأيوني، الوراثة المندلية..."
              className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">تعليمات وتوجيهات للمعلم:</label>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="مثال: تضمين حسابات دقيقة، ربط الأسئلة بمختبرات المنصة الـ 49، تضمين معادلات..."
              className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[60px]"
            />
          </div>

          {/* Generation Trigger Button */}
          <Button
            onClick={activeMode === 'questions' ? handleGenerateQuestions : handleGenerateOfficialExam}
            disabled={isGenerating}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-cyan-500/20"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 animate-spin" />
                جاري المعالجة والتوليد الذكي بدقة متناهية...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {activeMode === 'questions' 
                  ? 'توليد الأسئلة فورياً بنظام بلوم الذكي' 
                  : 'توليد ورقة الامتحان الوزاري المتكاملة'}
              </span>
            )}
          </Button>
        </div>

        {/* Right Output: Questions Feed / Printable Official Exam */}
        <div className="lg:col-span-7 space-y-4 print:w-full">
          
          {/* Top Actions Bar (Hidden on Print) */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeMode === 'full_exam' && generatedExam 
                  ? `${generatedExam.examTitle} (${generatedExam.totalMarks} علامة)` 
                  : `حصيلة الأسئلة المولدة (${generatedQuestions.length})`}
              </h3>
            </div>

            {generatedQuestions.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopyQuestions}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'تم النسخ' : 'نسخ الأسئلة'}
                </Button>

                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1 text-cyan-600 dark:text-cyan-400 border-cyan-400/30"
                >
                  <Printer className="w-3.5 h-3.5" />
                  طباعة الورقة الامتحانية
                </Button>
              </div>
            )}
          </div>

          {/* Interactive Mode Score Banner */}
          {interactiveMode && generatedQuestions.length > 0 && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs print:hidden">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-purple-900 dark:text-purple-200">
                  وضع الاختبار التفاعلي الذكي:
                </span>
                <span>اختر إجاباتك لمعرفة نتيجتك الفورية وتفسيرات الإجابات</span>
              </div>

              {scoreSubmitted && (
                <div className="font-black text-sm text-purple-700 dark:text-purple-300">
                  النتيجة: {earnedPoints} من {totalPoints} درجة ({Math.round((earnedPoints / (totalPoints || 1)) * 100)}%)
                </div>
              )}
            </div>
          )}

          {/* Official Ministerial Header (Visible on Full Exam & Print) */}
          {(activeMode === 'full_exam' || window.matchMedia('print').matches) && generatedExam && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 print:border-black print:shadow-none print:p-4">
              <div className="text-center space-y-1 pb-4 border-b border-slate-300 dark:border-slate-700 print:border-black">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 print:text-black">
                  المملكة الأردنية الهاشمية &bull; وزارة التربية والتعليم
                </div>
                <div className="text-xs font-bold text-slate-500 print:text-black">
                  مديرية التربية والتعليم للواء المزار الشمالي &bull; {generatedExam.schoolName}
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white print:text-black pt-1">
                  {generatedExam.examTitle} للعام الدراسي {generatedExam.academicYear}
                </h2>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 print:text-black flex justify-center gap-6 pt-1">
                  <span>المبحث: <strong>{generatedExam.subject}</strong></span>
                  <span>المستوى: <strong>{generatedExam.gradeLevel}</strong></span>
                  <span>الزمن: <strong>{generatedExam.durationMinutes} دقيقة</strong></span>
                  <span>العلامة الكلية: <strong>{generatedExam.totalMarks} علامة</strong></span>
                </div>
              </div>

              {/* Student Metadata Box */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs print:border-black print:bg-white">
                <div>اسم الطالب: ___________________________</div>
                <div>الشعبة / رقم الجلوس: ___________________</div>
              </div>

              {/* Exam Instructions */}
              <div className="text-[11px] text-slate-500 print:text-black space-y-0.5">
                <strong className="text-slate-700 dark:text-slate-300 print:text-black">تعليمات الاختبار: </strong>
                {generatedExam.instructions.join(' • ')}
              </div>
            </div>
          )}

          {/* Questions Feed */}
          {generatedQuestions.length > 0 ? (
            <div className="space-y-4">
              {generatedQuestions.map((q, idx) => {
                const bloomInfo = BLOOM_LEVELS.find((b) => b.id === q.bloomLevel);
                const userAnswer = userAnswers[q.id];
                const isAnswered = Boolean(userAnswer);

                return (
                  <div
                    key={q.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 print:p-3 print:border-black print:shadow-none print:break-inside-avoid"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-black text-xs flex items-center justify-center border border-cyan-500/20 print:border-black print:text-black">
                          {idx + 1}
                        </span>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full bg-gradient-to-r ${bloomInfo?.color} text-white shadow-sm print:hidden`}>
                          {bloomInfo?.label}
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold print:text-black">
                          {q.points} علامات
                        </span>
                      </div>
                    </div>

                    {/* Question Text */}
                    <p className="text-sm font-bold text-slate-900 dark:text-white print:text-black leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* Formula if available */}
                    {q.latexFormula && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-mono text-xs text-cyan-600 dark:text-cyan-400 print:text-black print:border-black" dir="ltr">
                        {q.latexFormula}
                      </div>
                    )}

                    {/* MCQ Options */}
                    {q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt) => {
                          const isSelected = userAnswer === opt.label;
                          const showCorrectness = interactiveMode && isAnswered;

                          return (
                            <div
                              key={opt.label}
                              onClick={() => {
                                if (interactiveMode) {
                                  setUserAnswers((prev) => ({ ...prev, [q.id]: opt.label }));
                                }
                              }}
                              className={`p-3 rounded-2xl border text-xs sm:text-sm font-medium transition-all ${
                                interactiveMode ? 'cursor-pointer hover:border-cyan-400' : ''
                              } ${
                                showCorrectness && opt.isCorrect
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-200'
                                  : showCorrectness && isSelected && !opt.isCorrect
                                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-200'
                                  : isSelected
                                  ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-400 text-cyan-800 dark:text-cyan-200'
                                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 print:bg-white print:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="font-bold text-cyan-600 dark:text-cyan-400 print:text-black shrink-0">
                                  {opt.label})
                                </span>
                                <span className="flex-1 print:text-black">{opt.text}</span>
                              </div>

                              {/* Explanation for distractor */}
                              {(!interactiveMode || isAnswered) && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700 print:hidden">
                                  💡 {opt.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Calculation Steps */}
                    {q.steps && (!interactiveMode || isAnswered) && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-1 text-xs print:hidden">
                        <span className="font-bold text-amber-800 dark:text-amber-300">خطوات الحل التفصيلية والمعادلات:</span>
                        {q.steps.map((st, sIdx) => (
                          <div key={sIdx} className="text-slate-700 dark:text-slate-300">
                            {st}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Analytical Rubric */}
                    {q.rubric && (!interactiveMode || isAnswered) && (
                      <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-1 text-xs print:hidden">
                        <span className="font-bold text-purple-800 dark:text-purple-300">سلم تصحيح الإجابة (Grading Rubric):</span>
                        {q.rubric.map((rub, rIdx) => (
                          <div key={rIdx} className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>{rub}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer Area for Printable Exams */}
                    {activeMode === 'full_exam' && (q.type === 'calculation' || q.type === 'analytical') && (
                      <div className="hidden print:block pt-4 min-h-[100px] border-b border-dashed border-slate-400">
                        <span className="text-[10px] text-slate-400">مساحة إجابة الطالب:</span>
                      </div>
                    )}

                    {/* Model Answer (Hidden on print unless specified) */}
                    {(!interactiveMode || isAnswered) && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 print:hidden">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">الإجابة النموذجية: </span>
                        <span>{q.correctAnswer} &bull; {q.rationale}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 print:hidden">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                منظومة التوليد الذكي جاهزة للتشغيل
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                اختر المادة والموضوع واضغط على زر التوليد لتطبيق أعلى معايير التقييم الأكاديمي الدولي والوزاري.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuantumQuestionGenerator;
