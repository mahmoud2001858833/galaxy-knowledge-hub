export interface Chemical {
  id: string;
  name: string;
  nameAr: string;
  formula: string;
  color: string;
  state: 'solid' | 'liquid' | 'gas' | 'aqueous';
  concentration?: number;
  danger_level: 'safe' | 'caution' | 'danger';
  properties: {
    density?: number;
    ph?: number;
    boiling_point?: number;
    melting_point?: number;
  };
}

export interface Reaction {
  id: string;
  reactants: string[];
  products: string[];
  type: 'acid-base' | 'redox' | 'precipitation' | 'decomposition' | 'synthesis' | 'combustion';
  energy: 'exothermic' | 'endothermic' | 'neutral';
  energyValue: number;
  color_change?: string;
  gas_produced?: string;
  precipitate?: string;
  conditions?: {
    min_temp?: number;
    max_temp?: number;
    catalyst?: string;
  };
  safety_warning?: string;
  description: string;
}

export const CHEMICALS: Chemical[] = [
  // Acids
  {
    id: 'hcl',
    name: 'Hydrochloric Acid',
    nameAr: 'حمض الهيدروكلوريك',
    formula: 'HCl',
    color: '#e8f4f8',
    state: 'aqueous',
    concentration: 1.0,
    danger_level: 'danger',
    properties: { ph: 1, density: 1.02 }
  },
  {
    id: 'h2so4',
    name: 'Sulfuric Acid',
    nameAr: 'حمض الكبريتيك',
    formula: 'H₂SO₄',
    color: '#f0f8ff',
    state: 'aqueous',
    concentration: 1.0,
    danger_level: 'danger',
    properties: { ph: 0.5, density: 1.84 }
  },
  {
    id: 'hno3',
    name: 'Nitric Acid',
    nameAr: 'حمض النيتريك',
    formula: 'HNO₃',
    color: '#fffacd',
    state: 'aqueous',
    concentration: 1.0,
    danger_level: 'danger',
    properties: { ph: 1, density: 1.41 }
  },
  {
    id: 'ch3cooh',
    name: 'Acetic Acid',
    nameAr: 'حمض الأسيتيك',
    formula: 'CH₃COOH',
    color: '#f5f5dc',
    state: 'aqueous',
    concentration: 1.0,
    danger_level: 'caution',
    properties: { ph: 2.4, density: 1.05 }
  },
  
  // Bases
  {
    id: 'naoh',
    name: 'Sodium Hydroxide',
    nameAr: 'هيدروكسيد الصوديوم',
    formula: 'NaOH',
    color: '#e0f7fa',
    state: 'aqueous',
    concentration: 1.0,
    danger_level: 'danger',
    properties: { ph: 14, density: 1.04 }
  },
  {
    id: 'koh',
    name: 'Potassium Hydroxide',
    nameAr: 'هيدروكسيد البوتاسيوم',
    formula: 'KOH',
    color: '#e1f5fe',
    state: 'aqueous',
    concentration: 1.0,
    danger_level: 'danger',
    properties: { ph: 13.8, density: 1.05 }
  },
  {
    id: 'nh3',
    name: 'Ammonia',
    nameAr: 'الأمونيا',
    formula: 'NH₃',
    color: '#f0f8ff',
    state: 'aqueous',
    concentration: 1.0,
    danger_level: 'caution',
    properties: { ph: 11.6, density: 0.91 }
  },
  
  // Metals
  {
    id: 'na',
    name: 'Sodium',
    nameAr: 'الصوديوم',
    formula: 'Na',
    color: '#c0c0c0',
    state: 'solid',
    danger_level: 'danger',
    properties: { density: 0.97, melting_point: 97.8 }
  },
  {
    id: 'mg',
    name: 'Magnesium',
    nameAr: 'المغنيسيوم',
    formula: 'Mg',
    color: '#d3d3d3',
    state: 'solid',
    danger_level: 'caution',
    properties: { density: 1.74, melting_point: 650 }
  },
  {
    id: 'zn',
    name: 'Zinc',
    nameAr: 'الزنك',
    formula: 'Zn',
    color: '#8b8b8b',
    state: 'solid',
    danger_level: 'safe',
    properties: { density: 7.14, melting_point: 419.5 }
  },
  {
    id: 'cu',
    name: 'Copper',
    nameAr: 'النحاس',
    formula: 'Cu',
    color: '#b87333',
    state: 'solid',
    danger_level: 'safe',
    properties: { density: 8.96, melting_point: 1085 }
  },
  {
    id: 'fe',
    name: 'Iron',
    nameAr: 'الحديد',
    formula: 'Fe',
    color: '#696969',
    state: 'solid',
    danger_level: 'safe',
    properties: { density: 7.87, melting_point: 1538 }
  },
  
  // Salts and Compounds
  {
    id: 'nacl',
    name: 'Sodium Chloride',
    nameAr: 'كلوريد الصوديوم',
    formula: 'NaCl',
    color: '#ffffff',
    state: 'solid',
    danger_level: 'safe',
    properties: { density: 2.16, melting_point: 801 }
  },
  {
    id: 'na2co3',
    name: 'Sodium Carbonate',
    nameAr: 'كربونات الصوديوم',
    formula: 'Na₂CO₃',
    color: '#f5f5f5',
    state: 'solid',
    danger_level: 'caution',
    properties: { density: 2.54, melting_point: 851 }
  },
  {
    id: 'nahco3',
    name: 'Sodium Bicarbonate',
    nameAr: 'بيكربونات الصوديوم',
    formula: 'NaHCO₃',
    color: '#fafafa',
    state: 'solid',
    danger_level: 'safe',
    properties: { density: 2.20, melting_point: 50 }
  },
  {
    id: 'agno3',
    name: 'Silver Nitrate',
    nameAr: 'نترات الفضة',
    formula: 'AgNO₃',
    color: '#e8e8e8',
    state: 'aqueous',
    danger_level: 'caution',
    properties: { density: 4.35, melting_point: 212 }
  },
  {
    id: 'cuso4',
    name: 'Copper Sulfate',
    nameAr: 'كبريتات النحاس',
    formula: 'CuSO₄',
    color: '#4682b4',
    state: 'aqueous',
    danger_level: 'caution',
    properties: { density: 3.60 }
  },
  
  // Water and Common Solvents
  {
    id: 'h2o',
    name: 'Water',
    nameAr: 'الماء',
    formula: 'H₂O',
    color: '#e0f7fa',
    state: 'liquid',
    danger_level: 'safe',
    properties: { ph: 7, density: 1.0, boiling_point: 100, melting_point: 0 }
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    nameAr: 'الإيثانول',
    formula: 'C₂H₅OH',
    color: '#f0f8ff',
    state: 'liquid',
    danger_level: 'caution',
    properties: { density: 0.79, boiling_point: 78.4 }
  }
];

export const REACTIONS: Reaction[] = [
  {
    id: 'neutralization_hcl_naoh',
    reactants: ['hcl', 'naoh'],
    products: ['nacl', 'h2o'],
    type: 'acid-base',
    energy: 'exothermic',
    energyValue: -57.1,
    description: 'HCl + NaOH → NaCl + H₂O',
    safety_warning: 'ارتدِ نظارات واقية - تفاعل طارد للحرارة'
  },
  {
    id: 'zinc_acid',
    reactants: ['zn', 'hcl'],
    products: ['h2o'],
    type: 'redox',
    energy: 'exothermic',
    energyValue: -153.9,
    gas_produced: 'H₂',
    color_change: '#e8f4f8',
    description: 'Zn + 2HCl → ZnCl₂ + H₂↑',
    safety_warning: 'غاز الهيدروجين قابل للاشتعال'
  },
  {
    id: 'mg_acid',
    reactants: ['mg', 'hcl'],
    products: ['h2o'],
    type: 'redox',
    energy: 'exothermic',
    energyValue: -466.9,
    gas_produced: 'H₂',
    description: 'Mg + 2HCl → MgCl₂ + H₂↑',
    safety_warning: 'تفاعل سريع - غاز قابل للاشتعال'
  },
  {
    id: 'sodium_water',
    reactants: ['na', 'h2o'],
    products: ['naoh'],
    type: 'redox',
    energy: 'exothermic',
    energyValue: -368.4,
    gas_produced: 'H₂',
    color_change: '#ffe4e1',
    description: '2Na + 2H₂O → 2NaOH + H₂↑',
    safety_warning: 'خطر! تفاعل عنيف جداً - احتمال اشتعال'
  },
  {
    id: 'carbonate_acid',
    reactants: ['na2co3', 'hcl'],
    products: ['nacl', 'h2o'],
    type: 'acid-base',
    energy: 'exothermic',
    energyValue: -20.5,
    gas_produced: 'CO₂',
    description: 'Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑',
    safety_warning: 'انبعاث ثاني أكسيد الكربون'
  },
  {
    id: 'bicarbonate_acid',
    reactants: ['nahco3', 'ch3cooh'],
    products: ['h2o'],
    type: 'acid-base',
    energy: 'endothermic',
    energyValue: 12.3,
    gas_produced: 'CO₂',
    description: 'NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂↑'
  },
  {
    id: 'silver_chloride',
    reactants: ['agno3', 'nacl'],
    products: ['h2o'],
    type: 'precipitation',
    energy: 'exothermic',
    energyValue: -65.5,
    precipitate: '#ffffff',
    color_change: '#ffffff',
    description: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
    safety_warning: 'تكوين راسب أبيض'
  },
  {
    id: 'copper_displacement',
    reactants: ['zn', 'cuso4'],
    products: ['cu'],
    type: 'redox',
    energy: 'exothermic',
    energyValue: -219.7,
    color_change: '#b87333',
    description: 'Zn + CuSO₄ → ZnSO₄ + Cu',
    safety_warning: 'ترسب النحاس على الزنك'
  },
  {
    id: 'iron_copper',
    reactants: ['fe', 'cuso4'],
    products: ['cu'],
    type: 'redox',
    energy: 'exothermic',
    energyValue: -158.2,
    color_change: '#b87333',
    description: 'Fe + CuSO₄ → FeSO₄ + Cu'
  },
  {
    id: 'ammonia_acid',
    reactants: ['nh3', 'hcl'],
    products: ['h2o'],
    type: 'acid-base',
    energy: 'exothermic',
    energyValue: -52.9,
    color_change: '#ffffff',
    description: 'NH₃ + HCl → NH₄Cl'
  }
];

export const findReaction = (chemicals: string[]): Reaction | null => {
  if (chemicals.length < 2) return null;
  
  return REACTIONS.find(reaction => {
    const hasAllReactants = reaction.reactants.every(r => chemicals.includes(r));
    const sameLength = reaction.reactants.length === chemicals.length;
    return hasAllReactants && sameLength;
  }) || null;
};

export const getChemicalById = (id: string): Chemical | undefined => {
  return CHEMICALS.find(c => c.id === id);
};
