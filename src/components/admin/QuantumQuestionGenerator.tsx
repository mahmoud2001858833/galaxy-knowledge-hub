import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { auditLogger } from '@/services/auditLogger';

export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
export type QuestionType = 'mcq' | 'true_false' | 'analytical' | 'calculation';

export interface QuantumQuestion {
  id: string;
  type: QuestionType;
  bloomLevel: BloomLevel;
  questionText: string;
  options?: { label: string; text: string; isCorrect: boolean; explanation: string }[];
  correctAnswer: string;
  rationale: string;
  rubric?: string[];
  steps?: string[];
  latexFormula?: string;
  points: number;
}

const BLOOM_LEVELS: { id: BloomLevel; label: string; desc: string; color: string }[] = [
  { id: 'remember', label: 'تذكّر (Remember)', desc: 'استرجاع الحقائق والقوانين والمفاهيم الأساسية', color: 'from-blue-500 to-indigo-600' },
  { id: 'understand', label: 'فهم (Understand)', desc: 'تفسير الظواهر والمقارنة بين المفاهيم', color: 'from-cyan-500 to-blue-600' },
  { id: 'apply', label: 'تطبيق (Apply)', desc: 'استخدام القوانين في سياقات ومسائل جديدة', color: 'from-emerald-500 to-teal-600' },
  { id: 'analyze', label: 'تحليل (Analyze)', desc: 'تفكيك المسألة واستنتاج العلاقات والرسوم البيانية', color: 'from-amber-500 to-orange-600' },
  { id: 'evaluate', label: 'تقييم (Evaluate)', desc: 'إصدار أحكام ونقد الفرضيات والنتائج التجريبية', color: 'from-purple-500 to-pink-600' },
  { id: 'create', label: 'ابتكار (Create)', desc: 'تصميم تجربة أو ابتكار حل علمي غير تقليدي', color: 'from-rose-500 to-red-600' }
];

export const QuantumQuestionGenerator: React.FC = () => {
  const [subject, setSubject] = useState('physics');
  const [targetLevel, setTargetLevel] = useState('tawjihi');
  const [bloom, setBloom] = useState<BloomLevel>('analyze');
  const [qType, setQType] = useState<QuestionType>('mcq');
  const [count, setCount] = useState(3);
  const [topic, setTopic] = useState('ميكانيكا الكم: ظاهرة التأثير الكهروضوئي ومعادلة أينشتاين');
  const [additionalNotes, setAdditionalNotes] = useState('التركيز على دالة الشغل، تردد العتبة، وجهد الإيقاف مع تبرير الخيارات الخاطئة');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuantumQuestion[]>([]);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePedagogicalQuestions = async () => {
    setIsGenerating(true);

    try {
      // Simulate high-end AI generation pipeline with comprehensive pedagogic structures
      await new Promise((r) => setTimeout(r, 1400));

      const generated: QuantumQuestion[] = [];

      for (let i = 1; i <= count; i++) {
        if (qType === 'mcq') {
          generated.push({
            id: `q-mcq-${Date.now()}-${i}`,
            type: 'mcq',
            bloomLevel: bloom,
            questionText: `عند إسقاط ضوء أحادي اللون تردده (f) أكبر من تردد العتبة (f₀) لفلز، ماذا يحدث لجهد الإيقاف (V₀) إذا تمت مضاعفة شدة الضوء الساقط مع ثبات تردده؟`,
            options: [
              { label: 'أ', text: 'يتضاعف جهد الإيقاف', isCorrect: false, explanation: 'خطأ: جهد الإيقاف يعتمد حصراً على طاقة الفوتون الساقط (التردد) وليس على شدة الضوء.' },
              { label: 'ب', text: 'يبقى جهد الإيقاف ثابتاً دون تغيير', isCorrect: true, explanation: 'صحيح: مضاعفة الشدة تزيد عدد الفوتونات والإلكترونات الضوئية (التيار) ولا تؤثر على طاقة حركة الإلكترون العظمى وبالتالي يظل جهد الإيقاف ثابتاً.' },
              { label: 'ج', text: 'ينخفض جهد الإيقاف إلى النصف', isCorrect: false, explanation: 'خطأ: زيادة الشدة لا تقلل الطاقة الحركية.' },
              { label: 'د', text: 'يصبح جهد الإيقاف صفراً', isCorrect: false, explanation: 'خطأ: طالما f > f₀ فهناك دائماً انبعاث بطاقة حركية عظمى.' }
            ],
            correctAnswer: 'ب',
            rationale: 'وفق معادلة أينشتاين الكهروضوئية: KE_max = e * V₀ = hf - Φ، يعتمد جهد الإيقاف طردياً على تردد الفوتون ودالة الشغل للفلز فقط، ولا يتأثر بشدة الضوء.',
            latexFormula: 'e V_0 = h f - \\Phi',
            points: 5
          });
        } else if (qType === 'calculation') {
          generated.push({
            id: `q-calc-${Date.now()}-${i}`,
            type: 'calculation',
            bloomLevel: bloom,
            questionText: `سقط فوتون طوله الموجي λ = 300 nm على سطح فلز دالة شغله Φ = 2.4 eV. احسب: 1) أقصى طاقة حركية للإلكترونات المنبعثة بوحدة eV، 2) جهد الإيقاف اللازم لإيقاف أسرع إلكترون. (استخدم h = 4.14 × 10⁻¹⁵ eV·s، c = 3 × 10⁸ m/s)`,
            correctAnswer: 'KE_max = 1.74 eV, V₀ = 1.74 V',
            rationale: 'طاقة الفوتون: E = hc / λ = (4.14e-15 * 3e8) / (300e-9) = 4.14 eV. إذن: KE_max = 4.14 - 2.4 = 1.74 eV. ومنها جهد الإيقاف V₀ = 1.74 V.',
            steps: [
              'الخطوة 1: حساب طاقة الفوتون الساقط E = hc / λ = 4.14 eV',
              'الخطوة 2: تطبيق معادلة التأثير الكهروضوئي KE_max = E - Φ',
              'الخطوة 3: التعويض: KE_max = 4.14 eV - 2.40 eV = 1.74 eV',
              'الخطوة 4: حساب جهد الإيقاف: e V₀ = KE_max ==> V₀ = 1.74 V'
            ],
            latexFormula: 'E = \\frac{h c}{\\lambda} \\quad \\implies \\quad KE_{max} = E - \\Phi = 1.74\\text{ eV}',
            points: 10
          });
        } else if (qType === 'true_false') {
          generated.push({
            id: `q-tf-${Date.now()}-${i}`,
            type: 'true_false',
            bloomLevel: bloom,
            questionText: `تنص النظرية المادية الكلاسيكية للضوء على أن زيادة شدة الضوء الساقط تزيد من الطاقة الحركية القصوى للإلكترونات الضوئية المنبعثة، وهو ما أثبتت التجربة صحته.`,
            correctAnswer: 'خطأ',
            rationale: 'العبارة خاطئة: هذا ما تنبأت به الفيزياء الكلاسيكية (الموجية)، ولكن التجارب المعملية أثبتت فشل هذا التنبؤ، حيث أثبت أينشتاين أن الطاقة الحركية تعتمد على التردد فقط لا على الشدة.',
            points: 4
          });
        } else {
          generated.push({
            id: `q-essay-${Date.now()}-${i}`,
            type: 'analytical',
            bloomLevel: bloom,
            questionText: `قارن بين تفسير الفيزياء الكلاسيكية وتفسير نظرية الكم لأينشتاين لظاهرة الانبعاث الكهروضوئي من حيث: زمن الانبعاث (التأخير الزمني)، وأثر تردد الضوء الساقط، مبيناً أوجه العجز الكلاسيكي.`,
            correctAnswer: 'إجابة مقالية نموذجية تتضمن جدول مقارنة شامل',
            rationale: 'الكلاسيكية افترضت تراكم الطاقة عبر الزمن وحرية التردد بشرط كفاية الشدة، بينما أينشتاين أثبت أن الانبعاث فوري (أقل من 10⁻⁹ ثانية) ومشروط بأن يكون f ≥ f₀.',
            rubric: [
              'المقارنة في الزمن (فوري مقابل تراكمي): درجتان',
              'المقارنة في شرط التردد ودالة الشغل: درجتان',
              'بيان سبب العجز الكلاسيكي في الطبيعة الجسيمية للضوء: درجتان'
            ],
            points: 6
          });
        }
      }

      setQuestions(generated);
      setUserAnswers({});
      setShowResults(false);

      auditLogger.record({
        action: 'AI_QUERY',
        module: 'Quantum Question Generator 2.0',
        description: `توليد ${count} أسئلة علمية بمستوى بلوم (${bloom}) في موضوع (${topic})`,
        user: { id: 'admin-01', name: 'المشرف', email: 'admin@zarwat.edu.jo', role: 'admin' },
        severity: 'info'
      });

      toast.success(`تم توليد ${generated.length} أسئلة بمستوى بلوم المتقدم بنجاح! 🚀`);
    } catch (e) {
      toast.error('حدث خطأ أثناء التوليد');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyQuestions = () => {
    if (questions.length === 0) return;
    const text = questions
      .map(
        (q, idx) =>
          `السؤال ${idx + 1} (${BLOOM_LEVELS.find((b) => b.id === q.bloomLevel)?.label}) [${q.points} درجات]:\n` +
          `${q.questionText}\n` +
          (q.options ? q.options.map((o) => `  ${o.label}) ${o.text}`).join('\n') + '\n' : '') +
          `الإجابة النموذجية: ${q.correctAnswer}\n` +
          `الشرح والتعليل: ${q.rationale}\n` +
          (q.steps ? `خطوات الحل:\n${q.steps.join('\n')}\n` : '') +
          `--------------------------------------------------`
      )
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('تم نسخ كافة الأسئلة إلى الحافظة!');
  };

  const handlePrintExam = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans" dir="rtl">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-purple-600/10 border border-cyan-500/20 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-bold border border-cyan-400/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>نقلة نوعية في هندسة التقييم الأكاديمي</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            مولد وتطوير الأسئلة بالذكاء الاصطناعي 2.0 (Quantum Generator)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            توليد امتحانات وبنوك أسئلة احترافية مصنفة بدقة وفق هرم بلوم المعرفي، مع شروحات وتبريرات للأخطاء الشائعة ومعادلات LaTeX.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => setInteractiveMode(!interactiveMode)}
            variant="outline"
            className={`rounded-2xl text-xs font-bold gap-1.5 ${
              interactiveMode ? 'bg-purple-500/20 text-purple-600 border-purple-400/30' : ''
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {interactiveMode ? 'إلغاء وضع المحاكاة' : 'وضع الاختبار التفاعلي'}
          </Button>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Form Column */}
        <div className="lg:col-span-5 space-y-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <span>معايير ومواصفات التوليد الذكي</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">المادة الدراسية:</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-xs h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="physics">الفيزياء الحديثة والكلاسيكية</option>
                <option value="chemistry">الكيمياء الحركية والعضوية</option>
                <option value="biology">الأحياء وعلم الوراثة</option>
                <option value="math">الرياضيات والتفاضل والتكامل</option>
                <option value="btec">تكنولوجيا المعلومات BTEC</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">المستوى المستهدف:</label>
              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="w-full text-xs h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="tawjihi">التوجيهي الأردني (الثانوية العامة)</option>
                <option value="olympiad">أولمبياد العلوم المتقدم</option>
                <option value="university">السنة الجامعية الأولى</option>
                <option value="middle">المرحلة الأساسية المتقدمة</option>
              </select>
            </div>
          </div>

          {/* Bloom Taxonomy Pills */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>تصنيف بلوم للأهداف المعرفية:</span>
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
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نمط السؤال:</label>
              <select
                value={qType}
                onChange={(e) => setQType(e.target.value as QuestionType)}
                className="w-full text-xs h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="mcq">اختيار من متعدد (مع تبرير الخطأ)</option>
                <option value="calculation">مسألة حسابية خطوة بخطوة</option>
                <option value="true_false">صح / خطأ مع تصحيح العبارة</option>
                <option value="analytical">سؤال مقالي مع سلم تصحيح (Rubric)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">عدد الأسئلة المطلوبة:</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Topic & Notes */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الموضوع أو الدرس المستهدف:</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: قانون أوم، البناء الضوئي، التكامل بالتعويض..."
              className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">توجيهات إضافية للذكاء الاصطناعي:</label>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="مثال: تضمين حسابات، استخدام الرموز اللاتينية، التركيز على المفاهيم الخاطئة..."
              className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[60px]"
            />
          </div>

          <Button
            onClick={generatePedagogicalQuestions}
            disabled={isGenerating}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-cyan-500/20"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 animate-spin" />
                جاري توليد الأسئلة وتطبيق تصنيف بلوم...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                توليد الأسئلة بنظام بلوم الذكي 2.0
              </span>
            )}
          </Button>
        </div>

        {/* Right/Output Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                حصيلة بنك الأسئلة المولد ({questions.length})
              </h3>
            </div>

            {questions.length > 0 && (
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
                  onClick={handlePrintExam}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-500" />
                  طباعة ورقة امتحان
                </Button>
              </div>
            )}
          </div>

          {/* Questions Feed */}
          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const bloomInfo = BLOOM_LEVELS.find((b) => b.id === q.bloomLevel);
                const userAnswer = userAnswers[q.id];
                const isAnswered = Boolean(userAnswer);

                return (
                  <div
                    key={q.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-black text-xs flex items-center justify-center border border-cyan-500/20">
                          {idx + 1}
                        </span>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full bg-gradient-to-r ${bloomInfo?.color} text-white shadow-sm`}>
                          {bloomInfo?.label}
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                          {q.points} درجات
                        </span>
                      </div>
                    </div>

                    {/* Question Text */}
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* LaTeX Preview if available */}
                    {q.latexFormula && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-mono text-xs text-cyan-600 dark:text-cyan-400" dir="ltr">
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
                                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="font-bold text-cyan-600 dark:text-cyan-400 shrink-0">
                                  {opt.label})
                                </span>
                                <span className="flex-1">{opt.text}</span>
                              </div>

                              {/* Explanation for distractor */}
                              {(!interactiveMode || isAnswered) && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700">
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
                      <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-1 text-xs">
                        <span className="font-bold text-amber-800 dark:text-amber-300">خطوات الحل التفصيلية:</span>
                        {q.steps.map((st, sIdx) => (
                          <div key={sIdx} className="text-slate-700 dark:text-slate-300">
                            {st}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Analytical Rubric */}
                    {q.rubric && (!interactiveMode || isAnswered) && (
                      <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-1 text-xs">
                        <span className="font-bold text-purple-800 dark:text-purple-300">سلم تصحيح الإجابة (Grading Rubric):</span>
                        {q.rubric.map((rub, rIdx) => (
                          <div key={rIdx} className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>{rub}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Correct Answer and Rationale */}
                    {(!interactiveMode || isAnswered) && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">الإجابة النموذجية: </span>
                        <span>{q.correctAnswer} — {q.rationale}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                جاهز لتوليد بنك أسئلة ذكي
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                حدد المادة ومستوى بلوم من القائمة، ثم اضغط على زر التوليد لتصميم امتحانات تضاهي المعايير الدولية والوزارية.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
