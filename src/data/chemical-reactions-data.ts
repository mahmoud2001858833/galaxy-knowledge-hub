export interface Atom {
  element: string;
  symbol: string;
  color: string;
  position: [number, number, number];
}

export interface Bond {
  from: number;
  to: number;
  type: 'single' | 'double' | 'triple';
}

export interface Molecule {
  atoms: Atom[];
  bonds: Bond[];
  formula: string;
}

export interface ChemicalReaction {
  id: string;
  nameAr: string;
  nameEn: string;
  equation: string;
  complexity: 'simple' | 'medium' | 'complex';
  category: string;
  reactants: Molecule[];
  products: Molecule[];
  description: string;
  energyChange: 'exothermic' | 'endothermic';
  educationalNotes: string;
}

// Element colors based on CPK coloring convention
export const ELEMENT_COLORS: Record<string, string> = {
  H: '#ffffff',  // Hydrogen - white
  C: '#909090',  // Carbon - grey
  N: '#3050f8',  // Nitrogen - blue
  O: '#ff0d0d',  // Oxygen - red
  F: '#90e050',  // Fluorine - green
  Cl: '#1ff01f', // Chlorine - green
  S: '#ffff30',  // Sulfur - yellow
  P: '#ff8000',  // Phosphorus - orange
  Na: '#ab5cf2', // Sodium - violet
  Mg: '#8aff00', // Magnesium - green
  Ca: '#3dff00', // Calcium - green
  Fe: '#e06633', // Iron - orange
};

export const chemicalReactions: ChemicalReaction[] = [
  // Simple reactions (1-10)
  {
    id: 'water-formation',
    nameAr: 'تكوين الماء',
    nameEn: 'Water Formation',
    equation: '2H₂ + O₂ → 2H₂O',
    complexity: 'simple',
    category: 'تفاعلات بسيطة',
    energyChange: 'exothermic',
    description: 'تفاعل الهيدروجين مع الأكسجين لتكوين الماء',
    educationalNotes: 'تفاعل طارد للحرارة ينتج طاقة كبيرة',
    reactants: [
      {
        formula: 'H₂',
        atoms: [
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-3, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-2, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'single' }],
      },
      {
        formula: 'O₂',
        atoms: [
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [3, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'double' }],
      },
    ],
    products: [
      {
        formula: 'H₂O',
        atoms: [
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [0, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.7, 0.7, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.7, -0.7, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
        ],
      },
    ],
  },
  {
    id: 'co2-formation',
    nameAr: 'تكوين ثاني أكسيد الكربون',
    nameEn: 'Carbon Dioxide Formation',
    equation: 'C + O₂ → CO₂',
    complexity: 'simple',
    category: 'تفاعلات بسيطة',
    energyChange: 'exothermic',
    description: 'احتراق الكربون مع الأكسجين',
    educationalNotes: 'تفاعل احتراق كامل ينتج ثاني أكسيد الكربون',
    reactants: [
      {
        formula: 'C',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [-2, 0, 0] },
        ],
        bonds: [],
      },
      {
        formula: 'O₂',
        atoms: [
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [3, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'double' }],
      },
    ],
    products: [
      {
        formula: 'CO₂',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-1.2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [1.2, 0, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'double' },
          { from: 0, to: 2, type: 'double' },
        ],
      },
    ],
  },
  {
    id: 'ammonia-formation',
    nameAr: 'تكوين الأمونيا',
    nameEn: 'Ammonia Formation',
    equation: 'N₂ + 3H₂ → 2NH₃',
    complexity: 'simple',
    category: 'تفاعلات بسيطة',
    energyChange: 'exothermic',
    description: 'عملية هابر - تكوين الأمونيا من النيتروجين والهيدروجين',
    educationalNotes: 'تفاعل صناعي مهم لإنتاج الأسمدة',
    reactants: [
      {
        formula: 'N₂',
        atoms: [
          { element: 'Nitrogen', symbol: 'N', color: ELEMENT_COLORS.N, position: [-3, 0, 0] },
          { element: 'Nitrogen', symbol: 'N', color: ELEMENT_COLORS.N, position: [-2, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'triple' }],
      },
      {
        formula: 'H₂',
        atoms: [
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [2, 1, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [3, 1, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'single' }],
      },
    ],
    products: [
      {
        formula: 'NH₃',
        atoms: [
          { element: 'Nitrogen', symbol: 'N', color: ELEMENT_COLORS.N, position: [0, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.6, 0.6, 0.6] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.6, -0.6, 0.6] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [0.8, 0, -0.6] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
          { from: 0, to: 3, type: 'single' },
        ],
      },
    ],
  },
  {
    id: 'nacl-formation',
    nameAr: 'تكوين كلوريد الصوديوم',
    nameEn: 'Sodium Chloride Formation',
    equation: '2Na + Cl₂ → 2NaCl',
    complexity: 'simple',
    category: 'تفاعلات بسيطة',
    energyChange: 'exothermic',
    description: 'تفاعل الصوديوم مع الكلور لتكوين ملح الطعام',
    educationalNotes: 'تفاعل أيوني عنيف ينتج ملح الطعام',
    reactants: [
      {
        formula: 'Na',
        atoms: [
          { element: 'Sodium', symbol: 'Na', color: ELEMENT_COLORS.Na, position: [-2, 0, 0] },
        ],
        bonds: [],
      },
      {
        formula: 'Cl₂',
        atoms: [
          { element: 'Chlorine', symbol: 'Cl', color: ELEMENT_COLORS.Cl, position: [2, 0, 0] },
          { element: 'Chlorine', symbol: 'Cl', color: ELEMENT_COLORS.Cl, position: [3, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'single' }],
      },
    ],
    products: [
      {
        formula: 'NaCl',
        atoms: [
          { element: 'Sodium', symbol: 'Na', color: ELEMENT_COLORS.Na, position: [-0.5, 0, 0] },
          { element: 'Chlorine', symbol: 'Cl', color: ELEMENT_COLORS.Cl, position: [0.5, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'single' }],
      },
    ],
  },
  {
    id: 'methane-formation',
    nameAr: 'تكوين الميثان',
    nameEn: 'Methane Formation',
    equation: 'C + 2H₂ → CH₄',
    complexity: 'simple',
    category: 'تفاعلات بسيطة',
    energyChange: 'exothermic',
    description: 'تكوين الميثان من الكربون والهيدروجين',
    educationalNotes: 'أبسط جزيء عضوي - غاز طبيعي',
    reactants: [
      {
        formula: 'C',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0, 0, 0] },
        ],
        bonds: [],
      },
      {
        formula: 'H₂',
        atoms: [
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [2, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [3, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'single' }],
      },
    ],
    products: [
      {
        formula: 'CH₄',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [0.8, 0.8, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.8, 0.8, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [0.8, -0.8, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.8, -0.8, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
          { from: 0, to: 3, type: 'single' },
          { from: 0, to: 4, type: 'single' },
        ],
      },
    ],
  },

  // Medium complexity (6-15)
  {
    id: 'ethanol-formation',
    nameAr: 'تكوين الإيثانول',
    nameEn: 'Ethanol Formation',
    equation: 'C₂H₄ + H₂O → C₂H₅OH',
    complexity: 'medium',
    category: 'تفاعلات متوسطة',
    energyChange: 'exothermic',
    description: 'إضافة الماء إلى الإيثيلين لتكوين الإيثانول (الكحول)',
    educationalNotes: 'تفاعل صناعي لإنتاج الكحول',
    reactants: [
      {
        formula: 'C₂H₄',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [-2, 0, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [-1, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-2.5, 0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-2.5, -0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.5, 0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.5, -0.5, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'double' },
          { from: 0, to: 2, type: 'single' },
          { from: 0, to: 3, type: 'single' },
          { from: 1, to: 4, type: 'single' },
          { from: 1, to: 5, type: 'single' },
        ],
      },
      {
        formula: 'H₂O',
        atoms: [
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [2, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [1.5, 0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [2.5, 0.5, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
        ],
      },
    ],
    products: [
      {
        formula: 'C₂H₅OH',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0, 0, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [1, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [2, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.5, 0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.5, -0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [0, 0, 0.8] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [1, 0.5, 0.5] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [1, -0.5, 0.5] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [2.5, 0, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 1, to: 2, type: 'single' },
          { from: 0, to: 3, type: 'single' },
          { from: 0, to: 4, type: 'single' },
          { from: 0, to: 5, type: 'single' },
          { from: 1, to: 6, type: 'single' },
          { from: 1, to: 7, type: 'single' },
          { from: 2, to: 8, type: 'single' },
        ],
      },
    ],
  },
  {
    id: 'glucose-formation',
    nameAr: 'تكوين الجلوكوز (البناء الضوئي)',
    nameEn: 'Glucose Formation (Photosynthesis)',
    equation: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
    complexity: 'medium',
    category: 'تفاعلات حيوية',
    energyChange: 'endothermic',
    description: 'عملية البناء الضوئي - تكوين السكر من ثاني أكسيد الكربون والماء',
    educationalNotes: 'أهم تفاعل حيوي على الأرض يحدث في النباتات',
    reactants: [
      {
        formula: 'CO₂',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [-2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-3, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-1, 0, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'double' },
          { from: 0, to: 2, type: 'double' },
        ],
      },
      {
        formula: 'H₂O',
        atoms: [
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [2, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [1.5, 0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [2.5, 0.5, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
        ],
      },
    ],
    products: [
      {
        formula: 'C₆H₁₂O₆',
        atoms: [
          // Ring structure - simplified glucose representation
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0, 1, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0.9, 0.5, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0.9, -0.5, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0, -1, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [-0.9, -0.5, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-0.9, 0.5, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0, 2, 0] },
          // Simplified H and O positions
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [1.8, 1, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [1.8, -1, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [0, -2, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-1.8, -1, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 1, to: 2, type: 'single' },
          { from: 2, to: 3, type: 'single' },
          { from: 3, to: 4, type: 'single' },
          { from: 4, to: 5, type: 'single' },
          { from: 5, to: 0, type: 'single' },
          { from: 0, to: 6, type: 'single' },
          { from: 1, to: 7, type: 'single' },
          { from: 2, to: 8, type: 'single' },
          { from: 3, to: 9, type: 'single' },
          { from: 4, to: 10, type: 'single' },
        ],
      },
    ],
  },

  // Additional reactions for variety (7-30+)
  {
    id: 'h2s-formation',
    nameAr: 'تكوين كبريتيد الهيدروجين',
    nameEn: 'Hydrogen Sulfide Formation',
    equation: 'H₂ + S → H₂S',
    complexity: 'simple',
    category: 'تفاعلات بسيطة',
    energyChange: 'exothermic',
    description: 'تفاعل الهيدروجين مع الكبريت',
    educationalNotes: 'ينتج غاز كريه الرائحة',
    reactants: [
      {
        formula: 'H₂',
        atoms: [
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-2, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-1, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'single' }],
      },
      {
        formula: 'S',
        atoms: [
          { element: 'Sulfur', symbol: 'S', color: ELEMENT_COLORS.S, position: [2, 0, 0] },
        ],
        bonds: [],
      },
    ],
    products: [
      {
        formula: 'H₂S',
        atoms: [
          { element: 'Sulfur', symbol: 'S', color: ELEMENT_COLORS.S, position: [0, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.7, 0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.7, -0.5, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
        ],
      },
    ],
  },
  {
    id: 'mgo-formation',
    nameAr: 'تكوين أكسيد المغنيسيوم',
    nameEn: 'Magnesium Oxide Formation',
    equation: '2Mg + O₂ → 2MgO',
    complexity: 'simple',
    category: 'تفاعلات بسيطة',
    energyChange: 'exothermic',
    description: 'احتراق المغنيسيوم في الهواء',
    educationalNotes: 'يعطي ضوءاً أبيض ساطعاً',
    reactants: [
      {
        formula: 'Mg',
        atoms: [
          { element: 'Magnesium', symbol: 'Mg', color: ELEMENT_COLORS.Mg, position: [-2, 0, 0] },
        ],
        bonds: [],
      },
      {
        formula: 'O₂',
        atoms: [
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [3, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'double' }],
      },
    ],
    products: [
      {
        formula: 'MgO',
        atoms: [
          { element: 'Magnesium', symbol: 'Mg', color: ELEMENT_COLORS.Mg, position: [-0.5, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [0.5, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'single' }],
      },
    ],
  },
  {
    id: 'so2-formation',
    nameAr: 'تكوين ثاني أكسيد الكبريت',
    nameEn: 'Sulfur Dioxide Formation',
    equation: 'S + O₂ → SO₂',
    complexity: 'simple',
    category: 'تفاعلات بسيطة',
    energyChange: 'exothermic',
    description: 'احتراق الكبريت في الأكسجين',
    educationalNotes: 'ينتج غاز خانق يسبب الأمطار الحمضية',
    reactants: [
      {
        formula: 'S',
        atoms: [
          { element: 'Sulfur', symbol: 'S', color: ELEMENT_COLORS.S, position: [-2, 0, 0] },
        ],
        bonds: [],
      },
      {
        formula: 'O₂',
        atoms: [
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [3, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'double' }],
      },
    ],
    products: [
      {
        formula: 'SO₂',
        atoms: [
          { element: 'Sulfur', symbol: 'S', color: ELEMENT_COLORS.S, position: [0, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-1, 0.5, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [1, 0.5, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'double' },
          { from: 0, to: 2, type: 'double' },
        ],
      },
    ],
  },
  {
    id: 'ozone-formation',
    nameAr: 'تكوين الأوزون',
    nameEn: 'Ozone Formation',
    equation: '3O₂ → 2O₃',
    complexity: 'medium',
    category: 'تفاعلات متوسطة',
    energyChange: 'endothermic',
    description: 'تكوين الأوزون من الأكسجين بوجود الأشعة فوق البنفسجية',
    educationalNotes: 'يشكل طبقة حماية في الغلاف الجوي',
    reactants: [
      {
        formula: 'O₂',
        atoms: [
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-1, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'double' }],
      },
    ],
    products: [
      {
        formula: 'O₃',
        atoms: [
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [0, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-0.8, 0.8, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [0.8, 0.8, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'double' },
        ],
      },
    ],
  },
  {
    id: 'sulfuric-acid-formation',
    nameAr: 'تكوين حمض الكبريتيك',
    nameEn: 'Sulfuric Acid Formation',
    equation: 'SO₃ + H₂O → H₂SO₄',
    complexity: 'medium',
    category: 'تفاعلات متوسطة',
    energyChange: 'exothermic',
    description: 'تفاعل ثالث أكسيد الكبريت مع الماء لتكوين حمض الكبريتيك',
    educationalNotes: 'أهم حمض صناعي في العالم - تفاعل عنيف',
    reactants: [
      {
        formula: 'SO₃',
        atoms: [
          { element: 'Sulfur', symbol: 'S', color: ELEMENT_COLORS.S, position: [-2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-3, 0.8, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-1, 0.8, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-2, -1, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'double' },
          { from: 0, to: 2, type: 'double' },
          { from: 0, to: 3, type: 'double' },
        ],
      },
      {
        formula: 'H₂O',
        atoms: [
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [2, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [1.5, 0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [2.5, 0.5, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
        ],
      },
    ],
    products: [
      {
        formula: 'H₂SO₄',
        atoms: [
          { element: 'Sulfur', symbol: 'S', color: ELEMENT_COLORS.S, position: [0, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-1, 0.8, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [1, 0.8, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-0.7, -0.9, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [0.7, -0.9, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-1.3, -1.4, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [1.3, -1.4, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'double' },
          { from: 0, to: 2, type: 'double' },
          { from: 0, to: 3, type: 'single' },
          { from: 0, to: 4, type: 'single' },
          { from: 3, to: 5, type: 'single' },
          { from: 4, to: 6, type: 'single' },
        ],
      },
    ],
  },
  {
    id: 'calcium-carbonate-formation',
    nameAr: 'تكوين كربونات الكالسيوم',
    nameEn: 'Calcium Carbonate Formation',
    equation: 'CaO + CO₂ → CaCO₃',
    complexity: 'medium',
    category: 'تفاعلات متوسطة',
    energyChange: 'exothermic',
    description: 'تفاعل أكسيد الكالسيوم مع ثاني أكسيد الكربون',
    educationalNotes: 'ينتج الحجر الجيري (الكالسايت) - مكون الرخام',
    reactants: [
      {
        formula: 'CaO',
        atoms: [
          { element: 'Calcium', symbol: 'Ca', color: ELEMENT_COLORS.Ca, position: [-2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-1, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'double' }],
      },
      {
        formula: 'CO₂',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [1, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [3, 0, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'double' },
          { from: 0, to: 2, type: 'double' },
        ],
      },
    ],
    products: [
      {
        formula: 'CaCO₃',
        atoms: [
          { element: 'Calcium', symbol: 'Ca', color: ELEMENT_COLORS.Ca, position: [0, 0, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [1.2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [1.2, 1, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [2, -0.5, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [0.4, -0.5, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 1, to: 2, type: 'double' },
          { from: 1, to: 3, type: 'single' },
          { from: 1, to: 4, type: 'single' },
        ],
      },
    ],
  },
  {
    id: 'acetic-acid-formation',
    nameAr: 'تكوين حمض الأسيتيك',
    nameEn: 'Acetic Acid Formation',
    equation: 'CH₃OH + CO → CH₃COOH',
    complexity: 'medium',
    category: 'تفاعلات متوسطة',
    energyChange: 'exothermic',
    description: 'تفاعل الميثانول مع أول أكسيد الكربون',
    educationalNotes: 'ينتج الخل (حمض الأسيتيك) - مركب عضوي مهم',
    reactants: [
      {
        formula: 'CH₃OH',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [-2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [-1, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-2.5, 0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-2.5, -0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-2, 0, 0.7] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.5, 0.5, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 0, to: 2, type: 'single' },
          { from: 0, to: 3, type: 'single' },
          { from: 0, to: 4, type: 'single' },
          { from: 1, to: 5, type: 'single' },
        ],
      },
      {
        formula: 'CO',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [3, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'triple' }],
      },
    ],
    products: [
      {
        formula: 'CH₃COOH',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0, 0, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [1.2, 0, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [2, 0.5, 0] },
          { element: 'Oxygen', symbol: 'O', color: ELEMENT_COLORS.O, position: [1.5, -1, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.5, 0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-0.5, -0.5, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [0, 0, 0.7] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [2.5, 0.8, 0] },
        ],
        bonds: [
          { from: 0, to: 1, type: 'single' },
          { from: 1, to: 2, type: 'double' },
          { from: 1, to: 3, type: 'single' },
          { from: 0, to: 4, type: 'single' },
          { from: 0, to: 5, type: 'single' },
          { from: 0, to: 6, type: 'single' },
          { from: 3, to: 7, type: 'single' },
        ],
      },
    ],
  },
  {
    id: 'benzene-structure',
    nameAr: 'بنية البنزين',
    nameEn: 'Benzene Structure',
    equation: '6C + 3H₂ → C₆H₆',
    complexity: 'complex',
    category: 'تفاعلات معقدة',
    energyChange: 'exothermic',
    description: 'تكوين حلقة البنزين العطرية',
    educationalNotes: 'أساس الكيمياء العضوية العطرية - حلقة سداسية مستقرة',
    reactants: [
      {
        formula: 'C',
        atoms: [
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [-2, 0, 0] },
        ],
        bonds: [],
      },
      {
        formula: 'H₂',
        atoms: [
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [2, 0, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [3, 0, 0] },
        ],
        bonds: [{ from: 0, to: 1, type: 'single' }],
      },
    ],
    products: [
      {
        formula: 'C₆H₆',
        atoms: [
          // Hexagonal ring of carbons
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0, 1, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0.866, 0.5, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0.866, -0.5, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [0, -1, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [-0.866, -0.5, 0] },
          { element: 'Carbon', symbol: 'C', color: ELEMENT_COLORS.C, position: [-0.866, 0.5, 0] },
          // Hydrogens
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [0, 1.6, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [1.4, 0.8, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [1.4, -0.8, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [0, -1.6, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-1.4, -0.8, 0] },
          { element: 'Hydrogen', symbol: 'H', color: ELEMENT_COLORS.H, position: [-1.4, 0.8, 0] },
        ],
        bonds: [
          // Ring bonds (alternating single/double)
          { from: 0, to: 1, type: 'single' },
          { from: 1, to: 2, type: 'double' },
          { from: 2, to: 3, type: 'single' },
          { from: 3, to: 4, type: 'double' },
          { from: 4, to: 5, type: 'single' },
          { from: 5, to: 0, type: 'double' },
          // Hydrogen bonds
          { from: 0, to: 6, type: 'single' },
          { from: 1, to: 7, type: 'single' },
          { from: 2, to: 8, type: 'single' },
          { from: 3, to: 9, type: 'single' },
          { from: 4, to: 10, type: 'single' },
          { from: 5, to: 11, type: 'single' },
        ],
      },
    ],
  },
];
