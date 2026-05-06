export const CATEGORIES = [
  { key: 'asd',            ar: 'اضطراب طيف التوحد',     emoji: '🧩' },
  { key: 'adhd',           ar: 'فرط الحركة وتشتت الانتباه', emoji: '⚡' },
  { key: 'hearing',        ar: 'الإعاقة السمعية',         emoji: '👂' },
  { key: 'visual',         ar: 'الإعاقة البصرية',         emoji: '👁️' },
  { key: 'learning_other', ar: 'صعوبات تعلّم وتأخر لغوي', emoji: '📚' },
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
  id: string; user_id: string; case_id: string; protocol_id: string;
  status: 'in_progress' | 'completed' | 'aborted';
  current_step: number; attention: number; anxiety: number; progress: number;
  started_at: string; ended_at?: string;
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
