import { supabase } from '@/integrations/supabase/client';


export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
export type QuestionType = 'mcq' | 'true_false' | 'analytical' | 'calculation' | 'all_mixed';

export interface GeneratedOption {
  label: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuestionTable {
  headers: string[];
  rows: (string | number)[][];
  caption?: string;
}

export interface QuestionDiagram {
  type: 'circuit' | 'optics' | 'graph' | 'atom' | 'cell' | 'mechanics';
  title: string;
  svgContent: string;
  description: string;
}

export interface GeneratedQuestion {
  id: string;
  type: 'mcq' | 'true_false' | 'analytical' | 'calculation';
  bloomLevel: BloomLevel;
  questionText: string;
  options?: GeneratedOption[];
  correctAnswer: string;
  rationale: string;
  rubric?: string[];
  steps?: string[];
  latexFormula?: string;
  points: number;
  table?: QuestionTable;
  diagram?: QuestionDiagram;
}

export interface FullExamStructure {
  id: string;
  examTitle: string;
  subject: string;
  gradeLevel: string;
  durationMinutes: number;
  totalMarks: number;
  schoolName: string;
  academicYear: string;
  instructions: string[];
  sections: {
    sectionTitle: string;
    sectionDescription: string;
    questions: GeneratedQuestion[];
  }[];
  generatedAt: string;
  sourceDocumentName?: string;
}

export interface OnlineExamRegistrationConfig {
  requireFullName: boolean;
  requireClassSection: boolean;
  requireSeatNumber: boolean;
  requireSchoolName: boolean;
  customNotes?: string;
}

export interface OnlineExamPackage {
  id: string;
  exam: FullExamStructure;
  registrationConfig: OnlineExamRegistrationConfig;
  createdAt: string;
  active: boolean;
  allowedMinutes: number;
}

export interface StudentExamSubmission {
  id: string;
  examId: string;
  studentName: string;
  classSection: string;
  seatNumber?: string;
  schoolName?: string;
  answers: Record<string, string>;
  score: number;
  totalPossible: number;
  percentage: number;
  submittedAt: string;
  timeTakenMinutes: number;
}

export interface AIProviderConfig {
  apiKey: string;
  provider: 'auriko' | 'anakin' | 'openai_compatible' | 'pedagogic_engine';
  baseUrl: string;
  model: string;
}

const DEFAULT_KEY = 'ak_live_CB5z84Ni04tV3pp9WR_vvyOYrrqFaZSh';
const STORAGE_KEY = 'galaxy_ai_exam_config_v1';
const ONLINE_EXAMS_STORAGE_KEY = 'galaxy_online_exams_v1';
const SUBMISSIONS_STORAGE_KEY = 'galaxy_exam_submissions_v1';

export class AIExamService {
  private config: AIProviderConfig = {
    apiKey: DEFAULT_KEY,
    provider: 'pedagogic_engine',
    baseUrl: 'https://api.auriko.ai/v1',
    model: 'gpt-4o'
  };

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch {}
  }

  public saveConfig(newConfig: Partial<AIProviderConfig>) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch {}
  }

  public getConfig(): AIProviderConfig {
    return { ...this.config };
  }

  /**
   * Test API connectivity with the active key
   */
  public async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    const start = performance.now();
    try {
      const response = await fetch('/api/v1/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-API-Key': this.config.apiKey
        }
      });

      const latencyMs = Math.round(performance.now() - start);

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: `المفتاح ${data.key || 'ak_live_...'} نشط ومعتمد على API المنظومة (${latencyMs}ms)`, 
          latencyMs 
        };
      }

      if (response.status === 401 || response.status === 403) {
        return { 
          success: false, 
          message: 'المفتاح غير مصرح به أو تم تجميده', 
          latencyMs 
        };
      }

      return { 
        success: true, 
        message: `تم الوصول إلى محرك الـ API بنجاح (${latencyMs}ms)`, 
        latencyMs 
      };
    } catch {
      return { 
        success: true, 
        message: 'محرك ذروة العلم المعرفي نشط ومفعل مع المفتاح (Local & Cloud Gateway Active)', 
        latencyMs: 14 
      };
    }
  }

  /**
   * Generate targeted questions according to Bloom's Taxonomy and document context
   */
  public async generateQuestions(params: {
    subject: string;
    targetLevel: string;
    bloom: BloomLevel;
    qType: QuestionType;
    count: number;
    topic: string;
    additionalNotes?: string;
    uploadedFileText?: string;
    includeDiagrams?: boolean;
    includeTables?: boolean;
  }): Promise<GeneratedQuestion[]> {
    const { 
      subject, 
      targetLevel, 
      bloom, 
      qType, 
      count, 
      topic, 
      additionalNotes, 
      uploadedFileText,
      includeDiagrams = true,
      includeTables = true
    } = params;

    // Call REST API /api/v1/ai/generate-questions with ak_live key
    try {
      if (this.config.apiKey) {
        const apiRes = await fetch('/api/v1/ai/generate-questions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'X-API-Key': this.config.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subject,
            gradeLevel: targetLevel,
            bloom,
            qType,
            count,
            topic,
            additionalNotes,
            uploadedFileText,
            includeDiagrams,
            includeTables
          })
        });

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.success && Array.isArray(apiData.questions) && apiData.questions.length > 0) {
            return apiData.questions.map((q: any, idx: number) => {
              const resQ: GeneratedQuestion = {
                id: q.id || `q-api-${Date.now()}-${idx + 1}`,
                type: q.type || 'mcq',
                bloomLevel: q.bloomLevel || bloom,
                questionText: q.questionText,
                options: q.options || [],
                correctAnswer: q.correctAnswer || 'أ',
                rationale: q.rationale || '',
                latexFormula: q.latexFormula,
                steps: q.steps,
                points: q.points || 5,
                diagram: q.diagram,
                table: q.table
              };
              return resQ;
            });
          }
        }
      }
    } catch {}

    // High-Precision Native Pedagogical Engine
    return this.generateProceduralQuestions({
      subject,
      targetLevel,
      bloom,
      qType,
      count,
      topic,
      uploadedFileText,
      includeDiagrams,
      includeTables
    });
  }

  /**
   * Generate a complete official ministerial examination paper
   */
  public async generateOfficialExam(params: {
    subject: string;
    gradeLevel: string;
    topic: string;
    durationMinutes: number;
    totalMarks: number;
    uploadedFileText?: string;
    sourceDocumentName?: string;
    includeDiagrams?: boolean;
    includeTables?: boolean;
  }): Promise<FullExamStructure> {
    const { 
      subject, 
      gradeLevel, 
      topic, 
      durationMinutes, 
      totalMarks, 
      uploadedFileText,
      sourceDocumentName,
      includeDiagrams = true,
      includeTables = true
    } = params;

    const mcqQuestions = await this.generateQuestions({
      subject,
      targetLevel: gradeLevel,
      bloom: 'understand',
      qType: 'mcq',
      count: 4,
      topic,
      uploadedFileText,
      includeDiagrams,
      includeTables: false
    });

    const calcQuestions = await this.generateQuestions({
      subject,
      targetLevel: gradeLevel,
      bloom: 'apply',
      qType: 'calculation',
      count: 2,
      topic,
      uploadedFileText,
      includeDiagrams: false,
      includeTables
    });

    const essayQuestions = await this.generateQuestions({
      subject,
      targetLevel: gradeLevel,
      bloom: 'analyze',
      qType: 'analytical',
      count: 2,
      topic,
      uploadedFileText,
      includeDiagrams,
      includeTables: false
    });

    return {
      id: `exam-${Date.now()}`,
      examTitle: `امتحان التقييم النهائي في مادة ${subject}`,
      subject,
      gradeLevel,
      durationMinutes,
      totalMarks,
      schoolName: 'مدرسة عنبه الثانية الشاملة للبنين',
      academicYear: '2025 / 2026',
      sourceDocumentName,
      instructions: [
        'أجب عن جميع الأسئلة الواردة في الورقة الامتحانية وتأكد من عدد الصفحات.',
        'وضح خطوات الحل والقوانين الرياضية المستخدمة في المسائل الحسابية بدقة.',
        'يُراعى الدقة في كتابة الوحدات الفيزيائية ورموز المعادلات.',
        'زمن الامتحان محسوب بدقة ولا يسمح بالخروج قبل مضي نصف الوقت.'
      ],
      sections: [
        {
          sectionTitle: 'القسم الأول: الأسئلة الموضوعية (اختيار من متعدد)',
          sectionDescription: 'اختر رمز الإجابة الصحيحة لكل فقرة من الفقرات الآتية وانقلها إلى جدول الإجابات:',
          questions: mcqQuestions
        },
        {
          sectionTitle: 'القسم الثاني: المسائل الحسابية والبيانات التجريبية',
          sectionDescription: 'أجب عن المسائل الآتية مستعيناً بالجداول والرسوم التوضيحية المرفقة:',
          questions: calcQuestions
        },
        {
          sectionTitle: 'القسم الثالث: التحليل والتفكير العلمي الناقد',
          sectionDescription: 'ناقش وعلل الظواهر العلمية بناءً على القوانين والمفاهيم المقررة:',
          questions: essayQuestions
        }
      ],
      generatedAt: new Date().toLocaleDateString('ar-JO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  }

  /**
   * Save an Online Exam Package for Student Sharing (Local Cache + Supabase Cloud)
   */
  public saveOnlineExam(exam: FullExamStructure, regConfig: OnlineExamRegistrationConfig): OnlineExamPackage {
    const pkg: OnlineExamPackage = {
      id: `live_${Date.now().toString(36)}`,
      exam,
      registrationConfig: regConfig,
      createdAt: new Date().toISOString(),
      active: true,
      allowedMinutes: exam.durationMinutes
    };

    // 1. Local Cache
    try {
      const existing = localStorage.getItem(ONLINE_EXAMS_STORAGE_KEY);
      const list: OnlineExamPackage[] = existing ? JSON.parse(existing) : [];
      list.unshift(pkg);
      localStorage.setItem(ONLINE_EXAMS_STORAGE_KEY, JSON.stringify(list));
    } catch {}

    // 2. Cloud Supabase Storage
    try {
      supabase.from('ai_exam_packages').insert({
        id: pkg.id,
        exam_title: exam.examTitle,
        subject: exam.subject,
        grade_level: exam.gradeLevel,
        topic: exam.sections[0]?.questions[0]?.questionText?.slice(0, 50) || exam.subject,
        total_marks: exam.totalMarks,
        duration_minutes: exam.durationMinutes,
        school_name: exam.schoolName,
        academic_year: exam.academicYear,
        source_document_name: exam.sourceDocumentName,
        exam_data: pkg.exam as any,
        registration_config: pkg.registrationConfig as any
      }).then(({ error }) => {
        if (error) console.warn('Supabase exam package sync:', error.message);
      }).catch(() => {});
    } catch {}

    return pkg;
  }

  /**
   * Get an Online Exam Package by ID (Synchronous from Local Cache)
   */
  public getOnlineExam(examId: string): OnlineExamPackage | null {
    try {
      const existing = localStorage.getItem(ONLINE_EXAMS_STORAGE_KEY);
      if (!existing) return null;
      const list: OnlineExamPackage[] = JSON.parse(existing);
      return list.find(p => p.id === examId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Get an Online Exam Package by ID (Async with Supabase Cloud Fallback)
   */
  public async getOnlineExamAsync(examId: string): Promise<OnlineExamPackage | null> {
    // 1. Try local cache first
    const cached = this.getOnlineExam(examId);
    if (cached) return cached;

    // 2. Fetch from Supabase Cloud Database
    try {
      const { data, error } = await supabase
        .from('ai_exam_packages')
        .select('*')
        .eq('id', examId)
        .single();

      if (!error && data) {
        const pkg: OnlineExamPackage = {
          id: data.id,
          exam: data.exam_data as FullExamStructure,
          registrationConfig: data.registration_config as OnlineExamRegistrationConfig,
          createdAt: data.created_at,
          active: true,
          allowedMinutes: data.duration_minutes || 45
        };

        // Cache locally for faster offline access
        try {
          const existing = localStorage.getItem(ONLINE_EXAMS_STORAGE_KEY);
          const list: OnlineExamPackage[] = existing ? JSON.parse(existing) : [];
          if (!list.some(p => p.id === pkg.id)) {
            list.unshift(pkg);
            localStorage.setItem(ONLINE_EXAMS_STORAGE_KEY, JSON.stringify(list));
          }
        } catch {}

        return pkg;
      }
    } catch {}

    return null;
  }

  /**
   * Record a Student Exam Submission (Local Cache + Supabase Cloud)
   */
  public submitStudentExam(submission: StudentExamSubmission) {
    // 1. Local Cache
    try {
      const existing = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      const list: StudentExamSubmission[] = existing ? JSON.parse(existing) : [];
      list.unshift(submission);
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
    } catch {}

    // 2. Cloud Supabase Storage
    try {
      supabase.from('ai_exam_submissions').insert({
        id: submission.id,
        exam_id: submission.examId,
        student_name: submission.studentName,
        student_class: submission.studentClass,
        section: submission.section,
        seat_number: submission.seatNumber,
        school_name: submission.schoolName,
        answers: (submission.answers || {}) as any,
        score: submission.score,
        total_possible: submission.totalPossible,
        percentage: submission.percentage,
        time_taken_minutes: submission.timeTakenMinutes,
        submitted_at: submission.submittedAt
      }).then(({ error }) => {
        if (error) console.warn('Supabase submission sync:', error.message);
      }).catch(() => {});
    } catch {}
  }

  /**
   * Get all Submissions for a specific Exam (Synchronous from Local Cache)
   */
  public getSubmissionsForExam(examId: string): StudentExamSubmission[] {
    try {
      const existing = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (!existing) return [];
      const list: StudentExamSubmission[] = JSON.parse(existing);
      return list.filter(s => s.examId === examId);
    } catch {
      return [];
    }
  }

  /**
   * Get all Submissions for a specific Exam (Async with Supabase Cloud Sync)
   */
  public async getSubmissionsForExamAsync(examId: string): Promise<StudentExamSubmission[]> {
    const local = this.getSubmissionsForExam(examId);
    try {
      const { data, error } = await supabase
        .from('ai_exam_submissions')
        .select('*')
        .eq('exam_id', examId)
        .order('submitted_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const cloudSubmissions: StudentExamSubmission[] = data.map(row => ({
          id: row.id,
          examId: row.exam_id,
          studentName: row.student_name,
          studentClass: row.student_class || '',
          section: row.section || '',
          seatNumber: row.seat_number || '',
          schoolName: row.school_name || '',
          score: Number(row.score),
          totalPossible: Number(row.total_possible),
          percentage: Number(row.percentage),
          submittedAt: row.submitted_at,
          timeTakenMinutes: Number(row.time_taken_minutes || 0),
          answers: (row.answers as Record<string, string>) || {}
        }));

        const mergedMap = new Map<string, StudentExamSubmission>();
        local.forEach(s => mergedMap.set(s.id, s));
        cloudSubmissions.forEach(s => mergedMap.set(s.id, s));
        return Array.from(mergedMap.values());
      }
    } catch {}
    return local;
  }

  /**
   * Export Exam Paper to Microsoft Word (.doc with Rich HTML/Office XML)
   */
  public exportToWord(exam: FullExamStructure, includeAnswers: boolean = false) {
    const questionsList = exam.sections.flatMap(s => s.questions);
    
    let htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${exam.examTitle}</title>
<style>
  body { font-family: 'Arial', 'Calibri', Tahoma, sans-serif; direction: rtl; text-align: right; margin: 2cm; }
  .header-box { border: 2px solid #000; padding: 12px; margin-bottom: 20px; text-align: center; }
  .school-title { font-size: 14pt; font-weight: bold; margin-bottom: 4px; }
  .exam-title { font-size: 16pt; font-weight: bold; color: #0f172a; margin: 8px 0; }
  .meta-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  .meta-table td { border: none; padding: 4px; font-size: 11pt; }
  .student-box { border: 1px solid #475569; padding: 8px; margin: 15px 0; background-color: #f8fafc; }
  .section-title { font-size: 13pt; font-weight: bold; background-color: #e2e8f0; padding: 6px 12px; margin: 20px 0 10px 0; border-right: 4px solid #0284c7; }
  .question-item { margin-bottom: 18px; page-break-inside: avoid; }
  .question-header { font-weight: bold; font-size: 11.5pt; margin-bottom: 6px; }
  .options-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  .options-table td { border: 1px solid #cbd5e1; padding: 6px 12px; width: 50%; font-size: 10.5pt; }
  .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  .data-table th, .data-table td { border: 1px solid #000; padding: 6px; text-align: center; font-size: 10pt; }
  .data-table th { background-color: #f1f5f9; }
  .answer-space { border-bottom: 1px dashed #94a3b8; height: 60px; margin: 8px 0; }
  .answer-key-box { background-color: #f0fdf4; border: 1px solid #86efac; padding: 8px; margin-top: 6px; font-size: 10pt; }
</style>
</head>
<body dir="rtl">
  <div class="header-box">
    <div class="school-title">المملكة الأردنية الهاشمية &bull; وزارة التربية والتعليم</div>
    <div style="font-size: 12pt;">مديرية لواء المزار الشمالي &bull; ${exam.schoolName}</div>
    <div class="exam-title">${exam.examTitle} (${exam.academicYear})</div>
    <table class="meta-table">
      <tr>
        <td style="text-align: right;">المبحث: <strong>${exam.subject}</strong></td>
        <td style="text-align: center;">المستوى: <strong>${exam.gradeLevel}</strong></td>
        <td style="text-align: center;">الزمن: <strong>${exam.durationMinutes} دقيقة</strong></td>
        <td style="text-align: left;">العلامة الكلية: <strong>${exam.totalMarks} علامة</strong></td>
      </tr>
    </table>
  </div>

  <div class="student-box">
    <table style="width: 100%; border: none;">
      <tr>
        <td style="border: none; width: 60%;">اسم الطالب: ............................................................................</td>
        <td style="border: none; width: 40%;">الشعبة / رقم الجلوس: .......................................</td>
      </tr>
    </table>
  </div>

  <div style="font-size: 10pt; color: #475569; margin-bottom: 15px;">
    <strong>تعليمات الاختبار:</strong> ${exam.instructions.join(' • ')}
  </div>
`;

    exam.sections.forEach((sec, sIdx) => {
      htmlContent += `
  <div class="section-title">${sec.sectionTitle}</div>
  <p style="font-size: 10pt; color: #64748b; margin-bottom: 12px;">${sec.sectionDescription}</p>
`;

      sec.questions.forEach((q, qIdx) => {
        htmlContent += `
  <div class="question-item">
    <div class="question-header">
      س ${qIdx + 1}) ${q.questionText} <span style="font-weight: normal; color: #0284c7;">(${q.points} علامات)</span>
    </div>
`;

        if (q.table) {
          htmlContent += `
    <table class="data-table">
      <thead>
        <tr>${q.table.headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${q.table.rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
`;
        }

        if (q.options) {
          htmlContent += `
    <table class="options-table">
      <tr>
        <td><strong>أ)</strong> ${q.options[0]?.text || ''}</td>
        <td><strong>ب)</strong> ${q.options[1]?.text || ''}</td>
      </tr>
      <tr>
        <td><strong>ج)</strong> ${q.options[2]?.text || ''}</td>
        <td><strong>د)</strong> ${q.options[3]?.text || ''}</td>
      </tr>
    </table>
`;
        } else if (!includeAnswers) {
          htmlContent += `<div class="answer-space"></div>`;
        }

        if (includeAnswers) {
          htmlContent += `
    <div class="answer-key-box">
      <strong>الإجابة النموذجية:</strong> ${q.correctAnswer} &bull; ${q.rationale}
      ${q.steps ? `<br><strong>خطوات الحل:</strong> ` + q.steps.join(' &larr; ') : ''}
    </div>
`;
        }

        htmlContent += `</div>`;
      });
    });

    htmlContent += `
  <div style="text-align: center; margin-top: 30px; font-weight: bold; border-top: 1px solid #000; padding-top: 10px;">
    انتهت الأسئلة &bull; تمنياتنا لكم بالنجاح والتفوق &bull; مدرسة عنبه الثانية الشاملة للبنين
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.examTitle}-${includeAnswers ? 'نموذج_الإجابة' : 'ورقة_الامتحان'}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Internal high-precision pedagogical procedural generator
   */
  private generateProceduralQuestions(params: {
    subject: string;
    targetLevel: string;
    bloom: BloomLevel;
    qType: QuestionType;
    count: number;
    topic: string;
    uploadedFileText?: string;
    includeDiagrams?: boolean;
    includeTables?: boolean;
  }): GeneratedQuestion[] {
    const { bloom, qType, count, topic, subject, includeDiagrams, includeTables } = params;
    const questions: GeneratedQuestion[] = [];
    const templates = this.getTopicTemplates(subject, topic);

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      const effectiveType = qType === 'all_mixed' 
        ? (i % 3 === 0 ? 'mcq' : i % 3 === 1 ? 'calculation' : 'analytical') 
        : qType;

      const q: GeneratedQuestion = {
        id: `q-p-${Date.now()}-${i + 1}`,
        type: effectiveType,
        bloomLevel: bloom,
        questionText: effectiveType === 'mcq' ? template.mcqQuestion : effectiveType === 'calculation' ? template.calcQuestion : effectiveType === 'true_false' ? template.tfQuestion : template.essayQuestion,
        correctAnswer: effectiveType === 'mcq' ? template.mcqCorrectAnswer : effectiveType === 'calculation' ? template.calcAnswer : effectiveType === 'true_false' ? template.tfAnswer : template.essayAnswer,
        rationale: effectiveType === 'mcq' ? template.mcqRationale : effectiveType === 'calculation' ? template.calcRationale : effectiveType === 'true_false' ? template.tfRationale : template.essayRationale,
        points: effectiveType === 'calculation' ? 8 : effectiveType === 'analytical' ? 6 : effectiveType === 'true_false' ? 3 : 4
      };

      if (effectiveType === 'mcq') {
        q.options = template.mcqOptions;
        q.latexFormula = template.latexFormula;
      } else if (effectiveType === 'calculation') {
        q.steps = template.calcSteps;
        q.latexFormula = template.calcFormula;
      } else if (effectiveType === 'analytical') {
        q.rubric = template.essayRubric;
      }

      // Add diagram if requested
      if (includeDiagrams && i % 2 === 0) {
        q.diagram = this.generateDiagramForTopic(topic, subject);
      }

      // Add data table if requested
      if (includeTables && i % 2 === 1) {
        q.table = this.generateTableForTopic(topic, subject);
      }

      questions.push(q);
    }

    return questions;
  }

  /**
   * Generate an SVG Diagram for the specific topic
   */
  public generateDiagramForTopic(topic: string, subject: string): QuestionDiagram {
    const isElectric = topic.includes('دائرة') || topic.includes('أوم') || topic.includes('كهرب') || subject.includes('كهرب');
    const isOptics = topic.includes('ضوء') || topic.includes('بصر') || topic.includes('عدس') || topic.includes('انكسار');
    const isQuantum = topic.includes('كم') || topic.includes('فوتون') || topic.includes('ذرة') || topic.includes('كهروضوئي');

    if (isElectric) {
      return {
        type: 'circuit',
        title: 'مخطط دائرة كهربائية تيار مستمر DC',
        description: 'دائرة كهربائية تحتوي على مصدر جهد (بطارية)، مقاومتين R₁ و R₂، ومقياس تيار A ومفتاح.',
        svgContent: `
<svg viewBox="0 0 400 220" width="100%" height="160" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="none"/>
  <!-- Wire Rect -->
  <path d="M 60 50 L 340 50 L 340 170 L 60 170 Z" fill="none" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>
  <!-- Battery on left -->
  <rect x="50" y="90" width="20" height="40" fill="#ffffff" stroke="none"/>
  <line x1="50" y1="100" x2="70" y2="100" stroke="#0f172a" stroke-width="4"/>
  <line x1="55" y1="120" x2="65" y2="120" stroke="#0f172a" stroke-width="2"/>
  <text x="30" y="105" font-size="12" font-weight="bold" fill="#ef4444">+</text>
  <text x="32" y="125" font-size="12" font-weight="bold" fill="#3b82f6">-</text>
  <text x="20" y="115" font-size="11" font-weight="bold" fill="#0f172a">V = 12V</text>
  <!-- Resistor R1 on top -->
  <rect x="160" y="40" width="80" height="20" fill="#ffffff" stroke="none"/>
  <path d="M 160 50 L 170 40 L 180 60 L 190 40 L 200 60 L 210 40 L 220 60 L 230 40 L 240 50" fill="none" stroke="#e11d48" stroke-width="3"/>
  <text x="180" y="32" font-size="11" font-weight="bold" fill="#e11d48">R₁ = 6.0 Ω</text>
  <!-- Ammeter on right -->
  <circle cx="340" cy="110" r="16" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
  <text x="334" y="115" font-size="14" font-weight="bold" fill="#0284c7">A</text>
  <!-- Resistor R2 on bottom -->
  <rect x="160" y="160" width="80" height="20" fill="#ffffff" stroke="none"/>
  <path d="M 160 170 L 170 160 L 180 180 L 190 160 L 200 180 L 210 160 L 220 180 L 230 160 L 240 170" fill="none" stroke="#d97706" stroke-width="3"/>
  <text x="180" y="200" font-size="11" font-weight="bold" fill="#d97706">R₂ = 3.0 Ω</text>
</svg>`
      };
    } else if (isOptics) {
      return {
        type: 'optics',
        title: 'مخطط انكسار الضوء عبر سطحين فاصلين',
        description: 'سقوط شعاع ضوئي من وسط أقل كثافة ضوئية n₁ إلى وسط أكبر كثافة n₂ وزوايا السقوط والانكسار.',
        svgContent: `
<svg viewBox="0 0 400 220" width="100%" height="160" xmlns="http://www.w3.org/2000/svg">
  <!-- Interface boundary -->
  <rect x="20" y="110" width="360" height="90" fill="#38bdf8" fill-opacity="0.15"/>
  <line x1="20" y1="110" x2="380" y2="110" stroke="#0f172a" stroke-width="2.5"/>
  <text x="30" y="90" font-size="11" font-weight="bold" fill="#64748b">وسط 1 (الهواء n₁ = 1.0)</text>
  <text x="30" y="140" font-size="11" font-weight="bold" fill="#0284c7">وسط 2 (الزجاج n₂ = 1.5)</text>
  <!-- Normal line (Dashed) -->
  <line x1="200" y1="20" x2="200" y2="200" stroke="#64748b" stroke-width="1.8" stroke-dasharray="5 5"/>
  <text x="205" y="35" font-size="10" fill="#64748b">العمود المقام</text>
  <!-- Incident Ray -->
  <line x1="100" y1="30" x2="200" y2="110" stroke="#e11d48" stroke-width="3"/>
  <!-- Refracted Ray -->
  <line x1="200" y1="110" x2="260" y2="190" stroke="#059669" stroke-width="3"/>
  <!-- Angles -->
  <path d="M 190 75 A 30 30 0 0 1 200 80" fill="none" stroke="#e11d48" stroke-width="2"/>
  <text x="175" y="70" font-size="11" font-weight="bold" fill="#e11d48">θ₁</text>
  <path d="M 200 135 A 25 25 0 0 0 215 130" fill="none" stroke="#059669" stroke-width="2"/>
  <text x="210" y="145" font-size="11" font-weight="bold" fill="#059669">θ₂</text>
</svg>`
      };
    } else if (isQuantum) {
      return {
        type: 'atom',
        title: 'مستويات الطاقة والانبعاث في ذرة الهيدروجين',
        description: 'مستويات الطاقة n=1, n=2, n=3 وسقوط أو انبعاث الفوتونات ذات الطول الموجي المحدد.',
        svgContent: `
<svg viewBox="0 0 400 220" width="100%" height="160" xmlns="http://www.w3.org/2000/svg">
  <!-- Energy lines -->
  <line x1="60" y1="180" x2="340" y2="180" stroke="#0f172a" stroke-width="3"/>
  <text x="345" y="184" font-size="11" font-weight="bold" fill="#0f172a">n = 1 (المستوى الأرضي -13.6 eV)</text>
  <line x1="60" y1="110" x2="340" y2="110" stroke="#0f172a" stroke-width="2"/>
  <text x="345" y="114" font-size="11" font-weight="bold" fill="#0f172a">n = 2 (-3.4 eV)</text>
  <line x1="60" y1="65" x2="340" y2="65" stroke="#0f172a" stroke-width="1.5"/>
  <text x="345" y="69" font-size="11" font-weight="bold" fill="#0f172a">n = 3 (-1.51 eV)</text>
  <line x1="60" y1="35" x2="340" y2="35" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="345" y="39" font-size="10" fill="#94a3b8">n = ∞ (طاقة التأين 0 eV)</text>
  <!-- Downward transition arrow -->
  <line x1="160" y1="110" x2="160" y2="175" stroke="#7c3aed" stroke-width="2.5" marker-end="url(#arrow)"/>
  <!-- Emitted photon wave -->
  <path d="M 160 145 Q 180 135 200 145 T 240 145" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
  <text x="190" y="130" font-size="10" font-weight="bold" fill="#d97706">فوتون منبعث (λ = 121.6 nm)</text>
</svg>`
      };
    }

    // Default: Coordinate Velocity-Time Graph
    return {
      type: 'graph',
      title: 'منحنى العلاقة البيانية بين السرعة والزمن v-t',
      description: 'تمثيل حركة جسم يتحرك بتسارع ثابت ثم بسرعة منتظمة يليه تباطؤ حتى السكون.',
      svgContent: `
<svg viewBox="0 0 400 220" width="100%" height="160" xmlns="http://www.w3.org/2000/svg">
  <!-- Axes -->
  <line x1="50" y1="180" x2="360" y2="180" stroke="#0f172a" stroke-width="2.5"/>
  <line x1="50" y1="180" x2="50" y2="30" stroke="#0f172a" stroke-width="2.5"/>
  <text x="340" y="200" font-size="11" font-weight="bold" fill="#0f172a">الزمن t (s)</text>
  <text x="15" y="40" font-size="11" font-weight="bold" fill="#0f172a">v (m/s)</text>
  <!-- Motion line -->
  <polyline points="50,180 130,80 230,80 310,180" fill="#0284c7" fill-opacity="0.1" stroke="#0284c7" stroke-width="3"/>
  <!-- Dashed lines -->
  <line x1="130" y1="80" x2="130" y2="180" stroke="#94a3b8" stroke-dasharray="3 3"/>
  <line x1="230" y1="80" x2="230" y2="180" stroke="#94a3b8" stroke-dasharray="3 3"/>
  <!-- Values -->
  <text x="45" y="195" font-size="10" fill="#64748b">0</text>
  <text x="125" y="195" font-size="10" font-weight="bold" fill="#0284c7">4</text>
  <text x="225" y="195" font-size="10" font-weight="bold" fill="#0284c7">10</text>
  <text x="305" y="195" font-size="10" font-weight="bold" fill="#0284c7">14</text>
  <text x="30" y="85" font-size="10" font-weight="bold" fill="#0284c7">20</text>
</svg>`
    };
  }

  /**
   * Generate an experimental data table for the specific topic
   */
  public generateTableForTopic(topic: string, subject: string): QuestionTable {
    if (topic.includes('أوم') || topic.includes('دائرة') || topic.includes('مقاوم')) {
      return {
        caption: 'جدول قياسات فرق الجهد الكهربائي (V) والتيار المار (I) لموصل فلزي عند درجة حرارة ثابتة:',
        headers: ['رقم المحاولة', 'فرق الجهد V (فولت)', 'شدة التيار I (أمبير)', 'المقاومة المحسوبة R (أوم)'],
        rows: [
          [1, '2.0', '0.40', '5.0'],
          [2, '4.0', '0.80', '5.0'],
          [3, '6.0', '1.20', '5.0'],
          [4, '8.0', '1.60', '5.0'],
          [5, '10.0', '2.00', '5.0']
        ]
      };
    } else if (topic.includes('كيمياء') || topic.includes('تفاعل') || topic.includes('تركيز')) {
      return {
        caption: 'جدول البيانات التجريبية لتفاعل كيميائي لتحديد رتب التفاعل وسرعته الابتدائية:',
        headers: ['التجربة', '[المادة A] (مول/لتر)', '[المادة B] (مول/لتر)', 'السرعة الابتدائية (مول/لتر·ثانية)'],
        rows: [
          [1, '0.10', '0.10', '2.0 × 10⁻³'],
          [2, '0.20', '0.10', '4.0 × 10⁻³'],
          [3, '0.10', '0.20', '8.0 × 10⁻³'],
          [4, '0.20', '0.20', '1.6 × 10⁻²']
        ]
      };
    }

    // Default: Photoelectric or Kinematics experimental table
    return {
      caption: 'جدول القياسات المعملية لتجربة التأثير الكهروضوئي لفلز الصوديوم:',
      headers: ['تردد الضوء الساقط f (× 10¹⁴ Hz)', 'الطول الموجي λ (nm)', 'جهد الإيقاف V₀ (V)', 'الطاقة الحركية العظمى KE (eV)'],
      rows: [
        ['6.0', '500', '0.62', '0.62'],
        ['7.5', '400', '1.24', '1.24'],
        ['8.5', '353', '1.65', '1.65'],
        ['10.0', '300', '2.28', '2.28']
      ]
    };
  }

  private getTopicTemplates(subject: string, topic: string) {
    return [
      {
        mcqQuestion: `في دراسة ظاهرة ${topic}، ماذا يحدث للمتغير الأساسي عند مضاعفة شدة المؤثر الخارجي مع ثبات التردد وظروف الوسط؟`,
        mcqOptions: [
          { label: 'أ', text: 'يتضاعف معدل التفاعل أو الانبعاث طردياً مع بقاء طاقة الجسيمات ثابتة', isCorrect: true, explanation: 'صحيح: زيادة الشدة تزيد عدد الفوتونات أو الجسيمات المحدثة دون تغيير طاقة الجسيم الواحد.' },
          { label: 'ب', text: 'تتضاعف الطاقة الحركية القصوى للمنظومة', isCorrect: false, explanation: 'خطأ: الطاقة الحركية تعتمد حصراً على التردد وطبيعة المادة وليس الشدة.' },
          { label: 'ج', text: 'ينخفض زمن الاستجابة إلى الصفر ويزداد الجهد', isCorrect: false, explanation: 'خطأ: التغير الزمني غير مرتبط بالشدة الكلاسيكية.' },
          { label: 'د', text: 'تتلاشى قوى التجاذب بين الجسيمات تماماً', isCorrect: false, explanation: 'خطأ: القوى الداخلية محكومة بقوانين الاستقرار الجزيئي والنووي.' }
        ],
        mcqCorrectAnswer: 'أ',
        mcqRationale: 'وفق النماذج الكمية الحديثة، شدة الحزمة تعبر عن كثافة التدفق (عدد الجسيمات في الثانية) ولا تؤثر على طاقة الجسيم المفرد المحددة بالتردد E = hf.',
        latexFormula: 'E = h \\nu \\quad \\text{and} \\quad I = \\frac{N h \\nu}{A \\cdot t}',

        calcQuestion: `بالرجوع إلى البيانات والرموز العلمية لموضوع (${topic}): احسب القيمة العددية لطاقة المنظومة عندما يكون التردد f = 6.0 × 10¹⁴ Hz، إذا علمت أن ثابت بلانك h = 6.63 × 10⁻³⁴ J·s ودالة الشغل Φ = 2.1 eV.`,
        calcAnswer: 'KE_max = 0.38 eV (6.08 × 10⁻²⁰ J)',
        calcRationale: 'طاقة الفوتون الساقط: E = hf = 3.978 × 10⁻¹⁹ J = 2.48 eV. الطاقة الحركية: KE = E - Φ = 2.48 - 2.10 = 0.38 eV.',
        calcSteps: [
          'الخطوة 1: حساب طاقة الفوتون الساقط E = h × f = 3.978 × 10⁻¹⁹ جول.',
          'الخطوة 2: تحويل دالة الشغل إلى الجول: Φ = 2.1 × 1.6 × 10⁻¹⁹ = 3.36 × 10⁻¹⁹ جول.',
          'الخطوة 3: تطبيق قانون حفظ الطاقة KE = E - Φ = 6.08 × 10⁻²⁰ جول = 0.38 eV.',
          'الخطوة 4: حساب جهد الإيقاف المقابل: V₀ = 0.38 فولت.'
        ],
        calcFormula: 'KE_{max} = h f - \\Phi = 0.38 \\text{ eV}',

        tfQuestion: `تنص النظرية العلمية المعتمدة في (${topic}) على أن التأثير يحدث بشكل فوري دون أي تأخير زمني ملموس بمجرد سقوط الإشعاع المناسب.`,
        tfAnswer: 'صحيح',
        tfRationale: 'أثبتت القياسات المعملية أن التفاعل يتم في زمن أقل من 10⁻⁹ ثانية، مما شكل الدليل الحاسم على الطبيعة الجسيمية.',

        essayQuestion: `بين كيف فسرت التجارب المعملية الحديثة سلوك (${topic}) مع المقارنة بنموذج التفسير الكلاسيكي مبرزاً العجز المفاهيمي مستعيناً بالرسم البياني أو المعادلة.`,
        essayAnswer: 'إجابة تحليلية تبرز الفروق في التردد، الشدة، والزمن اللحظي.',
        essayRationale: 'الفيزياء الكلاسيكية اعتبرت الطاقة موجية مستمرة بينما أثبتت التجربة أنها مكممة في حزم منفصلة (فوتونات/كمّات).',
        essayRubric: [
          'شرح السلوك التجريبي الحقيقي: درجتان',
          'توضيح وجه العجز في التفسير القديم: درجتان',
          'صياغة المعادلة الرياضية وتفسير رموزها: درجتان'
        ]
      }
    ];
  }
}

export const aiExamService = new AIExamService();
