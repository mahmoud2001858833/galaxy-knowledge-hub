
// Define common types to be used across puzzle components
export interface Puzzle {
  id: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  points: number;
  image?: string | null;
  created_at: string;
  created_by?: string | null;
  admin_password?: string;
  subject?: string;
  hint?: string;
  
  // Alternative property names used in some components
  description?: string;
  answer?: string;
}

export interface PuzzleFormValues {
  title: string;
  description?: string;
  hint?: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  points: number;
  image?: string | null;
  
  // Alternative property name used in some components
  answer?: string;
}

export interface DatabasePuzzle {
  id: string;
  title: string;
  question: string;
  correct_answer: string;
  difficulty: string;
  hint?: string;
  created_at: string;
  admin_password?: string;
  image?: string | null;
  options?: string[];
  points?: number;
  created_by?: string | null;
  subject?: string;
}
