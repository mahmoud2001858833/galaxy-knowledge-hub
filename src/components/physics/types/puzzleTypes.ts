
// Define common types to be used across physics puzzle components
export interface Puzzle {
  id: string;
  title: string;
  description: string;
  answer: string;
  difficulty: string;
  hint?: string;
  created_at: string;
}

export interface PuzzleFormValues {
  title: string;
  description: string;
  hint?: string;
  answer: string;
  difficulty: string;
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
