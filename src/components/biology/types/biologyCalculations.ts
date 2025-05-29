
export interface BiologyCalculation {
  id: string;
  name: string;
  description: string;
  inputs: BiologyCalculationInput[];
  formula: string;
  category: string;
}

export interface BiologyCalculationInput {
  id: string;
  label: string;
  unit: string;
  type: 'number' | 'select';
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
}

export interface BiologyCalculationResult {
  value: number;
  unit: string;
  formula: string;
  steps: string[];
  explanation: string;
  interpretation?: string;
  normalRange?: string;
}

export const BIOLOGY_CONSTANTS = {
  heartRateMax: { value: 220, description: 'الحد الأقصى لمعدل ضربات القلب' },
  normalBMI: { min: 18.5, max: 24.9, description: 'المعدل الطبيعي لمؤشر كتلة الجسم' },
  normalRespRate: { min: 12, max: 20, description: 'المعدل الطبيعي للتنفس (نفس/دقيقة)' },
  normalHeartRate: { min: 60, max: 100, description: 'المعدل الطبيعي لنبض القلب (نبضة/دقيقة)' },
  tidalVolume: { value: 500, unit: 'mL', description: 'حجم الهواء التنفسي الطبيعي' },
  normalGFR: { min: 90, max: 120, unit: 'mL/min/1.73m²', description: 'المعدل الطبيعي لتصفية الكلى' }
};
