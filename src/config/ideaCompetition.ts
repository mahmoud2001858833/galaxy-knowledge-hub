import type { LucideIcon } from 'lucide-react';
import { Briefcase, Cpu, FlaskConical, Landmark, Leaf, Lightbulb, Palette, PenLine } from 'lucide-react';

/** «مسابقة الأفكار» — shared by the public page, the navbar and the admin panel. */
export const IDEA_COMPETITION = {
  path: '/idea-competition',
  navLabel: 'مسابقة الأفكار',
  title: 'مسابقة أفضل فكرة',
  tagline: 'عندك فكرة ممكن تغيّر مدرستك أو منطقتك؟ سجّلها، وأفضل فكرة بتتكرّم وبتاخذ جائزة.',
} as const;

export type IdeaCategory =
  | 'environment'
  | 'technology'
  | 'science'
  | 'literature'
  | 'culture'
  | 'arts'
  | 'business'
  | 'other';

export const IDEA_CATEGORIES: { id: IdeaCategory; label: string; icon: LucideIcon; hint: string }[] = [
  { id: 'environment', label: 'البيئة', icon: Leaf, hint: 'نظافة، تدوير، مياه، طاقة' },
  { id: 'technology', label: 'التكنولوجيا', icon: Cpu, hint: 'تطبيق، موقع، جهاز، برمجة' },
  { id: 'science', label: 'العلوم', icon: FlaskConical, hint: 'تجربة، اختراع، حل علمي' },
  { id: 'literature', label: 'الأدب', icon: PenLine, hint: 'قصة، شعر، مبادرة قراءة' },
  { id: 'culture', label: 'الثقافة', icon: Landmark, hint: 'تراث، هوية، مجتمع' },
  { id: 'arts', label: 'الفنون', icon: Palette, hint: 'رسم، تصميم، مسرح، تصوير' },
  { id: 'business', label: 'الأعمال', icon: Briefcase, hint: 'مشروع صغير، خدمة، ريادة' },
  { id: 'other', label: 'مجال آخر', icon: Lightbulb, hint: 'أي فكرة ما بتنحط بمجال' },
];

export const ideaCategoryLabel = (id: string) => IDEA_CATEGORIES.find((c) => c.id === id)?.label ?? id;
