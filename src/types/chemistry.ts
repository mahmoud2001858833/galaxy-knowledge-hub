
export interface ChemistryPuzzleType {
  id: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  points: number;
  image: string | null;
  created_at: string;
}
