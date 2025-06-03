
export interface Particle {
  id: string;
  type: 'proton' | 'neutron' | 'electron';
  x: number;
  y: number;
  orbitalLevel?: number;
  angle?: number;
  isLocked?: boolean;
}

export interface AtomData {
  protons: number;
  neutrons: number;
  electrons: number;
  element: string;
  symbol: string;
  massNumber: number;
  charge: number;
  isStable: boolean;
  electronConfiguration: string;
  isValid: boolean;
  warnings: string[];
}

export interface SuggestedElement {
  name: string;
  symbol: string;
  protons: number;
  neutrons: number;
  electrons: number;
  electronConfig: string;
  icon: string;
}

export interface ElementInfo {
  name: string;
  symbol: string;
  atomicNumber: number;
  period: number;
  group: number;
  category: string;
  electronicConfiguration: string;
  uses: string[];
  properties: string[];
}

// الثوابت الفيزيائية المحسنة - نواة أكبر ومدارات محسنة
export const ATOM_CENTER = { x: 400, y: 350 };
export const NUCLEUS_RADIUS = 120; // نواة أكبر بكثير لتستوعب المزيد من النوكليونات
export const PARTICLE_SIZE = 15; // جسيمات أكبر للوضوح البصري
export const ORBITAL_RADII = [160, 220, 280, 340, 400, 460, 520]; // مدارات أوسع ومتباعدة أكثر
export const ORBITAL_CAPACITY = [2, 8, 18, 32, 32, 18, 8]; // السعة الصحيحة للمدارات

// ترتيب ملء الإلكترونات
export const ELECTRON_SHELL_ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s'];

// سعة كل مدار فرعي
export const SHELL_CAPACITIES: { [key: string]: number } = {
  '1s': 2, '2s': 2, '2p': 6, '3s': 2, '3p': 6, '4s': 2, '3d': 10,
  '4p': 6, '5s': 2, '4d': 10, '5p': 6, '6s': 2, '4f': 14, '5d': 10, '6p': 6, '7s': 2
};

// تطابق المدارات مع المستويات
export const SHELL_TO_LEVEL: { [key: string]: number } = {
  '1s': 0,
  '2s': 1, '2p': 1,
  '3s': 2, '3p': 2, '3d': 2,
  '4s': 3, '4p': 3, '4d': 3, '4f': 3,
  '5s': 4, '5p': 4, '5d': 4,
  '6s': 5, '6p': 5,
  '7s': 6
};

// العناصر المقترحة
export const SUGGESTED_ELEMENTS: SuggestedElement[] = [
  { name: 'هيدروجين', symbol: 'H', protons: 1, neutrons: 0, electrons: 1, electronConfig: '1s¹', icon: '🟢' },
  { name: 'هيليوم', symbol: 'He', protons: 2, neutrons: 2, electrons: 2, electronConfig: '1s²', icon: '🔵' },
  { name: 'ليثيوم', symbol: 'Li', protons: 3, neutrons: 4, electrons: 3, electronConfig: '1s² 2s¹', icon: '🟡' },
  { name: 'كربون', symbol: 'C', protons: 6, neutrons: 6, electrons: 6, electronConfig: '1s² 2s² 2p²', icon: '⚫' },
  { name: 'نيتروجين', symbol: 'N', protons: 7, neutrons: 7, electrons: 7, electronConfig: '1s² 2s² 2p³', icon: '🔷' },
  { name: 'أكسجين', symbol: 'O', protons: 8, neutrons: 8, electrons: 8, electronConfig: '1s² 2s² 2p⁴', icon: '🔴' },
  { name: 'فلور', symbol: 'F', protons: 9, neutrons: 10, electrons: 9, electronConfig: '1s² 2s² 2p⁵', icon: '🟣' },
  { name: 'نيون', symbol: 'Ne', protons: 10, neutrons: 10, electrons: 10, electronConfig: '1s² 2s² 2p⁶', icon: '🟠' },
  { name: 'صوديوم', symbol: 'Na', protons: 11, neutrons: 12, electrons: 11, electronConfig: '1s² 2s² 2p⁶ 3s¹', icon: '🟨' },
  { name: 'ماغنيسيوم', symbol: 'Mg', protons: 12, neutrons: 12, electrons: 12, electronConfig: '1s² 2s² 2p⁶ 3s²', icon: '🟫' }
];
