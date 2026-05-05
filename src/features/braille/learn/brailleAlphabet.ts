// Arabic Braille alphabet - dot patterns (1-6) per Unified Arabic Braille
// Each entry: letter -> dots that are raised
export type Dots = number[];

export interface BrailleLetter {
  char: string;
  name: string; // Arabic name
  dots: Dots;
}

export const ARABIC_BRAILLE: BrailleLetter[] = [
  { char: 'ا', name: 'ألف', dots: [1] },
  { char: 'ب', name: 'باء', dots: [1, 2] },
  { char: 'ت', name: 'تاء', dots: [2, 3, 4, 5] },
  { char: 'ث', name: 'ثاء', dots: [1, 4, 5, 6] },
  { char: 'ج', name: 'جيم', dots: [2, 4, 5] },
  { char: 'ح', name: 'حاء', dots: [1, 2, 5] },
  { char: 'خ', name: 'خاء', dots: [1, 3, 4, 6] },
  { char: 'د', name: 'دال', dots: [1, 4, 5] },
  { char: 'ذ', name: 'ذال', dots: [2, 3, 4, 6] },
  { char: 'ر', name: 'راء', dots: [1, 2, 3, 5] },
  { char: 'ز', name: 'زاي', dots: [1, 3, 5, 6] },
  { char: 'س', name: 'سين', dots: [2, 3, 4] },
  { char: 'ش', name: 'شين', dots: [1, 4, 6] },
  { char: 'ص', name: 'صاد', dots: [1, 2, 3, 4, 6] },
  { char: 'ض', name: 'ضاد', dots: [1, 2, 4, 6] },
  { char: 'ط', name: 'طاء', dots: [2, 3, 4, 5, 6] },
  { char: 'ظ', name: 'ظاء', dots: [1, 2, 3, 4, 5, 6] },
  { char: 'ع', name: 'عين', dots: [1, 2, 4, 5, 6] },
  { char: 'غ', name: 'غين', dots: [1, 2, 6] },
  { char: 'ف', name: 'فاء', dots: [1, 2, 4] },
  { char: 'ق', name: 'قاف', dots: [1, 2, 3, 4, 5] },
  { char: 'ك', name: 'كاف', dots: [1, 3] },
  { char: 'ل', name: 'لام', dots: [1, 2, 3] },
  { char: 'م', name: 'ميم', dots: [1, 3, 4] },
  { char: 'ن', name: 'نون', dots: [1, 3, 4, 5] },
  { char: 'ه', name: 'هاء', dots: [1, 2, 5] },
  { char: 'و', name: 'واو', dots: [2, 4, 5, 6] },
  { char: 'ي', name: 'ياء', dots: [2, 4] },
];

export const ARABIC_NUMBERS: BrailleLetter[] = [
  { char: '1', name: 'واحد', dots: [1] },
  { char: '2', name: 'اثنان', dots: [1, 2] },
  { char: '3', name: 'ثلاثة', dots: [1, 4] },
  { char: '4', name: 'أربعة', dots: [1, 4, 5] },
  { char: '5', name: 'خمسة', dots: [1, 5] },
  { char: '6', name: 'ستة', dots: [1, 2, 4] },
  { char: '7', name: 'سبعة', dots: [1, 2, 4, 5] },
  { char: '8', name: 'ثمانية', dots: [1, 2, 5] },
  { char: '9', name: 'تسعة', dots: [2, 4] },
  { char: '0', name: 'صفر', dots: [2, 4, 5] },
];

export const findLetterByChar = (ch: string) =>
  ARABIC_BRAILLE.find((l) => l.char === ch) || ARABIC_NUMBERS.find((l) => l.char === ch);

export const dotsEqual = (a: Dots, b: Dots) => {
  if (a.length !== b.length) return false;
  const sa = [...a].sort().join(',');
  const sb = [...b].sort().join(',');
  return sa === sb;
};

export const describeDots = (dots: Dots): string => {
  if (!dots.length) return 'لا توجد نقاط بارزة';
  const sorted = [...dots].sort((a, b) => a - b);
  return `النقاط ${sorted.join(' و')} بارزة`;
};
