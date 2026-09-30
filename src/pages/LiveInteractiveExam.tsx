import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Timer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  GraduationCap, 
  School, 
  Send, 
  Printer, 
  RotateCcw, 
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  aiExamService, 
  type OnlineExamPackage, 
  type StudentExamSubmission,
  type GeneratedQuestion
} from '@/services/aiExamService';

export const LiveInteractiveExam: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();

  // State: Exam Data
  const [examPackage, setExamPackage] = useState<OnlineExamPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Student Entry Form State
  const [studentName, setStudentName] = useState('');
  const [classSection, setClassSection] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [examStarted, setExamStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Exam Answers State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(5400); // 90 mins default
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalSubmission, setFinalSubmission] = useState<StudentExamSubmission | null>(null);

  // Load Exam Package (Local + Cloud)
  useEffect(() => {
    if (!examId) {
      setIsLoading(false);
      return;
    }

    const cached = aiExamService.getOnlineExam(examId);
    if (cached) {
      setExamPackage(cached);
      setTimeLeftSeconds(cached.allowedMinutes * 60);
      setIsLoading(false);
    } else {
      aiExamService.getOnlineExamAsync(examId).then((cloudPkg) => {
        if (cloudPkg) {
          setExamPackage(cloudPkg);
          setTimeLeftSeconds(cloudPkg.allowedMinutes * 60);
        }
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    }
  }, [examId]);

  // Countdown Timer
  useEffect(() => {
    if (!examStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, isSubmitted]);

  // Start Exam
  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      toast.error('يرجى إدخال اسم الطالب الكامل');
      return;
    }
    if (!classSection.trim()) {
      toast.error('يرجى تحديد الصف والشعبة');
      return;
    }

    setExamStarted(true);
    setStartTime(Date.now());
    toast.success('بدأ الاختبار! بالتوفيق والنجاح 🚀');
  };

  // Submit Exam & Auto-Grade
  const handleSubmitExam = () => {
    if (!examPackage || isSubmitted) return;

    const allQuestions = examPackage.exam.sections.flatMap(s => s.questions);
    let totalScore = 0;
    let totalPossible = 0;

    allQuestions.forEach((q) => {
      totalPossible += q.points;
      const studentAns = answers[q.id];

      if (q.type === 'mcq' && q.options) {
        const correctOpt = q.options.find(o => o.isCorrect);
        if (studentAns && correctOpt && studentAns === correctOpt.label) {
          totalScore += q.points;
        }
      } else if (q.type === 'true_false') {
        if (studentAns && studentAns === q.correctAnswer) {
          totalScore += q.points;
        }
      } else {
        // Calculation/essay - award points if answered
        if (studentAns && studentAns.trim().length > 3) {
          totalScore += Math.round(q.points * 0.8);
        }
      }
    });

    const percentage = Math.round((totalScore / (totalPossible || 1)) * 100);
    const timeTakenMinutes = startTime ? Math.max(1, Math.round((Date.now() - startTime) / 60000)) : 1;

    const submission: StudentExamSubmission = {
      id: `sub_${Date.now()}`,
      examId: examPackage.id,
      studentName,
      classSection,
      seatNumber: seatNumber || undefined,
      schoolName: schoolName || examPackage.exam.schoolName,
      answers,
      score: totalScore,
      totalPossible,
      percentage,
      submittedAt: new Date().toISOString(),
      timeTakenMinutes
    };

    aiExamService.submitStudentExam(submission);
    setFinalSubmission(submission);
    setIsSubmitted(true);
    toast.success('تم تسليم الامتحان وتصحيحه بنجاح!');
  };

  // Format Timer mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans" dir="rtl">
        <div className="text-center space-y-3">
          <Clock className="w-8 h-8 text-cyan-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">جارٍ تهيئة قاعة الاختبار الإلكتروني...</p>
        </div>
      </div>
    );
  }

  if (!examPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans" dir="rtl">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">الامتحان غير متاح أو الرابط غير صحيح</h2>
          <p className="text-xs text-slate-500">
            يرجى التأكد من صحة الرابط أو مراجعة معلم المادة للحصول على الرابط المعتمد.
          </p>
          <Link to="/">
            <Button className="rounded-xl text-xs bg-cyan-600 text-white font-bold">
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const allQuestions = examPackage.exam.sections.flatMap(s => s.questions);
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / (allQuestions.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060919] text-slate-900 dark:text-slate-100 flex flex-col font-sans" dir="rtl">
      
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
            <BookOpen className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
              {examPackage.exam.examTitle}
            </h1>
            <p className="text-[10px] text-slate-400">
              {examPackage.exam.schoolName} &bull; {examPackage.exam.subject}
            </p>
          </div>
        </div>

        {examStarted && !isSubmitted && (
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center gap-2 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
              <Timer className="w-3.5 h-3.5 animate-pulse" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            <Button
              onClick={handleSubmitExam}
              size="sm"
              className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>تسليم الاختبار</span>
            </Button>
          </div>
        )}
      </header>

      {/* 2. Main Portal Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Stage 1: Student Registration Entry */}
        {!examStarted && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
          >
            <div className="text-center space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-400/20">
                بوابة دخول الطالب الرسمية
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {examPackage.exam.examTitle}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                يرجى تدوين بياناتك الأكاديمية بدقة قبل بدء الاختبار. سيتم احتساب الوقت تلقائياً بمجرد النقر على زر البدء.
              </p>

              <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300 pt-2">
                <span>المبحث: <strong>{examPackage.exam.subject}</strong></span>
                <span>الزمن: <strong>{examPackage.exam.durationMinutes} دقيقة</strong></span>
                <span>العلامة: <strong>{examPackage.exam.totalMarks}</strong></span>
              </div>
            </div>

            <form onSubmit={handleStartExam} className="space-y-4 max-w-md mx-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-500" />
                  <span>اسم الطالب الكامل (رباعي):</span>
                </label>
                <Input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="اكتب اسمك الثلاثي أو الرباعي..."
                  className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                  <span>الصف والشعبة:</span>
                </label>
                <Input
                  value={classSection}
                  onChange={(e) => setClassSection(e.target.value)}
                  placeholder="مثال: العاشر أ، الأول ثانوي علمي ب..."
                  className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>

              {examPackage.registrationConfig.requireSeatNumber && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    رقم الجلوس أو الرقم التعريفي للطالب:
                  </label>
                  <Input
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    placeholder="رقم الجلوس / الرقم المدرسي..."
                    className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              )}

              {examPackage.registrationConfig.requireSchoolName && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-blue-500" />
                    <span>اسم المدرسة:</span>
                  </label>
                  <Input
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder={examPackage.exam.schoolName}
                    className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25"
              >
                بدء الامتحان الإلكتروني الآن 🚀
              </Button>
            </form>
          </motion.div>
        )}

        {/* Stage 2: Live Exam Questions Room */}
        {examStarted && !isSubmitted && (
          <div className="space-y-6">
            {/* Progress Bar & Instructions */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  الطالب: <strong>{studentName}</strong> ({classSection})
                </span>
                <span className="text-slate-500">
                  الأسئلة المجابة: <strong>{answeredCount}</strong> من <strong>{allQuestions.length}</strong> ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Questions Feed */}
            {allQuestions.map((q, idx) => {
              const currentAns = answers[q.id];

              return (
                <div
                  key={q.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-black text-xs flex items-center justify-center border border-cyan-500/20">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        ({q.points} علامات)
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Scientific Diagram if present */}
                  {q.diagram && (
                    <div className="my-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-w-md mx-auto text-center">
                      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        الشكل: {q.diagram.title}
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: q.diagram.svgContent }} />
                    </div>
                  )}

                  {/* Scientific Data Table if present */}
                  {q.table && (
                    <div className="my-2 overflow-x-auto">
                      {q.table.caption && (
                        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                          {q.table.caption}
                        </div>
                      )}
                      <table className="w-full text-xs border-collapse border border-slate-200 dark:border-slate-700">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800">
                            {q.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="border border-slate-200 dark:border-slate-700 p-2 text-center font-bold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {q.table.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="border border-slate-200 dark:border-slate-700 p-2 text-center">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Multiple Choice Options */}
                  {q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isSelected = currentAns === opt.label;
                        return (
                          <div
                            key={opt.label}
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.label }))}
                            className={`p-3 rounded-2xl border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-900 dark:text-cyan-200 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}>
                                {opt.label}
                              </div>
                              <span className="flex-1">{opt.text}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Written Answer / Calculations Text Area */}
                  {(q.type === 'calculation' || q.type === 'analytical') && !q.options && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        اكتب إجابتك وخطوات الحل الرياضي:
                      </label>
                      <Textarea
                        value={currentAns || ''}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="اكتب خطوات الحل بالتفصيل مع النتيجة النهائية..."
                        className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 min-h-[90px]"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Submit Button */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                هل انتهيت من مراجعة كافة إجاباتك؟
              </h3>
              <p className="text-xs text-slate-500">
                بمجرد النقر على تسليم، سيتم رصد علامتك وحفظها وإصدار شهادة التقييم الفورية.
              </p>
              <Button
                onClick={handleSubmitExam}
                size="lg"
                className="rounded-2xl px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/25"
              >
                تسليم الإجابات وإنهاء الاختبار رسمياً ✓
              </Button>
            </div>
          </div>
        )}

        {/* Stage 3: Results & Official Digital Certificate */}
        {isSubmitted && finalSubmission && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Certificate Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-white via-cyan-50/20 to-blue-50/20 dark:from-slate-900 dark:to-slate-800 border-2 border-cyan-500/30 shadow-2xl text-center space-y-6 relative overflow-hidden">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Award className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
                  شهادة إنجاز واجتياز اختبار إلكتروني رسمي
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {finalSubmission.studentName}
                </h2>
                <p className="text-xs text-slate-500">
                  الصف: {finalSubmission.classSection} &bull; {finalSubmission.schoolName}
                </p>
              </div>

              {/* Score Display */}
              <div className="max-w-xs mx-auto p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="text-4xl font-black text-cyan-600 dark:text-cyan-400">
                  {finalSubmission.score} / {finalSubmission.totalPossible}
                </div>
                <div className="text-xs font-bold text-slate-500">
                  النسبة المئوية: <strong className="text-emerald-600">{finalSubmission.percentage}%</strong>
                  {' &bull; '}
                  التقدير:{' '}
                  <strong className="text-purple-600">
                    {finalSubmission.percentage >= 90 ? 'ممتاز مرتفع' :
                     finalSubmission.percentage >= 80 ? 'جيد جداً' :
                     finalSubmission.percentage >= 65 ? 'جيد' : 'مقبول'}
                  </strong>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-4">
                <span>تاريخ التسليم: {new Date(finalSubmission.submittedAt).toLocaleDateString('ar-JO')}</span>
                <span>الوقت المستغرق: {finalSubmission.timeTakenMinutes} دقيقة</span>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="rounded-2xl text-xs gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الشهادة الرسمية</span>
                </Button>

                <Link to="/">
                  <Button className="rounded-2xl text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold">
                    العودة للمنصة
                  </Button>
                </Link>
              </div>
            </div>

            {/* Question by Question Review */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>مراجعة الإجابات وتفسير الأسئلة العلمي:</span>
              </h3>

              <div className="space-y-4">
                {allQuestions.map((q, idx) => {
                  const studentAns = finalSubmission.answers[q.id];
                  const isCorrect = q.type === 'mcq' && q.options 
                    ? studentAns === q.options.find(o => o.isCorrect)?.label
                    : studentAns === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 ${
                        isCorrect
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/40'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900 dark:text-white">س {idx + 1}) {q.questionText}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isCorrect ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {isCorrect ? 'إجابة صحيحة ✓' : 'إجابة غير دقيقة ✗'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        <span>إجابتك: <strong>{studentAns || 'لم تتم الإجابة'}</strong></span>
                        <span className="mx-2">&bull;</span>
                        <span>الإجابة النموذجية: <strong>{q.correctAnswer}</strong></span>
                      </div>

                      <p className="text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-700/60 pt-1.5">
                        💡 {q.rationale}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default LiveInteractiveExam;
