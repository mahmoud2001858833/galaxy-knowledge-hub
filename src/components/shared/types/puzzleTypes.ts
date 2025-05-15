
export interface Puzzle {
  id: string;
  title: string;
  question: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard' | string;
  correct_answer: string;
  points: number;
  image?: string;
  created_at?: string;
  created_by?: string;
  subject?: string;
}

export interface PuzzleFormValues {
  title: string;
  question: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  correct_answer: string;
  points: number;
  image?: string;
  subject?: string;
}

export interface DatabasePuzzle {
  id: string;
  title: string;
  question: string;
  options: string[];
  difficulty: string;
  correct_answer: string;
  points: number;
  image?: string;
  created_at: string;
  created_by?: string;
  subject?: string;
}
