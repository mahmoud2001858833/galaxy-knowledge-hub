import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
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
  AlertCircle,
  UploadCloud,
  FileCheck,
  FileCode,
  Share2,
  Users,
  BarChart3,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  File,
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { auditLogger } from '@/services/auditLogger';
import { 
  aiExamService, 
  type BloomLevel, 
  type QuestionType, 
  type GeneratedQuestion, 
  type FullExamStructure,
  type OnlineExamRegistrationConfig,
  type StudentExamSubmission
} from '@/services/aiExamService';
import { fileParserService, type ParsedDocumentResult } from '@/services/fileParserService';
import SafeBoundary from '@/components/common/SafeBoundary';

export const BLOOM_LEVELS: { id: BloomLevel; label: string; desc: string; color: string }[] = [
  { id: 'remember', label: 'تذكّر (Remember)', desc: 'استرجاع الحقائق والقوانين والمفاهيم الأساسية', color: 'from-blue-500 to-indigo-600' },
  { id: 'understand', label: 'فهم (Understand)', desc: 'تفسير الظواهر والمقارنة بين المفاهيم', color: 'from-cyan-500 to-blue-600' },
  { id: 'apply', label: 'تطبيق (Apply)', desc: 'استخدام القوانين في سياقات ومسائل جديدة', color: 'from-emerald-500 to-teal-600' },
  { id: 'analyze', label: 'تحليل (Analyze)', desc: 'تفكيك المسألة واستنتاج العلاقات والرسوم البيانية', color: 'from-amber-500 to-orange-600' },
  { id: 'evaluate', label: 'تقييم (Evaluate)', desc: 'إصدار أحكام ونقد الفرضيات والنتائج التجريبية', color: 'from-purple-500 to-pink-600' },
  { id: 'create', label: 'ابتكار (Create)', desc: 'تصميم تجربة أو ابتكار حل علمي غير تقليدي', color: 'from-rose-500 to-red-600' }
];

export const ExamGeneratorStudio: React.FC = () => {
  const navigate = useNavigate();

  // Mode Selection: 'studio' (Creation) vs 'submissions' (Student Results)
  const [activeTab, setActiveTab] = useState<'create' | 'submissions'>('create');
  const [outputMode, setOutputMode] = useState<'questions' | 'full_exam'>('full_exam');

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parsedFile, setParsedFile] = useState<ParsedDocumentResult | null>(null);
  const [useFileStrictly, setUseFileStrictly] = useState(true);

  // Exam Specifications
  const [subject, setSubject] = useState('الفيزياء الحديثة والكلاسيكية');
  const [targetLevel, setTargetLevel] = useState('الثانوية العامة (التوجيهي الأردني)');
  const [bloom, setBloom] = useState<BloomLevel>('analyze');
  const [qType, setQType] = useState<QuestionType>('all_mixed');
  const [count, setCount] = useState(8);
  const [topic, setTopic] = useState('الفيزياء الذرية والنووية: ميكانيكا الكم، أطياف الانبعاث، والتأثير الكهروضوئي');
  const [additionalNotes, setAdditionalNotes] = useState('تضمين رسوم بيانية ومخططات دوائر وتبرير كامل لجميع البدائل');

  // Exam Header Metadata
  const [examDuration, setExamDuration] = useState(90);
  const [examTotalMarks, setExamTotalMarks] = useState(100);
  const [schoolName, setSchoolName] = useState('مدرسة عنبه الثانية الشاملة للبنين');

  // Advanced Generation Features Toggles
  const [includeDiagrams, setIncludeDiagrams] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);

  // Results State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [generatedExam, setGeneratedExam] = useState<FullExamStructure | null>(null);

  // Online Exam Modal & Link Sharing State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [activeExamPackageId, setActiveExamPackageId] = useState<string | null>(null);
  const [studentRegistrationConfig, setStudentRegistrationConfig] = useState<OnlineExamRegistrationConfig>({
    requireFullName: true,
    requireClassSection: true,
    requireSeatNumber: true,
    requireSchoolName: true,
    customNotes: 'يرجى كتابة الاسم الثلاثي كما هو في السجل الرسمي.'
  });

  // Student Submissions for current exam
  const [submissions, setSubmissions] = useState<StudentExamSubmission[]>([]);

  // Print Mode State
  const [printAnswerKey, setPrintAnswerKey] = useState(false);

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    toast.info(`جارٍ قراءة وفحص الملف: ${file.name}...`);

    try {
      const result = await fileParserService.parseFile(file);
      setParsedFile(result);

      // Auto update topic if detected
      if (result.topicsSummary.length > 0 && result.topicsSummary[0] !== 'المحتوى العلمي المرفق') {
        setTopic(result.topicsSummary.join(' • '));
      }

      toast.success(`تمت قراءة الملف بنجاح (${result.wordCount} كلمة مستخرجة) 📄`);
    } catch (err: any) {
      toast.error('حدث خطأ أثناء قراءة الملف، تأكد من سلامة المستند');
    } finally {
      setIsParsingFile(false);
    }
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
        additionalNotes,
        uploadedFileText: (useFileStrictly && parsedFile) ? parsedFile.extractedText : undefined,
        includeDiagrams,
        includeTables
      });

      setGeneratedQuestions(questions);

      auditLogger.record({
        action: 'AI_QUERY',
        module: 'Exam Studio',
        description: `توليد ${questions.length} أسئلة بمستوى (${bloom}) لموضوع (${topic})`,
        user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
        severity: 'info'
      });

      toast.success(`تم توليد ${questions.length} أسئلة علمية عالية الدقة بنجاح 🚀`);
    } catch {
      toast.error('حدث خطأ أثناء التوليد');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Full Official Exam
  const handleGenerateFullExam = async () => {
    setIsGenerating(true);
    try {
      const exam = await aiExamService.generateOfficialExam({
        subject,
        gradeLevel: targetLevel,
        topic,
        durationMinutes: examDuration,
        totalMarks: examTotalMarks,
        uploadedFileText: (useFileStrictly && parsedFile) ? parsedFile.extractedText : undefined,
        sourceDocumentName: parsedFile?.fileName,
        includeDiagrams,
        includeTables
      });

      if (schoolName) exam.schoolName = schoolName;

      setGeneratedExam(exam);
      setGeneratedQuestions(exam.sections.flatMap(s => s.questions));

      auditLogger.record({
        action: 'AI_QUERY',
        module: 'Exam Studio',
        description: `توليد ورقة امتحان رسمي متكامل في مادة (${subject}) علامات: ${examTotalMarks}`,
        user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
        severity: 'info'
      });

      toast.success('تم تصميم ورقة الامتحان الوزاري المتكاملة بنجاح 📄');
    } catch {
      toast.error('حدث خطأ أثناء تصميم الامتحان');
    } finally {
      setIsGenerating(false);
    }
  };

  // Create Online Exam & Generate Shareable Link
  const handleCreateOnlineExam = () => {
    if (!generatedExam) {
      toast.error('يرجى توليد ورقة الامتحان أولاً قبل إنشاء الرابط الإلكتروني');
      return;
    }

    const pkg = aiExamService.saveOnlineExam(generatedExam, studentRegistrationConfig);
    const link = `${window.location.origin}/live-exam/${pkg.id}`;
    setShareableLink(link);
    setActiveExamPackageId(pkg.id);
    setIsShareModalOpen(true);

    navigator.clipboard.writeText(link);
    toast.success('تم إنشاء الرابط الإلكتروني ونسخه إلى الحافظة! 🔗');

    auditLogger.record({
      action: 'CONFIG_CHANGE',
      module: 'Online Exam Studio',
      description: `نشر امتحان إلكتروني برابط مخصص: ${pkg.id}`,
      user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
      severity: 'info'
    });
  };

  // Load submissions when switching tabs
  useEffect(() => {
    if (activeExamPackageId) {
      setSubmissions(aiExamService.getSubmissionsForExam(activeExamPackageId));
    }
  }, [activeTab, activeExamPackageId]);

  // Export to Microsoft Word
  const handleExportWord = (withAnswers: boolean) => {
    if (!generatedExam) {
      toast.error('لا يوجد امتحان مولد لتصديره');
      return;
    }
    aiExamService.exportToWord(generatedExam, withAnswers);
    toast.success(`تم تجهيز وتنزيل ملف Word (${withAnswers ? 'نموذج الإجابة' : 'ورقة الامتحان'}) بنجاح! 📝`);
  };

  // Trigger Print for PDF
  const handlePrintPDF = (withAnswers: boolean) => {
    setPrintAnswerKey(withAnswers);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060919] text-slate-900 dark:text-slate-100 flex flex-col font-sans print:bg-white print:text-black" dir="rtl">
      
      {/* 1. Studio Navigation Bar (Hidden on Print) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 h-16 flex items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/25">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                استوديو تصميم وتوليد الامتحانات المتقدم
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-400/20 mr-2 hidden sm:inline">
                Quantum Exam Studio 2.0
              </span>
            </div>
          </Link>
        </div>

        {/* Tab Controls & Direct Links */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>إنشاء وتصميم الامتحان</span>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'submissions'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>نتائج وإجابات الطلاب ({submissions.length})</span>
            </button>
          </div>

          <Link to="/admin">
            <Button variant="ghost" size="sm" className="rounded-xl text-xs gap-1 text-slate-600 dark:text-slate-300">
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">لوحة الإدارة</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. Main Studio Workspace */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 print:p-0 print:m-0">
        
        {activeTab === 'create' ? (
          <>
            {/* Top Banner and Quick Highlights */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-purple-600/10 border border-cyan-500/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
              <div className="space-y-1.5 text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-bold border border-cyan-400/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>مدعوم بمفتاح الذكاء الاصطناعي المباشر ak_live</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  مصمم أوراق الامتحانات وبنوك الأسئلة المدرسية والوزارية
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  ارفع وثائقك ومناهجك (PDF / Word)، حدد معايير تصنيف بلوم للأهداف المعرفية، واحصل فوراً على ورقة امتحان رسمي، نموذج إجابة تفصيلي، رسوم توضيحية وجداول، وتنزيل بصيغ Word و PDF ورابط اختبار إلكتروني مباشر للطلاب.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  المحرك الذكي: نشط 100%
                </span>
                <span className="text-[10px] text-emerald-600 font-mono">ak_live ✓</span>
              </div>
            </div>

            {/* Studio Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
              
              {/* Left Control Panel: Upload, Specs, & Generation (Hidden on Print) */}
              <div className="lg:col-span-5 space-y-5 print:hidden">
                
                {/* 1. Intelligent Document Upload Box */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        رفع وقراءة الوثيقة التعليمية (PDF, Word, TXT)
                      </h3>
                    </div>
                    {parsedFile && (
                      <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10">
                        تمت القراءة بنجاح ✓
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.doc,.txt,.md,image/*"
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 rounded-2xl border-2 border-dashed cursor-pointer text-center space-y-2 transition-all ${
                      parsedFile
                        ? 'border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                      {isParsingFile ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : parsedFile ? (
                        <FileCheck className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <UploadCloud className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {parsedFile ? parsedFile.fileName : 'انقر لاختيار ملف المنهاج أو اسحبه هنا'}
                    </div>

                    <p className="text-[11px] text-slate-400">
                      يدعم ملفات PDF المدرسية، وثائق Word (.docx)، الملفات النصية والصور
                    </p>
                  </div>

                  {/* Parsed File Insight Card */}
                  {parsedFile && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-800 dark:text-slate-200 truncate">{parsedFile.fileName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {Math.round(parsedFile.fileSize / 1024)} KB
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <div>الكلمات المستخرجة: <strong>{parsedFile.wordCount}</strong></div>
                        <div>الحروف: <strong>{parsedFile.characterCount}</strong></div>
                      </div>

                      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-cyan-600 dark:text-cyan-400">
                          <input
                            type="checkbox"
                            checked={useFileStrictly}
                            onChange={(e) => setUseFileStrictly(e.target.checked)}
                            className="rounded"
                          />
                          <span>اعتماد محتوى الملف كمصدر حصري للأسئلة</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Exam Parameters Configuration */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-500" />
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        مواصفات ومعايير الامتحان
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        onClick={() => setOutputMode('full_exam')}
                        className={`px-2 py-0.5 rounded-lg font-bold ${
                          outputMode === 'full_exam' ? 'bg-cyan-600 text-white' : 'text-slate-500'
                        }`}
                      >
                        امتحان كامل
                      </button>
                      <button
                        onClick={() => setOutputMode('questions')}
                        className={`px-2 py-0.5 rounded-lg font-bold ${
                          outputMode === 'questions' ? 'bg-cyan-600 text-white' : 'text-slate-500'
                        }`}
                      >
                        بنك أسئلة
                      </button>
                    </div>
                  </div>

                  {/* Subject and Target Level */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">المبحث الدراسي:</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full text-xs h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        <option value="الفيزياء الحديثة والكلاسيكية">الفيزياء الحديثة والكلاسيكية</option>
                        <option value="الكيمياء الحركية والعضوية">الكيمياء الحركية والعضوية</option>
                        <option value="العلوم الحياتية والوراثة">العلوم الحياتية والوراثة</option>
                        <option value="الرياضيات والتفاضل والتكامل">الرياضيات والتفاضل والتكامل</option>
                        <option value="تكنولوجيا المعلومات وBTEC">تكنولوجيا المعلومات BTEC</option>
                        <option value="الروبوتات والذكاء الاصطناعي">الروبوتات والذكاء الاصطناعي</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">المستوى الدراسي:</label>
                      <select
                        value={targetLevel}
                        onChange={(e) => setTargetLevel(e.target.value)}
                        className="w-full text-xs h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        <option value="الثانوية العامة (التوجيهي الأردني)">الثانوية العامة (التوجيهي الأردني)</option>
                        <option value="الصف العاشر الأساسي">الصف العاشر الأساسي</option>
                        <option value="مسار Pearson BTEC الدولي">مسار Pearson BTEC الدولي</option>
                        <option value="أولمبياد العلوم الوطني">أولمبياد العلوم الوطني</option>
                      </select>
                    </div>
                  </div>

                  {/* Question Count & Question Types */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نمط ونوعية الأسئلة:</label>
                      <select
                        value={qType}
                        onChange={(e) => setQType(e.target.value as QuestionType)}
                        className="w-full text-xs h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        <option value="all_mixed">حزمة شاملة (موضوعي + حسابي + مقالي)</option>
                        <option value="mcq">اختيار من متعدد (4 بدائل مع التبرير)</option>
                        <option value="calculation">مسائل حسابية بالخطوات والقوانين</option>
                        <option value="true_false">صح / خطأ مع تصحيح العبارات</option>
                        <option value="analytical">أسئلة تحليلية مع سلم تصحيح (Rubric)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">عدد الأسئلة:</label>
                      <Input
                        type="number"
                        min={2}
                        max={30}
                        value={count}
                        onChange={(e) => setCount(Math.max(2, Math.min(30, parseInt(e.target.value) || 2)))}
                        className="h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  {/* Bloom Taxonomy Pills */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>التركيز المعرفي (هرم بلوم):</span>
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
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {b.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topic Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">موضوع أو وحدة الاختبار:</label>
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="مثال: التأثير الكهروضوئي، قانون أوم، البناء الضوئي..."
                      className="text-xs h-9 rounded-xl bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  {/* Official Exam Meta (Duration & Marks) */}
                  {outputMode === 'full_exam' && (
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">الزمن (دقيقة):</label>
                        <Input
                          type="number"
                          value={examDuration}
                          onChange={(e) => setExamDuration(parseInt(e.target.value) || 90)}
                          className="h-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">العلامة الكلية:</label>
                        <Input
                          type="number"
                          value={examTotalMarks}
                          onChange={(e) => setExamTotalMarks(parseInt(e.target.value) || 100)}
                          className="h-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500">المدرسة:</label>
                        <Input
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="h-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Visual and Table Capabilities Toggles */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={includeDiagrams}
                        onChange={(e) => setIncludeDiagrams(e.target.checked)}
                        className="rounded"
                      />
                      <span className="font-bold">إنشاء أشكال ورسوم توضيحية علمية للأسئلة (Diagrams & SVGs)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={includeTables}
                        onChange={(e) => setIncludeTables(e.target.checked)}
                        className="rounded"
                      />
                      <span className="font-bold">إنشاء جداول بيانات علمية وتجارب معملية (Data Tables)</span>
                    </label>
                  </div>

                  {/* Generation Trigger Button */}
                  <Button
                    onClick={outputMode === 'full_exam' ? handleGenerateFullExam : handleGenerateQuestions}
                    disabled={isGenerating}
                    className="w-full h-11 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-cyan-500/20"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 animate-spin" />
                        جاري قراءة الملف وتوليد الامتحان الذكي بدقة...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {outputMode === 'full_exam'
                          ? 'توليد ورقة الامتحان الوزاري المتكاملة 📄'
                          : 'توليد بنك الأسئلة المخصص فورياً ⚡'}
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Right Output Panel: Paper View, Diagrams, and Actions */}
              <div className="lg:col-span-7 space-y-4 print:w-full print:p-0">
                
                {/* Export & Action Toolbar (Hidden on Print) */}
                <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {generatedExam ? generatedExam.examTitle : `حصيلة الأسئلة المولدة (${generatedQuestions.length})`}
                    </span>
                  </div>

                  {generatedExam && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* PDF Student Paper */}
                      <Button
                        onClick={() => handlePrintPDF(false)}
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs gap-1 border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400"
                        title="تنزيل / طباعة ورقة امتحان الطالب كـ PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>ورقة امتحان (PDF)</span>
                      </Button>

                      {/* PDF Model Answer */}
                      <Button
                        onClick={() => handlePrintPDF(true)}
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs gap-1 border-emerald-300 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400"
                        title="تنزيل / طباعة نموذج الإجابة الرسمي ودليل التصحيح"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>دليل الإجابة (PDF)</span>
                      </Button>

                      {/* Word Export */}
                      <Button
                        onClick={() => handleExportWord(false)}
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs gap-1 border-blue-300 dark:border-blue-900 text-blue-600 dark:text-blue-400"
                        title="تنزيل الامتحان بتنسيق Microsoft Word قابل للتعديل"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>تنزيل Word</span>
                      </Button>

                      {/* Online Interactive Exam Link */}
                      <Button
                        onClick={handleCreateOnlineExam}
                        size="sm"
                        className="rounded-xl text-xs gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/20"
                        title="إنشاء رابط امتحان إلكتروني تفاعلي للطلاب"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>رابط الامتحان الإلكتروني</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Formal Examination Paper Template */}
                {generatedExam ? (
                  <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 print:border-black print:shadow-none print:p-4 print:bg-white print:text-black">
                    
                    {/* Official Ministerial Header */}
                    <div className="text-center space-y-1.5 pb-4 border-b-2 border-slate-800 dark:border-slate-200 print:border-black">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black">
                        المملكة الأردنية الهاشمية &bull; وزارة التربية والتعليم
                      </div>
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-400 print:text-black">
                        مديرية التربية والتعليم للواء المزار الشمالي &bull; {generatedExam.schoolName}
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white print:text-black pt-1">
                        {generatedExam.examTitle} ({generatedExam.academicYear})
                      </h2>
                      {printAnswerKey && (
                        <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs border border-emerald-500/30">
                          (نموذج الإجابة الرسمي ودليل تصحيح المعلم)
                        </div>
                      )}
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 print:text-black flex flex-wrap justify-center gap-6 pt-1">
                        <span>المبحث: <strong>{generatedExam.subject}</strong></span>
                        <span>المستوى: <strong>{generatedExam.gradeLevel}</strong></span>
                        <span>الزمن: <strong>{generatedExam.durationMinutes} دقيقة</strong></span>
                        <span>العلامة الكلية: <strong>{generatedExam.totalMarks} علامة</strong></span>
                      </div>
                    </div>

                    {/* Student Metadata Box (Hidden on Answer Key) */}
                    {!printAnswerKey && (
                      <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 text-xs print:border-black print:bg-white print:text-black">
                        <div>اسم الطالب: ............................................................................</div>
                        <div>الشعبة / رقم الجلوس: .......................................</div>
                      </div>
                    )}

                    {/* Exam Instructions */}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 print:text-black space-y-0.5">
                      <strong className="text-slate-700 dark:text-slate-300 print:text-black">تعليمات الاختبار: </strong>
                      {generatedExam.instructions.join(' • ')}
                    </div>

                    {/* Sections and Questions Feed */}
                    <div className="space-y-6 pt-2">
                      {generatedExam.sections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-4">
                          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-r-4 border-cyan-500 text-xs font-bold text-slate-900 dark:text-white print:bg-slate-100 print:border-black print:text-black">
                            {section.sectionTitle} &bull; <span className="font-normal text-slate-500">{section.sectionDescription}</span>
                          </div>

                          <div className="space-y-5 pr-2">
                            {section.questions.map((q, qIdx) => {
                              const bloomInfo = BLOOM_LEVELS.find((b) => b.id === q.bloomLevel);

                              return (
                                <div key={q.id} className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800 print:border-slate-300 print:break-inside-avoid">
                                  {/* Question Header */}
                                  <div className="flex items-start justify-between gap-3 text-xs sm:text-sm">
                                    <div className="font-bold text-slate-900 dark:text-white print:text-black leading-relaxed">
                                      س {qIdx + 1}) {q.questionText}
                                    </div>
                                    <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 print:text-black print:border">
                                      ({q.points} علامات)
                                    </span>
                                  </div>

                                  {/* Inline Scientific Diagram if present */}
                                  {q.diagram && (
                                    <div className="my-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-w-md mx-auto text-center print:border-black print:bg-white">
                                      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 print:text-black">
                                        الشكل التوضيحي: {q.diagram.title}
                                      </div>
                                      <div dangerouslySetInnerHTML={{ __html: q.diagram.svgContent }} />
                                      <p className="text-[10px] text-slate-400 mt-1">{q.diagram.description}</p>
                                    </div>
                                  )}

                                  {/* Inline Scientific Data Table if present */}
                                  {q.table && (
                                    <div className="my-2 overflow-x-auto">
                                      {q.table.caption && (
                                        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                                          {q.table.caption}
                                        </div>
                                      )}
                                      <table className="w-full text-xs border-collapse border border-slate-300 dark:border-slate-700 print:border-black">
                                        <thead>
                                          <tr className="bg-slate-100 dark:bg-slate-800 print:bg-slate-100">
                                            {q.table.headers.map((h, hIdx) => (
                                              <th key={hIdx} className="border border-slate-300 dark:border-slate-700 p-2 text-center font-bold print:border-black">
                                                {h}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {q.table.rows.map((row, rIdx) => (
                                            <tr key={rIdx}>
                                              {row.map((cell, cIdx) => (
                                                <td key={cIdx} className="border border-slate-300 dark:border-slate-700 p-2 text-center print:border-black">
                                                  {cell}
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}

                                  {/* Formula */}
                                  {q.latexFormula && (
                                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center font-mono text-xs text-cyan-600 dark:text-cyan-400 print:text-black print:border-black" dir="ltr">
                                      {q.latexFormula}
                                    </div>
                                  )}

                                  {/* Multiple Choice Options */}
                                  {q.options && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                      {q.options.map((opt) => (
                                        <div
                                          key={opt.label}
                                          className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                                            printAnswerKey && opt.isCorrect
                                              ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-900 print:bg-slate-100'
                                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 print:bg-white print:border-slate-300'
                                          }`}
                                        >
                                          <span className="font-bold text-cyan-600 dark:text-cyan-400 print:text-black">{opt.label})</span>
                                          <span>{opt.text}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Answer space for calculations / essays on Student Paper */}
                                  {!printAnswerKey && (q.type === 'calculation' || q.type === 'analytical') && (
                                    <div className="h-16 border-b border-dashed border-slate-300 dark:border-slate-700 print:border-slate-400 flex items-end">
                                      <span className="text-[10px] text-slate-400">مساحة الإجابة والحل الرياضي...</span>
                                    </div>
                                  )}

                                  {/* Model Answer & Steps (Shown on Model Answer Key) */}
                                  {printAnswerKey && (
                                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1.5 print:bg-white print:border-black">
                                      <div className="font-bold text-emerald-800 dark:text-emerald-300 print:text-black">
                                        الإجابة النموذجية: {q.correctAnswer} &bull; {q.rationale}
                                      </div>
                                      {q.steps && (
                                        <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5">
                                          <strong>خطوات الحل:</strong>
                                          {q.steps.map((st, idx) => (
                                            <div key={idx}>&bull; {st}</div>
                                          ))}
                                        </div>
                                      )}
                                      {q.rubric && (
                                        <div className="text-[11px] text-purple-700 dark:text-purple-300 space-y-0.5">
                                          <strong>سلم توزيع الدرجات:</strong>
                                          {q.rubric.map((r, idx) => (
                                            <div key={idx}>&bull; {r}</div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Paper Footer */}
                    <div className="text-center pt-6 border-t-2 border-slate-800 dark:border-slate-200 print:border-black font-bold text-xs text-slate-600 dark:text-slate-400 print:text-black">
                      انتهت ورقة الامتحان &bull; تمنياتنا لكم بالنجاح والتفوق &bull; مدرسة عنبه الثانية الشاملة للبنين
                    </div>
                  </div>
                ) : (
                  <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 print:hidden">
                    <div className="w-14 h-14 mx-auto rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                      <FileText className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      استوديو الامتحانات جاهز لتوليد ورقتك الامتحانية
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      ارفع ملف المنهاج أو حدد الموضوع المطلوب واضغط على زر التوليد للحصول على ورقة امتحان مطابقة للمعايير الوزارية فوراً.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Submissions / Student Results Tab */
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  سجل إجابات ونتائج الطلاب في الامتحان الإلكتروني
                </h2>
                <p className="text-xs text-slate-500">
                  عرض مباشر لكافة الطلاب الذين تقدموا للامتحان عبر الرابط المشترك مع علاماتهم وتفاصيل إجاباتهم
                </p>
              </div>

              {activeExamPackageId && (
                <Button
                  onClick={handleCreateOnlineExam}
                  size="sm"
                  className="rounded-xl text-xs gap-1.5 bg-purple-600 text-white font-bold"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>نسخ رابط الامتحان مرة أخرى</span>
                </Button>
              )}
            </div>

            {submissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3 font-bold">اسم الطالب</th>
                      <th className="p-3 font-bold">الصف والشعبة</th>
                      <th className="p-3 font-bold">رقم الجلوس</th>
                      <th className="p-3 font-bold">المدرسة</th>
                      <th className="p-3 font-bold">النتيجة</th>
                      <th className="p-3 font-bold">النسبة</th>
                      <th className="p-3 font-bold">الوقت المستغرق</th>
                      <th className="p-3 font-bold">تاريخ التسليم</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{sub.studentName}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{sub.classSection}</td>
                        <td className="p-3 font-mono">{sub.seatNumber || '—'}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{sub.schoolName || '—'}</td>
                        <td className="p-3 font-black text-cyan-600 dark:text-cyan-400">
                          {sub.score} / {sub.totalPossible}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            sub.percentage >= 85 ? 'bg-emerald-500/10 text-emerald-600' :
                            sub.percentage >= 65 ? 'bg-blue-500/10 text-blue-600' :
                            'bg-rose-500/10 text-rose-600'
                          }`}>
                            {sub.percentage}%
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px]">{sub.timeTakenMinutes} دقيقة</td>
                        <td className="p-3 text-slate-400 text-[10px]">
                          {new Date(sub.submittedAt).toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 space-y-3 text-slate-400">
                <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  لا توجد تسليمات طلاب حتى الآن
                </h4>
                <p className="text-xs max-w-sm mx-auto">
                  قم بإنشاء ومشاركة رابط الامتحان الإلكتروني مع الطلاب للبدء في استلام الإجابات ورصد العلامات لحظياً.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. Online Exam Share & Configuration Dialog */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4" dir="rtl">
          <DialogHeader className="text-right">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-purple-500/10 text-purple-600">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                  رابط الامتحان الإلكتروني التفاعلي للطلاب
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  انسخ الرابط وشاركه مع طلابك لإجراء الاختبار إلكترونياً مع تصحيح تلقائي فوري
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Shareable Link Box */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">رابط الاختبار المباشر:</label>
            <div className="flex items-center gap-2">
              <Input
                value={shareableLink}
                readOnly
                className="h-10 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800"
                dir="ltr"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(shareableLink);
                  toast.success('تم نسخ الرابط بنجاح!');
                }}
                className="h-10 px-4 rounded-xl bg-purple-600 text-white font-bold text-xs shrink-0"
              >
                <Copy className="w-3.5 h-3.5 ml-1" />
                نسخ
              </Button>
            </div>
          </div>

          {/* Student Required Fields Settings */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              البيانات المطلوبة من الطالب عند فتح الرابط:
            </span>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={studentRegistrationConfig.requireFullName}
                onChange={(e) => setStudentRegistrationConfig({ ...studentRegistrationConfig, requireFullName: e.target.checked })}
                className="rounded"
              />
              <span>اسم الطالب الكامل (إلزامي)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={studentRegistrationConfig.requireClassSection}
                onChange={(e) => setStudentRegistrationConfig({ ...studentRegistrationConfig, requireClassSection: e.target.checked })}
                className="rounded"
              />
              <span>الصف والشعبة (مثال: العاشر أ، الأول ثانوي علمي)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={studentRegistrationConfig.requireSeatNumber}
                onChange={(e) => setStudentRegistrationConfig({ ...studentRegistrationConfig, requireSeatNumber: e.target.checked })}
                className="rounded"
              />
              <span>الرقم التعريفي أو رقم الجلوس</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={studentRegistrationConfig.requireSchoolName}
                onChange={(e) => setStudentRegistrationConfig({ ...studentRegistrationConfig, requireSchoolName: e.target.checked })}
                className="rounded"
              />
              <span>اسم المدرسة</span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link to={shareableLink.replace(window.location.origin, '')} target="_blank">
              <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1 text-cyan-600 dark:text-cyan-400">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>معاينة شاشة الطالب</span>
              </Button>
            </Link>

            <Button
              onClick={() => setIsShareModalOpen(false)}
              className="rounded-xl text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
            >
              تم الانتهاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamGeneratorStudio;
