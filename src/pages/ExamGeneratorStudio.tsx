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
  Terminal,
  ChevronRight,
  File,
  Image as ImageIcon,
  FolderOpen,
  Edit3,
  Trash2,
  Plus,
  QrCode,
  Search,
  CheckCircle,
  Maximize2
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
import { DocumentExamSynthesisEngine, type DocumentAnalysisResult } from '@/services/documentExamSynthesisEngine';
import SafeBoundary from '@/components/common/SafeBoundary';
import { BLOOM_LEVELS, CURRICULUM_PRESETS, type CurriculumPreset } from '@/constants/examPresets';

export const ExamGeneratorStudio: React.FC = () => {
  const navigate = useNavigate();

  // Mode Selection: 'studio' (Creation) vs 'submissions' (Student Results)
  const [activeTab, setActiveTab] = useState<'create' | 'submissions'>('create');
  const [outputMode, setOutputMode] = useState<'questions' | 'full_exam'>('full_exam');

  // Generation Source: 'file' (Default & primary) vs 'curriculum_preset'
  const [creationSource, setCreationSource] = useState<'file' | 'curriculum_preset'>('file');

  // File Upload State & Deep AI Analysis Pipeline
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [parsingStage, setParsingStage] = useState<number>(0);
  const [parsedFile, setParsedFile] = useState<ParsedDocumentResult | null>(null);
  const [docAnalysis, setDocAnalysis] = useState<DocumentAnalysisResult | null>(null);
  const [analysisActiveTab, setAnalysisActiveTab] = useState<'definitions' | 'laws' | 'causes' | 'classifications' | 'raw_text'>('definitions');
  const [useFileStrictly, setUseFileStrictly] = useState(true);

  // Exam Specifications
  const [subject, setSubject] = useState('');
  const [targetLevel, setTargetLevel] = useState('الثانوية العامة (التوجيهي الأردني)');
  const [bloom, setBloom] = useState<BloomLevel>('analyze');
  const [qType, setQType] = useState<QuestionType>('all_mixed');
  const [count, setCount] = useState(8);
  const [topic, setTopic] = useState('');
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

  // Print Mode & Watermark State
  const [printAnswerKey, setPrintAnswerKey] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);

  // Question Inline Editing State
  const [editingQuestion, setEditingQuestion] = useState<GeneratedQuestion | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Submissions Details Modal State
  const [selectedSubmissionForView, setSelectedSubmissionForView] = useState<StudentExamSubmission | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

  // Apply Fast-Track Curriculum Preset
  const handleApplyPreset = (preset: CurriculumPreset) => {
    setCreationSource('curriculum_preset');
    setSubject(preset.subject);
    setTargetLevel(preset.targetLevel);
    setTopic(preset.topic);
    setExamDuration(preset.durationMinutes);
    setExamTotalMarks(preset.totalMarks);
    setAdditionalNotes(preset.notes);
    toast.success(`تم اختيار المنهاج: ${preset.title} بنجاح! جاهز للتوليد الفوري ⚡`);
  };

  // Remove or Reset Uploaded File
  const handleRemoveUploadedFile = () => {
    setParsedFile(null);
    setDocAnalysis(null);
    setParsingStage(0);
    setSubject('');
    setTopic('');
    setGeneratedExam(null);
    setGeneratedQuestions([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('تمت إزالة الملف. يمكنك الآن رفع ملف منهاج جديد 📄');
  };

  // Open Edit Modal for a Question
  const handleOpenEditQuestion = (q: GeneratedQuestion) => {
    setEditingQuestion(JSON.parse(JSON.stringify(q)));
    setIsEditModalOpen(true);
  };

  // Save Changes to Question
  const handleSaveEditedQuestion = () => {
    if (!editingQuestion || !generatedExam) return;

    const updatedSections = generatedExam.sections.map(sec => ({
      ...sec,
      questions: sec.questions.map(q => q.id === editingQuestion.id ? editingQuestion : q)
    }));

    const allQs = updatedSections.flatMap(s => s.questions);
    const newTotal = allQs.reduce((sum, q) => sum + (q.points || 0), 0);

    const updatedExam: FullExamStructure = {
      ...generatedExam,
      sections: updatedSections,
      totalMarks: newTotal
    };

    setGeneratedExam(updatedExam);
    setGeneratedQuestions(allQs);
    setExamTotalMarks(newTotal);
    setIsEditModalOpen(false);
    setEditingQuestion(null);
    toast.success('تم حفظ التعديلات على السؤال وتحديث مجموع علامات الورقة! ✏️');
  };

  // Delete Question
  const handleDeleteQuestion = (qId: string) => {
    if (!generatedExam) return;
    const updatedSections = generatedExam.sections.map(sec => ({
      ...sec,
      questions: sec.questions.filter(q => q.id !== qId)
    }));
    const allQs = updatedSections.flatMap(s => s.questions);
    const newTotal = allQs.reduce((sum, q) => sum + (q.points || 0), 0);
    const updatedExam: FullExamStructure = {
      ...generatedExam,
      sections: updatedSections,
      totalMarks: newTotal
    };
    setGeneratedExam(updatedExam);
    setGeneratedQuestions(allQs);
    setExamTotalMarks(newTotal);
    toast.info('تم حذف السؤال وتحديث مجموع العلامات');
  };

  // Add Custom Question Manually
  const handleAddCustomQuestion = () => {
    if (!generatedExam) return;
    const newQ: GeneratedQuestion = {
      id: `q-custom-${Date.now()}`,
      type: 'mcq',
      bloomLevel: 'apply',
      questionText: 'نص السؤال الإضافي: اكتب هنا نص السؤال أو المسألة الامتحانية...',
      points: 5,
      options: [
        { label: 'أ', text: 'الخيار الأول (صحيح)', isCorrect: true, explanation: 'تبرير الإجابة الصحيحة' },
        { label: 'ب', text: 'الخيار الثاني', isCorrect: false, explanation: 'غير صحيح' },
        { label: 'ج', text: 'الخيار الثالث', isCorrect: false, explanation: 'غير صحيح' },
        { label: 'د', text: 'الخيار الرابع', isCorrect: false, explanation: 'غير صحيح' }
      ],
      correctAnswer: 'أ',
      rationale: 'التبرير العلمي للإجابة الصحيحة'
    };

    const updatedSections = [...generatedExam.sections];
    if (updatedSections.length === 0) {
      updatedSections.push({
        sectionTitle: 'القسم الأول',
        sectionDescription: 'أسئلة عامة',
        questions: [newQ]
      });
    } else {
      updatedSections[0].questions.push(newQ);
    }

    const allQs = updatedSections.flatMap(s => s.questions);
    const newTotal = allQs.reduce((sum, q) => sum + (q.points || 0), 0);
    setGeneratedExam({
      ...generatedExam,
      sections: updatedSections,
      totalMarks: newTotal
    });
    setGeneratedQuestions(allQs);
    setExamTotalMarks(newTotal);
    handleOpenEditQuestion(newQ);
    toast.success('تمت إضافة سؤال جديد إلى ورقة الامتحان! يمكنك تعديله الآن');
  };

  // Handle File Upload and Deep Semantic Pedagogical Analysis Pipeline
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setParsingStage(1);
    toast.info(`جارٍ قراءة وفحص ملف المنهاج: ${file.name}... ⏳`);

    try {
      // Stage 1: File text parsing & OCR
      const result = await fileParserService.parseFile(file);
      setParsedFile(result);

      // Stage 2: Deep Semantic Analysis of propositions, laws, and definitions
      setParsingStage(2);
      await new Promise(r => setTimeout(r, 300));
      setParsingStage(3);
      const analysis = DocumentExamSynthesisEngine.analyzeDocument(result.extractedText, undefined, undefined, file.name);
      setDocAnalysis(analysis);

      // Stage 4: Proposition Classification
      await new Promise(r => setTimeout(r, 200));
      setParsingStage(4);

      // Map domain to Arabic subject name
      const domainToSubject: Record<string, string> = {
        physics: 'الفيزياء (الثانوية العامة - التوجيهي الأردني)',
        chemistry: 'الكيمياء (الثانوية العامة - التوجيهي الأردني)',
        biology: 'العلوم الحياتية (الثانوية العامة - التوجيهي الأردني)',
        mathematics: 'الرياضيات والتفاضل والتكامل (التوجيهي الأردني)',
        technology: 'تكنولوجيا المعلومات وBTEC',
        language_humanities: 'اللغة العربية والعلوم الإنسانية',
        general: 'العلوم العامة والمعارف المتكاملة'
      };

      const detectedSubject = analysis.domain === 'chemistry' 
        ? 'الكيمياء (الثانوية العامة - التوجيهي الأردني)'
        : (domainToSubject[analysis.domain] || 'العلوم العامة والمعارف المتكاملة');
      setSubject(detectedSubject);

      const detectedTopic = analysis.title || (result.topicsSummary.length > 0 && result.topicsSummary[0] !== 'المحتوى العلمي المرفق' ? result.topicsSummary.join(' • ') : file.name.replace(/\.[^/.]+$/, ''));
      setTopic(detectedTopic);

      setParsingStage(5);
      toast.success(`تم قراءة الملف وتحليل ${analysis.propositions.length} قضية علمية بالتفصيل الممل! 📄 (${result.wordCount} كلمة)`);

      // Immediately synthesize the official ministerial examination paper directly from the uploaded file!
      try {
        toast.info('جارٍ توليد ورقة الامتحان الوزاري مباشرة من محتوى كتابك المفحوص... ⚡');
        const exam = await aiExamService.generateOfficialExam({
          subject: detectedSubject,
          gradeLevel: targetLevel,
          topic: detectedTopic,
          durationMinutes: examDuration,
          totalMarks: examTotalMarks,
          uploadedFileText: result.extractedText,
          sourceDocumentName: file.name,
          includeDiagrams,
          includeTables
        });
        if (schoolName) exam.schoolName = schoolName;
        setGeneratedExam(exam);
        setGeneratedQuestions(exam.sections.flatMap(s => s.questions));
        toast.success(`تم بنجاح توليد ورقة الامتحان الوزاري المشتقة 100% من كتابك (${file.name})! 📄`);
      } catch (genErr) {
        console.warn('Auto generation after upload notice:', genErr);
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      toast.error('حدث خطأ أثناء قراءة الملف، تأكد من سلامة المستند أو الصورة');
    } finally {
      setIsParsingFile(false);
    }
  };

  // Generate Questions
  const handleGenerateQuestions = async () => {
    if (creationSource === 'file' && !parsedFile) {
      toast.error('يرجى رفع ملف المنهاج أولاً ليتمكن الذكاء الاصطناعي من قراءته وتوليد الامتحان منه!');
      return;
    }

    setIsGenerating(true);
    try {
      const effectiveFileText = (creationSource === 'file' && parsedFile) 
        ? parsedFile.extractedText 
        : (useFileStrictly && parsedFile ? parsedFile.extractedText : undefined);

      const questions = await aiExamService.generateQuestions({
        subject: subject || (parsedFile ? 'المنهاج المرفوع' : 'العلوم العامة'),
        targetLevel,
        bloom,
        qType,
        count,
        topic: topic || (parsedFile ? parsedFile.fileName : 'محتوى الوثيقة'),
        additionalNotes,
        uploadedFileText: effectiveFileText,
        includeDiagrams,
        includeTables
      });

      setGeneratedQuestions(questions);

      const synthesizedExam: FullExamStructure = {
        id: `exam-${Date.now()}`,
        examTitle: `امتحان التقييم في مادة ${subject || 'المنهاج'} - ${topic || 'المحتوى المرفق'}`,
        subject: subject || 'المنهاج المعتمد',
        gradeLevel: targetLevel,
        durationMinutes: examDuration,
        totalMarks: examTotalMarks,
        schoolName: schoolName || 'مدرسة عنبه الثانية الشاملة للبنين',
        academicYear: '2025 / 2026',
        sourceDocumentName: parsedFile?.fileName,
        instructions: [
          'أجب عن جميع الأسئلة الواردة في الورقة الامتحانية وتأكد من عدد الصفحات.',
          'الأسئلة مستخرجة ومبنية بدقة استناداً لوثيقة المنهاج المرفوعة.',
          'وضح خطوات الحل والقوانين الرياضية المستخدمة في المسائل الحسابية بدقة.',
          'يُراعى الدقة في كتابة الوحدات الفيزيائية ورموز المعادلات.'
        ],
        sections: [
          {
            sectionTitle: `القسم الشامل: بنك أسئلة ${subject || 'المنهاج'} (${topic || 'مستخرج من الملف'})`,
            sectionDescription: 'أجب عن جميع الأسئلة الآتية بدقة وعناية استناداً للمنهاج المقرر:',
            questions
          }
        ]
      };
      setGeneratedExam(synthesizedExam);

      auditLogger.record({
        action: 'AI_QUERY',
        module: 'Exam Studio',
        description: `توليد ${questions.length} أسئلة بمستوى (${bloom}) مشتقة من (${parsedFile?.fileName || topic})`,
        user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
        severity: 'info'
      });

      toast.success(`تم توليد ${questions.length} أسئلة مشتقة 100% من ملفك وتجهيز الامتحان بنجاح 🚀`);
    } catch {
      toast.error('حدث خطأ أثناء التوليد');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Full Official Exam
  const handleGenerateFullExam = async () => {
    if (creationSource === 'file' && !parsedFile) {
      toast.error('يرجى رفع ملف المنهاج أولاً ليتمكن الذكاء الاصطناعي من قراءته وتوليد الامتحان منه!');
      return;
    }

    setIsGenerating(true);
    try {
      const effectiveFileText = (creationSource === 'file' && parsedFile) 
        ? parsedFile.extractedText 
        : (useFileStrictly && parsedFile ? parsedFile.extractedText : undefined);

      const exam = await aiExamService.generateOfficialExam({
        subject: subject || (parsedFile ? 'المنهاج المرفوع' : 'الفيزياء'),
        gradeLevel: targetLevel,
        topic: topic || (parsedFile ? parsedFile.fileName : 'محتوى الوثيقة'),
        durationMinutes: examDuration,
        totalMarks: examTotalMarks,
        uploadedFileText: effectiveFileText,
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
        description: `توليد ورقة امتحان رسمي متكامل مشتق من (${parsedFile?.fileName || subject}) علامات: ${examTotalMarks}`,
        user: { id: 'admin-master', name: 'المشرف العام', email: 'jowmahmoud6@gmail.com', role: 'super_admin' },
        severity: 'info'
      });

      toast.success('تم تصميم ورقة الامتحان الوزاري المشتقة 100% من ملفك بنجاح 📄');
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

  // Load submissions when switching tabs (Local + Supabase Cloud)
  useEffect(() => {
    if (activeExamPackageId) {
      setSubmissions(aiExamService.getSubmissionsForExam(activeExamPackageId));
      aiExamService.getSubmissionsForExamAsync(activeExamPackageId).then(cloudSubs => {
        setSubmissions(cloudSubs);
      }).catch(() => {});
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

              {/* Status Badge & Link to Developer Hub */}
              <Link
                to="/api-keys"
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs hover:border-blue-500 hover:shadow-md transition-all group"
                title="فتح واجهة المطورين وإدارة المفاتيح والمختبر التفاعلي"
              >
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 transition-colors">
                  <Terminal className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span>بوابة المطورين والـ API</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">ak_live ✓ (مفعل ومعتمد)</span>
                </div>
              </Link>
            </div>

            {/* Mode Switcher: File Upload vs Curriculum Presets */}
            <div className="space-y-3 print:hidden">
              <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setCreationSource('file');
                    if (!parsedFile) {
                      setSubject('');
                      setTopic('');
                    }
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    creationSource === 'file'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>1. توليد امتحان ذكي مشتق 100% من ملف منهاج / دوسية مرفوعة (PDF / Word / صور)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">الموصى به</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreationSource('curriculum_preset');
                    if (!subject) setSubject('الفيزياء الحديثة والكلاسيكية');
                    if (!topic) setTopic('الفيزياء الذرية والنووية: ميكانيكا الكم، أطياف الانبعاث، والتأثير الكهروضوئي');
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    creationSource === 'curriculum_preset'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>2. توليد سريع من بنك المناهج العامة المعتمدة (بدون ملف)</span>
                </button>
              </div>

              {/* Show Curriculum Presets only when preset mode is chosen */}
              {creationSource === 'curriculum_preset' && (
                <div className="space-y-2.5 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-500" />
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        نماذج المناهج المعتمدة الجاهزة للاختيار السريع:
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">انقر لتعبئة المواصفات وتوليد الامتحان فوراً</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {CURRICULUM_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className="group p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-right hover:border-cyan-400 hover:shadow-md transition-all flex flex-col justify-between h-24"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-base">{preset.icon}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-950/50 group-hover:text-cyan-600">
                            {preset.badge}
                          </span>
                        </div>
                        <div>
                          <div className="text-[11px] font-black text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                            {preset.title.split(':')[0]}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {preset.totalMarks} علامة &bull; {preset.durationMinutes} دقيقة
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Informative Hint for File Mode */}
              {creationSource === 'file' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300/40 text-xs flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>نمط اشتقاق الامتحان من ملفك الخاص: </strong>
                      الذكاء الاصطناعي سيقرأ ملفك كلمة بكلمة ويستخرج القوانين والمفاهيم وأسباب الظواهر بالتفصيل الممل قبل التوليد.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCreationSource('curriculum_preset');
                      if (!subject) setSubject('الفيزياء الحديثة والكلاسيكية');
                      if (!topic) setTopic('الفيزياء الذرية والنووية: ميكانيكا الكم، أطياف الانبعاث، والتأثير الكهروضوئي');
                    }}
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold underline shrink-0 hover:text-cyan-700"
                  >
                    ليس لديك ملف؟ جرب المناهج الجاهزة
                  </button>
                </div>
              )}
            </div>

            {/* Studio Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
              
              {/* Left Control Panel: Upload, Specs, & Generation (Hidden on Print) */}
              <div className="lg:col-span-5 space-y-5 print:hidden">
                
                {/* 1. Intelligent Document Upload Box & Deep Analysis Dashboard */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        رفع وفحص ملف المنهاج بالذكاء الاصطناعي (PDF, Word, صور, TXT)
                      </h3>
                    </div>
                    {parsedFile && (
                      <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        تم الفحص والتحليل الدلالي بنجاح ✓
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

                  {!parsedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 rounded-2xl border-2 border-dashed cursor-pointer text-center space-y-3 transition-all ${
                        isParsingFile
                          ? 'border-cyan-400 bg-cyan-50/20 dark:bg-cyan-950/20'
                          : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/10 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        {isParsingFile ? (
                          <RefreshCw className="w-6 h-6 animate-spin text-cyan-600" />
                        ) : (
                          <UploadCloud className="w-6 h-6" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                          {isParsingFile ? 'محرك الذكاء الاصطناعي يفحص المستند الآن...' : 'انقر لاختيار ملف المنهاج أو اسحبه هنا'}
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          يدعم ملفات PDF المدرسية والجامعية، مستندات Word (.docx)، دوسيات مصورة، وملفات نصية.
                        </p>
                      </div>

                      {/* Real-time Multi-Stage Analysis Progress */}
                      {isParsingFile && (
                        <div className="pt-2 max-w-sm mx-auto space-y-2 text-right">
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(15, parsingStage * 25))}%` }}
                            />
                          </div>
                          <div className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300 flex items-center justify-between">
                            <span>
                              {parsingStage === 1 && 'المرحلة 1: قراءة الملف واستخراج النصوص والرموز (OCR)...'}
                              {parsingStage === 2 && 'المرحلة 2: التعدين الدلالي وتفكيك المصطلحات والمفاهيم...'}
                              {parsingStage === 3 && 'المرحلة 3: استخراج القوانين والمعادلات والعلاقات الرياضية...'}
                              {parsingStage === 4 && 'المرحلة 4: استخراج علاقات التعليل والأسباب وظواهر "علل"...'}
                              {parsingStage >= 5 && 'المرحلة 5: اكتمل التحليل وتجهيز بنك القضايا المشتقة!'}
                            </span>
                            <span className="font-mono">{Math.min(5, Math.max(1, parsingStage))}/5</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Deep Document AI Analysis Dashboard */
                    <div className="space-y-3">
                      {/* File Info Bar */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <div className="font-black text-slate-800 dark:text-slate-100 truncate">{parsedFile.fileName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {Math.round(parsedFile.fileSize / 1024)} KB &bull; {parsedFile.wordCount} كلمة مستخرجة
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleRemoveUploadedFile}
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-[11px] h-8 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 gap-1 shrink-0"
                          title="حذف الملف ورفع ملف آخر"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>تغيير الملف</span>
                        </Button>
                      </div>

                      {/* 4 Key Metric Stat Cards */}
                      {docAnalysis && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                            <div className="text-[10px] text-slate-400 font-bold">المفاهيم والتعريفات</div>
                            <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                              {docAnalysis.keyDefinitions.length}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                            <div className="text-[10px] text-slate-400 font-bold">القوانين والمعادلات</div>
                            <div className="text-base font-black text-cyan-600 dark:text-cyan-400 font-mono">
                              {docAnalysis.keyLaws.length}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                            <div className="text-[10px] text-slate-400 font-bold">أسباب وظواهر "علل"</div>
                            <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                              {docAnalysis.keyCauses.length}
                            </div>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                            <div className="text-[10px] text-slate-400 font-bold">إجمالي القضايا المفحوصة</div>
                            <div className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
                              {docAnalysis.propositions.length}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Interactive Tabs for Deep Content Inspection */}
                      {docAnalysis && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
                            <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                              <span>لوحة التحليل العميق والمفصل للمحتوى:</span>
                            </div>
                          </div>

                          {/* Sub Tab Buttons */}
                          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                            <button
                              type="button"
                              onClick={() => setAnalysisActiveTab('definitions')}
                              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                                analysisActiveTab === 'definitions'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              المفاهيم ({docAnalysis.keyDefinitions.length})
                            </button>

                            <button
                              type="button"
                              onClick={() => setAnalysisActiveTab('laws')}
                              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                                analysisActiveTab === 'laws'
                                  ? 'bg-cyan-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              القوانين ({docAnalysis.keyLaws.length})
                            </button>

                            <button
                              type="button"
                              onClick={() => setAnalysisActiveTab('causes')}
                              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                                analysisActiveTab === 'causes'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              الظواهر و"علل" ({docAnalysis.keyCauses.length})
                            </button>

                            <button
                              type="button"
                              onClick={() => setAnalysisActiveTab('classifications')}
                              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                                analysisActiveTab === 'classifications'
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              التصنيفات ({docAnalysis.keyClassifications.length})
                            </button>

                            <button
                              type="button"
                              onClick={() => setAnalysisActiveTab('raw_text')}
                              className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                                analysisActiveTab === 'raw_text'
                                  ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                              }`}
                            >
                              معاينة النص الكامل 📄
                            </button>
                          </div>

                          {/* Sub Tab Content */}
                          <div className="max-h-48 overflow-y-auto space-y-2 text-xs pr-1">
                            {analysisActiveTab === 'definitions' && (
                              docAnalysis.keyDefinitions.length > 0 ? (
                                docAnalysis.keyDefinitions.map((def, idx) => (
                                  <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                                    <div className="font-black text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                                      <span>{idx + 1}. {def.term}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">مفهوم علمي</span>
                                    </div>
                                    <div className="text-[11px] text-slate-700 dark:text-slate-300">{def.definition}</div>
                                    <div className="text-[10px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                      <span className="text-emerald-600 font-bold">اقتباس حرفي: </span>«{def.rawExcerpt}»
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 text-slate-400 text-xs">تم فحص النص ككتلة دلالية متكاملة للاشتقاق المباشر.</div>
                              )
                            )}

                            {analysisActiveTab === 'laws' && (
                              docAnalysis.keyLaws.length > 0 ? (
                                docAnalysis.keyLaws.map((law, idx) => (
                                  <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-cyan-100 dark:border-cyan-900/40 space-y-1">
                                    <div className="font-black text-cyan-700 dark:text-cyan-400 flex items-center justify-between">
                                      <span>{idx + 1}. {law.lawName}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600">قانون / علاقة</span>
                                    </div>
                                    <div className="text-[11px] text-slate-700 dark:text-slate-300">{law.rule}</div>
                                    <div className="text-[10px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                      <span className="text-cyan-600 font-bold">اقتباس حرفي: </span>«{law.rawExcerpt}»
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 text-slate-400 text-xs">لا توجد صياغات قوانين رياضية صريحة في هذا المقطع.</div>
                              )
                            )}

                            {analysisActiveTab === 'causes' && (
                              docAnalysis.keyCauses.length > 0 ? (
                                docAnalysis.keyCauses.map((c, idx) => (
                                  <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/40 space-y-1">
                                    <div className="font-black text-amber-700 dark:text-amber-400 flex items-center justify-between">
                                      <span>الظاهرة: {c.phenomenon}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">تفسير / علل</span>
                                    </div>
                                    <div className="text-[11px] text-slate-700 dark:text-slate-300">
                                      <strong className="text-amber-600">السبب العلمي: </strong>{c.cause}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                      <span className="text-amber-600 font-bold">اقتباس حرفي: </span>«{c.rawExcerpt}»
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 text-slate-400 text-xs">تم استخراج القضايا المعرفية في بنك الأسئلة العام.</div>
                              )
                            )}

                            {analysisActiveTab === 'classifications' && (
                              docAnalysis.keyClassifications.length > 0 ? (
                                docAnalysis.keyClassifications.map((cl, idx) => (
                                  <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 space-y-1">
                                    <div className="font-black text-purple-700 dark:text-purple-400">
                                      {idx + 1}. الفئة: {cl.category}
                                    </div>
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {cl.items.map((it, iIdx) => (
                                        <span key={iIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-400/20 font-bold">
                                          {it}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 text-slate-400 text-xs">لا توجد تصنيفات مجدولة في هذا المقطع.</div>
                              )
                            )}

                            {analysisActiveTab === 'raw_text' && (
                              <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                                {parsedFile.extractedText}
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-emerald-700 dark:text-emerald-300">
                              <input
                                type="checkbox"
                                checked={useFileStrictly}
                                onChange={(e) => setUseFileStrictly(e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>توليد الامتحان حصرياً 100% من نصوص ومعطيات هذا الملف</span>
                            </label>
                          </div>
                        </div>
                      )}
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
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>المبحث الدراسي:</span>
                        {docAnalysis && <span className="text-[10px] text-emerald-600 font-bold">مستنتج من الملف ✓</span>}
                      </label>
                      <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={creationSource === 'file' ? "سيستنتجه الذكاء الاصطناعي من ملفك..." : "مثال: الفيزياء، الكيمياء، الأحياء..."}
                        className="w-full text-xs h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                      />
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
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>موضوع أو وحدة الاختبار:</span>
                      {docAnalysis && <span className="text-[10px] text-emerald-600 font-bold">مستنتج من الملف ✓</span>}
                    </label>
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder={creationSource === 'file' ? "سيستنتجه الذكاء الاصطناعي من ملفك أو اكتبه هنا..." : "مثال: التأثير الكهروضوئي، قانون أوم، البناء الضوئي..."}
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
                        className="rounded text-cyan-600"
                      />
                      <span className="font-bold">إنشاء أشكال ورسوم توضيحية علمية للأسئلة (Diagrams & SVGs)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={includeTables}
                        onChange={(e) => setIncludeTables(e.target.checked)}
                        className="rounded text-cyan-600"
                      />
                      <span className="font-bold">إنشاء جداول بيانات علمية وتجارب معملية (Data Tables)</span>
                    </label>
                  </div>

                  {/* Generation Trigger Button with Strict File Gating */}
                  {creationSource === 'file' && !parsedFile ? (
                    <div className="space-y-2 pt-2">
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">يرجى رفع ملف المنهاج أولاً</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            لن يتم توليد أي امتحان افتراضي مسبق. الذكاء الاصطناعي بانتظار رفع ملفك ليقرأه بالتفصيل ويستخرج الأسئلة حصرياً منه.
                          </span>
                        </div>
                      </div>
                      <Button
                        disabled
                        className="w-full h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black text-xs cursor-not-allowed opacity-75"
                      >
                        <UploadCloud className="w-4 h-4 ml-1.5" />
                        <span>يرجى رفع ملف المنهاج أولاً لبدء الفحص والتوليد 📄</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={outputMode === 'full_exam' ? handleGenerateFullExam : handleGenerateQuestions}
                      disabled={isGenerating}
                      className={`w-full h-12 rounded-2xl text-white font-black text-xs shadow-lg transition-all ${
                        creationSource === 'file'
                          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-emerald-500/25'
                          : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-cyan-500/20'
                      }`}
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4 animate-spin" />
                          <span>جاري توليد الأسئلة المشتقة من نصوص ومعادلات ملفك بدقة...</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          <span>
                            {outputMode === 'full_exam'
                              ? (parsedFile && useFileStrictly 
                                  ? `🚀 ابدأ توليد ورقة الامتحان الوزاري المشتقة 100% من ملفك (${parsedFile.fileName.slice(0, 22)})` 
                                  : 'توليد ورقة الامتحان الوزاري المتكاملة 📄')
                              : (parsedFile && useFileStrictly 
                                  ? `⚡ ابدأ توليد بنك الأسئلة المشتق 100% من ملفك (${parsedFile.fileName.slice(0, 22)})` 
                                  : 'توليد بنك الأسئلة المخصص فورياً ⚡')}
                          </span>
                        </span>
                      )}
                    </Button>
                  )}
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
                      {/* Add Custom Question */}
                      <Button
                        onClick={handleAddCustomQuestion}
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs gap-1 border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400"
                        title="إضافة سؤال مخصص إلى ورقة الامتحان"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة سؤال</span>
                      </Button>

                      {/* Watermark Toggle */}
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pr-1 border-r border-slate-200 dark:border-slate-800">
                        <input
                          type="checkbox"
                          checked={showWatermark}
                          onChange={(e) => setShowWatermark(e.target.checked)}
                          className="rounded text-cyan-600"
                        />
                        <span className="hidden sm:inline">علامة مائية</span>
                      </label>

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
                  <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 print:border-black print:shadow-none print:p-4 print:bg-white print:text-black">
                    
                    {/* Watermark */}
                    {showWatermark && (
                      <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.025] rotate-[-25deg] text-5xl font-black text-slate-900 dark:text-white print:opacity-[0.05] print:text-black">
                        امتحان رسمي معتمد &bull; {generatedExam.schoolName}
                      </div>
                    )}

                    {/* Verified Source Document Banner */}
                    {(generatedExam.sourceDocumentName || parsedFile) && (
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs flex items-center justify-between text-emerald-800 dark:text-emerald-300 print:hidden">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            <strong>وثيقة المصدر المعتمدة: </strong>
                            تم اشتقاق وصياغة هذا الامتحان بالكامل من ملف: <code className="font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-900 dark:text-emerald-100 font-bold">{generatedExam.sourceDocumentName || parsedFile?.fileName}</code>
                          </span>
                        </div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold shrink-0">
                          مشتق 100% من الملف ✓
                        </span>
                      </div>
                    )}

                    {/* Official Ministerial Header */}
                    <div className="relative text-center space-y-1.5 pb-4 border-b-2 border-slate-800 dark:border-slate-200 print:border-black">
                      {/* Official Coat of Arms / Emblem SVG */}
                      <div className="flex justify-center mb-1">
                        <svg className="w-10 h-10 text-slate-800 dark:text-slate-200 print:text-black" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M50 10 L62 25 L85 28 L72 45 L76 70 L50 60 L24 70 L28 45 L15 28 L38 25 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5"/>
                          <circle cx="50" cy="42" r="16" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                          <path d="M42 42 L50 32 L58 42 L54 50 L46 50 Z" fill="currentColor"/>
                          <path d="M25 80 Q50 95 75 80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
                          <line x1="35" y1="88" x2="65" y2="88" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>

                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 print:text-black">
                        المملكة الأردنية الهاشمية &bull; وزارة التربية والتعليم
                      </div>
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-400 print:text-black">
                        مديرية التربية والتعليم &bull; {generatedExam.schoolName}
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

                    {/* Official Ministry Grade Rubric Table */}
                    <div className="overflow-x-auto my-2">
                      <table className="w-full text-xs border-collapse border border-slate-800 dark:border-slate-300 print:border-black text-center">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 print:bg-slate-100 font-bold">
                            <th className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5">السؤال</th>
                            <th className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5">س 1 (موضوعي)</th>
                            <th className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5">س 2 (حسابي)</th>
                            <th className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5">س 3 (تحليلي)</th>
                            <th className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5 bg-cyan-50 dark:bg-cyan-950/40 print:bg-slate-200">المجموع النهائي</th>
                            <th className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5">توقيع المصحح</th>
                            <th className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5">توقيع المدقق</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5 font-bold">العلامة القصوى</td>
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5">40</td>
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5">30</td>
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5">30</td>
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5 font-bold bg-cyan-50 dark:bg-cyan-950/40 print:bg-slate-200">
                              {generatedExam.totalMarks}
                            </td>
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5" rowSpan={2}></td>
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5" rowSpan={2}></td>
                          </tr>
                          <tr className="h-7">
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5 font-bold">العلامة المستحقة</td>
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5"></td>
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5"></td>
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5"></td>
                            <td className="border border-slate-400 dark:border-slate-600 print:border-black p-1.5 bg-cyan-50 dark:bg-cyan-950/40 print:bg-slate-200"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Student Metadata Box (Hidden on Answer Key) */}
                    {!printAnswerKey && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 text-xs print:border-black print:bg-white print:text-black">
                        <div>اسم الطالب: .......................................</div>
                        <div>الصف والشعبة: ....................</div>
                        <div>رقم الجلوس: ....................</div>
                        <div>اسم المعلم: ....................</div>
                      </div>
                    )}

                    {/* OMR Multiple Choice Answer Sheet */}
                    {!printAnswerKey && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-300 dark:border-slate-700 text-xs print:border-black print:bg-white">
                        <div className="text-[11px] font-bold text-center mb-1 text-slate-700 dark:text-slate-300 print:text-black">
                          جدول تفريغ وتظليل إجابات الأسئلة الموضوعية (OMR Sheet)
                        </div>
                        <table className="w-full text-center border-collapse border border-slate-400 print:border-black text-[11px]">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 print:bg-slate-100 font-bold">
                              <td className="border border-slate-400 print:border-black p-1">الفقرة</td>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                <td key={n} className="border border-slate-400 print:border-black p-1">{n}</td>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="h-7">
                              <td className="border border-slate-400 print:border-black p-1 font-bold">الرمز</td>
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                <td key={n} className="border border-slate-400 print:border-black p-1"></td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
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
                                    <div className="font-bold text-slate-900 dark:text-white print:text-black leading-relaxed flex-1">
                                      س {qIdx + 1}) {q.questionText}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 print:text-black print:border">
                                        ({q.points} علامات)
                                      </span>
                                      <button
                                        onClick={() => handleOpenEditQuestion(q)}
                                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-cyan-600 transition-colors print:hidden"
                                        title="تعديل هذا السؤال"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors print:hidden"
                                        title="حذف هذا السؤال"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
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
                  <div className="p-8 sm:p-14 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-6 print:hidden">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <FileText className="w-8 h-8" />
                    </div>

                    <div className="space-y-2 max-w-lg mx-auto">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {creationSource === 'file'
                          ? (parsedFile 
                              ? `تم تحليل الملف (${parsedFile.fileName}) وهو جاهز للتوليد الآن!`
                              : 'استوديو توليد الامتحانات من ملف المنهاج والدوسيات')
                          : 'استوديو الامتحانات جاهز لتوليد ورقتك الامتحانية فوراً'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {creationSource === 'file'
                          ? (parsedFile
                              ? `محرك الذكاء الاصطناعي استخرج ${docAnalysis?.propositions.length || 0} قضية ومعادلة علمية من ملفك. اضغط زر "ابدأ توليد ورقة الامتحان" في لوحة التحكم لبدء التوليد الفوري.`
                              : 'لن يتم توليد أي امتحان افتراضي مسبق قبل رفع ملفك. يرجى رفع ملف المنهاج ليقوم محرك الذكاء الاصطناعي بقراءته بالتفصيل الممل، واستخراج أسئلته حصرياً منه.')
                          : 'حدد المبحث والموضوع المطلوبين، أو اختر من نماذج المناهج المعتمدة أعلاه، ثم اضغط على زر التوليد.'}
                      </p>
                    </div>

                    {/* 3 Step Visual Guide for File Mode */}
                    {creationSource === 'file' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-right pt-2">
                        <div className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                          parsedFile 
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}>
                          <div className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200">
                            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-mono">1</span>
                            <span>رفع وثيقة المنهاج</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            ارفع ملف PDF أو Word أو صور ملخصات أو نصوص الدوسية المعتمدة.
                          </p>
                          {parsedFile && (
                            <span className="inline-block text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                              مكتمل ✓
                            </span>
                          )}
                        </div>

                        <div className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                          docAnalysis 
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                        }`}>
                          <div className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200">
                            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 flex items-center justify-center text-xs font-mono">2</span>
                            <span>التحليل والتعدين العميق</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            قراءة كلمة بكلمة واستخراج المفاهيم والقوانين والعلاقات وأسباب الظواهر.
                          </p>
                          {docAnalysis && (
                            <span className="inline-block text-[10px] text-cyan-600 font-bold bg-cyan-100 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full">
                              تم التعدين ({docAnalysis.propositions.length} قضية) ✓
                            </span>
                          )}
                        </div>

                        <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-black text-slate-800 dark:text-slate-200">
                            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-mono">3</span>
                            <span>توليد الامتحان المخصص</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            ورقة امتحان رسمي ونموذج إجابة وتبرير مستخرج 100% من نصوص ملفك.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Quick Trigger Button if file is not uploaded yet */}
                    {creationSource === 'file' && !parsedFile && (
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-2xl text-xs h-10 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold gap-2 shadow-md shadow-emerald-500/20"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>انقر هنا لرفع ملف المنهاج وبدء الفحص الآن 📄</span>
                      </Button>
                    )}

                    {/* Direct Generation Button if file is uploaded and ready */}
                    {creationSource === 'file' && parsedFile && !generatedExam && (
                      <Button
                        type="button"
                        onClick={handleGenerateFullExam}
                        disabled={isGenerating}
                        className="rounded-2xl text-xs h-12 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-black gap-2 shadow-lg shadow-emerald-500/25 hover:from-emerald-500 hover:to-cyan-500"
                      >
                        {isGenerating ? (
                          <span className="flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 animate-spin" />
                            <span>جارٍ توليد الامتحان من كتابك...</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span>🚀 اضغط هنا لتوليد ورقة الامتحان الوزاري الآن من كتابك ({parsedFile.fileName.slice(0, 30)})</span>
                          </span>
                        )}
                      </Button>
                    )}
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
                      <th className="p-3 font-bold text-center">ورقة الإجابة</th>
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
                        <td className="p-3 text-center">
                          <Button
                            onClick={() => {
                              setSelectedSubmissionForView(sub);
                              setIsSubmissionModalOpen(true);
                            }}
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-xs gap-1 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة الحل</span>
                          </Button>
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
                  رابط وكود الامتحان الإلكتروني التفاعلي للطلاب
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  انسخ الرابط أو اعرض رمز QR ليتمكن الطلاب من مسحه بكاميرا الهاتف والبدء في الاختبار فوراً
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

          {/* QR Code Presentation Box */}
          {shareableLink && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
              <div className="p-2 bg-white rounded-2xl shadow-sm border border-slate-200 shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(shareableLink)}`}
                  alt="QR Code for Exam"
                  className="w-28 h-28 object-contain"
                  loading="lazy"
                />
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
                  <QrCode className="w-4 h-4 text-purple-600" />
                  <span>رمز الاستجابة السريع (QR Code)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  اعرض هذا الرمز عبر شاشة العرض / الداتاشو في قاعة الامتحان ليقوم الطلاب بمسحه والدخول بضغطة واحدة.
                </p>
                <Button
                  onClick={() => {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shareableLink)}`;
                    window.open(qrUrl, '_blank');
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-[11px] h-8 gap-1 text-purple-600 dark:text-purple-400"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>تكبير وطباعة كود QR</span>
                </Button>
              </div>
            </div>
          )}

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
                className="rounded text-purple-600"
              />
              <span>اسم الطالب الكامل (إلزامي)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={studentRegistrationConfig.requireClassSection}
                onChange={(e) => setStudentRegistrationConfig({ ...studentRegistrationConfig, requireClassSection: e.target.checked })}
                className="rounded text-purple-600"
              />
              <span>الصف والشعبة (مثال: العاشر أ، الأول ثانوي علمي)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={studentRegistrationConfig.requireSeatNumber}
                onChange={(e) => setStudentRegistrationConfig({ ...studentRegistrationConfig, requireSeatNumber: e.target.checked })}
                className="rounded text-purple-600"
              />
              <span>الرقم التعريفي أو رقم الجلوس</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={studentRegistrationConfig.requireSchoolName}
                onChange={(e) => setStudentRegistrationConfig({ ...studentRegistrationConfig, requireSchoolName: e.target.checked })}
                className="rounded text-purple-600"
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

      {/* 4. Edit Question Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" dir="rtl">
          {editingQuestion && (
            <>
              <DialogHeader className="text-right">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-cyan-500/10 text-cyan-600">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                      تعديل وتخصيص السؤال الامتحاني
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      يمكنك تعديل نص السؤال، العلامة، الخيارات، والإجابة النموذجية مع تبريرها العلمي.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 text-xs">
                {/* Question Text */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">نص السؤال:</label>
                  <Textarea
                    value={editingQuestion.questionText}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                    className="min-h-[70px] rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                {/* Points & Bloom Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">العلامة المخصصة (درجات):</label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={editingQuestion.points}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, points: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="h-10 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">مستوى بلوم المعرفي:</label>
                    <select
                      value={editingQuestion.bloomLevel}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, bloomLevel: e.target.value as BloomLevel })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      {BLOOM_LEVELS.map(b => (
                        <option key={b.id} value={b.id}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Multiple Choice Options Editor (if MCQ) */}
                {editingQuestion.options && editingQuestion.options.length > 0 && (
                  <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        خيارات الإجابة (حدد الدائرة للإجابة الصحيحة):
                      </span>
                    </div>

                    <div className="space-y-2">
                      {editingQuestion.options.map((opt, oIdx) => (
                        <div key={opt.label} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newOpts = editingQuestion.options!.map((o, i) => ({
                                ...o,
                                isCorrect: i === oIdx
                              }));
                              setEditingQuestion({
                                ...editingQuestion,
                                options: newOpts,
                                correctAnswer: opt.label
                              });
                            }}
                            className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center shrink-0 transition-all ${
                              opt.isCorrect
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                            }`}
                            title={opt.isCorrect ? 'الإجابة الصحيحة' : 'اجعلها الإجابة الصحيحة'}
                          >
                            {opt.label}
                          </button>
                          <Input
                            value={opt.text}
                            onChange={(e) => {
                              const newOpts = [...editingQuestion.options!];
                              newOpts[oIdx] = { ...newOpts[oIdx], text: e.target.value };
                              setEditingQuestion({ ...editingQuestion, options: newOpts });
                            }}
                            className="h-9 text-xs rounded-xl bg-white dark:bg-slate-900"
                            placeholder={`نص الخيار (${opt.label})...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Correct Answer (for non-MCQ or summary) */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">رمز أو ملخص الإجابة النموذجية:</label>
                  <Input
                    value={editingQuestion.correctAnswer || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })}
                    className="h-10 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="مثال: أ أو 25 m/s..."
                  />
                </div>

                {/* Scientific Rationale */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">التفسير والتبرير العلمي للإجابة:</label>
                  <Textarea
                    value={editingQuestion.rationale || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, rationale: e.target.value })}
                    className="min-h-[60px] rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="اكتب التبرير والخطوات العلمية..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Button
                  onClick={() => setIsEditModalOpen(false)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs"
                >
                  إلغاء التعديل
                </Button>

                <Button
                  onClick={handleSaveEditedQuestion}
                  size="sm"
                  className="rounded-xl text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>حفظ التعديلات في ورقة الامتحان</span>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. Student Submission Review Modal */}
      <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" dir="rtl">
          {selectedSubmissionForView && (
            <>
              <DialogHeader className="text-right">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                      ورقة إجابة الطالب: {selectedSubmissionForView.studentName}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      الصف: {selectedSubmissionForView.classSection} &bull; رقم الجلوس: {selectedSubmissionForView.seatNumber || '—'} &bull; المدرسة: {selectedSubmissionForView.schoolName || '—'}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Score Summary Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-bold">العلامة الكلية المحققة:</div>
                  <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                    {selectedSubmissionForView.score} من {selectedSubmissionForView.totalPossible}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                    selectedSubmissionForView.percentage >= 85 ? 'bg-emerald-500/20 text-emerald-600' :
                    selectedSubmissionForView.percentage >= 65 ? 'bg-blue-500/20 text-blue-600' :
                    'bg-rose-500/20 text-rose-600'
                  }`}>
                    النسبة: {selectedSubmissionForView.percentage}%
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">
                    الوقت: {selectedSubmissionForView.timeTakenMinutes} دقيقة &bull; التسليم: {new Date(selectedSubmissionForView.submittedAt).toLocaleTimeString('ar-JO')}
                  </div>
                </div>
              </div>

              {/* Questions Detailed Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  تفاصيل إجابات الطالب فقرة بفقرة:
                </h4>

                {generatedExam?.sections.flatMap(s => s.questions).map((q, idx) => {
                  const studentAns = selectedSubmissionForView.answers[q.id];
                  const isCorrect = q.type === 'mcq' && q.options
                    ? studentAns === q.options.find(o => o.isCorrect)?.label
                    : studentAns === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                        isCorrect
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 font-bold">
                        <span className="text-slate-900 dark:text-white">س {idx + 1}) {q.questionText}</span>
                        <Badge variant={isCorrect ? 'default' : 'destructive'} className="shrink-0 text-[10px]">
                          {isCorrect ? 'صحيحة ✓' : 'خاطئة ✗'}
                        </Badge>
                      </div>

                      <div className="text-[11px] flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <span>إجابة الطالب: <strong className={isCorrect ? 'text-emerald-600 font-black' : 'text-rose-600 font-black'}>{studentAns || 'لم يُجب'}</strong></span>
                        <span>&bull;</span>
                        <span>الإجابة النموذجية: <strong className="text-slate-900 dark:text-white">{q.correctAnswer}</strong></span>
                        <span>&bull;</span>
                        <span>العلامة: <strong>{isCorrect ? q.points : 0} / {q.points}</strong></span>
                      </div>

                      {q.rationale && (
                        <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                          💡 {q.rationale}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-left">
                <Button
                  onClick={() => setIsSubmissionModalOpen(false)}
                  className="rounded-xl text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
                >
                  إغلاق
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamGeneratorStudio;
