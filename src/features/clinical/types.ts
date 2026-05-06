export const CATEGORIES = [
  // ذوو الاحتياجات الخاصة
  { key: 'asd',            ar: 'اضطراب طيف التوحد',         emoji: '🧩', group: 'special' },
  { key: 'adhd',           ar: 'فرط الحركة وتشتت الانتباه',  emoji: '⚡', group: 'special' },
  { key: 'hearing',        ar: 'الإعاقة السمعية',            emoji: '👂', group: 'special' },
  { key: 'visual',         ar: 'الإعاقة البصرية',            emoji: '👁️', group: 'special' },
  { key: 'learning_other', ar: 'صعوبات تعلّم وتأخر لغوي',    emoji: '📚', group: 'special' },
  // التخصصات الطبية
  { key: 'cardiology',     ar: 'أمراض القلب',               emoji: '❤️', group: 'medical' },
  { key: 'orthopedics',    ar: 'العظام والمفاصل',            emoji: '🦴', group: 'medical' },
  { key: 'neurology',      ar: 'الأعصاب',                    emoji: '🧠', group: 'medical' },
  { key: 'pulmonology',    ar: 'الجهاز التنفسي',             emoji: '🫁', group: 'medical' },
  { key: 'nephrology',     ar: 'الكلى',                      emoji: '💧', group: 'medical' },
  { key: 'endocrinology',  ar: 'الغدد والسكري',              emoji: '⚖️', group: 'medical' },
  { key: 'gastro',         ar: 'الجهاز الهضمي',              emoji: '🩺', group: 'medical' },
  { key: 'emergency',      ar: 'الطوارئ',                   emoji: '🚑', group: 'medical' },
  { key: 'pediatrics',     ar: 'الأطفال',                   emoji: '👶', group: 'medical' },
  { key: 'obgyn',          ar: 'النساء والولادة',            emoji: '🤰', group: 'medical' },
  { key: 'dermatology',    ar: 'الجلدية',                    emoji: '🧴', group: 'medical' },
  { key: 'ophthalmology',  ar: 'العيون',                     emoji: '👁', group: 'medical' },
  { key: 'ent',            ar: 'الأنف والأذن والحنجرة',      emoji: '👃', group: 'medical' },
  { key: 'psychiatry',     ar: 'الطب النفسي',               emoji: '💭', group: 'medical' },
  { key: 'internal',       ar: 'الباطنية',                   emoji: '🩻', group: 'medical' },
] as const;

export type CategoryKey = typeof CATEGORIES[number]['key'];

export interface ClinicalCase {
  id: string; code: string; category: CategoryKey;
  name_ar: string; age_years: number; gender: string; severity: 'mild' | 'moderate' | 'severe';
  summary_ar: string; history_ar: string;
  sensory_profile: Record<string, string>;
  presenting_signs_ar: string[];
  patient_persona_ar: string; reference_ar: string;
}

export interface ProtocolStep { title_ar: string; instruction_ar: string; duration_sec: number; success_ar: string; }
export interface ClinicalProtocol {
  id: string; code: string; category: CategoryKey;
  name_ar: string; short_ar: string; goal_ar: string;
  steps: ProtocolStep[]; reference_ar: string;
}

export interface ClinicalSession {
  id: string; user_id: string; case_id: string; protocol_id: string | null;
  status: 'in_progress' | 'completed' | 'aborted';
  current_step: number; attention: number; anxiety: number; progress: number;
  started_at: string; ended_at?: string;
  mode?: 'guided' | 'free';
  free_intent?: any;
}

export interface ClinicalReport {
  id: string; user_id: string; session_id: string;
  score: number; diagnosis_ar?: string; summary_ar: string;
  strengths_ar: string[]; weaknesses_ar: string[];
  recommendations_ar: string[]; references_ar: string[];
  rubric: Record<string, number>; share_token: string; created_at: string;
}

export const SEVERITY_LABEL: Record<string, string> = { mild: 'خفيفة', moderate: 'متوسطة', severe: 'شديدة' };
export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.key, c.ar]));
export const CATEGORY_EMOJI: Record<string, string> = Object.fromEntries(CATEGORIES.map(c => [c.key, c.emoji]));
export const CATEGORY_GROUP: Record<string, 'special' | 'medical'> = Object.fromEntries(CATEGORIES.map(c => [c.key, c.group as any]));
