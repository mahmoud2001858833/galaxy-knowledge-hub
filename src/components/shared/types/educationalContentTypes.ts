
export interface EducationalImage {
  id: string;
  title: string;
  description: string | null;
  subject: 'physics' | 'chemistry' | 'biology' | 'mathematics';
  image_url: string;
  created_at: string;
  created_by: string | null;
}

export interface ScientificJournal {
  id: string;
  title: string;
  description: string | null;
  author: string | null; // Added author property as nullable
  subject: 'physics' | 'chemistry' | 'biology' | 'mathematics';
  cover_image_url: string;
  pdf_url: string;
  created_at: string;
  created_by: string | null;
}

export type SubjectType = 'physics' | 'chemistry' | 'biology' | 'mathematics';
