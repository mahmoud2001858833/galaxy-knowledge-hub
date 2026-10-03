export type QType = "multiple_choice" | "true_false" | "fill_blank" | "short_answer" | "essay";

export const QTYPE_META: { key: QType; label: string; hint: string }[] = [
  { key: "multiple_choice", label: "اختيار من متعدد", hint: "4 خيارات" },
  { key: "true_false", label: "صح / خطأ", hint: "" },
  { key: "fill_blank", label: "أكمل الفراغ", hint: "" },
  { key: "short_answer", label: "إجابة قصيرة", hint: "تصحيح يدوي" },
  { key: "essay", label: "مقالي", hint: "تصحيح يدوي" },
];

export const QTYPE_LABEL: Record<QType, string> = Object.fromEntries(
  QTYPE_META.map((t) => [t.key, t.label]),
) as Record<QType, string>;

export const DIFFICULTY_AR: Record<string, string> = { easy: "سهل", medium: "متوسط", hard: "صعب" };

export interface UnitInfo {
  id: string;
  title: string;
  summary: string;
  fileIndex: number;
  pageStart: number | null;
  pageEnd: number | null;
  hasFigures: boolean;
  hasTables: boolean;
}

export interface AnalyzeResponse {
  units: UnitInfo[];
  language: string;
  subjectGuess: string;
  gradeGuess: string;
}

export interface TableData {
  caption?: string;
  headers: string[];
  rows: string[][];
}

export interface FigureRef {
  /** معرّف الشكل في فهرس الأشكال المرصودة */
  id?: string;
  fileIndex: number;
  page: number;
  /** [ymin, xmin, ymax, xmax] بإحداثيات 0..1000 */
  box: [number, number, number, number];
  caption: string;
  revealsAnswer?: boolean;
  /** نتيجة القص من الملف الأصلي (في المتصفح) */
  dataUrl?: string;
  width?: number;
  height?: number;
  cropError?: string;
  /** رابط التخزين بعد نشر الامتحان الإلكتروني */
  url?: string;
}

export interface ExamQuestion {
  id: number;
  type: QType;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  evidence: string;
  location?: string;
  unit?: string;
  difficulty: "easy" | "medium" | "hard";
  table?: TableData;
  figure?: FigureRef;
}

export interface ExamMeta {
  schoolName: string;
  teacherName: string;
  subject: string;
  grade: string;
  durationMinutes: number;
}

export interface GeneratedExam {
  title: string;
  questions: ExamQuestion[];
  meta: ExamMeta;
}

export interface CatalogFigure { id: string; fileIndex: number; page: number; box: [number, number, number, number]; caption: string; hasLabels: boolean; unit?: string }
export interface CatalogTable { id: string; fileIndex: number; page: number; caption?: string; headers: string[]; rows: string[][]; unit?: string }
export interface Catalog { figures: CatalogFigure[]; tables: CatalogTable[] }

export interface BatchDiagnostics {
  catalog: { figures: number; tables: number };
  asked: { figures: number; tables: number };
  delivered: { figures: number; tables: number };
  dropped: Record<string, number>;
}

/** تقرير شفاف عن الأشكال والجداول والأسئلة المحذوفة، يُعرض للمعلم في المراجعة. */
export interface ExamDiagnostics extends BatchDiagnostics {
  discovered: { figures: number; tables: number; stats: Record<string, number> };
  cropRejected: { id: string; reason: string }[];
  batches: { total: number; failed: number };
  duplicatesRemoved: number;
}

export interface GenerateResponse {
  exam: { title: string; questions: ExamQuestion[] };
  requested: number;
  delivered: number;
  dropped: number;
  warnings: string[];
  diagnostics?: BatchDiagnostics;
}

export type CreatorMode = "exam" | "bank";
export const MAX_EXAM_QUESTIONS = 100;
export const MAX_BANK_QUESTIONS = 1000;

export interface OnlineSettings {
  durationMinutes: number;
  showResult: "none" | "score" | "score_answers";
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  requireClass: boolean;
  allowRetake: boolean;
  instructions: string;
}

export const LETTERS = ["أ", "ب", "ج", "د"];
