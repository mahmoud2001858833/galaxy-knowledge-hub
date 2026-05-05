import { ARABIC_BRAILLE, ARABIC_NUMBERS, BrailleLetter } from './brailleAlphabet';

export type LessonType = 'theory' | 'write' | 'read' | 'word';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  level: Level;
  title: string;
  objective: string;
  type: LessonType;
  theory?: string;
  letters?: BrailleLetter[];
  words?: { text: string; hint?: string }[];
}

export const LEVELS: Record<Level, { label: string; color: string; description: string }> = {
  beginner: {
    label: 'المبتدئ',
    color: 'hsl(142, 76%, 36%)',
    description: 'التعرف على المبادئ الأساسية للغة بريل وتشكيل المفردة',
  },
  intermediate: {
    label: 'المتوسط',
    color: 'hsl(38, 92%, 50%)',
    description: 'تشكيل كلمات وجمل بسيطة وقراءتها',
  },
  advanced: {
    label: 'المتقدم',
    color: 'hsl(0, 84%, 60%)',
    description: 'المستوى القياسي 2 (الاختزالي) والقواعد المعقدة',
  },
};

export const LESSONS: Lesson[] = [
  // Beginner
  {
    id: 'b1',
    level: 'beginner',
    title: 'مقدمة عن خلية بريل',
    objective: 'التعرف على بنية الخلية والنقاط الست',
    type: 'theory',
    theory:
      'خلية بريل تتكون من 6 نقاط مرتبة في عمودين. العمود الأيسر فيه النقاط (1، 2، 3) من الأعلى إلى الأسفل، والعمود الأيمن فيه النقاط (4، 5، 6). كل حرف يتشكل بمجموعة مختلفة من هذه النقاط البارزة.',
  },
  {
    id: 'b2',
    level: 'beginner',
    title: 'الحروف الأولى: ا ب ت ث ج',
    objective: 'تعلم تشكيل أول 5 حروف عربية',
    type: 'write',
    letters: ARABIC_BRAILLE.slice(0, 5),
  },
  {
    id: 'b3',
    level: 'beginner',
    title: 'قراءة الحروف الأولى',
    objective: 'التعرف على الحروف لمساً وبصرياً',
    type: 'read',
    letters: ARABIC_BRAILLE.slice(0, 5),
  },
  {
    id: 'b4',
    level: 'beginner',
    title: 'حروف ح خ د ذ ر',
    objective: 'كتابة المجموعة الثانية',
    type: 'write',
    letters: ARABIC_BRAILLE.slice(5, 10),
  },
  // Intermediate
  {
    id: 'i1',
    level: 'intermediate',
    title: 'باقي الأبجدية',
    objective: 'إتقان كتابة كل الحروف العربية',
    type: 'write',
    letters: ARABIC_BRAILLE.slice(10),
  },
  {
    id: 'i2',
    level: 'intermediate',
    title: 'الأرقام',
    objective: 'كتابة الأرقام من 0 إلى 9',
    type: 'write',
    letters: ARABIC_NUMBERS,
  },
  {
    id: 'i3',
    level: 'intermediate',
    title: 'كلمات بسيطة',
    objective: 'كتابة وقراءة كلمات قصيرة',
    type: 'word',
    words: [
      { text: 'باب', hint: 'مدخل البيت' },
      { text: 'ماء', hint: 'سائل الحياة' },
      { text: 'كتاب' },
      { text: 'قلم' },
      { text: 'ولد' },
    ],
  },
  {
    id: 'i4',
    level: 'intermediate',
    title: 'جمل بسيطة',
    objective: 'قراءة جمل من عدة كلمات',
    type: 'read',
    words: [{ text: 'ذهب الولد' }, { text: 'فتح الباب' }],
  },
  // Advanced
  {
    id: 'a1',
    level: 'advanced',
    title: 'مقدمة المستوى الاختزالي',
    objective: 'فهم مبدأ الاختصارات في بريل',
    type: 'theory',
    theory:
      'المستوى القياسي 2 (الاختزالي) يستخدم رموزاً مختصرة لكلمات أو مقاطع شائعة لتسريع القراءة والكتابة. مثلاً، حرف واحد قد يمثل كلمة كاملة. هذا يقلل المساحة ويزيد سرعة القارئ المحترف.',
  },
  {
    id: 'a2',
    level: 'advanced',
    title: 'علامات الترقيم',
    objective: 'الفاصلة، النقطة، علامة الاستفهام',
    type: 'read',
    letters: [
      { char: '،', name: 'فاصلة', dots: [2] },
      { char: '.', name: 'نقطة', dots: [2, 5, 6] },
      { char: '؟', name: 'استفهام', dots: [2, 6] },
      { char: '!', name: 'تعجب', dots: [2, 3, 5] },
    ],
  },
  {
    id: 'a3',
    level: 'advanced',
    title: 'الكلمات الطويلة',
    objective: 'تطبيق الاختصارات في كلمات معقدة',
    type: 'word',
    words: [
      { text: 'مدرسة' },
      { text: 'جامعة' },
      { text: 'مستشفى' },
      { text: 'حاسوب' },
      { text: 'تعليم' },
    ],
  },
];
