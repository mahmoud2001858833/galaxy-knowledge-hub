
export interface Puzzle {
  id: string;
  title: string;
  question: string;
  description?: string; // Added for compatibility
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard' | string;
  correct_answer: string;
  answer?: string; // Added for compatibility
  points: number;
  image?: string;
  created_at?: string;
  created_by?: string;
  subject?: string;
  hint?: string; // Added for hints
  admin_password?: string; // Added for admin functionality
}

export interface PuzzleFormValues {
  title: string;
  question: string;
  description?: string; // Added for compatibility
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  correct_answer: string;
  answer?: string; // Added for compatibility
  points: number;
  image?: string;
  subject?: string;
  hint?: string; // Added for hints
}

export interface DatabasePuzzle {
  id: string;
  title: string;
  question: string;
  description?: string; // Added for compatibility
  options: string[];
  difficulty: string;
  correct_answer: string;
  answer?: string; // Added for compatibility
  points: number;
  image?: string;
  created_at: string;
  created_by?: string;
  subject?: string;
  hint?: string; // Added for hints
  admin_password?: string; // Added for admin access
}
