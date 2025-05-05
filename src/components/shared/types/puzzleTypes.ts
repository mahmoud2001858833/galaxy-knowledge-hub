
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
  
  // Additional properties that may not exist in the database
  // but are used in the components
  subject?: string;
  hint?: string;
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
  answer?: string;
}

// This interface strictly reflects the database structure
export interface DatabasePuzzle {
  id: string;
  title: string;
  question: string;
  correct_answer: string;
  difficulty: string;
  admin_password: string;
  image?: string | null;
  options: string[];
  points: number;
  created_at: string;
  created_by?: string | null;
  
  // These fields might not exist in all tables
  hint?: string;
  subject?: string;
}
