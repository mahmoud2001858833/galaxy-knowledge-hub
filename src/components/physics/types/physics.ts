
export interface PhysicsCalculation {
  id: string;
  name: string;
  description: string;
  inputs: CalculationInput[];
  formula: string;
  category: string;
}

export interface CalculationInput {
  id: string;
  label: string;
  unit: string;
  type: 'number' | 'select';
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

export interface CalculationResult {
  value: number;
  unit: string;
  formula: string;
  steps: string[];
  explanation: string;
}

export interface PhysicsConstants {
  [key: string]: {
    value: number;
    unit: string;
    description: string;
  };
}

export const PHYSICS_CONSTANTS: PhysicsConstants = {
  g: { value: 9.81, unit: 'm/s²', description: 'تسارع الجاذبية الأرضية' },
  c: { value: 299792458, unit: 'm/s', description: 'سرعة الضوء في الفراغ' },
  h: { value: 6.626e-34, unit: 'J⋅s', description: 'ثابت بلانك' },
  k: { value: 8.99e9, unit: 'N⋅m²/C²', description: 'ثابت كولوم' },
  G: { value: 6.674e-11, unit: 'm³/kg⋅s²', description: 'ثابت الجاذبية العام' },
  R: { value: 8.314, unit: 'J/mol⋅K', description: 'ثابت الغازات العام' },
  Na: { value: 6.022e23, unit: '1/mol', description: 'عدد أفوجادرو' },
  e: { value: 1.602e-19, unit: 'C', description: 'شحنة الإلكترون' },
  me: { value: 9.109e-31, unit: 'kg', description: 'كتلة الإلكترون' },
  mp: { value: 1.673e-27, unit: 'kg', description: 'كتلة البروتون' }
};
