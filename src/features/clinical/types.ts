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

// لوحة ألوان مميّزة لكل فئة (HSL via tailwind classes — يستخدم في الهوية البصرية للحالة)
export const CATEGORY_THEME: Record<string, { from: string; to: string; ring: string; text: string }> = {
  asd:            { from: 'from-violet-500/20', to: 'to-fuchsia-500/10', ring: 'ring-violet-300', text: 'text-violet-700' },
  adhd:           { from: 'from-amber-500/20',  to: 'to-orange-500/10',  ring: 'ring-amber-300',  text: 'text-amber-700' },
  hearing:        { from: 'from-cyan-500/20',   to: 'to-sky-500/10',     ring: 'ring-cyan-300',   text: 'text-cyan-700' },
  visual:         { from: 'from-indigo-500/20', to: 'to-blue-500/10',    ring: 'ring-indigo-300', text: 'text-indigo-700' },
  learning_other: { from: 'from-emerald-500/20',to: 'to-teal-500/10',    ring: 'ring-emerald-300',text: 'text-emerald-700' },
  cardiology:     { from: 'from-rose-500/20',   to: 'to-red-500/10',     ring: 'ring-rose-300',   text: 'text-rose-700' },
  orthopedics:    { from: 'from-stone-500/20',  to: 'to-amber-500/10',   ring: 'ring-stone-300',  text: 'text-stone-700' },
  neurology:      { from: 'from-purple-500/20', to: 'to-violet-500/10',  ring: 'ring-purple-300', text: 'text-purple-700' },
  pulmonology:    { from: 'from-sky-500/20',    to: 'to-cyan-500/10',    ring: 'ring-sky-300',    text: 'text-sky-700' },
  nephrology:     { from: 'from-blue-500/20',   to: 'to-cyan-500/10',    ring: 'ring-blue-300',   text: 'text-blue-700' },
  endocrinology:  { from: 'from-pink-500/20',   to: 'to-rose-500/10',    ring: 'ring-pink-300',   text: 'text-pink-700' },
  gastro:         { from: 'from-orange-500/20', to: 'to-amber-500/10',   ring: 'ring-orange-300', text: 'text-orange-700' },
  emergency:      { from: 'from-red-600/25',    to: 'to-rose-500/10',    ring: 'ring-red-400',    text: 'text-red-700' },
  pediatrics:     { from: 'from-pink-400/20',   to: 'to-orange-300/10',  ring: 'ring-pink-300',   text: 'text-pink-600' },
  obgyn:          { from: 'from-rose-400/20',   to: 'to-pink-300/10',    ring: 'ring-rose-300',   text: 'text-rose-600' },
  dermatology:    { from: 'from-amber-300/20',  to: 'to-yellow-300/10',  ring: 'ring-amber-300',  text: 'text-amber-700' },
  ophthalmology:  { from: 'from-indigo-400/20', to: 'to-blue-300/10',    ring: 'ring-indigo-300', text: 'text-indigo-700' },
  ent:            { from: 'from-teal-500/20',   to: 'to-cyan-500/10',    ring: 'ring-teal-300',   text: 'text-teal-700' },
  psychiatry:     { from: 'from-fuchsia-500/20',to: 'to-purple-500/10',  ring: 'ring-fuchsia-300',text: 'text-fuchsia-700' },
  internal:       { from: 'from-slate-500/20',  to: 'to-gray-500/10',    ring: 'ring-slate-300',  text: 'text-slate-700' },
};

export interface VitalsState {
  hr?: number; bp_sys?: number; bp_dia?: number; spo2?: number;
  rr?: number; temp?: number; glucose?: number; pain?: number; mood?: number;
}

export interface ClinicalCase {
  id: string; code: string; category: CategoryKey;
  name_ar: string; age_years: number; gender: string; severity: 'mild' | 'moderate' | 'severe';
  summary_ar: string; history_ar: string;
  sensory_profile: Record<string, string>;
  presenting_signs_ar: string[];
  patient_persona_ar: string; reference_ar: string;
  current_medications?: string[];
  vitals_initial?: VitalsState;
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
  vitals_state?: VitalsState;
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

// أيقونة الحالة: ذكر/أنثى فقط بناءً على gender (لا أي رموز أخرى)
export const caseAvatarFromName = (_name: string, gender?: string): string => {
  const g = (gender || '').toLowerCase().trim();
  const isFemale = g === 'female' || g === 'f' || g === 'أنثى' || g === 'انثى' || g === 'بنت' || g === 'فتاة' || g === 'امرأة' || g === 'سيدة';
  return isFemale ? '👩' : '👨';
};
