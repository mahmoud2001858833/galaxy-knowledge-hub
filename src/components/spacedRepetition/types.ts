export interface SpacedLesson {
  id: string;
  user_id: string;
  subject_name: string;
  lesson_name: string;
  first_study_date: string;
  study_duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  current_review_index: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpacedReview {
  id: string;
  lesson_id: string;
  user_id: string;
  review_number: number;
  scheduled_date: string;
  is_completed: boolean;
  completed_at: string | null;
  memory_retention: number;
  created_at: string;
  lesson?: SpacedLesson;
}

export interface SpacedStats {
  id: string;
  user_id: string;
  date: string;
  completed_reviews: number;
  total_study_minutes: number;
  streak_days: number;
  created_at: string;
}

export interface LessonFormData {
  subject_name: string;
  lesson_name: string;
  first_study_date: Date;
  study_duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const REVIEW_INTERVALS = [1, 3, 6, 10, 15, 21, 30, 45];

export const SUBJECTS = [
  { value: 'physics', label: 'الفيزياء', color: '#3b82f6' },
  { value: 'chemistry', label: 'الكيمياء', color: '#10b981' },
  { value: 'biology', label: 'الأحياء', color: '#22c55e' },
  { value: 'math', label: 'الرياضيات', color: '#f59e0b' },
  { value: 'arabic', label: 'اللغة العربية', color: '#ef4444' },
  { value: 'english', label: 'اللغة الإنجليزية', color: '#8b5cf6' },
  { value: 'islamic', label: 'التربية الإسلامية', color: '#06b6d4' },
  { value: 'history', label: 'التاريخ', color: '#f97316' },
  { value: 'geography', label: 'الجغرافيا', color: '#84cc16' },
  { value: 'other', label: 'أخرى', color: '#6b7280' },
];

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'سهل', stars: 1, multiplier: 1.2 },
  { value: 'medium', label: 'متوسط', stars: 2, multiplier: 1 },
  { value: 'hard', label: 'صعب', stars: 3, multiplier: 0.8 },
];
